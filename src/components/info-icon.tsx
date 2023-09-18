import { InfoCircledIcon } from "@radix-ui/react-icons";
import * as React from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

type InfoIconProps = {
  content?: JSX.Element | string;
};

export const InfoIcon: React.FC<InfoIconProps> = ({ content }) => {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <InfoCircledIcon className="inline-flex mb-[2px] mr-1" />
      </HoverCardTrigger>
      <HoverCardContent>{content}</HoverCardContent>
    </HoverCard>
  );
};
