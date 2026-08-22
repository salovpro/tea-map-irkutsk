"use server";

import {
  ADMIN_BASE_PATH,
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  verifyAdminAccessCode,
} from "@/lib/admin-auth";
import { requireAdminSession } from "@/lib/admin-session";
import {
  deleteManagedVenueImage,
  uploadVenueImage,
} from "@/lib/venue-storage";
import { prisma } from "@/lib/prisma";
import { Locale } from "@/generated/prisma/client";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type AdminActionState = {
  ok: boolean;
  error?: string;
};

export type TeaMenuItemInput = {
  title: string;
  category: string;
  price: number;
  volume: string;
  description?: string;
};

function slugify(value: string) {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/ё/g, "e")
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return base || `place-${Date.now()}`;
}

function parseNumber(value: FormDataEntryValue | null, label: string) {
  const raw = String(value ?? "").trim().replace(",", ".");
  const num = Number(raw);
  if (!Number.isFinite(num)) {
    throw new Error(`Некорректное значение: ${label}`);
  }
  return num;
}

function buildDescription(address: string, blurb?: string) {
  const base = blurb?.trim() || "Заведение — участник Чайной карты Иркутска.";
  return `${base} Адрес: ${address.trim()}.`;
}

function revalidatePublicCatalog() {
  revalidatePath("/[locale]/places", "page");
  revalidatePath("/[locale]/favorites", "page");
  revalidatePath("/[locale]/places/[id]", "page");
  revalidatePath("/places");
  revalidatePath("/en/places");
  revalidatePath("/zh/places");
  revalidatePath("/ru/places");
  revalidatePath("/favorites");
  revalidatePath("/en/favorites");
  revalidatePath("/zh/favorites");
}

function revalidateAdmin(paths: string[] = []) {
  revalidatePath(ADMIN_BASE_PATH);
  revalidatePath(`${ADMIN_BASE_PATH}/venues`);
  for (const path of paths) revalidatePath(path);
  revalidatePath("/");
  revalidatePublicCatalog();
}

export async function adminLogin(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const code = String(formData.get("code") ?? "");
  if (!verifyAdminAccessCode(code)) {
    return { ok: false, error: "Неверный код доступа" };
  }

  const jar = await cookies();
  jar.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  redirect(`${ADMIN_BASE_PATH}/venues`);
}

export async function adminLogout() {
  const jar = await cookies();
  jar.delete(ADMIN_SESSION_COOKIE);
  redirect(ADMIN_BASE_PATH);
}

export async function createVenue(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdminSession();

    const name = String(formData.get("name") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const website = String(formData.get("website") ?? "").trim();
    const lat = parseNumber(formData.get("lat"), "широта");
    const lng = parseNumber(formData.get("lng"), "долгота");

    if (!name) return { ok: false, error: "Укажите название" };
    if (!address) return { ok: false, error: "Укажите адрес" };

    const upload = await uploadVenueImage(formData.get("image") as File | null);
    if (!upload.ok) return { ok: false, error: upload.error };

    let slug = slugify(name);
    const existing = await prisma.place.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    const description = buildDescription(address);

    const agg = await prisma.place.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (agg._max.sortOrder ?? 0) + 10;

    await prisma.place.create({
      data: {
        slug,
        lat,
        lng,
        phone: phone || null,
        website: website || null,
        logoUrl: upload.url,
        sortOrder,
        translations: {
          create: [
            {
              locale: Locale.ru,
              name,
              description,
              teaMenu: [],
            },
            {
              locale: Locale.en,
              name,
              description: `Address: ${address}.`,
              teaMenu: [],
            },
            {
              locale: Locale.zh,
              name,
              description: `地址：${address}。`,
              teaMenu: [],
            },
          ],
        },
      },
    });

    revalidateAdmin();
    redirect(`${ADMIN_BASE_PATH}/venues`);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { ok: false, error: "Нет доступа" };
    }
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Не удалось создать",
    };
  }
}

export async function updateVenue(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdminSession();

    const id = String(formData.get("id") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const website = String(formData.get("website") ?? "").trim();
    const lat = parseNumber(formData.get("lat"), "широта");
    const lng = parseNumber(formData.get("lng"), "долгота");

    if (!id) return { ok: false, error: "Нет id заведения" };
    if (!name) return { ok: false, error: "Укажите название" };
    if (!address) return { ok: false, error: "Укажите адрес" };

    const upload = await uploadVenueImage(formData.get("image") as File | null);
    if (!upload.ok) return { ok: false, error: upload.error };

    const place = await prisma.place.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!place) return { ok: false, error: "Заведение не найдено" };

    const description = buildDescription(address);

    if (upload.url && place.logoUrl && place.logoUrl !== upload.url) {
      await deleteManagedVenueImage(place.logoUrl);
    }

    await prisma.place.update({
      where: { id },
      data: {
        lat,
        lng,
        phone: phone || null,
        website: website || null,
        ...(upload.url ? { logoUrl: upload.url } : {}),
      },
    });

    const ru = place.translations.find((t) => t.locale === Locale.ru);
    if (ru) {
      await prisma.placeTranslation.update({
        where: { id: ru.id },
        data: { name, description },
      });
    } else {
      await prisma.placeTranslation.create({
        data: {
          placeId: id,
          locale: Locale.ru,
          name,
          description,
          teaMenu: [],
        },
      });
    }

    revalidateAdmin([`${ADMIN_BASE_PATH}/venues/${id}`]);
    return { ok: true };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { ok: false, error: "Нет доступа" };
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Не удалось сохранить",
    };
  }
}

export async function deleteVenue(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const place = await prisma.place.findUnique({
    where: { id },
    select: { logoUrl: true },
  });
  await prisma.place.delete({ where: { id } });
  await deleteManagedVenueImage(place?.logoUrl);
  revalidateAdmin();
  redirect(`${ADMIN_BASE_PATH}/venues`);
}

export async function saveTeaMenu(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdminSession();

    const placeId = String(formData.get("placeId") ?? "").trim();
    const raw = String(formData.get("itemsJson") ?? "[]");
    if (!placeId) return { ok: false, error: "Нет id заведения" };

    let items: TeaMenuItemInput[];
    try {
      items = JSON.parse(raw) as TeaMenuItemInput[];
    } catch {
      return { ok: false, error: "Некорректные данные меню" };
    }

    const cleaned = items
      .map((item) => ({
        title: String(item.title ?? "").trim(),
        category: String(item.category ?? "").trim() || "Чай",
        price: Number(item.price) || 0,
        volume: String(item.volume ?? "").trim(),
        description: item.description
          ? String(item.description).trim()
          : undefined,
      }))
      .filter((item) => item.title);

    const place = await prisma.place.findUnique({
      where: { id: placeId },
      include: { translations: true },
    });
    if (!place) return { ok: false, error: "Заведение не найдено" };

    for (const locale of [Locale.ru, Locale.en, Locale.zh] as const) {
      const row = place.translations.find((t) => t.locale === locale);
      if (row) {
        await prisma.placeTranslation.update({
          where: { id: row.id },
          data: { teaMenu: cleaned },
        });
      } else if (locale === Locale.ru) {
        await prisma.placeTranslation.create({
          data: {
            placeId,
            locale,
            name: "Без названия",
            description: "Адрес: .",
            teaMenu: cleaned,
          },
        });
      }
    }

    revalidateAdmin([
      `${ADMIN_BASE_PATH}/venues/${placeId}`,
      `${ADMIN_BASE_PATH}/venues/${placeId}/menu`,
    ]);
    return { ok: true };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { ok: false, error: "Нет доступа" };
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Не удалось сохранить меню",
    };
  }
}

type PlaceOrderItem = {
  id: string;
  sortOrder: number;
};

function isPlaceOrderItem(value: unknown): value is PlaceOrderItem {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    row.id.trim().length > 0 &&
    typeof row.sortOrder === "number" &&
    Number.isInteger(row.sortOrder) &&
    Number.isFinite(row.sortOrder)
  );
}

export async function updatePlacesOrder(
  items: PlaceOrderItem[],
): Promise<AdminActionState> {
  try {
    await requireAdminSession();

    if (!Array.isArray(items) || items.length === 0) {
      return { ok: false, error: "Пустой список порядка" };
    }
    if (!items.every(isPlaceOrderItem)) {
      return { ok: false, error: "Некорректные данные порядка" };
    }

    const ids = items.map((item) => item.id.trim());
    if (new Set(ids).size !== ids.length) {
      return { ok: false, error: "Повторяющиеся id в порядке" };
    }

    const found = await prisma.place.count({
      where: { id: { in: ids } },
    });
    if (found !== ids.length) {
      return { ok: false, error: "Часть заведений не найдена" };
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.place.update({
          where: { id: item.id.trim() },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { ok: false, error: "Нет доступа" };
    }
    return { ok: false, error: "Не удалось сохранить порядок" };
  }
}
