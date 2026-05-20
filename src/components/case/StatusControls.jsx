import { useState } from "react";
import { Card, CardBody, CardHeader } from "../ui/Card.jsx";
import { Button } from "../ui/Button.jsx";
import { ReasonModal } from "../ui/ReasonModal.jsx";
import {
  ACTION_TYPE,
  LIFECYCLE_STATUS_ORDER,
  PIPELINE_STATUS,
  PIPELINE_STATUS_ORDER,
} from "../../lib/constants.js";

export function StatusControls({
  caseObj,
  userName,
  updateCase,
  appendActivity,
}) {
  const [pending, setPending] = useState(null);

  const requestPipeline = (next) => {
    if (next === caseObj.pipeline_status) return;
    setPending({
      type: "pipeline",
      from: caseObj.pipeline_status,
      to: next,
    });
  };

  const requestLifecycle = (next) => {
    if (next === (caseObj.lifecycle_status || "")) return;
    setPending({
      type: "lifecycle",
      from: caseObj.lifecycle_status || "Not started",
      to: next || "Not started",
    });
  };

  const confirm = (reason) => {
    if (!pending) return;
    const now = new Date().toISOString();
    if (pending.type === "pipeline") {
      updateCase(caseObj.id, (c) => ({
        ...c,
        pipeline_status: pending.to,
        status_changed_at: now,
        // Reset lifecycle when leaving Roadmapped to keep state honest.
        lifecycle_status:
          pending.to === PIPELINE_STATUS.ROADMAPPED
            ? c.lifecycle_status
            : null,
      }));
      appendActivity(caseObj.id, {
        action_type: ACTION_TYPE.STATUS_CHANGED,
        action_detail: "Status changed: " + pending.from + " -> " + pending.to,
        reason,
        performed_by: userName,
      });
    } else {
      updateCase(caseObj.id, (c) => ({
        ...c,
        lifecycle_status: pending.to === "Not started" ? null : pending.to,
      }));
      appendActivity(caseObj.id, {
        action_type: ACTION_TYPE.LIFECYCLE_CHANGED,
        action_detail: "Lifecycle status changed: " + pending.from + " -> " + pending.to,
        reason,
        performed_by: userName,
      });
    }
    setPending(null);
  };

  const canChangeLifecycle = caseObj.pipeline_status === PIPELINE_STATUS.ROADMAPPED;

  return (
    <Card>
      <CardHeader
        title="Status controls"
        description="Move the case through the pipeline and (once roadmapped) the product lifecycle."
      />
      <CardBody className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pipeline status
          </p>
          <div className="flex flex-wrap gap-2">
            {PIPELINE_STATUS_ORDER.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={s === caseObj.pipeline_status ? "primary" : "secondary"}
                onClick={() => requestPipeline(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Product lifecycle
          </p>
          {!canChangeLifecycle ? (
            <p className="text-sm italic text-slate-400">
              Lifecycle status becomes editable once the case is roadmapped.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={caseObj.lifecycle_status == null ? "primary" : "secondary"}
                onClick={() => requestLifecycle("")}
              >
                Not started
              </Button>
              {LIFECYCLE_STATUS_ORDER.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={s === caseObj.lifecycle_status ? "primary" : "secondary"}
                  onClick={() => requestLifecycle(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardBody>

      <ReasonModal
        open={pending != null}
        title={
          pending?.type === "pipeline"
            ? "Change pipeline status"
            : "Change lifecycle status"
        }
        summary={pending ? pending.from + " -> " + pending.to : null}
        description="Status changes get an entry in the activity log so the team can follow the reasoning."
        confirmLabel="Confirm status change"
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </Card>
  );
}
