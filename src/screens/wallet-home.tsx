import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Eye, EyeOff, Plus } from "lucide-react";
import { CoinIcon } from "@/components/coin-icon";
import { WalletShell } from "@/components/wallet-shell";
import { useMarketMap, useMarkets } from "@/hooks/use-markets";
import { COIN_BY_ID } from "@/lib/coins";
import { formatAmount, formatPct, formatUsdFull } from "@/lib/format";
import { t } from "@/lib/i18n";
import { useSite } from "@/lib/site-store";
import { useWallet } from "@/lib/store";
import { cn } from "@/lib/utils";

export function WalletHomeScreen() {
  const holdings = useWallet((s) => s.holdings);
  const hide = useWallet((s) => s.hideBalances);
  const toggle = useWallet((s) => s.toggleHideBalances);
  const profile = useWallet((s) => s.profile);
  const site = useSite();
  const walletName = site.walletName;
  const copy = t();
  const markets = useMarketMap();
  const q = useMarkets();
  const [qtext, setQtext] = useState("");

  const kycIncomplete =
    !profile.firstName || !profile.lastName || !profile.phone || !profile.nationalId || !profile.licensePhoto;

  const rows = useMemo(() => {
    return holdings
      .map((h) => {
        const meta = COIN_BY_ID[h.id];
        const m = markets[h.id];
        const price = m?.price ?? 0;
        return {
          ...h,
          meta,
          price,
          usd: h.amount * price,
          change: m?.change24h ?? 0,
          image: m?.image ?? meta?.image,
        };
      })
      .filter((r) => r.meta)
      .sort((a, b) => b.usd - a.usd);
  }, [holdings, markets]);

  const total = rows.reduce((s, r) => s + r.usd, 0);
  const changeUsd = rows.reduce((s, r) => s + r.usd * (r.change / 100), 0);
  const changePct = total > 0 ? (changeUsd / (total - changeUsd)) * 100 : 0;
  const filtered = rows.filter((r) => {
    const tq = qtext.trim().toLowerCase();
    if (!tq) return true;
    return (
      r.meta!.name.toLowerCase().includes(tq) ||
      r.meta!.symbol.toLowerCase().includes(tq)
    );
  });

  return (
    <WalletShell title={walletName}>
      <div className="mx-auto w-full max-w-xl px-4 py-8 md:max-w-2xl md:py-10">
        {kycIncomplete ? (
          <Link
            to="/wallet/profile"
            className="mb-6 flex items-center justify-between gap-3 rounded-xl bg-accent-soft px-4 py-3 text-sm text-primary"
          >
            <span>{copy.wallet.kycBanner}</span>
            <span className="shrink-0 font-medium">{copy.wallet.kycCta}</span>
          </Link>
        ) : null}

        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs tracking-wide text-muted uppercase">{walletName}</p>
            <p className="mt-2 font-display text-4xl font-semibold tracking-tight tabular">
              {hide ? "••••••" : q.isLoading && total === 0 ? "—" : formatUsdFull(total)}
            </p>
            <p className={cn("mt-2 text-sm tabular", changePct >= 0 ? "text-success" : "text-danger")}>
              {hide ? "" : `${changePct >= 0 ? "+" : ""}${formatUsdFull(changeUsd)} (${formatPct(changePct)})`}
            </p>
          </div>
          <button
            type="button"
            onClick={toggle}
            className="inline-flex size-11 items-center justify-center rounded-full text-muted shadow-border"
            aria-label={hide ? copy.wallet.show : copy.wallet.hide}
          >
            {hide ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        <div className="mt-8 grid grid-cols-4 gap-2">
          {[
            { to: "/wallet/send", icon: ArrowUpRight, label: site.actionSend },
            { to: "/wallet/receive", icon: ArrowDownLeft, label: site.actionReceive },
            { to: "/wallet/swap", icon: ArrowLeftRight, label: site.tabSwap },
            { to: "/wallet/buy", icon: Plus, label: site.actionBuy },
          ].map((a) => (
            <Link key={a.to} to={a.to} className="flex flex-col items-center gap-2">
              <span className="flex size-14 items-center justify-center rounded-full bg-card-elevated shadow-border">
                <a.icon className="size-5" />
              </span>
              <span className="text-xs text-muted">{a.label}</span>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">{copy.wallet.assets}</h2>
        </div>
        <input
          value={qtext}
          onChange={(e) => setQtext(e.target.value)}
          placeholder={copy.wallet.search}
          className="mt-3 h-11 w-full rounded-md bg-card px-3 text-sm shadow-border outline-none placeholder:text-muted"
        />

        <div className="mt-4 divide-y divide-border">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">{copy.wallet.empty}</p>
          ) : (
            filtered.map((r) => (
              <Link
                key={r.id}
                to="/wallet/asset/$id"
                params={{ id: r.id }}
                className="flex items-center gap-3 py-4"
              >
                <CoinIcon id={r.id} symbol={r.meta!.symbol} image={r.image} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{r.meta!.name}</span>
                    <span className="tabular">{hide ? "••" : formatUsdFull(r.usd)}</span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-xs text-muted">
                    <span className="tabular">
                      {hide ? "••" : formatAmount(r.amount)} {r.meta!.symbol}
                    </span>
                    <span className={r.change >= 0 ? "text-success" : "text-danger"}>{formatPct(r.change)}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </WalletShell>
  );
}
