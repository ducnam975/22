/**************** Export Excel (technician only) ****************/
function styleSheetProfessional(ws, headerRowCount = 1) {
  const range = ws['!ref'] ? XLSX.utils.decode_range(ws['!ref']) : { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } };
  
  // Style header
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddr = XLSX.utils.encode_cell({ r: headerRowCount - 1, c: C });
    const cell = ws[cellAddr];
    if (!cell) continue;
    
    cell.s = cell.s || {};
    cell.s.font = { name: "Times New Roman", sz: 12, bold: true, color: { rgb: "FFFFFFFF" } };
    cell.s.fill = { fgColor: { rgb: "1F4E78" } };
    cell.s.alignment = { horizontal: "center", vertical: "center" };
    cell.s.border = {
      top: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } }
    };
  }
  
  // Style data rows
  for (let R = headerRowCount; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[addr];
      if (!cell) continue;
      
      cell.s = cell.s || {};
      cell.s.font = { name: "Times New Roman", sz: 11, color: { rgb: "000000" } };
      cell.s.alignment = cell.s.alignment || { horizontal: "left", vertical: "center" };
      cell.s.border = {
        top: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } }
      };
    }
    
    // Zebra striping
    if ((R - headerRowCount) % 2 === 1) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[addr];
        if (!cell) continue;
        cell.s.fill = cell.s.fill || { fgColor: { rgb: "F7F7F7" } };
      }
    }
  }
  
  // Auto column width
  const cols = [];
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxlen = 10;
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
      if (cell && cell.v) {
        const v = String(cell.v);
        if (v.length > maxlen) maxlen = v.length;
      }
    }
    cols.push({ wch: Math.min(Math.max(maxlen + 2, 10), 40) });
  }
  ws['!cols'] = cols;
}

function sheetWithTitle(arr, title) {
  const ws = XLSX.utils.json_to_sheet(arr, { origin: 1 });
  const colsCount = Object.keys(arr[0] || {}).length || 1;
  
  ws['A1'] = { v: title };
  ws['!merges'] = ws['!merges'] || [];
  ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: colsCount - 1 } });
  ws['!ref'] = XLSX.utils.encode_range(XLSX.utils.decode_range(ws['!ref']));
  
  return ws;
}

function exportExcel() {
  if (!currentUser || currentUser.role !== 'technician') {
    notify('Chỉ NV Kỹ thuật được xuất báo cáo');
    return;
  }
  
  const rooms = loadRooms();
  const assets = loadAssets();
  const invs = loadInv();
  const reqs = loadReqs();
  const logs = load(LS_KEYS.logs, []);
  
  const wb = XLSX.utils.book_new();
  
  // Rooms sheet
  const roomsOrdered = rooms.map(r => ({
    Mã: r.id,
    Tên: r.name,
    Sức_chứa: r.capacity,
    Ghi_chú: r.notes || '',
    Created: r.created || '',
    Updated: r.updatedAt || ''
  }));
  const wsRooms = sheetWithTitle(roomsOrdered, 'Danh sách phòng');
  styleSheetProfessional(wsRooms);
  XLSX.utils.book_append_sheet(wb, wsRooms, 'Rooms');
  
  // Assets sheet
  const assetsOrdered = assets.map(a => ({
    ID: a.id,
    Tên: a.name,
    Loại: a.category || '',
    Phòng: a.room || '',
    Trạng_thái: a.status || '',
    Ngày_mua: a.purchased || '',
    Giá: a.price || 0,
    Nhà_cung_cấp: a.vendor || '',
    Mô_tả: a.desc || '',
    Ảnh: a.image ? '(base64)' : '',
    Updated: a.updatedAt || ''
  }));
  const wsAssets = sheetWithTitle(assetsOrdered, 'Danh sách tài sản');
  styleSheetProfessional(wsAssets);
  XLSX.utils.book_append_sheet(wb, wsAssets, 'Assets');
  
  // Inventory sheet
  const invOrdered = invs.map(i => ({
    Mã: i.id,
    Tên: i.name,
    Loại: i.category || '',
    Số_lượng: i.qty,
    Đơn_vị: i.unit || '',
    Giá_nhập: i.price || 0,
    Nhà_cung_cấp: i.vendor || '',
    Ngày_nhập: i.importDate || '',
    Ghi_chú: i.notes || ''
  }));
  const wsInv = sheetWithTitle(invOrdered, 'Kho vật tư');
  styleSheetProfessional(wsInv);
  XLSX.utils.book_append_sheet(wb, wsInv, 'Inventory');
  
  // Requests sheet
  const reqOrdered = reqs.map(r => ({
    Mã: r.id,
    Tiêu_đề: r.title,
    Phòng: r.room || '',
    Người_báo: r.reporter || '',
    Trạng_thái: r.status || '',
    Ngày_tạo: r.created || '',
    Mô_tả: r.desc || '',
    Ảnh: r.img ? '(base64)' : ''
  }));
  const wsReq = sheetWithTitle(reqOrdered, 'Yêu cầu bảo trì');
  styleSheetProfessional(wsReq);
  XLSX.utils.book_append_sheet(wb, wsReq, 'Requests');
  
  // Logs sheet
  const logOrdered = logs.map(l => ({
    Thời_gian: l.ts,
    Người: l.user,
    Hành_động: l.action,
    Mô_tả: l.desc
  }));
  const wsLog = XLSX.utils.json_to_sheet(logOrdered);
  styleSheetProfessional(wsLog);
  XLSX.utils.book_append_sheet(wb, wsLog, 'Logs');
  
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }),
    `BaoCao_CoSoVatChat_${(new Date()).toISOString().slice(0, 10)}.xlsx`);
  
  logAction('export_excel', 'Xuất Excel toàn bộ');
  notify('Đã xuất Excel (Rooms / Assets / Inventory / Requests / Logs).');
}