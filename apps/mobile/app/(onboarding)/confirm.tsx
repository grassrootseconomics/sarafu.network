import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { StepProgress } from "@/components/step-progress";
import { useOfferVoucher } from "@/lib/offer-voucher-context";
import { trpc } from "@/lib/trpc";

export default function ConfirmScreen() {
  const router = useRouter();
  const { state, setDeployResult, clearDraft } = useOfferVoucher();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [pathAccepted, setPathAccepted] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState("");

  const deploy = trpc.voucher.deploy.useMutation({
    onSuccess: (data) => {
      setIsDeploying(false);
      if (data && typeof data === "object" && "address" in data) {
        const result = data as { address: string; txHash?: string };
        setDeployResult({
          address: result.address,
          txHash: result.txHash,
          voucherName: state.voucher?.name ?? "",
          offerName: state.offer?.name ?? "",
          currency: state.pricing?.currency ?? "",
        });
        clearDraft();
        router.replace("/(onboarding)/success" as Href);
      }
    },
    onError: (error) => {
      setIsDeploying(false);
      setDeployStatus("");
      Alert.alert("Deployment Failed", error.message);
    },
  });

  const { offer, pricing, voucher } = state;
  const hasOffer = offer?.name && offer?.description;
  const hasPricing = pricing?.currency && pricing?.price && pricing?.unit;
  const hasVoucher = voucher?.name && voucher?.shopDescription && voucher?.value && voucher?.symbol;

  function handleDeploy() {
    if (!hasOffer || !hasPricing || !hasVoucher) {
      Alert.alert("Incomplete", "Please go back and complete all steps before deploying.");
      return;
    }
    if (!termsAccepted || !pathAccepted) {
      Alert.alert("Consent Required", "You must accept both the Terms & Conditions and PATH License.");
      return;
    }

    setIsDeploying(true);
    setDeployStatus("Deploying your voucher...");

    deploy.mutate({
      name: voucher!.name!,
      description: voucher!.shopDescription!,
      symbol: voucher!.symbol!,
      uoa: voucher!.uoa ?? pricing!.currency!,
      value: voucher!.value!,
      supply: voucher!.supply ?? 1000,
      email: voucher!.contactEmail ?? "",
      location: voucher!.location ?? undefined,
      expiration: { type: voucher!.voucherType ?? "GIFTABLE" },
      products: [
        {
          name: offer!.name!,
          description: offer!.description,
          quantity: pricing!.quantity ?? 1,
          frequency: pricing!.frequency ?? "month",
          price: pricing!.price,
          unit: pricing!.unit,
          categories: offer!.categories ?? [],
        },
      ],
      termsAndConditions: true,
      pathLicense: true,
    });
  }

  function handleSkip() {
    router.replace("/(tabs)" as Href);
  }

  if (isDeploying) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.deployingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.deployingText}>{deployStatus}</Text>
          <Text style={styles.deployingHint}>
            This may take a minute. Please don't close the app.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <StepProgress steps={5} activeStep={4} />

        <Text style={styles.title}>Confirm & Publish</Text>
        <Text style={styles.subtitle}>
          Review your details and deploy your voucher to the network.
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Offer</Text>
            <Text style={styles.summaryValue}>{offer?.name ?? "Not set"}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Price</Text>
            <Text style={styles.summaryValue}>
              {pricing?.price ?? "?"} {pricing?.currency ?? ""} / {pricing?.unit ?? "unit"}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Voucher</Text>
            <Text style={styles.summaryValue}>
              {voucher?.name ?? "Not set"} ({voucher?.symbol ?? "?"})
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Value</Text>
            <Text style={styles.summaryValue}>
              {voucher?.value ?? "?"} {voucher?.uoa ?? pricing?.currency ?? ""}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Supply</Text>
            <Text style={styles.summaryValue}>{voucher?.supply ?? 1000}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Type</Text>
            <Text style={styles.summaryValue}>{voucher?.voucherType ?? "GIFTABLE"}</Text>
          </View>

          {(!hasOffer || !hasPricing || !hasVoucher) && (
            <View style={styles.warningBanner}>
              <FontAwesome name="exclamation-triangle" size={14} color="#b45309" />
              <Text style={styles.warningText}>
                Some steps are incomplete. Go back to fill in missing fields.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.consentSection}>
          <View style={styles.consentRow}>
            <Switch
              value={termsAccepted}
              onValueChange={setTermsAccepted}
              trackColor={{ false: "#d1d5db", true: "#86efac" }}
              thumbColor={termsAccepted ? "#16a34a" : "#f4f3f4"}
            />
            <TouchableOpacity
              onPress={() => Linking.openURL("https://grassecon.org/pages/terms-and-conditions")}
            >
              <Text style={styles.consentText}>
                Accept <Text style={styles.consentLink}>Terms & Conditions</Text>
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.consentRow}>
            <Switch
              value={pathAccepted}
              onValueChange={setPathAccepted}
              trackColor={{ false: "#d1d5db", true: "#86efac" }}
              thumbColor={pathAccepted ? "#16a34a" : "#f4f3f4"}
            />
            <TouchableOpacity
              onPress={() => Linking.openURL("https://docs.grassecon.org/commons/path/")}
            >
              <Text style={styles.consentText}>
                Accept <Text style={styles.consentLink}>PATH License</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deployButton, (!termsAccepted || !pathAccepted) && styles.disabledButton]}
            onPress={handleDeploy}
            disabled={!termsAccepted || !pathAccepted}
          >
            <Text style={styles.deployButtonText}>Create My Voucher!</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "700", color: "#111", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 15, color: "#6b7280", lineHeight: 22, marginBottom: 24, textAlign: "center" },
  summaryCard: { backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 16, gap: 10, marginBottom: 24 },
  summaryTitle: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 4 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 14, color: "#6b7280" },
  summaryValue: { fontSize: 14, fontWeight: "500", color: "#111", maxWidth: "60%", textAlign: "right" },
  warningBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fffbeb", borderWidth: 1, borderColor: "#fde68a", borderRadius: 8, padding: 10, marginTop: 8 },
  warningText: { fontSize: 13, color: "#92400e", flex: 1 },
  consentSection: { gap: 16, marginBottom: 24 },
  consentRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  consentText: { fontSize: 14, color: "#374151", flex: 1 },
  consentLink: { color: "#16a34a", textDecorationLine: "underline" },
  buttons: { flexDirection: "row", gap: 12, marginBottom: 12 },
  backButton: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#d1d5db" },
  backButtonText: { color: "#374151", fontSize: 17, fontWeight: "600" },
  deployButton: { flex: 1, backgroundColor: "#16a34a", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  deployButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  disabledButton: { opacity: 0.5 },
  skipButton: { alignItems: "center", paddingVertical: 12 },
  skipButtonText: { color: "#6b7280", fontSize: 15 },
  deployingContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  deployingText: { fontSize: 17, fontWeight: "600", color: "#111", marginTop: 16 },
  deployingHint: { fontSize: 14, color: "#6b7280", marginTop: 8, textAlign: "center" },
});
