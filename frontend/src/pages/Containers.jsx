import { useState } from 'react';
import { useFetch, api } from '../hooks/useApi';
import { CONTAINER_STATUSES, LOCATIONS, fmtDate, ORDER_STATUSES } from '../constants';
import { ContainerStatusBadge, OrderStatusBadge } from '../components/Badge';
import ContainerModal from '../components/ContainerModal';
import Modal from '../components/Modal';

function DetailPanel({ id, onClose, onEdit }) {
  const { data, loading, refetch } = useFetch(`/api/containers/${id}`);

  if (loading || !data) return (
    <Modal title="Chi tiết Vỏ Container" onClose={onClose} size="lg">
      <div className="p-8 text-center text-gray-400">Đang tải...</div>
    </Modal>
  );

  return (
    <Modal title={`Chi tiết: ${data.container_number}`} onClose={onClose} size="lg">
      <div className="p-6 space-y-5">
        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Số container', <span className="font-mono font-semibold">{data.container_number}</span>],
            ['Kích thước', data.size],
            ['Trạng thái vỏ', <ContainerStatusBadge status={data.container_status} />],
            ['Vị trí', data.location],
            ['Ghi chú', data.notes || '—'],
            ['Cập nhật lúc', fmtDate(data.updated_at)],
          ].map(([l, v]) => (
            <div key={l} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-medium mb-0.5">{l}</p>
              <p className="text-sm font-medium text-gray-800">{v}</p>
            </div>
          ))}
        </div>

        {/* Active orders */}
        {data.orders?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Đơn hàng liên quan</h3>
            <div className="space-y-2">
              {data.orders.map(o => (
                <div key={o.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5 text-sm">
                  <span className="font-mono font-semibold text-blue-600">{o.order_number}</span>
                  <span className="text-gray-600">{o.customer}</span>
                  <OrderStatusBadge status={o.order_status} small />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History log */}
        {data.log?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Lịch sử thay đổi</h3>
            <div className="space-y-1.5">
              {data.log.map((l, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-500 flex-1">
                    <span className="font-medium text-gray-700">{l.field === 'container_status'
                      ? `${CONTAINER_STATUSES[l.old_value]?.label || l.old_value} → ${CONTAINER_STATUSES[l.new_value]?.label || l.new_value}`
                      : l.field === 'location' ? `${l.old_value} → ${l.new_value}` : l.field
                    }</span>
                    <span className="text-gray-400 ml-2">{fmtDate(l.created_at)}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={onEdit} className="btn btn-primary">Chỉnh sửa</button>
        </div>
      </div>
    </Modal>
  );
}

export default function Containers() {
  const [filters, setFilters] = useState({ container_status: '', location: '', search: '' });
  const [modal, setModal] = useState(null);

  const params = new URLSearchParams();
  if (filters.container_status !== '') params.set('container_status', filters.container_status);
  if (filters.location) params.set('location', filters.location);
  if (filters.search) params.set('search', filters.search);

  const { data: containers, loading, refetch } = useFetch(`/api/containers?${params}`);

  const handleDelete = async (c) => {
    if (!window.confirm(`Xóa vỏ ${c.container_number}?`)) return;
    try {
      await api('DELETE', `/api/containers/${c.id}`);
      refetch();
    } catch (e) { alert(e.message); }
  };

  const done = () => { setModal(null); refetch(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vỏ Container</h1>
          <p className="text-sm text-gray-500">Container Fleet Management</p>
        </div>
        <button onClick={() => setModal({ type: 'create' })} className="btn btn-primary">
          <span className="text-base">+</span> Thêm vỏ
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <input className="input flex-1 min-w-[200px]" placeholder="🔍  Tìm số container, khách hàng..."
          value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
        <select className="input w-52" value={filters.container_status} onChange={e => setFilters(f => ({ ...f, container_status: e.target.value }))}>
          <option value="">Tất cả trạng thái vỏ</option>
          {CONTAINER_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select className="input w-48" value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}>
          <option value="">Tất cả vị trí</option>
          {LOCATIONS.map(l => <option key={l}>{l}</option>)}
        </select>
        {(filters.search || filters.container_status !== '' || filters.location) && (
          <button onClick={() => setFilters({ container_status: '', location: '', search: '' })} className="btn btn-secondary text-xs">✕ Xóa lọc</button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">Đang tải...</div>
        ) : !containers?.length ? (
          <div className="py-16 text-center text-gray-400">Không có dữ liệu</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-th">Số Container</th>
                <th className="table-th">Trạng thái Vỏ</th>
                <th className="table-th">Vị trí</th>
                <th className="table-th">Kích thước</th>
                <th className="table-th">Đơn hàng</th>
                <th className="table-th">Cập nhật</th>
                <th className="table-th" />
              </tr>
            </thead>
            <tbody>
              {containers.map(c => (
                <tr key={c.id} className="table-tr">
                  <td className="table-td">
                    <button onClick={() => setModal({ type: 'detail', data: c })} className="font-mono font-bold text-blue-600 hover:underline">
                      {c.container_number}
                    </button>
                    {c.container_status === 4 && <span className="ml-2 text-xs text-red-500">⚠ Sửa chữa</span>}
                  </td>
                  <td className="table-td"><ContainerStatusBadge status={c.container_status} /></td>
                  <td className="table-td">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      {c.location}
                    </span>
                  </td>
                  <td className="table-td text-gray-500">{c.size}</td>
                  <td className="table-td">
                    {c.order_number
                      ? <span className="text-xs font-mono text-blue-600">{c.order_number}</span>
                      : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="table-td text-xs text-gray-400">{fmtDate(c.updated_at)}</td>
                  <td className="table-td">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModal({ type: 'edit', data: c })} className="btn btn-secondary py-1 text-xs">Sửa</button>
                      <button onClick={() => handleDelete(c)} className="btn btn-danger py-1 text-xs">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-50">
          {containers?.length || 0} vỏ container
        </div>
      </div>

      {modal?.type === 'create' && <ContainerModal container={null} onClose={() => setModal(null)} onSaved={done} />}
      {modal?.type === 'edit' && <ContainerModal container={modal.data} onClose={() => setModal(null)} onSaved={done} />}
      {modal?.type === 'detail' && (
        <DetailPanel id={modal.data.id} onClose={() => setModal(null)} onEdit={() => setModal({ type: 'edit', data: modal.data })} />
      )}
    </div>
  );
}
