import React from 'react';
import { Plane, Users, Building, FileText, ArrowRight } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Plane,
      title: 'Relocation & Mobility Support',
      description: 'Smooth transitions for individuals and organizations moving across borders.',
      features: ['Visa assistance', 'Housing solutions', 'Cultural orientation', 'Legal compliance'],
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Global Recruitment Solutions',
      description: 'Connecting top talent with companies worldwide.',
      features: ['Executive search', 'Technical recruiting', 'Cultural fit assessment', 'Onboarding support'],
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Building,
      title: 'Business Consulting',
      description: 'Tailored strategies to help businesses expand internationally.',
      features: ['Market analysis', 'Entry strategies', 'Risk assessment', 'Growth planning'],
      gradient: 'from-red-500 to-pink-500'
    },
    {
      icon: FileText,
      title: 'Compliance & Documentation',
      description: 'Hassle-free assistance with legal and professional requirements.',
      features: ['Documentation', 'Legal compliance', 'Certification', 'Quality assurance'],
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <section id="services" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Core Services
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-red-600 mx-auto rounded-full mb-8" />
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive solutions designed to bridge global opportunities and simplify international success
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
            >
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                {service.title}
              </h3>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {service.description}
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-500">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Learn More Button */}
              <button className="group/btn flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-300">
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
              </button>

              {/* Hover Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
