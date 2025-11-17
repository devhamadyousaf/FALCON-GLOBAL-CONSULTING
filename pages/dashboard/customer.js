import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import DashboardGuard from '../../components/DashboardGuard';
import { getUserDocuments, uploadFile, listUserFiles, deleteFile } from '../../lib/storage';
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
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';

function CustomerDashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [cvs, setCvs] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);
  const [loadingCvs, setLoadingCvs] = useState(false);
  const [loadingCoverLetters, setLoadingCoverLetters] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState(''); // 'cv' or 'cover-letter'
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ show: false, type: '', message: '' });
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Application Approved', message: 'Your job application has been approved!', time: '2h ago', type: 'success', read: false },
    { id: 2, title: 'Document Required', message: 'Please upload your visa documents', time: '5h ago', type: 'warning', read: false },
    { id: 3, title: 'New Message', message: 'You have a new message from admin', time: '1d ago', type: 'info', read: false }
  ]);

  // Handle Gmail OAuth callback tokens
  useEffect(() => {
    if (router.query.gmail_success && router.query.access_token && router.query.refresh_token) {
      // Store tokens in sessionStorage
      sessionStorage.setItem('gmail_access_token', router.query.access_token);
      sessionStorage.setItem('gmail_refresh_token', router.query.refresh_token);
      
      console.log('✅ Gmail tokens stored in sessionStorage');
      
      // Clean URL by removing token parameters
      const cleanUrl = '/dashboard/customer?gmail_success=true';
      router.replace(cleanUrl, undefined, { shallow: true });
    }
  }, [router.query]);

  // Fetch user documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (user?.id) {
        setLoadingDocuments(true);
        const result = await getUserDocuments(user.id);
        if (result.success) {
          console.log('📄 User documents loaded:', result.documents);
          setDocuments(result.documents);
        } else {
          console.error('❌ Error loading documents:', result.error);
        }
        setLoadingDocuments(false);
      }
    };

    fetchDocuments();
  }, [user?.id]);

  // Fetch CVs
  useEffect(() => {
    const fetchCvs = async () => {
      if (user?.id) {
        setLoadingCvs(true);
        const result = await listUserFiles(user.id, 'cvs');
        if (result.success) {
          console.log('📄 CVs loaded:', result.files);
          setCvs(result.files || []);
        } else {
          console.error('❌ Error loading CVs:', result.error);
        }
        setLoadingCvs(false);
      }
    };

    fetchCvs();
  }, [user?.id]);

  // Fetch Cover Letters
  useEffect(() => {
    const fetchCoverLetters = async () => {
      if (user?.id) {
        setLoadingCoverLetters(true);
        const result = await listUserFiles(user.id, 'cover-letters');
        if (result.success) {
          console.log('📄 Cover letters loaded:', result.files);
          setCoverLetters(result.files || []);
        } else {
          console.error('❌ Error loading cover letters:', result.error);
        }
        setLoadingCoverLetters(false);
      }
    };

    fetchCoverLetters();
  }, [user?.id]);

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadStatus({
        show: true,
        type: 'error',
        message: 'Please select a file to upload'
      });
      return;
    }

    setUploadingFile(true);
    setUploadStatus({ show: false, type: '', message: '' });

    try {
      const bucket = uploadType === 'cv' ? 'cvs' : 'cover-letters';
      const result = await uploadFile(selectedFile, bucket, user.id);

      if (result.success) {
        setUploadStatus({
          show: true,
          type: 'success',
          message: `${uploadType === 'cv' ? 'CV' : 'Cover Letter'} uploaded successfully!`
        });
        
        // Refresh the list
        if (uploadType === 'cv') {
          const cvResult = await listUserFiles(user.id, 'cvs');
          if (cvResult.success) setCvs(cvResult.files || []);
        } else {
          const clResult = await listUserFiles(user.id, 'cover-letters');
          if (clResult.success) setCoverLetters(clResult.files || []);
        }

        // Close modal and reset
        setShowUploadModal(false);
        setSelectedFile(null);
        setUploadType('');
      } else {
        setUploadStatus({
          show: true,
          type: 'error',
          message: result.error || 'Upload failed'
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        show: true,
        type: 'error',
        message: 'An error occurred during upload'
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteFile = async (fileName, bucket) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const filePath = `${user.id}/${fileName}`;
      const result = await deleteFile(filePath, bucket);

      if (result.success) {
        setUploadStatus({
          show: true,
          type: 'success',
          message: 'File deleted successfully'
        });

        // Refresh the list
        if (bucket === 'cvs') {
          const cvResult = await listUserFiles(user.id, 'cvs');
          if (cvResult.success) setCvs(cvResult.files || []);
        } else {
          const clResult = await listUserFiles(user.id, 'cover-letters');
          if (clResult.success) setCoverLetters(clResult.files || []);
        }
      } else {
        setUploadStatus({
          show: true,
          type: 'error',
          message: result.error || 'Delete failed'
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setUploadStatus({
        show: true,
        type: 'error',
        message: 'An error occurred during deletion'
      });
    }
  };

  const openUploadModal = (type) => {
    setUploadType(type);
    setShowUploadModal(true);
    setSelectedFile(null);
  };

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
    <div className="min-h-screen relative overflow-x-hidden">
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
      <div className="relative z-10 overflow-x-hidden w-full">
      {/* Header */}
      <header className="sticky top-0 z-30 pt-4 px-4 sm:px-6 w-full">
        <div
          className="backdrop-blur-lg px-4 sm:px-8 py-3 transition-all duration-300 mx-auto"
          style={{
            backgroundColor: '#fbf7eb',
            border: '2px solid rgba(187, 40, 44, 0.8)',
            borderRadius: '50px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            height: '90px',
            maxWidth: '100%'
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
                    {user.name || 'User'}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      console.log('🚪 Logout button clicked');
                      await logout();
                    } catch (error) {
                      console.error('Logout error:', error);
                    }
                  }}
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

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div
          className="rounded-2xl p-6 sm:p-8 mb-8 shadow-xl w-full"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 50, 83, 1) 0%, rgba(0, 70, 120, 1) 100%)',
          }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
              <FileText className="w-6 h-6 text-blue-600" />
              <span>My Documents</span>
            </h3>

            {loadingDocuments ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-gray-500">Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm font-medium text-gray-700">No documents uploaded yet</p>
                <p className="text-xs text-gray-500 mt-1">Upload documents during onboarding</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="border rounded-xl p-4 hover:border-blue-500 transition-all hover:shadow-md"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderColor: 'rgba(200, 200, 200, 0.5)'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {doc.file_name}
                          </p>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                              {doc.document_type.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(doc.uploaded_at).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {(doc.file_size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => {
                            // Open document in new tab
                            const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${doc.file_path}`;
                            window.open(publicUrl, '_blank');
                          }}
                          className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="View document"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            // Download document
                            const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${doc.file_path}`;
                            const link = document.createElement('a');
                            link.href = publicUrl;
                            link.download = doc.file_name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="p-2 rounded-lg hover:bg-green-50 transition-colors"
                          title="Download document"
                        >
                          <Download className="w-4 h-4 text-green-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CV and Cover Letter Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* CVs */}
          <div
            className="rounded-2xl p-6 shadow-lg border backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Briefcase className="w-6 h-6 text-blue-600" />
                <span>My CVs</span>
              </h3>
              <button
                onClick={() => openUploadModal('cv')}
                className="px-4 py-2 rounded-lg font-semibold text-white text-sm transition-all duration-200"
                style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload CV
              </button>
            </div>

            {loadingCvs ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-gray-500">Loading CVs...</p>
              </div>
            ) : cvs.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm font-medium text-gray-700">No CVs uploaded yet</p>
                <p className="text-xs text-gray-500 mt-1">Upload your CV to apply for jobs</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cvs.map((file) => (
                  <div
                    key={file.id}
                    className="border rounded-xl p-4 hover:border-blue-500 transition-all hover:shadow-md"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderColor: 'rgba(200, 200, 200, 0.5)'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-xs text-gray-500">
                              {new Date(file.created_at).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {(file.metadata?.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => {
                            const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cvs/${user.id}/${file.name}`;
                            window.open(publicUrl, '_blank');
                          }}
                          className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="View CV"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cvs/${user.id}/${file.name}`;
                            const link = document.createElement('a');
                            link.href = publicUrl;
                            link.download = file.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="p-2 rounded-lg hover:bg-green-50 transition-colors"
                          title="Download CV"
                        >
                          <Download className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.name, 'cvs')}
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete CV"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cover Letters */}
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
                <span>My Cover Letters</span>
              </h3>
              <button
                onClick={() => openUploadModal('cover-letter')}
                className="px-4 py-2 rounded-lg font-semibold text-white text-sm transition-all duration-200"
                style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload
              </button>
            </div>

            {loadingCoverLetters ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-gray-500">Loading cover letters...</p>
              </div>
            ) : coverLetters.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm font-medium text-gray-700">No cover letters uploaded yet</p>
                <p className="text-xs text-gray-500 mt-1">Upload cover letters for your applications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {coverLetters.map((file) => (
                  <div
                    key={file.id}
                    className="border rounded-xl p-4 hover:border-purple-500 transition-all hover:shadow-md"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderColor: 'rgba(200, 200, 200, 0.5)'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-xs text-gray-500">
                              {new Date(file.created_at).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {(file.metadata?.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => {
                            const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cover-letters/${user.id}/${file.name}`;
                            window.open(publicUrl, '_blank');
                          }}
                          className="p-2 rounded-lg hover:bg-purple-50 transition-colors"
                          title="View cover letter"
                        >
                          <Eye className="w-4 h-4 text-purple-600" />
                        </button>
                        <button
                          onClick={() => {
                            const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cover-letters/${user.id}/${file.name}`;
                            const link = document.createElement('a');
                            link.href = publicUrl;
                            link.download = file.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="p-2 rounded-lg hover:bg-green-50 transition-colors"
                          title="Download cover letter"
                        >
                          <Download className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.name, 'cover-letters')}
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete cover letter"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
            onClick={() => !uploadingFile && setShowUploadModal(false)}
          />
          <div
            className="relative w-full max-w-md rounded-2xl shadow-2xl border backdrop-blur-md z-[101]"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                  Upload {uploadType === 'cv' ? 'CV' : 'Cover Letter'}
                </h3>
                <button
                  onClick={() => !uploadingFile && setShowUploadModal(false)}
                  disabled={uploadingFile}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  <X className="w-6 h-6" style={{ color: 'rgba(0, 50, 83, 0.8)' }} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      disabled={uploadingFile}
                      className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                      style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
                    />
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Accepted formats: PDF, DOC, DOCX (Max 10MB)
                  </p>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploadingFile}
                  className="flex-1 px-6 py-4 rounded-xl font-semibold border transition-all duration-200 disabled:opacity-50"
                  style={{ 
                    borderColor: 'rgba(0, 50, 83, 0.3)',
                    color: 'rgba(0, 50, 83, 1)'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || uploadingFile}
                  className="flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}
                >
                  {uploadingFile ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Status Message */}
      {uploadStatus.show && (
        <div className="fixed top-4 right-4 z-[200] max-w-md">
          <div
            className={`rounded-xl p-4 shadow-2xl border backdrop-blur-md ${
              uploadStatus.type === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                uploadStatus.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {uploadStatus.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${
                  uploadStatus.type === 'success' ? 'text-green-900' : 'text-red-900'
                }`}>
                  {uploadStatus.type === 'success' ? 'Success!' : 'Error'}
                </p>
                <p className={`text-sm mt-1 ${
                  uploadStatus.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {uploadStatus.message}
                </p>
              </div>
              <button
                onClick={() => setUploadStatus({ show: false, type: '', message: '' })}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}

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
