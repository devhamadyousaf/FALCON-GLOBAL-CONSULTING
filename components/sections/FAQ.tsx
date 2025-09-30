'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What industries do you specialize in?',
      answer: 'We work across diverse industries, with a strong focus on professional, technical, and international roles. Our expertise spans technology, healthcare, finance, engineering, consulting, and many other sectors where global talent mobility is essential.'
    },
    {
      question: 'Do you assist individuals as well as businesses?',
      answer: 'Yes, we provide comprehensive services for both individuals seeking international opportunities and businesses looking to expand globally. Our individual services include career counseling, relocation support, and job placement, while our business services cover recruitment, consulting, and compliance.'
    },
    {
      question: 'Is Falcon Global Consulting limited to certain countries?',
      answer: 'Not at all. While we are headquartered in the UAE, we operate globally with a remote-first approach. Our network spans across multiple continents, allowing us to serve clients and place talent in various countries worldwide.'
    },
    {
      question: 'How do you ensure compliance with local laws?',
      answer: 'We maintain a network of legal experts and compliance specialists in key markets. Our team stays updated with the latest regulations, visa requirements, and employment laws to ensure all our services meet local legal standards and requirements.'
    },
    {
      question: 'What is your typical timeline for placements?',
      answer: 'Timeline varies based on the complexity and requirements of each placement. For standard recruitment, we typically present qualified candidates within 2-4 weeks. For executive searches or specialized roles, the process may take 6-12 weeks to ensure the perfect match.'
    },
    {
      question: 'Do you provide post-placement support?',
      answer: 'Absolutely. We believe in long-term partnerships and provide ongoing support to ensure successful integration and satisfaction for both clients and placed candidates. This includes follow-up consultations, adaptation assistance, and continuous relationship management.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-red-600 mx-auto rounded-full mb-8" />
          <p className="text-xl text-gray-600">
            Get answers to common questions about our services and process
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <button
                className="w-full p-6 text-left flex items-center justify-between hover:bg-white/50 transition-colors duration-300"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <div className={`w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}>
                  {openIndex === index ? (
                    <Minus className="w-4 h-4 text-white" />
                  ) : (
                    <Plus className="w-4 h-4 text-white" />
                  )}
                </div>
              </button>

              <div className={`transition-all duration-300 ease-in-out ${
                openIndex === index
                  ? 'max-h-48 opacity-100'
                  : 'max-h-0 opacity-0'
              } overflow-hidden`}>
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            Still have questions? We're here to help!
          </p>
          <button className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-full font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Contact Our Experts
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;