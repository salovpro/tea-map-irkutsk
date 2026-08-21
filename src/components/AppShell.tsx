"use client";

import { FavoritesProvider } from "@/hooks/useFavorites";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { UIProvider } from "@/context/UIContext";
import { useServiceWorkerRefresh } from "@/hooks/useServiceWorkerRefresh";
import { isOnboardingPath, isPublicLegalPath } from "@/lib/onboarding";
import { usePathname } from "@/i18n/navigation";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function AppShell({ children }: Props) {
  useServiceWorkerRefresh();
  const pathname = usePathname();
  const onboarding = isOnboardingPath(pathname);
  const legal = isPublicLegalPath(pathname);
  const isMapHome = pathname === "/";

  if (onboarding || legal) {
    return (
      <UIProvider>
        <FavoritesProvider>
          <div className="flex min-h-full flex-1 flex-col">{children}</div>
        </FavoritesProvider>
      </UIProvider>
    );
  }

  return (
    <UIProvider>
      <FavoritesProvider>
        <Header />
        <div
          className={
            isMapHome
              ? "flex min-h-full flex-1 flex-col pb-[calc(var(--app-nav-height)+env(safe-area-inset-bottom,0px))]"
              : "flex min-h-full flex-1 flex-col pt-14 pb-[calc(var(--app-nav-height)+env(safe-area-inset-bottom,0px)+1rem)] sm:pt-16"
          }
        >
          {children}
        </div>
        <Navigation />
      </FavoritesProvider>
    </UIProvider>
  );
}
