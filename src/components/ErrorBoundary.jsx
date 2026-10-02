import { Component } from 'react'
import { RotateCcw, AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="error-fallback-container" dir="rtl">
          <div className="error-fallback-card">
            <div className="error-icon-box">
              <AlertTriangle size={36} />
            </div>
            <h3>جاري تحديث محتوى الكتالوج</h3>
            <p>تم تحديث الصفحات، اضغط أدناه لإعادة تشغيل العرض التفاعلي بسلاسة.</p>
            <button
              className="error-reload-btn"
              onClick={() => {
                this.setState({ hasError: false, error: null })
                if (this.props.onReset) {
                  this.props.onReset()
                } else {
                  window.location.reload()
                }
              }}
            >
              <RotateCcw size={16} />
              <span>تحديث العرض الآن</span>
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
