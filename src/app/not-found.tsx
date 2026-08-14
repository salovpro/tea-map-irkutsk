import Link from "next/link";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export default function NotFound() {
  return (
    <html lang="ru" className={fontVariables}>
      <body className="bg-slate-50 font-sans text-slate-900">
        <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center gap-6 px-6 text-center">
          <h1 className="font-serif text-2xl font-semibold text-slate-900">
            404
          </h1>
          <p className="text-slate-500">Страница не найдена</p>
          <Link
            href="/"
            className="text-sm font-medium text-amber-950 underline-offset-4 hover:underline"
          >
            На главную
          </Link>
        </div>
      </body>
    </html>
  );
}
