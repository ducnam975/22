/**************** Main Application Logic ****************/
// Initialize
(function init() {
  currentUser = loadCurrent();
  renderCurrentUser(currentUser);
  applyRoleUI(currentUser ? currentUser.role : null);
  renderAll();
})();

// Render all components
function renderAll() {
  renderRooms();
  renderAssets();
  renderInv();
  renderReqs();
  renderLogs();
  renderChart();
  el('year').textContent = new Date().getFullYear();
}

// Room rendering
function renderRooms() {
  const rows = loadRooms();
  const q = el('search-rooms').value.trim().toLowerCase();
  let filtered = rows.filter(r => !q || (r.id + r.name).toLowerCase().includes(q));
  filtered = applyFilters('rooms', filtered);
  
  el('rooms-tbody').innerHTML = filtered.map((r, idx) => `
    <tr class="${idx % 2 ? 'zebra-row' : ''}">
      <td>${r.id}</td>
      <td>${r.name}</td>
      <td>${r.capacity || ''}</td>
      <td>${r.notes || ''}</td>
      <td>${renderRoomActions(r)}</td>
    </tr>`).join('');
  
  el('stat-rooms').textContent = rows.length;
  
  const exportRoomSel = el('export-room');
  if (exportRoomSel) {
    exportRoomSel.innerHTML = rows.map(r => `<option value="${r.id}">${r.id} — ${r.name}</option>`).join('');
  }
}

function renderRoomActions(room) {
  if (currentUser && currentUser.role === 'technician') {
    return `<button class="btn btn-sm btn-outline-primary me-1" data-act="edit-room" data-id="${room.id}">Sửa</button>
            <button class="btn btn-sm btn-outline-danger" data-act="del-room" data-id="${room.id}">Xóa</button>`;
  }
  
  if (currentUser && currentUser.role === 'teacher') {
    return `<button class="btn btn-sm btn-outline-primary me-1" data-act="edit-room" data-id="${room.id}">Sửa (capacity)</button>`;
  }
  
  return `<button class="btn btn-sm btn-outline-secondary" disabled title="Chỉ NV Kỹ thuật mới được sửa/xóa">Không có quyền</button>`;
}

// Assets rendering
function renderAssets() {
  let rows = loadAssets();
  const q = el('search-assets').value.trim().toLowerCase();
  const statusFilter = el('filter-asset-status').value;
  
  if (currentUser && currentUser.role === 'teacher') {
    const assigned = currentUser.assignedRooms || [];
    rows = rows.filter(a => assigned.includes(a.room));
  }
  
  let filtered = rows.filter(a =>
    (!q || (a.id + a.name + (a.room || '')).toLowerCase().includes(q)) &&
    (!statusFilter || a.status === statusFilter)
  );
  
  filtered = applyFilters('assets', filtered);
  
  el('assets-tbody').innerHTML = filtered.map((a, idx) => `
    <tr class="${idx % 2 ? 'zebra-row' : ''}">
      <td>${a.id}</td>
      <td>${a.name}</td>
      <td>${a.category || ''}</td>
      <td>${a.room || ''}</td>
      <td>${a.status || ''}</td>
      <td>${a.image ? '<img src="' + a.image + '" class="asset-thumb">' : ''}</td>
      <td>${renderAssetActions(a)}</td>
    </tr>`).join('');
  
  el('stat-assets').textContent = loadAssets().length;
}

function renderAssetActions(a) {
  if (currentUser && currentUser.role === 'technician') {
    return `<button class="btn btn-sm btn-outline-info me-1" data-act="view-asset" data-id="${a.id}">Xem</button>
            <button class="btn btn-sm btn-outline-primary me-1" data-act="edit-asset" data-id="${a.id}">Sửa</button>
            <button class="btn btn-sm btn-outline-danger" data-act="del-asset" data-id="${a.id}">Xóa</button>`;
  }
  
  if (currentUser && currentUser.role === 'teacher') {
    return `<button class="btn btn-sm btn-outline-info me-1" data-act="view-asset" data-id="${a.id}">Xem</button>`;
  }
  
  return `<button class="btn btn-sm btn-outline-info" data-act="view-asset" data-id="${a.id}">Xem</button>`;
}

// Inventory rendering
function renderInv() {
  const rows = loadInv();
  const q = el('search-inv').value.trim().toLowerCase();
  let filtered = rows.filter(i => !q || (i.id + i.name + (i.category || '')).toLowerCase().includes(q));
  filtered = applyFilters('inv', filtered);
  
  el('inv-tbody').innerHTML = filtered.map((i, idx) => `
    <tr class="${idx % 2 ? 'zebra-row' : ''}">
      <td>${i.id}</td>
      <td>${i.name}</td>
      <td>${i.category || ''}</td>
      <td>${i.qty}</td>
      <td>${i.unit || ''}</td>
      <td>${i.price ? i.price.toLocaleString() : ''}</td>
      <td>${i.vendor || ''}</td>
      <td>${i.importDate || ''}</td>
      <td>${renderInvActions(i)}</td>
    </tr>`).join('');
}

function renderInvActions(item) {
  if (currentUser && currentUser.role === 'technician') {
    return `<button class="btn btn-sm btn-outline-primary me-1" data-act="edit-inv" data-id="${item.id}">Sửa</button>
            <button class="btn btn-sm btn-outline-success me-1" data-act="export-inv" data-id="${item.id}">Xuất kho</button>
            <button class="btn btn-sm btn-outline-danger" data-act="del-inv" data-id="${item.id}">Xóa</button>`;
  }
  
  if (currentUser && currentUser.role === 'teacher') {
    return `<button class="btn btn-sm btn-outline-secondary" disabled>Không có quyền</button>`;
  }
  
  return `<button class="btn btn-sm btn-outline-secondary" disabled>Không có quyền</button>`;
}

// Requests rendering
function renderReqs() {
  const rows = loadReqs();
  const q = el('search-req').value.trim().toLowerCase();
  const statusFilter = el('filter-req-status').value;
  
  let visible = rows;
  if (currentUser && currentUser.role === 'teacher') {
    const assigned = currentUser.assignedRooms || [];
    visible = rows.filter(r => assigned.includes(r.room) || r.reporter === currentUser.username);
  }
  
  let filtered = visible.filter(r =>
    (!q || (r.id + r.title + r.reporter).toLowerCase().includes(q)) &&
    (!statusFilter || r.status === statusFilter)
  );
  
  filtered = applyFilters('reqs', filtered);
  
  el('reqs-tbody').innerHTML = filtered.map((r, idx) => `
    <tr class="${idx % 2 ? 'zebra-row' : ''}">
      <td>${r.id}</td>
      <td>${r.title}</td>
      <td>${r.room || ''}</td>
      <td>${r.reporter || ''}</td>
      <td>${r.status}</td>
      <td>${renderReqActions(r)}</td>
    </tr>`).join('');
  
  const openCount = rows.filter(x => x.status === 'open').length;
  el('stat-requests').textContent = openCount;
}

function renderReqActions(r) {
  if (currentUser && currentUser.role === 'technician') {
    return `<button class="btn btn-sm btn-outline-info me-1" data-act="view-req" data-id="${r.id}">Xem</button>
            <button class="btn btn-sm btn-outline-primary me-1" data-act="edit-req" data-id="${r.id}">Sửa</button>
            <button class="btn btn-sm btn-outline-danger" data-act="del-req" data-id="${r.id}">Xóa</button>`;
  }
  
  return `<button class="btn btn-sm btn-outline-info" data-act="view-req" data-id="${r.id}">Xem</button>`;
}

// Logs rendering
function renderLogs() {
  const rows = load(LS_KEYS.logs, []).slice().reverse();
  el('logs-tbody').innerHTML = rows.map(l => `
    <tr>
      <td>${l.ts}</td>
      <td>${l.user}</td>
      <td>${l.action}</td>
      <td>${l.desc}</td>
    </tr>`).join('');
}

// Event Listeners Setup
function setupEventListeners() {
  // Room form
  el('form-room').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const room = {
      id: f['id'].value.trim(),
      name: f['name'].value.trim(),
      capacity: Number(f['capacity'].value) || 0,
      notes: f['notes'].value.trim()
    };
    
    const rooms = loadRooms();
    const exists = rooms.some(r => r.id === room.id);
    
    if (exists) {
      if (currentUser && currentUser.role === 'technician') {
        updateRoom(room.id, room);
      } else if (currentUser && currentUser.role === 'teacher') {
        updateRoom(room.id, { capacity: room.capacity, notes: room.notes });
      } else {
        notify('Bạn không có quyền sửa phòng');
        return;
      }
    } else {
      if (currentUser && currentUser.role === 'technician') {
        addRoom(room);
      } else {
        notify('Chỉ NV Kỹ thuật được thêm phòng mới');
        return;
      }
    }
    
    hideModal('modalRoom');
    resetForm(f);
    renderAll();
  });

  // Asset/Inventory form
  el('form-asset').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'technician') {
      notify('Chỉ NV Kỹ thuật được thao tác vật tư/tài sản');
      return;
    }
    
    const f = e.target;
    const providedId = f['id'].value.trim();
    const name = f['name'].value.trim();
    const category = f['category'].value.trim();
    const room = f['room'].value.trim();
    const qty = Number(f['quantity'].value) || 1;
    const unit = f['unit'].value.trim() || '';
    const price = Number(f['price'].value) || 0;
    const vendor = f['vendor'].value.trim();
    const importDate = f['importDate'].value || '';
    const desc = f['desc'].value || '';
    const file = f['image'].files[0];
    
    let img = '';
    if (file) {
      try { img = await fileToBase64(file); } catch (e) { }
    }
    
    // Determine whether this is editing an existing asset/inv
    const existingAsset = providedId ? loadAssets().find(x => x.id === providedId) : null;
    const existingInvByNameCat = loadInv().find(x =>
      x.name.toLowerCase() === name.toLowerCase() && x.category === category);
    
    if (room) {
      // If room specified => create assets (qty items) assigned to room
      if (existingAsset) {
        updateAsset(existingAsset.id, {
          name, category, room, price, vendor,
          purchased: importDate, desc, image: img, updatedAt: nowIso()
        });
        notify('Đã cập nhật tài sản ' + existingAsset.id);
      } else {
        for (let i = 0; i < qty; i++) {
          const newId = providedId ? providedId + (qty > 1 ? ('-' + (i + 1)) : '') :
            ('AS-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 900 + 100));
          
          const asset = {
            id: newId, name, category, room, status: 'normal',
            purchased: importDate, price, vendor, warranty: 0,
            desc, image: img, updatedAt: nowIso()
          };
          addAsset(asset);
        }
        notify('Đã tạo ' + qty + ' tài sản gán vào ' + room);
      }
    } else {
      // No room => treat as Inventory
      if (existingAsset) {
        deleteAsset(existingAsset.id);
        const invs = loadInv();
        const match = invs.find(x =>
          x.name.toLowerCase() === existingAsset.name.toLowerCase() &&
          x.category === existingAsset.category);
        
        if (match) {
          match.qty = (match.qty || 0) + 1;
          match.updatedAt = nowIso();
          updateInv(match.id, match);
        } else {
          const newInv = {
            id: providedId || ('INV-' + Date.now().toString().slice(-6)),
            name: existingAsset.name,
            category: existingAsset.category || category,
            qty: 1,
            unit: unit || '',
            price: existingAsset.price || price || 0,
            vendor: existingAsset.vendor || vendor || '',
            importDate: existingAsset.purchased || importDate || nowIso().slice(0, 10),
            notes: existingAsset.desc || desc || '',
            image: existingAsset.image || img || '',
            updatedAt: nowIso()
          };
          addInv(newInv);
        }
        notify(`Đã chuyển asset ${existingAsset.id} về kho`);
      } else {
        if (existingInvByNameCat) {
          existingInvByNameCat.qty = (existingInvByNameCat.qty || 0) + qty;
          existingInvByNameCat.updatedAt = nowIso();
          updateInv(existingInvByNameCat.id, existingInvByNameCat);
        } else {
          const inv = {
            id: providedId || ('INV-' + Date.now().toString().slice(-6)),
            name, category, qty, unit, price, vendor,
            importDate, notes: desc, image: img, updatedAt: nowIso()
          };
          addInv(inv);
        }
        notify('Đã thêm vào kho: ' + qty + ' x ' + name);
      }
    }
    
    hideModal('modalAsset');
    resetForm(f);
    renderAll();
  });

  // Export inventory form
  el('form-export-inv').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'technician') {
      notify('Chỉ NV Kỹ thuật được xuất kho');
      return;
    }
    
    const invId = el('export-inv-select').value;
    const qty = Number(el('export-qty').value) || 0;
    const room = el('export-room').value;
    
    if (!invId || qty <= 0 || !room) {
      notify('Chọn vật tư, số lượng > 0 và phòng');
      return;
    }
    
    const inv = loadInv().find(x => x.id === invId);
    if (!inv) return notify('Không tìm thấy vật tư');
    if (inv.qty < qty) return notify('Không đủ số lượng trong kho');
    
    // Reduce inventory
    inv.qty -= qty;
    inv.updatedAt = nowIso();
    
    if (inv.qty <= 0) {
      deleteInv(inv.id);
    } else {
      updateInv(inv.id, inv);
    }
    
    // Create assets
    for (let i = 0; i < qty; i++) {
      const newId = 'AS-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 900 + 100);
      const asset = {
        id: newId,
        name: inv.name,
        category: inv.category,
        room,
        status: 'normal',
        purchased: inv.importDate || nowIso(),
        price: inv.price || 0,
        vendor: inv.vendor || '',
        warranty: 0,
        desc: inv.notes || '',
        image: inv.image || '',
        updatedAt: nowIso()
      };
      addAsset(asset);
    }
    
    hideModal('modalExportInv');
    el('form-export-inv').reset();
    renderAll();
    notify('Đã xuất ' + qty + ' → ' + room);
  });

  // Request form
  el('form-req').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const id = f['id'].value.trim();
    const title = f['title'].value.trim();
    const room = f['room'].value.trim();
    const reporter = f['reporter'].value.trim() || (currentUser ? currentUser.username : 'anonymous');
    const file = f['img'].files[0];
    const desc = f['desc'].value.trim();
    const status = f['status'].value;
    
    const exists = loadReqs().some(r => r.id === id);
    let img = '';
    if (file) { try { img = await fileToBase64(file); } catch (e) { } }
    
    const obj = { id, title, room, reporter, img, desc, status };
    
    if (exists) {
      if (!currentUser || currentUser.role !== 'technician') {
        notify('Chỉ NV Kỹ thuật được chỉnh yêu cầu');
        return;
      }
      updateRequest(id, obj);
    } else {
      if (!currentUser || currentUser.role !== 'teacher') {
        notify('Chỉ giáo viên được tạo phiếu báo hỏng');
        return;
      }
      
      const assigned = currentUser.assignedRooms || [];
      if (room && !assigned.includes(room)) {
        notify('Bạn chỉ có thể tạo phiếu trong phòng được gán');
        return;
      }
      addRequest(obj);
    }
    
    hideModal('modalReq');
    resetForm(f);
    renderAll();
  });

  // Top buttons
  el('btn-add-room').addEventListener('click', () => {
    el('form-room').reset();
    el('form-room')['id'].removeAttribute('readonly');
    new bootstrap.Modal(el('modalRoom')).show();
  });
  
  el('btn-add-asset').addEventListener('click', () => {
    if (!currentUser || currentUser.role !== 'technician') {
      notify('Chỉ NV Kỹ thuật được thêm thiết bị/vật tư');
      return;
    }
    el('form-asset').reset();
    el('form-asset')['id'].removeAttribute('readonly');
    new bootstrap.Modal(el('modalAsset')).show();
  });
  
  el('btn-add-req').addEventListener('click', () => {
    if (!currentUser || currentUser.role !== 'teacher') {
      notify('Chỉ giáo viên được tạo phiếu');
      return;
    }
    el('form-req').reset();
    el('form-req')['reporter'].value = currentUser.username || '';
    new bootstrap.Modal(el('modalReq')).show();
  });
  
  el('btn-add-inv').addEventListener('click', () => {
    if (!currentUser || currentUser.role !== 'technician') {
      notify('Chỉ NV Kỹ thuật');
      return;
    }
    el('form-asset').reset();
    new bootstrap.Modal(el('modalAsset')).show();
  });

  // Search events
  el('search-rooms').addEventListener('input', debounce(() => renderRooms(), 200));
  el('search-assets').addEventListener('input', debounce(() => renderAssets(), 200));
  el('filter-asset-status').addEventListener('change', () => renderAssets());
  el('search-inv').addEventListener('input', debounce(() => renderInv(), 200));
  el('search-req').addEventListener('input', debounce(() => renderReqs(), 200));
  el('filter-req-status').addEventListener('change', () => renderReqs());

  // Export Excel
  el('btn-export-excel').addEventListener('click', exportExcel);

  // Clear data
  el('btn-clear-data').addEventListener('click', () => {
    if (!currentUser || currentUser.role !== 'technician') {
      notify('Chỉ NV Kỹ thuật được xóa dữ liệu');
      return;
    }
    
    if (!confirm('Xoá toàn bộ data (phòng, tài sản, kho, yêu cầu, log)?')) return;
    
    save(LS_KEYS.rooms, []);
    save(LS_KEYS.assets, []);
    save(LS_KEYS.inventory, []);
    save(LS_KEYS.requests, []);
    save(LS_KEYS.logs, []);
    renderAll();
  });

  // Auth event listeners
  const modalLogin = new bootstrap.Modal(el('modalLogin'));
  const modalSignup = new bootstrap.Modal(el('modalSignup'));
  const modalUsers = new bootstrap.Modal(el('modalUsers'));
  const modalCreateUser = new bootstrap.Modal(el('modalCreateUser'));

  el('btn-open-login').addEventListener('click', () => modalLogin.show());
  el('btn-open-signup').addEventListener('click', () => modalSignup.show());
  
  el('btn-logout').addEventListener('click', () => {
    if (!confirm('Đăng xuất?')) return;
    removeCurrent();
    currentUser = null;
    renderCurrentUser(null);
    applyRoleUI(null);
    renderAll();
  });

  el('login-btn').addEventListener('click', () => {
    const email = el('login-email').value.trim();
    const pass = el('login-password').value;
    const u = doLogin(email, pass);
    
    if (!u) return notify('Sai email hoặc mật khẩu');
    
    currentUser = u;
    renderCurrentUser(u);
    applyRoleUI(u.role);
    modalLogin.hide();
    el('login-email').value = '';
    el('login-password').value = '';
    renderAll();
  });

  el('su-btn').addEventListener('click', () => {
    const email = el('su-email').value.trim();
    const pass = el('su-password').value;
    const name = el('su-name').value.trim();
    const role = el('su-role').value;
    const roomsStr = el('su-rooms').value.trim();
    
    if (!email || !pass) {
      notify('Nhập email và mật khẩu');
      return;
    }
    
    const res = doSignup(email, pass, name, role, roomsStr);
    if (!res.ok) return notify('Email đã tồn tại');
    
    modalSignup.hide();
    el('su-email').value = '';
    el('su-password').value = '';
    el('su-name').value = '';
    el('su-rooms').value = '';
    notify('Đăng ký thành công. Vui lòng đăng nhập.');
  });

  // Users management
  el('btn-users-mgmt').addEventListener('click', () => {
    if (!currentUser || currentUser.role !== 'admin') {
      notify('Chỉ Admin');
      return;
    }
    renderUsersTable();
    modalUsers.show();
  });
  
  el('btn-create-user').addEventListener('click', () => {
    modalCreateUser.show();
  });

  function renderUsersTable() {
    const users = loadUsers();
    el('users-tbody').innerHTML = users.map(u => `
      <tr>
        <td>${u.email}</td>
        <td>${u.displayName}</td>
        <td>${u.role}</td>
        <td>${(u.assignedRooms || []).join(', ')}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" data-act="edit-user" data-id="${u.id}">Sửa</button>
          <button class="btn btn-sm btn-outline-danger" data-act="del-user" data-id="${u.id}">Xóa</button>
        </td>
      </tr>`).join('');
  }

  el('cu-save').addEventListener('click', () => {
    const email = el('cu-email').value.trim();
    const pass = el('cu-password').value;
    const name = el('cu-name').value.trim();
    const role = el('cu-role').value;
    const roomsStr = el('cu-rooms').value.trim();
    
    if (!email || !pass) {
      notify('Nhập email và mật khẩu');
      return;
    }
    
    const r = doSignup(email, pass, name, role, roomsStr);
    if (!r.ok) return notify('Email tồn tại');
    
    el('cu-email').value = '';
    el('cu-password').value = '';
    el('cu-name').value = '';
    el('cu-rooms').value = '';
    renderUsersTable();
    modalCreateUser.hide();
  });

  // Filter popup
  function showFilterPopup(table, col, iconEl) {
    hideFilterPopup();
    
    const rows = getRawRowsByTable(table);
    const accessor = r => (r[col] !== undefined && r[col] !== null) ? r[col] : '';
    const values = uniqueValues(rows, accessor);
    
    const popup = document.createElement('div');
    popup.className = 'filter-popup';
    popup.setAttribute('data-table', table);
    popup.setAttribute('data-col', col);
    
    popup.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <strong>${col}</strong>
        <div class="filter-sort">
          <button class="btn btn-sm btn-outline-secondary fp-sort" data-sort="asc" title="Sort A→Z">A→Z</button>
          <button class="btn btn-sm btn-outline-secondary fp-sort" data-sort="desc" title="Sort Z→A">Z→A</button>
        </div>
      </div>
      <div class="filter-values"></div>
      <div class="fp-actions">
        <div>
          <button class="btn btn-sm btn-outline-primary fp-apply">Áp dụng</button>
          <button class="btn btn-sm btn-outline-secondary fp-clear">Xóa</button>
        </div>
        <button class="btn btn-sm btn-outline-danger fp-close">Đóng</button>
      </div>`;
    
    const valsDiv = popup.querySelector('.filter-values');
    values.forEach(v => {
      const id = 'fv-' + Math.random().toString(36).slice(2, 8);
      const label = document.createElement('label');
      label.innerHTML = `<input type="checkbox" data-val="${escapeHtml(v)}">
                         <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${v}</span>`;
      valsDiv.appendChild(label);
    });
    
    document.body.appendChild(popup);
    
    // Position
    const rect = iconEl.getBoundingClientRect();
    popup.style.left = (rect.left) + 'px';
    popup.style.top = (rect.bottom + 6) + 'px';
    
    // Wire events
    popup.querySelector('.fp-close').addEventListener('click', hideFilterPopup);
    popup.querySelector('.fp-clear').addEventListener('click', () => {
      if (!filterState[table]) filterState[table] = {};
      filterState[table][col] = { values: new Set(), sort: null };
      hideFilterPopup();
      renderAll();
    });
    
    popup.querySelectorAll('.fp-sort').forEach(b => {
      b.addEventListener('click', () => {
        if (!filterState[table]) filterState[table] = {};
        filterState[table][col] = filterState[table][col] || { values: new Set(), sort: null };
        filterState[table][col].sort = b.dataset.sort;
        renderAll();
      });
    });
    
    popup.querySelector('.fp-apply').addEventListener('click', () => {
      const checked = Array.from(popup.querySelectorAll('input[type=checkbox]:checked'))
        .map(i => unescapeHtml(i.dataset.val || i.getAttribute('data-val') || i.value || ''));
      
      if (!filterState[table]) filterState[table] = {};
      filterState[table][col] = filterState[table][col] || { values: new Set(), sort: null };
      filterState[table][col].values = new Set(checked);
      hideFilterPopup();
      renderAll();
    });
  }
  
  function hideFilterPopup() {
    document.querySelectorAll('.filter-popup').forEach(n => n.remove());
  }
  
  // Filter icon click
  document.body.addEventListener('click', (e) => {
    const icon = e.target.closest('.col-filter-icon');
    if (icon) {
      const table = icon.dataset.table;
      const col = icon.dataset.col;
      showFilterPopup(table, col, icon);
      return;
    }
    
    // Close popup on outside click
    if (!e.target.closest('.filter-popup')) hideFilterPopup();
  });

  // Table button delegation
  document.body.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    
    const act = btn.dataset.act;
    const id = btn.dataset.id;
    if (!act) return;
    
    try {
      // Room actions
      if (act === 'edit-room') {
        const r = loadRooms().find(x => x.id === id);
        if (!r) return notify('Không tìm thấy');
        
        const f = el('form-room');
        f['id'].value = r.id;
        f['id'].setAttribute('readonly', 'readonly');
        f['name'].value = r.name;
        f['capacity'].value = r.capacity || '';
        f['notes'].value = r.notes || '';
        new bootstrap.Modal(el('modalRoom')).show();
      }
      
      if (act === 'del-room') {
        if (!currentUser || currentUser.role !== 'technician') {
          notify('Chỉ NV Kỹ thuật được xóa phòng');
          return;
        }
        if (!confirm('Xóa phòng?')) return;
        deleteRoom(id);
        renderAll();
      }
      
      // Asset actions
      if (act === 'view-asset') {
        const a = loadAssets().find(x => x.id === id);
        if (!a) return notify('Không tìm thấy');
        
        const html = `
          <h5>${a.name}</h5>
          <p>
            ID: ${a.id}<br>
            Phòng: ${a.room || ''}<br>
            Loại: ${a.category || ''}<br>
            Trạng thái: ${a.status || ''}
          </p>
          ${a.image ? '<img src="' + a.image + '" style="width:100%;border-radius:8px">' : ''}
          <p class="small-muted">
            Ngày mua: ${a.purchased || ''} · Giá: ${a.price ? a.price.toLocaleString() : ''}
          </p>
          <p>${a.desc || ''}</p>`;
        
        el('modalViewBody').innerHTML = html;
        new bootstrap.Modal(el('modalView')).show();
      }
      
      if (act === 'edit-asset') {
        const a = loadAssets().find(x => x.id === id);
        if (!a) return notify('Không tìm thấy');
        
        if (!currentUser || currentUser.role !== 'technician') {
          notify('Bạn không có quyền chỉnh sửa');
          return;
        }
        
        const f = el('form-asset');
        f['id'].value = a.id;
        f['name'].value = a.name;
        f['category'].value = a.category || '';
        f['room'].value = a.room || '';
        f['quantity'].value = 1;
        f['unit'].value = '';
        f['price'].value = a.price || '';
        f['vendor'].value = a.vendor || '';
        f['importDate'].value = a.purchased || '';
        f['desc'].value = a.desc || '';
        new bootstrap.Modal(el('modalAsset')).show();
      }
      
      if (act === 'del-asset') {
        if (!currentUser || currentUser.role !== 'technician') {
          notify('Chỉ NV Kỹ thuật được xóa tài sản');
          return;
        }
        if (!confirm('Xóa tài sản?')) return;
        deleteAsset(id);
        renderAll();
      }
      
      // Request actions
      if (act === 'view-req') {
        const r = loadReqs().find(x => x.id === id);
        if (!r) return notify('Không tìm thấy');
        
        const html = `
          <h5>${r.title}</h5>
          <p>
            Mã: ${r.id}<br>
            Phòng: ${r.room || ''}<br>
            Người báo: ${r.reporter || ''}<br>
            Trạng thái: ${r.status}
          </p>
          ${r.img ? '<img src="' + r.img + '" style="width:100%;border-radius:8px">' : ''}
          <p>${r.desc || ''}</p>`;
        
        el('modalViewBody').innerHTML = html;
        new bootstrap.Modal(el('modalView')).show();
      }
      
      if (act === 'edit-req') {
        const r = loadReqs().find(x => x.id === id);
        if (!r) return notify('Không tìm thấy');
        
        if (!currentUser || currentUser.role !== 'technician') {
          notify('Chỉ NV Kỹ thuật được chỉnh yêu cầu');
          return;
        }
        
        const f = el('form-req');
        f['id'].value = r.id;
        f['id'].setAttribute('readonly', 'readonly');
        f['title'].value = r.title;
        f['room'].value = r.room || '';
        f['reporter'].value = r.reporter || '';
        f['desc'].value = r.desc || '';
        f['status'].value = r.status || 'open';
        new bootstrap.Modal(el('modalReq')).show();
      }
      
      if (act === 'del-req') {
        if (!currentUser || currentUser.role !== 'technician') {
          notify('Chỉ NV Kỹ thuật được xóa yêu cầu');
          return;
        }
        if (!confirm('Xóa yêu cầu?')) return;
        deleteRequest(id);
        renderAll();
      }
      
      // Inventory actions
      if (act === 'edit-inv') {
        if (!currentUser || currentUser.role !== 'technician') {
          notify('Chỉ NV Kỹ thuật');
          return;
        }
        
        const inv = loadInv().find(x => x.id === id);
        if (!inv) return notify('Không tìm thấy');
        
        const f = el('form-asset');
        f['id'].value = inv.id;
        f['name'].value = inv.name;
        f['category'].value = inv.category || '';
        f['room'].value = '';
        f['quantity'].value = inv.qty || 1;
        f['unit'].value = inv.unit || '';
        f['price'].value = inv.price || '';
        f['vendor'].value = inv.vendor || '';
        f['importDate'].value = inv.importDate || '';
        f['desc'].value = inv.notes || '';
        new bootstrap.Modal(el('modalAsset')).show();
      }
      
      if (act === 'export-inv') {
        if (!currentUser || currentUser.role !== 'technician') {
          notify('Chỉ NV Kỹ thuật');
          return;
        }
        
        const inv = loadInv().find(x => x.id === id);
        if (!inv) return notify('Không tìm thấy');
        
        const sel = el('export-inv-select');
        sel.innerHTML = loadInv().map(i =>
          `<option value="${i.id}">${i.id} — ${i.name} (qty:${i.qty})</option>`).join('');
        
        el('export-qty').value = 1;
        const rooms = loadRooms();
        el('export-room').innerHTML = rooms.map(r =>
          `<option value="${r.id}">${r.id} — ${r.name}</option>`).join('');
        
        setTimeout(() => { el('export-inv-select').value = id; }, 50);
        new bootstrap.Modal(el('modalExportInv')).show();
      }
      
      if (act === 'del-inv') {
        if (!currentUser || currentUser.role !== 'technician') {
          notify('Chỉ NV Kỹ thuật');
          return;
        }
        if (!confirm('Xóa vật tư?')) return;
        deleteInv(id);
        renderInv();
      }
      
      // User management actions
      if (act === 'del-user') {
        if (!currentUser || currentUser.role !== 'admin') {
          notify('Chỉ Admin');
          return;
        }
        if (!confirm('Xóa user?')) return;
        const users = loadUsers().filter(u => u.id !== id);
        saveUsers(users);
        renderUsersTable();
      }
      
      if (act === 'edit-user') {
        const users = loadUsers();
        const u = users.find(x => x.id === id);
        if (!u) return;
        
        el('cu-email').value = u.email;
        el('cu-password').value = u.password;
        el('cu-name').value = u.displayName;
        el('cu-role').value = u.role;
        el('cu-rooms').value = (u.assignedRooms || []).join(',');
        modalCreateUser.show();
        
        const newUsers = users.filter(x => x.id !== id);
        saveUsers(newUsers);
      }
    } catch (err) {
      notify(err.message);
    }
  });

  // Cancel buttons
  document.body.addEventListener('click', (e) => {
    const b = e.target.closest('.btn-cancel');
    if (!b) return;
    
    const target = b.getAttribute('data-target');
    if (!target) return;
    
    const m = document.getElementById(target);
    if (m) {
      const forms = m.querySelectorAll('form');
      forms.forEach(f => resetForm(f));
      hideModal(target);
    }
  });
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  init();
});