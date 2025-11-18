import React, { useState } from 'react';
import { ScriptResponse } from '../types';

interface ScriptViewProps {
  script: ScriptResponse;
}

export const ScriptView: React.FC<ScriptViewProps> = ({ script }) => {
  const [mode, setMode] = useState<'preview' | 'json'>('preview');

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(script, null, 2));
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden relative flex flex-col shadow-lg">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
      
      {/* Header / Tabs */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900/50 mt-1">
        <div className="flex gap-2">
          <button 
            onClick={() => setMode('preview')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors border ${
              mode === 'preview' 
                ? 'bg-purple-600 border-purple-500 text-white' 
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            Script Preview
          </button>
          <button 
            onClick={() => setMode('json')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors border ${
              mode === 'json' 
                ? 'bg-purple-600 border-purple-500 text-white' 
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            JSON Code
          </button>
        </div>
        
        {mode === 'json' && (
          <button 
            onClick={handleCopy} 
            className="text-xs font-mono text-gray-400 hover:text-white flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 012 2v-8a2 2 0 01-2-2h-8a2 2 0 01-2 2v8a2 2 0 012 2z" />
            </svg>
            Copy JSON
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto max-h-[600px]">
        {mode === 'preview' ? (
          <div className="animate-fade-in">
            <div className="space-y-4 mb-6">
              {script.dialogue.map((line, idx) => (
                <div key={idx} className={`flex gap-4 ${line.speaker === 'Bigfoot' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
                    line.speaker === 'Bigfoot' ? 'bg-amber-900 text-amber-200' : 'bg-blue-900 text-blue-200'
                  }`}>
                    {line.speaker[0]}
                  </div>
                  <div className={`flex-1 p-4 rounded-xl shadow-md ${
                    line.speaker === 'Bigfoot' 
                      ? 'bg-amber-950/40 border border-amber-900/30 text-amber-100 text-right rounded-tr-none' 
                      : 'bg-blue-950/40 border border-blue-900/30 text-blue-100 rounded-tl-none'
                  }`}>
                    <p className="text-xs opacity-50 mb-1 uppercase tracking-wider font-bold">{line.speaker}</p>
                    <p className="text-base md:text-lg leading-relaxed font-light">"{line.text}"</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-6 border-t border-gray-700">
              <p className="text-xs font-mono text-purple-400 mb-2 uppercase tracking-widest">Visual Prompt</p>
              <div className="bg-black/40 p-4 rounded-lg border border-gray-800 text-gray-300 italic text-sm leading-relaxed">
                {script.visualPrompt}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <pre className="font-mono text-xs sm:text-sm text-green-400 whitespace-pre-wrap break-all bg-black/50 p-4 rounded-lg border border-gray-800">
              {JSON.stringify(script, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};