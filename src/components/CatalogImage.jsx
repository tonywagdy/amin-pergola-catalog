import { APP_BASE } from '../data/defaultCatalog'

// Reuse the exact printed border from the original catalog page.
export default function CatalogImage({ framed, className = '', style, ...imageProps }) {
  if (!framed) return <img {...imageProps} className={className} style={style} />

  return (
    <span
      className={`${className} catalog-framed-image`}
      style={{ ...style, backgroundImage: `url("${APP_BASE}pages/page1.jpg")` }}
    >
      <img {...imageProps} className="catalog-framed-photo" />
      <img src={`${APP_BASE}logo.png`} className="catalog-frame-logo" alt="" aria-hidden="true" draggable={false} />
    </span>
  )
}
