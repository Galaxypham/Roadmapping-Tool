import { PRIORITY_ORDER, REQUEST_TYPE_ORDER } from "../../lib/constants.js";
import {
  CHART_GAUGE,
  CHART_RICE_BAR,
  CHART_TYPE_SEQUENCE,
  PRIORITY_A11Y,
} from "../../lib/accessibleColors.js";

function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card ring-1 ring-slate-200">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function DonutChart({ segments, size = 120 }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) {
    return (
      <div
        className="mx-auto flex items-center justify-center rounded-full bg-slate-100 text-xs text-slate-400"
        style={{ width: size, height: size }}
      >
        No data
      </div>
    );
  }

  const radius = 42;
  const stroke = 14;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0 -rotate-90">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        {segments.map((seg) => {
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
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <ul className="flex-1 space-y-2">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-2 text-slate-600">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              {seg.label}
            </span>
            <span className="font-semibold text-slate-900">
              {seg.value}
              <span className="ml-1 font-normal text-slate-400">
                ({Math.round((seg.value / total) * 100)}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HorizontalBars({ items, maxValue }) {
  const max = maxValue || Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-3">
      {items.map((item, idx) => (
        <li key={item.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="truncate text-slate-600">{item.label}</span>
            <span className="shrink-0 font-semibold text-slate-900">{item.value}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: Math.max(4, (item.value / max) * 100) + "%",
                backgroundColor: item.color || CHART_TYPE_SEQUENCE[idx % CHART_TYPE_SEQUENCE.length],
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function RiceBarChart({ cases, maxTotal = 20 }) {
  if (cases.length === 0) {
    return <p className="text-sm italic text-slate-400">No RICE scores yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {cases.map((c) => {
        const score = c.rice.weighted_total;
        const pct = Math.min(100, (score / maxTotal) * 100);
        return (
          <li key={c.id}>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs">
              <span className="truncate font-medium text-slate-700">{c.case_number}</span>
              <span className="shrink-0 font-semibold text-slate-900">{score}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{ width: pct + "%", backgroundColor: CHART_RICE_BAR }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ScoredGauge({ scored, total, avgRice }) {
  const pct = total > 0 ? Math.round((scored / total) * 100) : 0;
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 shrink-0">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={CHART_GAUGE}
            strokeWidth="3"
            strokeDasharray={`${pct}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-900">
          {pct}%
        </span>
      </div>
      <div>
        <p className="text-lg font-semibold text-slate-900">
          {scored} / {total}
        </p>
        <p className="text-xs text-slate-500">Avg {avgRice}</p>
      </div>
    </div>
  );
}

export function PriorityDonutChart({ cases }) {
  const segments = PRIORITY_ORDER.map((label) => ({
    label,
    value: cases.filter((c) => c.priority === label).length,
    color: PRIORITY_A11Y[label] || "#64748b",
  })).filter((s) => s.value > 0);

  return (
    <ChartCard title="Priority mix">
      <DonutChart
        segments={
          segments.length
            ? segments
            : PRIORITY_ORDER.map((l) => ({
                label: l,
                value: 0,
                color: PRIORITY_A11Y[l],
              }))
        }
      />
    </ChartCard>
  );
}

export function RequestTypeBarChart({ cases }) {
  const items = REQUEST_TYPE_ORDER.map((label, idx) => ({
    label,
    value: cases.filter((c) => c.request_type === label).length,
    color: CHART_TYPE_SEQUENCE[idx],
  }));

  return (
    <ChartCard title="Request types">
      <HorizontalBars items={items} />
    </ChartCard>
  );
}

export function TopRiceBarChart({ cases }) {
  const top = cases
    .filter((c) => c.rice && c.rice.weighted_total != null)
    .sort((a, b) => b.rice.weighted_total - a.rice.weighted_total)
    .slice(0, 5);

  return (
    <ChartCard title="Top RICE scores">
      <RiceBarChart cases={top} />
    </ChartCard>
  );
}

export function RiceCoverageGauge({ cases, avgRice }) {
  const total = cases.length;
  const scored = cases.filter((c) => c.rice && c.rice.weighted_total != null).length;

  return (
    <ChartCard title="Scoring progress">
      <ScoredGauge scored={scored} total={total} avgRice={avgRice} />
    </ChartCard>
  );
}

export { ChartCard, HorizontalBars };
