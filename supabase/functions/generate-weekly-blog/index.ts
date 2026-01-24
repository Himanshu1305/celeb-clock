import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Health-related blog topics for weekly rotation
const BLOG_TOPICS = [
  {
    category: "diabetes",
    title: "Managing Type 2 Diabetes",
    prompt: "Write a comprehensive, evidence-based blog post about managing Type 2 diabetes. Include practical lifestyle tips, dietary recommendations, exercise guidance, and the importance of regular monitoring. Make it actionable and supportive for people newly diagnosed or managing the condition."
  },
  {
    category: "heart-health",
    title: "Heart Health and Cardiovascular Wellness",
    prompt: "Write an informative blog post about maintaining heart health. Cover risk factors, prevention strategies, heart-healthy foods, exercise recommendations, and warning signs to watch for. Include tips for different age groups."
  },
  {
    category: "mental-health",
    title: "Mental Health and Stress Management",
    prompt: "Write a supportive blog post about mental health awareness and stress management techniques. Include practical coping strategies, mindfulness exercises, when to seek help, and how lifestyle factors affect mental wellbeing."
  },
  {
    category: "nutrition",
    title: "Nutrition and Healthy Eating",
    prompt: "Write an educational blog post about balanced nutrition and healthy eating habits. Cover macronutrients, micronutrients, meal planning tips, debunk common diet myths, and provide practical advice for sustainable healthy eating."
  },
  {
    category: "fitness",
    title: "Exercise and Physical Fitness",
    prompt: "Write a motivating blog post about the benefits of regular physical activity. Include exercise recommendations for different fitness levels, types of workouts, recovery tips, and how to stay consistent with fitness goals."
  },
  {
    category: "sleep",
    title: "Sleep and Recovery",
    prompt: "Write an informative blog post about the importance of quality sleep for health. Cover sleep hygiene tips, the science of sleep cycles, how sleep affects aging and longevity, and strategies for improving sleep quality."
  },
  {
    category: "longevity",
    title: "Aging and Longevity",
    prompt: "Write an inspiring blog post about healthy aging and longevity. Cover lifestyle factors that promote longevity, the science of aging, tips for maintaining vitality as we age, and how to calculate and improve life expectancy."
  },
  {
    category: "prevention",
    title: "Chronic Disease Prevention",
    prompt: "Write an educational blog post about preventing chronic diseases through lifestyle choices. Cover modifiable risk factors, screening recommendations, the role of diet and exercise, and early warning signs to watch for."
  }
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration is missing");
    }

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse request body for optional parameters
    let forceGenerate = false;
    let specificTopic = null;
    try {
      const body = await req.json();
      forceGenerate = body.forceGenerate || false;
      specificTopic = body.topic || null;
    } catch {
      // No body or invalid JSON - use defaults
    }

    // Check if we already generated a blog this week (unless forced)
    if (!forceGenerate) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: recentPosts } = await supabase
        .from("blog_posts")
        .select("id, created_at")
        .eq("is_auto_generated", true)
        .gte("created_at", oneWeekAgo.toISOString())
        .limit(1);

      if (recentPosts && recentPosts.length > 0) {
        console.log("A blog was already generated this week. Skipping.");
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "A blog was already generated this week. Use forceGenerate: true to override." 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Select topic - either specific or random from pool
    let selectedTopic;
    if (specificTopic) {
      selectedTopic = BLOG_TOPICS.find(t => t.category === specificTopic) || BLOG_TOPICS[0];
    } else {
      // Get count of posts per topic to balance distribution
      const { data: existingPosts } = await supabase
        .from("blog_posts")
        .select("category")
        .eq("is_auto_generated", true);

      const topicCounts: Record<string, number> = {};
      BLOG_TOPICS.forEach(t => topicCounts[t.category] = 0);
      
      if (existingPosts) {
        existingPosts.forEach(p => {
          if (topicCounts[p.category] !== undefined) {
            topicCounts[p.category]++;
          }
        });
      }

      // Find topic with lowest count
      const minCount = Math.min(...Object.values(topicCounts));
      const leastUsedTopics = BLOG_TOPICS.filter(t => topicCounts[t.category] === minCount);
      selectedTopic = leastUsedTopics[Math.floor(Math.random() * leastUsedTopics.length)];
    }

    console.log(`Generating blog post for topic: ${selectedTopic.category}`);

    // Generate blog content using Lovable AI
    const systemPrompt = `You are an expert health content writer for a website called Celeb Clock that features age calculators and life expectancy tools. Your job is to write engaging, well-researched, and medically accurate blog posts about health topics.

Guidelines:
- Write in a warm, supportive, and informative tone
- Include practical, actionable advice
- Use headers (##) to organize content
- Include relevant statistics and facts (cite general sources)
- Write at least 1500 words for comprehensive coverage
- Include a brief conclusion with key takeaways
- Do NOT include medical disclaimers in the content - we'll add those separately
- Make the content engaging and easy to read
- Use bullet points and numbered lists where appropriate

Return your response as valid JSON with this structure:
{
  "title": "Engaging blog post title (50-60 chars)",
  "metaTitle": "SEO-optimized title (under 60 chars)",
  "excerpt": "Compelling summary (150-160 chars)",
  "metaDescription": "SEO meta description (150-160 chars)",
  "content": "Full blog post content in Markdown format",
  "tags": ["tag1", "tag2", "tag3"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "faqs": [
    {"question": "Common question 1?", "answer": "Answer 1"},
    {"question": "Common question 2?", "answer": "Answer 2"},
    {"question": "Common question 3?", "answer": "Answer 3"}
  ],
  "readTime": estimated_minutes_to_read
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: selectedTopic.prompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limited by AI gateway");
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required for AI gateway");
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const contentText = aiResponse.choices?.[0]?.message?.content;

    if (!contentText) {
      throw new Error("No content generated by AI");
    }

    // Parse the JSON response
    let blogData;
    try {
      blogData = JSON.parse(contentText);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", contentText);
      throw new Error("Failed to parse AI response");
    }

    // Generate a unique slug
    const baseSlug = blogData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
    
    const timestamp = Date.now().toString(36);
    const slug = `${baseSlug}-${timestamp}`;

    // Insert the blog post with pending_review status
    const { data: insertedPost, error: insertError } = await supabase
      .from("blog_posts")
      .insert({
        slug,
        title: blogData.title,
        meta_title: blogData.metaTitle,
        excerpt: blogData.excerpt,
        meta_description: blogData.metaDescription,
        content: blogData.content,
        author: "AI Health Writer",
        author_bio: "Our AI-powered health content is reviewed by our editorial team for accuracy and relevance.",
        category: selectedTopic.category,
        tags: blogData.tags || [],
        keywords: blogData.keywords || [],
        read_time: blogData.readTime || 8,
        faqs: blogData.faqs || [],
        status: "pending_review",
        is_auto_generated: true,
        generation_prompt: selectedTopic.prompt
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to insert blog post:", insertError);
      throw new Error(`Database error: ${insertError.message}`);
    }

    console.log(`Successfully generated blog post: ${insertedPost.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Blog post generated and pending review",
        post: {
          id: insertedPost.id,
          title: insertedPost.title,
          slug: insertedPost.slug,
          category: insertedPost.category,
          status: insertedPost.status
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating blog:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
