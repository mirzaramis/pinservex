import { useEffect, useRef } from 'react'

// Tiny firefly dot colours — neon green, yellow, white (very dull)
const COLORS = [
  'rgba(120,255,80,',   // neon green
  'rgba(200,255,60,',   // yellow-green
  'rgba(255,245,80,',   // yellow
  'rgba(255,255,255,',  // white
]

function rand(a, b) { return a + Math.random() * (b - a) }
function pick(arr)  { return arr[Math.floor(Math.random() * arr.length)] }

function makeDot(W, H) {
  return {
    x:       rand(0, W),
    y:       rand(0, H),
    r:       rand(0.4, 1.1),          // very tiny radius
    color:   pick(COLORS),
    alpha:   rand(0.04, 0.18),        // very dull base brightness
    phase:   rand(0, Math.PI * 2),    // flicker phase offset
    flickerSpeed: rand(1.2, 3.5),     // how fast it pulses
    vx:      rand(6, 18),             // drift left → right (px/s)
    waveAmp: rand(8, 28),             // vertical wave amplitude
    waveFreq: rand(0.3, 0.9),         // wave frequency
    wavePhase: rand(0, Math.PI * 2),  // wave phase offset
    baseY:   0,                       // set on creation
  }
}

export default function LightningStrips({ count = 120 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let t = 0
    let dots = []

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      dots = Array.from({ length: count }, () => {
        const d = makeDot(canvas.width, canvas.height)
        d.baseY = d.y
        return d
      })
    }
    resize()
    window.addEventListener('resize', resize)

    let last = performance.now()

    const draw = (ts) => {
      const dt = Math.min((ts - last) / 1000, 0.05)
      last = ts
      t += dt

      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      dots.forEach(d => {
        // drift rightward
        d.x += d.vx * dt

        // wrap around
        if (d.x > W + 4) {
          d.x = -4
          d.baseY = rand(0, H)
        }

        // wavy vertical motion
        d.y = d.baseY + Math.sin(t * d.waveFreq + d.wavePhase) * d.waveAmp

        // flicker — smooth sine pulse, very subtle
        const flicker = 0.5 + 0.5 * Math.sin(t * d.flickerSpeed + d.phase)
        const alpha   = d.alpha * flicker

        if (alpha < 0.005) return

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.shadowBlur  = d.r * 3.5
        ctx.shadowColor = `${d.color}0.6)`
        ctx.fillStyle   = `${d.color}1)`
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [count])

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
