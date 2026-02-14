import React, { useState } from 'react';
import { Plus, Trash2, ChevronRight, Save, Database } from 'lucide-react';
import useBuilderStore from '../../store/useBuilderStore';

const FIELD_TYPES = [
  'String', 'Number', 'Boolean', 'Date', 'ObjectId',
  'Array', 'Object', 'Email', 'Phone', 'URL', 'Enum'
];

export default function FieldEditor({ module, selectedEntityId, onSelectEntity, projectId }) {
  const { updateEntity, addEntityField, removeEntityField, saveModules, dirty, loading } = useBuilderStore();
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('String');

  const selectedEntity = module.entities?.find(e => e._id === selectedEntityId);

  const handleAddField = () => {
    if (!newFieldName.trim() || !selectedEntityId) return;
    addEntityField(module.moduleId, selectedEntityId, {
      name: newFieldName.trim(),
      type: newFieldType,
      required: false,
      unique: false
    });
    setNewFieldName('');
    setNewFieldType('String');
  };

  const handleRemoveField = (fieldIndex) => {
    removeEntityField(module.moduleId, selectedEntityId, fieldIndex);
  };

  const handleSave = async () => {
    try {
      await saveModules(projectId);
    } catch (err) {
      // handled by store
    }
  };

  return (
    <div className="w-72 bg-white border-l overflow-y-auto flex-shrink-0 flex flex-col">
      {/* Module Header */}
      <div className="px-4 py-3 border-b bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">{module.displayName || module.name}</h3>
        <p className="text-[10px] text-gray-400">{module.entities?.length || 0} entities</p>
      </div>

      {/* Entity List */}
      <div className="px-3 py-2 border-b">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Entities</p>
        <div className="space-y-0.5">
          {module.entities?.map((entity, i) => (
            <button
              key={entity._id || i}
              onClick={() => onSelectEntity(entity._id)}
              className={`w-full text-left px-2.5 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${
                selectedEntityId === entity._id
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Database className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{entity.name || entity.displayName}</span>
              <ChevronRight className="w-3 h-3 ml-auto opacity-40" />
            </button>
          ))}
        </div>
      </div>

      {/* Field Editor */}
      {selectedEntity && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-2 border-b bg-primary-50/50">
            <h4 className="text-xs font-semibold text-primary-700">
              {selectedEntity.name || selectedEntity.displayName}
            </h4>
            <p className="text-[10px] text-primary-500">{selectedEntity.fields?.length || 0} fields</p>
          </div>

          {/* Fields List */}
          <div className="px-3 py-2 space-y-1">
            {selectedEntity.fields?.map((field, idx) => (
              <div key={idx} className="flex items-center gap-1.5 group text-xs py-1 px-2 rounded hover:bg-gray-50">
                <span className="font-medium text-gray-800 truncate flex-1">{field.name}</span>
                <span className="text-gray-400 text-[10px] flex-shrink-0">{field.type}</span>
                {field.required && <span className="text-red-400 text-[10px]">*</span>}
                <button
                  onClick={() => handleRemoveField(idx)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Field */}
          <div className="px-3 py-3 border-t">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Add Field</p>
            <input
              type="text"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddField()}
              placeholder="Field name"
              className="w-full px-2.5 py-1.5 text-xs border rounded-lg mb-1.5 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
            <div className="flex gap-1.5">
              <select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value)}
                className="flex-1 px-2 py-1.5 text-xs border rounded-lg bg-white focus:ring-1 focus:ring-primary-500 outline-none"
              >
                {FIELD_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button
                onClick={handleAddField}
                disabled={!newFieldName.trim()}
                className="px-2.5 py-1.5 bg-primary-600 text-white rounded-lg text-xs hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {!selectedEntity && (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-gray-400 text-center">Select an entity to edit its fields</p>
        </div>
      )}

      {/* Save Button */}
      <div className="px-3 py-3 border-t mt-auto">
        <button
          onClick={handleSave}
          disabled={!dirty || loading}
          className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            dirty
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          {loading ? 'Saving...' : dirty ? 'Save Changes' : 'Saved'}
        </button>
      </div>
    </div>
  );
}
