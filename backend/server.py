from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Celeb Clock API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============== MODELS ==============

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class BlogStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class BlogCategory(str, Enum):
    ZODIAC = "zodiac"
    HEALTH = "health"
    CELEBRITY = "celebrity"
    NUMEROLOGY = "numerology"
    GENERAL = "general"

class BlogDraft(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    content: str
    excerpt: str
    category: BlogCategory = BlogCategory.GENERAL
    tags: List[str] = []
    author: str = "Team Celeb Clock"
    status: BlogStatus = BlogStatus.DRAFT
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    published_at: Optional[datetime] = None

class BlogDraftCreate(BaseModel):
    title: str
    content: str
    excerpt: str
    category: BlogCategory = BlogCategory.GENERAL
    tags: List[str] = []

class BlogGenerateRequest(BaseModel):
    topic: str
    category: BlogCategory = BlogCategory.GENERAL
    tone: str = "informative and engaging"
    word_count: int = 800

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: Optional[str] = None
    premium_status: bool = False
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

class AnalyticsData(BaseModel):
    total_users: int = 0
    premium_users: int = 0
    total_blog_posts: int = 0
    draft_posts: int = 0
    published_posts: int = 0
    birthdays_decoded_today: int = 0

class EmailTemplate(BaseModel):
    template_type: str
    subject: str
    html_content: str


# ============== HELPER FUNCTIONS ==============

def generate_slug(title: str) -> str:
    """Generate a URL-friendly slug from title"""
    import re
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug.strip('-')


async def generate_blog_with_llm(topic: str, category: str, tone: str, word_count: int) -> dict:
    """Generate blog content using Emergent LLM Key with Claude"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")
        
        system_message = f"""You are an expert content writer for Celeb Clock, a birthday and astrology website. 
Write engaging, SEO-optimized blog articles about birthdays, zodiac signs, numerology, celebrity birthdays, and health topics.
Your tone should be {tone}. Write in markdown format with proper headers, lists, and formatting.
Include relevant facts and make the content actionable and shareable."""

        prompt = f"""Write a {word_count}-word blog article about: {topic}

Category: {category}

Requirements:
1. Start with an engaging introduction that hooks the reader
2. Use H2 (##) and H3 (###) headers to structure the content
3. Include bullet points and numbered lists where appropriate
4. Add interesting facts and statistics
5. End with a conclusion and call-to-action
6. Make it SEO-friendly with natural keyword usage

Return ONLY the article content in markdown format, no extra commentary."""

        chat = LlmChat(
            api_key=api_key,
            session_id=f"blog-gen-{uuid.uuid4()}",
            system_message=system_message
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        user_message = UserMessage(text=prompt)
        content = await chat.send_message(user_message)
        
        # Generate excerpt (first 150 chars of content, stripped of markdown)
        import re
        plain_text = re.sub(r'[#*_\[\]()]', '', content)
        excerpt = plain_text[:200].rsplit(' ', 1)[0] + "..."
        
        # Generate title from topic if needed
        title = topic.title() if len(topic) < 100 else topic[:100].rsplit(' ', 1)[0]
        
        return {
            "title": title,
            "content": content,
            "excerpt": excerpt,
            "slug": generate_slug(title)
        }
        
    except ImportError:
        logger.error("emergentintegrations not installed")
        raise HTTPException(status_code=500, detail="LLM integration not available")
    except Exception as e:
        logger.error(f"Error generating blog: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate blog: {str(e)}")


# ============== ROUTES ==============

# Health check routes
@api_router.get("/")
async def root():
    return {"message": "Celeb Clock API is running", "version": "1.0.0"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


# ============== ADMIN ROUTES ==============

# Blog Management
@api_router.post("/admin/blog/generate", response_model=BlogDraft)
async def generate_blog_draft(request: BlogGenerateRequest):
    """Generate a new blog draft using AI"""
    logger.info(f"Generating blog draft for topic: {request.topic}")
    
    generated = await generate_blog_with_llm(
        topic=request.topic,
        category=request.category.value,
        tone=request.tone,
        word_count=request.word_count
    )
    
    blog_draft = BlogDraft(
        title=generated["title"],
        slug=generated["slug"],
        content=generated["content"],
        excerpt=generated["excerpt"],
        category=request.category,
        tags=[request.category.value, "birthday", "astrology"]
    )
    
    # Save to database
    doc = blog_draft.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    if doc['published_at']:
        doc['published_at'] = doc['published_at'].isoformat()
    
    await db.blog_drafts.insert_one(doc)
    logger.info(f"Blog draft saved with id: {blog_draft.id}")
    
    return blog_draft


@api_router.get("/admin/blog/drafts", response_model=List[BlogDraft])
async def get_blog_drafts(
    status: Optional[BlogStatus] = None,
    category: Optional[BlogCategory] = None,
    limit: int = Query(default=50, le=100)
):
    """Get all blog drafts with optional filtering"""
    query = {}
    if status:
        query["status"] = status.value
    if category:
        query["category"] = category.value
    
    drafts = await db.blog_drafts.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    
    # Convert date strings back to datetime
    for draft in drafts:
        for field in ['created_at', 'updated_at', 'published_at']:
            if draft.get(field) and isinstance(draft[field], str):
                draft[field] = datetime.fromisoformat(draft[field])
    
    return drafts


@api_router.get("/admin/blog/drafts/{draft_id}", response_model=BlogDraft)
async def get_blog_draft(draft_id: str):
    """Get a specific blog draft by ID"""
    draft = await db.blog_drafts.find_one({"id": draft_id}, {"_id": 0})
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    
    for field in ['created_at', 'updated_at', 'published_at']:
        if draft.get(field) and isinstance(draft[field], str):
            draft[field] = datetime.fromisoformat(draft[field])
    
    return draft


@api_router.put("/admin/blog/drafts/{draft_id}")
async def update_blog_draft(draft_id: str, update_data: BlogDraftCreate):
    """Update a blog draft"""
    draft = await db.blog_drafts.find_one({"id": draft_id})
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    
    update_dict = update_data.model_dump()
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    update_dict["slug"] = generate_slug(update_data.title)
    
    await db.blog_drafts.update_one({"id": draft_id}, {"$set": update_dict})
    return {"message": "Draft updated successfully", "id": draft_id}


@api_router.post("/admin/blog/drafts/{draft_id}/publish")
async def publish_blog_draft(draft_id: str):
    """Publish a blog draft"""
    draft = await db.blog_drafts.find_one({"id": draft_id})
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    
    now = datetime.now(timezone.utc).isoformat()
    await db.blog_drafts.update_one(
        {"id": draft_id},
        {"$set": {
            "status": BlogStatus.PUBLISHED.value,
            "published_at": now,
            "updated_at": now
        }}
    )
    return {"message": "Draft published successfully", "id": draft_id}


@api_router.delete("/admin/blog/drafts/{draft_id}")
async def delete_blog_draft(draft_id: str):
    """Delete a blog draft"""
    result = await db.blog_drafts.delete_one({"id": draft_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Draft not found")
    return {"message": "Draft deleted successfully", "id": draft_id}


# Analytics
@api_router.get("/admin/analytics", response_model=AnalyticsData)
async def get_analytics():
    """Get dashboard analytics data"""
    # Count blog posts
    total_blogs = await db.blog_drafts.count_documents({})
    draft_blogs = await db.blog_drafts.count_documents({"status": BlogStatus.DRAFT.value})
    published_blogs = await db.blog_drafts.count_documents({"status": BlogStatus.PUBLISHED.value})
    
    # Get user counts from profiles collection (if exists)
    total_users = await db.profiles.count_documents({})
    premium_users = await db.profiles.count_documents({"premium_status": True})
    
    # Simulate birthdays decoded (in production, track this properly)
    import random
    birthdays_decoded = random.randint(10000, 15000)
    
    return AnalyticsData(
        total_users=total_users,
        premium_users=premium_users,
        total_blog_posts=total_blogs,
        draft_posts=draft_blogs,
        published_posts=published_blogs,
        birthdays_decoded_today=birthdays_decoded
    )


# User Management
@api_router.get("/admin/users", response_model=List[UserProfile])
async def get_users(
    premium_only: bool = False,
    limit: int = Query(default=50, le=200)
):
    """Get list of users"""
    query = {}
    if premium_only:
        query["premium_status"] = True
    
    users = await db.profiles.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    
    # Convert date strings
    for user in users:
        for field in ['created_at', 'last_login']:
            if user.get(field) and isinstance(user[field], str):
                try:
                    user[field] = datetime.fromisoformat(user[field])
                except:
                    user[field] = None
    
    return users


@api_router.get("/admin/users/{user_id}", response_model=UserProfile)
async def get_user(user_id: str):
    """Get a specific user by ID"""
    user = await db.profiles.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# Email Templates (stored as files, returned for preview)
@api_router.get("/admin/email-templates")
async def get_email_templates():
    """Get available email templates"""
    templates_dir = ROOT_DIR / "templates"
    templates = []
    
    if templates_dir.exists():
        for file in templates_dir.glob("*.html"):
            templates.append({
                "name": file.stem,
                "filename": file.name,
                "exists": True
            })
    
    # Always list expected templates
    expected = ["welcome_email", "premium_email"]
    for name in expected:
        if not any(t["name"] == name for t in templates):
            templates.append({
                "name": name,
                "filename": f"{name}.html",
                "exists": False
            })
    
    return templates


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
