import { PIPELINE_STATUS, PRIORITY, REQUEST_TYPE } from "./constants.js";

export const A11Y = {
  blue: "#0072B2",
  sky: "#56B4E9",
  orange: "#E69F00",
  vermillion: "#D55E00",
  teal: "#009E73",
  yellow: "#CCAA00",
  purple: "#CC79A7",
  grey: "#999999",
  slate: "#64748B",
};

export const PRIORITY_A11Y = {
  Critical: A11Y.vermillion,
  High: A11Y.orange,
  Normal: A11Y.blue,
  Low: A11Y.grey,
};

export const REQUEST_TYPE_A11Y = {
  [REQUEST_TYPE.BUG]: A11Y.vermillion,
  [REQUEST_TYPE.TOOLING]: A11Y.blue,
  [REQUEST_TYPE.NEW_BUILD]: A11Y.teal,
};

export const PIPELINE_A11Y = {
  [PIPELINE_STATUS.INITIATED]: {
    fill: A11Y.blue,
    label: "New",
    badge: { bg: "#E8F1F8", text: "#005A8C", ring: "#0072B2" },
    accent: A11Y.blue,
  },
  [PIPELINE_STATUS.SUBMITTED]: {
    fill: A11Y.orange,
    label: "Under Review",
    badge: { bg: "#FDF5E6", text: "#B45309", ring: "#E69F00" },
    accent: A11Y.orange,
  },
  [PIPELINE_STATUS.ROADMAPPED]: {
    fill: A11Y.teal,
    label: "Roadmapped",
    badge: { bg: "#E6F5F0", text: "#007055", ring: "#009E73" },
    accent: A11Y.teal,
  },
  [PIPELINE_STATUS.ON_HOLD]: {
    fill: A11Y.purple,
    label: "On Hold",
    badge: { bg: "#F9EEF4", text: "#9E4770", ring: "#CC79A7" },
    accent: A11Y.purple,
  },
  [PIPELINE_STATUS.DECLINED]: {
    fill: A11Y.vermillion,
    label: "Declined",
    badge: { bg: "#FDEDE6", text: "#B34700", ring: "#D55E00" },
    accent: A11Y.vermillion,
  },
};

export const PRIORITY_BADGE_A11Y = {
  [PRIORITY.P3]: { bg: "#FDEDE6", text: "#B34700", ring: "#D55E00" },
  [PRIORITY.P2]: { bg: "#FDF5E6", text: "#B45309", ring: "#E69F00" },
  [PRIORITY.P1]: { bg: "#E8F1F8", text: "#005A8C", ring: "#0072B2" },
  [PRIORITY.P0]: { bg: "#F1F5F9", text: "#64748B", ring: "#999999" },
};

export const REQUEST_BADGE_A11Y = {
  [REQUEST_TYPE.BUG]: { bg: "#FDEDE6", text: "#B34700", ring: "#D55E00" },
  [REQUEST_TYPE.TOOLING]: { bg: "#E8F1F8", text: "#005A8C", ring: "#0072B2" },
  [REQUEST_TYPE.NEW_BUILD]: { bg: "#E6F5F0", text: "#007055", ring: "#009E73" },
};

export const CHART_RICE_BAR = A11Y.blue;
export const CHART_GAUGE = A11Y.blue;
export const CHART_TYPE_SEQUENCE = [A11Y.blue, A11Y.orange, A11Y.teal];

export const CRITICAL_SURFACE = {
  bg: "#FDEDE6",
  border: "#D55E00",
  text: "#7C2D12",
};

export function badgeInlineStyle(tokens) {
  if (!tokens) {
    return {
      backgroundColor: "#F1F5F9",
      color: "#64748B",
      boxShadow: "inset 0 0 0 1px #CBD5E1",
    };
  }
  return {
    backgroundColor: tokens.bg,
    color: tokens.text,
    boxShadow: "inset 0 0 0 1px " + tokens.ring,
  };
}
