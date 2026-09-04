export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(503).json({ message: 'LLM is not configured' });
  const message = String(req.body?.message ?? '').trim();
  if (!message) return res.status(400).json({ message: 'Message is required' });

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
        instructions: 'You are Freight AI, an expert assistant for SIH 2026 Problem Statement 26006. Explain freight forecasting, chartering, vessel selection, ports, congestion, voyage economics, optimization and risk. Never claim bundled demo values are live market data. If a number is not supplied in the conversation, do not invent a precise number.',
        input: message,
        max_output_tokens: 500,
      }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(502).json({ message: 'LLM request failed' });
    const answer = data.output_text ?? data.output?.flatMap((x: any) => x.content ?? []).map((x: any) => x.text ?? '').join('') ?? 'No response generated.';
    return res.status(200).json({ answer });
  } catch {
    return res.status(502).json({ message: 'LLM temporarily unavailable' });
  }
}
