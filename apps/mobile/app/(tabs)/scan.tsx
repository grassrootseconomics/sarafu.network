import { StyleSheet, Text, View } from "react-native";

export default function ScanScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>QR Scanner</Text>
      <Text style={styles.subtitle}>
        Camera-based QR scanning will be implemented here using expo-camera.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 16, color: "#6b7280", marginTop: 8, textAlign: "center" },
});
