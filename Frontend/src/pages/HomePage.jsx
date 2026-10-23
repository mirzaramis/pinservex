import { Link } from 'react-router-dom'
import { lazy, Suspense, useState } from 'react'
import { ArrowRight, LifeBuoy } from 'lucide-react'
import { sendMessage } from '../api/messages'
import Turnstile, { TURNSTILE_ENABLED } from '../components/Turnstile'
import './HomePage.css'
import heroBanner from '../assets/herosabi.webp'
import seagateCard from '../assets/Seagate 1TB card.png'
import samsungSsdCard from '../assets/Samsung ssd card.png'
import skHynixCard from '../assets/SK hynix card.png'
import ciscoCard from '../assets/Cisco card.png'
import dellPcCard from '../assets/Dell PC card.png'
import intelProcessorCard from '../assets/INTEL Processor card.png'
import WhyUsFlipGrid from '../components/WhyUsFlipGrid'
import TopPicksCarousel from '../components/TopPicksCarousel'
import SiteLogo from '../components/SiteLogo'
import PageLoader from '../components/PageLoader'
import CountUpStat from '../components/CountUpStat'
import NewsletterSignup from '../components/NewsletterSignup'

const CategoryOrbit = lazy(() => import('../components/orbital/CategoryOrbit'))
const MotherboardReviews = lazy(() => import('../components/MotherboardReviews'))
const BrandsStarfield = lazy(() => import('../components/BrandsStarfield'))

const heroBrands = ['Dell', 'HPE', 'Cisco', 'Lenovo', 'Supermicro', 'NetApp', 'Juniper', 'Seagate']

const categories = [
  { icon: '🖥️', label: 'Rack Servers', count: '1,200+', hot: false },
  { icon: '🗄️', label: 'Tower Servers', count: '480+', hot: false },
  { icon: '🌐', label: 'Switches', count: '950+', hot: true },
  { icon: '🔒', label: 'Firewalls', count: '320+', hot: false },
  { icon: '💾', label: 'NAS Storage', count: '640+', hot: false },
  { icon: '⚡', label: 'GPU Servers', count: '180+', hot: true },
  { icon: '🧠', label: 'CPUs & Memory', count: '2,400+', hot: false },
  { icon: '📡', label: 'Wireless APs', count: '390+', hot: false },
]

const topPickTiles = [
  { image: seagateCard, alt: 'Seagate 1TB', to: '/products?catId=9' },
  { image: samsungSsdCard, alt: 'Samsung SSD', to: '/products?catId=9' },
  { image: skHynixCard, alt: 'SK hynix CMM-DDR5', to: '/products?catId=66' },
  { image: ciscoCard, alt: 'Cisco SG300-52', to: '/products?cat=Cisco%20SG300-52' },
  { image: dellPcCard, alt: 'Dell PC', to: '/products?cat=Dell%20Inspiron%203891' },
  { image: intelProcessorCard, alt: 'Intel Processor', to: '/products?catId=109' },
]

const whyUs = [
  { icon: '🏭', title: 'Authorized Reseller', desc: 'Official partner of Dell, HPE, Cisco, Lenovo, and more. All products are genuine and covered by manufacturer warranties.' },
  { icon: '💰', title: 'Price Match Guarantee', desc: "Find it cheaper anywhere else? We'll match or beat any legitimate competitor's price — no questions asked." },
  { icon: '🚚', title: 'Fast Shipping', desc: 'Orders placed before 3pm EST ship the same day. Expedited and freight options available for large orders.' },
  { icon: '🔧', title: 'Custom Configurations', desc: 'Need a server built to spec? Our engineers can configure, rack, and test before it ships to your door.' },
  { icon: '♻️', title: 'Certified Refurbished', desc: 'Every refurbished unit is tested, wiped, and certified to meet OEM specs. Grade A quality at up to 70% savings.' },
  { icon: '📞', title: 'Live Expert Support', desc: 'Our hardware specialists are available Mon–Fri 8am–6pm EST. No bots, no scripts — just real experts.' },
  { icon: '🏷️', title: 'New, Refurbished & Used', desc: 'Choose the condition that fits your budget — brand-new, certified refurbished, or tested used equipment, all clearly graded on every listing.' },
  { icon: '🌍', title: 'Worldwide Shipping', desc: 'We ship to businesses across the globe with trusted carriers, freight options, and full tracking on every order.' },
  { icon: '🔎', title: 'Hard-to-Find Sourcing', desc: "Can't find a part? Our sourcing team tracks down end-of-life, discontinued, and hard-to-find hardware through our global supplier network." },
  { icon: '🛡️', title: 'Warranty Coverage', desc: 'New products include a 90-day warranty and refurbished a 30-day warranty, with any manufacturer warranty claimed directly — extended plans available.' },
  { icon: '🤝', title: 'B2B Account Support', desc: 'Dedicated account management, volume pricing, and procurement support built for businesses and resellers of every size.' },
]

const testimonials = [
  { name: 'James K.', company: 'CTO, DataCore Inc.', text: "Pinservex delivered 20 servers in under 48 hours. Configurations were perfect, pricing was 15% better than anyone else. They're now our sole supplier." },
  { name: 'Maria S.', company: 'IT Director, NovaMed', text: "The refurbished HPE nodes we bought were flawless — you'd never know they weren't new. Saved us $40K on this budget cycle." },
  { name: 'Derek W.', company: 'VP Infra, LogiStream', text: "Called with a complex Cisco config question at 5pm. The support team stayed on and got us sorted. That level of service is rare." },
]

const stats = [
  { value: '18,000+', label: 'Products In Stock' },
  { value: '6,500+', label: 'Happy Customers' },
  { value: '99.4%', label: 'On-Time Delivery' },
  { value: '24hr', label: 'Avg. Response Time' },
]

export default function HomePage() {
  const [quote, setQuote] = useState({ sending: false, sent: false, error: '' })
  const [quoteToken, setQuoteToken] = useState('')
  const [captchaKey, setCaptchaKey] = useState(0)

  const handleQuoteSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    const data = Object.fromEntries(new FormData(form).entries())
    data.turnstileToken = quoteToken
    setQuote({ sending: true, sent: false, error: '' })
    try {
      await sendMessage('quote', data)
      setQuote({ sending: false, sent: true, error: '' })
      form.reset()
    } catch (err) {
      setQuote({ sending: false, sent: false, error: err.message })
    } finally {
      setQuoteToken('')
      setCaptchaKey(k => k + 1)
    }
  }

  return (
    <main className="home">

      {/* ── HERO BANNER ── */}
      <section className="hero-banner" aria-label="Pinservex hero">
        <img
          src={heroBanner}
          alt="Pinservex — High-Performance IT Hardware for Every Business"
          className="hero-banner-img"
          fetchPriority="high"
          decoding="async"
          width={1920}
          height={640}
        />
        {/* Real, clickable buttons overlaid on top of the baked-in hero
            "Shop Now" / "Explore Solutions" stickers (which live inside the
            image). The overlay's background matches the near-black banner so
            it covers the baked graphics; the links are the functional ones. */}
        <div className="hero-actions">
          <Link to="/products" className="hero-btn hero-btn-primary">
            Shop Now <ArrowRight aria-hidden="true" />
          </Link>
          <Link to="/contact" className="hero-btn hero-btn-secondary">
            Get Help <LifeBuoy aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="stats-strip">
        <div className="container stats-strip-inner">
          {stats.map(s => (
            <div key={s.label} className="stat-item">
              <CountUpStat className="stat-val" value={s.value} />
              <span className="stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES — ORBITAL SYSTEM ── */}
      <Suspense fallback={<PageLoader />}>
        <CategoryOrbit />
      </Suspense>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="products-section lightning-section">
        <Suspense fallback={null}>
          <BrandsStarfield />
        </Suspense>
        <div className="container">
          <div className="sec-header">
            <div>
              <span className="section-tag">Featured Products</span>
              <h2 className="section-title">Top Picks This Week</h2>
            </div>
            <Link to="/products" className="btn-outline">View All Products →</Link>
          </div>
          <TopPicksCarousel tiles={topPickTiles} />
        </div>
      </section>

      {/* ── WHY PINSERVEX ── */}
      <section className="why-section">
        <div className="container">
          <div className="sec-header centered">
            <span className="section-tag">Why Choose Us</span>
            <h2 className="section-title">The Pinservex Difference</h2>
            <p className="section-subtitle">We're not just a hardware store — we're a technology partner committed to your infrastructure success.</p>
          </div>
          <WhyUsFlipGrid items={whyUs} />
        </div>
      </section>

      {/* ── QUOTE CTA ── */}
      <section className="quote-section" id="quote">
        <div className="container">
          <div className="quote-card">
            <div className="quote-left">
              <SiteLogo size="quote" className="quote-logo" />
              <h2>Need a Custom Quote?</h2>
              <p>Whether you're buying 1 unit or building out a full data center, our team can source, price, and configure exactly what you need — fast.</p>
              <ul className="quote-perks">
                <li>✅ Quick Response</li>
                <li>✅ Volume discount pricing</li>
              </ul>
            </div>
            <form className="quote-form" onSubmit={handleQuoteSubmit}>
              <input type="text" name="website" className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div className="qf-row">
                <div className="qf-group">
                  <label htmlFor="quote-name">Full Name</label>
                  <input id="quote-name" type="text" name="name" placeholder="John Smith" />
                </div>
                <div className="qf-group">
                  <label htmlFor="quote-company">Company</label>
                  <input id="quote-company" type="text" name="company" placeholder="Your Company Inc." />
                </div>
              </div>
              <div className="qf-row">
                <div className="qf-group">
                  <label htmlFor="quote-email">Work Email</label>
                  <input id="quote-email" type="email" name="email" placeholder="john@company.com" />
                </div>
                <div className="qf-group">
                  <label htmlFor="quote-phone">Contact Number</label>
                  <input id="quote-phone" type="tel" name="phone" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
              <div className="qf-row">
                <div className="qf-group">
                  <label htmlFor="quote-part">Part Number</label>
                  <input id="quote-part" type="text" name="partNumber" placeholder="e.g. R750-BASE" />
                </div>
                <div className="qf-group">
                  <label htmlFor="quote-quantity">Quantity</label>
                  <input id="quote-quantity" type="number" name="quantity" min="1" placeholder="e.g. 10" />
                </div>
              </div>
              <div className="qf-group">
                <label htmlFor="quote-message">What are you looking for?</label>
                <textarea id="quote-message" name="message" rows={3} placeholder="E.g. 10x Dell PowerEdge R750, 64GB RAM, dual PSU..." />
              </div>
              <Turnstile key={captchaKey} onToken={setQuoteToken} />
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={quote.sending || (TURNSTILE_ENABLED && !quoteToken)}>
                {quote.sending ? 'Sending…' : 'Request Quote →'}
              </button>
              {quote.sent && (
                <p className="qf-success" role="status">✅ Thanks! Your request has been sent — we'll be in touch shortly.</p>
              )}
              {quote.error && (
                <p className="qf-error" role="alert">{quote.error}</p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ── EMAIL SUBSCRIPTION ── */}
      <NewsletterSignup />

      {/* ── REVIEWS — MOTHERBOARD LAYOUT ── */}
      <Suspense fallback={<PageLoader />}>
        <MotherboardReviews />
      </Suspense>

    </main>
  )
}
