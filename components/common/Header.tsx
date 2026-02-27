
import React from 'react';
import { AppView, User } from '../../types';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  user: User | null;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, user, onToggleSidebar }) => {
  if (!user) return null;

  const viewLabels: Record<string, string> = {
    home: 'Academic Hub',
    plagiarism: 'Plagiarism Checker',
    'ai-detector': 'AI Content Detector',
    'question-gen': 'AI Quiz Maker',
    paraphraser: 'Smart Paraphraser',
    'image-editor': 'AI Image Studio',
    'ai-supervisor': 'AI Academic Supervisor'
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Toggle */}
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
          <span className="hidden sm:inline">LearnPal</span>
          <span className="hidden sm:inline">/</span>
          <span className="text-slate-900 font-black uppercase tracking-widest text-[10px] sm:text-xs">{viewLabels[currentView]}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Search Bar */}
        <div className="hidden md:flex relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search tools or docs..." 
            className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-48 xl:w-64 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors relative">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User Info */}
        <div className="hidden lg:block text-right">
          <p className="text-xs font-black text-slate-900">Hi, {user.name.split(' ')[0]}!</p>
          <p className="text-[10px] text-emerald-500 font-bold uppercase">Academic Session Active</p>
        </div>
      </div>
    </header>
  );
};
