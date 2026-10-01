import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { init } from "../components/data";
import { Avatar, Btn, Chip, Tag, neu } from "../components/ui";

export default function Appointments({ appts, setAppts, toast }) {
  const nav = useNavigate();
  const [f, setF] = useState("all");
  const set = (id, status, msg) => { setAppts(appts.map((a) => (a.id === id ? { ...a, status } : a))); toast(msg); };
  const list = appts.filter((a) => f === "all" || a.status === f);
  return (
    <div className="grid gap-[22px]">
      <h1 className="text-2xl">Appointments</h1>
      <div className="flex flex-wrap items-center gap-3">
        {["all", "pending", "upcoming", "declined"].map((k) => (
          <Chip key={k} on={f === k} onClick={() => setF(k)}>{k[0].toUpperCase() + k.slice(1)}</Chip>
        ))}
      </div>
      {!list.length && <div className={`${neu} p-5 text-[13px] text-t2`}>No appointments in this view yet.</div>}
      {list.map((a) => (
        <div key={a.id} className={`${neu} flex flex-wrap items-center gap-3 p-5`}>
          <Avatar>{init(a.name)}</Avatar>
          <div className="min-w-40 flex-1">
            <div className="font-semibold">{a.name}, {a.age}</div>
            <div className="text-[13px] text-t2">{a.reason}</div>
          </div>
          <Tag tone="nv">{a.type} · {a.time}</Tag>
          <Tag tone={a.status === "upcoming" ? "ok" : a.status === "declined" ? "bad" : ""}>{a.status}</Tag>
          {a.status === "pending" && (
            <>
              <Btn size="sm" onClick={() => set(a.id, "upcoming", "Appointment accepted")}>Accept</Btn>
              <Btn variant="bad" size="sm" onClick={() => set(a.id, "declined", "Appointment declined")}>Decline</Btn>
            </>
          )}
          {a.status === "upcoming" && <Btn size="sm" onClick={() => nav("/consult/" + a.id)}>Start consult</Btn>}
        </div>
      ))}
    </div>
  );
}