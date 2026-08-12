const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
});
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

const defaultData = {
  students: [
    { id: 'S-101', name: 'Ahmad Fauzi', className: 'X-A', status: 'active' },
    { id: 'S-102', name: 'Siti Aisyah', className: 'X-A', status: 'active' },
    { id: 'S-103', name: 'Rizki Pratama', className: 'XI-B', status: 'active' },
    { id: 'S-104', name: 'Nadia Putri', className: 'XI-B', status: 'active' },
    { id: 'S-105', name: 'Iqbal Hidayat', className: 'XII-C', status: 'active' }
  ],
  teachers: [
    { id: 'G-201', name: 'Ustadz Rahmat', subject: 'Pendidikan Agama', status: 'active' },
    { id: 'G-202', name: 'Ibu Aulia', subject: 'Bahasa Indonesia', status: 'active' },
    { id: 'G-203', name: 'Ustadz Fikri', subject: 'Matematika', status: 'active' }
  ],
  classes: [
    { id: 'X-A', name: 'Kelas X-A', level: 'X', mentor: 'Ustadz Rahmat' },
    { id: 'XI-B', name: 'Kelas XI-B', level: 'XI', mentor: 'Ibu Aulia' },
    { id: 'XII-C', name: 'Kelas XII-C', level: 'XII', mentor: 'Ustadz Fikri' }
  ],
  admins: [
    { username: 'admin', password: 'admin123', role: 'superadmin' }
  ],
  attendance: []
};

function ensureDataFile() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
  }
}

function readData() {
  ensureDataFile();

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);

    return {
      students: Array.isArray(data.students) ? data.students : defaultData.students,
      teachers: Array.isArray(data.teachers) ? data.teachers : defaultData.teachers,
      classes: Array.isArray(data.classes) ? data.classes : defaultData.classes,
      admins: Array.isArray(data.admins) ? data.admins : defaultData.admins,
      attendance: Array.isArray(data.attendance) ? data.attendance : []
    };
  } catch (error) {
    return { ...defaultData };
  }
}

function writeData(data) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function buildDashboard(data) {
  const today = new Date().toISOString().slice(0, 10);
  const todayLogs = data.attendance.filter((entry) => entry.date === today);

  return {
    totalStudents: data.students.length,
    totalTeachers: data.teachers.length,
    totalAttendanceToday: todayLogs.length,
    studentPresent: todayLogs.filter((entry) => entry.role === 'student' && entry.status === 'present').length,
    teacherPresent: todayLogs.filter((entry) => entry.role === 'teacher' && entry.status === 'present').length,
    recentAttendance: [...todayLogs].slice(-8).reverse()
  };
}

function buildUserList(data) {
  const students = data.students.map((student) => ({
    id: student.id,
    name: student.name,
    role: 'student',
    className: student.className,
    status: student.status
  }));

  const teachers = data.teachers.map((teacher) => ({
    id: teacher.id,
    name: teacher.name,
    role: 'teacher',
    subject: teacher.subject,
    status: teacher.status
  }));

  return [...students, ...teachers];
}

function buildReport(data, date = new Date().toISOString().slice(0, 10), classFilter = 'all') {
  const logs = data.attendance.filter((entry) => entry.date === date);
  const filteredLogs = classFilter !== 'all'
    ? logs.filter((entry) => {
        const person = data.students.find((student) => student.id === entry.personId)
          || data.teachers.find((teacher) => teacher.id === entry.personId);
        return person && person.className === classFilter;
      })
    : logs;

  return {
    date,
    classFilter,
    totalStudents: data.students.length,
    totalTeachers: data.teachers.length,
    totalAttendance: filteredLogs.length,
    present: filteredLogs.filter((entry) => entry.status === 'present').length,
    late: filteredLogs.filter((entry) => entry.status === 'late').length,
    absent: filteredLogs.filter((entry) => entry.status === 'absent').length,
    studentsPresent: filteredLogs.filter((entry) => entry.role === 'student' && entry.status === 'present').length,
    teachersPresent: filteredLogs.filter((entry) => entry.role === 'teacher' && entry.status === 'present').length,
    recent: filteredLogs.slice(-10).reverse()
  };
}

function buildClassList(data) {
  return Array.isArray(data.classes) ? data.classes : defaultData.classes;
}

function generateAdminToken(username) {
  return crypto.createHash('sha256').update(`${username}:${Date.now()}:${Math.random()}`).digest('hex');
}

function requireAdminToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    return res.status(401).json({ message: 'Token admin tidak valid atau belum login' });
  }

  const data = readData();
  const admin = data.admins.find((item) => item.token === token);

  if (!admin) {
    return res.status(401).json({ message: 'Token admin tidak valid' });
  }

  req.admin = admin;
  return next();
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/attendance', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'attendance.html'));
});

app.get('/students', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'students.html'));
});

app.get('/teachers', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'teachers.html'));
});

app.get('/reports', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reports.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Server absensi aktif', timestamp: new Date().toISOString() });
});

app.get('/api/students', (req, res) => {
  const data = readData();
  res.json(data.students);
});

app.get('/api/teachers', (req, res) => {
  const data = readData();
  res.json(data.teachers);
});

app.get('/api/users', (req, res) => {
  const data = readData();
  res.json(buildUserList(data));
});

app.get('/api/dashboard', (req, res) => {
  const data = readData();
  res.json(buildDashboard(data));
});

app.get('/api/report', (req, res) => {
  const data = readData();
  const { date, class: className } = req.query;
  res.json(buildReport(data, date || new Date().toISOString().slice(0, 10), className || 'all'));
});

app.get('/api/report/monthly', (req, res) => {
  const data = readData();
  const { month, class: className } = req.query;
  const targetDate = month ? new Date(`${month}-01T00:00:00`) : new Date();
  const year = targetDate.getFullYear();
  const monthIndex = targetDate.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const monthEntries = data.attendance.filter((entry) => {
    const d = new Date(entry.date);
    if (Number.isNaN(d.getTime())) return false;
    if (d.getFullYear() !== year || d.getMonth() !== monthIndex) return false;
    if (className && className !== 'all') {
      const person = data.students.find((student) => student.id === entry.personId)
        || data.teachers.find((teacher) => teacher.id === entry.personId);
      return person && person.className === className;
    }
    return true;
  });

  const byDay = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const dayKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const entries = monthEntries.filter((entry) => entry.date === dayKey);
    return {
      day,
      date: dayKey,
      total: entries.length,
      present: entries.filter((entry) => entry.status === 'present').length,
      late: entries.filter((entry) => entry.status === 'late').length,
      absent: entries.filter((entry) => entry.status === 'absent').length
    };
  });

  res.json({
    month: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
    classFilter: className || 'all',
    totalAttendance: monthEntries.length,
    byDay,
    summary: {
      present: monthEntries.filter((entry) => entry.status === 'present').length,
      late: monthEntries.filter((entry) => entry.status === 'late').length,
      absent: monthEntries.filter((entry) => entry.status === 'absent').length
    }
  });
});

app.get('/api/classes', (req, res) => {
  const data = readData();
  res.json(buildClassList(data));
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ ok: false, message: 'Username dan password wajib diisi' });
  }

  const data = readData();
  const admin = data.admins.find(
    (item) => item.username === username && item.password === password
  );

  if (!admin) {
    return res.status(401).json({ ok: false, message: 'Username atau password salah' });
  }

  const token = generateAdminToken(admin.username);
  admin.token = token;
  writeData(data);

  return res.json({ ok: true, user: admin.username, role: admin.role, token });
});

app.get('/api/attendance', (req, res) => {
  const { date } = req.query;
  const data = readData();

  const entries = date
    ? data.attendance.filter((entry) => entry.date === date)
    : data.attendance;

  res.json(entries.slice().reverse());
});

app.get('/api/kiosk/status', (req, res) => {
  res.json({
    mode: 'idle',
    message: 'Silakan tap NFC atau hadap kamera',
    lastUpdated: new Date().toISOString()
  });
});

app.get('/api/kiosk/summary', (req, res) => {
  const data = readData();
  const today = new Date().toISOString().slice(0, 10);
  const todayEntries = data.attendance.filter((entry) => entry.date === today);
  const lastScan = todayEntries.slice(-1)[0] || null;

  res.json({
    ok: true,
    mode: 'idle',
    message: 'Silakan tap NFC atau hadap kamera',
    totalToday: todayEntries.length,
    lastScan,
    lastUpdated: new Date().toISOString()
  });
});

app.post('/api/kiosk/scan', (req, res) => {
  const { type, uid, name, imageData } = req.body || {};

  if (!type || !uid && !imageData) {
    return res.status(400).json({ status: 'error', message: 'Payload scan tidak valid' });
  }

  const data = readData();
  const person = data.students.find((student) => student.id === uid || student.name === name)
    || data.teachers.find((teacher) => teacher.id === uid || teacher.name === name);

  if (!person) {
    return res.status(404).json({ status: 'error', message: 'Data tidak terdaftar di sistem' });
  }

  const now = new Date();
  const record = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    personId: person.id,
    name: person.name,
    role: person.className ? 'student' : 'teacher',
    status: 'present',
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
    timestamp: now.toISOString(),
    source: type
  };

  data.attendance.push(record);
  writeData(data);
  io.emit('attendance:update', { record, date: record.date, time: record.time });

  return res.json({
    status: 'success',
    mode: 'idle',
    person: { id: person.id, name: person.name, role: person.className ? 'student' : 'teacher' },
    attendance: record
  });
});

app.get('/kiosk', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'kiosk.html'));
});

app.post('/api/students', requireAdminToken, (req, res) => {
  const { id, name, className, status = 'active' } = req.body;

  if (!id || !name || !className) {
    return res.status(400).json({ message: 'ID, nama, dan kelas wajib diisi' });
  }

  const data = readData();
  const exists = data.students.some((student) => student.id === id);

  if (exists) {
    return res.status(409).json({ message: 'ID siswa sudah terdaftar' });
  }

  const student = { id, name, className, status };
  data.students.push(student);
  writeData(data);

  return res.status(201).json(student);
});

app.post('/api/teachers', requireAdminToken, (req, res) => {
  const { id, name, subject, status = 'active' } = req.body;

  if (!id || !name || !subject) {
    return res.status(400).json({ message: 'ID, nama, dan mata pelajaran wajib diisi' });
  }

  const data = readData();
  const exists = data.teachers.some((teacher) => teacher.id === id);

  if (exists) {
    return res.status(409).json({ message: 'ID guru sudah terdaftar' });
  }

  const teacher = { id, name, subject, status };
  data.teachers.push(teacher);
  writeData(data);

  return res.status(201).json(teacher);
});

app.put('/api/students/:id', requireAdminToken, (req, res) => {
  const { name, className, status } = req.body;
  if (!name || !className) {
    return res.status(400).json({ message: 'Nama dan kelas wajib diisi' });
  }

  const data = readData();
  const studentIndex = data.students.findIndex((student) => student.id === req.params.id);

  if (studentIndex === -1) {
    return res.status(404).json({ message: 'Siswa tidak ditemukan' });
  }

  data.students[studentIndex] = {
    ...data.students[studentIndex],
    name,
    className,
    status: status || data.students[studentIndex].status
  };

  writeData(data);
  return res.json(data.students[studentIndex]);
});

app.delete('/api/students/:id', requireAdminToken, (req, res) => {
  const data = readData();
  const studentIndex = data.students.findIndex((student) => student.id === req.params.id);

  if (studentIndex === -1) {
    return res.status(404).json({ message: 'Siswa tidak ditemukan' });
  }

  const [deleted] = data.students.splice(studentIndex, 1);
  writeData(data);
  return res.json({ ok: true, deleted });
});

app.put('/api/teachers/:id', requireAdminToken, (req, res) => {
  const { name, subject, status } = req.body;
  if (!name || !subject) {
    return res.status(400).json({ message: 'Nama dan mata pelajaran wajib diisi' });
  }

  const data = readData();
  const teacherIndex = data.teachers.findIndex((teacher) => teacher.id === req.params.id);

  if (teacherIndex === -1) {
    return res.status(404).json({ message: 'Guru tidak ditemukan' });
  }

  data.teachers[teacherIndex] = {
    ...data.teachers[teacherIndex],
    name,
    subject,
    status: status || data.teachers[teacherIndex].status
  };

  writeData(data);
  return res.json(data.teachers[teacherIndex]);
});

app.delete('/api/teachers/:id', requireAdminToken, (req, res) => {
  const data = readData();
  const teacherIndex = data.teachers.findIndex((teacher) => teacher.id === req.params.id);

  if (teacherIndex === -1) {
    return res.status(404).json({ message: 'Guru tidak ditemukan' });
  }

  const [deleted] = data.teachers.splice(teacherIndex, 1);
  writeData(data);
  return res.json({ ok: true, deleted });
});

app.post('/api/attendance', (req, res) => {
  const { role, personId, name, status = 'present' } = req.body;

  if (!role || !personId || !name) {
    return res.status(400).json({ message: 'Role, ID, dan nama wajib diisi' });
  }

  const data = readData();
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5);

  const lastEntry = [...data.attendance]
    .filter((entry) => entry.personId === personId && entry.role === role)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

  if (lastEntry && now.getTime() - new Date(lastEntry.timestamp).getTime() < 60000) {
    return res.status(429).json({ message: 'Absensi sudah dicatat dalam 1 menit terakhir' });
  }

  const record = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    personId,
    name,
    role,
    status,
    date,
    time,
    timestamp: now.toISOString()
  };

  data.attendance.push(record);
  writeData(data);
  io.emit('attendance:update', { record, date, time });

  return res.status(201).json(record);
});

io.on('connection', (socket) => {
  socket.emit('system:ready', {
    ok: true,
    message: 'Koneksi ke absensi real-time aktif'
  });
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'Endpoint API tidak ditemukan' });
  }

  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  httpServer.listen(PORT, () => {
    console.log(`Server absensi berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
