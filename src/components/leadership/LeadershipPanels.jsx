import { Link } from "react-router-dom";
import {
  LIFECYCLE_STATUS_ORDER,
  PIPELINE_STATUS,
  REQUEST_TYPE_ORDER,
} from "../../lib/constants.js";
import {
  A11Y,
  CHART_TYPE_SEQUENCE,
  CRITICAL_SURFACE,
  PIPELINE_A11Y,
  REQUEST_TYPE_A11Y,
} from "../../lib/accessibleColors.js";
import { formatDate } from "../../lib/format.js";
import { PriorityBadge } from "../ui/Badge.jsx";

// --- Shared primitives ------------------------------------------------------

// Renders a small "Needs attention" flag next to the tile label so the
// signal is not carried by ring color alone (key for colorblind users).
function AttentionFlag() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 ring-1 ring-inset ring-amber-300"
      aria-label="Needs attention"
    >
      <svg
        className="h-3 w-3"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M8.485 2.495a1.75 1.75 0 013.03 0l6.28 10.875A1.75 1.75 0 0116.28 16H3.72a1.75 1.75 0 01-1.515-2.63L8.485 2.495zM10 7a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 7zm0 7.25a.95.95 0 100-1.9.95.95 0 000 1.9z"
          clipRule="evenodd"
        />
      </svg>
      Attention
    </span>
  );
}

function Tile({ label, value, hint, tone = "default", onClick, disabled }) {
  const toneClasses = {
    default: "bg-white",
    accent: "bg-accent-50",
    warn: "ring-1 ring-amber-300 bg-amber-50/50",
    crit: "ring-1 ring-rose-300 bg-rose-50/50",
  };
  const baseCls =
    "rounded-xl border border-slate-200 p-4 shadow-card text-left w-full " +
    (toneClasses[tone] || toneClasses.default);
  const interactiveCls = disabled
    ? " cursor-default opacity-90"
    : " transition hover:border-slate-400 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500";

  const showFlag = (tone === "warn" || tone === "crit") && !disabled;

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled || undefined}
      className={baseCls + interactiveCls}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        {showFlag ? <AttentionFlag /> : null}
      </div>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </button>
  );
}

function ClickableBar({ item, max, onClick, accent }) {
  const disabled = !item.value;
  const cls =
    "block w-full rounded-md text-left -mx-1 px-1 py-1 transition" +
    (disabled
      ? " cursor-default opacity-90"
      : " hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500");
  const inner = (
    <>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="truncate text-slate-700">{item.label}</span>
        <span className="shrink-0 font-semibold tabular-nums text-slate-900">
          {item.value}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full"
          style={{
            width:
              Math.max(item.value > 0 ? 4 : 0, (item.value / max) * 100) + "%",
            backgroundColor: item.color || accent,
          }}
        />
      </div>
    </>
  );

  if (disabled || !onClick) {
    return <div className={cls}>{inner}</div>;
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

function Bars({ items, accent = A11Y.teal, onSelect }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label}>
          <ClickableBar
            item={item}
            max={max}
            accent={accent}
            onClick={onSelect ? () => onSelect(item) : undefined}
          />
        </li>
      ))}
    </ul>
  );
}

// Compact donut + clickable legend rows used for Decision Outcomes.
function DecisionDonut({ segments, onSelect }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = 42;
  const stroke = 14;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0 -rotate-90">
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={stroke}
        />
        {total > 0
          ? segments.map((seg) => {
              if (seg.value === 0) return null;
              const pct = seg.value / total;
              const dash = pct * circumference;
              const el = (
                <circle
                  key={seg.label}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += dash;
              return el;
            })
          : null}
      </svg>
      <ul className="flex-1 space-y-1">
        {segments.map((seg) => {
          const disabled = seg.value === 0;
          const cls =
            "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs transition" +
            (disabled
              ? " cursor-default opacity-90"
              : " hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500");
          const inner = (
            <>
              <span className="flex items-center gap-2 text-slate-600">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: seg.color }}
                />
                {seg.label}
              </span>
              <span className="font-semibold tabular-nums text-slate-900">
                {seg.value}
                {total > 0 ? (
                  <span className="ml-1 font-normal text-slate-400">
                    ({Math.round((seg.value / total) * 100)}%)
                  </span>
                ) : null}
              </span>
            </>
          );
          return (
            <li key={seg.label}>
              {disabled || !onSelect ? (
                <div className={cls}>{inner}</div>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelect(seg)}
                  className={cls}
                >
                  {inner}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// --- Health -----------------------------------------------------------------

export function DeliveryScoreboard({ stats, onSelect }) {
  const cycle =
    stats.cycle.medianDays == null ? "—" : `${stats.cycle.medianDays}d`;
  const cycleHint =
    stats.cycle.medianDays == null
      ? "No releases in last 180d"
      : `Median across ${stats.cycle.sampleSize} recent release${stats.cycle.sampleSize === 1 ? "" : "s"}`;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile
        label="Released this quarter"
        value={stats.releasedThisQuarter.count}
        tone="accent"
        disabled={stats.releasedThisQuarter.count === 0}
        onClick={() => onSelect?.("releasedThisQuarter")}
      />
      <Tile
        label="In flight"
        value={stats.inFlight.count}
        hint="Definition → Staging"
        disabled={stats.inFlight.count === 0}
        onClick={() => onSelect?.("inFlight")}
      />
      <Tile
        label="Roadmapped, not started"
        value={stats.notStarted.count}
        hint="Still in Discovery"
        tone={stats.notStarted.count > 0 ? "warn" : "default"}
        disabled={stats.notStarted.count === 0}
        onClick={() => onSelect?.("notStarted")}
      />
      <Tile
        label="Median cycle time"
        value={cycle}
        hint={cycleHint}
        disabled={stats.cycle.sampleSize === 0}
        onClick={() => onSelect?.("cycle")}
      />
    </div>
  );
}

export function LifecycleFunnel({ funnel, onSelect }) {
  const items = funnel.map((row) => ({
    label: row.stage,
    value: row.count,
    color: A11Y.teal,
    payload: row,
  }));
  return (
    <Bars
      items={items}
      accent={A11Y.teal}
      onSelect={onSelect ? (item) => onSelect(item.payload) : undefined}
    />
  );
}

// Tier label + matching ring/bg. The text label is the primary signal so
// users who can't distinguish red/amber still get the urgency information.
function ageTier(days) {
  if (days >= 30) {
    return {
      label: "Stalled",
      iconChar: "■",
      ring: "ring-rose-300 bg-rose-50",
      pill: "bg-rose-100 text-rose-800 ring-rose-300",
    };
  }
  if (days >= 14) {
    return {
      label: "Aging",
      iconChar: "▲",
      ring: "ring-amber-300 bg-amber-50",
      pill: "bg-amber-100 text-amber-800 ring-amber-300",
    };
  }
  return {
    label: "On track",
    iconChar: "●",
    ring: "ring-slate-200 bg-white",
    pill: "bg-slate-100 text-slate-700 ring-slate-300",
  };
}

export function AgingInStage({ rows }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm italic text-slate-400">
        Nothing has been sitting in a stage. Healthy pipeline.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {rows.map(({ caseObj, stage, days }) => {
        const tier = ageTier(days);
        return (
          <li key={caseObj.id}>
            <Link
              to={"/cases/" + caseObj.id}
              className={
                "flex items-center justify-between gap-3 rounded-lg px-3 py-2 ring-1 transition hover:shadow-sm " +
                tier.ring
              }
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {caseObj.ps_name}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {caseObj.case_number} · {stage}
                </p>
              </div>
              <span
                className={
                  "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ring-1 ring-inset " +
                  tier.pill
                }
                aria-label={`${tier.label}: ${days} days in stage`}
              >
                <span aria-hidden className="font-bold">
                  {tier.iconChar}
                </span>
                {tier.label} · {days}d
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function StalledCritical({ cases }) {
  if (cases.length === 0) {
    return (
      <p className="text-sm italic text-slate-400">
        No critical-priority work is stalled before development.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {cases.map((c) => (
        <li
          key={c.id}
          className="rounded-lg ring-1 ring-inset"
          style={{
            backgroundColor: CRITICAL_SURFACE.bg,
            boxShadow: `inset 0 0 0 1px ${CRITICAL_SURFACE.border}`,
          }}
        >
          <Link
            to={"/cases/" + c.id}
            className="flex items-center justify-between gap-3 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {c.ps_name}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-600">
                {c.case_number} · {c.lifecycle_status || LIFECYCLE_STATUS_ORDER[0]}
              </p>
            </div>
            <PriorityBadge priority={c.priority} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

// --- Trends -----------------------------------------------------------------

export function ReleasesTimeline({ rows }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm italic text-slate-400">
        No cases have been released yet.
      </p>
    );
  }
  return (
    <ol className="relative space-y-3 border-l border-slate-200 pl-4">
      {rows.map(({ caseObj, releasedAt }) => (
        <li key={caseObj.id} className="relative">
          <span
            className="absolute -left-[21px] top-2 h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: A11Y.teal }}
          />
          <Link
            to={"/cases/" + caseObj.id}
            className="block rounded-lg border border-slate-200 bg-white px-3 py-2 transition hover:border-slate-300 hover:shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-slate-900">
                {caseObj.ps_name}
              </p>
              <span className="shrink-0 text-xs text-slate-500">
                {formatDate(releasedAt)}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {caseObj.case_number} · {caseObj.team}
            </p>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export function IntakeTrend({ buckets, onSelect }) {
  const max = Math.max(...buckets.map((b) => b.count), 1);
  const total = buckets.reduce((s, b) => s + b.count, 0);
  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height: 96 }}>
        {buckets.map((b) => {
          const h = b.count > 0 ? Math.max(6, (b.count / max) * 90) : 2;
          const label = `Week of ${formatDate(b.start.toISOString())}: ${b.count} submission${b.count === 1 ? "" : "s"}`;
          const disabled = b.count === 0;
          const cls =
            "group relative flex flex-1 flex-col items-center justify-end rounded-sm transition" +
            (disabled
              ? " cursor-default opacity-90"
              : " hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500");
          return (
            <button
              type="button"
              key={b.start.toISOString()}
              className={cls}
              title={label}
              aria-label={label}
              disabled={disabled}
              onClick={() => (disabled ? null : onSelect?.(b))}
            >
              <div
                className="w-full rounded-t-sm"
                style={{
                  height: h + "px",
                  backgroundColor: b.count > 0 ? A11Y.blue : "#E2E8F0",
                }}
              />
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>
          {formatDate(buckets[0]?.start.toISOString())} →{" "}
          {formatDate(
            new Date(
              buckets[buckets.length - 1].end.getTime() - 1,
            ).toISOString(),
          )}
        </span>
        <span className="font-semibold text-slate-700">{total} total</span>
      </div>
    </div>
  );
}

export function DecisionOutcomes({ outcomes, onSelect }) {
  const segments = [
    {
      label: "Roadmapped",
      value: outcomes.counts[PIPELINE_STATUS.ROADMAPPED],
      color: PIPELINE_A11Y[PIPELINE_STATUS.ROADMAPPED].fill,
      key: PIPELINE_STATUS.ROADMAPPED,
    },
    {
      label: "On Hold",
      value: outcomes.counts[PIPELINE_STATUS.ON_HOLD],
      color: PIPELINE_A11Y[PIPELINE_STATUS.ON_HOLD].fill,
      key: PIPELINE_STATUS.ON_HOLD,
    },
    {
      label: "Declined",
      value: outcomes.counts[PIPELINE_STATUS.DECLINED],
      color: PIPELINE_A11Y[PIPELINE_STATUS.DECLINED].fill,
      key: PIPELINE_STATUS.DECLINED,
    },
  ];
  return (
    <div>
      <DecisionDonut
        segments={segments}
        onSelect={onSelect ? (seg) => onSelect(seg.key) : undefined}
      />
      <p className="mt-3 text-xs text-slate-500">
        Decisions made in the last {outcomes.windowDays} days · {outcomes.total}{" "}
        total
      </p>
    </div>
  );
}

export function RoadmapByType({ rows, onSelect }) {
  const items = rows.map((r, i) => ({
    label: r.label,
    value: r.value,
    color:
      REQUEST_TYPE_A11Y[r.label] ||
      CHART_TYPE_SEQUENCE[i % CHART_TYPE_SEQUENCE.length],
    payload: r,
  }));
  return (
    <Bars
      items={items}
      onSelect={onSelect ? (item) => onSelect(item.payload) : undefined}
    />
  );
}

export const LIFECYCLE_ORDER_FOR_FUNNEL = LIFECYCLE_STATUS_ORDER;
export const REQUEST_TYPE_ORDER_FOR_MIX = REQUEST_TYPE_ORDER;
