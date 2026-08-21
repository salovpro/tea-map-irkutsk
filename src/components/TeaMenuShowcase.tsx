"use client";

import { useUI } from "@/context/UIContext";
import type { PlaceSheetTeaItem } from "@/lib/places";
import { useEffect, useRef } from "react";

type TeaMenuShowcaseProps = {
  title: string;
  emptyText: string;
  items: PlaceSheetTeaItem[];
};

export function TeaMenuShowcase({
  title,
  emptyText,
  items,
}: TeaMenuShowcaseProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { setAtmosphericMode } = useUI();

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setAtmosphericMode(entry.isIntersecting);
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      setAtmosphericMode(false);
    };
  }, [setAtmosphericMode]);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 -mt-6 w-full rounded-t-3xl shadow-2xl"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-t-3xl bg-[url('/forest-bg.jpg')] bg-fixed bg-cover bg-center bg-no-repeat"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-t-3xl bg-slate-900/50"
      />

      <div className="relative z-10 mx-auto w-full max-w-2xl pt-14 sm:pt-16">
        <h2
          className="font-serif mb-8 px-6 text-center text-3xl font-semibold tracking-tight text-white md:text-5xl"
          style={{
            textShadow:
              "0 2px 24px rgba(0,0,0,0.55), 0 0 40px rgba(253,230,138,0.18)",
          }}
        >
          {title}
        </h2>

        {items.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 px-6 pb-12 md:grid-cols-2">
            {items.map((item, index) => (
              <li
                key={`${item.title}-${index}`}
                className="flex h-full w-full flex-col gap-3 rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-md"
              >
                {item.category ? (
                  <p className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-gray-300">
                    {item.category}
                  </p>
                ) : null}

                <p className="font-serif text-xl font-semibold leading-snug text-white sm:text-2xl">
                  {item.title}
                </p>

                {item.description ? (
                  <p className="font-sans text-sm leading-relaxed text-gray-300">
                    {item.description}
                  </p>
                ) : null}

                <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                  {item.volume ? (
                    <span className="font-sans text-sm text-amber-100/90">
                      {item.volume}
                    </span>
                  ) : (
                    <span />
                  )}
                  {item.price != null ? (
                    <span className="font-sans text-lg font-medium tracking-wide text-amber-200">
                      {item.price} ₽
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-6 pb-12 text-center font-sans text-sm text-gray-300">
            {emptyText}
          </p>
        )}
      </div>
    </section>
  );
}
