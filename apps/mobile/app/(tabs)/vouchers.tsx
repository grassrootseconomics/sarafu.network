import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { trpc } from "@/lib/trpc";

export default function VouchersScreen() {
  const { data: vouchers, isLoading } = trpc.voucher.list.useQuery({
    sortBy: "transactions",
    sortDirection: "desc",
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={vouchers ?? []}
        keyExtractor={(item) => item.voucher_address}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.symbol}>{item.symbol}</Text>
            <Text style={styles.name}>{item.voucher_name}</Text>
            {item.location_name && (
              <Text style={styles.location}>{item.location_name}</Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No vouchers found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16, gap: 12 },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  symbol: { fontSize: 18, fontWeight: "700" },
  name: { fontSize: 14, color: "#374151", marginTop: 2 },
  location: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
  emptyText: { fontSize: 16, color: "#6b7280" },
});
