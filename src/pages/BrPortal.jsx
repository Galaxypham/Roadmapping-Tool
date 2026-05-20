import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import {
  ACTION_TYPE,
  PIPELINE_STATUS,
  DEFAULT_PRIORITY,
  INTAKE_TOOLTIPS,
  PRIORITY_ORDER,
  REQUEST_TYPE,
  REQUEST_TYPE_ORDER,
} from "../lib/constants.js";
import { buildCaseNumber, uuid } from "../lib/format.js";
import { emptyRice } from "../lib/rice.js";
import { isDocumentComplete, normalizeDocument } from "../lib/documents.js";
import { Card, CardBody, CardHeader } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import {
  Field,
  Select,
  TextArea,
  TextInput,
} from "../components/ui/FormField.jsx";
import { SupportingDocumentsField } from "../components/intake/SupportingDocumentsField.jsx";
import { InfoTooltip } from "../components/ui/InfoTooltip.jsx";

// New PS Submission portal.

function blankForm() {
  return {
    ps_name: "",
    request_type: REQUEST_TYPE.TOOLING,
    priority: DEFAULT_PRIORITY,
    team: "",
    problem_description: "",
    current_solution: "",
    proposed_fix: "",
    roi_reasoning: "",
    documents: [], // { id, name, url } or { id, name, fileName, dataUrl, fileSize }
  };
}

export default function BrPortal() {
  const navigate = useNavigate();
  const { addCase, bumpCounter, userName, isBR } = useApp();
  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState({});

  const pageTitle = "New submission";

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.ps_name.trim()) next.ps_name = "Enter a project name.";
    if (!form.team.trim()) next.team = "Tell us which team you're requesting on behalf of.";
    if (!form.problem_description.trim()) next.problem_description = "Required.";
    if (!form.current_solution.trim()) next.current_solution = "Required.";
    if (!form.proposed_fix.trim()) next.proposed_fix = "Required.";
    if (!form.roi_reasoning.trim()) next.roi_reasoning = "Required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const counter = bumpCounter();
    const now = new Date().toISOString();
    const cleanDocs = form.documents
      .filter(isDocumentComplete)
      .map((d) => normalizeDocument(d, { added_by: userName, added_at: now }));

    const newCase = {
      id: uuid(),
      case_number: buildCaseNumber(counter, form.ps_name.trim()),
      ps_name: form.ps_name.trim(),
      request_type: form.request_type,
      priority: form.priority,
      pipeline_status: PIPELINE_STATUS.INITIATED,
      lifecycle_status: null,
      status_changed_at: now,
      requestor_name: userName,
      requestor_email:
        userName.toLowerCase().replace(/\s+/g, ".") + "@example.com",
      team: form.team.trim(),
      problem_description: form.problem_description.trim(),
      current_solution: form.current_solution.trim(),
      proposed_fix: form.proposed_fix.trim(),
      roi_reasoning: form.roi_reasoning.trim(),
      documents: cleanDocs,
      rice: emptyRice(),
      related_cases: [],
      restricted: false,
      allowed_emails: [],
      pm_notes: [],
      activity_log: [
        {
          id: uuid(),
          action_type: ACTION_TYPE.CASE_CREATED,
          action_detail: "Case created via BR intake form",
          reason: "",
          performed_by: userName,
          created_at: now,
        },
      ],
      revision_history: [],
      created_at: now,
      updated_at: now,
    };

    addCase(newCase);
    navigate("/dashboard");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{pageTitle}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tell us what's broken or what you'd like built. Be specific where you can — the more
          context up front, the faster the Product team can prioritize.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader title="Basics" description="High-level details for routing and prioritization." />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Project Name"
              required
              tooltip={INTAKE_TOOLTIPS.projectName}
              error={errors.ps_name}
            >
              <TextInput
                placeholder="e.g. Dashboard Export to CSV"
                value={form.ps_name}
                onChange={(e) => update("ps_name", e.target.value)}
              />
            </Field>
            <Field label="Team" required error={errors.team}>
              <TextInput
                placeholder="e.g. Finance Ops"
                value={form.team}
                onChange={(e) => update("team", e.target.value)}
              />
            </Field>
            <Field label="Request Type" required>
              <Select
                value={form.request_type}
                onChange={(e) => update("request_type", e.target.value)}
              >
                {REQUEST_TYPE_ORDER.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Priority" required tooltip={INTAKE_TOOLTIPS.priority}>
              <Select
                value={form.priority}
                onChange={(e) => update("priority", e.target.value)}
              >
                {PRIORITY_ORDER.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Context" description="Help the Product team understand the situation." />
          <CardBody className="grid grid-cols-1 gap-4">
            <Field label="Problem Description" required error={errors.problem_description}>
              <TextArea
                value={form.problem_description}
                onChange={(e) => update("problem_description", e.target.value)}
                placeholder="What's the problem? Who is affected and how often?"
              />
            </Field>
            <Field label="Current Solution / Workaround" required error={errors.current_solution}>
              <TextArea
                value={form.current_solution}
                onChange={(e) => update("current_solution", e.target.value)}
                placeholder="How is the team handling this today?"
              />
            </Field>
            <Field label="Proposed Fix / Ask" required error={errors.proposed_fix}>
              <TextArea
                value={form.proposed_fix}
                onChange={(e) => update("proposed_fix", e.target.value)}
                placeholder="What would you like to see happen?"
              />
            </Field>
            <Field label="Expected ROI / Business Impact" required error={errors.roi_reasoning}>
              <TextArea
                value={form.roi_reasoning}
                onChange={(e) => update("roi_reasoning", e.target.value)}
                placeholder="Quantify the value where you can — time saved, revenue, risk reduced."
              />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={
              <span className="inline-flex items-center">
                Supporting documents
                <InfoTooltip {...INTAKE_TOOLTIPS.supportingDocs} />
              </span>
            }
          />
          <CardBody>
            <SupportingDocumentsField
              documents={form.documents}
              onChange={(documents) => update("documents", documents)}
            />
          </CardBody>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => setForm(blankForm())}>
            Reset
          </Button>
          <Button type="submit" variant="primary">
            Submit case
          </Button>
        </div>
      </form>
    </div>
  );
}
