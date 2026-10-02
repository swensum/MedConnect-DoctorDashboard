import { useEffect, useRef, useState } from "react";
import { Logo, NeuInput, Btn, neu, fieldBase } from "../components/ui";

const Ico = ({ children, cls = "size-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`${cls} shrink-0`}>{children}</svg>
);

const FEATURES = [
  ["Video, voice and chat", "Consult patients from anywhere", <><rect x="2" y="6" width="14" height="12" rx="2.5" /><path d="M22 8l-6 4 6 4z" /></>],
  ["Smart scheduling", "Set clinic, hospital and online hours", <><rect x="3" y="4" width="18" height="18" rx="2.5" /><path d="M16 2v4M8 2v4M3 10h18" /></>],
  ["E-prescriptions", "Send prescriptions in seconds", <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>],
];

export default function Login({ onIn }) {
  const [step, setStep] = useState(0), [ph, setPh] = useState(""), [err, setErr] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [wait, setWait] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const sendCode = () => { setStep(1); setWait(30); setErr(""); setTimeout(() => refs.current[0]?.focus(), 50); };
  const setD = (i, v) => {
    v = v.replace(/\D/g, "").slice(-1);
    const o = [...otp]; o[i] = v; setOtp(o); setErr("");
    if (v && i < 5) refs.current[i + 1].focus();
  };
  const paste = (e) => {
    const d = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!d) return;
    e.preventDefault();
    setOtp(Array.from({ length: 6 }, (_, i) => d[i] || ""));
    refs.current[Math.min(d.length, 5)].focus();
  };
  // TODO: replace with Firebase confirmationResult.confirm(code)
  const verify = () => (otp.join("") === "123456" ? onIn(ph) : setErr("That code is incorrect. Use 123456 in this demo."));
  const resend = () => { setOtp(Array(6).fill("")); setErr(""); setWait(30); refs.current[0]?.focus(); };

  return (
    <div className="grid min-h-screen gap-6 p-4 lg:grid-cols-2 lg:p-6">
      {/* ---------- Brand panel (desktop) ---------- */}
      <aside className="relative hidden flex-col justify-between overflow-hidden rounded-[28px] bg-navy p-10 text-white shadow-neu lg:flex">
        <i className="absolute -right-24 -top-24 size-80 rounded-full bg-white/5" />
        <i className="absolute -bottom-32 -left-20 size-96 rounded-full bg-white/5" />
        <i className="absolute right-10 top-1/2 size-40 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-white"><Logo size={34} /></div>
          <span className="font-display text-2xl font-bold tracking-tight">MedConnect</span>
        </div>

        <div className="relative">
          <h2 className="font-display text-4xl font-bold leading-tight !text-white xl:text-5xl">Care for your patients,<br />wherever you are.</h2>
          <p className="mt-4 max-w-md text-white/70">One dashboard for appointments, consultations and prescriptions.</p>

          <div className="mt-8 grid max-w-md gap-3">
            {FEATURES.map(([t, s, icon]) => (
              <div key={t} className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/15"><Ico cls="size-5">{icon}</Ico></div>
                <div><div className="font-semibold">{t}</div><div className="text-[13px] text-white/65">{s}</div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-4 text-[13px] text-white/70">
          <div className="animate-float rounded-2xl bg-white px-4 py-2.5 text-navy motion-reduce:animate-none">
            <b className="font-display text-lg">4.8★</b> <span className="text-t2">doctor rating</span>
          </div>
          <span>Trusted by doctors and patients across Nepal</span>
        </div>
      </aside>

      {/* ---------- Form ---------- */}
      <main className="grid place-items-center">
        <div className={`${neu} w-full max-w-[440px] p-8 animate-fade-up motion-reduce:animate-none sm:p-10`}>
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Logo size={44} />
            <span className="font-display text-xl font-bold text-navy">MedConnect</span>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <div className={`${fieldBase} size-14 shrink-0 justify-center text-navy`}>
              <Ico cls="size-6">
                {step === 0
                  ? <><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></>
                  : <><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" /><path d="M9 12l2 2 4-4" /></>}
              </Ico>
            </div>
            <div>
              <h2 className="text-2xl">{step === 0 ? "Welcome back" : "Verify it's you"}</h2>
              <p className="text-[13px] text-t2">{step === 0 ? "Sign in to MedConnect Doctor" : `Code sent to +977 ${ph}`}</p>
            </div>
          </div>

          {step === 0 ? (
            <>
              <NeuInput label="Phone number" prefix="+977" inputMode="numeric" placeholder="98XXXXXXXX" value={ph}
                onChange={(e) => setPh(e.target.value.replace(/\D/g, "").slice(0, 10))}
                onKeyDown={(e) => e.key === "Enter" && ph.length >= 7 && sendCode()} />
              <p className="ml-1 mt-2 text-[12px] text-t2">We will send a 6-digit code by SMS.</p>
              <Btn size="lg" className="mt-6 w-full" disabled={ph.length < 7} onClick={sendCode}>Send code</Btn>
            </>
          ) : (
            <>
              <div className="grid grid-cols-6 gap-2.5" onPaste={paste}>
                {otp.map((d, i) => (
                  <div key={i} className={`${fieldBase} justify-center`}>
                    <input ref={(el) => (refs.current[i] = el)} inputMode="numeric" value={d} aria-label={`Digit ${i + 1}`}
                      className="w-full min-w-0 border-0 bg-transparent py-4 text-center font-display text-xl font-bold text-navy caret-navy outline-0"
                      onChange={(e) => setD(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1].focus();
                        if (e.key === "Enter" && otp.join("").length === 6) verify();
                      }} />
                  </div>
                ))}
              </div>
              {err ? <div className="mt-3 text-[13px] text-bad" role="alert">{err}</div>
                : <p className="ml-1 mt-3 text-[12px] text-t2">Demo code: 123456</p>}

              <Btn size="lg" className="mt-6 w-full" disabled={otp.join("").length < 6} onClick={verify}>Verify and sign in</Btn>

              <div className="mt-5 flex items-center justify-between text-[13px]">
                <button className="cursor-pointer font-semibold text-navy" onClick={() => { setStep(0); setOtp(Array(6).fill("")); setErr(""); }}>Change number</button>
                {wait > 0
                  ? <span className="text-t2">Resend in 0:{String(wait).padStart(2, "0")}</span>
                  : <button className="cursor-pointer font-semibold text-navy" onClick={resend}>Resend code</button>}
              </div>
            </>
          )}

          <div className="mt-8 flex justify-center gap-2" aria-hidden="true">
            {[0, 1].map((n) => <i key={n} className={`h-2 rounded-full transition-all motion-reduce:transition-none ${step === n ? "w-6 bg-navy" : "w-2 bg-muted"}`} />)}
          </div>
        </div>
      </main>
    </div>
  );
}