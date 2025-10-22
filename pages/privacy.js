import Head from 'next/head';
import Link from 'next/link';
import { Mail, MapPin, Shield, Lock, Database, Eye, FileText, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';

const PrivacyPolicy = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy - Falcon Global Consulting</title>
        <meta name="description" content="Privacy Policy for Falcon Global Consulting - Learn how we protect your data" />
      </Head>

      <div className="min-h-screen" style={{ backgroundColor: '#fbf7eb' }}>
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
              PRIVACY POLICY
            </h1>
            <p className="text-gray-600 mb-8">Last updated October 07, 2025</p>

            <div className="prose prose-lg max-w-none space-y-8">
              {/* Introduction */}
              <section>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-6 rounded-r-xl mb-6">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Privacy Matters to Us</h3>
                      <p className="text-gray-700 leading-relaxed">
                        At Falcon Global Consulting CORP., we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our services.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-4">
                  We care about data privacy and security. By using the Services, you agree to be bound by our Privacy Policy posted on the Services, which is incorporated into our Legal Terms.
                </p>

                <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 my-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-800 leading-relaxed">
                      <strong>Important Notice:</strong> Please be advised the Services are hosted in Germany. If you access the Services from any other region of the world with laws or other requirements governing personal data collection, use, or disclosure that differ from applicable laws in Germany, then through your continued use of the Services, you are transferring your data to Germany, and you expressly consent to have your data transferred to and processed in Germany.
                    </p>
                  </div>
                </div>
              </section>

              {/* Table of Contents */}
              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                  TABLE OF CONTENTS
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li><a href="#section-1" className="text-blue-600 hover:underline">Information We Collect</a></li>
                  <li><a href="#section-2" className="text-blue-600 hover:underline">How We Use Your Information</a></li>
                  <li><a href="#section-3" className="text-blue-600 hover:underline">Data Sharing and Disclosure</a></li>
                  <li><a href="#section-4" className="text-blue-600 hover:underline">Data Security</a></li>
                  <li><a href="#section-5" className="text-blue-600 hover:underline">Data Retention</a></li>
                  <li><a href="#section-6" className="text-blue-600 hover:underline">Your Privacy Rights</a></li>
                  <li><a href="#section-7" className="text-blue-600 hover:underline">GDPR Compliance</a></li>
                  <li><a href="#section-8" className="text-blue-600 hover:underline">Cookies and Tracking Technologies</a></li>
                  <li><a href="#section-9" className="text-blue-600 hover:underline">International Data Transfers</a></li>
                  <li><a href="#section-10" className="text-blue-600 hover:underline">Third-Party Services</a></li>
                  <li><a href="#section-11" className="text-blue-600 hover:underline">Children's Privacy</a></li>
                  <li><a href="#section-12" className="text-blue-600 hover:underline">Changes to This Privacy Policy</a></li>
                  <li><a href="#section-13" className="text-blue-600 hover:underline">Contact Us</a></li>
                </ol>
              </section>

              {/* Section 1: Information We Collect */}
              <section id="section-1">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                  <Database className="inline-block w-6 h-6 mr-2 mb-1" />
                  1. INFORMATION WE COLLECT
                </h2>

                <h3 className="text-xl font-semibold mb-3 text-gray-800">Personal Information You Provide</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We collect information that you voluntarily provide to us when you:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>Register for an account on our platform</li>
                  <li>Complete forms or applications for our services</li>
                  <li>Upload documents (passport, certificates, family documents, etc.)</li>
                  <li>Contact us for support or inquiries</li>
                  <li>Subscribe to our newsletters or communications</li>
                  <li>Participate in surveys or promotional activities</li>
                </ul>

                <p className="text-gray-700 leading-relaxed mb-4">
                  The personal information we may collect includes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li><strong>Identity Data:</strong> Full name, date of birth, nationality, passport details</li>
                  <li><strong>Contact Data:</strong> Email address, phone number, mailing address</li>
                  <li><strong>Account Data:</strong> Username, password, profile information</li>
                  <li><strong>Professional Data:</strong> Employment history, qualifications, certificates, CV/resume</li>
                  <li><strong>Financial Data:</strong> Payment information, billing address</li>
                  <li><strong>Family Data:</strong> Information about family members for relocation purposes</li>
                  <li><strong>Document Data:</strong> Scanned copies of official documents you upload</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-gray-800 mt-6">Information Automatically Collected</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  When you access our Services, we automatically collect certain information, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>Device Information:</strong> IP address, browser type, device type, operating system</li>
                  <li><strong>Usage Data:</strong> Pages visited, time spent on pages, clickstream data</li>
                  <li><strong>Location Data:</strong> General geographic location based on IP address</li>
                  <li><strong>Cookies and Similar Technologies:</strong> Data collected through cookies, web beacons, and similar technologies</li>
                </ul>
              </section>

              {/* Section 2: How We Use Your Information */}
              <section id="section-2">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                  <Eye className="inline-block w-6 h-6 mr-2 mb-1" />
                  2. HOW WE USE YOUR INFORMATION
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use the information we collect for the following purposes:
                </p>

                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Service Delivery</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                      <li>To provide and maintain our relocation and settlement services</li>
                      <li>To process your applications for jobs, visas, housing, and other services</li>
                      <li>To connect you with third-party service providers</li>
                      <li>To manage your account and profile</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Communication</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                      <li>To send you service updates, notifications, and important announcements</li>
                      <li>To respond to your inquiries and provide customer support</li>
                      <li>To send marketing communications (with your consent)</li>
                      <li>To conduct surveys and gather feedback</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Platform Improvement</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                      <li>To analyze usage patterns and improve our Services</li>
                      <li>To develop new features and functionality</li>
                      <li>To troubleshoot technical issues</li>
                      <li>To enhance user experience and security</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Legal and Security</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                      <li>To comply with legal obligations and regulations</li>
                      <li>To protect against fraud, abuse, and security threats</li>
                      <li>To enforce our Terms and Conditions</li>
                      <li>To resolve disputes and protect our rights</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 3: Data Sharing and Disclosure */}
              <section id="section-3">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                  3. DATA SHARING AND DISCLOSURE
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may share your personal information in the following circumstances:
                </p>

                <h3 className="text-lg font-semibold mb-3 text-gray-800">Third-Party Service Providers</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  As an intermediary platform, we share your information with third-party service providers to facilitate:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>Job placement with potential employers</li>
                  <li>Visa processing with immigration consultants</li>
                  <li>Housing arrangements with real estate providers</li>
                  <li>Flight bookings with travel agencies</li>
                  <li>Car rental services</li>
                  <li>Banking and insurance services</li>
                  <li>WiFi and utility setup services</li>
                </ul>

                <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 mb-6">
                  <p className="text-gray-800 leading-relaxed">
                    <strong>Important:</strong> We act solely as an intermediary. Once your information is shared with third-party providers, their own privacy policies will govern the use of your data. We recommend reviewing their policies before proceeding.
                  </p>
                </div>

                <h3 className="text-lg font-semibold mb-3 text-gray-800">Other Sharing Scenarios</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or sale of assets</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                  <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety and that of our users</li>
                  <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
                </ul>
              </section>

              {/* Section 4: Data Security */}
              <section id="section-4">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                  <Lock className="inline-block w-6 h-6 mr-2 mb-1" />
                  4. DATA SECURITY
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li>Encryption of data in transit and at rest using industry-standard protocols</li>
                  <li>Secure servers with regular security updates and patches</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Employee training on data protection and privacy practices</li>
                  <li>Backup and disaster recovery procedures</li>
                </ul>

                <div className="bg-red-50 border-l-4 border-red-600 p-4 my-6">
                  <p className="text-gray-800 leading-relaxed">
                    <strong>Disclaimer:</strong> While we strive to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security and are not liable for unauthorized access due to factors beyond our reasonable control.
                  </p>
                </div>
              </section>

              {/* Section 5: Data Retention */}
              <section id="section-5">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                  5. DATA RETENTION
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We retain your personal information for as long as necessary to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li>Provide our Services to you</li>
                  <li>Comply with legal, regulatory, tax, or accounting requirements</li>
                  <li>Maintain records for legitimate business purposes</li>
                  <li>Resolve disputes and enforce our agreements</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  When your information is no longer needed, we will securely delete or anonymize it in accordance with applicable laws and our data retention policies.
                </p>
              </section>

              {/* Section 6: Your Privacy Rights */}
              <section id="section-6">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                  6. YOUR PRIVACY RIGHTS
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Depending on your location and applicable law, you may have the following rights regarding your personal information:
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Right to Access</h4>
                    <p className="text-sm text-gray-700">Request a copy of the personal information we hold about you</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Right to Rectification</h4>
                    <p className="text-sm text-gray-700">Correct inaccurate or incomplete personal information</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Right to Erasure</h4>
                    <p className="text-sm text-gray-700">Request deletion of your personal information (subject to legal obligations)</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Right to Restriction</h4>
                    <p className="text-sm text-gray-700">Limit how we use your personal information</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Right to Data Portability</h4>
                    <p className="text-sm text-gray-700">Receive your data in a structured, commonly used format</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Right to Object</h4>
                    <p className="text-sm text-gray-700">Object to processing of your personal information for certain purposes</p>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  To exercise any of these rights, please contact us at <a href="mailto:info@falconglobalconsulting.com" className="text-blue-600 hover:underline">info@falconglobalconsulting.com</a>. We will respond to your request within the timeframe required by applicable law.
                </p>
              </section>

              {/* Section 7: GDPR Compliance */}
              <section id="section-7">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                  7. GDPR COMPLIANCE
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The platform collects and processes personal data in compliance with applicable data protection laws, including the General Data Protection Regulation (GDPR) for users in the European Union.
                </p>

                <h3 className="text-lg font-semibold mb-3 text-gray-800">Legal Basis for Processing</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We process your personal data based on the following legal grounds:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li><strong>Contractual Necessity:</strong> To perform our services under our agreement with you</li>
                  <li><strong>Consent:</strong> When you have given explicit consent for specific processing activities</li>
                  <li><strong>Legitimate Interests:</strong> For our legitimate business interests (e.g., fraud prevention, service improvement)</li>
                  <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3 text-gray-800">User Consent</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Users consent to the collection, processing, and storage of their personal information as described in this Privacy Policy. The platform implements reasonable technical and organizational measures to protect user data but is not liable for unauthorized access due to factors beyond its control.
                </p>
              </section>

              {/* Section 8: Cookies and Tracking Technologies */}
              <section id="section-8">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                  8. COOKIES AND TRACKING TECHNOLOGIES
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to enhance your experience on our platform. Cookies are small text files stored on your device that help us:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li>Remember your preferences and settings</li>
                  <li>Understand how you use our Services</li>
                  <li>Improve our platform performance and functionality</li>
                  <li>Deliver personalized content and advertisements</li>
                  <li>Analyze traffic and user behavior</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3 text-gray-800">Types of Cookies We Use</h3>
                <div className="space-y-3 mb-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-semibold text-gray-900">Essential Cookies</p>
                    <p className="text-sm text-gray-700">Required for the platform to function properly</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="font-semibold text-gray-900">Analytics Cookies</p>
                    <p className="text-sm text-gray-700">Help us understand how visitors interact with our platform</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <p className="font-semibold text-gray-900">Functionality Cookies</p>
                    <p className="text-sm text-gray-700">Remember your preferences and personalize your experience</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <p className="font-semibold text-gray-900">Marketing Cookies</p>
                    <p className="text-sm text-gray-700">Used to deliver relevant advertisements and track campaign performance</p>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  You can manage your cookie preferences through your browser settings. Please note that disabling certain cookies may affect the functionality of our Services. For more information, please see our <a href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</a>.
                </p>
              </section>

              {/* Section 9: International Data Transfers */}
              <section id="section-9">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                  9. INTERNATIONAL DATA TRANSFERS
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <strong>Our services are hosted in Germany.</strong> If you access our Services from regions outside Germany, your personal information will be transferred to and processed in Germany.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    By using our Services, you acknowledge and consent to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                    <li>The transfer of your personal data to Germany</li>
                    <li>Processing of your data in accordance with German and EU data protection laws</li>
                    <li>Potential transfer to third-party service providers in other countries</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed">
                    We ensure that all international data transfers comply with applicable data protection laws and implement appropriate safeguards, such as Standard Contractual Clauses (SCCs) or other approved transfer mechanisms.
                  </p>
                </div>
              </section>

              {/* Section 10: Third-Party Services */}
              <section id="section-10">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                  10. THIRD-PARTY SERVICES
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our platform may contain links to third-party websites, services, or applications. We are not responsible for the privacy practices or content of these third parties. We encourage you to review their privacy policies before providing any personal information.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4">
                  <p className="text-gray-800 leading-relaxed">
                    <strong>Note:</strong> As an intermediary platform, we connect you with third-party service providers (employers, visa consultants, housing providers, etc.). Once you engage with these providers, their privacy policies will apply to any information you share with them directly.
                  </p>
                </div>
              </section>

              {/* Section 11: Children's Privacy */}
              <section id="section-11">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                  11. CHILDREN'S PRIVACY
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our Services are intended for users who are at least 18 years old. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  If we become aware that we have collected personal information from a child under 18 without verification of parental consent, we will take steps to delete that information promptly.
                </p>
              </section>

              {/* Section 12: Changes to This Privacy Policy */}
              <section id="section-12">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                  12. CHANGES TO THIS PRIVACY POLICY
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li>Posting the updated Privacy Policy on our website</li>
                  <li>Updating the "Last updated" date at the top of this policy</li>
                  <li>Sending you an email notification (for significant changes)</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Your continued use of our Services after the effective date of the updated Privacy Policy constitutes your acceptance of the changes. We encourage you to review this Privacy Policy periodically.
                </p>
              </section>

              {/* Section 13: Contact Us */}
              <section id="section-13">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                  <Mail className="inline-block w-6 h-6 mr-2 mb-1" />
                  13. CONTACT US
                </h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <p className="font-semibold text-gray-800 mb-3 text-lg">Falcon Global Consulting CORP.</p>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-gray-700">
                        <p>Panama City, Arraijan, Veracruz</p>
                        <p>Cocoli, P.H. Tucan Country Club</p>
                        <p>Panama</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <a href="mailto:info@falconglobalconsulting.com" className="text-blue-600 hover:underline font-medium">
                        info@falconglobalconsulting.com
                      </a>
                    </div>

                    <div className="flex items-start space-x-3">
                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-gray-700">
                        <p><strong>Folio Number:</strong> 155772795</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-blue-200">
                    <p className="text-sm text-gray-600 italic">
                      We are committed to resolving any privacy concerns you may have and will respond to your inquiry within a reasonable timeframe as required by applicable law.
                    </p>
                  </div>
                </div>
              </section>

              {/* Additional Information */}
              <section className="border-t pt-8">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
                  Additional Information
                </h2>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <strong>Data Protection Officer:</strong> For EU-related privacy inquiries, you may contact our Data Protection Officer at the email address above with the subject line "DPO - Privacy Inquiry."
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <strong>Supervisory Authority:</strong> If you are located in the EU and believe we have not adequately addressed your privacy concerns, you have the right to lodge a complaint with your local data protection supervisory authority.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Related Documents:</strong> This Privacy Policy should be read in conjunction with our <a href="/terms" className="text-blue-600 hover:underline">Terms and Conditions</a> and <a href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</a>.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-300">
              © {new Date().getFullYear()} Falcon Global Consulting CORP. All Rights Reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default PrivacyPolicy;
