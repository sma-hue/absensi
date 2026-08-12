# 🎓 Aplikasi Absensi Siswa & Guru - NFC + Face Recognition

**Sistem absensi modern untuk Sypesantren Jagat Ar dengan integrasi NFC card reader dan face recognition technology.**

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 🚀 Fitur Utama

### 1. **Kiosk Scanning (NFC + Face Recognition)**
- ✅ Tap NFC card untuk instan attendance
- ✅ Real-time face detection via webcam
- ✅ Anti-spam (cooldown 1 menit)
- ✅ Beautiful modern UI dengan foto siswa
- ✅ Web Serial API untuk USB NFC reader

### 2. **Dashboard Admin**
- 👨‍💼 Manajemen data siswa & guru
- 📱 Registrasi NFC UID per person
- 📷 Enrollment wajah (auto face-to-vector)
- 📊 Laporan harian & bulanan
- 🔍 Real-time monitoring & statistics

### 3. **Backend API**
- `POST /api/attendance/scan-nfc` - NFC scanning
- `POST /api/attendance/scan-face` - Face recognition scanning
- `POST /api/admin/enroll-nfc` - Register NFC card
- `POST /api/admin/enroll-face` - Enroll face photo
- `GET /api/dashboard` - Dashboard statistics
- `GET /api/report` - Daily/monthly reports
- WebSocket real-time updates via Socket.io

### 4. **Database**
- SQLite (development) / PostgreSQL (production ready)
- Auto-initialized schema
- Pre-seeded sample data (5 students, 3 teachers)
- Indexed queries untuk performance

---

## 📦 Tech Stack

```
Frontend:        HTML5 + CSS3 + Vanilla JavaScript
Backend:         Node.js + Express.js + Socket.io
Database:        SQLite (better-sqlite3)
Real-time:       Socket.io WebSocket
Hardware:        USB NFC Reader (Web Serial API)
Deployment:      Vercel
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org))
- npm or yarn
- Git (untuk deployment)

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/sma-hue/absensi.git
cd absensi

# 2. Install dependencies
npm install

# 3. Setup environment (optional)
cp .env.example .env.local

# 4. Run development server
npm run dev

# Server berjalan di http://localhost:3000
```

### Akses Aplikasi
- **Dashboard**: http://localhost:3000
- **Kiosk**: http://localhost:3000/kiosk
- **Students**: http://localhost:3000/students
- **Teachers**: http://localhost:3000/teachers
- **Reports**: http://localhost:3000/reports

### Default Admin Credentials
```
Username: admin
Password: admin123
⚠️ CHANGE IMMEDIATELY after first login!
```

---

## 📤 Deployment ke Vercel

### Option 1: Deploy via Web Interface (Recommended)

1. **Siapkan GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/absensi.git
   git branch -M main
   git push -u origin main
   ```

2. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Framework: **Node.js**
   - Root Directory: **./absensi** (if monorepo)
   - Build Command: **(leave empty)**
   - Output Directory: **(leave empty)**
   - Environment Variables: (optional, defaults work fine)
   - Click "Deploy"

3. **Selesai!** 🎉
   - Vercel akan give you URL: `https://your-project.vercel.app`
   - Deployment otomatis setiap push ke main branch

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## 📱 Kiosk Setup

### Hardware Requirements
- PC/Laptop/Tablet dengan browser (Chrome 79+, Edge 79+)
- USB NFC Reader (ACR122U, PN532, or similar ACM device)
- Webcam (untuk face recognition)
- HTTPS certificate (production) atau localhost (development)

### Setup Steps
1. Connect USB NFC reader ke device
2. Open http://localhost:3000/kiosk (development)
3. Browser akan ask permission untuk Web Serial API → Allow
4. Kamera akan start streaming
5. Ready untuk scanning!

### Test Kiosk (Without NFC Reader)
```bash
# Manual input via keyboard (development only)
1. Click di halaman kiosk
2. Type NFC UID (contoh: AA:BB:CC:DD)
3. Press Enter
```

---

## 👥 Admin Guide

### Enroll Siswa/Guru

**1. Add Student/Teacher**
- Go to Students/Teachers page
- Isi form: ID, Nama, Kelas/Pelajaran
- Click "Tambah Siswa/Guru"

**2. Register NFC Card**
- Pilih siswa/guru dari list
- Tap kartu ke NFC reader
- UID akan auto-detect dan tersimpan
- Atau input manual jika tidak auto-detect

**3. Enroll Face**
- Upload foto wajah yang jelas
- Sistem auto-convert ke face embedding (vector)
- Simpan

---

## 📊 Real-time Dashboard

- **Total Siswa/Guru** - Total registered users
- **Hadir Hari Ini** - Attendance count today
- **Real-time List** - Last 8 attendance records
- **Live Updates** - WebSocket auto-refresh
- **Reports** - Daily/monthly analytics

---

## 🔒 Security

- ✅ SQLite data encrypted at rest
- ✅ Face embeddings (vectors) only, no photo storage
- ✅ Anti-brute-force: cooldown per person
- ⚠️ **IMPORTANT:** Change default admin password!
- ✅ HTTPS enforced on Vercel (automatic)

---

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start guide untuk semua user
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed deployment & troubleshooting
- **[skill.md](./skill.md)** - Architecture & technical design

---

## 🚧 Development Status

### ✅ Completed
- [x] Backend API dengan NFC scanning
- [x] Face recognition integration
- [x] Modern Kiosk UI
- [x] Admin dashboard
- [x] Real-time WebSocket updates
- [x] SQLite database
- [x] Vercel deployment config
- [x] Comprehensive documentation

### 🔄 In Progress / Future
- [ ] Python face recognition service (optional)
- [ ] Bulk import CSV students/teachers
- [ ] Mobile app (Flutter/React Native)
- [ ] Advanced analytics & reports
- [ ] SMS notifications
- [ ] QR code alternative to NFC
- [ ] Multi-location support

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| NFC reader not detected | Check USB driver, try different port |
| Webcam not working | Allow browser permission, restart browser |
| Face always fails | Good lighting, clear photo, enrollment needed |
| Server won't start | Check port 3000 not in use, Node 18+ required |
| Database error | Delete `absensi.db`, restart server |

**Full troubleshooting:** See [DEPLOYMENT.md#troubleshooting](./DEPLOYMENT.md#troubleshooting)

---

## 📞 Support

- 📖 Read [QUICKSTART.md](./QUICKSTART.md) first
- 🔧 Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide
- 💬 Open GitHub Issues for bugs/feature requests
- 🔍 Review logs: `npm start` shows detailed errors

---

## 📄 License

MIT License - Feel free to use & modify for your institution

---

## 👨‍👩‍👧‍👦 Team

**Sypesantren Jagat Ar**  
Sistem Informasi & IT Team

---

## 🔄 Version History

- **v1.0.0** (2026-08-12) - Production release with NFC + Face Recognition
  - Modern Kiosk UI
  - NFC card scanning
  - Face recognition enrollment & scanning
  - Real-time dashboard
  - Vercel deployment ready

---

**Last Updated:** 2026-08-12  
**Status:** ✅ Production Ready  
**Next Release:** v1.1.0 (Python face service integration)

