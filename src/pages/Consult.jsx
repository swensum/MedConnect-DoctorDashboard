import { useEffect, useRef, useState } from "react";
import { CHAT0, init } from "../components/data";
import { Avatar, Btn, Chip, NeuInput, inset, neu } from "../components/ui";

export default function Consult({ patient, toast }) {
  const [msgs, setMsgs] = useState(CHAT0), [txt, setTxt] = useState("");
  const [rx, setRx] = useState([{ d: "Sumatriptan 50mg", s: "1 tablet at onset, max 2/day" }]), [nd, setNd] = useState(""), [ns, setNs] = useState("");
  const box = useRef(null);
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [msgs]);
  const send = () => { if (!txt.trim()) return; setMsgs([...msgs, { me: 1, t: txt.trim() }]); setTxt(""); };
  return (
    <div className="grid gap-[22px]">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar>{init(patient.name)}</Avatar>
        <div>
          <h1 className="text-[22px]">{patient.name}</h1>
          <div className="text-[13px] text-t2">{patient.age} yrs · {patient.reason}</div>
        </div>
        <span className="flex-1" />
        <Btn variant="ghost" size="sm" onClick={() => toast("Starting video call (demo)")}>Video</Btn>
        <Btn variant="ghost" size="sm" onClick={() => toast("Starting voice call (demo)")}>Voice</Btn>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-[22px]">
        <div className={neu}>
          <div ref={box} className="flex h-[340px] flex-col gap-3 overflow-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={`max-w-[75%] rounded-[14px] px-3.5 py-2.5 ${m.me ? "self-end bg-navy text-white" : "self-start bg-bg shadow-bubble"}`}>{m.t}</div>
            ))}
          </div>
          <div className="flex items-end gap-3 p-4">
            {/* Enter sends, Shift+Enter adds a new line */}
            <NeuInput area className="flex-1" placeholder="Type a message" value={txt} onChange={(e) => setTxt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
            <Btn size="lg" disabled={!txt.trim()} onClick={send}>Send</Btn>
          </div>
        </div>
        <div className={`${neu} p-5`}>
          <h3 className="mb-3.5 text-base">E-prescription</h3>
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
          <div className="mt-3.5 flex items-center gap-3">
            <Btn variant="ghost" size="sm" disabled={!nd} onClick={() => { setRx([...rx, { d: nd, s: ns || "As directed" }]); setNd(""); setNs(""); }}>Add medicine</Btn>
            <span className="flex-1" />
            <Btn size="sm" disabled={!rx.length} onClick={() => toast("Prescription sent to patient")}>Send prescription</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}