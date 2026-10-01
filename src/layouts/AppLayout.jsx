import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Logo } from "../components/ui";

const Icon = ({ children, cls = "size-[22px]" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`${cls} shrink-0`}>
    {children}
  </svg>
);

const ICONS = {
  home: (<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>),
  calendar: (<><rect x="3" y="4" width="18" height="18" rx="2.5" /><path d="M16 2v4M8 2v4M3 10h18" /></>),
  chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  clock: (<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>),
  bell: (<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>),
  logout: (<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>),
};

const NAV = [
  ["/", "Home", "home"],
  ["/appointments", "Appointments", "calendar"],
  ["/consult", "Consults", "chat"],
  ["/availability", "Availability", "clock"],
];

const roundBtn =
  "relative grid size-11 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full bg-bg text-navy shadow-neu-s transition active:scale-95 active:shadow-press motion-reduce:transition-none";

/** Doctor photo at /public/doctor.jpg. Falls back to initials. */
function DocPhoto({ cls = "size-full" }) {
  const [bad, setBad] = useState(false);
  if (bad) return <span className="grid size-full place-items-center bg-navy font-display text-sm font-bold text-white">KP</span>;
  return <img src="/doctor1.jpg" alt="Dr. Kiran Poudel" className={`${cls} object-cover object-top`} onError={() => setBad(true)} />;
}

function ProfileMenu({ onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button className={roundBtn} onClick={() => setOpen(!open)} aria-label="Profile menu" aria-expanded={open}>
        <DocPhoto />
      </button>
      {open && (
        <div className="absolute right-0 top-14 z-20 w-60 rounded-[18px] bg-bg p-3 shadow-neu" role="menu">
          <div className="flex items-center gap-3 p-2">
            <div className="size-11 shrink-0 overflow-hidden rounded-full shadow-av"><DocPhoto /></div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-bold text-navy">Dr. Kiran Poudel</div>
              <div className="text-[11px] text-t2">General physician</div>
            </div>
          </div>
          <div className="my-2 h-px bg-muted/50" />
          <button role="menuitem" onClick={onLogout}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-bad transition-colors hover:bg-bad/10">
            <Icon cls="size-5">{ICONS.logout}</Icon>Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function AppLayout({ onLogout }) {
  return (
    <div className="flex h-screen flex-col">
      {/* Top bar: no background container */}
     <header className="z-10 flex shrink-0 items-center gap-3 px-4 pb-6 pt-3 min-[821px]:px-8 min-[821px]:pb-8 min-[821px]:pt-4">
        <div className="flex items-center gap-3">
          <Logo size={42} />
          <span className="font-display text-xl font-bold tracking-tight text-navy">MedConnect</span>
        </div>

        <span className="flex-1" />

        <nav className="hidden items-center gap-1 rounded-full bg-bg p-1.5 shadow-neu-s min-[821px]:flex" aria-label="Main">
          {NAV.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"}
              className={({ isActive }) =>
                `cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition-all motion-reduce:transition-none ${
                  isActive ? "bg-navy text-white shadow-chip-on" : "text-navy/70 hover:text-navy"
                }`}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 min-[821px]:ml-2">
          <button className={roundBtn} aria-label="Notifications">
            <Icon>{ICONS.bell}</Icon>
            <i className="absolute right-2.5 top-2.5 size-2.5 rounded-full bg-bad ring-2 ring-bg" />
          </button>
          <ProfileMenu onLogout={onLogout} />
        </div>
      </header>

      <main className="min-h-0 min-w-0 flex-1 overflow-auto px-4 pb-[100px] min-[821px]:px-8 min-[821px]:pb-6"><Outlet /></main>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-3.5 bottom-3.5 z-[5] flex justify-around rounded-[18px] bg-bg p-2 shadow-neu min-[821px]:hidden" aria-label="Main mobile">
        {NAV.map(([to, label, icon]) => (
          <NavLink key={to} to={to} end={to === "/"} aria-label={label}
            className={({ isActive }) =>
              `flex cursor-pointer items-center gap-2 rounded-[14px] px-3.5 py-3 font-semibold transition-colors ${
                isActive ? "bg-navy text-white shadow-neu-s" : "text-navy/70"
              }`}>
            {({ isActive }) => (<><Icon>{ICONS[icon]}</Icon>{isActive && <span>{label}</span>}</>)}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}