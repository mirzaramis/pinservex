import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useIntersectionActive } from '../hooks/useIntersectionActive'
import './MotherboardReviews.css'

const REVIEWS = [
  { id: 'U1',  name: 'James K.',   company: 'CTO, DataCore Inc.',     stars: 5, text: 'Pinservex delivered 20 servers in 48 hours. Configs perfect, pricing 15% better than anyone else. They\'re our sole supplier now.' },
  { id: 'U2',  name: 'Maria S.',   company: 'IT Director, NovaMed',   stars: 5, text: 'Refurbished HPE nodes were flawless — you\'d never know they weren\'t new. Saved us $40K on this budget cycle.' },
  { id: 'U3',  name: 'Derek W.',   company: 'VP Infra, LogiStream',   stars: 5, text: 'Called with a complex Cisco config at 5pm. Team stayed on and got us sorted. That level of service is rare.' },
  { id: 'U4',  name: 'Rachel T.',  company: 'SysAdmin, CloudVault',   stars: 5, text: 'Same-day shipping is real. Ordered at 2pm, hardware on-site next morning. Our tightest SLA ever.' },
  { id: 'U5',  name: 'Ahmed N.',   company: 'CTO, FinStack',          stars: 5, text: 'Best price on Dell R750s. Beat everyone by 12% without sacrificing warranty or support.' },
  { id: 'U6',  name: 'Lisa P.',    company: 'IT Mgr, RetailCore',     stars: 5, text: 'Trade-in credit on old Cisco switches was seamless. Upgraded our entire network at half cost.' },
  { id: 'U7',  name: 'Marcus B.',  company: 'Infra Lead, PayRails',   stars: 5, text: 'Custom rack config arrived pre-built and tested. No rework needed — just slide in and power on.' },
  { id: 'U8',  name: 'Sophia C.',  company: 'Dir. IT, HealthBridge',  stars: 5, text: 'HIPAA-compliant NetApp storage configured perfectly. These engineers know enterprise storage cold.' },
  { id: 'U9',  name: 'Tom H.',     company: 'DevOps, SkyRoute',       stars: 5, text: '4x A100 GPU servers in stock when nobody else had them. Shipped next day. Saved our ML pipeline.' },
  { id: 'U10', name: 'Karen O.',   company: 'CIO, LawTech',           stars: 5, text: 'Volume discount is legitimate. 22 units, saved 18% vs. direct vendor pricing. No hassle.' },
  { id: 'U11', name: 'Nathan R.',  company: 'IT Ops, EduCloud',       stars: 5, text: 'Their engineers helped spec our entire HCI deployment. Saved weeks of internal design time.' },
  { id: 'U12', name: 'Priya M.',   company: 'SVP Eng, DataPulse',     stars: 5, text: 'Net-30 terms approved without friction. Huge for cash flow on large infrastructure orders.' },
  { id: 'U13', name: 'Carlos V.',  company: 'CTO, LogHaven',          stars: 5, text: 'Refurbished Juniper switches passed every benchmark. Certified refurb here is the real deal.' },
  { id: 'U14', name: 'Emily D.',   company: 'IT Dir, SpectraLab',     stars: 5, text: 'Response in 2 hours on a 50-server quote. Accurate pricing, zero surprises on delivery.' },
  { id: 'U15', name: 'Ben W.',     company: 'NetEng, CloudMesh',      stars: 5, text: 'Supermicro GPU build to exact spec, test reports included. Zero issues on first power-on.' },
  { id: 'U16', name: 'Alicia F.',  company: 'CISO, TrustFrame',       stars: 5, text: 'Firewall stack configured and shipped in 24 hours. Ready for compliance audit out of the box.' },
  { id: 'U17', name: 'Oliver M.',  company: 'Head of IT, NexStream',  stars: 5, text: 'Ordered Friday evening, on-site Monday 8am. Outstanding logistics, outstanding team.' },
  { id: 'U18', name: 'Diana B.',   company: 'IT Arch, PeakHold',      stars: 5, text: 'Team walked us through a complex iSCSI config at no charge. That\'s a true technology partner.' },
]

// Deliberately scattered — not a grid. Some chips sit higher, some lower.
// Values are percentages of the container (left%, top%)
const CHIP_POS = [
  { l: 2,   t: 4  },
  { l: 19,  t: 1  },
  { l: 36,  t: 10 },
  { l: 53,  t: 3  },
  { l: 70,  t: 8  },
  { l: 84,  t: 1  },

  { l: 7,   t: 36 },
  { l: 22,  t: 44 },
  { l: 39,  t: 33 },
  { l: 55,  t: 46 },
  { l: 71,  t: 36 },
  { l: 86,  t: 42 },

  { l: 3,   t: 68 },
  { l: 18,  t: 76 },
  { l: 35,  t: 64 },
  { l: 51,  t: 73 },
  { l: 67,  t: 67 },
  { l: 82,  t: 76 },
]

const CW = 112  // chip width  px
const CH = 82   // chip height px

// Build path waypoints connecting chips via L-shaped PCB traces (H then V then H)
function buildPath(centers) {
  const pts = []
  for (let i = 0; i < centers.length; i++) {
    const a = centers[i]
    const b = centers[(i + 1) % centers.length]
    if (pts.length === 0) pts.push({ x: a.x, y: a.y })
    const mid = (a.x + b.x) / 2
    pts.push({ x: mid, y: a.y })
    pts.push({ x: mid, y: b.y })
    pts.push({ x: b.x, y: b.y })
  }
  return pts
}

function buildCumDist(pts) {
  const d = [0]
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i-1].x
    const dy = pts[i].y - pts[i-1].y
    d.push(d[i-1] + Math.sqrt(dx*dx + dy*dy))
  }
  return d
}

function posAtDist(pts, dists, target) {
  const total = dists[dists.length - 1]
  target = ((target % total) + total) % total
  for (let i = 1; i < dists.length; i++) {
    if (target <= dists[i]) {
      const t = (target - dists[i-1]) / (dists[i] - dists[i-1])
      return {
        x: pts[i-1].x + t * (pts[i].x - pts[i-1].x),
        y: pts[i-1].y + t * (pts[i].y - pts[i-1].y),
      }
    }
  }
  return pts[0]
}

// ── Motherboard canvas ──────────────────────────────────────────────────────
function MBCanvas({ containerRef, active }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || !active) return undefined
    const ctx = canvas.getContext('2d')
    let raf
    let t = 0
    let path = []
    let dists = []
    let totalLen = 0

    const resize = () => {
      const W = container.offsetWidth
      const H = container.offsetHeight
      canvas.width  = W
      canvas.height = H

      // Compute chip centers in pixels from percentage positions
      const centers = CHIP_POS.map(p => ({
        x: (p.l / 100) * W + CW / 2,
        y: (p.t / 100) * H + CH / 2,
      }))

      path      = buildPath(centers)
      dists     = buildCumDist(path)
      totalLen  = dists[dists.length - 1]
    }

    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)
      t += 0.8  // speed of the traveling signal (px per frame)

      // ── Motherboard frame ──────────────────────────────────────────
      const pad = 12
      // Outer PCB border
      ctx.strokeStyle = 'rgba(153,17,53,0.35)'
      ctx.lineWidth   = 1.5
      ctx.setLineDash([])
      ctx.strokeRect(pad, pad, W - pad*2, H - pad*2)

      // Inner guide line
      ctx.strokeStyle = 'rgba(153,17,53,0.10)'
      ctx.lineWidth   = 1
      ctx.strokeRect(pad + 8, pad + 8, W - (pad+8)*2, H - (pad+8)*2)

      // Mounting holes — corners + midpoints
      const holes = [
        [pad+5, pad+5], [W-pad-5, pad+5],
        [pad+5, H-pad-5], [W-pad-5, H-pad-5],
        [W/2, pad+5], [W/2, H-pad-5],
        [pad+5, H/2], [W-pad-5, H/2],
      ]
      holes.forEach(([hx, hy]) => {
        ctx.beginPath()
        ctx.arc(hx, hy, 4, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(153,17,53,0.5)'
        ctx.lineWidth   = 1
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(hx, hy, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(153,17,53,0.6)'
        ctx.fill()
      })

      // Bottom edge connectors (RAM / PCIe slot silhouette)
      const slotY  = H - pad - 1
      const slotH  = 16
      const slots  = 6
      const slotW  = (W - 120) / slots
      for (let s = 0; s < slots; s++) {
        const sx = 60 + s * slotW
        ctx.fillStyle = 'rgba(153,17,53,0.07)'
        ctx.fillRect(sx, slotY - slotH, slotW - 8, slotH)
        ctx.strokeStyle = 'rgba(153,17,53,0.18)'
        ctx.lineWidth = 0.8
        ctx.strokeRect(sx, slotY - slotH, slotW - 8, slotH)
        // Slot pins
        for (let p2 = 0; p2 < 8; p2++) {
          ctx.fillStyle = 'rgba(153,17,53,0.25)'
          ctx.fillRect(sx + 4 + p2 * ((slotW-16)/8), slotY - slotH + 3, 2, slotH - 6)
        }
      }

      // PCB label
      ctx.font        = '9px "Courier New", monospace'
      ctx.fillStyle   = 'rgba(153,17,53,0.25)'
      ctx.fillText('PINSERVEX-X99 REV2.0', pad + 16, H - pad - 24)

      // ── Traces — L-shaped connections between chips ─────────────────
      ctx.setLineDash([])
      for (let i = 0; i < path.length - 1; i += 3) {
        if (i + 3 >= path.length) break
        const seg = [path[i], path[i+1], path[i+2], path[i+3]]

        const drawSeg = () => {
          ctx.beginPath()
          ctx.moveTo(seg[0].x, seg[0].y)
          seg.slice(1).forEach(p => ctx.lineTo(p.x, p.y))
        }

        // Pass 1 — wide outer bloom (neon pink)
        drawSeg()
        ctx.lineWidth   = 8
        ctx.strokeStyle = 'rgba(255,20,120,0.04)'
        ctx.shadowBlur  = 0
        ctx.stroke()

        // Pass 2 — mid glow halo (neon pink)
        drawSeg()
        ctx.lineWidth   = 4
        ctx.strokeStyle = 'rgba(255,20,120,0.13)'
        ctx.shadowBlur  = 10
        ctx.shadowColor = 'rgba(255,20,120,0.45)'
        ctx.stroke()

        // Pass 3 — main neon line
        drawSeg()
        ctx.lineWidth   = 1.5
        ctx.strokeStyle = 'rgba(255,20,120,0.65)'
        ctx.shadowBlur  = 7
        ctx.shadowColor = 'rgba(255,20,120,0.5)'
        ctx.stroke()

        // Pass 4 — soft core
        drawSeg()
        ctx.lineWidth   = 0.5
        ctx.strokeStyle = 'rgba(255,160,200,0.6)'
        ctx.shadowBlur  = 4
        ctx.shadowColor = 'rgba(255,80,160,0.5)'
        ctx.stroke()

        ctx.shadowBlur = 0
      }

      // ── Traveling signal light ──────────────────────────────────────
      if (totalLen > 0) {
        const pos = posAtDist(path, dists, t)

        // Outer glow aura
        const aura = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 28)
        aura.addColorStop(0,   'rgba(153,17,53,0.55)')
        aura.addColorStop(0.4, 'rgba(153,17,53,0.18)')
        aura.addColorStop(1,   'rgba(153,17,53,0)')
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 28, 0, Math.PI * 2)
        ctx.fillStyle = aura
        ctx.fill()

        // Mid glow
        const mid = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 10)
        mid.addColorStop(0,   'rgba(255,80,170,0.95)')
        mid.addColorStop(0.5, 'rgba(153,17,53,0.6)')
        mid.addColorStop(1,   'rgba(153,17,53,0)')
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2)
        ctx.fillStyle = mid
        ctx.fill()

        // Bright core dot
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 2.8, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'
        ctx.shadowBlur  = 12
        ctx.shadowColor = '#991135'
        ctx.fill()
        ctx.shadowBlur = 0

        // Trailing tail along last few trace segments
        const tailLen = 60
        const pts2 = []
        for (let d2 = 0; d2 < tailLen; d2 += 3) {
          const p2 = posAtDist(path, dists, t - d2)
          pts2.push(p2)
        }
        if (pts2.length > 1) {
          ctx.beginPath()
          ctx.moveTo(pts2[0].x, pts2[0].y)
          pts2.slice(1).forEach(p2 => ctx.lineTo(p2.x, p2.y))
          const tg = ctx.createLinearGradient(pts2[0].x, pts2[0].y, pts2[pts2.length-1].x, pts2[pts2.length-1].y)
          tg.addColorStop(0, 'rgba(153,17,53,0.7)')
          tg.addColorStop(1, 'rgba(153,17,53,0)')
          ctx.strokeStyle = tg
          ctx.lineWidth   = 2
          ctx.setLineDash([])
          ctx.stroke()
        }
      }

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [containerRef, active])

  return <canvas ref={canvasRef} className="mb-pcb-canvas" />
}

// ── Single IC chip card ─────────────────────────────────────────────────────
function ReviewChip({ review, pos }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      className={`mb-chip${hovered ? ' mb-chip--active' : ''}`}
      style={{
        position: 'absolute',
        left: `${pos.l}%`,
        top:  `${pos.t}%`,
        width: CW,
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={()   => setHovered(false)}
      animate={hovered
        ? { scale: 2.6, zIndex: 60, boxShadow: '0 0 30px rgba(153,17,53,0.65), 0 0 60px rgba(153,17,53,0.22)' }
        : { scale: 1,   zIndex: 1,  boxShadow: '0 0 0px rgba(153,17,53,0)' }
      }
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Top pin row */}
      <div className="mb-pins mb-pins--top">
        {Array.from({ length: 6 }).map((_, i) => <span key={i} className="mb-pin" />)}
      </div>

      <div className="mb-chip-body">
        <div className="mb-chip-header">
          <span className="mb-chip-id">{review.id}</span>
          <span className="mb-chip-stars">{'★'.repeat(review.stars)}</span>
        </div>
        <div className="mb-chip-name">{review.name}</div>

        <motion.div
          className="mb-chip-text"
          animate={{ opacity: hovered ? 1 : 0, height: hovered ? 'auto' : 0 }}
          transition={{ duration: 0.3, delay: hovered ? 0.18 : 0 }}
        >
          "{review.text}"
        </motion.div>

        <motion.div
          className="mb-chip-company"
          animate={{ opacity: hovered ? 0.75 : 0 }}
          transition={{ duration: 0.25, delay: hovered ? 0.25 : 0 }}
        >
          {review.company}
        </motion.div>
      </div>

      {/* Bottom pin row */}
      <div className="mb-pins mb-pins--bottom">
        {Array.from({ length: 6 }).map((_, i) => <span key={i} className="mb-pin" />)}
      </div>
    </motion.div>
  )
}

// ── Main export ─────────────────────────────────────────────────────────────
export default function MotherboardReviews() {
  const containerRef = useRef(null)
  const [boardRef, boardActive] = useIntersectionActive({ rootMargin: '160px' })

  const setBoardRef = useCallback((node) => {
    containerRef.current = node
    boardRef.current = node
  }, [boardRef])

  return (
    <section className="mb-reviews-section">
      {/* Header above the board */}
      <div className="mb-header container">
        <div className="sec-header centered">
          <span className="section-tag">Customer Reviews</span>
          <h2 className="section-title">What IT Teams Say</h2>
          <p className="mb-hint">Hover any chip to read the full review</p>
        </div>
      </div>

      <div className="mb-board" ref={setBoardRef}>
        <MBCanvas containerRef={containerRef} active={boardActive} />
        {REVIEWS.map((r, i) => (
          <ReviewChip key={r.id} review={r} pos={CHIP_POS[i]} />
        ))}
      </div>
    </section>
  )
}
