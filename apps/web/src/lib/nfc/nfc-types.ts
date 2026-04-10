export interface NFCReadResult {
  data: string
  success: boolean
  error?: string
}

export interface NFCWriteResult {
  success: boolean
  error?: string
}

export interface NFCStatus {
  isSupported: boolean
  isReading: boolean
  isWriting: boolean
  message: string
  error?: string
}

export interface NFCRecord {
  recordType: string
  data: string
  encoding?: string
}

export interface NFCMessage {
  records: NFCRecord[]
}

export type NFCEventCallback = (result: NFCReadResult) => void
export type NFCErrorCallback = (error: string) => void
export type NFCStatusCallback = (status: string) => void
