import { useState } from 'react'
import { motion } from 'framer-motion'

export default function CategoryCard({ cat, style, onHoverStart, onHoverEnd }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.a
      href="#"
      className="orbital-cat-card"
      style={style}
      onHoverStart={() => { setHovered(true); onHoverStart?.() }}
      onHoverEnd={() => { setHovered(false); onHoverEnd?.() }}
      whileHover={{ scale: 1.12, zIndex: 20 }}
      animate={hovered
        ? { boxShadow: '0 0 40px rgba(153,17,53,0.55), 0 0 80px rgba(153,17,53,0.2)' }
        : { boxShadow: '0 0 30px rgba(153,17,53,0.15)' }
      }
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {cat.hot && <span className="orbital-hot-badge">HOT</span>}

      <motion.span
        className="orbital-cat-icon"
        animate={hovered ? { rotate: [0, -10, 10, -5, 0] } : { rotate: 0 }}
        transition={{ duration: 0.4 }}
      >
        {cat.icon}
      </motion.span>

      <motion.span
        className="orbital-cat-name"
        animate={hovered ? { color: '#ffffff' } : { color: '#d0d0d0' }}
      >
        {cat.label}
      </motion.span>

      <motion.span
        className="orbital-cat-count"
        animate={hovered ? { y: -3, opacity: 1 } : { y: 0, opacity: 0.6 }}
      >
        {cat.count} items
      </motion.span>

      {/* Active border */}
      <motion.div
        className="orbital-card-border"
        animate={hovered
          ? { opacity: 1, borderColor: '#991135' }
          : { opacity: 0.6, borderColor: 'rgba(153,17,53,0.18)' }
        }
      />
    </motion.a>
  )
}
