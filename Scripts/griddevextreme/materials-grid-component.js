/**
 * ==========================================================================
 * NTBSOFT ERP - COMPONENT: BẢNG TÌNH HÌNH NGUYÊN PHỤ LIỆU (DEVEXTREME)
 * File: materials-grid-component.js
 * Thư mục: Scripts/griddevextreme/
 * ==========================================================================
 */
(function (window, $) {
    'use strict';

    const MaterialsGridComponent = {
        instance: null,

        /**
         * Khởi tạo DevExtreme DataGrid cho Bảng Tình Hình Nguyên Phụ Liệu
         * @param {string|HTMLElement} containerId - ID hoặc phần tử DOM chứa Grid
         * @param {Array} dataSource - Mảng dữ liệu nguyên phụ liệu
         * @param {Object} [options] - Cấu hình callbacks và tùy biến mở rộng
         */
        init: function (containerId, dataSource, options) {
            const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
            if (!container) return null;

            options = options || {};

            if (this.instance) {
                if (dataSource) {
                    this.instance.option('dataSource', dataSource);
                    this.instance.refresh();
                }
                return this.instance;
            }

            const gridOptions = Object.assign({
                dataSource: dataSource || [],
                height: 265,
                showBorders: true,
                showColumnLines: false,
                showRowLines: true,
                rowAlternationEnabled: false,
                hoverStateEnabled: true,
                wordWrapEnabled: false,
                scrolling: { mode: 'standard' },
                paging: {
                    pageSize: 5
                },
                pager: {
                    visible: true,
                    showNavigationButtons: true,
                    showInfo: false,
                    displayMode: 'full'
                },
                columns: [
                    {
                        dataField: 'name',
                        caption: 'Loại NPL',
                        minWidth: 150,
                        cellTemplate: function (cellElement, cellInfo) {
                            $('<span>')
                                .css({ fontWeight: '600', color: '#1D4ED8', cursor: 'pointer', fontFamily: 'var(--font-inter)' })
                                .html(`<i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 10px; margin-right: 5px; opacity: 0.6;"></i>${cellInfo.value || ''}`)
                                .appendTo(cellElement);
                        }
                    },
                    {
                        dataField: 'demand',
                        caption: 'Nhu Cầu',
                        minWidth: 90,
                        alignment: 'right',
                        cssClass: 'font-mono',
                        calculateSortValue: function (data) {
                            if (!data || data.demand == null) return 0;
                            if (typeof data.demand === 'number') return data.demand;
                            const clean = String(data.demand).replace(/,/g, '').replace(/[^\d.-]/g, '');
                            return parseFloat(clean) || 0;
                        }
                    },
                    {
                        dataField: 'available',
                        caption: 'Đã Có',
                        minWidth: 90,
                        alignment: 'right',
                        cssClass: 'font-mono',
                        calculateSortValue: function (data) {
                            if (!data || data.available == null) return 0;
                            if (typeof data.available === 'number') return data.available;
                            const clean = String(data.available).replace(/,/g, '').replace(/[^\d.-]/g, '');
                            return parseFloat(clean) || 0;
                        }
                    },
                    {
                        dataField: 'rate',
                        caption: '% Đủ',
                        minWidth: 130,
                        calculateSortValue: function (data) {
                            if (!data || data.rate == null) return 0;
                            return Number(data.rate) || 0;
                        },
                        cellTemplate: function (cellElement, cellInfo) {
                            const item = cellInfo.data;
                            const rate = cellInfo.value || 0;
                            const barColor = item.barColor || '#3B82F6';
                            $('<div>')
                                .css({ display: 'flex', alignItems: 'center', gap: '8px' })
                                .html(`
                                    <div class="progress-bar-container" style="flex: 1; height: 6px; background-color: #E2E8F0; border-radius: 9999px; overflow: hidden;">
                                        <div class="progress-bar-fill" style="width: ${rate}%; height: 100%; border-radius: 9999px; background-color: ${barColor};"></div>
                                    </div>
                                    <span style="font-family: var(--font-mono); font-weight: 700; font-size: 11.5px; width: 34px; text-align: right;">${rate}%</span>
                                `)
                                .appendTo(cellElement);
                        }
                    },
                    {
                        dataField: 'statusText',
                        caption: 'Trạng Thái',
                        minWidth: 95,
                        alignment: 'center',
                        cellTemplate: function (cellElement, cellInfo) {
                            const item = cellInfo.data;
                            $('<span>')
                                .addClass('octo-chip ' + (item.chipClass || ''))
                                .text(cellInfo.value || '')
                                .appendTo(cellElement);
                        }
                    }
                ],
                noDataText: 'Chưa có dữ liệu nguyên phụ liệu',
                onRowClick: function (e) {
                    if (typeof options.onRowClick === 'function') {
                        options.onRowClick(e);
                    } else if (e.data && typeof window.showMaterialDetailPopup === 'function') {
                        window.showMaterialDetailPopup(e.data);
                    }
                }
            }, options.gridOptions || {});

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

    window.MaterialsGridComponent = MaterialsGridComponent;
})(window, window.jQuery || window.$);
