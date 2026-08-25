"use client";

import {
  createVenue,
  updateVenue,
  type AdminActionState,
} from "@/app/actions/admin";
import { useActionState } from "react";
import Link from "next/link";
import { ADMIN_BASE_PATH } from "@/lib/admin-constants";

export type VenueFormValues = {
  id?: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  lat: string;
  lng: string;
  logoUrl?: string | null;
  descriptionRu?: string;
  descriptionEn?: string;
  descriptionZh?: string;
};

const initial: AdminActionState = { ok: false };

type Props = {
  mode: "create" | "edit";
  initialValues: VenueFormValues;
};

export function VenueForm({ mode, initialValues }: Props) {
  const action = mode === "create" ? createVenue : updateVenue;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4" encType="multipart/form-data">
      {initialValues.id ? (
        <input type="hidden" name="id" value={initialValues.id} />
      ) : null}

      <Field label="Название" name="name" defaultValue={initialValues.name} required />

      <fieldset className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-800">
          О заведении
        </legend>
        <p className="text-xs leading-relaxed text-slate-500">
          Текст для публичной карточки. Адрес хранится отдельно и при сохранении
          не затирается. Переносы абзацев сохраняются.
        </p>
        <AboutField
          label="О заведении"
          name="description_ru"
          defaultValue={initialValues.descriptionRu ?? ""}
        />
        <AboutField
          label="О заведении (EN)"
          name="description_en"
          defaultValue={initialValues.descriptionEn ?? ""}
        />
        <AboutField
          label="О заведении (ZH)"
          name="description_zh"
          defaultValue={initialValues.descriptionZh ?? ""}
        />
      </fieldset>

      <Field label="Адрес" name="address" defaultValue={initialValues.address} required />
      <Field label="Телефон" name="phone" defaultValue={initialValues.phone} />
      <Field label="Сайт" name="website" defaultValue={initialValues.website} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Широта" name="lat" defaultValue={initialValues.lat} required />
        <Field label="Долгота" name="lng" defaultValue={initialValues.lng} required />
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-slate-800">Логотип / фото</span>
        {initialValues.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={initialValues.logoUrl}
            alt=""
            className="mb-2 h-20 w-20 rounded-xl bg-white object-contain object-center p-2 ring-1 ring-slate-200"
          />
        ) : null}
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:text-white"
        />
        <span className="text-xs text-slate-400">JPEG / PNG / WebP / GIF, до 5 МБ</span>
      </label>

      {state.error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="text-sm font-medium text-emerald-700" role="status">
          Сохранено
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {pending ? "Сохранение…" : mode === "create" ? "Создать" : "Сохранить"}
        </button>
        <Link
          href={`${ADMIN_BASE_PATH}/venues`}
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          К списку
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-slate-800">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
      />
    </label>
  );
}

function AboutField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-slate-800">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={8}
        className="min-h-[12rem] resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
      />
    </label>
  );
}
