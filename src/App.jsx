import { forwardRef, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import './App.css'

const pages = [
  {
    title: 'Digital Stories',
    subtitle: 'Issue 01',
    text: 'Flip-ready portfolio inspired by modern interactive magazines.',
    tone: 'cover',
  },
  {
    title: 'Editorial',
    subtitle: 'Opening Note',
    text: 'Build immersive experiences with smooth page turns and tactile depth.',
    tone: 'a',
  },
  {
    title: 'Featured Work',
    subtitle: 'Showcase',
    text: 'Mix typography, photography, and motion for a premium reading flow.',
    tone: 'b',
  },
  {
    title: 'About Project',
    subtitle: 'Concept',
    text: 'This template is ideal for catalogs, lookbooks, magazines, and menus.',
    tone: 'c',
  },
  {
    title: 'Visual Direction',
    subtitle: 'Design System',
    text: 'Strong contrast, layered paper texture, and editorial spacing.',
    tone: 'd',
  },
  {
    title: 'Interactive Feel',
    subtitle: 'Motion',
    text: 'Drag a page corner or click the controls to move like a real book.',
    tone: 'e',
  },
  {
    title: 'Brand Pages',
    subtitle: 'Customization',
    text: 'Swap copy, colors, and visuals to match your brand in minutes.',
    tone: 'f',
  },
  {
    title: 'Contact',
    subtitle: 'Next Step',
    text: 'Ready to publish. Add your own pages and deploy as a web experience.',
    tone: 'g',
  },
]

const FlipPage = forwardRef(({ page, index, total }, ref) => {
  return (
    <article ref={ref} className={`page tone-${page.tone}`}>
      <div className="page-inner">
        <p className="page-subtitle">{page.subtitle}</p>
        <h2>{page.title}</h2>
        <p className="page-text">{page.text}</p>
        <div className="page-footer">
          <span>www.yourbrand.com</span>
          <span>
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </div>
      </div>
    </article>
  )
})

FlipPage.displayName = 'FlipPage'

function App() {
  const bookRef = useRef(null)
  const [currentPage, setCurrentPage] = useState(0)
  const lastPage = pages.length - 1

  const progress = useMemo(() => {
    if (lastPage <= 0) return 0
    return Math.round((currentPage / lastPage) * 100)
  }, [currentPage, lastPage])

  const goNext = () => bookRef.current?.pageFlip()?.flipNext()
  const goPrev = () => bookRef.current?.pageFlip()?.flipPrev()
  const goFirst = () => bookRef.current?.pageFlip()?.flip(0)
  const goLast = () => bookRef.current?.pageFlip()?.flip(lastPage)

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <p className="kicker">Flipbook Studio</p>
          <h1>Interactive Magazine</h1>
        </div>
        <div className="meta">
          <span>Page {currentPage + 1}</span>
          <span>{progress}%</span>
        </div>
      </header>

      <section className="book-shell">
        <div className="progress-track" aria-hidden>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <HTMLFlipBook
          ref={bookRef}
          width={520}
          height={700}
          size="stretch"
          minWidth={280}
          maxWidth={900}
          minHeight={360}
          maxHeight={1100}
          maxShadowOpacity={0.45}
          showCover
          mobileScrollSupport
          flippingTime={700}
          onFlip={(e) => setCurrentPage(e.data)}
          className="flipbook"
          startPage={0}
          drawShadow
          usePortrait
          startZIndex={0}
          autoSize
          clickEventForward
          useMouseEvents
          swipeDistance={30}
          showPageCorners
          disableFlipByClick={false}
        >
          {pages.map((page, index) => (
            <FlipPage key={page.title} page={page} index={index} total={pages.length} />
          ))}
        </HTMLFlipBook>
      </section>

      <nav className="controls">
        <button onClick={goFirst} disabled={currentPage === 0}>
          First
        </button>
        <button onClick={goPrev} disabled={currentPage === 0}>
          Prev
        </button>
        <button onClick={goNext} disabled={currentPage === lastPage}>
          Next
        </button>
        <button onClick={goLast} disabled={currentPage === lastPage}>
          Last
        </button>
      </nav>

      <footer className="hint">
        اسحب من الزاوية أو استخدم الأزرار للتقليب
      </footer>
    </main>
  )
}

export default App
