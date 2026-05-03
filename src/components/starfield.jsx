"use client"

import { useEffect, useRef, useState } from "react"

export function Starfield({ 
  starCount = 150, 
  speed = 0.02,
  mouseInfluence = 0.05,
  className = ""
}) {
  const canvasRef = useRef(null)
  const starsRef = useRef([])
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })
  const animationRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Initialize stars
  const initStars = (width, height) => {
    const stars = []
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 2 + 0.5, // Depth factor
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
      })
    }
    starsRef.current = stars
  }

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const width = window.innerWidth
        const height = window.innerHeight
        canvasRef.current.width = width
        canvasRef.current.height = height
        setDimensions({ width, height })
        initStars(width, height)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [starCount])

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current.targetX = e.clientX
      mouseRef.current.targetY = e.clientY
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const { width, height } = dimensions

    if (width === 0 || height === 0) return

    const animate = () => {
      // Clear canvas with transparent background
      ctx.clearRect(0, 0, width, height)

      // Smooth mouse movement (easing)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * mouseInfluence
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * mouseInfluence

      const centerX = width / 2
      const centerY = height / 2
      const mouseOffsetX = (mouseRef.current.x - centerX) / centerX
      const mouseOffsetY = (mouseRef.current.y - centerY) / centerY

      // Draw each star
      starsRef.current.forEach((star) => {
        // Calculate star position with mouse influence
        const offsetX = mouseOffsetX * star.z * 30
        const offsetY = mouseOffsetY * star.z * 30

        // Subtle drift animation
        const drift = Math.sin(Date.now() * speed + star.twinklePhase) * 0.5
        
        let x = star.baseX + offsetX + drift
        let y = star.baseY + offsetY + drift

        // Ensure coordinates are finite
        if (!isFinite(x)) x = star.baseX
        if (!isFinite(y)) y = star.baseY

        // Wrap around screen
        if (x < 0) x = width
        if (x > width) x = 0
        if (y < 0) y = height
        if (y > height) y = 0

        // Twinkle effect
        star.twinklePhase += star.twinkleSpeed
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7
        const finalOpacity = star.opacity * twinkle

        // Ensure opacity is valid
        if (!isFinite(finalOpacity)) return

        const starSize = star.size * star.z
        
        // Draw star
        ctx.beginPath()
        ctx.arc(x, y, starSize, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`
        ctx.fill()

        // Add glow for larger stars
        if (starSize > 1.2) {
          const glowRadius = starSize * 2
          // Ensure gradient coordinates are valid
          if (isFinite(x) && isFinite(y) && isFinite(glowRadius) && glowRadius > 0) {
            ctx.beginPath()
            ctx.arc(x, y, glowRadius, 0, Math.PI * 2)
            const gradient = ctx.createRadialGradient(
              x, y, 0,
              x, y, glowRadius
            )
            gradient.addColorStop(0, `rgba(200, 220, 255, ${finalOpacity * 0.3})`)
            gradient.addColorStop(1, "rgba(200, 220, 255, 0)")
            ctx.fillStyle = gradient
            ctx.fill()
          }
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [dimensions, speed, mouseInfluence])

  // Only render after client-side mount to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  )
}

export default Starfield
