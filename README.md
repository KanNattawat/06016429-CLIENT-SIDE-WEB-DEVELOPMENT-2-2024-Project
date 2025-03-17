# Pesterin Web Application

Pesterin เป็นเว็บแอปพลิเคชันที่ถูกพัฒนาภายใต้โปรเจกต์ 06016429-CLIENT-SIDE-WEB-DEVELOPMENT-2-2024-Project

## การติดตั้งระบบ

### 1. ดาวน์โหลดโค้ดโปรเจกต์
เปิด Terminal และพิมพ์คำสั่ง
```sh
git clone https://github.com/KanNattawat/06016429-CLIENT-SIDE-WEB-DEVELOPMENT-2-2024-Project.git
```

### 2. ติดตั้ง dependencies ของ frontend
```sh
cd myapp
npm install
```

### 3. ติดตั้ง dependencies ของ backend
เปิด Terminal ใหม่และพิมพ์
```sh
cd backend
npm install
```

### 4. ติดตั้ง Postgres SQL
ดาวน์โหลดและติดตั้งจากเว็บไซต์ [PostgreSQL Download](https://www.postgresql.org/download/)

### 5. เปิดโปรแกรม pgAdmin4 และสร้าง Database ใหม่สำหรับ Pesterin

### 6. ตั้งค่าไฟล์ `.env`
ไปที่โฟลเดอร์ `backend` และสร้างไฟล์ `.env` โดยอ้างอิงจาก `.env.example`

- แก้ไข `DATABASE_URL`
  - เปลี่ยน `Password` เป็นรหัสผ่านของ Postgres SQL
  - เปลี่ยน `Your_DB_Name` เป็นชื่อ Database ที่สร้างในข้อ 5
- ตั้งค่า Google OAuth
  - ไปที่ [Google Cloud API Credentials](https://console.cloud.google.com/apis/credentials)
  - สร้าง OAuth Client และนำ `Client ID` และ `Client Secret` มาใช้
- ตั้งค่า Facebook App
  - ไปที่ [Meta Developers](https://developers.facebook.com/)
  - สร้างแอปใหม่และนำ `App ID` และ `App Secret` มาใช้
- สร้าง `SESSION_SECRET` โดยใช้คำสั่งต่อไปนี้ใน Terminal
  ```sh
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
  แล้วนำค่าที่ได้ไปใส่ในบรรทัด `SESSION_SECRET` ใน `.env`

### 7. รันเซิร์ฟเวอร์และเริ่มใช้งาน
เปิด Terminal แล้วพิมพ์คำสั่งต่อไปนี้

#### รัน Frontend
```sh
cd myapp
npm run dev
```

#### รัน Backend
```sh
cd backend
node server.js
```

### 8. เข้าใช้งานแอปพลิเคชัน
เปิดเว็บเบราว์เซอร์และเข้าไปที่ [http://localhost:5173/](http://localhost:5173/)


---

### หมายเหตุ
- หากพบปัญหาเกี่ยวกับ Database ให้ตรวจสอบว่า Postgres SQL กำลังทำงานอยู่
- หากพบปัญหาเกี่ยวกับ `.env` ตรวจสอบให้แน่ใจว่าทุกค่าถูกตั้งค่าอย่างถูกต้อง
