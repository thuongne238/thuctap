/**
 * ============================================================================
 * COMPONENT: BẢNG DỮ LIỆU ĐỘNG & BIỂU ĐỒ TRÒN THỐNG KÊ TỰ ĐỘNG (DEVEXTREME)
 * ============================================================================
 * - Hoàn toàn ĐỘNG: Áp dụng cho BẤT KỲ nghiệp vụ nào (NPL, Đơn hàng, Sản phẩm,
 *   Người dùng, Giao dịch, Kho vận...).
 * - Tên cột, số lượng cột, tiêu đề, kiểu dữ liệu đều KHÔNG CỐ ĐỊNH.
 * - Biểu đồ tròn tự động nhận diện trường dữ liệu (ví dụ: Trạng thái, Loại, Phòng ban...)
 *   và tự tính toán tỷ lệ % từ toàn bộ dữ liệu bảng bên trái.
 * 
 * CÁCH DÙNG TRONG HTML:
 * <div class="dx-chitiet-bieudo"
 *      data-title-table="TIÊU ĐỀ BẢNG"
 *      data-title-chart="TIÊU ĐỀ BIỂU ĐỒ"
 *      data-api-url="/api/YourController/GetData"
 *      data-chart-field="trangThai"
 *      data-page-size="5"
 *      data-columns='[
 *          {"dataField": "tenSP", "caption": "Tên Sản Phẩm"},
 *          {"dataField": "soLuong", "caption": "Số Lượng", "alignment": "right"},
 *          {"dataField": "tienDo", "caption": "% Đạt", "type": "progress"},
 *          {"dataField": "trangThai", "caption": "Trạng Thái"}
 *      ]'>
 * </div>
 * 
 * 
 * <div class="dx-chitiet-bieudo"
     data-title-table="DỮ LIỆU TỔNG HỢP"
     data-title-chart="THỐNG KÊ"
     data-api-url="/api/BaoCao/GetDuLieu"
     data-chart-field="trangThai">
</div>

vậy là data có bao nhiêu cột sẽ gọi ra hết
 * 
 * ============================================================================
 */

(function (window, $) {
    'use strict';

    // 1. INJECT CSS DÙNG CHUNG (TỰ ĐỘNG THÍCH ỨNG THEO MỌI CỘT DỮ LIỆU)
    function injectComponentCss() {
        if (document.getElementById('dx-dynamic-ctbd-style')) return;
        const css = `
            .dx-ctbd-wrapper {
                display: grid;
                grid-template-columns: 1fr 380px;
                gap: 16px;
                width: 100%;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                box-sizing: border-box;
                margin-bottom: 20px;
            }
            @media (max-width: 1100px) {
                .dx-ctbd-wrapper {
                    grid-template-columns: 1fr;
                }
            }
            .dx-ctbd-card {
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            .dx-ctbd-card-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 13px 18px;
                border-bottom: 1px solid #edf2f7;
                background: #ffffff;
            }
            .dx-ctbd-card-title-wrap {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .dx-ctbd-card-header i {
                color: #2563eb;
                font-size: 16px;
            }
            .dx-ctbd-card-header h3 {
                margin: 0;
                font-size: 13.5px;
                font-weight: 700;
                color: #1e293b;
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }
            .dx-ctbd-table-wrap {
                width: 100%;
                overflow-x: auto;
                flex: 1;
            }
            .dx-ctbd-table {
                width: 100%;
                border-collapse: collapse;
                text-align: left;
                font-size: 13px;
            }
            .dx-ctbd-table th {
                background: #ffffff;
                color: #475569;
                font-weight: 700;
                padding: 12px 14px;
                border-bottom: 1px solid #e2e8f0;
                white-space: nowrap;
            }
            .dx-ctbd-table td {
                padding: 11px 14px;
                border-bottom: 1px solid #f1f5f9;
                color: #1e293b;
                vertical-align: middle;
            }
            .dx-ctbd-table tbody tr {
                transition: background-color 0.15s ease;
                cursor: pointer;
            }
            .dx-ctbd-table tbody tr:hover {
                background-color: #f8fafc;
            }

            /* Cột chính có icon click xem chi tiết */
            .dx-ctbd-primary-link {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #2563eb;
                font-weight: 600;
            }
            .dx-ctbd-primary-link i {
                font-size: 12.5px;
                color: #60a5fa;
                transition: transform 0.15s ease;
            }
            .dx-ctbd-table tbody tr:hover .dx-ctbd-primary-link i {
                transform: scale(1.18);
                color: #1d4ed8;
            }

            /* Cột tiến độ / % (Progress bar) */
            .dx-ctbd-progress-wrap {
                display: flex;
                align-items: center;
                gap: 10px;
                min-width: 130px;
            }
            .dx-ctbd-progress-bar-bg {
                flex: 1;
                height: 6px;
                background-color: #e2e8f0;
                border-radius: 999px;
                overflow: hidden;
            }
            .dx-ctbd-progress-bar-fill {
                height: 100%;
                border-radius: 999px;
                transition: width 0.3s ease;
            }
            .dx-ctbd-progress-label {
                font-weight: 600;
                font-size: 12px;
                min-width: 36px;
                text-align: right;
            }

            /* Badge trạng thái */
            .dx-ctbd-status-badge {
                font-weight: 700;
                font-size: 12.5px;
                white-space: nowrap;
            }

            /* Footer phân trang */
            .dx-ctbd-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 11px 18px;
                background: #ffffff;
                border-top: 1px solid #edf2f7;
                font-size: 13px;
                color: #64748b;
            }
            .dx-ctbd-pagination {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .dx-ctbd-page-btn {
                border: 1px solid #e2e8f0;
                background: #ffffff;
                color: #334155;
                font-size: 12px;
                padding: 4px 11px;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.15s ease;
                font-weight: 500;
            }
            .dx-ctbd-page-btn:hover:not(:disabled) {
                background: #f1f5f9;
                border-color: #cbd5e1;
            }
            .dx-ctbd-page-btn:disabled {
                opacity: 0.45;
                cursor: not-allowed;
            }
            .dx-ctbd-page-btn.active {
                background: #1d4ed8;
                border-color: #1d4ed8;
                color: #ffffff;
                font-weight: 700;
            }

            /* Vùng biểu đồ tròn */
            .dx-ctbd-chart-body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 16px 14px 20px 14px;
                flex: 1;
            }
            .dx-ctbd-pie-container {
                width: 100%;
                height: 230px;
            }
            .dx-ctbd-legend-wrap {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 12px 16px;
                margin-top: 10px;
                padding: 0 5px;
            }
            .dx-ctbd-legend-item {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                color: #334155;
                font-weight: 500;
                cursor: pointer;
            }
            .dx-ctbd-legend-color {
                width: 10px;
                height: 10px;
                border-radius: 2px;
                flex-shrink: 0;
            }
        `;
        const style = document.createElement('style');
        style.id = 'dx-dynamic-ctbd-style';
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }

    // Bảng màu mặc định tinh tế cho biểu đồ tròn
    const DEFAULT_CHART_PALETTE = [
        '#10b981', '#2563eb', '#f59e0b', '#ef4444', 
        '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'
    ];

    // 2. LỚP COMPONENT ĐỘNG HOÀN TOÀN
    class ChiTietVaBieuDoComponent {
        constructor(options = {}) {
            this.container = typeof options.container === 'string'
                ? document.querySelector(options.container)
                : options.container;

            if (!this.container) {
                console.error('[ChiTietVaBieuDo] Không tìm thấy container:', options.container);
                return;
            }

            this.options = Object.assign({
                titleTable: 'BẢNG DỮ LIỆU CHI TIẾT',
                titleChart: 'BIỂU ĐỒ TỔNG QUAN',
                iconTable: 'fa-solid fa-table-list',
                iconChart: 'fa-solid fa-chart-pie',
                pageSize: 5,
                apiUrl: null,
                detailApiUrl: null,
                chartField: null,     // Tên trường để vẽ biểu đồ tròn (VD: 'trangThai', 'loai', 'status')
                chartValField: null,  // Nếu null thì tự động COUNT số lượng dòng
                columns: null,        // Danh sách cột (nếu null sẽ tự động nhận diện từ API data)
                onRowClick: null
            }, options);

            this.currentPage = 1;
            this.allData = [];
            this.filteredData = [];
            this.columns = this.options.columns;
            this.uniqueId = 'ctbd_' + Math.random().toString(36).substring(2, 9);
            this.pieChartInstance = null;

            injectComponentCss();
            this.renderLayout();
            this.loadData();
        }

        renderLayout() {
            this.container.innerHTML = `
                <div class="dx-ctbd-wrapper" id="${this.uniqueId}">
                    <!-- Card Trái: Bảng Động -->
                    <div class="dx-ctbd-card">
                        <div class="dx-ctbd-card-header">
                            <div class="dx-ctbd-card-title-wrap">
                                <i class="${this.options.iconTable}"></i>
                                <h3>${this.options.titleTable}</h3>
                            </div>
                        </div>
                        <div class="dx-ctbd-table-wrap">
                            <table class="dx-ctbd-table">
                                <thead id="${this.uniqueId}_thead"></thead>
                                <tbody id="${this.uniqueId}_tbody">
                                    <tr><td style="text-align: center; padding: 25px; color: #94a3b8;">Đang nạp dữ liệu...</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="dx-ctbd-footer">
                            <div class="dx-ctbd-info" id="${this.uniqueId}_info">Hiển thị 0 dòng</div>
                            <div class="dx-ctbd-pagination" id="${this.uniqueId}_pagination"></div>
                        </div>
                    </div>

                    <!-- Card Phải: Biểu Đồ Tròn Động -->
                    <div class="dx-ctbd-card">
                        <div class="dx-ctbd-card-header">
                            <div class="dx-ctbd-card-title-wrap">
                                <i class="${this.options.iconChart}"></i>
                                <h3>${this.options.titleChart}</h3>
                            </div>
                        </div>
                        <div class="dx-ctbd-chart-body">
                            <div class="dx-ctbd-pie-container" id="${this.uniqueId}_chart"></div>
                            <div class="dx-ctbd-legend-wrap" id="${this.uniqueId}_legend"></div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Tải dữ liệu: Từ API hoặc dữ liệu có sẵn
        loadData() {
            if (this.options.apiUrl) {
                $.ajax({
                    url: this.options.apiUrl,
                    type: 'GET',
                    dataType: 'json',
                    success: (res) => {
                        const items = Array.isArray(res) ? res : (res.items || res.data || []);
                        this.setData(items);
                    },
                    error: (err) => {
                        console.error('[ChiTietVaBieuDo] Lỗi nạp API:', err);
                        this.useFallbackDemoData();
                    }
                });
            } else if (this.options.dataSource && Array.isArray(this.options.dataSource)) {
                this.setData(this.options.dataSource);
            } else {
                this.useFallbackDemoData();
            }
        }

        // Dữ liệu mẫu dự phòng khi chưa cấu hình API
        useFallbackDemoData() {
            const sampleData = [
                { id: 1, name: 'Vải chính (Cotton 100%)', demand: '45,000 m', available: '45,000 m', rate: 100, status: 'Đủ 100%' },
                { id: 2, name: 'Vải lót (Polyester Taffeta)', demand: '18,500 m', available: '16,650 m', rate: 90, status: 'Đã có 90%' },
                { id: 3, name: 'Chỉ may (Coats 40/2)', demand: '3,200 cuộn', available: '2,560 cuộn', rate: 80, status: 'Đã có 80%' },
                { id: 4, name: 'Khóa kéo (YKK Zipper #5)', demand: '15,000 cái', available: '9,750 cái', rate: 65, status: 'Thiếu 35%' },
                { id: 5, name: 'Cúc bấm / Nút áo (Kim loại)', demand: '60,000 cái', available: '60,000 cái', rate: 100, status: 'Đủ 100%' },
                { id: 6, name: 'Chun lưng quần (Elastic band 3cm)', demand: '8,000 m', available: '7,600 m', rate: 95, status: 'Đã có 95%' },
                { id: 7, name: 'Nhãn dệt cổ áo (Woven Label)', demand: '25,000 cái', available: '25,000 cái', rate: 100, status: 'Đủ 100%' },
                { id: 8, name: 'Túi PE lót đóng gói', demand: '30,000 cái', available: '21,000 cái', rate: 70, status: 'Thiếu 30%' },
                { id: 9, name: 'Keo ép mex (Interlining)', demand: '4,500 m', available: '1,800 m', rate: 40, status: 'Trễ hạn' },
                { id: 10, name: 'Thùng carton sóng (5 lớp)', demand: '2,000 thùng', available: '2,000 thùng', rate: 100, status: 'Đủ 100%' },
                { id: 11, name: 'Tem mã vạch barcode (Decal)', demand: '50,000 tem', available: '42,500 tem', rate: 85, status: 'Đã có 85%' }
            ];
            this.setData(sampleData);
        }

        // Cập nhật mảng dữ liệu mới và tự động nhận diện cột
        setData(items) {
            this.allData = Array.isArray(items) ? items : [];
            this.filteredData = [...this.allData];
            this.currentPage = 1;

            // 1. Tự động nhận diện cột nếu chưa khai báo
            this.autoDetectColumns();

            // 2. Render Tiêu đề cột
            this.renderHeader();

            // 3. Render Dữ liệu trang
            this.renderRows();
            this.renderPagination();

            // 4. Tự động gom nhóm và vẽ Biểu đồ tròn
            this.updatePieChart();
        }

        // TỰ ĐỘNG PHÁT HIỆN CỘT (Nếu người dùng không khai báo data-columns)
        autoDetectColumns() {
            if (this.columns && this.columns.length > 0) return;
            if (!this.allData || this.allData.length === 0) return;

            const firstRow = this.allData[0];
            const detected = [];

            Object.keys(firstRow).forEach((key, index) => {
                if (key.toLowerCase() === 'id') return; // Ẩn cột id

                let type = 'text';
                const lowerKey = key.toLowerCase();

                if (lowerKey.includes('rate') || lowerKey.includes('percent') || lowerKey.includes('tiendo') || lowerKey.includes('phantram')) {
                    type = 'progress';
                } else if (lowerKey.includes('status') || lowerKey.includes('trangthai')) {
                    type = 'status';
                } else if (lowerKey.includes('price') || lowerKey.includes('gia') || lowerKey.includes('tien') || lowerKey.includes('demand') || lowerKey.includes('available') || lowerKey.includes('nhucau') || lowerKey.includes('daco') || lowerKey.includes('soluong')) {
                    type = 'number';
                }

                // Tự tạo caption từ key
                let caption = key.charAt(0).toUpperCase() + key.slice(1);
                if (key === 'name') caption = 'Tên';
                else if (key === 'demand') caption = 'Nhu Cầu';
                else if (key === 'available') caption = 'Đã Có';
                else if (key === 'rate') caption = '% Đủ';
                else if (key === 'status') caption = 'Trạng Thái';

                detected.push({
                    dataField: key,
                    caption: caption,
                    type: type,
                    isPrimaryLink: (index === 0 || key === 'name' || lowerKey.includes('ten') || lowerKey.includes('ma'))
                });
            });

            this.columns = detected;
        }

        renderHeader() {
            const thead = document.getElementById(`${this.uniqueId}_thead`);
            if (!thead || !this.columns) return;

            let html = '<tr>';
            this.columns.forEach((col, idx) => {
                let align = col.alignment || (col.type === 'number' || col.type === 'status' ? 'right' : 'left');
                html += `<th style="text-align: ${align};">${col.caption || col.dataField}</th>`;
            });
            html += '</tr>';
            thead.innerHTML = html;
        }

        renderRows() {
            const tbody = document.getElementById(`${this.uniqueId}_tbody`);
            if (!tbody) return;

            if (!this.filteredData || this.filteredData.length === 0) {
                tbody.innerHTML = `<tr><td colspan="${this.columns ? this.columns.length : 5}" style="text-align: center; padding: 25px; color: #94a3b8;">Không có dữ liệu</td></tr>`;
                return;
            }

            const startIndex = (this.currentPage - 1) * this.options.pageSize;
            const endIndex = startIndex + this.options.pageSize;
            const pageItems = this.filteredData.slice(startIndex, endIndex);

            let html = '';
            pageItems.forEach((row, idx) => {
                const globalIdx = startIndex + idx;
                html += `<tr data-index="${globalIdx}">`;

                this.columns.forEach((col, colIdx) => {
                    const val = row[col.dataField] !== undefined && row[col.dataField] !== null ? row[col.dataField] : '';
                    let align = col.alignment || (col.type === 'number' || col.type === 'status' ? 'right' : 'left');

                    // 1. Cột có icon mở chi tiết
                    if (col.isPrimaryLink || colIdx === 0) {
                        html += `
                            <td style="text-align: ${align};">
                                <div class="dx-ctbd-primary-link">
                                    <i class="fa-regular fa-square-arrow-up-right"></i>
                                    <span>${val}</span>
                                </div>
                            </td>
                        `;
                    }
                    // 2. Cột Progress Bar (% hoàn thành, % đủ)
                    else if (col.type === 'progress') {
                        const num = parseFloat(val) || 0;
                        let barColor = '#10b981';
                        if (num < 60) barColor = '#ef4444';
                        else if (num < 80) barColor = '#f59e0b';
                        else if (num < 100) barColor = '#3b82f6';

                        html += `
                            <td style="text-align: ${align};">
                                <div class="dx-ctbd-progress-wrap">
                                    <div class="dx-ctbd-progress-bar-bg">
                                        <div class="dx-ctbd-progress-bar-fill" style="width: ${Math.min(num, 100)}%; background-color: ${barColor};"></div>
                                    </div>
                                    <span class="dx-ctbd-progress-label">${num}%</span>
                                </div>
                            </td>
                        `;
                    }
                    // 3. Cột Trạng Thái
                    else if (col.type === 'status') {
                        let color = '#2563eb';
                        const strVal = String(val).toLowerCase();
                        if (strVal.includes('đủ') || strVal.includes('hoàn thành') || strVal.includes('thành công') || strVal.includes('active') || strVal.includes('100%')) {
                            color = '#10b981';
                        } else if (strVal.includes('thiếu') || strVal.includes('chờ') || strVal.includes('warning')) {
                            color = '#ea580c';
                        } else if (strVal.includes('trễ') || strVal.includes('hủy') || strVal.includes('khóa') || strVal.includes('danger')) {
                            color = '#ef4444';
                        }

                        html += `
                            <td style="text-align: ${align};">
                                <span class="dx-ctbd-status-badge" style="color: ${color};">${val}</span>
                            </td>
                        `;
                    }
                    // 4. Cột số hoặc text thông thường
                    else {
                        const displayVal = (typeof val === 'number') ? val.toLocaleString('vi-VN') : val;
                        html += `<td style="text-align: ${align}; font-weight: ${col.type === 'number' ? '600' : 'normal'};">${displayVal}</td>`;
                    }
                });

                html += '</tr>';
            });

            tbody.innerHTML = html;

            // Bắt sự kiện click dòng
            const self = this;
            tbody.querySelectorAll('tr').forEach(tr => {
                tr.addEventListener('click', function () {
                    const idx = parseInt(this.getAttribute('data-index'), 10);
                    const item = self.filteredData[idx];
                    if (item) self.handleItemClick(item);
                });
            });

            // Cập nhật text footer
            const infoEl = document.getElementById(`${this.uniqueId}_info`);
            if (infoEl) {
                const total = this.filteredData.length;
                const startDisplay = total === 0 ? 0 : startIndex + 1;
                const endDisplay = Math.min(endIndex, total);
                infoEl.innerHTML = `Hiển thị <b>${startDisplay} - ${endDisplay}</b> / <b>${total}</b> dòng (Tối đa ${this.options.pageSize} dòng/trang)`;
            }
        }

        renderPagination() {
            const paginationEl = document.getElementById(`${this.uniqueId}_pagination`);
            if (!paginationEl) return;

            const totalPages = Math.ceil(this.filteredData.length / this.options.pageSize) || 1;
            let html = '';

            html += `<button class="dx-ctbd-page-btn" id="${this.uniqueId}_btn_prev" ${this.currentPage === 1 ? 'disabled' : ''}>&lt; Trước</button>`;
            for (let i = 1; i <= totalPages; i++) {
                html += `<button class="dx-ctbd-page-btn ${this.currentPage === i ? 'active' : ''}" data-page="${i}">${i}</button>`;
            }
            html += `<button class="dx-ctbd-page-btn" id="${this.uniqueId}_btn_next" ${this.currentPage === totalPages ? 'disabled' : ''}>Sau &gt;</button>`;

            paginationEl.innerHTML = html;

            const self = this;
            const prevBtn = document.getElementById(`${this.uniqueId}_btn_prev`);
            if (prevBtn) {
                prevBtn.onclick = () => {
                    if (self.currentPage > 1) {
                        self.currentPage--;
                        self.renderRows();
                        self.renderPagination();
                    }
                };
            }

            const nextBtn = document.getElementById(`${this.uniqueId}_btn_next`);
            if (nextBtn) {
                nextBtn.onclick = () => {
                    if (self.currentPage < totalPages) {
                        self.currentPage++;
                        self.renderRows();
                        self.renderPagination();
                    }
                };
            }

            paginationEl.querySelectorAll('[data-page]').forEach(btn => {
                btn.onclick = function () {
                    self.currentPage = parseInt(this.getAttribute('data-page'), 10);
                    self.renderRows();
                    self.renderPagination();
                };
            });
        }

        // TỰ ĐỘNG GOM NHÓM DỮ LIỆU ĐỂ VẼ BIỂU ĐỒ DEVEXTREME CHO BẤT KỲ TRƯỜNG DỮ LIỆU NÀO
        updatePieChart() {
            const chartEl = document.getElementById(`${this.uniqueId}_chart`);
            const legendEl = document.getElementById(`${this.uniqueId}_legend`);
            if (!chartEl) return;

            // 1. Tìm trường thích hợp để vẽ biểu đồ tròn
            let field = this.options.chartField;
            if (!field && this.columns) {
                // Tự động tìm trường status, trangThai, category, loai,...
                const candidate = this.columns.find(c => {
                    const k = c.dataField.toLowerCase();
                    return k.includes('status') || k.includes('trangthai') || k.includes('loai') || k.includes('category') || k.includes('group');
                });
                if (candidate) field = candidate.dataField;
                else field = this.columns[this.columns.length - 1].dataField; // Lấy cột cuối cùng
            }

            // 2. Thống kê gom nhóm
            const stats = {};
            this.allData.forEach(row => {
                const rawVal = row[field];
                const key = (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '') 
                    ? String(rawVal) 
                    : 'Khác';
                
                stats[key] = (stats[key] || 0) + 1;
            });

            // 3. Chuẩn bị dữ liệu và màu sắc
            const chartData = [];
            let colorIdx = 0;
            let legendHtml = '';

            Object.keys(stats).forEach(cat => {
                const count = stats[cat];
                let color = DEFAULT_CHART_PALETTE[colorIdx % DEFAULT_CHART_PALETTE.length];
                
                // Gán màu thông minh theo ngữ nghĩa từ khóa
                const lower = cat.toLowerCase();
                if (lower.includes('đủ') || lower.includes('thành công') || lower.includes('hoàn thành') || lower.includes('100%')) color = '#10b981';
                else if (lower.includes('80%') || lower.includes('90%') || lower.includes('đang')) color = '#2563eb';
                else if (lower.includes('thiếu') || lower.includes('chờ') || lower.includes('cảnh báo')) color = '#f59e0b';
                else if (lower.includes('trễ') || lower.includes('hủy') || lower.includes('khóa')) color = '#ef4444';

                chartData.push({ category: cat, val: count, color: color });

                legendHtml += `
                    <div class="dx-ctbd-legend-item" title="${cat}: ${count} (${Math.round((count / this.allData.length) * 100)}%)">
                        <span class="dx-ctbd-legend-color" style="background-color: ${color};"></span>
                        <span>${cat}</span>
                    </div>
                `;
                colorIdx++;
            });

            if (legendEl) legendEl.innerHTML = legendHtml;

            // 4. Vẽ DevExtreme dxPieChart
            if (typeof $ !== 'undefined' && $.fn.dxPieChart) {
                if (this.pieChartInstance) {
                    this.pieChartInstance.option('dataSource', chartData);
                } else {
                    this.pieChartInstance = $(chartEl).dxPieChart({
                        dataSource: chartData,
                        type: 'doughnut',
                        innerRadius: 0.58,
                        series: [{
                            argumentField: 'category',
                            valueField: 'val',
                            colorField: 'color',
                            label: { visible: false }
                        }],
                        legend: { visible: false },
                        tooltip: {
                            enabled: true,
                            customizeTooltip: function (arg) {
                                return {
                                    text: `<b>${arg.argumentText}</b><br/>Số lượng: ${arg.valueText} (${arg.percentText})`
                                };
                            }
                        },
                        animation: { enabled: true, duration: 500 }
                    }).dxPieChart('instance');
                }
            }
        }

        // Xử lý click dòng
        handleItemClick(item) {
            if (typeof this.options.onRowClick === 'function') {
                this.options.onRowClick(item);
                return;
            }
            if (typeof window.showMaterialDetailPopup === 'function') {
                window.showMaterialDetailPopup(item);
            } else if (window.DxGrid && typeof window.DxGrid.openDetail === 'function') {
                window.DxGrid.openDetail(item);
            }
        }

        reload(apiUrl) {
            if (apiUrl) this.options.apiUrl = apiUrl;
            this.loadData();
        }
    }

    // 3. TỰ ĐỘNG KHỞI TẠO CHO BẤT KỲ THẺ DIV NÀO
    function autoInitAll() {
        document.querySelectorAll('.dx-chitiet-bieudo, [data-component="chitiet-bieudo"]').forEach(el => {
            if (el.hasChildNodes()) return;

            const titleTable = el.getAttribute('data-title-table') || 'BẢNG DỮ LIỆU CHI TIẾT';
            const titleChart = el.getAttribute('data-title-chart') || 'BIỂU ĐỒ THỐNG KÊ';
            const apiUrl = el.getAttribute('data-api-url');
            const detailApiUrl = el.getAttribute('data-detail-api');
            const chartField = el.getAttribute('data-chart-field');
            const pageSize = parseInt(el.getAttribute('data-page-size') || '5', 10);

            let columns = null;
            const rawCols = el.getAttribute('data-columns');
            if (rawCols) {
                try { columns = JSON.parse(rawCols); } catch (e) { console.error('Lỗi parse data-columns:', e); }
            }

            new ChiTietVaBieuDoComponent({
                container: el,
                titleTable: titleTable,
                titleChart: titleChart,
                apiUrl: apiUrl,
                detailApiUrl: detailApiUrl,
                chartField: chartField,
                pageSize: pageSize,
                columns: columns
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInitAll);
    } else {
        autoInitAll();
    }

    window.ChiTietVaBieuDoComponent = ChiTietVaBieuDoComponent;
    window.ChiTietVaBieuDo = {
        create: function (options) {
            return new ChiTietVaBieuDoComponent(options);
        },
        init: autoInitAll
    };

})(window, window.jQuery || window.$);
