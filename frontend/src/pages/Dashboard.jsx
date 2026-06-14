import { useKpi } from '../hooks/useContainers';
import { STATUSES, LOCATIONS, STATUS_COLORS_CHART, LOCATION_COLORS_CHART } from '../constants';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

function KpiCard({ label, value, sub, color }) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${color}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { kpi, loading } = useKpi();

  if (loading || !kpi) return (
    <div className="flex items-center justify-center h-64 text-gray-400">Đang tải dữ liệu...</div>
  );

  const statusData = STATUSES.map(s => ({
    name: s.label,
    value: kpi.by_status.find(b => b.status === s.id)?.count || 0,
  }));

  const locationData = LOCATIONS.map(l => ({
    name: l,
    value: kpi.by_location.find(b => b.location === l)?.count || 0,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Tổng quan KPI vận hành</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Tổng container" value={kpi.total} color="border-blue-500" />
        <KpiCard label="Đang vận hành" value={kpi.active} color="border-orange-500" />
        <KpiCard label="Đã giao hàng" value={kpi.delivered} color="border-green-500" />
        <KpiCard
          label="Tỷ lệ giao thành công"
          value={`${kpi.delivery_rate}%`}
          sub={`${kpi.cancelled} container đã hủy`}
          color="border-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Phân bố theo trạng thái</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData} margin={{ top: 0, right: 10, left: -20, bottom: 60 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, n) => [v, 'Số container']} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS_CHART[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Phân bố theo vị trí</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={locationData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                outerRadius={95}
                label={({ name, value }) => value > 0 ? `${value}` : ''}
              >
                {locationData.map((_, i) => (
                  <Cell key={i} fill={LOCATION_COLORS_CHART[i]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Chi tiết theo trạng thái</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {STATUSES.map(s => {
            const count = kpi.by_status.find(b => b.status === s.id)?.count || 0;
            return (
              <div key={s.id} className={`rounded-lg p-3 text-center ${s.color}`}>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs mt-1 font-medium">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
