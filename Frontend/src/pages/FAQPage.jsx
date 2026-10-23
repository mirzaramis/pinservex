import { useState } from 'react'
import './FAQPage.css'

const faqsLeft = [
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, Amex), ACH bank transfers, wire transfers, and company purchase orders for approved accounts. Net-30 terms are available for qualified businesses — contact our sales team to apply.',
  },
  {
    q: 'Do you offer bulk/volume discounts?',
    a: 'Yes. We offer tiered pricing for volume orders and long-term procurement agreements. Discounts start at 5 or more units for most product lines. Reach out via our contact form or call us directly to get a custom bulk quote.',
  },
  {
    q: 'What is your return policy?',
    a: 'New items may be returned within 30 days of delivery in original, unopened condition for a full refund. Refurbished and open-box items carry a 15-day return window. RMA authorization is required — please contact our support team to initiate a return.',
  },
  {
    q: 'Do you sell refurbished equipment?',
    a: 'Absolutely. Our refurbished inventory is professionally tested, cleaned, and certified to meet OEM specifications. Every refurbished item is sold with a 30-day warranty and is clearly labeled with its condition grade on the product listing.',
  },
  {
    q: 'How long does shipping take?',
    a: 'In-stock items typically ship within 1–2 business days. Standard ground shipping takes 3–7 business days depending on destination. Expedited 1-day and 2-day options are available at checkout. Large or freight orders may have extended lead times.',
  },
  {
    q: 'Can I get a product quote before purchasing?',
    a: 'Yes — use the "Quote" button on any product page or submit a request through our Contact page. Our sales team will respond within 4 business hours with pricing, availability, and shipping estimates tailored to your order.',
  },
]

const faqsRight = [
  {
    q: 'Do you offer technical support?',
    a: 'Yes. Our technical support team is available Monday–Friday, 8am–6pm EST by phone and email. Enterprise customers with active support contracts also have access to 24/7 emergency support. We assist with compatibility questions, configuration guidance, and RMA troubleshooting.',
  },
  {
    q: 'Are your products covered by warranty?',
    a: 'Yes. New products are covered by a 90-day warranty and refurbished products by a 30-day warranty. Any manufacturer warranty is claimed directly with the manufacturer. Extended warranty plans are available for servers and networking gear — ask your sales rep for details.',
  },
  {
    q: 'Can I track my order?',
    a: 'Yes. Once your order ships, you will receive a confirmation email with a tracking number and carrier link. You can also log into your account to view order history and shipment status. Freight shipments include LTL tracking numbers and delivery appointment notifications.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'We ship to Canada, Mexico, the UK, EU member states, Australia, and select other countries. International orders are subject to customs duties and import taxes assessed by the destination country. Contact us for a freight quote on large international shipments.',
  },
  {
    q: 'What brands do you carry?',
    a: 'Our catalog includes Dell, HPE, Cisco, Lenovo, Supermicro, Asus, Samsung, Seagate, Kingston, Intel, NetApp, Juniper, and many more. We source from authorized distributors and certified refurbishers to ensure authenticity across our entire inventory.',
  },
  {
    q: 'How do I request a custom configuration?',
    a: 'Use our Contact page to submit a custom configuration request. Include the base model, desired specs (RAM, storage, CPUs, etc.), and required quantity. Our pre-sales engineering team will validate the config and send a detailed quote typically within one business day.',
  },
]

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq-item ${open ? 'faq-open' : ''}`}>
      <button className="faq-question" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{q}</span>
        <svg
          className="faq-chevron"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className="faq-answer-wrap">
        <p className="faq-answer">{a}</p>
      </div>
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="faq-page">
      {/* Hero */}
      <div className="faq-hero">
        <div className="container">
          <span className="section-tag">Help Center</span>
          <h1 className="section-title">Frequently Asked Questions</h1>
          <p className="section-subtitle">
            Find answers to the most common questions about our products, shipping, support, and policies.
          </p>
        </div>
      </div>

      {/* Accordion Section */}
      <section className="faq-section">
        <div className="container">
          <div className="faq-columns">
            <div className="faq-col">
              {faqsLeft.map((item, i) => (
                <AccordionItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
            <div className="faq-col">
              {faqsRight.map((item, i) => (
                <AccordionItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="faq-cta-section">
        <div className="container">
          <div className="faq-cta card">
            <h2>Still have questions?</h2>
            <p>Our team is ready to help — reach us by email or phone any time during business hours.</p>
            <div className="faq-cta-actions">
              <a href="mailto:sales@pinservex.com" className="btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                sales@pinservex.com
              </a>
              <a href="tel:+18007467379" className="btn-outline">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.07 6.07l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                +1 (800) 746-7379
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
