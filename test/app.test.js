const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

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
