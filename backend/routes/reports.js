const express = require('express');
const router = express.Router();
const db = require('../db');

// ---- Báo cáo nhiên liệu ----
router.get('/fuel', (req, res) => {
  const { from, to, container_id } = req.query;
  let list = db.fuel_logs.all();
  if (from) list = list.filter(f => f.fill_date >= from);
  if (to)   list = list.filter(f => f.fill_date <= to);
  if (container_id) list = list.filter(f => f.container_id === container_id);

  const rows = list.map(f => {
    const c = f.container_id ? db.containers.find(f.container_id) : null;
    const d = f.driver_id    ? db.drivers.find(f.driver_id)       : null;
    return { ...f, container_number: c?.container_number || '—', driver_name: d?.name || '—' };
  }).sort((a, b) => b.fill_date.localeCompare(a.fill_date));

  const total_liters = rows.reduce((s, r) => s + r.liters, 0);
  const total_cost   = rows.reduce((s, r) => s + r.total_cost, 0);

  res.json({ title: 'Báo cáo nhiên liệu', from, to, rows, summary: { count: rows.length, total_liters, total_cost } });
});

// ---- Báo cáo sửa chữa ----
router.get('/maintenance', (req, res) => {
  const { from, to, settled } = req.query;
  let list = db.maintenance_records.all();
  if (from) list = list.filter(m => m.start_date && m.start_date >= from);
  if (to)   list = list.filter(m => m.start_date && m.start_date <= to);
  if (settled !== undefined && settled !== '') list = list.filter(m => m.settled === (settled === 'true'));

  const rows = list.map(m => {
    const c = m.container_id ? db.containers.find(m.container_id) : null;
    return { ...m, container_number: c?.container_number || m.container_number || '—' };
  }).sort((a, b) => (b.start_date || '').localeCompare(a.start_date || ''));

  const total_estimated = rows.reduce((s, m) => s + (m.estimated_cost || 0), 0);
  const total_actual    = rows.reduce((s, m) => s + (m.actual_cost    || 0), 0);
  const settled_count   = rows.filter(m => m.settled).length;
  const unsettled_cost  = rows.filter(m => !m.settled && m.actual_cost).reduce((s, m) => s + m.actual_cost, 0);

  res.json({ title: 'Báo cáo sửa chữa & Quyết toán', from, to, rows, summary: { count: rows.length, total_estimated, total_actual, settled_count, unsettled: rows.length - settled_count, unsettled_cost } });
});

// ---- Báo cáo vận hành ----
router.get('/operations', (req, res) => {
  const orders     = db.orders.all();
  const containers = db.containers.all();
  const drivers    = db.drivers.all();

  const delivered  = orders.filter(o => o.order_status === 5).length;
  const cancelled  = orders.filter(o => o.order_status === 6).length;
  const active     = orders.filter(o => o.order_status < 5).length;

  // Orders per driver
  const driverStats = drivers.map(d => {
    const dOrders    = orders.filter(o => o.driver_id === d.id);
    const dDelivered = dOrders.filter(o => o.order_status === 5).length;
    return { name: d.name, license_plate: d.license_plate, total_orders: dOrders.length, delivered: dDelivered, active: dOrders.filter(o => o.order_status < 5).length };
  }).sort((a, b) => b.total_orders - a.total_orders);

  // Container utilization
  const contStats = containers.map(c => {
    const cOrders = orders.filter(o => o.container_id === c.id);
    const maintenances = db.maintenance_records.where(m => m.container_id === c.id).length;
    const fuelCost = db.fuel_logs.where(f => f.container_id === c.id).reduce((s, f) => s + f.total_cost, 0);
    return { container_number: c.container_number, size: c.size, location: c.location, container_status: c.container_status, total_orders: cOrders.length, maintenances, fuel_cost: fuelCost };
  });

  res.json({
    title: 'Báo cáo vận hành tổng hợp',
    summary: { total_orders: orders.length, delivered, cancelled, active, delivery_rate: orders.length ? Math.round(delivered / orders.length * 100) : 0, total_containers: containers.length, total_drivers: drivers.length },
    driver_stats: driverStats,
    container_stats: contStats,
  });
});

// ---- Nhật ký hành trình đơn hàng (dạng báo cáo) ----
router.get('/journey/:order_id', (req, res) => {
  const o = db.orders.find(req.params.order_id);
  if (!o) return res.status(404).json({ error: 'Not found' });
  const c = o.container_id ? db.containers.find(o.container_id) : null;
  const d = o.driver_id    ? db.drivers.find(o.driver_id)       : null;
  const logs = db.trip_logs.where(t => t.order_id === o.id).map(t => ({ ...t, driver_name: db.drivers.find(t.driver_id)?.name || null })).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const fuel = db.fuel_logs.where(f => f.container_id === o.container_id).map(f => ({ ...f, driver_name: db.drivers.find(f.driver_id)?.name || null }));
  res.json({ title: `Nhật ký hành trình — ${o.order_number}`, order: { ...o, container_number: c?.container_number, driver_name: d?.name, license_plate: d?.license_plate, location: c?.location }, logs, fuel, generated_at: new Date().toISOString() });
});

// ---- Nhật ký sửa chữa container ----
router.get('/maintenance-log/:container_id', (req, res) => {
  const c = db.containers.find(req.params.container_id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const records = db.maintenance_records.where(m => m.container_id === c.id).sort((a, b) => (b.start_date || '').localeCompare(a.start_date || ''));
  const total_cost = records.filter(m => m.actual_cost).reduce((s, m) => s + m.actual_cost, 0);
  res.json({ title: `Nhật ký sửa chữa — ${c.container_number}`, container: c, records, summary: { total_repairs: records.length, total_cost, settled: records.filter(m => m.settled).length }, generated_at: new Date().toISOString() });
});

module.exports = router;
