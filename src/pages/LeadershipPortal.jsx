import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { isOnRoadmap, PIPELINE_STATUS } from "../lib/constants.js";
import { RoadmapList } from "../components/roadmap/RoadmapList.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Tabs, TabPanel } from "../components/ui/Tabs.jsx";
import {
  computeAgingInStage,
  computeDecisionOutcomes,
  computeDeliveryScoreboard,
  computeIntakeTrend,
  computeLifecycleFunnel,
  computeRecentReleases,
  computeRoadmapByType,
  computeStalledCritical,
} from "../lib/leadershipAnalytics.js";
import {
  AgingInStage,
  DecisionOutcomes,
  DeliveryScoreboard,
  IntakeTrend,
  LifecycleFunnel,
  ReleasesTimeline,
  RoadmapByType,
  StalledCritical,
} from "../components/leadership/LeadershipPanels.jsx";
import { DrillDownModal } from "../components/leadership/DrillDownModal.jsx";
import { formatDate } from "../lib/format.js";

const TABS = {
  ROADMAP: "roadmap",
  HEALTH: "health",
  TRENDS: "trends",
};

const TAB_DESCRIPTIONS = {
  [TABS.ROADMAP]: "The official roadmap — what the Product team is working on next, in order.",
  [TABS.HEALTH]: "Pipeline health right now: what's shipping, what's in flight, and what's stuck.",
  [TABS.TRENDS]: "How intake, decisions, and releases are trending over time.",
};

const DECISION_LABELS = {
  [PIPELINE_STATUS.ROADMAPPED]: "Roadmapped",
  [PIPELINE_STATUS.ON_HOLD]: "On Hold",
  [PIPELINE_STATUS.DECLINED]: "Declined",
};

function Panel({ title, action, children, className = "" }) {
  return (
    <section
      className={
        "rounded-xl border border-slate-300 bg-slate-50 p-5 shadow-card " + className
      }
    >
      {title || action ? (
        <header className="mb-4 flex items-center justify-between gap-3">
          {title ? (
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          ) : (
            <span />
          )}
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export default function LeadershipPortal() {
  const { cases, role, userName, canViewCase } = useApp();
  const [tab, setTab] = useState(TABS.ROADMAP);
  // null when closed; otherwise { title, subtitle, rows }
  const [drillDown, setDrillDown] = useState(null);

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

  const scoreboard = useMemo(() => computeDeliveryScoreboard(cases), [cases]);
  const funnel = useMemo(() => computeLifecycleFunnel(cases), [cases]);
  const aging = useMemo(() => computeAgingInStage(cases, 6), [cases]);
  const stalled = useMemo(() => computeStalledCritical(cases), [cases]);

  const recentReleases = useMemo(() => computeRecentReleases(cases, 8), [cases]);
  const intake = useMemo(() => computeIntakeTrend(cases, 12), [cases]);
  const outcomes = useMemo(() => computeDecisionOutcomes(cases, 90), [cases]);
  const roadmapByType = useMemo(() => computeRoadmapByType(cases), [cases]);

  // Drill-down handlers — every clickable metric ends here so users never
  // hit a dead button.
  const openScoreboardDrillDown = (key) => {
    if (key === "releasedThisQuarter") {
      const rows = scoreboard.releasedThisQuarter.rows.map((r) => ({
        caseObj: r.caseObj,
        meta: "Released " + formatDate(r.releasedAt),
      }));
      setDrillDown({
        title: "Released this quarter",
        subtitle: `${rows.length} case${rows.length === 1 ? "" : "s"} released since the start of the current quarter`,
        rows,
      });
      return;
    }
    if (key === "inFlight") {
      const rows = scoreboard.inFlight.cases.map((c) => ({
        caseObj: c,
        meta: c.lifecycle_status,
      }));
      setDrillDown({
        title: "In flight",
        subtitle: `${rows.length} roadmapped case${rows.length === 1 ? "" : "s"} between Definition and Staging`,
        rows,
      });
      return;
    }
    if (key === "notStarted") {
      const rows = scoreboard.notStarted.cases.map((c) => ({
        caseObj: c,
        meta: c.lifecycle_status || "Discovery",
      }));
      setDrillDown({
        title: "Roadmapped, not started",
        subtitle: `${rows.length} roadmapped case${rows.length === 1 ? "" : "s"} still in Discovery`,
        rows,
      });
      return;
    }
    if (key === "cycle") {
      const rows = scoreboard.cycle.rows.map((r) => ({
        caseObj: r.caseObj,
        meta: `Released ${formatDate(r.releasedAt)} · ${r.cycleDays}d cycle`,
      }));
      setDrillDown({
        title: "Median cycle time — recent releases",
        subtitle: `${rows.length} release${rows.length === 1 ? "" : "s"} in the last 180 days · median ${scoreboard.cycle.medianDays ?? "—"}d`,
        rows,
      });
      return;
    }
  };

  const openFunnelDrillDown = (row) => {
    if (!row || row.count === 0) return;
    const rows = row.cases.map((c) => ({
      caseObj: c,
      meta: row.stage,
    }));
    setDrillDown({
      title: `${row.stage} — lifecycle stage`,
      subtitle: `${rows.length} roadmapped case${rows.length === 1 ? "" : "s"} currently in ${row.stage}`,
      rows,
    });
  };

  const openIntakeDrillDown = (bucket) => {
    if (!bucket || bucket.count === 0) return;
    const rows = bucket.cases.map((c) => ({
      caseObj: c,
      meta: "Submitted " + formatDate(c.created_at),
    }));
    const weekEnd = new Date(bucket.end.getTime() - 1);
    setDrillDown({
      title: `Submissions for week of ${formatDate(bucket.start.toISOString())}`,
      subtitle: `${rows.length} submission${rows.length === 1 ? "" : "s"} between ${formatDate(bucket.start.toISOString())} and ${formatDate(weekEnd.toISOString())}`,
      rows,
    });
  };

  const openDecisionDrillDown = (key) => {
    const cs = outcomes.casesByOutcome[key] || [];
    const rows = cs.map((c) => ({ caseObj: c, meta: DECISION_LABELS[key] }));
    if (rows.length === 0) return;
    setDrillDown({
      title: `${DECISION_LABELS[key]} — last ${outcomes.windowDays} days`,
      subtitle: `${rows.length} unique case${rows.length === 1 ? "" : "s"} that landed in ${DECISION_LABELS[key]} during this window`,
      rows,
    });
  };

  const openRoadmapTypeDrillDown = (row) => {
    if (!row || row.value === 0) return;
    const rows = row.cases.map((c) => ({
      caseObj: c,
      meta: c.lifecycle_status || "Discovery",
    }));
    setDrillDown({
      title: `Roadmap — ${row.label}`,
      subtitle: `${rows.length} ${row.label} case${rows.length === 1 ? "" : "s"} on the roadmap`,
      rows,
    });
  };

  if (!role) {
    return (
      <EmptyState
        title="Insights unavailable"
        description="Pick a role from the welcome page to continue."
        action={
          <Link to="/welcome" className="inline-flex">
            <Button variant="primary">Choose a role</Button>
          </Link>
        }
      />
    );
  }

  if (cases.length === 0) {
    return (
      <EmptyState
        title="No problem statements yet"
        action={
          <Link to="/welcome" className="inline-flex">
            <Button variant="primary">Switch portal</Button>
          </Link>
        }
      />
    );
  }

  const tabs = [
    { id: TABS.ROADMAP, label: "Official Roadmap", count: roadmapCases.length },
    { id: TABS.HEALTH, label: "Health" },
    { id: TABS.TRENDS, label: "Trends" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Insights
          </h1>
          <p className="mt-1 text-sm text-slate-500">{TAB_DESCRIPTIONS[tab]}</p>
        </div>
        <Link to="/dashboard" className="inline-flex">
          <Button variant="secondary" size="sm">Open cases</Button>
        </Link>
      </header>

      <Tabs tabs={tabs} value={tab} onChange={setTab} ariaLabel="Leadership view" />

      <TabPanel id={TABS.ROADMAP} value={tab}>
        <Panel
          title={`Official Roadmap (${roadmapCases.length})`}
          action={
            roadmapCases.length > 0 ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  const { exportRoadmapPdf } = await import(
                    "../lib/dashboardPdf.js"
                  );
                  exportRoadmapPdf({
                    cases: roadmapCases,
                    canViewCase,
                    userName,
                    role,
                  });
                }}
              >
                Export PDF
              </Button>
            ) : null
          }
        >
          {roadmapCases.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nothing on the roadmap yet. Cases land here once the Product team
              moves them to the Roadmapped pipeline status.
            </p>
          ) : (
            <RoadmapList cases={roadmapCases} sortable={false} />
          )}
        </Panel>
      </TabPanel>

      <TabPanel id={TABS.HEALTH} value={tab}>
        <div className="space-y-4">
          <DeliveryScoreboard
            stats={scoreboard}
            onSelect={openScoreboardDrillDown}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Panel
              title="Lifecycle funnel"
              action={
                <span className="text-xs text-slate-500">Click a stage</span>
              }
            >
              <LifecycleFunnel funnel={funnel} onSelect={openFunnelDrillDown} />
            </Panel>
            <Panel
              title="Stalled critical work"
              action={
                <span className="text-xs text-slate-500">
                  Critical priority, not yet in development
                </span>
              }
            >
              <StalledCritical cases={stalled} />
            </Panel>
          </div>

          <Panel
            title="Aging in stage"
            action={
              <span className="text-xs text-slate-500">
                Roadmapped cases sitting longest in their current stage
              </span>
            }
          >
            <AgingInStage rows={aging} />
          </Panel>
        </div>
      </TabPanel>

      <TabPanel id={TABS.TRENDS} value={tab}>
        <div className="space-y-4">
          <Panel
            title="Intake volume (last 12 weeks)"
            action={
              <span className="text-xs text-slate-500">Click a week</span>
            }
          >
            <IntakeTrend buckets={intake} onSelect={openIntakeDrillDown} />
          </Panel>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Panel
              title="Decision outcomes"
              action={
                <span className="text-xs text-slate-500">
                  Last {outcomes.windowDays} days
                </span>
              }
            >
              <DecisionOutcomes
                outcomes={outcomes}
                onSelect={openDecisionDrillDown}
              />
            </Panel>
            <Panel
              title="Roadmap composition"
              action={
                <span className="text-xs text-slate-500">Click a type</span>
              }
            >
              <RoadmapByType
                rows={roadmapByType}
                onSelect={openRoadmapTypeDrillDown}
              />
            </Panel>
          </div>

          <Panel
            title="Recent releases"
            action={
              <span className="text-xs text-slate-500">
                Cases that reached Released, newest first
              </span>
            }
          >
            <ReleasesTimeline rows={recentReleases} />
          </Panel>
        </div>
      </TabPanel>

      <DrillDownModal
        open={drillDown != null}
        title={drillDown?.title}
        subtitle={drillDown?.subtitle}
        rows={drillDown?.rows || []}
        onClose={() => setDrillDown(null)}
      />
    </div>
  );
}
