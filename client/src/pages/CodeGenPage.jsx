import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, RefreshCw, FileCode, FolderTree, ChevronRight, ChevronDown, Rocket, AlertCircle, CheckCircle2, Loader2, Download } from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';
import useProjectStore from '../store/useProjectStore';
import useSSE from '../hooks/useSSE';
import { getCodegenStatus, listFiles, getFile, downloadProject } from '../api/codegen';
import { apiUrl } from '../api/config';
import LoadingSpinner from '../components/common/LoadingSpinner';

function FileTreeNode({ node, onSelect, selectedPath, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth < 2);

  if (node.type === 'file') {
    return (
      <button
        onClick={() => onSelect(node.path)}
        className={`w-full text-left px-2 py-1 text-sm flex items-center gap-1.5 rounded hover:bg-gray-100 ${
          selectedPath === node.path ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <FileCode className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
        <span className="truncate">{node.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-2 py-1 text-sm flex items-center gap-1.5 rounded hover:bg-gray-100 text-gray-800 font-medium"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        <FolderTree className="w-3.5 h-3.5 text-amber-500" />
        <span>{node.name}</span>
      </button>
      {expanded && node.children?.map((child, i) => (
        <FileTreeNode key={child.path || child.name + i} node={child} onSelect={onSelect} selectedPath={selectedPath} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function CodeGenPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProject: project, fetchProject } = useProjectStore();
  const [genStatus, setGenStatus] = useState(null);
  const [fileTree, setFileTree] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const { events, status: sseStatus, error: sseError, connect } = useSSE(
    apiUrl(`/api/codegen/${id}/generate`)
  );

  useEffect(() => {
    fetchProject(id);
    loadStatus();
  }, [id]);

  const loadStatus = async () => {
    try {
      const { data } = await getCodegenStatus(id);
      setGenStatus(data);
      // Load files if code generation is complete, regardless of project.status
      // (project.status can revert to 'designing' when user edits modules)
      if (data.codeGeneration?.status === 'complete') {
        await loadFiles();
      }
    } catch (err) {
      // No code generated yet
    } finally {
      setInitialLoading(false);
    }
  };

  const loadFiles = async () => {
    try {
      const { data } = await listFiles(id);
      setFileTree(data.tree);
      setFileList(data.files);
    } catch (err) {
      // ignore
    }
  };

  const handleSelectFile = async (filePath) => {
    setLoadingFile(true);
    setSelectedFile(filePath);
    try {
      const { data } = await getFile(id, filePath);
      setFileContent(data);
    } catch (err) {
      setFileContent({ content: '// Error loading file', language: 'javascript' });
    } finally {
      setLoadingFile(false);
    }
  };

  const handleGenerate = () => {
    connect();
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { data } = await downloadProject(id);
      const url = URL.createObjectURL(new Blob([data], { type: 'application/zip' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project?.name || 'app'}-generated.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (sseStatus === 'complete') {
      fetchProject(id);
      loadStatus();
      loadFiles();
    }
  }, [sseStatus]);

  const progressEvents = events.filter(e => e.type === 'phase' || e.type === 'file' || e.type === 'status');
  const latestEvent = events[events.length - 1];
  const isGenerating = sseStatus === 'connecting' || sseStatus === 'connected';
  // isGenerated: true if there is completed code OR project status is generated/deployed
  const isGenerated =
    genStatus?.codeGeneration?.status === 'complete' ||
    project?.status === 'generated' ||
    project?.status === 'deployed';

  if (initialLoading) return <LoadingSpinner className="py-20" />;

  const langMap = {
    javascript: 'jsx', json: 'json', yaml: 'yaml', dockerfile: 'docker',
    markdown: 'markdown', css: 'css', html: 'markup', typescript: 'typescript',
    python: 'python', sql: 'sql', bash: 'bash', env: 'bash', text: 'bash',
    jsx: 'jsx', tsx: 'tsx', scss: 'css', xml: 'markup', handlebars: 'markup'
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Code Generation</h1>
          <p className="text-gray-500">{project?.name || 'Project'}</p>
        </div>
        <div className="flex gap-3">
          {isGenerated && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {downloading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Downloading...</>
              ) : (
                <><Download className="w-4 h-4" /> Download ZIP</>
              )}
            </button>
          )}
          {isGenerated && (
            <button
              onClick={() => navigate(`/projects/${id}/deploy`)}
              className="btn-primary flex items-center gap-2"
            >
              <Rocket className="w-4 h-4" /> Deploy
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isGenerating
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isGenerated
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : isGenerated ? (
              <><RefreshCw className="w-4 h-4" /> Regenerate</>
            ) : (
              <><Play className="w-4 h-4" /> Generate Code</>
            )}
          </button>
        </div>
      </div>

      {/* Generation Progress */}
      {(isGenerating || sseStatus === 'complete' || sseStatus === 'error') && events.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Generation Progress</h2>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {progressEvents.map((evt, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {evt.type === 'status' && evt.data.status === 'generating' && (
                  <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                )}
                {evt.type === 'phase' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                {evt.type === 'file' && <FileCode className="w-3.5 h-3.5 text-gray-400" />}
                <span className="text-gray-600">{evt.data.message || evt.data.path || evt.data.phase}</span>
              </div>
            ))}
          </div>
          {sseStatus === 'complete' && (
            <div className="mt-3 pt-3 border-t flex items-center gap-2 text-green-600 font-medium text-sm">
              <CheckCircle2 className="w-4 h-4" /> Generation complete - {latestEvent?.data?.totalFiles || fileList.length} files generated
            </div>
          )}
          {sseStatus === 'error' && (
            <div className="mt-3 pt-3 border-t flex items-center gap-2 text-red-600 font-medium text-sm">
              <AlertCircle className="w-4 h-4" /> {sseError || 'Generation failed'}
            </div>
          )}
        </div>
      )}

      {/* File Browser */}
      {isGenerated && fileTree && (
        <div className="grid grid-cols-12 gap-4" style={{ height: 'calc(100vh - 280px)' }}>
          {/* File Tree */}
          <div className="col-span-3 card overflow-y-auto p-2">
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Files ({fileList.length})
            </div>
            {fileTree.children?.map((child, i) => (
              <FileTreeNode key={child.name + i} node={child} onSelect={handleSelectFile} selectedPath={selectedFile} />
            ))}
          </div>

          {/* Code Viewer */}
          <div className="col-span-9 card overflow-hidden flex flex-col p-0">
            {selectedFile ? (
              <>
                <div className="px-4 py-2 bg-gray-50 border-b text-sm font-mono text-gray-600">
                  {selectedFile}
                </div>
                <div className="flex-1 overflow-auto">
                  {loadingFile ? (
                    <LoadingSpinner className="py-10" />
                  ) : fileContent ? (
                    <Highlight theme={themes.vsLight} code={fileContent.content || ''} language={langMap[fileContent.language] || 'javascript'}>
                      {({ style, tokens, getLineProps, getTokenProps }) => (
                        <pre className="text-sm p-4 overflow-x-auto" style={{ ...style, margin: 0, background: 'transparent' }}>
                          {tokens.map((line, i) => (
                            <div key={i} {...getLineProps({ line })}>
                              <span className="inline-block w-10 text-right mr-4 text-gray-400 select-none text-xs">{i + 1}</span>
                              {line.map((token, key) => (
                                <span key={key} {...getTokenProps({ token })} />
                              ))}
                            </div>
                          ))}
                        </pre>
                      )}
                    </Highlight>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <FileCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Select a file to view its contents</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state - not yet generated */}
      {!isGenerated && !isGenerating && events.length === 0 && (
        <div className="card text-center py-16">
          <FileCode className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Ready to Generate</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Your project configuration is ready. Click "Generate Code" to create your application source code.
          </p>
          <button
            onClick={handleGenerate}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Play className="w-4 h-4" /> Generate Code
          </button>
        </div>
      )}
    </div>
  );
}
