const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'logistics.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS containers (
    id TEXT PRIMARY KEY,
    container_number TEXT NOT NULL UNIQUE,
    status INTEGER NOT NULL DEFAULT 0,
    location TEXT NOT NULL DEFAULT 'Khác',
    customer TEXT,
    cargo_type TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    container_id TEXT NOT NULL,
    status INTEGER NOT NULL,
    location TEXT NOT NULL,
    notes TEXT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (container_id) REFERENCES containers(id)
  );
`);

// Seed sample data if empty
const count = db.prepare('SELECT COUNT(*) as c FROM containers').get();
if (count.c === 0) {
  const insert = db.prepare(`
    INSERT INTO containers (id, container_number, status, location, customer, cargo_type, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertHistory = db.prepare(`
    INSERT INTO status_history (container_id, status, location, notes)
    VALUES (?, ?, ?, ?)
  `);

  const samples = [
    ['cnt-001', 'MSCU1234561', 0, 'Ga Đông Anh', 'Công ty A', 'Điện tử', 'Hàng nhập khẩu'],
    ['cnt-002', 'TCKU2345672', 1, 'Ga Trảng Bom', 'Công ty B', 'Dệt may', null],
    ['cnt-003', 'HLXU3456783', 2, 'Ga Đông Anh', 'Công ty C', 'Thực phẩm', null],
    ['cnt-004', 'MSKU4567894', 3, 'Ga Khác', 'Công ty D', 'Máy móc', 'Transit qua Hà Nội'],
    ['cnt-005', 'OOLU5678905', 4, 'Ga Trảng Bom', 'Công ty E', 'Hóa chất', null],
    ['cnt-006', 'CMAU6789016', 5, 'Khác', 'Công ty F', 'Đồ gỗ', 'Giao thành công'],
    ['cnt-007', 'GESU7890127', 0, 'Ga Đông Anh', 'Công ty G', 'Điện tử', null],
    ['cnt-008', 'APLU8901238', 6, 'Khác', 'Công ty H', 'Dệt may', 'Khách hàng hủy'],
    ['cnt-009', 'HLXU9012349', 2, 'Ga Trảng Bom', 'Công ty I', 'Thực phẩm', null],
    ['cnt-010', 'MSCU0123450', 3, 'Ga Đông Anh', 'Công ty J', 'Máy móc', null],
  ];

  for (const s of samples) {
    insert.run(...s);
    insertHistory.run(s[0], s[2], s[3], s[6]);
  }
}

module.exports = db;
