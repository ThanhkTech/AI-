import { useState } from 'react';
import { useFetch, api } from '../hooks/useApi';
import { DRIVER_STATUSES, ORDER_STATUSES, fmtDate } from '../constants';
import { DriverStatusBadge, OrderStatusBadge } from '../components/Badge';
import DriverModal from '../components/DriverModal';
import Modal from '../components/Modal';

function DetailPanel({ id, onClose, onEdit }) {
  const { data, loading } = useFetch(`/api/drivers/${id}`);
  if (loading || !data) return <Modal title="Chi tiết Tài xế" onClose={onClose}><div className="p-8 text-center text-gray-400">Đang tải...</div></Modal>;

  return (
    <Modal title={`Tài xế: ${data.name}`} onClose={onClose}>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
            {data.name.charAt(0)}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-800">{data.name}</p>
            <DriverStatusBadge status={data.driver_status} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[['SĐT', data.phone || '—'], ['Biển số xe', data.license_plate || '—'], ['Ghi chú', data.notes || '—'], ['Tham gia', fmtDate(data.created_at)]].map(([l, v]) => (
            <div key={l} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">{l}</p>
              <p className="text-sm font-medium">{v}</p>
            </div>
          ))}
        </div>

        {data.orders?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Đơn hàng gần đây</h3>
            <div className="space-y-2">
              {data.orders.map(o => (
                <div key={o.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                  <span className="font-mono font-semibold text-blue-600">{o.order_number}</span>
                  <span className="text-xs text-gray-500 font-mono">{o.container_number}</span>
                  <OrderStatusBadge status={o.order_status} small />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end"><button onClick={onEdit} className="btn btn-primary">Chỉnh sửa</button></div>
      </div>
    </Modal>
  );
}

export default function Drivers() {
  const [filter, setFilter] = useState('');
  const [modal, setModal] = useState(null);

  const params = filter !== '' ? `?driver_status=${filter}` : '';
  const { data: drivers, loading, refetch } = useFetch(`/api/drivers${params}`);

  const handleDelete = async (d) => {
    if (!window.confirm(`Xóa tài xế ${d.name}?`)) return;
    try { await api('DELETE', `/api/drivers/${d.id}`); refetch(); } catch (e) { alert(e.message); }
  };

  const done = () => { setModal(null); refetch(); };

  const counts = { total: drivers?.length || 0, available: drivers?.filter(d => d.driver_status === 0).length || 0, busy: drivers?.filter(d => d.driver_status === 1).length || 0 };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tài xế</h1>
          <p className="text-sm text-gray-500">Driver Management</p>
        </div>
        <button onClick={() => setModal({ type: 'create' })} className="btn btn-primary"><span>+</span> Thêm tài xế</button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[['Tổng tài xế', counts.total, 'bg-blue-50 text-blue-700 border-blue-200'],
          ['Sẵn sàng', counts.available, 'bg-green-50 text-green-700 border-green-200'],
          ['Đang chạy', counts.busy, 'bg-orange-50 text-orange-700 border-orange-200']].map(([l, v, c]) => (
          <div key={l} className={`rounded-xl p-4 border text-center ${c}`}>
            <p className="text-2xl font-bold">{v}</p>
            <p className="text-xs font-semibold mt-0.5">{l}</p>
          </div>
        ))}
      </div>

      <div className="card p-4 flex gap-3">
        <select className="input w-52" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {DRIVER_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {/* Driver cards */}
      {loading ? <div className="py-16 text-center text-gray-400">Đang tải...</div>
        : !drivers?.length ? <div className="py-16 text-center text-gray-400">Không có tài xế</div>
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map(d => (
              <div key={d.id} className="card p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${d.driver_status === 1 ? 'bg-gradient-to-br from-blue-400 to-blue-600' : d.driver_status === 2 ? 'bg-gray-300' : 'bg-gradient-to-br from-green-400 to-green-600'}`}>
                    {d.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate">{d.name}</p>
                    <DriverStatusBadge status={d.driver_status} small />
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm text-gray-500">
                  <p>📞 {d.phone || '—'}</p>
                  <p>🚛 {d.license_plate || '—'}</p>
                  {d.active_orders > 0 && <p className="text-blue-600 text-xs font-medium">📦 {d.active_orders} đơn đang xử lý</p>}
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button onClick={() => setModal({ type: 'detail', data: d })} className="btn btn-secondary py-1 text-xs flex-1">Chi tiết</button>
                  <button onClick={() => setModal({ type: 'edit', data: d })} className="btn btn-secondary py-1 text-xs">Sửa</button>
                  <button onClick={() => handleDelete(d)} className="btn btn-danger py-1 text-xs">Xóa</button>
                </div>
              </div>
            ))}
          </div>
        )}

      {modal?.type === 'create' && <DriverModal driver={null} onClose={() => setModal(null)} onSaved={done} />}
      {modal?.type === 'edit' && <DriverModal driver={modal.data} onClose={() => setModal(null)} onSaved={done} />}
      {modal?.type === 'detail' && <DetailPanel id={modal.data.id} onClose={() => setModal(null)} onEdit={() => setModal({ type: 'edit', data: modal.data })} />}
    </div>
  );
}
