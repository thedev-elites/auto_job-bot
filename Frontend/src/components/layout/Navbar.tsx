import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Settings, LogOut } from 'lucide-react';
import Button from '../ui-components/Button';
import { useAuth } from '@/contexts/AuthContext';

// Function to generate a consistent color based on name
const getColorForName = (name: string = '') => {
  // List of bright, distinct colors
  const colors = [
    { bg: 'bg-blue-500', text: 'text-white' },
    { bg: 'bg-red-500', text: 'text-white' },
    { bg: 'bg-green-500', text: 'text-white' },
    { bg: 'bg-yellow-500', text: 'text-white' },
    { bg: 'bg-purple-500', text: 'text-white' },
    { bg: 'bg-pink-500', text: 'text-white' },
    { bg: 'bg-indigo-500', text: 'text-white' },
    { bg: 'bg-teal-500', text: 'text-white' },
    { bg: 'bg-orange-500', text: 'text-white' }
  ];
  
  // Hash the name to get a consistent index
  let hashCode = 0;
  for (let i = 0; i < name.length; i++) {
    hashCode = name.charCodeAt(i) + ((hashCode << 5) - hashCode);
  }
  
  // Get positive hash
  hashCode = Math.abs(hashCode);
  
  // Get index from hash
  const index = hashCode % colors.length;
  
  return colors[index];
};

// Function to get initials from name
const getInitials = (name: string = '') => {
  if (!name) return 'U';
  
  const parts = name.split(' ');
  if (parts.length === 1) return name.charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const { user, isAuthenticated, login, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const renderAuthButtons = () => {
    if (isAuthenticated) {
      console.log('Current user data in Navbar:', user);
      
      return (
        <div className="flex items-center gap-4 relative">
          <div 
            className="relative"
            onMouseEnter={() => {
              clearTimeout(timeoutId);
              setProfileDropdownOpen(true);
            }}
            onMouseLeave={() => {
              // Clear any existing timeout
              if (timeoutId) clearTimeout(timeoutId);
              
              // Set new timeout
              const newTimeoutId = setTimeout(() => {
                setProfileDropdownOpen(false);
              }, 300);
              
              setTimeoutId(newTimeoutId);
            }}
          >
            <button 
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border border-border focus:outline-none focus:ring-2 focus:ring-blue"
              aria-label="Profile menu"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={`${user.name}'s profile`} 
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    console.error('Error loading profile image:', e);
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = 'none';
                    // Find the parent and add a fallback
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = `w-full h-full flex items-center justify-center font-medium ${getColorForName(user?.name).bg} ${getColorForName(user?.name).text}`;
                      fallback.innerText = getInitials(user?.name);
                      parent.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center font-medium ${getColorForName(user?.name).bg} ${getColorForName(user?.name).text}`}>
                  {getInitials(user?.name)}
                </div>
              )}
            </button>
            
            {/* Dropdown menu with animation */}
            {profileDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 transition-all duration-300 origin-top-right"
                onMouseEnter={() => {
                  clearTimeout(timeoutId);
                  setProfileDropdownOpen(true);
                }}
                onMouseLeave={() => {
                  // Clear any existing timeout
                  if (timeoutId) clearTimeout(timeoutId);
                  
                  // Set new timeout
                  const newTimeoutId = setTimeout(() => {
                    setProfileDropdownOpen(false);
                  }, 300);
                  
                  setTimeoutId(newTimeoutId);
                }}
              >
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Link to="/profile" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </Link>
                  <Link to="/settings" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                  <button 
                    onClick={logout} 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-4">
        <Link to="/login">
          <Button variant="outline" size="sm">Log In</Button>
        </Link>
        <Link to="/signup">
          <Button variant="primary" size="sm">Sign Up</Button>
        </Link>
      </div>
    );
  };

  const renderNavigationLinks = () => {
    if (!isAuthenticated && (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup')) {
      // On landing page, login, or signup and not authenticated - don't show navigation links
      return null;
    }
    
    return (
      <>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'text-blue font-medium' : 'text-foreground hover:text-blue transition-colors'}`}>
            Dashboard
          </Link>
          <Link to="/resume-builder" className={`nav-link ${location.pathname === '/resume-builder' ? 'text-blue font-medium' : 'text-foreground hover:text-blue transition-colors'}`}>
            Resume Builder
          </Link>
          <Link to="/auto-apply" className={`nav-link ${location.pathname === '/auto-apply' ? 'text-blue font-medium' : 'text-foreground hover:text-blue transition-colors'}`}>
            Auto Apply
          </Link>
        </nav>
      </>
    );
  };

  const renderMobileMenuLinks = () => {
    if (!isAuthenticated && (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup')) {
      // On landing page, login, or signup and not authenticated - don't show navigation links in mobile menu
      return (
        <div className="pt-3">
          {renderAuthButtons()}
        </div>
      );
    }
    
    return (
      <div className="px-4 py-5 space-y-3">
        {isAuthenticated && user && (
          <div className="flex items-center space-x-3 px-2 pb-3 mb-2 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              {user?.avatar ? (
                <img 
                  src={user.avatar}
                  alt={`${user.name}'s profile`}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    console.error('Error loading mobile profile image:', e);
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = 'none';
                    // Find the parent and add a fallback
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = `w-full h-full flex items-center justify-center text-lg font-medium ${getColorForName(user?.name).bg} ${getColorForName(user?.name).text}`;
                      fallback.innerText = getInitials(user?.name);
                      parent.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-lg font-medium ${getColorForName(user?.name).bg} ${getColorForName(user?.name).text}`}>
                  {getInitials(user?.name)}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <Link to="/dashboard" className={`block py-2 ${location.pathname === '/dashboard' ? 'text-blue font-medium' : 'text-foreground'}`}>
          Dashboard
        </Link>
        <Link to="/resume-builder" className={`block py-2 ${location.pathname === '/resume-builder' ? 'text-blue font-medium' : 'text-foreground'}`}>
          Resume Builder
        </Link>
        <Link to="/auto-apply" className={`block py-2 ${location.pathname === '/auto-apply' ? 'text-blue font-medium' : 'text-foreground'}`}>
          Auto Apply
        </Link>
        {isAuthenticated && (
          <>
            <Link to="/profile" className="py-2 text-foreground flex items-center">
              <User className="mr-2 h-4 w-4" />
              My Profile
            </Link>
            <Link to="/settings" className="py-2 text-foreground flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </>
        )}
        <div className="pt-3">
          {renderAuthButtons()}
        </div>
      </div>
    );
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center">
            <span className="text-xl md:text-2xl font-bold text-blue">
              Career<span className="text-foreground">Sync</span>
              <span className="text-blue">AI</span>
            </span>
          </Link>
          
          {renderNavigationLinks()}
          
          <div className="hidden md:block">
            {renderAuthButtons()}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background">
          {renderMobileMenuLinks()}
        </div>
      )}
    </header>
  );
};

export default Navbar;
