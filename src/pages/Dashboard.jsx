import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ACTIVITY, EARN, WEEK, init } from "../components/data";
import { Avatar, Btn, Tag, inset, neu } from "../components/ui";

/* ---------- chart helpers (pure SVG/CSS, fill their parent) ---------- */
function Spark({ data, up = true }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / (max - min || 1)) * 24}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" className={`h-7 w-20 shrink-0 ${up ? "stroke-ok" : "stroke-bad"}`} preserveAspectRatio="none" fill="none">
      <polyline points={pts} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function AreaChart({ data }) {
  const vals = data.map((d) => d[1]), max = Math.max(...vals) * 1.15;
  const line = vals.map((v, i) => `${(i / (vals.length - 1)) * 600},${200 - (v / max) * 190}`).join(" ");
  return (
    <div className="flex h-full min-h-40 flex-col">
      <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="min-h-0 flex-1">
        {[0, 1, 2, 3].map((i) => <line key={i} x1="0" x2="600" y1={i * 66} y2={i * 66} className="stroke-muted/50" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />)}
        <polygon points={`0,200 ${line} 600,200`} className="fill-navy/10" />
        <polyline points={line} fill="none" className="stroke-navy" strokeWidth="3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-2 flex justify-between px-1 text-[11px] text-t2">{data.map((d) => <span key={d[0]}>{d[0]}</span>)}</div>
    </div>
  );
}

function Donut({ parts }) {
  const total = parts.reduce((s, p) => s + p.v, 0) || 1, C = 2 * Math.PI * 40;
  let off = 0;
  return (
    <div className="flex h-full flex-wrap items-center justify-center gap-5">
      <div className="relative size-28 shrink-0">
        <svg viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" className="stroke-muted/30" strokeWidth="14" />
          {parts.map((p) => {
            const len = (p.v / total) * C;
            const el = <circle key={p.k} cx="50" cy="50" r="40" fill="none" className={p.cls} strokeWidth="14" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} />;
            off += len; return el;
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div><b className="block font-display text-xl text-navy">{total}</b><span className="text-[10px] text-t2">total</span></div>
        </div>
      </div>
      <div className="grid gap-2 text-[13px]">
        {parts.map((p) => (
          <div key={p.k} className="flex items-center gap-2.5">
            <i className={`size-3 rounded-full ${p.dot}`} /><span className="w-11 text-t2">{p.k}</span><b className="text-navy">{p.v}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bars({ data }) {
  const max = Math.max(...data.map((d) => d[1]));
  return (
    <div className="flex h-full min-h-40 items-end gap-2.5">
      {data.map(([d, v], i) => (
        <div key={d} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
          <span className="text-[11px] font-semibold text-navy">{v}</span>
          <div className={`${inset} flex w-full flex-1 items-end p-1`}>
            <div className={`w-full rounded-md ${i === 3 ? "bg-navy" : "bg-muted"}`} style={{ height: `${(v / max) * 100}%` }} />
          </div>
          <span className="text-[11px] text-t2">{d}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- cards ---------- */
const Card = ({ title, action, children, className = "" }) => (
  <section className={`${neu} flex min-h-0 flex-col overflow-hidden p-5 ${className}`}>
    <div className="mb-3 flex shrink-0 items-center gap-3">
      <h3 className="text-base">{title}</h3><span className="flex-1" />{action}
    </div>
    <div className="min-h-0 flex-1 overflow-auto">{children}</div>
  </section>
);

function DoctorCard() {
  const [bad, setBad] = useState(false);
  return (
    <section className={`${neu} relative min-h-[240px] overflow-hidden`}>
      {bad ? (
        <div className="absolute inset-0 grid place-items-center bg-navy font-display text-6xl font-bold text-white">KP</div>
      ) : (
        <img src="/doctor1.jpg" alt="Dr. Kiran Poudel" onError={() => setBad(true)} className="absolute inset-0 size-full object-cover object-top" />
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-navy/85 to-transparent p-4 pt-16 text-white">
        <div>
          <div className="font-display text-lg font-bold">Dr. Kiran Poudel</div>
          <div className="text-[13px] opacity-90">General physician</div>
        </div>
        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-navy">Rs 500</span>
      </div>
    </section>
  );
}

/* ---------- page ---------- */
export default function Dashboard({ appts }) {
  const nav = useNavigate();
  const up = appts.filter((a) => a.status === "upcoming"), pen = appts.filter((a) => a.status === "pending");
  const count = (t) => appts.filter((a) => a.type === t).length;
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  const tone = { ok: "bg-ok", bad: "bg-bad", nv: "bg-white" };
  const dot = (s) => (s === "upcoming" ? "bg-ok" : s === "declined" ? "bg-bad" : "bg-muted");

  const stats = [
    ["Today", appts.length, [8, 11, 9, 14, 12, 15, appts.length], true],
    ["Pending", pen.length, [2, 4, 3, 5, 3, 2, pen.length], false],
    ["Earned", "Rs 18.4k", EARN.map((e) => e[1]), true],
    ["Rating", "4.8", [4.5, 4.6, 4.6, 4.7, 4.7, 4.8, 4.8], true],
    ["Patients", "342", [280, 295, 305, 318, 326, 335, 342], true],
  ];

  return (
    <div className="grid gap-5 xl:h-full xl:grid-rows-[auto_minmax(0,1fr)]">
      {/* Top strip: greeting + stats */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div>
          <div className="text-[13px] text-t2">{today}</div>
          <h1 className="text-2xl">Good morning, Dr. Kiran</h1>
        </div>
        <span className="flex-1" />
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 xl:flex xl:w-auto">
          {stats.map(([l, v, spark, good]) => (
            <div key={l} className={`${neu} flex items-center gap-3 px-4 py-2.5`}>
              <div>
                <div className="text-[11px] text-t2">{l}</div>
                <b className="block font-display text-xl font-bold leading-tight text-navy">{v}</b>
              </div>
              <Spark data={spark} up={good} />
            </div>
          ))}
        </div>
      </div>

      {/* Bento grid: fits the screen on xl */}
      <div className="grid gap-5 xl:min-h-0 xl:grid-cols-12 xl:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="xl:col-span-3 xl:col-start-1 xl:row-start-1 xl:min-h-0 [&>section]:h-full">
          <DoctorCard />
        </div>

        <Card title="Next up" className="xl:col-span-3 xl:col-start-1 xl:row-start-2"
          action={<Btn variant="ghost" size="sm" onClick={() => nav("/consult")}>Start</Btn>}>
          {!up.length && <div className="text-[13px] text-t2">No confirmed appointments.</div>}
          {up.slice(0, 4).map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-2">
              <Avatar>{init(a.name)}</Avatar>
              <div className="min-w-0 flex-1"><div className="truncate font-semibold">{a.name}</div><div className="truncate text-[12px] text-t2">{a.reason}</div></div>
              <Tag tone="nv">{a.time}</Tag>
            </div>
          ))}
        </Card>

        <Card title="Earnings" className="xl:col-span-3 xl:col-start-4 xl:row-start-1" action={<Tag tone="ok">+18%</Tag>}>
          <AreaChart data={EARN} />
        </Card>

        <Card title="Consultations this week" className="xl:col-span-3 xl:col-start-7 xl:row-start-1"
          action={<Tag tone="nv">{WEEK.reduce((s, d) => s + d[1], 0)} total</Tag>}>
          <Bars data={WEEK} />
        </Card>

        <Card title="Today's timeline" className="xl:col-span-4 xl:col-start-4 xl:row-start-2"
          action={<Btn variant="ghost" size="sm" onClick={() => nav("/appointments")}>See all</Btn>}>
          <div className="grid h-full grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-3">
            {appts.map((a) => (
              <div key={a.id} className={`${inset} flex flex-col justify-between gap-1 p-3`}>
                <div className="flex items-center gap-2">
                  <i className={`size-2.5 shrink-0 rounded-full ${dot(a.status)}`} />
                  <span className="text-[12px] font-bold text-navy">{a.time}</span>
                </div>
                <div className="truncate text-[13px] font-semibold">{a.name}</div>
                <div className="text-[11px] text-t2">{a.type}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Types" className="xl:col-span-2 xl:col-start-8 xl:row-start-2">
          <Donut parts={[
            { k: "Video", v: count("Video"), cls: "stroke-navy", dot: "bg-navy" },
            { k: "Chat", v: count("Chat"), cls: "stroke-muted", dot: "bg-muted" },
            { k: "Voice", v: count("Voice"), cls: "stroke-ok", dot: "bg-ok" },
          ]} />
        </Card>

        {/* Tall dark card (like the onboarding card in the reference) */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-[18px] bg-navy p-5 text-white shadow-neu xl:col-span-3 xl:col-start-10 xl:row-span-2 xl:row-start-1">
          <div className="mb-3 flex shrink-0 items-center gap-3">
            <h3 className="font-display text-base font-bold text-white">Requests awaiting reply</h3>
            <span className="flex-1" />
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold">{pen.length}</span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            {!pen.length && <div className="text-[13px] text-white/70">All caught up. New requests appear here.</div>}
            {pen.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-2">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15 font-display text-sm font-bold">{init(a.name)}</div>
                <div className="min-w-0 flex-1"><div className="truncate font-semibold">{a.name}</div><div className="text-[12px] text-white/70">{a.type} · {a.time}</div></div>
                <button onClick={() => nav("/appointments")} className="cursor-pointer rounded-xl bg-white px-3 py-1.5 text-[13px] font-bold text-navy transition active:scale-95">Review</button>
              </div>
            ))}

            <div className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-white/60">Recent activity</div>
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-1.5">
                <i className={`mt-1.5 size-2 shrink-0 rounded-full ${tone[a.tone]}`} />
                <span className="flex-1 text-[13px] leading-snug">{a.t}</span>
                <span className="shrink-0 text-[11px] text-white/60">{a.time}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}