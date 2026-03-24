import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY no configurada en Vercel Environment Variables' });
  }

  const { prompt } = req.body ?? {};
  if (!prompt) {
    return res.status(400).json({ error: 'Falta el campo prompt en el body' });
  }

  let geminiResponse: Response;
  try {
    geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.85 },
        }),
      }
    );
  } catch (fetchErr: any) {
    return res.status(500).json({ error: `Error de red al llamar Gemini: ${fetchErr.message}` });
  }

  if (!geminiResponse.ok) {
    const errText = await geminiResponse.text();
    return res.status(geminiResponse.status).json({
      error: `Gemini respondió ${geminiResponse.status}: ${errText.slice(0, 200)}`,
    });
  }

  let data: any;
  try {
    data = await geminiResponse.json();
  } catch {
    return res.status(500).json({ error: 'No se pudo parsear la respuesta de Gemini' });
  }

  const texto = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!texto) {
    return res.status(500).json({ error: `Gemini no devolvió texto. Respuesta: ${JSON.stringify(data).slice(0, 200)}` });
  }

  return res.status(200).json({ texto });
}
