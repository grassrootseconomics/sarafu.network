import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/lib/auth";
import { useWallet } from "@/lib/wallet-context";
import { loadMnemonic } from "@/lib/wallet";
import {
  authenticateWithBiometric,
  getSecurityType,
  verifyPIN,
} from "@/lib/security";
import { isBackupEnabled } from "@/lib/cloud-backup";
import { trpc } from "@/lib/trpc";
import {
  colors,
  spacing,
  radius,
  shadow,
  type as typeScale,
  sectionHeader,
} from "@/lib/theme";

const GAS_STATUS_MAP: Record<
  string,
  { label: string; color: string; dotColor: string }
> = {
  NONE: { label: "Not requested", color: colors.red, dotColor: colors.red },
  REQUESTED: {
    label: "Pending",
    color: colors.orange,
    dotColor: colors.orange,
  },
  APPROVED: {
    label: "Approved",
    color: colors.green,
    dotColor: colors.green,
  },
  REJECTED: { label: "Rejected", color: colors.red, dotColor: colors.red },
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { address, signOut } = useAuth();
  const { resetWallet } = useWallet();
  const router = useRouter();
  const [revealedPhrase, setRevealedPhrase] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState<boolean | null>(null);
  const [editing, setEditing] = useState(false);

  const { data: me, isLoading: meLoading } = trpc.me.get.useQuery();
  const { data: gasStatus } = trpc.me.gasStatus.useQuery();
  const { data: stats } = trpc.profile.getUserStats.useQuery(
    { address: address! },
    { enabled: !!address }
  );
  const { data: userVouchers } = trpc.me.vouchers.useQuery();

  const requestGas = trpc.me.requestGas.useMutation({
    onSuccess: () => Alert.alert("Success", "Gas request submitted!"),
    onError: (err) => Alert.alert("Error", err.message),
  });

  const utils = trpc.useUtils();
  const updateProfile = trpc.me.update.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Saved", "Profile updated.");
      setEditing(false);
      utils.me.get.invalidate();
    },
    onError: (err) => Alert.alert("Error", err.message),
  });

  const [formGivenNames, setFormGivenNames] = useState("");
  const [formFamilyName, setFormFamilyName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formDOB, setFormDOB] = useState("");
  const [formYOB, setFormYOB] = useState("");

  if (backupStatus === null) {
    isBackupEnabled().then(setBackupStatus);
  }

  function startEditing() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFormGivenNames(me?.given_names ?? "");
    setFormFamilyName(me?.family_name ?? "");
    setFormEmail(me?.email ?? "");
    setFormLocation(me?.location_name ?? "");
    setFormBio(me?.bio ?? "");
    setFormDOB(me?.date_of_birth ? String(me.date_of_birth) : "");
    setFormYOB(me?.year_of_birth?.toString() ?? "");
    setEditing(true);
  }

  function handleSaveProfile() {
    updateProfile.mutate({
      given_names: formGivenNames || null,
      family_name: formFamilyName || null,
      email: formEmail || null,
      location_name: formLocation || null,
      bio: formBio || null,
      date_of_birth: formDOB || null,
      year_of_birth: formYOB ? Number(formYOB) : null,
      geo: me?.geo ?? null,
      default_voucher: me?.default_voucher ?? null,
    });
  }

  const defaultVoucher = userVouchers?.find(
    (v) =>
      v.voucher_address.toLowerCase() === me?.default_voucher?.toLowerCase()
  );

  const gasInfo =
    GAS_STATUS_MAP[gasStatus ?? "NONE"] ?? GAS_STATUS_MAP.NONE;

  const totalPartners =
    (stats?.uniquePartnersInward ?? 0) + (stats?.uniquePartnersOutward ?? 0);
  const totalTx =
    (stats?.transactionsIn ?? 0) + (stats?.transactionsOut ?? 0);

  async function handleViewPhrase() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (revealedPhrase) {
      setRevealedPhrase(null);
      return;
    }
    const secType = await getSecurityType();
    if (secType === "biometric") {
      const ok = await authenticateWithBiometric();
      if (!ok) return;
    } else if (secType === "pin") {
      Alert.prompt("Enter PIN", "Enter your PIN to view recovery phrase", [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async (pin?: string) => {
            if (!pin || !(await verifyPIN(pin))) {
              Alert.alert("Incorrect PIN");
              return;
            }
            const mnemonic = await loadMnemonic();
            if (mnemonic) setRevealedPhrase(mnemonic);
          },
        },
      ]);
      return;
    }
    const mnemonic = await loadMnemonic();
    if (mnemonic) setRevealedPhrase(mnemonic);
  }

  async function handleSignOut() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Sign Out",
      "This will clear your session but keep your wallet.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/");
          },
        },
      ]
    );
  }

  async function handleDeleteWallet() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Delete Wallet",
      "This will permanently remove your wallet. Make sure you have your recovery phrase.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await signOut();
            await resetWallet();
            router.replace("/");
          },
        },
      ]
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.md },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Header */}
        <View style={styles.headerCard}>
          <View style={styles.profileHeader}>
            <LinearGradient
              colors={["#34C759", "#16a34a"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <View style={styles.avatarInner}>
                <Text style={styles.avatarText}>
                  {(me?.given_names?.[0] ?? "").toUpperCase()}
                  {(me?.family_name?.[0] ?? "").toUpperCase()}
                </Text>
              </View>
            </LinearGradient>

            <View style={styles.profileHeaderInfo}>
              {meLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Text style={styles.profileName}>
                    {me?.given_names} {me?.family_name}
                  </Text>
                  {me?.role && (
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleText}>{me.role}</Text>
                    </View>
                  )}
                </>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.editButtonPressed,
              ]}
              onPress={() => (editing ? setEditing(false) : startEditing())}
            >
              <FontAwesome
                name={editing ? "times" : "pencil"}
                size={15}
                color={colors.secondaryLabel as string}
              />
            </Pressable>
          </View>
        </View>

        {/* Stats Grid */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconWrap,
                    { backgroundColor: `${colors.green}14` },
                  ]}
                >
                  <FontAwesome name="users" size={14} color={colors.green} />
                </View>
                <Text style={styles.statValue}>{totalPartners}</Text>
                <Text style={styles.statLabel}>Partners</Text>
                <View style={styles.statSub}>
                  <Text style={styles.statSubIn}>
                    {stats.uniquePartnersInward} in
                  </Text>
                  <Text style={styles.statSubOut}>
                    {stats.uniquePartnersOutward} out
                  </Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconWrap,
                    { backgroundColor: `${colors.green}14` },
                  ]}
                >
                  <FontAwesome
                    name="line-chart"
                    size={14}
                    color={colors.green}
                  />
                </View>
                <Text style={styles.statValue}>{totalTx}</Text>
                <Text style={styles.statLabel}>Transactions</Text>
                <View style={styles.statSub}>
                  <Text style={styles.statSubIn}>
                    {stats.transactionsIn} in
                  </Text>
                  <Text style={styles.statSubOut}>
                    {stats.transactionsOut} out
                  </Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconWrap,
                    { backgroundColor: `${colors.blue}14` },
                  ]}
                >
                  <FontAwesome name="refresh" size={14} color={colors.blue} />
                </View>
                <Text style={styles.statValue}>{stats.totalSwaps}</Text>
                <Text style={styles.statLabel}>Swaps</Text>
              </View>
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconWrap,
                    { backgroundColor: `${colors.purple}14` },
                  ]}
                >
                  <FontAwesome
                    name="credit-card"
                    size={14}
                    color={colors.purple}
                  />
                </View>
                <Text style={styles.statValue}>{stats.totalVouchersHeld}</Text>
                <Text style={styles.statLabel}>Holdings</Text>
              </View>
            </View>
          </View>
        )}

        {/* Profile Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {editing ? "Edit Profile" : "Profile Information"}
          </Text>
          {editing ? (
            <View style={styles.formCard}>
              <View style={styles.formRow}>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>First Name</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formGivenNames}
                    onChangeText={setFormGivenNames}
                    placeholder="First name"
                    placeholderTextColor={colors.tertiaryLabel as string}
                  />
                </View>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>Last Name</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formFamilyName}
                    onChangeText={setFormFamilyName}
                    placeholder="Last name"
                    placeholderTextColor={colors.tertiaryLabel as string}
                  />
                </View>
              </View>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Email</Text>
                <TextInput
                  style={styles.formInput}
                  value={formEmail}
                  onChangeText={setFormEmail}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.tertiaryLabel as string}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Location</Text>
                <TextInput
                  style={styles.formInput}
                  value={formLocation}
                  onChangeText={setFormLocation}
                  placeholder="City, Country"
                  placeholderTextColor={colors.tertiaryLabel as string}
                />
              </View>
              <View style={styles.formRow}>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>Date of Birth</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formDOB}
                    onChangeText={setFormDOB}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.tertiaryLabel as string}
                  />
                </View>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>Year of Birth</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formYOB}
                    onChangeText={setFormYOB}
                    placeholder="1990"
                    placeholderTextColor={colors.tertiaryLabel as string}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Bio</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  value={formBio}
                  onChangeText={setFormBio}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={colors.tertiaryLabel as string}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.saveButtonPressed,
                  updateProfile.isPending && styles.disabledButton,
                ]}
                onPress={handleSaveProfile}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </Pressable>
            </View>
          ) : (
            <View style={styles.groupedCard}>
              <InfoRow icon="envelope" label="Email" value={me?.email} />
              <InfoRow
                icon="map-marker"
                label="Location"
                value={me?.location_name}
              />
              <InfoRow
                icon="calendar"
                label="Date of Birth"
                value={
                  me?.date_of_birth ? String(me.date_of_birth) : undefined
                }
              />
              <InfoRow
                icon="birthday-cake"
                label="Year of Birth"
                value={me?.year_of_birth?.toString()}
              />
              <InfoRow icon="venus-mars" label="Gender" value={me?.gender} />
              {me?.bio && (
                <View style={styles.infoRow}>
                  <View style={styles.iconSquare}>
                    <FontAwesome
                      name="quote-left"
                      size={12}
                      color={colors.secondaryLabel as string}
                    />
                  </View>
                  <View style={styles.infoRowContent}>
                    <Text style={styles.infoLabel}>Bio</Text>
                    <Text style={styles.infoValue}>{me.bio}</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.groupedCard}>
            <View style={styles.accountRow}>
              <Text style={styles.infoLabel}>Wallet Address</Text>
              <Text style={styles.addressValue} selectable numberOfLines={1}>
                {address}
              </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.accountRow}>
              <Text style={styles.infoLabel}>Gas Sponsorship</Text>
              <View style={styles.gasStatusRow}>
                <View
                  style={[
                    styles.gasDot,
                    { backgroundColor: gasInfo!.dotColor },
                  ]}
                />
                <Text
                  style={[styles.gasStatusText, { color: gasInfo!.color }]}
                >
                  {gasInfo!.label}
                </Text>
                {gasStatus === "NONE" && (
                  <Pressable
                    style={styles.gasButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      requestGas.mutate();
                    }}
                    disabled={requestGas.isPending}
                  >
                    <Text style={styles.gasButtonText}>
                      {requestGas.isPending ? "..." : "Request"}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            {defaultVoucher && (
              <>
                <View style={styles.separator} />
                <View style={styles.accountRow}>
                  <Text style={styles.infoLabel}>Default Voucher</Text>
                  <Text style={styles.defaultVoucherValue}>
                    {defaultVoucher.voucher_name} ({defaultVoucher.symbol})
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.groupedCard}>
            <Pressable
              style={({ pressed }) => [
                styles.menuRow,
                pressed && styles.menuRowPressed,
              ]}
              onPress={handleViewPhrase}
            >
              <View
                style={[
                  styles.menuIconSquare,
                  { backgroundColor: `${colors.orange}18` },
                ]}
              >
                <FontAwesome
                  name={revealedPhrase ? "eye-slash" : "eye"}
                  size={15}
                  color={colors.orange}
                />
              </View>
              <Text style={styles.menuText}>
                {revealedPhrase
                  ? "Hide Recovery Phrase"
                  : "View Recovery Phrase"}
              </Text>
              <FontAwesome
                name="chevron-right"
                size={12}
                color={colors.tertiaryLabel as string}
              />
            </Pressable>

            {revealedPhrase && (
              <View style={styles.phraseBox}>
                <Text style={styles.phraseText}>{revealedPhrase}</Text>
              </View>
            )}

            <View style={styles.separator} />

            <Pressable
              style={({ pressed }) => [
                styles.menuRow,
                pressed && styles.menuRowPressed,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/(wallet-setup)/backup" as Href);
              }}
            >
              <View
                style={[
                  styles.menuIconSquare,
                  { backgroundColor: `${colors.teal}18` },
                ]}
              >
                <FontAwesome name="cloud" size={15} color={colors.teal} />
              </View>
              <Text style={styles.menuText}>Cloud Backup</Text>
              <Text style={styles.menuDetail}>
                {backupStatus ? "Enabled" : "Not set up"}
              </Text>
              <FontAwesome
                name="chevron-right"
                size={12}
                color={colors.tertiaryLabel as string}
              />
            </Pressable>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <View style={styles.groupedCard}>
            <Pressable
              style={({ pressed }) => [
                styles.menuRow,
                pressed && styles.menuRowPressed,
              ]}
              onPress={handleSignOut}
            >
              <Text style={styles.menuTextMuted}>Sign Out</Text>
              <FontAwesome
                name="chevron-right"
                size={12}
                color={colors.tertiaryLabel as string}
              />
            </Pressable>
            <View style={styles.separator} />
            <Pressable
              style={({ pressed }) => [
                styles.menuRow,
                pressed && styles.menuRowPressed,
              ]}
              onPress={handleDeleteWallet}
            >
              <Text style={styles.menuTextDanger}>Delete Wallet</Text>
              <FontAwesome
                name="chevron-right"
                size={12}
                color={colors.tertiaryLabel as string}
              />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <>
      <View style={styles.infoRow}>
        <View style={styles.iconSquare}>
          <FontAwesome
            name={icon as any}
            size={12}
            color={colors.secondaryLabel as string}
          />
        </View>
        <View style={styles.infoRowContent}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      </View>
      <View style={styles.separator} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 48,
  },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    ...sectionHeader,
  },

  // Profile header card
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadow.sm,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatarGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 3,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 27,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "700",
  },
  profileHeaderInfo: { flex: 1 },
  profileName: {
    ...typeScale.title3,
    color: colors.label,
  },
  roleBadge: {
    backgroundColor: colors.primarySoft as string,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: "flex-start",
    marginTop: spacing.xs,
  },
  roleText: {
    ...typeScale.caption2,
    fontWeight: "600",
    color: colors.primary,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.tertiaryFill as string,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonPressed: {
    backgroundColor: colors.secondaryFill as string,
  },

  // Stats
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 2,
    ...shadow.sm,
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typeScale.title2,
    color: colors.label,
    marginTop: 2,
  },
  statLabel: {
    ...typeScale.caption1,
    color: colors.secondaryLabel as string,
  },
  statSub: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  statSubIn: { ...typeScale.caption2, color: colors.green },
  statSubOut: {
    ...typeScale.caption2,
    color: colors.secondaryLabel as string,
  },

  // Grouped card (iOS Settings style)
  groupedCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    ...shadow.sm,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator as string,
    marginLeft: 42,
  },

  // Info rows
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  iconSquare: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: colors.tertiaryFill as string,
    alignItems: "center",
    justifyContent: "center",
  },
  infoRowContent: { flex: 1, gap: 2 },
  infoLabel: {
    ...typeScale.caption1,
    color: colors.tertiaryLabel as string,
  },
  infoValue: {
    ...typeScale.body,
    color: colors.label,
  },

  // Account
  accountRow: {
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  addressValue: {
    ...typeScale.footnote,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: colors.label,
    marginTop: 2,
  },
  gasStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 2,
  },
  gasDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gasStatusText: {
    ...typeScale.subheadline,
    fontWeight: "600",
    flex: 1,
  },
  gasButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  gasButtonText: {
    ...typeScale.caption1,
    fontWeight: "600",
    color: colors.surface,
  },
  defaultVoucherValue: {
    ...typeScale.subheadline,
    fontWeight: "500",
    color: colors.label,
    marginTop: 2,
  },

  // Menu rows (Settings style)
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 14,
  },
  menuRowPressed: {
    backgroundColor: colors.quaternaryFill as string,
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuIconSquare: {
    width: 30,
    height: 30,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    ...typeScale.body,
    color: colors.label,
    flex: 1,
  },
  menuDetail: {
    ...typeScale.footnote,
    color: colors.tertiaryLabel as string,
    marginRight: spacing.xs,
  },
  menuTextMuted: {
    ...typeScale.body,
    color: colors.secondaryLabel as string,
    flex: 1,
  },
  menuTextDanger: {
    ...typeScale.body,
    color: colors.red,
    flex: 1,
  },

  // Phrase reveal
  phraseBox: {
    backgroundColor: `${colors.orange}0A`,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  phraseText: {
    ...typeScale.footnote,
    color: colors.orange,
    lineHeight: 22,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },

  // Edit form
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    ...shadow.sm,
  },
  formRow: { flexDirection: "row", gap: spacing.sm },
  formField: {},
  formFieldHalf: { flex: 1 },
  formLabel: {
    ...typeScale.caption1,
    fontWeight: "500",
    color: colors.secondaryLabel as string,
    marginBottom: spacing.xs,
  },
  formInput: {
    backgroundColor: colors.tertiaryFill as string,
    borderRadius: radius.sm,
    padding: 14,
    ...typeScale.body,
    color: colors.label,
  },
  formTextArea: { height: 80, textAlignVertical: "top" },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.sm,
    alignItems: "center",
    marginTop: spacing.xs,
    ...shadow.colored(colors.primary),
  },
  saveButtonPressed: { opacity: 0.9 },
  saveButtonText: {
    ...typeScale.headline,
    color: colors.surface,
  },
  disabledButton: { opacity: 0.6 },
});
