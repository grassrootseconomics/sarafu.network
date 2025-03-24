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
}: QrReaderProps) => {
  const { videoRef } = useQrReader({
    constraints,
    scanDelay,
    onResult,
    videoId,
  });

  return (
    <video
      muted
      ref={videoRef}
      className={"overflow-hidden rounded-md"}
      style={{
        ...styles.video,
        ...videoStyle,
        transform: constraints?.facingMode === "user" ? "scaleX(-1)" : "",
      }}
    />
  );
};

QrReader.displayName = "QrReader";

export default QrReader;
