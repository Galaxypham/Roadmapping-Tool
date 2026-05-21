# Roadmapping Tool

Product intake and roadmapping template by Galaxy Pham.

Built to make the full request pipeline visible and traceable so nothing falls through the cracks and nobody has to side-channel engineering to get heard.

- Live demo: https://roadmapping-tool-seven.vercel.app
- Repo: https://github.com/Galaxypham/Roadmapping-Tool

---

## Why this exists

Most intake breakdowns are not caused by missing prioritization frameworks. They are caused by missing visibility.

Common failure pattern:

- Stakeholders email engineering directly and bypass PM workflow.
- Requests live in DM/email threads and become impossible to audit.
- Work in flight disappears when people take PTO or leave.
- Requestors cannot see queue context, lose trust, and route around PMs.
- PMs spend hours reconstructing context from scattered sources.

This template solves that by making request flow and decisions explicit:

- Permanent case records with non-reusable case numbers
- Reason-required status changes
- Field-level revision history with before/after diffs
- Shared visibility across requestors, PMs, and leadership
- Audit trail for every major mutation

---

## What it includes

- Three roles: Business Requestor, Product Manager, Leadership
- Pipeline statuses: `New -> Under Review -> Roadmapped -> On Hold -> Declined`
- Lifecycle stages from Discovery through Deprecated, plus Off-track
- BR intake `Fill with AI` flow (Gemini) to draft form fields from a plain-language project description
- Industry-standard RICE scoring (Intercom, 2017): `(Reach × Impact × Confidence) ÷ Effort`
  - Reach: raw count of people/events per fixed period (e.g. users/quarter)
  - Impact: canonical multiplier scale `{0.25, 0.5, 1, 2, 3}` (Minimal → Massive)
  - Confidence: percentage `{50%, 80%, 100%}`
  - Effort: person-months
  - Only the roadmap threshold is configurable — no per-dimension weight knobs
- Drag-and-drop roadmap ranking with `@dnd-kit`
- Leadership Insights with drill-down metrics
- Case activity log + revision history
- Restriction-aware access controls and allowlist support
- PDF exports (Cases, Roadmap, Lifecycle, Insights)
- Six fictional B2B SaaS seed cases (`@example.com` emails)

---

## How RICE scoring works

This tool implements the original Intercom (2017) RICE formulation:

```text
RICE score = (Reach × Impact × Confidence) ÷ Effort
```

| Dimension      | Unit / scale                                                          | Notes                                                                                              |
| -------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Reach**      | Raw count of people/events per fixed period                           | Pick a time window once (e.g. "per quarter") and reuse it for every case. Count *actually affected*. |
| **Impact**     | Fixed multiplier: `3` Massive, `2` High, `1` Medium, `0.5` Low, `0.25` Minimal | Per person reached, not total.                                                                     |
| **Confidence** | Percentage as decimal: `1.0` (100%), `0.8` (80%), `0.5` (50%)         | If your honest answer is < 50%, the case isn't ready to score — go gather data first.              |
| **Effort**     | Person-months across product + design + engineering                   | Round to the nearest 0.5. Don't sandbag — high-effort work should clear a higher bar.              |

The result is a comparable number, not an "out of 100" rating. To calibrate the **roadmap threshold** in Settings:

1. Score 3–5 cases you already know belong on the roadmap.
2. Score 3–5 cases you already know don't.
3. Set the threshold somewhere between the two clusters.

There are deliberately no per-dimension weight knobs — the input scales *are* the weights, and adding tunable weights on top breaks the cross-case and cross-org comparability that makes RICE useful.

---

## Tech stack

- React 18 + Vite
- React Router v6
- Tailwind CSS v3
- `@dnd-kit`
- `jsPDF` + `jspdf-autotable`
- `localStorage` persistence (no backend)

---

## Run locally

Requires Node 18+ and npm.

```bash
npm install
npm run dev
```

Dev server: <http://localhost:5173>

To enable BR "Fill with AI", set:

```bash
VITE_GEMINI_API_KEY=your_key_here
```

Other scripts:

```bash
npm run build
npm run preview
npm run lint
```

---

## Seed data and demo reset

Seed cases live in `src/lib/seed.js`.

In-app controls:

- Settings -> Demo data -> Reload seed
- Settings -> Demo data -> Clear data

---

## Project structure

```text
src/
  App.jsx
  main.jsx
  index.css
  lib/
    constants.js
    format.js
    rice.js
    riceMigration.js
    seed.js
    storage.js
    leadershipAnalytics.js
    dashboardFilters.js
    dashboardPdf.js
  context/
    AppContext.jsx
  components/
  pages/
```

---

## Deploy to Vercel

This is a static Vite SPA. Vercel setup:

1. Import the repo in Vercel.
2. Keep defaults (Framework: Vite, Build: `npm run build`, Output: `dist`).
3. Deploy.

`vercel.json` already includes SPA history fallback:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Moving from localStorage to a backend

Persistence is isolated in `src/lib/storage.js`.

Typical migration path:

1. Replace storage reads/writes with API calls.
2. Update app bootstrapping in `AppContext` to async hydration.
3. Replace local mirror writes with server writes.
4. Keep existing activity/revision helpers and change storage layer only.

---

## Limitations

- No real auth (role toggle is local state)
- localStorage quota limits attachment-heavy use
- Restriction matching is demo-grade synthetic email logic

Do not use real customer or employee data in this template.

---

## License

All rights reserved. License terms TBD - please contact the author before reusing or redistributing this code.
