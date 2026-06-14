const express = require('express');
const router = express.Router();
const db = require('../db');

function join(m) {
  const c = m.container_id ? db.containers.find(m.container_id) : null;
  return { ...m, container_number: c?.container_number || m.container_number || null, location: c?.location || null };
}

router.get('/', (req, res) => {
  const { status, container_id, settled } = req.query;
  let list = db.maintenance_records.all().map(join);
  if (status)       list = list.filter(m => m.status === status);
  if (container_id) list = list.filter(m => m.container_id === container_id);
  if (settled !== undefined && settled !== '') list = list.filter(m => m.settled === (settled === 'true'));
  list.sort((a, b) => b.created_at.localeCompare(a.created_at));
  res.json(list);
});

router.get('/summary', (req, res) => {
  const all = db.maintenance_records.all();
  const total_estimated = all.reduce((s, m) => s + (m.estimated_cost || 0), 0);
  const total_actual    = all.filter(m => m.actual_cost).reduce((s, m) => s + m.actual_cost, 0);
  const unsettled_cost  = all.filter(m => m.actual_cost && !m.settled).reduce((s, m) => s + m.actual_cost, 0);
  const by_status = ['pending','in_progress','completed'].map(s => ({ status: s, count: all.filter(m => m.status === s).length }));
  const by_type = {};
  for (const m of all) { by_type[m.repair_type] = (by_type[m.repair_type] || 0) + 1; }
  res.json({ total: all.length, total_estimated, total_actual, unsettled_cost, settled: all.filter(m => m.settled).length, unsettled: all.filter(m => !m.settled && m.actual_cost).length, by_status, by_type });
});

router.post('/', (req, res) => {
  const { container_id, repair_type, description, workshop, start_date, estimated_cost, notes } = req.body;
  if (!container_id || !repair_type) return res.status(400).json({ error: 'container_id và repair_type là bắt buộc' });
  const c = db.containers.find(container_id);
  const row = db.maintenance_records.insert({
    id: db.uuid(), container_id, container_number: c?.container_number || null,
    repair_type, description: description || null, workshop: workshop || null,
    status: 'pending', start_date: start_date || null, end_date: null,
    estimated_cost: estimated_cost ? parseFloat(estimated_cost) : null,
    actual_cost: null, settled: false, settled_at: null, settled_by: null,
    notes: notes || null, created_at: db.now(), updated_at: db.now(),
  });
  // Update container status to sửa chữa
  if (c) db.containers.update(container_id, { container_status: 4 });
  db.log('container', container_id, 'maintenance', 'normal', 'maintenance');
  res.status(201).json(join(row));
});

router.put('/:id', (req, res) => {
  const old = db.maintenance_records.find(req.params.id);
  if (!old) return res.status(404).json({ error: 'Not found' });
  const { status, repair_type, description, workshop, start_date, end_date, estimated_cost, actual_cost, notes } = req.body;
  const updated = db.maintenance_records.update(req.params.id, {
    status:         status          !== undefined ? status          : old.status,
    repair_type:    repair_type     !== undefined ? repair_type     : old.repair_type,
    description:    description     !== undefined ? description     : old.description,
    workshop:       workshop        !== undefined ? workshop        : old.workshop,
    start_date:     start_date      !== undefined ? start_date      : old.start_date,
    end_date:       end_date        !== undefined ? end_date        : old.end_date,
    estimated_cost: estimated_cost  !== undefined ? parseFloat(estimated_cost) : old.estimated_cost,
    actual_cost:    actual_cost     !== undefined ? parseFloat(actual_cost)    : old.actual_cost,
    notes:          notes           !== undefined ? notes           : old.notes,
  });
  // If completed, restore container status
  if (status === 'completed' && old.status !== 'completed' && old.container_id) {
    db.containers.update(old.container_id, { container_status: 0 });
  }
  res.json(join(updated));
});

// Quyết toán (settle)
router.post('/:id/settle', (req, res) => {
  const m = db.maintenance_records.find(req.params.id);
  if (!m) return res.status(404).json({ error: 'Not found' });
  if (m.settled) return res.status(400).json({ error: 'Đã quyết toán rồi' });
  const { actual_cost, settled_by, notes } = req.body;
  if (!actual_cost) return res.status(400).json({ error: 'actual_cost là bắt buộc để quyết toán' });
  const updated = db.maintenance_records.update(req.params.id, {
    actual_cost: parseFloat(actual_cost), settled: true,
    settled_at: db.now(), settled_by: settled_by || 'Quản lý',
    status: 'completed', end_date: m.end_date || new Date().toISOString().split('T')[0],
    notes: notes !== undefined ? notes : m.notes,
  });
  db.log('container', m.container_id, 'settled', 'unsettled', String(actual_cost));
  res.json(join(updated));
});

router.delete('/:id', (req, res) => {
  if (!db.maintenance_records.find(req.params.id)) return res.status(404).json({ error: 'Not found' });
  db.maintenance_records.delete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
