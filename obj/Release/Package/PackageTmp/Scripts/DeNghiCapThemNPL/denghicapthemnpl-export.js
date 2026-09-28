$(document).ready(function () {
    $("#btnExportExcel").on("click", function () {
        exportDanhSachDangKyToExcel();
    });
});

// Helper: chuyển ảnh từ URL (server) thành base64
async function imageUrlToBase64(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const blob = await response.blob();
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error("Lỗi tải ảnh chữ ký:", e);
        return null;
    }
}

// Helper: tách phần base64 + extension từ data URL (data:image/png;base64,xxxx)
function parseDataUrl(dataUrl) {
    const match = /^data:image\/(\w+);base64,(.+)$/.exec(dataUrl || "");
    if (!match) return null;
    let ext = match[1].toLowerCase();
    if (ext === "jpg") ext = "jpeg";
    if (!["png", "jpeg", "gif"].includes(ext)) ext = "png";
    return { extension: ext, base64: match[2] };
}

function exportDanhSachDangKyToExcel() {
    if (!dxDataGridDanhSachDangKy) {
        showToast("warning", "Chưa có dữ liệu để xuất");
        return;
    }

    const dataSource = dxDataGridDanhSachDangKy.option("dataSource");
    if (!dataSource || dataSource.length === 0) {
        showToast("warning", "Không có dữ liệu để xuất");
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Đề nghị cấp thêm NPL");

    const HEADER_ROW = 4; // header nằm ở row 4 -> data bắt đầu row 5
    const HEADER_FILL_COLOR = "FF4F8F4F";  // chỉnh lại cho đúng màu xanh trên web
    const HEADER_FONT_COLOR = "FFFFFFFF";

    // Alignment chuẩn: center cả ngang và dọc
    const CENTER_ALIGN = { horizontal: "center", vertical: "middle", wrapText: true };

    // ===== Danh sách field cần thu nhỏ / mở rộng cột =====
    // Thay phần SMALL_WIDTH_FIELDS / WIDE_WIDTH_FIELDS bằng map này
    const COLUMN_WIDTH_MAP = {
        IsNPL: 10.71,              // Loại VT
        MaVT: 16.57,               // Item Code
        TenVT: 21.71,              // Mô tả
        MauVT: 13.25,              // Màu VT
        KhoVai: 9.15,              // Khổ/Size
        TenDVVT: 8.57,             // Đơn vị
        MaMauSP: 9.43,             // Màu SP
        SizeInfo: 31.57,           // Size SP
        CapPhat: 13.29,            // SL cấp phát
        DinhMuc: 8,                // Định mức cấp phát
        SLDKSP: 7.29,              // SL sản phẩm cấp thêm
        SLDK: 10.57,               // YC cấp thêm
        PhanTramCapThem: 8.57,     // % cấp thêm
        SLDaXuat: 9,            // Số lượng đã xuất
        TonKho: 9,              // SL tồn kho
        NgayTH: 11.50,             // Ngày YC cấp thêm
        NgayHoanTat: 11.50,        // Ngày hoàn tất
        LyDo: 25.14,               // Lý do

        TrongDinhMuc: 9,
        NgoaiDinhMuc: 9,

        SignNgDK: 13,
        SignTBPNgDK: 13,
        SignMer: 13,
        SignTBPMer: 13
    };

    // Map: số cột Excel -> dataField
    const columnFieldMap = {};

    // Số cột Excel của field "SignTBPMer" -> để merge group row tới đây
    let signTBPMerCol = null;

    // Danh sách số dòng (row) của các dòng group "Số Phiếu: ..." -> merge sau
    const groupRows = [];

    // Danh sách ảnh chữ ký cần chèn sau khi export grid xong
    const signImagesToAdd = [];

    const signFieldMap = {
        SignNgDK: { ten: "TenUserNgDK_Ten", hoTen: "HoTenNgDK", hinhAnh: "HinhAnhNgDK" },
        SignTBPNgDK: { ten: "TenUserTBPNDK_Ten", hoTen: "HoTenTBPNDK", hinhAnh: "HinhAnhTBPNDK" },
        SignMer: { ten: "TenUserMerSoatSet_Ten", hoTen: "HoTenMerSoatSet", hinhAnh: "HinhAnhMerSoatSet" },
        SignTBPMer: { ten: "TenUserTBPMerSoatSet_Ten", hoTen: "HoTenTBPMerSoatSet", hinhAnh: "HinhAnhTBPMerSoatSet" }
    };

    DevExpress.excelExporter.exportDataGrid({
        component: dxDataGridDanhSachDangKy,
        worksheet: worksheet,
        autoFilterEnabled: true,
        topLeftCell: { row: HEADER_ROW, column: 1 },
        customizeCell: function (options) {
            const { gridCell, excelCell } = options;
            if (!gridCell) return;

            // ===== Mặc định: center cả ngang và dọc cho TẤT CẢ các ô =====
            excelCell.alignment = { ...CENTER_ALIGN };
            // All borders cho toàn bộ bảng
            excelCell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };

            // Footer summary: chữ đỏ
            if (gridCell.rowType === "totalFooter") {
                excelCell.font = {
                    bold: true,
                    color: { argb: "FFFF0000" }
                };
                excelCell.alignment = { ...CENTER_ALIGN };
            }
            // ===== Dòng group "Số Phiếu: ..." =====
            if (gridCell.rowType === "group" && typeof excelCell.value === "string") {
                excelCell.value = excelCell.value
                    .replace(/\s*\(Max of[^)]*\)/gi, "")
                    .trim();
                excelCell.alignment = { ...CENTER_ALIGN, horizontal: "left" };

                if (!groupRows.includes(excelCell.row)) {
                    groupRows.push(excelCell.row);
                }
            }

            // ===== Cột "Loại VT" (IsNPL) -> Nguyên liệu / Phụ liệu =====
            if (gridCell.rowType === "data" && gridCell.column.dataField === "IsNPL") {
                const val = gridCell.value;
                const isNL = val == 1 || val === true;
                excelCell.value = isNL ? "Nguyên liệu" : "Phụ liệu";
                excelCell.alignment = { ...CENTER_ALIGN };
                excelCell.font = { bold: true, color: { argb: "FF000000" } };
                return;
            }

            // ===== Cột "Trong định mức" / "Ngoài định mức" -> checkbox =====
            if (gridCell.rowType === "data" &&
                (gridCell.column.dataField === "TrongDinhMuc" || gridCell.column.dataField === "NgoaiDinhMuc")) {
                const val = gridCell.value;
                const isChecked = val == 1 || val === true;
                excelCell.value = isChecked ? "✓" : "";
                excelCell.alignment = { ...CENTER_ALIGN };
                excelCell.font = { size: 14, bold: true, color: { argb: "FF000000" } };
                return;
            }

            // ===== Cột chữ ký -> hiện TÊN người ký + ẢNH chữ ký giống web =====
            if (gridCell.rowType === "data" && signFieldMap[gridCell.column.dataField]) {
                const map = signFieldMap[gridCell.column.dataField];
                const rowData = gridCell.data || {};
                const signVal = rowData[gridCell.column.dataField];

                if (signVal && String(signVal).trim() !== "") {
                    const name = (rowData[map.ten] || rowData[map.hoTen] || "").trim();
                    excelCell.value = name;

                    let imgUrl = null;
                    if (signVal === "checked") {
                        const hinhAnh = map.hinhAnh ? rowData[map.hinhAnh] : "";
                        if (hinhAnh) imgUrl = `/Images/NhanVien/${hinhAnh}`;
                    } else if (String(signVal).startsWith("data:image")) {
                        imgUrl = signVal;
                    } else {
                        imgUrl = `/Images/SignDeNghiCapThemNPL/${signVal}`;
                    }

                    if (imgUrl) {
                        signImagesToAdd.push({
                            row: excelCell.row,
                            col: excelCell.col,
                            url: imgUrl
                        });
                        excelCell.alignment = { horizontal: "center", vertical: "bottom", wrapText: true };
                    } else {
                        excelCell.alignment = { ...CENTER_ALIGN };
                    }
                } else {
                    excelCell.value = "";
                    excelCell.alignment = { ...CENTER_ALIGN };
                }
                return;
            }

            // ===== Format số liệu cho các cột số + ngày =====
            if (gridCell.rowType === "data" && gridCell.value != null) {
                const numericFields = ["CapPhat", "SLDKSP", "SLDK", "SLDaXuat", "TonKho", "PhanTramCapThem"];
                if (numericFields.includes(gridCell.column.dataField)) {
                    const val = Number(gridCell.value);
                    if (!Number.isNaN(val)) {
                        excelCell.value = val;
                        // Số nguyên -> không hiện phần thập phân (tránh dư dấu "." cuối)
                        // Số có phần thập phân -> hiện tối đa 4 số
                        excelCell.numFmt = (val % 1 === 0) ? "#,##0" : "#,##0.####";
                        excelCell.alignment = { ...CENTER_ALIGN };
                    }
                }

                // Ngày YC Cấp thêm
                if (gridCell.column.dataField === "NgayTH" && gridCell.value) {
                    excelCell.value = new Date(gridCell.value);
                    excelCell.numFmt = "dd/mm/yyyy";
                    excelCell.alignment = { ...CENTER_ALIGN };
                }

                // ===== Ngày Hoàn Tất -> chuẩn hóa về Date + format dd/mm/yyyy =====
                if (gridCell.column.dataField === "NgayHoanTat" && gridCell.value) {
                    excelCell.value = new Date(gridCell.value);
                    excelCell.numFmt = "dd/mm/yyyy";
                    excelCell.alignment = { ...CENTER_ALIGN };
                }
            }

            // Tô màu header giống giao diện web + ghi nhận map cột -> dataField
            if (gridCell.rowType === "header") {
                excelCell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: HEADER_FILL_COLOR }
                };
                excelCell.font = {
                    bold: true,
                    color: { argb: HEADER_FONT_COLOR }
                };
                excelCell.alignment = { ...CENTER_ALIGN };

                if (gridCell.column && gridCell.column.dataField) {
                    columnFieldMap[excelCell.col] = gridCell.column.dataField;

                    if (gridCell.column.dataField === "SignTBPMer") {
                        signTBPMerCol = excelCell.col;
                    }
                }
            }
        }
    }).then(async function (cellRange) {
        const lastColumn = cellRange.to.column;

        // ===== Row 1: Tiêu đề =====
        worksheet.mergeCells(1, 1, 1, lastColumn);
        const titleCell = worksheet.getCell(1, 1);
        titleCell.value = "DANH SÁCH ĐỀ NGHỊ CẤP THÊM NGUYÊN PHỤ LIỆU";
        titleCell.font = { bold: true, size: 14 };
        titleCell.alignment = { ...CENTER_ALIGN };
        worksheet.getRow(1).height = 24;

        // ===== Row 2: Từ ngày - Đến ngày =====
        const tuNgay = $("#filterTuNgay").val();
        const denNgay = $("#filterDenNgay").val();

        let dateText = "Khoảng thời gian: Tất cả";
        if (tuNgay && denNgay) {
            dateText = `Khoảng thời gian: Từ ngày ${tuNgay} đến ngày ${denNgay}`;
        } else if (tuNgay) {
            dateText = `Khoảng thời gian: Từ ngày ${tuNgay}`;
        } else if (denNgay) {
            dateText = `Khoảng thời gian: Đến ngày ${denNgay}`;
        }

        worksheet.mergeCells(2, 1, 2, lastColumn);
        const dateCell = worksheet.getCell(2, 1);
        dateCell.value = dateText;
        dateCell.font = { italic: true, size: 11 };
        dateCell.alignment = { horizontal: "left", vertical: "middle" };

        // Row 3 để trống làm khoảng cách

        // Auto width cho các cột (mặc định)
        worksheet.columns.forEach(function (column) {
            if (!column.width) column.width = 18;
        });

        // ===== Áp width riêng cho từng cột theo dataField =====
        Object.entries(columnFieldMap).forEach(([colStr, field]) => {
            const col = Number(colStr);
            if (COLUMN_WIDTH_MAP[field]) {
                worksheet.getColumn(col).width = COLUMN_WIDTH_MAP[field];
            }
        });
        worksheet.eachRow((row) => {

            let maxLength = 0;

            row.eachCell(cell => {
                const text = (cell.value || "").toString();
                maxLength = Math.max(maxLength, text.length);
            });

            if (maxLength > 80) {
                row.height = 70;
            }
            else if (maxLength > 40) {
                row.height = 45;
            }
            else {
                row.height = 25;
            }
        });

        // ===== Merge dòng "Số Phiếu: ..." từ cột A đến cột "TBP Mer soát sét" =====
        const mergeToCol = signTBPMerCol || lastColumn;
        groupRows.forEach(function (rowIndex) {
            try {
                worksheet.unMergeCells(rowIndex, 1, rowIndex, mergeToCol);
            } catch (e) {
                // ignore nếu chưa có merge nào
            }
            worksheet.mergeCells(rowIndex, 1, rowIndex, mergeToCol);

            const cell = worksheet.getCell(rowIndex, 1);
            cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
        });

        // ===== Chèn ảnh chữ ký vào các ô đã đánh dấu =====
        for (const item of signImagesToAdd) {
            let parsed = null;

            if (item.url.startsWith("data:image")) {
                parsed = parseDataUrl(item.url);
            } else {
                const base64 = await imageUrlToBase64(item.url);
                if (base64) parsed = parseDataUrl(base64);
            }

            if (!parsed) continue;

            const imageId = workbook.addImage({
                base64: parsed.base64,
                extension: parsed.extension
            });

            worksheet.addImage(imageId, {
                tl: { col: item.col - 1 + 0.75, row: item.row - 1 + 0.15 },
                ext: { width: 70, height: 35 }
            });

            const row = worksheet.getRow(item.row);
            if (!row.height || row.height < 50) row.height = 50;
        }

        return workbook.xlsx.writeBuffer();
    }).then(function (buffer) {
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        const fileName = `DeNghiCapThemNPL_${moment().format("DDMMYYYY_HHmmss")}.xlsx`;
        saveAs(blob, fileName);
    }).catch(function (err) {
        console.error("Lỗi xuất Excel:", err);
        showToast("error", "Xuất Excel thất bại");
    });
}