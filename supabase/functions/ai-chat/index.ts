
import { corsHeaders } from '../_shared/cors.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

interface ChatRequest {
  message: string;
  context?: string;
}

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const getRateLimitKey = (req: Request): string => {
  const authHeader = req.headers.get('Authorization');
  if (authHeader) {
    // Extract user ID from JWT token (simplified)
    return authHeader.split(' ')[1] || 'anonymous';
  }
  return 'anonymous';
};

const checkRateLimit = (key: string): boolean => {
  const now = Date.now();
  const limit = rateLimitStore.get(key);
  
  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }
  
  if (limit.count >= 10) { // 10 requests per minute
    return false;
  }
  
  limit.count++;
  return true;
};

const validateInput = (input: any): input is ChatRequest => {
  if (!input || typeof input !== 'object') return false;
  if (typeof input.message !== 'string') return false;
  if (input.message.length > 1000) return false;
  if (input.context && typeof input.context !== 'string') return false;
  return true;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('AI Chat function called');

  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(req);
    if (!checkRateLimit(rateLimitKey)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const requestBody = await req.json();
    
    if (!validateInput(requestBody)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { message, context }: ChatRequest = requestBody;

    if (!GEMINI_API_KEY) {
      console.error('Gemini API key not configured');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
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
    - Keep responses focused and relevant to their specific question
    - NEVER include HTML tags, scripts, or any executable code in your responses
    - Use only plain text with markdown-style formatting (**, *, etc.)`;

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
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
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

    // Additional sanitization on the server side
    const sanitizedResponse = aiResponse
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');

    console.log('Chat response generated successfully');

    return new Response(
      JSON.stringify({ response: sanitizedResponse }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block'
        }
      }
    );

  } catch (error) {
    console.error('AI Chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Service temporarily unavailable' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
