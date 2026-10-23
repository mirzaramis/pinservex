import { useEffect, useRef } from 'react'

export default function EnergyBeam({ x1, y1, x2, y2, active = false }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const tRef = useRef(Math.random() * Math.PI * 2)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const draw = () => {
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      canvas.width = W
      canvas.height = H
      ctx.clearRect(0, 0, W, H)

      tRef.current += 0.04
      const t = tRef.current
      const pulse = 0.3 + Math.sin(t) * 0.25
      const activePulse = active ? 1.5 : 1

      const ax1 = x1 * W, ay1 = y1 * H
      const ax2 = x2 * W, ay2 = y2 * H

      // Base beam
      const grad = ctx.createLinearGradient(ax1, ay1, ax2, ay2)
      grad.addColorStop(0, `rgba(153,17,53,${pulse * 0.08 * activePulse})`)
      grad.addColorStop(0.5, `rgba(153,17,53,${pulse * 0.25 * activePulse})`)
      grad.addColorStop(1, `rgba(153,17,53,${pulse * 0.08 * activePulse})`)
      ctx.beginPath()
      ctx.moveTo(ax1, ay1)
      ctx.lineTo(ax2, ay2)
      ctx.strokeStyle = grad
      ctx.lineWidth = active ? 2 : 1
      ctx.stroke()

      // Travelling particle along beam
      const progress = (t * 0.25) % 1
      const px = ax1 + (ax2 - ax1) * progress
      const py = ay1 + (ay2 - ay1) * progress
      const particleGlow = ctx.createRadialGradient(px, py, 0, px, py, 8)
      particleGlow.addColorStop(0, `rgba(255,100,180,${0.9 * activePulse})`)
      particleGlow.addColorStop(1, 'rgba(153,17,53,0)')
      ctx.beginPath()
      ctx.arc(px, py, 8, 0, Math.PI * 2)
      ctx.fillStyle = particleGlow
      ctx.fill()

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [x1, y1, x2, y2, active])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  )
}
