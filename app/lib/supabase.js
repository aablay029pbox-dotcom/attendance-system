import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // your sb_publishable_ key

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase environment variables are missing. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are defined in .env.local"
  );
}

// Create Supabase client (v2+ supports sb_publishable keys)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Debug
console.log("SUPABASE URL:", supabaseUrl);
console.log("SUPABASE KEY:", supabaseKey ? "SET" : "MISSING");
