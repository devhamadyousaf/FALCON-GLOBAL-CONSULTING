import { Check, Star, ArrowRight } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Starter Package',
      target: 'Individuals',
      price: '$299',
      period: 'Starting from',
      popular: false,
      features: [
        'Career consultation & CV review',
        'Basic relocation guidance',
        'Email support',
        'Initial consultation call',
        'Resource documentation'
      ],
      gradient: 'from-gray-500 to-gray-600',
      bgGradient: 'from-gray-50 to-gray-100'
    },
    {
      name: 'Professional Package',
      target: 'Individuals & Small Teams',
      price: '$699',
      period: 'Starting from',
      popular: true,
      features: [
        'Full relocation assistance',
        'Priority support',
        'Documentation & help',
        'Job placement support',
        'Cultural orientation',
        '30-day follow-up support'
      ],
      gradient: 'from-blue-600 to-indigo-700',
      bgGradient: 'from-blue-50 to-indigo-100'
    },
    {
      name: 'Enterprise Package',
      target: 'Businesses',
      price: '$1599',
      period: 'Starting from',
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
      gradient: 'from-red-600 to-red-700',
      bgGradient: 'from-red-50 to-pink-100'
    }
  ];

  return (
    <section id="pricing" className="py-12 md:py-16 lg:py-20 desert-sand-bg-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Pricing Plans
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-red-600 mx-auto rounded-full mb-6" />
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            We believe in transparency and value-driven pricing. Choose the plan that fits your needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border ${
                plan.popular
                  ? 'border-blue-200 ring-2 ring-blue-100'
                  : 'border-gray-100'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-lg">
                    <Star className="w-3 h-3" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{plan.target}</p>

                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">{plan.period}</div>
                    <div className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                      {plan.price}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-sm text-gray-600 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button className={`w-full bg-gradient-to-r ${plan.gradient} text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 group`}>
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>

              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${plan.popular ? 'opacity-5' : 'opacity-0 hover:opacity-10'} rounded-3xl transition-opacity duration-500`} style={{ backgroundColor: plan.popular ? '#fbf7eb' : 'transparent' }} />
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8 md:mt-12">
          <p className="text-sm md:text-base text-gray-600 mb-4">
            All packages include initial consultation and basic support. Enterprise solutions are fully customizable.
          </p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-center space-x-2 mx-auto group">
            <span>Need a custom solution?</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;