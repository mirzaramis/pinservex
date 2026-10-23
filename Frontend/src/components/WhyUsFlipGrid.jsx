import { useCallback, useEffect, useState } from 'react'
import './WhyUsFlipGrid.css'

const FLIP_INTERVAL_MS = 2000
const FLIP_DURATION_MS = 650

export default function WhyUsFlipGrid({ items }) {
  const [topIndex, setTopIndex] = useState(0)
  const [flipTarget, setFlipTarget] = useState(null)
  const [paused, setPaused] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const naturalBottomIndex = items.length > 1 ? (topIndex + 1) % items.length : topIndex
  const bottomIndex = flipTarget ?? naturalBottomIndex
  const topItem = items[topIndex]
  const bottomItem = items[bottomIndex]

  const completeFlip = useCallback((nextIndex) => {
    window.setTimeout(() => {
      setTopIndex(nextIndex)
      setIsFlipping(false)
      setFlipTarget(null)
      setIsResetting(true)
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setIsResetting(false))
      })
    }, FLIP_DURATION_MS)
  }, [])

  const goToIndex = useCallback((targetIndex) => {
    if (targetIndex === topIndex || isFlipping || items.length <= 1) return

    setFlipTarget(targetIndex)
    setIsFlipping(true)
    completeFlip(targetIndex)
  }, [topIndex, isFlipping, items.length, completeFlip])

  const advanceToNext = useCallback(() => {
    if (isFlipping || items.length <= 1) return

    const nextIndex = (topIndex + 1) % items.length
    setFlipTarget(nextIndex)
    setIsFlipping(true)
    completeFlip(nextIndex)
  }, [topIndex, isFlipping, items.length, completeFlip])

  useEffect(() => {
    if (paused || items.length <= 1) return undefined

    const timer = window.setInterval(advanceToNext, FLIP_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [items.length, paused, advanceToNext])

  return (
    <div className="why-flip-showcase">
      <div
        className={`why-flip-slot${paused ? ' why-flip-slot--paused' : ''}${isFlipping ? ' why-flip-slot--flipping' : ''}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        tabIndex={0}
        aria-live="polite"
      >
        <div className="why-flip-scene">
          <div className={`why-flip-stack${isResetting ? ' why-flip-stack--resetting' : ''}`}>
            <article
              className="why-card card why-flip-card why-flip-card--back"
              aria-hidden={isFlipping ? 'false' : 'true'}
            >
              <div className="why-icon">{bottomItem.icon}</div>
              <h3>{bottomItem.title}</h3>
              <p>{bottomItem.desc}</p>
            </article>

            <article className="why-card card why-flip-card why-flip-card--front">
              <div className="why-icon">{topItem.icon}</div>
              <h3>{topItem.title}</h3>
              <p>{topItem.desc}</p>
            </article>
          </div>

          <div className="why-flip-shadow" aria-hidden="true" />
        </div>
      </div>

      <div className="why-flip-dots" role="tablist" aria-label="Why choose us highlights">
        {items.map((entry, index) => (
          <button
            key={entry.title}
            type="button"
            role="tab"
            aria-selected={index === topIndex}
            aria-label={`Show ${entry.title}`}
            className={`why-flip-dot${index === topIndex ? ' active' : ''}`}
            onClick={() => goToIndex(index)}
            disabled={isFlipping}
          />
        ))}
      </div>
    </div>
  )
}
