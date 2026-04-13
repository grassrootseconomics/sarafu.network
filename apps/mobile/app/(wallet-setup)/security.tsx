import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  isBiometricAvailable,
  authenticateWithBiometric,
  setSecurityType,
  setPIN,
} from "@/lib/security";
import { useAuth } from "@/lib/auth";

export default function SecurityScreen() {
  const router = useRouter();
  const { autoSignIn } = useAuth();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    isBiometricAvailable().then(setBiometricAvailable);
  }, []);

  async function finishSetup() {
    setIsAuthenticating(true);
    try {
      await autoSignIn();
    } finally {
      setIsAuthenticating(false);
      router.replace("/(tabs)");
    }
  }

  async function handleBiometric() {
    const success = await authenticateWithBiometric();
    if (success) {
      await setSecurityType("biometric");
      await finishSetup();
    } else {
      Alert.alert("Authentication failed", "Please try again or use a PIN.");
    }
  }

  async function handlePinSubmit() {
    if (step === "enter") {
      if (pin.length < 4) {
        Alert.alert("PIN too short", "Please enter at least 4 digits.");
        return;
      }
      setStep("confirm");
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert("PINs don't match", "Please try again.");
      setConfirmPin("");
      setStep("enter");
      setPin("");
      return;
    }

    await setPIN(pin);
    await finishSetup();
  }

  async function handleSkip() {
    await setSecurityType("none");
    await finishSetup();
  }

  if (isAuthenticating) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.title}>Signing in...</Text>
          <Text style={styles.subtitle}>
            Authenticating with Sarafu Network
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Secure Your Wallet</Text>
        <Text style={styles.subtitle}>
          Add an extra layer of protection to your wallet.
        </Text>
      </View>

      {!showPinInput ? (
        <View style={styles.options}>
          {biometricAvailable && (
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleBiometric}
            >
              <FontAwesome name="lock" size={24} color="#16a34a" />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Biometric Lock</Text>
                <Text style={styles.optionDesc}>
                  Use Face ID or fingerprint to protect your wallet
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => setShowPinInput(true)}
          >
            <FontAwesome name="key" size={24} color="#16a34a" />
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Set a PIN</Text>
              <Text style={styles.optionDesc}>
                Create a numeric PIN to unlock your wallet
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.pinContainer}>
          <Text style={styles.pinLabel}>
            {step === "enter" ? "Enter a PIN" : "Confirm your PIN"}
          </Text>
          <TextInput
            style={styles.pinInput}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            value={step === "enter" ? pin : confirmPin}
            onChangeText={step === "enter" ? setPin : setConfirmPin}
            placeholder="Enter PIN"
            placeholderTextColor="#9ca3af"
            autoFocus
          />
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handlePinSubmit}
          >
            <Text style={styles.primaryButtonText}>
              {step === "enter" ? "Next" : "Confirm"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => {
              setShowPinInput(false);
              setPin("");
              setConfirmPin("");
              setStep("enter");
            }}
          >
            <Text style={styles.skipButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 32,
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
  options: {
    gap: 16,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 20,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 14,
    color: "#6b7280",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  skipButtonText: {
    color: "#6b7280",
    fontSize: 15,
  },
  pinContainer: {
    gap: 16,
  },
  pinLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  pinInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 8,
    color: "#111",
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
