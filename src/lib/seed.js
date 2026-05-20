// Seed data for the Roadmapping Tool Template demo.
//
// The fictional company is Sprout & Stem — a small chain of indoor-plant
// shops with a monthly subscription box, a wholesale arm, and a customer
// loyalty app. Six realistic-but-fictional cases across every pipeline
// stage and request type, with full submission, RICE scores, PM notes,
// activity log, revision history, and linked documents.
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
      ps_name: "Care Reminder Emails Landing in Spam",
      request_type: REQUEST_TYPE.BUG,
      priority: PRIORITY.P3,
      pipeline_status: PIPELINE_STATUS.INITIATED,
      lifecycle_status: null,
      status_changed_at: "2026-05-12T15:04:00Z",
      created_at: "2026-05-12T15:04:00Z",
      updated_at: "2026-05-13T09:22:00Z",
      requestor_name: "Maya Lin",
      requestor_email: "maya.lin@sproutandstem.example",
      team: "Customer Experience",
      problem_description:
        "Our weekly plant-care reminder emails are landing in Gmail's spam folder for a growing share of subscribers. 14 customers wrote in this week thinking we ghosted them. Their fiddle leaf figs did not appreciate the silent treatment.",
      current_solution:
        "CX is replying to each ticket with a 'check your spam folder' note and asking customers to mark us as Not Spam. Slow, embarrassing, and the plants keep dying in the meantime.",
      proposed_fix:
        "Investigate sender reputation, fix the SPF/DKIM/DMARC alignment that we suspect broke after last week's transactional email provider migration. Add a deliverability monitor so we hear about this before customers do.",
      roi_reasoning:
        "Estimated 4,200 subscribers currently affected. Each missed care reminder correlates with a 12% bump in 'my plant died, can I get a refund' tickets. Every additional day this lingers is roughly $1.8k in replacement plants plus a meaningful brand hit during peak houseplant season.",
      documents: [
        {
          id: "doc-1a",
          name: "Postmark deliverability dashboard",
          url: "https://example.com/postmark/deliverability/sprout",
          added_by: "Maya Lin",
          added_at: "2026-05-12T15:05:00Z",
        },
        {
          id: "doc-1b",
          name: "Customer ticket digest",
          url: "https://example.com/zendesk/views/spam-folder",
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
      ps_name: "Vacation Mode for Plant Care Reminders",
      request_type: REQUEST_TYPE.TOOLING,
      priority: PRIORITY.P2,
      pipeline_status: PIPELINE_STATUS.SUBMITTED,
      lifecycle_status: null,
      status_changed_at: "2026-04-28T14:00:00Z",
      created_at: "2026-04-20T10:00:00Z",
      updated_at: "2026-05-01T12:30:00Z",
      requestor_name: "Jordan Castillo",
      requestor_email: "jordan.castillo@sproutandstem.example",
      team: "Customer Success",
      problem_description:
        "When customers travel, their plants get neglected and our care reminders do nothing but make them feel guilty from a beach somewhere. We want a one-click 'I am away, please bother my plant sitter instead' toggle that temporarily routes reminders to a designated friend.",
      current_solution:
        "Customers either ignore the emails entirely (plants die) or unsubscribe before vacation and forget to re-subscribe (plants die slower, but still die). CX manually re-enables accounts after vacation about 30 times a month.",
      proposed_fix:
        "Add a Vacation Mode toggle on the account page with a date range and an optional plant-sitter email. While active, care reminders are sent to the sitter with a friendly 'Jordan trusts you with their monstera, do not let them down' framing.",
      roi_reasoning:
        "Reduces plant death rate during the May to September travel window, which is also our highest replacement-claim period. Conservative estimate: 18% drop in vacation-related refund requests, roughly $9k/quarter saved. Bonus: a delightful feature that markets itself on social.",
      documents: [
        {
          id: "doc-2a",
          name: "Vacation mode mockup",
          url: "https://example.com/figma/vacation-mode",
          added_by: "Jordan Castillo",
          added_at: "2026-04-20T10:15:00Z",
        },
      ],
      rice: riceWith(
        { reach: 3, impact: 3, confidence: 4, effort: 2 },
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
          reason: "Lovely scope, clear ROI, low effort. Ready for leadership review.",
          performed_by: "Avery Chen",
          created_at: "2026-04-28T14:00:00Z",
        },
        {
          id: "log-2c",
          action_type: ACTION_TYPE.RICE_SCORED,
          action_detail: "RICE scored: Reach 3, Impact 3, Confidence 4, Effort 2 (Total: 12)",
          reason: "First pass score. Effort estimate from the frontend team after a 30 min spike.",
          performed_by: "Avery Chen",
          created_at: "2026-04-29T16:10:00Z",
        },
      ],
      pm_notes: [
        {
          id: "note-2a",
          content:
            "Charming feature, ships in under a sprint. Pair the launch with a 'tell your plants you are sorry' email campaign and we can probably win back a few churned subscribers.",
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
      ps_name: "Wholesale Dashboard CSV Export",
      request_type: REQUEST_TYPE.TOOLING,
      priority: PRIORITY.P1,
      pipeline_status: PIPELINE_STATUS.ROADMAPPED,
      lifecycle_status: LIFECYCLE_STATUS.DESIGN,
      status_changed_at: "2026-05-02T11:00:00Z",
      created_at: "2026-03-15T09:30:00Z",
      updated_at: "2026-05-10T17:45:00Z",
      requestor_name: "Devon Park",
      requestor_email: "devon.park@sproutandstem.example",
      team: "Wholesale Operations",
      problem_description:
        "The wholesale dashboard shows monthly orders by buyer beautifully on screen, but we cannot export the data. Every month, the wholesale team manually screenshots tables, types numbers into a spreadsheet, and hopes nobody fat-fingers a SKU.",
      current_solution:
        "Screenshot plus retype workflow. Roughly six hours per analyst per month. We have caught at least two reconciliation errors this quarter that traced back to typos during this process. Plants are tracked. So are spelling mistakes.",
      proposed_fix:
        "Add an Export to CSV button on the wholesale dashboard that respects the current filters, sorts, and date range. Bonus points for an Export to XLSX option that preserves number formatting.",
      roi_reasoning:
        "Saves about 24 hours/month of analyst time across the wholesale team. Eliminates the manual transcription that has caused real reconciliation pain. Pays for itself within the first month.",
      documents: [
        {
          id: "doc-3a",
          name: "Wholesale dashboard mockup",
          url: "https://example.com/figma/wholesale-export",
          added_by: "Devon Park",
          added_at: "2026-03-16T08:00:00Z",
        },
        {
          id: "doc-3b",
          name: "Reconciliation incident report Q1",
          url: "https://example.com/docs/wholesale-recon-q1",
          added_by: "Devon Park",
          added_at: "2026-03-16T08:05:00Z",
        },
      ],
      rice: riceWith(
        { reach: 4, impact: 5, confidence: 4, effort: 4 },
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
          action_detail: "RICE scored: Reach 4, Impact 5, Confidence 4, Effort 4 (Total: 17)",
          reason: "Reach is high (every wholesale analyst), impact is high (close cycle pain), effort is real because of the date range filter parity.",
          performed_by: "Morgan Reyes",
          created_at: "2026-04-02T11:20:00Z",
        },
        {
          id: "log-3d",
          action_type: ACTION_TYPE.STATUS_CHANGED,
          action_detail: "Status changed: Under Review -> Roadmapped",
          reason: "Approved in Q2 planning. Pairs naturally with the plant lineage work (case 005).",
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
          reason: "Design kickoff with the wholesale team.",
          performed_by: "Morgan Reyes",
          created_at: "2026-05-10T17:45:00Z",
        },
      ],
      pm_notes: [
        {
          id: "note-3a",
          content:
            "Unblocks case 005 (plant lineage). Ship the export query first so we are not building the same surface twice.",
          written_by: "Morgan Reyes",
          created_at: "2026-05-02T11:05:00Z",
        },
      ],
      revision_history: [
        {
          id: "rev-3a",
          field_name: "Problem Description",
          old_value:
            "Wholesale team needs to export the dashboard.",
          new_value:
            "The wholesale dashboard shows monthly orders by buyer beautifully on screen, but we cannot export the data. Every month, the wholesale team manually screenshots tables, types numbers into a spreadsheet, and hopes nobody fat-fingers a SKU.",
          reason: "Devon added the specifics about screenshot workflow and the reconciliation impact.",
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
      ps_name: "Plant Adoption Board for Retired Shop Plants",
      request_type: REQUEST_TYPE.NEW_BUILD,
      priority: PRIORITY.P2,
      pipeline_status: PIPELINE_STATUS.ROADMAPPED,
      lifecycle_status: LIFECYCLE_STATUS.DEVELOPMENT,
      status_changed_at: "2026-04-10T13:00:00Z",
      created_at: "2026-02-04T10:00:00Z",
      updated_at: "2026-05-13T11:00:00Z",
      requestor_name: "Riley Tran",
      requestor_email: "riley.tran@sproutandstem.example",
      team: "People Operations",
      problem_description:
        "Every season we retire roughly 80 display plants from our shop windows. They are perfectly healthy, just no longer photogenic enough for the storefront. Today they go to compost or to whichever staff member happens to walk past on Tuesday. We want a fair, opt-in 'adopt a retired plant' board open to all employees as a wellness benefit.",
      current_solution:
        "Word of mouth in the staff Slack channel. The same three people get every plant. Other employees do not know retired plants exist until they see them being carried out the door.",
      proposed_fix:
        "Build an internal Plant Adoption board where store managers post retired plants with a photo and care notes. Employees opt in, request adoption, and the system runs a weekly fair-share lottery for popular plants. Integrate with the existing HR benefits dashboard so adoptions count toward the wellness perk.",
      roi_reasoning:
        "Hard ROI is modest (composting cost savings, maybe $400/quarter). The real win is a tangible perk that aligns with the brand and improves retention in retail roles where turnover runs 38%. Hiring tells us this is a benefit candidates remember.",
      restricted: true,
      allowed_emails: ["benefits-lead@sproutandstem.example", "people-vp@sproutandstem.example"],
      documents: [
        {
          id: "doc-4a",
          name: "People Ops wellness brief",
          url: "https://example.com/docs/wellness-perks-brief",
          added_by: "Riley Tran",
          added_at: "2026-02-04T10:10:00Z",
        },
        {
          id: "doc-4b",
          name: "Plant adoption v1 scope",
          url: "https://example.com/docs/plant-adoption-scope",
          added_by: "Avery Chen",
          added_at: "2026-03-12T09:30:00Z",
        },
      ],
      rice: riceWith(
        { reach: 3, impact: 4, confidence: 3, effort: 3 },
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
          reason: "Integrates with HR benefits records. Limiting to People Ops leadership during scoping.",
          performed_by: "Avery Chen",
          created_at: "2026-02-06T15:30:00Z",
        },
        {
          id: "log-4c",
          action_type: ACTION_TYPE.EMAIL_ADDED,
          action_detail: "Access email added: benefits-lead@sproutandstem.example",
          reason: "Benefits lead owns the wellness perk integration.",
          performed_by: "Avery Chen",
          created_at: "2026-02-06T15:31:00Z",
        },
        {
          id: "log-4d",
          action_type: ACTION_TYPE.EMAIL_ADDED,
          action_detail: "Access email added: people-vp@sproutandstem.example",
          reason: "People VP is the exec sponsor.",
          performed_by: "Avery Chen",
          created_at: "2026-02-06T15:32:00Z",
        },
        {
          id: "log-4e",
          action_type: ACTION_TYPE.STATUS_CHANGED,
          action_detail: "Status changed: Under Review -> Roadmapped",
          reason: "Approved as a Q2 wellness commitment.",
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
          reason: "Engineering picked up the lottery service.",
          performed_by: "Avery Chen",
          created_at: "2026-05-13T11:00:00Z",
        },
      ],
      pm_notes: [
        {
          id: "note-4a",
          content:
            "Brand team is preparing a launch story (with photos of staff plus adopted plants, obviously). Holding the marketing push until the lottery has run successfully for two weeks.",
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
      ps_name: "Customer Plant Lineage Tracker",
      request_type: REQUEST_TYPE.TOOLING,
      priority: PRIORITY.P2,
      pipeline_status: PIPELINE_STATUS.ON_HOLD,
      lifecycle_status: null,
      status_changed_at: "2026-04-18T16:00:00Z",
      created_at: "2026-03-30T11:00:00Z",
      updated_at: "2026-04-18T16:00:00Z",
      requestor_name: "Sam Okafor",
      requestor_email: "sam.okafor@sproutandstem.example",
      team: "Marketing",
      problem_description:
        "Long-time customers love sharing photos of plant babies propagated from plants they bought from us. We want to show each customer a family-tree view of their order history, including any propagated 'descendant' plants they have logged in their account. Equal parts useful and adorable.",
      current_solution:
        "Customers manually keep track in a Notes app or, in one beloved case, a hand-drawn paper journal. The marketing team has to scrape order history one customer at a time when we run our anniversary recap campaigns.",
      proposed_fix:
        "Build a Plant Lineage view in the customer account that uses order history plus user-logged propagations to render a small tree. Surfaces in account, in anniversary emails, and (with opt-in) on a shareable public profile for the plant-influencer crowd.",
      roi_reasoning:
        "Three-pronged: (1) anniversary email engagement is projected to lift 22% based on the visual hook; (2) shareable lineage trees double as organic marketing on Instagram; (3) the underlying data is already what we use for retention modeling.",
      documents: [
        {
          id: "doc-5a",
          name: "Concept board: plant lineage UI",
          url: "https://example.com/figma/plant-lineage-concepts",
          added_by: "Sam Okafor",
          added_at: "2026-03-30T11:10:00Z",
        },
      ],
      rice: riceWith(
        { reach: 3, impact: 4, confidence: 3, effort: 5 },
        "Morgan Reyes",
        "2026-04-10T10:00:00Z",
      ),
      related_cases: [
        {
          ps_id: IDS.CASE_3,
          context_note:
            "Case 005 reuses the per-customer order-history query that case 003 (Wholesale CSV Export) is hardening. We should ship that work first so we are not maintaining two paths into the same data.",
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
          action_detail: "RICE scored: Reach 3, Impact 4, Confidence 3, Effort 5 (Total: 15)",
          reason: "Initial scoring. Effort is high because the propagation logging UI is essentially a new product surface.",
          performed_by: "Morgan Reyes",
          created_at: "2026-04-10T10:00:00Z",
        },
        {
          id: "log-5c",
          action_type: ACTION_TYPE.RELATED_ADDED,
          action_detail: "Related case added: 003 | Wholesale Dashboard CSV Export",
          reason: "Sequencing dependency on the shared order-history query work.",
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
      ps_name: "Internal Plant Pic Chat App for Greenhouse Staff",
      request_type: REQUEST_TYPE.NEW_BUILD,
      priority: PRIORITY.P3,
      pipeline_status: PIPELINE_STATUS.DECLINED,
      lifecycle_status: null,
      status_changed_at: "2026-04-25T15:30:00Z",
      created_at: "2026-04-01T13:00:00Z",
      updated_at: "2026-04-25T15:30:00Z",
      requestor_name: "Toby Williams",
      requestor_email: "toby.williams@sproutandstem.example",
      team: "Greenhouse",
      problem_description:
        "Greenhouse staff want a dedicated internal chat app for sharing plant progress photos, propagation tips, and pest sightings. Slack feels too formal and the photos get buried under operational threads. We should build our own.",
      current_solution:
        "A pinned #plant-pics channel in Slack that everyone agrees they love. Engagement is high. Nobody complains about Slack specifically, they just want something more 'us'.",
      proposed_fix:
        "Build a small mobile-first chat app with photo-first feeds, plant tagging, and pest alerts. Roll out to greenhouse staff first, then optionally retail.",
      roi_reasoning:
        "Better staff engagement, more knowledge sharing across greenhouses, fewer pest outbreaks because of faster reporting. (Acknowledged: hard to quantify.)",
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
            "Slack already does this and the team agrees engagement is great there. Estimated build cost is roughly two years of Slack Pro for the whole company. Proposed alternative: invest 20% of that budget in a custom Slack bot for photo-of-the-week voting and pest-alert routing, and treat that as the v1.",
          performed_by: "Avery Chen",
          created_at: "2026-04-25T15:30:00Z",
        },
      ],
    }),
  ];

  const counter = 6;

  return { cases, counter };
}
