"use client";

import { createReview, type CreateReviewState } from "@/app/actions/reviews";
import { useLocale, useTranslations } from "next-intl";
import { useActionState, useEffect, useRef } from "react";

type ReviewFormProps = {
  placeId: string;
  onSuccess?: () => void;
};

const initialState: CreateReviewState = { ok: false };

export function ReviewForm({ placeId, onSuccess }: ReviewFormProps) {
  const t = useTranslations("PlaceDetail");
  const locale = useLocale();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    createReview,
    initialState,
  );

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state.ok, onSuccess]);

  const errorMessage =
    state.error === "missing_place"
      ? t("errors.missing_place")
      : state.error === "invalid_name"
        ? t("errors.invalid_name")
        : state.error === "invalid_text"
          ? t("errors.invalid_text")
          : state.error === "invalid_rating"
            ? t("errors.invalid_rating")
            : state.error === "server"
              ? t("errors.server")
              : null;

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-6 sm:p-8"
    >
      <input type="hidden" name="placeId" value={placeId} />
      <input type="hidden" name="locale" value={locale} />

      <h3 className="font-serif text-lg font-semibold tracking-tight text-slate-900">
        {t("reviewFormTitle")}
      </h3>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-slate-900">{t("reviewName")}</span>
        <input
          type="text"
          name="authorName"
          required
          minLength={2}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-colors focus:border-amber-900/40"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-slate-900">{t("reviewRating")}</span>
        <select
          name="rating"
          defaultValue="5"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-colors focus:border-amber-900/40"
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-slate-900">{t("reviewText")}</span>
        <textarea
          name="text"
          required
          minLength={5}
          rows={4}
          className="resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-colors focus:border-amber-900/40"
        />
      </label>

      {errorMessage ? (
        <p className="text-sm text-red-700">{errorMessage}</p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-amber-900">{t("reviewSuccess")}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-amber-950 px-6 py-4 text-sm font-medium tracking-wide text-slate-50 transition-colors hover:bg-amber-900 disabled:opacity-60"
      >
        {pending ? t("reviewSubmitting") : t("reviewSubmit")}
      </button>
    </form>
  );
}
