import { Stack } from "expo-router";
import { OfferVoucherProvider } from "@/lib/offer-voucher-context";

export default function OnboardingLayout() {
  return (
    <OfferVoucherProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          gestureEnabled: false,
        }}
      />
    </OfferVoucherProvider>
  );
}
