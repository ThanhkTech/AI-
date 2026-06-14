import { useState, useEffect } from 'react';
import Modal from './Modal';
import { CONTAINER_STATUSES, LOCATIONS } from '../constants';
import { api } from '../hooks/useApi';

export default function ContainerModal({ container, onClose, onSaved }) {
  const isEdit = !!container?.id;
  const [form, setForm] = useState({ container_number: '', container_status: 0, location: 'Ga Đông Anh', size: '20ft', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (container) setForm({ container_number: container.container_number || '', container_status: container.container_status ?? 0, location: container.location || 'Ga Đông Anh', size: container.size || '20ft', notes: container.notes || '' });
  }, [container]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (isEdit) await api('PUT', `/api/containers/${container.id}`, form);
      else await api('POST', '/api/containers', form);
      onSaved();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={isEdit ? 'Cập nhật Vỏ Container' : 'Thêm Vỏ Container mới'} onClose={onClose}>
      <form onSubmit={submit} className="p-6 space-y-4">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>}
        <div>
          <label className="label">Số Container *</label>
          <input className="input font-mono uppercase" value={form.container_number} onChange={e => set('container_number', e.target.value.toUpperCase())} placeholder="VD: MSCU1234561" required disabled={isEdit} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Trạng thái Vỏ</label>
            <select className="input" value={form.container_status} onChange={e => set('container_status', parseInt(e.target.value))}>
              {CONTAINER_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label} — {s.en}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Vị trí</label>
            <select className="input" value={form.location} onChange={e => set('location', e.target.value)}>
              {LOCATIONS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Kích thước</label>
            <select className="input" value={form.size} onChange={e => set('size', e.target.value)}>
              <option>20ft</option><option>40ft</option><option>45ft</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Ghi chú</label>
          <textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Ghi chú..." />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">Hủy</button>
          <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}</button>
        </div>
      </form>
    </Modal>
  );
}
