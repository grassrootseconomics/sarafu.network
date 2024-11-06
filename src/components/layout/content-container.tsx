"use client";
import { useScreenType } from "~/hooks/useMediaQuery";
import { Background } from "./background";

interface ContentContainerProps {
  title: string;
  Icon?: React.ElementType;
  children: React.ReactNode;
  animate?: boolean;
}

export function ContentContainer({
  children,
  animate = true,
}: ContentContainerProps) {
  const screen = useScreenType();
  const shouldAnimate = animate && !screen.isMobile; // Only animate on desktop
  return (
    <div className="relative container">
      <Background animate={shouldAnimate} />
      {children}
    </div>
  );
}
