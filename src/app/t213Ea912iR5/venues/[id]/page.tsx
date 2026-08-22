import { VenueForm } from "@/components/admin/VenueForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { ADMIN_BASE_PATH } from "@/lib/admin-constants";
import { extractDescriptionBody } from "@/lib/place-description";
import { extractAddress } from "@/lib/places";
import { prisma } from "@/lib/prisma";
import { Locale } from "@/generated/prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditVenuePage({ params }: Props) {
  const { id } = await params;
  const place = await prisma.place.findUnique({
    where: { id },
    include: { translations: true },
  });

  if (!place) notFound();

  const ru =
    place.translations.find((t) => t.locale === Locale.ru) ??
    place.translations[0];
  const en = place.translations.find((t) => t.locale === Locale.en);
  const zh = place.translations.find((t) => t.locale === Locale.zh);

  return (
    <AdminShell authed>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-2xl font-semibold text-slate-900">
          Редактирование
        </h1>
        <Link
          href={`${ADMIN_BASE_PATH}/venues/${place.id}/menu`}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Чайная карта
        </Link>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <VenueForm
          mode="edit"
          initialValues={{
            id: place.id,
            name: ru?.name ?? "",
            address: extractAddress(ru?.description ?? ""),
            phone: place.phone ?? "",
            website: place.website ?? "",
            lat: String(place.lat),
            lng: String(place.lng),
            logoUrl: place.logoUrl,
            descriptionRu: extractDescriptionBody(ru?.description ?? ""),
            descriptionEn: extractDescriptionBody(en?.description ?? ""),
            descriptionZh: extractDescriptionBody(zh?.description ?? ""),
          }}
        />
      </div>
    </AdminShell>
  );
}
