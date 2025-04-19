import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // ✅ Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // CORS preflight
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const {
    name,
    email,
    session_id,
    device_id,
    ip,
    userAgent,
    referrer,
    page,
    utm_source,
    utm_medium,
    utm_campaign,
    country,
    city,
    region,
    org,
    screen
  } = req.body;

  // ⚡ Insert into leads table (make sure you've created this!)
  const { error } = await supabase.from('leads').insert([
    {
      name,
      email,
      session_id,
      device_id,
      ip,
      user_agent: userAgent,
      referrer,
      page,
      utm_source,
      utm_medium,
      utm_campaign,
      country,
      city,
      region,
      org,
      screen,
    }
  ]);

  if (error) {
    console.error('❌ Supabase insert error:', error);
    return res.status(500).send('Lead insert failed');
  }

  console.log('✅ Lead stored in Supabase');
  res.status(200).send('Lead received');
}
