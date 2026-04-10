import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/lib/auth";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { isAuthenticated, address, signOut } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Text style={styles.subtitle}>Sign in to view your profile</Text>
        <Text style={styles.link} onPress={() => router.push("/(auth)/login")}>
          Sign In
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Address</Text>
        <Text style={styles.value} selectable>
          {address}
        </Text>
      </View>

      <Text
        style={styles.signOut}
        onPress={async () => {
          await signOut();
          router.replace("/");
        }}
      >
        Sign Out
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  section: { marginBottom: 24 },
  label: { fontSize: 13, color: "#6b7280", marginBottom: 4, textTransform: "uppercase" },
  value: { fontSize: 15, fontFamily: "monospace" },
  subtitle: { fontSize: 16, color: "#6b7280" },
  link: { fontSize: 16, color: "#16a34a", marginTop: 16, fontWeight: "600" },
  signOut: { fontSize: 16, color: "#ef4444", marginTop: 32, fontWeight: "600" },
});
