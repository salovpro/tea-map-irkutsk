import {
  contentTypeForFilename,
  isSafeVenueFilename,
  readVenueImage,
} from "@/lib/venue-storage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ filename: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { filename } = await context.params;
  console.info("[venue-media]", { reached: true, filename });

  if (!filename || !isSafeVenueFilename(filename)) {
    console.info("[venue-media]", {
      filename,
      exists: false,
      size: 0,
      reason: "invalid_filename",
    });
    return new NextResponse("Not found", { status: 404 });
  }

  const file = await readVenueImage(filename);
  if (!file) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      "Content-Type": contentTypeForFilename(filename),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
