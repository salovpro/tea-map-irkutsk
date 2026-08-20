import { deleteVenue } from "@/app/actions/admin";
import { VenueSortableList } from "@/components/admin/VenueSortableList";
import { AdminShell } from "@/components/admin/AdminShell";
import { ADMIN_BASE_PATH } from "@/lib/admin-constants";
import { hasAdminSession } from "@/lib/admin-session";
import { extractAddress } from "@/lib/places";
import { prisma } from "@/lib/prisma";
import { Locale } from "@/generated/prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminVenuesPage() {
  if (!(await hasAdminSession())) {
    redirect(ADMIN_BASE_PATH);
  }

  const places = await prisma.place.findMany({
    include: {
      translations: {
        where: { locale: Locale.ru },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { slug: "asc" }],
  });

  const rows = places.map((place) => ({
    id: place.id,
    name: place.translations[0]?.name?.trim() || place.slug,
    address: extractAddress(place.translations[0]?.description ?? ""),
    phone: place.phone ?? "",
  }));

  return (
    <AdminShell authed>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-semibold text-slate-900">
          Заведения
        </h1>
        <Link
          href={`${ADMIN_BASE_PATH}/venues/new`}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Добавить
        </Link>
      </div>

      <VenueSortableList places={rows} deleteAction={deleteVenue} />
    </AdminShell>
  );
}
