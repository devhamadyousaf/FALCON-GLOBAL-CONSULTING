import { Check, Star, ArrowRight } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Silver',
      price: '$299',
      popular: false,
      features: [
        'Career consultation & CV review',
        'Basic relocation guidance',
        'Email support',
        'Initial consultation call',
        'Resource documentation'
      ],
      bgColor: '#C0C0C0',
      borderColor: '#A8A8A8'
    },
    {
      name: 'Gold',
      price: '$699',
      popular: true,
      features: [
        'Full relocation assistance',
        'Priority support',
        'Documentation & help',
        'Job placement support',
        'Cultural orientation',
        '30-day follow-up support'
      ],
      bgColor: '#FFD700',
      borderColor: '#DAA520'
    },
    {
      name: 'Diamond',
      price: '$1,599',
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
      bgColor: '#B9F2FF',
      borderColor: '#4A90E2'
    },
    {
      name: 'Diamond+',
      price: 'Price negotiable',
      popular: false,
      features: [
        'All Diamond features',
        'Custom enterprise solutions',
        'Global expansion strategy',
        'C-suite executive search',
        'Multi-country operations support',
        'Bespoke compliance frameworks',
        'White-glove concierge service'
      ],
      bgColor: '#E8D5FF',
      borderColor: '#9B59B6'
    }
  ];

  return (
    <section id="pricing" className="py-12 md:py-16 lg:py-20 desert-sand-bg-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
            Service Packages
          </h2>
          <div className="w-24 h-1.5 mx-auto rounded-full mb-6" style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }} />
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            We believe in transparency and value-driven pricing. Choose the plan that fits your needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="relative rounded-3xl transition-all duration-700 ease-in-out transform hover:-translate-y-2 hover:scale-[1.02] flex flex-col group"
              style={{
                background: `
                  linear-gradient(135deg,
                    rgba(255, 255, 255, 0.1) 0%,
                    rgba(255, 255, 255, 0.05) 100%),
                  linear-gradient(135deg, ${plan.bgColor}60 0%, ${plan.bgColor}40 100%)`,
                backdropFilter: 'blur(16px) saturate(150%)',
                WebkitBackdropFilter: 'blur(16px) saturate(150%)',
                border: `1.5px solid rgba(255, 255, 255, 0.18)`,
                minHeight: '520px',
                boxShadow: `
                  0 8px 32px 0 rgba(0, 0, 0, 0.1),
                  0 0 0 1px rgba(255, 255, 255, 0.1) inset,
                  0 2px 4px 0 rgba(255, 255, 255, 0.15) inset`
              }}
            >
              {/* Smooth glass overlay - Top shine */}
              <div
                className="absolute top-0 left-0 right-0 h-1/3 rounded-t-3xl pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%)',
                  zIndex: 1
                }}
              />

              {/* Smooth glass overlay - Corner highlights */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.05) 100%)',
                  zIndex: 1
                }}
              />

              {/* Subtle animated shimmer on hover */}
              <div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                  backgroundSize: '200% 200%',
                  animation: 'shimmer 3s ease-in-out infinite',
                  zIndex: 2
                }}
              />

              {/* Popular Badge - Fixed positioning */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-30 w-full flex justify-center px-4">
                  <div
                    className="text-white px-5 py-2 rounded-full text-xs font-bold flex items-center space-x-2 shadow-xl relative overflow-hidden whitespace-nowrap"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(79, 70, 229, 0.95))',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1.5px solid rgba(255, 255, 255, 0.4)',
                      boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                    }}
                  >
                    {/* Badge glass overlay */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)'
                      }}
                    />
                    <Star className="w-3.5 h-3.5 relative z-10 flex-shrink-0" />
                    <span className="relative z-10">Most Popular</span>
                  </div>
                </div>
              )}

              <div className="p-6 pt-8 flex flex-col flex-1 relative z-10">
                {/* Header */}
                <div className="text-center mb-6">
                  <h3
                    className="text-2xl md:text-3xl font-bold mb-4 relative"
                    style={{
                      color: 'rgba(0, 50, 83, 1)',
                      textShadow: '0 2px 10px rgba(255, 255, 255, 0.5)'
                    }}
                  >
                    {plan.name}
                  </h3>

                  <div className="mb-4">
                    <div
                      className="text-2xl md:text-3xl font-bold"
                      style={{
                        color: 'rgba(0, 50, 83, 1)',
                        textShadow: '0 2px 10px rgba(255, 255, 255, 0.5)'
                      }}
                    >
                      {plan.price}
                    </div>
                    {plan.price !== 'Price negotiable' && (
                      <div className="text-xs font-semibold mt-1" style={{ color: 'rgba(0, 50, 83, 0.7)' }}>
                        USD
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${plan.borderColor}dd, ${plan.borderColor})`,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                        }}
                      >
                        <div
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%)'
                          }}
                        />
                        <Check className="w-3 h-3 text-white relative z-10" />
                      </div>
                      <span
                        className="text-sm leading-relaxed font-medium"
                        style={{
                          color: 'rgba(0, 50, 83, 0.9)',
                          textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
                        }}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button - Smooth glass effect */}
                <button
                  className="w-full text-white py-3.5 rounded-2xl font-bold text-sm transition-all duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-[1.02] flex items-center justify-center space-x-2 relative overflow-hidden group/btn"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 50, 83, 0.9), rgba(0, 50, 83, 1))',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 15px 0 rgba(0, 50, 83, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                  }}
                >
                  {/* Button glass highlight */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%)'
                    }}
                  />
                  <span className="relative z-10">Sign up</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300 relative z-10" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <style jsx>{`
          @keyframes shimmer {
            0% {
              background-position: -200% -200%;
            }
            100% {
              background-position: 200% 200%;
            }
          }

          /* Smooth glass transitions */
          .group:hover {
            box-shadow:
              0 12px 40px 0 rgba(0, 0, 0, 0.15),
              0 0 0 1px rgba(255, 255, 255, 0.15) inset,
              0 2px 6px 0 rgba(255, 255, 255, 0.2) inset !important;
          }
        `}</style>

        {/* Additional Info */}
        <div className="text-center mt-8 md:mt-12">
          <p className="text-sm md:text-base text-gray-600 mb-4">
            All packages include initial consultation and basic support. Enterprise solutions are fully customizable.
          </p>
          <button
            className="font-semibold text-sm flex items-center justify-center space-x-2 mx-auto group transition-colors duration-200"
            style={{ color: 'rgba(0, 50, 83, 1)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(0, 50, 83, 0.7)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(0, 50, 83, 1)'}
          >
            <span>Need a custom solution?</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;