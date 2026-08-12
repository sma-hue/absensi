# Absensi Sypesantren Jagat Ar

Aplikasi absensi sederhana untuk mencatat kehadiran siswa dan guru di lingkungan Sypesantren Jagat Ar.

## Fitur
- Dashboard ringkas untuk melihat jumlah siswa, guru, dan kehadiran hari ini
- Input manual kehadiran siswa dan guru
- Data siswa dan guru yang tersimpan lokal dalam file JSON
- Riwayat absensi per hari
- Desain web responsif untuk desktop dan tablet

## Teknologi
- Node.js
- Express.js
- HTML + CSS + JavaScript

## Cara Menjalankan
1. Masuk ke folder proyek
2. Jalankan perintah:
   npm install
   npm start
3. Buka browser ke:
   http://localhost:3000

## Struktur Proyek
- server.js: backend API dan server
- public/: file antarmuka web
- data/store.json: penyimpanan data absensi lokal

## Catatan
Aplikasi ini merupakan versi awal dan bisa dikembangkan lebih lanjut menjadi absensi berbasis NFC, face recognition, login admin, serta database PostgreSQL/MySQL.
