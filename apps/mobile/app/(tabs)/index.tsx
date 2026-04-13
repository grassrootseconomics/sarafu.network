import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/lib/auth";

export default function WalletScreen() {
  const { address } = useAuth();

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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 16, color: "#6b7280", marginTop: 8 },
  address: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 4,
    fontFamily: "monospace",
  },
});
