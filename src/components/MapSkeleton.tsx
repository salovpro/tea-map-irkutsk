export function MapSkeleton() {
  return (
    <div className="fixed inset-0 z-0 h-screen w-full overflow-hidden bg-slate-100 pb-20 sm:pb-24">
      <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-stone-100 via-slate-100 to-stone-200">
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_30%_40%,rgba(120,53,15,0.08),transparent_45%),radial-gradient(circle_at_70%_65%,rgba(69,26,3,0.06),transparent_40%)]" />
        <div className="absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-950/20 ring-2 ring-white/70" />
        <div className="absolute top-6 right-4 h-12 w-12 rounded-full bg-white/80 shadow-lg ring-1 ring-slate-200/80" />
        <div className="absolute top-6 left-4 h-12 w-24 rounded-full bg-white/80 shadow-lg ring-1 ring-slate-200/80" />
        <div className="absolute right-4 bottom-24 flex flex-col gap-3 sm:bottom-28">
          <div className="h-12 w-12 rounded-full bg-white/80 shadow-lg ring-1 ring-slate-200/80" />
          <div className="h-12 w-12 rounded-full bg-white/80 shadow-lg ring-1 ring-slate-200/80" />
          <div className="h-12 w-12 rounded-full bg-white/80 shadow-lg ring-1 ring-slate-200/80" />
        </div>
      </div>
    </div>
  );
}
