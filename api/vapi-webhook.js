export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    const messageType = body?.message?.type;

    if (messageType !== 'end-of-call-report') {
      return res.status(200).json({ received: true, skipped: true });
    }

    const call = body?.message?.call || {};
    const transcript = body?.message?.transcript || 'No transcript available';
    const summary = body?.message?.analysis?.summary || 'No summary available';
    const callerNumber = call?.customer?.number || 'Unknown';
    const now = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

    const emailRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: 'service_y3gfka9',
        template_id: 'template_2ol8kg3',
        user_id: 'MKgwkbObxQ7iO26RQ',
        accessToken: 'A8dhS2Qxqb0GWFMXvqU1o',
        template_params: {
          customer_name: 'See transcript',
          customer_email: 'N/A — Voice Call',
          customer_phone: callerNumber,
          address: 'See transcript',
          service_type: 'Voice Call Intake',
          preferred_date: 'See transcript',
          notes: summary,
          submitted_at: now,
          conversation: transcript
        }
      })
    });

    const emailText = await emailRes.text();
    console.log('EmailJS response:', emailText);

    if (!emailRes.ok) {
      return res.status(500).json({ error: 'Email failed', detail: emailText });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
}
