const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

router.get('/', (req, res) => {
  const { driver_status } = req.query;
  let q = `SELECT d.*, COUNT(o.id) as active_orders
    FROM drivers d
    LEFT JOIN orders o ON o.driver_id=d.id AND o.order_status NOT IN (5,6)
    WHERE 1=1`;
  const params = [];
  if (driver_status !== undefined && driver_status !== '') { q += ' AND d.driver_status=?'; params.push(parseInt(driver_status)); }
  q += ' GROUP BY d.id ORDER BY d.name';
  res.json(db.prepare(q).all(...params));
});

router.get('/:id', (req, res) => {
  const d = db.prepare('SELECT * FROM drivers WHERE id=?').get(req.params.id);
  if (!d) return res.status(404).json({ error: 'Not found' });
  const orders = db.prepare(`SELECT o.*,c.container_number FROM orders o LEFT JOIN containers c ON c.id=o.container_id WHERE o.driver_id=? ORDER BY o.updated_at DESC LIMIT 20`).all(req.params.id);
  res.json({ ...d, orders });
});

router.post('/', (req, res) => {
  const { name, phone, license_plate, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuidv4();
  db.prepare(`INSERT INTO drivers (id,name,phone,license_plate,driver_status,notes) VALUES (?,?,?,?,0,?)`).run(id, name, phone || null, license_plate || null, notes || null);
  res.status(201).json(db.prepare('SELECT * FROM drivers WHERE id=?').get(id));
});

router.put('/:id', (req, res) => {
  const old = db.prepare('SELECT * FROM drivers WHERE id=?').get(req.params.id);
  if (!old) return res.status(404).json({ error: 'Not found' });
  const { name, phone, license_plate, driver_status, notes } = req.body;
  db.prepare(`UPDATE drivers SET name=?,phone=?,license_plate=?,driver_status=?,notes=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
    .run(name || old.name, phone !== undefined ? phone : old.phone, license_plate !== undefined ? license_plate : old.license_plate, driver_status !== undefined ? parseInt(driver_status) : old.driver_status, notes !== undefined ? notes : old.notes, req.params.id);
  res.json(db.prepare('SELECT * FROM drivers WHERE id=?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const d = db.prepare('SELECT * FROM drivers WHERE id=?').get(req.params.id);
  if (!d) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM drivers WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
