import { MessageCircle, Settings, Rocket, Handshake, ArrowRight, Infinity } from 'lucide-react';

const Process = () => {
  const steps = [
    {
      number: '1',
      icon: MessageCircle,
      title: 'Understanding Needs',
      description: 'We start with a personalized consultation.',
      details: 'Deep dive into your requirements, goals, and challenges to create the perfect strategy.'
    },
    {
      number: '2',
      icon: Settings,
      title: 'Tailored Solutions',
      description: 'We design strategies and services to match your goals.',
      details: 'Custom-built solutions that align with your unique objectives and market conditions.'
    },
    {
      number: '3',
      icon: Rocket,
      title: 'Execution & Support',
      description: 'From recruitment to relocation, we handle the details.',
      details: 'Seamless implementation with continuous monitoring and real-time adjustments.'
    },
    {
      number: '4',
      icon: Handshake,
      title: 'Ongoing Partnership',
      description: 'We continue to support your growth every step of the way.',
      details: 'Long-term relationship building with continuous optimization and support.'
    }
  ];

  return (
    <section id="process" className="py-12 md:py-16 lg:py-20 desert-sand-bg-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
            Our Core Process
          </h2>
          <div className="w-24 h-1.5 mx-auto rounded-full mb-6" style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }} />
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            A systematic approach to delivering exceptional results at every stage
          </p>
        </div>

        {/* Process Steps - Desktop: 4 cards in one line with arrows */}
        <div className="relative">
          {/* Desktop View - Single Line with Flex */}
          <div className="hidden lg:flex items-center justify-center gap-4">
            {steps.map((step, index) => (
              <>
                <div key={index} className="relative group flex-shrink-0" style={{ width: '220px' }}>
                  {/* Step Card */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative z-10 h-full"
                       onMouseEnter={(e) => {
                         const icon = e.currentTarget.querySelector('.step-icon');
                         const title = e.currentTarget.querySelector('.step-title');
                         if (icon) icon.style.color = 'rgba(0, 50, 83, 1)';
                         if (title) title.style.color = 'rgba(0, 50, 83, 1)';
                       }}
                       onMouseLeave={(e) => {
                         const icon = e.currentTarget.querySelector('.step-icon');
                         const title = e.currentTarget.querySelector('.step-title');
                         if (icon) icon.style.color = '';
                         if (title) title.style.color = '';
                       }}>
                    {/* Hover Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 -z-10" />

                    {/* Step Number */}
                    <div className="absolute -top-3 left-6 w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-4 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300 relative z-10">
                      <step.icon className="step-icon w-6 h-6 text-gray-600 transition-colors duration-300" />
                    </div>

                    {/* Content */}
                    <h3 className="step-title text-base font-bold text-gray-900 mb-2 transition-colors duration-300 relative z-10">
                      {step.title}
                    </h3>

                    <p className="text-xs text-gray-600 mb-2 font-medium relative z-10">
                      {step.description}
                    </p>

                    <p className="text-xs text-gray-500 leading-relaxed relative z-10">
                      {step.details}
                    </p>
                  </div>
                </div>

                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div key={`arrow-${index}`} className="flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-8 h-8" style={{ color: 'rgba(0, 50, 83, 1)' }} />
                  </div>
                )}
              </>
            ))}

            {/* Infinity symbol after all steps */}
            <div className="flex items-center justify-center flex-shrink-0 ml-4">
              <Infinity className="w-12 h-12" style={{ color: 'rgba(187, 40, 44, 1)' }} />
            </div>
          </div>

          {/* Mobile/Tablet View - Grid Layout */}
          <div className="grid md:grid-cols-2 gap-6 lg:hidden">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Step Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative z-10"
                     onMouseEnter={(e) => {
                       const icon = e.currentTarget.querySelector('.step-icon');
                       const title = e.currentTarget.querySelector('.step-title');
                       if (icon) icon.style.color = 'rgba(0, 50, 83, 1)';
                       if (title) title.style.color = 'rgba(0, 50, 83, 1)';
                     }}
                     onMouseLeave={(e) => {
                       const icon = e.currentTarget.querySelector('.step-icon');
                       const title = e.currentTarget.querySelector('.step-title');
                       if (icon) icon.style.color = '';
                       if (title) title.style.color = '';
                     }}>
                  {/* Hover Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 -z-10" />

                  {/* Step Number */}
                  <div className="absolute -top-3 left-6 w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-4 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300 relative z-10">
                    <step.icon className="step-icon w-6 h-6 text-gray-600 transition-colors duration-300" />
                  </div>

                  {/* Content */}
                  <h3 className="step-title text-lg font-bold text-gray-900 mb-3 transition-colors duration-300 relative z-10">
                    {step.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3 font-medium relative z-10">
                    {step.description}
                  </p>

                  <p className="text-xs text-gray-500 leading-relaxed relative z-10">
                    {step.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12 md:mt-16">
          <div className="rounded-2xl p-8 md:p-10 border border-gray-200" style={{ backgroundColor: '#fbf7eb' }}>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              Ready to Start Your Journey with us?
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-6 max-w-xl mx-auto">
              Let's discuss how our proven process can help you achieve your global ambitions
            </p>
            <button className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full font-semibold text-sm md:text-base hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Schedule a Consultation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;