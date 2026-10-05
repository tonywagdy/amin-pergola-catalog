import { useState, useCallback } from 'react'
import Header from './components/Header'
import FlipCatalog from './components/FlipCatalog'
import GalleryView from './components/GalleryView'
import LightboxModal from './components/LightboxModal'
import ErrorBoundary from './components/ErrorBoundary'
import { INITIAL_PAGES, APP_BASE } from './data/defaultCatalog'
import { DEFAULT_WHATSAPP } from './utils/storage'
import './App.css'

function App() {
  const [pages] = useState(INITIAL_PAGES)
  const [currentPage, setCurrentPage] = useState(0)
  const [viewMode, setViewMode] = useState('book') // 'book' or 'grid'
  const [lightboxData, setLightboxData] = useState(null) // { page, index }

  const logoUrl = `${APP_BASE}logo.png`

  // فتح صفحة من المعرض داخل الكتالوج التفاعلي
  const handleSelectPageFromGallery = useCallback((targetPageNum) => {
    setCurrentPage(targetPageNum)
    setViewMode('book')
  }, [])

  // فتح نافذة المعاينة المكبرة (Lightbox)
  const handleOpenLightbox = useCallback((page, index) => {
    setLightboxData({ page, index })
  }, [])

  // التنقل داخل Lightbox
  const handleNextLightbox = useCallback(() => {
    if (!lightboxData) return
    const nextIdx = (lightboxData.index + 1) % pages.length
    setLightboxData({ page: pages[nextIdx], index: nextIdx })
  }, [lightboxData, pages])

  const handlePrevLightbox = useCallback(() => {
    if (!lightboxData) return
    const prevIdx = (lightboxData.index - 1 + pages.length) % pages.length
    setLightboxData({ page: pages[prevIdx], index: prevIdx })
  }, [lightboxData, pages])

  return (
    <main className="app-container" dir="rtl">
      {/* الشريط العلوي العام */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalPhotos={pages.length}
        whatsappNumber={DEFAULT_WHATSAPP}
        logoUrl={logoUrl}
      />

      {/* محتوى الكتالوج */}
      {viewMode === 'book' ? (
        <ErrorBoundary>
          <FlipCatalog
            pages={pages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            logoUrl={logoUrl}
          />
        </ErrorBoundary>
      ) : (
        <GalleryView
          pages={pages}
          onSelectPage={handleSelectPageFromGallery}
          onOpenLightbox={handleOpenLightbox}
        />
      )}

      {/* شاشة التكبير والمعاينة المكبرة Lightbox */}
      {lightboxData && (
        <LightboxModal
          key={lightboxData.page.id}
          image={lightboxData.page}
          pageNumber={lightboxData.index + 1}
          totalPages={pages.length}
          onClose={() => setLightboxData(null)}
          onNext={pages.length > 1 ? handleNextLightbox : null}
          onPrev={pages.length > 1 ? handlePrevLightbox : null}
          whatsappNumber={DEFAULT_WHATSAPP}
        />
      )}

      {/* التذييل العام للكتالوج */}
      <footer className="app-footer">
        <p>© 2026 الأمين للبرجولات والأعمال الخشبية الفاخرة — جميع الحقوق محفوظة</p>
        <div className="footer-bottom-row">
          <span className="credit" dir="ltr">
            Crafted & Developed with Excellence by <strong className="credit-author">Tony Wagdy</strong>
          </span>
        </div>
      </footer>
    </main>
  )
}

export default App
