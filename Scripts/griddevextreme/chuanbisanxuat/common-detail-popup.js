/**
 * ==========================================================================
 * NTBSOFT ERP - COMPONENT DÙNG CHUNG: POPUP CHI TIẾT ĐA NĂNG (DEVEXTREME)
 * File: common-detail-popup.js
 * Thư mục: Scripts/griddevextreme/
 * 
 * Nạp dữ liệu TRỰC TIẾP TỪ CƠ SỞ DỮ LIỆU qua các Web API:
 * 1. Đơn hàng: /DashboardTongQuanTienDo/GetPODetails
 * 2. Nguyên phụ liệu: /DashboardTongQuanTienDo/GetMaterialStatusDetails
 * 3. Theo dõi mua hàng PO: /DashboardTongQuanTienDo/GetPurchaseTrackingDetails
 * ==========================================================================
 */
(function (window, $) {
    'use strict';

    let popupInstance = null;
    let gridInstance = null;

    const CommonDetailPopup = {
        /**
         * Khởi tạo Popup singleton dùng chung nếu chưa có
         */
        ensurePopup: function () {
            if (popupInstance && gridInstance) return popupInstance;

            let $popupEl = $('#dx-universal-detail-popup');
            if ($popupEl.length === 0) {
                $popupEl = $('<div id="dx-universal-detail-popup"></div>').appendTo('body');
            }

            if ($popupEl.children().length === 0) {
                $popupEl.html(`
                    <div class="dx-popup-detail-content">
                        <!-- 1. Thẻ KPI tóm tắt thông tin trên đầu -->
                        <div class="dx-popup-kpi-grid" id="dx_comm_kpi_wrap" style="display: none;"></div>

                        <!-- 2. Thanh công cụ tìm kiếm nhanh & Gom nhóm -->
                        <div class="dx-popup-toolbar" id="dx_comm_toolbar">
                            <div class="dx-popup-search-wrap">
                                <i class="fa-solid fa-magnifying-glass"></i>
                                <input type="text" class="dx-popup-search-input" id="dx_comm_search_input" placeholder="Tìm kiếm nhanh..." />
                            </div>
                            <div class="dx-popup-group-wrap" id="dx_comm_group_wrap" style="display: none;">
                                <span>Gom nhóm:</span>
                                <select class="dx-popup-group-select" id="dx_comm_group_select">
                                    <option value="">Chi tiết (Không gom)</option>
                                </select>
                            </div>
                        </div>

                        <!-- 3. Khu vực DataGrid hiển thị chi tiết -->
                        <div class="dx-popup-grid-wrapper" id="dx_comm_grid_wrapper" style="min-height: 380px; height: 100%;">
                            <div id="dx_comm_grid_container" style="width: 100%; height: 100%;"></div>
                        </div>

                        <!-- 4. Giao diện Empty State khi không có dữ liệu -->
                        <div class="dx-detail-empty-state" id="dx_comm_empty_state" style="display: none;">
                            <i class="fa-solid fa-folder-open dx-detail-empty-icon"></i>
                            <div class="dx-detail-empty-title">Không có dữ liệu chi tiết liên quan</div>
                            <div class="dx-detail-empty-sub">Mục được chọn hiện chưa có thông tin chi tiết hoặc chưa được cập nhật từ hệ thống.</div>
                        </div>
                    </div>
                `);

                // Khởi tạo DataGrid ngay lập tức
                const $gridContainer = $('#dx_comm_grid_container');
                gridInstance = $gridContainer.dxDataGrid({
                    dataSource: [],
                    columns: [],
                    showBorders: true,
                    showColumnLines: true,
                    showRowLines: true,
                    rowAlternationEnabled: true,
                    hoverStateEnabled: true,
                    columnAutoWidth: true,
                    wordWrapEnabled: false,
                    scrolling: { mode: 'standard' },
                    paging: { pageSize: 10 },
                    pager: {
                        visible: true,
                        showPageSizeSelector: true,
                        allowedPageSizes: [10, 20, 50, 'all'],
                        showNavigationButtons: true,
                        showInfo: true,
                        displayMode: 'full'
                    },
                    noDataText: 'Không tìm thấy dữ liệu phù hợp'
                }).dxDataGrid('instance');

                // Gắn sự kiện ô tìm kiếm trực tiếp
                $('#dx_comm_search_input').off('input').on('input', function () {
                    if (gridInstance) {
                        gridInstance.searchByText($(this).val().trim());
                    }
                });

                // Gắn sự kiện chọn gom nhóm
                $('#dx_comm_group_select').off('change').on('change', function () {
                    if (!gridInstance) return;
                    const count = gridInstance.columnCount();
                    for (let i = 0; i < count; i++) {
                        gridInstance.columnOption(i, 'groupIndex', undefined);
                    }
                    if (this.value) {
                        gridInstance.columnOption(this.value, 'groupIndex', 0);
                    }
                });
            }

            if (!popupInstance) {
                popupInstance = $popupEl.dxPopup({
                    title: 'Chi tiết thông tin',
                    width: function () { return Math.min($(window).width() * 0.94, 1280); },
                    height: function () { return Math.min($(window).height() * 0.88, 760); },
                    showTitle: true,
                    dragEnabled: false,
                    closeOnOutsideClick: true,
                    showCloseButton: true,
                    shading: true,
                    shadingColor: 'rgba(15, 23, 42, 0.45)',
                    onResize: function () {
                        if (gridInstance) gridInstance.repaint();
                    },
                    onShown: function () {
                        if (gridInstance) {
                            gridInstance.updateDimensions();
                            gridInstance.repaint();
                        }
                    }
                }).dxPopup('instance');
            }

            return popupInstance;
        },

        /**
         * HÀM CHÍNH: Mở Popup chi tiết tổng quát cho bất kỳ bảng nào
         * @param {Object} config Cấu hình hiển thị chi tiết
         */
        show: function (config) {
            if (!config) return;

            this.ensurePopup();

            // 1. Cập nhật tiêu đề Popup & hiển thị
            const title = config.title || 'Chi tiết thông tin mục được chọn';
            if (popupInstance) {
                popupInstance.option('title', title);
                popupInstance.show();
            }

            // 2. Render các thẻ KPI tóm tắt
            const $kpiWrap = $('#dx_comm_kpi_wrap');
            if (config.kpiCards && Array.isArray(config.kpiCards) && config.kpiCards.length > 0) {
                let kpiHtml = '';
                config.kpiCards.forEach(card => {
                    const colorStyle = card.color ? `style="color: ${card.color};"` : '';
                    kpiHtml += `
                        <div class="dx-popup-kpi-card">
                            <span class="dx-popup-kpi-label">${card.label || ''}</span>
                            <span class="dx-popup-kpi-val" ${colorStyle}>${card.value || '0'}</span>
                        </div>
                    `;
                });
                $kpiWrap.html(kpiHtml).show();
            } else {
                $kpiWrap.empty().hide();
            }

            // 3. Reset & cập nhật Toolbar tìm kiếm & Gom nhóm
            $('#dx_comm_search_input').val('').attr('placeholder', config.searchPlaceholder || 'Tìm kiếm nhanh thông tin chi tiết...');

            const $groupWrap = $('#dx_comm_group_wrap');
            const $groupSelect = $('#dx_comm_group_select');
            if (config.groupOptions && Array.isArray(config.groupOptions) && config.groupOptions.length > 0) {
                let optionsHtml = '<option value="">Chi tiết (Không gom)</option>';
                config.groupOptions.forEach(opt => {
                    optionsHtml += `<option value="${opt.value}">${opt.label}</option>`;
                });
                $groupSelect.html(optionsHtml).val('');
                $groupWrap.show();
            } else {
                $groupWrap.hide();
            }

            // 4. Luôn hiển thị Grid & Toolbar
            const $gridWrapper = $('#dx_comm_grid_wrapper');
            const $emptyState = $('#dx_comm_empty_state');
            const $toolbar = $('#dx_comm_toolbar');

            let rawData = config.dataSource;
            if (typeof rawData === 'function') {
                rawData = rawData();
            }

            $emptyState.hide();
            $toolbar.show();
            $gridWrapper.show();

            const bindGridData = function () {
                if (!gridInstance) {
                    const $c = $('#dx_comm_grid_container');
                    if ($c.length && $c.dxDataGrid) {
                        gridInstance = $c.dxDataGrid('instance');
                    }
                }
                if (gridInstance) {
                    if (config.columns && Array.isArray(config.columns)) {
                        gridInstance.option('columns', config.columns);
                    }
                    gridInstance.option('dataSource', rawData || []);
                    gridInstance.refresh();
                    gridInstance.updateDimensions();
                    gridInstance.repaint();
                }
            };

            bindGridData();
            setTimeout(bindGridData, 60);
        },

        /**
         * HELPER DỰNG SẴN 1: Mở Popup chi tiết cho Bảng Nguyên Phụ Liệu (Gọi API DB: GetMaterialStatusDetails)
         */
        showMaterial: function (item) {
            if (!item) return;

            const catCode = item.code || '';
            const name = item.name || item.type || catCode || 'Nguyên phụ liệu';
            const demand = item.demand || '0';
            const available = item.available || '0';
            const rate = item.rate != null ? item.rate : 100;
            const rateStr = typeof rate === 'number' ? rate + '%' : rate;

            const startDate = $('#start-date').val() || '';
            const endDate = $('#end-date').val() || '';

            const self = this;
            $.ajax({
                url: '/DashboardTongQuanTienDo/GetMaterialStatusDetails',
                type: 'GET',
                data: { category: catCode, startDate: startDate, endDate: endDate },
                dataType: 'json'
            }).done(function (res) {
                const list = (res && res.success && Array.isArray(res.data)) ? res.data : [];
                const details = list.map((r, i) => ({
                    stt: i + 1,
                    maLenh: r.MaLenh || '--',
                    maHang: r.MaHang || '--',
                    itemCode: r.ItemCode || '--',
                    maMauVT: r.MaMauVT || '--',
                    mau: r.Mau || '--',
                    widthSize: r.WidthSize || '--',
                    donViVT: r.DonViVT || '--',
                    khachHang: r.KhachHang || '--',
                    soLuong: (r.SoLuong || 0).toLocaleString('vi-VN')
                }));

                self.show({
                    title: `Chi tiết nhu cầu vật tư: ${name} (${catCode || ''})`,
                    kpiCards: [
                        { label: 'LOẠI VẬT TƯ', value: name },
                        { label: 'TỔNG NHU CẦU', value: demand },
                        { label: 'HIỆN CÓ / TIẾN ĐỘ', value: `${available} (${rateStr})`, color: (rate >= 90 ? '#059669' : (rate >= 70 ? '#D97706' : '#DC2626')) },
                        { label: 'SỐ DÒNG CHI TIẾT', value: `${details.length} lệnh SX`, color: '#2563EB' }
                    ],
                    searchPlaceholder: 'Tìm kiếm nhanh Mã lệnh, Mã hàng, ItemCode, Màu, Khách hàng...',
                    groupOptions: [
                        { label: 'Gom theo Mã hàng', value: 'maHang' },
                        { label: 'Gom theo Mã lệnh SX', value: 'maLenh' },
                        { label: 'Gom theo Khách hàng', value: 'khachHang' }
                    ],
                    columns: [
                        { dataField: 'stt', caption: 'STT', width: 55, alignment: 'center' },
                        { dataField: 'maLenh', caption: 'MÃ LỆNH SẢN XUẤT', minWidth: 140, alignment: 'center', cssClass: 'font-mono' },
                        { dataField: 'maHang', caption: 'MÃ HÀNG', minWidth: 130 },
                        { dataField: 'itemCode', caption: 'ITEMCODE', minWidth: 110 },
                        { dataField: 'maMauVT', caption: 'MÃ MÀU VT', minWidth: 100 },
                        { dataField: 'mau', caption: 'MÀU', minWidth: 110 },
                        { dataField: 'widthSize', caption: 'KHỔ VẢI / SIZE', minWidth: 110 },
                        { dataField: 'donViVT', caption: 'ĐƠN VỊ', minWidth: 80, alignment: 'center' },
                        { dataField: 'khachHang', caption: 'KHÁCH HÀNG', minWidth: 130 },
                        {
                            dataField: 'soLuong',
                            caption: 'SỐ LƯỢNG NHU CẦU',
                            minWidth: 140,
                            alignment: 'right',
                            cssClass: 'font-weight-bold font-mono'
                        }
                    ],
                    dataSource: details
                });
            }).fail(function () {
                self.show({
                    title: `Chi tiết nguyên phụ liệu: ${name}`,
                    columns: [],
                    dataSource: []
                });
            });
        },

        /**
         * HELPER DỰNG SẴN 2: Mở Popup chi tiết cho Bảng Đơn Hàng (Gọi API DB: GetPODetails)
         */
        showOrder: function (item) {
            if (!item) return;

            const poId = item.poId || item.code || '';
            const code = item.code || poId || 'PO';
            const style = item.style || '--';
            const customer = item.des || item.customer || '--';
            const slkh = item.slkh || '0';

            const self = this;
            $.ajax({
                url: '/DashboardTongQuanTienDo/GetPODetails',
                type: 'GET',
                data: { poId: poId },
                dataType: 'json'
            }).done(function (res) {
                const list = (res && res.success && Array.isArray(res.data)) ? res.data : [];
                let totalPlan = 0, totalDone = 0;
                list.forEach(r => {
                    totalPlan += (r.SLKH || 0);
                    totalDone += (r.SLTH || 0);
                });
                const overallRate = totalPlan > 0 ? Math.round((totalDone / totalPlan) * 100) : (item.progress || 100);

                const details = list.map((r, i) => {
                    const rowPlan = r.SLKH || 0;
                    const rowDone = r.SLTH || 0;
                    const rowRate = r.TyLe != null ? Math.round(r.TyLe) : (rowPlan > 0 ? Math.round((rowDone / rowPlan) * 100) : 100);
                    return {
                        stt: i + 1,
                        maHang: r.MaHang || style,
                        maDonHang: r.MaDonHang || poId,
                        tenKhachHang: r.TenKhachHang || customer,
                        tenMau: r.TenMau || '--',
                        size: r.Size || '--',
                        slkh: rowPlan.toLocaleString('vi-VN'),
                        slth: rowDone.toLocaleString('vi-VN'),
                        tyLe: rowRate
                    };
                });

                self.show({
                    title: `Chi tiết đơn hàng: ${code} - Khách hàng: ${customer}`,
                    kpiCards: [
                        { label: 'ĐƠN HÀNG (PO)', value: code, color: '#1D4ED8' },
                        { label: 'KHÁCH HÀNG', value: customer },
                        { label: 'TỔNG KẾ HOẠCH', value: totalPlan > 0 ? totalPlan.toLocaleString('vi-VN') + ' pcs' : (slkh + ' pcs') },
                        { label: 'TỔNG THỰC HIỆN', value: `${totalDone.toLocaleString('vi-VN')} pcs (${overallRate}%)`, color: (overallRate >= 95 ? '#059669' : (overallRate >= 80 ? '#2563EB' : '#DC2626')) }
                    ],
                    searchPlaceholder: 'Tìm kiếm nhanh màu, size, mã hàng, đơn hàng...',
                    groupOptions: [
                        { label: 'Gom theo Màu', value: 'tenMau' },
                        { label: 'Gom theo Size', value: 'size' },
                        { label: 'Gom theo Mã hàng', value: 'maHang' }
                    ],
                    columns: [
                        { dataField: 'stt', caption: 'STT', width: 55, alignment: 'center' },
                        { dataField: 'maHang', caption: 'MÃ HÀNG', minWidth: 140 },
                        { dataField: 'tenKhachHang', caption: 'KHÁCH HÀNG', minWidth: 120 },
                        { dataField: 'tenMau', caption: 'MÀU', minWidth: 120 },
                        { dataField: 'size', caption: 'SIZE', minWidth: 80, alignment: 'center' },
                        { dataField: 'slkh', caption: 'SỐ LƯỢNG KẾ HOẠCH', minWidth: 140, alignment: 'right', cssClass: 'font-mono' },
                        { dataField: 'slth', caption: 'SỐ LƯỢNG THỰC HIỆN', minWidth: 140, alignment: 'right', cssClass: 'font-mono font-weight-bold' },
                        {
                            dataField: 'tyLe',
                            caption: 'TIẾN ĐỘ',
                            minWidth: 130,
                            cellTemplate: function (cellElement, cellInfo) {
                                const rate = cellInfo.value || 0;
                                const isDone = rate >= 100;
                                const color = isDone ? '#10B981' : (rate >= 80 ? '#3B82F6' : '#EF4444');
                                $('<div>')
                                    .css({ display: 'flex', alignItems: 'center', gap: '8px' })
                                    .html(`
                                        <div style="flex: 1; height: 6px; background-color: #E2E8F0; border-radius: 9999px; overflow: hidden;">
                                            <div style="width: ${Math.min(rate, 100)}%; height: 100%; border-radius: 9999px; background-color: ${color};"></div>
                                        </div>
                                        <span style="font-family: var(--font-mono); font-weight: 700; font-size: 11.5px; width: 34px; text-align: right;">${rate}%</span>
                                    `)
                                    .appendTo(cellElement);
                            }
                        }
                    ],
                    dataSource: details
                });
            }).fail(function () {
                self.show({
                    title: `Chi tiết đơn hàng: ${code}`,
                    columns: [],
                    dataSource: []
                });
            });
        },

        /**
         * HELPER DỰNG SẴN 3: Mở Popup chi tiết khi Click vào từng màu trên Biểu đồ tròn
         * @param {Object} groupInfo Thông tin slice từ ECharts (name, percent, value, itemStyle)
         * @param {Array} allMaterials Danh sách tất cả vật tư NPL hiện tại từ DB
         */
        showPieGroup: function (groupInfo, allMaterials) {
            if (!groupInfo) return;
            const groupName = groupInfo.name || 'Nhóm NPL';
            const color = (groupInfo.itemStyle && groupInfo.itemStyle.color) || '#3B82F6';
            const percent = groupInfo.percent != null ? groupInfo.percent : 0;
            const materials = (allMaterials && allMaterials.length) ? allMaterials : ((window.TabTienDoModule && window.TabTienDoModule.currentMaterials) || []);

            // Lọc danh sách NPL thuộc nhóm này
            const filtered = materials.filter(m => {
                const rate = typeof m.rate === 'number' ? m.rate : parseFloat(m.rate) || 0;
                if (groupName.includes('100')) return rate >= 100;
                if (groupName.includes('80')) return rate >= 80 && rate < 100;
                if (groupName.includes('20') || groupName.includes('Thiếu')) return rate >= 50 && rate < 80;
                if (groupName.includes('Trễ')) return rate < 50;
                return true;
            });

            const details = filtered.map((item, idx) => ({
                stt: idx + 1,
                code: item.code,
                name: item.name,
                demand: item.demand,
                available: item.available,
                rate: item.rate,
                statusText: item.statusText || `${item.rate}%`,
                chipClass: item.chipClass || 'chip-blue'
            }));

            const generalStatus = groupName.includes('100') ? 'Sẵn sàng sản xuất 100%' :
                                  (groupName.includes('80') ? 'Tiến độ khả quan (>80%)' :
                                  (groupName.includes('20') || groupName.includes('Thiếu') ? 'Cần thúc đẩy nhà cung cấp' : 'Báo động: Nguy cơ thiếu NPL'));

            this.show({
                title: `Chi tiết nhóm tỷ lệ đáp ứng: ${groupName} (${filtered.length} loại NPL từ DB)`,
                kpiCards: [
                    { label: 'NHÓM TỶ LỆ', value: groupName, color: color },
                    { label: 'SỐ LƯỢNG LOẠI NPL', value: `${filtered.length} loại vật tư`, color: '#0F172A' },
                    { label: 'TỶ TRỌNG TRÊN BIỂU ĐỒ', value: `${percent}%`, color: '#2563EB' },
                    { label: 'ĐÁNH GIÁ CHUNG', value: generalStatus, color: color }
                ],
                searchPlaceholder: 'Tìm kiếm nhanh tên NPL, mã CLVT...',
                groupOptions: [
                    { label: 'Gom theo Trạng thái', value: 'statusText' }
                ],
                columns: [
                    { dataField: 'stt', caption: 'STT', width: 55, alignment: 'center' },
                    { dataField: 'code', caption: 'MÃ CLVT', minWidth: 120, alignment: 'center', cssClass: 'font-mono' },
                    { dataField: 'name', caption: 'TÊN NGUYÊN PHỤ LIỆU', minWidth: 200, cssClass: 'font-weight-bold' },
                    { dataField: 'demand', caption: 'TỔNG NHU CẦU', minWidth: 120, alignment: 'right', cssClass: 'font-mono' },
                    { dataField: 'available', caption: 'HIỆN CÓ (KHO)', minWidth: 120, alignment: 'right', cssClass: 'font-mono font-weight-bold' },
                    {
                        dataField: 'rate',
                        caption: 'TỶ LỆ ĐÁP ỨNG',
                        minWidth: 140,
                        cellTemplate: function (cellElement, cellInfo) {
                            const val = cellInfo.value || 0;
                            const isDone = val >= 100;
                            const barColor = isDone ? '#10B981' : (val >= 80 ? '#3B82F6' : (val >= 50 ? '#F59E0B' : '#EF4444'));
                            $('<div>')
                                .css({ display: 'flex', alignItems: 'center', gap: '8px' })
                                .html(`
                                    <div style="flex: 1; height: 7px; background-color: #E2E8F0; border-radius: 9999px; overflow: hidden;">
                                        <div style="width: ${Math.min(val, 100)}%; height: 100%; border-radius: 9999px; background-color: ${barColor};"></div>
                                    </div>
                                    <span style="font-family: var(--font-mono); font-weight: 700; font-size: 11.5px; width: 36px; text-align: right; color: ${barColor};">${val}%</span>
                                `)
                                .appendTo(cellElement);
                        }
                    },
                    {
                        dataField: 'statusText',
                        caption: 'TRẠNG THÁI',
                        minWidth: 120,
                        alignment: 'center',
                        cellTemplate: function (cellElement, cellInfo) {
                            const val = cellInfo.value || '';
                            let chip = 'chip-blue';
                            if (val.includes('100%') || val.includes('Đủ')) chip = 'chip-green';
                            else if (val.includes('Thiếu')) chip = 'chip-orange';
                            else if (val.includes('Trễ')) chip = 'chip-red';
                            $('<span>')
                                .addClass('octo-chip ' + chip)
                                .text(val)
                                .appendTo(cellElement);
                        }
                    }
                ],
                dataSource: details
            });
        },

        /**
         * HELPER DỰNG SẴN 4: Mở Popup chi tiết Theo dõi mua hàng (Gọi API DB: GetPurchaseTrackingDetails)
         * @param {Object} options { category, categoryName, status, value }
         */
        showPurchaseTracking: function (options) {
            const opt = options || {};
            const category = opt.category || '';
            const categoryName = opt.categoryName || category || 'Toàn bộ vật tư';
            const status = opt.status || '';

            let apiStatus = '';
            if (status === 'da-ve' || status === 'Đã về') apiStatus = 'arrived';
            else if (status === 'sap-ve' || status === 'Sắp về') apiStatus = 'incoming';
            else if (status === 'tre' || status === 'Về trễ' || status === 'Trễ') apiStatus = 'fail';

            let displayStatus = 'Tất cả đơn mua';
            if (apiStatus === 'arrived') displayStatus = 'Đã về kho';
            else if (apiStatus === 'incoming') displayStatus = 'Sắp về';
            else if (apiStatus === 'fail') displayStatus = 'Về trễ';

            const startDate = $('#start-date').val() || '';
            const endDate = $('#end-date').val() || '';

            const self = this;
            $.ajax({
                url: '/DashboardTongQuanTienDo/GetPurchaseTrackingDetails',
                type: 'GET',
                data: {
                    category: category,
                    status: apiStatus,
                    startDate: startDate,
                    endDate: endDate
                },
                dataType: 'json'
            }).done(function (res) {
                const list = (res && res.success && Array.isArray(res.data)) ? res.data : [];
                let sumQty = 0;
                const details = list.map((p, idx) => {
                    const q = p.soLuong || 0;
                    sumQty += q;
                    return {
                        stt: idx + 1,
                        poCode: p.poid || '--',
                        maHang: p.maHang || '--',
                        itemName: p.tenNPL || '--',
                        khoVai: p.khoVai || '--',
                        mau: p.mauVatTu || p.maMauVatTu || '--',
                        supplier: p.nhaCungCap || '--',
                        customer: p.khachHang || '--',
                        quantity: q.toLocaleString('vi-VN'),
                        unit: p.donViTinh || '--',
                        status: p.trangThai === 'arrived' ? 'Đã về' : (p.trangThai === 'incoming' ? 'Sắp về' : (p.trangThai === 'fail' ? 'Về trễ' : 'Đã đặt'))
                    };
                });

                const statusColor = (displayStatus.includes('Đã về') ? '#10B981' : (displayStatus.includes('Sắp') ? '#F59E0B' : (displayStatus.includes('trễ') || displayStatus.includes('Trễ') ? '#EF4444' : '#2563EB')));

                self.show({
                    title: `Chi tiết theo dõi mua hàng: ${categoryName} - Trạng thái: ${displayStatus}`,
                    kpiCards: [
                        { label: 'NHÓM NPL', value: categoryName },
                        { label: 'TRẠNG THÁI GIAO', value: displayStatus, color: statusColor },
                        { label: 'TỔNG SỐ LƯỢNG', value: sumQty.toLocaleString('vi-VN'), color: '#0F172A' },
                        { label: 'SỐ DÒNG CHI TIẾT', value: `${details.length} mục từ DB`, color: '#2563EB' }
                    ],
                    searchPlaceholder: 'Tìm kiếm nhanh Mã PO, tên vật tư, nhà cung cấp, khách hàng, màu...',
                    groupOptions: [
                        { label: 'Gom theo Nhà cung cấp', value: 'supplier' },
                        { label: 'Gom theo Khách hàng', value: 'customer' },
                        { label: 'Gom theo Trạng thái', value: 'status' }
                    ],
                    columns: [
                        { dataField: 'stt', caption: 'STT', width: 55, alignment: 'center' },
                        { dataField: 'poCode', caption: 'MÃ ĐƠN MUA (PO)', minWidth: 130, alignment: 'center', cssClass: 'font-weight-bold font-mono' },
                        { dataField: 'itemName', caption: 'TÊN NGUYÊN PHỤ LIỆU', minWidth: 220, cssClass: 'font-weight-bold' },
                        { dataField: 'supplier', caption: 'NHÀ CUNG CẤP', minWidth: 170 },
                        { dataField: 'customer', caption: 'KHÁCH HÀNG', minWidth: 130 },
                        { dataField: 'mau', caption: 'MÀU VẬT TƯ', minWidth: 110 },
                        { dataField: 'khoVai', caption: 'KHỔ VẢI / SIZE', minWidth: 110 },
                        { dataField: 'quantity', caption: 'SỐ LƯỢNG', minWidth: 110, alignment: 'right', cssClass: 'font-mono font-weight-bold' },
                        { dataField: 'unit', caption: 'ĐVT', minWidth: 70, alignment: 'center' },
                        {
                            dataField: 'status',
                            caption: 'TRẠNG THÁI',
                            minWidth: 115,
                            alignment: 'center',
                            cellTemplate: function (cellElement, cellInfo) {
                                const val = cellInfo.value || '';
                                let chip = 'chip-blue';
                                if (val.includes('Đã về')) chip = 'chip-green';
                                else if (val.includes('Sắp')) chip = 'chip-orange';
                                else if (val.includes('Trễ') || val.includes('trễ')) chip = 'chip-red';
                                $('<span>')
                                    .addClass('octo-chip ' + chip)
                                    .text(val)
                                    .appendTo(cellElement);
                            }
                        }
                    ],
                    dataSource: details
                });
            }).fail(function () {
                self.show({
                    title: `Theo dõi chi tiết mua hàng (PO)`,
                    columns: [],
                    dataSource: []
                });
            });
        }
    };

    // Xuất ra toàn cục
    window.CommonDetailPopup = CommonDetailPopup;
    window.showMaterialDetailPopup = function (item) { CommonDetailPopup.showMaterial(item); };
    window.showOrderDetailPopup = function (item) { CommonDetailPopup.showOrder(item); };
    window.showPieGroupDetailPopup = function (group, list) { CommonDetailPopup.showPieGroup(group, list); };
    window.showPurchaseDetailPopup = function (opts) { CommonDetailPopup.showPurchaseTracking(opts); };

})(window, window.jQuery || window.$);
