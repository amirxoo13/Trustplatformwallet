import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Plus } from "lucide-react";
import { CoinIcon } from "@/components/coin-icon";

const rows = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", amt: "0.0524", usd: "$5,142.80", ch: "+2.14%", up: true },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", amt: "1.2841", usd: "$3,210.04", ch: "+1.02%", up: true },
  { id: "solana", symbol: "SOL", name: "Solana", amt: "18.35", usd: "$2,641.20", ch: "−0.84%", up: false },
  { id: "tether", symbol: "USDT", name: "Tether", amt: "2,480", usd: "$2,480.00", ch: "0.00%", up: true },
];

export function PhonePreview() {
  return (
    <div className="phone-frame relative mx-auto w-[300px] shrink-0">
      <div className="absolute -inset-8 rounded-[3rem] bg-primary/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-[2.2rem] bg-background shadow-float ring-1 ring-white/12">
        <div className="absolute inset-x-0 top-0 h-6 bg-background/50" />
        <div className="mx-auto mt-2 h-5 w-24 rounded-full bg-background" />
        <div className="px-5 pt-5 pb-6">
          <div className="flex items-center justify-between text-[11px] text-muted">
            <span>Main Wallet</span>
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-primary">Live</span>
          </div>
          <p className="mt-5 font-display text-[11px] tracking-wide text-muted uppercase">Total balance</p>
          <p className="mt-1 font-display text-[34px] leading-none font-semibold tracking-tight tabular">$14,280.16</p>
          <p className="mt-2 text-xs font-medium text-success tabular">+$186.40 (24h)</p>
          <div className="mt-6 grid grid-cols-4 gap-2">
            {[
              { icon: ArrowUpRight, label: "Send" },
              { icon: ArrowDownLeft, label: "Receive" },
              { icon: ArrowLeftRight, label: "Swap" },
              { icon: Plus, label: "Buy" },
            ].map((a) => (
              <div key={a.label} className="flex flex-col items-center gap-2">
                <div className="flex size-11 items-center justify-center rounded-full bg-card-elevated shadow-border">
                  <a.icon className="size-4" />
                </div>
                <span className="text-[10px] text-muted">{a.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3">
            {rows.map((r) => (
              <div key={r.symbol} className="flex items-center gap-3">
                <CoinIcon id={r.id} symbol={r.symbol} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-medium">{r.name}</span>
                    <span className="tabular">{r.usd}</span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-[11px] text-muted">
                    <span className="tabular">
                      {r.amt} {r.symbol}
                    </span>
                    <span className={r.up ? "text-success" : "text-danger"}>{r.ch}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
