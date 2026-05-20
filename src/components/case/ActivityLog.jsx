import { Card, CardBody, CardHeader } from "../ui/Card.jsx";
import { formatTimestamp } from "../../lib/format.js";

export function ActivityLog({ caseObj }) {
  const sorted = [...caseObj.activity_log].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );

  return (
    <Card>
      <CardHeader
        title="Activity log"
        description="Auto-generated. Every change shows up here with the reason that drove it."
      />
      <CardBody>
        {sorted.length === 0 ? (
          <p className="text-sm italic text-slate-400">No activity yet.</p>
        ) : (
          <ol className="relative space-y-4 pl-4 before:absolute before:left-1 before:top-1 before:h-full before:w-px before:bg-slate-100">
            {sorted.map((entry) => (
              <li key={entry.id} className="relative">
                <span className="absolute -left-3.5 top-1 h-2 w-2 rounded-full bg-slate-300" />
                <p className="text-xs text-slate-500">
                  {formatTimestamp(entry.created_at)} | {entry.performed_by}
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-800">{entry.action_detail}</p>
                {entry.reason ? (
                  <p className="mt-1 text-sm text-slate-600">
                    Reason: <span className="italic">{entry.reason}</span>
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}
