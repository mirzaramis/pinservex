import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../config'
import './CategoryPage.css'

const BRANDS = ['Dell','HPE','Cisco','Lenovo','Supermicro','Asus','Samsung','Seagate','NetApp','Juniper']

export default function CategoryPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    fetch(`${API_BASE_URL}/api/categories`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed'))
      .then(data => { if (mounted) setCategories(Array.isArray(data) ? data : []) })
      .catch(err => { console.error('Failed to load categories', err); if (mounted) setCategories([]) })
      .finally(() => { if (mounted) setLoading(false) })

    return () => { mounted = false }
  }, [])

  return (
    <div className="category-page">
      <div className="page-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">Home</Link><span>/</span><span className="bc-current">Categories</span>
          </nav>
          <h1 className="page-hero-title">Browse by Category</h1>
          <p className="page-hero-sub">Find enterprise-grade IT hardware across all categories</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="cat-grid">
          {loading && <p>Loading categories…</p>}
          {!loading && categories.length === 0 && <p>No categories available.</p>}
          {!loading && categories.map(c => (
            <Link to={`/products?catId=${c.id}`} key={c.id} className="cat-page-card">
              <div className="cat-icon-circle">
                <span className="cat-emoji">📦</span>
              </div>
              <h3 className="cat-card-name">{c.name}</h3>
              <p className="cat-card-count">{c.id} • Category</p>
              <span className="cat-card-link">View Products →</span>
            </Link>
          ))}
        </div>

        <div className="brands-strip-section">
          <p className="brands-strip-label">Featured Brands</p>
          <div className="brands-strip-row">
            {BRANDS.map(b => (
              <span key={b} className="brand-badge">{b}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
