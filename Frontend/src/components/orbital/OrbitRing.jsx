import { useEffect, useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import CategoryCard from './CategoryCard'

export default function OrbitRing({
  categories,
  radius,
  speed,
  clockwise = true,
  tiltX = 0,
  tiltY = 0,
  active = false,
  onCardHover,
}) {
  const [angle, setAngle] = useState(0)
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const rafRef = useRef(null)
  const angleRef = useRef(0)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (prefersReduced) return
    const dir = clockwise ? 1 : -1

    const tick = () => {
      if (hoveredIdx === null && active) {
        angleRef.current += speed * dir * 0.003
      }
      setAngle(angleRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, clockwise, speed, hoveredIdx, prefersReduced])

  const ringStyle = {
    position: 'absolute',
    width: radius * 2,
    height: radius * 2,
    top: '50%',
    left: '50%',
    marginTop: -radius,
    marginLeft: -radius,
    borderRadius: '50%',
    border: '1px solid rgba(153,17,53,0.12)',
    pointerEvents: 'none',
    transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
    transformStyle: 'preserve-3d',
  }

  return (
    <div style={ringStyle}>
      {categories.map((cat, i) => {
        const baseAngle = (Math.PI * 2 / categories.length) * i
        const a = baseAngle + angle
        const x = radius + Math.cos(a) * radius - 68
        const y = radius + Math.sin(a) * radius - 48

        return (
          <CategoryCard
            key={cat.label}
            cat={cat}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              pointerEvents: 'all',
              cursor: 'pointer',
            }}
            onHoverStart={() => {
              setHoveredIdx(i)
              onCardHover?.(cat)
            }}
            onHoverEnd={() => {
              setHoveredIdx(null)
              onCardHover?.(null)
            }}
          />
        )
      })}
    </div>
  )
}
