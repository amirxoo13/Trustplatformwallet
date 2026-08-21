import { useEffect } from "react";
import { useLoginWindow } from "@/lib/login-window";
import { useSite } from "@/lib/site-store";
import { useWallet } from "@/lib/store";

export function PersistHydrate() {
  useEffect(() => {
    void useWallet.persist.rehydrate();
    void useSite.persist.rehydrate();
    void useLoginWindow.persist.rehydrate();
  }, []);
  return null;
}
