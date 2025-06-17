import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Brain } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session) {
          // Check if user has a profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create one
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
                role: 'user',
              });

            if (createError) {
              console.error('Error creating profile:', createError);
            }
          }
        }

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 transition-colors duration-200">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-600 dark:bg-blue-500 rounded-xl transition-colors duration-200">
            <Brain className="h-8 w-8 text-white animate-pulse" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Completing sign in...
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we set up your account
        </p>
      </div>
    </div>
  );
}; 