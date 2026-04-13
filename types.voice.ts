/**
 * Voice Learning Assistant Types
 * Type definitions for voice-based learning features
 */

/**
 * Result from voice recognition
 */
export interface VoiceRecognitionResult {
  /** The transcribed text */
  transcript: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Whether this is a final result or interim */
  isFinal: boolean;
  /** Detected accent or dialect */
  accent?: string;
}

/**
 * Options for text-to-speech synthesis
 */
export interface VoiceSynthesisOptions {
  /** Text to synthesize */
  text: string;
  /** Speech rate (0.5-2.0, default: 1) */
  rate?: number;
  /** Voice pitch (0.5-2.0, default: 1) */
  pitch?: number;
  /** Volume (0-1, default: 1) */
  volume?: number;
}

/**
 * Saved voice note
 */
export interface VoiceNote {
  /** Unique identifier */
  id: string;
  /** Note text content */
  text: string;
  /** Optional audio URL for recorded audio */
  audioUrl?: string;
  /** When the note was created */
  timestamp: Date;
  /** Subject/topic associated with note */
  subject?: string;
}

/**
 * Voice command suggestion
 */
export interface VoiceCommandSuggestion {
  /** The suggested command text */
  command: string;
  /** Description of what the command does */
  description?: string;
  /** Category/type of command */
  category?: "navigation" | "quiz" | "explanation" | "note-taking" | "general";
}

/**
 * Transcript item in conversation
 */
export interface TranscriptItem {
  /** Unique identifier */
  id: string;
  /** Message text */
  text: string;
  /** Whether this is from user (true) or AI (false) */
  isUser: boolean;
  /** When message was created */
  timestamp: Date;
  /** Confidence score (for user messages) */
  confidence?: number;
  /** Message type */
  type?: "command" | "response" | "explanation" | "suggestion";
}

/**
 * Voice service event callbacks
 */
export interface VoiceServiceCallbacks {
  /** Called when transcript is received */
  onTranscript?: (result: VoiceRecognitionResult) => void;
  /** Called when error occurs */
  onError?: (error: string) => void;
  /** Called when listening starts */
  onStart?: () => void;
  /** Called when listening stops */
  onEnd?: () => void;
  /** Called when speech synthesis starts */
  onSpeakStart?: () => void;
  /** Called when speech synthesis ends */
  onSpeakEnd?: () => void;
}

/**
 * Configuration for voice assistant
 */
export interface VoiceAssistantConfig {
  /** Enable/disable the assistant */
  enabled: boolean;
  /** Learning context */
  context?: string;
  /** Current subject/topic */
  subject?: string;
  /** Language code (e.g., 'en-US') */
  language?: string;
  /** Whether to auto-play responses */
  autoPlayResponses?: boolean;
  /** Maximum note storage (0 = unlimited) */
  maxNotes?: number;
  /** Auto-clear notes after (minutes, 0 = disabled) */
  autoClearNotes?: number;
}

/**
 * Voice command context
 */
export interface VoiceCommandContext {
  /** Current page/view */
  page?: string;
  /** Current quiz ID if applicable */
  quizId?: string;
  /** Current lesson ID if applicable */
  lessonId?: string;
  /** Custom metadata */
  metadata?: Record<string, any>;
}

/**
 * Voice learning statistics
 */
export interface VoiceLearningStats {
  /** Total number of commands executed */
  totalCommands: number;
  /** Total notes created */
  totalNotes: number;
  /** Average recognition confidence */
  averageConfidence: number;
  /** Total speaking time (seconds) */
  totalSpeakingTime: number;
  /** Total listening time (seconds) */
  totalListeningTime: number;
  /** Most used voice command */
  mostUsedCommand?: string;
  /** Accent detected */
  detectedAccent?: string;
  /** Preferred learning style (audio/text) */
  preferredStyle?: "audio" | "text" | "mixed";
}

/**
 * Error types for voice operations
 */
export type VoiceErrorType =
  | "microphone_not_available"
  | "speech_recognition_not_supported"
  | "speech_synthesis_not_supported"
  | "api_error"
  | "network_error"
  | "permission_denied"
  | "timeout"
  | "no_speech_detected"
  | "unknown";

/**
 * Custom error for voice operations
 */
export class VoiceError extends Error {
  constructor(
    public type: VoiceErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = "VoiceError";
  }
}

/**
 * Voice command execution result
 */
export interface VoiceCommandResult {
  /** The original command */
  command: string;
  /** AI-generated response */
  response: string;
  /** Processing time (ms) */
  processingTime: number;
  /** Confidence in response */
  confidence: number;
  /** Whether command was successful */
  success: boolean;
  /** Error if any */
  error?: VoiceError;
}

/**
 * Voice learning session data
 */
export interface VoiceLearningSession {
  /** Session ID */
  id: string;
  /** Session start time */
  startTime: Date;
  /** Session end time */
  endTime?: Date;
  /** Subject being learned */
  subject?: string;
  /** Learning context */
  context?: string;
  /** All transcripts from session */
  transcripts: TranscriptItem[];
  /** All notes from session */
  notes: VoiceNote[];
  /** Session statistics */
  stats: VoiceLearningStats;
  /** Session metadata */
  metadata?: Record<string, any>;
}

/**
 * Accent detection result
 */
export interface AccentDetectionResult {
  /** Detected accent/dialect */
  accent: string;
  /** Confidence in detection (0-1) */
  confidence: number;
  /** Language detected */
  language: string;
  /** Region/country */
  region?: string;
}

/**
 * Voice command category
 */
export type VoiceCommandCategory =
  | "navigation"
  | "quiz"
  | "explanation"
  | "note-taking"
  | "general"
  | "homework";

/**
 * Component props for VoiceBasedLearningAssistant
 */
export interface VoiceBasedLearningAssistantProps {
  /** Enable/disable component */
  isActive?: boolean;
  /** Callback when command is executed */
  onCommandExecuted?: (command: string, response: string) => void;
  /** Learning context */
  context?: string;
  /** Current subject */
  subject?: string;
  /** CSS class for styling */
  className?: string;
  /** Custom configuration */
  config?: Partial<VoiceAssistantConfig>;
  /** Callback for statistics updates */
  onStatsUpdate?: (stats: VoiceLearningStats) => void;
  /** Callback for error events */
  onError?: (error: VoiceError) => void;
  /** Callback for notes update */
  onNotesUpdate?: (notes: VoiceNote[]) => void;
}

/**
 * Voice service interface
 */
export interface IVoiceService {
  startListening(
    onTranscript: (result: VoiceRecognitionResult) => void,
    onError: (error: string) => void
  ): void;
  stopListening(): void;
  synthesizeSpeech(options: VoiceSynthesisOptions): Promise<void>;
  generateAudioExplanation(content: string): Promise<string>;
  processVoiceCommand(command: string): Promise<string>;
  createVoiceNote(transcript: string, subject?: string): Promise<VoiceNote>;
  getVoiceNotes(): VoiceNote[];
  clearVoiceNotes(): void;
  getVoiceCommandSuggestions(context: string): Promise<string[]>;
  isAvailable(): boolean;
  isCurrentlyListening(): boolean;
  cancelSpeech(): void;
}

/**
 * Supported languages for voice
 */
export type VoiceLanguage =
  | "en-US"
  | "en-GB"
  | "en-AU"
  | "en-IN"
  | "es-ES"
  | "fr-FR"
  | "de-DE"
  | "it-IT"
  | "pt-PT"
  | "ja-JP"
  | "zh-CN"
  | "ko-KR";
