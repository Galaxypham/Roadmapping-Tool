import { priorityUrgency } from "./constants.js";

export const SORT_OPTIONS = {
  ROADMAP_ORDER: "Roadmap order",
  NEWEST: "Newest first",
  OLDEST: "Oldest first",
  RECENTLY_EDITED: "Recently edited",
  RICE_HIGH: "RICE high to low",
  PRIORITY_HIGH: "Priority high to low",
  AZ: "Name A-Z",
  ZA: "Name Z-A",
};

export const SORT_ORDER = [
  SORT_OPTIONS.ROADMAP_ORDER,
  SORT_OPTIONS.NEWEST,
  SORT_OPTIONS.OLDEST,
  SORT_OPTIONS.RECENTLY_EDITED,
  SORT_OPTIONS.RICE_HIGH,
  SORT_OPTIONS.PRIORITY_HIGH,
  SORT_OPTIONS.AZ,
  SORT_OPTIONS.ZA,
];

export function blankFilters() {
  return {
    keyword: "",
    pipeline: "",
    requestType: "",
    priority: "",
    startDate: "",
    endDate: "",
    sort: SORT_OPTIONS.NEWEST,
    mineOnly: false,
    unscored: false,
    updatedWithinDays: 0,
  };
}

// Accepts string or array; returns array of non-empty values.
function toList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value];
}

export function applyDashboardFilters(cases, filters, userName = null) {
  let list = [...cases];

  if (filters.mineOnly && userName) {
    const name = userName.toLowerCase();
    list = list.filter(
      (c) => c.requestor_name && c.requestor_name.toLowerCase() === name,
    );
  }

  if (filters.keyword?.trim()) {
    const k = filters.keyword.trim().toLowerCase();
    list = list.filter((c) =>
      [
        c.case_number,
        c.ps_name,
        c.requestor_name,
        c.team,
        c.problem_description,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(k)),
    );
  }

  const pipelineList = toList(filters.pipeline);
  if (pipelineList.length > 0) {
    const set = new Set(pipelineList);
    list = list.filter((c) => set.has(c.pipeline_status));
  }

  if (filters.requestType) {
    list = list.filter((c) => c.request_type === filters.requestType);
  }

  const priorityList = toList(filters.priority);
  if (priorityList.length > 0) {
    const set = new Set(priorityList);
    list = list.filter((c) => set.has(c.priority));
  }

  if (filters.unscored) {
    list = list.filter((c) => c.rice?.weighted_total == null);
  }

  if (filters.updatedWithinDays && filters.updatedWithinDays > 0) {
    const cutoff =
      Date.now() - filters.updatedWithinDays * 24 * 60 * 60 * 1000;
    list = list.filter((c) => {
      const ts = new Date(c.updated_at || c.created_at).getTime();
      return ts >= cutoff;
    });
  }

  if (filters.staleDaysFromStatus && filters.staleDaysFromStatus > 0) {
    const cutoff =
      Date.now() - filters.staleDaysFromStatus * 24 * 60 * 60 * 1000;
    list = list.filter((c) => {
      const ts = new Date(c.status_changed_at || c.created_at).getTime();
      return ts <= cutoff;
    });
  }

  if (filters.startDate) {
    const start = new Date(filters.startDate).getTime();
    list = list.filter((c) => new Date(c.created_at).getTime() >= start);
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate).getTime() + 24 * 60 * 60 * 1000;
    list = list.filter((c) => new Date(c.created_at).getTime() <= end);
  }

  switch (filters.sort) {
    case SORT_OPTIONS.ROADMAP_ORDER:
      list.sort((a, b) => {
        const ar = Number.isFinite(a.roadmap_rank) ? a.roadmap_rank : Infinity;
        const br = Number.isFinite(b.roadmap_rank) ? b.roadmap_rank : Infinity;
        if (ar !== br) return ar - br;
        return new Date(b.created_at) - new Date(a.created_at);
      });
      break;
    case SORT_OPTIONS.OLDEST:
      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      break;
    case SORT_OPTIONS.RECENTLY_EDITED:
      list.sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at) -
          new Date(a.updated_at || a.created_at),
      );
      break;
    case SORT_OPTIONS.RICE_HIGH:
      list.sort((a, b) => {
        const av = a.rice?.weighted_total ?? -Infinity;
        const bv = b.rice?.weighted_total ?? -Infinity;
        if (bv !== av) return bv - av;
        return new Date(b.created_at) - new Date(a.created_at);
      });
      break;
    case SORT_OPTIONS.PRIORITY_HIGH:
      list.sort((a, b) => {
        const diff = priorityUrgency(b.priority) - priorityUrgency(a.priority);
        if (diff !== 0) return diff;
        return new Date(b.created_at) - new Date(a.created_at);
      });
      break;
    case SORT_OPTIONS.AZ:
      list.sort((a, b) => a.ps_name.localeCompare(b.ps_name));
      break;
    case SORT_OPTIONS.ZA:
      list.sort((a, b) => b.ps_name.localeCompare(a.ps_name));
      break;
    case SORT_OPTIONS.NEWEST:
    default:
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return list;
}

export function hasActiveDashboardFilters(filters) {
  return (
    Boolean(filters.keyword?.trim()) ||
    toList(filters.pipeline).length > 0 ||
    Boolean(filters.requestType) ||
    toList(filters.priority).length > 0 ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate) ||
    Boolean(filters.mineOnly) ||
    Boolean(filters.unscored) ||
    Boolean(filters.updatedWithinDays && filters.updatedWithinDays > 0) ||
    Boolean(filters.staleDaysFromStatus && filters.staleDaysFromStatus > 0) ||
    filters.sort !== SORT_OPTIONS.NEWEST
  );
}

export function getPipelineTabCounts(cases, filters, userName = null) {
  const withoutPipeline = { ...filters, pipeline: "" };
  const baseList = applyDashboardFilters(cases, withoutPipeline, userName);
  const counts = { "": baseList.length };
  for (const c of baseList) {
    const status = c.pipeline_status;
    if (status) counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

export function getDashboardFilterSummary(filters) {
  const lines = [];

  if (filters.mineOnly) {
    lines.push("My cases only");
  }

  if (filters.keyword?.trim()) {
    lines.push(`Search: "${filters.keyword.trim()}"`);
  }
  const pipelineList = toList(filters.pipeline);
  if (pipelineList.length > 0) {
    lines.push(`Pipeline: ${pipelineList.join(", ")}`);
  }
  if (filters.requestType) {
    lines.push(`Type: ${filters.requestType}`);
  }
  const priorityList = toList(filters.priority);
  if (priorityList.length > 0) {
    lines.push(`Priority: ${priorityList.join(", ")}`);
  }
  if (filters.unscored) {
    lines.push("RICE: Unscored only");
  }
  if (filters.updatedWithinDays && filters.updatedWithinDays > 0) {
    lines.push(`Updated within last ${filters.updatedWithinDays} days`);
  }
  if (filters.staleDaysFromStatus && filters.staleDaysFromStatus > 0) {
    lines.push(`Stale: in stage > ${filters.staleDaysFromStatus} days`);
  }
  if (filters.startDate || filters.endDate) {
    const from = filters.startDate || "any";
    const to = filters.endDate || "any";
    lines.push(`Submitted: ${from} to ${to}`);
  }

  lines.push(`Sort: ${filters.sort || SORT_OPTIONS.NEWEST}`);

  if (!hasActiveDashboardFilters(filters)) {
    return ["All cases", `Sort: ${SORT_OPTIONS.NEWEST}`];
  }

  return lines;
}
