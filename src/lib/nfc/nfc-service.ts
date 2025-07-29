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
  
  interface NDEFReader {
    scan(): Promise<void>
    write(message: NDEFMessageInit): Promise<void>
    addEventListener(type: string, listener: (event: any) => void): void
  }
  
  interface NDEFMessageInit {
    records: NDEFRecordInit[]
  }
  
  interface NDEFRecordInit {
    recordType: string
    data: string
  }
}

class NFCService {
  private reader: NDEFReader | null = null
  private isCurrentlyReading = false

  /**
   * Check if NFC is supported on the current device/browser
   */
  isNFCSupported(): boolean {
    return "NDEFReader" in window
  }

  /**
   * Start reading NFC tags
   */
  async startReading(
    onRead: NFCEventCallback,
    onError: NFCErrorCallback,
    onStatus: NFCStatusCallback,
  ): Promise<boolean> {
    if (!this.isNFCSupported()) {
      onError("NFC is not supported on this device or browser")
      return false
    }

    if (this.isCurrentlyReading) {
      onError("Already reading NFC tags")
      return false
    }

    try {
      if (!window.NDEFReader) throw new Error("NDEFReader not available")
      
      this.reader = new window.NDEFReader()
      await this.reader.scan()
      this.isCurrentlyReading = true

      onStatus("Hold your device near an NFC tag to read...")

      this.reader.addEventListener("reading", ({ message }: any) => {
        onStatus("NFC tag detected! Reading data...")

        const result = this.parseNFCMessage(message)
        onRead(result)
        onStatus("Successfully read NFC tag!")
      })

      this.reader.addEventListener("readingerror", () => {
        const error = "Error reading NFC tag"
        onError(error)
        this.isCurrentlyReading = false
      })

      return true
    } catch (error: any) {
      const errorMessage = `Error starting NFC reader: ${error.message}`
      onError(errorMessage)
      this.isCurrentlyReading = false
      return false
    }
  }

  /**
   * Stop reading NFC tags
   */
  async stopReading(): Promise<void> {
    try {
      // Note: There's no official stop method in the Web NFC API
      // The reader will continue until the page is closed or refreshed
      this.isCurrentlyReading = false
      this.reader = null
    } catch (error) {
      console.warn("Error stopping NFC reader:", error)
    }
  }

  /**
   * Reset the NFC service state
   */
  reset(): void {
    this.isCurrentlyReading = false
    this.reader = null
  }

  /**
   * Write data to an NFC tag
   */
  async writeToTag(
    data: string,
    onSuccess: () => void,
    onError: NFCErrorCallback,
    onStatus: NFCStatusCallback,
  ): Promise<NFCWriteResult> {
    if (!this.isNFCSupported()) {
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
      if (!window.NDEFReader) throw new Error("NDEFReader not available")
      
      onStatus("Hold your device near an NFC tag to write...")

      const ndef = new window.NDEFReader()
      await ndef.write({
        records: [{ recordType: "text", data }],
      })

      onSuccess()
      onStatus("Successfully wrote to NFC tag!")
      return { success: true }
    } catch (error: any) {
      const errorMessage = `Error writing to NFC tag: ${error.message}`
      onError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Write URL to an NFC tag
   */
  async writeUrlToTag(
    url: string,
    onSuccess: () => void,
    onError: NFCErrorCallback,
    onStatus: NFCStatusCallback,
  ): Promise<NFCWriteResult> {
    if (!this.isNFCSupported()) {
      const error = "NFC is not supported on this device or browser"
      onError(error)
      return { success: false, error }
    }

    try {
      if (!window.NDEFReader) throw new Error("NDEFReader not available")
      
      onStatus("Hold your device near an NFC tag to write URL...")

      const ndef = new window.NDEFReader()
      await ndef.write({
        records: [{ recordType: "url", data: url }],
      })

      onSuccess()
      onStatus("Successfully wrote URL to NFC tag!")
      return { success: true }
    } catch (error: any) {
      const errorMessage = `Error writing URL to NFC tag: ${error.message}`
      onError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Parse NFC message and extract readable data
   */
  private parseNFCMessage(message: any): NFCReadResult {
    try {
      let data = ""

      for (const record of message.records) {
        if (record.recordType === "text") {
          const textDecoder = new TextDecoder(record.encoding || "utf-8")
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
    } catch (error: any) {
      return {
        data: "",
        success: false,
        error: `Error parsing NFC data: ${error.message}`,
      }
    }
  }

  /**
   * Get current reading status
   */
  isReading(): boolean {
    return this.isCurrentlyReading
  }
}

// Export singleton instance
export const nfcService = new NFCService()
