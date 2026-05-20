// Reusable labeled form field wrappers used in intake form and settings.

import { InfoTooltip } from "./InfoTooltip.jsx";

export function Field({ label, hint, tooltip, required, error, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center text-xs font-semibold text-slate-800">
        {typeof label === "string" ? <span>{label}</span> : label}
        {tooltip ? <InfoTooltip {...tooltip} /> : null}
        {required ? <span className="text-rose-500"> *</span> : null}
      </div>
      {children}
      {hint && !error ? (
        <p className="mt-1 text-xs text-slate-600">{hint}</p>
      ) : null}
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

const inputCls =
  "block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-400 placeholder:text-slate-400 hover:ring-slate-500 focus:ring-2 focus:ring-accent-500";

export function TextInput(props) {
  return <input type="text" {...props} className={inputCls + " " + (props.className || "")} />;
}

export function TextArea(props) {
  return (
    <textarea
      rows={4}
      {...props}
      className={inputCls + " resize-y " + (props.className || "")}
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={inputCls + " pr-8 " + (props.className || "")}>
      {children}
    </select>
  );
}

export function NumberInput(props) {
  return (
    <input
      type="number"
      {...props}
      className={inputCls + " " + (props.className || "")}
    />
  );
}
