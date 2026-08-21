"use client";

import { useEffect } from "react";

/**
 * Production PWA used to cache map JS aggressively. After a deploy, force the
 * waiting worker to take over and reload once so users are not stuck on an
 * old Map.tsx bundle.
 */
export function useServiceWorkerRefresh() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let reloading = false;
    function onControllerChange() {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    }

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        void registration.update();
      }
    });

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);
}
