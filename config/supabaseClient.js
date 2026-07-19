/**
 * supabaseClient.js - Supabase Client for She Can Foundation
 *
 * Single shared Supabase instance used by all server-side route modules.
 * Uses the service-role (secret) key so that backend routes can bypass RLS.
 */

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌ Missing SUPABASE_URL or SUPABASE_SECRET_KEY in environment variables."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

module.exports = supabase;
