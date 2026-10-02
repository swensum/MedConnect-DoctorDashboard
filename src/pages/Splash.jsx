import { useEffect, useState } from "react";
import { Logo } from "../components/ui";

export default function Splash({ onDone }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const a = setTimeout(() => setLeaving(true), 2100);
    const b = setTimeout(onDone, 2600);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [onDone]);

  return (
    <div className={`fixed inset-0 z-50 grid place-items-center bg-bg transition-opacity duration-500 motion-reduce:transition-none ${leaving ? "opacity-0" : "opacity-100"}`}>
      <div className="flex flex-col items-center px-6 text-center">
        <div className="relative grid size-32 place-items-center">
          <i className="absolute inset-0 rounded-full bg-navy/20 animate-ring motion-reduce:animate-none" />
          <i className="absolute inset-0 rounded-full bg-navy/10 animate-ring [animation-delay:.7s] motion-reduce:animate-none" />
          <div className="relative grid size-32 place-items-center rounded-full bg-bg shadow-neu animate-pop motion-reduce:animate-none">
            <Logo size={68} />
          </div>
        </div>

        <h1 className="mt-8 font-display text-4xl font-bold tracking-tight text-navy animate-fade-up [animation-delay:.3s] motion-reduce:animate-none">MedConnect</h1>
        <p className="mt-2 text-sm text-t2 animate-fade-up [animation-delay:.5s] motion-reduce:animate-none">Your patients, one tap away</p>

        <div className="mt-10 h-2 w-48 overflow-hidden rounded-full bg-bg shadow-inset" role="progressbar" aria-label="Loading">
          <div className="h-full rounded-full bg-navy animate-load motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}