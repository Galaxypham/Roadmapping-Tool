# Roadmapping Tool — Launch Kit

**Author:** Galaxy Pham
**Live demo:** https://roadmapping-tool-seven.vercel.app
**Repo:** https://github.com/Galaxypham/Roadmapping-Tool
**Stack:** React 18, Vite, Tailwind, @dnd-kit, jsPDF, localStorage

---

## What this is

A product intake and roadmapping system built to make the full request pipeline visible and traceable — so nothing falls through the cracks and nobody has to side-channel engineering to get heard.

This page is the launch kit for that tool: the origin story, feature overview, demo script, launch checklist, and documentation standards I used to ship and hand it off.

---

## The problem

During my time as a Product Manager at Meta, I owned the full enterprise tooling launch calendar across six global regional teams — triaging 100 to 150 requests per half across Security, Finance, Compliance, and Business Development, without direct authority over any contributing engineering team.

The intake process had a specific failure pattern I kept running into:

- Stakeholders emailed friends in engineering directly to get features built, bypassing PMs and the product lifecycle entirely
- Requests lived in DMs and email threads — invisible to anyone not cc'd, impossible to search or audit later
- When someone went on vacation or left the company, work in flight simply disappeared with them
- Requestors had no visibility into the queue — their ask felt ignored even when it was just lower priority — so they lost trust in product and leadership and routed around them again
- PMs spent hours every week reconstructing context from scattered threads, and things still fell through the cracks regularly

The instinct is to treat this as a prioritization problem. It is not. It is a **visibility problem**. Requestors do not bypass PMs because they disagree with the prioritization framework — they bypass PMs because they cannot see the pipeline and do not trust it.

The fix is not a better scoring formula. The fix is making the whole pipeline visible and traceable so that:

- Every request has a permanent home with a case number
- Every decision has a reason attached to it
- Every status change has a revision history with a before/after diff
- Requestors can see exactly where they sit in the queue and why
- PMs and leadership share a single source of truth
- Engineering stops getting tapped on the shoulder, because the tool is the channel

That is the entire premise this tool is built around.

---

## What I built

A single-page React app with three roles — Business Requestor, Product Manager, and Leadership — that walks a request from submission through to delivery and surfaces the full audit trail at every step.

No backend. No auth servers. No setup required. Runs anywhere static files run, which means any product org can demo the workflow in under two minutes without IT involvement. The architecture is intentionally backend-shaped — clean data model, auditable mutations, reason-required writes — so it can graduate to a real backend without rewriting the UI.

### Feature overview

**Intake**
Structured submission form with request type, priority, business impact, supporting links, and attachments. Auto case numbering that is permanent and non-reusable — even declined cases keep their number in the audit trail. Six realistic B2B SaaS seed cases preloaded for demo and onboarding purposes.

**Triage and scoring**
Five pipeline statuses: New 뿯↽ Under Review 뿯↽ Roadmapped 뿯↽ On Hold 뿯↽ Declined. Weighted RICE scoring - (Reach x Impact x Confidence) / Effort - with PM-configurable weights per dimension and a roadmap threshold — making the "what gets built" decision explicit and defensible rather than instinct-based. Mandatory reason modal fires on every PM status change. Every mutation is logged with a timestamp and the actor's name.

**Roadmap**
Drag-and-drop ranking with @dnd-kit. Ranked order surfaces in Leadership Insights and the roadmapped preset filter. Reorders are logged with reasons the same way status changes are.

**Lifecycle**
Eight stages from Discovery through Deprecated, plus an Off-track flag. Aging-in-stage tracking surfaces stalled work automatically before it becomes invisible to leadership.

**Audit trail**
Activity log on every case showing who did what, when, and why. Field-level revision history with before/after diffs on every change. Per-case access control with an authorized-emails allowlist. Restriction-aware shared list view — non-authorized viewers see a lock indicator, not a missing record.

**Leadership Insights**
Delivery scoreboard, lifecycle funnel, aging tracker, intake trends, decision outcomes, recent releases, and roadmap composition. Every metric drills down to its underlying cases. Designed so leadership can answer "what is in flight and what is stalled" without asking a PM.

**Polish**
Role-aware default views — BRs land on "My submissions," PMs land on "Needs triage," Leadership lands on "On the roadmap." PDF export from Cases, Roadmap, Lifecycle, and Insights. Top-level error boundary with a recovery card. Accessible color palette tuned for colorblind safety. Friendly empty states on every view.

---

## Who it is for

- **Product Managers** who need a single structured intake channel instead of scattered email and Slack threads
- **Engineering leads** who are tired of being the back-channel for stakeholder requests
- **Operations and BizOps teams** that need lightweight intake without standing up Jira
- **Leadership** who want real-time visibility into what is queued, roadmapped, and in flight
- **Product orgs evaluating a new intake workflow** — use the live demo to walk the team through the model before committing to a build

---

## Demo script (5 minutes)

A walkthrough you can run live or record as a Loom. Switch roles from the nav at each step. Stay in character as the PM walking a new team through the tool for the first time.

**Opening line**
> "This tool exists because visibility is the real problem in most intake processes, not prioritization. I want to show you how a request moves from submission to delivery and how every decision along the way stays traceable."

**1. The requestor experience — 60 seconds**
Open the live demo, pick the BR role, enter a name. Show "My submissions" as the role-aware default view. Click New request, fill it out, attach a doc, submit. Point to the case number: *"Permanent. Non-reusable. Even if this case gets declined, the number and its full history stay in the system."*

**2. The PM experience — 90 seconds**
Switch to PM role, land on "Needs triage." Open the new case and walk through the eight sections of detail. Adjust RICE inputs and show the score recompute against the roadmap threshold. Move status to Under Review — the reason modal fires — save. Open the Activity log and Revision history: *"Every change has a reason and a diff. No more reconstructing context from a Slack thread three weeks later."*

**3. The roadmap — 45 seconds**
Go to PM Roadmap. Drag cases to reorder. Open Settings, change a RICE weight, save with a reason. *"The weights are configurable so teams can tune the framework to their context without replacing it."*

**4. Leadership visibility — 45 seconds**
Switch to Leadership, land on Insights. Click a number on the scoreboard and drill down to the underlying cases. *"Leadership can now answer 'what is in flight and what is stalled' without pulling a PM into a meeting."*

**Closing line**
> "Every action you saw — every status change, every score adjustment, every reorder — is logged with a reason and a timestamp. The tool's job is to make the pipeline visible enough that nobody needs to side-channel engineering anymore."

---

## Launch checklist

### Code and repo
- [x] Pushed to GitHub — https://github.com/Galaxypham/Roadmapping-Tool
- [x] All seed data uses generic @example.com domain — no real company names
- [ ] Final README pass with screenshots added
- [ ] npm run build passes cleanly with no warnings
- [ ] npm run lint clean
- [x] License marked in README
- [ ] Repo description and topics added: react, vite, tailwind, product-management, roadmapping, template

### Deploy
- [x] Repo connected to Vercel
- [x] First deploy live — https://roadmapping-tool-seven.vercel.app
- [ ] SPA fallback confirmed — vercel.json rewrites /(.*) to /index.html
- [ ] Tested on desktop Chrome, Safari, Firefox
- [ ] Tested on iOS Safari and Android Chrome

### Assets
- [ ] Screenshots captured — see list below
- [ ] 90-second Loom walkthrough recorded
- [ ] Screenshots added to README

### Distribution
- [ ] LinkedIn post published
- [ ] Shared in relevant PM and product ops communities

---

## Screenshots to capture

- [ ] Landing page — role selection
- [ ] BR portal — new submission form filled out
- [ ] Cases list — PM "Needs triage" view
- [ ] Case detail — full page
- [ ] Case detail — RICE scoring panel
- [ ] Case detail — activity log
- [ ] Case detail — revision history with a diff visible
- [ ] PM Roadmap — drag in progress
- [ ] PM Lifecycle — funnel view
- [ ] Leadership Insights — scoreboard
- [ ] Leadership Insights — drill-down modal
- [ ] Settings — RICE weights
- [ ] PDF export sample

---

## Documentation standards used

Every decision in this tool follows the same documentation principles I applied to enterprise AI tool launches at Meta — where I authored SOPs, wikis, and Q&A repositories that achieved an 83% reduction in onboarding time and a measurable decrease in support tickets across global teams.

**Reason-required writes.** Every status change in the tool requires a reason before saving. This mirrors the mandatory justification layer I built into launch readiness checkpoints at Meta — so decisions are never made silently.

**Audit trail over memory.** The activity log and revision history replace the need to ask "who changed this and why." At Meta, reconstructing context from scattered threads was a significant PM time sink. The tool eliminates that by making the history part of the record.

**Self-serve documentation.** The README, seed data, and settings panel are designed so any team can onboard without asking the builder. At Meta, this principle reduced onboarding time for the Global Security Department from three hours to thirty minutes weekly across 40,000 employees.

**Role-aware defaults.** Each role lands on the view most relevant to their job. This reduces friction at first login and mirrors the enablement principle behind the internal product guides I built at Meta — meeting people where they are rather than making them navigate to what they need.

---

## Known gaps and what comes next

These are acknowledged limitations, not oversights. A good launch kit names what is not finished.

**Current limitations**
- localStorage cap of approximately 5MB means heavy attachment use will hit a quota error — the app catches it and surfaces a toast
- The role toggle is local state, not real auth — not suitable for production use with sensitive data
- Restriction email matching is demo-grade, derived from the user's entered name rather than verified identity

**Potential next version**
- Real auth and backend — Supabase or Postgres with a thin API layer
- Multi-tenant workspaces
- Slack and email notifications on status changes
- Comments on cases separate from the activity log
- Saved views shareable by URL
- CSV import and export
- Integrations with Linear, Jira, and GitHub Issues
- SLA tracking with time-in-stage alerts

---

## FAQ

**Can we use this at work?**
It is a template and demo, not production software. There is no real auth — the role toggle is local state. Do not put real customer or employee data in it. The architecture is backend-shaped by design, so swapping localStorage for a real API is a focused refactor if your org wants to build on it.

**Why no backend?**
So any product org can run the demo instantly with zero setup. The goal was to make the workflow evaluation frictionless — a team should be able to decide whether this model works for them in five minutes, not after an IT provisioning ticket.

**Why RICE?**
Because it is the most defensible lightweight framework: (Reach x Impact x Confidence) / Effort. Configurable weights mean teams can tune it to their context without discarding it. The threshold concept makes the roadmapping decision explicit and auditable rather than vibes-based.

**Can we fork and customize it?**
See the LICENSE file in the repo for current terms. Seed data, color palette, and status labels all live in isolated files for easy swapping: src/lib/seed.js, tailwind.config.js, src/lib/constants.js.

---

*Built by Galaxy Pham. Demo data is fictional — generic B2B SaaS scenarios, @example.com emails. License terms in the repo.*
