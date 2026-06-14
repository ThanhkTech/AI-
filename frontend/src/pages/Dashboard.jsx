import { useFetch } from '../hooks/useApi';
import { ORDER_STATUSES, CONTAINER_STATUSES, LOCATIONS, CHART_COLORS, fmtDate } from '../constants';
import { OrderStatusBadge, ContainerStatusBadge } from '../components/Badge';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

function KpiCard({ icon, label, value, sub, color, subColor }) {
  return (
    <div className={`card p-5 border-l-4 ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          {sub && <p className={`text-xs mt-1 ${subColor || 'text-gray-400'}`}>{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 px-3 py-2 text-sm">
      <p className="font-medium text-gray-700">{label}</p>
      <p className="text-blue-600">{payload[0].value} container</p>
    </div>
  );
};

export default function Dashboard() {
  const { data: kpi, loading } = useFetch('/api/stats/kpi');

  if (loading || !kpi) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm">Đang tải dữ liệu...</span>
      </div>
    </div>
  );

  const orderStatusData = ORDER_STATUSES.map(s => ({
    name: s.label, value: kpi.orders_by_status.find(b => b.order_status === s.id)?.count || 0,
  }));

  const contLocationData = LOCATIONS.map((l, i) => ({
    name: l, value: kpi.containers.by_location.find(b => b.location === l)?.count || 0,
  }));

  const ACTIVITY_FIELD_LABELS = { order_status: 'Trạng thái đơn', container_status: 'Trạng thái vỏ', location: 'Vị trí', created: 'Tạo mới' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard — Tổng quan vận hành</h1>
        <p className="text-sm text-gray-500 mt-0.5">Cập nhật theo thời gian thực · Real-time operational overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon="📦" label="Tổng đơn hàng" value={kpi.orders.total}
          sub={`${kpi.orders.active} đang hoạt động`} color="border-blue-500" />
        <KpiCard icon="✅" label="Đã giao hàng" value={kpi.orders.delivered}
          sub={`Tỷ lệ: ${kpi.orders.delivery_rate}%`} color="border-green-500" subColor="text-green-600" />
        <KpiCard icon="🚢" label="Tổng vỏ container" value={kpi.containers.total}
          sub={`${kpi.containers.maintenance} đang sửa chữa`} color="border-indigo-500"
          subColor={kpi.containers.maintenance > 0 ? 'text-red-500' : 'text-gray-400'} />
        <KpiCard icon="🤝" label="Đối tác vận chuyển" value={kpi.partners?.total || 0}
          sub={`${kpi.partners?.active || 0} đang có đơn`} color="border-orange-500" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Order status bar chart */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Đơn hàng theo trạng thái <span className="text-gray-400 font-normal">/ Orders by Status</span></h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={orderStatusData} margin={{ top: 0, right: 8, left: -20, bottom: 55 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {orderStatusData.map((_, i) => <Cell key={i} fill={CHART_COLORS.order[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Container by location pie */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Vỏ theo vị trí <span className="text-gray-400 font-normal">/ By Location</span></h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={contLocationData} dataKey="value" nameKey="name" cx="50%" cy="42%" outerRadius={75}
                label={({ name, value }) => value > 0 ? value : ''} labelLine={false}>
                {contLocationData.map((_, i) => <Cell key={i} fill={CHART_COLORS.location[i]} />)}
              </Pie>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [v, 'Vỏ']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status breakdown + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Order status breakdown */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Chi tiết trạng thái đơn hàng</h2>
          <div className="grid grid-cols-2 gap-2">
            {ORDER_STATUSES.map(s => {
              const count = kpi.orders_by_status.find(b => b.order_status === s.id)?.count || 0;
              return (
                <div key={s.id} className={`rounded-xl p-3 flex items-center gap-3 ${s.color}`}>
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.dot}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{s.label}</p>
                    <p className="text-lg font-bold leading-tight">{count}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Container status breakdown */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Trạng thái vỏ container</h2>
          <div className="space-y-2">
            {CONTAINER_STATUSES.map(s => {
              const count = kpi.containers.by_status.find(b => b.container_status === s.id)?.count || 0;
              const pct = kpi.containers.total > 0 ? Math.round(count / kpi.containers.total * 100) : 0;
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                  <span className="text-sm text-gray-600 w-32 truncate">{s.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className={`h-full rounded-full ${s.dot}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>

          <h2 className="text-sm font-bold text-gray-700 mb-3 mt-5">Hoạt động gần đây</h2>
          <div className="space-y-1.5">
            {kpi.recent_activity?.slice(0, 5).map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 flex-shrink-0" />
                <span className="flex-1">
                  <span className="font-medium text-gray-600">{ACTIVITY_FIELD_LABELS[a.field] || a.field}</span>
                  {a.old_value && a.new_value && a.field !== 'created' && <> thay đổi</>}
                  <span className="text-gray-400 ml-1">{fmtDate(a.created_at)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
