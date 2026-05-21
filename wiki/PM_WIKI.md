# Roadmapping Tool · Full Reference Wiki

## Product Manager edition

---

## Overview

As a Product Manager, the Roadmapping Tool is your single source of truth for everything in flight. Every request that enters the system comes to you first. You triage it, score it, decide what gets roadmapped, and own the lifecycle from Discovery through Deprecated.

This guide covers every action available to you in the PM role - from your first login through managing a fully active pipeline.

---

## Getting started

When you open the tool, select **Product Manager** from the role selector and enter your name. Your name is attached to every action you take - every status change, every score update, every note - so use a consistent name each session.

You will land on **Needs Triage** by default. This is your working view. Every new request submitted by a Business Requestor appears here until you take action on it.

---

## Your default views

The PM role has four preset filters accessible from the top of the Cases list.

**Needs triage** - All cases in New status. This is your inbox. Start here every session.

**Under review** - Cases you have opened and are actively evaluating but have not yet scored or roadmapped.

**On the roadmap** - Cases you have moved to Roadmapped status. These are your committed items.

**All cases** - Every case in the system regardless of status. Use this for audits, searches, and full pipeline reviews.

---

## Triaging a new request

When a Business Requestor submits a request, it lands in your Needs Triage view with a status of New and an auto-assigned case number.

Open the case. You will see eight sections of detail including intake fields, attachments, related cases, RICE scoring, status and lifecycle, access control, PM notes, activity log, and revision history.

Read the request details first. Then decide whether you need more information before scoring or whether you have enough to move forward.

**If you need more information** - Move the status to Under Review and add a PM note explaining what you are waiting on. The reason modal will fire when you change status - document your reasoning there.

**If you have enough to score** - Move directly to the RICE scoring panel.

---

## RICE scoring

RICE stands for **Reach, Impact, Confidence, and Effort**. The tool uses the industry-standard Intercom (2017) formulation:

**(Reach × Impact × Confidence) ÷ Effort**

Each dimension has its own unit and scale - they are not freely tunable. Fixed canonical scales are what make RICE scores comparable across cases, across teams, and against other orgs' RICE work. There are deliberately no per-dimension weight knobs in this tool; adding tunable weights on top of the canonical scales breaks the comparability that makes RICE useful.

| Dimension      | Unit / scale                                                                | Notes                                                                                              |
| -------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Reach**      | Raw count of people/events per fixed period                                 | Pick one time window (e.g. "per quarter") and reuse it for every case.                             |
| **Impact**     | Fixed multiplier: `3` Massive, `2` High, `1` Medium, `0.5` Low, `0.25` Minimal | Per person reached, not total.                                                                     |
| **Confidence** | Percentage: `100%`, `80%`, `50%`                                            | Below 50% means the case isn't ready to score - go gather data first.                              |
| **Effort**     | Person-months across product + design + engineering                         | Round to the nearest 0.5.                                                                          |

The tool compares your calculated score against the **roadmap threshold** (default: 100). Cases that score above the threshold are flagged as candidates for roadmapping. Cases below the threshold are candidates for On Hold or Declined.

### Scoring each dimension

**Reach** - How many users or stakeholders does this affect, *per fixed time window*? Count people actually affected, not your total addressable market. A checkout bug touching every shopper might be 120,000 sessions per quarter; a CSM-only feature might be 40 CSMs per quarter. Pick a window once and reuse it for every case so your scores stay comparable.

**Impact** - How significantly does this move the needle for those users? Use the canonical scale:

- **3× Massive** - Game-changer per person; eliminates a major pain or unlocks a new job
- **2× High** - Meaningful improvement people will notice and talk about
- **1× Medium** - Solid improvement, but ordinary
- **0.5× Low** - Small nicety
- **0.25× Minimal** - Barely perceptible; paper cut fix

Impact is per person reached, not total. A tiny nuisance fix for 1M users is still Minimal - the math will surface it via Reach.

**Confidence** - How sure are you of your Reach, Impact, and Effort numbers combined?

- **100% High** - Backed by data: analytics, user research, A/B test, hard customer evidence
- **80% Medium** - Some evidence: a few interviews, internal team consensus, a decent analogue
- **50% Low** - Gut feel: a stakeholder asked for it, no real measurement

If your honest answer is below 50%, the case is not ready to score. Go validate first instead of inventing precision.

**Effort** - Total estimated work to deliver, in person-months across product, design, and engineering. Round to the nearest 0.5.

- 2 engineers for 3 weeks ≈ 1.5 person-months
- 1 designer + 2 engineers for 6 weeks ≈ 4.5 person-months
- A small one-engineer spike ≈ 0.25 person-months

Do not sandbag. High-effort work should clear a higher bar.

### Calibrating the roadmap threshold

The roadmap threshold is the only RICE knob in Settings. It is the minimum RICE score a case must reach to be flagged as a roadmap candidate.

The right value depends on your chosen Reach unit (users/quarter vs. tickets/month produces very different score scales). To calibrate:

1. Score 3-5 cases you already know belong on the roadmap.
2. Score 3-5 cases you already know don't.
3. Set the threshold somewhere between the two clusters.

The default is **100**. Adjust it as your team's Reach unit, average Effort sizes, and capacity evolve.

Cases with scores near the threshold are judgment calls. Use PM notes to document your reasoning when you roadmap a borderline case or decline a high-scoring one.

---

## Changing case status

Every status change in the tool requires a reason before it saves. No exceptions. The reason modal fires automatically on every status change.

Write a reason that would make sense to someone reading the activity log six months from now. Not "moving forward" but "RICE score of 320 exceeds threshold of 100, aligning with Q3 compliance initiative."

**Status options and when to use them**

**New** - Default on submission. Do not manually set cases back to New once triaged.

**Under Review** - You have opened the case and are evaluating it but have not made a decision. Use this to signal to BRs and Leadership that their request is being actively considered.

**Roadmapped** - You have scored the case, it meets the threshold, and it is committed to the roadmap. Moving a case to Roadmapped automatically assigns it a roadmap rank (appended to the bottom of the ranked list) and starts its lifecycle at Discovery.

**On Hold** - The request has merit but cannot be acted on now. Common reasons: dependency on another case, waiting for a strategic decision, resource constraints. Always document the specific reason and set a follow-up expectation in your PM note.

**Declined** - The request will not be built. Declining a case is a complete and permanent decision. The case remains in the system with its full history - it is never deleted. Write a thorough reason. BRs can see the status of their own cases.

---

## The roadmap

Every case with a Roadmapped status appears in the Roadmap view. Cases are ranked by drag-and-drop - highest priority at the top.

To reorder cases, drag the handle on the left side of any row and drop it in the new position. Every reorder is logged automatically - each case receives an activity log entry noting its new position.

Ranked order is visible to Leadership in the Insights view. It signals execution priority, not just intent. Keep it current.

### Ranking principles

- Rank by the order you expect the team to begin work, not by RICE score alone
- Cases near the top of the roadmap should have clear owners and timelines in their PM notes
- Cases in the bottom half of the roadmap should be reviewed quarterly - if they have not moved up in two cycles, reconsider whether they belong on the roadmap at all

---

## Lifecycle management

When a case is moved to Roadmapped, its lifecycle begins automatically at **Discovery**. Move cases through stages as work progresses. Every stage change requires a reason, the same as pipeline status changes.

**The eight lifecycle stages in order**

1. **Discovery** - Problem definition, research, stakeholder alignment
2. **Definition** - Requirements, scope, and success criteria documented
3. **Design** - Wireframes, specs, and design review
4. **Development** - Engineering is actively building
5. **QA / Testing** - Testing, bug fixes, and acceptance criteria review
6. **Staging** - Final pre-release validation in a staging environment
7. **Released** - Shipped to users
8. **Deprecated** - No longer supported or available

**Off-track flag** - If a case is blocked, delayed, or at risk, mark it Off-track using the flag in the case detail. This surfaces the case in the Leadership Insights aging tracker automatically. Add a PM note explaining the block and your plan to resolve it.

**Stale threshold** - The tool tracks how long a case has been in its current lifecycle stage. Cases that exceed the stale threshold (default: 7 days, configurable in Settings) surface automatically in the aging tracker. Review aged cases regularly. If a case has stalled, either move it forward or move it to On Hold with a documented reason.

---

## Access control

Cases can be marked restricted. When restricted:

- PMs and Leadership always see the full case
- BRs can see it if they are the original requestor (matched by name) or their email is on an explicit allowlist
- Everyone else sees a lock indicator in the list view - the case exists but its contents are gated

Use access control for cases involving sensitive decisions, budget discussions, or personnel-related requests.

---

## PM notes

PM notes are your internal working space on a case. They are not visible to Business Requestors. Use them to:

- Document open questions you are waiting to resolve
- Record context from conversations that did not happen in the tool
- Note dependencies on other cases or external decisions
- Set expectations for follow-up timing

PM notes are timestamped and attributed to your name. Write them as if someone else will read them - because they will.

---

## PDF export

You can export any view to PDF from the export button in the top navigation. Available exports:

- **Cases** - Current filtered view of the cases list
- **Roadmap** - Ranked roadmap with RICE scores
- **Lifecycle** - Current stage distribution across all roadmapped cases
- **Insights** - Leadership dashboard snapshot

Use exports for stakeholder reviews, leadership presentations, and sprint planning documentation.

---

## Settings reference

Settings are accessible from the top navigation. All changes require a reason and are logged.

**Roadmap threshold** - The minimum RICE score for roadmap candidacy. Default is 100. Adjust as your team's Reach unit, Effort sizing, and capacity evolve. There are no per-dimension RICE weight settings - the canonical Intercom scales are fixed, which is what keeps scores comparable across cases.

**Stale threshold** - The number of days a case can remain in a lifecycle stage before it is flagged as aging. Default is 7 days. Adjust based on your team's typical cycle time per stage.

**Seed data reload** - Reload the six default seed cases. Use this to reset the tool for a demo or workshop. Warning: this overwrites any cases currently in the system.

**Clear all data** - Wipes the entire system. Irreversible. Use only when decommissioning the tool or starting a fresh implementation for a new team.

---

## Auditability

Every case maintains two parallel records that together form a complete audit trail.

**Activity log** - A chronological list of every action taken on the case. Action types include: Case Created, Status Changed, Lifecycle Status Changed, RICE Scored, RICE Updated, Field Edited, Roadmap Reordered, RICE Config Changed, and more. Each entry shows the actor name, timestamp, action type, and the reason provided.

**Revision history** - Field-level before/after diffs on every change. If a RICE score changed, you can see the exact previous and new values. If a status changed, you can see the previous status, the new status, the reason, and who made the change.

All mutations in the system go through two enforced functions at the application level - `appendActivity` and `appendRevision` - meaning nothing can be changed silently.

---

## Common scenarios

**A BR is asking why their request has not moved**

Open their case. Check the activity log for the last action and the PM note for any documented reasoning. Update the PM note with a current status and timeline expectation. If the case has genuinely stalled, move it to On Hold with a reason rather than leaving it in Under Review indefinitely.

**A high-scoring case needs to be declined for strategic reasons**

Score it fully so the RICE score is on record. Then decline it with a detailed reason that explains the strategic context. This protects you and the product team when the request resurfaces.

**Two cases are essentially the same request from different BRs**

Document the duplication in both case PM notes. Decline the lower-priority duplicate with a reason that references the case number of the one you are keeping. Keep both in the system - do not delete either.

**A roadmapped case has been blocked for weeks**

Mark it Off-track. Move it to On Hold if the block is indefinite. Update the reason with the specific blocker and an expected resolution date. Leadership will see the aging signal in Insights - a PM note with context is better than an unexplained flag.

---

*Roadmapping Tool · built by Galaxy Pham.*
