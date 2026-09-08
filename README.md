# ระบบจัดการพิมพ์ข้อสอบ (Online Exam Printing Management System)

> คู่มือสำหรับกลับมาอ่านโครงสร้างและหน้าที่ของแต่ละส่วน: `CODE-GUIDE-TH.md`

ระบบจัดการพิมพ์ข้อสอบระดับมหาวิทยาลัยแบบครบวงจร (Full-Stack Web Application) รองรับกระบวนการ **"ส่ง → ตรวจสอบ → ตัดข้อสอบ → พิมพ์ → บรรจุซอง → ส่งมอบ"**

---

## 🛠️ Tech Stack & Architecture

- **Backend**: Node.js, Express, TypeScript, **Prisma ORM**, **PostgreSQL (Supabase)**, WebSockets (`ws`), PDFKit (`pdfkit`), Multer, Bcrypt, JSON Web Token (JWT), Supabase Storage & Auth SDK (`@supabase/supabase-js`).
- **Database & Pooling**: PostgreSQL on Supabase with Connection Pooling (`port 6543`) for high concurrency (NFR-1) and Direct URL (`port 5432`) for migrations.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons, Canvas Confetti.
- **Security & RBAC**: 2-Factor Authentication (2FA TOTP/OTP with 3-minute timeout), Role-Based Access Control (RBAC), Audit Trail Interceptor.

---

## 👥 ผู้ใช้งาน 4 บทบาท (4 User Roles)

1. **อาจารย์ผู้สอน (Instructor)**: กรอกข้อมูลวิชา อัปโหลดไฟล์ (.docx/.pdf) ติดตามสถานะ Real-time แก้ไข/ยกเลิกได้ก่อนตัดข้อสอบและล่วงหน้าอย่างน้อย 2 วันก่อน Deadline (REQ-0004, REQ-0005)
2. **เจ้าหน้าที่หน่วยโสตทัศนศึกษา (AV Staff)**: ตรวจสอบไฟล์ อนุมัติตัดข้อสอบ หรือส่งกลับแก้ไขพร้อมระบุเหตุผล บันทึกจำนวนพิมพ์ พิมพ์ใบปะหน้าซอง และยืนยันบรรจุซอง (REQ-0006 ถึง REQ-0011)
3. **เจ้าหน้าที่ดำเนินการสอบ (Exam Coordinator)**: จัดการรายวิชา วัน-เวลาสอบ ห้องสอบ และตรวจรับมอบซองข้อสอบ (REQ-0003, REQ-0012)
4. **ผู้ดูแลระบบ (Admin)**: จัดการผู้ใช้งานและสิทธิ์ ดูรายงานสรุปภาพรวมทั้งหมด และดูประวัติ Audit Log (REQ-0002, REQ-0013, REQ-0014)

---

## 🚀 วิธีการติดตั้งและเริ่มใช้งาน (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
# ติดตั้ง Backend
cd backend
npm install

# ติดตั้ง Frontend
cd ../frontend
npm install
```

### 2. ตั้งค่า Environment Variables (Supabase / PostgreSQL)
คัดลอกไฟล์ `.env.example` เป็น `.env` ในโฟลเดอร์ `backend/`:
```bash
cd backend
cp .env.example .env
```
กำหนดค่า `DATABASE_URL` (Connection Pooling: Port 6543) และ `DIRECT_URL` (Direct: Port 5432) จากโปรเจกต์ Supabase ของคุณ

### 3. รัน Database Migration & Seeder
```bash
cd backend

# สร้างตารางบน Supabase PostgreSQL
npx prisma migrate dev --name init

# (หรือ) อัปเดต Schema ตรงไปยังฐานข้อมูล
npm run prisma:push

# นำเข้าข้อมูลเริ่มต้น (Mock Users, Courses, Schedules, Exams)
npm run db:seed

# (ถ้ามีข้อมูลใน SQLite เดิม) รันสคริปต์ย้ายข้อมูลเข้า Supabase
npm run db:migrate-sqlite
```

> ระบบใช้ตารางชื่อ ER-v2 เป็นฐานข้อมูลหลักโดยตรงแล้ว ไม่มีตารางเดิมตัวพิมพ์เล็กหรือระบบซิงก์สองชุด
> มีตารางเสริมเฉพาะข้อมูลกำหนดการ การแจ้งเตือน ใบปะหน้า และ audit ที่ Requirement ต้องใช้แต่ ER ไม่ได้ระบุ
> ห้ามใช้ `prisma db push` หรือ `prisma migrate reset` หลังติดตั้ง RLS และ CHECK constraints ด้วย SQL

### 4. รันระบบ (Development Mode)
```bash
# รัน Backend API (Port 4000) และ WebSocket (ws://localhost:4000/ws)
cd backend
npm run dev

# รัน Frontend (Port 5173)
cd frontend
npm run dev
```

เปิดเว็บเบราว์เซอร์ไปที่: **`http://localhost:5173`**

---

## 🔑 บัญชีตัวอย่างสำหรับทดสอบ (Demo Accounts)

ทุกบัญชีใช้รหัสผ่าน: **`password123`**
- **อาจารย์ (Instructor):** `instructor1` หรือ `instructor2`
- **เจ้าหน้าที่หน่วยโสต (AV Staff):** `avstaff1`
- **เจ้าหน้าที่ดำเนินการสอบ (Coordinator):** `coordinator1`
- **ผู้ดูแลระบบ (Admin):** `admin`

*(สามารถกดปุ่มเลือกบทบาทตัวอย่างในหน้า Login หรือใช้แถบ **"สลับสิทธิ์ทดสอบ"** บนแถบด้านบนของทุกหน้าเพื่อสลับบทบาทได้ทันที)*

---

## 📋 ความครอบคลุม Functional Requirements

- [x] **REQ-0001**: Login + 2FA นับถอยหลัง 3 นาที (NFR-5)
- [x] **REQ-0002**: Admin จัดการผู้ใช้งาน (CRUD, ระงับ, เปลี่ยนบทบาท)
- [x] **REQ-0003**: จนท.ดำเนินการสอบจัดการรายวิชาและวัน-เวลา-ห้องสอบ
- [x] **REQ-0004**: อาจารย์กรอกข้อมูลและอัปโหลดไฟล์ (.docx/.pdf)
- [x] **REQ-0005**: เงื่อนไขแก้ไข/ยกเลิก (ก่อนตัดข้อสอบ และ $\ge 2$ วันก่อน Deadline)
- [x] **REQ-0006**: ตรวจสอบไฟล์และอนุมัติตัดข้อสอบ (APPROVED)
- [x] **REQ-0007**: ปฏิเสธพร้อมเหตุผล และแจ้งเตือนอาจารย์แบบ Real-time
- [x] **REQ-0008**: แสดงสถานะแบบ Real-time (WebSockets + Toast)
- [x] **REQ-0009**: บันทึกการพิมพ์ จำนวนชุด ชนิดกระดาษ วัน-เวลา และผู้พิมพ์
- [x] **REQ-0010**: พิมพ์ใบปะหน้าซองข้อสอบมาตรฐาน (FORM EXAM-01) พร้อม QR Code
- [x] **REQ-0011**: ยืนยันการบรรจุซองข้อสอบ (PACKED)
- [x] **REQ-0012**: แจ้งเตือนพร้อมรับมอบ + ลงนามส่งมอบข้อสอบ (DELIVERED)
- [x] **REQ-0013**: บันทึก Audit Log ทุกขั้นตอนพร้อมดู JSON diff
- [x] **REQ-0014**: รายงานสรุปภาพรวมพร้อมตัวกรองค้นหาละเอียด และ Export CSV
