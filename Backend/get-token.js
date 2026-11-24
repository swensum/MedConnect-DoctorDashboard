import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const phone = process.argv[2] || "+9779800000000";
const otp = "123456";           // your test OTP

const { error } = await supabase.auth.signInWithOtp({ phone });
if (error) { console.error(error.message); process.exit(1); }

const { data, error: err2 } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
if (err2) { console.error(err2.message); process.exit(1); }

console.log(data.session.access_token);