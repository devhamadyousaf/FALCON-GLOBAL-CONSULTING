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
  Plus
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated, supabase } = useAuth();
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

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
    } else if (user.role !== 'admin') {
      router.push('/dashboard/customer');
    } else {
      // Load admin data
      loadAdminData();
    }
  }, [isAuthenticated, user, router]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchRecentUsers(),
        fetchRecentApplications(),
        fetchAllUsers(),
        fetchAllApplications(),
        fetchNotifications()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Total Users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Active Applications
      const { count: activeApplications } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'submitted']);

      // Total Revenue
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');
      
      const totalRevenue = payments?.reduce((sum, payment) => sum + Number(payment.amount || 0), 0) || 0;

      // Pending Reviews (documents not verified)
      const { count: pendingReviews } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('verified', false);

      setStats({
        totalUsers: totalUsers || 0,
        activeApplications: activeApplications || 0,
        totalRevenue: totalRevenue,
        pendingReviews: pendingReviews || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user || user.role !== 'admin') return null;

  // Format stats for display
  const statsDisplay = [
    {
      id: 1,
      name: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: '+12.5%',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      trend: 'up'
    },
    {
      id: 2,
      name: 'Active Applications',
      value: stats.activeApplications.toLocaleString(),
      change: '+8.2%',
      icon: FileText,
      color: 'from-green-500 to-green-600',
      trend: 'up'
    },
    {
      id: 3,
      name: 'Revenue (MTD)',
      value: `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      change: '+18.7%',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      trend: 'up'
    },
    {
      id: 4,
      name: 'Pending Reviews',
      value: stats.pendingReviews.toLocaleString(),
      change: '-5.3%',
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      trend: 'down'
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
                  onClick={logout}
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
                  <span className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
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
                <span>Recent Applications</span>
              </h3>
              <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>

            <div className="space-y-4">
              {loading ? (
                // Loading skeleton
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-40 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                  </div>
                ))
              ) : recentApplications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No applications found</p>
                </div>
              ) : (
                recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        app.status === 'accepted' ? 'bg-green-100' :
                        app.status === 'pending' || app.status === 'submitted' ? 'bg-yellow-100' : 
                        app.status === 'rejected' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {app.status === 'accepted' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (app.status === 'pending' || app.status === 'submitted') ? (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        ) : app.status === 'rejected' ? (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        ) : (
                          <Activity className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{app.profiles?.full_name || 'Unknown User'}</p>
                        <p className="text-sm text-gray-500">
                          {app['Job-Leads']?.jobTitle || 'Job Application'} • {getTimeAgo(app.applied_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        (app.status === 'pending' || app.status === 'submitted') ? 'bg-yellow-100 text-yellow-700' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveTab('users')}
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl">
              <Users className="w-5 h-5" />
              <span>Manage Users</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl">
              <FileText className="w-5 h-5" />
              <span>View Reports</span>
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl">
              <Edit className="w-5 h-5" />
              <span>Edit Content</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-lg hover:shadow-xl">
              <Download className="w-5 h-5" />
              <span>Export Data</span>
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
                <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Download className="w-5 h-5" />
                  <span>Export</span>
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
              <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Plus className="w-5 h-5" />
                <span>Add Content</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['Homepage Banner', 'Services Section', 'About Us', 'Testimonials', 'FAQ Section', 'Contact Info'].map((content, index) => (
                <div key={index} className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{content}</h4>
                  <p className="text-sm text-gray-500">Last updated 2 days ago</p>
                  <button className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Edit Content
                  </button>
                </div>
              ))}
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
      </div>
    </div>
  );
}
