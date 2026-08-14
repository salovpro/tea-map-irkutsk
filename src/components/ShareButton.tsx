"use client";

import { Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

type ShareButtonProps = {
  variant?: "fab" | "icon";
};

export function ShareButton({ variant = "icon" }: ShareButtonProps) {
  const t = useTranslations("ShareButton");
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (!toastVisible) return;

    const timer = window.setTimeout(() => setToastVisible(false), 2500);
    return () => window.clearTimeout(timer);
  }, [toastVisible]);

  const copyLinkFallback = useCallback(async () => {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }

    setToastVisible(true);
  }, []);

  const handleShare = useCallback(async () => {
    const url = window.location.href;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: t("title"),
          text: t("text"),
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    await copyLinkFallback();
  }, [copyLinkFallback, t]);

  const buttonClass =
    variant === "fab"
      ? "fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-amber-950 text-slate-50 shadow-md transition-colors hover:bg-amber-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-950"
      : "flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-amber-900/20 hover:text-amber-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-950";

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        aria-label={t("ariaLabel")}
        className={buttonClass}
      >
        <Share2
          className={variant === "fab" ? "h-5 w-5" : "h-4 w-4"}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>

      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm text-slate-50 shadow-lg transition-all duration-300 ${
          toastVisible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        {t("copied")}
      </div>
    </>
  );
}
