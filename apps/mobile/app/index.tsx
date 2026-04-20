import { Redirect, type Href } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@/lib/auth";
import { useWallet } from "@/lib/wallet-context";
import { trpc } from "@/lib/trpc";

export default function RootIndex() {
  const { wallet, isLoading: walletLoading } = useWallet();
  const { isAuthenticated, isLoading: authLoading, autoSignIn } = useAuth();
  const [signInFailed, setSignInFailed] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  // Fetch user profile to check onboarding status (only when authenticated)
  const { data: me, isLoading: meLoading } = trpc.me.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (wallet && !isAuthenticated && !authLoading && !signingIn) {
      setSigningIn(true);
      setSignInFailed(false);
      autoSignIn().then((success) => {
        setSigningIn(false);
        if (!success) setSignInFailed(true);
      });
    }
  }, [wallet, isAuthenticated, authLoading]);

  if (walletLoading || authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (!wallet) {
    return <Redirect href={"/(wallet-setup)/welcome" as Href} />;
  }

  if (signingIn) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.statusText}>Signing in...</Text>
      </View>
    );
  }

  if (signInFailed) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Auto sign-in failed</Text>
        <Text style={styles.hintText}>
          Make sure the server is running on port 3000
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setSignInFailed(false);
            setSigningIn(true);
            autoSignIn().then((success) => {
              setSigningIn(false);
              if (!success) setSignInFailed(true);
            });
          }}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  // Wait for user profile to load before routing
  if (meLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  // Route to onboarding if not completed
  if (!me?.onboarding_completed) {
    return <Redirect href={"/(onboarding)/profile" as Href} />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  statusText: {
    marginTop: 12,
    fontSize: 15,
    color: "#6b7280",
  },
  errorText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: 8,
  },
  hintText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
