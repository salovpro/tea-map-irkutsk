/**
 * Yandex Maps credentials — always read from env, never hardcode.
 * JS API: map tiles / placemarks
 * Geocoder: reverse/forward geocoding HTTP API (when used)
 */
export function getYandexMapsApiKey() {
  return (process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ?? "").trim();
}

export function getYandexGeocoderApiKey() {
  return (process.env.NEXT_PUBLIC_YANDEX_GEOCODER_API_KEY ?? "").trim();
}
