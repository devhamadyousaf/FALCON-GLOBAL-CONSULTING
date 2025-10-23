import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Globe, User, Mail, Phone, MapPin, ArrowRight, ArrowLeft, ChevronDown,
  Check, X, Upload, FileText, CheckCircle, Calendar, CreditCard,
  Clock, AlertCircle, Building, GraduationCap, Briefcase, Languages,
  Home, Info, Menu, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { countries } from '../utils/locationData';
import { calculateVisaEligibility, getEligibilityScore } from '../utils/visaEligibility';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

export default function OnboardingNew() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const {
    onboardingData,
    setRelocationType,
    updatePersonalDetails,
    updateVisaCheck,
    setVisaEligibility,
    completePayment,
    scheduleCall,
    uploadDocuments,
    setCurrentStep,
    markStepCompleted,
    isStepCompleted,
    canAccessDashboard
  } = useOnboarding();

  const [currentMainStep, setCurrentMainStep] = useState(0);
  const [visaQuestionStep, setVisaQuestionStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Toast and Modal state
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);

  // Personal details form
  const [personalForm, setPersonalForm] = useState({
    fullName: '',
    email: '',
    telephone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });

  // Visa check form
  const [visaForm, setVisaForm] = useState({
    stayLongerThan90Days: '',
    citizenship: '',
    englishLevel: '',
    jobOffer: '',
    education: '',
    specialRegulation: '',
    educationCountry: '',
    degreeRecognized: '',
    workExperience: ''
  });

  // Document upload state
  const [documents, setDocuments] = useState({
    passport: null,
    educationalCertificates: [],
    experienceLetters: [],
    jobOffer: null
  });

  const [callDate, setCallDate] = useState('');
  const [callTime, setCallTime] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Load saved data
  useEffect(() => {
    if (onboardingData) {
      if (onboardingData.personalDetails) {
        setPersonalForm({
          fullName: onboardingData.personalDetails.fullName || '',
          email: onboardingData.personalDetails.email || '',
          telephone: onboardingData.personalDetails.telephone || '',
          street: onboardingData.personalDetails.address?.street || '',
          city: onboardingData.personalDetails.address?.city || '',
          state: onboardingData.personalDetails.address?.state || '',
          zip: onboardingData.personalDetails.address?.zip || '',
          country: onboardingData.personalDetails.address?.country || ''
        });
      }
      if (onboardingData.visaCheck) {
        setVisaForm(onboardingData.visaCheck);
      }
      setCurrentMainStep(onboardingData.currentStep || 0);
    }
  }, []);

  // Check if user can access dashboard
  useEffect(() => {
    if (canAccessDashboard()) {
      router.push('/dashboard/customer');
    }
  }, [onboardingData, canAccessDashboard, router]);

  const handleRelocationTypeSelect = (type) => {
    setRelocationType(type);
    markStepCompleted(0);
    setCurrentMainStep(1);
    setCurrentStep(1);
  };

  const validatePersonalDetails = () => {
    const newErrors = {};
    if (!personalForm.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!personalForm.email.trim()) newErrors.email = 'Email is required';
    if (!personalForm.telephone.trim()) newErrors.telephone = 'Telephone is required';
    if (!personalForm.street.trim()) newErrors.street = 'Street address is required';
    if (!personalForm.city.trim()) newErrors.city = 'City is required';
    if (!personalForm.state.trim()) newErrors.state = 'State/Province is required';
    if (!personalForm.zip.trim()) newErrors.zip = 'ZIP code is required';
    if (!personalForm.country) newErrors.country = 'Country is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (personalForm.email && !emailRegex.test(personalForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePersonalDetailsSubmit = () => {
    if (!validatePersonalDetails()) {
      return;
    }

    updatePersonalDetails({
      fullName: personalForm.fullName,
      email: personalForm.email,
      telephone: personalForm.telephone,
      address: {
        street: personalForm.street,
        city: personalForm.city,
        state: personalForm.state,
        zip: personalForm.zip,
        country: personalForm.country
      }
    });

    markStepCompleted(1);

    // If GCC, skip visa check
    if (onboardingData.relocationType === 'gcc') {
      setCurrentMainStep(3); // Go to payment
      setCurrentStep(3);
    } else {
      setCurrentMainStep(2); // Go to visa check
      setCurrentStep(2);
    }
  };

  const handleVisaQuestionNext = () => {
    if (visaQuestionStep < 8) {
      setVisaQuestionStep(visaQuestionStep + 1);
    } else {
      // All questions answered, calculate eligibility
      updateVisaCheck(visaForm);
      const result = calculateVisaEligibility(visaForm);
      setVisaEligibility(result.eligible ? 'eligible' : 'not_eligible');
      markStepCompleted(2);
      setCurrentMainStep(2.5); // Show result screen
    }
  };

  const handleVisaQuestionBack = () => {
    if (visaQuestionStep > 0) {
      setVisaQuestionStep(visaQuestionStep - 1);
    } else {
      setCurrentMainStep(1);
    }
  };

  const proceedToPayment = () => {
    setCurrentMainStep(3);
    setCurrentStep(3);
  };

  const handlePaymentSuccess = async (planName) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Map plan names to prices
    const planPrices = {
      'silver': 299,
      'gold': 699,
      'diamond': 1599,
      'diamond+': 0 // Negotiable
    };

    const amount = planPrices[planName] || 0;

    completePayment({
      plan: planName,
      amount: amount,
      currency: 'USD',
      timestamp: new Date().toISOString(),
      transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase()
    });

    markStepCompleted(3);
    setLoading(false);
    setToast({
      message: `Payment successful! ${planName.charAt(0).toUpperCase() + planName.slice(1)} plan selected.`,
      type: 'success'
    });
    setTimeout(() => {
      setCurrentMainStep(4);
      setCurrentStep(4);
    }, 1500);
  };

  const handleScheduleCall = () => {
    if (!callDate || !callTime) {
      setToast({ message: 'Please select both date and time for your onboarding call', type: 'error' });
      return;
    }

    scheduleCall({
      date: callDate,
      time: callTime,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      scheduledAt: new Date().toISOString()
    });

    markStepCompleted(4);
    setToast({ message: 'Call scheduled successfully!', type: 'success' });
    setTimeout(() => {
      setCurrentMainStep(5);
      setCurrentStep(5);
    }, 1000);
  };

  const handleDocumentUpload = (docType, file) => {
    setDocuments(prev => ({
      ...prev,
      [docType]: file
    }));
  };

  const handleDocumentsSubmit = async () => {
    if (!documents.passport) {
      setToast({ message: 'Please upload your passport copy', type: 'error' });
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    uploadDocuments(documents);
    markStepCompleted(5);
    setLoading(false);

    setModal({
      title: 'Congratulations!',
      message: 'Your onboarding is complete.\n\nRedirecting to dashboard...',
      type: 'success',
      confirmText: 'Go to Dashboard',
      onConfirm: () => router.push('/dashboard/customer')
    });
  };

  if (!user) {
    return null;
  }

  // Calculate progress
  const getStepName = () => {
    if (currentMainStep === 0) return 'Choose Destination';
    if (currentMainStep === 1) return 'Personal Details';
    if (currentMainStep === 2) return 'Visa Check';
    if (currentMainStep === 2.5) return 'Visa Result';
    if (currentMainStep === 3) return 'Payment';
    if (currentMainStep === 4) return 'Schedule Call';
    if (currentMainStep === 5) return 'Upload Documents';
    return '';
  };

  const getTotalSteps = () => {
    return onboardingData.relocationType === 'gcc' ? 5 : 6;
  };

  const getCurrentStepNumber = () => {
    if (currentMainStep === 0) return 1;
    if (currentMainStep === 1) return 2;
    if (currentMainStep === 2) return 3;
    if (currentMainStep === 2.5) return 3;
    if (currentMainStep === 3) return onboardingData.relocationType === 'gcc' ? 3 : 4;
    if (currentMainStep === 4) return onboardingData.relocationType === 'gcc' ? 4 : 5;
    if (currentMainStep === 5) return onboardingData.relocationType === 'gcc' ? 5 : 6;
    return 1;
  };

  // Navigate to a specific step by clicking on step indicator
  const navigateToStep = (stepNumber) => {
    const currentStep = getCurrentStepNumber();

    // Only allow navigation to completed steps or current step
    if (stepNumber > currentStep) {
      setToast({
        message: 'Please complete the current step first',
        type: 'error'
      });
      return;
    }

    // Map step number to currentMainStep value
    if (stepNumber === 1) {
      setCurrentMainStep(0); // Destination
    } else if (stepNumber === 2) {
      setCurrentMainStep(1); // Details
    } else if (onboardingData.relocationType === 'europe') {
      // Europe flow: Destination, Details, Visa, Payment, Call, Documents
      if (stepNumber === 3) {
        setCurrentMainStep(2); // Visa
        setVisaQuestionStep(0);
      } else if (stepNumber === 4) {
        setCurrentMainStep(3); // Payment
      } else if (stepNumber === 5) {
        setCurrentMainStep(4); // Call
      } else if (stepNumber === 6) {
        setCurrentMainStep(5); // Documents
      }
    } else {
      // GCC flow: Destination, Details, Payment, Call, Documents (no visa)
      if (stepNumber === 3) {
        setCurrentMainStep(3); // Payment
      } else if (stepNumber === 4) {
        setCurrentMainStep(4); // Call
      } else if (stepNumber === 5) {
        setCurrentMainStep(5); // Documents
      }
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fbf7eb', fontSize: '14px' }}>
      {/* Header - Same as landing page */}
      <header className="fixed w-full z-50 pt-4">
        <div className="w-full px-6">
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
              <Link href="/">
                <div className="flex items-center space-x-3 flex-shrink-0 cursor-pointer h-full">
                  <img
                    src="/klaus_logo.jpeg"
                    alt="Falcon Global Consulting"
                    className="h-20 w-auto object-contain"
                  />
                </div>
              </Link>

              {/* Progress Indicator - Center */}
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm font-semibold" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                  Step {getCurrentStepNumber()} of {getTotalSteps()}
                </span>
                <span className="text-sm text-gray-600">•</span>
                <span className="text-sm text-gray-600">{getStepName()}</span>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 hover:bg-white/50"
                  style={{ border: '1px solid rgba(187, 40, 44, 0.3)' }}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                    {user.name}
                  </span>
                  <ChevronDown className="w-4 h-4" style={{ color: 'rgba(187, 40, 44, 1)' }} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl py-2 border-2" style={{ borderColor: 'rgba(187, 40, 44, 0.3)' }}>
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" style={{ color: 'rgba(187, 40, 44, 1)' }} />
                      <span style={{ color: 'rgba(3, 50, 83, 1)' }}>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-28 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps - Modern Design */}
          <div className="mb-8">
            <div className="flex justify-between items-center relative">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 -z-10 rounded-full"></div>
              <div
                className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 -z-10 rounded-full transition-all duration-500"
                style={{
                  width: `${(getCurrentStepNumber() / getTotalSteps()) * 100}%`,
                  backgroundColor: 'rgba(187, 40, 44, 1)'
                }}
              ></div>

              {/* Step Indicators */}
              {['Destination', 'Details', onboardingData.relocationType === 'europe' ? 'Visa' : '', 'Payment', 'Call', 'Documents'].filter(Boolean).map((step, index) => {
                const stepNumber = index + 1;
                const isComplete = stepNumber < getCurrentStepNumber();
                const isCurrent = stepNumber === getCurrentStepNumber();
                const isClickable = stepNumber <= getCurrentStepNumber();

                return (
                  <div
                    key={stepNumber}
                    className={`flex flex-col items-center relative bg-transparent ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    style={{ backgroundColor: '#fbf7eb' }}
                    onClick={() => isClickable && navigateToStep(stepNumber)}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                        isComplete
                          ? 'text-white hover:scale-110'
                          : isCurrent
                          ? 'text-white'
                          : 'bg-gray-200 text-gray-400'
                      } ${isClickable ? 'hover:scale-110' : ''}`}
                      style={{
                        backgroundColor: isComplete || isCurrent ? 'rgba(187, 40, 44, 1)' : undefined,
                        border: isCurrent ? '2px solid rgba(3, 50, 83, 1)' : undefined
                      }}
                    >
                      {isComplete ? <Check className="w-4 h-4" /> : stepNumber}
                    </div>
                    <span className={`mt-1.5 text-xs font-medium hidden sm:block ${isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content Card */}
          <div
            className="rounded-2xl p-6 md:p-8 shadow-xl"
            style={{
              backgroundColor: 'white',
              border: '2px solid rgba(187, 40, 44, 0.2)'
            }}
          >
            {/* Step 0: Relocation Type Selection */}
            {currentMainStep === 0 && (
              <div>
                <div className="text-center mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                    Welcome, {user.name}!
                  </h1>
                  <p className="text-base text-gray-600">Where would you like to relocate?</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Europe Option */}
                  <button
                    onClick={() => handleRelocationTypeSelect('europe')}
                    className="group rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left"
                    style={{
                      border: '2px solid rgba(187, 40, 44, 0.3)',
                      backgroundColor: 'white'
                    }}
                  >
                    <div className="text-4xl mb-3">🇪🇺</div>
                    <h2 className="text-xl font-bold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                      Europe
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Includes visa eligibility check for EU Blue Card (Germany focus)
                    </p>
                    <div className="flex items-center text-sm font-semibold" style={{ color: 'rgba(187, 40, 44, 1)' }}>
                      <span>Select Europe</span>
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </button>

                  {/* GCC Option */}
                  <button
                    onClick={() => handleRelocationTypeSelect('gcc')}
                    className="group rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left"
                    style={{
                      border: '2px solid rgba(187, 40, 44, 0.3)',
                      backgroundColor: 'white'
                    }}
                  >
                    <div className="text-4xl mb-3">🏝️</div>
                    <h2 className="text-xl font-bold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                      GCC Countries
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                      UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman
                    </p>
                    <div className="flex items-center text-sm font-semibold" style={{ color: 'rgba(187, 40, 44, 1)' }}>
                      <span>Select GCC</span>
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Personal Details */}
            {currentMainStep === 1 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-1" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                    Personal Details
                  </h2>
                  <p className="text-sm text-gray-600">Please provide your contact information</p>
                </div>

                <form className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                      Full Name <span style={{ color: 'rgba(187, 40, 44, 1)' }}>*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={personalForm.fullName}
                        onChange={(e) => setPersonalForm({ ...personalForm, fullName: e.target.value })}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none transition-all text-sm ${
                          errors.fullName ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                      Email <span style={{ color: 'rgba(187, 40, 44, 1)' }}>*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={personalForm.email}
                        onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                        className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 focus:outline-none transition-all ${
                          errors.email ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="your.email@example.com"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  {/* Telephone */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                      Telephone <span style={{ color: 'rgba(187, 40, 44, 1)' }}>*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={personalForm.telephone}
                        onChange={(e) => setPersonalForm({ ...personalForm, telephone: e.target.value })}
                        className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 focus:outline-none transition-all ${
                          errors.telephone ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    {errors.telephone && <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>}
                  </div>

                  {/* Address Section */}
                  <div className="pt-6 border-t-2 border-gray-100">
                    <h3 className="text-xl font-bold mb-6" style={{ color: 'rgba(3, 50, 83, 1)' }}>Address</h3>

                    {/* Country */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                        Country <span style={{ color: 'rgba(187, 40, 44, 1)' }}>*</span>
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                        <select
                          value={personalForm.country}
                          onChange={(e) => {
                            setPersonalForm({ ...personalForm, country: e.target.value, state: '', city: '' });
                            setErrors({ ...errors, country: '', state: '', city: '' });
                          }}
                          className={`w-full pl-12 pr-12 py-4 rounded-2xl border-2 focus:outline-none transition-all appearance-none cursor-pointer ${
                            errors.country ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                          }`}
                        >
                          {countries.map((country) => (
                            <option key={country.value} value={country.value}>
                              {country.flag ? `${country.flag} ` : ''}{country.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                      {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                    </div>

                    {/* Street */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                        Street Address <span style={{ color: 'rgba(187, 40, 44, 1)' }}>*</span>
                      </label>
                      <div className="relative">
                        <Home className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={personalForm.street}
                          onChange={(e) => setPersonalForm({ ...personalForm, street: e.target.value })}
                          className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 focus:outline-none transition-all ${
                            errors.street ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                          }`}
                          placeholder="123 Main Street"
                        />
                      </div>
                      {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {/* State */}
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                          State/Province <span style={{ color: 'rgba(187, 40, 44, 1)' }}>*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={personalForm.state}
                            onChange={(e) => setPersonalForm({ ...personalForm, state: e.target.value })}
                            className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 focus:outline-none transition-all ${
                              errors.state ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                            }`}
                            placeholder="Enter state or province"
                          />
                        </div>
                        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                          City <span style={{ color: 'rgba(187, 40, 44, 1)' }}>*</span>
                        </label>
                        <div className="relative">
                          <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={personalForm.city}
                            onChange={(e) => setPersonalForm({ ...personalForm, city: e.target.value })}
                            className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 focus:outline-none transition-all ${
                              errors.city ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                            }`}
                            placeholder="Enter city"
                          />
                        </div>
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                      </div>
                    </div>

                    {/* ZIP */}
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                        ZIP / Postal Code <span style={{ color: 'rgba(187, 40, 44, 1)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={personalForm.zip}
                        onChange={(e) => setPersonalForm({ ...personalForm, zip: e.target.value })}
                        className={`w-full px-4 py-4 rounded-2xl border-2 focus:outline-none transition-all ${
                          errors.zip ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="12345"
                      />
                      {errors.zip && <p className="text-red-500 text-sm mt-1">{errors.zip}</p>}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setCurrentMainStep(0)}
                      className="flex-1 px-6 py-4 rounded-2xl font-semibold transition-all flex items-center justify-center border-2"
                      style={{
                        backgroundColor: 'white',
                        borderColor: 'rgba(187, 40, 44, 0.3)',
                        color: 'rgba(3, 50, 83, 1)'
                      }}
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handlePersonalDetailsSubmit}
                      className="flex-1 px-6 py-4 rounded-2xl font-semibold text-white transition-all flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}
                    >
                      Next
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 2: Visa Check Questions (Europe only) - Keep existing implementation */}
            {currentMainStep === 2 && onboardingData.relocationType === 'europe' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                    Visa Eligibility Check
                  </h2>
                  <p className="text-gray-600">Question {visaQuestionStep + 1} of 9</p>
                </div>

                {/* Progress */}
                <div className="mb-8">
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${((visaQuestionStep + 1) / 9) * 100}%`,
                        backgroundColor: 'rgba(187, 40, 44, 1)'
                      }}
                    ></div>
                  </div>
                </div>

                {(() => {
                  const questions = [
                    {
                      id: 'stayLongerThan90Days',
                      question: 'Would you like to stay in Germany for longer than 90 days?',
                      options: [
                        { value: 'no', label: 'No' },
                        { value: 'yes', label: 'Yes' }
                      ]
                    },
                    {
                      id: 'citizenship',
                      question: 'Which answer applies to your citizenship or passport?',
                      options: [
                        { value: 'non-eu', label: 'NON-EU Third Country' },
                        { value: 'eu-country', label: 'EU country, Liechtenstein, Iceland or Switzerland' },
                        { value: 'visa-exempt', label: 'Andorra, Australia, Brazil, El Salvador, Honduras, Canada, Israel, Japan, Monaco, New Zealand, Republic of Korea, San Marino, USA, or United Kingdom' }
                      ]
                    },
                    {
                      id: 'englishLevel',
                      question: 'How well do you speak English for professional work?',
                      options: [
                        { value: 'fluent', label: 'I use English fluently in my current or previous job' },
                        { value: 'basic', label: 'I can communicate in English at a basic level' },
                        { value: 'learning', label: 'I am learning but not yet able to work in English' },
                        { value: 'not-speak', label: 'I do not speak English' }
                      ]
                    },
                    {
                      id: 'jobOffer',
                      question: 'Do you have a binding Job Offer/Employment Contract in Germany?',
                      options: [
                        { value: 'have-job', label: 'Yes, I already have a Job in Germany' },
                        { value: 'getting-job', label: "No, I'm planning to get a Job before relocating to Germany" },
                        { value: 'search-in-germany', label: "No, I'm planning to search for a Job once I'm in Germany" },
                        { value: 'nothing-mentioned', label: 'Nothing above mentioned' }
                      ]
                    },
                    {
                      id: 'education',
                      question: 'What is your highest educational qualification?',
                      options: [
                        { value: 'university-degree', label: "University Degree (Bachelor's, Master's, or equivalent)" },
                        { value: 'vocational-training', label: 'Vocational Training (2+ years formal job training)' },
                        { value: 'tertiary-education', label: 'Degree from tertiary education programme' },
                        { value: 'it-experience-2years', label: '2+ years proven IT experience in last 5 years' },
                        { value: 'it-experience-3years', label: '3+ years proven IT experience in last 7 years' },
                        { value: 'none', label: 'None of the above' }
                      ]
                    },
                    {
                      id: 'specialRegulation',
                      question: 'Is there a special regulation for your employment relationship in Germany?',
                      options: [
                        { value: 'internal-transfer', label: "Yes, I'm being sent to a German subsidiary (internal transfer)" },
                        { value: 'placement-agreement', label: 'Yes, I have a placement agreement with approval certificate' },
                        { value: 'none', label: 'No, none apply' }
                      ]
                    },
                    {
                      id: 'educationCountry',
                      question: 'In which country did you obtain your educational qualification?',
                      options: [
                        { value: 'germany', label: 'Germany' },
                        { value: 'outside-germany', label: 'Outside Germany' }
                      ]
                    },
                    {
                      id: 'degreeRecognized',
                      question: 'Is your degree recognised in Germany?',
                      options: [
                        { value: 'yes', label: 'Yes' },
                        { value: 'no', label: 'No' }
                      ]
                    },
                    {
                      id: 'workExperience',
                      question: 'How many years of full-time experience do you have in your current profession?',
                      options: [
                        { value: '0-2', label: '0–2 years' },
                        { value: '3plus', label: '3+ years' }
                      ]
                    }
                  ];

                  const currentQuestion = questions[visaQuestionStep];

                  return (
                    <>
                      <div className="mb-8">
                        <h3 className="text-2xl font-bold mb-6" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                          {currentQuestion.question}
                        </h3>

                        <div className="space-y-3">
                          {currentQuestion.options.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => setVisaForm({ ...visaForm, [currentQuestion.id]: option.value })}
                              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                                visaForm[currentQuestion.id] === option.value
                                  ? 'bg-blue-50'
                                  : 'hover:bg-gray-50'
                              }`}
                              style={{
                                borderColor: visaForm[currentQuestion.id] === option.value
                                  ? 'rgba(187, 40, 44, 1)'
                                  : 'rgba(0, 0, 0, 0.1)'
                              }}
                            >
                              <div className="flex items-center">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center`}
                                  style={{
                                    borderColor: visaForm[currentQuestion.id] === option.value
                                      ? 'rgba(187, 40, 44, 1)'
                                      : 'rgba(0, 0, 0, 0.3)',
                                    backgroundColor: visaForm[currentQuestion.id] === option.value
                                      ? 'rgba(187, 40, 44, 1)'
                                      : 'transparent'
                                  }}
                                >
                                  {visaForm[currentQuestion.id] === option.value && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <span className="font-medium" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                                  {option.label}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={handleVisaQuestionBack}
                          className="flex-1 px-6 py-4 rounded-2xl font-semibold transition-all flex items-center justify-center border-2"
                          style={{
                            backgroundColor: 'white',
                            borderColor: 'rgba(187, 40, 44, 0.3)',
                            color: 'rgba(3, 50, 83, 1)'
                          }}
                        >
                          <ArrowLeft className="w-5 h-5 mr-2" />
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleVisaQuestionNext}
                          disabled={!visaForm[currentQuestion.id]}
                          className="flex-1 px-6 py-4 rounded-2xl font-semibold text-white transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}
                        >
                          {visaQuestionStep === 8 ? 'See Results' : 'Next'}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Remaining steps abbreviated for length - payment, call scheduling, documents */}
            {/* Add similar modern styling to steps 2.5, 3, 4, and 5 */}
            {/* I'll show step 2.5 as an example */}

            {/* Step 2.5: Visa Result Screen */}
            {currentMainStep === 2.5 && (() => {
              const eligibilityResult = calculateVisaEligibility(visaForm);
              const score = getEligibilityScore(visaForm);

              return (
                <div>
                  {eligibilityResult.eligible ? (
                    <>
                      <div className="text-center mb-8">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                          <CheckCircle className="w-16 h-16" style={{ color: 'rgba(34, 197, 94, 1)' }} />
                        </div>
                        <h2 className="text-4xl font-bold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                          Congratulations!
                        </h2>
                        <p className="text-2xl font-semibold" style={{ color: 'rgba(34, 197, 94, 1)' }}>
                          You are eligible for the EU Blue Card visa
                        </p>
                      </div>

                      <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '2px solid rgba(34, 197, 94, 0.3)' }}>
                        <p className="text-gray-700">{eligibilityResult.recommendation}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center mb-8">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                          <AlertCircle className="w-16 h-16" style={{ color: 'rgba(239, 68, 68, 1)' }} />
                        </div>
                        <h2 className="text-4xl font-bold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                          Further Review Needed
                        </h2>
                        <p className="text-2xl font-semibold" style={{ color: 'rgba(239, 68, 68, 1)' }}>
                          You may not qualify for an EU Blue Card visa
                        </p>
                      </div>

                      <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '2px solid rgba(239, 68, 68, 0.3)' }}>
                        <h3 className="font-bold mb-3" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                          Areas of Concern:
                        </h3>
                        <ul className="space-y-2">
                          {eligibilityResult.reasons.map((reason, index) => (
                            <li key={index} className="flex items-start">
                              <X className="w-5 h-5 flex-shrink-0 mt-0.5 mr-2" style={{ color: 'rgba(239, 68, 68, 1)' }} />
                              <span className="text-gray-700">{reason}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-gray-700 mt-4">{eligibilityResult.recommendation}</p>
                      </div>
                    </>
                  )}

                  <button
                    onClick={proceedToPayment}
                    className="w-full px-6 py-4 rounded-2xl font-semibold text-white transition-all flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}
                  >
                    Proceed to Payment
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              );
            })()}

            {/* Step 3: Payment */}
            {currentMainStep === 3 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                    Choose Your Service Package
                  </h2>
                  <div className="w-24 h-1.5 mx-auto rounded-full mb-4" style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }} />
                  <p className="text-gray-600">Select the plan that best fits your relocation needs</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  {[
                    {
                      name: 'Silver',
                      price: '$299',
                      popular: false,
                      features: [
                        'Career consultation & CV review',
                        'Basic relocation guidance',
                        'Email support',
                        'Initial consultation call',
                        'Resource documentation'
                      ],
                      bgColor: '#C0C0C0',
                      borderColor: '#A8A8A8'
                    },
                    {
                      name: 'Gold',
                      price: '$699',
                      popular: true,
                      features: [
                        'Full relocation assistance',
                        'Priority support',
                        'Documentation & help',
                        'Job placement support',
                        'Cultural orientation',
                        '30-day follow-up support'
                      ],
                      bgColor: '#FFD700',
                      borderColor: '#DAA520'
                    },
                    {
                      name: 'Diamond',
                      price: '$1,599',
                      popular: false,
                      features: [
                        'End-to-end global recruitment solutions',
                        'Tailored consulting for international expansion',
                        'Dedicated account manager',
                        'Ongoing compliance & mobility support',
                        '24/7 priority support',
                        'Custom SLA agreements',
                        'Quarterly business reviews'
                      ],
                      bgColor: '#B9F2FF',
                      borderColor: '#4A90E2'
                    },
                    {
                      name: 'Diamond+',
                      price: 'Price negotiable',
                      popular: false,
                      features: [
                        'All Diamond features',
                        'Custom enterprise solutions',
                        'Global expansion strategy',
                        'C-suite executive search',
                        'Multi-country operations support',
                        'Bespoke compliance frameworks',
                        'White-glove concierge service'
                      ],
                      bgColor: '#E8D5FF',
                      borderColor: '#9B59B6'
                    }
                  ].map((plan, index) => (
                    <div
                      key={index}
                      className="relative rounded-2xl transition-all duration-500 transform hover:-translate-y-1 flex flex-col group cursor-pointer"
                      style={{
                        background: `
                          linear-gradient(135deg,
                            rgba(255, 255, 255, 0.1) 0%,
                            rgba(255, 255, 255, 0.05) 100%),
                          linear-gradient(135deg, ${plan.bgColor}60 0%, ${plan.bgColor}40 100%)`,
                        backdropFilter: 'blur(16px) saturate(150%)',
                        WebkitBackdropFilter: 'blur(16px) saturate(150%)',
                        border: `1.5px solid rgba(255, 255, 255, 0.18)`,
                        minHeight: '420px',
                        boxShadow: `
                          0 8px 32px 0 rgba(0, 0, 0, 0.1),
                          0 0 0 1px rgba(255, 255, 255, 0.1) inset,
                          0 2px 4px 0 rgba(255, 255, 255, 0.15) inset`
                      }}
                      onClick={() => handlePaymentSuccess(plan.name.toLowerCase())}
                    >
                      {/* Glass overlay - Top shine */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1/3 rounded-t-2xl pointer-events-none"
                        style={{
                          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%)',
                          zIndex: 1
                        }}
                      />

                      {/* Corner highlights */}
                      <div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.05) 100%)',
                          zIndex: 1
                        }}
                      />

                      {/* Popular Badge */}
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-30">
                          <div
                            className="text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 shadow-xl"
                            style={{
                              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(79, 70, 229, 0.95))',
                              backdropFilter: 'blur(12px)',
                              border: '1.5px solid rgba(255, 255, 255, 0.4)'
                            }}
                          >
                            <Check className="w-3 h-3" />
                            <span>Most Popular</span>
                          </div>
                        </div>
                      )}

                      <div className="p-5 flex flex-col flex-1 relative z-10">
                        {/* Header */}
                        <div className="text-center mb-4">
                          <h3
                            className="text-xl md:text-2xl font-bold mb-3"
                            style={{
                              color: 'rgba(0, 50, 83, 1)',
                              textShadow: '0 2px 10px rgba(255, 255, 255, 0.5)'
                            }}
                          >
                            {plan.name}
                          </h3>

                          <div className="mb-3">
                            <div
                              className="text-xl md:text-2xl font-bold"
                              style={{
                                color: 'rgba(0, 50, 83, 1)',
                                textShadow: '0 2px 10px rgba(255, 255, 255, 0.5)'
                              }}
                            >
                              {plan.price}
                            </div>
                            {plan.price !== 'Price negotiable' && (
                              <div className="text-xs font-semibold mt-1" style={{ color: 'rgba(0, 50, 83, 0.7)' }}>
                                USD
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Features */}
                        <ul className="space-y-2 mb-4 flex-1">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <div
                                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{
                                  background: `linear-gradient(135deg, ${plan.borderColor}dd, ${plan.borderColor})`,
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                                }}
                              >
                                <Check className="w-2.5 h-2.5 text-white" />
                              </div>
                              <span
                                className="text-xs leading-relaxed font-medium"
                                style={{
                                  color: 'rgba(0, 50, 83, 0.9)',
                                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
                                }}
                              >
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA Button */}
                        <button
                          disabled={loading}
                          className="w-full text-white py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 disabled:opacity-50"
                          style={{
                            background: 'linear-gradient(135deg, rgba(0, 50, 83, 0.9), rgba(0, 50, 83, 1))',
                            border: '1.5px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 4px 15px 0 rgba(0, 50, 83, 0.3)'
                          }}
                        >
                          <span>{loading ? 'Processing...' : 'Select Plan'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                  🔒 Secure payment powered by Stripe and PayPal. All plans include a consultation call.
                </p>
              </div>
            )}

            {/* Step 4: Schedule Call */}
            {currentMainStep === 4 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                    <Calendar className="w-16 h-16" style={{ color: 'rgba(34, 197, 94, 1)' }} />
                  </div>
                  <h2 className="text-4xl font-bold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                    Schedule Your Onboarding Call
                  </h2>
                  <p className="text-gray-600">Book a consultation with our relocation specialist</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                      Select Date <span style={{ color: 'rgba(187, 40, 44, 1)' }}>*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={callDate}
                        onChange={(e) => setCallDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                      Select Time <span style={{ color: 'rgba(187, 40, 44, 1)' }}>*</span>
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                      <select
                        value={callTime}
                        onChange={(e) => setCallTime(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select time slot</option>
                        <option value="09:00">09:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="13:00">01:00 PM</option>
                        <option value="14:00">02:00 PM</option>
                        <option value="15:00">03:00 PM</option>
                        <option value="16:00">04:00 PM</option>
                        <option value="17:00">05:00 PM</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="rounded-2xl p-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '2px solid rgba(59, 130, 246, 0.3)' }}>
                    <div className="flex items-start">
                      <Info className="w-5 h-5 flex-shrink-0 mt-0.5 mr-2" style={{ color: 'rgba(59, 130, 246, 1)' }} />
                      <p className="text-sm text-gray-700">
                        During this 30-minute call, our specialist will review your application, answer questions, and provide guidance on your relocation journey.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleScheduleCall}
                    className="w-full px-6 py-4 rounded-2xl font-semibold text-white transition-all flex items-center justify-center hover:opacity-90"
                    style={{ backgroundColor: 'rgba(34, 197, 94, 1)' }}
                  >
                    Confirm Booking
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Document Upload */}
            {currentMainStep === 5 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
                    <Upload className="w-16 h-16" style={{ color: 'rgba(168, 85, 247, 1)' }} />
                  </div>
                  <h2 className="text-4xl font-bold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                    Upload Your Documents
                  </h2>
                  <p className="text-gray-600">Provide the required documents for your application</p>
                </div>

                <div className="space-y-6">
                  {/* Passport */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                      Passport Copy <span style={{ color: 'rgba(187, 40, 44, 1)' }}>*</span>
                    </label>
                    <div className="rounded-2xl p-6 transition-all" style={{ border: '2px dashed rgba(168, 85, 247, 0.4)', backgroundColor: 'rgba(168, 85, 247, 0.05)' }}>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentUpload('passport', e.target.files[0])}
                        className="w-full text-sm"
                      />
                      {documents.passport && (
                        <div className="mt-2 flex items-center" style={{ color: 'rgba(34, 197, 94, 1)' }}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm">{documents.passport.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Educational Certificates */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                      Educational Certificates
                    </label>
                    <div className="rounded-2xl p-6 transition-all" style={{ border: '2px dashed rgba(168, 85, 247, 0.4)', backgroundColor: 'rgba(168, 85, 247, 0.05)' }}>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        onChange={(e) => setDocuments({ ...documents, educationalCertificates: Array.from(e.target.files) })}
                        className="w-full text-sm"
                      />
                      {documents.educationalCertificates.length > 0 && (
                        <div className="mt-2" style={{ color: 'rgba(34, 197, 94, 1)' }}>
                          <CheckCircle className="w-4 h-4 inline mr-2" />
                          <span className="text-sm">{documents.educationalCertificates.length} file(s) selected</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Experience Letters */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                      Experience Letters (Optional)
                    </label>
                    <div className="rounded-2xl p-6 transition-all" style={{ border: '2px dashed rgba(168, 85, 247, 0.4)', backgroundColor: 'rgba(168, 85, 247, 0.05)' }}>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        onChange={(e) => setDocuments({ ...documents, experienceLetters: Array.from(e.target.files) })}
                        className="w-full text-sm"
                      />
                      {documents.experienceLetters.length > 0 && (
                        <div className="mt-2" style={{ color: 'rgba(34, 197, 94, 1)' }}>
                          <CheckCircle className="w-4 h-4 inline mr-2" />
                          <span className="text-sm">{documents.experienceLetters.length} file(s) selected</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Job Offer */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                      Job Offer (If applicable)
                    </label>
                    <div className="rounded-2xl p-6 transition-all" style={{ border: '2px dashed rgba(168, 85, 247, 0.4)', backgroundColor: 'rgba(168, 85, 247, 0.05)' }}>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentUpload('jobOffer', e.target.files[0])}
                        className="w-full text-sm"
                      />
                      {documents.jobOffer && (
                        <div className="mt-2 flex items-center" style={{ color: 'rgba(34, 197, 94, 1)' }}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm">{documents.jobOffer.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl p-4" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '2px solid rgba(251, 191, 36, 0.3)' }}>
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 mr-2" style={{ color: 'rgba(251, 191, 36, 1)' }} />
                      <p className="text-sm text-gray-700">
                        Accepted formats: PDF, JPG, PNG. Maximum file size: 10MB per file.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleDocumentsSubmit}
                    disabled={loading}
                    className="w-full px-6 py-4 rounded-2xl font-semibold text-white transition-all flex items-center justify-center disabled:opacity-50 hover:opacity-90"
                    style={{ backgroundColor: 'rgba(168, 85, 247, 1)' }}
                  >
                    {loading ? 'Uploading...' : 'Complete Onboarding'}
                    <CheckCircle className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            )}
          </div>
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

      {/* Modal */}
      {modal && (
        <Modal
          isOpen={true}
          onClose={() => setModal(null)}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          confirmText={modal.confirmText}
          showCancel={modal.showCancel}
          onConfirm={modal.onConfirm}
        />
      )}
    </div>
  );
}
