import api from './client';

export const getModuleCatalog = () => api.get('/modules/catalog');
export const getProjectModules = (projectId) => api.get(`/modules/${projectId}`);
export const updateModules = (projectId, data) => api.put(`/modules/${projectId}`, data);
export const addEntity = (projectId, data) => api.post(`/modules/${projectId}/entity`, data);
export const updateEntity = (projectId, entityId, data) => api.put(`/modules/${projectId}/entity/${entityId}`, data);
export const removeEntity = (projectId, entityId) => api.delete(`/modules/${projectId}/entity/${entityId}`);
export const addRelationship = (projectId, data) => api.post(`/modules/${projectId}/relationship`, data);
export const removeRelationship = (projectId, relId) => api.delete(`/modules/${projectId}/relationship/${relId}`);
export const aiEnhance = (projectId, data) => api.post(`/modules/${projectId}/ai-enhance`, data);
