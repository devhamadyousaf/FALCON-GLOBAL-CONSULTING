import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import { bulkUpdatePricing, AVAILABLE_PLANS } from '../../../lib/custom-pricing';
import {
  ArrowLeft,
  DollarSign,
  Save,
  AlertCircle,
  CheckCircle,
  Users,
  TrendingUp
} from 'lucide-react';

export default function BulkPricingPage() {
  const router = useRouter();
  const { user, isAuthenticated, supabase } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [result, setResult] = useState(null);

  // Redirect if not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    router.push('/dashboard/admin');
    return null;
  }

  const handleBulkUpdate = async () => {
    if (!selectedPlan || !newPrice) {
      alert('Please select a plan and enter a new price');
      return;
    }

    if (!confirm(`Are you sure you want to set ${selectedPlan} plan pricing to $${newPrice} for ALL users?\n\nThis will:\n• Update existing custom pricing for this plan\n• Create new custom pricing for users without it\n\nAll users (excluding admins) will be affected.`)) {
      return;
    }

    setUpdating(true);
    setResult(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('No authentication token');
      }

      const updateResult = await bulkUpdatePricing({
        planName: selectedPlan,
        newPrice: parseFloat(newPrice),
        currency,
        notes,
        token
      });

      if (updateResult.success) {
        setResult({
          type: 'success',
          message: updateResult.message,
          updatedCount: updateResult.updatedCount,
          createdCount: updateResult.createdCount,
          totalAffected: updateResult.totalAffected
        });
        // Reset form
        setSelectedPlan('');
        setNewPrice('');
        setNotes('');
      } else {
        setResult({
          type: 'error',
          message: updateResult.error || 'Failed to update pricing'
        });
      }
    } catch (error) {
      console.error('Error bulk updating pricing:', error);
      setResult({
        type: 'error',
        message: error.message
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/desert-sand-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.5
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard/admin')}
          className="flex items-center space-x-2 mb-6 px-4 py-2 rounded-lg transition-colors hover:bg-white/50"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Admin Dashboard</span>
        </button>

        {/* Header */}
        <div className="rounded-2xl p-8 mb-8 shadow-xl backdrop-blur-md bg-white/90">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bulk Pricing Update</h1>
              <p className="text-gray-600 mt-1">Update pricing for all leads with a specific plan</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Important:</p>
                <p>This will set the custom pricing for ALL users (excluding admins) for the selected plan. It will:</p>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Update existing custom pricing for users who already have it</li>
                  <li>Create new custom pricing for users who don't have it yet</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur-md bg-white/90">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            <span>Update Plan Pricing</span>
          </h2>

          <div className="space-y-6">
            {/* Plan Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Plan <span className="text-red-600">*</span>
              </label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                disabled={updating}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
              >
                <option value="">Select a plan to update</option>
                {AVAILABLE_PLANS.map(plan => (
                  <option key={plan.name} value={plan.name}>
                    {plan.label} (Current Default: ${plan.defaultPrice})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                This will update all users who have custom pricing for the selected plan
              </p>
            </div>

            {/* New Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Price Per Page <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  disabled={updating}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                  style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
                />
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={updating}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CRC">CRC</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={updating}
                placeholder="Reason for bulk update (e.g., 'Market adjustment Q1 2025')"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 resize-none"
                style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleBulkUpdate}
              disabled={updating || !selectedPlan || !newPrice}
              className="w-full px-6 py-4 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              style={{ backgroundColor: 'rgba(0, 50, 83, 1)' }}
            >
              {updating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Update All Users with This Plan</span>
                </>
              )}
            </button>
          </div>

          {/* Result Message */}
          {result && (
            <div className={`mt-6 p-4 rounded-xl border-2 ${
              result.type === 'success'
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-start space-x-3">
                {result.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-semibold ${
                    result.type === 'success' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {result.type === 'success' ? 'Success!' : 'Error'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    result.type === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.message}
                  </p>
                  {result.totalAffected !== undefined && (
                    <div className="text-sm mt-2 text-green-800 space-y-1">
                      <p className="font-semibold">Total users affected: {result.totalAffected}</p>
                      {result.updatedCount > 0 && (
                        <p>• Updated existing custom pricing: {result.updatedCount}</p>
                      )}
                      {result.createdCount > 0 && (
                        <p>• Created new custom pricing: {result.createdCount}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="rounded-2xl p-6 mt-6 shadow-lg backdrop-blur-md bg-blue-50/80 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>How Bulk Update Works</span>
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start space-x-2">
              <span className="font-bold mt-0.5">1.</span>
              <span>Select the plan you want to update (Silver, Gold, Diamond, or Diamond Plus)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-bold mt-0.5">2.</span>
              <span>Enter the new price that will apply to all users with that plan</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-bold mt-0.5">3.</span>
              <span>All users will get the custom pricing for the selected plan (either updated or created)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-bold mt-0.5">4.</span>
              <span>Users with existing custom pricing will be updated, new ones will be created for others</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
