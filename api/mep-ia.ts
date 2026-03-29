import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { texto } = await req.json() as { texto: string };

    if (!texto?.trim()) {
      return new Response(JSON.stringify({ error: 'Texto vacío' }), { status: 400 });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    const prompt = `Eres un asistente que extrae eventos de calendarios educativos costarricenses MEP.
Dado el siguiente texto, extrae SOLO los eventos relevantes para un docente de Educación Religiosa en secundaria.

Prioriza: periodos lectivos, feriados, semanas especiales (sobre todo religiosas), fechas de entrega de notas, actos cívicos, semana santa, semana de educación religiosa.

Responde ÚNICAMENTE con un JSON array válido (sin markdown, sin texto extra):
[
  {
    "titulo": "...",
    "fechaInicio": "YYYY-MM-DD",
    "fechaFin": "YYYY-MM-DD o null",
    "categoria": "Periodos Lectivos|Efemérides y otras celebraciones|Administrativo y docente|Pruebas de Educación Formal",
    "descripcion": "descripcion breve",
    "destacado": true o false
  }
]

Texto:
${texto.slice(0, 6000)}`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    const data = await res.json() as any;
    const respuesta = data.choices?.[0]?.message?.content ?? '[]';

    // Limpiar y parsear JSON
    const clean = respuesta.replace(/```json|```/g, '').trim();
    let eventos = [];
    try {
      eventos = JSON.parse(clean);
    } catch {
      // Intentar extraer array del texto
      const match = clean.match(/\[[\s\S]*\]/);
      if (match) eventos = JSON.parse(match[0]);
    }

    return new Response(JSON.stringify({ eventos }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
