
import { GoogleGenAI, Type } from "@google/genai";

// Always use a named parameter and direct environment variable access
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const summarizeIncident = async (description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize the following incident description for an official FIR document. 
      Identify key parties, location, and nature of offense. Keep it concise and professional.
      
      Description: ${description}`,
    });
    return response.text;
  } catch (error) {
    console.error("AI Summarization failed:", error);
    return "Summary unavailable.";
  }
};

export const suggestIPCSections = async (description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Based on the following incident, suggest applicable sections from the Indian Penal Code (IPC) or Bharatiya Nyaya Sanhita (BNS). 
      Format the response as JSON.
      
      Incident: ${description}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              section: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["section", "title"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("IPC Suggestion failed:", error);
    return [];
  }
};

export const getChatbotResponse = async (query: string, history: {role: string, parts: {text: string}[]}[]) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: 'You are Rakshak AI, an assistant for the State Police Digital FIR portal. Assist citizens with FIR status queries, guidance on how to file reports, and explain legal terminology (IPC/BNS). Be professional, reassuring, and strictly legal-focused. Do not provide personal advice.',
      },
    });
    // Convert history to compatible format if needed or just use current query for simplicity in prototype
    const response = await chat.sendMessage({ message: query });
    return response.text;
  } catch (error) {
    console.error("Chatbot failed:", error);
    return "I am currently unable to process your request. Please contact the station helpline.";
  }
};

export const predictLoadForecasting = async (stationId: string, upcomingEvents: string[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Predict the FIR load and potential crime hotspots for ${stationId} based on these upcoming events: ${upcomingEvents.join(', ')}. 
      Return a risk score (0-100) and specific staffing recommendations.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER },
            predictedVolume: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Forecasting failed:", error);
    return null;
  }
};

export const analyzeEvidenceIntelligence = async (description: string, evidenceType: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analyze the relevance and potential tampering for a piece of evidence. 
      Context (FIR Description): ${description}
      Evidence Type: ${evidenceType}
      
      Analyze:
      1. Relevance score (0-100) based on context.
      2. Probability of tampering/manipulation based on typical digital forensic markers.
      3. Remarks for investigators.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            relevanceScore: { type: Type.NUMBER },
            isTampered: { type: Type.BOOLEAN },
            tamperConfidence: { type: Type.NUMBER },
            analysisRemarks: { type: Type.STRING }
          },
          required: ["relevanceScore", "isTampered", "tamperConfidence", "analysisRemarks"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Evidence analysis failed:", error);
    return null;
  }
};

export const detectCrimePatterns = async (firs: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Review the following list of FIR cases and identify Modus Operandi (MO) similarities, repeat patterns, and potential cross-case linkages.
      
      Cases: ${JSON.stringify(firs)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              moType: { type: Type.STRING },
              relatedCaseIds: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING },
              frequency: { type: Type.NUMBER },
              threatLevel: { type: Type.STRING }
            },
            required: ["moType", "relatedCaseIds", "description", "threatLevel"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Pattern detection failed:", error);
    return [];
  }
};

export const predictOptimalAssignment = async (firDetails: any, officers: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analyze current FIR details and list of officers to predict the most optimal assignment for fastest resolution. 
      Consider officer rank, experience (joining date), and training status.
      
      FIR: ${JSON.stringify(firDetails)}
      Officers: ${JSON.stringify(officers)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedOfficerId: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            estimatedResolutionTime: { type: Type.STRING }
          },
          required: ["suggestedOfficerId", "confidenceScore", "reasoning"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Assignment prediction failed:", error);
    return null;
  }
};

export const detectSLARiskProactively = async (fir: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Predict the probability of an SLA breach for this FIR. Analyze its current status, complexity, and time remaining. 
      Flag if proactive escalation is required.
      
      FIR Context: ${JSON.stringify(fir)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            probability: { type: Type.NUMBER },
            riskFactor: { type: Type.STRING, description: "LOW, MEDIUM, HIGH, CRITICAL" },
            proactiveSuggestion: { type: Type.STRING }
          },
          required: ["probability", "riskFactor", "proactiveSuggestion"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("SLA Risk detection failed:", error);
    return null;
  }
};

export const helpDraftFIR = async (roughNotes: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Convert the following rough notes into a professional, legally-styled incident description for a First Information Report (FIR). 
      Ensure it is objective, includes necessary details (who, what, when, where), and uses professional legal terminology used in Indian police departments.
      
      Rough Notes: ${roughNotes}`,
    });
    return response.text;
  } catch (error) {
    console.error("AI Drafting failed:", error);
    return roughNotes;
  }
};

export const validateFIRCompleteness = async (description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Evaluate this FIR description for legal completeness. Check for: 
      1. Identity of accused (if known)
      2. Specific Date and Time
      3. Specific Location
      4. Clear sequence of events
      5. Specific items lost/harmed.
      
      Output as JSON with a score (0-100) and a list of missing details.
      
      Description: ${description}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            missingDetails: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "missingDetails"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Validation failed:", error);
    return { score: 0, missingDetails: ["System currently unavailable"] };
  }
};

export const detectDuplicates = async (newFIR: string, existingFIRs: { id: string, summary: string }[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Compare this new FIR against a list of existing cases to find potential duplicates or related crimes. 
      Return JSON with related case IDs and match reasons.
      
      New FIR: ${newFIR}
      
      Existing Cases: ${JSON.stringify(existingFIRs)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              matchScore: { type: Type.NUMBER },
              reason: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Duplicate detection failed:", error);
    return [];
  }
};

export const evaluateRisk = async (description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this FIR description for potential red flags suggesting misuse or false report (for investigative flag ONLY). 
      Look for major contradictions, extreme delays in reporting without reason, or patterns typical of malicious filing.
      
      Output JSON with riskScore (0-100) and flags list.
      
      Description: ${description}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER },
            flags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["riskScore", "flags"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Risk evaluation failed:", error);
    return { riskScore: 0, flags: [] };
  }
};

export const processVoiceIncident = async (base64Audio: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-native-audio-preview-09-2025",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "audio/webm",
              data: base64Audio
            }
          },
          {
            text: "Transcribe this incident report and convert it into a professional FIR statement. Detect the language and output the final statement in English with legal terminology."
          }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Voice processing failed:", error);
    return null;
  }
};
