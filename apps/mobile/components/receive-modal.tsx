import { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import QRCode from "react-native-qrcode-svg";
import {
  colors,
  type as typeScale,
  spacing,
  radius,
  shadow,
} from "@/lib/theme";

interface ReceiveModalProps {
  visible: boolean;
  onClose: () => void;
  address: string;
}

export function ReceiveModal({ visible, onClose, address }: ReceiveModalProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Share.share({
      message: address,
      title: "My Wallet Address",
    });
  }

  function handleClose() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        {/* Drag handle */}
        <View style={styles.dragHandleWrap}>
          <View style={styles.dragHandle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Receive</Text>
          <Pressable
            onPress={handleClose}
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && styles.closeBtnPressed,
            ]}
          >
            <FontAwesome
              name="times"
              size={14}
              color={colors.secondaryLabel as string}
            />
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* QR Code Card */}
          <View style={styles.qrCard}>
            {address ? (
              <QRCode
                value={address}
                size={200}
                color={colors.label}
                backgroundColor={colors.surface}
              />
            ) : null}
          </View>

          <Text style={styles.instruction}>
            Scan this QR code to receive vouchers
          </Text>

          {/* Address Card */}
          <View style={styles.addressCard}>
            <View style={styles.addressRow}>
              <View style={styles.addressIconWrap}>
                <FontAwesome name="address-card" size={14} color={colors.primary} />
              </View>
              <Text style={styles.addressText} selectable numberOfLines={1}>
                {address}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Pressable
              onPress={handleCopy}
              style={({ pressed }) => [
                styles.actionPill,
                pressed && styles.actionPillPressed,
              ]}
            >
              <FontAwesome
                name={copied ? "check" : "copy"}
                size={14}
                color={copied ? colors.green : colors.primary}
              />
              <Text
                style={[
                  styles.actionPillText,
                  copied && { color: colors.green },
                ]}
              >
                {copied ? "Copied!" : "Copy"}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleShare}
              style={({ pressed }) => [
                styles.actionPill,
                pressed && styles.actionPillPressed,
              ]}
            >
              <FontAwesome name="share" size={14} color={colors.primary} />
              <Text style={styles.actionPillText}>Share</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  dragHandleWrap: {
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  dragHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.opaqueSeparator,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerSpacer: {
    width: 30,
  },
  headerTitle: {
    ...typeScale.headline,
    color: colors.label,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.tertiaryFill as string,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnPressed: {
    backgroundColor: colors.secondaryFill as string,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
  },
  qrCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.md,
  },
  instruction: {
    ...typeScale.subheadline,
    color: colors.secondaryLabel as string,
    textAlign: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  addressCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    width: "100%",
    ...shadow.sm,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  addressIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft as string,
    alignItems: "center",
    justifyContent: "center",
  },
  addressText: {
    flex: 1,
    ...typeScale.footnote,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: colors.label,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.tertiaryFill as string,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  actionPillPressed: {
    backgroundColor: colors.secondaryFill as string,
  },
  actionPillText: {
    ...typeScale.subheadline,
    fontWeight: "600",
    color: colors.primary,
  },
});
