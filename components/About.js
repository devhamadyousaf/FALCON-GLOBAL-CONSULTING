import { Target, Users, Globe as Globe2, Award, ArrowRight } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Who We Are
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-red-600 mx-auto rounded-full mb-6" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Content */}
          <div className="space-y-6 md:space-y-8">
            <div>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 md:mb-6">
                At <span className="font-semibold text-blue-600">Falcon Global Consulting</span>, we bring together international expertise and local
                insights to help businesses and professionals thrive on a global stage. Headquartered
                in Panama with a remote-first approach, we specialize in bridging cultures and
                simplifying global opportunities.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                Our team operates across borders and time zones, guided by precision, trust, and a people-first mindset.
              </p>
            </div>

            {/* Key Features with Dunes Background */}
            <div
              className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 p-6 md:p-8 rounded-2xl overflow-hidden"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(173, 216, 230, 0.85), rgba(173, 216, 230, 0.85)),
                  url('https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')
                `,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {[
                { icon: Target, title: 'Precision-Driven', desc: 'Tailored solutions for every client' },
                { icon: Users, title: 'People-First', desc: 'Building lasting relationships' },
                { icon: Globe2, title: 'Global Reach', desc: 'Operating across continents' },
                { icon: Award, title: 'Trusted Expertise', desc: 'Years of proven success' }
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 group backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-300" style={{ backgroundColor: 'rgba(0, 50, 83, 1)' }}>
                    <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-sm md:text-base" style={{ color: 'rgba(0, 50, 83, 1)' }}>{feature.title}</h3>
                    <p className="text-gray-700 text-xs md:text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl border border-blue-100" style={{ backgroundColor: '#fbf7eb' }}>
              <blockquote className="text-base md:text-xl font-medium text-gray-800 italic mb-4">
                "Falcon Global Consulting – where global talent meets opportunity. Built
                on trust, precision, and an international mindset."
              </blockquote>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative">
            <div className="relative z-10 overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl transform rotate-2 hover:rotate-1 transition-transform duration-500">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Professional team collaboration"
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="text-center text-white">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Globe2 className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2">Global Network</h3>
                  <p className="text-sm md:text-base text-blue-100 leading-relaxed">
                    Connected across continents, delivering opportunities worldwide
                  </p>
                </div>
              </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-200 to-pink-200 rounded-2xl md:rounded-3xl transform -rotate-2 scale-105 opacity-30" />
            <div className="absolute -top-3 -left-3 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-20 animate-pulse" />
            <div className="absolute -bottom-3 -right-3 w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;