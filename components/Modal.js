import { X, CheckCircle, AlertCircle } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, message, type = 'info', onConfirm, confirmText = 'OK', showCancel = false }) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-16 h-16" style={{ color: 'rgba(34, 197, 94, 1)' }} />;
      case 'error':
        return <AlertCircle className="w-16 h-16" style={{ color: 'rgba(239, 68, 68, 1)' }} />;
      case 'warning':
        return <AlertCircle className="w-16 h-16" style={{ color: 'rgba(251, 191, 36, 1)' }} />;
      default:
        return <CheckCircle className="w-16 h-16" style={{ color: 'rgba(59, 130, 246, 1)' }} />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'success':
        return 'rgba(34, 197, 94, 0.1)';
      case 'error':
        return 'rgba(239, 68, 68, 0.1)';
      case 'warning':
        return 'rgba(251, 191, 36, 0.1)';
      default:
        return 'rgba(59, 130, 246, 0.1)';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in"
        style={{ border: '3px solid rgba(187, 40, 44, 0.2)' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-all"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ backgroundColor: getIconBg() }}
          >
            {getIcon()}
          </div>
        </div>

        {/* Title */}
        {title && (
          <h2 className="text-2xl font-bold text-center mb-3" style={{ color: 'rgba(3, 50, 83, 1)' }}>
            {title}
          </h2>
        )}

        {/* Message */}
        <p className="text-center text-gray-700 mb-6 whitespace-pre-line">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          {showCancel && (
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-2xl font-semibold transition-all border-2"
              style={{
                backgroundColor: 'white',
                borderColor: 'rgba(187, 40, 44, 0.3)',
                color: 'rgba(3, 50, 83, 1)'
              }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`${showCancel ? 'flex-1' : 'w-full'} px-6 py-3 rounded-2xl font-semibold text-white transition-all hover:opacity-90`}
            style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
