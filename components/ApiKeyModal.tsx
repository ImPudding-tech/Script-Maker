import React, { useEffect, useState } from 'react';

export const ApiKeyModal: React.FC<{ onReady: () => void }> = ({ onReady }) => {
  const [hasKey, setHasKey] = useState(false);

  const checkKey = async () => {
    if (window.aistudio?.hasSelectedApiKey) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
      if (selected) {
        onReady();
      }
    }
  };

  useEffect(() => {
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success after dialog interaction, or re-check
      setTimeout(checkKey, 1000);
    }
  };

  if (hasKey) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
        <div className="mb-6 text-yellow-400">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 9.636 11.364 11.364 10 12.636l-1.172 1.414 1.414 1.414-1.414 1.414-1.414-1.414-1.414 1.414-1.414-1.414L6 12.636l-3-3a6 6 0 0112 0zm-4.758 6.322l.343.343m1.335 6.364L17 21" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4 brand-font">Authentication Required</h2>
        <p className="text-gray-400 mb-6">
          To use the advanced Google Veo video generation models, you must select a valid project API Key.
        </p>
        <button
          onClick={handleSelectKey}
          className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors duration-200"
        >
          Select API Key
        </button>
        <p className="mt-4 text-xs text-gray-500">
          Read more about billing at <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-gray-300">ai.google.dev/gemini-api/docs/billing</a>
        </p>
      </div>
    </div>
  );
};