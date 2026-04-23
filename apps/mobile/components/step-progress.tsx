import { StyleSheet, View } from "react-native";

interface StepProgressProps {
  steps: number;
  activeStep: number;
}

export function StepProgress({ steps, activeStep }: StepProgressProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: steps }, (_, i) => (
        <View key={i} style={styles.stepRow}>
          <View
            style={[
              styles.dot,
              i <= activeStep ? styles.dotActive : styles.dotInactive,
            ]}
          />
          {i < steps - 1 && (
            <View
              style={[
                styles.line,
                i < activeStep ? styles.lineActive : styles.lineInactive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: "#16a34a",
  },
  dotInactive: {
    backgroundColor: "#d1d5db",
  },
  line: {
    width: 32,
    height: 2,
  },
  lineActive: {
    backgroundColor: "#16a34a",
  },
  lineInactive: {
    backgroundColor: "#d1d5db",
  },
});
