import { Link } from "react-router-dom";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { isCriticalPriority } from "../../lib/constants.js";
import { formatDate } from "../../lib/format.js";
import { CRITICAL_SURFACE } from "../../lib/accessibleColors.js";
import {
  LifecycleStatusBadge,
  PriorityBadge,
  RequestTypeBadge,
} from "../ui/Badge.jsx";

function DragHandleIcon() {
  return (
    <svg
      className="h-4 w-4 text-slate-400"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden
    >
      <circle cx="7" cy="5" r="1.4" />
      <circle cx="13" cy="5" r="1.4" />
      <circle cx="7" cy="10" r="1.4" />
      <circle cx="13" cy="10" r="1.4" />
      <circle cx="7" cy="15" r="1.4" />
      <circle cx="13" cy="15" r="1.4" />
    </svg>
  );
}

function CardContent({ caseObj, position, total }) {
  const riceTotal = caseObj.rice?.weighted_total;
  const critical = isCriticalPriority(caseObj.priority);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-4">
      <div className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-center ring-1 ring-inset ring-slate-200">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
          Rank
        </p>
        <p className="text-sm font-semibold leading-tight text-slate-800 tabular-nums">
          {position}
          <span className="text-xs font-normal text-slate-400">/{total}</span>
        </p>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold text-slate-900">
            {caseObj.case_number}
          </span>
          {critical ? (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{
                backgroundColor: CRITICAL_SURFACE.bg,
                color: CRITICAL_SURFACE.text,
              }}
            >
              Critical
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {caseObj.ps_name}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <RequestTypeBadge type={caseObj.request_type} />
          <PriorityBadge priority={caseObj.priority} />
          {caseObj.lifecycle_status ? (
            <LifecycleStatusBadge status={caseObj.lifecycle_status} />
          ) : null}
        </div>
        <p className="mt-2 truncate text-xs text-slate-500">
          {caseObj.requestor_name} · {caseObj.team}
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-400">
          Submitted {formatDate(caseObj.created_at)}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
          RICE
        </p>
        <p className="text-sm font-semibold tabular-nums text-slate-700">
          {riceTotal != null ? riceTotal : "—"}
        </p>
      </div>
    </div>
  );
}

function SortableRow({ caseObj, position, total }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: caseObj.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={
        "flex items-stretch gap-2 rounded-lg border border-slate-200 bg-white shadow-sm transition " +
        (isDragging
          ? "ring-2 ring-accent-500"
          : "hover:border-slate-300 hover:shadow-md")
      }
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${caseObj.case_number}`}
        className="flex shrink-0 cursor-grab items-center justify-center rounded-l-lg border-r border-slate-100 bg-slate-50 px-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
      >
        <DragHandleIcon />
      </button>
      <Link
        to={"/cases/" + caseObj.id}
        className="flex flex-1 items-center px-3 py-3"
      >
        <CardContent caseObj={caseObj} position={position} total={total} />
      </Link>
    </li>
  );
}

function StaticRow({ caseObj, position, total }) {
  return (
    <li className="rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <Link to={"/cases/" + caseObj.id} className="flex items-center px-3 py-3">
        <CardContent caseObj={caseObj} position={position} total={total} />
      </Link>
    </li>
  );
}

export function RoadmapList({ cases, sortable = false, onReorder }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = cases.findIndex((c) => c.id === active.id);
    const newIndex = cases.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(cases, oldIndex, newIndex);
    onReorder?.(next.map((c) => c.id));
  };

  if (!sortable) {
    return (
      <ol className="space-y-2">
        {cases.map((c, i) => (
          <StaticRow
            key={c.id}
            caseObj={c}
            position={i + 1}
            total={cases.length}
          />
        ))}
      </ol>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={cases.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <ol className="space-y-2">
          {cases.map((c, i) => (
            <SortableRow
              key={c.id}
              caseObj={c}
              position={i + 1}
              total={cases.length}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}
