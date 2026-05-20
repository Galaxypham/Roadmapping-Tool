import { useEffect, useRef, useState } from "react";
import { Button } from "./Button.jsx";
import {
  PRIORITY_ORDER,
  REQUEST_TYPE_ORDER,
} from "../../lib/constants.js";
import { SORT_ORDER } from "../../lib/dashboardFilters.js";

function SearchIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}

function Chip({ label, value, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs ring-1 ring-inset ring-slate-300">
      <span className="font-medium text-slate-500">{label}:</span>
      <span className="text-slate-800">{value}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        ×
      </button>
    </span>
  );
}

export function PresetFilterBar({
  presets,
  activePresetId,
  onPresetChange,
  extraFilters,
  onExtraFiltersChange,
  keyword,
  onKeywordChange,
  sort,
  effectiveSort,
  onSortChange,
  matchCount,
  totalCount,
  onClearAll,
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    if (!filterOpen) return undefined;
    function onDocClick(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [filterOpen]);

  const updateExtra = (patch) => onExtraFiltersChange({ ...extraFilters, ...patch });

  const removeExtra = (key) => {
    const next = { ...extraFilters };
    delete next[key];
    onExtraFiltersChange(next);
  };

  const hasExtras =
    Boolean(extraFilters.requestType) ||
    Boolean(extraFilters.priority) ||
    Boolean(extraFilters.mineOnly) ||
    Boolean(extraFilters.startDate) ||
    Boolean(extraFilters.endDate);

  const anyActive =
    activePresetId !== "all" || hasExtras || Boolean(keyword) || sort !== null;

  return (
    <div className="space-y-2">
      {/* Preset row */}
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((p) => {
          const active = p.id === activePresetId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onPresetChange(p.id)}
              className={[
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
                active
                  ? "bg-accent-600 text-white shadow-sm"
                  : "bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 hover:ring-slate-400",
              ].join(" ")}
              aria-pressed={active}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <label className="inline-flex items-center gap-1.5 text-xs text-slate-600">
          <span className="font-medium text-slate-700">Sort</span>
          <select
            value={effectiveSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded-md border-slate-300 bg-white py-1 text-xs text-slate-900 shadow-sm focus:border-accent-500 focus:ring-accent-500"
          >
            {SORT_ORDER.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <div className="flex min-w-[14rem] flex-1 items-center gap-2 rounded-lg bg-white px-3 py-1.5 ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-accent-500">
          <SearchIcon />
          <input
            type="search"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="Search by keyword, case number, or requestor"
            className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        <div className="relative" ref={filterRef}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFilterOpen((v) => !v)}
            aria-expanded={filterOpen}
            aria-haspopup="dialog"
          >
            <PlusIcon /> Add Filter
          </Button>

          {filterOpen ? (
            <div
              role="dialog"
              aria-label="Add filters"
              className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
            >
              <div className="space-y-3">
                <label className="block text-xs">
                  <span className="mb-1 block font-medium text-slate-700">Type</span>
                  <select
                    value={extraFilters.requestType || ""}
                    onChange={(e) =>
                      updateExtra({ requestType: e.target.value || undefined })
                    }
                    className="block w-full rounded-md border-slate-300 bg-white text-sm text-slate-900 shadow-sm focus:border-accent-500 focus:ring-accent-500"
                  >
                    <option value="">Any</option>
                    {REQUEST_TYPE_ORDER.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-xs">
                  <span className="mb-1 block font-medium text-slate-700">Priority</span>
                  <select
                    value={extraFilters.priority || ""}
                    onChange={(e) =>
                      updateExtra({ priority: e.target.value || undefined })
                    }
                    className="block w-full rounded-md border-slate-300 bg-white text-sm text-slate-900 shadow-sm focus:border-accent-500 focus:ring-accent-500"
                  >
                    <option value="">Any</option>
                    {PRIORITY_ORDER.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(extraFilters.mineOnly)}
                    onChange={(e) =>
                      updateExtra({ mineOnly: e.target.checked || undefined })
                    }
                    className="rounded border-slate-300 text-accent-600 focus:ring-accent-500"
                  />
                  Only my submissions
                </label>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="block">
                    <span className="mb-1 block font-medium text-slate-700">Submitted from</span>
                    <input
                      type="date"
                      value={extraFilters.startDate || ""}
                      onChange={(e) =>
                        updateExtra({ startDate: e.target.value || undefined })
                      }
                      className="block w-full rounded-md border-slate-300 bg-white text-sm shadow-sm focus:border-accent-500 focus:ring-accent-500"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block font-medium text-slate-700">Submitted to</span>
                    <input
                      type="date"
                      value={extraFilters.endDate || ""}
                      onChange={(e) =>
                        updateExtra({ endDate: e.target.value || undefined })
                      }
                      className="block w-full rounded-md border-slate-300 bg-white text-sm shadow-sm focus:border-accent-500 focus:ring-accent-500"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-end border-t border-slate-200 pt-2">
                  <button
                    type="button"
                    onClick={() => onExtraFiltersChange({})}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Reset filters
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {filterOpen ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setFilterOpen(false)}
          >
            Done
          </Button>
        ) : null}

        <span className="text-xs text-slate-600 tabular-nums">
          {matchCount} of {totalCount}
        </span>

        {anyActive ? (
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            Clear all
          </Button>
        ) : null}
      </div>

      {/* Active extras chip strip */}
      {hasExtras ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500">Also filtering:</span>
          {extraFilters.requestType ? (
            <Chip
              label="Type"
              value={extraFilters.requestType}
              onRemove={() => removeExtra("requestType")}
            />
          ) : null}
          {extraFilters.priority ? (
            <Chip
              label="Priority"
              value={extraFilters.priority}
              onRemove={() => removeExtra("priority")}
            />
          ) : null}
          {extraFilters.mineOnly ? (
            <Chip
              label="Scope"
              value="My submissions"
              onRemove={() => removeExtra("mineOnly")}
            />
          ) : null}
          {extraFilters.startDate ? (
            <Chip
              label="From"
              value={extraFilters.startDate}
              onRemove={() => removeExtra("startDate")}
            />
          ) : null}
          {extraFilters.endDate ? (
            <Chip
              label="To"
              value={extraFilters.endDate}
              onRemove={() => removeExtra("endDate")}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
