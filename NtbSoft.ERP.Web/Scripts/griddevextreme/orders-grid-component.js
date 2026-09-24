/**
 * ==========================================================================
 * NTBSOFT ERP - COMPONENT: BẢNG ĐƠN HÀNG & KẾ HOẠCH THỜI GIAN (DEVEXTREME)
 * File: orders-grid-component.js
 * Thư mục: Scripts/griddevextreme/
 * ==========================================================================
 */
(function (window, $) {
    'use strict';

    const OrdersGridComponent = {
        instance: null,

        /**
         * Khởi tạo DevExtreme DataGrid cho Bảng Đơn Hàng & Kế Hoạch Thời Gian
         * @param {string|HTMLElement} containerId - ID hoặc phần tử DOM chứa Grid
         * @param {Array} dataSource - Mảng dữ liệu đơn hàng
         * @param {Object} [customOptions] - Cấu hình tùy biến mở rộng nếu có
         */
        init: function (containerId, dataSource, customOptions) {
            const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
            if (!container) return null;

            if (this.instance) {
                if (dataSource) {
                    this.instance.option('dataSource', dataSource);
                    this.instance.refresh();
                }
                return this.instance;
            }

            const gridOptions = Object.assign({
                dataSource: dataSource || [],
                height: 'auto',
                showBorders: true,
                showColumnLines: true,
                showRowLines: true,
                rowAlternationEnabled: false,
                hoverStateEnabled: true,
                wordWrapEnabled: false,
                columnAutoWidth: false,
                allowColumnResizing: true,
                columnResizingMode: 'widget',
                columnFixing: {
                    enabled: true
                },
                scrolling: {
                    mode: 'standard',
                    useNative: 'auto',
                    showScrollbar: 'always'
                },
                paging: {
                    pageSize: 5
                },
                pager: {
                    visible: true,
                    showNavigationButtons: true,
                    showInfo: false,
                    displayMode: 'full'
                },
                filterRow: {
                    visible: false
                },
                columns: [
                    {
                        caption: 'ĐƠN HÀNG',
                        cssClass: 'dx-grp-don-hang',
                        alignment: 'center',
                        fixed: true,
                        fixedPosition: 'left',
                        columns: [
                            {
                                dataField: 'code',
                                caption: '1. Mã lệnh sản xuất',
                                alignment: 'center',
                                width: 145,
                                minWidth: 140,
                                fixed: true,
                                fixedPosition: 'left',
                                cellTemplate: function (cellElement, cellInfo) {
                                    $('<span>')
                                        .css({ fontWeight: '700', color: '#1D4ED8', fontFamily: 'var(--font-mono)' })
                                        .text(cellInfo.value || '')
                                        .appendTo(cellElement);
                                }
                            },
                            {
                                dataField: 'style',
                                caption: '2. Style',
                                alignment: 'center',
                                width: 135,
                                minWidth: 125,
                                fixed: true,
                                fixedPosition: 'left',
                                cellTemplate: function (cellElement, cellInfo) {
                                    $('<span>')
                                        .css({ fontWeight: '600', fontFamily: 'var(--font-inter)' })
                                        .text(cellInfo.value || '')
                                        .appendTo(cellElement);
                                }
                            },
                            {
                                dataField: 'des',
                                caption: '3. Chủng loại (Des)',
                                alignment: 'center',
                                width: 185,
                                minWidth: 170,
                                fixed: true,
                                fixedPosition: 'left',
                                cssClass: 'cell-text'
                            },
                            {
                                dataField: 'slkh',
                                caption: '4. Số lượng KH',
                                width: 135,
                                minWidth: 125,
                                fixed: true,
                                fixedPosition: 'left',
                                alignment: 'center',
                                calculateSortValue: function (data) {
                                    if (!data || data.slkh == null) return 0;
                                    if (typeof data.slkh === 'number') return data.slkh;
                                    const clean = String(data.slkh).replace(/,/g, '').replace(/[^\d.-]/g, '');
                                    return parseFloat(clean) || 0;
                                },
                                cellTemplate: function (cellElement, cellInfo) {
                                    const raw = cellInfo.data && cellInfo.data.slkh != null ? cellInfo.data.slkh : cellInfo.value;
                                    let formattedVal = raw;
                                    if (typeof raw === 'number') {
                                        formattedVal = raw.toLocaleString('en-US');
                                    } else if (raw != null) {
                                        const cleanNum = Number(String(raw).replace(/,/g, '').trim());
                                        if (!isNaN(cleanNum)) {
                                            formattedVal = cleanNum.toLocaleString('en-US');
                                        }
                                    }
                                    $('<span>')
                                        .css({ fontFamily: 'var(--font-mono)', fontWeight: '700' })
                                        .html(`${formattedVal || 0} <span class="col-pcs-unit" style="font-size: 12px; color: #000000; font-weight: 800; margin-left: 2px;">pcs</span>`)
                                        .appendTo(cellElement);
                                }
                            }
                        ]
                    },
                    {
                        caption: 'THỜI GIAN',
                        cssClass: 'dx-grp-thoi-gian',
                        columns: [
                            { dataField: 'khCat', caption: '5. KH Cắt', width: 100, minWidth: 95, alignment: 'center' },
                            {
                                dataField: 'ttCat',
                                caption: '6. TT Cắt',
                                width: 100,
                                minWidth: 95,
                                alignment: 'center',
                                cellTemplate: function (cellElement, cellInfo) {
                                    const row = cellInfo.data;
                                    const isLate = row.ttCat > row.khCat;
                                    $('<span>')
                                        .addClass('octo-chip ' + (isLate ? 'chip-orange' : 'chip-green'))
                                        .text(cellInfo.value || '')
                                        .appendTo(cellElement);
                                }
                            },
                            { dataField: 'khLapTrinh', caption: '7. KH Lập Trình', width: 125, minWidth: 115, alignment: 'center' },
                            {
                                dataField: 'ttLapTrinh',
                                caption: '8. TT Lập Trình',
                                width: 125,
                                minWidth: 115,
                                alignment: 'center',
                                cellTemplate: function (cellElement, cellInfo) {
                                    const row = cellInfo.data;
                                    const isLate = row.ttLapTrinh > row.khLapTrinh;
                                    $('<span>')
                                        .addClass('octo-chip ' + (isLate ? 'chip-orange' : 'chip-green'))
                                        .text(cellInfo.value || '')
                                        .appendTo(cellElement);
                                }
                            },
                            { dataField: 'khMay', caption: '9. KH Máy', width: 100, minWidth: 95, alignment: 'center' },
                            {
                                dataField: 'ttMay',
                                caption: '10. TT Máy',
                                width: 100,
                                minWidth: 95,
                                alignment: 'center',
                                cellTemplate: function (cellElement, cellInfo) {
                                    const row = cellInfo.data;
                                    const isLate = cellInfo.value !== '--' && row.ttMay > row.khMay;
                                    $('<span>')
                                        .addClass('octo-chip ' + (cellInfo.value === '--' ? '' : (isLate ? 'chip-orange' : 'chip-green')))
                                        .text(cellInfo.value || '')
                                        .appendTo(cellElement);
                                }
                            },
                            { dataField: 'khThoatChuyen', caption: '11. KH Thoát chuyền', width: 155, minWidth: 145, alignment: 'center' },
                            {
                                dataField: 'ttThoatChuyen',
                                caption: '12. TT Thoát chuyền',
                                width: 155,
                                minWidth: 145,
                                alignment: 'center',
                                cellTemplate: function (cellElement, cellInfo) {
                                    const row = cellInfo.data;
                                    const isLate = cellInfo.value !== '--' && row.ttThoatChuyen > row.khThoatChuyen;
                                    $('<span>')
                                        .addClass('octo-chip ' + (cellInfo.value === '--' ? '' : (isLate ? 'chip-red' : 'chip-green')))
                                        .text(cellInfo.value || '')
                                        .appendTo(cellElement);
                                }
                            }
                        ]
                    }
                ],
                noDataText: 'Không tìm thấy dữ liệu đơn hàng phù hợp',
                onRowClick: function (e) {
                    if (customOptions && typeof customOptions.onRowClick === 'function') {
                        customOptions.onRowClick(e);
                    } else if (e.data && window.CommonDetailPopup) {
                        window.CommonDetailPopup.showOrder(e.data);
                    } else if (e.data && typeof window.showOrderDetailPopup === 'function') {
                        window.showOrderDetailPopup(e.data);
                    }
                }
            }, customOptions || {});

            this.instance = $(container).dxDataGrid(gridOptions).dxDataGrid('instance');
            return this.instance;
        },

        reload: function (dataSource) {
            if (this.instance) {
                if (dataSource) {
                    this.instance.option('dataSource', dataSource);
                }
                this.instance.refresh();
            }
        },

        repaint: function () {
            if (this.instance) {
                this.instance.repaint();
            }
        },

        getInstance: function () {
            return this.instance;
        }
    };

    window.OrdersGridComponent = OrdersGridComponent;
})(window, window.jQuery || window.$);
