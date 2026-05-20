import { useState } from "react";
import { Card, CardBody, CardHeader } from "../ui/Card.jsx";
import { Button } from "../ui/Button.jsx";
import { Field, TextArea, TextInput } from "../ui/FormField.jsx";
import { ReasonModal } from "../ui/ReasonModal.jsx";
import { formatTimestamp, uuid } from "../../lib/format.js";
import { ACTION_TYPE } from "../../lib/constants.js";
import { formatFileSize, getDocumentHref, isFileDocument } from "../../lib/documents.js";

const EDITABLE_FIELDS = [
  { key: "problem_description", label: "Problem Description" },
  { key: "current_solution", label: "Current Solution / Workaround" },
  { key: "proposed_fix", label: "Proposed Fix / Ask" },
  { key: "roi_reasoning", label: "Expected ROI / Business Impact" },
];

function ReadOnlyParagraph({ value }) {
  if (!value) return <p className="text-sm italic text-slate-400">Not provided.</p>;
  return <p className="whitespace-pre-wrap text-sm text-slate-700">{value}</p>;
}

export function IntakeDetails({ caseObj, isPM, userName, updateCase, appendActivity, appendRevision }) {
  const [editingField, setEditingField] = useState(null);
  const [draft, setDraft] = useState("");
  const [pendingReason, setPendingReason] = useState(false);
  const [reasonContext, setReasonContext] = useState(null);

  const [docDraft, setDocDraft] = useState({ name: "", url: "" });

  const beginEdit = (key) => {
    setEditingField(key);
    setDraft(caseObj[key] || "");
  };

  const requestSave = () => {
    const fieldDef = EDITABLE_FIELDS.find((f) => f.key === editingField);
    setReasonContext({
      type: "field",
      fieldKey: editingField,
      fieldLabel: fieldDef.label,
      oldValue: caseObj[editingField] || "",
      newValue: draft,
    });
    setPendingReason(true);
  };

  const confirmSave = (reason) => {
    if (!reasonContext) return;
    if (reasonContext.type === "field") {
      updateCase(caseObj.id, (c) => ({
        ...c,
        [reasonContext.fieldKey]: reasonContext.newValue,
      }));
      appendActivity(caseObj.id, {
        action_type: ACTION_TYPE.FIELD_EDITED,
        action_detail: "Edited " + reasonContext.fieldLabel,
        reason,
        performed_by: userName,
      });
      appendRevision(caseObj.id, {
        field_name: reasonContext.fieldLabel,
        old_value: reasonContext.oldValue,
        new_value: reasonContext.newValue,
        reason,
        changed_by: userName,
      });
    } else if (reasonContext.type === "doc_add") {
      const newDoc = {
        id: uuid(),
        name: reasonContext.doc.name,
        url: reasonContext.doc.url,
        added_by: userName,
        added_at: new Date().toISOString(),
      };
      updateCase(caseObj.id, (c) => ({
        ...c,
        documents: [...c.documents, newDoc],
      }));
      appendActivity(caseObj.id, {
        action_type: ACTION_TYPE.FIELD_EDITED,
        action_detail: "Added document: " + newDoc.name,
        reason,
        performed_by: userName,
      });
      setDocDraft({ name: "", url: "" });
    } else if (reasonContext.type === "doc_remove") {
      const removed = caseObj.documents.find((d) => d.id === reasonContext.docId);
      updateCase(caseObj.id, (c) => ({
        ...c,
        documents: c.documents.filter((d) => d.id !== reasonContext.docId),
      }));
      appendActivity(caseObj.id, {
        action_type: ACTION_TYPE.FIELD_EDITED,
        action_detail: "Removed document: " + (removed ? removed.name : ""),
        reason,
        performed_by: userName,
      });
    }
    setEditingField(null);
    setDraft("");
    setPendingReason(false);
    setReasonContext(null);
  };

  return (
    <Card>
      <CardHeader
        title="Submission details"
        description="Submitted by the requestor. PMs can amend with a reason on the record."
      />
      <CardBody className="space-y-5">
        {EDITABLE_FIELDS.map((f) => (
          <div key={f.key}>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{f.label}</p>
              {isPM && editingField !== f.key ? (
                <Button variant="ghost" size="sm" onClick={() => beginEdit(f.key)}>
                  Edit
                </Button>
              ) : null}
            </div>
            {editingField === f.key ? (
              <div className="space-y-2">
                <TextArea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={5}
                />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={requestSave}
                    disabled={draft === (caseObj[f.key] || "")}
                  >
                    Save change
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditingField(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <ReadOnlyParagraph value={caseObj[f.key]} />
            )}
          </div>
        ))}

        <div className="border-t border-slate-100 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Supporting documents
            </p>
          </div>
          {caseObj.documents.length === 0 ? (
            <p className="text-sm italic text-slate-400">No documents linked.</p>
          ) : (
            <ul className="space-y-1.5">
              {caseObj.documents.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2">
                  <div className="min-w-0">
                    <a
                      href={getDocumentHref(doc)}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={isFileDocument(doc) ? doc.fileName || doc.name : undefined}
                      className="block truncate text-sm font-medium text-accent-700 hover:underline"
                    >
                      {doc.name}
                      {isFileDocument(doc) ? (
                        <span className="ml-1.5 text-xs font-normal text-slate-500">
                          (PDF{doc.fileSize ? " · " + formatFileSize(doc.fileSize) : ""})
                        </span>
                      ) : null}
                    </a>
                    <p className="text-xs text-slate-500">
                      Added by {doc.added_by} on {formatTimestamp(doc.added_at)}
                    </p>
                  </div>
                  {isPM ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReasonContext({ type: "doc_remove", docId: doc.id });
                        setPendingReason(true);
                      }}
                    >
                      Remove
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          {isPM ? (
            <div className="mt-3 grid grid-cols-1 gap-2 rounded-md bg-slate-50 p-3 sm:grid-cols-[1fr_2fr_auto]">
              <TextInput
                placeholder="Document name"
                value={docDraft.name}
                onChange={(e) => setDocDraft({ ...docDraft, name: e.target.value })}
              />
              <TextInput
                placeholder="https://..."
                value={docDraft.url}
                onChange={(e) => setDocDraft({ ...docDraft, url: e.target.value })}
              />
              <Button
                variant="secondary"
                size="sm"
                disabled={!docDraft.name.trim() || !docDraft.url.trim()}
                onClick={() => {
                  setReasonContext({
                    type: "doc_add",
                    doc: { name: docDraft.name.trim(), url: docDraft.url.trim() },
                  });
                  setPendingReason(true);
                }}
              >
                Add document
              </Button>
            </div>
          ) : null}
        </div>
      </CardBody>

      <ReasonModal
        open={pendingReason}
        title={
          reasonContext?.type === "field"
            ? "Edit " + (reasonContext?.fieldLabel || "field")
            : reasonContext?.type === "doc_add"
            ? "Add supporting document"
            : "Remove supporting document"
        }
        description="Reasons are stored on the activity log and revision history."
        summary={
          reasonContext?.type === "field"
            ? "Field: " + reasonContext.fieldLabel
            : null
        }
        confirmLabel="Save change"
        onConfirm={confirmSave}
        onCancel={() => {
          setPendingReason(false);
          setReasonContext(null);
        }}
      />
    </Card>
  );
}
