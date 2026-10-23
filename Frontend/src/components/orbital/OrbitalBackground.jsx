import { useEffect, useRef } from 'react'

export default function OrbitalBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let t = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Stars
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      a: Math.random(),
      speed: Math.random() * 0.002 + 0.001,
    }))

    // Floating hexagons
    const hexs = Array.from({ length: 14 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 18 + 8,
      a: Math.random() * Math.PI * 2,
      speed: (Math.random() - 0.5) * 0.0003,
      dy: (Math.random() - 0.5) * 0.00015,
      opacity: Math.random() * 0.08 + 0.03,
    }))

    const drawHex = (cx, cy, size) => {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6
        const x = cx + size * Math.cos(a)
        const y = cy + size * Math.sin(a)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.closePath()
    }

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      // Grid
      ctx.strokeStyle = 'rgba(153,17,53,0.04)'
      ctx.lineWidth = 0.5
      const gridSize = 60
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }

      // Stars
      stars.forEach(s => {
        s.a += s.speed
        const alpha = (Math.sin(s.a) * 0.5 + 0.5) * 0.6 + 0.1
        ctx.beginPath()
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(153,17,53,${alpha})`
        ctx.fill()
      })

      // Floating hexagons
      hexs.forEach(h => {
        h.a += h.speed
        h.y += h.dy
        if (h.y > 1.1) h.y = -0.1
        if (h.y < -0.1) h.y = 1.1
        drawHex(h.x * W, h.y * H, h.size)
        ctx.strokeStyle = `rgba(153,17,53,${h.opacity})`
        ctx.lineWidth = 0.8
        ctx.stroke()
      })

      t += 0.005
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
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
  )
}
