import { useRef, useState, useEffect } from 'react'

// Parse a display value like "18,000+", "99.4%", "24hr" into its numeric
// target plus the surrounding prefix/suffix and formatting hints, so the
// count-up can animate the number while preserving how it's written.
function parseValue(raw) {
  const m = String(raw).match(/^(\D*)([\d,]*\.?\d+)(.*)$/)
  if (!m) return null
  const [, prefix, numStr, suffix] = m
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0
  return {
    prefix,
    suffix,
    target: parseFloat(numStr.replace(/,/g, '')),
    decimals,
    grouped: numStr.includes(','),
  }
}

function format(n, { decimals, grouped }) {
  if (grouped) {
    return n.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }
  return n.toFixed(decimals)
}

const DURATION = 900 // ms
const easeOut = t => 1 - Math.pow(1 - t, 3)

export default function CountUpStat({ value, className }) {
  const parsed = parseValue(value)
  // Start at zero so the number visibly counts up when the section is reached.
  const zeroText = parsed ? parsed.prefix + format(0, parsed) + parsed.suffix : value
  const [display, setDisplay] = useState(zeroText)
  const ref = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!parsed) return
    const el = ref.current
    if (!el) return

    const run = () => {
      cancelAnimationFrame(rafRef.current)
      const start = performance.now()
      const tick = now => {
        const p = Math.min((now - start) / DURATION, 1)
        setDisplay(parsed.prefix + format(parsed.target * easeOut(p), parsed) + parsed.suffix)
        if (p < 1) rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    // Re-run the count-up every time the stat scrolls into view.
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) run()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  if (!parsed) return <span className={className}>{value}</span>

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
