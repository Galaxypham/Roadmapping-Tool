import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import {
  ACTION_TYPE,
  LIFECYCLE_STATUS,
  LIFECYCLE_STATUS_ORDER,
  isOnRoadmap,
} from "../lib/constants.js";
import { formatDate } from "../lib/format.js";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Button } from "../components/ui/Button.jsx";
import {
  PriorityBadge,
  RequestTypeBadge,
} from "../components/ui/Badge.jsx";

function Chevron({ open }) {
  return (
    <svg
      className={
        "h-4 w-4 text-slate-500 transition-transform " +
        (open ? "rotate-180" : "")
      }
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

function CaseRow({ caseObj, onMove }) {
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <Link to={"/cases/" + caseObj.id} className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold text-slate-900 hover:text-accent-700">
            {caseObj.case_number}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-500">{caseObj.ps_name}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <RequestTypeBadge type={caseObj.request_type} />
          <PriorityBadge priority={caseObj.priority} />
        </div>
        <p className="mt-2 truncate text-xs text-slate-500">
          {caseObj.requestor_name} · {caseObj.team} · Submitted{" "}
          {formatDate(caseObj.created_at)}
        </p>
      </Link>

      <label className="inline-flex shrink-0 items-center gap-1.5 text-xs text-slate-600">
        <span className="font-medium text-slate-700">Stage</span>
        <select
          value={caseObj.lifecycle_status || ""}
          onChange={(e) => onMove(caseObj, e.target.value)}
          className="rounded-md border-slate-300 bg-white py-1 text-xs text-slate-900 shadow-sm focus:border-accent-500 focus:ring-accent-500"
        >
          {LIFECYCLE_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
    </li>
  );
}

function StageSection({ stage, cases, expanded, onToggle, onMove }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 bg-slate-50 px-4 py-3 text-left transition hover:brightness-[0.98]"
        aria-expanded={expanded}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">{stage}</h2>
            <span
              className={
                "rounded-full px-2 py-0.5 text-xs font-medium " +
                (cases.length > 0
                  ? "bg-white text-slate-700 ring-1 ring-slate-200"
                  : "text-slate-400")
              }
            >
              {cases.length}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {cases.length === 1 ? "1 case" : cases.length + " cases"} in this stage
          </p>
        </div>
        <Chevron open={expanded} />
      </button>

      {expanded ? (
        <div className="border-t border-slate-100 px-3 pb-3 pt-2">
          {cases.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm italic text-slate-400">
              No cases in this stage.
            </p>
          ) : (
            <ul className="space-y-2">
              {cases.map((c) => (
                <CaseRow key={c.id} caseObj={c} onMove={onMove} />
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}

export default function PmLifecycle() {
  const {
    cases,
    isPM,
    role,
    updateCase,
    appendActivity,
    userName,
    canViewCase,
  } = useApp();

  // Roadmapped cases only — PLC tracking starts when product work starts.
  const roadmapped = useMemo(() => cases.filter(isOnRoadmap), [cases]);

  const grouped = useMemo(() => {
    const g = {};
    for (const s of LIFECYCLE_STATUS_ORDER) g[s] = [];
    for (const c of roadmapped) {
      const stage = c.lifecycle_status || LIFECYCLE_STATUS.DISCOVERY;
      if (!g[stage]) g[stage] = [];
      g[stage].push(c);
    }
    // Within each stage, order by roadmap rank so the most prioritized
    // work is at the top of every column.
    for (const k of Object.keys(g)) {
      g[k].sort((a, b) => {
        const ar = Number.isFinite(a.roadmap_rank) ? a.roadmap_rank : Infinity;
        const br = Number.isFinite(b.roadmap_rank) ? b.roadmap_rank : Infinity;
        return ar - br;
      });
    }
    return g;
  }, [roadmapped]);

  // Default open: every stage that has at least one case.
  const initialOpen = useMemo(() => {
    return new Set(
      LIFECYCLE_STATUS_ORDER.filter((s) => (grouped[s] || []).length > 0),
    );
  }, [grouped]);
  const [expanded, setExpanded] = useState(initialOpen);

  const toggleStage = (stage) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(stage)) next.delete(stage);
      else next.add(stage);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(LIFECYCLE_STATUS_ORDER));
  const collapseAll = () => setExpanded(new Set());

  const handleExportPdf = async () => {
    const { exportLifecyclePdf } = await import("../lib/dashboardPdf.js");
    exportLifecyclePdf({
      stages: LIFECYCLE_STATUS_ORDER,
      groups: grouped,
      canViewCase,
      userName,
      role,
    });
  };

  const handleMove = (caseObj, nextStage) => {
    if (!nextStage || nextStage === caseObj.lifecycle_status) return;
    const fromLabel = caseObj.lifecycle_status || "Not started";
    updateCase(caseObj.id, (c) => ({ ...c, lifecycle_status: nextStage }));
    appendActivity(caseObj.id, {
      action_type: ACTION_TYPE.LIFECYCLE_CHANGED,
      action_detail: `Lifecycle stage: ${fromLabel} -> ${nextStage}`,
      reason: "",
      performed_by: userName || "PM",
    });
  };

  if (!isPM) {
    return (
      <EmptyState
        title="Lifecycle is only available in the PM role."
        description="Switch to Product Manager from the welcome page to manage the product lifecycle."
      />
    );
  }

  if (roadmapped.length === 0) {
    return (
      <EmptyState
        title="Nothing on the roadmap yet"
        description="Lifecycle tracking starts once cases are roadmapped. Move cases to the Roadmapped pipeline status to begin tracking them through Discovery, Definition, Design, Development, QA, Staging, Released, and Deprecated."
        action={
          <Link to="/dashboard" className="inline-flex">
            <Button variant="primary">Open cases</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Lifecycle
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track every roadmapped case through the product lifecycle. Use the
            stage dropdown on a card to move it forward or back; changes are
            recorded in the case's activity log.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={expandAll}>
            Expand all
          </Button>
          <Button variant="ghost" size="sm" onClick={collapseAll}>
            Collapse all
          </Button>
          <Button variant="primary" size="sm" onClick={handleExportPdf}>
            Export PDF
          </Button>
        </div>
      </header>

      <div className="space-y-3">
        {LIFECYCLE_STATUS_ORDER.map((stage) => (
          <StageSection
            key={stage}
            stage={stage}
            cases={grouped[stage] || []}
            expanded={expanded.has(stage)}
            onToggle={() => toggleStage(stage)}
            onMove={handleMove}
          />
        ))}
      </div>
    </div>
  );
}
