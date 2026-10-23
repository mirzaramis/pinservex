import { useEffect, useRef } from 'react'
import './BrandsStarfield.css'
import { useIntersectionActive } from '../hooks/useIntersectionActive'

const GRID_COLORS = [
  { r: 103, g: 255, b: 140 },
  { r: 255, g: 217, b: 106 },
  { r: 248, g: 248, b: 248 },
]

const COLOR_POOL = [0, 0, 0, 1, 1, 1, 2, 2, 2, 0, 1, 2, 0, 2, 1]

export default function BrandsStarfield() {
  const canvasRef = useRef(null)
  const [containerRef, active] = useIntersectionActive()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    let raf
    let grid = []

    const SPACING = 30
    const DOT_R = 0.9
    const DIM = 0.05
    const BRIGHT = 0.72
    const WAVES = [
      { period: 3600, amp: 1.0, width: 0.22 },
      { period: 6200, amp: 0.35, width: 0.34 },
    ]

    const buildGrid = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      grid = []

      const cols = Math.ceil(canvas.width / SPACING) + 1
      const rows = Math.ceil(canvas.height / SPACING) + 1

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const xOff = r % 2 === 1 ? SPACING * 0.5 : 0
          grid.push({
            x: c * SPACING + xOff + SPACING * 0.5,
            y: r * SPACING + SPACING * 0.5,
            colorIdx: COLOR_POOL[Math.floor(Math.random() * COLOR_POOL.length)],
            jitter: (Math.random() - 0.5) * 0.08,
            yPhase: (r / rows) * Math.PI * 3 + Math.random() * 0.8,
          })
        }
      }
    }

    buildGrid()
    const ro = new ResizeObserver(buildGrid)
    ro.observe(canvas)

    const draw = (ts) => {
      if (!active) return

      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      for (const dot of grid) {
        const xFrac = dot.x / W + dot.jitter
        const yMod = Math.sin(dot.yPhase + ts * 0.0002) * 0.08
        const xEff = xFrac + yMod

        let waveSum = 0
        for (const w of WAVES) {
          const phase = (ts / w.period) % 1
          let dist = xEff - phase
          dist -= Math.floor(dist + 0.5)
          const falloff = Math.max(0, 1 - Math.abs(dist) / w.width)
          waveSum += falloff * falloff * w.amp
        }

        const t = Math.min(waveSum, 1)
        const alpha = DIM + t * (BRIGHT - DIM)
        if (alpha < 0.02) continue

        const { r, g, b } = GRID_COLORS[dot.colorIdx]
        ctx.globalAlpha = alpha
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, DOT_R + t * 0.35, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    if (active) {
      raf = requestAnimationFrame(draw)
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [active])

  return (
    <div ref={containerRef} className="brands-starfield-wrap" aria-hidden="true">
      <canvas ref={canvasRef} className="brands-starfield-canvas" />
    </div>
  )
}
