import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import Planet from './Planet'
import OrbitalBackground from './OrbitalBackground'
import ParticleField from './ParticleField'
import { useIntersectionActive } from '../../hooks/useIntersectionActive'
import './CategoryOrbit.css'

const CATEGORIES = [
  { icon: 'Storage Devices.png',      label: 'Storage Devices',      count: '1,100+' },
  { icon: 'Memory.png',               label: 'Memory',               count: '2,400+' },
  { icon: 'Network & Accessories.png', label: 'Network & Accessories', count: '950+'   },
  { icon: 'PC & Servers.png',         label: 'PC & Servers',         count: '1,680+' },
  { icon: 'Motherboard.png',          label: 'Motherboards',         count: '560+'   },
  { icon: 'Printer & Scanners.png',   label: 'Printers & Scanners',  count: '420+'   },
  { icon: 'Power Equipment.png',      label: 'Power Equipment',      count: '340+'   },
  { icon: 'Processors.png',           label: 'Processors',           count: '890+'   },
  { icon: 'Video Components.png',     label: 'Video Components',     count: '720+'   },
  { icon: 'Audio Components.png',     label: 'Audio Components',     count: '310+'   },
  { icon: 'Input Devices.png',        label: 'Input Devices',        count: '580+'   },
  { icon: 'Cameras.png',              label: 'Cameras',              count: '260+'   },
  { icon: 'Cables.png',               label: 'Cables',               count: '1,400+' },
  { icon: 'System Cooling Parts.png', label: 'System Cooling Parts', count: '480+'   },
  { icon: 'Monitors.png',             label: 'Monitors',             count: '640+'   },
  { icon: 'Computer Accessories.png', label: 'Computer Accessories', count: '920+'   },
]

// Encode spaces only — encoding "&" breaks Vite static file serving for these filenames
const iconUrl = (filename) => `/icons/${filename.replace(/ /g, '%20')}`

const CARD_W = 168
const CARD_H = 178
const ORBIT_SPEED = 0.00011 // radians/ms — full revolution in ~57s

// Orbit tilt in screen space — matches reference image (~20° CCW)
const ORBIT_TILT = -Math.PI / 9  // -20°

// Map angle θ → point on a rotated ellipse in screen space
// The ellipse is first compressed (ry < rx for perspective depth),
// then rotated by ORBIT_TILT to match the reference image angle.
// depth = sin(θ): +1 = front arc, -1 = back arc (independent of screen rotation)
function orbitPoint(θ, cx, cy, rx, ry) {
  const ex = rx * Math.cos(θ)
  const ey = ry * Math.sin(θ)
  const cosA = Math.cos(ORBIT_TILT)
  const sinA = Math.sin(ORBIT_TILT)
  return {
    x: cx + ex * cosA - ey * sinA,
    y: cy + ex * sinA + ey * cosA,
    depth: Math.sin(θ),
  }
}

export default function CategoryOrbit() {
  const [sectionRef, sectionActive] = useIntersectionActive({ rootMargin: '80px', threshold: 0.05 })
  const stickyRef = useRef(null)
  const angleRef = useRef(0)
  const [angle, setAngle] = useState(0)
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const [planetPulse, setPlanetPulse] = useState(false)
  const [dims, setDims] = useState({ w: typeof window !== 'undefined' ? window.innerWidth : 1200, h: 680 })
  const isMobile = dims.w < 640
  const pausedRef = useRef(false)
  const visibleRef = useRef(true)

  // Mouse parallax
  const mouseX = useSpring(0, { stiffness: 45, damping: 18 })
  const mouseY = useSpring(0, { stiffness: 45, damping: 18 })
  const rotateX = useTransform(mouseY, [-1, 1], [6, -6])
  const rotateY = useTransform(mouseX, [-1, 1], [-6, 6])

  // Measure sticky container
  useEffect(() => {
    const el = stickyRef.current
    if (!el) return
    const update = () => setDims({ w: el.offsetWidth, h: el.offsetHeight })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    update()
    return () => ro.disconnect()
  }, [])

  // Continuous orbit rotation (pauses on hover / when off-screen)
  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    pausedRef.current = hoveredIdx !== null
  }, [hoveredIdx])

  useEffect(() => {
    visibleRef.current = sectionActive
  }, [sectionActive])

  useEffect(() => {
    if (prefersReduced || isMobile) return undefined

    let rafId = 0
    let lastTime = performance.now()

    const tick = (now) => {
      const dt = Math.min(now - lastTime, 48)
      lastTime = now

      if (!pausedRef.current && visibleRef.current && !document.hidden) {
        angleRef.current -= dt * ORBIT_SPEED
        setAngle(angleRef.current)
      }

      rafId = window.requestAnimationFrame(tick)
    }

    rafId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(rafId)
  }, [prefersReduced, isMobile])

  // Mouse handlers
  const handleMouseMove = useCallback((e) => {
    const rect = stickyRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set(((e.clientX - rect.left) / rect.width) * 2 - 1)
    mouseY.set(((e.clientY - rect.top) / rect.height) * 2 - 1)
  }, [mouseX, mouseY])

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0); mouseY.set(0)
  }, [mouseX, mouseY])

  // Orbit geometry
  const { w, h } = dims
  const cx = w / 2
  const cy = h * 0.52 // slightly below center to give header room
  const rx = isMobile ? w * 0.40 : Math.min(w * 0.44, 450)
  const ry = rx * 0.30  // perspective compression
  const planetSize = isMobile ? 130 : 210

  // Compute card positions from orbit angle
  const N = CATEGORIES.length
  const cardData = CATEGORIES.map((cat, i) => {
    const θ = angle + (i * Math.PI * 2) / N
    const { x, y, depth } = orbitPoint(θ, cx, cy, rx, ry)
    const isBehind = depth < -0.05
    const t = (depth + 1) / 2  // 0 (back) → 1 (front)
    const scale = isBehind ? 0.75 + 0.25 * t : 1.0
    const opacity = isBehind ? 0.3 + 0.7 * t : 1.0
    return { cat, x, y, depth, isBehind, scale, opacity, i }
  })


  // Planet pulse on hover
  const handleCardEnter = useCallback((idx) => {
    setHoveredIdx(idx)
    setPlanetPulse(true)
  }, [])
  const handleCardLeave = useCallback(() => {
    setHoveredIdx(null)
    setPlanetPulse(false)
  }, [])

  if (isMobile) {
    return (
      <section ref={sectionRef} className="orbital-section" id="products">
        <div ref={stickyRef} className="orbital-sticky orbital-sticky--mobile">
          <div className="orbital-header container">
            <div className="orbital-header-left">
              <span className="section-tag">Browse By Category</span>
              <h2 className="section-title">Find What You Need</h2>
            </div>
          </div>
          <div className="orbital-mobile-grid container">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                to={`/products?cat=${encodeURIComponent(cat.label)}`}
                className="orb-grid-card"
              >
                <img
                  className="orb-grid-icon"
                  src={iconUrl(cat.icon)}
                  alt={cat.label}
                  loading="lazy"
                  decoding="async"
                />
                <span className="orb-grid-name">{cat.label}</span>
                <span className="orb-grid-count">{cat.count} items</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="orbital-section" id="products">
      <div
        ref={stickyRef}
        className="orbital-sticky"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background */}
        <div className="orbital-bg-wrap">
          <OrbitalBackground />
          <ParticleField active={hoveredIdx !== null} />
        </div>

        {/* Section header */}
        <div className="orbital-header container">
          <div className="orbital-header-left">
            <span className="section-tag">Browse By Category</span>
            <h2 className="section-title">Find What You Need</h2>
          </div>
          <a href="#" className="btn-outline">View All Categories →</a>
        </div>

        {/* 3D tilt stage (mouse parallax) */}
        <motion.div
          className="orbital-3d-stage"
          style={{
            rotateX: prefersReduced ? 0 : rotateX,
            rotateY: prefersReduced ? 0 : rotateY,
            transformStyle: 'preserve-3d',
          }}
        >

          {/* LAYER 1 — Back cards (behind planet, z < planet) */}
          {cardData
            .filter(c => c.isBehind)
            .sort((a, b) => a.depth - b.depth) // deepest first
            .map(({ cat, x, y, scale, opacity, i }) => (
              <OrbCard
                key={cat.label}
                cat={cat}
                x={x} y={y}
                scale={scale}
                opacity={opacity}
                zIndex={3}
                active={hoveredIdx === i}
                onEnter={() => handleCardEnter(i)}
                onLeave={handleCardLeave}
              />
            ))}

          {/* LAYER 2 — Planet (center, occludes back cards via z-index + filled canvas) */}
          <div
            className="orbital-planet-positioner"
            style={{
              left: cx - planetSize / 2,
              top: cy - planetSize / 2,
              zIndex: 10,
            }}
          >
            <Planet size={planetSize} pulse={planetPulse} />
          </div>

          {/* LAYER 3 — Front cards (in front of planet) */}
          {cardData
            .filter(c => !c.isBehind)
            .sort((a, b) => a.depth - b.depth)
            .map(({ cat, x, y, scale, opacity, i }) => (
              <OrbCard
                key={cat.label}
                cat={cat}
                x={x} y={y}
                scale={scale}
                opacity={opacity}
                zIndex={15}
                active={hoveredIdx === i}
                onEnter={() => handleCardEnter(i)}
                onLeave={handleCardLeave}
              />
            ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Individual satellite card ────────────────────────────────────────────────
function OrbCard({ cat, x, y, scale, opacity, zIndex, active, onEnter, onLeave }) {
  const categoryParam = encodeURIComponent(cat.label)
  return (
    <div
      className="orb-card-positioner"
      style={{
        left: x - CARD_W / 2,
        top: y - CARD_H / 2,
        zIndex,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <Link
        to={`/products?cat=${categoryParam}`}
        className={`orb-card${active ? ' orb-card--active' : ''}`}
        style={{ width: CARD_W, height: CARD_H }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <motion.img
          className="orb-icon"
          src={iconUrl(cat.icon)}
          alt={cat.label}
          draggable={false}
          animate={active ? { rotate: [0, -6, 6, -3, 0] } : { rotate: 0 }}
          transition={{ duration: 0.45 }}
        />

        <motion.span
          className="orb-count"
          animate={{ y: active ? -2 : 0, opacity: active ? 1 : 0.75 }}
        >
          {cat.count} items
        </motion.span>
      </Link>
    </div>
  )
}
