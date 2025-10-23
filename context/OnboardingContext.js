import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './AuthContext';

const OnboardingContext = createContext();

export function OnboardingProvider({ children }) {
  const router = useRouter();
  const { user } = useAuth();

  // Helper function to get user-specific storage key
  const getStorageKey = () => {
    return user?.email ? `onboardingData_${user.email}` : 'onboardingData';
  };

  // Load state from localStorage if it exists
  const [onboardingData, setOnboardingData] = useState(() => {
    if (typeof window !== 'undefined') {
      const storageKey = user?.email ? `onboardingData_${user.email}` : 'onboardingData';
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {
        // Step 0: Relocation Destination
        relocationType: '', // 'europe' or 'gcc'

        // Step 1: Personal Details
        personalDetails: {
          fullName: '',
          email: '',
          telephone: '',
          address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: ''
          }
        },

        // Step 2: Visa Check (only for Europe)
        visaCheck: {
          stayLongerThan90Days: '',
          citizenship: '',
          englishLevel: '',
          jobOffer: '',
          education: '',
          specialRegulation: '',
          educationCountry: '',
          degreeRecognized: '',
          workExperience: ''
        },

        visaEligibilityResult: null, // 'eligible' or 'not_eligible'

        // Step 3: Payment
        paymentCompleted: false,
        paymentDetails: null,

        // Step 4: Onboarding Call
        onboardingCallScheduled: false,
        callScheduleDetails: null,

        // Step 5: Document Upload
        documentsUploaded: false,
        documents: {
          passport: null,
          educationalCertificates: [],
          experienceLetters: [],
          jobOffer: null
        },

        // Progress tracking
        currentStep: 0,
        completedSteps: [],
        lastUpdated: null
      };
    }
    return {};
  });

  // Save to localStorage whenever data changes (user-specific)
  useEffect(() => {
    if (typeof window !== 'undefined' && onboardingData && user) {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(onboardingData));
    }
  }, [onboardingData, user]);

  // Load user-specific data when user changes
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const storageKey = getStorageKey();
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setOnboardingData(JSON.parse(saved));
      } else {
        // Reset to initial state for new user
        resetOnboarding();
      }
    }
  }, [user?.email]);

  const updatePersonalDetails = (details) => {
    setOnboardingData(prev => ({
      ...prev,
      personalDetails: { ...prev.personalDetails, ...details },
      lastUpdated: new Date().toISOString()
    }));
  };

  const updateVisaCheck = (visaData) => {
    setOnboardingData(prev => ({
      ...prev,
      visaCheck: { ...prev.visaCheck, ...visaData },
      lastUpdated: new Date().toISOString()
    }));
  };

  const setRelocationType = (type) => {
    setOnboardingData(prev => ({
      ...prev,
      relocationType: type,
      lastUpdated: new Date().toISOString()
    }));
  };

  const setVisaEligibility = (result) => {
    setOnboardingData(prev => ({
      ...prev,
      visaEligibilityResult: result,
      lastUpdated: new Date().toISOString()
    }));
  };

  const completePayment = (paymentDetails) => {
    setOnboardingData(prev => ({
      ...prev,
      paymentCompleted: true,
      paymentDetails,
      lastUpdated: new Date().toISOString()
    }));
  };

  const scheduleCall = (callDetails) => {
    setOnboardingData(prev => ({
      ...prev,
      onboardingCallScheduled: true,
      callScheduleDetails: callDetails,
      lastUpdated: new Date().toISOString()
    }));
  };

  const uploadDocuments = (documents) => {
    setOnboardingData(prev => ({
      ...prev,
      documentsUploaded: true,
      documents: { ...prev.documents, ...documents },
      lastUpdated: new Date().toISOString()
    }));
  };

  const setCurrentStep = (step) => {
    setOnboardingData(prev => ({
      ...prev,
      currentStep: step,
      lastUpdated: new Date().toISOString()
    }));
  };

  const markStepCompleted = (step) => {
    setOnboardingData(prev => ({
      ...prev,
      completedSteps: [...new Set([...prev.completedSteps, step])],
      lastUpdated: new Date().toISOString()
    }));
  };

  const isStepCompleted = (step) => {
    return onboardingData.completedSteps?.includes(step) || false;
  };

  const resetOnboarding = () => {
    const initialState = {
      relocationType: '',
      personalDetails: {
        fullName: '',
        email: '',
        telephone: '',
        address: { street: '', city: '', state: '', zip: '', country: '' }
      },
      visaCheck: {
        stayLongerThan90Days: '',
        citizenship: '',
        englishLevel: '',
        jobOffer: '',
        education: '',
        specialRegulation: '',
        educationCountry: '',
        degreeRecognized: '',
        workExperience: ''
      },
      visaEligibilityResult: null,
      paymentCompleted: false,
      paymentDetails: null,
      onboardingCallScheduled: false,
      callScheduleDetails: null,
      documentsUploaded: false,
      documents: {
        passport: null,
        educationalCertificates: [],
        experienceLetters: [],
        jobOffer: null
      },
      currentStep: 0,
      completedSteps: [],
      lastUpdated: null
    };

    setOnboardingData(initialState);
    if (typeof window !== 'undefined' && user) {
      const storageKey = getStorageKey();
      localStorage.removeItem(storageKey);
    }
  };

  // Check if user can access dashboard
  const canAccessDashboard = () => {
    const { relocationType, completedSteps, paymentCompleted, onboardingCallScheduled, documentsUploaded } = onboardingData;

    if (relocationType === 'gcc') {
      // GCC: Only need payment, call, and documents
      return paymentCompleted && onboardingCallScheduled && documentsUploaded;
    } else if (relocationType === 'europe') {
      // Europe: Need all steps including visa check
      return (
        completedSteps.includes(1) && // Personal details
        completedSteps.includes(2) && // Visa check
        paymentCompleted &&
        onboardingCallScheduled &&
        documentsUploaded
      );
    }

    return false;
  };

  const value = {
    onboardingData,
    updatePersonalDetails,
    updateVisaCheck,
    setRelocationType,
    setVisaEligibility,
    completePayment,
    scheduleCall,
    uploadDocuments,
    setCurrentStep,
    markStepCompleted,
    isStepCompleted,
    resetOnboarding,
    canAccessDashboard
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

export default OnboardingContext;
