// Use Google Gen AI SDK client
import { GoogleGenAI } from "@google/genai";

// Initialize the AI client (prefer Vite env variables in browser)
const apiKey =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_API_KEY) ||
  (typeof process !== "undefined" ? process.env?.API_KEY : undefined) ||
  (typeof process !== "undefined" ? process.env?.GEMINI_API_KEY : undefined) ||
  "";

if (!apiKey) {
  console.warn(
    "Warning: Gemini API key is not set. Voice features may use fallbacks. " +
      "Set VITE_GEMINI_API_KEY in your .env.local file."
  );
}

// Initialize Gemini client only if apiKey is present
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Interface for voice recognition results
 */
export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  accent?: string;
}

/**
 * Interface for voice synthesis options
 */
export interface VoiceSynthesisOptions {
  text: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

/**
 * Interface for note object
 */
export interface VoiceNote {
  id: string;
  text: string;
  audioUrl?: string;
  timestamp: Date;
  subject?: string;
}

/**
 * Voice Service - Handles voice-based interactions and Gemini API integration
 */
class VoiceService {
  private recognition: any;
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private notes: VoiceNote[] = [];
  private lastError: string | null = null;
  private cooldownUntil: number | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeRecognition();
  }

  /**
   * Initialize the Web Speech API recognition
   */
  private initializeRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";
  }

  /**
   * Start voice recognition and return stream of transcripts
   */
  startListening(
    onTranscript: (result: VoiceRecognitionResult) => void,
    onError: (error: string) => void
  ): void {
    if (!this.recognition) {
      onError("Speech Recognition not available in this browser");
      return;
    }

    if (this.isListening) {
      return;
    }

    this.isListening = true;

    this.recognition.onstart = () => {
      console.log("Voice recognition started");
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }

        const result: VoiceRecognitionResult = {
          transcript: event.results[i].isFinal
            ? finalTranscript
            : interimTranscript,
          confidence,
          isFinal: event.results[i].isFinal,
          accent: this.detectAccent(transcript),
        };

        onTranscript(result);
      }
    };

    this.recognition.onerror = (event: any) => {
      onError(`Speech recognition error: ${event.error}`);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log("Voice recognition ended");
    };

    this.recognition.start();
  }

  /**
   * Stop voice recognition
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Synthesize speech from text using Web Speech API
   */
  async synthesizeSpeech(options: VoiceSynthesisOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject("Speech Synthesis not available");
        return;
      }

      // Cancel any ongoing utterance
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(options.text);
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (event) => {
        reject(`Speech synthesis error: ${event.error}`);
      };

      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    });
  }

  /**
   * Generate audio explanation for content using Gemini
   */
  async generateAudioExplanation(content: string): Promise<string> {
    try {
      if (!ai) {
        const fallback = `Here is a brief explanation: ${content}`;
        await this.synthesizeSpeech({
          text: fallback,
          rate: 0.95,
          pitch: 1,
          volume: 1,
        });
        return fallback;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a clear, concise explanation suitable for audio narration. Keep it engaging and under 2 minutes when read aloud. Avoid special characters and formatting. Content to explain: ${content}`,
      });
      const textContent = response.text;

      // Synthesize the generated text
      await this.synthesizeSpeech({
        text: textContent,
        rate: 0.95,
        pitch: 1,
        volume: 1,
      });

      return textContent;
    } catch (error) {
      console.error("Failed to generate audio explanation:", error);
      throw new Error("Failed to generate audio explanation");
    }
  }

  /**
   * Process voice command and generate response using Gemini
   */
  async processVoiceCommand(command: string): Promise<string> {
    try {
      if (!ai) {
        return `I heard: "${command}". Voice AI is not configured.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `The user issued this voice command in an educational context. Generate a brief, clear response (1-2 sentences): "${command}"`,
      });
      return response.text;
    } catch (error) {
      const message =
        (error as any)?.message || "Failed to process voice command";
      const statusCode = (error as any)?.status;
      const status = statusCode ? ` (status: ${statusCode})` : "";
      console.error("Failed to process voice command:", error);
      this.lastError = `${message}${status}`;
      if (statusCode === 429) {
        // Set a cooldown (~30s) to avoid burning quota
        this.cooldownUntil = Date.now() + 30000;
      }
      throw new Error(this.lastError);
    }
  }

  /**
   * Transcribe voice to text and save as note
   */
  async createVoiceNote(
    transcript: string,
    subject?: string
  ): Promise<VoiceNote> {
    const note: VoiceNote = {
      id: `note_${Date.now()}`,
      text: transcript,
      timestamp: new Date(),
      subject,
    };

    this.notes.push(note);
    return note;
  }

  /**
   * Get all voice notes
   */
  getVoiceNotes(): VoiceNote[] {
    return this.notes;
  }

  /**
   * Clear voice notes
   */
  clearVoiceNotes(): void {
    this.notes = [];
  }

  /**
   * Detect accent from speech (simplified)
   */
  private detectAccent(transcript: string): string {
    // This is a simplified version. In a real application,
    // you would use more sophisticated accent detection
    // For now, we return a default
    return "standard";
  }

  /**
   * Get voice command suggestions based on context
   */
  async getVoiceCommandSuggestions(context: string): Promise<string[]> {
    try {
      if (!ai) {
        return [
          "Next question",
          "Repeat explanation",
          "Show hint",
          "Summarize this topic",
          "Save a voice note",
        ];
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate 5 helpful voice commands for this context: "${context}". Format as a JSON array of strings. Commands should be short and natural language.`,
      });
      const text = response.text;
      const jsonMatch = text.match(/\[.*\]/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      console.error("Failed to get voice command suggestions:", error);
      return [];
    }
  }

  /**
   * Check if speech recognition is available
   */
  isAvailable(): boolean {
    return !!this.recognition;
  }

  /**
   * Check if currently listening
   */
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Cancel current speech synthesis
   */
  cancelSpeech(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /** Get last API error (if any) */
  getLastError(): string | null {
    return this.lastError;
  }

  /**
   * Check if Gemini API key is configured
   */
  hasApiKey(): boolean {
    return !!apiKey;
  }

  /**
   * Simple API health check to validate Gemini access
   */
  async testApi(): Promise<{ ok: boolean; message: string }> {
    // Respect cooldown window if previously rate limited
    if (this.cooldownUntil && Date.now() < this.cooldownUntil) {
      const remaining = Math.ceil((this.cooldownUntil - Date.now()) / 1000);
      return {
        ok: false,
        message: `Rate-limited. Please retry in ${remaining}s.`,
      };
    }
    if (!ai) {
      return {
        ok: false,
        message: "API key not configured (VITE_GEMINI_API_KEY)",
      };
    }
    try {
      const resp = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Respond with 'OK'",
      });
      const text = resp.text?.trim() || "";
      const ok = /ok/i.test(text);
      return {
        ok,
        message: ok ? "API responded OK" : `Unexpected response: ${text}`,
      };
    } catch (error) {
      const msg = (error as any)?.message || "API call failed";
      const statusCode = (error as any)?.status;
      const status = statusCode ? ` (status: ${statusCode})` : "";
      this.lastError = `${msg}${status}`;
      if (statusCode === 429) {
        this.cooldownUntil = Date.now() + 30000;
      }
      return { ok: false, message: this.lastError };
    }
  }

  /** Seconds remaining in cooldown (0 if none) */
  getCooldownRemaining(): number {
    if (!this.cooldownUntil) return 0;
    const remainingMs = this.cooldownUntil - Date.now();
    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
  }
}

export default new VoiceService();
