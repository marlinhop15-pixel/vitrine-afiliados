const SUPABASE_URL = "https://wehjtzbamrwfevsbjsqw.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_WAuKhSQnMv0daIxzllmEHw_SsHJ9e6T";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
