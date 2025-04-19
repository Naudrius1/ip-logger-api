import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { ip, userAgent, referrer, page } = req.body;

  console.log("✅ Incoming data:", { ip, userAgent, referrer, page });

  const { error } = await supabase.from('ip_logs').insert([
    { ip, user_agent: userAgent, referrer, page }
  ]);

  if (error) {
    console.error("❌ Supabase insert error:", error);
    return res.status(500).send('Database error');
  }

  console.log("✅ Logged to Supabase");
  res.status(200).send('Logged');
}
