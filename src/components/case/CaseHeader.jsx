import { daysSince, formatDate, formatTimestamp } from "../../lib/format.js";
import {
  LifecycleStatusBadge,
  PipelineStatusBadge,
  PriorityBadge,
  RequestTypeBadge,
} from "../ui/Badge.jsx";

export function CaseHeader({ caseObj }) {
  const days = daysSince(caseObj.status_changed_at);
  const dayWord = days === 1 ? "day" : "days";
  return (
    <div className="space-y-4">
      <div>
        <h1 className="break-words text-2xl font-semibold tracking-tight text-slate-900">
          {caseObj.case_number}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <PipelineStatusBadge status={caseObj.pipeline_status} />
          <LifecycleStatusBadge status={caseObj.lifecycle_status} />
          <PriorityBadge priority={caseObj.priority} />
          <RequestTypeBadge type={caseObj.request_type} />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">Requestor</dt>
          <dd className="text-slate-700">{caseObj.requestor_name}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">Team</dt>
          <dd className="text-slate-700">{caseObj.team}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">Submitted</dt>
          <dd className="text-slate-700">{formatDate(caseObj.created_at)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">Last updated</dt>
          <dd className="text-slate-700" title={formatTimestamp(caseObj.updated_at)}>
            {formatDate(caseObj.updated_at)}
          </dd>
        </div>
        <div className="sm:col-span-4">
          <dt className="text-xs uppercase tracking-wide text-slate-400">Days in current status</dt>
          <dd className="text-slate-700">{days} {dayWord}</dd>
        </div>
      </dl>
    </div>
  );
}
