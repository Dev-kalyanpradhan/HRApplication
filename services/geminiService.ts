

import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development environments where the key might not be set.
  // In a real production environment, the key should always be present.
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const systemInstruction = `
You are the AI Assistant for AI4S Smart HR, an expert HR policy advisor for a modern Indian technology company.
Your goal is to provide clear, concise, and helpful answers to employee questions about HR policies.
Base your answers on standard Indian labor laws and common practices in the tech industry.

Key Policy Points to remember:
- Leave: Standard leave includes Casual Leave (CL), Sick Leave (SL), and Earned Leave (EL). Maternity leave is 26 weeks. Paternity leave is 15 days.
- Notice Period: Generally 2 months for permanent employees.
- Work Hours: Standard is 8 hours per day, 5 days a week.
- Probation Period: Typically 3-6 months for new hires.

When answering, be friendly and professional. If you don't know the answer or if it's a sensitive personal issue, advise the employee to contact the HR department directly.
Do not make up policies you are not sure about.
`;

const getApiResponseText = (response: GenerateContentResponse): string => {
  try {
    return response.text;
  } catch (e) {
    console.error("Error extracting text from Gemini response:", e, response);
    return "Error: Could not parse AI response.";
  }
}

export const askAiAssistant = async (question: string): Promise<string> => {
  if (!API_KEY) {
    return "The AI assistant is currently unavailable. Please contact HR for any questions.";
  }

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: question,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.5,
            topP: 0.95,
        },
    });
    return getApiResponseText(response);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "I'm sorry, I encountered an error while processing your request. Please try again or contact HR for assistance.";
  }
};

// --- New AI Functions ---

export const screenResume = async (resumeText: string, jobRole: string) => {
    if (!API_KEY) return null;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Job Role: ${jobRole}\n\nResume Text:\n${resumeText}`,
            config: {
                systemInstruction: "You are an expert tech recruiter. Analyze the resume against the job role. Provide a concise summary, a percentage match score, key strengths, and potential weaknesses. Be critical and objective.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        matchScore: { type: Type.NUMBER, description: "A percentage score from 0 to 100 representing how well the resume matches the job role." },
                        summary: { type: Type.STRING, description: "A brief 2-3 sentence summary of the candidate's profile." },
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of key strengths relevant to the role." },
                        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of potential weaknesses or areas to probe in an interview." }
                    }
                }
            }
        });
        return JSON.parse(getApiResponseText(response));
    } catch (error) {
        console.error("Error in screenResume:", error);
        return { error: "Failed to analyze resume." };
    }
};

export const analyzeDocument = async (documentName: string) => {
    if (!API_KEY) return null;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Simulate extracting key information from a standard Indian ${documentName}. Provide a JSON object with realistic placeholder values.`,
            config: {
                systemInstruction: "You are an OCR and data extraction AI. Given a document type, list the most important fields and provide realistic mock data for them.",
                responseMimeType: "application/json",
            }
        });
        return JSON.parse(getApiResponseText(response));
    } catch (error) {
        console.error("Error in analyzeDocument:", error);
        return { error: "Failed to analyze document." };
    }
};


export const getEngagementInsights = async (kudosData: string, leaveData: string) => {
     if (!API_KEY) return "Engagement analysis is unavailable.";
     try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the following anonymized HR data for a small tech company.\nKudos Data:\n${kudosData}\n\nLeave Data:\n${leaveData}\n\nProvide a brief, 2-3 sentence summary of employee engagement, highlighting one positive trend and one potential area for concern.`,
            config: {
                systemInstruction: "You are an expert HR analyst AI. Your task is to provide a quick, high-level summary of employee engagement based on the provided data points.",
                temperature: 0.6,
            }
        });
        return getApiResponseText(response);
    } catch (error) {
        console.error("Error in getEngagementInsights:", error);
        return "Could not generate engagement insights at this time.";
    }
};

export const suggestSmartGoal = async (role: string, goalTitle: string) => {
    if (!API_KEY) return null;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `An employee with the role "${role}" has a goal titled "${goalTitle}". Expand this into a SMART goal.`,
            config: {
                systemInstruction: "You are a management coach who helps write effective S.M.A.R.T. (Specific, Measurable, Achievable, Relevant, Time-bound) goals. Return a JSON object.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestedTitle: { type: Type.STRING, description: "A revised, more specific title for the goal." },
                        suggestedDescription: { type: Type.STRING, description: "A detailed, specific description of the goal." },
                        suggestedMetrics: { type: Type.STRING, description: "Clear, measurable metrics to track success, including a timeline." }
                    }
                }
            }
        });
        return JSON.parse(getApiResponseText(response));
    } catch (error) {
        console.error("Error in suggestSmartGoal:", error);
        return { error: "Failed to generate goal suggestions." };
    }
};


export const analyzeSurveyFeedback = async (feedbackText: string) => {
    if (!API_KEY) return null;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Here is the anonymous employee feedback:\n\n${feedbackText}`,
            config: {
                systemInstruction: "You are an HR data analyst AI. Analyze the employee survey feedback. Identify main themes, overall sentiment, and provide actionable suggestions. Return a JSON object.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        themes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of the main themes or topics mentioned." },
                        sentiment: { type: Type.STRING, description: "Overall sentiment (e.g., 'Positive', 'Mixed', 'Negative')." },
                        suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-5 actionable suggestions for management." }
                    }
                }
            }
        });
        return JSON.parse(getApiResponseText(response));
    } catch (error) {
        console.error("Error in analyzeSurveyFeedback:", error);
        return { error: "Failed to analyze feedback." };
    }
};