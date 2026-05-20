import { useState } from "react";

function Chevron({ open }) {
  return (
    <svg
      className={"h-4 w-4 shrink-0 text-slate-400 transition-transform " + (open ? "rotate-180" : "")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function LeadershipSection({
  title,
  count,
  defaultOpen = false,
  children,
  accentColor,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50 sm:px-5"
        aria-expanded={open}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          {accentColor ? (
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: accentColor }}
              aria-hidden
            />
          ) : null}
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {count != null ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-600 ring-1 ring-inset ring-slate-200">
              {count}
            </span>
          ) : null}
        </div>
        <Chevron open={open} />
      </button>
      {open ? (
        <div className="border-t border-slate-100 px-4 py-4 sm:px-5">{children}</div>
      ) : null}
    </section>
  );
}
