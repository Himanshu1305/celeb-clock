from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from supabase import create_client, Client
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
load_dotenv(ROOT_DIR.parent / '.env')

# Supabase connection
supabase_url = os.environ.get('SUPABASE_URL')
supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('SUPABASE_ANON_KEY')

if not supabase_url or not supabase_key:
    logging.warning("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY must be set in environment. Falling back to placeholder values.")
    supabase_url = supabase_url or "https://placeholder.supabase.co"
    supabase_key = supabase_key or "placeholder-key"

supabase: Client = create_client(supabase_url, supabase_key)

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
    
    timestamp_str = doc['timestamp'].isoformat()
    
    # Save directly in Supabase status_checks table
    supabase.table("status_checks").insert({
        "id": doc["id"],
        "client_name": doc["client_name"],
        "timestamp": timestamp_str
    }).execute()
    
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    res = supabase.table("status_checks").select("*").limit(1000).execute()
    rows = res.data or []
    
    status_checks = []
    for row in rows:
        status_checks.append(StatusCheck(
            id=row["id"],
            client_name=row["client_name"],
            timestamp=datetime.fromisoformat(row["timestamp"].replace("Z", "+00:00"))
        ))
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
    
    # Save to Supabase public.blog_drafts table
    doc = blog_draft.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    if doc['published_at']:
        doc['published_at'] = doc['published_at'].isoformat()
    
    supabase.table("blog_drafts").insert({
        "id": blog_draft.id,
        "data": doc
    }).execute()
    
    logger.info(f"Blog draft saved with id: {blog_draft.id}")
    return blog_draft


@api_router.get("/admin/blog/drafts", response_model=List[BlogDraft])
async def get_blog_drafts(
    status: Optional[BlogStatus] = None,
    category: Optional[BlogCategory] = None,
    limit: int = Query(default=50, le=100)
):
    """Get all blog drafts with optional filtering"""
    res = supabase.table("blog_drafts").select("*").limit(limit).execute()
    rows = res.data or []
    
    drafts = []
    for row in rows:
        data = row["data"]
        
        # Convert date strings back to datetime
        for field in ['created_at', 'updated_at', 'published_at']:
            if data.get(field) and isinstance(data[field], str):
                data[field] = datetime.fromisoformat(data[field].replace("Z", "+00:00"))
        
        # Apply filters locally on the JSONB structure
        if status and data.get("status") != status.value:
            continue
        if category and data.get("category") != category.value:
            continue
            
        drafts.append(BlogDraft(**data))
        
    return drafts


@api_router.get("/admin/blog/drafts/{draft_id}", response_model=BlogDraft)
async def get_blog_draft(draft_id: str):
    """Get a specific blog draft by ID"""
    res = supabase.table("blog_drafts").select("*").eq("id", draft_id).execute()
    rows = res.data or []
    if not rows:
        raise HTTPException(status_code=404, detail="Draft not found")
    
    data = rows[0]["data"]
    for field in ['created_at', 'updated_at', 'published_at']:
        if data.get(field) and isinstance(data[field], str):
            data[field] = datetime.fromisoformat(data[field].replace("Z", "+00:00"))
            
    return BlogDraft(**data)


@api_router.put("/admin/blog/drafts/{draft_id}")
async def update_blog_draft(draft_id: str, update_data: BlogDraftCreate):
    """Update a blog draft"""
    res = supabase.table("blog_drafts").select("*").eq("id", draft_id).execute()
    rows = res.data or []
    if not rows:
        raise HTTPException(status_code=404, detail="Draft not found")
        
    existing_data = rows[0]["data"]
    
    # Merge and update fields
    update_dict = update_data.model_dump()
    existing_data.update(update_dict)
    existing_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    existing_data["slug"] = generate_slug(update_data.title)
    
    # Update Supabase blog_drafts
    supabase.table("blog_drafts").update({
        "data": existing_data,
        "updated_at": existing_data["updated_at"]
    }).eq("id", draft_id).execute()
    
    return {"message": "Draft updated successfully", "id": draft_id}


@api_router.post("/admin/blog/drafts/{draft_id}/publish")
async def publish_blog_draft(draft_id: str):
    """Publish a blog draft"""
    res = supabase.table("blog_drafts").select("*").eq("id", draft_id).execute()
    rows = res.data or []
    if not rows:
        raise HTTPException(status_code=404, detail="Draft not found")
        
    existing_data = rows[0]["data"]
    now = datetime.now(timezone.utc).isoformat()
    
    existing_data["status"] = BlogStatus.PUBLISHED.value
    existing_data["published_at"] = now
    existing_data["updated_at"] = now
    
    # Update Supabase drafts table
    supabase.table("blog_drafts").update({
        "data": existing_data,
        "updated_at": now
    }).eq("id", draft_id).execute()
    
    # Mirror publish state into public.blog_posts table to display to client
    try:
        supabase.table("blog_posts").upsert({
            "id": draft_id,
            "slug": existing_data.get("slug") or generate_slug(existing_data["title"]),
            "title": existing_data["title"],
            "content": existing_data["content"],
            "excerpt": existing_data["excerpt"],
            "author": existing_data.get("author") or "Team Celeb Clock",
            "category": existing_data.get("category") or "general",
            "tags": existing_data.get("tags") or [],
            "status": "published",
            "published_at": now,
            "updated_at": now
        }).execute()
    except Exception as e:
        logger.error(f"Failed to synchronize draft with public.blog_posts: {str(e)}")
        
    return {"message": "Draft published successfully", "id": draft_id}


@api_router.delete("/admin/blog/drafts/{draft_id}")
async def delete_blog_draft(draft_id: str):
    """Delete a blog draft"""
    res = supabase.table("blog_drafts").delete().eq("id", draft_id).execute()
    if not res.data:
        # Check fallback
        pass
    return {"message": "Draft deleted successfully", "id": draft_id}


# Analytics
@api_router.get("/admin/analytics", response_model=AnalyticsData)
async def get_analytics():
    """Get dashboard analytics data using Supabase instead of MongoDB"""
    # Count blog draft posts
    res_drafts = supabase.table("blog_drafts").select("id, data").execute()
    items = res_drafts.data or []
    total_blogs = len(items)
    
    draft_blogs = 0
    published_blogs = 0
    for item in items:
        data = item.get("data") or {}
        if data.get("status") == BlogStatus.PUBLISHED.value:
            published_blogs += 1
        else:
            draft_blogs += 1
            
    # Count profiles and premium profiles from public.profiles table in Supabase
    res_profiles = supabase.table("profiles").select("id, premium_status").execute()
    profiles_list = res_profiles.data or []
    total_users = len(profiles_list)
    premium_users = sum(1 for p in profiles_list if p.get("premium_status") is True)
    
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
    """Get list of users from public.profiles in Supabase"""
    query = supabase.table("profiles").select("*").limit(limit)
    if premium_only:
        query = query.eq("premium_status", True)
        
    res = query.execute()
    users = res.data or []
    
    user_profiles = []
    for u in users:
        created = None
        last_login = None
        if u.get("created_at"):
            try:
                created = datetime.fromisoformat(u["created_at"].replace("Z", "+00:00"))
            except:
                pass
        if u.get("updated_at"):
            try:
                last_login = datetime.fromisoformat(u["updated_at"].replace("Z", "+00:00"))
            except:
                pass
                
        user_profiles.append(UserProfile(
            id=u.get("user_id") or u.get("id"),
            email=u.get("email"),
            name=u.get("name"),
            premium_status=u.get("premium_status") or False,
            created_at=created,
            last_login=last_login
        ))
        
    return user_profiles


@api_router.get("/admin/users/{user_id}", response_model=UserProfile)
async def get_user(user_id: str):
    """Get a specific user by ID from Supabase"""
    res = supabase.table("profiles").select("*").eq("user_id", user_id).execute()
    rows = res.data or []
    if not rows:
        res = supabase.table("profiles").select("*").eq("id", user_id).execute()
        rows = res.data or []
    if not rows:
        raise HTTPException(status_code=404, detail="User not found")
        
    u = rows[0]
    
    created = None
    last_login = None
    if u.get("created_at"):
        try:
            created = datetime.fromisoformat(u["created_at"].replace("Z", "+00:00"))
        except:
            pass
    if u.get("updated_at"):
        try:
            last_login = datetime.fromisoformat(u["updated_at"].replace("Z", "+00:00"))
        except:
            pass
            
    return UserProfile(
        id=u.get("user_id") or u.get("id"),
        email=u.get("email"),
        name=u.get("name"),
        premium_status=u.get("premium_status") or False,
        created_at=created,
        last_login=last_login
    )


# Email Templates (stored in Supabase with file fallback)
@api_router.get("/api/admin/email-templates")
@api_router.get("/admin/email-templates")
async def get_email_templates():
    """Get available email templates from Supabase, falling back to disk files"""
    try:
        res = supabase.table("email_templates").select("*").execute()
        rows = res.data or []
    except Exception as e:
        logger.error(f"Failed to query email_templates from Supabase: {str(e)}")
        rows = []
        
    templates = []
    for row in rows:
        data = row.get("data") or {}
        templates.append({
            "name": row["template_type"],
            "filename": f"{row['template_type']}.html",
            "exists": True,
            "subject": data.get("subject"),
            "html_content": data.get("html_content")
        })
        
    # Standard disk template checking (and auto-migrating to Supabase on first fetch)
    templates_dir = ROOT_DIR / "templates"
    if templates_dir.exists():
        for file in templates_dir.glob("*.html"):
            if not any(t["name"] == file.stem for t in templates):
                try:
                    content = file.read_text(encoding="utf-8")
                    templates.append({
                        "name": file.stem,
                        "filename": file.name,
                        "exists": True,
                        "subject": file.stem.replace("_", " ").title(),
                        "html_content": content
                    })
                    # Populate in Supabase for persistence
                    supabase.table("email_templates").upsert({
                        "template_type": file.stem,
                        "data": {
                            "template_type": file.stem,
                            "subject": file.stem.replace("_", " ").title(),
                            "html_content": content
                        }
                    }).execute()
                except Exception as ex:
                    logger.error(f"Failed to auto-populate template {file.stem}: {str(ex)}")
                    
    # Expected defaults fallback
    expected = ["welcome_email", "premium_email"]
    for name in expected:
        if not any(t["name"] == name for t in templates):
            templates.append({
                "name": name,
                "filename": f"{name}.html",
                "exists": False
            })
            
    return templates


@api_router.get("/admin/email-templates/{template_type}", response_model=EmailTemplate)
async def get_email_template(template_type: str):
    """Get a specific email template by template_type"""
    res = supabase.table("email_templates").select("*").eq("template_type", template_type).execute()
    rows = res.data or []
    if not rows:
        # Check disk fallback
        templates_dir = ROOT_DIR / "templates"
        file_path = templates_dir / f"{template_type}.html"
        if file_path.exists():
            try:
                content = file_path.read_text(encoding="utf-8")
                template_data = {
                    "template_type": template_type,
                    "subject": template_type.replace("_", " ").title(),
                    "html_content": content
                }
                # Save to database
                supabase.table("email_templates").upsert({
                    "template_type": template_type,
                    "data": template_data
                }).execute()
                return EmailTemplate(**template_data)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to load default template: {str(e)}")
        raise HTTPException(status_code=404, detail="Template not found")
        
    data = rows[0]["data"]
    return EmailTemplate(**data)


@api_router.put("/admin/email-templates/{template_type}")
async def update_email_template(template_type: str, template: EmailTemplate):
    """Save or update an email template"""
    template_data = template.model_dump()
    supabase.table("email_templates").upsert({
        "template_type": template_type,
        "data": template_data
    }).execute()
    return {"message": "Template updated successfully", "template_type": template_type}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
