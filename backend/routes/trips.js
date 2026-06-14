const express = require('express');
const router = express.Router();
const db = require('../db');

function join(t) {
  const d = t.driver_id ? db.drivers.find(t.driver_id) : null;
  return { ...t, driver_name: d?.name || null };
}

// GET trip logs by order
router.get('/', (req, res) => {
  const { order_id, container_id } = req.query;
  let list = db.trip_logs.all().map(join);
  if (order_id)    list = list.filter(t => t.order_id === order_id);
  if (container_id)list = list.filter(t => t.container_id === container_id);
  list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  res.json(list);
});

// GET full journey for one order (with order + container details)
router.get('/order/:order_id', (req, res) => {
  const o = db.orders.find(req.params.order_id);
  if (!o) return res.status(404).json({ error: 'Order not found' });
  const c = o.container_id ? db.containers.find(o.container_id) : null;
  const d = o.driver_id    ? db.drivers.find(o.driver_id)       : null;
  const logs = db.trip_logs.where(t => t.order_id === o.id).map(join).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const fuel = db.fuel_logs.where(f => f.container_id === o.container_id).map(f => ({ ...f, driver_name: db.drivers.find(f.driver_id)?.name || null }));
  res.json({ order: { ...o, container_number: c?.container_number, location: c?.location, driver_name: d?.name, license_plate: d?.license_plate }, logs, fuel });
});

router.post('/', (req, res) => {
  const { order_id, event_type, location, description, timestamp } = req.body;
  if (!order_id || !event_type) return res.status(400).json({ error: 'order_id và event_type là bắt buộc' });
  const o = db.orders.find(order_id);
  if (!o) return res.status(404).json({ error: 'Order not found' });
  const row = db.trip_logs.insert({
    id: db.uuid(), order_id, order_number: o.order_number,
    container_id: o.container_id || null, driver_id: o.driver_id || null,
    event_type, location: location || null, description: description || null,
    timestamp: timestamp || db.now(), created_at: db.now(),
  });
  res.status(201).json(join(row));
});

router.delete('/:id', (req, res) => {
  if (!db.trip_logs.find(req.params.id)) return res.status(404).json({ error: 'Not found' });
  db.trip_logs.delete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
