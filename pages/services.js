import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Globe, Briefcase, FileText, Plane, Building, ArrowRight, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Services() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const services = [
    {
      id: 'job-service',
      title: 'Job Service',
      description: 'Find and apply to international job opportunities matched to your profile',
      icon: Briefcase,
      color: 'from-blue-600 to-indigo-700',
      bgColor: 'from-blue-50 to-indigo-50',
      features: [
        'AI-powered job matching',
        'Application tracking',
        'Interview scheduling',
        'Performance analytics'
      ],
      available: true,
      route: '/dashboard/jobs'
    },
    {
      id: 'visa-service',
      title: 'Visa Service',
      description: 'Get expert assistance with visa applications and documentation',
      icon: Plane,
      color: 'from-green-600 to-emerald-700',
      bgColor: 'from-green-50 to-emerald-50',
      features: [
        'Visa consultation',
        'Document preparation',
        'Application tracking',
        'Success guarantee'
      ],
      available: false,
      route: '#'
    },
    {
      id: 'relocation-service',
      title: 'Relocation Service',
      description: 'Comprehensive support for your move to a new country',
      icon: Building,
      color: 'from-red-600 to-pink-700',
      bgColor: 'from-red-50 to-pink-50',
      features: [
        'Housing assistance',
        'Local orientation',
        'School enrollment',
        'Settling support'
      ],
      available: false,
      route: '#'
    },
    {
      id: 'document-service',
      title: 'Document Service',
      description: 'Professional document verification and translation services',
      icon: FileText,
      color: 'from-purple-600 to-violet-700',
      bgColor: 'from-purple-50 to-violet-50',
      features: [
        'Document verification',
        'Certified translation',
        'Apostille service',
        'Fast processing'
      ],
      available: false,
      route: '#'
    }
  ];

  const handleServiceClick = (service) => {
    if (service.available) {
      router.push(service.route);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center cursor-pointer group">
                <img
                  src="/klaus_logo.jpeg"
                  alt="Falcon Global Consulting"
                  className="h-12 w-auto object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </Link>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-blue-200"
              />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to Falcon Global, {user.name}! 🎉
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Your profile is complete. Choose a service below to get started on your global journey.
          </p>
          <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-700 font-medium">All services powered by AI</span>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {services.map((service, index) => (
            <div
              key={service.id}
              onClick={() => handleServiceClick(service)}
              className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden ${
                service.available ? 'cursor-pointer transform hover:-translate-y-2' : 'cursor-not-allowed opacity-75'
              }`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

              {/* Content */}
              <div className="relative p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <service.icon className="w-10 h-10 text-white" />
                  </div>
                  {!service.available && (
                    <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                      <Lock className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-600">Coming Soon</span>
                    </div>
                  )}
                  {service.available && (
                    <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-green-600">Available</span>
                    </div>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center flex-shrink-0`}>
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {service.available ? (
                  <button className={`w-full bg-gradient-to-r ${service.color} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 group/btn`}>
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </button>
                ) : (
                  <button className="w-full bg-gray-200 text-gray-500 py-3 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center space-x-2">
                    <Lock className="w-5 h-5" />
                    <span>Coming Soon</span>
                  </button>
                )}
              </div>

              {/* Decorative Element */}
              {service.available && (
                <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${service.color} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-3">Need Help Choosing?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Our expert consultants are here to guide you. Start with Job Service to explore opportunities, or contact us for personalized advice.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link href="/dashboard/jobs">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg">
                Start with Jobs
              </button>
            </Link>
            <Link href="/#contact">
              <button className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300">
                Contact Support
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}