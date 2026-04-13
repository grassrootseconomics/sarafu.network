import { Redirect, type Href } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "@/lib/auth";
import { useWallet } from "@/lib/wallet-context";

export default function RootIndex() {
  const { wallet, isLoading: walletLoading } = useWallet();
  const { isAuthenticated, isLoading: authLoading, autoSignIn } = useAuth();

  useEffect(() => {
    if (wallet && !isAuthenticated && !authLoading) {
      autoSignIn();
    }
  }, [wallet, isAuthenticated, authLoading, autoSignIn]);

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

  if (!isAuthenticated) {
    // Auto-sign-in in progress
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
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
});
