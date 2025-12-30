import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';
import { saveCustomPricing, deleteCustomPricing, AVAILABLE_PLANS } from '../../../../lib/custom-pricing';
import { createTimeoutPromise, retryOperation } from '../../../../utils/asyncHelpers';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Edit,
  Trash2,
  Shield,
  DollarSign,
  Activity,
  Eye,
  XCircle,
  Plus,
  Save,
  X as XIcon,
  RefreshCw
} from 'lucide-react';

export default function UserDetailPage() {
  const router = useRouter();
  const { userId } = router.query;
  const { user: currentUser, isAuthenticated, supabase } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [userApplications, setUserApplications] = useState([]);
  const [userDocuments, setUserDocuments] = useState([]);
  const [userPayments, setUserPayments] = useState([]);
  const [onboardingData, setOnboardingData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const loadingTimeoutRef = useRef(null);

  // Custom Pricing states - OLD schema: one row with all plan prices
  const [customPricing, setCustomPricing] = useState(null);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pricingForm, setPricingForm] = useState({
    silverPrice: '',
    goldPrice: '',
    diamondPrice: '',
    diamondPlusPrice: '',
    currency: 'USD',
    notes: ''
  });
  const [savingPricing, setSavingPricing] = useState(false);

  // Standalone fetchCustomPricing for tab refresh
  const fetchCustomPricing = useCallback(async () => {
    if (!userId || !supabase) return;

    setLoadingPricing(true);
    try {
      const fetchOperation = async () => {
        const { data, error } = await supabase
          .from('custom_pricing')
          .select('*, created_by_profile:profiles!custom_pricing_created_by_fkey(full_name, email)')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        return data;
      };

      // Add timeout protection
      const data = await Promise.race([
        retryOperation(fetchOperation, 2, 500),
        createTimeoutPromise(15000, 'Fetch custom pricing')
      ]);

      setCustomPricing(data || null);
    } catch (error) {
      setCustomPricing(null);
      if (!error.message?.includes('PGRST116')) {
        showToast('Failed to load custom pricing', 'error');
      }
    } finally {
      setLoadingPricing(false);
    }
  }, [userId, supabase, showToast]);

  const loadUserData = useCallback(async () => {
    if (!userId || !supabase) return;

    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    const fetchUserProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserData(data);
      return data;
    };

    const fetchUserApplications = async () => {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          status,
          applied_at,
          updated_at,
          Job-Leads!inner(jobtitle, companyname, location)
        `)
        .eq('user_id', userId)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setUserApplications(data || []);
      return data;
    };

    const fetchUserDocuments = async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setUserDocuments(data || []);
      return data;
    };

    const fetchUserPayments = async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserPayments(data || []);
      return data;
    };

    const fetchOnboardingData = async () => {
      const { data, error } = await supabase
        .from('onboarding_data')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // PGRST116 means no rows found - this is expected if user hasn't started onboarding
        if (error.code === 'PGRST116') {
          setOnboardingData(null);
          return null;
        }
        throw error;
      }
      setOnboardingData(data);
      return data;
    };

    setLoading(true);
    setError(null);

    // Safety timeout - force stop loading after 30 seconds
    loadingTimeoutRef.current = setTimeout(() => {
      setLoading(false);
      showToast('Loading took too long. Please refresh the page.', 'error', 5000);
    }, 30000);

    try {
      // Use Promise.race to add timeout to the entire operation
      const loadPromise = Promise.allSettled([
        Promise.race([
          retryOperation(fetchUserProfile, 2, 500),
          createTimeoutPromise(10000, 'User profile')
        ]),
        Promise.race([
          retryOperation(fetchUserApplications, 2, 500),
          createTimeoutPromise(10000, 'Applications')
        ]),
        Promise.race([
          retryOperation(fetchUserDocuments, 2, 500),
          createTimeoutPromise(10000, 'Documents')
        ]),
        Promise.race([
          retryOperation(fetchUserPayments, 2, 500),
          createTimeoutPromise(10000, 'Payments')
        ]),
        Promise.race([
          retryOperation(fetchOnboardingData, 2, 500),
          createTimeoutPromise(10000, 'Onboarding data')
        ]),
        fetchCustomPricing()
      ]);

      const results = await loadPromise;

      // Log results and check for critical failures
      const names = ['Profile', 'Applications', 'Documents', 'Payments', 'Onboarding', 'CustomPricing'];
      let failedCount = 0;
      let criticalFailed = false;

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          failedCount++;

          // Profile is critical
          if (index === 0) {
            criticalFailed = true;
            setError(`Failed to load user profile: ${result.reason.message}`);
          }
        }
      });

      if (criticalFailed) {
        showToast('Failed to load user profile. Please try again.', 'error');
      } else if (failedCount > 0) {
        showToast(`Loaded user data with ${failedCount} warning(s)`, 'warning', 4000);
      }
    } catch (error) {
      setError(error.message);
      showToast('Error loading user data', 'error');
    } finally {
      // Clear timeout and stop loading
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setLoading(false);
    }
  }, [userId, supabase, fetchCustomPricing, showToast]);

  useEffect(() => {
    // Wait for router to be ready before using userId
    if (!router.isReady) return;

    if (!isAuthenticated || !currentUser) {
      router.push('/login');
      return;
    }

    if (currentUser.role !== 'admin') {
      router.push('/dashboard/customer');
      return;
    }

    if (userId) {
      loadUserData();
    }

    // Cleanup timeout on unmount
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [isAuthenticated, currentUser, userId, router.isReady, loadUserData, router]);

  // Separate effect to reload data when tab changes
  useEffect(() => {
    if (activeTab === 'pricing' && userId && isAuthenticated) {
      fetchCustomPricing();
    }
  }, [activeTab, userId, isAuthenticated, fetchCustomPricing]);

  const handleSaveCustomPricing = async () => {
    setSavingPricing(true);

    // Optimistically update the UI
    const optimisticData = {
      silver_price: pricingForm.silverPrice ? parseFloat(pricingForm.silverPrice) : null,
      gold_price: pricingForm.goldPrice ? parseFloat(pricingForm.goldPrice) : null,
      diamond_price: pricingForm.diamondPrice ? parseFloat(pricingForm.diamondPrice) : null,
      diamond_plus_price: pricingForm.diamondPlusPrice ? parseFloat(pricingForm.diamondPlusPrice) : null,
      currency: pricingForm.currency,
      notes: pricingForm.notes,
      updated_at: new Date().toISOString()
    };

    const previousPricing = customPricing;
    setCustomPricing(optimisticData);
    setShowPricingModal(false);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('No authentication token');
      }

      const saveOperation = async () => {
        return await saveCustomPricing({
          userId,
          silverPrice: pricingForm.silverPrice ? parseFloat(pricingForm.silverPrice) : undefined,
          goldPrice: pricingForm.goldPrice ? parseFloat(pricingForm.goldPrice) : undefined,
          diamondPrice: pricingForm.diamondPrice ? parseFloat(pricingForm.diamondPrice) : undefined,
          diamondPlusPrice: pricingForm.diamondPlusPrice ? parseFloat(pricingForm.diamondPlusPrice) : undefined,
          currency: pricingForm.currency,
          notes: pricingForm.notes,
          token
        });
      };

      // Add retry and timeout
      const result = await Promise.race([
        retryOperation(saveOperation, 2, 1000),
        createTimeoutPromise(15000, 'Save custom pricing')
      ]);

      if (result.success) {
        showToast(
          previousPricing ? 'Custom pricing updated successfully!' : 'Custom pricing created successfully!',
          'success'
        );
        setPricingForm({
          silverPrice: '',
          goldPrice: '',
          diamondPrice: '',
          diamondPlusPrice: '',
          currency: 'USD',
          notes: ''
        });
        // Refresh to get the actual data from server
        await fetchCustomPricing();
      } else {
        throw new Error(result.error || 'Failed to save pricing');
      }
    } catch (error) {
      // Revert optimistic update on error
      setCustomPricing(previousPricing);
      setShowPricingModal(true);
      showToast('Error saving custom pricing: ' + error.message, 'error');
    } finally {
      setSavingPricing(false);
    }
  };

  const handleDeletePricing = async () => {
    if (!confirm(`Are you sure you want to delete ALL custom pricing for this user?\n\nUser will revert to default pricing for all plans.`)) {
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('No authentication token');
      }

      const deleteOperation = async () => deleteCustomPricing(userId, token);

      // Add retry and timeout
      const result = await Promise.race([
        retryOperation(deleteOperation, 2, 1000),
        createTimeoutPromise(15000, 'Delete custom pricing')
      ]);

      if (result.success) {
        showToast('Custom pricing deleted successfully!', 'success');
        await fetchCustomPricing();
      } else {
        throw new Error(result.error || 'Failed to delete pricing');
      }
    } catch (error) {
      showToast('Error deleting custom pricing: ' + error.message, 'error');
    }
  };

  const handleEditPricing = () => {
    if (customPricing) {
      setPricingForm({
        silverPrice: customPricing.silver_price?.toString() || '',
        goldPrice: customPricing.gold_price?.toString() || '',
        diamondPrice: customPricing.diamond_price?.toString() || '',
        diamondPlusPrice: customPricing.diamond_plus_price?.toString() || '',
        currency: customPricing.currency || 'USD',
        notes: customPricing.notes || ''
      });
    }
    setShowPricingModal(true);
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
      case 'completed':
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
      case 'submitted':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'rejected':
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
      case 'completed':
      case 'verified':
        return 'bg-green-100 text-green-700';
      case 'pending':
      case 'submitted':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const handleDeleteUser = async () => {
    if (!userId) return;

    setDeleting(true);
    try {
      const deleteUserOperation = async () => {
        // Delete user's onboarding data
        await supabase
          .from('onboarding_data')
          .delete()
          .eq('user_id', userId);

        // Delete user's job applications
        await supabase
          .from('job_applications')
          .delete()
          .eq('user_id', userId);

        // Delete user's documents
        await supabase
          .from('documents')
          .delete()
          .eq('user_id', userId);

        // Delete user's payments
        await supabase
          .from('payments')
          .delete()
          .eq('user_id', userId);

        // Delete user's notifications
        await supabase
          .from('notifications')
          .delete()
          .eq('user_id', userId);

        // Delete user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (profileError) {
          throw new Error('Error deleting user profile: ' + profileError.message);
        }

        return true;
      };

      // Add retry and timeout
      await Promise.race([
        retryOperation(deleteUserOperation, 2, 1000),
        createTimeoutPromise(20000, 'Delete user')
      ]);

      showToast('User deleted successfully!', 'success');
      router.push('/dashboard/admin');
    } catch (error) {
      showToast('Error deleting user: ' + error.message, 'error');
      setDeleting(false);
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Update User Onboarding Status
  const handleUpdateUserStatus = async (onboardingComplete) => {
    // Optimistically update the UI
    const previousUserData = userData;
    setUserData({ ...userData, onboarding_complete: onboardingComplete });

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('No authentication token');
      }

      const updateOperation = async () => {
        const response = await fetch('/api/admin/update-user-status', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            onboardingComplete
          })
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to update user status');
        }

        return result;
      };

      // Add retry and timeout
      await Promise.race([
        retryOperation(updateOperation, 2, 1000),
        createTimeoutPromise(15000, 'Update user status')
      ]);

      showToast(
        `User onboarding status updated to ${onboardingComplete ? 'Complete' : 'Incomplete'}!`,
        'success'
      );

      // Reload user data to reflect changes
      await loadUserData();
    } catch (error) {
      // Revert optimistic update on error
      setUserData(previousUserData);
      showToast('Error updating user status: ' + error.message, 'error');
    }
  };

  if (!currentUser || currentUser.role !== 'admin') return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 mb-4">Loading user details...</p>
          <button
            onClick={loadUserData}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Cancel & Retry</span>
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-6">The user you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/dashboard/admin')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalPaid = userPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 mb-1">Error Loading Data</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                loadUserData();
              }}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard/admin')}
          className="flex items-center space-x-2 mb-6 px-4 py-2 rounded-lg transition-colors hover:bg-white/50"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Admin Dashboard</span>
        </button>

        {/* User Header Card */}
        <div
          className="rounded-2xl p-8 mb-8 shadow-xl backdrop-blur-md"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '2px solid rgba(187, 40, 44, 0.3)'
          }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.full_name || userData.email)}&background=random&size=96`}
                alt={userData.full_name || userData.email}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {userData.full_name || 'No Name'}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                    userData.onboarding_complete ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {userData.onboarding_complete ? 'Active' : 'Pending Onboarding'}
                  </span>
                  <span className="px-4 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    {userData.role === 'admin' ? 'Administrator' : 'Customer'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!userData.onboarding_complete && (
                <button
                  onClick={() => handleUpdateUserStatus(true)}
                  className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
                  title="Mark Onboarding Complete"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Complete Onboarding</span>
                </button>
              )}
              {userData.onboarding_complete && (
                <button
                  onClick={() => handleUpdateUserStatus(false)}
                  className="px-6 py-3 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors font-medium flex items-center space-x-2"
                  title="Mark Onboarding Incomplete"
                >
                  <Clock className="w-5 h-5" />
                  <span>Mark Pending</span>
                </button>
              )}
              <button className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                title="Delete User"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Applications</p>
                <p className="text-xl font-bold text-gray-900">{userApplications.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Documents</p>
                <p className="text-xl font-bold text-gray-900">{userDocuments.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Paid</p>
                <p className="text-xl font-bold text-gray-900">${totalPaid.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-sm font-bold text-gray-900">{formatDate(userData.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {[
            { id: 'overview', name: 'Overview', icon: User },
            { id: 'pricing', name: 'Custom Pricing', icon: DollarSign },
            { id: 'onboarding', name: 'Onboarding Data', icon: Activity },
            { id: 'applications', name: 'Applications', icon: FileText },
            { id: 'documents', name: 'Documents', icon: FileText },
            { id: 'payments', name: 'Payments', icon: DollarSign }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/70 text-gray-700 hover:bg-white/90'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="rounded-2xl p-6 shadow-lg backdrop-blur-md bg-white/80">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <User className="w-6 h-6 text-blue-600" />
                <span>Personal Information</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900 font-medium">{userData.full_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email Address</label>
                  <p className="text-gray-900 font-medium flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{userData.email}</span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-gray-900 font-medium flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{userData.phone || 'Not provided'}</span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-gray-900 font-medium">
                    {userData.date_of_birth ? formatDate(userData.date_of_birth) : 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nationality</label>
                  <p className="text-gray-900 font-medium">{userData.nationality || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Location</label>
                  <p className="text-gray-900 font-medium flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{userData.current_location || 'Not provided'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="rounded-2xl p-6 shadow-lg backdrop-blur-md bg-white/80">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Shield className="w-6 h-6 text-purple-600" />
                <span>Account Information</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">User ID</label>
                  <p className="text-gray-900 font-mono text-sm">{userData.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <p className="text-gray-900 font-medium">{userData.role || 'customer'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Created</label>
                  <p className="text-gray-900 font-medium">{formatDate(userData.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-gray-900 font-medium">
                    {userData.updated_at ? formatDate(userData.updated_at) : 'Never'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Onboarding Status</label>
                  <p className="text-gray-900 font-medium">
                    {userData.onboarding_complete ? 'Completed' : 'Incomplete'}
                  </p>
                </div>
                {userData.current_step && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Current Onboarding Step</label>
                    <p className="text-gray-900 font-medium">{userData.current_step}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Work & Education */}
            {(userData.highest_education || userData.work_experience_years) && (
              <div className="rounded-2xl p-6 shadow-lg backdrop-blur-md bg-white/80">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Work & Education</h3>
                <div className="space-y-4">
                  {userData.highest_education && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Education Level</label>
                      <p className="text-gray-900 font-medium">{userData.highest_education}</p>
                    </div>
                  )}
                  {userData.work_experience_years && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Years of Experience</label>
                      <p className="text-gray-900 font-medium">{userData.work_experience_years} years</p>
                    </div>
                  )}
                  {userData.industry && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Industry</label>
                      <p className="text-gray-900 font-medium">{userData.industry}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preferences */}
            {(userData.preferred_destinations || userData.budget_range) && (
              <div className="rounded-2xl p-6 shadow-lg backdrop-blur-md bg-white/80">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Preferences</h3>
                <div className="space-y-4">
                  {userData.preferred_destinations && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Preferred Destinations</label>
                      <p className="text-gray-900 font-medium">{userData.preferred_destinations}</p>
                    </div>
                  )}
                  {userData.budget_range && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Budget Range</label>
                      <p className="text-gray-900 font-medium">${userData.budget_range}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="rounded-2xl p-6 shadow-lg backdrop-blur-md bg-white/80">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                <span>Custom Pricing</span>
              </h3>
              <button
                onClick={handleEditPricing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {customPricing ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>{customPricing ? 'Edit Pricing' : 'Set Custom Pricing'}</span>
              </button>
            </div>

            {loadingPricing ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Loading custom pricing...</p>
              </div>
            ) : !customPricing ? (
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No Custom Pricing Set</p>
                <p className="text-sm mt-1">This user is using the default pricing for all plans.</p>

                {/* Default Pricing Reference */}
                <div className="mt-8 p-4 bg-gray-100 rounded-xl border border-gray-300 max-w-2xl mx-auto">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Default Pricing Reference</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {AVAILABLE_PLANS.map(plan => (
                      <div key={plan.name} className="p-3 bg-white rounded-lg">
                        <p className="text-xs text-gray-500">{plan.label}</p>
                        <p className="text-lg font-bold text-gray-700">${plan.defaultPrice.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-5 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-bold">
                        CUSTOM PRICING ACTIVE
                      </span>
                      <span className="text-sm text-gray-600">
                        Currency: <span className="font-bold">{customPricing.currency}</span>
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleEditPricing}
                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                        title="Edit pricing"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleDeletePricing}
                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                        title="Delete all custom pricing"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Grid of all 4 plan prices */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 overflow-x-auto">
                    <div className="p-3 sm:p-4 bg-white rounded-lg shadow-sm border-2 border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">Silver Plan</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        ${Number(customPricing.silver_price).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">(Default: $299)</p>
                    </div>
                    <div className="p-3 sm:p-4 bg-white rounded-lg shadow-sm border-2 border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">Gold Plan</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        ${Number(customPricing.gold_price).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">(Default: $699)</p>
                    </div>
                    <div className="p-3 sm:p-4 bg-white rounded-lg shadow-sm border-2 border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">Diamond Plan</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        ${Number(customPricing.diamond_price).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">(Default: $1,600)</p>
                    </div>
                    <div className="p-3 sm:p-4 bg-white rounded-lg shadow-sm border-2 border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">Diamond Plus</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        ${Number(customPricing.diamond_plus_price).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">(Default: $1)</p>
                    </div>
                  </div>

                  {customPricing.notes && (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 mb-3">
                      <p className="text-xs font-semibold text-yellow-800 mb-1">Notes:</p>
                      <p className="text-sm text-yellow-900">{customPricing.notes}</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    Last updated: {formatDate(customPricing.updated_at)}
                    {customPricing.created_by_profile && (
                      <> by {customPricing.created_by_profile.full_name || customPricing.created_by_profile.email}</>
                    )}
                  </p>
                </div>

                {/* Default Pricing Reference */}
                <div className="mt-6 p-4 bg-gray-100 rounded-xl border border-gray-300">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Default Pricing Reference</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {AVAILABLE_PLANS.map(plan => (
                      <div key={plan.name} className="p-3 bg-white rounded-lg">
                        <p className="text-xs text-gray-500">{plan.label}</p>
                        <p className="text-lg font-bold text-gray-700">${plan.defaultPrice.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onboarding Tab */}
        {activeTab === 'onboarding' && (
          <div className="space-y-6">
            {!onboardingData ? (
              <div className="rounded-2xl p-6 shadow-lg backdrop-blur-md bg-white/80">
                <div className="text-center py-12 text-gray-500">
                  <Activity className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No Onboarding Data</p>
                  <p className="text-sm mt-1">This user hasn't started the onboarding process</p>
                </div>
              </div>
            ) : (
              <>
                {/* Onboarding Progress */}
                <div className="rounded-2xl p-6 shadow-lg backdrop-blur-md bg-white/80">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Activity className="w-6 h-6 text-blue-600" />
                    <span>Onboarding Progress</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Relocation Type</p>
                      <p className="text-lg font-bold text-blue-900 uppercase">{onboardingData.relocation_type}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Current Step</p>
                      <p className="text-lg font-bold text-green-900">Step {onboardingData.current_step}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Completed Steps</p>
                      <p className="text-lg font-bold text-purple-900">
                        {onboardingData.completed_steps?.length || 0} Steps
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${onboardingData.payment_completed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm font-medium">Payment {onboardingData.payment_completed ? 'Completed' : 'Pending'}</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${onboardingData.call_scheduled ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-sm font-medium">Call {onboardingData.call_scheduled ? 'Scheduled' : 'Not Scheduled'}</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${onboardingData.documents_uploaded ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm font-medium">Documents {onboardingData.documents_uploaded ? 'Uploaded' : 'Pending'}</span>
                    </div>
                  </div>
                </div>

                {/* Personal Details */}
                {onboardingData.personal_details && (
                  <div className="rounded-2xl p-6 shadow-lg backdrop-blur-md bg-white/80">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                      <User className="w-6 h-6 text-green-600" />
                      <span>Personal Details</span>
                    </h3>
                    {(() => {
                      const personal = typeof onboardingData.personal_details === 'string' 
                        ? JSON.parse(onboardingData.personal_details) 
                        : onboardingData.personal_details;
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Full Name</label>
                            <p className="text-gray-900 font-medium">{personal.fullName || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Email</label>
                            <p className="text-gray-900 font-medium">{personal.email || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Telephone</label>
                            <p className="text-gray-900 font-medium">{personal.telephone || 'Not provided'}</p>
                          </div>
                          {personal.address && (
                            <>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Street Address</label>
                                <p className="text-gray-900 font-medium">{personal.address.street || 'Not provided'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">City</label>
                                <p className="text-gray-900 font-medium">{personal.address.city || 'Not provided'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">State/Province</label>
                                <p className="text-gray-900 font-medium">{personal.address.state || 'Not provided'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">ZIP/Postal Code</label>
                                <p className="text-gray-900 font-medium">{personal.address.zip || 'Not provided'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Country</label>
                                <p className="text-gray-900 font-medium">{personal.address.country || 'Not provided'}</p>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Visa Check Information */}
                {onboardingData.visa_check && (
                  <div className="rounded-2xl p-6 shadow-lg backdrop-blur-md bg-white/80">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                      <Shield className="w-6 h-6 text-purple-600" />
                      <span>Visa Check Information</span>
                    </h3>
                    {(() => {
                      const visa = typeof onboardingData.visa_check === 'string' 
                        ? JSON.parse(onboardingData.visa_check) 
                        : onboardingData.visa_check;
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Citizenship</label>
                            <p className="text-gray-900 font-medium">{visa.citizenship || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Education Level</label>
                            <p className="text-gray-900 font-medium">{visa.education || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Education Country</label>
                            <p className="text-gray-900 font-medium">{visa.educationCountry || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Degree Recognized</label>
                            <p className="text-gray-900 font-medium">{visa.degreeRecognized || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Work Experience</label>
                            <p className="text-gray-900 font-medium">{visa.workExperience || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">English Level</label>
                            <p className="text-gray-900 font-medium">{visa.englishLevel || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Job Offer</label>
                            <p className="text-gray-900 font-medium">{visa.jobOffer || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Stay Longer Than 90 Days</label>
                            <p className="text-gray-900 font-medium">{visa.stayLongerThan90Days || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Special Regulation</label>
                            <p className="text-gray-900 font-medium">{visa.specialRegulation || 'Not provided'}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Payment Details */}
                {onboardingData.payment_details && onboardingData.payment_completed && (
                  <div className="rounded-2xl p-6 shadow-lg backdrop-blur-md bg-white/80">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                      <DollarSign className="w-6 h-6 text-green-600" />
                      <span>Payment Details</span>
                    </h3>
                    {(() => {
                      const payment = typeof onboardingData.payment_details === 'string' 
                        ? JSON.parse(onboardingData.payment_details) 
                        : onboardingData.payment_details;
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="p-4 bg-green-50 rounded-xl">
                            <label className="text-sm font-medium text-gray-600">Plan</label>
                            <p className="text-xl font-bold text-green-900 uppercase">{payment.plan}</p>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-xl">
                            <label className="text-sm font-medium text-gray-600">Amount</label>
                            <p className="text-xl font-bold text-blue-900">
                              {payment.currency} ${payment.amount}
                            </p>
                          </div>
                          <div className="p-4 bg-purple-50 rounded-xl">
                            <label className="text-sm font-medium text-gray-600">Transaction ID</label>
                            <p className="text-sm font-bold text-purple-900 truncate">{payment.transactionId}</p>
                          </div>
                          <div className="p-4 bg-orange-50 rounded-xl">
                            <label className="text-sm font-medium text-gray-600">Date</label>
                            <p className="text-sm font-bold text-orange-900">
                              {formatDate(payment.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Call Details */}
                {onboardingData.call_details && onboardingData.call_scheduled && (
                  <div className="rounded-2xl p-6 shadow-lg backdrop-blur-md bg-white/80">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                      <Phone className="w-6 h-6 text-blue-600" />
                      <span>Call Details</span>
                    </h3>
                    {(() => {
                      const call = typeof onboardingData.call_details === 'string' 
                        ? JSON.parse(onboardingData.call_details) 
                        : onboardingData.call_details;
                      return Object.keys(call).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {call.date && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Scheduled Date</label>
                              <p className="text-gray-900 font-medium">{formatDate(call.date)}</p>
                            </div>
                          )}
                          {call.time && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Scheduled Time</label>
                              <p className="text-gray-900 font-medium">{call.time}</p>
                            </div>
                          )}
                          {call.notes && (
                            <div className="md:col-span-2">
                              <label className="text-sm font-medium text-gray-500">Notes</label>
                              <p className="text-gray-900 font-medium">{call.notes}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No call details available</p>
                      );
                    })()}
                  </div>
                )}

                {/* Uploaded Documents */}
                {onboardingData.documents && onboardingData.documents_uploaded && (
                  <div className="rounded-2xl p-6 shadow-lg backdrop-blur-md bg-white/80">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                      <FileText className="w-6 h-6 text-orange-600" />
                      <span>Uploaded Documents</span>
                    </h3>
                    {(() => {
                      const docs = typeof onboardingData.documents === 'string' 
                        ? JSON.parse(onboardingData.documents) 
                        : onboardingData.documents;
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {docs.passport && (
                            <div className="p-4 bg-blue-50 rounded-xl">
                              <div className="flex items-center space-x-3 mb-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <h4 className="font-semibold text-gray-900">Passport</h4>
                              </div>
                              <p className="text-xs text-gray-600 mb-3 truncate">{docs.passport}</p>
                              <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                <Download className="w-4 h-4 inline mr-1" />
                                Download
                              </button>
                            </div>
                          )}
                          {docs.jobOffer && (
                            <div className="p-4 bg-green-50 rounded-xl">
                              <div className="flex items-center space-x-3 mb-2">
                                <FileText className="w-5 h-5 text-green-600" />
                                <h4 className="font-semibold text-gray-900">Job Offer</h4>
                              </div>
                              <p className="text-xs text-gray-600 mb-3 truncate">{docs.jobOffer}</p>
                              <button className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                                <Download className="w-4 h-4 inline mr-1" />
                                Download
                              </button>
                            </div>
                          )}
                          {docs.educationalCertificates && docs.educationalCertificates.length > 0 && (
                            <div className="p-4 bg-purple-50 rounded-xl">
                              <div className="flex items-center space-x-3 mb-2">
                                <FileText className="w-5 h-5 text-purple-600" />
                                <h4 className="font-semibold text-gray-900">Educational Certificates</h4>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{docs.educationalCertificates.length} file(s)</p>
                              {docs.educationalCertificates.map((cert, idx) => (
                                <div key={idx} className="mb-2">
                                  <p className="text-xs text-gray-500 mb-1 truncate">{cert}</p>
                                  <button className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                                    <Download className="w-4 h-4 inline mr-1" />
                                    Download Certificate {idx + 1}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {docs.experienceLetters && docs.experienceLetters.length > 0 && (
                            <div className="p-4 bg-orange-50 rounded-xl">
                              <div className="flex items-center space-x-3 mb-2">
                                <FileText className="w-5 h-5 text-orange-600" />
                                <h4 className="font-semibold text-gray-900">Experience Letters</h4>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{docs.experienceLetters.length} file(s)</p>
                              {docs.experienceLetters.map((exp, idx) => (
                                <div key={idx} className="mb-2">
                                  <p className="text-xs text-gray-500 mb-1 truncate">{exp}</p>
                                  <button className="w-full px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm">
                                    <Download className="w-4 h-4 inline mr-1" />
                                    Download Letter {idx + 1}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Timestamps */}
                <div className="rounded-2xl p-6 shadow-lg backdrop-blur-md bg-white/80">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Calendar className="w-6 h-6 text-gray-600" />
                    <span>Timeline</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Onboarding Started</label>
                      <p className="text-gray-900 font-medium">{formatDate(onboardingData.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-gray-900 font-medium">{formatDate(onboardingData.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="rounded-2xl p-6 shadow-lg backdrop-blur-md bg-white/80">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Job Applications</h3>
            {userApplications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No Applications Yet</p>
                <p className="text-sm mt-1">This user hasn't submitted any job applications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userApplications.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          app.status === 'accepted' ? 'bg-green-100' :
                          (app.status === 'pending' || app.status === 'submitted') ? 'bg-yellow-100' :
                          app.status === 'rejected' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {getStatusIcon(app.status)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {app['Job-Leads']?.jobtitle || 'Unknown Position'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {app['Job-Leads']?.companyname || 'Unknown Company'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {app['Job-Leads']?.location || 'Location not specified'}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Applied {getTimeAgo(app.applied_at)} • Updated {getTimeAgo(app.updated_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                        <button className="mt-2 p-2 hover:bg-gray-200 rounded-lg transition-colors">
                          <Eye className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="rounded-2xl p-6 shadow-lg backdrop-blur-md bg-white/80">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Documents</h3>
            {userDocuments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No Documents Yet</p>
                <p className="text-sm mt-1">This user hasn't uploaded any documents</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        doc.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {doc.verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{doc.document_type}</h4>
                    <p className="text-xs text-gray-500 mb-3">
                      Uploaded {getTimeAgo(doc.uploaded_at)}
                    </p>
                    <div className="flex items-center space-x-2">
                      <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        <Download className="w-4 h-4 inline mr-1" />
                        Download
                      </button>
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="rounded-2xl p-6 shadow-lg backdrop-blur-md bg-white/80">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Payment History</h3>
            {userPayments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No Payments Yet</p>
                <p className="text-sm mt-1">This user hasn't made any payments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          payment.status === 'completed' ? 'bg-green-100' :
                          payment.status === 'pending' ? 'bg-yellow-100' :
                          payment.status === 'failed' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {getStatusIcon(payment.status)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">
                            ${Number(payment.amount || 0).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">{payment.description || 'Payment'}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(payment.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                        {payment.payment_method && (
                          <p className="text-xs text-gray-500 mt-2">{payment.payment_method}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={() => !savingPricing && setShowPricingModal(false)}
          />
          <div
            className="relative w-full max-w-lg my-8 rounded-2xl shadow-2xl border backdrop-blur-md z-[101] max-h-[90vh] flex flex-col"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            {/* Header - Fixed */}
            <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  <span className="text-lg sm:text-2xl">{customPricing ? 'Edit Custom Pricing' : 'Set Custom Pricing'}</span>
                </h3>
                <button
                  onClick={() => !savingPricing && setShowPricingModal(false)}
                  disabled={savingPricing}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  <XIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Set custom pricing for all plans. Leave blank to use default pricing for that plan.
                </p>

                {/* Silver Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Silver Plan Price <span className="text-gray-400">(Default: $299)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={pricingForm.silverPrice}
                      onChange={(e) => setPricingForm({ ...pricingForm, silverPrice: e.target.value })}
                      disabled={savingPricing}
                      placeholder="299"
                      className="w-full pl-8 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                      style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
                    />
                  </div>
                </div>

                {/* Gold Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gold Plan Price <span className="text-gray-400">(Default: $699)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={pricingForm.goldPrice}
                      onChange={(e) => setPricingForm({ ...pricingForm, goldPrice: e.target.value })}
                      disabled={savingPricing}
                      placeholder="699"
                      className="w-full pl-8 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                      style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
                    />
                  </div>
                </div>

                {/* Diamond Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diamond Plan Price <span className="text-gray-400">(Default: $1,600)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={pricingForm.diamondPrice}
                      onChange={(e) => setPricingForm({ ...pricingForm, diamondPrice: e.target.value })}
                      disabled={savingPricing}
                      placeholder="1600"
                      className="w-full pl-8 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                      style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
                    />
                  </div>
                </div>

                {/* Diamond Plus Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diamond Plus Price <span className="text-gray-400">(Default: $1)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={pricingForm.diamondPlusPrice}
                      onChange={(e) => setPricingForm({ ...pricingForm, diamondPlusPrice: e.target.value })}
                      disabled={savingPricing}
                      placeholder="1"
                      className="w-full pl-8 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
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
                    value={pricingForm.currency}
                    onChange={(e) => setPricingForm({ ...pricingForm, currency: e.target.value })}
                    disabled={savingPricing}
                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                    style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CRC">CRC (₡)</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={pricingForm.notes}
                    onChange={(e) => setPricingForm({ ...pricingForm, notes: e.target.value })}
                    disabled={savingPricing}
                    placeholder="Add any notes about this custom pricing..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 resize-none"
                    style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
                  />
                </div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex-shrink-0">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowPricingModal(false)}
                  disabled={savingPricing}
                  className="w-full sm:flex-1 px-4 sm:px-6 py-3 rounded-xl font-semibold border transition-all duration-200 disabled:opacity-50"
                  style={{
                    borderColor: 'rgba(0, 50, 83, 0.3)',
                    color: 'rgba(0, 50, 83, 1)',
                    backgroundColor: 'white'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCustomPricing}
                  disabled={savingPricing}
                  className="w-full sm:flex-1 px-4 sm:px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  style={{ backgroundColor: 'rgba(0, 50, 83, 1)' }}
                >
                  {savingPricing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Pricing</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />
          <div
            className="relative w-full max-w-md rounded-2xl shadow-2xl border backdrop-blur-md z-[101]"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
                Delete User?
              </h3>

              <p className="text-gray-600 text-center mb-2">
                Are you sure you want to delete <strong>{userData?.full_name || userData?.email}</strong>?
              </p>

              <p className="text-sm text-red-600 text-center mb-6">
                This action cannot be undone. All user data including applications, documents, and payments will be permanently deleted.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold border transition-all duration-200 disabled:opacity-50"
                  style={{
                    borderColor: 'rgba(0, 50, 83, 0.3)',
                    color: 'rgba(0, 50, 83, 1)',
                    backgroundColor: 'white'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}
                >
                  {deleting ? (
                    <span className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </span>
                  ) : (
                    'Delete User'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
