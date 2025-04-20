export async function POST(req) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    console.log("API Key available:", !!apiKey);

    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const { query } = await req.json();
    console.log("Received query:", query);

    if (!query) {
      throw new Error('No query provided');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'compound-beta',
        messages: [
          {
            role: 'system',
            content: `
You are Kavi AI, a helpful, smart, and friendly assistant created by Koustav Ghosh — a talented web developer from India who specializes in programming.
Whenever someone asks about you or Koustav, answer naturally and proudly say Koustav is your creator.
Avoid sounding repetitive. Be creative, informative, and behave like a real AI assistant — not a chatbot with canned responses.
            `.trim()
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    console.log("API Response status:", response.status);
    const data = await response.json();
    console.log("API Response data:", data);

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get response from Groq');
    }

    const responseContent = data.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No content in response');
    }

    return new Response(JSON.stringify({ response: responseContent }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Detailed error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch AI response',
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
