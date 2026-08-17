"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "@/i18n/navigation";

type UIContextValue = {
  isAtmosphericMode: boolean;
  setAtmosphericMode: (value: boolean) => void;
};

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isAtmosphericMode, setIsAtmosphericMode] = useState(false);

  const setAtmosphericMode = useCallback((value: boolean) => {
    setIsAtmosphericMode(value);
  }, []);

  useEffect(() => {
    setIsAtmosphericMode(false);
  }, [pathname]);

  const value = useMemo(
    () => ({ isAtmosphericMode, setAtmosphericMode }),
    [isAtmosphericMode, setAtmosphericMode],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within UIProvider");
  }
  return context;
}
