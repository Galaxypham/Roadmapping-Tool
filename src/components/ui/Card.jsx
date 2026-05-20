export function Card({ children, className = "", ...rest }) {
  const cls =
    "rounded-xl bg-slate-50 border border-slate-300 shadow-card " + className;
  return (
    <section className={cls} {...rest}>
      {children}
    </section>
  );
}

export function CardHeader({ title, description, action, className = "" }) {
  return (
    <header
      className={
        "flex items-start justify-between gap-4 border-b border-slate-300 bg-slate-100 rounded-t-xl px-5 py-4 " +
        className
      }
    >
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs text-slate-600">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function CardBody({ children, className = "" }) {
  return <div className={"px-5 py-4 " + className}>{children}</div>;
}
