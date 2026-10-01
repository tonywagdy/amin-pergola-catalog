// ضغط وتحسين الصور قبل حفظها لتوفير مساحة وسرعة فائقة في العرض

export async function compressImage(file, maxWidth = 1400, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result

      img.onload = () => {
        let width = img.width
        let height = img.height

        // تقليل الأبعاد بنسبة متناسقة إذا كانت أكبر من الحد الأقصى
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxWidth) / height)
            height = maxWidth
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        // نفضل صيغة webp أو jpeg
        let mimeType = 'image/jpeg'
        if (file.type === 'image/webp') mimeType = 'image/webp'
        if (file.type === 'image/png' && file.size < 500 * 1024) mimeType = 'image/png'

        const dataUrl = canvas.toDataURL(mimeType, quality)

        // توليد صورة مصغرة (Thumbnail) للوحة التحكم
        const thumbCanvas = document.createElement('canvas')
        const thumbWidth = 280
        const thumbHeight = Math.round((height * thumbWidth) / width)
        thumbCanvas.width = thumbWidth
        thumbCanvas.height = thumbHeight
        const thumbCtx = thumbCanvas.getContext('2d')
        thumbCtx.drawImage(img, 0, 0, thumbWidth, thumbHeight)
        const thumbUrl = thumbCanvas.toDataURL('image/jpeg', 0.7)

        resolve({
          dataUrl,
          thumbnail: thumbUrl,
          width,
          height,
          originalSize: file.size,
          compressedLength: dataUrl.length,
        })
      }

      img.onerror = (err) => reject(err)
    }

    reader.onerror = (err) => reject(err)
  })
}
