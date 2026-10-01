// الكتالوج الافتراضي المسبق لأعمال الأمين للبرجولات
// يحتوي على جميع الصفحات الـ 56 الجاهزة للتحميل الفوري بدون تأخير أو فحص متكرر

export const DEFAULT_CATEGORIES = [
  'الكل',
  'برجولات حدائق',
  'برجولات روف وأسطح',
  'جلسات ومظلات خارجية',
  'ديكورات وأعمال خشبية',
]

export const INITIAL_PAGES = Array.from({ length: 56 }, (_, i) => {
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
    src: `/pages/page${pageNum}.jpg`,
    thumbnail: `/pages/page${pageNum}.jpg`,
    isDefault: true,
    addedAt: Date.now() - (56 - pageNum) * 60000,
  }
})
