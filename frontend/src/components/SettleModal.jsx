import { useState } from 'react';
import Modal from './Modal';
import { api } from '../hooks/useApi';
import { fmtCurrency } from '../utils/format';

export default function SettleModal({ record, onClose, onSaved }) {
  const [form, setForm] = useState({ actual_cost: record.actual_cost || record.estimated_cost || '', settled_by: '', notes: record.notes || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api('POST', `/api/maintenance/${record.id}/settle`, form);
      onSaved();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal title="Quyết toán sửa chữa" onClose={onClose} size="sm">
      <form onSubmit={submit} className="p-6 space-y-4">
        <div className="bg-blue-50 rounded-xl p-4 space-y-1 text-sm">
          <p className="font-bold text-gray-700">{record.container_number} — {record.repair_type}</p>
          <p className="text-gray-500">{record.workshop || '—'}</p>
          <p className="text-gray-500">Chi phí dự kiến: <span className="font-semibold text-gray-700">{fmtCurrency(record.estimated_cost)}</span></p>
        </div>
        {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>}
        <div>
          <label className="label">Chi phí thực tế (đ) *</label>
          <input type="number" className="input text-lg font-bold" value={form.actual_cost} onChange={e => setForm(f => ({ ...f, actual_cost: e.target.value }))} required min="0" placeholder="7800000" />
        </div>
        <div>
          <label className="label">Người duyệt</label>
          <input className="input" value={form.settled_by} onChange={e => setForm(f => ({ ...f, settled_by: e.target.value }))} placeholder="Tên quản lý, giám đốc..." />
        </div>
        <div>
          <label className="label">Ghi chú quyết toán</label>
          <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn btn-secondary">Hủy</button>
          <button type="submit" disabled={saving} className="btn bg-green-600 text-white hover:bg-green-700">{saving ? 'Đang xử lý...' : '✓ Xác nhận quyết toán'}</button>
        </div>
      </form>
    </Modal>
  );
}
