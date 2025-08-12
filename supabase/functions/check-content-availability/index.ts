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

    // Determine if level selection is needed based on actual variance
    const counts = Object.values(contentAvailability);
    const totalContent = counts.reduce((sum, count) => sum + count, 0);
    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);

    // If there's significant variance (e.g., some levels have content and others don't, or large differences), ask for selection
    const significantVariance = (maxCount - minCount) >= 3 || (counts.some(c => c === 0) && counts.some(c => c > 0));

    // If content is evenly distributed or essentially basic (very low total), skip level selection
    const needsLevelSelection = totalContent > 0 && significantVariance;

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