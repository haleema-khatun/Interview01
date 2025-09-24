import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Brain, Github, Mail, Lock, User as UserIcon, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const { signIn, signUp, signInWithGoogle, signInWithGithub } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password, formData.fullName);
        toast.success('Account created successfully!');
      } else {
        await signIn(formData.email, formData.password);
        toast.success('Welcome back!');
      }
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithGithub();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with ' + provider);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailClick = () => {
    setShowEmailForm(true);
  };

  const handleBack = () => {
    setShowEmailForm(false);
    setFormData({ email: '', password: '', fullName: '' });
  };

  return (
    <div className="min-h-screen bg-[#003135] dark:bg-[#003135] flex items-center justify-center px-4 py-12 transition-colors duration-200">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-[#0FA4AF]/20 backdrop-blur-lg rounded-2xl shadow-2xl transition-all duration-200 hover:scale-105 border border-[#0FA4AF]/30">
              <Brain className="h-10 w-10 text-[#AFDDE5]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#AFDDE5] mb-2 transition-colors duration-200">InterviewAce</h1>
          <p className="text-[#AFDDE5]/80 text-lg transition-colors duration-200">
            Master your interview skills with AI-powered feedback
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-[#024950]/20 backdrop-blur-lg rounded-3xl shadow-2xl p-8 transition-all duration-200 border border-[#0FA4AF]/30">
          {!showEmailForm ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white text-center mb-2 transition-colors duration-200">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-slate-200 text-center transition-colors duration-200">
                  {isSignUp
                    ? 'Start your interview preparation journey'
                    : 'Continue your practice sessions'}
                </p>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleSocialSignIn('google')}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white py-3.5 px-4 rounded-xl font-medium border border-white/20 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialSignIn('github')}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white py-3.5 px-4 rounded-xl font-medium border border-white/20 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Github className="w-5 h-5" />
                  Continue with GitHub
                </button>
                <button
                  type="button"
                  onClick={handleEmailClick}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white py-3.5 px-4 rounded-xl font-medium border border-white/20 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mail className="w-5 h-5" />
                  Continue with Email
                </button>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-slate-200 hover:text-white font-medium transition-colors duration-200"
                >
                  {isSignUp
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-slate-200 hover:text-white mb-6 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>

              <form onSubmit={handleSubmit} className="space-y-6">
                {isSignUp && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-slate-300" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required={isSignUp}
                      className="w-full pl-10 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-300" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-300" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-300 hover:text-white transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-slate-800 py-3.5 px-4 rounded-xl font-medium hover:bg-slate-100 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? 'Please wait...'
                    : isSignUp
                    ? 'Create Account'
                    : 'Sign In'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Feature highlights */}
        <div className="mt-8 text-center text-sm text-slate-200 transition-colors duration-200">
          <p>✨ AI-powered feedback • 🎯 Practice with real questions • 📊 Track progress</p>
        </div>
      </div>
    </div>
  );
};