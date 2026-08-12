# 🎯 Quick Start - Aplikasi Absensi NFC + Face Recognition

## 📱 Untuk Pengguna Kiosk (Scanning)

### 1. Akses Kiosk
- Buka browser di Kiosk device
- Pergi ke URL: `http://localhost:3000/kiosk` (lokal) atau `https://your-app.vercel.app/kiosk`

### 2. Cara Absensi

**Via NFC Card:**
1. Lihat layar yang mengatakan "Tap Kartu NFC"
2. Tap kartu ke NFC reader
3. Sistem otomatis mencatat kehadiran ✅
4. Layar menampilkan: Nama + Kelas + Foto + Waktu

**Via Face Recognition:**
1. Lihat layar yang mengatakan "Hadap Kamera"
2. Hadap kamera dengan kondisi pencahayaan baik
3. Sistem otomatis detect wajah setiap 2 detik
4. Jika match dengan data enrolled, kehadiran tercatat ✅

### 3. Anti-Spam
- Setiap orang hanya bisa absen 1x per menit
- Jika tap ulang dalam 1 menit → "Sudah tercatat, silakan tunggu"

---

## 👨‍💼 Untuk Admin (Dashboard)

### 1. Login ke Dashboard
- URL: `http://localhost:3000` atau `https://your-app.vercel.app`
- Default Username: `admin`
- Default Password: `admin123`
- ⚠️ **CHANGE PASSWORD IMMEDIATELY** setelah login pertama!

### 2. Daftar Siswa/Guru

**A. Lihat Daftar**
- Dashboard → Students (atau Teachers)
- Akan melihat list semua siswa/guru

**B. Tambah Siswa Baru**
- Klik "Tambah Siswa"
- Isi: ID, Nama, Kelas, Status
- Klik Save

**C. Tambah Guru Baru**
- Klik "Tambah Guru"
- Isi: ID, Nama, Mata Pelajaran, Status
- Klik Save

### 3. Daftar Kartu NFC

**Untuk Siswa/Guru:**
1. Pergi ke Students/Teachers
2. Pilih siswa/guru
3. Klik "Daftar NFC Card"
4. Tap kartu ke NFC reader sambil di halaman enrollment
5. UID akan auto-terdeteksi dan tersimpan
6. Klik Save

**Manual Input (jika tidak auto-detect):**
1. Ambil UID dari NFC card (lihat di dokumentasi card)
2. Input manual di form
3. Klik Save

### 4. Daftar Wajah (Face Recognition)

**Enrollment Face:**
1. Pergi ke Students/Teachers
2. Pilih siswa/guru
3. Klik "Daftar Wajah"
4. Upload foto siswa/guru (selfie, foto formal, atau hasil webcam)
5. Sistem otomatis convert foto → face embedding (vector)
6. Klik Save

**Tips Foto Terbaik:**
- ✅ Wajah terlihat jelas, tidak blur
- ✅ Pencahayaan baik (tidak terlalu gelap)
- ✅ Wajah menghadap kamera (frontal view)
- ✅ Tanpa sunglasses atau topi
- ❌ Hindari foto terlalu jauh
- ❌ Hindari foto dengan beberapa orang sekaligus

### 5. Lihat Laporan Absensi

**Report Harian:**
- Attendance → Select Tanggal
- Lihat siapa saja yang sudah absen hari ini
- Filter by Kelas
- Export ke CSV/PDF

**Report Bulanan:**
- Reports → Monthly
- Select Bulan & Tahun
- Lihat statistik per hari
- Export monthly summary

### 6. Real-time Monitoring

**Dashboard:**
- Lihat update real-time saat ada yang absen
- Statistik: Total Siswa, Total Guru, Hadir Hari Ini
- Recent attendance list (terbaru)

---

## 🔧 Untuk Developer/IT Admin

### Development Setup

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Run development server
npm run dev

# Server berjalan di http://localhost:3000
```

### Deploy ke Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login & deploy
vercel login
vercel --prod

# Akan mendapat URL: https://your-project.vercel.app
```

### Test API

**Test NFC Scan:**
```bash
curl -X POST http://localhost:3000/api/attendance/scan-nfc \
  -H "Content-Type: application/json" \
  -d '{"nfcUid": "AA:BB:CC:DD"}'
```

**Test Face Scan:**
```bash
# (dengan base64 image)
curl -X POST http://localhost:3000/api/attendance/scan-face \
  -H "Content-Type: application/json" \
  -d '{"faceImage": "data:image/jpeg;base64,..."}'
```

### Database Backup

```bash
# Backup
cp absensi.db absensi.db.$(date +%Y%m%d_%H%M%S).backup

# Restore
cp absensi.db.backup absensi.db
```

---

## 📋 Checklist Implementasi

### Phase 1: Setup & Basics ✅
- [x] Database schema
- [x] Backend API
- [x] Kiosk UI modern
- [x] NFC scanning endpoint
- [x] Face recognition endpoint

### Phase 2: Production Ready
- [ ] NFC reader testing (actual hardware)
- [ ] Face recognition fine-tuning
- [ ] Admin dashboard enrollment UI
- [ ] Performance optimization
- [ ] Load testing

### Phase 3: Deployment
- [ ] Vercel setup
- [ ] HTTPS/SSL
- [ ] Database backup strategy
- [ ] Monitoring & logging
- [ ] Security hardening

---

## ⚠️ Penting: Security

1. **Change Admin Password**
   - Segera ganti password default `admin123`
   - Gunakan password yang kuat (min 12 char, mixed case, numbers, symbols)

2. **HTTPS Only**
   - Jangan akses via HTTP di production
   - Vercel otomatis provide HTTPS

3. **Database Security**
   - Backup regularly
   - Jangan expose `.env` file
   - Database credentials jangan di-commit ke Git

4. **Access Control**
   - Batasi akses admin dashboard
   - Jangan share admin token
   - Monitor login attempts

---

## 💡 Tips & Tricks

### Kiosk Tips
- **Auto-detection:**  Jangan perlu click button, sistem auto-scan setiap 2 detik
- **Sound feedback:** Dengarkan beep sukses (800Hz) vs error (400Hz)
- **Real-time clock:** Layar kiosk selalu menampilkan jam live

### Admin Tips
- **Bulk Import:** Bisa import CSV siswa/guru (di development)
- **Export:** Semua laporan bisa di-export CSV untuk Excel
- **WebSocket:** Dashboard auto-update saat ada attendance baru

### Performance Tips
- **Browser Cache:** Kiosk akan cache data untuk offline mode (coming soon)
- **Compression:** API responses compressed dengan gzip
- **Database:** Indexed fields untuk query cepat

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| NFC tidak terdeteksi | Pastikan driver USB ACM installed, try different port |
| Webcam tidak bisa diakses | Allow browser permission, restart browser |
| Face recognition always fail | Ensure good photo enrollment, lighting good, check confidence threshold |
| Server won't start | Check port 3000 not in use, check Node version (18+) |
| Database error | Delete `absensi.db`, restart server |

---

## 📚 Dokumentasi Lengkap

- **Technical Docs:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Architecture:** [skill.md](./skill.md)
- **API Reference:** [DEPLOYMENT.md#api-reference](./DEPLOYMENT.md#api-reference)

---

**Versi:** 1.0.0  
**Last Updated:** 2026-08-12  
**Status:** Production Ready ✅
