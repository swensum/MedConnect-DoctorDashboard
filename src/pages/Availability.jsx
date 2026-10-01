import { useState } from "react";
import { DAYS } from "../components/data";
import { Btn, Chip, NeuInput, neu } from "../components/ui";

export default function Availability({ toast }) {
  const [on, setOn] = useState({ Mon: 1, Tue: 1, Wed: 1, Thu: 1, Fri: 1, Sat: 0, Sun: 0 }), [fee, setFee] = useState("500"), [dur, setDur] = useState(20);
  return (
    <div className="grid max-w-[640px] gap-[22px]">
      <h1 className="text-2xl">Availability</h1>
      <div className={`${neu} p-5`}>
        {DAYS.map((d) => (
          <div key={d} className="flex items-center gap-3 py-2.5">
            <b className="w-[50px]">{d}</b>
            <span className="flex-1 text-[13px] text-t2">{on[d] ? "09:00 AM – 05:00 PM" : "Not available"}</span>
            <button aria-label={"Toggle " + d} onClick={() => setOn({ ...on, [d]: on[d] ? 0 : 1 })}
              className="relative h-7 w-[52px] cursor-pointer rounded-full bg-bg shadow-inset">
              <i className={`absolute top-1 size-5 rounded-full transition-all duration-200 motion-reduce:transition-none ${on[d] ? "left-7 bg-navy" : "left-1 bg-muted"}`} />
            </button>
          </div>
        ))}
      </div>
      <div className={`${neu} p-5`}>
        <div className="mb-2 ml-1 text-xs font-semibold text-navy">Slot length</div>
        <div className="mb-[18px] flex items-center gap-3">
          {[15, 20, 30].map((m) => <Chip key={m} on={dur === m} onClick={() => setDur(m)}>{m} min</Chip>)}
        </div>
        <NeuInput label="Consultation fee (Rs)" inputMode="numeric" value={fee} onChange={(e) => setFee(e.target.value.replace(/\D/g, ""))} />
        <Btn className="mt-[18px]" onClick={() => toast("Availability saved")}>Save changes</Btn>
      </div>
    </div>
  );
}