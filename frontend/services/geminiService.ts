// This service has been disabled as per request.
// All AI functionalities are removed.

export const askAiAssistant = async (question: string): Promise<string> => {
  return "AI services are disabled.";
};

export const screenResume = async (resumeText: string, jobRole: string) => {
    return { error: "AI services are disabled." };
};

export const analyzeDocument = async (documentName: string) => {
    return { error: "AI services are disabled." };
};

export const getEngagementInsights = async (kudosData: string, leaveData: string) => {
     return "AI services are disabled.";
};

export const suggestSmartGoal = async (role: string, goalTitle: string) => {
    return { error: "AI services are disabled." };
};

export const analyzeSurveyFeedback = async (feedbackText: string) => {
    return { error: "AI services are disabled." };
};