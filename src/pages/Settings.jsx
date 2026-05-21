import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { DEFAULT_RICE_CONFIG } from "../lib/constants.js";
import { Card, CardBody, CardHeader } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Field, NumberInput, TextInput } from "../components/ui/FormField.jsx";
import { InfoTooltip } from "../components/ui/InfoTooltip.jsx";
import { ReasonModal } from "../components/ui/ReasonModal.jsx";

// Simple confirmation modal for destructive actions (no reason required)
function ConfirmModal({ open, title, description, confirmLabel, onConfirm, onCancel, variant = "default" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden
      />
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl ring-1 ring-slate-200">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {description ? (
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 rounded-b-xl">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const {
    userName,
    setUserName,
    isPM,
    riceConfig,
    updateRiceConfig,
    clearAllData,
    reloadSeedData,
  } = useApp();

  const [nameDraft, setNameDraft] = useState(userName || "");
  const [draftCfg, setDraftCfg] = useState({ ...riceConfig });
  const [pendingRice, setPendingRice] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmReload, setConfirmReload] = useState(false);

  const saveName = () => {
    if (!nameDraft.trim()) return;
    setUserName(nameDraft.trim());
  };

  const requestRiceSave = () => {
    setPendingRice(true);
  };

  const confirmRiceSave = (reason) => {
    const coerced = {
      roadmap_threshold: Math.max(
        1,
        Number(draftCfg.roadmap_threshold) || DEFAULT_RICE_CONFIG.roadmap_threshold,
      ),
    };
    updateRiceConfig(coerced, userName, reason);
    setDraftCfg(coerced);
    setPendingRice(false);
  };

  const doClearData = () => {
    clearAllData();
    setConfirmClear(false);
    navigate("/welcome");
  };

  const doReloadSeed = () => {
    reloadSeedData();
    setConfirmReload(false);
  };

  const riceHelp = {
    roadmap_threshold: {
      title: "Roadmap threshold",
      description:
        "Cases with a RICE score above this number are flagged as strong roadmap candidates in the RICE editor. PMs still decide when a case actually moves to Roadmapped. The right value depends on your Reach unit (users/quarter, tickets/month, etc.) — calibrate against a few known-good cases.",
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tweak your display name, the RICE roadmap threshold, and data management options.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Identity"
          description="Your display name is shown next to every action you take. The synthetic email used for restricted-case access is derived from this name (spaces become dots, plus @example.com)."
        />
        <CardBody className="space-y-3">
          <Field label="Display name">
            <TextInput
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="Your name"
            />
          </Field>
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={saveName}
              disabled={!nameDraft.trim() || nameDraft.trim() === userName}
            >
              Save name
            </Button>
          </div>
        </CardBody>
      </Card>

      {isPM ? (
        <Card>
          <CardHeader
            title="RICE scoring"
            description={
              "Industry-standard RICE: Score = (Reach × Impact × Confidence) ÷ Effort. " +
              "Reach is people/events per fixed period, Impact uses the 0.25–3 multiplier scale, Confidence is a percentage, Effort is person-months. " +
              "Cases scoring above the roadmap threshold are flagged as strong roadmap candidates."
            }
          />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label={
                  <span className="flex items-center">
                    Roadmap threshold
                    <InfoTooltip {...riceHelp.roadmap_threshold} />
                  </span>
                }
              >
                <NumberInput
                  step="1"
                  min="1"
                  value={draftCfg.roadmap_threshold}
                  onChange={(e) =>
                    setDraftCfg({ ...draftCfg, roadmap_threshold: e.target.value })
                  }
                />
              </Field>
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDraftCfg({ ...DEFAULT_RICE_CONFIG })}
              >
                Reset to defaults
              </Button>
              <Button variant="primary" size="sm" onClick={requestRiceSave}>
                Save RICE settings
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader
          title="Data management"
          description="All app data lives in this browser's localStorage. Reloading the seed restores the demo cases; clearing wipes everything and returns you to the welcome screen. Available to every role so anyone can reset the demo."
        />
        <CardBody className="space-y-3">
          <div className="flex items-start justify-between gap-4 rounded-md border border-slate-100 p-4">
            <div>
              <p className="text-sm font-medium text-slate-800">Reload seed data</p>
              <p className="mt-1 text-xs text-slate-500">
                Replaces all cases with the original demo set. Counter is reset to match.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="shrink-0"
              onClick={() => setConfirmReload(true)}
            >
              Reload seed
            </Button>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-md border border-rose-100 bg-rose-50/40 p-4">
            <div>
              <p className="text-sm font-medium text-rose-700">Clear all data</p>
              <p className="mt-1 text-xs text-rose-600/80">
                Wipes everything from localStorage and returns you to the welcome screen.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              className="shrink-0"
              onClick={() => setConfirmClear(true)}
            >
              Clear data
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* RICE save still requires reason (it's a PM action affecting cases) */}
      <ReasonModal
        open={pendingRice}
        title="Update RICE scoring settings"
        description="Changes recalculate every existing total and are recorded on scored cases."
        confirmLabel="Save RICE settings"
        onConfirm={confirmRiceSave}
        onCancel={() => setPendingRice(false)}
      />

      {/* Simple confirmations for data management (no reason required) */}
      <ConfirmModal
        open={confirmReload}
        title="Reload seed data?"
        description="This will replace all current cases with the original demo set. Your current work will be lost."
        confirmLabel="Yes, reload seed"
        onConfirm={doReloadSeed}
        onCancel={() => setConfirmReload(false)}
      />

      <ConfirmModal
        open={confirmClear}
        title="Clear all data?"
        description="This will permanently wipe all localStorage data and return you to the welcome screen."
        confirmLabel="Yes, clear everything"
        variant="danger"
        onConfirm={doClearData}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}
