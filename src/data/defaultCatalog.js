// الكتالوج الافتراضي المسبق لأعمال الأمين للبرجولات
// الصور الجديدة أولاً بترتيب الإرسال، ثم جميع الصفحات الأصلية الـ 56

export const DEFAULT_CATEGORIES = [
  'الكل',
  'برجولات حدائق',
  'برجولات روف وأسطح',
  'جلسات ومظلات خارجية',
  'ديكورات وأعمال خشبية',
]

const rawBase = import.meta.env.BASE_URL || './'
export const APP_BASE = rawBase.endsWith('/') ? rawBase : `${rawBase}/`

const ORIGINAL_PAGES = Array.from({ length: 56 }, (_, i) => {
  const pageNum = i + 1
  let category = 'برجولات حدائق'
  if (pageNum <= 12) {
    category = 'برجولات حدائق'
  } else if (pageNum <= 26) {
    category = 'برجولات روف وأسطح'
  } else if (pageNum <= 42) {
    category = 'جلسات ومظلات خارجية'
  } else {
    category = 'ديكورات وأعمال خشبية'
  }

  return {
    id: `page-${pageNum}`,
    pageNum,
    title: `تصميم برجولة خشبية #${pageNum}`,
    category,
    src: `${APP_BASE}pages/page${pageNum}.jpg`,
    thumbnail: `${APP_BASE}pages/page${pageNum}.jpg`,
    isDefault: true,
    addedAt: Date.now() - (56 - pageNum) * 60000,
  }
})

// ترتيب الملفات مطابق لترتيب الصور المرفقة من أول صورة إلى آخر صورة.
const NEW_CATEGORIES = [
  'برجولات حدائق',
  'برجولات حدائق',
  'برجولات حدائق',
  'جلسات ومظلات خارجية',
  'جلسات ومظلات خارجية',
  'برجولات روف وأسطح',
  'برجولات روف وأسطح',
  'برجولات روف وأسطح',
  'برجولات روف وأسطح',
  'جلسات ومظلات خارجية',
  'جلسات ومظلات خارجية',
]

const NEW_PAGES = NEW_CATEGORIES.map((category, index) => {
  const fileNumber = String(index + 1).padStart(2, '0')
  const src = `${APP_BASE}pages/october-2026-${fileNumber}.jpg`
  return {
    id: `october-2026-${fileNumber}`,
    category,
    src,
    thumbnail: src,
    isDefault: true,
    addedAt: Date.UTC(2026, 9, 13),
  }
})

export const INITIAL_PAGES = [...NEW_PAGES, ...ORIGINAL_PAGES].map((page, index) => ({
  ...page,
  pageNum: index + 1,
  title: `تصميم برجولة خشبية #${index + 1}`,
}))
