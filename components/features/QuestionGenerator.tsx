
import React, { useState, useEffect } from 'react';
import { generateQuestions } from '../../services/geminiService';
import { GeneratedQuestion, QuizResult, DifficultyLevel, QuestionFormat, QuizHistoryItem } from '../../types';
import { FileUpload } from '../common/FileUpload';
import { ExtractedData } from '../../utils/fileProcessor';

export const QuestionGenerator: React.FC = () => {
  const [text, setText] = useState('');
  const [activeImage, setActiveImage] = useState<{ data: string, mimeType: string } | null>(null);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [format, setFormat] = useState<QuestionFormat>('mixed');
  const [results, setResults] = useState<QuizResult[]>([]);
  const [fullHistory, setFullHistory] = useState<QuizHistoryItem[]>([]);
  
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  
  const [reviewItem, setReviewItem] = useState<QuizHistoryItem | null>(null);

  useEffect(() => {
    const savedResults = localStorage.getItem('learnpal_quiz_results');
    const savedHistory = localStorage.getItem('learnpal_quiz_full_history');
    if (savedResults) setResults(JSON.parse(savedResults));
    if (savedHistory) setFullHistory(JSON.parse(savedHistory));
  }, []);

  const saveToHistory = (score: number) => {
    const accuracy = Math.round((score / questions.length) * 100);
    const newHistoryItem: QuizHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      questions,
      userAnswers,
      score,
      difficulty,
      format,
      accuracy
    };

    const newResult: QuizResult = {
      id: newHistoryItem.id,
      timestamp: newHistoryItem.timestamp,
      score,
      totalQuestions: questions.length,
      difficulty,
      accuracy
    };

    const updatedResults = [newResult, ...results];
    const updatedHistory = [newHistoryItem, ...fullHistory];
    
    setResults(updatedResults);
    setFullHistory(updatedHistory);
    
    localStorage.setItem('learnpal_quiz_results', JSON.stringify(updatedResults));
    localStorage.setItem('learnpal_quiz_full_history', JSON.stringify(updatedHistory));
  };

  const handleDataExtracted = (data: ExtractedData) => {
    if (data.isImage && data.base64 && data.mimeType) {
      setActiveImage({ data: data.base64, mimeType: data.mimeType });
      setText("[Document extracted from Image Content]");
    } else {
      setText(data.text);
      setActiveImage(null);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim() && !activeImage) return;
    setLoading(true);
    setReviewItem(null);
    try {
      const jsonStr = await generateQuestions(text, count, difficulty, format, activeImage || undefined);
      const parsed = JSON.parse(jsonStr);
      setQuestions(parsed);
      setIsTakingQuiz(true);
      setQuizFinished(false);
      setCurrentQuestionIdx(0);
      setUserAnswers({});
    } catch (err) {
      console.error(err);
      alert("Error generating questions. Ensure your text is clear and substantial.");
    } finally {
      setLoading(false);
    }
  };

  const finishQuiz = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      const userAns = (userAnswers[idx] || '').toLowerCase().trim();
      const correctAns = q.answer.toLowerCase().trim();
      if (userAns === correctAns || (q.options === undefined && correctAns.includes(userAns) && userAns.length > 2)) {
        score++;
      }
    });
    saveToHistory(score);
    setQuizFinished(true);
  };

  const accuracyTrend = results.slice(0, 10).reverse();
  const streak = results.length > 0 ? results.filter(r => r.accuracy >= 70).length : 0;

  const renderReviewContent = (item: QuizHistoryItem) => (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-1">Attempt Results</h3>
          <p className="text-2xl font-black text-slate-800">{item.score} / {item.questions.length} Correct ({item.accuracy}%)</p>
        </div>
        <button 
          onClick={() => setReviewItem(null)} 
          className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-300 transition-colors"
        >
          Close Review
        </button>
      </div>
      
      <div className="space-y-4">
        {item.questions.map((q, idx) => {
          const uAns = (item.userAnswers[idx] || '').toLowerCase().trim();
          const cAns = q.answer.toLowerCase().trim();
          // Fixed: Changed undefined 'userAns' to the correctly scoped 'uAns'
          const isCorrect = uAns === cAns || (q.options === undefined && cAns.includes(uAns) && uAns.length > 2);
          
          return (
            <div key={idx} className={`p-6 rounded-2xl border-l-8 ${isCorrect ? 'bg-emerald-50/40 border-emerald-500' : 'bg-rose-50/40 border-rose-500 shadow-sm'}`}>
              <div className="flex justify-between items-start gap-4 mb-4">
                <p className="font-bold text-slate-800 text-lg">{q.question}</p>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div className={`p-4 rounded-xl ${isCorrect ? 'bg-emerald-100/50' : 'bg-rose-100/50'}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Your Answer</p>
                  <p className="font-bold text-slate-800">{item.userAnswers[idx] || '(No Answer)'}</p>
                </div>
                {!isCorrect && (
                  <div className="p-4 rounded-xl bg-emerald-100/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Correct Answer</p>
                    <p className="font-bold text-slate-800">{q.answer}</p>
                  </div>
                )}
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Detailed Explanation</p>
                <p className="text-slate-600 text-sm leading-relaxed">{q.explanation}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto py-12 px-6">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
        
        {/* Main Content Area */}
        <div className="xl:col-span-3 space-y-12">
          
          {/* Hero Header */}
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-2">
              Master Your <span className="text-emerald-500">Study.</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-xl">
              Upload your documents and get a custom AI quiz in seconds. Build your streak by mastering the content!
            </p>
          </div>

          {reviewItem ? (
            /* Historical Review View */
            <div className="animate-in fade-in duration-500">
              {renderReviewContent(reviewItem)}
            </div>
          ) : !isTakingQuiz ? (
            /* Setup View */
            <>
              {/* Step 1: Study Material */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm border border-emerald-100">1</div>
                  <h2 className="text-xl font-bold text-slate-800">Study Material</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors group relative">
                    {activeImage ? (
                      <div className="w-full h-full">
                        <img src={`data:${activeImage.mimeType};base64,${activeImage.data}`} className="max-h-40 mx-auto rounded-lg mb-4 object-contain shadow-sm" />
                        <button onClick={() => { setActiveImage(null); setText(''); }} className="absolute top-2 right-2 p-1 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform">
                           <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      </div>
                    )}
                    <FileUpload onDataExtracted={handleDataExtracted} label={activeImage ? "Change Image" : "Upload PDF, Image, or Text"} className="w-full" />
                    <p className="mt-2 text-xs text-slate-400">PDF, JPG, PNG, DOCX, TXT</p>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col h-full min-h-[200px]">
                    <div className="flex items-center gap-2 mb-4 text-slate-500">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                       <span className="text-sm font-semibold uppercase tracking-wider">Paste or Write Notes</span>
                    </div>
                    <textarea 
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Type or paste your notes here..."
                      className="w-full flex-1 bg-transparent outline-none text-slate-600 text-sm resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Quiz Settings */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">2</div>
                    <h2 className="text-xl font-bold text-slate-800">Quiz Settings</h2>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-6">
                    <label className="text-sm font-bold text-slate-700">Number of Questions</label>
                    <div className="flex items-center gap-2">
                       <span className="text-emerald-500 text-xl font-black">{count}</span>
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">questions</span>
                    </div>
                  </div>
                  <input 
                    type="range" min="1" max="100" value={count}
                    onChange={(e) => setCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500 mb-2"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase">
                    <span>Auto</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-6">Complexity Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => (
                        <button
                          key={level}
                          onClick={() => setDifficulty(level)}
                          className={`py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                            difficulty === level 
                              ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-600 shadow-sm'
                              : 'bg-white border-2 border-slate-50 text-slate-400 hover:border-slate-200'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-6">Question Format</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['options', 'open', 'mixed'] as QuestionFormat[]).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setFormat(fmt)}
                          className={`py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                            format === fmt 
                              ? 'bg-indigo-50 border-2 border-indigo-500 text-indigo-600 shadow-sm'
                              : 'bg-white border-2 border-slate-50 text-slate-400 hover:border-slate-200'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading || (!text.trim() && !activeImage)}
                  className="w-full py-5 bg-emerald-600 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
                >
                  {loading ? 'Processing Document & Syncing Knowledge...' : 'Generate My Quiz'}
                </button>
              </div>
            </>
          ) : (
            /* Active Quiz Interface */
            <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-xl animate-in zoom-in-95 duration-500">
              {!quizFinished ? (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest">Question {currentQuestionIdx + 1} of {questions.length}</span>
                    <button onClick={() => setIsTakingQuiz(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">Exit Quiz</button>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-800 leading-snug">
                    {questions[currentQuestionIdx].question}
                  </h3>

                  {questions[currentQuestionIdx].options && questions[currentQuestionIdx].options!.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {questions[currentQuestionIdx].options!.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => setUserAnswers({...userAnswers, [currentQuestionIdx]: opt})}
                          className={`p-6 rounded-2xl border-2 text-left transition-all ${
                            userAnswers[currentQuestionIdx] === opt 
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md' 
                              : 'border-slate-50 bg-slate-50 hover:border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="font-bold mr-4">{String.fromCharCode(65 + i)}.</span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Open Answer</label>
                       <textarea
                        placeholder="Type your answer here based on the document..."
                        className="w-full h-32 p-6 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                        value={userAnswers[currentQuestionIdx] || ''}
                        onChange={(e) => setUserAnswers({...userAnswers, [currentQuestionIdx]: e.target.value})}
                      />
                    </div>
                  )}

                  <div className="flex justify-between pt-8 border-t border-slate-50">
                    <button
                      disabled={currentQuestionIdx === 0}
                      onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                      className="px-8 py-3 text-slate-400 font-bold hover:text-slate-600 disabled:opacity-30"
                    >
                      Previous
                    </button>
                    {currentQuestionIdx === questions.length - 1 ? (
                      <button
                        onClick={finishQuiz}
                        className="px-10 py-4 bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-600"
                      >
                        Finish Quiz
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                        className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700"
                      >
                        Next Question
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Immediate Results View */
                <div className="animate-in fade-in duration-500">
                   {fullHistory.length > 0 && renderReviewContent(fullHistory[0])}
                   <div className="mt-8 text-center">
                    <button
                      onClick={() => { setIsTakingQuiz(false); setQuizFinished(false); }}
                      className="px-12 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all"
                    >
                      Done - Return to Dashboard
                    </button>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* My Progress Sidebar */}
        <div className="xl:col-span-1 space-y-8">
          <div className="bg-[#064E3B] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-emerald-200 sticky top-24 max-h-[calc(100vh-150px)] overflow-y-auto">
            <div className="flex items-center gap-3 mb-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-100">My Progress</h2>
            </div>

            <div className="bg-[#053F30] rounded-3xl p-8 mb-8 text-center border border-emerald-800/50">
               <div className="text-orange-400 mb-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C7.58 2 4 5.58 4 10c0 4.42 3.58 8 8 8s8-3.58 8-8c0-4.42-3.58-8-8-8zm1 14h-2v-2h2v2zm0-4h-2V6h2v6z"/></svg>
               </div>
               <div className="text-6xl font-black mb-1">{streak}</div>
               <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Quiz Streak</div>
            </div>

            <div className="bg-[#053F30] rounded-3xl p-6 mb-8 border border-emerald-800/50">
               <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Level: Novice Learner</span>
               </div>
               <div className="w-full h-1.5 bg-emerald-900 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${Math.min(results.length * 10, 100)}%` }}></div>
               </div>
               <p className="text-[10px] text-emerald-400 font-bold">{Math.max(0, 10 - results.length)} more for next level</p>
            </div>

            {fullHistory.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 border-t border-emerald-800/50 pt-8 mb-4">Past Attempt History</h3>
                <div className="space-y-3">
                  {fullHistory.slice(0, 5).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setReviewItem(item); setIsTakingQuiz(false); setQuizFinished(false); }}
                      className="w-full bg-[#053F30] p-4 rounded-xl text-left border border-emerald-800/30 hover:bg-emerald-800/40 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-black text-emerald-100">{new Date(item.timestamp).toLocaleDateString()}</span>
                        <span className="text-[10px] font-black text-emerald-400 group-hover:underline">Review Details</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold">{item.questions.length} Qs • {item.difficulty}</span>
                        <span className={`text-sm font-black ${item.accuracy >= 70 ? 'text-emerald-400' : 'text-rose-400'}`}>{item.accuracy}%</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="mt-12 pt-8 border-t border-emerald-800/50">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-6">Accuracy Trend</h3>
                 <div className="flex items-end gap-1.5 h-16">
                    {accuracyTrend.map((r, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-emerald-500/20 rounded-sm group relative" 
                        style={{ height: `${r.accuracy}%` }}
                      >
                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-white text-emerald-900 text-[10px] px-2 py-1 rounded-md font-black shadow-xl whitespace-nowrap">
                            {r.accuracy}%
                         </div>
                         <div className="w-full h-full bg-emerald-400 rounded-sm opacity-40 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
