export const ORDER_STATUSES = [
  { id: 0, label: 'Chờ lấy hàng',   en: 'Pending Pickup',    color: 'bg-slate-100 text-slate-600',   dot: 'bg-slate-400',   ring: 'ring-slate-300' },
  { id: 1, label: 'Đang lấy hàng',  en: 'Picking Up',        color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500',    ring: 'ring-blue-300' },
  { id: 2, label: 'Chờ vận chuyển', en: 'Awaiting Shipment', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500',  ring: 'ring-yellow-300' },
  { id: 3, label: 'Trung chuyển',   en: 'In Transit',        color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500',  ring: 'ring-orange-300' },
  { id: 4, label: 'Chờ giao hàng',  en: 'Awaiting Delivery', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500',  ring: 'ring-purple-300' },
  { id: 5, label: 'Đã giao hàng',   en: 'Delivered',         color: 'bg-green-100 text-green-700',   dot: 'bg-green-500',   ring: 'ring-green-300' },
  { id: 6, label: 'Hủy',            en: 'Cancelled',         color: 'bg-red-100 text-red-600',       dot: 'bg-red-400',     ring: 'ring-red-300' },
];

export const CONTAINER_STATUSES = [
  { id: 0, label: 'Tại ga',         en: 'At Station',        color: 'bg-sky-100 text-sky-700',       dot: 'bg-sky-500' },
  { id: 1, label: 'Đã vận hành',    en: 'In Operation',      color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  { id: 2, label: 'Đang lấy hàng', en: 'Picking Up',        color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500' },
  { id: 3, label: 'Khác',           en: 'Other',             color: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400' },
  { id: 4, label: 'Sửa chữa',       en: 'Maintenance',       color: 'bg-red-100 text-red-600',       dot: 'bg-red-400' },
];

export const DRIVER_STATUSES = [
  { id: 0, label: 'Sẵn sàng', en: 'Available', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  { id: 1, label: 'Đang chạy', en: 'On Trip',  color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  { id: 2, label: 'Nghỉ phép', en: 'Off Duty', color: 'bg-gray-100 text-gray-500',   dot: 'bg-gray-400' },
];

export const LOCATIONS = ['Ga Đông Anh', 'Ga Trảng Bom', 'Ga Khác', 'Khác'];

export const CHART_COLORS = {
  order: ['#94a3b8','#3b82f6','#eab308','#f97316','#a855f7','#22c55e','#ef4444'],
  container: ['#0ea5e9','#6366f1','#3b82f6','#94a3b8','#ef4444'],
  location: ['#3b82f6','#f97316','#8b5cf6','#94a3b8'],
};

export function fmtDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

// Re-export from utils for backwards compat
export { fmtDate as fmtDateTime } from './utils/format';
