import { INITIAL_PAGES } from '../data/defaultCatalog'
import { OFFICIAL_WHATSAPP } from './whatsapp'

export const DEFAULT_WHATSAPP = OFFICIAL_WHATSAPP

// استرجاع صفحات الكتالوج المعتمدة من ملفات المشروع مباشرة
export function getCatalog() {
  return INITIAL_PAGES
}
