import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowRight, Building2, Truck, Link as LinkIcon, Settings, Clock, LayoutDashboard } from 'lucide-react';
import useProjectStore from '../store/useProjectStore';
import LoadingSpinner from '../components/common/LoadingSpinner';

const industryIcons = {
  erp: Building2, logistics: Truck, supply_chain: LinkIcon, custom: Settings
};

const statusConfig = {
  questionnaire: { color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-400',   label: 'In Progress' },
  designing:     { color: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-400',    label: 'Designing' },
  generating:    { color: 'bg-violet-100 text-violet-700',  dot: 'bg-violet-400',  label: 'Generating' },
  generated:     { color: 'bg-green-100 text-green-700',    dot: 'bg-green-400',   label: 'Generated' },
  deploying:     { color: 'bg-orange-100 text-orange-700',  dot: 'bg-orange-400',  label: 'Deploying' },
  deployed:      { color: 'bg-emerald-100 text-emerald-700',dot: 'bg-emerald-400', label: 'Live' },
  failed:        { color: 'bg-red-100 text-red-700',        dot: 'bg-red-400',     label: 'Failed' },
};

const industryGradients = {
  erp:          'from-indigo-500 to-violet-600',
  logistics:    'from-cyan-500 to-blue-600',
  supply_chain: 'from-emerald-500 to-teal-600',
  custom:       'from-amber-500 to-orange-600',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { projects, loading, fetchProjects, deleteProject } = useProjectStore();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = async (id) => {
    try { await deleteProject(id); setDeleteConfirm(null); } catch {}
  };

  const getProjectLink = (project) => {
    switch (project.status) {
      case 'questionnaire': return `/projects/new?id=${project._id}`;
      case 'designing':     return `/projects/${project._id}/builder`;
      case 'generating':    return `/projects/${project._id}/codegen`;
      case 'generated':     return `/projects/${project._id}/codegen`;
      case 'deploying':     return `/projects/${project._id}/deploy`;
      case 'deployed':      return `/projects/${project._id}/deploy`;
      default:              return `/projects/${project._id}`;
    }
  };

  const statsData = [
    { label: 'Total Projects', value: projects.length,
      sub: 'All time', gradient: 'from-indigo-500 to-violet-600', icon: LayoutDashboard },
    { label: 'In Progress', value: projects.filter(p => ['questionnaire','designing','generating'].includes(p.status)).length,
      sub: 'Being built', gradient: 'from-blue-500 to-cyan-600', icon: Settings },
    { label: 'Generated', value: projects.filter(p => p.status === 'generated').length,
      sub: 'Ready to deploy', gradient: 'from-violet-500 to-purple-600', icon: Building2 },
    { label: 'Deployed', value: projects.filter(p => p.status === 'deployed').length,
      sub: 'Live systems', gradient: 'from-emerald-500 to-teal-600', icon: Truck },
  ];

  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Projects</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Build and deploy custom business applications</p>
        </div>
        <button onClick={() => navigate('/projects/new')} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsData.map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className={`h-1.5 bg-gradient-to-r ${stat.gradient}`} />
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center opacity-90`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Projects */}
      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20 px-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-200">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">Create your first project and get a fully working management system in minutes.</p>
          <button onClick={() => navigate('/projects/new')} className="btn-primary">
            Create Your First Project
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">All Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map(project => {
              const Icon = industryIcons[project.industry] || Settings;
              const gradient = industryGradients[project.industry] || 'from-gray-500 to-slate-600';
              const status = statusConfig[project.status] || { color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400', label: project.status };
              return (
                <div key={project._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all duration-200 overflow-hidden group">
                  {/* Card gradient strip */}
                  <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 truncate">{project.name}</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            <span className="text-xs text-gray-500 font-medium">{status.label}</span>
                          </div>
                        </div>
                      </div>

                      {deleteConfirm === project._id ? (
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => handleDelete(project._id)}
                            className="text-xs px-2.5 py-1.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">
                            Delete
                          </button>
                          <button onClick={() => setDeleteConfirm(null)}
                            className="text-xs px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(project._id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 transition-all flex-shrink-0">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>

                    {project.description && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">{project.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <button onClick={() => navigate(getProjectLink(project))}
                        className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-semibold group/btn">
                        Continue
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
