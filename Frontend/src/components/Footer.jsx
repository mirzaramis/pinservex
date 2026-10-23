import { Link } from 'react-router-dom'
import './Footer.css'
import footerBg from '../assets/footersabi.webp'
import SiteLogo from './SiteLogo'
import { Phone, Mail, MapPin } from 'lucide-react'

// Single-path brand marks (Simple Icons), filled with currentColor.
const BRAND_ICONS = {
  whatsapp: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z',
  instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  x: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  pinterest: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.2-2.405.041-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.333 1.363-.053.225-.172.271-.402.165-1.495-.696-2.433-2.884-2.433-4.647 0-3.792 2.755-7.276 7.951-7.276 4.174 0 7.417 2.974 7.417 6.949 0 4.147-2.616 7.485-6.249 7.485-1.221 0-2.37-.635-2.766-1.386l-.75 2.86c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
}

function BrandIcon({ name }) {
  return (
    <svg className="brand-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={BRAND_ICONS[name]} />
    </svg>
  )
}

const WHATSAPP_NUMBER = '16502480140'
const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=5004+Terrace+Palms+Cir,+Tampa,+FL+33617'

const socials = [
  { name: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/pin_servex/' },
  { name: 'Facebook', icon: 'facebook', url: 'https://m.facebook.com/61584778553116/' },
  { name: 'LinkedIn', icon: 'linkedin', url: 'https://www.linkedin.com/company/pinservex' },
]

export default function Footer() {
  const cols = [
    {
      title: 'Shop', links: [
        { label: 'All Products', to: '/products' },
        { label: 'Servers & PCs', to: '/products?cat=PC%20%26%20Servers' },
        { label: 'Processors', to: '/products?cat=Processors' },
        { label: 'Memory', to: '/products?cat=Memory' },
        { label: 'Storage Devices', to: '/products?cat=Storage%20Devices' },
        { label: 'Networking', to: '/products?cat=Network' },
        { label: 'Monitors', to: '/products?cat=Monitors' },
      ],
    },
    {
      title: 'Company', links: [
        { label: 'Home', to: '/' },
        { label: 'Contact Sales', to: '/contact' },
        { label: 'FAQ & Support', to: '/faq' },
      ],
    },
  ]

  return (
    <footer className="footer">
      {/* MAIN FOOTER */}
      <div className="footer-bg-outer">
      <div className="footer-bg">
        <img src={footerBg} alt="" className="footer-bg-img" aria-hidden="true" loading="lazy" decoding="async" />
        <div className="footer-overlay">
      <div className="footer-main">
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <SiteLogo size="footer" />
            </div>
            <p>Your trusted source for enterprise IT hardware. New, refurbished, and end-of-life equipment from top brands — delivered fast, priced right.</p>
            <div className="footer-contact-list">
              <a href="tel:+18135566310">
                <Phone aria-hidden="true" /> (813) 556-6310
              </a>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
                <BrandIcon name="whatsapp" /> WhatsApp: +1 (650) 248-0140
              </a>
              <a href="mailto:info@pinservex.com">
                <Mail aria-hidden="true" /> info@pinservex.com
              </a>
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                <MapPin aria-hidden="true" /> 5004 Terrace Palms Cir, Tampa, FL 33617, US
              </a>
            </div>
            <div className="footer-socials">
              {socials.map(s => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social"
                  aria-label={s.name}
                  title={s.name}
                >
                  <BrandIcon name={s.icon} />
                </a>
              ))}
            </div>
            <div className="footer-badges">
              <span>🔒 SSL Secure</span>
              <span>✅ Authorized Reseller</span>
              <span>🏆 A+ BBB</span>
            </div>
          </div>

          {cols.map(col => (
            <div key={col.title} className="footer-col">
              <h4>{col.title}</h4>
              <ul>
                {col.links.map(l => <li key={l.label}><Link to={l.to}>{l.label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© 2025 Pinservex IT Hardware Solutions. All rights reserved.</p>
          <div className="payment-icons">
            {['Visa', 'MC', 'AmEx', 'PayPal', 'Wire'].map(p => (
              <span key={p} className="pay-badge">{p}</span>
            ))}
          </div>
        </div>
      </div>
      </div>
      </div>
      </div>
    </footer>
  )
}
