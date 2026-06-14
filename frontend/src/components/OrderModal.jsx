import { useState, useEffect } from 'react';
import Modal from './Modal';
import { ORDER_STATUSES, CONTAINER_STATUSES } from '../constants';
import { api, useFetch } from '../hooks/useApi';

export default function OrderModal({ order, onClose, onSaved }) {
  const isEdit = !!order?.id;
  const [form, setForm] = useState({ order_number: '', container_id: '', partner_id: '', order_status: 0, customer: '', cargo_type: '', pickup_address: '', delivery_address: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [suggest, setSuggest] = useState(null);

  const { data: containers } = useFetch('/api/containers');
  const { data: partners }   = useFetch('/api/partners');

  useEffect(() => {
    if (order) setForm({ order_number: order.order_number || '', container_id: order.container_id || '', partner_id: order.partner_id || '', order_status: order.order_status ?? 0, customer: order.customer || '', cargo_type: order.cargo_type || '', pickup_address: order.pickup_address || '', delivery_address: order.delivery_address || '', notes: order.notes || '' });
  }, [order]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleContainerChange = (cid) => {
    set('container_id', cid);
    if (cid && containers) {
      const c = containers.find(x => x.id === cid);
      if (c) {
        const map = { 0: 0, 1: 3, 2: 1, 3: null, 4: null };
        const suggested = map[c.container_status];
        if (suggested !== null && suggested !== undefined && suggested !== form.order_status)
          setSuggest({ label: ORDER_STATUSES[suggested].label, value: suggested });
      }
    }
  };

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { ...form, container_id: form.container_id || null, partner_id: form.partner_id || null };
      if (isEdit) await api('PUT', `/api/orders/${order.id}`, payload);
      else        await api('POST', '/api/orders', payload);
      onSaved();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={isEdit ? 'Cập nhật Đơn hàng' : 'Tạo Đơn hàng mới'} onClose={onClose} size="lg">
      <form onSubmit={submit} className="p-6 space-y-4">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>}
        {suggest && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-blue-700">💡 Trạng thái vỏ phù hợp — đề xuất đơn thành <b>{suggest.label}</b></span>
            <div className="flex gap-2 ml-3">
              <button type="button" onClick={() => { set('order_status', suggest.value); setSuggest(null); }} className="btn btn-primary py-1 text-xs">Áp dụng</button>
              <button type="button" onClick={() => setSuggest(null)} className="btn btn-secondary py-1 text-xs">Bỏ qua</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Số đơn hàng *</label>
            <input className="input" value={form.order_number} onChange={e => set('order_number', e.target.value)} placeholder="DH-2024-XXX" required disabled={isEdit} />
          </div>
          <div>
            <label className="label">Trạng thái đơn</label>
            <select className="input" value={form.order_status} onChange={e => set('order_status', parseInt(e.target.value))}>
              {ORDER_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Vỏ Container</label>
            <select className="input" value={form.container_id} onChange={e => handleContainerChange(e.target.value)}>
              <option value="">— Chưa gán vỏ —</option>
              {containers?.map(c => (
                <option key={c.id} value={c.id}>{c.container_number} ({CONTAINER_STATUSES[c.container_status]?.label} · {c.location})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Đối tác vận chuyển</label>
            <select className="input" value={form.partner_id} onChange={e => set('partner_id', e.target.value)}>
              <option value="">— Chưa có đối tác —</option>
              {partners?.map(p => <option key={p.id} value={p.id}>{p.short_name || p.name}{p.contact_person ? ` (${p.contact_person})` : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Khách hàng</label>
            <input className="input" value={form.customer} onChange={e => set('customer', e.target.value)} placeholder="Tên công ty / khách hàng" />
          </div>
          <div>
            <label className="label">Loại hàng</label>
            <input className="input" value={form.cargo_type} onChange={e => set('cargo_type', e.target.value)} placeholder="Điện tử, Dệt may, Thép..." />
          </div>
          <div>
            <label className="label">Điểm lấy hàng</label>
            <input className="input" value={form.pickup_address} onChange={e => set('pickup_address', e.target.value)} placeholder="KCN Thăng Long, Hà Nội" />
          </div>
          <div>
            <label className="label">Điểm giao hàng</label>
            <input className="input" value={form.delivery_address} onChange={e => set('delivery_address', e.target.value)} placeholder="Cảng Cát Lái, TP.HCM" />
          </div>
          <div className="col-span-2">
            <label className="label">Ghi chú</label>
            <textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">Hủy</button>
          <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo đơn hàng'}</button>
        </div>
      </form>
    </Modal>
  );
}
