"use client";

import { useCallback, useMemo } from "react";

import { PaperWallet } from "~/utils/paper-wallet";

export function useTempPaperWallet() {
  const tempStorage = useMemo(() => {
    const storage = new Map<string, string>();
    return {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
      clear: () => {
        storage.clear();
      },
      length: storage.size,
      key: (index: number) => Array.from(storage.keys())[index] ?? null,
    } as Storage;
  }, []);

  const createPaperWallet = useCallback(
    (data: string): PaperWallet => {
      return new PaperWallet(data, tempStorage);
    },
    [tempStorage]
  );

  const clearStorage = useCallback(() => {
    tempStorage.clear();
  }, [tempStorage]);

  return { createPaperWallet, clearStorage };
}
