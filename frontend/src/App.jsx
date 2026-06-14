import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Containers from './pages/Containers';
import Orders from './pages/Orders';
import Drivers from './pages/Drivers';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', en: 'Overview', icon: '📊' },
  { id: 'orders',    label: 'Đơn hàng',  en: 'Orders',   icon: '📋' },
  { id: 'containers',label: 'Vỏ Container', en: 'Fleet',  icon: '🚢' },
  { id: 'drivers',   label: 'Tài xế',    en: 'Drivers',  icon: '🚛' },
];

export default function App() {
  const [page, setPage] = useState('dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Top header */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-900 shadow-xl z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-xl">🚢</div>
            <div>
              <h1 className="text-white font-extrabold text-base leading-tight tracking-tight">VCL Logistics</h1>
              <p className="text-blue-300 text-[10px] font-medium tracking-widest uppercase">Container Management System</p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {NAV.map(n => (
              <button key={n.id} onClick={() => setPage(n.id)}
                className={`sidebar-item px-3 py-2 ${page === n.id ? 'active' : ''}`}>
                <span>{n.icon}</span>
                <span className="hidden sm:inline">{n.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 text-blue-300 text-xs">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="hidden sm:inline">Hệ thống hoạt động</span>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center gap-2 text-xs text-gray-500">
          <span>VCL</span>
          <span>/</span>
          <span className="font-medium text-gray-700">{NAV.find(n => n.id === page)?.label}</span>
          <span className="text-gray-300">—</span>
          <span>{NAV.find(n => n.id === page)?.en}</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {page === 'dashboard'  && <Dashboard />}
        {page === 'orders'     && <Orders />}
        {page === 'containers' && <Containers />}
        {page === 'drivers'    && <Drivers />}
      </main>

      <footer className="text-center text-xs text-gray-400 py-3 border-t border-gray-200">
        © 2024 VCL — Vietnam Container Logistics · Hệ thống quản lý vận tải container
      </footer>
    </div>
  );
}
