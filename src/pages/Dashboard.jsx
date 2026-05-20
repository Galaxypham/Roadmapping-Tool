import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import {
  applyDashboardFilters,
  SORT_OPTIONS,
} from "../lib/dashboardFilters.js";
import {
  getDefaultPresetIdForRole,
  getPreset,
  getPresetsForRole,
} from "../lib/dashboardPresets.js";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Button } from "../components/ui/Button.jsx";
import { PresetFilterBar } from "../components/ui/PresetFilterBar.jsx";
import { DashboardCaseCard } from "../components/dashboard/DashboardCaseCard.jsx";

export default function Dashboard() {
  const { cases, canViewCase, userName, role } = useApp();
  const presets = useMemo(() => getPresetsForRole(role), [role]);
  const defaultPresetId = useMemo(
    () => getDefaultPresetIdForRole(role),
    [role],
  );

  const [presetId, setPresetId] = useState(defaultPresetId);
  const [extraFilters, setExtraFilters] = useState({});
  const [keyword, setKeyword] = useState("");
  const [sortOverride, setSortOverride] = useState(null);

  const activePreset = useMemo(
    () => getPreset(role, presetId),
    [role, presetId],
  );

  const effectiveSort =
    sortOverride || activePreset.sort || SORT_OPTIONS.NEWEST;

  // User-added filters override the preset's value for the same field.
  const mergedFilters = useMemo(
    () => ({
      ...activePreset.filters,
      ...extraFilters,
      keyword,
      sort: effectiveSort,
    }),
    [activePreset, extraFilters, keyword, effectiveSort],
  );

  const filteredCases = useMemo(
    () => applyDashboardFilters(cases, mergedFilters, userName),
    [cases, mergedFilters, userName],
  );

  const handleClearAll = () => {
    setPresetId(defaultPresetId);
    setExtraFilters({});
    setKeyword("");
    setSortOverride(null);
  };

  const handlePresetChange = (id) => {
    setPresetId(id);
    setSortOverride(null); // each preset gets its own default sort
  };

  const handleExportPdf = async () => {
    const { exportDashboardPdf } = await import("../lib/dashboardPdf.js");
    exportDashboardPdf({
      cases: filteredCases,
      totalCount: cases.length,
      filters: mergedFilters,
      canViewCase,
      userName,
      role,
    });
  };

  const description = activePreset
    ? `${activePreset.label} — ${filteredCases.length} ${filteredCases.length === 1 ? "case" : "cases"}`
    : "All cases";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Cases
          </h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportPdf}
            disabled={cases.length === 0}
          >
            Export PDF
          </Button>
          <Link to="/br" className="inline-flex">
            <Button variant="primary" size="sm">
              + New Submission
            </Button>
          </Link>
        </div>
      </header>

      {cases.length === 0 ? (
        <EmptyState
          title="No cases yet"
          description="Submit the first one and it will show up here for everyone on the team."
          action={
            <Link to="/br" className="inline-flex">
              <Button variant="primary">New submission</Button>
            </Link>
          }
        />
      ) : (
        <>
          <PresetFilterBar
            presets={presets}
            activePresetId={presetId}
            onPresetChange={handlePresetChange}
            extraFilters={extraFilters}
            onExtraFiltersChange={setExtraFilters}
            keyword={keyword}
            onKeywordChange={setKeyword}
            sort={sortOverride}
            effectiveSort={effectiveSort}
            onSortChange={setSortOverride}
            matchCount={filteredCases.length}
            totalCount={cases.length}
            onClearAll={handleClearAll}
          />

          {filteredCases.length === 0 ? (
            <EmptyState
              title="No cases match"
              description="Try a different preset, simpler search, or clear your filters."
              action={
                <Button variant="secondary" onClick={handleClearAll}>
                  Clear all
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3">
              {filteredCases.map((c) => (
                <DashboardCaseCard
                  key={c.id}
                  caseObj={c}
                  canView={canViewCase(c)}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
