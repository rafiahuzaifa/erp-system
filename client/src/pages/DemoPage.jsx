import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, Users, ShoppingCart, BarChart3,
  TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Clock,
  ArrowUpRight, ArrowDownRight, Search, Bell, Settings,
  ChevronRight, Star, Zap, Shield, Download, Play,
  Menu, X, DollarSign, Truck, UserCheck, FileText,
  PieChart, Activity, Database, Globe
} from 'lucide-react';

const MODULES = [
  { key: 'dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { key: 'inventory',  label: 'Inventory',   icon: Package },
  { key: 'hr',         label: 'HR & Payroll',icon: Users },
  { key: 'sales',      label: 'Sales & CRM', icon: ShoppingCart },
  { key: 'finance',    label: 'Finance',     icon: DollarSign },
  { key: 'reports',    label: 'Reports',     icon: BarChart3 },
];

const KPI_CARDS = [
  { label: 'Total Revenue',   value: '₹24.6L',  change: '+12.5%', up: true,  icon: DollarSign,  color: 'blue' },
  { label: 'Active Orders',   value: '342',     change: '+8.2%',  up: true,  icon: ShoppingCart,color: 'green' },
  { label: 'Inventory Items', value: '1,284',   change: '-2.1%',  up: false, icon: Package,     color: 'purple' },
  { label: 'Employees',       value: '87',      change: '+3',     up: true,  icon: Users,       color: 'amber' },
];

const INVENTORY_ITEMS = [
  { id: 'SKU-001', name: 'Laptop Pro 15"',     category: 'Electronics',  qty: 45,  price: '₹82,000', status: 'In Stock' },
  { id: 'SKU-002', name: 'Office Chair Deluxe', category: 'Furniture',    qty: 12,  price: '₹15,500', status: 'Low Stock' },
  { id: 'SKU-003', name: 'Wireless Mouse',      category: 'Accessories',  qty: 0,   price: '₹2,200',  status: 'Out of Stock' },
  { id: 'SKU-004', name: 'Monitor 27" 4K',      category: 'Electronics',  qty: 28,  price: '₹45,000', status: 'In Stock' },
  { id: 'SKU-005', name: 'Standing Desk',       category: 'Furniture',    qty: 8,   price: '₹32,000', status: 'Low Stock' },
];

const EMPLOYEES = [
  { name: 'Priya Sharma',    role: 'Software Engineer',  dept: 'Engineering', salary: '₹95,000', status: 'Active' },
  { name: 'Rahul Mehta',     role: 'Product Manager',    dept: 'Product',     salary: '₹1,20,000', status: 'Active' },
  { name: 'Ananya Singh',    role: 'UI/UX Designer',     dept: 'Design',      salary: '₹75,000', status: 'Active' },
  { name: 'Vikram Patel',    role: 'Sales Executive',    dept: 'Sales',       salary: '₹55,000', status: 'On Leave' },
  { name: 'Neha Kapoor',     role: 'HR Manager',         dept: 'HR',          salary: '₹85,000', status: 'Active' },
];

const ORDERS = [
  { id: '#ORD-2401', customer: 'TechCorp Pvt Ltd',    amount: '₹3,24,000', items: 4, status: 'Delivered', date: '12 Mar' },
  { id: '#ORD-2402', customer: 'Nexus Solutions',     amount: '₹1,56,500', items: 2, status: 'Processing', date: '13 Mar' },
  { id: '#ORD-2403', customer: 'Alpha Enterprises',   amount: '₹87,200',  items: 6, status: 'Pending',    date: '14 Mar' },
  { id: '#ORD-2404', customer: 'Blue Horizon Ltd',    amount: '₹2,10,000', items: 3, status: 'Delivered', date: '14 Mar' },
  { id: '#ORD-2405', customer: 'Star Industries',     amount: '₹64,800',  items: 1, status: 'Cancelled',  date: '15 Mar' },
];

const FINANCE = [
  { month: 'Oct', revenue: 18, expenses: 12 },
  { month: 'Nov', revenue: 21, expenses: 14 },
  { month: 'Dec', revenue: 28, expenses: 16 },
  { month: 'Jan', revenue: 22, expenses: 13 },
  { month: 'Feb', revenue: 26, expenses: 15 },
  { month: 'Mar', revenue: 31, expenses: 18 },
];

function StatusBadge({ status }) {
  const map = {
    'Active':    'bg-green-100 text-green-700',
    'In Stock':  'bg-green-100 text-green-700',
    'Delivered': 'bg-green-100 text-green-700',
    'Low Stock': 'bg-amber-100 text-amber-700',
    'Processing':'bg-blue-100  text-blue-700',
    'On Leave':  'bg-blue-100  text-blue-700',
    'Pending':   'bg-yellow-100 text-yellow-700',
    'Out of Stock':'bg-red-100 text-red-700',
    'Cancelled': 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function BarChartSimple({ data }) {
  const max = Math.max(...data.flatMap(d => [d.revenue, d.expenses]));
  return (
    <div className="flex items-end gap-3 h-36 mt-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-end gap-1 h-28 w-full">
            <div className="flex-1 bg-blue-500 rounded-t-sm transition-all"
              style={{ height: `${(d.revenue / max) * 100}%` }} title={`Revenue: ₹${d.revenue}L`} />
            <div className="flex-1 bg-red-300 rounded-t-sm transition-all"
              style={{ height: `${(d.expenses / max) * 100}%` }} title={`Expenses: ₹${d.expenses}L`} />
          </div>
          <span className="text-[10px] text-gray-400">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((k) => {
          const Icon = k.icon;
          const colors = {
            blue:  { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-600' },
            green: { bg: 'bg-green-50',  icon: 'bg-green-100 text-green-600' },
            purple:{ bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600' },
            amber: { bg: 'bg-amber-50',  icon: 'bg-amber-100 text-amber-600' },
          }[k.color];
          return (
            <div key={k.label} className={`rounded-xl p-4 ${colors.bg}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.icon}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${k.up ? 'text-green-600' : 'text-red-500'}`}>
                  {k.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {k.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{k.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900">Revenue vs Expenses</h3>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Revenue</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-300 inline-block" /> Expenses</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">Last 6 months (₹ Lakhs)</p>
          <BarChartSimple data={FINANCE} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            {[
              { label: 'Orders Fulfilled', value: '94%', icon: CheckCircle2, color: 'text-green-500' },
              { label: 'Inventory Health', value: '78%', icon: Package,      color: 'text-blue-500' },
              { label: 'Pending Approvals',value: '12',  icon: Clock,        color: 'text-amber-500' },
              { label: 'Overdue Tasks',    value: '3',   icon: AlertCircle,  color: 'text-red-500' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${s.color}`} />
                    <span className="text-sm text-gray-600">{s.label}</span>
                  </div>
                  <span className="font-bold text-gray-900 text-sm">{s.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Recent Orders</h3>
          <span className="text-xs text-blue-600 cursor-pointer hover:underline">View all →</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>{['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left font-medium">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ORDERS.slice(0, 3).map(o => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-blue-600">{o.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{o.customer}</td>
                  <td className="px-4 py-3 font-semibold">{o.amount}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-gray-400">{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Inventory() {
  const [search, setSearch] = useState('');
  const filtered = INVENTORY_ITEMS.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-semibold text-gray-900">Inventory Management</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..."
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ Add Item</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>{['SKU', 'Product Name', 'Category', 'Quantity', 'Unit Price', 'Status'].map(h => (
              <th key={h} className="px-4 py-2.5 text-left font-medium">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                <td className="px-4 py-3 text-gray-500">{item.category}</td>
                <td className="px-4 py-3"><span className={item.qty === 0 ? 'text-red-600 font-bold' : item.qty < 15 ? 'text-amber-600 font-semibold' : 'text-gray-900'}>{item.qty}</span></td>
                <td className="px-4 py-3 font-semibold">{item.price}</td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HR() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[{ label: 'Total Staff', value: '87', icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'On Leave Today', value: '4', icon: Clock, color: 'bg-amber-50 text-amber-600' },
          { label: 'Monthly Payroll', value: '₹68.4L', icon: DollarSign, color: 'bg-green-50 text-green-600' }
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${k.color}`}><Icon className="w-5 h-5" /></div>
              <p className="text-2xl font-bold text-gray-900">{k.value}</p>
              <p className="text-xs text-gray-500">{k.label}</p>
            </div>
          );
        })}
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Employee Directory</h3>
          <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ Add Employee</button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>{['Name', 'Role', 'Department', 'Salary/Month', 'Status'].map(h => (
              <th key={h} className="px-4 py-2.5 text-left font-medium">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {EMPLOYEES.map(e => (
              <tr key={e.name} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {e.name[0]}
                    </div>
                    <span className="font-medium text-gray-900">{e.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{e.role}</td>
                <td className="px-4 py-3 text-gray-500">{e.dept}</td>
                <td className="px-4 py-3 font-semibold">{e.salary}</td>
                <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Sales() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Sales Orders</h3>
          <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ New Order</button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>{['Order ID', 'Customer', 'Items', 'Amount', 'Status', 'Date'].map(h => (
              <th key={h} className="px-4 py-2.5 text-left font-medium">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ORDERS.map(o => (
              <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-blue-600">{o.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{o.customer}</td>
                <td className="px-4 py-3 text-gray-500">{o.items} items</td>
                <td className="px-4 py-3 font-bold">{o.amount}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-gray-400">{o.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Finance() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {[{ label: 'Total Revenue (Mar)', value: '₹31.2L', up: true },
          { label: 'Total Expenses (Mar)', value: '₹18.4L', up: false },
          { label: 'Net Profit',          value: '₹12.8L', up: true },
          { label: 'Profit Margin',       value: '41.2%',  up: true },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">{k.label}</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-gray-900">{k.value}</p>
              {k.up ? <ArrowUpRight className="w-5 h-5 text-green-500 mb-0.5" /> : <ArrowDownRight className="w-5 h-5 text-red-500 mb-0.5" />}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-1">Monthly P&L Overview</h3>
        <p className="text-xs text-gray-400 mb-2">₹ in Lakhs</p>
        <BarChartSimple data={FINANCE} />
      </div>
    </div>
  );
}

function Reports() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[
        { title: 'Sales Report',         desc: 'Monthly sales summary with customer breakdown', icon: ShoppingCart, color: 'blue' },
        { title: 'Inventory Report',     desc: 'Stock levels, movements and reorder alerts',    icon: Package,      color: 'green' },
        { title: 'HR Report',            desc: 'Headcount, attendance and payroll summary',     icon: UserCheck,    color: 'purple' },
        { title: 'Financial Statements', desc: 'P&L, Balance sheet and cash flow reports',      icon: FileText,     color: 'amber' },
        { title: 'Supply Chain',         desc: 'Supplier performance and delivery analytics',   icon: Truck,        color: 'red' },
        { title: 'Custom Report',        desc: 'Build any report with drag-and-drop builder',   icon: PieChart,     color: 'gray' },
      ].map(r => {
        const Icon = r.icon;
        const colors = {
          blue:'bg-blue-50 text-blue-600', green:'bg-green-50 text-green-600',
          purple:'bg-purple-50 text-purple-600', amber:'bg-amber-50 text-amber-600',
          red:'bg-red-50 text-red-600', gray:'bg-gray-100 text-gray-600'
        };
        return (
          <div key={r.title} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer group">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors[r.color]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{r.title}</h4>
            <p className="text-sm text-gray-500">{r.desc}</p>
            <span className="inline-flex items-center gap-1 text-xs text-blue-600 mt-3 font-medium">Generate <ChevronRight className="w-3 h-3" /></span>
          </div>
        );
      })}
    </div>
  );
}

const MODULE_CONTENT = { dashboard: Dashboard, inventory: Inventory, hr: HR, sales: Sales, finance: Finance, reports: Reports };

export default function DemoPage() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ActiveContent = MODULE_CONTENT[activeModule];
  const activeLabel = MODULES.find(m => m.key === activeModule)?.label;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top announcement bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 px-4 text-sm">
        <span className="font-medium">🎯 Live Demo</span> — This is a sample ERP generated by ERP Builder.{' '}
        <Link to="/register" className="underline font-semibold hover:no-underline">Build yours free →</Link>
      </div>

      <div className="flex h-[calc(100vh-36px)]">
        {/* Sidebar */}
        <aside className={`fixed inset-y-9 left-0 z-40 w-60 bg-gray-900 flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:inset-auto`}>
          {/* Logo */}
          <div className="px-5 py-4 border-b border-gray-700">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">TechCorp ERP</p>
                <p className="text-gray-400 text-[10px]">Enterprise Suite v1.0</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {MODULES.map(m => {
              const Icon = m.icon;
              const active = activeModule === m.key;
              return (
                <button key={m.key} onClick={() => { setActiveModule(m.key); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {m.label}
                  {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                </button>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="px-3 py-4 border-t border-gray-700">
            <div className="flex items-center gap-2.5 px-3 py-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">R</div>
              <div>
                <p className="text-white text-xs font-medium">Rahul Admin</p>
                <p className="text-gray-400 text-[10px]">Super Admin</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top nav */}
          <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-base font-bold text-gray-900">{activeLabel}</h1>
                <p className="text-xs text-gray-400 hidden sm:block">TechCorp Enterprise ERP</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input placeholder="Search..." className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button className="relative p-2 rounded-lg hover:bg-gray-100">
                <Bell className="w-4 h-4 text-gray-500" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Settings className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <ActiveContent />
          </main>
        </div>
      </div>

      {/* CTA Banner at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Like what you see? Build your own ERP in minutes.</p>
            <p className="text-xs text-gray-500">Custom modules · Your branding · Downloadable code</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/register" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5" /> Start Building Free
          </Link>
          <Link to="/" className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
