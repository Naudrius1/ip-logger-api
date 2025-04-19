export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/javascript');

  res.send(`
    console.log('🚀 Visitor logger with session tracking running...');

    (async () => {
      try {
        let sessionId = localStorage.getItem('visitor_session');
        if (!sessionId) {
          sessionId = \`\${Date.now()}-\${Math.floor(Math.random() * 1000000)}\`;
          localStorage.setItem('visitor_session', sessionId);
        }
        console.log('🧠 Session ID:', sessionId);

        const ipRes = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipRes.json();
        console.log('📡 IP:', ip);

        const geoRes = await fetch(\`https://ipapi.co/\${ip}/json/\`);
        const geo = await geoRes.json();

        const urlParams = new URLSearchParams(window.location.search);
        const utm = {
          source: urlParams.get('utm_source'),
          medium: urlParams.get('utm_medium'),
          campaign: urlParams.get('utm_campaign'),
        };

        const screen = {
          width: window.screen.width,
          height: window.screen.height,
          dpr: window.devicePixelRatio,
        };

        const payload = {
          session_id: sessionId,
          ip,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          page: window.location.href,
          utm_source: utm.source,
          utm_medium: utm.medium,
          utm_campaign: utm.campaign,
          country: geo.country_name,
          city: geo.city,
          region: geo.region,
          org: geo.org,
          screen
        };

        const resLog = await fetch('https://ip-logger-api.vercel.app/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = await resLog.text();
        console.log('✅ Logged:', result);
      } catch (err) {
        console.error('❌ Visitor log error:', err);
      }
    })();
  `);
}
