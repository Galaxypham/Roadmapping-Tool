import { useMemo, useState } from "react";
import { Card, CardBody, CardHeader } from "../ui/Card.jsx";
import { Button } from "../ui/Button.jsx";
import { Field, NumberInput, Select } from "../ui/FormField.jsx";
import { InfoTooltip } from "../ui/InfoTooltip.jsx";
import { ReasonModal } from "../ui/ReasonModal.jsx";
import {
  ACTION_TYPE,
  PIPELINE_STATUS,
  RICE_CONFIDENCE_OPTIONS,
  RICE_IMPACT_OPTIONS,
  RICE_TOOLTIPS,
} from "../../lib/constants.js";
import {
  calculateRice,
  formatConfidence,
  formatEffort,
  formatImpact,
  formatReach,
  formatRiceSummary,
  getRoadmapThreshold,
  isValidConfidence,
  isValidEffort,
  isValidImpact,
  isValidReach,
  meetsRoadmapThreshold,
} from "../../lib/rice.js";
import { formatTimestamp } from "../../lib/format.js";

function parseScores(draft) {
  return {
    reach: draft.reach === "" || draft.reach == null ? null : Number(draft.reach),
    impact: draft.impact === "" || draft.impact == null ? null : Number(draft.impact),
    confidence:
      draft.confidence === "" || draft.confidence == null
        ? null
        : Number(draft.confidence),
    effort: draft.effort === "" || draft.effort == null ? null : Number(draft.effort),
  };
}

function draftFromCase(caseObj) {
  return {
    reach: caseObj.rice.reach ?? "",
    impact: caseObj.rice.impact ?? "",
    confidence: caseObj.rice.confidence ?? "",
    effort: caseObj.rice.effort ?? "",
  };
}

export function RiceScoring({
  caseObj,
  riceConfig,
  isPM,
  userName,
  updateCase,
  appendActivity,
  appendRevision,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => draftFromCase(caseObj));
  const [pendingReason, setPendingReason] = useState(false);

  const threshold = getRoadmapThreshold(riceConfig);

  const livePreview = useMemo(() => {
    const scores = parseScores(draft);
    return calculateRice(scores, riceConfig);
  }, [draft, riceConfig]);

  const meetsThreshold =
    livePreview != null && meetsRoadmapThreshold(livePreview, riceConfig);
  const willPromoteToUnderReview =
    caseObj.pipeline_status === PIPELINE_STATUS.INITIATED;

  const begin = () => {
    setDraft(draftFromCase(caseObj));
    setEditing(true);
  };

  const requestSave = () => {
    setPendingReason(true);
  };

  const confirmSave = (reason) => {
    const scores = parseScores(draft);
    const total = calculateRice(scores, riceConfig);
    const now = new Date().toISOString();
    const isFirstScore = caseObj.rice.reach == null;
    const shouldPromote =
      caseObj.pipeline_status === PIPELINE_STATUS.INITIATED;

    updateCase(caseObj.id, (c) => {
      const next = {
        ...c,
        rice: {
          ...scores,
          weighted_total: total,
          scored_by: userName,
          scored_at: now,
        },
      };
      if (shouldPromote) {
        next.pipeline_status = PIPELINE_STATUS.SUBMITTED;
        next.status_changed_at = now;
      }
      return next;
    });

    appendActivity(caseObj.id, {
      action_type: isFirstScore ? ACTION_TYPE.RICE_SCORED : ACTION_TYPE.RICE_UPDATED,
      action_detail:
        "RICE " +
        (isFirstScore ? "scored" : "updated") +
        ": " +
        formatRiceSummary(scores, total),
      reason,
      performed_by: userName,
    });

    if (shouldPromote) {
      appendActivity(caseObj.id, {
        action_type: ACTION_TYPE.STATUS_CHANGED,
        action_detail:
          "Status changed: " +
          PIPELINE_STATUS.INITIATED +
          " -> " +
          PIPELINE_STATUS.SUBMITTED +
          " (RICE submitted)",
        reason: reason || "Promoted to Under Review on RICE save.",
        performed_by: userName,
      });
    }

    if (!isFirstScore) {
      appendRevision(caseObj.id, {
        field_name: "RICE scores",
        old_value: formatRiceSummary(caseObj.rice, caseObj.rice.weighted_total),
        new_value: formatRiceSummary(scores, total),
        reason,
        changed_by: userName,
      });
    }

    setEditing(false);
    setPendingReason(false);
  };

  const hasScore = caseObj.rice.reach != null;

  // Per-field validity drives both the live preview message and the
  // Save button's disabled state.
  const draftValid =
    isValidReach(draft.reach) &&
    isValidImpact(draft.impact) &&
    isValidConfidence(draft.confidence) &&
    isValidEffort(draft.effort);

  return (
    <Card>
      <CardHeader
        title="RICE scoring"
        description={
          "Score = (Reach × Impact × Confidence) ÷ Effort. Reach is people/events per period, Impact is a 0.25–3 multiplier, Confidence is a percentage, Effort is person-months. Scores above " +
          threshold +
          " are roadmap candidates. Saving a score on a New case moves it to Under Review."
        }
        action={
          isPM && !editing ? (
            <Button variant="secondary" size="sm" onClick={begin}>
              {hasScore ? "Edit scores" : "Add scores"}
            </Button>
          ) : null
        }
      />
      <CardBody>
        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label={
                  <span className="inline-flex items-center">
                    Reach (people / period)
                    <InfoTooltip {...RICE_TOOLTIPS.reach} />
                  </span>
                }
              >
                <NumberInput
                  min="0"
                  step="1"
                  placeholder="e.g. 1500"
                  value={draft.reach}
                  onChange={(e) => setDraft({ ...draft, reach: e.target.value })}
                />
              </Field>

              <Field
                label={
                  <span className="inline-flex items-center">
                    Impact
                    <InfoTooltip {...RICE_TOOLTIPS.impact} />
                  </span>
                }
              >
                <Select
                  value={draft.impact}
                  onChange={(e) => setDraft({ ...draft, impact: e.target.value })}
                >
                  <option value="">Select impact</option>
                  {RICE_IMPACT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label={
                  <span className="inline-flex items-center">
                    Confidence
                    <InfoTooltip {...RICE_TOOLTIPS.confidence} />
                  </span>
                }
              >
                <Select
                  value={draft.confidence}
                  onChange={(e) =>
                    setDraft({ ...draft, confidence: e.target.value })
                  }
                >
                  <option value="">Select confidence</option>
                  {RICE_CONFIDENCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label={
                  <span className="inline-flex items-center">
                    Effort (person-months)
                    <InfoTooltip {...RICE_TOOLTIPS.effort} />
                  </span>
                }
              >
                <NumberInput
                  min="0"
                  step="0.5"
                  placeholder="e.g. 2"
                  value={draft.effort}
                  onChange={(e) => setDraft({ ...draft, effort: e.target.value })}
                />
              </Field>
            </div>
            <div className="rounded-md bg-slate-50 px-4 py-3 ring-1 ring-inset ring-slate-200">
              <p className="text-xs uppercase tracking-wide text-slate-500">RICE score</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {livePreview != null ? livePreview : "—"}
              </p>
              {livePreview != null ? (
                <div className="mt-2 space-y-1 text-xs">
                  {meetsThreshold ? (
                    <p className="font-medium text-emerald-700">
                      Above {threshold} — strong roadmap candidate.
                    </p>
                  ) : (
                    <p className="text-slate-500">
                      Roadmap threshold: above {threshold} (currently does not qualify).
                    </p>
                  )}
                  {willPromoteToUnderReview ? (
                    <p className="text-slate-500">
                      Saving will move this case from New to Under Review.
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  Fill in all four dimensions to see the score.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={requestSave}
                disabled={!draftValid}
              >
                Save scores
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : hasScore ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <ScoreCell
                label="Reach"
                tooltip={RICE_TOOLTIPS.reach}
                value={formatReach(caseObj.rice.reach)}
                unit="people / period"
              />
              <ScoreCell
                label="Impact"
                tooltip={RICE_TOOLTIPS.impact}
                value={formatImpact(caseObj.rice.impact)}
              />
              <ScoreCell
                label="Confidence"
                tooltip={RICE_TOOLTIPS.confidence}
                value={formatConfidence(caseObj.rice.confidence)}
              />
              <ScoreCell
                label="Effort"
                tooltip={RICE_TOOLTIPS.effort}
                value={formatEffort(caseObj.rice.effort)}
              />
            </div>
            <div className="rounded-md bg-slate-50 px-4 py-3 ring-1 ring-inset ring-slate-200">
              <p className="text-xs uppercase tracking-wide text-slate-500">RICE score</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900">
                {caseObj.rice.weighted_total != null ? caseObj.rice.weighted_total : "—"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Scored by {caseObj.rice.scored_by} on {formatTimestamp(caseObj.rice.scored_at)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm italic text-slate-400">
            Not scored yet.{isPM ? " Use the Add scores button to enter Reach, Impact, Confidence, and Effort." : ""}
          </p>
        )}
      </CardBody>

      <ReasonModal
        open={pendingReason}
        title={hasScore ? "Update RICE scores" : "Submit RICE scores"}
        description="Reasons help future you (and leadership) understand why a score moved."
        summary={
          livePreview != null
            ? "Score will be " + livePreview + (meetsThreshold ? " — above the roadmap threshold." : ".")
            : null
        }
        confirmLabel={hasScore ? "Update scores" : "Save scores"}
        onConfirm={confirmSave}
        onCancel={() => setPendingReason(false)}
      />
    </Card>
  );
}

function ScoreCell({ label, tooltip, value, unit }) {
  return (
    <div className="rounded-md border border-slate-100 px-3 py-2">
      <p className="inline-flex items-center text-xs uppercase tracking-wide text-slate-400">
        {label}
        <InfoTooltip {...tooltip} />
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
      {unit ? <p className="text-xs text-slate-500">{unit}</p> : null}
    </div>
  );
}
