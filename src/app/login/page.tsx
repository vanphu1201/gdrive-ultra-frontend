'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/dashboard');
      }
    });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md glass p-8 rounded-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/40 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            GDrive Ultra
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Access secure downloads effortlessly.
          </p>
        </div>

        <Auth
          supabaseClient={supabase}
          redirectTo={typeof window !== 'undefined' ? window.location.origin : ''}
          providers={['google']}
          onlyThirdPartyProviders={true}
          theme="dark"
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'oklch(0.6 0.25 290)',
                  brandAccent: 'oklch(0.5 0.25 290)',
                  brandButtonText: 'white',
                  defaultButtonBackground: 'oklch(0.15 0.06 290)',
                  defaultButtonBackgroundHover: 'oklch(0.2 0.08 290)',
                  inputBackground: 'rgba(255, 255, 255, 0.05)',
                  inputText: 'white',
                  inputPlaceholder: 'rgba(255, 255, 255, 0.5)',
                  inputBorder: 'rgba(255, 255, 255, 0.1)',
                  inputBorderHover: 'rgba(255, 255, 255, 0.3)',
                  inputBorderFocus: 'oklch(0.6 0.25 290)',
                },
                space: {
                  buttonPadding: '10px 15px',
                  inputPadding: '12px 15px',
                },
                radii: {
                  borderRadiusButton: '8px',
                  buttonBorderRadius: '8px',
                  inputBorderRadius: '8px',
                },
              },
            },
            className: {
              container: 'auth-container',
              button: 'auth-button glass-button transition-all duration-300 hover:scale-[1.02]',
              input: 'auth-input backdrop-blur-sm transition-all duration-300',
            }
          }}
        />
      </div>
    </div>
  );
}
