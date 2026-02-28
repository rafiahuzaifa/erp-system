import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Rocket, Square, RotateCcw, Trash2, ExternalLink, Terminal, AlertCircle, CheckCircle2, Loader2, Server, Wifi, WifiOff } from 'lucide-react';
import useProjectStore from '../store/useProjectStore';
import useSSE from '../hooks/useSSE';
import { getDeploymentStatus, stopDeployment, restartDeployment, destroyDeployment } from '../api/deployments';
import { apiUrl } from '../api/config';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function DeployPage() {
  const { id } = useParams();
  const { currentProject: project, fetchProject } = useProjectStore();
  const [deployment, setDeployment] = useState(null);
  const [container, setContainer] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const { events, status: sseStatus, error: sseError, connect } = useSSE(
    apiUrl(`/api/deployments/${id}`)
  );

  const logSSE = useSSE(apiUrl(`/api/deployments/${id}/logs`), { method: 'GET' });

  useEffect(() => {
    fetchProject(id);
    loadDeployment();
  }, [id]);

  const loadDeployment = async () => {
    try {
      const { data } = await getDeploymentStatus(id);
      setDeployment(data.deployment);
      setContainer(data.container);
    } catch (err) {
      // No deployment yet
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (sseStatus === 'complete') {
      fetchProject(id);
      loadDeployment();
    }
  }, [sseStatus]);

  const handleDeploy = () => {
    connect();
  };

  const handleAction = async (action, label) => {
    setActionLoading(label);
    try {
      if (action === 'stop') await stopDeployment(id);
      else if (action === 'restart') await restartDeployment(id);
      else if (action === 'destroy') await destroyDeployment(id);
      await fetchProject(id);
      await loadDeployment();
    } catch (err) {
      // handled
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewLogs = () => {
    logSSE.connect();
  };

  const isDeploying = sseStatus === 'connecting' || sseStatus === 'connected';
  const isRunning = deployment?.status === 'running';
  const isStopped = deployment?.status === 'stopped';
  const isFailed = deployment?.status === 'failed';
  const canDeploy = project?.status === 'generated' || project?.status === 'deployed' || isStopped || isFailed;

  if (initialLoading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deployment</h1>
          <p className="text-gray-500">{project?.name || 'Project'}</p>
        </div>
        {canDeploy && !isDeploying && (
          <button onClick={handleDeploy} className="btn-primary flex items-center gap-2">
            <Rocket className="w-4 h-4" /> {deployment ? 'Redeploy' : 'Deploy'}
          </button>
        )}
      </div>

      {/* Deployment Status Card */}
      {deployment && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isRunning ? 'bg-green-100' : isStopped ? 'bg-yellow-100' : isFailed ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <Server className={`w-5 h-5 ${
                  isRunning ? 'text-green-600' : isStopped ? 'text-yellow-600' : isFailed ? 'text-red-600' : 'text-gray-400'
                }`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">Container</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    isRunning ? 'bg-green-100 text-green-700' :
                    isStopped ? 'bg-yellow-100 text-yellow-700' :
                    isFailed ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {deployment.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 font-mono">{deployment.containerId?.slice(0, 12) || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {isRunning ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-gray-400" />}
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <span className="text-gray-500">Port:</span>
              <span className="ml-2 font-medium">{deployment.port || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <span className="ml-2 font-medium capitalize">{deployment.status}</span>
            </div>
            <div>
              <span className="text-gray-500">Deployed:</span>
              <span className="ml-2 font-medium">
                {deployment.deployedAt ? new Date(deployment.deployedAt).toLocaleString() : 'Never'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Health:</span>
              <span className="ml-2 font-medium">{deployment.healthCheckUrl ? 'Configured' : 'N/A'}</span>
            </div>
          </div>

          {/* App URL */}
          {isRunning && deployment.port && (
            <div className="p-3 bg-green-50 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700 font-medium">Application is running</span>
                <a
                  href={`http://localhost:${deployment.port}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-green-700 hover:text-green-800 font-medium"
                >
                  Open http://localhost:{deployment.port} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Error */}
          {isFailed && deployment.errorMessage && (
            <div className="p-3 bg-red-50 rounded-lg mb-4 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{deployment.errorMessage}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t">
            {isRunning && (
              <>
                <button
                  onClick={() => handleAction('stop', 'stop')}
                  disabled={!!actionLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors"
                >
                  {actionLoading === 'stop' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Square className="w-3.5 h-3.5" />}
                  Stop
                </button>
                <button
                  onClick={() => handleAction('restart', 'restart')}
                  disabled={!!actionLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  {actionLoading === 'restart' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  Restart
                </button>
                <button
                  onClick={handleViewLogs}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5" /> Logs
                </button>
              </>
            )}
            {(isStopped || isFailed) && (
              <button
                onClick={() => handleAction('destroy', 'destroy')}
                disabled={!!actionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
              >
                {actionLoading === 'destroy' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Destroy
              </button>
            )}
          </div>
        </div>
      )}

      {/* Deploy Progress */}
      {(isDeploying || sseStatus === 'complete' || sseStatus === 'error') && events.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Deployment Progress</h2>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {events.map((evt, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {evt.type === 'status' && <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
                {evt.type === 'build-log' && <Terminal className="w-3.5 h-3.5 text-gray-400" />}
                {evt.type === 'complete' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                {evt.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                <span className="text-gray-600 font-mono text-xs">
                  {evt.data.message || evt.data.log || JSON.stringify(evt.data)}
                </span>
              </div>
            ))}
          </div>
          {sseStatus === 'complete' && (
            <div className="mt-3 pt-3 border-t flex items-center gap-2 text-green-600 font-medium text-sm">
              <CheckCircle2 className="w-4 h-4" /> Deployment successful
              {events.find(e => e.type === 'complete')?.data?.port && (
                <span> - Running on port {events.find(e => e.type === 'complete').data.port}</span>
              )}
            </div>
          )}
          {sseStatus === 'error' && (
            <div className="mt-3 pt-3 border-t flex items-center gap-2 text-red-600 font-medium text-sm">
              <AlertCircle className="w-4 h-4" /> {sseError || 'Deployment failed'}
            </div>
          )}
        </div>
      )}

      {/* Container Logs */}
      {logSSE.events.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Container Logs</h2>
            <button onClick={logSSE.disconnect} className="text-xs text-gray-500 hover:text-gray-700">
              Stop streaming
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs text-green-400">
            {logSSE.events.map((evt, i) => (
              <div key={i}>{evt.data.log || evt.data.message || JSON.stringify(evt.data)}</div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!deployment && !isDeploying && events.length === 0 && (
        <div className="card text-center py-16">
          <Rocket className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Ready to Deploy</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {project?.status === 'generated'
              ? 'Your code has been generated. Deploy it as a Docker container with one click.'
              : 'Generate your code first, then come back here to deploy.'}
          </p>
          {canDeploy && (
            <button onClick={handleDeploy} className="btn-primary inline-flex items-center gap-2">
              <Rocket className="w-4 h-4" /> Deploy Now
            </button>
          )}
        </div>
      )}
    </div>
  );
}
