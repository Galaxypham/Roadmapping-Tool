import { useEffect, useRef, useState } from "react";
import { Button } from "./Button.jsx";

// Mandatory reason modal. Every PM-driven mutation in the app routes
// through this component so reasons are always captured.
//
// Props:
//   open: boolean
//   title: short headline ("Change pipeline status")
//   description: optional context line
//   summary: optional preview of what will change ("Under Review -> Roadmapped")
//   confirmLabel: label for the confirm button (default "Confirm")
//   onConfirm: (reason: string) => void
//   onCancel: () => void
//   variant: "default" | "danger"

export function ReasonModal({
  open,
  title,
  description,
  summary,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
  variant = "default",
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (open) {
      setReason("");
      setError("");
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("A reason is required.");
      return;
    }
    onConfirm?.(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden
      />
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl ring-1 ring-slate-200">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {description ? (
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          ) : null}
        </div>
        <div className="space-y-3 px-5 py-4">
          {summary ? (
            <div className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-inset ring-slate-200">
              {summary}
            </div>
          ) : null}
          <label className="block text-xs font-medium text-slate-700">
            Reason (required)
          </label>
          <textarea
            ref={textareaRef}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError("");
            }}
            rows={4}
            className="block w-full resize-y rounded-md border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            placeholder="Explain why you're making this change. This gets recorded in the activity log."
          />
          {error ? (
            <p className="text-xs text-rose-600">{error}</p>
          ) : null}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 rounded-b-xl">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
