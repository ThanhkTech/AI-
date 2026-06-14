const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

// Container status → suggested order status mapping
const CONT_TO_ORDER_STATUS = {
  0: null,   // tại ga: no auto-suggest
  1: [3, 4], // đã vận hành: trung chuyển or chờ giao
  2: [1],    // đang lấy hàng: đang lấy hàng
  3: null,   // khác
  4: null,   // sửa chữa
};

const LOCATIONS = ['Ga Đông Anh', 'Ga Trảng Bom', 'Ga Khác', 'Khác'];

router.get('/', (req, res) => {
  const { container_status, location, search } = req.query;
  let q = `SELECT c.*,
    o.order_number, o.order_status, o.customer, o.id as order_id
    FROM containers c
    LEFT JOIN orders o ON o.container_id = c.id AND o.order_status NOT IN (5,6)
    WHERE 1=1`;
  const params = [];
  if (container_status !== undefined && container_status !== '') {
    q += ' AND c.container_status = ?'; params.push(parseInt(container_status));
  }
  if (location) { q += ' AND c.location = ?'; params.push(location); }
  if (search) {
    q += ' AND (c.container_number LIKE ? OR o.customer LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  q += ' ORDER BY c.updated_at DESC';
  res.json(db.prepare(q).all(...params));
});

router.get('/:id', (req, res) => {
  const c = db.prepare('SELECT * FROM containers WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const orders = db.prepare('SELECT * FROM orders WHERE container_id = ? ORDER BY created_at DESC').all(req.params.id);
  const log = db.prepare(`SELECT * FROM activity_log WHERE entity_type='container' AND entity_id=? ORDER BY created_at DESC LIMIT 20`).all(req.params.id);
  res.json({ ...c, orders, log });
});

router.post('/', (req, res) => {
  const { container_number, container_status = 0, location = 'Ga Đông Anh', size = '20ft', notes } = req.body;
  if (!container_number) return res.status(400).json({ error: 'container_number required' });
  const id = uuidv4();
  try {
    db.prepare(`INSERT INTO containers (id,container_number,container_status,location,size,notes) VALUES (?,?,?,?,?,?)`).run(id, container_number.toUpperCase(), container_status, location, size, notes || null);
    db.prepare(`INSERT INTO activity_log (entity_type,entity_id,field,old_value,new_value) VALUES ('container',?,?,'','?')`).run(id, 'created', container_status);
    res.status(201).json(db.prepare('SELECT * FROM containers WHERE id=?').get(id));
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Số container đã tồn tại' });
    throw e;
  }
});

router.put('/:id', (req, res) => {
  const old = db.prepare('SELECT * FROM containers WHERE id=?').get(req.params.id);
  if (!old) return res.status(404).json({ error: 'Not found' });
  const { container_status, location, size, notes } = req.body;
  const ns = container_status !== undefined ? parseInt(container_status) : old.container_status;
  const nl = location || old.location;

  db.prepare(`UPDATE containers SET container_status=?,location=?,size=?,notes=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
    .run(ns, nl, size || old.size, notes !== undefined ? notes : old.notes, req.params.id);

  if (ns !== old.container_status) {
    db.prepare(`INSERT INTO activity_log (entity_type,entity_id,field,old_value,new_value) VALUES ('container',?,'container_status',?,?)`).run(req.params.id, String(old.container_status), String(ns));
  }
  if (nl !== old.location) {
    db.prepare(`INSERT INTO activity_log (entity_type,entity_id,field,old_value,new_value) VALUES ('container',?,'location',?,?)`).run(req.params.id, old.location, nl);
  }

  const suggested = CONT_TO_ORDER_STATUS[ns];
  const activeOrder = db.prepare(`SELECT * FROM orders WHERE container_id=? AND order_status NOT IN (5,6) LIMIT 1`).get(req.params.id);

  res.json({
    container: db.prepare('SELECT * FROM containers WHERE id=?').get(req.params.id),
    suggest_order_status: suggested && activeOrder ? { order_id: activeOrder.id, order_number: activeOrder.order_number, suggested_statuses: suggested } : null,
  });
});

router.delete('/:id', (req, res) => {
  const c = db.prepare('SELECT * FROM containers WHERE id=?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const active = db.prepare(`SELECT COUNT(*) as n FROM orders WHERE container_id=? AND order_status NOT IN (5,6)`).get(req.params.id);
  if (active.n > 0) return res.status(400).json({ error: 'Vỏ đang có đơn hàng đang vận hành' });
  db.prepare('DELETE FROM containers WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
