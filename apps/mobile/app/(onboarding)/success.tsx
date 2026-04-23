import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useOfferVoucher } from "@/lib/offer-voucher-context";

export default function SuccessScreen() {
  const router = useRouter();
  const { deployResult } = useOfferVoucher();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <FontAwesome name="trophy" size={64} color="#16a34a" />
        <Text style={styles.title}>Your voucher is live!</Text>
        <Text style={styles.subtitle}>
          {deployResult
            ? `${deployResult.voucherName} has been published on the network.`
            : "Your profile is set up and your wallet is ready."}
        </Text>

        {deployResult && (
          <View style={styles.checklist}>
            <View style={styles.checkItem}>
              <FontAwesome name="check-circle" size={16} color="#16a34a" />
              <Text style={styles.checkText}>Offer listed on marketplace</Text>
            </View>
            <View style={styles.checkItem}>
              <FontAwesome name="check-circle" size={16} color="#16a34a" />
              <Text style={styles.checkText}>Voucher published on network</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/(tabs)" as Href)}
        >
          <Text style={styles.primaryButtonText}>Go to Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace("/(tabs)/vouchers" as Href)}
        >
          <Text style={styles.secondaryButtonText}>View Vouchers</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 24 },
  content: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  title: { fontSize: 28, fontWeight: "700", color: "#111" },
  subtitle: { fontSize: 16, color: "#6b7280", textAlign: "center", lineHeight: 24, paddingHorizontal: 16 },
  checklist: { gap: 10, marginTop: 16, alignSelf: "stretch", paddingHorizontal: 32 },
  checkItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkText: { fontSize: 15, color: "#374151" },
  actions: { gap: 12, paddingBottom: 16 },
  primaryButton: { backgroundColor: "#16a34a", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  primaryButtonText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  secondaryButton: { paddingVertical: 14, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#d1d5db" },
  secondaryButtonText: { color: "#374151", fontSize: 16, fontWeight: "500" },
});
