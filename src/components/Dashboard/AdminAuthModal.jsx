import { useState } from 'react'
import { Lock, Mail, KeyRound, AlertTriangle, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from '../../utils/storage'

export default function AdminAuthModal({ isOpen, onClose, onAuthenticated, currentPassword }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  const expectedPassword = currentPassword || DEFAULT_ADMIN_PASSWORD || '1234'

  const handleLogin = (e) => {
    e.preventDefault()
    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()

    if (!cleanEmail) {
      setError('يرجى كتابة البريد الإلكتروني')
      return
    }

    if (cleanEmail !== ADMIN_EMAIL.toLowerCase()) {
      setError(`⛔ البريد غير مصرح له! لوحة التحكم متاحة فقط للمالك المعتمد: ${ADMIN_EMAIL}`)
      return
    }

    if (!cleanPassword) {
      setError('يرجى كتابة كلمة المرور')
      return
    }

    // التحقق من كلمة المرور (سواء كلمة المرور الحالية أو الافتراضية 1234)
    if (cleanPassword !== expectedPassword && cleanPassword !== '1234') {
      setError('❌ كلمة المرور غير صحيحة. (كلمة المرور الافتراضية: 1234)')
      return
    }

    setError('')
    setIsSuccess(true)
    setTimeout(() => {
      setIsSuccess(false)
      onAuthenticated()
    }, 600)
  }

  return (
    <div className="dashboard-overlay" onClick={onClose} dir="rtl">
      <div className="admin-auth-card" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <div className="auth-icon-wrap">
            <Lock size={26} />
          </div>
          <h2>لوحة تحكم الأمين للبرجولات</h2>
          <p>منطقة الإدارة محمية بالبريد وكلمة المرور</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          {/* حقل البريد الإلكتروني */}
          <div className="auth-input-group">
            <label htmlFor="admin-email">البريد الإلكتروني للمالك:</label>
            <div className="auth-input-wrap">
              <Mail size={18} className="auth-input-icon" />
              <input
                id="admin-email"
                type="email"
                dir="ltr"
                placeholder="twagdy067@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                autoFocus
              />
            </div>
          </div>

          {/* حقل كلمة المرور */}
          <div className="auth-input-group">
            <label htmlFor="admin-pass">كلمة المرور:</label>
            <div className="auth-input-wrap">
              <KeyRound size={18} className="auth-input-icon" />
              <input
                id="admin-pass"
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                placeholder="••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <small className="auth-hint">كلمة المرور الافتراضية: <strong>1234</strong> (ويمكنك تغييرها من الإعدادات)</small>
          </div>

          {error && (
            <div className="auth-error-msg">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {isSuccess && (
            <div className="auth-success-msg">
              <ShieldCheck size={18} />
              <span>تم التحقق بنجاح! جاري فتح لوحة التحكم...</span>
            </div>
          )}

          <div className="auth-actions">
            <button type="submit" className="auth-submit-btn" disabled={isSuccess}>
              <span>تسجيل الدخول للوحة التحكم</span>
            </button>

            <button type="button" className="auth-cancel-btn" onClick={onClose}>
              <ArrowRight size={16} />
              <span>الرجوع إلى الكتالوج العام</span>
            </button>
          </div>
        </form>

        <div className="auth-footer-note">
          <span>🔒 لوحة التحكم منفصلة تماماً ومحمية ولا تظهر في واجهة العميل.</span>
        </div>
      </div>
    </div>
  )
}
