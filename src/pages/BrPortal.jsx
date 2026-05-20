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

const GEMINI_MODEL = "gemini-3.5-flash";

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

function parseGeminiJson(rawText) {
  if (!rawText || typeof rawText !== "string") return null;
  const trimmed = rawText.trim();

  const directAttempt = (() => {
    try {
      return JSON.parse(trimmed);
    } catch {
      return null;
    }
  })();
  if (directAttempt) return directAttempt;

  const withoutFence = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  const fenceAttempt = (() => {
    try {
      return JSON.parse(withoutFence);
    } catch {
      return null;
    }
  })();
  if (fenceAttempt) return fenceAttempt;

  const jsonStart = withoutFence.indexOf("{");
  const jsonEnd = withoutFence.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) return null;

  try {
    return JSON.parse(withoutFence.slice(jsonStart, jsonEnd + 1));
  } catch {
    return null;
  }
}

function toCleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function buildGeminiPrompt(projectDescription) {
  return [
    "You are helping a business requester draft a product intake form.",
    "Given the request description below, infer and return only a JSON object.",
    "No markdown, no explanation, no code fence.",
    "",
    "Return exactly these keys:",
    "- ps_name",
    "- team",
    "- request_type",
    "- priority",
    "- problem_description",
    "- current_solution",
    "- proposed_fix",
    "- roi_reasoning",
    "",
    "Rules:",
    `- request_type must be one of: ${REQUEST_TYPE_ORDER.join(" | ")}`,
    `- priority must be one of: ${PRIORITY_ORDER.join(" | ")}`,
    "- If a value is unknown, make a reasonable business-safe default.",
    "- Keep responses concise but specific (1-4 sentences per long field).",
    "",
    "Project description:",
    projectDescription,
  ].join("\n");
}

export default function BrPortal() {
  const navigate = useNavigate();
  const { addCase, bumpCounter, userName, isBR } = useApp();
  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState({});
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [aiError, setAiError] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

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

  const openAiBox = () => {
    setAiDescription("");
    setAiError("");
    setIsAiOpen(true);
  };

  const applyAiDraft = (draft) => {
    const next = {
      ps_name: toCleanText(draft?.ps_name),
      team: toCleanText(draft?.team),
      request_type: REQUEST_TYPE_ORDER.includes(draft?.request_type)
        ? draft.request_type
        : REQUEST_TYPE.TOOLING,
      priority: PRIORITY_ORDER.includes(draft?.priority) ? draft.priority : DEFAULT_PRIORITY,
      problem_description: toCleanText(draft?.problem_description),
      current_solution: toCleanText(draft?.current_solution),
      proposed_fix: toCleanText(draft?.proposed_fix),
      roi_reasoning: toCleanText(draft?.roi_reasoning),
    };

    setForm((prev) => ({ ...prev, ...next }));
    setErrors((prev) => ({
      ...prev,
      ps_name: undefined,
      team: undefined,
      problem_description: undefined,
      current_solution: undefined,
      proposed_fix: undefined,
      roi_reasoning: undefined,
    }));
  };

  const fillFormWithAi = async () => {
    const projectDescription = aiDescription.trim();
    if (!projectDescription) {
      setAiError("Describe the project first.");
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setAiError("Missing VITE_GEMINI_API_KEY. Please set it before using AI fill.");
      return;
    }

    setAiError("");
    setIsAiLoading(true);

    try {
      const prompt = buildGeminiPrompt(projectDescription);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini request failed (${response.status})`);
      }

      const payload = await response.json();
      const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = parseGeminiJson(rawText);

      if (!parsed) {
        throw new Error("Gemini returned an invalid JSON draft.");
      }

      applyAiDraft(parsed);
      setIsAiOpen(false);
      setAiDescription("");
    } catch (err) {
      setAiError(err?.message || "Could not generate an AI draft.");
    } finally {
      setIsAiLoading(false);
    }
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

      <div className="flex items-center justify-end">
        <Button type="button" variant="secondary" onClick={openAiBox}>
          Fill with AI
        </Button>
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

      {isAiOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => {
              if (!isAiLoading) setIsAiOpen(false);
            }}
            aria-hidden
          />
          <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-xl ring-1 ring-slate-200">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="text-sm font-semibold text-slate-900">Fill request with AI</h3>
              <p className="mt-1 text-xs text-slate-500">
                Describe the project in plain language and let AI draft the intake fields.
              </p>
            </div>

            <div className="space-y-4 px-5 py-4">
              <Field label="Project description" required>
                <TextArea
                  rows={5}
                  value={aiDescription}
                  onChange={(e) => {
                    setAiDescription(e.target.value);
                    if (aiError) setAiError("");
                  }}
                  placeholder="Example: Sales Ops spends 2 hours/day manually combining exports from 3 tools..."
                />
              </Field>

              {aiError ? <p className="text-xs text-rose-600">{aiError}</p> : null}
            </div>

            <div className="flex items-center justify-end gap-2 rounded-b-xl border-t border-slate-100 bg-slate-50/60 px-5 py-3">
              <Button
                variant="ghost"
                onClick={() => setIsAiOpen(false)}
                disabled={isAiLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={fillFormWithAi}
                disabled={isAiLoading || !aiDescription.trim()}
              >
                {isAiLoading ? "Generating..." : "Fill with AI"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
