export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING_SCRIPT = 'GENERATING_SCRIPT',
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
  error: string | null;
}
