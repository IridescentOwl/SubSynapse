import React, { useState } from 'react';
import GlassmorphicCard from './GlassmorphicCard.tsx';
import { useAuth } from '../AuthContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'login' | 'register' | 'registerOTP' | 'forgotPassword' | 'forgotPasswordOTP' | 'resetPassword' | 'forgotPasswordSuccess';

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
  const [formState, setFormState] = useState({ name: '', email: '', password: '', otp: '', newPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register, sendSignupOTP, verifySignupOTP, forgotPassword, sendForgotPasswordOTP, verifyForgotPasswordOTPOnly, verifyForgotPasswordOTP } = useAuth();

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
            onClose();
        } else if (view === 'register') {
            // Send OTP for signup
            await sendSignupOTP(formState.name, formState.email, formState.password);
            setView('registerOTP');
        } else if (view === 'registerOTP') {
            // Verify OTP and complete signup
            await verifySignupOTP(formState.email, formState.otp);
            onClose();
        } else if (view === 'forgotPassword') {
            // Send OTP for forgot password
            await sendForgotPasswordOTP(formState.email);
            setView('forgotPasswordOTP');
        } else if (view === 'forgotPasswordOTP') {
            // Verify OTP before moving to reset password view
            await verifyForgotPasswordOTPOnly(formState.email, formState.otp);
            setView('resetPassword');
        } else if (view === 'resetPassword') {
            // Verify OTP and reset password
            await verifyForgotPasswordOTP(formState.email, formState.otp, formState.newPassword);
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
    setFormState({ name: '', email: '', password: '', otp: '', newPassword: '' });
  }

  const renderContent = () => {
      if (view === 'forgotPasswordSuccess') {
          return (
              <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-4">Password Reset Successful</h2>
                  <p className="text-slate-300 mb-6">Your password has been reset successfully. You can now login with your new password.</p>
                  <button onClick={() => handleViewChange('login')} className="font-semibold text-sky-300 hover:text-sky-200">
                      &larr; Back to Login
                  </button>
              </div>
          )
      }

      if (view === 'registerOTP') {
          return (
              <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-4">Verify Your Email</h2>
                  <p className="text-slate-300 mb-6">We've sent a 6-digit OTP to <span className="font-semibold">{formState.email}</span>. Please enter it below.</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <FormInput 
                          label="Enter OTP" 
                          name="otp" 
                          type="text" 
                          placeholder="123456" 
                          value={formState.otp} 
                          onChange={(e) => {
                              // Only allow numbers
                              const value = e.target.value.replace(/\D/g, '');
                              handleInputChange({ ...e, target: { ...e.target, value } } as any);
                          }}
                          required 
                          maxLength={6}
                          pattern="[0-9]{6}"
                      />
                      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                      <div className="pt-2">
                          <button 
                              type="submit"
                              className="w-full font-bold py-3 px-6 rounded-xl transition duration-300 bg-sky-500 hover:bg-sky-400 text-white disabled:bg-sky-500/50"
                              disabled={isLoading}
                          >
                              {isLoading ? 'Verifying...' : 'Verify & Create Account'}
                          </button>
                      </div>
                      <div className="text-center pt-2">
                          <button type="button" onClick={() => handleViewChange('register')} className="text-sm text-slate-400 hover:text-sky-300 transition">
                              &larr; Back
                          </button>
                      </div>
                  </form>
              </div>
          )
      }

      if (view === 'forgotPasswordOTP') {
          return (
              <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-4">Verify Your Email</h2>
                  <p className="text-slate-300 mb-6">We've sent a 6-digit OTP to <span className="font-semibold">{formState.email}</span>. Please enter it below.</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <FormInput 
                          label="Enter OTP" 
                          name="otp" 
                          type="text" 
                          placeholder="123456" 
                          value={formState.otp} 
                          onChange={(e) => {
                              // Only allow numbers
                              const value = e.target.value.replace(/\D/g, '');
                              handleInputChange({ ...e, target: { ...e.target, value } } as any);
                          }}
                          required 
                          maxLength={6}
                          pattern="[0-9]{6}"
                      />
                      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                      <div className="pt-2">
                          <button 
                              type="submit"
                              className="w-full font-bold py-3 px-6 rounded-xl transition duration-300 bg-sky-500 hover:bg-sky-400 text-white disabled:bg-sky-500/50"
                              disabled={isLoading}
                          >
                              {isLoading ? 'Verifying...' : 'Verify OTP'}
                          </button>
                      </div>
                      <div className="text-center pt-2">
                          <button type="button" onClick={() => handleViewChange('forgotPassword')} className="text-sm text-slate-400 hover:text-sky-300 transition">
                              &larr; Back
                          </button>
                      </div>
                  </form>
              </div>
          )
      }

      if (view === 'resetPassword') {
          return (
              <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-4">Reset Your Password</h2>
                  <p className="text-slate-300 mb-6">Enter your new password below.</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <FormInput 
                          label="New Password" 
                          name="newPassword" 
                          type="password" 
                          placeholder="••••••••••••" 
                          value={formState.newPassword} 
                          onChange={handleInputChange} 
                          required 
                      />
                      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                      <div className="pt-2">
                          <button 
                              type="submit"
                              className="w-full font-bold py-3 px-6 rounded-xl transition duration-300 bg-sky-500 hover:bg-sky-400 text-white disabled:bg-sky-500/50"
                              disabled={isLoading}
                          >
                              {isLoading ? 'Resetting...' : 'Reset Password'}
                          </button>
                      </div>
                      <div className="text-center pt-2">
                          <button type="button" onClick={() => handleViewChange('forgotPasswordOTP')} className="text-sm text-slate-400 hover:text-sky-300 transition">
                              &larr; Back
                          </button>
                      </div>
                  </form>
              </div>
          )
      }
      
      const isLoginView = view === 'login';
      const isRegisterView = view === 'register';
      const isForgotPasswordView = view === 'forgotPassword';

      return (
        <>
            <div className="flex justify-center mb-6 border-b border-white/10">
                <button onClick={() => handleViewChange('login')} className={`px-6 py-2 text-lg font-semibold transition-colors ${isLoginView ? 'text-sky-300 border-b-2 border-sky-300' : 'text-slate-400'}`}>Login</button>
                <button onClick={() => handleViewChange('register')} className={`px-6 py-2 text-lg font-semibold transition-colors ${isRegisterView ? 'text-sky-300 border-b-2 border-sky-300' : 'text-slate-400'}`}>Sign Up</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                {isRegisterView && (
                    <FormInput label="Full Name" name="name" type="text" placeholder="Alex Doe" value={formState.name} onChange={handleInputChange} required />
                )}
                
                {(isLoginView || isRegisterView || isForgotPasswordView) && (
                     <FormInput label="Email Address" name="email" type="email" placeholder="alex.doe@example.com" value={formState.email} onChange={handleInputChange} required />
                )}

                {(isLoginView || isRegisterView) && (
                    <FormInput label="Password" name="password" type="password" placeholder="••••••••••••" value={formState.password} onChange={handleInputChange} required />
                )}

                {error && <p className="text-sm text-red-400 text-center">{error}</p>}

                 {isLoginView && (
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
                            isLoginView ? 'Login' :
                            isRegisterView ? 'Send OTP' :
                            'Send OTP'
                        }
                    </button>
                </div>
                {!isForgotPasswordView && (
                    <p className="text-xs text-slate-400 text-center pt-2">
                        By continuing, you agree to our Terms of Service.
                    </p>
                )}
                {isForgotPasswordView && (
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