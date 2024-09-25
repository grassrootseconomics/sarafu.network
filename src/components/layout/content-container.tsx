"use client";
import { Navbar } from "~/components/layout/navbar";
import { useScreenType } from "~/hooks/useMediaQuery";
import { truncateString } from "~/utils/string";
import { Background } from "./background";

interface ContentContainerProps {
  title: string;
  Icon?: React.ElementType;
  children: React.ReactNode;
  animate?: boolean;
}

export function ContentContainer({
  title,
  children,
  Icon,
  animate = true,
}: ContentContainerProps) {
  const screen = useScreenType();
  const titleR = truncateString(
    title,
    screen.isMobile ? 5 : screen.isTablet ? 10 : title.length
  );
  const shouldAnimate = animate && !screen.isMobile; // Only animate on desktop
  return (
    <div className="relative">
      <Background animate={shouldAnimate} />
      <Navbar title={titleR} Icon={Icon} />
      <div className="container my-2 md:px-8">{children}</div>
    </div>
  );
}

