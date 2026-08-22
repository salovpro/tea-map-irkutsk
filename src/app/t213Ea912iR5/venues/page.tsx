import { AdminShell } from "@/components/admin/AdminShell";
import { VenueSortList } from "@/components/admin/VenueSortList";
import { ADMIN_BASE_PATH } from "@/lib/admin-constants";
import {
  CATALOG_ORDER_BY,
  orderPlacesForCatalog,
} from "@/lib/catalog-order";
import { extractAddress } from "@/lib/places";
import { prisma } from "@/lib/prisma";
import { Locale } from "@/generated/prisma/client";
import Link from "next/link";

export default async function AdminVenuesPage() {
  const places = await prisma.place.findMany({
    include: {
      translations: {
        where: { locale: Locale.ru },
      },
    },
    orderBy: CATALOG_ORDER_BY,
  });

  const venues = orderPlacesForCatalog(places).map((place) => ({
    id: place.id,
    slug: place.slug,
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

      <VenueSortList
        key={venues.map((venue) => venue.id).join("|")}
        venues={venues}
      />
    </AdminShell>
  );
}
