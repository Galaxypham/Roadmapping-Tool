import { Navigate, Route, Routes } from "react-router-dom";
import { useApp } from "./context/AppContext.jsx";
import { getRoleHomePath } from "./lib/constants.js";
import { AppLayout } from "./components/layout/AppLayout.jsx";
import Landing from "./pages/Landing.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import BrPortal from "./pages/BrPortal.jsx";
import PmPortal from "./pages/PmPortal.jsx";
import PmLifecycle from "./pages/PmLifecycle.jsx";
import LeadershipPortal from "./pages/LeadershipPortal.jsx";
import CaseDetail from "./pages/CaseDetail.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  const { role, userName } = useApp();
  const ready = Boolean(role && userName);

  return (
    <Routes>
      <Route path="/welcome" element={<Landing />} />
      <Route
        path="/"
        element={
          ready ? (
            <Navigate to={getRoleHomePath(role)} replace />
          ) : (
            <Navigate to="/welcome" replace />
          )
        }
      />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/br" element={<BrPortal />} />
        <Route path="/pm" element={<PmPortal />} />
        <Route path="/pm/lifecycle" element={<PmLifecycle />} />
        <Route path="/leadership" element={<LeadershipPortal />} />
        <Route path="/cases/:id" element={<CaseDetail />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
