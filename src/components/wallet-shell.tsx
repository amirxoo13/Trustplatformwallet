import type { ReactNode } from "react";
import { Link, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowLeftRight,
  Clock3,
  Home,
  LogOut,
  Settings,
  SlidersHorizontal,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import { t } from "@/lib/i18n";
import { useSite } from "@/lib/site-store";
import { useWallet } from "@/lib/store";
import { cn } from "@/lib/utils";

export function WalletShell({ children, title }: { children: ReactNode; title?: string }) {
  const logout = useWallet((s) => s.logout);
  const copy = t();
  const site = useSite();
  const role = useWallet((s) => s.role);
  const navigate = useNavigate();
  const router = useRouter();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isHome = path === "/wallet" || path === "/wallet/";
  const backTo = isHome ? "/" : "/wallet";

  function goBack() {
    const idx = (window.history.state as { idx?: number } | null)?.idx;
    if (typeof idx === "number" && idx > 0) {
      router.history.back();
      return;
    }
    void navigate({ to: backTo });
  }

  const items = [
    { to: "/wallet", icon: Home, label: site.tabHome, match: (p: string) => p === "/wallet" || p === "/wallet/" },
    { to: "/wallet/markets", icon: TrendingUp, label: site.tabMarkets, match: (p: string) => p.startsWith("/wallet/markets") },
    { to: "/wallet/swap", icon: ArrowLeftRight, label: site.tabSwap, match: (p: string) => p.startsWith("/wallet/swap") },
    { to: "/wallet/activity", icon: Clock3, label: site.tabActivity, match: (p: string) => p.startsWith("/wallet/activity") },
    { to: "/wallet/profile", icon: UserRound, label: site.tabProfile, match: (p: string) => p.startsWith("/wallet/profile") },
  ];

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-6xl">
        <aside className="sticky top-0 hidden h-dvh w-[88px] shrink-0 flex-col items-center border-e border-border py-5 md:flex">
          <Link to="/wallet" className="mb-6">
            <LogoMark size={32} />
          </Link>
          <nav className="flex flex-1 flex-col gap-1">
            {items.map((item) => {
              const active = item.match(path);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex size-14 flex-col items-center justify-center gap-1 rounded-lg text-[10px] text-muted transition-colors duration-150",
                    active && "bg-card text-foreground",
                  )}
                >
                  <item.icon className="size-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {role === "admin" ? (
            <Link
              to="/studio"
              className={cn(
                "flex size-14 items-center justify-center rounded-lg text-muted",
                path.startsWith("/studio") && "bg-card text-foreground",
              )}
              aria-label="Control panel"
            >
              <SlidersHorizontal className="size-5" />
            </Link>
          ) : null}
          <Link
            to="/wallet/settings"
            className={cn(
              "flex size-14 items-center justify-center rounded-lg text-muted",
              path.startsWith("/wallet/settings") && "bg-card text-foreground",
            )}
          >
            <Settings className="size-5" />
          </Link>
          <button
            type="button"
            className="mt-1 flex size-14 items-center justify-center rounded-lg text-muted"
            onClick={() => {
              logout();
              void navigate({ to: "/" });
            }}
            aria-label={copy.wallet.logout}
          >
            <LogOut className="size-5" />
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
          {title ? (
            <div className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md">
              <div className="flex min-w-0 flex-1 items-center gap-1">
                <button type="button" onClick={goBack} className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted" aria-label="Back">
                  <ArrowLeft className="size-5" />
                </button>
                <p className="truncate font-display text-sm font-semibold">{title}</p>
              </div>
              {role === "admin" ? (
                <Link to="/studio" className="inline-flex size-11 items-center justify-center rounded-md text-muted" aria-label="Control panel">
                  <SlidersHorizontal className="size-5" />
                </Link>
              ) : null}
            </div>
          ) : null}
          <div className="flex-1">{children}</div>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        {items.map((item) => {
          const active = item.match(path);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] text-muted",
                active && "text-foreground",
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
