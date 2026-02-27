
import React, { useState } from 'react';
import { reviewDocumentAsSupervisor } from '../../services/geminiService';
import { SupervisorResult } from '../../types';
import { FileUpload } from '../common/FileUpload';
import { ExtractedData } from '../../utils/fileProcessor';

export const AISupervisor: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SupervisorResult | null>(null);

  const handleReview = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const jsonStr = await reviewDocumentAsSupervisor(text);
      setResult(JSON.parse(jsonStr));
    } catch (err) {
      console.error(err);
      alert("Failed to review document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDataExtracted = (data: ExtractedData) => {
    setText(data.text);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900">AI-Supervisor</h2>
          <p className="text-slate-500 font-medium">Get academic feedback before final submission.</p>
        </div>
        <FileUpload onDataExtracted={handleDataExtracted} label="Upload Draft" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Draft Content</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your academic work here for review..."
              className="w-full h-[500px] p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium resize-none"
            />
            <button
              onClick={handleReview}
              disabled={loading || !text.trim()}
              className="w-full mt-6 py-4 bg-[#064E3B] text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl hover:bg-[#053F30] transition-all disabled:opacity-50"
            >
              {loading ? 'Analyzing Draft...' : 'Start Supervisor Review'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {!result && !loading ? (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center text-slate-400">
              <div className="text-6xl mb-4">🎓</div>
              <h3 className="font-bold text-slate-600">No Review Active</h3>
              <p className="text-xs max-w-xs mx-auto">Upload or paste your work to receive detailed academic feedback from the AI-Supervisor.</p>
            </div>
          ) : loading ? (
            <div className="h-full flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-100 shadow-sm p-12 text-center">
              <div className="w-16 h-16 border-t-4 border-emerald-500 rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Reviewing Your Work</h3>
              <p className="text-sm text-slate-500">Checking for gaps, inconsistencies, and logical flow...</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              {/* Overall Feedback */}
              <div className="bg-emerald-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">Supervisor's Note</h4>
                  <p className="text-lg font-medium leading-relaxed italic">"{result.overallFeedback}"</p>
                </div>
                <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
              </div>

              {/* Detected Issues */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                  Detected Issues
                </h4>
                <ul className="space-y-3">
                  {result.detectedIssues.map((issue, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600 font-medium">
                      <span className="text-rose-400">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggested Improvements */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Suggested Improvements
                </h4>
                <ul className="space-y-3">
                  {result.suggestedImprovements.map((imp, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600 font-medium">
                      <span className="text-emerald-400">✓</span>
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Structural Recommendations */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  Structural Recommendations
                </h4>
                <ul className="space-y-3">
                  {result.structuralRecommendations.map((rec, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600 font-medium">
                      <span className="text-indigo-400">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
