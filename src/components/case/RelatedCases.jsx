import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, CardHeader } from "../ui/Card.jsx";
import { Button } from "../ui/Button.jsx";
import { Field, Select, TextArea } from "../ui/FormField.jsx";
import { ReasonModal } from "../ui/ReasonModal.jsx";
import { ACTION_TYPE, INTAKE_TOOLTIPS } from "../../lib/constants.js";
import { InfoTooltip } from "../ui/InfoTooltip.jsx";

export function RelatedCases({
  caseObj,
  allCases,
  isPM,
  userName,
  updateCase,
  appendActivity,
}) {
  const [pendingReason, setPendingReason] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [contextNote, setContextNote] = useState("");

  const linked = caseObj.related_cases
    .map((r) => ({
      ...r,
      target: allCases.find((c) => c.id === r.ps_id),
    }))
    .filter((r) => r.target);

  const candidates = allCases.filter(
    (c) =>
      c.id !== caseObj.id &&
      !caseObj.related_cases.some((r) => r.ps_id === c.id),
  );

  const requestAdd = () => {
    if (!selectedId || !contextNote.trim()) return;
    const target = allCases.find((c) => c.id === selectedId);
    setPendingAction({
      type: "add",
      ps_id: selectedId,
      context_note: contextNote.trim(),
      caseLabel: target ? target.case_number : selectedId,
    });
    setPendingReason(true);
  };

  const requestRemove = (psId) => {
    const target = allCases.find((c) => c.id === psId);
    setPendingAction({
      type: "remove",
      ps_id: psId,
      caseLabel: target ? target.case_number : psId,
    });
    setPendingReason(true);
  };

  const confirm = (reason) => {
    if (!pendingAction) return;
    if (pendingAction.type === "add") {
      const now = new Date().toISOString();
      updateCase(caseObj.id, (c) => ({
        ...c,
        related_cases: [
          ...c.related_cases,
          {
            ps_id: pendingAction.ps_id,
            context_note: pendingAction.context_note,
            added_by: userName,
            added_at: now,
          },
        ],
      }));
      appendActivity(caseObj.id, {
        action_type: ACTION_TYPE.RELATED_ADDED,
        action_detail: "Related case added: " + pendingAction.caseLabel,
        reason,
        performed_by: userName,
      });
      setAdding(false);
      setSelectedId("");
      setContextNote("");
    } else {
      updateCase(caseObj.id, (c) => ({
        ...c,
        related_cases: c.related_cases.filter((r) => r.ps_id !== pendingAction.ps_id),
      }));
      appendActivity(caseObj.id, {
        action_type: ACTION_TYPE.RELATED_REMOVED,
        action_detail: "Related case removed: " + pendingAction.caseLabel,
        reason,
        performed_by: userName,
      });
    }
    setPendingReason(false);
    setPendingAction(null);
  };

  return (
    <Card>
      <CardHeader
        title="Related cases"
        description="Link this case to dependencies, follow-ups, or paired work."
        action={
          isPM && !adding ? (
            <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
              + Link a case
            </Button>
          ) : null
        }
      />
      <CardBody className="space-y-4">
        {linked.length === 0 ? (
          <p className="text-sm italic text-slate-400">No related cases yet.</p>
        ) : (
          <ul className="space-y-2">
            {linked.map((r) => (
              <li key={r.ps_id} className="rounded-md border border-slate-100 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={"/cases/" + r.ps_id}
                      className="block truncate text-sm font-medium text-accent-700 hover:underline"
                    >
                      {r.target.case_number}
                    </Link>
                    <p className="mt-1 text-sm italic text-slate-600">{r.context_note}</p>
                  </div>
                  {isPM ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => requestRemove(r.ps_id)}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}

        {adding ? (
          <div className="space-y-3 rounded-md bg-slate-50 p-4 ring-1 ring-inset ring-slate-200">
            <Field label="Case to link">
              <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                <option value="">Choose a case...</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>{c.case_number}</option>
                ))}
              </Select>
            </Field>
            <Field
              label={
                <span className="inline-flex items-center">
                  Context note
                  <InfoTooltip {...INTAKE_TOOLTIPS.contextNote} />
                </span>
              }
            >
              <TextArea
                value={contextNote}
                onChange={(e) => setContextNote(e.target.value)}
                placeholder="e.g. PS007 depends on this hardware being in place first."
              />
            </Field>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={requestAdd}
                disabled={!selectedId || !contextNote.trim()}
              >
                Add relation
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </CardBody>

      <ReasonModal
        open={pendingReason}
        title={pendingAction?.type === "add" ? "Link related case" : "Remove related case"}
        summary={pendingAction ? "Case: " + pendingAction.caseLabel : null}
        confirmLabel={pendingAction?.type === "add" ? "Add relation" : "Remove relation"}
        variant={pendingAction?.type === "remove" ? "danger" : "default"}
        onConfirm={confirm}
        onCancel={() => {
          setPendingReason(false);
          setPendingAction(null);
        }}
      />
    </Card>
  );
}
