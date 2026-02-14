import { create } from 'zustand';
import * as projectApi from '../api/projects';

const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const res = await projectApi.getProjects();
      set({ projects: res.data.projects, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || error.message, loading: false });
    }
  },

  createProject: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await projectApi.createProject(data);
      set(state => ({
        projects: [res.data, ...state.projects],
        currentProject: res.data,
        loading: false
      }));
      return res.data;
    } catch (error) {
      set({ error: error.response?.data?.error || error.message, loading: false });
      throw error;
    }
  },

  fetchProject: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await projectApi.getProject(id);
      set({ currentProject: res.data, loading: false });
      return res.data;
    } catch (error) {
      set({ error: error.response?.data?.error || error.message, loading: false });
      throw error;
    }
  },

  updateProject: async (id, data) => {
    try {
      const res = await projectApi.updateProject(id, data);
      set(state => ({
        currentProject: res.data,
        projects: state.projects.map(p => p._id === id ? res.data : p)
      }));
      return res.data;
    } catch (error) {
      set({ error: error.response?.data?.error || error.message });
      throw error;
    }
  },

  deleteProject: async (id) => {
    try {
      await projectApi.deleteProject(id);
      set(state => ({
        projects: state.projects.filter(p => p._id !== id),
        currentProject: state.currentProject?._id === id ? null : state.currentProject
      }));
    } catch (error) {
      set({ error: error.response?.data?.error || error.message });
      throw error;
    }
  },

  setCurrentProject: (project) => set({ currentProject: project }),
  clearError: () => set({ error: null })
}));

export default useProjectStore;
