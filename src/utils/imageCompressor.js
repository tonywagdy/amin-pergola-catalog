// ضغط وتحسين الصور وتطبيق قالب وفريم الكتالوج تلقائياً
import { composeImageWithCatalogFrame } from './frameTemplate'

/**
 * معالجة وضغط الصورة ودمجها تلقائياً داخل فريم وقالب الكتالوج
 * @param {File|Blob|string} source إما ملف صورة من الجهاز أو رابط DataURL / URL
 * @param {Object} options خيارات التنسيق والفريم
 */
export async function compressImage(source, options = {}) {
  const {
    applyFrame = true,
    fitMode = 'cover',
    quality = 0.85,
  } = typeof options === 'object' ? options : { applyFrame: true }

  return new Promise((resolve, reject) => {
    let objectUrl = null

    const handleImageReady = async (img) => {
      try {
        const result = await composeImageWithCatalogFrame(img, {
          applyFrame,
          fitMode,
          quality,
        })

        if (objectUrl) {
          try {
            URL.revokeObjectURL(objectUrl)
          } catch {
            // ignore
          }
        }

        resolve({
          ...result,
          originalSize: typeof source === 'object' && source?.size ? source.size : (result.dataUrl?.length || 0),
          compressedLength: result.dataUrl?.length || 0,
        })
      } catch (err) {
        if (objectUrl) {
          try {
            URL.revokeObjectURL(objectUrl)
          } catch {
            // ignore
          }
        }
        reject(err)
      }
    }

    const img = new Image()

    // 1. إذا كان المصدر رابطاً نصياً
    if (typeof source === 'string') {
      if (source.startsWith('http://') || source.startsWith('https://')) {
        img.crossOrigin = 'anonymous'
      }
      img.onload = () => handleImageReady(img)
      img.onerror = (err) => reject(new Error('فشل تحميل الصورة من الرابط: ' + err))
      img.src = source
      return
    }

    // 2. إذا كان المصدر كائن File أو Blob، نستخدم FileReader كطريقة مضمونة بنسبة 100% لتجنب قيود CORS على blob: URLs في بعض المتصفحات
    const reader = new FileReader()
    reader.onload = (e) => {
      img.onload = () => handleImageReady(img)
      img.onerror = (err) => reject(err)
      img.src = e.target.result
    }
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(source)
  })
}
