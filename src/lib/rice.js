import {
  DEFAULT_RICE_CONFIG,
  RICE_SCORE_MAX,
  RICE_SCORE_MIN,
} from "./constants.js";

export const RICE_DIMENSIONS = ["reach", "impact", "confidence", "effort"];

// True RICE formula: (Reach × Impact × Confidence) ÷ Effort.
// Weights act as multipliers on each dimension — reach_weight, impact_weight,
// and confidence_weight scale the numerator; effort_weight scales the
// denominator (higher = heavier penalty for costly work).
// With all weights at 1.0 this is standard unweighted RICE.
export function calculateRice(scores, config) {
  if (!scores || !config) return null;
  const { reach, impact, confidence, effort } = scores;
  if (
    reach == null ||
    impact == null ||
    confidence == null ||
    effort == null
  ) {
    return null;
  }

  const values = { reach, impact, confidence, effort };
  for (const key of RICE_DIMENSIONS) {
    const value = Number(values[key]);
    if (
      Number.isNaN(value) ||
      value < RICE_SCORE_MIN ||
      value > RICE_SCORE_MAX
    ) {
      return null;
    }
  }

  const numerator =
    Number(reach) * config.reach_weight *
    Number(impact) * config.impact_weight *
    Number(confidence) * config.confidence_weight;
  const denominator = Number(effort) * config.effort_weight;

  if (denominator === 0) return null;
  return Math.round((numerator / denominator) * 100) / 100;
}

// Maximum possible score: all numerator dimensions at 5, effort at 1 (minimum).
export function calculateMaxRiceTotal(config) {
  if (!config) return RICE_SCORE_MAX * RICE_SCORE_MAX * RICE_SCORE_MAX / RICE_SCORE_MIN;
  const numerator =
    RICE_SCORE_MAX * config.reach_weight *
    RICE_SCORE_MAX * config.impact_weight *
    RICE_SCORE_MAX * config.confidence_weight;
  const denominator = RICE_SCORE_MIN * config.effort_weight;
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

export function isValidRiceScore(value) {
  const n = Number(value);
  return !Number.isNaN(n) && n >= RICE_SCORE_MIN && n <= RICE_SCORE_MAX;
}

export function formatRiceSummary(scores, total) {
  return (
    "Reach " +
    scores.reach +
    ", Impact " +
    scores.impact +
    ", Confidence " +
    scores.confidence +
    ", Effort " +
    scores.effort +
    (total != null ? " (Total: " + total + ")" : "")
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
