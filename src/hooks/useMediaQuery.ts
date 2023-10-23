import { useEffect, useState } from "react";

const BREAKPOINTS = {
  xs: "480px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
} as const;

export const DEVICE_BREAKPOINTS = {
  largeDesktop: "1440px",
  desktop: "992px",
  tablet: "768px",
  mobile: "320px",
};
export function useMediaQuery(query: string): boolean {
  const getMatches = (query: string): boolean => {
    // Prevents SSR issues
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  function handleChange() {
    setMatches(getMatches(query));
  }

  useEffect(() => {
    const matchMedia = window.matchMedia(query);

    // Triggered at the first client-side load and if query changes
    handleChange();

    // Listen matchMedia
    if (matchMedia.addListener) {
      matchMedia.addListener(handleChange);
    } else {
      matchMedia.addEventListener("change", handleChange);
    }

    return () => {
      if (matchMedia.removeListener) {
        matchMedia.removeListener(handleChange);
      } else {
        matchMedia.removeEventListener("change", handleChange);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return matches;
}

type BreakpointKey = keyof typeof BREAKPOINTS;

export function useBreakpoint<K extends BreakpointKey>(breakpointKey: K) {
  const breakpointValue = BREAKPOINTS[breakpointKey];
  const bool = useMediaQuery(`(max-width: ${breakpointValue})`);
  const capitalizedKey =
    breakpointKey[0]!.toUpperCase() + breakpointKey.substring(1);

  type KeyAbove = `isAbove${Capitalize<K>}`;
  type KeyBelow = `isBelow${Capitalize<K>}`;

  return {
    [breakpointKey]: Number(String(breakpointValue).replace(/[^0-9]/g, "")),
    [`isAbove${capitalizedKey}`]: !bool,
    [`isBelow${capitalizedKey}`]: bool,
  } as Record<typeof breakpointKey, number> &
    Record<KeyAbove | KeyBelow, boolean>;
}

export const useScreenType = () => {
  const isMobile = useMediaQuery(`(max-width: ${DEVICE_BREAKPOINTS.mobile})`);
  const isTablet = useMediaQuery(`(max-width: ${DEVICE_BREAKPOINTS.tablet})`);
  const isDesktop = useMediaQuery(`(max-width: ${DEVICE_BREAKPOINTS.desktop})`);
  const isLargeDesktop = useMediaQuery(
    `(max-width: ${DEVICE_BREAKPOINTS.largeDesktop})`
  );
  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
  };
};
