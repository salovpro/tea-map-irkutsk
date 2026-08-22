import { ADMIN_BASE_PATH } from "@/lib/admin-constants";
import { hasAdminSession } from "@/lib/admin-session";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default async function AdminVenuesLayout({ children }: Props) {
  if (!(await hasAdminSession())) {
    redirect(ADMIN_BASE_PATH);
  }

  return children;
}
