import { useMemo } from 'react'

/*
  Rolls-Royce Starlight Headliner — CSS-only particle field.
  All animations run on the compositor thread (opacity + transform).
  Zero JS per frame. Respects prefers-reduced-motion.
*/

const COLORS = ['#5EFF7A', '#F8F8F4', '#FFD96A']

// Seeded-ish deterministic random so SSR-safe and stable on re-render
let _seed = 1
function sr() {
  _seed = (_seed * 16807 + 0) % 2147483647
  return (_seed - 1) / 2147483646
}
function srRange(a, b) { return a + sr() * (b - a) }
function srPick(arr)   { return arr[Math.floor(sr() * arr.length)] }

// Keyframes injected once — only 6 total, shared across all particles
const STYLE_TAG = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes sf-pulse-far {
    0%,100% { opacity: var(--sf-lo); filter: blur(0.3px); }
    50%      { opacity: var(--sf-hi); filter: blur(0px);   }
  }
  @keyframes sf-pulse-mid {
    0%,100% { opacity: var(--sf-lo); filter: blur(0.2px); }
    50%      { opacity: var(--sf-hi); filter: blur(0px);   }
  }
  @keyframes sf-pulse-near {
    0%,100% { opacity: var(--sf-lo); }
    50%      { opacity: var(--sf-hi); }
  }
  @keyframes sf-drift-a {
    0%   { transform: translate(0px, 0px); }
    25%  { transform: translate(var(--sf-dx), calc(var(--sf-dy) * -0.6)); }
    50%  { transform: translate(calc(var(--sf-dx) * 0.4), var(--sf-dy)); }
    75%  { transform: translate(calc(var(--sf-dx) * -0.7), calc(var(--sf-dy) * 0.3)); }
    100% { transform: translate(0px, 0px); }
  }
  @keyframes sf-drift-b {
    0%   { transform: translate(0px, 0px); }
    33%  { transform: translate(calc(var(--sf-dx) * -0.5), var(--sf-dy)); }
    66%  { transform: translate(var(--sf-dx), calc(var(--sf-dy) * -0.4)); }
    100% { transform: translate(0px, 0px); }
  }
  @keyframes sf-drift-c {
    0%   { transform: translate(0px, 0px); }
    40%  { transform: translate(var(--sf-dx), var(--sf-dy)); }
    80%  { transform: translate(calc(var(--sf-dx) * -0.3), calc(var(--sf-dy) * 0.7)); }
    100% { transform: translate(0px, 0px); }
  }
}
@media (prefers-reduced-motion: reduce) {
  .sf-particle { animation: none !important; opacity: 0.12 !important; }
}
`

function buildParticles() {
  _seed = 42  // reset seed so output is stable
  const particles = []

  // Layer config: [count, sizeRange, loAlpha, hiAlpha, glowPx, pulseDurRange, driftPxRange, driftDurRange]
  const layers = [
    // far  — 200 particles, sub-pixel to 0.8px, very faint
    { id: 'far',  count: 200, size: [0.3, 0.75], lo: [0.04, 0.14], hi: [0.18, 0.42],
      glow: [0.8, 2.0],  pulseDur: [3.5, 9.0],  driftPx: [0.4, 1.0], driftDur: [12, 22] },
    // mid  — 110 particles
    { id: 'mid',  count: 110, size: [0.6, 1.10], lo: [0.07, 0.20], hi: [0.28, 0.62],
      glow: [1.5, 4.0],  pulseDur: [2.8, 7.0],  driftPx: [0.8, 1.8], driftDur: [9,  17] },
    // near — 28 particles, slightly larger glow
    { id: 'near', count:  28,  size: [0.9, 1.60], lo: [0.10, 0.28], hi: [0.40, 0.80],
      glow: [3.0, 7.0],  pulseDur: [2.2, 5.5],  driftPx: [1.2, 2.6], driftDur: [7,  13] },
  ]

  const driftKfs = ['sf-drift-a', 'sf-drift-b', 'sf-drift-c']

  for (const lyr of layers) {
    for (let i = 0; i < lyr.count; i++) {
      const x    = srRange(0.2, 99.8)    // % across section
      const y    = srRange(0.5, 99.5)
      const size = srRange(...lyr.size)
      const color = srPick(COLORS)
      const lo   = srRange(...lyr.lo)
      const hi   = srRange(...lyr.hi)
      const glow = srRange(...lyr.glow)

      // Wave offset: delay proportional to x so wave sweeps left→right
      // Multiple wave periods overlap for depth
      const wavePeriod = lyr.id === 'far' ? 14 : lyr.id === 'mid' ? 10 : 7
      const waveDelay  = -(x / 100) * wavePeriod  // negative = already-started phase
      const randDelay  = srRange(0, wavePeriod)    // extra random stagger
      const pulseDelay = (waveDelay + randDelay) % wavePeriod
      const pulseDur   = srRange(...lyr.pulseDur)

      const driftPx  = srRange(...lyr.driftPx)
      const driftDy  = srRange(-driftPx, driftPx)
      const driftDur = srRange(...lyr.driftDur)
      const driftKf  = srPick(driftKfs)
      const driftDelay = srRange(-driftDur, 0)

      const pulseKf = `sf-pulse-${lyr.id}`

      particles.push({
        key: `${lyr.id}-${i}`,
        style: {
          position: 'absolute',
          left: `${x}%`,
          top:  `${y}%`,
          width:  `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: `0 0 ${glow}px ${glow * 0.6}px ${color}`,
          // CSS custom props consumed by keyframes
          '--sf-lo': lo,
          '--sf-hi': hi,
          '--sf-dx': `${driftPx}px`,
          '--sf-dy': `${driftDy}px`,
          // Two layered animations: pulse + drift
          animation: [
            `${pulseKf} ${pulseDur.toFixed(2)}s ${pulseDelay.toFixed(2)}s ease-in-out infinite`,
            `${driftKf} ${driftDur.toFixed(2)}s ${driftDelay.toFixed(2)}s ease-in-out infinite`,
          ].join(', '),
          willChange: 'opacity, transform',
          pointerEvents: 'none',
        },
      })
    }
  }

  return particles
}

export default function StarfieldBg() {
  // Build once — stable since seed is reset each call
  const particles = useMemo(() => buildParticles(), [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE_TAG }} />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {particles.map(p => (
          <div key={p.key} className="sf-particle" style={p.style} />
        ))}
      </div>
    </>
  )
}
