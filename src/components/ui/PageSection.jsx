export function PageSection({ title, action, children, className = "", bodyClassName = "" }) {
  return (
    <section
      className={
        "overflow-hidden rounded-xl border border-slate-300 bg-slate-50 shadow-card " +
        className
      }
    >
      {title ? (
        <header className="flex items-center justify-between gap-3 border-b border-slate-300 bg-slate-100 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={"px-4 py-4 sm:px-5 " + bodyClassName}>{children}</div>
    </section>
  );
}

export function PageSubsection({ title, children, className = "" }) {
  return (
    <div
      className={
        "rounded-lg border border-slate-300 bg-white " +
        className
      }
    >
      {title ? (
        <div className="border-b border-slate-300 bg-slate-50 px-3 py-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">{title}</h3>
        </div>
      ) : null}
      <div className="p-3">{children}</div>
    </div>
  );
}