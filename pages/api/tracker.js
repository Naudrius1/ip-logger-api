export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');

  res.send(`
    console.log('🚀 Visitor logger with session + lead tracking running...');

    (async () => {
      try {
        // Session ID
        let sessionId = localStorage.getItem('visitor_session');
        if (!sessionId) {
          sessionId = Date.now() + '-' + Math.floor(Math.random() * 1000000);
          localStorage.setItem('visitor_session', sessionId);
        }
        console.log('🧠 Session ID:', sessionId);

        // Device ID
        let deviceId = localStorage.getItem('visitor_device_id');
        if (!deviceId) {
          deviceId = crypto.randomUUID();
          localStorage.setItem('visitor_device_id', deviceId);
        }
        console.log('💻 Device ID:', deviceId);

        // IP
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipRes.json();
        console.log('📡 IP:', ip);

        // Geo
        const geoRes = await fetch('https://ipapi.co/' + ip + '/json/');
        const geo = await geoRes.json();

        // UTM params
        const urlParams = new URLSearchParams(window.location.search);
        const utm = {
          source: urlParams.get('utm_source'),
          medium: urlParams.get('utm_medium'),
          campaign: urlParams.get('utm_campaign'),
        };

        // Screen info
        const screen = {
          width: window.screen.width,
          height: window.screen.height,
          dpr: window.devicePixelRatio,
        };

        // Log visitor hit
        const payload = {
          session_id: sessionId,
          device_id: deviceId,
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
        console.log('✅ Visit logged:', result);

        // Lead form handling
        const form = document.getElementById("lead-form");
        if (form) {
          form.addEventListener("submit", async function (e) {
            e.preventDefault();
            const name = form.name.value;
            const email = form.email.value;

            const leadPayload = {
              name,
              email,
              session_id: sessionId,
              device_id: deviceId,
              page: window.location.href,
              referrer: document.referrer,
              userAgent: navigator.userAgent
            };

            try {
              const resLead = await fetch("https://ip-logger-api.vercel.app/api/submit-lead", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(leadPayload)
              });

              const result = await resLead.text();
              console.log("✅ Lead submitted:", result);
              const status = document.getElementById("status");
              if (status) status.innerText = "✅ Lead submitted!";
            } catch (err) {
              console.error("❌ Lead submission error:", err);
              const status = document.getElementById("status");
              if (status) status.innerText = "❌ Submission failed.";
            }
          });
        }
      } catch (err) {
        console.error('❌ Visitor tracker error:', err);
      }
    })();
  `);
}
