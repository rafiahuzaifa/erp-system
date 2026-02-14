import api from './client';

export const getDeploymentStatus = (projectId) => api.get(`/deployments/${projectId}`);
export const stopDeployment = (projectId) => api.post(`/deployments/${projectId}/stop`);
export const restartDeployment = (projectId) => api.post(`/deployments/${projectId}/restart`);
export const destroyDeployment = (projectId) => api.delete(`/deployments/${projectId}`);
export const updateEnvVars = (projectId, envVars) => api.put(`/deployments/${projectId}/env`, { envVars });
