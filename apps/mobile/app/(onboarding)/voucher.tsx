import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StepProgress } from "@/components/step-progress";
import { useOfferVoucher } from "@/lib/offer-voucher-context";

// Only GIFTABLE is supported on mobile for now (GIFTABLE_EXPIRING and DEMURRAGE
// require additional fields not yet implemented in the mobile flow)

export default function VoucherScreen() {
  const router = useRouter();
  const { state, setVoucher } = useOfferVoucher();

  const [name, setName] = useState(state.voucher?.name ?? "");
  const [shopDescription, setShopDescription] = useState(state.voucher?.shopDescription ?? "");
  const [value, setValue] = useState(state.voucher?.value?.toString() ?? "");
  const [symbol, setSymbol] = useState(state.voucher?.symbol ?? "");
  const [supply, setSupply] = useState(state.voucher?.supply?.toString() ?? "1000");
  const [contactEmail, setContactEmail] = useState(state.voucher?.contactEmail ?? "");
  const [location, setLocation] = useState(state.voucher?.location ?? "");

  function handleNameChange(text: string) {
    setName(text);
    if (text.trim()) {
      const firstWord = text.trim().split(/\s+/)[0] ?? "";
      setSymbol(firstWord.toUpperCase().slice(0, 6));
    }
  }

  function handleNext() {
    const trimmedName = name.trim();
    const trimmedDesc = shopDescription.trim();
    const valueNum = parseInt(value, 10);
    const supplyNum = parseInt(supply, 10);
    const trimmedSymbol = symbol.trim().toUpperCase();

    if (trimmedName.length < 3 || trimmedName.length > 32) {
      Alert.alert("Invalid", "Voucher name must be 3-32 characters.");
      return;
    }
    if (trimmedDesc.length < 3 || trimmedDesc.length > 256) {
      Alert.alert("Invalid", "Description must be 3-256 characters.");
      return;
    }
    if (isNaN(valueNum) || valueNum <= 0 || !Number.isInteger(valueNum)) {
      Alert.alert("Invalid", "Value must be a positive whole number.");
      return;
    }
    if (!trimmedSymbol || trimmedSymbol.length > 6) {
      Alert.alert("Invalid", "Symbol must be 1-6 characters.");
      return;
    }

    setVoucher({
      name: trimmedName,
      shopDescription: trimmedDesc,
      value: valueNum,
      uoa: state.pricing?.currency ?? "USD",
      symbol: trimmedSymbol,
      supply: isNaN(supplyNum) || supplyNum <= 0 ? 1000 : supplyNum,
      contactEmail: contactEmail.trim(),
      location: location.trim(),
      voucherType: "GIFTABLE",
    });

    router.push("/(onboarding)/confirm" as Href);
  }

  function handleSkip() {
    router.replace("/(tabs)" as Href);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <StepProgress steps={5} activeStep={3} />

          <Text style={styles.title}>Your Voucher</Text>
          <Text style={styles.subtitle}>
            Configure your community voucher that backs your offer.
          </Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Voucher Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={handleNameChange}
                placeholder="e.g. John's Voucher"
                placeholderTextColor="#9ca3af"
                maxLength={32}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                value={shopDescription}
                onChangeText={setShopDescription}
                placeholder="Describe what your voucher can be used for..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={256}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Value *</Text>
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={setValue}
                  placeholder="e.g. 100"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Symbol *</Text>
                <TextInput
                  style={styles.input}
                  value={symbol}
                  onChangeText={(t) => setSymbol(t.toUpperCase())}
                  placeholder="e.g. JHN"
                  placeholderTextColor="#9ca3af"
                  maxLength={6}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Total Supply</Text>
              <TextInput
                style={styles.input}
                value={supply}
                onChangeText={setSupply}
                placeholder="1000"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Contact Email</Text>
              <TextInput
                style={styles.input}
                value={contactEmail}
                onChangeText={setContactEmail}
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="City, Country"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  flex: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "700", color: "#111", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 15, color: "#6b7280", lineHeight: 22, marginBottom: 24, textAlign: "center" },
  form: { gap: 16, marginBottom: 24 },
  row: { flexDirection: "row", gap: 12 },
  halfField: { flex: 1, gap: 6 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: "500", color: "#374151" },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, padding: 14, fontSize: 16, color: "#111", backgroundColor: "#f9fafb" },
  multiline: { minHeight: 80 },
  buttons: { flexDirection: "row", gap: 12, marginBottom: 12 },
  backButton: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#d1d5db" },
  backButtonText: { color: "#374151", fontSize: 17, fontWeight: "600" },
  nextButton: { flex: 1, backgroundColor: "#16a34a", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  nextButtonText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  skipButton: { alignItems: "center", paddingVertical: 12 },
  skipButtonText: { color: "#6b7280", fontSize: 15 },
});
