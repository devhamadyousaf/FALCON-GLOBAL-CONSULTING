import { Star, Quote, User, Building } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Ananya Sharma',
      title: 'Relocated Professional',
      company: 'Tech Consultant',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      text: 'Falcon Global Consulting made my move abroad stress-free. Their team handled everything from documentation to settling in. The level of support and attention to detail was exceptional.',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      name: 'James Mitchell',
      title: 'HR Director',
      company: 'Global Solutions Inc.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150&q=80',
      rating: 5,
      text: 'We found the right talent in record time thanks to Falcon\'s recruitment services. Professional, reliable, and efficient. They understand our business needs perfectly.',
      gradient: 'from-red-500 to-pink-600'
    },
    {
      name: 'Maria Rodriguez',
      title: 'Business Owner',
      company: 'InnovateCorp',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150&q=80',
      rating: 5,
      text: 'Their business consulting services helped us expand into three new markets successfully. The strategic insights and practical support were invaluable for our growth.',
      gradient: 'from-green-500 to-emerald-600'
    }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 desert-sand-bg-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4"
            style={{ color: 'rgba(0, 50, 83, 1)' }}
          >
            What Our Clients Say
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-red-600 mx-auto rounded-full mb-6" />
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Success stories from professionals and businesses who trusted us with their global journey
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-8">
                <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <Quote className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-6 mt-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 leading-relaxed mb-8 text-lg">
                "{testimonial.text}"
              </p>

              {/* Client Info */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-2xl object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r ${testimonial.gradient} opacity-20 rounded-2xl`} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-600 font-medium">
                    {testimonial.title}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {testimonial.company}
                  </p>
                </div>
              </div>

              {/* Hover Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`} />
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: '500+', label: 'Happy Clients' },
            { number: '98%', label: 'Success Rate' },
            { number: '25+', label: 'Countries' },
            { number: '5+', label: 'Years Experience' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div 
                className="text-3xl md:text-4xl font-bold mb-2"
                style={{ color: 'rgba(0, 50, 83, 1)' }}
              >
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;