import type { NFCReadResult, NFCWriteResult, NFCEventCallback, NFCErrorCallback, NFCStatusCallback } from "./nfc-types"

declare global {
  interface Navigator {
    nfc?: unknown
  }
  interface Window {
    NDEFReader?: {
      new(): NDEFReader
    }
    NDEFWriter?: unknown
  }
  
  interface NDEFReadingEvent {
    message: NDEFMessage
  }

  interface NDEFMessage {
    records: NDEFRecord[]
  }

  interface NDEFRecord {
    recordType: string
    data: ArrayBuffer
    encoding?: string
  }

  interface NDEFReader {
    scan(): Promise<void>
    write(message: NDEFMessageInit): Promise<void>
    addEventListener(type: 'reading', listener: (event: NDEFReadingEvent) => void): void
    addEventListener(type: 'readingerror', listener: (event: Event) => void): void
    addEventListener(type: string, listener: (event: Event) => void): void
  }
  
  interface NDEFMessageInit {
    records: NDEFRecordInit[]
  }
  
  interface NDEFRecordInit {
    recordType: string
    data: string
  }
}

interface NFCServiceState {
  reader: NDEFReader | null
  isCurrentlyReading: boolean
  activeListeners: Map<string, EventListener>
}

interface RetryOptions {
  maxRetries: number
  retryDelay: number
  backoffMultiplier: number
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
}

/**
 * Create NFC service using functional programming approach
 */
function createNFCService() {
  const state: NFCServiceState = {
    reader: null,
    isCurrentlyReading: false,
    activeListeners: new Map(),
  }

  /**
   * Check if NFC is supported on the current device/browser
   */
  function isNFCSupported(): boolean {
    return "NDEFReader" in window
  }

  /**
   * Clean up resources and event listeners
   */
  function cleanup(): void {
    try {
      // Remove all event listeners
      if (state.reader) {
        state.activeListeners.forEach((listener, eventType) => {
          state.reader?.removeEventListener?.(eventType, listener)
        })
        state.activeListeners.clear()
      }

      // Reset state
      state.reader = null
      state.isCurrentlyReading = false
    } catch (error) {
      console.warn("Error during NFC cleanup:", error)
    }
  }

  /**
   * Sleep utility for retry delays
   */
  function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Retry wrapper for NFC operations
   */
  async function withRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const { maxRetries, retryDelay, backoffMultiplier } = { ...DEFAULT_RETRY_OPTIONS, ...options }
    let lastError: Error
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        if (attempt === maxRetries) {
          throw lastError
        }
        
        const delay = retryDelay * Math.pow(backoffMultiplier, attempt)
        await sleep(delay)
        
        // Log retry attempt (avoid revealing sensitive information)
        console.warn(`NFC operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`)
      }
    }
    
    throw lastError!
  }

  /**
   * Start reading NFC tags with retry logic
   */
  async function startReading(
    onRead: NFCEventCallback,
    onError: NFCErrorCallback,
    onStatus: NFCStatusCallback,
    retryOptions?: Partial<RetryOptions>
  ): Promise<boolean> {
    if (!isNFCSupported()) {
      onError("NFC is not supported on this device or browser")
      return false
    }

    if (state.isCurrentlyReading) {
      onError("Already reading NFC tags")
      return false
    }

    try {
      await withRetry(async () => {
        if (!window.NDEFReader) throw new Error("NDEFReader not available")
        
        // Clean up any existing state
        cleanup()
        
        state.reader = new window.NDEFReader()
        await state.reader.scan()
        state.isCurrentlyReading = true

        onStatus("Hold your device near an NFC tag to read...")

        // Set up event listeners with proper cleanup tracking
        const readingListener = ({ message }: NDEFReadingEvent) => {
          onStatus("NFC tag detected! Reading data...")
          
          const result = parseNFCMessage(message)
          onRead(result)
          onStatus("Successfully read NFC tag!")
        }

        const errorListener = (event: Event) => {
          const error = "Error reading NFC tag"
          console.error("NFC reading error:", event)
          onError(error)
          state.isCurrentlyReading = false
        }

        state.reader.addEventListener("reading", readingListener)
        state.reader.addEventListener("readingerror", errorListener)

        // Track listeners for cleanup
        state.activeListeners.set("reading", readingListener)
        state.activeListeners.set("readingerror", errorListener)
      }, retryOptions)

      return true
    } catch (error: unknown) {
      const errorMessage = `Error starting NFC reader: ${error instanceof Error ? error.message : 'Unknown error'}`
      onError(errorMessage)
      state.isCurrentlyReading = false
      return false
    }
  }

  /**
   * Stop reading NFC tags with proper cleanup
   */
  function stopReading(): void {
    try {
      cleanup()
    } catch (error) {
      console.warn("Error stopping NFC reader:", error)
    }
  }

  /**
   * Reset the NFC service state
   */
  function reset(): void {
    cleanup()
  }

  /**
   * Write data to an NFC tag with retry logic
   */
  async function writeToTag(
    data: string,
    onSuccess: () => void,
    onError: NFCErrorCallback,
    onStatus: NFCStatusCallback,
    retryOptions?: Partial<RetryOptions>
  ): Promise<NFCWriteResult> {
    if (!isNFCSupported()) {
      const error = "NFC is not supported on this device or browser"
      onError(error)
      return { success: false, error }
    }

    if (!data.trim()) {
      const error = "No data provided to write"
      onError(error)
      return { success: false, error }
    }

    try {
      await withRetry(async () => {
        if (!window.NDEFReader) throw new Error("NDEFReader not available")
        
        onStatus("Hold your device near an NFC tag to write...")

        const ndef = new window.NDEFReader()
        await ndef.write({
          records: [{ recordType: "text", data }],
        })

        onSuccess()
        onStatus("Successfully wrote to NFC tag!")
      }, retryOptions)

      return { success: true }
    } catch (error: unknown) {
      const errorMessage = `Error writing to NFC tag: ${error instanceof Error ? error.message : 'Unknown error'}`
      onError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Write URL to an NFC tag with retry logic
   */
  async function writeUrlToTag(
    url: string,
    onSuccess: () => void,
    onError: NFCErrorCallback,
    onStatus: NFCStatusCallback,
    retryOptions?: Partial<RetryOptions>
  ): Promise<NFCWriteResult> {
    if (!isNFCSupported()) {
      const error = "NFC is not supported on this device or browser"
      onError(error)
      return { success: false, error }
    }

    try {
      await withRetry(async () => {
        if (!window.NDEFReader) throw new Error("NDEFReader not available")
        
        onStatus("Hold your device near an NFC tag to write URL...")

        const ndef = new window.NDEFReader()
        await ndef.write({
          records: [{ recordType: "url", data: url }],
        })

        onSuccess()
        onStatus("Successfully wrote URL to NFC tag!")
      }, retryOptions)

      return { success: true }
    } catch (error: unknown) {
      const errorMessage = `Error writing URL to NFC tag: ${error instanceof Error ? error.message : 'Unknown error'}`
      onError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Parse NFC message and extract readable data
   */
  function parseNFCMessage(message: NDEFMessage): NFCReadResult {
    try {
      let data = ""

      for (const record of message.records) {
        if (record.recordType === "text") {
          const textDecoder = new TextDecoder(record.encoding ?? "utf-8")
          data += textDecoder.decode(record.data)
        } else if (record.recordType === "url") {
          const textDecoder = new TextDecoder()
          data += textDecoder.decode(record.data)
        } else {
          data += `Record type: ${record.recordType}\n`
        }
      }

      return {
        data: data || "No readable text data found",
        success: true,
      }
    } catch (error: unknown) {
      return {
        data: "",
        success: false,
        error: `Error parsing NFC data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Get current reading status
   */
  function isReading(): boolean {
    return state.isCurrentlyReading
  }

  return {
    isNFCSupported,
    startReading,
    stopReading,
    reset,
    writeToTag,
    writeUrlToTag,
    isReading,
  }
}

// Export singleton instance
export const nfcService = createNFCService()
