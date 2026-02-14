import { create } from 'zustand';
import * as questionnaireApi from '../api/questionnaire';

const useQuestionnaireStore = create((set, get) => ({
  currentStep: 0,
  totalSteps: 5,
  responses: {
    industry: {},
    modules: { selected: [], priorities: {} },
    entities: {},
    workflows: [],
    settings: {
      database: 'mongodb',
      authentication: true,
      authMethod: 'jwt',
      frontend: true,
      docker: true
    }
  },
  aiSuggestions: null,
  loading: false,
  completed: false,
  error: null,

  loadQuestionnaire: async (projectId) => {
    set({ loading: true });
    try {
      const res = await questionnaireApi.getQuestionnaire(projectId);
      const q = res.data;
      set({
        currentStep: q.currentStep || 0,
        responses: {
          industry: q.responses?.industry || {},
          modules: q.responses?.modules || { selected: [], priorities: {} },
          entities: q.responses?.entities || {},
          workflows: q.responses?.workflows || [],
          settings: q.responses?.settings || {
            database: 'mongodb', authentication: true, authMethod: 'jwt', frontend: true, docker: true
          }
        },
        completed: q.completed,
        aiSuggestions: null,
        loading: false
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  goToStep: (step) => {
    if (step >= 0 && step < get().totalSteps) {
      set({ currentStep: step, aiSuggestions: null });
    }
  },

  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps - 1) {
      set({ currentStep: currentStep + 1, aiSuggestions: null });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1, aiSuggestions: null });
    }
  },

  updateResponse: (stepKey, data) => {
    set(state => ({
      responses: {
        ...state.responses,
        [stepKey]: { ...state.responses[stepKey], ...data }
      }
    }));
  },

  setModuleSelected: (moduleIds) => {
    set(state => ({
      responses: {
        ...state.responses,
        modules: { ...state.responses.modules, selected: moduleIds }
      }
    }));
  },

  toggleModule: (moduleId) => {
    set(state => {
      const current = state.responses.modules.selected;
      const updated = current.includes(moduleId)
        ? current.filter(id => id !== moduleId)
        : [...current, moduleId];
      return {
        responses: {
          ...state.responses,
          modules: { ...state.responses.modules, selected: updated }
        }
      };
    });
  },

  saveStep: async (projectId) => {
    const { currentStep, responses } = get();
    const stepKeys = ['industry', 'modules', 'entities', 'workflows', 'settings'];
    const key = stepKeys[currentStep];
    try {
      await questionnaireApi.saveStep(projectId, currentStep, responses[key]);
    } catch (error) {
      set({ error: error.message });
    }
  },

  fetchAiSuggestions: async (projectId) => {
    const { currentStep } = get();
    set({ loading: true });
    try {
      const res = await questionnaireApi.getAiSuggestion(projectId, currentStep);
      set({ aiSuggestions: res.data, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  completeQuestionnaire: async (projectId) => {
    set({ loading: true });
    try {
      const res = await questionnaireApi.completeQuestionnaire(projectId);
      set({ completed: true, loading: false });
      return res.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  reset: () => {
    set({
      currentStep: 0,
      responses: {
        industry: {},
        modules: { selected: [], priorities: {} },
        entities: {},
        workflows: [],
        settings: { database: 'mongodb', authentication: true, authMethod: 'jwt', frontend: true, docker: true }
      },
      aiSuggestions: null,
      completed: false,
      error: null
    });
  }
}));

export default useQuestionnaireStore;
