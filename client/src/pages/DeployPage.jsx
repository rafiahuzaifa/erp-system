import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Square, RotateCcw, Trash2, ExternalLink, Terminal,
  AlertCircle, CheckCircle2, Loader2, Server,
  Monitor, Tablet, Smartphone, RefreshCw,
  ChevronRight, Play, ShieldCheck, Maximize2, Minimize2,
  Zap, Container, Info, WifiOff, Download, FolderOpen
} from 'lucide-react';
import useProjectStore from '../store/useProjectStore';
import useSSE from '../hooks/useSSE';
import { getDeploymentStatus, stopDeployment, restartDeployment, destroyDeployment } from '../api/deployments';
import { downloadProject } from '../api/codegen';
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
  const [downloading, setDownloading] = useState(false);
  const goLiveRef = React.useRef(null);

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

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { data } = await downloadProject(id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(project?.name || 'project').replace(/[^a-z0-9-_]/gi, '-').toLowerCase()}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
    } finally {
      setDownloading(false);
    }
  };

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

      {/* Step progress — always visible, updates dynamically */}
      {(() => {
        const step2done = showPreview || customerApproved;
        const step3done = customerApproved;
        const steps = [
          { n: '✓', label: 'Code Generated', done: true,      active: false },
          { n: '2', label: 'Build Preview',   done: step2done, active: !step2done },
          { n: '3', label: 'Customer Approves', done: step3done, active: step2done && !step3done },
          { n: '4', label: 'Go Live',         done: false,     active: step3done },
        ];
        return (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-sm text-gray-500">
            {steps.map((step, i, arr) => (
              <React.Fragment key={step.n}>
                <div className="flex items-center gap-1.5">
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    step.done   ? 'bg-green-100 text-green-700' :
                    step.active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>{step.done ? '✓' : step.n}</span>
                  <span className={step.done ? 'text-green-700 font-medium' : step.active ? 'text-gray-800 font-medium' : ''}>
                    {step.label}
                  </span>
                </div>
                {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300" />}
              </React.Fragment>
            ))}
          </div>
        );
      })()}

      {/* Launch cards */}
      {canAct && !isBuilding && !showPreview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

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

          {/* Download & Run Locally */}
          <div className="card border-2 border-green-200 hover:border-green-400 transition-colors cursor-pointer group"
            onClick={handleDownload}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 group-hover:bg-green-200 transition-colors flex items-center justify-center shrink-0">
                {downloading ? <Loader2 className="w-6 h-6 text-green-600 animate-spin" /> : <Download className="w-6 h-6 text-green-600" />}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Download & Run Locally</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Download the generated project as a ZIP. Extract and run on any machine with Node.js.
                </p>
                <div className="flex items-center gap-2">
                  <button disabled={downloading} className="btn-primary text-sm flex items-center gap-1.5 bg-green-600 hover:bg-green-700">
                    <Download className="w-3.5 h-3.5" /> {downloading ? 'Downloading...' : 'Download ZIP'}
                  </button>
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                    No Docker needed
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

      {/* Customer approval — shown once preview is ready, until approved */}
      {(showPreview || previewReady) && !customerApproved && (
        <div className="card border-2 border-dashed border-blue-200 bg-blue-50 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> Customer Approval
              </h3>
              <p className="text-sm text-gray-600 max-w-lg">
                Review the preview above. When the customer is satisfied, click <strong>Approve & Go Live</strong>.
              </p>
            </div>
            <button onClick={() => {
              setCustomerApproved(true);
              setTimeout(() => goLiveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
            }} className="btn-primary flex items-center gap-2 shrink-0">
              <ShieldCheck className="w-4 h-4" /> Approve & Go Live
            </button>
          </div>
        </div>
      )}

      {customerApproved && (
        <div ref={goLiveRef} className="space-y-4 mb-4">
          {/* Go Live banner */}
          <div className="card border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-green-800 text-lg">Step 4: Go Live! 🚀</p>
                <p className="text-sm text-green-700 mt-0.5">Project approved — download the ZIP and share it with the customer to run on their machine.</p>
              </div>
              <button onClick={handleDownload} disabled={downloading}
                className="shrink-0 flex items-center gap-2 px-5 py-3 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 shadow-sm">
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {downloading ? 'Preparing...' : 'Download ZIP'}
              </button>
            </div>
          </div>

          {/* Customer setup guide */}
          <div className="card border border-gray-200 p-0 overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div className="flex items-center gap-2 mb-0.5">
                <FolderOpen className="w-5 h-5" />
                <h3 className="font-bold text-lg">Customer Setup Guide</h3>
              </div>
              <p className="text-blue-100 text-sm">Share these steps with your customer so they can run the app on their computer</p>
            </div>

            <div className="p-5 space-y-5">

              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">1</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">Download & Extract the Project</p>
                  <p className="text-sm text-gray-600 mb-2">Click the download button above to get the <code className="bg-gray-100 px-1 rounded font-mono text-xs">{(project?.name || 'project').replace(/[^a-z0-9-_]/gi, '-').toLowerCase()}.zip</code> file.</p>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 space-y-1.5 border border-gray-200">
                    <p>📁 <strong>Windows:</strong> Right-click the ZIP → <em>"Extract All"</em> → choose a folder (e.g. <code className="bg-gray-100 px-1 rounded font-mono text-xs">C:\Projects\my-erp</code>)</p>
                    <p>🍎 <strong>Mac:</strong> Double-click the ZIP to extract automatically</p>
                    <p>🐧 <strong>Linux:</strong> Run <code className="bg-gray-100 px-1 rounded font-mono text-xs">unzip project.zip -d my-erp</code></p>
                  </div>
                </div>
              </div>

              <div className="border-l-2 border-dashed border-gray-200 ml-4 h-4" />

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">2</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">Install Node.js <span className="text-xs font-normal text-gray-500">(skip if already installed)</span></p>
                  <p className="text-sm text-gray-600 mb-2">Node.js is required to run the app. Download version 18 or newer.</p>
                  <a href="https://nodejs.org/en/download" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700">
                    <ExternalLink className="w-4 h-4" /> Download Node.js (nodejs.org)
                  </a>
                  <p className="text-xs text-gray-400 mt-2">✓ To check if installed: open terminal and type <code className="bg-gray-100 px-1 rounded font-mono">node --version</code></p>
                </div>
              </div>

              <div className="border-l-2 border-dashed border-gray-200 ml-4 h-4" />

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">3</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">Install MongoDB <span className="text-xs font-normal text-gray-500">(database)</span></p>
                  <p className="text-sm text-gray-600 mb-2">The app stores its data in MongoDB. Install the Community Edition (free).</p>
                  <a href="https://www.mongodb.com/try/download/community" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700">
                    <ExternalLink className="w-4 h-4" /> Download MongoDB Community
                  </a>
                  <p className="text-xs text-gray-400 mt-2">✓ Install it as a Windows Service so it starts automatically with your PC</p>
                </div>
              </div>

              <div className="border-l-2 border-dashed border-gray-200 ml-4 h-4" />

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">4</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-2">Open Terminal in Project Folder & Run</p>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border border-gray-200 mb-3 space-y-1.5">
                    <p><strong>Windows:</strong> Open the extracted folder → hold <kbd className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">Shift</kbd> + right-click → <em>"Open PowerShell window here"</em></p>
                    <p><strong>Mac/Linux:</strong> Open Terminal → type <code className="bg-gray-100 px-1 rounded font-mono text-xs">cd /path/to/extracted-folder</code></p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm space-y-2">
                    <div className="text-gray-400 text-xs mb-2"># First time setup — run these commands:</div>
                    <div>
                      <span className="text-gray-500"># 1. Install all packages (backend + frontend)</span>
                      <div className="text-green-400 mt-1">npm run setup</div>
                    </div>
                    <div className="mt-3">
                      <span className="text-gray-500"># 2. Build frontend &amp; start the app</span>
                      <div className="text-green-400 mt-1">npm run start:full</div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <span className="text-gray-500"># After first time, just run:</span>
                      <div className="text-blue-400 mt-1">npm run start:full</div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <span className="text-gray-500"># You will see:</span>
                      <div className="text-blue-400 mt-1">Server running on http://localhost:3000</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">⏳ First build takes 1–2 minutes — frontend is being compiled</p>
                </div>
              </div>

              <div className="border-l-2 border-dashed border-gray-200 ml-4 h-4" />

              {/* Step 5 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">5</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">Open the App in Browser</p>
                  <p className="text-sm text-gray-600 mb-2">Once the server starts, open your browser and go to:</p>
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                    <code className="text-green-700 font-mono font-bold text-base">http://localhost:3000</code>
                    <span className="text-green-600 text-sm ml-auto">🎉 Your ERP is ready!</span>
                  </div>
                </div>
              </div>

              {/* Troubleshooting */}
              <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="font-semibold text-amber-800 text-sm mb-2">⚠️ Common Issues</p>
                <ul className="text-sm text-amber-700 space-y-1.5">
                  <li>• <strong>Port 3000 already in use:</strong> Open <code className="bg-amber-100 px-1 rounded font-mono text-xs">.env</code> file in the project, change <code className="bg-amber-100 px-1 rounded font-mono text-xs">PORT=3000</code> to <code className="bg-amber-100 px-1 rounded font-mono text-xs">PORT=3001</code></li>
                  <li>• <strong>MongoDB error:</strong> Make sure MongoDB service is running. Search for <em>"Services"</em> in Windows, find MongoDB, click Start</li>
                  <li>• <strong>npm not found:</strong> Node.js was not installed correctly — reinstall from nodejs.org and restart your terminal</li>
                </ul>
              </div>

            </div>

            {/* Bottom download CTA */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-4">
              <p className="text-sm text-gray-600">Ready to hand off? Download the project ZIP for the customer.</p>
              <button onClick={handleDownload} disabled={downloading}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shrink-0">
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {downloading ? 'Preparing ZIP...' : 'Download Project ZIP'}
              </button>
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
