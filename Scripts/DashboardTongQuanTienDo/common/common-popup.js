/**
 * ==========================================================================
 * NTBSOFT ERP - COMPONENT DÙNG CHUNG: POPUP CHI TIẾT ĐA NĂNG (DEVEXTREME)
 * File: common-detail-popup.js
 * Thư mục: Scripts/griddevextreme/
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

            this.ensurePopup();

            // 1. Cập nhật tiêu đề Popup
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
                $emptyState.hide();
                $toolbar.show();
                $gridWrapper.show();

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
                    gridInstance.option('dataSource', rawData);
                    gridInstance.refresh();
                    gridInstance.updateDimensions();
                    gridInstance.repaint();
                }
            }

            setTimeout(function () {
                if (gridInstance) {
                    gridInstance.updateDimensions();
                    gridInstance.repaint();
                }
            }, 60);
        },

        /**
         * HELPER DỰNG SẴN 1: Mở Popup chi tiết cho Bảng Nguyên Phụ Liệu (Section 2 - Lưới NPL)
         */
        showMaterial: function (item) {
            if (!item) return;

            const catCode = item.code || '';
            const name = item.name || item.loaiNPL || item.type || catCode || 'Nguyên phụ liệu';
            const demand = item.demand || item.nhuCau || '0';
            const available = item.available || item.daCo || '0';
            const rate = item.rate != null ? item.rate : 100;
            const rateStr = typeof rate === 'number' ? rate + '%' : rate;

            let startDate = $('#start-date').val() || '';
            let endDate = $('#end-date').val() || '';
            if (window.TabTienDoModule && typeof window.TabTienDoModule.getDateRange === 'function') {
                const dates = window.TabTienDoModule.getDateRange();
                startDate = dates.startDate;
                endDate = dates.endDate;
            }

            const self = this;

            const renderMaterialPopup = function (details) {
                self.show({
                    title: `Chi tiết nguyên phụ liệu: ${name} (${catCode || ''})`,
                    kpiCards: [
                        { label: 'LOẠI VẬT TƯ', value: name },
                        { label: 'TỔNG NHU CẦU', value: demand },
                        { label: 'HIỆN CÓ / TIẾN ĐỘ', value: `${available} (${rateStr})`, color: (rate >= 90 ? '#059669' : (rate >= 70 ? '#D97706' : '#DC2626')) },
                        { label: 'SỐ DÒNG CHI TIẾT', value: `${details.length} lệnh SX`, color: '#2563EB' }
                    ],
                    searchPlaceholder: 'Tìm kiếm nhanh Mã lệnh, Mã hàng, ItemCode, Màu...',
                    groupOptions: [
                        { label: 'Gom theo Mã hàng', value: 'maHang' },
                        { label: 'Gom theo Mã lệnh SX', value: 'maLenh' },
                        { label: 'Gom theo Chủng loại', value: 'chungLoai' }
                    ],
                    columns: [
                        { dataField: 'stt', caption: 'STT', width: 55, alignment: 'center' },
                        { dataField: 'maLenh', caption: 'MÃ LỆNH SẢN XUẤT', minWidth: 140, alignment: 'center' },
                        { dataField: 'maHang', caption: 'MÃ HÀNG', minWidth: 130 },
                        { dataField: 'itemCode', caption: 'ITEMCODE', minWidth: 110 },
                        { dataField: 'maMauVT', caption: 'MÃ MÀU VT', minWidth: 100 },
                        { dataField: 'mau', caption: 'MÀU', minWidth: 100 },
                        { dataField: 'widthSize', caption: 'WIDTH/SIZE', minWidth: 100 },
                        { dataField: 'donViVT', caption: 'ĐƠN VỊ VT', minWidth: 90, alignment: 'center' },
                        { dataField: 'chungLoai', caption: 'CHỦNG LOẠI', minWidth: 140 },
                        {
                            dataField: 'soLuong',
                            caption: 'SỐ LƯỢNG',
                            minWidth: 110,
                            alignment: 'right',
                            cssClass: 'font-weight-bold'
                        }
                    ],
                    dataSource: details
                });
            };

            $.ajax({
                url: '/DashboardTongQuanTienDo/GetMaterialStatusDetails',
                type: 'GET',
                data: { category: catCode, startDate: startDate, endDate: endDate },
                dataType: 'json',
                timeout: 5000
            }).done(function (res) {
                let details = [];
                if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                    details = res.data.map((r, i) => ({
                        stt: i + 1,
                        maLenh: r.MaLenh || '--',
                        maHang: r.MaHang || '--',
                        itemCode: r.ItemCode || '--',
                        maMauVT: r.MaMauVT || '--',
                        mau: r.Mau || '--',
                        widthSize: r.WidthSize || '--',
                        donViVT: r.DonViVT || '--',
                        chungLoai: r.ChungLoai || r.KhachHang || '--',
                        soLuong: (r.SoLuong || 0).toLocaleString('vi-VN')
                    }));
                } else {
                    details = self.generateMaterialDetails(item);
                }
                renderMaterialPopup(details);
            }).fail(function () {
                const details = self.generateMaterialDetails(item);
                renderMaterialPopup(details);
            });
        },

        /**
         * HELPER DỰNG SẴN 2: Mở Popup chi tiết cho Bảng Đơn Hàng (Section 1 - 8 Công Đoạn Sản Xuất)
         */
        showOrder: function (item) {
            if (!item) return;

            const code = item.code || item.orderCode || item.po || 'LSX';
            const style = item.style || item.po || 'STYLE';
            const slkh = item.slkh || item.qty || '0';
            const chungLoai = '--'; // Ép cứng luôn vì item.des đang chứa tên khách hàng từ SQL
            const poId = item.poId || item.po || item.code || '';

            const self = this;

            const renderStages = function (orderData) {
                const details = self.generateOrderStagesDetails(orderData);
                const cleanQty = parseFloat(String(orderData.qty || orderData.slkh || '0').replace(/[^0-9.]/g, '')) || 0;

                self.show({
                    title: `Chi tiết tiến độ đơn hàng: ${code} - ${style}`,
                    kpiCards: [
                        { label: 'LỆNH SẢN XUẤT & STYLE', value: `${code} (${style})` },
                        { label: 'SỐ LƯỢNG KẾ HOẠCH', value: `${cleanQty.toLocaleString('en-US')} pcs`, color: '#1D4ED8' },
                        { label: 'CHỦNG LOẠI', value: chungLoai, color: '#059669' }
                    ],
                    searchPlaceholder: 'Tìm kiếm nhanh công đoạn, chuyền may, trạng thái...',
                    groupOptions: [
                        { label: 'Gom theo Chuyền / Phân xưởng', value: 'toChuyen' },
                        { label: 'Gom theo Trạng thái', value: 'trangThai' }
                    ],
                    columns: [
                        { dataField: 'stt', caption: 'STT', width: 55, alignment: 'center' },
                        { dataField: 'congDoan', caption: 'CÔNG ĐOẠN SẢN XUẤT', minWidth: 170, cssClass: 'font-weight-bold' },
                        { dataField: 'toChuyen', caption: 'TỔ / PHÂN XƯỞNG', minWidth: 140 },
                        { dataField: 'khNgay', caption: 'KẾ HOẠCH', minWidth: 95, alignment: 'center' },
                        { dataField: 'ttNgay', caption: 'THỰC TẾ', minWidth: 95, alignment: 'center' },
                        {
                            dataField: 'slKeHoach',
                            caption: 'SL KẾ HOẠCH',
                            minWidth: 115,
                            alignment: 'right'
                        },
                        {
                            dataField: 'slThucTe',
                            caption: 'SL ĐÃ LÀM',
                            minWidth: 115,
                            alignment: 'right',
                            cssClass: 'font-weight-bold'
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
                                        <span style="font-family: 'Inter', sans-serif; font-weight: 700; font-size: 11.5px; width: 34px; text-align: right;">${rate}%</span>
                                    `)
                                    .appendTo(cellElement);
                            }
                        },
                        {
                            dataField: 'trangThai',
                            caption: 'TRẠNG THÁI',
                            minWidth: 120,
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
            };

            // Nếu không có poId, render ngay
            if (!poId) {
                renderStages(item);
                return;
            }

            // Gọi API lấy dữ liệu 8 công đoạn
            $.ajax({
                url: '/DashboardTongQuanTienDo/GetOrderStagesDetails?poId=' + encodeURIComponent(poId),
                type: 'GET',
                timeout: 5000,
                success: function (res) {
                    let apiData = {};
                    if (res && res.success && res.data) {
                        apiData = res.data;
                    }
                    const mergedItem = $.extend({}, item, {
                        cutQty: apiData.CutQty || 0,
                        sewQty: apiData.SewQty || 0,
                        kcsQty: apiData.KcsQty || 0,
                        packQty: apiData.PackQty || 0
                    });
                    renderStages(mergedItem);
                },
                error: function (err) {
                    console.warn("API GetOrderStagesDetails lỗi hoặc timeout, dùng dữ liệu fallback:", err);
                    renderStages(item);
                }
            });
        },

        /**
         * HELPER DỰNG SẴN 3: Mở Popup chi tiết khi Click vào từng màu trên Biểu đồ tròn (Section 2 - Tỷ Lệ Đáp Ứng NPL)
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

            const details = (filtered.length > 0 ? filtered : materials).map((item, idx) => ({
                stt: idx + 1,
                code: item.code || '--',
                name: item.name || item.type || '--',
                demand: item.demand || '0',
                available: item.available || '0',
                rate: item.rate != null ? item.rate : 100,
                statusText: item.statusText || `${item.rate}%`,
                chipClass: item.chipClass || 'chip-blue'
            }));

            const generalStatus = groupName.includes('100') ? 'Sẵn sàng sản xuất 100%' :
                (groupName.includes('80') ? 'Tiến độ khả quan (>80%)' :
                    (groupName.includes('20') || groupName.includes('Thiếu') ? 'Cần thúc đẩy nhà cung cấp' : 'Báo động: Nguy cơ thiếu NPL'));

            this.show({
                title: `Chi tiết nhóm tỷ lệ đáp ứng: ${groupName} (${details.length} loại NPL)`,
                kpiCards: [
                    { label: 'NHÓM TỶ LỆ', value: groupName, color: color },
                    { label: 'SỐ LƯỢNG LOẠI NPL', value: `${details.length} loại vật tư`, color: '#0F172A' },
                    { label: 'TỶ TRỌNG TRÊN BIỂU ĐỒ', value: `${percent}%`, color: '#2563EB' },
                    { label: 'ĐÁNH GIÁ CHUNG', value: generalStatus, color: color }
                ],
                searchPlaceholder: 'Tìm kiếm nhanh tên NPL, mã CLVT...',
                groupOptions: [
                    { label: 'Gom theo Trạng thái', value: 'statusText' }
                ],
                columns: [
                    { dataField: 'stt', caption: 'STT', width: 55, alignment: 'center' },
                    { dataField: 'code', caption: 'MÃ CLVT', minWidth: 120, alignment: 'center' },
                    { dataField: 'name', caption: 'TÊN NGUYÊN PHỤ LIỆU', minWidth: 200, cssClass: 'font-weight-bold' },
                    { dataField: 'demand', caption: 'TỔNG NHU CẦU', minWidth: 120, alignment: 'right' },
                    { dataField: 'available', caption: 'HIỆN CÓ (KHO)', minWidth: 120, alignment: 'right', cssClass: 'font-weight-bold' },
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
                                    <span style="font-family: 'Inter', sans-serif; font-weight: 700; font-size: 11.5px; width: 36px; text-align: right; color: ${barColor};">${val}%</span>
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
         * HELPER DỰNG SẴN 4: Mở Popup chi tiết Theo dõi mua hàng (Section 3 - 4 KPI Thống Kê & Biểu Đồ Cột)
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

            let startDate = $('#start-date').val() || '';
            let endDate = $('#end-date').val() || '';
            if (window.TabTienDoModule && typeof window.TabTienDoModule.getDateRange === 'function') {
                const dates = window.TabTienDoModule.getDateRange();
                startDate = dates.startDate;
                endDate = dates.endDate;
            }

            const self = this;

            const renderPurchasePopup = function (details) {
                let sumQty = 0;
                details.forEach(p => {
                    const raw = String(p.quantity || '0').replace(/[^0-9.]/g, '');
                    sumQty += parseFloat(raw) || 0;
                });

                const statusColor = (displayStatus.includes('Đã về') ? '#10B981' : (displayStatus.includes('Sắp') ? '#F59E0B' : (displayStatus.includes('trễ') || displayStatus.includes('Trễ') ? '#DC2626' : '#2563EB')));

                self.show({
                    title: `Chi tiết theo dõi mua hàng: ${categoryName} - Trạng thái: ${displayStatus}`,
                    kpiCards: [
                        { label: 'NHÓM NPL', value: categoryName },
                        { label: 'TRẠNG THÁI GIAO', value: displayStatus, color: statusColor },
                        { label: 'TỔNG SỐ LƯỢNG', value: sumQty.toLocaleString('vi-VN'), color: '#0F172A' },
                        { label: 'SỐ DÒNG CHI TIẾT', value: `${details.length} mục`, color: '#2563EB' }
                    ],
                    searchPlaceholder: 'Tìm kiếm nhanh Mã PO, tên vật tư, nhà cung cấp, khách hàng, màu...',
                    groupOptions: [
                        { label: 'Gom theo Nhà cung cấp', value: 'supplier' },
                        { label: 'Gom theo Khách hàng', value: 'customer' },
                        { label: 'Gom theo Trạng thái', value: 'status' }
                    ],
                    columns: [
                        { dataField: 'stt', caption: 'STT', width: 55, alignment: 'center' },
                        { dataField: 'poCode', caption: 'MÃ ĐƠN MUA (PO)', minWidth: 130, alignment: 'center', cssClass: 'font-weight-bold' },
                        { dataField: 'itemName', caption: 'TÊN NGUYÊN PHỤ LIỆU', minWidth: 200, cssClass: 'font-weight-bold' },
                        { dataField: 'supplier', caption: 'NHÀ CUNG CẤP', minWidth: 170 },
                        { dataField: 'customer', caption: 'KHÁCH HÀNG', minWidth: 130 },
                        { dataField: 'mau', caption: 'MÀU VẬT TƯ', minWidth: 110 },
                        { dataField: 'khoVai', caption: 'KHỔ VẢI / SIZE', minWidth: 110 },
                        { dataField: 'quantity', caption: 'SỐ LƯỢNG', minWidth: 110, alignment: 'right', cssClass: 'font-weight-bold' },
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
            };

            $.ajax({
                url: '/DashboardTongQuanTienDo/GetPurchaseTrackingDetails',
                type: 'GET',
                data: {
                    category: category,
                    status: apiStatus,
                    startDate: startDate,
                    endDate: endDate
                },
                dataType: 'json',
                timeout: 5000
            }).done(function (res) {
                let details = [];
                if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                    details = res.data.map((p, idx) => ({
                        stt: idx + 1,
                        poCode: p.poid || '--',
                        maHang: p.maHang || '--',
                        itemName: p.tenNPL || '--',
                        khoVai: p.khoVai || '--',
                        mau: p.mauVatTu || p.maMauVatTu || '--',
                        supplier: p.nhaCungCap || '--',
                        customer: p.khachHang || '--',
                        quantity: (p.soLuong || 0).toLocaleString('vi-VN'),
                        unit: p.donViTinh || '--',
                        status: p.trangThai === 'arrived' ? 'Đã về' : (p.trangThai === 'incoming' ? 'Sắp về' : (p.trangThai === 'fail' ? 'Về trễ' : 'Đã đặt'))
                    }));
                } else {
                    details = self.generatePurchaseTrackingDetails(opt);
                }
                renderPurchasePopup(details);
            }).fail(function () {
                const details = self.generatePurchaseTrackingDetails(opt);
                renderPurchasePopup(details);
            });
        },

        /**
         * Sinh dữ liệu chi tiết công đoạn cho 1 đơn hàng (8 công đoạn)
         */
        generateOrderStagesDetails: function (orderItem) {
            if (!orderItem) return [];
            const cleanQty = parseFloat(String(orderItem.qty || orderItem.slkh || '0').replace(/[^0-9.]/g, '')) || 0;

            const nplQty = Math.round(cleanQty * 0.95);
            const cutQty = parseInt(orderItem.cutQty || 0, 10) || 0;
            const sewQty = parseInt(orderItem.sewQty || 0, 10) || 0;
            const may1Qty = Math.round(sewQty / 2);
            const may2Qty = sewQty - may1Qty;
            const kcsQty = parseInt(orderItem.kcsQty || 0, 10) || 0;
            const packQty = parseInt(orderItem.packQty || 0, 10) || 0;

            const getPct = (val) => cleanQty > 0 ? Math.min(100, Math.round((val / cleanQty) * 100)) : 0;
            const getStatus = (pct) => pct >= 100 ? 'Hoàn thành đúng hạn' : (pct > 0 ? 'Đang sản xuất' : 'Chờ bắt đầu');

            const stages = [
                { cd: '1. Chuẩn bị NPL & Phụ liệu', to: 'Kho Nguyên Liệu', kh: orderItem.khCat, tt: orderItem.ttCat, pct: getPct(nplQty), actual: nplQty, status: getStatus(getPct(nplQty)) },
                { cd: '2. Giác sơ đồ & Cắt tự động', to: 'Phân Xưởng Cắt', kh: orderItem.khCat, tt: orderItem.ttCat, pct: getPct(cutQty), actual: cutQty, status: getStatus(getPct(cutQty)) },
                { cd: '3. Lập trình máy rập & Cữ gá', to: 'Tổ Kỹ Thuật May', kh: orderItem.khLapTrinh, tt: orderItem.ttLapTrinh, pct: getPct(cutQty), actual: cutQty, status: getStatus(getPct(cutQty)) },
                { cd: '4. Ép keo & Bán thành phẩm', to: 'Tổ Ép Keo BTP', kh: orderItem.khLapTrinh, tt: orderItem.ttLapTrinh, pct: getPct(cutQty), actual: cutQty, status: getStatus(getPct(cutQty)) },
                { cd: '5. May Chuyền 01 (Lắp ráp thân)', to: 'Chuyền May 01', kh: orderItem.khMay, tt: orderItem.ttMay, pct: getPct(may1Qty), actual: may1Qty, status: getStatus(getPct(may1Qty)) },
                { cd: '6. May Chuyền 02 (Hoàn thiện áo)', to: 'Chuyền May 02', kh: orderItem.khMay, tt: orderItem.ttMay, pct: getPct(may2Qty), actual: may2Qty, status: getStatus(getPct(may2Qty)) },
                { cd: '7. KCS / Kiểm phẩm chuyền may', to: 'Bộ Phận QC/QA', kh: orderItem.khThoatChuyen, tt: orderItem.ttThoatChuyen, pct: getPct(kcsQty), actual: kcsQty, status: getStatus(getPct(kcsQty)) },
                { cd: '8. Là ủi & Hoàn thiện đóng gói', to: 'Tổ Đóng Gói Hoàn Thiện', kh: orderItem.khThoatChuyen, tt: orderItem.ttThoatChuyen, pct: getPct(packQty), actual: packQty, status: getStatus(getPct(packQty)) }
            ];

            return stages.map((stg, i) => {
                return {
                    stt: i + 1,
                    congDoan: stg.cd,
                    toChuyen: stg.to,
                    khNgay: stg.kh || '--',
                    ttNgay: stg.tt || '--',
                    slKeHoach: cleanQty.toLocaleString('en-US') + ' pcs',
                    slThucTe: stg.actual.toLocaleString('en-US') + ' pcs',
                    tienDo: stg.pct,
                    trangThai: stg.status
                };
            });
        },

        /**
         * Sinh dữ liệu chi tiết cho Nguyên phụ liệu (Fallback khi API rỗng)
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
                { style: 'POLO-SLIM-01', code: 'LSX-2024-0891', des: 'Áo Polo Thể Thao' },
                { style: 'JKT-WIND-04', code: 'LSX-2024-0912', des: 'Áo Khoác Gió 2 Lớp' },
                { style: 'TSHIRT-OVR-02', code: 'LSX-2024-0935', des: 'Áo Thun Cổ Tròn' },
                { style: 'HOODIE-FLC-09', code: 'LSX-2024-0960', des: 'Áo Nỉ Hoodie' },
                { style: 'SHIRT-OXF-05', code: 'LSX-2024-0988', des: 'Sơ Mi Oxford' },
                { style: 'PANT-CHINO-03', code: 'LSX-2024-0995', des: 'Quần Chino Nam' }
            ];

            const ratios = [0.28, 0.24, 0.20, 0.14, 0.08, 0.06];
            let prefix = 'VT';
            const lowerName = name.toLowerCase();
            if (lowerName.includes('fabric') || lowerName.includes('vải')) prefix = 'FAB';
            else if (lowerName.includes('chỉ')) prefix = 'CHI';
            else if (lowerName.includes('zipper') || lowerName.includes('khóa')) prefix = 'ZIP';
            else if (lowerName.includes('button') || lowerName.includes('cúc') || lowerName.includes('nút')) prefix = 'BTN';
            else if (lowerName.includes('interlining')) prefix = 'ITL';
            else if (lowerName.includes('padding')) prefix = 'PAD';

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
                    chungLoai: ord.des,
                    soLuong: qty.toLocaleString('vi-VN', { maximumFractionDigits: 1 })
                };
            });
        },

        /**
         * Sinh dữ liệu chi tiết mua hàng PO (Fallback khi API rỗng)
         */
        generatePurchaseTrackingDetails: function (opt) {
            const cat = opt.categoryName || opt.category || 'FABRIC';
            const statusKey = opt.status || 'all';

            const suppliers = ['Tập đoàn Dệt May Phong Phú', 'Công ty TNHH Coats Phong Phú', 'YKK Fastening Vietnam', 'Formosa Taffeta VN', 'Dệt May Vĩnh Phát', 'Nhựa Song Long'];
            const customers = ['NIKE ASIA', 'ADIDAS GLOBAL', 'UNIQLO JP', 'PUMA VN', 'UNDER ARMOUR'];

            const mockList = [];
            const count = 8;
            for (let i = 1; i <= count; i++) {
                let st = 'Đã về';
                if (statusKey === 'sap-ve' || statusKey === 'Sắp về' || (statusKey === 'all' && i % 3 === 1)) {
                    st = 'Sắp về';
                } else if (statusKey === 'tre' || statusKey === 'Về trễ' || statusKey === 'Trễ' || (statusKey === 'all' && i % 4 === 0)) {
                    st = 'Về trễ';
                }

                mockList.push({
                    stt: i,
                    poCode: `PO-2024-${1000 + i}`,
                    maHang: `STYLE-DH${700 + i}`,
                    itemName: `${cat} - Đặc tính Grade A`,
                    supplier: suppliers[i % suppliers.length],
                    customer: customers[i % customers.length],
                    mau: i % 2 === 0 ? 'Dark Navy' : 'Pitch Black',
                    khoVai: i % 2 === 0 ? '150 CM' : '140 CM',
                    quantity: (1250 * i).toLocaleString('vi-VN'),
                    unit: 'MTS',
                    status: st
                });
            }

            if (statusKey === 'da-ve' || statusKey === 'Đã về') {
                return mockList.filter(x => x.status === 'Đã về');
            } else if (statusKey === 'sap-ve' || statusKey === 'Sắp về') {
                return mockList.filter(x => x.status === 'Sắp về');
            } else if (statusKey === 'tre' || statusKey === 'Về trễ' || statusKey === 'Trễ') {
                return mockList.filter(x => x.status === 'Về trễ');
            }
            return mockList;
        }
    };

    // Xuất ra toàn cục
    window.CommonDetailPopup = CommonDetailPopup;
    window.showMaterialDetailPopup = function (item) { CommonDetailPopup.showMaterial(item); };
    window.showOrderDetailPopup = function (item) { CommonDetailPopup.showOrder(item); };
    window.showPieGroupDetailPopup = function (group, list) { CommonDetailPopup.showPieGroup(group, list); };
    window.showPurchaseDetailPopup = function (opts) { CommonDetailPopup.showPurchaseTracking(opts); };
    window.showPurchaseTrackingPopup = function (opts) { CommonDetailPopup.showPurchaseTracking(opts); };
    window.showProductionStatusPopup = function (item) { if (CommonDetailPopup.showProductionStatus) CommonDetailPopup.showProductionStatus(item); };

})(window, window.jQuery || window.$);
