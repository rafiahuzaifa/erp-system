import { create } from 'zustand';
import * as moduleApi from '../api/modules';

const useBuilderStore = create((set, get) => ({
  modules: [],
  relationships: [],
  selectedModuleId: null,
  selectedEntityId: null,
  catalog: [],
  categories: {},
  loading: false,
  dirty: false,

  loadCatalog: async () => {
    try {
      const res = await moduleApi.getModuleCatalog();
      set({ catalog: res.data.modules, categories: res.data.categories });
    } catch (error) {
      console.error('Failed to load catalog:', error);
    }
  },

  loadProjectModules: async (projectId) => {
    set({ loading: true });
    try {
      const res = await moduleApi.getProjectModules(projectId);
      set({
        modules: res.data.modules || [],
        relationships: res.data.relationships || [],
        loading: false,
        dirty: false
      });
    } catch (error) {
      set({ loading: false });
    }
  },

  addModule: (moduleData) => {
    set(state => ({
      modules: [...state.modules, moduleData],
      dirty: true
    }));
  },

  removeModule: (moduleId) => {
    set(state => ({
      modules: state.modules.filter(m => m.moduleId !== moduleId),
      relationships: state.relationships.filter(
        r => r.from.moduleId !== moduleId && r.to.moduleId !== moduleId
      ),
      selectedModuleId: state.selectedModuleId === moduleId ? null : state.selectedModuleId,
      dirty: true
    }));
  },

  moveModule: (moduleId, position) => {
    set(state => ({
      modules: state.modules.map(m =>
        m.moduleId === moduleId ? { ...m, position } : m
      ),
      dirty: true
    }));
  },

  selectModule: (moduleId) => {
    set({ selectedModuleId: moduleId, selectedEntityId: null });
  },

  selectEntity: (entityId) => {
    set({ selectedEntityId: entityId });
  },

  updateEntity: (moduleId, entityId, updates) => {
    set(state => ({
      modules: state.modules.map(m => {
        if (m.moduleId !== moduleId) return m;
        return {
          ...m,
          entities: m.entities.map(e =>
            e._id === entityId ? { ...e, ...updates } : e
          )
        };
      }),
      dirty: true
    }));
  },

  addEntityField: (moduleId, entityId, field) => {
    set(state => ({
      modules: state.modules.map(m => {
        if (m.moduleId !== moduleId) return m;
        return {
          ...m,
          entities: m.entities.map(e => {
            if (e._id !== entityId) return e;
            return { ...e, fields: [...e.fields, field] };
          })
        };
      }),
      dirty: true
    }));
  },

  removeEntityField: (moduleId, entityId, fieldIndex) => {
    set(state => ({
      modules: state.modules.map(m => {
        if (m.moduleId !== moduleId) return m;
        return {
          ...m,
          entities: m.entities.map(e => {
            if (e._id !== entityId) return e;
            return { ...e, fields: e.fields.filter((_, i) => i !== fieldIndex) };
          })
        };
      }),
      dirty: true
    }));
  },

  addRelationship: (relationship) => {
    set(state => ({
      relationships: [...state.relationships, relationship],
      dirty: true
    }));
  },

  removeRelationship: (relId) => {
    set(state => ({
      relationships: state.relationships.filter(r => r._id !== relId),
      dirty: true
    }));
  },

  saveModules: async (projectId) => {
    const { modules, relationships } = get();
    set({ loading: true });
    try {
      await moduleApi.updateModules(projectId, { modules, relationships });
      set({ loading: false, dirty: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  reset: () => {
    set({
      modules: [],
      relationships: [],
      selectedModuleId: null,
      selectedEntityId: null,
      dirty: false
    });
  }
}));

export default useBuilderStore;
