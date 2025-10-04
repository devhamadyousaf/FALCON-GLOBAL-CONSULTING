import { MessageCircle, Settings, Rocket, Handshake } from 'lucide-react';

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
    <section id="process" className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Our Core Process
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-red-600 mx-auto rounded-full mb-6" />
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            A systematic approach to delivering exceptional results at every stage
          </p>
        </div>

        {/* Process Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-300 to-red-200 transform -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Step Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-3 left-6 w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-4 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300">
                    <step.icon className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {step.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3 font-medium">
                    {step.description}
                  </p>

                  <p className="text-xs text-gray-500 leading-relaxed">
                    {step.details}
                  </p>

                  {/* Hover Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                </div>

                {/* Connection Dots for Mobile */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center py-3">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-300 to-indigo-400 rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12 md:mt-16">
          <div className="rounded-2xl p-8 md:p-10 border border-gray-200" style={{ backgroundColor: '#fbf7eb' }}>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              Ready to Start Your Journey?
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