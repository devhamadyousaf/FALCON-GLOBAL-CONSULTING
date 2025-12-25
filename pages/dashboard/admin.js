import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  FileText,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  UserCheck,
  UserX,
  TrendingUp,
  DollarSign,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  Plus,
  Mail
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated, supabase, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Dynamic data states
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeApplications: 0,
    totalRevenue: 0,
    pendingReviews: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Job Leads and Reports states
  const [jobLeads, setJobLeads] = useState([]);
  const [showJobLeadsModal, setShowJobLeadsModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [reportStats, setReportStats] = useState(null);
  const [loadingJobLeads, setLoadingJobLeads] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null); // userId being updated
  const [userJobLeads, setUserJobLeads] = useState([]); // Users with job leads count
  const [selectedUserLeads, setSelectedUserLeads] = useState(null); // Selected user's job leads
  const [showUserLeadsModal, setShowUserLeadsModal] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState(null); // ID of expanded job to show details
  const [dataInitialized, setDataInitialized] = useState(false); // Track if initial data load happened

  useEffect(() => {
    // Don't run if auth is still loading
    if (authLoading) {
      console.log('⏳ Auth still loading, waiting...');
      return;
    }

    if (!isAuthenticated || !user) {
      console.log('❌ Not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      console.log('❌ Not admin user, redirecting to customer dashboard');
      router.push('/dashboard/customer');
      return;
    }

    // Ensure supabase client is ready
    if (!supabase) {
      console.warn('⚠️ Supabase client not ready yet');
      return;
    }

    // Load data when auth is ready and user is admin
    console.log('✅ Auth ready, loading admin data...');
    loadAdminData();
  }, [isAuthenticated, user, router, authLoading, supabase]);

  // Refresh data when returning to the page (when it becomes visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && user?.role === 'admin') {
        console.log('🔄 Page visible again, refreshing data...');
        loadAdminData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, user]);

  // Reload data when navigating back to this page
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (url === '/dashboard/admin' && isAuthenticated && user?.role === 'admin') {
        console.log('🔄 Navigated back to admin dashboard, refreshing data...');
        setTimeout(() => loadAdminData(), 100); // Small delay to ensure page is ready
      }
    };

    router.events?.on('routeChangeComplete', handleRouteChange);
    return () => router.events?.off('routeChangeComplete', handleRouteChange);
  }, [isAuthenticated, user, router]);

  const loadAdminData = async () => {
    console.log('📊 Starting admin data load...');
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        fetchStats(),
        fetchRecentUsers(),
        fetchRecentApplications(),
        fetchAllUsers(),
        fetchAllApplications(),
        fetchNotifications(),
        fetchUserJobLeads()
      ]);
      
      // Log any failures
      results.forEach((result, index) => {
        const names = ['Stats', 'RecentUsers', 'RecentApplications', 'AllUsers', 'AllApplications', 'Notifications', 'UserJobLeads'];
        if (result.status === 'rejected') {
          console.error(`❌ Failed to load ${names[index]}:`, result.reason);
        } else {
          console.log(`✅ ${names[index]} loaded successfully`);
        }
      });
      
      console.log('✅ Admin data load complete');
    } catch (error) {
      console.error('❌ Critical error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('📊 Fetching stats...');
      // Total Users
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error('Error counting users:', usersError);
      }

      // Active Applications (users with onboarding complete)
      const { count: activeApplications, error: activeError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('onboarding_complete', true);

      if (activeError) {
        console.error('Error counting active apps:', activeError);
      }

      // Total Revenue (sum of completed payments)
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
      }

      const totalRevenue = payments?.reduce((sum, payment) => sum + Number(payment.amount || 0), 0) || 0;

      // Pending Reviews (users with onboarding not complete)
      const { count: pendingReviews, error: pendingError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('onboarding_complete', false);

      if (pendingError) {
        console.error('Error counting pending:', pendingError);
      }

      const newStats = {
        totalUsers: totalUsers || 0,
        activeApplications: activeApplications || 0,
        totalRevenue: totalRevenue,
        pendingReviews: pendingReviews || 0
      };

      console.log('📊 Stats fetched:', newStats);
      setStats(newStats);
    } catch (error) {
      console.error('❌ Exception fetching stats:', error);
      // Set default values on error
      setStats({
        totalUsers: 0,
        activeApplications: 0,
        totalRevenue: 0,
        pendingReviews: 0
      });
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at, onboarding_complete')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      console.log('Fetched users:', data); // Debug log

      // Get application counts for each user
      const usersWithCounts = await Promise.all(
        (data || []).map(async (userData) => {
          const { count } = await supabase
            .from('job_applications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userData.id);

          return {
            ...userData,
            applicationCount: count || 0
          };
        })
      );

      console.log('Users with counts:', usersWithCounts); // Debug log
      setRecentUsers(usersWithCounts);
    } catch (error) {
      console.error('Error fetching recent users:', error);
      setRecentUsers([]); // Set empty array on error
    }
  };

  const fetchRecentApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          status,
          applied_at,
          user_id,
          profiles!inner(full_name, email),
          Job-Leads!inner(jobTitle, companyName)
        `)
        .order('applied_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentApplications(data || []);
    } catch (error) {
      console.error('Error fetching recent applications:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at, onboarding_complete')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all users:', error);
        throw error;
      }

      console.log('Fetched all users:', data); // Debug log

      // Get application counts for each user
      const usersWithCounts = await Promise.all(
        (data || []).map(async (userData) => {
          const { count } = await supabase
            .from('job_applications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userData.id);

          return {
            ...userData,
            applicationCount: count || 0
          };
        })
      );

      console.log('All users with counts:', usersWithCounts); // Debug log
      setAllUsers(usersWithCounts);
    } catch (error) {
      console.error('Error fetching all users:', error);
      setAllUsers([]); // Set empty array on error
    }
  };

  const fetchAllApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          status,
          applied_at,
          user_id,
          profiles!inner(full_name, email),
          Job-Leads!inner(jobTitle, companyName)
        `)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setAllApplications(data || []);
    } catch (error) {
      console.error('Error fetching all applications:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setNotifications(data?.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        time: getTimeAgo(n.created_at),
        type: n.type,
        read: n.read
      })) || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set default notifications if none found
      setNotifications([]);
    }
  };

  const fetchUserJobLeads = async () => {
    try {
      // Get all profiles with their emails
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, onboarding_complete')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get job leads count for each user email
      const usersWithJobLeads = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { count } = await supabase
            .from('Job-Leads')
            .select('*', { count: 'exact', head: true })
            .eq('email', profile.email);

          return {
            ...profile,
            jobLeadsCount: count || 0
          };
        })
      );

      // Filter only users who have job leads and sort by count
      const filteredUsers = usersWithJobLeads
        .filter(u => u.jobLeadsCount > 0)
        .sort((a, b) => b.jobLeadsCount - a.jobLeadsCount)
        .slice(0, 5); // Get top 5 users

      setUserJobLeads(filteredUsers);
    } catch (error) {
      console.error('Error fetching user job leads:', error);
      setUserJobLeads([]);
    }
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

  const markAsRead = async (notificationId) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);
      
      setNotifications(notifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false);
      
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setDeleting(true);
    try {
      // Delete user's onboarding data
      await supabase
        .from('onboarding_data')
        .delete()
        .eq('user_id', userToDelete.id);

      // Delete user's job applications
      await supabase
        .from('job_applications')
        .delete()
        .eq('user_id', userToDelete.id);

      // Delete user's documents
      await supabase
        .from('documents')
        .delete()
        .eq('user_id', userToDelete.id);

      // Delete user's payments
      await supabase
        .from('payments')
        .delete()
        .eq('user_id', userToDelete.id);

      // Delete user's notifications
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userToDelete.id);

      // Delete user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        alert('Error deleting user profile: ' + profileError.message);
        setDeleting(false);
        return;
      }

      // Refresh the user lists
      await Promise.all([
        fetchRecentUsers(),
        fetchAllUsers(),
        fetchStats()
      ]);

      alert('User deleted successfully!');
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  // Fetch Job Leads
  const fetchJobLeads = async () => {
    setLoadingJobLeads(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/admin/job-leads', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setJobLeads(result.jobLeads || []);
      } else {
        console.error('Error fetching job leads:', result.error);
        alert('Error fetching job leads');
      }
    } catch (error) {
      console.error('Error fetching job leads:', error);
      alert('Error fetching job leads: ' + error.message);
    } finally {
      setLoadingJobLeads(false);
    }
  };

  // View Job Leads
  const handleViewJobLeads = async () => {
    console.log('🔍 Opening job leads modal...');
    setShowJobLeadsModal(true);
    setLoadingJobLeads(true);
    await fetchJobLeads();
  };

  // Close Job Leads Modal
  const handleCloseJobLeadsModal = () => {
    console.log('❌ Closing job leads modal...');
    setShowJobLeadsModal(false);
    setLoadingJobLeads(false);
    // Clear job leads data when closing
    setJobLeads([]);
  };

  // View User's Job Leads
  const handleViewUserJobLeads = async (userEmail) => {
    console.log('🔍 Opening user leads modal for:', userEmail);
    setLoadingJobLeads(true);
    setShowUserLeadsModal(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`/api/admin/job-leads?email=${encodeURIComponent(userEmail)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setSelectedUserLeads({
          email: userEmail,
          jobs: result.jobLeads || []
        });
      } else {
        console.error('Error fetching user job leads:', result.error);
        alert('Error fetching user job leads');
      }
    } catch (error) {
      console.error('Error fetching user job leads:', error);
      alert('Error fetching user job leads: ' + error.message);
    } finally {
      setLoadingJobLeads(false);
    }
  };

  // Close User Leads Modal
  const handleCloseUserLeadsModal = () => {
    console.log('❌ Closing user leads modal...');
    setShowUserLeadsModal(false);
    setLoadingJobLeads(false);
    setSelectedUserLeads(null);
  };

  // Fetch Statistics for Reports
  const fetchReportStatistics = async () => {
    console.log('=== fetchReportStatistics called ===');
    setLoadingReports(true);
    try {
      console.log('Getting session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('Session data:', sessionData);
      console.log('Session error:', sessionError);
      const token = sessionData?.session?.access_token;
      console.log('Token available:', !!token);
      console.log('Token length:', token?.length);

      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('Fetching statistics from API...');
      const response = await fetch('/api/admin/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Result:', result);

      if (result.success) {
        setReportStats(result.statistics);
        console.log('Statistics loaded successfully');
      } else {
        console.error('Error fetching statistics:', result.error);
        alert('Error fetching statistics: ' + result.error);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      alert('Error fetching statistics: ' + error.message);
    } finally {
      setLoadingReports(false);
      console.log('=== fetchReportStatistics completed ===');
    }
  };

  // View Reports
  const handleViewReports = async () => {
    console.log('🔍 Opening reports modal...');
    setShowReportsModal(true);
    setLoadingReports(true);
    await fetchReportStatistics();
  };

  // Close Reports Modal
  const handleCloseReportsModal = () => {
    console.log('❌ Closing reports modal...');
    setShowReportsModal(false);
    setLoadingReports(false);
    setReportStats(null);
  };

  // Export Data
  const handleExportData = async (type = 'all', format = 'json') => {
    console.log('=== handleExportData called ===');
    console.log('Type:', type, 'Format:', format);
    setExporting(true);
    try {
      console.log('Getting session for export...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('Session data:', sessionData);
      console.log('Session error:', sessionError);
      const token = sessionData?.session?.access_token;
      console.log('Token available:', !!token);
      console.log('Token length:', token?.length);

      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('Fetching export data from API...');
      const response = await fetch(`/api/admin/export?type=${type}&format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Export error response:', errorData);
        throw new Error(errorData.error || 'Export failed');
      }

      // Download the file
      console.log('Creating download blob...');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${type}_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('Export completed successfully');
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data: ' + error.message);
    } finally {
      setExporting(false);
      console.log('=== handleExportData completed ===');
    }
  };

  // Update User Onboarding Status
  const handleUpdateUserStatus = async (userId, onboardingComplete) => {
    console.log('=== handleUpdateUserStatus called ===');
    console.log('User ID:', userId);
    console.log('Onboarding Complete:', onboardingComplete);

    setUpdatingStatus(userId);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('Session data:', sessionData);

      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Failed to get session: ' + sessionError.message);
      }

      const token = sessionData?.session?.access_token;
      console.log('Token available:', !!token);

      if (!token) {
        throw new Error('No authentication token available. Please login again.');
      }

      console.log('Making API request...');
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

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok && result.success) {
        console.log('Status update successful, refreshing data...');
        
        // Refresh user lists and wait for completion
        await Promise.all([
          fetchRecentUsers(),
          fetchAllUsers(),
          fetchStats()
        ]);
        
        console.log('User data refreshed successfully');
        
        // Force a small delay to ensure state updates propagate
        await new Promise(resolve => setTimeout(resolve, 100));
        
        alert(`User onboarding status updated to ${onboardingComplete ? 'Complete' : 'Incomplete'}!`);
      } else {
        console.error('Error updating user status:', result.error);
        alert(`Error updating user status: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status: ' + error.message);
    } finally {
      // Clear updating status after everything completes
      setUpdatingStatus(null);
      console.log('=== handleUpdateUserStatus completed ===');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      router.push('/');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user || user.role !== 'admin') return null;

  // Format stats for display
  const statsDisplay = [
    {
      id: 1,
      name: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      name: 'Active Applications',
      value: stats.activeApplications.toLocaleString(),
      icon: FileText,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 3,
      name: 'Revenue (MTD)',
      value: `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 4,
      name: 'Pending Reviews',
      value: stats.pendingReviews.toLocaleString(),
      icon: Clock,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const navigationTabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'applications', name: 'Applications', icon: FileText },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  // Display users list based on active tab
  const displayUsers = activeTab === 'users' ? allUsers : recentUsers;
  const displayApplications = activeTab === 'applications' ? allApplications : recentApplications;

  return (
    <div className="min-h-screen relative">
      {/* Background with opacity */}
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

      {/* Content wrapper */}
      <div className="relative z-10">
      {/* Header */}
      <header className="sticky top-0 z-30 pt-4 px-6">
        <div
          className="backdrop-blur-lg px-8 py-3 transition-all duration-300"
          style={{
            backgroundColor: '#fbf7eb',
            border: '2px solid rgba(187, 40, 44, 0.8)',
            borderRadius: '50px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            minHeight: '90px'
          }}
        >
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg transition-colors duration-200"
                style={{ color: 'rgba(0, 50, 83, 0.8)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(0, 50, 83, 1)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(0, 50, 83, 0.8)'}
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <img
                src="/klaus_logo.jpeg"
                alt="Falcon Global Consulting"
                className="h-20 w-auto object-contain"
              />
              <div className="hidden md:block ml-4">
                <h1 className="text-lg font-bold" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                  Admin Dashboard
                </h1>
                <p className="text-sm" style={{ color: 'rgba(0, 50, 83, 0.7)' }}>
                  Manage your platform
                </p>
              </div>
            </div>

            {/* Search & User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(0, 50, 83, 0.5)' }} />
                <input
                  type="text"
                  placeholder="Search users, applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none w-64"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderColor: 'rgba(0, 50, 83, 0.2)',
                    color: 'rgba(0, 50, 83, 1)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(187, 40, 44, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 50, 83, 0.2)';
                  }}
                />
              </div>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg transition-colors duration-200 relative"
                style={{ color: 'rgba(0, 50, 83, 0.8)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 50, 83, 0.1)';
                  e.currentTarget.style.color = 'rgba(0, 50, 83, 1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(0, 50, 83, 0.8)';
                }}
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
              <div className="flex items-center space-x-3">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=003253&color=fff&bold=true`}
                  alt={user.name || user.email}
                  className="w-10 h-10 rounded-full object-cover"
                  style={{ border: '2px solid rgba(187, 40, 44, 1)' }}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=003253&color=fff&bold=true`;
                  }}
                />
                <div className="hidden md:block">
                  <p className="text-sm font-semibold" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                    {user.name || 'Admin'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 font-bold text-sm text-white transition-all duration-200"
                  style={{
                    backgroundColor: 'rgba(187, 40, 44, 1)',
                    borderRadius: '20px',
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(187, 40, 44, 0.9)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(187, 40, 44, 1)';
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 border-t mt-3 pt-3 overflow-x-auto" style={{ borderColor: 'rgba(187, 40, 44, 0.3)' }}>
            {navigationTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'settings') {
                    setShowSettings(true);
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 font-bold text-sm transition-colors whitespace-nowrap rounded-lg"
                style={{
                  color: activeTab === tab.id ? 'rgba(187, 40, 44, 1)' : 'rgba(0, 50, 83, 0.8)',
                  backgroundColor: activeTab === tab.id ? 'rgba(187, 40, 44, 0.1)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = 'rgba(0, 50, 83, 1)';
                    e.currentTarget.style.backgroundColor = 'rgba(0, 50, 83, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = 'rgba(0, 50, 83, 0.8)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Welcome Section */}
        <div
          className="rounded-2xl p-8 mb-8 shadow-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 50, 83, 1) 0%, rgba(0, 70, 120, 1) 100%)',
          }}
        >
          <div>
            <h2 className="text-3xl font-bold mb-2 text-white">Welcome, Admin!</h2>
            <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Manage users, applications, and content from your dashboard
            </p>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            // Loading skeletons
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl p-6 shadow-lg border backdrop-blur-md animate-pulse"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', borderColor: 'rgba(255, 255, 255, 0.3)' }}>
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : (
            statsDisplay.map((stat) => (
              <div
                key={stat.id}
                className="rounded-2xl p-6 shadow-lg border backdrop-blur-md hover:shadow-xl transition-all duration-300"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.3)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Users */}
          <div
            className="rounded-2xl p-6 shadow-lg border backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Users className="w-6 h-6 text-blue-600" />
                <span>Recent Users</span>
              </h3>
              <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm">
                <Plus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>

            <div className="space-y-4">
              {loading ? (
                // Loading skeleton
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-40 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  </div>
                ))
              ) : recentUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No users found</p>
                </div>
              ) : (
                recentUsers.map((userData) => (
                  <div
                    key={userData.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.full_name || userData.email)}&background=random`}
                        alt={userData.full_name || userData.email}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{userData.full_name || 'No Name'}</p>
                        <p className="text-sm text-gray-500">{userData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        userData.onboarding_complete ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {userData.onboarding_complete ? 'Active' : 'Pending'}
                      </span>
                      {!userData.onboarding_complete && (
                        <button
                          onClick={() => handleUpdateUserStatus(userData.id, true)}
                          disabled={updatingStatus === userData.id}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Mark Onboarding Complete"
                        >
                          {updatingStatus === userData.id ? 'Updating...' : 'Complete'}
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/dashboard/admin/user/${userData.id}`)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="View User"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Edit User">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => {
                          setUserToDelete(userData);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Applications */}
          <div
            className="rounded-2xl p-6 shadow-lg border backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <FileText className="w-6 h-6 text-purple-600" />
                <span>Users with Job Leads</span>
              </h3>
            </div>

            <div className="space-y-4">
              {loading ? (
                // Loading skeleton
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-5 w-40 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
                  </div>
                ))
              ) : userJobLeads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No users with job leads found</p>
                </div>
              ) : (
                userJobLeads.map((userLead) => (
                  <div
                    key={userLead.id}
                    onClick={() => handleViewUserJobLeads(userLead.email)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userLead.full_name || userLead.email)}&background=random`}
                        alt={userLead.full_name || userLead.email}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{userLead.full_name || 'No Name'}</p>
                        <p className="text-sm text-gray-500">{userLead.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{userLead.jobLeadsCount}</p>
                        <p className="text-xs text-gray-500">Job Leads</p>
                      </div>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                        View Jobs
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="rounded-2xl p-6 shadow-lg border backdrop-blur-md"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.3)'
          }}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <button
              onClick={() => setActiveTab('users')}
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl">
              <Users className="w-5 h-5" />
              <span>Manage Users</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/admin/bulk-pricing')}
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl">
              <DollarSign className="w-5 h-5" />
              <span>Bulk Pricing</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/admin/referral-codes')}
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <span>Referral Codes</span>
            </button>
            <button
              onClick={handleViewReports}
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl">
              <FileText className="w-5 h-5" />
              <span>View Reports</span>
            </button>
            <button
              onClick={handleViewJobLeads}
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl">
              <FileText className="w-5 h-5" />
              <span>View Job Leads</span>
            </button>
            <button
              onClick={() => handleExportData('all', 'json')}
              disabled={exporting}
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
              <Download className="w-5 h-5" />
              <span>{exporting ? 'Exporting...' : 'Export Data'}</span>
            </button>
          </div>
        </div>
        </>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div
            className="rounded-2xl p-6 shadow-lg border backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <Users className="w-7 h-7 text-blue-600" />
                <span>User Management</span>
              </h3>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-5 h-5" />
                <span>Add New User</span>
              </button>
            </div>

            <div className="space-y-4">
              {loading ? (
                // Loading skeleton
                [1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-xl animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-5 w-40 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-48 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 w-32 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                  </div>
                ))
              ) : displayUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No users found</p>
                  <p className="text-sm mt-1">Users will appear here once they sign up</p>
                </div>
              ) : (
                displayUsers.map((userData) => (
                  <div
                    key={userData.id}
                    className="flex items-center justify-between p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.full_name || userData.email)}&background=random`}
                        alt={userData.full_name || userData.email}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">{userData.full_name || 'No Name'}</p>
                        <p className="text-sm text-gray-500">{userData.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Joined {getTimeAgo(userData.created_at)} • {userData.applicationCount || 0} applications
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                        userData.onboarding_complete ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {userData.onboarding_complete ? 'Active' : 'Pending'}
                      </span>
                      {!userData.onboarding_complete && (
                        <button
                          onClick={() => handleUpdateUserStatus(userData.id, true)}
                          disabled={updatingStatus === userData.id}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Mark Onboarding Complete"
                        >
                          {updatingStatus === userData.id ? 'Updating...' : 'Complete'}
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/dashboard/admin/user/${userData.id}`)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="View User"
                      >
                        <Eye className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Edit User">
                        <Edit className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={() => {
                          setUserToDelete(userData);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div
            className="rounded-2xl p-6 shadow-lg border backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <FileText className="w-7 h-7 text-purple-600" />
                <span>Applications Management</span>
              </h3>
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter className="w-5 h-5" />
                  <span>Filter</span>
                </button>
                <button
                  onClick={() => handleExportData('applications', 'json')}
                  disabled={exporting}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Download className="w-5 h-5" />
                  <span>{exporting ? 'Exporting...' : 'Export'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                // Loading skeleton
                [1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-xl animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-5 w-40 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-48 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 w-32 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                  </div>
                ))
              ) : displayApplications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No applications found</p>
                  <p className="text-sm mt-1">Applications will appear here once users start applying</p>
                </div>
              ) : (
                displayApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        app.status === 'accepted' ? 'bg-green-100' :
                        (app.status === 'pending' || app.status === 'submitted') ? 'bg-yellow-100' : 
                        app.status === 'rejected' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {app.status === 'accepted' ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (app.status === 'pending' || app.status === 'submitted') ? (
                          <Clock className="w-6 h-6 text-yellow-600" />
                        ) : app.status === 'rejected' ? (
                          <AlertCircle className="w-6 h-6 text-red-600" />
                        ) : (
                          <Activity className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">{app.profiles?.full_name || 'Unknown User'}</p>
                        <p className="text-sm text-gray-500">{app['Job-Leads']?.jobTitle || 'Job Application'}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {app['Job-Leads']?.companyName || 'Unknown Company'} • {getTimeAgo(app.applied_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                          app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          (app.status === 'pending' || app.status === 'submitted') ? 'bg-yellow-100 text-yellow-700' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <Eye className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div
            className="rounded-2xl p-6 shadow-lg border backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <Edit className="w-7 h-7 text-indigo-600" />
                <span>Content Management</span>
              </h3>
            </div>

            <div className="text-center py-16">
              <Edit className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Content Management Coming Soon</h4>
              <p className="text-gray-500">This feature will allow you to manage website content dynamically.</p>
            </div>
          </div>
        )}
      </div>

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:items-start sm:justify-end sm:p-6">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
            onClick={() => setShowNotifications(false)}
          />
          <div
            className="relative w-full max-w-sm sm:mt-20 sm:mr-4 rounded-xl shadow-2xl border backdrop-blur-md z-[101]"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                  Notifications
                </h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4" style={{ color: 'rgba(0, 50, 83, 0.8)' }} />
                </button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                      notification.read ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'
                    }`}
                    style={{ borderColor: 'rgba(0, 50, 83, 0.1)' }}
                  >
                    <div className="flex items-start space-x-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        notification.type === 'success' ? 'bg-green-500' :
                        notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-semibold text-sm ${notification.read ? 'text-gray-500' : 'text-gray-900'}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full ml-2 flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="w-full mt-4 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'rgba(0, 50, 83, 1)' }}
              >
                Mark All as Read {unreadCount > 0 && `(${unreadCount})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
            onClick={() => setShowSettings(false)}
          />
          <div
            className="relative w-full max-w-2xl rounded-2xl shadow-2xl border backdrop-blur-md max-h-[90vh] overflow-y-auto z-[101]"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                  Admin Settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-6 h-6" style={{ color: 'rgba(0, 50, 83, 0.8)' }} />
                </button>
              </div>

              <div className="space-y-6">
                {/* System Settings */}
                <div>
                  <h4 className="text-lg font-semibold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                    System Configuration
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform Name
                      </label>
                      <input
                        type="text"
                        defaultValue="Falcon Global Consulting"
                        className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
                        style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Support Email
                      </label>
                      <input
                        type="email"
                        defaultValue="admin@falconglobalconsulting.com"
                        className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
                        style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Users per Month
                      </label>
                      <input
                        type="number"
                        defaultValue="1000"
                        className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
                        style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Feature Toggles */}
                <div>
                  <h4 className="text-lg font-semibold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                    Feature Management
                  </h4>
                  <div className="space-y-3">
                    {['Job Applications', 'Visa Processing', 'Housing Services', 'Auto Notifications', 'Payment Gateway'].map((feature) => (
                      <label key={feature} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                        <span className="text-gray-700">{feature}</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 rounded"
                          style={{ accentColor: 'rgba(0, 50, 83, 1)' }}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Security */}
                <div>
                  <h4 className="text-lg font-semibold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                    Security
                  </h4>
                  <div className="space-y-3">
                    <button
                      className="w-full px-4 py-3 rounded-xl font-semibold text-white transition-all duration-200"
                      style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}
                    >
                      Change Admin Password
                    </button>
                    <button
                      className="w-full px-4 py-3 rounded-xl font-semibold border transition-all duration-200"
                      style={{ borderColor: 'rgba(0, 50, 83, 0.3)', color: 'rgba(0, 50, 83, 1)' }}
                    >
                      View Activity Logs
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  className="w-full px-6 py-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg"
                  style={{ backgroundColor: 'rgba(0, 50, 83, 1)' }}
                >
                  Save All Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-blue-900 text-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} FALCON GLOBAL CONSULTING. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />
          <div
            className="relative w-full max-w-md rounded-2xl shadow-2xl border backdrop-blur-md z-[201]"
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
                Are you sure you want to delete <strong>{userToDelete.full_name || userToDelete.email}</strong>?
              </p>
              
              <p className="text-sm text-red-600 text-center mb-6">
                This action cannot be undone. All user data including applications, documents, and payments will be permanently deleted.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
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

      {/* Job Leads Modal */}
      {showJobLeadsModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            onClick={() => !loadingJobLeads && handleCloseJobLeadsModal()}
          />
          <div
            className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border backdrop-blur-md z-[201]"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Job Leads Database</h3>
                <button
                  onClick={handleCloseJobLeadsModal}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {loadingJobLeads ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : jobLeads.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No job leads found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {jobLeads.map((job) => (
                      <div
                        key={job.id}
                        className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-gray-900 mb-1">
                              {job.jobtitle || 'No Title'}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {job.companyname || 'Unknown Company'} • {job.location || 'Location not specified'}
                            </p>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                job.status === 'APPLIED' ? 'bg-green-100 text-green-700' :
                                job.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {job.status || 'UNKNOWN'}
                              </span>
                              {job.platform && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                  {job.platform}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              User: {job.email || 'No email'} • Posted: {job.postedat ? new Date(job.postedat).toLocaleDateString() : 'Unknown'}
                            </p>
                            {job.externalemails && (
                              <p className="text-xs text-gray-500 mt-1">
                                Contacts: {job.externalemails.substring(0, 100)}...
                              </p>
                            )}
                          </div>
                          {job.joburl && (
                            <a
                              href={job.joburl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                            >
                              View Job
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reports Modal */}
      {showReportsModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            onClick={() => !loadingReports && handleCloseReportsModal()}
          />
          <div
            className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border backdrop-blur-md z-[201]"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Platform Statistics & Reports</h3>
                <button
                  onClick={handleCloseReportsModal}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {loadingReports ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : !reportStats ? (
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No statistics available</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Job Leads Statistics */}
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <h4 className="font-semibold text-lg text-blue-900 mb-3">Job Leads Statistics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Total Leads</p>
                        <p className="text-2xl font-bold text-blue-600">{reportStats.jobLeads?.total || 0}</p>
                      </div>
                      {Object.entries(reportStats.jobLeads?.byStatus || {}).map(([status, count]) => (
                        <div key={status} className="bg-white p-3 rounded-lg">
                          <p className="text-sm text-gray-600">{status}</p>
                          <p className="text-2xl font-bold text-gray-900">{count}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-blue-900 mb-2">By Platform:</p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {Object.entries(reportStats.jobLeads?.byPlatform || {}).map(([platform, count]) => (
                          <div key={platform} className="bg-white px-3 py-2 rounded-lg text-center">
                            <p className="text-xs text-gray-600 uppercase">{platform}</p>
                            <p className="text-lg font-bold text-gray-900">{count}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Users Statistics */}
                  <div className="p-4 bg-green-50 rounded-xl">
                    <h4 className="font-semibold text-lg text-green-900 mb-3">Users Statistics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-green-600">{reportStats.users?.total || 0}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Admins</p>
                        <p className="text-2xl font-bold text-gray-900">{reportStats.users?.admins || 0}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Customers</p>
                        <p className="text-2xl font-bold text-gray-900">{reportStats.users?.customers || 0}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Onboarding Complete</p>
                        <p className="text-2xl font-bold text-gray-900">{reportStats.users?.onboardingComplete || 0}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Onboarding Pending</p>
                        <p className="text-2xl font-bold text-gray-900">{reportStats.users?.onboardingPending || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Applications Statistics */}
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <h4 className="font-semibold text-lg text-purple-900 mb-3">Applications Statistics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Total Applications</p>
                        <p className="text-2xl font-bold text-purple-600">{reportStats.applications?.total || 0}</p>
                      </div>
                      {Object.entries(reportStats.applications?.byStatus || {}).map(([status, count]) => (
                        <div key={status} className="bg-white p-3 rounded-lg">
                          <p className="text-sm text-gray-600 capitalize">{status}</p>
                          <p className="text-2xl font-bold text-gray-900">{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payments Statistics */}
                  <div className="p-4 bg-yellow-50 rounded-xl">
                    <h4 className="font-semibold text-lg text-yellow-900 mb-3">Payments Statistics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Total Payments</p>
                        <p className="text-2xl font-bold text-yellow-600">{reportStats.payments?.total || 0}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-600">${(reportStats.payments?.totalRevenue || 0).toFixed(2)}</p>
                      </div>
                      {Object.entries(reportStats.payments?.byStatus || {}).slice(0, 2).map(([status, count]) => (
                        <div key={status} className="bg-white p-3 rounded-lg">
                          <p className="text-sm text-gray-600 capitalize">{status}</p>
                          <p className="text-2xl font-bold text-gray-900">{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Documents Statistics */}
                  <div className="p-4 bg-red-50 rounded-xl">
                    <h4 className="font-semibold text-lg text-red-900 mb-3">Documents Statistics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Total Documents</p>
                        <p className="text-2xl font-bold text-red-600">{reportStats.documents?.total || 0}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Verified</p>
                        <p className="text-2xl font-bold text-green-600">{reportStats.documents?.verified || 0}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Pending Review</p>
                        <p className="text-2xl font-bold text-yellow-600">{reportStats.documents?.pending || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Job Leads Modal */}
      {showUserLeadsModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            onClick={() => !loadingJobLeads && handleCloseUserLeadsModal()}
          />
          <div
            className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border backdrop-blur-md z-[201]"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Job Leads</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedUserLeads?.email}</p>
                </div>
                <button
                  onClick={handleCloseUserLeadsModal}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {loadingJobLeads ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : !selectedUserLeads || selectedUserLeads.jobs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No job leads found for this user</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Total: <span className="font-semibold text-purple-600">{selectedUserLeads.jobs.length} job leads</span>
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedUserLeads.jobs.map((job) => {
                      const isExpanded = expandedJobId === job.id;

                      return (
                        <div
                          key={job.id}
                          className="bg-gray-50 rounded-xl overflow-hidden transition-all"
                        >
                          {/* Job Summary - Always Visible */}
                          <div className="p-4 hover:bg-gray-100 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg text-gray-900 mb-1">
                                  {job.jobtitle || 'No Title'}
                                </h4>
                                <p className="text-sm text-gray-600 mb-2">
                                  {job.companyname || 'Unknown Company'} • {job.location || 'Location not specified'}
                                </p>
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    job.status === 'APPLIED' ? 'bg-green-100 text-green-700' :
                                    job.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {job.status || 'UNKNOWN'}
                                  </span>
                                  {job.platform && (
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                      {job.platform}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">
                                  Posted: {job.postedat ? new Date(job.postedat).toLocaleDateString() : 'Unknown'}
                                </p>
                              </div>
                              <div className="flex flex-col space-y-2 ml-4">
                                <button
                                  onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center space-x-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                                </button>
                                {job.joburl && (
                                  <a
                                    href={job.joburl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium text-center"
                                  >
                                    Open Job URL
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="border-t border-gray-200 bg-white p-6">
                              <div className="space-y-6">
                                {/* Company Information */}
                                {job.companyinformation && (
                                  <div>
                                    <h5 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                                      <Activity className="w-4 h-4 text-blue-600" />
                                      <span>Company Information</span>
                                    </h5>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                                        {typeof job.companyinformation === 'string'
                                          ? job.companyinformation
                                          : JSON.stringify(job.companyinformation, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                )}

                                {/* Job Description */}
                                {job.description && (
                                  <div>
                                    <h5 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                                      <FileText className="w-4 h-4 text-purple-600" />
                                      <span>Job Description</span>
                                    </h5>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {job.description}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Contact Information */}
                                {(job.externalemails || job.emaildataraw || job.phonenumbersraw) && (
                                  <div>
                                    <h5 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                                      <Mail className="w-4 h-4 text-green-600" />
                                      <span>Contact Information</span>
                                    </h5>
                                    <div className="bg-green-50 p-4 rounded-lg space-y-3">
                                      {job.externalemails && (
                                        <div>
                                          <p className="text-xs font-medium text-gray-600 mb-1">External Emails:</p>
                                          <p className="text-sm text-gray-700">{job.externalemails}</p>
                                        </div>
                                      )}
                                      {job.emaildataraw && (
                                        <div>
                                          <p className="text-xs font-medium text-gray-600 mb-1">Email Data:</p>
                                          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-white p-2 rounded">
                                            {typeof job.emaildataraw === 'string'
                                              ? job.emaildataraw
                                              : JSON.stringify(job.emaildataraw, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                      {job.phonenumbersraw && (
                                        <div>
                                          <p className="text-xs font-medium text-gray-600 mb-1">Phone Numbers:</p>
                                          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-white p-2 rounded">
                                            {typeof job.phonenumbersraw === 'string'
                                              ? job.phonenumbersraw
                                              : JSON.stringify(job.phonenumbersraw, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Additional Details */}
                                <div>
                                  <h5 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 text-yellow-600" />
                                    <span>Additional Details</span>
                                  </h5>
                                  <div className="bg-yellow-50 p-4 rounded-lg grid grid-cols-2 gap-4">
                                    {job.companywebsite && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-600">Company Website:</p>
                                        <a href={`https://${job.companywebsite}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                          {job.companywebsite}
                                        </a>
                                      </div>
                                    )}
                                    {job.companylinkedinurl && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-600">LinkedIn URL:</p>
                                        <a href={job.companylinkedinurl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                                          {job.companylinkedinurl}
                                        </a>
                                      </div>
                                    )}
                                    {job.employeecount && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-600">Employee Count:</p>
                                        <p className="text-sm text-gray-700">{job.employeecount}</p>
                                      </div>
                                    )}
                                    {job.applicationcount && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-600">Application Count:</p>
                                        <p className="text-sm text-gray-700">{job.applicationcount}</p>
                                      </div>
                                    )}
                                    {job.specialities && (
                                      <div className="col-span-2">
                                        <p className="text-xs font-medium text-gray-600">Specialities:</p>
                                        <p className="text-sm text-gray-700">{job.specialities}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
