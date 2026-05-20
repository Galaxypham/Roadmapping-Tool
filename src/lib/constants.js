// Centralized constants for the PS Intake Tool.
// Every status / type / priority literal lives here so the rest of the
// codebase never hard-codes display strings or compares raw values.

export const ROLES = {
  BR: "BR",
  PM: "PM",
  LEADERSHIP: "LEADERSHIP",
};

export const ROLE_LABELS = {
  BR: "Business Requestor",
  PM: "Product Manager",
  LEADERSHIP: "Leadership",
};

// Default landing route after role selection (each portal has its own home).
export function getRoleHomePath(role) {
  switch (role) {
    case ROLES.PM:
      return "/pm";
    case ROLES.LEADERSHIP:
      return "/leadership";
    case ROLES.BR:
    default:
      return "/br";
  }
}

// Pipeline statuses — the lifecycle of a request from submission to outcome.
// The "In Triage" intermediate stage was removed; PMs now move New cases
// straight to Under Review (typically by submitting a RICE score).
export const PIPELINE_STATUS = {
  INITIATED: "New",
  SUBMITTED: "Under Review",
  ROADMAPPED: "Roadmapped",
  ON_HOLD: "On Hold",
  DECLINED: "Declined",
};

// Maps legacy pipeline status labels from older saved data. Cases that
// were sitting in the retired "In Triage" stage are folded into "Under
// Review" since that's where PM scoring work lands today.
export function migratePipelineStatus(status) {
  if (!status) return status;
  const legacy = {
    "PS Initiated": PIPELINE_STATUS.INITIATED,
    "PS In-Progress": PIPELINE_STATUS.SUBMITTED,
    "PS Submitted": PIPELINE_STATUS.SUBMITTED,
    "PS Roadmapped": PIPELINE_STATUS.ROADMAPPED,
    "PS On Hold": PIPELINE_STATUS.ON_HOLD,
    "PS Declined": PIPELINE_STATUS.DECLINED,
    "In Triage": PIPELINE_STATUS.SUBMITTED,
  };
  return legacy[status] || status;
}

// Strips the legacy "PS" prefix from saved case numbers (e.g. "PS001 | X" -> "001 | X").
export function migrateCaseNumber(caseNumber) {
  if (!caseNumber || typeof caseNumber !== "string") return caseNumber;
  return caseNumber.replace(/^PS(\d{3,})/, "$1");
}

export const PIPELINE_STATUS_ORDER = [
  PIPELINE_STATUS.INITIATED,
  PIPELINE_STATUS.SUBMITTED,
  PIPELINE_STATUS.ROADMAPPED,
  PIPELINE_STATUS.ON_HOLD,
  PIPELINE_STATUS.DECLINED,
];

// Product lifecycle statuses — only populated once a case is roadmapped.
export const LIFECYCLE_STATUS = {
  DISCOVERY: "Discovery",
  DEFINITION: "Definition",
  DESIGN: "Design",
  DEVELOPMENT: "Development",
  QA: "QA / Testing",
  STAGING: "Staging",
  RELEASED: "Released",
  DEPRECATED: "Deprecated",
};

export const LIFECYCLE_STATUS_ORDER = [
  LIFECYCLE_STATUS.DISCOVERY,
  LIFECYCLE_STATUS.DEFINITION,
  LIFECYCLE_STATUS.DESIGN,
  LIFECYCLE_STATUS.DEVELOPMENT,
  LIFECYCLE_STATUS.QA,
  LIFECYCLE_STATUS.STAGING,
  LIFECYCLE_STATUS.RELEASED,
  LIFECYCLE_STATUS.DEPRECATED,
];

export const REQUEST_TYPE = {
  BUG: "Bug Report",
  TOOLING: "Tooling Enhancement",
  NEW_BUILD: "New Build",
};

export const REQUEST_TYPE_ORDER = [
  REQUEST_TYPE.BUG,
  REQUEST_TYPE.TOOLING,
  REQUEST_TYPE.NEW_BUILD,
];

// Critical = highest urgency, Low = lowest.
export const PRIORITY = {
  P3: "Critical",
  P2: "High",
  P1: "Normal",
  P0: "Low",
};

export const PRIORITY_ORDER = [
  PRIORITY.P3,
  PRIORITY.P2,
  PRIORITY.P1,
  PRIORITY.P0,
];

export const DEFAULT_PRIORITY = PRIORITY.P1;

export function isCriticalPriority(priority) {
  const normalized = migratePriority(priority);
  return normalized === PRIORITY.P3;
}

export function priorityUrgency(priority) {
  const normalized = migratePriority(priority);
  if (normalized === PRIORITY.P3) return 4;
  if (normalized === PRIORITY.P2) return 3;
  if (normalized === PRIORITY.P1) return 2;
  if (normalized === PRIORITY.P0) return 1;
  return 0;
}

// Maps legacy priority labels from older saved data.
export function migratePriority(priority) {
  if (!priority) return priority;
  const legacy = {
    "P0 Critical": PRIORITY.P3,
    "P1 High": PRIORITY.P2,
    "P2 Normal": PRIORITY.P1,
    "P3 Low": PRIORITY.P0,
    "P3 Critical": PRIORITY.P3,
    "P2 High": PRIORITY.P2,
    "P1 Normal": PRIORITY.P1,
    "P0 Low": PRIORITY.P0,
  };
  return legacy[priority] || priority;
}

// Returns true if a case currently belongs on the manually-ordered roadmap.
export function isOnRoadmap(caseObj) {
  return caseObj?.pipeline_status === PIPELINE_STATUS.ROADMAPPED;
}

// Action types used in the activity log. Keeping these as constants
// makes it easy to filter or audit by action category later.
export const ACTION_TYPE = {
  CASE_CREATED: "Case Created",
  STATUS_CHANGED: "Status Changed",
  LIFECYCLE_CHANGED: "Lifecycle Status Changed",
  RICE_SCORED: "RICE Scored",
  RICE_UPDATED: "RICE Updated",
  RESTRICTED: "Case Restricted",
  UNRESTRICTED: "Case Unrestricted",
  EMAIL_ADDED: "Access Email Added",
  EMAIL_REMOVED: "Access Email Removed",
  FIELD_EDITED: "Field Edited",
  RELATED_ADDED: "Related Case Added",
  RELATED_REMOVED: "Related Case Removed",
  PM_NOTE_ADDED: "PM Note Added",
  RICE_CONFIG_CHANGED: "RICE Config Changed",
  ROADMAP_REORDERED: "Roadmap Reordered",
};

// localStorage keys — single source of truth. The "v2" suffix is a
// one-shot reset trigger for users who saw the old seed data; the
// previous "ps_*" keys are simply abandoned in the user's localStorage.
export const STORAGE_KEYS = {
  CASES: "roadmap_cases_v2",
  COUNTER: "roadmap_counter_v2",
  RICE_CONFIG: "roadmap_rice_config_v2",
  CURRENT_ROLE: "roadmap_current_role",
  CURRENT_USER_NAME: "roadmap_current_user_name",
  APP_SETTINGS: "roadmap_app_settings_v1",
};

// User-tunable display preferences. Mutable from Settings (no reason modal).
export const DEFAULT_APP_SETTINGS = {
  stale_threshold_days: 7,
};

// Default RICE weights and roadmap threshold. Mutable via Settings (PM only).
export const RICE_SCORE_MIN = 1;
export const RICE_SCORE_MAX = 5;

export const DEFAULT_RICE_CONFIG = {
  reach_weight: 1.0,
  impact_weight: 1.0,
  confidence_weight: 1.0,
  effort_weight: 1.0,
  roadmap_threshold: 20,
};

export const RICE_SCORE_OPTIONS = [1, 2, 3, 4, 5];

export const RICE_TOOLTIPS = {
  reach: {
    title: "Reach (1–5)",
    description:
      "How widely the work lands. 1 affects a small group; 5 affects most of the org or customer base.",
  },
  impact: {
    title: "Impact (1–5)",
    description:
      "Depth of benefit per person affected. 1 is minimal; 5 is transformative.",
  },
  confidence: {
    title: "Confidence (1–5)",
    description:
      "How much evidence backs your estimates. 1 is guesswork; 5 is validated data.",
  },
  effort: {
    title: "Effort (1–5)",
    description:
      "Estimated delivery cost. 1 is a small lift; 5 is a major program.",
  },
};

export const INTAKE_TOOLTIPS = {
  projectName: {
    title: "Project Name",
    description: "Short project name. Becomes part of the case number.",
  },
  priority: {
    title: "Priority",
    description:
      "Rate urgency from Low to Critical. Critical items bypass RICE and go to the top of the queue.",
  },
  supportingDocs: {
    title: "Supporting documents",
    description:
      "Optional links or PDF uploads — designs, tickets, dashboards, anything that adds context. PDFs max 5 MB each.",
  },
  contextNote: {
    title: "Context note",
    description:
      "Briefly explain how the two cases relate. Visible to anyone who can view this case.",
  },
};
