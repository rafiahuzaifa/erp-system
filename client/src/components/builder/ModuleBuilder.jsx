import React, { useState } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import useBuilderStore from '../../store/useBuilderStore';
import ModulePalette from './ModulePalette';
import ModuleCard from './ModuleCard';
import FieldEditor from './FieldEditor';

export default function ModuleBuilder({ projectId }) {
  const {
    modules, catalog, selectedModuleId, selectedEntityId,
    addModule, moveModule, removeModule, selectModule, selectEntity
  } = useBuilderStore();
  const [dragActive, setDragActive] = useState(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event) => {
    setDragActive(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setDragActive(null);

    if (!over || over.id !== 'canvas') return;

    // Check if it's from the palette (new module)
    const catalogItem = catalog.find(c => c.id === active.id);
    if (catalogItem && !modules.find(m => m.moduleId === active.id)) {
      // Find a good position - offset from existing modules
      const existingCount = modules.length;
      const position = {
        x: (existingCount % 3) * 320 + 50,
        y: Math.floor(existingCount / 3) * 280 + 50
      };

      addModule({
        moduleId: catalogItem.id,
        name: catalogItem.id,
        displayName: catalogItem.name,
        position,
        entities: [], // Will be populated from default entities
        apis: [],
        workflows: []
      });
    }
  };

  const selectedModule = modules.find(m => m.moduleId === selectedModuleId);
  const selectedEntity = selectedModule?.entities?.find(e => e._id === selectedEntityId);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full">
        {/* Left: Module Palette */}
        <ModulePalette
          catalog={catalog}
          placedModuleIds={modules.map(m => m.moduleId)}
        />

        {/* Center: Canvas */}
        <Canvas
          modules={modules}
          selectedModuleId={selectedModuleId}
          onSelectModule={selectModule}
          onRemoveModule={removeModule}
        />

        {/* Right: Field Editor */}
        {selectedModule && (
          <FieldEditor
            module={selectedModule}
            selectedEntityId={selectedEntityId}
            onSelectEntity={selectEntity}
            projectId={projectId}
          />
        )}
      </div>

      <DragOverlay>
        {dragActive && (
          <div className="bg-white border-2 border-primary-400 rounded-lg px-4 py-3 shadow-lg opacity-80">
            <span className="font-medium text-sm">
              {catalog.find(c => c.id === dragActive)?.name || dragActive}
            </span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

function Canvas({ modules, selectedModuleId, onSelectModule, onRemoveModule }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 relative overflow-auto bg-gray-50 ${
        isOver ? 'bg-primary-50/50 ring-2 ring-primary-300 ring-inset' : ''
      }`}
      style={{
        backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onSelectModule(null);
      }}
    >
      {modules.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-gray-400 text-lg font-medium">Drag modules here</p>
            <p className="text-gray-300 text-sm mt-1">from the palette on the left</p>
          </div>
        </div>
      )}

      {modules.map(mod => (
        <ModuleCard
          key={mod.moduleId}
          module={mod}
          isSelected={selectedModuleId === mod.moduleId}
          onSelect={() => onSelectModule(mod.moduleId)}
          onRemove={() => onRemoveModule(mod.moduleId)}
        />
      ))}
    </div>
  );
}
