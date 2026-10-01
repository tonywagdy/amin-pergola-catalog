import { useState, useMemo } from 'react'
import { Search, Eye, BookOpen, Layers } from 'lucide-react'

export default function GalleryView({ pages, onSelectPage, onOpenLightbox }) {
  const [selectedCategory, setSelectedCategory] = useState('الكل')
  const [searchQuery, setSearchQuery] = useState('')

  // استخراج قائمة التصنيفات المتاحة
  const categories = useMemo(() => {
    const set = new Set(['الكل'])
    pages.forEach((p) => {
      if (p.category) set.add(p.category)
    })
    return Array.from(set)
  }, [pages])

  // تصفية الصور
  const filteredPages = useMemo(() => {
    return pages.filter((item, index) => {
      const pageNum = index + 1
      const matchesCategory = selectedCategory === 'الكل' || item.category === selectedCategory
      const query = searchQuery.trim().toLowerCase()
      if (!query) return matchesCategory

      const matchesText =
        (item.title && item.title.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query)) ||
        pageNum.toString().includes(query)

      return matchesCategory && matchesText
    })
  }, [pages, selectedCategory, searchQuery])

  return (
    <div className="gallery-section" dir="rtl">
      {/* شريط الفلاتر والبحث */}
      <div className="gallery-filter-bar">
        <div className="gallery-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="ابحث برقم الصفحة أو اسم التصميم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              ×
            </button>
          )}
        </div>

        <div className="gallery-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
              {cat === 'الكل' ? ` (${pages.length})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* عدد النتائج */}
      <div className="gallery-meta-row">
        <span>
          عرض <strong>{filteredPages.length}</strong> من أصل {pages.length} تصميم متوفر
        </span>
        <span className="gallery-hint">انقر على أي صورة لتكبيرها أو فتحها في الكتالوج</span>
      </div>

      {/* شبكة الصور */}
      {filteredPages.length === 0 ? (
        <div className="gallery-empty">
          <Layers size={48} />
          <p>لا توجد تصاميم مطابقة لبحثك في هذا القسم</p>
          <button className="reset-filter-btn" onClick={() => { setSelectedCategory('الكل'); setSearchQuery(''); }}>
            إظهار كافة التصاميم
          </button>
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredPages.map((page) => {
            const actualIndex = pages.findIndex((p) => p.id === page.id)
            const pageNum = actualIndex + 1

            return (
              <div key={page.id} className="gallery-card">
                <div className="gallery-img-container" onClick={() => onOpenLightbox(page, actualIndex)}>
                  <img
                    src={page.thumbnail || page.src}
                    alt={page.title || `صفحة ${pageNum}`}
                    className="gallery-thumb"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="gallery-overlay">
                    <span className="gallery-overlay-btn" title="تكبير ومعاينة">
                      <Eye size={20} />
                    </span>
                  </div>
                  <span className="gallery-page-badge">صفحة {pageNum}</span>
                </div>

                <div className="gallery-card-info">
                  <div className="card-texts">
                    <h4 className="card-title">{page.title || `تصميم #${pageNum}`}</h4>
                    <span className="card-category">{page.category || 'أعمال خشبية'}</span>
                  </div>
                  <div className="card-btns">
                    <button
                      className="card-book-btn"
                      onClick={() => onSelectPage(actualIndex + 1)}
                      title="فتح هذه الصفحة في الكتالوج التفاعلي"
                    >
                      <BookOpen size={15} />
                      <span>تصفح</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
