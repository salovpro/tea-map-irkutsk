"use client";

/**
 * Next.js 16 / React 19 dev overlay can call performance.measure with
 * childrenEndTime = -Infinity after redirect() or a failed RSC render.
 * That throws: "'AdminVenuesPage' cannot have a negative time stamp."
 * Production is unaffected. See vercel/next.js#86060.
 */
type MeasureFn = typeof performance.measure;

function installDevPerformanceGuard() {
  if (process.env.NODE_ENV !== "development") return;
  if (typeof performance === "undefined") return;

  const flagged = performance as Performance & {
    __teaNegativeMeasureGuard?: boolean;
  };
  if (flagged.__teaNegativeMeasureGuard) return;
  flagged.__teaNegativeMeasureGuard = true;

  const original: MeasureFn = performance.measure.bind(performance);
  const guarded: MeasureFn = ((
    name: string,
    startOrMeasureOptions?: string | PerformanceMeasureOptions,
    endMark?: string,
  ) => {
    try {
      if (endMark !== undefined) {
        return original(name, startOrMeasureOptions as string, endMark);
      }
      if (startOrMeasureOptions !== undefined) {
        return original(name, startOrMeasureOptions as string | PerformanceMeasureOptions);
      }
      return original(name);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!message.includes("negative time stamp")) {
        throw error;
      }
      try {
        return original(name);
      } catch {
        return {
          name,
          entryType: "measure",
          startTime: 0,
          duration: 0,
          detail: null,
          toJSON() {
            return {
              name,
              entryType: "measure",
              startTime: 0,
              duration: 0,
            };
          },
        } as PerformanceMeasure;
      }
    }
  }) as MeasureFn;

  performance.measure = guarded;
}

installDevPerformanceGuard();

export function DevPerformanceGuard() {
  return null;
}
