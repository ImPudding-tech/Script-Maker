import React from 'react';
import { ScriptResponse } from '../types';

interface ScriptViewProps {
  script: ScriptResponse;
}

export const ScriptView: React.FC<ScriptViewProps> = ({ script }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <span className="text-purple-400">Generated Script</span>
        <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 font-mono">JSON</span>
      </h3>
      <div className="space-y-4">
        {script.dialogue.map((line, idx) => (
          <div key={idx} className={`flex gap-4 ${line.speaker === 'Bigfoot' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-lg ${
              line.speaker === 'Bigfoot' ? 'bg-amber-900 text-amber-200' : 'bg-blue-900 text-blue-200'
            }`}>
              {line.speaker[0]}
            </div>
            <div className={`flex-1 p-3 rounded-lg ${
              line.speaker === 'Bigfoot' ? 'bg-amber-900/20 border border-amber-900/50 text-amber-100 text-right' : 'bg-blue-900/20 border border-blue-900/50 text-blue-100'
            }`}>
              <p className="text-xs opacity-50 mb-1 uppercase tracking-wider font-bold">{line.speaker}</p>
              <p className="text-sm md:text-base leading-relaxed">"{line.text}"</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-700">
        <p className="text-xs font-mono text-gray-500 mb-1">VEO PROMPT</p>
        <p className="text-sm text-gray-400 italic bg-black/30 p-3 rounded border border-gray-800">
          {script.visualPrompt}
        </p>
      </div>
    </div>
  );
};