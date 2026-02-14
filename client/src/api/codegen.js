import api from './client';

export const getCodegenStatus = (projectId) => api.get(`/codegen/${projectId}/status`);
export const listFiles = (projectId) => api.get(`/codegen/${projectId}/files`);
export const getFile = (projectId, filePath) => api.get(`/codegen/${projectId}/files/${filePath}`);

// SSE-based endpoints (use EventSource directly)
export const createGenerateStream = (projectId) => {
  return new EventSource(`/api/codegen/${projectId}/generate`, {
    // Note: POST via EventSource isn't supported natively,
    // so we trigger via fetch then switch to EventSource for status
  });
};

export const triggerGenerate = (projectId) => api.post(`/codegen/${projectId}/generate`);
export const triggerRegenerate = (projectId, moduleId) => api.post(`/codegen/${projectId}/regenerate`, { moduleId });
