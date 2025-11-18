import { GoogleGenAI, Type } from "@google/genai";
import { ScriptResponse } from "../types";

/**
 * Generates the script and the visual prompt for Veo using Gemini 2.5 Flash.
 * Now accepts an optional image to influence the script generation.
 */
export const generateScriptAndPrompt = async (imageBase64?: string, mimeType?: string): Promise<ScriptResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const promptText = `
    Create a short dialogue script (approx 8 seconds when spoken) between a Human Podcast Host and Bigfoot.
    Topic: "Unhinged humor".
    Characters:
    - Human: Serious, investigative journalist, trying to keep it professional but confused.
    - Bigfoot: Calm, philosophical, but says completely bizarre/unhinged things casually.
    
    Also, generate a detailed "visualPrompt" that describes a cinematic video shot of these two sitting at a table with microphones in a dim, moody room. 
    This visual prompt will be fed into an AI video generator.
    
    Return strictly JSON.
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