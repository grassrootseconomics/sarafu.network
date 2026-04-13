import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useWallet } from "@/lib/wallet-context";
import { useWalletSetup } from "@/lib/wallet-setup-context";

export default function CreateWalletScreen() {
  const router = useRouter();
  const { createWallet } = useWallet();
  const { pendingWallet, setPendingWallet } = useWalletSetup();

  useEffect(() => {
    if (!pendingWallet) {
      const wallet = createWallet();
      setPendingWallet(wallet);
    }
  }, [pendingWallet, createWallet, setPendingWallet]);

  if (!pendingWallet) return null;

  const words = pendingWallet.mnemonic.split(" ");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Recovery Phrase</Text>
        <Text style={styles.subtitle}>
          Write down these 12 words in order and store them safely. This is the
          only way to recover your wallet.
        </Text>
      </View>

      <View style={styles.warningBanner}>
        <FontAwesome name="exclamation-triangle" size={16} color="#b45309" />
        <Text style={styles.warningText}>
          Never share your recovery phrase with anyone.
        </Text>
      </View>

      <View style={styles.wordGrid}>
        {words.map((word, i) => (
          <View key={i} style={styles.wordCell}>
            <Text style={styles.wordIndex}>{i + 1}</Text>
            <Text style={styles.wordText}>{word}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(wallet-setup)/verify" as Href)}
        >
          <Text style={styles.primaryButtonText}>I've Written Them Down</Text>
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
    marginBottom: 16,
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
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 14,
    color: "#92400e",
    flex: 1,
  },
  wordGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    flex: 1,
  },
  wordCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "30%",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  wordIndex: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "600",
    width: 18,
  },
  wordText: {
    fontSize: 14,
    color: "#111",
    fontWeight: "500",
  },
  footer: {
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
});
