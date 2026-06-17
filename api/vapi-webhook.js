export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;

    // Vapi sends call data in the message object
    const call = body?.message?.call || body?.call || {};
    const transcript = body?.message?.transcript || body?.transcript || 'No transcript available';
    const summary = body?.message?.analysis?.summary || 'No summary available';

    // Extract structured data from call
    const callerNumber = call?.customer?.number || 'Unknown';
    const callDuration = call?.endedAt && call?.startedAt
      ? Math.round((new Date(call.endedAt) - new Date(call.startedAt)) / 1000)
      : 'Unknown';

    // Send email via EmailJS REST API
    const emailRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: 'service_y3gfka9',
        template_id: 'template_2ol8kg3',
        user_id: 'MKgwkbObxQ7iO26RQ',
        template_params: {
          to_email: 'Joel@jaxmastersroofing.com',
          from_name: 'JaxMasters Voice Agent',
          subject: `New Roofing Lead — Caller: ${callerNumber}`,
          message: `
NEW LEAD FROM VOICE AGENT
=========================
Caller Number: ${callerNumber}
Call Duration: ${callDuration} seconds

CALL SUMMARY:
${summary}

FULL TRANSCRIPT:
${transcript}
          `.trim()
        }
      })
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error('EmailJS error:', errText);
      return res.status(500).json({ error: 'Email failed', detail: errText });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
}
