import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight, Mail, Phone, MapPin, Plus, Minus } from 'lucide-react';
import { useRouter } from 'next/router';
import * as gtag from '../lib/gtag';

const SimpleLanding = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFAQIndex, setOpenFAQIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFAQ = (index) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  const faqs = [
    {
      question: 'What industries do you specialize in?',
      answer: 'We work across diverse industries, with a strong focus on professional, technical, and international roles. Our expertise spans technology, healthcare, finance, engineering, consulting, and many other sectors where global talent mobility is essential.'
    },
    {
      question: 'Is Falcon Global Consulting limited to certain countries?',
      answer: 'Not at all. While we are headquartered in Panama, we operate globally with a remote-first approach. Our network spans across multiple continents, allowing us to serve clients and place talent in various countries worldwide.'
    },
    {
      question: 'Do you provide post-placement support?',
      answer: 'Absolutely. We believe in long-term partnerships and provide ongoing support to ensure successful integration and satisfaction for both clients and placed candidates. This includes follow-up consultations, adaptation assistance, and continuous relationship management.'
    }
  ];

  const services = [
    {
      title: 'Automated Job Search',
      description: 'Applying for suitable jobs at your desired location is a very time consuming process. Our innovative concept enables our clients to automate their job search. We create individually suitable solutions and help you achieve your career goals.'
    },
    {
      title: 'Career Consulting',
      description: 'Assist clients in structuring and maximizing their success in their career.'
    },
    {
      title: 'Relocation Assistance',
      description: 'Provide consultation and guidance during your relocation process.'
    },
    {
      title: 'Visa Support',
      description: 'Assist clients with their visa applications.'
    }
  ];

  return (
    <div className="font-inter">
      {/* Header */}
      <header className="fixed w-full z-50 pt-4">
        <div className="w-full px-6">
          <div
            className="backdrop-blur-lg px-8 py-3 transition-all duration-300"
            style={{
              backgroundColor: '#fbf7eb',
              border: '2px solid rgba(187, 40, 44, 0.8)',
              borderRadius: '50px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              height: '90px'
            }}
          >
            <div className="flex items-center justify-between h-full">
              {/* Logo */}
              <div className="flex items-center space-x-3 flex-shrink-0 overflow-hidden h-full">
                <img
                  src="/klaus_logo.jpeg"
                  alt="Falcon Global Consulting"
                  className="h-20 w-auto object-contain"
                />
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center justify-center flex-1 mx-2">
                <div className="flex items-center space-x-6">
                  {['Home', 'Services', 'Contact'].map((item) => (
                    <a
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      className="font-bold text-base transition-colors duration-200 relative group whitespace-nowrap"
                      style={{ color: 'rgba(0, 50, 83, 1)' }}
                      onMouseEnter={(e) => e.target.style.color = 'rgba(187, 40, 44, 1)'}
                      onMouseLeave={(e) => e.target.style.color = 'rgba(0, 50, 83, 1)'}
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg transition-colors"
                style={{ color: 'rgba(0, 50, 83, 1)' }}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className="lg:hidden mt-4 mx-6 backdrop-blur-lg rounded-3xl overflow-hidden"
            style={{
              backgroundColor: '#fbf7eb',
              border: '2px solid rgba(187, 40, 44, 0.8)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="px-6 py-4 space-y-4">
              {['Home', 'Services', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block font-bold text-base transition-colors duration-200"
                  style={{ color: 'rgba(0, 50, 83, 1)' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="min-h-screen relative overflow-hidden pt-24"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
            url('https://static.vecteezy.com/system/resources/previews/026/797/740/non_2x/a-double-exposure-of-a-businessman-in-the-cityscape-embodies-success-and-future-plans-free-photo.jpg')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 md:mb-10 leading-tight">
              Achieve Your Career Goals with Expert Guidance
            </h1>

            <p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed mb-8 md:mb-12">
              Automated Job Search. Career Consulting. Visa support. Relocation assistance.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={() => {
                  gtag.event({
                    action: 'click',
                    category: 'cta',
                    label: 'hero_free_consultation'
                  });
                  router.push('/apply');
                }}
                className="group text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
                style={{
                  background: 'linear-gradient(to right, rgba(187, 40, 44, 1), rgba(187, 40, 44, 0.8))'
                }}
              >
                <span>Get a Free Consultation</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 md:py-16 lg:py-20 desert-sand-bg-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
              ABOUT US
            </h2>
            <div className="w-24 h-1.5 mx-auto rounded-full mb-6" style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }} />
          </div>

          <div className="max-w-4xl mx-auto">
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-8 text-center">
              At Falcon Global Consulting Corp., we are more than just consultants; we are your partners on the path to a successful career. 
              We help you with all our passion finding your dream job. We have built a reputation for excellence in the industry. 
              Our team of experienced experts brings a diverse range of skills and knowledge to the table, allowing us to tailor strategies 
              that fit your unique needs.
            </p>

            <div className="text-center">
              <button
                onClick={() => {
                  gtag.event({
                    action: 'click',
                    category: 'cta',
                    label: 'about_free_consultation'
                  });
                  router.push('/apply');
                }}
                className="text-white px-6 md:px-8 py-3 rounded-full font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center space-x-2"
                style={{
                  background: 'linear-gradient(to right, rgba(187, 40, 44, 1), rgba(187, 40, 44, 0.8))'
                }}
              >
                <span>Get a Free Consultation</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
              OUR SERVICES
            </h2>
            <div className="w-24 h-1.5 mx-auto rounded-full mb-6" style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }} />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl transition-all duration-300 hover:shadow-xl"
                style={{
                  backgroundColor: '#fbf7eb',
                  border: '2px solid rgba(187, 40, 44, 0.2)'
                }}
              >
                <h3 className="text-xl font-bold mb-3" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 lg:py-20 desert-sand-bg-subtle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
              FAQS
            </h2>
            <div className="w-24 h-1.5 mx-auto rounded-full mb-6" style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }} />
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  backgroundColor: '#fbf7eb',
                  border: '2px solid rgba(187, 40, 44, 0.2)'
                }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors duration-200"
                >
                  <span className="font-bold text-lg" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                    {faq.question}
                  </span>
                  {openFAQIndex === index ? (
                    <Minus size={24} style={{ color: 'rgba(187, 40, 44, 1)' }} />
                  ) : (
                    <Plus size={24} style={{ color: 'rgba(187, 40, 44, 1)' }} />
                  )}
                </button>
                
                {openFAQIndex === index && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
              GET IN TOUCH
            </h2>
            <div className="w-24 h-1.5 mx-auto rounded-full mb-6" style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }} />
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-start space-x-4 p-6 rounded-2xl" style={{ backgroundColor: '#fbf7eb' }}>
              <Mail className="w-6 h-6 mt-1" style={{ color: 'rgba(187, 40, 44, 1)' }} />
              <div>
                <h3 className="font-bold text-lg mb-1" style={{ color: 'rgba(0, 50, 83, 1)' }}>Email</h3>
                <a 
                  href="mailto:info@falconglobalconsulting.com"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  info@falconglobalconsulting.com
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 rounded-2xl" style={{ backgroundColor: '#fbf7eb' }}>
              <Phone className="w-6 h-6 mt-1" style={{ color: 'rgba(187, 40, 44, 1)' }} />
              <div>
                <h3 className="font-bold text-lg mb-1" style={{ color: 'rgba(0, 50, 83, 1)' }}>Phone</h3>
                <a 
                  href="tel:+5078388109"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  +507 838 8109
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 rounded-2xl" style={{ backgroundColor: '#fbf7eb' }}>
              <MapPin className="w-6 h-6 mt-1" style={{ color: 'rgba(187, 40, 44, 1)' }} />
              <div>
                <h3 className="font-bold text-lg mb-1" style={{ color: 'rgba(0, 50, 83, 1)' }}>Address</h3>
                <p className="text-gray-600">
                  Headquartered in Panama, with offices in Germany, Portugal, Colombia, and India
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 desert-sand-bg-subtle border-t-2" style={{ borderColor: 'rgba(187, 40, 44, 0.2)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">
              © {new Date().getFullYear()} Falcon Global Consulting Corp. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SimpleLanding;
