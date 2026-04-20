import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";
import { getApiBaseUrl } from "@/lib/api-url";
import {
  colors,
  type as typeScale,
  spacing,
  radius,
  shadow,
} from "@/lib/theme";

function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${getApiBaseUrl()}${url}`;
  return null;
}

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: offer, isLoading } = trpc.products.byId.useQuery(
    { id: Number(id) },
    { enabled: !!id }
  );

  const imageUrl = resolveImageUrl(offer?.image_url);
  const [imageFailed, setImageFailed] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!offer) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Offer not found</Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.backLink}
        >
          <Text style={styles.backLinkText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Image */}
        {imageUrl && !imageFailed ? (
          <Image
            source={imageUrl}
            style={styles.heroImage}
            contentFit="cover"
            transition={200}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.heroPlaceholder}>
            <FontAwesome
              name="image"
              size={48}
              color={colors.quaternaryLabel as string}
            />
          </View>
        )}

        {/* Back button overlay */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={({ pressed }) => [
            styles.backBtn,
            { top: insets.top + spacing.sm },
            pressed && styles.backBtnPressed,
          ]}
        >
          <FontAwesome
            name="chevron-left"
            size={16}
            color={colors.label}
          />
        </Pressable>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{offer.commodity_name}</Text>

          {offer.price !== null &&
            offer.price !== undefined &&
            offer.price > 0 && (
              <Text style={styles.price}>{offer.price}</Text>
            )}

          {/* Details card */}
          <View style={styles.detailsCard}>
            {offer.commodity_description ? (
              <View style={styles.detailRow}>
                <View style={styles.detailIconWrap}>
                  <FontAwesome
                    name="align-left"
                    size={12}
                    color={colors.blue}
                  />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>
                    {offer.commodity_description}
                  </Text>
                </View>
              </View>
            ) : null}

            {offer.commodity_type ? (
              <View
                style={[styles.detailRow, styles.detailRowBorder]}
              >
                <View style={styles.detailIconWrap}>
                  <FontAwesome
                    name="tag"
                    size={12}
                    color={colors.orange}
                  />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>
                    {offer.commodity_type}
                  </Text>
                </View>
              </View>
            ) : null}

            {offer.location_name ? (
              <View
                style={[styles.detailRow, styles.detailRowBorder]}
              >
                <View style={styles.detailIconWrap}>
                  <FontAwesome
                    name="map-marker"
                    size={14}
                    color={colors.red}
                  />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>
                    {offer.location_name}
                  </Text>
                </View>
              </View>
            ) : null}

            {offer.quantity !== null &&
              offer.quantity !== undefined &&
              offer.quantity > 0 && (
                <View
                  style={[styles.detailRow, styles.detailRowBorder]}
                >
                  <View style={styles.detailIconWrap}>
                    <FontAwesome
                      name="cube"
                      size={12}
                      color={colors.purple}
                    />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Quantity</Text>
                    <Text style={styles.detailValue}>
                      {offer.quantity}
                      {offer.unit ? ` ${offer.unit}` : ""}
                      {offer.frequency ? ` / ${offer.frequency}` : ""}
                    </Text>
                  </View>
                </View>
              )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  errorText: {
    ...typeScale.headline,
    color: colors.secondaryLabel as string,
  },
  backLink: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  backLinkText: {
    ...typeScale.subheadline,
    fontWeight: "500",
    color: colors.primary,
  },
  heroImage: {
    width: "100%",
    height: 280,
    backgroundColor: colors.tertiaryFill as string,
  },
  heroPlaceholder: {
    width: "100%",
    height: 220,
    backgroundColor: colors.tertiaryFill as string,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtn: {
    position: "absolute",
    left: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.md,
  },
  backBtnPressed: {
    backgroundColor: colors.secondaryBackground,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typeScale.title1,
    color: colors.label,
  },
  price: {
    ...typeScale.title2,
    color: colors.primary,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadow.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
    gap: spacing.md,
  },
  detailRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator as string,
  },
  detailIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.quaternaryFill as string,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...typeScale.caption1,
    color: colors.secondaryLabel as string,
    marginBottom: 2,
  },
  detailValue: {
    ...typeScale.subheadline,
    color: colors.label,
    lineHeight: 21,
  },
});
