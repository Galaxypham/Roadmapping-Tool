import { useMemo, useState } from "react";
import { Card, CardBody, CardHeader } from "../ui/Card.jsx";
import { Button } from "../ui/Button.jsx";
import { Field, Select } from "../ui/FormField.jsx";
import { InfoTooltip } from "../ui/InfoTooltip.jsx";
import { ReasonModal } from "../ui/ReasonModal.jsx";
import {
  ACTION_TYPE,
  PIPELINE_STATUS,
  INTAKE_TOOLTIPS,
  RICE_SCORE_OPTIONS,
  RICE_TOOLTIPS,
} from "../../lib/constants.js";
import {
  calculateMaxRiceTotal,
  calculateRice,
  formatRiceSummary,
  getRoadmapThreshold,
  meetsRoadmapThreshold,
} from "../../lib/rice.js";
import { formatTimestamp } from "../../lib/format.js";

const FIELDS = [
  { key: "reach", label: "Reach" },
  { key: "impact", label: "Impact" },
  { key: "confidence", label: "Confidence" },
  { key: "effort", label: "Effort" },
];

function parseScores(draft) {
  return {
    reach: draft.reach === "" ? null : Number(draft.reach),
    impact: draft.impact === "" ? null : Number(draft.impact),
    confidence: draft.confidence === "" ? null : Number(draft.confidence),
    effort: draft.effort === "" ? null : Number(draft.effort),
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
  const [draft, setDraft] = useState({
    reach: caseObj.rice.reach ?? "",
    impact: caseObj.rice.impact ?? "",
    confidence: caseObj.rice.confidence ?? "",
    effort: caseObj.rice.effort ?? "",
  });
  const [pendingReason, setPendingReason] = useState(false);

  const maxTotal = useMemo(() => calculateMaxRiceTotal(riceConfig), [riceConfig]);
  const threshold = getRoadmapThreshold(riceConfig);

  const livePreview = useMemo(() => {
    const scores = parseScores(draft);
    const allFilled = FIELDS.every((f) => draft[f.key] !== "");
    if (!allFilled) return null;
    return calculateRice(scores, riceConfig);
  }, [draft, riceConfig]);

  const meetsThreshold =
    livePreview != null && meetsRoadmapThreshold(livePreview, riceConfig);
  // RICE save promotes a brand-new case to Under Review. Cases already
  // past New (Under Review, Roadmapped, On Hold, Declined) keep their
  // current pipeline status — promotion is a one-time progression.
  const willPromoteToUnderReview =
    caseObj.pipeline_status === PIPELINE_STATUS.INITIATED;

  const begin = () => {
    setDraft({
      reach: caseObj.rice.reach ?? "",
      impact: caseObj.rice.impact ?? "",
      confidence: caseObj.rice.confidence ?? "",
      effort: caseObj.rice.effort ?? "",
    });
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
        old_value:
          "R " +
          caseObj.rice.reach +
          " / I " +
          caseObj.rice.impact +
          " / C " +
          caseObj.rice.confidence +
          " / E " +
          caseObj.rice.effort,
        new_value:
          "R " +
          scores.reach +
          " / I " +
          scores.impact +
          " / C " +
          scores.confidence +
          " / E " +
          scores.effort,
        reason,
        changed_by: userName,
      });
    }

    setEditing(false);
    setPendingReason(false);
  };

  const hasScore = caseObj.rice.reach != null;

  return (
    <Card>
      <CardHeader
        title="RICE scoring"
        description={
          "Each dimension is scored 1–5. Total = (Reach × Impact × Confidence) ÷ Effort (max " +
          maxTotal +
          "). Scores above " +
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
              {FIELDS.map((f) => (
                <Field
                  key={f.key}
                  label={
                    <span className="inline-flex items-center">
                      {f.label}
                      <InfoTooltip {...RICE_TOOLTIPS[f.key]} />
                    </span>
                  }
                >
                  <Select
                    value={draft[f.key]}
                    onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                  >
                    <option value="">Select 1–5</option>
                    {RICE_SCORE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </Select>
                </Field>
              ))}
            </div>
            <div className="rounded-md bg-slate-50 px-4 py-3 ring-1 ring-inset ring-slate-200">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total preview</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {livePreview != null ? livePreview + " / " + maxTotal : "—"}
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
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={requestSave}
                disabled={livePreview == null}
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
              {FIELDS.map((f) => (
                <ScoreCell
                  key={f.key}
                  label={f.label}
                  tooltip={RICE_TOOLTIPS[f.key]}
                  value={caseObj.rice[f.key]}
                />
              ))}
            </div>
            <div className="rounded-md bg-slate-50 px-4 py-3 ring-1 ring-inset ring-slate-200">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900">
                {caseObj.rice.weighted_total != null
                  ? caseObj.rice.weighted_total + " / " + maxTotal
                  : "—"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Scored by {caseObj.rice.scored_by} on {formatTimestamp(caseObj.rice.scored_at)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm italic text-slate-400">
            Not scored yet.{isPM ? " Use the Add scores button — each dimension is rated 1–5." : ""}
          </p>
        )}
      </CardBody>

      <ReasonModal
        open={pendingReason}
        title={hasScore ? "Update RICE scores" : "Submit RICE scores"}
        description="Reasons help future you (and leadership) understand why a score moved."
        summary={
          livePreview != null
            ? "Total will be " +
              livePreview +
              " / " +
              maxTotal +
              (meetsThreshold ? " and the case will move to Roadmapped." : ".")
            : null
        }
        confirmLabel={hasScore ? "Update scores" : "Save scores"}
        onConfirm={confirmSave}
        onCancel={() => setPendingReason(false)}
      />
    </Card>
  );
}

function ScoreCell({ label, tooltip, value }) {
  return (
    <div className="rounded-md border border-slate-100 px-3 py-2">
      <p className="inline-flex items-center text-xs uppercase tracking-wide text-slate-400">
        {label}
        <InfoTooltip {...tooltip} />
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">out of 5</p>
    </div>
  );
}
