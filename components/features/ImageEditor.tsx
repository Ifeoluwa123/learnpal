
import React, { useState, useRef } from 'react';
import { editImageWithGemini } from '../../services/geminiService';

export const ImageEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!image || !prompt) return;
    setLoading(true);
    const editedImage = await editImageWithGemini(image, prompt, mimeType);
    if (editedImage) {
      setResult(editedImage);
    } else {
      alert("Failed to edit image. Try a different prompt.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-12 flex flex-col md:flex-row gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-extrabold text-slate-900">AI Image Editor</h2>
            <p className="text-slate-600">Transform your images using natural language instructions powered by Gemini 2.5 Flash Image.</p>
            
            <div className="space-y-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-indigo-200 rounded-2xl flex flex-col items-center justify-center hover:bg-indigo-50 hover:border-indigo-400 transition-all text-indigo-600 font-medium"
              >
                <span className="text-4xl mb-2">📸</span>
                {image ? "Change Image" : "Upload Image to Edit"}
              </button>
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                accept="image/*"
              />

              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., 'Add a retro filter', 'Make it a sketch'"
                  className="w-full py-4 px-6 pr-24 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                />
                <button
                  onClick={handleEdit}
                  disabled={loading || !image || !prompt}
                  className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {loading ? '...' : 'Edit'}
                </button>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl text-xs text-amber-700 flex items-start gap-3">
              <span className="text-base">💡</span>
              <p>Try prompts like "Convert this into a futuristic cyberpunk style", "Apply a grayscale filter", or "Make the lighting more dramatic".</p>
            </div>
          </div>

          <div className="flex-1">
            <div className="aspect-square w-full relative bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
              {result ? (
                <img src={result} className="w-full h-full object-contain animate-in fade-in zoom-in duration-700" alt="Result" />
              ) : image ? (
                <img src={image} className="w-full h-full object-contain opacity-50" alt="Preview" />
              ) : (
                <div className="text-slate-400 text-center px-8">
                  <div className="text-6xl mb-4 opacity-20">🖼️</div>
                  <p>Upload a photo to see the AI magic happen</p>
                </div>
              )}
              
              {loading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-indigo-900 font-bold animate-pulse text-sm">Processing with Nano Banana...</p>
                  </div>
                </div>
              )}
            </div>
            
            {result && (
              <div className="mt-4 flex gap-4">
                <a 
                  href={result} 
                  download="edited-image.png"
                  className="flex-1 py-3 bg-slate-800 text-white text-center font-bold rounded-xl hover:bg-slate-900 transition-all"
                >
                  Download Result
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
