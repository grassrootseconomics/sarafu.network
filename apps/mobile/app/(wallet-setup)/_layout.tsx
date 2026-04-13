import { Stack } from "expo-router";
import { WalletSetupProvider } from "@/lib/wallet-setup-context";

export default function WalletSetupLayout() {
  return (
    <WalletSetupProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
    </WalletSetupProvider>
  );
}
