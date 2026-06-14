export function fmtCurrency(n) {
  if (!n && n !== 0) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

export function fmtNumber(n, unit = '') {
  if (!n && n !== 0) return '—';
  return new Intl.NumberFormat('vi-VN').format(n) + (unit ? ' ' + unit : '');
}

export function fmtDate(dt) {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function fmtDateTime(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function monthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}
