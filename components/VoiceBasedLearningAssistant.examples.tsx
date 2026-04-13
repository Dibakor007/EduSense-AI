import React, { useState } from "react";
import VoiceBasedLearningAssistant from "./VoiceBasedLearningAssistant";

/**
 * Example: Using Voice Learning Assistant with Quiz
 */
export const VoiceQuizExample: React.FC = () => {
  const [quizResponses, setQuizResponses] = useState<
    Array<{ command: string; response: string; timestamp: Date }>
  >([]);

  const handleVoiceCommand = (command: string, response: string) => {
    setQuizResponses((prev) => [
      ...prev,
      { command, response, timestamp: new Date() },
    ]);

    // Handle quiz-specific commands
    if (command.toLowerCase().includes("next")) {
      // Move to next question
      console.log("Moving to next question");
    } else if (command.toLowerCase().includes("submit")) {
      // Submit answer
      console.log("Submitting answer:", response);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Interactive Quiz with Voice</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz Content */}
        <div>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Question 1</h3>
            <p className="text-gray-700">What is the capital of France?</p>
            <p className="text-sm text-gray-600 mt-2">
              A) London B) Paris C) Berlin D) Madrid
            </p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">
              Voice Responses:
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {quizResponses.map((response, idx) => (
                <div key={idx} className="text-sm bg-white p-2 rounded">
                  <p className="text-blue-600">
                    <strong>You:</strong> {response.command}
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    {response.response}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Voice Assistant */}
        <VoiceBasedLearningAssistant
          isActive={true}
          context="quiz"
          subject="Geography"
          onCommandExecuted={handleVoiceCommand}
        />
      </div>
    </div>
  );
};

/**
 * Example: Using Voice Learning Assistant with Lesson
 */
export const VoiceLessonExample: React.FC = () => {
  const [lessonNotes, setLessonNotes] = useState<string[]>([]);

  const handleVoiceCommand = (command: string, response: string) => {
    // Add to lesson notes
    setLessonNotes((prev) => [...prev, `Q: ${command}\nA: ${response}\n`]);

    // Handle lesson-specific commands
    if (command.toLowerCase().includes("example")) {
      console.log("Providing example");
    } else if (command.toLowerCase().includes("explain")) {
      console.log("Providing detailed explanation");
    } else if (command.toLowerCase().includes("summary")) {
      console.log("Generating summary");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Interactive Lesson</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lesson Content */}
        <div>
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold">Topic: Photosynthesis</h3>
            <p className="text-gray-700 mt-2">
              Photosynthesis is a process used by plants and other organisms to
              convert light energy into chemical energy. This process takes
              place in the chloroplasts of plant cells and involves several
              stages.
            </p>

            <h4 className="font-semibold mt-4">Key Points:</h4>
            <ul className="list-disc list-inside text-gray-700">
              <li>Occurs in chloroplasts</li>
              <li>Requires light energy</li>
              <li>Produces glucose and oxygen</li>
              <li>Uses carbon dioxide and water</li>
            </ul>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-900">💡 Try saying:</h4>
              <ul className="text-sm text-yellow-800 mt-2">
                <li>"Explain photosynthesis"</li>
                <li>"Give me an example"</li>
                <li>"What's the importance"</li>
                <li>"Can you summarize this"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Voice Assistant */}
        <VoiceBasedLearningAssistant
          isActive={true}
          context="lecture"
          subject="Biology"
          onCommandExecuted={handleVoiceCommand}
        />
      </div>

      {/* Notes from Voice Interaction */}
      {lessonNotes.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-gray-800 mb-3">Generated Notes</h3>
          <pre className="bg-white p-3 rounded text-sm overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap text-gray-700">
            {lessonNotes.join("")}
          </pre>
        </div>
      )}
    </div>
  );
};

/**
 * Example: Using Voice Learning Assistant with Homework Help
 */
export const VoiceHomeworkExample: React.FC = () => {
  const [problem, setProblem] = useState<string>("");
  const [solutions, setSolutions] = useState<
    Array<{ question: string; answer: string }>
  >([]);

  const handleVoiceCommand = (command: string, response: string) => {
    setSolutions((prev) => [...prev, { question: command, answer: response }]);
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Homework Help with Voice</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Statement */}
        <div>
          <div className="bg-purple-50 p-4 rounded-lg mb-4 border-2 border-purple-200">
            <h3 className="font-semibold text-gray-800 mb-2">Problem:</h3>
            <p className="text-gray-700 text-lg font-mono">
              Solve: 2x + 5 = 13
            </p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-3">
              Solutions Found:
            </h4>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {solutions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Ask voice assistant for help...
                </p>
              ) : (
                solutions.map((sol, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded border-l-4 border-green-500"
                  >
                    <p className="text-sm text-purple-600">
                      <strong>Q:</strong> {sol.question}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>A:</strong> {sol.answer}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Voice Assistant */}
        <VoiceBasedLearningAssistant
          isActive={true}
          context="homework"
          subject="Algebra"
          onCommandExecuted={handleVoiceCommand}
        />
      </div>

      {/* Help Tips */}
      <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
        <h3 className="font-semibold text-indigo-900 mb-2">
          💬 Voice Commands for Homework:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-indigo-800">
          <p>• "Solve this step by step"</p>
          <p>• "What's the next step"</p>
          <p>• "Check my work"</p>
          <p>• "Explain this concept"</p>
          <p>• "Give me a hint"</p>
          <p>• "Is my answer correct"</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Example: Using Voice Learning Assistant for Language Learning
 */
export const VoiceLanguageLearningExample: React.FC = () => {
  const [practiceWords, setPracticeWords] = useState<
    Array<{ word: string; pronunciation: string; confidence: number }>
  >([]);

  const handleVoiceCommand = (command: string, response: string) => {
    // Extract confidence if provided
    setPracticeWords((prev) => [
      ...prev,
      {
        word: command,
        pronunciation: response,
        confidence: Math.random() * 0.5 + 0.5,
      },
    ]);
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Language Learning with Voice</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Content */}
        <div>
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
              <h3 className="font-semibold text-gray-800 mb-2">
                Today's Vocabulary:
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="font-mono text-lg text-orange-900">Bonjour</p>
                  <p className="text-sm text-gray-600">Hello (French)</p>
                </div>
                <div>
                  <p className="font-mono text-lg text-orange-900">Merci</p>
                  <p className="text-sm text-gray-600">Thank you (French)</p>
                </div>
                <div>
                  <p className="font-mono text-lg text-orange-900">
                    S'il vous plaît
                  </p>
                  <p className="text-sm text-gray-600">Please (French)</p>
                </div>
              </div>
            </div>

            {practiceWords.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">
                  ✓ Practice Progress:
                </h4>
                <div className="space-y-1 text-sm">
                  {practiceWords.map((pw, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-gray-700">{pw.word}</span>
                      <span className="text-green-600">
                        {Math.round(pw.confidence * 100)}% match
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Voice Assistant */}
        <VoiceBasedLearningAssistant
          isActive={true}
          context="language practice"
          subject="French"
          onCommandExecuted={handleVoiceCommand}
        />
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
        <h3 className="font-semibold text-pink-900 mb-2">
          🗣️ Language Learning Tips:
        </h3>
        <ul className="text-sm text-pink-800 list-disc list-inside">
          <li>Speak naturally and clearly</li>
          <li>Use phrases like "Pronounce Bonjour"</li>
          <li>Practice regularly for accent improvement</li>
          <li>Ask for translations</li>
          <li>Request example sentences</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Example: Minimal Setup
 */
export const VoiceSimpleExample: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Simple Voice Assistant</h2>
      <VoiceBasedLearningAssistant isActive={true} context="learning" />
    </div>
  );
};

export default {
  VoiceQuizExample,
  VoiceLessonExample,
  VoiceHomeworkExample,
  VoiceLanguageLearningExample,
  VoiceSimpleExample,
};
