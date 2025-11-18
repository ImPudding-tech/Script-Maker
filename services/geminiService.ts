import { GoogleGenAI, Type } from "@google/genai";
import { ScriptResponse } from "../types";

// Note: We do not instantiate GoogleGenAI globally to ensure we pick up the latest key selection.

/**
 * Generates the script and the visual prompt for Veo using Gemini 2.5 Flash.
 */
export const generateScriptAndPrompt = async (): Promise<ScriptResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Create a short dialogue script (approx 8 seconds when spoken) between a Human Podcast Host and Bigfoot.
    Topic: "Unhinged humor".
    Characters:
    - Human: Serious, investigative journalist, trying to keep it professional but confused.
    - Bigfoot: Calm, philosophical, but says completely bizarre/unhinged things casually.
    
    Also, generate a detailed "visualPrompt" that describes a cinematic video shot of these two sitting at a table with microphones in a dim, moody room. 
    This visual prompt will be fed into an AI video generator.
    
    Return strictly JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
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

/**
 * Generates a video using Veo 3.1 Fast.
 * Uses the generated visual prompt and the user's uploaded reference image.
 */
export const generateVideoFromImage = async (
  visualPrompt: string,
  imageBase64: string,
  mimeType: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  console.log("Starting video generation with prompt:", visualPrompt);

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: visualPrompt,
    image: {
      imageBytes: imageBase64,
      mimeType: mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p', 
      aspectRatio: '16:9', 
    }
  });

  // Polling loop
  while (!operation.done) {
    // Wait 5 seconds before polling again
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log("Polling video operation status...");
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  if (operation.error) {
    throw new Error(`Video generation failed: ${operation.error.message}`);
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) {
    throw new Error("No video URI returned from operation.");
  }

  // Append API key to fetch the actual resource
  return `${videoUri}&key=${process.env.API_KEY}`;
};