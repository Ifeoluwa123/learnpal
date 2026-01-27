
import React, { useState } from 'react';
import { checkPlagiarism } from '../../services/geminiService';
import { PlagiarismResult } from '../../types';
import { FileUpload } from '../common/FileUpload';
import { ExtractedData } from '../../utils/fileProcessor';

export const PlagiarismChecker: React.FC = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDataExtracted = (data: ExtractedData) => {
    setText(data.text);
  };

  const handleCheck = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const jsonStr = await checkPlagiarism(text);
      setResult(JSON.parse(jsonStr));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto py-12 px-6 space-y-12">
      {/* Header section */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
          Plagiarism <span className="text-indigo-600">Checker</span>
        </h1>
        <p className="text-slate-500 font-medium">Scan your documents for originality and academic integrity.</p>
      </div>

      {/* Input Section - Styled like the reference image */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left: Upload Pane */}
        <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center bg-white/50 hover:bg-slate-50 transition-all group">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <FileUpload 
            onDataExtracted={handleDataExtracted} 
            label="Upload PDF, Image, or Text" 
            className="w-full max-w-xs"
          />
          <div className="mt-4 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Supports PDF, Word, TXT, Images</p>
            <p className="text-[9px] font-bold text-slate-300">PDF, JPG, PNG, DOCX, TXT</p>
          </div>
        </div>

        {/* Right: Paste Pane */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col min-h-[320px]">
          <div className="flex items-center gap-2 mb-6 text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-xs font-black uppercase tracking-[0.2em]">Paste or Write Notes</span>
          </div>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your notes here..."
            className="w-full flex-1 bg-transparent outline-none text-slate-600 text-sm resize-none placeholder:text-slate-300"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleCheck}
          disabled={loading || text.length < 20}
          className="px-12 py-5 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-sm rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-30 disabled:translate-y-0"
        >
          {loading ? 'Analyzing Originality...' : 'Run Integrity Scan'}
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Similarity Index Card */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col items-center justify-center text-center">
               <div className={`text-7xl font-black mb-2 ${result.similarityScore > 25 ? 'text-rose-500' : 'text-emerald-500'}`}>
                 {result.similarityScore}%
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Similarity Index</p>
            </div>

            {/* Analysis Summary Card */}
            <div className="md:col-span-2 bg-indigo-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-300 mb-4">AI Scan Result</h3>
                 <p className="text-lg font-medium leading-relaxed">{result.analysis}</p>
               </div>
               <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-indigo-400 rounded-full blur-3xl opacity-10"></div>
            </div>
          </div>

          {result.flaggedPassages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-2">Flagged Sources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.flaggedPassages.map((p, i) => (
                  <div key={i} className="p-6 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
                    <p className="text-slate-600 italic text-sm mb-4 leading-relaxed">"{p.text}"</p>
                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Potential Source</span>
                      <span className="text-[10px] font-bold text-slate-400">{p.sourceHint}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
