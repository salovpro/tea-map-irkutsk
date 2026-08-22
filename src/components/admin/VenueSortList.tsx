"use client";

import { deleteVenue, updatePlacesOrder } from "@/app/actions/admin";
import { ADMIN_BASE_PATH } from "@/lib/admin-constants";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

export type AdminVenueRow = {
  id: string;
  slug: string;
  name: string;
  address: string;
  phone: string;
};

function SortableVenueCard({ venue }: { venue: AdminVenueRow }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: venue.id });

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 2 : undefined,
      }}
      className={`flex items-start gap-2 rounded-xl border px-2 py-3 sm:items-center sm:px-3 ${
        isDragging
          ? "border-amber-300 bg-amber-50 shadow-md"
          : "border-slate-200 bg-white"
      }`}
    >
      <button
        type="button"
        className={`mt-0.5 inline-flex h-10 w-10 shrink-0 touch-none items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        aria-label={`Перетащить ${venue.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-900">{venue.name}</p>
        <p className="truncate text-sm text-slate-600">
          {venue.address || "—"}
          {venue.phone ? ` · ${venue.phone}` : ""}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap justify-end gap-2">
        <Link
          href={`${ADMIN_BASE_PATH}/venues/${venue.id}`}
          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Изменить
        </Link>
        <Link
          href={`${ADMIN_BASE_PATH}/venues/${venue.id}/menu`}
          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Меню
        </Link>
        <form action={deleteVenue}>
          <input type="hidden" name="id" value={venue.id} />
          <button
            type="submit"
            className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
          >
            Удалить
          </button>
        </form>
      </div>
    </article>
  );
}

export function VenueSortList({ venues }: { venues: AdminVenueRow[] }) {
  const [items, setItems] = useState(venues);
  const [message, setMessage] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  const originalKey = useMemo(
    () => venues.map((venue) => venue.id).join("|"),
    [venues],
  );
  const [baseline, setBaseline] = useState(originalKey);

  const currentKey = items.map((venue) => venue.id).join("|");
  const dirty = currentKey !== baseline;

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((current) => {
      const oldIndex = current.findIndex((item) => item.id === active.id);
      const newIndex = current.findIndex((item) => item.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return current;
      return arrayMove(current, oldIndex, newIndex);
    });
    setMessage(null);
  }

  function saveOrder() {
    startTransition(async () => {
      const payload = items.map((item, index) => ({
        id: item.id,
        sortOrder: (index + 1) * 10,
      }));
      const result = await updatePlacesOrder(payload);
      if (result.ok) {
        setBaseline(items.map((item) => item.id).join("|"));
        setMessage({ type: "ok", text: "Порядок сохранён" });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Не удалось сохранить порядок",
        });
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Перетаскивайте заведения за ручку слева. Публичный каталог использует
          этот же порядок.
        </p>
        <button
          type="button"
          onClick={saveOrder}
          disabled={!dirty || pending}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {pending ? "Сохраняем…" : "Сохранить порядок"}
        </button>
      </div>

      {dirty && !message ? (
        <p className="text-sm font-medium text-amber-800">
          Есть несохранённые изменения порядка
        </p>
      ) : null}
      {message ? (
        <p
          role={message.type === "error" ? "alert" : "status"}
          className={
            message.type === "ok"
              ? "text-sm font-medium text-emerald-700"
              : "text-sm font-medium text-red-600"
          }
        >
          {message.text}
        </p>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {items.map((venue) => (
              <SortableVenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {items.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
          Пока нет заведений
        </p>
      ) : null}
    </div>
  );
}
