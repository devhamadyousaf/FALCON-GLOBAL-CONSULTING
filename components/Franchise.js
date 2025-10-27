const Franchise = () => {
  return (
    <section id="franchise program" className="py-16 desert-sand-bg-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: 'rgba(0, 50, 83, 1)' }}
          >
            Franchise Opportunities
          </h2>
          <div className="w-24 h-1.5 mx-auto rounded-full mb-6" style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }} />
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Join our growing network of franchise partners and bring Falcon Global Consulting
            services to your region. We provide comprehensive training, support, and proven
            business systems.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div
            className="p-8 rounded-2xl"
            style={{ backgroundColor: '#fbf7eb' }}
          >
            <h3 
              className="text-2xl font-bold mb-4"
              style={{ color: 'rgba(0, 50, 83, 1)' }}
            >
              What We Offer
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Comprehensive training and ongoing support
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Proven business model and systems
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Marketing and brand support
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Access to our global network
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Technology platform and tools
              </li>
            </ul>
          </div>

          <div
            className="p-8 rounded-2xl"
            style={{ backgroundColor: '#fbf7eb' }}
          >
            <h3 
              className="text-2xl font-bold mb-4"
              style={{ color: 'rgba(0, 50, 83, 1)' }}
            >
              Who We're Looking For
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Entrepreneurial mindset and business acumen
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Experience in consulting, recruitment, or related fields
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Strong local network and market knowledge
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Commitment to quality and client satisfaction
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Sufficient capital investment
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => window.open('https://calendly.com/kc-orth3107/45min', '_blank')}
            className="px-8 py-4 rounded-full font-semibold text-white text-lg transition-all duration-300 hover:shadow-xl"
            style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}
          >
            Request Franchise Information
          </button>
        </div>
      </div>
    </section>
  );
};

export default Franchise;
