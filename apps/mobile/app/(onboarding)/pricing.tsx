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

const FREQUENCY_OPTIONS = [
  { value: "day" as const, label: "Per day" },
  { value: "week" as const, label: "Per week" },
  { value: "month" as const, label: "Per month" },
  { value: "year" as const, label: "Per year" },
];

export default function PricingScreen() {
  const router = useRouter();
  const { state, setPricing } = useOfferVoucher();

  const [currency, setCurrency] = useState(state.pricing?.currency ?? "USD");
  const [price, setPrice] = useState(state.pricing?.price?.toString() ?? "");
  const [unit, setUnit] = useState(state.pricing?.unit ?? "unit");
  const [quantity, setQuantity] = useState(state.pricing?.quantity?.toString() ?? "1");
  const [frequency, setFrequency] = useState<"day" | "week" | "month" | "year">(
    state.pricing?.frequency ?? "month"
  );

  function handleNext() {
    const priceNum = parseFloat(price);
    const quantityNum = parseInt(quantity, 10);

    if (!currency.trim()) {
      Alert.alert("Required", "Please enter a currency.");
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Invalid", "Price must be a positive number.");
      return;
    }
    if (!unit.trim()) {
      Alert.alert("Required", "Please enter a unit.");
      return;
    }

    setPricing({
      currency: currency.trim(),
      price: priceNum,
      unit: unit.trim(),
      quantity: isNaN(quantityNum) || quantityNum < 0 ? 1 : quantityNum,
      frequency,
    });

    router.push("/(onboarding)/voucher" as Href);
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
          <StepProgress steps={5} activeStep={2} />

          <Text style={styles.title}>Price Your Offer</Text>
          <Text style={styles.subtitle}>
            Set the price and availability for your offer.
          </Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Currency *</Text>
              <TextInput
                style={styles.input}
                value={currency}
                onChangeText={setCurrency}
                placeholder="e.g. USD, KES"
                placeholderTextColor="#9ca3af"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Price *</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Per Unit *</Text>
                <TextInput
                  style={styles.input}
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="e.g. kg, hour, piece"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Quantity Available</Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="1"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Frequency</Text>
                <View style={styles.frequencyRow}>
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.frequencyChip,
                        frequency === opt.value && styles.frequencyChipActive,
                      ]}
                      onPress={() => setFrequency(opt.value)}
                    >
                      <Text
                        style={[
                          styles.frequencyChipText,
                          frequency === opt.value && styles.frequencyChipTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
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
  frequencyRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  frequencyChip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "#d1d5db", backgroundColor: "#f9fafb" },
  frequencyChipActive: { borderColor: "#16a34a", backgroundColor: "#f0fdf4" },
  frequencyChipText: { fontSize: 12, color: "#6b7280" },
  frequencyChipTextActive: { color: "#16a34a", fontWeight: "600" },
  buttons: { flexDirection: "row", gap: 12, marginBottom: 12 },
  backButton: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#d1d5db" },
  backButtonText: { color: "#374151", fontSize: 17, fontWeight: "600" },
  nextButton: { flex: 1, backgroundColor: "#16a34a", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  nextButtonText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  skipButton: { alignItems: "center", paddingVertical: 12 },
  skipButtonText: { color: "#6b7280", fontSize: 15 },
});
