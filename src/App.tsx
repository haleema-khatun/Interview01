import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/Layout/Header';
import { HomePage } from './components/Home/HomePage';
import { AuthForm } from './components/Auth/AuthForm';
import { AuthCallback } from './pages/AuthCallback';
import { Dashboard } from './components/Dashboard/Dashboard';
import { StudyPlan } from './components/StudyPlan/StudyPlan';
import { StudyPlanDetail } from './components/StudyPlan/StudyPlanDetail';
import { CreateQuestion } from './components/AITools/CreateQuestion';
import { InterviewGPT } from './components/AITools/InterviewGPT';
import { AskAway } from './components/AITools/AskAway';
import { CoverLetterGenerator } from './components/JobTools/CoverLetterGenerator';
import { ResumeReview } from './components/JobTools/ResumeReview';
import { ResumeChat } from './components/JobTools/ResumeChat';
import { PracticeSession } from './components/Practice/PracticeSession';
import { EvaluationResults } from './components/Evaluation/EvaluationResults';
import { HistoryPage } from './components/History/HistoryPage';
import { Settings } from './components/Settings/Settings';
import { Profile } from './components/Profile/Profile';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4 transition-colors duration-200">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  // Don't show loading screen for too long - show home page by default
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Always show content after a short delay, regardless of auth state
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Show loading only for a brief moment
  if (loading && !showContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">InterviewAce</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading your interview platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {user && <Header />}
      <Routes>
        {/* Home page is always accessible */}
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/auth" 
          element={user ? <Navigate to="/dashboard" replace /> : <AuthForm />} 
        />
        <Route 
          path="/auth/callback" 
          element={<AuthCallback />} 
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study-plan"
          element={
            <ProtectedRoute>
              <StudyPlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study-plan/:planId"
          element={
            <ProtectedRoute>
              <StudyPlanDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-tools/create-question"
          element={
            <ProtectedRoute>
              <CreateQuestion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-tools/interview-gpt"
          element={
            <ProtectedRoute>
              <InterviewGPT />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-tools/ask-away"
          element={
            <ProtectedRoute>
              <AskAway />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-tools/cover-letter"
          element={
            <ProtectedRoute>
              <CoverLetterGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-tools/resume-review"
          element={
            <ProtectedRoute>
              <ResumeReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-tools/resume-chat"
          element={
            <ProtectedRoute>
              <ResumeChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/:questionId"
          element={
            <ProtectedRoute>
              <PracticeSession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluation/:responseId"
          element={
            <ProtectedRoute>
              <EvaluationResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
              },
              className: 'dark:bg-gray-800 dark:text-white',
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;