"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type CreateReviewState = {
  ok: boolean;
  error?: string;
};

export async function createReview(
  _prev: CreateReviewState,
  formData: FormData,
): Promise<CreateReviewState> {
  const placeId = String(formData.get("placeId") ?? "").trim();
  const locale = String(formData.get("locale") ?? "ru").trim();
  const authorName = String(formData.get("authorName") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();
  const rating = Number(formData.get("rating"));

  if (!placeId) {
    return { ok: false, error: "missing_place" };
  }

  if (!authorName || authorName.length < 2) {
    return { ok: false, error: "invalid_name" };
  }

  if (!text || text.length < 5) {
    return { ok: false, error: "invalid_text" };
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "invalid_rating" };
  }

  try {
    const place = await prisma.place.findUnique({
      where: { id: placeId },
      select: { id: true },
    });

    if (!place) {
      return { ok: false, error: "missing_place" };
    }

    await prisma.review.create({
      data: {
        placeId,
        authorName,
        rating,
        text,
      },
    });

    revalidatePath(`/${locale}/places`);
    revalidatePath("/places");
    revalidatePath(`/${locale}`);
    revalidatePath("/");

    return { ok: true };
  } catch (error) {
    console.error("Failed to create review:", error);
    return { ok: false, error: "server" };
  }
}
