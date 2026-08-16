"use client";

import { saveTeaMenu, type AdminActionState } from "@/app/actions/admin";
import { Plus, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import Link from "next/link";
import { ADMIN_BASE_PATH } from "@/lib/admin-constants";

export type MenuRow = {
  title: string;
  category: string;
  price: number;
  volume: string;
  description?: string;
};

const initial: AdminActionState = { ok: false };

type Props = {
  placeId: string;
  placeName: string;
  initialItems: MenuRow[];
};

export function TeaMenuEditor({ placeId, placeName, initialItems }: Props) {
  const [items, setItems] = useState<MenuRow[]>(
    initialItems.length > 0
      ? initialItems
      : [{ title: "", category: "", price: 0, volume: "" }],
  );
  const [state, formAction, pending] = useActionState(saveTeaMenu, initial);

  function updateRow(index: number, patch: Partial<MenuRow>) {
    setItems((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function addRow() {
    setItems((prev) => [
      ...prev,
      { title: "", category: "Чай", price: 0, volume: "" },
    ]);
  }

  function removeRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Чайная карта
          </p>
          <h1 className="font-serif text-2xl font-semibold text-slate-900">
            {placeName}
          </h1>
        </div>
        <Link
          href={`${ADMIN_BASE_PATH}/venues/${placeId}`}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← К заведению
        </Link>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="placeId" value={placeId} />
        <input type="hidden" name="itemsJson" value={JSON.stringify(items)} />

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3 font-medium">Название</th>
                <th className="px-3 py-3 font-medium">Категория</th>
                <th className="px-3 py-3 font-medium">Цена</th>
                <th className="px-3 py-3 font-medium">Объём</th>
                <th className="px-3 py-3 font-medium">Описание</th>
                <th className="px-3 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {items.map((row, index) => (
                <tr key={index} className="border-b border-slate-100 align-top">
                  <td className="px-2 py-2">
                    <input
                      value={row.title}
                      onChange={(e) => updateRow(index, { title: e.target.value })}
                      className="w-full min-w-[8rem] rounded-lg border border-slate-200 px-2 py-1.5"
                      placeholder="Название"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      value={row.category}
                      onChange={(e) =>
                        updateRow(index, { category: e.target.value })
                      }
                      className="w-full min-w-[7rem] rounded-lg border border-slate-200 px-2 py-1.5"
                      placeholder="Категория"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={row.price}
                      onChange={(e) =>
                        updateRow(index, { price: Number(e.target.value) || 0 })
                      }
                      className="w-24 rounded-lg border border-slate-200 px-2 py-1.5"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      value={row.volume}
                      onChange={(e) =>
                        updateRow(index, { volume: e.target.value })
                      }
                      className="w-28 rounded-lg border border-slate-200 px-2 py-1.5"
                      placeholder="600 мл"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      value={row.description ?? ""}
                      onChange={(e) =>
                        updateRow(index, { description: e.target.value })
                      }
                      className="w-full min-w-[10rem] rounded-lg border border-slate-200 px-2 py-1.5"
                      placeholder="Состав"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Добавить позицию
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {pending ? "Сохранение…" : "Сохранить меню"}
          </button>
        </div>

        {state.error ? (
          <p className="text-sm font-medium text-red-600">{state.error}</p>
        ) : null}
        {state.ok ? (
          <p className="text-sm font-medium text-emerald-700">Меню сохранено</p>
        ) : null}
      </form>
    </div>
  );
}
