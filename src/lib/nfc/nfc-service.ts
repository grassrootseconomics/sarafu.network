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
    addEventListener(type: string, listener: EventListener): void
    removeEventListener(type: string, listener: EventListener): void
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
    return "NDEFReader" in window && window.NDEFReader !== undefined
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

    // Retry logic with max 3 attempts
    const maxRetries = 3
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.reader = new window.NDEFReader!()
        await this.reader.scan()
        this.isCurrentlyReading = true

        onStatus("Hold your device near an NFC tag to read...")

        this.reader.addEventListener("reading", (event: Event) => {
          const ndefEvent = event as unknown as NDEFReadingEvent
          onStatus("NFC tag detected! Reading data...")

          const result = this.parseNFCMessage(ndefEvent.message)
          onRead(result)
          onStatus("Successfully read NFC tag!")
        })

        this.reader.addEventListener("readingerror", () => {
          const error = "Error reading NFC tag"
          onError(error)
          this.isCurrentlyReading = false
        })

        return true
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        this.isCurrentlyReading = false
        
        if (attempt === maxRetries) {
          const errorMessage = `Error starting NFC reader: ${lastError.message}`
          onError(errorMessage)
          return false
        }
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // This should never be reached, but just in case
    const errorMessage = `Error starting NFC reader: ${lastError?.message || 'Unknown error'}`
    onError(errorMessage)
    return false
  }

  /**
   * Stop reading NFC tags
   */
  stopReading(): void {
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
   * Check if an NFC tag has existing data
   */
  async checkNFCTagData(
    onStatus: NFCStatusCallback,
    onError: NFCErrorCallback,
  ): Promise<{ hasData: boolean; data?: string }> {
    if (!this.isNFCSupported()) {
      const error = "NFC is not supported on this device or browser"
      onError(error)
      return { hasData: false }
    }

    try {
      onStatus("Hold your device near an NFC tag to check for existing data...")

      const ndef = new window.NDEFReader!()
      
      return new Promise((resolve) => {
        let hasResolved = false
        
        const handleReading = (event: Event) => {
          if (hasResolved) return
          hasResolved = true
          
          const ndefEvent = event as unknown as NDEFReadingEvent
          const result = this.parseNFCMessage(ndefEvent.message)
          
          ndef.removeEventListener("reading", handleReading)
          ndef.removeEventListener("readingerror", handleError)
          
          if (result.success && result.data && result.data.trim() !== "No readable text data found") {
            resolve({ hasData: true, data: result.data })
          } else {
            resolve({ hasData: false })
          }
        }
        
        const handleError = () => {
          if (hasResolved) return
          hasResolved = true
          
          ndef.removeEventListener("reading", handleReading)
          ndef.removeEventListener("readingerror", handleError)
          resolve({ hasData: false })
        }

        ndef.addEventListener("reading", handleReading)
        ndef.addEventListener("readingerror", handleError)
        
        ndef.scan().catch((error) => {
          if (hasResolved) return
          hasResolved = true
          
          onError(`Error scanning NFC tag: ${error instanceof Error ? error.message : 'Unknown error'}`)
          resolve({ hasData: false })
        })
      })
    } catch (error: unknown) {
      const errorMessage = `Error checking NFC tag: ${error instanceof Error ? error.message : 'Unknown error'}`
      onError(errorMessage)
      return { hasData: false }
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
      onStatus("Hold your device near an NFC tag to write URL...")

      const ndef = new window.NDEFReader!()
      await ndef.write({
        records: [{ recordType: "url", data: url }],
      })

      onSuccess()
      onStatus("Successfully wrote URL to NFC tag!")
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
  private parseNFCMessage(message: NDEFMessage): NFCReadResult {
    try {
      let data = ""

      for (const record of message.records) {
        // Check for invalid data
        if (!record.data) {
          throw new Error(`Invalid NFC record data: ${record.recordType}`)
        }

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
  isReading(): boolean {
    return this.isCurrentlyReading
  }
}

// Export singleton instance
export const nfcService = new NFCService()
