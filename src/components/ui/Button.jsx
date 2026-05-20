const BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none";

const SIZES = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3 py-1.5",
  lg: "px-4 py-2",
};

const VARIANTS = {
  primary:
    "bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 shadow-sm",
  accent:
    "bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 shadow-sm",
  secondary:
    "bg-white text-slate-800 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 hover:ring-slate-400 shadow-sm",
  ghost:
    "bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-400",
  danger:
    "bg-white text-rose-600 ring-1 ring-inset ring-rose-200 hover:bg-rose-50",
  link:
    "bg-white text-accent-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:text-accent-800",
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  type = "button",
  ...props
}) {
  const cls = [BASE, SIZES[size], VARIANTS[variant], className].join(" ");
  return <button type={type} className={cls} {...props} />;
}
