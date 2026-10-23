import { useEffect, useRef } from 'react'

export default function Planet({ pulse = false, size = 220 }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const tRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const S = size * 2 // retina
    canvas.width = S
    canvas.height = S
    canvas.style.width = size + 'px'
    canvas.style.height = size + 'px'
    const cx = S / 2
    const cy = S / 2
    const R = S / 2 - 12

    const draw = () => {
      tRef.current += 0.008
      const t = tRef.current
      ctx.clearRect(0, 0, S, S)

      // Outer glow
      const breathe = 0.3 + Math.sin(t * 0.7) * 0.12
      const glow = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.4)
      glow.addColorStop(0, `rgba(153,17,53,${breathe})`)
      glow.addColorStop(0.5, `rgba(180,0,80,${breathe * 0.4})`)
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.4, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      // Planet base
      const base = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, 0, cx, cy, R)
      base.addColorStop(0, '#1a0010')
      base.addColorStop(0.4, '#0d0008')
      base.addColorStop(1, '#000000')
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fillStyle = base
      ctx.fill()

      // Hex grid overlay
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.clip()
      const hexSize = S * 0.055
      for (let row = -2; row < 10; row++) {
        for (let col = -2; col < 10; col++) {
          const hx = col * hexSize * 1.73 + (row % 2) * hexSize * 0.865
          const hy = row * hexSize * 1.5
          const alpha = 0.05 + Math.sin(t + hx * 0.01 + hy * 0.01) * 0.03
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i
            const px = hx + hexSize * 0.5 * Math.cos(a)
            const py = hy + hexSize * 0.5 * Math.sin(a)
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
          }
          ctx.closePath()
          ctx.strokeStyle = `rgba(153,17,53,${alpha})`
          ctx.lineWidth = 0.8
          ctx.stroke()
        }
      }
      ctx.restore()

      // Circuit traces
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.clip()
      const circuits = [
        { x1: 0.2, y1: 0.3, x2: 0.5, y2: 0.3, x3: 0.5, y3: 0.6 },
        { x1: 0.8, y1: 0.25, x2: 0.6, y2: 0.25, x3: 0.6, y3: 0.55 },
        { x1: 0.15, y1: 0.7, x2: 0.4, y2: 0.7, x3: 0.4, y3: 0.5 },
        { x1: 0.75, y1: 0.75, x2: 0.55, y2: 0.75, x3: 0.55, y3: 0.45 },
        { x1: 0.3, y1: 0.15, x2: 0.3, y2: 0.45, x3: 0.6, y3: 0.45 },
        { x1: 0.7, y1: 0.85, x2: 0.7, y2: 0.6, x3: 0.45, y3: 0.6 },
      ]
      circuits.forEach((c, i) => {
        const phase = (t * 0.8 + i * 0.5) % (Math.PI * 2)
        const alpha = 0.15 + Math.sin(phase) * 0.12
        ctx.beginPath()
        ctx.moveTo(c.x1 * S, c.y1 * S)
        ctx.lineTo(c.x2 * S, c.y2 * S)
        ctx.lineTo(c.x3 * S, c.y3 * S)
        ctx.strokeStyle = `rgba(153,17,53,${alpha})`
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Circuit node dots
        ctx.beginPath()
        ctx.arc(c.x2 * S, c.y2 * S, 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(153,17,53,${alpha * 2})`
        ctx.fill()

        // Travelling signal
        const progress = (t * 0.5 + i * 0.3) % 1
        const sx = c.x1 * S + (c.x2 * S - c.x1 * S) * Math.min(progress * 2, 1)
        const sy = c.y1 * S + (c.y2 * S - c.y1 * S) * Math.min(progress * 2, 1)
        ctx.beginPath()
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,80,160,${0.6 + Math.sin(t * 3) * 0.3})`
        ctx.fill()
      })
      ctx.restore()

      // Scan lines moving
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.clip()
      const scanY = ((t * 0.3) % 1) * S * 2 - S * 0.5
      const scanGrad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20)
      scanGrad.addColorStop(0, 'rgba(153,17,53,0)')
      scanGrad.addColorStop(0.5, 'rgba(153,17,53,0.08)')
      scanGrad.addColorStop(1, 'rgba(153,17,53,0)')
      ctx.fillStyle = scanGrad
      ctx.fillRect(0, scanY - 20, S, 40)
      ctx.restore()

      // Inner ring glow
      const ringAlpha = 0.5 + Math.sin(t * 1.2) * 0.2
      ctx.beginPath()
      ctx.arc(cx, cy, R * 0.72, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(153,17,53,${ringAlpha * 0.35})`
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(cx, cy, R * 0.48, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(153,17,53,${ringAlpha * 0.25})`
      ctx.lineWidth = 1
      ctx.stroke()

      // Outer ring
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(153,17,53,${0.4 + Math.sin(t) * 0.15})`
      ctx.lineWidth = 2
      ctx.stroke()

      // Pulse ring
      if (pulse) {
        const pulseR = R * (1 + ((t * 0.4) % 1) * 0.6)
        const pulseA = 1 - ((t * 0.4) % 1)
        ctx.beginPath()
        ctx.arc(cx, cy, pulseR, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(153,17,53,${pulseA * 0.5})`
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Center core
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.18)
      core.addColorStop(0, `rgba(255,120,180,${0.9 + Math.sin(t * 2) * 0.1})`)
      core.addColorStop(0.5, `rgba(153,17,53,0.7)`)
      core.addColorStop(1, 'rgba(153,17,53,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, R * 0.18, 0, Math.PI * 2)
      ctx.fillStyle = core
      ctx.fill()

      // HUD tick marks on outer ring
      for (let i = 0; i < 32; i++) {
        const a = (Math.PI * 2 / 32) * i + t * 0.1
        const inner = i % 4 === 0 ? R - 12 : R - 6
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner)
        ctx.lineTo(cx + Math.cos(a) * (R + 2), cy + Math.sin(a) * (R + 2))
        ctx.strokeStyle = i % 4 === 0 ? 'rgba(153,17,53,0.7)' : 'rgba(153,17,53,0.3)'
        ctx.lineWidth = i % 4 === 0 ? 1.5 : 0.8
        ctx.stroke()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [size, pulse])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', filter: 'drop-shadow(0 0 32px rgba(153,17,53,0.5))' }}
    />
  )
}
