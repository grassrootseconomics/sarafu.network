"use client"

import React from "react"
import { useSidebarToggle } from "~/hooks/use-sidebar-toggle"
import { useStore } from "~/hooks/use-store"
import { useAuth } from "~/hooks/useAuth"
import { useIsMounted } from "~/hooks/useIsMounted"
import { useScreenType } from "~/hooks/useMediaQuery"
import { cn } from "~/lib/utils"
import { WalletNavBar } from "~/components/layout/mobile-wallet-bar"

interface Props {
  children: React.ReactNode
}

export function DefaultLayout({ children }: Props) {
  const { isTablet } = useScreenType()
  const auth = useAuth()
  const mounted = useIsMounted()
  const shouldRenderNavBar = isTablet && mounted && auth?.user
  const sidebar = useStore(useSidebarToggle, (state) => state)

  return (
    <div
      className={cn(
        "min-h-[calc(100vh_-_56px)] transition-[margin-left] ease-in-out duration-300",
        sidebar?.isOpen === false ? "lg:ml-[90px]" : "lg:ml-72",
        shouldRenderNavBar ? "pb-[76px]" : ""
      )}
    >
      {children}
      {shouldRenderNavBar && <WalletNavBar />}
    </div>
  )
}