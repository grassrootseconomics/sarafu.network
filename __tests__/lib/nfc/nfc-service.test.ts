import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock global NFC interfaces
const mockNDEFReader = {
  scan: vi.fn(),
  write: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}

const mockNDEFMessage = {
  records: [
    {
      recordType: 'text',
      data: new TextEncoder().encode('test data'),
      encoding: 'utf-8',
    },
  ],
}

// Mock window.NDEFReader
Object.defineProperty(window, 'NDEFReader', {
  writable: true,
  configurable: true,
  value: vi.fn(() => mockNDEFReader),
})

describe('NFC Service', () => {
  let nfcService: any
  let originalNDEFReader: any

  beforeEach(async () => {
    vi.clearAllMocks()
    // Store original and restore NDEFReader
    originalNDEFReader = (window as any).NDEFReader
    Object.defineProperty(window, 'NDEFReader', {
      writable: true,
      configurable: true,
      value: vi.fn(() => mockNDEFReader),
    })
    // Reset the module to get a fresh instance
    vi.resetModules()
    const module = await import('~/lib/nfc/nfc-service')
    nfcService = module.nfcService
  })

  afterEach(() => {
    vi.clearAllMocks()
    // Restore original NDEFReader
    if (originalNDEFReader) {
      Object.defineProperty(window, 'NDEFReader', {
        writable: true,
        configurable: true,
        value: originalNDEFReader,
      })
    } else {
      delete (window as any).NDEFReader
    }
  })

  const mockNDEFReaderUnavailable = () => {
    Object.defineProperty(window, 'NDEFReader', {
      writable: true,
      configurable: true,
      value: undefined,
    })
  }

  describe('isNFCSupported', () => {
    it('should return true when NDEFReader is available', () => {
      expect(nfcService.isNFCSupported()).toBe(true)
    })

    it('should return false when NDEFReader is not available', () => {
      mockNDEFReaderUnavailable()
      expect(nfcService.isNFCSupported()).toBe(false)
    })
  })

  describe('startReading', () => {
    const mockOnRead = vi.fn()
    const mockOnError = vi.fn()
    const mockOnStatus = vi.fn()

    beforeEach(() => {
      mockOnRead.mockClear()
      mockOnError.mockClear()
      mockOnStatus.mockClear()
      mockNDEFReader.scan.mockResolvedValue(undefined)
    })

    it('should start reading successfully', async () => {
      const result = await nfcService.startReading(mockOnRead, mockOnError, mockOnStatus)

      expect(result).toBe(true)
      expect(mockNDEFReader.scan).toHaveBeenCalled()
      expect(mockOnStatus).toHaveBeenCalledWith('Hold your device near an NFC tag to read...')
      expect(mockNDEFReader.addEventListener).toHaveBeenCalledTimes(2)
    })

    it('should handle NFC not supported', async () => {
      // @ts-expect-error - Intentionally delete for testing
      mockNDEFReaderUnavailable()

      const result = await nfcService.startReading(mockOnRead, mockOnError, mockOnStatus)

      expect(result).toBe(false)
      expect(mockOnError).toHaveBeenCalledWith('NFC is not supported on this device or browser')
    })

    it('should handle already reading state', async () => {
      // First call to set reading state
      await nfcService.startReading(mockOnRead, mockOnError, mockOnStatus)
      mockOnError.mockClear()

      // Second call should fail
      const result = await nfcService.startReading(mockOnRead, mockOnError, mockOnStatus)

      expect(result).toBe(false)
      expect(mockOnError).toHaveBeenCalledWith('Already reading NFC tags')
    })

    it('should retry on failure', async () => {
      mockNDEFReader.scan
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockResolvedValueOnce(undefined)

      const result = await nfcService.startReading(mockOnRead, mockOnError, mockOnStatus)

      expect(result).toBe(true)
      expect(mockNDEFReader.scan).toHaveBeenCalledTimes(3)
    })

    it('should handle scan failure after max retries', async () => {
      const error = new Error('Persistent failure')
      mockNDEFReader.scan.mockRejectedValue(error)

      const result = await nfcService.startReading(mockOnRead, mockOnError, mockOnStatus)

      expect(result).toBe(false)
      expect(mockOnError).toHaveBeenCalledWith(
        expect.stringContaining('Error starting NFC reader: Persistent failure')
      )
    })

    it('should handle reading event correctly', async () => {
      let readingListener: (event: any) => void

      mockNDEFReader.addEventListener.mockImplementation((eventType: string, listener: any) => {
        if (eventType === 'reading') {
          readingListener = listener
        }
      })

      await nfcService.startReading(mockOnRead, mockOnError, mockOnStatus)

      // Simulate reading event
      readingListener!({ message: mockNDEFMessage })

      expect(mockOnStatus).toHaveBeenCalledWith('NFC tag detected! Reading data...')
      expect(mockOnRead).toHaveBeenCalledWith({
        data: 'test data',
        success: true,
      })
      expect(mockOnStatus).toHaveBeenCalledWith('Successfully read NFC tag!')
    })

    it('should handle reading error event', async () => {
      let errorListener: (event: any) => void

      mockNDEFReader.addEventListener.mockImplementation((eventType: string, listener: any) => {
        if (eventType === 'readingerror') {
          errorListener = listener
        }
      })

      await nfcService.startReading(mockOnRead, mockOnError, mockOnStatus)

      // Simulate error event
      errorListener!(new Event('error'))

      expect(mockOnError).toHaveBeenCalledWith('Error reading NFC tag')
    })
  })

  describe('writeToTag', () => {
    const mockOnSuccess = vi.fn()
    const mockOnError = vi.fn()
    const mockOnStatus = vi.fn()

    beforeEach(() => {
      mockOnSuccess.mockClear()
      mockOnError.mockClear()
      mockOnStatus.mockClear()
      mockNDEFReader.write.mockResolvedValue(undefined)
    })

    it('should write data successfully', async () => {
      const result = await nfcService.writeToTag(
        'test data',
        mockOnSuccess,
        mockOnError,
        mockOnStatus
      )

      expect(result.success).toBe(true)
      expect(mockNDEFReader.write).toHaveBeenCalledWith({
        records: [{ recordType: 'text', data: 'test data' }],
      })
      expect(mockOnSuccess).toHaveBeenCalled()
      expect(mockOnStatus).toHaveBeenCalledWith('Successfully wrote to NFC tag!')
    })

    it('should handle empty data', async () => {
      const result = await nfcService.writeToTag(
        '',
        mockOnSuccess,
        mockOnError,
        mockOnStatus
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('No data provided to write')
      expect(mockOnError).toHaveBeenCalledWith('No data provided to write')
    })

    it('should handle NFC not supported', async () => {
      // @ts-expect-error - Intentionally delete for testing
      mockNDEFReaderUnavailable()

      const result = await nfcService.writeToTag(
        'test data',
        mockOnSuccess,
        mockOnError,
        mockOnStatus
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('NFC is not supported on this device or browser')
    })

    it('should retry on write failure', async () => {
      mockNDEFReader.write
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockResolvedValueOnce(undefined)

      const result = await nfcService.writeToTag(
        'test data',
        mockOnSuccess,
        mockOnError,
        mockOnStatus
      )

      expect(result.success).toBe(true)
      expect(mockNDEFReader.write).toHaveBeenCalledTimes(3)
    })

    it('should handle write failure after max retries', async () => {
      const error = new Error('Persistent write failure')
      mockNDEFReader.write.mockRejectedValue(error)

      const result = await nfcService.writeToTag(
        'test data',
        mockOnSuccess,
        mockOnError,
        mockOnStatus
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Error writing to NFC tag: Persistent write failure')
    })
  })

  describe('writeUrlToTag', () => {
    const mockOnSuccess = vi.fn()
    const mockOnError = vi.fn()
    const mockOnStatus = vi.fn()

    beforeEach(() => {
      mockOnSuccess.mockClear()
      mockOnError.mockClear()
      mockOnStatus.mockClear()
      mockNDEFReader.write.mockResolvedValue(undefined)
    })

    it('should write URL successfully', async () => {
      const result = await nfcService.writeUrlToTag(
        'https://example.com',
        mockOnSuccess,
        mockOnError,
        mockOnStatus
      )

      expect(result.success).toBe(true)
      expect(mockNDEFReader.write).toHaveBeenCalledWith({
        records: [{ recordType: 'url', data: 'https://example.com' }],
      })
      expect(mockOnStatus).toHaveBeenCalledWith('Successfully wrote URL to NFC tag!')
    })
  })

  describe('stopReading', () => {
    it('should stop reading and clean up', async () => {
      await nfcService.startReading(vi.fn(), vi.fn(), vi.fn())
      
      nfcService.stopReading()

      expect(nfcService.isReading()).toBe(false)
    })
  })

  describe('reset', () => {
    it('should reset service state', async () => {
      await nfcService.startReading(vi.fn(), vi.fn(), vi.fn())
      
      nfcService.reset()

      expect(nfcService.isReading()).toBe(false)
    })
  })

  describe('error boundary integration', () => {
    it('should handle malformed NFC data gracefully', async () => {
      const malformedMessage = {
        records: [
          {
            recordType: 'unknown',
            data: null, // Invalid data
            encoding: undefined,
          },
        ],
      }

      let readingListener: (event: any) => void
      const mockOnRead = vi.fn()

      mockNDEFReader.addEventListener.mockImplementation((eventType: string, listener: any) => {
        if (eventType === 'reading') {
          readingListener = listener
        }
      })

      await nfcService.startReading(mockOnRead, vi.fn(), vi.fn())

      // Simulate malformed reading event
      readingListener!({ message: malformedMessage })

      expect(mockOnRead).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Error parsing NFC data'),
        })
      )
    })
  })
})