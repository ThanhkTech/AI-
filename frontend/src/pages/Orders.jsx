import { useState } from 'react';
import { useFetch, api } from '../hooks/useApi';
import { ORDER_STATUSES, CONTAINER_STATUSES, fmtDate } from '../constants';
import { OrderStatusBadge, ContainerStatusBadge } from '../components/Badge';
import OrderModal from '../components/OrderModal';
import Modal from '../components/Modal';

const STATUS_FLOW = [0, 1, 2, 3, 4, 5];

function DetailPanel({ id, onClose, onEdit }) {
  const { data, loading } = useFetch(`/api/orders/${id}`);
  if (loading || !data) return <Modal title="Chi tiết đơn hàng" onClose={onClose} size="lg"><div className="p-8 text-center text-gray-400">Đang tải...</div></Modal>;

  return (
    <Modal title={`Đơn hàng: ${data.order_number}`} onClose={onClose} size="xl">
      <div className="p-6 space-y-5">
        {/* Status flow stepper */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Tiến trình đơn hàng</p>
          <div className="flex items-center">
            {STATUS_FLOW.map((sid, i) => {
              const s = ORDER_STATUSES[sid];
              const done = data.order_status > sid;
              const active = data.order_status === sid;
              return (
                <div key={sid} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${active ? s.color + ' ring-2 ' + s.ring : done ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-400'}`}>
                      {done ? '✓' : sid}
                    </div>
                    <p className={`text-center mt-1 text-[10px] leading-tight w-14 ${active ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>{s.label}</p>
                  </div>
                  {i < STATUS_FLOW.length - 1 && <div className={`flex-1 h-0.5 mx-1 mb-4 ${data.order_status > sid ? 'bg-green-400' : 'bg-gray-200'}`} />}
                </div>
              );
            })}
            {data.order_status === 6 && (
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">✕</div>
                <p className="text-[10px] text-red-400 mt-1">Hủy</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            ['Số đơn hàng', <span className="font-mono font-bold">{data.order_number}</span>],
            ['Trạng thái', <OrderStatusBadge status={data.order_status} />],
            ['Vỏ container', data.container_number ? <span className="font-mono text-blue-600">{data.container_number}</span> : '—'],
            ['Trạng thái vỏ', data.container_status !== undefined ? <ContainerStatusBadge status={data.container_status} /> : '—'],
            ['Vị trí vỏ', data.location || '—'],
            ['Tài xế', data.driver_name || '—'],
            ['Biển số', data.license_plate || '—'],
            ['SĐT tài xế', data.driver_phone || '—'],
            ['Khách hàng', data.customer || '—'],
            ['Loại hàng', data.cargo_type || '—'],
            ['Điểm lấy hàng', data.pickup_address || '—'],
            ['Điểm giao hàng', data.delivery_address || '—'],
            ['Ghi chú', data.notes || '—'],
            ['Tạo lúc', fmtDate(data.created_at)],
          ].map(([l, v]) => (
            <div key={l} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-medium mb-0.5">{l}</p>
              <div className="text-sm font-medium text-gray-800">{v}</div>
            </div>
          ))}
        </div>

        {data.log?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Lịch sử thay đổi</h3>
            <div className="space-y-1.5">
              {data.log.map((l, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">
                    {l.field === 'order_status'
                      ? `${ORDER_STATUSES[l.old_value]?.label || l.old_value} → ${ORDER_STATUSES[l.new_value]?.label || l.new_value}`
                      : l.field === 'created' ? `Tạo đơn hàng` : `${l.field}: ${l.old_value} → ${l.new_value}`
                    }
                    <span className="text-gray-400 ml-2">{fmtDate(l.created_at)}</span>
                  </span>
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

export default function Orders() {
  const [filters, setFilters] = useState({ order_status: '', search: '' });
  const [modal, setModal] = useState(null);

  const params = new URLSearchParams();
  if (filters.order_status !== '') params.set('order_status', filters.order_status);
  if (filters.search) params.set('search', filters.search);

  const { data: orders, loading, refetch } = useFetch(`/api/orders?${params}`);

  const handleDelete = async (o) => {
    if (!window.confirm(`Xóa đơn hàng ${o.order_number}?`)) return;
    try { await api('DELETE', `/api/orders/${o.id}`); refetch(); } catch (e) { alert(e.message); }
  };

  const done = () => { setModal(null); refetch(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Đơn hàng</h1>
          <p className="text-sm text-gray-500">Order Management</p>
        </div>
        <button onClick={() => setModal({ type: 'create' })} className="btn btn-primary"><span>+</span> Tạo đơn hàng</button>
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <input className="input flex-1 min-w-[220px]" placeholder="🔍  Tìm số đơn, khách hàng, số container..."
          value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
        <select className="input w-52" value={filters.order_status} onChange={e => setFilters(f => ({ ...f, order_status: e.target.value }))}>
          <option value="">Tất cả trạng thái</option>
          {ORDER_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        {(filters.search || filters.order_status !== '') && (
          <button onClick={() => setFilters({ order_status: '', search: '' })} className="btn btn-secondary text-xs">✕ Xóa lọc</button>
        )}
      </div>

      <div className="card overflow-hidden">
        {loading ? <div className="py-16 text-center text-gray-400">Đang tải...</div>
          : !orders?.length ? <div className="py-16 text-center text-gray-400">Không có đơn hàng</div>
          : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-th">Số đơn</th>
                  <th className="table-th">Trạng thái đơn</th>
                  <th className="table-th">Vỏ Container</th>
                  <th className="table-th">Tài xế</th>
                  <th className="table-th">Khách hàng</th>
                  <th className="table-th">Loại hàng</th>
                  <th className="table-th">Cập nhật</th>
                  <th className="table-th" />
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="table-tr">
                    <td className="table-td">
                      <button onClick={() => setModal({ type: 'detail', data: o })} className="font-mono font-bold text-blue-600 hover:underline">{o.order_number}</button>
                    </td>
                    <td className="table-td"><OrderStatusBadge status={o.order_status} /></td>
                    <td className="table-td">
                      {o.container_number
                        ? <div>
                            <p className="font-mono text-xs font-semibold text-gray-700">{o.container_number}</p>
                            <ContainerStatusBadge status={o.container_status} small />
                          </div>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="table-td">
                      {o.driver_name
                        ? <div>
                            <p className="text-sm font-medium">{o.driver_name}</p>
                            <p className="text-xs text-gray-400">{o.license_plate}</p>
                          </div>
                        : <span className="text-gray-400 text-xs">Chưa phân công</span>}
                    </td>
                    <td className="table-td">{o.customer || '—'}</td>
                    <td className="table-td text-gray-500 text-xs">{o.cargo_type || '—'}</td>
                    <td className="table-td text-xs text-gray-400">{fmtDate(o.updated_at)}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal({ type: 'edit', data: o })} className="btn btn-secondary py-1 text-xs">Sửa</button>
                        <button onClick={() => handleDelete(o)} className="btn btn-danger py-1 text-xs">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        <div className="px-4 py-2 text-xs text-gray-400 border-t">{orders?.length || 0} đơn hàng</div>
      </div>

      {modal?.type === 'create' && <OrderModal order={null} onClose={() => setModal(null)} onSaved={done} />}
      {modal?.type === 'edit' && <OrderModal order={modal.data} onClose={() => setModal(null)} onSaved={done} />}
      {modal?.type === 'detail' && <DetailPanel id={modal.data.id} onClose={() => setModal(null)} onEdit={() => setModal({ type: 'edit', data: modal.data })} />}
    </div>
  );
}
