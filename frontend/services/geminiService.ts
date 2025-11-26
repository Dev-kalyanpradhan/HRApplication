// AI Services have been disabled.

export const askAiAssistant = async (question: string): Promise<string> => {
  return "AI features are currently disabled.";
};

export const screenResume = async (resumeText: string, jobRole: string) => {
    return { error: "AI features are currently disabled." };
};

export const analyzeDocument = async (documentName: string) => {
    return { error: "AI features are currently disabled." };
};

export const getEngagementInsights = async (kudosData: string, leaveData: string) => {
     return "AI features are currently disabled.";
};

export const suggestSmartGoal = async (role: string, goalTitle: string) => {
    return { error: "AI features are currently disabled." };
};

export const analyzeSurveyFeedback = async (feedbackText: string) => {
    return { error: "AI features are currently disabled." };
};