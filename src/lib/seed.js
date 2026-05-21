// Seed data for the Roadmapping Tool Template demo.
//
// The implied company is a generic, mid-size B2B SaaS organization — no
// company name is used so the template can be dropped into any product
// org as a starting point. Six realistic-but-fictional cases span every
// pipeline stage and request type, with full submission, RICE scores,
// PM notes, activity log, revision history, and linked documents.
//
// Customize freely — anything you put here will appear the first time
// the app loads (or whenever the user clicks "Reload seed data" from
// Settings).

import {
  ACTION_TYPE,
  DEFAULT_RICE_CONFIG,
  LIFECYCLE_STATUS,
  PIPELINE_STATUS,
  PRIORITY,
  REQUEST_TYPE,
} from "./constants.js";
import { calculateRice } from "./rice.js";
import { buildCaseNumber } from "./format.js";

const IDS = {
  CASE_1: "11111111-1111-4111-8111-111111111111",
  CASE_2: "22222222-2222-4222-8222-222222222222",
  CASE_3: "33333333-3333-4333-8333-333333333333",
  CASE_4: "44444444-4444-4444-8444-444444444444",
  CASE_5: "55555555-5555-4555-8555-555555555555",
  CASE_6: "66666666-6666-4666-8666-666666666666",
};

function makeCase(overrides) {
  const now = new Date().toISOString();
  return {
    id: overrides.id,
    case_number: buildCaseNumber(overrides.counter, overrides.ps_name),
    ps_name: overrides.ps_name,
    request_type: overrides.request_type,
    priority: overrides.priority,
    pipeline_status: overrides.pipeline_status,
    lifecycle_status: overrides.lifecycle_status ?? null,
    status_changed_at: overrides.status_changed_at ?? now,
    requestor_name: overrides.requestor_name,
    requestor_email: overrides.requestor_email,
    team: overrides.team,
    problem_description: overrides.problem_description,
    current_solution: overrides.current_solution,
    proposed_fix: overrides.proposed_fix,
    roi_reasoning: overrides.roi_reasoning,
    documents: overrides.documents ?? [],
    rice: overrides.rice ?? {
      reach: null,
      impact: null,
      confidence: null,
      effort: null,
      weighted_total: null,
      scored_by: null,
      scored_at: null,
    },
    roadmap_rank: overrides.roadmap_rank ?? null,
    related_cases: overrides.related_cases ?? [],
    restricted: overrides.restricted ?? false,
    allowed_emails: overrides.allowed_emails ?? [],
    pm_notes: overrides.pm_notes ?? [],
    activity_log: overrides.activity_log ?? [],
    revision_history: overrides.revision_history ?? [],
    created_at: overrides.created_at ?? now,
    updated_at: overrides.updated_at ?? now,
  };
}

function riceWith(scores, scoredBy, scoredAt) {
  return {
    ...scores,
    scored_by: scoredBy,
    scored_at: scoredAt,
    weighted_total: calculateRice(scores, DEFAULT_RICE_CONFIG),
  };
}

export function buildSeedData() {
  const cases = [
    // -------------------------------------------------------------------
    // 1) Bug Report, Critical priority, sitting in New, brand new.
    // -------------------------------------------------------------------
    makeCase({
      id: IDS.CASE_1,
      counter: 1,
      ps_name: "Weekly Digest Emails Landing in Spam",
      request_type: REQUEST_TYPE.BUG,
      priority: PRIORITY.P3,
      pipeline_status: PIPELINE_STATUS.INITIATED,
      lifecycle_status: null,
      status_changed_at: "2026-05-12T15:04:00Z",
      created_at: "2026-05-12T15:04:00Z",
      updated_at: "2026-05-13T09:22:00Z",
      requestor_name: "Maya Lin",
      requestor_email: "maya.lin@example.com",
      team: "Customer Experience",
      problem_description:
        "Our weekly product-update digest emails are landing in Gmail's spam folder for a growing share of customer admins. 14 customers wrote in this week thinking the product was offline because they hadn't seen any communication from us. Engagement on the digest has dropped 38% week over week.",
      current_solution:
        "Support is replying to each ticket with a 'check your spam folder' note and asking customers to mark us as Not Spam. It's slow, it makes us look broken, and it doesn't address the underlying deliverability problem.",
      proposed_fix:
        "Investigate sender reputation and SPF/DKIM/DMARC alignment, which we suspect broke after last week's transactional email provider migration. Add a deliverability monitor so we hear about issues like this before customers do.",
      roi_reasoning:
        "Estimated 4,200 customer admins currently affected. Each missed digest correlates with a measurable drop in weekly active usage. Every additional day this lingers is roughly $1.8k in CSM hours fielding 'is the product down?' tickets, plus a meaningful trust hit with admin-tier users we work hardest to retain.",
      documents: [
        {
          id: "doc-1a",
          name: "Email provider deliverability dashboard",
          url: "https://example.com/email/deliverability",
          added_by: "Maya Lin",
          added_at: "2026-05-12T15:05:00Z",
        },
        {
          id: "doc-1b",
          name: "Customer ticket digest",
          url: "https://example.com/support/views/spam-folder",
          added_by: "Maya Lin",
          added_at: "2026-05-12T15:06:00Z",
        },
      ],
      activity_log: [
        {
          id: "log-1a",
          action_type: ACTION_TYPE.CASE_CREATED,
          action_detail: "Case created via new submission",
          reason: "",
          performed_by: "Maya Lin",
          created_at: "2026-05-12T15:04:00Z",
        },
      ],
    }),

    // -------------------------------------------------------------------
    // 2) Tooling Enhancement, P2 High, Under Review, RICE scored.
    // -------------------------------------------------------------------
    makeCase({
      id: IDS.CASE_2,
      counter: 2,
      ps_name: "Delegate Mode for In-App Notifications During PTO",
      request_type: REQUEST_TYPE.TOOLING,
      priority: PRIORITY.P2,
      pipeline_status: PIPELINE_STATUS.SUBMITTED,
      lifecycle_status: null,
      status_changed_at: "2026-04-28T14:00:00Z",
      created_at: "2026-04-20T10:00:00Z",
      updated_at: "2026-05-01T12:30:00Z",
      requestor_name: "Jordan Castillo",
      requestor_email: "jordan.castillo@example.com",
      team: "Customer Success",
      problem_description:
        "When CSMs go on PTO, in-app notifications about renewals, support escalations, and at-risk accounts pile up unread for days. By the time the CSM is back, things have escalated. We want a one-click 'I'm out, route to my delegate' toggle with a date range.",
      current_solution:
        "CSMs send a manual Slack message to their backup before vacation. The backup tries to remember to check both inboxes. Things still slip — we missed two renewal touchpoints last quarter that traced back to PTO coverage gaps.",
      proposed_fix:
        "Add a Delegate Mode toggle on the CSM profile with a date range and a delegate user picker. While active, in-app notifications and email alerts are routed to the delegate with a clear 'Covering for Jordan until May 30' framing.",
      roi_reasoning:
        "Reduces missed-touchpoint risk during the May–September travel window, which overlaps with our highest renewal volume. Conservative estimate: 15% drop in PTO-related escalations and at least one rescued renewal per quarter. Bonus: removes a recurring source of CSM anxiety on the way out the door.",
      documents: [
        {
          id: "doc-2a",
          name: "Delegate mode mockup",
          url: "https://example.com/figma/delegate-mode",
          added_by: "Jordan Castillo",
          added_at: "2026-04-20T10:15:00Z",
        },
      ],
      rice: riceWith(
        // ~800 CSMs affected per quarter, Medium impact, 80% confidence,
        // ~2 person-months to ship the toggle + delegate routing.
        // Score = 800 × 1 × 0.8 / 2 = 320.
        { reach: 800, impact: 1, confidence: 0.8, effort: 2 },
        "Avery Chen",
        "2026-04-29T16:10:00Z",
      ),
      activity_log: [
        {
          id: "log-2a",
          action_type: ACTION_TYPE.CASE_CREATED,
          action_detail: "Case created via new submission",
          reason: "",
          performed_by: "Jordan Castillo",
          created_at: "2026-04-20T10:00:00Z",
        },
        {
          id: "log-2b",
          action_type: ACTION_TYPE.STATUS_CHANGED,
          action_detail: "Status changed: New -> Under Review (RICE submitted)",
          reason: "Clear scope, well-supported ROI, low effort. Ready for leadership review.",
          performed_by: "Avery Chen",
          created_at: "2026-04-28T14:00:00Z",
        },
        {
          id: "log-2c",
          action_type: ACTION_TYPE.RICE_SCORED,
          action_detail:
            "RICE scored: Reach 800, Impact Medium (1×), Confidence 80%, Effort 2 person-months (Score: 320)",
          reason: "First pass score. Effort estimate from the frontend team after a 30 min spike.",
          performed_by: "Avery Chen",
          created_at: "2026-04-29T16:10:00Z",
        },
      ],
      pm_notes: [
        {
          id: "note-2a",
          content:
            "Tightly scoped, ships in under a sprint. Pair the launch with a CS enablement note so CSMs actually adopt it before peak PTO season.",
          written_by: "Avery Chen",
          created_at: "2026-04-29T16:14:00Z",
        },
      ],
      revision_history: [],
    }),

    // -------------------------------------------------------------------
    // 3) Tooling Enhancement, P1 Normal, Roadmapped, in Design.
    // -------------------------------------------------------------------
    makeCase({
      id: IDS.CASE_3,
      counter: 3,
      ps_name: "Analytics Dashboard CSV Export",
      request_type: REQUEST_TYPE.TOOLING,
      priority: PRIORITY.P1,
      pipeline_status: PIPELINE_STATUS.ROADMAPPED,
      lifecycle_status: LIFECYCLE_STATUS.DESIGN,
      status_changed_at: "2026-05-02T11:00:00Z",
      created_at: "2026-03-15T09:30:00Z",
      updated_at: "2026-05-10T17:45:00Z",
      requestor_name: "Devon Park",
      requestor_email: "devon.park@example.com",
      team: "Revenue Operations",
      problem_description:
        "The customer analytics dashboard shows usage and engagement metrics beautifully on screen, but there's no way to export the underlying data. Every QBR cycle, RevOps screenshots tables, retypes numbers into spreadsheets, and hopes nobody fat-fingers an account name.",
      current_solution:
        "Screenshot plus retype workflow. Roughly six hours per analyst per month. We've caught at least two QBR data errors this quarter that traced back to typos during this process.",
      proposed_fix:
        "Add an Export to CSV button on the analytics dashboard that respects the current filters, segments, and date range. Bonus points for an Export to XLSX option that preserves number formatting.",
      roi_reasoning:
        "Saves about 24 hours/month of analyst time across RevOps. Eliminates the manual transcription that has caused real QBR pain. Pays for itself within the first month and unblocks downstream work (see case 005).",
      documents: [
        {
          id: "doc-3a",
          name: "Analytics dashboard export mockup",
          url: "https://example.com/figma/analytics-export",
          added_by: "Devon Park",
          added_at: "2026-03-16T08:00:00Z",
        },
        {
          id: "doc-3b",
          name: "QBR data quality incident report Q1",
          url: "https://example.com/docs/qbr-data-quality-q1",
          added_by: "Devon Park",
          added_at: "2026-03-16T08:05:00Z",
        },
      ],
      rice: riceWith(
        // ~1,200 analysts + downstream stakeholders run QBR pulls each quarter.
        // High impact (kills the typo-driven QBR errors), 80% confidence,
        // 3 person-months of work to ship filter-faithful CSV + XLSX.
        // Score = 1200 × 2 × 0.8 / 3 = 640.
        { reach: 1200, impact: 2, confidence: 0.8, effort: 3 },
        "Morgan Reyes",
        "2026-04-02T11:20:00Z",
      ),
      activity_log: [
        {
          id: "log-3a",
          action_type: ACTION_TYPE.CASE_CREATED,
          action_detail: "Case created via new submission",
          reason: "",
          performed_by: "Devon Park",
          created_at: "2026-03-15T09:30:00Z",
        },
        {
          id: "log-3b",
          action_type: ACTION_TYPE.STATUS_CHANGED,
          action_detail: "Status changed: New -> Under Review (RICE submitted)",
          reason: "Strong, well-documented ROI. Easy yes if effort holds.",
          performed_by: "Morgan Reyes",
          created_at: "2026-03-25T10:00:00Z",
        },
        {
          id: "log-3c",
          action_type: ACTION_TYPE.RICE_SCORED,
          action_detail:
            "RICE scored: Reach 1,200, Impact High (2×), Confidence 80%, Effort 3 person-months (Score: 640)",
          reason: "Reach is high (every RevOps analyst), impact is high (QBR cycle pain), effort is real because of filter parity.",
          performed_by: "Morgan Reyes",
          created_at: "2026-04-02T11:20:00Z",
        },
        {
          id: "log-3d",
          action_type: ACTION_TYPE.STATUS_CHANGED,
          action_detail: "Status changed: Under Review -> Roadmapped",
          reason: "Approved in Q2 planning. Pairs naturally with the customer usage timeline work (case 005).",
          performed_by: "Morgan Reyes",
          created_at: "2026-05-02T11:00:00Z",
        },
        {
          id: "log-3e",
          action_type: ACTION_TYPE.LIFECYCLE_CHANGED,
          action_detail: "Lifecycle status changed: Discovery -> Definition",
          reason: "Scope locked: CSV in v1, XLSX in fast-follow.",
          performed_by: "Morgan Reyes",
          created_at: "2026-05-05T14:30:00Z",
        },
        {
          id: "log-3f",
          action_type: ACTION_TYPE.LIFECYCLE_CHANGED,
          action_detail: "Lifecycle status changed: Definition -> Design",
          reason: "Design kickoff with the RevOps team.",
          performed_by: "Morgan Reyes",
          created_at: "2026-05-10T17:45:00Z",
        },
      ],
      pm_notes: [
        {
          id: "note-3a",
          content:
            "Unblocks case 005 (customer usage timeline). Ship the export query first so we are not building the same surface twice.",
          written_by: "Morgan Reyes",
          created_at: "2026-05-02T11:05:00Z",
        },
      ],
      revision_history: [
        {
          id: "rev-3a",
          field_name: "Problem Description",
          old_value:
            "RevOps team needs to export the analytics dashboard.",
          new_value:
            "The customer analytics dashboard shows usage and engagement metrics beautifully on screen, but there's no way to export the underlying data. Every QBR cycle, RevOps screenshots tables, retypes numbers into spreadsheets, and hopes nobody fat-fingers an account name.",
          reason: "Devon added the specifics about the screenshot workflow and the QBR impact.",
          changed_by: "Morgan Reyes",
          created_at: "2026-03-22T09:00:00Z",
        },
      ],
    }),

    // -------------------------------------------------------------------
    // 4) New Build, P2 High, Roadmapped, in Development. Restricted.
    // -------------------------------------------------------------------
    makeCase({
      id: IDS.CASE_4,
      counter: 4,
      ps_name: "Internal Employee Wellness Perks Portal",
      request_type: REQUEST_TYPE.NEW_BUILD,
      priority: PRIORITY.P2,
      pipeline_status: PIPELINE_STATUS.ROADMAPPED,
      lifecycle_status: LIFECYCLE_STATUS.DEVELOPMENT,
      status_changed_at: "2026-04-10T13:00:00Z",
      created_at: "2026-02-04T10:00:00Z",
      updated_at: "2026-05-13T11:00:00Z",
      requestor_name: "Riley Tran",
      requestor_email: "riley.tran@example.com",
      team: "People Operations",
      problem_description:
        "Wellness benefits — mental health stipend, fitness reimbursement, learning budget, home office stipend — are tracked across four different spreadsheets that nobody trusts. Employees email People Ops to ask 'do I still have learning budget left?' and we genuinely have to go check. We want a single internal portal that integrates with HRIS so eligibility and usage are automatic and visible.",
      current_solution:
        "Four separate spreadsheets, two Slack channels, and a shared inbox. People Ops spends roughly 12 hours/month answering 'what's my balance?' questions. Reimbursements get duplicated when employees forget they already used a stipend.",
      proposed_fix:
        "Build an internal Wellness Perks portal where each employee sees their eligibility, balance, and usage history per perk. Integrate with HRIS so new hires and role changes automatically reflect. Submit-and-approve workflow replaces the current shared inbox.",
      roi_reasoning:
        "Hard ROI: ~12 People Ops hours/month recaptured, plus elimination of duplicate-reimbursement leakage (estimated $4–6k/year). Soft ROI is the bigger win — visible, well-utilized benefits drive measurable retention impact in our retention surveys, and these perks were the second-most-cited reason candidates accepted offers last year.",
      restricted: true,
      allowed_emails: ["benefits-lead@example.com", "people-vp@example.com"],
      documents: [
        {
          id: "doc-4a",
          name: "People Ops wellness perks brief",
          url: "https://example.com/docs/wellness-perks-brief",
          added_by: "Riley Tran",
          added_at: "2026-02-04T10:10:00Z",
        },
        {
          id: "doc-4b",
          name: "Wellness portal v1 scope",
          url: "https://example.com/docs/wellness-portal-scope",
          added_by: "Avery Chen",
          added_at: "2026-03-12T09:30:00Z",
        },
      ],
      rice: riceWith(
        // ~450 employees affected (full company). High impact on a retention
        // lever, 50% confidence because HRIS integration scope still squishy,
        // ~5 person-months across eng + people-ops.
        // Score = 450 × 2 × 0.5 / 5 = 90.
        { reach: 450, impact: 2, confidence: 0.5, effort: 5 },
        "Avery Chen",
        "2026-03-20T14:00:00Z",
      ),
      activity_log: [
        {
          id: "log-4a",
          action_type: ACTION_TYPE.CASE_CREATED,
          action_detail: "Case created via new submission",
          reason: "",
          performed_by: "Riley Tran",
          created_at: "2026-02-04T10:00:00Z",
        },
        {
          id: "log-4b",
          action_type: ACTION_TYPE.RESTRICTED,
          action_detail: "Case marked restricted",
          reason: "Integrates with HR records. Limiting to People Ops leadership during scoping.",
          performed_by: "Avery Chen",
          created_at: "2026-02-06T15:30:00Z",
        },
        {
          id: "log-4c",
          action_type: ACTION_TYPE.EMAIL_ADDED,
          action_detail: "Access email added: benefits-lead@example.com",
          reason: "Benefits lead owns the HRIS integration.",
          performed_by: "Avery Chen",
          created_at: "2026-02-06T15:31:00Z",
        },
        {
          id: "log-4d",
          action_type: ACTION_TYPE.EMAIL_ADDED,
          action_detail: "Access email added: people-vp@example.com",
          reason: "People VP is the exec sponsor.",
          performed_by: "Avery Chen",
          created_at: "2026-02-06T15:32:00Z",
        },
        {
          id: "log-4e",
          action_type: ACTION_TYPE.STATUS_CHANGED,
          action_detail: "Status changed: Under Review -> Roadmapped",
          reason: "Approved as a Q2 People Ops commitment.",
          performed_by: "Avery Chen",
          created_at: "2026-04-10T13:00:00Z",
        },
        {
          id: "log-4f",
          action_type: ACTION_TYPE.LIFECYCLE_CHANGED,
          action_detail: "Lifecycle status changed: Definition -> Design",
          reason: "Design partner kickoff complete.",
          performed_by: "Avery Chen",
          created_at: "2026-04-22T10:00:00Z",
        },
        {
          id: "log-4g",
          action_type: ACTION_TYPE.LIFECYCLE_CHANGED,
          action_detail: "Lifecycle status changed: Design -> Development",
          reason: "Engineering picked up the HRIS integration work.",
          performed_by: "Avery Chen",
          created_at: "2026-05-13T11:00:00Z",
        },
      ],
      pm_notes: [
        {
          id: "note-4a",
          content:
            "Internal comms is preparing a launch FAQ and a Loom from the People VP. Holding the company-wide announcement until the HRIS sync has run cleanly for two weeks.",
          written_by: "Avery Chen",
          created_at: "2026-04-15T09:00:00Z",
        },
      ],
    }),

    // -------------------------------------------------------------------
    // 5) Tooling Enhancement, P2 High, On Hold. Depends on case 003.
    // -------------------------------------------------------------------
    makeCase({
      id: IDS.CASE_5,
      counter: 5,
      ps_name: "Customer Usage Timeline View",
      request_type: REQUEST_TYPE.TOOLING,
      priority: PRIORITY.P2,
      pipeline_status: PIPELINE_STATUS.ON_HOLD,
      lifecycle_status: null,
      status_changed_at: "2026-04-18T16:00:00Z",
      created_at: "2026-03-30T11:00:00Z",
      updated_at: "2026-04-18T16:00:00Z",
      requestor_name: "Sam Okafor",
      requestor_email: "sam.okafor@example.com",
      team: "Marketing",
      problem_description:
        "At renewal time, CSMs love sending customers a 'here's a year of value you got from us' recap — features adopted, usage growth, milestones hit. It works, but it takes hours of manual data pulling per account. We want a customer-facing usage timeline view that surfaces this story automatically and embeds in renewal emails.",
      current_solution:
        "CSMs manually query the data warehouse, copy numbers into a templated slide deck, and attach it to renewal emails. Roughly 90 minutes per account, so we only do it for top-tier customers.",
      proposed_fix:
        "Build a Usage Timeline view in the customer portal that uses existing usage data to render a chronological story (features first used, milestone events, integrations added). Surfaces in-product, in renewal emails, and (with opt-in) in customer-facing case studies.",
      roi_reasoning:
        "Three-pronged: (1) renewal email engagement is projected to lift 22% based on the visual hook; (2) every account gets the recap, not just top-tier — expected to lift renewal rate in the mid-market segment; (3) the underlying data is already what we use for retention modeling, so the surface is largely a presentation layer.",
      documents: [
        {
          id: "doc-5a",
          name: "Concept board: usage timeline UI",
          url: "https://example.com/figma/usage-timeline-concepts",
          added_by: "Sam Okafor",
          added_at: "2026-03-30T11:10:00Z",
        },
      ],
      rice: riceWith(
        // ~2,500 customer accounts hit per renewal cycle. High impact on
        // renewal email engagement, 50% confidence (uplift model is
        // directional), 6 person-months for the new product surface.
        // Score = 2500 × 2 × 0.5 / 6 ≈ 416.67.
        { reach: 2500, impact: 2, confidence: 0.5, effort: 6 },
        "Morgan Reyes",
        "2026-04-10T10:00:00Z",
      ),
      related_cases: [
        {
          ps_id: IDS.CASE_3,
          context_note:
            "Case 005 reuses the per-account usage query that case 003 (Analytics Dashboard CSV Export) is hardening. We should ship that work first so we are not maintaining two paths into the same data.",
          added_by: "Morgan Reyes",
          added_at: "2026-04-12T09:30:00Z",
        },
      ],
      activity_log: [
        {
          id: "log-5a",
          action_type: ACTION_TYPE.CASE_CREATED,
          action_detail: "Case created via new submission",
          reason: "",
          performed_by: "Sam Okafor",
          created_at: "2026-03-30T11:00:00Z",
        },
        {
          id: "log-5b",
          action_type: ACTION_TYPE.RICE_SCORED,
          action_detail:
            "RICE scored: Reach 2,500, Impact High (2×), Confidence 50%, Effort 6 person-months (Score: 416.67)",
          reason: "Initial scoring. Effort is high because the timeline view is essentially a new product surface.",
          performed_by: "Morgan Reyes",
          created_at: "2026-04-10T10:00:00Z",
        },
        {
          id: "log-5c",
          action_type: ACTION_TYPE.RELATED_ADDED,
          action_detail: "Related case added: 003 | Analytics Dashboard CSV Export",
          reason: "Sequencing dependency on the shared usage query work.",
          performed_by: "Morgan Reyes",
          created_at: "2026-04-12T09:30:00Z",
        },
        {
          id: "log-5d",
          action_type: ACTION_TYPE.STATUS_CHANGED,
          action_detail: "Status changed: Under Review -> On Hold",
          reason:
            "Paused until case 003 ships. Will reopen the moment we have the export query in production so we can reuse it.",
          performed_by: "Morgan Reyes",
          created_at: "2026-04-18T16:00:00Z",
        },
      ],
    }),

    // -------------------------------------------------------------------
    // 6) New Build, Critical priority, Declined.
    // -------------------------------------------------------------------
    makeCase({
      id: IDS.CASE_6,
      counter: 6,
      ps_name: "Internal Photo-First Team Chat App",
      request_type: REQUEST_TYPE.NEW_BUILD,
      priority: PRIORITY.P3,
      pipeline_status: PIPELINE_STATUS.DECLINED,
      lifecycle_status: null,
      status_changed_at: "2026-04-25T15:30:00Z",
      created_at: "2026-04-01T13:00:00Z",
      updated_at: "2026-04-25T15:30:00Z",
      requestor_name: "Toby Williams",
      requestor_email: "toby.williams@example.com",
      team: "Implementation",
      problem_description:
        "The implementation team wants a dedicated photo-first internal chat app for sharing client site visit photos, install configurations, and troubleshooting tips. Slack feels too formal and the photos get buried under operational threads. We should build our own.",
      current_solution:
        "A pinned #install-pics channel in Slack that everyone agrees they love. Engagement is high. Nobody complains about Slack specifically — they just want something more team-branded.",
      proposed_fix:
        "Build a small mobile-first chat app with photo-first feeds, install-site tagging, and structured troubleshooting threads. Roll out to the implementation team first, then optionally expand to support and field engineering.",
      roi_reasoning:
        "Better team engagement, more knowledge sharing across implementations, faster troubleshooting because past install photos are easier to find. (Acknowledged: hard to quantify, and Slack already does most of this.)",
      documents: [],
      activity_log: [
        {
          id: "log-6a",
          action_type: ACTION_TYPE.CASE_CREATED,
          action_detail: "Case created via new submission",
          reason: "",
          performed_by: "Toby Williams",
          created_at: "2026-04-01T13:00:00Z",
        },
        {
          id: "log-6b",
          action_type: ACTION_TYPE.STATUS_CHANGED,
          action_detail: "Status changed: Under Review -> Declined",
          reason:
            "Slack already does this and the team agrees engagement is great there. Estimated build-and-maintain cost is roughly two years of Slack Pro for the whole company. Proposed alternative: invest 20% of that budget in a custom Slack bot for photo-of-the-week voting and structured troubleshooting tags, and treat that as the v1.",
          performed_by: "Avery Chen",
          created_at: "2026-04-25T15:30:00Z",
        },
      ],
    }),
  ];

  const counter = 6;

  return { cases, counter };
}
