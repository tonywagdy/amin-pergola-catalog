// معالج روابط وأرقام الواتساب لضمان التوافق التام مع المعايير الدولية لتطبيق WhatsApp
export const OFFICIAL_WHATSAPP = '201017919385'

/**
 * تحويل أي رقم هاتف مدخل إلى الصيغة الدولية الصحيحة بدون + أو أصفار بادئة
 * يتعامل بذكاء مع الأرقام المصرية (010, 011, 012, 015) والأرقام الدولية
 */
export function formatWhatsAppPhone(rawPhone) {
  if (!rawPhone) return OFFICIAL_WHATSAPP

  // 1. استخراج الأرقام فقط
  let cleaned = String(rawPhone).replace(/[^0-9]/g, '')

  // 2. إزالة 00 في البداية (مثل 002010...)
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2)
  }

  // 3. إذا كان المستخدم كتب 20 متبوعة بـ 01 (مثل 2001017919385) نحذف الصفر الزائد
  if (cleaned.startsWith('2001') && cleaned.length >= 13) {
    cleaned = '20' + cleaned.substring(3)
  }

  // 4. إذا كان يبدأ بـ 01 وهو رقم محلي مصري مكون من 11 رقماً (مثل 01017919385)
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    cleaned = '20' + cleaned.substring(1) // يحول 01017919385 إلى 201017919385
  }

  // 5. إذا كان 10 أرقام ويبدأ بـ 1 (مثل 1017919385)
  if (cleaned.startsWith('1') && cleaned.length === 10) {
    cleaned = '20' + cleaned
  }

  // 6. التحقق من سلامة الرقم النهائي
  if (cleaned.length < 10) {
    return OFFICIAL_WHATSAPP
  }

  return cleaned
}

/**
 * إنشاء رابط واتساب متوافق مع جميع الأجهزة (الهواتف والكمبيوتر)
 */
export function createWhatsAppLink(phone, message) {
  const formattedPhone = formatWhatsAppPhone(phone)
  const encodedText = encodeURIComponent(message || '')
  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`
}
