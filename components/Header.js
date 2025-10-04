import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Globe, ChevronDown, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed w-full z-50 pt-4">
      
      {/* Pill-shaped Navbar Container */}
      <div className="max-w-4xl mx-auto px-4">
        <div 
          className="backdrop-blur-lg px-4 py-2 transition-all duration-300"
          style={{
            backgroundColor: '#fbf7eb',
            border: '2px solid rgba(187, 40, 44, 0.8)',
            borderRadius: '50px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            height: '70px'
          }}
        >
          <div className="flex items-center justify-between h-full">
            {/* Logo - Left Aligned */}
            <div className="flex items-center space-x-2 flex-shrink-0 overflow-hidden h-full">
              <img
                src="/klaus_logo.jpeg"
                alt="Falcon Global Consulting"
                className="h-20 w-auto object-contain"
              />
            </div>

            {/* Desktop Navigation - Center Aligned */}
            <nav className="hidden lg:flex items-center justify-center flex-1 mx-6">
              <div className="flex items-center space-x-8">
                {['Home', 'About', 'Services', 'Pricing', 'Contact'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="font-bold text-base transition-colors duration-200 relative group"
                    style={{ color: 'rgba(0, 50, 83, 1)' }}
                    onMouseEnter={(e) => e.target.style.color = 'rgba(187, 40, 44, 1)'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(0, 50, 83, 1)'}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </nav>

          {/* Desktop CTA Buttons / User Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-200 border"
                  style={{ 
                    backgroundColor: 'rgba(0, 50, 83, 0.1)', 
                    borderColor: 'rgba(0, 50, 83, 0.2)',
                    '&:hover': { backgroundColor: 'rgba(0, 50, 83, 0.15)' }
                  }}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium text-gray-700">{user.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Login Button - White bg, dark blue text, red border */}
                <Link href="/login">
                  <button 
                    className="px-4 py-2 font-bold text-sm transition-all duration-200"
                    style={{
                      backgroundColor: 'white',
                      color: 'rgba(0, 50, 83, 1)',
                      border: '2px solid rgba(187, 40, 44, 1)',
                      borderRadius: '20px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(0, 50, 83, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'white';
                    }}
                  >
                    Login
                  </button>
                </Link>
                
                {/* Sign Up Button - Red bg, white text, icon, pill shape */}
                <Link href="/signup">
                  <button 
                    className="px-4 py-2 font-bold text-sm text-white transition-all duration-200 flex items-center space-x-2"
                    style={{
                      backgroundColor: 'rgba(187, 40, 44, 1)',
                      borderRadius: '20px',
                      border: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(187, 40, 44, 0.9)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(187, 40, 44, 1)';
                    }}
                  >
                    <User className="w-4 h-4" />
                    <span>Sign Up</span>
                  </button>
                </Link>
              </>
            )}
          </div>

            {/* Mobile Menu Button - Right Aligned */}
            <div className="lg:hidden flex items-center flex-shrink-0">
              <button
                className="p-2 rounded-md transition-colors duration-200"
                style={{ color: 'rgba(0, 50, 83, 0.8)' }}
                onMouseEnter={(e) => e.target.style.color = 'rgba(0, 50, 83, 1)'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(0, 50, 83, 0.8)'}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden mt-3 mx-4">
          <div 
            className="backdrop-blur-lg px-4 py-3 space-y-3"
            style={{
              backgroundColor: 'rgba(251, 247, 235, 0.9)',
              border: '2px solid rgba(187, 40, 44, 0.8)',
              borderRadius: '25px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            {['Home', 'About', 'Services', 'Pricing', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block font-bold text-base py-2 transition-colors duration-200 text-center"
                style={{ color: 'rgba(0, 50, 83, 1)' }}
                onMouseEnter={(e) => e.target.style.color = 'rgba(187, 40, 44, 1)'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(0, 50, 83, 1)'}
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="pt-3 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button className="w-full text-left font-medium py-2 flex items-center space-x-2"
                          style={{ color: 'rgba(0, 50, 83, 0.8)' }}
                          onMouseEnter={(e) => e.target.style.color = 'rgba(0, 50, 83, 1)'}
                          onMouseLeave={(e) => e.target.style.color = 'rgba(0, 50, 83, 0.8)'}>
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left font-medium py-2 flex items-center space-x-2"
                    style={{ color: 'rgba(187, 40, 44, 1)' }}
                    onMouseEnter={(e) => e.target.style.color = 'rgba(187, 40, 44, 0.8)'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(187, 40, 44, 1)'}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link href="/login">
                    <button 
                      className="w-full px-4 py-2 font-bold text-sm transition-all duration-200"
                      style={{
                        backgroundColor: 'white',
                        color: 'rgba(0, 50, 83, 1)',
                        border: '2px solid rgba(187, 40, 44, 1)',
                        borderRadius: '20px'
                      }}
                    >
                      Login
                    </button>
                  </Link>
                  <Link href="/signup">
                    <button 
                      className="w-full px-4 py-2 font-bold text-sm text-white transition-all duration-200 flex items-center justify-center space-x-2"
                      style={{
                        backgroundColor: 'rgba(187, 40, 44, 1)',
                        borderRadius: '20px',
                        border: 'none'
                      }}
                    >
                      <User className="w-4 h-4" />
                      <span>Sign Up</span>
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;