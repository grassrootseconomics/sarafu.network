import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useAuth } from "@/lib/auth";
import { useWallet } from "@/lib/wallet-context";
import { loadMnemonic } from "@/lib/wallet";
import {
  authenticateWithBiometric,
  getSecurityType,
  verifyPIN,
} from "@/lib/security";
import { isBackupEnabled } from "@/lib/cloud-backup";

export default function ProfileScreen() {
  const { address, signOut } = useAuth();
  const { resetWallet } = useWallet();
  const router = useRouter();
  const [revealedPhrase, setRevealedPhrase] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState<boolean | null>(null);

  // Check backup status on first render
  if (backupStatus === null) {
    isBackupEnabled().then(setBackupStatus);
  }

  async function handleViewPhrase() {
    if (revealedPhrase) {
      setRevealedPhrase(null);
      return;
    }

    const secType = await getSecurityType();
    if (secType === "biometric") {
      const ok = await authenticateWithBiometric();
      if (!ok) return;
    } else if (secType === "pin") {
      // For simplicity, use Alert prompt for PIN
      Alert.prompt("Enter PIN", "Enter your PIN to view recovery phrase", [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async (pin?: string) => {
            if (!pin || !(await verifyPIN(pin))) {
              Alert.alert("Incorrect PIN");
              return;
            }
            const mnemonic = await loadMnemonic();
            if (mnemonic) setRevealedPhrase(mnemonic);
          },
        },
      ]);
      return;
    }

    const mnemonic = await loadMnemonic();
    if (mnemonic) setRevealedPhrase(mnemonic);
  }

  async function handleSignOut() {
    Alert.alert(
      "Sign Out",
      "This will clear your session but keep your wallet. You can sign back in automatically.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/");
          },
        },
      ]
    );
  }

  async function handleDeleteWallet() {
    Alert.alert(
      "Delete Wallet",
      "This will permanently remove your wallet from this device. Make sure you have your recovery phrase backed up.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await signOut();
            await resetWallet();
            router.replace("/");
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Wallet Address</Text>
          <Text style={styles.address} selectable numberOfLines={1}>
            {address}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>

        <TouchableOpacity style={styles.menuItem} onPress={handleViewPhrase}>
          <FontAwesome
            name={revealedPhrase ? "eye-slash" : "eye"}
            size={18}
            color="#374151"
          />
          <Text style={styles.menuText}>
            {revealedPhrase ? "Hide Recovery Phrase" : "View Recovery Phrase"}
          </Text>
        </TouchableOpacity>

        {revealedPhrase && (
          <View style={styles.phraseBox}>
            <Text style={styles.phraseText}>{revealedPhrase}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/(wallet-setup)/backup" as Href)}
        >
          <FontAwesome name="cloud" size={18} color="#374151" />
          <Text style={styles.menuText}>Cloud Backup</Text>
          <Text style={styles.menuStatus}>
            {backupStatus ? "Enabled" : "Not set up"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
          <FontAwesome name="sign-out" size={18} color="#6b7280" />
          <Text style={styles.menuTextMuted}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleDeleteWallet}>
          <FontAwesome name="trash" size={18} color="#ef4444" />
          <Text style={styles.menuTextDanger}>Delete Wallet</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    color: "#6b7280",
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 14,
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    fontFamily: "monospace",
    color: "#111",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  menuText: {
    fontSize: 16,
    color: "#111",
    flex: 1,
  },
  menuTextMuted: {
    fontSize: 16,
    color: "#6b7280",
    flex: 1,
  },
  menuTextDanger: {
    fontSize: 16,
    color: "#ef4444",
    flex: 1,
  },
  menuStatus: {
    fontSize: 13,
    color: "#9ca3af",
  },
  phraseBox: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 8,
    padding: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  phraseText: {
    fontSize: 14,
    color: "#92400e",
    lineHeight: 22,
  },
});
