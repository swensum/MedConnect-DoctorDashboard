import { useEffect, useRef, useState } from "react";
import { CHAT0, init } from "../components/data";
import { Avatar, Btn, Chip, Tag, NeuInput, inset, neu } from "../components/ui";

/* Demo data. Move to components/data.js and load per patient later. */
const REPORTS = [
  { id: "r1", name: "MRI Brain", date: "12 Sep 2026", note: "No acute abnormality. Mild sinus mucosal thickening." },
  { id: "r2", name: "Previous prescription", date: "02 Aug 2026", note: "Sumatriptan 50mg, as needed. Advised hydration and sleep hygiene." },
  { id: "r3", name: "Discharge summary", date: "14 Jun 2026", note: "Observed for 24h for severe headache. Discharged stable." },
];
const LABS = [
  { id: "l1", name: "CBC", date: "28 Sep 2026", rows: [["Hemoglobin", "13.2 g/dL", "ok"], ["WBC", "11.8 x10³/µL", "bad"], ["Platelets", "250 x10³/µL", "ok"]] },
  { id: "l2", name: "Lipid profile", date: "28 Sep 2026", rows: [["Total cholesterol", "212 mg/dL", "bad"], ["HDL", "52 mg/dL", "ok"], ["LDL", "130 mg/dL", "bad"]] },
  { id: "l3", name: "Blood sugar", date: "28 Sep 2026", rows: [["Fasting glucose", "92 mg/dL", "ok"], ["HbA1c", "5.4 %", "ok"]] },
];

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const ICONS = {
  records: (<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></>),
  rx: (<><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M12 11v6M9 14h6" /></>),
};

/* round icon button with tooltip + optional badge */
function IconBtn({ icon, label, active, badge, onClick }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} aria-pressed={active}
      className={`relative grid size-11 shrink-0 cursor-pointer place-items-center rounded-full shadow-neu-s transition active:scale-95 active:shadow-press motion-reduce:transition-none ${
        active ? "bg-navy text-white" : "bg-bg text-navy"
      }`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-[22px]">
        {ICONS[icon]}
      </svg>
      {badge > 0 && (
        <i className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-bad text-[10px] font-bold not-italic text-white ring-2 ring-bg">{badge}</i>
      )}
    </button>
  );
}

const Close = ({ onClick }) => <Chip sm onClick={onClick}>Close</Chip>;

/* ---------- call screen (fills the right column, NOT fullscreen) ---------- */
function CallPanel({ call, patient, onEnd }) {
  const { kind, startedAt } = call;
  const [, tick] = useState(0), [mic, setMic] = useState(true), [cam, setCam] = useState(kind === "Video");
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const secs = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const ctl = (on) =>
    `grid size-11 cursor-pointer place-items-center rounded-full text-xs font-bold transition active:scale-95 ${on ? "bg-white/20 text-white" : "bg-white text-navy"}`;
  return (
    <section className={`${neu} flex h-full min-h-[440px] flex-col overflow-hidden`}>
      <div className="relative grid flex-1 place-items-center bg-navy text-white">
        <div className="text-center">
          <div className="mx-auto mb-3 grid size-20 place-items-center rounded-full bg-white/15 font-display text-2xl font-bold">{init(patient.name)}</div>
          <div className="font-display text-lg font-bold">{patient.name}</div>
          <div className="text-[13px] opacity-75">{kind} call · {fmt(secs)}</div>
        </div>
        {kind === "Video" && (
          <div className="absolute right-3 top-3 grid h-24 w-36 place-items-center rounded-xl bg-white/15 text-xs">
            {cam ? "You" : "Camera off"}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-3">
          <button className={ctl(mic)} onClick={() => setMic(!mic)} aria-pressed={!mic} aria-label="Toggle microphone">{mic ? "Mic" : "Muted"}</button>
          {kind === "Video" && <button className={ctl(cam)} onClick={() => setCam(!cam)} aria-pressed={!cam} aria-label="Toggle camera">{cam ? "Cam" : "Off"}</button>}
          <button onClick={onEnd} className="grid h-11 cursor-pointer place-items-center rounded-full bg-bad px-5 text-sm font-bold text-white transition active:scale-95">End</button>
        </div>
      </div>
    </section>
  );
}

/* ---------- reports + lab tests ---------- */
function ReportsPanel({ onClose }) {
  const [tab, setTab] = useState("reports"), [sel, setSel] = useState(null);
  const list = tab === "reports" ? REPORTS : LABS;
  const item = list.find((x) => x.id === sel);
  const switchTab = (t) => { setTab(t); setSel(null); };
  const tabCls = (on) =>
    `flex-1 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors ${on ? "bg-navy text-white" : "text-navy/70"}`;

  return (
    <section className={`${neu} flex h-full min-h-[440px] flex-col p-5`}>
      <div className="mb-3 flex shrink-0 items-center gap-3">
        <h3 className="text-base">Reports & lab tests</h3>
        <Tag tone="nv">{REPORTS.length + LABS.length} files</Tag>
        <span className="flex-1" />
        <Close onClick={onClose} />
      </div>
      <div className="mb-3 flex shrink-0 gap-1 rounded-full bg-bg p-1 shadow-neu-s">
        <button className={tabCls(tab === "reports")} onClick={() => switchTab("reports")}>Reports</button>
        <button className={tabCls(tab === "labs")} onClick={() => switchTab("labs")}>Lab tests</button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {!item ? (
          <div className="grid gap-2.5">
            {list.map((x) => (
              <button key={x.id} onClick={() => setSel(x.id)} className={`${inset} flex cursor-pointer items-center gap-3 px-3.5 py-2.5 text-left`}>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{x.name}</div>
                  <div className="text-[12px] text-t2">{x.date}</div>
                </div>
                {x.rows?.some((r) => r[2] === "bad") && <Tag tone="bad">Abnormal</Tag>}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Chip sm onClick={() => setSel(null)}>Back</Chip>
              <div className="min-w-0 flex-1 truncate font-semibold">{item.name}</div>
              <span className="text-[12px] text-t2">{item.date}</span>
            </div>
            {item.rows ? (
              <div className={`${inset} divide-y divide-muted/40 px-3.5`}>
                {item.rows.map(([k, v, s]) => (
                  <div key={k} className="flex items-center gap-3 py-2.5 text-[13px]">
                    <span className="flex-1 text-t2">{k}</span>
                    <b className={s === "bad" ? "text-bad" : "text-navy"}>{v}</b>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`${inset} p-3.5 text-[13px] leading-relaxed`}>{item.note}</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- e-prescription ---------- */
function RxPanel({ rx, setRx, nd, setNd, ns, setNs, toast, onClose }) {
  return (
    <section className={`${neu} flex h-full min-h-[440px] flex-col p-5`}>
      <div className="mb-3.5 flex shrink-0 items-center gap-3">
        <h3 className="text-base">E-prescription</h3>
        <span className="flex-1" />
        {onClose && <Close onClick={onClose} />}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {rx.map((r, i) => (
          <div key={i} className={`${inset} mb-2.5 flex items-center gap-3 px-3.5 py-2.5`}>
            <div className="flex-1"><div className="font-semibold">{r.d}</div><div className="text-[13px] text-t2">{r.s}</div></div>
            <Chip sm onClick={() => setRx(rx.filter((_, j) => j !== i))}>Remove</Chip>
          </div>
        ))}
        <div className="grid gap-3">
          <NeuInput placeholder="Medicine and dose" value={nd} onChange={(e) => setNd(e.target.value)} />
          <NeuInput placeholder="Instructions" value={ns} onChange={(e) => setNs(e.target.value)} />
        </div>
      </div>
      <div className="mt-3.5 flex shrink-0 items-center gap-3">
        <Btn variant="ghost" size="sm" disabled={!nd} onClick={() => { setRx([...rx, { d: nd, s: ns || "As directed" }]); setNd(""); setNs(""); }}>Add medicine</Btn>
        <span className="flex-1" />
        <Btn size="sm" disabled={!rx.length} onClick={() => toast("Prescription sent to patient")}>Send prescription</Btn>
      </div>
    </section>
  );
}

/* ---------- page ---------- */
export default function Consult({ patient, toast }) {
  const [msgs, setMsgs] = useState(CHAT0), [txt, setTxt] = useState("");
  const [rx, setRx] = useState([{ d: "Sumatriptan 50mg", s: "1 tablet at onset, max 2/day" }]), [nd, setNd] = useState(""), [ns, setNs] = useState("");
  const [call, setCall] = useState(null);   // null | "Video" | "Voice"
  const [panel, setPanel] = useState(null); // null | "records" | "rx"  (floats over the right column)
  const box = useRef(null);

  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [msgs]);
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setPanel(null);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);

  const send = () => { if (!txt.trim()) return; setMsgs([...msgs, { me: 1, t: txt.trim() }]); setTxt(""); };
  const start = (k) => { setCall(k); toast(`${k} call started (demo)`); };
  const end = () => { setCall(null); setPanel((p) => (p === "rx" ? null : p)); toast("Call ended"); };
  const toggle = (p) => setPanel(panel === p ? null : p);

  const rxProps = { rx, setRx, nd, setNd, ns, setNs, toast };

  return (
    <div className="grid gap-[22px]">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar>{init(patient.name)}</Avatar>
        <div>
          <h1 className="text-[22px]">{patient.name}</h1>
          <div className="text-[13px] text-t2">{patient.age} yrs · {patient.reason}</div>
        </div>
        <span className="flex-1" />
        <IconBtn icon="records" label="Reports & lab tests" active={panel === "records"} badge={REPORTS.length + LABS.length} onClick={() => toggle("records")} />
        {/* Prescription turns into an icon only while a call is running */}
        {call && <IconBtn icon="rx" label="E-prescription" active={panel === "rx"} badge={rx.length} onClick={() => toggle("rx")} />}
        <Btn variant="ghost" size="sm" disabled={!!call} onClick={() => start("Video")}>Video</Btn>
        <Btn variant="ghost" size="sm" disabled={!!call} onClick={() => start("Voice")}>Voice</Btn>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-[22px]">
        {/* Chat */}
        <div className={neu}>
          <div ref={box} className="flex h-[340px] flex-col gap-3 overflow-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={`max-w-[75%] rounded-[14px] px-3.5 py-2.5 ${m.me ? "self-end bg-navy text-white" : "self-start bg-bg shadow-bubble"}`}>{m.t}</div>
            ))}
          </div>
          <div className="flex items-end gap-3 p-4">
            <NeuInput area className="flex-1" placeholder="Type a message" value={txt} onChange={(e) => setTxt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
            <Btn size="lg" disabled={!txt.trim()} onClick={send}>Send</Btn>
          </div>
        </div>

        {/* Right column: call screen replaces the prescription; panels float on top */}
        <div className="relative min-h-[440px]">
          {call ? <CallPanel kind={call} patient={patient} onEnd={end} /> : <RxPanel {...rxProps} />}

          {panel && (
            <div className="absolute inset-0 z-10 shadow-neu">
              {panel === "records"
                ? <ReportsPanel onClose={() => setPanel(null)} />
                : <RxPanel {...rxProps} onClose={() => setPanel(null)} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}