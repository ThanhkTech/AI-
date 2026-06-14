import { useState } from 'react';
import Dashboard    from './pages/Dashboard';
import Containers   from './pages/Containers';
import Orders       from './pages/Orders';
import Partners     from './pages/Partners';
import Fuel         from './pages/Fuel';
import Maintenance  from './pages/Maintenance';
import Logs         from './pages/Logs';
import Reports      from './pages/Reports';

const NAV_GROUPS = [
  {
    label: 'Vận hành',
    items: [
      { id: 'dashboard',   label: 'Dashboard',        en: 'Overview',        icon: '📊' },
      { id: 'orders',      label: 'Đơn hàng',         en: 'Orders',          icon: '📋' },
      { id: 'containers',  label: 'Vỏ Container',      en: 'Fleet',           icon: '🚢' },
      { id: 'partners',    label: 'Đối tác',            en: 'Partners',        icon: '🤝' },
    ],
  },
  {
    label: 'Kỹ thuật & Chi phí',
    items: [
      { id: 'fuel',        label: 'Nhiên liệu',        en: 'Fuel',            icon: '⛽' },
      { id: 'maintenance', label: 'Sửa chữa',          en: 'Maintenance',     icon: '🔧' },
    ],
  },
  {
    label: 'Nhật ký & Báo cáo',
    items: [
      { id: 'logs',        label: 'Nhật ký vận hành',  en: 'Operation Logs',  icon: '📍' },
      { id: 'reports',     label: 'Báo cáo cấp trên',  en: 'Reports',         icon: '📈' },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap(g => g.items);

const PAGES = {
  dashboard:   Dashboard,
  orders:      Orders,
  containers:  Containers,
  partners:    Partners,
  fuel:        Fuel,
  maintenance: Maintenance,
  logs:        Logs,
  reports:     Reports,
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const PageComponent = PAGES[page] || Dashboard;
  const current = ALL_ITEMS.find(n => n.id === page);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Top bar */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-900 shadow-xl z-30 flex-shrink-0">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-white" onClick={() => setSidebarOpen(o => !o)}>☰</button>
            <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-lg">🚢</div>
            <div>
              <h1 className="text-white font-extrabold text-sm leading-tight">VCL Logistics</h1>
              <p className="text-blue-300 text-[10px] tracking-widest uppercase hidden sm:block">Container Management System</p>
            </div>
          </div>

          {/* Horizontal nav for larger screens */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {ALL_ITEMS.map(n => (
              <button key={n.id} onClick={() => setPage(n.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${page === n.id ? 'bg-white text-blue-700' : 'text-blue-100 hover:bg-blue-700'}`}>
                <span>{n.icon}</span>
                <span className="hidden xl:inline">{n.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 text-blue-300 text-xs flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="hidden sm:inline">Online</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-screen-xl w-full mx-auto">
        {/* Sidebar (mobile) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute left-0 top-14 bottom-0 w-64 bg-blue-800 p-4 space-y-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
              {NAV_GROUPS.map(g => (
                <div key={g.label}>
                  <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1.5">{g.label}</p>
                  <div className="space-y-0.5">
                    {g.items.map(n => (
                      <button key={n.id} onClick={() => { setPage(n.id); setSidebarOpen(false); }}
                        className={`sidebar-item w-full ${page === n.id ? 'active' : ''}`}>
                        <span>{n.icon}</span><span>{n.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 px-4 sm:px-6 py-5 min-w-0">
          {/* Breadcrumb */}
          <div className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
            <span>VCL</span>
            <span>/</span>
            <span className="text-gray-600 font-medium">{current?.label}</span>
            <span className="text-gray-300">—</span>
            <span>{current?.en}</span>
          </div>

          <PageComponent />
        </main>
      </div>

      <footer className="text-center text-xs text-gray-400 py-2 border-t border-gray-200 print:hidden">
        © 2024 VCL — Vietnam Container Logistics
      </footer>
    </div>
  );
}
