
import { corsHeaders } from '../_shared/cors.ts'

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

interface SearchRequest {
  query: string;
  userId?: string;
  learningLevel?: 'beginner' | 'intermediate' | 'advanced';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Search content function called');

  try {
    const { query, userId, learningLevel = 'beginner' }: SearchRequest = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Searching for: "${query}" at ${learningLevel} level`);

    // Enhanced search query based on learning level
    const levelKeywords = {
      beginner: 'basics fundamentals introduction tutorial getting started',
      intermediate: 'practical examples implementation hands-on intermediate',
      advanced: 'advanced expert professional in-depth comprehensive'
    };

    const enhancedQuery = `${query} ${levelKeywords[learningLevel]}`;

    // Search YouTube videos
    let videos = [];
    if (YOUTUBE_API_KEY) {
      try {
        console.log('Searching YouTube videos...');
        const youtubeResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(enhancedQuery)}&type=video&maxResults=15&order=relevance&videoDuration=medium&key=${YOUTUBE_API_KEY}`
        );
        
        if (youtubeResponse.ok) {
          const youtubeData = await youtubeResponse.json();
          console.log(`Found ${youtubeData.items?.length || 0} YouTube videos`);

          // Get video details for duration filtering
          const videoIds = youtubeData.items?.map((item: any) => item.id.videoId).join(',');
          if (videoIds) {
            const detailsResponse = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
            );
            
            const detailsData = await detailsResponse.json();
            const videoDetails = new Map();
            detailsData.items?.forEach((item: any) => {
              videoDetails.set(item.id, {
                duration: item.contentDetails.duration,
                viewCount: parseInt(item.statistics.viewCount || '0')
              });
            });

            for (const item of youtubeData.items || []) {
              const details = videoDetails.get(item.id.videoId);
              const duration = parseDuration(details?.duration || 'PT0S');
              
              // Filter based on learning level and duration
              const minDuration = learningLevel === 'beginner' ? 300 : learningLevel === 'intermediate' ? 600 : 900; // 5, 10, 15 minutes
              
              if (duration >= minDuration && duration <= 3600) { // Max 1 hour
                try {
                  console.log(`Processing video: ${item.snippet.title}`);
                  const summaryResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-summary`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
                    },
                    body: JSON.stringify({
                      title: item.snippet.title,
                      description: item.snippet.description,
                      query: enhancedQuery,
                      contentType: 'video',
                      duration: formatDuration(duration),
                      learningLevel
                    })
                  });

                  if (summaryResponse.ok) {
                    const summary = await summaryResponse.json();
                    
                    // Apply stricter filtering based on learning level
                    const minScore = learningLevel === 'beginner' ? 60 : learningLevel === 'intermediate' ? 65 : 70;
                    
                    if (summary.isEducational && summary.relevanceScore >= minScore) {
                      videos.push({
                        title: item.snippet.title,
                        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                        author: item.snippet.channelTitle,
                        duration: formatDuration(duration),
                        summary: summary.summary,
                        relevanceScore: summary.relevanceScore,
                        learningTopics: summary.learningTopics,
                        source: 'YouTube',
                        content_type: 'video',
                        metadata: {
                          videoId: item.id.videoId,
                          viewCount: details?.viewCount || 0,
                          learningLevel
                        }
                      });
                    }
                  }
                } catch (error) {
                  console.error('Error processing video:', error);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('YouTube API error:', error);
      }
    }

    // Mock websites data with level-appropriate content
    const websites = [
      {
        title: learningLevel === 'beginner' ? `${query} - Complete Beginner's Guide` : 
               learningLevel === 'intermediate' ? `${query} - Practical Implementation Guide` :
               `${query} - Advanced Concepts and Best Practices`,
        url: `https://example.com/${query.toLowerCase().replace(/\s+/g, '-')}-${learningLevel}`,
        author: 'Educational Platform',
        summary: learningLevel === 'beginner' ? 
                `Start your ${query} journey with this comprehensive beginner's guide covering all the fundamentals you need to know.` :
                learningLevel === 'intermediate' ?
                `Build upon your ${query} knowledge with practical examples and real-world implementations.` :
                `Master advanced ${query} concepts with in-depth analysis and professional techniques.`,
        relevanceScore: learningLevel === 'beginner' ? 85 : learningLevel === 'intermediate' ? 88 : 92,
        learningTopics: learningLevel === 'beginner' ? 
                       [`${query} basics`, 'fundamentals', 'getting started'] :
                       learningLevel === 'intermediate' ?
                       [`${query} implementation`, 'practical examples', 'hands-on'] :
                       [`advanced ${query}`, 'expert techniques', 'best practices'],
        source: 'Educational Site',
        content_type: 'website',
        metadata: { 
          readTime: learningLevel === 'beginner' ? '15 min read' : 
                   learningLevel === 'intermediate' ? '25 min read' : '35 min read',
          learningLevel 
        }
      }
    ];

    // Mock blogs data
    const blogs = [
      {
        title: `Understanding ${query}: A ${learningLevel.charAt(0).toUpperCase() + learningLevel.slice(1)}'s Perspective`,
        url: `https://blog.example.com/${query.toLowerCase().replace(/\s+/g, '-')}-${learningLevel}`,
        author: 'Tech Writer',
        summary: `Dive deep into ${query} with this detailed ${learningLevel}-level analysis covering key concepts and practical applications.`,
        relevanceScore: learningLevel === 'beginner' ? 80 : learningLevel === 'intermediate' ? 85 : 90,
        learningTopics: [`${query}`, `${learningLevel} level`, 'tutorial'],
        source: 'Tech Blog',
        content_type: 'blog',
        metadata: { 
          readTime: '20 min read',
          learningLevel 
        }
      }
    ];

    console.log(`Returning ${videos.length} videos, ${websites.length} websites, ${blogs.length} blogs`);

    return new Response(
      JSON.stringify({
        videos: videos.sort((a, b) => b.relevanceScore - a.relevanceScore),
        websites,
        blogs,
        totalResults: videos.length + websites.length + blogs.length,
        learningLevel
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({ error: 'Search failed', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
