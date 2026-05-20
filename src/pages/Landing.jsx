import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { getRoleHomePath, ROLES } from "../lib/constants.js";
import { Button } from "../components/ui/Button.jsx";

function RoleCard({ label, description, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "w-full rounded-xl border p-5 text-left transition-all " +
        (selected
          ? "border-accent-500 bg-slate-50 ring-2 ring-accent-400 shadow-card"
          : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:shadow-card")
      }
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
        {selected ? (
          <span className="rounded-full bg-accent-500 px-2 py-0.5 text-xs font-bold text-white">
            Selected
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-slate-600">{description}</p>
    </button>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { role, userName, setRole, setUserName } = useApp();
  const [selectedRole, setSelectedRole] = useState(role || null);
  const [name, setName] = useState(userName || "");
  const [error, setError] = useState("");

  const onContinue = (e) => {
    e.preventDefault();
    if (!selectedRole) {
      setError("Pick a portal to continue.");
      return;
    }
    if (!name.trim()) {
      setError("Enter your name to continue.");
      return;
    }
    setRole(selectedRole);
    setUserName(name.trim());
    navigate(getRoleHomePath(selectedRole));
  };

  return (
    <div className="min-h-screen bg-slate-200">
      <header className="border-b-2 border-accent-500 bg-slate-900 shadow-lg">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500 text-sm font-bold text-white">
            RT
          </span>
          <span className="text-sm font-semibold text-white">
            Roadmapping Tool Template
          </span>
        </div>
      </header>

      <div className="mx-auto flex max-w-3xl flex-col px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            A clear path from request to roadmap.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-700">
            Enhancement asks, new builds, bug reports. They land in
            spreadsheets, sneak into DMs, and quietly pile up in a Product
            Manager's head. Important work slips through. Requestors wonder if
            anyone heard them. Leadership has no idea why anything got picked.
          </p>
          <p className="mt-3 max-w-2xl text-base text-slate-700">
            This template fixes the chaos with a small, opinionated workflow:
          </p>
          <ul className="mt-3 max-w-2xl space-y-2 text-base text-slate-700">
            <li className="flex gap-3">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
              <span>
                <span className="font-semibold text-slate-900">Business requestors</span>{" "}
                submit a structured problem statement and see exactly where
                their ask landed, and why.
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
              <span>
                <span className="font-semibold text-slate-900">Product managers</span>{" "}
                triage, score with RICE, and march work through a clear
                pipeline, with every decision logged.
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
              <span>
                <span className="font-semibold text-slate-900">Leadership</span>{" "}
                gets a calm overview of pipeline health, top priorities, and
                what's already on the roadmap.
              </span>
            </li>
          </ul>
        </div>

        <form
          onSubmit={onContinue}
          className="space-y-6 rounded-xl border border-slate-300 bg-slate-50 p-6 shadow-card sm:p-8"
        >
          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-800">
              Pick a portal to get started
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <RoleCard
                label="Business Requestor"
                description="Submit new problem statements, track your own asks, and follow updates from Product."
                selected={selectedRole === ROLES.BR}
                onClick={() => setSelectedRole(ROLES.BR)}
              />
              <RoleCard
                label="Product Manager"
                description="Triage intake, score with RICE, move cases through the pipeline, and manage access."
                selected={selectedRole === ROLES.PM}
                onClick={() => setSelectedRole(ROLES.PM)}
              />
              <RoleCard
                label="Leadership"
                description="Executive overview — pipeline health, top RICE priorities, and approval status at a glance."
                selected={selectedRole === ROLES.LEADERSHIP}
                onClick={() => setSelectedRole(ROLES.LEADERSHIP)}
              />
            </div>
          </div>

          {selectedRole ? (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-800">
                What should we call you?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. Sarah Chen"
                className="block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-accent-500"
              />
            </div>
          ) : null}

          {error ? (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-600">
              Click the app title any time to switch portals.
            </p>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!selectedRole || !name.trim()}
            >
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
