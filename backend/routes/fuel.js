const express = require('express');
const router = express.Router();
const db = require('../db');

function join(f) {
  const c = f.container_id ? db.containers.find(f.container_id) : null;
  return { ...f, container_number: c?.container_number || null, location: c?.location || null };
}

router.get('/', (req, res) => {
  const { container_id, from, to } = req.query;
  let list = db.fuel_logs.all().map(join);
  if (container_id) list = list.filter(f => f.container_id === container_id);
  if (from) list = list.filter(f => f.fill_date >= from);
  if (to)   list = list.filter(f => f.fill_date <= to);
  list.sort((a, b) => b.fill_date.localeCompare(a.fill_date));
  res.json(list);
});

router.get('/summary', (req, res) => {
  const { from, to } = req.query;
  let list = db.fuel_logs.all();
  if (from) list = list.filter(f => f.fill_date >= from);
  if (to)   list = list.filter(f => f.fill_date <= to);
  const total_liters = list.reduce((s, f) => s + f.liters, 0);
  const total_cost   = list.reduce((s, f) => s + f.total_cost, 0);
  const byContainer = {};
  for (const f of list) {
    const c = f.container_id ? db.containers.find(f.container_id) : null;
    const key = c?.container_number || 'Unknown';
    if (!byContainer[key]) byContainer[key] = { container_number: key, fills: 0, liters: 0, cost: 0 };
    byContainer[key].fills++; byContainer[key].liters += f.liters; byContainer[key].cost += f.total_cost;
  }
  res.json({ total_fills: list.length, total_liters, total_cost, by_container: Object.values(byContainer) });
});

router.post('/', (req, res) => {
  const { container_id, fill_date, liters, price_per_liter, station, odometer, notes } = req.body;
  if (!fill_date || !liters) return res.status(400).json({ error: 'fill_date và liters là bắt buộc' });
  const total_cost = parseFloat(liters) * parseFloat(price_per_liter || 0);
  const row = db.fuel_logs.insert({ id: db.uuid(), container_id: container_id || null, fill_date, liters: parseFloat(liters), price_per_liter: parseFloat(price_per_liter || 0), total_cost, station: station || null, odometer: odometer ? parseInt(odometer) : null, notes: notes || null, created_at: db.now(), updated_at: db.now() });
  res.status(201).json(join(row));
});

router.put('/:id', (req, res) => {
  const old = db.fuel_logs.find(req.params.id);
  if (!old) return res.status(404).json({ error: 'Not found' });
  const { container_id, fill_date, liters, price_per_liter, station, odometer, notes } = req.body;
  const nl = parseFloat(liters || old.liters), np = parseFloat(price_per_liter || old.price_per_liter);
  const updated = db.fuel_logs.update(req.params.id, { container_id: container_id !== undefined ? container_id : old.container_id, fill_date: fill_date || old.fill_date, liters: nl, price_per_liter: np, total_cost: nl * np, station: station !== undefined ? station : old.station, odometer: odometer !== undefined ? parseInt(odometer) : old.odometer, notes: notes !== undefined ? notes : old.notes });
  res.json(join(updated));
});

router.delete('/:id', (req, res) => {
  if (!db.fuel_logs.find(req.params.id)) return res.status(404).json({ error: 'Not found' });
  db.fuel_logs.delete(req.params.id); res.json({ success: true });
});

module.exports = router;
