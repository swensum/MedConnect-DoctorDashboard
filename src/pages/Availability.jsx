import { useState } from "react";
import { DAYS } from "../components/data";
import { Btn, Chip, NeuInput, inset, neu } from "../components/ui";

/* ---------- helpers ---------- */
const TYPES = {
  video: { label: "Video", dot: "bg-navy" },
  clinic: { label: "Clinic", dot: "bg-ok" },
  hospital: { label: "Hospital", dot: "bg-[#6f93c4]" },
};
const uid = () => Math.random().toString(36).slice(2, 9);
const mins = (t) => { const [h, m] = t.split(":"); return +h * 60 + +m; };
const fmt = (t) => {
  const [h, m] = t.split(":"); const H = +h;
  return `${H % 12 || 12}:${m} ${H < 12 ? "AM" : "PM"}`;
};
const mk = (type, from, to, place = "") => ({ id: uid(), type, from, to, place });

const START = {
  Mon: [mk("hospital", "10:00", "12:00", "City Hospital"), mk("clinic", "15:00", "17:00", "Kiran Clinic"), mk("video", "18:00", "20:00")],
  Tue: [mk("hospital", "10:00", "12:00", "City Hospital"), mk("clinic", "15:00", "17:00", "Kiran Clinic"), mk("video", "18:00", "20:00")],
  Wed: [mk("clinic", "09:00", "13:00", "Kiran Clinic"), mk("video", "16:00", "19:00")],
  Thu: [mk("hospital", "10:00", "12:00", "City Hospital"), mk("clinic", "15:00", "17:00", "Kiran Clinic"), mk("video", "18:00", "20:00")],
  Fri: [mk("clinic", "09:00", "13:00", "Kiran Clinic"), mk("video", "16:00", "19:00")],
  Sat: [mk("video", "10:00", "13:00")],
  Sun: [],
};

/* Week overview bar: 6 AM to 10 PM */
const R0 = 6 * 60, R1 = 22 * 60;
function DayBar({ list }) {
  return (
    <div className={`${inset} relative h-4 flex-1 overflow-hidden`}>
      {list.map((s) => {
        const a = Math.max(mins(s.from), R0), b = Math.min(mins(s.to), R1);
        if (b <= a) return null;
        return (
          <i key={s.id} className={`absolute top-0.5 bottom-0.5 rounded-full ${TYPES[s.type].dot}`}
            style={{ left: `${((a - R0) / (R1 - R0)) * 100}%`, width: `${((b - a) / (R1 - R0)) * 100}%` }} />
        );
      })}
    </div>
  );
}

/* ---------- page ---------- */
export default function Availability({ toast }) {
  const [sched, setSched] = useState(START);
  const [day, setDay] = useState("Mon");
  const [dur, setDur] = useState(20);
  const [vFee, setVFee] = useState("500");
  const [pFee, setPFee] = useState("700");

  const list = sched[day];
  const setList = (d, l) => setSched({ ...sched, [d]: l });
  const upd = (id, patch) => setList(day, list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const add = (type) => {
    const last = list[list.length - 1];
    const from = last ? last.to : "09:00";
    const to = mins(from) + 120 > 23 * 60 ? "23:00" : `${String(Math.floor((mins(from) + 120) / 60)).padStart(2, "0")}:${String((mins(from) + 120) % 60).padStart(2, "0")}`;
    setList(day, [...list, mk(type, from, to)]);
  };
  const copyWeekdays = () => {
    const next = { ...sched };
    ["Mon", "Tue", "Wed", "Thu", "Fri"].forEach((d) => { next[d] = list.map((s) => ({ ...s, id: uid() })); });
    setSched(next); toast(`${day} schedule copied to Mon–Fri`);
  };

  const slots = (s) => Math.max(0, Math.floor((mins(s.to) - mins(s.from)) / dur));

  const save = () => {
    for (const d of DAYS) {
      const l = [...sched[d]].sort((a, b) => mins(a.from) - mins(b.from));
      for (let i = 0; i < l.length; i++) {
        if (mins(l[i].to) <= mins(l[i].from)) return toast(`${d}: end time must be after start time`);
        if (l[i].type !== "video" && !l[i].place.trim()) return toast(`${d}: add the ${TYPES[l[i].type].label.toLowerCase()} name`);
        if (i > 0 && mins(l[i].from) < mins(l[i - 1].to)) return toast(`${d}: two sessions overlap`);
      }
    }
    toast("Availability saved");
  };

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl">Availability</h1>
        <div className="text-[13px] text-t2">Add sessions for each day. Patients see video slots for Video and the place name for Clinic or Hospital.</div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_400px]">
        {/* ---------- Left: day editor ---------- */}
        <section className={`${neu} p-6`}>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            {DAYS.map((d) => (
              <Chip key={d} on={day === d} onClick={() => setDay(d)}>
                {d}{sched[d].length > 0 && <span className="ml-1.5 opacity-70">· {sched[d].length}</span>}
              </Chip>
            ))}
            <span className="flex-1" />
            <Btn variant="ghost" size="sm" disabled={!list.length} onClick={copyWeekdays}>Copy to Mon–Fri</Btn>
          </div>

          {!list.length && (
            <div className={`${inset} mb-4 p-6 text-center text-[13px] text-t2`}>
              Day off. Patients cannot book on {day}. Add a session below if you want to work.
            </div>
          )}

          <div className="grid gap-4">
            {list.map((s) => (
              <div key={s.id} className={`${inset} grid gap-4 p-4`}>
                <div className="flex flex-wrap items-center gap-3">
                  {Object.entries(TYPES).map(([k, t]) => (
                    <Chip key={k} sm on={s.type === k} onClick={() => upd(s.id, { type: k })}>{t.label}</Chip>
                  ))}
                  <span className="flex-1" />
                  <span className="text-[12px] text-t2">{slots(s)} slots · {dur} min each</span>
                  <Chip sm onClick={() => setList(day, list.filter((x) => x.id !== s.id))}>Remove</Chip>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1.6fr]">
                  <NeuInput label="From" type="time" value={s.from} onChange={(e) => upd(s.id, { from: e.target.value })} />
                  <NeuInput label="To" type="time" value={s.to} onChange={(e) => upd(s.id, { to: e.target.value })} />
                  {s.type === "video" ? (
                    <div className="flex items-end pb-3 text-[13px] text-t2">Online video call. No place needed.</div>
                  ) : (
                    <NeuInput label={s.type === "clinic" ? "Clinic name" : "Hospital name"} placeholder="Name and area"
                      value={s.place} onChange={(e) => upd(s.id, { place: e.target.value })} />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-navy">Add session</span>
            {Object.entries(TYPES).map(([k, t]) => (
              <Btn key={k} variant="ghost" size="sm" onClick={() => add(k)}>
                <i className={`mr-2 inline-block size-2.5 rounded-full align-middle ${t.dot}`} />{t.label}
              </Btn>
            ))}
          </div>
        </section>

        {/* ---------- Right: overview + settings ---------- */}
        <div className="grid gap-6">
          <section className={`${neu} p-6`}>
            <h3 className="mb-4 text-base">Week overview</h3>
            <div className="grid gap-3">
              {DAYS.map((d) => (
                <button key={d} onClick={() => setDay(d)} className="flex cursor-pointer items-center gap-3 text-left">
                  <b className={`w-9 text-[13px] ${day === d ? "text-navy" : "text-t2"}`}>{d}</b>
                  <DayBar list={sched[d]} />
                </button>
              ))}
            </div>
            <div className="mt-2 flex justify-between pl-12 text-[10px] text-t2"><span>6 AM</span><span>2 PM</span><span>10 PM</span></div>
            <div className="mt-4 flex flex-wrap gap-4 text-[12px] text-t2">
              {Object.values(TYPES).map((t) => (
                <span key={t.label} className="flex items-center gap-2"><i className={`size-2.5 rounded-full ${t.dot}`} />{t.label}</span>
              ))}
            </div>
          </section>

          <section className={`${neu} p-6`}>
            <h3 className="mb-4 text-base">Slots and fees</h3>
            <div className="mb-2 ml-1 text-xs font-semibold text-navy">Slot length</div>
            <div className="mb-5 flex items-center gap-3">
              {[15, 20, 30].map((m) => <Chip key={m} on={dur === m} onClick={() => setDur(m)}>{m} min</Chip>)}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <NeuInput label="Video fee (Rs)" inputMode="numeric" value={vFee} onChange={(e) => setVFee(e.target.value.replace(/\D/g, ""))} />
              <NeuInput label="Clinic / Hospital fee (Rs)" inputMode="numeric" value={pFee} onChange={(e) => setPFee(e.target.value.replace(/\D/g, ""))} />
            </div>
            <Btn className="mt-5 w-full" onClick={save}>Save changes</Btn>
          </section>
        </div>
      </div>
    </div>
  );
}