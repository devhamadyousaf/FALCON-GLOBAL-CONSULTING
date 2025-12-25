import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import { ArrowLeft, Ticket, Plus, Trash2, Copy, CheckCircle } from 'lucide-react';

export default function ReferralCodesPage() {
  const router = useRouter();
  const { user, isAuthenticated, supabase } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referralCodes, setReferralCodes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
    } else if (user.role !== 'admin') {
      router.push('/dashboard/customer');
    } else {
      fetchReferralCodes();
    }
  }, [isAuthenticated, user, router]);

  const fetchReferralCodes = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const response = await fetch('/api/admin/referral-codes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setReferralCodes(result.data);
      }
    } catch (error) {
      console.error('Error fetching referral codes:', error);
      alert('Error loading referral codes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCode = async () => {
    if (!discountPercentage || discountPercentage < 0 || discountPercentage > 100) {
      alert('Please enter a discount percentage between 0 and 100');
      return;
    }

    setCreating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const response = await fetch('/api/admin/referral-codes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          discountPercentage: parseFloat(discountPercentage)
        })
      });

      const result = await response.json();
      if (result.success) {
        alert(`Referral code created: ${result.data.code}`);
        setShowCreateModal(false);
        setDiscountPercentage('');
        await fetchReferralCodes();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating referral code:', error);
      alert('Error creating referral code');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCode = async (code) => {
    if (!confirm(`Delete referral code "${code}"?`)) {
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/referral-codes?code=${code}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        alert('Referral code deleted');
        await fetchReferralCodes();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting referral code:', error);
      alert('Error deleting referral code');
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/admin')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center space-x-3">
                <Ticket className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                <span>Referral Codes</span>
              </h1>
              <p className="text-gray-600 mt-2">Manage discount codes for users</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Create Code</span>
            </button>
          </div>
        </div>

        {/* Referral Codes List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {referralCodes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Ticket className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No referral codes yet</p>
              <p className="text-sm mt-1">Create your first referral code</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Code</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Discount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {referralCodes.map((code) => (
                    <tr key={code.code} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-lg font-bold text-blue-600">{code.code}</span>
                          <button
                            onClick={() => handleCopyCode(code.code)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Copy code"
                          >
                            {copiedCode === code.code ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          {code.discount_percentage}% OFF
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-sm">
                        {formatDate(code.created_at)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDeleteCode(code.code)}
                          className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                          title="Delete code"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Create Referral Code</h3>
            <p className="text-sm text-gray-600 mb-4">
              A random 5-character code will be generated automatically
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Percentage *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  placeholder="e.g., 10 for 10% off"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
                className="flex-1 px-6 py-3 rounded-xl font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCode}
                disabled={creating || !discountPercentage}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
