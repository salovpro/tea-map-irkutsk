import { adminLogout } from "@/app/actions/admin";
import { ADMIN_BASE_PATH } from "@/lib/admin-constants";
import Link from "next/link";
import type { ReactNode } from "react";

export function AdminShell({
  children,
  authed,
}: {
  children: ReactNode;
  authed: boolean;
}) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-4 py-8 sm:px-6">
      {authed ? (
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <Link
              href={`${ADMIN_BASE_PATH}/venues`}
              className="text-slate-900 hover:underline"
            >
              Заведения
            </Link>
            <Link
              href={`${ADMIN_BASE_PATH}/venues/new`}
              className="text-slate-600 hover:text-slate-900"
            >
              + Новое
            </Link>
          </nav>
          <form action={adminLogout}>
            <button
              type="submit"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Выйти
            </button>
          </form>
        </header>
      ) : null}
      {children}
    </div>
  );
}
