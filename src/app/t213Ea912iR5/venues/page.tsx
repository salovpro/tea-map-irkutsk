import { deleteVenue } from "@/app/actions/admin";
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
    orderBy: { createdAt: "desc" },
  });

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

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Адрес</th>
              <th className="px-4 py-3 font-medium">Телефон</th>
              <th className="px-4 py-3 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {places.map((place) => {
              const name =
                place.translations[0]?.name?.trim() || place.slug;
              const address = extractAddress(
                place.translations[0]?.description ?? "",
              );

              return (
                <tr key={place.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {name}
                  </td>
                  <td className="max-w-[14rem] truncate px-4 py-3 text-slate-600">
                    {address || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {place.phone || "—"}
                  </td>
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
                      <form action={deleteVenue}>
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
            })}
          </tbody>
        </table>
        {places.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            Пока нет заведений
          </p>
        ) : null}
      </div>
    </AdminShell>
  );
}
