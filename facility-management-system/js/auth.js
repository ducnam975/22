// Current user
let currentUser = load(LS_KEYS.current, null);

// User session management
function loadCurrent() { return load(LS_KEYS.current, null); }
function saveCurrent(u) { save(LS_KEYS.current, u); }
function removeCurrent() { localStorage.removeItem(LS_KEYS.current); }

// UI helpers for role
function renderCurrentUser(user) {
  const cu = el('current-user');
  const loginBtn = el('btn-open-login');
  const signupBtn = el('btn-open-signup');
  const logoutBtn = el('btn-logout');
  const usersMgmtBtn = el('btn-users-mgmt');
  
  if (user) {
    cu.innerHTML = `<span class="badge bg-light text-dark">${user.displayName || user.username} · ${user.role}</span>`;
    loginBtn.style.display = 'none';
    signupBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    usersMgmtBtn.style.display = user.role === 'admin' ? 'inline-block' : 'none';
  } else {
    cu.innerHTML = '';
    loginBtn.style.display = 'inline-block';
    signupBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    usersMgmtBtn.style.display = 'none';
  }
}

function applyRoleUI(role) {
  const isAdmin = role === 'admin';
  const isTech = role === 'technician';
  const isTeacher = role === 'teacher';

  el('btn-add-room').style.display = isTech ? 'inline-block' : 'none';
  el('btn-add-asset').style.display = isTech ? 'inline-block' : 'none';
  el('btn-add-req').style.display = isTeacher ? 'inline-block' : 'none';
  el('btn-export-excel').style.display = isTech ? 'inline-block' : 'none';
  el('btn-clear-data').style.display = isTech ? 'inline-block' : 'none';
  el('btn-add-inv').style.display = isTech ? 'inline-block' : 'none';
  el('stats-area').classList.toggle('hidden', !isTech);
  el('right-col').classList.toggle('hidden', !isTech);
  
  const logsTab = document.querySelector('a[href="#tab-logs"]');
  if (logsTab) logsTab.parentElement.style.display = isTech ? 'inline-block' : 'none';
}

// Authentication functions
function doSignup(email, pass, name, role, roomsStr) {
  const users = loadUsers();
  if (users.some(u => u.email === email)) return { ok: false, reason: 'exists' };
  
  const user = {
    id: uid('U'),
    email,
    password: pass,
    displayName: name || email.split('@')[0],
    role,
    username: email.split('@')[0],
    assignedRooms: (roomsStr || '').split(',').map(x => x.trim()).filter(x => x)
  };
  
  users.push(user);
  saveUsers(users);
  logAction('signup', `Đăng ký ${email}`);
  return { ok: true, user };
}

function doLogin(email, pass) {
  const users = loadUsers();
  const u = users.find(x => x.email === email && x.password === pass);
  if (!u) return null;
  
  saveCurrent(u);
  logAction('login', `Đăng nhập ${email}`);
  return u;
}