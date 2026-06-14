const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/kpi', (req, res) => {
  const totalOrders = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
  const totalContainers = db.prepare('SELECT COUNT(*) as c FROM containers').get().c;
  const totalDrivers = db.prepare('SELECT COUNT(*) as c FROM drivers').get().c;

  const ordersByStatus = db.prepare('SELECT order_status, COUNT(*) as count FROM orders GROUP BY order_status').all();
  const containersByStatus = db.prepare('SELECT container_status, COUNT(*) as count FROM containers GROUP BY container_status').all();
  const containersByLocation = db.prepare('SELECT location, COUNT(*) as count FROM containers GROUP BY location').all();
  const driversByStatus = db.prepare('SELECT driver_status, COUNT(*) as count FROM drivers GROUP BY driver_status').all();

  const delivered = ordersByStatus.find(s => s.order_status === 5)?.count || 0;
  const cancelled = ordersByStatus.find(s => s.order_status === 6)?.count || 0;
  const activeOrders = totalOrders - delivered - cancelled;
  const availableDrivers = driversByStatus.find(s => s.driver_status === 0)?.count || 0;
  const busyDrivers = driversByStatus.find(s => s.driver_status === 1)?.count || 0;
  const maintenanceContainers = containersByStatus.find(s => s.container_status === 4)?.count || 0;

  res.json({
    orders: { total: totalOrders, active: activeOrders, delivered, cancelled, delivery_rate: totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 0 },
    containers: { total: totalContainers, maintenance: maintenanceContainers, by_status: containersByStatus, by_location: containersByLocation },
    drivers: { total: totalDrivers, available: availableDrivers, busy: busyDrivers },
    orders_by_status: ordersByStatus,
    recent_activity: db.prepare(`SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 10`).all(),
  });
});

module.exports = router;
