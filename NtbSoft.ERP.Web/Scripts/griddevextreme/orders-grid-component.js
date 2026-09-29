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
                columnAutoWidth: true,
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
                                dataField: 'lenhSX',
                                caption: 'Lệnh Sản Xuất',
                                alignment: 'center',
                                minWidth: 140,
                                fixed: true,
                                fixedPosition: 'left',
                                cellTemplate: function (cellElement, cellInfo) {
                                    const val = cellInfo.value || cellInfo.data.LenhSX;
                                    $('<span>')
                                        .css({ fontWeight: '700', color: '#1D4ED8', fontFamily: 'var(--font-inter)' })
                                        .text(val || '--')
                                        .appendTo(cellElement);
                                }
                            },
                            {
                                dataField: 'TenHang',
                                caption: 'Tên Hàng',
                                alignment: 'center',
                                width: 250,
                                fixed: true,
                                fixedPosition: 'left',
                                cellTemplate: function (cellElement, cellInfo) {
                                    const val = cellInfo.value || cellInfo.data.TenHang;
                                    $('<span>')
                                        .css({ fontWeight: '600', fontFamily: 'var(--font-inter)' })
                                        .text(val || '--')
                                        .appendTo(cellElement);
                                }
                            },
                            {
                                dataField: 'TenCL',
                                caption: 'Tên CL',
                                alignment: 'center',
                                minWidth: 170,
                                fixed: true,
                                fixedPosition: 'left',
                                cssClass: 'cell-text',
                                cellTemplate: function (cellElement, cellInfo) {
                                    const val = cellInfo.value || cellInfo.data.TenCL;
                                    $('<span>')
                                        .text(val || '--')
                                        .appendTo(cellElement);
                                }
                            }
                        ]
                    },
                    {
                        caption: 'THỜI GIAN',
                        cssClass: 'dx-grp-thoi-gian',
                        columns: [
                            {
                                dataField: 'KHCat',
                                caption: 'KH Cắt',
                                minWidth: 95,
                                alignment: 'center',
                                cellTemplate: function (cellElement, cellInfo) {
                                    const val = cellInfo.value || cellInfo.data.KHCat;
                                    cellElement.text(val || '--');
                                }
                            },
                            {
                                dataField: 'TTCat',
                                caption: 'TT Cắt',
                                minWidth: 95,
                                alignment: 'center',
                                cellTemplate: function (cellElement, cellInfo) {
                                    const row = cellInfo.data;
                                    const val = cellInfo.value || row.TTCat;
                                    if (!val) {
                                        cellElement.text('--');
                                        return;
                                    }
                                    const kh = row.khCat || row.KHCat;
                                    const isLate = val > kh;
                                    $('<span>')
                                        .addClass('octo-chip ' + (isLate ? 'chip-orange' : 'chip-green'))
                                        .text(val)
                                        .appendTo(cellElement);
                                }
                            },
                            {
                                dataField: 'KHLapTrinh',
                                caption: 'KH Lập Trình',
                                minWidth: 115,
                                alignment: 'center',
                                cellTemplate: function (cellElement, cellInfo) {
                                    const val = cellInfo.value || cellInfo.data.KHLapTrinh;
                                    cellElement.text(val || '--');
                                }
                            },
                            {
                                dataField: 'TTLapTrinh',
                                caption: 'TT Lập Trình',
                                minWidth: 115,
                                alignment: 'center',
                                cellTemplate: function (cellElement, cellInfo) {
                                    const row = cellInfo.data;
                                    const val = cellInfo.value || row.TTLapTrinh;
                                    if (!val) {
                                        cellElement.text('--');
                                        return;
                                    }
                                    const kh = row.khLapTrinh || row.KHLapTrinh;
                                    const isLate = val > kh;
                                    $('<span>')
                                        .addClass('octo-chip ' + (isLate ? 'chip-orange' : 'chip-green'))
                                        .text(val)
                                        .appendTo(cellElement);
                                }
                            },
                            {
                                dataField: 'KHMay',
                                caption: 'KH May',
                                minWidth: 95,
                                alignment: 'center',
                                cellTemplate: function (cellElement, cellInfo) {
                                    const val = cellInfo.value || cellInfo.data.KHMay;
                                    cellElement.text(val || '--');
                                }
                            },
                            {
                                dataField: 'TTMay',
                                caption: 'TT May',
                                minWidth: 95,
                                alignment: 'center',
                                cellTemplate: function (cellElement, cellInfo) {
                                    const row = cellInfo.data;
                                    const val = cellInfo.value || row.TTMay;
                                    if (!val) {
                                        cellElement.text('--');
                                        return;
                                    }
                                    const kh = row.khMay || row.KHMay;
                                    const isLate = val > kh;
                                    $('<span>')
                                        .addClass('octo-chip ' + (isLate ? 'chip-orange' : 'chip-green'))
                                        .text(val)
                                        .appendTo(cellElement);
                                }
                            },
                            {
                                dataField: 'KHThoatChuyen',
                                caption: 'KH Thoát Chuyền',
                                minWidth: 145,
                                alignment: 'center',
                                cellTemplate: function (cellElement, cellInfo) {
                                    const val = cellInfo.value || cellInfo.data.KHThoatChuyen;
                                    cellElement.text(val || '--');
                                }
                            },
                            {
                                dataField: 'TTThoatChuyen',
                                caption: 'TT Thoát Chuyền',
                                minWidth: 145,
                                alignment: 'center',
                                cellTemplate: function (cellElement, cellInfo) {
                                    const row = cellInfo.data;
                                    const val = cellInfo.value || row.TTThoatChuyen;
                                    if (!val) {
                                        cellElement.text('--');
                                        return;
                                    }
                                    const kh = row.khThoatChuyen || row.KHThoatChuyen;
                                    const isLate = val > kh;
                                    $('<span>')
                                        .addClass('octo-chip ' + (isLate ? 'chip-red' : 'chip-green'))
                                        .text(val)
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
