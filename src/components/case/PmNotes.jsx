import { useState } from "react";
import { Card, CardBody, CardHeader } from "../ui/Card.jsx";
import { Button } from "../ui/Button.jsx";
import { TextArea } from "../ui/FormField.jsx";
import { ACTION_TYPE } from "../../lib/constants.js";
import { formatTimestamp, uuid } from "../../lib/format.js";

export function PmNotes({
  caseObj,
  isPM,
  userName,
  updateCase,
  appendActivity,
}) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    const content = draft.trim();
    if (!content) return;
    const note = {
      id: uuid(),
      content,
      written_by: userName,
      created_at: new Date().toISOString(),
    };
    updateCase(caseObj.id, (c) => ({
      ...c,
      pm_notes: [...c.pm_notes, note],
    }));
    appendActivity(caseObj.id, {
      action_type: ACTION_TYPE.PM_NOTE_ADDED,
      action_detail: "PM note added",
      reason: "PM note logged on the case timeline.",
      performed_by: userName,
    });
    setDraft("");
  };

  return (
    <Card>
      <CardHeader
        title="PM notes"
        description="Written by the Product team. Immutable once submitted — they're the permanent paper trail."
      />
      <CardBody className="space-y-4">
        {caseObj.pm_notes.length === 0 ? (
          <p className="text-sm italic text-slate-400">No notes yet.</p>
        ) : (
          <ul className="space-y-3">
            {caseObj.pm_notes.map((n) => (
              <li key={n.id} className="rounded-md border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-xs text-slate-500">
                  {n.written_by} | {formatTimestamp(n.created_at)}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                  {n.content}
                </p>
              </li>
            ))}
          </ul>
        )}

        {isPM ? (
          <div className="space-y-2">
            <TextArea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Drop a note for the record..."
              rows={3}
            />
            <div className="flex justify-end">
              <Button variant="primary" size="sm" onClick={submit} disabled={!draft.trim()}>
                Post note
              </Button>
            </div>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
