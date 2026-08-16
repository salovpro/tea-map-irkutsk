"use client";

import { adminLogin, type AdminActionState } from "@/app/actions/admin";
import { useActionState } from "react";

const initial: AdminActionState = { ok: false };

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(adminLogin, initial);

  return (
    <form action={action} className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-slate-800">Код доступа</span>
        <input
          type="password"
          name="code"
          autoComplete="off"
          required
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
          placeholder="••••••••••••"
        />
      </label>

      {state.error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? "Проверка…" : "Войти"}
      </button>
    </form>
  );
}
