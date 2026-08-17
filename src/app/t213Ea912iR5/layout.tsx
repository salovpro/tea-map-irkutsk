import { fontVariables } from "@/lib/fonts";
import type { ReactNode } from "react";
import "../globals.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

type Props = {
  children: ReactNode;
};

export default function AdminRootLayout({ children }: Props) {
  return (
    <html lang="ru" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full bg-slate-100 font-sans text-slate-900">
        {children}
      </body>
    </html>
  );
}
