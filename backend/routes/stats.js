const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/kpi', (req, res) => {
  const orders     = db.orders.all();
  const containers = db.containers.all();
  const partners   = db.partners.all();

  const delivered  = orders.filter(o => o.order_status === 5).length;
  const cancelled  = orders.filter(o => o.order_status === 6).length;
  const active     = orders.length - delivered - cancelled;

  const ordersByStatus  = Array.from({ length: 7 }, (_, i) => ({ order_status: i, count: orders.filter(o => o.order_status === i).length }));
  const contByStatus    = Array.from({ length: 5 }, (_, i) => ({ container_status: i, count: containers.filter(c => c.container_status === i).length }));
  const contByLocation  = ['Ga Đông Anh','Ga Trảng Bom','Ga Khác','Khác'].map(l => ({ location: l, count: containers.filter(c => c.location === l).length }));

  res.json({
    orders: { total: orders.length, active, delivered, cancelled, delivery_rate: orders.length ? Math.round(delivered / orders.length * 100) : 0 },
    containers: { total: containers.length, maintenance: containers.filter(c => c.container_status === 4).length, by_status: contByStatus, by_location: contByLocation },
    partners: { total: partners.length, active: partners.filter(p => db.orders.where(o => o.partner_id === p.id && o.order_status < 5).length > 0).length },
    orders_by_status: ordersByStatus,
    recent_activity: db.data.activity_log.slice(0, 10),
  });
});

module.exports = router;
