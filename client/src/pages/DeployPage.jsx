import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Square, RotateCcw, Trash2, ExternalLink, Terminal,
  AlertCircle, CheckCircle2, Loader2, Server,
  Monitor, Tablet, Smartphone, RefreshCw,
  ChevronRight, Play, ShieldCheck, Maximize2, Minimize2,
  Zap, Container, Info, WifiOff
} from 'lucide-react';
import useProjectStore from '../store/useProjectStore';
import useSSE from '../hooks/useSSE';
import { getDeploymentStatus, stopDeployment, restartDeployment, destroyDeployment } from '../api/deployments';
import { apiUrl } from '../api/config';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DEVICES = [
  { key: 'desktop', label: 'Desktop', icon: Monitor,    width: '100%',  frameHeight: '640px' },
  { key: 'tablet',  label: 'Tablet',  icon: Tablet,     width: '768px', frameHeight: '1024px' },
  { key: 'mobile',  label: 'Mobile',  icon: Smartphone, width: '390px', frameHeight: '844px' },
];

// Detect serverless/cloud environment from the URL
const IS_CLOUD = typeof window !== 'undefined' && (
  window.location.hostname.includes('vercel.app') ||
  window.location.hostname.includes('netlify.app') ||
  window.location.hostname.includes('railway.app')
);

export default function DeployPage() {
  const { id } = useParams();
  const { currentProject: project, fetchProject } = useProjectStore();
  const [deployment, setDeployment]       = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Preview state
  const [previewMode, setPreviewMode]     = useState(null); // null | 'quick' | 'docker'
  const [previewReady, setPreviewReady]   = useState(false);
  const [device, setDevice]               = useState('desktop');
  const [iframeKey, setIframeKey]         = useState(0);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [fullscreen, setFullscreen]       = useState(false);
  const [customerApproved, setCustomerApproved] = useState(false);
  const [dockerBlocked, setDockerBlocked] = useState(false); // true when serverless error detected

  const quickPreviewSSE = useSSE(apiUrl(`/api/preview/${id}`));
  const dockerSSE       = useSSE(apiUrl(`/api/deployments/${id}`));
  const logSSE          = useSSE(apiUrl(`/api/deployments/${id}/logs`));

  useEffect(() => {
    fetchProject(id);
    loadDeployment();
  }, [id]);

  // Quick preview complete → show iframe
  useEffect(() => {
    if (quickPreviewSSE.status === 'complete') {
      const last = quickPreviewSSE.events[quickPreviewSSE.events.length - 1];
      if (last?.type === 'complete') {
        setPreviewReady(true);
        setIframeKey(k => k + 1);
        setIframeLoading(true);
      }
    }
  }, [quickPreviewSSE.status, quickPreviewSSE.events]);

  // Docker deploy complete → refresh status
  useEffect(() => {
    if (dockerSSE.status === 'complete') {
      fetchProject(id);
      loadDeployment();
    }
    // Detect serverless blocked error
    if (dockerSSE.status === 'error') {
      const msg = dockerSSE.error || '';
      if (msg.toLowerCase().includes('serverless') || msg.toLowerCase().includes('docker desktop')) {
        setDockerBlocked(true);
      }
    }
  }, [dockerSSE.status, dockerSSE.error]);

  const loadDeployment = async () => {
    try {
      const { data } = await getDeploymentStatus(id);
      setDeployment(data.deployment);
    } catch {
      // no deployment yet
    } finally {
      setInitialLoading(false);
    }
  };

  const handleLaunchQuickPreview = useCallback(() => {
    setPreviewMode('quick');
    setPreviewReady(false);
    quickPreviewSSE.connect();
  }, [quickPreviewSSE]);

  const handleLaunchDocker = useCallback(() => {
    setPreviewMode('docker');
    setDockerBlocked(false);
    dockerSSE.connect();
  }, [dockerSSE]);

  const handleAction = async (action) => {
    setActionLoading(action);
    try {
      if (action === 'stop')    await stopDeployment(id);
      if (action === 'restart') { await restartDeployment(id); setIframeKey(k => k + 1); setIframeLoading(true); }
      if (action === 'destroy') { await destroyDeployment(id); setPreviewMode(null); setCustomerApproved(false); }
      await fetchProject(id);
      await loadDeployment();
    } finally {
      setActionLoading(null);
    }
  };

  const isQuickBuilding  = previewMode === 'quick'  && (quickPreviewSSE.status === 'connecting' || quickPreviewSSE.status === 'connected');
  const isDockerDeploying = previewMode === 'docker' && (dockerSSE.status === 'connecting' || dockerSSE.status === 'connected');
  const isBuilding = isQuickBuilding || isDockerDeploying;

  const isDockerRunning = deployment?.status === 'running';
  const isDockerStopped = deployment?.status === 'stopped';
  const isDockerFailed  = deployment?.status === 'failed';
  const canAct = project?.status === 'generated' || project?.status === 'deployed' ||
                 isDockerStopped || isDockerFailed || project?.status === 'failed';

  const quickPreviewUrl = previewReady ? apiUrl(`/api/preview/${id}/`) : null;
  const dockerPreviewUrl = isDockerRunning ? apiUrl(`/api/deployments/${id}/preview/`) : null;
  const previewUrl = previewMode === 'quick' ? quickPreviewUrl : dockerPreviewUrl;

  const activeSSE = previewMode === 'quick' ? quickPreviewSSE : dockerSSE;
  const currentDevice = DEVICES.find(d => d.key === device);
  const showPreview = (previewMode === 'quick' && previewReady) || (previewMode === 'docker' && isDockerRunning);

  if (initialLoading) return <LoadingSpinner className="py-20" />;

  return (
    <div className={`flex flex-col ${fullscreen ? 'fixed inset-0 z-50 bg-white p-4 overflow-auto' : 'max-w-6xl mx-auto'}`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Preview & Deploy</h1>
          <p className="text-gray-500 text-sm mt-0.5">{project?.name || 'Project'}</p>
        </div>
        {isBuilding && (
          <span className="flex items-center gap-2 text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-full">
            <Loader2 className="w-4 h-4 animate-spin" />
            {isQuickBuilding ? 'Building preview...' : 'Deploying container...'}
          </span>
        )}
      </div>

      {/* Step progress */}
      {!previewMode && !isDockerRunning && (
        <div className="flex flex-wrap items-center gap-2 mb-6 text-sm text-gray-500">
          {[
            { n: '✓', label: 'Code Generated', done: true },
            { n: '2', label: 'Build Preview',  active: true },
            { n: '3', label: 'Customer Approves' },
            { n: '4', label: 'Go Live' },
          ].map((step, i, arr) => (
            <React.Fragment key={step.n}>
              <div className="flex items-center gap-1.5">
                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  step.done   ? 'bg-green-100 text-green-700' :
                  step.active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>{step.n}</span>
                <span className={step.done ? 'text-green-700 font-medium' : step.active ? 'text-gray-800 font-medium' : ''}>
                  {step.label}
                </span>
              </div>
              {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Launch cards */}
      {canAct && !isBuilding && !showPreview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

          {/* Quick Preview */}
          <div
            className="card border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer group"
            onClick={handleLaunchQuickPreview}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Quick UI Preview</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Instantly shows a live preview of the generated ERP UI — no build required. Works everywhere.
                </p>
                <div className="flex items-center gap-2">
                  <button className="btn-primary text-sm flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Build UI Preview
                  </button>
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                    ✓ Works on Vercel
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Docker Deploy */}
          <div
            className={`card border-2 transition-colors ${IS_CLOUD ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-75' : 'border-gray-200 hover:border-gray-400 cursor-pointer group'}`}
            onClick={IS_CLOUD ? undefined : handleLaunchDocker}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${IS_CLOUD ? 'bg-gray-100' : 'bg-gray-100 group-hover:bg-gray-200 transition-colors'}`}>
                <Container className={`w-6 h-6 ${IS_CLOUD ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${IS_CLOUD ? 'text-gray-400' : 'text-gray-900'}`}>Full Docker Deploy</h3>
                <p className={`text-sm mb-3 ${IS_CLOUD ? 'text-gray-400' : 'text-gray-500'}`}>
                  Builds and runs the complete app (frontend + backend) in Docker.
                </p>
                {IS_CLOUD ? (
                  <div className="flex items-center gap-1.5 text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                    <WifiOff className="w-4 h-4 shrink-0" />
                    <span>Run locally with Docker Desktop to use this feature</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button className="btn-secondary text-sm flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5" /> Deploy with Docker
                    </button>
                    <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                      Local only
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cloud docker notice (shown after clicking the button if not IS_CLOUD but still got blocked) */}
      {dockerBlocked && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Docker Deploy — Local Setup Required</p>
            <p className="text-sm text-amber-700 mt-1">
              Docker deployment requires a persistent server with Docker Desktop installed.
              This feature is not available in the cloud (Vercel).
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Run <code className="bg-amber-100 px-1 rounded font-mono">npm run dev</code> locally
              with Docker Desktop running to use full deployment.
            </p>
          </div>
        </div>
      )}

      {/* Rebuild/switch controls when active */}
      {(showPreview || isBuilding) && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button onClick={handleLaunchQuickPreview} disabled={isBuilding}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50">
            <Zap className="w-3.5 h-3.5" /> Rebuild Preview
          </button>
          {!IS_CLOUD && (
            <button onClick={handleLaunchDocker} disabled={isBuilding}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50">
              <Container className="w-3.5 h-3.5" /> Full Deploy
            </button>
          )}
          {isDockerRunning && (
            <>
              <button onClick={() => handleAction('stop')} disabled={!!actionLoading}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                {actionLoading === 'stop' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3" />} Stop
              </button>
              <button onClick={() => handleAction('restart')} disabled={!!actionLoading}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200">
                {actionLoading === 'restart' ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />} Restart
              </button>
            </>
          )}
        </div>
      )}

      {/* Build log */}
      {activeSSE.events.length > 0 && (
        <div className="card mb-4 p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-gray-50 text-sm font-semibold text-gray-700">
            {isBuilding
              ? <><Loader2 className="w-4 h-4 text-blue-500 animate-spin" /> Building...</>
              : activeSSE.status === 'complete'
              ? <><CheckCircle2 className="w-4 h-4 text-green-500" /> Build complete</>
              : <><AlertCircle className="w-4 h-4 text-red-500" /> Build failed</>}
          </div>
          <div className="p-3 max-h-44 overflow-y-auto space-y-0.5 font-mono text-xs bg-gray-950">
            {activeSSE.events.map((evt, i) => (
              <div key={i} className={`${
                evt.type === 'error'    ? 'text-red-400' :
                evt.type === 'complete' ? 'text-green-400' :
                evt.type === 'status'   ? 'text-blue-400' : 'text-gray-300'
              }`}>
                {evt.data.message || evt.data.log || JSON.stringify(evt.data)}
              </div>
            ))}
          </div>
          {activeSSE.status === 'error' && !dockerBlocked && (
            <div className="px-4 py-2.5 bg-red-50 border-t border-red-200 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {activeSSE.error || 'Build failed. Check the log above.'}
            </div>
          )}
        </div>
      )}

      {/* Docker running status */}
      {isDockerRunning && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-sm font-medium text-green-800">App running · port {deployment.port}</span>
          </div>
          <a href={`http://localhost:${deployment.port}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900">
            <ExternalLink className="w-3 h-3" /> Open directly
          </a>
        </div>
      )}

      {/* Docker error */}
      {isDockerFailed && deployment?.errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{deployment.errorMessage}</p>
        </div>
      )}

      {/* ── PREVIEW IFRAME ── */}
      {showPreview && previewUrl && (
        <div className={`card p-0 overflow-hidden mb-4 ${fullscreen ? 'flex flex-col flex-1' : ''}`}>
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-gray-50">
            <div className="flex items-center gap-0.5 bg-white border rounded-lg p-0.5">
              {DEVICES.map(d => (
                <button key={d.key} onClick={() => { setDevice(d.key); setIframeLoading(true); }} title={d.label}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    device === d.key ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  <d.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{d.label}</span>
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-gray-400 text-xs font-mono bg-white border rounded-lg px-3 py-1.5 max-w-xs truncate">
              <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
              {previewMode === 'quick' ? 'UI Preview (static)' : `Docker · port ${deployment?.port}`}
            </div>

            <div className="flex items-center gap-1">
              <button onClick={() => { setIframeKey(k => k + 1); setIframeLoading(true); }} title="Refresh"
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={() => setFullscreen(v => !v)} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors">
                {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* iframe */}
          <div
            className="relative bg-gray-200 overflow-auto flex items-center justify-center"
            style={{ height: fullscreen ? 'calc(100vh - 260px)' : '640px', padding: device !== 'desktop' ? '20px' : 0 }}
          >
            {iframeLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <p className="text-sm text-gray-500">Loading preview...</p>
                </div>
              </div>
            )}
            <div style={{
              width: currentDevice.width,
              height: device !== 'desktop' ? currentDevice.frameHeight : '100%',
              maxWidth: '100%', maxHeight: '100%',
              boxShadow: device !== 'desktop' ? '0 12px 48px rgba(0,0,0,0.3)' : 'none',
              borderRadius: device !== 'desktop' ? '16px' : 0,
              overflow: 'hidden', background: '#fff',
              flex: device === 'desktop' ? '1' : undefined,
              alignSelf: device === 'desktop' ? 'stretch' : undefined,
            }}>
              <iframe
                key={iframeKey}
                src={previewUrl}
                title="App Preview"
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                onLoad={() => setIframeLoading(false)}
                onError={() => setIframeLoading(false)}
                allow="forms"
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
            </div>
          </div>
        </div>
      )}

      {/* Customer approval */}
      {showPreview && previewUrl && !customerApproved && (
        <div className="card border-2 border-dashed border-blue-200 bg-blue-50 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> Customer Approval
              </h3>
              <p className="text-sm text-gray-600 max-w-lg">
                Review the preview above. When the customer is satisfied, click <strong>Approve & Finalize</strong>.
              </p>
            </div>
            <button onClick={() => setCustomerApproved(true)} className="btn-primary flex items-center gap-2 shrink-0">
              <ShieldCheck className="w-4 h-4" /> Approve & Finalize
            </button>
          </div>
        </div>
      )}

      {customerApproved && (
        <div className="card border border-green-200 bg-green-50 mb-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-800">Project Approved!</p>
              <p className="text-sm text-green-700">Customer has confirmed this build is ready.</p>
            </div>
          </div>
        </div>
      )}

      {/* Container logs */}
      {logSSE.events.length > 0 && (
        <div className="card mb-4 p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Terminal className="w-4 h-4" /> Container Logs
            </h2>
            <button onClick={logSSE.disconnect} className="text-xs text-gray-500 hover:text-gray-700">Stop</button>
          </div>
          <div className="bg-gray-950 p-4 max-h-48 overflow-y-auto font-mono text-xs text-green-400 leading-relaxed">
            {logSSE.events.map((evt, i) => (
              <div key={i}>{evt.data.log || evt.data.message || JSON.stringify(evt.data)}</div>
            ))}
          </div>
        </div>
      )}

      {/* Stopped / failed docker */}
      {(isDockerStopped || isDockerFailed) && (
        <div className="card flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDockerFailed ? 'bg-red-100' : 'bg-yellow-100'}`}>
            <Server className={`w-5 h-5 ${isDockerFailed ? 'text-red-500' : 'text-yellow-600'}`} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 capitalize">{deployment?.status}</p>
            <p className="text-sm text-gray-500">Port {deployment?.port}</p>
          </div>
          <button onClick={() => handleAction('destroy')} disabled={!!actionLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-red-50 text-red-700 hover:bg-red-100">
            {actionLoading === 'destroy' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
