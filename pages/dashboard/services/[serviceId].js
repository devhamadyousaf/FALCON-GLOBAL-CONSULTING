import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import {
  Briefcase,
  FileText,
  Home,
  Plane,
  Car,
  Building2,
  Wifi,
  Zap,
  ArrowLeft,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Eye,
  Plus,
  Search,
  Bell,
  Settings,
  LogOut,
  X,
  AlertCircle
} from 'lucide-react';

export default function ServicePage() {
  const router = useRouter();
  const { serviceId } = router.query;
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Application Approved', message: 'Your job application has been approved!', time: '2h ago', type: 'success', read: false },
    { id: 2, title: 'Document Required', message: 'Please upload your visa documents', time: '5h ago', type: 'warning', read: false },
    { id: 3, title: 'New Message', message: 'You have a new message from admin', time: '1d ago', type: 'info', read: false }
  ]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  const markAsRead = (notificationId) => {
    setNotifications(notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user || !serviceId) return null;

  // Service configurations
  const serviceConfig = {
    jobs: {
      name: 'Jobs',
      icon: Briefcase,
      color: 'from-blue-500 to-blue-600',
      description: 'Find and apply for jobs worldwide',
      tabs: ['overview', 'applications', 'saved', 'recommendations'],
      items: [
        { id: 1, title: 'Senior Software Engineer', company: 'Tech Corp', location: 'Dubai, UAE', salary: '$8,000 - $12,000', status: 'applied', date: '2 days ago' },
        { id: 2, title: 'Marketing Manager', company: 'Global Solutions', location: 'London, UK', salary: '£6,000 - £9,000', status: 'interviewing', date: '5 days ago' },
        { id: 3, title: 'Data Analyst', company: 'Finance Hub', location: 'Singapore', salary: 'SGD 7,000 - 10,000', status: 'pending', date: '1 week ago' }
      ]
    },
    visa: {
      name: 'Visa',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      description: 'Manage your visa applications and documents',
      tabs: ['overview', 'applications', 'documents', 'tracking'],
      items: [
        { id: 1, title: 'Work Visa - UAE', type: 'Work Permit', status: 'in_progress', date: '1 week ago', progress: 60 },
        { id: 2, title: 'Family Visa - UK', type: 'Family Reunion', status: 'pending', date: '2 weeks ago', progress: 30 },
        { id: 3, title: 'Student Visa - Canada', type: 'Study Permit', status: 'approved', date: '1 month ago', progress: 100 }
      ]
    },
    housing: {
      name: 'Housing',
      icon: Home,
      color: 'from-green-500 to-green-600',
      description: 'Find accommodation for your relocation',
      tabs: ['overview', 'available', 'favorites', 'applications'],
      items: [
        { id: 1, title: '2BR Apartment in Marina', location: 'Dubai Marina', price: 'AED 8,500/month', status: 'available', bedrooms: 2 },
        { id: 2, title: 'Studio in City Center', location: 'Downtown Dubai', price: 'AED 5,000/month', status: 'pending', bedrooms: 1 },
        { id: 3, title: '3BR Villa with Pool', location: 'Arabian Ranches', price: 'AED 15,000/month', status: 'reserved', bedrooms: 3 }
      ]
    },
    flights: {
      name: 'Flights',
      icon: Plane,
      color: 'from-red-500 to-red-600',
      description: 'Book flights for your journey',
      tabs: ['overview', 'bookings', 'upcoming', 'history'],
      items: [
        { id: 1, title: 'Dubai - London', date: 'Dec 15, 2024', airline: 'Emirates', price: '$850', status: 'confirmed' },
        { id: 2, title: 'New York - Dubai', date: 'Jan 5, 2025', airline: 'Etihad', price: '$1,200', status: 'pending' }
      ]
    },
    rentalcars: {
      name: 'Rental Cars',
      icon: Car,
      color: 'from-yellow-500 to-yellow-600',
      description: 'Rent vehicles for your stay',
      tabs: ['overview', 'bookings', 'available', 'history'],
      items: [
        { id: 1, title: 'Toyota Camry 2024', type: 'Sedan', price: 'AED 150/day', status: 'active', duration: '30 days' },
        { id: 2, title: 'BMW X5 2024', type: 'SUV', price: 'AED 300/day', status: 'pending', duration: '7 days' }
      ]
    },
    banking: {
      name: 'Banking & Insurance',
      icon: Building2,
      color: 'from-indigo-500 to-indigo-600',
      description: 'Setup banking and insurance services',
      tabs: ['overview', 'banking', 'insurance', 'applications'],
      items: [
        { id: 1, title: 'Business Account Setup', bank: 'Emirates NBD', status: 'in_progress', type: 'Banking' },
        { id: 2, title: 'Health Insurance', provider: 'AXA Insurance', status: 'active', type: 'Insurance', coverage: 'Family' }
      ]
    },
    wifi: {
      name: 'WiFi & Mobile',
      icon: Wifi,
      color: 'from-pink-500 to-pink-600',
      description: 'Setup internet and mobile connections',
      tabs: ['overview', 'plans', 'active', 'billing'],
      items: [
        { id: 1, title: 'Fiber Optic 500 Mbps', provider: 'Etisalat', price: 'AED 399/month', status: 'active' },
        { id: 2, title: 'Mobile Plan - Unlimited', provider: 'Du', price: 'AED 200/month', status: 'pending' }
      ]
    },
    electricity: {
      name: 'Electricity',
      icon: Zap,
      color: 'from-orange-500 to-orange-600',
      description: 'Manage electricity connections',
      tabs: ['overview', 'connections', 'bills', 'history'],
      items: [
        { id: 1, title: 'Residential Connection', location: 'Dubai Marina', status: 'active', account: '123456789' },
        { id: 2, title: 'Connection Request', location: 'Downtown Dubai', status: 'pending', account: 'Pending' }
      ]
    }
  };

  const config = serviceConfig[serviceId] || serviceConfig.jobs;
  const ServiceIcon = config.icon;

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'active':
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
      case 'interviewing':
        return 'bg-yellow-100 text-yellow-700';
      case 'in_progress':
      case 'applied':
        return 'bg-blue-100 text-blue-700';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

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
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 pt-4 px-6">
          <div
            className="backdrop-blur-lg px-8 py-3 transition-all duration-300"
            style={{
              backgroundColor: '#fbf7eb',
              border: '2px solid rgba(187, 40, 44, 0.8)',
              borderRadius: '50px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              height: '90px'
            }}
          >
            <div className="flex items-center justify-between h-full">
              {/* Logo & Back Button */}
              <div className="flex items-center space-x-3">
                <Link href="/dashboard/customer">
                  <button
                    className="p-2 rounded-lg transition-colors duration-200"
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
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                </Link>
                <img
                  src="/klaus_logo.jpeg"
                  alt="Falcon Global Consulting"
                  className="h-20 w-auto object-contain"
                />
                <div className="hidden md:block ml-4">
                  <h1 className="text-lg font-bold" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                    Customer Dashboard
                  </h1>
                  <p className="text-sm" style={{ color: 'rgba(0, 50, 83, 0.7)' }}>
                    Welcome, {user.name}
                  </p>
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
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
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-lg transition-colors duration-200"
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
                  <Settings className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                    style={{ border: '2px solid rgba(187, 40, 44, 1)' }}
                  />
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
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div
              className="rounded-2xl p-2 backdrop-blur-md inline-flex space-x-2"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }}
            >
              {config.tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-xl font-semibold capitalize transition-all duration-200 ${
                    activeTab === tab ? 'text-white' : 'text-gray-700'
                  }`}
                  style={{
                    backgroundColor: activeTab === tab ? 'rgba(0, 50, 83, 1)' : 'transparent'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Service Title */}
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-r ${config.color} rounded-xl flex items-center justify-center`}>
                <ServiceIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                {config.name}
              </h2>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="w-full sm:w-96 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(0, 50, 83, 0.5)' }} />
              <input
                type="text"
                placeholder={`Search ${config.name.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border backdrop-blur-md outline-none"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'rgba(0, 50, 83, 1)'
                }}
              />
            </div>

            <button
              className="px-6 py-3 rounded-xl font-semibold text-white flex items-center space-x-2 shadow-lg transition-all duration-200"
              style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}
            >
              <Plus className="w-5 h-5" />
              <span>New Request</span>
            </button>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 gap-6">
            {config.items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl p-6 shadow-lg border backdrop-blur-md hover:shadow-xl transition-all duration-300"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.3)'
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <div className="space-y-2">
                      {item.company && (
                        <p className="text-sm text-gray-600">Company: {item.company}</p>
                      )}
                      {item.location && (
                        <p className="text-sm text-gray-600">Location: {item.location}</p>
                      )}
                      {item.salary && (
                        <p className="text-sm text-gray-600">Salary: {item.salary}</p>
                      )}
                      {item.price && (
                        <p className="text-sm font-semibold text-gray-900">Price: {item.price}</p>
                      )}
                      {item.type && (
                        <p className="text-sm text-gray-600">Type: {item.type}</p>
                      )}
                      {item.progress !== undefined && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Progress</span>
                            <span className="text-xs font-semibold text-gray-900">{item.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`bg-gradient-to-r ${config.color} h-2 rounded-full transition-all duration-300`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col items-end space-y-3">
                    <span className={`px-4 py-2 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-500">{item.date}</p>
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'rgba(0, 50, 83, 0.8)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 50, 83, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'rgba(0, 50, 83, 0.8)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 50, 83, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {config.items.length === 0 && (
            <div className="text-center py-16">
              <div className={`w-24 h-24 bg-gradient-to-r ${config.color} rounded-full flex items-center justify-center mx-auto mb-6 opacity-50`}>
                <ServiceIcon className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No {config.name} Yet</h3>
              <p className="text-gray-600 mb-6">Start by creating your first request</p>
              <button
                className="px-8 py-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-200"
                style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}
              >
                Create New Request
              </button>
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
                    Settings
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" style={{ color: 'rgba(0, 50, 83, 0.8)' }} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Profile Settings */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                      Profile Settings
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          defaultValue={user.name}
                          className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
                          style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          defaultValue={user.email}
                          className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
                          style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          defaultValue={user.phone}
                          placeholder="+1 234 567 8900"
                          className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
                          style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                      Notification Preferences
                    </h4>
                    <div className="space-y-3">
                      {['Email Notifications', 'SMS Notifications', 'Application Updates', 'Marketing Emails'].map((pref) => (
                        <label key={pref} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                          <span className="text-gray-700">{pref}</span>
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
                    <button
                      className="w-full px-4 py-3 rounded-xl font-semibold text-white transition-all duration-200"
                      style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}
                    >
                      Change Password
                    </button>
                  </div>

                  {/* Save Button */}
                  <button
                    className="w-full px-6 py-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg"
                    style={{ backgroundColor: 'rgba(0, 50, 83, 1)' }}
                  >
                    Save Changes
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
