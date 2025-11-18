import { GoogleGenAI, Type } from "@google/genai";
import { ScriptResponse } from "../types";

/**
 * Generates the script and the visual prompt for Veo using Gemini 2.5 Flash.
 * Returns a JSON object containing the dialogue and visual prompt.
 */
export const generateScriptAndPrompt = async (imageBase64?: string, mimeType?: string): Promise<ScriptResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const promptText = `
    You are a creative scriptwriter and visual director.
    
    Task:
    1. Generate a very short dialogue script (strictly 8 seconds duration, approx 20-25 words total) between a Human Podcast Host and Bigfoot.
       - Topic: "Unhinged humor".
       - Human: Serious, investigative journalist.
       - Bigfoot: Calm, philosophical, unhinged.
    
    2. Generate a "visualPrompt" for an AI video generator.
       - Scene: Cinematic shot, dim moody room, sitting at a table with microphones.
       - Incorporate details from the provided image if available.

    Output Requirements:
    - Return STRICTLY a JSON object.
    - The JSON MUST contain the conversation inside the "dialogue" array.
    
    Expected JSON Structure:
    {
      "dialogue": [ 
        { "speaker": "Human", "text": "..." }, 
        { "speaker": "Bigfoot", "text": "..." }
      ],
      "visualPrompt": "..."
    }
  `;

  const contents: any[] = [];
  
  if (imageBase64 && mimeType) {
    contents.push({
      inlineData: {
        mimeType: mimeType,
        data: imageBase64
      }
    });
  }

  contents.push({ text: promptText });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dialogue: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                speaker: { type: Type.STRING, enum: ["Human", "Bigfoot"] },
                text: { type: Type.STRING },
              },
              required: ["speaker", "text"],
            },
          },
          visualPrompt: {
            type: Type.STRING,
            description: "A highly descriptive prompt for a video generation model.",
          },
        },
        required: ["dialogue", "visualPrompt"],
      },
    },
  });

  if (response.text) {
    return JSON.parse(response.text) as ScriptResponse;
  }
  throw new Error("Failed to generate script.");
};