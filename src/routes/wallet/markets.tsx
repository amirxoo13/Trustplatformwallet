import { createFileRoute } from "@tanstack/react-router";
import { WalletShell } from "@/components/wallet-shell";
import { MarketsScreen } from "@/screens/markets";
import { t } from "@/lib/i18n";

export const Route = createFileRoute("/wallet/markets")({
  component: WalletMarketsPage,
});

function WalletMarketsPage() {
  return (
    <WalletShell title={t().wallet.markets}>
      <MarketsScreen embedded />
    </WalletShell>
  );
}
