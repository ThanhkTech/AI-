/**
 * Pure-JS JSON file database — no native compilation required.
 * Works on Windows, macOS, Linux without Python or Visual Studio.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'db.json');

function uuid() { return crypto.randomUUID(); }
function now()  { return new Date().toISOString(); }

function load() {
  if (!fs.existsSync(DB_PATH)) return null;
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}
function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// ---- Seed ----
function createSeedData() {
  const containers = [
    { id: uuid(), container_number: 'MSCU1234561', container_status: 0, location: 'Ga Đông Anh', size: '20ft', notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), container_number: 'TCKU2345672', container_status: 1, location: 'Ga Trảng Bom', size: '40ft', notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), container_number: 'HLXU3456783', container_status: 2, location: 'Ga Đông Anh', size: '20ft', notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), container_number: 'MSKU4567894', container_status: 0, location: 'Ga Khác',      size: '40ft', notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), container_number: 'OOLU5678905', container_status: 4, location: 'Ga Trảng Bom', size: '20ft', notes: 'Chờ sửa động cơ', created_at: now(), updated_at: now() },
    { id: uuid(), container_number: 'CMAU6789016', container_status: 1, location: 'Khác',          size: '40ft', notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), container_number: 'GESU7890127', container_status: 0, location: 'Ga Đông Anh', size: '20ft', notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), container_number: 'APLU8901238', container_status: 3, location: 'Khác',          size: '40ft', notes: null, created_at: now(), updated_at: now() },
  ];
  const drivers = [
    { id: uuid(), name: 'Nguyễn Văn An',  phone: '0912345678', license_plate: '30H-12345', driver_status: 1, notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), name: 'Trần Văn Bình',  phone: '0923456789', license_plate: '51B-67890', driver_status: 0, notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), name: 'Lê Văn Cường',   phone: '0934567890', license_plate: '43A-11223', driver_status: 1, notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), name: 'Phạm Văn Dũng',  phone: '0945678901', license_plate: '60B-33445', driver_status: 0, notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), name: 'Hoàng Văn Em',   phone: '0956789012', license_plate: '75A-55667', driver_status: 2, notes: null, created_at: now(), updated_at: now() },
  ];
  const orders = [
    { id: uuid(), order_number: 'DH-2024-001', container_id: containers[0].id, driver_id: drivers[0].id, order_status: 1, customer: 'Công ty TNHH An Bình',    cargo_type: 'Điện tử',     pickup_address: 'KCN Thăng Long, Hà Nội',  delivery_address: 'Cảng Cát Lái, TP.HCM', notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), order_number: 'DH-2024-002', container_id: containers[1].id, driver_id: drivers[2].id, order_status: 3, customer: 'Công ty CP Bình Minh',     cargo_type: 'Dệt may',     pickup_address: 'KCN Amata, Đồng Nai',     delivery_address: 'Cảng Hải Phòng',       notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), order_number: 'DH-2024-003', container_id: containers[2].id, driver_id: null,         order_status: 0, customer: 'Công ty XNK Hòa Phát',     cargo_type: 'Thép',        pickup_address: 'KCN Phố Nối, Hưng Yên',  delivery_address: 'Cảng Đà Nẵng',         notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), order_number: 'DH-2024-004', container_id: containers[3].id, driver_id: drivers[1].id, order_status: 2, customer: 'Vinamilk',                  cargo_type: 'Thực phẩm',  pickup_address: 'Bình Dương',              delivery_address: 'Hà Nội',               notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), order_number: 'DH-2024-005', container_id: containers[5].id, driver_id: drivers[4].id, order_status: 5, customer: 'Nhựa Tiền Phong',          cargo_type: 'Nhựa',        pickup_address: 'Hải Phòng',              delivery_address: 'Đà Nẵng',              notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), order_number: 'DH-2024-006', container_id: containers[6].id, driver_id: null,         order_status: 0, customer: 'Tập đoàn FPT',             cargo_type: 'Thiết bị IT', pickup_address: 'Hà Nội',                 delivery_address: 'TP.HCM',               notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), order_number: 'DH-2024-007', container_id: containers[7].id, driver_id: drivers[0].id, order_status: 6, customer: 'Công ty Hòa Bình',         cargo_type: 'Vật liệu XD', pickup_address: 'Hà Nam',                 delivery_address: 'Nghệ An',              notes: 'Khách hàng hủy', created_at: now(), updated_at: now() },
  ];

  // Seed fuel logs
  const fuel_logs = [
    { id: uuid(), container_id: containers[0].id, driver_id: drivers[0].id, fill_date: '2024-06-01', liters: 120, price_per_liter: 22500, total_cost: 2700000, station: 'Xăng dầu Petrolimex Thăng Long', odometer: 45200, notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), container_id: containers[1].id, driver_id: drivers[2].id, fill_date: '2024-06-03', liters: 95,  price_per_liter: 22500, total_cost: 2137500, station: 'Xăng dầu Đồng Nai',             odometer: 32100, notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), container_id: containers[0].id, driver_id: drivers[0].id, fill_date: '2024-06-05', liters: 110, price_per_liter: 23000, total_cost: 2530000, station: 'Xăng dầu Biên Hòa',             odometer: 45800, notes: 'Thêm dầu nhớt', created_at: now(), updated_at: now() },
    { id: uuid(), container_id: containers[2].id, driver_id: drivers[1].id, fill_date: '2024-06-07', liters: 85,  price_per_liter: 22500, total_cost: 1912500, station: 'Petrolimex Hải Phòng',           odometer: 18900, notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), container_id: containers[3].id, driver_id: drivers[3].id, fill_date: '2024-06-08', liters: 130, price_per_liter: 23000, total_cost: 2990000, station: 'Xăng dầu Bình Dương',           odometer: 67500, notes: null, created_at: now(), updated_at: now() },
  ];

  // Seed maintenance records
  const maintenance_records = [
    {
      id: uuid(), container_id: containers[4].id, container_number: containers[4].container_number,
      repair_type: 'Động cơ', description: 'Thay động cơ diesel, thay dầu nhớt toàn bộ',
      workshop: 'Gara Hoàng Long', status: 'in_progress',
      start_date: '2024-06-01', end_date: null,
      estimated_cost: 15000000, actual_cost: null,
      settled: false, settled_at: null, settled_by: null,
      notes: 'Đang chờ linh kiện', created_at: now(), updated_at: now(),
    },
    {
      id: uuid(), container_id: containers[0].id, container_number: containers[0].container_number,
      repair_type: 'Lốp xe', description: 'Thay 4 lốp xe trục sau',
      workshop: 'Gara Minh Tuấn', status: 'completed',
      start_date: '2024-05-20', end_date: '2024-05-21',
      estimated_cost: 8000000, actual_cost: 7800000,
      settled: true, settled_at: '2024-05-25', settled_by: 'Nguyễn Quản lý',
      notes: null, created_at: now(), updated_at: now(),
    },
    {
      id: uuid(), container_id: containers[2].id, container_number: containers[2].container_number,
      repair_type: 'Phanh', description: 'Bảo dưỡng hệ thống phanh, thay má phanh',
      workshop: 'Trung tâm bảo dưỡng VTS', status: 'completed',
      start_date: '2024-05-28', end_date: '2024-05-29',
      estimated_cost: 3500000, actual_cost: 3200000,
      settled: false, settled_at: null, settled_by: null,
      notes: 'Chờ quyết toán', created_at: now(), updated_at: now(),
    },
    {
      id: uuid(), container_id: containers[1].id, container_number: containers[1].container_number,
      repair_type: 'Điện', description: 'Sửa hệ thống đèn, thay ắc quy',
      workshop: 'Gara Điện Minh', status: 'pending',
      start_date: null, end_date: null,
      estimated_cost: 2000000, actual_cost: null,
      settled: false, settled_at: null, settled_by: null,
      notes: null, created_at: now(), updated_at: now(),
    },
  ];

  // Seed trip logs (journey entries per order)
  const trip_logs = [
    { id: uuid(), order_id: orders[0].id, order_number: orders[0].order_number, container_id: containers[0].id, driver_id: drivers[0].id, event_type: 'depart', location: 'KCN Thăng Long, Hà Nội', description: 'Xuất phát lấy hàng', timestamp: '2024-06-01T07:00:00.000Z', created_at: now() },
    { id: uuid(), order_id: orders[0].id, order_number: orders[0].order_number, container_id: containers[0].id, driver_id: drivers[0].id, event_type: 'pickup', location: 'KCN Thăng Long, Hà Nội', description: 'Hoàn thành lấy hàng — 24 pallet điện tử', timestamp: '2024-06-01T09:30:00.000Z', created_at: now() },
    { id: uuid(), order_id: orders[0].id, order_number: orders[0].order_number, container_id: containers[0].id, driver_id: drivers[0].id, event_type: 'transit', location: 'Ga Đông Anh', description: 'Container về ga, chờ vận chuyển', timestamp: '2024-06-01T11:00:00.000Z', created_at: now() },
    { id: uuid(), order_id: orders[1].id, order_number: orders[1].order_number, container_id: containers[1].id, driver_id: drivers[2].id, event_type: 'depart', location: 'KCN Amata, Đồng Nai', description: 'Xuất phát đến lấy hàng', timestamp: '2024-06-03T06:00:00.000Z', created_at: now() },
    { id: uuid(), order_id: orders[1].id, order_number: orders[1].order_number, container_id: containers[1].id, driver_id: drivers[2].id, event_type: 'pickup', location: 'KCN Amata, Đồng Nai', description: 'Đã lấy 2 container dệt may', timestamp: '2024-06-03T10:00:00.000Z', created_at: now() },
    { id: uuid(), order_id: orders[1].id, order_number: orders[1].order_number, container_id: containers[1].id, driver_id: drivers[2].id, event_type: 'transit', location: 'Ga Trảng Bom', description: 'Đang trung chuyển qua Trảng Bom', timestamp: '2024-06-03T14:00:00.000Z', created_at: now() },
    { id: uuid(), order_id: orders[4].id, order_number: orders[4].order_number, container_id: containers[5].id, driver_id: drivers[4].id, event_type: 'depart',  location: 'Hải Phòng', description: 'Khởi hành', timestamp: '2024-05-28T06:00:00.000Z', created_at: now() },
    { id: uuid(), order_id: orders[4].id, order_number: orders[4].order_number, container_id: containers[5].id, driver_id: drivers[4].id, event_type: 'deliver', location: 'Đà Nẵng', description: 'Giao hàng thành công — khách ký nhận', timestamp: '2024-05-29T15:00:00.000Z', created_at: now() },
  ];

  const activity_log = [
    { id: 1, entity_type: 'order', entity_id: orders[0].id, field: 'created', old_value: '', new_value: '1', note: null, created_at: now() },
    { id: 2, entity_type: 'order', entity_id: orders[1].id, field: 'created', old_value: '', new_value: '3', note: null, created_at: now() },
  ];

  return { containers, drivers, orders, fuel_logs, maintenance_records, trip_logs, activity_log, _log_seq: 2 };
}

// Init
let _data = load();
if (!_data) { _data = createSeedData(); save(_data); }
// Migrate old data that lacks new collections
if (!_data.fuel_logs)          { _data.fuel_logs = []; save(_data); }
if (!_data.maintenance_records){ _data.maintenance_records = []; save(_data); }
if (!_data.trip_logs)          { _data.trip_logs = []; save(_data); }

// ---- DB API ----
function mkCollection(key) {
  return {
    all:    ()      => _data[key],
    find:   (id)    => _data[key].find(r => r.id === id),
    where:  (fn)    => _data[key].filter(fn),
    insert: (row)   => { _data[key].push(row); save(_data); return row; },
    update: (id, patch) => {
      const i = _data[key].findIndex(r => r.id === id);
      if (i < 0) return null;
      _data[key][i] = { ..._data[key][i], ...patch, updated_at: now() };
      save(_data);
      return _data[key][i];
    },
    delete: (id) => { _data[key] = _data[key].filter(r => r.id !== id); save(_data); },
  };
}

const db = {
  get data() { return _data; },
  commit() { save(_data); },
  uuid, now,

  log(entity_type, entity_id, field, old_value, new_value, note = null) {
    _data._log_seq = (_data._log_seq || 0) + 1;
    _data.activity_log.unshift({ id: _data._log_seq, entity_type, entity_id, field, old_value: String(old_value ?? ''), new_value: String(new_value ?? ''), note, created_at: now() });
    if (_data.activity_log.length > 200) _data.activity_log = _data.activity_log.slice(0, 200);
    save(_data);
  },

  containers:           mkCollection('containers'),
  orders:               mkCollection('orders'),
  drivers:              mkCollection('drivers'),
  fuel_logs:            mkCollection('fuel_logs'),
  maintenance_records:  mkCollection('maintenance_records'),
  trip_logs:            mkCollection('trip_logs'),
};

// Alias helpers used in routes
db.containers.findByNumber = (n) => _data.containers.find(c => c.container_number === n);
db.orders.findByNumber     = (n) => _data.orders.find(o => o.order_number === n);
db.orders.activeForContainer = (cid) => _data.orders.filter(o => o.container_id === cid && o.order_status < 5);

module.exports = db;
