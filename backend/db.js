const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'logistics.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Vỏ container
  CREATE TABLE IF NOT EXISTS containers (
    id TEXT PRIMARY KEY,
    container_number TEXT NOT NULL UNIQUE,
    container_status INTEGER NOT NULL DEFAULT 0,
    location TEXT NOT NULL DEFAULT 'Ga Đông Anh',
    size TEXT DEFAULT '20ft',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Tài xế
  CREATE TABLE IF NOT EXISTS drivers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    license_plate TEXT,
    driver_status INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Đơn hàng
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    container_id TEXT REFERENCES containers(id),
    driver_id TEXT REFERENCES drivers(id),
    order_status INTEGER NOT NULL DEFAULT 0,
    customer TEXT,
    cargo_type TEXT,
    pickup_address TEXT,
    delivery_address TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Lịch sử thay đổi trạng thái
  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    field TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed data
const cnt = db.prepare('SELECT COUNT(*) as c FROM containers').get();
if (cnt.c === 0) {
  const { v4: uuidv4 } = require('uuid');

  // Seed containers
  const containers = [
    { id: uuidv4(), container_number: 'MSCU1234561', container_status: 0, location: 'Ga Đông Anh', size: '20ft' },
    { id: uuidv4(), container_number: 'TCKU2345672', container_status: 1, location: 'Ga Trảng Bom', size: '40ft' },
    { id: uuidv4(), container_number: 'HLXU3456783', container_status: 2, location: 'Ga Đông Anh', size: '20ft' },
    { id: uuidv4(), container_number: 'MSKU4567894', container_status: 0, location: 'Ga Khác', size: '40ft' },
    { id: uuidv4(), container_number: 'OOLU5678905', container_status: 4, location: 'Ga Trảng Bom', size: '20ft', notes: 'Chờ sửa động cơ' },
    { id: uuidv4(), container_number: 'CMAU6789016', container_status: 1, location: 'Khác', size: '40ft' },
    { id: uuidv4(), container_number: 'GESU7890127', container_status: 0, location: 'Ga Đông Anh', size: '20ft' },
    { id: uuidv4(), container_number: 'APLU8901238', container_status: 3, location: 'Khác', size: '40ft' },
  ];

  const insCont = db.prepare(`INSERT INTO containers (id, container_number, container_status, location, size, notes) VALUES (@id, @container_number, @container_status, @location, @size, @notes)`);
  for (const c of containers) db.prepare(`INSERT INTO containers (id,container_number,container_status,location,size,notes) VALUES (?,?,?,?,?,?)`).run(c.id, c.container_number, c.container_status, c.location, c.size, c.notes || null);

  // Seed drivers
  const drivers = [
    { id: uuidv4(), name: 'Nguyễn Văn An', phone: '0912345678', license_plate: '30H-12345', driver_status: 1 },
    { id: uuidv4(), name: 'Trần Văn Bình', phone: '0923456789', license_plate: '51B-67890', driver_status: 0 },
    { id: uuidv4(), name: 'Lê Văn Cường', phone: '0934567890', license_plate: '43A-11223', driver_status: 1 },
    { id: uuidv4(), name: 'Phạm Văn Dũng', phone: '0945678901', license_plate: '60B-33445', driver_status: 0 },
    { id: uuidv4(), name: 'Hoàng Văn Em', phone: '0956789012', license_plate: '75A-55667', driver_status: 2 },
  ];
  for (const d of drivers) db.prepare(`INSERT INTO drivers (id,name,phone,license_plate,driver_status) VALUES (?,?,?,?,?)`).run(d.id, d.name, d.phone, d.license_plate, d.driver_status);

  // Seed orders
  const allCont = db.prepare('SELECT id FROM containers').all();
  const allDrv = db.prepare('SELECT id FROM drivers').all();
  const orders = [
    { id: uuidv4(), order_number: 'DH-2024-001', container_id: allCont[0].id, driver_id: allDrv[0].id, order_status: 1, customer: 'Công ty TNHH An Bình', cargo_type: 'Điện tử', pickup_address: 'KCN Thăng Long, Hà Nội', delivery_address: 'Cảng Cát Lái, TP.HCM' },
    { id: uuidv4(), order_number: 'DH-2024-002', container_id: allCont[1].id, driver_id: allDrv[2].id, order_status: 3, customer: 'Công ty CP Bình Minh', cargo_type: 'Dệt may', pickup_address: 'KCN Amata, Đồng Nai', delivery_address: 'Cảng Hải Phòng' },
    { id: uuidv4(), order_number: 'DH-2024-003', container_id: allCont[2].id, driver_id: null, order_status: 0, customer: 'Công ty XNK Hòa Phát', cargo_type: 'Thép', pickup_address: 'KCN Phố Nối, Hưng Yên', delivery_address: 'Cảng Đà Nẵng' },
    { id: uuidv4(), order_number: 'DH-2024-004', container_id: allCont[3].id, driver_id: allDrv[1].id, order_status: 2, customer: 'Vinamilk', cargo_type: 'Thực phẩm', pickup_address: 'Bình Dương', delivery_address: 'Hà Nội' },
    { id: uuidv4(), order_number: 'DH-2024-005', container_id: allCont[5].id, driver_id: allDrv[3].id, order_status: 5, customer: 'Công ty Nhựa Tiền Phong', cargo_type: 'Nhựa', pickup_address: 'Hải Phòng', delivery_address: 'Đà Nẵng' },
    { id: uuidv4(), order_number: 'DH-2024-006', container_id: allCont[6].id, driver_id: null, order_status: 0, customer: 'Tập đoàn FPT', cargo_type: 'Thiết bị IT', pickup_address: 'Hà Nội', delivery_address: 'TP.HCM' },
    { id: uuidv4(), order_number: 'DH-2024-007', container_id: allCont[7].id, driver_id: allDrv[0].id, order_status: 6, customer: 'Công ty Hòa Bình', cargo_type: 'Vật liệu XD', pickup_address: 'Hà Nam', delivery_address: 'Nghệ An', notes: 'Khách hủy đơn' },
  ];
  for (const o of orders) db.prepare(`INSERT INTO orders (id,order_number,container_id,driver_id,order_status,customer,cargo_type,pickup_address,delivery_address,notes) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(o.id, o.order_number, o.container_id, o.driver_id, o.order_status, o.customer, o.cargo_type, o.pickup_address, o.delivery_address, o.notes || null);
}

module.exports = db;
