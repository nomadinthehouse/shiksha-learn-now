
import { corsHeaders } from '../_shared/cors.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

interface SummaryRequest {
  title: string;
  description?: string;
  query: string;
  contentType: 'video' | 'blog' | 'website';
  duration?: string;
}

interface SummaryResponse {
  summary: string;
  isEducational: boolean;
  relevanceScore: number;
  learningTopics: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Generate summary function called');

  try {
    const { title, description = '', query, contentType, duration }: SummaryRequest = await req.json();

    if (!GEMINI_API_KEY) {
      console.error('Gemini API key not configured');
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let qualityNote = '';
    if (contentType === 'video' && duration) {
      const durationInSeconds = parseDurationToSeconds(duration);
      if (durationInSeconds < 120) {
        qualityNote = ' (Note: This is a very short video, consider if it provides sufficient educational depth)';
      } else if (durationInSeconds >= 300 && durationInSeconds <= 3600) {
        qualityNote = ' (Good duration for educational content)';
      }
    }

    const prompt = `Analyze this ${contentType} content for educational value and relevance to the search query "${query}".

Title: ${title}
Description: ${description}
${duration ? `Duration: ${duration}` : ''}${qualityNote}

Please provide:
1. A concise educational summary (2-3 sentences) explaining what the learner will gain
2. Whether this content is genuinely educational and valuable for learning (true/false)
3. Relevance score to the search query (0-100) - be strict, only high-quality educational content should score above 70
4. Key learning topics covered (array of topics)

For videos: Prefer content that is substantial enough for learning (typically 2+ minutes). Very short videos should generally score lower unless they are exceptionally valuable.

Respond in JSON format:
{
  "summary": "Educational summary here",
  "isEducational": true/false,
  "relevanceScore": number,
  "learningTopics": ["topic1", "topic2"]
}`;

    console.log('Calling Gemini API for content analysis');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an educational content analyst. Provide accurate, helpful assessments of learning materials. Be strict about educational quality - prioritize substantial, well-structured learning content.\n\n${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 300,
        }
      }),
    });

    if (!response.ok) {
      console.error(`Gemini API error: ${response.status}`);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error('No content received from Gemini');
      throw new Error('No content received from Gemini');
    }

    console.log('Gemini response received, parsing JSON');

    // Parse the JSON response
    let analysisResult: SummaryResponse;
    try {
      // Clean the response to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      analysisResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parsing failed, using fallback:', parseError);
      // Fallback if JSON parsing fails
      analysisResult = {
        summary: `Learn about ${title} - educational content covering key concepts and practical applications.`,
        isEducational: true,
        relevanceScore: 75,
        learningTopics: [query]
      };
    }

    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify(analysisResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Summary generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate summary',
        summary: 'Educational content available for learning.',
        isEducational: true,
        relevanceScore: 50,
        learningTopics: []
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function parseDurationToSeconds(duration: string): number {
  if (!duration) return 0;
  
  // Handle formats like "15:32" or "1:23:45"
  const parts = duration.split(':').map(part => parseInt(part));
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]; // minutes:seconds
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]; // hours:minutes:seconds
  }
  
  return 0;
}
