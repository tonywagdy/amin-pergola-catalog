import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import FlipCatalog from './components/FlipCatalog'
import GalleryView from './components/GalleryView'
import DashboardModal from './components/Dashboard/DashboardModal'
import AdminAuthModal from './components/Dashboard/AdminAuthModal'
import LightboxModal from './components/LightboxModal'
import {
  getCatalog,
  saveCatalog,
  resetCatalogToDefault,
  getSettings,
  saveSettings,
  DEFAULT_WHATSAPP,
} from './utils/storage'
import { APP_BASE } from './data/defaultCatalog'
import { Lock } from 'lucide-react'
import './App.css'

function App() {
  const [pages, setPages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [viewMode, setViewMode] = useState('book') // 'book' or 'grid'
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('amin_admin_auth') === 'true'
    }
    return false
  })

  const [isDashboardOpen, setIsDashboardOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.has('admin') && localStorage.getItem('amin_admin_auth') === 'true'
    }
    return false
  })

  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.has('admin') && localStorage.getItem('amin_admin_auth') !== 'true'
    }
    return false
  })

  const [lightboxData, setLightboxData] = useState(null) // { page, index }
  const [settings, setSettings] = useState(getSettings())

  const logoUrl = `${APP_BASE}logo.png`

  // تحميل الكتالوج فوراً عند بدء التطبيق
  useEffect(() => {
    let isCancelled = false

    async function loadData() {
      try {
        const storedPages = await getCatalog()
        if (!isCancelled) {
          setPages(storedPages)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Failed to load catalog:', err)
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadData()
    return () => {
      isCancelled = true
    }
  }, [])

  // حفظ التعديلات على الصفحات في قاعدة البيانات
  const handleUpdatePages = useCallback(async (newPages) => {
    setPages(newPages)
    await saveCatalog(newPages)
  }, [])

  // إعادة ضبط الكتالوج الأصلي
  const handleResetCatalog = useCallback(async () => {
    const defaultPages = await resetCatalogToDefault()
    setPages(defaultPages)
    setCurrentPage(0)
  }, [])

  // تحديث الإعدادات
  const handleUpdateSettings = useCallback((newSettings) => {
    setSettings(newSettings)
    saveSettings(newSettings)
  }, [])

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

  // فتح بوابة الإدارة
  const handleOpenAdminPortal = () => {
    if (isAdminLoggedIn) {
      setIsDashboardOpen(true)
    } else {
      setIsAdminAuthOpen(true)
    }
  }

  // نجاح تسجيل دخول المالك المعتمد (twagdy067@gmail.com)
  const handleAdminAuthenticated = () => {
    setIsAdminLoggedIn(true)
    localStorage.setItem('amin_admin_auth', 'true')
    setIsAdminAuthOpen(false)
    setIsDashboardOpen(true)
  }

  // تسجيل الخروج وقفل لوحة التحكم
  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false)
    localStorage.removeItem('amin_admin_auth')
    setIsDashboardOpen(false)
    // تنظيف معلمات الرابط
    const url = new URL(window.location)
    url.searchParams.delete('admin')
    window.history.replaceState({}, '', url)
  }

  return (
    <main className="app-container" dir="rtl">
      {/* الشريط العلوي العام المخصص بالكامل للعميل */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalPhotos={pages.length}
        whatsappNumber={settings?.whatsappNumber || DEFAULT_WHATSAPP}
        logoUrl={logoUrl}
      />

      {/* محتوى الكتالوج */}
      {isLoading ? (
        <div className="empty-state">
          <span className="spinner" />
          <p>جاري تجهيز الكتالوج السريع للأمين للبرجولات...</p>
        </div>
      ) : (
        <>
          {viewMode === 'book' ? (
            <FlipCatalog
              pages={pages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              logoUrl={logoUrl}
            />
          ) : (
            <GalleryView
              pages={pages}
              onSelectPage={handleSelectPageFromGallery}
              onOpenLightbox={handleOpenLightbox}
            />
          )}
        </>
      )}

      {/* بوابة تحقق المالك (twagdy067@gmail.com فقط وكلمة المرور) */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onAuthenticated={handleAdminAuthenticated}
        currentPassword={settings?.adminPassword}
      />

      {/* لوحة التحكم المنفصلة بالكامل */}
      <DashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        pages={pages}
        onUpdatePages={handleUpdatePages}
        onResetCatalog={handleResetCatalog}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onLogout={handleAdminLogout}
      />

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
          whatsappNumber={settings?.whatsappNumber || DEFAULT_WHATSAPP}
        />
      )}

      {/* التذييل العام للعملاء مع مدخل الإدارة السري للمالك */}
      <footer className="app-footer">
        <p>© 2026 الأمين للبرجولات والأعمال الخشبية الفاخرة — جميع الحقوق محفوظة</p>
        <div className="footer-bottom-row">
          <span className="credit" dir="ltr">
            Crafted & Developed with Excellence by <strong className="credit-author">Tony Wagdy</strong>
          </span>
          <button
            className="admin-secret-portal"
            onClick={handleOpenAdminPortal}
            title="بوابة إدارة المالك المصرح له"
          >
            <Lock size={12} />
            <span>بوابة المالك</span>
          </button>
        </div>
      </footer>
    </main>
  )
}

export default App
