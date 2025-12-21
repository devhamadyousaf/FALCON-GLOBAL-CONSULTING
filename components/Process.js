import { MessageCircle, Settings, Rocket, Handshake, ArrowRight, Infinity } from 'lucide-react';
import { useRouter } from 'next/router';
import { Fragment } from 'react';

const Process = () => {
  const router = useRouter();
  const steps = [
    {
      number: '1',
      icon: MessageCircle,
      title: 'Understanding Needs',
      description: 'We start with a personalized consultation.',
      details: 'Deep dive into your requirements, goals, and challenges to create the perfect strategy.',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      number: '2',
      icon: Settings,
      title: 'Tailored Solutions',
      description: 'We design strategies and services to match your goals.',
      details: 'Custom-built solutions that align with your unique objectives and market conditions.',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      number: '3',
      icon: Rocket,
      title: 'Execution & Support',
      description: 'From recruitment to relocation, we handle the details.',
      details: 'Seamless implementation with continuous monitoring and real-time adjustments.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      number: '4',
      icon: Handshake,
      title: 'Ongoing Partnership',
      description: 'We continue to support your growth every step of the way.',
      details: 'Long-term relationship building with continuous optimization and support.',
      gradient: 'from-blue-500 to-cyan-500'
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
              <Fragment key={index}>
                <div className="relative group flex-shrink-0" style={{ width: '220px' }}>
                  {/* Step Card */}
                  <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative z-10 h-full flex flex-col">
                    {/* Icon */}
                    <div className={`w-12 h-12 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                      {step.title}
                    </h3>

                    <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                      {step.description}
                    </p>

                    <p className="text-xs text-gray-500 leading-relaxed">
                      {step.details}
                    </p>

                    {/* Hover Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`} />
                  </div>
                </div>

                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-8 h-8" style={{ color: 'rgba(0, 50, 83, 1)' }} />
                  </div>
                )}
              </Fragment>
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
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col">
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                    {step.title}
                  </h3>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.details}
                  </p>

                  {/* Hover Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`} />
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
            <button
              onClick={() => router.push('/apply')}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full font-semibold text-sm md:text-base hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Schedule a Consultation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;