import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useNFC } from '~/lib/nfc/use-nfc'

// Mock the NFC service
vi.mock('~/lib/nfc/nfc-service', () => ({
  nfcService: {
    isNFCSupported: vi.fn(),
    startReading: vi.fn(),
    stopReading: vi.fn(),
    reset: vi.fn(),
    writeUrlToTag: vi.fn(),
    isReading: vi.fn(),
  },
}))

const mockNFCService = vi.mocked(await import('~/lib/nfc/nfc-service')).nfcService

describe('useNFC', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNFCService.isNFCSupported.mockReturnValue(true)
    mockNFCService.isReading.mockReturnValue(false)
  })

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useNFC())

    expect(result.current.nfcStatus.isSupported).toBe(true)
    expect(result.current.nfcStatus.isReading).toBe(false)
    expect(result.current.nfcStatus.isWriting).toBe(false)
    expect(result.current.nfcStatus.message).toBe('NFC is supported on this device')
    expect(result.current.readData).toBeUndefined()
    expect(result.current.error).toBe('')
  })

  it('should handle unsupported NFC', () => {
    mockNFCService.isNFCSupported.mockReturnValue(false)

    const { result } = renderHook(() => useNFC())

    expect(result.current.nfcStatus.isSupported).toBe(false)
    expect(result.current.nfcStatus.message).toBe('NFC is not supported on this device or browser')
  })

  describe('startReading', () => {
    it('should start reading successfully', async () => {
      mockNFCService.startReading.mockImplementation(async (onRead, onError, onStatus) => {
        // Simulate status update
        onStatus('Reading...')
        return true
      })

      const { result } = renderHook(() => useNFC())

      let readingResult: boolean | undefined
      await act(async () => {
        readingResult = await result.current.startReading()
      })

      expect(readingResult).toBe(true)
      expect(mockNFCService.startReading).toHaveBeenCalled()
    })

    it('should handle reading failure', async () => {
      mockNFCService.startReading.mockImplementation(async (onRead, onError, onStatus) => {
        onError('Failed to start reading')
        return false
      })

      const { result } = renderHook(() => useNFC())

      let readingResult: boolean | undefined
      await act(async () => {
        readingResult = await result.current.startReading()
      })

      expect(readingResult).toBe(false)
      expect(result.current.error).toBe('Failed to start reading')
      expect(result.current.nfcStatus.isReading).toBe(false)
    })

    it('should handle successful NFC read', async () => {
      mockNFCService.startReading.mockImplementation(async (onRead, onError, onStatus) => {
        // Simulate successful read
        onRead({ success: true, data: 'test-wallet-data' })
        return true
      })

      const { result } = renderHook(() => useNFC())

      await act(async () => {
        await result.current.startReading()
      })

      expect(result.current.readData).toBe('test-wallet-data')
      expect(result.current.nfcStatus.isReading).toBe(false)
    })

    it('should handle failed NFC read', async () => {
      mockNFCService.startReading.mockImplementation(async (onRead, onError, onStatus) => {
        // Simulate failed read
        onRead({ success: false, error: 'Invalid data format' })
        return true
      })

      const { result } = renderHook(() => useNFC())

      await act(async () => {
        await result.current.startReading()
      })

      expect(result.current.error).toBe('Invalid data format')
      expect(result.current.nfcStatus.isReading).toBe(false)
    })

    it('should not start reading if NFC is not supported', async () => {
      mockNFCService.isNFCSupported.mockReturnValue(false)

      const { result } = renderHook(() => useNFC())

      let readingResult: boolean | undefined
      await act(async () => {
        readingResult = await result.current.startReading()
      })

      expect(readingResult).toBe(false)
      expect(mockNFCService.startReading).not.toHaveBeenCalled()
    })
  })

  describe('stopReading', () => {
    it('should stop reading', () => {
      const { result } = renderHook(() => useNFC())

      act(() => {
        result.current.stopReading()
      })

      expect(mockNFCService.stopReading).toHaveBeenCalled()
      expect(result.current.nfcStatus.isReading).toBe(false)
      expect(result.current.nfcStatus.message).toBe('Stopped reading')
    })
  })

  describe('writeUrlToTag', () => {
    it('should write URL successfully', async () => {
      mockNFCService.writeUrlToTag.mockImplementation(async (url, onSuccess, onError, onStatus) => {
        onSuccess()
        return { success: true }
      })

      const { result } = renderHook(() => useNFC())

      let writeResult: boolean | undefined
      await act(async () => {
        writeResult = await result.current.writeUrlToTag('https://example.com')
      })

      expect(writeResult).toBe(true)
      expect(mockNFCService.writeUrlToTag).toHaveBeenCalledWith(
        'https://example.com',
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      )
    })

    it('should handle write failure', async () => {
      mockNFCService.writeUrlToTag.mockImplementation(async (url, onSuccess, onError, onStatus) => {
        onError('Write failed')
        return { success: false, error: 'Write failed' }
      })

      const { result } = renderHook(() => useNFC())

      let writeResult: boolean | undefined
      await act(async () => {
        writeResult = await result.current.writeUrlToTag('https://example.com')
      })

      expect(writeResult).toBe(false)
      expect(result.current.error).toBe('Write failed')
      expect(result.current.nfcStatus.isWriting).toBe(false)
    })

    it('should not write if NFC is not supported', async () => {
      mockNFCService.isNFCSupported.mockReturnValue(false)

      const { result } = renderHook(() => useNFC())

      let writeResult: boolean | undefined
      await act(async () => {
        writeResult = await result.current.writeUrlToTag('https://example.com')
      })

      expect(writeResult).toBe(false)
      expect(mockNFCService.writeUrlToTag).not.toHaveBeenCalled()
    })

    it('should not write empty URL', async () => {
      const { result } = renderHook(() => useNFC())

      let writeResult: boolean | undefined
      await act(async () => {
        writeResult = await result.current.writeUrlToTag('')
      })

      expect(writeResult).toBe(false)
      expect(mockNFCService.writeUrlToTag).not.toHaveBeenCalled()
    })
  })

  describe('clearData', () => {
    it('should clear all data and reset state', () => {
      const { result } = renderHook(() => useNFC())

      // Set some data first
      act(() => {
        result.current.startReading()
      })

      // Clear data
      act(() => {
        result.current.clearData()
      })

      expect(result.current.readData).toBeUndefined()
      expect(result.current.error).toBe('')
      expect(result.current.nfcStatus.isReading).toBe(false)
      expect(result.current.nfcStatus.message).toBe('Ready to read or write NFC tags')
      expect(mockNFCService.reset).toHaveBeenCalled()
    })

    it('should show unsupported message when clearing data on unsupported device', () => {
      mockNFCService.isNFCSupported.mockReturnValue(false)

      const { result } = renderHook(() => useNFC())

      act(() => {
        result.current.clearData()
      })

      expect(result.current.nfcStatus.message).toBe('NFC not supported')
    })
  })

  describe('error handling', () => {
    it('should handle NFC service errors gracefully', async () => {
      mockNFCService.startReading.mockRejectedValue(new Error('Unexpected error'))

      const { result } = renderHook(() => useNFC())

      let readingResult: boolean | undefined
      await act(async () => {
        try {
          readingResult = await result.current.startReading()
        } catch (error) {
          // Error should be handled gracefully
        }
      })

      expect(readingResult).toBe(false)
    })

    it('should handle concurrent operations correctly', async () => {
      let resolveReading: (value: boolean) => void
      mockNFCService.startReading.mockImplementation(async () => {
        return new Promise(resolve => {
          resolveReading = resolve
        })
      })

      const { result } = renderHook(() => useNFC())

      // Start two concurrent reads
      const read1Promise = act(() => result.current.startReading())
      const read2Promise = act(() => result.current.startReading())

      // Resolve the first read
      act(() => {
        resolveReading!(true)
      })

      const [result1, result2] = await Promise.all([read1Promise, read2Promise])

      // Only one should succeed
      expect(mockNFCService.startReading).toHaveBeenCalledTimes(1)
    })
  })

  describe('state management', () => {
    it('should update status messages properly', async () => {
      mockNFCService.startReading.mockImplementation(async (onRead, onError, onStatus) => {
        onStatus('Scanning for NFC tags...')
        onStatus('NFC tag detected!')
        onRead({ success: true, data: 'wallet-data' })
        onStatus('Successfully read NFC tag!')
        return true
      })

      const { result } = renderHook(() => useNFC())

      await act(async () => {
        await result.current.startReading()
      })

      expect(result.current.nfcStatus.message).toBe('Successfully read NFC tag!')
    })

    it('should handle writing state correctly', async () => {
      let onStatusCallback: (message: string) => void
      mockNFCService.writeUrlToTag.mockImplementation(async (url, onSuccess, onError, onStatus) => {
        onStatusCallback = onStatus
        onStatus('Writing to NFC tag...')
        
        // Simulate async writing
        setTimeout(() => {
          onSuccess()
          onStatus('Successfully wrote to NFC tag!')
        }, 10)
        
        return { success: true }
      })

      const { result } = renderHook(() => useNFC())

      const writePromise = act(async () => {
        await result.current.writeUrlToTag('https://example.com')
      })

      // Check writing state
      expect(result.current.nfcStatus.isWriting).toBe(true)

      await writePromise

      expect(result.current.nfcStatus.isWriting).toBe(false)
    })
  })
})