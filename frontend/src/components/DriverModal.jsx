import { useState, useEffect } from 'react';
import Modal from './Modal';
import { DRIVER_STATUSES } from '../constants';
import { api } from '../hooks/useApi';

export default function DriverModal({ driver, onClose, onSaved }) {
  const isEdit = !!driver?.id;
  const [form, setForm] = useState({ name: '', phone: '', license_plate: '', driver_status: 0, notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (driver) setForm({ name: driver.name || '', phone: driver.phone || '', license_plate: driver.license_plate || '', driver_status: driver.driver_status ?? 0, notes: driver.notes || '' });
  }, [driver]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (isEdit) await api('PUT', `/api/drivers/${driver.id}`, form);
      else await api('POST', '/api/drivers', form);
      onSaved();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={isEdit ? 'Cập nhật Tài xế' : 'Thêm Tài xế mới'} onClose={onClose} size="sm">
      <form onSubmit={submit} className="p-6 space-y-4">
        {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>}
        <div>
          <label className="label">Họ tên *</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Nguyễn Văn An" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Số điện thoại</label>
            <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="09xxxxxxxx" />
          </div>
          <div>
            <label className="label">Biển số xe</label>
            <input className="input" value={form.license_plate} onChange={e => set('license_plate', e.target.value)} placeholder="30H-12345" />
          </div>
        </div>
        <div>
          <label className="label">Trạng thái</label>
          <select className="input" value={form.driver_status} onChange={e => set('driver_status', parseInt(e.target.value))}>
            {DRIVER_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Ghi chú</label>
          <textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn btn-secondary">Hủy</button>
          <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}</button>
        </div>
      </form>
    </Modal>
  );
}
