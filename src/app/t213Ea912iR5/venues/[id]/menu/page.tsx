import { TeaMenuEditor, type MenuRow } from "@/components/admin/TeaMenuEditor";
import { AdminShell } from "@/components/admin/AdminShell";
import { ADMIN_BASE_PATH } from "@/lib/admin-constants";
import { hasAdminSession } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";
import { Locale } from "@/generated/prisma/client";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

function parseMenu(value: unknown): MenuRow[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item !== "object" || item === null) return [];
    const row = item as Record<string, unknown>;
    const title = String(row.title ?? row.name ?? "").trim();
    if (!title) return [];
    return [
      {
        title,
        category: String(row.category ?? row.note ?? "").trim(),
        price: typeof row.price === "number" ? row.price : Number(row.price) || 0,
        volume: String(row.volume ?? "").trim(),
        description:
          row.description != null ? String(row.description) : undefined,
      },
    ];
  });
}

export default async function AdminVenueMenuPage({ params }: Props) {
  if (!(await hasAdminSession())) {
    redirect(ADMIN_BASE_PATH);
  }

  const { id } = await params;
  const place = await prisma.place.findUnique({
    where: { id },
    include: { translations: true },
  });

  if (!place) notFound();

  const ru =
    place.translations.find((t) => t.locale === Locale.ru) ??
    place.translations[0];

  return (
    <AdminShell authed>
      <TeaMenuEditor
        placeId={place.id}
        placeName={ru?.name ?? place.slug}
        initialItems={parseMenu(ru?.teaMenu)}
      />
    </AdminShell>
  );
}
