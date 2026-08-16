import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { ADMIN_BASE_PATH } from "@/lib/admin-constants";
import { hasAdminSession } from "@/lib/admin-session";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  if (await hasAdminSession()) {
    redirect(`${ADMIN_BASE_PATH}/venues`);
  }

  return (
    <AdminShell authed={false}>
      <main className="flex flex-1 flex-col justify-center gap-6 py-16">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-semibold text-slate-900">
            Доступ
          </h1>
        </div>
        <AdminLoginForm />
      </main>
    </AdminShell>
  );
}
