import { useState } from 'react';
import { useFetch } from '../hooks/useApi';
import { fmtCurrency, fmtNumber, fmtDate, fmtDateTime, monthStart, todayStr } from '../utils/format';
import { OrderStatusBadge, ContainerStatusBadge } from '../components/Badge';
import { MaintenanceStatusBadge } from '../components/MaintenanceModal';

// Print-friendly CSS class
const printBtn = 'btn bg-gray-700 text-white hover:bg-gray-800 text-xs py-1';

function Section({ title, children }) {
  return (
    <div className="card p-5 space-y-3">
      <h2 className="text-base font-bold text-gray-800 border-b pb-2">{title}</h2>
      {children}
    </div>
  );
}

// ---- Report: Nhiên liệu ----
function FuelReport({ from, to }) {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to)   params.set('to', to);
  const { data, loading } = useFetch(`/api/reports/fuel?${params}`);

  if (loading || !data) return <div className="text-center text-gray-400 py-8">Đang tải...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center border-l-4 border-blue-500">
          <p className="text-xs text-gray-400">Số phiếu</p><p className="text-2xl font-bold">{data.summary.count}</p>
        </div>
        <div className="card p-4 text-center border-l-4 border-orange-400">
          <p className="text-xs text-gray-400">Tổng lít</p><p className="text-2xl font-bold">{fmtNumber(data.summary.total_liters)} L</p>
        </div>
        <div className="card p-4 text-center border-l-4 border-green-500">
          <p className="text-xs text-gray-400">Tổng chi phí</p><p className="text-xl font-bold text-green-700">{fmtCurrency(data.summary.total_cost)}</p>
        </div>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="table-th">Ngày</th><th className="table-th">Vỏ Container</th>
              <th className="table-th">Trạm xăng</th>
              <th className="table-th text-right">Lít</th><th className="table-th text-right">Đơn giá</th>
              <th className="table-th text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map(r => (
              <tr key={r.id} className="table-tr">
                <td className="table-td">{r.fill_date}</td>
                <td className="table-td font-mono font-semibold">{r.container_number}</td>
                <td className="table-td text-gray-500 text-xs">{r.station || '—'}</td>
                <td className="table-td text-right">{fmtNumber(r.liters)}</td>
                <td className="table-td text-right text-gray-500">{fmtNumber(r.price_per_liter)}</td>
                <td className="table-td text-right font-semibold text-green-700">{fmtCurrency(r.total_cost)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 font-semibold border-t">
            <tr>
              <td colSpan={4} className="table-td">Tổng cộng</td>
              <td className="table-td text-right">{fmtNumber(data.summary.total_liters)} L</td>
              <td />
              <td className="table-td text-right text-green-700">{fmtCurrency(data.summary.total_cost)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ---- Report: Sửa chữa ----
function MaintenanceReport({ from, to, settled }) {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to)   params.set('to', to);
  if (settled !== '') params.set('settled', settled);
  const { data, loading } = useFetch(`/api/reports/maintenance?${params}`);

  if (loading || !data) return <div className="text-center text-gray-400 py-8">Đang tải...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 text-center border-l-4 border-blue-500">
          <p className="text-xs text-gray-400">Tổng phiếu</p><p className="text-2xl font-bold">{data.summary.count}</p>
        </div>
        <div className="card p-4 text-center border-l-4 border-orange-400">
          <p className="text-xs text-gray-400">Chi phí dự kiến</p><p className="text-lg font-bold text-orange-600">{fmtCurrency(data.summary.total_estimated)}</p>
        </div>
        <div className="card p-4 text-center border-l-4 border-green-500">
          <p className="text-xs text-gray-400">Đã quyết toán ({data.summary.settled_count})</p><p className="text-lg font-bold text-green-700">{fmtCurrency(data.summary.total_actual)}</p>
        </div>
        <div className="card p-4 text-center border-l-4 border-red-400">
          <p className="text-xs text-gray-400">Chưa QT ({data.summary.unsettled})</p><p className="text-lg font-bold text-red-600">{fmtCurrency(data.summary.unsettled_cost)}</p>
        </div>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="table-th">Vỏ</th><th className="table-th">Loại sửa</th>
              <th className="table-th">Gara</th><th className="table-th">Trạng thái</th>
              <th className="table-th">Ngày bắt đầu</th>
              <th className="table-th text-right">Dự kiến</th><th className="table-th text-right">Thực tế</th>
              <th className="table-th">Quyết toán</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map(r => (
              <tr key={r.id} className="table-tr">
                <td className="table-td font-mono font-semibold">{r.container_number}</td>
                <td className="table-td">{r.repair_type}</td>
                <td className="table-td text-xs text-gray-500">{r.workshop || '—'}</td>
                <td className="table-td"><MaintenanceStatusBadge status={r.status} /></td>
                <td className="table-td text-xs">{fmtDate(r.start_date)}</td>
                <td className="table-td text-right text-orange-600">{fmtCurrency(r.estimated_cost)}</td>
                <td className="table-td text-right font-semibold">{r.actual_cost ? fmtCurrency(r.actual_cost) : '—'}</td>
                <td className="table-td">
                  {r.settled
                    ? <span className="text-xs text-green-600 font-semibold">✓ {fmtDate(r.settled_at)}<br/><span className="text-gray-400">{r.settled_by}</span></span>
                    : <span className="text-xs text-gray-400">Chưa QT</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- Report: Vận hành tổng hợp ----
function OperationsReport() {
  const { data, loading } = useFetch('/api/reports/operations');
  if (loading || !data) return <div className="text-center text-gray-400 py-8">Đang tải...</div>;

  const s = data.summary;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 text-center border-l-4 border-blue-500"><p className="text-xs text-gray-400">Tổng đơn hàng</p><p className="text-2xl font-bold">{s.total_orders}</p></div>
        <div className="card p-4 text-center border-l-4 border-green-500"><p className="text-xs text-gray-400">Đã giao ({s.delivery_rate}%)</p><p className="text-2xl font-bold text-green-700">{s.delivered}</p></div>
        <div className="card p-4 text-center border-l-4 border-indigo-500"><p className="text-xs text-gray-400">Tổng vỏ</p><p className="text-2xl font-bold">{s.total_containers}</p></div>
        <div className="card p-4 text-center border-l-4 border-orange-500"><p className="text-xs text-gray-400">Tổng tài xế</p><p className="text-2xl font-bold">{s.total_drivers}</p></div>
      </div>

      <Section title="Hiệu suất đối tác / Partner Performance">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="table-th">Đối tác</th><th className="table-th">Người liên hệ</th><th className="table-th">SĐT</th>
              <th className="table-th text-right">Tổng đơn</th><th className="table-th text-right">Đã giao</th><th className="table-th text-right">Đang xử lý</th>
            </tr>
          </thead>
          <tbody>
            {data.partner_stats.map(d => (
              <tr key={d.name} className="table-tr">
                <td className="table-td font-semibold">{d.short_name || d.name}</td>
                <td className="table-td text-xs text-gray-500">{d.contact_person || '—'}</td>
                <td className="table-td text-xs text-gray-500">{d.phone || '—'}</td>
                <td className="table-td text-right">{d.total_orders}</td>
                <td className="table-td text-right text-green-700 font-semibold">{d.delivered}</td>
                <td className="table-td text-right text-blue-600">{d.active}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Tình trạng đội vỏ / Container Fleet Status">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="table-th">Số Container</th><th className="table-th">Kích thước</th>
              <th className="table-th">Vị trí</th><th className="table-th">Trạng thái</th>
              <th className="table-th text-right">Tổng đơn</th><th className="table-th text-right">Lần SC</th>
              <th className="table-th text-right">Chi phí nhiên liệu</th>
            </tr>
          </thead>
          <tbody>
            {data.container_stats.map(c => (
              <tr key={c.container_number} className="table-tr">
                <td className="table-td font-mono font-semibold">{c.container_number}</td>
                <td className="table-td">{c.size}</td>
                <td className="table-td text-xs text-gray-500">{c.location}</td>
                <td className="table-td"><ContainerStatusBadge status={c.container_status} small /></td>
                <td className="table-td text-right">{c.total_orders}</td>
                <td className="table-td text-right text-orange-600">{c.maintenances}</td>
                <td className="table-td text-right text-green-700">{c.fuel_cost ? fmtCurrency(c.fuel_cost) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );
}

// ---- Main Reports Page ----
export default function Reports() {
  const [tab, setTab] = useState('operations');
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(todayStr());
  const [settled, setSettled] = useState('');

  const TABS = [
    { id: 'operations',   label: '📊 Vận hành tổng hợp' },
    { id: 'fuel',         label: '⛽ Nhiên liệu' },
    { id: 'maintenance',  label: '🔧 Sửa chữa & Quyết toán' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Báo cáo quản lý</h1>
          <p className="text-sm text-gray-500">Management Reports — Dành cho cấp trên</p>
        </div>
        <button onClick={() => window.print()} className={printBtn + ' px-4 py-2 text-sm'}>🖨️ In báo cáo</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t.id ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Date filters (not for operations) */}
      {tab !== 'operations' && (
        <div className="card p-4 flex flex-wrap gap-3 items-end">
          <div><label className="label">Từ ngày</label><input type="date" className="input w-40" value={from} onChange={e => setFrom(e.target.value)} /></div>
          <div><label className="label">Đến ngày</label><input type="date" className="input w-40" value={to} onChange={e => setTo(e.target.value)} /></div>
          {tab === 'maintenance' && (
            <div>
              <label className="label">Quyết toán</label>
              <select className="input w-44" value={settled} onChange={e => setSettled(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="false">Chưa quyết toán</option>
                <option value="true">Đã quyết toán</option>
              </select>
            </div>
          )}
          <div className="text-xs text-gray-400 self-end pb-2">📋 Dữ liệu từ {fmtDate(from)} đến {fmtDate(to)}</div>
        </div>
      )}

      {/* Report header for print */}
      <div className="hidden print:block mb-4 text-center">
        <h1 className="text-xl font-bold">VCL — Vietnam Container Logistics</h1>
        <p className="text-sm text-gray-500">{TABS.find(t => t.id === tab)?.label} · Ngày in: {fmtDateTime(new Date())}</p>
        {tab !== 'operations' && <p className="text-sm">Kỳ báo cáo: {fmtDate(from)} — {fmtDate(to)}</p>}
      </div>

      {tab === 'operations'  && <OperationsReport />}
      {tab === 'fuel'        && <FuelReport from={from} to={to} />}
      {tab === 'maintenance' && <MaintenanceReport from={from} to={to} settled={settled} />}
    </div>
  );
}
