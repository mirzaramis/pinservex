import { useEffect, useRef } from 'react'

// Public site key (safe to expose). Set VITE_TURNSTILE_SITE_KEY in Frontend/.env.local
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
export const TURNSTILE_ENABLED = Boolean(TURNSTILE_SITE_KEY)

let scriptPromise = null
function loadTurnstileScript() {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = reject
    document.head.appendChild(s)
  })
  return scriptPromise
}

// Renders a Cloudflare Turnstile widget and reports the token via onToken.
// Renders nothing when no site key is configured, so forms keep working.
export default function Turnstile({ onToken }) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const cbRef = useRef(onToken)
  cbRef.current = onToken

  useEffect(() => {
    if (!TURNSTILE_ENABLED) return undefined
    let cancelled = false

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return
        if (widgetIdRef.current != null) return
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token) => cbRef.current?.(token),
          'error-callback': () => cbRef.current?.(''),
          'expired-callback': () => cbRef.current?.(''),
        })
      })
      .catch(() => {})

    return () => {
      cancelled = true
      if (widgetIdRef.current != null && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current) } catch { /* noop */ }
        widgetIdRef.current = null
      }
    }
  }, [])

  if (!TURNSTILE_ENABLED) return null
  return <div ref={containerRef} className="cf-turnstile-widget" />
}
