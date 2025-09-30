import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Globe, User, Briefcase, MapPin, ArrowRight, ChevronDown, Languages, Calendar, DollarSign, Upload, FileText, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Onboarding() {
  const router = useRouter();
  const { user, completeOnboarding, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    targetRegion: '',
    jobTitle: '',
    languageLevel: '',
    startDate: '',
    salaryRange: ''
  });
  const [cvFile, setCvFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated or already completed onboarding
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user && user.onboardingComplete) {
      router.push('/services');
    }
  }, [isAuthenticated, user, router]);

  const jobTitles = [
    { value: '', label: 'Select your job title' },
    { value: 'software-engineer', label: 'Software Engineer' },
    { value: 'data-scientist', label: 'Data Scientist' },
    { value: 'product-manager', label: 'Product Manager' },
    { value: 'business-analyst', label: 'Business Analyst' },
    { value: 'marketing-manager', label: 'Marketing Manager' },
    { value: 'sales-executive', label: 'Sales Executive' },
    { value: 'hr-manager', label: 'HR Manager' },
    { value: 'financial-analyst', label: 'Financial Analyst' },
    { value: 'project-manager', label: 'Project Manager' },
    { value: 'operations-manager', label: 'Operations Manager' },
    { value: 'graphic-designer', label: 'Graphic Designer' },
    { value: 'ui-ux-designer', label: 'UI/UX Designer' },
    { value: 'content-writer', label: 'Content Writer' },
    { value: 'consultant', label: 'Consultant' },
    { value: 'architect', label: 'Architect' },
    { value: 'civil-engineer', label: 'Civil Engineer' },
    { value: 'mechanical-engineer', label: 'Mechanical Engineer' },
    { value: 'healthcare-professional', label: 'Healthcare Professional' },
    { value: 'teacher-educator', label: 'Teacher/Educator' },
    { value: 'legal-advisor', label: 'Legal Advisor' },
    { value: 'executive-director', label: 'Executive Director' },
    { value: 'entrepreneur', label: 'Entrepreneur' },
    { value: 'other', label: 'Other' }
  ];

  const targetRegions = [
    { value: '', label: 'Select your target region' },
    { value: 'united-states', label: 'United States', flag: '🇺🇸' },
    { value: 'canada', label: 'Canada', flag: '🇨🇦' },
    { value: 'united-kingdom', label: 'United Kingdom', flag: '🇬🇧' },
    { value: 'germany', label: 'Germany', flag: '🇩🇪' },
    { value: 'france', label: 'France', flag: '🇫🇷' },
    { value: 'netherlands', label: 'Netherlands', flag: '🇳🇱' },
    { value: 'switzerland', label: 'Switzerland', flag: '🇨🇭' },
    { value: 'australia', label: 'Australia', flag: '🇦🇺' },
    { value: 'new-zealand', label: 'New Zealand', flag: '🇳🇿' },
    { value: 'singapore', label: 'Singapore', flag: '🇸🇬' },
    { value: 'hong-kong', label: 'Hong Kong', flag: '🇭🇰' },
    { value: 'japan', label: 'Japan', flag: '🇯🇵' },
    { value: 'china', label: 'China', flag: '🇨🇳' },
    { value: 'south-korea', label: 'South Korea', flag: '🇰🇷' },
    { value: 'uae', label: 'United Arab Emirates', flag: '🇦🇪' },
    { value: 'saudi-arabia', label: 'Saudi Arabia', flag: '🇸🇦' },
    { value: 'india', label: 'India', flag: '🇮🇳' },
    { value: 'brazil', label: 'Brazil', flag: '🇧🇷' },
    { value: 'mexico', label: 'Mexico', flag: '🇲🇽' },
    { value: 'south-africa', label: 'South Africa', flag: '🇿🇦' }
  ];

  const languageLevels = [
    { value: '', label: 'Select your language level' },
    { value: 'native', label: 'Native Speaker' },
    { value: 'fluent-c2', label: 'Fluent (C2)' },
    { value: 'advanced-c1', label: 'Advanced (C1)' },
    { value: 'upper-intermediate-b2', label: 'Upper Intermediate (B2)' },
    { value: 'intermediate-b1', label: 'Intermediate (B1)' },
    { value: 'elementary-a2', label: 'Elementary (A2)' },
    { value: 'beginner-a1', label: 'Beginner (A1)' }
  ];

  const salaryRanges = [
    { value: '', label: 'Select your expected salary range' },
    { value: '0-30k', label: '$0 - $30,000 per year' },
    { value: '30k-50k', label: '$30,000 - $50,000 per year' },
    { value: '50k-75k', label: '$50,000 - $75,000 per year' },
    { value: '75k-100k', label: '$75,000 - $100,000 per year' },
    { value: '100k-150k', label: '$100,000 - $150,000 per year' },
    { value: '150k-200k', label: '$150,000 - $200,000 per year' },
    { value: '200k-300k', label: '$200,000 - $300,000 per year' },
    { value: '300k+', label: '$300,000+ per year' }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateFile = (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a PDF or DOCX file only';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setUploadError(error);
        setCvFile(null);
      } else {
        setUploadError('');
        setCvFile(file);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setUploadError(error);
        setCvFile(null);
      } else {
        setUploadError('');
        setCvFile(file);
      }
    }
  };

  const removeFile = () => {
    setCvFile(null);
    setUploadError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.targetRegion || !formData.jobTitle || !formData.languageLevel || !formData.startDate || !formData.salaryRange) {
      alert('Please fill in all required fields');
      return;
    }

    if (!cvFile) {
      alert('Please upload your CV');
      return;
    }

    setLoading(true);

    try {
      // In production, you would upload the file to a server/cloud storage
      const cvData = {
        fileName: cvFile.name,
        fileSize: cvFile.size,
        fileType: cvFile.type,
        uploadedAt: new Date().toISOString()
      };

      await completeOnboarding({ ...formData, cv: cvData });
      alert(`Profile completed successfully!\n\nCV "${cvFile.name}" uploaded.\n\nWelcome to Falcon Global Consulting!`);
      router.push('/services');
    } catch (error) {
      alert('Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-red-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-md w-full">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center justify-center mb-8 cursor-pointer group">
            <img
              src="/klaus_logo.jpeg"
              alt="Falcon Global Consulting"
              className="h-16 w-auto object-contain group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        </Link>

        {/* Onboarding Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full mx-auto border-4 border-blue-100"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user.name}!</h2>
            <p className="text-gray-600">Tell us about your career goals</p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Profile Setup</span>
              <span className="text-sm font-medium text-blue-600">4 Questions + CV Upload</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-green-600 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Onboarding Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Question 1: Target Region */}
            <div>
              <label htmlFor="targetRegion" className="block text-sm font-semibold text-gray-800 mb-2">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-xs mr-2">1</span>
                Target Region <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <select
                  id="targetRegion"
                  name="targetRegion"
                  value={formData.targetRegion}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none appearance-none cursor-pointer"
                >
                  {targetRegions.map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.flag ? `${region.flag} ` : ''}{region.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question 2: Job Profile/Title */}
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-semibold text-gray-800 mb-2">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-xs mr-2">2</span>
                Job Profile / Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <select
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none appearance-none cursor-pointer"
                >
                  {jobTitles.map((job) => (
                    <option key={job.value} value={job.value}>
                      {job.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question 3: Language Level */}
            <div>
              <label htmlFor="languageLevel" className="block text-sm font-semibold text-gray-800 mb-2">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-xs mr-2">3</span>
                Language Level (English) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <select
                  id="languageLevel"
                  name="languageLevel"
                  value={formData.languageLevel}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none appearance-none cursor-pointer"
                >
                  {languageLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question 4a: Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-semibold text-gray-800 mb-2">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-xs mr-2">4</span>
                Preferred Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Question 4b: Salary Range */}
            <div>
              <label htmlFor="salaryRange" className="block text-sm font-semibold text-gray-800 mb-2">
                <span className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-xs mr-2">$</span>
                Expected Salary Range <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <select
                  id="salaryRange"
                  name="salaryRange"
                  value={formData.salaryRange}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none appearance-none cursor-pointer"
                >
                  {salaryRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Final Step</span>
              </div>
            </div>

            {/* Question 5: CV Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-xs mr-2">📄</span>
                Upload Your CV <span className="text-red-500">*</span>
              </label>

              {!cvFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="file"
                    id="cvUpload"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  <div className="pointer-events-none">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {isDragging ? 'Drop your file here' : 'Upload your CV'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Drag and drop or click to browse
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                      <FileText className="w-4 h-4" />
                      <span>Supported formats: PDF, DOCX (Max 5MB)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-green-200 bg-green-50 rounded-2xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <h4 className="font-semibold text-gray-900 truncate">
                            {cvFile.name}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          {(cvFile.size / 1024).toFixed(1)} KB • {cvFile.type.includes('pdf') ? 'PDF' : 'DOCX'}
                        </p>
                        <p className="text-xs text-green-600 mt-1">✓ File ready to upload</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="ml-4 p-2 hover:bg-red-100 rounded-lg transition-colors duration-200 flex-shrink-0"
                      title="Remove file"
                    >
                      <X className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2">
                  <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{uploadError}</p>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-blue-600">💡 Quick Tip:</span> Your CV helps us understand your experience and match you with the best opportunities. Keep it updated!
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Completing Profile...' : 'Complete Profile'}</span>
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
        </div>

        {/* Skip Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}