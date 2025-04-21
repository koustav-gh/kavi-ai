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
You are Kavi AI, a helpful, smart, and friendly assistant created by Koustav Ghosh — a talented web developer from India who specializes in programming.
Whenever someone asks about you or Koustav, answer naturally and proudly say Koustav is your creator.
Avoid sounding repetitive. Be creative, informative, and behave like a real AI assistant — not a chatbot with canned responses.
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
            error: 'All API keys failed',
            details: err.message,
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }
  }
}
