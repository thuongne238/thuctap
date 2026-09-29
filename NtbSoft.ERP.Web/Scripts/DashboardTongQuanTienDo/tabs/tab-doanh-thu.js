/**
 * ==========================================================================
 * NTBSOFT ERP - MODULE TAB DOANH THU
 * File: tab-doanh-thu.js
 * ==========================================================================
 */
$(document).ready(function () {

    // ----------------------------------------------------
    // HELPER FORMAT TIEN - file-level scope
    // ----------------------------------------------------
    var formatVND = function (num) {
        return new Intl.NumberFormat('vi-VN').format(num || 0);
    };

    // ----------------------------------------------------
    // TAB DOANH THU APP
    // ----------------------------------------------------
    var TabDoanhThuApp = function () {
        this.cachedData = null;
        this.init();
    };

    TabDoanhThuApp.prototype.init = function () {
        var self = this;

        // Lắng nghe sự kiện tab thay đổi (từ _Layout.cshtml)
        $(document).on('dashboard:tabChanged', function (e, params) {
            if (params && params.tab === 'doanh-thu') {
                self.loadData();
            }
        });

        // Lắng nghe sự kiện ngày thay đổi từ header
        $(document).on('dashboard:dateChanged', function (e, params) {
            if ($('#tab-content-doanh-thu').hasClass('active-tab') && params) {
                self.loadData(params.startDate, params.endDate);
            }
        });

        // Load ngay nếu tab này đang active
        if ($('#tab-content-doanh-thu').hasClass('active-tab')) {
            setTimeout(function () {
                self.loadData();
            }, 200);
        }

        // Click KPI card để xem chi tiết
        $(document).on('click', '.tqth-doanhthu-card', function () {
            self.showRevenueDetail();
        });
        $('.tqth-doanhthu-card').css('cursor', 'pointer');
    };

    // Lấy ngày từ input header hoặc fallback tháng hiện tại
    TabDoanhThuApp.prototype.getDateRange = function () {
        var startVal = $('#start-date').val();
        var endVal = $('#end-date').val();
        if (startVal && endVal) {
            return { startDate: startVal, endDate: endVal };
        }
        var now = new Date();
        var m = String(now.getMonth() + 1).padStart(2, '0');
        var y = now.getFullYear();
        var lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
        return {
            startDate: '01/' + m + '/' + y,
            endDate: String(lastDay).padStart(2, '0') + '/' + m + '/' + y
        };
    };

    TabDoanhThuApp.prototype.loadData = function (startDate, endDate) {
        var self = this;

        if (!startDate || !endDate) {
            var dr = self.getDateRange();
            startDate = dr.startDate;
            endDate = dr.endDate;
        }

        // Hiện spinner cho KPI
        $('#kpi-val-revenue-current, #kpi-val-revenue-target, #kpi-val-revenue-prev, #kpi-val-revenue-growth')
            .html('<i class="fa-solid fa-spinner fa-spin text-muted"></i>');

        // CHỈ DÙNG MOCK DATA VÌ BACKEND CHƯA XONG
        setTimeout(function() {
            var data = {
                currentRevenue: 15500000000,
                targetRevenue: 18000000000,
                prevRevenue: 14200000000,
                revenueGrowth: 9.15,
                topCustomers: [
                    { KhachHang: "ADIDAS AG", TongDoanhThuThucTe: 4500000000, pct: "29%" },
                    { KhachHang: "NIKE INC", TongDoanhThuThucTe: 3800000000, pct: "24.5%" },
                    { KhachHang: "PUMA SE", TongDoanhThuThucTe: 2100000000, pct: "13.5%" },
                    { KhachHang: "UNDER ARMOUR", TongDoanhThuThucTe: 1500000000, pct: "9.6%" }
                ],
                revenueByOrder: [
                    { MaDH: "DH-00123", PO: "PO-AD-01", KhachHang: "ADIDAS AG", DoanhThu: 1200000000, TrangThai: "Hoàn thành" },
                    { MaDH: "DH-00124", PO: "PO-NK-05", KhachHang: "NIKE INC", DoanhThu: 950000000, TrangThai: "Đang sản xuất" },
                    { MaDH: "DH-00125", PO: "PO-PM-02", KhachHang: "PUMA SE", DoanhThu: 820000000, TrangThai: "Đang sản xuất" }
                ],
                monthlyRevenue: [
                    { Thang: "Tháng 4", actual: 12000000000, target: 13000000000 },
                    { Thang: "Tháng 5", actual: 14000000000, target: 14500000000 },
                    { Thang: "Tháng 6", actual: 13500000000, target: 15000000000 },
                    { Thang: "Tháng 7", actual: 16000000000, target: 15500000000 },
                    { Thang: "Tháng 8", actual: 14200000000, target: 16000000000 },
                    { Thang: "Tháng 9", actual: 15500000000, target: 18000000000 }
                ],
                lineRevenue: [
                    { Chuyen: "Chuyền 1", actual: 3500000000, target: 4000000000 },
                    { Chuyen: "Chuyền 2", actual: 2800000000, target: 3000000000 },
                    { Chuyen: "Chuyền 3", actual: 4100000000, target: 4000000000 },
                    { Chuyen: "Chuyền 4", actual: 1900000000, target: 2500000000 },
                    { Chuyen: "Chuyền 5", actual: 3200000000, target: 4500000000 }
                ]
            };

            self.cachedData = data;
            self.renderKPIs(data);
            self.renderGrids(data);
            self.renderCharts(data);
        }, 500); // delay nửa giây để thấy hiệu ứng tải
    };

    TabDoanhThuApp.prototype.showRevenueDetail = function () {
        if (!this.cachedData || !this.cachedData.revenueByOrder || this.cachedData.revenueByOrder.length === 0) {
            alert("Chưa có dữ liệu chi tiết doanh thu.");
            return;
        }

        if (window.CommonDetailPopup) {
            window.CommonDetailPopup.show({
                title: 'Chi Tiết Doanh Thu Theo Đơn Hàng',
                kpiCards: [],
                searchPlaceholder: 'Tìm kiếm PO, Khách hàng...',
                groupOptions: [
                    { label: 'Gom nhóm theo Khách hàng', value: 'KhachHang' },
                    { label: 'Gom nhóm theo Trạng thái', value: 'TrangThai' }
                ],
                columns: [
                    { dataField: 'MaDH', caption: 'MÃ ĐƠN HÀNG', minWidth: 150 },
                    { dataField: 'PO', caption: 'PO NO.', minWidth: 150 },
                    { dataField: 'KhachHang', caption: 'KHÁCH HÀNG', minWidth: 200 },
                    { 
                        dataField: 'DoanhThu', 
                        caption: 'DOANH THU', 
                        minWidth: 150, 
                        alignment: 'right', 
                        format: { type: 'fixedPoint', precision: 0 } 
                    },
                    { dataField: 'TrangThai', caption: 'TRẠNG THÁI', minWidth: 120, alignment: 'center' }
                ],
                dataSource: this.cachedData.revenueByOrder
            });
        }
    };

    TabDoanhThuApp.prototype.renderKPIs = function (data) {
        var growth = parseFloat(data.revenueGrowth) || 0;
        var growthStr = growth.toFixed(1) + '%';

        $('#kpi-val-revenue-current').text(formatVND(data.currentRevenue));
        $('#kpi-val-revenue-target').text(formatVND(data.targetRevenue));
        $('#kpi-val-revenue-prev').text(formatVND(data.prevRevenue));

        var $g = $('#kpi-val-revenue-growth');
        $g.empty().text(growthStr);

        if (growth > 0) {
            $g.css('color', 'var(--octo-green)');
            $g.prepend('<i class="fa-solid fa-arrow-up" style="margin-right:4px;font-size:0.8em;"></i>');
        } else if (growth < 0) {
            $g.css('color', 'var(--octo-red)');
            $g.prepend('<i class="fa-solid fa-arrow-down" style="margin-right:4px;font-size:0.8em;"></i>');
        } else {
            $g.css('color', 'var(--octo-slate-500, #64748b)');
        }
    };

    TabDoanhThuApp.prototype.renderGrids = function (data) {
        if (typeof DevExpress === 'undefined') { console.warn('[DoanhThu] DevExpress chua duoc tai'); return; }

        // Grid 1: Top Customers - dispose truoc khi init lai
        var $topCust = $('#grid-revenue-top-customers');
        if ($topCust.length) {
            var existTopCust = null;
            try { existTopCust = $topCust.dxDataGrid('instance'); } catch(e) {}
            if (existTopCust) { try { existTopCust.dispose(); } catch(e) {} }
            $topCust.dxDataGrid({
            dataSource: data.topCustomers || [],
            keyExpr: 'KhachHang',
            showBorders: true,
            showColumnLines: true,
            showRowLines: true,
            columns: [
                {
                    dataField: 'KhachHang',
                    caption: 'KHÁCH HÀNG',
                    width: 150,
                    cellTemplate: function (container, options) {
                        $('<div style="font-weight:700; color:#0f172a;">').text(options.value || '').appendTo(container);
                    }
                },
                {
                    dataField: 'TongDoanhThuThucTe',
                    caption: 'DOANH THU (VND)',
                    alignment: 'right',
                    format: { type: 'fixedPoint', precision: 0 },
                    cellTemplate: function (container, options) {
                        $('<div style="color:#0f172a; font-weight:600;">').text(formatVND(options.value)).appendTo(container);
                    }
                },
                {
                    dataField: 'pct',
                    caption: 'TY TRONG',
                    alignment: 'center',
                    width: 90,
                    cellTemplate: function (container, options) {
                        $('<div style="color:#0f172a; font-weight:600;">').text(options.text || '').appendTo(container);
                    }
                }
            ]
        });
        } // end if $topCust.length

        // Grid 2: Doanh Thu theo Don Hang - dispose truoc khi init lai
        var $byOrder = $('#grid-revenue-by-order');
        if ($byOrder.length) {
            var existByOrder = null;
            try { existByOrder = $byOrder.dxDataGrid('instance'); } catch(e) {}
            if (existByOrder) { try { existByOrder.dispose(); } catch(e) {} }
            $byOrder.dxDataGrid({
            dataSource: data.revenueByOrder || [],
            keyExpr: 'MaDH',
            showBorders: true,
            showColumnLines: true,
            showRowLines: true,
            rowAlternationEnabled: false,
            searchPanel: { visible: true, width: 250, placeholder: 'Tim kiem...' },
            paging: { pageSize: 10 },
            pager: { showPageSizeSelector: true, allowedPageSizes: [5, 10, 20], showInfo: true },
            columns: [
                { dataField: 'MaDH', caption: 'MA DON HANG', width: 150,
                    cellTemplate: function (container, options) { $('<div class="ppw-col-ordercode">').text(options.value || '').appendTo(container); } },
                { dataField: 'PO', caption: 'PO NO.', width: 150,
                    cellTemplate: function (container, options) { $('<div class="ppw-col-po">').text(options.value || '').appendTo(container); } },
                { dataField: 'KhachHang', caption: 'KHACH HANG', minWidth: 200,
                    cellTemplate: function (container, options) { $('<div class="ppw-col-cust">').text(options.value || '').appendTo(container); } },
                { dataField: 'DoanhThu', caption: 'DOANH THU (VND)', alignment: 'right', width: 180,
                    format: { type: 'fixedPoint', precision: 0 },
                    cellTemplate: function (container, options) { $('<div style="color:#0f172a;font-weight:600;">').text(formatVND(options.value)).appendTo(container); } },
                { dataField: 'TrangThai', caption: 'TRANG THAI', alignment: 'center', width: 150,
                    cellTemplate: function (container, options) { $('<span class="octo-chip chip-blue">').text(options.value || '').appendTo(container); } }
            ]
        });
        } // end if $byOrder.length
    };

    TabDoanhThuApp.prototype.renderCharts = function (data) {
        if (typeof echarts === 'undefined') { console.warn('[DoanhThu] ECharts chua duoc tai'); return; }

        var monthlyCategories = (data.monthlyRevenue || []).map(function(x) { return x.Thang; });
        var monthlyActual     = (data.monthlyRevenue || []).map(function(x) { return x.actual; });
        var monthlyTarget     = (data.monthlyRevenue || []).map(function(x) { return x.target; });

        var lineCategories = (data.lineRevenue || []).map(function(x) { return x.Chuyen; });
        var lineActual     = (data.lineRevenue || []).map(function(x) { return x.actual; });
        var lineTarget     = (data.lineRevenue || []).map(function(x) { return x.target; });

        var pieData = (data.topCustomers || []).map(function(x) {
            return { name: x.KhachHang || '', value: x.TongDoanhThuThucTe || 0 };
        });

        // 1. Bar Chart
        var barChartElem = document.getElementById('revenue-bar-chart');
        var barChart = null;
        if (barChartElem) {
            var existBar = echarts.getInstanceByDom(barChartElem);
            if (existBar) { existBar.dispose(); }
            barChart = echarts.init(barChartElem);
            barChart.setOption({
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                legend: { data: ['Muc tieu', 'Thuc te'], bottom: 0 },
                grid: { left: '3%', right: '4%', bottom: '12%', top: '5%', containLabel: true },
                xAxis: [{ type: 'category', data: monthlyCategories }],
                yAxis: [{ type: 'value', name: 'Ty VND',
                    axisLabel: { formatter: function (v) { return (v / 1000000000).toFixed(1); } }
                }],
                series: [
                    { name: 'Muc tieu', type: 'bar', itemStyle: { color: '#94a3b8' }, data: monthlyTarget },
                    { name: 'Thuc te',  type: 'bar', itemStyle: { color: '#2563eb' }, data: monthlyActual }
                ]
            });
        }

        // 2. Horizontal Bar Chart (Chuyen)
        var lineChartElem = document.getElementById('revenue-line-chart');
        var lineChart = null;
        if (lineChartElem) {
            var existLine = echarts.getInstanceByDom(lineChartElem);
            if (existLine) { existLine.dispose(); }
            lineChart = echarts.init(lineChartElem);
            lineChart.setOption({
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                legend: { data: ['Muc tieu', 'Thuc te'], bottom: 0 },
                grid: { left: '3%', right: '4%', bottom: '12%', top: '5%', containLabel: true },
                xAxis: [{ type: 'value', name: 'Ty VND',
                    axisLabel: { formatter: function (v) { return (v / 1000000000).toFixed(1); } }
                }],
                yAxis: [{ type: 'category', data: lineCategories, inverse: true }],
                series: [
                    { name: 'Muc tieu', type: 'bar', itemStyle: { color: '#cbd5e1' }, data: lineTarget },
                    { name: 'Thuc te',  type: 'bar', itemStyle: { color: '#10b981' }, data: lineActual }
                ]
            });
        }

        // 3. Pie Chart
        var pieChartElem = document.getElementById('revenue-pie-chart');
        var pieChart = null;
        if (pieChartElem) {
            var existPie = echarts.getInstanceByDom(pieChartElem);
            if (existPie) { existPie.dispose(); }
            pieChart = echarts.init(pieChartElem);
            var pieOption = {
                backgroundColor: 'transparent',
                color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'],
                tooltip: {
                    trigger: 'item',
                    backgroundColor: '#FFFFFF',
                    borderColor: '#CBD5E1',
                    borderWidth: 1,
                    padding: [8, 12],
                    textStyle: { color: '#0F172A', fontFamily: 'Inter', fontSize: 14 },
                    formatter: function (params) {
                        return '<div style="font-weight:800;font-size:15px;margin-bottom:4px;color:' + params.color + ';">' + params.name + '</div>' +
                               '<div style="font-size:13px;color:#475569;">' + formatVND(params.value) + ' VND (' + params.percent + '%)</div>';
                    }
                },
                legend: {
                    orient: 'horizontal',
                    bottom: '0px',
                    left: 'center',
                    textStyle: { color: '#1E293B', fontSize: 14.5, fontFamily: 'Inter', fontWeight: '800' },
                    itemWidth: 12,
                    itemHeight: 12,
                    itemGap: 14,
                    type: 'scroll'
                },
                graphic: [
                    {
                        type: 'text', left: 'center', top: '39%',
                        style: { text: 'TOP', fill: '#0F172A', fontSize: 32, fontWeight: '800', fontFamily: 'Inter', textAlign: 'center' }
                    },
                    {
                        type: 'text', left: 'center', top: '56%',
                        style: { text: 'Khách hàng', fill: '#64748B', fontSize: 13.5, fontWeight: '600', fontFamily: 'Inter', textAlign: 'center' }
                    }
                ],
                series: [
                    {
                        name: 'Khách hàng',
                        type: 'pie',
                        radius: ['50%', '76%'],
                        center: ['50%', '46%'],
                        avoidLabelOverlap: true,
                        itemStyle: { borderRadius: 6, borderColor: '#FFFFFF', borderWidth: 2 },
                        label: { show: true, position: 'outside', formatter: '{b}\n{d}%', fontSize: 14, fontFamily: 'Inter', fontWeight: '800', color: '#0F172A', lineHeight: 16 },
                        labelLine: { show: true, smooth: 0.2, length: 10, length2: 12 },
                        emphasis: {
                            scale: true,
                            scaleSize: 6,
                            itemStyle: {
                                shadowBlur: 12,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.25)'
                            }
                        },
                        data: pieData
                    }
                ]
            };
            pieChart.setOption(pieOption);
        }

        window.addEventListener('resize', function () {
            if (barChart) barChart.resize();
            if (lineChart) lineChart.resize();
            if (pieChart) pieChart.resize();
        });
    };

    window.TabDoanhThuApp = new TabDoanhThuApp();
});


