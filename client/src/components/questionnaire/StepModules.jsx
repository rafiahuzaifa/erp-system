import React, { useEffect, useState } from 'react';
import { Package, ShoppingCart, Receipt, Users, Calculator, Truck, Car, MapPin, ClipboardList, Handshake, TrendingUp, Warehouse, Sparkles } from 'lucide-react';
import useQuestionnaireStore from '../../store/useQuestionnaireStore';
import * as moduleApi from '../../api/modules';

const iconMap = {
  package: Package, 'shopping-cart': ShoppingCart, receipt: Receipt,
  users: Users, calculator: Calculator, truck: Truck,
  car: Car, 'map-pin': MapPin, 'clipboard-list': ClipboardList,
  handshake: Handshake, 'trending-up': TrendingUp, warehouse: Warehouse
};

export default function StepModules({ projectId }) {
  const { responses, toggleModule, fetchAiSuggestions, aiSuggestions } = useQuestionnaireStore();
  const [catalog, setCatalog] = useState([]);
  const [categories, setCategories] = useState({});

  useEffect(() => {
    moduleApi.getModuleCatalog().then(res => {
      setCatalog(res.data.modules);
      setCategories(res.data.categories);
    });
  }, []);

  const selectedModules = responses.modules.selected || [];

  const modulesByCategory = catalog.reduce((acc, mod) => {
    if (!acc[mod.category]) acc[mod.category] = [];
    acc[mod.category].push(mod);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-semibold text-gray-900">Select Modules</h2>
        <button
          onClick={() => projectId && fetchAiSuggestions(projectId)}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <Sparkles className="w-4 h-4 text-yellow-500" />
          AI Suggest
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        Choose the modules you need. Selected: {selectedModules.length}
      </p>

      {/* AI Suggestions Banner */}
      {aiSuggestions && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-yellow-600" />
            <span className="font-medium text-yellow-800">AI Recommendations</span>
          </div>
          <ul className="text-sm text-yellow-700 space-y-1">
            {aiSuggestions.suggestions?.map((s, i) => (
              <li key={i}>- {s}</li>
            ))}
          </ul>
          {aiSuggestions.reasoning && (
            <p className="text-xs text-yellow-600 mt-2 italic">{aiSuggestions.reasoning}</p>
          )}
        </div>
      )}

      {/* Module Grid by Category */}
      {Object.entries(modulesByCategory).map(([category, modules]) => (
        <div key={category} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {categories[category]?.name || category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {modules.map(mod => {
              const Icon = iconMap[mod.icon] || Package;
              const isSelected = selectedModules.includes(mod.id);

              return (
                <button
                  key={mod.id}
                  onClick={() => toggleModule(mod.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-primary-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-primary-600' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{mod.name}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{mod.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{mod.entityCount} entities: {mod.entities.join(', ')}</p>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
