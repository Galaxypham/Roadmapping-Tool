# Roadmapping Tool · Full Reference Wiki

## Leadership edition

---

## Overview

As a Leadership viewer, the Roadmapping Tool gives you real-time visibility into the full product pipeline - what is queued, what is roadmapped, what is in flight, and what is stalled - without pulling a PM into a meeting to get the answer.

Your role is read-only. You do not triage, score, or manage cases. You observe, analyze, and make decisions based on what the data surfaces.

This guide covers every Insights metric, how to interpret what you see, and when to act on it.

---

## Getting started

When you open the tool, select **Leadership** from the role selector and enter your name. You will land on **On the Roadmap** by default - a live view of every committed item ranked by PM priority.

To access the full Insights dashboard, navigate to **Insights** from the top navigation.

---

## The roadmap view

Your default landing view is the ranked roadmap - every case the PM has committed to building, ordered from highest to lowest priority.

The case at the top is the next thing the team expects to begin. Use this view when preparing for planning sessions, capacity discussions, or executive reviews.

You cannot reorder the roadmap from the Leadership role. If you believe the ranking needs to change, bring that conversation to the PM with a reference to the specific case numbers involved.

Each case in the roadmap view shows its RICE score, current lifecycle stage, and Off-track flag if applicable.

---

## The Insights dashboard

Insights is a live snapshot of the full pipeline. Every metric is calculated from the current state of all cases in the system. There is no manual reporting step - what you see reflects what is actually in the tool right now.

Every number on the dashboard is drillable. Click any metric, count, or chart segment to see the underlying cases that produced it in a detail modal.

---

## Delivery scoreboard

The delivery scoreboard shows the count of cases in each pipeline status and lifecycle stage at the moment you are viewing it.

**What to look for**

A healthy pipeline has cases distributed across stages. If everything is concentrated in Discovery and Definition with nothing in Development or QA, that signals a bottleneck moving from planning to execution.

A large number of cases in QA relative to Development may signal a testing backlog. A growing count in Staging with nothing moving to Released may signal a release process bottleneck.

**How to drill down**

Click the count for any stage to see the specific cases in that stage, their RICE scores, and how long they have been there.

---

## Lifecycle funnel

The lifecycle funnel shows how cases flow from intake through release as a proportional view. It surfaces where cases drop off or stall between stages.

**What to look for**

A steep drop between Roadmapped and Discovery suggests cases are being committed but work is not beginning - a resourcing gap or roadmap inflation.

A steep drop between Development and QA suggests handoff friction between engineering and testing.

A steep drop between Staging and Released suggests release process friction - approval delays, deployment bottlenecks, or incomplete acceptance criteria.

**How to drill down**

Click any stage in the funnel to see the cases currently in that stage and those that have not yet progressed past it.

---

## Aging tracker

The aging tracker surfaces cases that have been in their current lifecycle stage longer than the configured stale threshold (default: 7 days). These are your at-risk items.

**What to look for**

Cases flagged Off-track by a PM will always appear here. But cases that have not been flagged and are still aging are equally important - they may represent invisible stalls that the PM has not yet escalated.

Any case that has been in Discovery or Definition for more than two threshold cycles without moving forward warrants a conversation. Any case in Development or QA for an extended period without progression warrants the same.

**How to drill down**

Click any aged case to open its detail modal. The PM note should explain why the case has not progressed. If it does not, that is a signal to follow up with the PM.

---

## Intake trends

The intake trends chart shows the volume of new requests submitted over time.

**What to look for**

A sudden spike in submissions from a specific team or region often signals an operational issue that has not been escalated through formal channels.

A consistent high volume of a specific request type - for example, Bug Reports - may signal a systemic product gap that individual requests are circling around.

Declining intake volume is worth monitoring. It can mean the product is meeting needs well. It can also mean requestors have stopped submitting because they do not believe the process works.

**How to drill down**

Click any data point to see the specific cases submitted in that period.

---

## Decision outcomes

The decision outcomes chart shows the distribution of final PM decisions: Roadmapped, On Hold, and Declined.

**What to look for**

A very high decline rate may indicate that incoming requests are not well-scoped, or that the roadmap threshold is set too high relative to the quality of submissions.

A very high roadmap rate with low release velocity may indicate roadmap inflation - more cases committed than the team can execute.

A growing On Hold count without movement over time suggests cases are being parked rather than decided. On Hold should be a temporary status with a documented revisit timeline, not a permanent holding area.

**How to drill down**

Click any segment to see the cases in that outcome, their RICE scores, and the reasons documented for each decision.

---

## Recent releases

The recent releases section shows cases that have moved to Released status in the current period.

**What to look for**

Use this to track delivery velocity - how many features or fixes are actually reaching users per cycle. Compare it against the roadmap size. If the roadmap has 30 committed cases and releases average two per month, you have a 15-month backlog at current velocity.

**How to drill down**

Click any released case to see its full history from submission through release, including the original RICE score, the submitting BR, and the total time from submission to release.

---

## Roadmap composition

The roadmap composition chart shows the distribution of roadmapped cases by type and RICE score range.

**What to look for**

A roadmap dominated by a single request type may indicate the product team is over-indexed on one area. Cases clustering at or just above the roadmap threshold may indicate the threshold needs recalibration.

**How to drill down**

Click any segment to see the specific roadmapped cases in that category with their full RICE breakdowns and current lifecycle stages.

---

## When to act on what you see

The Insights dashboard is designed to surface signals, not make decisions. Here is a framework for when to take action based on what you observe.

**Aging cases with no PM note explaining the stall** - Follow up with the PM. There should always be a documented reason for any case that has not progressed past the stale threshold.

**Off-track flags on roadmapped cases** - Review the PM note. If the block is external - a vendor delay, a dependency on another team, a resourcing gap - this is where leadership action creates the most value.

**Declining release velocity with a growing roadmap** - This is a capacity signal. The conversation to have is about team resources and roadmap scope, not individual case management.

**Spike in high-priority intake from one team or region** - Investigate whether a systemic issue is being expressed through individual requests. A pattern of submissions is often a better signal than any single escalation.

**High On Hold count with no movement for more than a quarter** - Review the On Hold cases and their PM notes. Cases that have been On Hold for more than one quarter without a documented revisit should either be reactivated or declined. An indefinitely growing On Hold list is a form of invisible backlog.

---

## PDF export

You can export the Insights dashboard to PDF from the export button in the top navigation. The export captures a snapshot of the dashboard at the time of export. Use it for board updates, leadership reviews, and quarterly planning documentation.

---

## Frequently asked questions

**Can I submit requests as Leadership?**

No. Leadership is a read-only role. If you have a product request, submit it as a Business Requestor. This keeps the intake process consistent and ensures your request is scored and tracked like all others.

**Can I see PM notes?**

Yes. Leadership has full visibility into PM notes on all cases.

**A case I expected to see on the roadmap is not there. Why?**

It may have been declined, put On Hold, or not yet triaged. The PM can locate it in All Cases using the case number or BR name.

**The data looks incorrect. How do I flag it?**

Contact the PM who owns the affected case and reference the case number. All data in the tool reflects what PMs have entered - corrections need to be made by the PM directly.

---

*Roadmapping Tool · built by Galaxy Pham.*
