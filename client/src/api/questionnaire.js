import api from './client';

export const getQuestionnaire = (projectId) => api.get(`/questionnaire/${projectId}`);
export const saveStep = (projectId, stepNum, responses) => api.put(`/questionnaire/${projectId}/step/${stepNum}`, { responses });
export const getAiSuggestion = (projectId, step, context) => api.post(`/questionnaire/${projectId}/ai-suggest`, { step, context });
export const completeQuestionnaire = (projectId) => api.post(`/questionnaire/${projectId}/complete`);
