import { PIPELINE_STATUS, PIPELINE_STATUS_ORDER } from "../../lib/constants.js";
import { PIPELINE_A11Y } from "../../lib/accessibleColors.js";

const MAIN_FLOW = [
  PIPELINE_STATUS.INITIATED,
  PIPELINE_STATUS.SUBMITTED,
  PIPELINE_STATUS.ROADMAPPED,
];

const SIDE_FLOW = [PIPELINE_STATUS.ON_HOLD, PIPELINE_STATUS.DECLINED];

function ChevronSegment({ stage, count, isFirst, isLast, compact }) {
  const theme = PIPELINE_A11Y[stage];
  const clip = isFirst
    ? "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)"
    : isLast
      ? "polygon(0 0, 100% 0, 100% 100%, 0 100%, 14px 50%)"
      : "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)";

  return (
    <div
      className={"relative min-w-0 flex-1 " + (compact ? "min-w-[5.5rem]" : "min-w-[7rem]")}
      style={{ marginLeft: isFirst ? 0 : -6 }}
    >
      <div
        className="flex h-full flex-col items-center justify-center px-3 py-3 text-white shadow-sm"
        style={{ clipPath: clip, backgroundColor: theme.fill }}
      >
        <p className="text-[10px] font-medium uppercase tracking-wide opacity-95">
          {theme.label}
        </p>
        <p className={"font-semibold leading-none " + (compact ? "text-xl" : "text-2xl")}>
          {count}
        </p>
      </div>
    </div>
  );
}

function SideStage({ stage, count }) {
  const theme = PIPELINE_A11Y[stage];
  return (
    <div
      className="flex flex-1 items-center justify-between rounded-lg px-4 py-2.5 text-white"
      style={{ backgroundColor: theme.fill }}
    >
      <span className="text-xs font-medium uppercase tracking-wide">{theme.label}</span>
      <span className="text-lg font-semibold">{count}</span>
    </div>
  );
}

export function PipelineChevron({ cases }) {
  const counts = {};
  for (const s of PIPELINE_STATUS_ORDER) counts[s] = 0;
  for (const c of cases) {
    if (counts[c.pipeline_status] != null) counts[c.pipeline_status] += 1;
  }

  return (
    <div className="space-y-4">
      <div className="hidden sm:flex sm:items-stretch sm:gap-0">
        {MAIN_FLOW.map((stage, idx) => (
          <ChevronSegment
            key={stage}
            stage={stage}
            count={counts[stage]}
            isFirst={idx === 0}
            isLast={idx === MAIN_FLOW.length - 1}
          />
        ))}
      </div>

      <div className="flex flex-col gap-1 sm:hidden">
        {MAIN_FLOW.map((stage, idx) => {
          const theme = PIPELINE_A11Y[stage];
          return (
            <div key={stage}>
              <div
                className="flex items-center justify-between rounded-lg px-4 py-3 text-white"
                style={{ backgroundColor: theme.fill }}
              >
                <span className="text-xs font-medium uppercase tracking-wide">{theme.label}</span>
                <span className="text-xl font-semibold">{counts[stage]}</span>
              </div>
              {idx < MAIN_FLOW.length - 1 ? (
                <div className="flex justify-center py-0.5 text-slate-400">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        {SIDE_FLOW.map((stage) => (
          <SideStage key={stage} stage={stage} count={counts[stage]} />
        ))}
      </div>
    </div>
  );
}
