import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import { sendMessage } from '../api/messages'
import Turnstile, { TURNSTILE_ENABLED } from '../components/Turnstile'
import './ProductPage.css'

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    partNumber: '',
    quantity: 10,
    message: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formState, setFormState] = useState({ sending: false, sent: false, error: '' })
  const [token, setToken] = useState('')
  const [captchaKey, setCaptchaKey] = useState(0)

  useEffect(() => {
    let mounted = true
    const productId = Number(id)

    if (!productId || productId <= 0) {
      setError('Invalid product ID.')
      setLoading(false)
      return
    }

    const loadProduct = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/${productId}`)
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Product not found.')
          }
          throw new Error('Failed to load product.')
        }

        const data = await res.json()
        if (mounted) {
          setProduct(data)
          setError('')
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unable to load product.')
          setProduct(null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadProduct()
    return () => {
      mounted = false
    }
  }, [id])

  useEffect(() => {
    if (!product) return

    const name = product.Name ?? product.name ?? ''
    const sku = product.SKU ?? product.sku ?? ''

    setForm((prev) => ({
      ...prev,
      partNumber: sku,
      message: prev.message || `Quote request for ${name}`,
    }))
  }, [product])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) || 1 : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const productName = product?.Name ?? product?.name ?? ''
    const sku = product?.SKU ?? product?.sku ?? ''
    setFormState({ sending: true, sent: false, error: '' })
    try {
      await sendMessage('product-inquiry', {
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone,
        productName,
        sku,
        partNumber: form.partNumber,
        quantity: String(form.quantity),
        message: form.message,
        website: e.target.website?.value || '',
        turnstileToken: token,
      })
      setFormState({ sending: false, sent: true, error: '' })
    } catch (err) {
      setFormState({ sending: false, sent: false, error: err.message })
    } finally {
      setToken('')
      setCaptchaKey(k => k + 1)
    }
  }

  const renderBody = () => {
    if (loading) return <p className="product-detail-status">Loading product details…</p>
    if (error) return <p className="product-detail-status product-detail-error">{error}</p>
    if (!product) return <p className="product-detail-status product-detail-error">No product data available.</p>

    const name = product.Name ?? product.name
    const sku = product.SKU ?? product.sku
    const category = product.CategoryName ?? product.categoryName
    const image = product.ImageUrl ?? product.imageUrl

    return (
      <div className="product-detail-grid">
        <main className="product-detail-main">
          <div className="product-detail-card">
            <div className="product-detail-image-wrap">
              {image ? (
                <img
                  className="product-detail-image"
                  src={image}
                  alt={name}
                  onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.style.display = 'none' }}
                />
              ) : (
                <div className="product-detail-placeholder">{(name || 'P')[0]}</div>
              )}
            </div>
            <div className="product-detail-info">
              <p className="product-detail-category">{category || 'Uncategorized'}</p>
              <h1 className="product-detail-title">{name}</h1>
              <p className="product-detail-sku">SKU: <strong>{sku || 'N/A'}</strong></p>
              <p className="product-detail-copy">
                Order this enterprise-grade product in bulk with fast delivery and dedicated support. Use the bulk order form to request a quote for the quantity you need.
              </p>
            </div>
          </div>
        </main>

        <aside className="product-detail-aside">
          <div className="bulk-order-panel">
            <div className="bulk-order-header">
              <span className="bulk-order-label">Bulk order request</span>
              <p className="bulk-order-subtitle">Submit your required quantity and our sales team will follow up with pricing, lead time, and availability.</p>
            </div>
            <form className="bulk-order-form" onSubmit={handleSubmit}>
              <input type="text" name="website" className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div className="bulk-form-row">
                <label className="form-field">
                  <span>Full Name</span>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Smith"
                    required
                  />
                </label>
                <label className="form-field">
                  <span>Company</span>
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Your Company Inc."
                  />
                </label>
              </div>
              <div className="bulk-form-row">
                <label className="form-field">
                  <span>Work Email</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@company.com"
                    required
                  />
                </label>
                <label className="form-field">
                  <span>Contact Number</span>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                  />
                </label>
              </div>
              <label className="form-field">
                <span>Product</span>
                <input type="text" value={name} readOnly />
              </label>
              <label className="form-field">
                <span>SKU</span>
                <input type="text" value={sku || 'N/A'} readOnly />
              </label>
              <div className="bulk-form-row">
                <label className="form-field">
                  <span>Part Number</span>
                  <input
                    type="text"
                    name="partNumber"
                    value={form.partNumber}
                    onChange={handleChange}
                    placeholder="e.g. R750-BASE"
                  />
                </label>
                <label className="form-field">
                  <span>Quantity</span>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={form.quantity}
                    onChange={handleChange}
                  />
                </label>
              </div>
              <label className="form-field">
                <span>What are you looking for?</span>
                <textarea
                  name="message"
                  rows={3}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="E.g. 10x Dell PowerEdge R750, 64GB RAM, dual PSU..."
                />
              </label>
              <Turnstile key={captchaKey} onToken={setToken} />
              <button type="submit" className="btn-primary bulk-order-submit" disabled={formState.sending || (TURNSTILE_ENABLED && !token)}>
                {formState.sending ? 'Sending…' : 'Request Quote'}
              </button>
              {formState.sent && (
                <p className="bulk-order-success" role="status">✅ Request sent — our sales team will follow up shortly.</p>
              )}
              {formState.error && (
                <p className="bulk-order-error" role="alert">{formState.error}</p>
              )}
            </form>
          </div>
          <button className="btn-outline bulk-order-back" onClick={() => navigate(-1)}>
            Back to products
          </button>
        </aside>
      </div>
    )
  }

  return (
    <div className="product-detail-page">
      <div className="product-detail-hero">
        <div className="container product-detail-hero-inner">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/products">Products</Link>
            <span>/</span>
            <span className="breadcrumb-current">Product Details</span>
          </nav>
          <h1 className="page-title">Product Details</h1>
          <p className="page-subtitle">Review the product and submit a bulk order request for fast enterprise fulfillment.</p>
        </div>
      </div>

      <div className="container product-detail-body">
        {renderBody()}
      </div>
    </div>
  )
}
