/**
 * @file dashboard-kho-modals.js
 * @description Quản lý toàn bộ logic đóng/mở và vẽ nội dung cho các cửa sổ Popup (Modals).
 * @version 2.7.26
 */

//#region MODALS & INTERACTIONS
// Bug3/5-fix: Hàm gom nhóm (aggregate) dữ liệu Nhập/Xuất trên Client do DB SP luôn trả về chi tiết.
/**
 * @file dashboard-kho-modals.js
 * @description Quản lý tất cả các modal chi tiết và panel drill-down của Dashboard Kho.
 * @version 2.7.52
 */

/** Tổng hợp số liệu nhập kho theo nhóm (itemcode, khách hàng) cho modal Nhập kho chi tiết. */
function aggregateNhapData(rows, activeKey) {
    if (activeKey === "all") return rows;
    var groups = {};
    if (activeKey === "date") {
        rows.forEach(function (r) {
            var parsed = parseDate(r.NgayNhap);
            var key = parsed ? asIsoDate(parsed) : "(Không có ngày)";
            if (!groups[key]) {
                groups[key] = { Ngay: key, SoPhieu: new Set(), SoVT: new Set(), SLNhap: 0, GiaTri: 0 };
            }
            var g = groups[key];
            if (r.PINCC) g.SoPhieu.add(r.PINCC);
            if (r.ItemCode) g.SoVT.add(r.ItemCode);
            g.SLNhap += toNumber(r.SoLuong);
            g.GiaTri += toNumber(r.GiaTri);
        });
        return Object.keys(groups).map(function (k, i) {
            var g = groups[k];
            return {
                STT: i + 1,
                Ngay: g.Ngay,
                SoPhieu: g.SoPhieu.size,
                SoVT: g.SoVT.size,
                SLNhap: g.SLNhap,
                GiaTri: g.GiaTri
            };
        });
    } else if (activeKey === "po") {
        rows.forEach(function (r) {
            var key = r.PO || "(Không có PO)";
            if (!groups[key]) {
                groups[key] = { POMua: key, NCC: r.NhaCungCap || "", SoVT: new Set(), SL: 0, GiaTri: 0, NgayDuKien: r.NgayNhap };
            }
            var g = groups[key];
            if (r.ItemCode) g.SoVT.add(r.ItemCode);
            g.SL += toNumber(r.SoLuong);
            g.GiaTri += toNumber(r.GiaTri);
        });
        return Object.keys(groups).map(function (k, i) {
            var g = groups[k];
            return {
                STT: i + 1,
                POMua: g.POMua,
                NCC: g.NCC,
                SoVT: g.SoVT.size,
                SL: g.SL,
                GiaTri: g.GiaTri,
                NgayDuKien: g.NgayDuKien
            };
        });
    } else if (activeKey === "ncc") {
        rows.forEach(function (r) {
            var key = r.NhaCungCap || "(Không có NCC)";
            if (!groups[key]) {
                groups[key] = { NCC: key, SoPO: new Set(), SoVT: new Set(), SL: 0, GiaTri: 0 };
            }
            var g = groups[key];
            if (r.PO) g.SoPO.add(r.PO);
            if (r.ItemCode) g.SoVT.add(r.ItemCode);
            g.SL += toNumber(r.SoLuong);
            g.GiaTri += toNumber(r.GiaTri);
        });
        return Object.keys(groups).map(function (k, i) {
            var g = groups[k];
            return {
                STT: i + 1,
                NCC: g.NCC,
                SoPO: g.SoPO.size,
                SoVT: g.SoVT.size,
                SL: g.SL,
                GiaTri: g.GiaTri
            };
        });
    } else if (activeKey === "vt") {
        rows.forEach(function (r) {
            var key = r.ItemCode || "(Không có mã)";
            if (!groups[key]) {
                groups[key] = {
                    ItemCode: key,
                    TenVT: key,
                    LoaiKho: r.LoaiKho || "NL",
                    DonVi: r.DonViVT || "",
                    SLNhap: 0,
                    SoPO: new Set(),
                    LanNhapCuoi: r.NgayNhap,
                    GiaTri: 0
                };
            }
            var g = groups[key];
            g.SLNhap += toNumber(r.SoLuong);
            if (r.PO) g.SoPO.add(r.PO);
            if (r.NgayNhap > g.LanNhapCuoi) g.LanNhapCuoi = r.NgayNhap;
            g.GiaTri += toNumber(r.GiaTri);
        });
        return Object.keys(groups).map(function (k, i) {
            var g = groups[k];
            return {
                STT: i + 1,
                ItemCode: g.ItemCode,
                TenVT: g.TenVT,
                LoaiKho: g.LoaiKho,
                DonVi: g.DonVi,
                SLNhap: g.SLNhap,
                SoPO: g.SoPO.size,
                LanNhapCuoi: g.LanNhapCuoi,
                DonGia: g.SLNhap > 0 ? g.GiaTri / g.SLNhap : 0,
                GiaTri: g.GiaTri
            };
        });
    }
    return rows;
}

/** Tổng hợp số liệu xuất kho theo nhóm (itemcode, khách hàng) cho modal Xuất kho chi tiết. */
function aggregateXuatData(rows, activeKey) {
    if (activeKey === "all") return rows;
    var groups = {};
    if (activeKey === "date") {
        rows.forEach(function (r) {
            var parsed = parseDate(r.NgayXuatHang);
            var key = parsed ? asIsoDate(parsed) : "(Không có ngày)";
            if (!groups[key]) {
                groups[key] = { Ngay: key, SoPhieu: new Set(), SoDH: new Set(), SLXuat: 0, GiaTri: 0 };
            }
            var g = groups[key];
            if (r.MaLenh) g.SoPhieu.add(r.MaLenh);
            if (r.MaLenhSX) g.SoDH.add(r.MaLenhSX);
            g.SLXuat += toNumber(r.SoLuong);
            g.GiaTri += toNumber(r.GiaTri);
        });
        return Object.keys(groups).map(function (k, i) {
            var g = groups[k];
            return {
                STT: i + 1,
                Ngay: g.Ngay,
                SoPhieu: g.SoPhieu.size,
                SoDH: g.SoDH.size,
                SLXuat: g.SLXuat,
                GiaTri: g.GiaTri
            };
        });
    } else if (activeKey === "dh") {
        rows.forEach(function (r) {
            var key = r.MaLenh || "(Không có ĐH)";
            if (!groups[key]) {
                groups[key] = { MaDH: key, KhachHang: r.TenKH || "", SoVT: new Set(), SL: 0, GiaTri: 0, NgayXuat: r.NgayXuatHang };
            }
            var g = groups[key];
            if (r.TenHang) g.SoVT.add(r.TenHang);
            g.SL += toNumber(r.SoLuong);
            g.GiaTri += toNumber(r.GiaTri);
        });
        return Object.keys(groups).map(function (k, i) {
            var g = groups[k];
            return {
                STT: i + 1,
                MaDH: g.MaDH,
                KhachHang: g.KhachHang,
                SoVT: g.SoVT.size,
                SL: g.SL,
                GiaTri: g.GiaTri,
                NgayXuat: g.NgayXuat
            };
        });
    } else if (activeKey === "kh") {
        rows.forEach(function (r) {
            var key = r.TenKH || "(Không có KH)";
            if (!groups[key]) {
                groups[key] = { KhachHang: key, MaKH: "", SoDH: new Set(), SoVT: new Set(), SL: 0, GiaTri: 0 };
            }
            var g = groups[key];
            if (r.MaLenh) g.SoDH.add(r.MaLenh);
            if (r.TenHang) g.SoVT.add(r.TenHang);
            g.SL += toNumber(r.SoLuong);
            g.GiaTri += toNumber(r.GiaTri);
        });
        return Object.keys(groups).map(function (k, i) {
            var g = groups[k];
            return {
                STT: i + 1,
                KhachHang: g.KhachHang,
                MaKH: g.MaKH,
                SoDH: g.SoDH.size,
                SoVT: g.SoVT.size,
                SL: g.SL,
                GiaTri: g.GiaTri
            };
        });
    } else if (activeKey === "vt") {
        rows.forEach(function (r) {
            var key = r.TenHang || "(Không có tên)";
            if (!groups[key]) {
                groups[key] = {
                    ItemCode: key,
                    TenVT: key,
                    LoaiKho: r.LoaiKho || "",
                    DonVi: "",
                    SLXuat: 0,
                    SoDH: new Set(),
                    LanXuatCuoi: r.NgayXuatHang,
                    GiaTri: 0
                };
            }
            var g = groups[key];
            g.SLXuat += toNumber(r.SoLuong);
            if (r.MaLenh) g.SoDH.add(r.MaLenh);
            if (r.NgayXuatHang > g.LanXuatCuoi) g.LanXuatCuoi = r.NgayXuatHang;
            g.GiaTri += toNumber(r.GiaTri);
        });
        return Object.keys(groups).map(function (k, i) {
            var g = groups[k];
            return {
                STT: i + 1,
                ItemCode: g.ItemCode,
                TenVT: g.TenVT,
                LoaiKho: g.LoaiKho,
                DonVi: g.DonVi,
                SLXuat: g.SLXuat,
                SoDH: g.SoDH.size,
                LanXuatCuoi: g.LanXuatCuoi,
                DonGia: g.SLXuat > 0 ? g.GiaTri / g.SLXuat : 0,
                GiaTri: g.GiaTri
            };
        });
    }
    return rows;
}

/**
 * Hàm gốc dùng để mở mọi loại Modal chi tiết. Tự động lưu lịch sử để hỗ trợ Drill-down (mở Modal con từ Modal cha).
 * @param {string} detail ID của chi tiết cần mở
 * @param {number} index Vị trí/Tham số phụ
 */
/** Mở modal chi tiết tương ứng với loại data-detail và index được click. */
function openDetail(detail, index) {
    // Push parent state lên stack nếu modal đang mở (= drilling)
    var modal = byId(ids.detailModal);
    if (modal && modal.classList.contains("open") && _detailStack.length === 0) {
        // First-time push: lưu lại detail HIỆN TẠI (parent)
        // (chỉ push 1 lần, không nested deeper)
    }
    if (modal && modal.classList.contains("open") && _currentDetail) {
        _detailStack.push({ detail: _currentDetail, index: _currentDetailIndex });
    }
    _currentDetail = detail;
    _currentDetailIndex = index;

    var content = byId(ids.detailModalContent);
    var modal = byId(ids.detailModal);
    if (modal && content) {
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        content.innerHTML =
            '<div style="padding:52px 0;text-align:center;">' +
            '<div class="dk-spinner-wrap" style="margin:0 auto 18px;">' +
            '<i class="fa-solid fa-warehouse dk-spinner-icon"></i>' +
            '</div>' +
            '<div style="color:var(--dk-muted,#64748b);font-size:13px;font-weight:600;letter-spacing:.4px;">Đang tải dữ liệu...</div>' +
            '</div>';
        modal.classList.add("open");
        // Defer rendering so the browser paints the modal open animation and spinner first
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                renderDetailModal(detail, index);
            });
        });
    } else {
        renderDetailModal(detail, index);
    }
}

var _currentDetail = null;

var _currentDetailIndex = -1;

/**
 * Hàm vẽ nội dung cho Modal chi tiết dựa vào tham số detail (tên modal) và index (dữ liệu chọn).
 * Có hỗ trợ phân nhánh để render giao diện tùy biến (customAsync) cho các Modal nghiệp vụ phức tạp.
 * @param {string} detail Tên/loại modal
 * @param {number} index Index/tham số của dòng dữ liệu
 */
/** Render nội dung chính của modal chi tiết theo kiểu (customAsync, gantt, tabs, table). */
function renderDetailModal(detail, index) {
    var contentEl = byId(ids.detailModalContent);
    if (contentEl) {
        contentEl.classList.remove("dk-todo-modal-content");
    }
    var model;
    try {
        model = getDetailData(detail, index);
    } catch (e) {
        model = { title: detail, rows: [], columns: [], isWarehouseMap: false };
    }
    // Update title with back button if stack non-empty
    var titleEl = byId(ids.detailModalTitle);
    if (_detailStack.length > 0) {
        titleEl.innerHTML =
            '<button type="button" class="dk-back-btn js-modal-back" title="Quay lại">← Quay lại</button> ' +
            escapeHtml(model.title);
    } else {
        titleEl.textContent = model.title;
    }
    // v2.3.20 — Meta header chỉ hiện model.meta (nếu có), tổng dòng dời xuống footer
    byId(ids.detailModalMeta).textContent = model.meta || "";
    if (!model.meta) byId(ids.detailModalMeta).style.display = "none";
    else byId(ids.detailModalMeta).style.display = "";
    // Update footer row count
    var rowCountEl = byId("detailModalRowCount");
    if (rowCountEl) {
        rowCountEl.textContent = "Tổng số dòng: " + formatNumber((model.rows || []).length, 0);
    }

    // Reset search
    var searchInput = byId("detailSearchInput");
    if (searchInput) {
        searchInput.value = "";
    }
    var searchCount = byId("detailSearchCount");
    if (searchCount) {
        searchCount.textContent = "";
    }

    var rowCount = (model.rows || []).length;
    // v2.3.17 — detail có ít dòng → ẩn search bar
    var noSearchDetails = { capacitySummary: 1, materialCount: 1 };
    var searchBar = document.querySelector(".dk-modal-search-bar");
    if (searchBar) {
        searchBar.style.display = rowCount <= 5 || noSearchDetails[detail] ? "none" : "";
    }

    if (model.isWarehouseMap) {
        var overall = state.overall.length > 0 ? state.overall[0] : {};
        var wrapHtml = '<div class="dk-modal-wh-wrap">';

        wrapHtml += '<div class="dk-modal-wh-summary">';
        wrapHtml +=
            '<div class="dk-modal-wh-stat"><div class="dk-modal-wh-stat-label">Tổng sức chứa (CBM)</div><div class="dk-modal-wh-stat-value">' +
            formatNumber(toNumber(overall.TotalCapacity), 2) +
            "</div></div>";
        wrapHtml +=
            '<div class="dk-modal-wh-stat"><div class="dk-modal-wh-stat-label">Đã sử dụng</div><div class="dk-modal-wh-stat-value dk-text-danger">' +
            formatNumber(toNumber(overall.UsedNPL) + toNumber(overall.UsedPL), 2) +
            " CBM — " +
            formatNumber(toNumber(overall.TotalPercent), 1) +
            "%</div></div>";
        wrapHtml +=
            '<div class="dk-modal-wh-stat"><div class="dk-modal-wh-stat-label">Kho NL</div><div class="dk-modal-wh-stat-value dk-text-primary">' +
            formatNumber(toNumber(overall.UsedNPL), 2) +
            " / " +
            formatNumber(toNumber(overall.CapacityNPL), 2) +
            ' CBM</div><div class="dk-modal-wh-stat-sub">' +
            formatNumber(toNumber(overall.PercentNPL), 1) +
            "% lấp đầy</div></div>";
        wrapHtml +=
            '<div class="dk-modal-wh-stat"><div class="dk-modal-wh-stat-label">Kho PL</div><div class="dk-modal-wh-stat-value dk-text-warn">' +
            formatNumber(toNumber(overall.UsedPL), 2) +
            " / " +
            formatNumber(toNumber(overall.CapacityPL), 2) +
            ' CBM</div><div class="dk-modal-wh-stat-sub">' +
            formatNumber(toNumber(overall.PercentPL), 1) +
            "% lấp đầy</div></div>";
        wrapHtml += "</div>";

        // Sơ đồ tile map
        wrapHtml += '<div style="margin-bottom:14px">';
        wrapHtml += '<b style="font-size:13px">Sơ đồ lấp đầy kệ</b>';
        wrapHtml += '<div style="display:flex;gap:10px;font-size:11px;font-weight:700;margin:6px 0;">';
        wrapHtml +=
            '<span><i style="display:inline-block;width:12px;height:12px;background:#dcfce7;border:1px solid #86efac;border-radius:2px;vertical-align:middle"></i> &lt;50%</span>';
        wrapHtml +=
            '<span><i style="display:inline-block;width:12px;height:12px;background:#fef9c3;border:1px solid #fde047;border-radius:2px;vertical-align:middle"></i> 50-85%</span>';
        wrapHtml +=
            '<span><i style="display:inline-block;width:12px;height:12px;background:#fecdd3;border:1px solid #fda4af;border-radius:2px;vertical-align:middle"></i> 85-100%</span>';
        wrapHtml +=
            '<span><i style="display:inline-block;width:12px;height:12px;background:#e11d48;border:1px solid #be123c;border-radius:2px;vertical-align:middle"></i> &gt;100%</span>';
        wrapHtml += "</div>";

        // Build inline heatmap
        var racksSorted = state.racks.slice().sort(function (a, b) {
            var mA = toNumber(a.Module),
                mB = toNumber(b.Module);
            if (mA !== mB) return mA - mB;
            return (a.TenDay || "").localeCompare(b.TenDay || "");
        });
        var modGroups = {};
        for (var rr = 0; rr < racksSorted.length; rr++) {
            var rm = toNumber(racksSorted[rr].Module);
            var rmName = rm === 1 ? "NL" : rm === 2 ? "PL" : "Khác";
            if (!modGroups[rmName]) modGroups[rmName] = [];
            modGroups[rmName].push(racksSorted[rr]);
        }
        var groupKeys = ["NL", "PL", "Khác"];
        for (var gk = 0; gk < groupKeys.length; gk++) {
            var gName = groupKeys[gk];
            var gRacks = modGroups[gName];
            if (!gRacks || !gRacks.length) continue;
            wrapHtml +=
                '<div style="margin-bottom:10px"><b style="font-size:12px;color:' +
                (gName === "NL" ? "#2563eb" : "#d97706") +
                '">' +
                gName +
                '</b><div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:4px">';
            for (var gr = 0; gr < gRacks.length; gr++) {
                var grItem = gRacks[gr];
                var grUsed = toNumber(grItem.TongCBMSuDungTrongKe);
                var grCap = toNumber(grItem.TongCBMTrongKe);
                var grPct = grCap > 0 ? (grUsed / grCap) * 100 : 0;
                var grClass =
                    grPct > 100 ? "dk-wh-over" : grPct >= 85 ? "dk-wh-full" : grPct >= 50 ? "dk-wh-warn" : "dk-wh-safe";
                // v2.4.16 — Tile fill animation
                var grFillH = Math.min(100, Math.max(0, grPct));
                wrapHtml +=
                    '<div class="dk-wh-tile ' +
                    grClass +
                    '" data-pct="' +
                    grFillH.toFixed(1) +
                    '" title="' +
                    escapeHtml(
                        (grItem.TenKe || "") + " | " + (grItem.TenDay || "") + " | " + formatNumber(grPct, 1) + "%",
                    ) +
                    '" style="cursor:default;animation-delay:' +
                    gr * 40 +
                    'ms">';
                wrapHtml += '<span class="dk-wh-tile-fill" style="height:' + grFillH.toFixed(1) + '%"></span>';
                if (grPct >= 100) wrapHtml += '<i class="fa-solid fa-triangle-exclamation dk-wh-tile-warn-icon"></i>';
                wrapHtml += '<span class="dk-wh-tile-name">' + escapeHtml(grItem.TenKe || "Kệ") + "</span>";
                wrapHtml += '<span class="dk-wh-tile-pct">' + formatNumber(grPct, 0) + "%</span>";
                wrapHtml += "</div>";
            }
            wrapHtml += "</div></div>";
        }
        wrapHtml += "</div>";

        // Table bên dưới (v2.7.1 — bỏ label "NL trước → PL")
        wrapHtml += renderDetailTable(model.columns, model.rows);
        wrapHtml += "</div>";

        byId(ids.detailModalContent).innerHTML = wrapHtml;
    } else {
        byId(ids.detailModalContent).innerHTML = renderDetailTable(model.columns, model.rows);
    }

    byId(ids.detailModal).classList.add("open");

    // v2.3.9 — Sau khi mở modal totalCapacity → fetch chi tiết theo Ô + append
    if (model.isWarehouseMap) {
        loadRackSlotDetailIntoModal();
    }

    // v2.3.30 — Async load cho drill "Mã vật tư" (toàn bộ ~2348 mã)
    if (model.customAsync === "allMaterials") {
        var contentEl = byId(ids.detailModalContent);
        if (contentEl)
            contentEl.innerHTML =
                '<div class="dk-empty" style="padding:30px">Đang tải tất cả mã vật tư trong kho (có thể mất 5-15 giây)...</div>';
        requestJson("/api/DashboardKhoDesktop/GetAllMaterialsInStock")
            .then(function (data) {
                var rows = normalizeArray(data).map(function (r, i) {
                    // v2.4.0 — Compose Màu = "Mã màu — Tên màu" + swatch; Khổ vải kèm đơn vị; alias MaVT → ItemCode
                    var maMau = r.MaMauVT ? String(r.MaMauVT).trim() : "";
                    var tenMau = r.Mau ? String(r.Mau).trim() : "";
                    var mauText = "";
                    if (maMau && tenMau) mauText = escapeHtml(maMau) + " — " + escapeHtml(tenMau);
                    else if (maMau) mauText = escapeHtml(maMau);
                    else if (tenMau) mauText = escapeHtml(tenMau);
                    var mauDisplay = mauText
                        ? '<span class="dk-mau-swatch" data-mau="' +
                          escapeHtml(maMau || tenMau) +
                          '"></span>' +
                          '<span class="dk-mau-text">' +
                          mauText +
                          "</span>"
                        : "";
                    var khoVai = r.KhoVai ? String(r.KhoVai).trim() : "";
                    var dvvt = r.TenDVVT ? String(r.TenDVVT).trim() : "";
                    var khoVaiDisplay = khoVai ? khoVai + (dvvt ? " " + dvvt : "") : "";

                    return Object.assign({}, r, {
                        STT: i + 1,
                        ItemCode: r.MaVT || "",
                        MauDisplay: mauDisplay,
                        KhoVai: khoVaiDisplay,
                    });
                });
                if (rows.length === 0) {
                    contentEl.innerHTML = '<div class="dk-empty" style="padding:30px">Không có mã vật tư nào</div>';
                } else {
                    contentEl.innerHTML = renderDetailTable(model.columns, rows);
                }
                // Update footer row count
                var rcEl = byId("detailModalRowCount");
                if (rcEl) rcEl.textContent = "Tổng số dòng: " + formatNumber(rows.length, 0);
            })
            .catch(function (err) {
                // v2.3.35 — Hiện rõ lỗi để debug, không chỉ "Lỗi tải" chung chung
                console.error("[Dashboard Kho] AllMaterials error:", err);
                var msg = err && err.message ? err.message : "Lỗi không rõ";
                contentEl.innerHTML =
                    '<div style="padding:30px">' +
                    '<div class="dk-text-danger" style="margin-bottom:10px;font-size:14px">⚠ Lỗi tải danh sách mã vật tư</div>' +
                    '<div class="dk-error-box">' +
                    escapeHtml(msg) +
                    "</div>" +
                    '<div class="dk-text-muted" style="margin-top:14px;font-size:12.5px;line-height:1.6">' +
                    "<b>Có thể do:</b><br>" +
                    "• Backend chưa được Rebuild (SP <code>GetAllMaterialsInStock</code> chưa tồn tại) → Stop debug → Rebuild Solution → F5<br>" +
                    "• Query SQL bị lỗi → mở F12 Network → tab Response của request <code>GetAllMaterialsInStock</code> để xem chi tiết<br>" +
                    "• Connection timeout → query quá nặng, thử lại sau" +
                    "</div>" +
                    "</div>";
            });
    }

    // v2.4.4 — Dispatcher cho 6 modal "Xem chi tiết" mới
    if (model.customAsync === "todoDetail") {
        renderTodoDetailModal();
    }
    if (model.customAsync === "top5VTAll") {
        renderTop5VTAllModal();
    }
    if (model.customAsync === "top5KHAll") {
        renderTop5KHAllModal();
    }
    if (model.customAsync === "hetHanAll") {
        renderHetHanAllModal();
    }
    if (model.customAsync === "giaTriNhomAll") {
        renderGiaTriNhomAllModal();
    }
    if (model.customAsync === "kiemKeAll") {
        renderKiemKeAllModal();
    }
    // v2.4.15 — Dispatcher cho 5 modal KPI header
    if (model.customAsync === "tonDauKyDetail") {
        renderTonDauKyDetailModal();
    }
    if (model.customAsync === "tongNhapDetail") {
        renderTongNhapDetailModal();
    }
    if (model.customAsync === "tongXuatDetail") {
        renderTongXuatDetailModal();
    }
    if (model.customAsync === "tongXuatItemRolls") {
        renderTongXuatItemRollsModal();
    }
    if (model.customAsync === "tonKhoDetail") {
        renderTonKhoDetailModal();
    }
    if (model.customAsync === "poTreDetail") {
        renderPOTreDetailModal();
    }
    if (model.customAsync === "alertDetail") {
        renderAlertDetailModal();
    }

    if (model.customDrillCustomer) {
        var custTenKH = String(model.customDrillCustomer.TenKH || "").trim();
        var custMaKH = String(model.customDrillCustomer.MaKH || "").trim();
        loadSlotDrillIntoModal({
            filterFn: function (r) {
                var ds = String(r.DanhSachKH || "");
                if (custTenKH && ds.toLowerCase().indexOf(custTenKH.toLowerCase()) >= 0) return true;
                if (custMaKH && ds.toLowerCase().indexOf(custMaKH.toLowerCase()) >= 0) return true;
                return false;
            },
            emptyText: 'Khách hàng "' + (custTenKH || custMaKH) + '" chưa có vật tư nào trong kho',
            sectionTitle: "Vị trí hàng của khách trong kho — theo dãy / kệ / ô",
        });
    }

    // v2.3.26 — Rack drill: fetch GetRackSlotDetail và filter theo TenKe
    if (model.customDrillRack) {
        loadSlotDrillIntoModal({
            filterFn: function (r) {
                return String(r.TenKe || "").trim() === String(model.customDrillRack.TenKe || "").trim();
            },
            emptyText: "Kệ này chưa có vật tư nào",
            sectionTitle: "Danh sách ô và vật tư trong kệ này",
        });
    }
}

/**
 * Đóng Modal chi tiết và xóa trạng thái lưu lịch sử Drill-down.
 */
/** Đóng modal chi tiết và xóa nội dung. */
function closeDetailModal() {
    var modal = byId(ids.detailModal);
    if (!modal) return;
    modal.classList.remove("open");
    modal.style.display = ""; // clear any inline style from older code paths
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    var content = byId(ids.detailModalContent);
    if (content) {
        content.classList.remove("dk-todo-modal-content");
    }

    // v2.3.27 — Reset drill stack khi đóng modal hoàn toàn
    _detailStack = [];
    _currentDetail = null;
    _currentDetailIndex = -1;

    // Restore search bar visibility (calendar-day modal hides it)
    var searchBar = document.querySelector(".dk-modal-search-bar");
    if (searchBar) searchBar.style.display = "";
}

// ─── Feature 10: Full-screen Panel Mode ─────────────────────────────────────
var fsBackdrop = null;

/**
 * Logic tìm kiếm nhanh các dòng hiển thị trong bảng dữ liệu của Modal chi tiết.
 * @param {string} query Chuỗi từ khóa tìm kiếm
 */
/** Lọc bảng chi tiết trong modal theo từ khóa tìm kiếm. */
function filterDetailTable(query) {
    var content = byId(ids.detailModalContent);
    if (!content) return;

    var visiblePanels = content.querySelectorAll(".dk-day-panel");
    if (visiblePanels.length > 0 && window.__dkDetailData) {
        for (var vp = 0; vp < visiblePanels.length; vp++) {
            if (visiblePanels[vp].style.display === "none") continue;
            if (!visiblePanels[vp].querySelector(".dk-grid-table")) break;

            var tabKey = visiblePanels[vp].getAttribute("data-tabkey");
            var d = window.__dkDetailData[tabKey];
            if (!d) return;
            if (!d.allRows) d.allRows = d.rows || [];

            var lowerQuery = String(query || "").toLowerCase();
            if (!lowerQuery) {
                d.rows = d.allRows;
            } else {
                d.rows = d.allRows.filter(function (row) {
                    for (var key in row) {
                        if (!Object.prototype.hasOwnProperty.call(row, key)) continue;
                        if (key.indexOf("__dk") === 0) continue;
                        var value = row[key];
                        if (value === null || value === undefined) continue;
                        if (String(value).toLowerCase().indexOf(lowerQuery) >= 0) return true;
                    }
                    return false;
                });
            }

            d.page = 1;
            d.sortedRows = null;
            d.pageCache = {};
            d.collapsedGroupsByPage = {};
            initVirtualScrollGrid(tabKey);

            var countEl = byId("detailSearchCount");
            if (countEl) {
                countEl.textContent = lowerQuery ? formatNumber(d.rows.length, 0) + " / " + formatNumber(d.allRows.length, 0) + " dòng" : "";
            }
            return;
        }
    }

    // v2.3.9 — Nếu có tabbed UI (modal ngày calendar), chỉ filter tab đang hiện;
    // ngược lại filter tất cả tbody trong modal.
    var tbodies;
    if (visiblePanels.length > 0) {
        // Chỉ lấy tbody của panel đang visible
        tbodies = [];
        for (var p = 0; p < visiblePanels.length; p++) {
            if (visiblePanels[p].style.display !== "none") {
                var tb = visiblePanels[p].querySelectorAll("tbody");
                for (var tt = 0; tt < tb.length; tt++) tbodies.push(tb[tt]);
            }
        }
    } else {
        tbodies = content.querySelectorAll("tbody");
    }

    var lowerQuery = query.toLowerCase();
    var visibleTotal = 0,
        totalRows = 0;
    for (var b = 0; b < tbodies.length; b++) {
        var rows = tbodies[b].querySelectorAll("tr");
        for (var i = 0; i < rows.length; i++) {
            totalRows++;
            var match = !lowerQuery || rows[i].textContent.toLowerCase().indexOf(lowerQuery) >= 0;
            rows[i].style.display = match ? "" : "none";
            if (match) visibleTotal++;
        }
    }
    var countEl = byId("detailSearchCount");
    if (countEl) {
        countEl.textContent = query ? visibleTotal + " / " + totalRows + " dòng" : "";
    }
}

var loadedPages = { 1: false, 2: false, 3: false };

var flowRangeFrom = null;

var flowRangeTo = null;

window.dkShowToast = showToast;

/** Trả về HTML skeleton "Đang tải dữ liệu..." hiển thị trong modal khi chờ API. */
function modalLoading(text) {
    var label = escapeHtml(text || "Đang tải dữ liệu...");
    var rows = '';
    for (var i = 0; i < 7; i++) {
        rows +=
            '<div class="dk-modal-loading-table-row">' +
            '<div style="width:4%;flex-shrink:0;"></div>' +
            '<div style="width:10%;flex-shrink:0;"></div>' +
            '<div style="flex:1;"></div>' +
            '<div style="width:8%;flex-shrink:0;"></div>' +
            '<div style="width:9%;flex-shrink:0;"></div>' +
            '<div style="width:9%;flex-shrink:0;"></div>' +
            '</div>';
    }
    return (
        '<div class="dk-modal-loading-wrap">' +
        '<div class="dk-modal-loading-header">' +
        '<div class="dk-modal-loading-kpi"></div>' +
        '<div class="dk-modal-loading-kpi"></div>' +
        '<div class="dk-modal-loading-kpi"></div>' +
        '</div>' +
        '<div class="dk-modal-loading-bar w-80" style="margin-bottom:6px;"></div>' +
        '<div class="dk-modal-loading-bar w-60" style="margin-bottom:14px;"></div>' +
        rows +
        '<div style="text-align:center;margin-top:16px;">' +
        '<div class="dk-spinner-wrap" style="margin:0 auto 10px;width:48px;height:48px;">' +
        '<i class="fa-solid fa-warehouse dk-spinner-icon" style="font-size:17px;"></i>' +
        '</div>' +
        '<div style="color:var(--dk-muted,#64748b);font-size:12px;font-weight:600;letter-spacing:.3px;">' + label + '</div>' +
        '</div>' +
        '</div>'
    );
}

/** Trả về HTML thông báo lỗi bên trong modal khi API thất bại. */
function modalErrorBox(msg) {
    return (
        '<div style="padding:30px">' +
        '<div class="dk-text-danger" style="margin-bottom:10px;font-size:14px">⚠ Lỗi tải dữ liệu</div>' +
        '<div class="dk-error-box">' +
        escapeHtml(msg || "Không rõ") +
        "</div>" +
        "</div>"
    );
}

/** Mở modal trực tiếp từ object model có sẵn (không qua openDetail). */
function renderDetailModalDirect(model) {
    var titleEl = byId(ids.detailModalTitle);
    if (_detailStack.length > 0) {
        titleEl.innerHTML =
            '<button type="button" class="dk-back-btn js-modal-back" title="Quay lại">← Quay lại</button> ' +
            escapeHtml(model.title);
    } else {
        titleEl.textContent = model.title;
    }
    byId(ids.detailModalMeta).textContent = model.meta || "";
    byId(ids.detailModalMeta).style.display = model.meta ? "" : "none";
    var sb = document.querySelector(".dk-modal-search-bar");
    if (sb) sb.style.display = "none";
    if (model.customDrillCustomer) {
        loadCustomerMaterialDetail(model.customDrillCustomer);
    }
}

//#endregion


// ─── #0 Tồn đầu kỳ ────────────────────────────────────────────────

function renderTonDauKyDetailModal() {
    var content = byId(ids.detailModalContent);
    if (!content) return;
    var titleEl = byId(ids.detailModalTitle);
    
    var todayStr = asIsoDate(new Date());
    var fromDate = todayStr;
    // Hiển thị ngày theo định dạng DD/MM/YYYY thay vì YYYY-MM-DD
    var fromDateParts = fromDate.split("-");
    var fromDateDisplay = fromDateParts[2] + "/" + fromDateParts[1] + "/" + fromDateParts[0];
    if (titleEl) titleEl.textContent = "Tồn đầu kỳ — tại " + fromDateDisplay;
    
    var tabs = [
        { key: "all", label: "Tất cả", icon: "fa-list" },
        { key: "nl", label: "Nguyên liệu", icon: "fa-leaf" },
        { key: "pl", label: "Phụ liệu", icon: "fa-boxes-stacked" },
    ];
    var activeKey = "all";
    var allRows = [];
    var selectedIdx = -1;

    function paint() {
        var sumSL = 0,
            sumGT = 0,
            soVT = (typeof Set === "function") ? new Set() : {};
        allRows.forEach(function (r) {
            sumSL += toNumber(r.TonDauKy || r.SLTonDau);
            sumGT += toNumber(r.ThanhTien);
            if (soVT.add) soVT.add(r.ItemCode);
            else soVT[r.ItemCode] = 1;
        });
        var numVT = (soVT.size !== undefined) ? soVT.size : Object.keys(soVT).length;
        
        content.innerHTML =
            renderKpiSummaryStrip([
                { label: "Tổng SL tồn đầu", value: formatNumber(sumSL, 0), sub: "đơn vị", cls: "good" },
                { label: "Số mã VT", value: formatNumber(numVT, 0), sub: "ItemCode", cls: "warn" },
                { label: "Tổng giá trị", value: formatVNDShort(sumGT), sub: "VND", cls: "danger" },
            ]) +
            renderKpiSubtabs(tabs, activeKey) +
            renderKpiFilterBar("Tìm ItemCode, tên VT...") +
            '<div class="dk-tdk-master-detail" id="tdkMasterDetail">' +
            '<div class="dk-tdk-left" id="kpiTbody">' + modalLoading() + '</div>' +
            '<div class="dk-tdk-resizer" id="tdkResizer"></div>' +
            '<div class="dk-tdk-right" id="tdkDetailPanel">' +
            '<div class="dk-tdk-right-empty"><i class="fa fa-info-circle"></i>Chọn một mặt hàng để xem chi tiết số roll</div>' +
            '</div>' +
            '</div>';
            
        bindKpiSubtabs();
        bindKpiSearch(content, doFilter);
        selectedIdx = 0;
        doFilter();
        bindResizer();
    }

    function doFilter() {
        var q = (byId("kpiSearch").value || "").trim().toLowerCase();
        var filtered = allRows.filter(function (r) {
            // Lọc theo subtab tại local
            if (activeKey === "nl" && (r.LoaiKho || "").toUpperCase() !== "NL") return false;
            if (activeKey === "pl" && (r.LoaiKho || "").toUpperCase() !== "PL") return false;

            if (!q) return true;
            var hay = (
                (r.MaNPL || "") +
                " " +
                (r.ItemCode || "") +
                " " +
                (r.TenVT || "") +
                " " +
                (r.Mau || r.MauVT || "") +
                " " +
                (r.KhoVai || "")
            ).toLowerCase();
            return hay.indexOf(q) >= 0;
        });
        renderMasterTable(filtered);
        var cnt = byId("kpiCount");
        if (cnt) cnt.textContent = filtered.length + " dòng";
        var rcEl = byId("detailModalRowCount");
        if (rcEl) rcEl.textContent = "Tổng số dòng: " + formatNumber(filtered.length, 0);
    }

    function renderMasterTable(rows) {
        var tbody = byId("kpiTbody");
        if (!tbody) return;
        var html = '<table class="dk-detail-table dk-tdk-table"><thead><tr>' +
            '<th class="dk-tdk-col-stt">STT</th>' +
            '<th class="dk-tdk-col-loai">Loại</th>' +
            '<th class="dk-tdk-col-ic">ItemCode</th>' +
            '<th class="dk-tdk-col-mota">Mô tả</th>' +
            '<th class="dk-tdk-col-mau">Màu VT</th>' +
            '<th class="dk-tdk-col-kho">Width/Size</th>' +
            '<th class="dk-tdk-col-dv">ĐV</th>' +
            '<th class="dk-tdk-col-sl">Tồn đầu kỳ</th>' +
            '</tr></thead><tbody>';
        for (var i = 0; i < rows.length; i++) {
            var r = rows[i];
            var cls = (i === selectedIdx) ? ' dk-tdk-row-active' : '';
            html += '<tr data-tdk-idx="' + i + '" class="dk-tdk-row' + cls + '">' +
                '<td class="dk-tdk-col-stt">' + (i + 1) + '</td>' +
                '<td class="dk-tdk-col-loai">' + escapeHtml(r.LoaiKho || "") + '</td>' +
                '<td class="dk-tdk-col-ic dk-tdk-ellip" title="' + escapeHtml(r.ItemCode || "") + '">' + escapeHtml(r.ItemCode || "") + '</td>' +
                '<td class="dk-tdk-col-mota dk-tdk-ellip" title="' + escapeHtml(r.TenVT || "") + '">' + escapeHtml(r.TenVT || "") + '</td>' +
                '<td class="dk-tdk-col-mau dk-tdk-ellip" title="' + escapeHtml(r.Mau || r.MauVT || "") + '">' + escapeHtml(r.Mau || r.MauVT || "") + '</td>' +
                '<td class="dk-tdk-col-kho">' + escapeHtml(r.KhoVai || "") + '</td>' +
                '<td class="dk-tdk-col-dv">' + escapeHtml(r.DonVi || "") + '</td>' +
                '<td class="dk-tdk-col-sl">' + formatNumber(toNumber(r.SLTonDau), 1) + '</td>' +
                '</tr>';
        }
        html += '</tbody></table>';
        tbody.innerHTML = html;
        
        var trs = tbody.querySelectorAll("tr[data-tdk-idx]");
        for (var j = 0; j < trs.length; j++) {
            (function (tr) {
                tr.addEventListener("click", function () {
                    var idx = parseInt(tr.getAttribute("data-tdk-idx"), 10);
                    selectedIdx = idx;
                    var allTr = tbody.querySelectorAll("tr[data-tdk-idx]");
                    for (var k = 0; k < allTr.length; k++) allTr[k].classList.remove("dk-tdk-row-active");
                    tr.classList.add("dk-tdk-row-active");
                    renderDetailPanel(rows[idx]);
                });
            })(trs[j]);
        }
        if (rows.length > 0) {
            var autoIdx = (selectedIdx >= 0 && selectedIdx < rows.length) ? selectedIdx : 0;
            selectedIdx = autoIdx;
            var activeTr = tbody.querySelector('tr[data-tdk-idx="' + autoIdx + '"]');
            if (activeTr) activeTr.classList.add("dk-tdk-row-active");
            renderDetailPanel(rows[autoIdx]);
        } else {
            var panel = byId("tdkDetailPanel");
            if (panel) {
                panel.innerHTML = '<div class="dk-tdk-right-empty"><i class="fa fa-info-circle"></i>Không có dữ liệu chi tiết</div>';
            }
        }
    }

    function renderDetailPanel(row) {
        var panel = byId("tdkDetailPanel");
        if (!panel || !row) return;
        panel.innerHTML =
            '<div class="dk-tdk-detail-header">' +
            '<div class="dk-tdk-detail-title">' + escapeHtml(row.ItemCode || "") + '</div>' +
            '<div class="dk-tdk-detail-sub">' + escapeHtml(row.TenVT || "") + '</div>' +
            '</div>' +
            '<div class="dk-tdk-roll-table-wrap" id="tdkRollTableWrap">' +
            '<div class="dk-loading-inline" style="padding:15px;color:var(--dk-text-muted,#64748b)"><i class="fa fa-spinner fa-spin"></i> Đang tải chi tiết...</div>' +
            '</div>';

        var todayStr = asIsoDate(new Date());
        var from = todayStr;
        requestJson("/api/DashboardKhoDesktop/GetTonDauKyRollDetail?tuNgay=" + encodeURIComponent(from) + "&loai=" + encodeURIComponent(row.MaNPL || ""))
            .then(function (data) {
                var list = normalizeArray(data);

                var tbodyHtml = "";
                var sumSLRoll = 0, sumTT = 0, tienTe = "VND";
                list.forEach(function (r) {
                    var donGiaVal = toNumber(r.DonGia) || toNumber(row.DonGia);
                    var ttVal = donGiaVal * toNumber(r.SLTonDau);
                    
                    var currentTienTe = r.TienTe || "VND";
                    var isVND = currentTienTe === "VND";
                    var dgDec = isVND ? 0 : 4;
                    var ttDec = isVND ? 0 : 2;

                    var ttStr = formatNumber(ttVal, ttDec) + " " + escapeHtml(currentTienTe);

                    if (r.TienTe) tienTe = r.TienTe;
                    sumTT += ttVal;
                    sumSLRoll += toNumber(r.SLTonDau);
                    tbodyHtml += '<tr>' +
                        '<td style="text-align:center;font-weight:700;color:var(--dk-primary,#3b82f6)">' + formatNumber(toNumber(r.SLTonDau), 1) + '</td>' +
                        '<td style="text-align:center;font-weight:700;color:var(--dk-warn,#f59e0b)">' + escapeHtml(r.SoKienHienThi || "") + '</td>' +
                        '<td style="text-align:center">' + formatNumber(donGiaVal, dgDec) + '</td>' +
                        '<td style="text-align:center;font-weight:700;color:var(--dk-danger,#ef4444)">' + ttStr + '</td>' +
                        '</tr>';
                });

                if (list.length === 0) {
                    tbodyHtml = '<tr><td colspan="4" style="text-align:center;color:var(--dk-text-muted,#64748b)">Không có dữ liệu chi tiết</td></tr>';
                }

                var wrap = byId("tdkRollTableWrap");
                if (wrap) {
                    wrap.innerHTML =
                        '<table class="dk-detail-table dk-tdk-roll-tbl"><thead><tr>' +
                        '<th style="text-align:center">Tồn đầu kỳ</th>' +
                        '<th style="text-align:center">Số roll/kiện</th>' +
                        '<th style="text-align:center">Đơn giá</th>' +
                        '<th style="text-align:center">Thành tiền</th>' +
                        '</tr></thead><tbody>' +
                        tbodyHtml +
                        '</tbody>' +
                        (list.length > 0 ? '<tfoot><tr style="background:rgba(59,130,246,0.12);border-top:2px solid var(--dk-border,#334155)"><td class="dk-tdk-total-qty" style="text-align:center">' + formatNumber(sumSLRoll, 1) + '</td><td></td><td></td><td class="dk-tdk-total-tt" style="text-align:right">' + formatNumber(sumTT, (tienTe === "VND" ? 0 : 2)) + ' ' + escapeHtml(tienTe) + '</td></tr></tfoot>' : '') +
                        '</table>';
                }
            })
            .catch(function (err) {
                var wrap = byId("tdkRollTableWrap");
                if (wrap) {
                    wrap.innerHTML = '<div style="color:var(--dk-danger,#ef4444);padding:15px;">Lỗi tải chi tiết: ' + escapeHtml(err && err.message) + '</div>';
                }
            });
    }

    function bindResizer() {
        var resizer = byId("tdkResizer");
        var container = byId("tdkMasterDetail");
        if (!resizer || !container) return;
        var leftPanel = byId("kpiTbody");
        var rightPanel = byId("tdkDetailPanel");
        var dragging = false,
            rafId = 0;
        resizer.addEventListener("mousedown", function (e) {
            e.preventDefault();
            dragging = true;
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
            container.classList.add("dk-tdk-resizing");
        });
        document.addEventListener("mousemove", function (e) {
            if (!dragging) return;
            var cx = e.clientX;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(function () {
                var rect = container.getBoundingClientRect();
                var leftW = Math.max(200, Math.min(cx - rect.left, rect.width - 436));
                leftPanel.style.flex = "0 0 " + leftW + "px";
                rightPanel.style.flex = "1 1 0";
            });
        });
        document.addEventListener("mouseup", function () {
            if (!dragging) return;
            dragging = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            container.classList.remove("dk-tdk-resizing");
        });
    }

    function bindKpiSubtabs() {
        content.querySelectorAll(".dk-kk-subtab").forEach(function (b) {
            b.addEventListener("click", function () {
                content.querySelectorAll(".dk-kk-subtab").forEach(function (x) {
                    x.classList.remove("active");
                });
                this.classList.add("active");
                activeKey = this.getAttribute("data-tab-key");
                selectedIdx = 0;
                doFilter();
            });
        });
    }

    function fetchData() {
        content.innerHTML = modalLoading();
        var todayStr = asIsoDate(new Date());
        var from = todayStr;
        requestJson(
            "/api/DashboardKhoDesktop/GetTonDauKyChiTiet?tuNgay=" +
                encodeURIComponent(from) +
                "&loai=all",
        )
            .then(function (d) {
                var arr = normalizeArray(d);
                arr.forEach(function (r) {
                    if (r.TonDauKy !== undefined && r.SLTonDau === undefined) {
                        r.SLTonDau = r.TonDauKy;
                    }
                    if (r.MauVT !== undefined && r.Mau === undefined) {
                        r.Mau = r.MauVT;
                    }
                });
                allRows = arr;
                paint();
            })
            .catch(function (err) {
                content.innerHTML = modalErrorBox(err && err.message);
            });
    }
    fetchData();
    var sb = document.querySelector(".dk-modal-search-bar");
    if (sb) sb.style.display = "none";
}

// ─── #1 Tổng nhập ────────────────────────────────────────────────

/** Render modal chi tiết Tổng nhập: tabs Nhập/Xuất/Kiểm kê/Dự kiến theo ngày. */
function renderTongNhapDetailModal() {
    var content = byId(ids.detailModalContent);
    if (!content) return;
    var titleEl = byId(ids.detailModalTitle);
    if (titleEl)
        titleEl.textContent =
            "Chi tiết nhập kho — " + (state.dateFilter ? state.dateFilter.from + " → " + state.dateFilter.to : "");
    var tabs = [
        { key: "all", label: "Chi tiết", icon: "fa-list" },
        { key: "date", label: "Theo ngày", icon: "fa-calendar-days" },
        { key: "po", label: "Theo PO mua", icon: "fa-file-invoice" },
        { key: "ncc", label: "Theo nhà cung cấp", icon: "fa-building" },
        { key: "vt", label: "Theo vật tư", icon: "fa-cube" },
    ];
    var activeKey = "all";
    var allRows = [];
    function paint() {
        var sumSL = 0,
            sumGT = 0;
        allRows.forEach(function (r) {
            sumSL += toNumber(r.SoLuong || r.SLNhap || r.SL);
            sumGT += toNumber(r.GiaTri);
        });
        var subText = "";
        if (activeKey !== "all") {
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].key === activeKey) {
                    subText = "trong " + tabs[i].label.toLowerCase();
                    break;
                }
            }
            if (!subText) subText = "trong " + activeKey;
        }
        content.innerHTML =
            renderKpiSummaryStrip([
                { label: "Tổng SL nhập", value: formatNumber(sumSL, 0), sub: "đơn vị", cls: "good" },
                { label: "Số dòng", value: formatNumber(allRows.length, 0), sub: subText, cls: "warn" },
                { label: "Tổng giá trị", value: formatVNDShort(sumGT), sub: "VND", cls: "danger" },
            ]) +
            renderKpiSubtabs(tabs, activeKey) +
            renderKpiFilterBar("Tìm nhanh trong bảng...") +
            '<div id="kpiTbody"></div>';
        bindKpiSubtabs();
        bindKpiSearch(content, doFilter);
        doFilter();
    }
    function doFilter() {
        var q = (byId("kpiSearch").value || "").trim().toLowerCase();
        var filtered = q
            ? allRows.filter(function (r) {
                  return JSON.stringify(r).toLowerCase().indexOf(q) >= 0;
              })
            : allRows;
        renderTable(filtered);
        var cnt = byId("kpiCount");
        if (cnt) cnt.textContent = filtered.length + " dòng";
        var rcEl = byId("detailModalRowCount");
        if (rcEl) rcEl.textContent = "Tổng số dòng: " + formatNumber(filtered.length, 0);
    }
    function renderTable(rows) {
        var cols;
        if (activeKey === "all") {
            // Bug4-fix: Sort theo PINCC (A→Z) trước khi render
            rows = rows.slice().sort(function (a, b) {
                var pa = String(a.PINCC || "");
                var pb = String(b.PINCC || "");
                return pa.localeCompare(pb);
            });
            cols = colsNhap();
        } else if (activeKey === "date") {
            cols = [
                { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                { key: "Ngay", label: "Ngày", date: true, center: true, width: 100 },
                { key: "SoPhieu", label: "Số phiếu", number: 0, center: true, width: 90 },
                { key: "SoVT", label: "Số VT", number: 0, center: true, width: 80 },
                { key: "SLNhap", label: "SL nhập", number: 1, width: 120, center: true },
                { key: "GiaTri", label: "Giá trị", number: 0, width: 130, center: true },
            ];
        } else if (activeKey === "po") {
            cols = [
                { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                { key: "POMua", label: "PO mua", center: true, width: 130 },
                { key: "NCC", label: "NCC", width: 180, center: true },
                { key: "SoVT", label: "Số VT", number: 0, center: true, width: 70 },
                { key: "SL", label: "SL", number: 1, width: 110, center: true },
                { key: "GiaTri", label: "Giá trị", number: 0, width: 130, center: true },
                { key: "NgayDuKien", label: "Dự kiến", date: true, center: true, width: 100 },
            ];
        } else if (activeKey === "ncc") {
            cols = [
                { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                { key: "NCC", label: "NCC", width: 200, center: true },
                { key: "SoPO", label: "Số PO", number: 0, center: true, width: 80 },
                { key: "SoVT", label: "Số VT", number: 0, center: true, width: 80 },
                { key: "SL", label: "SL", number: 1, width: 120, center: true },
                { key: "GiaTri", label: "Giá trị", number: 0, width: 140, center: true },
            ];
        } else {
            cols = [
                { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                { key: "ItemCode", label: "ItemCode", width: 110, center: true },
                { key: "TenVT", label: "Mô tả", width: 240, center: true },
                { key: "LoaiKho", label: "Loại", center: true, width: 60 },
                { key: "DonVi", label: "ĐV", center: true, width: 50 },
                { key: "SLNhap", label: "SL nhập", number: 1, width: 110, center: true },
                { key: "SoPO", label: "Số PO", number: 0, center: true, width: 70 },
                { key: "LanNhapCuoi", label: "Lần cuối", date: true, center: true, width: 100 },
                { key: "DonGia", label: "Đơn giá", number: 0, width: 110, center: true },
                { key: "GiaTri", label: "Giá trị", number: 0, width: 130, center: true },
            ];
        }
        byId("kpiTbody").innerHTML = renderDetailTable(cols, rows);
    }
    function bindKpiSubtabs() {
        content.querySelectorAll(".dk-kk-subtab").forEach(function (b) {
            b.addEventListener("click", function () {
                content.querySelectorAll(".dk-kk-subtab").forEach(function (x) {
                    x.classList.remove("active");
                });
                this.classList.add("active");
                activeKey = this.getAttribute("data-tab-key");
                fetchData();
            });
        });
    }
    function fetchData() {
        content.innerHTML = modalLoading();
        // Bug3-fix: Guard state.dateFilter để tránh crash khi dateFilter null
        var df  = state.dateFilter || {};
        var qs  =
            "?tuNgay=" +
            encodeURIComponent(df.from || "") +
            "&denNgay=" +
            encodeURIComponent(df.to   || "") +
            "&groupBy=" +
            encodeURIComponent(activeKey);
        requestJson("/api/DashboardKhoDesktop/GetTongNhapChiTiet" + qs)
            .then(function (d) {
                var raw = normalizeArray(d);
                allRows = aggregateNhapData(raw, activeKey);
                paint();
            })
            .catch(function (err) {
                content.innerHTML = modalErrorBox(err && err.message);
            });
    }
    fetchData();
    var sb = document.querySelector(".dk-modal-search-bar");
    if (sb) sb.style.display = "none";
}

// ─── #2 Tổng xuất  ──────────────────────────

/** Render modal chi tiết Tổng xuất theo khoảng ngày. */
function renderTongXuatDetailModal() {
    var content = byId(ids.detailModalContent);
    if (!content) return;
    var titleEl = byId(ids.detailModalTitle);
    if (titleEl) {
        titleEl.textContent = "Chi tiết xuất kho";
    }
    
    // Default dates from state
    var dfFrom = state.dateFilter ? state.dateFilter.from : "";
    var dfTo = state.dateFilter ? state.dateFilter.to : "";
    
    // Render Summary strip on top, then filter bar (using grid to stretch evenly), then table container
    content.innerHTML = 
        '<div id="txSummaryStrip"></div>' +
        '<div class="dk-tx-filter-bar" style="display:flex;flex-wrap:wrap;gap:12px;align-items:end;padding:12px 16px;background:var(--dk-bg-soft);border-bottom:1px solid var(--dk-border);margin-bottom:16px;box-sizing:border-box;">' +
        '  <div style="display:flex;flex-direction:column;gap:6px;flex:1 1 150px;min-width:130px;">' +
        '    <span style="font-size:12px;font-weight:600;color:var(--dk-text);">Từ ngày:</span>' +
        '    <input type="date" id="txFromDate" class="dk-kk-search" style="width:100%;height:32px;padding:4px 8px;border-radius:6px;border:1px solid var(--dk-border);background:var(--dk-bg);color:var(--dk-text);font-size:13px;box-sizing:border-box;" value="' + dfFrom + '" />' +
        '  </div>' +
        '  <div style="display:flex;flex-direction:column;gap:6px;flex:1 1 150px;min-width:130px;">' +
        '    <span style="font-size:12px;font-weight:600;color:var(--dk-text);">Đến ngày:</span>' +
        '    <input type="date" id="txToDate" class="dk-kk-search" style="width:100%;height:32px;padding:4px 8px;border-radius:6px;border:1px solid var(--dk-border);background:var(--dk-bg);color:var(--dk-text);font-size:13px;box-sizing:border-box;" value="' + dfTo + '" />' +
        '  </div>' +
        '  <div style="display:flex;flex-direction:column;gap:6px;flex:1.5 1 200px;min-width:160px;">' +
        '    <span style="font-size:12px;font-weight:600;color:var(--dk-text);">Itemcode:</span>' +
        '    <input type="text" id="txItemCode" class="dk-kk-search" style="width:100%;height:32px;padding:4px 8px;border-radius:6px;border:1px solid var(--dk-border);background:var(--dk-bg);color:var(--dk-text);font-size:13px;box-sizing:border-box;" placeholder="Tìm Itemcode..." />' +
        '  </div>' +
        '  <div style="display:flex;align-items:end;flex:0 0 auto;">' +
        '    <button type="button" id="txBtnFilter" class="dk-btn-primary" style="height:32px;padding:0 16px;border-radius:6px;font-weight:600;font-size:12.5px;border:none;cursor:pointer;background:var(--dk-primary,#2563eb);color:#fff;display:inline-flex;align-items:center;justify-content:center;gap:6px;box-sizing:border-box;white-space:nowrap;">' +
        '      <i class="fa-solid fa-filter"></i> Lọc' +
        '    </button>' +
        '  </div>' +
        '</div>' +
        '<div id="txTableContainer" style="overflow-x:auto;"></div>';
        
    var rawRows = [];
    var groupedRows = [];
    
    function fetchAndPaint() {
        var fromDate = byId("txFromDate").value;
        var toDate = byId("txToDate").value;
        
        var summaryStrip = byId("txSummaryStrip");
        var tableContainer = byId("txTableContainer");
        if (summaryStrip) summaryStrip.innerHTML = "";
        if (tableContainer) tableContainer.innerHTML = modalLoading();
        
        var qs = "?tuNgay=" + encodeURIComponent(fromDate) + "&denNgay=" + encodeURIComponent(toDate) + "&groupBy=all";
        requestJson("/api/DashboardKhoDesktop/GetTongXuatChiTiet" + qs)
            .then(function (d) {
                rawRows = normalizeArray(d);
                // Save globally for detail drill-down
                window.__txRawOutboundRows = rawRows;
                paint();
            })
            .catch(function (err) {
                if (tableContainer) {
                    tableContainer.innerHTML = modalErrorBox(err && err.message);
                }
            });
    }
    
    function paint() {
        var filterItemCode = (byId("txItemCode") ? byId("txItemCode").value : "").trim().toLowerCase();
        
        // Group the rawRows by: LoaiXuat, MaLenh, TenHang, NgayXuatHang, ItemCode, TenVT, MauVT, WidthSize, DonViVT
        var groups = {};
        groupedRows = [];
        
        rawRows.forEach(function (r) {
            // Apply text filters
            if (filterItemCode && String(r.ItemCode || "").toLowerCase().indexOf(filterItemCode) === -1) return;
            
            // Format date for key
            var dateStr = formatDateShort(parseDate(r.NgayXuatHang));
            var key = [
                r.MaPhieuXH || "",
                r.MaLenh || "",
                r.TenHang || "",
                dateStr,
                r.ItemCode || "",
                r.TenVT || "",
                r.MauVT || "",
                r.WidthSize || "",
                r.DonViVT || ""
            ].join("||");
            
            if (!groups[key]) {
                groups[key] = {
                    MaPhieuXH: r.MaPhieuXH || "",
                    MaLenh: r.MaLenh || "",
                    TenHang: r.TenHang || "",
                    NgayXuatHang: r.NgayXuatHang,
                    DateDisplay: dateStr,
                    ItemCode: r.ItemCode || "",
                    TenVT: r.TenVT || "",
                    MauVT: r.MauVT || "",
                    WidthSize: r.WidthSize || "",
                    DonViVT: r.DonViVT || "",
                    SoLuong: 0,
                    GiaTri: 0
                };
                groupedRows.push(groups[key]);
            }
            groups[key].SoLuong += toNumber(r.SoLuong);
            groups[key].GiaTri += toNumber(r.GiaTri);
        });
        
        // Compute summary values
        var sumSL = 0;
        var sumGT = 0;
        groupedRows.forEach(function (r) {
            sumSL += r.SoLuong;
            sumGT += r.GiaTri;
        });
        
        var summaryStrip = byId("txSummaryStrip");
        if (summaryStrip) {
            summaryStrip.innerHTML = renderKpiSummaryStrip([
                { label: "Tổng SL xuất", value: formatNumber(sumSL, 0), sub: "đơn vị", cls: "good" },
                { label: "Số loại vật tư", value: formatNumber(groupedRows.length, 0), sub: "dòng", cls: "warn" },
                { label: "Tổng giá trị", value: formatVNDShort(sumGT), sub: "VND", cls: "danger" }
            ]);
        }
        
        // Render Table Columns:
        // STT | Nghiệp vụ xuất hàng | Xuất hàng | Mã lệnh | Mã hàng | Ngày xuất | Itemcode | Mô tả | Màu VT | Width/Size | Đơn vị VT | SL xuất | Chi tiết
        var cols = [
            { key: "STT", label: "STT", number: 0, center: true, width: 40 },
            { key: "MaPhieuXH", label: "Nghiệp vụ XH", center: true, width: 100 },
            { key: "XuatHang", label: "Xuất hàng", width: 110 },
            { key: "MaLenh", label: "Mã lệnh", center: true, width: 60 },
            { key: "TenHang", label: "Mã hàng", width: 100, center: true },
            { key: "DateDisplay", label: "Ngày xuất", center: true, width: 80 },
            { key: "ItemCode", label: "Itemcode", center: true, width: 80 },
            { key: "TenVT", label: "Mô tả", width: 140 },
            { key: "MauVT", label: "Màu", width: 50, center: true },
            { key: "WidthSize", label: "Width/Size", width: 80, center: true },
            { key: "DonViVT", label: "ĐVVT", width: 60, center: true },
            { key: "SoLuong", label: "SL xuất", number: 2, center: true, width: 70 },
            { key: "Action", label: "CT", raw: true, center: true, width: 50 }
        ];
        
        // Map rows with STT and Details action button/icon
        var rowsWithAction = groupedRows.map(function (r, index) {
            var actionHtml = '<button class="dk-tx-eye-btn" onclick="window.__txShowDetail(' + index + ', this)" ' +
                'style="background:none;border:none;cursor:pointer;color:var(--dk-primary,#2563eb);font-size:16px;padding:6px 10px;border-radius:6px;transition:all 0.2s;position:relative;z-index:5;display:inline-flex;align-items:center;justify-content:center;" ' +
                'onmouseover="this.style.background=\'rgba(37,99,235,0.15)\';this.style.transform=\'scale(1.15)\'" ' +
                'onmouseout="this.style.background=\'none\';this.style.transform=\'scale(1)\'" ' +
                'title="Xem chi tiết">' +
                '<i class="fa-regular fa-eye"></i>' +
                '</button>';
            
            var xuatHangText = "";
            var mph = (r.MaPhieuXH || "").toUpperCase();
            if (mph.indexOf("PSH") !== -1) {
                xuatHangText = "Phiếu soạn hàng";
            } else if (mph.indexOf("PDK") !== -1) {
                xuatHangText = "Đăng ký cho lệnh SX";
            } else if (mph.indexOf("PDNCT") !== -1) {
                xuatHangText = "Phiếu đề nghị cấp thêm";
            }

            return Object.assign({
                STT: index + 1,
                XuatHang: xuatHangText,
                Action: actionHtml
            }, r);
        });
        
        var tableContainer = byId("txTableContainer");
        if (tableContainer) {
            tableContainer.innerHTML = renderDetailTable(cols, rowsWithAction);
        }
        
        var rcEl = byId("detailModalRowCount");
        if (rcEl) rcEl.textContent = "Tổng số dòng: " + formatNumber(groupedRows.length, 0);
        window.__txGroupedRows = groupedRows;
        
        window.__txShowDetail = function (index, btn) {
            var tr = btn.closest ? btn.closest("tr") : null;
            if (!tr) {
                var p = btn.parentNode;
                while (p && p.tagName !== "TR") p = p.parentNode;
                tr = p;
            }
            if (!tr) return;

            var nextTr = tr.nextElementSibling;
            if (nextTr && nextTr.classList.contains("dk-tx-expanded-row")) {
                nextTr.parentNode.removeChild(nextTr);
                btn.innerHTML = '<i class="fa-regular fa-eye"></i>';
                btn.setAttribute("title", "Xem chi tiết");
                tr.classList.remove("dk-row-active");
                return;
            }

            var allExpanded = tr.parentNode.querySelectorAll(".dk-tx-expanded-row");
            for (var i = 0; i < allExpanded.length; i++) {
                var prevSib = allExpanded[i].previousElementSibling;
                if (prevSib) {
                    prevSib.classList.remove("dk-row-active");
                    var prevBtn = prevSib.querySelector(".dk-tx-eye-btn");
                    if (prevBtn) {
                        prevBtn.innerHTML = '<i class="fa-regular fa-eye"></i>';
                        prevBtn.setAttribute("title", "Xem chi tiết");
                    }
                }
                allExpanded[i].parentNode.removeChild(allExpanded[i]);
            }

            tr.classList.add("dk-row-active");
            btn.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
            btn.setAttribute("title", "Thu gọn");

            var selected = window.__txGroupedRows[index];
            var rawRows = window.__txRawOutboundRows || [];
            var detailRows = rawRows.filter(function (r) {
                var dateStr = formatDateShort(parseDate(r.NgayXuatHang));
                return r.ItemCode === selected.ItemCode &&
                       r.MauVT === selected.MauVT &&
                       r.WidthSize === selected.WidthSize &&
                       r.MaLenh === selected.MaLenh &&
                       r.MaPhieuXH === selected.MaPhieuXH &&
                       dateStr === selected.DateDisplay;
            });

            var expandedTr = document.createElement("tr");
            expandedTr.className = "dk-tx-expanded-row";

            var subCols = [
                { key: "STT", label: "STT", number: 0, center: true, width: 40 },
                { key: "MaPhieuXH", label: "Nghiệp vụ XH", center: true, width: 90 },
                { key: "PINCC", label: "PI NCC", center: true, width: 110 },
                { key: "MaLenh", label: "Mã lệnh", center: true, width: 80 },
                { key: "TenKH", label: "Khách hàng", width: 120, center: true },
                { key: "TenHang", label: "Mã hàng", width: 120, center: true },
                { key: "SoLuong", label: "SL xuất", number: 2, center: true, width: 80 },
                { key: "Roll", label: "Roll", center: true, width: 80 },
                { key: "BarCode", label: "Barcode", center: true, width: 180 }
            ];

            var rowsWithStt = detailRows.map(function (r, idx) {
                return Object.assign({ STT: idx + 1 }, r);
            });

            var subTableId = "txSubTable_" + index;
            var subTableHtml = renderDetailTableInternal(subCols, rowsWithStt, 1000, subTableId);

            var metaHtml = 
                '<div class="dk-detail-meta" style="margin-bottom:12px; display:flex; flex-wrap:wrap; gap:16px; padding:10px 14px; background:var(--dk-bg-soft,#f1f5f9); border:1px dashed var(--dk-border,rgba(0,0,0,0.15)); border-radius:6px; font-size:12.5px; color:var(--dk-text,#1e293b); text-align:left;">' +
                '  <span class="dk-meta-item"><strong>Itemcode:</strong> <span style="font-family:Consolas,monospace; font-weight:700;">' + (selected.ItemCode || "") + '</span></span>' +
                '  <span class="dk-meta-item"><strong>Mô tả:</strong> ' + (selected.TenVT || "") + '</span>' +
                '  <span class="dk-meta-item"><strong>Màu VT:</strong> ' + (selected.MauVT || "") + '</span>' +
                '  <span class="dk-meta-item"><strong>Width/Size:</strong> ' + (selected.WidthSize || "") + '</span>' +
                '  <span class="dk-meta-item"><strong>Đơn vị:</strong> ' + (selected.DonViVT || "") + '</span>' +
                '</div>';

            var parentColCount = tr.cells.length;
            expandedTr.innerHTML = 
                '<td colspan="' + parentColCount + '" style="padding: 12px 16px; background: var(--dk-bg-soft,#f8fafc); border-left: 4px solid var(--dk-primary,#2563eb);">' +
                '  <div class="dk-tx-subtable-container" style="padding: 12px; background: var(--dk-bg,#ffffff); border: 1px solid var(--dk-border); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">' +
                '    <div style="font-size:12.5px; font-weight:700; color:var(--dk-primary,#2563eb); margin-bottom:8px; text-align:left;">' +
                '      <i class="fa-solid fa-list-ol"></i> Chi tiết cuộn/kiện xuất kho' +
                '    </div>' +
                metaHtml +
                subTableHtml +
                '  </div>' +
                '</td>';

            tr.parentNode.insertBefore(expandedTr, tr.nextSibling);
        };
    }
    
    // Bind search and filter events
    var btnFilter = byId("txBtnFilter");
    if (btnFilter) {
        btnFilter.addEventListener("click", function () {
            fetchAndPaint();
        });
    }
    
    var txtItemCode = byId("txItemCode");
    if (txtItemCode) {
        txtItemCode.addEventListener("input", function () {
            paint();
        });
    }
    
    // Run initial fetch
    fetchAndPaint();
}

function renderTongXuatItemRollsModal() {
    var content = byId(ids.detailModalContent);
    if (!content) return;
    
    var titleEl = byId(ids.detailModalTitle);
    if (titleEl) {
        titleEl.textContent = "Chi tiết cuộn/kiện xuất kho";
    }
    
    var selected = window.__txSelectedGroupItem;
    if (!selected) {
        content.innerHTML = modalErrorBox("Không tìm thấy thông tin vật tư đã chọn.");
        return;
    }
    
    // Filter the rawRows for matching details
    var rawRows = window.__txRawOutboundRows || [];
    var detailRows = rawRows.filter(function (r) {
        var dateStr = formatDateShort(parseDate(r.NgayXuatHang));
        return r.ItemCode === selected.ItemCode &&
               r.MauVT === selected.MauVT &&
               r.WidthSize === selected.WidthSize &&
               r.MaLenh === selected.MaLenh &&
               r.MaPhieuXH === selected.MaPhieuXH &&
               dateStr === selected.DateDisplay;
    });
    
    // Render Top Meta cards
    var metaHtml = 
        '<div class="dk-tx-detail-header" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;padding:16px;background:var(--dk-bg-soft);border:1px solid var(--dk-border);border-radius:8px;margin-bottom:16px;">' +
        '  <div class="dk-tx-meta-item">' +
        '    <div style="font-size:11px;color:var(--dk-text-muted-2,#64748b);font-weight:600;text-transform:uppercase;margin-bottom:4px;">Itemcode</div>' +
        '    <div style="font-size:14px;font-weight:700;font-family:Consolas,monospace;color:var(--dk-primary,#2563eb);">' + escapeHtml(selected.ItemCode) + '</div>' +
        '  </div>' +
        '  <div class="dk-tx-meta-item" style="grid-column:span 2;">' +
        '    <div style="font-size:11px;color:var(--dk-text-muted-2,#64748b);font-weight:600;text-transform:uppercase;margin-bottom:4px;">Mô tả</div>' +
        '    <div style="font-size:13px;font-weight:600;color:var(--dk-text);">' + escapeHtml(selected.TenVT) + '</div>' +
        '  </div>' +
        '  <div class="dk-tx-meta-item">' +
        '    <div style="font-size:11px;color:var(--dk-text-muted-2,#64748b);font-weight:600;text-transform:uppercase;margin-bottom:4px;">Màu VT</div>' +
        '    <div style="font-size:13px;font-weight:600;color:var(--dk-text);">' + escapeHtml(selected.MauVT) + '</div>' +
        '  </div>' +
        '  <div class="dk-tx-meta-item">' +
        '    <div style="font-size:11px;color:var(--dk-text-muted-2,#64748b);font-weight:600;text-transform:uppercase;margin-bottom:4px;">Width/size</div>' +
        '    <div style="font-size:13px;font-weight:600;color:var(--dk-text);">' + escapeHtml(selected.WidthSize) + '</div>' +
        '  </div>' +
        '  <div class="dk-tx-meta-item">' +
        '    <div style="font-size:11px;color:var(--dk-text-muted-2,#64748b);font-weight:600;text-transform:uppercase;margin-bottom:4px;">Đơn vị</div>' +
        '    <div style="font-size:13px;font-weight:600;color:var(--dk-text);">' + escapeHtml(selected.DonViVT) + '</div>' +
        '  </div>' +
        '</div>';
        
    // Compute total SL
    var totalSL = 0;
    detailRows.forEach(function (r) {
        totalSL += toNumber(r.SoLuong);
    });
    
    var summaryHtml = renderKpiSummaryStrip([
        { label: "Tổng SL xuất cuộn", value: formatNumber(totalSL, 2), sub: selected.DonViVT, cls: "good" },
        { label: "Số cuộn/kiện", value: formatNumber(detailRows.length, 0), sub: "cuộn", cls: "warn" }
    ]);
    
    // Columns: Nghiệp vụ xuất hàng | PI NCC | Mã lệnh | Khách hàng | Mã hàng | Column1 | SL xuất | Roll | Barcode
    var cols = [
        { key: "STT", label: "STT", number: 0, center: true, width: 50 },
        { key: "MaPhieuXH", label: "Nghiệp vụ XH", center: true, width: 90 },
        { key: "PINCC", label: "PI NCC", center: true, width: 110 },
        { key: "MaLenh", label: "Mã lệnh", center: true, width: 100 },
        { key: "TenKH", label: "Khách hàng", width: 120, center: true },
        { key: "TenHang", label: "Mã hàng", width: 120, center: true },
        { key: "SoLuong", label: "SL xuất", number: 2, center: true, width: 100 },
        { key: "Roll", label: "Roll", center: true, width: 100 },
        { key: "BarCode", label: "Barcode", center: true, width: 180 }
    ];
    
    var rowsWithStt = detailRows.map(function (r, index) {
        return Object.assign({ STT: index + 1 }, r);
    });
    
    var backBtnHtml = 
        '<div style="margin-bottom:12px; display:flex; align-items:center;">' +
        '  <button type="button" onclick="renderTongXuatDetailModal()" class="dk-btn-back" style="background:none; border:none; color:var(--dk-primary,#2563eb); font-weight:700; font-size:13px; cursor:pointer; display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:6px; transition: background 0.2s;" onmouseover="this.style.background=\'rgba(37,99,235,0.08)\'" onmouseout="this.style.background=\'none\'">' +
        '    <i class="fa-solid fa-arrow-left"></i> Quay lại danh sách' +
        '  </button>' +
        '</div>';
        
    // Summary on top, then Metadata details bar below it, then table!
    content.innerHTML = backBtnHtml + summaryHtml + metaHtml + '<div id="txItemRollsTableContainer" style="overflow-x:auto;">' + renderDetailTable(cols, rowsWithStt) + '</div>';
    
    var rcEl = byId("detailModalRowCount");
    if (rcEl) rcEl.textContent = "Tổng số cuộn: " + formatNumber(detailRows.length, 0);
    
    // Hide default modal search bar
    var sb = document.querySelector(".dk-modal-search-bar");
    if (sb) sb.style.display = "none";
}

function renderTonKhoDetailModal() {
    var content = byId(ids.detailModalContent);
    if (!content) return;
    var titleEl = byId(ids.detailModalTitle);
    if (titleEl) titleEl.textContent = "Chi tiết tồn kho — tại " + (state.dateFilter ? state.dateFilter.to : "");
    var tabs = [
        { key: "all", label: "Tất cả", icon: "fa-list" },
        { key: "nl", label: "Nguyên liệu", icon: "fa-leaf" },
        { key: "pl", label: "Phụ liệu", icon: "fa-boxes-stacked" },
        { key: "expired", label: "Sắp hết hạn", icon: "fa-clock" },
    ];
    var activeKey = "all";
    var allRows = [];
    function paint() {
        var sumSL = 0,
            sumGT = 0,
            soVT = {},
            soKe = {};
        allRows.forEach(function (r) {
            sumSL += toNumber(r.SLTon);
            // Bug6-fix: Dùng ThanhTien từ SP nếu có, else tính lại SLTon*DonGia
            sumGT += toNumber(r.ThanhTien) || (toNumber(r.SLTon) * toNumber(r.DonGia));
            soVT[r.ItemCode] = 1;
            soKe[r.ViTriKe] = 1;
        });
        content.innerHTML =
            renderKpiSummaryStrip([
                { label: "Tổng SL tồn", value: formatNumber(sumSL, 0), sub: "đơn vị", cls: "good" },
                { label: "Số mã VT", value: formatNumber(Object.keys(soVT).length, 0), sub: "ItemCode", cls: "warn" },
                { label: "Số kệ", value: formatNumber(Object.keys(soKe).length, 0), sub: "vị trí", cls: "neutral" },
                { label: "Giá trị tồn", value: formatVNDShort(sumGT), sub: "VND", cls: "danger" },
            ]) +
            renderKpiSubtabs(tabs, activeKey) +
            renderKpiFilterBar("Tìm ItemCode, tên VT, vị trí kệ...") +
            '<div id="kpiTbody"></div>';
        bindKpiSubtabs();
        bindKpiSearch(content, doFilter);
        doFilter();
    }
    function doFilter() {
        var q = (byId("kpiSearch").value || "").trim().toLowerCase();
        var filtered = q
            ? allRows.filter(function (r) {
                  var hay = (
                      (r.ItemCode || "") +
                      " " +
                      (r.TenVT || "") +
                      " " +
                      (r.ViTriKe || "") +
                      " " +
                      (r.POMua || "") +
                      " " +
                      (r.SoLo || "") +
                      " " +
                      (r.TenKH || "")
                  ).toLowerCase();
                  return hay.indexOf(q) >= 0;
              })
            : allRows;
        renderTable(filtered);
        var cnt = byId("kpiCount");
        if (cnt) cnt.textContent = filtered.length + " dòng";
        var rcEl = byId("detailModalRowCount");
        if (rcEl) rcEl.textContent = "Tổng số dòng: " + formatNumber(filtered.length, 0);
    }
    function renderTable(rows) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var rowsView = rows.map(function (r) {
            var hd = r.HanDung ? new Date(r.HanDung) : null;
            var dleft = hd ? Math.round((hd - today) / 86400000) : 999;
            var chipCls = dleft < 7 ? "danger" : dleft < 30 ? "warn" : "good";
            var chipText = dleft < 0 ? "Quá hạn " + Math.abs(dleft) + "d" : dleft + " ngày";
            return Object.assign({}, r, {
                _HanDung: '<span class="dk-status-chip dk-status-chip-' + chipCls + '">' + chipText + "</span>",
            });
        });
        var cols = [
            { key: "STT", label: "STT", number: 0, center: true, width: 50 },
            { key: "ItemCode", label: "ItemCode", width: 110, center: true },
            { key: "TenVT", label: "Mô tả", width: 220, center: true },
            { key: "LoaiKho", label: "Loại", center: true, width: 60 },
            { key: "DonVi", label: "ĐV", center: true, width: 50 },
            { key: "SLTon", label: "SL tồn", number: 1,center: true, width: 110 },
            { key: "ViTriKe", label: "Vị trí", center: true, width: 100 },
            { key: "_HanDung", label: "Hạn dùng", raw: true, center: true, width: 100 },
            { key: "POMua", label: "Số PO gần nhất", center: true, width: 130 },
            { key: "SoLo", label: "Số lô gần nhất", center: true, width: 130 },
            { key: "TenKH", label: "Khách hàng", width: 120, center: true },
            { key: "DonGia", label: "Đơn giá", number: 0, width: 80, center: true },
            { key: "ThanhTien", label: "Thành tiền", number: 0, width: 130, center: true },
        ];
        byId("kpiTbody").innerHTML = renderDetailTable(cols, rowsView);
    }
    function bindKpiSubtabs() {
        content.querySelectorAll(".dk-kk-subtab").forEach(function (b) {
            b.addEventListener("click", function () {
                content.querySelectorAll(".dk-kk-subtab").forEach(function (x) {
                    x.classList.remove("active");
                });
                this.classList.add("active");
                activeKey = this.getAttribute("data-tab-key");
                fetchData();
            });
        });
    }
    function fetchData() {
        content.innerHTML = modalLoading();
        requestJson(
            "/api/DashboardKhoDesktop/GetTonKhoChiTiet?denNgay=" +
                encodeURIComponent(state.dateFilter.to) +
                "&loai=" +
                encodeURIComponent(activeKey),
        )
            .then(function (d) {
                allRows = normalizeArray(d);
                paint();
            })
            .catch(function (err) {
                content.innerHTML = modalErrorBox(err && err.message);
            });
    }
    fetchData();
    var sb = document.querySelector(".dk-modal-search-bar");
    if (sb) sb.style.display = "none";
}

// ─── #5 PO đang trễ ──────────────────────────────────────────────
/** Render modal PO đang trễ - danh sách phiếu nhập quá hạn dự kiến. */
function renderPOTreDetailModal() {
    var content = byId(ids.detailModalContent);
    if (!content) return;
    var titleEl = byId(ids.detailModalTitle);
    if (titleEl) titleEl.textContent = "PO đã về kho — đang chờ kiểm";
    var tabs = [
        { key: "all", label: "Tất cả", icon: "fa-list" },
        { key: "chua_qc", label: "Chưa QC", icon: "fa-clipboard-question" },
        { key: "dang_qc", label: "Đang QC", icon: "fa-spinner" },
        { key: "da_qc_chua_nk", label: "Đã QC chưa nhập", icon: "fa-clipboard-check" },
    ];
    var activeKey = "all";
    var allRows = [];
    function paint() {
        var soNCC = {},
            treSmall = 0,
            treBig = 0;
        allRows.forEach(function (r) {
            soNCC[r.NCC] = 1;
            var h = toNumber(r.SoGioTre);
            if (h > 168) treBig++;
            else if (h <= 72) treSmall++;
        });
        content.innerHTML =
            renderKpiSummaryStrip([
                { label: "Tổng PO trễ", value: formatNumber(allRows.length, 0), sub: "PO", cls: "danger" },
                {
                    label: "Số NCC",
                    value: formatNumber(Object.keys(soNCC).length, 0),
                    sub: "nhà cung cấp",
                    cls: "warn",
                },
                { label: "Trễ ≤ 3 ngày", value: formatNumber(treSmall, 0), sub: "PO", cls: "good" },
                { label: "Trễ > 7 ngày", value: formatNumber(treBig, 0), sub: "PO", cls: "danger" },
            ]) +
            renderKpiSubtabs(tabs, activeKey) +
            renderKpiFilterBar("Tìm số PO, NCC...") +
            '<div id="kpiTbody"></div>';
        bindKpiSubtabs();
        bindKpiSearch(content, doFilter);
        doFilter();
    }
    function doFilter() {
        var q = (byId("kpiSearch").value || "").trim().toLowerCase();
        var filtered = q
            ? allRows.filter(function (r) {
                  var hay = ((r.POMua || "") + " " + (r.NCC || "")).toLowerCase();
                  return hay.indexOf(q) >= 0;
              })
            : allRows;
        renderTable(filtered);
        var cnt = byId("kpiCount");
        if (cnt) cnt.textContent = filtered.length + " dòng";
        var rcEl = byId("detailModalRowCount");
        if (rcEl) rcEl.textContent = "Tổng số dòng: " + formatNumber(filtered.length, 0);
    }
    function renderTable(rows) {
        var rowsView = rows.map(function (r) {
            var h = toNumber(r.SoGioTre);
            var cellCls = h > 168 ? "dk-cell-late-extreme" : h >= 48 ? "dk-cell-late-warn" : "";
            var ttCls = r.MaTT === "chua_qc" ? "danger" : r.MaTT === "dang_qc" ? "warn" : "good";
            return Object.assign({}, r, {
                _SoGio: '<span class="dk-cell-num ' + cellCls + '">' + formatNumber(h, 0) + " h</span>",
                _TrangThai:
                    '<span class="dk-status-chip dk-status-chip-' +
                    ttCls +
                    '">' +
                    escapeHtml(r.TrangThai || "") +
                    "</span>",
            });
        });
        var cols = [
            { key: "STT", label: "STT", number: 0, center: true, width: 50 },
            { key: "POMua", label: "Số PO", center: true, width: 130 },
            { key: "NCC", label: "NCC", width: 140, center: true },
            { key: "NgayDuKien", label: "Dự kiến", date: true, center: true, width: 100 },
            { key: "NgayVeThucTe", label: "Về thực tế", date: true, center: true, width: 100 },
            { key: "_SoGio", label: "Giờ trễ", raw: true, width: 90, center: true },
            { key: "SoVT", label: "Số VT", number: 0, center: true, width: 70 },
            { key: "SL", label: "SL", number: 1, width: 100, center: true },
            { key: "_TrangThai", label: "Trạng thái", raw: true, center: true, width: 140 },
        ];
        byId("kpiTbody").innerHTML = renderDetailTable(cols, rowsView);
    }
    function bindKpiSubtabs() {
        content.querySelectorAll(".dk-kk-subtab").forEach(function (b) {
            b.addEventListener("click", function () {
                content.querySelectorAll(".dk-kk-subtab").forEach(function (x) {
                    x.classList.remove("active");
                });
                this.classList.add("active");
                activeKey = this.getAttribute("data-tab-key");
                fetchData();
            });
        });
    }
    function fetchData() {
        content.innerHTML = modalLoading();
        requestJson("/api/DashboardKhoDesktop/GetPODangTreChiTiet?groupBy=" + encodeURIComponent(activeKey))
            .then(function (d) {
                allRows = normalizeArray(d);
                paint();
            })
            .catch(function (err) {
                content.innerHTML = modalErrorBox(err && err.message);
            });
    }
    fetchData();
    var sb = document.querySelector(".dk-modal-search-bar");
    if (sb) sb.style.display = "none";
}

/** Render modal danh sách công việc đầu việc cần xử lý (Todo list chi tiết). */
function renderTodoDetailModal() {
    var content = byId(ids.detailModalContent);
    if (!content) return;
    content.classList.add("dk-todo-modal-content");
    var BASE = "/api/DashboardKhoDesktop/";
    var tabs = [
        { key: "itemcode_cho_nk", label: "ItemCode chờ nhập kho", icon: "fa-clipboard-check", color: "blue" },
        { key: "kk_cho_duyet", label: "Kiểm kê chờ duyệt", icon: "fa-clipboard-list", color: "violet" },
        { key: "qc_da_kiem_chua_ky", label: "QC đã kiểm nhưng chưa ký", icon: "fa-file-signature", color: "green" },
        { key: "tra_hang_ncc_cho_duyet", label: "Trả hàng NCC chờ duyệt", icon: "fa-truck", color: "orange" },
    ];
    var tabHtml = '<div class="dk-todo-tab-strip">';
    for (var i = 0; i < tabs.length; i++) {
        tabHtml +=
            '<button type="button" class="dk-todo-tab dk-todo-tab-' +
            tabs[i].color +
            (i === 0 ? " active" : "") +
            '" data-todo-key="' +
            tabs[i].key +
            '">' +
            '<i class="fa-solid ' +
            tabs[i].icon +
            '"></i>' +
            '<span class="dk-todo-tab-label">' +
            escapeHtml(tabs[i].label) +
            "</span>" +
            '<span class="dk-todo-tab-badge" data-todo-badge="' +
            tabs[i].key +
            '">…</span>' +
            "</button>";
    }
    tabHtml += "</div>";
    tabHtml += '<div id="todoTabBody">' + modalLoading() + "</div>";
    content.innerHTML = tabHtml;

    var cache = {};
    function loadTab(key) {
        var body = byId("todoTabBody");
        if (!body) return;
        body.classList.remove("show");
        body.classList.add("fade-out");
        setTimeout(function () {
            body.classList.remove("fade-out");
            if (cache[key]) {
                paint(key, cache[key]);
                return;
            }
            body.innerHTML = modalLoading();
            setTimeout(function () { body.classList.add("show"); }, 10);
            requestJson(BASE + "GetTodoDetail?type=" + encodeURIComponent(key))
                .then(function (data) {
                    var rows = normalizeArray(data);
                    cache[key] = rows;
                    body.classList.remove("show");
                    body.classList.add("fade-out");
                    setTimeout(function () {
                        body.classList.remove("fade-out");
                        paint(key, rows);
                        var badge = document.querySelector('[data-todo-badge="' + key + '"]');
                        if (badge) badge.textContent = rows.length > 9999
                            ? (Math.round(rows.length / 1000) + 'k')
                            : String(rows.length);
                    }, 160);
                })
                .catch(function (err) {
                    body.classList.remove("fade-out");
                    body.innerHTML = modalErrorBox(err && err.message);
                    setTimeout(function () { body.classList.add("show"); }, 10);
                });
        }, 180);
    }
    function paint(key, rows) {
        var body = byId("todoTabBody");
        if (!body) return;
        if (rows.length === 0) {
            body.innerHTML =
                '<div class="dk-todo-empty"><i class="fa-solid fa-folder-open"></i><div>Không có item nào chờ xử lý</div></div>';
        } else {
            var searchBar =
                '<div class="dk-todo-searchbar">' +
                '<i class="fa-solid fa-magnifying-glass"></i>' +
                '<input type="text" id="todoSearch" placeholder="Tìm ItemCode, tên VT, PO mua, màu..." />' +
                '<button type="button" id="todoSearchClear" class="dk-todo-search-clear">&times;</button>' +
                '<span id="todoSearchCount" class="dk-todo-search-count">' +
                rows.length +
                " kết quả</span>" +
                "</div>";
            var commonHead = [
                { key: "STT", label: "STT", number: 0, center: true, width: 44 },
                { key: "ItemCode", label: "ItemCode", width: 110, center: true },
                { key: "_TenVT", label: "Mô tả", raw: true, width: 180, center: true },
                { key: "MaMauVT", label: "Mã màu", center: true, width: 80 },
                { key: "_MauVT", label: "Màu VT", raw: true, center: true, width: 130 },
            ];
            var commonTail = [{ key: "NgayTao", label: "Ngày tạo", date: true, center: true, width: 100 }];
            var cols;
            if (key === "itemcode_cho_nk") {
                cols = [
                    { key: "STT", label: "STT", number: 0, center: true, width: 45 },
                    { key: "ItemCode", label: "ItemCode", width: 100, center: true },
                    { key: "_TenVT", label: "Mô tả", raw: true, width: 350, center: true },
                    { key: "MaMauVT", label: "Mã màu", center: true, width: 80 },
                    { key: "_MauVT", label: "Màu VT", raw: true, center: true, width: 110 },
                    { key: "WidthSize", label: "Width/Size", center: true, width: 100 },
                    { key: "_SLMua", label: "SL mua", raw: true, center: true, width: 90 },
                    { key: "_SLVe", label: "SL về", raw: true, center: true, width: 90 },
                    { key: "NCC", label: "NCC", center: true, width: 150 },
                    { key: "NgayTao", label: "Ngày tạo", date: true, center: true, width: 90 }
                ];
            } else if (key === "kk_cho_duyet") {
                cols = commonHead.concat(
                    [
                        { key: "WidthSize", label: "Width/Size", center: true, width: 100 },
                        { key: "DonVi", label: "ĐV", center: true, width: 50 },
                        { key: "_TonKho", label: "Tồn kho", raw: true, width: 90, center: true },
                        { key: "_SLKiemKe", label: "SL kiểm kê", raw: true, width: 100, center: true },
                        { key: "_ChenhLech", label: "Chênh lệch", raw: true, center: true, width: 110 },
                    ],
                    commonTail,
                );
            } else if (key === "qc_da_kiem_chua_ky") {
                cols = [
                    { key: "STT", label: "STT", number: 0, center: true, width: 45 },
                    { key: "ItemCode", label: "ItemCode", width: 100, center: true },
                    { key: "_TenVT", label: "Mô tả", raw: true, width: 350 },
                    { key: "MaMauVT", label: "Mã màu", center: true, width: 80 },
                    { key: "_MauVT", label: "Màu VT", raw: true, center: true, width: 110 },
                    { key: "WidthSize", label: "Width/Size", center: true, width: 100 },
                    { key: "_SLKiem", label: "SL kiểm", raw: true, width: 90, center: true },
                    { key: "_SLVe", label: "SL về", raw: true, center: true, width: 90 },
                    { key: "NCC", label: "NCC", width: 150, center: true },
                    { key: "NgayTao", label: "Ngày tạo", date: true, center: true, width: 90 }
                ];
            } else if (key === "tra_hang_ncc_cho_duyet") {
                cols = commonHead.concat(
                    [
                        { key: "WidthSize", label: "Width/Size", center: true, width: 100 },
                        { key: "DonVi", label: "ĐV", center: true, width: 50 },
                        { key: "_TonKho", label: "Tồn kho", raw: true, width: 90, center: true },
                        { key: "_SLTra", label: "SL trả", raw: true, width: 100, center: true },
                        { key: "NCC", label: "NCC", width: 130, center: true },
                    ],
                    commonTail,
                );
            } else {
                cols = commonHead.concat([{ key: "DonVi", label: "ĐV", center: true, width: 50 }], commonTail);
            }
            function fmtSL(val, unit, extraCls) {
                if (val == null || val === "" || val === 0 || val === "0") return "";
                var cls = "dk-cell-num" + (extraCls ? " " + extraCls : "");
                return (
                    '<span class="' +
                    cls +
                    '">' +
                    formatNumber(toNumber(val), 1) +
                    (unit ? " " + escapeHtml(unit) : "") +
                    "</span>"
                );
            }
            var rowsView = rows.map(function (r) {
                var tenMau = r.MauVT ? String(r.MauVT).trim() : "";
                var mauVTHtml = tenMau
                    ? '<span class="dk-mau-swatch"></span><span class="dk-mau-text">' + escapeHtml(tenMau) + "</span>"
                    : "";
                var tenVT = r.TenVT ? String(r.TenVT) : "";
                var tenVTHtml =
                    '<span class="dk-cell-tenvt" style="max-width:none;white-space:normal;word-break:break-word;display:block;text-align:left;" title="' + escapeHtml(tenVT) + '">' + escapeHtml(tenVT) + "</span>";

                var slMuaHtml = fmtSL(r.SLMua);
                var slVeHtml = "";
                if (r.SLVe != null && r.SLVe !== "") {
                    var mua = toNumber(r.SLMua),
                        ve = toNumber(r.SLVe);
                    if (mua > 0 && ve < mua) {
                        slVeHtml = fmtSL(r.SLVe, null, "dk-cell-warn");
                    } else if (mua > 0 && ve === mua) {
                        slVeHtml =
                            '<i class="fa-solid fa-circle-check dk-cell-good" style="margin-right:4px"></i>' +
                            fmtSL(r.SLVe, null, "dk-cell-good");
                    } else {
                        slVeHtml = fmtSL(r.SLVe);
                    }
                }

                var chenhHtml = "";
                if (r.ChenhLech != null && r.ChenhLech !== "") {
                    var d = toNumber(r.ChenhLech);
                    var sign = d > 0 ? "+" : d < 0 ? "−" : "";
                    var cls = d > 0 ? "dk-cell-good" : d < 0 ? "dk-cell-danger" : "dk-cell-muted";
                    var unit = r.DonVi ? String(r.DonVi).trim() : "";
                    chenhHtml =
                        '<span class="dk-cell-num ' + cls + '">' + sign + formatNumber(Math.abs(d), 1) + (unit ? " " + escapeHtml(unit) : "") + "</span>";
                }

                return Object.assign({}, r, {
                    _TenVT: tenVTHtml,
                    _MauVT: mauVTHtml,
                    _SLMua: slMuaHtml,
                    _SLVe: slVeHtml,
                    _TonKho: fmtSL(r.TonKho, r.DonVi),
                    _SLKiemKe: fmtSL(r.SLKiemKe, r.DonVi),
                    _SLKiem: fmtSL(r.SLKiem, r.DonVi),
                    _SLTra: fmtSL(r.SLTra, r.DonVi),
                    _ChenhLech: chenhHtml,
                });
            });
            var useGrouped = true;
            body.innerHTML =
                searchBar + '<div id="todoTableWrap">' + (useGrouped
                    ? renderTodoGroupedTable(cols, rowsView, false)
                    : renderTodoFlatTable(cols, rowsView)) + "</div>";
        
            var rcEl = byId("detailModalRowCount");
            if (rcEl) rcEl.textContent = "Tổng số dòng: " + formatNumber(rows.length, 0);
     
            var searchInput = byId("todoSearch");
            var searchCount = byId("todoSearchCount");
            if (searchInput) {
                setTimeout(function () {
                    searchInput.focus();
                }, 150);
                searchInput.addEventListener("input", function () {
                    var q = (this.value || "").trim().toLowerCase();
                    var trs = body.querySelectorAll("#todoTableWrap tbody tr");
                    var visible = 0;
                    for (var ti = 0; ti < trs.length; ti++) {
                        var match = q === "" || trs[ti].textContent.toLowerCase().indexOf(q) >= 0;
                        trs[ti].style.display = match ? "" : "none";
                        if (match) visible++;
                    }
                    searchCount.textContent = visible + " kết quả";
                });
            }
            var clearBtn = byId("todoSearchClear");
            if (clearBtn)
                clearBtn.onclick = function () {
                    searchInput.value = "";
                    var ev = new Event("input");
                    searchInput.dispatchEvent(ev);
                    searchInput.focus();
                };
        }
        body.classList.remove("fade-out");
        setTimeout(function () {
            body.classList.add("show");
        }, 10);
    }
    var tabBtns = content.querySelectorAll(".dk-todo-tab");
    for (var ti = 0; ti < tabBtns.length; ti++) {
        tabBtns[ti].addEventListener("click", function () {
            var allBtns = content.querySelectorAll(".dk-todo-tab");
            for (var k = 0; k < allBtns.length; k++) allBtns[k].classList.remove("active");
            this.classList.add("active");
            loadTab(this.getAttribute("data-todo-key"));
        });
    }

    var initialKey = tabs[0].key;
    if (window.__dkPendingTodoType) {
        for (var pi = 0; pi < tabs.length; pi++) {
            if (tabs[pi].key === window.__dkPendingTodoType) {
                initialKey = tabs[pi].key;
                break;
            }
        }
        var allBtns = content.querySelectorAll(".dk-todo-tab");
        for (var ki = 0; ki < allBtns.length; ki++) {
            allBtns[ki].classList.toggle("active", allBtns[ki].getAttribute("data-todo-key") === initialKey);
        }
        window.__dkPendingTodoType = null;
    }
    loadTab(initialKey);
    var sb = document.querySelector(".dk-modal-search-bar");
    if (sb) sb.style.display = "none";
}

/** Render modal toàn bộ Top 5 Vật Tư chiếm dung tích nhất (có tìm kiếm). */
function renderTop5VTAllModal() {
    var content = byId(ids.detailModalContent);
    if (!content) return;
    content.innerHTML = modalLoading("Đang tải danh sách vật tư theo dung tích...");
    requestJson("/api/DashboardKhoDesktop/GetVatTuTheoDungTich")
        .then(function (data) {
            var rows = normalizeArray(data);
            var tongCBM = 0,
                slNL = 0,
                slPL = 0;
            for (var i = 0; i < rows.length; i++) {
                tongCBM += toNumber(rows[i].CBM);
                if (rows[i].LoaiKho === "NL") slNL++;
                else if (rows[i].LoaiKho === "PL") slPL++;
            }
            var avg = rows.length > 0 ? tongCBM / rows.length : 0;
            var sumHtml = renderSummaryStrip([
                { label: "Tổng CBM", value: formatNumber(tongCBM, 1), sub: rows.length + " mã VT" },
                { label: "Vật tư NL", value: formatNumber(slNL, 0), sub: "mã", kind: "primary" },
                { label: "Vật tư PL", value: formatNumber(slPL, 0), sub: "mã", kind: "warn" },
                { label: "Avg/mã", value: formatNumber(avg, 2), sub: "CBM" },
            ]);
            var cols = [
                { key: "STT", label: "#", number: 0, center: true, width: 40 },
                { key: "MaVT", label: "Mã VT", drillTo: "matCountDrill_codes", width: 130, center: true },
                { key: "TenVT", label: "Mô tả", width: 220, center: true },
                { key: "LoaiKho", label: "Loại", center: true, width: 70 },
                { key: "CBM", label: "CBM", number: 2, sortable: true, width: 100, center: true },
                { key: "TyTrong", label: "Tỷ trọng", percent: true, sortable: true, width: 90, center: true },
                { key: "ViTriKe", label: "Vị trí kệ", center: true, width: 100 },
            ];
            content.innerHTML =
                sumHtml + '<div id="top5VTBodyTbl">' + renderSortableTable(cols, rows, { highlightTopN: 5 }) + "</div>";
            wireSortableTable(byId("top5VTBodyTbl"), cols, rows, { highlightTopN: 5 });
            var rcEl = byId("detailModalRowCount");
            if (rcEl) rcEl.textContent = "Tổng số dòng: " + formatNumber(rows.length, 0);
        
            content.querySelectorAll("[data-mavt-drill]").forEach(function (el) {
                el.addEventListener("click", function (e) {
                    e.preventDefault();
                    openDetail("matCountDrill_codes", -1);
                });
            });
        })
        .catch(function (err) {
            content.innerHTML = modalErrorBox(err && err.message);
        });
}


//  — Modal: Top 5 KH 
/** Render modal toàn bộ Top Khách Hàng tồn kho (có drill-down vào từng khách). */
function renderTop5KHAllModal() {
    var content = byId(ids.detailModalContent);
    if (!content) return;
    content.innerHTML = modalLoading("Đang tải danh sách khách hàng theo giá trị tồn...");
    requestJson("/api/DashboardKhoDesktop/GetKhachHangTonKhoChiTiet")
        .then(function (data) {
            var rows = normalizeArray(data);
            var tongGT = 0,
                kt = 0;
            for (var i = 0; i < rows.length; i++) {
                tongGT += toNumber(rows[i].GiaTri);
                if (rows[i].KhachHang === "Khách trống") kt = toNumber(rows[i].GiaTri);
            }
            var avg = rows.length > 0 ? tongGT / rows.length : 0;
            var sumHtml = renderSummaryStrip([
                { label: "Tổng giá trị (VND)", value: formatNumber(tongGT, 0) },
                { label: "Số khách", value: formatNumber(rows.length, 0), sub: "khách hàng", kind: "primary" },
                { label: "Khách trống", value: formatNumber(kt, 0), sub: "VND", kind: "warn" },
                { label: "Avg/khách", value: formatNumber(avg, 0), sub: "VND" },
            ]);
   
            var maxPct = 0;
            for (var j = 0; j < rows.length; j++) {
                if (toNumber(rows[j].TyTrong) > maxPct) maxPct = toNumber(rows[j].TyTrong);
            }
            var tableHtml =
                '<table class="dk-detail-table dk-top5kh-table"><thead><tr>' +
                '<th style="width:40px;text-align:center">#</th>' +
                "<th>Khách hàng</th>" +
                '<th style="width:100px">Mã KH</th>' +
                '<th style="width:80px;text-align:right">Số mã VT</th>' +
                '<th style="width:100px;text-align:right">Tổng CBM</th>' +
                '<th style="width:140px;text-align:right">Giá trị tồn (VND)</th>' +
                '<th style="width:180px">Tỷ trọng</th>' +
                "</tr></thead><tbody>";
            for (var k = 0; k < rows.length; k++) {
                var r = rows[k];
                var p = toNumber(r.TyTrong);
                var pBarW = maxPct > 0 ? (p / maxPct) * 100 : 0;
                tableHtml +=
                    '<tr class="dk-row-kh js-open-detail clickable" data-detail="customerRow" data-makh="' +
                    escapeHtml(r.MaKH || "") +
                    '" data-tenkh="' +
                    escapeHtml(r.KhachHang || "") +
                    '">' +
                    '<td style="text-align:center">' +
                    escapeHtml(r.STT) +
                    "</td>" +
                    "<td>" +
                    escapeHtml(r.KhachHang || "") +
                    "</td>" +
                    '<td class="dk-cell-mono">' +
                    escapeHtml(r.MaKH || "") +
                    "</td>" +
                    '<td class="text-end dk-cell-num">' +
                    formatNumber(toNumber(r.SoMaVT), 0) +
                    "</td>" +
                    '<td class="text-end dk-cell-num">' +
                    formatNumber(toNumber(r.TongCBM), 4) +
                    "</td>" +
                    '<td class="text-end dk-cell-num">' +
                    formatNumber(toNumber(r.GiaTri), 0) +
                    "</td>" +
                    '<td><div class="dk-pct-bar-wrap"><div class="dk-pct-bar-fill" style="width:' +
                    pBarW.toFixed(1) +
                    '%"></div><span class="dk-pct-bar-label">' +
                    formatNumber(p, 1) +
                    "%</span></div></td>" +
                    "</tr>";
            }
            tableHtml += "</tbody></table>";
            content.innerHTML = sumHtml + tableHtml;
            var rcEl = byId("detailModalRowCount");
            if (rcEl) rcEl.textContent = "Tổng số dòng: " + formatNumber(rows.length, 0);
            content.querySelectorAll(".dk-row-kh").forEach(function (tr) {
                tr.addEventListener("click", function () {
                    var customerItem = { MaKH: this.getAttribute("data-makh"), TenKH: this.getAttribute("data-tenkh") };
                    _detailStack.push({ detail: _currentDetail, index: _currentDetailIndex });
                    _currentDetail = "_customerRow_drill";
                    _currentDetailIndex = -1;
                    renderDetailModalDirect({
                        title: "Vị trí kệ — " + (customerItem.TenKH || customerItem.MaKH),
                        rows: [],
                        columns: [],
                        customDrillCustomer: customerItem,
                    });
                });
            });
        })
        .catch(function (err) {
            content.innerHTML = modalErrorBox(err && err.message);
        });
}

/** Tải và hiển thị chi tiết vật tư của một khách hàng cụ thể trong modal. */
function loadCustomerMaterialDetail(customerItem) {
    var content = byId(ids.detailModalContent);
    if (!content) return;
    content.innerHTML = modalLoading("Đang tải chi tiết vật tư của khách hàng...");

    var maOrTen = customerItem.MaKH || customerItem.TenKH;
    requestJson("/api/DashboardKhoDesktop/GetVatTuTheoKhachHang?maKH=" + encodeURIComponent(maOrTen))
        .then(function (data) {
            var rows = normalizeArray(data);
            if (rows.length === 0) {
                content.innerHTML =
                    '<div class="dk-empty" style="padding:30px">Khách hàng "' +
                    (customerItem.TenKH || customerItem.MaKH) +
                    '" chưa có vật tư tồn kho.</div>';
                return;
            }

            var sumQty = 0,
                sumCBM = 0;
            for (var i = 0; i < rows.length; i++) {
                sumQty += toNumber(rows[i].SoLuong);
                sumCBM += toNumber(rows[i].TongCBM);
            }

            var sumHtml = renderSummaryStrip([
                { label: "Tổng số lượng", value: formatNumber(sumQty, 0) },
                { label: "Tổng CBM", value: formatNumber(sumCBM, 4), kind: "primary" },
                { label: "Số mặt hàng", value: formatNumber(rows.length, 0), kind: "success" },
            ]);

            var tableHtml =
                '<div class="dk-detail-table-wrap"><table class="dk-detail-table"><thead><tr>' +
                '<th style="width:40px;text-align:center">#</th>' +
                '<th style="width:140px">Mã vật tư</th>' +
                '<th style="width:250px">Mô tả</th>' +
                '<th style="width:80px;text-align:center">Màu</th>' +
                '<th style="width:80px;text-align:center">Khổ</th>' +
                '<th style="width:110px;text-align:right">Số lượng</th>' +
                '<th style="width:110px;text-align:right">Tổng CBM</th>' +
                '<th style="width:120px;text-align:center">Vị trí kệ</th>' +
                "</tr></thead><tbody>";

            for (var k = 0; k < rows.length; k++) {
                var r = rows[k];
                tableHtml +=
                    "<tr>" +
                    '<td style="text-align:center">' +
                    (k + 1) +
                    "</td>" +
                    '<td class="dk-cell-mono">' +
                    escapeHtml(r.ItemCode || "") +
                    "</td>" +
                    '<td style="text-align:left">' +
                    escapeHtml(r.TenVT || "") +
                    "</td>" +
                    '<td class="text-center">' +
                    escapeHtml(r.Mau || "") +
                    "</td>" +
                    '<td class="text-center">' +
                    escapeHtml(r.KhoVai || "") +
                    "</td>" +
                    '<td class="text-end dk-cell-num">' +
                    formatNumber(toNumber(r.SoLuong), 0) +
                    "</td>" +
                    '<td class="text-end dk-cell-num">' +
                    formatNumber(toNumber(r.TongCBM), 4) +
                    "</td>" +
                    '<td class="text-center"><span class="dk-status-chip dk-status-chip-good">' +
                    escapeHtml(r.ViTriKe || "") +
                    "</span></td>" +
                    "</tr>";
            }
            tableHtml += "</tbody></table></div>";
            content.innerHTML = sumHtml + tableHtml;

            var rcEl = byId("detailModalRowCount");
            if (rcEl) rcEl.textContent = "Tổng số dòng: " + formatNumber(rows.length, 0);
        })
        .catch(function (err) {
            content.innerHTML = modalErrorBox(err && err.message);
        });
}

// ════════════════════════════════════════════════════════════════
// Modal: Vật tư sắp hết hạn
// ════════════════════════════════════════════════════════════════
/** Render modal danh sách vật tư sắp hết hạn lưu kho (full list có tìm kiếm). */
function renderHetHanAllModal() {
    var content = byId(ids.detailModalContent);
    if (!content) return;
    content.innerHTML = modalLoading();
    requestJson("/api/DashboardKhoDesktop/GetVatTuSapHetHanChiTiet")
        .then(function (data) {
            var rows = normalizeArray(data);
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            rows.forEach(function (r) {
                r._ConLai = r.NgayHetHan ? Math.round((new Date(r.NgayHetHan) - today) / 86400000) : 0;
            });
            rows.sort(function (a, b) {
                return a._ConLai - b._ConLai;
            });
            var quaHan = 0,
                w7 = 0,
                w30 = 0;
            for (var i = 0; i < rows.length; i++) {
                var cl = rows[i]._ConLai;
                if (cl <= 0) quaHan++;
                else if (cl <= 7) w7++;
                else if (cl <= 30) w30++;
            }
            var sumHtml = renderSummaryStrip([
                { label: "Tổng vật tư", value: formatNumber(rows.length, 0) },
                { label: "Quá hạn", value: formatNumber(quaHan, 0), kind: "danger" },
                { label: "≤ 7 ngày", value: formatNumber(w7, 0), kind: "danger" },
                { label: "≤ 30 ngày", value: formatNumber(w30, 0), kind: "warn" },
            ]);
            var filterHtml =
                '<div class="dk-modal-filter-bar">' +
                '<label class="dk-text-muted">Lọc:</label>' +
                '<select id="hetHanFilter" class="dk-filter-select-inline">' +
                '<option value="all">Tất cả</option>' +
                '<option value="qh">Quá hạn</option>' +
                '<option value="7">≤ 7 ngày</option>' +
                '<option value="30">≤ 30 ngày</option>' +
                '<option value="90">≤ 90 ngày</option>' +
                "</select>" +
                "</div>";
            var tableHtml =
                '<table class="dk-detail-table"><thead><tr>' +
                '<th style="width:110px">Mã VT</th><th>Mô tả</th>' +
                '<th style="width:50px;text-align:center">Loại</th>' +
                '<th style="width:80px">Lô</th>' +
                '<th style="width:90px;text-align:center">Ngày SX</th>' +
                '<th style="width:100px;text-align:center">Hết hạn</th>' +
                '<th style="width:90px;text-align:center">Còn lại</th>' +
                '<th style="width:80px;text-align:right">Tồn kho</th>' +
                '<th style="width:50px;text-align:center">ĐV</th>' +
                '<th style="width:80px">Vị trí</th></tr></thead><tbody id="hetHanTbody">';
            tableHtml += hetHanRowsHtml(rows);
            tableHtml += "</tbody></table>";
            content.innerHTML = sumHtml + filterHtml + tableHtml;
            var rcEl = byId("detailModalRowCount");
            if (rcEl) rcEl.textContent = "Tổng số dòng: " + formatNumber(rows.length, 0);
            byId("hetHanFilter").addEventListener("change", function () {
                var v = this.value;
                var filtered = rows.filter(function (r) {
                    var cl = r._ConLai;
                    if (v === "qh") return cl <= 0;
                    if (v === "7") return cl > 0 && cl <= 7;
                    if (v === "30") return cl > 0 && cl <= 30;
                    if (v === "90") return cl > 0 && cl <= 90;
                    return true;
                });
                byId("hetHanTbody").innerHTML = hetHanRowsHtml(filtered);
                var rcEl = byId("detailModalRowCount");
                if (rcEl) rcEl.textContent = "Tổng số dòng: " + formatNumber(filtered.length, 0);
            });
        })
        .catch(function (err) {
            content.innerHTML = modalErrorBox(err && err.message);
        });
}

function hetHanRowsHtml(rows) {
    if (rows.length === 0) return '<tr><td colspan="10" class="dk-empty">Không có vật tư phù hợp bộ lọc</td></tr>';
    return rows
        .map(function (r) {
            var cl = r._ConLai;
            var cls =
                cl <= 0
                    ? "dk-conlai-overdue"
                    : cl <= 7
                      ? "dk-conlai-urgent"
                      : cl <= 30
                        ? "dk-conlai-warn"
                        : "dk-conlai-soft";
            var icon = cl <= 0 ? '<i class="fa-solid fa-triangle-exclamation"></i> ' : "";
            return (
                "<tr>" +
                '<td class="dk-cell-mono">' +
                escapeHtml(r.MaVT || "") +
                "</td>" +
                "<td>" +
                escapeHtml(r.TenVT || "") +
                "</td>" +
                '<td class="text-center">' +
                escapeHtml(r.LoaiKho || "") +
                "</td>" +
                "<td>" +
                escapeHtml(r.Lo || "") +
                "</td>" +
                '<td class="text-center">' +
                formatDate(r.NgaySX) +
                "</td>" +
                '<td class="text-center">' +
                formatDate(r.NgayHetHan) +
                "</td>" +
                '<td class="text-center ' +
                cls +
                '">' +
                icon +
                (cl <= 0 ? "Quá " + Math.abs(cl) : cl) +
                " ngày</td>" +
                '<td class="text-end dk-cell-num">' +
                formatNumber(toNumber(r.TonKho), 1) +
                "</td>" +
                '<td class="text-center">' +
                escapeHtml(r.DonVi || "") +
                "</td>" +
                "<td>" +
                escapeHtml(r.ViTri || "") +
                "</td>" +
                "</tr>"
            );
        })
        .join("");
}

// ════════════════════════════════════════════════════════════════
// Modal: Giá trị nhóm
// ════════════════════════════════════════════════════════════════
/** Render modal giá trị tồn kho phân theo nhóm vật tư. */
function renderGiaTriNhomAllModal() {
    var content = byId(ids.detailModalContent);
    if (!content) return;
    content.innerHTML = modalLoading();
    requestJson("/api/DashboardKhoDesktop/GetGiaTriNhomChiTiet")
        .then(function (data) {
            var rows = normalizeArray(data);
            var groups = rows.filter(function (r) {
                return toNumber(r.IsGroup) === 1;
            });
            var subs = rows.filter(function (r) {
                return toNumber(r.IsGroup) === 0;
            });
            var byParent = {};
            subs.forEach(function (s) {
                var p = s.ParentNhom;
                if (!byParent[p]) byParent[p] = [];
                byParent[p].push(s);
            });
            var html =
                '<div id="giaTriNhomDonut" class="dk-nhom-donut-modal" style="min-height:500px; height:500px; margin-bottom:30px; overflow:visible;"></div>';
            html +=
                '<table class="dk-detail-table dk-tree-table"><thead><tr>' +
                '<th style="width:36px"></th>' +
                '<th style="width:40px">STT</th>' +
                "<th>Nhóm</th>" +
                '<th style="width:90px;text-align:right">Số mã VT</th>' +
                '<th style="width:100px;text-align:right">Tổng CBM</th>' +
                '<th style="width:140px;text-align:right">Giá trị</th>' +
                '<th style="width:100px;text-align:right">Tỷ trọng</th>' +
                "</tr></thead><tbody>";
            for (var i = 0; i < groups.length; i++) {
                var g = groups[i];
                var subList = byParent[g.Nhom] || [];
                html +=
                    '<tr class="dk-tree-row dk-tree-group" data-nhom="' +
                    escapeHtml(g.Nhom) +
                    '">' +
                    '<td class="text-center"><button type="button" class="dk-tree-toggle" data-nhom-toggle="' +
                    escapeHtml(g.Nhom) +
                    '"><i class="fa-solid fa-chevron-right"></i></button></td>' +
                    '<td class="text-center">' +
                    g.STT +
                    "</td>" +
                    "<td><b>" +
                    escapeHtml(g.Nhom) +
                    "</b></td>" +
                    '<td class="text-end dk-cell-num">' +
                    formatNumber(toNumber(g.SoMaVT), 0) +
                    "</td>" +
                    '<td class="text-end dk-cell-num">' +
                    formatNumber(toNumber(g.TongCBM), 4) +
                    "</td>" +
                    '<td class="text-end dk-cell-num">' +
                    formatNumber(toNumber(g.GiaTri), 0) +
                    "</td>" +
                    '<td class="text-end dk-cell-num">' +
                    formatNumber(toNumber(g.TyTrong), 1) +
                    "%</td>" +
                    "</tr>";
                if (subList.length > 0) {
                    html +=
                        '<tr class="dk-tree-sub-wrap" data-nhom-sub="' +
                        escapeHtml(g.Nhom) +
                        '" style="display:none"><td colspan="7">' +
                        '<table class="dk-tree-sub-table"><thead><tr>' +
                        '<th style="width:130px">Mã VT</th><th>Mô tả</th>' +
                        '<th style="width:90px;text-align:right">CBM</th>' +
                        '<th style="width:140px;text-align:right">Giá trị</th>' +
                        "</tr></thead><tbody>";
                    for (var j = 0; j < subList.length; j++) {
                        var s = subList[j];
                        html +=
                            '<tr><td class="dk-cell-mono">' +
                            escapeHtml(s.MaVT || "") +
                            "</td>" +
                            "<td>" +
                            escapeHtml(s.Nhom || "") +
                            "</td>" +
                            '<td class="text-end dk-cell-num">' +
                            formatNumber(toNumber(s.TongCBM), 4) +
                            "</td>" +
                            '<td class="text-end dk-cell-num">' +
                            formatNumber(toNumber(s.GiaTri), 0) +
                            "</td></tr>";
                    }
                    html += "</tbody></table></td></tr>";
                }
            }
            html += "</tbody></table>";
            content.innerHTML = html;
            var rcEl = byId("detailModalRowCount");
            if (rcEl) rcEl.textContent = "Tổng số dòng: " + formatNumber(groups.length, 0);
            // Render donut Highcharts
            if (typeof Highcharts !== "undefined" && groups.length > 0) {
                applyHighchartsTheme();
                Highcharts.chart("giaTriNhomDonut", {
                    chart: { type: "pie", backgroundColor: "transparent", height: 460 },
                    title: { text: null },
                    credits: { enabled: false },
                    tooltip: {
                        useHTML: true,
                        pointFormat:
                            "<b>{point.name}</b><br/>Giá trị: <b>{point.y:,.0f} VND</b><br/>Tỷ trọng: <b>{point.pct:.1f}%</b>",
                    },
                    plotOptions: {
                        pie: {
                            innerSize: "55%",
                            borderWidth: 2,
                            showInLegend: true,
                            dataLabels: {
                                enabled: true,
                                distance: 15,
                                allowOverlap: true,
                                format: "{point.name}<br/>{point.pct:.1f}%",
                                style: { fontSize: "10px", textOutline: "none" },
                            },
                        },
                    },
                    legend: {
                        enabled: true,
                        layout: "horizontal",
                        align: "center",
                        verticalAlign: "bottom",
                        itemStyle: { fontSize: "11px", fontWeight: "500" },
                    },
                    series: [
                        {
                            name: "Giá trị",
                            colorByPoint: true,
                            data: groups.map(function (g) {
                                return { name: g.Nhom, y: toNumber(g.GiaTri), pct: toNumber(g.TyTrong) };
                            }),
                        },
                    ],
                });
            }
            content.querySelectorAll(".dk-tree-toggle").forEach(function (btn) {
                btn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    var nhom = this.getAttribute("data-nhom-toggle");
                    var sub = content.querySelector('[data-nhom-sub="' + nhom + '"]');
                    if (!sub) return;
                    var icon = this.querySelector("i");
                    if (sub.style.display === "none") {
                        sub.style.display = "";
                        if (icon) icon.classList.replace("fa-chevron-right", "fa-chevron-down");
                    } else {
                        sub.style.display = "none";
                        if (icon) icon.classList.replace("fa-chevron-down", "fa-chevron-right");
                    }
                });
            });
        })
        .catch(function (err) {
            content.innerHTML = modalErrorBox(err && err.message);
        });
}

// ════════════════════════════════════════════════════════════════
//  Modal: Kiểm kê
// ════════════════════════════════════════════════════════════════
/** Render modal Tình hình kiểm kê: bảng phiếu kiểm kê có lọc tab + tìm kiếm. */
function renderKiemKeAllModal() {
    var content = byId(ids.detailModalContent);
    if (!content) return;
    content.innerHTML = modalLoading();
    requestJson("/api/DashboardKhoDesktop/GetKiemKeChiTiet")
        .then(function (data) {
            var rows = normalizeArray(data);
            var totalCheckedItems = 0;
            var totalUncheckedItems = 0;
            var cSheetsCompleted = 0;
            var cSheetsUnchecked = 0;
            var kvs = {};
            for (var i = 0; i < rows.length; i++) {
                var r = rows[i];
                var s = toNumber(r.Status);
                var da = toNumber(r.DaKiem);
                var t = toNumber(r.Tong);

                totalCheckedItems += da;
                totalUncheckedItems += t - da;
                kvs[r.KhuVuc] = 1;

                if (s === 1 || s === 2) {
                    cSheetsCompleted++;
                } else {
                    cSheetsUnchecked++;
                }
            }
            var sumHtml = renderKpiSummaryStrip(
                [
                    {
                        label: "Đã kiểm",
                        value: formatNumber(totalCheckedItems, 0),
                        sub: "Trong " + cSheetsCompleted + " phiếu",
                        cls: "good",
                    },
                    {
                        label: "Chưa kiểm",
                        value: formatNumber(totalUncheckedItems, 0),
                        sub: "Trong " + cSheetsUnchecked + " phiếu",
                        cls: "danger",
                    },
                ],
                "dk-kiemke-summary",
            );
            var tabs = [
                { key: "0", label: "Tất cả (" + rows.length + ")", icon: "fa-list" },
                { key: "1", label: "Đã kiểm (" + cSheetsCompleted + ")", icon: "fa-circle-check" },
                { key: "3", label: "Chưa kiểm (" + cSheetsUnchecked + ")", icon: "fa-circle-xmark" },
            ];
            var activeKey = "0";
            var tabHtml = renderKpiSubtabs(tabs, activeKey);
            var kvOpts = '<option value="">Tất cả khu vực</option>';
            Object.keys(kvs)
                .sort()
                .forEach(function (k) {
                    kvOpts += '<option value="' + escapeHtml(k) + '">' + escapeHtml(k) + "</option>";
                });
            var filterHtml =
                '<div class="dk-modal-filter-bar">' +
                '<i class="fa-solid fa-magnifying-glass"></i>' +
                '<input type="text" id="kkSearch" class="dk-kk-search" placeholder="Tìm mã phiếu, người phụ trách..." />' +
                '<select id="kkKhuVuc" class="dk-filter-select-inline">' +
                kvOpts +
                "</select>" +
                '<span id="kkCount" class="dk-text-muted" style="display: none;"></span>' +
                "</div>";
            var tableWrapHtml = '<div id="kpiTbody"></div>';
            content.innerHTML = sumHtml + tabHtml + filterHtml + tableWrapHtml;
            var cols = [
                { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                { key: "MaPhieu", label: "Mã phiếu", center: true, width: 120 },
                { key: "NgayBatDau", label: "Ngày BĐ", date: true, center: true, width: 110 },
                { key: "KhuVuc", label: "Khu vực" },
                { key: "SoMa", label: "Số mã", number: 0, center: true, width: 80 },
                { key: "_DaTrenTong", label: "Đã/Tổng", raw: true, center: true, width: 120 },
                { key: "Pct", label: "%", percent: true, width: 80, center: true },
                { key: "NguoiPT", label: "Người phụ trách" },
                { key: "_TrangThai", label: "Trạng thái", raw: true, center: true, width: 120 },
            ];
            function refilter() {
                var q = (byId("kkSearch").value || "").trim().toLowerCase();
                var kv = byId("kkKhuVuc").value;
                var filtered = rows.filter(function (r) {
                    var s = toNumber(r.Status);
                    if (activeKey === "1") {
                        if (s !== 1 && s !== 2) return false;
                    } else if (activeKey === "3") {
                        if (s !== 3) return false;
                    }
                    if (kv && r.KhuVuc !== kv) return false;
                    if (q) {
                        var hay = ((r.MaPhieu || "") + " " + (r.NguoiPT || "") + " " + (r.KhuVuc || "")).toLowerCase();
                        if (hay.indexOf(q) < 0) return false;
                    }
                    return true;
                });
                var mappedRows = filtered.map(function (r, idx) {
                    var s = toNumber(r.Status);
                    var chipCls = s === 1 ? "good" : s === 2 ? "warn" : "danger";
                    return Object.assign({}, r, {
                        STT: idx + 1,
                        _DaTrenTong: formatNumber(toNumber(r.DaKiem), 0) + " / " + formatNumber(toNumber(r.Tong), 0),
                        _TrangThai:
                            '<span class="dk-status-chip dk-status-chip-' +
                            chipCls +
                            '">' +
                            escapeHtml(r.TrangThai || "") +
                            "</span>",
                    });
                });
                byId("kpiTbody").innerHTML = renderDetailTable(cols, mappedRows);
                byId("kkCount").textContent = filtered.length + " phiếu";
                var rcEl = byId("detailModalRowCount");
                if (rcEl) rcEl.textContent = "Tổng số dòng: " + formatNumber(filtered.length, 0);
            }
            content.querySelectorAll(".dk-kk-subtab").forEach(function (b) {
                b.addEventListener("click", function () {
                    content.querySelectorAll(".dk-kk-subtab").forEach(function (x) {
                        x.classList.remove("active");
                    });
                    this.classList.add("active");
                    activeKey = this.getAttribute("data-tab-key");
                    refilter();
                });
            });
            byId("kkSearch").addEventListener("input", refilter);
            byId("kkKhuVuc").addEventListener("change", refilter);
            refilter();
        })
        .catch(function (err) {
            content.innerHTML = modalErrorBox(err && err.message);
        });
}


/** Render modal chi tiết cảnh báo tồn kho (mức độ nguy hiểm/chú ý). */
function renderAlertDetailModal() {
    var content = byId(ids.detailModalContent);
    if (!content) return;
    var code = window.__dkPendingAlertCode || "po_tre";
    var name = window.__dkPendingAlertName || "Cảnh báo";
    window.__dkPendingAlertCode = null;
    window.__dkPendingAlertName = null;

    var titleEl = byId(ids.detailModalTitle);
    if (titleEl) titleEl.textContent = "Chi tiết cảnh báo — " + name;

     
    var alertMap = {
        po_tre: {
            api: "/api/DashboardKhoDesktop/GetPODangTreChiTiet?groupBy=all",
            cls: "danger",
            cols: [
                { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                { key: "POMua", label: "Số PO", center: true, width: 130 },
                { key: "NCC", label: "NCC" },
                { key: "MaHang", label: "Mã hàng", center: true, width: 120 },
                { key: "SoVT", label: "Số VT", number: 0, center: true, width: 80 },
                { key: "SL", label: "Tổng SL", number: 2, width: 100, center: true },
                { key: "NgayNKDuKien", label: "Dự kiến", date: true, center: true, width: 100 },
                { key: "SoGioTre", label: "Trễ (giờ)", number: 0, width: 90 },
                { key: "TrangThai", label: "Trạng thái", center: true, width: 110 },
            ],
        },
        npl_thieu: {
            api: "/api/DashboardKhoDesktop/GetNPLThieuChiTiet",
            cls: "danger",
            cols: [
                { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                { key: "ItemCode", label: "ItemCode", width: 120 },
                { key: "TenVT", label: "Mô tả" },
                { key: "LenhSX", label: "Lệnh SX", center: true, width: 130 },
                { key: "DonVi", label: "ĐV", center: true, width: 50 },
                { key: "SLCan", label: "SL cần", number: 1, width: 100 },
                { key: "SLCo", label: "SL có", number: 1, width: 100 },
                { key: "SLThieu", label: "Thiếu", number: 1, width: 100 },
            ],
        },
        kk_lech: {
            api: "/api/DashboardKhoDesktop/GetKiemKeLechChiTiet",
            cls: "warn",
            cols: [
                { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                { key: "MaPhieu", label: "Mã phiếu", center: true, width: 110 },
                { key: "KhuVuc", label: "Khu vực" },
                { key: "SLHeThong", label: "SL hệ thống", number: 1, width: 120 },
                { key: "SLThucKiem", label: "SL thực kiểm", number: 1, width: 120 },
                { key: "LechPct", label: "Lệch (%)", number: 2, width: 100 },
                { key: "NguoiPT", label: "Người phụ trách" },
            ],
        },
        ton_vuot_dm: {
            api: "/api/DashboardKhoDesktop/GetTonVuotDinhMucChiTiet",
            cls: "danger",
            cols: [
                { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                { key: "ItemCode", label: "ItemCode", width: 120 },
                { key: "TenVT", label: "Mô tả" },
                { key: "DonVi", label: "ĐV", center: true, width: 50 },
                { key: "SLTon", label: "SL tồn", number: 1, width: 100 },
                { key: "DinhMuc", label: "Định mức", number: 1, width: 100 },
                { key: "VuotPct", label: "Vượt (%)", number: 2, width: 100 },
                { key: "ViTriKe", label: "Vị trí", center: true, width: 90 },
            ],
        },
    };
    var cfg = alertMap[code] || alertMap.po_tre;
    var allRows = [];
    function paint() {
        content.innerHTML =
            renderKpiSummaryStrip([
                { label: "Tổng cảnh báo", value: formatNumber(allRows.length, 0), sub: "dòng", cls: cfg.cls },
                {
                    label: "Mức độ",
                    value: cfg.cls === "danger" ? "Nghiêm trọng" : cfg.cls === "warn" ? "Cảnh báo" : "Thông tin",
                    sub: "",
                    cls: cfg.cls,
                },
                {
                    label: "Cập nhật",
                    value: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
                    sub: "hôm nay",
                    cls: "neutral",
                },
            ]) +
            renderKpiFilterBar("Tìm nhanh trong bảng...") +
            '<div id="kpiTbody"></div>';
        bindKpiSearch(content, doFilter);
        doFilter();
    }
    function doFilter() {
        var q = (byId("kpiSearch").value || "").trim().toLowerCase();
        var filtered = q
            ? allRows.filter(function (r) {
                  return JSON.stringify(r).toLowerCase().indexOf(q) >= 0;
              })
            : allRows;
        byId("kpiTbody").innerHTML = renderDetailTable(cfg.cols, filtered);
        var cnt = byId("kpiCount");
        if (cnt) cnt.textContent = filtered.length + " dòng";
        var rcEl = byId("detailModalRowCount");
        if (rcEl) rcEl.textContent = "Tổng số dòng: " + formatNumber(filtered.length, 0);
    }
    content.innerHTML = modalLoading();
    requestJson(cfg.api)
        .then(function (d) {
            allRows = normalizeArray(d);
            paint();
        })
        .catch(function (err) {
            content.innerHTML = modalErrorBox(err && err.message);
        });
    var sb = document.querySelector(".dk-modal-search-bar");
    if (sb) sb.style.display = "none";
}

 
/** Tải và render chi tiết slot kệ kho (drill vào 1 ô kệ cụ thể) trong modal. */
function loadSlotDrillIntoModal(opts) {
    var content = byId(ids.detailModalContent);
    if (!content) return;
    var section = document.createElement("div");
    section.style.cssText = "margin-top:18px;padding-top:14px;border-top:2px solid #e2e8f0";
    section.innerHTML =
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
        '<b class="dk-text-title" style="font-size:14px">' +
        opts.sectionTitle +
        "</b>" +
        "</div>" +
        '<div class="dk-slot-drill-body"><div class="dk-empty" style="padding:20px">Đang tải...</div></div>';
    content.appendChild(section);
    var body = section.querySelector(".dk-slot-drill-body");

    requestJson("/api/DashboardKhoDesktop/GetRackSlotDetail")
        .then(function (data) {
            var allRows = normalizeArray(data);
            var rows = allRows.filter(opts.filterFn).map(function (r, i) {
                return Object.assign({ STT: i + 1 }, r);
            });
            if (rows.length === 0) {
                body.innerHTML = '<div class="dk-empty" style="padding:20px">' + opts.emptyText + "</div>";
                return;
            }
            var cols = [
                { key: "STT", label: "STT", number: 0, center: true },
                { key: "LoaiKho", label: "Loại", center: true },
                { key: "TenDay", label: "Dãy", center: true },
                { key: "TenKe", label: "Kệ", center: true },
                { key: "TenO", label: "Ô", center: true },
                { key: "DanhSachKH", label: "Khách hàng" },
                { key: "DanhSachMaNPL", label: "Mã NPL" },
                { key: "SoBarCode", label: "Số barcode", number: 0, center: true },
                { key: "TongCBM", label: "Tổng CBM", number: 4, center: true },
            ];
            body.innerHTML = renderDetailTable(cols, rows);
        })
        .catch(function () {
            body.innerHTML =
                '<div class="dk-empty dk-text-danger" style="padding:20px">Lỗi tải dữ liệu — cần rebuild backend</div>';
        });
}

 
/** Tải và hiển thị toàn bộ chi tiết slot kệ kho trong modal đang mở. */
function loadRackSlotDetailIntoModal() {
    var content = byId(ids.detailModalContent);
    if (!content) return;

    // Placeholder section
    var section = document.createElement("div");
    section.style.cssText = "margin-top:18px;padding-top:14px;border-top:2px solid #e2e8f0";
    section.innerHTML =
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
        '<b class="dk-text-title" style="font-size:14px">Chi tiết theo ô (slot)</b>' +
        '<span class="dk-text-muted" style="font-size:12px">— Group theo loại kho NL / PL</span>' +
        "</div>" +
        '<div id="dkRackSlotBody" style="min-height:80px">' +
        '<div class="dk-empty" style="padding:20px">Đang tải chi tiết theo ô...</div>' +
        "</div>";
    content.appendChild(section);

    requestJson("/api/DashboardKhoDesktop/GetRackSlotDetail")
        .then(function (data) {
            var rows = normalizeArray(data);
            var body = byId("dkRackSlotBody");
            if (!body) return;
            if (rows.length === 0) {
                body.innerHTML = '<div class="dk-empty" style="padding:20px">Không có dữ liệu chi tiết theo ô</div>';
                return;
            }

       
            var cols = [
                { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                { key: "TenKe", label: "Kệ", center: true, width: 90 },
                { key: "TenO", label: "Ô", center: true, width: 80 },
                { key: "DanhSachKH", label: "Khách hàng" },
                { key: "MauVT", label: "Màu", center: true, width: 90 },
                { key: "WidthSize", label: "Width/Size", center: true, width: 110 },
                { key: "SoBarCode", label: "Số BC", number: 0, center: true, width: 60 },
                { key: "TongCBM", label: "CBM", number: 4, center: true, width: 90 },
            ];

        
            var nlRows = rows
                .filter(function (r) {
                    return toNumber(r.Module) === 1;
                })
                .map(function (r, i) {
                    return Object.assign({ STT: i + 1 }, r);
                });
            var plRows = rows
                .filter(function (r) {
                    return toNumber(r.Module) === 2;
                })
                .map(function (r, i) {
                    return Object.assign({ STT: i + 1 }, r);
                });

            var totalBC = 0;
            rows.forEach(function (r) {
                totalBC += toNumber(r.SoBarCode);
            });

            var html =
                '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:12px;font-size:12.5px;font-weight:700">' +
                '<span class="dk-text-title">Tổng ô đang dùng: ' +
                formatNumber(rows.length, 0) +
                "</span>" +
                '<span class="dk-text-primary">Ô NL: ' +
                formatNumber(nlRows.length, 0) +
                "</span>" +
                '<span class="dk-text-warn">Ô PL: ' +
                formatNumber(plRows.length, 0) +
                "</span>" +
                '<span class="dk-text-muted">Tổng barcode: ' +
                formatNumber(totalBC, 0) +
                "</span>" +
                "</div>";

            // Section NL
            if (nlRows.length > 0) {
                html +=
                    '<div class="dk-slot-section">' +
                    '<div class="dk-slot-section-head dk-slot-nl">' +
                    '<span class="dk-slot-section-badge">NL</span>' +
                    '<span class="dk-slot-section-title">Kho Nguyên liệu</span>' +
                    '<span class="dk-slot-section-count">' +
                    nlRows.length +
                    " ô</span>" +
                    "</div>" +
                    renderDetailTable(cols, nlRows) +
                    "</div>";
            }
            // Section PL
            if (plRows.length > 0) {
                html +=
                    '<div class="dk-slot-section" style="margin-top:16px">' +
                    '<div class="dk-slot-section-head dk-slot-pl">' +
                    '<span class="dk-slot-section-badge">PL</span>' +
                    '<span class="dk-slot-section-title">Kho Phụ liệu</span>' +
                    '<span class="dk-slot-section-count">' +
                    plRows.length +
                    " ô</span>" +
                    "</div>" +
                    renderDetailTable(cols, plRows) +
                    "</div>";
            }
            body.innerHTML = html;
        })
        .catch(function (err) {
            console.error("[Dashboard Kho] Rack slot detail error:", err);
            var body = byId("dkRackSlotBody");
            if (body)
                body.innerHTML =
                    '<div class="dk-empty dk-text-danger" style="padding:20px">Lỗi tải chi tiết theo ô. (Cần rebuild backend nếu chưa)</div>';
        });
}



// ─── Modal & Detail helpers (moved from render.js) ────────────────────────────
function openCalendarOverviewModal() {
    var fromD, toD, titleSuffix;
    if (calRangeFrom && calRangeTo) {
        fromD = calRangeFrom;
        toD = calRangeTo;
        titleSuffix = "từ " + formatDateShort(fromD) + " → " + formatDateShort(toD);
    } else {
        var base = calMonthDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        fromD = new Date(base.getFullYear(), base.getMonth(), 1);
        toD = new Date(base.getFullYear(), base.getMonth() + 1, 0);
        titleSuffix = "tháng " + (base.getMonth() + 1) + "/" + base.getFullYear();
    }

    var modalTitle = byId(ids.detailModalTitle);
    var modalMeta = byId(ids.detailModalMeta);
    var modalContent = byId(ids.detailModalContent);
    var modal = byId(ids.detailModal);
    if (!modal) return;

    if (modalTitle) modalTitle.textContent = "Tổng quát hoạt động kho " + titleSuffix;
    if (modalMeta) modalMeta.innerHTML = '<span style="color:#64748b;font-size:13px">Đang tổng hợp...</span>';

    var searchBar = document.querySelector(".dk-modal-search-bar");
    if (searchBar) searchBar.style.display = "";
    var searchInputEl = byId("detailSearchInput");
    if (searchInputEl) {
        searchInputEl.value = "";
        searchInputEl.placeholder = "Tìm trong tab đang hiện...";
    }
    var searchCountEl = byId("detailSearchCount");
    if (searchCountEl) searchCountEl.textContent = "";

    if (modalContent)
        modalContent.innerHTML = '<div class="dk-empty" style="padding:30px">Đang tải dữ liệu tổng quát...</div>';
    modal.classList.add("open");

    var url =
        "/api/DashboardKhoDesktop/GetActivityRangeDetail?tuNgay=" + asIsoDate(fromD) + "&denNgay=" + asIsoDate(toD);

    requestJson(url)
        .then(function (data) {
            var d = data || {};
            var nhapRows = normalizeArray(d.Nhap);
            var xuatRows = normalizeArray(d.Xuat);
            var kiemKeRows = normalizeArray(d.KiemKe);

            for (var i = 0; i < xuatRows.length; i++) {
                if (!xuatRows[i].NgayXuat)
                    xuatRows[i].NgayXuat = xuatRows[i].NgayXuatDen || xuatRows[i].NgayXuatTu || "";
            }
            for (var i = 0; i < kiemKeRows.length; i++) {
                if (!kiemKeRows[i].NgayKiemKe)
                    kiemKeRows[i].NgayKiemKe = kiemKeRows[i].NgayKKDen || kiemKeRows[i].NgayKKTu || "";
            }

            var nkSrc = state.nkDuKien || [];
            var plannedRows = nkSrc.filter(function (r) {
                var dt = parseDate(r.NgayNKDuKien || r.ngayNKDuKien);
                if (!dt) return false;
                return dt >= fromD && dt <= toD;
            });

            var sumIn = 0,
                sumOut = 0,
                sumKK = 0;
            for (var i = 0; i < nhapRows.length; i++) sumIn += toNumber(nhapRows[i].SoLuong);
            for (var j = 0; j < xuatRows.length; j++) sumOut += toNumber(xuatRows[j].SoLuong);
            for (var k = 0; k < kiemKeRows.length; k++) sumKK += toNumber(kiemKeRows[k].SoLuong);

            if (modalMeta) {
                modalMeta.innerHTML =
                    '<span style="color:#3b82f6;font-weight:700">Nhập: ' +
                    formatNumber(sumIn, 2) + "</span>" + ' &nbsp;·&nbsp; <span style="color:#f97316;font-weight:700">Xuất: ' +
                    formatNumber(sumOut, 2) + "</span>" + ' &nbsp;·&nbsp; <span style="color:#10b981;font-weight:700">Kiểm kê: ' +
                    formatNumber(sumKK, 2) + "</span>" + ' &nbsp;·&nbsp; <span style="color:#8b5cf6;font-weight:700">NK dự kiến: ' +
                    plannedRows.length + " lô</span>";
            }

            renderOverviewDetailTabs(modalContent, nhapRows, xuatRows, kiemKeRows, plannedRows);
        })
        .catch(function (err) {
            if (modalContent) {
                modalContent.innerHTML =
                    '<div class="dk-empty" style="padding:30px;color:#dc2626">' +
                    "Lỗi tải tổng quát: " + escapeHtml(String((err && err.message) || err)) + "</div>";
            }
        });
}

function renderGlobalSearchResult(container, code, row) {
    if (!container) return;
    if (!row || !row.MaVTID) {
        container.innerHTML =
            '<div class="dk-empty" style="padding:14px">' + "Không tìm thấy Itemcode <b>" + escapeHtml(code) + "</b> trong bảng vật tư.</div>";
        return;
    }
    var sections = [
        {
            key: "ton",
            label: "Tồn kho",
            page: 1,
            rows: toNumber(row.TonRows),
            sl: toNumber(row.TonSL),
            color: "#0ea5e9",
            goto: "capacitySummary",
        },
        {
            key: "nhap",
            label: "Nhập kho (30N)",
            page: 2,
            rows: toNumber(row.NhapRows),
            sl: toNumber(row.NhapSL),
            color: "#3b82f6",
            goto: null,
        },
        {
            key: "xuat",
            label: "Xuất kho (30N)",
            page: 2,
            rows: toNumber(row.XuatRows),
            sl: toNumber(row.XuatSL),
            color: "#f97316",
            goto: "outboundRunning",
        },
        {
            key: "kk",
            label: "Kiểm kê (30N)",
            page: 3,
            rows: toNumber(row.KKRows),
            sl: toNumber(row.KKSL),
            color: "#10b981",
            goto: null,
        },
        {
            key: "dk",
            label: "NK dự kiến (60N)",
            page: 3,
            rows: toNumber(row.DKRows),
            sl: 0,
            color: "#8b5cf6",
            goto: "inboundReady",
        },
    ];

    var html =
        '<div class="dk-gs-header">' + '<span class="dk-gs-found">Tìm thấy: <b>' +
        escapeHtml(code) + "</b>" + (row.TenVT ? ' — <span style="color:#475569">' + escapeHtml(String(row.TenVT)) + "</span>" : "") + "</span></div>";
    html += '<div class="dk-gs-grid">';
    for (var i = 0; i < sections.length; i++) {
        var s = sections[i];
        var hasData = s.rows > 0;
        var clickable = hasData;
        html +=
            '<div class="dk-gs-card' + (hasData ? " has-data" : " no-data") + (clickable ? " clickable" : "") + '" ' +
            'data-page="' + s.page + '" data-goto="' + (s.goto || "") + '" ' + 'style="--gs-color:' +
            s.color + '">' + '<div class="dk-gs-card-head"><span class="dk-gs-dot" style="background:' +
            s.color + '"></span>' + escapeHtml(s.label) + "</div>" + '<div class="dk-gs-card-rows">' + formatNumber(s.rows, 0) + " bản ghi</div>" +
            (s.sl > 0 ? '<div class="dk-gs-card-sl">SL: ' + formatNumber(s.sl, 2) + "</div>" : "") + (clickable ? '<div class="dk-gs-card-go">Bấm để xem →</div>' : "") + "</div>";
    }
    html += "</div>";
    container.innerHTML = html;

    var cards = container.querySelectorAll(".dk-gs-card.clickable");
    for (var c = 0; c < cards.length; c++) {
        cards[c].addEventListener("click", function () {
            var page = this.getAttribute("data-page");
            var go = this.getAttribute("data-goto");
            if (page) {
                var nav = document.querySelector('.dk-page-btn[data-page="' + page + '"]');
                if (nav) nav.click();
            }
            if (go) {
                setTimeout(function () {
                    var trigger = document.querySelector('.js-open-detail[data-detail="' + go + '"]');
                    if (trigger) trigger.click();
                }, 250);
            }
        });
    }
}

function showCalDayDetail(dateKey, info, plannedCount) {
    var modalTitle = byId(ids.detailModalTitle);
    var modalMeta = byId(ids.detailModalMeta);
    var modalContent = byId(ids.detailModalContent);
    var modal = byId(ids.detailModal);
    if (!modal) return;

    var displayDate = dateKey;
    var parts = String(dateKey).split("-");
    if (parts.length === 3) displayDate = parts[2] + "/" + parts[1] + "/" + parts[0];

    if (modalTitle) modalTitle.textContent = "Hoạt động kho ngày " + displayDate;
    if (modalMeta) {
        modalMeta.innerHTML =
            '<span style="color:#3b82f6;font-weight:700">Nhập: ' +
            formatNumber(info.totalIn, 2) + "</span>" + ' &nbsp;·&nbsp; <span style="color:#f97316;font-weight:700">Xuất: ' +
            formatNumber(info.totalOut, 2) + "</span>" + ' &nbsp;·&nbsp; <span style="color:#10b981;font-weight:700">Kiểm kê: ' +
            formatNumber(info.totalKK, 2) + "</span>" + ' &nbsp;·&nbsp; <span style="color:#8b5cf6;font-weight:700">NK dự kiến: ' + plannedCount + " lô</span>";
    }

    var searchBar = document.querySelector(".dk-modal-search-bar");
    if (searchBar) searchBar.style.display = "";
    var searchInputEl = byId("detailSearchInput");
    if (searchInputEl) {
        searchInputEl.value = "";
        searchInputEl.placeholder = "Tìm khách hàng, mã NPL, số lô, barcode...";
    }
    var searchCountEl = byId("detailSearchCount");
    if (searchCountEl) searchCountEl.textContent = "";

    if (modalContent) modalContent.innerHTML = '<div class="dk-empty" style="padding:30px">Đang tải chi tiết...</div>';
    modal.classList.add("open");

    var url = "/api/DashboardKhoDesktop/GetActivityDayDetail?ngay=" + dateKey;
    var inRangeMode = false;
    requestJson(url)
        .then(function (data) {

            var d = data || {};
            var nhapRows = normalizeArray(d.Nhap);
            var xuatRows = normalizeArray(d.Xuat);
            var kiemKeRows = normalizeArray(d.KiemKe);

            for (var i = 0; i < nhapRows.length; i++) {
                if (!nhapRows[i].NgayNhap && !nhapRows[i].NgayNhapKho)
                    nhapRows[i].NgayNhapKho = inRangeMode
                        ? nhapRows[i].NgayNhapDen || nhapRows[i].NgayNhapTu || ""
                        : dateKey;
            }
            for (var i = 0; i < xuatRows.length; i++) {
                if (!xuatRows[i].NgayXuat)
                    xuatRows[i].NgayXuat = inRangeMode
                        ? xuatRows[i].NgayXuatDen || xuatRows[i].NgayXuatTu || ""
                        : dateKey;
            }
            for (var i = 0; i < kiemKeRows.length; i++) {
                if (!kiemKeRows[i].NgayKiemKe)
                    kiemKeRows[i].NgayKiemKe = inRangeMode
                        ? kiemKeRows[i].NgayKKDen || kiemKeRows[i].NgayKKTu || ""
                        : dateKey;
            }

            var nkSrc = state.nkDuKien || [];
            var plannedRows = nkSrc.filter(function (r) {
                var dt = parseDate(r.NgayNKDuKien || r.ngayNKDuKien);
                if (!dt) return false;
                if (inRangeMode) {
                    return dt >= calRangeFrom && dt <= calRangeTo;
                }
                return asIsoDate(dt) === dateKey;
            });

            renderDayDetailTabs(modalContent, nhapRows, xuatRows, kiemKeRows, plannedRows, dateKey);

            if (!inRangeMode) {
                requestJson("/api/DashboardKhoDesktop/LichPhanCong_GetDayDetail?ngay=" + dateKey)
                    .then(function (lpcpRes) {
                        if (!lpcpRes || !lpcpRes.success) return;
                        appendLpcpTab(modalContent, lpcpRes.data || {});
                    })
                    .catch(function () {
                    });
            }
        })
        .catch(function (err) {
            console.error("[Dashboard Kho] Day detail API error:", err);
            var plannedRows = (state.nkDuKien || []).filter(function (r) {
                var dt = parseDate(r.NgayNKDuKien || r.ngayNKDuKien);
                if (!dt) return false;
                return asIsoDate(dt) === dateKey;
            });
            var xuatFallback = (state.outboundRunning || [])
                .filter(function (r) {
                    var dt = parseDate(r.NgayXuatHang);
                    if (!dt) return false;
                    return asIsoDate(dt) === dateKey;
                })
                .map(function (r) {
                    return {
                        MaLenh: r.MaLenh || "",
                        TenHang: r.TenHang || "",
                        TenKH: r.TenKH || r.KhachHang || "",
                        SoLuong: toNumber(r.SLXuat || r.SoLuong),
                        SoBarCode: 0,
                    };
                });
            if (modalContent) {
                renderDayDetailTabs(modalContent, [], xuatFallback, [], plannedRows, dateKey);
            }
        });
}

window.dkToggleGroup = function (btn) {
    var groupKey = btn.getAttribute("data-group");
    var icon = btn.querySelector("i");
    var tbody = btn.closest("table").querySelector("tbody");
    var isExpanded = btn.getAttribute("data-expanded") === "true";

    btn.setAttribute("data-expanded", !isExpanded);
    if (isExpanded) {
        icon.style.transform = "rotate(-90deg)";
    } else {
        icon.style.transform = "rotate(0deg)";
    }

    var rows = tbody.querySelectorAll("tr[data-group='" + groupKey + "']:not(.group-header)");
    for (var i = 0; i < rows.length; i++) {
        rows[i].style.display = isExpanded ? "none" : "";
    }
};

function renderGroupedDetailTable(cols, rows, dateField) {
    if (!rows || rows.length === 0) return "<div class='dk-empty' style='padding:30px'>Không có dữ liệu</div>";

    var groups = {};
    for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var rawDate =
            r[dateField] ||
            r.NgayNhapKho ||
            r.NgayNhap ||
            r.NgayXuat ||
            r.NgayKiemKe ||
            r.NgayNKDuKien ||
            r.ngayNKDuKien ||
            "";
        var dateStr = "";
        if (rawDate) {
            var d = new Date(rawDate);
            if (!isNaN(d)) {
                var dd = String(d.getDate()).padStart(2, "0");
                var mm = String(d.getMonth() + 1).padStart(2, "0");
                var yyyy = d.getFullYear();
                dateStr = dd + "/" + mm + "/" + yyyy;
            } else {
                dateStr = rawDate.toString().substring(0, 10);
            }
        } else {
            dateStr = "Không có ngày";
        }

        if (!groups[dateStr]) groups[dateStr] = [];
        groups[dateStr].push(r);
    }

    var sortedDates = Object.keys(groups).sort(function (a, b) {
        if (a === "Không có ngày") return 1;
        if (b === "Không có ngày") return -1;
        var partA = a.split("/");
        var partB = b.split("/");
        var dA = new Date(partA[2], partA[1] - 1, partA[0]);
        var dB = new Date(partB[2], partB[1] - 1, partB[0]);
        return dB - dA;
    });

    var html = "<div class='dk-detail-table-wrap'><table class='dk-detail-table'>";
    html += "<thead><tr>";
    for (var c = 0; c < cols.length; c++) {
        var w = cols[c].width ? "width:" + cols[c].width + ";" : "";
        var align = cols[c].align ? "text-align:" + cols[c].align + ";" : "";
        html += "<th style='" + w + align + "'>" + escapeHtml(cols[c].label) + "</th>";
    }
    html += "</tr></thead><tbody>";

    for (var gi = 0; gi < sortedDates.length; gi++) {
        var gDate = sortedDates[gi];
        var groupRows = groups[gDate];
        var groupKey = "g_" + gi;

        var hasSoLuong = false;
        var dayTotal = 0;
        for (var ck = 0; ck < cols.length; ck++)
            if (cols[ck].key === "SoLuong" || cols[ck].key === "SoLuongDuKien") hasSoLuong = true;
        if (hasSoLuong) {
            for (var ri = 0; ri < groupRows.length; ri++) {
                var q = groupRows[ri].SoLuong || groupRows[ri].SoLuongDuKien || 0;
                dayTotal += parseFloat(q) || 0;
            }
        }

        var dark = document.body.classList.contains("dark-theme");
        var headBg = dark ? "#112e51" : "#dbeafe";
        var headBorder = dark ? "#1d3b68" : "#bfdbfe";
        var dateColor = dark ? "#60a5fa" : "#1e40af";
        var totalColor = dark ? "#34d399" : "#0284c7";
        var subTextColor = dark ? "#cbd5e1" : "#475569";

        html +=
            "<tr class='group-header' style='background-color: " + headBg + "; cursor: pointer; border-top: 1px solid " + headBorder +
            "; border-bottom: 1px solid " + headBorder + ";' onclick='window.dkToggleGroup(this)' data-group='" + groupKey + "' data-expanded='true'>";

        var qtyColIdx = -1;
        for (var ck = 0; ck < cols.length; ck++)
            if (cols[ck].key === "SoLuong" || cols[ck].key === "SoLuongDuKien") qtyColIdx = ck;

        if (qtyColIdx > 0 && hasSoLuong) {
            html +=
                "<td colspan='" + qtyColIdx + "' style='font-weight: bold; padding: 6px 8px 6px 12px; position: relative; text-align: left; border-left: 3px solid " + totalColor + ";'>";
            html +=
                "<i class='fas fa-chevron-down dk-toggle-icon' style='margin-right: 6px; font-size: 11px; transition: transform 0.2s; display: inline-block; color: " + subTextColor + ";'></i>";
            html +=
                "<span style='color: " + dateColor + "; font-size: 15px; font-weight: 700;'>&#128197; Ngày " + escapeHtml(gDate) + "</span>";
            html +=
                "<span style='font-size: 11px; font-weight: 500; color: " + subTextColor + "; margin-left: 8px;'>(" + formatNumber(groupRows.length, 0) + " dòng)</span>";
            html += "</td>";

            var cellAlign = cols[qtyColIdx].center ? "center" : cols[qtyColIdx].left ? "left" : "right";
            html +=
                "<td style='font-weight: bold; font-size: 13px; padding: 6px 8px; text-align: " + cellAlign + "; color: " + totalColor + ";'>" + formatNumber(dayTotal, 2) + "</td>";

            var remainingCols = cols.length - 1 - qtyColIdx;
            if (remainingCols > 0) {
                html += "<td colspan='" + remainingCols + "'></td>";
            }
        } else {
            html +=
                "<td colspan='" + cols.length + "' style='font-weight: bold; padding: 6px 8px 6px 12px; position: relative; text-align: left; border-left: 3px solid " + totalColor + ";'>";
            html +=
                "<i class='fas fa-chevron-down dk-toggle-icon' style='margin-right: 6px; font-size: 11px; transition: transform 0.2s; display: inline-block; color: " + subTextColor + ";'></i>";
            html +=
                "<span style='color: " + dateColor + "; font-size: 15px; font-weight: 700;'>&#128197; Ngày " + escapeHtml(gDate) + "</span>";
            if (hasSoLuong) {
                html +=
                    "<span style='margin-left: 12px; color: " + totalColor + "; font-size: 13px;'>Tổng: " + formatNumber(dayTotal, 2) + "</span>";
            }
            html +=
                "<span style='float: right; font-size: 11px; font-weight: 500; color: " + subTextColor + "; margin-top: 1px;'>" + formatNumber(groupRows.length, 0) + " dòng</span>";
            html += "</td>";
        }
        html += "</tr>";

        for (var ri = 0; ri < groupRows.length; ri++) {
            var row = groupRows[ri];
            html += "<tr data-group='" + groupKey + "'>";
            for (var c = 0; c < cols.length; c++) {
                var cv = cols[c];
                var val = row[cv.field || cv.key];
                if (val === null || val === undefined) val = "";
                if (cv.key === "STT") val = ri + 1;
                if (cv.type === "number" || cv.number !== undefined)
                    val = formatNumber(val, cv.number !== undefined ? cv.number : 0);
                if (cv.type === "date" || cv.date)
                    val =
                        typeof formatDateVn === "function"
                            ? formatDateVn(val)
                            : typeof formatDate === "function"
                              ? formatDate(val)
                              : val;

                var cellAlign = cv.center ? "center" : cv.number !== undefined ? "right" : cv.left ? "left" : "";
                var align = cellAlign ? " style='text-align:" + cellAlign + "'" : "";
                html += "<td" + align + ">" + escapeHtml(val.toString()) + "</td>";
            }
            html += "</tr>";
        }
    }

    html += "</tbody></table></div>";
    return html;
}


function initVirtualScrollGrid(tabKey) {
    var d = window.__dkDetailData[tabKey];
    if (!d) return;
    var pageSize = window.DK_DETAIL_PAGE_SIZE || 200;
    var sortedRows = dkGetSortedDetailRows(d);
    var pageStart = (d.page - 1) * pageSize;
    var pagedRows = sortedRows.slice(pageStart, pageStart + pageSize);
    var panel = document.getElementById(d.panelId);
    if (!panel) return;
    var cacheKey = tabKey + "::" + d.page + "::" + pageSize;
    if (!d.pageCache) d.pageCache = {};
    var flatData;
    if (d.pageCache[cacheKey]) {
        flatData = d.pageCache[cacheKey].flatData;
    } else {
        flatData = [];
        var groups = {};
        for (var i = 0; i < pagedRows.length; i++) {
            var r = pagedRows[i];
            var dateStr = dkGetGroupDate(r, d.dateField, d.fallbackDate);
            if (!groups[dateStr]) groups[dateStr] = [];
            groups[dateStr].push(r);
        }
        var sortedDates = Object.keys(groups).sort(dkCompareGroupDateAsc);
        var qtyColIdx = -1; var hasSoLuong = false;
        for (var ck = 0; ck < d.cols.length; ck++) {
            if (d.cols[ck].key === "SoLuong" || d.cols[ck].key === "SoLuongDuKien") { qtyColIdx = ck; hasSoLuong = true; }
        }
        for (var gi = 0; gi < sortedDates.length; gi++) {
            var gDate = sortedDates[gi];
            var groupRows = groups[gDate];
            var dayTotal = 0;
            if (hasSoLuong) {
                for (var ri = 0; ri < groupRows.length; ri++) {
                    var q = groupRows[ri].SoLuong || groupRows[ri].SoLuongDuKien || 0;
                    dayTotal += parseFloat(q) || 0;
                }
            }
            var groupKey = "g_" + gi;
            flatData.push({
                isHeader: true,
                date: gDate,
                dateText: gDate === "Không có ngày" ? gDate : "Ngày " + gDate,
                count: groupRows.length,
                countText: formatNumber(groupRows.length, 0),
                total: dayTotal,
                totalText: formatNumber(dayTotal, 2),
                key: groupKey,
                hasSoLuong: hasSoLuong,
                qtyColIdx: qtyColIdx,
                sourceIndex: flatData.length,
            });
            for (var ri = 0; ri < groupRows.length; ri++) {
                var stt = groupRows[ri].__dkVirtualStt || (pageStart + ri + 1);
                flatData.push({
                    isHeader: false,
                    row: groupRows[ri],
                    groupKey: groupKey,
                    stt: stt,
                    cells: dkFormatVirtualCells(d.cols, groupRows[ri], stt),
                });
            }
        }
        d.pageCache[cacheKey] = { flatData: flatData };
    }
    if (!d.collapsedGroupsByPage) d.collapsedGroupsByPage = {};
    var collapsedGroups = d.collapsedGroupsByPage[cacheKey] || {};
    d.collapsedGroupsByPage[cacheKey] = collapsedGroups;
    var visibleFlatData = dkBuildVisibleVirtualRows(flatData, collapsedGroups);

    var gridTableWrap = panel.querySelector(".dk-grid-table");
    var gridCols = d.cols.map(function (c) {
        if (c.width) return (typeof c.width === "number" ? c.width + "px" : c.width);
        return "minmax(120px, 1fr)";
    }).join(" ");
    if (!gridTableWrap) {
        var shellHtml = '<div class="dk-grid-table">';
        shellHtml += '<div class="dk-grid-thead dk-grid-row" style="grid-template-columns: ' + gridCols + ';">';
        for (var c = 0; c < d.cols.length; c++) {
            var col = d.cols[c];
            var align = col.center ? "center" : (col.number !== undefined ? "flex-end" : "flex-start");
            shellHtml += '<div class="dk-grid-cell" style="justify-content: ' + align + '">' + escapeHtml(col.label) + '</div>';
        }
        shellHtml += '</div>';
        shellHtml += '<div class="dk-grid-pinned-group"></div>';
        shellHtml += '<div class="dk-grid-tbody">';
        shellHtml += '<div class="dk-grid-spacer"></div>';
        shellHtml += '<div class="dk-grid-content"></div>';
        shellHtml += '</div></div>';
        var totalPages = Math.ceil(d.rows.length / pageSize);
        if (totalPages > 1) {
            var btnPrev = '<span style="display:inline-block;width:95px;margin-right:10px"></span>';
            var btnNext = '<button class="dk-btn-page" style="margin-left:10px" onclick="window.dkGoDetailPg(\'' + tabKey + '\', 1)">Trang sau &#8594;</button>';
            shellHtml += '<div class="dk-detail-pagination">' + btnPrev + '<span class="dk-pg-text">Trang ' + d.page + ' / ' + totalPages + btnNext + '</div>';
        }
        panel.innerHTML = shellHtml;
        gridTableWrap = panel.querySelector(".dk-grid-table");
    }
    var totalPages = Math.ceil(d.rows.length / pageSize);
    var pagination = panel.querySelector(".dk-detail-pagination");
    if (totalPages <= 1 && pagination) {
        pagination.parentNode.removeChild(pagination);
    } else if (totalPages > 1 && !pagination) {
        pagination = document.createElement("div");
        pagination.className = "dk-detail-pagination";
        panel.appendChild(pagination);
    }
    if (pagination && totalPages > 1) {
        var btnPrev = d.page > 1 ? '<button class="dk-btn-page" style="margin-right:10px" onclick="window.dkGoDetailPg(\'' + tabKey + '\', -1)">&#8592; Trang trước</button>' : '<span style="display:inline-block;width:95px;margin-right:10px"></span>';
        var btnNext = d.page < totalPages ? '<button class="dk-btn-page" style="margin-left:10px" onclick="window.dkGoDetailPg(\'' + tabKey + '\', 1)">Trang sau &#8594;</button>' : '<span style="display:inline-block;width:87px;margin-left:10px"></span>';
        pagination.innerHTML = btnPrev + '<span>Trang ' + d.page + ' / ' + totalPages + '</span>' + btnNext;
    }
    var tbody = panel.querySelector(".dk-grid-tbody");
    var spacer = panel.querySelector(".dk-grid-spacer");
    var ROW_HEIGHT = 36;
    d.virtualState = {
        sourceData: flatData, flatData: visibleFlatData, scrollTop: 0, startIndex: -1, endIndex: -1,
        rowHeight: ROW_HEIGHT, totalHeight: visibleFlatData.length * ROW_HEIGHT, gridCols: gridCols,
        colCount: d.cols.length, collapsedGroups: collapsedGroups, cacheKey: cacheKey,
    };
    spacer.style.height = d.virtualState.totalHeight + "px";
    if (tbody.scrollTop !== 0) tbody.scrollTop = 0;
    window.dkRenderVirtualViewport(tabKey, tbody);

    if (tbody._dkScrollHandler) tbody.removeEventListener("scroll", tbody._dkScrollHandler);
    tbody._dkScrollHandler = function () { window.dkVirtualScroll(tbody, tabKey); };
    tbody.addEventListener("scroll", tbody._dkScrollHandler, { passive: true });
    tbody.onclick = function (ev) {
        var header = ev.target && ev.target.closest ? ev.target.closest(".dk-grid-group-header") : null;
        if (header) window.dkToggleVirtualGroup(tabKey, header.getAttribute("data-group"));
    };
    var pinnedGroup = panel.querySelector(".dk-grid-pinned-group");
    if (pinnedGroup) {
        pinnedGroup.onclick = function (ev) {
            var header = ev.target && ev.target.closest ? ev.target.closest(".dk-grid-group-header") : null;
            if (header) window.dkToggleVirtualGroup(tabKey, header.getAttribute("data-group"));
        };
    }
}

function dkRenderVirtualGroupHeader(item, vs, colors) {
    var collapsed = !!vs.collapsedGroups[item.key];
    var qtyColIdx = typeof item.qtyColIdx === "number" ? item.qtyColIdx : -1;
    var colCount = vs.colCount || 1;
    var titleEnd = item.hasSoLuong && qtyColIdx > 0 ? qtyColIdx + 1 : Math.max(2, colCount);
    var html = [];
    html.push('<div class="dk-grid-group-header' + (collapsed ? ' is-collapsed' : '') + '" style="grid-template-columns:' + vs.gridCols + ';background:' + colors.headBg + ';border-top:1px solid ' + colors.headBorder + ';border-bottom:1px solid ' + colors.headBorder + ';height:' + vs.rowHeight + 'px" data-group="' + item.key + '" aria-expanded="' + (!collapsed) + '">');
    html.push('<div class="dk-grid-group-title" style="grid-column:1 / ' + titleEnd + '">');
    html.push('<i class="fas ' + (collapsed ? 'fa-chevron-right' : 'fa-chevron-down') + ' dk-toggle-icon" style="color:' + colors.subTextColor + '"></i>');
    html.push('<span style="font-size:15px;font-weight:700;color:' + colors.dateColor + '">' + escapeHtml(item.dateText || item.date) + '</span>');
    html.push('</div>');
    if (item.hasSoLuong && qtyColIdx >= 0) {
        html.push('<div class="dk-grid-group-total" style="grid-column:' + (qtyColIdx + 1) + ';color:' + colors.totalColor + '">' + item.totalText + '</div>');
    }
    html.push('<div class="dk-grid-group-count" style="grid-column:' + colCount + ';color:' + colors.subTextColor + '">' + item.countText + ' dòng</div>');
    html.push('</div>');
    return html.join("");
}

window.dkRenderVirtualViewport = function (tabKey, tbody) {
    var d = window.__dkDetailData[tabKey];
    if (!d || !d.virtualState) return;
    var vs = d.virtualState;
    var content = tbody.querySelector(".dk-grid-content");
    if (!content) return;
    var st = tbody.scrollTop;
    var clientH = tbody.clientHeight || 400;
    var startIdx = Math.floor(st / vs.rowHeight);
    var visibleCount = Math.ceil(clientH / vs.rowHeight);
    var overscan = 15;
    startIdx = Math.max(0, startIdx - overscan);
    var endIdx = Math.min(vs.flatData.length, startIdx + visibleCount + (overscan * 2));
    if (startIdx === vs.startIndex && endIdx === vs.endIndex) return;
    vs.startIndex = startIdx;
    vs.endIndex = endIdx;
    content.style.transform = "translateY(" + (startIdx * vs.rowHeight) + "px)";
    var dark = document.body.classList.contains("dark-theme");
    var headBg = dark ? "#112e51" : "#e0f2f1";
    var headBorder = dark ? "#1d3b68" : "#99d5d0";
    var dateColor = dark ? "#60a5fa" : "#115e59";
    var totalColor = dark ? "#34d399" : "#0e7490";
    var subTextColor = dark ? "#cbd5e1" : "#527a7b";
    var groupColors = {
        headBg: headBg,
        headBorder: headBorder,
        dateColor: dateColor,
        totalColor: totalColor,
        subTextColor: subTextColor,
    };
    var pinnedItem = null;
    for (var pi = startIdx; pi >= 0; pi--) {
        if (vs.flatData[pi] && vs.flatData[pi].isHeader) {
            pinnedItem = pi === startIdx ? null : vs.flatData[pi];
            break;
        }
    }
    var panel = document.getElementById(d.panelId);
    var pinnedGroup = panel ? panel.querySelector(".dk-grid-pinned-group") : null;
    if (pinnedGroup) {
        if (pinnedItem) {
            pinnedGroup.innerHTML = dkRenderVirtualGroupHeader(pinnedItem, vs, groupColors);
            pinnedGroup.style.display = "";
        } else {
            pinnedGroup.innerHTML = "";
            pinnedGroup.style.display = "none";
        }
    }
    var html = [];
    for (var i = startIdx; i < endIdx; i++) {
        var item = vs.flatData[i];
        if (item.isHeader) {
            html.push(dkRenderVirtualGroupHeader(item, vs, groupColors));
        } else {
            html.push('<div class="dk-grid-row" style="grid-template-columns:' + vs.gridCols + ';height:' + vs.rowHeight + 'px" data-group="' + item.groupKey + '">');
            for (var c = 0; c < item.cells.length; c++) {
                html.push('<div class="dk-grid-cell" style="justify-content:' + item.cells[c].align + '">' + escapeHtml(item.cells[c].text) + '</div>');
            }
            html.push('</div>');
        }
    }
    content.innerHTML = html.join("");
};

window.dkVirtualScroll = function (tbody, tabKey) {
    if (!window.requestAnimationFrame) { window.dkRenderVirtualViewport(tabKey, tbody); return; }
    var d = window.__dkDetailData[tabKey];
    if (d && !d.ticking) {
        window.requestAnimationFrame(function () { window.dkRenderVirtualViewport(tabKey, tbody); d.ticking = false; });
        d.ticking = true;
    }
};

window.dkToggleVirtualGroup = function (tabKey, groupKey) {
    var d = window.__dkDetailData[tabKey];
    if (!d || !d.virtualState || !groupKey) return;
    var vs = d.virtualState;
    vs.collapsedGroups[groupKey] = !vs.collapsedGroups[groupKey];
    vs.flatData = dkBuildVisibleVirtualRows(vs.sourceData, vs.collapsedGroups);
    vs.totalHeight = vs.flatData.length * vs.rowHeight;
    vs.startIndex = -1;
    vs.endIndex = -1;

    var panel = document.getElementById(d.panelId);
    if (!panel) return;
    var tbody = panel.querySelector(".dk-grid-tbody");
    var spacer = panel.querySelector(".dk-grid-spacer");
    if (!tbody || !spacer) return;
    spacer.style.height = vs.totalHeight + "px";
    var maxScroll = Math.max(0, vs.totalHeight - tbody.clientHeight);
    if (tbody.scrollTop > maxScroll) tbody.scrollTop = maxScroll;
    window.dkRenderVirtualViewport(tabKey, tbody);
};

window.__dkDetailData = {};
window.dkGoDetailPg = function(tabKey, dir) {
    var d = window.__dkDetailData[tabKey];
    if (!d) return;
    d.page += dir;
    var pageSize = window.DK_DETAIL_PAGE_SIZE || 200;
    var totalPages = Math.ceil(d.rows.length / pageSize);
    if (d.page < 1) d.page = 1;
    if (d.page > totalPages) d.page = totalPages;
    var panel = document.getElementById(d.panelId);
    if (!panel) return;
    initVirtualScrollGrid(tabKey);
};

function renderDetailTabs(container, nhap, xuat, kiemke, planned, opts) {
    if (!container) return;
    opts = opts || {};
    var emptyLabel = opts.emptyLabel || "";
    var showRowCount = !!opts.showRowCount;
    var fallbackDate = opts.fallbackDate || "";

    function addStt(arr) {
        return (arr || []).map(function (r, i) {
            return Object.assign({ STT: i + 1 }, r);
        });
    }
    var tabs = [
        { key: "nhap", label: "Nhập kho", color: "#3b82f6", rows: addStt(nhap), cols: colsNhap(), dateField: "NgayNhap" },
        { key: "xuat", label: "Xuất kho", color: "#f97316", rows: addStt(xuat), cols: colsXuat(), dateField: "NgayXuat" },
        { key: "kiemke", label: "Kiểm kê", color: "#10b981", rows: addStt(kiemke), cols: colsKiemKe(), dateField: "NgayKiemKe" },
        { key: "plan", label: "NK dự kiến", color: "#8b5cf6", rows: addStt(planned), cols: colsPlanned(), dateField: "NgayNKDuKien" },
    ];

    var activeIdx = 0;
    for (var ti = 0; ti < tabs.length; ti++) {
        if (tabs[ti].rows.length > 0) { activeIdx = ti; break; }
    }

    var tabBar = '<div class="dk-day-tabs">';
    for (var i = 0; i < tabs.length; i++) {
        var t = tabs[i];
        var isActive = i === activeIdx ? " active" : "";
        tabBar +=
            '<button type="button" class="dk-day-tab' + isActive + '" data-tabkey="' + t.key + '" style="--tab-color:' + t.color + '">' +
            '<span class="dk-day-tab-dot" style="background:' + t.color + '"></span>' +
            escapeHtml(t.label) + ' <span class="dk-day-tab-count">' + formatNumber(t.rows.length, 0) + '</span></button>';
    }
    tabBar += "</div>";

    var panels = "";
    for (var pi = 0; pi < tabs.length; pi++) {
        var tp = tabs[pi];
        var hidden = pi === activeIdx ? "" : ' style="display:none"';
        var panelId = 'dk_dp_' + Math.random().toString(36).substr(2, 9) + '_' + tp.key;
        panels += '<div class="dk-day-panel" id="' + panelId + '" data-tabkey="' + tp.key + '"' + hidden + ' style="position:relative;">';

        if (tp.rows.length === 0) {
            panels += '<div class="dk-empty" style="padding:30px">Không có dữ liệu ' + escapeHtml(tp.label.toLowerCase()) + emptyLabel + "</div>";
        } else {
            window.__dkDetailData = window.__dkDetailData || {};
            var dEntry = { cols: tp.cols, rows: tp.rows, dateField: tp.dateField, page: 1, panelId: panelId, loaded: pi === activeIdx };
            if (fallbackDate) dEntry.fallbackDate = fallbackDate;
            window.__dkDetailData[tp.key] = dEntry;
        }
        panels += "</div>";
    }

    container.innerHTML = tabBar + panels;
    if (tabs[activeIdx] && tabs[activeIdx].rows.length > 0) { initVirtualScrollGrid(tabs[activeIdx].key); }

    if (showRowCount) {
        var rcEl = byId("detailModalRowCount");
        if (rcEl) {
            var initialCount = tabs[activeIdx] ? tabs[activeIdx].rows.length : 0;
            rcEl.textContent = "Tổng số dòng: " + formatNumber(initialCount, 0);
        }
    }

    setTimeout(function() {
        var c2 = document.getElementById('detailModalContent');
        if (!c2) return;
        var tabsEl = c2.querySelector(".dk-day-tabs");
        if (tabsEl) {
            var tabsHeight = tabsEl.offsetHeight;
            var ths = c2.querySelectorAll(".dk-detail-table thead th");
            for (var i = 0; i < ths.length; i++) {
                ths[i].style.top = tabsHeight + "px";
            }
        }
    }, 10);

    var tabBtns = container.querySelectorAll(".dk-day-tab");
    for (var bi = 0; bi < tabBtns.length; bi++) {
        tabBtns[bi].addEventListener("click", function () {
            var key = this.getAttribute("data-tabkey");
            var allBtns = container.querySelectorAll(".dk-day-tab");
            for (var k = 0; k < allBtns.length; k++) allBtns[k].classList.remove("active");
            this.classList.add("active");
            var allPanels = container.querySelectorAll(".dk-day-panel");
            for (var p = 0; p < allPanels.length; p++) {
                allPanels[p].style.display = allPanels[p].getAttribute("data-tabkey") === key ? "" : "none";
            }
            var dTab = window.__dkDetailData[key];
            if (dTab && !dTab.loaded) {
                dTab.page = 1;
                initVirtualScrollGrid(key);
                dTab.loaded = true;
            }
            if (showRowCount) {
                var rcEl = byId("detailModalRowCount");
                if (rcEl) {
                    var rowCount = dTab && dTab.rows ? dTab.rows.length : 0;
                    rcEl.textContent = "Tổng số dòng: " + formatNumber(rowCount, 0);
                }
            }
            var searchInput = document.getElementById("detailSearchInput");
            if (searchInput) {
                if (typeof filterDetailTable === "function") filterDetailTable(searchInput.value.trim());
            }
        });
    }
}

function renderOverviewDetailTabs(container, nhap, xuat, kiemke, planned) {
    renderDetailTabs(container, nhap, xuat, kiemke, planned, {});
}

function renderDayDetailTabs(container, nhap, xuat, kiemke, planned, fallbackDate) {
    renderDetailTabs(container, nhap, xuat, kiemke, planned, {
        fallbackDate: fallbackDate,
        showRowCount: true,
        emptyLabel: " trong ngày này"
    });
}

function getDetailData(detail, index) {
    var overall = state.overall.length > 0 ? state.overall[0] : {};
    var totalCapRow = {
        TotalCapacity: toNumber(overall.TotalCapacity),
        CapacityNPL: toNumber(overall.CapacityNPL),
        CapacityPL: toNumber(overall.CapacityPL),
        UsedNPL: toNumber(overall.UsedNPL),
        UsedPL: toNumber(overall.UsedPL),
        UsedTotal: toNumber(overall.UsedNPL) + toNumber(overall.UsedPL),
        TotalFreeCapacity: toNumber(overall.TotalFreeCapacity),
        TotalVatTu: toNumber(overall.TotalVatTu),
        PercentNPL: toNumber(overall.PercentNPL),
        PercentPL: toNumber(overall.PercentPL),
        TotalPercent: toNumber(overall.TotalPercent),
        FreePercent: toNumber(overall.FreePercent),
    };

    // Chi tiết tổng sức chứa: hiện tất cả kệ, NL trước rồi PL
    var racksForCapDetail = state.racks
        .slice()
        .sort(function (a, b) {
            var mA = toNumber(a.Module),
                mB = toNumber(b.Module);
            if (mA !== mB) return mA - mB;
            return (a.TenDay || "").localeCompare(b.TenDay || "");
        })
        .map(function (r, idx) {
            var used = toNumber(r.TongCBMSuDungTrongKe);
            var cap = toNumber(r.TongCBMTrongKe);
            return {
                STT: idx + 1,
                LoaiKho: r.Module == 1 ? "NL" : r.Module == 2 ? "PL" : String(r.Module || ""),
                TenDay: r.TenDay || "",
                TenKe: r.TenKe || "",
                CBMSuDung: used,
                TongCBM: cap,
                PctSuDung: cap > 0 ? (used / cap) * 100 : 0,
                SLVatTu: toNumber(r.SLVatTu),
            };
        });

    var detailMap = {
        totalCapacity: {
            title: "Chi tiết tổng sức chứa — theo kệ",
            isWarehouseMap: true,
            rows: racksForCapDetail,
            columns: [
                { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                { key: "LoaiKho", label: "Loại kho", center: true, width: 85 },
                { key: "TenDay", label: "Dãy", center: true, width: 80 },
                { key: "TenKe", label: "Tên kệ", center: true, width: 95 },
                { key: "CBMSuDung", label: "CBM sử dụng", number: 2, width: 110 },
                { key: "TongCBM", label: "Tổng CBM", number: 2, width: 110 },
                { key: "PctSuDung", label: "% sử dụng", percent: true, width: 95 },
                { key: "SLVatTu", label: "Số vật tư", number: 0, center: true, width: 85 },
            ],
        },
        materialCount: (function () {
            var soMaVatTu =
                state.distinctMat && state.distinctMat.length > 0 ? toNumber(state.distinctMat[0].SoMaVatTu) : 0;
            var totalRacks = state.racks.length;
            var racksAbove85 = 0,
                racksOver100 = 0,
                racksUnder50 = 0;
            var totalUsedCBM = 0;
            for (var _ri = 0; _ri < state.racks.length; _ri++) {
                var _r = state.racks[_ri];
                var _used = toNumber(_r.TongCBMSuDungTrongKe);
                var _cap = toNumber(_r.TongCBMTrongKe);
                totalUsedCBM += _used;
                var _pct = _cap > 0 ? (_used / _cap) * 100 : 0;
                if (_pct > 100) racksOver100++;
                else if (_pct >= 85) racksAbove85++;
                else if (_pct < 50) racksUnder50++;
            }
            var rows = [
                { ChiSo: "Mã vật tư", GiaTri: soMaVatTu, drill: "matCountDrill_codes" },
                { ChiSo: "Số lượng tồn NL", GiaTri: toNumber(overall.TotalVatTuNPL) },
                { ChiSo: "Số lượng tồn PL", GiaTri: toNumber(overall.TotalVatTuPL) },
                { ChiSo: "Tổng số lượng tồn", GiaTri: toNumber(overall.TotalVatTu) },
                { ChiSo: "Tổng số kệ đang dùng", GiaTri: totalRacks, drill: "matCountDrill_allRacks" },
                { ChiSo: "Kệ < 50% lấp đầy", GiaTri: racksUnder50, drill: "matCountDrill_under50" },
                { ChiSo: "Kệ 85% - 100% lấp đầy", GiaTri: racksAbove85, drill: "matCountDrill_85to100" },
                { ChiSo: "Kệ > 100% (vượt tải)", GiaTri: racksOver100, drill: "matCountDrill_over100" },
                { ChiSo: "CBM đang sử dụng", GiaTri: totalUsedCBM, isDecimal: true },
            ];
            return {
                title: "Chi tiết tổng hợp vật tư trong kho",
                rows: rows.map(function (r, i) {
                    var formattedValue = r.isDecimal ? formatNumber(r.GiaTri, 2) : formatNumber(r.GiaTri, 0);
                    var canDrill = !!r.drill;
                    return {
                        STT: i + 1,
                        ChiSo: r.ChiSo,
                        GiaTri: canDrill
                            ? '<a href="#" class="dk-link js-open-detail" data-detail="' + r.drill + '">' + formattedValue + "</a>"
                            : formattedValue,
                        _raw: r,
                    };
                }),
                columns: [
                    { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                    { key: "ChiSo", label: "Chỉ số", width: 250 },
                    { key: "GiaTri", label: "Giá trị", raw: true, center: true, width: 130 },
                ],
            };
        })(),
        matCountDrill_codes: {
            title: "Danh sách tất cả mã vật tư đang tồn kho",
            rows: [],

            columns: [
                { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                { key: "LoaiKho", label: "Loại", center: true, width: 70 },
                { key: "ItemCode", label: "ItemCode", width: 120 },
                { key: "ChiTiet", label: "Chi tiết" },
                { key: "MauDisplay", label: "Màu", raw: true, width: 160 },
                { key: "KhoVai", label: "Khổ vải", center: true, width: 100 },
                { key: "TonKho", label: "Tồn kho", number: 2, width: 100 },
                { key: "SoBarCode", label: "Số kiện/roll", number: 0, center: true, width: 100 },
            ],
            customAsync: "allMaterials",
        },

        todoDetail: { title: "Công việc chờ xử lý", rows: [], columns: [], customAsync: "todoDetail" },
        top5VTAll: { title: "Toàn bộ vật tư theo dung tích", rows: [], columns: [], customAsync: "top5VTAll" },
        top5KHAll: { title: "Toàn bộ khách hàng theo giá trị tồn", rows: [], columns: [], customAsync: "top5KHAll" },
        hetHanAll: { title: "Vật tư sắp hết hạn", rows: [], columns: [], customAsync: "hetHanAll" },
        giaTriNhomAll: { title: "Chi tiết giá trị tồn theo nhóm", rows: [], columns: [], customAsync: "giaTriNhomAll" },
        kiemKeAll: { title: "Chi tiết kiểm kê", rows: [], columns: [], customAsync: "kiemKeAll" },
        tonDauKyDetail: { title: "Tồn đầu kỳ", rows: [], columns: [], customAsync: "tonDauKyDetail" },
        tongNhapDetail: { title: "Chi tiết nhập kho", rows: [], columns: [], customAsync: "tongNhapDetail" },
        tongXuatDetail: { title: "Chi tiết xuất kho", rows: [], columns: [], customAsync: "tongXuatDetail" },
        tongXuatItemRolls: { title: "Chi tiết cuộn/kiện xuất kho", rows: [], columns: [], customAsync: "tongXuatItemRolls" },
        tonKhoDetail: { title: "Chi tiết tồn kho", rows: [], columns: [], customAsync: "tonKhoDetail" },
        poTreDetail: { title: "PO đang trễ", rows: [], columns: [], customAsync: "poTreDetail" },
        alertDetail: { title: "Chi tiết cảnh báo", rows: [], columns: [], customAsync: "alertDetail" },
        matCountDrill_allRacks: {
            title: "Danh sách kệ đang sử dụng",
            rows: dkFilterRacksByPercent(0, Infinity),
            columns: DK_COLS_RACK_DRILL,
        },
        matCountDrill_under50: {
            title: "Danh sách kệ < 50% lấp đầy (còn trống nhiều)",
            rows: dkFilterRacksByPercent(0, 49.999),
            columns: DK_COLS_RACK_DRILL,
        },
        matCountDrill_85to100: {
            title: "Danh sách kệ 85% - 100% lấp đầy (gần đầy)",
            rows: dkFilterRacksByPercent(85, 100),
            columns: DK_COLS_RACK_DRILL,
        },
        matCountDrill_over100: {
            title: "Danh sách kệ > 100% (vượt tải - CẢNH BÁO)",
            rows: dkFilterRacksByPercent(100.001, Infinity),
            columns: DK_COLS_RACK_DRILL,
        },
        capacitySummary: {
            title: "Tóm tắt sức chứa kho",
            rows: [
                (function () {
                    var soMaVatTu2 =
                        state.distinctMat && state.distinctMat.length > 0
                            ? toNumber(state.distinctMat[0].SoMaVatTu)
                            : toNumber(overall.TotalVatTu);
                    return {
                        TotalCapacity: toNumber(overall.TotalCapacity),
                        UsedTotal: toNumber(overall.UsedNPL) + toNumber(overall.UsedPL),
                        TotalFreeCapacity: toNumber(overall.TotalFreeCapacity),
                        TotalPercent: toNumber(overall.TotalPercent),
                        FreePercent: toNumber(overall.FreePercent),
                        CapacityNPL: toNumber(overall.CapacityNPL),
                        UsedNPL: toNumber(overall.UsedNPL),
                        PercentNPL: toNumber(overall.PercentNPL),
                        CapacityPL: toNumber(overall.CapacityPL),
                        UsedPL: toNumber(overall.UsedPL),
                        PercentPL: toNumber(overall.PercentPL),
                        SoMaVatTu: soMaVatTu2,
                    };
                })(),
            ],
            columns: [
                { key: "TotalCapacity", label: "Tổng sức chứa (CBM)", number: 2 },
                { key: "UsedTotal", label: "CBM đã sử dụng", number: 2 },
                { key: "TotalFreeCapacity", label: "CBM còn trống", number: 2 },
                { key: "TotalPercent", label: "% lấp đầy tổng", percent: true },
                { key: "FreePercent", label: "% còn trống", percent: true },
                { key: "CapacityNPL", label: "Sức chứa NL (CBM)", number: 2 },
                { key: "UsedNPL", label: "NL đã dùng (CBM)", number: 2 },
                { key: "PercentNPL", label: "% NL sử dụng", percent: true },
                { key: "CapacityPL", label: "Sức chứa PL (CBM)", number: 2 },
                { key: "UsedPL", label: "PL đã dùng (CBM)", number: 2 },
                { key: "PercentPL", label: "% PL sử dụng", percent: true },
                { key: "SoMaVatTu", label: "Số mã vật tư", number: 0 },
            ],
        },
        inboundReady: {
            title: "Danh sách lệnh chuẩn bị về",
            rows: state.inbound.map(function (r, i) {
                return Object.assign({ STT: i + 1 }, r);
            }),
            columns: [
                { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                { key: "PO", label: "Số PO", center: true, width: 140 },
                { key: "TenKH", label: "Khách hàng", width: 130, center: true },
                { key: "TenNCC", label: "NCC", width: 280 },
                { key: "SLMua", label: "SL mua", number: 1, center: true, width: 100 },
                { key: "NgayNKDuKien", label: "Ngày dự kiến về", date: true, center: true, width: 120 },
                { key: "Dot", label: "Đợt", number: 0, center: true, width: 80 },
            ],
        },
        outboundReady: {
            title: "Danh sách lệnh chuẩn bị xuất",
            rows: state.outboundReady.map(function (r, i) {
                return Object.assign({ STT: i + 1 }, r);
            }),
            columns: [
                { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                { key: "MaLenh", label: "Mã lệnh SX", center: true, width: 120 },
                { key: "TenHang", label: "Mã hàng", width: 250 },
                { key: "SoLuongYeuCau", label: "SL chuẩn bị xuất", number: 2, width: 120 },
                { key: "KHCat", label: "KH cắt", date: true, center: true, width: 100 },
                { key: "DuKienCat", label: "Dự kiến cắt", date: true, center: true, width: 100 },
            ],
        },
        outboundRunning: {
            title: "Danh sách lệnh đang xuất",
            rows: state.outboundRunning.map(function (r, i) {
                return Object.assign({ STT: i + 1 }, r);
            }),
            columns: [
                { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                //  — MaLenh = PhieuXuatHang.MaLenh , header giữ "Mã lệnh SX"
                { key: "MaLenh", label: "Mã lệnh SX", center: true, width: 110 },
                { key: "PhieuDK", label: "Phiếu ĐK", center: true, width: 110 },
                { key: "MaGop", label: "Mã gộp", center: true, width: 110 },
                { key: "TenHang", label: "Tên hàng", width: 220 },
                { key: "TenKH", label: "Khách hàng", width: 150 },
                { key: "NgayXuatHang", label: "Ngày xuất", date: true, center: true, width: 100 },
                { key: "SoLuongYeuCau", label: "SL yêu cầu", number: 2, width: 110 },
                { key: "SLXuat", label: "SL đã xuất", number: 2, width: 110 },
                { key: "PctDaXuat", label: "% đã xuất", percent: true, width: 90 },
            ],
        },
        customersAll: {
            title: "Chi tiết khách hàng theo dung tích sử dụng",
            rows: (function () {
                try {
                    return buildCustomerDetailRows().map(function (r, i) {
                        return Object.assign({ STT: i + 1 }, r);
                    });
                } catch (e) {
                    return [];
                }
            })(),
            columns: [
                { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                { key: "MaKH", label: "Mã KH", center: true, width: 110 },
                { key: "TenKH", label: "Tên khách hàng", width: 250 },
                { key: "SLVatTu", label: "Số vật tư", number: 0, center: true, width: 100 },
                { key: "CBMSDTrongKho", label: "CBM sử dụng", number: 2, width: 120 },
                { key: "TyTrongCBM", label: "Tỷ trọng CBM (%)", percent: true, width: 120 },
            ],
        },
        top15MaxNL: (function () {
            var rows = (state.top15MaxNL || []).slice(0, 15).map(function (r, i) {
                return Object.assign({ STT: i + 1 }, r);
            });
            return {
                title: "Chi tiết Top 15 NL tồn kho nhiều nhất",
                rows: rows,
                columns: [
                    { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                    { key: "MaVT", label: "Mã vật tư", center: true, width: 140 },
                    { key: "TenVT", label: "Mô tả", width: 250 },
                    { key: "Mau", label: "Màu", center: true, width: 80 },
                    { key: "KhoVai", label: "Khổ vải", center: true, width: 80 },
                    { key: "ChiTiet", label: "Chi tiết", width: 180 },
                    { key: "TenDVVT", label: "Đơn vị", center: true, width: 60 },
                    { key: "TonKho", label: "Tồn kho", number: 2, width: 110, center: true },
                ],
            };
        })(),
        top15MaxPL: (function () {
            var rows = (state.top15MaxPL || []).slice(0, 15).map(function (r, i) {
                return Object.assign({ STT: i + 1 }, r);
            });
            return {
                title: "Chi tiết Top 15 PL tồn kho nhiều nhất",
                rows: rows,
                columns: [
                    { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                    { key: "MaVT", label: "Mã vật tư", center: true, width: 140 },
                    { key: "TenVT", label: "Mô tả", width: 250 },
                    { key: "Mau", label: "Màu", center: true, width: 80 },
                    { key: "KhoVai", label: "Khổ vải", center: true, width: 80 },
                    { key: "ChiTiet", label: "Chi tiết", width: 180 },
                    { key: "TenDVVT", label: "Đơn vị", center: true, width: 60 },
                    { key: "TonKho", label: "Tồn kho", number: 2, width: 110, center: true },
                ],
            };
        })(),
        racksAll: {
            title: "Chi tiết danh sách kệ kho (NL → PL)",
            rows: state.racks
                .slice()
                .sort(function (a, b) {
                    var mA = toNumber(a.Module),
                        mB = toNumber(b.Module);
                    if (mA !== mB) return mA - mB;
                    return (a.TenDay || "").localeCompare(b.TenDay || "");
                })
                .map(function (r, idx) {
                    var used = toNumber(r.TongCBMSuDungTrongKe);
                    var cap = toNumber(r.TongCBMTrongKe);
                    return {
                        STT: idx + 1,
                        Module: r.Module == 1 ? "NL" : r.Module == 2 ? "PL" : String(r.Module || ""),
                        TenDay: r.TenDay || "",
                        TenKe: r.TenKe || "",
                        TongCBMSuDungTrongKe: used,
                        TongCBMTrongKe: cap,
                        PctSuDung: cap > 0 ? (used / cap) * 100 : 0,
                        SLVatTu: toNumber(r.SLVatTu),
                    };
                }),
            columns: [
                { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                { key: "Module", label: "Loại kho", center: true, width: 85 },
                { key: "TenDay", label: "Tên dãy", center: true, width: 85 },
                { key: "TenKe", label: "Tên kệ", center: true, width: 95 },
                { key: "TongCBMSuDungTrongKe", label: "CBM sử dụng", number: 2, width: 110 },
                { key: "TongCBMTrongKe", label: "Tổng CBM", number: 2, width: 110, center: true },
                { key: "PctSuDung", label: "% sử dụng", percent: true, width: 95 },
                { key: "SLVatTu", label: "Số vật tư", number: 0, center: true, width: 85 },
            ],
        },
        inboundAll: {
            title: "Chi tiết lệnh chuẩn bị về",
            rows: state.inbound.map(function (r, i) {
                return Object.assign({ STT: i + 1 }, r);
            }),
            columns: [
                { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                { key: "PO", label: "Số PO", center: true, width: 140 },
                { key: "TenKH", label: "Khách hàng", width: 220 },
                { key: "TenNCC", label: "NCC", width: 220 },
                { key: "SLMua", label: "SL mua", number: 1, center: true, width: 100 },
                { key: "NgayNKDuKien", label: "Ngày dự kiến về", date: true, center: true, width: 120 },
                { key: "Dot", label: "Đợt", number: 0, center: true, width: 80 },
            ],
        },
        outboundReadyAll: {
            title: "Chi tiết lệnh chuẩn bị xuất",
            rows: state.outboundReady.map(function (r, i) {
                return Object.assign({ STT: i + 1 }, r);
            }),
            columns: [
                { key: "STT", label: "STT", number: 0, center: true },
                { key: "MaLenhSanXuat", label: "Mã lệnh SX", center: true },
                { key: "MaLenh", label: "Mã lệnh", center: true },
                { key: "MaDVSX", label: "Mã ĐVSX", center: true },
                { key: "TenHang", label: "Mã hàng" },
                { key: "KHCat", label: "KH cắt", date: true, center: true },
                { key: "DuKienCat", label: "Dự kiến cắt", date: true, center: true },
            ],
        },
        flowTrendDetail: (function () {
            var dailyData = state.flowTrendRangeRaw || [];
            if (dailyData.length > 0) {
                var rowsD = dailyData.map(function (r, i) {
                    var ngay = String(r.Ngay || "").substring(0, 10);
                    var parts = ngay.split("-");
                    var lbl = parts.length === 3 ? parts[2] + "/" + parts[1] + "/" + parts[0] : ngay;
                    var totalIn = toNumber(r.TotalIn);
                    var totalOut = toNumber(r.TotalOut);
                    var totalStk = toNumber(r.TotalStock);
                    return {
                        STT: i + 1,
                        KyBaoCao: lbl,
                        TotalIn: totalIn,
                        TotalOut: totalOut,
                        NetFlow: totalIn - totalOut,
                        TotalStock: totalStk,
                    };
                });
                return {
                    title: "Chi tiết biểu đồ xuất - nhập - tồn (theo ngày)",
                    rows: rowsD,
                    columns: [
                        { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                        { key: "KyBaoCao", label: "Ngày", center: true, width: 110 },
                        { key: "TotalIn", label: "Nhập", number: 0, width: 110 },
                        { key: "TotalOut", label: "Xuất", number: 0, width: 110 },
                        { key: "NetFlow", label: "Nhập - Xuất", number: 0, width: 115 },
                        { key: "TotalStock", label: "Tồn kho", number: 0, width: 130 },
                    ],
                };
            }
            var rows = (state.flowTrend12T || []).map(function (r, i) {
                var lbl = String(r.Thang || "").padStart(2, "0") + "/" + (r.Nam || "");
                var totalIn = toNumber(r.TotalIn);
                var totalOut = toNumber(r.TotalOut);
                var totalStk = toNumber(r.TotalStock);
                return {
                    STT: i + 1,
                    KyBaoCao: lbl,
                    TotalIn: totalIn,
                    TotalOut: totalOut,
                    NetFlow: totalIn - totalOut,
                    TotalStock: totalStk,
                };
            });
            return {
                title: "Chi tiết biểu đồ xuất - nhập - tồn (12 tháng gần nhất)",
                rows: rows,
                columns: [
                    { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                    { key: "KyBaoCao", label: "Kỳ báo cáo", center: true, width: 110 },
                    { key: "TotalIn", label: "Nhập", number: 0, width: 110 },
                    { key: "TotalOut", label: "Xuất", number: 0, width: 110 },
                    { key: "NetFlow", label: "Nhập - Xuất", number: 0, width: 115 },
                    { key: "TotalStock", label: "Tồn kho", number: 0, width: 130 },
                ],
            };
        })(),
        outboundRunningAll: {
            title: "Chi tiết lệnh đang xuất",
            rows: state.outboundRunning.map(function (r, i) {
                return Object.assign({ STT: i + 1 }, r);
            }),
            columns: [
                { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                { key: "MaLenhSX", label: "Mã lệnh SX", center: true, width: 130 },
                { key: "MaLenh", label: "Mã lệnh", center: true, width: 100 },
                { key: "MaGop", label: "Mã gộp", center: true, width: 100 },
                { key: "TenHang", label: "Tên hàng", width: 220 },
                { key: "TenKH", label: "Khách hàng", width: 180 },
                { key: "NgayXuatHang", label: "Ngày xuất", date: true, center: true, width: 100 },
                { key: "SLXuat", label: "SL xuất", number: 2, width: 110 },
            ],
        },
        ageStockDetail: (function () {
            var ageRows = state.ageStock.map(function (r, i) {
                var nplVal = r.NPL;
                var loaiKho = nplVal === true || nplVal === 1 || nplVal === "true" || nplVal === "1" ? "NL" : "PL";
                return Object.assign({ STT: i + 1 }, r, { LoaiKho: loaiKho });
            });
            return {
                title: "Chi tiết tuổi tồn kho theo nhóm vật tư",
                rows: ageRows,
                columns: [
                    { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                    { key: "TenNhom", label: "Nhóm vật tư", width: 240 },
                    { key: "Thang", label: "Tháng tuổi", number: 0, center: true, width: 100 },
                    { key: "TonKhoCT", label: "Tồn kho", number: 2, width: 120 },
                    { key: "LoaiKho", label: "Loại kho", center: true, width: 85 },
                ],
            };
        })(),
        turnoverDetail: (function () {
            var trend12 = state.flowTrend12T || [];
            var totalOut12 = 0,
                stockSum = 0,
                stockCount = 0;
            var monthRows = [];
            for (var _ti = 0; _ti < trend12.length; _ti++) {
                var _t = trend12[_ti];
                var _out = toNumber(_t.TotalOut);
                var _in = toNumber(_t.TotalIn);
                var _stk = toNumber(_t.TotalStock);
                totalOut12 += _out;
                if (_stk > 0) {
                    stockSum += _stk;
                    stockCount++;
                }
                var _lbl = String(_t.Thang).padStart(2, "0") + "/" + _t.Nam;
                var _to = _stk > 0 ? _out / _stk : 0;
                var _days = _to > 0 ? Math.round(365 / (_to * 12)) : 0;
                monthRows.push({
                    STT: _ti + 1,
                    KyBaoCao: _lbl,
                    TotalIn: _in,
                    TotalOut: _out,
                    TonKho: _stk,
                    VongQuayThang: _to > 0 ? formatNumber(_to, 2) : "--",
                    NgayTonTB: _days > 0 ? _days : "--",
                });
            }
            var avgStock = stockCount > 0 ? stockSum / stockCount : 0;
            var turnover = avgStock > 0 && totalOut12 > 0 ? totalOut12 / avgStock : 0;
            var avgDays = turnover > 0 ? Math.round(365 / turnover) : 0;
            return {
                title: "Chi tiết vòng quay hàng tồn kho (12 tháng)",
                meta:
                    "Vòng quay tổng: " + (turnover > 0 ? formatNumber(turnover, 2) + " lần/năm" : "--") + "  |  Ngày tồn kho TB: " + (avgDays > 0 ? avgDays + " ngày" : "--"),
                rows: monthRows,
                columns: [
                    { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                    { key: "KyBaoCao", label: "Kỳ báo cáo", center: true, width: 110 },
                    { key: "TotalIn", label: "Nhập", number: 0, width: 110 },
                    { key: "TotalOut", label: "Xuất", number: 0, width: 110 },
                    { key: "TonKho", label: "Tồn kho", number: 0, width: 120 },
                    { key: "VongQuayThang", label: "Vòng quay (lần/tháng)", center: true, width: 150 },
                    { key: "NgayTonTB", label: "Ngày tồn TB", center: true, width: 110 },
                ],
            };
        })(),
        thanhGiaDetail: (function () {
            var tg = state.thanhGia || {};
            var thanhGia = toNumber(tg.ThanhGia);
            var tongMa = toNumber(tg.TongMaVT);
            var soMaCoGia = toNumber(tg.SoMaCoGia);
            var soMaKhongGia = toNumber(tg.SoMaKhongGia);
            var tongSL = toNumber(tg.TongSoLuong);
            var avgGia = tongSL > 0 ? thanhGia / tongSL : 0;
            var pctCoGia = tongMa > 0 ? (soMaCoGia / tongMa) * 100 : 0;

            var rows = [
                { ChiSo: "Tổng thành giá hàng tồn (VND)", GiaTri: formatNumber(thanhGia, 0) },
                { ChiSo: "Tổng số mã vật tư trong kho", GiaTri: formatNumber(tongMa, 0) },
                {
                    ChiSo: "Số mã có giá",
                    GiaTri: formatNumber(soMaCoGia, 0) + "  (" + formatNumber(pctCoGia, 1) + "%)",
                },
                { ChiSo: "Số mã chưa có giá", GiaTri: formatNumber(soMaKhongGia, 0) },
                { ChiSo: "Tổng số lượng tồn", GiaTri: formatNumber(tongSL, 2) },
                { ChiSo: "Giá trị TB / 1 đơn vị (VND)", GiaTri: formatNumber(avgGia, 0) },
            ];
            return {
                title: "Chi tiết thành giá hàng tồn kho",
                meta: "Tổng giá trị: " + formatNumber(thanhGia, 0) + " VND",
                rows: rows.map(function (r, i) {
                    return Object.assign({ STT: i + 1 }, r);
                }),
                columns: [
                    { key: "STT", label: "STT", number: 0, center: true, width: 50 },
                    { key: "ChiSo", label: "Chỉ số", width: 250 },
                    { key: "GiaTri", label: "Giá trị", center: true, width: 180 }
                ],
            };
        })(),
    };

    if (detail === "customerRow") {

        var customerItem = buildCustomerDetailRows().filter(function (row) {
            return row.sourceIndex === index;
        })[0];
        return {
            title: "Vị trí lưu kho của khách hàng: " + (customerItem ? customerItem.TenKH || customerItem.MaKH : ""),
            rows: customerItem ? [customerItem] : [],
            columns: detailMap.customersAll.columns,
            customDrillCustomer: customerItem,
        };
    }

    if (detail === "rackRow") {
        var rackItem = state.racks[index];
        return {
            title: "Chi tiết kệ: " + (rackItem ? rackItem.TenKe || "" : ""),
            rows: rackItem ? [rackItem] : [],
            columns: detailMap.racksAll.columns,
            customDrillRack: rackItem,
        };
    }

    if (detail === "inboundRow") {
        var inboundItem = state.inbound[index];
        return {
            title: "Chi tiết lệnh chuẩn bị về",
            rows: inboundItem ? [inboundItem] : [],
            columns: detailMap.inboundAll.columns,
        };
    }

    if (detail === "outboundReadyRow") {
        var readyItem = state.outboundReady[index];
        return {
            title: "Chi tiết lệnh chuẩn bị xuất",
            rows: readyItem ? [readyItem] : [],
            columns: detailMap.outboundReadyAll.columns,
        };
    }

    if (detail === "outboundRunningRow") {
        var runningItem = state.outboundRunning[index];
        return {
            title: "Chi tiết lệnh đang xuất",
            rows: runningItem ? [runningItem] : [],
            columns: detailMap.outboundRunningAll.columns,
        };
    }

    return (
        detailMap[detail] || {
            title: "Chi tiết",
            rows: [],
            columns: [],
        }
    );
}

window.adjustDetailTableStickyHeader = function (tableId) {
    tableId = tableId || "dkDetailTableContainer";
    var run = function () {
        var container = document.getElementById(tableId);
        if (!container) return;
        var table = container.querySelector(".dk-detail-table");
        if (!table) return;
        var firstRow = table.querySelector("thead tr:first-child");
        if (firstRow) {
            var h = firstRow.offsetHeight;
            
            if (h > 30) {
                table.style.setProperty("--dk-header-h", h + "px");
            }
        }
    };
    run();
    setTimeout(run, 150);
    setTimeout(run, 350);
    setTimeout(run, 650);

    var container = document.getElementById(tableId);
    if (container && !container.__stickyBound) {
        container.__stickyBound = true;
        container.addEventListener("scroll", run, { passive: true });
    }
};

function renderTableBodyRowsInternal(columns, displayRows, startIdx) {
    startIdx = startIdx || 0;
    var TEXT_LEFT_KEYS = {
        TenKH: 1,
        KhachHang: 1,
        TenKe: 1,
        TenDay: 1,
        TenHang: 1,
        MaVT: 1,
        ChiTiet: 1,
        MaGop: 1,
        MaDH: 1,
        MaHang: 1,
        MaLenh: 1,
        MaDVSX: 1,
        MaNPL: 1,
        DanhSachKH: 1,
        DanhSachMaNPL: 1,
        ChiSo: 1,
        ItemCode: 1,
        TenVT: 1,
        MaPhieu: 1,
    };
    var MONO_KEYS = { ItemCode: 1, MaVT: 1, MaNPL: 1, MaGop: 1, MaLenh: 1, MaPhieu: 1 };

    return displayRows.map(function (row, rowIdx) {
        var cols = columns.map(function (column) {
            var value = row[column.key];
            if (column.key === "STT" && (value === undefined || value === null || value === 0 || value === "")) {
                value = startIdx + rowIdx + 1;
            }
            var cellStyle = "";
            if (column.raw) {
                var rawAlign = column.center ? "center" : "left";
                return '<td style="text-align:' + rawAlign + '">' + (value || "") + "</td>";
            }
            if (column.number !== undefined) {
                value = formatNumber(value, column.number);
                cellStyle = column.center ? ' style="text-align:center"' : ' style="text-align:right"';
            } else if (column.percent) {
                value = formatPercent(value);
                cellStyle = column.center ? ' style="text-align:center"' : ' style="text-align:right"';
            } else if (column.date) {
                value = formatDate(value);
                if (column.center) cellStyle = ' style="text-align:center"';
            } else if (column.center) {
                var cellMonoStyle = MONO_KEYS[column.key]
                    ? ";font-family:Consolas,'Courier New',ui-monospace,monospace;font-weight:600"
                    : "";
                cellStyle = ' style="text-align:center' + cellMonoStyle + '"';
            } else if (
                column.key === "TenKH" ||
                column.key === "KhachHang" ||
                column.key === "TenKe" ||
                column.key === "TenDay" ||
                TEXT_LEFT_KEYS[column.key]
            ) {
                if (column.key === "TenKH" || column.key === "KhachHang") value = normalizeCustomerName(value);
                var leftStyle = "text-align:left";
                if (MONO_KEYS[column.key]) {
                    leftStyle += ";font-family:Consolas,'Courier New',ui-monospace,monospace;font-weight:600";
                }
                cellStyle = ' style="' + leftStyle + '"';
            } else if (column.key === "MaLenhSanXuat" || column.key === "MaLenhSX") {
                value = shortMaLenh(value);
                var mlAlign = column.center ? "center" : "left";
                cellStyle = ' style="font-weight:700;text-align:' + mlAlign + '"';
            } else if (column.key === "LoaiKho" || column.key === "Module") {
                var loaiColor = value === "NL" ? "#2563eb" : value === "PL" ? "#d97706" : "#6b7280";
                var loaiAlign = column.center ? "center" : "left";
                return (
                    '<td style="text-align:' + loaiAlign + '"><span style="color:' +
                    loaiColor + ';font-weight:800">' + escapeHtml(value || "") + "</span></td>"
                );
            }
            return "<td" + cellStyle + ">" + escapeHtml(value) + "</td>";
        }).join("");

        return "<tr>" + cols + "</tr>";
    }).join("");
}

function renderDetailTable(columns, rows, tableId) {
    tableId = tableId || "dkDetailTableContainer";
    if (!window.__dkTableStates) {
        window.__dkTableStates = {};
    }
    window.__dkTableStates[tableId] = {
        columns: columns,
        rows: rows,
        limit: 150,
        filters: (window.__dkTableStates[tableId] && window.__dkTableStates[tableId].columns === columns) ? (window.__dkTableStates[tableId].filters || {}) : {}
    };

    setTimeout(function() {
        if (typeof window.adjustDetailTableStickyHeader === "function") {
            window.adjustDetailTableStickyHeader(tableId);
        }
    }, 80);

    return renderDetailTableInternal(columns, rows, 150, tableId);
}

function renderDetailTableInternal(columns, rows, limit, tableId) {
    tableId = tableId || "dkDetailTableContainer";
    if (!window.__dkTableStates) {
        window.__dkTableStates = {};
    }
    if (!window.__dkTableStates[tableId]) {
        window.__dkTableStates[tableId] = {
            columns: columns,
            rows: rows,
            limit: limit,
            filters: {}
        };
    }
    var stateObj = window.__dkTableStates[tableId];
    stateObj.limit = limit;

    if (!columns || columns.length === 0) {
        return '<p class="dk-empty">Không có cấu hình cột hiển thị.</p>';
    }

    if (!rows || rows.length === 0) {
        return '<p class="dk-empty">Không có dữ liệu chi tiết.</p>';
    }

    var TEXT_LEFT_KEYS = {
        TenKH: 1,
        KhachHang: 1,
        TenKe: 1,
        TenDay: 1,
        TenHang: 1,
        MaVT: 1,
        ChiTiet: 1,
        MaGop: 1,
        MaDH: 1,
        MaHang: 1,
        MaLenh: 1,
        MaDVSX: 1,
        MaNPL: 1,
        DanhSachKH: 1,
        DanhSachMaNPL: 1,
        ChiSo: 1,
        ItemCode: 1,
        TenVT: 1,
        MaPhieu: 1,
    };
    var MONO_KEYS = { ItemCode: 1, MaVT: 1, MaNPL: 1, MaGop: 1, MaLenh: 1, MaPhieu: 1 };

    var headHtml = columns
        .map(function (column) {
            var styles = [];
            if (column.center) {
                styles.push("text-align:center");
            } else if (column.number !== undefined || column.percent) {
                styles.push("text-align:right");
            } else if (TEXT_LEFT_KEYS[column.key]) {
                styles.push("text-align:left");
            }
            if (column.width) {
                var w = column.width + (typeof column.width === "number" ? "px" : "");
                styles.push("width:" + w + ";min-width:" + w);
            } else {
                styles.push("min-width:150px");
            }
            var thStyle = styles.length ? ' style="' + styles.join(";") + '"' : "";
            return "<th" + thStyle + ">" + escapeHtml(column.label) + "</th>";
        })
        .join("");

    var filters = stateObj.filters || {};
    var filterKeys = Object.keys(filters);
    var filteredRows = rows;
    if (filterKeys.length > 0) {
        filteredRows = rows.filter(function (row) {
            for (var i = 0; i < filterKeys.length; i++) {
                var key = filterKeys[i];
                var fVal = String(filters[key] || "").toLowerCase().trim();
                if (fVal === "") continue;
                var rVal = String(row[key] || "").toLowerCase();
                if (rVal.indexOf(fVal) === -1) {
                    return false;
                }
            }
            return true;
        });
    }

    var filterRowHtml = columns.map(function (column) {
        var styles = [];
        if (column.width) {
            var w = column.width + (typeof column.width === "number" ? "px" : "");
            styles.push("width:" + w + ";min-width:" + w);
        }
        var thStyle = styles.length ? ' style="' + styles.join(";") + '"' : "";
        
        if (column.key === "STT" || column.key === "Action" || column.key === "ChiTiet" || column.key === "Detail" || column.label === "Chi tiết" || column.label === "STT") {
            return "<th" + thStyle + "></th>";
        }
        var currentVal = filters[column.key] || "";
        return "<th" + thStyle + ' style="padding:4px 6px;">' +
               '  <input type="text" class="dk-table-col-filter" data-table-id="' + tableId + '" data-col-key="' + column.key + '" value="' + escapeHtml(currentVal) + '" placeholder="" style="width:100%; box-sizing:border-box; font-size:11.5px; color:var(--dk-text,#1e293b); outline:none;" oninput="window.__dkOnTableColFilter(this)" />' +
               "</th>";
    }).join("");

    var displayRows = filteredRows;
    var hasMore = false;
    if (filteredRows.length > limit) {
        displayRows = filteredRows.slice(0, limit);
        hasMore = true;
    }

    var bodyHtml = renderTableBodyRowsInternal(columns, displayRows, 0);

    var footerHtml = 
        '<div class="dk-table-load-more-wrap" style="text-align:center;padding:12px;background:var(--dk-card-alt,rgba(0,0,0,0.02));border-top:1px solid var(--dk-line,rgba(0,0,0,0.08))">' +
        '  <span class="dk-table-count-label" style="font-size:12.5px;color:var(--dk-text-muted,#64748b)"> <span class="dk-visible-count">' +
        '  <button type="button" class="dk-btn-load-more" onclick="window.dkLoadMoreDetailRows(\'' + tableId + '\')" style="background:var(--dk-primary,#2563eb);color:#fff;border:none;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:600;margin-left:8px;font-size:12px;display:' + (hasMore ? 'inline-block' : 'none') + '">Xem thêm 250 dòng</button>' +
        '  <button type="button" class="dk-btn-load-all" onclick="window.dkLoadAllDetailRows(\'' + tableId + '\')" style="background:none;color:var(--dk-primary,#2563eb);border:none;padding:5px 12px;cursor:pointer;font-weight:600;margin-left:8px;font-size:12px;display:' + (hasMore ? 'inline-block' : 'none') + '">Xem tất cả</button>' +
        '</div>';

    var styleHtml = 
        '<style>' +
        '  .dk-detail-table-wrap {' +
        '    transform: translateZ(0) !important;' +
        '    contain: paint !important;' +
        '    will-change: scroll-position;' +
        '  }' +
        '  .dk-detail-table tr {' +
        '    contain: layout style;' +
        '  }' +
        '  .dk-detail-table thead tr:first-child th {' +
        '    position: sticky !important;' +
        '    top: 0 !important;' +
        '    z-index: 22 !important;' +
        '    background: linear-gradient(135deg, #3b6bd0 0%, #5b8cf0 50%, #4f7ad6 100%) !important;' +
        '  }' +
        '  .dk-modal-content .dk-detail-table thead tr.dk-table-filter-tr th,' +
        '  .dk-detail-table thead tr.dk-table-filter-tr th {' +
        '    position: sticky !important;' +
        '    top: var(--dk-header-h, 42px) !important;' +
        '    z-index: 21 !important;' +
        '    background: var(--dk-bg-soft,#f8fafc) !important;' +
        '    box-shadow: inset 0 -1px 0 var(--dk-border,rgba(0,0,0,0.1)) !important;' +
        '    border-bottom: 2px solid var(--dk-border,rgba(0,0,0,0.12)) !important;' +
        '    pointer-events: auto !important;' +
        '  }' +
        '  body.dark-theme .dk-modal-content .dk-detail-table thead tr.dk-table-filter-tr th,' +
        '  body.dark-theme .dk-detail-table thead tr.dk-table-filter-tr th {' +
        '    position: sticky !important;' +
        '    top: var(--dk-header-h, 42px) !important;' +
        '    z-index: 21 !important;' +
        '    background: #0f172a !important;' +
        '    border-bottom: 2px solid rgba(255,255,255,0.1) !important;' +
        '  }' +
        '  .dk-table-col-filter {' +
        '    position: relative !important;' +
        '    z-index: 23 !important;' +
        '    cursor: text !important;' +
        '    pointer-events: auto !important;' +
        '    border: none !important;' +
        '    border-bottom: 1px dashed var(--dk-border, rgba(0,0,0,0.2)) !important;' +
        '    border-radius: 0px !important;' +
        '    background: transparent !important;' +
        '    text-align: inherit !important;' +
        '    padding: 2px 4px !important;' +
        '    color: var(--dk-text, #1e293b) !important;' +
        '    width: 100% !important;' +
        '    box-sizing: border-box !important;' +
        '    outline: none !important;' +
        '  }' +
        '  body.dark-theme .dk-table-col-filter {' +
        '    border: none !important;' +
        '    border-bottom: 1px dashed rgba(255, 255, 255, 0.25) !important;' +
        '    background: transparent !important;' +
        '    color: #e2e8f0 !important;' +
        '  }' +
        '  .dk-table-col-filter:focus {' +
        '    border-bottom: 1px solid var(--dk-primary, #3b82f6) !important;' +
        '    background: transparent !important;' +
        '  }' +
        '</style>';

    return (
        styleHtml +
        '<div class="dk-detail-table-wrap" id="' + tableId + '"><table class="dk-detail-table"><thead><tr>' + headHtml + '</tr><tr class="dk-table-filter-tr" style="background:var(--dk-card-alt,rgba(0,0,0,0.015));">' + filterRowHtml + '</tr></thead><tbody>' + bodyHtml + '</tbody></table>' + footerHtml + '</div>' +
        '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="display:none;" onload="if(typeof window.adjustDetailTableStickyHeader===\'function\')window.adjustDetailTableStickyHeader(\'' + tableId + '\');" />' +
        '<script>if(typeof window.adjustDetailTableStickyHeader===\'function\')window.adjustDetailTableStickyHeader("' + tableId + '");</script>'
    );
}

if (typeof window.dkLoadMoreDetailRows === "undefined") {
    window.dkLoadMoreDetailRows = function (tableId) {
        tableId = tableId || "dkDetailTableContainer";
        var s = window.__dkTableStates && window.__dkTableStates[tableId];
        if (!s) return;
        s.limit = Math.min(s.limit + 250, s.rows.length);
        var container = document.getElementById(tableId);
        if (container) {
            container.outerHTML = renderDetailTableInternal(s.columns, s.rows, s.limit, tableId);
        }
    };
}
if (typeof window.dkLoadAllDetailRows === "undefined") {
    window.dkLoadAllDetailRows = function (tableId) {
        tableId = tableId || "dkDetailTableContainer";
        var s = window.__dkTableStates && window.__dkTableStates[tableId];
        if (!s) return;
        s.limit = s.rows.length;
        var container = document.getElementById(tableId);
        if (container) {
            container.outerHTML = renderDetailTableInternal(s.columns, s.rows, s.limit, tableId);
        }
    };
}
if (typeof window.__dkOnTableColFilter === "undefined") {
    window.__dkOnTableColFilter = function (input) {
        var tableId = input.getAttribute("data-table-id");
        var key = input.getAttribute("data-col-key");
        var val = input.value;
        
        var s = window.__dkTableStates && window.__dkTableStates[tableId];
        if (s) {
            if (!s.filters) s.filters = {};
            s.filters[key] = val;
        }
        
        var container = document.getElementById(tableId);
        if (!container) return;
        
        var table = container.querySelector(".dk-detail-table");
        if (!table) return;
        
        var filterInputs = table.querySelectorAll(".dk-table-col-filter");
        var activeFilters = [];
        filterInputs.forEach(function (inp) {
            var v = inp.value.trim().toLowerCase();
            if (v !== "") {
                var th = inp.parentNode;
                var colIdx = Array.prototype.indexOf.call(th.parentNode.children, th);
                activeFilters.push({ colIdx: colIdx, query: v });
            }
        });
        
        var tbody = table.querySelector("tbody");
        if (!tbody) return;
        
        var isFilterActive = activeFilters.length > 0;
        
        // Filter the complete original dataset (s.rows) instead of just the visible DOM subset
        var filteredRows = s ? s.rows : [];
        if (isFilterActive && s) {
            filteredRows = s.rows.filter(function (row) {
                for (var i = 0; i < activeFilters.length; i++) {
                    var f = activeFilters[i];
                    var colKey = s.columns[f.colIdx] ? s.columns[f.colIdx].key : "";
                    if (!colKey) continue;
                    var rVal = String(row[colKey] || "").toLowerCase();
                    if (rVal.indexOf(f.query) === -1) {
                        return false;
                    }
                }
                return true;
            });
        }
        
        // Show all matches when filtering, otherwise show up to s.limit rows
        var displayRows = isFilterActive ? filteredRows : (s ? s.rows.slice(0, s.limit) : []);
        
        tbody.innerHTML = renderTableBodyRowsInternal(s ? s.columns : [], displayRows, 0);
        
        // Dynamic footer updates
        var footer = container.querySelector(".dk-table-load-more-wrap");
        if (footer) {
            if (isFilterActive) {
                footer.style.display = "none";
            } else {
                footer.style.display = "";
                var visSpan = footer.querySelector(".dk-visible-count");
                var totSpan = footer.querySelector(".dk-total-count");
                if (visSpan) visSpan.textContent = displayRows.length;
                if (totSpan) totSpan.textContent = s ? s.rows.length : displayRows.length;
                
                var btnMore = footer.querySelector(".dk-btn-load-more");
                var btnAll = footer.querySelector(".dk-btn-load-all");
                var hasMore = s && (s.rows.length > s.limit);
                if (btnMore) btnMore.style.display = hasMore ? "inline-block" : "none";
                if (btnAll) btnAll.style.display = hasMore ? "inline-block" : "none";
            }
        }
    };
}

var _detailStack = [];

