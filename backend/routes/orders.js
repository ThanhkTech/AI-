const express = require('express');
const router = express.Router();
const db = require('../db');

// order_status → container_status sync
const ORDER_TO_CONT = { 0: 0, 1: 2, 2: 1, 3: 1, 4: 1, 5: 0, 6: 0 };

function joinOrder(o) {
  const c = o.container_id ? db.containers.find(o.container_id) : null;
  const d = o.driver_id    ? db.drivers.find(o.driver_id)       : null;
  return {
    ...o,
    container_number: c?.container_number || null,
    container_status: c?.container_status ?? null,
    location:         c?.location || null,
    size:             c?.size || null,
    driver_name:      d?.name || null,
    driver_phone:     d?.phone || null,
    license_plate:    d?.license_plate || null,
  };
}

router.get('/', (req, res) => {
  const { order_status, search, driver_id } = req.query;
  let list = db.orders.all().map(joinOrder);

  if (order_status !== undefined && order_status !== '')
    list = list.filter(o => o.order_status === parseInt(order_status));
  if (driver_id)
    list = list.filter(o => o.driver_id === driver_id);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(o =>
      o.order_number.toLowerCase().includes(q) ||
      (o.customer || '').toLowerCase().includes(q) ||
      (o.container_number || '').toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  res.json(list);
});

router.get('/:id', (req, res) => {
  const o = db.orders.find(req.params.id);
  if (!o) return res.status(404).json({ error: 'Not found' });
  const log = db.data.activity_log
    .filter(l => l.entity_type === 'order' && l.entity_id === o.id)
    .slice(0, 30);
  res.json({ ...joinOrder(o), log });
});

router.post('/', (req, res) => {
  const { order_number, container_id, driver_id, order_status = 0,
    customer, cargo_type, pickup_address, delivery_address, notes } = req.body;

  if (!order_number) return res.status(400).json({ error: 'order_number required' });
  if (db.orders.findByNumber(order_number))
    return res.status(409).json({ error: 'Số đơn hàng đã tồn tại' });

  // Check container not already in active order
  if (container_id && db.orders.activeForContainer(container_id).length > 0)
    return res.status(400).json({ error: 'Vỏ này đang có đơn hàng đang vận hành' });

  const row = db.orders.insert({
    id: db.uuid(), order_number,
    container_id: container_id || null,
    driver_id: driver_id || null,
    order_status,
    customer: customer || null,
    cargo_type: cargo_type || null,
    pickup_address: pickup_address || null,
    delivery_address: delivery_address || null,
    notes: notes || null,
    created_at: db.now(), updated_at: db.now(),
  });

  db.log('order', row.id, 'created', '', order_status);

  // Sync container status
  if (container_id) {
    db.containers.update(container_id, { container_status: ORDER_TO_CONT[order_status] });
  }
  // Mark driver busy
  if (driver_id && order_status < 5) {
    db.drivers.update(driver_id, { driver_status: 1 });
  }

  res.status(201).json(joinOrder(row));
});

router.put('/:id', (req, res) => {
  const old = db.orders.find(req.params.id);
  if (!old) return res.status(404).json({ error: 'Not found' });

  const { order_status, container_id, driver_id,
    customer, cargo_type, pickup_address, delivery_address, notes } = req.body;

  const ns  = order_status  !== undefined ? parseInt(order_status) : old.order_status;
  const nc  = container_id  !== undefined ? (container_id || null)  : old.container_id;
  const nd  = driver_id     !== undefined ? (driver_id || null)     : old.driver_id;

  const updated = db.orders.update(req.params.id, {
    order_status: ns,
    container_id: nc,
    driver_id: nd,
    customer:          customer          !== undefined ? customer          : old.customer,
    cargo_type:        cargo_type        !== undefined ? cargo_type        : old.cargo_type,
    pickup_address:    pickup_address    !== undefined ? pickup_address    : old.pickup_address,
    delivery_address:  delivery_address  !== undefined ? delivery_address  : old.delivery_address,
    notes:             notes             !== undefined ? notes             : old.notes,
  });

  if (ns !== old.order_status) {
    db.log('order', old.id, 'order_status', old.order_status, ns);
  }

  // Sync container status when order status changes
  if (nc && ns !== old.order_status) {
    db.containers.update(nc, { container_status: ORDER_TO_CONT[ns] });
  }

  // Release old driver if order done/cancelled and driver changed or done
  if (old.driver_id && (ns >= 5 || nd !== old.driver_id)) {
    db.drivers.update(old.driver_id, { driver_status: 0 });
  }
  // Mark new driver busy
  if (nd && nd !== old.driver_id && ns < 5) {
    db.drivers.update(nd, { driver_status: 1 });
  }

  res.json(joinOrder(updated));
});

router.delete('/:id', (req, res) => {
  const o = db.orders.find(req.params.id);
  if (!o) return res.status(404).json({ error: 'Not found' });
  if (o.driver_id) db.drivers.update(o.driver_id, { driver_status: 0 });
  db.orders.delete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
