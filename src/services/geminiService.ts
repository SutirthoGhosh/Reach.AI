import { GoogleGenAI, Type } from "@google/genai";

interface OutreachGenerationParams {
  audience: string;
  goal: string;
  tone: string;
}

interface Message {
  subject?: string;
  content: string;
}

export interface OutreachResponse {
  messages: Message[];
}

export async function generateOutreachMessages(params: OutreachGenerationParams, apiKey?: string): Promise<OutreachResponse> {
  const finalApiKey = apiKey || process.env.GEMINI_API_KEY;
  if (!finalApiKey) {
    throw new Error("Missing Gemini API Key. Please configure it in Settings.");
  }

  const ai = new GoogleGenAI({ apiKey: finalApiKey });

  const prompt = `Generate 3 distinct, high-converting outreach messages for the following target audience and goal.
    Target Audience: ${params.audience}
    Goal: ${params.goal}
    Tone: ${params.tone}

    Requirements:
    - Keep messages short, concise, and human-like.
    - Avoid buzzwords and sounding robotic.
    - Focus on starting a conversation (reply optimization).
    - Provide an optional subject line if applicable (e.g. for email).
    - Vary the approach across the 3 messages.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          messages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING, description: "Optional subject line" },
                content: { type: Type.STRING, description: "Body of the outreach message" },
              },
              required: ["content"],
            },
          },
        },
        required: ["messages"],
      },
    },
  });

  try {
    const parsed = JSON.parse(response.text.trim());
    return parsed as OutreachResponse;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Received an invalid response format from AI.");
  }
}
