export function Tabs({
  tabs,
  value,
  onChange,
  className = "",
  ariaLabel = "Tabs",
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={
        "flex flex-wrap items-center gap-6 border-b-2 border-slate-300 " + className
      }
    >
      {tabs.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={"tabpanel-" + tab.id}
            id={"tab-" + tab.id}
            onClick={() => onChange(tab.id)}
            className={
              "-mb-0.5 inline-flex items-center gap-2 border-b-2 px-1 pb-3 pt-1 text-sm font-semibold transition focus:outline-none focus-visible:text-slate-900 " +
              (active
                ? "border-accent-600 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-900")
            }
          >
            <span>{tab.label}</span>
            {tab.count != null ? (
              <span
                className={
                  "rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums " +
                  (active
                    ? "bg-accent-600 text-white"
                    : "bg-slate-200 text-slate-600")
                }
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ id, value, children, className = "" }) {
  if (value !== id) return null;
  return (
    <div
      role="tabpanel"
      id={"tabpanel-" + id}
      aria-labelledby={"tab-" + id}
      className={className}
    >
      {children}
    </div>
  );
}
