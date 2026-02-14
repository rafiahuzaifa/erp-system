import React from 'react';
import { Package, ShoppingCart, Receipt, Users, Calculator, Truck, Car, MapPin, ClipboardList, Handshake, TrendingUp, Warehouse, X, Database } from 'lucide-react';

const iconMap = {
  package: Package, 'shopping-cart': ShoppingCart, receipt: Receipt,
  users: Users, calculator: Calculator, truck: Truck,
  car: Car, 'map-pin': MapPin, 'clipboard-list': ClipboardList,
  handshake: Handshake, 'trending-up': TrendingUp, warehouse: Warehouse
};

export default function ModuleCard({ module, isSelected, onSelect, onRemove }) {
  const Icon = iconMap[module.icon] || Package;

  return (
    <div
      className={`absolute bg-white rounded-xl border-2 shadow-sm cursor-pointer transition-all hover:shadow-md select-none ${
        isSelected ? 'border-primary-500 shadow-primary-100 ring-2 ring-primary-200' : 'border-gray-200'
      }`}
      style={{
        left: module.position?.x || 0,
        top: module.position?.y || 0,
        width: 280
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl ${
        isSelected ? 'bg-primary-50' : 'bg-gray-50'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isSelected ? 'bg-primary-100' : 'bg-white'
          }`}>
            <Icon className={`w-4 h-4 ${isSelected ? 'text-primary-600' : 'text-gray-500'}`} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{module.displayName || module.name}</h4>
            <p className="text-[10px] text-gray-400">{module.moduleId}</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Entities */}
      <div className="px-4 py-3">
        {module.entities?.length > 0 ? (
          <div className="space-y-1.5">
            {module.entities.slice(0, 5).map((entity, i) => (
              <div key={entity._id || i} className="flex items-center gap-2 text-xs">
                <Database className="w-3 h-3 text-gray-300 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{entity.name || entity.displayName}</span>
                <span className="text-gray-400 ml-auto">{entity.fields?.length || 0} fields</span>
              </div>
            ))}
            {module.entities.length > 5 && (
              <p className="text-[10px] text-gray-400 pl-5">+{module.entities.length - 5} more</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No entities defined</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t bg-gray-50/50 rounded-b-xl">
        <div className="flex items-center justify-between text-[10px] text-gray-400">
          <span>{module.entities?.length || 0} entities</span>
          <span>{module.apis?.length || 0} APIs</span>
          <span>{module.workflows?.length || 0} workflows</span>
        </div>
      </div>
    </div>
  );
}
