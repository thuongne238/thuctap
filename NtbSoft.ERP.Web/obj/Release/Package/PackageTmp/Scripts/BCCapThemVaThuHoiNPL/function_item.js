$(function () {
    let _Mahang = '';
    let _MaLenh = '';
    let _MaKH = '';

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const filterMaHang = $("#filter_mahang").dxDropDownBox({
        valueExpr: "MaLenh",
        displayExpr: function (item) {
            return "Mã hàng: " + item.MaHang + " " + "Mã lệnh: " + item.MaLenh + " " + "Khách hàng: " + item.MaKH;
        },
        placeholder: "Chọn mã hàng...",
        showClearButton: true,
        label: "Mã hàng",
        dataSource: new DevExpress.data.CustomStore({
            key: "MaLenh",
            loadMode: "raw",
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
                    action: 'filter_mahang',
                    param4: formatDate(startDate),
                    param5: formatDate(endDate)
                });
            }
        }),
        dropDownOptions: { width: 700 },
        contentTemplate: function (e) {
            const value = e.component.option("value");
            const $dataGrid = $("<div>").dxDataGrid({
                dataSource: e.component.getDataSource(),
                columns: [
                    { dataField: "STT", caption: "STT", width: 80 },
                    { dataField: "MaLenh", caption: "Mã Lệnh" },
                    { dataField: "MaHang", caption: "Mã Hàng" },
                    { dataField: "TenHang", caption: "Tên Hàng" },
                    { dataField: "MaKH", caption: "Khách hàng" }
                ],
                onCellPrepared: function (e) {
                    if (e.rowType === "header") {
                        e.cellElement.css({ "background-color": "#2288ff", "font-weight": "bold", "text-align": "center", "color": "white", "border": "1px solid #1a6fcc" });
                    }
                    e.cellElement.css({ "border": "1px solid #959494" });
                },
                showRowLines: true, showColumnLines: true, hoverStateEnabled: true,
                paging: { enabled: true, pageSize: 10 },
                filterRow: { visible: true },
                scrolling: { mode: "virtual" },
                selection: { mode: "single" },
                selectedRowKeys: value ? [value] : [],
                height: "100%",
                onContentReady: function (gridArgs) {
                    if (value) gridArgs.component.selectRows([value], false);
                },
                onSelectionChanged: function (selectedItems) {
                    const keys = selectedItems.selectedRowKeys;
                    const hasSelection = keys.length > 0;
                    e.component.option("value", hasSelection ? keys[0] : null);
                    if (hasSelection) {
                        const selectedData = selectedItems.selectedRowsData[0];
                        _Mahang = selectedData.MaHang;
                        _MaLenh = selectedData.MaLenh;
                        _MaKH = selectedData.MaKH;
                        localStorage.setItem('MaHang', _Mahang);
                        localStorage.setItem('MaLenh', _MaLenh);
                        localStorage.setItem('MaKH', _MaKH);
                        e.component.close();
                        loadDataCapThem(_Mahang, _MaLenh, _MaKH);
                    }
                },
                onRowClick: function (rowArgs) {
                    const selectedData = rowArgs.data;
                    e.component.option("value", selectedData.MaLenh);
                    _Mahang = selectedData.MaHang;
                    _MaLenh = selectedData.MaLenh;
                    _MaKH = selectedData.MaKH;
                    localStorage.setItem('MaHang', _Mahang);
                    localStorage.setItem('MaLenh', _MaLenh);
                    localStorage.setItem('MaKH', _MaKH);
                    e.component.close();
                    loadDataCapThem(_Mahang, _MaLenh, _MaKH);
                }
            });
            return $dataGrid;
        }
    }).dxDropDownBox("instance");
    const filterMaHangThuHoi = $("#filter_mahang_thuhoi").dxDropDownBox({
        valueExpr: "MaLenh",
        displayExpr: function (item) {
            return "Mã hàng: " + item.MaHang + " " + "Mã lệnh: " + item.MaLenh + " " + "Khách hàng: " + item.MaKH;
        },
        placeholder: "Chọn mã hàng...",
        showClearButton: true,
        label: "Mã hàng",
        dataSource: new DevExpress.data.CustomStore({
            key: "MaLenh",
            loadMode: "raw",
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
                    action: 'filter_mahang_thuhoi',
                    param4: formatDate(startDate),
                    param5: formatDate(endDate)
                });
            }
        }),
        dropDownOptions: { width: 700 },
        contentTemplate: function (e) {
            const value = e.component.option("value");
            const $dataGrid = $("<div>").dxDataGrid({
                dataSource: e.component.getDataSource(),
                columns: [
                    { dataField: "STT", caption: "STT", width: 80 },
                    { dataField: "MaLenh", caption: "Mã Lệnh" },
                    { dataField: "MaHang", caption: "Mã Hàng" },
                    { dataField: "TenHang", caption: "Tên Hàng" },
                    { dataField: "MaKH", caption: "Khách hàng" }
                ],
                onCellPrepared: function (e) {
                    if (e.rowType === "header") {
                        e.cellElement.css({ "background-color": "#2288ff", "font-weight": "bold", "text-align": "center", "color": "white", "border": "1px solid #1a6fcc" });
                    }
                    e.cellElement.css({ "border": "1px solid #959494" });
                },
                showRowLines: true, showColumnLines: true, hoverStateEnabled: true,
                paging: { enabled: true, pageSize: 10 },
                filterRow: { visible: true },
                scrolling: { mode: "virtual" },
                selection: { mode: "single" },
                selectedRowKeys: value ? [value] : [],
                height: "100%",
                onContentReady: function (gridArgs) {
                    if (value) gridArgs.component.selectRows([value], false);
                },
                onSelectionChanged: function (selectedItems) {
                    const keys = selectedItems.selectedRowKeys;
                    const hasSelection = keys.length > 0;
                    e.component.option("value", hasSelection ? keys[0] : null);
                    if (hasSelection) {
                        const selectedData = selectedItems.selectedRowsData[0];
                        _Mahang = selectedData.MaHang;
                        _MaLenh = selectedData.MaLenh;
                        _MaKH = selectedData.MaKH;
                        localStorage.setItem('MaHang', _Mahang);
                        localStorage.setItem('MaLenh', _MaLenh);
                        localStorage.setItem('MaKH', _MaKH);
                        e.component.close();
                        loadDataThuHoi(_Mahang, _MaLenh, _MaKH);
                    }
                },
                onRowClick: function (rowArgs) {
                    const selectedData = rowArgs.data;
                    e.component.option("value", selectedData.MaLenh);
                    _Mahang = selectedData.MaHang;
                    _MaLenh = selectedData.MaLenh;
                    _MaKH = selectedData.MaKH;
                    localStorage.setItem('MaHang', _Mahang);
                    localStorage.setItem('MaLenh', _MaLenh);
                    localStorage.setItem('MaKH', _MaKH);
                    e.component.close();
                    loadDataThuHoi(_Mahang, _MaLenh, _MaKH);
                }
            });
            return $dataGrid;
        }
    }).dxDropDownBox("instance");

    async function _onDateChanged() {
        const startDate = $("#select-startdate").dxDateBox("instance").option("value");
        const endDate = $("#select-enddate").dxDateBox("instance").option("value");
        if (!startDate || !endDate) return;

        const dd1 = $("#filter_mahang").dxDropDownBox("instance");
        const dd2 = $("#filter_mahang_thuhoi").dxDropDownBox("instance");
        await dd1.getDataSource().reload();
        await dd2.getDataSource().reload();

        const maHang = localStorage.getItem("MaHang");
        const maLenh = localStorage.getItem("MaLenh");
        const maKH = localStorage.getItem("MaKH");

        // ✅ Gọi hàm loadData thay vì .reload() trên grid
        if ($('#tab-thu-hoi').hasClass('active')) {
            loadDataThuHoi(maHang, maLenh, maKH);
        } else if ($('#tab-cap-them').hasClass('active')) {
            loadDataCapThem(maHang, maLenh, maKH);
        } else if ($('#tab-cap-them-ngoai-don-hang').hasClass('active')) {
            loadDataCapThemNgoaiDH();
        }
    }

    $("#select-startdate").dxDateBox({
        type: "date", value: firstDayOfMonth,
        displayFormat: "dd/MM/yyyy", label: "Ngày bắt đầu",
        labelMode: "floating", stylingMode: "outlined",
        onValueChanged: _onDateChanged
    });

    $("#select-enddate").dxDateBox({
        type: "date", value: lastDayOfMonth,
        displayFormat: "dd/MM/yyyy", label: "Ngày kết thúc",
        labelMode: "floating", stylingMode: "outlined",
        onValueChanged: _onDateChanged
    });

    $("#btn-refresh").on("click", function () {
        $("#filter_mahang").dxDropDownBox("instance").option("value", null);
        $("#filter_mahang_thuhoi").dxDropDownBox("instance").option("value", null);
        localStorage.removeItem('MaHang');
        localStorage.removeItem('MaLenh');
        localStorage.removeItem('MaKH');
        _Mahang = ''; _MaLenh = ''; _MaKH = '';

        if ($('#tab-thu-hoi').hasClass('active')) {
            loadDataThuHoi();
        } else if ($('#tab-cap-them').hasClass('active')) {
            loadDataCapThem();
        } else if ($('#tab-cap-them-ngoai-don-hang').hasClass('active')) {
            loadDataCapThemNgoaiDH();
        }
    });
});

function xuatExcel() {
    let gridId, tenFile, tieuDe;

    if ($('#tab-thu-hoi').hasClass('active')) {
        gridId = "#grid-thu-hoi";
        tenFile = "BaoCao_ThuHoi_NPL";
        tieuDe = "BÁO CÁO THU HỒI NGUYÊN PHỤ LIỆU";
    } else if ($('#tab-cap-them').hasClass('active')) {
        gridId = "#grid-cap-them";
        tenFile = "BaoCao_CapThem_NPL";
        tieuDe = "BÁO CÁO CẤP THÊM NGUYÊN PHỤ LIỆU";
    } else if ($('#tab-cap-them-ngoai-don-hang').hasClass('active')) {
        gridId = "#grid-cap-them-ngoai-don-hang";
        tenFile = "BaoCao_CapThem_NgoaiDonHang";
        tieuDe = "BÁO CÁO CẤP THÊM NGOÀI ĐƠN HÀNG";
    } else {
        return;
    }

    fetch('/Content/Image/LOGOVIKING.png')
        .then(res => res.blob())
        .then(blob => {
            const reader = new FileReader();
            reader.onloadend = function () {
                const base64Logo = reader.result.split(',')[1];
                _doExport(base64Logo);
            };
            reader.readAsDataURL(blob);
        })
        .catch(() => {
            _doExport(null);
        });

    function _doExport(base64Logo) {
        const startDate = $("#select-startdate").dxDateBox("instance").option("value");
        const endDate = $("#select-enddate").dxDateBox("instance").option("value");

        const formatDate = (date) => {
            if (!date) return "";
            const d = String(date.getDate()).padStart(2, '0');
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const y = date.getFullYear();
            return `${d}/${m}/${y}`;
        };

        const formatDateFile = (date) => {
            if (!date) return "";
            return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
        };

        const gridInstance = $(gridId).dxDataGrid("instance");
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Báo cáo");

        const HEADER_ROW_COUNT = 5;
        worksheet.getRow(1).height = 20;
        worksheet.getRow(2).height = 45;
        worksheet.getRow(3).height = 30;
        worksheet.getRow(4).height = 18;
        worksheet.getRow(5).height = 16;

        const visibleColumns = gridInstance.getVisibleColumns().filter(c => c.type !== 'groupExpand');
        const totalCols = visibleColumns.length;

        if (base64Logo) {
            const imageId = workbook.addImage({
                base64: base64Logo,
                extension: 'png',
            });
            worksheet.addImage(imageId, {
                tl: { col: 0, row: 1 },
                br: { col: 2, row: 2 },
                editAs: 'oneCell'
            });
        }

        const r1Left = worksheet.getCell(1, 1);
        r1Left.value = "VIKING VIETNAM CO., LTD";
        r1Left.font = { bold: true, size: 11, color: { argb: "FF000000" } };
        r1Left.alignment = { vertical: "middle" };
        worksheet.mergeCells(1, 1, 1, Math.floor(totalCols / 2));

        const r1Right = worksheet.getCell(1, Math.floor(totalCols / 2) + 1);
        r1Right.value = `Ngày xuất: ${formatDate(new Date())}`;
        r1Right.font = { italic: false, size: 9, color: { argb: "FF000000" } };
        r1Right.alignment = { horizontal: "right", vertical: "middle" };
        worksheet.mergeCells(1, Math.floor(totalCols / 2) + 1, 1, totalCols);

        worksheet.mergeCells(2, 3, 2, totalCols);
        const titleCell = worksheet.getCell(2, 3);
        titleCell.value = tieuDe;
        titleCell.font = {
            bold: true, size: 16, color: { argb: "FF000000" }
        };
        titleCell.alignment = { horizontal: "center", vertical: "middle" };

        worksheet.mergeCells(3, 1, 3, totalCols);
        const periodCell = worksheet.getCell(3, 1);
        periodCell.value = `Từ ngày: ${formatDate(startDate)}  —  Đến ngày: ${formatDate(endDate)}`;
        periodCell.font = { size: 10, color: { argb: "FF000000" } };
        periodCell.alignment = { horizontal: "center", vertical: "middle" };

        const maHang = localStorage.getItem("MaHang");
        const maLenh = localStorage.getItem("MaLenh");
        const maKH = localStorage.getItem("MaKH");
        worksheet.mergeCells(4, 1, 4, totalCols);
        const filterCell = worksheet.getCell(4, 1);
        filterCell.value = `Mã hàng: ${maHang || "Tất cả"}   |   Mã lệnh: ${maLenh || "Tất cả"}   |   Khách hàng: ${maKH || "Tất cả"}`;
        filterCell.font = { size: 9, italic: false, color: { argb: "FF000000" } };
        filterCell.alignment = { horizontal: "center", vertical: "middle" };



        DevExpress.excelExporter.exportDataGrid({
            component: gridInstance,
            worksheet: worksheet,
            autoFilterEnabled: true,
            keepColumnWidths: false,
            topLeftCell: { row: HEADER_ROW_COUNT + 1, column: 1 },
            customizeCell: function ({ gridCell, excelCell }) {
                if (excelCell.col === 1) {
                    worksheet.getColumn(1).width = 12;
                    worksheet.getColumn(2).width = 15;
                    worksheet.getColumn(3).width = 18;
                    worksheet.getColumn(4).width = 26;
                    worksheet.getColumn(5).width = 12;
                    worksheet.getColumn(6).width = 10;
                    worksheet.getColumn(7).width = 15;
                    worksheet.getColumn(8).width = 15;
                    worksheet.getColumn(9).width = 15;
                    worksheet.getColumn(10).width = 12;
                    worksheet.getColumn(11).width = 15;
                    worksheet.getColumn(12).width = 14;
                    worksheet.getColumn(13).width = 10;
                    worksheet.getColumn(15).width = 15;
                    worksheet.getColumn(18).width = 20;
                }
                if (gridCell.rowType === "header") {
                    excelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF009FF7" } };
                    excelCell.font = { color: { argb: "FFFFFFFF" }, bold: true };
                    excelCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
                    excelCell.border = {
                        top: { style: "thin" }, left: { style: "thin" },
                        bottom: { style: "thin" }, right: { style: "thin" }
                    };
                }
                if (gridCell.rowType === "data") {
                    excelCell.border = {
                        top: { style: "thin", color: { argb: "FFD3D3D3" } },
                        left: { style: "thin", color: { argb: "FFD3D3D3" } },
                        bottom: { style: "thin", color: { argb: "FFD3D3D3" } },
                        right: { style: "thin", color: { argb: "FFD3D3D3" } }
                    };
                }
                if (gridCell.rowType === "group") {
                    excelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F4FD" } };
                    excelCell.font = { bold: true };
                }
                if (gridCell.rowType === "totalFooter") {
                    excelCell.font = { bold: true };
                    excelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F0F0" } };
                }
            }
        }).then(function () {
            const fileName = `${tenFile}_${formatDateFile(startDate)}_${formatDateFile(endDate)}.xlsx`;
            workbook.xlsx.writeBuffer().then(function (buffer) {
                saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);
            });
        });
    }
}