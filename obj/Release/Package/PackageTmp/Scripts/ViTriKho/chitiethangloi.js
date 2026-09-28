
var dataSoLo = []
var dataSource = [];
async function renderDataSoLo() {
    const lockho = $("#lockho").val()
    const trangthaitra = $("#trangthaihang").val()
    let action = ""
    if (trangthaitra == 1)
        action = 'DanhSachSoLoMaNPLV1'
    else action = 'DanhSachSoLoMaNPLV2'
    var url = `/api/PhieuXuatHangNPL/GetDanhSachTraHang?Action=${action}&para1=${lockho}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        var data = await response.json();
        dataSoLo = data.Table
        bindDropdownSoLo()
    } catch (error) {
        console.error(error.message);
    }
}
async function renderDataTable() {
    const lockho = $("#lockho").val()
    const trangthaitra = $("#trangthaihang").val()
    let maNPL = $("#maNPL").val()
    let soLoId = $("#soLoID").val()
    let action = ""
    if (trangthaitra == 1)
        action = 'GetDanhSachCayVaiTraV1'
    else action = 'GetDanhSachCayVaiTraV2'
    var url = `/api/PhieuXuatHangNPL/GetDanhSachTraHang?Action=${action}&para1=${lockho}&para2=${soLoId}&para3=${maNPL}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        var data = await response.json();

        renderTableTraHang(data.Table)
    } catch (error) {
        console.error(error.message);
    }
}


$(function () {
    $(".select_2").select2({ width: "100%" });

    renderDataSoLo()

    initGridTraHang();
    updateSelectedCount();
});


function bindDropdownSoLo() {
    var soLoList = [];
    var seenIDs = new Set();

    dataSoLo.forEach(function (item) {
        if (!seenIDs.has(item.SoLoID)) {
            seenIDs.add(item.SoLoID);
            soLoList.push({ SoLoID: item.SoLoID, SoLo: item.SoLo });
        }
    });
    let html = ""
    soLoList.forEach(function (x) {
        html += `<option value="${x.SoLoID}">${x.SoLo}</option>`;
    });

    $("#soLoID").html(html)
    bindDropdownMaNPL();
}
function bindDropdownMaNPL() {
    var $maNPL = $("#maNPL");
    var soLoId = $("#soLoID").val()
    let html = ""
    var dataMaNPL = dataSoLo.filter(x => x.SoLoID == soLoId)
    dataMaNPL.map(x => {
        html += `<option value="${x.MaNPL}">${x.Display}</option>`
    })
    $maNPL.html(html)
    renderDataTable()
}

function initGridTraHang() {
    let grid = $("#gridTraHang").data("dxDataGrid");

    if (grid ) {
        grid.option("dataSource", data);
        grid.refresh();
        return;
    }

    $("#gridTraHang").dxDataGrid({
        dataSource: dataSource,
        keyExpr: "BarCode",
        width: '100%',
        columnAutoWidth: false,
        allowColumnResizing: false,
        columnHidingEnabled: false,
        wordWrapEnabled: true,
        showRowLines: true,
        showBorders: true,
        noDataText: "",
        scrolling: { mode: 'standard' },
        filterRow: { visible: true },
        headerFilter: { visible: false },
        paging: {
            enabled: false
        },
        sorting: { mode: "none" },
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
                dataField: "Selected",
                caption: "",
                minWidth: 46,
                allowFiltering: false,
                allowSorting: false,
                cellTemplate: function (container, options) {
                    $("<input>")
                        .attr({ type: "checkbox" })
                        .prop("checked", options.row.data.isCheck === 1)
                        .css({ minWidth: "15px", height: "15px", cursor: "pointer", accentColor: "#185FA5" })
                        .on("change", function () {
                            var checked = this.checked;
                            options.row.data.isCheck = checked ? 1 : 0;
                            options.row.data.Selected = checked;

                            // ✅ Tìm lại row element đúng cách
                            var grid = $("#gridTraHang").dxDataGrid("instance");
                            var rowIndex = grid.getRowIndexByKey(options.row.data.BarCode);
                            var rowElement = grid.getRowElement(rowIndex);

                            if (rowElement) {
                                if (checked) {
                                    $(rowElement).css("background-color", "#e8f0fe");
                                } else {
                                    $(rowElement).css("background-color", "");
                                }
                            }

                            updateSelectedCount();
                            syncCheckAllHeader();
                        })
                        .appendTo(container);
                },
                headerCellTemplate: function (container) {
                    $("<input>")
                        .attr({ type: "checkbox", id: "checkAllHeader", title: "Chọn / Bỏ tất cả" })
                        .css({ minWidth: "15px", height: "15px", cursor: "pointer", accentColor: "#185FA5" })
                        .appendTo(container);
                }
            },

            {
                dataField: "MaNPL", caption: "Vật Tư:", cssClass: "col-header", minWidth: 30, groupIndex: 0,
                groupCellTemplate: function (container, options) {
                    const items = options.data?.items || options.data?.collapsedItems || [];
                    if (items.length) {
                        container.text(`ItemCode: ${items[0].MaVT ?? ""} - ${items[0].MauVT ?? ""} - ${items[0].KhoVai ?? ""} - ${items[0].TenDVVT ?? ""}`);
                    }
                }
            },
            {
                dataField: "StatusTraHang",
                caption: "Trạng thái",
                alignment: "center",
                width: 100,
                cellTemplate: function (container, options) {

                    let cls = '';
                    let icon = '';
                    let text = '';

                    if (options.value == 1) {
                        cls = 'bg-success-subtle text-success border border-success-subtle';
                        icon = 'fa-check-circle';
                        text = 'Đã trả';
                    }
                    else if (options.value == 2) {
                        cls = 'bg-danger-subtle text-danger border border-danger-subtle';
                        icon = 'fa-ban';
                        text = 'Đã hủy';
                    }
                    else {
                        cls = 'bg-warning-subtle text-warning border border-warning-subtle text-black';
                        icon = 'fa-hourglass-half';
                        text = 'Chưa trả';
                    }

                    $('<span>')
                        .addClass(`badge rounded-pill ${cls} px-3 py-2 fw-semibold`)
                        .html(`<i class="fas ${icon} me-1"></i>${text}`)
                        .appendTo(container);
                }
            },
            { dataField: "POMua", caption: "PO Mua", alignment: "center", minWidth: 90 },
            { dataField: "MaVT", caption: "Item Code", alignment: "center", minWidth: 110 },

            {
                dataField: "ChiTiet",
                caption: "Mô tả",
                alignment: "center",
                minWidth: 300
            },

            { dataField: "MauVT", caption: "Màu", alignment: "center", minWidth: 80 },
            { dataField: "LOTBATCH", caption: "LOT/BATCH", alignment: "center", minWidth: 100 },
            { dataField: "KhoVai", caption: "Width/Size", alignment: "center", minWidth: 90 },
            { dataField: "SoKienHienThi", caption: "Số kiện/Roll", cssClass: "col-header", minWidth: 90, alignment: "center" },
            {
                dataField: "SLChungTu", caption: "SL chứng từ", cssClass: "col-header", width: 80, alignment: "right",
                calculateCellValue: function (row) { return parseFloat((row.SLChungTu || 0).toFixed(2)); }
            },
            {
                dataField: "SLNhap", caption: "SL Nhập", cssClass: "col-header", width: 80, alignment: "right",
                calculateCellValue: function (row) { return parseFloat((row.SLNhap || 0).toFixed(2)); },
                cellTemplate: function (container, options) {
                    var sl = parseFloat((options.value || 0).toFixed(2));
                    var slct = parseFloat((options.row.data.SLChungTu || 0).toFixed(2));
                    $("<span>").addClass(sl < slct ? "sl-diff" : "sl-match").text(sl.toFixed(2)).appendTo(container);
                }
            },


            {
                dataField: "BarCode",
                caption: "Barcode",
                alignment: "center",
                width: 150,
                visible: true,
                showInColumnChooser: false,
                allowFiltering: true,
                allowSorting: true,
                cellTemplate: function (container, options) {
                    $("<span>")
                        .css({
                            "white-space": "normal",      // cho phép xuống dòng
                            "word-break": "break-all",   // cắt chuỗi dài
                            "display": "block"
                        })
                        .text(options.value || "")
                        .appendTo(container);
                }
            },
            { dataField: "NgayMoKien", caption: "Ngày nhận", cssClass: "col-header", minWidth: 100, alignment: "center" },
            {
                dataField: "GhiChu",
                caption: "Ghi chú",
                cssClass: "col-header",
                minWidth: 150,
                alignment: "left",
                alignment: "left",
                headerCellTemplate: function (container) {
                    container.append(`
                    <div class="d-flex align-items-center justify-content-center gap-2">
                        <span>Ghi chú</span>
                        <i class="fas fa-edit" 
                           id="btnEditAllGhiChu"
                           title="Nhập ghi chú cho tất cả"
                           style="cursor:pointer; color:#fff; font-size:13px;"
                        ></i>
                    </div>
                `);

                    // Dùng delegate vì header re-render
                    $(document).off("click", "#btnEditAllGhiChu").on("click", "#btnEditAllGhiChu", function (e) {
                        e.stopPropagation();
                        openModalGhiChuAll();
                    });
                },
                cellTemplate: function (container, options) {
                    const $input = $("<input>")
                        .attr({
                            type: "text",
                            placeholder: "",
                            maxlength: 500
                        })
                        .val(options.value || "")
                        .css({
                            width: "100%",
                            border: "1px solid #dee2e6",
                            borderRadius: "4px",
                            padding: "3px 6px",
                            fontSize: "13px",
                            outline: "none",
                            background: "transparent"
                        })
                        .on("focus", function () {
                            $(this).css("border-color", "#185FA5");
                        })
                        .on("blur", function () {
                            $(this).css("border-color", "#dee2e6");
                        })
                        .on("change", async function () {
                            const newValue = $(this).val().trim();
                            // Cập nhật lại dataSource
                            options.row.data.GhiChu = newValue;

                        });

                    container.append($input);
                }
            },
        ],

        summary: {
            totalItems: [
                {
                    column: "SLChungTu",
                    summaryType: "sum",
                    customizeText: function (data) {
                        return parseFloat(parseFloat(data.value || 0).toFixed(4));
                    }
                },
                {
                    column: "SLNhap",
                    summaryType: "sum",
                    customizeText: function (data) {
                        return parseFloat(parseFloat(data.value || 0).toFixed(4));
                    }
                }
            ]
        },

        onRowPrepared: function (e) {
            if (e.rowType === "data" && e.data.isCheck === 1) {
                e.rowElement.css("background-color", "#e8f0fe");
            }

        },
        onCellPrepared: function (e) {
            if (e.rowType === "header") {
                $(e.cellElement).addClass("col-header");
                $(e.cellElement).addClass("text-center");
                $(e.cellElement).css("vertical-align", "middle");
            }
            if (e.rowType === "data") {
                $(e.cellElement).addClass("text-center");
                $(e.cellElement).css("vertical-align", "middle");
            }
        },
        // ✅ Bind lại checkbox "Chọn tất cả" sau mỗi lần grid render (repaint/filter/...)
        onContentReady: function () {
            bindCheckAllHeader();
            syncCheckAllHeader();
            updateTrangThaiThongKe()
        }
    });
    $("#Layer_1").click();
}

function bindCheckAllHeader() {
    // Dùng off/on để tránh bind nhiều lần
    $(document).off("change", "#checkAllHeader").on("change", "#checkAllHeader", function () {
        var chk = this.checked;
        dataSource.forEach(function (d) {
            d.isCheck = chk ? 1 : 0;
            d.Selected = chk;
        });

        // Repaint để cellTemplate vẽ lại checkbox từng hàng
        var grid = $("#gridTraHang").dxDataGrid("instance");
        grid.repaint();

        updateSelectedCount();
    });
}

function syncCheckAllHeader() {
    if (dataSource.length == 0) return
    var total = dataSource.length;
    var checked = dataSource.filter(function (d) { return d.isCheck === 1; }).length;
    var $header = $("#checkAllHeader");
    if (!$header.length) return;

    if (checked === 0) {
        $header.prop({ checked: false, indeterminate: false });
    } else if (checked === total) {
        $header.prop({ checked: true, indeterminate: false });
    } else {
        $header.prop({ checked: false, indeterminate: true }); // ✅ trạng thái "-" khi chọn 1 phần
    }
}

function updateSelectedCount() {
    var selCount = 0, totalCT = 0, totalNhap = 0;
    dataSource.forEach(function (d) {
        if (d.isCheck === 1) {
            selCount++;
            totalCT += (d.SLChungTu || 0);
            totalNhap += (d.SLNhap || 0);
        }
    });
    $("#selCountBadge").text(selCount + " barcode được chọn");
    //$("#totalSLCT").text(totalCT.toFixed(2));
    $("#totalSLNhap").text(totalNhap.toFixed(2));
}
function updateTrangThaiThongKe() {
    let daTra = 0;
    let chuaTra = 0;

    dataSource.forEach(function (d) {
        if (d.StatusTraHang == 1) {
            daTra++;
        } else {
            chuaTra++;
        }
    });

    $("#totalSLCT").html(
        `Tổng trả / Chưa trả:
        <strong class="text-success">${daTra}</strong> /
        <strong class="text-secondary">${chuaTra}</strong>`
    );
}
function renderTableTraHang(newData) {
    dataSource = newData;
    var grid = $("#gridTraHang").dxDataGrid("instance");
    grid.option("dataSource", dataSource); // ✅ Không tạo lại grid, chỉ đổi data
    updateSelectedCount();
}

function getSelectedBarcodes() {
    return dataSource.filter(function (d) { return d.isCheck === 1; });
}


function showConfirmTraHang(onConfirm) {
    var selected = getSelectedBarcodes();
    var totalSL = selected.reduce(function (s, d) { return s + (d.SLNhap || 0); }, 0);

    $("#modalTraHangCount").text(selected.length);
    $("#modalTraHangSL").text(totalSL.toFixed(2));
    $("#modalTraHangMessage").text("Bạn có chắc muốn trả " + selected.length + " barcode đã chọn?");

    $("#btnConfirmTraHang").off("click").on("click", function () {
        $("#modalTraHang").modal("hide");
        if (typeof onConfirm === "function") onConfirm();
    });

    $("#modalTraHang").modal("show");
}

function showConfirmHuyTraHang(onConfirm) {
    var selected = getSelectedBarcodes();
    var totalSL = selected.reduce(function (s, d) { return s + (d.SLNhap || 0); }, 0);

    $("#modalHuyTraHangCount").text(selected.length);
    $("#modalHuyTraHangSL").text(totalSL.toFixed(2));
    $("#modalHuyTraHangMessage").text("Bạn có chắc muốn hủy " + selected.length + " barcode đã trả?");

    $("#btnConfirmHuyTraHang").off("click").on("click", function () {
        $("#modalHuyTraHang").modal("hide");
        if (typeof onConfirm === "function") onConfirm();
    });

    $("#modalHuyTraHang").modal("show");
}

function handleTraHang() {
    var selected = getSelectedBarcodes();
    if (!selected.length) {
        showToast("warning", "Vui lòng chọn ít nhất 1 barcode để trả hàng!");
        return;
    }
    var invalidItems = selected.filter(function (d) {
        return d.StatusTraHang == 1;
    });

    if (invalidItems.length > 0) {
        showToast("warning",
            `Có ${invalidItems.length} barcode đã trả hoặc đã hủy, không thể trả lại! Vui lòng kiểm tra lại.`
        );
        return;
    }
    const trangthaitra = $("#trangthaihang").val()

    showConfirmTraHang(function () {
        var arrSave = []
        selected.forEach(x => {
            arrSave.push({
                SoLoID: x.SoLoID,
                MaNPL: x.SoLoID,
                IsNPL: x.IsNPL,
                BarCode: x.BarCode,
                Status: 1,
                Module: trangthaitra,
                NgayTraHang: null,      // hoặc new Date()
                NgayCapNhat: null,      // hoặc new Date()
                UserTraHang: userName,
                UserCapNhat: userName,
                GhiChu: x.GhiChu
            });
        })
        ApiSave(arrSave, 0, selected.length)

    });
}

function handleBoTraHang() {
    var selected = getSelectedBarcodes();
    if (!selected.length) {
        showToast("warning", "Vui lòng chọn barcode muốn hủy hàng trả!");
        return;
    }

    var invalidItems = selected.filter(function (d) {
        return d.StatusTraHang != 1;
    });

    if (invalidItems.length > 0) {
        showToast("warning",
            `Có ${invalidItems.length} barcode chưa trả hoặc đã hủy, không thể hủy! Vui lòng kiểm tra lại.`
        );
        return;
    }
    const trangthaitra = $("#trangthaihang").val()

    showConfirmHuyTraHang(function () {
        var arrSave = []
        selected.forEach(x => {
            arrSave.push({
                SoLoID: x.SoLoID,
                MaNPL: x.SoLoID,
                IsNPL: x.IsNPL,
                BarCode: x.BarCode,
                Status: 2,
                Module: trangthaitra,
                NgayTraHang: null,      // hoặc new Date()
                NgayCapNhat: null,      // hoặc new Date()
                UserTraHang: userName,
                UserCapNhat: userName,
                GhiChu: x.GhiChu
            });
        })

        ApiSave(arrSave, 1, selected.length)

    });
}

function openModalGhiChuAll() {
    const total = dataSource.length;

    $("#modalGhiChuCount").text(total);
    $("#inputGhiChuAll").val("");
    $("#ghiChuCharCount").text("0/500");

    // Đếm ký tự
    $("#inputGhiChuAll").off("input").on("input", function () {
        const len = $(this).val().length;
        $("#ghiChuCharCount").text(len + "/500");
        $("#ghiChuCharCount").toggleClass("text-danger", len >= 490);
    });

    $("#btnConfirmGhiChuAll").off("click").on("click", async function () {
        const ghiChu = $("#inputGhiChuAll").val().trim();

        if (!ghiChu) {
            showToast("warning", "Vui lòng nhập nội dung ghi chú!");
            return;
        }

        if (!dataSource.length) {
            showToast("warning", "Không có barcode nào để cập nhật!");
            return;
        }

        await updateGhiChuAll(dataSource, ghiChu);
    });

    $("#modalGhiChuAll").modal("show");
}
function updateGhiChuAll(targets, ghiChu) {
    // Cập nhật lại dataSource
    targets.forEach(d => d.GhiChu = ghiChu);

    // ✅ Dùng refresh() thay vì repaint()
    var grid = $("#gridTraHang").dxDataGrid("instance");
    grid.option("dataSource", dataSource);

    $("#modalGhiChuAll").modal("hide");
    showToast("success", `Đã cập nhật ghi chú cho ${targets.length} barcode!`);
}

async function ApiSave(arrSave, value, length) {

    const request = new Request(`/api/PhieuXuatHangNPL/PostTraHang?action=Post`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(arrSave),
    });
    let response = await fetch(request)
    let data = await response.json()
    if (data == "True") {
        if (value == 1)
            showToast("success", `Đã hủy ${length} barcode khỏi danh sách trả!`);
        else showToast("success", `Đã trả hàng ${length} barcode thành công!`);
        renderDataTable()
    }
    else {
        showToast("warning", `Lưu thất bại!`);

    }
}