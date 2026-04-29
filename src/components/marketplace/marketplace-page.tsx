"use client";

import {
  ArrowDownAZ,
  Activity,
  LocateFixed,
  MapPin,
  Search,
} from "lucide-react";
import Link from "next/link";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PoolListItem } from "~/components/pools/pool-list-item";
import {
  OfferGridCard,
  OfferGridCardSkeleton,
} from "~/components/products/offer-grid-card";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { MultiSelect } from "~/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { trpc, type RouterOutputs } from "~/lib/trpc";
import {
  distanceKmFromPoint,
  formatDistanceKm,
  type LatLng,
} from "~/utils/units/geo";
import {
  formatCurrencyValue,
  truncateByDecimalPlace,
} from "~/utils/units/number";

type SortMode = "auto" | "swaps" | "name";

type UserLocation = LatLng;

type LocationStatus = "idle" | "requesting" | "granted" | "denied";

const STALE_TIME_MS = 60_000;
const USER_LOCATION_STORAGE_KEY = "sarafu:marketplace:userLocation";
// Mirrors the geolocation `maximumAge` cap: a position older than this is
// suspect (the user may have moved). On the next page load we discard it and
// re-request, so a long-lived tab doesn't silently sort by a stale fix.
const STORED_LOCATION_MAX_AGE_MS = 5 * 60_000;

type StoredUserLocation = UserLocation & { savedAt: number };

function readStoredLocation(): UserLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(USER_LOCATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredUserLocation>;
    if (
      typeof parsed.latitude !== "number" ||
      typeof parsed.longitude !== "number"
    ) {
      return null;
    }
    if (
      typeof parsed.savedAt !== "number" ||
      Date.now() - parsed.savedAt > STORED_LOCATION_MAX_AGE_MS
    ) {
      window.sessionStorage.removeItem(USER_LOCATION_STORAGE_KEY);
      return null;
    }
    return { latitude: parsed.latitude, longitude: parsed.longitude };
  } catch {
    return null;
  }
}

function writeStoredLocation(loc: UserLocation) {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredUserLocation = { ...loc, savedAt: Date.now() };
    window.sessionStorage.setItem(
      USER_LOCATION_STORAGE_KEY,
      JSON.stringify(payload),
    );
  } catch {
    // Ignore quota / disabled storage errors.
  }
}

const INITIAL_BATCH = 24;
const NEXT_BATCH = 24;

/**
 * Progressive rendering for responsive grids. Returns the visible slice and a
 * sentinel ref to attach at the end of the list — when it scrolls into view,
 * we reveal another batch. Avoids rendering hundreds of cards eagerly while
 * keeping the existing CSS grid layout intact.
 *
 * `visibleCount` grows monotonically and is clamped to `items.length` at
 * render time, so filters/sorts that shrink the list don't need a reset and
 * returning items appear immediately when the filter is cleared.
 */
function useProgressiveSlice<T>(items: T[]) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const effectiveCount = Math.min(
    Math.max(visibleCount, INITIAL_BATCH),
    items.length,
  );
  const hasMore = effectiveCount < items.length;

  useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisibleCount((prev) => prev + NEXT_BATCH);
          }
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore]);

  return {
    slice: items.slice(0, effectiveCount),
    sentinelRef,
    hasMore,
  };
}

function PoolCardSkeleton() {
  return (
    <Card className="overflow-hidden h-[400px] flex flex-col">
      <Skeleton className="h-48 w-full" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3 mt-2" />
      </CardContent>
    </Card>
  );
}

function PoolsView({
  searchTerm,
  searchTags,
  userLocation,
  sortMode,
  onResultCountChange,
}: {
  searchTerm: string;
  searchTags: string[];
  userLocation: UserLocation | null;
  sortMode: SortMode;
  onResultCountChange: (count: number | null) => void;
}) {
  const { data: pools, isLoading } = trpc.pool.list.useQuery(
    {
      sortBy: sortMode === "name" ? "name" : "swaps",
      sortDirection: sortMode === "name" ? "asc" : "desc",
    },
    { staleTime: STALE_TIME_MS },
  );

  const sortedPools = useMemo(() => {
    if (!pools) return [];

    const withDistance = pools.map((pool) => ({
      ...pool,
      distance_km: distanceKmFromPoint(userLocation, pool.geo),
    }));

    if (sortMode === "auto" && userLocation) {
      return withDistance.sort((a, b) => {
        if (a.distance_km == null && b.distance_km == null) {
          return b.swap_count - a.swap_count;
        }
        if (a.distance_km == null) return 1;
        if (b.distance_km == null) return -1;
        return a.distance_km - b.distance_km;
      });
    }

    return withDistance;
  }, [pools, userLocation, sortMode]);

  const filteredPools = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return sortedPools.filter((pool) => {
      const matchesSearch =
        term === "" ||
        pool.pool_name.toLowerCase().includes(term) ||
        pool.pool_symbol.toLowerCase().includes(term) ||
        pool.description.toLowerCase().includes(term);
      const matchesTags =
        searchTags.length === 0 ||
        searchTags.every((tag) => pool.tags.includes(tag));
      return matchesSearch && matchesTags;
    });
  }, [sortedPools, searchTerm, searchTags]);

  useEffect(() => {
    if (isLoading) {
      onResultCountChange(null);
    } else {
      onResultCountChange(filteredPools.length);
    }
  }, [isLoading, filteredPools.length, onResultCountChange]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, idx) => (
          <PoolCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (filteredPools.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-12 px-4 text-center">
        <p className="text-base sm:text-lg text-muted-foreground">
          No pools match your search.
        </p>
      </div>
    );
  }

  // Group into "Near you" / "Other pools" only when distance-aware sorting is in
  // effect AND both groups are non-empty — otherwise a header would just add noise.
  const useGrouping = sortMode === "auto" && userLocation != null;
  if (useGrouping) {
    const nearPools = filteredPools.filter((p) => p.distance_km != null);
    const otherPools = filteredPools.filter((p) => p.distance_km == null);
    if (nearPools.length > 0 && otherPools.length > 0) {
      return (
        <div className="flex flex-col gap-8">
          <PoolGrid
            pools={nearPools}
            header={`Near you (${nearPools.length.toLocaleString()})`}
          />
          <PoolGrid
            pools={otherPools}
            header={`Other pools (${otherPools.length.toLocaleString()})`}
            headerHint="No location data — sorted by activity"
          />
        </div>
      );
    }
  }

  return <PoolGrid pools={filteredPools} />;
}

type PoolWithDistance = RouterOutputs["pool"]["list"][number] & {
  distance_km: number | null;
};

function PoolGrid({
  pools,
  header,
  headerHint,
}: {
  pools: PoolWithDistance[];
  header?: string;
  headerHint?: string;
}) {
  const { slice, sentinelRef, hasMore } = useProgressiveSlice(pools);
  return (
    <section>
      {header && (
        <div className="flex items-baseline justify-between gap-3 mb-3 pb-2 border-b">
          <h2 className="text-sm font-semibold tracking-tight">{header}</h2>
          {headerHint && (
            <span className="text-xs text-muted-foreground">{headerHint}</span>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {slice.map((pool, index) => (
          <PoolListItem
            key={pool.contract_address}
            pool={pool}
            priority={index === 0}
          />
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} className="h-px w-full" />}
    </section>
  );
}

function OffersView({
  searchTerm,
  searchTags,
  userLocation,
  onResultCountChange,
}: {
  searchTerm: string;
  searchTags: string[];
  userLocation: UserLocation | null;
  onResultCountChange: (count: number | null) => void;
}) {
  const { data: offers, isLoading } = trpc.products.marketplaceList.useQuery(
    undefined,
    { staleTime: STALE_TIME_MS },
  );

  const sortedOffers = useMemo(() => {
    if (!offers) return [];

    const withDistance = offers.map((offer) => ({
      ...offer,
      distance_km: distanceKmFromPoint(userLocation, offer.voucher_geo),
    }));

    if (userLocation) {
      return withDistance.sort((a, b) => {
        if (a.distance_km == null && b.distance_km == null) return 0;
        if (a.distance_km == null) return 1;
        if (b.distance_km == null) return -1;
        return a.distance_km - b.distance_km;
      });
    }

    return withDistance;
  }, [offers, userLocation]);

  const filteredOffers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return sortedOffers.filter((offer) => {
      const matchesSearch =
        term === "" ||
        offer.commodity_name.toLowerCase().includes(term) ||
        (offer.commodity_description ?? "").toLowerCase().includes(term) ||
        offer.voucher_symbol.toLowerCase().includes(term) ||
        (offer.voucher_name ?? "").toLowerCase().includes(term);
      const matchesTags =
        searchTags.length === 0 ||
        searchTags.every((tag) => offer.tags.includes(tag));
      return matchesSearch && matchesTags;
    });
  }, [sortedOffers, searchTerm, searchTags]);

  useEffect(() => {
    if (isLoading) {
      onResultCountChange(null);
    } else {
      onResultCountChange(filteredOffers.length);
    }
  }, [isLoading, filteredOffers.length, onResultCountChange]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {Array.from({ length: 10 }).map((_, idx) => (
          <OfferGridCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (filteredOffers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-12 px-4 text-center">
        <p className="text-base sm:text-lg text-muted-foreground">
          No offers match your search.
        </p>
      </div>
    );
  }

  return <OfferGrid offers={filteredOffers} />;
}

type OfferWithDistance = RouterOutputs["products"]["marketplaceList"][number] & {
  distance_km: number | null;
};

function OfferGrid({ offers }: { offers: OfferWithDistance[] }) {
  const { slice, sentinelRef, hasMore } = useProgressiveSlice(offers);
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {slice.map((offer) => (
          <Link key={offer.id} href={`/vouchers/${offer.voucher_address}`}>
            <OfferGridCard
              name={offer.commodity_name}
              imageUrl={offer.image_url || null}
              locationLabel={offer.location_name || null}
              priceDisplay={
                offer.price
                  ? (() => {
                      // Convert voucher-denominated price to its unit of account when
                      // the voucher exposes a value/UoA pair; fall back to the raw
                      // voucher symbol otherwise. Per voucher metadata convention:
                      //   1 voucherSymbol = voucher_value voucher_uoa
                      const numericPrice = Number(offer.price);
                      const canConvertToUoa =
                        Number.isFinite(numericPrice) &&
                        offer.voucher_value > 0 &&
                        !!offer.voucher_uoa;
                      const display = canConvertToUoa
                        ? formatCurrencyValue(
                            numericPrice * offer.voucher_value,
                            offer.voucher_uoa,
                            { maximumFractionDigits: 2 },
                          )
                        : null;
                      return (
                        <p className="text-xs font-bold tabular-nums whitespace-nowrap mt-0.5">
                          {display ?? (
                            <>
                              {truncateByDecimalPlace(offer.price, 2)}{" "}
                              <span className="text-xs font-medium text-muted-foreground">
                                {offer.voucher_symbol}
                              </span>
                            </>
                          )}
                          {offer.unit && (
                            <span className="text-xs text-muted-foreground">
                              {" "}
                              / {offer.unit}
                            </span>
                          )}
                        </p>
                      );
                    })()
                  : undefined
              }
            >
              {offer.distance_km != null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  <MapPin className="h-3 w-3" />
                  {formatDistanceKm(offer.distance_km)} away
                </span>
              )}
            </OfferGridCard>
          </Link>
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} className="h-px w-full" />}
    </>
  );
}

export function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<"pools" | "offers">("pools");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("auto");
  const [resultCount, setResultCount] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] =
    useState<LocationStatus>("idle");

  const { data: tags } = trpc.tags.list.useQuery(undefined, {
    staleTime: STALE_TIME_MS,
  });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(next);
        writeStoredLocation(next);
        setLocationStatus("granted");
      },
      () => {
        setLocationStatus("denied");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  };

  const clearLocation = () => {
    setUserLocation(null);
    setLocationStatus("idle");
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem(USER_LOCATION_STORAGE_KEY);
      } catch {
        // Ignore storage errors.
      }
    }
  };

  const handleLocationClick = () => {
    if (locationStatus === "granted") {
      clearLocation();
      return;
    }
    requestLocation();
  };

  useEffect(() => {
    // Hydrate location from sessionStorage post-mount to avoid SSR/CSR mismatch.
    const stored = readStoredLocation();
    if (stored) {
      setUserLocation(stored);
      setLocationStatus("granted");
      return;
    }
    if (typeof navigator === "undefined" || !navigator.permissions) {
      return;
    }
    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((result) => {
        if (result.state === "granted") {
          requestLocation();
        }
      })
      .catch(() => {
        // Ignore unsupported permission queries
      });
    // We intentionally only run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tagOptions = useMemo(
    () => (tags ?? []).map((t) => ({ value: t.tag, label: t.tag })),
    [tags],
  );

  const isPoolsTab = activeTab === "pools";

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as "pools" | "offers")}
      className="mt-4"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="w-full sm:w-auto h-11 p-1">
            <TabsTrigger
              value="pools"
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              Pools
            </TabsTrigger>
            <TabsTrigger
              value="offers"
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              Offers
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:max-w-sm">
            <Input
              type="text"
              placeholder={isPoolsTab ? "Search pools..." : "Search offers..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={18}
            />
          </div>
        </div>

        <div className="flex items-stretch gap-2 flex-wrap sm:flex-nowrap">
          <Button
            variant={locationStatus === "granted" ? "default" : "outline"}
            size="sm"
            onClick={handleLocationClick}
            disabled={locationStatus === "requesting"}
            aria-pressed={locationStatus === "granted"}
            className="gap-1.5 flex-1 sm:flex-none px-2 sm:px-3 min-w-0"
            title={
              locationStatus === "granted"
                ? "Sorting by distance — tap to turn off"
                : locationStatus === "denied"
                  ? "Location permission denied — enable it in your browser, then tap to retry"
                  : "Use my location to sort by distance"
            }
          >
            <LocateFixed className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {locationStatus === "requesting"
                ? "Locating…"
                : "Near me"}
            </span>
            {locationStatus === "granted" && (
              <span className="hidden xs:inline opacity-80">· On</span>
            )}
            {locationStatus === "denied" && (
              <span className="hidden xs:inline opacity-80">· Off</span>
            )}
          </Button>

          <div className="flex-1 sm:flex-none sm:w-56 min-w-0">
            <MultiSelect
              options={tagOptions}
              selected={searchTags}
              onChange={setSearchTags}
              placeholder="Tags"
            />
          </div>

          {isPoolsTab && (
            <Select
              value={sortMode}
              onValueChange={(value) => setSortMode(value as SortMode)}
            >
              <SelectTrigger className="h-9 flex-1 sm:flex-none sm:w-auto sm:min-w-[10rem] gap-1 px-2 sm:px-3 text-sm min-w-0">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  <span className="flex items-center gap-2">
                    <LocateFixed className="h-3.5 w-3.5" />
                    {userLocation ? "Nearest" : "Most active"}
                  </span>
                </SelectItem>
                <SelectItem value="swaps">
                  <span className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5" />
                    Most active
                  </span>
                </SelectItem>
                <SelectItem value="name">
                  <span className="flex items-center gap-2">
                    <ArrowDownAZ className="h-3.5 w-3.5" />
                    Name (A–Z)
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          )}

        </div>

        <div
          className="text-xs text-muted-foreground"
          aria-live="polite"
          aria-atomic="true"
        >
          {resultCount == null
            ? "\u00a0"
            : (() => {
                const noun = isPoolsTab
                  ? resultCount === 1
                    ? "pool"
                    : "pools"
                  : resultCount === 1
                    ? "offer"
                    : "offers";
                return userLocation
                  ? `${resultCount.toLocaleString()} ${noun} near you`
                  : `${resultCount.toLocaleString()} ${noun}`;
              })()}
        </div>
      </div>

      <TabsContent value="pools" className="mt-6">
        <PoolsView
          searchTerm={deferredSearchTerm}
          searchTags={searchTags}
          userLocation={userLocation}
          sortMode={sortMode}
          onResultCountChange={setResultCount}
        />
      </TabsContent>

      <TabsContent value="offers" className="mt-6">
        <OffersView
          searchTerm={deferredSearchTerm}
          searchTags={searchTags}
          userLocation={userLocation}
          onResultCountChange={setResultCount}
        />
      </TabsContent>
    </Tabs>
  );
}
