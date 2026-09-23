/**
 * ==========================================================================
 * NTBSOFT ERP - DEVEXTREME DYNAMIC GRID BUNDLE (ALL-IN-ONE)
 * File: dx-grid-bundle.js
 * Thư mục: Scripts/griddevextreme/
 * 
 * 👉 HOÀN TOÀN ĐỘNG (SCHEMA-AGNOSTIC):
 * - Không cố định bất kỳ cột nào.
 * - Áp dụng cho MỌI nghiệp vụ: Người dùng, Sản phẩm, Đơn hàng, Giao dịch, NPL...
 * - Tự động nhận diện cột từ API (Auto Column Detection).
 * - Tự động sinh thanh tiến độ (Progress bar), định dạng tiền tệ, badge trạng thái.
 * - Tự động tạo thẻ KPI tổng hợp và menu Gom nhóm (Grouping) trong Popup chi tiết.
 * 
 * 👉 CÁCH DÙNG TRÊN VIEW HTML (Chỉ cần 1 thẻ <div>):
 * <div class="dx-auto-grid"
 *      data-title="DANH SÁCH NGƯỜI DÙNG"
 *      data-api-url="/api/Users/GetAll"
 *      data-detail-api="/api/Users/GetLogChiTiet">
 * </div>
 * 
 * 
 * 
 * 
 * <!-- Nhúng file bundle (nếu chưa có trong _Layout) -->
<script src="~/Scripts/griddevextreme/dx-grid-bundle.js"></script>

<!-- Thẻ hiển thị: Tự động 100%, không cần khai báo cột -->
<div class="dx-auto-grid"
     data-title="DANH SÁCH BẤT KỲ"
     data-api-url="/api/YourController/GetAll"
     data-detail-api="/api/YourController/GetChiTiet">
</div>

 * 
 * 
 * ==========================================================================
 */

(function (window, $) {
    'use strict';

    // =========================================================================
    // 1. TỰ ĐỘNG INJECT CSS ĐỒNG BỘ
    // =========================================================================
    (function autoInjectCss() {
        if (!document.getElementById('dx-bundle-injected-style')) {
            const css = `
                .dx-component-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                    margin-bottom: 20px;
                    overflow: hidden;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                }
                .dx-component-card.fullscreen {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    width: 100vw !important; height: 100vh !important;
                    z-index: 99999;
                    border-radius: 0;
                }
                .dx-component-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 13px 18px;
                    background: #ffffff;
                    border-bottom: 1px solid #edf2f7;
                }
                .dx-component-title {
                    margin: 0;
                    font-size: 13.5px;
                    font-weight: 700;
                    color: #1e293b;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }
                .dx-btn-expand {
                    background: transparent;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    font-size: 14px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    transition: background 0.15s ease;
                }
                .dx-btn-expand:hover {
                    background: #f1f5f9;
                    color: #1e293b;
                }
                .dx-popup-detail-content {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    height: 100%;
                    box-sizing: border-box;
                    padding: 4px;
                }
                .dx-popup-kpi-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }
                .dx-popup-kpi-card {
                    flex: 1;
                    min-width: 160px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 10px 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .dx-popup-kpi-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                }
                .dx-popup-kpi-val {
                    font-size: 17px;
                    font-weight: 700;
                    color: #1e293b;
                }
                .dx-popup-toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    flex-wrap: wrap;
                }
                .dx-popup-search-wrap {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #f1f5f9;
                    padding: 6px 12px;
                    border-radius: 6px;
                    flex: 1;
                    max-width: 400px;
                }
                .dx-popup-search-wrap i { color: #64748b; font-size: 13px; }
                .dx-popup-search-input {
                    border: none;
                    background: transparent;
                    outline: none;
                    width: 100%;
                    font-size: 13px;
                }
                .dx-popup-group-wrap {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: #475569;
                }
                .dx-popup-group-select {
                    border: 1px solid #cbd5e1;
                    border-radius: 5px;
                    padding: 5px 10px;
                    font-size: 12.5px;
                    outline: none;
                    background: #ffffff;
                }
                .dx-popup-grid-wrapper {
                    flex: 1;
                    min-height: 320px;
                }
            `;
            const style = document.createElement('style');
            style.id = 'dx-bundle-injected-style';
            style.type = 'text/css';
            style.appendChild(document.createTextNode(css));
            document.head.appendChild(style);
        }
    })();

    // =========================================================================
    // 2. TIỆN ÍCH TỰ ĐỘNG PHÂN TÍCH CỘT TỪ DỮ LIỆU JSON (SCHEMA DISCOVERY)
    // =========================================================================
    function formatCaption(key) {
        if (!key) return '';
        // Tách camelCase: tenKhachHang -> Ten Khach Hang
        const result = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    function autoDetectColumns(dataArray, isDetail = false) {
        if (!dataArray || !dataArray.length) return [];
        const sample = dataArray[0];
        const cols = [];

        Object.keys(sample).forEach((key, idx) => {
            const lower = key.toLowerCase();
            if (lower === 'id' && isDetail) return; // Ẩn cột id kỹ thuật trong popup

            let caption = formatCaption(key);
            let alignment = 'left';
            let val = sample[key];

            let colDef = {
                dataField: key,
                caption: caption,
                alignment: alignment
            };

            // 1. Kiểu số (Tiền tệ, Số lượng, Tiến độ %)
            if (typeof val === 'number' || (typeof val === 'string' && /^-?\d+(\.\d+)?%?$/.test(val.trim()))) {
                colDef.alignment = 'right';

                // Tiến độ % (Progress Bar)
                if (lower.includes('rate') || lower.includes('percent') || lower.includes('tiendo') || String(val).includes('%')) {
                    colDef.cellTemplate = function (container, options) {
                        const num = parseFloat(String(options.value).replace(/[^0-9.-]/g, '')) || 0;
                        const p = Math.min(Math.max(num, 0), 100);
                        let barColor = '#10b981';
                        if (p < 60) barColor = '#ef4444';
                        else if (p < 80) barColor = '#f59e0b';
                        else if (p < 100) barColor = '#2563eb';

                        $(`
                            <div style="display: flex; align-items: center; gap: 8px; min-width: 110px;">
                                <div style="flex: 1; height: 6px; background: #e2e8f0; border-radius: 999px; overflow: hidden;">
                                    <div style="width: ${p}%; height: 100%; background: ${barColor}; border-radius: 999px;"></div>
                                </div>
                                <span style="font-weight: 600; font-size: 11.5px; min-width: 32px; text-align: right;">${p}%</span>
                            </div>
                        `).appendTo(container);
                    };
                }
                // Tiền tệ
                else if (lower.includes('gia') || lower.includes('price') || lower.includes('tien') || lower.includes('amount') || lower.includes('total')) {
                    colDef.format = '#,##0 ₫';
                }
                // Số lượng thông thường
                else if (typeof val === 'number') {
                    colDef.format = '#,##0';
                }
            }
            // 2. Kiểu ngày tháng
            else if (val instanceof Date || (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val))) {
                colDef.dataType = 'date';
                colDef.format = 'dd/MM/yyyy';
                colDef.alignment = 'center';
            }
            // 3. Kiểu Trạng thái (Status Badge)
            else if (typeof val === 'string' && (lower.includes('status') || lower.includes('trangthai') || lower.includes('state'))) {
                colDef.alignment = 'center';
                colDef.cellTemplate = function (container, options) {
                    const text = options.value || '';
                    const l = text.toLowerCase();
                    let bg = '#eff6ff', color = '#2563eb';

                    if (l.includes('đủ') || l.includes('xong') || l.includes('hoàn thành') || l.includes('active') || l.includes('success') || l.includes('100%')) {
                        bg = '#ecfdf5'; color = '#059669';
                    } else if (l.includes('thiếu') || l.includes('chờ') || l.includes('pending') || l.includes('warning')) {
                        bg = '#fffbeb'; color = '#d97706';
                    } else if (l.includes('trễ') || l.includes('hủy') || l.includes('khóa') || l.includes('danger')) {
                        bg = '#fef2f2'; color = '#dc2626';
                    }

                    $(`<span style="background: ${bg}; color: ${color}; font-weight: 600; padding: 2px 8px; border-radius: 4px; font-size: 12px; display: inline-block;">${text}</span>`).appendTo(container);
                };
            }

            // Cột đầu tiên có icon link mở chi tiết
            if (idx === 0) {
                const oldTemplate = colDef.cellTemplate;
                colDef.cellTemplate = function (container, options) {
                    const text = options.value || '';
                    $(`
                        <div style="display: flex; align-items: center; gap: 7px; color: #2563eb; font-weight: 600; cursor: pointer;">
                            <i class="fa-regular fa-square-arrow-up-right" style="color: #60a5fa; font-size: 12px;"></i>
                            <span>${text}</span>
                        </div>
                    `).appendTo(container);
                };
            }

            cols.push(colDef);
        });

        return cols;
    }

    // =========================================================================
    // 3. CORE COMPONENT CLASS: DxDetailGridComponent (ĐỘNG 100%)
    // =========================================================================
    class DxDetailGridComponent {
        constructor(options) {
            this.options = Object.assign({
                containerId: null,
                title: 'BẢNG DỮ LIỆU TỔNG QUAN',
                allowFullscreen: true,
                dataSource: [],
                columns: null, // Để null để tự động nhận diện
                apiUrl: null,
                detailApiUrl: null,
                masterGridOptions: {},
                detailConfig: {
                    getTitle: (row) => 'Chi tiết thông tin',
                    loadDetail: null,
                    columns: null
                }
            }, options);

            this.container = typeof this.options.containerId === 'string'
                ? document.querySelector(this.options.containerId)
                : this.options.containerId;

            if (!this.container) return;

            this.uniqueId = 'dx_grid_' + Math.random().toString(36).substr(2, 9);
            this.masterData = [];
            this.buildCardLayout();
            this.loadMasterData();
            this.initDetailPopup();
        }

        buildCardLayout() {
            this.container.classList.add('dx-component-card');
            this.container.innerHTML = `
                <div class="dx-component-header">
                    <h3 class="dx-component-title">${this.options.title}</h3>
                    <div class="dx-component-actions">
                        ${this.options.allowFullscreen ? `
                            <button type="button" class="dx-btn-expand" title="Phóng to / Thu nhỏ" id="${this.uniqueId}_btn_expand">
                                <i class="fa-solid fa-up-right-and-down-left-from-center"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div id="${this.uniqueId}_master_grid" class="dx-detail-grid-container"></div>
            `;

            if (this.options.allowFullscreen) {
                const btn = document.getElementById(`${this.uniqueId}_btn_expand`);
                if (btn) btn.addEventListener('click', () => this.toggleFullscreen());
            }
        }

        loadMasterData() {
            if (this.options.apiUrl) {
                $.ajax({
                    url: this.options.apiUrl,
                    type: 'GET',
                    dataType: 'json',
                    success: (res) => {
                        const items = Array.isArray(res) ? res : (res.data || res.items || []);
                        this.renderMasterGrid(items);
                    },
                    error: () => this.renderMasterGrid([])
                });
            } else if (Array.isArray(this.options.dataSource) && this.options.dataSource.length) {
                this.renderMasterGrid(this.options.dataSource);
            } else {
                this.renderMasterGrid([]);
            }
        }

        renderMasterGrid(items) {
            this.masterData = items;
            const gridEl = document.getElementById(`${this.uniqueId}_master_grid`);
            if (!gridEl || typeof $ === 'undefined' || !$.fn.dxDataGrid) return;

            // Tự động nhận diện cột nếu chưa có cấu hình cột
            let cols = this.options.columns;
            if (!cols || !cols.length) {
                cols = autoDetectColumns(items, false);
            }

            const self = this;
            const baseOptions = {
                dataSource: items,
                columns: cols && cols.length ? cols : undefined,
                showBorders: false,
                rowAlternationEnabled: false,
                hoverStateEnabled: true,
                columnAutoWidth: true,
                paging: { pageSize: 10 },
                pager: {
                    visible: true,
                    showPageSizeSelector: true,
                    allowedPageSizes: [5, 10, 20],
                    showInfo: true,
                    infoText: 'Hiển thị {0} - {1} / {2} dòng'
                },
                searchPanel: { visible: true, placeholder: 'Tìm kiếm nhanh...' },
                onRowClick: function (e) {
                    if (e.rowType === 'data' && e.data) {
                        self.openDetail(e.data);
                    }
                }
            };

            this.masterGridInstance = $(gridEl).dxDataGrid(Object.assign(baseOptions, this.options.masterGridOptions)).dxDataGrid('instance');
        }

        initDetailPopup() {
            const popupContainerId = `${this.uniqueId}_popup_container`;
            let popupContainer = document.getElementById(popupContainerId);
            if (!popupContainer) {
                popupContainer = document.createElement('div');
                popupContainer.id = popupContainerId;
                document.body.appendChild(popupContainer);
            }
            const self = this;
            this.detailPopupInstance = $(popupContainer).dxPopup({
                title: 'Chi tiết thông tin',
                showTitle: true,
                visible: false,
                closeOnOutsideClick: true,
                showCloseButton: true,
                width: '88vw',
                height: '82vh',
                maxWidth: 1200,
                maxHeight: 720,
                contentTemplate: function (contentElement) {
                    const html = `
                        <div class="dx-popup-detail-content">
                            <div class="dx-popup-kpi-grid" id="${self.uniqueId}_kpi_container"></div>
                            <div class="dx-popup-toolbar">
                                <div class="dx-popup-search-wrap">
                                    <i class="fa-solid fa-magnifying-glass"></i>
                                    <input type="text" class="dx-popup-search-input" id="${self.uniqueId}_search" placeholder="Tìm kiếm nhanh trong bảng chi tiết..." />
                                </div>
                                <div class="dx-popup-group-wrap">
                                    <span>Gom nhóm:</span>
                                    <select class="dx-popup-group-select" id="${self.uniqueId}_group">
                                        <option value="">Chi tiết (Không gom)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="dx-popup-grid-wrapper" id="${self.uniqueId}_detail_grid"></div>
                        </div>
                    `;
                    contentElement.append(html);
                    self.initDetailDataGrid();
                    self.bindPopupToolbar();
                }
            }).dxPopup('instance');
        }

        initDetailDataGrid() {
            const gridEl = document.getElementById(`${this.uniqueId}_detail_grid`);
            if (!gridEl) return;
            this.detailGridInstance = $(gridEl).dxDataGrid({
                dataSource: [],
                showBorders: false,
                rowAlternationEnabled: true,
                hoverStateEnabled: true,
                columnAutoWidth: true,
                paging: { pageSize: 15 },
                pager: {
                    visible: true,
                    showPageSizeSelector: true,
                    allowedPageSizes: [10, 15, 30, 50],
                    showInfo: true,
                    infoText: 'Trang {0} / {1} (Tổng: {2} dòng)'
                }
            }).dxDataGrid('instance');
        }

        bindPopupToolbar() {
            const self = this;
            const searchInput = document.getElementById(`${this.uniqueId}_search`);
            if (searchInput) {
                searchInput.addEventListener('input', function () {
                    if (self.detailGridInstance) self.detailGridInstance.searchByText(this.value.trim());
                });
            }
            const groupSelect = document.getElementById(`${this.uniqueId}_group`);
            if (groupSelect) {
                groupSelect.addEventListener('change', function () {
                    if (!self.detailGridInstance) return;
                    const colCount = self.detailGridInstance.columnCount();
                    for (let i = 0; i < colCount; i++) self.detailGridInstance.columnOption(i, 'groupIndex', undefined);
                    if (this.value) self.detailGridInstance.columnOption(this.value, 'groupIndex', 0);
                });
            }
        }

        openDetail(rowData) {
            let title = 'Chi tiết';
            if (typeof this.options.detailConfig.getTitle === 'function') {
                title = this.options.detailConfig.getTitle(rowData);
            } else {
                title = `Chi tiết: ${rowData.name || rowData.title || rowData.fullName || rowData.maSP || rowData.maHang || rowData.id || ''}`;
            }

            this.detailPopupInstance.option('title', title);
            this.detailPopupInstance.show();

            // Gọi API lấy dữ liệu chi tiết
            const detailApi = this.options.detailApiUrl;
            if (detailApi) {
                if (this.detailGridInstance) this.detailGridInstance.beginCustomLoading('Đang tải dữ liệu từ máy chủ...');
                $.ajax({
                    url: detailApi,
                    type: 'GET',
                    data: rowData,
                    dataType: 'json',
                    success: (res) => {
                        const items = Array.isArray(res) ? res : (res.data || res.items || []);
                        this.applyDetailData(items, rowData);
                    },
                    error: () => this.applyDetailData([], rowData),
                    complete: () => {
                        if (this.detailGridInstance) this.detailGridInstance.endCustomLoading();
                    }
                });
            } else if (typeof this.options.detailConfig.loadDetail === 'function') {
                const res = this.options.detailConfig.loadDetail(rowData);
                if (res && typeof res.then === 'function') {
                    res.then(items => this.applyDetailData(items, rowData)).catch(() => this.applyDetailData([], rowData));
                } else {
                    this.applyDetailData(res || [], rowData);
                }
            } else {
                this.applyDetailData(rowData.details || [], rowData);
            }
        }

        applyDetailData(items, parentRow) {
            // 1. Tự động sinh KPI tổng hợp
            this.renderDynamicKpis(items, parentRow);

            // 2. Tự động nhận diện cột cho bảng chi tiết
            let cols = this.options.detailConfig.columns;
            if (!cols || !cols.length) {
                cols = autoDetectColumns(items, true);
            }

            // 3. Tự động thêm các cột văn bản vào Dropdown gom nhóm
            const groupSelect = document.getElementById(`${this.uniqueId}_group`);
            if (groupSelect && cols && cols.length) {
                let optsHtml = '<option value="">Chi tiết (Không gom)</option>';
                cols.forEach(c => {
                    if (c.dataType !== 'date' && !c.cellTemplate) {
                        optsHtml += `<option value="${c.dataField}">Gom theo ${c.caption}</option>`;
                    }
                });
                groupSelect.innerHTML = optsHtml;
            }

            // 4. Cập nhật vào DataGrid
            if (this.detailGridInstance) {
                this.detailGridInstance.option('columns', cols && cols.length ? cols : undefined);
                this.detailGridInstance.option('dataSource', items);
                this.detailGridInstance.refresh();
            }
        }

        renderDynamicKpis(items, parentRow) {
            const kpiContainer = document.getElementById(`${this.uniqueId}_kpi_container`);
            if (!kpiContainer) return;

            let cardsHtml = `
                <div class="dx-popup-kpi-card">
                    <span class="dx-popup-kpi-label">TỔNG SỐ BẢN GHI</span>
                    <span class="dx-popup-kpi-val" style="color: #2563eb;">${(items || []).length}</span>
                </div>
            `;

            // Tự động tìm các cột số để tính tổng
            if (items && items.length) {
                const sample = items[0];
                let numericFields = Object.keys(sample).filter(k => typeof sample[k] === 'number').slice(0, 2);

                numericFields.forEach(f => {
                    const sum = items.reduce((acc, cur) => acc + (cur[f] || 0), 0);
                    cardsHtml += `
                        <div class="dx-popup-kpi-card">
                            <span class="dx-popup-kpi-label">TỔNG ${formatCaption(f)}</span>
                            <span class="dx-popup-kpi-val" style="color: #059669;">${sum.toLocaleString('vi-VN')}</span>
                        </div>
                    `;
                });
            }

            kpiContainer.innerHTML = cardsHtml;
        }

        toggleFullscreen() {
            this.container.classList.toggle('fullscreen');
            if (this.masterGridInstance) this.masterGridInstance.updateDimensions();
        }
    }

    // =========================================================================
    // 4. ADAPTER DÀNH CHO BẢNG NPL VÀ KHỞI TẠO TỰ ĐỘNG
    // =========================================================================
    let sharedMaterialPopupComp = null;
    let lastPopupOpenTime = 0;

    function showMaterialDetailPopup(materialItem) {
        if (!materialItem) return;

        // 👉 CHỐNG MỞ 2 LẦN (DEBOUNCE): Chặn sự kiện gọi lặp lại trong 350ms
        const now = Date.now();
        if (now - lastPopupOpenTime < 350) return;
        lastPopupOpenTime = now;

        let tempDiv = document.getElementById('dx_dynamic_material_holder');
        if (!tempDiv) {
            tempDiv = document.createElement('div');
            tempDiv.id = 'dx_dynamic_material_holder';
            document.body.appendChild(tempDiv);
        }

        // Tái sử dụng cùng 1 instance (Singleton), không tạo thêm popup mới
        if (!sharedMaterialPopupComp) {
            sharedMaterialPopupComp = new DxDetailGridComponent({
                containerId: tempDiv,
                title: `Chi tiết: ${materialItem.name || 'Vật tư'}`,
                apiUrl: window.API_GET_NPL_DETAIL ? `${window.API_GET_NPL_DETAIL}?name=${encodeURIComponent(materialItem.name || '')}` : null
            });
        }

        sharedMaterialPopupComp.openDetail(materialItem);
    }

    // Tự động quét tất cả các thẻ: <div class="dx-auto-grid" ...>
    function autoInitDeclarativeGrids() {
        document.querySelectorAll('.dx-auto-grid').forEach(el => {
            if (el.hasChildNodes()) return;

            const title = el.getAttribute('data-title') || 'BẢNG DỮ LIỆU TỔNG QUAN';
            const apiUrl = el.getAttribute('data-api-url');
            const detailApiUrl = el.getAttribute('data-detail-api');
            const rawColumns = el.getAttribute('data-columns');
            let columns = null;
            if (rawColumns) {
                try { columns = JSON.parse(rawColumns); } catch (e) { }
            }

            new DxDetailGridComponent({
                containerId: el,
                title: title,
                apiUrl: apiUrl,
                detailApiUrl: detailApiUrl,
                columns: columns
            });
        });
    }

    $(document).ready(function () {
        // Chỉ bắt sự kiện nếu bảng chưa được gắn onclick bởi dongbo-tab-tiendo.js
        $(document).off('click.dx_bundle_npl').on('click.dx_bundle_npl', '#table-materials tbody tr:not(.octo-table-clickable-row)', function () {
            const idx = $(this).attr('data-material-idx');
            let item = null;
            if (idx !== undefined && window.TabTienDoModule && window.TabTienDoModule.currentMaterials) {
                item = window.TabTienDoModule.currentMaterials[parseInt(idx)];
            }
            if (!item) {
                const name = $(this).find('td:first-child').text().trim();
                const demand = $(this).find('td:nth-child(2)').text().trim();
                const available = $(this).find('td:nth-child(3)').text().trim();
                if (name) item = { name, demand, available, rate: 100 };
            }
            if (item) showMaterialDetailPopup(item);
        });

        autoInitDeclarativeGrids();
    });

    // =========================================================================
    // 5. GLOBAL EXPORT
    // =========================================================================
    window.DxDetailGridComponent = DxDetailGridComponent;
    window.showMaterialDetailPopup = showMaterialDetailPopup;
    window.DxGrid = {
        openDetail: showMaterialDetailPopup,
        create: function (options) {
            return new DxDetailGridComponent(options);
        },
        init: autoInitDeclarativeGrids
    };

})(window, window.jQuery || window.$);
