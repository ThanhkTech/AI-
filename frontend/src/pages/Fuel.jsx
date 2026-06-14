import { useState } from 'react';
import { useFetch, api } from '../hooks/useApi';
import { fmtCurrency, fmtNumber, monthStart, todayStr } from '../utils/format';
import FuelModal from '../components/FuelModal';

export default function Fuel() {
  const [filters, setFilters] = useState({ from: monthStart(), to: todayStr(), container_id: '' });
  const [modal, setModal] = useState(null);

  const params = new URLSearchParams();
  if (filters.from) params.set('from', filters.from);
  if (filters.to)   params.set('to',   filters.to);
  if (filters.container_id) params.set('container_id', filters.container_id);

  const { data: logs,     loading, refetch } = useFetch(`/api/fuel?${params}`);
  const { data: summary,  refetch: rSum }    = useFetch(`/api/fuel/summary?${params}`);
  const { data: containers } = useFetch('/api/containers');

  const handleDelete = async (f) => {
    if (!window.confirm(`Xóa phiếu đổ dầu ngày ${f.fill_date}?`)) return;
    await api('DELETE', `/api/fuel/${f.id}`);
    refetch(); rSum();
  };

  const done = () => { setModal(null); refetch(); rSum(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Nhiên liệu</h1>
          <p className="text-sm text-gray-500">Fuel Management</p>
        </div>
        <button onClick={() => setModal({ type: 'create' })} className="btn btn-primary"><span>+</span> Thêm phiếu đổ dầu</button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4 border-l-4 border-blue-500 text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase">Số lần đổ</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{summary.total_fills}</p>
          </div>
          <div className="card p-4 border-l-4 border-orange-500 text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase">Tổng lít</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{fmtNumber(summary.total_liters, 'L')}</p>
          </div>
          <div className="card p-4 border-l-4 border-green-500 text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase">Tổng chi phí</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{fmtCurrency(summary.total_cost)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="label">Từ ngày</label>
          <input type="date" className="input w-40" value={filters.from} onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} />
        </div>
        <div>
          <label className="label">Đến ngày</label>
          <input type="date" className="input w-40" value={filters.to} onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} />
        </div>
        <div>
          <label className="label">Vỏ container</label>
          <select className="input w-44" value={filters.container_id} onChange={e => setFilters(f => ({ ...f, container_id: e.target.value }))}>
            <option value="">Tất cả vỏ</option>
            {containers?.map(c => <option key={c.id} value={c.id}>{c.container_number}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? <div className="py-12 text-center text-gray-400">Đang tải...</div>
          : !logs?.length ? <div className="py-12 text-center text-gray-400">Không có dữ liệu</div>
          : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="table-th">Ngày</th>
                  <th className="table-th">Vỏ Container</th>
                  <th className="table-th">Tài xế</th>
                  <th className="table-th">Trạm xăng</th>
                  <th className="table-th text-right">Số lít</th>
                  <th className="table-th text-right">Đơn giá</th>
                  <th className="table-th text-right">Thành tiền</th>
                  <th className="table-th">KM đồng hồ</th>
                  <th className="table-th" />
                </tr>
              </thead>
              <tbody>
                {logs.map(f => (
                  <tr key={f.id} className="table-tr">
                    <td className="table-td font-medium">{f.fill_date}</td>
                    <td className="table-td font-mono font-semibold text-blue-600">{f.container_number || '—'}</td>
                    <td className="table-td">{f.driver_name || '—'}</td>
                    <td className="table-td text-gray-500 text-xs">{f.station || '—'}</td>
                    <td className="table-td text-right font-semibold">{fmtNumber(f.liters)} L</td>
                    <td className="table-td text-right text-gray-500">{fmtNumber(f.price_per_liter)} đ</td>
                    <td className="table-td text-right font-bold text-green-700">{fmtCurrency(f.total_cost)}</td>
                    <td className="table-td text-gray-500">{f.odometer ? fmtNumber(f.odometer) + ' km' : '—'}</td>
                    <td className="table-td">
                      <div className="flex gap-1">
                        <button onClick={() => setModal({ type: 'edit', data: f })} className="btn btn-secondary py-1 text-xs">Sửa</button>
                        <button onClick={() => handleDelete(f)} className="btn btn-danger py-1 text-xs">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t font-semibold">
                <tr>
                  <td colSpan={4} className="table-td text-gray-600">Tổng cộng ({logs.length} phiếu)</td>
                  <td className="table-td text-right">{fmtNumber(logs.reduce((s, f) => s + f.liters, 0))} L</td>
                  <td />
                  <td className="table-td text-right text-green-700">{fmtCurrency(logs.reduce((s, f) => s + f.total_cost, 0))}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          )}
      </div>

      {modal?.type === 'create' && <FuelModal record={null} onClose={() => setModal(null)} onSaved={done} />}
      {modal?.type === 'edit'   && <FuelModal record={modal.data} onClose={() => setModal(null)} onSaved={done} />}
    </div>
  );
}
