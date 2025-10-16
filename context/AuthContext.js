import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in (from localStorage in a real app)
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = () => {
    try {
      // In production, this would check localStorage/cookies or validate JWT token
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error checking user login status:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check for admin credentials
        if (email === 'admin@falconglobalconsulting.com' && password === '123456789') {
          const adminUser = {
            id: 'admin_001',
            email: email,
            name: 'Admin',
            role: 'admin',
            avatar: `https://ui-avatars.com/api/?name=Admin&background=dc2626`,
            createdAt: new Date().toISOString()
          };

          setUser(adminUser);
          localStorage.setItem('user', JSON.stringify(adminUser));
          resolve({ success: true, user: adminUser, role: 'admin' });
        } else {
          // Regular customer login
          const mockUser = {
            id: Math.random().toString(36).substr(2, 9),
            email: email,
            name: email.split('@')[0],
            role: 'customer',
            avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=random`,
            createdAt: new Date().toISOString()
          };

          setUser(mockUser);
          localStorage.setItem('user', JSON.stringify(mockUser));
          resolve({ success: true, user: mockUser, role: 'customer' });
        }
      }, 1000);
    });
  };

  const signup = async (userData) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          id: Math.random().toString(36).substr(2, 9),
          email: userData.email,
          name: userData.fullName,
          phone: userData.phone,
          country: userData.country,
          role: 'customer',
          avatar: `https://ui-avatars.com/api/?name=${userData.fullName}&background=random`,
          onboardingComplete: true,
          createdAt: new Date().toISOString()
        };

        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        resolve({ success: true, user: mockUser });
      }, 1000);
    });
  };

  const loginWithGoogle = async () => {
    // Simulate Google OAuth
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          id: 'google_' + Math.random().toString(36).substr(2, 9),
          email: 'user@gmail.com',
          name: 'Google User',
          role: 'customer',
          avatar: 'https://ui-avatars.com/api/?name=Google+User&background=4285F4',
          provider: 'google',
          onboardingComplete: false, // Google users need to complete onboarding
          createdAt: new Date().toISOString()
        };

        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        resolve({ success: true, user: mockUser, needsOnboarding: true });
      }, 1500);
    });
  };

  const completeOnboarding = async (onboardingData) => {
    // Simulate API call to save onboarding data
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedUser = {
          ...user,
          targetRegion: onboardingData.targetRegion,
          jobTitle: onboardingData.jobTitle,
          languageLevel: onboardingData.languageLevel,
          startDate: onboardingData.startDate,
          salaryRange: onboardingData.salaryRange,
          cv: onboardingData.cv, // CV file metadata
          onboardingComplete: true,
          updatedAt: new Date().toISOString()
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        resolve({ success: true, user: updatedUser });
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    loginWithGoogle,
    completeOnboarding,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;