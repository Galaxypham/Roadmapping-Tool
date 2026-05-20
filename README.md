# PS Intake Tool

A calm, modern problem statement intake tool for Product Managers.

Capture incoming product requests (bug reports, tooling enhancements, new builds), prioritize them with RICE, move them through a clear pipeline, and keep an honest, fully auditable paper trail along the way.

This is a **portfolio / demo template**. Everything is saved locally to the browser (`localStorage`). No backend, no auth, no servers. Fork it, change the copy, change the colors, and use it to demo a product workflow without standing up infrastructure.

- **Live demo:** _add your Vercel URL here once deployed_
- **Repo:** _add your GitHub repo URL here_

---

## What's inside

- Three roles — **Business Requestor (BR)**, **Product Manager (PM)**, and **Leadership** — switchable from the nav at any time
- Five pipeline statuses (`New` → `Under Review` → `Roadmapped` → `On Hold` / `Declined`)
- Eight product lifecycle statuses (Discovery → Deprecated) that unlock once a case is roadmapped
- Weighted **RICE scoring** with PM-configurable global weights and a configurable roadmap threshold
- Drag-and-drop **roadmap ranking** (PM only) — the order surfaces on the Leadership Insights page and in the "On the roadmap" preset
- A **Leadership Insights** page with a delivery scoreboard, lifecycle funnel, aging-in-stage tracker, intake trends, decision outcomes, recent releases, and roadmap composition — every metric drills down to its underlying cases
- Per-case **access control** with allowlist of authorized emails plus an automatic match for the original requestor
- **Mandatory reason modal** on every PM mutation — every change lands in the activity log
- Field-level **revision history** with before / after diffs
- **Related cases** with free-text context notes
- Role-aware defaults on the **Cases** tab — BRs land on "My submissions", PMs on "Needs triage", Leadership on "On the roadmap"
- Restriction-aware shared list with filters, sort, search, and a lock-icon view for non-authorized viewers
- **PDF export** from the Cases list, the Roadmap, the Lifecycle view, and the Insights roadmap
- Top-level **error boundary** that catches render errors and shows a recovery card instead of a blank screen
- Friendly **empty states** everywhere
- Six realistic, fictional seed cases (a generic B2B SaaS demo) spanning every status, type, and priority

## Tech stack

- React 18 + Vite 5
- React Router v6
- Tailwind CSS v3
- `@dnd-kit` for the drag-and-drop roadmap
- `jsPDF` + `jspdf-autotable` for PDF export
- `localStorage` for persistence
- No backend dependencies

## Run it locally

Requires Node 18+ and npm.

```bash
npm install
npm run dev
```

The dev server opens at <http://localhost:5173>. On first load you'll see the welcome page; pick a role, enter your name, and you're in.

Other scripts:

```bash
npm run build     # Production build into ./dist
npm run preview   # Serve the production build
```

## Customizing the seed data

All demo cases live in [`src/lib/seed.js`](src/lib/seed.js). Change anything you want — the file is just a function that returns `{ cases, counter }`.

Once you've edited it, reload the seed from inside the running app:

> **Settings → Demo data → Reload seed**

You'll be asked for a reason (per the audit-trail design) and the entire case set will be replaced with the freshly imported data.

To completely wipe state (e.g. before recording a demo):

> **Settings → Demo data → Clear data**

## Adjusting design tokens

- **Color palette**: edit `tailwind.config.js` (look for the `accent` color ramp).
- **Typography**: the app uses Inter via `https://rsms.me/inter/inter.css`. Swap that out in `src/index.css` if you'd prefer a different stack.
- **Status / type / priority literals**: live in `src/lib/constants.js`. Every screen reads from there, so renaming a status only requires one edit.

## Deploying to Vercel

This project is a pure static Vite SPA, so any host that serves static files works. Step-by-step for Vercel:

1. Push the repo to GitHub.
2. Sign in at <https://vercel.com> and click **Add New… → Project**.
3. Pick your GitHub repo. Vercel auto-detects Vite.
4. Confirm the defaults — Framework: **Vite**, Build: `npm run build`, Output: `dist`.
5. Click **Deploy**.

After the first deploy, every push to `main` triggers a fresh deploy. The localStorage data lives on each user's browser, so the deploy is completely stateless from Vercel's perspective.

If you're deploying somewhere that doesn't handle SPA history fallback automatically, add a rewrite rule that routes all paths to `/index.html`. On Vercel you can drop this into `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Swapping `localStorage` for a real database later

The whole persistence layer is isolated to a single file — [`src/lib/storage.js`](src/lib/storage.js) — and accessed via the `AppContext` provider. To move to a real backend:

1. Replace the body of each function in `src/lib/storage.js` with `fetch` calls to your API (`GET /cases`, `POST /cases`, etc.). Keep the function signatures the same.
2. Convert the synchronous reads (`getCases`, `getCounter`, …) into either an async pre-fetch on app boot or `useEffect`-driven loads inside `AppContext`. The provider's `bootstrapState()` function is the single place where startup hydration happens.
3. Remove the `useEffect` calls inside `AppContext` that mirror state back into localStorage; replace them with API writes (debounced, optimistic, your call).
4. Audit trail logic (activity log, revision history) already runs through `appendActivity` / `appendRevision` helpers — these don't need to change, just the storage layer underneath them.

## Project layout

```
src/
├── App.jsx                         # Top-level routing
├── main.jsx                        # React entry point — wraps the app in <ErrorBoundary>
├── index.css                       # Tailwind base + a few tweaks
├── lib/
│   ├── constants.js                # Roles, statuses, request types, priorities, storage keys, tooltips
│   ├── format.js                   # Date / case-number / id helpers
│   ├── rice.js                     # RICE calculation + threshold helpers
│   ├── seed.js                     # Demo cases (customize me!)
│   ├── storage.js                  # localStorage wrapper
│   ├── documents.js                # Document upload / file-size helpers
│   ├── accessibleColors.js         # Color palette tuned for colorblind safety
│   ├── dashboardFilters.js         # Cases-tab filter / sort engine
│   ├── dashboardPresets.js         # Per-role saved presets + default-preset helpers
│   ├── dashboardPdf.js             # PDF export for Cases / Roadmap / Lifecycle / Insights
│   └── leadershipAnalytics.js      # Pure compute helpers for Insights panels
├── context/
│   └── AppContext.jsx              # State, mutations, permission helpers
├── components/
│   ├── ErrorBoundary.jsx           # Top-level error catcher with a recovery card
│   ├── layout/
│   │   ├── AppLayout.jsx           # Authenticated shell + nav
│   │   └── Navigation.jsx          # Top nav with role toggle
│   ├── ui/                         # Badge, Button, Card, EmptyState, ReasonModal, Tabs, ...
│   ├── case/                       # Case-detail section components
│   ├── dashboard/                  # Cases list card + filter bar
│   ├── intake/                     # Supporting documents widget for the BR form
│   ├── roadmap/                    # Drag-and-drop sortable roadmap list
│   └── leadership/                 # Insights panels + drill-down modal
└── pages/
    ├── Landing.jsx                 # Welcome + role selection
    ├── Dashboard.jsx               # Shared Cases list (role-aware default preset)
    ├── BrPortal.jsx                # New-submission intake form
    ├── PmPortal.jsx                # PM Roadmap (drag-and-drop ranking)
    ├── PmLifecycle.jsx             # PM Lifecycle (Discovery → Deprecated)
    ├── LeadershipPortal.jsx        # Insights with Roadmap / Health / Trends tabs
    ├── CaseDetail.jsx              # Full case detail (8 sections)
    └── Settings.jsx                # Identity + RICE weights + demo data utilities
```

## Notes & limitations

- No accounts, no real auth — the "role" is just a local toggle. Anyone can switch to PM and see / edit everything. Don't ship this to production as-is.
- Restriction email matching is demo-grade: it derives a synthetic email from the user's name (`Maya Lin` → `maya.lin@example.com`). Replace this with a real identity claim once you have auth.
- The PS counter never resets even when cases are deleted, per the design intent: case numbers are permanent.
- Documents are stored as data URLs inside `localStorage`. The browser cap is roughly 5 MB total, so heavy attachment use will hit a quota error — the app catches it and surfaces a toast.
- All seed data is fictional and uses the `@example.com` domain (reserved by IANA, so it can never collide with a real address).

## License

All rights reserved. License terms TBD — please contact the author before reusing or redistributing this code.

## About

A template built by Galaxy Pham to help product organizations bring visibility and structure to roadmap prioritization. Demo data is fictional and used purely for illustration.
