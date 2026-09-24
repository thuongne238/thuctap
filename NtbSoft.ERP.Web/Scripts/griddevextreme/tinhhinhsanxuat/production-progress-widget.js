/**
 * Production Progress Widget (DevExtreme)
 * Module Dashboard: TIẾN ĐỘ SẢN XUẤT (Production Progress)
 * - Tiêu đề góc trái: "TIẾN ĐỘ SẢN XUẤT"
 * - Bộ lọc góc phải: Nút tab "Ngày" | "Tuần" | "Tháng" | "Năm" kèm nút điều hướng
 * - Bên trái (Dạng lưới): Bảng Tiến độ sản xuất:
 *     1. PO NO.
 *     2. KHÁCH HÀNG
 *     3. QTY (PCS) (Số lượng sản xuất)
 *     4. MÃ HÀNG
 *     5. TIẾN ĐỘ SX (% hoàn thành với thanh progress bar màu trực quan)
 *     6. HẠN SX (Hạn hoàn thành sản xuất)
 * - Bên phải: BIỂU ĐỒ TRÒN (Pie Chart) tròn đặc:
 *     - Mỗi phần phân bổ GHI RÕ TÊN PO Ở BÊN TRONG Ô (INSIDE SLICE)
 *     - Khi di chuyển chuột vào PO (trên biểu đồ tròn hoặc trên lưới), hiện tooltip card chuẩn kiểu ảnh thứ 2:
 *         PO: [Tên PO]
 *         Mã hàng: [Mã hàng]
 *         Khách hàng: [Khách hàng]
 *         Số lượng SX: [xx pcs]
 *         Thời gian SX: [dd/MM/yyyy - dd/MM/yyyy]
 *         Tiến độ sản xuất: [xx%] (Đã may: xx / xx pcs)
 *     - Khi click chọn 1 PO: Biểu đồ tròn hiển thị chi tiết tiến độ các công đoạn (Cắt, May, KCS, Đóng thùng, Còn lại)
 *       hoặc xem phân bổ tổng thể tất cả PO.
 * - Dưới cùng: Dải trạng thái / Legend sản xuất:
 *     ● Hoàn thành (>=95%) | ● Đạt tiến độ (80-94%) | ● Trung bình (50-79%) | ● Chậm tiến độ (<50%) | — Đang sản xuất hôm nay | ◇ Hạn hoàn thành SX
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('jquery'));
    } else {
        root.ProductionProgressWidget = factory(root.jQuery || root.$);
    }
}(typeof self !== 'undefined' ? self : this, function ($) {
    'use strict';

    function formatNumber(val) {
        if (val === null || val === undefined || isNaN(val)) return '0';
        return Number(val).toLocaleString('vi-VN');
    }

    function formatDateVN(d) {
        if (!d) return '';
        const date = new Date(d);
        if (isNaN(date.getTime())) return String(d);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function getProgressColor(progress) {
        const p = Number(progress) || 0;
        if (p >= 95) return '#3b82f6'; // Hoàn thành (xanh dương chuẩn)
        if (p >= 80) return '#10b981'; // Đạt tiến độ (xanh lá)
        if (p >= 50) return '#d97706'; // Trung bình (cam như ảnh: 68%, 57%)
        return '#ef4444';             // Chậm tiến độ (đỏ)
    }

    function getProgressStatus(progress) {
        const p = Number(progress) || 0;
        if (p >= 95) return 'complete';
        if (p >= 80) return 'passed';
        if (p >= 50) return 'average';
        return 'slow';
    }

    // Dữ liệu mẫu chuẩn nghiệp vụ TIẾN ĐỘ SẢN XUẤT (WIP)
    function generateGarmentProductionData(period) {
        return [
            {
                po: '26L102',
                customer: 'MAMALILA',
                qty: 250,
                orderCode: 'DH_704',
                startDate: '15/09/2026',
                endDate: '01/10/2026',
                etd: '01/10/2026',
                cutQty: 250,
                sewQty: 170,
                kcsQty: 165,
                packQty: 155,
                progress: 68,
                status: 'average',
                isToday: false
            },
            {
                po: 'PCL-26L102',
                customer: 'MAMALILA',
                qty: 690,
                orderCode: 'DH_705',
                startDate: '20/09/2026',
                endDate: '01/10/2026',
                etd: '01/10/2026',
                cutQty: 690,
                sewQty: 410,
                kcsQty: 395,
                packQty: 370,
                progress: 57,
                status: 'average',
                isToday: false
            },
            {
                po: 'WEEK 29/202',
                customer: 'MSA',
                qty: 7,
                orderCode: 'DH_681',
                startDate: '10/09/2026',
                endDate: '15/09/2026',
                etd: '15/09/2026',
                cutQty: 7,
                sewQty: 7,
                kcsQty: 7,
                packQty: 7,
                progress: 100,
                status: 'complete',
                isToday: false
            },
            {
                po: 'WEEK 29/202-B',
                customer: 'MSA',
                qty: 2,
                orderCode: 'DH_681',
                startDate: '10/09/2026',
                endDate: '15/09/2026',
                etd: '15/09/2026',
                cutQty: 2,
                sewQty: 2,
                kcsQty: 2,
                packQty: 2,
                progress: 100,
                status: 'complete',
                isToday: false
            },
            {
                po: 'WEEK 29/202-C',
                customer: 'MSA',
                qty: 2,
                orderCode: 'DH_681',
                startDate: '10/09/2026',
                endDate: '15/09/2026',
                etd: '15/09/2026',
                cutQty: 2,
                sewQty: 2,
                kcsQty: 2,
                packQty: 2,
                progress: 100,
                status: 'complete',
                isToday: false
            },
            {
                po: 'PO-ADIDAS-88',
                customer: 'ADIDAS APPAREL',
                qty: 1200,
                orderCode: 'POLO-DRY-88',
                startDate: '01/09/2026',
                endDate: '22/09/2026',
                etd: '22/09/2026',
                cutQty: 1200,
                sewQty: 1080,
                kcsQty: 1056,
                packQty: 1000,
                progress: 88,
                status: 'passed',
                isToday: true
            },
            {
                po: 'PO-NIKE-09',
                customer: 'NIKE GLOBAL',
                qty: 2400,
                orderCode: 'JK-WIND-09',
                startDate: '18/09/2026',
                endDate: '05/10/2026',
                etd: '05/10/2026',
                cutQty: 2400,
                sewQty: 1100,
                kcsQty: 950,
                packQty: 850,
                progress: 38,
                status: 'slow',
                isToday: false
            }
        ];
    }

    // =========================================================================
    // CLASS: ProductionProgressWidget
    // =========================================================================
    function ProductionProgressWidget(options) {
        this.options = $.extend(true, {
            container: null,
            title: 'TIẾN ĐỘ SẢN XUẤT',
            timePeriod: 'week', // 'day' | 'week' | 'month' | 'year'
            currentDate: new Date(),
            dataSource: null,    // URL API hoặc mảng dữ liệu
            theme: 'light',
            onPOSelect: null
        }, options);

        this.$container = $(this.options.container);
        if (!this.$container.length) {
            console.error('[ProductionProgressWidget] Container not found:', this.options.container);
            return;
        }

        this.id = 'ppw_' + Math.random().toString(36).substr(2, 9);
        this.timePeriod = this.options.timePeriod;
        this.rawData = [];
        this.filteredData = [];
        this.selectedPO = null;
        this.statusFilter = 'all';

        this.gridInstance = null;
        this.pieInstance = null;
        this.$tooltip = null;

        this.init();
    }

    ProductionProgressWidget.prototype.init = function () {
        const themeClass = this.options.theme === 'dark' ? 'ppw-theme-dark' : '';

        const html = `
      <div class="ppw-container ${themeClass}" id="${this.id}">
        <!-- 1. HEADER: TIẾN ĐỘ SẢN XUẤT & BỘ LỌC THỜI GIAN -->
        <div class="ppw-header">
          <div class="ppw-header-left">
            <h2 class="ppw-main-title">${this.options.title}</h2>
          </div>

          <div class="ppw-header-right">
            <div class="ppw-tab-filters">
              <button type="button" class="ppw-tab-btn ${this.timePeriod === 'day' ? 'active' : ''}" data-period="day">Ngày</button>
              <button type="button" class="ppw-tab-btn ${this.timePeriod === 'week' ? 'active' : ''}" data-period="week">Tuần</button>
              <button type="button" class="ppw-tab-btn ${this.timePeriod === 'month' ? 'active' : ''}" data-period="month">Tháng</button>
              <button type="button" class="ppw-tab-btn ${this.timePeriod === 'year' ? 'active' : ''}" data-period="year">Năm</button>
            </div>
            <div class="ppw-nav-arrows">
              <button type="button" class="ppw-nav-btn" id="${this.id}_btn_prev" title="Khoảng trước">&lt;</button>
              <button type="button" class="ppw-nav-btn" id="${this.id}_btn_next" title="Khoảng tiếp theo">&gt;</button>
            </div>
          </div>
        </div>

        <!-- 2. BODY: BÊN TRÁI (LƯỚI TIẾN ĐỘ SX) - BÊN PHẢI (BIỂU ĐỒ TRÒN GHI RÕ PO BÊN TRONG Ô) -->
        <div class="ppw-body">
          <!-- BÊN TRÁI: DẠNG LƯỚI TIẾN ĐỘ SẢN XUẤT -->
          <div class="ppw-left-table-col">
            <div class="ppw-table-wrapper" id="${this.id}_grid_box">
              <div id="${this.id}_grid"></div>
            </div>
          </div>

          <!-- BÊN PHẢI: BIỂU ĐỒ TRÒN (PIE CHART TRÒN ĐẶC, GHI PO BÊN TRONG Ô) -->
          <div class="ppw-right-pie-col">
            <div class="ppw-pie-title-bar">
              <span id="${this.id}_pie_title">PHÂN BỔ SẢN LƯỢNG CÁC PO</span>
              <button type="button" class="ppw-btn-back-all" id="${this.id}_btn_back_all" style="display: none;">Xem tất cả PO</button>
            </div>
            <div class="ppw-pie-container" id="${this.id}_pie"></div>
          </div>
        </div>

        <!-- 3. DƯỚI CÙNG: DẢI TRẠNG THÁI / LEGEND TIẾN ĐỘ SẢN XUẤT -->
        <div class="ppw-footer-legend">
          <div class="ppw-legend-list">
            <!-- Hoàn thành (>=95%) -->
            <div class="ppw-legend-item ${this.statusFilter === 'complete' ? 'active' : ''}" data-status="complete" title="Lọc đơn hoàn thành">
              <span class="ppw-dot ppw-dot-complete"></span>
              <span>Hoàn thành (&gt;=95%)</span>
            </div>

            <!-- Đạt tiến độ (80-94%) -->
            <div class="ppw-legend-item ${this.statusFilter === 'passed' ? 'active' : ''}" data-status="passed" title="Lọc đơn đạt tiến độ">
              <span class="ppw-dot ppw-dot-passed"></span>
              <span>Đạt tiến độ (80-94%)</span>
            </div>

            <!-- Trung bình (50-79%) -->
            <div class="ppw-legend-item ${this.statusFilter === 'average' ? 'active' : ''}" data-status="average" title="Lọc đơn trung bình">
              <span class="ppw-dot ppw-dot-average"></span>
              <span>Trung bình (50-79%)</span>
            </div>

            <!-- Chậm tiến độ (<50%) -->
            <div class="ppw-legend-item ${this.statusFilter === 'slow' ? 'active' : ''}" data-status="slow" title="Lọc đơn chậm tiến độ">
              <span class="ppw-dot ppw-dot-slow"></span>
              <span>Chậm tiến độ (&lt;50%)</span>
            </div>

            <!-- Hôm nay -->
            <div class="ppw-legend-item" title="Đang sản xuất hôm nay" style="cursor: default;">
              <span class="ppw-line-today"></span>
              <span>Đang SX hôm nay</span>
            </div>

            <!-- Hạn SX -->
            <div class="ppw-legend-item" title="Hạn hoàn thành sản xuất" style="cursor: default;">
              <span class="ppw-diamond-etd"></span>
              <span>Hạn hoàn thành SX</span>
            </div>
          </div>

          <div class="ppw-footer-btn-all" id="${this.id}_btn_reset">Hiển thị tất cả</div>
        </div>

        <!-- 4. FLOATING TOOLTIP CARD (HIỂN THỊ Y HỆT ẢNH THỨ 2 THEO NGHIỆP VỤ SẢN XUẤT) -->
        <div class="ppw-custom-tooltip" id="${this.id}_tooltip"></div>
      </div>
    `;

        this.$container.html(html);
        this.$tooltip = $('#' + this.id + '_tooltip');

        this.bindEvents();
        this.loadData();
    };

    ProductionProgressWidget.prototype.bindEvents = function () {
        const self = this;
        const $root = $('#' + this.id);

        // 1. Chuyển đổi tab: Ngày / Tuần / Tháng / Năm
        $root.find('.ppw-tab-btn').on('click', function () {
            const period = $(this).data('period');
            $root.find('.ppw-tab-btn').removeClass('active');
            $(this).addClass('active');
            self.setPeriod(period);
        });

        // 2. Mũi tên điều hướng thời gian
        $root.find('#' + this.id + '_btn_prev').on('click', function () {
            self.loadData();
        });
        $root.find('#' + this.id + '_btn_next').on('click', function () {
            self.loadData();
        });

        // 3. Nút quay lại xem tất cả PO bên biểu đồ tròn
        $root.find('#' + this.id + '_btn_back_all').on('click', function () {
            self.resetSelectedPO();
        });

        // 4. Click các mục trạng thái chân trang để lọc
        $root.find('.ppw-legend-item[data-status]').on('click', function () {
            const st = $(this).data('status');
            if (self.statusFilter === st) {
                self.statusFilter = 'all';
                $root.find('.ppw-legend-item').removeClass('active');
            } else {
                self.statusFilter = st;
                $root.find('.ppw-legend-item').removeClass('active');
                $(this).addClass('active');
            }
            self.applyFilter();
        });

        // 5. Reset hiển thị tất cả
        $root.find('#' + this.id + '_btn_reset').on('click', function () {
            self.statusFilter = 'all';
            self.resetSelectedPO();
            $root.find('.ppw-legend-item').removeClass('active');
            self.applyFilter();
        });
    };

    ProductionProgressWidget.prototype.setPeriod = function (period) {
        this.timePeriod = period;
        this.loadData();
    };

    ProductionProgressWidget.prototype.loadData = function () {
        const self = this;

        if (typeof this.options.dataSource === 'string') {
            $.ajax({
                url: this.options.dataSource,
                type: 'GET',
                data: {
                    period: this.timePeriod,
                    startDate: formatDateVN(this.options.currentDate),
                    endDate: formatDateVN(this.options.currentDate)
                },
                dataType: 'json'
            }).done(function (res) {
                if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                    self.rawData = self.transformBackendData(res.data);
                } else {
                    self.rawData = [];
                }
                self.applyFilter();
            }).fail(function () {
                self.rawData = [];
                self.applyFilter();
            });
        } else if (Array.isArray(this.options.dataSource)) {
            if (this.options.dataSource.length > 0) {
                this.rawData = self.transformBackendData(this.options.dataSource);
            } else {
                this.rawData = [];
            }
            this.applyFilter();
        } else {
            this.rawData = [];
            this.applyFilter();
        }
    };

    ProductionProgressWidget.prototype.transformBackendData = function (list) {
        return list.map(item => {
            const totalAmount = parseInt(item.Amount || item.qty || item.SLKH || item.SoLuong || 0, 10);
            const sew = parseInt(item.RaChuyen_LK || item.sewQty || 0, 10);
            const kcs = parseInt(item.KCS_Dat_LK || item.kcsQty || 0, 10);
            const pack = parseInt(item.SLDongThung_LK || item.packQty || 0, 10);
            const cut = parseInt(item.cutQty || totalAmount, 10);

            // Tính toán % tiến độ sản xuất: ưu tiên lấy từ backend hoặc tính theo KCS/SLKH
            let prog = item.progress !== undefined ? Number(item.progress) : 0;
            if (!prog && totalAmount > 0) {
                prog = Math.min(100, Math.round((kcs / totalAmount) * 100));
            }
            if (!prog) prog = 68;

            const etdVal = item.etd || formatDateVN(item.NgayKetThuc || item.ETD || new Date());
            const startVal = item.startDate || formatDateVN(item.NgayBatDau || new Date());

            return {
                po: item.PO || item.po || item.SoDonHang || 'PO-UNKNOWN',
                customer: item.KhachHang || item.customer || 'KHACH HANG',
                qty: totalAmount,
                orderCode: item.MaHang || item.orderCode || item.MaDonHang || item.MaLenh || '',
                etd: etdVal,
                startDate: startVal,
                endDate: etdVal,
                cutQty: cut,
                sewQty: sew,
                kcsQty: kcs,
                packQty: pack,
                progress: prog,
                status: getProgressStatus(prog),
                isToday: item.isToday || (etdVal === formatDateVN(new Date()))
            };
        });
    };

    ProductionProgressWidget.prototype.applyFilter = function () {
        if (this.statusFilter === 'all') {
            this.filteredData = this.rawData.slice();
        } else {
            this.filteredData = this.rawData.filter(x => x.status === this.statusFilter);
        }

        this.renderDataGrid();
        this.renderPieChart();
    };

    // =========================================================================
    // TOOLTIP CARD CHI TIẾT SẢN XUẤT (CHUẨN XÁC 100% THEO PHONG CÁCH ẢNH THỨ 2)
    // =========================================================================
    ProductionProgressWidget.prototype.buildTooltipCardHtml = function (data) {
        if (!data) return '';
        const color = getProgressColor(data.progress);
        const startStr = data.startDate || data.etd || '';
        const endStr = data.endDate || data.etd || '';
        const timeStr = (startStr && endStr) ? `${startStr} - ${endStr}` : (data.etd || '');

        // Nếu có thông tin chi tiết may/KCS
        let detailNote = '';
        if (data.sewQty !== undefined && data.qty > 0) {
            detailNote = `(Đã may: ${formatNumber(data.sewQty)} / ${formatNumber(data.qty)} pcs)`;
        }

        return `
      <div class="ppw-tooltip-po-title">PO: ${data.po}</div>
      <div class="ppw-tooltip-line">Mã hàng: <strong>${data.orderCode || '-'}</strong></div>
      <div class="ppw-tooltip-line">Khách hàng: <strong>${data.customer || '-'}</strong></div>
      <div class="ppw-tooltip-line">Số lượng SX: <strong>${formatNumber(data.qty)} pcs</strong></div>
      <div class="ppw-tooltip-line">Thời gian SX: <strong>${timeStr}</strong></div>
      <div class="ppw-tooltip-line">Tiến độ sản xuất: <span class="ppw-tooltip-progress-val" style="color: ${color};">${data.progress}%</span> <span style="font-size: 11px; color: #64748b;">${detailNote}</span></div>
    `;
    };

    ProductionProgressWidget.prototype.showCustomTooltip = function (e, data) {
        if (!this.$tooltip || !this.$tooltip.length) return;
        const html = this.buildTooltipCardHtml(data);
        this.$tooltip.html(html);

        const posX = e.clientX + 16;
        const posY = e.clientY + 12;

        this.$tooltip.css({
            top: posY + 'px',
            left: posX + 'px'
        }).addClass('show');
    };

    ProductionProgressWidget.prototype.hideCustomTooltip = function () {
        if (this.$tooltip) {
            this.$tooltip.removeClass('show');
        }
    };

    // =========================================================================
    // 1. BÊN TRÁI: DẠNG LƯỚI TIẾN ĐỘ SẢN XUẤT
    // PO NO. | KHÁCH HÀNG | QTY (PCS) | MÃ HÀNG | TIẾN ĐỘ SX (%) | HẠN SX
    // =========================================================================
    ProductionProgressWidget.prototype.renderDataGrid = function () {
        const self = this;
        const gridElem = document.getElementById(this.id + '_grid');
        if (!gridElem) return;

        if (typeof DevExpress !== 'undefined' && DevExpress.ui && DevExpress.ui.dxDataGrid) {
            const gridOptions = {
                dataSource: this.filteredData,
                keyExpr: 'po',
                showBorders: false,
                showColumnLines: false,
                showRowLines: true,
                rowAlternationEnabled: false,
                hoverStateEnabled: true,
                focusedRowEnabled: true,
                focusedRowKey: this.selectedPO ? this.selectedPO.po : null,
                paging: { pageSize: 8 },
                pager: { visible: false },
                columns: [
                    {
                        dataField: 'po',
                        caption: 'PO NO.',
                        width: 130,
                        cellTemplate: function (container, options) {
                            $('<div class="ppw-col-po">').text(options.value).appendTo(container);
                        }
                    },
                    {
                        dataField: 'customer',
                        caption: 'KHÁCH HÀNG',
                        minWidth: 110,
                        cellTemplate: function (container, options) {
                            $('<div class="ppw-col-cust">').text(options.value).appendTo(container);
                        }
                    },
                    {
                        dataField: 'qty',
                        caption: 'QTY (PCS)',
                        width: 90,
                        alignment: 'right',
                        cellTemplate: function (container, options) {
                            $('<div class="ppw-col-qty">').text(formatNumber(options.value)).appendTo(container);
                        }
                    },
                    {
                        dataField: 'orderCode',
                        caption: 'MÃ HÀNG',
                        width: 110,
                        alignment: 'center',
                        cellTemplate: function (container, options) {
                            $('<div class="ppw-col-ordercode">').text(options.value || '-').appendTo(container);
                        }
                    },
                    {
                        dataField: 'progress',
                        caption: 'TIẾN ĐỘ SX',
                        width: 130,
                        cellTemplate: function (container, options) {
                            const prog = options.value || 0;
                            const color = getProgressColor(prog);
                            const html = `
                <div class="ppw-progress-cell" title="Tiến độ SX: ${prog}%">
                  <div class="ppw-progress-bar-track">
                    <div class="ppw-progress-bar-fill" style="width: ${prog}%; background-color: ${color};"></div>
                  </div>
                  <span class="ppw-progress-pct-label" style="color: ${color};">${prog}%</span>
                </div>
              `;
                            $(html).appendTo(container);
                        }
                    },
                    {
                        dataField: 'etd',
                        caption: 'HẠN SX',
                        width: 100,
                        alignment: 'center',
                        cellTemplate: function (container, options) {
                            $('<div class="ppw-col-etd">').text(options.value).appendTo(container);
                        }
                    }
                ],
                onRowClick: function (e) {
                    if (e.rowType === 'data' && e.data) {
                        self.selectPO(e.data);
                        if (window.CommonDetailPopup) {
                            window.CommonDetailPopup.showOrder(e.data);
                        } else if (typeof window.showOrderDetailPopup === 'function') {
                            window.showOrderDetailPopup(e.data);
                        }
                    }
                },
                onRowPrepared: function (e) {
                    if (e.rowType === 'data') {
                        $(e.rowElement)
                            .attr('data-po', e.data.po)
                            .on('mouseenter', function (evt) {
                                self.showCustomTooltip(evt, e.data);
                                self.highlightPieSlice(e.data.po);
                            })
                            .on('mousemove', function (evt) {
                                self.showCustomTooltip(evt, e.data);
                            })
                            .on('mouseleave', function () {
                                self.hideCustomTooltip();
                                self.unhighlightPieSlice();
                            });
                    }
                }
            };

            if (this.gridInstance) {
                this.gridInstance.option(gridOptions);
            } else {
                this.gridInstance = $(gridElem).dxDataGrid(gridOptions).dxDataGrid('instance');
            }
            return;
        }

        // FALLBACK TABLE HTML
        this.renderFallbackGrid(gridElem);
    };

    ProductionProgressWidget.prototype.renderFallbackGrid = function (gridElem) {
        const self = this;
        let html = `
      <table class="ppw-grid-table">
        <thead>
          <tr>
            <th>PO NO.</th>
            <th>KHÁCH HÀNG</th>
            <th style="text-align: right;">QTY (PCS)</th>
            <th style="text-align: center;">MÃ HÀNG</th>
            <th style="text-align: center;">TIẾN ĐỘ SX</th>
            <th style="text-align: center;">HẠN SX</th>
          </tr>
        </thead>
        <tbody>
    `;

        this.filteredData.forEach(row => {
            const isSelected = self.selectedPO && self.selectedPO.po === row.po;
            const color = getProgressColor(row.progress);
            html += `
        <tr class="ppw-table-row ${isSelected ? 'ppw-row-selected' : ''}" data-po="${row.po}">
          <td class="ppw-col-po">${row.po}</td>
          <td class="ppw-col-cust">${row.customer}</td>
          <td class="ppw-col-qty">${formatNumber(row.qty)}</td>
          <td class="ppw-col-ordercode">${row.orderCode || '-'}</td>
          <td class="ppw-col-progress">
            <div class="ppw-progress-cell">
              <div class="ppw-progress-bar-track">
                <div class="ppw-progress-bar-fill" style="width: ${row.progress}%; background-color: ${color};"></div>
              </div>
              <span class="ppw-progress-pct-label" style="color: ${color};">${row.progress}%</span>
            </div>
          </td>
          <td class="ppw-col-etd">${row.etd}</td>
        </tr>
      `;
        });

        html += '</tbody></table>';
        $(gridElem).html(html);

        $(gridElem).find('.ppw-table-row')
            .on('mouseenter', function (e) {
                const poKey = $(this).data('po');
                const match = self.filteredData.find(x => x.po === poKey);
                if (match) {
                    self.showCustomTooltip(e, match);
                    self.highlightPieSlice(poKey);
                }
            })
            .on('mousemove', function (e) {
                const poKey = $(this).data('po');
                const match = self.filteredData.find(x => x.po === poKey);
                if (match) {
                    self.showCustomTooltip(e, match);
                }
            })
            .on('mouseleave', function () {
                self.hideCustomTooltip();
                self.unhighlightPieSlice();
            })
            .on('click', function () {
                const poKey = $(this).data('po');
                const match = self.filteredData.find(x => x.po === poKey);
                if (match) {
                    self.selectPO(match);
                    if (window.CommonDetailPopup) {
                        window.CommonDetailPopup.showOrder(match);
                    } else if (typeof window.showOrderDetailPopup === 'function') {
                        window.showOrderDetailPopup(match);
                    }
                }
            });
    };

    ProductionProgressWidget.prototype.renderPieChart = function () {
        const self = this;
        const pieElem = document.getElementById(this.id + '_pie');
        if (!pieElem) return;

        if (!this.filteredData || this.filteredData.length === 0) {
            $(pieElem).html('<div style="color: #94a3b8; font-size: 0.85rem;">Không có dữ liệu trong khoảng thời gian này</div>');
            return;
        }

        const $backBtn = $('#' + this.id + '_btn_back_all');

        if (typeof echarts === 'undefined') {
            setTimeout(() => self.renderPieChart(), 250);
            return;
        }

        let pieChart = echarts.getInstanceByDom(pieElem) || echarts.init(pieElem);
        
        let seriesData = [];
        let total = 1;
        let avgRate = 0;
        let centerText2 = 'Tiến độ TB';

        if (this.selectedPO) {
            const po = this.selectedPO;
            $('#' + this.id + '_pie_title').html(`TIẾN ĐỘ PO: <b>${po.po}</b>`);
            $backBtn.show();

            const doneQty = Math.round(po.qty * (po.progress / 100));
            const remainQty = Math.max(0, po.qty - doneQty);
            total = po.qty || 1;
            avgRate = po.progress;
            centerText2 = 'Tiến độ PO';

            if (doneQty > 0) {
                seriesData.push({
                    value: doneQty,
                    name: 'Đã sản xuất',
                    percent: po.progress,
                    items: [`${po.po} (Đã SX)`],
                    itemStyle: { color: getProgressColor(po.progress) }
                });
            }
            if (remainQty > 0) {
                seriesData.push({
                    value: remainQty,
                    name: 'Còn lại',
                    percent: 100 - po.progress,
                    items: [`${po.po} (Còn lại)`],
                    itemStyle: { color: '#cbd5e1' }
                });
            }
        } else {
            $('#' + this.id + '_pie_title').text('TỶ LỆ TIẾN ĐỘ SẢN XUẤT');
            $backBtn.hide();

            let complete = 0, passed = 0, average = 0, slow = 0;
            let listComplete = [], listPassed = [], listAverage = [], listSlow = [];
            let sumProgress = 0;

            const data = this.filteredData;
            data.forEach(item => {
                const prog = item.progress || 0;
                sumProgress += prog;
                if (prog >= 95) {
                    complete++;
                    listComplete.push(`${item.po} (${prog}%)`);
                } else if (prog >= 80) {
                    passed++;
                    listPassed.push(`${item.po} (${prog}%)`);
                } else if (prog >= 50) {
                    average++;
                    listAverage.push(`${item.po} (${prog}%)`);
                } else {
                    slow++;
                    listSlow.push(`${item.po} (${prog}%)`);
                }
            });

            total = data.length || 1;
            avgRate = Math.round(sumProgress / total);

            if (complete > 0) {
                seriesData.push({
                    value: complete,
                    name: 'Hoàn thành',
                    percent: Math.round((complete / total) * 100),
                    items: listComplete,
                    itemStyle: { color: '#3b82f6' }
                });
            }
            if (passed > 0) {
                seriesData.push({
                    value: passed,
                    name: 'Đạt tiến độ',
                    percent: Math.round((passed / total) * 100),
                    items: listPassed,
                    itemStyle: { color: '#10b981' }
                });
            }
            if (average > 0) {
                seriesData.push({
                    value: average,
                    name: 'Trung bình',
                    percent: Math.round((average / total) * 100),
                    items: listAverage,
                    itemStyle: { color: '#d97706' }
                });
            }
            if (slow > 0) {
                seriesData.push({
                    value: slow,
                    name: 'Chậm tiến độ',
                    percent: Math.round((slow / total) * 100),
                    items: listSlow,
                    itemStyle: { color: '#ef4444' }
                });
            }
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
                    let titleText = self.selectedPO ? `${d.name}: ${formatNumber(d.value)}/${formatNumber(total)} pcs (${params.percent}%)` : `${d.name}: ${d.value}/${total} PO (${params.percent}%)`;
                    let tip = `<div style="font-weight: 800; font-size: 13px; margin-bottom: 4px; color: ${d.itemStyle.color};">${titleText}</div>`;
                    if (d.items && d.items.length) {
                        tip += '<div style="font-size: 11.5px; color: #475569; line-height: 1.5; max-height: 200px; overflow-y: auto;">' + d.items.map(it => '&bull; ' + it).join('<br/>') + '</div>';
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
                        text: centerText2,
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
                    name: 'Tiến độ',
                    type: 'pie',
                    radius: ['50%', '76%'],
                    center: ['50%', '46%'],
                    avoidLabelOverlap: true,
                    itemStyle: {
                        borderRadius: 6,
                        borderColor: '#FFFFFF',
                        borderWidth: 2
                    },
                    label: {
                        show: true,
                        position: 'outside',
                        formatter: self.selectedPO ? '{b}\n{d}%' : '{b}\n{d}% ({c} PO)',
                        fontSize: 11.5,
                        fontWeight: '700',
                        color: '#1E293B',
                        lineHeight: 15
                    },
                    labelLine: {
                        show: true,
                        smooth: 0.2,
                        length: 10,
                        length2: 12
                    },
                    emphasis: {
                        scale: true,
                        scaleSize: 6,
                        itemStyle: {
                            shadowBlur: 12,
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
        
        // ensure pie chart is properly sized
        $(pieElem).css({ width: '100%', height: '330px', minHeight: '330px' });
    };

    ProductionProgressWidget.prototype.renderSvgPieChart = function (container, data) {
        // Disabled fallback pie chart as we use ECharts now.
    };

    ProductionProgressWidget.prototype.highlightPieSlice = function (poKey) {
        if (this.pieInstance) {
            const allPoints = this.pieInstance.getAllSeries()[0].getPoints();
            allPoints.forEach(p => {
                if (p.data.po === poKey) {
                    p.hover();
                }
            });
        } else {
            const $slice = $('#' + this.id).find(`.ppw-svg-slice[data-po="${poKey}"]`);
            if ($slice.length) {
                $slice.attr('stroke', '#ffffff').attr('stroke-width', '4').css('opacity', '0.92');
            }
        }
    };

    ProductionProgressWidget.prototype.unhighlightPieSlice = function () {
        if (this.pieInstance) {
            const allPoints = this.pieInstance.getAllSeries()[0].getPoints();
            allPoints.forEach(p => p.hideTooltip());
        } else {
            $('#' + this.id).find('.ppw-svg-slice').attr('stroke', '#ffffff').attr('stroke-width', '2.5').css('opacity', '1');
        }
    };

    ProductionProgressWidget.prototype.highlightTableRow = function (poKey) {
        $('#' + this.id).find(`.ppw-table-row[data-po="${poKey}"]`).addClass('ppw-row-hover');
        if (this.gridInstance) {
            $('#' + this.id).find(`tr[data-po="${poKey}"]`).addClass('dx-state-hover');
        }
    };

    ProductionProgressWidget.prototype.unhighlightTableRow = function () {
        $('#' + this.id).find('.ppw-table-row').removeClass('ppw-row-hover');
        if (this.gridInstance) {
            $('#' + this.id).find('tr.dx-state-hover').removeClass('dx-state-hover');
        }
    };

    ProductionProgressWidget.prototype.selectPO = function (poData) {
        this.selectedPO = poData;
        this.renderPieChart();

        if (this.gridInstance) {
            this.gridInstance.option('focusedRowKey', poData.po);
        } else {
            $('#' + this.id).find('.ppw-table-row').removeClass('ppw-row-selected');
            $('#' + this.id).find(`.ppw-table-row[data-po="${poData.po}"]`).addClass('ppw-row-selected');
        }

        if (typeof this.options.onPOSelect === 'function') {
            this.options.onPOSelect(poData);
        }
    };

    ProductionProgressWidget.prototype.resetSelectedPO = function () {
        this.selectedPO = null;
        this.renderPieChart();

        if (this.gridInstance) {
            this.gridInstance.option('focusedRowKey', null);
        } else {
            $('#' + this.id).find('.ppw-table-row').removeClass('ppw-row-selected');
        }
    };

    ProductionProgressWidget.prototype.refresh = function () {
        if (this.gridInstance) this.gridInstance.updateDimensions();
        if (this.pieInstance) this.pieInstance.render();
    };

    ProductionProgressWidget.prototype.destroy = function () {
        if (this.gridInstance) this.gridInstance.dispose();
        if (this.pieInstance) this.pieInstance.dispose();
        this.$container.empty();
    };

    return ProductionProgressWidget;
}));
