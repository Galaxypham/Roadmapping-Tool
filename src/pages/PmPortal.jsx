import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { isOnRoadmap } from "../lib/constants.js";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Button } from "../components/ui/Button.jsx";
import { RoadmapList } from "../components/roadmap/RoadmapList.jsx";

export default function PmPortal() {
  const { cases, isPM, reorderRoadmap, userName, role, canViewCase } = useApp();

  const roadmapCases = useMemo(() => {
    return cases
      .filter(isOnRoadmap)
      .sort((a, b) => {
        const ar = Number.isFinite(a.roadmap_rank) ? a.roadmap_rank : Infinity;
        const br = Number.isFinite(b.roadmap_rank) ? b.roadmap_rank : Infinity;
        if (ar !== br) return ar - br;
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [cases]);

  const handleReorder = (orderedIds) => {
    reorderRoadmap(orderedIds, userName);
  };

  const handleExportPdf = async () => {
    const { exportRoadmapPdf } = await import("../lib/dashboardPdf.js");
    exportRoadmapPdf({
      cases: roadmapCases,
      canViewCase,
      userName,
      role,
    });
  };

  if (!isPM) {
    return (
      <EmptyState
        title="Roadmap is only available in the PM role."
        description="Switch to Product Manager from the welcome page to manage roadmap order."
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Roadmap
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Drag cases to set their order on the roadmap. The top of the list
            is what's worked on next; this order is what Leadership and the
            Cases tab's "On the roadmap" preset display.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportPdf}
          disabled={roadmapCases.length === 0}
        >
          Export PDF
        </Button>
      </header>

      {roadmapCases.length === 0 ? (
        <EmptyState
          title="Nothing on the roadmap yet"
          description="Cases land here once they're moved to the Roadmapped pipeline status — usually after RICE scoring crosses the roadmap threshold."
          action={
            <Link to="/dashboard" className="inline-flex">
              <Button variant="primary">Open cases</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <span>
              {roadmapCases.length} {roadmapCases.length === 1 ? "case" : "cases"} on the roadmap
            </span>
            <span className="text-slate-500">
              Tip: grab the handle on the left of any card to reorder
            </span>
          </div>
          <RoadmapList
            cases={roadmapCases}
            sortable
            onReorder={handleReorder}
          />
        </>
      )}
    </div>
  );
}
