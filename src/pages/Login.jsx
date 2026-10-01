import { useRef, useState } from "react";
import { Logo, NeuInput, Btn, neu, fieldBase } from "../components/ui";

export default function Login({ onIn }) {
  const [step, setStep] = useState(0), [ph, setPh] = useState(""), [err, setErr] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const refs = useRef([]);
  const setD = (i, v) => {
    v = v.replace(/\D/g, "").slice(-1);
    const o = [...otp]; o[i] = v; setOtp(o); setErr("");
    if (v && i < 5) refs.current[i + 1].focus();
  };
  // TODO: replace with Firebase confirmationResult.confirm(code)
  const verify = () => (otp.join("") === "123456" ? onIn(ph) : setErr("That code is incorrect. Use 123456 in this demo."));

  return (
    <div className="grid min-h-screen place-items-center p-5">
      <div className={`${neu} w-full max-w-[420px] p-8`}>
        <div className="mb-6 flex items-center gap-3">
          <Logo />
          <div>
            <h2 className="text-xl">MedConnect Doctor</h2>
            <div className="text-[13px] text-t2">Manage patients and consultations</div>
          </div>
        </div>
        {step === 0 ? (
          <>
            <h3 className="mb-1.5 text-base">Sign in with your phone</h3>
            <p className="mb-3.5 text-[13px] text-t2">We will send a 6-digit code.</p>
            <NeuInput label="Phone number" prefix="+977" inputMode="numeric" placeholder="98XXXXXXXX" value={ph}
              onChange={(e) => setPh(e.target.value.replace(/\D/g, "").slice(0, 10))} />
            <Btn className="mt-5 w-full" disabled={ph.length < 7} onClick={() => setStep(1)}>Send code</Btn>
          </>
        ) : (
          <>
            <h3 className="mb-1.5 text-base">Enter the code</h3>
            <p className="mb-3.5 text-[13px] text-t2">Sent to +977 {ph}. Demo code: 123456</p>
            <div className="grid grid-cols-6 gap-2.5">
              {otp.map((d, i) => (
                <div key={i} className={`${fieldBase} justify-center`}>
                  <input ref={(el) => (refs.current[i] = el)} inputMode="numeric" value={d} aria-label={`Digit ${i + 1}`}
                    className="w-full min-w-0 border-0 bg-transparent py-3.5 text-center font-display text-xl font-bold text-navy caret-navy outline-0"
                    onChange={(e) => setD(i, e.target.value)}
                    onKeyDown={(e) => e.key === "Backspace" && !d && i > 0 && refs.current[i - 1].focus()} />
                </div>
              ))}
            </div>
            {err && <div className="mt-3 text-[13px] text-bad">{err}</div>}
            <Btn className="mt-5 w-full" disabled={otp.join("").length < 6} onClick={verify}>Verify and sign in</Btn>
            <Btn variant="ghost" size="sm" className="mt-3.5 w-full" onClick={() => { setStep(0); setOtp(Array(6).fill("")); }}>Change number</Btn>
          </>
        )}
      </div>
    </div>
  );
}