# Launch Kit

**Author:** Galaxy Pham  
**Live demo:** https://roadmapping-tool-seven.vercel.app  
**Repo:** https://github.com/Galaxypham/Roadmapping-Tool  
**Stack:** React 18, Vite, Tailwind, @dnd-kit, jsPDF, localStorage

---

## What this is

A product intake and roadmapping system built to make the full request pipeline visible and traceable - so nothing falls through the cracks and nobody has to side-channel engineering to get heard.

This page is the launch kit for that tool: the origin story, feature overview, pre-launch planning, launch execution, post-launch operations, demo script, and documentation standards I used to ship and hand it off.

---

## The problem

During my time as a Product Manager at Meta, I owned the full enterprise tooling launch calendar across six global regional teams - triaging 100 to 150 requests per half across Security, Finance, Compliance, and Business Development, without direct authority over any contributing engineering team.

The intake process had a specific failure pattern I kept running into:

- Stakeholders emailed friends in engineering directly to get features built, bypassing PMs and the product lifecycle entirely
- Requests lived in DMs and email threads - invisible to anyone not cc'd, impossible to search or audit later
- When someone went on vacation or left the company, work in flight simply disappeared with them
- Requestors had no visibility into the queue - their ask felt ignored even when it was just lower priority - so they lost trust in product and leadership and routed around them again
- PMs spent hours every week reconstructing context from scattered threads, and things still fell through the cracks regularly

The instinct is to treat this as a prioritization problem. It is not. It is a **visibility problem**. Requestors do not bypass PMs because they disagree with the prioritization framework - they bypass PMs because they cannot see the pipeline and do not trust it.

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

A single-page React app with three roles - Business Requestor, Product Manager, and Leadership - that walks a request from submission through to delivery and surfaces the full audit trail at every step.

No backend. No auth servers. No setup required. Runs anywhere static files run, which means any product org can demo the workflow in under two minutes without IT involvement. The architecture is intentionally backend-shaped - clean data model, auditable mutations, reason-required writes - so it can graduate to a real backend without rewriting the UI.

### Feature overview

**Intake**  
Structured submission form with request type, priority, business impact, supporting links, and attachments. Auto case numbering that is permanent and non-reusable - even declined cases keep their number in the audit trail. Six realistic B2B SaaS seed cases preloaded for demo and onboarding purposes. Business Requestors can also use **Fill with AI** to draft intake fields from a plain-language project description before submitting.

**Triage and scoring**  
Five pipeline statuses: New, Under Review, Roadmapped, On Hold, Declined. RICE scoring - (Reach x Impact x Confidence) / Effort - with PM-configurable weights per dimension and a roadmap threshold, making the "what gets built" decision explicit and defensible rather than instinct-based. RICE totals are shown as standalone weighted scores (not an "out of max" denominator). Mandatory reason modal fires on every PM status change. Every mutation is logged with a timestamp and the actor's name.

**Roadmap**  
Drag-and-drop ranking with @dnd-kit. Ranked order surfaces in Leadership Insights and the roadmapped preset filter. Reorders are logged with reasons the same way status changes are.

**Lifecycle**  
Eight stages from Discovery through Deprecated, plus an Off-track flag. Aging-in-stage tracking surfaces stalled work automatically before it becomes invisible to leadership.

**Audit trail**  
Activity log on every case showing who did what, when, and why. Field-level revision history with before/after diffs on every change. Per-case access control with an authorized-emails allowlist. Restriction-aware shared list view - non-authorized viewers see a lock indicator, not a missing record.

**Leadership Insights**  
Delivery scoreboard, lifecycle funnel, aging tracker, intake trends, decision outcomes, recent releases, and roadmap composition. Every metric drills down to its underlying cases. Designed so leadership can answer "what is in flight and what is stalled" without asking a PM.

**Polish**  
Role-aware default views - BRs land on "My submissions," PMs land on "Needs triage," Leadership lands on "On the roadmap." PDF export from Cases, Roadmap, Lifecycle, and Insights. Top-level error boundary with a recovery card. Accessible color palette tuned for colorblind safety. Friendly empty states on every view.

---

## Who it is for

- **Product Managers** who need a single structured intake channel instead of scattered email and Slack threads
- **Engineering leads** who are tired of being the back-channel for stakeholder requests
- **Operations and BizOps teams** that need lightweight intake without standing up Jira
- **Leadership** who want real-time visibility into what is queued, roadmapped, and in flight
- **Product orgs evaluating a new intake workflow** - use the live demo to walk the team through the model before committing to a build

---

## Phase 1 - Pre-launch planning

*Note: This section applies the standard pre-launch framework to this tool. Sections marked as hypothetical reflect how I would structure this phase for a real product launch - drawing on the same approach I used for enterprise AI tool launches at Meta.*

### Launch brief

**What:** A product intake and roadmapping tool that gives every stakeholder - Business Requestors, Product Managers, and Leadership - a structured, visible, and traceable pipeline for product requests.

**Why:** The status quo - ad hoc intake through email and Slack - creates invisible work, erodes trust between stakeholders and PMs, and causes engineering to become a back-channel for requests. This tool replaces that with a single system of record.

**Who:** Product Managers, Business Requestors, Engineering leads, and Leadership at any product org that manages a backlog of incoming requests without a formal intake process.

**When:** Immediate availability as a demo and template. Production-ready version requires a backend integration (see Known Gaps).

**Success metrics:**

- Engineering bypass rate near zero within 30 days of adoption
- 100% of new requests entering through the tool rather than ad hoc channels
- PM triage time per request reduced by at least 50%
- Requestor satisfaction with pipeline visibility measurably improved

### Goals and OKRs

**Objective:** Make the product request pipeline fully visible and traceable for all roles.

**Key results:**

- KR1: 100% of incoming requests submitted through the intake form within the first sprint of adoption
- KR2: Zero undocumented status changes - every mutation carries a reason and a timestamp
- KR3: Leadership can answer "what is stalled and why" without a PM sync within 14 days of go-live
- KR4: Onboarding time for new PMs using the tool under 30 minutes, measured against the self-serve README

*At Meta, I defined and owned KPIs and OKRs across product areas, tracking adoption metrics and feature usage post-launch to surface roadmap signals and deliver executive-ready recommendations to Director and VP-level stakeholders across six global regions. These OKRs follow that same structure.*

### RACI / stakeholder map

| Role | Responsible | Accountable | Consulted | Informed |
| --- | --- | --- | --- | --- |
| Tool build and deployment | Galaxy Pham | Galaxy Pham | Engineering | All users |
| Onboarding and enablement | Galaxy Pham | Galaxy Pham | PM leads | All users |
| RICE weight configuration | PM lead | PM lead | Leadership | BRs |
| Roadmap threshold decisions | PM lead | Leadership | PM lead | BRs |
| Post-launch adoption tracking | Galaxy Pham | PM lead | Leadership | - |

*At Meta, I ran cross-functional launch readiness checkpoints across Product, Engineering, Security, Legal, Finance, and Business Development - aligning stakeholders against phased rollout timelines without direct authority over any contributing team. This RACI reflects that same model applied to a smaller org context.*

### Risk and dependency log

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Low adoption - PMs continue using ad hoc intake channels | Medium | High | Mandate intake form as the only official channel from day one; Engineering declines ad hoc requests |
| localStorage limits hit by heavy attachment use | Medium | Low | App surfaces a toast error; mitigated by moving to a backend in production |
| Role toggle misuse - users switching roles to see restricted cases | Low | Medium | Production version requires real auth; demo version is not suitable for sensitive data |
| Resistance from stakeholders accustomed to direct engineering access | High | High | Leadership alignment before launch; mandatory reason modal builds trust over time |
| RICE weight misconfiguration inflating low-quality requests | Low | Medium | Default weights set to 1.0; changes require a documented reason and are logged globally |

---

## Phase 2 - Launch execution

### Launch checklist

**Code and repo**

- [x] Pushed to GitHub - https://github.com/Galaxypham/Roadmapping-Tool
- [x] All seed data uses generic @example.com domain - no real company names
- [ ] Final README pass with screenshots added
- [ ] npm run build passes cleanly with no warnings
- [ ] npm run lint clean
- [x] License marked in README
- [ ] Repo description and topics added: react, vite, tailwind, product-management, roadmapping, template

**Deploy**

- [x] Repo connected to Vercel
- [x] First deploy live - https://roadmapping-tool-seven.vercel.app
- [ ] SPA fallback confirmed - vercel.json rewrites /(.*) to /index.html
- [ ] Tested on desktop Chrome, Safari, Firefox
- [ ] Tested on iOS Safari and Android Chrome

**Assets**

- [ ] Screenshots captured - see list below
- [ ] 90-second Loom walkthrough recorded
- [ ] Screenshots added to README

### Comms and messaging guide

**Internal announcement (for PM and engineering teams)**

> We are moving all product requests to a single intake system starting [date]. No more DMs to engineering, no more email threads. Every request goes through the Roadmapping Tool - it gets a case number, a RICE score, and a tracked status. Every decision has a reason attached. You will always know where your request stands and why.  
> Live demo: https://roadmapping-tool-seven.vercel.app  
> Questions: bring them to the PM lead before launch day.

**Release notes (internal)**

> Roadmapping Tool v1.0 - now live.  
> Three roles: Business Requestor, Product Manager, Leadership.  
> Key capabilities: structured intake with optional AI-assisted draft fill, auto case numbering, RICE scoring with configurable weights, drag-and-drop roadmap, eight-stage lifecycle tracking, leadership insights dashboard, full audit trail on every case.  
> Known limitations: localStorage only - not suitable for sensitive data. Role toggle is local state, not real auth. See FAQ for details.

**External messaging (for portfolio and community sharing)**

> A product intake and roadmapping template for orgs that have outgrown ad hoc request channels. Structured intake (including optional AI-assisted draft fill), RICE scoring, drag-and-drop roadmap, lifecycle tracking, leadership insights, and a full audit trail on every change. No backend - runs in the browser. Built by Galaxy Pham.

### Launch timeline / runbook

*This is a hypothetical runbook structured the way I would run a real internal rollout - based on the phased rollout model I owned at Meta for enterprise AI tool launches.*

| Day | Activity | Owner |
| --- | --- | --- |
| D-7 | Share live demo link with PM leads and engineering leads for feedback | Galaxy Pham |
| D-5 | Incorporate feedback, finalize seed data, confirm README complete | Galaxy Pham |
| D-3 | Send internal announcement to all stakeholders | PM lead |
| D-1 | Final deploy check, SPA fallback confirmed, cross-browser tested | Galaxy Pham |
| D-0 | Go-live. All new requests directed to the tool. Engineering declines ad hoc intake. | PM lead |
| D+3 | First adoption check - how many requests submitted through the tool vs. ad hoc | Galaxy Pham |
| D+7 | First week retro with PM leads - what is working, what needs adjustment | PM lead |
| D+30 | Full adoption review against OKRs | Galaxy Pham |

### Rollback plan

*Rollback criteria: if adoption is critically low after 14 days and the root cause is tool friction rather than change management, revert to the previous intake process while addressing the friction.*

**Steps to rollback:**

1. PM lead communicates to all stakeholders that the tool is paused
2. Revert to previous intake channel temporarily
3. Export current case data from localStorage before clearing
4. Diagnose the friction point - form complexity, role confusion, or RICE scoring friction
5. Address the issue and re-launch with a revised onboarding approach

*At Meta, I stood up the alpha-to-GA program for the LLM automation system, defining entry and exit criteria for each phase and achieving a 96% self-service resolution rate within 3 months. A clear rollback plan was part of every phase gate before GA.*

---

## Phase 3 - Post-launch operations

### Metrics dashboard

These are the key signals to monitor in the first 30 days after launch. Each maps to a specific behavior the tool is designed to change.

| Metric | What it measures | Target | Source |
| --- | --- | --- | --- |
| Engineering bypass rate | Requests that arrive outside the tool | Near zero by day 30 | PM observation |
| Intake form submission rate | % of requests entering via tool | 100% within sprint 1 | Tool case count |
| Time to triage | Hours from New to Under Review | Under 48 hours | Activity log timestamps |
| RICE scoring completion rate | % of cases scored before status change | 100% - enforced by tool | Tool audit trail |
| Requestor satisfaction | Do BRs feel their requests are visible and fairly considered | Qualitative - survey or 1:1 | PM outreach |
| Support questions about process | Inbound questions about how the intake works | Declining week over week | PM observation |
| On Hold aging | Cases sitting in On Hold without documented revisit | Zero cases over 30 days without a note | Leadership Insights |

*At Meta, I built and maintained a real-time enterprise tool tracker as the single source of truth for tool utilization and spend. I defined and owned KPIs and OKRs across product areas, tracking adoption metrics and feature usage post-launch to surface roadmap signals. These metrics follow that same discipline.*

### Feedback loop setup

**How to collect feedback post-launch:**

- Week 1: PM lead runs a 15-minute retro with each role group - BRs, PMs, and Engineering leads separately
- Week 2: Open async feedback channel (Slack thread or form) for anyone to flag friction points
- Week 4: Structured survey to all active users covering: ease of submission, visibility into request status, trust in the prioritization process, and overall time saved vs. previous process
- Ongoing: PM notes on cases are a passive feedback channel - patterns in PM notes surface product friction without a formal collection step

**How to route feedback:**

All feedback goes to the PM lead first. Themes are documented in a running feedback log. Anything that requires a product change goes through the intake form itself - using the tool to improve the tool.

*At Racks, I stood up feedback intake and triage infrastructure across 100+ user interviews and contextual inquiry sessions, translating insights into prioritized product iterations with clear entry and exit criteria per release cycle. The same principle applies here - feedback is only useful if it has a structured home.*

### Retrospective template

*Run this at 30 days post-launch with the PM lead and at least one representative from each role group.*

**What went well**

- What parts of the launch went smoothly?
- Which user behaviors changed fastest and why?
- What documentation or enablement worked better than expected?

**What did not go well**

- Where did adoption stall or regress?
- What friction points came up repeatedly in feedback?
- What did we underestimate in the rollout plan?

**What to improve next time**

- What would we change about the rollout sequencing?
- What onboarding materials were missing or unclear?
- What product changes does the feedback suggest for v2?

**Decisions and owners**

- List any product changes agreed on in the retro, with owners and timelines
- Document in the tool itself as new intake requests so they enter the prioritization queue

---

## Demo script (5 minutes)

A walkthrough you can run live or record as a Loom. Switch roles from the nav at each step.

**Opening line**

> "This tool exists because visibility is the real problem in most intake processes, not prioritization. I want to show you how a request moves from submission to delivery and how every decision along the way stays traceable."

**1. The requestor experience - 60 seconds**  
Open the live demo, pick the BR role, enter a name. Show "My submissions" as the role-aware default view. Click New request and optionally show **Fill with AI** to draft the form from a plain-language prompt, then refine fields, attach a doc, and submit. Point to the case number: "Permanent. Non-reusable. Even if this case gets declined, the number and its full history stay in the system."

**2. The PM experience - 90 seconds**  
Switch to PM role, land on "Needs triage." Open the new case and walk through the eight sections of detail. Adjust RICE inputs and show the score recompute against the roadmap threshold. Move status to Under Review - the reason modal fires - save. Open the Activity log and Revision history: "Every change has a reason and a diff. No more reconstructing context from a Slack thread three weeks later."

**3. The roadmap - 45 seconds**  
Go to PM Roadmap. Drag cases to reorder. Open Settings, change a RICE weight, save with a reason. "The weights are configurable so teams can tune the framework to their context without replacing it."

**4. Leadership visibility - 45 seconds**  
Switch to Leadership, land on Insights. Click a number on the scoreboard and drill down to the underlying cases. "Leadership can now answer what is in flight and what is stalled without pulling a PM into a meeting."

**Closing line**

> "Every action you saw - every status change, every score adjustment, every reorder - is logged with a reason and a timestamp. The tool's job is to make the pipeline visible enough that nobody needs to side-channel engineering anymore."

---

## Documentation standards used

Every decision in this tool follows the same documentation principles I applied to enterprise AI tool launches at Meta - where I authored SOPs, wikis, and Q&A repositories that achieved an 83% reduction in onboarding time and a measurable decrease in support tickets across global teams.

**Reason-required writes.** Every status change in the tool requires a reason before saving. This mirrors the mandatory justification layer I built into launch readiness checkpoints at Meta - so decisions are never made silently.

**Audit trail over memory.** The activity log and revision history replace the need to ask "who changed this and why." At Meta, reconstructing context from scattered threads was a significant PM time sink. The tool eliminates that by making the history part of the record.

**Self-serve documentation.** The README, seed data, and settings panel are designed so any team can onboard without asking the builder. At Meta, this principle reduced onboarding time for the Global Security Department from three hours to thirty minutes weekly across 40,000 employees.

**Role-aware defaults.** Each role lands on the view most relevant to their job. This reduces friction at first login and mirrors the enablement principle behind the internal product guides I built at Meta - meeting people where they are rather than making them navigate to what they need.

---

## Known gaps and what comes next

These are acknowledged limitations, not oversights. A good launch kit names what is not finished.

**Current limitations**

- localStorage cap of approximately 5MB means heavy attachment use will hit a quota error - the app catches it and surfaces a toast
- The role toggle is local state, not real auth - not suitable for production use with sensitive data
- Restriction email matching is demo-grade, derived from the user's entered name rather than verified identity

**Potential next version**

- Real auth and backend - Supabase or Postgres with a thin API layer
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
It is a template and demo, not production software. There is no real auth - the role toggle is local state. Do not put real customer or employee data in it. The architecture is backend-shaped by design, so swapping localStorage for a real API is a focused refactor if your org wants to build on it.

**Why no backend?**  
So any product org can run the demo instantly with zero setup. The goal was to make the workflow evaluation frictionless - a team should be able to decide whether this model works for them in five minutes, not after an IT provisioning ticket.

**Why RICE?**  
Because it is the most defensible lightweight framework: (Reach x Impact x Confidence) / Effort. Configurable weights mean teams can tune it to their context without discarding it. The threshold concept makes the roadmapping decision explicit and auditable rather than vibes-based.

**Can we fork and customize it?**  
See the LICENSE file in the repo for current terms. Seed data, color palette, and status labels all live in isolated files for easy swapping: src/lib/seed.js, tailwind.config.js, src/lib/constants.js.

---

*Built by Galaxy Pham. Demo data is fictional - generic B2B SaaS scenarios, @example.com emails. License terms in the repo.*
