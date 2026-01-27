
import React, { useState } from 'react';
import { paraphraseText } from '../../services/geminiService';
import { FileUpload } from '../common/FileUpload';
import { ExtractedData } from '../../utils/fileProcessor';

export const Paraphraser: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [tone, setTone] = useState('academic');
  const [loading, setLoading] = useState(false);

  const handleDataExtracted = (data: ExtractedData) => {
    setInput(data.text);
  };

  const handleParaphrase = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await paraphraseText(input, tone);
      setOutput(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tones = [
    { id: 'academic', label: 'Academic', icon: '🎓' },
    { id: 'professional', label: 'Professional', icon: '💼' },
    { id: 'casual', label: 'Casual', icon: '👋' },
    { id: 'creative', label: 'Creative', icon: '✨' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800">Original Text</h2>
            <div className="flex items-center gap-3">
              <FileUpload onDataExtracted={handleDataExtracted} label="Import" />
              <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>
              <div className="flex gap-1">
                {tones.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    title={t.label}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${
                      tone === t.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                    }`}
                  >
                    {t.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <textarea
            className="w-full h-96 p-6 border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all"
            placeholder="Enter text or upload a document to rewrite..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={handleParaphrase}
            disabled={loading || input.length < 5}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Re-writing...' : 'Paraphrase Now'}
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Paraphrased Result</h2>
          <div className="relative group">
            <div className={`w-full h-96 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-y-auto whitespace-pre-wrap ${!output ? 'flex items-center justify-center text-slate-400 italic' : 'text-slate-700'}`}>
              {output || "Your improved text will appear here..."}
            </div>
            {output && (
              <button 
                onClick={() => navigator.clipboard.writeText(output)}
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
