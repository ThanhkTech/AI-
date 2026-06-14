const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const STATUSES = [
  'Chờ lấy hàng',
  'Đang lấy hàng',
  'Chờ vận chuyển',
  'Trung chuyển',
  'Chờ giao hàng',
  'Đã giao hàng',
  'Hủy',
];

const LOCATIONS = ['Ga Đông Anh', 'Ga Trảng Bom', 'Ga Khác', 'Khác'];

// GET all containers with optional filters
router.get('/', (req, res) => {
  const { status, location, search } = req.query;
  let query = 'SELECT * FROM containers WHERE 1=1';
  const params = [];

  if (status !== undefined && status !== '') {
    query += ' AND status = ?';
    params.push(parseInt(status));
  }
  if (location) {
    query += ' AND location = ?';
    params.push(location);
  }
  if (search) {
    query += ' AND (container_number LIKE ? OR customer LIKE ? OR cargo_type LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY updated_at DESC';

  const containers = db.prepare(query).all(...params);
  res.json(containers);
});

// GET single container with history
router.get('/:id', (req, res) => {
  const container = db.prepare('SELECT * FROM containers WHERE id = ?').get(req.params.id);
  if (!container) return res.status(404).json({ error: 'Container not found' });

  const history = db.prepare(
    'SELECT * FROM status_history WHERE container_id = ? ORDER BY changed_at DESC'
  ).all(req.params.id);

  res.json({ ...container, history });
});

// POST create container
router.post('/', (req, res) => {
  const { container_number, status = 0, location = 'Khác', customer, cargo_type, notes } = req.body;

  if (!container_number) return res.status(400).json({ error: 'container_number is required' });
  if (!LOCATIONS.includes(location)) return res.status(400).json({ error: 'Invalid location' });
  if (status < 0 || status > 6) return res.status(400).json({ error: 'Invalid status' });

  const id = uuidv4();
  try {
    db.prepare(`
      INSERT INTO containers (id, container_number, status, location, customer, cargo_type, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, container_number.toUpperCase(), status, location, customer, cargo_type, notes);

    db.prepare(
      'INSERT INTO status_history (container_id, status, location, notes) VALUES (?, ?, ?, ?)'
    ).run(id, status, location, notes);

    const container = db.prepare('SELECT * FROM containers WHERE id = ?').get(id);
    res.status(201).json(container);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Container number already exists' });
    }
    throw err;
  }
});

// PUT update container
router.put('/:id', (req, res) => {
  const container = db.prepare('SELECT * FROM containers WHERE id = ?').get(req.params.id);
  if (!container) return res.status(404).json({ error: 'Container not found' });

  const { status, location, customer, cargo_type, notes } = req.body;
  const newStatus = status !== undefined ? parseInt(status) : container.status;
  const newLocation = location || container.location;

  if (!LOCATIONS.includes(newLocation)) return res.status(400).json({ error: 'Invalid location' });
  if (newStatus < 0 || newStatus > 6) return res.status(400).json({ error: 'Invalid status' });

  db.prepare(`
    UPDATE containers
    SET status = ?, location = ?, customer = ?, cargo_type = ?, notes = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    newStatus,
    newLocation,
    customer !== undefined ? customer : container.customer,
    cargo_type !== undefined ? cargo_type : container.cargo_type,
    notes !== undefined ? notes : container.notes,
    req.params.id
  );

  if (newStatus !== container.status || newLocation !== container.location) {
    db.prepare(
      'INSERT INTO status_history (container_id, status, location, notes) VALUES (?, ?, ?, ?)'
    ).run(req.params.id, newStatus, newLocation, notes);
  }

  const updated = db.prepare('SELECT * FROM containers WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE container
router.delete('/:id', (req, res) => {
  const container = db.prepare('SELECT * FROM containers WHERE id = ?').get(req.params.id);
  if (!container) return res.status(404).json({ error: 'Container not found' });

  db.prepare('DELETE FROM status_history WHERE container_id = ?').run(req.params.id);
  db.prepare('DELETE FROM containers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// GET KPI stats
router.get('/stats/kpi', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as c FROM containers').get().c;
  const byStatus = db.prepare(
    'SELECT status, COUNT(*) as count FROM containers GROUP BY status'
  ).all();
  const byLocation = db.prepare(
    'SELECT location, COUNT(*) as count FROM containers GROUP BY location'
  ).all();
  const delivered = byStatus.find(s => s.status === 5)?.count || 0;
  const cancelled = byStatus.find(s => s.status === 6)?.count || 0;
  const active = total - delivered - cancelled;

  res.json({
    total,
    active,
    delivered,
    cancelled,
    delivery_rate: total > 0 ? Math.round((delivered / total) * 100) : 0,
    by_status: byStatus,
    by_location: byLocation,
  });
});

module.exports = router;
