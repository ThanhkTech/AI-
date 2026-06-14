const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

router.get('/', (req, res) => {
  const { order_status, search, driver_id } = req.query;
  let q = `SELECT o.*,
    c.container_number, c.container_status, c.location,
    d.name as driver_name, d.phone as driver_phone, d.license_plate
    FROM orders o
    LEFT JOIN containers c ON c.id = o.container_id
    LEFT JOIN drivers d ON d.id = o.driver_id
    WHERE 1=1`;
  const params = [];
  if (order_status !== undefined && order_status !== '') { q += ' AND o.order_status=?'; params.push(parseInt(order_status)); }
  if (driver_id) { q += ' AND o.driver_id=?'; params.push(driver_id); }
  if (search) {
    q += ' AND (o.order_number LIKE ? OR o.customer LIKE ? OR c.container_number LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  q += ' ORDER BY o.updated_at DESC';
  res.json(db.prepare(q).all(...params));
});

router.get('/:id', (req, res) => {
  const o = db.prepare(`SELECT o.*,
    c.container_number, c.container_status, c.location, c.size,
    d.name as driver_name, d.phone as driver_phone, d.license_plate
    FROM orders o
    LEFT JOIN containers c ON c.id=o.container_id
    LEFT JOIN drivers d ON d.id=o.driver_id
    WHERE o.id=?`).get(req.params.id);
  if (!o) return res.status(404).json({ error: 'Not found' });
  const log = db.prepare(`SELECT * FROM activity_log WHERE entity_type='order' AND entity_id=? ORDER BY created_at DESC`).all(req.params.id);
  res.json({ ...o, log });
});

router.post('/', (req, res) => {
  const { order_number, container_id, driver_id, order_status = 0, customer, cargo_type, pickup_address, delivery_address, notes } = req.body;
  if (!order_number) return res.status(400).json({ error: 'order_number required' });

  // Check container not already active
  if (container_id) {
    const active = db.prepare(`SELECT COUNT(*) as n FROM orders WHERE container_id=? AND order_status NOT IN (5,6) AND id != ''`).get(container_id);
    if (active.n > 0) return res.status(400).json({ error: 'Vỏ này đang có đơn hàng đang vận hành' });
  }

  const id = uuidv4();
  try {
    db.prepare(`INSERT INTO orders (id,order_number,container_id,driver_id,order_status,customer,cargo_type,pickup_address,delivery_address,notes) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(id, order_number, container_id || null, driver_id || null, order_status, customer || null, cargo_type || null, pickup_address || null, delivery_address || null, notes || null);
    db.prepare(`INSERT INTO activity_log (entity_type,entity_id,field,old_value,new_value) VALUES ('order',?,'created','',?)`).run(id, String(order_status));

    // If assigned container, update container status to "đang lấy hàng" suggestion
    if (container_id && order_status === 1) {
      db.prepare(`UPDATE containers SET container_status=2,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(container_id);
    }
    if (driver_id) db.prepare(`UPDATE drivers SET driver_status=1,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(driver_id);

    res.status(201).json(db.prepare(`SELECT o.*,c.container_number,d.name as driver_name FROM orders o LEFT JOIN containers c ON c.id=o.container_id LEFT JOIN drivers d ON d.id=o.driver_id WHERE o.id=?`).get(id));
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Số đơn hàng đã tồn tại' });
    throw e;
  }
});

router.put('/:id', (req, res) => {
  const old = db.prepare('SELECT * FROM orders WHERE id=?').get(req.params.id);
  if (!old) return res.status(404).json({ error: 'Not found' });

  const { order_status, container_id, driver_id, customer, cargo_type, pickup_address, delivery_address, notes } = req.body;
  const ns = order_status !== undefined ? parseInt(order_status) : old.order_status;
  const nc = container_id !== undefined ? (container_id || null) : old.container_id;
  const nd = driver_id !== undefined ? (driver_id || null) : old.driver_id;

  db.prepare(`UPDATE orders SET order_status=?,container_id=?,driver_id=?,customer=?,cargo_type=?,pickup_address=?,delivery_address=?,notes=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
    .run(ns, nc, nd,
      customer !== undefined ? customer : old.customer,
      cargo_type !== undefined ? cargo_type : old.cargo_type,
      pickup_address !== undefined ? pickup_address : old.pickup_address,
      delivery_address !== undefined ? delivery_address : old.delivery_address,
      notes !== undefined ? notes : old.notes,
      req.params.id);

  if (ns !== old.order_status) {
    db.prepare(`INSERT INTO activity_log (entity_type,entity_id,field,old_value,new_value) VALUES ('order',?,'order_status',?,?)`).run(req.params.id, String(old.order_status), String(ns));
  }

  // Release driver if order done/cancelled
  if (ns >= 5 && old.order_status < 5 && old.driver_id) {
    db.prepare(`UPDATE drivers SET driver_status=0,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(old.driver_id);
  }
  // Assign driver if new driver
  if (nd && nd !== old.driver_id) {
    db.prepare(`UPDATE drivers SET driver_status=1,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(nd);
    if (old.driver_id) db.prepare(`UPDATE drivers SET driver_status=0,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(old.driver_id);
  }

  // Update container status based on order status
  const CONT_STATUS_MAP = { 0: 0, 1: 2, 2: 1, 3: 1, 4: 1, 5: 0, 6: 0 };
  if (nc && ns !== old.order_status) {
    const newContStatus = CONT_STATUS_MAP[ns];
    db.prepare(`UPDATE containers SET container_status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(newContStatus, nc);
  }

  res.json(db.prepare(`SELECT o.*,c.container_number,c.container_status,c.location,d.name as driver_name,d.license_plate FROM orders o LEFT JOIN containers c ON c.id=o.container_id LEFT JOIN drivers d ON d.id=o.driver_id WHERE o.id=?`).get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const o = db.prepare('SELECT * FROM orders WHERE id=?').get(req.params.id);
  if (!o) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM orders WHERE id=?').run(req.params.id);
  if (o.driver_id) db.prepare(`UPDATE drivers SET driver_status=0 WHERE id=?`).run(o.driver_id);
  res.json({ success: true });
});

module.exports = router;
