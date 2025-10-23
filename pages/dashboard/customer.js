import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import DashboardGuard from '../../components/DashboardGuard';
import {
  Briefcase,
  FileText,
  Home,
  Plane,
  Car,
  Building2,
  Wifi,
  Smartphone,
  Zap,
  User,
  Upload,
  LogOut,
  Menu,
  X,
  Bell,
  Settings,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

function CustomerDashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
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
    } else if (user.role === 'admin') {
      router.push('/dashboard/admin');
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

  if (!user) return null;

  const services = [
    { id: 'jobs', name: 'Jobs', image: '/services/vecteezy_women-searching-for-jobs-using-a-computer_1901049.jpg', color: 'from-blue-500 to-blue-600', count: 12 },
    { id: 'visa', name: 'Visa', image: '/services/vecteezy_man-stamping-approval-of-work-finance-banking-or-investment_13007688.jpg', color: 'from-purple-500 to-purple-600', count: 3 },
    { id: 'housing', name: 'Housing', image: '/services/vecteezy_modern-cozy-apartment-interior-living-room-with-yellow_10234252.jpg', color: 'from-green-500 to-green-600', count: 5 },
    { id: 'flights', name: 'Flights', image: '/services/vecteezy_airplane-in-sky-background-illustration_23570288.jpg', color: 'from-red-500 to-red-600', count: 2 },
    { id: 'rentalcars', name: 'Rental Cars', image: '/services/vecteezy_lease-rental-car-sell-buy-dealership-manager-send-car_18790261.jpg', color: 'from-yellow-500 to-yellow-600', count: 4 },
    { id: 'banking', name: 'Banking & Insurance', image: '/services/vecteezy_businessman-using-laptop-computer-with-online-banking-and_3712754.jpg', color: 'from-indigo-500 to-indigo-600', count: 1 },
    { id: 'wifi', name: 'WiFi & Mobile', image: '/services/vecteezy_mobile-phone-mockup-illustration_23131277.jpg', color: 'from-pink-500 to-pink-600', count: 0 },
    { id: 'electricity', name: 'Electricity', image: '/services/vecteezy_electricity-pylon-against-the-violet-and-orange-background_2442234.jpg', color: 'from-orange-500 to-orange-600', count: 0 }
  ];

  const recentActivities = [
    { id: 1, title: 'Job Application Submitted', service: 'Jobs', status: 'completed', date: '2 hours ago' },
    { id: 2, title: 'Visa Documents Uploaded', service: 'Visa', status: 'pending', date: '1 day ago' },
    { id: 3, title: 'Housing Application Reviewed', service: 'Housing', status: 'completed', date: '3 days ago' }
  ];

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
            height: '90px'
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div
          className="rounded-2xl p-8 mb-8 shadow-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 50, 83, 1) 0%, rgba(0, 70, 120, 1) 100%)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-white">Welcome, {user.name}!</h2>
              <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Your journey to global opportunities starts here
              </p>
            </div>
            <div className="hidden md:block">
              <div
                className="backdrop-blur-sm rounded-xl p-6 border-2"
                style={{
                  backgroundColor: '#fbf7eb',
                  borderColor: 'rgba(187, 40, 44, 0.8)'
                }}
              >
                <div className="text-center">
                  <p className="text-sm font-semibold" style={{ color: 'rgba(187, 40, 44, 1)' }}>Profile Completion</p>
                  <p className="text-4xl font-bold mt-2" style={{ color: 'rgba(187, 40, 44, 1)' }}>75%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="mb-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Our Services</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => router.push(`/dashboard/services/${service.id}`)}
                className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border hover:border-blue-300 group backdrop-blur-md"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.3)'
                }}
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h4>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {service.count} {service.count === 1 ? 'item' : 'items'}
                    </p>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile & Documents Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Profile Information */}
          <div
            className="rounded-2xl p-6 shadow-lg border backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <User className="w-6 h-6 text-blue-600" />
                <span>Profile Information</span>
              </h3>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Edit
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-base font-medium text-gray-900">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-base font-medium text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="text-base font-medium text-gray-900">{user.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Country</p>
                <p className="text-base font-medium text-gray-900">{user.country || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div
            className="rounded-2xl p-6 shadow-lg border backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2 mb-6">
              <Upload className="w-6 h-6 text-blue-600" />
              <span>Documents</span>
            </h3>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Upload Your Passport</p>
                <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG (Max 5MB)</p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Upload Certificates</p>
                <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG (Max 5MB)</p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Family Documents</p>
                <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG (Max 5MB)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div
          className="rounded-2xl p-6 shadow-lg border backdrop-blur-md"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.3)'
          }}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.status === 'completed' ? 'bg-green-100' :
                    activity.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    {activity.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : activity.status === 'pending' ? (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.service}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{activity.date}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                    activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
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
      </div>
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <DashboardGuard>
      <CustomerDashboard />
    </DashboardGuard>
  );
}
