
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { Dashboard } from './components/features/Dashboard';
import { PlagiarismChecker } from './components/features/PlagiarismChecker';
import { AIDetector } from './components/features/AIDetector';
import { QuestionGenerator } from './components/features/QuestionGenerator';
import { Paraphraser } from './components/features/Paraphraser';
import { ImageEditor } from './components/features/ImageEditor';
import { AuthPages } from './components/auth/AuthPages';
import { AppView, User } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('learnpal_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsReady(true);
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('learnpal_current_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('learnpal_current_user');
    setCurrentView('home');
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (!isReady) return null;

  if (!user) {
    return <AuthPages onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'plagiarism':
        return <PlagiarismChecker />;
      case 'ai-detector':
        return <AIDetector />;
      case 'question-gen':
        return <QuestionGenerator />;
      case 'paraphraser':
        return <Paraphraser />;
      case 'image-editor':
        return <ImageEditor />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar with responsive trigger state */}
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        user={user} 
        onLogout={handleLogout} 
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* Main Content Area: Use ml-64 only on large screens */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full transition-all duration-300">
        <Header 
          currentView={currentView} 
          onNavigate={setCurrentView} 
          user={user}
          onLogout={handleLogout}
          onToggleSidebar={toggleSidebar}
        />
        
        <main className="flex-1 overflow-x-hidden w-full max-w-[1600px] mx-auto">
          {renderView()}
        </main>

        <footer className="py-8 border-t border-slate-200 mt-12 bg-white px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-xs font-medium">
              © 2024 LearnPal AI Hub. Academic Integrity Secured.
            </p>
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="hover:text-emerald-600 cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-emerald-600 cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-emerald-600 cursor-pointer transition-colors">Support</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
