import { ArrowRight, Briefcase, Globe } from 'lucide-react';
import Link from 'next/link';

const JobVacancies = () => {
  return (
    <section id="job vacancies" className="py-16 desert-sand-bg-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
            Job Vacancies
          </h2>
          <div className="w-24 h-1.5 mx-auto rounded-full mb-6" style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }} />
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Explore career opportunities with us or discover positions with our partner companies worldwide.
          </p>
        </div>

        {/* Two Options Banner */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Internal Jobs */}
          <Link href="/jobs/internal">
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                     style={{ backgroundColor: 'rgba(0, 50, 83, 1)' }}>
                  <Briefcase className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Internal Positions
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  Join our team at Falcon Global Consulting. Build your career with us and help connect people with opportunities across borders.
                </p>

                <button className="flex items-center space-x-2 font-semibold transition-all duration-300 group-hover:translate-x-2"
                        style={{ color: 'rgba(0, 50, 83, 1)' }}>
                  <span>View Internal Jobs</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Decorative gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-50 rounded-3xl transition-opacity duration-300 -z-10" />
            </div>
          </Link>

          {/* External Jobs */}
          <Link href="/jobs/external">
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-red-500">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                     style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}>
                  <Globe className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  External Opportunities
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  Discover exciting positions with our partner companies worldwide. We connect talented professionals with leading organizations globally.
                </p>

                <button className="flex items-center space-x-2 font-semibold transition-all duration-300 group-hover:translate-x-2"
                        style={{ color: 'rgba(187, 40, 44, 1)' }}>
                  <span>View External Jobs</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Decorative gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 opacity-0 group-hover:opacity-50 rounded-3xl transition-opacity duration-300 -z-10" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default JobVacancies;
