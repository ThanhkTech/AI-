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

  // Đối tác (partners) — công ty đến lấy vỏ
  const partners = [
    { id: uuid(), name: 'Công ty TNHH Vận tải Hoàng Long', short_name: 'Hoàng Long', phone: '024-3856-1234', contact_person: 'Nguyễn Văn Tuấn', email: 'hoanglongvt@gmail.com', notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), name: 'Công ty CP Logistics Miền Nam',   short_name: 'LMN',        phone: '028-3912-5678', contact_person: 'Trần Thị Lan',    email: 'lmn.logistics@gmail.com', notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), name: 'Doanh nghiệp Tư nhân Bình Minh',  short_name: 'Bình Minh',  phone: '0908-345-678',  contact_person: 'Lê Văn Bình',     email: null, notes: 'Chuyên tuyến Hà Nội - TP.HCM', created_at: now(), updated_at: now() },
    { id: uuid(), name: 'Công ty Vận tải Thành Công',      short_name: 'Thành Công', phone: '0912-456-789',  contact_person: 'Phạm Thị Mai',    email: 'thanhcong.vt@gmail.com', notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), name: 'HTX Vận tải Đông Bắc',            short_name: 'Đông Bắc',   phone: '0356-789-012',  contact_person: 'Hoàng Văn Nam',   email: null, notes: null, created_at: now(), updated_at: now() },
  ];

  const orders = [
    { id: uuid(), order_number: 'DH-2024-001', container_id: containers[0].id, partner_id: partners[0].id, order_status: 1, customer: 'Công ty TNHH An Bình',    cargo_type: 'Điện tử',     pickup_address: 'KCN Thăng Long, Hà Nội',  delivery_address: 'Cảng Cát Lái, TP.HCM', notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), order_number: 'DH-2024-002', container_id: containers[1].id, partner_id: partners[1].id, order_status: 3, customer: 'Công ty CP Bình Minh',     cargo_type: 'Dệt may',     pickup_address: 'KCN Amata, Đồng Nai',     delivery_address: 'Cảng Hải Phòng',       notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), order_number: 'DH-2024-003', container_id: containers[2].id, partner_id: null,          order_status: 0, customer: 'Công ty XNK Hòa Phát',     cargo_type: 'Thép',        pickup_address: 'KCN Phố Nối, Hưng Yên',  delivery_address: 'Cảng Đà Nẵng',         notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), order_number: 'DH-2024-004', container_id: containers[3].id, partner_id: partners[2].id, order_status: 2, customer: 'Vinamilk',                  cargo_type: 'Thực phẩm',  pickup_address: 'Bình Dương',              delivery_address: 'Hà Nội',               notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), order_number: 'DH-2024-005', container_id: containers[5].id, partner_id: partners[3].id, order_status: 5, customer: 'Nhựa Tiền Phong',          cargo_type: 'Nhựa',        pickup_address: 'Hải Phòng',              delivery_address: 'Đà Nẵng',              notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), order_number: 'DH-2024-006', container_id: containers[6].id, partner_id: null,          order_status: 0, customer: 'Tập đoàn FPT',             cargo_type: 'Thiết bị IT', pickup_address: 'Hà Nội',                 delivery_address: 'TP.HCM',               notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), order_number: 'DH-2024-007', container_id: containers[7].id, partner_id: partners[0].id, order_status: 6, customer: 'Công ty Hòa Bình',         cargo_type: 'Vật liệu XD', pickup_address: 'Hà Nam',                delivery_address: 'Nghệ An',              notes: 'Khách hàng hủy', created_at: now(), updated_at: now() },
  ];

  const fuel_logs = [
    { id: uuid(), container_id: containers[0].id, fill_date: '2024-06-01', liters: 120, price_per_liter: 22500, total_cost: 2700000, station: 'Petrolimex Thăng Long', odometer: 45200, notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), container_id: containers[1].id, fill_date: '2024-06-03', liters: 95,  price_per_liter: 22500, total_cost: 2137500, station: 'Petrolimex Đồng Nai',   odometer: 32100, notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), container_id: containers[0].id, fill_date: '2024-06-05', liters: 110, price_per_liter: 23000, total_cost: 2530000, station: 'PVOil Biên Hòa',        odometer: 45800, notes: 'Thêm dầu nhớt', created_at: now(), updated_at: now() },
    { id: uuid(), container_id: containers[2].id, fill_date: '2024-06-07', liters: 85,  price_per_liter: 22500, total_cost: 1912500, station: 'Petrolimex Hải Phòng',  odometer: 18900, notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), container_id: containers[3].id, fill_date: '2024-06-08', liters: 130, price_per_liter: 23000, total_cost: 2990000, station: 'PVOil Bình Dương',      odometer: 67500, notes: null, created_at: now(), updated_at: now() },
  ];

  const maintenance_records = [
    { id: uuid(), container_id: containers[4].id, container_number: containers[4].container_number, repair_type: 'Động cơ', description: 'Thay động cơ diesel, thay dầu nhớt toàn bộ', workshop: 'Gara Hoàng Long', status: 'in_progress', start_date: '2024-06-01', end_date: null, estimated_cost: 15000000, actual_cost: null, settled: false, settled_at: null, settled_by: null, notes: 'Đang chờ linh kiện', created_at: now(), updated_at: now() },
    { id: uuid(), container_id: containers[0].id, container_number: containers[0].container_number, repair_type: 'Lốp xe',  description: 'Thay 4 lốp xe trục sau', workshop: 'Gara Minh Tuấn', status: 'completed', start_date: '2024-05-20', end_date: '2024-05-21', estimated_cost: 8000000, actual_cost: 7800000, settled: true, settled_at: '2024-05-25', settled_by: 'Giám đốc', notes: null, created_at: now(), updated_at: now() },
    { id: uuid(), container_id: containers[2].id, container_number: containers[2].container_number, repair_type: 'Phanh',   description: 'Bảo dưỡng hệ thống phanh, thay má phanh', workshop: 'Trung tâm VTS', status: 'completed', start_date: '2024-05-28', end_date: '2024-05-29', estimated_cost: 3500000, actual_cost: 3200000, settled: false, settled_at: null, settled_by: null, notes: 'Chờ quyết toán', created_at: now(), updated_at: now() },
    { id: uuid(), container_id: containers[1].id, container_number: containers[1].container_number, repair_type: 'Điện',   description: 'Sửa hệ thống đèn, thay ắc quy', workshop: 'Gara Điện Minh', status: 'pending', start_date: null, end_date: null, estimated_cost: 2000000, actual_cost: null, settled: false, settled_at: null, settled_by: null, notes: null, created_at: now(), updated_at: now() },
  ];

  const trip_logs = [
    { id: uuid(), order_id: orders[0].id, order_number: orders[0].order_number, container_id: containers[0].id, partner_id: partners[0].id, event_type: 'depart',  location: 'Ga Đông Anh',             description: 'Đối tác Hoàng Long đến lấy vỏ', timestamp: '2024-06-01T07:00:00.000Z', created_at: now() },
    { id: uuid(), order_id: orders[0].id, order_number: orders[0].order_number, container_id: containers[0].id, partner_id: partners[0].id, event_type: 'pickup',  location: 'KCN Thăng Long, Hà Nội',  description: 'Hoàn thành lấy hàng — 24 pallet điện tử', timestamp: '2024-06-01T09:30:00.000Z', created_at: now() },
    { id: uuid(), order_id: orders[0].id, order_number: orders[0].order_number, container_id: containers[0].id, partner_id: partners[0].id, event_type: 'transit', location: 'Ga Đông Anh',             description: 'Container trả về ga, chờ vận chuyển', timestamp: '2024-06-01T11:00:00.000Z', created_at: now() },
    { id: uuid(), order_id: orders[1].id, order_number: orders[1].order_number, container_id: containers[1].id, partner_id: partners[1].id, event_type: 'depart',  location: 'Ga Trảng Bom',            description: 'Đối tác LMN lấy vỏ tại ga', timestamp: '2024-06-03T06:00:00.000Z', created_at: now() },
    { id: uuid(), order_id: orders[1].id, order_number: orders[1].order_number, container_id: containers[1].id, partner_id: partners[1].id, event_type: 'pickup',  location: 'KCN Amata, Đồng Nai',     description: 'Đã lấy hàng dệt may', timestamp: '2024-06-03T10:00:00.000Z', created_at: now() },
    { id: uuid(), order_id: orders[4].id, order_number: orders[4].order_number, container_id: containers[5].id, partner_id: partners[3].id, event_type: 'depart',  location: 'Hải Phòng',               description: 'Khởi hành', timestamp: '2024-05-28T06:00:00.000Z', created_at: now() },
    { id: uuid(), order_id: orders[4].id, order_number: orders[4].order_number, container_id: containers[5].id, partner_id: partners[3].id, event_type: 'deliver', location: 'Đà Nẵng',                 description: 'Giao hàng thành công — khách ký nhận', timestamp: '2024-05-29T15:00:00.000Z', created_at: now() },
  ];

  const activity_log = [
    { id: 1, entity_type: 'order', entity_id: orders[0].id, field: 'created', old_value: '', new_value: '1', note: null, created_at: now() },
    { id: 2, entity_type: 'order', entity_id: orders[1].id, field: 'created', old_value: '', new_value: '3', note: null, created_at: now() },
  ];

  return { containers, partners, orders, fuel_logs, maintenance_records, trip_logs, activity_log, _log_seq: 2 };
}

let _data = load();
if (!_data) { _data = createSeedData(); save(_data); }
// Migrate
['fuel_logs','maintenance_records','trip_logs','partners'].forEach(k => { if (!_data[k]) { _data[k] = []; save(_data); } });

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
  uuid, now,
  log(entity_type, entity_id, field, old_value, new_value) {
    _data._log_seq = (_data._log_seq || 0) + 1;
    _data.activity_log.unshift({ id: _data._log_seq, entity_type, entity_id, field, old_value: String(old_value ?? ''), new_value: String(new_value ?? ''), note: null, created_at: now() });
    if (_data.activity_log.length > 200) _data.activity_log = _data.activity_log.slice(0, 200);
    save(_data);
  },
  containers:           mkCollection('containers'),
  partners:             mkCollection('partners'),
  orders:               mkCollection('orders'),
  fuel_logs:            mkCollection('fuel_logs'),
  maintenance_records:  mkCollection('maintenance_records'),
  trip_logs:            mkCollection('trip_logs'),
};

db.containers.findByNumber = (n) => _data.containers.find(c => c.container_number === n);
db.orders.findByNumber     = (n) => _data.orders.find(o => o.order_number === n);
db.orders.activeForContainer = (cid) => _data.orders.filter(o => o.container_id === cid && o.order_status < 5);

module.exports = db;
