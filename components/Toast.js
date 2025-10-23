import { useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'rgba(34, 197, 94, 0.1)',
          border: 'rgba(34, 197, 94, 0.4)',
          iconColor: 'rgba(34, 197, 94, 1)',
          icon: CheckCircle
        };
      case 'error':
        return {
          bg: 'rgba(239, 68, 68, 0.1)',
          border: 'rgba(239, 68, 68, 0.4)',
          iconColor: 'rgba(239, 68, 68, 1)',
          icon: AlertCircle
        };
      case 'info':
        return {
          bg: 'rgba(59, 130, 246, 0.1)',
          border: 'rgba(59, 130, 246, 0.4)',
          iconColor: 'rgba(59, 130, 246, 1)',
          icon: Info
        };
      default:
        return {
          bg: 'rgba(34, 197, 94, 0.1)',
          border: 'rgba(34, 197, 94, 0.4)',
          iconColor: 'rgba(34, 197, 94, 1)',
          icon: CheckCircle
        };
    }
  };

  const styles = getStyles();
  const Icon = styles.icon;

  return (
    <div
      className="fixed top-24 right-6 z-50 animate-slide-in"
      style={{ maxWidth: '400px' }}
    >
      <div
        className="rounded-2xl p-4 shadow-2xl backdrop-blur-lg flex items-start gap-3"
        style={{
          backgroundColor: styles.bg,
          border: `2px solid ${styles.border}`
        }}
      >
        <Icon className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: styles.iconColor }} />
        <p className="flex-1 text-sm font-medium" style={{ color: 'rgba(3, 50, 83, 1)' }}>
          {message}
        </p>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-white/50 transition-all"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
