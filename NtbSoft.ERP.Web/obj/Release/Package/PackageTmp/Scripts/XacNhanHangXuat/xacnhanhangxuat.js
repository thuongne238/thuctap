/// VARIABLE
var userNameSave = localStorage.getItem("username1")
let dxDataGridHangXuat;
let dxDataPhieuDKVT;
let checkIndex = 0;
let checkIndexNguoiGhiNhan = 0;
let lstDSPhieuDKVT = [];
var btnTypeKyTen;
// ============= SIGNATURE CANVAS CODE =============
let canvas, ctx;
let isDrawing = false;
let penColor = '#000000';
let penSize = 2;
let signatureHistory = [];
let currentStroke = [];
var imageSign, idNguoiKy, scrollPosition;
/// API
const API = {
    async Get(endpoint = "", method = "Get", action, para = {}, textSuccess = '') {
        const paraConvert = Object.entries(para || {})
            .map(([key, value]) => `${key}=${value}`)
            .join("&");

        const url = `/api/${endpoint}/${method}?action=${action}${paraConvert ? '&' + paraConvert : ''}`;

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

    async Post(endpoint = "", method = "Post", action, arrSave, textSuccess = "Lưu thành công!") {
        const url = `/api/${endpoint}/${method}?action=${action}`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(arrSave),
            });

            if (!response.ok) throw new Error(`Response status: ${response.status}`);

            const data = await response.json();
            if (data == "True") showToast('success', textSuccess, 1500);
        } catch (error) {
            console.error(error);
        }
    }
};


async function GetPYC() {
    const locXH_Form = $('#loc').val();
    const data = await API.Get("DangKyVatTu", "Get", "GetPYC", { para1: isNPL, para2: locXH_Form })
    let html = ``;
    data.map(x => {
        html += `<option value="${x.MaLenhSX}">${x.MaLenh}</option> `
    })
    $("#malenh").html(html)

    if (phieuYCLS) {
        $('#malenh').val(phieuYCLS).trigger('change.select2');
    } else {
        GetPhieuDKVT();
    }
}


async function GetPhieuDKVT() {
    const locXH = $('#loc').val();
    var maLenh = $("#malenh option:selected").val()
    const data = await API.Get("DangKyVatTu", "Get", "GetPhieuDKVT", { para1: maLenh, para2: isNPL, para3: locXH, para4: isFromXH ? 1 : 2 })
    if (data.length == 0) {
        $("#phieuxuathang").empty()
    }
    let html = `<option value='all'>Tất Cả</option>`;
    data.map(x => {
        html += ` <option  value="${x.PhieuDK}">${x.Display}</option>`
    })
    $("#phieuxuathang").html(html)
    GetViewPDKVT()
}

async function GetViewPDKVT() {
    var para1 = $("#phieuxuathang").val()
    var maLenh = $("#malenh").val()
    const paraFromXH = !isFromXH ? 2 : 1
    const locXH = $('#loc').val();
    var action = 'GetViewPDKVTCT'
    const isPYC_BNDH = [2, 3].includes(+locXH)
    if (isPYC_BNDH) {
        action = 'GetViewPDKVTCTCapXN';
    }
    const data = await API.Get("DangKyVatTu", "Get", action, { para1: para1, para2: isNPL, para3: maLenh, para4: paraFromXH, para5: locXH })
    createViewDxDataGridHangXuat(data)
}

async function ApiSaveKiTen(arrSaveKT, action) {
    await API.Post("DangKyVatTu", "PostXNHX", action, arrSaveKT, "Lưu chữ ký thành công")
    await GetViewPDKVT()
}

async function UpdateKT(image, typeKyTen) {
    var dataUser = userName
    var ArrPhieuXHKT = []
    const pxhData = $("#phieuxuathang").val()
    const maLenh = $("#malenh").val()
    if (pxhData == "" || pxhData == null) {
        showToast("warning", "Vui lòng chọn phiếu đăng ký")
        return
    }

    if (typeKyTen == 3) {
        const dataSource = dxDataGridHangXuat.option("dataSource");
        const dataFilterKey = dataSource.filter(item => item.PhieuDK == keyKyTenSX_GC_MM)
        const arrSaveKyTenNN = [];

        dataFilterKey.map(item => {
            const phieuXuatHang = {
                PhieuXH: item.PhieuDK,
                SortXH: 1,
                BarCode: item.BarCode,
                Dot: 1,
                IsNPL: isNPL,// Cần thay đổi thành 0 khi sang phụ liệu
                KyTen: image,
                PhieuYC: "",
                NgayXH: "",
                UserXH: dataUser
            };
            arrSaveKyTenNN.push(phieuXuatHang)
        });
        ApiSaveKiTenNN(arrSaveKyTenNN)

    } else if (typeKyTen == 4) {
        const dataSource = dxDataGridHangXuat.option("dataSource");
        const arrSaveKyTenNN = [];

        dataSource.map(item => {
            const phieuXuatHang = {
                PhieuXH: item.PhieuDK,
                SortXH: 1,
                BarCode: item.BarCode,
                Dot: 1,
                IsNPL: isNPL,// Cần thay đổi thành 0 khi sang phụ liệu
                KyTen: image,
                PhieuYC: "",
                NgayXH: "",
                UserXH: dataUser
            };
            arrSaveKyTenNN.push(phieuXuatHang)
        });
        ApiSaveKiTenNN(arrSaveKyTenNN)
    } else {
        const phieuXuatHang = {
            MaLenh: maLenh,
            PhieuXH: pxhData,
            KyTen: typeKyTen == 1 ? image : null,
            NguoiKT: typeKyTen == 1 ? dataUser : null,
            KyTenNguoiGiao: typeKyTen == 1 ? null : image,
            NguoiGiaoKT: typeKyTen == 1 ? null : dataUser,
            isNPL: isNPL
        };

        ArrPhieuXHKT.push(phieuXuatHang)
        await ApiSaveKiTen(ArrPhieuXHKT, "PostXNHX")
    }


}

async function GetDSPhieuDKVT() {
    const paraFromXH = !isFromXH ? 2 : 1
    const loc = $('#loc').val();
    const data = await API.Get("DangKyVatTu", "Get", "GetViewPDKVT", { para1: 'all', para2: isNPL, para3: loc, para4: paraFromXH })

    lstDSPhieuDKVT = data
    createViewDxGridDanhSachPhieuDKVT(data)
}
/// HELPER FUNCTIONS
function updateGrid(grid, dataSource) {
    checkIndex = 0;
    checkIndexNguoiGhiNhan = 0;
    grid.beginUpdate();
    grid.option({ dataSource: dataSource });
    grid.endUpdate();
}

function setPenColor(color) {
    penColor = color;
    $('#penColor').val(color);
}

function setPenSize(size) {
    penSize = size;
    $('.pen-size-btn').removeClass('active');
    $(`.pen-size-btn[data-size="${size}"]`).addClass('active');
}

function saveSignature() {
    if (signatureHistory.length === 0) {
        showToast("warning", 'Vui lòng ký tên trước khi lưu!');
        return;
    }
    $('#signatureModal').modal('hide');
    // Chuyển canvas thành hình ảnh
    const signatureImage = canvas.toDataURL('image/png');
    UpdateKT(signatureImage, btnTypeKyTen)
}

function CallModal() {
    $('#signatureModal').modal('show');
}


$(document).ready(function () {
    checkIframeXH();
    canvas = document.getElementById('signatureCanvas');
    ctx = canvas.getContext('2d');

    // Khởi tạo kích thước canvas
    initCanvas();

    // Cấu hình canvas
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Sự kiện chuột
    $(canvas).on('mousedown', startDrawing);
    $(canvas).on('mousemove', draw);
    $(canvas).on('mouseup', stopDrawing);
    $(canvas).on('mouseleave', stopDrawing);

    // Sự kiện chạm (mobile)
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', stopDrawing, { passive: false });

    // Cập nhật màu từ color picker
    $('#penColor').on('change', function () {
        penColor = $(this).val();
    });

    // Reset canvas khi mở modal
    $('#signatureModal').on('shown.bs.modal', function () {
        initCanvas();
        clearSignature();
    });

    // Resize canvas khi thay đổi kích thước màn hình
    $(window).on('resize', function () {
        if ($('#signatureModal').hasClass('show')) {
            initCanvas();
        }
    });
});

function initCanvas() {
    const container = canvas.parentElement;
    const containerWidth = container.offsetWidth;

    // Xác định kích thước canvas dựa trên màn hình
    if (window.innerWidth < 768) {
        canvas.width = Math.min(containerWidth - 40, 500);
        canvas.height = 250;
    } else {
        canvas.width = Math.min(containerWidth - 40, 700);
        canvas.height = 300;
    }

    // Cấu hình lại context sau khi thay đổi kích thước
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
    };
}

function startDrawing(e) {
    isDrawing = true;
    const pos = getMousePos(e);
    currentStroke = [{ x: pos.x, y: pos.y, color: penColor, size: penSize }];

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
    if (!isDrawing) return;

    const pos = getMousePos(e);
    currentStroke.push({ x: pos.x, y: pos.y, color: penColor, size: penSize });

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
}

function stopDrawing() {
    if (isDrawing && currentStroke.length > 0) {
        signatureHistory.push([...currentStroke]);
        currentStroke = [];
    }
    isDrawing = false;
}

function handleTouchStart(e) {
    e.preventDefault();
    isDrawing = true;
    const pos = getTouchPos(e);
    currentStroke = [{ x: pos.x, y: pos.y, color: penColor, size: penSize }];

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isDrawing) return;

    const pos = getTouchPos(e);
    currentStroke.push({ x: pos.x, y: pos.y, color: penColor, size: penSize });

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
}

function clearSignature() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    signatureHistory = [];
    currentStroke = [];
}

function undoSignature() {
    if (signatureHistory.length === 0) return;

    signatureHistory.pop();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ lại tất cả nét còn lại
    signatureHistory.forEach(stroke => {
        if (stroke.length === 0) return;

        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);

        stroke.forEach((point, index) => {
            if (index === 0) return;
            ctx.strokeStyle = point.color;
            ctx.lineWidth = point.size;
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
        });
    });
}


/// EVENT
$(document).ready(function () {
    $(".select_2").select2();
    createViewDxDataGridHangXuat();
    createViewDxGridDanhSachPhieuDKVT();
})

$(function () {
    $("#home").on("click", () => window.location.href = '/Home/Dashboard');

    $("#btnEditAllPhieu").on("click", async function () {
        /// btnTypeKyTen = 4 (Phiếu YC - Ngoài ĐH)
        btnTypeKyTen = isFromXH ? 4 : 1;

        if (isFromXH) {
            CallModal()
        } 

    })


    $("#modalTimNhanh").on("shown.bs.modal", function () {
        setTimeout(function () {
            $("#inputTimKiem").focus();
        }, 100);
    });

    $("#modalTimNhanh").on("hide.bs.modal", function () {
        $("#inputTimKiem").val("").trigger("input")
    });

    $("#btnTimNhanh").on("click", function () {
        GetDSPhieuDKVT();
        $("#modalTimNhanh").modal('show')
    })

    // Nút tìm kiếm
    let searchTimeout;
    $("#inputTimKiem").on("input", function () {
        clearTimeout(searchTimeout);
        const search = $(this).val().trim().toLowerCase();

        searchTimeout = setTimeout(() => {
            if (search === "") {
                // Nếu rỗng thì hiện tất cả
                createViewDxGridDanhSachPhieuDKVT(lstDSPhieuDKVT)
            } else {
                // Lọc dữ liệu
                const dataFiltered = lstDSPhieuDKVT.filter(item =>
                    String(item.MaVT).trim().toLowerCase().includes(search) ||
                    String(item.MauVT).trim().toLowerCase().includes(search)
                );
                createViewDxGridDanhSachPhieuDKVT(dataFiltered)
            }
        }, 100); // Delay 300ms sau khi ngừng gõ
    });

})
const mergelements = {};
function findOriginEntry(map, rowIndex, field) {
    const entry = map[rowIndex]?.[field];
    if (!entry) return null;
    // Nếu entry này cũng là reference tới entry khác thì đệ quy lên
    if (rowIndex === 0) return entry;
    const prev = map[rowIndex - 1]?.[field];
    if (prev?.key === entry?.key && prev?.element !== entry?.element) {
        return findOriginEntry(map, rowIndex - 1, field);
    }
    return entry;
}
/// DxDataGrid
function createViewDxDataGridHangXuat(data) {
    const loc = $('#loc').val();
    const isPYC_BNDH = [2, 3].includes(+loc)
    dxDataGridHangXuat = $("#dxDataGridHangXuat").dxDataGrid({
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
        groupPanel: { visible: false },
        loadPanel: {
            enabled: true,
            text: "Đang tải dữ liệu...",
            showIndicator: true,
            showPane: true
        },
        columns: [
            {
                dataField: 'PhieuDK',
                groupIndex: 0,
                groupCellTemplate: function (container, info) {
                    const $btnKT =
                        $(`${isSX_GC_MM_1 ? '<button  class="btn btn-primary btn-sm" style= "pointer-events: auto;background-color: #ffb74d; border:none; color:white;font-size: 11px !important" id="btnKyTenXHSXGMM" fdprocessedid="mwr7p"><i class= "fa-solid fa-signature mr-1 mr-md-2 text-white"></i><span class="btn-text-full d-sm-inline">KT</span></button >' : ''}`)
                            .on('click', function (e) {
                                e.stopPropagation()
                                /// btnTypeKyTen = 3 (SX - GC - MM)
                                keyKyTenSX_GC_MM = info.value
                                btnTypeKyTen = 3
                                CallModal()
                            })
                    container.html(`
                        <span style="font-weight: bold; color: #333;">
                                    ${isSX_GC_MM_1 ? 'Phiếu ĐK' : 'Phiếu XH'}: <span style="color: #1a73e8;">${info.value}</span>                                 
                        </span>
                    `).append($btnKT)
                }

            },
            {
                dataField: "MaVT",
                caption: "ItemCode",
                minWidth: 100,
                groupIndex: 0,
                calculateCellValue: function (rowData) {
                    if (!rowData) return "";
                    return `${rowData.MaVT} ${isPYC_BNDH ? "" : `- SL yêu cầu: ${rowData.SLDK ?? ""}`}  `;
                }
            },
            {
                dataField: "ChiTiet",
                caption: "Mô tả",
                width: 500,
            },
            {
                dataField: "MauVT",
                caption: "Màu",
                minWidth: 80,
            },
            {
                dataField: "KhoVai",
                caption: "Width/Size",
                minWidth: 80,
            },
            {
                dataField: "TenDVVT",
                caption: "Đơn Vị",
                minWidth: 80,
            },
            {
                dataField: "SoKienHienThi",
                caption: `${isNPL == 1 ? "Số kiện / roll" : "Vật tư"}`,
                minWidth: 80,
            },
            {
                dataField: "SLDK",
                caption: "SL Yêu Cầu",
                minWidth: 80,
                visible: false,
                cellTemplate: function (container, options) {
                    mergeCell(options, container, mergeState.SLDK, (ctn, opt) => {
                        $("<div>")
                            .text(
                                Math.trunc(Number(opt.data.SLDK || 0) * 10000) / 10000
                            )
                            .appendTo(ctn);
                    });
                }
            },
            {
                dataField: "SLNhap",
                caption: "Thực xuất",
                width: 100,
                cellTemplate: function (container, options) {
                    const value = formatNumber(options.value)
                    $("<div>")
                        .text(value)
                        .addClass("thucnhap")
                        .toggleClass("text-danger", options.data.isCheckVuot === true)
                        .appendTo(container);
                }
            },
            {
                dataField: "NguoiGiaoKT",
                caption: "Người Giao Ký Tên",
                minWidth: 80,
                visible: false
            },
            {
                dataField: "KyTenNguoiGiao",
                caption: "Chữ Ký Người Giao",
                minWidth: 120,
                visible: false,
                cellTemplate: function (container, options) {
                    if (!options.data?.KyTenNguoiGiao) return;
                    $("<img>")
                        .attr("src", `/Images/XuatHangNPL/XacNhanKT/${options.data.KyTenNguoiGiao}?${Date.now()}`)
                        .css({ width: "70px", height: "35px" })
                        .appendTo(container);
                }
            },
            {
                dataField: "NguoiKT",
                caption: "Người Nhận Ký Tên",
                minWidth: 80
            },
            {
                dataField: "KyTenXNHX",
                caption: "Chữ Ký Người Nhận",
                minWidth: 120,
                cellTemplate: function (container, options) {
                    if (!options.data?.KyTenXNHX) return;
                    $("<img>")
                        .attr("src", `/Images/XuatHangNPL/KyTen/${options.data.KyTenXNHX}?${Date.now()}`)
                        .css({ width: "70px", height: "35px" })
                        .appendTo(container);
                }
            },

        ],
        summary: {
            totalItems: [
                {
                    name: "tongKho",
                    summaryType: "custom",
                    showInColumn: "ChiTiet",
                },
                {
                    column: "SLDK",
                    summaryType: "max",
                    customizeText(e) {
                        if (e.value == null) return "";
                        return Math.trunc(Number(e.value) * 10000) / 10000;
                    }
                },
                {
                    column: "SLNhap",
                    summaryType: "sum",
                    customizeText(e) {
                        if (e.value == null) return "";
                        return formatNumber(e.value)
                    }
                }
            ],

            // ✅ SUMMARY THEO GROUP
            //groupItems: [
            //    {
            //        column: "SLDK",
            //        summaryType: "max",
            //        showInGroupFooter: true,
            //        alignByColumn: true,
            //        customizeText(e) {
            //            return (
            //                Math.trunc(Number(e.value || 0) * 10000) / 10000
            //            );
            //        }
            //    },
            //    {
            //        column: "SLNhap",
            //        summaryType: "sum",
            //        showInGroupFooter: true,
            //        alignByColumn: true,
            //        customizeText(e) {
            //            return formatNumber(e.value)
            //        }
            //    }
            //],

            calculateCustomSummary: function (options) {
                if (options.name === "tongKho") {
                    if (options.summaryProcess === "start") {
                        options.totalValue = {
                            totalRoll: 0,
                            totalSLYC: 0,
                            seenKeys: new Set()
                        };
                    }
                    if (options.summaryProcess === "calculate") {
                        options.totalValue.totalRoll += 1;

                        const key = options.value.MaNPL;
                        if (!options.totalValue.seenKeys.has(key)) {
                            options.totalValue.seenKeys.add(key);
                            options.totalValue.totalSLYC += Number(options.value.SLDK || 0);
                        }
                    }
                    if (options.summaryProcess === "finalize") {
                        const totalSLYC = Math.trunc(options.totalValue.totalSLYC * 10000) / 10000;
                        options.totalValue = `Tổng số roll/số kiện: ${options.totalValue.totalRoll.toLocaleString()} - Tổng yêu cầu: ${totalSLYC.toLocaleString()}`;
                    }
                }
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

                const mergeFields = ["NguoiGiaoKT", "KyTenNguoiGiao", "NguoiKT", "KyTenXNHX"];
                if (!mergeFields.includes(e.column.dataField)) return;

                // Key merge theo PhieuDK + MaNPL
                const currentKey = `${e.data.PhieuDK}_${e.data.MaNPL}`;
                if (e.rowIndex === 0) {
                    if (!mergelements[e.rowIndex]) mergelements[e.rowIndex] = {};
                    mergelements[e.rowIndex][e.column.dataField] = {
                        element: e.cellElement,
                        key: currentKey
                    };
                    return;
                }

                const prevEntry = mergelements[e.rowIndex - 1]?.[e.column.dataField];
                const prevKey = prevEntry?.key;

                if (!mergelements[e.rowIndex]) mergelements[e.rowIndex] = {};

                if (prevKey === currentKey) {
                    const originEntry = findOriginEntry(mergelements, e.rowIndex - 1, e.column.dataField);
                    mergelements[e.rowIndex][e.column.dataField] = originEntry;

                    $(e.cellElement).css("display", "none");

                    const originEl = originEntry?.element;
                    if (originEl) {
                        const span = $(originEl).attr("rowspan");
                        $(originEl).attr("rowspan", span ? Number(span) + 1 : 2);
                        $(originEl).css("vertical-align", "middle");
                    }
                } else {
                    // Nhóm mới
                    mergelements[e.rowIndex][e.column.dataField] = {
                        element: e.cellElement,
                        key: currentKey
                    };
                }
            }
        },
        onContentReady: function () {
            Object.keys(mergelements).forEach(k => delete mergelements[k]);
        }
    }).dxDataGrid("instance");
    $("#Layer_1").click()
}

function createViewDxGridDanhSachPhieuDKVT(data) {
    dxDataPhieuDKVT = $("#dxDataPhieuDKVT").dxDataGrid({
        dataSource: data,
        rowAlternationEnabled: true,
        width: '100%',
        noDataText: "",
        columnAutoWidth: false,
        allowColumnResizing: false,
        columnHidingEnabled: false,
        wordWrapEnabled: true,
        showRowLines: true,
        showBorders: true,
        scrolling: { mode: 'standard' },
        filterRow: { visible: false },
        headerFilter: { visible: false },
        paging: {
            enabled: false
        },
        renderAsync: false,
        grouping: { autoExpandAll: true },
        groupPanel: { visible: false },
        columns: [
            {
                dataField: "PhieuDK",
                caption: "Phiếu",
                minWidth: 100,
                cellTemplate: function (container, options) {
                    const $wrapper = $(`<div></div>`).css({
                        display: "flex",
                        justifyContent: "center",
                        height: "25px",
                        gap: "8px"
                    })

                    // Text
                    const $span = $(`<span>${options.data.PhieuDK}</span>`)

                    // Icon
                    const $btnNext = $(`<i class="fa-solid fa-circle-right"></i>`)
                        .css({ fontSize: '16px', color: 'green', cursor: 'pointer' })
                        .on("click", function () {
                            console.log(`isSX_GC_MM_2: `, isSX_GC_MM_2)
                            if (isSX_GC_MM_2) {
                                $("#malenh").val(`${options.data.MaLenhSX}`).trigger("change");
                            }
                            setTimeout(() => {
                                $("#phieuxuathang").val(`${options.data.PhieuDK}`).trigger("change");
                            }, 300)

                            $("#modalTimNhanh").modal('hide');
                            $("#inputTimKiem").val('').trigger('input');
                            createViewDxGridDanhSachPhieuDKVT([])
                        })

                    $wrapper.append($span, $btnNext).appendTo(container)
                }
            },
            {
                dataField: "MaLenh",
                caption: "Mã Lệnh Sản Xuất",
                visible: isFromXH ? isSX_GC_MM_1 : isSX_GC_MM_2,
                width: 400,
                cellTemplate: function (container, options) {
                    const $wrapper = $(`<div></div>`).css({ display: "flex", justifyContent: "center", height: "25px", gap: "8px" })

                    // Text
                    const $span = $(`<span>${options.data.MaLenh}</span>`)

                    // Icon
                    const $btnNext = $(`<i class="fa-solid fa-circle-right"></i>`)
                        .css({ fontSize: '16px', color: 'green' })
                        .on("click", function () {
                            $("#malenh").val(`${options.data.MaLenhSX}`).trigger("change");
                            $("#modalTimNhanh").modal('hide');
                            $("#inputTimKiem").val('').trigger('input');
                            createViewDxGridDanhSachPhieuDKVT([])
                        })

                    $wrapper.append($span, $btnNext).appendTo(container)

                }
            },
            {
                dataField: "MaVT",
                caption: "ItemCode",
                minWidth: 100,
            },
            {
                dataField: "MauVT",
                caption: "Màu",
                minWidth: 100,
            },
            {
                dataField: "KhoVai",
                caption: "Width/Size",
                minWidth: 100,
            },
            {
                dataField: "TenDVVT",
                caption: "Đơn Vị",
                minWidth: 100,
                width: 100,
            },
            {
                dataField: "SLDK",
                caption: "SL Yêu Cầu",
                minWidth: 100,
            },
            {
                dataField: "SLNhap",
                caption: "Thực xuất",
                minWidth: 100,
                cellTemplate: function (container, options) {
                    const value = formatNumber(options.value);
                    $("<div>")
                        .text(value)
                        .addClass("thucnhap")
                        .toggleClass("text-danger", options.data.isCheckVuot === true)
                        .appendTo(container);
                }
            },
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

                const searchTerm = $("#inputTimKiem").val().trim().toLowerCase();
                if (searchTerm && (e.column.dataField === "MaVT" || e.column.dataField === "MauVT")) {
                    const cellValue = String(e.value || "");
                    const cellValueLower = cellValue.toLowerCase();

                    if (cellValueLower.includes(searchTerm)) {
                        // Tìm vị trí bắt đầu của text match
                        const startIndex = cellValueLower.indexOf(searchTerm);
                        const endIndex = startIndex + searchTerm.length;

                        // Tạo HTML với phần match được highlight
                        const before = cellValue.substring(0, startIndex);
                        const match = cellValue.substring(startIndex, endIndex);
                        const after = cellValue.substring(endIndex);

                        const highlightedHTML = `${before}<mark style="background-color: #ffeb3b; font-weight: 600; padding: 2px 4px; border-radius: 3px;">${match}</mark>${after}`;

                        $(e.cellElement).html(highlightedHTML);
                    }
                }
            }
        },
    }).dxDataGrid("instance");

    $("#Layer_1").click()
}

function formatNumber(value) {
    let str = value.toString();
    let intPart = str;
    let decPart = "";

    if (str.includes(".")) {
        [intPart, decPart] = str.split(".");
        decPart = decPart.substring(0, 4); // cắt, không làm tròn
    }

    // format phần nguyên
    let formattedInt = Number(intPart).toLocaleString();

    return decPart ? `${formattedInt}.${decPart}` : formattedInt;
}

/// Kiệt - Module Iframe Xuất Hàng
let keyKyTenSX_GC_MM;
let isSX_GC_MM_1;
let isSX_GC_MM_2 = true;
let isFromXH = false;
/// EVENT
$(function () {
    $('#loc').on('change', function () {
        const loc = $(this).val();
        changeLocModule(loc)
    })
})
function changeLocModule(loc) {
    isSX_GC_MM_2 = [0, 1, 4].includes(+loc)
    if (isSX_GC_MM_2) {
        $('.txtMaLenh').text("Mã Lệnh")
        $('.txtPhieuDK').text("Phiếu Đăng Ký")
    } else {
        
        $('.txtMaLenh').text("Phiếu YC")
        $('.txtPhieuDK').text("Phiếu Xuất Hàng")
    }
    
    GetPYC();
}
async function checkIframeXH() {
    if (locXH || phieuYCLS) {
        isFromXH = true;
        isSX_GC_MM_1 = [0, 1, 4].includes(+locXH)
        $('.sectionHeader').addClass('d-none');
        $("#loc").val(locXH).trigger("change")
        changeLocModule(locXH)

        $('#loc').prop('disabled', true);
        $('#malenh').prop('disabled', true);

        //await GetPhieuDKVT();

        if (isSX_GC_MM_1) {
            $('.txtMaLenh').text("Mã Lệnh")
            $('.txtPhieuDK').text("Phiếu Đăng Ký")
            $('#btnEditAllPhieu').addClass('d-none');
        } else {
            $('#btnEditAllPhieu').removeClass('d-none');
            $('.txtMaLenh').text("Phiếu YC")
            $('.txtPhieuDK').text("Phiếu Xuất Hàng")

        }
    } else {
        GetPYC();
    }
}

/// API
async function ApiSaveKiTenNN(arrSaveKT) {

    const request = new Request(`/api/PhieuXuatHangNPL/PostXHKT?action=PostUPKTNN`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(arrSaveKT),
    });
    let response = await fetch(request)
    let result = await response.json()

    if (result == 'True') {
        showToast("success", "Ký tên thành công !")
        GetViewPDKVT()
    }
}
