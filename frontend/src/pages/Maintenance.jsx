import { useState } from 'react';
import { useFetch, api } from '../hooks/useApi';
import { fmtCurrency, fmtDate } from '../utils/format';
import MaintenanceModal, { MaintenanceStatusBadge } from '../components/MaintenanceModal';
import SettleModal from '../components/SettleModal';
import Modal from '../components/Modal';

function DetailPanel({ record: r, onClose, onEdit, onSettle }) {
  return (
    <Modal title={`Phiếu sửa chữa — ${r.container_number}`} onClose={onClose} size="lg">
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <MaintenanceStatusBadge status={r.status} />
          {r.settled && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">✓ Đã quyết toán</span>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            ['Vỏ container', <span className="font-mono font-bold">{r.container_number}</span>],
            ['Loại sửa chữa', r.repair_type],
            ['Gara / Xưởng', r.workshop || '—'],
            ['Ngày bắt đầu', fmtDate(r.start_date)],
            ['Ngày hoàn thành', fmtDate(r.end_date)],
            ['Chi phí dự kiến', <span className="text-orange-600 font-bold">{fmtCurrency(r.estimated_cost)}</span>],
            ['Chi phí thực tế', <span className={r.actual_cost ? 'text-green-700 font-bold' : 'text-gray-400'}>{r.actual_cost ? fmtCurrency(r.actual_cost) : '—'}</span>],
            ['Người quyết toán', r.settled_by || '—'],
            ['Ngày quyết toán', fmtDate(r.settled_at)],
            ['Mô tả', r.description || '—'],
            ['Ghi chú', r.notes || '—'],
          ].map(([l, v]) => (
            <div key={l} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">{l}</p>
              <div className="text-sm font-medium text-gray-800 mt-0.5">{v}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onEdit} className="btn btn-secondary">Chỉnh sửa</button>
          {!r.settled && r.status === 'completed' && (
            <button onClick={onSettle} className="btn bg-green-600 text-white hover:bg-green-700">💰 Quyết toán</button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default function Maintenance() {
  const [filters, setFilters] = useState({ status: '', settled: '' });
  const [modal, setModal] = useState(null);

  const params = new URLSearchParams();
  if (filters.status)  params.set('status', filters.status);
  if (filters.settled !== '') params.set('settled', filters.settled);

  const { data: records, loading, refetch } = useFetch(`/api/maintenance?${params}`);
  const { data: summary, refetch: rSum }    = useFetch('/api/maintenance/summary');

  const handleDelete = async (r) => {
    if (!window.confirm(`Xóa phiếu sửa chữa ${r.container_number}?`)) return;
    await api('DELETE', `/api/maintenance/${r.id}`);
    refetch(); rSum();
  };

  const done = () => { setModal(null); refetch(); rSum(); };

  const STATUS_LABELS = { pending: 'Chờ sửa', in_progress: 'Đang sửa', completed: 'Hoàn thành' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sửa chữa & Quyết toán</h1>
          <p className="text-sm text-gray-500">Maintenance & Settlement</p>
        </div>
        <button onClick={() => setModal({ type: 'create' })} className="btn btn-primary"><span>+</span> Tạo phiếu sửa chữa</button>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4 border-l-4 border-blue-500">
            <p className="text-xs font-semibold text-gray-500 uppercase">Tổng phiếu</p>
            <p className="text-2xl font-bold mt-1">{summary.total}</p>
            <div className="flex gap-2 mt-1 text-xs">
              {summary.by_status.map(s => <span key={s.status} className="text-gray-400">{STATUS_LABELS[s.status]}: {s.count}</span>)}
            </div>
          </div>
          <div className="card p-4 border-l-4 border-orange-500">
            <p className="text-xs font-semibold text-gray-500 uppercase">Chi phí dự kiến</p>
            <p className="text-xl font-bold text-orange-600 mt-1">{fmtCurrency(summary.total_estimated)}</p>
          </div>
          <div className="card p-4 border-l-4 border-green-500">
            <p className="text-xs font-semibold text-gray-500 uppercase">Đã quyết toán</p>
            <p className="text-xl font-bold text-green-700 mt-1">{fmtCurrency(summary.total_actual)}</p>
            <p className="text-xs text-gray-400">{summary.settled_count} phiếu</p>
          </div>
          <div className="card p-4 border-l-4 border-red-400">
            <p className="text-xs font-semibold text-gray-500 uppercase">Chưa quyết toán</p>
            <p className="text-xl font-bold text-red-600 mt-1">{fmtCurrency(summary.unsettled_cost)}</p>
            <p className="text-xs text-gray-400">{summary.unsettled} phiếu</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex gap-3 flex-wrap">
        <select className="input w-44" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ sửa</option>
          <option value="in_progress">Đang sửa</option>
          <option value="completed">Hoàn thành</option>
        </select>
        <select className="input w-44" value={filters.settled} onChange={e => setFilters(f => ({ ...f, settled: e.target.value }))}>
          <option value="">Tất cả quyết toán</option>
          <option value="false">Chưa quyết toán</option>
          <option value="true">Đã quyết toán</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? <div className="py-12 text-center text-gray-400">Đang tải...</div>
          : !records?.length ? <div className="py-12 text-center text-gray-400">Không có phiếu sửa chữa</div>
          : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="table-th">Vỏ Container</th>
                  <th className="table-th">Loại sửa</th>
                  <th className="table-th">Gara</th>
                  <th className="table-th">Trạng thái</th>
                  <th className="table-th">Ngày bắt đầu</th>
                  <th className="table-th text-right">Dự kiến</th>
                  <th className="table-th text-right">Thực tế</th>
                  <th className="table-th">Quyết toán</th>
                  <th className="table-th" />
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id} className="table-tr">
                    <td className="table-td">
                      <button onClick={() => setModal({ type: 'detail', data: r })} className="font-mono font-bold text-blue-600 hover:underline">{r.container_number}</button>
                    </td>
                    <td className="table-td">{r.repair_type}</td>
                    <td className="table-td text-gray-500 text-xs">{r.workshop || '—'}</td>
                    <td className="table-td"><MaintenanceStatusBadge status={r.status} /></td>
                    <td className="table-td text-xs">{fmtDate(r.start_date)}</td>
                    <td className="table-td text-right text-orange-600">{fmtCurrency(r.estimated_cost)}</td>
                    <td className="table-td text-right font-semibold">{r.actual_cost ? fmtCurrency(r.actual_cost) : '—'}</td>
                    <td className="table-td">
                      {r.settled
                        ? <span className="text-xs text-green-600 font-semibold">✓ {fmtDate(r.settled_at)}</span>
                        : r.status === 'completed' && r.actual_cost
                          ? <button onClick={() => setModal({ type: 'settle', data: r })} className="btn bg-green-50 text-green-700 hover:bg-green-100 py-1 text-xs">Quyết toán</button>
                          : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="table-td">
                      <div className="flex gap-1">
                        <button onClick={() => setModal({ type: 'edit', data: r })} className="btn btn-secondary py-1 text-xs">Sửa</button>
                        <button onClick={() => handleDelete(r)} className="btn btn-danger py-1 text-xs">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>

      {modal?.type === 'create' && <MaintenanceModal record={null} onClose={() => setModal(null)} onSaved={done} />}
      {modal?.type === 'edit'   && <MaintenanceModal record={modal.data} onClose={() => setModal(null)} onSaved={done} />}
      {modal?.type === 'settle' && <SettleModal record={modal.data} onClose={() => setModal(null)} onSaved={done} />}
      {modal?.type === 'detail' && (
        <DetailPanel record={modal.data} onClose={() => setModal(null)}
          onEdit={() => setModal({ type: 'edit', data: modal.data })}
          onSettle={() => setModal({ type: 'settle', data: modal.data })} />
      )}
    </div>
  );
}
