import { useState } from 'react'
import { Mail, CheckCircle2 } from 'lucide-react'
import { sendMessage } from '../api/messages'
import Turnstile, { TURNSTILE_ENABLED } from './Turnstile'
import './NewsletterSignup.css'

// Email capture for product updates / stock lists. There's no write API yet,
// so this validates client-side and shows a confirmation; wire the submit to a
// real endpoint (or the quote form's backend) when one exists.
export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState('')
  const [captchaKey, setCaptchaKey] = useState(0)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true)
    setError('')
    try {
      await sendMessage('subscribe', {
        email,
        website: e.target.website?.value || '',
        turnstileToken: token,
      })
      setDone(true)
    } catch (err) {
      setError(err.message)
      setToken('')
      setCaptchaKey(k => k + 1)
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="newsletter-section" id="subscribe">
      <div className="container">
        <div className="newsletter-card">
          <div className="newsletter-icon" aria-hidden="true">
            <Mail />
          </div>
          <div className="newsletter-copy">
            <h2>Stay in the loop</h2>
            <p>
              Subscribe for new arrivals, price drops, and fresh stock lists —
              delivered straight to your inbox.
            </p>
          </div>

          {done ? (
            <div className="newsletter-success" role="status">
              <CheckCircle2 aria-hidden="true" />
              <span>You're subscribed! We'll be in touch with the latest stock.</span>
            </div>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <input type="text" name="website" className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
              <button type="submit" className="btn-primary" disabled={sending || (TURNSTILE_ENABLED && !token)}>
                {sending ? 'Subscribing…' : 'Subscribe →'}
              </button>
              <Turnstile key={captchaKey} onToken={setToken} />
            </form>
          )}
          {error && !done && (
            <p className="newsletter-error" role="alert">{error}</p>
          )}
        </div>
      </div>
    </section>
  )
}
