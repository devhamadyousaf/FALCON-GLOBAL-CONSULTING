import { Check, Star, ArrowRight } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Starter Package',
      target: 'Individuals',
      price: '$199',
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
      price: '$499',
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
      price: 'Custom',
      period: 'Customized pricing',
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
    <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Pricing
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-red-600 mx-auto rounded-full mb-8" />
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We believe in transparency and value-driven pricing. Choose the plan that fits your needs.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 ${
                plan.popular
                  ? 'border-blue-200 ring-4 ring-blue-100'
                  : 'border-gray-100'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-1 shadow-lg">
                    <Star className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-6">{plan.target}</p>

                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-2">{plan.period}</div>
                    <div className={`text-5xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                      {plan.price}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-600 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button className={`w-full bg-gradient-to-r ${plan.gradient} text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 group`}>
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>

              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${plan.bgGradient} opacity-0 hover:opacity-10 rounded-3xl transition-opacity duration-500`} />
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            All packages include initial consultation and basic support. Enterprise solutions are fully customizable.
          </p>
          <button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center justify-center space-x-2 mx-auto group">
            <span>Need a custom solution?</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;