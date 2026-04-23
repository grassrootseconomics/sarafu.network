import { useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { loadMnemonic } from "@/lib/wallet";
import { createCloudBackup, getCloudName } from "@/lib/cloud-backup";

export default function BackupScreen() {
  const router = useRouter();
  const [backupDone, setBackupDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const cloudName = getCloudName();

  async function handleBackup() {
    if (!showPasswordInput) {
      setShowPasswordInput(true);
      return;
    }
    if (password.length < 6) {
      Alert.alert(
        "Password too short",
        "Please enter at least 6 characters to encrypt your backup."
      );
      return;
    }
    setIsLoading(true);
    try {
      const mnemonic = await loadMnemonic();
      if (!mnemonic) {
        Alert.alert("Error", "No wallet found to back up.");
        return;
      }
      await createCloudBackup(mnemonic, password);
      setBackupDone(true);
    } catch (error) {
      Alert.alert("Backup failed", "Please try again.");
      console.error("Cloud backup failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <FontAwesome name="cloud-upload" size={48} color="#16a34a" />
        </View>

        <Text style={styles.title}>Back Up Your Wallet</Text>
        <Text style={styles.subtitle}>
          Encrypt and back up your recovery phrase to {cloudName}. You can
          restore your wallet on a new device using this backup.
        </Text>

        {showPasswordInput && !backupDone && (
          <View style={styles.passwordBox}>
            <Text style={styles.passwordLabel}>
              Choose an encryption password
            </Text>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry
              placeholder="At least 6 characters"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              autoFocus
            />
          </View>
        )}

        {backupDone && (
          <View style={styles.successBanner}>
            <FontAwesome name="check-circle" size={16} color="#16a34a" />
            <Text style={styles.successText}>
              Backup saved to {cloudName}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttons}>
        {!backupDone ? (
          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={handleBackup}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? "Backing up..." : `Back Up to ${cloudName}`}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace("/(wallet-setup)/security" as Href)}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.replace("/(wallet-setup)/security" as Href)}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 8,
    padding: 12,
    marginTop: 24,
  },
  successText: {
    fontSize: 14,
    color: "#166534",
    fontWeight: "500",
  },
  buttons: {
    gap: 12,
    paddingBottom: 16,
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
  skipButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  skipButtonText: {
    color: "#6b7280",
    fontSize: 15,
  },
  passwordBox: {
    marginTop: 24,
    width: "100%",
    paddingHorizontal: 16,
  },
  passwordLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    marginBottom: 8,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#111",
    backgroundColor: "#f9fafb",
  },
});
