import { forwardRef, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import './App.css'

const pages = [
  '/pages/page1.jpg',
  '/pages/page2.jpg',
  '/pages/page3.jpg',
  '/pages/page4.jpg',
  '/pages/page5.jpg',
  '/pages/page6.jpg',
  '/pages/page7.jpg',
  '/pages/page8.jpg',
  '/pages/page9.jpg',
  '/pages/page10.jpg',
]

const ImagePage = forwardRef(({ src, index }, ref) => (
  <div ref={ref} className="page">
    <img src={src} alt={`صفحة ${index + 1}`} className="page-img" draggable={false} />
  </div>
))
ImagePage.displayName = 'ImagePage'

function App() {
  const bookRef = useRef(null)
  const [currentPage, setCurrentPage] = useState(0)
  const lastPage = pages.length - 1
  const progress = Math.round(((currentPage + 1) / pages.length) * 100)

  const goNext  = () => bookRef.current?.pageFlip()?.flipNext()
  const goPrev  = () => bookRef.current?.pageFlip()?.flipPrev()
  const goFirst = () => bookRef.current?.pageFlip()?.flip(0)
  const goLast  = () => bookRef.current?.pageFlip()?.flip(lastPage)

  return (
    <main className="app" dir="rtl">
      {/* Header */}
      <header className="topbar">
        <div className="brand">
          <p className="brand-sub">كتالوج أعمالنا</p>
          <h1>الأمين للبرجولات</h1>
        </div>
        <div className="meta">
          <span>صفحة {currentPage + 1} / {pages.length}</span>
          <span className="meta-pct">{progress}%</span>
        </div>
      </header>

      {/* Progress */}
      <div className="progress-track" aria-hidden>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Book */}
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
            <ImagePage key={i} src={src} index={i} />
          ))}
        </HTMLFlipBook>
      </section>

      {/* Controls */}
      <nav className="controls">
        <button onClick={goLast}  disabled={currentPage === lastPage}>الأخير ⏭</button>
        <button onClick={goNext}  disabled={currentPage === lastPage}>التالي ▶</button>
        <button onClick={goPrev}  disabled={currentPage === 0}>◀ السابق</button>
        <button onClick={goFirst} disabled={currentPage === 0}>⏮ الأول</button>
      </nav>

      <footer className="hint">
        اسحب من زاوية الصفحة أو استخدم الأزرار للتقليب
      </footer>
    </main>
  )
}

export default App
