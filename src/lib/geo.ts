/** Earth radius in meters. */
const EARTH_RADIUS_M = 6_371_000;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

/** Great-circle distance between two WGS84 points, in meters. */
export function haversineMeters(
  from: [number, number],
  to: [number, number],
): number {
  const [lat1, lng1] = from;
  const [lat2, lng2] = to;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

export type FormattedDistance =
  | { unit: "m"; value: number }
  | { unit: "km"; value: number };

/** Round for compact UI: meters under 1 km, otherwise kilometers. */
export function formatDistance(meters: number): FormattedDistance {
  if (!Number.isFinite(meters) || meters < 0) {
    return { unit: "m", value: 0 };
  }

  if (meters < 1000) {
    const step = meters < 100 ? 10 : 50;
    return { unit: "m", value: Math.max(step, Math.round(meters / step) * step) };
  }

  const km = meters / 1000;
  const value = km < 10 ? Math.round(km * 10) / 10 : Math.round(km);
  return { unit: "km", value };
}
