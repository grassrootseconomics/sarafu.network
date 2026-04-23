import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWallet } from "@/lib/wallet-context";
import { deriveFromMnemonic } from "@/lib/wallet";

export default function ImportWalletScreen() {
  const router = useRouter();
  const { importWallet } = useWallet();
  const [phrase, setPhrase] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleValidate() {
    setError(null);
    setPreview(null);
    try {
      const { address } = deriveFromMnemonic(phrase);
      setPreview(address);
    } catch {
      setError("Invalid recovery phrase. Check your words and try again.");
    }
  }

  async function handleRestore() {
    setIsLoading(true);
    try {
      await importWallet(phrase);
      router.replace("/(wallet-setup)/backup" as Href);
    } catch {
      setError("Failed to restore wallet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const wordCount = phrase.trim().split(/\s+/).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Restore Wallet</Text>
        <Text style={styles.subtitle}>
          Enter your 12 or 24-word recovery phrase to restore your wallet.
        </Text>
      </View>

      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        placeholder="Enter your recovery phrase..."
        placeholderTextColor="#9ca3af"
        value={phrase}
        onChangeText={(text) => {
          setPhrase(text.toLowerCase());
          setPreview(null);
          setError(null);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        textAlignVertical="top"
      />

      <Text style={styles.wordCount}>{wordCount} words</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {preview && (
        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>Derived address</Text>
          <Text style={styles.previewAddress} numberOfLines={1}>
            {preview}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        {!preview ? (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (wordCount !== 12 && wordCount !== 24) && styles.disabledButton,
            ]}
            onPress={handleValidate}
            disabled={wordCount !== 12 && wordCount !== 24}
          >
            <Text style={styles.primaryButtonText}>Validate Phrase</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={handleRestore}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? "Restoring..." : "Restore Wallet"}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    color: "#111",
    minHeight: 120,
    backgroundColor: "#f9fafb",
  },
  wordCount: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 6,
    textAlign: "right",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    marginTop: 8,
  },
  previewBox: {
    marginTop: 16,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 10,
    padding: 14,
  },
  previewLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  previewAddress: {
    fontSize: 14,
    fontWeight: "500",
    color: "#166534",
    fontFamily: "monospace",
  },
  footer: {
    marginTop: "auto",
    gap: 12,
    paddingTop: 16,
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
  disabledButton: {
    opacity: 0.5,
  },
  backButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  backButtonText: {
    color: "#6b7280",
    fontSize: 15,
  },
});
