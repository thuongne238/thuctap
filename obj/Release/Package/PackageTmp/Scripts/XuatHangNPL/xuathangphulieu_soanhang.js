// ==== MODAL THỐNG KÊ ====
$("#modalSoanHang").on('hidden.bs.modal', function () {
    lotSelected = null
});
var phieuSoanHang = ''
$(function () {
    createViewDxDataGridPhieuCap1([]);
    createViewDxDataGridPhieuCap2([]);
    createViewDxDataGridPhieuCap3([]);
    createViewDxDataGridPhieuCap4([]);

    $("#locPhieuCap").select2({
        dropdownParent: "#modalThongKe",
        minimumResultsForSearch: Infinity
    })

    $("#locPhieuCap").on("change", async function () {

        const valueLoc = $(this).val();
        const tab = getCurrentTab(); // lấy tab hiện tại

        // reset UI
        $("#itemCodeInput").val('');
        batchDataMalenh = [];
        itemCodeJoin = [];
        $("#itemListLan").empty();
        toggleContainer(valueLoc);

        createViewDxDataGridPhieuCap1([]);
        createViewDxDataGridPhieuCap2([]);
        createViewDxDataGridPhieuCap3([]);
        createViewDxDataGridPhieuCap4([]);
        if (valueLoc == "1") {
            // ===== CHƯA CẤP =====
            $(".colTuNgayPC").addClass("d-none");
            $(".colDenNgayPC").addClass("d-none");

            if (tab === 0) {
                await GetMaLenhChuaCapXuatHang();
            } else {
                await GetMaLenhChuaCapSoanHang();
            }


        } else {
            // ===== ĐÃ CẤP =====
            $(".colTuNgayPC").addClass("d-none");
            $(".colDenNgayPC").addClass("d-none");

            if (tab === 0) {
                await GetDaCapXuatHang();
            } else {

                GetMaLenhDaCapSoanHangV2();
            }
        }
    });

    // ===== Mở Modal Thống kê =======
    $("#modalThongKe").on("show.bs.modal", function () {
        /*  $("#tab-xuat-tab").tab("show");*/
        $("#locPhieuCap").val("1");
        $("#locPhieuCap").trigger("change");
    })
    //===== Đóng Modal Thống kê ==========
    $("#modalThongKe").on("hide.bs.modal", function () {
        isFirstChange = true;
        selectedRowMaLenh = null;
        itemCodeJoin = [];
        batchDataMalenh = [];


        $("#itemCodeInput").val('');
        $("#itemListLan").empty();
        try {
            const firstDayOfMonth = moment().startOf('month').toDate();
            const today = new Date();

            if (window.pickerTuNgay) {
                window.pickerTuNgay.dates.setValue(
                    tempusDominus.DateTime.convert(firstDayOfMonth)
                );
            }
            if (window.pickerDenNgay) {
                window.pickerDenNgay.dates.setValue(
                    tempusDominus.DateTime.convert(today)
                );
            }


        } catch (e) {
            console.warn("Reset datepicker lỗi:", e);
        }
    });

    $("#thongKeTabs .nav-link").on("click", async function () {
        const loc = $("#locPhieuCap").val();
        const clickedId = $(this).attr("id");
        const tab = clickedId === "tab-xuat-tab" ? 0 : 1;

        toggleContainer(loc);
        if (loc == "1") {
            // ===== CHƯA CẤP =====
            if (tab === 0) {
                await GetMaLenhChuaCapXuatHang();
            } else {
                await GetMaLenhChuaCapSoanHang();

            }
        } else {
            // ===== ĐÃ CẤP =====
            if (tab === 0)
                await GetDaCapXuatHang();
        }
    });
})

function getCurrentTab() {
    const activeTab = $("#thongKeTabs .nav-link.active").attr("id");

    if (activeTab === "tab-xuat-tab") return 0; // Xuất hàng
    if (activeTab === "tab-soan-tab") return 1; // Soạn hàng

    return 0;
}

function toggleContainer(loc) {
    const tab = getCurrentTab();
    const tabId = tab === 0 ? "#tab-xuat" : "#tab-soan";

    if (loc == "1") { // Chưa cấp
        $(`${tabId} .containerGrid1`).removeClass("d-none");
        $(`${tabId} .containerGrid2`).addClass("d-none");
    } else { // Đã cấp
        $(`${tabId} .containerGrid1`).addClass("d-none");
        $(`${tabId} .containerGrid2`).removeClass("d-none");
    }
}
function getGridId(baseId) {
    const tab = getCurrentTab();
    return tab === 0 ? `${baseId}_xuat` : `${baseId}_soan`;
}

// =========== API ========
//Đã cấp Xuất hàng
async function GetDaCapXuatHang() {
    var locSH = $("#slcLocSoanHang").val();
    var tuNgayFormatted = locSH == 0 ? moment($("#tuNgayThongKeChiTiet").val(), "DD/MM/YYYY").format("YYYY-MM-DD") : "1990-01-01";
    var denNgayFormatted = locSH == 0 ? moment($("#denNgayThongKeChiTiet").val(), "DD/MM/YYYY").format("YYYY-MM-DD") : "2999-01-01";
    const capPhat = $(".select_loc").val();
    try {
        const url = `/api/PhieuXuatHangNPL/Get?Action=GetDSLenhDCapPL&para1=${tuNgayFormatted}&para2=${denNgayFormatted}&para5=${capPhat}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.length === 0) createViewDxDataGridPhieuCap2([]);
        createViewDxDataGridPhieuCap1(data);
    } catch (err) {
        console.error(err);
    }
}

//Đã cấp Soạn hàng
async function GetItemCode() {


}

//Chưa cấp xuất hàng
async function GetMaLenhChuaCapXuatHang() {
    try {

        var capPhat = $(".select_loc").val();
        var url = `/api/PhieuXuatHangNPL/Get?Action=GetDSLenhCCapPL&para1=0&para6=${capPhat}`;
        const response = await fetch(url)
        const data = await response.json();
        createViewDxDataGridPhieuCap4(data)

    } catch (err) {
        console.error(err)
    }
}

//Chưa cấp soạn hàng
async function GetMaLenhChuaCapSoanHang() {
    try {
        var capPhat = $(".select_loc").val();
        var locSH = $("#slcLocSoanHang").val();
        var tuNgayFormatted = locSH == 0 ? moment($("#tuNgayThongKeChiTiet").val(), "DD/MM/YYYY").format("YYYY-MM-DD") : "1990-01-01";
        var denNgayFormatted = locSH == 0 ? moment($("#denNgayThongKeChiTiet").val(), "DD/MM/YYYY").format("YYYY-MM-DD") : "2999-01-01";
        const action = capPhat == 2 || capPhat == 3 ? "GetDSLenhCCapSoanHangoption23" : "GetDSLenhCCapSoanHang"
        var url = `/api/PhieuXuatHangNPL/Get?Action=${action}&para1=0&para2=${tuNgayFormatted}&para3=${denNgayFormatted}&para4=${tenPhieuOption2}&para6=${capPhat}`;
        const response = await fetch(url)
        const data = await response.json();

        createViewDxDataGridPhieuCap4(data)

    } catch (err) {
        console.error(err)
    }
}

async function GetMaLenhDaCapSoanHangV2(
) {
    try {
        var capPhat = $(".select_loc").val();
        var locSH = $("#slcLocSoanHang").val();
        var tuNgayFormatted = locSH == 0 ? moment($("#tuNgayThongKeChiTiet").val(), "DD/MM/YYYY").format("YYYY-MM-DD") : "1990-01-01";
        var denNgayFormatted = locSH == 0 ? moment($("#denNgayThongKeChiTiet").val(), "DD/MM/YYYY").format("YYYY-MM-DD") : "2999-01-01";

        const action = capPhat == 2 || capPhat == 3 ? "GetDSLenhDCapSoanHangOption23" : "GetDSLenhDCapSoanHangV2"
        var url = `/api/PhieuXuatHangNPL/Get?Action=${action}&para1=0&para2=${tuNgayFormatted}&para3=${denNgayFormatted}&para4=${tenPhieuOption2}&para6=${capPhat}`;
        const response = await fetch(url)
        const data = await response.json();
        createViewDxDataGridPhieuCap1(data)

    } catch (err) {
        console.error(err)
    }
}

// Chi tiết Đã cấp xuất hàng
async function GetChiTietMaLenhDaCapXuatHang() {
    try {
        var capPhat = $(".select_loc").val();
        var locSH = $("#slcLocSoanHang").val();
        var tuNgayFormatted = locSH == 0 ? moment($("#tuNgayThongKeChiTiet").val(), "DD/MM/YYYY").format("YYYY-MM-DD") : "1990-01-01";
        var denNgayFormatted = locSH == 0 ? moment($("#denNgayThongKeChiTiet").val(), "DD/MM/YYYY").format("YYYY-MM-DD") : "2999-01-01";

        var url = `/api/PhieuXuatHangNPL/Get?Action=GetChiTietLenhDaCap&para1=${selectedRowMaLenh}&para2=0&para3=${capPhat}&para4=${itemCodeJoin}&para5=${tuNgayFormatted}&para6=${denNgayFormatted}`;

        const response = await fetch(url)
        const data = await response.json();

        createViewDxDataGridPhieuCap2(data)

    } catch (err) {
        console.error(err)
    }
}
// Chi tiết Đã cấp soạn hàng
async function GetChiTietMaLenhDaCapSoanHang() {

    try {
        var capPhat = $(".select_loc").val();
        var locSH = $("#slcLocSoanHang").val();
        var tuNgayFormatted = locSH == 0 ? moment($("#tuNgayThongKeChiTiet").val(), "DD/MM/YYYY").format("YYYY-MM-DD") : "1990-01-01";
        var denNgayFormatted = locSH == 0 ? moment($("#denNgayThongKeChiTiet").val(), "DD/MM/YYYY").format("YYYY-MM-DD") : "2999-01-01";

        var url = `/api/PhieuXuatHangNPL/Get?Action=GetChiTietLenhDSDCapSoanHangV2&para2=${tuNgayFormatted}&para3=${denNgayFormatted}&para4=${selectedRowMaLenh}&para6=${capPhat}`;
        const response = await fetch(url)
        const data = await response.json();

        createViewDxDataGridPhieuCap2(data)

    } catch (err) {
        console.error(err)
    }
}

//Chi tiết lệnh chưa cấp xuất hàng
async function GetChiTietLenhChuaCapXuatHang() {
    try {
        var capPhat = $(".select_loc").val();
        var url = `/api/PhieuXuatHangNPL/Get?Action=GetDSLenhChiTietCCapPL&para1=${selectedRowMaLenh}&para2=0&para6=${capPhat}`;
        const response = await fetch(url);
        const data = await response.json();

        console.log(data);
        createViewDxDataGridPhieuCap3(data)
    } catch (err) {
        console.error(err)
    }
}
// chi tiết chưa cấp soạn hàng
async function GetChiTietLenhChuaCapSoanHang() {
    try {
        var capPhat = $(".select_loc").val();
        var url = `/api/PhieuXuatHangNPL/Get?Action=GetChiTietDSLenhCCapSoanHang&para1=${selectedRowMaLenh}&para2=0&para6=${capPhat}`;
        const response = await fetch(url);
        const data = await response.json();
        createViewDxDataGridPhieuCap3(data)
    } catch (err) {
        console.error(err)
    }
}

// ====== END API ======

/// DxDatagrid
//bảng trái đã cấp 
function createViewDxDataGridPhieuCap1(data) {
    if (dxPhieuCap1) {
        dxPhieuCap1.option("dataSource", data);
        dxPhieuCap1.refresh();
        return;
    }
    dxPhieuCap1 = $(`#${getGridId("dxPhieuCap1")}`).dxDataGrid({
        dataSource: data,
        noDataText: "Chưa có dữ liệu",
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
        renderAsync: false,
        grouping: { autoExpandAll: true },
        groupPanel: { visible: false },
        loadPanel: {
            enabled: false,
            text: "Đang tải dữ liệu...",
            showIndicator: true,
            showPane: true
        },
        selection: {
            mode: 'single',
            showCheckBoxesmode: "onclick",
            allowSelectAll: false,
        },
        columns: getColumnsDaCapByTab(getCurrentTab()),
        summary: {
            groupItems: [
                {
                    column: "SLXuat", summaryType: "sum", showInGroupFooter: true, alignByColumn: true,
                    customizeText: function (e) {
                        if (!e.value) return '';
                        return formatNumber(e.value);

                    }
                },
            ]
        },
        onContentReady: function (e) {
            const dataSource = e.component.option("dataSource");
            const tab = getCurrentTab();
            if (dataSource && dataSource.length > 0) {
                const firstDataRow = e.component.getVisibleRows().find(r => r.rowType === "data");
                if (firstDataRow) {
                    e.component.selectRowsByIndexes([firstDataRow.rowIndex]);
                    dataSelect = firstDataRow.data;

                    const $rowElement = $(e.component.getRowElement(firstDataRow.rowIndex));
                    $rowElement.addClass("activeT");

                    if (tab === 0) {
                        itemCodeJoin = firstDataRow.data.MaNPL;
                        selectedRowMaLenh = firstDataRow.data.MaLenhSX;
                        GetChiTietMaLenhDaCapXuatHang();
                    } else {
                        itemCodeJoin = firstDataRow.data.MaNPL;
                        selectedRowMaLenh = firstDataRow.data.MaLenhSX;
                        GetChiTietMaLenhDaCapSoanHang();
                    }
                }
            }
        },
        onRowClick: function (e) {
            //selectedRowMaLenh = e.data.MaLenhSX;
            const tab = getCurrentTab();
            if (tab === 0) {
                itemCodeJoin = e.data.MaNPL;
                selectedRowMaLenh = e.data.MaLenhSX;
                GetChiTietMaLenhDaCapXuatHang();
            } else {
                itemCodeJoin = e.data.MaNPL;
                selectedRowMaLenh = e.data.MaLenhSX;
                GetChiTietMaLenhDaCapSoanHang();
            }

            // highlight row
            $(e.rowElement).closest(".dx-datagrid-rowsview")
                .find(".dx-row")
                .removeClass("activeT");
            $(e.rowElement).addClass("activeT");
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

    }).dxDataGrid('instance');
}
//==== Dữ liệu column của đã cấp by tab =====
function getColumnsDaCapByTab(tab) {
    if (tab === 0) {
        return [
            {
                dataField: "MaNPL",
                caption: "ItemCode",
                calculateCellValue: function (row) {
                    return row.MaVT;
                },
                groupIndex: 0,
                visible: false,
            },
            { dataField: "MaLenh", caption: "Mã Lệnh", width: 90, },
            { dataField: "TenHang", caption: "Tên Hàng", width: 150, },
            {
                dataField: "SLXuat",
                caption: "SL Xuất",
                minWidth: 80,
                cellTemplate: function (container, options) {
                    container.text(formatNumber(options.value))
                }
            },
            {
                dataField: "NgayXuatHang",
                caption: "Ngày Xuất",
                cellTemplate: function (container, options) {
                    container.text(options.value || "");
                },
                minWidth: 120
            },
        ];
    } else {
        return [
            { dataField: "NguoiSoanHang", caption: "Người SH", width: 160, },
            { dataField: "MaLenh", caption: "Mã Lệnh", width: 90, },
            { dataField: "MaHang", caption: "Tên Hàng", width: 230, visible: false },
            { dataField: "NgayXacNhan", caption: "Ngày Hoàn Thành SH", width: 80, },
            { dataField: "NgaySoanHang", caption: "Ngày Yêu Cầu SH", width: 80, },
        ];
    }
}

//===== Table chi tiết đã cấp =====
function createViewDxDataGridPhieuCap2(data) {
    if (dxPhieuCap2) {
        dxPhieuCap2.option("dataSource", data);
        dxPhieuCap2.refresh();
        return;
    }
    dxPhieuCap2 = $(`#${getGridId("dxPhieuCap2")}`).dxDataGrid({
        dataSource: data,
        noDataText: "Chưa có dữ liệu",
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
        renderAsync: false,
        grouping: { autoExpandAll: true },
        groupPanel: { visible: false },
        loadPanel: {
            enabled: false,
            text: "Đang tải dữ liệu...",
            showIndicator: true,
            showPane: true
        },
        columns: getColumnsChiTietDaCapByTab(getCurrentTab()),
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
        summary: {
            groupItems: [
                {
                    column: getCurrentTab() === 0 ? "SLNhap" : "SLSoanHang",
                    summaryType: "sum",
                    showInGroupFooter: true, alignByColumn: true,
                    customizeText: function (e) {
                        if (!e.value) return '';
                        return formatNumber(e.value);

                    }
                },
            ]
        }
    }).dxDataGrid('instance');
}
//Dữ liệu column của chi tiết đã cấp by tab
function getColumnsChiTietDaCapByTab(tab) {
    if (tab === 0) {
        return [
            { dataField: "PhieuXH", groupIndex: 0, caption: "Phiếu Xuất hàng", width: 90, },
            { dataField: "POMua", caption: "PO Mua", width: 100, },
            { dataField: "SoLo", caption: "Số Lô", minWidth: 100, },
            { dataField: "MaVT", caption: "Item Code", width: 90, },
            { dataField: "MauVT", caption: "Màu", minWidth: 100, },
            { dataField: "KhoVai", caption: "Width/size", minWidth: 100, },
            { dataField: "TenDVVT", caption: "Đơn vị", minWidth: 100, },
            { dataField: "SoKienHienThi", caption: "Số thùng", minWidth: 100, },
            { dataField: "SLNhap", caption: "Thực Xuất", minWidth: 100, },
            { dataField: "NgayXuatHang", caption: "Ngày Xuất", minWidth: 100, },
        ];
    } else {
        return [
            {
                dataField: "MaVT",
                groupIndex: 0,
                caption: "Vật Tư",
                visible: false,
                width: 90,
                groupCellTemplate: function (container, options) {
                    const item = options.data.items && options.data.items.length > 0
                        ? options.data.items[0]
                        : options.data.collapsedItems && options.data.collapsedItems[0];
                    container.text(`Itemcode: ${item.MaVT} - ${item.MauVT} - ${item.KhoVai} - ${item.TenDVVT}`);
                }
            },
            { dataField: "POMua", caption: "PO Mua", width: 100, },
            { dataField: "SoLo", caption: "Số Lô", minWidth: 100, },
            { dataField: "MauVT", caption: "Màu", minWidth: 100, visible: false },
            { dataField: "KhoVai", caption: "Width/size", minWidth: 100, visible: false },
            { dataField: "TenDVVT", caption: "Đơn vị", minWidth: 100, visible: false },
            { dataField: "SoKienHienThi", caption: "Số thùng", minWidth: 100, },
            { dataField: "SLSoanHang", caption: "Thực Xuất", minWidth: 100, },
            { dataField: "NgayXacNhan", caption: "Ngày Xuất", minWidth: 100, },
        ];
    }
}

//===== Table chi tiết chưa cấp =====
function createViewDxDataGridPhieuCap3(data) {
    dxPhieuCap3 = $(`#${getGridId("dxPhieuCap3")}`).dxDataGrid({
        dataSource: data,
        noDataText: "Chưa có dữ liệu",
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
        renderAsync: false,
        grouping: { autoExpandAll: true },
        groupPanel: { visible: false },
        loadPanel: {
            enabled: false,
            text: "Đang tải dữ liệu...",
            showIndicator: true,
            showPane: true
        },
        columns: getColumnsChiTietChuaCapByTab(getCurrentTab()),
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
    }).dxDataGrid('instance');

}
// ===== Dữ liệu column chi tiết chưa cấp by tab =====
function getColumnsChiTietChuaCapByTab(tab) {
    if (tab === 0) {
        return [
            { dataField: "PhieuDK", caption: "Phiếu Đăng Ký", groupIndex: 0, visible: false },
            { dataField: "NgayCap", caption: "Ngày YC Cấp", },
            { dataField: "MaVT", caption: "Item Code", width: 90, },
            //{
            //    dataField: "CapPhat",
            //    caption: "Cấp Phát",
            //    width: 100,
            //    cellTemplate: function (container, options) {
            //        container.text(formatNumber(options.value))
            //    }
            //},
            {
                dataField: "SLDK",
                caption: "SL Đăng Ký",
                width: 100,
                cellTemplate: function (container, options) {
                    container.text(formatNumber(options.value))
                }
            },
            { dataField: "MauVT", caption: "Màu", minWidth: 100, },
            { dataField: "KhoVai", caption: "Width/size", minWidth: 100, },
            { dataField: "TenDVVT", caption: "Đơn vị", minWidth: 100, },
            { dataField: "MaONPL", caption: "Vị Trí Ô", minWidth: 100, },
        ];
    } else {
        return [
            { dataField: "PhieuSH", caption: "Phiếu Soạn Hàng", groupIndex: 0, visible: false },
            { dataField: "NguoiSoanHang", caption: "Người Soạn Hàng", },
            { dataField: "NgaySoanHang", caption: "Ngày Soạn Cấp", },
            { dataField: "MaVT", caption: "Item Code", width: 90, },
            //{
            //    dataField: "CapPhat",
            //    caption: "Cấp Phát",
            //    width: 100,
            //    cellTemplate: function (container, options) {
            //        container.text(formatNumber(options.value))
            //    }
            //},
            {
                dataField: "SLSoanHang",
                caption: "SL Soạn Hàng",
                width: 100,
                cellTemplate: function (container, options) {
                    container.text(formatNumber(options.value))
                }
            },
            { dataField: "MauVT", caption: "Màu", minWidth: 100, },
            { dataField: "KhoVai", caption: "Width/size", minWidth: 100, },
            { dataField: "TenDVVT", caption: "Đơn vị", minWidth: 100, },
            { dataField: "MaONPL", caption: "Vị Trí Ô", minWidth: 100, },
        ];
    }
}
// Table chưa cấp 
function createViewDxDataGridPhieuCap4(data) {
    const tab = getCurrentTab();
    dxPhieuCap4 = $(`#${getGridId("dxPhieuCap4")}`).dxDataGrid({
        dataSource: data,
        noDataText: "Chưa có dữ liệu",
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
        renderAsync: false,
        grouping: { autoExpandAll: true },
        groupPanel: { visible: false },
        loadPanel: {
            enabled: false,
            text: "Đang tải dữ liệu...",
            showIndicator: true,
            showPane: true
        },
        selection: {
            mode: 'single',
            showCheckBoxesmode: "onclick",
            allowSelectAll: false,
        },

        columns: [
            { dataField: "NguoiSoanHang", caption: "Người SH", width: 120, visible: tab == 0 ? false : true },
            { dataField: "MaLenh", caption: "Mã Lệnh", width: 90, },
            { dataField: "MaHang", caption: "Tên Hàng", width: 230, visible: tab == 0 ? true : false },
            { dataField: "NgayDangKy", caption: "Ngày ĐK", width: 120, visible: tab == 0 ? false : true },
            { dataField: "NgaySoanHang", caption: "Ngày Yêu Cầu SH", width: 150, visible: tab == 0 ? false : true },
        ],
        onContentReady: function (e) {
            const dataSource = e.component.option("dataSource");
            const tab = getCurrentTab();
            if (dataSource && dataSource.length > 0) {
                const firstDataRow = e.component.getVisibleRows().find(r => r.rowType === "data");
                if (firstDataRow) {
                    e.component.selectRowsByIndexes([firstDataRow.rowIndex]);
                    dataSelect = firstDataRow.data;

                    const $rowElement = $(e.component.getRowElement(firstDataRow.rowIndex));
                    $rowElement.addClass("activeT");

                    if (tab === 0) {
                        selectedRowMaLenh = dataSelect.MaLenhSanXuat;
                        GetChiTietLenhChuaCapXuatHang();
                    } else {
                        selectedRowMaLenh = dataSelect.MaLenhSX;
                        GetChiTietLenhChuaCapSoanHang();
                    }
                }
            }
        },
        onRowClick: function (e) {
            //selectedRowMaLenh = e.data.MaLenhSanXuat;
            const tab = getCurrentTab();
            if (tab === 0) {
                selectedRowMaLenh = e.data.MaLenhSanXuat;
                GetChiTietLenhChuaCapXuatHang();
            } else {
                selectedRowMaLenh = e.data.MaLenhSX;
                GetChiTietLenhChuaCapSoanHang();
            }

            // highlight row
            $(e.rowElement).closest(".dx-datagrid-rowsview")
                .find(".dx-row")
                .removeClass("activeT");
            $(e.rowElement).addClass("activeT");
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
    }).dxDataGrid('instance');

}

// ======== END MODAL ========

/// DX DataGrid

function createViewDxDataGridDangKySH(data) {

    var loc = $(".select_loc").val()
    data.forEach(x => {
        x.CapPhat = Math.max(x.CapPhat, 0)
    })
    dxDataGridDangKySH = $("#dxDataGridDangKySH").dxDataGrid({
        dataSource: data,
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
        renderAsync: false,
        grouping: { autoExpandAll: true },
        groupPanel: { visible: false },
        loadPanel: {
            enabled: true,
            text: "Đang tải dữ liệu...",
            showIndicator: true,
            showPane: true
        },
        columns: getColumnsLapPhieuSoanHangByTab(loc),
        summary: {
            totalItems: [{
                column: "SLDK",
                summaryType: "sum",
                customizeText(e) {
                    if (e.value == null) return "";

                    const str = String(e.value);
                    let intPart = str;
                    let decPart = "";

                    if (str.includes(".")) {
                        [intPart, decPart] = str.split(".");
                        decPart = decPart.substring(0, 4); // cắt, không làm tròn
                    }

                    let formattedInt = Number(intPart).toLocaleString();

                    return decPart ? `${formattedInt}.${decPart}` : formattedInt
                }
            },
            {
                column: "CapPhat",
                summaryType: "sum",
                customizeText(e) {
                    if (e.value == null) return "";

                    const str = String(e.value);
                    let intPart = str;
                    let decPart = "";

                    if (str.includes(".")) {
                        [intPart, decPart] = str.split(".");
                        decPart = decPart.substring(0, 4); // cắt, không làm tròn
                    }

                    let formattedInt = Number(intPart).toLocaleString();

                    return decPart ? `${formattedInt}.${decPart}` : formattedInt
                }
            },
            {
                column: "SLTKho",
                summaryType: "sum",
                customizeText(e) {
                    if (e.value == null) return "";

                    const str = String(e.value);
                    let intPart = str;
                    let decPart = "";

                    if (str.includes(".")) {
                        [intPart, decPart] = str.split(".");
                        decPart = decPart.substring(0, 4); // cắt, không làm tròn
                    }

                    let formattedInt = Number(intPart).toLocaleString();

                    return decPart ? `${formattedInt}.${decPart}` : formattedInt
                }
            }
            ]
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
    }).dxDataGrid("instance");

    /*$("#Layer_1").click();*/
}

function validateViTriKho(data, value) {
    const soLuong = Number(value);
    const vitriKho = data.MaONPL;
    const isEmptyViTri = !vitriKho || vitriKho === 'null';

    if (!isNaN(soLuong) && soLuong > 0 && isEmptyViTri) {
        showToast("warning", "Vật tư này đang không có trên phần mềm sơ đồ kho của hệ thống. Vui lòng vào kho cập nhật!");
        return false;
    }
    return true;
}
async function setSoLuongSoanHang(item, value, inputElement = null) {
    value = value === "" ? null : Number(value);

    if (value !== null && value < 0) {
        showToast("warning", "Số lượng soạn hàng không được âm");

        if (inputElement) inputElement.value = "";
        item.SLDK = null;
        updateSummary(dxDataGridDangKySH);
        return false;
    }

    if (value !== null && value > Number(item.CapPhat || 0)) {
        const isConfirm = await showConfirmVuotCapPhatModal();

        if (!isConfirm) {
            const truncated = Math.trunc(Number(item.CapPhat || 0) * 10000) / 10000;

            if (inputElement) inputElement.value = truncated;
            item.SLDK = truncated;
            updateSummary(dxDataGridDangKySH);
            return false;
        }
    }

    item.SLDK = value;
    updateSummary(dxDataGridDangKySH);
    return true;
}
function applyVuotCapPhatStyle($input, data) {
    const isVuot = Number(data.SLDK || 0) > Number(data.CapPhat || 0);

    $input.css({
        backgroundColor: isVuot ? "#fff3cd" : "",
        borderColor: isVuot ? "#ffc107" : "",
        color: isVuot ? "#842029" : "",
        fontWeight: isVuot ? "600" : ""
    });

    $input.attr(
        "title",
        isVuot ? "Số lượng soạn hàng đang vượt số lượng cấp phát" : ""
    );
}
function getColumnsLapPhieuSoanHangByTab(tab) {


    return [
        { dataField: "MaLenh", caption: "Mã Lệnh", alignment: "center", minWidth: 100, visible: tab == 2 || tab == 3 ? false : true },
        { dataField: "MaVT", caption: "Item Code", alignment: "center", minWidth: 180 },
        { dataField: "MaNPL", caption: "Mã NPL", alignment: "center", minWidth: 120, visible: false },
        { dataField: "MauVT", caption: "Màu VT", alignment: "center", minWidth: 120 },
        { dataField: "KhoVai", caption: "Width/Size", alignment: "center", minWidth: 120 },
        {
            dataField: "MaONPL",
            caption: "Vị trí kho",
            alignment: "center",
            minWidth: 80,
        },
        {
            dataField: "CapPhatBD",
            caption: "Cấp phát",
            alignment: "center",
            minWidth: 80,
        },
        {
            dataField: "SLDSH",
            caption: "SLSH",
            alignment: "center",
            minWidth: 80,
        },
        {
            dataField: "CapPhat",
            caption: "SLCL cấp phát",
            alignment: "center",
            minWidth: 120,
            allowSorting: false,
            headerCellTemplate: function (header, info) {
                const $container = $("<div></div>").css({
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 8px",
                    justifyContent: "center",
                    flexWrap: "wrap"
                });
                const $icon = $("<i></i>")
                    .addClass("fa-light fa-circle-arrow-right")
                    .css({
                        cursor: "pointer",
                        fontSize: "16px",
                        flexShrink: "0",
                        marginRight: "6px",
                    })
                    .on("click", function (e) {
                        e.stopPropagation();
                        let refresh = false;
                        let invalidCount = 0;
                        const dataSource = dxDataGridDangKySH.option("dataSource");
                        dataSource.forEach(item => {
                            //Validate vị trí kho
                            //if (!validateViTriKho(item, item.CapPhat)) {
                            //    invalidCount++;
                            //    return;
                            //}

                            item.SLDK = item.CapPhat;
                            refresh = true;
                        });
                        if (refresh) {
                            dxDataGridDangKySH.refresh();
                        }
                    });
                const $text = $("<span></span>")
                    .text(info.column.caption)
                    .css({
                        flexShrink: "0"
                    });
                $container.append($text, $icon);
                header.append($container);
            },
            cellTemplate: function (container, options) {
                const $container = $("<div></div>").css(
                    {
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative"
                    }
                );

                const $icon = $("<i></i>")
                    .addClass("fa-light fa-circle-arrow-right")
                    .css({ position: "absolute", right: 1, color: "#00bbff", fontSize: 16, cursor: "pointer" })
                    .on("click", function (e) {
                        e.stopPropagation();
                        //Validate vị trí kho
                        //if (!validateViTriKho(options.data, options.value))
                        //    return;
                        options.data.SLDK = options.value
                        dxDataGridDangKySH.refresh();
                    })

                const $text = $("<span></span>")
                    .text(formatNumber(options.value))

                $container.append($text, $icon);
                container.append($container)
            }
        },
        {
            dataField: "SLTonKho",
            caption: "SL tồn kho",
            alignment: "center",
            minWidth: 140,
            allowSorting: false,
            allowHeaderFiltering: false,

            cellTemplate: function (container, options) {
                const $container = $("<div></div>").css({
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative"
                });

                const $icon = $("<i></i>")
                    .addClass("fa-light fa-circle-arrow-right")
                    .css({
                        position: "absolute",
                        right: 1,
                        color: "#00bbff",
                        fontSize: 16,
                        cursor: "pointer"
                    })
                    .on("click", async function (e) {
                        e.stopPropagation();

                        const success = await setSoLuongSoanHang(
                            options.data,
                            options.data.SLTonKho
                        );

                        if (success) {
                            dxDataGridDangKySH.refresh();
                        }
                    });

                const isLowStock = Number(options.value || 0) < Number(options.data.CapPhat || 0);

                const $text = $("<span></span>")
                    .text(formatNumber(options.value))
                    .css({
                        color: isLowStock ? "red" : "",
                        fontWeight: isLowStock ? "bold" : "normal"
                    });

                $container.append($text, $icon);
                container.append($container);
            }
        },
        {
            dataField: "SLDK",
            caption: "SL Soạn Hàng",
            alignment: "center",
            minWidth: 120,
            cellTemplate: function (container, options) {
                const $input = $(`
                        <input type="number"
                                class="form-control inputSLDK"
                                style= "font-size:14px"
                                value="${options.data.SLDK ?? ''}" />
                    `);
                applyVuotCapPhatStyle($input, options.data);
                $input.on("input", async function () {
                    let value = this.value;

                    if (value.includes(".")) {
                        const [intPart, decPart] = value.split(".");
                        this.value = intPart + "." + decPart.substring(0, 4);
                        value = this.value;
                    }

                    await setSoLuongSoanHang(options.data, value, this);
                    applyVuotCapPhatStyle($input, options.data);
                });

                container.append($input);
            }
        },
        {
            dataField: "TenDVVT",
            caption: "Đơn Vị",
            alignment: "center",
            minWidth: 80,
        },
        {
            dataField: "GhiChu",
            caption: "Ghi Chú",
            minWidth: 200,
            cellTemplate: function (container, options) {
                const $input = $(`
                        <input type="text" class="form-control"
                               value="${options.data.GhiChu || ''}" />
                    `);

                $input.on("input", function () {
                    options.data.GhiChu = this.value;
                });

                container.append($input);
            }
        },
        {
            dataField: "",
            caption: "Người Soạn Hàng",
            minWidth: 200,
            headerCellTemplate: function (header, info) {
                const $container = $("<div>").css({
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "0 8px"
                });

                const $text = $("<span>").text(info.column.caption);

                const $icon = $("<i>")
                    .addClass("fa fa-user-plus")
                    .css({
                        cursor: "pointer",
                        fontSize: "16px",

                    })
                    .on("click", async function (e) {
                        e.stopPropagation();

                        const nguoi = await openModalNguoiSoanHang();
                        if (!nguoi) return;
                        const dataSource = dxDataGridDangKySH.option("dataSource");
                        dataSource.forEach(row => {
                            row.NguoiSoanHang = nguoi;
                        });

                        dxDataGridDangKySH.refresh();
                    });

                $container.append($text, $icon);
                header.append($container);
            },
            cellTemplate: function (container, options) {
                const item = options.data;

                const $wrapper = $("<div>").css({
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                });

                const $input = $(`<input type="text" class="form-control inputSoanHang" />`)
                    .val(item.NguoiSoanHang || '')
                    .on("input", function () {
                        item.NguoiSoanHang = this.value;
                    });

                const $btn = $("<i></i>")
                    .addClass("fa fa-user-plus")
                    .css({
                        cursor: "pointer",
                        fontSize: "16px",
                        color: "#6d97f3"
                    })

                    .on("click", async function (e) {
                        e.stopPropagation();

                        const nguoi = await openModalNguoiSoanHang();
                        if (!nguoi) return;
                        item.NguoiSoanHang = nguoi;
                        $input.val(nguoi);
                        options.component.repaintRows([options.rowIndex]);
                    });

                $wrapper.append($input, $btn);
                container.append($wrapper);
            }
        },

        {
            caption: "Xóa",
            minWidth: 50,
            alignment: "center",
            cellTemplate: function (container, options) {
                // Thêm nút
                $("<div>")
                    .css({
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "25px"
                    })
                    .append(
                        $("<i>")
                            .addClass("fa-solid fa-trash-can")
                            .css({ fontSize: "15px", color: "red", cursor: "pointer" })
                            .on("click", function () {
                                rowDelete = options.data;
                                isDeleteDK = true;
                                $("#modalComfimrtDeleteVT").modal("show");
                            })
                    )
                    .appendTo(container);
            }
        }
    ];

}

let arrQuetBarCode = [];

async function PostBarCodeSH(data, type) {
    const url = `/api/PhieuXuatHangNPL/PostBarCode?action=PostBarCodeSH`
    try {

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result == "True") {
            const barcode = data[0].BarCode;
            const phieuSH = data[0].PhieuSH;
            const maNPL = data[0].MaNPL;
            const slQuet = Number(data[0].SLSoanHang_BC || 0);

            // cập nhật datasource đang có
            allSoanHangData.forEach(x => {
                if (
                    x.PhieuSH === phieuSH &&
                    x.MaNPL === maNPL &&
                    x.BarCode === barcode
                ) {
                    x.SLSoanHang_BC = slQuet;
                }
            });

            // cập nhật lại master
            renderMasterTable(getDistinctMasterData(allSoanHangData));
            if (type === 1) {
                const phieuSHDangQuet = data && data[0] ? data[0].PhieuSH : selectedPhieuSH;
                GetViewSoanHang(phieuSHDangQuet)
                showToast("success", "Soạn hàng thành công")
                craetViewDXLichSuQuetSH(arrQuetBarCode);
            } else {
                showToast("success", "Cập nhật soạn hàng thành công")
            }

        }

    } catch (err) {
        console.error(err)
    }
}

function showConfirmModalSoanHang() {
    return new Promise((resolve) => {

        $('#closeForm').off('click').on('click', function () {
            $("#modalQuetThung").modal("hide");
            resolve(false); // bấm đồng ý
        });

        $('#modalQuetThung').off('hidden.bs.modal').on('hidden.bs.modal', function () {
            resolve(false); // đóng modal
        });

        $("#modalQuetThung").modal("show");

    });
}
function showConfirmVuotModalSoanHang() {
    return new Promise((resolve) => {
        $('#btnXacNhanVuot').off('click').on('click', function () {
            $("#modalXacNhanVuotChi").modal("hide");
            resolve(true); // bấm đồng ý
        });

        $('#modalXacNhanVuotChi').off('hidden.bs.modal').on('hidden.bs.modal', function () {
            resolve(false); // đóng modal
        });
        $("#modalXacNhanVuotChi").modal("show");

    });
}

function showConfirmVuotCapPhatModal() {
    return new Promise((resolve) => {
        const modalEl = document.getElementById("modalXacNhanVuotCapPhat");
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

        $("#btnXacNhanVuotCapPhat").off("click").on("click", function () {
            modal.hide();
            resolve(true);
        });

        $("#btnHuyVuotCapPhat").off("click").on("click", function () {
            modal.hide();
            resolve(false);
        });

        $(modalEl).off("hidden.bs.modal").on("hidden.bs.modal", function () {
            resolve(false);
        });

        modal.show();
    });
}
// Kiệt
$(function () {
    initDatetimepicker();

    $("#slcLocSoanHang").on('change', function () {
        const loc = $(this).val();
        if (loc == 0) {
            $(".colTuNgaySH").removeClass("d-none")
            $(".colDenNgaySH").removeClass("d-none")
        } else if (loc == 1) {
            $(".colTuNgaySH").addClass("d-none")
            $(".colDenNgaySH").addClass("d-none")

        }
        handleChangeTuNgayDenNgay();
    })

    $("#tuNgayThongKeChiTiet").on("change", function () {
        handleChangeTuNgayDenNgay()
    })

    $("#denNgayThongKeChiTiet").on("change", function () {
        handleChangeTuNgayDenNgay()
    })

    $("#iconReloadTK").on("click", function () {
        handleChangeTuNgayDenNgay();
    })
})

function handleChangeTuNgayDenNgay() {
    const locPhieuCap = $("#locPhieuCap").val()
    const tab = getCurrentTab();

    if (tab == 0) {
        if (locPhieuCap == 1) {
            GetMaLenhChuaCapXuatHang();
        } else {
            GetDaCapXuatHang();
        }
    } else {
        if (locPhieuCap == 1) {
            GetMaLenhChuaCapSoanHang();
        } else {
            GetMaLenhDaCapSoanHangV2();
        }
    }
}
function initDatetimepicker() {
    const today = new Date();
    const day = today.getDay();

    // Tính ngày đầu tuần (Thứ 2)
    const startOfWeek = new Date(today);
    const diffToMonday = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(today.getDate() + diffToMonday);

    // Tính ngày cuối tuần (Chủ nhật)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const picker1 = new tempusDominus.TempusDominus(document.getElementById('datetimepickersoanhang1'), {
        display: {
            components: {
                calendar: true,
                date: true,
                month: true,
                year: true,
                clock: false,
                hours: false,
                minutes: false,
                seconds: false
            }
        },
        localization: {
            format: 'dd/MM/yyyy'
        },
        defaultDate: startOfWeek,
    });
    const picker2 = new tempusDominus.TempusDominus(document.getElementById('datetimepickersoanhang2'), {
        display: {
            components: {
                calendar: true,
                date: true,
                month: true,
                year: true,
                clock: false,
                hours: false,
                minutes: false,
                seconds: false
            }
        },
        localization: {
            format: 'dd/MM/yyyy'
        },
        defaultDate: endOfWeek,
    });

    $(".dateInput").trigger("click");
    picker1.hide();
    picker2.hide();
}

// Option2

async function GetSHItemCodeGiaoViecPYCNPL(action) {
    var loc = $(".select_loc").val()
    try {
        var url = `/api/PhieuXuatHangNPL/Get?Action=${action}&para2=${trMaPhieu}&para4=${loc}`;
        const response = await fetch(url);
        const data = await response.json();
        batchDataSH = data;
        renderList(data)
    } catch (err) {
        console.error(err)
    }
}

async function GetChiTietMaNPLSoanHangMayMau(maNPLJoin, barcode = "", action) {
    var loc = $(".select_loc").val()
    const url = `/api/PhieuXuatHangNPL/Get?Action=${action}&para2=${trMaPhieu}&para3=${maNPLJoin}&para4=${loc}`;
    try {
        const response = await fetch(url)
        const data = await response.json();

        createViewDxDataGridDangKySH(data);

    } catch (err) {
        console.error(err)
    }

}
// View quét soạn hàng

// ====== STATE DÙNG CHUNG ======
let dxSoanHangMaster = null;
let dxSoanHangDetail = null;
let selectedPhieuSH = null; // PhieuSH đang được chọn để hiển thị bảng phải
let allSoanHangData = [];   // toàn bộ data gốc (mọi barcode), dùng để lọc detail

// 🔥 Distinct data: bảng trái chỉ hiển thị 1 dòng / vật tư (PhieuSH + MaNPL),
// không lặp lại theo từng barcode con như data gốc
function getDistinctMasterData(data) {
    const seen = new Map();

    (data || []).forEach(row => {
        const key = `${row.PhieuSH}__${row.MaNPL}`;

        if (!seen.has(key)) {
            seen.set(key, {
                ...row,
                TongSLQuet: Number(row.SLSoanHang_BC || 0)
            });
        } else {
            const item = seen.get(key);
            item.TongSLQuet += Number(row.SLSoanHang_BC || 0);
        }
    });

    return Array.from(seen.values()).map(item => ({
        ...item,
        TongSLQuet: parseFloat(item.TongSLQuet.toFixed(4))
    }));
}
function renderTableSoanHang(data) {
    allSoanHangData = data || [];

    if (allSoanHangData.length > 0) {
        $("#btnXoaDongChon").show();
        $("#btnXacNhanDongChon").show();
        const checkNguoiTao = allSoanHangData[0].CheckEdit;
        if (checkNguoiTao == 0) {
            $("#btnXoaDongChon").hide();
        } else {
            $("#btnXoaDongChon").show();
        }
    } else {
        $("#btnXoaDongChon").hide();
        $("#btnXacNhanDongChon").hide();
    }

    renderMasterTable(getDistinctMasterData(allSoanHangData));

    // 🔥 Mặc định khi load: lấy PhieuSH đầu tiên để đổ vào bảng phải
    if (allSoanHangData.length > 0) {
        const firstPhieuSH = allSoanHangData[0].PhieuSH;
        selectedPhieuSH = firstPhieuSH;
        renderDetailTableByPhieuSH(firstPhieuSH);
    } else {
        selectedPhieuSH = null;
        $("#tbodySoanHangDetail").empty();
    }
}

// =====================================================================
// TABLE TRÁI (MASTER): Xóa vật tư | ItemCode | Màu VT | Width/Size |
//                       Vị trí ô | Đơn vị | SLDK SH | Người soạn hàng | Ghi chú
// =====================================================================
function renderMasterTable(data) {
    let grid = $("#tbodySoanHang").data("dxDataGrid");

    if (grid) {
        grid.option("dataSource", data);
        grid.refresh();
        return;
    }
    console.log(data)
    dxSoanHangMaster = $("#tbodySoanHang").dxDataGrid({
        dataSource: data,
        keyExpr: undefined, // dùng theo MaNPL nếu unique, nếu không để dxDataGrid tự sinh key ảo
        columns: [
            {
                dataField: "PhieuSH",
                caption: "Số phiếu",
                cssClass: "col-header",
                minWidth: 100,
                allowEditing: false,
                groupIndex: 0,
                groupCellTemplate: function (container, options) {
                    const items = options.data.items || options.data.collapsedItems || [];
                    const dataFiltered = items;
                    const groupKey = options.value;

                    const $wrapper = $(`
                        <div class="d-flex align-items-center justify-content-between w-100">
                        </div>
                    `);

                    const $left = $(`
                        <span style="font-weight:bold;">
                            Số phiếu: ${options.value}
                        </span>
                    `);

                    const $right = $(`
                        <div class="d-flex align-items-center gap-2">
                        </div>
                    `);

                    // ===== Input scan (giữ luồng cũ) =====
                    const $inputGroup = $(`
                        <div class="input-group input-group-sm" style="width:220px">
                            <input autocomplete="off" id="${options.value}" type="text"
                                   class="form-control qrScanInput"
                                   placeholder="Quét barcode...">
                            <button id="${options.value}" type="button" style="border: 1px solid #ccc;"
                                    class="btn btn-light enterbarcodeSH">
                                <i class="bi bi-search"></i>
                            </button>
                        </div>
                    `);

                    $inputGroup.find(".enterbarcodeSH").on("click", function (e) {
                        e.stopPropagation();
                        e.preventDefault();

                        const barcode = $inputGroup.find(".qrScanInput").val().trim();
                        if (!barcode) return;

                        let ngayNhapKho = null;
                        let phieuSH = null;
                        const $this = $(this);
                        const idThis = $this.attr("id");
                        idPhieuSoanHang = idThis;
                        if (dataFiltered.length > 0) {
                            ngayNhapKho = dataFiltered[0].NgayNhapKho;
                            phieuSH = dataFiltered[0].PhieuSH;
                        }
                        dataGroupSH = dataFiltered;
                        GetBarCode(barcode, ngayNhapKho, phieuSH);
                    });

                    // ===== Button mở camera (giữ luồng cũ) =====
                    const $btn = $(`
                        <button 
                            class="btn btn-sm btn-secondary openScannerBtnSH"
                            style="font-size: 12px; padding: 5px 8px;">
                            <i class="fa-solid fa-camera me-1"></i>Quét 
                        </button>
                    `);

                    if (dataFiltered.length === 0) {
                        $btn.prop("disabled", true);
                    }

                    $btn.on("click", function (e) {
                        e.stopPropagation();
                        dataGroupSH = dataFiltered;

                        if (dataFiltered.length > 0) {
                            idPhieuSoanHang = dataFiltered[0].PhieuSH;
                            ngayNhapKhoLocal = dataFiltered[0].NgayNhapKho;
                            phieuSHLoacl = dataFiltered[0].PhieuSH;
                        }
                        const scannerModal = new bootstrap.Modal($('#scannerModalSH')[0]);
                        scannerModal.show();
                    });

                    const $input = $inputGroup.find(".qrScanInput");
                    $input.attr("data-groupkey", groupKey);
                    $input.data("groupData", dataFiltered);

                    $input.on("keydown", function (e) {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();

                            const $this = $(this);
                            const barcode = $this.val().trim();
                            if (!barcode) return;

                            const idThis = $this.attr("id");
                            idPhieuSoanHang = idThis;
                            dataGroupSH = dataFiltered;

                            let ngayNhapKho = null;
                            let phieuSH = null;
                            if (dataFiltered.length > 0) {
                                ngayNhapKho = dataFiltered[0].NgayNhapKho;
                                phieuSH = dataFiltered[0].PhieuSH;
                            }
                            GetBarCode(barcode, ngayNhapKho, phieuSH);
                        }
                    });

                    $right.append($inputGroup);
                    $right.append($btn);

                    $wrapper.append($left);
                    $wrapper.append($right);

                    $wrapper.appendTo(container);
                }
            },
            {
                dataField: "XoaVTPhieu",
                caption: "Xóa vật tư",
                cssClass: "col-header",
                minWidth: 70,
                alignment: "center",
                allowEditing: false,
                allowSorting: false,
                cellTemplate: function (container, options) {
                    var isDisabled = options.data.Status == 1 || options.data.CheckBarCodeQuet == 2;

                    $('<button>')
                        .addClass(`btn btn-danger btn-sm ${isDisabled ? "d-none" : ""}`)
                        .html('<i class="bi bi-trash"></i>')
                        .attr('disabled', isDisabled)
                        .css({ padding: "4px 8px", fontSize: "12px" })
                        .on('click', function (e) {
                            e.stopPropagation();
                            if (isDisabled) return;
                            showConfirmModalDeleteSH(async function () {
                                const phieuSH = options.data.PhieuSH;
                                const maNPL = options.data.MaNPL;
                                const barcode = options.data.BarCode;

                                var arrSoanHang = [{
                                    PhieuSH: phieuSH, Dot: '', MaLenh: '', MaLenhSX: '',
                                    MaNPL: maNPL, MaVT: '', MauVT: '', KhoSize: '', DonVi: '',
                                    IsNPL: '', SLCapPhat: '', SLSoanHang: 0, NguoiSoanHang: 0,
                                    NgayDangKy: '', NgaySoanHang: '', IsXN: 0, KyTen: 0,
                                    NgayXacNhan: "", GhiChu: 0, NguoiTao: '', NgayTao: '',
                                    BarCode: barcode
                                }];

                                UpdateTTSoanHang(arrSoanHang, "DeleteSoanHang");
                            });
                        })
                        .appendTo(container);
                }
            },
            { dataField: "MaVT", caption: "ItemCode", cssClass: "col-header", minWidth: 100, allowEditing: false },
            { dataField: "MauVT", caption: "Màu VT", cssClass: "col-header", minWidth: 90, allowEditing: false },
            { dataField: "KhoSize", caption: "Width/Size", cssClass: "col-header", minWidth: 90, allowEditing: false },
            { dataField: "MaONPL", caption: "Vị trí ô", cssClass: "col-header", minWidth: 80, allowEditing: false },
            { dataField: "DonVi", caption: "Đơn vị", cssClass: "col-header", minWidth: 70, allowEditing: false },
            {
                dataField: "TongSLQuet",
                caption: "Tổng SL quét",
                cssClass: "col-header",
                alignment: "center",
                width: 120
            },

            {
                dataField: "SLSoanHang",
                caption: "SL ĐK Soạn Hàng",
                cssClass: "col-header",
                minWidth: 110,
                allowEditing: false,
                cellTemplate: function (container, options) {
                    var isDisabled = options.data.Status == 1 || options.data.CheckEdit == 0;

                    $('<input>')
                        .addClass('form-control form-control-sm')
                        .attr('type', 'number')
                        .attr('step', '0.01')
                        .attr('disabled', isDisabled)
                        .val(parseFloat((options.value ?? 0).toFixed(4)))
                        .on('click', function (e) { e.stopPropagation(); })
                        .on('change', function () {
                            if (isDisabled) return;
                            options.data.SLSoanHang = parseFloat($(this).val()) || 0;

                            const { PhieuSH, MaNPL, GhiChu, NguoiSoanHang, BarCode } = options.data;
                            ArrSoanHang(PhieuSH, MaNPL, options.data.SLSoanHang, NguoiSoanHang, GhiChu, 0, "", BarCode);
                        })
                        .appendTo(container);
                }
            },
            {
                dataField: "NguoiSoanHang",
                caption: "Người Soạn Hàng",
                cssClass: "col-header",
                minWidth: 120,
                allowEditing: false,
                cellTemplate: function (container, options) {
                    var isDisabled = options.data.Status == 1 || options.data.CheckEdit == 0;

                    $('<input>')
                        .addClass('form-control form-control-sm')
                        .attr('type', 'text')
                        .attr('disabled', isDisabled)
                        .val(options.value || '')
                        .on('click', function (e) { e.stopPropagation(); })
                        .on('change', function () {
                            if (isDisabled) return;
                            options.data.NguoiSoanHang = $(this).val();

                            const { PhieuSH, MaNPL, SLSoanHang, GhiChu, BarCode } = options.data;
                            ArrSoanHang(PhieuSH, MaNPL, SLSoanHang, options.data.NguoiSoanHang, GhiChu, 0, "", BarCode);
                        })
                        .appendTo(container);
                }
            },
            {
                dataField: "GhiChu",
                caption: "Ghi Chú",
                cssClass: "col-header",
                minWidth: 150,
                allowEditing: false,
                cellTemplate: function (container, options) {
                    var isDisabled = options.data.Status == 1 || options.data.CheckEdit == 0;

                    $('<input>')
                        .addClass('form-control form-control-sm')
                        .attr('type', 'text')
                        .attr('disabled', isDisabled)
                        .val(options.value || '')
                        .on('click', function (e) { e.stopPropagation(); })
                        .on('change', function () {
                            if (isDisabled) return;
                            options.data.GhiChu = $(this).val();

                            const { PhieuSH, MaNPL, SLSoanHang, NguoiSoanHang, BarCode } = options.data;
                            ArrSoanHang(PhieuSH, MaNPL, SLSoanHang, NguoiSoanHang, options.data.GhiChu, 0, "", BarCode);
                        })
                        .appendTo(container);
                }
            },
            {
                dataField: "CheckA",
                caption: "",
                cssClass: "col-header position-relative",
                minWidth: 50,
                alignment: "center",
                allowEditing: false,
                allowSorting: false,
                headerCellTemplate: function (container, options) {
                    container.css({
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    });

                    const $checkAll = $('<input type="checkbox">')
                        .addClass('form-check-input')
                        .css({ width: '18px', height: '18px', cursor: 'pointer' })
                        .on('change', function () {
                            const isChecked = $(this).is(':checked');

                            // Chỉ tác động trong grid hiện tại (toàn bộ các dòng chưa xác nhận)
                            container.closest(".dx-datagrid")
                                .find('.row-checkbox-master:not(:disabled)')
                                .prop('checked', isChecked);
                        });

                    container.empty().append($checkAll);
                },
                cellTemplate: function (container, options) {
                    var isConfirmed = options.data.Status == 1; // đã xác nhận -> ẩn checkbox
                    var isDisabled = isConfirmed || options.data.CheckEdit == 0;

                    $('<input>')
                        .addClass(`form-check-input row-checkbox-master ${isConfirmed ? "d-none" : ""}`)
                        .attr('type', 'checkbox')
                        .attr('disabled', isDisabled)
                        .attr('data-phieush', options.data.PhieuSH)
                        .attr('data-manpl', options.data.MaNPL)
                        .css({
                            width: '18px',
                            height: '18px',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            marginTop: '-9px',
                            marginLeft: '-14px',
                        })
                        .on('click', function (e) { e.stopPropagation(); })
                        .appendTo(container);
                }
            }
        ],
        editing: { mode: "cell", allowUpdating: false, confirmDelete: false },
        noDataText: "Chưa có dữ liệu",
        columnAutoWidth: true,
        columnHidingEnabled: false,
        wordWrapEnabled: true,
        showBorders: true,
        scrolling: { mode: 'standard' },
        filterRow: { visible: true },
        headerFilter: { visible: false },
        rowAlternationEnabled: false,
        paging: { enabled: false },
        renderAsync: false,
        grouping: { autoExpandAll: true },
        groupPanel: { visible: false },
        selection: { mode: "single" },
        loadPanel: {
            enabled: true,
            text: "Đang tải dữ liệu...",
            showIndicator: true,
            showPane: true
        },
        // 🔥 Click vào row trái -> lấy PhieuSH của row đó, đổ data sang table phải
        onRowClick: function (e) {
            if (e.rowType !== "data") return;
            selectedPhieuSH = e.data.PhieuSH;
            renderDetailTableByPhieuSH(selectedPhieuSH);

            // highlight row đang chọn (tuỳ chọn, không bắt buộc)
            $(e.rowElement).siblings().removeClass("row-selected-sh");
            $(e.rowElement).addClass("row-selected-sh");
        },
        onContentReady: function () {
            // giữ lại nếu cần xử lý merge cell ở các phiên bản sau
        }
    }).dxDataGrid("instance");
}

// =====================================================================
// TABLE PHẢI (DETAIL): ItemCode | Vật tư | Barcode | Ghi chú quét |
//                       SL soạn hàng | Trạng thái
// Lọc trực tiếp từ allSoanHangData theo PhieuSH (không phụ thuộc row cụ thể)
// =====================================================================
function renderDetailTableByPhieuSH(phieuSH) {
    if (!phieuSH) {
        $("#tbodySoanHangDetail").empty();
        return;
    }

    // Lọc toàn bộ các dòng (mọi vật tư/barcode) thuộc PhieuSH đang chọn
    const detailData = allSoanHangData.filter(
        row => row.PhieuSH == phieuSH && row.BarCode != null && row.BarCode !== ""
    );

    if ($("#tbodySoanHangDetail").length === 0) {
        console.warn("Không tìm thấy container #tbodySoanHangDetail trong modal.");
        return;
    }

    if (dxSoanHangDetail) {
        dxSoanHangDetail.dispose();
        dxSoanHangDetail = null;
    }

    let grid = $("#tbodySoanHangDetail").data("dxDataGrid");

    if (grid) {
        grid.option("dataSource", detailData);
        grid.refresh();
        return;
    }
    dxSoanHangDetail = $("#tbodySoanHangDetail").dxDataGrid({
        dataSource: detailData,
        columns: [
            {
                dataField: "MaVT",
                caption: "ItemCode",
                cssClass: "col-header",
                minWidth: 100,
                allowEditing: false,
                groupIndex: 0,
                groupCellTemplate: function (container, options) {
                    const items = options.data.items || options.data.collapsedItems || [];

                    const firstItem = items[0] || {};

                    const mauVT = firstItem.MauVT || "";
                    const khoSize = firstItem.KhoSize || "";
                    const slSoanHang = parseFloat((firstItem.SLSoanHang || 0).toFixed(4));

                    $(`
                        <span style="font-weight:bold;">
                            ${options.value}
                            ${mauVT ? "- " + mauVT : ""}
                            ${khoSize ? "- " + khoSize : ""}
                            - SL ĐK: ${slSoanHang}
                        </span>
                    `).appendTo(container);
                }
            },
            { dataField: "SoKienHienThi", caption: "Vật Tư", cssClass: "col-header", minWidth: 100, allowEditing: false },
            {
                dataField: "BarCode",
                caption: "Barcode",
                cssClass: "col-header",
                minWidth: 140,
                allowEditing: false,
                cellTemplate: function (container, options) {
                    const $wrap = $(`<div class="d-flex align-items-center gap-1"></div>`);
                    $(`<span>${options.value || ""}</span>`).appendTo($wrap);
                    $wrap.appendTo(container);
                }
            },
            {
                dataField: "GhiChuQuet",
                caption: "Ghi Chú Quét",
                cssClass: "col-header",
                minWidth: 150,
                allowEditing: false,
                cellTemplate: function (container, options) {
                    var isDisabled = options.data.Status == 1 || options.data.CheckEdit == 0 || options.data.CheckBarCodeQuet == 1;

                    $('<input>')
                        .addClass('form-control form-control-sm')
                        .attr('type', 'text')
                        .attr('disabled', isDisabled)
                        .val(options.value || '')
                        .on('change', function () {
                            if (isDisabled) return;
                            options.data.GhiChuQuet = $(this).val();

                            const arrUpdate = [{
                                PhieuSH: options.data.PhieuSH,
                                BarCode: options.data.BarCode,
                                GhiChu: $(this).val().trim(),
                                SLSoanHang_BC: options.data.SLSoanHang_BC
                            }];
                            PostBarCodeSH(arrUpdate, 2);
                        })
                        .appendTo(container);
                }
            },
            {
                dataField: "SLSoanHang_BC",
                caption: "SL soạn hàng",
                cssClass: "col-header",
                minWidth: 120,
                allowEditing: false,
                cellTemplate: function (container, options) {
                    var isDisabled = options.data.Status == 1 || options.data.CheckBarCodeQuet == 1;

                    $('<input>')
                        .addClass('form-control form-control-sm')
                        .attr('type', 'text')
                        .attr('disabled', isDisabled)
                        .val(options.value || '')
                        .on('input', function () {
                            if (!validateSoLuong(this, options)) return;
                        })
                        .on('change', function () {
                            if (isDisabled) return;
                            options.data.SLSoanHang_BC = $(this).val();

                            const arrUpdate = [{
                                PhieuSH: options.data.PhieuSH,
                                BarCode: options.data.BarCode,
                                GhiChu: options.data.GhiChuQuet ? String(options.data.GhiChuQuet).trim() : "",
                                SLSoanHang_BC: options.data.SLSoanHang_BC
                            }];
                            PostBarCodeSH(arrUpdate, 2);
                        })
                        .appendTo(container);
                }
            },
            { dataField: "DonVi", caption: "Đơn vị", cssClass: "col-header", minWidth: 70, allowEditing: false },
            {
                dataField: "Status",
                caption: "Trạng thái",
                cssClass: "col-header",
                minWidth: 120,
                alignment: "center",
                allowEditing: false,
                cellTemplate: function (container, options) {
                    var status = options.value == 1
                        ? '<span class="text-success p-2" style="font-size:12px; font-weight:500;">Đã xác nhận</span>'
                        : '<span class="text-warning p-2" style="font-size:12px; font-weight:500;">Chưa xác nhận</span>';
                    $(container).html(status);
                }
            },
            {
                caption: "Xóa barcode SH",
                cssClass: "col-header",
                minWidth: 80,
                alignment: "center",
                allowEditing: false,
                allowSorting: false,
                cellTemplate: function (container, options) {
                    var isDisabled = options.data.Status == 1 || options.data.CheckBarCodeQuet == 1;

                    $('<button>')
                        .addClass(`btn btn-danger btn-sm ${isDisabled ? "d-none" : ""}`)
                        .html('<i class="bi bi-trash"></i>')
                        .attr('disabled', isDisabled)
                        .css({ padding: "4px 8px", fontSize: "12px" })
                        .on('click', function (e) {
                            e.stopPropagation();
                            if (isDisabled) return;
                            $("#vattuDelete").text(options.data.SoKienHienThi);

                            showConfirmModalDeleteSH(async function () {
                                const phieuSH = options.data.PhieuSH;
                                const maNPL = options.data.MaNPL;
                                const barcode = options.data.BarCode;

                                var arrSoanHang = [{
                                    PhieuSH: phieuSH, Dot: '', MaLenh: '', MaLenhSX: '',
                                    MaNPL: maNPL, MaVT: '', MauVT: '', KhoSize: '', DonVi: '',
                                    IsNPL: '', SLCapPhat: '', SLSoanHang: 0, NguoiSoanHang: 0,
                                    NgayDangKy: '', NgaySoanHang: '', IsXN: 0, KyTen: 0,
                                    NgayXacNhan: "", GhiChu: 0, NguoiTao: '', NgayTao: '',
                                    BarCode: barcode
                                }];

                                UpdateTTSoanHang(arrSoanHang, "DeleteSoanHangBarCode");

                                const grid = $("#tbodySoanHangDetail").dxDataGrid("instance");
                                grid.deleteRow(options.rowIndex);
                            });
                        })
                        .appendTo(container);
                }
            }
        ],
        editing: { mode: "cell", allowUpdating: false, confirmDelete: false },
        noDataText: "Phiếu này chưa có dữ liệu",
        columnAutoWidth: true,
        wordWrapEnabled: true,
        showBorders: true,
        scrolling: { mode: 'standard' },
        filterRow: { visible: true },
        headerFilter: { visible: false },
        paging: { enabled: false },
        renderAsync: false,
        grouping: { autoExpandAll: true },
        groupPanel: { visible: false }
    }).dxDataGrid("instance");
}

// =====================================================================
// Hàm gọi sau khi GetBarCode / PostBarCodeSH cập nhật allSoanHangData
// để refresh lại cả 2 bảng mà không mất phiếu đang xem
// =====================================================================
function refreshSoanHangTables(newData) {
    allSoanHangData = newData || allSoanHangData;

    if (dxSoanHangMaster) {
        dxSoanHangMaster.option("dataSource", getDistinctMasterData(allSoanHangData));
    } else {
        renderMasterTable(getDistinctMasterData(allSoanHangData));
    }

    // Kiểm tra phiếu đang chọn còn dữ liệu không, nếu không thì fallback về phiếu đầu tiên
    const stillExists = selectedPhieuSH
        ? allSoanHangData.some(r => r.PhieuSH == selectedPhieuSH)
        : false;

    if (stillExists) {
        renderDetailTableByPhieuSH(selectedPhieuSH);
    } else if (allSoanHangData.length > 0) {
        selectedPhieuSH = allSoanHangData[0].PhieuSH;
        renderDetailTableByPhieuSH(selectedPhieuSH);
    } else {
        selectedPhieuSH = null;
        $("#tbodySoanHangDetail").empty();
    }
}

// =====================================================================
// Lấy danh sách vật tư (dòng) đã được tick check ở bảng trái
// Dùng cho nút "Xác nhận dòng chọn" / "Xóa dòng chọn"
// Trả về mảng object data gốc tương ứng các dòng đã check
// =====================================================================
function getCheckedMasterRows() {
    const checkedRows = [];

    $("#tbodySoanHang").find(".row-checkbox-master:checked").each(function () {
        const phieuSH = $(this).attr("data-phieush");
        const maNPL = $(this).attr("data-manpl");

        const rowData = allSoanHangData.find(r =>
            r.PhieuSH == phieuSH && r.MaNPL == maNPL
        );
        if (rowData) checkedRows.push(rowData);
    });

    return checkedRows;
}
function refreshAfterScanBarcode(newData, phieuSHDangQuet) {
    allSoanHangData = newData || allSoanHangData;
    selectedPhieuSH = phieuSHDangQuet;
    refreshSoanHangTables(allSoanHangData);
}
$(function () {
    $("#btnXacNhanDongChon").on("click", function () {
        // 🔥 Lấy checkbox đã check ở bảng TRÁI (master), không phải theo barcode nữa
        var checkedBoxes = $("#tbodySoanHang").find(".row-checkbox-master:checked:not(:disabled)");
        if (checkedBoxes.length === 0) {
            showToast("warning", "Vui lòng chọn dòng để xác nhận");
            return;
        }

        // Lấy danh sách các vật tư (row) được chọn, dựa theo PhieuSH + MaNPL
        // từ allSoanHangData (data gốc đầy đủ, chưa distinct)
        var selectedRows = [];
        checkedBoxes.each(function () {
            var phieuSH = $(this).attr('data-phieush');
            var maNPL = $(this).attr('data-manpl');

            var row = allSoanHangData.find(function (item) {
                return item.PhieuSH == phieuSH && item.MaNPL == maNPL;
            });
            if (row) {
                selectedRows.push(row);
            }
        });

        showConfirmModalSign(async function () {
            var arrSoanHang = [];
            var dataUser = !window.CefSharp ? userNameSave : userName;
            const signatureImage = canvas.toDataURL('image/png');

            selectedRows.forEach(function (row) {
                // Cập nhật Status = 1 cho TẤT CẢ các dòng (mọi barcode con) thuộc
                // cùng PhieuSH + MaNPL trong allSoanHangData
                allSoanHangData.forEach(function (item) {
                    if (item.PhieuSH == row.PhieuSH && item.MaNPL == row.MaNPL) {
                        item.Status = 1;
                    }
                });

                arrSoanHang.push({
                    PhieuSH: row.PhieuSH,
                    Dot: '',
                    MaLenh: '',
                    MaLenhSX: '',
                    MaNPL: row.MaNPL,
                    MaVT: '',
                    MauVT: '',
                    KhoSize: '',
                    DonVi: '',
                    IsNPL: '',
                    SLCapPhat: '',
                    SLSoanHang: 0,
                    NguoiSoanHang: dataUser,
                    NgayDangKy: '',
                    NgaySoanHang: '',
                    IsXN: 1,
                    KyTen: signatureImage,
                    NgayXacNhan: '',
                    GhiChu: 0,
                    NguoiTao: '',
                    NgayTao: '',
                    BarCode: ""
                });
            });

            checkedBoxes.prop('checked', false);

            // 🔥 Refresh cả 2 bảng (trái distinct lại, phải theo phiếu đang xem)
            refreshSoanHangTables(allSoanHangData);

            $(".classSignSave").show();
            $(".classSignSaveSH").hide();
            UpdateTTSoanHang(arrSoanHang, "UpdateXNSoanHang");
        });
    });
});
const API = {
    async GetV2(action, para = {}, textSuccess = '') {
        const paraConvert = Object.entries(para || {})
            .map(([key, value]) => `${key}=${value}`)
            .join("&");

        const url = `/api/PhieuXuatHangNPL/GetV2?action=${action}${paraConvert ? '&' + paraConvert : ''}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Response status: ${response.status}`);

            const data = await response.json();
            if (textSuccess) showToast("success", textSuccess);
            return data;
        } catch (error) {
            console.error(error);
        }
    },
};
let batchDataLan;
let selectedItemsLan = [];
async function GetMaLan() {
    GetChiTietLenhVatTu(0);
    //$('#maLenhInputLan').val('');
    //const maLenhDK = trMaLenh
    //const data = await API.GetV2("GetLanTheoLenhSX", { para1: maLenhDK });
    //// Lọc để chỉ lấy phần tử đầu tiên khi trùng MaLenhSanXuat
    //const uniqueMap = new Map();
    //data.forEach(item => {
    //    if (!uniqueMap.has(item.STTPhieu)) {
    //        uniqueMap.set(item.STTPhieu, item);
    //    }
    //});

    //const uniqueData = Array.from(uniqueMap.values());

    //batchDataLan = uniqueData;
    //renderListLan(uniqueData);
}

function renderListLan(data) {
    const itemListLan = $('#itemListLan');
    itemListLan.empty();

    // Kiểm tra data có tồn tại và là array không
    if (!data || !Array.isArray(data)) {
        return;
    }
    const html = data.map(item => {
        const isChecked = selectedItemsLan.some(selected => selected.STTPhieu == item.STTPhieu);
        return `
            <div class="dropdown-item">
                <input type="checkbox" 
                       id="${item.STTPhieu}"
                       data-display="${item.Display}"
                       ${isChecked ? 'checked' : ''}>
                <label class="mb-0" for="${item.STTPhieu}">${item.Display}</label>
            </div>
        `;
    }).join('');

    itemListLan.append(html);
    updateCheckAllLan();
    setupDropdownLan()
}
function setupDropdownLan() {

    $(document)
        .off('click.dropdownLan')
        .on('click.dropdownLan', function (e) {

            if (!$(e.target).closest('.select-container').length) {
                $('#dropdownListLan').removeClass('show');
            }

        });

}


function updateCheckAllLan() {
    const total = $('#itemList input[type="checkbox"]').length;
    const checked = $('#itemList input[type="checkbox"]:checked').length;
    $('#checkAll').prop('checked', total > 0 && total == checked);
}

function updateInputLan() {
    const displayText = selectedItemsLan.map(item => item.Display).join(', ');
    $('#maLenhInputLan').val(displayText);
}
$(function () {
    $('#maLenhInputLan').click(function (e) {
        e.stopPropagation();
        $('#dropdownListLan').toggleClass('show');
        $('#searchInputLan').val('').focus();
        renderListLan(batchDataLan);
    });
    $('#checkAllLan').change(async function () {
        const isChecked = $(this).is(':checked');
        $('#itemListLan input[type="checkbox"]').prop('checked', isChecked);
        const selectedIds = $('#itemListLan input[type="checkbox"]:checked')
            .map(function () {
                return this.id;
            })
            .get();

        // Chuỗi STTPhieu ngăn cách bởi ;
        const sttPhieu = selectedIds.join(';');
        if (isChecked)
            selectedItemsLan = [...batchDataLan]
        else selectedItemsLan = []

        updateInputLan();
        GetChiTietLenhVatTu(sttPhieu);
    });
    $(document).on('change', '#itemListLan input[type="checkbox"]', async function () {

        const selectedIds = $('#itemListLan input[type="checkbox"]:checked')
            .map(function () {
                return this.id;
            })
            .get();

        const sttPhieu = selectedIds.join(';');

        // Cập nhật lại mảng theo danh sách đang được check
        selectedItemsLan = batchDataLan.filter(item =>
            selectedIds.includes(item.STTPhieu.toString())
        );

        updateCheckAllLan();
        updateInputLan();

    });
    $('#searchInputLan').on('input', function () {
        const searchTerm = $(this).val().toLowerCase();
        const filtered = batchDataLan.filter(item => item.Display.toLowerCase().includes(searchTerm));
        renderListLan(filtered);
    });
})
