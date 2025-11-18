export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING_SCRIPT = 'GENERATING_SCRIPT',
  GENERATING_VIDEO = 'GENERATING_VIDEO',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface ScriptLine {
  speaker: 'Human' | 'Bigfoot';
  text: string;
}

export interface ScriptResponse {
  dialogue: ScriptLine[];
  visualPrompt: string;
}

export interface VideoState {
  status: GenerationStatus;
  script: ScriptResponse | null;
  videoUrl: string | null;
  error: string | null;
}

// Augment window for AI Studio specific API
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}