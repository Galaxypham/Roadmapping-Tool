import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useApp } from "../../context/AppContext.jsx";
import { Navigation } from "./Navigation.jsx";

// Wraps all authenticated routes. If the user hasn't picked a role yet,
// kick them back to the landing page.
export function AppLayout() {
  const { role, userName } = useApp();
  const [storageFull, setStorageFull] = useState(false);

  // Surface localStorage quota errors as a dismissible banner. The storage
  // layer dispatches a `ps:storage-quota-exceeded` CustomEvent on window
  // when a write fails because the browser is out of space.
  useEffect(() => {
    const onQuota = () => setStorageFull(true);
    window.addEventListener("ps:storage-quota-exceeded", onQuota);
    return () =>
      window.removeEventListener("ps:storage-quota-exceeded", onQuota);
  }, []);

  if (!role || !userName) {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <Navigation />
      {storageFull ? (
        <div className="border-b border-amber-300 bg-amber-50">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs text-amber-900 sm:px-6 lg:px-8">
            <span>
              <span className="font-semibold">Storage is full.</span>{" "}
              Your last change couldn&apos;t be saved because this browser&apos;s
              localStorage is at capacity (≈5 MB). Try removing a large
              document attachment, or use{" "}
              <span className="font-semibold">
                Settings → Reload seed data
              </span>{" "}
              to reset.
            </span>
            <button
              type="button"
              onClick={() => setStorageFull(false)}
              className="rounded-md bg-white/70 px-2 py-1 text-amber-900 ring-1 ring-inset ring-amber-300 hover:bg-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
