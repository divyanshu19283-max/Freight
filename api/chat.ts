export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const message = String(req.body?.message || '').trim();
  if (!message) return res.status(400).json({ error: 'Message is required' });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(503).json({ error: 'LLM not configured' });
  const context = req.body?.context || {};
  try {
    const r = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-5.6-luna', input: `You are Freight AI for an SIH 2026 freight decision-support demo. Use the supplied dashboard context. Be concise, practical and clearly distinguish demo assumptions from live market data. Context: ${JSON.stringify(context)}\nUser: ${message}` }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: 'LLM request failed' });
    const answer = data.output_text || data.output?.flatMap((x:any)=>x.content||[]).map((x:any)=>x.text||'').join(' ') || 'No response received.';
    return res.status(200).json({ answer });
  } catch { return res.status(502).json({ error: 'LLM unavailable' }); }
}
