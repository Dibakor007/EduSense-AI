import { Request, Response } from "express";

/**
 * AI Controller - Proxies Gemini API calls through the backend
 * This keeps the API key secure on the server side
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// =============================================
// POST /api/ai/generate-quiz
// =============================================
export const generateQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, topic, difficulty, totalQuestions, academicLevel } = req.body;

    if (!GEMINI_API_KEY) {
      res.status(503).json({ message: "AI service is not configured" });
      return;
    }

    const prompt = `Generate a quiz with ${totalQuestions} multiple-choice questions about the topic "${topic}" within the broader subject of "${subject}".
      The questions should be appropriate for a student at the "${academicLevel}" level.
      The difficulty should be "${difficulty}".
      Each question must have 4 options.
      The 'correctAnswer' field must exactly match one of the strings in the 'options' array.
      Provide a brief explanation for the correct answer.
      
      Return ONLY valid JSON in this exact format:
      {
        "questions": [
          {
            "question": "...",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "A",
            "explanation": "..."
          }
        ]
      }`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      res.status(502).json({ message: "AI service error" });
      return;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      res.status(502).json({ message: "No response from AI service" });
      return;
    }

    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error("AI quiz generation error:", error);
    res.status(500).json({ message: "Error generating quiz" });
  }
};

// =============================================
// POST /api/ai/chat
// =============================================
export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, context } = req.body;

    if (!GEMINI_API_KEY) {
      res.status(503).json({ message: "AI service is not configured" });
      return;
    }

    const systemPrompt = `You are Sparky, the EduSense AI Tutor. You are friendly, encouraging, and help students learn.
    ${context ? `Context about the student: ${context}` : ""}
    Keep responses concise and educational. Use emojis occasionally to be encouraging.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt + "\n\nStudent says: " + message }] },
          ],
        }),
      }
    );

    if (!response.ok) {
      res.status(502).json({ message: "AI service error" });
      return;
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";

    res.json({ reply });
  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({ message: "Error processing AI chat" });
  }
};

// =============================================
// POST /api/ai/recommendations
// =============================================
export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { skillGaps, academicLevel } = req.body;

    if (!GEMINI_API_KEY) {
      res.status(503).json({ message: "AI service is not configured" });
      return;
    }

    const skillsText = skillGaps
      .map((gap: any) => `- ${gap.subject}: ${gap.score}% mastery`)
      .join("\n");

    const prompt = `You are an expert educational advisor. Analyze the following skill gaps for a "${academicLevel}" level student and generate personalized learning recommendations.
    
    Skill Gaps:
    ${skillsText}
    
    For each skill gap, generate 2-3 recommendations. Return ONLY valid JSON:
    {
      "recommendations": [
        {
          "skill": "...",
          "title": "...",
          "contentType": "video|article|practice",
          "difficulty": "easy|medium|hard",
          "duration": 15,
          "description": "...",
          "youtubeSearchQuery": "...",
          "googleSearchQuery": "...",
          "priority": "high|medium|low",
          "keyTopics": ["..."]
        }
      ]
    }`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    if (!response.ok) {
      res.status(502).json({ message: "AI service error" });
      return;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(text || "{}");

    res.json(parsed);
  } catch (error) {
    console.error("AI recommendations error:", error);
    res.status(500).json({ message: "Error generating recommendations" });
  }
};
