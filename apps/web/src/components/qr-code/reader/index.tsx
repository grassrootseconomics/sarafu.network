import * as React from "react";

import { useQrReader } from "./hooks";
import { styles } from "./styles";

import { type QrReaderProps } from "./types";

export const QrReader: React.FC<QrReaderProps> = ({
  videoStyle,
  constraints = {
    facingMode: { ideal: "environment" },
  },
  scanDelay = 200,
  onResult,
  videoId = "qr-code-reader-video",
  className = "",
}: QrReaderProps) => {
  const { videoRef } = useQrReader({
    constraints,
    scanDelay,
    onResult,
    videoId,
  });

  return (
    <video
      id={videoId}
      muted
      ref={videoRef}
      className={`overflow-hidden rounded-md ${className}`}
      style={{
        ...styles.video,
        ...videoStyle,
        transform: constraints?.facingMode === "user" ? "scaleX(-1)" : "",
      }}
      autoPlay
      playsInline
    />
  );
};

QrReader.displayName = "QrReader";

export default QrReader;
