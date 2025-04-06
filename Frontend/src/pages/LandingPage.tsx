import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Shield, Mail, Sparkles, Search, Zap, ChevronRight, Award, Brain, LineChart, BarChart4, Users, Clock, LayoutDashboard, FileSpreadsheet, ChevronUp, Send, ChevronLeft, File, Star } from 'lucide-react';
import Button from '@/components/ui-components/Button';
import GlassCard from '@/components/ui-components/GlassCard';
import PageTransition from '@/components/ui-components/PageTransition';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isMonthly, setIsMonthly] = useState(true);
  const [currentTemplate, setCurrentTemplate] = useState(0);
  const templateScrollRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  // Animation refs
  const animationRefs = useRef<Array<HTMLElement | null>>([]);
  const addToAnimationRefs = (el: HTMLElement | null) => {
    if (el && !animationRefs.current.includes(el)) {
      animationRefs.current.push(el);
    }
  };
  
  // Auto-advance tabs every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Back to top button visibility control
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    // Animation observer setup
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    // Observe all animated elements
    animationRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, []);

  // Function to render step process
  const renderProcessStep = (step: number, title: string, description: string, icon: React.ReactNode, isActive: boolean) => (
    <div className={`relative flex flex-col items-center ${isActive ? 'scale-105' : ''} transition-all duration-500`}>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white mb-4 transition-colors duration-500 ${isActive ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-blue-400/70'}`}>
        {icon}
      </div>
      <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${isActive ? 'text-blue-600' : 'text-gray-700'}`}>{title}</h3>
      <p className={`text-sm text-center max-w-xs transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-70'}`}>{description}</p>
      {step < 3 && (
        <div className="hidden md:block absolute top-8 left-full w-12 h-0.5 bg-blue-200">
          <div className={`absolute top-0 left-0 h-full bg-blue-600 transition-all duration-700 ${isActive ? 'w-full' : 'w-0'}`}></div>
        </div>
      )}
    </div>
  );

  // Annual discount calculation
  const getYearlyPrice = (monthlyPrice: number) => {
    const annualDiscount = 0.2; // 20% discount for annual billing
    const annualPrice = monthlyPrice * 12 * (1 - annualDiscount);
    return annualPrice.toFixed(0);
  };

  // Function to scroll templates left or right
  const scrollTemplates = (direction: 'left' | 'right') => {
    if (templateScrollRef.current) {
      const scrollContainer = templateScrollRef.current;
      
      // Handle boundaries within the function
      if (direction === 'left' && currentTemplate === 0) {
        return; // Don't scroll if already at first template
      }
      
      if (direction === 'right' && currentTemplate === 5) {
        return; // Don't scroll if already at last template
      }
      
      const scrollAmount = direction === 'left' ? -340 : 340;
      
      // Calculate the new scroll position
      const newScrollPosition = Math.max(0, scrollContainer.scrollLeft + scrollAmount);
      
      scrollContainer.scrollTo({ 
        left: newScrollPosition, 
        behavior: 'smooth' 
      });
      
      // Update current template index based on scroll position
      setTimeout(() => {
        if (scrollContainer) {
          const scrollPosition = scrollContainer.scrollLeft;
          const templateWidth = 340; // Approximate width of each template card including margins
          const newIndex = Math.max(0, Math.min(5, Math.round(scrollPosition / templateWidth)));
          setCurrentTemplate(newIndex);
        }
      }, 300);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-blue-600/10 via-blue-600/5 to-background">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-32 pb-16 md:py-32 overflow-hidden relative">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl z-0"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl z-0"></div>
          
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden z-0">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-blue-300 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-blue-300 rounded-full animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          </div>
          
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-12 mb-10 md:mb-0">
                <div ref={addToAnimationRefs} className="animate-on-scroll">
                  <div className="inline-block bg-blue-600/10 text-blue-700 rounded-full px-3 py-1 text-sm font-medium mb-6">
                    AI-Powered Job Search Automation
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                    Automate Your <span className="text-blue-600">Job Search</span> with AI
                    <span className="block mt-2">Smart, Fast, Effortless!</span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground mb-8">
                    CareerSyncAI scrapes jobs, auto-applies, tracks emails, and generates 
                    perfect responses – all in one platform!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/signup">
                      <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-300">
                        Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link to="/dashboard">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto border-blue-600/30 text-blue-600 hover:bg-blue-600/10">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Added trust badges */}
                  <div className="mt-6 flex items-center gap-2">
                    <div className="px-2 py-1 bg-green-100 rounded-md flex items-center">
                      <Shield className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-xs font-medium text-green-700">Secure & Private</span>
                    </div>
                    <div className="px-2 py-1 bg-gray-100 rounded-md flex items-center">
                      <Check className="h-3 w-3 text-gray-600 mr-1" />
                      <span className="text-xs font-medium text-gray-700">Free Trial</span>
                    </div>
                    <div className="px-2 py-1 bg-blue-100 rounded-md flex items-center">
                      <Zap className="h-3 w-3 text-blue-600 mr-1" />
                      <span className="text-xs font-medium text-blue-700">Fast Setup</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 flex items-center" ref={addToAnimationRefs}>
                  <div className="animate-on-scroll opacity-90 flex items-center gap-6">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                          <img
                            src={`https://randomuser.me/api/portraits/men/${i + 10}.jpg`}
                            alt="User avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-blue-600">300+</span> job seekers joined this week
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2" ref={addToAnimationRefs}>
                <div className="animate-on-scroll transform hover:scale-[1.02] transition-transform duration-500">
                  <div className="relative">
                    <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl z-0"></div>
                    <div className="absolute -bottom-8 -right-8 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl z-0"></div>
                    <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl shadow-blue-600/10">
                      <img 
                        src="https://res.cloudinary.com/chasiscoding/image/upload/v1693949924/dashboard-demo_xhfcge.png" 
                        alt="CareerSyncAI Dashboard Preview" 
                        className="w-full h-auto"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent pointer-events-none"></div>
                    </div>
                    
                    {/* Added cursor animation */}
                    <div className="absolute top-1/3 right-1/3 w-6 h-6 rounded-full border-2 border-blue-500 animate-ping opacity-30"></div>
                    
                    {/* Enhanced floating elements */}
                    <div className="absolute -right-6 top-1/4 bg-white rounded-lg shadow-xl p-3 animate-float">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-xs font-medium">Application Sent</div>
                      </div>
                    </div>
                    <div className="absolute -left-8 bottom-1/4 bg-white rounded-lg shadow-xl p-3 animate-float-delayed">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-xs font-medium">Interview Invitation</div>
                      </div>
                    </div>
                    <div className="absolute -right-4 bottom-1/2 bg-white rounded-lg shadow-xl p-3 animate-float-slower">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div className="text-xs font-medium">Resume Optimized</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-12 bg-white/80 backdrop-blur-sm border-y border-blue-100">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: "10x", label: "Faster Applications", icon: <Zap className="h-5 w-5 text-yellow-500" /> },
                { value: "85%", label: "Interview Success Rate", icon: <Users className="h-5 w-5 text-green-500" /> },
                { value: "300+", label: "Jobs Applied Daily", icon: <BarChart4 className="h-5 w-5 text-purple-500" /> },
                { value: "24/7", label: "AI-Powered Assistance", icon: <Brain className="h-5 w-5 text-blue-500" /> }
              ].map((stat, i) => (
                <div key={i} ref={addToAnimationRefs} className="animate-on-scroll">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                      {stat.icon}
                      <span className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</span>
                    </div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Resume Templates Section */}
        <section className="py-20 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white/20 pointer-events-none"></div>
          <div className="container mx-auto px-4 md:px-6 relative">
            <div className="relative">
              {/* Left navigation button */}
              <button 
                onClick={() => scrollTemplates('left')}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border border-gray-200 rounded-full p-3 shadow-lg transition-all ${currentTemplate > 0 ? 'hover:scale-110' : ''}`}
                aria-label="Previous template"
                style={{ 
                  opacity: currentTemplate === 0 ? 0.5 : 1, 
                  cursor: currentTemplate === 0 ? 'not-allowed' : 'pointer' 
                }}
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>

              {/* Right navigation button */}
              <button 
                onClick={() => scrollTemplates('right')}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border border-gray-200 rounded-full p-3 shadow-lg transition-all ${currentTemplate < 5 ? 'hover:scale-110' : ''}`}
                aria-label="Next template"
                style={{ 
                  opacity: currentTemplate === 5 ? 0.5 : 1, 
                  cursor: currentTemplate === 5 ? 'not-allowed' : 'pointer' 
                }}
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>

              {/* Templates container */}
              <div 
                ref={templateScrollRef}
                className="overflow-x-auto py-4 hide-scrollbar"
                style={{
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none'
                }}
              >
                <div className="flex gap-6 px-4 min-w-max">
                  {/* Template 1 */}
                  <div className="w-64 md:w-72 flex-shrink-0">
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-full group">
                      <div className="relative h-80 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 flex items-center justify-center overflow-hidden">
                        <div className="absolute top-3 right-3 bg-yellow-400 text-xs font-semibold text-yellow-900 px-2 py-1 rounded-full">
                          Popular
                        </div>
                        <div className="w-48 h-64 bg-white rounded-lg shadow-md p-4 flex flex-col gap-2 group-hover:scale-105 transition-transform">
                          <div className="h-6 bg-blue-500 rounded w-full"></div>
                          <div className="h-4 bg-gray-800 rounded w-3/4 mt-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mt-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-5/6 mt-1"></div>
                          <div className="h-4 bg-gray-800 rounded w-1/2 mt-4"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4 mt-1"></div>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold">Modern Professional</h3>
                          <div className="flex">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Clean and professional design with a touch of color.</p>
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                          <File className="h-4 w-4" /> Use This Template
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Template 2 */}
                  <div className="w-64 md:w-72 flex-shrink-0">
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-full group">
                      <div className="h-80 bg-gradient-to-r from-gray-50 to-gray-100 p-4 flex items-center justify-center overflow-hidden">
                        <div className="w-48 h-64 bg-white rounded-lg shadow-md p-4 flex flex-col gap-2 group-hover:scale-105 transition-transform">
                          <div className="flex gap-2 mb-2">
                            <div className="h-16 w-16 bg-gray-300 rounded-full"></div>
                            <div className="flex flex-col justify-center">
                              <div className="h-4 bg-gray-800 rounded w-24"></div>
                              <div className="h-3 bg-gray-400 rounded w-20 mt-1"></div>
                            </div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-full mt-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4 mt-1"></div>
                          <div className="h-4 bg-gray-800 rounded w-1/2 mt-3"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold">Executive Brief</h3>
                          <div className="flex">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-gray-300" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Elegant design with photo, perfect for executives.</p>
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                          <File className="h-4 w-4" /> Use This Template
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Template 3 */}
                  <div className="w-64 md:w-72 flex-shrink-0">
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-full group">
                      <div className="h-80 bg-gradient-to-r from-green-50 to-emerald-50 p-4 flex items-center justify-center overflow-hidden">
                        <div className="w-48 h-64 bg-white rounded-lg shadow-md p-4 flex flex-col group-hover:scale-105 transition-transform">
                          <div className="flex justify-between items-start">
                            <div className="h-10 w-32 bg-green-600 rounded"></div>
                            <div className="h-6 w-6 bg-green-400 rounded-full"></div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-full mt-4"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-5/6 mt-1"></div>
                          <div className="h-4 bg-green-600 rounded w-1/3 mt-3"></div>
                          <div className="flex gap-1 mt-2">
                            <div className="h-2 bg-green-200 rounded-full w-8"></div>
                            <div className="h-2 bg-green-200 rounded-full w-8"></div>
                            <div className="h-2 bg-green-200 rounded-full w-8"></div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-full mt-3"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold">Creative Impact</h3>
                          <div className="flex">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-gray-300" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Bold design with skill visualization features.</p>
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                          <File className="h-4 w-4" /> Use This Template
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Template 4 */}
                  <div className="w-64 md:w-72 flex-shrink-0">
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-full group">
                      <div className="relative h-80 bg-gradient-to-r from-purple-50 to-pink-50 p-4 flex items-center justify-center overflow-hidden">
                        <div className="absolute top-3 right-3 bg-blue-400 text-xs font-semibold text-blue-900 px-2 py-1 rounded-full">
                          New
                        </div>
                        <div className="w-48 h-64 bg-white rounded-lg shadow-md p-4 flex flex-col group-hover:scale-105 transition-transform">
                          <div className="h-8 bg-purple-600 rounded-r-full w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mt-3"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-5/6 mt-1"></div>
                          <div className="h-4 bg-purple-600 rounded-r-full w-1/2 mt-3"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mt-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4 mt-1"></div>
                          <div className="h-4 bg-purple-600 rounded-r-full w-1/3 mt-3"></div>
                          <div className="h-3 bg-gray-200 rounded w-5/6 mt-2"></div>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold">Tech Innovator</h3>
                          <div className="flex">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Modern design optimized for tech industry jobs.</p>
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                          <File className="h-4 w-4" /> Use This Template
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Template 5 */}
                  <div className="w-64 md:w-72 flex-shrink-0">
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-full group">
                      <div className="relative h-80 bg-gradient-to-r from-orange-50 to-amber-50 p-4 flex items-center justify-center overflow-hidden">
                        <div className="absolute top-3 right-3 bg-orange-400 text-xs font-semibold text-orange-900 px-2 py-1 rounded-full z-10">
                          Featured
                        </div>
                        <div className="w-48 h-64 bg-white rounded-lg shadow-md p-4 flex flex-col group-hover:scale-105 transition-transform">
                          <div className="flex items-center justify-between mb-3">
                            <div className="h-6 w-32 bg-orange-500 rounded"></div>
                            <div className="h-6 w-6 bg-orange-300 rounded-full"></div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-5/6 mt-1"></div>
                          <div className="mt-3 flex gap-1">
                            <div className="flex-1">
                              <div className="h-4 bg-orange-500 rounded w-full"></div>
                              <div className="h-2 bg-orange-200 rounded-full w-full mt-1"></div>
                              <div className="h-2 bg-orange-100 rounded-full w-3/4 mt-1"></div>
                            </div>
                            <div className="flex-1">
                              <div className="h-4 bg-orange-500 rounded w-full"></div>
                              <div className="h-2 bg-orange-200 rounded-full w-full mt-1"></div>
                              <div className="h-2 bg-orange-100 rounded-full w-3/4 mt-1"></div>
                            </div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-full mt-3"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4 mt-1"></div>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold">Timeline Focus</h3>
                          <div className="flex">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Chronological format with a creative twist for your work history.</p>
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                          <File className="h-4 w-4" /> Use This Template
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Template 6 */}
                  <div className="w-64 md:w-72 flex-shrink-0">
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-full group">
                      <div className="h-80 bg-gradient-to-r from-cyan-50 to-sky-50 p-4 flex items-center justify-center overflow-hidden">
                        <div className="w-48 h-64 bg-white rounded-lg shadow-md p-4 flex flex-col group-hover:scale-105 transition-transform">
                          <div className="h-8 w-8 bg-sky-600 rounded-lg mb-2"></div>
                          <div className="flex gap-1">
                            <div className="h-4 w-1 bg-sky-600"></div>
                            <div>
                              <div className="h-3 bg-gray-800 rounded w-24"></div>
                              <div className="h-2 bg-gray-400 rounded w-20 mt-1"></div>
                            </div>
                          </div>
                          <div className="flex gap-1 mt-2">
                            <div className="h-4 w-1 bg-sky-400"></div>
                            <div>
                              <div className="h-3 bg-gray-800 rounded w-28"></div>
                              <div className="h-2 bg-gray-400 rounded w-20 mt-1"></div>
                            </div>
                          </div>
                          <div className="flex gap-1 mt-2">
                            <div className="h-4 w-1 bg-sky-300"></div>
                            <div>
                              <div className="h-3 bg-gray-800 rounded w-32"></div>
                              <div className="h-2 bg-gray-400 rounded w-20 mt-1"></div>
                            </div>
                          </div>
                          <div className="h-1 bg-gray-200 w-full my-2"></div>
                          <div className="grid grid-cols-2 gap-1 mt-1">
                            <div className="h-2 bg-sky-200 rounded-full"></div>
                            <div className="h-2 bg-sky-200 rounded-full"></div>
                            <div className="h-2 bg-sky-200 rounded-full"></div>
                            <div className="h-2 bg-sky-200 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold">Minimalist Pro</h3>
                          <div className="flex">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <Star className="h-4 w-4 text-gray-300" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Clean timeline-based design with focus on experience.</p>
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                          <File className="h-4 w-4" /> Use This Template
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pagination dots */}
              <div className="flex justify-center mt-6 gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <button
                    key={index}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      currentTemplate === index ? 'bg-blue-600 w-5' : 'bg-gray-300'
                    }`}
                    onClick={() => {
                      if (templateScrollRef.current) {
                        // Calculate exact position for each template
                        const templateWidth = 340;
                        const targetPosition = index * templateWidth;
                        
                        templateScrollRef.current.scrollTo({
                          left: targetPosition,
                          behavior: 'smooth'
                        });
                        setCurrentTemplate(index);
                      }
                    }}
                    aria-label={`Go to template ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-10 text-center">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-600/20">
                Browse All Templates 
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
        
        {/* Job Platforms Integration Section */}
        <section className="py-16 bg-blue-50/70 border-y border-blue-100">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Integrated Job Platforms</h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">Our platform connects seamlessly with these leading job portals, giving you access to millions of opportunities with just one click</p>
            </div>
            <div className="text-center mt-10">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-600/20">
                View All Platforms <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Trusted Companies Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-10 gap-y-12 items-center justify-items-center" ref={addToAnimationRefs}>
              <div className="animate-on-scroll opacity-80 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center h-24 w-full">
                <img src="https://internshala.com//static/images/internshala_og_image.jpg" alt="Internshala" className="h-18 max-w-full object-contain" />
              </div>
              <div className="animate-on-scroll opacity-80 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center h-24 w-full">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fc/Naukri.png" alt="Naukri.com" className="h-12 max-w-full object-contain" />
              </div>
              <div className="animate-on-scroll opacity-80 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center h-24 w-full">
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Glassdoor_logo.svg" alt="Glassdoor" className="h-16 max-w-full object-contain" />
              </div>
              <div className="animate-on-scroll opacity-80 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center h-24 w-full">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWMjR7gx6W5-B-hglc98RYENcZeIrSg0t6aA&s" alt="LinkedIn Jobs" className="h-16 max-w-full object-contain" />
              </div>
              <div className="animate-on-scroll opacity-80 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center h-24 w-full">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fc/Indeed_logo.svg" alt="Indeed" className="h-11 max-w-full object-contain" />
              </div>
              <div className="animate-on-scroll opacity-80 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center h-24 w-full">
                <img src="https://logovectorseek.com/wp-content/uploads/2019/11/angellist-logo-vector.png" alt="AngelList" className="h-24 max-w-full object-contain" />
              </div>
              <div className="animate-on-scroll opacity-80 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center h-24 w-full">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRujt5Ff7tNBnSVwro0tPqt_-9a_E6jBiMP8Q&s" alt="Monster" className="h-24 max-w-full object-contain" />
              </div>
              <div className="animate-on-scroll opacity-80 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center h-24 w-full">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIeZvk4b0k6e1vqYNs9tpHUGexqB4dUa-UNw&s" alt="Wellfound" className="h-13 max-w-full object-contain" />
              </div>
              <div className="animate-on-scroll opacity-80 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center h-24 w-full">
                <img src="https://remoteok.com/cdn-cgi/image/height=90,quality=85/https://remoteok.com/assets/logo.png" alt="Remote OK" className="h-12 max-w-full object-contain" />
              </div>
              <div className="animate-on-scroll opacity-80 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center h-24 w-full">
                <img src="https://logowik.com/content/uploads/images/dice9231.jpg" alt="Dice" className="h-18 max-w-full object-contain" />
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-20 md:py-24 pb-10 md:pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  role: "UX Designer at Google",
                  image: "https://randomuser.me/api/portraits/women/44.jpg",
                  quote: "Applied to 50+ jobs in a single weekend and received 5 interview requests. Landed my dream job at Google in just 3 weeks!"
                },
                {
                  name: "Michael Chen",
                  role: "Software Engineer at Microsoft",
                  image: "https://randomuser.me/api/portraits/men/32.jpg",
                  quote: "The AI-generated cover letters were incredibly personalized. Employers consistently mentioned how impressed they were with my application."
                },
                {
                  name: "Aisha Patel",
                  role: "Data Scientist at Amazon",
                  image: "https://randomuser.me/api/portraits/women/65.jpg",
                  quote: "The Gmail tracking feature was a game-changer. I never missed an interview invitation and was always prepared with the perfect response."
                }
              ].map((testimonial, i) => (
                <div key={i} ref={addToAnimationRefs} className="animate-on-scroll">
                  <div className="bg-white rounded-xl p-6 shadow-lg h-full border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-blue-600">
                        <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-medium">{testimonial.name}</h3>
                        <p className="text-sm text-blue-600">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground">"{testimonial.quote}"</p>
                    <div className="mt-4 flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Sparkles key={star} className="h-4 w-4 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Pricing Plans Section */}
        <section className="pt-10 md:pt-16 pb-20 md:pb-32 bg-gradient-to-b from-white to-blue-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Free",
                  price: "$0",
                  description: "Perfect for getting started with your job search",
                  features: [
                    "Basic job matching",
                    "Up to 10 applications per month",
                    "Standard resume templates",
                    "Email notifications",
                    "Community support"
                  ],
                  popular: false,
                  cta: "Get Started",
                  color: "bg-white"
                },
                {
                  name: "Professional",
                  price: isMonthly ? "$29" : `$${getYearlyPrice(29)}`,
                  period: isMonthly ? "/month" : "/year",
                  description: "Everything you need for a successful job search",
                  features: [
                    "Advanced AI job matching",
                    "Unlimited applications",
                    "AI-powered cover letters",
                    "Resume optimization",
                    "Gmail tracking integration",
                    "Interview preparation tools",
                    "Priority support"
                  ],
                  popular: true,
                  cta: "Start 7-Day Free Trial",
                  color: "bg-gradient-to-b from-blue-600 to-blue-700 text-white"
                },
                {
                  name: "Enterprise",
                  price: isMonthly ? "$99" : `$${getYearlyPrice(99)}`,
                  period: isMonthly ? "/month" : "/year",
                  description: "For teams and agencies with advanced needs",
                  features: [
                    "Everything in Professional plan",
                    "Team management dashboard",
                    "Bulk application processing",
                    "API access",
                    "Custom integrations",
                    "Dedicated account manager",
                    "24/7 premium support"
                  ],
                  popular: false,
                  cta: "Contact Sales",
                  color: "bg-white"
                }
              ].map((plan, i) => (
                <div key={i} ref={addToAnimationRefs} className={`animate-on-scroll relative rounded-2xl ${plan.color} shadow-xl overflow-hidden flex flex-col`}>
                  {plan.popular && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 transform rotate-0 origin-top-right">
                        MOST POPULAR
                      </div>
                    </div>
                  )}
                  <div className="p-8 flex-grow flex flex-col">
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                      <div className="mb-4">
                        <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                        {plan.period && <span className={`text-sm ${plan.popular ? 'text-blue-100' : 'text-gray-500'}`}>{plan.period}</span>}
                      </div>
                      <p className={`text-sm mb-6 ${plan.popular ? 'text-blue-100' : 'text-gray-500'}`}>{plan.description}</p>
                    </div>
                    
                    <div className="mb-8 flex-grow">
                      <ul className="space-y-3">
                        {plan.features.map((feature, j) => (
                          <li key={j} className="flex items-start">
                            <div className={`mr-2 mt-1 p-0.5 rounded-full ${plan.popular ? 'bg-blue-500/30' : 'bg-blue-100'}`}>
                              <Check className={`h-3.5 w-3.5 ${plan.popular ? 'text-white' : 'text-blue-600'}`} />
                            </div>
                            <span className={`text-sm ${plan.popular ? 'text-white' : 'text-gray-700'}`}>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-auto">
                      <button 
                        className={`w-full py-3 rounded-lg font-medium transition-colors ${
                          plan.popular 
                            ? 'bg-white text-blue-600 hover:bg-blue-50' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {plan.cta}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="py-12 bg-blue-950/95 text-blue-200">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
              <div className="md:col-span-2">
                <div className="mb-4">
                  <span className="text-xl font-bold text-white">Career<span className="text-blue-400">Sync</span>AI</span>
                </div>
                <p className="text-blue-300 mb-6">
                  Transforming the job application process with intelligent automation.
                </p>
                
                {/* Newsletter signup */}
                <div className="bg-blue-900/30 rounded-lg p-5 mb-6">
                  <h3 className="text-white text-base font-medium mb-3">Subscribe to our newsletter</h3>
                  <p className="text-sm text-blue-300 mb-4">Get the latest job search tips and AI updates directly to your inbox.</p>
                  <div className="flex">
                    <input 
                      type="email" 
                      placeholder="Your email address" 
                      className="bg-blue-900/50 text-white placeholder:text-blue-400 px-4 py-2 rounded-l-lg flex-grow focus:outline-none focus:ring-1 focus:ring-blue-400 border border-blue-800"
                    />
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-r-lg transition-colors relative overflow-hidden group">
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-shine hidden group-hover:block"></span>
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  {/* Social icons */}
                  <a href="#" className="text-blue-300 hover:text-white transition-colors">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                    </svg>
                  </a>
                  <a href="#" className="text-blue-300 hover:text-white transition-colors">
                    <span className="sr-only">GitHub</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                    </svg>
                  </a>
                  <a href="#" className="text-blue-300 hover:text-white transition-colors">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" clipRule="evenodd"></path>
                    </svg>
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="text-base font-medium mb-4 text-white">Quick Links</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-blue-300 hover:text-white transition-colors">Home</a></li>
                  <li><a href="#" className="text-blue-300 hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="text-blue-300 hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="text-blue-300 hover:text-white transition-colors">About Us</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-base font-medium mb-4 text-white">Resources</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-blue-300 hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="text-blue-300 hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="text-blue-300 hover:text-white transition-colors">Support</a></li>
                  <li><a href="#" className="text-blue-300 hover:text-white transition-colors">Careers</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-base font-medium mb-4 text-white">Legal</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-blue-300 hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="text-blue-300 hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="text-blue-300 hover:text-white transition-colors">Cookie Policy</a></li>
                  <li><a href="#" className="text-blue-300 hover:text-white transition-colors">GDPR Compliance</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-blue-800/50 mt-12 pt-8 text-center">
              <p className="text-sm text-blue-400">
                © {new Date().getFullYear()} CareerSyncAI. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
        
        {/* Back to top button */}
        {showBackToTop && (
          <button 
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 animate-pulse-glow hover:scale-110"
            aria-label="Back to top"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        )}
        
        {/* Chatbot button - improved with custom SVG and peaceful glow effect */}
        <button 
          className="fixed bottom-28 right-6 z-50 bg-white text-blue-500 p-4 rounded-full shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-blue-100 hover:border-blue-200"
          style={{
            boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
          }}
          aria-label="AI Chatbot Assistant"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-6 w-6 text-blue-500"
            style={{
              filter: "drop-shadow(0 0 2px rgba(59, 130, 246, 0.4))",
              animation: "gentle-pulse 3s infinite ease-in-out"
            }}
          >
            <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"></path>
            <circle cx="9" cy="10" r="1"></circle>
            <circle cx="15" cy="10" r="1"></circle>
          </svg>
          <span className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white" 
            style={{
              animation: "gentle-pulse-opacity 2s infinite ease-in-out",
              boxShadow: "0 0 8px rgba(34, 197, 94, 0.6)"
            }}
          ></span>
          
          {/* Remove the jsx prop from style tag to fix the TypeScript error */}
          <style>{`
            @keyframes gentle-pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
            
            @keyframes gentle-pulse-opacity {
              0% { opacity: 0.8; }
              50% { opacity: 1; }
              100% { opacity: 0.8; }
            }
          `}</style>
        </button>
      </div>
    </PageTransition>
  );
};

export default LandingPage;
