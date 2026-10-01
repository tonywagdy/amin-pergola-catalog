import { useState } from 'react'
import {
  X,
  Upload,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit2,
  RefreshCw,
  Download,
  Share2,
  Check,
  AlertCircle,
  Copy,
  Layers,
  Search,
  Filter,
  CheckSquare,
  Square,
  Phone,
  Link,
  Eye,
  SlidersHorizontal,
  LogOut,
  ShieldCheck,
  KeyRound,
} from 'lucide-react'
import { compressImage } from '../../utils/imageCompressor'
import { DEFAULT_CATEGORIES } from '../../data/defaultCatalog'
import { ADMIN_EMAIL, DEFAULT_WHATSAPP, DEFAULT_ADMIN_PASSWORD } from '../../utils/storage'
import { formatWhatsAppPhone, OFFICIAL_WHATSAPP } from '../../utils/whatsapp'

export default function DashboardModal({
  isOpen,
  onClose,
  pages,
  onUpdatePages,
  onResetCatalog,
  settings,
  onUpdateSettings,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('manage') // 'manage', 'add', 'backup', 'settings'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('الكل')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [notification, setNotification] = useState(null)

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  // Add form state
  const [uploadFiles, setUploadFiles] = useState([])
  const [uploadCategory, setUploadCategory] = useState('برجولات حدائق')
  const [customCategory, setCustomCategory] = useState('')
  const [uploadTitlePrefix, setUploadTitlePrefix] = useState('')
  const [uploadPosition, setUploadPosition] = useState('end') // 'start', 'end', 'after'
  const [afterPageNum, setAfterPageNum] = useState(1)
  const [urlInput, setUrlInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processLogs, setProcessLogs] = useState([])

  // Edit single image state
  const [editingItem, setEditingItem] = useState(null)
  const [moveDialogItem, setMoveDialogItem] = useState(null)
  const [targetMovePosition, setTargetMovePosition] = useState(1)

  // WhatsApp & settings state
  const [tempWhatsapp, setTempWhatsapp] = useState(settings?.whatsappNumber || DEFAULT_WHATSAPP)
  const [tempPassword, setTempPassword] = useState(settings?.adminPassword || DEFAULT_ADMIN_PASSWORD)

  // Notification helper
  const showToast = (text, type = 'success') => {
    setNotification({ text, type })
    setTimeout(() => setNotification(null), 3500)
  }

  if (!isOpen) return null

  // Filtered pages for manage view
  const filteredPages = pages.filter((item, idx) => {
    const pageNum = idx + 1
    const matchesCat = selectedCategory === 'الكل' || item.category === selectedCategory
    const q = searchQuery.trim().toLowerCase()
    if (!q) return matchesCat
    const matchesText =
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      pageNum.toString().includes(q)
    return matchesCat && matchesText
  })

  // Reordering handlers
  const handleMoveUp = (index) => {
    if (index <= 0) return
    const newPages = [...pages]
    const temp = newPages[index]
    newPages[index] = newPages[index - 1]
    newPages[index - 1] = temp
    onUpdatePages(newPages)
    showToast(`تم تقديم الصورة إلى الصفحة #${index}`)
  }

  const handleMoveDown = (index) => {
    if (index >= pages.length - 1) return
    const newPages = [...pages]
    const temp = newPages[index]
    newPages[index] = newPages[index + 1]
    newPages[index + 1] = temp
    onUpdatePages(newPages)
    showToast(`تم تأخير الصورة إلى الصفحة #${index + 2}`)
  }

  const handleMoveToPosition = (fromIndex, toPageNumber) => {
    const targetIdx = Math.max(0, Math.min(pages.length - 1, toPageNumber - 1))
    if (fromIndex === targetIdx) return
    const newPages = [...pages]
    const [movedItem] = newPages.splice(fromIndex, 1)
    newPages.splice(targetIdx, 0, movedItem)
    onUpdatePages(newPages)
    setMoveDialogItem(null)
    showToast(`تم نقل الصورة بنجاح إلى الصفحة #${targetIdx + 1}`)
  }

  // Drag and Drop
  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDrop = (e, targetIndex) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newPages = [...pages]
    const [item] = newPages.splice(draggedIndex, 1)
    newPages.splice(targetIndex, 0, item)
    onUpdatePages(newPages)
    setDraggedIndex(null)
    setDragOverIndex(null)
    showToast(`تم تغيير ترتيب الصورة إلى الصفحة #${targetIndex + 1}`)
  }

  // Delete single item
  const handleDelete = (id, title) => {
    if (window.confirm(`هل أنت متأكد من حذف هذه الصورة (${title || 'تصميم'}) من الكتالوج؟`)) {
      const newPages = pages.filter((p) => p.id !== id)
      onUpdatePages(newPages)
      showToast('تم حذف الصورة من الكتالوج بنجاح')
    }
  }

  // Batch delete
  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return
    if (window.confirm(`هل أنت متأكد من حذف ${selectedIds.size} صور محددة نهائياً من الكتالوج؟`)) {
      const newPages = pages.filter((p) => !selectedIds.has(p.id))
      onUpdatePages(newPages)
      setSelectedIds(new Set())
      showToast(`تم حذف ${selectedIds.size} صور بنجاح`)
    }
  }

  // Toggle selection
  const toggleSelect = (id) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const selectAll = () => {
    if (selectedIds.size === filteredPages.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredPages.map((p) => p.id)))
    }
  }

  // Add Files handler with compression
  const handleFilesChosen = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setUploadFiles((prev) => [...prev, ...files])
    }
  }

  const handleProcessAndAdd = async () => {
    if (uploadFiles.length === 0 && !urlInput.trim()) {
      showToast('يرجى اختيار صور من جهازك أو وضع رابط صورة', 'error')
      return
    }

    setIsProcessing(true)
    setProcessLogs([])
    const logs = []
    const newItems = []
    const finalCategory = customCategory.trim() || uploadCategory

    // 1. Process files
    for (let i = 0; i < uploadFiles.length; i++) {
      const file = uploadFiles[i]
      logs.push(`جاري ضغط وتحسين الصورة ${i + 1} من ${uploadFiles.length}: (${file.name})...`)
      setProcessLogs([...logs])

      try {
        const compressed = await compressImage(file, 1500, 0.84)
        const id = `custom-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 6)}`
        const title = uploadTitlePrefix.trim()
          ? `${uploadTitlePrefix} #${pages.length + newItems.length + 1}`
          : file.name.replace(/\.[^/.]+$/, '').slice(0, 30)

        newItems.push({
          id,
          title,
          category: finalCategory,
          src: compressed.dataUrl,
          thumbnail: compressed.thumbnail,
          isCustom: true,
          addedAt: Date.now(),
        })
        logs.push(`✓ تم تحسين الصورة بنجاح (وفرت الحجم لمظهر سريع جداً)`)
        setProcessLogs([...logs])
      } catch (err) {
        console.error(err)
        logs.push(`⚠️ تعذر معالجة الملف: ${file.name}`)
        setProcessLogs([...logs])
      }
    }

    // 2. Process URL if given
    if (urlInput.trim()) {
      const id = `url-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
      newItems.push({
        id,
        title: uploadTitlePrefix.trim() || 'تصميم من رابط',
        category: finalCategory,
        src: urlInput.trim(),
        thumbnail: urlInput.trim(),
        isCustom: true,
        addedAt: Date.now(),
      })
      logs.push(`✓ تمت إضافة الصورة من الرابط بنجاح`)
      setProcessLogs([...logs])
    }

    if (newItems.length > 0) {
      let updatedPages = [...pages]
      if (uploadPosition === 'start') {
        updatedPages = [...newItems, ...updatedPages]
      } else if (uploadPosition === 'after') {
        const insertIdx = Math.max(0, Math.min(updatedPages.length, afterPageNum))
        updatedPages.splice(insertIdx, 0, ...newItems)
      } else {
        // 'end'
        updatedPages = [...updatedPages, ...newItems]
      }

      onUpdatePages(updatedPages)
      showToast(`تمت إضافة ${newItems.length} صورة إلى الكتالوج بنجاح!`)
      setUploadFiles([])
      setUrlInput('')
      setUploadTitlePrefix('')
      setCustomCategory('')
      setTimeout(() => {
        setIsProcessing(false)
        setActiveTab('manage')
      }, 1000)
    } else {
      setIsProcessing(false)
    }
  }

  // Edit item save
  const handleSaveEdit = () => {
    if (!editingItem) return
    const newPages = pages.map((p) => (p.id === editingItem.id ? editingItem : p))
    onUpdatePages(newPages)
    setEditingItem(null)
    showToast('تم حفظ تعديلات الصورة بنجاح')
  }

  // Export JSON
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(pages, null, 2))
    const dlAnchorElem = document.createElement('a')
    dlAnchorElem.setAttribute('href', dataStr)
    dlAnchorElem.setAttribute('download', `amin-pergola-catalog-backup-${new Date().toISOString().slice(0, 10)}.json`)
    dlAnchorElem.click()
    showToast('تم تنزيل النسخة الاحتياطية بنجاح')
  }

  // Import JSON
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result)
        if (Array.isArray(imported) && imported.length > 0) {
          if (window.confirm(`هل أنت متأكد من استيراد كتالوج يحتوي على ${imported.length} صورة؟ سيتم استبدال الكتالوج الحالي.`)) {
            onUpdatePages(imported)
            showToast(`تم استيراد ${imported.length} صورة بنجاح`)
          }
        } else {
          showToast('الملف غير متطابق مع صيغة الكتالوج', 'error')
        }
      } catch {
        showToast('فشل في قراءة ملف JSON', 'error')
      }
    }
    reader.readAsText(file)
  }

  // Copy client share link
  const clientShareUrl = `${window.location.origin}${window.location.pathname}?view=client`
  const handleCopyClientLink = () => {
    navigator.clipboard.writeText(clientShareUrl)
    showToast('تم نسخ رابط العميل إلى الحافظة بنجاح!')
  }

  // Categories list
  const existingCategories = Array.from(new Set(pages.map((p) => p.category).filter(Boolean)))
  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...existingCategories]))

  return (
    <div className="dashboard-overlay" onClick={onClose} dir="rtl">
      <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
        {/* Toast Notification */}
        {notification && (
          <div className={`dashboard-toast ${notification.type}`}>
            {notification.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
            <span>{notification.text}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="dash-header">
          <div className="dash-header-main">
            <div className="dash-header-title">
              <div className="dash-icon-badge">
                <SlidersHorizontal size={22} />
              </div>
              <div className="dash-title-texts">
                <h2>لوحة تحكم الكتالوج</h2>
                <p className="dash-header-desc">إدارة صور أعمال الأمين للبرجولات، إضافة أعمال جديدة، حذف وترتيب الصفحات</p>
              </div>
            </div>

            <button className="dash-close-btn" onClick={onClose} title="إغلاق لوحة التحكم" aria-label="إغلاق">
              <X size={20} />
            </button>
          </div>

          <div className="dash-header-actions">
            <div className="dash-owner-chip" title="المالك المصرح له">
              <ShieldCheck size={15} />
              <span className="dash-owner-email">{ADMIN_EMAIL}</span>
            </div>

            <div className="dash-header-action-btns">
              <button className="dash-preview-btn" onClick={onClose} title="الرجوع للكتالوج">
                <Eye size={15} />
                <span>عرض الكتالوج</span>
              </button>
              <button className="dash-logout-btn" onClick={onLogout} title="تسجيل الخروج وقفل لوحة التحكم">
                <LogOut size={15} />
                <span>خروج</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="dash-stats-bar">
          <div className="stat-card">
            <span className="stat-label">إجمالي الصور المعروضة</span>
            <strong className="stat-val">{pages.length} صورة</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">التصنيفات المتاحة</span>
            <strong className="stat-val">{existingCategories.length} أقسام</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">الصور المخصصة المضافة</span>
            <strong className="stat-val">
              {pages.filter((p) => p.isCustom).length} صورة
            </strong>
          </div>
          <div className="stat-card stat-whatsapp">
            <button className="stat-share-btn" onClick={handleCopyClientLink}>
              <Copy size={14} />
              <span>نسخ رابط العميل</span>
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="dash-tabs">
          <button
            className={`dash-tab ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            <Layers size={17} />
            <span>إدارة وترتيب الصور ({pages.length})</span>
          </button>

          <button
            className={`dash-tab ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <Plus size={17} />
            <span>إضافة صور جديدة</span>
          </button>

          <button
            className={`dash-tab ${activeTab === 'backup' ? 'active' : ''}`}
            onClick={() => setActiveTab('backup')}
          >
            <Download size={17} />
            <span>النسخ الاحتياطي والاستعادة</span>
          </button>

          <button
            className={`dash-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Phone size={17} />
            <span>إعدادات التواصل ورابط العميل</span>
          </button>
        </div>

        {/* Tab 1: Manage & Reorder */}
        {activeTab === 'manage' && (
          <div className="dash-tab-body">
            {/* Filter & Search Bar */}
            <div className="dash-controls-row">
              <div className="dash-search-input">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="ابحث برقم الصفحة أو اسم التصميم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="clear-btn" onClick={() => setSearchQuery('')}>
                    ×
                  </button>
                )}
              </div>

              <div className="dash-cat-select">
                <Filter size={16} />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {allCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Actions */}
              <div className="dash-batch-tools">
                <button className="dash-batch-btn" onClick={selectAll} title="تحديد الكل">
                  {selectedIds.size === filteredPages.length && filteredPages.length > 0 ? (
                    <CheckSquare size={16} />
                  ) : (
                    <Square size={16} />
                  )}
                  <span>تحديد الكل ({filteredPages.length})</span>
                </button>

                {selectedIds.size > 0 && (
                  <button className="dash-batch-delete-btn" onClick={handleBatchDelete}>
                    <Trash2 size={16} />
                    <span>حذف ({selectedIds.size})</span>
                  </button>
                )}
              </div>
            </div>

            <p className="dash-reorder-hint">
              💡 <strong>طريقة الترتيب:</strong> يمكنك سحب وإفلات أي صورة مباشرة بالماوس، أو استخدام أزرار الأسهم (تقديم/تأخير)، أو الضغط على رقم الصفحة لتغيير موضعها مباشرة.
            </p>

            {/* Grid of Pages */}
            <div className="dash-pages-grid">
              {filteredPages.map((page) => {
                const actualIndex = pages.findIndex((p) => p.id === page.id)
                const pageNum = actualIndex + 1
                const isSelected = selectedIds.has(page.id)
                const isDragging = draggedIndex === actualIndex
                const isOver = dragOverIndex === actualIndex

                return (
                  <div
                    key={page.id}
                    className={`dash-page-card ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isOver ? 'drag-over' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, actualIndex)}
                    onDragOver={(e) => handleDragOver(e, actualIndex)}
                    onDrop={(e) => handleDrop(e, actualIndex)}
                  >
                    {/* Checkbox */}
                    <button
                      className="card-checkbox"
                      onClick={() => toggleSelect(page.id)}
                      title="تحديد الصورة"
                    >
                      {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>

                    {/* Page Number Badge with click to move */}
                    <button
                      className="card-page-num"
                      onClick={() => {
                        setMoveDialogItem({ item: page, index: actualIndex })
                        setTargetMovePosition(pageNum)
                      }}
                      title="انقر لتغيير موضع هذه الصفحة"
                    >
                      #{pageNum}
                    </button>

                    {/* Thumbnail */}
                    <div className="dash-thumb-wrap">
                      <img
                        src={page.thumbnail || page.src}
                        alt={page.title || `صفحة ${pageNum}`}
                        className="dash-thumb"
                        loading="lazy"
                      />
                    </div>

                    {/* Details */}
                    <div className="dash-card-details">
                      <h4 className="dash-card-title">{page.title || `تصميم #${pageNum}`}</h4>
                      <span className="dash-card-cat">{page.category || 'عام'}</span>
                    </div>

                    {/* Reorder & Action Buttons */}
                    <div className="dash-card-actions">
                      <button
                        className="action-btn"
                        onClick={() => handleMoveUp(actualIndex)}
                        disabled={actualIndex === 0}
                        title="تقديم للأمام (صفحة سابقة)"
                      >
                        <ArrowUp size={15} />
                      </button>

                      <button
                        className="action-btn"
                        onClick={() => handleMoveDown(actualIndex)}
                        disabled={actualIndex === pages.length - 1}
                        title="تأخير للخلف (صفحة تالية)"
                      >
                        <ArrowDown size={15} />
                      </button>

                      <button
                        className="action-btn"
                        onClick={() => setEditingItem({ ...page, actualIndex })}
                        title="تعديل العنوان والتصنيف"
                      >
                        <Edit2 size={15} />
                      </button>

                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(page.id, page.title)}
                        title="حذف هذه الصورة نهائياً"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Add New Images */}
        {activeTab === 'add' && (
          <div className="dash-tab-body add-tab-body">
            <div className="add-form-card">
              <h3>
                <Plus size={20} />
                <span>إضافة صور جديدة إلى الكتالوج</span>
              </h3>
              <p className="form-desc">
                يمكنك رفع صورة واحدة أو عدة صور دفعة واحدة من جهازك، وسيقوم النظام بضغطها وتحسينها تلقائياً لتعمل بسرعة فائقة داخل الكتالوج.
              </p>

              {/* Upload Zone */}
              <label className="upload-dropzone">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFilesChosen}
                  style={{ display: 'none' }}
                />
                <Upload size={38} className="upload-icon" />
                <span className="upload-title">اضغط لاختيار صور من جهازك أو اسحبها هنا</span>
                <span className="upload-subtitle">يدعم JPG, PNG, WEBP (يمكنك اختيار عدة صور معاً)</span>
              </label>

              {/* Uploaded files queue */}
              {uploadFiles.length > 0 && (
                <div className="files-queue">
                  <div className="queue-header">
                    <span>الصور المختارة للرفع ({uploadFiles.length} ملفات):</span>
                    <button className="clear-queue-btn" onClick={() => setUploadFiles([])}>
                      إلغاء الكل
                    </button>
                  </div>
                  <div className="queue-list">
                    {uploadFiles.map((f, i) => (
                      <div key={i} className="queue-item">
                        <span className="queue-name">{f.name}</span>
                        <span className="queue-size">({Math.round(f.size / 1024)} KB)</span>
                        <button
                          className="queue-remove"
                          onClick={() => setUploadFiles(uploadFiles.filter((_, idx) => idx !== i))}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alternative: URL input */}
              <div className="form-group-row">
                <label>أو إضافة صورة عبر رابط مباشر (URL):</label>
                <div className="url-input-wrap">
                  <Link size={16} />
                  <input
                    type="url"
                    placeholder="https://example.com/pergola-photo.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Metadata Fields */}
              <div className="form-grid">
                <div className="form-group">
                  <label>تصنيف العمل:</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                  >
                    {DEFAULT_CATEGORIES.filter((c) => c !== 'الكل').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="custom">+ إضافة تصنيف جديد...</option>
                  </select>
                </div>

                {uploadCategory === 'custom' && (
                  <div className="form-group">
                    <label>اسم التصنيف الجديد:</label>
                    <input
                      type="text"
                      placeholder="مثال: برجولات مظلات سيارات"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>عنوان / وصف مختصر للتصميم:</label>
                  <input
                    type="text"
                    placeholder="مثال: برجولة خشب عزيزي مع دهان مقاوم"
                    value={uploadTitlePrefix}
                    onChange={(e) => setUploadTitlePrefix(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>موضع إضافة الصور في الكتالوج:</label>
                  <select
                    value={uploadPosition}
                    onChange={(e) => setUploadPosition(e.target.value)}
                  >
                    <option value="end">في نهاية الكتالوج (آخر الصفحات)</option>
                    <option value="start">في بداية الكتالوج (بعد الغلاف مباشرة)</option>
                    <option value="after">بعد صفحة محددة...</option>
                  </select>
                </div>

                {uploadPosition === 'after' && (
                  <div className="form-group">
                    <label>أدخل رقم الصفحة التي تسبق الصور الجديدة:</label>
                    <input
                      type="number"
                      min="1"
                      max={pages.length}
                      value={afterPageNum}
                      onChange={(e) => setAfterPageNum(parseInt(e.target.value, 10) || 1)}
                    />
                  </div>
                )}
              </div>

              {/* Process logs */}
              {isProcessing && (
                <div className="process-logs-box">
                  <h4>جاري معالجة وضغط الصور...</h4>
                  <div className="logs-scroll">
                    {processLogs.map((log, i) => (
                      <div key={i} className="log-line">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit button */}
              <div className="form-submit-row">
                <button
                  className="submit-add-btn"
                  onClick={handleProcessAndAdd}
                  disabled={isProcessing || (uploadFiles.length === 0 && !urlInput.trim())}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>جاري المعالجة والحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      <span>إضافة الصور للكتالوج الآن</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Backup & Restore */}
        {activeTab === 'backup' && (
          <div className="dash-tab-body">
            <div className="backup-grid">
              {/* Export */}
              <div className="backup-card">
                <div className="backup-icon">
                  <Download size={26} />
                </div>
                <h3>تصدير نسخة احتياطية من الكتالوج</h3>
                <p>
                  يمكنك تحميل ملف بيانات يحتوي على كامل صور وتصاميم وترتيب الكتالوج للاحتفاظ به على جهازك أو نقله لجهاز آخر.
                </p>
                <button className="backup-btn export" onClick={handleExportBackup}>
                  <Download size={16} />
                  <span>تنزيل ملف الكتالوج (JSON)</span>
                </button>
              </div>

              {/* Import */}
              <div className="backup-card">
                <div className="backup-icon">
                  <Upload size={26} />
                </div>
                <h3>استيراد نسخة احتياطية سابقة</h3>
                <p>
                  إذا كان لديك ملف كتالوج محفوظ سابقاً، يمكنك استيراده الآن لاستعادة جميع الصور والترتيب بضغطة زر.
                </p>
                <label className="backup-btn import">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    style={{ display: 'none' }}
                  />
                  <Upload size={16} />
                  <span>اختيار ملف JSON للاستيراد</span>
                </label>
              </div>

              {/* Reset to Original Default */}
              <div className="backup-card reset-card">
                <div className="backup-icon reset">
                  <RefreshCw size={26} />
                </div>
                <h3>استعادة الكتالوج الافتراضي الأصلي</h3>
                <p>
                  إعادة ضبط الكتالوج إلى الـ 56 صفحة الأصلية للأمين للبرجولات وإلغاء أي تعديلات مخصصة.
                </p>
                <button
                  className="backup-btn reset"
                  onClick={() => {
                    if (
                      window.confirm(
                        'هل أنت متأكد من إعادة ضبط الكتالوج للوضع الأصلي؟ سيتم استرجاع الـ 56 صفحة الأصلية.'
                      )
                    ) {
                      onResetCatalog()
                      showToast('تمت استعادة الكتالوج الأصلي بنجاح!')
                    }
                  }}
                >
                  <RefreshCw size={16} />
                  <span>إعادة ضبط الكتالوج الأصلي</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Settings & WhatsApp */}
        {activeTab === 'settings' && (
          <div className="dash-tab-body">
            <div className="settings-section-card">
              <h3>
                <Phone size={20} />
                <span>إعدادات التواصل السريع للعملاء</span>
              </h3>
              <p className="form-desc">
                عندما يفتح العميل الكتالوج ويعجبه أي تصميم، يمكنه الضغط على "طلب تسعير" ليرسل لك رسالة مباشرة عبر الواتساب برقم وتفاصيل الصفحة.
              </p>

              <div className="form-group">
                <label>رقم هاتف الواتساب المخصص لاستقبال الاستفسارات (مع كود الدولة):</label>
                <div className="phone-input-wrap">
                  <Phone size={18} />
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="مثال: 201012345678"
                    value={tempWhatsapp}
                    onChange={(e) => setTempWhatsapp(e.target.value)}
                  />
                </div>
                <small className="hint-text">اكتب الرقم شاملاً كود الدولة بدون إشارة + (مثلاً لمصر: 2010xxxxxxxx)</small>
              </div>

              <button
                className="save-settings-btn"
                onClick={() => {
                  const formatted = formatWhatsAppPhone(tempWhatsapp || OFFICIAL_WHATSAPP)
                  setTempWhatsapp(formatted)
                  onUpdateSettings({ ...settings, whatsappNumber: formatted })
                  showToast(`تم حفظ رقم الواتساب بنجاح: ${formatted}`)
                }}
              >
                <Check size={16} />
                <span>حفظ رقم الواتساب</span>
              </button>
            </div>

            {/* بطاقة تغيير كلمة مرور لوحة التحكم */}
            <div className="settings-section-card">
              <h3>
                <KeyRound size={20} />
                <span>كلمة مرور لوحة التحكم</span>
              </h3>
              <p className="form-desc">
                كلمة المرور المطلوبة للدخول إلى لوحة التحكم بجانب البريد الإلكتروني twagdy067@gmail.com (الافتراضية: 1234).
              </p>

              <div className="form-group">
                <label>كلمة المرور الحالية أو الجديدة:</label>
                <div className="phone-input-wrap">
                  <KeyRound size={18} />
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="1234"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                className="save-settings-btn"
                onClick={() => {
                  if (!tempPassword.trim()) {
                    showToast('يرجى إدخال كلمة مرور صالحة', 'error')
                    return
                  }
                  onUpdateSettings({ ...settings, adminPassword: tempPassword.trim() })
                  showToast('تم تحديث كلمة مرور لوحة التحكم بنجاح!')
                }}
              >
                <Check size={16} />
                <span>حفظ كلمة المرور الجديدة</span>
              </button>
            </div>

            <div className="settings-section-card share-card">
              <h3>
                <Share2 size={20} />
                <span>رابط مشاركة الكتالوج مع العميل</span>
              </h3>
              <p className="form-desc">
                هذا الرابط مخصص لإرساله لعملائك عبر الواتساب أو تيليجرام؛ حيث يُعرض الكتالوج بتصميم فاخر وأنيق بدون ظهور أزرار لوحة التحكم للعميل.
              </p>

              <div className="client-link-box">
                <span className="client-link-text">{clientShareUrl}</span>
                <button className="copy-link-btn" onClick={handleCopyClientLink}>
                  <Copy size={16} />
                  <span>نسخ الرابط</span>
                </button>
              </div>

              <div className="share-actions-row">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent('كتالوج أعمال وتصاميم الأمين للبرجولات والأعمال الخشبية الفاخرة:\n' + clientShareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="whatsapp-share-btn"
                >
                  <Phone size={18} />
                  <span>مشاركة مباشرة عبر واتساب</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Editing Single Item */}
        {editingItem && (
          <div className="sub-modal-overlay" onClick={() => setEditingItem(null)}>
            <div className="sub-modal" onClick={(e) => e.stopPropagation()}>
              <div className="sub-modal-header">
                <h3>تعديل بيانات التصميم</h3>
                <button onClick={() => setEditingItem(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="sub-modal-body">
                <div className="form-group">
                  <label>عنوان التصميم:</label>
                  <input
                    type="text"
                    value={editingItem.title || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>التصنيف:</label>
                  <select
                    value={editingItem.category || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  >
                    {allCategories.filter((c) => c !== 'الكل').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="sub-modal-footer">
                <button className="save-btn" onClick={handleSaveEdit}>
                  حفظ التعديلات
                </button>
                <button className="cancel-btn" onClick={() => setEditingItem(null)}>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Moving Item to Target Position */}
        {moveDialogItem && (
          <div className="sub-modal-overlay" onClick={() => setMoveDialogItem(null)}>
            <div className="sub-modal" onClick={(e) => e.stopPropagation()}>
              <div className="sub-modal-header">
                <h3>نقل الصفحة إلى موضع محدد</h3>
                <button onClick={() => setMoveDialogItem(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="sub-modal-body">
                <p>
                  الموضع الحالي للصورة هو: <strong>صفحة #{moveDialogItem.index + 1}</strong>
                </p>
                <div className="form-group">
                  <label>أدخل رقم الصفحة المراد الانتقال إليها (1 إلى {pages.length}):</label>
                  <input
                    type="number"
                    min="1"
                    max={pages.length}
                    value={targetMovePosition}
                    onChange={(e) => setTargetMovePosition(parseInt(e.target.value, 10) || 1)}
                  />
                </div>
              </div>
              <div className="sub-modal-footer">
                <button
                  className="save-btn"
                  onClick={() => handleMoveToPosition(moveDialogItem.index, targetMovePosition)}
                >
                  تأكيد النقل
                </button>
                <button className="cancel-btn" onClick={() => setMoveDialogItem(null)}>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
