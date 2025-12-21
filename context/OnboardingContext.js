import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const OnboardingContext = createContext();

export function OnboardingProvider({ children }) {
  const { user } = useAuth();

  // Helper function to get initial state
  const getInitialState = () => ({
    relocationType: '',
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
    tempDocumentMetadata: {
      passport: null,
      educationalCertificates: [],
      experienceLetters: [],
      jobOffer: null
    },
    currentStep: 0,
    completedSteps: [],
    lastUpdated: null
  });

  const [onboardingData, setOnboardingData] = useState(getInitialState());
  const [loading, setLoading] = useState(true);

  // Load onboarding data from database when user logs in
  useEffect(() => {
    if (user?.id) {
      loadOnboardingData();
    } else {
      setOnboardingData(getInitialState());
      setLoading(false);
    }
  }, [user?.id]);

  const loadOnboardingData = async () => {
    try {
      setLoading(true);
      console.log('📂 Loading from database...');
      await fetchFromDatabase();
    } catch (error) {
      console.error('Exception loading onboarding data:', error);
      setOnboardingData(getInitialState());
      setLoading(false);
    }
  };

  const fetchFromDatabase = async () => {
    try {
      // Add timeout to prevent hanging on initial load
      const fetchPromise = supabase
        .from('onboarding_data')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          console.log('⚠️ Database fetch timeout, using default data');
          resolve({ data: null, error: null });
        }, 3000);
      });

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading from database:', error);
        return;
      }

      if (data) {
        const loadedData = {
          relocationType: data.relocation_type || '',
          personalDetails: data.personal_details || getInitialState().personalDetails,
          visaCheck: data.visa_check || getInitialState().visaCheck,
          visaEligibilityResult: data.visa_eligibility_result || null,
          paymentCompleted: data.payment_completed || false,
          paymentDetails: data.payment_details || null,
          onboardingCallScheduled: data.call_scheduled || false,
          callScheduleDetails: data.call_details || null,
          documentsUploaded: data.documents_uploaded || false,
          documents: data.documents || getInitialState().documents,
          tempDocumentMetadata: data.temp_document_metadata || getInitialState().tempDocumentMetadata,
          currentStep: data.current_step || 0,
          completedSteps: data.completed_steps || [],
          lastUpdated: data.updated_at
        };
        
        // Pre-fill email from user profile if missing in database
        if (!loadedData.personalDetails?.email && user?.email) {
          console.log('🔧 Pre-filling email from user profile:', user.email);
          loadedData.personalDetails = {
            ...loadedData.personalDetails,
            email: user.email,
            fullName: loadedData.personalDetails?.fullName || user.name || '',
            telephone: loadedData.personalDetails?.telephone || user.phone || ''
          };
        }
        
        console.log('📂 Loaded from database:', loadedData);
        setOnboardingData(loadedData);
      } else {
        // No data in database, initialize with user profile data
        const initialData = getInitialState();
        initialData.personalDetails = {
          ...initialData.personalDetails,
          email: user?.email || '',
          fullName: user?.name || '',
          telephone: user?.phone || ''
        };
        console.log('📂 No database data, initializing with user profile');
        setOnboardingData(initialData);
      }
    } catch (error) {
      console.error('Error in fetchFromDatabase:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save to Supabase whenever data changes
  const saveToDatabase = async (updatedData) => {
    if (!user?.id) {
      console.warn('⚠️ Cannot save onboarding data: no user logged in');
      throw new Error('User not logged in');
    }

    try {
      console.log('💾 Starting database save...');
      
      // Ensure completed_steps are all integers (PostgreSQL INTEGER[] requirement)
      const completedStepsAsIntegers = (updatedData.completedSteps || []).map(s =>
        typeof s === 'string' ? parseInt(s, 10) : s
      );

      // Map local state to database fields
      const dbData = {
        user_id: user.id,
        relocation_type: updatedData.relocationType || null,
        personal_details: updatedData.personalDetails || {},
        visa_check: updatedData.visaCheck || {},
        visa_eligibility_result: updatedData.visaEligibilityResult || null,
        payment_completed: updatedData.paymentCompleted || false,
        payment_details: updatedData.paymentDetails || {},
        call_scheduled: updatedData.onboardingCallScheduled || false,
        call_details: updatedData.callScheduleDetails || {},
        documents_uploaded: updatedData.documentsUploaded || false,
        documents: updatedData.documents || {},
        temp_document_metadata: updatedData.tempDocumentMetadata || {},
        current_step: updatedData.currentStep || 0,
        completed_steps: completedStepsAsIntegers,
        updated_at: new Date().toISOString()
      };

      console.log('📊 Saving data:', { userId: user.id, step: dbData.current_step, completedSteps: dbData.completed_steps });

      // Use Promise.race to add timeout (30 seconds)
      const savePromise = supabase
        .from('onboarding_data')
        .upsert(dbData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database save timeout after 30s')), 30000)
      );

      const { data, error } = await Promise.race([savePromise, timeoutPromise]);

      if (error) {
        console.error('❌ Database save error:', error.message);
        console.error('Error details:', error);
        throw new Error(`Database save failed: ${error.message}`);
      }

      console.log('✅ Database save successful!');
      return data;
    } catch (error) {
      console.error('❌ EXCEPTION in saveToDatabase:', error);
      console.error('❌ Exception message:', error.message);
      if (error.stack) console.error('Stack:', error.stack);
      throw error;
    }
  };

  const updatePersonalDetails = async (details) => {
    console.log('📝 Updating personal details...');

    const updatedData = {
      ...onboardingData,
      personalDetails: { ...onboardingData.personalDetails, ...details },
      lastUpdated: new Date().toISOString()
    };

    setOnboardingData(updatedData);

    // Wait for database save to complete
    await saveToDatabase(updatedData);

    // Update profile (also wait for this)
    if (user?.id && details) {
      const profileUpdates = {};
      if (details.fullName) profileUpdates.full_name = details.fullName;
      if (details.email) profileUpdates.email = details.email;
      if (details.telephone) profileUpdates.phone = details.telephone;
      if (details.address?.country) profileUpdates.country = details.address.country;

      if (Object.keys(profileUpdates).length > 0) {
        await supabase.from('profiles').update(profileUpdates).eq('id', user.id);
        console.log('✅ Profile updated');
      }
    }

    return updatedData;
  };

  const updateVisaCheck = async (visaData) => {
    console.log('📝 Updating visa check...');

    const updatedData = {
      ...onboardingData,
      visaCheck: { ...onboardingData.visaCheck, ...visaData },
      lastUpdated: new Date().toISOString()
    };
    setOnboardingData(updatedData);

    // Wait for database save
    await saveToDatabase(updatedData);

    return updatedData;
  };

  const setRelocationType = async (type) => {
    console.log('🌍 Setting relocation type:', type);

    const updatedData = {
      ...onboardingData,
      relocationType: type,
      lastUpdated: new Date().toISOString()
    };

    setOnboardingData(updatedData);

    // Wait for database save
    await saveToDatabase(updatedData);

    return updatedData;
  };

  const setVisaEligibility = async (result) => {
    console.log('🔍 Setting visa eligibility:', result);

    const updatedData = {
      ...onboardingData,
      visaEligibilityResult: result,
      lastUpdated: new Date().toISOString()
    };
    setOnboardingData(updatedData);

    // Wait for database save
    await saveToDatabase(updatedData);

    return updatedData;
  };

  const completePayment = async (paymentDetails) => {
    const updatedData = {
      ...onboardingData,
      paymentCompleted: true,
      paymentDetails,
      lastUpdated: new Date().toISOString()
    };
    setOnboardingData(updatedData);
    await saveToDatabase(updatedData);

    // Return updated data so caller can use it immediately (avoid stale state)
    return updatedData;
  };

  const initiateTilopayPayment = async ({ amount, planName, currency = 'USD' }) => {
    if (!user?.id) {
      throw new Error('User must be logged in to initiate payment');
    }

    const personalDetails = onboardingData.personalDetails || {};

    try {
      const response = await fetch('/api/tilopay/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount,
          planName,
          currency,
          email: personalDetails.email || user.email,
          firstName: personalDetails.fullName?.split(' ')[0] || 'Customer',
          lastName: personalDetails.fullName?.split(' ').slice(1).join(' ') || '',
          address: personalDetails.address?.street || '',
          city: personalDetails.address?.city || '',
          state: personalDetails.address?.state || '',
          country: personalDetails.address?.country || 'CR',
          phone: personalDetails.telephone || ''
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      return data;
    } catch (error) {
      console.error('Error initiating Tilopay payment:', error);
      throw error;
    }
  };

  const verifyPayment = async (paymentId) => {
    if (!user?.id) {
      throw new Error('User must be logged in to verify payment');
    }

    try {
      const response = await fetch('/api/tilopay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          userId: user.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify payment');
      }

      // If payment is completed, update onboarding data
      if (data.success && data.status === 'completed') {
        await completePayment({
          plan: data.plan,
          amount: data.amount,
          currency: 'USD',
          timestamp: data.updatedAt,
          transactionId: data.transactionId,
          orderNumber: data.orderNumber,
          paymentMethod: 'tilopay'
        });
      }

      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  };

  const scheduleCall = async (callDetails) => {
    console.log('📞 Scheduling call...');

    const updatedData = {
      ...onboardingData,
      onboardingCallScheduled: true,
      callScheduleDetails: callDetails,
      lastUpdated: new Date().toISOString()
    };
    setOnboardingData(updatedData);

    // Wait for database save
    await saveToDatabase(updatedData);

    return updatedData;
  };

  const saveTempDocumentMetadata = async (metadata) => {
    console.log('📄 Saving temp document metadata...');

    const updatedData = {
      ...onboardingData,
      tempDocumentMetadata: { ...onboardingData.tempDocumentMetadata, ...metadata },
      lastUpdated: new Date().toISOString()
    };

    setOnboardingData(updatedData);

    // Wait for database save
    await saveToDatabase(updatedData);

    return updatedData;
  };

  const uploadDocuments = async (documents) => {
    console.log('📦 uploadDocuments called with:', documents);

    const updatedData = {
      ...onboardingData,
      documentsUploaded: true,
      documents: { ...onboardingData.documents, ...documents },
      tempDocumentMetadata: getInitialState().tempDocumentMetadata, // Clear temp metadata
      lastUpdated: new Date().toISOString()
    };

    setOnboardingData(updatedData);

    // Wait for database save
    await saveToDatabase(updatedData);

    // Check if onboarding is complete and update profile
    const isComplete = checkOnboardingComplete(updatedData);
    console.log('🔍 Onboarding complete?', isComplete);

    if (isComplete && user?.id) {
      // Wait for profile update
      await supabase
        .from('profiles')
        .update({ onboarding_complete: true })
        .eq('id', user.id);
      console.log('✅ Profile marked as complete');
    }

    return updatedData;
  };

  // Helper function to check if all onboarding steps are complete
  const checkOnboardingComplete = (data) => {
    const { relocationType, paymentCompleted, onboardingCallScheduled, documentsUploaded, completedSteps } = data;

    if (relocationType === 'gcc') {
      // GCC: Need personal details, payment, call, and documents (NO visa check)
      const hasPersonalDetails = (completedSteps || []).some(s => {
        const step = typeof s === 'string' ? parseInt(s, 10) : s;
        return step === 1;
      });
      return hasPersonalDetails && paymentCompleted && onboardingCallScheduled && documentsUploaded;
    } else if (relocationType === 'europe') {
      // Europe: Need all steps including visa check
      const hasPersonalDetails = (completedSteps || []).some(s => {
        const step = typeof s === 'string' ? parseInt(s, 10) : s;
        return step === 1;
      });
      const hasVisaCheck = (completedSteps || []).some(s => {
        const step = typeof s === 'string' ? parseInt(s, 10) : s;
        return step === 2;
      });
      return hasPersonalDetails && hasVisaCheck && paymentCompleted && onboardingCallScheduled && documentsUploaded;
    }

    return false;
  };

  const setCurrentStep = async (step, existingData = null) => {
    console.log(`📍 Setting current step to: ${step}`);
    
    // Use existingData if provided (to avoid stale state), otherwise use onboardingData
    const baseData = existingData || onboardingData;
    
    const updatedData = {
      ...baseData,
      currentStep: step,
      lastUpdated: new Date().toISOString()
    };
    setOnboardingData(updatedData);

    await saveToDatabase(updatedData);
    
    // Return updated data so caller can use it immediately (avoid stale state)
    return updatedData;
  };

  const markStepCompleted = async (step, existingData = null) => {
    // Ensure step is a number, not a string
    const stepNumber = typeof step === 'string' ? parseInt(step, 10) : step;

    // Use existingData if provided (to avoid stale state), otherwise use onboardingData
    const baseData = existingData || onboardingData;

    // Get current completed steps and ensure they're all integers
    const currentCompletedSteps = (baseData.completedSteps || []).map(s =>
      typeof s === 'string' ? parseInt(s, 10) : s
    );

    // Add new step if not already completed
    const updatedCompletedSteps = [...new Set([...currentCompletedSteps, stepNumber])];

    const updatedData = {
      ...baseData,
      completedSteps: updatedCompletedSteps,
      currentStep: stepNumber, // Also update currentStep
      lastUpdated: new Date().toISOString()
    };
    setOnboardingData(updatedData);

    await saveToDatabase(updatedData);

    console.log(`✅ Step ${stepNumber} marked complete`);

    // If step 5 is completed, mark onboarding as complete in profiles table
    if (stepNumber === 5 && user?.id) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ onboarding_complete: true })
          .eq('id', user.id);

        if (error) {
          console.error('❌ Error updating onboarding_complete:', error);
        } else {
          console.log('✅ Profile updated: onboarding_complete = true');
        }
      } catch (error) {
        console.error('❌ Exception updating onboarding_complete:', error);
      }
    }
    
    // Return updated data so caller can use it immediately (avoid stale state)
    return updatedData;
  };

  const isStepCompleted = (step) => {
    // Ensure step comparison works with both strings and numbers
    const stepNumber = typeof step === 'string' ? parseInt(step, 10) : step;
    return onboardingData.completedSteps?.some(s => {
      const completedStep = typeof s === 'string' ? parseInt(s, 10) : s;
      return completedStep === stepNumber;
    }) || false;
  };

  const resetOnboarding = async () => {
    const freshState = getInitialState();
    setOnboardingData(freshState);

    if (user?.id) {
      // Delete from database
      try {
        const { error } = await supabase
          .from('onboarding_data')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error('Error resetting onboarding data:', error);
        }
      } catch (error) {
        console.error('Exception resetting onboarding data:', error);
      }
    }
  };

  // Check if user can access dashboard
  const canAccessDashboard = () => {
    // Simple check: If step 5 is completed, onboarding is done
    const step5Complete = onboardingData.completedSteps?.some(s => {
      const step = typeof s === 'string' ? parseInt(s, 10) : s;
      return step === 5;
    });

    return step5Complete || false;
  };

  const value = {
    onboardingData,
    loading,
    updatePersonalDetails,
    updateVisaCheck,
    setRelocationType,
    setVisaEligibility,
    completePayment,
    initiateTilopayPayment,
    verifyPayment,
    scheduleCall,
    saveTempDocumentMetadata,
    uploadDocuments,
    setCurrentStep,
    markStepCompleted,
    isStepCompleted,
    resetOnboarding,
    canAccessDashboard,
    refreshOnboardingData: loadOnboardingData
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
