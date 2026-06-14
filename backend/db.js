/**
 * Pure-JS JSON file database — no native compilation required.
 * Works on Windows, macOS, Linux without Python or Visual Studio.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'db.json');

function uuid() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

// --- Persistence ---
function load() {
  if (!fs.existsSync(DB_PATH)) return null;
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// --- Seed data ---
function createSeedData() {
  const containers = [
    { id: uuid(), container_number: 'MSCU1234561', container_status: 0, location: 'Ga Đông Anh', size: '20ft', notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), container_number: 'TCKU2345672', container_status: 1, location: 'Ga Trảng Bom', size: '40ft', notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), container_number: 'HLXU3456783', container_status: 2, location: 'Ga Đông Anh', size: '20ft', notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), container_number: 'MSKU4567894', container_status: 0, location: 'Ga Khác',     size: '40ft', notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), container_number: 'OOLU5678905', container_status: 4, location: 'Ga Trảng Bom', size: '20ft', notes: 'Chờ sửa động cơ', created_at: now(), updated_at: now() },
    { id: uuid(), container_number: 'CMAU6789016', container_status: 1, location: 'Khác',         size: '40ft', notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), container_number: 'GESU7890127', container_status: 0, location: 'Ga Đông Anh', size: '20ft', notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), container_number: 'APLU8901238', container_status: 3, location: 'Khác',         size: '40ft', notes: null, created_at: now(), updated_at: now() },
  ];

  const drivers = [
    { id: uuid(), name: 'Nguyễn Văn An',   phone: '0912345678', license_plate: '30H-12345', driver_status: 1, notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), name: 'Trần Văn Bình',   phone: '0923456789', license_plate: '51B-67890', driver_status: 0, notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), name: 'Lê Văn Cường',    phone: '0934567890', license_plate: '43A-11223', driver_status: 1, notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), name: 'Phạm Văn Dũng',   phone: '0945678901', license_plate: '60B-33445', driver_status: 0, notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), name: 'Hoàng Văn Em',    phone: '0956789012', license_plate: '75A-55667', driver_status: 2, notes: null, created_at: now(), updated_at: now() },
  ];

  const orders = [
    { id: uuid(), order_number: 'DH-2024-001', container_id: containers[0].id, driver_id: drivers[0].id, order_status: 1, customer: 'Công ty TNHH An Bình',    cargo_type: 'Điện tử',    pickup_address: 'KCN Thăng Long, Hà Nội',  delivery_address: 'Cảng Cát Lái, TP.HCM', notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), order_number: 'DH-2024-002', container_id: containers[1].id, driver_id: drivers[2].id, order_status: 3, customer: 'Công ty CP Bình Minh',     cargo_type: 'Dệt may',    pickup_address: 'KCN Amata, Đồng Nai',     delivery_address: 'Cảng Hải Phòng',       notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), order_number: 'DH-2024-003', container_id: containers[2].id, driver_id: null,         order_status: 0, customer: 'Công ty XNK Hòa Phát',     cargo_type: 'Thép',       pickup_address: 'KCN Phố Nối, Hưng Yên',  delivery_address: 'Cảng Đà Nẵng',         notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), order_number: 'DH-2024-004', container_id: containers[3].id, driver_id: drivers[1].id, order_status: 2, customer: 'Vinamilk',                  cargo_type: 'Thực phẩm', pickup_address: 'Bình Dương',              delivery_address: 'Hà Nội',               notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), order_number: 'DH-2024-005', container_id: containers[5].id, driver_id: drivers[4].id, order_status: 5, customer: 'Công ty Nhựa Tiền Phong', cargo_type: 'Nhựa',       pickup_address: 'Hải Phòng',              delivery_address: 'Đà Nẵng',              notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), order_number: 'DH-2024-006', container_id: containers[6].id, driver_id: null,         order_status: 0, customer: 'Tập đoàn FPT',             cargo_type: 'Thiết bị IT',pickup_address: 'Hà Nội',                 delivery_address: 'TP.HCM',               notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), order_number: 'DH-2024-007', container_id: containers[7].id, driver_id: drivers[0].id, order_status: 6, customer: 'Công ty Hòa Bình',         cargo_type: 'Vật liệu XD',pickup_address: 'Hà Nam',                 delivery_address: 'Nghệ An',              notes: 'Khách hàng hủy', created_at: now(), updated_at: now() },
  ];

  const activity_log = [
    { id: 1, entity_type: 'order', entity_id: orders[0].id, field: 'created', old_value: '', new_value: '1', note: null, created_at: now() },
    { id: 2, entity_type: 'order', entity_id: orders[1].id, field: 'created', old_value: '', new_value: '3', note: null, created_at: now() },
  ];

  return { containers, drivers, orders, activity_log, _log_seq: activity_log.length };
}

// Initialize or load
let _data = load();
if (!_data) {
  _data = createSeedData();
  save(_data);
}

// --- DB API ---
const db = {
  // Raw access for routes
  get data() { return _data; },

  commit() {
    save(_data);
  },

  log(entity_type, entity_id, field, old_value, new_value, note = null) {
    _data._log_seq = (_data._log_seq || 0) + 1;
    _data.activity_log.unshift({
      id: _data._log_seq,
      entity_type, entity_id, field,
      old_value: String(old_value ?? ''),
      new_value: String(new_value ?? ''),
      note,
      created_at: now(),
    });
    // Keep last 200 entries
    if (_data.activity_log.length > 200) _data.activity_log = _data.activity_log.slice(0, 200);
    save(_data);
  },

  // Helpers
  uuid,
  now,

  // Containers
  containers: {
    all: () => _data.containers,
    find: (id) => _data.containers.find(c => c.id === id),
    findByNumber: (n) => _data.containers.find(c => c.container_number === n),
    insert: (row) => { _data.containers.push(row); save(_data); return row; },
    update: (id, patch) => {
      const i = _data.containers.findIndex(c => c.id === id);
      if (i < 0) return null;
      _data.containers[i] = { ..._data.containers[i], ...patch, updated_at: now() };
      save(_data);
      return _data.containers[i];
    },
    delete: (id) => {
      _data.containers = _data.containers.filter(c => c.id !== id);
      save(_data);
    },
  },

  // Orders
  orders: {
    all: () => _data.orders,
    find: (id) => _data.orders.find(o => o.id === id),
    findByNumber: (n) => _data.orders.find(o => o.order_number === n),
    insert: (row) => { _data.orders.push(row); save(_data); return row; },
    update: (id, patch) => {
      const i = _data.orders.findIndex(o => o.id === id);
      if (i < 0) return null;
      _data.orders[i] = { ..._data.orders[i], ...patch, updated_at: now() };
      save(_data);
      return _data.orders[i];
    },
    delete: (id) => {
      _data.orders = _data.orders.filter(o => o.id !== id);
      save(_data);
    },
    activeForContainer: (container_id) =>
      _data.orders.filter(o => o.container_id === container_id && o.order_status < 5),
  },

  // Drivers
  drivers: {
    all: () => _data.drivers,
    find: (id) => _data.drivers.find(d => d.id === id),
    insert: (row) => { _data.drivers.push(row); save(_data); return row; },
    update: (id, patch) => {
      const i = _data.drivers.findIndex(d => d.id === id);
      if (i < 0) return null;
      _data.drivers[i] = { ..._data.drivers[i], ...patch, updated_at: now() };
      save(_data);
      return _data.drivers[i];
    },
    delete: (id) => {
      _data.drivers = _data.drivers.filter(d => d.id !== id);
      save(_data);
    },
  },
};

module.exports = db;
