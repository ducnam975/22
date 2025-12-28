<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>Quản lý Cơ sở vật chất </title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
  <style>
    :root{ --bg:#f6f8fb; --card:#fff; --muted:#6c757d; --accent:#0d6efd; }
    body{ background:var(--bg); font-family:Inter,system-ui,Arial,sans-serif; color:#222; }
    .container-app{ max-width:1200px; margin:28px auto; padding:18px; }
    .brand { display:flex; align-items:center; gap:12px; }
    .hero { background:linear-gradient(90deg, rgba(13,110,253,0.06), rgba(13,110,253,0.02)); padding:20px; border-radius:14px; display:flex; gap:18px; align-items:center; }
    .hero img{ width:160px; border-radius:10px; object-fit:cover; }
    .small-muted{ color:var(--muted); }
    .card-soft{ background:var(--card); border-radius:12px; padding:12px; box-shadow: 0 6px 20px rgba(12,24,60,0.04); }
    .asset-thumb{ height:46px; width:64px; object-fit:cover; border-radius:6px; }
    .pw-strength{ height:8px; border-radius:6px; background:#e9ecef; overflow:hidden; }
    .pw-strength > i{ display:block; height:100%; width:0%; background:linear-gradient(90deg,#ff6b6b,#ffd166,#06d6a0); transition:width .25s; }
    footer { opacity:0.8; font-size:0.9rem; text-align:center; margin-top:24px; }
    .zebra-row{ background:#fafafa; }
    .hidden { display:none !important; }
    .small-btn{ padding: .25rem .5rem; font-size: .8rem; }
    /* Filter dropdown styles */
    .col-filter-icon{ cursor:pointer; margin-left:6px; color:#6c757d; }
    .filter-popup{ position:absolute; z-index:1200; min-width:200px; background:#fff; border:1px solid rgba(0,0,0,.12); border-radius:8px; box-shadow:0 8px 24px rgba(2,6,23,.12); padding:8px; }
    .filter-popup .fp-actions{ display:flex; gap:6px; justify-content:space-between; margin-top:8px; }
    .filter-values{ max-height:220px; overflow:auto; padding:6px 0; border-top:1px solid #f1f1f1; }
    .filter-values label{ display:flex; align-items:center; gap:8px; padding:4px 6px; }
    .filter-sort{ display:flex; gap:6px; align-items:center; }
  </style>
</head>
<body>
  <div class="container-fluid bg-white shadow-sm py-2 mb-3">
    <div class="container d-flex justify-content-between align-items-center">
      <div class="brand">
        <i class="fa-solid fa-school fa-2x text-primary"></i>
        <div>
          <h4 class="mb-0">THCS Hàn Thuyên</h4>
          
        </div>
      </div>
      <div class="d-flex gap-2 align-items-center">
        <div id="sync-indicator" class="me-2"><span class="badge bg-secondary">Local</span></div>
        <div id="current-user"></div>
        <button id="btn-open-login" class="btn btn-outline-primary btn-sm">Đăng nhập</button>
        <button id="btn-open-signup" class="btn btn-outline-success btn-sm">Đăng ký</button>
        <button id="btn-users-mgmt" class="btn btn-outline-info btn-sm" style="display:none">Người dùng</button>
        <button id="btn-logout" class="btn btn-outline-danger btn-sm" style="display:none">Đăng xuất</button>
      </div>
    </div>
  </div>

  <div class="container-app">
    <section class="hero mb-4 card-soft">
      <div style="flex:1">
        <h2 class="mb-1">Hệ thống Quản lý Cơ sở vật chất</h2>
        

        <div class="top-controls d-flex gap-2">
          <button id="btn-add-room" class="btn btn-primary"><i class="fa-solid fa-door-open me-2"></i>Thêm phòng</button>
          <button id="btn-add-asset" class="btn btn-outline-primary"><i class="fa-solid fa-box me-2"></i>Thêm thiết bị / vật tư</button>
          <button id="btn-add-req" class="btn btn-outline-warning"><i class="fa-solid fa-wrench me-2"></i>Tạo yêu cầu</button>
          <div class="ms-auto btn-group">
            <button id="btn-export-excel" class="btn btn-success"><i class="fa-solid fa-file-excel me-1"></i>Xuất Excel</button>
            <button id="btn-clear-data" class="btn btn-outline-danger" title="Xoá toàn bộ data (demo)"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      </div>
      <img src="https://images.pexels.com/photos/256395/pexels-photo-256395.jpeg" alt="Banner">
    </section>

    <div id="stats-area" class="row g-3 mb-4">
      <div class="col-md-4"><div class="card-soft h-100"><small class="small-muted">Tổng phòng</small><h3 id="stat-rooms">0</h3></div></div>
      <div class="col-md-4"><div class="card-soft h-100"><small class="small-muted">Tổng tài sản</small><h3 id="stat-assets">0</h3></div></div>
      <div class="col-md-4"><div class="card-soft h-100"><small class="small-muted">Yêu cầu đang mở</small><h3 id="stat-requests">0</h3></div></div>
    </div>

    <div class="row g-3">
      <div class="col-lg-7">
        <div class="card-soft">
          <ul class="nav nav-tabs mb-3" id="mainTabs">
            <li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" href="#tab-rooms">Phòng</a></li>
            <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tab-assets">Tài sản</a></li>
            <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tab-inv">Kho (Vật tư)</a></li>
            <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tab-reqs">Yêu cầu</a></li>
            <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tab-logs">Lịch sử</a></li>
          </ul>

          <div class="tab-content">
            <!-- Rooms -->
            <div class="tab-pane fade show active" id="tab-rooms">
              <div class="d-flex mb-2 gap-2">
                <input id="search-rooms" class="form-control form-control-sm" placeholder="Tìm phòng...">
                <button id="btn-refresh-rooms" class="btn btn-sm btn-outline-secondary">Làm mới</button>
              </div>
              <div class="table-responsive">
                <table class="table table-hover" id="tbl-rooms">
                  <thead>
                    <tr>
                      <th data-col="id">Mã <i class="fa-solid fa-filter col-filter-icon" data-table="rooms" data-col="id" title="Lọc cột"></i></th>
                      <th data-col="name">Tên <i class="fa-solid fa-filter col-filter-icon" data-table="rooms" data-col="name"></i></th>
                      <th data-col="capacity">Sức chứa <i class="fa-solid fa-filter col-filter-icon" data-table="rooms" data-col="capacity"></i></th>
                      <th data-col="notes">Ghi chú <i class="fa-solid fa-filter col-filter-icon" data-table="rooms" data-col="notes"></i></th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody id="rooms-tbody"></tbody>
                </table>
              </div>
            </div>

            <!-- Assets -->
            <div class="tab-pane fade" id="tab-assets">
              <div class="d-flex mb-2 gap-2">
                <select id="filter-asset-status" class="form-select form-select-sm" style="max-width:160px">
                  <option value="">Tất cả</option><option value="normal">Bình thường</option><option value="broken">Hỏng</option><option value="maintenance">Bảo trì</option>
                </select>
                <input id="search-assets" class="form-control form-control-sm" placeholder="Tìm tài sản...">
              </div>
              <div class="table-responsive">
                <table class="table table-hover align-middle" id="tbl-assets">
                  <thead>
                    <tr>
                      <th data-col="id">ID <i class="fa-solid fa-filter col-filter-icon" data-table="assets" data-col="id"></i></th>
                      <th data-col="name">Tên <i class="fa-solid fa-filter col-filter-icon" data-table="assets" data-col="name"></i></th>
                      <th data-col="category">Loại <i class="fa-solid fa-filter col-filter-icon" data-table="assets" data-col="category"></i></th>
                      <th data-col="room">Phòng <i class="fa-solid fa-filter col-filter-icon" data-table="assets" data-col="room"></i></th>
                      <th data-col="status">Trạng thái <i class="fa-solid fa-filter col-filter-icon" data-table="assets" data-col="status"></i></th>
                      <th>Ảnh</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody id="assets-tbody"></tbody>
                </table>
              </div>
            </div>

            <!-- Inventory -->
            <div class="tab-pane fade" id="tab-inv">
              <div class="mb-2 d-flex gap-2">
                <input id="search-inv" class="form-control form-control-sm" placeholder="Tìm vật tư...">
                <button id="btn-add-inv" class="btn btn-sm btn-outline-success">Thêm vật tư</button>
              </div>
              <div class="table-responsive">
                <table class="table table-hover" id="tbl-inv">
                  <thead>
                    <tr>
                      <th data-col="id">Mã <i class="fa-solid fa-filter col-filter-icon" data-table="inv" data-col="id"></i></th>
                      <th data-col="name">Tên <i class="fa-solid fa-filter col-filter-icon" data-table="inv" data-col="name"></i></th>
                      <th data-col="category">Loại <i class="fa-solid fa-filter col-filter-icon" data-table="inv" data-col="category"></i></th>
                      <th data-col="qty">Số lượng <i class="fa-solid fa-filter col-filter-icon" data-table="inv" data-col="qty"></i></th>
                      <th data-col="unit">Đơn vị <i class="fa-solid fa-filter col-filter-icon" data-table="inv" data-col="unit"></i></th>
                      <th data-col="price">Giá nhập <i class="fa-solid fa-filter col-filter-icon" data-table="inv" data-col="price"></i></th>
                      <th data-col="vendor">Nhà cung cấp <i class="fa-solid fa-filter col-filter-icon" data-table="inv" data-col="vendor"></i></th>
                      <th data-col="importDate">Ngày nhập <i class="fa-solid fa-filter col-filter-icon" data-table="inv" data-col="importDate"></i></th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody id="inv-tbody"></tbody>
                </table>
              </div>
            </div>

            <!-- Requests -->
            <div class="tab-pane fade" id="tab-reqs">
              <div class="d-flex mb-2 gap-2">
                <select id="filter-req-status" class="form-select form-select-sm" style="max-width:160px">
                  <option value="">Tất cả</option><option value="open">Mới</option><option value="in_progress">Đang xử lý</option><option value="done">Hoàn tất</option>
                </select>
                <input id="search-req" class="form-control form-control-sm" placeholder="Tìm yêu cầu...">
              </div>
              <div class="table-responsive">
                <table class="table table-hover" id="tbl-reqs">
                  <thead>
                    <tr>
                      <th data-col="id">Mã <i class="fa-solid fa-filter col-filter-icon" data-table="reqs" data-col="id"></i></th>
                      <th data-col="title">Tiêu đề <i class="fa-solid fa-filter col-filter-icon" data-table="reqs" data-col="title"></i></th>
                      <th data-col="room">Phòng <i class="fa-solid fa-filter col-filter-icon" data-table="reqs" data-col="room"></i></th>
                      <th data-col="reporter">Người báo <i class="fa-solid fa-filter col-filter-icon" data-table="reqs" data-col="reporter"></i></th>
                      <th data-col="status">Trạng thái <i class="fa-solid fa-filter col-filter-icon" data-table="reqs" data-col="status"></i></th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody id="reqs-tbody"></tbody>
                </table>
              </div>
            </div>

            <!-- Logs -->
            <div class="tab-pane fade" id="tab-logs">
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead><tr><th>Thời gian</th><th>Người</th><th>Hành động</th><th>Mô tả</th></tr></thead>
                  <tbody id="logs-tbody"></tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="col-lg-5" id="right-col">
        <div class="card-soft">
          <div class="row g-2 mb-3">
            <div class="col-6"><img src="https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg" class="img-fluid rounded" alt=""></div>
            <div class="col-6"><img src="https://images.pexels.com/photos/256455/pexels-photo-256455.jpeg" class="img-fluid rounded" alt=""></div>
            <div class="col-6"><img src="https://images.pexels.com/photos/256395/pexels-photo-256395.jpeg" class="img-fluid rounded" alt=""></div>
            <div class="col-6"><img src="https://images.pexels.com/photos/256401/pexels-photo-256401.jpeg" class="img-fluid rounded" alt=""></div>
          </div>
          <canvas id="chartStatus" height="260"></canvas>
        </div>
      </div>
    </div>

    <footer>© <span id="year"></span> THCS Hàn Thuyên — Local</footer>
  </div>

  <!-- Modals (unchanged, same as your original) -->
  <!-- Room Modal -->
  <div class="modal fade" id="modalRoom" tabindex="-1"><div class="modal-dialog modal-md modal-dialog-centered"><div class="modal-content">
    <form id="form-room" class="p-3">
      <h5>Thêm / Sửa phòng</h5>
      <input name="id" class="form-control mb-2" placeholder="Mã phòng (vd: R101)" required>
      <input name="name" class="form-control mb-2" placeholder="Tên phòng" required>
      <input name="capacity" type="number" class="form-control mb-2" placeholder="Sức chứa">
      <textarea name="notes" class="form-control mb-2" placeholder="Ghi chú"></textarea>
      <div class="d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-outline-secondary btn-cancel" data-target="modalRoom">Hủy</button>
        <button type="submit" class="btn btn-primary btn-save" data-target="modalRoom">Lưu</button>
      </div>
    </form>
  </div></div></div>

  <!-- Asset/Inventory Modal (combined) -->
  <div class="modal fade" id="modalAsset" tabindex="-1"><div class="modal-dialog modal-lg modal-dialog-centered"><div class="modal-content">
    <form id="form-asset" class="p-3">
      <h5>Thêm / Sửa thiết bị hoặc vật tư</h5>
      <div class="row g-2">
        <div class="col-md-4"><input name="id" class="form-control" placeholder="Mã (tự tạo nếu bỏ trống)"></div>
        <div class="col-md-8"><input name="name" class="form-control" placeholder="Tên"></div>
        <div class="col-md-4"><input name="category" class="form-control" placeholder="Loại (ví dụ: Điện tử, Dụng cụ)"></div>
        <div class="col-md-4"><input name="room" class="form-control" placeholder="Gán phòng (để trống → đưa vào kho)"></div>
        <div class="col-md-4"><input name="quantity" type="number" class="form-control" placeholder="Số lượng (vật tư)"></div>
        <div class="col-md-4"><input name="unit" class="form-control" placeholder="Đơn vị (cái, cuộn, bộ...)"></div>
        <div class="col-md-4"><input name="price" type="number" class="form-control" placeholder="Giá nhập (VND)"></div>
        <div class="col-md-4"><input name="vendor" class="form-control" placeholder="Nhà cung cấp"></div>
        <div class="col-md-4"><input name="importDate" type="date" class="form-control"></div>
        <div class="col-md-6"><input name="image" type="file" accept="image/*" class="form-control form-control-sm"></div>
        <div class="col-12"><textarea name="desc" class="form-control" rows="3" placeholder="Mô tả / ghi chú"></textarea></div>
      </div>
      <div class="mt-2 text-end">
        <button type="button" class="btn btn-outline-secondary btn-cancel" data-target="modalAsset">Hủy</button>
        <button type="submit" class="btn btn-primary btn-save" data-target="modalAsset">Lưu</button>
      </div>
    </form>
  </div></div></div>

  <!-- Inventory export modal (xuất kho) -->
  <div class="modal fade" id="modalExportInv" tabindex="-1"><div class="modal-dialog modal-md modal-dialog-centered"><div class="modal-content">
    <form id="form-export-inv" class="p-3">
      <h5>Xuất kho → Gán vào phòng</h5>
      <div class="mb-2"><label class="form-label">Vật tư</label><select id="export-inv-select" class="form-select"></select></div>
      <div class="mb-2"><label class="form-label">Số lượng xuất</label><input id="export-qty" type="number" class="form-control" value="1" min="1"></div>
      <div class="mb-2"><label class="form-label">Gán vào phòng</label><select id="export-room" class="form-select"></select></div>
      <div class="d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-outline-secondary btn-cancel" data-target="modalExportInv">Hủy</button>
        <button type="submit" class="btn btn-primary btn-save" data-target="modalExportInv">Xuất kho</button>
      </div>
    </form>
  </div></div></div>

  <!-- Request Modal (Teacher only create; tech/admin cannot create) -->
  <div class="modal fade" id="modalReq" tabindex="-1"><div class="modal-dialog modal-md modal-dialog-centered"><div class="modal-content">
    <form id="form-req" class="p-3" enctype="multipart/form-data">
      <h5>Tạo / Sửa yêu cầu bảo trì</h5>
      <input name="id" class="form-control mb-2" placeholder="Mã yêu cầu (vd: REQ-001)" required>
      <input name="title" class="form-control mb-2" placeholder="Tiêu đề" required>
      <input name="room" class="form-control mb-2" placeholder="Phòng">
      <input name="reporter" class="form-control mb-2" placeholder="Người báo">
      <input name="img" type="file" accept="image/*" class="form-control mb-2">
      <textarea name="desc" class="form-control mb-2" placeholder="Mô tả"></textarea>
      <select name="status" class="form-select mb-2"><option value="open">Mới</option><option value="in_progress">Đang xử lý</option><option value="done">Hoàn tất</option></select>
      <div class="d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-outline-secondary btn-cancel" data-target="modalReq">Hủy</button>
        <button type="submit" class="btn btn-primary btn-save" data-target="modalReq">Lưu</button>
      </div>
    </form>
  </div></div></div>

  <!-- Users management modal (admin view-only manage users) -->
  <div class="modal fade" id="modalUsers" tabindex="-1"><div class="modal-dialog modal-lg modal-dialog-centered"><div class="modal-content p-3">
    <h5>Quản lý người dùng (Admin)</h5>
    <div class="mb-2">
      <button id="btn-create-user" class="btn btn-sm btn-success">Tạo người dùng mới</button>
    </div>
    <div class="table-responsive"><table class="table table-sm"><thead><tr><th>Email</th><th>Họ tên</th><th>Vai trò</th><th>Phòng gán (teacher)</th><th>Hành động</th></tr></thead><tbody id="users-tbody"></tbody></table></div>
    <div class="d-flex justify-content-end"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Đóng</button></div>
  </div></div></div>

  <!-- Create user modal (admin) -->
  <div class="modal fade" id="modalCreateUser" tabindex="-1"><div class="modal-dialog modal-md modal-dialog-centered"><div class="modal-content p-3">
    <h5>Tạo người dùng</h5>
    <input id="cu-email" class="form-control mb-2" placeholder="Email">
    <input id="cu-password" class="form-control mb-2" placeholder="Mật khẩu">
    <input id="cu-name" class="form-control mb-2" placeholder="Tên hiển thị">
    <select id="cu-role" class="form-select mb-2"><option value="teacher">Teacher</option><option value="technician">Technician</option><option value="admin">Admin</option></select>
    <input id="cu-rooms" class="form-control mb-2" placeholder="Phòng gán (comma-separated) - chỉ cho Teacher">
    <div class="d-flex justify-content-end gap-2"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Hủy</button><button id="cu-save" class="btn btn-primary">Tạo</button></div>
  </div></div></div>

  <!-- Login / Signup -->
  <div class="modal fade" id="modalLogin" tabindex="-1"><div class="modal-dialog modal-sm modal-dialog-centered"><div class="modal-content p-3">
    <h5>Đăng nhập</h5>
    <input id="login-email" class="form-control mb-2" placeholder="Email">
    <input id="login-password" type="password" class="form-control mb-2" placeholder="Mật khẩu">
    <div class="d-flex justify-content-end gap-2"><button id="login-btn" type="button" class="btn btn-primary">Đăng nhập</button><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Hủy</button></div>
  </div></div></div>

  <div class="modal fade" id="modalSignup" tabindex="-1"><div class="modal-dialog modal-md modal-dialog-centered"><div class="modal-content p-3">
    <h5>Đăng ký</h5>
    <input id="su-email" class="form-control mb-2" placeholder="Email">
    <input id="su-password" type="password" class="form-control mb-2" placeholder="Mật khẩu">
    <input id="su-name" class="form-control mb-2" placeholder="Tên hiển thị">
    <select id="su-role" class="form-select mb-2"><option value="teacher">Teacher</option><option value="technician">Technician</option><option value="admin">Admin</option></select>
    <input id="su-rooms" class="form-control mb-2" placeholder="Phòng gán (vd: R101,R102) - chỉ cho Teacher">
    <div class="d-flex justify-content-end gap-2"><button id="su-btn" type="button" class="btn btn-success">Đăng ký</button><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Hủy</button></div>
  </div></div></div>

  <!-- View modal -->
  <div class="modal fade" id="modalView" tabindex="-1"><div class="modal-dialog modal-md modal-dialog-centered"><div class="modal-content"><div class="modal-body" id="modalViewBody"></div></div></div></div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

  <script>
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
  const el = id => document.getElementById(id);
  const nowIso = ()=> new Date().toISOString();
  const save = (k,v)=> localStorage.setItem(k, JSON.stringify(v));
  const load = (k,def=[])=> { try{ const t=localStorage.getItem(k); return t?JSON.parse(t):def }catch(e){return def} };
  const uid = (p='X')=> p + Date.now().toString().slice(-6) + Math.floor(Math.random()*900+100);
  const notify = msg => alert(msg);

  // Seed minimal data (if empty)
  (function seed(){
    if(!localStorage.getItem(LS_KEYS.users)){
      const users = [
        { id: uid('U'), email:'admin@local', password:'admin123', displayName:'BGH Admin', role:'admin', username:'admin', assignedRooms: [] },
        { id: uid('U'), email:'tech@local', password:'tech123', displayName:'NV Kỹ thuật', role:'technician', username:'tech', assignedRooms: [] },
        { id: uid('U'), email:'teacher1@local', password:'teach123', displayName:'GV Nguyễn', role:'teacher', username:'gvnguyen', assignedRooms: ['R101'] }
      ];
      save(LS_KEYS.users, users);
    }
    if(!localStorage.getItem(LS_KEYS.rooms)) save(LS_KEYS.rooms, [
      { id:'R101', name:'Lớp 10A', capacity:35, notes:'Dãy A' },
      { id:'R102', name:'Lớp 10B', capacity:32, notes:'Dãy B' }
    ]);
    if(!localStorage.getItem(LS_KEYS.assets)) save(LS_KEYS.assets, [
      { id:'AS-001', name:'Máy chiếu', category:'Thiết bị', room:'R101', status:'normal', purchased:'2020-09-01', price:4500000, vendor:'Công ty A', warranty:24, desc:'Máy chiếu lớp 10A', image:'', updatedAt: nowIso() }
    ]);
    if(!localStorage.getItem(LS_KEYS.inventory)) save(LS_KEYS.inventory, [
      { id:'INV-001', name:'Bóng đèn dự phòng', category:'Vật tư', qty:20, unit:'cái', price:20000, vendor:'Công ty B', importDate:'2025-01-01', notes:'Kho chính', updatedAt: nowIso() }
    ]);
    if(!localStorage.getItem(LS_KEYS.requests)) save(LS_KEYS.requests, []);
    if(!localStorage.getItem(LS_KEYS.logs)) save(LS_KEYS.logs, []);
  })();

  // Current user
  let currentUser = load(LS_KEYS.current, null);

  // UI helpers for role
  function renderCurrentUser(user){
    const cu = el('current-user');
    const loginBtn = el('btn-open-login'), signupBtn = el('btn-open-signup'), logoutBtn = el('btn-logout'), usersMgmtBtn = el('btn-users-mgmt');
    if(user){
      cu.innerHTML = `<span class="badge bg-light text-dark">${user.displayName || user.username} · ${user.role}</span>`;
      loginBtn.style.display='none'; signupBtn.style.display='none'; logoutBtn.style.display='inline-block';
      usersMgmtBtn.style.display = user.role==='admin' ? 'inline-block' : 'none';
    } else {
      cu.innerHTML = '';
      loginBtn.style.display='inline-block'; signupBtn.style.display='inline-block'; logoutBtn.style.display='none';
      usersMgmtBtn.style.display='none';
    }
  }

  function applyRoleUI(role){
    const isAdmin = role==='admin';
    const isTech = role==='technician';
    const isTeacher = role==='teacher';

    el('btn-add-room').style.display = isTech ? 'inline-block' : 'none';
    el('btn-add-asset').style.display = isTech ? 'inline-block' : 'none';
    el('btn-add-req').style.display = isTeacher ? 'inline-block' : 'none';
    el('btn-export-excel').style.display = isTech ? 'inline-block' : 'none';
    el('btn-clear-data').style.display = isTech ? 'inline-block' : 'none';
    el('btn-add-inv').style.display = isTech ? 'inline-block' : 'none';
    el('stats-area').classList.toggle('hidden', !isTech);
    el('right-col').classList.toggle('hidden', !isTech);
    const logsTab = document.querySelector('a[href="#tab-logs"]');
    if(logsTab) logsTab.parentElement.style.display = isTech ? 'inline-block' : 'none';
  }

  function logAction(action, desc){
    const logs = load(LS_KEYS.logs, []);
    logs.push({ ts: nowIso(), user: currentUser ? currentUser.username : 'anonymous', action, desc });
    save(LS_KEYS.logs, logs);
  }

  /**************** CRUD wrappers ****************/
  function loadRooms(){ return load(LS_KEYS.rooms, []); }
  function saveRooms(v){ save(LS_KEYS.rooms, v); }

  function loadAssets(){ return load(LS_KEYS.assets, []); }
  function saveAssets(v){ save(LS_KEYS.assets, v); }

  function loadInv(){ return load(LS_KEYS.inventory, []); }
  function saveInv(v){ save(LS_KEYS.inventory, v); }

  function loadReqs(){ return load(LS_KEYS.requests, []); }
  function saveReqs(v){ save(LS_KEYS.requests, v); }

  function loadUsers(){ return load(LS_KEYS.users, []); }
  function saveUsers(v){ save(LS_KEYS.users, v); }

  function addRoom(r){ const a = loadRooms(); a.push(r); saveRooms(a); logAction('add_room', `Thêm ${r.id}`); }
  function updateRoom(id, patch){ const a = loadRooms(); const i=a.findIndex(x=>x.id===id); if(i>-1){ a[i] = {...a[i], ...patch}; saveRooms(a); logAction('update_room', `Sửa ${id}`); } }
  function deleteRoom(id){ let a = loadRooms(); a = a.filter(x=>x.id!==id); saveRooms(a); logAction('delete_room', `Xóa ${id}`); }

  // Asset functions (assets are items assigned to rooms)
  function addAsset(a){ const arr = loadAssets(); arr.push(a); saveAssets(arr); logAction('add_asset', `Thêm asset ${a.id}`); }
  function updateAsset(id, patch){ const arr = loadAssets(); const i = arr.findIndex(x=>x.id===id); if(i>-1){ arr[i] = {...arr[i], ...patch}; saveAssets(arr); logAction('update_asset', `Sửa asset ${id}`); } }
  function deleteAsset(id){ let arr = loadAssets(); arr = arr.filter(x=>x.id!==id); saveAssets(arr); logAction('delete_asset', `Xóa asset ${id}`); }

  // Inventory functions (items in stock with qty)
  function addInv(i){ const arr = loadInv(); arr.push(i); saveInv(arr); logAction('add_inv', `Thêm inv ${i.id}`); }
  function updateInv(id, patch){ const arr = loadInv(); const idx = arr.findIndex(x=>x.id===id); if(idx>-1){ arr[idx] = {...arr[idx], ...patch}; saveInv(arr); logAction('update_inv', `Sửa inv ${id}`); } }
  function deleteInv(id){ let arr = loadInv(); arr = arr.filter(x=>x.id!==id); saveInv(arr); logAction('delete_inv', `Xóa inv ${id}`); }

  // Requests
  function addRequest(r){ const arr = loadReqs(); arr.push({...r, created: nowIso()}); saveReqs(arr); logAction('add_request', `Tạo ${r.id}`); }
  function updateRequest(id, patch){ const arr = loadReqs(); const i = arr.findIndex(x=>x.id===id); if(i>-1){ arr[i] = {...arr[i], ...patch}; saveReqs(arr); logAction('update_request', `Sửa ${id}`); } }
  function deleteRequest(id){ let arr = loadReqs(); arr = arr.filter(x=>x.id!==id); saveReqs(arr); logAction('delete_request', `Xóa ${id}`); }

  /**************** Filtering (Excel-dropdown like) ****************/
  // filterState: { tableName: { colName: { values:Set, sort: 'asc'|'desc'|null } } }
  const filterState = { rooms:{}, assets:{}, inv:{}, reqs:{} };

  // Utility: get unique values for column accessor function
  function uniqueValues(rows, accessor){
    const s = new Set();
    rows.forEach(r => {
      const v = accessor(r);
      if(v === null || v === undefined) return;
      s.add(String(v));
    });
    return Array.from(s).sort((a,b)=> a.localeCompare(b));
  }

  // Show popup near icon
  function showFilterPopup(table, col, iconEl){
    hideFilterPopup();
    const rows = getRawRowsByTable(table);
    const accessor = r => (r[col]!==undefined && r[col]!==null) ? r[col] : '';
    const values = uniqueValues(rows, accessor);
    const popup = document.createElement('div');
    popup.className = 'filter-popup';
    popup.setAttribute('data-table', table);
    popup.setAttribute('data-col', col);

    // header with title and sort
    popup.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><strong>${col}</strong>
      <div class="filter-sort">
        <button class="btn btn-sm btn-outline-secondary fp-sort" data-sort="asc" title="Sort A→Z">A→Z</button>
        <button class="btn btn-sm btn-outline-secondary fp-sort" data-sort="desc" title="Sort Z→A">Z→A</button>
      </div>
    </div>
    <div class="filter-values"></div>
    <div class="fp-actions">
      <div><button class="btn btn-sm btn-outline-primary fp-apply">Áp dụng</button> <button class="btn btn-sm btn-outline-secondary fp-clear">Xóa</button></div>
      <button class="btn btn-sm btn-outline-danger fp-close">Đóng</button>
    </div>`;

    const valsDiv = popup.querySelector('.filter-values');
    values.forEach(v=>{
      const id = 'fv-'+Math.random().toString(36).slice(2,8);
      const label = document.createElement('label');
      label.innerHTML = `<input type="checkbox" data-val="${escapeHtml(v)}"> <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${v}</span>`;
      valsDiv.appendChild(label);
    });

    document.body.appendChild(popup);
    // position
    const rect = iconEl.getBoundingClientRect();
    popup.style.left = (rect.left) + 'px';
    popup.style.top = (rect.bottom + 6) + 'px';

    // wire events
    popup.querySelector('.fp-close').addEventListener('click', hideFilterPopup);
    popup.querySelector('.fp-clear').addEventListener('click', ()=>{
      if(!filterState[table]) filterState[table]={};
      filterState[table][col] = { values: new Set(), sort: null };
      hideFilterPopup();
      renderAll();
    });
    popup.querySelectorAll('.fp-sort').forEach(b=>{
      b.addEventListener('click', ()=>{
        if(!filterState[table]) filterState[table]={};
        filterState[table][col] = filterState[table][col] || { values: new Set(), sort: null };
        filterState[table][col].sort = b.dataset.sort;
        renderAll();
      });
    });
    popup.querySelector('.fp-apply').addEventListener('click', ()=>{
      const checked = Array.from(popup.querySelectorAll('input[type=checkbox]:checked')).map(i=>unescapeHtml(i.dataset.val||i.getAttribute('data-val')||i.value||''));
      if(!filterState[table]) filterState[table]={};
      filterState[table][col] = filterState[table][col] || { values: new Set(), sort: null };
      filterState[table][col].values = new Set(checked);
      hideFilterPopup();
      renderAll();
    });
  }

  function hideFilterPopup(){
    document.querySelectorAll('.filter-popup').forEach(n=>n.remove());
  }

  // escape helpers for putting into data attributes / HTML
  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function unescapeHtml(s){ return String(s).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>'); }

  // attach click on filter icons
  document.body.addEventListener('click', (e)=>{
    const icon = e.target.closest('.col-filter-icon');
    if(icon){
      const table = icon.dataset.table;
      const col = icon.dataset.col;
      showFilterPopup(table, col, icon);
      return;
    }
    // close popup on outside click
    if(!e.target.closest('.filter-popup')) hideFilterPopup();
  });

  // Apply filter state to a rows array based on table config
  function applyFilters(table, rows){
    const state = filterState[table] || {};
    let out = rows.slice();
    // column value filters
    Object.keys(state).forEach(col=>{
      const st = state[col];
      if(st && st.values && st.values.size>0){
        out = out.filter(r=>{
          const val = (r[col]===undefined || r[col]===null) ? '' : String(r[col]);
          return st.values.has(val);
        });
      }
      // sorting if set
      if(st && st.sort){
        out.sort((a,b)=>{
          const va = (a[col]===undefined||a[col]===null)?'':String(a[col]);
          const vb = (b[col]===undefined||b[col]===null)?'':String(b[col]);
          return st.sort === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        });
      }
    });
    return out;
  }

  // get raw rows for a table
  function getRawRowsByTable(table){
    if(table==='rooms') return loadRooms();
    if(table==='assets') return loadAssets();
    if(table==='inv') return loadInv();
    if(table==='reqs') return loadReqs();
    return [];
  }

  /**************** Rendering ****************/
  function renderAll(){
    renderRooms(); renderAssets(); renderInv(); renderReqs(); renderLogs(); renderChart();
    el('year').textContent = new Date().getFullYear();
  }

  function renderRooms(){
    const rows = loadRooms();
    const q = el('search-rooms').value.trim().toLowerCase();
    let filtered = rows.filter(r=>!q || (r.id + r.name).toLowerCase().includes(q));
    filtered = applyFilters('rooms', filtered);
    el('rooms-tbody').innerHTML = filtered.map((r, idx)=>`
      <tr class="${idx%2? 'zebra-row':''}">
        <td>${r.id}</td><td>${r.name}</td><td>${r.capacity||''}</td><td>${r.notes||''}</td>
        <td>${renderRoomActions(r)}</td>
      </tr>`).join('');
    el('stat-rooms').textContent = rows.length;
    const exportRoomSel = el('export-room');
    if(exportRoomSel){
      exportRoomSel.innerHTML = rows.map(r=>`<option value="${r.id}">${r.id} — ${r.name}</option>`).join('');
    }
  }

  function renderRoomActions(room){
    if(currentUser && currentUser.role==='technician'){
      return `<button class="btn btn-sm btn-outline-primary me-1" data-act="edit-room" data-id="${room.id}">Sửa</button>
              <button class="btn btn-sm btn-outline-danger" data-act="del-room" data-id="${room.id}">Xóa</button>`;
    }
    if(currentUser && currentUser.role==='teacher'){
      return `<button class="btn btn-sm btn-outline-primary me-1" data-act="edit-room" data-id="${room.id}">Sửa (capacity)</button>`;
    }
    return `<button class="btn btn-sm btn-outline-secondary" disabled title="Chỉ NV Kỹ thuật mới được sửa/xóa">Không có quyền</button>`;
  }

  function renderAssets(){
    let rows = loadAssets();
    const q = el('search-assets').value.trim().toLowerCase();
    const statusFilter = el('filter-asset-status').value;
    if(currentUser && currentUser.role==='teacher'){
      const assigned = currentUser.assignedRooms || [];
      rows = rows.filter(a => assigned.includes(a.room));
    }
    let filtered = rows.filter(a=> (!q || (a.id+a.name+(a.room||'')).toLowerCase().includes(q)) && (!statusFilter || a.status===statusFilter));
    filtered = applyFilters('assets', filtered);
    el('assets-tbody').innerHTML = filtered.map((a, idx)=>`
      <tr class="${idx%2? 'zebra-row':''}"><td>${a.id}</td><td>${a.name}</td><td>${a.category||''}</td><td>${a.room||''}</td><td>${a.status||''}</td>
        <td>${a.image? '<img src="'+a.image+'" class="asset-thumb">' : ''}</td>
        <td>${renderAssetActions(a)}</td></tr>`).join('');
    el('stat-assets').textContent = loadAssets().length;
  }

  function renderAssetActions(a){
    if(currentUser && currentUser.role==='technician'){
      return `<button class="btn btn-sm btn-outline-info me-1" data-act="view-asset" data-id="${a.id}">Xem</button>
              <button class="btn btn-sm btn-outline-primary me-1" data-act="edit-asset" data-id="${a.id}">Sửa</button>
              <button class="btn btn-sm btn-outline-danger" data-act="del-asset" data-id="${a.id}">Xóa</button>`;
    }
    if(currentUser && currentUser.role==='teacher'){
      return `<button class="btn btn-sm btn-outline-info me-1" data-act="view-asset" data-id="${a.id}">Xem</button>`;
    }
    return `<button class="btn btn-sm btn-outline-info" data-act="view-asset" data-id="${a.id}">Xem</button>`;
  }

  function renderInv(){
    const rows = loadInv();
    const q = el('search-inv').value.trim().toLowerCase();
    let filtered = rows.filter(i=> !q || (i.id + i.name + (i.category||'')).toLowerCase().includes(q));
    filtered = applyFilters('inv', filtered);
    el('inv-tbody').innerHTML = filtered.map((i,idx)=>`<tr class="${idx%2? 'zebra-row':''}"><td>${i.id}</td><td>${i.name}</td><td>${i.category||''}</td><td>${i.qty}</td><td>${i.unit||''}</td><td>${i.price? i.price.toLocaleString(): ''}</td><td>${i.vendor||''}</td><td>${i.importDate||''}</td><td>${renderInvActions(i)}</td></tr>`).join('');
  }

  function renderInvActions(item){
    if(currentUser && currentUser.role==='technician'){
      return `<button class="btn btn-sm btn-outline-primary me-1" data-act="edit-inv" data-id="${item.id}">Sửa</button>
              <button class="btn btn-sm btn-outline-success me-1" data-act="export-inv" data-id="${item.id}">Xuất kho</button>
              <button class="btn btn-sm btn-outline-danger" data-act="del-inv" data-id="${item.id}">Xóa</button>`;
    }
    if(currentUser && currentUser.role==='teacher') return `<button class="btn btn-sm btn-outline-secondary" disabled>Không có quyền</button>`;
    return `<button class="btn btn-sm btn-outline-secondary" disabled>Không có quyền</button>`;
  }

  function renderReqs(){
    const rows = loadReqs();
    const q = el('search-req').value.trim().toLowerCase(); const statusFilter = el('filter-req-status').value;
    let visible = rows;
    if(currentUser && currentUser.role==='teacher'){
      const assigned = currentUser.assignedRooms || [];
      visible = rows.filter(r => assigned.includes(r.room) || r.reporter === currentUser.username);
    }
    let filtered = visible.filter(r=> (!q || (r.id+r.title+r.reporter).toLowerCase().includes(q)) && (!statusFilter || r.status===statusFilter));
    filtered = applyFilters('reqs', filtered);
    el('reqs-tbody').innerHTML = filtered.map((r,idx)=>`<tr class="${idx%2? 'zebra-row':''}"><td>${r.id}</td><td>${r.title}</td><td>${r.room||''}</td><td>${r.reporter||''}</td><td>${r.status}</td><td>${renderReqActions(r)}</td></tr>`).join('');
    const openCount = rows.filter(x=>x.status==='open').length;
    el('stat-requests').textContent = openCount;
  }

  function renderReqActions(r){
    if(currentUser && currentUser.role==='technician'){
      return `<button class="btn btn-sm btn-outline-info me-1" data-act="view-req" data-id="${r.id}">Xem</button>
              <button class="btn btn-sm btn-outline-primary me-1" data-act="edit-req" data-id="${r.id}">Sửa</button>
              <button class="btn btn-sm btn-outline-danger" data-act="del-req" data-id="${r.id}">Xóa</button>`;
    }
    return `<button class="btn btn-sm btn-outline-info" data-act="view-req" data-id="${r.id}">Xem</button>`;
  }

  function renderLogs(){
    const rows = load(LS_KEYS.logs, []).slice().reverse();
    el('logs-tbody').innerHTML = rows.map(l=>`<tr><td>${l.ts}</td><td>${l.user}</td><td>${l.action}</td><td>${l.desc}</td></tr>`).join('');
  }

  // Chart
  let chart = null;
  function renderChart(){
    const rows = loadReqs();
    const counts = { open:0, in_progress:0, done:0 };
    rows.forEach(r=> counts[r.status] = (counts[r.status]||0) + 1);
    const ctx = el('chartStatus').getContext('2d');
    if(chart) chart.destroy();
    chart = new Chart(ctx, { type:'doughnut', data:{ labels:['Mới','Đang xử lý','Hoàn tất'], datasets:[{ data:[counts.open, counts.in_progress, counts.done], backgroundColor:['#ffc107','#0d6efd','#198754'] }] }, options:{responsive:true, plugins:{legend:{position:'bottom'}}} });
  }

  /**************** Forms handling & role enforcement (adjusted) ****************/
  function hideModal(id){
    const m = document.getElementById(id);
    if(!m) return;
    const bs = bootstrap.Modal.getInstance(m) || new bootstrap.Modal(m);
    bs.hide();
  }
  function resetForm(form){
    try{ form.reset(); }catch(e){}
  }

  // Room form
  el('form-room').addEventListener('submit', (e)=>{
    e.preventDefault();
    const f = e.target;
    const room = { id: f['id'].value.trim(), name: f['name'].value.trim(), capacity: Number(f['capacity'].value)||0, notes: f['notes'].value.trim() };
    const rooms = loadRooms();
    const exists = rooms.some(r=>r.id===room.id);
    if(exists){
      if(currentUser && currentUser.role==='technician'){
        updateRoom(room.id, room);
      } else if(currentUser && currentUser.role==='teacher'){
        updateRoom(room.id, { capacity: room.capacity, notes: room.notes });
      } else {
        notify('Bạn không có quyền sửa phòng');
        return;
      }
    } else {
      if(currentUser && currentUser.role==='technician'){
        addRoom(room);
      } else {
        notify('Chỉ NV Kỹ thuật được thêm phòng mới');
        return;
      }
    }
    hideModal('modalRoom'); resetForm(f); renderAll();
  });

  // Asset/Inventory form combined
  function fileToBase64(file){ return new Promise((res, rej)=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.onerror=rej; fr.readAsDataURL(file); }); }

  el('form-asset').addEventListener('submit', async (e)=>{
    e.preventDefault();
    if(!currentUser || currentUser.role!=='technician'){ notify('Chỉ NV Kỹ thuật được thao tác vật tư/tài sản'); return; }
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
    if(file){ try{ img = await fileToBase64(file); }catch(e){} }

    // Determine whether this is editing an existing asset/inv
    const existingAsset = providedId ? loadAssets().find(x=>x.id===providedId) : null;
    const existingInvByNameCat = loadInv().find(x=>x.name.toLowerCase()===name.toLowerCase() && x.category===category);

    if(room){
      // If room specified => create assets (qty items) assigned to room
      if(existingAsset){
        // Updating existing asset -> update fields (do not change into inventory)
        updateAsset(existingAsset.id, { name, category, room, price, vendor, purchased: importDate, desc, image: img, updatedAt: nowIso() });
        notify('Đã cập nhật tài sản ' + existingAsset.id);
      } else {
        for(let i=0;i<qty;i++){
          const newId = providedId ? providedId + (qty>1?('-'+(i+1)):'') : ('AS-'+Date.now().toString().slice(-6) + '-' + Math.floor(Math.random()*900+100));
          const asset = { id: newId, name, category, room, status:'normal', purchased: importDate, price, vendor, warranty:0, desc, image: img, updatedAt: nowIso() };
          addAsset(asset);
        }
        notify('Đã tạo ' + qty + ' tài sản gán vào ' + room);
      }
    } else {
      // No room => treat as Inventory addition or conversion from existing asset
      if(existingAsset){
        // Convert asset -> inventory: remove asset, add/increment inventory
        deleteAsset(existingAsset.id);
        // find inventory record by name+category
        const invs = loadInv();
        const match = invs.find(x=>x.name.toLowerCase()===existingAsset.name.toLowerCase() && x.category===existingAsset.category);
        if(match){
          match.qty = (match.qty||0) + 1;
          match.updatedAt = nowIso();
          updateInv(match.id, match);
        } else {
          const newInv = { id: providedId || ('INV-'+Date.now().toString().slice(-6)), name: existingAsset.name, category: existingAsset.category||category, qty: 1, unit: unit||'', price: existingAsset.price||price||0, vendor: existingAsset.vendor||vendor||'', importDate: existingAsset.purchased||importDate||nowIso().slice(0,10), notes: existingAsset.desc||desc||'', image: existingAsset.image||img||'', updatedAt: nowIso() };
          addInv(newInv);
        }
        notify(`Đã chuyển asset ${existingAsset.id} về kho`);
      } else {
        // Create or update inventory
        if(existingInvByNameCat){
          existingInvByNameCat.qty = (existingInvByNameCat.qty || 0) + qty;
          existingInvByNameCat.updatedAt = nowIso();
          updateInv(existingInvByNameCat.id, existingInvByNameCat);
        } else {
          const inv = { id: providedId || ('INV-'+Date.now().toString().slice(-6)), name, category, qty, unit, price, vendor, importDate, notes: desc, image: img, updatedAt: nowIso() };
          addInv(inv);
        }
        notify('Đã thêm vào kho: ' + qty + ' x ' + name);
      }
    }

    hideModal('modalAsset'); resetForm(f); renderAll();
  });

  // Export inventory form (xuất kho) - UPDATED: auto-delete when qty reaches 0
  el('form-export-inv').addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!currentUser || currentUser.role!=='technician'){ notify('Chỉ NV Kỹ thuật được xuất kho'); return; }
    const f = e.target;
    const invId = el('export-inv-select').value;
    const qty = Number(el('export-qty').value) || 0;
    const room = el('export-room').value;
    if(!invId || qty<=0 || !room){ notify('Chọn vật tư, số lượng > 0 và phòng'); return; }
    const inv = loadInv().find(x=>x.id===invId);
    if(!inv) return notify('Không tìm thấy vật tư');
    if(inv.qty < qty) return notify('Không đủ số lượng trong kho');
    // reduce inventory
    inv.qty -= qty;
    inv.updatedAt = nowIso();
    if(inv.qty <= 0){
      // delete when reaches 0
      deleteInv(inv.id);
    } else {
      updateInv(inv.id, inv);
    }
    // create assets: create 'qty' assets assigned to room
    for(let i=0;i<qty;i++){
      const newId = 'AS-'+Date.now().toString().slice(-6) + '-' + Math.floor(Math.random()*900+100);
      const asset = { id: newId, name: inv.name, category: inv.category, room, status:'normal', purchased: inv.importDate || nowIso(), price: inv.price || 0, vendor: inv.vendor || '', warranty:0, desc: inv.notes||'', image: inv.image||'', updatedAt: nowIso() };
      addAsset(asset);
    }
    hideModal('modalExportInv'); resetForm(f); renderAll();
    notify('Đã xuất ' + qty + ' → ' + room);
  });

  // Request form (create allowed only for teacher; edit existing only tech)
  el('form-req').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const f = e.target;
    const id = f['id'].value.trim();
    const title = f['title'].value.trim();
    const room = f['room'].value.trim();
    const reporter = f['reporter'].value.trim() || (currentUser?currentUser.username:'anonymous');
    const file = f['img'].files[0];
    const desc = f['desc'].value.trim();
    const status = f['status'].value;
    const exists = loadReqs().some(r=>r.id===id);
    let img = '';
    if(file){ try{ img = await fileToBase64(file); }catch(e){} }
    const obj = { id, title, room, reporter, img, desc, status };

    if(exists){
      if(!currentUser || currentUser.role!=='technician'){ notify('Chỉ NV Kỹ thuật được chỉnh yêu cầu'); return; }
      updateRequest(id, obj);
    } else {
      if(!currentUser || currentUser.role!=='teacher'){ notify('Chỉ giáo viên được tạo phiếu báo hỏng'); return; }
      const assigned = currentUser.assignedRooms || [];
      if(room && !assigned.includes(room)){ notify('Bạn chỉ có thể tạo phiếu trong phòng được gán'); return; }
      addRequest(obj);
    }
    hideModal('modalReq'); resetForm(f); renderAll();
  });

  // Top buttons
  el('btn-add-room').addEventListener('click', ()=>{ el('form-room').reset(); el('form-room')['id'].removeAttribute('readonly'); new bootstrap.Modal(el('modalRoom')).show(); });
  el('btn-add-asset').addEventListener('click', ()=>{ if(!currentUser || currentUser.role!=='technician'){ notify('Chỉ NV Kỹ thuật được thêm thiết bị/vật tư'); return; } el('form-asset').reset(); el('form-asset')['id'].removeAttribute('readonly'); new bootstrap.Modal(el('modalAsset')).show(); });
  el('btn-add-req').addEventListener('click', ()=>{ if(!currentUser || currentUser.role!=='teacher'){ notify('Chỉ giáo viên được tạo phiếu'); return; } el('form-req').reset(); el('form-req')['reporter'].value = currentUser.username || ''; new bootstrap.Modal(el('modalReq')).show(); });
  el('btn-add-inv').addEventListener('click', ()=>{ if(!currentUser || currentUser.role!=='technician'){ notify('Chỉ NV Kỹ thuật'); return; } el('form-asset').reset(); new bootstrap.Modal(el('modalAsset')).show(); });

  // Search events
  el('search-rooms').addEventListener('input', debounce(()=>renderRooms(),200));
  el('search-assets').addEventListener('input', debounce(()=>renderAssets(),200));
  el('filter-asset-status').addEventListener('change', ()=>renderAssets());
  el('search-inv').addEventListener('input', debounce(()=>renderInv(),200));
  el('search-req').addEventListener('input', debounce(()=>renderReqs(),200));
  el('filter-req-status').addEventListener('change', ()=>renderReqs());

  /**************** Export Excel (technician only) ****************/
  function styleSheetProfessional(ws, headerRowCount=1){
    const range = ws['!ref'] ? XLSX.utils.decode_range(ws['!ref']) : {s:{c:0,r:0}, e:{c:0,r:0}};
    for(let C = range.s.c; C <= range.e.c; ++C){
      const cellAddr = XLSX.utils.encode_cell({r: headerRowCount-1, c: C});
      const cell = ws[cellAddr];
      if(!cell) continue;
      cell.s = cell.s || {};
      cell.s.font = { name: "Times New Roman", sz: 12, bold: true, color: { rgb: "FFFFFFFF" } };
      cell.s.fill = { fgColor: { rgb: "1F4E78" } };
      cell.s.alignment = { horizontal: "center", vertical: "center" };
      cell.s.border = { top:{style:"thin",color:{rgb:"000000"}}, left:{style:"thin",color:{rgb:"000000"}}, right:{style:"thin",color:{rgb:"000000"}}, bottom:{style:"thin",color:{rgb:"000000"}} };
    }
    for(let R = headerRowCount; R <= range.e.r; ++R){
      for(let C = range.s.c; C <= range.e.c; ++C){
        const addr = XLSX.utils.encode_cell({r:R,c:C});
        const cell = ws[addr];
        if(!cell) continue;
        cell.s = cell.s || {};
        cell.s.font = { name:"Times New Roman", sz:11, color:{rgb:"000000"} };
        cell.s.alignment = cell.s.alignment || { horizontal: "left", vertical: "center" };
        cell.s.border = { top:{style:"thin",color:{rgb:"000000"}}, left:{style:"thin",color:{rgb:"000000"}}, right:{style:"thin",color:{rgb:"000000"}}, bottom:{style:"thin",color:{rgb:"000000"}} };
      }
      if((R - headerRowCount) % 2 === 1){
        for(let C = range.s.c; C <= range.e.c; ++C){
          const addr = XLSX.utils.encode_cell({r:R,c:C});
          const cell = ws[addr];
          if(!cell) continue;
          cell.s.fill = cell.s.fill || { fgColor: { rgb: "F7F7F7" } };
        }
      }
    }
    const cols = [];
    for(let C = range.s.c; C <= range.e.c; ++C){
      let maxlen = 10;
      for(let R = range.s.r; R <= range.e.r; ++R){
        const cell = ws[XLSX.utils.encode_cell({r:R,c:C})];
        if(cell && cell.v){
          const v = String(cell.v);
          if(v.length > maxlen) maxlen = v.length;
        }
      }
      cols.push({ wch: Math.min(Math.max(maxlen + 2, 10), 40) });
    }
    ws['!cols'] = cols;
  }

  function sheetWithTitle(arr, title){
    const ws = XLSX.utils.json_to_sheet(arr, { origin: 1 });
    const colsCount = Object.keys(arr[0] || {}).length || 1;
    ws['A1'] = { v: title };
    ws['!merges'] = ws['!merges'] || [];
    ws['!merges'].push({ s: { r:0, c:0 }, e: { r:0, c: colsCount - 1 } });
    ws['!ref'] = XLSX.utils.encode_range(XLSX.utils.decode_range(ws['!ref']));
    return ws;
  }

  function exportExcel(){
    if(!currentUser || currentUser.role!=='technician'){ notify('Chỉ NV Kỹ thuật được xuất báo cáo'); return; }
    const rooms = loadRooms();
    const assets = loadAssets();
    const invs = loadInv();
    const reqs = loadReqs();
    const logs = load(LS_KEYS.logs, []);

    const wb = XLSX.utils.book_new();

    const roomsOrdered = rooms.map(r=>({Mã:r.id, Tên:r.name, Sức_chứa:r.capacity, Ghi_chú:r.notes||'', Created: r.created||'', Updated: r.updatedAt||''}));
    const wsRooms = sheetWithTitle(roomsOrdered, 'Danh sách phòng');
    styleSheetProfessional(wsRooms);
    XLSX.utils.book_append_sheet(wb, wsRooms, 'Rooms');

    const assetsOrdered = assets.map(a=>({ID:a.id, Tên:a.name, Loại:a.category||'', Phòng:a.room||'', Trạng_thái:a.status||'', Ngày_mua:a.purchased||'', Giá:a.price||0, Nhà_cung_cấp:a.vendor||'', Mô_tả:a.desc||'', Ảnh: a.image ? '(base64)' : '', Updated: a.updatedAt || ''}));
    const wsAssets = sheetWithTitle(assetsOrdered, 'Danh sách tài sản');
    styleSheetProfessional(wsAssets);
    XLSX.utils.book_append_sheet(wb, wsAssets, 'Assets');

    const invOrdered = invs.map(i=>({Mã:i.id, Tên:i.name, Loại:i.category||'', Số_lượng:i.qty, Đơn_vị:i.unit||'', Giá_nhập:i.price||0, Nhà_cung_cấp:i.vendor||'', Ngày_nhập:i.importDate||'', Ghi_chú:i.notes||''}));
    const wsInv = sheetWithTitle(invOrdered, 'Kho vật tư');
    styleSheetProfessional(wsInv);
    XLSX.utils.book_append_sheet(wb, wsInv, 'Inventory');

    const reqOrdered = reqs.map(r=>({Mã:r.id, Tiêu_đề:r.title, Phòng:r.room||'', Người_báo:r.reporter||'', Trạng_thái:r.status||'', Ngày_tạo:r.created||'', Mô_tả:r.desc||'', Ảnh: r.img? '(base64)':''}));
    const wsReq = sheetWithTitle(reqOrdered, 'Yêu cầu bảo trì');
    styleSheetProfessional(wsReq);
    XLSX.utils.book_append_sheet(wb, wsReq, 'Requests');

    const logOrdered = logs.map(l=>({Thời_gian:l.ts, Người:l.user, Hành_động:l.action, Mô_tả:l.desc}));
    const wsLog = XLSX.utils.json_to_sheet(logOrdered);
    styleSheetProfessional(wsLog);
    XLSX.utils.book_append_sheet(wb, wsLog, 'Logs');

    const wbout = XLSX.write(wb, {bookType:'xlsx', type:'array', cellStyles:true});
    saveAs(new Blob([wbout], {type:'application/octet-stream'}), `BaoCao_CoSoVatChat_${(new Date()).toISOString().slice(0,10)}.xlsx`);
    logAction('export_excel', 'Xuất Excel toàn bộ');
    notify('Đã xuất Excel (Rooms / Assets / Inventory / Requests / Logs).');
  }
  el('btn-export-excel').addEventListener('click', exportExcel);

  // Clear demo data (technician only)
  el('btn-clear-data').addEventListener('click', ()=>{
    if(!currentUser || currentUser.role!=='technician'){ notify('Chỉ NV Kỹ thuật được xóa dữ liệu'); return; }
    if(!confirm('Xoá toàn bộ data (phòng, tài sản, kho, yêu cầu, log)?')) return;
    save(LS_KEYS.rooms, []); save(LS_KEYS.assets, []); save(LS_KEYS.inventory, []); save(LS_KEYS.requests, []); save(LS_KEYS.logs, []);
    renderAll();
  });

  /**************** Auth & Users management ****************/
  function loadCurrent(){ return load(LS_KEYS.current, null); }
  function saveCurrent(u){ save(LS_KEYS.current, u); }
  function removeCurrent(){ localStorage.removeItem(LS_KEYS.current); }

  function doSignup(email, pass, name, role, roomsStr){
    const users = loadUsers();
    if(users.some(u=>u.email===email)) return {ok:false, reason:'exists'};
    const user = { id: uid('U'), email, password:pass, displayName: name||email.split('@')[0], role, username: email.split('@')[0], assignedRooms: (roomsStr||'').split(',').map(x=>x.trim()).filter(x=>x) };
    users.push(user); saveUsers(users);
    logAction('signup', `Đăng ký ${email}`);
    return {ok:true, user};
  }
  function doLogin(email, pass){
    const users = loadUsers();
    const u = users.find(x=>x.email===email && x.password===pass);
    if(!u) return null;
    saveCurrent(u); logAction('login', `Đăng nhập ${email}`);
    return u;
  }

  const modalLogin = new bootstrap.Modal(el('modalLogin'));
  const modalSignup = new bootstrap.Modal(el('modalSignup'));
  const modalUsers = new bootstrap.Modal(el('modalUsers'));
  const modalCreateUser = new bootstrap.Modal(el('modalCreateUser'));

  el('btn-open-login').addEventListener('click', ()=> modalLogin.show());
  el('btn-open-signup').addEventListener('click', ()=> modalSignup.show());
  el('btn-logout').addEventListener('click', ()=> {
    if(!confirm('Đăng xuất?')) return;
    removeCurrent(); currentUser = null; renderCurrentUser(null); applyRoleUI(null); renderAll();
  });

  el('login-btn').addEventListener('click', ()=>{ 
    const email = el('login-email').value.trim();
    const pass = el('login-password').value;
    const u = doLogin(email, pass);
    if(!u) return notify('Sai email hoặc mật khẩu');
    currentUser = u; renderCurrentUser(u); applyRoleUI(u.role); modalLogin.hide(); el('login-email').value=''; el('login-password').value=''; renderAll();
  });

  el('su-btn').addEventListener('click', ()=>{ 
    const email = el('su-email').value.trim();
    const pass = el('su-password').value;
    const name = el('su-name').value.trim();
    const role = el('su-role').value;
    const roomsStr = el('su-rooms').value.trim();
    if(!email || !pass){ notify('Nhập email và mật khẩu'); return; }
    const res = doSignup(email, pass, name, role, roomsStr);
    if(!res.ok) return notify('Email đã tồn tại');
    modalSignup.hide(); el('su-email').value=''; el('su-password').value=''; el('su-name').value=''; el('su-rooms').value='';
    notify('Đăng ký thành công. Vui lòng đăng nhập.');
  });

  // Users management (Admin can still manage user accounts)
  el('btn-users-mgmt').addEventListener('click', ()=> {
    if(!currentUser || currentUser.role!=='admin'){ notify('Chỉ Admin'); return; }
    renderUsersTable();
    modalUsers.show();
  });
  el('btn-create-user').addEventListener('click', ()=> { modalCreateUser.show(); });

  function renderUsersTable(){
    const users = loadUsers();
    el('users-tbody').innerHTML = users.map(u=>`<tr><td>${u.email}</td><td>${u.displayName}</td><td>${u.role}</td><td>${(u.assignedRooms||[]).join(', ')}</td><td><button class="btn btn-sm btn-outline-primary" data-act="edit-user" data-id="${u.id}">Sửa</button> <button class="btn btn-sm btn-outline-danger" data-act="del-user" data-id="${u.id}">Xóa</button></td></tr>`).join('');
  }

  el('cu-save').addEventListener('click', ()=>{
    const email = el('cu-email').value.trim();
    const pass = el('cu-password').value;
    const name = el('cu-name').value.trim();
    const role = el('cu-role').value;
    const roomsStr = el('cu-rooms').value.trim();
    if(!email || !pass){ notify('Nhập email và mật khẩu'); return; }
    const r = doSignup(email, pass, name, role, roomsStr);
    if(!r.ok) return notify('Email tồn tại');
    el('cu-email').value=''; el('cu-password').value=''; el('cu-name').value=''; el('cu-rooms').value='';
    renderUsersTable();
    modalCreateUser.hide();
  });

  document.body.addEventListener('click', (e)=>{
    const b = e.target.closest('button'); if(!b) return;
    const act = b.dataset.act, id = b.dataset.id;
    if(!act) return;
    try{
      if(act==='del-user'){ if(!currentUser || currentUser.role!=='admin'){ notify('Chỉ Admin'); return; } if(!confirm('Xóa user?')) return; const users = loadUsers().filter(u=>u.id!==id); saveUsers(users); renderUsersTable(); }
      if(act==='edit-user'){ const users = loadUsers(); const u = users.find(x=>x.id===id); if(!u) return; el('cu-email').value = u.email; el('cu-password').value = u.password; el('cu-name').value = u.displayName; el('cu-role').value = u.role; el('cu-rooms').value = (u.assignedRooms||[]).join(','); modalCreateUser.show(); const newUsers = users.filter(x=>x.id!==id); saveUsers(newUsers); }
    }catch(err){ notify(err.message); }
  });

  /**************** Event delegation for table buttons ****************/
  document.body.addEventListener('click', async (e)=>{
    const btn = e.target.closest('button'); if(!btn) return;
    const act = btn.dataset.act, id = btn.dataset.id;
    if(!act) return;
    try{
      if(act==='edit-room'){ const r = loadRooms().find(x=>x.id===id); if(!r) return notify('Không tìm thấy'); const f=el('form-room'); f['id'].value=r.id; f['id'].setAttribute('readonly','readonly'); f['name'].value=r.name; f['capacity'].value=r.capacity||''; f['notes'].value=r.notes||''; new bootstrap.Modal(el('modalRoom')).show(); }
      if(act==='del-room'){ if(!currentUser || currentUser.role!=='technician'){ notify('Chỉ NV Kỹ thuật được xóa phòng'); return; } if(!confirm('Xóa phòng?')) return; deleteRoom(id); renderAll(); }
      if(act==='view-asset'){ const a = loadAssets().find(x=>x.id===id); if(!a) return notify('Không tìm thấy'); const html = `<h5>${a.name}</h5><p>ID: ${a.id}<br>Phòng: ${a.room||''}<br>Loại: ${a.category||''}<br>Trạng thái: ${a.status||''}</p>${a.image? '<img src="'+a.image+'" style="width:100%;border-radius:8px">' : ''}<p class="small-muted">Ngày mua: ${a.purchased||''} · Giá: ${a.price? a.price.toLocaleString() : ''}</p><p>${a.desc||''}</p>`; el('modalViewBody').innerHTML = html; new bootstrap.Modal(el('modalView')).show(); }
      if(act==='edit-asset'){ const a = loadAssets().find(x=>x.id===id); if(!a) return notify('Không tìm thấy'); if(!currentUser || currentUser.role!=='technician'){ notify('Bạn không có quyền chỉnh sửa'); return; } const f=el('form-asset'); f['id'].value=a.id; f['name'].value=a.name; f['category'].value=a.category||''; f['room'].value=a.room||''; f['quantity'].value = 1; f['unit'].value=''; f['price'].value=a.price||''; f['vendor'].value=a.vendor||''; f['importDate'].value=a.purchased||''; f['desc'].value=a.desc||''; new bootstrap.Modal(el('modalAsset')).show(); }
      if(act==='del-asset'){ if(!currentUser || currentUser.role!=='technician'){ notify('Chỉ NV Kỹ thuật được xóa tài sản'); return; } if(!confirm('Xóa tài sản?')) return; deleteAsset(id); renderAll(); }
      if(act==='view-req'){ const r = loadReqs().find(x=>x.id===id); if(!r) return notify('Không tìm thấy'); const html = `<h5>${r.title}</h5><p>Mã: ${r.id}<br>Phòng: ${r.room||''}<br>Người báo: ${r.reporter||''}<br>Trạng thái: ${r.status}</p>${r.img? '<img src="'+r.img+'" style="width:100%;border-radius:8px">' : ''}<p>${r.desc||''}</p>`; el('modalViewBody').innerHTML = html; new bootstrap.Modal(el('modalView')).show(); }
      if(act==='edit-req'){ const r = loadReqs().find(x=>x.id===id); if(!r) return notify('Không tìm thấy'); if(!currentUser || currentUser.role!=='technician'){ notify('Chỉ NV Kỹ thuật được chỉnh yêu cầu'); return; } const f = el('form-req'); f['id'].value=r.id; f['id'].setAttribute('readonly','readonly'); f['title'].value=r.title; f['room'].value=r.room||''; f['reporter'].value=r.reporter||''; f['desc'].value=r.desc||''; f['status'].value=r.status||'open'; new bootstrap.Modal(el('modalReq')).show(); }
      if(act==='del-req'){ if(!currentUser || currentUser.role!=='technician'){ notify('Chỉ NV Kỹ thuật được xóa yêu cầu'); return; } if(!confirm('Xóa yêu cầu?')) return; deleteRequest(id); renderAll(); }

      if(act==='edit-inv'){ if(!currentUser || currentUser.role!=='technician'){ notify('Chỉ NV Kỹ thuật'); return; } const inv = loadInv().find(x=>x.id===id); if(!inv) return notify('Không tìm thấy'); const f = el('form-asset'); f['id'].value=inv.id; f['name'].value=inv.name; f['category'].value=inv.category||''; f['room'].value=''; f['quantity'].value = inv.qty||1; f['unit'].value = inv.unit||''; f['price'].value = inv.price||''; f['vendor'].value = inv.vendor||''; f['importDate'].value = inv.importDate||''; f['desc'].value = inv.notes||''; new bootstrap.Modal(el('modalAsset')).show();
      }
      if(act==='export-inv'){ if(!currentUser || currentUser.role!=='technician'){ notify('Chỉ NV Kỹ thuật'); return; } const inv = loadInv().find(x=>x.id===id); if(!inv) return notify('Không tìm thấy'); const sel = el('export-inv-select'); sel.innerHTML = loadInv().map(i=>`<option value="${i.id}">${i.id} — ${i.name} (qty:${i.qty})</option>`).join(''); el('export-qty').value = 1; const rooms = loadRooms(); el('export-room').innerHTML = rooms.map(r=>`<option value="${r.id}">${r.id} — ${r.name}</option>`).join(''); setTimeout(()=>{ el('export-inv-select').value = id; },50); new bootstrap.Modal(el('modalExportInv')).show();
      }
      if(act==='del-inv'){ if(!currentUser || currentUser.role!=='technician'){ notify('Chỉ NV Kỹ thuật'); return; } if(!confirm('Xóa vật tư?')) return; deleteInv(id); renderInv(); }
    }catch(err){ notify(err.message); }
  });

  /**************** Utilities ****************/
  function debounce(fn,ms=200){ let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), ms); } }

  // Hook up cancel buttons globally (close modal & reset forms)
  document.body.addEventListener('click', (e)=>{
    const b = e.target.closest('.btn-cancel');
    if(!b) return;
    const target = b.getAttribute('data-target');
    if(!target) return;
    const m = document.getElementById(target);
    if(m){
      const forms = m.querySelectorAll('form');
      forms.forEach(f=> resetForm(f));
      hideModal(target);
    }
  });

  // Initial load
  (function init(){
    currentUser = loadCurrent();
    renderCurrentUser(currentUser);
    applyRoleUI(currentUser ? currentUser.role : null);
    renderAll();
  })();

  </script>
</body>
</html>
