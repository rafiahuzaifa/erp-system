import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Package, ShoppingCart, Receipt, Users, Calculator, Truck, Car, MapPin, ClipboardList, Handshake, TrendingUp, Warehouse } from 'lucide-react';

const iconMap = {
  package: Package, 'shopping-cart': ShoppingCart, receipt: Receipt,
  users: Users, calculator: Calculator, truck: Truck,
  car: Car, 'map-pin': MapPin, 'clipboard-list': ClipboardList,
  handshake: Handshake, 'trending-up': TrendingUp, warehouse: Warehouse
};

function DraggableItem({ module, isPlaced }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: module.id,
    disabled: isPlaced
  });

  const Icon = iconMap[module.icon] || Package;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
        isPlaced
          ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
          : isDragging
            ? 'bg-primary-50 border-primary-300 shadow-md'
            : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-sm'
      }`}
    >
      <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${
        isPlaced ? 'bg-gray-100' : 'bg-primary-50'
      }`}>
        <Icon className={`w-3.5 h-3.5 ${isPlaced ? 'text-gray-400' : 'text-primary-600'}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-900 truncate">{module.name}</p>
        <p className="text-[10px] text-gray-400">{module.entityCount} entities</p>
      </div>
      {isPlaced && (
        <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded ml-auto">Added</span>
      )}
    </div>
  );
}

export default function ModulePalette({ catalog, placedModuleIds }) {
  const grouped = catalog.reduce((acc, mod) => {
    if (!acc[mod.category]) acc[mod.category] = [];
    acc[mod.category].push(mod);
    return acc;
  }, {});

  const categoryLabels = {
    erp: 'ERP',
    logistics: 'Logistics',
    supply_chain: 'Supply Chain'
  };

  return (
    <div className="w-56 bg-white border-r overflow-y-auto p-3 flex-shrink-0">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Module Palette
      </h3>

      {Object.entries(grouped).map(([category, modules]) => (
        <div key={category} className="mb-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">
            {categoryLabels[category] || category}
          </p>
          <div className="space-y-1.5">
            {modules.map(mod => (
              <DraggableItem
                key={mod.id}
                module={mod}
                isPlaced={placedModuleIds.includes(mod.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
