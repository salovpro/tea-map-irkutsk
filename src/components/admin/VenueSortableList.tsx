"use client";

import { saveVenueSortOrder } from "@/app/actions/admin";
import { ADMIN_BASE_PATH } from "@/lib/admin-constants";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
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
import { GripVertical } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

export type AdminVenueListItem = {
  id: string;
  name: string;
  address: string;
  phone: string;
};

type VenueSortableListProps = {
  places: AdminVenueListItem[];
  deleteAction: (formData: FormData) => void | Promise<void>;
};

export function VenueSortableList({
  places,
  deleteAction,
}: VenueSortableListProps) {
  const [items, setItems] = useState(places);
  const [savedItems, setSavedItems] = useState(places);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = useMemo(
    () => items.map((item) => item.id).join(",") !== savedItems.map((item) => item.id).join(","),
    [items, savedItems],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
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

  function handleSave() {
    startTransition(async () => {
      const payload = items.map((item, index) => ({
        id: item.id,
        sortOrder: (index + 1) * 10,
      }));
      const result = await saveVenueSortOrder(payload);
      if (result.ok) {
        setSavedItems(items);
        setMessage({ type: "success", text: "Порядок сохранён" });
        return;
      }
      setMessage({
        type: "error",
        text: result.error ?? "Не удалось сохранить порядок",
      });
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Перетащите строки за ручку, затем сохраните порядок.
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || pending}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {pending ? "Сохраняем…" : "Сохранить порядок"}
        </button>
      </div>

      {message ? (
        <p
          role="status"
          className={
            message.type === "success"
              ? "rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
              : "rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
          }
        >
          {message.text}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-10 px-3 py-3 font-medium">
                  <span className="sr-only">Порядок</span>
                </th>
                <th className="px-4 py-3 font-medium">Название</th>
                <th className="px-4 py-3 font-medium">Адрес</th>
                <th className="px-4 py-3 font-medium">Телефон</th>
                <th className="px-4 py-3 font-medium">Действия</th>
              </tr>
            </thead>
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {items.map((place) => (
                  <SortableVenueRow
                    key={place.id}
                    place={place}
                    deleteAction={deleteAction}
                  />
                ))}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            Пока нет заведений
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SortableVenueRow({
  place,
  deleteAction,
}: {
  place: AdminVenueListItem;
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: place.id });

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`border-b border-slate-100 ${
        isDragging ? "relative z-10 bg-amber-50 shadow-md" : "bg-white"
      }`}
    >
      <td className="px-2 py-3">
        <button
          type="button"
          className="inline-flex cursor-grab touch-none rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
          aria-label={`Перетащить ${place.name}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>
      </td>
      <td className="px-4 py-3 font-medium text-slate-900">{place.name}</td>
      <td className="max-w-[14rem] truncate px-4 py-3 text-slate-600">
        {place.address || "—"}
      </td>
      <td className="px-4 py-3 text-slate-600">{place.phone || "—"}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <Link
            href={`${ADMIN_BASE_PATH}/venues/${place.id}`}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Изменить
          </Link>
          <Link
            href={`${ADMIN_BASE_PATH}/venues/${place.id}/menu`}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Меню
          </Link>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={place.id} />
            <button
              type="submit"
              className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
            >
              Удалить
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
