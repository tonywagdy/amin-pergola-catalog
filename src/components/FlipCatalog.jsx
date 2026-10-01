import { forwardRef, useEffect, useRef, useState, useCallback } from 'react'
import HTMLFlipBook from 'react-pageflip'
import {
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  Maximize2,
  Search,
  Sparkles,
  Layers,
} from 'lucide-react'

// صفحة الغلاف الأصلية مع الشعار الكبير وإضافات الضمان والتصميم
const CoverPage = forwardRef(({ logoUrl, totalPages }, ref) => (
  <div ref={ref} className="page cover-page">
    <div className="cover-card">
      <img
        src={logoUrl}
        alt="شعار الأمين للبرجولات"
        className="cover-logo"
        draggable={false}
      />

      <p className="cover-kicker">كتالوج أعمالنا</p>
      <h2>الأمين للبرجولات</h2>
      <p className="cover-sub">والأعمال الخشبية</p>

      {/* إضافات الضمان والتصميم */}
      <div className="cover-specs">
        <div className="spec-item">
          <strong>{totalPages - 1}</strong>
          <span>تصميم مميز</span>
        </div>
        <div className="spec-divider" />
        <div className="spec-item">
          <strong>100%</strong>
          <span>خشب طبيعي ومعالج</span>
        </div>
        <div className="spec-divider" />
        <div className="spec-item">
          <strong>ضمان</strong>
          <span>أعلى جودة تنفيذ</span>
        </div>
      </div>

      <div className="cover-hint">
        <span>👈 اسحب أو اضغط التالي لبدء التصفح</span>
      </div>
    </div>
  </div>
))
CoverPage.displayName = 'CoverPage'

// صفحة العمل مع التحميل الذكي والـ Skeleton
const ImagePage = forwardRef(({ page, pageNumber, isNearCurrent }, ref) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <div ref={ref} className="page content-page">
      <div className="page-inner">
        {/* Skeleton Shimmer أثناء التحميل */}
        {!isLoaded && !hasError && (
          <div className="page-skeleton">
            <div className="skeleton-wave" />
            <div className="skeleton-content">
              <span className="spinner" />
              <p>جاري تحميل التصميم #{pageNumber}...</p>
            </div>
          </div>
        )}

        {hasError ? (
          <div className="page-error">
            <Layers size={36} />
            <p>تعذر عرض الصورة</p>
            <span>{page?.title || `صفحة ${pageNumber}`}</span>
          </div>
        ) : (
          (isNearCurrent || isLoaded) && (
            <img
              src={page.src}
              alt={page.title || `صفحة ${pageNumber}`}
              className={`page-img ${isLoaded ? 'loaded' : 'loading'}`}
              loading={isNearCurrent ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
            />
          )
        )}

        {/* شريط معلومات الصفحة */}
        <div className="page-footer-strip">
          <span className="page-num-tag">{pageNumber}</span>
          <span className="page-title-tag">{page.title || `برجولة خشبية #${pageNumber}`}</span>
        </div>
      </div>
    </div>
  )
})
ImagePage.displayName = 'ImagePage'

export default function FlipCatalog({
  pages,
  currentPage,
  onPageChange,
  logoUrl,
}) {
  const bookRef = useRef(null)
  const [jumpPageInput, setJumpPageInput] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const totalPages = pages.length + 1 // +1 for cover
  const lastPage = totalPages - 1
  const progress = totalPages > 0 ? Math.round(((currentPage + 1) / totalPages) * 100) : 0

  const goNext = useCallback(() => {
    bookRef.current?.pageFlip()?.flipNext()
  }, [])

  const goPrev = useCallback(() => {
    bookRef.current?.pageFlip()?.flipPrev()
  }, [])

  const goFirst = useCallback(() => {
    bookRef.current?.pageFlip()?.flip(0)
  }, [])

  const goLast = useCallback(() => {
    bookRef.current?.pageFlip()?.flip(lastPage)
  }, [lastPage])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // In RTL: ArrowLeft goes next, ArrowRight goes prev
      if (e.key === 'ArrowLeft') goNext()
      if (e.key === 'ArrowRight') goPrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev])

  const handleJumpToPage = (e) => {
    e.preventDefault()
    const target = parseInt(jumpPageInput, 10)
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      bookRef.current?.pageFlip()?.flip(target - 1)
      setJumpPageInput('')
    }
  }

  const toggleFullscreen = () => {
    const elem = document.querySelector('.book-section')
    if (!document.fullscreenElement) {
      elem?.requestFullscreen?.().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.().catch(() => {})
      setIsFullscreen(false)
    }
  }

  // Pre-load images adjacent to current flip spread
  useEffect(() => {
    const preloadRange = [currentPage - 1, currentPage, currentPage + 1, currentPage + 2]
    preloadRange.forEach((idx) => {
      // page 0 is cover, pages start at index 0 for page 1
      const pageIndex = idx - 1
      if (pages[pageIndex]?.src) {
        const img = new Image()
        img.src = pages[pageIndex].src
      }
    })
  }, [currentPage, pages])

  return (
    <section className={`book-section ${isFullscreen ? 'fullscreen-mode' : ''}`} dir="rtl">
      {/* شريط الإحصاءات السريع وأدوات الكتالوج */}
      <div className="book-top-bar">
        <div className="book-page-indicator">
          {currentPage === 0 ? (
            <span className="current-badge">غلاف الكتالوج</span>
          ) : (
            <span className="current-badge">
              صفحة <strong>{currentPage}</strong> من {pages.length}
            </span>
          )}
          <span className="progress-badge">{progress}%</span>
        </div>

        <div className="book-quick-tools">
          <form onSubmit={handleJumpToPage} className="jump-form">
            <input
              type="number"
              min="1"
              max={totalPages}
              placeholder="رقم الصفحة..."
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
            />
            <button type="submit" title="انتقال">
              انتقال
            </button>
          </form>

          <button
            className="tool-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'خروج من ملء الشاشة' : 'ملء الشاشة'}
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* كتاب التقليب */}
      <div className="book-shell">
        <HTMLFlipBook
          ref={bookRef}
          width={450}
          height={630}
          size="stretch"
          minWidth={280}
          maxWidth={560}
          minHeight={380}
          maxHeight={780}
          maxShadowOpacity={0.4}
          mobileScrollSupport
          flippingTime={650}
          onFlip={(e) => onPageChange(e.data)}
          className="flipbook"
          drawShadow
          usePortrait
          startZIndex={10}
          autoSize
          showPageCorners
          swipeDistance={25}
        >
          {/* الغلاف */}
          <CoverPage
            logoUrl={logoUrl}
            totalPages={totalPages}
          />

          {/* الصفحات الفعلية */}
          {pages.map((page, index) => {
            const pageNum = index + 1
            // Check if page is within adjacent range for prioritized loading
            const isNearCurrent = Math.abs(currentPage - pageNum) <= 4

            return (
              <ImagePage
                key={page.id}
                page={page}
                pageNumber={pageNum}
                isNearCurrent={isNearCurrent}
              />
            )
          })}
        </HTMLFlipBook>
      </div>

      {/* شريط أزرار التنقل الرئيسية */}
      <nav className="controls-bar" aria-label="أزرار تقليب الكتالوج">
        <button
          className="ctrl-btn ctrl-first"
          onClick={goFirst}
          disabled={currentPage === 0}
          title="الصفحة الأولى (الغلاف)"
        >
          <ChevronsRight size={18} />
          <span className="btn-label">الغلاف</span>
        </button>

        <button
          className="ctrl-btn ctrl-prev"
          onClick={goPrev}
          disabled={currentPage === 0}
          title="الصفحة السابقة"
        >
          <ChevronRight size={20} />
          <span className="btn-label">السابق</span>
        </button>

        <div className="ctrl-center-display">
          <span>{currentPage === 0 ? 'الغلاف' : `${currentPage} / ${pages.length}`}</span>
        </div>

        <button
          className="ctrl-btn ctrl-next"
          onClick={goNext}
          disabled={currentPage === lastPage}
          title="الصفحة التالية"
        >
          <span className="btn-label">التالي</span>
          <ChevronLeft size={20} />
        </button>

        <button
          className="ctrl-btn ctrl-last"
          onClick={goLast}
          disabled={currentPage === lastPage}
          title="الصفحة الأخيرة"
        >
          <span className="btn-label">الأخير</span>
          <ChevronsLeft size={18} />
        </button>
      </nav>

      {/* تعليمات وتلميحات التصفح */}
      <div className="book-tips">
        <span>💡 نصيحة: يمكنك سحب أطراف الصفحات بالماوس أو اللمس، أو النقر على أي صفحة لتكبيرها وفحص أدق التفاصيل</span>
      </div>
    </section>
  )
}
