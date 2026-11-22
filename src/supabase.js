
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY 
);

// Helper: call your own backend with the logged-in user's token
export async function api(path, options = {}) {
  const { data } = await supabase.auth.getSession();
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.session?.access_token}`,
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error((await res.json()).error || "Request failed");
  return res.json();
}
