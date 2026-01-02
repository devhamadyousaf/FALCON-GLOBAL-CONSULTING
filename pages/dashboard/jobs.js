import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Globe, Briefcase, ArrowLeft, TrendingUp, Send, Eye, CheckCircle,
  Clock, Target, BarChart3, Users, MapPin, DollarSign, Calendar,
  FileText, Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function JobsDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [timeframe, setTimeframe] = useState('week');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!user) return null;

  // Mock data for analytics
  const stats = {
    applicationsSubmitted: 24,
    responsesReceived: 12,
    interviewsScheduled: 5,
    offersReceived: 2
  };

  const weeklyData = [
    { day: 'Mon', applications: 3, responses: 1 },
    { day: 'Tue', applications: 4, responses: 2 },
    { day: 'Wed', applications: 5, responses: 1 },
    { day: 'Thu', applications: 3, responses: 3 },
    { day: 'Fri', applications: 6, responses: 2 },
    { day: 'Sat', applications: 2, responses: 2 },
    { day: 'Sun', applications: 1, responses: 1 }
  ];

  const recentApplications = [
    {
      id: 1,
      company: 'Google LLC',
      position: 'Senior Software Engineer',
      location: 'Mountain View, CA',
      salary: '$150k - $200k',
      appliedDate: '2 days ago',
      status: 'interview',
      logo: '🔵'
    },
    {
      id: 2,
      company: 'Amazon',
      position: 'Product Manager',
      location: 'Seattle, WA',
      salary: '$130k - $180k',
      appliedDate: '4 days ago',
      status: 'reviewed',
      logo: '🟠'
    },
    {
      id: 3,
      company: 'Microsoft',
      position: 'Cloud Solutions Architect',
      location: 'Redmond, WA',
      salary: '$140k - $190k',
      appliedDate: '1 week ago',
      status: 'pending',
      logo: '🟢'
    }
  ];

  const topMatches = [
    {
      id: 1,
      company: 'Tesla',
      position: 'Engineering Manager',
      match: 95,
      location: 'Austin, TX',
      salary: '$160k - $220k'
    },
    {
      id: 2,
      company: 'Apple',
      position: 'iOS Developer',
      match: 92,
      location: 'Cupertino, CA',
      salary: '$145k - $195k'
    },
    {
      id: 3,
      company: 'Meta',
      position: 'Data Scientist',
      match: 88,
      location: 'Menlo Park, CA',
      salary: '$150k - $210k'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'interview':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const maxApplications = Math.max(...weeklyData.map(d => d.applications));
  const maxResponses = Math.max(...weeklyData.map(d => d.responses));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/services">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              </Link>
              <Link href="/">
                <div className="flex items-center cursor-pointer group">
                  <img
                    src="/klaus_logo.jpeg"
                    alt="Falcon Global Consulting"
                    className="h-10 w-auto object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </Link>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-blue-200"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}! 👋</h2>
          <p className="text-gray-600">Here's your job search performance overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Applications Submitted',
              value: stats.applicationsSubmitted,
              icon: Send,
              color: 'from-blue-600 to-indigo-700',
              bgColor: 'from-blue-50 to-indigo-50',
              change: '+12%'
            },
            {
              label: 'Responses Received',
              value: stats.responsesReceived,
              icon: Eye,
              color: 'from-green-600 to-emerald-700',
              bgColor: 'from-green-50 to-emerald-50',
              change: '+8%'
            },
            {
              label: 'Interviews Scheduled',
              value: stats.interviewsScheduled,
              icon: Users,
              color: 'from-purple-600 to-violet-700',
              bgColor: 'from-purple-50 to-violet-50',
              change: '+25%'
            },
            {
              label: 'Offers Received',
              value: stats.offersReceived,
              icon: CheckCircle,
              color: 'from-red-600 to-pink-700',
              bgColor: 'from-red-50 to-pink-50',
              change: '+50%'
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Activity Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <span>Weekly Activity</span>
              </h3>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            {/* Bar Chart */}
            <div className="space-y-4">
              {weeklyData.map((day, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium w-12">{day.day}</span>
                    <div className="flex-1 mx-4 flex items-center space-x-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-indigo-700 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${(day.applications / maxApplications) * 100}%` }}
                        >
                          {day.applications > 0 && (
                            <span className="text-xs text-white font-semibold">{day.applications}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-600 to-emerald-700 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${(day.responses / maxResponses) * 100}%` }}
                        >
                          {day.responses > 0 && (
                            <span className="text-xs text-white font-semibold">{day.responses}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full"></div>
                <span className="text-sm text-gray-600">Applications</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-green-600 to-emerald-700 rounded-full"></div>
                <span className="text-sm text-gray-600">Responses</span>
              </div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Target className="w-6 h-6 text-green-600" />
              <span>Success Metrics</span>
            </h3>

            {/* Response Rate */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Response Rate</span>
                <span className="text-sm font-bold text-blue-600">50%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-full rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>

            {/* Interview Conversion */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Interview Conversion</span>
                <span className="text-sm font-bold text-purple-600">42%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-violet-700 h-full rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>

            {/* Offer Rate */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Offer Rate</span>
                <span className="text-sm font-bold text-green-600">40%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 h-full rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>

            {/* Profile Strength */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Profile Strength</span>
                <span className="text-2xl font-bold text-blue-600">85%</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">Your profile is performing well!</p>
              <button className="text-xs text-blue-600 font-semibold hover:text-blue-700">
                Improve Profile →
              </button>
            </div>
          </div>
        </div>

        {/* Recent Applications & Top Matches */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Applications */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Clock className="w-6 h-6 text-blue-600" />
                <span>Recent Applications</span>
              </h3>
              <Link href="#" className="text-sm text-blue-600 font-semibold hover:text-blue-700">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div key={app.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                        {app.logo}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{app.position}</h4>
                        <p className="text-sm text-gray-600">{app.company}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(app.status)}`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{app.location}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <DollarSign className="w-3 h-3" />
                      <span>{app.salary}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{app.appliedDate}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Matches */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span>Top Matches for You</span>
              </h3>
              <Link href="#" className="text-sm text-blue-600 font-semibold hover:text-blue-700">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {topMatches.map((match) => (
                <div key={match.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                        {match.position}
                      </h4>
                      <p className="text-sm text-gray-600">{match.company}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-lg font-bold text-green-600">{match.match}%</span>
                      <span className="text-xs text-gray-500">match</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{match.location}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3" />
                        <span>{match.salary}</span>
                      </span>
                    </div>
                    <button className="text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center space-x-1 group-hover:translate-x-1 transition-transform duration-200">
                      <span>Apply</span>
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Browse All Jobs</span>
            </button>
          </div>
        </div>

        {/* Export Report */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Download Your Performance Report</h3>
              <p className="text-blue-100">Get detailed insights into your job search activity</p>
            </div>
            <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}