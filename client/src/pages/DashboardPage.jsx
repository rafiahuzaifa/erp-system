import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowRight, Building2, Truck, Link, Settings, Clock } from 'lucide-react';
import useProjectStore from '../store/useProjectStore';
import LoadingSpinner from '../components/common/LoadingSpinner';

const industryIcons = {
  erp: Building2,
  logistics: Truck,
  supply_chain: Link,
  custom: Settings
};

const statusColors = {
  questionnaire: 'bg-yellow-100 text-yellow-800',
  designing: 'bg-blue-100 text-blue-800',
  generating: 'bg-purple-100 text-purple-800',
  generated: 'bg-green-100 text-green-800',
  deploying: 'bg-orange-100 text-orange-800',
  deployed: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800'
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { projects, loading, fetchProjects, deleteProject } = useProjectStore();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteProject(id);
      setDeleteConfirm(null);
    } catch { /* handled by store */ }
  };

  const getProjectLink = (project) => {
    switch (project.status) {
      case 'questionnaire': return `/projects/new?id=${project._id}`;
      case 'designing': return `/projects/${project._id}/builder`;
      case 'generating': return `/projects/${project._id}/codegen`;
      case 'generated': return `/projects/${project._id}/codegen`;
      case 'deploying': return `/projects/${project._id}/deploy`;
      case 'deployed': return `/projects/${project._id}/deploy`;
      default: return `/projects/${project._id}`;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-500 mt-1">Build and deploy custom business applications</p>
        </div>
        <button
          onClick={() => navigate('/projects/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Projects', value: projects.length, color: 'text-primary-600' },
          { label: 'In Progress', value: projects.filter(p => ['questionnaire', 'designing', 'generating'].includes(p.status)).length, color: 'text-blue-600' },
          { label: 'Generated', value: projects.filter(p => p.status === 'generated').length, color: 'text-green-600' },
          { label: 'Deployed', value: projects.filter(p => p.status === 'deployed').length, color: 'text-emerald-600' }
        ].map(stat => (
          <div key={stat.label} className="card">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Project List */}
      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : projects.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-6">Create your first project to get started building custom applications.</p>
          <button onClick={() => navigate('/projects/new')} className="btn-primary">
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => {
            const Icon = industryIcons[project.industry] || Settings;
            return (
              <div key={project._id} className="card hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[project.status] || 'bg-gray-100 text-gray-600'}`}>
                        {project.status}
                      </span>
                    </div>
                  </div>

                  {deleteConfirm === project._id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(project._id)}
                        className="text-xs px-2 py-1 bg-red-600 text-white rounded"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-xs px-2 py-1 bg-gray-200 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(project._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>

                {project.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{project.description}</p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-3 border-t">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => navigate(getProjectLink(project))}
                    className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Continue <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
