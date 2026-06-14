import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import ContainerList from './pages/ContainerList';

const NAV = [
  { id: 'dashboard', label: 'Tổng quan', icon: '📊' },
  { id: 'containers', label: 'Danh sách Container', icon: '📦' },
];

export default function App() {
  const [page, setPage] = useState('dashboard');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚢</span>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Logistics Container</h1>
              <p className="text-blue-200 text-xs">Hệ thống quản lý vỏ container</p>
            </div>
          </div>
          <nav className="flex gap-1">
            {NAV.map(n => (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  page === n.id
                    ? 'bg-white text-blue-700'
                    : 'text-blue-100 hover:bg-blue-600'
                }`}
              >
                <span>{n.icon}</span>
                <span className="hidden sm:inline">{n.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {page === 'dashboard' && <Dashboard />}
        {page === 'containers' && <ContainerList />}
      </main>

      <footer className="text-center text-xs text-gray-400 py-3">
        © 2024 Logistics Container Management System
      </footer>
    </div>
  );
}
