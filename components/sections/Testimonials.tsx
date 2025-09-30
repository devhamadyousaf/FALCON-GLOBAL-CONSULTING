import React from 'react';
import Image from 'next/image';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Ananya Sharma',
      title: 'Relocated Professional',
      company: 'Tech Consultant',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1&fit=crop&crop=face',
      rating: 5,
      text: 'Falcon Global Consulting made my move abroad stress-free. Their team handled everything from documentation to settling in. The level of support and attention to detail was exceptional.',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      name: 'James Mitchell',
      title: 'HR Director',
      company: 'Global Solutions Inc.',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1&fit=crop&crop=face',
      rating: 5,
      text: 'We found the right talent in record time thanks to Falcon\'s recruitment services. Professional, reliable, and efficient. They understand our business needs perfectly.',
      gradient: 'from-red-500 to-pink-600'
    },
    {
      name: 'Maria Rodriguez',
      title: 'Business Owner',
      company: 'InnovateCorp',
      image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1&fit=crop&crop=face',
      rating: 5,
      text: 'Their business consulting services helped us expand into three new markets successfully. The strategic insights and practical support were invaluable for our growth.',
      gradient: 'from-green-500 to-emerald-600'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            What Our Clients Say
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-red-600 mx-auto rounded-full mb-8" />
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                <div className="relative w-14 h-14">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={56}
                    height={56}
                    className="rounded-2xl object-cover"
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
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-2">
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