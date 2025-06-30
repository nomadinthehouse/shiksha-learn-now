
import { corsHeaders } from '../_shared/cors.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

interface ChatRequest {
  message: string;
  context?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('AI Chat function called');

  try {
    const { message, context }: ChatRequest = await req.json();

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

    const systemPrompt = `You are an educational AI assistant. Help users understand topics they're learning about in a structured, interactive way.
    ${context ? `The user is currently learning about: ${context}` : ''}
    
    IMPORTANT GUIDELINES:
    - Provide clear, concise explanations in a structured format
    - Break down complex topics into digestible parts
    - Use numbered lists, bullet points, or step-by-step explanations
    - Ask follow-up questions to keep the conversation interactive
    - Focus only on what the user asked - don't overwhelm with too much information at once
    - Encourage deeper learning by suggesting related questions they might want to explore
    - Keep responses focused and relevant to their specific question`;

    console.log('Calling Gemini API for chat response');

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
                text: `${systemPrompt}\n\nUser question: ${message}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
        }
      }),
    });

    if (!response.ok) {
      console.error(`Gemini API error: ${response.status}`);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      console.error('No response received from Gemini');
      throw new Error('No response received from Gemini');
    }

    console.log('Chat response generated successfully');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('AI Chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get AI response' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
