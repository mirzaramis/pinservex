import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendMessage } from '../api/messages'
import Turnstile, { TURNSTILE_ENABLED } from '../components/Turnstile'
import './ContactPage.css'

const INFO = [
  { icon: '📍', label: 'Address', value: '5004 Terrace Palms Cir, Tampa, FL 33617, US', href: 'https://www.google.com/maps/search/?api=1&query=5004+Terrace+Palms+Cir,+Tampa,+FL+33617' },
  { icon: '📞', label: 'Phone', value: '(813) 556-6310', href: 'tel:+18135566310' },
  { icon: '💬', label: 'WhatsApp', value: '+1 (650) 248-0140', href: 'https://wa.me/16502480140' },
  { icon: '📧', label: 'Email', value: 'info@pinservex.com', href: 'mailto:info@pinservex.com' },
  { icon: '🕐', label: 'Hours', value: 'Mon–Fri 8am–6pm EST' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name:'', company:'', email:'', phone:'', subject:'', message:'' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState('')
  const [captchaKey, setCaptchaKey] = useState(0)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const submit = async e => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      await sendMessage('contact', {
        ...form,
        website: e.target.website?.value || '',
        turnstileToken: token,
      })
      setSent(true)
      setForm({ name:'', company:'', email:'', phone:'', subject:'', message:'' })
    } catch (err) {
      setError(err.message)
      setToken('')
      setCaptchaKey(k => k + 1)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="contact-page">
      <div className="page-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">Home</Link><span>/</span><span className="bc-current">Contact</span>
          </nav>
          <h1 className="page-hero-title">Get In Touch</h1>
          <p className="page-hero-sub">Enterprise IT solutions, bulk pricing, and technical support</p>
        </div>
      </div>

      <div className="container contact-layout">
        {/* Left */}
        <div className="contact-left">
          <h2 className="contact-left-heading">We're Here to Help</h2>
          <p className="contact-left-sub">Whether you need a bulk quote, technical assistance, or partnership information — our enterprise team is ready.</p>
          <div className="contact-info-cards">
            {INFO.map(i => (
              <div key={i.label} className="contact-info-card">
                <span className="contact-info-icon">{i.icon}</span>
                <div>
                  <p className="contact-info-label">{i.label}</p>
                  {i.href ? (
                    <a
                      className="contact-info-value contact-info-link"
                      href={i.href}
                      target={i.href.startsWith('http') ? '_blank' : undefined}
                      rel={i.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {i.value}
                    </a>
                  ) : (
                    <p className="contact-info-value">{i.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="contact-right">
          {sent ? (
            <div className="contact-success card">
              <span className="success-icon">✅</span>
              <h3>Message Sent!</h3>
              <p>We'll get back to you within 1 business day.</p>
              <button className="btn-primary" onClick={() => setSent(false)}>Send Another</button>
            </div>
          ) : (
            <form className="contact-form card" onSubmit={submit}>
              <h3 className="form-heading">Send a Message</h3>
              <input type="text" name="website" className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input name="name" value={form.name} onChange={handle} placeholder="John Smith" required />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input name="company" value={form.company} onChange={handle} placeholder="Acme Corp" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={form.email} onChange={handle} placeholder="you@company.com" required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" value={form.phone} onChange={handle} placeholder="+1 (555) 000-0000" />
                </div>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select name="subject" value={form.subject} onChange={handle} required>
                  <option value="">Select a subject…</option>
                  <option>General Inquiry</option>
                  <option>Request Quote</option>
                  <option>Technical Support</option>
                  <option>RMA</option>
                  <option>Bulk Order</option>
                  <option>Partnership</option>
                </select>
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea name="message" value={form.message} onChange={handle} rows={5} placeholder="Tell us how we can help…" required />
              </div>
              <Turnstile key={captchaKey} onToken={setToken} />
              {error && <p className="form-error" role="alert">{error}</p>}
              <button type="submit" className="btn-primary contact-submit" disabled={sending || (TURNSTILE_ENABLED && !token)}>
                {sending ? 'Sending…' : 'Send Message →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
