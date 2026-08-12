# Deployment Guide - Vercel

## Quick Start (Vercel Deployment)

### Prerequisites
- Node.js 18+
- npm or yarn
- Vercel account (free at vercel.com)
- GitHub account (recommended for easy CI/CD)

### Step 1: Prepare Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: Absensi app ready for Vercel"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/absensi.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel
**Option A: Via Web Interface**
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework: Node.js
   - Root Directory: ./
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
5. Add Environment Variables:
   - `NODE_ENV`: production
   - `PORT`: 3000
6. Click "Deploy"

**Option B: Via CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Step 3: Access Your App
- Production URL: https://your-project-name.vercel.app
- Default routes:
  - Dashboard: `/` or `/dashboard`
  - Kiosk: `/kiosk`
  - Students: `/students`
  - Teachers: `/teachers`
  - Reports: `/reports`

---

## Local Development

### Prerequisites
```bash
npm install
```

### Setup Environment
```bash
# Copy example env
cp .env.example .env.local

# Edit .env.local if needed (defaults are fine for development)
```

### Run Development Server
```bash
npm run dev
# or
node --watch server.js
```

Server berjalan di http://localhost:3000

---

## NFC Reader Setup (Kiosk)

### Requirements
- USB NFC Reader (ACM-compatible, e.g., ACR122U, PN532)
- Browser dengan Web Serial API support (Chrome, Edge 79+)
- HTTPS connection (atau localhost untuk development)

### Setup Steps
1. Connect USB NFC reader ke Kiosk device
2. Buka http://localhost:3000/kiosk
3. Browser akan meminta permission untuk akses serial port
4. Klik "Allow" untuk connect

### Testing NFC (Manual Input)
Jika NFC reader tidak terdeteksi, Anda bisa test dengan:
1. Click di halaman kiosk
2. Ketik UID card (contoh: `AA:BB:CC:DD`)
3. Press Enter

---

## Admin Panel - User Management

### Default Admin Credentials
- Username: `admin`
- Password: `admin123`
- ⚠️ **CHANGE THIS IN PRODUCTION!**

### Enrollment Students/Teachers with NFC

**Via Admin Panel:**
1. Login ke dashboard dengan akun admin
2. Pergi ke Students/Teachers page
3. Pilih student/teacher
4. Input NFC UID di form
5. Save

**Via API:**
```bash
curl -X POST http://localhost:3000/api/admin/enroll-nfc \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "personId": "S-101",
    "role": "student",
    "nfcUid": "AA:BB:CC:DD"
  }'
```

### Enrollment Students with Face Recognition

**Via API:**
```bash
curl -X POST http://localhost:3000/api/admin/enroll-face \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "personId": "S-101",
    "role": "student",
    "faceImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }'
```

---

## Database

### SQLite (Default - Development)
- File: `./absensi.db`
- Auto-initialized on first run
- Backed by better-sqlite3 library

### Tables
- `students` - Student data with NFC UID & face embeddings
- `teachers` - Teacher data with NFC UID & face embeddings
- `attendance_logs` - Attendance records
- `face_templates` - Face embedding vectors
- `admin_users` - Admin credentials
- `nfc_registrations` - NFC card mappings

### Backup
```bash
# Backup database
cp absensi.db absensi.db.backup

# Restore
cp absensi.db.backup absensi.db
```

---

## Kiosk Features

### 1. NFC Scanning
- Tap NFC card ke reader
- System mencari UID di database
- Auto-record attendance
- Anti-spam: Cooldown 1 menit per person

### 2. Face Recognition
- Real-time webcam streaming
- Automatic face detection setiap 2 detik
- Comparison dengan enrolled faces
- Confidence threshold: 60% minimum
- Anti-spam: Cooldown 1 menit per person

### 3. Real-time Feedback
- ✅ Success: Green display, sound, show photo + name + class + time
- ❌ Error: Red display, error message
- Auto-reset display setiap 2-3 detik

### 4. WebSocket Live Updates
- Real-time attendance sync
- Kiosk → Server → Dashboard live refresh

---

## Troubleshooting

### NFC Reader Not Detected
- [ ] Check USB connection
- [ ] Verify driver installed (ACM/CDC)
- [ ] Test with `dmesg | grep ttyACM` (Linux)
- [ ] Try refresh browser
- [ ] Try different USB port

### Face Recognition Not Working
- [ ] Check browser camera permission
- [ ] Verify good lighting
- [ ] Ensure faces are enrolled (clear photo needed)
- [ ] Confidence threshold may be too high (adjust in config.js)

### Server Not Starting
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill if needed
kill -9 <PID>

# Try different port
PORT=4000 npm start
```

### Database Corruption
```bash
# Delete and re-init
rm absensi.db
npm start
```

---

## Production Checklist

- [ ] Change default admin password
- [ ] Set up HTTPS/SSL certificate
- [ ] Configure firewall rules
- [ ] Setup regular database backups
- [ ] Monitor server logs
- [ ] Setup error tracking (Sentry, etc.)
- [ ] Load testing
- [ ] Verify NFC reader compatibility on target device
- [ ] Test face recognition accuracy
- [ ] Setup monitoring alerts

---

## API Reference

### Attendance Endpoints

**Scan NFC**
```
POST /api/attendance/scan-nfc
Body: { nfcUid: string }
Response: { success: boolean, data: { personName, className, photoUrl, confidence } }
```

**Scan Face**
```
POST /api/attendance/scan-face
Body: { faceImage: base64_string }
Response: { success: boolean, data: { personName, className, photoUrl, confidence } }
```

**Get Dashboard**
```
GET /api/dashboard
Response: { totalStudents, totalTeachers, totalAttendanceToday, studentPresent, teacherPresent, recentAttendance }
```

**Get Report**
```
GET /api/report?date=2024-01-15&class=X-A
Response: { date, totalStudents, present, late, absent, recent }
```

**Admin: Enroll NFC**
```
POST /api/admin/enroll-nfc
Headers: Authorization: Bearer TOKEN
Body: { personId, role: "student|teacher", nfcUid }
```

**Admin: Enroll Face**
```
POST /api/admin/enroll-face
Headers: Authorization: Bearer TOKEN
Body: { personId, role: "student|teacher", faceImage }
```

---

## Support & Issues

For issues, questions, or improvements:
1. Check this guide's troubleshooting section
2. Review server logs: `npm start` (development)
3. Check Vercel logs: `vercel logs`
4. Open GitHub issue with:
   - Environment (Linux/Windows/Mac)
   - Browser + version
   - Error message & stack trace
   - Steps to reproduce
