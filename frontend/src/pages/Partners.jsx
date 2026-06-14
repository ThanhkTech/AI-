import { useState } from 'react';
import { useFetch, api } from '../hooks/useApi';
import { fmtDateTime } from '../utils/format';
import { OrderStatusBadge } from '../components/Badge';
import Modal from '../components/Modal';

function PartnerModal({ partner, onClose, onSaved }) {
  const isEdit = !!partner?.id;
  const [form, setForm] = useState({ name: partner?.name || '', short_name: partner?.short_name || '', phone: partner?.phone || '', contact_person: partner?.contact_person || '', email: partner?.email || '', notes: partner?.notes || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (isEdit) await api('PUT', `/api/partners/${partner.id}`, form);
      else        await api('POST', '/api/partners', form);
      onSaved();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={isEdit ? 'Cập nhật Đối tác' : 'Thêm Đối tác mới'} onClose={onClose} size="md">
      <form onSubmit={submit} className="p-6 space-y-4">
        {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>}
        <div>
          <label className="label">Tên công ty / đối tác *</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Công ty TNHH Vận tải Hoàng Long" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Tên ngắn</label>
            <input className="input" value={form.short_name} onChange={e => set('short_name', e.target.value)} placeholder="Hoàng Long" />
          </div>
          <div>
            <label className="label">Số điện thoại</label>
            <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="024-3856-1234" />
          </div>
          <div>
            <label className="label">Người liên hệ</label>
            <input className="input" value={form.contact_person} onChange={e => set('contact_person', e.target.value)} placeholder="Nguyễn Văn An" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="contact@company.com" />
          </div>
        </div>
        <div>
          <label className="label">Ghi chú</label>
          <textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Chuyên tuyến, đặc điểm..." />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn btn-secondary">Hủy</button>
          <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm đối tác'}</button>
        </div>
      </form>
    </Modal>
  );
}

function DetailPanel({ id, onClose, onEdit }) {
  const { data, loading } = useFetch(`/api/partners/${id}`);
  if (loading || !data) return <Modal title="Chi tiết Đối tác" onClose={onClose}><div className="p-8 text-center text-gray-400">Đang tải...</div></Modal>;

  return (
    <Modal title={data.name} onClose={onClose} size="lg">
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Tên ngắn', data.short_name || '—'],
            ['SĐT', data.phone || '—'],
            ['Người liên hệ', data.contact_person || '—'],
            ['Email', data.email || '—'],
            ['Ghi chú', data.notes || '—'],
            ['Tham gia', fmtDateTime(data.created_at)],
          ].map(([l, v]) => (
            <div key={l} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">{l}</p>
              <p className="text-sm font-medium">{v}</p>
            </div>
          ))}
        </div>
        {data.orders?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Đơn hàng gần đây</h3>
            <div className="space-y-1.5">
              {data.orders.map(o => (
                <div key={o.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                  <span className="font-mono font-semibold text-blue-600">{o.order_number}</span>
                  <span className="text-xs text-gray-500 font-mono">{o.container_number || '—'}</span>
                  <OrderStatusBadge status={o.order_status} small />
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

export default function Partners() {
  const [modal, setModal] = useState(null);
  const { data: partners, loading, refetch } = useFetch('/api/partners');

  const handleDelete = async (p) => {
    if (!window.confirm(`Xóa đối tác "${p.name}"?`)) return;
    try { await api('DELETE', `/api/partners/${p.id}`); refetch(); } catch (e) { alert(e.message); }
  };

  const done = () => { setModal(null); refetch(); };

  const total   = partners?.length || 0;
  const active  = partners?.filter(p => p.active_orders > 0).length || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Đối tác vận chuyển</h1>
          <p className="text-sm text-gray-500">Transport Partners — Đơn vị đến lấy vỏ container</p>
        </div>
        <button onClick={() => setModal({ type: 'create' })} className="btn btn-primary"><span>+</span> Thêm đối tác</button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 border-l-4 border-blue-500 text-center">
          <p className="text-2xl font-bold">{total}</p><p className="text-xs text-gray-500 mt-0.5">Tổng đối tác</p>
        </div>
        <div className="card p-4 border-l-4 border-green-500 text-center">
          <p className="text-2xl font-bold text-green-700">{active}</p><p className="text-xs text-gray-500 mt-0.5">Đang có đơn</p>
        </div>
        <div className="card p-4 border-l-4 border-gray-400 text-center">
          <p className="text-2xl font-bold text-gray-500">{total - active}</p><p className="text-xs text-gray-500 mt-0.5">Chưa có đơn</p>
        </div>
      </div>

      {loading ? <div className="py-16 text-center text-gray-400">Đang tải...</div>
        : !partners?.length ? <div className="py-16 text-center text-gray-400">Chưa có đối tác nào</div>
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map(p => (
              <div key={p.id} className="card p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {(p.short_name || p.name).charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm leading-tight truncate">{p.name}</p>
                    {p.short_name && <p className="text-xs text-blue-600 font-medium">{p.short_name}</p>}
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-sm text-gray-500">
                  {p.contact_person && <p>👤 {p.contact_person}</p>}
                  {p.phone && <p>📞 {p.phone}</p>}
                  {p.email && <p className="truncate">✉️ {p.email}</p>}
                  {p.notes && <p className="text-xs text-gray-400 italic">{p.notes}</p>}
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 text-xs">
                  <span className="flex-1 text-gray-500">
                    📦 <b>{p.total_orders}</b> đơn
                    {p.active_orders > 0 && <span className="ml-1 text-blue-600 font-semibold">({p.active_orders} đang xử lý)</span>}
                  </span>
                </div>

                <div className="flex gap-2 mt-2">
                  <button onClick={() => setModal({ type: 'detail', data: p })} className="btn btn-secondary py-1 text-xs flex-1">Chi tiết</button>
                  <button onClick={() => setModal({ type: 'edit', data: p })} className="btn btn-secondary py-1 text-xs">Sửa</button>
                  <button onClick={() => handleDelete(p)} className="btn btn-danger py-1 text-xs">Xóa</button>
                </div>
              </div>
            ))}
          </div>
        )}

      {modal?.type === 'create' && <PartnerModal partner={null} onClose={() => setModal(null)} onSaved={done} />}
      {modal?.type === 'edit'   && <PartnerModal partner={modal.data} onClose={() => setModal(null)} onSaved={done} />}
      {modal?.type === 'detail' && <DetailPanel id={modal.data.id} onClose={() => setModal(null)} onEdit={() => setModal({ type: 'edit', data: modal.data })} />}
    </div>
  );
}
