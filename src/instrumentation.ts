export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { syncPlaceCoordinates } = await import("@/lib/place-coordinates");
  await syncPlaceCoordinates();
}
