const socket = io();
const page = document.body.dataset.page || 'dashboard';

const statsCards = document.getElementById('statsCards');
const attendanceList = document.getElementById('attendanceList');
const studentsTable = document.getElementById('studentsTable');
const teachersTable = document.getElementById('teachersTable');
const currentDate = document.getElementById('currentDate');
const attendanceForm = document.getElementById('attendanceForm');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminStatus = document.getElementById('adminStatus');
const reportSummary = document.getElementById('reportSummary');
const classesList = document.getElementById('classesList');
const studentForm = document.getElementById('studentForm');
const teacherForm = document.getElementById('teacherForm');
const reportDateInput = document.getElementById('reportDate');
const classFilterSelect = document.getElementById('classFilter');
const monthlyMonthInput = document.getElementById('monthlyMonth');
const monthlyClassFilterSelect = document.getElementById('monthlyClassFilter');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const exportMonthlyCsvBtn = document.getElementById('exportMonthlyCsvBtn');
const studentSearchInput = document.getElementById('studentSearch');
const teacherSearchInput = document.getElementById('teacherSearch');
const nfcRegisterForm = document.getElementById('nfcRegisterForm');
const nfcUidInput = document.getElementById('nfcUidInput');
const nfcStudentSelect = document.getElementById('nfcStudentSelect');
const nfcTeacherSelect = document.getElementById('nfcTeacherSelect');
const faceEnrollForm = document.getElementById('faceEnrollForm');
const faceStudentSelect = document.getElementById('faceStudentSelect');
const faceTeacherSelect = document.getElementById('faceTeacherSelect');
const faceImageInput = document.getElementById('faceImageInput');

function renderDate() {
  if (!currentDate) return;
  currentDate.textContent = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date());
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Terjadi kesalahan' }));
    throw new Error(error.message || 'Request gagal');
  }
  return response.json();
}

function getAdminToken() {
  return localStorage.getItem('absensi_admin_token') || '';
}

function buildAuthHeaders(extra = {}) {
  const token = getAdminToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

function renderStats(data) {
  if (!statsCards) return;
  const stats = [
    { label: 'Total Siswa', value: data.totalStudents },
    { label: 'Total Guru', value: data.totalTeachers },
    { label: 'Hadir Hari Ini', value: data.totalAttendanceToday },
    { label: 'Siswa Hadir', value: data.studentPresent },
    { label: 'Guru Hadir', value: data.teacherPresent }
  ];

  statsCards.innerHTML = stats.map((stat) => `
    <div class="stat-box">
      <span class="label">${stat.label}</span>
      <div class="value">${stat.value}</div>
    </div>
  `).join('');
}

function renderAttendance(entries) {
  if (!attendanceList) return;
  if (!entries.length) {
    attendanceList.innerHTML = '<p>Belum ada catatan kehadiran hari ini.</p>';
    return;
  }

  attendanceList.innerHTML = entries.map((entry) => `
    <div class="row-item">
      <div>
        <strong>${entry.name}</strong>
        <small>${entry.role === 'student' ? 'Siswa' : 'Guru'} • ${entry.time}</small>
      </div>
      <span class="badge ${entry.status}">${entry.status === 'present' ? 'Hadir' : entry.status === 'late' ? 'Terlambat' : 'Tidak Hadir'}</span>
    </div>
  `).join('');
}

function renderRows(rows, lookup, role) {
  return rows.map((item) => `
    <tr>
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>${item[lookup]}</td>
      <td>
        <button class="mini-btn" data-role="${role}" data-id="${item.id}" data-action="edit">Edit</button>
        <button class="mini-btn danger" data-role="${role}" data-id="${item.id}" data-action="delete">Hapus</button>
      </td>
    </tr>
  `).join('');
}

function renderClasses(classItems) {
  if (!classesList) return;
  classesList.innerHTML = classItems.map((item) => `
    <div class="class-item">
      <strong>${item.name}</strong>
      <small>Level ${item.level} • ${item.mentor}</small>
    </div>
  `).join('');
}

function renderReport(report) {
  if (!reportSummary || !report) return;
  reportSummary.innerHTML = `
    <div class="mini-box">
      <span>Hadir</span>
      <strong>${report.present}</strong>
    </div>
    <div class="mini-box">
      <span>Terlambat</span>
      <strong>${report.late}</strong>
    </div>
    <div class="mini-box">
      <span>Alpha</span>
      <strong>${report.absent}</strong>
    </div>
  `;
}

function populateClassFilter(classes) {
  if (!classes || !Array.isArray(classes)) return;
  const html = '<option value="all">Semua</option>' + classes.map((item) => `<option value="${item.id}">${item.name}</option>`).join('');
  if (classFilterSelect) classFilterSelect.innerHTML = html;
  if (monthlyClassFilterSelect) monthlyClassFilterSelect.innerHTML = html;
}

function populateSelection(selectElement, items, { placeholder = 'Pilih data', valueKey = 'id', labelKey = 'name', role = 'student' } = {}) {
  if (!selectElement) return;

  selectElement.innerHTML = `<option value="">${placeholder}</option>` + items.map((item) => `<option value="${item[valueKey]}">${item[labelKey]} (${item[valueKey]})</option>`).join('');

  if (selectElement.dataset.defaultValue) {
    selectElement.value = selectElement.dataset.defaultValue;
  }

  if (role === 'student' && !items.length) {
    selectElement.innerHTML = '<option value="">Belum ada siswa</option>';
  }

  if (role === 'teacher' && !items.length) {
    selectElement.innerHTML = '<option value="">Belum ada guru</option>';
  }
}

function renderMonthlySummary(data) {
  const container = document.getElementById('monthlySummary');
  if (!container) return;
  if (!data || !Array.isArray(data.byDay)) {
    container.innerHTML = '<p>Belum ada data bulanan.</p>';
    return;
  }

  container.innerHTML = `
    <div class="mini-box">
      <span>Total Kehadiran</span>
      <strong>${data.totalAttendance}</strong>
    </div>
    <div class="mini-box">
      <span>Hadir</span>
      <strong>${data.summary.present}</strong>
    </div>
    <div class="mini-box">
      <span>Terlambat</span>
      <strong>${data.summary.late}</strong>
    </div>
  `;
}

async function loadDashboardPage() {
  const [dashboard, students, teachers, attendance, classes, report] = await Promise.all([
    fetchJson('/api/dashboard'),
    fetchJson('/api/students'),
    fetchJson('/api/teachers'),
    fetchJson('/api/attendance?date=' + (reportDateInput ? (reportDateInput.value || new Date().toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10))),
    fetchJson('/api/classes'),
    fetchJson('/api/report?date=' + (reportDateInput ? (reportDateInput.value || new Date().toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10)))
  ]);

  renderStats(dashboard);
  renderAttendance(attendance);
  renderClasses(classes);
  renderReport(report);
  populateClassFilter(classes);
  if (studentsTable) studentsTable.innerHTML = renderRows(students, 'className', 'student');
  if (teachersTable) teachersTable.innerHTML = renderRows(teachers, 'subject', 'teacher');

  if (document.getElementById('monthlySummary')) {
    const monthValue = monthlyMonthInput ? (monthlyMonthInput.value || new Date().toISOString().slice(0, 7)) : new Date().toISOString().slice(0, 7);
    const selectedClass = monthlyClassFilterSelect ? monthlyClassFilterSelect.value : 'all';
    const monthReport = await fetchJson(`/api/report/monthly?month=${monthValue}${selectedClass !== 'all' ? `&class=${selectedClass}` : ''}`);
    renderMonthlySummary(monthReport);
  }
}

async function loadAttendancePage() {
  const date = new Date().toISOString().slice(0, 10);
  const attendance = await fetchJson('/api/attendance?date=' + date);
  renderAttendance(attendance);
}

function applyUsersSearch(rows, query, fields) {
  const value = (query || '').trim().toLowerCase();
  if (!value) return rows;
  return rows.filter((item) => fields.some((field) => String(item[field] || '').toLowerCase().includes(value)));
}

async function loadStudentsPage() {
  const [students, classes] = await Promise.all([
    fetchJson('/api/students'),
    fetchJson('/api/classes')
  ]);

  const filteredStudents = applyUsersSearch(students, studentSearchInput ? studentSearchInput.value : '', ['id', 'name', 'className']);
  if (studentsTable) studentsTable.innerHTML = renderRows(filteredStudents, 'className', 'student');
  if (classesList) renderClasses(classes);
  if (nfcStudentSelect) populateSelection(nfcStudentSelect, students, { placeholder: 'Pilih siswa', role: 'student' });
  if (faceStudentSelect) populateSelection(faceStudentSelect, students, { placeholder: 'Pilih siswa', role: 'student' });
}

async function loadTeachersPage() {
  const teachers = await fetchJson('/api/teachers');
  const filteredTeachers = applyUsersSearch(teachers, teacherSearchInput ? teacherSearchInput.value : '', ['id', 'name', 'subject']);
  if (teachersTable) teachersTable.innerHTML = renderRows(filteredTeachers, 'subject', 'teacher');
  if (nfcTeacherSelect) populateSelection(nfcTeacherSelect, teachers, { placeholder: 'Pilih guru', role: 'teacher' });
  if (faceTeacherSelect) populateSelection(faceTeacherSelect, teachers, { placeholder: 'Pilih guru', role: 'teacher' });
}

async function loadReportsPage() {
  const [classes, report] = await Promise.all([
    fetchJson('/api/classes'),
    fetchJson('/api/report?date=' + new Date().toISOString().slice(0, 10))
  ]);

  populateClassFilter(classes);
  renderReport(report);
  const monthValue = new Date().toISOString().slice(0, 7);
  const monthReport = await fetchJson(`/api/report/monthly?month=${monthValue}`);
  renderMonthlySummary(monthReport);
}

async function loadPageData() {
  if (page === 'dashboard') return loadDashboardPage();
  if (page === 'attendance') return loadAttendancePage();
  if (page === 'students') return loadStudentsPage();
  if (page === 'teachers') return loadTeachersPage();
  if (page === 'reports') return loadReportsPage();
  return loadDashboardPage();
}

if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const result = await fetchJson('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: document.getElementById('adminUsername').value,
          password: document.getElementById('adminPassword').value
        })
      });
      localStorage.setItem('absensi_admin_token', result.token || '');
      adminStatus.textContent = `Login berhasil: ${result.user} (${result.role})`;
      adminStatus.classList.add('success');
    } catch (error) {
      localStorage.removeItem('absensi_admin_token');
      adminStatus.textContent = error.message;
      adminStatus.classList.remove('success');
    }
  });
}

if (studentForm) {
  studentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      id: document.getElementById('studentId').value.trim(),
      name: document.getElementById('studentName').value.trim(),
      className: document.getElementById('studentClass').value.trim(),
      status: 'active'
    };

    try {
      await fetchJson('/api/students', {
        method: 'POST',
        headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      });
      studentForm.reset();
      await loadPageData();
    } catch (error) {
      alert(error.message);
    }
  });
}

if (teacherForm) {
  teacherForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      id: document.getElementById('teacherId').value.trim(),
      name: document.getElementById('teacherName').value.trim(),
      subject: document.getElementById('teacherSubject').value.trim(),
      status: 'active'
    };

    try {
      await fetchJson('/api/teachers', {
        method: 'POST',
        headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      });
      teacherForm.reset();
      await loadPageData();
    } catch (error) {
      alert(error.message);
    }
  });
}

if (attendanceForm) {
  attendanceForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      role: document.getElementById('role').value,
      personId: document.getElementById('personId').value.trim(),
      name: document.getElementById('personName').value.trim(),
      status: document.getElementById('status').value
    };

    try {
      await fetchJson('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      attendanceForm.reset();
      await loadPageData();
    } catch (error) {
      alert(error.message);
    }
  });
}

async function readImageData(file) {
  if (!file) throw new Error('Pilih file foto wajah terlebih dahulu');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Gagal membaca file foto'));
    reader.readAsDataURL(file);
  });
}

if (nfcRegisterForm) {
  nfcRegisterForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const personId = (nfcStudentSelect ? nfcStudentSelect.value : nfcTeacherSelect?.value) || '';
    const uid = nfcUidInput ? nfcUidInput.value.trim() : '';
    const role = nfcStudentSelect ? 'student' : 'teacher';

    if (!personId || !uid) {
      alert('Pilih data dan isi UID kartu NFC');
      return;
    }

    try {
      await fetchJson('/api/admin/enroll-nfc', {
        method: 'POST',
        headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ personId, role, nfcUid: uid })
      });
      if (nfcUidInput) nfcUidInput.value = '';
      alert('UID kartu NFC berhasil tersimpan');
    } catch (error) {
      alert(error.message);
    }
  });
}

if (faceEnrollForm) {
  faceEnrollForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const personId = (faceStudentSelect ? faceStudentSelect.value : faceTeacherSelect?.value) || '';
    const file = faceImageInput ? faceImageInput.files[0] : null;
    const role = faceStudentSelect ? 'student' : 'teacher';

    if (!personId || !file) {
      alert('Pilih siswa/guru dan foto wajah terlebih dahulu');
      return;
    }

    try {
      const faceImage = await readImageData(file);

      await fetchJson('/api/admin/enroll-face', {
        method: 'POST',
        headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          personId,
          role,
          faceImage
        })
      });

      if (faceImageInput) faceImageInput.value = '';
      alert('Data wajah berhasil di-enroll');
    } catch (error) {
      alert(error.message);
    }
  });
}

if (reportDateInput) {
  reportDateInput.addEventListener('change', async () => {
    const selectedDate = reportDateInput.value || new Date().toISOString().slice(0, 10);
    const selectedClass = classFilterSelect ? classFilterSelect.value : 'all';
    const report = await fetchJson(`/api/report?date=${selectedDate}${selectedClass !== 'all' ? `&class=${selectedClass}` : ''}`);
    renderReport(report);
  });
}

if (classFilterSelect) {
  classFilterSelect.addEventListener('change', async () => {
    const selectedDate = reportDateInput.value || new Date().toISOString().slice(0, 10);
    const selectedClass = classFilterSelect.value;
    const report = await fetchJson(`/api/report?date=${selectedDate}${selectedClass !== 'all' ? `&class=${selectedClass}` : ''}`);
    renderReport(report);
  });
}

if (monthlyMonthInput) {
  monthlyMonthInput.addEventListener('change', async () => {
    const monthValue = monthlyMonthInput.value || new Date().toISOString().slice(0, 7);
    const selectedClass = monthlyClassFilterSelect ? monthlyClassFilterSelect.value : 'all';
    const report = await fetchJson(`/api/report/monthly?month=${monthValue}${selectedClass !== 'all' ? `&class=${selectedClass}` : ''}`);
    renderMonthlySummary(report);
  });
}

if (monthlyClassFilterSelect) {
  monthlyClassFilterSelect.addEventListener('change', async () => {
    const monthValue = monthlyMonthInput.value || new Date().toISOString().slice(0, 7);
    const selectedClass = monthlyClassFilterSelect.value;
    const report = await fetchJson(`/api/report/monthly?month=${monthValue}${selectedClass !== 'all' ? `&class=${selectedClass}` : ''}`);
    renderMonthlySummary(report);
  });
}

if (studentSearchInput) {
  studentSearchInput.addEventListener('input', async () => {
    if (page === 'students') {
      await loadStudentsPage();
    }
  });
}

if (teacherSearchInput) {
  teacherSearchInput.addEventListener('input', async () => {
    if (page === 'teachers') {
      await loadTeachersPage();
    }
  });
}

if (exportCsvBtn) {
  exportCsvBtn.addEventListener('click', async () => {
    const selectedDate = reportDateInput.value || new Date().toISOString().slice(0, 10);
    const selectedClass = classFilterSelect.value;
    const report = await fetchJson(`/api/report?date=${selectedDate}${selectedClass !== 'all' ? `&class=${selectedClass}` : ''}`);
    const rows = [['tanggal', 'role', 'id', 'nama', 'status'], ...report.recent.map((entry) => [entry.date, entry.role, entry.personId, entry.name, entry.status])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `absensi-${selectedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}

if (exportMonthlyCsvBtn) {
  exportMonthlyCsvBtn.addEventListener('click', async () => {
    const monthValue = monthlyMonthInput.value || new Date().toISOString().slice(0, 7);
    const selectedClass = monthlyClassFilterSelect.value;
    const report = await fetchJson(`/api/report/monthly?month=${monthValue}${selectedClass !== 'all' ? `&class=${selectedClass}` : ''}`);
    const rows = [['tanggal', 'total', 'hadir', 'terlambat', 'alpha'], ...report.byDay.map((entry) => [entry.date, entry.total, entry.present, entry.late, entry.absent])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `absensi-bulan-${monthValue}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}

document.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const { role, id, action } = button.dataset;
  if (!role || !id || !action) return;

  if (action === 'delete') {
    const endpoint = role === 'student' ? `/api/students/${id}` : `/api/teachers/${id}`;
    try {
      await fetchJson(endpoint, { method: 'DELETE', headers: buildAuthHeaders() });
      await loadPageData();
    } catch (error) {
      alert(error.message);
    }
    return;
  }

  const item = role === 'student' ? await fetchJson('/api/students') : await fetchJson('/api/teachers');
  const selected = item.find((entry) => entry.id === id);
  if (!selected) return;

  const newName = prompt('Masukkan nama baru', selected.name);
  if (newName === null) return;

  const newValue = role === 'student'
    ? prompt('Masukkan kelas baru', selected.className || '')
    : prompt('Masukkan mata pelajaran baru', selected.subject || '');
  if (newValue === null) return;

  const payload = role === 'student'
    ? { name: newName, className: newValue }
    : { name: newName, subject: newValue };

  try {
    await fetchJson(`${role === 'student' ? `/api/students/${id}` : `/api/teachers/${id}`}`, {
      method: 'PUT',
      headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    await loadPageData();
  } catch (error) {
    alert(error.message);
  }
});

if (typeof socket !== 'undefined' && socket) {
  socket.on('attendance:update', () => {
    loadPageData();
  });
}

renderDate();
loadPageData();
setInterval(renderDate, 60000);
