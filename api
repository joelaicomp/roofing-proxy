export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const SYSTEM_PROMPT = `You are a friendly AI roofing assistant. Help homeowners with:
1. Free roofing quotes - collect name, address, phone, service type
2. Booking inspections - collect name, phone, preferred date/time  
3. Roofing questions - materials, costs, repairs, storm damage, insurance

Keep replies to 2-4 sentences. Ask one question at a time when collecting info.
Never invent prices. Say the team will follow up within 24 hours once info is collected.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data });
    return res.status(200).json({ reply: data.content?.[0]?.text });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
