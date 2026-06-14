import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useFetch, api } from '../hooks/useApi';
import { todayStr } from '../utils/format';

const REPAIR_TYPES = ['Động cơ', 'Lốp xe', 'Phanh', 'Điện', 'Khung thùng', 'Hệ thống làm lạnh', 'Bảo dưỡng định kỳ', 'Khác'];
const STATUSES = [
  { id: 'pending',     label: 'Chờ sửa',     color: 'bg-yellow-100 text-yellow-700' },
  { id: 'in_progress', label: 'Đang sửa',    color: 'bg-blue-100 text-blue-700' },
  { id: 'completed',   label: 'Hoàn thành',  color: 'bg-green-100 text-green-700' },
];

export function MaintenanceStatusBadge({ status }) {
  const s = STATUSES.find(x => x.id === status) || STATUSES[0];
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.color}`}>{s.label}</span>;
}

export default function MaintenanceModal({ record, onClose, onSaved }) {
  const isEdit = !!record?.id;
  const [form, setForm] = useState({ container_id: '', repair_type: 'Động cơ', description: '', workshop: '', start_date: todayStr(), estimated_cost: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { data: containers } = useFetch('/api/containers');

  useEffect(() => {
    if (record) setForm({ container_id: record.container_id || '', repair_type: record.repair_type || 'Động cơ', description: record.description || '', workshop: record.workshop || '', start_date: record.start_date || todayStr(), estimated_cost: record.estimated_cost || '', notes: record.notes || '', status: record.status || 'pending', end_date: record.end_date || '', actual_cost: record.actual_cost || '' });
  }, [record]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (isEdit) await api('PUT', `/api/maintenance/${record.id}`, form);
      else        await api('POST', '/api/maintenance', form);
      onSaved();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={isEdit ? 'Cập nhật phiếu sửa chữa' : 'Tạo phiếu sửa chữa'} onClose={onClose} size="lg">
      <form onSubmit={submit} className="p-6 space-y-4">
        {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Vỏ Container *</label>
            <select className="input" value={form.container_id} onChange={e => set('container_id', e.target.value)} required disabled={isEdit}>
              <option value="">— Chọn vỏ —</option>
              {containers?.map(c => <option key={c.id} value={c.id}>{c.container_number}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Loại sửa chữa *</label>
            <select className="input" value={form.repair_type} onChange={e => set('repair_type', e.target.value)}>
              {REPAIR_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Gara / Xưởng sửa</label>
            <input className="input" value={form.workshop} onChange={e => set('workshop', e.target.value)} placeholder="Tên gara, địa chỉ..." />
          </div>
          <div>
            <label className="label">Ngày bắt đầu</label>
            <input type="date" className="input" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
          </div>
          {isEdit && (
            <>
              <div>
                <label className="label">Trạng thái</label>
                <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Ngày hoàn thành</label>
                <input type="date" className="input" value={form.end_date || ''} onChange={e => set('end_date', e.target.value)} />
              </div>
              <div>
                <label className="label">Chi phí thực tế (đ)</label>
                <input type="number" className="input" value={form.actual_cost || ''} onChange={e => set('actual_cost', e.target.value)} placeholder="7800000" />
              </div>
            </>
          )}
          <div>
            <label className="label">Chi phí dự kiến (đ)</label>
            <input type="number" className="input" value={form.estimated_cost} onChange={e => set('estimated_cost', e.target.value)} placeholder="8000000" />
          </div>
          <div className="col-span-2">
            <label className="label">Mô tả hạng mục sửa chữa</label>
            <textarea className="input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Thay lốp xe trục sau, thay dầu nhớt..." />
          </div>
          <div className="col-span-2">
            <label className="label">Ghi chú</label>
            <input className="input" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn btn-secondary">Hủy</button>
          <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo phiếu'}</button>
        </div>
      </form>
    </Modal>
  );
}
