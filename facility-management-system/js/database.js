/******************************
 * LocalStorage backend & helpers
 ******************************/
const LS_KEYS = {
  users: 'kt_users_v4',
  current: 'kt_current_v4',
  rooms: 'kt_rooms_v4',
  assets: 'kt_assets_v4',
  inventory: 'kt_inventory_v4',
  requests: 'kt_requests_v4',
  logs: 'kt_logs_v4'
};

// Utility functions
const el = id => document.getElementById(id);
const nowIso = () => new Date().toISOString();
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = (k, def = []) => {
  try {
    const t = localStorage.getItem(k);
    return t ? JSON.parse(t) : def;
  } catch (e) {
    return def;
  }
};

const uid = (p = 'X') => p + Date.now().toString().slice(-6) + Math.floor(Math.random() * 900 + 100);

// Seed minimal data (if empty)
(function seed() {
  if (!localStorage.getItem(LS_KEYS.users)) {
    const users = [
      { id: uid('U'), email: 'admin@local', password: 'admin123', displayName: 'BGH Admin', role: 'admin', username: 'admin', assignedRooms: [] },
      { id: uid('U'), email: 'tech@local', password: 'tech123', displayName: 'NV Kỹ thuật', role: 'technician', username: 'tech', assignedRooms: [] },
      { id: uid('U'), email: 'teacher1@local', password: 'teach123', displayName: 'GV Nguyễn', role: 'teacher', username: 'gvnguyen', assignedRooms: ['R101'] }
    ];
    save(LS_KEYS.users, users);
  }
  
  if (!localStorage.getItem(LS_KEYS.rooms)) {
    save(LS_KEYS.rooms, [
      { id: 'R101', name: 'Lớp 10A', capacity: 35, notes: 'Dãy A' },
      { id: 'R102', name: 'Lớp 10B', capacity: 32, notes: 'Dãy B' }
    ]);
  }
  
  if (!localStorage.getItem(LS_KEYS.assets)) {
    save(LS_KEYS.assets, [
      { id: 'AS-001', name: 'Máy chiếu', category: 'Thiết bị', room: 'R101', status: 'normal', purchased: '2020-09-01', price: 4500000, vendor: 'Công ty A', warranty: 24, desc: 'Máy chiếu lớp 10A', image: '', updatedAt: nowIso() }
    ]);
  }
  
  if (!localStorage.getItem(LS_KEYS.inventory)) {
    save(LS_KEYS.inventory, [
      { id: 'INV-001', name: 'Bóng đèn dự phòng', category: 'Vật tư', qty: 20, unit: 'cái', price: 20000, vendor: 'Công ty B', importDate: '2025-01-01', notes: 'Kho chính', updatedAt: nowIso() }
    ]);
  }
  
  if (!localStorage.getItem(LS_KEYS.requests)) {
    save(LS_KEYS.requests, []);
  }
  
  if (!localStorage.getItem(LS_KEYS.logs)) {
    save(LS_KEYS.logs, []);
  }
})();

// Log action helper
function logAction(action, desc) {
  const logs = load(LS_KEYS.logs, []);
  logs.push({
    ts: nowIso(),
    user: currentUser ? currentUser.username : 'anonymous',
    action,
    desc
  });
  save(LS_KEYS.logs, logs);
}

// Data access functions
function loadRooms() { return load(LS_KEYS.rooms, []); }
function saveRooms(v) { save(LS_KEYS.rooms, v); }

function loadAssets() { return load(LS_KEYS.assets, []); }
function saveAssets(v) { save(LS_KEYS.assets, v); }

function loadInv() { return load(LS_KEYS.inventory, []); }
function saveInv(v) { save(LS_KEYS.inventory, v); }

function loadReqs() { return load(LS_KEYS.requests, []); }
function saveReqs(v) { save(LS_KEYS.requests, v); }

function loadUsers() { return load(LS_KEYS.users, []); }
function saveUsers(v) { save(LS_KEYS.users, v); }

// Room CRUD
function addRoom(r) {
  const a = loadRooms();
  a.push(r);
  saveRooms(a);
  logAction('add_room', `Thêm ${r.id}`);
}

function updateRoom(id, patch) {
  const a = loadRooms();
  const i = a.findIndex(x => x.id === id);
  if (i > -1) {
    a[i] = { ...a[i], ...patch };
    saveRooms(a);
    logAction('update_room', `Sửa ${id}`);
  }
}

function deleteRoom(id) {
  let a = loadRooms();
  a = a.filter(x => x.id !== id);
  saveRooms(a);
  logAction('delete_room', `Xóa ${id}`);
}

// Asset CRUD
function addAsset(a) {
  const arr = loadAssets();
  arr.push(a);
  saveAssets(arr);
  logAction('add_asset', `Thêm asset ${a.id}`);
}

function updateAsset(id, patch) {
  const arr = loadAssets();
  const i = arr.findIndex(x => x.id === id);
  if (i > -1) {
    arr[i] = { ...arr[i], ...patch };
    saveAssets(arr);
    logAction('update_asset', `Sửa asset ${id}`);
  }
}

function deleteAsset(id) {
  let arr = loadAssets();
  arr = arr.filter(x => x.id !== id);
  saveAssets(arr);
  logAction('delete_asset', `Xóa asset ${id}`);
}

// Inventory CRUD
function addInv(i) {
  const arr = loadInv();
  arr.push(i);
  saveInv(arr);
  logAction('add_inv', `Thêm inv ${i.id}`);
}

function updateInv(id, patch) {
  const arr = loadInv();
  const idx = arr.findIndex(x => x.id === id);
  if (idx > -1) {
    arr[idx] = { ...arr[idx], ...patch };
    saveInv(arr);
    logAction('update_inv', `Sửa inv ${id}`);
  }
}

function deleteInv(id) {
  let arr = loadInv();
  arr = arr.filter(x => x.id !== id);
  saveInv(arr);
  logAction('delete_inv', `Xóa inv ${id}`);
}

// Requests CRUD
function addRequest(r) {
  const arr = loadReqs();
  arr.push({ ...r, created: nowIso() });
  saveReqs(arr);
  logAction('add_request', `Tạo ${r.id}`);
}

function updateRequest(id, patch) {
  const arr = loadReqs();
  const i = arr.findIndex(x => x.id === id);
  if (i > -1) {
    arr[i] = { ...arr[i], ...patch };
    saveReqs(arr);
    logAction('update_request', `Sửa ${id}`);
  }
}

function deleteRequest(id) {
  let arr = loadReqs();
  arr = arr.filter(x => x.id !== id);
  saveReqs(arr);
  logAction('delete_request', `Xóa ${id}`);
}