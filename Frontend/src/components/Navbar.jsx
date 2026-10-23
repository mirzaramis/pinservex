import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import './Navbar.css'
import SiteLogo from './SiteLogo'

// Preferred display order for the "All Categories" dropdown (instead of the
// API's alphabetical order). Anything not listed here falls to the end,
// alphabetized among itself.
const CATEGORY_ORDER = [
  'Storage Devices',
  'Memory',
  'Network & Accessories',
  'PC & Servers',
  'Motherboards',
  'Processors',
  'Video Components',
  'Monitors',
  'Power Equipment',
  'System Cooling Parts',
  'Input Devices',
  'Computer Accessories',
  'Printers & Scanners',
  'Cameras',
  'Cables',
  'Audio',
]

const TOP_BUTTONS = [
  { label: 'All Categories', dropdown: true },
  { label: 'Memory', matches: ['Memory'] },
  { label: 'Processors', matches: ['Processors'] },
  { label: 'Motherboards', matches: ['Motherboards'] },
  { label: 'Networking', matches: ['Network & Accessories', 'Networking'] },
  { label: 'Storage Devices', matches: ['Storage Devices', 'Hard Drives', 'SSD'] },
  { label: 'PC & Servers', matches: ['PC & Servers'] },
  { label: 'Monitors', matches: ['Monitors'] },
  { label: 'Video Components', matches: ['Video Components'] },
  { label: 'Input Devices', matches: ['Input Devices'] },
  { label: 'Accessories', matches: ['Computer Accessories'] },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState([])
  const [categoryBrandsMap, setCategoryBrandsMap] = useState({})
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null)
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const categoriesRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  const isCategoryActive = (to) => {
    if (!location.pathname.startsWith('/products')) return false

    const toParams = new URLSearchParams(to.split('?')[1] || '')
    const locParams = new URLSearchParams(location.search)
    const toCatId = toParams.get('catId')
    const locCatId = locParams.get('catId') || locParams.get('categoryId')

    if (toCatId && locCatId) {
      return toCatId === locCatId
    }

    const toCat = toParams.get('cat')
    const locCat = locParams.get('cat')
    if (toCat && locCat) {
      return decodeURIComponent(toCat) === decodeURIComponent(locCat)
    }

    return false
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setSearchQuery(params.get('q') || '')
  }, [location.search])

  const handleSearch = (e) => {
    e.preventDefault()
    const query = searchQuery.trim()
    if (!query) return

    const params = new URLSearchParams()
    params.set('q', query)

    const currentParams = new URLSearchParams(location.search)
    const categoryId = currentParams.get('catId') || currentParams.get('categoryId')
    if (categoryId) {
      params.set('categoryId', categoryId)
    }

    navigate(`/products?${params.toString()}`)
  }

  useEffect(() => {
    let isMounted = true

    const normalize = (s) => (s || '').toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ')

    const groupBrandsMap = (rows) => {
      const grouped = {}
      for (const row of rows) {
        const categoryId = row.categoryId ?? row.CategoryId
        if (!grouped[categoryId]) grouped[categoryId] = []
        grouped[categoryId].push({
          id: row.brandId ?? row.BrandId,
          name: row.brandName ?? row.BrandName,
          productCount: row.productCount ?? row.ProductCount ?? 0,
        })
      }
      return grouped
    }

    const loadCategories = async () => {
      setCategoriesLoading(true)

      try {
        const [categoriesResponse, brandsMapResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/categories`),
          fetch(`${API_BASE_URL}/api/categories/brands-map`),
        ])

        if (!categoriesResponse.ok) {
          throw new Error('Failed to load categories')
        }

        const categoriesData = await categoriesResponse.json()
        const brandsMapData = brandsMapResponse.ok ? await brandsMapResponse.json() : []

        if (isMounted) {
          const list = Array.isArray(categoriesData) ? categoriesData : []
          const normalized = list.map(c => ({ ...c, _normName: normalize(c.name) }))
          const orderIndex = (name) => {
            const n = normalize(name)
            const i = CATEGORY_ORDER.findIndex(o => normalize(o) === n)
            return i === -1 ? CATEGORY_ORDER.length : i
          }
          normalized.sort((a, b) => orderIndex(a.name) - orderIndex(b.name) || a.name.localeCompare(b.name))
          setCategories(normalized)
          setCategoryBrandsMap(groupBrandsMap(Array.isArray(brandsMapData) ? brandsMapData : []))
        }
      } catch (error) {
        console.error('Unable to load categories:', error)
        if (isMounted) {
          setCategories([])
          setCategoryBrandsMap({})
        }
      } finally {
        if (isMounted) {
          setCategoriesLoading(false)
        }
      }
    }

    const scheduleLoad = () => {
      if (!isMounted) return
      loadCategories()
    }

    let cancelIdle
    let cancelTimeout

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(scheduleLoad, { timeout: 2500 })
      cancelIdle = () => window.cancelIdleCallback(idleId)
    } else {
      cancelTimeout = window.setTimeout(scheduleLoad, 300)
    }

    return () => {
      isMounted = false
      if (cancelIdle) cancelIdle()
      if (cancelTimeout) window.clearTimeout(cancelTimeout)
    }
  }, [])

  const hoveredBrands = hoveredCategoryId ? (categoryBrandsMap[hoveredCategoryId] || []) : []
  const hoveredCategory = categories.find((category) => category.id === hoveredCategoryId) ?? null

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setCategoriesOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="site-header">
      {/* ── TOP BAR (accent) ── */}
      <div className="header-topbar">
        <div className="header-container header-topbar-inner">
          <div className="topbar-left">
            <span>24/7 Technical Support</span>
            <span className="topbar-divider" />
            <span>Enterprise Solutions Available</span>
          </div>
          <div className="topbar-right">
            <a href="tel:+18135566310">(813) 556-6310</a>
            <a
              href="https://wa.me/16502480140"
              className="topbar-whatsapp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp +1 (650) 248-0140"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                />
              </svg>
              +1 (650) 248-0140
            </a>
            <Link to="/faq">Support</Link>
          </div>
        </div>
      </div>

      {/* ── MAIN BAR (black) ── */}
      <div className="header-main">
        <div className="header-container header-main-inner">
          <Link to="/" className="nav-logo">
            <SiteLogo size="nav" />
          </Link>

          <form className="header-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for products, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>

          <div className="header-actions">
            <Link to="/products" className="header-action-btn" aria-label="Shop">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              Shop
            </Link>
            <a
              href="https://wa.me/16502480140"
              className="header-action-btn"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                />
              </svg>
              WhatsApp
            </a>
            <Link to="/contact" className="header-action-btn" aria-label="Contact Us">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Contact Us
            </Link>
          </div>

          <button
            className="hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* ── NAV BAR (dark grey) ── */}
      <nav className={`header-nav ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="header-container header-nav-inner">
          <div className="nav-mobile-quick">
            <form className="nav-mobile-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search products, categories…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" aria-label="Search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </form>
            <div className="nav-mobile-links">
              <Link to="/products" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>Shop All</Link>
              <Link to="/contact" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>Contact Us</Link>
              <a href="https://wa.me/16502480140" className="nav-mobile-link" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
          </div>
          {TOP_BUTTONS.map(btn => {
            if (btn.dropdown) {
              return (
                <div
                  key={btn.label}
                  ref={categoriesRef}
                  className={`nav-item has-dropdown${categoriesOpen ? ' open' : ''}`}
                >
                  <button
                    type="button"
                    className={`nav-link nav-link-btn${categoriesOpen ? ' active' : ''}`}
                    aria-expanded={categoriesOpen}
                    aria-haspopup="true"
                    onClick={() => setCategoriesOpen((open) => !open)}
                  >
                    {btn.label}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <div
                    className="nav-dropdown nav-dropdown-mega"
                    onMouseLeave={() => setHoveredCategoryId(null)}
                  >
                    {categoriesLoading && <span className="nav-dropdown-loading">Loading categories…</span>}
                    {!categoriesLoading && categories.length === 0 && <span className="nav-dropdown-loading">No categories available</span>}
                    {!categoriesLoading && categories.length > 0 && (
                      <>
                        <div className="nav-dropdown-categories">
                          {categories.map(category => (
                            <div
                              key={category.id}
                              className={`nav-category-row${hoveredCategoryId === category.id ? ' active' : ''}`}
                              onMouseEnter={() => setHoveredCategoryId(category.id)}
                            >
                              <Link
                                to={`/products?catId=${category.id}`}
                                onClick={() => {
                                  setCategoriesOpen(false)
                                  setMobileOpen(false)
                                  setHoveredCategoryId(null)
                                }}
                              >
                                {category.name}
                              </Link>
                            </div>
                          ))}
                        </div>
                        <div className="nav-dropdown-brands">
                          {hoveredCategory ? (
                            <>
                              <p className="nav-brands-heading">{hoveredCategory.name}</p>
                              <p className="nav-brands-subheading">Brands in stock</p>
                              <div className="nav-brands-list">
                                {hoveredBrands.length === 0 && (
                                  <span className="nav-brands-empty">No brands available</span>
                                )}
                                {hoveredBrands.map((brand) => (
                                  <Link
                                    key={brand.id}
                                    to={`/products?catId=${hoveredCategory.id}&brandId=${brand.id}`}
                                    className="nav-brand-link"
                                    onClick={() => {
                                      setCategoriesOpen(false)
                                      setMobileOpen(false)
                                      setHoveredCategoryId(null)
                                    }}
                                  >
                                    <span>{brand.name}</span>
                                    <span className="nav-brand-count">{brand.productCount}</span>
                                  </Link>
                                ))}
                              </div>
                            </>
                          ) : (
                            <span className="nav-brands-empty">Hover a category to see brands</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            }

            // find best matching category id for this button
            const findMatchId = () => {
              if (!categories || categories.length === 0) return null
              const normalize = s => (s||'').toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ')
              for (const m of (btn.matches || [])) {
                const norm = normalize(m)
                const found = categories.find(c => c._normName === norm || c._normName.includes(norm) || norm.includes(c._normName))
                if (found) return found.id
              }
              return null
            }

            const catId = findMatchId()
            const to = catId ? `/products?catId=${catId}` : `/products?cat=${encodeURIComponent(btn.label)}`

            return (
              <div key={btn.label} className="nav-item">
                <Link
                  to={to}
                  className={`nav-link${isCategoryActive(to) ? ' active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {btn.label}
                </Link>
              </div>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
