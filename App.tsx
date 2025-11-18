import React, { useState, useRef } from 'react';
import { ScriptView } from './components/ScriptView';
import { generateScriptAndPrompt } from './services/geminiService';
import { fileToBase64 } from './utils';
import { GenerationStatus, VideoState } from './types';

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [state, setState] = useState<VideoState>({
    status: GenerationStatus.IDLE,
    script: null,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // Reset state if new image
      setState({
        status: GenerationStatus.IDLE,
        script: null,
        error: null
      });
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    try {
      setState(prev => ({ ...prev, status: GenerationStatus.GENERATING_SCRIPT, error: null }));

      // Generate Script & Prompt (passing image context)
      const base64Image = await fileToBase64(selectedImage);
      const scriptResponse = await generateScriptAndPrompt(base64Image, selectedImage.type);
      
      setState(prev => ({ 
        ...prev, 
        script: scriptResponse, 
        status: GenerationStatus.COMPLETED 
      }));

    } catch (error: any) {
      console.error(error);
      setState(prev => ({ 
        ...prev, 
        status: GenerationStatus.ERROR, 
        error: error.message || "An unexpected error occurred" 
      }));
    }
  };

  const isLoading = state.status === GenerationStatus.GENERATING_SCRIPT;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500 selection:text-white pb-20">
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">S</div>
            <h1 className="text-xl font-bold brand-font tracking-tight">Cryptid Scripter</h1>
          </div>
          <div className="text-sm text-gray-400 hidden sm:block">Powered by Gemini 2.5</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column: Controls & Preview */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold brand-font bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                Unhinged Interviews
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Upload your reference image of a Human and Bigfoot. We'll generate an unhinged 8-second script based on the visual context.
              </p>
            </div>

            {/* Upload Area */}
            <div 
              className={`relative group border-2 border-dashed rounded-2xl transition-all duration-300 aspect-video flex flex-col items-center justify-center overflow-hidden ${
                previewUrl ? 'border-gray-700 bg-black' : 'border-gray-700 hover:border-purple-500 bg-gray-900/30 hover:bg-gray-900/50'
              }`}
              onClick={() => !isLoading && fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Reference" className="w-full h-full object-contain opacity-50 group-hover:opacity-30 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black/80 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md">Change Image</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 cursor-pointer">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 group-hover:text-purple-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <p className="font-medium text-white">Click to upload reference image</p>
                  <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/png, image/jpeg" 
                className="hidden" 
                disabled={isLoading}
              />
            </div>

            {/* Action Button */}
            <button
              onClick={handleGenerate}
              disabled={!selectedImage || isLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg tracking-wide transition-all duration-200 relative overflow-hidden ${
                !selectedImage || isLoading
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-gray-200 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]'
              }`}
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-purple-400 text-sm">
                      Writing script...
                    </span>
                  </div>
                </div>
              )}
              GENERATE SCRIPT
            </button>

            {state.error && (
              <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200 text-sm">
                Error: {state.error}
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
            {state.script ? (
              <div className="animate-fade-in-up">
                <ScriptView script={state.script} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/20 min-h-[300px]">
                 <p className="text-gray-600">Script will appear here</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;