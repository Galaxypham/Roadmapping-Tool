import { useState } from "react";
import { Card, CardBody, CardHeader } from "../ui/Card.jsx";
import { Button } from "../ui/Button.jsx";
import { Field, TextInput } from "../ui/FormField.jsx";
import { ReasonModal } from "../ui/ReasonModal.jsx";
import { ACTION_TYPE } from "../../lib/constants.js";

export function AccessControl({
  caseObj,
  userName,
  updateCase,
  appendActivity,
}) {
  const [emailDraft, setEmailDraft] = useState("");
  const [pendingReason, setPendingReason] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const requestToggle = () => {
    setPendingAction({ type: "toggle", target: !caseObj.restricted });
    setPendingReason(true);
  };

  const requestAddEmail = () => {
    const trimmed = emailDraft.trim();
    if (!trimmed) return;
    if (caseObj.allowed_emails.includes(trimmed)) return;
    setPendingAction({ type: "email_add", email: trimmed });
    setPendingReason(true);
  };

  const requestRemoveEmail = (email) => {
    setPendingAction({ type: "email_remove", email });
    setPendingReason(true);
  };

  const confirm = (reason) => {
    if (!pendingAction) return;
    if (pendingAction.type === "toggle") {
      updateCase(caseObj.id, (c) => ({ ...c, restricted: pendingAction.target }));
      appendActivity(caseObj.id, {
        action_type: pendingAction.target
          ? ACTION_TYPE.RESTRICTED
          : ACTION_TYPE.UNRESTRICTED,
        action_detail: pendingAction.target
          ? "Case marked restricted"
          : "Case unrestricted",
        reason,
        performed_by: userName,
      });
    } else if (pendingAction.type === "email_add") {
      updateCase(caseObj.id, (c) => ({
        ...c,
        allowed_emails: [...c.allowed_emails, pendingAction.email],
      }));
      appendActivity(caseObj.id, {
        action_type: ACTION_TYPE.EMAIL_ADDED,
        action_detail: "Access email added: " + pendingAction.email,
        reason,
        performed_by: userName,
      });
      setEmailDraft("");
    } else if (pendingAction.type === "email_remove") {
      updateCase(caseObj.id, (c) => ({
        ...c,
        allowed_emails: c.allowed_emails.filter((e) => e !== pendingAction.email),
      }));
      appendActivity(caseObj.id, {
        action_type: ACTION_TYPE.EMAIL_REMOVED,
        action_detail: "Access email removed: " + pendingAction.email,
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
        title="Access control"
        description="When restricted, unauthorized viewers only see the case number and project name."
      />
      <CardBody className="space-y-5">
        <div className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3 ring-1 ring-inset ring-slate-200">
          <div>
            <p className="text-sm font-medium text-slate-800">
              Restricted: {caseObj.restricted ? "On" : "Off"}
            </p>
            <p className="text-xs text-slate-500">
              The original BR and any PM always have full access.
            </p>
          </div>
          <Button
            variant={caseObj.restricted ? "danger" : "primary"}
            size="sm"
            onClick={requestToggle}
          >
            {caseObj.restricted ? "Unrestrict" : "Restrict case"}
          </Button>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Authorized emails
          </p>
          {caseObj.allowed_emails.length === 0 ? (
            <p className="text-sm italic text-slate-400">No additional emails authorized.</p>
          ) : (
            <ul className="space-y-1.5">
              {caseObj.allowed_emails.map((email) => (
                <li
                  key={email}
                  className="flex items-center justify-between gap-2 rounded-md border border-slate-100 px-3 py-2"
                >
                  <span className="truncate text-sm text-slate-700">{email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => requestRemoveEmail(email)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex gap-2">
            <Field label="Add an email" required={false}>
              <TextInput
                placeholder="someone@example.com"
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
              />
            </Field>
            <div className="flex items-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={requestAddEmail}
                disabled={!emailDraft.trim()}
              >
                Add email
              </Button>
            </div>
          </div>
        </div>
      </CardBody>

      <ReasonModal
        open={pendingReason}
        title={
          pendingAction?.type === "toggle"
            ? pendingAction.target
              ? "Restrict this case"
              : "Unrestrict this case"
            : pendingAction?.type === "email_add"
            ? "Authorize an email"
            : "Remove email authorization"
        }
        summary={
          pendingAction?.type === "email_add" || pendingAction?.type === "email_remove"
            ? "Email: " + pendingAction.email
            : null
        }
        confirmLabel="Confirm change"
        variant={
          pendingAction?.type === "toggle" && pendingAction.target ? "danger" : "default"
        }
        onConfirm={confirm}
        onCancel={() => {
          setPendingReason(false);
          setPendingAction(null);
        }}
      />
    </Card>
  );
}
