import { useState } from 'react'
import { BookOpen, Grid, Phone } from 'lucide-react'
import { createWhatsAppLink } from '../utils/whatsapp'

export default function Header({
  viewMode,
  onViewModeChange,
  totalPhotos,
  whatsappNumber,
  logoUrl,
}) {
  const [logoError, setLogoError] = useState(false)
  const waUrl = createWhatsAppLink(
    whatsappNumber,
    'السلام عليكم، اطلعت على كتالوج الأمين للبرجولات وأود الاستفسار عن تنفيذ وتصميم برجولة.'
  )

  return (
    <header className="main-header" dir="rtl">
      {/* Brand Side */}
      <div className="header-brand">
        <div className="brand-avatar-box">
          {!logoError ? (
            <img
              src={logoUrl}
              alt="شعار الأمين للبرجولات"
              className="brand-avatar-img"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="brand-avatar-fallback">الأمين</div>
          )}
        </div>

        <div className="brand-texts">
          <span className="brand-tag">كتالوج الأعمال الرسمية</span>
          <h1 className="brand-title">الأمين للبرجولات</h1>
          <p className="brand-desc">والأعمال الخشبية الفاخرة</p>
        </div>
      </div>

      {/* View Mode Switcher (Book vs Gallery) */}
      <div className="view-mode-tabs">
        <button
          className={`view-tab ${viewMode === 'book' ? 'active' : ''}`}
          onClick={() => onViewModeChange('book')}
          title="عرض الكتالوج ثلاثي الأبعاد مع تقليب الصفحات"
        >
          <BookOpen size={17} />
          <span>كتالوج التقليب</span>
        </button>

        <button
          className={`view-tab ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => onViewModeChange('grid')}
          title="عرض جميع الصور في شبكة مع فلاتر البحث"
        >
          <Grid size={17} />
          <span>المعرض السريع ({totalPhotos})</span>
        </button>
      </div>

      {/* Header Actions - 100% Client-Facing (No share button) */}
      <div className="header-actions">
        {/* WhatsApp Direct Contact Button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="action-pill whatsapp-pill"
          title="تواصل مباشر عبر واتساب (01017919385)"
        >
          <Phone size={15} />
          <span className="pill-text">تواصل واتساب</span>
        </a>
      </div>
    </header>
  )
}
