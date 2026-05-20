import { Link } from "react-router-dom";
import { daysSince, formatDate } from "../../lib/format.js";
import { isCriticalPriority } from "../../lib/constants.js";
import { A11Y, CRITICAL_SURFACE } from "../../lib/accessibleColors.js";
import {
  LifecycleStatusBadge,
  PipelineStatusBadge,
  PriorityBadge,
  RequestTypeBadge,
} from "../ui/Badge.jsx";
import { LockIcon } from "../ui/LockIcon.jsx";

export function DashboardCaseCard({ caseObj, canView }) {
  const critical = canView && isCriticalPriority(caseObj.priority);
  const riceTotal = canView ? caseObj.rice?.weighted_total : null;

  const cardTitle = canView
    ? caseObj.case_number
    : (caseObj.case_number || "").split(" | ")[0] + " | Restricted case";

  return (
    <li>
      <Link
        to={"/cases/" + caseObj.id}
        className={
          "group block rounded-xl border bg-white p-4 shadow-sm transition " +
          (critical
            ? "border-rose-200 hover:border-rose-300 hover:shadow-md"
            : "border-slate-200 hover:border-slate-300 hover:shadow-md")
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-accent-700">
                {cardTitle}
              </h3>
              {critical ? (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: CRITICAL_SURFACE.bg, color: CRITICAL_SURFACE.text }}
                >
                  Critical
                </span>
              ) : null}
            </div>

            {canView ? (
              <>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <RequestTypeBadge type={caseObj.request_type} />
                  <PriorityBadge priority={caseObj.priority} />
                  <PipelineStatusBadge status={caseObj.pipeline_status} />
                  {caseObj.lifecycle_status ? (
                    <LifecycleStatusBadge status={caseObj.lifecycle_status} />
                  ) : null}
                </div>
                <p className="mt-3 line-clamp-2 text-xs text-slate-600">
                  {caseObj.problem_description}
                </p>
              </>
            ) : (
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-400">
                <LockIcon className="h-3.5 w-3.5" />
                Restricted — you don&apos;t have access to view details
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-row flex-wrap items-start gap-4 text-xs text-slate-500 sm:flex-col sm:items-end sm:gap-2 sm:text-right">
            {canView ? (
              <>
                <div
                  className="rounded-lg px-3 py-1.5 text-center ring-1 ring-inset"
                  style={
                    riceTotal != null
                      ? {
                          backgroundColor: A11Y.blue,
                          color: "#fff",
                          boxShadow: "inset 0 0 0 1px " + A11Y.blue,
                        }
                      : {
                          backgroundColor: "#F1F5F9",
                          color: "#94A3B8",
                          boxShadow: "inset 0 0 0 1px #E2E8F0",
                        }
                  }
                  title={
                    riceTotal != null
                      ? `RICE total ${riceTotal}`
                      : "Not yet RICE-scored"
                  }
                >
                  <p className="text-[10px] font-medium uppercase tracking-wide opacity-80">
                    RICE
                  </p>
                  <p className="text-sm font-semibold leading-tight">
                    {riceTotal != null ? riceTotal : "—"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">{caseObj.requestor_name}</p>
                  <p>{caseObj.team}</p>
                </div>
                <div>
                  <p>Submitted {formatDate(caseObj.created_at)}</p>
                  <p>{daysSince(caseObj.status_changed_at)}d in current stage</p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}
