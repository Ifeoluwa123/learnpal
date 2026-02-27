
import React, { useState, useEffect } from 'react';
import { AppView, QuizResult } from '../../types';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    quizzes: 0,
    avgAccuracy: 0,
    docsProcessed: 0,
  });

  useEffect(() => {
    const results: QuizResult[] = JSON.parse(localStorage.getItem('learnpal_quiz_results') || '[]');
    if (results.length > 0) {
      const avg = results.reduce((acc, curr) => acc + curr.accuracy, 0) / results.length;
      setStats({
        quizzes: results.length,
        avgAccuracy: Math.round(avg),
        docsProcessed: results.length + 2, // Mocking other doc types
      });
    }
  }, []);

  const tools = [
    { id: 'question-gen', title: 'Quiz Maker', desc: 'Notes to Knowledge', icon: '📝', color: 'bg-emerald-500', shadow: 'shadow-emerald-100' },
     { id: 'ai-supervisor', title: 'AI Supervisor', desc: 'Academic Review', icon: '🎓', color: 'bg-emerald-900', shadow: 'shadow-emerald-900' },
    { id: 'plagiarism', title: 'Plagiarism', desc: 'Scan for Originality', icon: '🔍', color: 'bg-indigo-500', shadow: 'shadow-indigo-100' },
    { id: 'ai-detector', title: 'AI Detector', desc: 'Verify Human Writing', icon: '🤖', color: 'bg-indigo-600', shadow: 'shadow-indigo-100' },
    { id: 'paraphraser', title: 'Paraphraser', desc: 'Rewrite Smartly', icon: '✍️', color: 'bg-orange-500', shadow: 'shadow-orange-100' },
    // { id: 'image-editor', title: 'AI Photo', desc: 'Visual Assistance', icon: '🎨', color: 'bg-rose-500', shadow: 'shadow-rose-100' },
  ];

  return (
    <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Academic Hub</h2>
          <p className="text-slate-500 font-medium">Ready to boost your performance today?</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Live Updates: On</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Quizzes', value: stats.quizzes, unit: 'attempts', color: 'text-indigo-600' },
          { label: 'Avg Accuracy', value: stats.avgAccuracy, unit: '%', color: 'text-emerald-600' },
          { label: 'Docs Checked', value: stats.docsProcessed, unit: 'files', color: 'text-orange-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-black ${stat.color}`}>{stat.value}</span>
              <span className="text-xs font-bold text-slate-400 uppercase">{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Quick Launch Tools */}
        <div className="xl:col-span-2 space-y-6">
          <h3 className="text-lg font-black text-slate-800">Available Tools</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onNavigate(tool.id as AppView)}
                className="group relative bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 ${tool.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg ${tool.shadow}`}>
                    {tool.icon}
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth={2.5}/></svg>
                  </div>
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-1">{tool.title}</h4>
                <p className="text-sm text-slate-500 font-medium">{tool.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Motivation Side */}
        <div className="xl:col-span-1 space-y-8">
           <div className="bg-[#064E3B] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-2xl font-black mb-4">Study Streak</h4>
                <p className="text-emerald-100/80 text-sm font-medium mb-8 leading-relaxed">Consistency is key to mastery. You've been active for 3 days straight!</p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-400/30 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🔥</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black">Day 3</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Keep it up!</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-emerald-400 rounded-full blur-3xl opacity-20"></div>
           </div>

           <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
             <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Recent Activity</h4>
             {/* <div className="space-y-4">
                {[
                  { label: 'Physics Quiz', date: '2h ago', result: '90%' },
                  { label: 'Essay Scan', date: '5h ago', result: 'Original' },
                  { label: 'Math Practice', date: 'Yesterday', result: '75%' },
                ].map((act, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{act.label}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{act.date}</p>
                    </div>
                    <span className="text-xs font-black text-emerald-500">{act.result}</span>
                  </div>
                ))}
             </div> */}
           </div>
        </div>
      </div>
    </div>
  );
};
