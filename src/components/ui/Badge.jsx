import {
  LIFECYCLE_STATUS,
  PIPELINE_STATUS,
  PRIORITY,
  REQUEST_TYPE,
} from "../../lib/constants.js";
import {
  PIPELINE_A11Y,
  PRIORITY_BADGE_A11Y,
  REQUEST_BADGE_A11Y,
  badgeInlineStyle,
} from "../../lib/accessibleColors.js";

// Pill-shaped badge with a neutral default style.
// Variant-specific badges below pick the right colour by mapping the value.

const BASE =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

export function Badge({ children, className = "", title }) {
  return (
    <span className={`${BASE} bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200 ${className}`} title={title}>
      {children}
    </span>
  );
}

// Each status uses a distinctive SVG glyph so the badge is recognizable
// by shape alone — important for colorblind users and small previews.
function PipelineStatusIcon({ status, color }) {
  const stroke = color || "currentColor";
  const fill = color || "currentColor";
  switch (status) {
    case PIPELINE_STATUS.INITIATED:
      // open circle - "new"
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <circle cx="6" cy="6" r="4" fill="none" stroke={stroke} strokeWidth="2" />
        </svg>
      );
    case PIPELINE_STATUS.SUBMITTED:
      // upward arrow - "submitted for review"
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path d="M6 2 L10 7 L7.5 7 L7.5 10 L4.5 10 L4.5 7 L2 7 Z" fill={fill} />
        </svg>
      );
    case PIPELINE_STATUS.ROADMAPPED:
      // checkmark - "approved"
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path
            d="M2 6.5 L5 9.5 L10 3"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case PIPELINE_STATUS.ON_HOLD:
      // pause bars - "paused"
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <rect x="3" y="2.5" width="2" height="7" fill={fill} rx="0.5" />
          <rect x="7" y="2.5" width="2" height="7" fill={fill} rx="0.5" />
        </svg>
      );
    case PIPELINE_STATUS.DECLINED:
      // X - "declined"
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path
            d="M3 3 L9 9 M9 3 L3 9"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return (
        <span className="h-1.5 w-1.5 rounded-full opacity-80" style={{ backgroundColor: color }} />
      );
  }
}

export function PipelineStatusBadge({ status }) {
  const tokens = PIPELINE_A11Y[status];
  return (
    <span className={BASE} style={badgeInlineStyle(tokens)}>
      <PipelineStatusIcon status={status} color={tokens?.ring} />
      {status}
    </span>
  );
}

const LIFECYCLE_STYLES = {
  [LIFECYCLE_STATUS.DISCOVERY]: "bg-slate-50 text-slate-600 ring-slate-200",
  [LIFECYCLE_STATUS.DEFINITION]: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  [LIFECYCLE_STATUS.DESIGN]: "bg-violet-50 text-violet-700 ring-violet-200",
  [LIFECYCLE_STATUS.DEVELOPMENT]: "bg-blue-50 text-blue-700 ring-blue-200",
  [LIFECYCLE_STATUS.QA]: "bg-amber-50 text-amber-700 ring-amber-200",
  [LIFECYCLE_STATUS.STAGING]: "bg-teal-50 text-teal-700 ring-teal-200",
  [LIFECYCLE_STATUS.RELEASED]: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  [LIFECYCLE_STATUS.DEPRECATED]: "bg-slate-100 text-slate-500 ring-slate-200",
};

export function LifecycleStatusBadge({ status }) {
  if (!status) {
    return (
      <span className={`${BASE} bg-transparent text-slate-400 ring-1 ring-inset ring-slate-200 italic`}>
        Not started
      </span>
    );
  }
  const cls = LIFECYCLE_STYLES[status] || "bg-slate-100 text-slate-700 ring-slate-200";
  return <span className={`${BASE} ${cls} ring-1 ring-inset`}>{status}</span>;
}

export function RequestTypeBadge({ type }) {
  return (
    <span className={BASE} style={badgeInlineStyle(REQUEST_BADGE_A11Y[type])}>
      {type}
    </span>
  );
}

function PriorityIcon({ priority, color }) {
  const fill = color || "currentColor";
  switch (priority) {
    case PRIORITY.P3: // Critical - filled triangle (warning)
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path d="M6 1.5 L11 10.5 L1 10.5 Z" fill={fill} />
        </svg>
      );
    case PRIORITY.P2: // High - solid up-arrow
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path d="M6 2 L10 7 L7.5 7 L7.5 10 L4.5 10 L4.5 7 L2 7 Z" fill={fill} />
        </svg>
      );
    case PRIORITY.P1: // Normal - horizontal dash
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <rect x="2" y="5" width="8" height="2" fill={fill} rx="1" />
        </svg>
      );
    case PRIORITY.P0: // Low - down-arrow
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path d="M6 10 L2 5 L4.5 5 L4.5 2 L7.5 2 L7.5 5 L10 5 Z" fill={fill} />
        </svg>
      );
    default:
      return null;
  }
}

export function PriorityBadge({ priority }) {
  const tokens = PRIORITY_BADGE_A11Y[priority];
  return (
    <span className={BASE} style={badgeInlineStyle(tokens)}>
      <PriorityIcon priority={priority} color={tokens?.ring} />
      {priority}
    </span>
  );
}

export function RoleBadge({ role }) {
  const labels = {
    PM: "Product Manager",
    BR: "Business Requestor",
    LEADERSHIP: "Leadership",
  };
  const styles = {
    PM: "bg-accent-50 text-accent-800 ring-accent-200",
    BR: "bg-slate-100 text-slate-700 ring-slate-200",
    LEADERSHIP: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  };
  const label = labels[role] || "—";
  const cls = styles[role] || "bg-slate-100 text-slate-700 ring-slate-200";
  return <span className={`${BASE} ${cls} ring-1 ring-inset`}>{label}</span>;
}
