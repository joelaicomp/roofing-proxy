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
    const structured = body?.message?.analysis?.structuredData || {};
    const callerNumber = call?.customer?.number || 'Unknown';
    const now = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

    // Use structured data if available, fallback to raw caller number
    const name = structured.caller_name || 'See transcript';
    const phone = structured.phone_number || callerNumber;
    const email = structured.caller_email || 'See transcript';
    const address = structured.address || 'See transcript';
    const issue = structured.roof_issue || 'See transcript';
    const callbackTime = structured.callback_time || 'See transcript';
    const urgency = structured.urgency || 'See transcript';

    const emailRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: 'service_y3gfka9',
        template_id: 'template_dzztr0f',
        user_id: 'MKgwkbObxQ7iO26RQ',
        accessToken: 'A8dhS2Qxqb0GWFMXvqU1o',
        template_params: {
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          address: address,
          service_type: issue,
          preferred_date: callbackTime,
          notes: urgency,
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
