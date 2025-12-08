import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Briefcase, MapPin, Clock, DollarSign, ArrowRight, Search, Filter } from 'lucide-react';

const Career = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const jobOpenings = [
    {
      id: 1,
      title: 'International Recruitment Specialist',
      location: 'Remote',
      type: 'Full-time',
      salary: '$50,000 - $70,000',
      category: 'Recruitment',
      description: 'Help connect global talent with opportunities worldwide. Experience in international recruitment preferred.'
    },
    {
      id: 2,
      title: 'Relocation Coordinator',
      location: 'Panama City, Panama',
      type: 'Full-time',
      salary: '$45,000 - $60,000',
      category: 'Operations',
      description: 'Manage relocation processes for international clients. Strong organizational skills required.'
    },
    {
      id: 3,
      title: 'Business Development Manager',
      location: 'Remote',
      type: 'Full-time',
      salary: '$60,000 - $90,000',
      category: 'Sales',
      description: 'Drive business growth and establish partnerships across global markets.'
    },
    {
      id: 4,
      title: 'Immigration Consultant',
      location: 'Hybrid',
      type: 'Full-time',
      salary: '$55,000 - $75,000',
      category: 'Consulting',
      description: 'Provide expert guidance on immigration processes and visa applications.'
    },
    {
      id: 5,
      title: 'Franchise Development Specialist',
      location: 'Remote',
      type: 'Full-time',
      salary: '$50,000 - $80,000',
      category: 'Franchise',
      description: 'Support franchise partners and develop franchise expansion strategies.'
    }
  ];

  const categories = ['All', 'Recruitment', 'Operations', 'Sales', 'Consulting', 'Franchise'];

  const filteredJobs = jobOpenings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Head>
        <title>Careers - Falcon Global Consulting Corp</title>
        <meta name="description" content="Join our team at Falcon Global Consulting and build a global career" />
      </Head>

      <div className="min-h-screen bg-white">
        <Header />

        {/* Hero Section */}
        <section
          className="relative pt-32 pb-20 overflow-hidden"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 50, 83, 0.85), rgba(0, 50, 83, 0.85)),
              url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Build Your Global Career
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
              Join Falcon Global Consulting and help connect people with opportunities across borders.
              Work with a diverse, remote-first team making a global impact.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link href="#openings">
                <button
                  className="px-8 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:shadow-xl flex items-center space-x-2"
                  style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}
                >
                  <span>View Open Positions</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="#franchise">
                <button
                  className="px-8 py-3 rounded-full font-semibold transition-all duration-300 border-2 border-white text-white hover:bg-white"
                  style={{ '&:hover': { color: 'rgba(0, 50, 83, 1)' } }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.color = 'rgba(0, 50, 83, 1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = 'white';
                  }}
                >
                  Franchise Opportunities
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Join Us Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Join Falcon Global?
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-red-600 mx-auto rounded-full" />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Global Impact',
                  description: 'Work on projects that connect people and businesses across continents',
                  icon: '🌍'
                },
                {
                  title: 'Remote-First Culture',
                  description: 'Flexible work arrangements with a focus on work-life balance',
                  icon: '💻'
                },
                {
                  title: 'Growth Opportunities',
                  description: 'Continuous learning and career development in a growing company',
                  icon: '📈'
                },
                {
                  title: 'Diverse Team',
                  description: 'Collaborate with talented professionals from around the world',
                  icon: '👥'
                },
                {
                  title: 'Competitive Benefits',
                  description: 'Comprehensive compensation packages and performance incentives',
                  icon: '💰'
                },
                {
                  title: 'Innovation Focus',
                  description: 'Be part of cutting-edge solutions in global consulting',
                  icon: '🚀'
                }
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl transition-all duration-300 hover:shadow-xl"
                  style={{ backgroundColor: '#fbf7eb' }}
                >
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-700">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Job Openings Section */}
        <section id="openings" className="py-16" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Current Openings
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-red-600 mx-auto rounded-full" />
            </div>

            {/* Search and Filter */}
            <div className="mb-8 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search positions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                      selectedCategory === category
                        ? 'text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                    style={
                      selectedCategory === category
                        ? { backgroundColor: 'rgba(0, 50, 83, 1)' }
                        : {}
                    }
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Listings */}
            <div className="space-y-6">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 mb-4 lg:mb-0">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{job.title}</h3>
                      <p className="text-gray-600 mb-4">{job.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" style={{ color: 'rgba(0, 50, 83, 1)' }} />
                          <span className="text-gray-700">{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" style={{ color: 'rgba(0, 50, 83, 1)' }} />
                          <span className="text-gray-700">{job.type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4" style={{ color: 'rgba(0, 50, 83, 1)' }} />
                          <span className="text-gray-700">{job.salary}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <button
                        className="px-6 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:shadow-lg flex items-center space-x-2"
                        style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}
                      >
                        <span>Apply Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Franchise Section */}
        <section id="franchise" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Franchise Opportunities
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-red-600 mx-auto rounded-full mb-6" />
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Join our growing network of franchise partners and bring Falcon Global Consulting
                services to your region. We provide comprehensive training, support, and proven
                business systems.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div
                className="p-8 rounded-2xl"
                style={{ backgroundColor: '#fbf7eb' }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">What We Offer</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Comprehensive training and ongoing support
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Proven business model and systems
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Marketing and brand support
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Access to our global network
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Technology platform and tools
                  </li>
                </ul>
              </div>

              <div
                className="p-8 rounded-2xl"
                style={{ backgroundColor: '#fbf7eb' }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Who We're Looking For</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Entrepreneurial mindset and business acumen
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Experience in consulting, recruitment, or related fields
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Strong local network and market knowledge
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Commitment to quality and client satisfaction
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Sufficient capital investment
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => router.push('/apply')}
                className="px-8 py-4 rounded-full font-semibold text-white text-lg transition-all duration-300 hover:shadow-xl"
                style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }}
              >
                Request Franchise Information
              </button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Career;
