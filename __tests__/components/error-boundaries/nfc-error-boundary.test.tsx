import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NFCErrorBoundary } from '~/components/error-boundaries/nfc-error-boundary'

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Mock console.error to prevent noise in test output
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalConsoleError
})

describe('NFCErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <NFCErrorBoundary>
        <ThrowError shouldThrow={false} />
      </NFCErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('should render error UI when child component throws', () => {
    render(
      <NFCErrorBoundary>
        <ThrowError shouldThrow={true} />
      </NFCErrorBoundary>
    )

    expect(screen.getByText('NFC Operation Error')).toBeInTheDocument()
    expect(screen.getByText(/An error occurred while using NFC functionality/)).toBeInTheDocument()
  })

  it('should display error details when expanded', () => {
    render(
      <NFCErrorBoundary>
        <ThrowError shouldThrow={true} />
      </NFCErrorBoundary>
    )

    const detailsElement = screen.getByText('Error Details')
    fireEvent.click(detailsElement)

    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('should call onError callback when error occurs', () => {
    const mockOnError = vi.fn()

    render(
      <NFCErrorBoundary onError={mockOnError}>
        <ThrowError shouldThrow={true} />
      </NFCErrorBoundary>
    )

    expect(mockOnError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.stringContaining('Test error')
    )
  })

  it('should render custom fallback when provided', () => {
    const CustomFallback = <div>Custom error message</div>

    render(
      <NFCErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </NFCErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('NFC Operation Error')).not.toBeInTheDocument()
  })

  it('should allow retry after error', () => {
    const { rerender } = render(
      <NFCErrorBoundary>
        <ThrowError shouldThrow={true} />
      </NFCErrorBoundary>
    )

    expect(screen.getByText('NFC Operation Error')).toBeInTheDocument()

    // Click retry button
    const retryButton = screen.getByText('Try Again')
    fireEvent.click(retryButton)

    // Re-render with no error
    rerender(
      <NFCErrorBoundary>
        <ThrowError shouldThrow={false} />
      </NFCErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
    expect(screen.queryByText('NFC Operation Error')).not.toBeInTheDocument()
  })

  it('should provide reload page option', () => {
    // Mock window.location.reload
    const mockReload = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    })

    render(
      <NFCErrorBoundary>
        <ThrowError shouldThrow={true} />
      </NFCErrorBoundary>
    )

    const reloadButton = screen.getByText('Reload Page')
    fireEvent.click(reloadButton)

    expect(mockReload).toHaveBeenCalled()
  })

  it('should display helpful error suggestions', () => {
    render(
      <NFCErrorBoundary>
        <ThrowError shouldThrow={true} />
      </NFCErrorBoundary>
    )

    expect(screen.getByText(/Browser compatibility issues/)).toBeInTheDocument()
    expect(screen.getByText(/NFC permissions not granted/)).toBeInTheDocument()
    expect(screen.getByText(/Hardware not supported/)).toBeInTheDocument()
    expect(screen.getByText(/Network connectivity problems/)).toBeInTheDocument()
  })

  it('should handle error info properly', () => {
    const mockOnError = vi.fn()

    render(
      <NFCErrorBoundary onError={mockOnError}>
        <ThrowError shouldThrow={true} />
      </NFCErrorBoundary>
    )

    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' }),
      expect.stringContaining('NFC Error: Test error')
    )
  })

  it('should log errors to console', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <NFCErrorBoundary>
        <ThrowError shouldThrow={true} />
      </NFCErrorBoundary>
    )

    expect(consoleSpy).toHaveBeenCalledWith(
      'NFC Error Boundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    )

    consoleSpy.mockRestore()
  })

  it('should reset error state when retry is clicked', () => {
    const { rerender } = render(
      <NFCErrorBoundary>
        <ThrowError shouldThrow={true} />
      </NFCErrorBoundary>
    )

    // Verify error state
    expect(screen.getByText('NFC Operation Error')).toBeInTheDocument()

    // Click retry
    const retryButton = screen.getByText('Try Again')
    fireEvent.click(retryButton)

    // Re-render the same component that previously threw
    rerender(
      <NFCErrorBoundary>
        <div>Component recovered</div>
      </NFCErrorBoundary>
    )

    expect(screen.getByText('Component recovered')).toBeInTheDocument()
  })

  it('should handle multiple errors correctly', () => {
    const { rerender } = render(
      <NFCErrorBoundary>
        <ThrowError shouldThrow={true} />
      </NFCErrorBoundary>
    )

    expect(screen.getByText('NFC Operation Error')).toBeInTheDocument()

    // Reset and throw a different error
    const retryButton = screen.getByText('Try Again')
    fireEvent.click(retryButton)

    const SecondError = () => {
      throw new Error('Second error')
    }

    rerender(
      <NFCErrorBoundary>
        <SecondError />
      </NFCErrorBoundary>
    )

    expect(screen.getByText('NFC Operation Error')).toBeInTheDocument()
    
    // Check that new error details are shown
    const detailsElement = screen.getByText('Error Details')
    fireEvent.click(detailsElement)
    expect(screen.getByText('Second error')).toBeInTheDocument()
  })

  it('should be accessible', () => {
    render(
      <NFCErrorBoundary>
        <ThrowError shouldThrow={true} />
      </NFCErrorBoundary>
    )

    // Check for proper heading structure
    expect(screen.getByRole('heading', { name: /NFC Operation Error/ })).toBeInTheDocument()
    
    // Check for proper button roles
    expect(screen.getByRole('button', { name: /Try Again/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reload Page/ })).toBeInTheDocument()
  })

  it('should handle non-Error objects being thrown', () => {
    const ThrowString = () => {
      throw 'String error'
    }

    render(
      <NFCErrorBoundary>
        <ThrowString />
      </NFCErrorBoundary>
    )

    expect(screen.getByText('NFC Operation Error')).toBeInTheDocument()
  })
})