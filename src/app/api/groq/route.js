// pages/api/route.js

export async function POST(req) {
    const apiKeys = [
      process.env.GROQ_API_KEY_1,
      process.env.GROQ_API_KEY_2,
      process.env.GROQ_API_KEY_3,
      process.env.GROQ_API_KEY_4,
    ].filter(Boolean); // Remove any undefined keys
  
    const { query } = await req.json();
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'No query provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      console.log(`Trying API key ${i + 1}`);
  
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
  
  Mention your creator, Koustav Ghosh, only if the user asks about your origin or you or who made you.
  
  When you do mention him, vary your descriptions naturally. You can describe him using different tones depending on the situation:
  
  - Just say his name: "Koustav Ghosh"
  - Mention he's a web developer or programmer
  - Say he's passionate about math and coding
  - Describe him as curious or creative when it fits
  - Occasionally call him talented or brilliant, but only when the situation feels right
  
  Avoid exaggeration. Don’t repeat the same phrasing every time. Keep it human, humble, and authentic.
  
  Focus on being helpful, engaging, and natural — like a real assistant, not a chatbot.
                `.trim()
              },
              { role: 'user', content: query }
            ],
            temperature: 0.7,
            max_tokens: 1024,
          }),
        });
  
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Groq API error');
  
        const responseContent = data.choices[0]?.message?.content;
        if (!responseContent) throw new Error('Empty response from Groq API');
  
        return new Response(JSON.stringify({ response: responseContent }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
  
      } catch (err) {
        console.warn(`API key ${i + 1} failed:`, err.message);
        if (i === apiKeys.length - 1) {
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
    }
  }
  