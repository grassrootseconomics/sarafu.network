import * as React from "react";

import { useQrReader } from "./hooks";
import { styles } from "./styles";

import { QrReaderProps } from "./types";

export const QrReader: React.FC<QrReaderProps> = ({
  videoContainerStyle,
  containerStyle,
  videoStyle,
  constraints,
  ViewFinder,
  scanDelay,
  className,
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
    <section className={className} style={containerStyle}>
      <div
        style={{
          ...styles.container,
          ...videoContainerStyle,
        }}
      >
        {!!ViewFinder && <ViewFinder />}
        <video
          muted
          ref={videoRef}
          style={{
            ...styles.video,
            ...videoStyle,
            transform: constraints?.facingMode === "user" && "scaleX(-1)",
          }}
        />
      </div>
    </section>
  );
};

QrReader.displayName = "QrReader";
QrReader.defaultProps = {
  constraints: {
    facingMode: "user",
  },
  videoId: "qr-code-reader-video",
  scanDelay: 500,
};

export default QrReader;
