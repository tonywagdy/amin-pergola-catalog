import { useState, useEffect } from 'react'
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronRight, ChevronLeft, MessageCircle, Download } from 'lucide-react'
import { DEFAULT_WHATSAPP } from '../utils/storage'

export default function LightboxModal({ image, pageNumber, totalPages, onClose, onNext, onPrev, whatsappNumber }) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && onNext) onNext()
      if (e.key === 'ArrowLeft' && onPrev) onPrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onNext, onPrev])

  if (!image) return null

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.35, 3))
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.35, 0.75))
  const handleReset = () => setScale(1)

  const shareWhatsapp = () => {
    const text = encodeURIComponent(
      `مرحباً الأمين للبرجولات، أود الاستفسار عن تفاصيل وسعر هذا التصميم من الكتالوج (صفحة ${pageNumber}: ${image.title || 'تصميم برجولة'}).`
    )
    const phone = (whatsappNumber || DEFAULT_WHATSAPP).replace(/[^0-9]/g, '')
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank')
  }

  return (
    <div className="lightbox-overlay" onClick={onClose} dir="rtl">
      <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
        {/* شريط التحكم العلوي */}
        <div className="lightbox-header">
          <div className="lightbox-title-wrap">
            <span className="lightbox-badge">صفحة {pageNumber} من {totalPages}</span>
            <h3 className="lightbox-title">{image.title || `تصميم #${pageNumber}`}</h3>
            {image.category && <span className="lightbox-cat">{image.category}</span>}
          </div>

          <div className="lightbox-actions">
            <button className="lb-btn" onClick={handleZoomIn} title="تكبير">
              <ZoomIn size={18} />
            </button>
            <button className="lb-btn" onClick={handleZoomOut} title="تصغير">
              <ZoomOut size={18} />
            </button>
            <button className="lb-btn" onClick={handleReset} title="إعادة ضبط الحجم">
              <RotateCcw size={18} />
            </button>
            <button className="lb-btn lb-whatsapp" onClick={shareWhatsapp} title="استفسار عبر واتساب">
              <MessageCircle size={18} />
              <span>طلب تسعير</span>
            </button>
            <a
              href={image.src}
              download={`amin-pergola-page-${pageNumber}.jpg`}
              className="lb-btn"
              title="تحميل الصورة"
              target="_blank"
              rel="noreferrer"
            >
              <Download size={18} />
            </a>
            <button className="lb-btn lb-close" onClick={onClose} title="إغلاق">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* مساحة عرض الصورة */}
        <div className="lightbox-body">
          {onPrev && (
            <button className="lb-nav-btn lb-prev" onClick={onPrev} title="السابق">
              <ChevronRight size={30} />
            </button>
          )}

          <div className="lightbox-img-wrapper">
            <img
              src={image.src}
              alt={image.title || 'تصميم برجولة'}
              className="lightbox-img"
              style={{ transform: `scale(${scale})` }}
              draggable={false}
            />
          </div>

          {onNext && (
            <button className="lb-nav-btn lb-next" onClick={onNext} title="التالي">
              <ChevronLeft size={30} />
            </button>
          )}
        </div>

        {/* شريط سفلي توضيحي */}
        <div className="lightbox-footer">
          <span>الأمين للبرجولات والأعمال الخشبية • انقر مع السحب لتكبير وتفحص أدق التفاصيل</span>
        </div>
      </div>
    </div>
  )
}
