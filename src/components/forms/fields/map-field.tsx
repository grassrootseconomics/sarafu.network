"use client";

import { Loader2, LocateFixed, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type ControllerRenderProps,
  type UseFormReturn,
} from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useDebounce } from "~/hooks/use-debounce";
import {
  getLocation,
  searchLocations,
  type GeocodeSuggestion,
} from "~/lib/geocoder";
import { cn } from "~/lib/utils";
import { type FilterNamesByValue } from "./type-helper";

const LocationMap = dynamic(() => import("~/components/map/location-map"), {
  ssr: false,
});

interface MapFormFieldProps<F extends UseFormReturn> {
  label: string;
  form: F;
  description?: string;
  disabled?: boolean;
  disableSearch?: boolean;
  name: FilterNamesByValue<F, { x: number; y: number } | null | undefined>;
  locationName?: FilterNamesByValue<F, string | null | undefined>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MapField<F extends UseFormReturn<any>>({
  form,
  label,
  name,
  description,
  locationName,
  disabled,
  disableSearch: _disableSearch,
}: MapFormFieldProps<F>) {
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const userIsTyping = useRef(false);
  const debouncedQuery = useDebounce(searchQuery, 500);

  // Sync search input with existing locationName value (edit mode)
  const currentLocationName = locationName
    ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (form.watch(locationName) as string | null | undefined)
    : undefined;

  useEffect(() => {
    if (
      currentLocationName &&
      typeof currentLocationName === "string" &&
      !searchQuery
    ) {
      setSearchQuery(currentLocationName);
    }
    // Only run on mount / when the watched value changes externally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocationName]);

  // Debounced forward geocoding search — only when user is actively typing
  useEffect(() => {
    if (!userIsTyping.current) return;
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    let cancelled = false;
    setIsSearching(true);
    searchLocations(debouncedQuery)
      .then((results) => {
        if (!cancelled) {
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        }
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handelUpdateLocation = (
    field: ControllerRenderProps<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any,
      FilterNamesByValue<
        F,
        | {
            x: number;
            y: number;
          }
        | null
        | undefined
      >
    >,
    p: {
      latitude: number;
      longitude: number;
    },
  ) => {
    if (disabled) return;
    field.onChange({
      x: p.latitude,
      y: p.longitude,
    });
    if (!locationName) return;
    getLocation(p)
      .then((location) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        form.setValue(locationName, location);
        userIsTyping.current = false;
        setSearchQuery(location);
      })
      .catch(console.error);
  };

  const handleSelectSuggestion = useCallback(
    (
      field: ControllerRenderProps<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        FilterNamesByValue<
          F,
          | {
              x: number;
              y: number;
            }
          | null
          | undefined
        >
      >,
      suggestion: GeocodeSuggestion,
    ) => {
      field.onChange({
        x: suggestion.latitude,
        y: suggestion.longitude,
      });
      if (locationName) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        form.setValue(locationName, suggestion.text);
      }
      userIsTyping.current = false;
      setSearchQuery(suggestion.text);
      setShowSuggestions(false);
      setSuggestions([]);
    },
    [form, locationName],
  );

  const handleCurrentLocation = useCallback(
    (
      field: ControllerRenderProps<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        FilterNamesByValue<
          F,
          | {
              x: number;
              y: number;
            }
          | null
          | undefined
        >
      >,
    ) => {
      if (!navigator.geolocation) return;
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handelUpdateLocation(field, { latitude, longitude });
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting current location:", error);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, locationName, form],
  );

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="flex flex-col gap-2">
              {/* Search row */}
              <div ref={containerRef} className="relative flex flex-grow">
                <div className="flex items-center gap-1 flex-grow">
                  {/* Map toggle button */}
                  <Button
                    type="button"
                    size="icon"
                    variant={showMap ? "default" : "outline"}
                    className="shrink-0"
                    onClick={() => setShowMap(!showMap)}
                    disabled={disabled}
                    aria-label="Toggle map"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>

                  {/* Current location button */}
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => handleCurrentLocation(field)}
                    disabled={disabled || isLocating}
                    aria-label="Use current location"
                  >
                    {isLocating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LocateFixed className="h-4 w-4" />
                    )}
                  </Button>

                  {/* Autocomplete input */}
                  <Input
                    placeholder="Search for a location..."
                    value={searchQuery}
                    containerClassName="flex flex-grow"
                    onChange={(e) => {
                      userIsTyping.current = true;
                      setSearchQuery(e.target.value);
                      if (locationName) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        form.setValue(locationName, e.target.value);
                      }
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    disabled={disabled}
                    endAdornment={
                      isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : undefined
                    }
                  />
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 top-[100%] mt-1 w-full rounded-md border bg-popover shadow-md">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={`${suggestion.latitude}-${suggestion.longitude}-${idx}`}
                        type="button"
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                          idx === 0 && "rounded-t-md",
                          idx === suggestions.length - 1 && "rounded-b-md",
                        )}
                        onClick={() =>
                          handleSelectSuggestion(field, suggestion)
                        }
                      >
                        {suggestion.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Collapsible map */}
              {showMap && (
                <div className="w-full h-96 max-h-[30vh] rounded-md overflow-clip">
                  <LocationMap
                    disabled={disabled}
                    onCurrentLocation={(p) =>
                      handelUpdateLocation(field, p)
                    }
                    showSearchBar={false}
                    value={
                      field.value
                        ? {
                            latitude: field.value.x as number,
                            longitude: field.value.y as number,
                          }
                        : undefined
                    }
                    onChange={(p) => handelUpdateLocation(field, p)}
                  />
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
          {description && <FormDescription>{description}</FormDescription>}
        </FormItem>
      )}
    />
  );
}
