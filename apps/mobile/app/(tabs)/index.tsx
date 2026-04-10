import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/lib/auth";
import { useRouter } from "expo-router";

export default function WalletScreen() {
  const { isAuthenticated, address } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Sarafu Network</Text>
        <Text style={styles.subtitle}>Sign in to view your wallet</Text>
        <Text style={styles.link} onPress={() => router.push("/(auth)/login")}>
          Sign In
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Wallet</Text>
        <Text style={styles.address} numberOfLines={1}>
          {address}
        </Text>
      </View>
      <View style={styles.center}>
        <Text style={styles.subtitle}>Token balances will appear here</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 16, color: "#6b7280", marginTop: 8 },
  address: { fontSize: 13, color: "#9ca3af", marginTop: 4, fontFamily: "monospace" },
  link: { fontSize: 16, color: "#16a34a", marginTop: 16, fontWeight: "600" },
});
