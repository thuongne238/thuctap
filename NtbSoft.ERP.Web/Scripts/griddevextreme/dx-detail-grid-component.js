/**
 * ==========================================================================
 * NTBSOFT ERP - CORE COMPONENT: DEVEXTREME DETAIL GRID COMPONENT
 * File: dx-detail-grid-component.js
 * Thư mục: Scripts/griddevextreme/
 * 
 * Component tổng quát, có thể tái sử dụng cho nhiều nghiệp vụ khác nhau:
 * - Render Grid chính (Master Grid) hiển thị danh sách tổng hợp
 * - Bấm vào từng dòng (Row Click) -> Mở Popup chi tiết (Detail Popup dxPopup)
 * - Header Popup hiển thị các thẻ KPI thống kê tóm tắt
 * - Thanh công cụ gồm ô tìm kiếm nhanh và dropdown gom nhóm dữ liệu
 * - Grid chi tiết hiển thị dữ liệu chi tiết của item đó
 * - Hỗ trợ nạp dữ liệu Mockup hoặc gọi trực tiếp API Database (Ajax / Web API)
 * ==========================================================================
 */

(function (window, $) {
    'use strict';

    if (typeof DevExpress === 'undefined') {
        console.error('[DxDetailGridComponent] Thư viện DevExtreme chưa được nạp. Vui lòng thêm dx.all.js!');
    }

    class DxDetailGridComponent {
        /**
         * @param {Object} options Cấu hình khởi tạo component
         * @param {string|HTMLElement} options.containerId ID hoặc selector phần tử chứa Master Grid (ví dụ: '#grid-npl-container')
         * @param {string} options.title Tiêu đề của Grid (ví dụ: 'TÌNH HÌNH NGUYÊN PHỤ LIỆU THEO LOẠI')
         * @param {boolean} [options.allowFullscreen=true] Cho phép phóng to toàn màn hình
         * @param {Array|Function|Object} options.dataSource Dữ liệu Master hoặc hàm nạp dữ liệu/API Url
         * @param {Array} options.columns Danh sách cột cho Master Grid
         * @param {Array} [options.legends] Danh sách chú thích ở chân bảng [{ color: '#10B981', text: 'Đủ 100%' }]
         * @param {Object} [options.masterGridOptions] Cấu hình bổ sung tùy chỉnh cho Master dxDataGrid
         * @param {Object} options.detailConfig Cấu hình cho Popup & Grid Chi tiết
         * @param {Function} options.detailConfig.getTitle Hàm trả về tiêu đề popup (e.g. (row) => `Chi tiết: ${row.name}`)
         * @param {Function} [options.detailConfig.getKpiCards] Hàm trả về mảng các thẻ KPI [{ label: 'LOẠI VẬT TƯ', value: 'FABRIC' }]
         * @param {Function|string} options.detailConfig.loadDetail Hàm nạp dữ liệu chi tiết (nhận rowData, trả về Array hoặc Promise/Ajax) hoặc URL API
         * @param {Array} options.detailConfig.columns Danh sách cột cho Detail Grid
         * @param {Array} [options.detailConfig.groupOptions] Tùy chọn gom nhóm [{ label: 'Chi tiết (Không gom)', value: '' }, { label: 'Theo Mã hàng', value: 'maHang' }]
         * @param {Object} [options.detailConfig.popupOptions] Cấu hình bổ sung cho dxPopup
         * @param {Object} [options.detailConfig.gridOptions] Cấu hình bổ sung cho Detail dxDataGrid
         */
        constructor(options) {
            this.options = Object.assign({
                containerId: null,
                title: 'BẢNG DỮ LIỆU TỔNG QUAN',
                allowFullscreen: true,
                dataSource: [],
                columns: [],
                legends: [],
                masterGridOptions: {},
                detailConfig: {
                    getTitle: (row) => 'Thông tin chi tiết',
                    getKpiCards: (row) => [],
                    loadDetail: (row) => [],
                    columns: [],
                    groupOptions: [],
                    popupOptions: {},
                    gridOptions: {}
                }
            }, options);

            this.container = typeof this.options.containerId === 'string' 
                ? document.querySelector(this.options.containerId) 
                : this.options.containerId;

            if (!this.container) {
                console.error(`[DxDetailGridComponent] Không tìm thấy container: ${this.options.containerId}`);
                return;
            }

            this.masterGridInstance = null;
            this.detailPopupInstance = null;
            this.detailGridInstance = null;
            this.currentMasterRow = null;
            this.currentDetailData = [];

            this.uniqueId = 'dx_grid_' + Math.random().toString(36).substr(2, 9);
            this.init();
        }

        // Khởi tạo layout và các widget
        init() {
            this.buildCardLayout();
            this.initMasterGrid();
            this.initDetailPopup();
        }

        // Dựng khung thẻ HTML card bọc ngoài
        buildCardLayout() {
            this.container.classList.add('dx-component-card');

            let headerHtml = `
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
            `;

            let bodyHtml = `<div id="${this.uniqueId}_master_grid" class="dx-detail-grid-container"></div>`;

            let legendHtml = '';
            if (this.options.legends && this.options.legends.length > 0) {
                legendHtml = '<div class="dx-component-legend">';
                this.options.legends.forEach(item => {
                    legendHtml += `
                        <div class="dx-component-legend-item">
                            <span class="dx-status-dot" style="background-color: ${item.color};"></span>
                            <span>${item.text}</span>
                        </div>
                    `;
                });
                legendHtml += '</div>';
            }

            this.container.innerHTML = headerHtml + bodyHtml + legendHtml;

            // Bắt sự kiện phóng to toàn màn hình
            if (this.options.allowFullscreen) {
                const btnExpand = document.getElementById(`${this.uniqueId}_btn_expand`);
                if (btnExpand) {
                    btnExpand.addEventListener('click', () => this.toggleFullscreen());
                }
            }
        }

        // Khởi tạo Master DataGrid
        initMasterGrid() {
            const self = this;
            const gridEl = document.getElementById(`${this.uniqueId}_master_grid`);
            if (!gridEl) return;

            const baseOptions = {
                dataSource: this.options.dataSource,
                columns: this.options.columns,
                showBorders: false,
                rowAlternationEnabled: false,
                hoverStateEnabled: true,
                columnAutoWidth: true,
                paging: {
                    pageSize: 10
                },
                pager: {
                    showPageSizeSelector: false,
                    showInfo: false,
                    visible: false
                },
                loadPanel: {
                    enabled: true,
                    text: 'Đang tải dữ liệu...'
                },
                onRowClick: function (e) {
                    if (e.rowType === 'data' && e.data) {
                        self.openDetail(e.data);
                    }
                }
            };

            const mergedOptions = Object.assign(baseOptions, this.options.masterGridOptions);
            this.masterGridInstance = $(gridEl).dxDataGrid(mergedOptions).dxDataGrid('instance');
        }

        // Khởi tạo Popup chi tiết
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
                dragEnabled: false,
                closeOnOutsideClick: true,
                showCloseButton: true,
                width: '85vw',
                height: '80vh',
                maxWidth: 1200,
                maxHeight: 700,
                contentTemplate: function (contentElement) {
                    const html = `
                        <div class="dx-popup-detail-content">
                            <!-- 1. Hàng KPI tổng hợp -->
                            <div class="dx-popup-kpi-grid" id="${self.uniqueId}_kpi_container"></div>

                            <!-- 2. Thanh công cụ tìm kiếm & gom nhóm -->
                            <div class="dx-popup-toolbar">
                                <div class="dx-popup-search-wrap">
                                    <i class="fa-solid fa-magnifying-glass"></i>
                                    <input type="text" class="dx-popup-search-input" id="${self.uniqueId}_detail_search" placeholder="Tìm kiếm nhanh Mã lệnh, Mã hàng, ItemCode, Màu..." />
                                </div>
                                <div class="dx-popup-group-wrap" id="${self.uniqueId}_group_wrap">
                                    <span>Gom nhóm:</span>
                                    <select class="dx-popup-group-select" id="${self.uniqueId}_detail_group">
                                        <option value="">Chi tiết (Không gom)</option>
                                    </select>
                                </div>
                            </div>

                            <!-- 3. Bảng dữ liệu chi tiết -->
                            <div class="dx-popup-grid-wrapper" id="${self.uniqueId}_detail_grid"></div>
                        </div>
                    `;
                    contentElement.append(html);

                    // Khởi tạo Grid chi tiết bên trong popup
                    self.initDetailDataGrid();
                    self.bindPopupToolbarEvents();
                }
            }).dxPopup('instance');
        }

        // Khởi tạo Detail DataGrid bên trong Popup
        initDetailDataGrid() {
            const gridEl = document.getElementById(`${this.uniqueId}_detail_grid`);
            if (!gridEl) return;

            const baseDetailGridOptions = {
                dataSource: [],
                columns: this.options.detailConfig.columns || [],
                showBorders: false,
                rowAlternationEnabled: true,
                hoverStateEnabled: true,
                columnAutoWidth: true,
                paging: {
                    pageSize: 15
                },
                pager: {
                    visible: true,
                    showPageSizeSelector: true,
                    allowedPageSizes: [10, 15, 20, 50],
                    showInfo: true,
                    infoText: 'Trang {0} / {1} (Tổng: {2} dòng)'
                },
                scrolling: {
                    mode: 'standard'
                },
                loadPanel: {
                    enabled: true,
                    text: 'Đang tải chi tiết...'
                }
            };

            const merged = Object.assign(baseDetailGridOptions, this.options.detailConfig.gridOptions);
            this.detailGridInstance = $(gridEl).dxDataGrid(merged).dxDataGrid('instance');
        }

        // Bắt sự kiện thanh công cụ của Popup (Tìm kiếm nhanh + Gom nhóm)
        bindPopupToolbarEvents() {
            const self = this;
            const searchInput = document.getElementById(`${this.uniqueId}_detail_search`);
            if (searchInput) {
                searchInput.addEventListener('input', function () {
                    const text = this.value.trim();
                    if (self.detailGridInstance) {
                        self.detailGridInstance.searchByText(text);
                    }
                });
            }

            const groupSelect = document.getElementById(`${this.uniqueId}_detail_group`);
            if (groupSelect && this.options.detailConfig.groupOptions) {
                let optionsHtml = '';
                this.options.detailConfig.groupOptions.forEach(opt => {
                    optionsHtml += `<option value="${opt.value}">${opt.label}</option>`;
                });
                groupSelect.innerHTML = optionsHtml;

                groupSelect.addEventListener('change', function () {
                    const colName = this.value;
                    if (!self.detailGridInstance) return;

                    // Xóa cấu hình nhóm cũ
                    const colCount = self.detailGridInstance.columnCount();
                    for (let i = 0; i < colCount; i++) {
                        self.detailGridInstance.columnOption(i, 'groupIndex', undefined);
                    }

                    // Nếu có cột cần gom nhóm
                    if (colName) {
                        self.detailGridInstance.columnOption(colName, 'groupIndex', 0);
                    }
                });
            }
        }

        // Mở popup chi tiết khi click vào một dòng Master
        openDetail(rowData) {
            this.currentMasterRow = rowData;

            // 1. Cập nhật tiêu đề popup
            const title = typeof this.options.detailConfig.getTitle === 'function'
                ? this.options.detailConfig.getTitle(rowData)
                : 'Thông tin chi tiết';
            this.detailPopupInstance.option('title', title);

            // 2. Mở popup
            this.detailPopupInstance.show();

            // 3. Render các thẻ KPI tóm tắt
            this.renderKpiCards(rowData);

            // 4. Xóa ô tìm kiếm và nhóm
            const searchInput = document.getElementById(`${this.uniqueId}_detail_search`);
            if (searchInput) searchInput.value = '';

            const groupSelect = document.getElementById(`${this.uniqueId}_detail_group`);
            if (groupSelect) groupSelect.value = '';

            // 5. Nạp dữ liệu vào bảng chi tiết (Hỗ trợ cả static data, hàm Promise hoặc URL API)
            this.loadDetailData(rowData);
        }

        // Render các thẻ KPI trong Popup
        renderKpiCards(rowData) {
            const kpiContainer = document.getElementById(`${this.uniqueId}_kpi_container`);
            if (!kpiContainer) return;

            let cards = [];
            if (typeof this.options.detailConfig.getKpiCards === 'function') {
                cards = this.options.detailConfig.getKpiCards(rowData) || [];
            }

            if (cards.length === 0) {
                kpiContainer.style.display = 'none';
                return;
            }

            kpiContainer.style.display = 'flex';
            let html = '';
            cards.forEach(card => {
                html += `
                    <div class="dx-popup-kpi-card">
                        <span class="dx-popup-kpi-label">${card.label}</span>
                        <span class="dx-popup-kpi-val">${card.value}</span>
                    </div>
                `;
            });
            kpiContainer.innerHTML = html;
        }

        // Nạp dữ liệu chi tiết
        loadDetailData(rowData) {
            const self = this;
            if (!this.detailGridInstance) return;

            this.detailGridInstance.beginCustomLoading('Đang tải dữ liệu chi tiết...');

            const loader = this.options.detailConfig.loadDetail;

            // Trường hợp 1: Là URL API (Tích hợp Database qua Web API / MVC Controller)
            if (typeof loader === 'string') {
                $.ajax({
                    url: loader,
                    type: 'GET',
                    data: rowData,
                    dataType: 'json',
                    success: function (res) {
                        const items = Array.isArray(res) ? res : (res.data || []);
                        self.setDetailDataSource(items);
                    },
                    error: function (xhr, status, err) {
                        console.error('[DxDetailGridComponent] Lỗi tải dữ liệu chi tiết:', err);
                        self.setDetailDataSource([]);
                    },
                    complete: function () {
                        self.detailGridInstance.endCustomLoading();
                    }
                });
                return;
            }

            // Trường hợp 2: Là hàm tùy chỉnh (có thể trả về Array hoặc Promise)
            if (typeof loader === 'function') {
                const res = loader(rowData);
                if (res && typeof res.then === 'function') {
                    // Trả về Promise (Fetch API / Ajax)
                    res.then(data => {
                        self.setDetailDataSource(data || []);
                    }).catch(err => {
                        console.error('[DxDetailGridComponent] Lỗi Promise nạp chi tiết:', err);
                        self.setDetailDataSource([]);
                    }).finally(() => {
                        self.detailGridInstance.endCustomLoading();
                    });
                } else {
                    // Trả về Array trực tiếp (Mockup data)
                    self.setDetailDataSource(res || []);
                    self.detailGridInstance.endCustomLoading();
                }
                return;
            }

            // Trường hợp 3: Mặc định rỗng
            self.setDetailDataSource([]);
            self.detailGridInstance.endCustomLoading();
        }

        // Đổ dữ liệu vào Detail Grid kèm tự động đánh số thứ tự STT
        setDetailDataSource(items) {
            const formatted = (items || []).map((item, idx) => {
                return Object.assign({ stt: idx + 1 }, item);
            });
            this.currentDetailData = formatted;
            this.detailGridInstance.option('dataSource', formatted);
            this.detailGridInstance.refresh();
        }

        // Bật / tắt toàn màn hình cho thẻ Card
        toggleFullscreen() {
            this.container.classList.toggle('fullscreen');
            const icon = this.container.querySelector(`#${this.uniqueId}_btn_expand i`);
            if (icon) {
                if (this.container.classList.contains('fullscreen')) {
                    icon.className = 'fa-solid fa-down-left-and-up-right-to-center';
                } else {
                    icon.className = 'fa-solid fa-up-right-and-down-left-from-center';
                }
            }
            if (this.masterGridInstance) {
                this.masterGridInstance.updateDimensions();
            }
        }

        // Làm mới Master Grid
        reload() {
            if (this.masterGridInstance) {
                this.masterGridInstance.refresh();
            }
        }

        // Cập nhật nguồn dữ liệu mới cho Master Grid
        setMasterData(newData) {
            if (this.masterGridInstance) {
                this.masterGridInstance.option('dataSource', newData);
                this.masterGridInstance.refresh();
            }
        }
    }

    // Xuất Component ra window toàn cục để dùng ở bất cứ đâu
    window.DxDetailGridComponent = DxDetailGridComponent;

})(window, window.jQuery || window.$);
