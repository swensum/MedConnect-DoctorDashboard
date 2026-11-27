import { useState, useCallback, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase, api } from "./supabase";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import Kyc from "./pages/Kyc";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Consult from "./pages/Consult";
import Availability from "./pages/Availability";
import Splash from "./pages/Splash";

// Database rows have patientName, but the UI reads name, age, time, type.
const toUi = (a) => ({
  ...a,
  name: a.patientName,
  age: a.age ?? "–",
  time: new Date(a.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
});

// Defined OUTSIDE App so React does not remount it on every App re-render.
function ConsultPage({ appts, toast }) {
  const { id } = useParams();
  const p = appts.find((a) => String(a.id) === id);
  if (!p) return <Navigate to="/appointments" replace />;
  return <Consult key={p.id} patient={p} toast={toast} />;
}

export default function App() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const [user, setUser] = useState(null);   // phone of the logged-in user
  const [ready, setReady] = useState(false); // true once we know if a session exists
  const [me, setMe] = useState(null);        // doctor row from our backend (GET /me)
  const [appts, setAppts] = useState([]);
  const [t, setT] = useState("");
  const [splash, setSplash] = useState(true);

  const endSplash = useCallback(() => setSplash(false), []);
  const toast = (m) => { setT(m); setTimeout(() => setT(""), 2200); };

  const logout = async () => {
    await supabase.auth.signOut(); // really ends the session
    nav("/login");
  };

  // 1. Restore the session after a refresh, and follow login/logout/token refresh.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user?.phone ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user?.phone ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // 2. Ask our backend who this doctor is and whether they are verified.
  useEffect(() => {
    if (!user) { setMe(null); return; }
    api("/me")
      .then(setMe)
      .catch(() => { toast("Could not reach the server"); logout(); });
  }, [user]);

  // 3. Load this doctor's appointments.
  useEffect(() => {
    if (!user) { setAppts([]); return; }
    api("/appointments")
      .then((rows) => setAppts(rows.map(toUi)))
      .catch((e) => toast(e.message));
  }, [user]);

  const verified = me?.kycStatus === "APPROVED";
  const section = pathname.startsWith("/login") ? "login" : pathname.startsWith("/register") ? "register" : "app";
  const firstUp = appts.find((a) => a.status === "upcoming") || appts[0];

  // Not signed in -> login. Signed in but not approved -> register. Approved -> app.
  // Built as an element (not an inner component) so the layout is not remounted on every render.
  const guardEl = !user ? <Navigate to="/login" replace />
    : !verified ? <Navigate to="/register" replace />
      : <AppLayout onLogout={logout} />;

  // ---- early returns: keep them AFTER all hooks ----
  if (splash || !ready) return <Splash onDone={endSplash} />;
  if (user && !me) return <div className="grid min-h-screen place-items-center text-t2">Loading…</div>;

  return (
    <>
      <div key={section} className="min-h-screen animate-slide-in overflow-x-clip motion-reduce:animate-none">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onIn={(ph) => { setUser(ph); nav("/"); }} />} />
          <Route path="/register" element={
            !user ? <Navigate to="/login" replace />
              : verified ? <Navigate to="/" replace />
                : <Kyc phone={user} toast={toast} onLogout={logout}
                  status={me.kycStatus}
                  onRefresh={() => api("/me").then(setMe)}
                  rejectionReason={me.rejectionReason}
                  onApproved={() => nav("/")} />
          } />
          <Route element={guardEl}>
            <Route index element={<Dashboard appts={appts} />} />
            <Route path="appointments" element={<Appointments appts={appts} setAppts={setAppts} toast={toast} />} />
            <Route path="consult" element={<Navigate to={firstUp ? "/consult/" + firstUp.id : "/appointments"} replace />} />
            <Route path="consult/:id" element={<ConsultPage appts={appts} toast={toast} />} />
            <Route path="availability" element={<Availability toast={toast} />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {t && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-[14px] bg-navy px-5 py-3 text-white" role="status">{t}</div>}
    </>
  );
}