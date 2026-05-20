import {
  DEFAULT_RICE_CONFIG,
  RICE_SCORE_MAX,
  RICE_SCORE_MIN,
} from "./constants.js";

export const RICE_DIMENSIONS = ["reach", "impact", "confidence", "effort"];

// Weighted sum of four 1–5 dimension scores.
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

  const total =
    Number(reach) * config.reach_weight +
    Number(impact) * config.impact_weight +
    Number(confidence) * config.confidence_weight +
    Number(effort) * config.effort_weight;

  return Math.round(total * 100) / 100;
}

export function calculateMaxRiceTotal(config) {
  if (!config) return RICE_SCORE_MAX * 4;
  return (
    RICE_SCORE_MAX *
    (config.reach_weight +
      config.impact_weight +
      config.confidence_weight +
      config.effort_weight)
  );
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
