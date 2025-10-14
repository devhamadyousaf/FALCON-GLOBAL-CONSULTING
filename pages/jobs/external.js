import { useState } from 'react';
import { MapPin, Clock, DollarSign, ArrowRight, ArrowLeft, Search, Building } from 'lucide-react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const ExternalJobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const jobOpenings = [
    {
      id: 1,
      title: 'Senior Software Engineer',
      company: 'Tech Solutions GmbH',
      location: 'Berlin, Germany',
      type: 'Full-time',
      salary: '€80,000 - €110,000',
      category: 'Technology',
      description: 'Lead development of cloud-based solutions for enterprise clients. 5+ years experience required.'
    },
    {
      id: 2,
      title: 'Marketing Manager',
      company: 'Global Brand Co.',
      location: 'Lisbon, Portugal',
      type: 'Full-time',
      salary: '€50,000 - €70,000',
      category: 'Marketing',
      description: 'Drive international marketing campaigns and brand strategy across European markets.'
    },
    {
      id: 3,
      title: 'Financial Analyst',
      company: 'Investment Partners LLC',
      location: 'Miami, USA',
      type: 'Full-time',
      salary: '$70,000 - $95,000',
      category: 'Finance',
      description: 'Analyze financial data and provide strategic insights for investment decisions.'
    },
    {
      id: 4,
      title: 'Hotel Operations Manager',
      company: 'Luxury Resorts International',
      location: 'Cartagena, Colombia',
      type: 'Full-time',
      salary: '$45,000 - $65,000',
      category: 'Hospitality',
      description: 'Oversee daily operations of luxury resort property and ensure exceptional guest experiences.'
    },
    {
      id: 5,
      title: 'Data Scientist',
      company: 'AI Innovations Inc.',
      location: 'Remote - Worldwide',
      type: 'Full-time',
      salary: '$90,000 - $130,000',
      category: 'Technology',
      description: 'Build machine learning models and analyze large datasets to drive business insights.'
    },
    {
      id: 6,
      title: 'Project Manager',
      company: 'Construction Elite SA',
      location: 'Panama City, Panama',
      type: 'Full-time',
      salary: '$55,000 - $80,000',
      category: 'Construction',
      description: 'Manage large-scale construction projects from planning to completion. PMP certification preferred.'
    }
  ];

  const categories = ['All', 'Technology', 'Marketing', 'Finance', 'Hospitality', 'Construction'];

  const filteredJobs = jobOpenings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-16 desert-sand-bg-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link href="/#job vacancies">
            <button className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Main Page</span>
            </button>
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'rgba(0, 50, 83, 1)' }}>
              External Job Opportunities
            </h1>
            <div className="w-24 h-1.5 mx-auto rounded-full mb-6" style={{ backgroundColor: 'rgba(187, 40, 44, 1)' }} />
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Discover exciting career opportunities with our partner companies around the world.
              We connect talented professionals with leading organizations globally.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search positions or companies..."
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
                    <div className="flex items-center space-x-3 mb-3">
                      <Building className="w-5 h-5" style={{ color: 'rgba(187, 40, 44, 1)' }} />
                      <span className="text-sm font-semibold" style={{ color: 'rgba(187, 40, 44, 1)' }}>{job.company}</span>
                    </div>
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
      </main>
      <Footer />
    </div>
  );
};

export default ExternalJobs;
