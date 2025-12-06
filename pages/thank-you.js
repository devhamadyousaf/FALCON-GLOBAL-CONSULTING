import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { CheckCircle, Home, Calendar } from 'lucide-react';

/**
 * Thank You Page - After Form Submission
 */
export default function ThankYouPage() {
  // Calendly link - Update this with your actual Calendly URL
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/your-link';

  return (
    <>
      <Head>
        <title>Thank You | FALCON Global Consulting</title>
        <meta name="description" content="Thank you for your application. We'll be in touch soon!" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Thank You!
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              Your application has been successfully submitted.
            </p>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
              <h2 className="text-xl font-bold text-gray-900 mb-4">What Happens Next?</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-[#1e3a8a] rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">Application Review</p>
                    <p className="text-gray-600 text-sm">Our team will review your application within 24-48 hours.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-[#1e3a8a] rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">Initial Contact</p>
                    <p className="text-gray-600 text-sm">We'll reach out via email or phone to discuss your goals.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-[#1e3a8a] rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">Schedule Your Consultation</p>
                    <p className="text-gray-600 text-sm">Book a free consultation call with our expert team.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4">
              {/* Calendly Button - Dark Blue */}
              <a
                href={calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-6 py-4 bg-[#1e3a8a] text-white rounded-xl font-semibold hover:bg-[#1e40af] transition-all flex items-center justify-center shadow-lg"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Your Free Consultation
              </a>

              {/* Back to Homepage */}
              <Link href="/">
                <button className="w-full px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center">
                  <Home className="w-5 h-5 mr-2" />
                  Back to Homepage
                </button>
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              📧 Check your email for a confirmation message and next steps.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
