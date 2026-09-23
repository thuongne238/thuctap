/**
 * ==========================================================================
 * NTBSOFT ERP - COMPONENT DÙNG CHUNG: POPUP CHI TIẾT ĐA NĂNG (DEVEXTREME)
 * File: common-detail-popup.js
 * Thư mục: Scripts/grid_devextreme/
 * 
 * Áp dụng cho TẤT CẢ các bảng trong toàn hệ thống:
 * - Khi click vào bất kỳ item nào ở bất kỳ bảng nào, gọi:
 *     CommonDetailPopup.show(config)
 *     CommonDetailPopup.showOrder(orderItem)
 *     CommonDetailPopup.showMaterial(materialItem)
 * - Nếu không có dữ liệu: Hiển thị giao diện "Không có dữ liệu chi tiết" cực đẹp
 * - Nếu có dữ liệu: Hiển thị các thẻ KPI tóm tắt, ô tìm kiếm nhanh, gom nhóm và DataGrid
 * ==========================================================================
 */
(function (window, $) {
    'use strict';

    let popupInstance = null;
    let gridInstance = null;
    let lastOpenTime = 0;

    const CommonDetailPopup = {
        /**
         * Khởi tạo Popup singleton dùng chung nếu chưa có
         */
        ensurePopup: function () {
            if (popupInstance) return popupInstance;

            let $popupEl = $('#dx-universal-detail-popup');
            if ($popupEl.length === 0) {
                $popupEl = $('<div id="dx-universal-detail-popup"></div>').appendTo('body');
            }

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
                contentTemplate: function (contentElement) {
                    const html = `
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
                            <div class="dx-popup-grid-wrapper" id="dx_comm_grid_wrapper">
                                <div id="dx_comm_grid_container" style="width: 100%; height: 100%;"></div>
                            </div>

                            <!-- 4. Giao diện Empty State khi không có dữ liệu -->
                            <div class="dx-detail-empty-state" id="dx_comm_empty_state" style="display: none;">
                                <i class="fa-solid fa-folder-open dx-detail-empty-icon"></i>
                                <div class="dx-detail-empty-title">Không có dữ liệu chi tiết liên quan</div>
                                <div class="dx-detail-empty-sub">Mục được chọn hiện chưa có thông tin chi tiết hoặc chưa được cập nhật từ hệ thống.</div>
                            </div>
                        </div>
                    `;
                    contentElement.append(html);

                    // Khởi tạo DevExtreme DataGrid trong popup
                    gridInstance = $('#dx_comm_grid_container').dxDataGrid({
                        dataSource: [],
                        columns: [],
                        showBorders: false,
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
                            showInfo: false,
                            displayMode: 'full'
                        },
                        noDataText: 'Không tìm thấy dữ liệu phù hợp'
                    }).dxDataGrid('instance');

                    // Gắn sự kiện ô tìm kiếm trực tiếp
                    $('#dx_comm_search_input').on('input', function () {
                        if (gridInstance) {
                            gridInstance.searchByText($(this).val().trim());
                        }
                    });

                    // Gắn sự kiện chọn gom nhóm
                    $('#dx_comm_group_select').on('change', function () {
                        if (!gridInstance) return;
                        const count = gridInstance.columnCount();
                        for (let i = 0; i < count; i++) {
                            gridInstance.columnOption(i, 'groupIndex', undefined);
                        }
                        if (this.value) {
                            gridInstance.columnOption(this.value, 'groupIndex', 0);
                        }
                    });
                },
                onResize: function () {
                    if (gridInstance) gridInstance.repaint();
                },
                onShown: function () {
                    if (gridInstance) gridInstance.repaint();
                }
            }).dxPopup('instance');

            return popupInstance;
        },

        /**
         * HÀM CHÍNH: Mở Popup chi tiết tổng quát cho bất kỳ bảng nào
         * @param {Object} config Cấu hình hiển thị chi tiết
         * @param {string} config.title Tiêu đề popup
         * @param {Array} [config.kpiCards] Mảng các thẻ KPI [{ label: 'TỔNG NHU CẦU', value: '45,000 m', color: '#10B981' }]
         * @param {string} [config.searchPlaceholder] Placeholder của ô tìm kiếm
         * @param {Array} [config.groupOptions] Mảng tùy chọn gom nhóm [{ label: 'Theo Mã hàng', value: 'maHang' }]
         * @param {Array} config.columns Mảng cấu hình cột cho DataGrid chi tiết
         * @param {Array|Function} config.dataSource Dữ liệu chi tiết hoặc hàm nạp
         * @param {string} [config.emptyTitle] Tiêu đề khi không có dữ liệu
         * @param {string} [config.emptySub] Mô tả phụ khi không có dữ liệu
         */
        show: function (config) {
            if (!config) return;

            // Debounce chống click đúp
            const now = Date.now();
            if (now - lastOpenTime < 300) return;
            lastOpenTime = now;

            this.ensurePopup();

            // 1. Cập nhật tiêu đề Popup
            const title = config.title || 'Chi tiết thông tin mục được chọn';
            popupInstance.option('title', title);
            popupInstance.show();

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

            // 4. Kiểm tra Dữ liệu (Có dữ liệu hay Không có dữ liệu)
            const $gridWrapper = $('#dx_comm_grid_wrapper');
            const $emptyState = $('#dx_comm_empty_state');
            const $toolbar = $('#dx_comm_toolbar');

            let rawData = config.dataSource;
            if (typeof rawData === 'function') {
                rawData = rawData();
            }

            const hasData = Array.isArray(rawData) && rawData.length > 0;

            if (!hasData) {
                // 👉 TRƯỜNG HỢP: KHÔNG CÓ DỮ LIỆU
                $gridWrapper.hide();
                $toolbar.hide();

                if (config.emptyTitle) {
                    $emptyState.find('.dx-detail-empty-title').text(config.emptyTitle);
                } else {
                    $emptyState.find('.dx-detail-empty-title').text('Không có dữ liệu chi tiết liên quan');
                }

                if (config.emptySub) {
                    $emptyState.find('.dx-detail-empty-sub').text(config.emptySub);
                } else {
                    $emptyState.find('.dx-detail-empty-sub').text('Mục này hiện tại chưa có phát sinh dữ liệu chi tiết hoặc chưa được đồng bộ từ cơ sở dữ liệu.');
                }

                $emptyState.css('display', 'flex');
            } else {
                // 👉 TRƯỜNG HỢP: CÓ DỮ LIỆU ĐẦY ĐỦ
                $emptyState.hide();
                $toolbar.show();
                $gridWrapper.show();

                // Nạp cấu hình cột và dữ liệu vào Grid
                if (config.columns && Array.isArray(config.columns)) {
                    gridInstance.option('columns', config.columns);
                }
                gridInstance.option('dataSource', rawData);
                gridInstance.refresh();
                gridInstance.repaint();
            }
        },

        /**
         * HELPER DỰNG SẴN 1: Mở Popup chi tiết cho Bảng Nguyên Phụ Liệu
         */
        showMaterial: function (item) {
            if (!item) return;

            const name = item.name || item.loaiNPL || 'Nguyên phụ liệu';
            const demand = item.demand || item.nhuCau || '0';
            const available = item.available || item.daCo || '0';
            const rate = item.rate != null ? item.rate : 100;
            const rateStr = typeof rate === 'number' ? rate + '%' : rate;

            // Dữ liệu chi tiết mẫu cho vật tư (hoặc gọi API)
            const details = this.generateMaterialDetails(item);

            this.show({
                title: `Chi tiết nguyên phụ liệu: ${name}`,
                kpiCards: [
                    { label: 'LOẠI VẬT TƯ', value: name },
                    { label: 'TỔNG NHU CẦU', value: demand },
                    { label: 'HIỆN CÓ / TIẾN ĐỘ', value: `${available} (${rateStr})`, color: (rate >= 90 ? '#059669' : (rate >= 70 ? '#D97706' : '#DC2626')) }
                ],
                searchPlaceholder: 'Tìm kiếm nhanh Mã lệnh, Mã hàng, ItemCode, Màu...',
                groupOptions: [
                    { label: 'Gom theo Mã hàng', value: 'maHang' },
                    { label: 'Gom theo Mã lệnh SX', value: 'maLenh' },
                    { label: 'Gom theo Khách hàng', value: 'khachHang' }
                ],
                columns: [
                    { dataField: 'stt', caption: 'STT', width: 55, alignment: 'center' },
                    { dataField: 'maHang', caption: 'MÃ HÀNG', minWidth: 130 },
                    { dataField: 'maLenh', caption: 'MÃ LỆNH SẢN XUẤT', minWidth: 140, alignment: 'center' },
                    { dataField: 'itemCode', caption: 'ITEMCODE', minWidth: 110 },
                    { dataField: 'maMauVT', caption: 'MÃ MÀU VT', minWidth: 100 },
                    { dataField: 'mau', caption: 'MÀU', minWidth: 100 },
                    { dataField: 'widthSize', caption: 'WIDTH/SIZE', minWidth: 100 },
                    { dataField: 'donViVT', caption: 'ĐƠN VỊ VT', minWidth: 90, alignment: 'center' },
                    { dataField: 'khachHang', caption: 'KHÁCH HÀNG', minWidth: 140 },
                    {
                        dataField: 'soLuong',
                        caption: 'SỐ LƯỢNG',
                        minWidth: 110,
                        alignment: 'right',
                        cssClass: 'font-weight-bold font-mono'
                    }
                ],
                dataSource: details
            });
        },

        /**
         * HELPER DỰNG SẴN 2: Mở Popup chi tiết cho Bảng Đơn Hàng & Kế Hoạch Thời Gian
         */
        showOrder: function (item) {
            if (!item) return;

            const code = item.code || 'LSX';
            const style = item.style || 'STYLE';
            const slkh = item.slkh || '0';
            const customer = item.des || 'Khách hàng';

            // Dữ liệu chi tiết từng công đoạn của đơn hàng
            const details = this.generateOrderStagesDetails(item);

            this.show({
                title: `Chi tiết tiến độ đơn hàng: ${code} - ${style}`,
                kpiCards: [
                    { label: 'LỆNH SẢN XUẤT & STYLE', value: `${code} (${style})` },
                    { label: 'SỐ LƯỢNG KẾ HOẠCH', value: `${slkh} pcs`, color: '#1D4ED8' },
                    { label: 'KHÁCH HÀNG / CHỦNG LOẠI', value: customer, color: '#059669' }
                ],
                searchPlaceholder: 'Tìm kiếm nhanh công đoạn, chuyền may, trạng thái...',
                groupOptions: [
                    { label: 'Gom theo Chuyền / Phân xưởng', value: 'toChuyen' },
                    { label: 'Gom theo Trạng thái', value: 'trangThai' }
                ],
                columns: [
                    { dataField: 'stt', caption: 'STT', width: 55, alignment: 'center' },
                    { dataField: 'congDoan', caption: 'CÔNG ĐOẠN SẢN XUẤT', minWidth: 160, cssClass: 'font-weight-bold' },
                    { dataField: 'toChuyen', caption: 'TỔ / PHÂN XƯỞNG', minWidth: 130 },
                    { dataField: 'khNgay', caption: 'KẾ HOẠCH', minWidth: 95, alignment: 'center' },
                    { dataField: 'ttNgay', caption: 'THỰC TẾ', minWidth: 95, alignment: 'center' },
                    {
                        dataField: 'slKeHoach',
                        caption: 'SL KẾ HOẠCH',
                        minWidth: 115,
                        alignment: 'right',
                        cssClass: 'font-mono'
                    },
                    {
                        dataField: 'slThucTe',
                        caption: 'SL ĐÃ LÀM',
                        minWidth: 115,
                        alignment: 'right',
                        cssClass: 'font-mono font-weight-bold'
                    },
                    {
                        dataField: 'tienDo',
                        caption: 'TIẾN ĐỘ',
                        minWidth: 130,
                        cellTemplate: function (cellElement, cellInfo) {
                            const rate = cellInfo.value || 0;
                            const isDone = rate >= 100;
                            const color = isDone ? '#10B981' : (rate >= 60 ? '#3B82F6' : '#EF4444');
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
                    },
                    {
                        dataField: 'trangThai',
                        caption: 'TRẠNG THÁI',
                        minWidth: 110,
                        alignment: 'center',
                        cellTemplate: function (cellElement, cellInfo) {
                            const val = cellInfo.value || '';
                            let chip = 'chip-blue';
                            if (val.includes('Hoàn thành') || val.includes('Đúng hạn')) chip = 'chip-green';
                            else if (val.includes('Trễ')) chip = 'chip-red';
                            else if (val.includes('Đang')) chip = 'chip-blue';
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
         * Sinh dữ liệu chi tiết công đoạn cho 1 đơn hàng (Demo hoặc API fallback)
         */
        generateOrderStagesDetails: function (orderItem) {
            if (!orderItem) return [];
            const cleanQty = parseFloat(String(orderItem.slkh || '5000').replace(/[^0-9.]/g, '')) || 5000;

            const stages = [
                { cd: '1. Chuẩn bị NPL & Phụ liệu', to: 'Kho Nguyên Liệu', kh: orderItem.khCat, tt: orderItem.ttCat, pct: 100, status: 'Hoàn thành đúng hạn' },
                { cd: '2. Giác sơ đồ & Cắt tự động', to: 'Phân Xưởng Cắt', kh: orderItem.khCat, tt: orderItem.ttCat, pct: 100, status: 'Hoàn thành đúng hạn' },
                { cd: '3. Lập trình máy rập & Cữ gá', to: 'Tổ Kỹ Thuật May', kh: orderItem.khLapTrinh, tt: orderItem.ttLapTrinh, pct: 100, status: 'Hoàn thành đúng hạn' },
                { cd: '4. Ép keo & Bán thành phẩm', to: 'Tổ Ép Keo BTP', kh: orderItem.khLapTrinh, tt: orderItem.ttLapTrinh, pct: 100, status: 'Hoàn thành đúng hạn' },
                { cd: '5. May Chuyền 01 (Lắp ráp thân)', to: 'Chuyền May 01', kh: orderItem.khMay, tt: orderItem.ttMay, pct: 75, status: 'Đang may chuyền' },
                { cd: '6. May Chuyền 02 (Hoàn thiện áo)', to: 'Chuyền May 02', kh: orderItem.khMay, tt: orderItem.ttMay, pct: 60, status: 'Đang may chuyền' },
                { cd: '7. KCS / Kiểm phẩm chuyền may', to: 'Bộ Phận QC/QA', kh: orderItem.khThoatChuyen, tt: orderItem.ttThoatChuyen, pct: 40, status: 'Đang kiểm phẩm' },
                { cd: '8. Là ủi & Hoàn thiện đóng gói', to: 'Tổ Đóng Gói Hoàn Thiện', kh: orderItem.khThoatChuyen, tt: orderItem.ttThoatChuyen, pct: 0, status: 'Chờ thoát chuyền' }
            ];

            return stages.map((stg, i) => {
                const slDone = Math.round(cleanQty * (stg.pct / 100));
                return {
                    stt: i + 1,
                    congDoan: stg.cd,
                    toChuyen: stg.to,
                    khNgay: stg.kh || '--',
                    ttNgay: stg.tt || '--',
                    slKeHoach: cleanQty.toLocaleString('en-US') + ' pcs',
                    slThucTe: slDone.toLocaleString('en-US') + ' pcs',
                    tienDo: stg.pct,
                    trangThai: stg.status
                };
            });
        },

        /**
         * Sinh dữ liệu chi tiết cho Nguyên phụ liệu (Demo hoặc API fallback)
         */
        generateMaterialDetails: function (materialItem) {
            if (!materialItem) return [];
            const name = materialItem.name || 'Vật tư';
            const demandStr = String(materialItem.demand || '1,000');
            const rawNum = demandStr.replace(/[^0-9,\.]/g, '').trim();
            const totalVal = parseFloat(rawNum.replace(/\./g, '').replace(',', '.')) || 1000;

            let unit = 'PCS';
            const lower = demandStr.toLowerCase();
            if (lower.includes('m') && !lower.includes('cuộn')) unit = 'MTS';
            else if (lower.includes('cuộn')) unit = 'CUỘN';
            else if (lower.includes('cái')) unit = 'CÁI';
            else if (lower.includes('thùng')) unit = 'THÙNG';
            else if (lower.includes('kg')) unit = 'KG';

            const ordersList = [
                { style: 'POLO-SLIM-01', code: 'LSX-2024-0891', des: 'Nguyễn Công Thương' },
                { style: 'JKT-WIND-04', code: 'LSX-2024-0912', des: 'Áo Khoác Gió 2 Lớp' },
                { style: 'TSHIRT-OVR-02', code: 'LSX-2024-0935', des: 'Áo Thun Cổ Tròn' },
                { style: 'HOODIE-FLC-09', code: 'LSX-2024-0960', des: 'Áo Nỉ Hoodie' },
                { style: 'SHIRT-OXF-05', code: 'LSX-2024-0988', des: 'Sơ Mi Oxford' },
                { style: 'PANT-CHINO-03', code: 'LSX-2024-0995', des: 'Quần Chino Nam' }
            ];

            const ratios = [0.28, 0.24, 0.20, 0.14, 0.08, 0.06];
            let prefix = 'VT';
            const lowerName = name.toLowerCase();
            if (lowerName.includes('vải')) prefix = 'FAB';
            else if (lowerName.includes('chỉ')) prefix = 'CHI';
            else if (lowerName.includes('khóa')) prefix = 'ZIP';
            else if (lowerName.includes('cúc') || lowerName.includes('nút')) prefix = 'BTN';

            return ordersList.map((ord, i) => {
                const ratio = ratios[i % ratios.length];
                const qty = Math.round(totalVal * ratio * 10) / 10;
                return {
                    stt: i + 1,
                    maHang: ord.style,
                    maLenh: ord.code,
                    itemCode: `${prefix}-${ord.style.substring(0, 6)}-0${i + 1}`,
                    maMauVT: (i % 2 === 0 ? 'NAVY' : 'BLACK'),
                    mau: (i % 2 === 0 ? 'NAVY BLUE' : 'SOLID BLACK'),
                    widthSize: (i % 2 === 0 ? '150CM' : '142CM'),
                    donViVT: unit,
                    khachHang: ord.des,
                    soLuong: qty.toLocaleString('vi-VN', { maximumFractionDigits: 1 })
                };
            });
        }
    };

    // Xuất ra toàn cục
    window.CommonDetailPopup = CommonDetailPopup;
    window.showMaterialDetailPopup = function (item) { CommonDetailPopup.showMaterial(item); };
    window.showOrderDetailPopup = function (item) { CommonDetailPopup.showOrder(item); };

})(window, window.jQuery || window.$);
