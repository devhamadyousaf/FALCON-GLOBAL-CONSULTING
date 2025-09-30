import React from 'react';
import { Target, Users, Globe as Globe2, Award, ArrowRight } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Who We Are
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-red-600 mx-auto rounded-full mb-8" />
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                At <span className="font-semibold text-blue-600">Falcon Global Consulting</span>, we bring together international expertise and local
                insights to help businesses and professionals thrive on a global stage. Headquartered
                in the UAE with a remote-first approach, we specialize in bridging cultures and
                simplifying global opportunities.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our team operates across borders and time zones, guided by precision, trust, and a people-first mindset.
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: Target, title: 'Precision-Driven', desc: 'Tailored solutions for every client' },
                { icon: Users, title: 'People-First', desc: 'Building lasting relationships' },
                { icon: Globe2, title: 'Global Reach', desc: 'Operating across continents' },
                { icon: Award, title: 'Trusted Expertise', desc: 'Years of proven success' }
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-300 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100">
              <blockquote className="text-xl font-medium text-gray-800 italic mb-4">
                "Falcon Global Consulting – where global talent meets opportunity. Built
                on trust, precision, and an international mindset."
              </blockquote>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative">
            <div className="relative z-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-1 transition-transform duration-500">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Globe2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Global Network</h3>
                  <p className="text-blue-100 leading-relaxed">
                    Connected across continents, delivering opportunities worldwide
                  </p>
                </div>
              </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-200 to-pink-200 rounded-3xl transform -rotate-3 scale-105 opacity-30" />
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-20 animate-pulse" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
