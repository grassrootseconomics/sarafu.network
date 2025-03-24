"use client"

import { useEffect, useRef } from "react"

interface EthIdenticonProps {
  address?: string
  size?: number
}

export default function Identicon({ address = "", size = 50 }: EthIdenticonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !address) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    try {
      // Validate address format
      if (!address.match(/^(0x)?[0-9a-fA-F]{40}$/)) {
        throw new Error("Invalid Ethereum address")
      }

      // Remove '0x' prefix if present and ensure lowercase
      const cleanAddress = address.toLowerCase().replace("0x", "")

      // Get last 8 bytes (16 characters) of address for pattern
      const pattern = cleanAddress.slice(-16)

      // Convert first 6 characters to HSL color
      const hue = Number.parseInt(cleanAddress.slice(0, 6), 16) % 360
      const color = `hsl(${hue}, 80%, 60%)`

      // Calculate cell size (5x5 grid)
      const cellSize = size / 5

      // Fill background
      ctx.fillStyle = `hsl(${hue}, 50%, 95%)`
      ctx.fillRect(0, 0, size, size)

      // Set color for pattern
      ctx.fillStyle = color

      // Generate pattern (only need to do half + middle column due to symmetry)
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 5; j++) {
          // Use 2 characters of the pattern for each cell
          const index = (i * 5 + j) % pattern.length
          const shouldFill = Number.parseInt(pattern[index] ?? "0", 16) % 2 === 0

          if (shouldFill) {
            // Fill left side
            ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize)
            // Fill right side (mirror)
            if (i < 2) {
              // Don't mirror the middle column
              ctx.fillRect((4 - i) * cellSize, j * cellSize, cellSize, cellSize)
            }
          }
        }
      }
    } catch (error) {
      // In case of invalid address, fill with a gray pattern
      console.error(error);
      ctx.fillStyle = "#f0f0f0"
      ctx.fillRect(0, 0, size, size)
      ctx.fillStyle = "#e0e0e0"
      const cellSize = size / 5
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          if ((i + j) % 2 === 0) {
            ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize)
          }
        }
      }
    }
  }, [address, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-lg"
      style={{
        width: size,
        height: size,
      }}
    />
  )
}

