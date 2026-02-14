import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import useQuestionnaireStore from '../../store/useQuestionnaireStore';
import * as moduleApi from '../../api/modules';

const FIELD_TYPES = ['String', 'Number', 'Boolean', 'Date', 'Enum', 'ObjectId', 'Array'];

export default function StepEntities({ projectId }) {
  const { responses } = useQuestionnaireStore();
  const [catalog, setCatalog] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [customizations, setCustomizations] = useState({});

  useEffect(() => {
    moduleApi.getModuleCatalog().then(res => {
      setCatalog(res.data.modules);
      // Pre-expand selected modules
      const expanded = {};
      responses.modules.selected.forEach(id => { expanded[id] = true; });
      setExpandedModules(expanded);
    });
  }, []);

  const selectedModules = responses.modules.selected || [];

  // Get full module data from catalog for each selected module
  const [fullModules, setFullModules] = useState({});
  useEffect(() => {
    const fetchModules = async () => {
      const res = await moduleApi.getModuleCatalog();
      const modulesMap = {};
      res.data.modules.forEach(m => { modulesMap[m.id] = m; });
      setFullModules(modulesMap);
    };
    fetchModules();
  }, []);

  const toggleExpand = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const addField = (moduleId, entityName) => {
    const key = `${moduleId}.${entityName}`;
    setCustomizations(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || { addedFields: [], removedFields: [] }),
        addedFields: [
          ...(prev[key]?.addedFields || []),
          { name: '', type: 'String', required: false }
        ]
      }
    }));
  };

  const updateAddedField = (key, fieldIndex, updates) => {
    setCustomizations(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        addedFields: prev[key].addedFields.map((f, i) =>
          i === fieldIndex ? { ...f, ...updates } : f
        )
      }
    }));
  };

  const removeAddedField = (key, fieldIndex) => {
    setCustomizations(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        addedFields: prev[key].addedFields.filter((_, i) => i !== fieldIndex)
      }
    }));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Data Entities & Fields</h2>
      <p className="text-gray-500 text-sm mb-6">
        Review and customize the data structure for each module. Add or remove fields as needed.
      </p>

      <div className="space-y-3">
        {selectedModules.map(moduleId => {
          const mod = fullModules[moduleId];
          if (!mod) return null;
          const isExpanded = expandedModules[moduleId];

          return (
            <div key={moduleId} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleExpand(moduleId)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="font-medium text-gray-900">{mod.name}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                    {mod.entityCount} entities
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 space-y-4">
                  {/* We'll show entities from the module definition catalog */}
                  {mod.entities.map((entityName, entityIdx) => {
                    const key = `${moduleId}.${entityName}`;
                    const custom = customizations[key] || { addedFields: [], removedFields: [] };

                    return (
                      <div key={entityName} className="border rounded-lg p-3 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-800">{entityName}</h4>
                          <button
                            onClick={() => addField(moduleId, entityName)}
                            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Field
                          </button>
                        </div>

                        <p className="text-xs text-gray-400 mb-2">Default fields will be included automatically</p>

                        {/* Custom Fields */}
                        {custom.addedFields.length > 0 && (
                          <div className="space-y-2 mt-3">
                            <p className="text-xs font-medium text-gray-500">Custom Fields:</p>
                            {custom.addedFields.map((field, fi) => (
                              <div key={fi} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Field name"
                                  value={field.name}
                                  onChange={e => updateAddedField(key, fi, { name: e.target.value })}
                                  className="input text-sm flex-1"
                                />
                                <select
                                  value={field.type}
                                  onChange={e => updateAddedField(key, fi, { type: e.target.value })}
                                  className="input text-sm w-32"
                                >
                                  {FIELD_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select>
                                <label className="flex items-center gap-1 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={e => updateAddedField(key, fi, { required: e.target.checked })}
                                    className="rounded"
                                  />
                                  Req
                                </label>
                                <button
                                  onClick={() => removeAddedField(key, fi)}
                                  className="p-1 text-red-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
