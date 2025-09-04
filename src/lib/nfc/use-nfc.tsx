"use client";

import { useCallback, useEffect, useState } from "react";
import { nfcService } from "./nfc-service";
import type { NFCStatus } from "./nfc-types";

export function useNFC() {
  const [nfcStatus, setNfcStatus] = useState<NFCStatus>({
    isSupported: false,
    isReading: false,
    isWriting: false,
    message: "Checking NFC support...",
  });
  const [readData, setReadData] = useState<string>();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const isSupported = nfcService.isNFCSupported();
    setNfcStatus((prev) => ({
      ...prev,
      isSupported,
      message: isSupported
        ? "NFC is supported on this device"
        : "NFC is not supported on this device or browser",
    }));
  }, []);

  const startReading = useCallback(async () => {
    if (!nfcStatus.isSupported) return false;

    setNfcStatus((prev) => ({ ...prev, isReading: true }));
    setError("");

    const success = await nfcService.startReading(
      (result) => {
        if (result.success && result.data) {
          setReadData(result.data);
        } else {
          setError(result.error || "Unknown error occurred");
        }
        setNfcStatus((prev) => ({ ...prev, isReading: false }));
      },
      (errorMessage) => {
        setError(errorMessage);
        setNfcStatus((prev) => ({ ...prev, isReading: false }));
      },
      (message) => {
        setNfcStatus((prev) => ({ ...prev, message }));
      }
    );

    if (!success) {
      setNfcStatus((prev) => ({ ...prev, isReading: false }));
    }

    return success;
  }, [nfcStatus.isSupported]);

  const stopReading = useCallback(() => {
    nfcService.stopReading();
    setNfcStatus((prev) => ({
      ...prev,
      isReading: false,
      message: "Stopped reading",
    }));
  }, []);

  const writeUrlToTag = useCallback(
    async (url: string) => {
      if (!nfcStatus.isSupported || !url.trim()) return false;

      setNfcStatus((prev) => ({ ...prev, isWriting: true }));
      setError("");

      const result = await nfcService.writeUrlToTag(
        url,
        () => {
          setNfcStatus((prev) => ({ ...prev, isWriting: false }));
        },
        (errorMessage) => {
          setError(errorMessage);
          setNfcStatus((prev) => ({ ...prev, isWriting: false }));
        },
        (message) => {
          setNfcStatus((prev) => ({ ...prev, message }));
        }
      );

      return result.success;
    },
    [nfcStatus.isSupported]
  );

  const checkNFCTagData = useCallback(async () => {
    if (!nfcStatus.isSupported) return { hasData: false };

    setError("");

    const result = await nfcService.checkNFCTagData(
      (message) => {
        setNfcStatus((prev) => ({ ...prev, message }));
      },
      (errorMessage) => {
        setError(errorMessage);
      }
    );

    return result;
  }, [nfcStatus.isSupported]);

  const clearData = useCallback(() => {
    setReadData(undefined);
    setError("");
    nfcService.reset();
    setNfcStatus((prev) => ({
      ...prev,
      isReading: false,
      message: prev.isSupported
        ? "Ready to read or write NFC tags"
        : "NFC not supported",
    }));
  }, []);

  return {
    nfcStatus,
    readData,
    error,
    startReading,
    stopReading,
    writeUrlToTag,
    checkNFCTagData,
    clearData,
  };
}
