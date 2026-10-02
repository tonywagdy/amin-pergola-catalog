// محرك تطبيق قالب وفريم كتالوج الأمين للبرجولات تلقائياً على أي صورة جديدة
import { APP_BASE } from '../data/defaultCatalog'

const CANVAS_WIDTH = 1414
const CANVAS_HEIGHT = 2000

// أبعاد المستطيل الداخلي المخصص لصورة العمل داخل الفريم
const INNER_FRAME = {
  x: 125,
  y: 125,
  width: 1164,
  height: 1750,
}

let cachedFrameImage = null

// تحميل صورة قالب الفريم المعتمد
export function loadFrameTemplateImage() {
  if (cachedFrameImage && cachedFrameImage.complete && cachedFrameImage.naturalWidth > 0) {
    return Promise.resolve(cachedFrameImage)
  }

  return new Promise((resolve) => {
    const img = new Image()

    img.onload = () => {
      cachedFrameImage = img
      resolve(img)
    }

    img.onerror = () => {
      // تجربة النسخة البديلة PNG
      const pngImg = new Image()
      pngImg.onload = () => {
        cachedFrameImage = pngImg
        resolve(pngImg)
      }
      pngImg.onerror = () => {
        // في حال تعذر تحميل الملف، سنستخدم الرسم الإجرائي (Procedural Canvas)
        resolve(null)
      }
      pngImg.src = `${APP_BASE}catalog-frame-template.png`
    }

    img.src = `${APP_BASE}catalog-frame-template.webp`
  })
}

// رسم فريم إجرائي فخم في حال لم تتوفر الصورة الخارجية
function drawProceduralFrame(ctx) {
  // 1. خلفية البردي والألوان الرملية الخشبية الملكية
  const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  grad.addColorStop(0, '#c59763')
  grad.addColorStop(0.3, '#ca9d66')
  grad.addColorStop(0.7, '#cb9e67')
  grad.addColorStop(1, '#a77948')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // 2. تظليل خفيف عند الحواف الخارجية
  const vignette = ctx.createRadialGradient(
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2,
    CANVAS_WIDTH * 0.45,
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2,
    CANVAS_WIDTH * 0.75
  )
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
  vignette.addColorStop(1, 'rgba(60, 30, 0, 0.35)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // 3. مسح الجزء الداخلي ليكون شفافاً لتظهر تحته الصورة
  ctx.clearRect(INNER_FRAME.x, INNER_FRAME.y, INNER_FRAME.width, INNER_FRAME.height)

  // 4. رسم الخطوط الذهبية والخشبية الفاخرة حول الإطار الداخلي
  ctx.save()
  // خط ذهبي بارز
  ctx.strokeStyle = '#c59b27'
  ctx.lineWidth = 4
  ctx.strokeRect(INNER_FRAME.x - 4, INNER_FRAME.y - 4, INNER_FRAME.width + 8, INNER_FRAME.height + 8)

  // خط خشب داكن أنيق
  ctx.strokeStyle = '#2b1704'
  ctx.lineWidth = 3
  ctx.strokeRect(INNER_FRAME.x, INNER_FRAME.y, INNER_FRAME.width, INNER_FRAME.height)

  // خط خارجي دقيق
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.lineWidth = 2
  ctx.strokeRect(INNER_FRAME.x - 12, INNER_FRAME.y - 12, INNER_FRAME.width + 24, INNER_FRAME.height + 24)
  ctx.restore()
}

/**
 * دمج أي صورة ملتقطة مع قالب وفريم الكتالوج الملكي
 * @param {HTMLImageElement|ImageBitmap} sourceImg الصورة الأصلية
 * @param {Object} options خيارات التنسيق
 * @returns {Promise<{dataUrl: string, thumbnail: string}>}
 */
export async function composeImageWithCatalogFrame(sourceImg, options = {}) {
  const {
    applyFrame = true,
    fitMode = 'cover', // 'cover' أو 'contain'
    quality = 0.85,
  } = options

  // إذا اختار المستخدم عدم تطبيق الفريم، نرجع الصورة مباشرة بنسبة تناسبية
  if (!applyFrame) {
    const canvas = document.createElement('canvas')
    let w = sourceImg.naturalWidth || sourceImg.width
    let h = sourceImg.naturalHeight || sourceImg.height
    const maxDimension = 1400
    if (w > maxDimension || h > maxDimension) {
      if (w > h) {
        h = Math.round((h * maxDimension) / w)
        w = maxDimension
      } else {
        w = Math.round((w * maxDimension) / h)
        h = maxDimension
      }
    }
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(sourceImg, 0, 0, w, h)
    const dataUrl = canvas.toDataURL('image/jpeg', quality)

    // thumbnail
    const thumbCanvas = document.createElement('canvas')
    const tw = 280
    const th = Math.round((h * tw) / w)
    thumbCanvas.width = tw
    thumbCanvas.height = th
    const tctx = thumbCanvas.getContext('2d')
    tctx.drawImage(sourceImg, 0, 0, tw, th)
    const thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.65)

    return { dataUrl, thumbnail, width: w, height: h }
  }

  // 1. تجهيز كانفاس بمقاس صفحة الكتالوج القياسية (1414 × 2000)
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // 2. رسم خلفية دافئة بلون الكتالوج تحت الصورة
  const bgGrad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  bgGrad.addColorStop(0, '#c59763')
  bgGrad.addColorStop(0.5, '#ca9d66')
  bgGrad.addColorStop(1, '#a77948')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // 3. حساب موضع وأبعاد صورة العمل داخل الإطار الداخلي
  const targetX = INNER_FRAME.x
  const targetY = INNER_FRAME.y
  const targetW = INNER_FRAME.width
  const targetH = INNER_FRAME.height

  const srcW = sourceImg.naturalWidth || sourceImg.width
  const srcH = sourceImg.naturalHeight || sourceImg.height

  ctx.save()
  // قص الرسم ليبقى بدقة داخل الإطار الداخلي
  ctx.beginPath()
  ctx.rect(targetX, targetY, targetW, targetH)
  ctx.clip()

  if (fitMode === 'cover') {
    // ملاءمة كاملة للمستطيل الداخلي بدون أي فراغات
    const scale = Math.max(targetW / srcW, targetH / srcH)
    const drawW = srcW * scale
    const drawH = srcH * scale
    const drawX = targetX + (targetW - drawW) / 2
    const drawY = targetY + (targetH - drawH) / 2
    ctx.drawImage(sourceImg, drawX, drawY, drawW, drawH)
  } else {
    // وضع الصورة بحجمها الأصلي مع خلفية ناعمة
    const scale = Math.min(targetW / srcW, targetH / srcH)
    const drawW = srcW * scale
    const drawH = srcH * scale
    const drawX = targetX + (targetW - drawW) / 2
    const drawY = targetY + (targetH - drawH) / 2

    // خلفية معتمة خفيفة
    ctx.fillStyle = '#221508'
    ctx.fillRect(targetX, targetY, targetW, targetH)

    ctx.drawImage(sourceImg, drawX, drawY, drawW, drawH)
  }

  // ظل داخلي أنيق عند أطراف الصورة
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'
  ctx.lineWidth = 6
  ctx.strokeRect(targetX, targetY, targetW, targetH)
  ctx.restore()

  // 4. تركيب فريم الكتالوج الملكي فوق الصورة
  const frameImg = await loadFrameTemplateImage()
  if (frameImg) {
    ctx.drawImage(frameImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  } else {
    drawProceduralFrame(ctx)
  }

  // 5. استخراج الصورة الناتجة بجودة فائقة وحجم متناسق
  const dataUrl = canvas.toDataURL('image/jpeg', quality)

  // 6. استخراج صورة مصغرة (Thumbnail) للوحة التحكم وشبكة المعرض
  const thumbCanvas = document.createElement('canvas')
  const thumbW = 280
  const thumbH = Math.round((CANVAS_HEIGHT * thumbW) / CANVAS_WIDTH) // ~396px
  thumbCanvas.width = thumbW
  thumbCanvas.height = thumbH
  const thumbCtx = thumbCanvas.getContext('2d')
  thumbCtx.imageSmoothingEnabled = true
  thumbCtx.imageSmoothingQuality = 'high'
  thumbCtx.drawImage(canvas, 0, 0, thumbW, thumbH)
  const thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.7)

  return {
    dataUrl,
    thumbnail,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  }
}
