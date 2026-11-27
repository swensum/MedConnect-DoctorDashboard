import { useEffect, useRef, useState } from "react";
import { api, supabase } from "../supabase";
import { Btn, Chip, Logo, NeuInput, inset, neu } from "../components/ui";

const SPECS = ["General physician", "Cardiologist", "Dermatologist", "Pediatrician", "Gynecologist", "Orthopedic", "Neurologist", "Psychiatrist", "Dentist", "Other"];
const MAX = 10 * 1024 * 1024;

const Ico = ({ children, cls = "size-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`${cls} shrink-0`}>{children}</svg>
);
const CHECK = <path d="M5 12l5 5 9-9" />;
const size = (b) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

const Spin = ({ cls = "size-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${cls} shrink-0 animate-spin motion-reduce:animate-none`} aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/* ---------- upload tile: sends the file to a private Supabase bucket ---------- */
const MIME = { pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png" };

function UploadTile({ kind, label, sub, file, onFile, toast, required }) {
  const ref = useRef(null);
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);

  const take = async (f) => {
    if (!f || uploading) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!MIME[ext]) return toast("Use a PDF, JPG or PNG file");
    if (f.size > MAX) return toast("File must be under 10 MB");

    setUploading(true);
    try {
      // 1. ask our backend for permission and a one-time upload link
      const { path, token } = await api("/kyc/upload-url", {
        method: "POST",
        body: JSON.stringify({ kind, fileName: f.name, contentType: MIME[ext], size: f.size }),
      });
      // 2. send the file straight to the private bucket
      const { error } = await supabase.storage
        .from("kyc-documents")
        .uploadToSignedUrl(path, token, f, { contentType: MIME[ext] });
      if (error) throw error;
      // 3. tell our backend the upload finished, so it saves the path
      await api("/kyc/documents", { method: "POST", body: JSON.stringify({ kind, path, fileName: f.name }) });
      onFile({ name: f.name, size: f.size }); // only set AFTER the whole upload succeeded
    } catch (e) {
      toast(e.message || "Upload failed");
    }
    setUploading(false);
  };

  const remove = async () => {
    try {
      await api(`/kyc/documents/${kind}`, { method: "DELETE" });
      onFile(null);
    } catch (e) {
      toast(e.message);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files[0]); }}
      className={`${inset} grid gap-3 p-4 transition motion-reduce:transition-none ${drag ? "ring-2 ring-navy/40" : ""}`}>
      <div className="flex items-center gap-4">
        <div className={`grid size-12 shrink-0 place-items-center rounded-xl ${file && !uploading ? "bg-navy text-white" : "bg-bg text-navy shadow-neu-s"}`}>
          {uploading ? <Spin cls="size-5" />
            : <Ico cls="size-6">{file ? CHECK : <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />}</Ico>}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-navy">{label} {required && <span className="text-[11px] font-semibold text-t2">· Required</span>}</div>
          <div className="truncate text-[12px] text-t2">
            {uploading ? "Uploading…" : file ? `${file.name} · ${size(file.size)}` : sub || "PDF, JPG or PNG · max 10 MB"}
          </div>
        </div>
        <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { take(e.target.files[0]); e.target.value = ""; }} />
        {file && !uploading && <Chip sm onClick={remove}>Remove</Chip>}
        <Btn variant="ghost" size="sm" disabled={uploading} onClick={() => ref.current.click()}>{file ? "Change" : "Upload"}</Btn>
      </div>
      {uploading && (
        <div className="h-2 overflow-hidden rounded-full bg-bg shadow-inset" role="progressbar" aria-label={`Uploading ${label}`}>
          <div className="h-full w-1/3 rounded-full bg-navy animate-[load_2.4s_ease-in-out_infinite] motion-reduce:animate-none" />
        </div>
      )}
    </div>
  );
}

/* ---------- status visuals ---------- */
function PulseIcon({ children }) {
  return (
    <div className="relative mx-auto grid size-28 place-items-center">
      <i className="absolute inset-0 rounded-full bg-navy/15 animate-ring motion-reduce:animate-none" />
      <i className="absolute inset-0 rounded-full bg-navy/10 animate-ring [animation-delay:.8s] motion-reduce:animate-none" />
      <div className="relative grid size-24 place-items-center rounded-full bg-bg text-navy shadow-neu"><Ico cls="size-10">{children}</Ico></div>
    </div>
  );
}
const SuccessCheck = () => (
  <div className="relative mx-auto grid size-28 place-items-center">
    <i className="absolute inset-0 rounded-full bg-navy/15 animate-ring motion-reduce:animate-none" />
    <div className="relative grid size-24 place-items-center rounded-full bg-navy text-white shadow-neu animate-pop motion-reduce:animate-none"><Ico cls="size-12">{CHECK}</Ico></div>
  </div>
);

function Timeline({ approved }) {
  const labels = ["Submitted", "Under review", "Approved"];
  const active = approved ? 3 : 1;
  return (
    <div className="mx-auto flex w-full max-w-md items-start">
      {labels.map((l, i) => {
        const done = i < active, cur = !approved && i === 1;
        return (
          <div key={l} className="flex flex-1 items-start last:flex-none">
            <div className="flex w-20 flex-col items-center gap-2">
              <div className={`grid size-8 place-items-center rounded-full ${done || cur ? "bg-navy text-white shadow-neu-s" : "bg-bg shadow-inset"}`}>
                {done ? <Ico cls="size-4">{CHECK}</Ico> : cur ? <Spin cls="size-4" /> : null}
              </div>
              <span className={`text-[12px] ${done || cur ? "font-bold text-navy" : "text-t2"}`}>{l}</span>
            </div>
            {i < 2 && <div className={`mt-4 h-0.5 flex-1 ${i < active - 1 ? "bg-navy" : "bg-muted/60"}`} />}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- page ---------- */
export default function Kyc({ phone, toast, onApproved, onLogout, status, rejectionReason, onRefresh }) {
  const [stage, setStage] = useState(status === "PENDING" ? "review" : "form"); // form | submitted | review
  const approved = status === "APPROVED";
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [name, setName] = useState("");
  const [spec, setSpec] = useState(null);
  const [other, setOther] = useState("");
  const [lic, setLic] = useState("");
  const [exp, setExp] = useState("");
  const [fee, setFee] = useState("");
  const [fLic, setFLic] = useState(null);
  const [fDeg, setFDeg] = useState(null);
  const [fClinic, setFClinic] = useState(null);

  const checks = [
    ["Full name", name.trim().length >= 2],
    ["Specialization", !!spec && (spec !== "Other" || !!other.trim())],
    ["License number", !!lic.trim()],
    ["Experience", !!exp.trim()],
    ["Medical license file", !!fLic],
    ["Degree certificate file", !!fDeg],
  ];
  const doneCount = checks.filter((c) => c[1]).length;
  const pct = Math.round((doneCount / checks.length) * 100);
  const valid = doneCount === checks.length;

  // Save the form to our backend (POST /kyc). Status becomes PENDING in the database.
  // The files were already uploaded and recorded by the upload tiles.
  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    try {
      await api("/kyc", {
        method: "POST",
        body: JSON.stringify({
          fullName: name.trim(),
          specialization: spec === "Other" ? other.trim() : spec,
          licenseNo: lic.trim(),
          experienceYears: Number(exp),
          fee: fee ? Number(fee) : undefined, // undefined is dropped from the JSON
        }),
      });
      await onRefresh().catch(() => {}); // pull the new PENDING status into the app
      setStage("submitted");
    } catch (e) {
      toast(e.message);
    }
    setBusy(false);
  };

  useEffect(() => {
    if (stage !== "submitted") return;
    const t = setTimeout(() => setStage("review"), 2200);
    return () => clearTimeout(t);
  }, [stage]);

  // If an admin rejects while we wait, go back to the form (the reason shows at the top).
  useEffect(() => {
    if (status === "REJECTED") setStage("form");
  }, [status]);

  // Polling: while waiting for review, ask the server every 10 s and when the tab regains focus.
  const refreshRef = useRef(onRefresh);
  refreshRef.current = onRefresh; // always points to the newest function

  useEffect(() => {
    if (stage !== "review" || approved) return;
    const check = () => refreshRef.current().catch(() => {});
    const id = setInterval(check, 10000);
    window.addEventListener("focus", check);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", check);
    };
  }, [stage, approved]);

  const refresh = async () => {
    setRefreshing(true);
    try { await onRefresh(); } catch { toast("Could not check status"); }
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen">
      <header className="flex items-center gap-3 px-4 py-4 min-[821px]:px-8 min-[821px]:py-5">
        <Logo size={42} />
        <span className="font-display text-xl font-bold tracking-tight text-navy">MedConnect</span>
        <span className="flex-1" />
        <Btn variant="ghost" size="sm" onClick={onLogout}>Sign out</Btn>
      </header>

      <main className="mx-auto w-full max-w-[1180px] px-4 pb-10 min-[821px]:px-8">
        {/* ---------- FORM ---------- */}
        {stage === "form" && (
          <div className="grid items-start gap-6 animate-fade-up motion-reduce:animate-none lg:grid-cols-[340px_1fr]">
            {/* Left: progress panel */}
            <aside className="relative overflow-hidden rounded-[24px] bg-navy p-7 text-white shadow-neu lg:sticky lg:top-6">
              <i className="absolute -right-16 -top-16 size-48 rounded-full bg-white/5" />
              <i className="absolute -bottom-20 -left-12 size-56 rounded-full bg-white/5" />
              <div className="relative">
                <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold">Doctor · +977 {phone}</span>
                <h1 className="mt-4 font-display text-3xl font-bold leading-tight !text-white">Verify your practice</h1>
                <p className="mt-2 text-[13px] text-white/70">We confirm you are a licensed doctor before patients can find and book you.</p>

                <div className="mt-7">
                  <div className="mb-2 flex items-end justify-between">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-white/60">Progress</span>
                    <b className="font-display text-2xl">{pct}%</b>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-black/25" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Form progress">
                    <div className="h-full rounded-full bg-white transition-all duration-500 motion-reduce:transition-none" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <ul className="mt-6 grid gap-3">
                  {checks.map(([l, ok]) => (
                    <li key={l} className="flex items-center gap-3 text-[13px]">
                      <span className={`grid size-6 shrink-0 place-items-center rounded-full transition motion-reduce:transition-none ${ok ? "bg-white text-navy" : "bg-black/25 text-transparent"}`}>
                        <Ico cls="size-3.5">{CHECK}</Ico>
                      </span>
                      <span className={ok ? "font-semibold" : "text-white/65"}>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Right: form */}
            <section className={`${neu} grid gap-8 p-6 sm:p-8`}>
              {status === "REJECTED" && (
                <div className="rounded-[14px] bg-bad/10 p-4 text-[13px] text-bad" role="alert">
                  <b>Your last submission was rejected.</b> {rejectionReason || "Please check your details and documents."} Fix the issues and submit again.
                </div>
              )}

              <div className="grid gap-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-navy font-display text-sm font-bold text-white">1</span>
                  <h3 className="text-lg">Your details</h3>
                </div>
                <NeuInput label="Full name" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />

                <div>
                  <div className="mb-2 ml-1 text-xs font-semibold text-navy">Specialization</div>
                  <div className="flex flex-wrap gap-2.5">
                    {SPECS.map((s) => <Chip key={s} on={spec === s} onClick={() => setSpec(s)}>{s}</Chip>)}
                  </div>
                  {spec === "Other" && <NeuInput className="mt-3" placeholder="Enter your specialization" value={other} onChange={(e) => setOther(e.target.value)} />}
                </div>

                <NeuInput label="Medical license number" placeholder="Enter medical license no." value={lic} onChange={(e) => setLic(e.target.value)} />

                <div className="grid gap-5 sm:grid-cols-2">
                  <NeuInput label="Experience (years)" inputMode="numeric" placeholder="e.g. 8" value={exp} onChange={(e) => setExp(e.target.value.replace(/\D/g, "").slice(0, 2))} />
                  <NeuInput label="Consultation fee (Rs) · Optional" inputMode="numeric" placeholder="e.g. 500" value={fee} onChange={(e) => setFee(e.target.value.replace(/\D/g, "").slice(0, 6))} />
                </div>
              </div>

              <div className="h-px bg-muted/50" />

              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-navy font-display text-sm font-bold text-white">2</span>
                  <div>
                    <h3 className="text-lg">Verification documents</h3>
                    <p className="text-[12px] text-t2">Clear photos or PDFs. Our team reviews these before your profile goes live.</p>
                  </div>
                </div>
                <UploadTile kind="LICENSE" required label="Medical license" file={fLic} onFile={setFLic} toast={toast} />
                <UploadTile kind="DEGREE" required label="Degree certificate" file={fDeg} onFile={setFDeg} toast={toast} />
                <UploadTile kind="CLINIC_PROOF" label="Clinic / hospital proof" sub="Optional · add later if you do not have one yet" file={fClinic} onFile={setFClinic} toast={toast} />
              </div>

              <div>
                <Btn size="lg" className="w-full" disabled={!valid || busy} aria-busy={busy} onClick={submit}>
                  {busy ? <span className="flex items-center justify-center gap-2.5"><Spin />Submitting…</span> : "Submit for review"}
                </Btn>
                {!valid && <p className="mt-3 text-center text-[12px] text-t2">{checks.length - doneCount} item{checks.length - doneCount > 1 ? "s" : ""} left before you can submit.</p>}
              </div>
            </section>
          </div>
        )}

        {/* ---------- SUBMITTED ---------- */}
        {stage === "submitted" && (
          <div className="grid min-h-[65vh] place-items-center">
            <section className={`${neu} grid w-full max-w-[460px] gap-5 p-8 text-center animate-fade-up motion-reduce:animate-none`}>
              <SuccessCheck />
              <h2 className="text-2xl">Submitted for review</h2>
              <p className="mx-auto max-w-sm text-[13px] text-t2">We will verify your documents and notify you once your profile is approved.</p>
              <div className="mx-auto flex items-center gap-2.5 text-[13px] font-semibold text-navy"><Spin cls="size-4" />Preparing your review…</div>
            </section>
          </div>
        )}

        {/* ---------- REVIEW (pending / approved) ---------- */}
        {stage === "review" && (
          <div className="grid min-h-[65vh] place-items-center">
            <section className={`${neu} grid w-full max-w-[560px] gap-8 p-8 text-center animate-fade-up motion-reduce:animate-none`}>
              {approved ? <SuccessCheck /> : (
                <PulseIcon><path d="M5 22h14M5 2h14M17 22v-4.2a2 2 0 0 0-.6-1.4L12 12l-4.4 4.4a2 2 0 0 0-.6 1.4V22M7 2v4.2a2 2 0 0 0 .6 1.4L12 12l4.4-4.4a2 2 0 0 0 .6-1.4V2" /></PulseIcon>
              )}
              <div>
                <h2 className="text-2xl">{approved ? "You are verified!" : "Verification in progress"}</h2>
                <p className="mx-auto mt-2 max-w-sm text-[13px] text-t2">
                  {approved ? "Your profile is live. Patients can now find and book you."
                    : "Our team is reviewing your documents. This usually takes 24–48 hours. We will notify you as soon as it is done."}
                </p>
              </div>

              <Timeline approved={approved} />

              {!approved && (
                <div className="mx-auto w-full max-w-md">
                  <div className="h-2 overflow-hidden rounded-full bg-bg shadow-inset" role="progressbar" aria-label="Review in progress">
                    <div className="h-full w-1/3 rounded-full bg-navy animate-[load_2.4s_ease-in-out_infinite] motion-reduce:animate-none" />
                  </div>
                  <div className="mt-2 text-[12px] text-t2">Waiting for admin review…</div>
                </div>
              )}

              {approved
                ? <Btn size="lg" className="w-full" onClick={onApproved}>Go to dashboard</Btn>
                : <Btn size="lg" variant="ghost" className="w-full" disabled={refreshing} aria-busy={refreshing} onClick={refresh}>
                    {refreshing ? <span className="flex items-center justify-center gap-2.5"><Spin />Checking…</span> : "Refresh status"}
                  </Btn>}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}