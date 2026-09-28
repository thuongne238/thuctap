var currentStream = null;
var currentContainer = null;
var currentFacingMode = 'environment';
var imageData = {};
var fieldDelete = null;
var arrDonViVatTu = [];
var rowSelected_PL = null;
var arrSoRoll = [];
var arrPhuLieu = new Array();
var arrSoLo = new Array();
var IsKiem100Persent = false;
var SignalTemple = "";
var SignalTempleName = localStorage.getItem("username1");

var arrPhuLucHasUnit = [{ MaPhuLuc: "PhuLucPL_5" }, { MaPhuLuc: "PhuLucPL_6" },
{ MaPhuLuc: "PhuLucPL_14" }]

var arrImageKiemPL = [];

function ResetVal(selector) {
    currentStream = null;
    currentContainer = null;
    currentFacingMode = 'environment'; // 'environment' (sau) hoặc 'user' (trước)
    imageData = {};
    fieldDelete = null;
    arrSoRoll = [];
    reloadPhuLieuGrid();
    $("#btn-chon-pl-kiem").val("");
    $("#text-note").val("")
    $("#selectSoRoll").empty();
    rowSelected_PL = null;
    if (selector == 'SoLo') {

        arrPhuLieu = new Array();
        arrSoLo = new Array();

    } else if (selector == 'PL') {

        $("#txt-mo-ta-npl").val('')
    }


}

function formatDateView(isoDate) {
    if (!isoDate) return "";

    let timestamp = Date.parse(isoDate);
    if (isNaN(timestamp)) return isoDate;

    let date = new Date(timestamp);
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

function formatTime(isoTimeString) {
    if (!isoTimeString) return "";

    let date = new Date(isoTimeString);
    if (isNaN(date.getTime())) return ""; // Kiểm tra nếu không phải ngày hợp lệ

    // Lấy giờ, phút, giây, đảm bảo luôn có 2 chữ số
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    let seconds = String(date.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

function formatDateSQL(dateStr) {
    if (!dateStr) return "";

    if (dateStr instanceof Date) {
        return dateStr.toISOString().split("T")[0];
    }

    if (typeof dateStr !== "string") {
        console.error("Invalid dateStr:", dateStr);
        return "";
    }

    let parts = dateStr.split("-");
    if (parts.length !== 3) return "";

    let day = parts[0].padStart(2, "0");
    let month = parts[1].padStart(2, "0");
    let year = parts[2];

    return `${year}-${month}-${day}`;
}

function formatCurrencyValue(value) {
    if (value === null || value === undefined || value === '') return 0;

    const absVal = Math.abs(value);
    const isInteger = Number.isInteger(absVal);

    if (value < 0) {
        return isInteger
            ? `${absVal}`
            : `${absVal.toFixed(2)}`;
    }

    if (isInteger) return absVal.toString();


    return absVal.toFixed(2);
}

function InitComponent() {


    let today = moment().format('DD-MM-YYYY');

    $('#ngay-kiem').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoApply: true,
        autoUpdateInput: false,
        locale: {
            format: 'DD-MM-YYYY',
            separator: ' - ',
            applyLabel: 'Chọn',
            cancelLabel: 'Hủy',
            fromLabel: 'Từ',
            toLabel: 'Đến',
            customRangeLabel: 'Tùy chỉnh',
            daysOfWeek: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
            monthNames: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
            firstDay: 1
        }
    });

    // Gán giá trị mặc định = hôm nay
    $('#ngay-kiem').val(today);

}

window.addEventListener('resize', InitComponent);
window.addEventListener('load', InitComponent);

function GetDonViTinh() {
    $.ajax({
        async: false,
        url: `/api/QtyKiemPL/Get?action=GetDonViVT`,
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            arrDonViVatTu = []
            if (data.length > 0) {
                arrDonViVatTu = [...data]
            }

        }
    });
}

function fetchDonViVT(selector, selectedValue) {
    let options = '';
    if (Array.isArray(arrDonViVatTu)) {
        arrDonViVatTu.forEach(item => {
            const selected = item.MaDVVT === selectedValue ? 'selected' : '';
            options += `
                <option value="${item.MaDVVT}" ${selected}>
                    ${item.TenDVVT}
                </option>`;
        });
    }

    return `
        <select id="select-dv-${selector}" 
                class="form-select custom-input" disabled>
            ${options}
        </select>
    `;
}

function GetSoLo() {
    $.ajax({
        async: false,
        url: `/api/QtyKiemPL/Get?action=GetSoLoNK`,
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            ResetVal('SoLo');
            if (data.length > 0) {
                arrSoLo = [...data]
                fetchSoLo(data)
                fetchFormSection(data[0]);
                $("#selectPL").val("")
            }

        }
    });
}

function fetchSoLo(data) {
    $("#selectSoLO").empty();

    $.each(data, function (index, item) {
        var clsStatus = 'val-level-0';
        if (item.Status == 1) {
            clsStatus = 'val-level-1';
        } else if (item.Status == 2) {
            clsStatus = 'val-level-2';
        }


        var option = new Option(item.SoLo, item.SoLoID, false, false);
        $(option).attr('data-class', clsStatus);
        $('#selectSoLO').append(option);
    });


    $('#selectSoLO').select2({
        templateResult: function (option) {
            if (!option.id) return option.text;

            var cls = $(option.element).data('class') || '';
            return $('<span class="' + cls + '">' + option.text + '</span>');
        },
        templateSelection: function (option) {
            if (!option.id) return option.text;

            var cls = $(option.element).data('class') || '';
            return $('<span class="' + cls + '">' + option.text + '</span>');
        }
    });
    $('#selectSoLO').val(_soLoID).trigger('change');
}

$('#selectSoLO').on("change", function () {
    const SoLoID = $('#selectSoLO').val();
    $("#selectPL").val("")
    ResetVal('PL');
    if (SoLoID) {
        const objSoLoSelected = arrSoLo.find(x => x.SoLoID == SoLoID);
        fetchFormSection(objSoLoSelected)
        $("#check-kiem-100-persent").prop("checked", false);
    }
})

function fetchFormSection(SoLo_infor) {
    $("#txt-khach-hang").val(SoLo_infor.TenKH || "");
    $("#txt-nha-cc").val(SoLo_infor.TenNCC || "");
    $("#ngay-nhap-kho").val(formatDateView(SoLo_infor.NgayNK));
}

function GetSoRoll(SoLoID, MaNPL) {
    $.ajax({
        async: false,
        url: `/api/QtyKiemPL/Get?action=GetSoRoll&para1=${SoLoID}&para2=${MaNPL}`,
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (data.length > 0) {
                arrSoRoll = [...data]
                fetchSoRoll(data)
                GetPhieuKiemPL($("#ngay-kiem").val(), rowSelected_PL.SoLoID, rowSelected_PL.MaNPL, data[0].SoKienHienThi, rowSelected_PL.Dot);
            } else {
                GetPhieuKiemPL($("#ngay-kiem").val(), rowSelected_PL.SoLoID, rowSelected_PL.MaNPL, "", rowSelected_PL.Dot);
            }

        }
    });
}

function fetchSoRoll(data) {
    $.each(data, function (index, item) {
        $('#selectSoRoll').append(
            `<option value="${item.SoKienHienThi}">${item.SoKienHienThi}</option>`
        );
    });
}

$('#selectSoRoll').on("change", function () {

    //GetPhieuKiemPL($("#ngay-kiem").val(), rowSelected_PL.SoLoID, rowSelected_PL.MaNPL, $("#selectSoRoll").val());

})

function reloadPhuLieuGrid() {
    fetchPhieuKiemPL([])
    var $grid = $("#grvPhuLieuKiem");
    if ($grid.data("dxDataGrid")) {
        var grid = $grid.dxDataGrid("instance");
        grid.getDataSource().reload();

    }
}

function GetPhuLieu(SoLoID) {
    const loaderWrapper = document.getElementById('customLoaderWrapper');
    const progressBar = document.getElementById('customProgressBar');

    if (!loaderWrapper || !progressBar) {
        console.error("Thiếu phần tử customLoaderWrapper hoặc customProgressBar.");
        return;
    }


    loaderWrapper.classList.add('active');
    progressBar.style.width = '0%';
    progressBar.setAttribute('data-percentage', '0%');

    let progress = 0;
    const interval = setInterval(() => {
        if (progress < 90) {
            progress++;
            progressBar.style.width = progress + '%';
            progressBar.setAttribute('data-percentage', progress + '%');
        }
    }, 30);

    const apiUrl = `/api/QtyKiemPL/Get?action=GetPhuLieuNK&para1=${SoLoID}`;
    fetch(apiUrl, { method: "GET" })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            //reloadPhuLieuGrid();
            fetchPhuLieu(data);

            if (data.length > 0) {
                //rowSelected_PL = data[0]
                //$("#selectPL").val(rowSelected_PL.ItemCode);
                //GetSoRoll(SoLoID, rowSelected_PL.MaNPL);
            }



        })
        .catch(error => {
            DevExpress.ui.notify("Lỗi Kết Nối Mạng . Vui Lòng Thử Lại Sau", 'warning', 2000);
            fetchPhuLieu([]);
        })
        .finally(() => {
            clearInterval(interval);
            progressBar.style.width = '100%';
            progressBar.setAttribute('data-percentage', '100%');

            setTimeout(() => {
                loaderWrapper.classList.remove('active');
                progressBar.style.width = '0%';
                progressBar.setAttribute('data-percentage', '100%');
            }, 800); // hiệu ứng fade-out
        });
}

function fetchPhuLieu(data) {
    if (data && data.length > 0) {

        let countPass = data.filter(x => x.Status === 3).length;
        let countFail = data.filter(x => x.Status === 2).length;
        let countNo = (data.length) - (countPass + countFail)
        $("#headerInfo").html(`
        <div><strong>Total:</strong> ${data.length || '0'}</div>
        <div><strong>Pass:</strong> ${countPass || '0'}</div>
        <div><strong>Fail:</strong> ${countFail || '0'}</div>
        <div><strong>No:</strong> ${countNo || '0'}</div>
                   
        `);

    }

    $("#gridPL").dxDataGrid({
        dataSource: data.length == 0 ? [] : data,

        columns: [
            {
                dataField: "STT", caption: "STT", minWidth: 70, width: 70,
                //allowGrouping: false,
                //allowSorting: false,
                sortIndex: 1, sortOrder: "asc"
                // Tắt sort trên header STT
            },
            {
                dataField: "ChungLoaiVatTu", caption: "ChungLoaiVatTu",
                groupIndex: 0,
                sortIndex: 0, sortOrder: "asc",
                groupCellTemplate: function (cellElement, cellInfo) {

                    cellElement.html(`<span style="color: brown; font-weight: bold;">${cellInfo.data.key}</span>`);
                },
            },
            { dataField: "MaNhom", visible: false },
            { dataField: "MaNPL", visible: false },
            { dataField: "MaVTID", visible: false },
            { dataField: "ItemCode", caption: "ItemCode" },
            { dataField: "TenPL", caption: "Mô Tả" },
            { dataField: "MauVTID", visible: false },
            { dataField: "MauVT", caption: "Màu VT", minWidth: 90, width: 100 },
            { dataField: "CodeColor", caption: "Code Color" },
            { dataField: "KhoVai", caption: "Khổ/Size", minWidth: 90, width: 100 },
            { dataField: "KhoVaiID", visible: false },
            { dataField: "SoLoT", visible: false },
            { dataField: "Batch", visible: false },
            { dataField: "SoLotView", caption: "Batch/LOT", minWidth: 90, width: 100 },
            { dataField: "SoLuong", caption: "SL", minWidth: 90, width: 100 },
            { dataField: "Dot", caption: "Đợt", visible: false },
            { dataField: "TenDot", caption: "Đợt", minWidth: 70, width: 70 },
            {
                dataField: "Status",
                caption: "Status",
                minWidth: 70,
                width: 70,
                cellTemplate: function (container, options) {
                    const status = options.value;
                    let statusText = '';
                    let statusClass = '';

                    switch (status) {
                        case 3:
                            statusText = 'P';
                            statusClass = 'status-pass';
                            break;
                        case 2:
                            statusText = 'F';
                            statusClass = 'status-fail';
                            break;
                        case 1:
                        case 0:
                            statusText = 'N';
                            statusClass = 'status-pending';
                            break;

                    }

                    $('<div>')
                        .addClass('status-badge ' + statusClass)
                        .text(statusText)
                        .appendTo(container);
                }
            }
        ],
        searchPanel: { visible: true },
        filterRow: { visible: true },
        columnAutoWidth: true,
        selection: { mode: "single" },
        hoverStateEnabled: true,
        showBorders: true,
        showRowLines: true,
        showColumnLines: true,
        onOptionChanged: function (e) {
            if (e.name === "columns" && e.fullName.indexOf("groupIndex") > -1) {
                var grid = e.component;
                grid.columnOption("STT", "sortOrder", "asc");
            }
        },
        sorting: {
            mode: "multiple"
        },
        onContentReady: function (e) {
            e.component.columnOption("STT", "sortOrder", "asc");
        },
        onRowClick: function (eRow) {
            const selected = eRow.data;
            if (selected?.MaNPL) {
                $("#selectPL").val(selected.ItemCode);
                ResetVal('PL');
                rowSelected_PL = selected;
                GetPhieuKiemPL(new Date(), selected.SoLoID, selected.MaNPL, "", selected.Dot);
                GetXacNhanKiem(selected.SoLoID, selected.MaNPL, selected.Dot)
                $("#txt-mo-ta-npl").val(selected.TenPL)
                const modalEl = document.getElementById('plModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();
            }
        },
    });
}

$("#selectPL").on("click", function () {
    $("#btn-chon-pl-kiem").click();
    var FilterOption = $("#filterTypeSelect").val();
    var SoLoID = "";
    if (FilterOption == "PO") {

        SoLoID = $('#selectSoLO').val();

    }

    else if (FilterOption == "Supplier") {

        SoLoID = $("#selectSoLobyVatTuNhaCC").val()
    }
    GetPhuLieu(SoLoID);

});

$("#check-kiem-100-persent").on("change", function () {
    const isChecked = $("#check-kiem-100-persent").is(":checked");

    const grid = $("#grvPhuLieuKiem").dxDataGrid("instance");


    const rowIndex = grid.getRowIndexByKey("PhuLucPL_6");
    if (rowIndex < 0) return;

    const rowData = grid.getDataSource().items()[rowIndex];

    Object.keys(rowData).forEach(field => {
        const cell = rowData[field];

        if (cell && typeof cell === "object" && cell.weightNote !== undefined) {
            const newValue = isChecked
                ? rowSelected_PL.SoLuong
                : GetSLKiemPL(rowSelected_PL.SoLuong);

            cell.weightNote = newValue;
            cell.note = newValue;

            grid.cellValue(rowIndex, field, cell);
        }
    });

    grid.repaint();
});
function Set_Kiem_100_persent(SLCanKiem, IsKiem) {
    if (!IsKiem) {
        SoLuong = rowSelected_PL == null ? 0 : rowSelected_PL.SoLuong;
        if (SLCanKiem == SoLuong) {
            $("#check-kiem-100-persent").prop("checked", true);
        }
        else {
            $("#check-kiem-100-persent").prop("checked", false);
        }
    }
   
   
}


function GetPhieuKiemPL(NgayKiem, SoLoID, MaNPL, SoRoll, Dot) {
    $.ajax({
        url: `/api/QtyKiemPL/Get?action=GetPhieuKiem&para1=${encodeURIComponent(SoLoID)}&para2=${formatDateSQL(NgayKiem)}&para3=${encodeURIComponent(MaNPL)}&para4=NONE&para5=${Dot}`,
        contentType: 'application/json;charset=utf-8',
        success: function (data) {

            GetImageKiem(SoLoID, MaNPL, Dot).then(function () {

                if (data.length > 0) {
                    arrPhuLieu = [...data];
                    fetchPhieuKiemPL(data);
                }
            });
        }
    });
}

function SetPhuLieuKiem(data) {
    const isChecked = $("#check-kiem-100-persent").is(":checked");
    let arrPhuLieu = [...data];

    if (arrPhuLieu.length > 0) {    
        const Key = rowSelected_PL.MaNPL;
        const NCC = $("#txt-nha-cc").val();
        const colContentPL = `@MaNPL@${Key}`;
        $.each(arrPhuLieu, function (index, item) {
            if (item.STT == "0") {
                item.STT = "";
            }


            if (!item[colContentPL]) {
                item[colContentPL] = {
                    weightStatus: null,
                    weightNote: "",
                    img: "",
                    isCheck: false,
                    isReadonly: false
                };
            }


            const contentValue = item[colContentPL];
            let arrContentKiem = [];

            if (typeof contentValue === 'string' && contentValue) {
                arrContentKiem = contentValue.split('@');
            } else if (contentValue && contentValue.note !== undefined) {
                arrContentKiem = [];
            } else {
                arrContentKiem = [];
            }
            //const objSoRoll = arrSoRoll.find(x => x.SoLoID == item.SoLoID && x.MaNPL == Key && x.SoKienHienThi == $("#selectSoRoll").val())

            const defaultObj = {
                weightStatus: null,
                weightNote: "",
                img: "",
                isCheck: false,
                isReadonly: false,
                CuonThucTe: 0,
                SoMetThucTe: 0,
                IsHaveSoMet: false,
                IsWash: null,
                Dot: rowSelected_PL.Dot
            };
            let SLKiem = 0;
            if (rowSelected_PL != null) {
                SLKiem = rowSelected_PL == null ? 0 : rowSelected_PL.SoLuong;
            }
            const IsHasUnit = arrPhuLucHasUnit.find(
                x => x.MaPhuLuc === item.MaPhuLuc
            ) !== undefined;
            if (IsHasUnit == true) {
                item[colContentPL].MaDVVT = arrContentKiem[3] || ""
            }
            switch (item.MaPhuLuc) {
                case 'PhuLucPL_1':
                    item[colContentPL] = {
                        ...defaultObj,
                        weightNote: arrContentKiem[0] == "@" ? "" : (arrContentKiem[0] || ""),
                        img: arrContentKiem[2] == "@" ? "" : (arrContentKiem[2] || ""),
                        isCheck: false
                    };
                    break;


                case 'PhuLucPL_2':
                    var savedStatus = "none";
                    if (arrContentKiem[1] && arrContentKiem[1] !== "@" && arrContentKiem[1] !== "none") {
                        savedStatus = arrContentKiem[1] || "none";
                    }
                    item[colContentPL] = {
                        ...defaultObj,
                        weightStatus: savedStatus,
                        weightNote: arrContentKiem[0] == "@" || arrContentKiem[0] == " " ? rowSelected_PL.ItemCode : (arrContentKiem[0] || ""),
                        img: arrContentKiem[2] == "@" || arrContentKiem[0] == "" ? rowSelected_PL.ItemCode : (arrContentKiem[2] || ""),
                        isCheck: true
                    };
                    break;
                case 'PhuLucPL_3':

                    var savedStatus = "none";
                    if (arrContentKiem[1] && arrContentKiem[1] !== "@" && arrContentKiem[1] !== "none") {
                        savedStatus = arrContentKiem[1] || "none";
                    }

                    item[colContentPL] = {
                        ...defaultObj,
                        weightStatus: savedStatus,
                        weightNote: arrContentKiem[0] == "@" || arrContentKiem[0] == " " ? rowSelected_PL.CodeColor : (arrContentKiem[0] || ""),
                        img: arrContentKiem[2] == "@" ? "" : (arrContentKiem[2] || ""),
                        isCheck: true
                    };

                    break;

                case 'PhuLucPL_4':
                    item[colContentPL] = {
                        weightNote: !arrContentKiem[0] || arrContentKiem[0] == "none" ? rowSelected_PL.SoLotView : arrContentKiem[0] || "",
                        note: !arrContentKiem[0] || arrContentKiem[0] == "none" ? rowSelected_PL.SoLotView : arrContentKiem[0] || "",
                        isReadonly: false
                    };
                    break;

                case 'PhuLucPL_5':
                    item[colContentPL] = {
                        weightNote: rowSelected_PL == null ? 0 : rowSelected_PL.SoLuong,
                        note: rowSelected_PL == null ? 0 : rowSelected_PL.SoLuong,
                        isReadonly: true
                    };
                    break;

                case 'PhuLucPL_6':
                    var SLCanKiem = 0
                    var str = arrContentKiem[0].trim();
                    var IsKiem = str === "" || isNaN(Number(str));
                    if (IsKiem) {
                        SLCanKiem = isChecked ? SLKiem : GetSLKiemPL(SLKiem)
                    } else {
                        SLCanKiem = Number(arrContentKiem[0]) || 0
                      
                    }
                    Set_Kiem_100_persent(SLCanKiem, IsKiem)
                    item[colContentPL] =
                    {
                        weightNote: SLCanKiem ,
                        note: SLCanKiem,
                        isReadonly: false
                    };
                    break;

                case 'PhuLucPL_7':
                    item[colContentPL] = {
                        weightNote: !arrContentKiem[0] || arrContentKiem[0] == "none" || arrContentKiem[0] == " " ? rowSelected_PL.KhoVai : arrContentKiem[0] || "",
                        note: !arrContentKiem[0] || arrContentKiem[0] == "none" || arrContentKiem[0] == " " ? rowSelected_PL.KhoVai : arrContentKiem[0] || "",
                        isReadonly: false
                    };
                    break;
                case 'PhuLucPL_8':
                case 'PhuLucPL_9':
                case 'PhuLucPL_10':
                case 'PhuLucPL_11':
                case 'PhuLucPL_12':
                case 'PhuLucPL_13':
                case 'PhuLucPL_15':

                    var savedStatus = "none";
                    if (arrContentKiem[1] && arrContentKiem[1] !== "@" && arrContentKiem[1] !== "none") {
                        savedStatus = arrContentKiem[1] || "none";
                    }

                    item[colContentPL] = {
                        ...defaultObj,
                        weightStatus: savedStatus,
                        weightNote: arrContentKiem[0] == "@" ? "" : (arrContentKiem[0] || ""),
                        img: arrContentKiem[2] == "@" ? "" : (arrContentKiem[2] || ""),
                        isCheck: true
                    };
                    break;
                case 'PhuLucPL_14':

                    var savedStatus = null;
                    item[colContentPL] = {
                        ...defaultObj,
                        SoMetThucTe: arrContentKiem[4] || "",
                        CuonThucTe: arrContentKiem[5] == "@" ? 1 : (arrContentKiem[5] || 1),
                        IsHaveSoMet: true
                    };
                    break;
                case 'PhuLucPL_16':
                    var savedStatus = null;
                    if (arrContentKiem[1] && arrContentKiem[1] !== "@" && arrContentKiem[1] !== "none") {
                        if (arrContentKiem[1] === "pass") {
                            savedStatus = 1;
                        } else if (arrContentKiem[1] === "fail") {
                            savedStatus = 0;
                        } else {
                            savedStatus = 2;
                        }
                    }

                    var isWashValue = null;
                    if (arrContentKiem[6] && arrContentKiem[6] !== "@") {
                        isWashValue = parseInt(arrContentKiem[6]);
                    }

                    item[colContentPL] = {
                        ...defaultObj,
                        weightStatus: savedStatus,
                        weightNote: arrContentKiem[0] == "@" ? "" : (arrContentKiem[0] || ""),
                        img: arrContentKiem[2] == "@" ? "" : (arrContentKiem[2] || ""),
                        isCheck: true,
                        IsWash: isWashValue
                    };
                    break;
                case 'NONE':
                    $("#text-note").val(arrContentKiem[0] == "@" ? "" : (arrContentKiem[0] || ""))
                    break;

                default:
                    item[colContentPL] = {
                        weightNote: arrContentKiem[0] == "@" ? "" : (arrContentKiem[0] || ""),
                        note: arrContentKiem[0] == "@" ? "" : (arrContentKiem[0] || ""),
                        isReadonly: false
                    };
                    break;
            }
        });
    
        return arrPhuLieu.filter(x => x.MaPhuLuc != "NONE");
    } else {
        return new Array();
    }
}

function GetSLKiemPL(SoLuong) {
    let SLKiem = 0;

    switch (true) {
        case SoLuong <= 100:
            SLKiem = Math.round(SoLuong * 0.1 * 10000) / 10000;
            break;
        case SoLuong >= 101 && SoLuong <= 500:
            SLKiem = Math.round(SoLuong * 0.07 * 10000) / 10000;
            break;
        case SoLuong >= 501 && SoLuong <= 1500:
            SLKiem = Math.round(SoLuong * 0.05 * 10000) / 10000;
            break;
        case SoLuong >= 1500:
            SLKiem = Math.round(SoLuong * 0.03 * 10000) / 10000;
            break;
    }

    return Math.ceil(SLKiem);
}

function updateEditMode(isEdit) {
    //const radioButtons = document.querySelectorAll('input[name="result-kiem"]');
    //const textarea = document.getElementById('text-note');

    ////radioButtons.forEach(radio => {
    ////    radio.disabled = !isEdit;
    ////});
    //radioButtons.disabled = false;
    //if (!isEdit) {
    //    textarea.setAttribute('readonly', 'readonly');
    //} else {
    //    textarea.removeAttribute('readonly');
    //}
}

function fetchPhieuKiemPL(data) {
    const IsEdit = !data || data.length == 0 ? true : data[0].IsUpdate == 0;
    const fixedColumns = [
        {
            dataField: "STT",
            caption: "STT",
            allowEditing: false,
            minWidth: 50,
            width: 50,
            alignment: "center",
        },

        { dataField: "MaPhuLuc", caption: "MaPhuLuc", allowEditing: false, visible: false },
        {
            dataField: "PhuLuc",
            caption: "Nội Dung Kiểm",
            minWidth: '40%', width: '40%',
            allowEditing: false,
            cssClass: "col-phu-luc",
            cellTemplate: function (container, options) {
                const value = options.value || '';
                $(container).html(value);
            }
        },
        { dataField: "MaPhieuKiem", caption: "MaPhieuKiem", visible: false },
        { dataField: "SoLoID", caption: "SoLoID", visible: false },
        { dataField: "NgayKiem", caption: "NgayKiem", visible: false }
    ];
    const dynamicColumns = [];
    if (data.length > 0) {
        const sampleRow = data[0];
        Object.keys(sampleRow).forEach(key => {
            if (/@MaNPL/.test(key)) {
                const keyParts = key.split('@MaNPL@');
                dynamicColumns.push({
                    dataField: key,
                    caption: `Lần ${rowSelected_PL.Dot}`,
                    allowEditing: false,
                    cssClass: "col-phu-luc",
                    minWidth: '45%', width: '45%',
                    //headerCellTemplate: function (container, info) {
                    //    const hasCheck = keyParts[3] == true;

                    //    $('<div>')
                    //        .css({
                    //            display: 'flex',
                    //            alignItems: 'center',
                    //            width: '100%'
                    //        })
                    //        .append(
                    //            $('<span>').text(info.column.caption)
                    //        )
                    //        .append(
                    //            hasCheck
                    //                ? $('<i>')
                    //                    .addClass('fa-solid fa-badge-check')
                    //                    .css({ marginLeft: 'auto', color: '#6552D0' })
                    //                : ''
                    //        )
                    //        .appendTo(container);
                    //},
                    cellTemplate: function (container, options) {
                        const value = options.value;
                        const rowKey = options.row.key;
                        const rowIndex = options.row.rowIndex;
                        const columnField = options.column.dataField;
                        const IsHasUnit = arrPhuLucHasUnit.find(
                            x => x.MaPhuLuc === rowKey
                        ) !== undefined;
                        const MaDVVT = value.MaDVVT;
                        const imgInfo = arrImageKiemPL.find(x => x.MaPhuLucKiem === rowKey);
                        const numImg = imgInfo ? imgInfo.NumImg : 0;

                        const isDisabled = !IsEdit || value.isReadonly;
                        const disabledAttr = isDisabled || rowKey == "PhuLucPL_5" ? 'disabled' : '';
                        const readonlyAttr = isDisabled || rowKey == "PhuLucPL_5" ? 'readonly' : '';

                        let html = '<div class="d-flex align-items-center gap-1 p-1">';

                        if (value.IsHaveSoMet == true) {
                            html += `
                                <textarea class="form-control flex-grow-1 cell-editable-textarea textarea-so-met"
                                  data-row-index="${rowIndex}"
                                  data-column-field="${columnField}"
                                  data-field-type="SoMetThucTe"
                                  style="color:green; background:#f8f9fa; border:1px solid #dee2e6; 
                                         white-space:nowrap; text-overflow:ellipsis; font-weight:500;
                                         min-height:44px; font-size:16px; resize:none; padding:8px 12px;" 
                                  placeholder="S.Mét TT"
                                  ${readonlyAttr}>${value.SoMetThucTe || ''}</textarea>`;

                            html += `
                                <textarea class="form-control flex-grow-1 cell-editable-textarea textarea-so-cuon"
                                  data-row-index="${rowIndex}"
                                  data-column-field="${columnField}"
                                  data-field-type="CuonThucTe"
                                  style="color:green; background:#f8f9fa; border:1px solid #dee2e6; 
                                         white-space:nowrap; text-overflow:ellipsis; font-weight:500;
                                         min-height:44px; font-size:16px; resize:none; padding:8px 12px;"
                                  placeholder="Số lượng cuộn"
                                  ${readonlyAttr}>${value.CuonThucTe || ''}</textarea>`;
                        }

                        else if (rowKey == "PhuLucPL_16") {
                            const nameGroupYN = `weight_${rowKey}-yn`;
                            const nameGroup = `weight_${rowKey}`;
                            const idPass = `weight-pass-${rowKey}`;
                            const idFail = `weight-fail-${rowKey}`;
                            const idNo = `weight-no-${rowKey}`;
                            const idYes = `weight-yes-${rowKey}`;

                            const currentStatus = value.weightStatus;
                            const isWashNo = (value.IsWash == 2);
                            const isWashYes = (value.IsWash != 2 && value.IsWash != null);


                            const disablePassFail = isWashNo || !IsEdit ? 'disabled' : '';

                            html += `
                                <div class="form-check">
                                    <input class="form-check-input radio-interactive radio-yes-no" 
                                           type="radio" 
                                           name="${nameGroupYN}"
                                           id="${idYes}"
                                           value="yes" 
                                           data-row-index="${rowIndex}"
                                           data-column-field="${columnField}"
                                           data-radio-type="wash"
                                           ${isWashYes ? 'checked' : ''}
                                           ${disabledAttr}>
                                    <label class="form-check-label text-success" for="${idYes}">Yes</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input radio-interactive radio-yes-no"
                                           type="radio"
                                           name="${nameGroupYN}"
                                           id="${idNo}"
                                           value="no" 
                                           data-row-index="${rowIndex}"
                                           data-column-field="${columnField}"
                                           data-radio-type="wash"
                                           ${isWashNo ? 'checked' : ''}
                                           ${disabledAttr}>
                                    <label class="form-check-label text-danger" for="${idNo}">No</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input radio-interactive radio-pass-fail"
                                           type="radio"
                                           name="${nameGroup}"
                                           id="${idPass}" 
                                           value="pass" 
                                           data-row-index="${rowIndex}"
                                           data-column-field="${columnField}"
                                           data-radio-type="status"
                                           ${currentStatus === 1 ? 'checked' : ''} 
                                           ${disablePassFail}>
                                    <label class="form-check-label text-success" for="${idPass}">Pass</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input radio-interactive radio-pass-fail" 
                                           type="radio" 
                                           name="${nameGroup}"
                                           id="${idFail}" 
                                           value="fail" 
                                           data-row-index="${rowIndex}"
                                           data-column-field="${columnField}"
                                           data-radio-type="status"
                                           ${currentStatus === 0 ? 'checked' : ''} 
                                           ${disablePassFail}>
                                    <label class="form-check-label text-danger" for="${idFail}">Fail</label>
                                </div>`;
                        }

                        else if (value.note !== undefined) {
                            html += `
                                 <textarea class="form-control flex-grow-1 cell-editable-textarea"
                                  data-row-index="${rowIndex}"
                                  data-column-field="${columnField}"
                                  style="color:green; background:#f8f9fa; border:1px solid #dee2e6; 
                                         white-space:nowrap; text-overflow:ellipsis; font-weight:500;
                                         min-height:44px; font-size:16px; resize:none; padding:8px 12px;"
                                  rows="1"
                                   
                                  ${readonlyAttr}>${value.note || value.weightNote || ''}</textarea>`;
                        }

                        else if (value.isCheck !== undefined) {
                            const nameGroup = `weight_${rowKey}`;
                            const idPass = `weight-pass-${rowKey}`;
                            const idFail = `weight-fail-${rowKey}`;
                            const idNo = `weight-No-${rowKey}`;

                            const disabledAttrRadio = isDisabled ? 'disabled' : '';
                            let radioHtml = '';
                            if (value.isCheck) {
                                const currentStatus = value.weightStatus || 'no';

                                radioHtml = `
                                    <div class="form-check">
                                        <input class="form-check-input radio-interactive" 
                                               type="radio" 
                                               name="${nameGroup}" 
                                               id="${idPass}" 
                                               value="pass" 
                                               data-row-index="${rowIndex}"
                                               data-column-field="${columnField}"
                                               ${currentStatus === 'pass' ? 'checked' : ''} 
                                               ${disabledAttrRadio}>
                                        <label class="form-check-label text-success" for="${idPass}">Pass</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input radio-interactive" 
                                               type="radio" 
                                               name="${nameGroup}" 
                                               id="${idFail}" 
                                               value="fail" 
                                               data-row-index="${rowIndex}"
                                               data-column-field="${columnField}"
                                               ${currentStatus === 'fail' ? 'checked' : ''} 
                                               ${disabledAttrRadio}>
                                        <label class="form-check-label text-danger" for="${idFail}">Fail</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input radio-interactive" 
                                               type="radio" 
                                               name="${nameGroup}" 
                                               id="${idNo}" 
                                               value="no" 
                                               data-row-index="${rowIndex}"
                                               data-column-field="${columnField}"
                                               ${currentStatus === 'no' ? 'checked' : ''} 
                                               ${disabledAttrRadio}>
                                        <label class="form-check-label text-secondary" for="${idNo}">No</label>
                                    </div>`;
                            }


                            html += buildCameraHtml(rowKey, rowIndex, columnField, imgInfo, isDisabled);
                            if (rowKey == "PhuLucPL_15" || rowKey == "PhuLucPL_14" || rowKey == "PhuLucPL_16") {
                                html = `<div class="d-flex align-items-center gap-3 p-1">`;
                            }

                            html += `${radioHtml}`;

                            if (rowKey != "PhuLucPL_16") {
                                html += `
                                    <textarea class="form-control cell-editable-textarea flex-grow-1"
                                      data-row-index="${rowIndex}"
                                      data-column-field="${columnField}"
                                      style="min-height:44px; font-size:16px; resize:none; padding:8px 12px;" 
                                      rows="1" 
                                      ${readonlyAttr}>${value.weightNote || ''}</textarea>`;
                            }
                        } else {
                            html += `<div class="p-2 text-muted">${value}</div>`;
                        }

                        if (IsHasUnit == true) {
                            html += fetchDonViVT(rowKey, !MaDVVT || MaDVVT == "" ? rowSelected_PL.MaDVVT : MaDVVT);
                        }

                        $(container).html(html + '</div>');
                    }
                });
            }
        });
    }

    const arrPLKiem = SetPhuLieuKiem(data);
    const allColumns = [...fixedColumns, ...dynamicColumns];

    const gridInstance = $("#grvPhuLieuKiem").dxDataGrid({
        dataSource: arrPLKiem,
        keyExpr: "MaPhuLuc",
        noDataText: "Chưa có phụ liệu",
        columns: allColumns,
        allowColumnResizing: true,
        columnAutoWidth: true,
        showBorders: true,
        showRowLines: true,
        showColumnLines: true,

        editing: {
            mode: 'batch',
            allowUpdating: IsEdit
        },
        paging: { enabled: false },
        filterRow: { visible: false },
        scrolling: {
            mode: "standard",
            showScrollbar: "always",
            useNative: true
        },
        sorting: {
            mode: "none"
        },
        onCellPrepared: function (e) {
            if (e.rowType === "data" && e.column.dataField === "STT") {
                var currentSTT = e.value;
                var rowIndex = e.rowIndex;

                if (rowIndex === 0 || e.component.cellValue(rowIndex - 1, "STT") !== currentSTT) {

                    var rowSpan = 1;
                    var nextIndex = rowIndex + 1;

                    while (nextIndex < e.component.totalCount() &&
                        e.component.cellValue(nextIndex, "STT") === currentSTT) {
                        rowSpan++;
                        nextIndex++;
                    }
                    if (rowSpan > 1) {
                        e.cellElement.attr("rowspan", rowSpan);
                        e.cellElement.css({
                            "vertical-align": "middle",
                            "text-align": "center"
                        });
                    }
                } else {

                    e.cellElement.hide();
                }
            }
        },
        onContentReady: function (e) {
            const grid = e.component;
            if (!IsEdit) {
                return;
            }


            $('#grvPhuLieuKiem').off('click', '.radio-interactive').on('click', '.radio-interactive', function (event) {
                if (!IsEdit) return;

                const $radio = $(this);
                const rowIndex = parseInt($radio.data('row-index'));
                const columnField = $radio.data('column-field');
                const newValue = $radio.val();
                const radioType = $radio.data('radio-type');

                const dataSource = grid.getDataSource();
                const items = dataSource.items();
                const rowData = items[rowIndex];

                if (rowData && rowData[columnField]) {
                    if ($radio.hasClass('radio-yes-no')) {
                        if (newValue === 'no') {
                            rowData[columnField].IsWash = 2;
                            rowData[columnField].weightStatus = null;

                            const rowKey = $radio.closest('tr').find('[data-row-key]').data('row-key') ||
                                $radio.attr('id').replace('weight-yes-', '').replace('weight-no-', '');
                            $(`input[name="weight_${rowKey}"]`).prop('disabled', true).prop('checked', false);

                        } else if (newValue === 'yes') {
                            rowData[columnField].IsWash = 1;

                            const rowKey = $radio.attr('id').replace('weight-yes-', '').replace('weight-no-', '');
                            $(`input[name="weight_${rowKey}"]`).prop('disabled', false);
                        }
                    } else if ($radio.hasClass('radio-pass-fail')) {
                        if (newValue === 'pass') {
                            rowData[columnField].weightStatus = 1;
                        } else if (newValue === 'fail') {
                            rowData[columnField].weightStatus = 0;
                        }
                    } else {
                        rowData[columnField].weightStatus = newValue;
                    }

                    grid.cellValue(rowIndex, columnField, rowData[columnField]);
                    grid.repaint();

                    // *** THÊM DÒNG NÀY: Tự động kiểm tra và cập nhật kết quả ***
                    autoCheckResultKiem(grid);
                }
            });

            $('#grvPhuLieuKiem').off('click', '.form-check-label').on('click', '.form-check-label', function (event) {
                if (!IsEdit) return;

                event.preventDefault();
                const $label = $(this);
                const forId = $label.attr('for');
                const $radio = $(`#${forId}`);

                if ($radio.length && !$radio.prop('disabled')) {
                    $radio.trigger('click');
                }
            });

            let typingTimer;
            const doneTypingInterval = 2000;


            $('#grvPhuLieuKiem').off('input', '.cell-editable-textarea')
                .on('input', '.cell-editable-textarea', function (event) {
                    if (!IsEdit) return;

                    const $textarea = $(this);
                    const rowIndex = parseInt($textarea.data('row-index'));
                    const columnField = $textarea.data('column-field');
                    const fieldType = $textarea.data('field-type');
                    const newValue = $textarea.val();

                    const dataSource = grid.getDataSource();
                    const items = dataSource.items();
                    const rowData = items[rowIndex];

                    if (rowData && rowData[columnField]) {
                        if (fieldType === 'SoMetThucTe') {
                            rowData[columnField].SoMetThucTe = newValue;
                        } else if (fieldType === 'CuonThucTe') {
                            rowData[columnField].CuonThucTe = newValue;
                        } else if (rowData[columnField].note !== undefined) {
                            rowData[columnField].note = newValue;
                            rowData[columnField].weightNote = newValue;
                        } else {
                            rowData[columnField].weightNote = newValue;
                        }
                        if (rowData && rowData[columnField]) {

                            if (rowData.MaPhuLuc === 'PhuLucPL_15') {
                                var rowKey = rowData.MaPhuLuc;
                                const value = $textarea.val().trim();
                                const inputValue = parseFloat(value);

                                if (value === '' || isNaN(inputValue)) {

                                    rowData[columnField].weightStatus = 'no';
                                    $(`input[name="weight_${rowKey}"][value="no"]`).prop('checked', true);
                                } else {
                                    const maNhom = rowSelected_PL.MaNhom || '';
                                    const chungLoaiVatTu = rowSelected_PL.ChungLoaiVatTu || '';
                                    const dungSai = parseFloat(rowSelected_PL.DungSai) || 0;

                                    let standardValue = 0;
                                    let checkType = '';

                                    if (maNhom === 'MACLVT_106' || chungLoaiVatTu === 'Carton') {

                                        checkType = 'CBM';
                                        const khoVaiStr = rowSelected_PL.KhoVai || '';


                                        const numbers = khoVaiStr.match(/[\d.]+/g);

                                        if (numbers && numbers.length >= 3) {

                                            const length = parseFloat(numbers[0]);
                                            const width = parseFloat(numbers[1]);
                                            const height = parseFloat(numbers[2]);

                                            standardValue = (length * width * height) / 1000000;

                                            console.log(`Tính CBM: ${length} × ${width} × ${height} = ${standardValue.toFixed(6)} m³`);
                                        } else {
                                            console.warn('Không tách được 3 số từ KhoVai:', khoVaiStr);
                                        }
                                    } else {

                                        checkType = 'Standard';
                                        const khoVaiStr = rowSelected_PL.KhoVai || '';
                                        const khoVaiMatch = khoVaiStr.match(/[\d.]+/);
                                        standardValue = khoVaiMatch ? parseFloat(khoVaiMatch[0]) : 0;

                                        console.log(`Tách số thường: ${khoVaiStr} → ${standardValue}`);
                                    }

                                    if (standardValue > 0 && dungSai > 0) {

                                        const minAllowed = standardValue - dungSai;
                                        const maxAllowed = standardValue + dungSai;


                                        if (inputValue >= minAllowed && inputValue <= maxAllowed) {
                                            // Nằm trong khoảng cho phép -> Pass
                                            rowData[columnField].weightStatus = 'pass';
                                            $(`input[name="weight_${rowKey}"][value="pass"]`).prop('checked', true);

                                            console.log(`✓ PASS (${checkType}): ${inputValue} nằm trong khoảng [${minAllowed.toFixed(6)} - ${maxAllowed.toFixed(6)}]`);
                                        } else {
                                            // Nằm ngoài khoảng cho phép -> Fail
                                            rowData[columnField].weightStatus = 'fail';
                                            $(`input[name="weight_${rowKey}"][value="fail"]`).prop('checked', true);

                                            console.log(`✗ FAIL (${checkType}): ${inputValue} nằm ngoài khoảng [${minAllowed.toFixed(6)} - ${maxAllowed.toFixed(6)}]`);
                                        }
                                    } else {

                                        console.warn('Không có thông tin đầy đủ:', {
                                            Type: checkType,
                                            KhoVai: rowSelected_PL.KhoVai,
                                            StandardValue: standardValue,
                                            DungSai: dungSai
                                        });
                                    }
                                }
                            }


                        }
                        clearTimeout(typingTimer);
                        typingTimer = setTimeout(() => {
                            if (!$textarea.is(':focus')) {
                                commitTextarea(grid, rowIndex, columnField, rowData);
                            }
                        }, doneTypingInterval);
                    }

                });


            $('#grvPhuLieuKiem').off('blur', '.cell-editable-textarea')
                .on('blur', '.cell-editable-textarea', function (event) {
                    if (!IsEdit) return;

                    const $textarea = $(this);
                    const rowIndex = parseInt($textarea.data('row-index'));
                    const columnField = $textarea.data('column-field');

                    clearTimeout(typingTimer);

                    const rowData = grid.getDataSource().items()[rowIndex];
                    if (rowData && rowData[columnField]) {
                        commitTextarea(grid, rowIndex, columnField, rowData);
                    }
                });


            $('#grvPhuLieuKiem').off('keydown', '.cell-editable-textarea')
                .on('keydown', '.cell-editable-textarea', function (event) {
                    if (!IsEdit) return;

                    if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        const $textarea = $(this);
                        const rowIndex = parseInt($textarea.data('row-index'));
                        const columnField = $textarea.data('column-field');

                        clearTimeout(typingTimer);

                        const rowData = grid.getDataSource().items()[rowIndex];
                        if (rowData && rowData[columnField]) {
                            commitTextarea(grid, rowIndex, columnField, rowData);
                        }

                        $textarea.blur();
                    }
                });


            $(document).off('click.textareaCommit').on('click.textareaCommit', function (event) {
                if (!IsEdit) return;

                const $clickedElement = $(event.target);


                if ($clickedElement.closest('.select2-container').length > 0 ||
                    $clickedElement.closest('.select2-dropdown').length > 0) {
                    return;
                }

                const isTextarea = $clickedElement.hasClass('cell-editable-textarea');


                const isInsideGrid = $clickedElement.closest('#grvPhuLieuKiem').length > 0;

                if (isTextarea) {
                    const clickedRowIndex = $clickedElement.data('row-index');
                    $('.cell-editable-textarea').each(function () {
                        const $textarea = $(this);
                        const currentRowIndex = $textarea.data('row-index');
                        if ($textarea.is(':focus') && currentRowIndex !== clickedRowIndex) {
                            $textarea.blur();
                        }
                    });
                } else if (!isInsideGrid) {

                    $('.cell-editable-textarea').each(function () {
                        const $textarea = $(this);
                        if ($textarea.is(':focus')) {
                            $textarea.blur();

                        }
                    });
                }
            });
        }
    }).dxDataGrid('instance');

    //updateEditMode(IsEdit);
  
    return gridInstance;
}

function GetImageKiem(SoLoID, MaNPL, Dot) {
    return $.ajax({
        url: `/api/QtyKiemPL/Get?action=GetImgKiemPL&para1=${SoLoID}&para2=${MaNPL}&para3=${Dot}`,
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            arrImageKiemPL = [];
            arrImageKiemPL = [...data];

            console.log(arrImageKiemPL)
        }
    });
}

function autoCheckResultKiem(grid) {
    const dataSource = grid.getDataSource();
    const items = dataSource.items();
    let hasFailRow = false;
    let hasCheckableRows = false;

    items.forEach(rowData => {

        Object.keys(rowData).forEach(key => {
            if (/@MaNPL/.test(key) && rowData[key]) {
                const cellValue = rowData[key];


                if (cellValue.isCheck !== undefined || cellValue.weightStatus !== undefined) {
                    hasCheckableRows = true;


                    if (cellValue.weightStatus === 'fail' || cellValue.weightStatus === 0) {
                        hasFailRow = true;
                    }

                    if (rowData.MaPhuLuc === 'PhuLucPL_16') {

                        if (cellValue.IsWash === 2) {

                        } else if (cellValue.IsWash === 1 && cellValue.weightStatus === 0) {
                            hasFailRow = true;
                        }
                    }
                }
            }
        });
    });


    if (hasCheckableRows) {
        const $passRadio = $('#KQPass');
        const $failRadio = $('#KQFail');

        $passRadio.prop('disabled', false);
        $failRadio.prop('disabled', false);

        if (hasFailRow) {

            $failRadio.prop('checked', true);
            $passRadio.prop('checked', false);
        } else {

            $passRadio.prop('checked', true);
            $failRadio.prop('checked', false);
        }

        // Optional: Disable lại sau khi set (nếu muốn người dùng không sửa được)
        $passRadio.prop('disabled', true);
        $failRadio.prop('disabled', true);
    }
}

function GetXacNhanKiem(SoLoID, MaNPL, Dot) {
    $("#txtDG_Mer").prop('readonly', false);
    $("#check-kiem-100-persent").prop("disabled", false);
    $("#ckSignTemplate_QC").prop("checked", false);
    $("#ckSignTemplate_QCManger").prop("checked", false);
    $("#ckSignTemplate_Mer").prop("checked", false);


    $("#txtDG_QC").val("");
    $("#txtDG_Mer").val("");
    $("#txtDG_KQ").val("");


    $("#KQPass").prop("checked", false);
    $("#KQFail").prop("checked", false);

    $("#KQPass_Mer").prop("checked", false);
    $("#KQFail_Mer").prop("checked", false);

    $("#txtQCName").text("");
    $("#txtQCManagerName").text("");
    $("#txtMerName").text("");

    $("#check-edit-conclusion").hide();

    canvasIds.forEach(id => {
        const pad = signaturePads[id];
        if (pad) {
            pad.clear();
        }
    })

    $.ajax({
        url: `/api/QtyKiemPL/Get?action=GetXN_PL&para1=${SoLoID}&para2=${MaNPL}&para3=${Dot}`,
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (data.length > 0) {
                const item = data[0];
                if (item && item.Is_XN_SoLo == true) {
                    setPermission("xac-nhan-qc", false);
                    $("#btn-save").hide();
                    $("#btnChange_KetLuanQC").hide();
                    $("#check-kiem-100-persent").prop("disabled", true);

                } else {
                    $("#btn-save").show();
                    CheckPerminsionQC(SoLoID, MaNPL, Dot)
                    CheckPerminsionQCManager();
                }
             
                fetXacNhanKiem(data);
              

            } else {
                $("#btn-save").show();
                setPermission("xac-nhan-qc", true);
              
            }



        }
    });
}

function fetXacNhanKiem(data) {
    const item = data[0];
    if (item && item.Is_XN_SoLo == true) {
        CheckPerminsionMer();
      

    }
    else {
        setPermission("xac-nhan-mer", false);
        //$("#btnChange_KetLuanQC").show();
       
    }

    if (item.IsEditConclusion == true) {

        $("#check-edit-conclusion").show();
    }


   
    const IsEdit = !data || data.length == 0 ? true : data[0].IsUpdate == 0;
    if (!IsEdit) {
        $("#txtDG_QC").prop('readonly', true);

    }

    if (item.Result == true || item.Result == 1) {
        $("#KQPass").prop("disabled", false).prop("checked", true);
        $("#KQFail").prop("checked", false);
    } else if (item.Result == false || item.Result == 0) {
        $("#KQPass").prop("checked", false);
        $("#KQFail").prop("checked", true);
    } else {
        $("#KQPass").prop("checked", false);
        $("#KQFail").prop("checked", false);
    }


    if (item.Result_Mer == true || item.Result_Mer == 1) {
        $("#KQPass_Mer").prop("checked", true);
        $("#KQFail_Mer").prop("checked", false);
    } else if (item.Result_Mer == false || item.Result_Mer == 0) {
        $("#KQFail_Mer").prop("checked", true);
        $("#KQPass_Mer").prop("checked", false);
    } else {
        $("#KQPass_Mer").prop("checked", false);
        $("#KQFail_Mer").prop("checked", false);
    }


    if (item.Is_SignQA_Mau === true || item.Is_SignQA_Mau === 1) {
        $("#ckSignTemplate_QC").prop("checked", true);

    } else if (item.Is_SignQA_Mau === false || item.Is_SignQA_Mau == 0) {
        $("#ckSignTemplate_QC").prop("checked", false);

    } else {

        $("#ckSignTemplate_QC").prop("checked", false);

    }

    if (item.Is_SignQA_Manager_Mau === true || item.Is_SignQA_Manager_Mau === 1) {
        $("#ckSignTemplate_QCManger").prop("checked", true);

    } else if (item.Is_SignQA_Manager_Mau === false || item.Is_SignQA_Manager_Mau == 0) {
        $("#ckSignTemplate_QCManger").prop("checked", false);

    } else {

        $("#ckSignTemplate_QCManger").prop("checked", false);

    }


    if (item.Is_SignQA_Mer_Mau === true || item.Is_SignQA_Mer_Mau === 1) {
        $("#ckSignTemplate_Mer").prop("checked", true);

    } else if (item.Is_SignQA_Mer_Mau === false || item.Is_SignQA_Mer_Mau == 0) {
        $("#ckSignTemplate_Mer").prop("checked", false);

    } else {

        $("#ckSignTemplate_Mer").prop("checked", false);

    }

    $("#txtDG_QC").val(item.KL_QC_Pass || '');
    $("#txtDG_Mer").val(item.KQ_GiaiQuyet || '');
    $("#txtDG_KQ").val(item.GhiChu_TBP_QC || '');

    $("#txtQCName").text(item.QCName || " ");
    $("#txtQCManagerName").text(item.QCManager || " ");
    $("#txtMerName").text(item.MerName || " ");


    const signMap = {
        'signQC': item.Sign_Pass,
        'signMer': item.KQ_GiaiQuyet_Sign,
        'signXN_KQ': item.TPCL_ComfirmSign,

    };

    canvasIds.forEach(id => {
        const pad = signaturePads[id];
        if (pad) {
            if (signMap[id]) {
                pad.fromDataURL(signMap[id]);
            } else {
                pad.clear();
            }
        }
    });

}

function commitTextarea(grid, rowIndex, columnField, rowData) {
    try {
        grid.cellValue(rowIndex, columnField, rowData[columnField]);
        grid.repaint();
    } catch (error) {

    }
}

let currentMaPhuLuc = null;

function buildCameraHtml(rowKey, rowIndex, columnField, value, isDisabled) {
    const imgs = arrImageKiemPL.filter(x => x.MaPhuLucKiem === rowKey);
    const imgInfo = imgs[0];
    const serverImg = imgInfo?.Image || null;
    const serverNum = imgInfo?.NumImg || 0;


    const displayImg = imgs.length > 0 ? imgs[imgs.length - 1].Image : serverImg;
    const displayNum = imgs.length > 0 ? imgs.length : serverNum;
    const hasImg = !!displayImg;

    return `<div class="d-flex justify-content-center camera-view-option">
       <button type="button" class="btn btn-outline-view-img"  data-row-key="${rowKey}"
             data-row-index="${rowIndex}"
             data-column-field="${columnField}"
           onclick="ViewImageFullScreen(this)">
          <i class="fa-sharp fa-solid fa-eye me-1"></i> Xem
        </button>
        <div class="camera-image-container imgweight${hasImg ? ' has-image' : ''}"
             data-field="weight"
             data-row-key="${rowKey}"
             data-row-index="${rowIndex}"
             data-column-field="${columnField}"
             style="cursor:${isDisabled ? 'not-allowed' : 'pointer'}; flex-shrink:0; position:relative;"
             onclick="${isDisabled ? '' : 'handleImageClick(this)'}">

            ${hasImg
            ? `<img src="${displayImg}" alt="Captured" class="img-fluid rounded"
                        style="width:100%;height:100%;object-fit:contain;">`
            : `<i class="fas fa-camera"></i>`}

            ${displayNum > 0
            ? `<span style="
                      position:absolute;top:4px;right:4px;
                      background:rgba(0,0,0,0.65);color:#fff;
                      font-size:11px;font-weight:bold;
                      padding:2px 6px;border-radius:10px;
                      pointer-events:none;">
                      <i class="fas fa-camera" style="font-size:9px;margin-right:2px;"></i>${displayNum}
                   </span>`
            : ''}
        </div></div>`;
}

function handleImageClick(container) {
    currentContainer = container;
    currentMaPhuLuc = container.getAttribute('data-row-key');

    const rowIndex = parseInt(container.getAttribute('data-row-index'));
    const columnField = container.getAttribute('data-column-field');

    const grid = $("#grvPhuLieuKiem").dxDataGrid('instance');
    const rowData = grid.getDataSource().items()[rowIndex];

    if (!rowData) { ViewImage(); return; }


    const imgs = rowData[columnField]?.imgs || [];
    const serverImg = rowData[columnField]?.img || '';

    if (imgs.length > 0 || serverImg) {
        ViewImage();
    } else {
        ViewImage();
    }
}

function addImageToGrid(container, imageUrl) {
    if (!container || !imageUrl) return;

    const rowIndex = parseInt(container.getAttribute('data-row-index'));
    const columnField = container.getAttribute('data-column-field');

    const grid = $("#grvPhuLieuKiem").dxDataGrid('instance');
    const items = grid.getDataSource().items();
    const rowData = items[rowIndex];

    if (!rowData || !rowData[columnField]) {
        console.error('❌ addImageToGrid: không tìm thấy rowData', { rowIndex, columnField });
        return;
    }

    if (!Array.isArray(rowData[columnField].imgs)) {
        rowData[columnField].imgs = [];
    }

    rowData[columnField].imgs.push(imageUrl);
    const imgs = rowData[columnField].imgs;
    grid.cellValue(rowIndex, columnField, rowData[columnField]);
    grid.repaint();

    let maxSTT = arrImageKiemPL.length > 0
        ? Math.max(...arrImageKiemPL.map(x => x.STT ?? 1))
        : 1;

    arrImageKiemPL.push({
        ID: 0,
        SoLoID: rowData.SoLoID,
        MaNPL: rowSelected_PL.MaNPL,
        Dot: rowSelected_PL.Dot || "1",
        MaPhuLucKiem: rowData.MaPhuLuc,
        Image: imageUrl,
        STT: maxSTT + 1


    })

    setTimeout(() => {
        const newContainer = document.querySelector(
            `.camera-image-container[data-row-index="${rowIndex}"][data-column-field="${columnField}"]`
        );
        if (newContainer) {
            currentContainer = newContainer;
        }
        _refreshCaptureCounter(rowIndex, columnField);
    }, 50);
}

function _updateCellDOM(container, imgs) {
    if (!imgs || imgs.length === 0) {
        container.innerHTML = '<i class="fas fa-camera"></i>';
        container.classList.remove('has-image');
        return;
    }
    // ← ảnh mới nhất
    const latestImg = imgs[imgs.length - 1];

    container.classList.add('has-image');
    container.innerHTML = `
        <img src="${latestImg}" alt="Captured" class="img-fluid rounded"
             style="width:100%;height:100%;object-fit:contain;">
        <span style="
            position:absolute;top:4px;right:4px;
            background:rgba(0,0,0,0.65);color:#fff;
            font-size:11px;font-weight:bold;
            padding:2px 6px;border-radius:10px;
            pointer-events:none;">
            <i class="fas fa-camera" style="font-size:9px;margin-right:2px;"></i>${imgs.length}
        </span>`;
}
function _refreshCaptureCounter(rowIndex, columnField) {
    const el = document.getElementById('captureCount');
    if (!el) return;

    if (rowIndex === undefined && currentContainer) {
        rowIndex = parseInt(currentContainer.getAttribute('data-row-index'));
        columnField = currentContainer.getAttribute('data-column-field');
    }

    const grid = $("#grvPhuLieuKiem").dxDataGrid('instance');
    const rowData = grid.getDataSource().items()[rowIndex];
    const count = rowData?.[columnField]?.imgs?.length || 0;

    el.textContent = `Đã chụp: ${count} ảnh`;
}

function deleteOneImage(index) {
    if (!currentContainer) return;

    const rowIndex = parseInt(currentContainer.getAttribute('data-row-index'));
    const columnField = currentContainer.getAttribute('data-column-field');

    const grid = $("#grvPhuLieuKiem").dxDataGrid('instance');
    const rowData = grid.getDataSource().items()[rowIndex];

    if (!rowData?.[columnField]?.imgs) return;

    /*  rowData[columnField].imgs.splice(index, 1);*/
    arrImageKiemPL = arrImageKiemPL.filter(x => x.STT != index);
    grid.cellValue(rowIndex, columnField, rowData[columnField]);
    grid.repaint();

    setTimeout(() => {
        const newContainer = document.querySelector(
            `.camera-image-container[data-row-index="${rowIndex}"][data-column-field="${columnField}"]`
        );
        if (newContainer) currentContainer = newContainer;
        _renderGalleryContent(rowIndex, columnField);
    }, 50);
}

function ConfirmDelete() {
    if (!currentContainer) return;

    const rowIndex = parseInt(currentContainer.getAttribute('data-row-index'));
    const columnField = currentContainer.getAttribute('data-column-field');

    const grid = $("#grvPhuLieuKiem").dxDataGrid('instance');
    const rowData = grid.getDataSource().items()[rowIndex];

    if (rowData?.[columnField]) {
        rowData[columnField].imgs = [];
        rowData[columnField].img = null;
        grid.cellValue(rowIndex, columnField, rowData[columnField]);
        grid.repaint();
    }

    closeGalleryModal();
    _refreshContainerFromGrid(rowIndex, columnField);
    const inst = bootstrap.Modal.getInstance(document.getElementById('modalDelete'));
    if (inst) inst.hide();
}

function _refreshContainerFromGrid(rowIndex, columnField) {
    setTimeout(() => {
        const container = document.querySelector(
            `.camera-image-container[data-row-index="${rowIndex}"][data-column-field="${columnField}"]`
        );
        if (!container) return;

        const grid = $("#grvPhuLieuKiem").dxDataGrid('instance');
        const rowData = grid.getDataSource().items()[rowIndex];
        const value = rowData?.[columnField] || {};
        const rowKey = container.getAttribute('data-row-key');
        const isDisabled = container.style.cursor === 'not-allowed';

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = buildCameraHtml(rowKey, rowIndex, columnField, value, isDisabled);


        const wrapper = container.closest('.camera-view-option');
        if (wrapper) {
            wrapper.replaceWith(tempDiv.firstElementChild);
        }

        currentContainer = document.querySelector(
            `.camera-image-container[data-row-index="${rowIndex}"][data-column-field="${columnField}"]`
        );
        _refreshCaptureCounter(rowIndex, columnField);
    }, 50);
}

function showOptionModal() {
    const el = document.getElementById('optionModal');
    if (!el) return console.error('Không tìm thấy #optionModal');
    new bootstrap.Modal(el, { backdrop: 'static', keyboard: false }).show();
}

function closeOptionModal() {
    const inst = bootstrap.Modal.getInstance(document.getElementById('optionModal'));
    if (inst) inst.hide();
}

async function openCamera() {
    closeOptionModal();

    const el = document.getElementById('cameraModal');
    if (!el) return console.error('Không tìm thấy #cameraModal');
    new bootstrap.Modal(el, { backdrop: 'static', keyboard: false }).show();

    _refreshCaptureCounter();

    const video = document.getElementById('video');
    try {
        if (currentStream) currentStream.getTracks().forEach(t => t.stop());

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const videoConfig = isMobile
            ? { facingMode: currentFacingMode, width: { ideal: 1420 }, height: { ideal: 1580 } }
            : { facingMode: currentFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } };

        currentStream = await navigator.mediaDevices.getUserMedia({ video: videoConfig });
        video.srcObject = currentStream;
    } catch (err) {
        alert('Không thể truy cập camera: ' + err.message);
    }
}

async function switchCamera() {
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    await openCamera();
}

function capturePhoto() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
    addImageToGrid(currentContainer, imageUrl);


    const flash = document.getElementById('captureFlash');
    if (flash) {
        flash.style.opacity = '1';
        setTimeout(() => flash.style.opacity = '0', 120);
    }
}

function closeCamera() {
    const inst = bootstrap.Modal.getInstance(document.getElementById('cameraModal'));
    if (inst) inst.hide();

    if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop());
        currentStream = null;
    }

    if (currentContainer) {
        const rowIndex = parseInt(currentContainer.getAttribute('data-row-index'));
        const columnField = currentContainer.getAttribute('data-column-field');

        setTimeout(() => {
            const newContainer = document.querySelector(
                `.camera-image-container[data-row-index="${rowIndex}"][data-column-field="${columnField}"]`
            );

            if (newContainer) {
                const grid = $("#grvPhuLieuKiem").dxDataGrid('instance');
                const rowData = grid.getDataSource().items()[rowIndex];
                const value = rowData?.[columnField] || {};
                const rowKey = newContainer.getAttribute('data-row-key');
                const isDisabled = newContainer.style.cursor === 'not-allowed';

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = buildCameraHtml(rowKey, rowIndex, columnField, value, isDisabled);


                const wrapper = newContainer.closest('.camera-view-option');
                if (wrapper) {
                    wrapper.replaceWith(tempDiv.firstElementChild);
                }

                currentContainer = document.querySelector(
                    `.camera-image-container[data-row-index="${rowIndex}"][data-column-field="${columnField}"]`
                );
            }
        }, 50);
    }
}

function ViewImage() {
    closeOptionModal();
    showGalleryModal();
}

function showGalleryModal() {
    if (!currentContainer) return;

    const rowIndex = parseInt(currentContainer.getAttribute('data-row-index'));
    const columnField = currentContainer.getAttribute('data-column-field');
    const grid = $("#grvPhuLieuKiem").dxDataGrid('instance');
    const rowData = grid.getDataSource().items()[rowIndex];
    // Cập nhật tiêu đề
    const titleEl = document.getElementById('galleryModalTitle');
    if (titleEl) titleEl.textContent = `${rowData.PhuLuc}`;

    _renderGalleryContent(rowIndex, columnField);

    const el = document.getElementById('galleryModal');
    if (!el) return console.error('Không tìm thấy #galleryModal');

    const existing = bootstrap.Modal.getInstance(el);
    if (existing) { existing.show(); return; }
    new bootstrap.Modal(el, { backdrop: 'static', keyboard: false }).show();
}

function _renderGalleryContent(rowIndex, columnField) {
    const wrap = document.getElementById('galleryContainer');
    if (!wrap) return;

    const grid = $("#grvPhuLieuKiem").dxDataGrid('instance');
    const rowData = grid.getDataSource().items()[rowIndex];


    let imgs = arrImageKiemPL.filter(x => x.MaNPL == rowSelected_PL.MaNPL && x.Dot == rowSelected_PL.Dot && x.SoLoID == rowData.SoLoID && x.MaPhuLucKiem == rowData.MaPhuLuc) || [];


    const countEl = document.getElementById('galleryCount');
    if (countEl) countEl.textContent = `${imgs.length} ảnh`;

    if (imgs.length === 0) {
        wrap.innerHTML = `
            <div style="text-align:center;padding:40px;color:#adb5bd;width:100%;">
                <i class="fas fa-image fa-2x mb-2 d-block"></i>
                Chưa có ảnh nào
            </div>`;
        return;
    }

    wrap.innerHTML = imgs.map((src, i) => `
        <div style="position:relative;display:inline-block;margin:4px;flex-shrink:0;">
            <img src="${src.Image}"
                 style="width:130px;height:98px;object-fit:cover;
                        border-radius:6px;border:1px solid #dee2e6;
                        cursor:pointer;display:block;"
                 onclick="viewFullImage('${src.Image}')"
                 alt="Ảnh ${i + 1}">
            <button onclick="deleteOneImage(${src.STT})"
                title="Xóa ảnh này"
                style="position:absolute;top:3px;right:3px;
                       background:rgba(163,45,45,0.9);border:none;
                       color:#fff;border-radius:50%;
                       width:22px;height:22px;font-size:11px;
                       cursor:pointer;display:flex;
                       align-items:center;justify-content:center;
                       padding:0;line-height:1;">
                <i class="fas fa-times"></i>
            </button>
            <div style="position:absolute;bottom:4px;left:5px;
                        background:rgba(0,0,0,0.55);color:#fff;
                        font-size:10px;padding:1px 5px;border-radius:4px;">
                ${i + 1}/${imgs.length}
            </div>
        </div>`).join('');
}

function closeGalleryModal() {
    const inst = bootstrap.Modal.getInstance(document.getElementById('galleryModal'));
    if (inst) inst.hide();
}

function showDeleteAllConfirm() {
    closeGalleryModal();
    const el = document.getElementById('modalDelete');
    if (!el) return;
    new bootstrap.Modal(el).show();
}

function viewFullImage(src) {
    const win = window.open('', '_blank');
    win.document.write(`
        <html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;">
        <img src="${src}" style="max-width:100%;max-height:100vh;object-fit:contain;">
        </body></html>`);
}

function selectFromGallery() {
    closeOptionModal();
    var maxSTT = arrImageKiemPL.length > 0
        ? Math.max(...arrImageKiemPL.map(x => x.STT ?? 1))
        : 1;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;

    fileInput.onchange = function (e) {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const rowIndex = parseInt(currentContainer.getAttribute('data-row-index'));
        const columnField = currentContainer.getAttribute('data-column-field');

        let loaded = 0;
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = function (ev) {
                loaded++;
                const isLast = loaded === files.length;

                const grid = $("#grvPhuLieuKiem").dxDataGrid('instance');
                const rowData = grid.getDataSource().items()[rowIndex];

                if (!rowData || !rowData[columnField]) return;
                maxSTT++;
                arrImageKiemPL.push({
                    ID: 0,
                    SoLoID: rowData.SoLoID,
                    MaNPL: rowSelected_PL.MaNPL,
                    Dot: rowSelected_PL.Dot || "1",
                    MaPhuLucKiem: rowData.MaPhuLuc,
                    Image: ev.target.result,
                    STT: maxSTT + 1
                });

                if (!Array.isArray(rowData[columnField].imgs)) {
                    rowData[columnField].imgs = [];
                }
                rowData[columnField].imgs.push(ev.target.result);
                grid.cellValue(rowIndex, columnField, rowData[columnField]);

                if (isLast) {
                    setTimeout(() => {
                        const newContainer = document.querySelector(
                            `.camera-image-container[data-row-index="${rowIndex}"][data-column-field="${columnField}"]`
                        );

                        if (newContainer) {
                            const grid = $("#grvPhuLieuKiem").dxDataGrid('instance');
                            const rowData = grid.getDataSource().items()[rowIndex];
                            const value = rowData?.[columnField] || {};
                            const rowKey = newContainer.getAttribute('data-row-key');

                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = buildCameraHtml(rowKey, rowIndex, columnField, value, false);


                            const wrapper = newContainer.closest('.camera-view-option');
                            if (wrapper) {
                                wrapper.replaceWith(tempDiv.firstElementChild);
                            }

                            currentContainer = document.querySelector(
                                `.camera-image-container[data-row-index="${rowIndex}"][data-column-field="${columnField}"]`
                            );
                            _refreshCaptureCounter(rowIndex, columnField);
                        }
                    }, 50);
                }
            };
            reader.readAsDataURL(file);
        });
    };
    fileInput.click();
}

let currentIdx = 0;

let _keydownHandler = null;

function ViewImageFullScreen(container) {
    currentContainer = container;
    currentMaPhuLuc = container.getAttribute('data-row-key');
    const rowIndex = parseInt(container.getAttribute('data-row-index'));
    const grid = $("#grvPhuLieuKiem").dxDataGrid('instance');
    const rowData = grid.getDataSource().items()[rowIndex];

    document.getElementById("lb-title").textContent = rowData.PhuLuc || "";

    const el = document.getElementById('lightbox');
    if (!el) return;

    if (!window._lightboxModal) {
        window._lightboxModal = new bootstrap.Modal(el);
    }
    window._lightboxModal.show();

    currentIdx = 0;
    renderStrip();
    showImage(0);
}

function getImgsForCurrentRow() {
    const rowIndex = parseInt(currentContainer.getAttribute('data-row-index'));
    const grid = $("#grvPhuLieuKiem").dxDataGrid('instance');
    const rowData = grid.getDataSource().items()[rowIndex];
    return arrImageKiemPL.filter(x =>
        x.MaNPL == rowSelected_PL.MaNPL &&
        x.Dot == rowSelected_PL.Dot &&
        x.SoLoID == rowData.SoLoID &&
        x.MaPhuLucKiem == rowData.MaPhuLuc
    );
}

function renderStrip() {
    const imgs = getImgsForCurrentRow();
    const strip = document.getElementById("lb-strip");
    if (!strip) return;

    strip.innerHTML = "";
    imgs.forEach((item, i) => {
        const thumb = document.createElement("div");
        thumb.className = "lb-strip-thumb" + (i === 0 ? " active" : "");
        thumb.dataset.idx = i;

        const img = document.createElement("img");
        img.src = item.Image;
        img.alt = item.MaPhuLuc || "";
        img.loading = "lazy";   // lazy load thumbnail

        thumb.appendChild(img);
        thumb.addEventListener("click", () => showImage(i));
        strip.appendChild(thumb);
    });
}

function showImage(idx) {
    resetTransform();
    const imgs = getImgsForCurrentRow();
    if (!imgs.length || idx < 0 || idx >= imgs.length) return;

    currentIdx = idx;
    const item = imgs[idx];


    document.getElementById("lb-counter").textContent = `${idx + 1} / ${imgs.length}`;


    const btnPrev = document.getElementById("lb-prev");
    const btnNext = document.getElementById("lb-next");
    btnPrev.disabled = idx <= 0;
    btnNext.disabled = idx >= imgs.length - 1;


    const area = document.getElementById("lb-img-area");


    area.style.transition = "opacity 0.18s ease";
    area.style.opacity = "0";

    const img = new Image();
    img.style.maxWidth = "550px";
    img.style.maxHeight = "500px";
    img.style.objectFit = "contain";
    img.style.borderRadius = "6px";
    img.style.display = "block";
    img.style.boxShadow = "0 8px 40px rgba(0,0,0,.5)";

    img.onload = () => {
        area.innerHTML = "";
        area.appendChild(img);

        requestAnimationFrame(() => {
            area.style.opacity = "1";
        });

        if (idx + 1 < imgs.length) {
            const preload = new Image();
            preload.src = imgs[idx + 1].Image;
        }
    };

    img.onerror = () => {
        area.innerHTML = `<div class="lb-no-img">
            <div class="ni-num">!</div>
            <div class="ni-label">Không tải được ảnh</div>
        </div>`;
        area.style.opacity = "1";
    };

    img.src = item.Image;
    img.alt = (item.MaPhuLuc || "") + (item.STT || "");

    // ── Sync thumbnail strip ──
    document.querySelectorAll("#lb-strip .lb-strip-thumb").forEach((el, i) => {
        el.classList.toggle("active", i === idx);
        if (i === idx) {
            el.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
        }
    });

    // ── Gán sự kiện prev/next (chỉ 1 lần, dùng dataset để tránh trùng) ──
    if (!btnPrev.dataset.bound) {
        btnPrev.dataset.bound = "1";
        btnPrev.addEventListener("click", () => {
            if (currentIdx > 0) showImage(currentIdx - 1);
        });
        btnNext.addEventListener("click", () => {
            const imgs = getImgsForCurrentRow();
            if (currentIdx < imgs.length - 1) showImage(currentIdx + 1);
        });
    }

    // ── Keyboard navigation ──
    if (_keydownHandler) document.removeEventListener("keydown", _keydownHandler);
    _keydownHandler = (e) => {
        const lightbox = document.getElementById("lightbox");
        if (!lightbox || !lightbox.classList.contains("show")) return;
        const imgs = getImgsForCurrentRow();
        if (e.key === "Escape") window._lightboxModal.hide();
        if (e.key === "ArrowLeft" && currentIdx > 0) showImage(currentIdx - 1);
        if (e.key === "ArrowRight" && currentIdx < imgs.length - 1) showImage(currentIdx + 1);
    };
    document.addEventListener("keydown", _keydownHandler);
}

document.getElementById("lightbox")?.addEventListener("hidden.bs.modal", () => {
    resetTransform();
    if (_keydownHandler) {
        document.removeEventListener("keydown", _keydownHandler);
        _keydownHandler = null;
    }
});

function updateImageContainer(container, imageUrl) {

    if (imageUrl) {
        addImageToGrid(container, imageUrl);
    } else {

        const rowIndex = parseInt(container.getAttribute('data-row-index'));
        const columnField = container.getAttribute('data-column-field');
        const grid = $("#grvPhuLieuKiem").dxDataGrid('instance');
        const rowData = grid.getDataSource().items()[rowIndex];
        if (rowData?.[columnField]) {
            rowData[columnField].imgs = [];
            rowData[columnField].img = null;
            grid.cellValue(rowIndex, columnField, rowData[columnField]);
        }
        _updateCellDOM(container, []);
    }
}



// ── Zoom + Rotate + Drag ──
let zoomLevel = 1;
let rotateDeg = 0;
let panX = 0;   // vị trí kéo ngang
let panY = 0;   // vị trí kéo dọc
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let panStartX = 0;
let panStartY = 0;

const ZOOM_STEP = 0.25;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;

function applyTransform() {
    const img = document.querySelector("#lb-img-area img");
    if (!img) return;

    // Nếu zoom = 1 thì reset pan về giữa
    if (zoomLevel === 1) { panX = 0; panY = 0; }

    img.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel}) rotate(${rotateDeg}deg)`;
    img.style.cursor = isDragging ? "grabbing" : zoomLevel > 1 ? "grab" : "zoom-in";
    img.style.transition = isDragging ? "none" : "transform 0.2s ease";  // tắt transition khi drag cho mượt

    const btnIn = document.getElementById("lb-zoom-in");
    const btnOut = document.getElementById("lb-zoom-out");
    if (btnIn) btnIn.disabled = zoomLevel >= ZOOM_MAX;
    if (btnOut) btnOut.disabled = zoomLevel <= ZOOM_MIN;
}

function resetTransform() {
    zoomLevel = 1;
    rotateDeg = 0;
    panX = 0;
    panY = 0;
    isDragging = false;
    applyTransform();
}

// ── Bind nút zoom + rotate ──
(function bindButtons() {
    const btnIn = document.getElementById("lb-zoom-in");
    const btnOut = document.getElementById("lb-zoom-out");
    const btnLeft = document.getElementById("lb-rotate-left");
    const btnRight = document.getElementById("lb-rotate-right");

    if (btnIn && !btnIn.dataset.bound) {
        btnIn.dataset.bound = "1";

        btnIn.addEventListener("click", () => {
            zoomLevel = Math.min(ZOOM_MAX, zoomLevel + ZOOM_STEP);
            applyTransform();
        });
        btnOut.addEventListener("click", () => {
            zoomLevel = Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP);
            applyTransform();
        });
    }

    if (btnLeft && !btnLeft.dataset.bound) {
        btnLeft.dataset.bound = "1";

        btnLeft.addEventListener("click", () => {
            rotateDeg = (rotateDeg - 90 + 360) % 360;
            applyTransform();
        });
        btnRight.addEventListener("click", () => {
            rotateDeg = (rotateDeg + 90) % 360;
            applyTransform();
        });
    }
})();

// ── Scroll chuột để zoom ──
const imgArea = document.getElementById("lb-img-area");
if (imgArea && !imgArea.dataset.wheelBound) {
    imgArea.dataset.wheelBound = "1";

    imgArea.addEventListener("wheel", (e) => {
        e.preventDefault();
        zoomLevel = e.deltaY < 0
            ? Math.min(ZOOM_MAX, zoomLevel + ZOOM_STEP)
            : Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP);
        applyTransform();
    }, { passive: false });
}

// ── Drag để pan ảnh ──
if (imgArea && !imgArea.dataset.dragBound) {
    imgArea.dataset.dragBound = "1";

    // Mouse
    imgArea.addEventListener("mousedown", (e) => {
        if (zoomLevel <= 1) return;   // chỉ cho kéo khi đã zoom
        e.preventDefault();
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        panStartX = panX;
        panStartY = panY;
        applyTransform();
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        panX = panStartX + (e.clientX - dragStartX);
        panY = panStartY + (e.clientY - dragStartY);
        applyTransform();
    });

    window.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;
        applyTransform();
    });

    // Touch (mobile)
    imgArea.addEventListener("touchstart", (e) => {
        if (zoomLevel <= 1 || e.touches.length !== 1) return;
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
        panStartX = panX;
        panStartY = panY;
        applyTransform();
    }, { passive: true });

    window.addEventListener("touchmove", (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        e.preventDefault();
        panX = panStartX + (e.touches[0].clientX - dragStartX);
        panY = panStartY + (e.touches[0].clientY - dragStartY);
        applyTransform();
    }, { passive: false });

    window.addEventListener("touchend", () => {
        isDragging = false;
        applyTransform();
    });
}

// ── Reset khi đóng modal ──
document.getElementById("lightbox")?.addEventListener("hidden.bs.modal", () => {
    resetTransform();
    if (_keydownHandler) {
        document.removeEventListener("keydown", _keydownHandler);
        _keydownHandler = null;
    }
});


function isBase64Image(str) {
    if (!str) return false;
    return /^data:image\/[a-z]+;base64,/.test(str.trim());
}

function isUrlImage(str) {
    if (!str) return false;
    return /^https?:\/\//i.test(str.trim())
        || /^\//.test(str.trim())
        || /^\.\.?\//.test(str.trim());
}

function savePhuLieuKiem() {
    const grid = $("#grvPhuLieuKiem").dxDataGrid("instance");
    const dataSource = grid.getDataSource();
    const items = dataSource.items();

    if (!items || items.length === 0) {
        DevExpress.ui.dialog.alert('Không có dữ liệu để lưu', 'Thông báo');
        return;
    }

    const Key = rowSelected_PL.MaNPL;
    const colContentPL = `@MaNPL@${Key}`;
    const arrUpDatePhieu = [];
    const getFileName = `PL-${rowSelected_PL.SoLoID}-PL-${rowSelected_PL.MaNPL.replace(/@/g, "_")}`;
    let dataUpload = [];

    const maPhieuKiem = rowSelected_PL.MaPhieuKiem || null;
    const nguoiKiem = _userName || localStorage.getItem('username1');
    //alert(_userName +  localStorage.getItem('username1'))
    const maDonVi = rowSelected_PL.MaDVVT || "";
    const ghiChuChung = $("#txtDG_QC").val() || "";


    const canvas = document.getElementById("signQC");
    if (canvas) {
        dataUpload.push({
            img: canvas.toDataURL('image/png'),
            name: "signQC"
        });
    }

    $.each(items, function (index, item) {
        if (item.MaPhuLuc === "NONE") return;

        const cellData = item[colContentPL];
        if (!cellData) return;

        let content = "";
        let statusKiem = null;
        let img = "";
        let soMetThucTe = 0;
        let soCuon = 0;
        let isWash = null;
        let result = 0;
        let selected = $("input[name='result-kiem']:checked").val();

        if (selected === "pass") {
            result = 1;
        } else if (selected === "fail") {
            result = 0;
        }

        let maDonViTinh = maDonVi;

        switch (item.MaPhuLuc) {
            case 'PhuLucPL_14':

                content = "";
                soMetThucTe = parseFloat(cellData.SoMetThucTe) || null;
                soCuon = parseFloat(cellData.CuonThucTe) || null;
                img = cellData.img || "";
                statusKiem = null;
                /*   result = true;*/

                if (cellData.MaDVVT) {
                    maDonViTinh = cellData.MaDVVT;
                }
                break;
            case 'PhuLucPL_16':

                content = cellData.weightNote || "";
                img = cellData.img || "";
                isWash = cellData.IsWash || null;


                if (cellData.weightStatus === 1) {
                    statusKiem = 1;

                } else if (cellData.weightStatus === 0) {
                    statusKiem = 0;

                } else {
                    statusKiem = 2;

                }
                if (isWash === 2) {
                    statusKiem = 2;

                }
                break;
            case 'PhuLucPL_2':
            case 'PhuLucPL_3':
            case 'PhuLucPL_8':
            case 'PhuLucPL_9':
            case 'PhuLucPL_10':
            case 'PhuLucPL_11':
            case 'PhuLucPL_12':
            case 'PhuLucPL_13':
            case 'PhuLucPL_15':

                content = cellData.weightNote || "";
                img = cellData.img || "";


                if (cellData.weightStatus === 'pass') {
                    statusKiem = 1;

                } else if (cellData.weightStatus === 'fail') {
                    statusKiem = 0;

                } else if (cellData.weightStatus === 'no') {
                    statusKiem = 2;

                } else {
                    statusKiem = 2;

                }

                if (cellData.MaDVVT) {
                    maDonViTinh = cellData.MaDVVT;
                }
                break;


            case 'PhuLucPL_5':
                content = cellData.note || cellData.weightNote || "";
                img = cellData.img || "";
                statusKiem = null;

                break;

            default:

                content = cellData.note || cellData.weightNote || "";
                img = cellData.img || "";
                statusKiem = null;



                if (cellData.MaDVVT) {
                    maDonViTinh = cellData.MaDVVT;
                }
                break;
        }

        var imgSave = img;

        if (isBase64Image(img)) {
            dataUpload.push({
                img: img || "",
                name: item.MaPhuLuc
            });
            imgSave = null
        }


        const kiemPLEntity = {
            MaPhuLuc: item.MaPhuLuc,
            MaPhieuKiem: maPhieuKiem,
            SoLoID: item.SoLoID || "",
            NgayKiem: formatDateSQL(new Date()),
            Content: content,
            StatusKiem: statusKiem,
            Img: imgSave,
            GhiChu: ghiChuChung,
            SoLot: rowSelected_PL.SoLoT || "",
            SoBatch: rowSelected_PL.Batch,
            MaVTID: rowSelected_PL.MaVTID || "",
            MauVTID: rowSelected_PL.MauVTID || "",
            MaCLVTID: rowSelected_PL.MaNhom,
            MaKhoVai: rowSelected_PL.KhoVaiID || "",
            MaNPL: Key,
            SoRoll: $("#selectSoRoll").val() || "",
            NguoiKiem: nguoiKiem,
            MaDonVi: maDonViTinh,
            SoMetThucTe: soMetThucTe,
            SoCuon: soCuon,
            Result: result,
            IsWash: isWash,
            Dot: rowSelected_PL.Dot,
            Is_SignQA_Mau: $("#ckSignTemplate_QC").is(":checked")
        };

        arrUpDatePhieu.push(kiemPLEntity);
    });

    if (arrUpDatePhieu.length === 0) {
        DevExpress.ui.dialog.alert('Không có dữ liệu hợp lệ để lưu', 'Thông báo');
        return;
    }
    $.ajax({
        async: false,
        url: `/api/QtyKiemPL/UploadImg?getFileName=${encodeURIComponent(getFileName)}`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(dataUpload),
        success: function (imagePaths) {

            console.log("imagePaths:", imagePaths);
            const findImage = (keyword) => {
                const found = imagePaths.find(p => {
                    if (typeof p === 'string') return p.includes(keyword);
                    if (typeof p === 'object' && p.name && p.url) return p.name.includes(keyword);
                    return false;
                });
                return typeof found === 'string' ? found : found?.url || null;
            };
            console.table(arrUpDatePhieu)

            arrUpDatePhieu.forEach(function (item) {
                item.SignQC = findImage('signQC')
                if (item.Img == null) {
                    item.Img = findImage(item.MaPhuLuc)

                }

            });



        },
        error: function (xhr, status, err) {
            DevExpress.ui.notify('Không thể lưu chữ ký. Vui lòng thử lại!', 'warning', 2000);
        }
    });
    SavePhieu(arrUpDatePhieu)
    SaveImageKiem();

}

function SavePhieu(arrUpDatePhieu) {
    try {
        fetch('/api/QtyKiemPL/Post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(arrUpDatePhieu),
        })
            .then(res => {
                if (!res.ok) {
                    return res.text().then(text => {
                        throw new Error(text || 'Lỗi server');
                    });
                }
                return res.json();
            })
            .then((result) => {
                DevExpress.ui.notify('Lưu thành công.', 'success', 1000);
                const Result = $("input[name='result-kiem']:checked").val();
                const filter = $("#filterTypeSelect").val();
                const module = 'M.26.00.00'
                const title = `Đã kiểm xong vật tư`
                const ItemCode = filter == "PO" || filter == "Supplier" ? $("#selectPL").val() : $('#btn-chon-vat-tu').val();
                const VatTu = $("#txt-mo-ta-npl").val();
                const SoLoID = filter == "PO" || filter == "Supplier" ? $("#selectSoLO option:selected").text() + `-Lần ${rowSelected_PL.Dot}` : $("#selectSoLobyVatTu option:selected").text();
                const detail = `${SoLoID}\nChủng loại: ${rowSelected_PL.ChungLoaiVatTu}\nVật tư: ${VatTu}\nItem Code: ${ItemCode}\nKết quả: <color=${Result.toUpperCase() == "PASS" ? "navy" : "red"}>${Result.toUpperCase()}</color>`
                const BoPhan = 'ALL'

                var arrayNotify = [];

                arrayNotify.push(
                    {
                        UserIDTao: _userName,
                        FrmName: module,
                        Title: title,
                        Detail: detail,
                        SendTo: "SX",
                        BoPhan: BoPhan,
                        Status: 1,
                        IsQLSX: 0,
                        MaPhieu: SoLoID
                    },
                    {
                        UserIDTao: _userName,
                        FrmName: module,
                        Title: title,
                        Detail: detail,
                        SendTo: "PKH",
                        BoPhan: BoPhan,
                        Status: -1,
                        IsQLSX: 0,
                        MaPhieu: SoLoID
                    },
                    {
                        UserIDTao: _userName,
                        FrmName: module,
                        Title: title,
                        Detail: detail,
                        SendTo: "QA",
                        BoPhan: BoPhan,
                        Status: 1,
                        IsQLSX: 0,
                        MaPhieu: SoLoID
                    }
                );

                sendNotifyMulti(arrayNotify)
                //rowSelected_PL["Status"] = arrUpDatePhieu[0]["Result"] == true || arrUpDatePhieu[0]["Result"] == 1 ? 3 : 2;

                $("#btn-refresh").click();
            })
            .catch(error => {

            });

    } catch (error) {
        console.error('❌ Lỗi exception:', error);

    }
}

function SaveImageKiem() {
    try {
        fetch('/api/QtyKiemPL/PostImage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(arrImageKiemPL),
        })


    } catch (error) {
        console.error('❌ Lỗi exception:', error);

    }
}

function ValidateDataBeforeSave() {
    const grid = $("#grvPhuLieuKiem").dxDataGrid("instance");
    const items = grid.getDataSource().items();

    let isValid = true;
    let errorMessage = "";



    const Key = rowSelected_PL.MaNPL;
    const colContentPL = `@MaNPL@${Key}`;

    $.each(items, function (index, item) {
        if (item.MaPhuLuc === "NONE") return;

        const cellData = item[colContentPL];


        if (item.MaPhuLuc === 'PhuLucPL_14') {
            if (!cellData.SoMetThucTe && !cellData.CuonThucTe) {
                isValid = false;
                errorMessage = `Dòng ${item.PhuLuc}: Vui lòng nhập số mét hoặc số cuộn`;
                return false; // break loop
            }
        }


        if (item.MaPhuLuc === 'PhuLucPL_16') {


            if (cellData.IsWash === 1 && (cellData.weightStatus === null || cellData.weightStatus === undefined)) {
                isValid = false;
                errorMessage = `Dòng ${item.PhuLuc}: Đã chọn Yes, vui lòng chọn Pass hoặc Fail`;
                return false;
            }
        }


        if (cellData.isCheck === true &&
            (item.MaPhuLuc === 'PhuLucPL_3' ||
                item.MaPhuLuc === 'PhuLucPL_8' ||
                item.MaPhuLuc === 'PhuLucPL_9' ||
                item.MaPhuLuc === 'PhuLucPL_10' ||
                item.MaPhuLuc === 'PhuLucPL_11' ||
                item.MaPhuLuc === 'PhuLucPL_12' ||
                item.MaPhuLuc === 'PhuLucPL_13'
            /*|| item.MaPhuLuc === 'PhuLucPL_15'*/)) {

            if (!cellData.weightStatus || cellData.weightStatus === 'none') {
                isValid = false;
                errorMessage = `${item.PhuLuc}: Vui lòng chọn Pass, Fail hoặc No`;
                return false;
            }
        }
    });

    return { isValid, errorMessage };
}

function SavePhieuWithValidation() {
    const validation = ValidateDataBeforeSave();

    if (!validation.isValid) {
        DevExpress.ui.dialog.alert(validation.errorMessage, 'Cảnh báo');
        return;
    }

    DevExpress.ui.dialog.confirm('Bạn có chắc chắn muốn lưu dữ liệu?', 'Xác nhận')
        .then(function (dialogResult) {
            if (dialogResult) {
                savePhuLieuKiem();
            }
        });
}

function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        SoLoID: params.get('SoLoID'),
        MaNPL: params.get('MaNPL'),
        isView: params.get('isView') === 'true' || params.get('isView') === '1'
    };
}

async function LoadDataFromUrl(urlParams) {
    try {
        GetSoLo();
        $('#selectSoLO').val(urlParams.SoLoID).trigger('change');

        const apiUrl = `/api/QtyKiemPL/Get?action=GetPhuLieuNK&para1=${urlParams.SoLoID}`;
        const response = await fetch(apiUrl);
        const dataPhuLieu = await response.json();

        fetchPhuLieu(dataPhuLieu);
        const selectedPL = dataPhuLieu.find(x => x.MaNPL === urlParams.MaNPL);
        //updateEditMode(true, urlParams.isView);
        if (selectedPL) {
            $("#selectPL").val(selectedPL.ItemCode);
            ResetVal('PL');
            rowSelected_PL = selectedPL;
            GetSoRoll(selectedPL.SoLoID, selectedPL.MaNPL);
            GetXacNhanKiem(selectedPL.SoLoID, selectedPL.MaNPL, rowSelected_PL.Dot);
            $("#txt-mo-ta-npl").val(selectedPL.TenPL);
            if (urlParams.SoRoll) {
                $('#selectSoRoll').val(urlParams.SoRoll).trigger('change');
                GetPhieuKiemPL($("#ngay-kiem").val(), selectedPL.SoLoID, selectedPL.MaNPL, urlParams.SoRoll, selectedPL.Dot);
            }
        } else {
            // DevExpress.ui.notify("Không tìm thấy Mã Phụ Liệu này trong Số Lô!", "warning", 3000);
        }
    } catch (error) {
        console.error("Lỗi khi load dữ liệu từ URL:", error);
        DevExpress.ui.notify("Có lỗi xảy ra khi load data từ URL", "error", 3000);
    }
}

$(document).on('select2:open', function () {
    setTimeout(function () {
        var searchInput = document.querySelector(
            '.select2-container--open .select2-search__field'
        );
        if (searchInput) {
            searchInput.focus();
        }
    }, 100);
});

$("#filterTypeSelect").on("change", function () {
    var FilterOption = $(this).val();
    $(".txtNhaCC-Container").show()
    if (FilterOption == "PO") {
        $(".kiem-vat-tu").hide();
        $(".kiem-po").show();
        $(".kiem-vat-tu-nha-cc").hide();
        GetSoLo();

    }
    else if (FilterOption == "Items") {
        $(".kiem-vat-tu").show();
        $(".kiem-po").hide();
        $("#btn-chon-vat-tu").val("");
        $("#selectSoLobyVatTu").empty();
        $(".kiem-vat-tu-nha-cc").hide();
    }
    else if (FilterOption == "Supplier") {
        $(".txtNhaCC-Container").hide()
        $(".kiem-vat-tu").hide();
        $(".kiem-po").show();
        $(".kiem-vat-tu-nha-cc").show();
        $(".container-so-po-kiem").hide();
        GetNhaCC()

    }
})

$("#btn-chon-vat-tu").on("click", function () {
    $("#select-kiem-by-vat-tu").click();
    GetVatTuKiem();


})

function GetVatTuKiem() {
    const loaderWrapper = document.getElementById('customLoaderWrapper');
    const progressBar = document.getElementById('customProgressBar');

    if (!loaderWrapper || !progressBar) {
        console.error("Thiếu phần tử customLoaderWrapper hoặc customProgressBar.");
        return;
    }

    // Hiện loader
    loaderWrapper.classList.add('active');
    progressBar.style.width = '0%';
    progressBar.setAttribute('data-percentage', '0%');

    let progress = 0;
    const interval = setInterval(() => {
        if (progress < 90) {
            progress++;
            progressBar.style.width = progress + '%';
            progressBar.setAttribute('data-percentage', progress + '%');
        }
    }, 30);

    const apiUrl = `/api/QtyKiemPL/Get?action=GetVatTuKiem&para1=NONE`;
    fetch(apiUrl, { method: "GET" })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            fetchVatTuKiem(data);



        })
        .catch(error => {
            DevExpress.ui.notify("Lỗi Kết Nối Mạng . Vui Lòng Thử Lại Sau", 'warning', 2000);
            fetchVatTuKiem([]);
        })
        .finally(() => {
            clearInterval(interval);
            progressBar.style.width = '100%';
            progressBar.setAttribute('data-percentage', '100%');

            setTimeout(() => {
                loaderWrapper.classList.remove('active');
                progressBar.style.width = '0%';
                progressBar.setAttribute('data-percentage', '100%');
            }, 800); // hiệu ứng fade-out
        });
}

function fetchVatTuKiem(data) {

    $("#gridItemKiem").dxDataGrid({
        dataSource: data.length == 0 ? [] : data,

        columns: [
            {
                dataField: "STT", caption: "STT", minWidth: 70, width: 70,
                sortIndex: 0, sortOrder: "asc"
            },
            {
                dataField: "ChungLoaiVatTu", caption: "ChungLoaiVatTu",
                sortIndex: 1, sortOrder: "asc",
                groupCellTemplate: function (cellElement, cellInfo) {

                    cellElement.html(`<span style="color: brown; font-weight: bold;">${cellInfo.data.key}</span>`);
                },
            },
            { dataField: "MaNhom", visible: false },
            { dataField: "MaNPL", visible: false },
            { dataField: "MaVTID", visible: false },
            { dataField: "ItemCode", caption: "ItemCode", minWidth: 90, width: 100 },
            { dataField: "TenPL", caption: "Mô Tả" },
            { dataField: "MauVTID", visible: false },
            { dataField: "MauVT", caption: "Màu VT", minWidth: 90, width: 100 },
            { dataField: "CodeColor", caption: "Code Color" },
            { dataField: "KhoVai", caption: "Khổ/Size", minWidth: 90, width: 100 },
            { dataField: "KhoVaiID", visible: false },
            { dataField: "SoLoT", visible: false },
            { dataField: "Batch", visible: false },
            { dataField: "SoLotView", caption: "Batch/LOT", minWidth: 90, width: 100 }
            //{ dataField: "SoLuong", caption: "SL", minWidth: 90, width: 100 },
            //{ dataField: "Dot", caption: "Đợt", visible: false, sortIndex: 1, sortOrder: "desc" },
            //{ dataField: "TenDot", caption: "Đợt", minWidth: 70, width: 70 },

        ],

        searchPanel: {
            visible: true,
            width: 240,
            placeholder: "Tìm kiếm...",
            highlightSearchText: true,
            searchVisibleColumnsOnly: false
        },
        filterRow: { visible: true },
        columnAutoWidth: true,
        selection: { mode: "single" },
        hoverStateEnabled: true,
        showBorders: true,
        showRowLines: true,
        showColumnLines: true,
        onOptionChanged: function (e) {
            if (e.name === "columns" && e.fullName.indexOf("groupIndex") > -1) {
                var grid = e.component;
                grid.columnOption("STT", "sortOrder", "asc");
            }
        },

        sorting: {
            mode: "multiple"
        },
        onContentReady: function (e) {
            e.component.columnOption("STT", "sortOrder", "asc");
        },
        onRowClick: function (eRow) {
            const selected = eRow.data;
            if (selected?.MaNPL) {
                $("#btn-chon-vat-tu").val(selected.ItemCode);
                ResetVal('PL');
                rowSelected_PL = selected;

                GetSoLobyVatTu(rowSelected_PL.MaNPL, rowSelected_PL.Dot)

                $("#txt-mo-ta-npl").val(selected.TenPL)
                const modalEl = document.getElementById('plModalbyVatTu');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();
            }
        },
    });


}

function GetSoLobyVatTu(MaNPL, Dot) {
    $.ajax({
        async: false,
        url: `/api/QtyKiemPL/Get?action=GetSoLoNKbyVatTu&para1=${MaNPL}&para2=${Dot}`,
        contentType: 'application/json;charset=utf-8',
        success: function (data) {

            if (data.length > 0) {
                arrSoLo = [...data]
                fetchSoLobyVatTu(data)
                fetchFormSection(data[0]);

            }

        }
    });
}

function fetchSoLobyVatTu(data) {
    $("#selectSoLobyVatTu").empty();

    $.each(data, function (index, item) {
        var clsStatus = 'val-level-0';
        if (item.Status == 1) {
            clsStatus = 'val-level-1';
        } else if (item.Status == 2) {
            clsStatus = 'val-level-2';
        }


        var option = new Option(item.SoLo, item.SoLoID, false, false);
        $(option).attr('data-class', clsStatus);
        $('#selectSoLobyVatTu').append(option);
    });


    $('#selectSoLobyVatTu').select2({
        templateResult: function (option) {
            if (!option.id) return option.text;

            var cls = $(option.element).data('class') || '';
            return $('<span class="' + cls + '">' + option.text + '</span>');
        },
        templateSelection: function (option) {
            if (!option.id) return option.text;

            var cls = $(option.element).data('class') || '';
            return $('<span class="' + cls + '">' + option.text + '</span>');
        }
    });
    if (data.length > 0) {
        $('#selectSoLobyVatTu').val(data[0].SoLoID).trigger('change');
    }


}

$('#selectSoLobyVatTu').on("change", function () {
    reloadPhuLieuGrid();
    const SoLoID = $('#selectSoLobyVatTu').val();
    rowSelected_PL["SoLoID"] = SoLoID;

    if (SoLoID) {
        const objSoLoSelected = arrSoLo.find(x => x.SoLoID == SoLoID);
        rowSelected_PL["Dot"] = objSoLoSelected.Dot;
        rowSelected_PL["Status"] = objSoLoSelected.StatusEdit
        rowSelected_PL["StatusEdit"] = objSoLoSelected.StatusEdit
        rowSelected_PL["SoLuong"] = objSoLoSelected.SoLuongThucTe
        fetchFormSection(objSoLoSelected)
        GetSoRoll(rowSelected_PL.SoLoID, rowSelected_PL.MaNPL);
        GetXacNhanKiem(rowSelected_PL.SoLoID, rowSelected_PL.MaNPL, rowSelected_PL.Dot)
        $("#check-kiem-100-persent").prop("checked", false);
    }
})

function GetNhaCC() {
    $.ajax({

        url: `/api/QtyKiemPL/Get?action=GetNhaCC`,
        contentType: 'application/json;charset=utf-8',
        success: function (data) {

            if (data.length > 0) {

                fetchNhaCC(data)


            }

        }
    });
}

function fetchNhaCC(data) {
    $("#selectNhaCungCap").empty();


    $.each(data, function (index, item) {

        var option = new Option(item.TenNhaCC, item.MaNhaCC, false, false);

        $('#selectNhaCungCap').append(option);
    });


    if (data.length > 0) {
        $('#selectNhaCungCap').val(data[0].MaNhaCC).trigger('change');
    }
}

$('#selectNhaCungCap').on("change", function () {

    const MaNhaCC = $('#selectNhaCungCap').val();
    GetSoLobyNhaCC(MaNhaCC)


})

function GetSoLobyNhaCC(MaNhaCC) {
    $.ajax({

        url: `/api/QtyKiemPL/Get?action=GetSoLoNK&para1=${MaNhaCC}`,
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            ResetVal('SoLo');
            if (data.length > 0) {
                arrSoLo = [...data]
                fetchSoLobyNhaCC(data)
                fetchFormSection(data[0]);
                $("#selectPL").val("")
            }

        }
    });
}

function fetchSoLobyNhaCC(data) {
    $("#selectSoLobyVatTuNhaCC").empty();

    $.each(data, function (index, item) {
        var clsStatus = 'val-level-0';
        if (item.Status == 1) {
            clsStatus = 'val-level-1';
        } else if (item.Status == 2) {
            clsStatus = 'val-level-2';
        }


        var option = new Option(item.SoLo, item.SoLoID, false, false);
        $(option).attr('data-class', clsStatus);
        $('#selectSoLobyVatTuNhaCC').append(option);
    });


    $('#selectSoLobyVatTuNhaCC').select2({
        templateResult: function (option) {
            if (!option.id) return option.text;

            var cls = $(option.element).data('class') || '';
            return $('<span class="' + cls + '">' + option.text + '</span>');
        },
        templateSelection: function (option) {
            if (!option.id) return option.text;

            var cls = $(option.element).data('class') || '';
            return $('<span class="' + cls + '">' + option.text + '</span>');
        }
    });


}

$('#selectSoLobyVatTuNhaCC').on("change", function () {
    const SoLoID = $('#selectSoLobyVatTuNhaCC').val();
    $("#selectPL").val("")
    ResetVal('PL');
    if (SoLoID) {

        const objSoLoSelected = arrSoLo.find(x => x.SoLoID == SoLoID);
        rowSelected_PL["SoLoID"] = SoLoID;
        fetchFormSection(objSoLoSelected)
        $("#check-kiem-100-persent").prop("checked", false);
    }
})

function setCamcelKiemPL() {
    $("#btn-cancel").hide()
    var UserName = _userName || localStorage.getItem('username1')
    if (UserName.toLocaleUpperCase() == "ADMIN" || UserName.toLocaleUpperCase() == "KCS" || UserName.toLocaleUpperCase() == "DIEMMY") {
        $("#btn-cancel").show();
    }

}

$("#btn-cancel").on("click", function () {
    var SoloId = "";
    const filter = $("#filterTypeSelect").val();
    if (filter == "PO") {
        SoloId = $("#selectSoLO").val();
    }
    else if (filter == "Items") {
        SoloId = $("#selectSoLobyVatTu").val();
    }

    const url = `/api/QtyKiemPL/Update?` +
        `action=setUpdateKiemPL&` +
        `para1=${encodeURIComponent(SoloId)}&` +
        `para2=${encodeURIComponent(rowSelected_PL.MaNPL)}&` +
        `para3=${encodeURIComponent(rowSelected_PL.Dot)}`

    $.ajax({
        url: url,
        type: "POST",
        contentType: false,
        processData: false,
        success: function (result) {
            DevExpress.ui.notify('Đã hủy vật tư.', 'success', 1000);
            $("#btn-refresh").click();
        },
        error: function (xhr, status, error) {
            console.error("Lỗi gửi thông báo:", error);
        }
    });

})

$("#btn-refresh").on("click", function () {
    reloadPhuLieuGrid();
    if (rowSelected_PL != null) {
        if (arrSoRoll.length > 0) {

            GetPhieuKiemPL($("#ngay-kiem").val(), rowSelected_PL.SoLoID, rowSelected_PL.MaNPL, arrSoRoll[0].SoKienHienThi, rowSelected_PL.Dot);
        } else {
            GetPhieuKiemPL($("#ngay-kiem").val(), rowSelected_PL.SoLoID, rowSelected_PL.MaNPL, "NONE", rowSelected_PL.Dot);
        }

        GetXacNhanKiem(rowSelected_PL.SoLoID, rowSelected_PL.MaNPL, rowSelected_PL.Dot);
    }
})

$("#btn-history").on("click", function () {
    window.location.assign("/QtyKiemPL/BCKiemPL");
});

async function GetSignTemplate() {

    try {
        const response = await fetch(`/api/QtyKiemPL/GET?action=GetSign&para1=${_userName}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        console.log(data[0].Img)
        SignalTemple = data[0].Img
        SignalTempleName = data[0].TenNV


    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
    }
}

$("#ckSignTemplate_QC").on("click", function () {
    const isChecked = $(this).is(":checked");
    const pad = signaturePads["signQC"];
    pad.clear();
    $("#txtQCName").text("");
    if (isChecked) {
        if (pad) {

            $("#txtQCName").text(SignalTempleName)
            pad.fromDataURL(SignalTemple);
        }


    }

});

$("#ckSignTemplate_QCManger").on("click", function () {
    const isChecked = $(this).is(":checked");
    const pad = signaturePads["signXN_KQ"];
    $("#txtQCManagerName").text("");
    pad.clear();
    if (isChecked) {
        if (pad) {

            pad.fromDataURL(SignalTemple);
            $("#txtQCManagerName").text(SignalTempleName);
        }


    }

});

$("#ckSignTemplate_Mer").on("click", function () {
    const isChecked = $(this).is(":checked");
    const pad = signaturePads["signMer"];
    pad.clear();
    $("#txtMerName").text("");
    if (isChecked) {
        if (pad) {

            pad.fromDataURL(SignalTemple);
            $("#txtMerName").text(SignalTempleName);
        }


    }

});

function confirmTBP_QC() {
    var UserName = _userName || localStorage.getItem('username1');
    const SoLO = $("#selectSoLO option:selected").text();
    $("#txt-comfirm-kiem").html(`${SoLO}`)
    const el = document.getElementById('modalComfirmSoLo');
    if (!el) return;

    loadDataFromAPI(`/api/QtyKiemPL/Get?action=CheckSignTBP_QA&para1=${UserName}`)
        .then(headerData => {
            if (headerData && headerData.length > 0) {

                new bootstrap.Modal(el).show();
            }
            else {
                DevExpress.ui.notify("Bạn chưa không phải trưởng BP nên không thể xác nhận", "warning", 3000);
                if (inst) inst.hide();
            }
        })
        .catch(error => {
            console.error('Error loading header:', error);
            /*   DevExpress.ui.notify("Không thể tải thông tin đơn hàng", "error", 3000);*/
        });


}

function ComfirmMer() {
    var UserName = _userName || localStorage.getItem('username1');
    const SoLO = $("#selectSoLO option:selected").text();
    $("#txt-comfirm-kiem-mer").html(`${SoLO}`)
    const el = document.getElementById('modalComfirmMer');
    if (!el) return;
    let result = null;
    let selected = $("input[name='result-kiem-mer']:checked").val();
    if (selected === "pass") {
        result = 1;
    } else if (selected === "fail") {
        result = 0;
    }
    if (result == null) {
        DevExpress.ui.notify(`Vui lòng chọn kết luận Pass/Fail cho vật tư ${rowSelected_PL.ItemCode} !`, 'warning', 3000);
        return;
    }
    loadDataFromAPI(`/api/QtyKiemPL/Get?action=CheckSignMer&para1=${UserName}`)
        .then(headerData => {
            if (headerData && headerData.length > 0) {

                new bootstrap.Modal(el).show();

            }
            else {
                DevExpress.ui.notify("Bạn chưa không phải Mer nên không thể xác nhận", "warning", 3000);
                if (inst) inst.hide();
            }
        })
        .catch(error => {
            console.error('Error loading header:', error);
            /*   DevExpress.ui.notify("Không thể tải thông tin đơn hàng", "error", 3000);*/
        });
    new bootstrap.Modal(el).show();
}

function ConfirmXNQCManager(action) {

    //const objSoLo = arrSoLo.find(x => x.SoLoID == $("#selectSoLO").val());
    const getFileName = `Sign-PL-${rowSelected_PL.SoLoID}`;
    let dataUpload = [];
    let arrUpDatePhieu = [];


    //const today = formatDateSQL(new Date());

    var objPhieuPLSave = {};
    objPhieuPLSave["MaNPL"] = rowSelected_PL.MaNPL
    objPhieuPLSave["SoLoID"] = rowSelected_PL.SoLoID;
    objPhieuPLSave["Dot"] = rowSelected_PL.Dot;
    objPhieuPLSave["Is_SignQA_Mau"] = $("#ckSignTemplate_QC").is(":checked");
    objPhieuPLSave["Is_SignQA_Manager_Mau"] = $("#ckSignTemplate_QCManger").is(":checked");;
    objPhieuPLSave["Is_SignQA_Mer_Mau"] = $("#ckSignTemplate_Mer").is(":checked");


    if (action == "PostXN_TBP") {
        objPhieuPLSave["GhiChu_TBP_QC"] = $("#txtDG_KQ").val();
        objPhieuPLSave["TPCL_ComfirmSign"] = null;
        objPhieuPLSave["Is_XN_SoLo"] = 1;
        objPhieuPLSave["UserSign_QC_Manager"] = _userName || localStorage.getItem('username1')


    }
    else if (action == "POSTXN_Mer") {

        let result = null;
        let selected = $("input[name='result-kiem-mer']:checked").val();

        if (selected === "pass") {
            result = 1;
        } else if (selected === "fail") {
            result = 0;
        }


        objPhieuPLSave["KQ_GiaiQuyet"] = $("#txtDG_Mer").val();
        objPhieuPLSave["KQ_GiaiQuyet_Sign"] = null;
        objPhieuPLSave["UserSign_Mer"] = _userName || localStorage.getItem('username1')
        objPhieuPLSave["Result_Mer"] = result
    }


    arrUpDatePhieu.push(objPhieuPLSave);


    for (const item of canvasIds) {
        const canvas = document.getElementById(item);
        if (canvas) {
            dataUpload.push({
                img: canvas.toDataURL('image/png'),
                name: item
            });
        }
    }


    $.ajax({
        url: `/api/QtyKiemPL/UploadImg?getFileName=${encodeURIComponent(getFileName)}`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(dataUpload),
        success: function (imagePaths) {
            console.log("imagePaths:", imagePaths);
            const findImage = (keyword) => {
                const found = imagePaths.find(p => {
                    if (typeof p === 'string') return p.includes(keyword);
                    if (typeof p === 'object' && p.name && p.url) return p.name.includes(keyword);
                    return false;
                });
                return typeof found === 'string' ? found : found?.url || null;
            };

            $.each(arrUpDatePhieu, function (index, item) {


                if (action == "PostXN_TBP") {

                    objPhieuPLSave["TPCL_ComfirmSign"] = findImage('signXN_KQ');;


                }
                else if (action == "POSTXN_Mer") {

                    objPhieuPLSave["KQ_GiaiQuyet_Sign"] = findImage('signMer');;
                }


            });


            SaveXacNhan_TBP(action, arrUpDatePhieu)

        },
        error: function (xhr, status, err) {
            DevExpress.ui.notify('Không thể lưu chữ ký. Vui lòng thử lại!', 'warning', 2000);
        }
    });

}

function SaveXacNhan_TBP(action, data) {
    fetch(`/api/QtyKiemPL/PostXN_DanhGia?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(res => res.ok ? res.json() : Promise.reject('Lỗi server'))
        .then(() => {
            DevExpress.ui.notify('Lưu thành công.', 'success', 1000);

            var inst = bootstrap.Modal.getInstance(document.getElementById('modalComfirmSoLo'));

            var Result = $("input[name='result-kiem']:checked").val();

            const filter = $("#filterTypeSelect").val();
            const module = 'M.26.00.00'
            var title = ``;
            if (action == "PostXN_TBP") {
                title = `TBP đã xác nhận hoàn thành kiểm`;
                inst = bootstrap.Modal.getInstance(document.getElementById('modalComfirmSoLo'));
            } else if (action == "POSTXN_Mer") {
                title = "Mer đã xác nhận vật tư";
                inst = bootstrap.Modal.getInstance(document.getElementById('modalComfirmMer'));
                Result = $("input[name='result-kiem-mer']:checked").val();
            }

            const ItemCode = filter == "PO" ? $("#selectPL").val() : $('#btn-chon-vat-tu').val();
            const VatTu = $("#txt-mo-ta-npl").val();
            const SoLoID = filter == "PO" ? $("#selectSoLO option:selected").text() + `- Lần ${rowSelected_PL.Dot}` : $("#selectSoLobyVatTu option:selected").text();
            const detail = `${SoLoID}\nChủng loại: ${rowSelected_PL.ChungLoaiVatTu}\nVật tư: ${VatTu}\nItem Code: ${ItemCode}\nKết quả: <color=${Result.toUpperCase() == "PASS" ? "navy" : "red"}>${Result.toUpperCase()}</color>`
            const BoPhan = 'ALL'

            var arrayNotify = [];

            arrayNotify.push(
                {
                    UserIDTao: _userName,
                    FrmName: module,
                    Title: title,
                    Detail: detail,
                    SendTo: "SX",
                    BoPhan: BoPhan,
                    Status: 1,
                    IsQLSX: 0,
                    MaPhieu: SoLoID
                },
                {
                    UserIDTao: _userName,
                    FrmName: module,
                    Title: title,
                    Detail: detail,
                    SendTo: "PKH",
                    BoPhan: BoPhan,
                    Status: -1,
                    IsQLSX: 0,
                    MaPhieu: SoLoID
                },
                {
                    UserIDTao: _userName,
                    FrmName: module,
                    Title: title,
                    Detail: detail,
                    SendTo: "QA",
                    BoPhan: BoPhan,
                    Status: 1,
                    IsQLSX: 0,
                    MaPhieu: SoLoID
                },
                {
                    UserIDTao: _userName,
                    FrmName: module,
                    Title: title,
                    Detail: detail,
                    SendTo: "Kho",
                    BoPhan: BoPhan,
                    Status: -1,
                    IsQLSX: 0,
                    MaPhieu: SoLoID
                }
            );

            sendNotifyMulti(arrayNotify)

            if (inst) inst.hide();
            GetXacNhanKiem(rowSelected_PL.SoLoID, rowSelected_PL.MaNPL, rowSelected_PL.Dot);
        })
        .catch(error => {
            DevExpress.ui.dialog.alert('Lưu thất bại: ' + error, 'Lỗi');
            $("#btn-close-signature").click()
        });
}

async function loadDataFromAPI(apiUrl) {
    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Data loaded:', data);

        return data;
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

function CheckPerminsionQCManager() {
    var UserName = _userName || localStorage.getItem('username1');
    loadDataFromAPI(`/api/QtyKiemPL/Get?action=CheckSignTBP_QA&para1=${UserName}`)
        .then(headerData => {
            if (headerData && headerData.length > 0) {


                setPermission("xac-nhan-tbp", true);
                $("#btnChange_KetLuanQC").show();
            }
            else {
                setPermission("xac-nhan-tbp", false);
                $("#btnChange_KetLuanQC").hide();
            }
        })
        .catch(error => {
            console.error('Error loading header:', error);
            /*   DevExpress.ui.notify("Không thể tải thông tin đơn hàng", "error", 3000);*/
        });

 
}

function CheckPerminsionMer() {
    var UserName = _userName || localStorage.getItem('username1');
    loadDataFromAPI(`/api/QtyKiemPL/Get?action=CheckSignMer&para1=${UserName}`)
        .then(headerData => {
            if (headerData && headerData.length > 0) {

                setPermission("xac-nhan-mer", true);
            }
            else {
                setPermission("xac-nhan-mer", false);
            }
        })
        .catch(error => {
            //console.error('Error loading header:', error);
            /*   DevExpress.ui.notify("Không thể tải thông tin đơn hàng", "error", 3000);*/
        });
}

function setPermission(className, hasPermission) {
    const selector = `.${className}`;

    if (hasPermission) {

        $(selector + " input[type='radio']").prop('disabled', false);
        $(selector + " textarea").prop('readonly', false);
        $(selector + " .btn-clear").prop('disabled', false);
        $(selector + " canvas").css('pointer-events', 'auto');

        $(selector).css({
            'opacity': '1',
            'cursor': 'default'
        });
    } else {

        $(selector + " input[type='radio']").prop('disabled', true);
        $(selector + " textarea").prop('readonly', true);
        $(selector + " .btn-clear").prop('disabled', true);
        $(selector + " canvas").css('pointer-events', 'none');

        $(selector).css({
            'opacity': '0.6',
            'cursor': 'not-allowed'
        });
    }
}

function CheckPerminsionQC(SoloID, MaNPL, Dot) {
    var UserName = _userName || localStorage.getItem('username1');
    loadDataFromAPI(`/api/QtyKiemPL/Get?action=CheckSignQA&para1=${UserName}&para2=${SoloID}&para3=${MaNPL}&para4=${Dot}`)
        .then(headerData => {
            if (headerData && headerData.length > 0) {

                $("#btn-save").show();
                setPermission("xac-nhan-qc", true);
            
            }
            else {
                setPermission("xac-nhan-qc", false);
                $("#btn-save").hide();
             
              
            }
        })
        .catch(error => {
            console.error('Error loading header:', error);
            /*   DevExpress.ui.notify("Không thể tải thông tin đơn hàng", "error", 3000);*/
        });
}

$('#btnChange_KetLuanQC').on('click', function () {
    var ConclusionQC = $("input[name='result-kiem']:checked").val();
    var note_TBPQC = $("#txtDG_KQ").val();

    $("#conclusion-edit-note").val('');
    $("#pass-conclusion-edit").prop("checked", false);
    $("#fail-conclusion-edit").prop("checked", false);

    if (ConclusionQC === "pass") {
        $("#pass-conclusion-edit").prop("checked", true);
        $("#fail-conclusion-edit").prop("checked", false);
    } else if (ConclusionQC === "fail") {
        $("#pass-conclusion-edit").prop("checked", false);
        $("#fail-conclusion-edit").prop("checked", true);
    } else {

        DevExpress.ui.dialog.alert("Chưa có kết luận QC.Vui lòng thử lại!!", 'Cảnh báo');
        return;
    }
    $("#conclusion-edit-note").val(note_TBPQC);
    $('#editConclusionModal').modal('show');
});

function EditConclusion() {
    var note_TBPQC = $("#conclusion-edit-note").val();
    if (!note_TBPQC || note_TBPQC == " ") {
        DevExpress.ui.dialog.alert("Vui lòng nhập ghi chú để thay đổi kết luận", 'Cảnh báo');
        return;
    }
    let result = 0;
    let selected = $("input[name='conclusion']:checked").val();
    if (selected === "pass") {
        result = 1;
    } else if (selected === "fail") {
        result = 0;
    }
    var arrUpDatePhieu = [];
    var objPhieuPLSave = {};
    objPhieuPLSave["MaNPL"] = rowSelected_PL.MaNPL
    objPhieuPLSave["SoLoID"] = rowSelected_PL.SoLoID;
    objPhieuPLSave["Dot"] = rowSelected_PL.Dot;
    objPhieuPLSave["GhiChu_TBP_QC"] = note_TBPQC ;
    objPhieuPLSave["UserSign_QC_Manager"] = _userName || localStorage.getItem('username1')
    objPhieuPLSave["Result"] = result
    arrUpDatePhieu.push(objPhieuPLSave);
    fetch(`/api/QtyKiemPL/PostXN_DanhGia?action=UpdateKetLuanQC`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arrUpDatePhieu)
    })
        .then(res => res.ok ? res.json() : Promise.reject('Lỗi server'))
        .then((msg) => {
            if (msg == "True") {
                DevExpress.ui.notify('Lưu thành công.', 'success', 1000);
                var Result = $("input[name='conclusion']:checked").val();

                const filter = $("#filterTypeSelect").val();
                const module = 'M.26.00.00'
                var title = ``;
                title = `TBP đã xác nhận kết quả kiểm`;


                const ItemCode = filter == "PO" ? $("#selectPL").val() : $('#btn-chon-vat-tu').val();
                const VatTu = $("#txt-mo-ta-npl").val();
                const SoLoID = filter == "PO" ? $("#selectSoLO option:selected").text() + `- Lần ${rowSelected_PL.Dot}` : $("#selectSoLobyVatTu option:selected").text();
                const detail = `${SoLoID}\nChủng loại: ${rowSelected_PL.ChungLoaiVatTu}\nVật tư: ${VatTu}\nItem Code: ${ItemCode}\nKết quả: <color=${Result.toUpperCase() == "PASS" ? "navy" : "red"}>${Result.toUpperCase()}</color>`
                const BoPhan = 'ALL'

                var arrayNotify = [];

                arrayNotify.push(
                    {
                        UserIDTao: _userName,
                        FrmName: module,
                        Title: title,
                        Detail: detail,
                        SendTo: "SX",
                        BoPhan: BoPhan,
                        Status: 1,
                        IsQLSX: 0,
                        MaPhieu: SoLoID
                    },
                    {
                        UserIDTao: _userName,
                        FrmName: module,
                        Title: title,
                        Detail: detail,
                        SendTo: "PKH",
                        BoPhan: BoPhan,
                        Status: -1,
                        IsQLSX: 0,
                        MaPhieu: SoLoID
                    },
                    {
                        UserIDTao: _userName,
                        FrmName: module,
                        Title: title,
                        Detail: detail,
                        SendTo: "QA",
                        BoPhan: BoPhan,
                        Status: 1,
                        IsQLSX: 0,
                        MaPhieu: SoLoID
                    },
                    {
                        UserIDTao: _userName,
                        FrmName: module,
                        Title: title,
                        Detail: detail,
                        SendTo: "Kho",
                        BoPhan: BoPhan,
                        Status: 1,
                        IsQLSX: 0,
                        MaPhieu: SoLoID
                    }
                );

                sendNotifyMulti(arrayNotify)
                $('#editConclusionModal').modal('hide');
            } 
            GetXacNhanKiem(rowSelected_PL.SoLoID, rowSelected_PL.MaNPL, rowSelected_PL.Dot);
            
           

          
        })
        .catch(error => {
            DevExpress.ui.dialog.alert('Lưu thất bại: ' + error, 'Lỗi');
            GetXacNhanKiem(selectedPL.SoLoID, selectedPL.MaNPL, rowSelected_PL.Dot);
        });

}

$("#check-edit-conclusion").on("click", function () {
    var msg = `Vật tư ${rowSelected_PL.ItemCode} - Lần ${rowSelected_PL.Dot} trưởng bộ phận đã thay đổi kết luận`
    DevExpress.ui.dialog.alert(msg, 'Thông báo');
})
function sendNotifyMulti(arrNotify) {

    const url = `/api/SendToNotification/PushMultiNotifications`
    $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(arrNotify),
        success: function (result) {
            console.log("Gửi thông báo thành công:", result);
        },
        error: function (xhr, status, error) {
            console.error("Lỗi gửi thông báo:", error);
        }
    });
}

function sendNotify(ModuleID, title, detail, sendTo, BoPhan = "ALL", Status = -1) {

    const url = `/api/SendToNotification/PushNotification?` +
        `UserIDTao=${encodeURIComponent(_userName)}&` +
        `ModuleID=${encodeURIComponent(ModuleID)}&` +
        `Title=${encodeURIComponent(title)}&` +
        `Detail=${encodeURIComponent(detail)}&` +
        `SendTo=${encodeURIComponent(sendTo)}&` +
        `BoPhan=${encodeURIComponent(BoPhan)}&` +
        `Status=${encodeURIComponent(Status)}`;
    $.ajax({
        url: url,
        type: "POST",
        contentType: false,
        processData: false,
        success: function (result) {

        },
        error: function (xhr, status, error) {

        }
    });
}

$(document).ready(async function () {
    InitComponent();
    $("#selectSoLO").select2();
    $('#selectSoLobyVatTuNhaCC').select2()
    $('#selectNhaCungCap').select2()
    GetDonViTinh();
    await GetSignTemplate();
    $("#filterTypeSelect").val('PO').trigger('change');
    //const urlParams = getUrlParams();
    //if (urlParams.SoLoID && urlParams.MaNPL) {
    //    await LoadDataFromUrl(urlParams);
    //} else {
    //    GetSoLo();
    //}
    GetSoLo()
    setCamcelKiemPL();
    CheckPerminsionMer();
    CheckPerminsionQCManager();
});

