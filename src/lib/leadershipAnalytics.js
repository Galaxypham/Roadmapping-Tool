// Pure compute helpers for the leadership Dashboard's Health and Trends views.
// Everything here is derived strictly from the existing case + activity-log
// shape so we don't have to migrate or persist any new fields.
//
// Each "compute*" helper returns both the headline number(s) AND the underlying
// cases so the UI can show drill-down lists when leadership clicks a metric.

import {
  ACTION_TYPE,
  isCriticalPriority,
  isOnRoadmap,
  LIFECYCLE_STATUS,
  LIFECYCLE_STATUS_ORDER,
  PIPELINE_STATUS,
  REQUEST_TYPE_ORDER,
} from "./constants.js";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function activityLog(caseObj) {
  return Array.isArray(caseObj?.activity_log) ? caseObj.activity_log : [];
}

// First time the case became Roadmapped, falling back to status_changed_at
// when the activity log is missing the transition (e.g. seed data).
export function getRoadmappedAt(caseObj) {
  for (const a of activityLog(caseObj)) {
    if (
      a.action_type === ACTION_TYPE.STATUS_CHANGED &&
      typeof a.action_detail === "string" &&
      a.action_detail.includes("-> " + PIPELINE_STATUS.ROADMAPPED)
    ) {
      return a.timestamp;
    }
  }
  if (isOnRoadmap(caseObj)) return caseObj?.status_changed_at || null;
  return null;
}

// First time the case entered the Released lifecycle stage.
export function getReleasedAt(caseObj) {
  for (const a of activityLog(caseObj)) {
    if (
      a.action_type === ACTION_TYPE.LIFECYCLE_CHANGED &&
      typeof a.action_detail === "string" &&
      a.action_detail.includes("-> " + LIFECYCLE_STATUS.RELEASED)
    ) {
      return a.timestamp;
    }
  }
  if (caseObj?.lifecycle_status === LIFECYCLE_STATUS.RELEASED) {
    return caseObj?.status_changed_at || null;
  }
  return null;
}

// When did the case enter its *current* lifecycle stage? Used for "aging in
// stage". Falls back to roadmapped-at for cases still in their first stage.
export function getStageEnteredAt(caseObj) {
  const stage = caseObj?.lifecycle_status;
  if (!stage) return null;
  const log = activityLog(caseObj);
  for (let i = log.length - 1; i >= 0; i--) {
    const a = log[i];
    if (
      a.action_type === ACTION_TYPE.LIFECYCLE_CHANGED &&
      typeof a.action_detail === "string" &&
      a.action_detail.includes("-> " + stage)
    ) {
      return a.timestamp;
    }
  }
  return getRoadmappedAt(caseObj);
}

function diffDays(fromIso, toIso) {
  if (!fromIso || !toIso) return null;
  const a = new Date(fromIso).getTime();
  const b = new Date(toIso).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.max(0, Math.round((b - a) / MS_PER_DAY));
}

function median(nums) {
  if (!nums.length) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function startOfQuarter(now = new Date()) {
  const m = Math.floor(now.getMonth() / 3) * 3;
  return new Date(now.getFullYear(), m, 1, 0, 0, 0, 0);
}

// One-stop computation for the Health "scoreboard" tiles. Each bucket carries
// both a count and the cases that went into it so the UI can drill down.
export function computeDeliveryScoreboard(cases) {
  const now = new Date();
  const qStart = startOfQuarter(now);
  const cycleCutoff = now.getTime() - 180 * MS_PER_DAY;

  const released = []; // { caseObj, releasedAt, cycleDays? }
  const inFlight = [];
  const notStarted = [];
  const cycleSamples = []; // { caseObj, cycleDays, releasedAt }

  for (const c of cases) {
    if (!isOnRoadmap(c)) continue;

    const stage = c.lifecycle_status;
    const releasedAt = getReleasedAt(c);

    if (releasedAt) {
      const t = new Date(releasedAt).getTime();
      if (!Number.isNaN(t) && t >= qStart.getTime()) {
        released.push({ caseObj: c, releasedAt });
      }
      const cycleDays = diffDays(getRoadmappedAt(c), releasedAt);
      if (cycleDays != null && new Date(releasedAt).getTime() >= cycleCutoff) {
        cycleSamples.push({ caseObj: c, cycleDays, releasedAt });
      }
    }

    const isReleasedOrDeprecated =
      stage === LIFECYCLE_STATUS.RELEASED ||
      stage === LIFECYCLE_STATUS.DEPRECATED;
    if (isReleasedOrDeprecated) continue;

    if (!stage || stage === LIFECYCLE_STATUS.DISCOVERY) {
      notStarted.push(c);
    } else {
      inFlight.push(c);
    }
  }

  // Sort cycle samples newest first so drill-down reads chronologically.
  cycleSamples.sort((a, b) => new Date(b.releasedAt) - new Date(a.releasedAt));
  released.sort((a, b) => new Date(b.releasedAt) - new Date(a.releasedAt));

  return {
    releasedThisQuarter: {
      count: released.length,
      rows: released,
    },
    inFlight: {
      count: inFlight.length,
      cases: inFlight,
    },
    notStarted: {
      count: notStarted.length,
      cases: notStarted,
    },
    cycle: {
      medianDays: median(cycleSamples.map((s) => s.cycleDays)),
      sampleSize: cycleSamples.length,
      rows: cycleSamples,
    },
  };
}

// Counts of every roadmapped case by lifecycle stage (with cases attached for
// drill-down). Cases without an explicit stage are treated as Discovery.
export function computeLifecycleFunnel(cases) {
  const buckets = {};
  for (const s of LIFECYCLE_STATUS_ORDER) buckets[s] = [];
  for (const c of cases) {
    if (!isOnRoadmap(c)) continue;
    const stage = c.lifecycle_status || LIFECYCLE_STATUS.DISCOVERY;
    if (!buckets[stage]) buckets[stage] = [];
    buckets[stage].push(c);
  }
  return LIFECYCLE_STATUS_ORDER.map((stage) => ({
    stage,
    count: buckets[stage].length,
    cases: buckets[stage],
  }));
}

// Roadmapped cases that have been sitting in their current lifecycle stage
// the longest. Excludes Released and Deprecated since those aren't "stuck".
export function computeAgingInStage(cases, limit = 6) {
  const rows = [];
  for (const c of cases) {
    if (!isOnRoadmap(c)) continue;
    const stage = c.lifecycle_status || LIFECYCLE_STATUS.DISCOVERY;
    if (
      stage === LIFECYCLE_STATUS.RELEASED ||
      stage === LIFECYCLE_STATUS.DEPRECATED
    ) {
      continue;
    }
    const enteredAt = getStageEnteredAt(c);
    const days = enteredAt ? diffDays(enteredAt, new Date().toISOString()) : 0;
    rows.push({ caseObj: c, stage, days, enteredAt });
  }
  rows.sort((a, b) => (b.days || 0) - (a.days || 0));
  return rows.slice(0, limit);
}

// Critical-priority work that's roadmapped but hasn't actually started yet
// (still in Discovery or Definition).
export function computeStalledCritical(cases) {
  return cases.filter((c) => {
    if (!isOnRoadmap(c)) return false;
    if (!isCriticalPriority(c.priority)) return false;
    const stage = c.lifecycle_status || LIFECYCLE_STATUS.DISCOVERY;
    return (
      stage === LIFECYCLE_STATUS.DISCOVERY ||
      stage === LIFECYCLE_STATUS.DEFINITION
    );
  });
}

// Last N released cases, newest first. Powers the Trends "Releases timeline".
export function computeRecentReleases(cases, limit = 8) {
  const rows = [];
  for (const c of cases) {
    const releasedAt = getReleasedAt(c);
    if (!releasedAt) continue;
    rows.push({ caseObj: c, releasedAt });
  }
  rows.sort((a, b) => new Date(b.releasedAt) - new Date(a.releasedAt));
  return rows.slice(0, limit);
}

// Weekly intake counts for the last `weeks` weeks (oldest -> newest).
// Buckets are aligned to Mondays so the chart looks consistent week to week,
// and each bucket carries the cases submitted in that week for drill-down.
export function computeIntakeTrend(cases, weeks = 12) {
  const now = new Date();
  const day = now.getDay();
  const offsetToMonday = (day + 6) % 7;
  const thisMonday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - offsetToMonday,
    0,
    0,
    0,
    0,
  );

  const buckets = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(thisMonday.getTime() - i * 7 * MS_PER_DAY);
    const end = new Date(start.getTime() + 7 * MS_PER_DAY);
    buckets.push({ start, end, count: 0, cases: [] });
  }

  for (const c of cases) {
    if (!c.created_at) continue;
    const t = new Date(c.created_at).getTime();
    if (Number.isNaN(t)) continue;
    for (const b of buckets) {
      if (t >= b.start.getTime() && t < b.end.getTime()) {
        b.cases.push(c);
        b.count++;
        break;
      }
    }
  }

  return buckets;
}

// Of all status transitions in the last `windowDays` days, count how many
// landed in each terminal-ish bucket (Roadmapped / On Hold / Declined).
// We look at activity log entries so a case that flipped multiple times still
// gets tallied per decision; the drill-down list dedupes by case so leadership
// sees a clean roster.
export function computeDecisionOutcomes(cases, windowDays = 90) {
  const cutoff = Date.now() - windowDays * MS_PER_DAY;
  const targets = [
    PIPELINE_STATUS.ROADMAPPED,
    PIPELINE_STATUS.ON_HOLD,
    PIPELINE_STATUS.DECLINED,
  ];
  const counts = Object.fromEntries(targets.map((t) => [t, 0]));
  const caseSets = Object.fromEntries(targets.map((t) => [t, new Map()]));

  for (const c of cases) {
    for (const a of activityLog(c)) {
      if (a.action_type !== ACTION_TYPE.STATUS_CHANGED) continue;
      if (typeof a.action_detail !== "string") continue;
      const t = new Date(a.timestamp).getTime();
      if (Number.isNaN(t) || t < cutoff) continue;
      for (const target of targets) {
        if (a.action_detail.includes("-> " + target)) {
          counts[target]++;
          if (!caseSets[target].has(c.id)) caseSets[target].set(c.id, c);
          break;
        }
      }
    }
  }

  const total = targets.reduce((s, t) => s + counts[t], 0);
  const casesByOutcome = Object.fromEntries(
    targets.map((t) => [t, Array.from(caseSets[t].values())]),
  );

  return { counts, casesByOutcome, total, windowDays };
}

// Roadmap mix by request type — only counts cases currently on the roadmap.
export function computeRoadmapByType(cases) {
  return REQUEST_TYPE_ORDER.map((label) => {
    const filtered = cases.filter(
      (c) => isOnRoadmap(c) && c.request_type === label,
    );
    return { label, value: filtered.length, cases: filtered };
  });
}
