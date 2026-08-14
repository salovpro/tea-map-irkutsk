"use server";

import {
  getPlaceSheetDetail,
  type PlaceSheetDetail,
} from "@/lib/places";

export async function fetchPlaceSheetDetail(
  id: string,
  locale: string,
): Promise<PlaceSheetDetail | null> {
  return getPlaceSheetDetail(id, locale);
}
