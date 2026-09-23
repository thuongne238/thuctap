/**
 * ==========================================================================
 * NTBSOFT ERP - MODULE TAB 2: TIẾN ĐỘ & CHUẨN BỊ SẢN XUẤT
 * File: dongbo-tab-tiendo.js
 * Quản lý toàn bộ logic nghiệp vụ riêng của Tab 2:
 * - Render dữ liệu mẫu (hoặc nhận dữ liệu DB sau này) cho 2 bảng:
 *   1. Bảng Đơn Hàng & Kế Hoạch Thời Gian (#table-orders)
 *   2. Bảng Tình Hình Nguyên Phụ Liệu (#table-materials)
 * - TỰ ĐỘNG TÍNH TOÁN & KHỞI CHẠY BIỂU ĐỒ TRÒN (#chart-pie-npl) THEO DỮ LIỆU BẢNG NGUYÊN PHỤ LIỆU
 * - Cập nhật 4 thẻ KPI Mua Hàng (#stat-da-dat, #stat-da-ve, #stat-sap-ve, #stat-tre)
 * - Bộ lọc tìm kiếm từng cột trên bảng đơn hàng
 * ==========================================================================
 */
(function (window, $) {
    'use strict';

    let pieChart = null;
    let heatChart = null;

    // =========================================================================
    // 1. DỮ LIỆU MẪU BAN ĐẦU (Sẵn sàng nhận dữ liệu DB sau này)
    // =========================================================================
    const mockOrdersData = [
        {
            code: 'LSX-2024-0891',
            style: 'POLO-SLIM-01',
            des: 'Nguyễn Công Thương',
            slkh: '5200',
            khCat: '10/09',
            ttCat: '10/09',
            khLapTrinh: '12/09',
            ttLapTrinh: '12/09',
            khMay: '15/09',
            ttMay: '15/09',
            khThoatChuyen: '25/09',
            ttThoatChuyen: '25/09'
        },

        {
            code: 'LSX-2024-0912',
            style: 'JKT-WIND-04',
            des: 'Áo Khoác Gió 2 Lớp',
            slkh: '3800',
            khCat: '12/09',
            ttCat: '13/09',
            khLapTrinh: '14/09',
            ttLapTrinh: '15/09',
            khMay: '18/09',
            ttMay: '19/09',
            khThoatChuyen: '28/09',
            ttThoatChuyen: '29/09'
        },
        {
            code: 'LSX-2024-0935',
            style: 'TSHIRT-OVR-02',
            des: 'Áo Thun Cổ Tròn Unisex',
            slkh: '12,000',
            khCat: '08/09',
            ttCat: '08/09',
            khLapTrinh: '10/09',
            ttLapTrinh: '10/09',
            khMay: '12/09',
            ttMay: '12/09',
            khThoatChuyen: '20/09',
            ttThoatChuyen: '20/09'
        },
        {
            code: 'LSX-2024-0960',
            style: 'HOODIE-FLC-09',
            des: 'Áo Nỉ Hoodie Thu Đông',
            slkh: '4,500',
            khCat: '15/09',
            ttCat: '17/09',
            khLapTrinh: '18/09',
            ttLapTrinh: '20/09',
            khMay: '22/09',
            ttMay: '24/09',
            khThoatChuyen: '30/09',
            ttThoatChuyen: '02/10'
        },
        {
            code: 'LSX-2024-0988',
            style: 'SHIRT-OXF-05',
            des: 'Sơ Mi Oxford Dài Tay',
            slkh: '2,600',
            khCat: '18/09',
            ttCat: '18/09',
            khLapTrinh: '20/09',
            ttLapTrinh: '20/09',
            khMay: '23/09',
            ttMay: '--',
            khThoatChuyen: '05/10',
            ttThoatChuyen: '--'
        }
    ];

    const mockMaterialsData = [
        {
            name: 'Vải chính (Cotton 100%)',
            demand: '45,000 m',
            available: '45,000 m',
            rate: 100,
            statusText: 'Đủ 100%',
            chipClass: 'chip-green',
            barColor: '#10B981'
        },
        {
            name: 'Vải lót (Polyester Taffeta)',
            demand: '18,500 m',
            available: '16,650 m',
            rate: 90,
            statusText: 'Đã có 90%',
            chipClass: 'chip-blue',
            barColor: '#3B82F6'
        },
        {
            name: 'Chỉ may (Coats 40/2)',
            demand: '3,200 cuộn',
            available: '2,560 cuộn',
            rate: 80,
            statusText: 'Đã có 80%',
            chipClass: 'chip-blue',
            barColor: '#3B82F6'
        },
        {
            name: 'Khóa kéo (YKK Zipper #5)',
            demand: '15,000 cái',
            available: '9,750 cái',
            rate: 65,
            statusText: 'Thiếu 35%',
            chipClass: 'chip-orange',
            barColor: '#F59E0B'
        },
        {
            name: 'Cúc bấm / Nút áo (Kim loại)',
            demand: '60,000 cái',
            available: '60,000 cái',
            rate: 100,
            statusText: 'Đủ 100%',
            chipClass: 'chip-green',
            barColor: '#10B981'
        },
        {
            name: 'Thun bo cổ / Bo tay',
            demand: '4,000 cái',
            available: '3,800 cái',
            rate: 95,
            statusText: 'Đã có 95%',
            chipClass: 'chip-blue',
            barColor: '#3B82F6'
        },
        {
            name: 'Mác dệt / Nhãn sườn (Main Label)',
            demand: '50,000 cái',
            available: '50,000 cái',
            rate: 100,
            statusText: 'Đủ 100%',
            chipClass: 'chip-green',
            barColor: '#10B981'
        },
        {
            name: 'Túi nilon OPP đóng gói',
            demand: '20,000 cái',
            available: '14,000 cái',
            rate: 70,
            statusText: 'Thiếu 30%',
            chipClass: 'chip-orange',
            barColor: '#F59E0B'
        },
        {
            name: 'Bìa lưng / Khoanh cổ',
            demand: '15,000 cái',
            available: '15,000 cái',
            rate: 100,
            statusText: 'Đủ 100%',
            chipClass: 'chip-green',
            barColor: '#10B981'
        },
        {
            name: 'Thùng carton 5 lớp',
            demand: '1,200 thùng',
            available: '1,000 thùng',
            rate: 83,
            statusText: 'Đã có 83%',
            chipClass: 'chip-blue',
            barColor: '#3B82F6'
        },
        {
            name: 'Keo ép / Mex dựng cổ',
            demand: '5,000 m',
            available: '2,000 m',
            rate: 40,
            statusText: 'Trễ hạn',
            chipClass: 'chip-red',
            barColor: '#EF4444'
        }
    ];

    // =========================================================================
    // 2. TAB TIẾN ĐỘ MODULE OBJECT
    // =========================================================================
    const TabTienDoModule = {
        allOrders: [...mockOrdersData],
        allMaterials: [...mockMaterialsData],
        currentMaterials: mockMaterialsData,

        ordersGridInstance: null,
        materialsGridInstance: null,

        // Khởi tạo toàn bộ tab
        init: function () {
            this.renderAllData();
            this.initCharts();
            this.bindWindowResize();
            this.bindTabButtons();
        },

        // Render toàn bộ dữ liệu ra 2 bảng và các thẻ KPI
        renderAllData: function () {
            this.renderOrdersTable();
            this.renderMaterialsTable();
            this.renderKpiStats();
        },

        // =====================================================================
        // 2.1. BẢNG 1: ĐƠN HÀNG & THỜI GIAN (OrdersGridComponent)
        // =====================================================================
        renderOrdersTable: function (orders) {
            if (orders) {
                this.allOrders = [...orders];
            }
            if (window.OrdersGridComponent) {
                this.ordersGridInstance = window.OrdersGridComponent.init('grid-orders-container', this.allOrders, {
                    onRowClick: function (e) {
                        if (e.data && window.CommonDetailPopup) {
                            window.CommonDetailPopup.showOrder(e.data);
                        } else if (e.data && typeof window.showOrderDetailPopup === 'function') {
                            window.showOrderDetailPopup(e.data);
                        }
                    }
                });
            } else {
                console.warn('[TabTienDo] OrdersGridComponent chưa được tải, kiểm tra script tag orders-grid-component.js');
            }
        },

        // =====================================================================
        // 2.2. BẢNG 2: TÌNH HÌNH NGUYÊN PHỤ LIỆU (MaterialsGridComponent)
        // =====================================================================
        renderMaterialsTable: function (materials) {
            if (materials) {
                this.allMaterials = [...materials];
                this.currentMaterials = materials;
            }
            const data = this.allMaterials || mockMaterialsData;
            this.currentMaterials = data;

            if (window.MaterialsGridComponent) {
                this.materialsGridInstance = window.MaterialsGridComponent.init('grid-materials-container', data, {
                    onRowClick: function (e) {
                        if (e.data && typeof window.showMaterialDetailPopup === 'function') {
                            window.showMaterialDetailPopup(e.data);
                        }
                    }
                });
            } else {
                console.warn('[TabTienDo] MaterialsGridComponent chưa được tải, kiểm tra script tag materials-grid-component.js');
            }

            // 👉 Kích hoạt vẽ lại biểu đồ tròn ngay theo toàn bộ dữ liệu NPL
            this.updatePieChartFromMaterials(data);
        },

        // =========================================================================
        // 3. TÍNH TOÁN VÀ KHỞI CHẠY BIỂU ĐỒ TRÒN DỰA THEO DỮ LIỆU NGUYÊN PHỤ LIỆU
        // =========================================================================
        updatePieChartFromMaterials: function (materials) {
            const data = materials || this.currentMaterials || mockMaterialsData;
            this.currentMaterials = data;

            const pieDom = document.getElementById('chart-pie-npl');
            if (!pieDom) return;

            if (typeof echarts === 'undefined') {
                setTimeout(() => TabTienDoModule.updatePieChartFromMaterials(data), 200);
                return;
            }

            if (!pieChart) {
                pieChart = echarts.getInstanceByDom(pieDom) || echarts.init(pieDom);
            }

            // Phân loại tự động các nhóm từ danh sách NPL thực tế hiển thị trên bảng
            let du100 = 0, tren80 = 0, thieu = 0, tre = 0;
            let listDu100 = [], listTren80 = [], listThieu = [], listTre = [];

            data.forEach(item => {
                const rate = typeof item.rate === 'number' ? item.rate : parseFloat(item.rate) || 0;
                if (rate >= 100) {
                    du100++;
                    listDu100.push(`${item.name} (${rate}%)`);
                } else if (rate >= 80) {
                    tren80++;
                    listTren80.push(`${item.name} (${rate}%)`);
                } else if (rate >= 50) {
                    thieu++;
                    listThieu.push(`${item.name} (${rate}%)`);
                } else {
                    tre++;
                    listTre.push(`${item.name} (${rate}%)`);
                }
            });

            const total = data.length || 1;
            const seriesData = [];

            if (du100 > 0) {
                seriesData.push({
                    value: du100,
                    name: 'Đủ 100% NPL',
                    percent: Math.round((du100 / total) * 100),
                    items: listDu100,
                    itemStyle: { color: '#10B981' }
                });
            }
            if (tren80 > 0) {
                seriesData.push({
                    value: tren80,
                    name: 'Đã có >80%',
                    percent: Math.round((tren80 / total) * 100),
                    items: listTren80,
                    itemStyle: { color: '#3B82F6' }
                });
            }
            if (thieu > 0) {
                seriesData.push({
                    value: thieu,
                    name: 'Thiếu 20-30%',
                    percent: Math.round((thieu / total) * 100),
                    items: listThieu,
                    itemStyle: { color: '#F59E0B' }
                });
            }
            if (tre > 0) {
                seriesData.push({
                    value: tre,
                    name: 'Trễ hạn',
                    percent: Math.round((tre / total) * 100),
                    items: listTre,
                    itemStyle: { color: '#EF4444' }
                });
            }

            // Cấu hình biểu đồ tròn với Tooltip tương tác hiển thị rõ từng loại NPL
            const pieOption = {
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'item',
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderWidth: 1,
                    textStyle: { color: '#0F172A', fontFamily: 'Inter', fontSize: 12 },
                    formatter: function (params) {
                        const d = params.data;
                        let tip = `<div style="font-weight: 700; margin-bottom: 4px; color: ${d.itemStyle.color};">${d.name}: ${d.value}/${total} loại NPL (${params.percent}%)</div>`;
                        if (d.items && d.items.length) {
                            tip += '<div style="font-size: 11px; color: #475569; line-height: 1.4;">' + d.items.map(it => '&bull; ' + it).join('<br/>') + '</div>';
                        }
                        return tip;
                    }
                },
                legend: {
                    orient: 'horizontal',
                    bottom: '2px',
                    left: 'center',
                    textStyle: { color: '#334155', fontSize: 11, fontFamily: 'Inter', fontWeight: '600' },
                    itemWidth: 10,
                    itemHeight: 10,
                    itemGap: 12
                },
                series: [
                    {
                        name: 'Tỷ Lệ Đáp Ứng NPL',
                        type: 'pie',
                        radius: ['45%', '72%'],
                        center: ['50%', '42%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 4,
                            borderColor: '#FFFFFF',
                            borderWidth: 2
                        },
                        label: { show: false, position: 'center' },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: 13,
                                fontWeight: 'bold',
                                color: '#0F172A',
                                fontFamily: 'Inter'
                            }
                        },
                        labelLine: { show: false },
                        data: seriesData
                    }
                ]
            };

            pieChart.setOption(pieOption, true);
            pieChart.resize();
        },

        // Cập nhật 4 thẻ KPI Mua Hàng
        renderKpiStats: function () {
            const elDaDat = document.getElementById('stat-da-dat');
            const elDaVe = document.getElementById('stat-da-ve');
            const elSapVe = document.getElementById('stat-sap-ve');
            const elTre = document.getElementById('stat-tre');
            if (elDaDat) elDaDat.innerText = '141,700';
            if (elDaVe) elDaVe.innerText = '133,960';
            if (elSapVe) elSapVe.innerText = '8,740';
            if (elTre) elTre.innerText = '2,500';
        },

        // Khởi tạo các biểu đồ ECharts
        initCharts: function () {
            if (typeof echarts === 'undefined') {
                console.warn('[TabTienDo] Đang chờ thư viện ECharts tải...');
                setTimeout(() => TabTienDoModule.initCharts(), 250);
                return;
            }

            // 1. Khởi chạy biểu đồ tròn theo thông tin của bảng NPL
            this.updatePieChartFromMaterials(this.currentMaterials);

            // 2. Biểu đồ nhiệt / thanh ngang: Theo Dõi Mua Hàng NPL
            const heatDom = document.getElementById('chart-heatmap-purchase');
            if (heatDom) {
                if (!heatChart) {
                    heatChart = echarts.getInstanceByDom(heatDom) || echarts.init(heatDom);
                }
                const heatOption = {
                    backgroundColor: 'transparent',
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: { type: 'shadow' },
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E2E8F0',
                        textStyle: { color: '#0F172A', fontFamily: 'JetBrains Mono', fontWeight: 'bold' }
                    },
                    legend: {
                        data: ['Đã về', 'Sắp về', 'Về trễ'],
                        top: '0px',
                        right: '10px',
                        textStyle: { color: '#334155', fontFamily: 'Inter', fontSize: 11, fontWeight: '600' },
                        itemWidth: 12,
                        itemHeight: 10,
                        itemGap: 10
                    },
                    grid: {
                        top: '26px',
                        left: '2%',
                        right: '3%',
                        bottom: '2px',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'value',
                        axisLine: { lineStyle: { color: '#CBD5E1' } },
                        splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
                        axisLabel: { color: '#64748B', fontFamily: 'JetBrains Mono', fontSize: 10.5 }
                    },
                    yAxis: {
                        type: 'category',
                        data: ['Vải Chính', 'Vải Lót', 'Chỉ May', 'Khóa Kéo', 'Cúc Kim Loại', 'Bao Bì'],
                        axisLine: { lineStyle: { color: '#CBD5E1' } },
                        axisLabel: { color: '#1E293B', fontFamily: 'Inter', fontSize: 11.5, fontWeight: '600' }
                    },
                    series: [
                        {
                            name: 'Đã về',
                            type: 'bar',
                            barWidth: 13,
                            stack: 'total',
                            label: { show: true, formatter: '{c}', color: '#FFFFFF', fontSize: 9.5, fontFamily: 'JetBrains Mono', fontWeight: 'bold' },
                            itemStyle: { color: '#10B981', borderRadius: [0, 0, 0, 0] },
                            data: [45000, 16650, 2560, 9750, 60000, 12000]
                        },
                        {
                            name: 'Sắp về',
                            type: 'bar',
                            barWidth: 13,
                            stack: 'total',
                            label: { show: true, formatter: '{c}', color: '#FFFFFF', fontSize: 9.5, fontFamily: 'JetBrains Mono', fontWeight: 'bold' },
                            itemStyle: { color: '#F59E0B' },
                            data: [0, 1850, 640, 3250, 0, 3000]
                        },
                        {
                            name: 'Về trễ',
                            type: 'bar',
                            barWidth: 13,
                            stack: 'total',
                            label: { show: true, formatter: '{c}', color: '#FFFFFF', fontSize: 9.5, fontFamily: 'JetBrains Mono', fontWeight: 'bold' },
                            itemStyle: { color: '#EF4444', borderRadius: [0, 3, 3, 0] },
                            data: [0, 0, 0, 2000, 0, 500]
                        }
                    ]
                };
                heatChart.setOption(heatOption, true);
                heatChart.resize();
            }
        },

        // Kích hoạt khi chuyển sang tab Tiến độ hoặc khi trang tải xong
        activate: function () {
            this.renderAllData();
            if (this.ordersGridInstance) this.ordersGridInstance.repaint();
            if (this.materialsGridInstance) this.materialsGridInstance.repaint();
            setTimeout(() => TabTienDoModule.initCharts(), 50);
            setTimeout(() => TabTienDoModule.initCharts(), 200);
        },

        // Làm mới dữ liệu tab Tiến độ khi bấm Refresh hoặc đổi ngày
        reload: function () {
            this.renderAllData();
            this.initCharts();
        },

        // Gắn sự kiện co giãn cửa sổ tự động resize biểu đồ và Grid
        bindWindowResize: function () {
            const self = this;
            window.addEventListener('resize', function () {
                if (pieChart) pieChart.resize();
                if (heatChart) heatChart.resize();
                if (self.ordersGridInstance) self.ordersGridInstance.repaint();
                if (self.materialsGridInstance) self.materialsGridInstance.repaint();
            });
        },

        // Bộ lọc tìm kiếm: DevExtreme tự động quản lý qua filterRow
        bindTableFilter: function () { },

        // Gắn sự kiện chuyển đổi tab cho 2 nút trên Header (Tình hình sản xuất & Tiến độ sản xuất)
        bindTabButtons: function () {
            $(document).off('click.tabSwitch', '#btn-side-tinh-hinh, #btn-side-tien-do')
                .on('click.tabSwitch', '#btn-side-tinh-hinh, #btn-side-tien-do', function (e) {
                    const targetTab = $(this).attr('data-tab') || $(this).attr('data-side');
                    if (!targetTab) return;

                    const targetPane = $('#tab-content-' + targetTab);
                    if (targetPane.length > 0) {
                        e.preventDefault();
                        $('.side-nav-btn').removeClass('active');
                        $(this).addClass('active');

                        $('.dashboard-tab-pane').removeClass('active-tab');
                        targetPane.addClass('active-tab');

                        // Phát sự kiện toàn cục để các tab tự kích hoạt / vẽ lại biểu đồ
                        $(document).trigger('dashboard:tabChanged', { tab: targetTab });

                        if (targetTab === 'tien-do') {
                            setTimeout(() => {
                                if (TabTienDoModule.ordersGridInstance) TabTienDoModule.ordersGridInstance.repaint();
                                if (TabTienDoModule.materialsGridInstance) TabTienDoModule.materialsGridInstance.repaint();
                            }, 60);
                        }
                    }
                });
        },

        // Hàm chuyển tab tiện ích qua JS: TabTienDoModule.switchTab('tinh-hinh') hoặc 'tien-do'
        switchTab: function (tabName) {
            const btn = document.querySelector(`.side-nav-btn[data-tab="${tabName}"], .side-nav-btn[data-side="${tabName}"]`);
            if (btn) {
                btn.click();
            }
        }
    };

    // Xuất module ra window toàn cục
    window.TabTienDoModule = TabTienDoModule;

    $(document).ready(function () {
        TabTienDoModule.init();
    });

})(window, window.jQuery || window.$);
