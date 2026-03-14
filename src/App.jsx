import { forwardRef, useEffect, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import './App.css'

const MAX_PAGES_TO_SCAN = 300
const CONSECUTIVE_MISSES_LIMIT = 12
const SUPPORTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
const BRAND_LOGO_PATH = 'logo.png'

const ImagePage = forwardRef(({ src, index }, ref) => (
  <div ref={ref} className="page">
    <img src={src} alt={`صفحة ${index}`} className="page-img" draggable={false} />
  </div>
))
ImagePage.displayName = 'ImagePage'

const CoverPage = forwardRef(({ logoUrl }, ref) => (
  <div ref={ref} className="page cover-page">
    <div className="cover-card">
      <img
        src={logoUrl}
        alt="شعار الأمين للبرجولات"
        className="cover-logo"
        draggable={false}
        onError={(event) => {
          event.currentTarget.style.display = 'none'
          const fallback = event.currentTarget.nextElementSibling
          if (fallback) fallback.style.display = 'grid'
        }}
      />
      <div className="cover-logo-fallback" aria-hidden>
        AP
      </div>
      <p className="cover-kicker">كتالوج أعمالنا</p>
      <h2>الأمين للبرجولات</h2>
      <p>والأعمال الخشبية</p>
    </div>
  </div>
))
CoverPage.displayName = 'CoverPage'

function buildPageUrl(pageNumber, extension) {
  return `${import.meta.env.BASE_URL}pages/page${pageNumber}.${extension}`
}

function imageExists(url) {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve(true)
    image.onerror = () => resolve(false)
    image.src = `${url}?v=${Date.now()}`
  })
}

async function findExistingPageUrl(pageNumber) {
  for (const extension of SUPPORTED_EXTENSIONS) {
    const url = buildPageUrl(pageNumber, extension)
    const exists = await imageExists(url)
    if (exists) return url
  }
  return null
}

function App() {
  const bookRef = useRef(null)
  const logoUrl = `${import.meta.env.BASE_URL}${BRAND_LOGO_PATH}`

  const [pages, setPages] = useState([])
  const [isLoadingPages, setIsLoadingPages] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [showHeaderLogoFallback, setShowHeaderLogoFallback] = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function loadPages() {
      const discovered = []
      let misses = 0

      for (let i = 1; i <= MAX_PAGES_TO_SCAN && misses < CONSECUTIVE_MISSES_LIMIT; i += 1) {
        const foundUrl = await findExistingPageUrl(i)
        if (foundUrl) {
          discovered.push(foundUrl)
          misses = 0
        } else {
          misses += 1
        }
      }

      if (!isCancelled) {
        setPages(discovered)
        setCurrentPage(0)
        setIsLoadingPages(false)
      }
    }

    loadPages()

    return () => {
      isCancelled = true
    }
  }, [])

  const totalPages = pages.length + 1
  const hasInnerPages = pages.length > 0
  const lastPage = totalPages - 1
  const progress = totalPages > 0 ? Math.round(((currentPage + 1) / totalPages) * 100) : 0

  const pageLabel = isLoadingPages
    ? 'جاري تحميل الصفحات...'
    : currentPage === 0
      ? `الغلاف 1 / ${totalPages}`
      : `صفحة ${currentPage + 1} / ${totalPages}`

  const goNext = () => bookRef.current?.pageFlip()?.flipNext()
  const goPrev = () => bookRef.current?.pageFlip()?.flipPrev()
  const goFirst = () => bookRef.current?.pageFlip()?.flip(0)
  const goLast = () => bookRef.current?.pageFlip()?.flip(lastPage)

  const helpText = hasInnerPages
    ? 'الغلاف ثابت تلقائيًا. لإضافة صفحات جديدة: ارفع ملفات page1.jpg, page2.jpg ... داخل public/pages.'
    : 'الغلاف ظاهر. أضف صفحات الكتالوج داخل public/pages بأسماء page1.jpg, page2.jpg ...'

  return (
    <main className="app" dir="rtl">
      <header className="topbar">
        <div className="brand brand-with-logo">
          <div className="brand-logo-wrap">
            {!showHeaderLogoFallback ? (
              <img
                src={logoUrl}
                alt="شعار الأمين للبرجولات"
                className="brand-logo"
                onError={() => setShowHeaderLogoFallback(true)}
              />
            ) : (
              <div className="brand-logo-fallback" aria-hidden>AP</div>
            )}
          </div>
          <div>
            <p className="brand-sub">كتالوج أعمالنا</p>
            <h1>الأمين للبرجولات</h1>
          </div>
        </div>

        <div className="meta">
          <span>{pageLabel}</span>
          <span className="meta-pct">{progress}%</span>
        </div>
      </header>

      <div className="progress-track" aria-hidden>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <section className="book-shell">
        <HTMLFlipBook
          ref={bookRef}
          width={420}
          height={595}
          size="stretch"
          minWidth={260}
          maxWidth={520}
          minHeight={360}
          maxHeight={740}
          maxShadowOpacity={0.5}
          showCover
          mobileScrollSupport
          flippingTime={700}
          onFlip={(e) => setCurrentPage(e.data)}
          className="flipbook"
          drawShadow
          usePortrait={false}
          startZIndex={10}
          autoSize
          showPageCorners
          swipeDistance={30}
        >
          <CoverPage logoUrl={logoUrl} />
          {pages.map((src, i) => (
            <ImagePage key={src} src={src} index={i + 1} />
          ))}
        </HTMLFlipBook>
      </section>

      <nav className="controls">
        <button onClick={goLast} disabled={currentPage === lastPage}>الأخير ⏭</button>
        <button onClick={goNext} disabled={currentPage === lastPage}>التالي ▶</button>
        <button onClick={goPrev} disabled={currentPage === 0}>◀ السابق</button>
        <button onClick={goFirst} disabled={currentPage === 0}>⏮ الأول</button>
      </nav>

      <footer className="hint">{helpText}</footer>
    </main>
  )
}

export default App
