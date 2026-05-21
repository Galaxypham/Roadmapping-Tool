// Migrates RICE scores saved under the previous "everything is 1–5" scale
// into the industry-standard RICE scales:
//
//   Reach: free-form positive number (people/events per period)
//   Impact: one of {0.25, 0.5, 1, 2, 3}
//   Confidence: one of {0.5, 0.8, 1.0}
//   Effort: free-form positive person-months
//
// We can't recover the requestor's true intent, so the migration uses
// best-fit mappings that preserve relative ordering: a case that had
// Impact 5 (top of the old scale) maps to Massive (3) on the new one,
// Confidence 5 maps to High (100%), etc. Reach 1–5 becomes 100/500/1k/2k/5k.
// Effort 1–5 becomes 1/2/3/5/8 person-months (rough Fibonacci sizing).

import {
  RICE_CONFIDENCE_VALUES,
  RICE_IMPACT_VALUES,
} from "./constants.js";

const LEGACY_REACH = { 1: 100, 2: 500, 3: 1000, 4: 2000, 5: 5000 };
const LEGACY_IMPACT = { 1: 0.25, 2: 0.5, 3: 1, 4: 2, 5: 3 };
const LEGACY_CONFIDENCE = { 1: 0.5, 2: 0.5, 3: 0.8, 4: 0.8, 5: 1.0 };
const LEGACY_EFFORT = { 1: 1, 2: 2, 3: 3, 4: 5, 5: 8 };

// A score is "legacy shape" if every value is an integer 1–5. New-scale
// scores will fail this check (Impact 0.25, Confidence 0.5, Reach 1500, etc.)
// so the function is idempotent.
function looksLegacy(rice) {
  const fields = [rice.reach, rice.impact, rice.confidence, rice.effort];
  return fields.every((v) => {
    if (v == null) return false;
    const n = Number(v);
    return Number.isInteger(n) && n >= 1 && n <= 5;
  });
}

export function migrateLegacyRice(rice) {
  if (!rice) return rice;
  if (!looksLegacy(rice)) return rice;
  const next = {
    ...rice,
    reach: LEGACY_REACH[rice.reach] ?? rice.reach,
    impact: LEGACY_IMPACT[rice.impact] ?? rice.impact,
    confidence: LEGACY_CONFIDENCE[rice.confidence] ?? rice.confidence,
    effort: LEGACY_EFFORT[rice.effort] ?? rice.effort,
  };
  // Score is recomputed by the caller — null it out so a stale total
  // doesn't render before recompute.
  next.weighted_total = null;
  return next;
}

// Re-exported so callers needing the canonical scales don't have to
// reach across two modules.
export { RICE_IMPACT_VALUES, RICE_CONFIDENCE_VALUES };
