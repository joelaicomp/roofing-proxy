export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;

    const call = body?.message?.call || body?.call || {};
    const transcript = body?.message?.transcript || body?.transcript || 'No transcript available';
    const summary = body?.message?.analysis?.summary || '';

    // Extract structured fields from Vapi summary or transcript
    const callerNumber = call?.customer?.number || 'Unknown';
    const callDuration = call?.endedAt && call?.startedAt
      ? Math.round((new Date(call.endedAt) - new Date(call.startedAt)) / 1000) + ' seconds'
      : 'Unknown';

    // Parse what Alex collected from the summary
    const now = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: 'service_y3gfka9',
        template_id: 'template_2ol8kg3',
        user_id: 'MKgwkbObxQ7iO26RQ',
        template_params: {
          customer_name: 'See transcript',
          customer_email: 'N/A — Voice Call',
          customer_phone: callerNumber,
          address: 'See transcript',
          service_type: 'Voice Call Intake',
          preferred_date: 'See transcript',
          notes: summary || 'See full transcript below',
          submitted_at: now,
          conversation: transcript
        }
      })
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
}
