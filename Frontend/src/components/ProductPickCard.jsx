import { useState } from 'react'
import { Link } from 'react-router-dom'
import './ProductPickCard.css'

export default function ProductPickCard({
  title,
  badge = 'New',
  specLines = [],
  price,
  image,
  fallback = 'P',
  to,
}) {
  const [imageError, setImageError] = useState(false)
  const showImage = image && !imageError

  const content = (
    <>
      <div className="top-pick-image">
        {showImage ? (
          <img
            src={image}
            alt={title}
            className="top-pick-image-photo"
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="top-pick-image-fallback" aria-hidden="true">
            <span>{fallback}</span>
          </div>
        )}
      </div>

      <div className="top-pick-content">
        <div className="top-pick-title-row">
          <h3 className="top-pick-name">{title}</h3>
          {badge && <span className="top-pick-badge">{badge}</span>}
        </div>

        {specLines.length > 0 && (
          <ul className="top-pick-specs">
            {specLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}

        {price && <p className="top-pick-price">{price}</p>}

        {to && <span className="top-pick-view-btn">View</span>}
      </div>
    </>
  )

  if (to) {
    return (
      <Link to={to} className="top-pick-card top-pick-card--link" aria-label={`View ${title}`}>
        {content}
      </Link>
    )
  }

  return <article className="top-pick-card">{content}</article>
}
