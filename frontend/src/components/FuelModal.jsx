import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useFetch, api } from '../hooks/useApi';
import { todayStr } from '../utils/format';

export default function FuelModal({ record, onClose, onSaved }) {
  const isEdit = !!record?.id;
  const [form, setForm] = useState({ container_id: '', fill_date: todayStr(), liters: '', price_per_liter: '22500', station: '', odometer: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { data: containers } = useFetch('/api/containers');

  useEffect(() => {
    if (record) setForm({ container_id: record.container_id || '', fill_date: record.fill_date || todayStr(), liters: record.liters || '', price_per_liter: record.price_per_liter || '22500', station: record.station || '', odometer: record.odometer || '', notes: record.notes || '' });
  }, [record]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const totalCost = form.liters && form.price_per_liter
    ? (parseFloat(form.liters) * parseFloat(form.price_per_liter)).toLocaleString('vi-VN')
    : '0';

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (isEdit) await api('PUT', `/api/fuel/${record.id}`, form);
      else        await api('POST', '/api/fuel', form);
      onSaved();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={isEdit ? 'Cập nhật phiếu đổ dầu' : 'Thêm phiếu đổ dầu'} onClose={onClose}>
      <form onSubmit={submit} className="p-6 space-y-4">
        {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Vỏ Container</label>
            <select className="input" value={form.container_id} onChange={e => set('container_id', e.target.value)}>
              <option value="">— Chọn vỏ —</option>
              {containers?.map(c => <option key={c.id} value={c.id}>{c.container_number}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Ngày đổ dầu *</label>
            <input type="date" className="input" value={form.fill_date} onChange={e => set('fill_date', e.target.value)} required />
          </div>
          <div>
            <label className="label">Trạm xăng</label>
            <input className="input" value={form.station} onChange={e => set('station', e.target.value)} placeholder="Petrolimex, PVOil..." />
          </div>
          <div>
            <label className="label">Số lít *</label>
            <input type="number" className="input" value={form.liters} onChange={e => set('liters', e.target.value)} placeholder="120" min="0" step="0.1" required />
          </div>
          <div>
            <label className="label">Đơn giá (đ/lít)</label>
            <input type="number" className="input" value={form.price_per_liter} onChange={e => set('price_per_liter', e.target.value)} placeholder="22500" min="0" />
          </div>
          <div>
            <label className="label">Số km đồng hồ</label>
            <input type="number" className="input" value={form.odometer} onChange={e => set('odometer', e.target.value)} placeholder="45200" />
          </div>
          <div>
            <label className="label">Thành tiền</label>
            <div className="input bg-gray-50 font-bold text-blue-700">{totalCost} đ</div>
          </div>
          <div className="col-span-2">
            <label className="label">Ghi chú</label>
            <input className="input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Thêm dầu nhớt, thay lọc..." />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn btn-secondary">Hủy</button>
          <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm phiếu'}</button>
        </div>
      </form>
    </Modal>
  );
}
