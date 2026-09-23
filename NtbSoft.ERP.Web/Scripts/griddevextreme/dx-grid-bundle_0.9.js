

(function (window, $) {
    'use strict';

    // 1. TỰ ĐỘNG NẠP CSS NẾU TRANG CHƯA CÓ
    (function autoInjectCss() {
        const cssPath = '/css/griddevextreme/dx-detail-grid.css';
        if (!document.querySelector('link[href*="dx-detail-grid.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = cssPath;
            document.head.appendChild(link);
        }
    })();

    // 2. SINGLETON POPUP & GRID CHO NGUYÊN PHỤ LIỆU
    let sharedNplPopupInstance = null;
    let sharedNplGridInstance = null;
    let lastPopupOpenTime = 0; // Chống mở 2 lần

    function ensureSharedNplPopup() {
        if (sharedNplPopupInstance) return;
        let container = document.getElementById('dx_shared_npl_popup_v09');
        if (!container) {
            container = document.createElement('div');
            container.id = 'dx_shared_npl_popup_v09';
            document.body.appendChild(container);
        }

        sharedNplPopupInstance = $(container).dxPopup({
            title: 'Chi tiết nguyên phụ liệu',
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
                        <div class="dx-popup-kpi-grid">
                            <div class="dx-popup-kpi-card">
                                <span class="dx-popup-kpi-label">LOẠI VẬT TƯ</span>
                                <span class="dx-popup-kpi-val" id="dx_b09_loai_vt">--</span>
                            </div>
                            <div class="dx-popup-kpi-card">
                                <span class="dx-popup-kpi-label">TỔNG NHU CẦU</span>
                                <span class="dx-popup-kpi-val" id="dx_b09_nhucau">0</span>
                            </div>
                            <div class="dx-popup-kpi-card">
                                <span class="dx-popup-kpi-label">HIỆN CÓ / TIẾN ĐỘ</span>
                                <span class="dx-popup-kpi-val" id="dx_b09_daco" style="color: #059669;">0</span>
                            </div>
                        </div>
                        <div class="dx-popup-toolbar">
                            <div class="dx-popup-search-wrap">
                                <i class="fa-solid fa-magnifying-glass"></i>
                                <input type="text" class="dx-popup-search-input" id="dx_b09_search" placeholder="Tìm kiếm nhanh Mã lệnh, Mã hàng, ItemCode, Màu..." />
                            </div>
                            <div class="dx-popup-group-wrap">
                                <span>Gom nhóm:</span>
                                <select class="dx-popup-group-select" id="dx_b09_group">
                                    <option value="">Chi tiết (Không gom)</option>
                                    <option value="maHang">Gom theo Mã hàng</option>
                                    <option value="maLenh">Gom theo Mã lệnh SX</option>
                                    <option value="khachHang">Gom theo Khách hàng</option>
                                </select>
                            </div>
                        </div>
                        <div class="dx-popup-grid-wrapper" id="dx_b09_grid"></div>
                    </div>
                `;
                contentElement.append(html);

                sharedNplGridInstance = $('#dx_b09_grid').dxDataGrid({
                    dataSource: [],
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
                        { dataField: 'soLuong', caption: 'SỐ LƯỢNG', minWidth: 110, alignment: 'right', cssClass: 'font-weight-bold' }
                    ],
                    showBorders: false,
                    rowAlternationEnabled: true,
                    hoverStateEnabled: true,
                    columnAutoWidth: true,
                    paging: { pageSize: 10 },
                    pager: {
                        visible: true,
                        showPageSizeSelector: true,
                        allowedPageSizes: [10, 20, 50],
                        showInfo: true,
                        infoText: 'Trang {0} / {1} (Tổng: {2} dòng)'
                    }
                }).dxDataGrid('instance');

                $('#dx_b09_search').on('input', function () {
                    if (sharedNplGridInstance) sharedNplGridInstance.searchByText($(this).val().trim());
                });

                $('#dx_b09_group').on('change', function () {
                    if (!sharedNplGridInstance) return;
                    const count = sharedNplGridInstance.columnCount();
                    for (let i = 0; i < count; i++) sharedNplGridInstance.columnOption(i, 'groupIndex', undefined);
                    if (this.value) sharedNplGridInstance.columnOption(this.value, 'groupIndex', 0);
                });
            }
        }).dxPopup('instance');
    }

    /**
     * Tự động sinh dữ liệu chi tiết phong phú cho vật liệu (Mockup demo)
     */
    function generateDynamicItems(materialItem) {
        if (!materialItem) return [];
        const name = materialItem.name || materialItem.loaiNPL || 'Vật tư';
        const demandStr = String(materialItem.demand || materialItem.nhuCau || '1,000');
        const rawNum = demandStr.replace(/[^0-9,\.]/g, '').trim();
        let totalVal = parseFloat(rawNum.replace(/\./g, '').replace(',', '.')) || 1000;

        let unit = 'PCS';
        const lower = demandStr.toLowerCase();
        if (lower.includes('m') && !lower.includes('cuộn')) unit = 'MTS';
        else if (lower.includes('cuộn')) unit = 'CUỘN';
        else if (lower.includes('cái')) unit = 'CÁI';
        else if (lower.includes('thùng')) unit = 'THÙNG';
        else if (lower.includes('yds')) unit = 'YDS';
        else if (lower.includes('kg')) unit = 'KG';

        let ordersList = (window.TabTienDoModule && window.TabTienDoModule.allOrders && window.TabTienDoModule.allOrders.length)
            ? window.TabTienDoModule.allOrders.slice(0, 6)
            : [
                { style: 'POLO-SLIM-01', code: 'LSX-2024-0891', des: 'Nguyễn Công Thương' },
                { style: 'JKT-WIND-04', code: 'LSX-2024-0912', des: 'Áo Khoác Gió 2 Lớp' },
                { style: 'TSHIRT-OVR-02', code: 'LSX-2024-0935', des: 'Áo Thun Cổ Tròn' },
                { style: 'HOODIE-FLC-09', code: 'LSX-2024-0960', des: 'Áo Nỉ Hoodie' },
                { style: 'SHIRT-OXF-05', code: 'LSX-2024-0988', des: 'Sơ Mi Oxford' }
            ];

        const ratios = [0.28, 0.24, 0.22, 0.16, 0.10];
        let prefix = 'VT';
        const lowerName = name.toLowerCase();
        if (lowerName.includes('vải')) prefix = 'FAB';
        else if (lowerName.includes('chỉ')) prefix = 'CHI';
        else if (lowerName.includes('khóa')) prefix = 'ZIP';
        else if (lowerName.includes('cúc') || lowerName.includes('nút')) prefix = 'BTN';
        else if (lowerName.includes('thun')) prefix = 'ELAS';
        else if (lowerName.includes('thùng')) prefix = 'CTN';
        else if (lowerName.includes('mác') || lowerName.includes('nhãn')) prefix = 'LBL';

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

    /**
     * Mở Popup chi tiết cho vật tư
     */
    function showMaterialDetailPopup(materialItem) {
        if (!materialItem) return;

        // 👉 CHỐNG MỞ 2 LẦN (DEBOUNCE): Nếu gọi cách nhau dưới 350ms thì bỏ qua
        const now = Date.now();
        if (now - lastPopupOpenTime < 350) return;
        lastPopupOpenTime = now;

        ensureSharedNplPopup();

        const name = materialItem.name || materialItem.loaiNPL || 'Vật tư';
        const demand = materialItem.demand || materialItem.nhuCau || '0';
        const available = materialItem.available || materialItem.daCo || '0';
        const rate = materialItem.rate || materialItem.tiLe || '100%';

        sharedNplPopupInstance.option('title', `Chi tiết nguyên phụ liệu: ${name}`);
        sharedNplPopupInstance.show();

        $('#dx_b09_loai_vt').text(name);
        $('#dx_b09_nhucau').text(demand);
        $('#dx_b09_daco').text(`${available} (${typeof rate === 'number' ? rate + '%' : rate})`);
        $('#dx_b09_search').val('');
        $('#dx_b09_group').val('');

        // Nếu có API Database thực tế
        if (window.API_GET_NPL_DETAIL) {
            sharedNplGridInstance.beginCustomLoading('Đang tải từ Database...');
            $.ajax({
                url: window.API_GET_NPL_DETAIL,
                type: 'GET',
                data: {
                    materialName: name,
                    startDate: $('#start-date').val(),
                    endDate: $('#end-date').val()
                },
                dataType: 'json',
                success: function (res) {
                    const list = Array.isArray(res) ? res : (res.data || []);
                    sharedNplGridInstance.option('dataSource', list.map((it, idx) => Object.assign({ stt: idx + 1 }, it)));
                    sharedNplGridInstance.refresh();
                },
                error: function () {
                    const dynamicData = generateDynamicItems(materialItem);
                    sharedNplGridInstance.option('dataSource', dynamicData);
                    sharedNplGridInstance.refresh();
                },
                complete: function () {
                    sharedNplGridInstance.endCustomLoading();
                }
            });
            return;
        }

        // Mặc định phân bổ dữ liệu động
        const dynamicData = generateDynamicItems(materialItem);
        sharedNplGridInstance.option('dataSource', dynamicData);
        sharedNplGridInstance.refresh();
    }

    // 3. TỰ ĐỘNG GẮN SỰ KIỆN DUY NHẤT
    $(document).ready(function () {
        // Chỉ gắn nếu trang chưa có sự kiện riêng trong dongbo-tab-tiendo.js
        $(document).off('click.dx_bundle_npl').on('click.dx_bundle_npl', '#table-materials tbody tr, .octo-table-clickable-row', function (e) {
            // Nếu đã được xử lý bởi onclick thì không gọi lại
            if (e.target && e.target.closest('.octo-table-clickable-row') && window.__handlingNplClick) return;
            window.__handlingNplClick = true;
            setTimeout(() => { window.__handlingNplClick = false; }, 300);

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
    });

    // 4. GLOBAL EXPORTS
    window.showMaterialDetailPopup = showMaterialDetailPopup;
    window.DxGrid = {
        openDetail: showMaterialDetailPopup,
        version: '0.9-npl-demo'
    };

})(window, window.jQuery || window.$);
