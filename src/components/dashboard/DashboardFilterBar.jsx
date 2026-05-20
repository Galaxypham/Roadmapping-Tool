import { useState } from "react";
import {
  PIPELINE_STATUS_ORDER,
  PRIORITY_ORDER,
  REQUEST_TYPE_ORDER,
} from "../../lib/constants.js";
import {
  blankFilters,
  hasActiveDashboardFilters,
  SORT_OPTIONS,
} from "../../lib/dashboardFilters.js";
import { Button } from "../ui/Button.jsx";

export { blankFilters, SORT_OPTIONS };

const selectCls =
  "mt-1 block w-full rounded-md border-0 bg-white py-2 pl-3 pr-8 text-sm text-slate-800 ring-1 ring-inset ring-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-500";

function shortPipeline(status) {
  return status;
}

export function DashboardFilterBar({
  filters,
  onChange,
  onReset,
  userName,
  matchCount,
  totalCount,
}) {
  const [showDates, setShowDates] = useState(
    Boolean(filters.startDate || filters.endDate),
  );

  const update = (key, value) => onChange({ ...filters, [key]: value });
  const hasActive = hasActiveDashboardFilters(filters);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold text-slate-900">Find cases</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Search and filter the list below. Changes apply instantly.
        </p>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <div>
          <label htmlFor="dashboard-search" className="sr-only">
            Search cases
          </label>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-inset ring-slate-200 focus-within:ring-2 focus-within:ring-accent-500">
            <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="dashboard-search"
              type="search"
              value={filters.keyword}
              onChange={(e) => update("keyword", e.target.value)}
              placeholder="Search by project name, case #, requestor, or team..."
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="filter-pipeline" className="text-xs font-medium text-slate-600">
              Pipeline stage
            </label>
            <select
              id="filter-pipeline"
              value={filters.pipeline}
              onChange={(e) => update("pipeline", e.target.value)}
              className={selectCls}
            >
              <option value="">All stages</option>
              {PIPELINE_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>{shortPipeline(s)}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-type" className="text-xs font-medium text-slate-600">
              Request type
            </label>
            <select
              id="filter-type"
              value={filters.requestType}
              onChange={(e) => update("requestType", e.target.value)}
              className={selectCls}
            >
              <option value="">All types</option>
              {REQUEST_TYPE_ORDER.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-priority" className="text-xs font-medium text-slate-600">
              Priority
            </label>
            <select
              id="filter-priority"
              value={filters.priority}
              onChange={(e) => update("priority", e.target.value)}
              className={selectCls}
            >
              <option value="">All priorities</option>
              {PRIORITY_ORDER.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-sort" className="text-xs font-medium text-slate-600">
              Sort by
            </label>
            <select
              id="filter-sort"
              value={filters.sort}
              onChange={(e) => update("sort", e.target.value)}
              className={selectCls}
            >
              {Object.values(SORT_OPTIONS).map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>

        {showDates ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="filter-start" className="text-xs font-medium text-slate-600">
                Submitted from
              </label>
              <input
                id="filter-start"
                type="date"
                value={filters.startDate}
                onChange={(e) => update("startDate", e.target.value)}
                className={selectCls}
              />
            </div>
            <div>
              <label htmlFor="filter-end" className="text-xs font-medium text-slate-600">
                Submitted to
              </label>
              <input
                id="filter-end"
                type="date"
                value={filters.endDate}
                onChange={(e) => update("endDate", e.target.value)}
                className={selectCls}
              />
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            {userName ? (
              <Button
                type="button"
                variant={filters.mineOnly ? "accent" : "secondary"}
                size="sm"
                onClick={() => update("mineOnly", !filters.mineOnly)}
              >
                {filters.mineOnly ? "Showing my cases" : "My cases only"}
              </Button>
            ) : null}
            <Button
              type="button"
              variant={
                filters.sort === SORT_OPTIONS.RECENTLY_EDITED ? "accent" : "secondary"
              }
              size="sm"
              onClick={() =>
                update(
                  "sort",
                  filters.sort === SORT_OPTIONS.RECENTLY_EDITED
                    ? SORT_OPTIONS.NEWEST
                    : SORT_OPTIONS.RECENTLY_EDITED,
                )
              }
              title="Sort by most recently edited"
            >
              {filters.sort === SORT_OPTIONS.RECENTLY_EDITED
                ? "Showing recently edited"
                : "Recently edited"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDates((v) => !v)}
            >
              {showDates ? "Hide dates" : "Filter by date"}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">
              {matchCount} of {totalCount} shown
            </span>
            {hasActive ? (
              <Button variant="ghost" size="sm" onClick={onReset}>
                Clear all
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
