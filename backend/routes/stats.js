const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/kpi', (req, res) => {
  const orders     = db.orders.all();
  const containers = db.containers.all();
  const drivers    = db.drivers.all();

  const totalOrders = orders.length;
  const delivered   = orders.filter(o => o.order_status === 5).length;
  const cancelled   = orders.filter(o => o.order_status === 6).length;
  const activeOrders = totalOrders - delivered - cancelled;

  // Group orders by status
  const ordersByStatus = Array.from({ length: 7 }, (_, i) => ({
    order_status: i,
    count: orders.filter(o => o.order_status === i).length,
  }));

  // Group containers by status
  const contByStatus = Array.from({ length: 5 }, (_, i) => ({
    container_status: i,
    count: containers.filter(c => c.container_status === i).length,
  }));

  // Group containers by location
  const locations = ['Ga Đông Anh', 'Ga Trảng Bom', 'Ga Khác', 'Khác'];
  const contByLocation = locations.map(l => ({
    location: l,
    count: containers.filter(c => c.location === l).length,
  }));

  const availableDrivers = drivers.filter(d => d.driver_status === 0).length;
  const busyDrivers      = drivers.filter(d => d.driver_status === 1).length;
  const maintenance      = containers.filter(c => c.container_status === 4).length;

  res.json({
    orders: {
      total: totalOrders, active: activeOrders, delivered, cancelled,
      delivery_rate: totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 0,
    },
    containers: {
      total: containers.length, maintenance,
      by_status: contByStatus,
      by_location: contByLocation,
    },
    drivers: { total: drivers.length, available: availableDrivers, busy: busyDrivers },
    orders_by_status: ordersByStatus,
    recent_activity: db.data.activity_log.slice(0, 10),
  });
});

module.exports = router;
