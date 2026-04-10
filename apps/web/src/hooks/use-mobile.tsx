import * as React from "react"
import { useMounted } from "./use-mounted"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const mounted = useMounted()
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Return undefined during SSR/hydration, actual value after mount
  return mounted ? isMobile : undefined
}
