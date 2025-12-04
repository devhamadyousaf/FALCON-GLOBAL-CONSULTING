import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Globe, User, Mail, Phone, MapPin, ArrowRight, ArrowLeft, ChevronDown,
  Check, X, Upload, CheckCircle, Calendar, CreditCard,
  AlertCircle, Building,
  Home, Info, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { countries } from '../utils/locationData';
import { calculateVisaEligibility, getEligibilityScore } from '../utils/visaEligibility';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

export default function OnboardingNew() {
  const router = useRouter();
  const { user, isAuthenticated, logout, reloadUserProfile } = useAuth();
  const {
    onboardingData,
    loading: contextLoading,
    setRelocationType,
    updatePersonalDetails,
    updateVisaCheck,
    setVisaEligibility,
    scheduleCall,
    uploadDocuments,
    setCurrentStep,
    markStepCompleted
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


  // Handle payment redirect from Tilopay
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const code = urlParams.get('code');
    const description = urlParams.get('description');

    // Only process if payment parameter exists
    if (!paymentStatus) return;

    // Check if payment was ACTUALLY successful (code 1 = approved)
    if (paymentStatus === 'success' && code === '1') {
      console.log('✅ Payment success detected from redirect!');

      // Mark payment step as completed
      const completePayment = async () => {
        try {
          await markStepCompleted(3);
          await setCurrentStep(4);
          setCurrentMainStep(4);
          setToast({ message: 'Payment successful! Please schedule your onboarding call.', type: 'success' });

          // Clean URL
          router.replace('/onboarding-new?step=4', undefined, { shallow: true });
        } catch (error) {
          console.error('Error completing payment step:', error);
        }
      };

      completePayment();
    }
    // Handle payment failure
    else if (paymentStatus === 'success' && code !== '1') {
      console.error('❌ Payment failed with code:', code, 'Description:', description);
      setToast({
        message: `Payment failed: ${description || 'Please try again'}`,
        type: 'error'
      });
      // Stay on payment step or redirect back
      setCurrentMainStep(3);
      router.replace('/onboarding-new?step=3', undefined, { shallow: true });
    }
  }, [router, markStepCompleted, setCurrentStep, setToast]);

  // Redirect if not authenticated or email not confirmed
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Block access for unconfirmed email/password users
    if (user?.requiresEmailConfirmation) {
      console.log('⚠️ Email not confirmed, redirecting to verify-email');
      router.push('/verify-email');
      return;
    }
  }, [isAuthenticated, user, router]);

  // Single initialization effect - runs once when data loads
  useEffect(() => {
    if (contextLoading) return; // Wait for data to load
    if (!user?.id) return;

    console.log('🔄 Initializing onboarding page...');
    console.log('📂 Current step from database:', onboardingData.currentStep);
    console.log('📂 Completed steps:', onboardingData.completedSteps);
    console.log('📂 Relocation type:', onboardingData.relocationType);
    console.log('📂 User onboardingComplete:', user?.onboardingComplete);

    // Check if onboarding is complete - redirect to dashboard
    const step5Complete = onboardingData.completedSteps?.some(s => {
      const step = typeof s === 'string' ? parseInt(s, 10) : s;
      return step === 5;
    });
    
    // ONLY redirect if BOTH profile says complete AND step 5 is done
    if (user?.onboardingComplete === true && step5Complete) {
      console.log('✅ Onboarding fully complete - redirecting to dashboard');
      router.replace('/dashboard/customer'); // Use replace to avoid back button issues
      return;
    }

    // Restore step from database/localStorage
    if (onboardingData.currentStep !== undefined && onboardingData.currentStep !== null) {
      console.log('🔄 Restoring step:', onboardingData.currentStep);
      setCurrentMainStep(onboardingData.currentStep);
    }

    // Pre-fill forms with existing data
    const hasExistingData = onboardingData.personalDetails?.email || onboardingData.personalDetails?.fullName;
    
    if (hasExistingData) {
      console.log('📂 Loading saved personal details');
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
    } else if (user) {
      console.log('📂 Pre-filling with user profile');
      setPersonalForm({
        fullName: user.name || '',
        email: user.email || '',
        telephone: user.phone || '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: user.country || ''
      });
    }
    
    if (onboardingData.visaCheck) {
      setVisaForm(onboardingData.visaCheck);
    }
    if (onboardingData.callScheduleDetails) {
      setCallDate(onboardingData.callScheduleDetails.date || '');
      setCallTime(onboardingData.callScheduleDetails.time || '');
    }
  }, [contextLoading]); // Only run once when loading completes

  // Helper function to add timeout to async operations
  const withTimeout = (promise, timeoutMs = 30000, operationName = 'Operation') => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`${operationName} timed out after ${timeoutMs/1000} seconds`)), timeoutMs)
      )
    ]);
  };

  // Safeguard: If GCC user somehow ends up on visa check step, skip to payment
  // This runs whenever the step or relocation type changes
  useEffect(() => {
    if (onboardingData.relocationType === 'gcc' && (currentMainStep === 2 || currentMainStep === 2.5)) {
      console.log('⚠️ SAFEGUARD TRIGGERED: GCC user on visa check step - redirecting to payment');
      console.log('⚠️ Current step:', currentMainStep);
      console.log('⚠️ Relocation type:', onboardingData.relocationType);
      console.log('⚠️ This should NEVER happen for GCC users');
      setCurrentMainStep(3);
      setCurrentStep(3);
    }
  }, [currentMainStep, onboardingData.relocationType]);

  const handleRelocationTypeSelect = async (type) => {
    console.log('🌍 Relocation type selected:', type);
    console.log('🔍 Current relocationType in context:', onboardingData.relocationType);

    // Check if user is re-selecting the same type they already chose
    const isSameSelection = onboardingData.relocationType === type;

    if (isSameSelection) {
      console.log('✅ Same selection - just moving forward to step 1');
      setCurrentMainStep(1);
      await setCurrentStep(1);
      return;
    }

    setLoading(true);

    try {
      // Update context state AND save to database (only if it's a NEW selection)
      console.log('💾 New selection - Calling setRelocationType...');
      const updatedData = await setRelocationType(type);

      console.log('✅ setRelocationType completed');

      // Pass the updated data to markStepCompleted to avoid stale state
      const completedData = await markStepCompleted(0, updatedData);

      console.log('✅ Relocation type saved successfully:', type);
      console.log('✅ Moving to step 1 (Personal Details)');

      // Move to next step - pass the completed data to avoid stale state
      setCurrentMainStep(1);
      await setCurrentStep(1, completedData);
    } catch (error) {
      console.error('❌ Error setting relocation type:', error);
      setToast({ message: 'Failed to save selection. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
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

  const handlePersonalDetailsSubmit = async () => {
    if (!validatePersonalDetails()) {
      return;
    }

    // CRITICAL CHECK: Make sure relocation type is set before proceeding
    let relocType = onboardingData.relocationType;

    console.log('🔍 relocationType from context:', relocType);

    if (!relocType || (relocType !== 'gcc' && relocType !== 'europe')) {
      console.error('🚨 CRITICAL: Relocation type is not set or invalid!');
      console.error('🚨 This should NOT happen - user should not be on step 1 without selecting region');
      setToast({
        message: 'Please select your destination (GCC or Europe) first.',
        type: 'error'
      });
      setCurrentMainStep(0); // Force them back to step 0
      return;
    }

    console.log('📝 Saving personal details to database...');
    console.log('✅ Relocation type validated:', relocType);
    console.log('📋 Personal form data being saved:', {
      fullName: personalForm.fullName,
      email: personalForm.email,
      telephone: personalForm.telephone,
      street: personalForm.street,
      city: personalForm.city,
      state: personalForm.state,
      zip: personalForm.zip,
      country: personalForm.country
    });
    
    console.log('⏳ Setting loading to true...');
    setLoading(true);

    try {
      console.log('🔄 Starting database save process...');

      // Save to database immediately
      const detailsToSave = {
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
      };

      console.log('💾 Calling updatePersonalDetails with:', JSON.stringify(detailsToSave, null, 2));

      // Remove timeout wrapper - let it complete naturally
      const updatedData = await updatePersonalDetails(detailsToSave);

      console.log('✅ updatePersonalDetails completed, marking step 1 as complete...');

      // Pass the updated data to markStepCompleted to avoid stale state
      const completedData = await markStepCompleted(1, updatedData);

      console.log('✅ Personal details saved to database successfully');
      console.log('📊 Completed data:', completedData);

      // Move to next step based on relocation type
      if (relocType === 'gcc') {
        console.log('➡️ GCC selected - going directly to payment (skipping visa check)');
        console.log('➡️ Setting currentMainStep to 3 (Payment)');
        await setCurrentStep(3, completedData); // Update context current step

        // Turn off loading BEFORE state update to prevent UI freeze
        setLoading(false);

        // Small delay to ensure state is synced
        await new Promise(resolve => setTimeout(resolve, 100));
        setCurrentMainStep(3); // Go to payment
      } else if (relocType === 'europe') {
        console.log('➡️ Europe selected - going to visa check');
        await setCurrentStep(2, completedData); // Update context current step

        // Turn off loading BEFORE state update to prevent UI freeze
        setLoading(false);

        // Small delay to ensure state is synced
        await new Promise(resolve => setTimeout(resolve, 100));
        setCurrentMainStep(2); // Go to visa check
        setVisaQuestionStep(0); // Reset visa questions to start
      }
    } catch (error) {
      console.error('❌ Error saving personal details:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack
      });

      setLoading(false);

      setToast({
        message: `Failed to save personal details: ${error.message || 'Unknown error'}. Please try again.`,
        type: 'error'
      });
    }
  };

  const handleVisaQuestionNext = async () => {
    if (visaQuestionStep < 8) {
      setVisaQuestionStep(visaQuestionStep + 1);
    } else {
      // All questions answered, calculate eligibility
      console.log('📝 Saving visa check answers to database...');
      
      // Save visa check data to database
      const updatedData = await updateVisaCheck(visaForm);
      await markStepCompleted(2, updatedData);
      
      const result = calculateVisaEligibility(visaForm);
      await setVisaEligibility(result.eligible ? 'eligible' : 'not_eligible');
      
      console.log('✅ Visa check saved to database');
      setCurrentMainStep(2.5); // Show result screen
    }
  };

  const handleVisaQuestionBack = async () => {
    if (visaQuestionStep > 0) {
      setVisaQuestionStep(visaQuestionStep - 1);
    } else {
      // Save current step before navigating back
      await setCurrentStep(1, onboardingData);
      setCurrentMainStep(1);
    }
  };

  const proceedToPayment = async () => {
    setLoading(true);
    try {
      await setCurrentStep(3);
      setCurrentMainStep(3);
    } finally {
      setLoading(false);
    }
  };


  // Handle plan selection - Redirect to unified payment page (PayPal + Tilopay)
  const handlePlanSelection = (plan) => {
    console.log('📦 Plan selected:', plan.name);
    // Redirect to unified payment page with PayPal as primary and Tilopay as fallback
    // URL encode the plan name to handle special characters like '+'
    const planSlug = encodeURIComponent(plan.name.toLowerCase());
    router.push(`/payment-unified?plan=${planSlug}`);
  };


  const handleScheduleCall = async () => {
    if (!callDate || !callTime) {
      setToast({ message: 'Please select both date and time for your onboarding call', type: 'error' });
      return;
    }

    console.log('📅 Saving call schedule to database...');
    
    // Save call schedule to database immediately
    const updatedData = await scheduleCall({
      date: callDate,
      time: callTime,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      scheduledAt: new Date().toISOString()
    });

    await markStepCompleted(4, updatedData);
    
    console.log('✅ Call schedule saved to database');
    
    setToast({ message: 'Call scheduled successfully!', type: 'success' });
    setTimeout(() => {
      setCurrentMainStep(5);
      setCurrentStep(5);
    }, 1000);
  };

  const handleDocumentUpload = (docType, file) => {
    console.log('📄 Document selected:', { type: docType, fileName: file?.name, size: file?.size });
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

    console.log('📤 Starting document upload...');
    console.log('Documents to upload:', {
      passport: documents.passport?.name,
      certificates: documents.educationalCertificates?.length,
      experience: documents.experienceLetters?.length,
      jobOffer: documents.jobOffer?.name
    });

    setLoading(true);

    try {
      // Import storage utility
      const { uploadDocument, STORAGE_BUCKETS, DOCUMENT_TYPES } = await import('../lib/storage');

      const uploadResults = {
        passport: null,
        educationalCertificates: [],
        experienceLetters: [],
        jobOffer: null
      };

      // Upload passport (required)
      if (documents.passport) {
        console.log('⬆️ Uploading passport...');
        const passportResult = await uploadDocument(
          documents.passport,
          user.id,
          DOCUMENT_TYPES.PASSPORT,
          STORAGE_BUCKETS.DOCUMENTS
        );

        if (passportResult.success) {
          console.log('✅ Passport uploaded successfully:', passportResult.filePath);
          uploadResults.passport = passportResult.filePath;
        } else {
          console.error('❌ Passport upload failed:', passportResult.error);
          setToast({ message: 'Failed to upload passport: ' + passportResult.error, type: 'error' });
          setLoading(false);
          return;
        }
      }

      // Upload certificates (optional)
      if (documents.educationalCertificates && documents.educationalCertificates.length > 0) {
        console.log('⬆️ Uploading certificates...');
        for (const cert of documents.educationalCertificates) {
          const certResult = await uploadDocument(
            cert,
            user.id,
            DOCUMENT_TYPES.CERTIFICATE,
            STORAGE_BUCKETS.DOCUMENTS
          );
          if (certResult.success) {
            console.log('✅ Certificate uploaded:', cert.name);
            uploadResults.educationalCertificates.push(certResult.filePath);
          } else {
            console.log('❌ Certificate failed:', cert.name, certResult.error);
          }
        }
      }

      // Upload experience letters (optional)
      if (documents.experienceLetters && documents.experienceLetters.length > 0) {
        console.log('⬆️ Uploading experience letters...');
        for (const exp of documents.experienceLetters) {
          const expResult = await uploadDocument(
            exp,
            user.id,
            DOCUMENT_TYPES.EXPERIENCE,
            STORAGE_BUCKETS.DOCUMENTS
          );
          if (expResult.success) {
            console.log('✅ Experience uploaded:', exp.name);
            uploadResults.experienceLetters.push(expResult.filePath);
          } else {
            console.log('❌ Experience failed:', exp.name, expResult.error);
          }
        }
      }

      // Upload job offer (optional)
      if (documents.jobOffer) {
        console.log('⬆️ Uploading job offer...');
        const jobOfferResult = await uploadDocument(
          documents.jobOffer,
          user.id,
          DOCUMENT_TYPES.JOB_OFFER,
          STORAGE_BUCKETS.DOCUMENTS
        );
        if (jobOfferResult.success) {
          console.log('✅ Job offer uploaded:', documents.jobOffer.name);
          uploadResults.jobOffer = jobOfferResult.filePath;
        } else {
          console.log('❌ Job offer failed:', documents.jobOffer.name, jobOfferResult.error);
        }
      }

      console.log('✅ All documents uploaded successfully!');

      // Save document metadata to database (file paths, not file objects)
      console.log('💾 Saving document metadata to database...');

      const updatedData = await uploadDocuments(uploadResults);
      await markStepCompleted(5, updatedData);

      console.log('✅ All data saved to database!');
      console.log('🔄 Reloading user profile to check onboarding status...');

      // Reload user profile to get updated onboarding_complete flag
      if (reloadUserProfile) {
        await reloadUserProfile();
      }

      // Wait a moment for profile to update
      await new Promise(resolve => setTimeout(resolve, 500));

      setLoading(false);

      setToast({
        message: 'Onboarding complete! Redirecting to dashboard...',
        type: 'success',
        duration: 2000
      });

      // Auto-redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard/customer';
      }, 2000);

    } catch (error) {
      console.error('❌ Document upload error:', error);
      setToast({ message: 'Document upload failed: ' + error.message, type: 'error' });
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const getTotalSteps = () => {
    // ONLY return total if we have a valid relocation type selected
    if (onboardingData.relocationType === 'gcc') return 5;
    if (onboardingData.relocationType === 'europe') return 6;
    return 6; // Default to Europe flow if not selected yet
  };

  const getCurrentStepNumber = () => {
    const isGCC = onboardingData.relocationType === 'gcc';
    const isEurope = onboardingData.relocationType === 'europe';

    // Step 0: Destination Selection
    if (currentMainStep === 0) return 1;

    // Step 1: Personal Details
    if (currentMainStep === 1) return 2;

    // Step 2/2.5: Visa Check (ONLY for Europe - GCC should NEVER be here)
    if (currentMainStep === 2 || currentMainStep === 2.5) {
      if (isGCC) {
        // GCC users should NEVER be on visa check - something is wrong
        console.error('🚨 GCC user on visa check step - this should not happen!');
        return 2; // Show step 2 to avoid confusion
      }
      return isEurope ? 3 : 2;
    }

    // Step 3: Payment
    if (currentMainStep === 3) {
      return isGCC ? 3 : (isEurope ? 4 : 3);
    }

    // Step 4: Call Scheduling
    if (currentMainStep === 4) {
      return isGCC ? 4 : (isEurope ? 5 : 4);
    }

    // Step 5: Document Upload
    if (currentMainStep === 5) {
      return isGCC ? 5 : (isEurope ? 6 : 5);
    }

    return 1;
  };

  const getStepName = () => {
    const isGCC = onboardingData.relocationType === 'gcc';

    if (currentMainStep === 0) return 'Destination';
    if (currentMainStep === 1) return 'Personal Details';

    // For GCC users, step 2 should NEVER show "Visa Check"
    if (currentMainStep === 2 || currentMainStep === 2.5) {
      return isGCC ? 'Payment' : 'Visa Check';
    }

    if (currentMainStep === 3) return 'Payment';
    if (currentMainStep === 4) return 'Schedule Call';
    if (currentMainStep === 5) return 'Upload Documents';
    return 'Getting Started';
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
    } else if (onboardingData.relocationType === 'gcc') {
      // GCC flow: Destination, Details, Payment, Call, Documents (no visa check)
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
    <div className="min-h-screen desert-sand-bg-subtle" style={{ fontSize: '14px' }}>
      {/* Header - Same as landing page */}
      <header className="fixed w-full z-50 pt-4">
        <div className="w-full px-6">
          <div
            className="backdrop-blur-lg px-8 py-3 transition-all duration-300"
            style={{
              backgroundColor: 'rgba(251, 247, 235, 0.95)',
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
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                    Step {getCurrentStepNumber()} of {getTotalSteps()}
                  </span>
                  <span className="text-sm text-gray-600">•</span>
                  <span className="text-sm text-gray-600">{getStepName()}</span>
                </div>

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

      {/* Show loading screen while fetching data from database */}
      {contextLoading ? (
        <div className="pt-10 pb-8 px-3 md:px-4">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-2xl p-12 shadow-xl text-center" style={{ backgroundColor: 'white', border: '2px solid rgba(187, 40, 44, 0.2)' }}>
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-solid border-current border-r-transparent" style={{ borderColor: 'rgba(187, 40, 44, 1)', borderRightColor: 'transparent' }}></div>
              <p className="mt-6 text-lg font-medium" style={{ color: 'rgba(3, 50, 83, 1)' }}>Loading your onboarding data...</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Main Content */}
          <div className="pt-10 pb-8 px-3 md:px-4">
            <div className="max-w-5xl mx-auto">
          {/* Progress Steps - Modern Design with semi-transparent background */}
          <div className="mb-4">
            <div
              className="rounded-xl px-3 py-2.5 md:px-4 md:py-3 shadow-lg backdrop-blur-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid rgba(187, 40, 44, 0.2)'
              }}
            >
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
                {['Destination', 'Details', onboardingData.relocationType === 'europe' ? 'Visa Check' : '', 'Payment', 'Call', 'Documents'].filter(Boolean).map((step, index) => {
                  const stepNumber = index + 1;
                  const isComplete = stepNumber < getCurrentStepNumber();
                  const isCurrent = stepNumber === getCurrentStepNumber();
                  const isClickable = stepNumber <= getCurrentStepNumber();

                  return (
                    <div
                      key={stepNumber}
                      className={`flex flex-col items-center relative ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      onClick={() => isClickable && navigateToStep(stepNumber)}
                    >
                      <div
                        className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-[10px] md:text-xs transition-all duration-300 ${
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
                        {isComplete ? <Check className="w-3 h-3" /> : stepNumber}
                      </div>
                      <span className={`mt-1 text-[9px] md:text-[10px] font-medium text-center leading-tight ${isCurrent ? 'text-gray-900' : 'text-gray-600'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content Card */}
          <div
            className="rounded-2xl p-6 md:p-8 shadow-xl relative"
            style={{
              backgroundColor: 'white',
              border: '2px solid rgba(187, 40, 44, 0.2)'
            }}
          >
            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" style={{ borderColor: 'rgba(187, 40, 44, 1)', borderRightColor: 'transparent' }} role="status">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                  </div>
                  <p className="mt-4 text-sm font-medium" style={{ color: 'rgba(3, 50, 83, 1)' }}>Processing...</p>
                </div>
              </div>
            )}

            {/* Step 0: Relocation Type Selection */}
            {currentMainStep === 0 && (() => {
              console.log('🎨 Rendering Step 0 - Destination Selection');
              console.log('🔍 onboardingData.relocationType:', onboardingData.relocationType);

              return (
              <div>
                <div className="text-center mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                    Welcome, {user.name}!
                  </h1>
                  <p className="text-base text-gray-600">Where do you see your future?</p>
                  {onboardingData.relocationType && (
                    <p className="text-sm text-gray-500 mt-2">
                      Current selection: <span className="font-semibold capitalize">{onboardingData.relocationType === 'gcc' ? 'GCC Countries' : 'Europe'}</span>
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Europe Option */}
                  <button
                    onClick={() => handleRelocationTypeSelect('europe')}
                    disabled={loading}
                    className="group rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left relative h-64 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      border: onboardingData.relocationType === 'europe'
                        ? '3px solid rgba(34, 197, 94, 1)'
                        : '2px solid rgba(187, 40, 44, 0.3)',
                      boxShadow: onboardingData.relocationType === 'europe'
                        ? '0 0 20px rgba(34, 197, 94, 0.3)'
                        : undefined
                    }}
                  >
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{
                        backgroundImage: 'url(https://static.vecteezy.com/system/resources/previews/025/484/310/non_2x/illuminated-national-landmark-izes-city-rich-history-generated-by-ai-free-photo.jpg)',
                        filter: 'brightness(0.7)'
                      }}
                    />

                    {/* Dark overlay for better text visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-end p-6">
                      {onboardingData.relocationType === 'europe' && (
                        <div className="absolute top-4 right-4 bg-green-500 rounded-full p-2">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <h2 className="text-2xl font-bold mb-2 text-white">
                        Europe
                      </h2>
                      <p className="text-sm text-white/90 mb-4">
                        Check your visa eligibility for Germany (Work, Study, Family, or Business Visas)
                      </p>
                      <div className="flex items-center text-sm font-semibold text-white">
                        <span>{onboardingData.relocationType === 'europe' ? 'Selected' : 'Select Europe'}</span>
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </button>

                  {/* GCC Option */}
                  <button
                    onClick={() => handleRelocationTypeSelect('gcc')}
                    disabled={loading}
                    className="group rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left relative h-64 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      border: onboardingData.relocationType === 'gcc'
                        ? '3px solid rgba(34, 197, 94, 1)'
                        : '2px solid rgba(187, 40, 44, 0.3)',
                      boxShadow: onboardingData.relocationType === 'gcc'
                        ? '0 0 20px rgba(34, 197, 94, 0.3)'
                        : undefined
                    }}
                  >
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{
                        backgroundImage: 'url(https://static.vecteezy.com/system/resources/thumbnails/002/458/539/small_2x/manama-bahrain-nov-11-2016-view-of-bahrain-skyline-along-with-a-dramatic-sky-in-the-background-during-sunset-photo.jpg)',
                        filter: 'brightness(0.7)'
                      }}
                    />

                    {/* Dark overlay for better text visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-end p-6">
                      {onboardingData.relocationType === 'gcc' && (
                        <div className="absolute top-4 right-4 bg-green-500 rounded-full p-2">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <h2 className="text-2xl font-bold mb-2 text-white">
                        GCC Countries
                      </h2>
                      <p className="text-sm text-white/90 mb-4">
                        UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman
                      </p>
                      <div className="flex items-center text-sm font-semibold text-white">
                        <span>{onboardingData.relocationType === 'gcc' ? 'Selected' : 'Select GCC'}</span>
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>
              );
            })()}

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
                      onClick={async () => {
                        console.log('🔙 Back button clicked from step 1 to step 0');
                        // Save current step to database before navigating back
                        await setCurrentStep(0, onboardingData);
                        setCurrentMainStep(0);
                      }}
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
                      disabled={loading}
                      className="flex-1 px-6 py-4 rounded-2xl font-semibold text-white transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}
                    >
                      {loading ? 'Saving...' : 'Next'}
                      {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 2: Visa Check Questions (Europe only) */}
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

            {/* Step 2.5: Visa Result Screen (Europe only) */}
            {currentMainStep === 2.5 && onboardingData.relocationType === 'europe' && (() => {
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
                        <p className="text-2xl font-semibold" style={{ color: 'rgba(34, 197, 94, 1)' }}>
                          Quick visa check - Reliable for applying for visa
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
                      price: '$1',
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
                      onClick={() => handlePlanSelection(plan)}
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
                  🔒 Secure payment powered by PayPal and Tilopay. All plans include a consultation call.
                </p>
              </div>
            )}

            {/* Step 4: Schedule Call */}
            {currentMainStep === 4 && (
              <div>
                <div className="text-center mb-6">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                    <Calendar className="w-16 h-16" style={{ color: 'rgba(34, 197, 94, 1)' }} />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                    Schedule Your Onboarding Call
                  </h2>
                  <p className="text-gray-600">Book a consultation with our relocation specialist</p>
                </div>

                <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '2px solid rgba(59, 130, 246, 0.3)' }}>
                  <div className="flex items-start">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5 mr-2" style={{ color: 'rgba(59, 130, 246, 1)' }} />
                    <p className="text-sm text-gray-700">
                      During this 30-minute call, our specialist will review your application, answer questions, and provide guidance on your relocation journey.
                    </p>
                  </div>
                </div>

                {/* Calendly Embedded Widget */}
                <div className="rounded-2xl overflow-hidden" style={{ border: '2px solid rgba(187, 40, 44, 0.2)' }}>
                  <iframe
                    src="https://calendly.com/kc-orth3107/onboarding-call-"
                    width="100%"
                    height="700"
                    frameBorder="0"
                    style={{ minWidth: '320px' }}
                  ></iframe>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={async () => {
                      console.log('📅 Saving Calendly booking to database...');
                      
                      // Mark step as completed and move to next step
                      const updatedData = await scheduleCall({
                        calendlyBooked: true,
                        scheduledAt: new Date().toISOString()
                      });
                      await markStepCompleted(4, updatedData);
                      
                      console.log('✅ Calendly booking saved to database');
                      
                      setToast({ message: 'Please proceed to the next step after booking your call', type: 'success' });
                      setTimeout(() => {
                        setCurrentMainStep(5);
                        setCurrentStep(5);
                      }, 1500);
                    }}
                    className="px-8 py-4 rounded-2xl font-semibold text-white transition-all flex items-center justify-center hover:opacity-90 mx-auto"
                    style={{ backgroundColor: 'rgba(34, 197, 94, 1)' }}
                  >
                    I've Booked My Call - Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                  <p className="text-xs text-gray-500 mt-3">Click the button above after scheduling your call to continue</p>
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
      </>
      )}
    </div>
  );
}
