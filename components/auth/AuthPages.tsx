
import React, { useState } from 'react';
import { AuthMode, User } from '../../types';

interface AuthPagesProps {
  onLogin: (user: User) => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [targetEmail, setTargetEmail] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const users: User[] = JSON.parse(localStorage.getItem('learnpal_users') || '[]');

    if (mode === 'register') {
      if (!name || !email || !password) {
        setError('Please fill in all fields');
        return;
      }
      if (users.find(u => u.email === email)) {
        setError('Email already exists');
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        password,
        joinedAt: Date.now()
      };

      localStorage.setItem('learnpal_users', JSON.stringify([...users, newUser]));
      onLogin(newUser);
    } 
    else if (mode === 'login') {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid email or password');
      }
    }
    else if (mode === 'forgot-password') {
      const user = users.find(u => u.email === email);
      if (user) {
        setTargetEmail(email);
        setMode('email-sent');
      } else {
        setError('No account found with this email.');
      }
    }
    else if (mode === 'reset-password') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      const updatedUsers = users.map(u => {
        if (u.email === targetEmail) {
          return { ...u, password };
        }
        return u;
      });

      localStorage.setItem('learnpal_users', JSON.stringify(updatedUsers));
      setSuccess('Password updated successfully!');
      setTimeout(() => {
        setMode('login');
        setSuccess('');
        setPassword('');
        setConfirmPassword('');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 overflow-hidden">
        
        {/* Visual Side */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-[#064E3B] text-white relative">
          <div className="relative z-10">
             <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg mb-8">
               <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
             </div>
             <h1 className="text-4xl font-black mb-4 leading-tight">Master Your Study <br/><span className="text-emerald-400">with LearnPal.</span></h1>
             <p className="text-emerald-100/80 font-medium">The most powerful AI toolkit for modern students. Plagiarism checks, quiz generation, and smarter paraphrasing in one stunning place.</p>
          </div>
          
          <div className="relative z-10 space-y-4">
             <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#064E3B] bg-slate-300"></div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-[#064E3B] bg-emerald-500 flex items-center justify-center text-[10px] font-bold">+2k</div>
             </div>
             <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Joined by 2,000+ students this week</p>
          </div>

          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-600 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 bg-indigo-600 rounded-full blur-3xl opacity-20"></div>
        </div>

        {/* Form Side */}
        <div className="p-8 lg:p-16 flex flex-col justify-center bg-white min-h-[600px]">
          {mode === 'email-sent' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 text-left">Check Your Inbox</h2>
                <p className="text-slate-500 font-medium">We've sent a recovery link to <span className="text-emerald-600 font-bold">{targetEmail}</span>. Access your virtual mailbox below.</p>
              </div>

              {/* Virtual Inbox Simulation */}
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 mb-8 shadow-inner">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200/60">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">L</div>
                  <div>
                    <p className="text-xs font-black text-slate-800">LearnPal Security</p>
                    <p className="text-[10px] text-slate-400 font-medium">Subject: Reset your password</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mb-6 leading-relaxed">Hi there, we received a request to reset your password. If this was you, please click the button below:</p>
                <button 
                  onClick={() => setMode('reset-password')}
                  className="w-full py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all hover:-translate-y-1"
                >
                  Click here to Reset Password
                </button>
              </div>

              <button 
                onClick={() => setMode('login')}
                className="text-sm text-slate-400 font-bold hover:text-emerald-600 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Login
              </button>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                  {mode === 'login' && 'Welcome Back!'}
                  {mode === 'register' && 'Get Started'}
                  {mode === 'forgot-password' && 'Reset Password'}
                  {mode === 'reset-password' && 'New Password'}
                </h2>
                <p className="text-slate-500 font-medium">
                  {mode === 'login' && 'Please enter your details to sign in.'}
                  {mode === 'register' && 'Create your account to start mastering your study.'}
                  {mode === 'forgot-password' && 'Enter your email to receive a recovery link.'}
                  {mode === 'reset-password' && 'Choose a strong password you can remember.'}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-5">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-700 font-medium"
                      placeholder="John Doe"
                    />
                  </div>
                )}
                
                {(mode === 'login' || mode === 'register' || mode === 'forgot-password') && (
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-700 font-medium"
                      placeholder="you@university.edu"
                    />
                  </div>
                )}

                {(mode === 'login' || mode === 'register' || mode === 'reset-password') && (
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                      {mode === 'reset-password' ? 'New Password' : 'Password'}
                    </label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-700 font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                )}

                {mode === 'reset-password' && (
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-700 font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                )}

                {error && <p className="text-rose-500 text-xs font-bold bg-rose-50 p-3 rounded-lg border border-rose-100">{error}</p>}
                {success && <p className="text-emerald-600 text-xs font-bold bg-emerald-50 p-3 rounded-lg border border-emerald-100">{success}</p>}

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button 
                      type="button"
                      onClick={() => setMode('forgot-password')}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full py-5 bg-[#064E3B] text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-emerald-100 hover:bg-[#053F30] transition-all hover:-translate-y-1"
                >
                  {mode === 'login' && 'Sign In'}
                  {mode === 'register' && 'Create Account'}
                  {mode === 'forgot-password' && 'Send Recovery Email'}
                  {mode === 'reset-password' && 'Update Password'}
                </button>
              </form>

              <div className="mt-10 text-center">
                <p className="text-sm text-slate-500 font-medium">
                  {mode === 'login' && "Don't have an account?"}
                  {(mode === 'register' || mode === 'forgot-password' || mode === 'reset-password') && "Remembered your password?"}
                  
                  <button 
                    onClick={() => { 
                      setMode(mode === 'login' ? 'register' : 'login');
                      setError('');
                      setSuccess('');
                    }}
                    className="ml-2 text-[#064E3B] font-black hover:underline"
                  >
                    {mode === 'login' ? 'Sign Up' : 'Log In'}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
