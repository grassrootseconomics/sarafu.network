import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isAddress, type Address } from "viem";
import { useAuth } from "@/lib/auth";
import { useVoucherBalances } from "@/lib/token";
import { SendModal } from "@/components/send-modal";
import {
  colors,
  spacing,
  radius,
  shadow,
  type as typography,
} from "@/lib/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCAN_SIZE = SCREEN_WIDTH * 0.68;
const CORNER_SIZE = 32;
const CORNER_THICKNESS = 3;
const CORNER_RADIUS = 20;

function parseAddress(data: string): string | null {
  const raw = data.startsWith("ethereum:")
    ? data.slice(9).split("@")[0]!
    : data;
  const addr = raw.split("?")[0]!.trim();
  return isAddress(addr) ? addr : null;
}

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedAddress, setScannedAddress] = useState<string | null>(null);
  const [torch, setTorch] = useState(false);

  const { address } = useAuth();
  const { vouchers } = useVoucherBalances(address);

  const handleBarCodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (scanned) return;
      const addr = parseAddress(result.data);
      if (addr) {
        setScanned(true);
        setScannedAddress(addr);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
    [scanned]
  );

  function handleCloseSend() {
    setScannedAddress(null);
    setScanned(false);
  }

  const handleTorchToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTorch((prev) => !prev);
  }, []);

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.permissionText}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionIconCircle}>
          <FontAwesome
            name="camera"
            size={36}
            color={colors.tertiaryLabel as string}
          />
        </View>
        <Text style={styles.permissionTitle}>Camera Access</Text>
        <Text style={styles.permissionText}>
          Camera access is needed to scan QR codes
        </Text>
        <Pressable style={styles.grantButton} onPress={requestPermission}>
          <Text style={styles.grantButtonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      <View style={styles.overlay}>
        <View style={styles.topOverlay}>
          <Text
            style={[
              styles.headerTitle,
              { marginTop: insets.top + spacing.md },
            ]}
          >
            Scan QR Code
          </Text>
        </View>
        <View style={styles.middleRow}>
          <View style={styles.sideOverlay} />
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            <View style={styles.scanAreaBorder} />
          </View>
          <View style={styles.sideOverlay} />
        </View>
        <View style={styles.bottomOverlay}>
          <Text style={styles.scanHint}>
            Align a wallet QR code within the frame
          </Text>

          <Pressable onPress={handleTorchToggle} style={styles.torchWrapper}>
            <BlurView intensity={40} tint="dark" style={styles.torchBlur}>
              <FontAwesome
                name="bolt"
                size={20}
                color={torch ? colors.yellow : "rgba(255,255,255,0.9)"}
              />
            </BlurView>
          </Pressable>

          {scannedAddress && (
            <View
              style={[
                styles.addressCard,
                { marginBottom: insets.bottom + spacing.md },
              ]}
            >
              <View style={styles.addressCardInner}>
                <View style={styles.addressDot} />
                <View style={styles.addressTextContainer}>
                  <Text style={styles.addressLabel}>Recipient</Text>
                  <Text style={styles.addressValue} numberOfLines={1}>
                    {scannedAddress.slice(0, 8)}...{scannedAddress.slice(-6)}
                  </Text>
                </View>
                <FontAwesome
                  name="check-circle"
                  size={20}
                  color={colors.primary}
                />
              </View>
            </View>
          )}
        </View>
      </View>

      <SendModal
        visible={!!scannedAddress}
        onClose={handleCloseSend}
        vouchers={vouchers}
        defaultVoucher={undefined}
        userAddress={address ?? ""}
        prefillAddress={scannedAddress ?? undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    backgroundColor: colors.background,
  },
  permissionIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.quaternaryFill as string,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  permissionTitle: {
    ...typography.title2,
    color: colors.label,
    marginBottom: spacing.sm,
  },
  permissionText: {
    ...typography.subheadline,
    color: colors.secondaryLabel as string,
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  grantButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.md,
    ...shadow.colored(colors.primary),
  },
  grantButtonText: {
    ...typography.headline,
    color: colors.surface,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: spacing.xl,
  },
  headerTitle: {
    ...typography.title3,
    color: "rgba(255,255,255,0.95)",
    position: "absolute",
    top: 0,
  },
  middleRow: {
    flexDirection: "row",
    height: SCAN_SIZE,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  scanArea: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    borderRadius: CORNER_RADIUS,
  },
  scanAreaBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CORNER_RADIUS,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    paddingTop: spacing.xxl,
  },
  scanHint: {
    ...typography.subheadline,
    color: "rgba(255,255,255,0.7)",
    marginBottom: spacing.xl,
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: "rgba(255,255,255,0.95)",
  },
  cornerTL: {
    top: -1,
    left: -1,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: CORNER_RADIUS,
  },
  cornerTR: {
    top: -1,
    right: -1,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: CORNER_RADIUS,
  },
  cornerBL: {
    bottom: -1,
    left: -1,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: CORNER_RADIUS,
  },
  cornerBR: {
    bottom: -1,
    right: -1,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: CORNER_RADIUS,
  },
  torchWrapper: {
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: spacing.xl,
  },
  torchBlur: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  addressCard: {
    position: "absolute",
    bottom: 0,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  addressCardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
  },
  addressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressLabel: {
    ...typography.caption1,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 2,
  },
  addressValue: {
    ...typography.headline,
    color: "rgba(255,255,255,0.95)",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});
