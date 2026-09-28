async function GetKhachHangItemcode() {
    const isNPL = $("#nguyenphulieuid").val()
    const url = `/api/PhieuXuatHangNPL/GetV2?action=GetKHNhapTonKho&para1=${isNPL}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();
        let html = `<option value="all">Tất cả</option>`;
        data.map(x => {
            html += `
                <option value="${x.MaKH}">${x.TenKH}</option>
            `
        })
        $("#khachhangiditemcde").html(html)
        GetDanhSachItemCode()
    } catch (error) {
        console.error(error.message);
    }
}
async function GetDanhSachItemCode() {
    const isNPL = $("#nguyenphulieuid").val()
    const maKH = $("#khachhangiditemcde").val()
    const url = `/api/PhieuXuatHangNPL/GetV2?action=GetVTMK&para1=${isNPL}&para2=${maKH}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();
        let html = `<option value=""></option> <option value="all">Tất cả</option> `;
        data.map(x => {
            html += `
                <option value="${x.MaNPL}">${x.Display}</option>
            `

        })
        $("#danhsachitemcode").html(html)
        GetCTDanhSachItemCode()
    } catch (error) {
        console.error(error.message);
    }
}
async function GetCTDanhSachItemCode() {
    const isNPL = $("#nguyenphulieuid").val();
    const maKH = $("#khachhangiditemcde").val();
    const itemcode = $("#danhsachitemcode").val();
    const url = `/api/PhieuXuatHangNPL/GetV2?action=GetDanhSachCayVaiTonKhoNPL&para1=${isNPL}&para2=${maKH}&para3=${itemcode}`;


    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();

        createViewDxDataTongQuanItemCode(data);
    } catch (error) {
        console.error(error.message);
    } finally {
    }
}

function showLoadingChiTietVatTu() {
    if (dxChiTietVatTuItemCode) {
        dxChiTietVatTuItemCode.beginCustomLoading("Đang tải dữ liệu...");
    } else {
        $("#dxChiTietVatTuItemCode").dxLoadPanel({
            visible: true,
            showIndicator: true,
            showPane: true,
            shading: true,
            message: "Đang tải dữ liệu..."
        }).dxLoadPanel("instance").show();
    }
}

function hideLoadingChiTietVatTu() {
    if (dxChiTietVatTuItemCode) {
        dxChiTietVatTuItemCode.endCustomLoading();
    } else {
        const lp = $("#dxChiTietVatTuItemCode").data("dxLoadPanel");
        if (lp) lp.hide();
    }
}

$(function () {
    GetKhachHangItemcode()
})

let dxChiTietVatTuItemCode;
function createViewDxDataTongQuanItemCode(data) {
    const tongTonKhoTheoMaNPL = {};
    (data || []).forEach(item => {
        const maNPL = item.MaNPL;

        if (!maNPL) return;

        if (!tongTonKhoTheoMaNPL[maNPL]) {
            tongTonKhoTheoMaNPL[maNPL] = {
                MaNPL: maNPL,
                Display: item.Display,
                SLTonKho: 0
            };
        }

        tongTonKhoTheoMaNPL[maNPL].SLTonKho += Number(item.SLNK || 0);
    });
    console.log(tongTonKhoTheoMaNPL)
    dxChiTietVatTuItemCode = $("#dxChiTietVatTuItemCode").dxDataGrid({
        dataSource: data,
        columnAutoWidth: false,
        allowColumnResizing: false,
        columnHidingEnabled: false,
        wordWrapEnabled: true,
        showRowLines: true,
        showBorders: true,
        noDataText: "",
        scrolling: { mode: "standard" },
        filterRow: { visible: true },
        headerFilter: { visible: false },
        paging: { enabled: false },
        width: "100%",
        renderAsync: false,
        grouping: { autoExpandAll: true },
        groupPanel: { visible: false },
        loadPanel: {
            enabled: true,
            text: "Đang tải dữ liệu...",
            showIndicator: true,
            showPane: true
        },

        columns: [
            {
                dataField: "MaNPL",
                caption: "",
                alignment: "center",
                width: 90,
                groupIndex: 0,
                visible: false,
                groupCellTemplate: function (container, options) {
                    const maNPL = options.value;
                    const itemTong = tongTonKhoTheoMaNPL[maNPL];

                    const display = itemTong ? itemTong.Display : maNPL;
                    const sum = itemTong ? Number(itemTong.SLTonKho || 0) : 0;

                    container.text(`ItemCode: ${display || ""}  -  Tổng SL Tồn kho: ${sum.toFixed(2)}`);
                }
            },
            {
                caption: "STT",
                width: 60,
                alignment: "center",
                allowFiltering: false,
                allowSorting: false,
                cellTemplate: function (container, options) {
                    container.text(options.rowIndex + 1);
                }
            },
            { dataField: "SoLo", caption: "PI NCC", alignment: "center", width: 90, visible: false },
            { dataField: "POMua", caption: "PO Mua", alignment: "center", width: 90 },
            { dataField: "MaVT", caption: "Item Code", alignment: "center", width: 110 },
            {
                dataField: "ChiTiet",
                caption: "Mô tả",
                alignment: "center",
                width: 400
            },
            { dataField: "MauVT", caption: "Màu", alignment: "center", width: 80 },
            { dataField: "SoLoT", caption: "LOT/BATCH", alignment: "center", width: 120 },
            { dataField: "KhoVai", caption: "Width/Size", alignment: "center", width: 90 },
            { dataField: "SoKien", caption: "Số Roll / Số Kiện", alignment: "center", width: 130 },
            {
                dataField: "BarCode",
                caption: "Barcode",
                alignment: "center",
                width: 160
            },
            {
                dataField: "SLNK",
                caption: "SL Tồn kho",
                alignment: "center",
                width: 90,
                dataType: "number",
                format: "#.##0",
                cellTemplate: function (container, options) {

                    const value = Number(options.value || 0);
                    $("<span>")
                        .text(value === 0 ? "" : value.toFixed(2))
                        .css({
                            fontWeight: "bold"
                        })
                        .appendTo(container);
                }
            },
            { dataField: "MaONPL", caption: "Vị trí ô", alignment: "center", width: 130 },

        ],

        summary: {
           
            totalItems: [
                {
                    column: "SLNK",
                    summaryType: "sum",
                    displayFormat: "{0}",
                    valueFormat: {
                        type: "fixedPoint",
                        precision: 2
                    },
                    customizeText: function (e) {
                        return (e.value || 0).toFixed(2);
                    },
                    cssClass: "sum-slnk"
                }
            ]
        },

        onCellPrepared: function (e) {

            if (e.rowType === "header") {
                $(e.cellElement)
                    .addClass("col-header text-center")
                    .css("vertical-align", "middle");
            }

            if (e.rowType === "data") {
                $(e.cellElement)
                    .addClass("text-center")
                    .css("vertical-align", "middle");
            }

            if (e.rowType === "totalFooter") {
                $(e.cellElement).css({
                    fontWeight: "bold",
                    color: "green",
                    textAlign: "center"
                });
            }
        }

    }).dxDataGrid("instance");

}
$(document).on("click", "#btnExportTonKhoItemCode", async function () {
    const data = dxChiTietVatTuItemCode
        ? dxChiTietVatTuItemCode.option("dataSource") || []
        : [];

    await exportAllTonKhoItemCodeExcel(data);
});
async function exportAllTonKhoItemCodeExcel(data) {
    if (!data || !data.length) {
        showToast("warning", "Không có dữ liệu để xuất Excel");
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Ton kho ItemCode");

    const columns = [
        { header: "STT", key: "STT", width: 8 },
        { header: "PO Mua", key: "POMua", width: 15 },
        { header: "Item Code", key: "MaVT", width: 18 },
        { header: "Mô tả", key: "ChiTiet", width: 45 },
        { header: "Màu", key: "MauVT", width: 15 },
        { header: "LOT/BATCH", key: "SoLoT", width: 18 },
        { header: "Width/Size", key: "KhoVai", width: 15 },
        { header: "Số Roll / Số Kiện", key: "SoKien", width: 18 },
        { header: "Barcode", key: "BarCode", width: 22 },
        { header: "SL Tồn kho", key: "SLNK", width: 15 },
        { header: "Vị trí ô", key: "MaONPL", width: 18 }
    ];

    worksheet.columns = columns;

    const headerRow = worksheet.getRow(1);
    headerRow.values = columns.map(x => x.header);
    styleHeaderRowTonKho(headerRow);

    const groupMap = {};

    data.forEach(item => {
        const maNPL = item.MaNPL || "";

        if (!groupMap[maNPL]) {
            groupMap[maNPL] = {
                MaNPL: maNPL,
                Display: item.Display,
                SLTonKho: 0,
                Rows: []
            };
        }

        groupMap[maNPL].SLTonKho += Number(item.SLNK || 0);
        groupMap[maNPL].Rows.push(item);
    });

    Object.keys(groupMap).forEach(maNPL => {
        const group = groupMap[maNPL];

        const groupRow = worksheet.addRow([]);
        groupRow.getCell(1).value =
            `ItemCode: ${group.Display || maNPL}  -  Tổng SL Tồn kho: ${group.SLTonKho.toFixed(2)}`;

        worksheet.mergeCells(groupRow.number, 1, groupRow.number, columns.length);
        styleGroupRowTonKho(groupRow);

        group.Rows.forEach((item, index) => {
            worksheet.addRow({
                STT: index + 1,
                POMua: item.POMua || "",
                MaVT: item.MaVT || "",
                ChiTiet: item.ChiTiet || "",
                MauVT: item.MauVT || "",
                SoLoT: item.SoLoT || "",
                KhoVai: item.KhoVai || "",
                SoKien: item.SoKien || "",
                BarCode: item.BarCode || "",
                SLNK: Number(item.SLNK || 0),
                MaONPL: item.MaONPL || ""
            });
        });
    });
    const totalTonKho = data.reduce((sum, item) => {
        return sum + Number(item.SLNK || 0);
    }, 0);

    const totalRow = worksheet.addRow([]);
    totalRow.getCell(1).value = "Tổng cộng";
    worksheet.mergeCells(totalRow.number, 1, totalRow.number, 9);
    totalRow.getCell(10).value = totalTonKho;

    styleTotalRowTonKho(totalRow);
    worksheet.eachRow(function (row) {
        const firstCellValue = row.getCell(1).value || "";
        const isGroupRow = String(firstCellValue).startsWith("ItemCode:");

        row.eachCell(function (cell) {
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };

            cell.alignment = {
                vertical: "middle",
                horizontal: isGroupRow ? "left" : (cell.col === 4 ? "left" : "center"),
                wrapText: !isGroupRow
            };
        });
    });

    worksheet.getColumn("SLNK").numFmt = "#,##0.00";

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const fileName = `TonKhoItemCode_${moment().format("YYYYMMDD_HHmmss")}.xlsx`;

    if (typeof saveAs === "function") {
        saveAs(blob, fileName);
    } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }
}

function styleHeaderRowTonKho(row) {
    row.height = 22;
    row.font = { bold: true };

    row.eachCell(function (cell) {
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD9EAF7" }
        };

        cell.alignment = {
            vertical: "middle",
            horizontal: "center",
            wrapText: true
        };
    });
}

function styleGroupRowTonKho(row) {
    row.height = 22;
    row.font = { bold: true };

    row.eachCell(function (cell) {
        cell.alignment = {
            vertical: "middle",
            horizontal: "left",
            wrapText: false
        };
    });
}

function styleTotalRowTonKho(row) {
    row.height = 24;
    row.font = { bold: true };

    row.eachCell({ includeEmpty: true }, function (cell) {
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
        };

        cell.alignment = {
            vertical: "middle",
            horizontal: cell.col === 10 ? "center" : "left",
            wrapText: true
        };
    });

    row.getCell(10).numFmt = "#,##0.00";
}