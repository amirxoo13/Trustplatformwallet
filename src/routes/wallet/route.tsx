import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthGate } from "@/components/auth-gate";

export const Route = createFileRoute("/wallet")({
  component: WalletLayout,
});

function WalletLayout() {
  return (
    <AuthGate>
      <Outlet />
    </AuthGate>
  );
}
