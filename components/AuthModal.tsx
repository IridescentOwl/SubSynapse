import React, { useState } from 'react';
import GlassmorphicCard from './GlassmorphicCard';
import { useAuth } from '../AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'login' | 'register' | 'forgotPassword' | 'forgotPasswordSuccess';

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <input 
            {...props}
            className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-gray-400 transition"
        />
    </div>
);

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<AuthView>('login');
  const [formState, setFormState] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register, forgotPassword } = useAuth();

  if (!isOpen) return null;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormState(prev => ({...prev, [name]: value}));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
        if (view === 'login') {
            await login(formState.email, formState.password);
        } else if (view === 'register') {
            await register(formState.name, formState.email, formState.password);
        } else if (view === 'forgotPassword') {
            await forgotPassword(formState.email);
            setView('forgotPasswordSuccess');
        }
    } catch (err: any) {
        setError(err.message || 'An error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleViewChange = (newView: AuthView) => {
    setView(newView);
    setError(null);
    setFormState({ name: '', email: '', password: '' });
  }

  const renderContent = () => {
      if (view === 'forgotPasswordSuccess') {
          return (
              <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
                  <p className="text-slate-300 mb-6">If an account with that email exists, we've sent instructions to reset your password.</p>
                  <button onClick={() => handleViewChange('login')} className="font-semibold text-sky-300 hover:text-sky-200">
                      &larr; Back to Login
                  </button>
              </div>
          )
      }
      
      return (
        <>
            <div className="flex justify-center mb-6 border-b border-white/10">
                <button onClick={() => handleViewChange('login')} className={`px-6 py-2 text-lg font-semibold transition-colors ${view === 'login' ? 'text-sky-300 border-b-2 border-sky-300' : 'text-slate-400'}`}>Login</button>
                <button onClick={() => handleViewChange('register')} className={`px-6 py-2 text-lg font-semibold transition-colors ${view === 'register' ? 'text-sky-300 border-b-2 border-sky-300' : 'text-slate-400'}`}>Sign Up</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                {view === 'register' && (
                    <FormInput label="Full Name" name="name" type="text" placeholder="Alex Doe" value={formState.name} onChange={handleInputChange} required />
                )}
                {view !== 'login' || (
                    <>
                        <FormInput label="Email Address" name="email" type="email" placeholder="alex.doe@example.com" value={formState.email} onChange={handleInputChange} required />
                        <FormInput label="Password" name="password" type="password" placeholder="••••••••••••" value={formState.password} onChange={handleInputChange} required />
                    </>
                )}
                {view === 'register' && (
                    <>
                        <FormInput label="Email Address" name="email" type="email" placeholder="alex.doe@example.com" value={formState.email} onChange={handleInputChange} required />
                        <FormInput label="Password" name="password" type="password" placeholder="••••••••••••" value={formState.password} onChange={handleInputChange} required />
                    </>
                )}
                 {view === 'forgotPassword' && (
                    <FormInput label="Email Address" name="email" type="email" placeholder="Enter your email to reset password" value={formState.email} onChange={handleInputChange} required />
                )}

                {error && <p className="text-sm text-red-400 text-center">{error}</p>}

                 {view === 'login' && (
                    <div className="text-right">
                        <button type="button" onClick={() => handleViewChange('forgotPassword')} className="text-sm text-slate-400 hover:text-sky-300 transition">Forgot Password?</button>
                    </div>
                )}

                <div className="pt-2">
                    <button 
                        type="submit"
                        className="w-full font-bold py-3 px-6 rounded-xl transition duration-300 bg-sky-500 hover:bg-sky-400 text-white disabled:bg-sky-500/50"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : 
                            view === 'login' ? 'Login' :
                            view === 'register' ? 'Create Account' :
                            'Send Reset Link'
                        }
                    </button>
                </div>
                {view !== 'forgotPassword' && (
                    <p className="text-xs text-slate-400 text-center pt-2">
                        By continuing, you agree to our Terms of Service.
                    </p>
                )}
                {view === 'forgotPassword' && (
                    <div className="text-center pt-2">
                         <button type="button" onClick={() => handleViewChange('login')} className="text-sm text-slate-400 hover:text-sky-300 transition">&larr; Back to Login</button>
                    </div>
                )}
            </form>
        </>
      )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <GlassmorphicCard 
        className="w-full max-w-md m-4 p-8 relative" 
        onClick={(e) => e.stopPropagation()}
        hasAnimation
        isReady={isOpen}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {renderContent()}
      </GlassmorphicCard>
    </div>
  );
};

export default AuthModal;