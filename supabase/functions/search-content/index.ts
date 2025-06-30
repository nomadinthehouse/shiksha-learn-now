
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface SearchRequest {
  query: string;
}

interface ContentItem {
  title: string;
  url: string;
  content_type: 'video' | 'blog' | 'website';
  summary?: string;
  thumbnail_url?: string;
  author?: string;
  duration?: string;
  publish_date?: string;
  source: string;
  metadata?: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query }: SearchRequest = await req.json();
    
    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Searching for: ${query}`);

    // Check cache first
    const cacheResults = await checkCache(query);
    if (cacheResults) {
      console.log('Returning cached results');
      return new Response(
        JSON.stringify(cacheResults),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch content from multiple sources concurrently
    const [videos, blogs, websites] = await Promise.allSettled([
      fetchYouTubeVideos(query),
      fetchBlogArticles(query),
      fetchWebsiteContent(query)
    ]);

    const results = {
      videos: videos.status === 'fulfilled' ? videos.value : [],
      blogs: blogs.status === 'fulfilled' ? blogs.value : [],
      websites: websites.status === 'fulfilled' ? websites.value : []
    };

    // Cache the results
    await cacheResults(query, results);

    console.log(`Found ${results.videos.length} videos, ${results.blogs.length} blogs, ${results.websites.length} websites`);

    return new Response(
      JSON.stringify(results),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function checkCache(query: string) {
  try {
    const { data, error } = await supabase
      .from('search_cache')
      .select('results')
      .eq('query', query.toLowerCase())
      .gt('expires_at', 'now()')
      .single();

    if (error || !data) {
      return null;
    }

    return data.results;
  } catch (error) {
    console.error('Cache check error:', error);
    return null;
  }
}

async function cacheResults(query: string, results: any) {
  try {
    await supabase
      .from('search_cache')
      .insert({
        query: query.toLowerCase(),
        content_type: 'mixed',
        results: results
      });
  } catch (error) {
    console.error('Cache insert error:', error);
  }
}

async function fetchYouTubeVideos(query: string): Promise<ContentItem[]> {
  const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
  
  if (!youtubeApiKey) {
    console.log('YouTube API key not found, returning mock data');
    return getMockVideos(query);
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=6&key=${youtubeApiKey}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.items?.map((item: any) => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      content_type: 'video' as const,
      thumbnail_url: item.snippet.thumbnails?.medium?.url,
      author: item.snippet.channelTitle,
      source: 'YouTube',
      publish_date: item.snippet.publishedAt,
      metadata: {
        videoId: item.id.videoId,
        channelId: item.snippet.channelId
      }
    })) || [];

  } catch (error) {
    console.error('YouTube fetch error:', error);
    return getMockVideos(query);
  }
}

async function fetchBlogArticles(query: string): Promise<ContentItem[]> {
  // For now, return mock data. In production, you'd integrate with blog APIs or web scraping
  return getMockBlogs(query);
}

async function fetchWebsiteContent(query: string): Promise<ContentItem[]> {
  // For now, return mock data. In production, you'd integrate with educational website APIs
  return getMockWebsites(query);
}

function getMockVideos(query: string): ContentItem[] {
  return [
    {
      title: `Complete Guide to ${query}`,
      url: `https://youtube.com/watch?v=mock1`,
      content_type: 'video',
      summary: `A comprehensive overview of ${query} concepts and practical applications. Perfect for beginners starting their learning journey.`,
      thumbnail_url: '/placeholder.svg',
      author: 'Education Pro',
      duration: '15:32',
      source: 'YouTube'
    },
    {
      title: `${query} Tutorial for Beginners`,
      url: `https://youtube.com/watch?v=mock2`,
      content_type: 'video',
      summary: `Learn ${query} from scratch with step-by-step instructions and real-world examples.`,
      thumbnail_url: '/placeholder.svg',
      author: 'Learning Academy',
      duration: '22:45',
      source: 'YouTube'
    }
  ];
}

function getMockBlogs(query: string): ContentItem[] {
  return [
    {
      title: `Understanding ${query}: A Beginner's Guide`,
      url: `https://example.com/blog/${query.toLowerCase().replace(/\s+/g, '-')}`,
      content_type: 'blog',
      summary: `A detailed explanation of ${query} fundamentals and real-world applications.`,
      author: 'Dr. Sarah Johnson',
      source: 'Education Blog',
      publish_date: '2024-01-15',
      metadata: { readTime: '8 min read' }
    }
  ];
}

function getMockWebsites(query: string): ContentItem[] {
  return [
    {
      title: `MIT OpenCourseWare: ${query}`,
      url: `https://ocw.mit.edu/courses/${query.toLowerCase().replace(/\s+/g, '-')}`,
      content_type: 'website',
      summary: `Free online course materials from MIT covering ${query} concepts and problem-solving techniques.`,
      author: 'MIT',
      source: 'MIT OCW',
      metadata: { type: 'Course' }
    }
  ];
}
