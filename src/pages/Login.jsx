import { useEffect, useRef, useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../firebase";
import { Logo } from "../components/ui";

const Ico = ({ children, cls = "size-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`${cls} shrink-0`}>{children}</svg>
);


const raised = "bg-navy shadow-[8px_8px_18px_rgba(3,10,24,.65),-6px_-6px_16px_rgba(52,88,144,.28)]";
const inset = "bg-navy shadow-[inset_4px_4px_9px_rgba(3,10,24,.65),inset_-3px_-3px_8px_rgba(52,88,144,.25)]";
const focusRing = "focus-within:ring-2 focus-within:ring-sky-300/50";

const SCHEDULE = [
  ["10:30", "Sita Gurung", "Follow-up · Video", "Next", <><rect x="2" y="6" width="14" height="12" rx="2.5" /><path d="M22 8l-6 4 6 4z" /></>],
  ["11:15", "Ramesh Thapa", "New patient · Clinic", "Clinic", <><rect x="3" y="4" width="18" height="18" rx="2.5" /><path d="M16 2v4M8 2v4M3 10h18" /></>],
  ["12:00", "Prescription ready", "Sent to patient in 4 sec", "E-Rx", <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>],
];

const Spinner = () => (
  <svg viewBox="0 0 24 24" fill="none" className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

function Heartbeat({ beat }) {
  const cv = useRef(null), boost = useRef(0);

  useEffect(() => { boost.current = Math.min(1.5, boost.current + 0.7); }, [beat]);

  useEffect(() => {
    const c = cv.current, ctx = c.getContext("2d");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W, H, off = 0, raf;
    const size = () => {
      const d = devicePixelRatio || 1;
      W = c.clientWidth; H = c.clientHeight;
      c.width = W * d; c.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    const g = (p, c0, w, a) => a * Math.exp(-(((p - c0) / w) ** 2));
    const wave = (p) => g(p, .18, .03, .12) + g(p, .37, .008, -.12) + g(p, .4, .01, 1) + g(p, .43, .01, -.3) + g(p, .65, .04, .2);
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const mid = H * 0.5, cyc = 360, amp = 60 + boost.current * 55;
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, "rgba(127,183,255,0)");
      grad.addColorStop(0.45, "rgba(127,183,255,.6)");
      grad.addColorStop(1, "rgba(127,183,255,.12)");
      ctx.strokeStyle = grad; ctx.lineWidth = 2.5; ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(127,183,255,.6)"; ctx.shadowBlur = 10;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const p = ((((x + off) % cyc) + cyc) % cyc) / cyc;
        const y = mid - wave(p) * amp;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      off += 1.3; boost.current *= 0.965;
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    size(); draw();
    const ro = new ResizeObserver(() => { size(); if (reduce) draw(); });
    ro.observe(c);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={cv} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[42%] h-40 w-full -translate-y-1/2" />;
}

export default function Login({ onIn }) {
  const [step, setStep] = useState(0), [ph, setPh] = useState(""), [err, setErr] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [wait, setWait] = useState(0), [beat, setBeat] = useState(0), [loading, setLoading] = useState(false), [verifying, setVerifying] = useState(false);
  const refs = useRef([]);
  const confirmationRef = useRef(null); // holds the Firebase confirmationResult between steps
  const recaptchaRef = useRef(null);
  const ping = () => setBeat((b) => b + 1);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  // Set up the invisible reCAPTCHA once, on mount.
  useEffect(() => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  }, []);

  const sendCode = async () => {
    if (loading) return;
    setLoading(true); ping(); setErr("");

    try {
      const fullNumber = `+977${ph}`; // adjust country code if needed
      const confirmation = await signInWithPhoneNumber(auth, fullNumber, recaptchaRef.current);
      confirmationRef.current = confirmation;
      setLoading(false); setStep(1); setWait(30); ping();
      setTimeout(() => refs.current[0]?.focus(), 50);
    } catch (e) {
      setLoading(false);
      setErr(e.code === "auth/invalid-phone-number" ? "Enter a valid phone number" : "Couldn't send code. Try again.");
    }
  };

  const setD = (i, v) => {
    v = v.replace(/\D/g, "").slice(-1);
    const o = [...otp]; o[i] = v; setOtp(o); setErr(""); ping();
    if (v && i < 5) refs.current[i + 1].focus();
  };

  const paste = (e) => {
    const d = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!d) return;
    e.preventDefault();
    setOtp(Array.from({ length: 6 }, (_, i) => d[i] || ""));
    refs.current[Math.min(d.length, 5)].focus(); ping();
  };

  const verify = async () => {
    if (verifying || !confirmationRef.current) return;
    setVerifying(true); setErr(""); ping();

    try {
      const code = otp.join("");
      const result = await confirmationRef.current.confirm(code);
      setVerifying(false); ping();
      onIn(result.user.phoneNumber); // real Firebase user now, not a fake string
    } catch (e) {
      setVerifying(false);
      setErr("That code is incorrect.");
    }
  };

  const resend = () => {
    setOtp(Array(6).fill("")); setErr(""); setWait(30); ping(); refs.current[0]?.focus();
    sendCode(); // Firebase needs a fresh signInWithPhoneNumber call to resend
  };

  const primary = "mt-6 w-full cursor-pointer rounded-2xl bg-white py-4 font-semibold text-navy shadow-[5px_5px_12px_rgba(3,10,24,.55),-4px_-4px_10px_rgba(52,88,144,.22)] transition active:translate-y-px active:shadow-[inset_3px_3px_7px_rgba(3,10,24,.25)] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none";
  const link = "cursor-pointer font-semibold text-white/90 underline-offset-4 hover:underline";

  return (
    <div className="min-h-screen bg-[#E8F3FF] p-3 sm:p-4 lg:p-5">
      {/* ---------- ONE navy container raised from a muted blue screen ---------- */}
      <div className="relative grid min-h-[calc(100vh-1.5rem)] items-center gap-10 overflow-hidden rounded-[40px] bg-navy p-6 text-white shadow-[18px_18px_40px_rgba(16,32,62,.55),-14px_-14px_34px_rgba(150,182,228,.35)] sm:min-h-[calc(100vh-2rem)] sm:p-10 lg:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:p-14">
        <Heartbeat beat={beat} />
        <div id="recaptcha-container" />

        {/* Left: brand, headline, schedule */}
        <section className="relative flex flex-col gap-10 lg:h-full lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-white shadow-[4px_4px_10px_rgba(3,10,24,.5)]"><Logo size={34} /></div>
            <span className="font-display text-2xl font-bold tracking-tight">MedConnect</span>
          </div>

          <div>
            <h1 className="max-w-[13ch] font-display text-4xl font-bold leading-[1.05] tracking-tight !text-white sm:text-5xl xl:text-6xl">Your patients are waiting.</h1>
            <p className="mt-4 max-w-sm text-white/70">Appointments, video consults and e-prescriptions in one calm workspace.</p>

            <div className="mt-8 hidden max-w-md gap-4 lg:grid">
              {SCHEDULE.map(([time, t, s, tag, icon], i) => (
                <div key={t} style={{ marginLeft: i * 28 }} className={`${raised} flex items-center gap-4 rounded-2xl p-3.5`}>
                  <div className={`${inset} grid size-11 shrink-0 place-items-center rounded-xl text-sky-300`}><Ico>{icon}</Ico></div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{t}</div>
                    <div className="truncate text-[13px] text-white/60">{time} · {s}</div>
                  </div>
                  <span className={`${inset} rounded-full px-3 py-1 text-[11px] font-semibold ${i === 0 ? "text-emerald-300" : "text-white/70"}`}>{tag}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-4 text-[13px] text-white/70 lg:flex">
            <div className="animate-float rounded-2xl bg-white px-4 py-2.5 text-navy motion-reduce:animate-none">
              <b className="font-display text-lg">4.8★</b> <span className="text-t2">doctor rating</span>
            </div>
            <span>Trusted by doctors and patients across Nepal</span>
          </div>
        </section>

        {/* Right: login card, same raised style as the patient cards */}
        <section className="relative grid place-items-center">
          <div className={`${raised} w-full max-w-[440px] rounded-3xl p-7 animate-fade-up motion-reduce:animate-none sm:p-9`}>
            <div className="mb-6 flex items-center gap-4">
              <div className={`${inset} grid size-14 shrink-0 place-items-center rounded-2xl text-sky-300`}>
                <Ico cls="size-6">
                  {step === 0
                    ? <><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></>
                    : <><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" /><path d="M9 12l2 2 4-4" /></>}
                </Ico>
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold !text-white">{step === 0 ? "Good to see you, doctor" : "Enter your code"}</h2>
                <p className="text-[13px] text-white/60">{step === 0 ? "Sign in to MedConnect Doctor" : `Sent to +977 ${ph}`}</p>
              </div>
            </div>

            {step === 0 ? (
              <>
                <label htmlFor="phone" className="mb-2 ml-1 block text-[13px] font-semibold text-white/90">Phone number</label>
                <div className={`${inset} ${focusRing} flex items-center rounded-2xl`}>
                  <span className="border-r border-white/15 px-4 font-semibold">+977</span>
                  <input id="phone" inputMode="numeric" autoComplete="tel-national" placeholder="98XXXXXXXX" value={ph} disabled={loading}
                    className="w-full min-w-0 border-0 bg-transparent px-4 py-4 text-lg text-white caret-sky-300 outline-0 placeholder:text-white/35"
                    onChange={(e) => { setPh(e.target.value.replace(/\D/g, "").slice(0, 10)); ping(); }}
                    onKeyDown={(e) => e.key === "Enter" && ph.length >= 7 && sendCode()} />
                </div>
                <p className="ml-1 mt-2 text-[12px] text-white/55">We will send a 6-digit code by SMS.</p>
                <button className={primary} disabled={ph.length < 7 || loading} aria-busy={loading} onClick={sendCode}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2.5">
                      <Spinner />
                      Sending code…
                    </span>
                  ) : "Send code"}
                </button>
              </>
            ) : (
              <>
                <div className="grid grid-cols-6 gap-2.5" onPaste={paste}>
                  {otp.map((d, i) => (
                    <div key={i} className={`${inset} ${focusRing} rounded-xl ${err ? "ring-2 ring-red-400/60" : ""}`}>
                      <input ref={(el) => (refs.current[i] = el)} inputMode="numeric" autoComplete={i ? "off" : "one-time-code"} value={d} disabled={verifying} aria-label={`Digit ${i + 1}`}
                        className="w-full min-w-0 border-0 bg-transparent py-4 text-center font-display text-xl font-bold text-white caret-sky-300 outline-0"
                        onChange={(e) => setD(i, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1].focus();
                          if (e.key === "Enter" && otp.join("").length === 6) verify();
                        }} />
                    </div>
                  ))}
                </div>
                {err ? <div className="mt-3 text-[13px] text-red-300" role="alert">{err}</div>
                  : <p className="ml-1 mt-3 text-[12px] text-white/55">Demo code: 123456</p>}

                <button className={primary} disabled={otp.join("").length < 6 || verifying} aria-busy={verifying} onClick={verify}>
                  {verifying ? (
                    <span className="flex items-center justify-center gap-2.5"><Spinner />Verifying…</span>
                  ) : "Verify and sign in"}
                </button>

                <div className="mt-5 flex items-center justify-between text-[13px]">
                  <button className={link} disabled={verifying} onClick={() => { setStep(0); setOtp(Array(6).fill("")); setErr(""); }}>Change number</button>
                  {wait > 0
                    ? <span className="text-white/55">Resend in 0:{String(wait).padStart(2, "0")}</span>
                    : <button className={link} disabled={verifying} onClick={resend}>Resend code</button>}
                </div>
              </>
            )}

            {/* dot indicator */}
            <div className="mt-7 flex justify-center gap-2" aria-hidden="true">
              {[0, 1].map((n) => (
                <i key={n} className={`h-2 rounded-full transition-all duration-300 motion-reduce:transition-none ${step === n ? "w-6 bg-sky-300" : "w-2 bg-white/25"}`} />
              ))}
            </div>

            <p className="mt-5 text-center text-[12px] text-white/45">Never share your code with anyone.</p>
          </div>
        </section>
      </div>
    </div>
  );
}