export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://hvac-web-demo.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, message: 'No token provided' });

  const SECRET_KEY = '6Lfv4RAtAAAAAPxB8BGR6ilruJkqoBloprXFoONk';
  const PROJECT_ID = 'gen-lang-client-0831826779';

  try {
    const response = await fetch(
      `https://recaptchaenterprise.googleapis.com/v1/projects/${PROJECT_ID}/assessments?key=${SECRET_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: {
            token: token,
            expectedAction: 'submit',
            siteKey: '6Lfv4RAtAAAAAF4Eetzfq7XaoKj5Ci-vWlqdCxpc',
          }
        })
      }
    );

    const data = await response.json();
    const score = data?.riskAnalysis?.score ?? 0;
    const valid = data?.tokenProperties?.valid === true;

    // Log for debugging
    console.log('reCAPTCHA assessment:', JSON.stringify({ valid, score, reasons: data?.riskAnalysis?.reasons }));

    if (valid && score >= 0.3) {
      return res.status(200).json({ success: true, score });
    } else {
      return res.status(200).json({ success: false, message: 'reCAPTCHA verification failed', score, valid, data });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Verification error' });
  }
}
