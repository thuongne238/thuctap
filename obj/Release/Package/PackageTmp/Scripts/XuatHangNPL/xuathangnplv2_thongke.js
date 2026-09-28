/// kiet-13032026
let dxPhieuCap1;
let dxPhieuCap2;
let dxPhieuCap3;
let dxPhieuCap4;
let dxPhieuCap5;
let dxPhieuCap6;
let dxPhieuCap7;
let dxPhieuCap8;
let dxPhieuCap9;
let dxPhieuCap10;
let dxPhieuCap11;
let dxPhieuCap12;
let dxPhieuCap13;
let dxPhieuCap14;
var batchDataMalenh = [];
var selectedItemCodeItems = [];
var itemCodeJoin = [];
var selectedRowMaLenh;

/// Event
$(document).ready(function () {
    $(".select_loc").select2({
        minimumResultsForSearch: Infinity
    });
    $(".selectView").select2({
        minimumResultsForSearch: Infinity
    });
    initDatePicker()

    createViewDxDataGridPhieuCap1([]);
    createViewDxDataGridPhieuCap2([]);
    createViewDxDataGridPhieuCap3([]);
    createViewDxDataGridPhieuCap4([]);
    createViewDxDataGridPhieuCap5([]);
    createViewDxDataGridPhieuCap6([]);
    createViewDxDataGridPhieuCap7([]);
    createViewDxDataGridPhieuCap8([]);
    createViewDxDataGridPhieuCap9([]);
    createViewDxDataGridPhieuCap10([]);

    createViewDxDataGridPhieuCap11([]);
    createViewDxDataGridPhieuCap12([]);
    createViewDxDataGridPhieuCap13([]);
    createViewDxDataGridPhieuCap14([]);


})
$(function () {

    $(".select_2_modalPhieuCap").select2({
        dropdownParent: "#modalPhieuCap",
        minimumResultsForSearch: Infinity
    })

    $("#locPhieuCap").on("change", async function () {
        onChangeThongKe()
    })

    $("#modalPhieuCap").on("show.bs.modal", function () {
        GetMaLenhChuaCap();
        GetMaLenhGiaoViecChuaHT();
        GetMaLenhGiaoViecHT();
    })

    $("#modalPhieuCap").on("hide.bs.modal", function () {
        isFirstChange = true
    })

    $("#tuNgayPhieuYC").on("change", async function () {
        $("#itemCodeInput").val('');
        const valueLoc = $("#locPhieuCap").val();
        if (valueLoc == 2) {
            createViewDxDataGridPhieuCap1([])
            createViewDxDataGridPhieuCap2([])
            await GetItemCodeChuaXacNhan();
        } else {
            createViewDxDataGridPhieuCap5([])
            createViewDxDataGridPhieuCap6([])
            await GetItemCodeDaXacNhan();
        }

        GetDaCapXuatHang();
    })

    $("#denNgayPhieuYC").on("change", async function () {
        $("#itemCodeInput").val('');
        createViewDxDataGridPhieuCap1([])
        createViewDxDataGridPhieuCap2([])
        isFirstChange = true
        await GetItemCodeChuaXacNhan();
        GetDaCapXuatHang();
    })

    $('#btnShowPhieuYC').on("click", function () {
        $("#modalPhieuCap").modal("show");
        onChangeThongKe()
    })
    $('#searchitemCodeInput').on('input', function () {
        const searchTerm = $(this).val().toLowerCase();
        const filtered = batchDataMalenh.filter(item => item.Display.toLowerCase().includes(searchTerm));
        renderListItemCode(filtered);
    });

    $('#checkAll').change(async function () {
        const isChecked = $(this).is(':checked');

        try {
            if (isChecked) {
                selectedItemCodeItems = [...batchDataMalenh];
                itemCodeJoin = selectedItemCodeItems.map(item => item.MaNPL).join(";")
            } else {
                selectedItemCodeItems = [];
                itemCodeJoin = [];
                $("#itemCodeInput").val('')
                createViewDxDataGridPhieuCap1([])
                createViewDxDataGridPhieuCap2([])
            }

            $('#itemList input[type="checkbox"]').prop('checked', isChecked);
            updateInput();

            const loc = $("#locPhieuCap").val();
            if (itemCodeJoin.length > 0) {
                if (loc == 2 || loc == 3) {
                    GetDaCapXuatHang();
                }
            }
        } catch (err) {
            console.error(err)
        }

    });

    $(document).on('change', '#itemList input[type="checkbox"]', async function () {
        const itemId = $(this).attr('id');
        const isChecked = $(this).is(':checked');

        if (isChecked) {
            const item = batchDataMalenh.find(x => x.MaNPL == itemId);
            if (item && !selectedItemCodeItems.some(x => x.MaNPL == itemId)) selectedItemCodeItems.push(item);
        } else {
            selectedItemCodeItems = selectedItemCodeItems.filter(x => x.MaNPL != itemId);
        }

        updateCheckAll();
        updateInput();

        const loc = $("#locPhieuCap").val();
        if (selectedItemCodeItems.length > 0) {
            if (loc == 2 || loc == 3) {
                GetDaCapXuatHang();
            }
        } else {
            createViewDxDataGridPhieuCap1([]);
            createViewDxDataGridPhieuCap2([]);
            createViewDxDataGridPhieuCap5([]);
            createViewDxDataGridPhieuCap6([]);
        }
    });
    // malenh vs isNPL

    $('#itemCodeInput').click(function (e) {
        e.stopPropagation();
        $('#dropdownList').toggleClass('show');
        $('#searchInput').val('').focus();
        renderListItemCode(batchDataMalenh);
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.select-container').length) {
            $('#dropdownList').removeClass('show');
        }
    });

    $("#locTrangThaiGiaoViec").on("change", function () {
        const locGiaoViec = $(this).val();

        if (locGiaoViec == 1) {
            $('.containerGrid2_CHT').removeClass("d-none");
            $('.containerGrid2_HT').addClass("d-none");
        } else {
            $('.containerGrid2_CHT').addClass("d-none");
            $('.containerGrid2_HT').removeClass("d-none");

        }
    })

    $("#tuNgayGiaoViec").on('change', function () {
        handleChangeNgayGV()
    })
    $("#tuNgayGiaoViec").on('change', function () {
        handleChangeNgayGV()
    })
    $(".icon_reload_2").on('click', function () {
        handleChangeNgayGV()
    })
})


/// Event Checkbox Input
function renderListItemCode(data) {
    const itemList = $('#itemList');
    itemList.empty();

    // Kiểm tra data có tồn tại và là array không
    if (!data || !Array.isArray(data)) {
        return;
    }

    // Mặc định chọn hết tất cả
    //if (isFirstChange) {
    //    selectedItemCodeItems = [...data];
    //    itemCodeJoin = selectedItemCodeItems.map(item => item.MaNPL).join(";");
    //    updateInput();
    //    isFirstChange = false
    //}

    const html = data.map(item => {
        const isChecked = selectedItemCodeItems.some(selected => selected.MaNPL == item.MaNPL);
        return `
            <div class="dropdown-item">
                <input type="checkbox" 
                       id="${item.MaNPL}"
                       data-display="${item.Display}"
                       ${isChecked ? 'checked' : ''}>
                <label class="mb-0" for="${item.MaNPL}">${item.Display}</label>
            </div>
        `;
    }).join('');

    itemList.append(html);
    updateCheckAll();
}
/// Helper Function
function formatNumber(value) {
    if (value === undefined || value === null || value === "") return "";

    let str = value.toString();
    let intPart = str;
    let decPart = "";

    if (str.includes(".")) {
        [intPart, decPart] = str.split(".");
        decPart = decPart.substring(0, 4);
    }

    let formattedInt = Number(intPart).toLocaleString();

    return decPart ? `${formattedInt}.${decPart}` : formattedInt;
}
async function onChangeThongKe() {
    const valueLoc = $("#locPhieuCap").val();
    $("#itemCodeInput").val('');
    batchDataMalenh = [];
    itemCodeJoin = [];
    selectedItemCodeItems = [];
    $("#itemList").empty();
    createViewDxDataGridPhieuCap1([]);
    createViewDxDataGridPhieuCap2([]);
    createViewDxDataGridPhieuCap3([]);
    createViewDxDataGridPhieuCap4([]);
    createViewDxDataGridPhieuCap5([]);
    createViewDxDataGridPhieuCap6([]);
    createViewDxDataGridPhieuCap7([]);
    createViewDxDataGridPhieuCap8([]);
    createViewDxDataGridPhieuCap9([]);
    createViewDxDataGridPhieuCap10([]);

    // Ẩn tất cả grid trước
    $(".containerGrid1, .containerGrid2, .containerGrid3, .containerGrid4, .containerGrid5").addClass("d-none");

    // Hiện đúng grid theo valueLoc
    $(`.containerGrid${valueLoc}`).removeClass("d-none");

    // Toggle các cột filter
    const showFilter = valueLoc != 1 && valueLoc != 4 && valueLoc != 5;
    $(".colTuNgayPC, .colDenNgayPC, .colCBItemCode").toggleClass("d-none", !showFilter);

    // Xử lý logic riêng
    if (valueLoc == 1) {
        GetMaLenhChuaCap();
    } else if (valueLoc == 2) {
        await GetItemCodeChuaXacNhan();
        GetDaCapXuatHang();
    } else if (valueLoc == 3) {
        await GetItemCodeDaXacNhan();
        GetDaCapXuatHang();
    } else if (valueLoc == 4) {
        await GetLenhChuaCapChuaDangKy();
    } else if (valueLoc == 5) {
        await GetLenhKetThuc();
    }
}
function updateCheckAll() {
    const total = $('#itemList input[type="checkbox"]').length;
    const checked = $('#itemList input[type="checkbox"]:checked').length;
    $('#checkAll').prop('checked', total > 0 && total == checked);
}
function updateInput() {
    const displayText = selectedItemCodeItems.map(item => item.Display).join(', ');
    $('#itemCodeInput').val(displayText);

    itemCodeJoin = selectedItemCodeItems.map(item => item.MaNPL).join(";")
}

/// API
async function GetItemCodeChuaXacNhan() {
    try {
        var loc = $(".select_loc").val();

        const tuMoment = moment($("#tuNgayPhieuYC").val(), "DD/MM/YYYY", true);
        const denMoment = moment($("#denNgayPhieuYC").val(), "DD/MM/YYYY", true);

        if (!tuMoment.isValid() || !denMoment.isValid()) {
            return;
        }

        if (tuMoment.isAfter(denMoment)) {
            return;
        }

        const tuNgay = tuMoment.format("YYYY-MM-DD");
        const denNgay = denMoment.format("YYYY-MM-DD");
        var url = `/api/PhieuXuatHangNPL/Get?Action=GetItemDaCapXuatHang&para1=${tuNgay}&para2=${denNgay}&para3=${loc}`;
        const response = await fetch(url)
        const data = await response.json();
        createViewDxDataGridPhieuCap1([])
        createViewDxDataGridPhieuCap2([])
        $("#itemCodeInput").val('');
        batchDataMalenh = data
        renderListItemCode(data)

    } catch (err) {
        console.error(err)
    }
}
async function GetItemCodeDaXacNhan() {
    try {
        var loc = $(".select_loc").val();

        const tuMoment = moment($("#tuNgayPhieuYC").val(), "DD/MM/YYYY", true);
        const denMoment = moment($("#denNgayPhieuYC").val(), "DD/MM/YYYY", true);

        if (!tuMoment.isValid() || !denMoment.isValid()) {
            return;
        }

        if (tuMoment.isAfter(denMoment)) {
            return;
        }

        const tuNgay = tuMoment.format("YYYY-MM-DD");
        const denNgay = denMoment.format("YYYY-MM-DD");
        var url = `/api/PhieuXuatHangNPL/Get?Action=GetItemDaCapXuatHangDaXacNhan&para1=${tuNgay}&para2=${denNgay}&para3=${loc}`;
        const response = await fetch(url)
        const data = await response.json();
        $("#itemCodeInput").val('');
        batchDataMalenh = data
        renderListItemCode(data)
        createViewDxDataGridPhieuCap5([])
        createViewDxDataGridPhieuCap6([])
    } catch (err) {
        console.error(err)
    }
}
async function GetDaCapXuatHang() {
    try {
        var loc = $(".select_loc").val()
        const tuNgay = moment($("#tuNgayPhieuYC").val(), "DD/MM/YYYY").format("YYYY-MM-DD")
        const denNgay = moment($("#denNgayPhieuYC").val(), "DD/MM/YYYY").format("YYYY-MM-DD")
        var url = `/api/PhieuXuatHangNPL/Get?Action=GetDaCapXuatHang&para1=${tuNgay}&para2=${denNgay}&para4=${itemCodeJoin}&para5=${loc}`;
        const response = await fetch(url)
        const data = await response.json();

        var locPhieuCap = $("#locPhieuCap").val()
        if (locPhieuCap == 2) {
            createViewDxDataGridPhieuCap1(data);
        } else if (locPhieuCap == 3) {
            createViewDxDataGridPhieuCap5(data);
        }

    } catch (err) {
        console.error(err)
    }
}
async function GetMaLenhChuaCap() {
    try {
        var loc = $(".select_loc").val()
        var url = `/api/PhieuXuatHangNPL/Get?Action=GetChuaCapXuatHang&para3=${loc}`;
        const response = await fetch(url)
        const data = await response.json();
        createViewDxDataGridPhieuCap4(data)
    } catch (err) {
        console.error(err)
    }
}
async function GetMaLenhDaCap() {
    try {
        const tuNgay = moment($("#tuNgayPhieuYC").val(), "DD/MM/YYYY").format("YYYY-MM-DD")
        const denNgay = moment($("#denNgayPhieuYC").val(), "DD/MM/YYYY").format("YYYY-MM-DD")

        var url = `/api/PhieuXuatHangNPL/Get?Action=GetDaCapXuatHang&para1=${tuNgay}&para2=${denNgay}`;
        const response = await fetch(url)
        const data = await response.json();

        /*batchDataMalenh = data
        renderListItemCode(data)*/

        createViewDxDataGridPhieuCap1(data)

    } catch (err) {
        console.error(err)
    }
}
async function GetChiTietLenhChuaCap() {

    try {
        var url = `/api/PhieuXuatHangNPL/Get?Action=GetChiTietLenhChuaCap&para1=${selectedRowMaLenh}&para2=1`;
        const response = await fetch(url);
        const data = await response.json();

        createViewDxDataGridPhieuCap3(data)
    } catch (err) {
        console.error(err)
    }
}
async function GetChiTietLenhDaCap() {
    try {
        const tuNgay = moment($("#tuNgayPhieuYC").val(), "DD/MM/YYYY").format("YYYY-MM-DD")
        const denNgay = moment($("#denNgayPhieuYC").val(), "DD/MM/YYYY").format("YYYY-MM-DD")
        const loc = $(".select_loc").val();
        var url = `/api/PhieuXuatHangNPL/Get?Action=GetChiTietLenhDaCap&para1=${selectedRowMaLenh}&para2=1&para3=${loc}&para4=${itemCodeJoin}&para5=${tuNgay}&para6=${denNgay}`;

        const response = await fetch(url);
        const data = await response.json();


        var locPhieuCap = $("#locPhieuCap").val()
        if (locPhieuCap == 2) {
            createViewDxDataGridPhieuCap2(data);
        } else if (locPhieuCap == 3) {
            createViewDxDataGridPhieuCap6(data);
        }

    } catch (err) {
        console.error(err)
    }
}
async function GetLenhChuaCapChuaDangKy() {
    try {
        const loc = $(".select_loc").val();
        var url = `/api/PhieuXuatHangNPL/Get?Action=GetLenhChuaCapChuaDangKy&para1=${loc}&para2=0`;

        const response = await fetch(url);
        const data = await response.json();
        createViewDxDataGridPhieuCap7(data);

    } catch (err) {
        console.error(err)
    }
}
async function GetDataChiTietLenhChuaCapChuaDangKy(trMaPhieu, trDH, trMaLenh, loc) {
    let actionPYC = ""
    if (loc == 2) {
        actionPYC = "GetDataPhieuNhapKhoPhieuYCNPL"
        trDH = 1
    } else {
        actionPYC = "GetDataPhieuNhapKho"
    }


    const url = `/api/PhieuXuatHangNPL/Get?action=${actionPYC}&para1=${trMaPhieu}&para2=1&para3=${trMaLenh}&para4=${loc}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();

        createViewDxDataGridPhieuCap8(data);
    } catch (error) {
        console.error(error.message);
    }
}
async function GetLenhKetThuc() {
    const locNgoai = $(".select_loc").val();
    const url = `/api/PhieuXuatHangNPL/Get?action=GetLenhKetThuc&para1=${locNgoai}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();

        createViewDxDataGridPhieuCap9(data);
    } catch (error) {
        console.error(error.message);
    }
}
async function GetChiTietLenhKetThuc(maLenhSX) {
    const locNgoai = $(".select_loc").val();
    const url = `/api/PhieuXuatHangNPL/Get?action=GetChiTietLenhKetThuc&para1=${maLenhSX}&para2=${1}&para3=${locNgoai}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();

        createViewDxDataGridPhieuCap10(data);
    } catch (error) {
        console.error(error.message);
    }
}

async function GetMaLenhGiaoViecChuaHT() {
    try {
        const tuNgay = moment($("#tuNgayGiaoViec").val(), "DD/MM/YYYY").format("YYYY-MM-DD")
        const denNgay = moment($("#denNgayGiaoViec").val(), "DD/MM/YYYY").format("YYYY-MM-DD")
        const module = $('.select_locls').val();
        var url = `/api/PhieuXuatHangNPL/GetV2?Action=GetMaLenhGiaoViecChuaHT&para1=${tuNgay}&para2=${denNgay}&para3=${module}`;
        const response = await fetch(url)
        const data = await response.json();

        createViewDxDataGridPhieuCap11(data)

    } catch (err) {
        console.error(err)
    }
}

async function GetMaLenhGiaoViecHT() {
    try {
        const tuNgay = moment($("#tuNgayGiaoViec").val(), "DD/MM/YYYY").format("YYYY-MM-DD")
        const denNgay = moment($("#denNgayGiaoViec").val(), "DD/MM/YYYY").format("YYYY-MM-DD")
        const module = $('.select_locls').val();

        var url = `/api/PhieuXuatHangNPL/GetV2?Action=GetMaLenhGiaoViecHT&para1=${tuNgay}&para2=${denNgay}&para3=${module}`;
        const response = await fetch(url)
        const data = await response.json();

        createViewDxDataGridPhieuCap13(data)

    } catch (err) {
        console.error(err)
    }
}

async function GetChiTietMaLenhChuaHT(maLenh) {
    try {
        const tuNgay = moment($("#tuNgayGiaoViec").val(), "DD/MM/YYYY").format("YYYY-MM-DD")
        const denNgay = moment($("#denNgayGiaoViec").val(), "DD/MM/YYYY").format("YYYY-MM-DD")
        const module = $('.select_locls').val();

        var url = `/api/PhieuXuatHangNPL/GetV2?Action=GetChiTietMaLenhChuaHT&para1=${maLenh}&para2=${tuNgay}&para3=${denNgay}&para4=${module}`;
        const response = await fetch(url)
        const data = await response.json();

        createViewDxDataGridPhieuCap12(data)

    } catch (err) {
        console.error(err)
    }
}

async function GetChiTietMaLenhHT(maLenh) {
    try {
        const tuNgay = moment($("#tuNgayGiaoViec").val(), "DD/MM/YYYY").format("YYYY-MM-DD")
        const denNgay = moment($("#denNgayGiaoViec").val(), "DD/MM/YYYY").format("YYYY-MM-DD")
        const module = $('.select_locls').val();

        var url = `/api/PhieuXuatHangNPL/GetV2?Action=GetChiTietMaLenhHT&para1=${maLenh}&para2=${tuNgay}&para3=${denNgay}&para4=${module}`;
        const response = await fetch(url)
        const data = await response.json();

        createViewDxDataGridPhieuCap14(data)

    } catch (err) {
        console.error(err)
    }
} GetChiTietMaLenhHT



/// DxDatagrid
function createViewDxDataGridPhieuCap1(data) {
    dxPhieuCap1 = $("#dxPhieuCap1").dxDataGrid({
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
            enabled: true,
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
            { dataField: "TenHang", caption: "Tên Hàng", width: 230, },
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
                    const dateFormat = moment(options.value).format("DD/MM/YYYY")
                    container.text(dateFormat)
                },
                minWidth: 120
            },

        ],
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
            if (dataSource && dataSource.length > 0) {
                const firstDataRow = e.component.getVisibleRows().find(r => r.rowType === 'data');
                if (firstDataRow) {
                    const rowIndex = firstDataRow.rowIndex;
                    selectedRowMaLenh = firstDataRow.data.MaLenhSX;
                    GetChiTietLenhDaCap();

                    // Highlight row đầu tiên
                    setTimeout(() => {
                        const $rowElement = $(e.component.getRowElement(rowIndex));
                        e.component.element().find(".dx-row").removeClass("activeT");
                        $rowElement.addClass("activeT");
                    }, 50);
                }
            }
        },
        onRowClick: function (e) {
            selectedRowMaLenh = e.data.MaLenhSX;
            GetChiTietLenhDaCap();

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
function createViewDxDataGridPhieuCap2(data) {
    dxPhieuCap2 = $("#dxPhieuCap2").dxDataGrid({
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
            enabled: true,
            text: "Đang tải dữ liệu...",
            showIndicator: true,
            showPane: true
        },
        columns: [
            { dataField: "PhieuXH", groupIndex: 0, caption: "Phiếu Xuất hàng", width: 90, },
            { dataField: "POMua", caption: "PO Mua", width: 100, },
            { dataField: "SoLo", caption: "Số Lô", minWidth: 100, },
            { dataField: "MaVT", caption: "Item Code", width: 90, },
            { dataField: "MauVT", caption: "Màu", minWidth: 100, },
            { dataField: "KhoVai", caption: "Width/size", minWidth: 100, },
            { dataField: "TenDVVT", caption: "Đơn vị", minWidth: 100, },
            { dataField: "SoKienHienThi", caption: "Số Roll", minWidth: 100, },
            { dataField: "SLNhap", caption: "Thực Xuất", minWidth: 100, },
            { dataField: "NgayXuatHang", caption: "Ngày Xuất", minWidth: 100, },
        ],
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
                    column: "SLNhap", summaryType: "sum", showInGroupFooter: true, alignByColumn: true,
                    customizeText: function (e) {
                        if (!e.value) return '';
                        return formatNumber(e.value);

                    }
                },
            ]
        }
    }).dxDataGrid('instance');
}
function createViewDxDataGridPhieuCap3(data) {
    dxPhieuCap3 = $("#dxPhieuCap3").dxDataGrid({
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
            enabled: true,
            text: "Đang tải dữ liệu...",
            showIndicator: true,
            showPane: true
        },
        columns: [
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
        ],
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
function createViewDxDataGridPhieuCap4(data) {
    dxPhieuCap4 = $("#dxPhieuCap4").dxDataGrid({
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
            enabled: true,
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
            { dataField: "MaLenh", caption: "Mã Lệnh", width: 90, },
            { dataField: "TenHang", caption: "Tên Hàng", width: 230, },
        ],
        onContentReady: function (e) {
            const dataSource = e.component.option("dataSource");
            if (dataSource && dataSource.length > 0) {
                const firstDataRow = e.component.getVisibleRows().find(r => r.rowType === 'data');
                if (firstDataRow) {
                    const rowIndex = firstDataRow.rowIndex;
                    selectedRowMaLenh = firstDataRow.data.MaLenhSanXuat;
                    GetChiTietLenhChuaCap();
                    // Highlight row đầu tiên
                    setTimeout(() => {
                        const $rowElement = $(e.component.getRowElement(rowIndex));
                        e.component.element().find(".dx-row").removeClass("activeT");
                        $rowElement.addClass("activeT");
                    }, 50);
                }
            }
        },
        onRowClick: function (e) {
            selectedRowMaLenh = e.data.MaLenhSanXuat;
            GetChiTietLenhChuaCap();

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
function createViewDxDataGridPhieuCap5(data) {
    dxPhieuCap5 = $("#dxPhieuCap5").dxDataGrid({
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
            enabled: true,
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
            { dataField: "TenHang", caption: "Tên Hàng", width: 230, },
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
                    const dateFormat = moment(options.value).format("DD/MM/YYYY")
                    container.text(dateFormat)
                },
                minWidth: 120
            },

        ],
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
            if (dataSource && dataSource.length > 0) {
                const firstDataRow = e.component.getVisibleRows().find(r => r.rowType === 'data');
                if (firstDataRow) {
                    const rowIndex = firstDataRow.rowIndex;
                    selectedRowMaLenh = firstDataRow.data.MaLenhSX;
                    GetChiTietLenhDaCap();

                    // Highlight row đầu tiên
                    setTimeout(() => {
                        const $rowElement = $(e.component.getRowElement(rowIndex));
                        e.component.element().find(".dx-row").removeClass("activeT");
                        $rowElement.addClass("activeT");
                    }, 50);
                }
            }
        },
        onRowClick: function (e) {
            selectedRowMaLenh = e.data.MaLenhSX;
            GetChiTietLenhDaCap();

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
function createViewDxDataGridPhieuCap6(data) {
    dxPhieuCap6 = $("#dxPhieuCap6").dxDataGrid({
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
            enabled: true,
            text: "Đang tải dữ liệu...",
            showIndicator: true,
            showPane: true
        },
        columns: [
            { dataField: "PhieuXH", groupIndex: 0, caption: "Phiếu Xuất hàng", width: 90, },
            { dataField: "POMua", caption: "PO Mua", width: 100, },
            { dataField: "SoLo", caption: "Số Lô", minWidth: 100, },
            { dataField: "MaVT", caption: "Item Code", width: 90, },
            { dataField: "MauVT", caption: "Màu", minWidth: 100, },
            { dataField: "KhoVai", caption: "Width/size", minWidth: 100, },
            { dataField: "TenDVVT", caption: "Đơn vị", minWidth: 100, },
            { dataField: "SoKienHienThi", caption: "Số Roll", minWidth: 100, },
            { dataField: "SLNhap", caption: "Thực Xuất", minWidth: 100, },
            { dataField: "NgayXuatHang", caption: "Ngày Xuất", minWidth: 100, },
        ],
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
                    column: "SLNhap", summaryType: "sum", showInGroupFooter: true, alignByColumn: true,
                    customizeText: function (e) {
                        if (!e.value) return '';
                        return formatNumber(e.value);

                    }
                },
            ]
        }
    }).dxDataGrid('instance');
}
function createViewDxDataGridPhieuCap7(data) {
    dxPhieuCap7 = $("#dxPhieuCap7").dxDataGrid({
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
            enabled: true,
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
            { dataField: "MaDH", caption: "Đơn Hàng", minWidth: 90, },
            { dataField: "MaLenh", caption: "Mã Lệnh", minWidth: 90, },
            { dataField: "MaHang", caption: "Mã Hàng", minWidth: 130, },
            { dataField: "KhachHang", caption: "Khách Hàng", minWidth: 90, },
            { dataField: "NgayDKVC", caption: "Ngày Vào Chuyền", minWidth: 90, },
            { dataField: "NgayCat", caption: "KH Cắt", minWidth: 90, },
            { dataField: "KHLapTrinh", caption: "KH Lập Trình", minWidth: 90, },
            { dataField: "KHMay", caption: "KH May", minWidth: 100, },
            { dataField: "ThoatChuyen", caption: "KH Thoát Chuyền", minWidth: 100, },
            { dataField: "SoLuong", caption: "Số Lượng", minWidth: 70, },
            { dataField: "GhiChu", caption: "Ghi Chú", minWidth: 100, }
        ],
        onContentReady: function (e) {
            const dataSource = e.component.option("dataSource");
            if (dataSource && dataSource.length > 0) {
                const firstDataRow = e.component.getVisibleRows().find(r => r.rowType === 'data');
                if (firstDataRow) {
                    const rowIndex = firstDataRow.rowIndex;
                    selectedRowMaLenh = firstDataRow.data.MaLenhSanXuat;
                    var loc = $(".select_loc").val();
                    const maDH = firstDataRow.data.MaDH
                    const maGop = firstDataRow.data.MaGop
                    const maLenh = firstDataRow.data.MaLenhSanXuat
                    GetDataChiTietLenhChuaCapChuaDangKy(maDH, maGop, maLenh, loc)
                    // Highlight row đầu tiên
                    setTimeout(() => {
                        const $rowElement = $(e.component.getRowElement(rowIndex));
                        e.component.element().find(".dx-row").removeClass("activeT");
                        $rowElement.addClass("activeT");
                    }, 50);
                }
            }
        },
        onRowClick: function (e) {
            selectedRowMaLenh = e.data.MaLenhSanXuat;
            var loc = $(".select_loc").val();
            const maDH = e.data.MaDH
            const maGop = e.data.MaGop
            const maLenh = e.data.MaLenhSanXuat
            GetDataChiTietLenhChuaCapChuaDangKy(maDH, maGop, maLenh, loc)

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
function createViewDxDataGridPhieuCap8(data) {
    dxPhieuCap8 = $("#dxPhieuCap8").dxDataGrid({
        dataSource: data,
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
        paging: { enabled: false },
        renderAsync: false,
        grouping: { autoExpandAll: true },
        groupPanel: { visible: false },
        loadPanel: {
            enabled: true,
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
            {
                dataField: "ChiTiet",
                caption: "Vật tư",
                groupIndex: 0,
                width: 50,
            },
            { dataField: "TenNhom", caption: "Loại vật tư" },
            { dataField: "MauVT", caption: "Màu" },
            { dataField: "KhoVai", caption: "Width/size" },
            { dataField: "TenDVVT", caption: "Đơn vị" },
        ],
        onContentReady: function (e) {
            const dataSource = e.component.option("dataSource");
            if (dataSource && dataSource.length > 0) {
                const firstDataRow = e.component.getVisibleRows().find(r => r.rowType === 'data');
                if (firstDataRow) {
                    const rowIndex = firstDataRow.rowIndex;
                    selectedRowMaLenh = firstDataRow.data.MaLenhSanXuat;
                    GetChiTietLenhChuaCap();
                    setTimeout(() => {
                        const $rowElement = $(e.component.getRowElement(rowIndex));
                        e.component.element().find(".dx-row").removeClass("activeT");
                        $rowElement.addClass("activeT");
                    }, 50);
                }
            }
        },
        onRowClick: function (e) {
            selectedRowMaLenh = e.data.MaLenhSanXuat;
            GetChiTietLenhChuaCap();
            $(e.rowElement).closest(".dx-datagrid-rowsview").find(".dx-row").removeClass("activeT");
            $(e.rowElement).addClass("activeT");
        },
        onCellPrepared: function (e) {
            if (e.rowType === "header") {
                $(e.cellElement).addClass("col-header text-center");
                $(e.cellElement).css("vertical-align", "middle");
            }
            if (e.rowType === "data") {
                $(e.cellElement).addClass("text-center");
                $(e.cellElement).css("vertical-align", "middle");
            }
        },
    }).dxDataGrid('instance');
}
function createViewDxDataGridPhieuCap9(data) {
    dxPhieuCap9 = $("#dxPhieuCap9").dxDataGrid({
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
            enabled: true,
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

            { dataField: "MaLenh", caption: "Mã Lệnh", width: 90, },
            { dataField: "MaHang", caption: "Tên Hàng", width: 230, },
            {
                dataField: "SLXuatHang",
                caption: "SL Xuất",
                minWidth: 80,
                cellTemplate: function (container, options) {
                    container.text(formatNumber(options.value))
                }
            },
            {
                dataField: "NgayXuatHang",
                caption: "Ngày Xuất",
                minWidth: 120
            },

        ],
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
            if (dataSource && dataSource.length > 0) {
                const firstDataRow = e.component.getVisibleRows().find(r => r.rowType === 'data');
                if (firstDataRow) {
                    const rowIndex = firstDataRow.rowIndex;
                    const selectedRowMaLenh = firstDataRow.data.MaLenhSX;
                    GetChiTietLenhKetThuc(selectedRowMaLenh)

                    // Highlight row đầu tiên
                    setTimeout(() => {
                        const $rowElement = $(e.component.getRowElement(rowIndex));
                        e.component.element().find(".dx-row").removeClass("activeT");
                        $rowElement.addClass("activeT");
                    }, 50);
                }
            }
        },
        onRowClick: function (e) {
            const selectedRowMaLenh = e.data.MaLenhSX;
            GetChiTietLenhKetThuc(selectedRowMaLenh)

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
function createViewDxDataGridPhieuCap10(data) {
    dxPhieuCap10 = $("#dxPhieuCap10").dxDataGrid({
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
            enabled: true,
            text: "Đang tải dữ liệu...",
            showIndicator: true,
            showPane: true
        },
        columns: [
            {
                dataField: "PhieuXH",
                groupIndex: 0,
                caption: "Phiếu Xuất hàng",
                width: 90,
                calculateGroupValue: function (data) {
                    return data.SortXH;
                },
                groupCellTemplate: function (container, options) {
                    const items = options.data?.items || options.data?.collapsedItems;
                    const PhieuXH = items?.[0]?.PhieuXH ?? "";

                    container.text("Phiếu Xuất hàng: " + PhieuXH);
                }
            },
            { dataField: "POMua", caption: "PO Mua", width: 100, },
            { dataField: "SoLo", caption: "Số Lô", minWidth: 100, },
            { dataField: "MaVT", caption: "Item Code", width: 90, },
            { dataField: "MauVT", caption: "Màu", minWidth: 100, },
            { dataField: "KhoVai", caption: "Width/size", minWidth: 100, },
            { dataField: "TenDVVT", caption: "Đơn vị", minWidth: 100, },
            { dataField: "SoKienHienThi", caption: "Số Roll", minWidth: 100, },
            { dataField: "SLNhap", caption: "Thực Xuất", minWidth: 100, },
            { dataField: "NgayXuatHang", caption: "Ngày Xuất", minWidth: 100, },
        ],
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
                    column: "SLNhap", summaryType: "sum", showInGroupFooter: true, alignByColumn: true,
                    customizeText: function (e) {
                        if (!e.value) return '';
                        return formatNumber(e.value);

                    }
                },
            ]
        }
    }).dxDataGrid('instance');
}

// ------------------- Giao Việc ----------------
// Event

// Function
function initDatePicker() {

    const picker1 = new tempusDominus.TempusDominus(document.getElementById('datetimepicker5'), {
        display: {
            components: {
                calendar: true, date: true, month: true, year: true,
                clock: false, hours: false, minutes: false, seconds: false
            }
        },
        localization: { format: 'dd/MM/yyyy' },
        defaultDate: handleCaculateDefaultDate(1).start
    });

    const picker2 = new tempusDominus.TempusDominus(document.getElementById('datetimepicker6'), {
        display: {
            components: {
                calendar: true, date: true, month: true, year: true,
                clock: false, hours: false, minutes: false, seconds: false
            }
        },
        localization: { format: 'dd/MM/yyyy' },
        defaultDate: handleCaculateDefaultDate(1).end
    });


    $("#tuNgayGiaoViec").trigger("click");
    $("#denNgayGiaoViec").trigger("click");

    picker1.hide();
    picker2.hide();
}
function handleCaculateDefaultDate(options) {
    switch (options) {
        // Đầu tuần -> cuối tuần
        case 1: {
            var startOfWeek = moment().isoWeekday(1).startOf('day').toDate();
            var endOfWeek = moment().isoWeekday(7).endOf('day').toDate();

            return { start: startOfWeek, end: endOfWeek };
        }

        // Đầu tháng -> cuối tháng
        case 2: {
            const now = new Date();

            return {
                start: new Date(now.getFullYear(), now.getMonth(), 1),
                end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
            };
        }

        default:
            return new Date();
    }
}
function handleChangeNgayGV() {
    const locGV = $('#locTrangThaiGiaoViec').val();
    if (locGV == 1) {
        GetMaLenhGiaoViecChuaHT();
    }
    else if (locGV == 2) {
        GetMaLenhGiaoViecHT();
    }
}
// DxDataGrix
function createViewDxDataGridPhieuCap11(data) {
    const loc = $('.select_locls').val()
    const isLocOption2 = loc == 2 || loc == 3

    dxPhieuCap11 = $("#dxPhieuCap11").dxDataGrid({
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
            enabled: true,
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
            { dataField: "NguoiGiaoViec", caption: "Người Giao Việc", width: 120, },
            { dataField: "MaLenh", caption: isLocOption2 ? "Mã Phiếu" : "Mã Lệnh", minWidth: 120, },
            { dataField: "NgayGiaoViec", caption: "Ngày Giao Việc", width: 120, },
            { dataField: "NgayXuatHang", caption: "Ngày YC Xuất", minWidth: 100, },
        ],
        onContentReady: function (e) {
            const dataSource = e.component.option("dataSource");
            if (dataSource && dataSource.length > 0) {
                const firstDataRow = e.component.getVisibleRows().find(r => r.rowType === 'data');
                if (firstDataRow) {
                    const rowIndex = firstDataRow.rowIndex;
                    const selectedRowMaLenh = firstDataRow.data.MaLenhSX;
                    console.log(`selectedRowMaLenh: `, selectedRowMaLenh)
                    GetChiTietMaLenhChuaHT(selectedRowMaLenh)

                    // Highlight row đầu tiên
                    setTimeout(() => {
                        const $rowElement = $(e.component.getRowElement(rowIndex));
                        e.component.element().find(".dx-row").removeClass("activeT");
                        $rowElement.addClass("activeT");
                    }, 50);
                }
            }
        },
        onRowClick: function (e) {
            const selectedRowMaLenh = e.data.MaLenhSX;
            console.log(`selectedRowMaLenh: `, selectedRowMaLenh)

            GetChiTietMaLenhChuaHT(selectedRowMaLenh)

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
function createViewDxDataGridPhieuCap12(data) {
    dxPhieuCap12 = $("#dxPhieuCap12").dxDataGrid({
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
            enabled: true,
            text: "Đang tải dữ liệu...",
            showIndicator: true,
            showPane: true
        },
        columns: [
            {
                dataField: "PhieuGiaoViec", caption: "Phiếu Giao Việc", groupIndex: 0,
                visible: false,
                groupCellTemplate: function (container, options) {
                    const item = options.data.items && options.data.items.length > 0
                        ? options.data.items[0]
                        : options.data.collapsedItems && options.data.collapsedItems[0];
                    container.text(`Phiếu Giao Việc: ${item.Display}`);
                }
            },
            { dataField: "NguoiGiaoViec", caption: "Người Giao Việc", },
            { dataField: "NgayXuatHang", caption: "Ngày Xuất Hàng", },
            { dataField: "MaVT", caption: "Item Code", width: 90, },
            {
                dataField: "SLCanXuat", caption: "SL Cần Xuất", width: 100,
                cellTemplate: function (container, options) {
                    container.text(formatNumber(options.value))
                }
            },
            { dataField: "MauVT", caption: "Màu", minWidth: 100, },
            { dataField: "KhoVai", caption: "Width/size", minWidth: 100, },
            { dataField: "TenDVVT", caption: "Đơn vị", minWidth: 100, },
            { dataField: "MaONPL", caption: "Vị Trí Ô", minWidth: 100, },
        ],
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
                    column: "SLNhap", summaryType: "sum", showInGroupFooter: true, alignByColumn: true,
                    customizeText: function (e) {
                        if (!e.value) return '';
                        return formatNumber(e.value);

                    }
                },
            ]
        }
    }).dxDataGrid('instance');
}
function createViewDxDataGridPhieuCap13(data) {
    dxPhieuCap13 = $("#dxPhieuCap13").dxDataGrid({
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
            enabled: true,
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
            { dataField: "NguoiGiaoViec", caption: "Người Giao Việc", width: 120, },
            { dataField: "MaLenh", caption: "Mã Lệnh", minWidth: 100, },
            { dataField: "NgayGiaoViec", caption: "Ngày Giao Việc", width: 100, },
            { dataField: "NgayXuatHang", caption: "Ngày YC Xuất", minWidth: 100, },
        ],
        onContentReady: function (e) {
            const dataSource = e.component.option("dataSource");
            if (dataSource && dataSource.length > 0) {
                const firstDataRow = e.component.getVisibleRows().find(r => r.rowType === 'data');
                if (firstDataRow) {
                    const rowIndex = firstDataRow.rowIndex;
                    const selectedRowMaLenh = firstDataRow.data.MaLenhSX;
                    GetChiTietMaLenhHT(selectedRowMaLenh)

                    // Highlight row đầu tiên
                    setTimeout(() => {
                        const $rowElement = $(e.component.getRowElement(rowIndex));
                        e.component.element().find(".dx-row").removeClass("activeT");
                        $rowElement.addClass("activeT");
                    }, 50);
                }
            }
        },
        onRowClick: function (e) {
            const selectedRowMaLenh = e.data.MaLenhSX;
            GetChiTietMaLenhHT(selectedRowMaLenh)

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
function createViewDxDataGridPhieuCap14(data) {
    dxPhieuCap14 = $("#dxPhieuCap14").dxDataGrid({
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
            enabled: true,
            text: "Đang tải dữ liệu...",
            showIndicator: true,
            showPane: true
        },
        columns: [
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
            { dataField: "NguoiGiaoViec", caption: "Người Giao Việc", width: 120, },
            { dataField: "POMua", caption: "PO Mua", width: 100, },
            { dataField: "SoLo", caption: "Số Lô", minWidth: 100, },
            { dataField: "MauVT", caption: "Màu", minWidth: 100, visible: false },
            { dataField: "KhoVai", caption: "Width/size", minWidth: 100, visible: false },
            { dataField: "TenDVVT", caption: "Đơn vị", minWidth: 100, visible: false },
            { dataField: "SoKienHienThi", caption: "Số roll/ Kiện", minWidth: 100, },
            { dataField: "SLXuat", caption: "Thực Xuất", minWidth: 100, },
            { dataField: "NgayXuatHang", caption: "Ngày Xuất", minWidth: 100, },
        ],
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
                    column: "SLXuat", summaryType: "sum", showInGroupFooter: true, alignByColumn: true,
                    customizeText: function (e) {
                        if (!e.value) return '';
                        return formatNumber(e.value);

                    }
                },
            ]
        }
    }).dxDataGrid('instance');
}