import React, { useState, useRef } from 'react';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ScriptView } from './components/ScriptView';
import { generateScriptAndPrompt, generateVideoFromImage } from './services/geminiService';
import { fileToBase64 } from './utils';
import { GenerationStatus, VideoState } from './types';

const App: React.FC = () => {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [state, setState] = useState<VideoState>({
    status: GenerationStatus.IDLE,
    script: null,
    videoUrl: null,
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
        videoUrl: null,
        error: null
      });
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    try {
      setState(prev => ({ ...prev, status: GenerationStatus.GENERATING_SCRIPT, error: null }));

      // 1. Generate Script & Prompt
      const scriptResponse = await generateScriptAndPrompt();
      setState(prev => ({ 
        ...prev, 
        script: scriptResponse, 
        status: GenerationStatus.GENERATING_VIDEO 
      }));

      // 2. Generate Video using Veo
      const base64Image = await fileToBase64(selectedImage);
      const videoUrl = await generateVideoFromImage(
        scriptResponse.visualPrompt,
        base64Image,
        selectedImage.type
      );

      setState(prev => ({ 
        ...prev, 
        videoUrl: videoUrl, 
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

  const isLoading = state.status === GenerationStatus.GENERATING_SCRIPT || state.status === GenerationStatus.GENERATING_VIDEO;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500 selection:text-white pb-20">
      <ApiKeyModal onReady={() => setIsAuthReady(true)} />

      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">V</div>
            <h1 className="text-xl font-bold brand-font tracking-tight">Cryptid Studio</h1>
          </div>
          <div className="text-sm text-gray-400 hidden sm:block">Powered by Google Veo & Gemini 2.5</div>
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
                Upload your reference image of a Human and Bigfoot. We'll generate an unhinged 8-second script and animate it using the new Veo model.
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
              disabled={!selectedImage || isLoading || !isAuthReady}
              className={`w-full py-4 rounded-xl font-bold text-lg tracking-wide transition-all duration-200 relative overflow-hidden ${
                !selectedImage || isLoading || !isAuthReady
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-gray-200 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]'
              }`}
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-purple-400 text-sm">
                      {state.status === GenerationStatus.GENERATING_SCRIPT ? 'Writing script...' : 'Dreaming video (Veo)...'}
                    </span>
                  </div>
                </div>
              )}
              GENERATE ANIMATION
            </button>

            {state.error && (
              <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200 text-sm">
                Error: {state.error}
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
            
            {/* 1. Video Output */}
            {state.videoUrl ? (
              <div className="rounded-2xl overflow-hidden bg-black border border-gray-800 shadow-2xl aspect-video relative group">
                <video 
                  src={state.videoUrl} 
                  controls 
                  autoPlay 
                  loop 
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 right-4">
                  <a 
                    href={state.videoUrl} 
                    download="cryptid-video.mp4"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-black/50 backdrop-blur hover:bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-white/10 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                      <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                    </svg>
                    Download MP4
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-800 bg-black/20 aspect-video flex items-center justify-center">
                 {isLoading ? (
                    <div className="text-center animate-pulse">
                      <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4"></div>
                      <div className="h-4 bg-gray-800 rounded w-32 mx-auto"></div>
                    </div>
                 ) : (
                   <p className="text-gray-600">Generated animation will appear here</p>
                 )}
              </div>
            )}

            {/* 2. Script Output */}
            {state.script && (
              <div className="animate-fade-in-up">
                <ScriptView script={state.script} />
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;