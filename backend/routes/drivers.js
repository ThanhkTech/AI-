const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { driver_status } = req.query;
  let list = db.drivers.all().map(d => ({
    ...d,
    active_orders: db.orders.all().filter(o => o.driver_id === d.id && o.order_status < 5).length,
  }));

  if (driver_status !== undefined && driver_status !== '')
    list = list.filter(d => d.driver_status === parseInt(driver_status));

  list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  res.json(list);
});

router.get('/:id', (req, res) => {
  const d = db.drivers.find(req.params.id);
  if (!d) return res.status(404).json({ error: 'Not found' });

  const orders = db.orders.all()
    .filter(o => o.driver_id === d.id)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 20)
    .map(o => {
      const c = o.container_id ? db.containers.find(o.container_id) : null;
      return { ...o, container_number: c?.container_number || null };
    });

  res.json({ ...d, orders });
});

router.post('/', (req, res) => {
  const { name, phone, license_plate, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });

  const row = db.drivers.insert({
    id: db.uuid(), name, phone: phone || null,
    license_plate: license_plate || null,
    driver_status: 0, notes: notes || null,
    created_at: db.now(), updated_at: db.now(),
  });
  res.status(201).json(row);
});

router.put('/:id', (req, res) => {
  const old = db.drivers.find(req.params.id);
  if (!old) return res.status(404).json({ error: 'Not found' });

  const { name, phone, license_plate, driver_status, notes } = req.body;
  const updated = db.drivers.update(req.params.id, {
    name:          name          !== undefined ? name          : old.name,
    phone:         phone         !== undefined ? phone         : old.phone,
    license_plate: license_plate !== undefined ? license_plate : old.license_plate,
    driver_status: driver_status !== undefined ? parseInt(driver_status) : old.driver_status,
    notes:         notes         !== undefined ? notes         : old.notes,
  });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  if (!db.drivers.find(req.params.id)) return res.status(404).json({ error: 'Not found' });
  db.drivers.delete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
