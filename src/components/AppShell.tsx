"use client";

import { FavoritesProvider } from "@/hooks/useFavorites";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { isOnboardingPath } from "@/lib/onboarding";
import { usePathname } from "@/i18n/navigation";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function AppShell({ children }: Props) {
  const pathname = usePathname();
  const onboarding = isOnboardingPath(pathname);

  if (onboarding) {
    return (
      <FavoritesProvider>
        <div className="flex min-h-full flex-1 flex-col">{children}</div>
      </FavoritesProvider>
    );
  }

  return (
    <FavoritesProvider>
      <Header />
      <div className="flex min-h-full flex-1 flex-col pt-14 pb-20 sm:pt-16 sm:pb-24">
        {children}
      </div>
      <Navigation />
    </FavoritesProvider>
  );
}
