import { corsHeaders } from '../_shared/cors.ts'

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

interface CheckContentRequest {
  query: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query }: CheckContentRequest = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Checking content availability for: "${query}"`);

    const levels = ['beginner', 'intermediate', 'advanced'];
    const levelKeywords = {
      beginner: 'basics fundamentals introduction tutorial getting started',
      intermediate: 'practical examples implementation hands-on intermediate',
      advanced: 'advanced expert professional in-depth comprehensive'
    };

    const contentAvailability = {
      beginner: 0,
      intermediate: 0,
      advanced: 0
    };

    // Check content availability for each level
    if (YOUTUBE_API_KEY) {
      for (const level of levels) {
        try {
          const enhancedQuery = `${query} ${levelKeywords[level as keyof typeof levelKeywords]}`;
          const youtubeResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(enhancedQuery)}&type=video&maxResults=5&order=relevance&key=${YOUTUBE_API_KEY}`
          );
          
          if (youtubeResponse.ok) {
            const youtubeData = await youtubeResponse.json();
            contentAvailability[level as keyof typeof contentAvailability] = youtubeData.items?.length || 0;
          }
        } catch (error) {
          console.error(`Error checking ${level} content:`, error);
        }
      }
    }

    // Add mock content to ensure we always have some results
    contentAvailability.beginner += 2; // Mock websites and blogs
    contentAvailability.intermediate += 2;
    contentAvailability.advanced += 2;

    console.log('Content availability:', contentAvailability);

    // Determine if level selection is needed
    const totalContent = Object.values(contentAvailability).reduce((sum, count) => sum + count, 0);
    const hasVariedContent = Object.values(contentAvailability).some(count => count > 0) && 
                            Object.values(contentAvailability).some(count => count === 0) ||
                            Math.max(...Object.values(contentAvailability)) - Math.min(...Object.values(contentAvailability)) > 2;

    // If content is similar across levels or very basic topic, skip level selection
    const needsLevelSelection = totalContent > 6 && hasVariedContent;

    return new Response(
      JSON.stringify({
        needsLevelSelection,
        contentAvailability,
        defaultLevel: contentAvailability.beginner > 0 ? 'beginner' : 
                     contentAvailability.intermediate > 0 ? 'intermediate' : 'advanced'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Content availability check error:', error);
    return new Response(
      JSON.stringify({ error: 'Content availability check failed', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});