import { useState } from 'react';
import { useContainers, deleteContainer } from '../hooks/useContainers';
import { STATUSES, LOCATIONS } from '../constants';
import StatusBadge from '../components/StatusBadge';
import ContainerModal from '../components/ContainerModal';
import DetailModal from '../components/DetailModal';

function fmt(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleString('vi-VN');
}

export default function ContainerList() {
  const [filters, setFilters] = useState({ status: '', location: '', search: '' });
  const [modal, setModal] = useState(null); // null | { type: 'create'|'edit'|'detail', data? }
  const { containers, loading, refetch } = useContainers(filters);

  const handleDelete = async (id, num) => {
    if (!window.confirm(`Xóa container ${num}?`)) return;
    await deleteContainer(id);
    refetch();
  };

  const handleSaved = () => {
    setModal(null);
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Danh sách Container</h1>
        <button
          onClick={() => setModal({ type: 'create' })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          <span className="text-lg leading-none">+</span> Thêm Container
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-3">
        <input
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tìm số container, khách hàng, loại hàng..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
        />
        <select
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
        >
          <option value="">Tất cả trạng thái</option>
          {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.location}
          onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
        >
          <option value="">Tất cả vị trí</option>
          {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        {(filters.search || filters.status !== '' || filters.location) && (
          <button
            onClick={() => setFilters({ status: '', location: '', search: '' })}
            className="text-sm text-gray-500 hover:text-gray-700 px-2"
          >
            Xóa lọc
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">Đang tải...</div>
        ) : containers.length === 0 ? (
          <div className="py-16 text-center text-gray-400">Không có dữ liệu</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Số Container</th>
                  <th className="text-left px-4 py-3 font-semibold">Trạng thái</th>
                  <th className="text-left px-4 py-3 font-semibold">Vị trí</th>
                  <th className="text-left px-4 py-3 font-semibold">Khách hàng</th>
                  <th className="text-left px-4 py-3 font-semibold">Loại hàng</th>
                  <th className="text-left px-4 py-3 font-semibold">Cập nhật</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {containers.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setModal({ type: 'detail', data: c })}
                        className="font-mono font-semibold text-blue-600 hover:underline"
                      >
                        {c.container_number}
                      </button>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-gray-700">{c.location}</td>
                    <td className="px-4 py-3 text-gray-700">{c.customer || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{c.cargo_type || '-'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmt(c.updated_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setModal({ type: 'edit', data: c })}
                          className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.container_number)}
                          className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 text-xs text-gray-400 border-t">
              {containers.length} container
            </div>
          </div>
        )}
      </div>

      {modal?.type === 'create' && (
        <ContainerModal container={null} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
      {modal?.type === 'edit' && (
        <ContainerModal container={modal.data} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
      {modal?.type === 'detail' && (
        <DetailModal containerId={modal.data.id} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
