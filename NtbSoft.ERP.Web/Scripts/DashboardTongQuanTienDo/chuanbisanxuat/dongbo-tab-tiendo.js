/**
 * ==========================================================================
 * NTBSOFT ERP - MODULE TAB TIẾN ĐỘ & CHUẨN BỊ SẢN XUẤT
 * File: dongbo-tab-tiendo.js
 * Quản lý logic nghiệp vụ và nạp dữ liệu TRỰC TIẾP TỪ DATABASE:
 *
 * SP chính: sp_TienDo_BaoCaoDonHangVaSanXuat_Action
 *   Action SAN_LUONG_DON_HANG → API: /DashboardTongQuanTienDo/GetGanttData
 *   Action CHI_TIET_PO        → API: /DashboardTongQuanTienDo/GetPODetails
 *   Action TIEN_DO_GIAO_HANG  → API: /DashboardTongQuanTienDo/GetShipmentStats
 *
 * SP NPL: sp_TienDo_BaoCaoNhuCauTonKho_Action
 *   Action NHU_CAU_VAT_TU_TONG_HOP + TON_KHO_NPL → API: /DashboardTongQuanTienDo/GetMaterialsData
 *   Action CHI_TIET_NHU_CAU                       → API: /DashboardTongQuanTienDo/GetMaterialStatusDetails
 *
 * SP Mua hàng: sp_TienDo_BaoCaoMuaHangNPL_Action
 *   Action THONG_KE_SO_LUONG + TONG_HOP_TRANG_THAI → API: /DashboardTongQuanTienDo/GetPurchaseTrackingData
 *   Action CHI_TIET_MUA_HANG                        → API: /DashboardTongQuanTienDo/GetPurchaseTrackingDetails
 * ==========================================================================
 */
(function (window, $) {
    'use strict';

    let pieChart = null;
    let heatChart = null;

    const TabTienDoModule = {
        allOrders: [],
        allMaterials: [],
        currentMaterials: [],
        purchaseItems: [],

        ordersGridInstance: null,
        materialsGridInstance: null,

        // =====================================================================
        // 1. KHỞI TẠO MODULE
        // =====================================================================
        init: function () {
            this.loadAllDataFromDb();
            this.bindWindowResize();
            this.bindTabButtons();
            this.bindPurchaseKpiClicks();
            this.bindGlobalEvents();
        },

        // Helper lấy khoảng thời gian đang chọn trên Header
        getDateRange: function () {
            let start = $('#start-date').val();
            let end = $('#end-date').val();
            if (!start || !end) {
                const now = new Date();
                const y = now.getFullYear();
                const m = String(now.getMonth() + 1).padStart(2, '0');
                const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
                start = `01/${m}/${y}`;
                end = `${lastDay}/${m}/${y}`;
            }
            return { startDate: start, endDate: end };
        },

        // =====================================================================
        // 2. NẠP TOÀN BỘ DỮ LIỆU TỪ DATABASE (KHÔNG DÙNG DỮ LIỆU CỨNG)
        // =====================================================================
        loadAllDataFromDb: function (forceRefresh) {
            this.loadOrdersFromDb(forceRefresh);
            this.loadMaterialsFromDb(forceRefresh);
            this.loadPurchaseTrackingFromDb(forceRefresh);
        },

        // Helper định dạng dữ liệu đơn hàng
        _processOrdersData: function (data) {
            if (!Array.isArray(data)) return [];
            return data.map(r => {
                let startDisplay = '--';
                let endDisplay = '--';

                if (r.startDate) {
                    const parts = r.startDate.split('-');
                    startDisplay = parts.length === 3 ? parts[2] + '/' + parts[1] : r.startDate;
                }

                if (r.endDate) {
                    const parts = r.endDate.split('-');
                    endDisplay = parts.length === 3 ? parts[2] + '/' + parts[1] : (r.etd || r.endDate);
                } else if (r.etd) {
                    endDisplay = r.etd;
                }

                const slkhNum = parseInt(r.qty) || 0;

                return {
                    code: r.po || r.poId || '--',
                    style: r.orderCode || '--',
                    des: r.customer || '--',
                    slkh: slkhNum,
                    khCat: startDisplay,
                    ttCat: startDisplay,
                    khLapTrinh: startDisplay,
                    ttLapTrinh: startDisplay,
                    khMay: endDisplay,
                    ttMay: endDisplay,
                    khThoatChuyen: endDisplay,
                    ttThoatChuyen: endDisplay,
                    poId: r.poId,
                    progress: r.progress,
                    status: r.status
                };
            });
        },

        // 2.1. Nạp Bảng Đơn Hàng từ DB: /DashboardTongQuanTienDo/GetGanttData
        loadOrdersFromDb: function (forceRefresh) {
            const self = this;
            const dates = this.getDateRange();
            const cacheKey = 'tab_tiendo_orders_' + dates.startDate + '_' + dates.endDate;

            // Nạp tức thì từ sessionStorage nếu có (0ms phản hồi)
            if (!forceRefresh) {
                try {
                    const cached = sessionStorage.getItem(cacheKey);
                    if (cached) {
                        const res = JSON.parse(cached);
                        if (res && res.success && Array.isArray(res.data)) {
                            const formatted = self._processOrdersData(res.data);
                            self.allOrders = formatted;
                            self.renderOrdersTable(formatted);
                        }
                    }
                } catch (e) { }
            }

            // Nếu chưa có dữ liệu trong cache hiển thị, bật loader
            if ((!self.allOrders || self.allOrders.length === 0) && window.DashboardLoader) {
                window.DashboardLoader.show('#grid-orders-container');
            }

            $.ajax({
                url: '/DashboardTongQuanTienDo/GetGanttData',
                type: 'GET',
                data: dates,
                dataType: 'json'
            }).done(function (res) {
                if (res && res.success && Array.isArray(res.data)) {
                    sessionStorage.setItem(cacheKey, JSON.stringify(res));
                    const formatted = self._processOrdersData(res.data);
                    self.allOrders = formatted;
                    self.renderOrdersTable(formatted);
                } else {
                    self.renderOrdersTable([]);
                }
            }).fail(function (err) {
                console.error('[TabTienDo] Lỗi khi nạp GetGanttData từ DB:', err);
                if (!self.allOrders || self.allOrders.length === 0) {
                    self.renderOrdersTable([]);
                }
            }).always(function () {
                if (window.DashboardLoader) {
                    window.DashboardLoader.hide('#grid-orders-container');
                }
            });
        },

        // Helper định dạng dữ liệu vật tư
        _processMaterialsData: function (materials) {
            if (!Array.isArray(materials)) return [];
            return materials.map(m => {
                const rate = Math.min(100, Math.round(m.pct || 0));
                const barColor = rate >= 100 ? '#10B981' : (rate >= 80 ? '#3B82F6' : (rate >= 50 ? '#F59E0B' : '#EF4444'));
                const chipClass = rate >= 100 ? 'chip-green' : (rate >= 80 ? 'chip-blue' : (rate >= 50 ? 'chip-orange' : 'chip-red'));
                const statusText = rate >= 100 ? 'Đủ 100%' : (rate >= 80 ? `Đã có ${rate}%` : (rate >= 50 ? `Thiếu ${100 - rate}%` : 'Trễ hạn'));
                return {
                    code: m.code,
                    name: m.type || m.code,
                    demand: Math.round(m.demand || 0).toLocaleString('vi-VN'),
                    available: Math.round(m.available || 0).toLocaleString('vi-VN'),
                    rate: rate,
                    pct: m.pct,
                    barColor: barColor,
                    chipClass: chipClass,
                    statusText: statusText
                };
            });
        },

        // 2.2. Nạp Bảng NPL & Biểu đồ tròn từ DB: /DashboardTongQuanTienDo/GetMaterialsData
        loadMaterialsFromDb: function (forceRefresh) {
            const self = this;
            const dates = this.getDateRange();
            const cacheKey = 'tab_tiendo_materials_' + dates.startDate + '_' + dates.endDate;

            // Nạp tức thì từ sessionStorage nếu có (0ms phản hồi)
            if (!forceRefresh) {
                try {
                    const cached = sessionStorage.getItem(cacheKey);
                    if (cached) {
                        const res = JSON.parse(cached);
                        if (res && res.success && Array.isArray(res.materials)) {
                            const formatted = self._processMaterialsData(res.materials);
                            self.allMaterials = formatted;
                            self.currentMaterials = formatted;
                            self.renderMaterialsTable(formatted);
                            self.updatePieChartFromMaterials(formatted);
                        }
                    }
                } catch (e) { }
            }

            // Nếu chưa có dữ liệu hiển thị, bật loader
            if ((!self.allMaterials || self.allMaterials.length === 0) && window.DashboardLoader) {
                window.DashboardLoader.show('#grid-materials-container');
                window.DashboardLoader.show('#pie-chart-materials', { size: 'sm' });
            }

            $.ajax({
                url: '/DashboardTongQuanTienDo/GetMaterialsData',
                type: 'GET',
                data: dates,
                dataType: 'json'
            }).done(function (res) {
                if (res && res.success && Array.isArray(res.materials)) {
                    sessionStorage.setItem(cacheKey, JSON.stringify(res));
                    const formatted = self._processMaterialsData(res.materials);
                    self.allMaterials = formatted;
                    self.currentMaterials = formatted;
                    self.renderMaterialsTable(formatted);
                    self.updatePieChartFromMaterials(formatted);
                } else {
                    self.renderMaterialsTable([]);
                    self.updatePieChartFromMaterials([]);
                }
            }).fail(function (err) {
                console.error('[TabTienDo] Lỗi khi nạp GetMaterialsData từ DB:', err);
                if (!self.allMaterials || self.allMaterials.length === 0) {
                    self.renderMaterialsTable([]);
                    self.updatePieChartFromMaterials([]);
                }
            }).always(function () {
                if (window.DashboardLoader) {
                    window.DashboardLoader.hide('#grid-materials-container');
                    window.DashboardLoader.hide('#pie-chart-materials');
                }
            });
        },

        // Helper render thống kê mua hàng
        _processPurchaseData: function (resData) {
            const summary = (resData && resData.summary) || {};
            $('#stat-da-dat').text((summary.ordered || 0).toLocaleString('vi-VN'));
            $('#stat-da-ve').text((summary.arrived || 0).toLocaleString('vi-VN'));
            $('#stat-sap-ve').text((summary.incoming || 0).toLocaleString('vi-VN'));
            $('#stat-tre').text((summary.fail || 0).toLocaleString('vi-VN'));
            this.purchaseItems = (resData && resData.items) || [];
            this.renderPurchaseChart(this.purchaseItems);
        },

        // 2.3. Nạp Section 3: Theo Dõi Mua Hàng từ DB: /DashboardTongQuanTienDo/GetPurchaseTrackingData
        loadPurchaseTrackingFromDb: function (forceRefresh) {
            const self = this;
            const dates = this.getDateRange();
            const cacheKey = 'tab_tiendo_purchase_' + dates.startDate + '_' + dates.endDate;

            // Nạp tức thì từ sessionStorage nếu có (0ms phản hồi)
            if (!forceRefresh) {
                try {
                    const cached = sessionStorage.getItem(cacheKey);
                    if (cached) {
                        const res = JSON.parse(cached);
                        if (res && res.success && res.data) {
                            self._processPurchaseData(res.data);
                        }
                    }
                } catch (e) { }
            }

            // Nếu chưa có dữ liệu mua hàng, bật loader
            if ((!self.purchaseItems || self.purchaseItems.length === 0) && window.DashboardLoader) {
                window.DashboardLoader.show('#chart-heatmap-purchase', { size: 'sm' });
            }

            $.ajax({
                url: '/DashboardTongQuanTienDo/GetPurchaseTrackingData',
                type: 'GET',
                data: dates,
                dataType: 'json'
            }).done(function (res) {
                if (res && res.success && res.data) {
                    sessionStorage.setItem(cacheKey, JSON.stringify(res));
                    self._processPurchaseData(res.data);
                } else {
                    self._processPurchaseData(null);
                }
            }).fail(function (err) {
                console.error('[TabTienDo] Lỗi khi nạp GetPurchaseTrackingData từ DB:', err);
            }).always(function () {
                if (window.DashboardLoader) {
                    window.DashboardLoader.hide('#chart-heatmap-purchase');
                }
            });
        },

        // =====================================================================
        // 3. RENDER DEVEXTREME DATA GRIDS
        // =====================================================================
        renderOrdersTable: function (orders) {
            const data = orders || this.allOrders || [];
            if (window.OrdersGridComponent) {
                this.ordersGridInstance = window.OrdersGridComponent.init('grid-orders-container', data, {
                    onRowClick: function (e) {
                        if (e.data && window.CommonDetailPopup) {
                            window.CommonDetailPopup.showOrder(e.data);
                        } else if (e.data && typeof window.showOrderDetailPopup === 'function') {
                            window.showOrderDetailPopup(e.data);
                        }
                    }
                });
            }
        },

        renderMaterialsTable: function (materials) {
            const data = materials || this.allMaterials || [];
            if (window.MaterialsGridComponent) {
                this.materialsGridInstance = window.MaterialsGridComponent.init('grid-materials-container', data, {
                    onRowClick: function (e) {
                        if (e.data && window.CommonDetailPopup) {
                            window.CommonDetailPopup.showMaterial(e.data);
                        } else if (e.data && typeof window.showMaterialDetailPopup === 'function') {
                            window.showMaterialDetailPopup(e.data);
                        }
                    }
                });
            }
        },

        // =====================================================================
        // 4. BIỂU ĐỒ TRÒN TỶ LỆ ĐÁP ỨNG NPL (TÍNH TỰ ĐỘNG TỪ DB, KHÔNG CÓ LINE NỐI)
        // =====================================================================
        updatePieChartFromMaterials: function (materials) {
            const data = materials || this.currentMaterials || [];
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

            // Phân loại nhóm tự động từ dữ liệu thực tế
            let du100 = 0, tren80 = 0, thieu = 0, tre = 0;
            let listDu100 = [], listTren80 = [], listThieu = [], listTre = [];

            let sumRate = 0;
            data.forEach(item => {
                const rate = typeof item.rate === 'number' ? item.rate : parseFloat(item.rate) || 0;
                sumRate += rate;
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
            const avgRate = data.length > 0 ? Math.round(sumRate / total) : 0;
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

            // Nếu DB chưa có dữ liệu
            if (seriesData.length === 0) {
                seriesData.push({
                    value: 1,
                    name: 'Chưa có phát sinh',
                    percent: 100,
                    items: [],
                    itemStyle: { color: '#94A3B8' }
                });
            }

            const pieOption = {
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'item',
                    backgroundColor: '#FFFFFF',
                    borderColor: '#CBD5E1',
                    borderWidth: 1,
                    padding: [8, 12],
                    textStyle: { color: '#0F172A', fontFamily: 'Inter', fontSize: 12 },
                    formatter: function (params) {
                        const d = params.data;
                        let tip = `<div style="font-weight: 800; font-size: 13px; margin-bottom: 4px; color: ${d.itemStyle.color};">${d.name}: ${d.value}/${total} loại NPL (${params.percent}%)</div>`;
                        if (d.items && d.items.length) {
                            tip += '<div style="font-size: 11.5px; color: #475569; line-height: 1.5; max-height: 140px; overflow-y: auto;">' + d.items.slice(0, 10).map(it => '&bull; ' + it).join('<br/>') + '</div>';
                        }
                        return tip;
                    }
                },
                legend: {
                    orient: 'horizontal',
                    bottom: '0px',
                    left: 'center',
                    textStyle: { color: '#334155', fontSize: 12, fontFamily: 'Inter', fontWeight: '600' },
                    itemWidth: 12,
                    itemHeight: 12,
                    itemGap: 14
                },
                graphic: [
                    {
                        type: 'text',
                        left: 'center',
                        top: '39%',
                        style: {
                            text: avgRate + '%',
                            fill: '#0F172A',
                            fontSize: 26,
                            fontWeight: '800',
                            fontFamily: 'Inter',
                            textAlign: 'center'
                        }
                    },
                    {
                        type: 'text',
                        left: 'center',
                        top: '52%',
                        style: {
                            text: 'Đáp ứng TB',
                            fill: '#64748B',
                            fontSize: 11.5,
                            fontWeight: '600',
                            fontFamily: 'Inter',
                            textAlign: 'center'
                        }
                    }
                ],
                series: [
                    {
                        name: 'Tỷ Lệ Đáp Ứng NPL',
                        type: 'pie',
                        radius: ['50%', '76%'],
                        center: ['50%', '46%'],
                        avoidLabelOverlap: true,
                        itemStyle: {
                            borderRadius: 6,
                            borderColor: '#FFFFFF',
                            borderWidth: 2
                        },
                        // BỎ TOÀN BỘ CÁC LINE NỐI VÀ LABEL NGOÀI ĐỂ TẠO DẠNG DONUT RING SẠCH ĐẸP
                        label: {
                            show: false
                        },
                        labelLine: {
                            show: false
                        },
                        emphasis: {
                            scale: true,
                            scaleSize: 8,
                            label: {
                                show: false
                            },
                            itemStyle: {
                                shadowBlur: 14,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.25)'
                            }
                        },
                        data: seriesData
                    }
                ]
            };

            pieChart.setOption(pieOption, true);
            pieChart.resize();

            pieDom.style.cursor = 'pointer';

            // Sự kiện Click lát màu trên Biểu đồ tròn -> Mở Grid chi tiết
            pieChart.off('click');
            pieChart.on('click', function (params) {
                if (params && params.data) {
                    if (window.CommonDetailPopup && typeof window.CommonDetailPopup.showPieGroup === 'function') {
                        window.CommonDetailPopup.showPieGroup(params.data, TabTienDoModule.currentMaterials);
                    } else if (typeof window.showPieGroupDetailPopup === 'function') {
                        window.showPieGroupDetailPopup(params.data, TabTienDoModule.currentMaterials);
                    }
                }
            });
        },

        // =====================================================================
        // 5. BIỂU ĐỒ THANH NGANG MUA HÀNG NPL (DỮ LIỆU TRỰC TIẾP TỪ DB)
        // =====================================================================
        renderPurchaseChart: function (items) {
            const heatDom = document.getElementById('chart-heatmap-purchase');
            if (!heatDom) return;
            if (typeof echarts === 'undefined') return;

            if (!heatChart) {
                heatChart = echarts.getInstanceByDom(heatDom) || echarts.init(heatDom);
            }

            // Lấy tối đa 8 loại vật tư tiêu biểu nhất từ DB
            const displayItems = (items && items.length > 0) ? items.slice(0, 8).reverse() : [];
            const categories = displayItems.map(it => it.itemCode || it.maCLVT || 'NPL');
            const dataArrived = displayItems.map(it => Math.round(it.poArrived || 0));
            const dataIncoming = displayItems.map(it => Math.round(it.poIncoming || 0));
            const dataFail = displayItems.map(it => Math.round(it.poFail || 0));

            const heatOption = {
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'item',
                    axisPointer: { type: 'shadow' },
                    backgroundColor: '#FFFFFF',
                    borderColor: '#CBD5E1',
                    borderWidth: 1,
                    padding: [8, 12],
                    textStyle: { color: '#0F172A', fontFamily: 'Inter' },
                    formatter: function (params) {
                        const val = (params.value || 0).toLocaleString('vi-VN');
                        return `
                            <div style="font-family: Inter; font-weight: 700; font-size: 13px; margin-bottom: 4px; color: #0F172A;">${params.name}</div>
                            <div style="font-size: 12px; color: ${params.color}; font-weight: 600;">
                                ${params.seriesName}: <b>${val}</b>
                            </div>
                        `;
                    }
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
                    data: categories.length > 0 ? categories : ['Chưa có dữ liệu'],
                    axisLine: { lineStyle: { color: '#CBD5E1' } },
                    axisLabel: { color: '#1E293B', fontFamily: 'Inter', fontSize: 11.5, fontWeight: '600' }
                },
                series: [
                    {
                        name: 'Đã về',
                        type: 'bar',
                        barWidth: 13,
                        stack: 'total',
                        label: { show: true, formatter: function (p) { return p.value > 0 ? p.value.toLocaleString('vi-VN') : ''; }, color: '#FFFFFF', fontSize: 9.5, fontFamily: 'JetBrains Mono', fontWeight: 'bold' },
                        itemStyle: { color: '#10B981', borderRadius: [0, 0, 0, 0] },
                        data: dataArrived
                    },
                    {
                        name: 'Sắp về',
                        type: 'bar',
                        barWidth: 13,
                        stack: 'total',
                        label: { show: true, formatter: function (p) { return p.value > 0 ? p.value.toLocaleString('vi-VN') : ''; }, color: '#FFFFFF', fontSize: 9.5, fontFamily: 'JetBrains Mono', fontWeight: 'bold' },
                        itemStyle: { color: '#F59E0B' },
                        data: dataIncoming
                    },
                    {
                        name: 'Về trễ',
                        type: 'bar',
                        barWidth: 13,
                        stack: 'total',
                        label: { show: true, formatter: function (p) { return p.value > 0 ? p.value.toLocaleString('vi-VN') : ''; }, color: '#FFFFFF', fontSize: 9.5, fontFamily: 'JetBrains Mono', fontWeight: 'bold' },
                        itemStyle: { color: '#EF4444', borderRadius: [0, 3, 3, 0] },
                        data: dataFail
                    }
                ]
            };

            heatChart.setOption(heatOption, true);
            heatChart.resize();

            heatDom.style.cursor = 'pointer';

            heatChart.off('click');
            heatChart.on('click', function (params) {
                if (params && window.CommonDetailPopup) {
                    const matched = displayItems.find(it => (it.itemCode || it.maCLVT) === params.name);
                    const catCode = matched ? (matched.maCLVT || matched.itemCode) : params.name;
                    window.CommonDetailPopup.showPurchaseTracking({
                        category: catCode,
                        categoryName: params.name,
                        status: params.seriesName,
                        value: params.value
                    });
                }
            });
        },

        // =====================================================================
        // 6. SỰ KIỆN TOÀN CỤC & TƯƠNG TÁC
        // =====================================================================
        activate: function () {
            this.loadAllDataFromDb();
            if (this.ordersGridInstance) this.ordersGridInstance.repaint();
            if (this.materialsGridInstance) this.materialsGridInstance.repaint();
            setTimeout(() => {
                if (pieChart) pieChart.resize();
                if (heatChart) heatChart.resize();
            }, 100);
        },

        reload: function () {
            this.loadAllDataFromDb();
        },

        bindWindowResize: function () {
            const self = this;
            window.addEventListener('resize', function () {
                if (pieChart) pieChart.resize();
                if (heatChart) heatChart.resize();
                if (self.ordersGridInstance) self.ordersGridInstance.repaint();
                if (self.materialsGridInstance) self.materialsGridInstance.repaint();
            });
        },

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

                        $(document).trigger('dashboard:tabChanged', { tab: targetTab });

                        if (targetTab === 'tien-do') {
                            setTimeout(() => {
                                if (TabTienDoModule.ordersGridInstance) TabTienDoModule.ordersGridInstance.repaint();
                                if (TabTienDoModule.materialsGridInstance) TabTienDoModule.materialsGridInstance.repaint();
                                if (pieChart) pieChart.resize();
                                if (heatChart) heatChart.resize();
                            }, 60);
                        }
                    }
                });
        },

        bindPurchaseKpiClicks: function () {
            $(document).off('click.purchaseKpi', '[data-purchase-kpi]')
                .on('click.purchaseKpi', '[data-purchase-kpi]', function () {
                    const statusKey = $(this).attr('data-purchase-kpi');
                    if (window.CommonDetailPopup) {
                        window.CommonDetailPopup.showPurchaseTracking({ status: statusKey });
                    }
                });
        },

        bindGlobalEvents: function () {
            const self = this;
            // Lắng nghe thay đổi khoảng ngày từ Header
            $(document).off('dashboard:dateChanged.tabTienDo').on('dashboard:dateChanged.tabTienDo', function () {
                self.reload();
            });

            // Lắng nghe nút Refresh từ Header
            $(document).off('dashboard:refresh.tabTienDo').on('dashboard:refresh.tabTienDo', function () {
                self.reload(true); // force refresh bypass cache
            });
        },

        // Kích hoạt lại kích thước bảng và biểu đồ khi tab hiển thị
        activate: function () {
            setTimeout(() => {
                if (this.ordersGridInstance && typeof this.ordersGridInstance.repaint === 'function') {
                    this.ordersGridInstance.repaint();
                }
                if (this.materialsGridInstance && typeof this.materialsGridInstance.repaint === 'function') {
                    this.materialsGridInstance.repaint();
                }
                if (pieChart && typeof pieChart.resize === 'function') pieChart.resize();
                if (heatChart && typeof heatChart.resize === 'function') heatChart.resize();
            }, 60);
        },

        // Nạp lại toàn bộ dữ liệu (forceRefresh = true sẽ bỏ qua cache sessionStorage)
        reload: function (forceRefresh) {
            this.loadAllDataFromDb(forceRefresh);
        }
    };

    window.TabTienDoModule = TabTienDoModule;

    $(document).ready(function () {
        TabTienDoModule.init();
    });

})(window, window.jQuery || window.$);
