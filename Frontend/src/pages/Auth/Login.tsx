import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

import { toast } from 'sonner';
import PageTransition from '@/components/ui-components/PageTransition';
import GlassCard from '@/components/ui-components/GlassCard';
import Button from '@/components/ui-components/Button';
import Input from '@/components/ui-components/Input';
import GoogleButton from '@/components/ui-components/GoogleButton';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    setIsLoading(true);
    try {
      // Create a user object with email
      const userData = {
        id: '1', // In a real app, this would come from the backend
        name: email.split('@')[0], // Basic name from email
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}` // Generate avatar from email
      };
      
      await login(userData);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to log in. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      console.log('Google login response:', response);
      
      // Parse the JWT token from credential
      const token = response.credential;
      console.log('Got credential token:', token);
      
      // Decode the JWT token properly
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedToken = JSON.parse(window.atob(base64));
      
      console.log('Decoded Google token:', decodedToken);
      
      const userData = {
        id: decodedToken.sub,
        name: decodedToken.name,
        email: decodedToken.email,
        avatar: decodedToken.picture // Always include the picture URL
      };
      
      console.log('User data extracted from Google:', userData);
      
      // Log in with the user data
      await login(userData);
      toast.success(`Welcome, ${userData.name}!`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Failed to log in with Google. Please try again.');
    }
  };

  const handleGoogleFailure = () => {
    toast.error('Google login failed. Please try again.');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-blue-light/20 to-background">
        <Navbar />
        <div className="container mx-auto px-4 md:px-6 pt-32 pb-20">
          <div className="max-w-md mx-auto">
            <GlassCard>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
                <p className="text-muted-foreground">Sign in to your CareerSync AI account</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-sm text-blue hover:underline">Forgot password?</Link>
                </div>
                <Button type="submit" className="w-full" isLoading={isLoading}>Sign In</Button>
              </form>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <div className="flex justify-center">
                <GoogleButton />
                {/* Hidden Google login button - will be triggered by our custom button */}
                <div className="hidden">
                  <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} />
                </div>
              </div>
              <p className="text-center mt-6 text-sm text-muted-foreground">
                Don't have an account? <Link to="/signup" className="text-blue hover:underline">Sign up</Link>
              </p>
            </GlassCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;