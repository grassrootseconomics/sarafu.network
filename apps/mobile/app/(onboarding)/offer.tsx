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

export default function OfferScreen() {
  const router = useRouter();
  const { state, setOffer } = useOfferVoucher();

  const [name, setName] = useState(state.offer?.name ?? "");
  const [description, setDescription] = useState(
    state.offer?.description ?? ""
  );
  const [categories, setCategories] = useState(
    state.offer?.categories?.join(", ") ?? ""
  );

  function handleNext() {
    const trimmedName = name.trim();
    const trimmedDesc = description.trim();

    if (trimmedName.length < 2 || trimmedName.length > 32) {
      Alert.alert("Invalid", "Offer name must be 2-32 characters.");
      return;
    }
    if (trimmedDesc.length < 3 || trimmedDesc.length > 256) {
      Alert.alert("Invalid", "Description must be 3-256 characters.");
      return;
    }

    const cats = categories
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    setOffer({
      name: trimmedName,
      description: trimmedDesc,
      categories: cats,
    });

    router.push("/(onboarding)/pricing" as Href);
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
          <StepProgress steps={5} activeStep={1} />

          <Text style={styles.title}>Create Your Offer</Text>
          <Text style={styles.subtitle}>
            What product or service will you offer to the community?
          </Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Offer Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Organic Butternut Squash, 1 Hour Carpentry"
                placeholderTextColor="#9ca3af"
                maxLength={32}
              />
              <Text style={styles.hint}>{name.length}/32 characters</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your offer in detail..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={256}
              />
              <Text style={styles.hint}>
                {description.length}/256 characters
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Categories</Text>
              <TextInput
                style={styles.input}
                value={categories}
                onChangeText={setCategories}
                placeholder="e.g. Food, Agriculture (comma-separated)"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flex: {
    flex: 1,
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 22,
    marginBottom: 24,
    textAlign: "center",
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#111",
    backgroundColor: "#f9fafb",
  },
  multiline: {
    minHeight: 80,
  },
  hint: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "right",
  },
  primaryButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  skipButtonText: {
    color: "#6b7280",
    fontSize: 15,
  },
});
