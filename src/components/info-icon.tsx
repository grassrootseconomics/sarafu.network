import { InfoCircledIcon } from "@radix-ui/react-icons";
import * as React from "react";
import { cn } from "~/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

import type { JSX } from "react";

type InfoIconProps = {
  content?: JSX.Element | string;
  className?: string;
};

export const InfoIcon: React.FC<InfoIconProps> = ({ content, className }) => {
  return (
    <HoverCard openDelay={50} closeDelay={50}>
      <HoverCardTrigger>
        <InfoCircledIcon
          className={cn(
            className,
            "cursor-pointer inline-flex mb-[2px] mx-1 text-gray-600"
          )}
        />
      </HoverCardTrigger>
      <HoverCardContent align="start" className="font-light py-2">
        {content}
      </HoverCardContent>
    </HoverCard>
  );
};
