import { ArrowRight, Play, Users, Globe, Award } from 'lucide-react';

const Hero = () => {
  return (
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
          {/* Subtitle/Slogan - Now Bigger */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 md:mb-10 leading-tight">
            The sharpest eye for talent
          </h1>

          {/* Description */}
          <p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed mb-8 md:mb-12">
            We connect people, <span className="font-bold">businesses</span>, and <span className="font-bold">opportunities</span> across borders with trusted
            recruitment, relocation, and consulting solutions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12 md:mb-16">
            <button className="group text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
                    style={{ 
                      background: 'linear-gradient(to right, rgba(187, 40, 44, 1), rgba(187, 40, 44, 0.8))'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(to right, rgba(187, 40, 44, 0.9), rgba(187, 40, 44, 0.7))';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(to right, rgba(187, 40, 44, 1), rgba(187, 40, 44, 0.8))';
                    }}>
              <span>Talk to an Expert</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <button className="group flex items-center space-x-2 font-semibold text-base md:text-lg transition-colors duration-300"
                    style={{ color: 'white' }}
                    onMouseEnter={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
                    onMouseLeave={(e) => e.target.style.color = 'white'}>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300"
                   style={{
                     backgroundColor: 'rgba(251, 247, 235, 0.8)',
                     backdropFilter: 'blur(4px)'
                   }}>
                <Play className="w-4 h-4 md:w-5 md:h-5 ml-1" />
              </div>
              <span>Watch Our Story</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-3xl mx-auto">
            {[
              { icon: Users, number: '500+', label: 'Successful Placements' },
              { icon: Globe, number: '25+', label: 'Countries Served' },
              { icon: Award, number: '98%', label: 'Client Satisfaction' }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">
                  <stat.icon className="w-6 h-6 md:w-8 md:h-8" style={{ color: 'rgba(0, 50, 83, 1)' }} />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-sm md:text-base text-white font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;