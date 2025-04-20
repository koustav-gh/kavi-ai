export async function POST(req) {
  try {
    // Fetch the API key from environment variables
    const apiKey = process.env.GROQ_API_KEY;
    console.log("API Key available:", !!apiKey);

    // If the API key is missing, throw an error
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    // Parse the incoming request's JSON body
    const { query } = await req.json();
    console.log("Received query:", query);

    // If no query is provided, throw an error
    if (!query) {
      throw new Error('No query provided');
    }

    // Make the request to Groq's API
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
            role: 'user',
            content: query,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    console.log("API Response status:", response.status);
    const data = await response.json();
    console.log("API Response data:", data);

    // Handle errors from the Groq API response
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get response from Groq');
    }

    // Extract and return the response content
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
    // Log the detailed error for debugging purposes
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
