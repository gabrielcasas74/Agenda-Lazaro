export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY no configurada' }), { status: 500 });
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
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.85 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return new Response(
        JSON.stringify({ error: `Gemini ${geminiRes.status}: ${errText.slice(0, 200)}` }),
        { status: 500 }
      );
    }

    const data = await geminiRes.json();
    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

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
