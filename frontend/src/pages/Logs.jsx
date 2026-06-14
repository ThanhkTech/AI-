import { useState } from 'react';
import { useFetch, api } from '../hooks/useApi';
import { fmtDateTime, fmtDate, fmtCurrency } from '../utils/format';
import { OrderStatusBadge } from '../components/Badge';
import Modal from '../components/Modal';

const EVENT_TYPES = [
  { id: 'depart',   label: 'Xuất phát',   icon: '🚀', color: 'bg-blue-100 text-blue-700' },
  { id: 'pickup',   label: 'Lấy hàng',    icon: '📦', color: 'bg-orange-100 text-orange-700' },
  { id: 'transit',  label: 'Trung chuyển',icon: '🔄', color: 'bg-purple-100 text-purple-700' },
  { id: 'delay',    label: 'Sự cố / Trễ', icon: '⚠️', color: 'bg-red-100 text-red-700' },
  { id: 'deliver',  label: 'Giao hàng',   icon: '✅', color: 'bg-green-100 text-green-700' },
  { id: 'note',     label: 'Ghi chú',     icon: '📝', color: 'bg-gray-100 text-gray-700' },
];

function EventBadge({ type }) {
  const e = EVENT_TYPES.find(x => x.id === type) || EVENT_TYPES[5];
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${e.color}`}>{e.icon} {e.label}</span>;
}

function AddTripLogModal({ orderId, onClose, onSaved }) {
  const [form, setForm] = useState({ event_type: 'note', location: '', description: '', timestamp: new Date().toISOString().slice(0, 16) });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api('POST', '/api/trips', { order_id: orderId, ...form, timestamp: form.timestamp ? new Date(form.timestamp).toISOString() : undefined });
      onSaved();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal title="Thêm sự kiện hành trình" onClose={onClose} size="sm">
      <form onSubmit={submit} className="p-5 space-y-3">
        <div>
          <label className="label">Loại sự kiện</label>
          <select className="input" value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))}>
            {EVENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Địa điểm</label>
          <input className="input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="KCN Thăng Long, Hà Nội" />
        </div>
        <div>
          <label className="label">Mô tả</label>
          <textarea className="input" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Đã hoàn thành lấy hàng..." />
        </div>
        <div>
          <label className="label">Thời điểm</label>
          <input type="datetime-local" className="input" value={form.timestamp} onChange={e => setForm(f => ({ ...f, timestamp: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn btn-secondary">Hủy</button>
          <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Đang lưu...' : 'Thêm'}</button>
        </div>
      </form>
    </Modal>
  );
}

function JourneyDetail({ order, onClose }) {
  const { data, loading, refetch } = useFetch(order ? `/api/trips/order/${order.id}` : null);
  const [addLog, setAddLog] = useState(false);

  if (loading || !data) return <Modal title="Nhật ký hành trình" onClose={onClose} size="xl"><div className="p-8 text-center text-gray-400">Đang tải...</div></Modal>;

  const o = data.order;

  return (
    <Modal title={`Nhật ký hành trình — ${o.order_number}`} onClose={onClose} size="xl">
      <div className="p-6 space-y-5">
        {/* Order summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-xs text-gray-400">Số đơn</p><p className="font-bold text-blue-700">{o.order_number}</p></div>
          <div><p className="text-xs text-gray-400">Trạng thái</p><OrderStatusBadge status={o.order_status} /></div>
          <div><p className="text-xs text-gray-400">Vỏ container</p><p className="font-mono font-bold">{o.container_number || '—'}</p></div>
          <div><p className="text-xs text-gray-400">Tài xế</p><p className="font-medium">{o.driver_name || '—'} {o.license_plate ? `(${o.license_plate})` : ''}</p></div>
          <div><p className="text-xs text-gray-400">Điểm lấy</p><p>{o.pickup_address || '—'}</p></div>
          <div><p className="text-xs text-gray-400">Điểm giao</p><p>{o.delivery_address || '—'}</p></div>
          <div><p className="text-xs text-gray-400">Khách hàng</p><p>{o.customer || '—'}</p></div>
          <div><p className="text-xs text-gray-400">Loại hàng</p><p>{o.cargo_type || '—'}</p></div>
        </div>

        {/* Timeline */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-700">📍 Lịch sử hành trình ({data.logs.length} sự kiện)</h3>
            <button onClick={() => setAddLog(true)} className="btn btn-secondary text-xs py-1">+ Thêm sự kiện</button>
          </div>
          {data.logs.length === 0
            ? <p className="text-sm text-gray-400 text-center py-4">Chưa có sự kiện nào</p>
            : (
              <div className="space-y-2">
                {data.logs.map((l, i) => (
                  <div key={l.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm flex-shrink-0">
                        {EVENT_TYPES.find(e => e.id === l.event_type)?.icon || '📝'}
                      </div>
                      {i < data.logs.length - 1 && <div className="w-0.5 h-4 bg-gray-200 mt-1" />}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl p-3 text-sm">
                      <div className="flex items-center gap-2 flex-wrap">
                        <EventBadge type={l.event_type} />
                        {l.location && <span className="text-xs text-gray-500">📌 {l.location}</span>}
                        <span className="text-xs text-gray-400 ml-auto">{fmtDateTime(l.timestamp)}</span>
                      </div>
                      {l.description && <p className="text-gray-700 mt-1">{l.description}</p>}
                      {l.driver_name && <p className="text-xs text-gray-400 mt-0.5">👤 {l.driver_name}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Fuel used on this trip */}
        {data.fuel?.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-2">⛽ Nhiên liệu trong chuyến ({data.fuel.length} lần)</h3>
            <div className="space-y-1.5">
              {data.fuel.map(f => (
                <div key={f.id} className="flex items-center justify-between bg-orange-50 rounded-lg px-3 py-2 text-sm">
                  <span className="text-gray-600">{fmtDate(f.fill_date)} — {f.station || '—'}</span>
                  <span className="font-semibold">{f.liters} L</span>
                  <span className="text-orange-700 font-bold">{fmtCurrency(f.total_cost)}</span>
                </div>
              ))}
              <div className="flex justify-end text-sm font-bold text-orange-700 px-3">
                Tổng: {fmtCurrency(data.fuel.reduce((s, f) => s + f.total_cost, 0))}
              </div>
            </div>
          </div>
        )}
      </div>

      {addLog && <AddTripLogModal orderId={order.id} onClose={() => setAddLog(false)} onSaved={() => { setAddLog(false); refetch(); }} />}
    </Modal>
  );
}

export default function Logs() {
  const [tab, setTab] = useState('journey');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data: orders } = useFetch('/api/orders');
  const { data: allLogs } = useFetch('/api/trips');

  const activeOrders = orders?.filter(o => o.order_status < 5) || [];
  const doneOrders   = orders?.filter(o => o.order_status >= 5) || [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Nhật ký vận hành</h1>
        <p className="text-sm text-gray-500">Operation Logs</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
        {[['journey', '📍 Nhật ký hành trình'], ['maintenance_log', '🔧 Nhật ký sửa chữa']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === id ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'journey' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Order list */}
          <div className="card p-4 space-y-3">
            <h2 className="text-sm font-bold text-gray-700">Chọn đơn hàng để xem nhật ký</h2>

            {activeOrders.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1.5">Đang vận hành</p>
                <div className="space-y-1">
                  {activeOrders.map(o => (
                    <button key={o.id} onClick={() => setSelectedOrder(o)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition ${selectedOrder?.id === o.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>
                      <p className="font-mono font-bold">{o.order_number}</p>
                      <p className={`text-xs ${selectedOrder?.id === o.id ? 'text-blue-200' : 'text-gray-400'}`}>{o.customer || '—'} · {o.container_number || '—'}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {doneOrders.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1.5">Hoàn thành / Hủy</p>
                <div className="space-y-1">
                  {doneOrders.map(o => (
                    <button key={o.id} onClick={() => setSelectedOrder(o)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition ${selectedOrder?.id === o.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-50 text-gray-500'}`}>
                      <p className="font-mono font-semibold">{o.order_number}</p>
                      <p className={`text-xs ${selectedOrder?.id === o.id ? 'text-blue-200' : 'text-gray-400'}`}>{o.customer || '—'}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Journal detail */}
          <div className="lg:col-span-2">
            {!selectedOrder
              ? (
                <div className="card p-8 text-center text-gray-400 h-full flex flex-col items-center justify-center gap-2">
                  <span className="text-4xl">📋</span>
                  <p className="text-sm">Chọn một đơn hàng bên trái để xem nhật ký hành trình</p>
                </div>
              )
              : <InlineJourney order={selectedOrder} />
            }
          </div>
        </div>
      )}

      {tab === 'maintenance_log' && <MaintenanceLogs />}
    </div>
  );
}

function InlineJourney({ order }) {
  const { data, loading, refetch } = useFetch(`/api/trips/order/${order.id}`);
  const [addLog, setAddLog] = useState(false);

  if (loading || !data) return <div className="card p-8 text-center text-gray-400">Đang tải...</div>;

  const o = data.order;

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono font-bold text-lg text-blue-700">{o.order_number}</p>
          <p className="text-sm text-gray-500">{o.customer} · <span className="font-mono">{o.container_number || '—'}</span> · {o.driver_name || 'Chưa phân công'}</p>
        </div>
        <button onClick={() => setAddLog(true)} className="btn btn-primary text-xs py-1">+ Sự kiện</button>
      </div>

      {/* Route */}
      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        <span className="font-medium text-gray-700">{o.pickup_address || '—'}</span>
        <span className="text-gray-300">→→→</span>
        <span className="font-medium text-gray-700">{o.delivery_address || '—'}</span>
      </div>

      {/* Timeline */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {data.logs.length === 0
          ? <p className="text-sm text-gray-400 text-center py-4">Chưa có sự kiện nào</p>
          : data.logs.map((l, i) => (
            <div key={l.id} className="flex items-start gap-2">
              <div className="flex flex-col items-center">
                <span className="text-base">{EVENT_TYPES.find(e => e.id === l.event_type)?.icon || '📝'}</span>
                {i < data.logs.length - 1 && <div className="w-px h-3 bg-gray-200 mt-0.5" />}
              </div>
              <div className="flex-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">{EVENT_TYPES.find(e => e.id === l.event_type)?.label}</span>
                  {l.location && <span className="text-xs text-gray-400">· {l.location}</span>}
                  <span className="text-xs text-gray-300 ml-auto">{fmtDateTime(l.timestamp)}</span>
                </div>
                {l.description && <p className="text-xs text-gray-500 mt-0.5">{l.description}</p>}
              </div>
            </div>
          ))
        }
      </div>

      {/* Fuel summary */}
      {data.fuel?.length > 0 && (
        <div className="bg-orange-50 rounded-lg px-3 py-2 text-xs text-orange-700 flex items-center justify-between">
          <span>⛽ {data.fuel.length} lần đổ dầu</span>
          <span className="font-bold">{fmtCurrency(data.fuel.reduce((s, f) => s + f.total_cost, 0))}</span>
        </div>
      )}

      {addLog && <AddTripLogModal orderId={order.id} onClose={() => setAddLog(false)} onSaved={() => { setAddLog(false); refetch(); }} />}
    </div>
  );
}

function MaintenanceLogs() {
  const { data: containers } = useFetch('/api/containers');
  const [selected, setSelected] = useState(null);
  const { data, loading } = useFetch(selected ? `/api/reports/maintenance-log/${selected}` : null);
  const { MaintenanceStatusBadge } = require('../components/MaintenanceModal');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="card p-4 space-y-1">
        <h2 className="text-sm font-bold text-gray-700 mb-2">Chọn vỏ container</h2>
        {containers?.map(c => (
          <button key={c.id} onClick={() => setSelected(c.id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition ${selected === c.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>
            <p className="font-mono font-bold">{c.container_number}</p>
            <p className={`text-xs ${selected === c.id ? 'text-blue-200' : 'text-gray-400'}`}>{c.size} · {c.location}</p>
          </button>
        ))}
      </div>

      <div className="lg:col-span-2">
        {!selected ? (
          <div className="card p-8 text-center text-gray-400 flex flex-col items-center justify-center gap-2 h-full">
            <span className="text-4xl">🔧</span>
            <p className="text-sm">Chọn vỏ container để xem nhật ký sửa chữa</p>
          </div>
        ) : loading ? (
          <div className="card p-8 text-center text-gray-400">Đang tải...</div>
        ) : data ? (
          <div className="card p-5 space-y-4">
            <div>
              <p className="font-mono font-bold text-lg">{data.container?.container_number}</p>
              <p className="text-xs text-gray-400">{data.container?.size} · {data.container?.location}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-xl font-bold">{data.summary.total_repairs}</p><p className="text-xs text-gray-400">Lần sửa</p></div>
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-xl font-bold">{data.summary.settled}</p><p className="text-xs text-gray-400">Đã quyết toán</p></div>
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-sm font-bold text-green-700">{fmtCurrency(data.summary.total_cost)}</p><p className="text-xs text-gray-400">Tổng chi phí</p></div>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {data.records.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">Chưa có lần sửa chữa nào</p>
                : data.records.map(r => (
                  <div key={r.id} className="bg-gray-50 rounded-xl p-3 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{r.repair_type}</span>
                      <MaintenanceStatusBadge status={r.status} />
                      {r.settled && <span className="text-xs text-green-600">✓ QT</span>}
                    </div>
                    <p className="text-xs text-gray-500">{r.workshop || '—'} · {fmtDate(r.start_date)} → {fmtDate(r.end_date)}</p>
                    {r.description && <p className="text-xs text-gray-600 mt-1">{r.description}</p>}
                    <div className="flex gap-4 mt-1 text-xs">
                      <span>Dự kiến: <b>{fmtCurrency(r.estimated_cost)}</b></span>
                      {r.actual_cost && <span>Thực tế: <b className="text-green-700">{fmtCurrency(r.actual_cost)}</b></span>}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
