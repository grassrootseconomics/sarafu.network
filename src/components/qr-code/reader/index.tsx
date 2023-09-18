import * as React from "react";

import { useQrReader } from "./hooks";
import { styles } from "./styles";

import { type QrReaderProps } from "./types";

export const QrReader: React.FC<QrReaderProps> = ({
  videoStyle,
  constraints,
  scanDelay,
  onResult,
  videoId,
}) => {
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
QrReader.defaultProps = {
  constraints: {
    facingMode: { ideal: "environment" },
  },
  videoId: "qr-code-reader-video",
  scanDelay: 200,
};

export default QrReader;
