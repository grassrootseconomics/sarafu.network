import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { isAddress, parseUnits, type Address } from "viem";
import { useTransferToken } from "@/lib/transfer";
import { formatTokenAmount, type VoucherBalance } from "@/lib/token";
import { trpc } from "@/lib/trpc";
import {
  colors,
  type as typeScale,
  spacing,
  radius,
  shadow,
  sectionHeader,
} from "@/lib/theme";

interface SendModalProps {
  visible: boolean;
  onClose: () => void;
  vouchers: VoucherBalance[];
  defaultVoucher?: Address;
  userAddress: string;
  prefillAddress?: string;
}

export function SendModal({
  visible,
  onClose,
  vouchers,
  defaultVoucher,
  userAddress,
  prefillAddress,
}: SendModalProps) {
  const [recipient, setRecipient] = useState(prefillAddress ?? "");
  const [amount, setAmount] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState<Address | null>(
    defaultVoucher ?? null
  );
  const [showPicker, setShowPicker] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const { transfer, isPending } = useTransferToken();
  const utils = trpc.useUtils();

  const selected = vouchers.find(
    (v) => v.address.toLowerCase() === selectedVoucher?.toLowerCase()
  );

  useEffect(() => {
    if (prefillAddress) setRecipient(prefillAddress);
  }, [prefillAddress]);

  useEffect(() => {
    if (defaultVoucher) setSelectedVoucher(defaultVoucher);
  }, [defaultVoucher]);

  function reset() {
    setRecipient(prefillAddress ?? "");
    setAmount("");
    setSelectedVoucher(defaultVoucher ?? null);
    setShowPicker(false);
    setShowScanner(false);
    setSuccess(false);
  }

  function handleClose() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reset();
    onClose();
  }

  async function handleOpenScanner() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert(
          "Camera Permission",
          "Camera access is required to scan QR codes."
        );
        return;
      }
    }
    setShowScanner(true);
  }

  function handleBarcodeScan(data: string) {
    let candidate = data;
    if (candidate.toLowerCase().startsWith("ethereum:")) {
      candidate = candidate.slice(9);
    }
    candidate = candidate.split(/[?/@]/)[0] ?? candidate;
    candidate = candidate.trim();
    if (isAddress(candidate)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setRecipient(candidate);
      setShowScanner(false);
    }
  }

  async function handleSend() {
    const trimmedRecipient = recipient.trim();
    if (!isAddress(trimmedRecipient)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Invalid Address", "Please enter a valid wallet address.");
      return;
    }
    if (trimmedRecipient.toLowerCase() === userAddress.toLowerCase()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Invalid", "You cannot send to yourself.");
      return;
    }
    if (!selected) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Select Voucher", "Please select a voucher to send.");
      return;
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }
    const amountWei = parseUnits(amount, selected.decimals);
    if (amountWei > selected.balance) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Insufficient Balance",
        `You only have ${formatTokenAmount(selected.balance, selected.decimals)} ${selected.symbol}.`
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await transfer(
        trimmedRecipient as Address,
        selected.address,
        amountWei
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccess(true);
      utils.me.events.invalidate();
      utils.me.vouchers.invalidate();
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Transfer Failed", err.message || "Something went wrong.");
    }
  }

  if (success) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.successContainer}>
          <View style={styles.successCircle}>
            <FontAwesome name="check" size={40} color="#fff" />
          </View>
          <Text style={styles.successTitle}>Sent!</Text>
          <Text style={styles.successDetail}>
            {amount} {selected?.symbol} sent to{"\n"}
            {recipient.slice(0, 10)}...{recipient.slice(-6)}
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.doneButton,
              pressed && styles.doneButtonPressed,
            ]}
            onPress={handleClose}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Drag handle */}
        <View style={styles.dragHandleWrap}>
          <View style={styles.dragHandle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Send</Text>
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

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Recipient */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>RECIPIENT</Text>
            <View style={styles.card}>
              <View style={styles.recipientRow}>
                <TextInput
                  style={styles.input}
                  value={recipient}
                  onChangeText={setRecipient}
                  placeholder="0x..."
                  placeholderTextColor={colors.tertiaryLabel as string}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={handleOpenScanner}
                  style={({ pressed }) => [
                    styles.qrButton,
                    pressed && styles.qrButtonPressed,
                  ]}
                >
                  <FontAwesome
                    name="qrcode"
                    size={18}
                    color={colors.secondaryLabel as string}
                  />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Inline Scanner */}
          {showScanner && (
            <View style={styles.scannerCard}>
              <CameraView
                style={styles.scanner}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={({ data }) => handleBarcodeScan(data)}
              />
              <Pressable
                style={styles.scannerCancel}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowScanner(false);
                }}
              >
                <Text style={styles.scannerCancelText}>Cancel</Text>
              </Pressable>
            </View>
          )}

          {/* Voucher */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>VOUCHER</Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowPicker(!showPicker);
              }}
              style={({ pressed }) => [
                styles.card,
                styles.pickerTrigger,
                pressed && styles.pickerTriggerPressed,
              ]}
            >
              <Text
                style={[
                  styles.pickerText,
                  !selected && styles.pickerPlaceholder,
                ]}
              >
                {selected
                  ? `${selected.symbol} — ${formatTokenAmount(selected.balance, selected.decimals)}`
                  : "Select a voucher"}
              </Text>
              <FontAwesome
                name={showPicker ? "chevron-up" : "chevron-down"}
                size={11}
                color={colors.tertiaryLabel as string}
              />
            </Pressable>
            {showPicker && (
              <View style={styles.pickerList}>
                {vouchers.map((v) => {
                  const isSelected =
                    v.address.toLowerCase() ===
                    selectedVoucher?.toLowerCase();
                  return (
                    <Pressable
                      key={v.address}
                      style={[
                        styles.pickerItem,
                        isSelected && styles.pickerItemSelected,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(
                          Haptics.ImpactFeedbackStyle.Light
                        );
                        setSelectedVoucher(v.address);
                        setShowPicker(false);
                      }}
                    >
                      <View style={styles.pickerItemLeft}>
                        <Text
                          style={[
                            styles.pickerItemSymbol,
                            isSelected && styles.pickerItemSymbolSelected,
                          ]}
                        >
                          {v.symbol}
                        </Text>
                        <Text
                          style={styles.pickerItemName}
                          numberOfLines={1}
                        >
                          {v.name}
                        </Text>
                      </View>
                      <View style={styles.pickerItemRight}>
                        <Text style={styles.pickerItemBalance}>
                          {formatTokenAmount(v.balance, v.decimals)}
                        </Text>
                        {isSelected && (
                          <FontAwesome
                            name="check-circle"
                            size={16}
                            color={colors.primary}
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
                {vouchers.length === 0 && (
                  <Text style={styles.pickerEmpty}>No vouchers held</Text>
                )}
              </View>
            )}
          </View>

          {/* Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>AMOUNT</Text>
            <View style={styles.card}>
              <View style={styles.amountRow}>
                <TextInput
                  style={[styles.input, styles.amountInput]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.tertiaryLabel as string}
                  keyboardType="decimal-pad"
                />
                {selected && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.maxButton,
                      pressed && styles.maxButtonPressed,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setAmount(
                        formatTokenAmount(selected.balance, selected.decimals)
                      );
                    }}
                  >
                    <Text style={styles.maxButtonText}>MAX</Text>
                  </Pressable>
                )}
              </View>
              {selected && (
                <Text style={styles.balanceHint}>
                  Available:{" "}
                  {formatTokenAmount(selected.balance, selected.decimals)}{" "}
                  {selected.symbol}
                </Text>
              )}
            </View>
          </View>

          {/* Send Button */}
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              pressed && styles.sendButtonPressed,
              isPending && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <FontAwesome name="arrow-up" size={16} color="#fff" />
                <Text style={styles.sendButtonText}>Send</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    ...sectionHeader,
    marginBottom: 0,
    paddingHorizontal: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.sm,
  },
  recipientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    ...typeScale.body,
    color: colors.label,
    padding: 0,
  },
  qrButton: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.tertiaryFill as string,
    alignItems: "center",
    justifyContent: "center",
  },
  qrButtonPressed: {
    backgroundColor: colors.secondaryFill as string,
  },
  scannerCard: {
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadow.sm,
  },
  scanner: {
    height: 200,
    width: "100%",
  },
  scannerCancel: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  scannerCancelText: {
    ...typeScale.subheadline,
    fontWeight: "500",
    color: colors.secondaryLabel as string,
  },
  pickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerTriggerPressed: {
    backgroundColor: colors.secondaryBackground,
  },
  pickerText: {
    ...typeScale.body,
    color: colors.label,
  },
  pickerPlaceholder: {
    color: colors.tertiaryLabel as string,
  },
  pickerList: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadow.sm,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator as string,
  },
  pickerItemSelected: {
    backgroundColor: colors.primarySoft as string,
  },
  pickerItemLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  pickerItemSymbol: {
    ...typeScale.subheadline,
    fontWeight: "600",
    color: colors.label,
  },
  pickerItemSymbolSelected: {
    color: colors.primary,
  },
  pickerItemName: {
    ...typeScale.caption1,
    color: colors.secondaryLabel as string,
    marginTop: 1,
  },
  pickerItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  pickerItemBalance: {
    ...typeScale.subheadline,
    fontWeight: "500",
    color: colors.secondaryLabel as string,
  },
  pickerEmpty: {
    ...typeScale.subheadline,
    color: colors.tertiaryLabel as string,
    textAlign: "center",
    paddingVertical: spacing.xl,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  amountInput: {
    ...typeScale.title2,
    fontWeight: "700",
  },
  maxButton: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  maxButtonPressed: {
    opacity: 0.7,
  },
  maxButtonText: {
    ...typeScale.caption1,
    fontWeight: "700",
    color: colors.primary,
  },
  balanceHint: {
    ...typeScale.caption1,
    color: colors.tertiaryLabel as string,
    marginTop: spacing.sm,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
    ...shadow.colored(colors.primary),
  },
  sendButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    ...typeScale.headline,
    color: "#fff",
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    backgroundColor: colors.background,
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
    ...shadow.colored(colors.primary),
  },
  successTitle: {
    ...typeScale.title1,
    color: colors.label,
  },
  successDetail: {
    ...typeScale.subheadline,
    color: colors.secondaryLabel as string,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  doneButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.xxxl + spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.xxl,
    ...shadow.colored(colors.primary),
  },
  doneButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  doneButtonText: {
    ...typeScale.headline,
    color: "#fff",
  },
});
