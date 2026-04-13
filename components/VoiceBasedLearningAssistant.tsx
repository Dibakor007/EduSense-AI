import React, { useEffect, useRef, useState } from "react";
import voiceService, {
  VoiceNote,
  VoiceRecognitionResult,
} from "../services/voiceService";

interface VoiceBasedLearningAssistantProps {
  isActive?: boolean;
  onCommandExecuted?: (command: string, response: string) => void;
  context?: string;
  subject?: string;
}

interface TranscriptItem {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  confidence?: number;
}

const VoiceBasedLearningAssistant: React.FC<
  VoiceBasedLearningAssistantProps
> = ({
  isActive = true,
  onCommandExecuted,
  context = "general learning",
  subject,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [commandSuggestions, setCommandSuggestions] = useState<string[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(true);
  const [apiHealth, setApiHealth] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const notesEndRef = useRef<HTMLDivElement>(null);

  // Load command suggestions on mount
  useEffect(() => {
    loadCommandSuggestions();
  }, [context, subject]);

  // Auto-scroll transcripts to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  // Auto-scroll notes to bottom
  useEffect(() => {
    notesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [voiceNotes]);

  const loadCommandSuggestions = async () => {
    try {
      const suggestions = await voiceService.getVoiceCommandSuggestions(
        `${subject || context} learning session`
      );
      setCommandSuggestions(suggestions);
    } catch (err) {
      console.error("Failed to load suggestions:", err);
    }
  };

  const handleStartListening = () => {
    if (!voiceService.isAvailable()) {
      setError("Speech Recognition is not available in your browser");
      return;
    }

    setError(null);
    setCurrentTranscript("");
    setInterimTranscript("");
    setIsListening(true);

    voiceService.startListening(
      (result: VoiceRecognitionResult) => {
        if (result.isFinal) {
          setCurrentTranscript(result.transcript);
          setInterimTranscript("");
        } else {
          setInterimTranscript(result.transcript);
        }
      },
      (error: string) => {
        setError(error);
        setIsListening(false);
      }
    );
  };

  const handleStopListening = async () => {
    voiceService.stopListening();
    setIsListening(false);

    if (currentTranscript) {
      // Add user transcript
      const newTranscript: TranscriptItem = {
        id: `transcript_${Date.now()}`,
        text: currentTranscript,
        isUser: true,
        timestamp: new Date(),
      };
      setTranscripts((prev) => [...prev, newTranscript]);

      // Process command with Gemini
      try {
        setIsSpeaking(true);
        setError(null); // Clear previous errors
        const response = await voiceService.processVoiceCommand(
          currentTranscript
        );

        // Add AI response
        const aiTranscript: TranscriptItem = {
          id: `transcript_${Date.now() + 1}`,
          text: response,
          isUser: false,
          timestamp: new Date(),
        };
        setTranscripts((prev) => [...prev, aiTranscript]);

        // Synthesize response
        await voiceService.synthesizeSpeech({ text: response });

        if (onCommandExecuted) {
          onCommandExecuted(currentTranscript, response);
        }
      } catch (err) {
        const last = voiceService.getLastError();
        const errorMessage =
          err instanceof Error
            ? err.message
            : last || "Failed to process command";
        console.error("Voice command error details:", err);
        setError(errorMessage);
      } finally {
        setIsSpeaking(false);
        setCurrentTranscript("");
      }
    }
  };

  const handleSaveNote = async () => {
    if (currentTranscript) {
      try {
        const note = await voiceService.createVoiceNote(
          currentTranscript,
          subject
        );
        setVoiceNotes((prev) => [...prev, note]);
        setCurrentTranscript("");
        setInterimTranscript("");
        // Auto-show notes when one is saved
        setShowNotes(true);
      } catch (err) {
        setError("Failed to save note");
      }
    }
  };

  const handleGenerateAudioExplanation = async (content: string) => {
    try {
      setIsSpeaking(true);
      setError(null);
      await voiceService.generateAudioExplanation(content);
      const aiTranscript: TranscriptItem = {
        id: `transcript_${Date.now()}`,
        text: `Explanation: ${content}`,
        isUser: false,
        timestamp: new Date(),
      };
      setTranscripts((prev) => [...prev, aiTranscript]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate explanation"
      );
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleUseSuggestion = async (suggestion: string) => {
    setCurrentTranscript(suggestion);
    // Simulate voice command
    const newTranscript: TranscriptItem = {
      id: `transcript_${Date.now()}`,
      text: suggestion,
      isUser: true,
      timestamp: new Date(),
    };
    setTranscripts((prev) => [...prev, newTranscript]);

    try {
      setIsSpeaking(true);
      const response = await voiceService.processVoiceCommand(suggestion);
      const aiTranscript: TranscriptItem = {
        id: `transcript_${Date.now() + 1}`,
        text: response,
        isUser: false,
        timestamp: new Date(),
      };
      setTranscripts((prev) => [...prev, aiTranscript]);
      await voiceService.synthesizeSpeech({ text: response });

      if (onCommandExecuted) {
        onCommandExecuted(suggestion, response);
      }
    } catch (err) {
      const last = voiceService.getLastError();
      setError(
        err instanceof Error ? err.message : last || "Failed to process command"
      );
    } finally {
      setIsSpeaking(false);
      setCurrentTranscript("");
      setShowSuggestions(false);
    }
  };

  const handleClearNotes = () => {
    if (confirm("Are you sure you want to clear all notes?")) {
      voiceService.clearVoiceNotes();
      setVoiceNotes([]);
    }
  };

  const handleCancelSpeech = () => {
    voiceService.cancelSpeech();
    setIsSpeaking(false);
  };

  const handleClearTranscripts = () => {
    setTranscripts([]);
  };

  if (!isActive || !voiceService.isAvailable()) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg border border-blue-200">
      {/* Diagnostics Banner */}
      {showDiagnostics && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">
          <div className="flex flex-wrap items-center gap-3">
            <span>
              Recognition: {voiceService.isAvailable() ? "Yes" : "No"}
            </span>
            <span>
              Synthesis:{" "}
              {typeof window !== "undefined" && window.speechSynthesis
                ? "Yes"
                : "No"}
            </span>
            <span>
              API Key: {voiceService.hasApiKey() ? "Detected" : "Missing"}
            </span>
            <button
              onClick={() => setShowDiagnostics(false)}
              className="ml-auto px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Hide
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 16.91c-1.48 1.46-3.51 2.36-5.77 2.36-2.26 0-4.29-.9-5.77-2.36l-1.1 1.1c1.86 1.86 4.41 3.02 7.07 3.02s5.21-1.16 7.07-3.02l-1.1-1.1zM12 19c2.21 0 4-1.79 4-4h-8c0 2.21 1.79 4 4 4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Voice Learning Assistant
            </h2>
            <p className="text-sm text-gray-600">
              {subject
                ? `Learning: ${subject}`
                : "Ready to learn with your voice"}
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          ⚠️ {error}
          {voiceService.getLastError() && (
            <div className="mt-1 text-red-600/80">
              Details: {voiceService.getLastError()}
            </div>
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={isListening ? handleStopListening : handleStartListening}
          disabled={isSpeaking}
          className={`px-4 py-2 rounded-lg font-semibold text-white transition-all ${
            isListening
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-blue-500 hover:bg-blue-600"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isListening ? (
            <>
              <span className="inline-block mr-2">●</span>
              Stop Listening
            </>
          ) : (
            <>
              <span className="inline-block mr-2">🎙️</span>
              Start Listening
            </>
          )}
        </button>

        <button
          onClick={handleSaveNote}
          disabled={!currentTranscript || isSpeaking}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          💾 Save Note
        </button>

        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-all"
        >
          💡 Suggestions
        </button>

        <button
          onClick={() => setShowNotes(!showNotes)}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold transition-all"
        >
          📝 Notes ({voiceNotes.length})
        </button>

        <button
          onClick={async () => {
            const res = await voiceService.testApi();
            setApiHealth(res.ok ? `✅ ${res.message}` : `❌ ${res.message}`);
            const remaining = voiceService.getCooldownRemaining();
            setCooldownRemaining(remaining);
          }}
          disabled={cooldownRemaining > 0}
          className={`px-4 py-2 rounded-lg font-semibold text-white transition-all ${
            cooldownRemaining > 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gray-600 hover:bg-gray-700"
          }`}
        >
          🧪 Test API
        </button>

        {isSpeaking && (
          <button
            onClick={handleCancelSpeech}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all"
          >
            ⏹️ Stop Speaking
          </button>
        )}
      </div>

      {/* Command Suggestions */}
      {showSuggestions && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-purple-200">
          <h3 className="font-semibold text-gray-800 mb-3">
            Voice Command Suggestions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {commandSuggestions.length > 0 ? (
              commandSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleUseSuggestion(suggestion)}
                  disabled={isSpeaking}
                  className="text-left p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-sm text-purple-900 transition-all disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))
            ) : (
              <p className="text-gray-500 text-sm col-span-2">
                Loading suggestions...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Current Transcript Input */}
      {(currentTranscript || interimTranscript) && (
        <div className="mb-6 p-4 bg-white rounded-lg border-2 border-blue-300">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Current Transcript
          </h3>
          <div className="text-lg text-gray-800">
            {currentTranscript || (
              <span className="text-gray-400 italic">
                {interimTranscript}...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Transcripts Display */}
      <div className="mb-6 p-4 bg-white rounded-lg border border-blue-200 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-800">Conversation</h3>
          {transcripts.length > 0 && (
            <button
              onClick={handleClearTranscripts}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Clear
            </button>
          )}
        </div>

        {transcripts.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No conversation yet. Start by clicking "Start Listening"
          </p>
        ) : (
          <div className="space-y-3">
            {transcripts.map((transcript) => (
              <div
                key={transcript.id}
                className={`p-3 rounded-lg ${
                  transcript.isUser
                    ? "bg-blue-100 border-l-4 border-blue-500 ml-8"
                    : "bg-gray-100 border-l-4 border-gray-400 mr-8"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      {transcript.isUser ? "👤 You" : "🤖 Assistant"}
                    </p>
                    <p className="text-gray-800">{transcript.text}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {transcript.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        )}
      </div>

      {/* Voice Notes Display */}
      {showNotes && (
        <div className="p-4 bg-white rounded-lg border border-indigo-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">📝 Voice Notes</h3>
            {voiceNotes.length > 0 && (
              <button
                onClick={handleClearNotes}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Clear All
              </button>
            )}
          </div>

          {voiceNotes.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              No notes yet. Use "Save Note" to store transcripts.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {voiceNotes.map((note, idx) => (
                <div
                  key={note.id}
                  className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-grow">
                      {note.subject && (
                        <p className="text-xs font-semibold text-indigo-600 mb-1">
                          {note.subject}
                        </p>
                      )}
                      <p className="text-gray-800">{note.text}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {note.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={notesEndRef} />
            </div>
          )}
        </div>
      )}

      {/* API Health Result */}
      {apiHealth && (
        <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded text-xs text-gray-800">
          {apiHealth}
          {cooldownRemaining > 0 && (
            <span className="ml-2 text-gray-600">
              (cooldown: {cooldownRemaining}s)
            </span>
          )}
        </div>
      )}

      {/* Status Indicator */}
      <div className="mt-6 pt-4 border-t border-blue-200 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isListening
                ? "bg-red-500 animate-pulse"
                : isSpeaking
                ? "bg-yellow-500 animate-pulse"
                : "bg-green-500"
            }`}
          />
          <span>
            {isListening
              ? "Listening..."
              : isSpeaking
              ? "Speaking..."
              : "Ready"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VoiceBasedLearningAssistant;
