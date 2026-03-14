import { forwardRef, useEffect, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import './App.css'

const MAX_PAGES_TO_SCAN = 300
const CONSECUTIVE_MISSES_LIMIT = 12
const SUPPORTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']

const ImagePage = forwardRef(({ src, index }, ref) => (
  <div ref={ref} className="page">
    <img src={src} alt={`صفحة ${index + 1}`} className="page-img" draggable={false} />
  </div>
))
ImagePage.displayName = 'ImagePage'

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
  const [pages, setPages] = useState([])
  const [isLoadingPages, setIsLoadingPages] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)

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

  const hasPages = pages.length > 0
  const lastPage = hasPages ? pages.length - 1 : 0
  const progress = hasPages ? Math.round(((currentPage + 1) / pages.length) * 100) : 0

  const pageLabel = isLoadingPages
    ? 'جاري تحميل الصفحات...'
    : hasPages
      ? `صفحة ${currentPage + 1} / ${pages.length}`
      : 'لا توجد صفحات حالياً'

  const goNext = () => bookRef.current?.pageFlip()?.flipNext()
  const goPrev = () => bookRef.current?.pageFlip()?.flipPrev()
  const goFirst = () => bookRef.current?.pageFlip()?.flip(0)
  const goLast = () => bookRef.current?.pageFlip()?.flip(lastPage)

  const helpText = hasPages
    ? 'لإضافة صور جديدة: ارفع ملف باسم page12.jpg (أو png/webp) داخل public/pages وسيظهر تلقائياً.'
    : 'أضف صور الصفحات داخل public/pages بأسماء page1.jpg, page2.jpg ...'

  return (
    <main className="app" dir="rtl">
      <header className="topbar">
        <div className="brand">
          <p className="brand-sub">كتالوج أعمالنا</p>
          <h1>الأمين للبرجولات</h1>
        </div>
        <div className="meta">
          <span>{pageLabel}</span>
          <span className="meta-pct">{progress}%</span>
        </div>
      </header>

      <div className="progress-track" aria-hidden>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {hasPages ? (
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
            {pages.map((src, i) => (
              <ImagePage key={src} src={src} index={i} />
            ))}
          </HTMLFlipBook>
        </section>
      ) : (
        <section className="book-shell empty-state">
          <p>{isLoadingPages ? 'جاري تجهيز الكتالوج...' : 'لا يوجد أي صور داخل الكتالوج حالياً.'}</p>
        </section>
      )}

      <nav className="controls">
        <button onClick={goLast} disabled={!hasPages || currentPage === lastPage}>الأخير ⏭</button>
        <button onClick={goNext} disabled={!hasPages || currentPage === lastPage}>التالي ▶</button>
        <button onClick={goPrev} disabled={!hasPages || currentPage === 0}>◀ السابق</button>
        <button onClick={goFirst} disabled={!hasPages || currentPage === 0}>⏮ الأول</button>
      </nav>

      <footer className="hint">{helpText}</footer>
    </main>
  )
}

export default App
