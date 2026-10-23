import { useEffect, useRef } from 'react'
import { useIntersectionActive } from '../../hooks/useIntersectionActive'

export default function ParticleField({ active = false, centerX = 0.5, centerY = 0.5 }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const particlesRef = useRef([])
  const [containerRef, visible] = useIntersectionActive({ rootMargin: '200px' })
  const shouldAnimate = visible && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !shouldAnimate) return undefined
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Init particles
    const count = active ? 24 : 12
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
      type: Math.floor(Math.random() * 4), // 0=dot, 1=hex, 2=plus, 3=binary
      opacity: Math.random() * 0.5 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.01,
    }))

    const drawHex = (ctx, cx, cy, r) => {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i
        i === 0
          ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
          : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
      }
      ctx.closePath()
    }

    let t = 0
    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)
      t += 0.016

      particlesRef.current.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.phase += p.speed
        if (p.x < 0) p.x = 1
        if (p.x > 1) p.x = 0
        if (p.y < 0) p.y = 1
        if (p.y > 1) p.y = 0

        const alpha = (Math.sin(p.phase) * 0.3 + 0.5) * p.opacity
        const px = p.x * W
        const py = p.y * H
        const col = `rgba(153,17,53,${alpha})`

        ctx.fillStyle = col
        ctx.strokeStyle = col
        ctx.lineWidth = 0.7

        if (p.type === 0) {
          // glowing dot
          const g = ctx.createRadialGradient(px, py, 0, px, py, p.size * 3)
          g.addColorStop(0, `rgba(255,80,160,${alpha})`)
          g.addColorStop(1, 'rgba(153,17,53,0)')
          ctx.beginPath()
          ctx.arc(px, py, p.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = g
          ctx.fill()
        } else if (p.type === 1) {
          // hexagon outline
          drawHex(ctx, px, py, p.size * 2.5)
          ctx.stroke()
        } else if (p.type === 2) {
          // tiny plus/cross
          ctx.beginPath()
          ctx.moveTo(px - p.size * 2, py)
          ctx.lineTo(px + p.size * 2, py)
          ctx.moveTo(px, py - p.size * 2)
          ctx.lineTo(px, py + p.size * 2)
          ctx.stroke()
        } else {
          // binary digit
          ctx.font = `${p.size * 5}px monospace`
          ctx.fillStyle = col
          ctx.fillText(Math.random() > 0.5 ? '1' : '0', px, py)
        }
      })

      // Active hover burst particles near card
      if (active) {
        for (let i = 0; i < 3; i++) {
          const angle = t * 2 + (i * Math.PI * 2) / 3
          const r = 0.04 + Math.sin(t * 3 + i) * 0.015
          const bx = (centerX + Math.cos(angle) * r) * W
          const by = (centerY + Math.sin(angle) * r) * H
          const bg = ctx.createRadialGradient(bx, by, 0, bx, by, 6)
          bg.addColorStop(0, `rgba(255,80,160,${0.6 + Math.sin(t * 4 + i) * 0.3})`)
          bg.addColorStop(1, 'rgba(153,17,53,0)')
          ctx.beginPath()
          ctx.arc(bx, by, 6, 0, Math.PI * 2)
          ctx.fillStyle = bg
          ctx.fill()
        }
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [active, centerX, centerY, shouldAnimate])

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0 }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    </div>
  )
}
