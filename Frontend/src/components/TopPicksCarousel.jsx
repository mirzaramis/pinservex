import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './TopPicksCarousel.css'

const AUTOPLAY_DELAY_MS = 3500
const TRANSITION_MS = 600

function useVisibleCount() {
  const getCount = () => {
    if (typeof window === 'undefined') return 3
    if (window.innerWidth >= 1200) return 3
    if (window.innerWidth >= 768) return 2
    return 1
  }

  const [visibleCount, setVisibleCount] = useState(getCount)

  useEffect(() => {
    const onResize = () => setVisibleCount(getCount())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return visibleCount
}

function buildPages(items, size) {
  if (!items.length) return []

  const pages = []
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size))
  }

  const lastPage = pages[pages.length - 1]
  let cursor = 0
  while (lastPage.length < size) {
    lastPage.push(items[cursor % items.length])
    cursor += 1
  }

  return pages
}

const TopPickTile = memo(function TopPickTile({ tile }) {
  return (
    <Link to={tile.to} className="top-pick-banner-tile" draggable={false}>
      {/* eager (not lazy): these sit below the fold and previously failed to
          paint on first load, leaving the carousel blank until a reload */}
      <img src={tile.image} alt={tile.alt} decoding="async" draggable={false} />
    </Link>
  )
})

export default function TopPicksCarousel({ tiles }) {
  const visibleCount = useVisibleCount()
  const pages = useMemo(() => buildPages(tiles, visibleCount), [tiles, visibleCount])
  const totalPages = pages.length
  const loop = totalPages > 1

  // Clone last page in front and first page at the end for a seamless loop.
  const slides = useMemo(() => {
    if (!loop) return pages
    return [pages[totalPages - 1], ...pages, pages[0]]
  }, [pages, totalPages, loop])

  const [index, setIndex] = useState(loop ? 1 : 0)
  const [animate, setAnimate] = useState(true)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef(null)

  // Reset to the first real slide (without animating) whenever the page layout
  // changes, so resizing across breakpoints never strands us on a clone.
  useEffect(() => {
    setAnimate(false)
    setIndex(loop ? 1 : 0)
  }, [visibleCount, totalPages, loop])

  // Re-enable the transition on the frame after an instant jump/reset.
  useEffect(() => {
    if (animate) return undefined
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnimate(true))
    )
    return () => cancelAnimationFrame(id)
  }, [animate])

  const goTo = useCallback((next) => {
    if (!loop) return
    setAnimate(true)
    setIndex(next)
  }, [loop])

  const goNext = useCallback(() => goTo(index + 1), [goTo, index])
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index])

  useEffect(() => {
    if (!loop || paused) return undefined
    const timer = window.setTimeout(() => setIndex((i) => i + 1), AUTOPLAY_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [index, loop, paused])

  // After the slide animation lands on a clone, snap instantly to the matching
  // real slide so the loop is seamless.
  const handleTransitionEnd = useCallback(() => {
    if (!loop) return
    if (index === 0) {
      setAnimate(false)
      setIndex(totalPages)
    } else if (index === totalPages + 1) {
      setAnimate(false)
      setIndex(1)
    }
  }, [index, loop, totalPages])

  const activePage = !loop
    ? 0
    : index === 0
      ? totalPages - 1
      : index === totalPages + 1
        ? 0
        : index - 1

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (dx <= -40) goNext()
    else if (dx >= 40) goPrev()
  }

  if (!tiles.length) return null

  return (
    <div
      className="top-picks-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {loop && (
        <>
          <button
            type="button"
            className="top-picks-carousel-arrow top-picks-carousel-arrow--prev"
            onClick={goPrev}
            aria-label="Previous products"
          >
            <ChevronLeft size={22} strokeWidth={2.25} />
          </button>
          <button
            type="button"
            className="top-picks-carousel-arrow top-picks-carousel-arrow--next"
            onClick={goNext}
            aria-label="Next products"
          >
            <ChevronRight size={22} strokeWidth={2.25} />
          </button>
        </>
      )}

      <div
        className="top-picks-carousel-viewport"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="top-picks-carousel-track"
          style={{
            transform: `translate3d(-${index * 100}%, 0, 0)`,
            transition: animate ? `transform ${TRANSITION_MS}ms ease-in-out` : 'none',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((page, pageIndex) => (
            <div className="top-picks-carousel-slide" key={`${visibleCount}-${pageIndex}`}>
              {page.map((tile, tileIndex) => (
                <TopPickTile key={`${tile.alt}-${tileIndex}`} tile={tile} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {loop && (
        <div className="top-picks-carousel-dots" role="tablist" aria-label="Product groups">
          {pages.map((page, dotIndex) => (
            <button
              key={`dot-${dotIndex}`}
              type="button"
              role="tab"
              aria-selected={dotIndex === activePage}
              aria-label={`Show product group ${dotIndex + 1}`}
              className={`top-picks-carousel-dot${dotIndex === activePage ? ' is-active' : ''}`}
              onClick={() => goTo(dotIndex + 1)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
