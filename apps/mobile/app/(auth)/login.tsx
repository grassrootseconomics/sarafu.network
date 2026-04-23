import { StyleSheet, Text, View } from "react-native";

export default function LoginScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subtitle}>
        SIWE (Sign-In with Ethereum) authentication will be implemented here.
        The mobile app will use WalletConnect or a local wallet to sign a SIWE
        message, then exchange it for a bearer token via the API.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  subtitle: { fontSize: 15, color: "#6b7280", textAlign: "center", lineHeight: 22 },
});
