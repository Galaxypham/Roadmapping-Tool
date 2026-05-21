import {
  DEFAULT_RICE_CONFIG,
  RICE_CONFIDENCE_VALUES,
  RICE_IMPACT_VALUES,
} from "./constants.js";

export const RICE_DIMENSIONS = ["reach", "impact", "confidence", "effort"];

// Industry-standard RICE (Intercom, 2017):
//   Score = (Reach × Impact × Confidence) / Effort
//
// - Reach: positive number (people/events per fixed time window)
// - Impact: one of the canonical multipliers (0.25 / 0.5 / 1 / 2 / 3)
// - Confidence: percentage as decimal (0.5 / 0.8 / 1.0)
// - Effort: positive number in person-months (allows halves)
//
// The result is in the same units as Reach (per the chosen time window),
// scaled by impact depth and discounted by confidence and cost.
export function calculateRice(scores, _config) {
  if (!scores) return null;
  const { reach, impact, confidence, effort } = scores;
  if (
    !isValidReach(reach) ||
    !isValidImpact(impact) ||
    !isValidConfidence(confidence) ||
    !isValidEffort(effort)
  ) {
    return null;
  }

  const numerator = Number(reach) * Number(impact) * Number(confidence);
  const denominator = Number(effort);
  if (denominator === 0) return null;

  return Math.round((numerator / denominator) * 100) / 100;
}

export function getRoadmapThreshold(config) {
  return config?.roadmap_threshold ?? DEFAULT_RICE_CONFIG.roadmap_threshold;
}

export function meetsRoadmapThreshold(total, config) {
  if (total == null) return false;
  return total > getRoadmapThreshold(config);
}

// Per-dimension validators — each RICE input has its own valid domain.
export function isValidReach(value) {
  if (value == null || value === "") return false;
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

export function isValidImpact(value) {
  if (value == null || value === "") return false;
  const n = Number(value);
  return RICE_IMPACT_VALUES.includes(n);
}

export function isValidConfidence(value) {
  if (value == null || value === "") return false;
  const n = Number(value);
  return RICE_CONFIDENCE_VALUES.includes(n);
}

export function isValidEffort(value) {
  if (value == null || value === "") return false;
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

// Single-call validator used by AppContext when rehydrating cases.
export function isValidRiceScores(scores) {
  if (!scores) return false;
  return (
    isValidReach(scores.reach) &&
    isValidImpact(scores.impact) &&
    isValidConfidence(scores.confidence) &&
    isValidEffort(scores.effort)
  );
}

// Display helpers — keep numeric formatting consistent across UI/PDF/logs.
export function formatReach(value) {
  if (value == null) return "—";
  return Number(value).toLocaleString();
}

export function formatImpact(value) {
  if (value == null) return "—";
  const n = Number(value);
  const label = {
    3: "Massive",
    2: "High",
    1: "Medium",
    0.5: "Low",
    0.25: "Minimal",
  }[n];
  return label ? `${label} (${n}×)` : `${n}×`;
}

export function formatConfidence(value) {
  if (value == null) return "—";
  return Math.round(Number(value) * 100) + "%";
}

export function formatEffort(value) {
  if (value == null) return "—";
  const n = Number(value);
  return n === 1 ? "1 person-month" : `${n} person-months`;
}

export function formatRiceSummary(scores, total) {
  return (
    "Reach " +
    formatReach(scores.reach) +
    ", Impact " +
    formatImpact(scores.impact) +
    ", Confidence " +
    formatConfidence(scores.confidence) +
    ", Effort " +
    formatEffort(scores.effort) +
    (total != null ? " (Score: " + total + ")" : "")
  );
}

export function emptyRice() {
  return {
    reach: null,
    impact: null,
    confidence: null,
    effort: null,
    weighted_total: null,
    scored_by: null,
    scored_at: null,
  };
}
