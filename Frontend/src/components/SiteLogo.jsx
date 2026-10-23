import siteLogo from '../assets/logo.png'

export default function SiteLogo({ size = 'nav', className = '' }) {
  return (
    <img
      src={siteLogo}
      alt="Pinservex — IT Hardware Solutions"
      className={`site-logo-img site-logo-img--${size} ${className}`.trim()}
      decoding="async"
      width={485}
      height={210}
    />
  )
}
