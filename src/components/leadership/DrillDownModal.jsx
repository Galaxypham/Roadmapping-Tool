import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button.jsx";
import {
  PipelineStatusBadge,
  PriorityBadge,
  RequestTypeBadge,
} from "../ui/Badge.jsx";
import { formatDate } from "../../lib/format.js";

// Generic drill-down list shown when leadership clicks a metric on the
// Dashboard. Each row links to the underlying case so clicks always go
// somewhere useful.
//
// Props:
//   open: boolean
//   title: short headline (e.g. "Released this quarter")
//   subtitle: optional context line (e.g. "5 cases since Apr 1")
//   rows: Array<{ caseObj, meta?: string }> — meta renders in muted text
//   emptyMessage: shown when rows is empty
//   onClose: () => void

export function DrillDownModal({
  open,
  title,
  subtitle,
  rows = [],
  emptyMessage = "No cases match this metric.",
  onClose,
}) {
  const navigate = useNavigate();

  const goToCase = (id) => {
    onClose?.();
    navigate("/cases/" + id);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200"
        style={{ maxHeight: "min(80vh, 720px)" }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 -mt-1 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M4.28 4.22a.75.75 0 011.06 0L10 8.94l4.66-4.72a.75.75 0 111.07 1.05L11.06 10l4.67 4.72a.75.75 0 11-1.07 1.05L10 11.06l-4.66 4.71a.75.75 0 11-1.07-1.05L8.94 10 4.28 5.28a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {rows.length === 0 ? (
            <p className="text-sm italic text-slate-400">{emptyMessage}</p>
          ) : (
            <ul className="space-y-2">
              {rows.map(({ caseObj, meta }) => (
                <li key={caseObj.id}>
                  <button
                    type="button"
                    onClick={() => goToCase(caseObj.id)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-slate-300 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {caseObj.ps_name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {caseObj.case_number}
                        {caseObj.team ? " · " + caseObj.team : ""}
                        {caseObj.created_at
                          ? " · Submitted " + formatDate(caseObj.created_at)
                          : ""}
                        {meta ? " · " + meta : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                      <RequestTypeBadge type={caseObj.request_type} />
                      <PriorityBadge priority={caseObj.priority} />
                      <PipelineStatusBadge status={caseObj.pipeline_status} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/60 px-5 py-3">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
