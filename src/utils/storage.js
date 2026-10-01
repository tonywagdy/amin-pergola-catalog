import { INITIAL_PAGES, APP_BASE } from '../data/defaultCatalog'
import { OFFICIAL_WHATSAPP, formatWhatsAppPhone } from './whatsapp'

const DB_NAME = 'amin_pergola_db'
const DB_VERSION = 1
const STORE_NAME = 'catalog_pages'
const SETTINGS_KEY = 'amin_catalog_settings'

function normalizePages(items) {
  if (!items || !Array.isArray(items)) return items
  return items.map((p) => {
    if (p.src && p.src.startsWith('/pages/') && APP_BASE !== '/') {
      return {
        ...p,
        src: `${APP_BASE}${p.src.replace(/^\//, '')}`,
        thumbnail: p.thumbnail && p.thumbnail.startsWith('/pages/')
          ? `${APP_BASE}${p.thumbnail.replace(/^\//, '')}`
          : p.thumbnail || p.src,
      }
    }
    return p
  })
}

// افتح قاعدة بيانات IndexedDB
function openDB() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => {
      console.warn('IndexedDB failed to open, using localStorage fallback', request.error)
      resolve(null)
    }
  })
}

// استرجاع الكتالوج
export async function getCatalog() {
  try {
    const db = await openDB()
    if (db) {
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const request = store.getAll()

        request.onsuccess = () => {
          const items = request.result
          if (items && items.length > 0) {
            // Sort by order or index
            items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            resolve(normalizePages(items))
          } else {
            // أول مرة: نحفظ الافتراضي ونرجعه
            saveCatalog(INITIAL_PAGES).then(() => resolve(INITIAL_PAGES))
          }
        }

        request.onerror = () => {
          resolve(normalizePages(loadFromLocalStorage()))
        }
      })
    }
  } catch (e) {
    console.error('Error reading from IndexedDB:', e)
  }

  return normalizePages(loadFromLocalStorage())
}

// حفظ الكتالوج بالكامل
export async function saveCatalog(pages) {
  // نضيف حقل order لكل عنصر للحفاظ على الترتيب
  const orderedPages = pages.map((page, idx) => ({
    ...page,
    order: idx,
  }))

  try {
    const db = await openDB()
    if (db) {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)

        // مسح القديم وكتابة الجديد
        store.clear()
        orderedPages.forEach((p) => store.put(p))

        tx.oncomplete = () => {
          // نحفظ نسخة خفيفة في localStorage كاحتياط
          try {
            const lightPages = orderedPages.map((p) => ({
              ...p,
              // If it's a huge base64, don't put giant string in localStorage
              src: p.src.startsWith('data:') ? 'idb_stored' : p.src,
            }))
            localStorage.setItem('amin_catalog_cache', JSON.stringify(lightPages))
          } catch {
            // ignore quota exceeded
          }
          resolve(orderedPages)
        }

        tx.onerror = () => reject(tx.error)
      })
    }
  } catch (e) {
    console.error('Error saving to IndexedDB:', e)
  }

  // LocalStorage fallback
  try {
    localStorage.setItem('amin_catalog_fallback', JSON.stringify(orderedPages))
  } catch (e) {
    console.warn('LocalStorage quota reached:', e)
  }
  return orderedPages
}

// إعادة ضبط الكتالوج للوضع الأصلي
export async function resetCatalogToDefault() {
  const db = await openDB()
  if (db) {
    await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.clear()
      INITIAL_PAGES.forEach((p, idx) => store.put({ ...p, order: idx }))
      tx.oncomplete = () => resolve(true)
    })
  }
  localStorage.removeItem('amin_catalog_cache')
  localStorage.removeItem('amin_catalog_fallback')
  return INITIAL_PAGES
}

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem('amin_catalog_fallback')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.warn(e)
  }
  return INITIAL_PAGES
}

export const ADMIN_EMAIL = 'twagdy067@gmail.com'
export const DEFAULT_WHATSAPP = OFFICIAL_WHATSAPP
export const DEFAULT_ADMIN_PASSWORD = '1234'

// إعدادات لوحة التحكم
export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // تأكد أن رقم الواتساب محدث ومصاغ دائماً بالصيغة الدولية المعتمدة لتطبيق واتساب
      parsed.whatsappNumber = formatWhatsAppPhone(parsed.whatsappNumber || DEFAULT_WHATSAPP)
      if (!parsed.adminPassword) {
        parsed.adminPassword = DEFAULT_ADMIN_PASSWORD
      }
      return parsed
    }
  } catch {
    // ignore
  }
  return {
    adminPassword: DEFAULT_ADMIN_PASSWORD,
    whatsappNumber: DEFAULT_WHATSAPP, // رقم للتواصل السريع 201017919385
    defaultView: 'book', // 'book' or 'grid'
  }
}

export function saveSettings(settings) {
  try {
    const sanitized = {
      ...settings,
      whatsappNumber: formatWhatsAppPhone(settings?.whatsappNumber),
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(sanitized))
  } catch (e) {
    console.error(e)
  }
}
