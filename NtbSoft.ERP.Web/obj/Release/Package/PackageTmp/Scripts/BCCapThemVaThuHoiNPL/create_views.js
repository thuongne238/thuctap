$(document).ready(function () {
    localStorage.removeItem('MaHang');
    localStorage.removeItem('MaLenh');
    localStorage.removeItem('MaKH');

    $("#grid-cap-them").dxDataGrid({
        /*dataSource: [],*/
        dataSource: new DevExpress.data.CustomStore({
            key: "MaLenh", // Thay bằng key thực tế của bạn
            load: function () {
                const startDate = $("#select-startdate").dxDateBox("instance").option("value");
                const endDate = $("#select-enddate").dxDateBox("instance").option("value");

                const formatDate = (date) => {
                    if (!date) return null;
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };
                return $.getJSON('/api/baocao/get', {
                    action: 'baocaocapthem',
                    param1: localStorage.getItem("MaHang"),
                    param2: localStorage.getItem("MaLenh"),
                    param3: localStorage.getItem("MaKH"),
                    param4: formatDate(startDate),
                    param5: formatDate(endDate)
                });
            }
        }),
        showBorders: true,
        paging: {
            enabled: false
        },
        export: {
            enabled: false  
        },
        showRowLines: true,
        showColumnLines: true,
        showBorders: true,
        columnAutoWidth: true,
        wordWrapEnabled: true,
        filterRow: { visible: true },
        width: "100%",
        columns: [
            {
                caption: "STT",
                alignment: "center",
                width: 50,
                cellTemplate: function (container, options) {
                    const index = options.component.pageIndex() * options.component.pageSize() + options.rowIndex + 1;
                    container.text(options.row.data ? (options.component.getVisibleRows().filter(r => r.rowType === 'data').indexOf(options.row) + 1) : "");
                }
            },
            { dataField: "MaLenh", caption: "Mã lệnh", visible: false },
            { dataField: "PhieuTH", caption: "Phiếu CT" },
            { dataField: "TenPB", caption: "Bộ phận", alignment:"center" },
            { dataField: "TenKH", caption: "Khách hàng" },
            { dataField: "MaHang", caption: "Mã Hàng", width: 100 },
            { dataField: "NguoiGiamSat", caption: "MD", with:80},
            { dataField: "MaNPL", caption: "Mã NPL", visible: false },
            { dataField: "CustomGr1", caption: "Mã lệnh", groupIndex: 0 },
            { dataField: "ItemCode", caption: "ItemCode" },
            { dataField: "MoTa", caption: "Mô tả" },
            { dataField: "MauVT", caption: "Màu vật tư" },
            { dataField: "KhoVaiID", caption: "Khổ/size" },
            {
                dataField: "NgayDK",
                caption: "Ngày đăng ký",
                dataType: "date",
                format: "dd/MM/yyyy"
            },
            {
                dataField: "NgayTH",
                caption: "Ngày cấp thêm",
                dataType: "date",
                format: "dd/MM/yyyy"
            },
            //{
            //    dataField: "NgayThucHien",
            //    caption: "Ngày thực hiện",
            //    dataType: "date",
            //    format: "dd/MM/yyyy"
            //},
            {
                dataField: "NguoiTH",
                caption: "Người thực hiện",
          
                //calculateCellValue: function (data) {
                //    return data.TenNV ?? data.NguoiTH;

                //}
            },
            {
                dataField: "CapPhat",
                caption: "SL cấp phát",
                alignment: "center",
                format: "#,##0.000"   
            },
            {
                dataField: "SLDK",
                caption: "SL đăng ký cấp thêm",
                alignment: "center",
                format: "#,##0.000"   
            },
            {
                dataField: "SLNhap",
                caption: "SL cấp thực tế",
                alignment: "center",
                format: "#,##0.000"  
            },
            {
                caption: "% Cấp thêm",
                alignment: "center",
                calculateCellValue: function (data) {
                    if (!data.CapPhat || data.CapPhat === 0) return null; 
                    return data.SLDK / data.CapPhat;
                },
                format: {
                    type: "percent",
                    precision: 2
                }
            },
            { dataField: "TenDVCD", caption: "Đơn vị" },
            { dataField: "DonGia", caption: "Đơn giá" },
            {
                dataField: "ThanhTien",
                caption: "Thành tiền",
                format: "#,##0.000"
            },
            { dataField: "TienTe", caption: "Tiền tệ" },    
            {
                dataField: "TrongDinhMuc",
                caption: "Trong định mức",
                alignment: "center",
                allowEditing: false,
                cellTemplate: function (container, options) {
                    $("<div/>").dxCheckBox({
                        value: options.value === 1,
                        readOnly: true
                    }).appendTo(container);
                }
            },
            {
                dataField: "NgoaiDinhMuc",
                caption: "Ngoài định mức",
                alignment: "center",
                allowEditing: false,
                cellTemplate: function (container, options) {
                    $("<div/>").dxCheckBox({
                        value: options.value === 1,
                        readOnly: true
                    }).appendTo(container);
                }
            },
            { dataField: "GhiChu", caption: "Lí do" },
        ],
        summary: {
            totalItems: [{
                column: "ThanhTien",
                summaryType: "sum",
                valueFormat: "#,##0.00",
                displayFormat: "Tổng: {0}",
                showInColumn: "ThanhTien"
            }]
        },
        onCellPrepared: function (e) {
            if (e.rowType === "header") {
                $(e.cellElement).css({
                    "background-color": "#115f8b",
                    "color": "#ffffff",
                    "text-align": "center",
                    "vertical-align": "middle",
                    "font-weight": "bold"
                });
            }

            const mergeFields = ["PhieuTH", "NguoiTH", "TenPB", "TenKH", "MaHang", "NguoiGiamSat", "NgayDK","NgayTH"];

            if (e.rowType === "data" && mergeFields.includes(e.column.dataField)) {
                const rows = e.component.getVisibleRows().filter(r => r.rowType === 'data');
                const currentRow = rows.find(r => r.rowIndex === e.rowIndex);
                if (!currentRow) return;

                const currentGroup = currentRow.data.CustomGr1;

                const firstRow = rows.find(r =>
                    r.data.PhieuTH === currentRow.data.PhieuTH &&
                    r.data.CustomGr1 === currentGroup
                );

                if (firstRow && firstRow.rowIndex === e.rowIndex) {
                    const count = rows.filter(r =>
                        r.data.PhieuTH === currentRow.data.PhieuTH &&
                        r.data.CustomGr1 === currentGroup
                    ).length;

                    if (count > 1) {
                        $(e.cellElement).attr("rowspan", count).css("vertical-align", "middle");
                    }
                } else {
                    $(e.cellElement).hide();
                }
            }
        }
    });

    $("#grid-thu-hoi").dxDataGrid({
        dataSource: [],
        showBorders: true,
        paging: {
            enabled: false
        },
        showRowLines: true,
        showColumnLines: true,
        showBorders: true,
        export: {
            enabled: false  
        },
        columnAutoWidth: true,
        wordWrapEnabled: true,
        filterRow: { visible: true },
        width: "100%",
        columns: [
            {
                caption: "STT",
                alignment: "center",
                width: 50,
                cellTemplate: function (container, options) {
                    const index = options.component.pageIndex() * options.component.pageSize() + options.rowIndex + 1;
                    container.text(options.row.data ? (options.component.getVisibleRows().filter(r => r.rowType === 'data').indexOf(options.row) + 1) : "");
                }
            },
            { dataField: "PhieuTH", caption: "Phiếu TH" },
            { dataField: "MaNPL", caption: "Mã NPL", visible: false },
            { dataField: "ItemCode", caption: "ItemCode" },
            { dataField: "MoTa", caption: "Mô tả" },
            { dataField: "MaLenh", caption: "Mã lệnh", groupIndex: 0 },
            { dataField: "MaVT", caption: "Mã vật tư", visible: false },
            { dataField: "MauVT", caption: "Màu vật tư" },
            { dataField: "KhoVai", caption: "Khổ/size" },
            {
                dataField: "NgayDK",
                caption: "Ngày đăng ký",
                dataType: "date",
                format: "dd/MM/yyyy"
            },
            {
                dataField: "NgayTH",
                caption: "Ngày thu hồi",
                dataType: "date",
                format: "dd/MM/yyyy"
            },
            { dataField: "NguoiTH", caption: "Người thực hiện", width: 100 },
            { dataField: "Dot", caption: "Đợt", visible: true, alignment: "center"},
            { dataField: "SLDK", caption: "SL đăng ký thu hồi", alignment: "center" },
            { dataField: "TongThuHoi", caption: "SL thu hồi thực tế", alignment: "center"},
        { dataField: "TenDVCD", caption: "Đơn vị", alignment: "center" },
        { dataField: "DonGia", caption: "Đơn giá", alignment: "center" },
            {
                dataField: "ThanhTien",
                caption: "Thành tiền",
                format: {
                    type: "fixedPoint",
                    precision: 3
                }
            },
            { dataField: "Palet", caption: "Lí do" },
        ],
        summary: {
            totalItems: [{
                column: "ThanhTien",
                summaryType: "sum",
                valueFormat: "#,##0",
                displayFormat: "Tổng: {0}",
                showInColumn: "ThanhTien"
            }]
        },
        onCellPrepared: function (e) {
            if (e.rowType === "header") {
                $(e.cellElement).css({
                    "background-color": "#115f8b",
                    "color": "#ffffff",
                    "text-align": "center",
                    "vertical-align": "middle",
                    "font-weight": "bold"
                });
            }
            if (e.rowType === "data") {
                //$(e.cellElement).css("text-align", "center");
            }
        }
    });

    $("#grid-cap-them-ngoai-don-hang").dxDataGrid({
        dataSource: [],
        showBorders: true,
        paging: {
            enabled: false
        },
        showRowLines: true,
        showColumnLines: true,
        showBorders: true,
        columnAutoWidth: true,
        wordWrapEnabled: true,
        export: {
            enabled: false  
        },
        filterRow: { visible: true },
        width: "100%",
        columns: [
            {
                caption: "STT",
                width: 50,
                allowEditing: false,
                allowSorting: false,
                cellTemplate: function (container, options) {
                    container.text(options.rowIndex + 1);
                }
            },
            { dataField: "PhieuCT_NgoaiDH", caption: "Phiếu CT_BN" },
            { dataField: "MaNPL", caption: "Mã NPL", visible: false },
            { dataField: "ItemCode", caption: "ItemCode" },
            { dataField: "MoTa", caption: "Mô tả" },
            { dataField: "MaVT", caption: "Mã vật tư", visible: false },
            { dataField: "MauVT", caption: "Màu vật tư" },
            { dataField: "KhoVai", caption: "Khổ/size" },
            {
                dataField: "NgayDK",
                caption: "Ngày đăng ký",
                dataType: "date",
                format: "dd/MM/yyyy"
            },
            {
                dataField: "NgayTH",
                caption: "Ngày cấp thêm",
                dataType: "date",
                format: "dd/MM/yyyy"
            },
            { dataField: "NguoiTH", caption: "Người thực hiện", width:100  },
            { dataField: "Dot", caption: "Đợt", visible: true, alignment: "center" },
            { dataField: "SLDK", caption: "SL đăng ký cấp thêm", alignment: "center"},
            { dataField: "SLCapThem", caption: "SL cấp thêm thực tế", alignment: "center"},
            { dataField: "TenDVVT", caption: "Đơn vị", alignment: "center" },
            { dataField: "DonGia", caption: "Đơn giá", alignment: "center" },
            {
                dataField: "ThanhTien",
                caption: "Thành tiền",
                format: {
                    type: "fixedPoint",
                    precision: 3
                }
            },
            { dataField: "LiDo", caption: "Lí do" },
        ],
        summary: {
            totalItems: [{
                column: "ThanhTien",
                summaryType: "sum",
                valueFormat: "#,##0",
                displayFormat: "Tổng: {0}",
                showInColumn: "ThanhTien"
            }]
        },
        onCellPrepared: function (e) {
            if (e.rowType === "header") {
                $(e.cellElement).css({
                    "background-color": "#115f8b",
                    "color": "#ffffff",
                    "text-align": "center",
                    "vertical-align": "middle",
                    "font-weight": "bold"
                });
            }
            if (e.rowType === "data" &&
                (e.column.dataField === "PhieuCT_NgoaiDH" || e.column.dataField === "NguoiTH")) {

                const rows = e.component.getVisibleRows().filter(r => r.rowType === 'data');
                const currentRow = rows.find(r => r.rowIndex === e.rowIndex);
                if (!currentRow) return;

                const currentPhieu = currentRow.data.PhieuCT_NgoaiDH;

                const firstRow = rows.find(r => r.data.PhieuCT_NgoaiDH === currentPhieu);

                if (firstRow && firstRow.rowIndex === e.rowIndex) {
                    const count = rows.filter(r => r.data.PhieuCT_NgoaiDH === currentPhieu).length;
                    if (count > 1) {
                        $(e.cellElement)
                            .attr("rowspan", count)
                            .css("vertical-align", "middle");
                    }
                } else {
                    $(e.cellElement).hide();
                }
            }
        }
    });

    const firstTab = document.querySelector('a[href="#tab-cap-them"]');
    bootstrap.Tab.getOrCreateInstance(firstTab).show();

    $('a[data-bs-toggle="pill"]').on('shown.bs.tab', function (e) {
        var targetTab = $(e.target).attr("href");

        const maHang = localStorage.getItem("MaHang");
        const maLenh = localStorage.getItem("MaLenh");
        const maKH = localStorage.getItem("MaKH");

        if (targetTab === "#tab-thu-hoi") {
            $("#filter_mahang").hide();
            $("#filter_mahang_thuhoi").show();

            $("#filter_mahang_thuhoi").dxDropDownBox("instance").getDataSource().reload();

            loadDataThuHoi(maHang, maLenh, maKH);

            setTimeout(function () {
                $("#grid-thu-hoi").dxDataGrid("instance").repaint();
            }, 100);
        }

        else if (targetTab === "#tab-cap-them") {
            $("#filter_mahang").show();
            $("#filter_mahang_thuhoi").hide();

            loadDataCapThem(maHang, maLenh, maKH);

            setTimeout(function () {
                $("#grid-cap-them").dxDataGrid("instance").repaint();
            }, 100);
        }

        else if (targetTab === "#tab-cap-them-ngoai-don-hang") {
            $("#filter_mahang").hide();
            $("#filter_mahang_thuhoi").hide();

            loadDataCapThemNgoaiDH();

            setTimeout(function () {
                $("#grid-cap-them-ngoai-don-hang").dxDataGrid("instance").repaint();
            }, 100);
        }
    });

    $('#Layer_1').click();
});
$(document).ready(function () {
    var style = document.createElement('style');
    style.id = 'sticky-grid-header-style';
    style.innerHTML = `
        .dx-datagrid-headers { 
            position: sticky !important; 
            top: -100px !important; 
            z-index: 1 !important; 
        }
        .dx-overlay-wrapper,
        .dx-overlay-content,
        .dx-popup-wrapper {
            z-index: 9999 !important;
        }
    `;
    document.head.appendChild(style);
});
