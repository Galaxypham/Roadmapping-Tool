import { useState } from "react";
import { Button } from "./Button.jsx";

export function InfoTooltip({ title, description }) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-flex">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="ml-1 !h-7 !w-7 !min-w-0 !p-0 text-slate-400 hover:text-slate-600"
        aria-label={title}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </Button>
      {show ? (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-md bg-slate-800 px-3 py-2 text-xs text-white shadow-lg"
        >
          <span className="block font-medium">{title}</span>
          <span className="mt-1 block text-slate-300">{description}</span>
          <span className="absolute left-1/2 top-full -mt-1 block h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-800" />
        </span>
      ) : null}
    </span>
  );
}
