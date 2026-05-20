import { Card, CardBody, CardHeader } from "../ui/Card.jsx";
import { formatTimestamp } from "../../lib/format.js";

export function RevisionHistory({ caseObj }) {
  const sorted = [...caseObj.revision_history].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );

  return (
    <Card>
      <CardHeader
        title="Revision history"
        description="Field-level edits with before / after diffs and the PM-provided reason."
      />
      <CardBody>
        {sorted.length === 0 ? (
          <p className="text-sm italic text-slate-400">No field edits yet.</p>
        ) : (
          <ul className="space-y-4">
            {sorted.map((rev) => (
              <li key={rev.id} className="rounded-md border border-slate-100 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {rev.field_name}
                </p>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Before</p>
                    <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-slate-600">
                      {rev.old_value || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">After</p>
                    <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-slate-700">
                      {rev.new_value || "—"}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {rev.changed_by} | {formatTimestamp(rev.created_at)}
                </p>
                {rev.reason ? (
                  <p className="text-sm text-slate-600">
                    Reason: <span className="italic">{rev.reason}</span>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
