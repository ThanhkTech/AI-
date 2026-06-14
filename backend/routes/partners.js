const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const list = db.partners.all().map(p => ({
    ...p,
    total_orders: db.orders.where(o => o.partner_id === p.id).length,
    active_orders: db.orders.where(o => o.partner_id === p.id && o.order_status < 5).length,
  })).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  res.json(list);
});

router.get('/:id', (req, res) => {
  const p = db.partners.find(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const orders = db.orders.where(o => o.partner_id === p.id)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 20)
    .map(o => { const c = o.container_id ? db.containers.find(o.container_id) : null; return { ...o, container_number: c?.container_number || null }; });
  res.json({ ...p, orders });
});

router.post('/', (req, res) => {
  const { name, short_name, phone, contact_person, email, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'name là bắt buộc' });
  const row = db.partners.insert({ id: db.uuid(), name, short_name: short_name || null, phone: phone || null, contact_person: contact_person || null, email: email || null, notes: notes || null, created_at: db.now(), updated_at: db.now() });
  res.status(201).json(row);
});

router.put('/:id', (req, res) => {
  const old = db.partners.find(req.params.id);
  if (!old) return res.status(404).json({ error: 'Not found' });
  const { name, short_name, phone, contact_person, email, notes } = req.body;
  const updated = db.partners.update(req.params.id, {
    name:           name           !== undefined ? name           : old.name,
    short_name:     short_name     !== undefined ? short_name     : old.short_name,
    phone:          phone          !== undefined ? phone          : old.phone,
    contact_person: contact_person !== undefined ? contact_person : old.contact_person,
    email:          email          !== undefined ? email          : old.email,
    notes:          notes          !== undefined ? notes          : old.notes,
  });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  if (!db.partners.find(req.params.id)) return res.status(404).json({ error: 'Not found' });
  db.partners.delete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
