import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Mail, RefreshCw, LogOut, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function VerifyEmail() {
  const router = useRouter();
  const { user, logout, resendVerificationEmail, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Redirect if not authenticated or if email is already confirmed
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && !user.requiresEmailConfirmation) {
      // Email is already confirmed, redirect to onboarding
      router.push('/onboarding-new');
      return;
    }
  }, [isAuthenticated, user, router]);

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      const result = await resendVerificationEmail();
      if (result.success) {
        setToast({
          message: 'Verification email sent! Please check your inbox.',
          type: 'success'
        });
      } else {
        // Handle specific error cases
        let errorMessage = result.error || 'Failed to resend email. Please try again.';

        // Check for rate limit error
        if (errorMessage.includes('request this after')) {
          errorMessage = 'Please wait a moment before requesting another email.';
        }

        setToast({
          message: errorMessage,
          type: 'warning'
        });
      }
    } catch (error) {
      console.error('Resend email error:', error);

      let errorMessage = 'An error occurred. Please try again.';
      if (error.message && error.message.includes('request this after')) {
        errorMessage = 'Please wait a moment before requesting another email.';
      }

      setToast({
        message: errorMessage,
        type: 'warning'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-red-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-md w-full">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center justify-center mb-8 cursor-pointer group">
            <img
              src="/klaus_logo.jpeg"
              alt="Falcon Global Consulting"
              className="h-16 w-auto object-contain group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        </Link>

        {/* Verification Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
            >
              <Mail className="w-16 h-16" style={{ color: 'rgba(59, 130, 246, 1)' }} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
            Verify Your Email
          </h2>
          <p className="text-center text-gray-600 mb-6">
            We've sent a verification email to
          </p>

          {/* Email Display */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
            <p className="font-semibold text-gray-900">{user.email}</p>
          </div>

          {/* Instructions */}
          <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '2px solid rgba(59, 130, 246, 0.3)' }}>
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 mr-2" style={{ color: 'rgba(59, 130, 246, 1)' }} />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-2">Next steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Check your email inbox</li>
                  <li>Look for an email from Falcon Global Consulting</li>
                  <li>Click the verification link in the email</li>
                  <li>Return here to continue your onboarding</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Resend Button */}
          <button
            onClick={handleResendEmail}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Sending...' : 'Resend Verification Email'}</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>

          {/* Help Text */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Didn't receive the email? Check your spam folder or try resending.
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/">
            <span className="text-gray-600 hover:text-gray-900 text-sm cursor-pointer">
              ← Back to Home
            </span>
          </Link>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
