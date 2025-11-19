import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const testimonials = [
    {
      videoSrc: '/testimonial_1.mp4',
      thumbnail: '/testimonial_1.mp4'
    },
    {
      videoSrc: '/testimonial_2.mp4',
      thumbnail: '/testimonial_2.mp4'
    }
  ];

  const nextSlide = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index) => {
    setIsPlaying(false);
    setCurrentIndex(index);
  };

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
          <div className="w-24 h-1.5 mx-auto rounded-full mb-6" style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }} />
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Success stories from professionals and businesses who trusted us with their global journey
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative w-64 md:w-72 mx-auto">
          {/* Navigation Arrows - Outside Video */}
          {!isPlaying && testimonials.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-10"
                style={{ color: 'rgba(0, 50, 83, 1)' }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-10"
                style={{ color: 'rgba(0, 50, 83, 1)' }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Video Carousel */}
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Video Container - Portrait Ratio (9:16) */}
            <div className="relative bg-black" style={{ aspectRatio: '9/16' }}>
              <video
                key={currentIndex}
                ref={(el) => {
                  if (el && isPlaying) {
                    el.play();
                  }
                }}
                className="w-full h-full object-cover"
                controls={isPlaying}
                poster={testimonials[currentIndex].thumbnail}
                onEnded={() => setIsPlaying(false)}
                playsInline
              >
                <source src={testimonials[currentIndex].videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Play Button Overlay - Transparent */}
              {!isPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer group hover:bg-black/30 transition-all duration-300"
                  onClick={() => setIsPlaying(true)}
                >
                  <Play className="w-16 h-16 md:w-20 md:h-20 fill-white drop-shadow-2xl transform group-hover:scale-110 transition-all duration-300" />
                </div>
              )}
            </div>
          </div>

          {/* Dots Navigation */}
          {testimonials.length > 1 && (
            <div className="flex justify-center items-center space-x-3 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex
                      ? 'w-12 h-3'
                      : 'w-3 h-3 hover:scale-125'
                  }`}
                  style={{
                    backgroundColor: index === currentIndex ? 'rgba(0, 50, 83, 1)' : 'rgba(0, 50, 83, 0.3)'
                  }}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Counter */}
          {testimonials.length > 1 && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500 font-medium">
                {currentIndex + 1} / {testimonials.length}
              </p>
            </div>
          )}
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