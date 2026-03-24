export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY no configurada en Vercel' }), { status: 500 });
  }

  let prompt = '';
  try {
    const body = await req.json();
    prompt = body.prompt ?? '';
  } catch {
    return new Response(JSON.stringify({ error: 'Body inválido' }), { status: 400 });
  }

  if (!prompt) {
    return new Response(JSON.stringify({ error: 'Falta el prompt' }), { status: 400 });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.85,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(
        JSON.stringify({ error: `Groq ${response.status}: ${errText.slice(0, 200)}` }),
        { status: 500 }
      );
    }

    const data = await response.json();
    const texto = data.choices?.[0]?.message?.content ?? '';

    if (!texto) {
      return new Response(
        JSON.stringify({ error: `Sin texto. Respuesta: ${JSON.stringify(data).slice(0, 200)}` }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ texto }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
