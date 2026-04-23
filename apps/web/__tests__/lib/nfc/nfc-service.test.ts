import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock global NFC interfaces
const mockNDEFReader = {
  scan: vi.fn(),
  write: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

const mockNDEFMessage = {
  records: [
    {
      recordType: "text",
      data: new TextEncoder().encode("test data"),
      encoding: "utf-8",
    },
  ],
};

// Mock window.NDEFReader
Object.defineProperty(window, "NDEFReader", {
  writable: true,
  configurable: true,
  value: vi.fn(() => mockNDEFReader),
});

describe("NFC Service", () => {
  let nfcService: any;
  let originalNDEFReader: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Store original and restore NDEFReader
    originalNDEFReader = (window as any).NDEFReader;
    Object.defineProperty(window, "NDEFReader", {
      writable: true,
      configurable: true,
      value: vi.fn(() => mockNDEFReader),
    });
    // Reset the module to get a fresh instance
    vi.resetModules();
    const module = await import("~/lib/nfc/nfc-service");
    nfcService = module.nfcService;
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Restore original NDEFReader
    if (originalNDEFReader) {
      Object.defineProperty(window, "NDEFReader", {
        writable: true,
        configurable: true,
        value: originalNDEFReader,
      });
    } else {
      delete (window as any).NDEFReader;
    }
  });

  const mockNDEFReaderUnavailable = () => {
    Object.defineProperty(window, "NDEFReader", {
      writable: true,
      configurable: true,
      value: undefined,
    });
  };

  describe("isNFCSupported", () => {
    it("should return true when NDEFReader is available", () => {
      expect(nfcService.isNFCSupported()).toBe(true);
    });

    it("should return false when NDEFReader is not available", () => {
      mockNDEFReaderUnavailable();
      expect(nfcService.isNFCSupported()).toBe(false);
    });
  });

  describe("startReading", () => {
    const mockOnRead = vi.fn();
    const mockOnError = vi.fn();
    const mockOnStatus = vi.fn();

    beforeEach(() => {
      mockOnRead.mockClear();
      mockOnError.mockClear();
      mockOnStatus.mockClear();
      mockNDEFReader.scan.mockResolvedValue(undefined);
    });

    it("should start reading successfully", async () => {
      const result = await nfcService.startReading(
        mockOnRead,
        mockOnError,
        mockOnStatus
      );

      expect(result).toBe(true);
      expect(mockNDEFReader.scan).toHaveBeenCalled();
      expect(mockOnStatus).toHaveBeenCalledWith(
        "Hold your device near an NFC tag to read..."
      );
      expect(mockNDEFReader.addEventListener).toHaveBeenCalledTimes(2);
    });

    it("should handle NFC not supported", async () => {
      // @ts-expect-error - Intentionally delete for testing
      mockNDEFReaderUnavailable();

      const result = await nfcService.startReading(
        mockOnRead,
        mockOnError,
        mockOnStatus
      );

      expect(result).toBe(false);
      expect(mockOnError).toHaveBeenCalledWith(
        "NFC is not supported on this device or browser"
      );
    });

    it("should retry on failure", async () => {
      mockNDEFReader.scan
        .mockRejectedValueOnce(new Error("First attempt failed"))
        .mockRejectedValueOnce(new Error("Second attempt failed"))
        .mockResolvedValueOnce(undefined);

      const result = await nfcService.startReading(
        mockOnRead,
        mockOnError,
        mockOnStatus
      );

      expect(result).toBe(true);
      expect(mockNDEFReader.scan).toHaveBeenCalledTimes(3);
    });

    it("should handle reading event correctly", async () => {
      let readingListener: (event: any) => void;

      mockNDEFReader.addEventListener.mockImplementation(
        (eventType: string, listener: any) => {
          if (eventType === "reading") {
            readingListener = listener;
          }
        }
      );

      await nfcService.startReading(mockOnRead, mockOnError, mockOnStatus);

      // Simulate reading event
      readingListener!({ message: mockNDEFMessage });

      expect(mockOnStatus).toHaveBeenCalledWith(
        "NFC tag detected! Reading data..."
      );
      expect(mockOnRead).toHaveBeenCalledWith({
        data: "test data",
        success: true,
      });
      expect(mockOnStatus).toHaveBeenCalledWith("Successfully read NFC tag!");
    });

    it("should handle reading error event", async () => {
      let errorListener: (event: any) => void;

      mockNDEFReader.addEventListener.mockImplementation(
        (eventType: string, listener: any) => {
          if (eventType === "readingerror") {
            errorListener = listener;
          }
        }
      );

      await nfcService.startReading(mockOnRead, mockOnError, mockOnStatus);

      // Simulate error event
      errorListener!(new Event("error"));

      expect(mockOnError).toHaveBeenCalledWith("Error reading NFC tag");
    });
  });

  describe("error boundary integration", () => {
    it("should handle malformed NFC data gracefully", async () => {
      const malformedMessage = {
        records: [
          {
            recordType: "unknown",
            data: null, // Invalid data
            encoding: undefined,
          },
        ],
      };

      let readingListener: (event: any) => void;
      const mockOnRead = vi.fn();

      mockNDEFReader.addEventListener.mockImplementation(
        (eventType: string, listener: any) => {
          if (eventType === "reading") {
            readingListener = listener;
          }
        }
      );

      await nfcService.startReading(mockOnRead, vi.fn(), vi.fn());

      // Simulate malformed reading event
      readingListener!({ message: malformedMessage });

      expect(mockOnRead).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining("Error parsing NFC data"),
        })
      );
    });
  });
});
