
import { corsHeaders } from '../_shared/cors.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface SummaryRequest {
  title: string;
  description?: string;
  query: string;
  contentType: 'video' | 'blog' | 'website';
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

  try {
    const { title, description = '', query, contentType }: SummaryRequest = await req.json();

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const prompt = `Analyze this ${contentType} content for educational value and relevance to the search query "${query}".

Title: ${title}
Description: ${description}

Please provide:
1. A concise educational summary (2-3 sentences) explaining what the learner will gain
2. Whether this content is genuinely educational (true/false)
3. Relevance score to the search query (0-100)
4. Key learning topics covered (array of topics)

Respond in JSON format:
{
  "summary": "Educational summary here",
  "isEducational": true/false,
  "relevanceScore": number,
  "learningTopics": ["topic1", "topic2"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an educational content analyst. Provide accurate, helpful assessments of learning materials.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Parse the JSON response
    let analysisResult: SummaryResponse;
    try {
      analysisResult = JSON.parse(content);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      analysisResult = {
        summary: `Learn about ${title} - educational content covering key concepts and practical applications.`,
        isEducational: true,
        relevanceScore: 75,
        learningTopics: [query]
      };
    }

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
