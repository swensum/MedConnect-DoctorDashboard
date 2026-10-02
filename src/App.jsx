import { useState, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
import { APPTS0 } from "./components/data";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import Kyc from "./pages/Kyc";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Consult from "./pages/Consult";
import Availability from "./pages/Availability";
import Splash from "./pages/Splash";


export default function App() {
  const nav = useNavigate();
  const [user, setUser] = useState(null); // TODO: replace with Firebase onAuthStateChanged
  const [verified, setVerified] = useState(false); // TODO: read kycStatus === "approved" from Firestore
  const [appts, setAppts] = useState(APPTS0);
  const [t, setT] = useState("");
  const [splash, setSplash] = useState(true);
  const endSplash = useCallback(() => setSplash(false), []);
  const toast = (m) => { setT(m); setTimeout(() => setT(""), 2200); };
  const logout = () => { setUser(null); setVerified(false); nav("/login"); };
  const { pathname } = useLocation();
  const section = pathname.startsWith("/login") ? "login" : pathname.startsWith("/register") ? "register" : "app";
  // Not signed in -> login. Signed in but not approved -> register. Approved -> app.
  const Guard = () => {
    if (!user) return <Navigate to="/login" replace />;
    if (!verified) return <Navigate to="/register" replace />;
    return <AppLayout onLogout={logout} />;
  };
  const ConsultPage = () => {
    const { id } = useParams();
    const p = appts.find((a) => String(a.id) === id);
    if (!p) return <Navigate to="/appointments" replace />;
    return <Consult key={p.id} patient={p} toast={toast} />;
  };
  const firstUp = appts.find((a) => a.status === "upcoming") || appts[0];

  if (splash) return <Splash onDone={endSplash} />;

  return (
    <>
     <div key={section} className="min-h-screen animate-slide-in overflow-x-clip motion-reduce:animate-none">

      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onIn={(ph) => { setUser(ph); nav("/"); }} />} />
        <Route path="/register" element={
          !user ? <Navigate to="/login" replace />
            : verified ? <Navigate to="/" replace />
            : <Kyc phone={user} toast={toast} onLogout={logout} onApproved={() => { setVerified(true); nav("/"); }} />
        } />
        <Route element={<Guard />}>
          <Route index element={<Dashboard appts={appts} />} />
          <Route path="appointments" element={<Appointments appts={appts} setAppts={setAppts} toast={toast} />} />
          <Route path="consult" element={<Navigate to={"/consult/" + firstUp.id} replace />} />
          <Route path="consult/:id" element={<ConsultPage />} />
          <Route path="availability" element={<Availability toast={toast} />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </div>
      {t && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-[14px] bg-navy px-5 py-3 text-white" role="status">{t}</div>}
    </>
  );
}