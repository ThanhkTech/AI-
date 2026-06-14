# Container Logistics Management System

Web app quản lý trạng thái vỏ container cho công ty vận tải.

## Tính năng

- **Theo dõi trạng thái** 7 trạng thái vận hành container
- **Theo dõi vị trí** tại 4 địa điểm (Ga Đông Anh, Ga Trảng Bom, Ga Khác, Khác)
- **Dashboard KPI** với biểu đồ phân bố trạng thái và vị trí
- **CRUD container** - thêm, sửa, xóa, tìm kiếm, lọc
- **Lịch sử trạng thái** theo dõi toàn bộ thay đổi

## Stack

- Frontend: React + Vite + Tailwind CSS + Recharts
- Backend: Node.js + Express + SQLite (better-sqlite3)

## Chạy local

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (terminal khác)
cd frontend
npm install
npm run dev
```

Mở http://localhost:5173
