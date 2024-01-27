import React from "react";
import { ExpandIcon, ShrinkIcon } from "lucide-react";

interface FullScreenButtonProps {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

export const FullScreenButton: React.FC<FullScreenButtonProps> = ({ isFullscreen, toggleFullscreen }) => (
  <button onClick={toggleFullscreen} className="absolute top-0 right-0 z-10">
    {isFullscreen ? <ShrinkIcon size={24} /> : <ExpandIcon size={24} />}
  </button>
);
