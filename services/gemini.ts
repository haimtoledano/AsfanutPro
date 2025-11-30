
import { GoogleGenAI, Type } from "@google/genai";
import { ItemType, AIAnalysisResult } from "../types";
import { getProfileFromDB } from "./db";

// Helper to get the API Key. 
// Logic: Use override if provided -> Use DB if available -> Return empty string.
// Note: process.env.API_KEY is not available in the client build.
const getApiKey = async (override?: string): Promise<string> => {
  if (override && override.trim() !== '') return override;

  try {
    const profile = await getProfileFromDB();
    if (profile && profile.apiKey && profile.apiKey.trim() !== '') {
      return profile.apiKey;
    }
  } catch (e) {
    console.warn("Could not fetch profile for API Key", e);
  }

  return '';
};

export const analyzeCollectibleItem = async (
  frontImageBase64: string,
  backImageBase64: string,
  type: ItemType,
  overrideApiKey?: string
): Promise<AIAnalysisResult> => {
  
  const apiKey = await getApiKey(overrideApiKey);

  if (!apiKey) {
    throw new Error("Missing Google API Key. Please configure it in Store Settings.");
  }

  const prompt = `
    You are an expert numismatist and philatelist. 
    Analyze these two images (front and back) of a ${type === ItemType.COIN ? 'coin' : 'stamp'}.
    
    1. Identify the item accurately (Country, Year, Denomination, Name).
    2. Grade the condition carefully (e.g., Mint, Fine, Poor) based on visible wear, oxidation, or tears.
    3. Detect any anomalies, mint errors, scratches, or unique features that affect value.
    4. Provide a realistic market value estimate range in USD.
    5. Provide a short professional description in Hebrew.
  `;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: frontImageBase64.split(',')[1] || frontImageBase64 
            }
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: backImageBase64.split(',')[1] || backImageBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itemName: { type: Type.STRING, description: "Full name of the item in Hebrew" },
            year: { type: Type.STRING, description: "Year of issue" },
            origin: { type: Type.STRING, description: "Country of origin in Hebrew" },
            conditionGrade: { type: Type.STRING, description: "Condition grade in Hebrew" },
            anomalies: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of anomalies or defects in Hebrew"
            },
            estimatedValueRange: { type: Type.STRING, description: "Value range (e.g. $10 - $20)" },
            description: { type: Type.STRING, description: "Professional description in Hebrew" },
            confidenceScore: { type: Type.NUMBER, description: "Confidence in identification 0-100" }
          },
          required: ["itemName", "year", "origin", "conditionGrade", "estimatedValueRange", "description"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResult;
    }
    
    throw new Error("No data returned from AI");

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const analyzeLogoColor = async (imageBase64: string, overrideApiKey?: string): Promise<string[]> => {
  const apiKey = await getApiKey(overrideApiKey);

  if (!apiKey) {
     console.warn("No API key provided for color analysis");
     return ["#2563eb", "#0f172a", "#475569"];
  }

  const prompt = `
    Analyze this logo image. 
    Identify the most dominant and aesthetically pleasing colors that would work well as a primary brand color for a website button or header.
    Return a list of 3 distinct Hex color codes (e.g. #FF5733).
  `;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: imageBase64.split(',')[1] || imageBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            colors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3 hex color codes"
            }
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return data.colors || ["#2563eb", "#d97706", "#dc2626"];
    }
    return ["#2563eb"];
  } catch (error) {
    console.error("Color Analysis Error:", error);
    return ["#2563eb", "#0f172a", "#475569"]; // Fallback colors
  }
};
