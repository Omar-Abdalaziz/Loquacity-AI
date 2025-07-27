import React, { useState, useCallback, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { Stage, FinalAnswer, SearchHistoryItem } from '../types';
import * as geminiService from '../services/geminiService';
import { SearchBar } from './SearchBar';
import { StageIndicator } from './StageIndicator';
import { SparklesIcon } from './icons';

interface SearchPageProps {
  session: Session;
}

export const SearchPage: React.FC<SearchPageProps> = ({ session }) => {
  const [userQuery, setUserQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<Stage>(Stage.Idle);
  const [finalAnswer, setFinalAnswer] = useState<FinalAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  
  const fetchHistory = useCallback(async () => {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching history:', error.message);
    } else {
      setHistory(data as SearchHistoryItem[]);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const resetState = () => {
    setUserQuery('');
    setCurrentStage(Stage.Idle);
    setFinalAnswer(null);
    setError(null);
  };

  const handleSearch = useCallback(async (query: string) => {
    if (isLoading) return;
    
    resetState();
    setIsLoading(true);
    setUserQuery(query);

    try {
      setCurrentStage(Stage.IntentDetection);
      await new Promise(res => setTimeout(res, 200));
      setCurrentStage(Stage.QueryReformulation);
      await new Promise(res => setTimeout(res, 300));
      setCurrentStage(Stage.LiveSearch);
      
      const answerResult = await geminiService.performSmartSearch(query);
      
      if (answerResult.sources.length === 0 && answerResult.text.includes("Sorry")) {
          setError(answerResult.text);
          setFinalAnswer(null);
      } else {
         setFinalAnswer(answerResult);
         // Save to history on success
         const { error: insertError } = await supabase.from('search_history').insert({
            user_id: session.user.id,
            query,
            answer: answerResult.text,
            sources: answerResult.sources,
         });

         if (insertError) {
            console.error('Error saving history:', insertError.message);
         }
         
         fetchHistory(); // Refresh history list
      }
      
      setCurrentStage(Stage.RAG);
      await new Promise(res => setTimeout(res, 200));
      setCurrentStage(Stage.AnswerGeneration);
      await new Promise(res => setTimeout(res, 300));
      setCurrentStage(Stage.PostProcessing);
      await new Promise(res => setTimeout(res, 150));
      
      setCurrentStage(Stage.Done);

    } catch (e) {
        console.error(e);
        setError("An unexpected error occurred. Please check the console and try again.");
        setCurrentStage(Stage.Idle);
    } finally {
        setIsLoading(false);
    }
  }, [isLoading, session.user.id, fetchHistory]);

  const handleHistoryClick = (item: SearchHistoryItem) => {
    resetState();
    setUserQuery(item.query);
    setFinalAnswer({ text: item.answer, sources: item.sources });
    setCurrentStage(Stage.Done);
  };

  return (
    <div className="flex h-screen">
      {/* History Sidebar */}
      <aside className="w-1/4 max-w-xs h-full bg-slate-900/70 backdrop-blur-sm border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
            <h2 className="text-xl font-bold">Search History</h2>
            <p className="text-xs text-slate-400">Signed in as {session.user.email}</p>
        </div>
        <div className="flex-grow overflow-y-auto">
          {history.length > 0 ? (
            <ul>
              {history.map(item => (
                <li key={item.id}>
                  <button 
                    onClick={() => handleHistoryClick(item)}
                    className="w-full text-left p-4 text-sm text-slate-300 hover:bg-sky-900/30 transition-colors border-b border-slate-800"
                  >
                    <p className="truncate font-medium">{item.query}</p>
                    <p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-sm text-slate-500">No history yet.</p>
          )}
        </div>
        <div className="p-4 border-t border-slate-800">
            <button
                onClick={() => supabase.auth.signOut()}
                className="w-full py-2 px-4 bg-red-800/50 hover:bg-red-700/70 rounded-md text-white font-semibold transition-colors"
            >
                Sign Out
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col p-4 md:p-8 font-sans overflow-y-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 tracking-tight">
            Loquacity <span className="text-sky-400">AI</span>
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
            Your AI-powered search companion. Enter a query to get a synthesized answer from the web.
          </p>
        </header>
        
        <main className="flex-grow w-full max-w-4xl mx-auto">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          
          {currentStage !== Stage.Idle && (
            <StageIndicator currentStage={currentStage} isDone={currentStage === Stage.Done} />
          )}

          <div className="mt-8">
            {userQuery && !finalAnswer && !error && !isLoading && (
                 <div className="text-center text-slate-500 animate-fade-in">
                    <p>Enter a query above to start your search.</p>
                 </div>
            )}
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg animate-fade-in">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}

            {finalAnswer && currentStage === Stage.Done && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-lg overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-slate-700 flex items-center space-x-3 bg-slate-800">
                    <div className="text-sky-400"><SparklesIcon className="w-6 h-6" /></div>
                    <h3 className="text-lg font-semibold text-slate-200">{userQuery}</h3>
                </div>
                <div className="p-4 md:p-6">
                  <div 
                    className="prose prose-invert prose-p:text-slate-300 prose-strong:text-slate-100 prose-a:text-sky-400 prose-a:no-underline hover:prose-a:underline text-base leading-relaxed mb-8"
                    dangerouslySetInnerHTML={{ __html: finalAnswer.text.replace(/\n/g, '<br />') }}
                  />

                  {finalAnswer.sources.length > 0 && (
                    <div>
                      <h4 className="text-xl font-semibold text-slate-100 mb-4 border-b border-slate-700 pb-2">Sources</h4>
                      <ul className="space-y-3">
                        {finalAnswer.sources.map((source, index) => (
                           <li 
                              key={source.uri}
                              className="p-3 bg-slate-900/50 border border-slate-700 rounded-md transition-all duration-300"
                            >
                              <a href={source.uri} target="_blank" rel="noopener noreferrer" className="group">
                                  <p className="font-bold text-sky-400 group-hover:underline">
                                      <span className="mr-2 px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full text-xs">{index + 1}</span>
                                      {source.title}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1 truncate">{source.uri}</p>
                              </a>
                           </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};