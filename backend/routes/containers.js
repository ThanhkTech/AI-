const express = require('express');
const router = express.Router();
const db = require('../db');

// container_status → suggested order_status
const CONT_TO_ORDER = { 0: null, 1: [3, 4], 2: [1], 3: null, 4: null };

// Join container with its active order info
function withOrderInfo(c) {
  const active = db.orders.activeForContainer(c.id)[0] || null;
  return {
    ...c,
    order_number: active?.order_number || null,
    order_status: active?.order_status ?? null,
    order_id: active?.id || null,
    customer: active?.customer || null,
  };
}

router.get('/', (req, res) => {
  const { container_status, location, search } = req.query;
  let list = db.containers.all().map(withOrderInfo);

  if (container_status !== undefined && container_status !== '')
    list = list.filter(c => c.container_status === parseInt(container_status));
  if (location)
    list = list.filter(c => c.location === location);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(c =>
      c.container_number.toLowerCase().includes(q) ||
      (c.customer || '').toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  res.json(list);
});

router.get('/:id', (req, res) => {
  const c = db.containers.find(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });

  const orders = db.orders.all()
    .filter(o => o.container_id === c.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const log = db.data.activity_log
    .filter(l => l.entity_type === 'container' && l.entity_id === c.id)
    .slice(0, 20);

  res.json({ ...c, orders, log });
});

router.post('/', (req, res) => {
  const { container_number, container_status = 0, location = 'Ga Đông Anh', size = '20ft', notes } = req.body;
  if (!container_number) return res.status(400).json({ error: 'container_number required' });
  if (db.containers.findByNumber(container_number.toUpperCase()))
    return res.status(409).json({ error: 'Số container đã tồn tại' });

  const row = db.containers.insert({
    id: db.uuid(), container_number: container_number.toUpperCase(),
    container_status, location, size, notes: notes || null,
    created_at: db.now(), updated_at: db.now(),
  });
  db.log('container', row.id, 'created', '', container_status);
  res.status(201).json(row);
});

router.put('/:id', (req, res) => {
  const old = db.containers.find(req.params.id);
  if (!old) return res.status(404).json({ error: 'Not found' });

  const { container_status, location, size, notes } = req.body;
  const ns = container_status !== undefined ? parseInt(container_status) : old.container_status;
  const nl = location || old.location;

  const updated = db.containers.update(req.params.id, {
    container_status: ns,
    location: nl,
    size: size || old.size,
    notes: notes !== undefined ? notes : old.notes,
  });

  if (ns !== old.container_status) db.log('container', old.id, 'container_status', old.container_status, ns);
  if (nl !== old.location)         db.log('container', old.id, 'location', old.location, nl);

  const suggested = CONT_TO_ORDER[ns];
  const activeOrder = db.orders.activeForContainer(old.id)[0] || null;

  res.json({
    container: updated,
    suggest_order_status: suggested && activeOrder
      ? { order_id: activeOrder.id, order_number: activeOrder.order_number, suggested_statuses: suggested }
      : null,
  });
});

router.delete('/:id', (req, res) => {
  const c = db.containers.find(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  if (db.orders.activeForContainer(c.id).length > 0)
    return res.status(400).json({ error: 'Vỏ đang có đơn hàng đang vận hành' });
  db.containers.delete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
