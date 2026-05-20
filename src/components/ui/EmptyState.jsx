export function EmptyState({ title, description, action, icon = null }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
      {icon ? <div className="text-slate-400">{icon}</div> : null}
      <div>
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        {description ? (
          <p className="mt-1 max-w-md text-xs text-slate-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
