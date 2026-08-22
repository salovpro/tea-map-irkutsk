export async function register() {
  // Intentionally empty: importing Prisma/pg from instrumentation makes Next 16
  // webpack follow `pg` → `fs` and crash admin/catalog routes.
  // Coordinate sync still runs on first map/catalog load.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
}
