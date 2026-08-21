import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const url = `${import.meta.env.BASE_URL}sw.js`;
    void navigator.serviceWorker.register(url).catch(() => undefined);
  }, []);
  return null;
}
