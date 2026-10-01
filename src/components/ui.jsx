import { useState } from "react";

/* Surfaces */
export const neu = "bg-bg rounded-[18px] shadow-neu";
export const neuS = "bg-bg rounded-xl shadow-neu-s";
export const inset = "bg-bg rounded-[14px] shadow-inset";
export const fieldBase =
  "flex items-center gap-2.5 min-h-[52px] rounded-[14px] bg-bg shadow-field transition-shadow motion-reduce:transition-none focus-within:shadow-field-focus";

/** Put your logo at /public/logo.png. Falls back to "Rx" if missing. */
export function Logo({ size = 44 }) {
  const [bad, setBad] = useState(false);
  if (bad)
    return (
      <div className="grid shrink-0 place-items-center rounded-xl bg-navy font-display text-[15px] font-bold text-white" style={{ width: size, height: size }}>
        Rx
      </div>
    );
  return <img className="shrink-0 object-contain" src="/logo.png" alt="MedConnect" width={size} height={size} onError={() => setBad(true)} />;
}

/** Neumorphic text input. `area` = multi-line, `prefix` = e.g. +977. */
export function NeuInput({ label, prefix, area, className = "", ...rest }) {
  const Tag = area ? "textarea" : "input";
  return (
    <div className={className}>
      {label && <div className="mb-2 ml-1 text-xs font-semibold text-navy">{label}</div>}
      <div className={`${fieldBase} px-4`}>
        {prefix && <span className="border-r border-muted/70 pr-2.5 font-display text-[15px] font-bold text-navy">{prefix}</span>}
        <Tag
          aria-label={label || rest.placeholder}
          rows={area ? 2 : undefined}
          className="min-w-0 flex-1 resize-none border-0 bg-transparent py-3.5 text-base leading-[1.4] text-navy caret-navy outline-0 placeholder:text-t2/80"
          {...rest}
        />
      </div>
    </div>
  );
}

const BTN = {
  primary: "bg-navy text-white shadow-neu active:shadow-press",
  ghost: "bg-bg text-navy shadow-neu-s",
  bad: "bg-bg text-bad shadow-neu-s",
};
const SIZE = {
  sm: "h-9 px-3.5 rounded-xl text-[13px]",
  md: "h-12 px-[22px] rounded-2xl",
  lg: "h-[52px] px-[22px] rounded-2xl",
};
export function Btn({ variant = "primary", size = "md", className = "", ...p }) {
  return (
    <button
      className={`cursor-pointer font-display font-bold transition motion-reduce:transition-none active:scale-[.97] disabled:cursor-default disabled:bg-bg disabled:text-navy/40 disabled:shadow-none disabled:active:scale-100 ${SIZE[size]} ${BTN[variant]} ${className}`}
      {...p}
    />
  );
}

export function Chip({ on, sm, className = "", ...p }) {
  return (
    <button
      className={`cursor-pointer rounded-xl px-4 text-[13px] font-semibold ${sm ? "h-[30px]" : "h-[38px]"} ${on ? "bg-navy text-white shadow-chip-on" : "bg-bg text-navy shadow-neu-s"} ${className}`}
      {...p}
    />
  );
}

const TONE = { ok: "text-ok", bad: "text-bad", nv: "text-navy", "": "" };
export const Tag = ({ tone = "", children }) => (
  <span className={`rounded-full bg-bg px-2.5 py-[3px] text-[11px] font-semibold shadow-tag ${TONE[tone]}`}>{children}</span>
);

export const Avatar = ({ children }) => (
  <div className="grid size-[42px] shrink-0 place-items-center rounded-full font-display text-sm font-bold text-navy shadow-av">{children}</div>
);