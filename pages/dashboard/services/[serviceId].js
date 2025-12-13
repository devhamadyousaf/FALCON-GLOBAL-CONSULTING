import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';
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
  AlertCircle,
  Mail,
  ShoppingCart,
  Send
} from 'lucide-react';

export default function ServicePage() {
  const router = useRouter();
  const { serviceId } = router.query;
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showJobRequestModal, setShowJobRequestModal] = useState(false);
  const [jobRequestData, setJobRequestData] = useState({
    keywords: '',
    limit: 10,
    location: '',
    remote: 'remote',
    sort: 'relevant',
    platform: 'linkedin'
  });
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestStatus, setRequestStatus] = useState({ show: false, type: '', message: '' });
  const [jobLeads, setJobLeads] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [cart, setCart] = useState([]);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailAddress, setGmailAddress] = useState('');
  const [gmailAccountId, setGmailAccountId] = useState(null);
  const [gmailConnectionTime, setGmailConnectionTime] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedCv, setSelectedCv] = useState('');
  const [selectedCoverLetter, setSelectedCoverLetter] = useState('');
  const [cvs, setCvs] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);
  const [sendingApplications, setSendingApplications] = useState(false);
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

  // Fetch job leads when on jobs service page
  useEffect(() => {
    const fetchJobLeads = async () => {
      if (serviceId === 'jobs' && user?.email) {
        setLoadingJobs(true);
        try {
          // Fetch all jobs (NEW and APPLIED)
          const response = await fetch(`/api/jobs/leads?email=${encodeURIComponent(user.email)}`);
          const result = await response.json();

          if (result.success) {
            console.log('Job leads loaded:', result.jobs);
            setJobLeads(result.jobs);
          } else {
            console.error('Failed to load job leads:', result.error);
          }
        } catch (error) {
          console.error('Error fetching job leads:', error);
        } finally {
          setLoadingJobs(false);
        }
      }
    };

    fetchJobLeads();

    // Set up realtime subscription for Job-Leads table
    let subscription;
    if (serviceId === 'jobs' && user?.email) {
      console.log('Setting up realtime subscription for Job-Leads...');

      subscription = supabase
        .channel('job-leads-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'Job-Leads',
            filter: `email=eq.${user.email}` // Only listen to changes for this user's email
          },
          (payload) => {
            console.log('Realtime update received:', payload);

            // Handle different event types
            if (payload.eventType === 'INSERT') {
              // Add new job to the list
              setJobLeads(prev => [payload.new, ...prev]);
              console.log('New job added:', payload.new);
            } else if (payload.eventType === 'UPDATE') {
              // Update existing job in the list
              setJobLeads(prev =>
                prev.map(job => job.id === payload.new.id ? payload.new : job)
              );
              console.log('Job updated:', payload.new);
            } else if (payload.eventType === 'DELETE') {
              // Remove deleted job from the list
              setJobLeads(prev => prev.filter(job => job.id !== payload.old.id));
              console.log('Job deleted:', payload.old);
            }
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
        });
    }

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        console.log('Cleaning up realtime subscription...');
        supabase.removeChannel(subscription);
      }
    };
  }, [serviceId, user?.email]);

  // Check Gmail connection status
  useEffect(() => {
    const checkGmailStatus = async () => {
      if (serviceId === 'jobs' && user?.email) {
        try {
          const response = await fetch(`/api/gmail/status?email=${encodeURIComponent(user.email)}`);
          const result = await response.json();

          if (result.success && result.connected && !result.isExpired) {
            // Gmail is connected and token is still valid
            setGmailConnected(true);
            setGmailAddress(result.gmailAddress);
            setGmailAccountId(result.id);

            // Set connection timestamp if not already set
            const storedTime = sessionStorage.getItem('gmail_connection_time');
            if (!storedTime) {
              const now = Date.now();
              sessionStorage.setItem('gmail_connection_time', now.toString());
              setGmailConnectionTime(now);
            } else {
              setGmailConnectionTime(parseInt(storedTime));
            }
          } else if (result.connected && result.isExpired) {
            // Token exists but is expired - show as disconnected
            console.log('⚠️ Gmail token is expired, showing as disconnected');
            setGmailConnected(false);
            setGmailAddress('');
            setGmailAccountId(null);
          } else {
            // Not connected
            setGmailConnected(false);
            setGmailAddress('');
            setGmailAccountId(null);
          }
        } catch (error) {
          console.error('Error checking Gmail status:', error);
          setGmailConnected(false);
        }
      }
    };

    checkGmailStatus();
  }, [serviceId, user?.email]);

  // Auto-disconnect Gmail after 5 minutes of inactivity
  useEffect(() => {
    if (!gmailConnectionTime || serviceId !== 'jobs') return;

    const DISCONNECT_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

    const checkAndDisconnect = () => {
      const connectionTime = parseInt(sessionStorage.getItem('gmail_connection_time') || '0');
      const elapsed = Date.now() - connectionTime;

      if (elapsed >= DISCONNECT_TIMEOUT) {
        console.log('🔒 Auto-disconnecting Gmail after 5 minutes of inactivity');
        // Clear session tokens
        sessionStorage.removeItem('gmail_access_token');
        sessionStorage.removeItem('gmail_refresh_token');
        sessionStorage.removeItem('gmail_connection_time');

        // Update UI state
        setGmailConnected(false);
        setGmailConnectionTime(null);

        setRequestStatus({
          show: true,
          type: 'warning',
          message: 'Gmail disconnected due to inactivity. Please reconnect to send applications.'
        });
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkAndDisconnect, 30000);

    // Also check immediately
    checkAndDisconnect();

    return () => clearInterval(interval);
  }, [gmailConnectionTime, serviceId]);

  // Reset activity timer on user interactions
  const resetGmailActivityTimer = () => {
    if (gmailConnected && sessionStorage.getItem('gmail_connection_time')) {
      const now = Date.now();
      sessionStorage.setItem('gmail_connection_time', now.toString());
      setGmailConnectionTime(now);
    }
  };

  // Load cart from localStorage
  useEffect(() => {
    if (serviceId === 'jobs' && user?.email) {
      const savedCart = localStorage.getItem(`job_cart_${user.email}`);
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error loading cart:', error);
        }
      }
    }
  }, [serviceId, user?.email]);

  // Fetch user's CVs and cover letters
  useEffect(() => {
    const fetchDocuments = async () => {
      if (serviceId === 'jobs' && user?.email) {
        console.log('🔄 Fetching documents for email:', user.email);
        try {
          // Fetch CVs - use email instead of user.id to get correct profile ID
          const cvResponse = await fetch(`/api/storage/list?email=${encodeURIComponent(user.email)}&bucket=cvs&t=${Date.now()}`);
          if (cvResponse.ok) {
            const cvResult = await cvResponse.json();
            console.log('📄 CVs fetched:', cvResult.files);
            if (cvResult.success) setCvs(cvResult.files || []);
          } else {
            console.error('❌ CV fetch failed:', cvResponse.status);
          }

          // Fetch cover letters - use email instead of user.id
          const clResponse = await fetch(`/api/storage/list?email=${encodeURIComponent(user.email)}&bucket=cover-letters&t=${Date.now()}`);
          if (clResponse.ok) {
            const clResult = await clResponse.json();
            console.log('📄 Cover letters fetched:', clResult.files);
            if (clResult.success) setCoverLetters(clResult.files || []);
          } else {
            console.error('❌ Cover letter fetch failed:', clResponse.status);
          }
        } catch (error) {
          console.error('Error fetching documents:', error);
        }
      }
    };

    fetchDocuments();
  }, [serviceId, user?.email]);

  const handleViewJobDetails = async (jobId) => {
    try {
      const response = await fetch(`/api/jobs/details?id=${jobId}`);
      const result = await response.json();
      
      if (result.success) {
        setSelectedJob(result.job);
        setShowJobDetails(true);
      } else {
        console.error('Failed to load job details:', result.error);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  const handleConnectGmail = async () => {
    try {
      const response = await fetch(`/api/gmail/connect?email=${encodeURIComponent(user.email)}`);
      const result = await response.json();
      
      if (result.success) {
        window.location.href = result.authUrl;
      } else {
        setRequestStatus({
          show: true,
          type: 'error',
          message: 'Failed to connect Gmail'
        });
      }
    } catch (error) {
      console.error('Gmail connect error:', error);
      setRequestStatus({
        show: true,
        type: 'error',
        message: 'An error occurred while connecting Gmail'
      });
    }
  };

  const addToCart = (job) => {
    const isInCart = cart.some(item => item.id === job.id);
    
    if (isInCart) {
      // Remove from cart
      const newCart = cart.filter(item => item.id !== job.id);
      setCart(newCart);
      localStorage.setItem(`job_cart_${user.email}`, JSON.stringify(newCart));
      setRequestStatus({
        show: true,
        type: 'success',
        message: 'Removed from applications'
      });
    } else {
      // Add to cart
      const newCart = [...cart, job];
      setCart(newCart);
      localStorage.setItem(`job_cart_${user.email}`, JSON.stringify(newCart));
      setRequestStatus({
        show: true,
        type: 'success',
        message: 'Added to applications'
      });
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(`job_cart_${user.email}`);
    setRequestStatus({
      show: true,
      type: 'success',
      message: 'Applications cleared'
    });
  };

  const handleBulkSend = async () => {
    // Reset activity timer when user initiates send
    resetGmailActivityTimer();

    if (!gmailConnected) {
      setRequestStatus({
        show: true,
        type: 'error',
        message: 'Please connect your Gmail account first'
      });
      return;
    }

    if (cart.length === 0) {
      setRequestStatus({
        show: true,
        type: 'error',
        message: 'No jobs selected for application'
      });
      return;
    }

    if (!selectedCv || !selectedCoverLetter) {
      setRequestStatus({
        show: true,
        type: 'error',
        message: 'Please select both CV and Cover Letter'
      });
      return;
    }

    setSendingApplications(true);
    setShowCartModal(false);

    try {
      // Step 1: Check Gmail connection and token expiry
      console.log('🔍 Step 1: Checking Gmail connection and token status...');
      const gmailStatusResponse = await fetch(`/api/gmail/status?email=${encodeURIComponent(user.email)}`);
      const gmailStatus = await gmailStatusResponse.json();

      if (!gmailStatus.success || !gmailStatus.connected) {
        throw new Error('Gmail account not connected. Please reconnect your Gmail.');
      }

      console.log('📊 Token status:', {
        isExpired: gmailStatus.isExpired,
        expiresAt: gmailStatus.token_expires_at
      });

      // Step 2: Refresh token if expired
      let accessToken = gmailStatus.access_token;
      let refreshToken = gmailStatus.refresh_token;

      if (gmailStatus.isExpired) {
        console.log('🔄 Access token expired, refreshing...');

        const refreshResponse = await fetch('/api/gmail/refresh-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: user.email })
        });

        const refreshResult = await refreshResponse.json();

        if (!refreshResult.success) {
          console.error('❌ Token refresh failed:', refreshResult);

          // Clear the expired/invalid connection from UI
          setGmailConnected(false);
          setGmailAccountId(null);
          setGmailAddress('');
          sessionStorage.removeItem('gmail_access_token');
          sessionStorage.removeItem('gmail_refresh_token');
          sessionStorage.removeItem('gmail_connection_time');

          throw new Error('Your Gmail session has expired. Please reconnect your Gmail account to continue.');
        }

        accessToken = refreshResult.access_token;
        console.log('✅ Token refreshed successfully');

        // Update sessionStorage with new token
        sessionStorage.setItem('gmail_access_token', accessToken);
      } else {
        console.log('✅ Access token is still valid');

        // Update sessionStorage with current tokens
        sessionStorage.setItem('gmail_access_token', accessToken);
        sessionStorage.setItem('gmail_refresh_token', refreshToken);
      }

      console.log('📤 Sending bulk application request with:', {
        jobCount: cart.length,
        email: user.email,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        gmailAccountId,
        cvId: selectedCv,
        coverLetterId: selectedCoverLetter
      });

      console.log('🔍 Selected files:');
      console.log('- CV ID/Path:', selectedCv);
      console.log('- Cover Letter ID/Path:', selectedCoverLetter);

      const response = await fetch('/api/jobs/bulk-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobIds: cart.map(job => job.id),
          email: user.email,
          accessToken: accessToken,
          refreshToken: refreshToken,
          gmailAccountId: gmailAccountId,
          cvId: selectedCv,
          coverLetterId: selectedCoverLetter
        })
      });

      const result = await response.json();

      if (result.success) {
        setRequestStatus({
          show: true,
          type: 'success',
          message: `Successfully sent ${cart.length} applications!`
        });
        clearCart();
      } else {
        throw new Error(result.error || 'Failed to send applications');
      }
    } catch (error) {
      console.error('Bulk send error:', error);
      setRequestStatus({
        show: true,
        type: 'error',
        message: error.message || 'Failed to send applications'
      });
    } finally {
      setSendingApplications(false);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const handleJobRequest = async () => {
    if (!jobRequestData.keywords || !jobRequestData.location) {
      setRequestStatus({
        show: true,
        type: 'error',
        message: 'Please fill in all required fields (Keywords and Location)'
      });
      return;
    }

    setIsSubmittingRequest(true);
    setRequestStatus({ show: false, type: '', message: '' });

    try {
      const requestBody = {
        email: user.email,
        keywords: jobRequestData.keywords,
        limit: parseInt(jobRequestData.limit) || 10,
        location: jobRequestData.location,
        remote: jobRequestData.remote,
        sort: jobRequestData.sort,
        platform: jobRequestData.platform
      };

      console.log('Submitting job request:', requestBody);

      // Use our API route instead of calling webhook directly (to avoid CORS issues)
      const response = await fetch('/api/jobs/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok && result.success) {
        setRequestStatus({
          show: true,
          type: 'success',
          message: 'Job request submitted successfully!'
        });
        setShowJobRequestModal(false);
        // Reset form
        setJobRequestData({
          keywords: '',
          limit: 10,
          location: '',
          remote: 'remote',
          sort: 'relevant'
        });
      } else {
        const errorMsg = result.error || result.details || 'Failed to submit request';
        console.error('API Error:', result);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Error submitting job request:', error);
      setRequestStatus({
        show: true,
        type: 'error',
        message: error.message || 'Failed to submit job request. Please try again.'
      });
    } finally {
      setIsSubmittingRequest(false);
    }
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
      items: jobLeads // Use real job leads from database
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

            <div className="flex items-center gap-3">
              {serviceId === 'jobs' && cart.length > 0 && (
                <>
                  <button
                    onClick={() => setShowCartModal(true)}
                    className="px-4 py-3 rounded-xl font-semibold text-white flex items-center space-x-2 shadow-lg transition-all duration-200 relative"
                    style={{ backgroundColor: 'rgba(0, 50, 83, 1)' }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>My Applications</span>
                    {cart.length > 0 && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {cart.length}
                      </span>
                    )}
                  </button>
                  {gmailConnected && (
                    <button
                      onClick={handleBulkSend}
                      disabled={sendingApplications}
                      className="px-4 py-3 rounded-xl font-semibold text-white flex items-center space-x-2 shadow-lg transition-all duration-200 disabled:opacity-50"
                      style={{ backgroundColor: 'rgba(0, 128, 0, 1)' }}
                    >
                      <Send className="w-5 h-5" />
                      <span>{sendingApplications ? 'Sending...' : 'Send Applications'}</span>
                    </button>
                  )}
                </>
              )}

              {/* Gmail Connection Status - Only show on Jobs page */}
              {serviceId === 'jobs' && (
                <div className="flex items-center space-x-2 px-4 py-3 rounded-xl border shadow-md" style={{
                  backgroundColor: gmailConnected ? 'rgba(0, 200, 0, 0.05)' : 'rgba(255, 150, 0, 0.05)',
                  borderColor: gmailConnected ? 'rgba(0, 200, 0, 0.3)' : 'rgba(255, 150, 0, 0.3)'
                }}>
                  <Mail className="w-5 h-5" style={{ color: gmailConnected ? 'rgba(0, 200, 0, 1)' : 'rgba(255, 150, 0, 1)' }} />
                  <span className="font-semibold" style={{ color: gmailConnected ? 'rgba(0, 200, 0, 1)' : 'rgba(255, 150, 0, 1)' }}>
                    {gmailConnected ? 'Gmail Connected' : 'Gmail Disconnected'}
                  </span>
                  {!gmailConnected && (
                    <button
                      onClick={handleConnectGmail}
                      className="ml-2 px-4 py-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-all flex items-center space-x-2"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Connect</span>
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  if (serviceId === 'jobs') {
                    setShowJobRequestModal(true);
                  }
                }}
                className="px-6 py-3 rounded-xl font-semibold text-white flex items-center space-x-2 shadow-lg transition-all duration-200"
                style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}
              >
                <Plus className="w-5 h-5" />
                <span>New Request</span>
              </button>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 gap-6">
            {loadingJobs && serviceId === 'jobs' ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading job leads...</p>
              </div>
            ) : config.items.length > 0 ? (
              config.items.map((item) => {
                // For jobs, extract data from the job lead structure
                const isJobLead = serviceId === 'jobs' && item.jobtitle;
                const title = isJobLead ? item.jobtitle : item.title;
                const company = isJobLead ? item.companyname : item.company;
                const status = item.status?.toLowerCase() || 'new';
                const postedDate = isJobLead && item.postedat 
                  ? new Date(item.postedat).toLocaleDateString() 
                  : item.date;

                return (
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
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                        <div className="space-y-2">
                          {company && (
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Company:</span> {company}
                            </p>
                          )}
                          {isJobLead && item.joburl && (
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Job URL:</span>{' '}
                              <a
                                href={item.joburl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View on {item.platform ? item.platform.charAt(0).toUpperCase() + item.platform.slice(1) : 'LinkedIn'}
                              </a>
                            </p>
                          )}
                          {isJobLead && item.companylinkedinurl && item.platform === 'linkedin' && (
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Company LinkedIn:</span>{' '}
                              <a
                                href={item.companylinkedinurl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View Profile
                              </a>
                            </p>
                          )}
                          {isJobLead && item.companyindeedurl && item.platform === 'indeed' && (
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Company Indeed:</span>{' '}
                              <a
                                href={item.companyindeedurl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View Profile
                              </a>
                            </p>
                          )}
                          {isJobLead && item.companywebsite && (
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Website:</span>{' '}
                              <a
                                href={item.companywebsite.startsWith('http') ? item.companywebsite : `https://${item.companywebsite}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {item.companywebsite}
                              </a>
                            </p>
                          )}
                          {isJobLead && item.employeecount && (
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Employee Count:</span> {item.employeecount.toLocaleString()}
                            </p>
                          )}
                          {item.location && !isJobLead && (
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
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-4 py-2 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                            {status.replace('_', ' ').toUpperCase()}
                          </span>
                          {isJobLead && item.platform && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                              {item.platform.toUpperCase()}
                            </span>
                          )}
                        </div>
                        {postedDate && (
                          <p className="text-xs text-gray-500">{postedDate}</p>
                        )}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewJobDetails(item.id)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: 'rgba(0, 50, 83, 0.8)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 50, 83, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="View details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {isJobLead && item.joburl && (
                            <a
                              href={item.joburl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: 'rgba(0, 50, 83, 0.8)' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 50, 83, 0.1)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              title="Open job posting"
                            >
                              <Download className="w-5 h-5" />
                            </a>
                          )}
                          {isJobLead && (
                            <>
                              {item.status === 'APPLIED' ? (
                                <button
                                  disabled
                                  className="px-4 py-2 rounded-lg font-semibold text-sm bg-green-100 text-green-700 cursor-not-allowed opacity-75"
                                  title="Already applied to this job"
                                >
                                  ✓ Applied
                                </button>
                              ) : (
                                <button
                                  onClick={() => addToCart(item)}
                                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                                    cart.some(job => job.id === item.id)
                                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  }`}
                                  title={cart.some(job => job.id === item.id) ? 'Remove from cart' : 'Add to cart'}
                                >
                                  {cart.some(job => job.id === item.id) ? 'Remove' : 'Apply'}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16">
                <div className={`w-24 h-24 bg-gradient-to-r ${config.color} rounded-full flex items-center justify-center mx-auto mb-6 opacity-50`}>
                  <ServiceIcon className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {serviceId === 'jobs' ? 'No Job Leads Yet' : `No ${config.name} Yet`}
                </h3>
                <p className="text-gray-600 mb-6">
                  {serviceId === 'jobs' 
                    ? 'Request jobs to see your personalized job leads here' 
                    : 'Start by creating your first request'}
                </p>
                {serviceId === 'jobs' && (
                  <button
                    onClick={() => setShowJobRequestModal(true)}
                    className="px-8 py-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-200"
                    style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}
                  >
                    Request Jobs
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Job Request Modal */}
        {showJobRequestModal && serviceId === 'jobs' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
              onClick={() => setShowJobRequestModal(false)}
            />
            <div
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border backdrop-blur-md z-[101]"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                    Request Jobs
                  </h3>
                  <button
                    onClick={() => setShowJobRequestModal(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" style={{ color: 'rgba(0, 50, 83, 0.8)' }} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Keywords */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keywords <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={jobRequestData.keywords}
                      onChange={(e) => setJobRequestData({ ...jobRequestData, keywords: e.target.value })}
                      placeholder="e.g., software engineer"
                      className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
                      style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={jobRequestData.location}
                      onChange={(e) => setJobRequestData({ ...jobRequestData, location: e.target.value })}
                      placeholder="e.g., United States"
                      className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
                      style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
                    />
                  </div>

                  {/* Limit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Jobs
                    </label>
                    <input
                      type="number"
                      value={jobRequestData.limit}
                      onChange={(e) => setJobRequestData({ ...jobRequestData, limit: e.target.value })}
                      min="1"
                      max="100"
                      className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
                      style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
                    />
                  </div>

                  {/* Remote */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Type
                    </label>
                    <select
                      value={jobRequestData.remote}
                      onChange={(e) => setJobRequestData({ ...jobRequestData, remote: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
                      style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
                    >
                      <option value="remote">Remote</option>
                      <option value="onsite">On-site</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={jobRequestData.sort}
                      onChange={(e) => setJobRequestData({ ...jobRequestData, sort: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
                      style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
                    >
                      <option value="relevant">Most Relevant</option>
                      <option value="recent">Most Recent</option>
                      <option value="popular">Most Popular</option>
                    </select>
                  </div>

                  {/* Platform */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jobRequestData.platform}
                      onChange={(e) => setJobRequestData({ ...jobRequestData, platform: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
                      style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
                    >
                      <option value="linkedin">LinkedIn</option>
                      <option value="indeed">Indeed</option>
                      <option value="naukri">Naukri</option>
                      <option value="bayt">Bayt</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => setShowJobRequestModal(false)}
                    className="flex-1 px-6 py-4 rounded-xl font-semibold border transition-all duration-200"
                    style={{ 
                      borderColor: 'rgba(0, 50, 83, 0.3)',
                      color: 'rgba(0, 50, 83, 1)'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJobRequest}
                    disabled={isSubmittingRequest}
                    className="flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}
                  >
                    {isSubmittingRequest ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : 'Submit Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Request Status Message */}
        {requestStatus.show && (
          <div className="fixed top-4 right-4 z-[200] max-w-md">
            <div
              className={`rounded-xl p-4 shadow-2xl border backdrop-blur-md ${
                requestStatus.type === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  requestStatus.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {requestStatus.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${
                    requestStatus.type === 'success' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {requestStatus.type === 'success' ? 'Success!' : 'Error'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    requestStatus.type === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {requestStatus.message}
                  </p>
                </div>
                <button
                  onClick={() => setRequestStatus({ show: false, type: '', message: '' })}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Job Details Modal */}
        {showJobDetails && selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
              onClick={() => setShowJobDetails(false)}
            />
            <div
              className="relative w-full max-w-4xl rounded-2xl shadow-2xl border backdrop-blur-md max-h-[90vh] overflow-y-auto z-[101]"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                      {selectedJob.jobtitle}
                    </h3>
                    <p className="text-lg text-gray-600 mt-1">{selectedJob.companyname}</p>
                  </div>
                  <button
                    onClick={() => setShowJobDetails(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" style={{ color: 'rgba(0, 50, 83, 0.8)' }} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Status Badge */}
                  <div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedJob.status?.toLowerCase())}`}>
                      {selectedJob.status}
                    </span>
                  </div>

                  {/* Company Information */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-lg font-semibold mb-3" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                      Company Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedJob.companywebsite && (
                        <div>
                          <p className="text-sm text-gray-500">Website</p>
                          <a 
                            href={`https://${selectedJob.companywebsite}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {selectedJob.companywebsite}
                          </a>
                        </div>
                      )}
                      {selectedJob.companylinkedinurl && (
                        <div>
                          <p className="text-sm text-gray-500">LinkedIn</p>
                          <a 
                            href={selectedJob.companylinkedinurl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Company Profile
                          </a>
                        </div>
                      )}
                      {selectedJob.employeecount && (
                        <div>
                          <p className="text-sm text-gray-500">Employee Count</p>
                          <p className="font-medium">{selectedJob.employeecount.toLocaleString()}</p>
                        </div>
                      )}
                      {selectedJob.followercount && (
                        <div>
                          <p className="text-sm text-gray-500">LinkedIn Followers</p>
                          <p className="font-medium">{selectedJob.followercount.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                    {selectedJob.companyinformation && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 mb-1">About</p>
                        <p className="text-sm text-gray-700">{selectedJob.companyinformation}</p>
                      </div>
                    )}
                    {selectedJob.specialities && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 mb-2">Specialities</p>
                        <div className="flex flex-wrap gap-2">
                          {(typeof selectedJob.specialities === 'string' 
                            ? JSON.parse(selectedJob.specialities) 
                            : selectedJob.specialities
                          ).map((spec, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Job Description */}
                  {selectedJob.description && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-lg font-semibold mb-3" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                        Job Description
                      </h4>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {selectedJob.description}
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  {selectedJob.emaildataraw && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-lg font-semibold mb-3" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                        Contact Information
                      </h4>
                      <div className="space-y-3">
                        {(typeof selectedJob.emaildataraw === 'string'
                          ? JSON.parse(selectedJob.emaildataraw)
                          : selectedJob.emaildataraw
                        ).map((contact, idx) => (
                          <div key={idx} className="border-b border-gray-200 pb-3 last:border-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">
                                  {contact.full_name || 'Contact Person'}
                                </p>
                                {contact.title && (
                                  <p className="text-sm text-gray-600 capitalize">{contact.title}</p>
                                )}
                                {contact.value && (
                                  <a 
                                    href={`mailto:${contact.value}`}
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    {contact.value}
                                  </a>
                                )}
                                {contact.inferred_salary && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Salary Range: ${contact.inferred_salary}
                                  </p>
                                )}
                                {contact.socials?.linkedin && (
                                  <a 
                                    href={`https://linkedin.com/in/${contact.socials.linkedin}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    LinkedIn Profile
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Phone Numbers */}
                  {selectedJob.phonenumbersraw && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-lg font-semibold mb-3" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                        Phone Numbers
                      </h4>
                      <div className="space-y-2">
                        {(typeof selectedJob.phonenumbersraw === 'string'
                          ? JSON.parse(selectedJob.phonenumbersraw)
                          : selectedJob.phonenumbersraw
                        ).map((phone, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <a 
                              href={`tel:${phone.value}`}
                              className="text-blue-600 hover:underline font-mono"
                            >
                              {phone.value}
                            </a>
                            <span className="text-xs text-gray-500">
                              {phone.source}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Job URL */}
                  {selectedJob.joburl && (
                    <div className="flex space-x-3">
                      <a
                        href={selectedJob.joburl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-6 py-4 rounded-xl font-semibold text-white text-center transition-all duration-200 shadow-lg"
                        style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}
                      >
                        Apply on LinkedIn
                      </a>
                      <button
                        onClick={() => setShowJobDetails(false)}
                        className="px-6 py-4 rounded-xl font-semibold border transition-all duration-200"
                        style={{ 
                          borderColor: 'rgba(0, 50, 83, 0.3)',
                          color: 'rgba(0, 50, 83, 1)'
                        }}
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
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

        {/* Cart Modal */}
        {showCartModal && serviceId === 'jobs' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
              onClick={() => setShowCartModal(false)}
            />
            <div
              className="relative w-full max-w-3xl rounded-2xl shadow-2xl border backdrop-blur-md max-h-[90vh] overflow-y-auto z-[101]"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <ShoppingCart className="w-7 h-7" style={{ color: 'rgba(0, 50, 83, 1)' }} />
                    <h3 className="text-2xl font-bold" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                      My Applications ({cart.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowCartModal(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" style={{ color: 'rgba(0, 50, 83, 0.8)' }} />
                  </button>
                </div>

                {/* Gmail Connection Section */}
                <div className={`mb-6 rounded-xl p-4 border ${gmailConnected ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Mail className={`w-6 h-6 ${gmailConnected ? 'text-green-600' : 'text-orange-600'}`} />
                        {gmailConnected && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <p className={`font-semibold ${gmailConnected ? 'text-green-900' : 'text-orange-900'}`}>
                          Gmail Account
                        </p>
                        <p className={`text-sm ${gmailConnected ? 'text-green-700' : 'text-orange-700'}`}>
                          {gmailConnected ? (
                            <span className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4" />
                              <span>Connected: {gmailAddress || user.email}</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1">
                              <AlertCircle className="w-4 h-4" />
                              <span>Not connected - Click to connect</span>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {!gmailConnected ? (
                      <button
                        onClick={handleConnectGmail}
                        className="px-4 py-2 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-all flex items-center space-x-2"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Connect Gmail</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleConnectGmail}
                        className="px-4 py-2 rounded-lg font-semibold text-green-700 bg-green-100 hover:bg-green-200 transition-all text-sm"
                      >
                        Reconnect
                      </button>
                    )}
                  </div>
                </div>

                {/* CV and Cover Letter Selection */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select CV <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedCv}
                      onChange={(e) => setSelectedCv(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
                      style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
                    >
                      <option value="">-- Select CV --</option>
                      {cvs.map((cv) => (
                        <option key={cv.id} value={cv.id}>{cv.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Cover Letter <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedCoverLetter}
                      onChange={(e) => setSelectedCoverLetter(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
                      style={{ borderColor: 'rgba(0, 50, 83, 0.2)' }}
                    >
                      <option value="">-- Select Cover Letter --</option>
                      {coverLetters.map((cl) => (
                        <option key={cl.id} value={cl.id}>{cl.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Cart Items */}
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No jobs selected yet</p>
                    <p className="text-sm text-gray-400 mt-2">Click "Apply" on jobs to add them here</p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {cart.map((job) => (
                      <div
                        key={job.id}
                        className="rounded-xl p-4 bg-white border hover:shadow-md transition-all"
                        style={{ borderColor: 'rgba(0, 50, 83, 0.1)' }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{job.jobtitle}</h4>
                            <p className="text-sm text-gray-600">{job.companyname}</p>
                            {job.joburl && (
                              <a
                                href={job.joburl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                View posting
                              </a>
                            )}
                          </div>
                          <button
                            onClick={() => addToCart(job)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {cart.length > 0 && (
                    <>
                      <button
                        onClick={clearCart}
                        className="flex-1 px-6 py-4 rounded-xl font-semibold border transition-all duration-200"
                        style={{ 
                          borderColor: 'rgba(0, 50, 83, 0.3)',
                          color: 'rgba(0, 50, 83, 1)'
                        }}
                      >
                        Clear All
                      </button>
                      <button
                        onClick={handleBulkSend}
                        disabled={!gmailConnected || !selectedCv || !selectedCoverLetter || sendingApplications}
                        className="flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: 'rgba(0, 128, 0, 1)' }}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          {sendingApplications ? (
                            <>
                              <Clock className="w-5 h-5 animate-spin" />
                              <span>Sending Applications...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              <span>Send {cart.length} Applications</span>
                            </>
                          )}
                        </div>
                      </button>
                    </>
                  )}
                </div>

                {/* Instructions */}
                {cart.length > 0 && (!gmailConnected || !selectedCv || !selectedCoverLetter) && (
                  <div className="mt-4 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      {!gmailConnected && '• Please connect your Gmail account to send applications.'}
                      {!selectedCv && <><br />• Please select a CV.</>}
                      {!selectedCoverLetter && <><br />• Please select a cover letter.</>}
                    </p>
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
