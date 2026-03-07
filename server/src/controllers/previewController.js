const Project = require('../models/mongo/Project');
const GeneratedCode = require('../models/mongo/GeneratedCode');
const Questionnaire = require('../models/mongo/Questionnaire');
const logger = require('../utils/logger');

// ─── Module config ────────────────────────────────────────────────────────────

const MODULE_CONFIG = {
  inventory:     { label: 'Inventory',        icon: '📦' },
  hr:            { label: 'HR & Employees',   icon: '👥' },
  crm:           { label: 'CRM',              icon: '🤝' },
  accounting:    { label: 'Accounting',       icon: '💰' },
  purchasing:    { label: 'Purchasing',       icon: '🛒' },
  sales:         { label: 'Sales',            icon: '📊' },
  payroll:       { label: 'Payroll',          icon: '💵' },
  finance:       { label: 'Finance',          icon: '🏦' },
  logistics:     { label: 'Logistics',        icon: '🚚' },
  manufacturing: { label: 'Manufacturing',    icon: '🏭' },
  warehouse:     { label: 'Warehouse',        icon: '🏗️' },
  projects:      { label: 'Projects',         icon: '📋' },
  assets:        { label: 'Assets',           icon: '🖥️' },
  reports:       { label: 'Reports',          icon: '📈' },
};

// ─── Sample table data per module ─────────────────────────────────────────────

const SAMPLE_DATA = {
  inventory: {
    stats: [
      { label: 'Total Items', value: '1,284', icon: '📦', bg: '#dbeafe', ic: '#1d4ed8' },
      { label: 'Low Stock',   value: '23',    icon: '⚠️', bg: '#fef3c7', ic: '#92400e' },
      { label: 'Categories',  value: '18',    icon: '🏷️', bg: '#d1fae5', ic: '#065f46' },
      { label: 'Total Value', value: '$248K', icon: '💰', bg: '#ede9fe', ic: '#6d28d9' },
    ],
    headers: ['SKU', 'Product Name', 'Category', 'Stock', 'Unit Price', 'Status'],
    rows: [
      ['SKU-001', 'Office Chair Pro',   'Furniture',   '45',  '$299.00',  'active'],
      ['SKU-002', 'Laptop Stand',       'Electronics', '12',  '$89.99',   'low'],
      ['SKU-003', 'Wireless Mouse',     'Electronics', '134', '$34.99',   'active'],
      ['SKU-004', 'Standing Desk',      'Furniture',   '0',   '$549.00',  'out'],
      ['SKU-005', 'Monitor Arm',        'Electronics', '67',  '$159.00',  'active'],
    ],
  },
  hr: {
    stats: [
      { label: 'Employees',   value: '142', icon: '👥', bg: '#ede9fe', ic: '#7c3aed' },
      { label: 'Departments', value: '12',  icon: '🏢', bg: '#dbeafe', ic: '#1d4ed8' },
      { label: 'On Leave',    value: '8',   icon: '🏖️', bg: '#fef3c7', ic: '#92400e' },
      { label: 'New Hires',   value: '5',   icon: '✨', bg: '#d1fae5', ic: '#065f46' },
    ],
    headers: ['ID', 'Employee Name', 'Department', 'Role', 'Status', 'Joined'],
    rows: [
      ['EMP-001', 'Sarah Johnson',  'Engineering', 'Senior Dev',  'active', 'Jan 2022'],
      ['EMP-002', 'Michael Chen',   'Sales',       'Sales Rep',   'active', 'Mar 2023'],
      ['EMP-003', 'Emily Davis',    'HR',          'HR Manager',  'active', 'Aug 2021'],
      ['EMP-004', 'Robert Wilson',  'Finance',     'Accountant',  'leave',  'Nov 2022'],
      ['EMP-005', 'Jessica Brown',  'Engineering', 'UX Designer', 'active', 'Jun 2023'],
    ],
  },
  sales: {
    stats: [
      { label: 'Total Orders',  value: '1,482', icon: '🛒', bg: '#dbeafe', ic: '#1d4ed8' },
      { label: 'Revenue',       value: '$284K', icon: '💰', bg: '#d1fae5', ic: '#065f46' },
      { label: 'Avg Order',     value: '$191',  icon: '📊', bg: '#ede9fe', ic: '#6d28d9' },
      { label: 'Pending',       value: '34',    icon: '⏳', bg: '#fef3c7', ic: '#92400e' },
    ],
    headers: ['Order #', 'Customer', 'Date', 'Items', 'Total', 'Status'],
    rows: [
      ['ORD-001', 'Acme Corp',       '2024-03-01', '3', '$2,989', 'delivered'],
      ['ORD-002', 'Globex Ltd.',     '2024-03-03', '1', '$2,745', 'shipped'],
      ['ORD-003', 'Initech LLC',     '2024-03-05', '2', '$1,952', 'processing'],
      ['ORD-004', 'Wayne Enter.',    '2024-03-08', '4', '$3,298', 'delivered'],
      ['ORD-005', 'Umbrella Retail', '2024-03-07', '1', '$8,412', 'pending'],
    ],
  },
  accounting: {
    stats: [
      { label: 'Total Revenue',  value: '$284K', icon: '💰', bg: '#d1fae5', ic: '#065f46' },
      { label: 'Outstanding',    value: '$18K',  icon: '📄', bg: '#dbeafe', ic: '#1d4ed8' },
      { label: 'Overdue',        value: '$2.8K', icon: '⚠️', bg: '#fee2e2', ic: '#991b1b' },
      { label: 'Paid Invoices',  value: '38',    icon: '✅', bg: '#d1fae5', ic: '#065f46' },
    ],
    headers: ['Invoice #', 'Client', 'Issue Date', 'Due Date', 'Amount', 'Status'],
    rows: [
      ['INV-001', 'Acme Corp',     '2024-03-01', '2024-03-31', '$2,990', 'paid'],
      ['INV-002', 'Globex Ltd.',   '2024-03-03', '2024-04-03', '$2,745', 'sent'],
      ['INV-003', 'Initech LLC',   '2024-02-15', '2024-03-15', '$1,952', 'overdue'],
      ['INV-004', 'Wayne Enter.',  '2024-03-08', '2024-04-08', '$3,298', 'paid'],
      ['INV-005', 'Pied Piper',    '2024-03-10', '2024-04-10', '$480',   'sent'],
    ],
  },
  purchasing: {
    stats: [
      { label: 'Open POs',     value: '14',   icon: '📋', bg: '#ede9fe', ic: '#7c3aed' },
      { label: 'Total Spend',  value: '$48K', icon: '💵', bg: '#dbeafe', ic: '#1d4ed8' },
      { label: 'Suppliers',    value: '12',   icon: '🏭', bg: '#d1fae5', ic: '#065f46' },
      { label: 'Received',     value: '28',   icon: '✅', bg: '#fef3c7', ic: '#92400e' },
    ],
    headers: ['PO Number', 'Supplier', 'Date', 'Delivery', 'Total', 'Status'],
    rows: [
      ['PO-001', 'TechSupply Co.', '2024-02-20', '2024-03-05', '$7,650', 'received'],
      ['PO-002', 'OfficePlus',     '2024-02-22', '2024-03-10', '$3,675', 'received'],
      ['PO-003', 'KeyMaster Ltd.', '2024-03-01', '2024-03-15', '$4,720', 'sent'],
      ['PO-004', 'ComfortSeating', '2024-03-05', '2024-03-25', '$6,300', 'sent'],
      ['PO-005', 'ConnectPro',     '2024-03-08', '2024-03-20', '$1,500', 'sent'],
    ],
  },
};

const DEFAULT_DATA = {
  stats: [
    { label: 'Total Records', value: '248', icon: '📋', bg: '#dbeafe', ic: '#1d4ed8' },
    { label: 'Active',        value: '198', icon: '✅', bg: '#d1fae5', ic: '#065f46' },
    { label: 'Pending',       value: '32',  icon: '⏳', bg: '#fef3c7', ic: '#92400e' },
    { label: 'This Month',    value: '18',  icon: '📅', bg: '#ede9fe', ic: '#6d28d9' },
  ],
  headers: ['ID', 'Name', 'Category', 'Date', 'Amount', 'Status'],
  rows: [
    ['REC-001', 'Record Alpha',   'Category A', '2024-01-15', '$1,200', 'active'],
    ['REC-002', 'Record Beta',    'Category B', '2024-01-18', '$850',   'active'],
    ['REC-003', 'Record Gamma',   'Category A', '2024-01-20', '$2,100', 'pending'],
    ['REC-004', 'Record Delta',   'Category C', '2024-01-22', '$450',   'active'],
    ['REC-005', 'Record Epsilon', 'Category B', '2024-01-25', '$3,200', 'pending'],
  ],
};

// ─── HTML generator ───────────────────────────────────────────────────────────

function generateStaticPreview(project, questionnaire, modules) {
  const projectName = project.name || 'ERP System';
  const activeModule = modules[0] || 'inventory';
  const activeConfig = MODULE_CONFIG[activeModule] || { label: activeModule, icon: '📋' };
  const data = SAMPLE_DATA[activeModule] || DEFAULT_DATA;

  const STATUS_BADGE = {
    active:     ['#d1fae5', '#065f46'],
    low:        ['#fef3c7', '#92400e'],
    out:        ['#fee2e2', '#991b1b'],
    leave:      ['#fef3c7', '#92400e'],
    delivered:  ['#d1fae5', '#065f46'],
    shipped:    ['#dbeafe', '#1d4ed8'],
    processing: ['#fef3c7', '#92400e'],
    pending:    ['#f3f4f6', '#4b5563'],
    received:   ['#d1fae5', '#065f46'],
    sent:       ['#dbeafe', '#1d4ed8'],
    paid:       ['#d1fae5', '#065f46'],
    overdue:    ['#fee2e2', '#991b1b'],
    draft:      ['#f3f4f6', '#4b5563'],
    cancelled:  ['#fee2e2', '#991b1b'],
  };

  const navItemsHtml = modules.map((mod, i) => {
    const cfg = MODULE_CONFIG[mod] || { label: mod, icon: '📋' };
    return `<div class="nav-item${i === 0 ? ' active' : ''}">${cfg.icon}<span>${cfg.label}</span></div>`;
  }).join('\n');

  const statsHtml = data.stats.map((s) => `
    <div class="stat-card">
      <div class="stat-icon" style="background:${s.bg}">${s.icon}</div>
      <div class="stat-value">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>`).join('');

  const headersHtml = data.headers.map((h) => `<th>${h}</th>`).join('');

  const rowsHtml = data.rows.map((row) => {
    const cells = row.map((cell, ci) => {
      if (ci === row.length - 1) {
        const [bg, color] = STATUS_BADGE[cell] || ['#f3f4f6', '#4b5563'];
        return `<td><span class="badge" style="background:${bg};color:${color}">${cell}</span></td>`;
      }
      return `<td>${cell}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${projectName} — Preview</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f1f5f9; color: #111827;
      display: flex; height: 100vh; overflow: hidden;
    }
    /* ── Sidebar ── */
    .sidebar {
      width: 220px; background: #0f172a; color: #e2e8f0;
      display: flex; flex-direction: column; flex-shrink: 0;
    }
    .sidebar-header { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .app-name { font-size: 14px; font-weight: 700; color: #fff; }
    .app-sub  { font-size: 11px; color: #64748b; margin-top: 2px; }
    .sidebar-nav { padding: 8px; flex: 1; overflow-y: auto; }
    .nav-label {
      font-size: 10px; font-weight: 600; text-transform: uppercase;
      letter-spacing: .08em; color: #334155; padding: 12px 10px 4px;
    }
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 10px; border-radius: 8px; cursor: pointer;
      font-size: 13px; color: #94a3b8; margin-bottom: 2px;
    }
    .nav-item.active { background: #1d4ed8; color: #fff; }
    .nav-item:not(.active):hover { background: rgba(255,255,255,0.05); color: #fff; }
    .sidebar-footer {
      padding: 12px; border-top: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; gap: 10px;
    }
    .avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: #1d4ed8; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; flex-shrink: 0;
    }
    .user-name { font-size: 13px; font-weight: 600; color: #fff; }
    .user-role { font-size: 11px; color: #64748b; }
    /* ── Main ── */
    .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .topbar {
      height: 56px; background: #fff; border-bottom: 1px solid #e5e7eb;
      display: flex; align-items: center; padding: 0 24px; gap: 12px; flex-shrink: 0;
    }
    .topbar-title { font-size: 16px; font-weight: 600; color: #111827; flex: 1; }
    .preview-chip {
      padding: 4px 10px; background: #dbeafe; color: #1e40af;
      border-radius: 20px; font-size: 11px; font-weight: 600;
    }
    .content { flex: 1; overflow-y: auto; padding: 24px; }
    .page-header {
      display: flex; align-items: center;
      justify-content: space-between; margin-bottom: 20px;
    }
    .page-title { font-size: 20px; font-weight: 700; color: #111827; }
    .page-sub   { font-size: 13px; color: #6b7280; margin-top: 2px; }
    .btn {
      padding: 8px 16px; border-radius: 8px; border: none;
      cursor: pointer; font-size: 13px; font-weight: 500;
      display: inline-flex; align-items: center; gap: 6px;
      background: #1d4ed8; color: #fff;
    }
    /* ── Stats ── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px; margin-bottom: 24px;
    }
    .stat-card {
      background: #fff; border: 1px solid #e5e7eb;
      border-radius: 12px; padding: 16px;
    }
    .stat-icon {
      width: 36px; height: 36px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 10px; font-size: 18px;
    }
    .stat-value { font-size: 24px; font-weight: 700; color: #111827; }
    .stat-label { font-size: 12px; color: #6b7280; margin-top: 2px; }
    /* ── Table ── */
    .card {
      background: #fff; border: 1px solid #e5e7eb;
      border-radius: 12px; overflow: hidden;
    }
    .card-header {
      padding: 14px 20px; border-bottom: 1px solid #f3f4f6;
      display: flex; align-items: center; justify-content: space-between;
    }
    .card-title { font-size: 14px; font-weight: 600; color: #374151; }
    .search {
      padding: 6px 12px; border: 1px solid #e5e7eb; border-radius: 8px;
      font-size: 13px; outline: none; background: #f9fafb; width: 200px;
    }
    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; padding: 10px 20px;
      font-size: 11px; font-weight: 600; text-transform: uppercase;
      letter-spacing: .05em; color: #9ca3af;
      background: #f9fafb; border-bottom: 1px solid #f3f4f6;
    }
    td { padding: 12px 20px; font-size: 13px; color: #374151; border-bottom: 1px solid #f9fafb; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f8fafc; }
    .badge {
      display: inline-flex; align-items: center; padding: 2px 8px;
      border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: capitalize;
    }
    .pagination {
      padding: 12px 20px; border-top: 1px solid #f3f4f6;
      display: flex; align-items: center; justify-content: space-between;
      font-size: 13px; color: #6b7280;
    }
    .pagination a { color: #1d4ed8; text-decoration: none; }
    /* ── Watermark ── */
    .watermark {
      position: fixed; bottom: 12px; right: 12px;
      background: rgba(15,23,42,0.85); color: #e2e8f0;
      padding: 7px 13px; border-radius: 10px; font-size: 11px;
      backdrop-filter: blur(8px); z-index: 9999;
    }
    /* ── Mobile fallback ── */
    @media (max-width: 640px) {
      .sidebar { display: none; }
    }
  </style>
</head>
<body>
  <!-- Sidebar -->
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="app-name">${projectName}</div>
      <div class="app-sub">Built with ERP Builder</div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-label">Navigation</div>
      ${navItemsHtml}
      <div class="nav-label">System</div>
      <div class="nav-item">⚙️<span>Settings</span></div>
      <div class="nav-item">📈<span>Reports</span></div>
    </nav>
    <div class="sidebar-footer">
      <div class="avatar">A</div>
      <div>
        <div class="user-name">Admin</div>
        <div class="user-role">Administrator</div>
      </div>
    </div>
  </div>

  <!-- Main -->
  <div class="main">
    <div class="topbar">
      <div class="topbar-title">${activeConfig.label}</div>
      <span class="preview-chip">Preview Mode</span>
    </div>

    <div class="content">
      <div class="page-header">
        <div>
          <div class="page-title">${activeConfig.icon} ${activeConfig.label}</div>
          <div class="page-sub">Manage your ${activeConfig.label.toLowerCase()} records</div>
        </div>
        <button class="btn">+ Add New</button>
      </div>

      <!-- Stats -->
      <div class="stats-grid">${statsHtml}</div>

      <!-- Table -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">${activeConfig.label} Records</span>
          <input class="search" type="text" placeholder="Search…" />
        </div>
        <table>
          <thead><tr>${headersHtml}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div class="pagination">
          <span>Showing 1–5 of 248 records</span>
          <div><a href="#">← Prev</a> &nbsp; <a href="#">Next →</a></div>
        </div>
      </div>
    </div>
  </div>

  <div class="watermark">🔍 UI Preview — ERP Builder</div>
</body>
</html>`;
}

// ─── POST /api/preview/:projectId — validate & emit SSE events ────────────────

exports.buildPreview = async (req, res) => {
  const { projectId } = req.params;

  // Always open the SSE stream first — never return JSON errors here,
  // as useSSE treats any non-200 response as a connection failure.
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const emit = (event, data) => {
    try { res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); } catch (_) {}
  };

  try {
    emit('status', { message: 'Loading project data...' });

    const project = await Project.findById(projectId);
    if (!project) {
      emit('error', { message: 'Project not found' });
      return res.end();
    }

    const generatedCode = await GeneratedCode.findOne(
      { projectId: project._id, status: 'complete' },
    ).sort({ version: -1 });

    if (!generatedCode) {
      // Allow preview even without generated code — show placeholder UI
      emit('status', { message: 'No code generated yet — showing placeholder preview...' });
      await new Promise((r) => setTimeout(r, 300));
      emit('complete', { message: 'Preview ready (placeholder)!', projectId });
      return res.end();
    }

    await new Promise((r) => setTimeout(r, 300));
    emit('status', { message: 'Generating UI preview...' });
    await new Promise((r) => setTimeout(r, 400));
    emit('status', { message: 'Preview ready!' });
    emit('complete', { message: 'Preview ready!', projectId });

    res.end();
  } catch (error) {
    logger.error('buildPreview error:', error.message);
    emit('error', { message: error.message });
    res.end();
  }
};

// ─── GET /api/preview/:projectId/* — serve generated HTML ────────────────────
// Note: async is intentional — Vercel supports async route handlers.
// Since there is no in-memory map (stateless serverless), we regenerate
// the HTML on every request directly from the DB (fast, ~100ms).

exports.servePreview = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).send('<html><body style="font-family:sans-serif;text-align:center;padding:60px"><h2>Project not found</h2></body></html>');
    }

    const generatedCode = await GeneratedCode.findOne(
      { projectId: project._id, status: 'complete' },
    ).sort({ version: -1 });

    if (!generatedCode) {
      return res.status(404).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#f9fafb">
          <h2 style="color:#374151">Preview not built yet</h2>
          <p style="color:#6b7280">Generate code for this project first, then click "Build UI Preview".</p>
        </body></html>`);
    }

    const questionnaire = await Questionnaire.findOne({ projectId: project._id });
    const modules = questionnaire?.responses?.modules?.selected || [];

    const html = generateStaticPreview(
      project,
      questionnaire,
      modules.length > 0 ? modules : ['inventory', 'hr', 'sales'],
    );

    logger.info(`Preview served for projectId=${projectId} modules=[${modules.join(',')}]`);
    // Remove Helmet's restrictive headers — preview is sample/mock data only.
    // X-Frame-Options SAMEORIGIN would block the iframe in local dev (ports 5173 vs 3001).
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    logger.error('Preview serve error:', err.message);
    res.status(500).send('<html><body style="font-family:sans-serif;padding:40px"><h2>Preview error</h2><pre>' + err.message + '</pre></body></html>');
  }
};
