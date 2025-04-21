// pages/api/route.js

export async function POST(req) {
  const apiKey = process.env.GROQ_API_KEY;  // Single API key, no array needed

  const { query } = await req.json();
  if (!query) {
    return new Response(
      JSON.stringify({ error: 'No query provided' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'compound-beta',
        messages: [
          {
            role: 'system',
            content: `
You are Kavi AI, a smart, helpful, and friendly assistant with a warm personality. You are Kavi AI, made by Koustav.

Mention your creator, Koustav Ghosh, only if the user asks about your origin or who made you.

When you do mention him, vary your descriptions naturally. For example:
- Just say: "Koustav Ghosh"
- Mention he's a web developer or a programmer
- Say he's passionate about math and coding
- Describe him as curious or creative when the context fits
- Occasionally call him talented or brilliant, but only when it feels appropriate

Avoid exaggeration. Don’t repeat the same phrasing every time. Be human, humble, and authentic.

Always focus on being helpful, engaging, and natural — like a real assistant, not a robotic chatbot.
            `.trim()
          },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      // Check for rate limit or any specific errors from the Groq API
      if (data.error?.message?.includes('rate limit')) {
        return new Response(
          JSON.stringify({
            error: 'Our servers are currently handling a high volume of requests. Please try again after some time or upgrade to the Pro Plan to enjoy uninterrupted access to Kavi AI.',
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      throw new Error(data.error?.message || 'Groq API error');
    }

    const responseContent = data.choices[0]?.message?.content;
    if (!responseContent) throw new Error('Empty response from Groq API');

    return new Response(JSON.stringify({ response: responseContent }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.warn('API request failed:', err.message);
    return new Response(
      JSON.stringify({
        error: 'Our servers are currently handling a high volume of requests. Please try again after some time or upgrade to the Pro Plan to enjoy uninterrupted access to Kavi AI.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
