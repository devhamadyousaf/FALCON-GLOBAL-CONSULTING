import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Globe, User, Mail, Phone, MapPin, Briefcase, Users, Calendar, Upload, FileText } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

/**
 * Lead Application Form Page
 * Collects qualifying questions and submits to GoHighLevel
 */
export default function ApplyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    cv: null,
    currentCountry: '',
    jobTitle: '',
    yearsOfExperience: '',
    willingToInvest: '',
    targetCountries: '',
    englishLevel: '',
    roleType: '',
    relocationType: '',
    timeline: '',
  });

  const [errors, setErrors] = useState({});
  const [cvFile, setCvFile] = useState(null);

  // Form questions configuration
  const questions = [
    {
      id: 'firstName',
      question: "What's your first name?",
      type: 'text',
      icon: User,
      placeholder: 'John',
      required: true,
    },
    {
      id: 'lastName',
      question: "What's your last name?",
      type: 'text',
      icon: User,
      placeholder: 'Doe',
      required: true,
    },
    {
      id: 'phone',
      question: 'What is your phone number?',
      type: 'phone',
      icon: Phone,
      placeholder: 'Enter phone number',
      required: true,
    },
    {
      id: 'email',
      question: 'What is your email address?',
      type: 'email',
      icon: Mail,
      placeholder: 'john.doe@example.com',
      required: true,
    },
    {
      id: 'cv',
      question: 'Please upload your CV/Resume',
      type: 'file',
      icon: Upload,
      placeholder: 'Upload your CV (PDF, DOC, DOCX)',
      accept: '.pdf,.doc,.docx',
      required: true,
    },
    {
      id: 'currentCountry',
      question: 'What country do you currently reside in?',
      type: 'text',
      icon: Globe,
      placeholder: 'United States',
      required: true,
    },
    {
      id: 'jobTitle',
      question: 'What is your current job title?',
      type: 'text',
      icon: Briefcase,
      placeholder: 'Software Engineer',
      required: true,
    },
    {
      id: 'yearsOfExperience',
      question: 'How many years of work experience do you have already?',
      type: 'select',
      icon: Briefcase,
      options: [
        { value: '0-1', label: '0-1 years' },
        { value: '1-3', label: '1-3 years' },
        { value: '3-5', label: '3-5 years' },
        { value: '5-10', label: '5-10 years' },
        { value: '10+', label: '10+ years' },
      ],
      required: true,
    },
    {
      id: 'willingToInvest',
      question: 'Are you aware that relocating requires a financial investment (visa costs, relocation, etc.), and are you currently in a financial position where this investment is feasible for you?',
      type: 'radio',
      icon: CheckCircle,
      options: [
        { value: 'yes', label: 'Yes, I am aware and financially ready' },
        { value: 'no', label: 'No, I am not in a position to invest' },
        { value: 'maybe', label: 'Maybe, I need more information about costs' },
      ],
      required: true,
    },
    {
      id: 'targetCountries',
      question: 'Which countries or regions are you considering interesting for your career plans?',
      type: 'textarea',
      icon: MapPin,
      placeholder: 'e.g., Germany, UAE, Canada...',
      required: true,
    },
    {
      id: 'englishLevel',
      question: 'How good is your English level from 1 to 10 (1 = no skills, 10 = native English speaker)?',
      type: 'select',
      icon: Globe,
      options: [
        { value: '1', label: '1 - No English skills' },
        { value: '2', label: '2 - Very basic' },
        { value: '3', label: '3 - Basic' },
        { value: '4', label: '4 - Elementary' },
        { value: '5', label: '5 - Intermediate' },
        { value: '6', label: '6 - Upper intermediate' },
        { value: '7', label: '7 - Advanced' },
        { value: '8', label: '8 - Very advanced' },
        { value: '9', label: '9 - Near native' },
        { value: '10', label: '10 - Native English speaker' },
      ],
      required: true,
    },
    {
      id: 'roleType',
      question: 'What type of role are you looking for?',
      type: 'text',
      icon: Briefcase,
      placeholder: 'e.g., Full-time, Part-time, Contract...',
      required: true,
    },
    {
      id: 'relocationType',
      question: 'Are you planning to relocate by yourself or with your family?',
      type: 'radio',
      icon: Users,
      options: [
        { value: 'alone', label: 'By myself' },
        { value: 'with_family', label: 'With my family' },
        { value: 'undecided', label: 'Not sure yet' },
      ],
      required: true,
    },
    {
      id: 'timeline',
      question: 'What is your expected timeline within which you would like to have your relocation done?',
      type: 'select',
      icon: Calendar,
      options: [
        { value: '1-3_months', label: '1-3 months' },
        { value: '3-6_months', label: '3-6 months' },
        { value: '6-12_months', label: '6-12 months' },
        { value: '12+_months', label: 'More than 12 months' },
        { value: 'flexible', label: 'Flexible timeline' },
      ],
      required: true,
    },
  ];

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const progress = ((currentStep + 1) / questions.length) * 100;

  /**
   * Validate current field
   */
  const validateField = (field, value) => {
    if (field === 'cv') {
      if (!cvFile) {
        return 'Please upload your CV';
      }
      // Check file size (max 10MB)
      if (cvFile.size > 10 * 1024 * 1024) {
        return 'File size must be less than 10MB';
      }
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(cvFile.type)) {
        return 'Please upload a PDF, DOC, or DOCX file';
      }
      return null;
    }

    if (!value || value.trim() === '') {
      return 'This field is required';
    }

    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    if (field === 'phone') {
      // Use react-phone-number-input's built-in validation
      // This automatically validates based on the selected country
      if (!isValidPhoneNumber(value)) {
        return 'Please enter a valid phone number for the selected country';
      }
    }

    return null;
  };

  /**
   * Handle input change
   */
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  /**
   * Handle file upload
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvFile(file);
      setFormData(prev => ({ ...prev, cv: file.name }));
      // Clear error
      if (errors.cv) {
        setErrors(prev => ({ ...prev, cv: null }));
      }
    }
  };

  /**
   * Handle next question
   */
  const handleNext = () => {
    const fieldValue = formData[currentQuestion.id];
    const error = validateField(currentQuestion.id, fieldValue);

    if (error) {
      setErrors({ [currentQuestion.id]: error });
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Handle previous question
   */
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Submit form to GoHighLevel
   */
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      let cvFileUrl = null;

      // Step 1: Upload CV file first if it exists
      if (cvFile) {
        console.log('📎 Uploading CV file...');

        // Convert CV to base64
        const cvBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]); // Remove data:type;base64, prefix
          reader.onerror = reject;
          reader.readAsDataURL(cvFile);
        });

        // Upload file to GHL
        const uploadResponse = await fetch('/api/ghl/upload-file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileData: cvBase64,
            fileName: cvFile.name,
            fileType: cvFile.type,
          }),
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || 'Failed to upload CV');
        }

        cvFileUrl = uploadData.fileUrl;
        console.log('✅ CV uploaded successfully:', cvFileUrl);
      }

      // Step 2: Create contact with CV URL
      const submitData = {
        ...formData,
        cvFileUrl: cvFileUrl, // Send the uploaded file URL instead of base64
      };

      const response = await fetch('/api/ghl/create-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSuccess(true);

      // Redirect to thank you page after 2 seconds
      setTimeout(() => {
        router.push('/thank-you');
      }, 2000);

    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Render input field based on type
   */
  const renderInput = () => {
    const { id, type, placeholder, options, accept } = currentQuestion;
    const value = formData[id];
    const Icon = currentQuestion.icon;

    if (type === 'file') {
      return (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="file"
              id="cv-upload"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="cv-upload"
              className="flex flex-col items-center justify-center w-full px-6 py-12 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#1e3a8a] transition-all bg-gray-50 hover:bg-blue-50"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <span className="text-lg font-medium text-gray-700">
                {cvFile ? 'Change file' : 'Click to upload'}
              </span>
              <span className="text-sm text-gray-500 mt-2">{placeholder}</span>
            </label>
          </div>

          {cvFile && (
            <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{cvFile.name}</p>
                <p className="text-sm text-gray-600">
                  {(cvFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCvFile(null);
                  setFormData(prev => ({ ...prev, cv: null }));
                }}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      );
    }

    if (type === 'phone') {
      return (
        <div className="relative">
          <PhoneInput
            international
            defaultCountry="US"
            value={value}
            onChange={(phoneValue) => handleChange(id, phoneValue || '')}
            placeholder={placeholder}
            className="phone-input-custom"
            countryCallingCodeEditable={false}
            style={{
              width: '100%',
            }}
          />
          <style jsx global>{`
            .phone-input-custom {
              width: 100%;
            }
            .phone-input-custom .PhoneInputInput {
              width: 100%;
              padding: 16px 16px 16px 16px;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              font-size: 18px;
              outline: none;
              transition: all 0.2s;
            }
            .phone-input-custom .PhoneInputInput:focus {
              border-color: #1e3a8a;
            }
            .phone-input-custom .PhoneInputCountry {
              position: absolute;
              left: 16px;
              top: 50%;
              transform: translateY(-50%);
              z-index: 10;
            }
            .phone-input-custom .PhoneInputInput {
              padding-left: 80px;
            }
            .phone-input-custom .PhoneInputCountrySelect {
              border: none;
              background: transparent;
              cursor: pointer;
              font-size: 16px;
              padding: 4px;
            }
            .phone-input-custom .PhoneInputCountrySelect:focus {
              outline: none;
            }
            .phone-input-custom .PhoneInputCountryIcon {
              width: 24px;
              height: 18px;
              margin-right: 8px;
            }
          `}</style>
        </div>
      );
    }

    if (type === 'radio') {
      return (
        <div className="space-y-3">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange(id, option.value)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                value === option.value
                  ? 'border-[#1e3a8a] bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    value === option.value
                      ? 'border-[#1e3a8a] bg-[#1e3a8a]'
                      : 'border-gray-300'
                  }`}
                >
                  {value === option.value && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="font-medium text-gray-900">{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      );
    }

    if (type === 'select') {
      return (
        <select
          value={value}
          onChange={(e) => handleChange(id, e.target.value)}
          className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-[#1e3a8a] focus:outline-none text-lg"
        >
          <option value="">Select an option...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <div className="relative">
          <div className="absolute left-4 top-4 text-gray-400">
            <Icon className="w-6 h-6" />
          </div>
          <textarea
            value={value}
            onChange={(e) => handleChange(id, e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full pl-14 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-[#1e3a8a] focus:outline-none text-lg resize-none"
          />
        </div>
      );
    }

    return (
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Icon className="w-6 h-6" />
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => handleChange(id, e.target.value)}
          placeholder={placeholder}
          className="w-full pl-14 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-[#1e3a8a] focus:outline-none text-lg"
        />
      </div>
    );
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your interest. Our team will review your application and get back to you within 24-48 hours.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a8a] mx-auto"></div>
          <p className="text-sm text-gray-500 mt-4">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Apply Now | FALCON Global Consulting</title>
        <meta name="description" content="Apply for our global relocation services and start your journey today." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <img
                  src="/klaus_logo.jpeg"
                  alt="Falcon Global Consulting"
                  className="h-12 w-auto object-contain"
                />
              </div>
            </Link>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Question {currentStep + 1} of {questions.length}
              </span>
              <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1e3a8a] transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {/* Question */}
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {currentQuestion.question}
              </h2>

              {/* Input */}
              {renderInput()}

              {/* Error Message */}
              {errors[currentQuestion.id] && (
                <p className="text-red-600 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors[currentQuestion.id]}
                </p>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={loading}
                  className="flex-1 px-6 py-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  ← Previous
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="flex-1 px-6 py-4 rounded-xl font-semibold text-white bg-[#1e3a8a] hover:bg-[#1e40af] transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : isLastQuestion ? (
                  <>
                    Submit Application
                    <CheckCircle className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>

            {/* Press Enter Hint */}
            {currentQuestion.type !== 'radio' && currentQuestion.type !== 'select' && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Press <kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd> to continue
              </p>
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              🔒 Your information is secure and will only be used to process your application.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
