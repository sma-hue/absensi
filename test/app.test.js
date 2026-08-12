const fs = require('node:fs');
const path = require('node:path');
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

const storePath = path.join(__dirname, '..', 'data', 'store.json');
const defaultState = {
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
  attendance: [],
  faceTemplates: [],
  nfcRegistrations: []
};

const resetStore = () => {
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(defaultState, null, 2));
};

beforeEach(() => {
  resetStore();
});

const request = async (path, init) => {
  const server = app.listen();
  try {
    const address = server.address();
    const base = `http://127.0.0.1:${address.port}`;
    const response = await fetch(`${base}${path}`, init);
    const body = await response.text();
    return { response, body: body ? JSON.parse(body) : null };
  } finally {
    server.close();
  }
};

const makeUniqueId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

test('health endpoint returns ok', async () => {
  const { response, body } = await request('/api/health');
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
});

test('users endpoint returns combined student and teacher records', async () => {
  const { response, body } = await request('/api/users');
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(body));
  assert.ok(body.some((item) => item.role === 'student'));
  assert.ok(body.some((item) => item.role === 'teacher'));
});

test('report endpoint returns daily summary counts', async () => {
  const { response, body } = await request('/api/report');
  assert.equal(response.status, 200);
  assert.ok(body.totalStudents >= 0);
  assert.ok(body.totalTeachers >= 0);
  assert.ok(body.totalAttendance >= 0);
});

test('monthly report endpoint returns aggregated data for a month', async () => {
  const { response, body } = await request('/api/report/monthly');
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(body.byDay));
  assert.ok(typeof body.totalAttendance === 'number');
});

test('classes endpoint returns list of classes', async () => {
  const { response, body } = await request('/api/classes');
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(body));
});

test('admin login accepts default credentials', async () => {
  const { response, body } = await request('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.user, 'admin');
  assert.ok(body.token);
});

test('student creation requires valid admin token', async () => {
  const studentId = makeUniqueId('S');
  const unauthorized = await request('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: studentId, name: 'Citra Wijaya', className: 'X-C', status: 'active' })
  });
  assert.equal(unauthorized.response.status, 401);

  const login = await request('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });

  const authorized = await request('/api/students', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${login.body.token}`
    },
    body: JSON.stringify({ id: studentId, name: 'Citra Wijaya', className: 'X-C', status: 'active' })
  });

  assert.equal(authorized.response.status, 201);
  assert.equal(authorized.body.name, 'Citra Wijaya');
});

test('can create a new student via admin endpoint', async () => {
  const studentId = makeUniqueId('S');
  const login = await request('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });

  const { response, body } = await request('/api/students', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${login.body.token}`
    },
    body: JSON.stringify({ id: studentId, name: 'Budi Santoso', className: 'X-B', status: 'active' })
  });
  assert.equal(response.status, 201);
  assert.equal(body.name, 'Budi Santoso');
});

test('can create a new teacher via admin endpoint', async () => {
  const teacherId = makeUniqueId('G');
  const login = await request('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });

  const { response, body } = await request('/api/teachers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${login.body.token}`
    },
    body: JSON.stringify({ id: teacherId, name: 'Ibu Sari', subject: 'IPA', status: 'active' })
  });
  assert.equal(response.status, 201);
  assert.equal(body.subject, 'IPA');
});

test('nfc registration endpoint stores the card UID for a student', async () => {
  const login = await request('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });

  const { response, body } = await request('/api/nfc/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${login.body.token}`
    },
    body: JSON.stringify({
      personId: 'S-101',
      role: 'student',
      uid: 'NFC-REGISTER-001'
    })
  });

  assert.equal(response.status, 200);
  assert.equal(body.person.id, 'S-101');
  assert.equal(body.person.nfcUid, 'NFC-REGISTER-001');
});

test('kiosk scan identifies a person by registered NFC UID', async () => {
  const login = await request('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });

  await request('/api/nfc/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${login.body.token}`
    },
    body: JSON.stringify({
      personId: 'G-202',
      role: 'teacher',
      uid: 'NFC-TEACHER-001'
    })
  });

  const { response, body } = await request('/api/kiosk/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'nfc',
      uid: 'NFC-TEACHER-001',
      name: 'Ibu Aulia'
    })
  });

  assert.equal(response.status, 200);
  assert.equal(body.status, 'success');
  assert.equal(body.person.name, 'Ibu Aulia');
});

test('kiosk status endpoint is available', async () => {
  const { response, body } = await request('/api/kiosk/status');
  assert.equal(response.status, 200);
  assert.equal(body.mode, 'idle');
});

test('kiosk summary endpoint returns live attendance totals', async () => {
  const { response, body } = await request('/api/kiosk/summary');
  assert.equal(response.status, 200);
  assert.equal(body.mode, 'idle');
  assert.ok(typeof body.totalToday === 'number');
  assert.ok(body.totalToday >= 0);
});

test('kiosk scan blocks duplicate attendance in the anti-spam window', async () => {
  const login = await request('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });

  await request('/api/nfc/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${login.body.token}`
    },
    body: JSON.stringify({
      personId: 'S-102',
      role: 'student',
      uid: 'NFC-ANTI-SPAM-001'
    })
  });

  const firstScan = await request('/api/kiosk/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'nfc',
      uid: 'NFC-ANTI-SPAM-001',
      name: 'Siti Aisyah'
    })
  });

  const secondScan = await request('/api/kiosk/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'nfc',
      uid: 'NFC-ANTI-SPAM-001',
      name: 'Siti Aisyah'
    })
  });

  assert.equal(firstScan.response.status, 200);
  assert.equal(secondScan.response.status, 429);
  assert.match(secondScan.body.message, /1 menit|interval|scan/i);
});

test('kiosk scan endpoint accepts NFC and face payload', async () => {
  const payload = {
    type: 'nfc',
    uid: 'NFC-001',
    name: 'Ahmad Fauzi'
  };

  const { response, body } = await request('/api/kiosk/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(response.status, 200);
  assert.equal(body.status, 'success');
  assert.equal(body.person.name, 'Ahmad Fauzi');
});
