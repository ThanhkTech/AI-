import { useState, useEffect } from 'react';
import { getContainer } from '../hooks/useContainers';
import { STATUSES, LOCATIONS } from '../constants';
import StatusBadge from './StatusBadge';

function fmt(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleString('vi-VN');
}

export default function DetailModal({ containerId, onClose }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    getContainer(containerId).then(setData);
  }, [containerId]);

  if (!data) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-8 text-gray-500">Đang tải...</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{data.container_number}</h2>
            <StatusBadge status={data.status} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Vị trí hiện tại', data.location],
              ['Khách hàng', data.customer || '-'],
              ['Loại hàng', data.cargo_type || '-'],
              ['Tạo lúc', fmt(data.created_at)],
              ['Cập nhật lần cuối', fmt(data.updated_at)],
              ['Ghi chú', data.notes || '-'],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-gray-800">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Lịch sử trạng thái</h3>
            <div className="space-y-2">
              {data.history?.map((h, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-0.5 ${STATUSES[h.status]?.dot || 'bg-gray-400'}`} />
                    {i < data.history.length - 1 && <div className="w-0.5 h-6 bg-gray-200 mt-1" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={h.status} />
                      <span className="text-gray-500 text-xs">@ {h.location}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{fmt(h.changed_at)}</p>
                    {h.notes && <p className="text-xs text-gray-600 mt-0.5">{h.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
