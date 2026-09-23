var currentStream = null;
var currentContainer = null;
var currentFacingMode = 'environment'; // 'environment' (sau) hoặc 'user' (trước)
var imageData = {};
var fieldDelete = null;

var arrPhuLieu = new Array();
var arrSoLo = new Array();
var arrPhuLucHasUnit = [{ MaPhuLuc: "PhuLucPL_5" }, { MaPhuLuc: "PhuLucPL_6" },
{ MaPhuLuc: "PhuLucPL_7" }, { MaPhuLuc: "PhuLucPL_14" }]
var arrDonViVatTu = [];
var today = formatDateSQL(new Date());

var SignalTemple = "";
var arrImageKiemPL = [];

var rowSelected_PL = null;

function ResetVal(selector) {
    currentStream = null;
    currentContainer = null;
    currentFacingMode = 'environment'; // 'environment' (sau) hoặc 'user' (trước)
    imageData = {};
    fieldDelete = null;
    if (selector == 'SoLo') {
        arrPhuLieu = new Array();
        arrSoLo = new Array();
        rowSelected_PL = null;
    } else if (selector == 'PL') {
        rowSelected_PL = null;
    }



}

function GetDonViTinh() {
    $.ajax({
        /* async: false,*/
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
    $("#selectSoLO").select2();
    $("input[type=radio]").css("pointer-events", "none");
    //$("textarea").prop("readonly", true);
}


//window.addEventListener('resize', InitComponent);
//window.addEventListener('load', InitComponent);


function GetSoLo() {
    $.ajax({
        url: `/api/QtyKiemPL/Get?action=GetSoLoBC`,
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            ResetVal('SoLo');
            if (data.length > 0) {
                arrSoLo = [...data]
                fetchSoLo(data)
                fetchFormSection(data[0]);
                GetPhieuKiemPL(data[0].SoLoID);
                GetXacNhanKiem(data[0].MaPhieuKiem, data[0].SoLoID)
            }
            else {
                reloadPhuLieuGrid();
                fetchFormSection(null)
            }

        }
    });
}

function GetSoLoByDateRange(fromDate, toDate) {
    $.ajax({
        url: `/api/QtyKiemPL/Get?action=GetSoLoBCTheoNgay&para1=${fromDate}&para2=${toDate}`,
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            ResetVal('SoLo');
            if (data.length > 0) {
                arrSoLo = [...data];
                fetchSoLo(data);
                if (data.length > 0) {
                    fetchFormSection(data[0]);
                    GetPhieuKiemPL(data[0].SoLoID);
                    GetXacNhanKiem(data[0].MaPhieuKiem, data[0].SoLoID)
                }
            }
            else {
                reloadPhuLieuGrid();
                fetchFormSection(null)

            }
        },
        error: function (error) {
            console.error('Error GetSoLoByDateRange:', error);
            alert('Lỗi khi tải dữ liệu theo ngày');
        }
    });
}

function fetchSoLo(data) {
    $('#selectSoLO').empty();
    $.each(data, function (index, item) {
        $('#selectSoLO').append(
            `<option value="${item.SoLoID}">${item.SoLo}</option>`
        );
    });
    if (data.length > 0) {
        $('#selectSoLO').val(data[0].SoLoID)
    }
}

$('#selectSoLO').on("change", function () {
    const SoLoID = $('#selectSoLO').val();

    if (SoLoID) {
        const objSoLoSelected = arrSoLo.find(x => x.SoLoID == SoLoID);
        //GetPhuLieu(SoLoID);
        fetchFormSection(objSoLoSelected)
        GetPhieuKiemPL(SoLoID);
        GetXacNhanKiem(objSoLoSelected.MaPhieuKiem, objSoLoSelected.SoLoID)
    }
})

function fetchFormSection(SoLo_infor) {
    $("#txt-khach-hang").val(SoLo_infor ? SoLo_infor.TenKH : "" || "");
    $("#txt-nha-cc").val(SoLo_infor ? SoLo_infor.TenNCC : "" || "");
    $("#ngay-nhap-kho").val(SoLo_infor ? formatDateView(SoLo_infor.NgayNK) : "" || "");
}

function GetXacNhanKiem(MaKiem, SoLoID) {

    $("#ckSignTemplate_QC").prop("checked", false);
    $("#ckSignTemplate_QCManger").prop("checked", false);
    $("#ckSignTemplate_Mer").prop("checked", false);


    $("#txtDG_QC").val("");
    $("#txtDG_Mer").val("");
    $("#txtDG_KQ").val("");

    $("#KQPass").prop("checked", false);
    $("#KQFail").prop("checked", false);
    canvasIds.forEach(id => {
        const pad = signaturePads[id];
        if (pad) {
            pad.clear();
        }
    })
    $.ajax({
        url: `/api/QtyKiemPL/Get?action=GetXN_PL&para1=${SoLoID}&para2=ALL&para3=ALL`,
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (data.length > 0) {
                fetchXacNhanKiem(data)
            }


        }
    });
}

function fetchXacNhanKiem(data) {
    const ItemQC = data.reduce((max, item) => {
        const maxDate = max.NgayKiem_Fail ? new Date(max.NgayKiem_Fail) : new Date(0);
        const itemDate = item.NgayKiem_Fail ? new Date(item.NgayKiem_Fail) : new Date(0);
        return itemDate > maxDate ? item : max;
    }, data[0]);

    const ItemTBP = data.reduce((max, item) => {
        const maxDate = max.TPCL_ComfirmDate ? new Date(max.TPCL_ComfirmDate) : new Date(0);
        const itemDate = item.TPCL_ComfirmDate ? new Date(item.TPCL_ComfirmDate) : new Date(0);
        return itemDate > maxDate ? item : max;
    }, data[0]);

    const ItemMer = data.reduce((max, item) => {
        const maxDate = max.ReceivedInfo_Date ? new Date(max.ReceivedInfo_Date) : new Date(0);
        const itemDate = item.ReceivedInfo_Date ? new Date(item.ReceivedInfo_Date) : new Date(0);
        return itemDate > maxDate ? item : max;
    }, data[0]);


    const resultQC = getAllMin(data, "Result");
    const resultMer = getAllMin(data, "Result_Mer");

    if (resultQC == true || resultQC == 1) {
        $("#KQPass").prop("disabled", false).prop("checked", true);
        $("#KQFail").prop("checked", false);
    } else if (resultQC == false || resultQC == 0) {
        $("#KQPass").prop("checked", false);
        $("#KQFail").prop("checked", true);
    } else {
        $("#KQPass").prop("checked", false);
        $("#KQFail").prop("checked", false);
    }


    if (resultMer == true || resultMer == 1) {
        $("#KQFail_Mer").prop("checked", false);
        $("#KQPass_Mer").prop("checked", true);
    } else if (resultMer == false || resultMer == 0) {
        $("#KQFail_Mer").prop("checked", true);
        $("#KQPass_Mer").prop("checked", false);
    } else {
        $("#KQFail_Mer").prop("checked", false);
        $("#KQPass_Mer").prop("checked", false);
    }


    if (ItemQC.Is_SignQA_Mau === true || ItemQC.Is_SignQA_Mau === 1) {
        $("#ckSignTemplate_QC").prop("checked", true);

    } else if (ItemQC.Is_SignQA_Mau === false || ItemQC.Is_SignQA_Mau == 0) {
        $("#ckSignTemplate_QC").prop("checked", false);

    } else {

        $("#ckSignTemplate_QC").prop("checked", false);

    }

    if (ItemTBP.Is_SignQA_Manager_Mau === true || ItemTBP.Is_SignQA_Manager_Mau === 1) {
        $("#ckSignTemplate_QCManger").prop("checked", true);

    } else if (ItemTBP.Is_SignQA_Manager_Mau === false || ItemTBP.Is_SignQA_Manager_Mau == 0) {
        $("#ckSignTemplate_QCManger").prop("checked", false);

    } else {

        $("#ckSignTemplate_QCManger").prop("checked", false);

    }


    if (ItemMer.Is_SignQA_Mer_Mau === true || ItemMer.Is_SignQA_Mer_Mau === 1) {
        $("#ckSignTemplate_Mer").prop("checked", true);

    } else if (ItemMer.Is_SignQA_Mer_Mau === false || ItemMer.Is_SignQA_Mer_Mau == 0) {
        $("#ckSignTemplate_Mer").prop("checked", false);

    } else {

        $("#ckSignTemplate_Mer").prop("checked", false);

    }



    $("#txtDG_QC").val(ItemQC.GhiChu_QC || '');
    $("#txtDG_Mer").val(ItemMer.GhiChu_Mer || '');
    $("#txtDG_KQ").val(ItemTBP.GhiChu_TBP_QC || '');

    $("#txtQCName").text(ItemQC.QCName || " ");
    $("#txtQCManagerName").text(ItemTBP.QCManager || " ");
    $("#txtMerName").text(ItemMer.MerName || " ");


    const signMap = {
        'signQC': ItemQC.Sign_Pass,
        'signMer': ItemMer.KQ_GiaiQuyet_Sign,
        'signXN_KQ': ItemTBP.TPCL_ComfirmSign,

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

const getAllMin = (arr, col) => {
    const values = arr
        .map(item => item[col])
        .filter(v => v !== null && v !== undefined);
    return values.length ? Math.min(...values) : null;
};


function reloadPhuLieuGrid() {
    fetchPhieuKiemPL([])
    var $grid = $("#grvPhuLieuKiem");
    if ($grid.data("dxDataGrid")) {
        var grid = $grid.dxDataGrid("instance");
        grid.getDataSource().reload();

    }
    $("#txtDG_QC").val("");
    $("#txtDG_Mer").val("");
    $("#txtDG_KQ").val("");

    $("#KQPass").prop("checked", false);
    $("#KQFail").prop("checked", false);

    canvasIds.forEach(id => {
        const pad = signaturePads[id];
        if (pad) {
            pad.clear();
        }
    })
    $("#selectSoLO").empty();

}

function GetPhieuKiemPL(SoLoID) {
    $.ajax({
        url: `/api/QtyKiemPL/Get?action=GetBC&para1=${SoLoID}`,
        contentType: 'application/json;charset=utf-8',
        success: function (data) {

            GetImageKiem(SoLoID).then(function () {

                $("#text-note").val();
                ResetVal('PL');
                if (data.length > 0) {
                    console.log(data)
                    fetchPhieuKiemPL(data)
                } else {
                    reloadPhuLieuGrid();
                }
            });



        }
    });
}

function GetImageKiem(SoLoID) {
    return $.ajax({
        url: `/api/QtyKiemPL/Get?action=GetImgKiemPL&para1=${SoLoID}&para2=ALL&para3=ALL`,
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            arrImageKiemPL = [];
            arrImageKiemPL = [...data];


        }
    });
}

function ParsePhuLieuFromString(data) {
    let arrPhuLieu = JSON.parse(JSON.stringify(data));

    $.each(arrPhuLieu, function (index, item) {

        if (item.STT === 0 || item.MaPhuLuc === "NONE") {
            item.STT = "";
        }


        Object.keys(item).forEach(function (key) {
            if (key.includes('@MaNPL@')) {
                const contentValue = item[key];
                let arrContentKiem = [];


                if (typeof contentValue === 'string' && contentValue) {
                    arrContentKiem = contentValue.split('@');
                }


                item[key + '_PARSED'] = ParseByMaPhuLuc(
                    item.MaPhuLuc,
                    arrContentKiem,
                    item
                );
            }
        });
    });

    return arrPhuLieu;
}

function ParseByMaPhuLuc(maPhuLuc, arrContent, item) {

    const IsHasUnit = arrPhuLucHasUnit.find(
        x => x.MaPhuLuc === maPhuLuc
    ) !== undefined;

    const dvvt = arrContent[3] == "@" || !arrContent[3] ? "" : arrContent[3].trim();
    const ObjectFind = !arrDonViVatTu || arrDonViVatTu.length == 0 ? "" : arrDonViVatTu.find(x => x.MaDVVT == dvvt);
    const defaultObj = {
        weightStatus: "",
        weightNote: "",
        img: "",
        isCheck: false,
        displayType: "text", // text | check | image | somet | wash,
        IsHasUnit: IsHasUnit,
        tenDVVT: ObjectFind ? ObjectFind.TenDVVT : ""
    };


    const note = arrContent[0] == "@" || !arrContent[0] ? "" : arrContent[0].trim();
    const status = arrContent[1] == "@" || !arrContent[1] ? "" : arrContent[1].trim();
    const img = arrContent[2] == "@" || !arrContent[2] ? "" : arrContent[2].trim();

    const soMet = arrContent[4] == "@" || !arrContent[4] ? "" : arrContent[4].trim();
    const cuon = arrContent[5] == "@" || !arrContent[5] ? "" : arrContent[5].trim();
    const isWash = arrContent[6] == "@" || !arrContent[6] ? "" : arrContent[6].trim();

    switch (maPhuLuc) {
        case 'PhuLucPL_1': // Chỉ có ảnh + note
            return {
                ...defaultObj,
                weightNote: note,
                img: img,
                displayType: "image"
            };
        case 'PhuLucPL_4': // Số Lot
        case 'PhuLucPL_5': // Số lượng
        case 'PhuLucPL_6': // Số lượng kiểm
        case 'PhuLucPL_7': // Khổ vải
            return {
                ...defaultObj,
                weightNote: note,
                displayType: "text"
            };
        case 'PhuLucPL_2': // Item Code - Pass/Fail/No
        case 'PhuLucPL_3': // Màu VT - Pass/Fail/No
        case 'PhuLucPL_8':  // Pass/Fail/No + Image
        case 'PhuLucPL_9':
        case 'PhuLucPL_10':
        case 'PhuLucPL_11':
        case 'PhuLucPL_12':
        case 'PhuLucPL_13':
        case 'NONE':
        case 'PhuLucPL_15':
            return {
                ...defaultObj,
                weightStatus: status || "none",
                weightNote: note,
                img: img,
                isCheck: true,
                displayType: "check"
            };

        case 'PhuLucPL_14': // Số mét thực tế + Số cuộn
            return {
                ...defaultObj,
                weightNote: `Tổng mét thực tế: ${soMet} | Số cuộn: ${cuon}`,
                soMet: soMet,
                cuon: cuon,
                dvvt: dvvt,
                displayType: "somet"
            };

        case 'PhuLucPL_16': // Wash test

            const washStatus = status === "pass" ? 1 : status === "fail" ? 0 : 2;
            return {
                ...defaultObj,
                weightStatus: washStatus,
                weightNote: ``,
                img: img,
                isCheck: true,
                isWash: isWash,
                displayType: "wash"
            };

        default:
            return {
                ...defaultObj,
                weightNote: note,
                displayType: "text"
            };
    }

}

function RenderCellHTML(parsedData, maPhuLuc, rowKey, rowIndex, columnField) {
    let html = '<div class="d-flex align-items-center h-100 px-2 py-2 gap-3">';
    const arrHasCamera = ["PhuLucPL_1", "PhuLucPL_8", "PhuLucPL_9", "PhuLucPL_10",
        "PhuLucPL_11", "PhuLucPL_12", "PhuLucPL_13", "PhuLucPL_15", "PhuLucPL_2", "PhuLucPL_3"];
    const hasCamera = arrHasCamera.includes(maPhuLuc);


    if (hasCamera || parsedData.displayType === "image") {
        //const imgHtml = parsedData.img
        //    ? `<img src="${parsedData.img}" class="preview-img rounded border shadow-sm" 
        //            style="height:58px; width:80px; object-fit:cover; cursor:pointer;" 
        //            onclick="handleImageView(this)">`
        //    : `<div class="preview-img bg-light border rounded d-flex align-items-center justify-content-center" 
        //            style="height:58px; width:80px;">
        //           <i class="fas fa-camera text-muted fs-5"></i>
        //       </div>`;
        const imgHtml = buildCameraHtml(rowKey, rowIndex, columnField, false)
        html += `<div class="flex-shrink-0">${imgHtml}</div>`;
    }


    if (parsedData.isCheck && parsedData.displayType !== "wash") {
        const currentStatus = (parsedData.weightStatus || '').toLowerCase();
        const passClass = currentStatus === 'pass' ? 'text-success fw-bold' : 'text-muted opacity-50';
        const failClass = currentStatus === 'fail' ? 'text-danger fw-bold' : 'text-muted opacity-50';
        const noClass = (currentStatus === 'no' || currentStatus === 'none' || !currentStatus)
            ? 'text-warning fw-bold' : 'text-muted opacity-50';
        html += `
    <div class="d-flex align-items-center gap-3 px-2 flex-shrink-0">
        <div class="d-flex align-items-center gap-1">
            <i class="fas fa-check-circle ${passClass}" style="font-size:1.1rem;"></i>
            <span class="${passClass}" style="font-size:0.9rem;">Pass</span>
        </div>
        <div class="d-flex align-items-center gap-1">
            <i class="fas fa-times-circle ${failClass}" style="font-size:1.1rem;"></i>
            <span class="${failClass}" style="font-size:0.9rem;">Fail</span>
        </div>
        ${maPhuLuc == "NONE" ? "" : `
        <div class="d-flex align-items-center gap-1">
            <i class="fas fa-minus-circle ${noClass}" style="font-size:1.1rem;"></i>
            <span class="${noClass}" style="font-size:0.9rem;">No</span>
        </div>`}
    </div>
`;


    }


    if (parsedData.displayType === "wash") {
        const washStatus = parseInt(parsedData.isWash);
        const isWashYes = washStatus === 1;
        const isWashNo = washStatus === 2;

        const currentStatus = parsedData.weightStatus;
        const passClass = currentStatus === 1 ? 'text-success fw-bold' : 'text-muted opacity-50';
        const failClass = currentStatus === 0 ? 'text-danger fw-bold' : 'text-muted opacity-50';

        html += `
            <div class="d-flex align-items-center gap-3 px-2 flex-shrink-0">
                <div class="d-flex align-items-center gap-1">
                    <i class="fas fa-${isWashYes ? 'check' : 'circle'}-circle text-${isWashYes ? 'success fw-bold' : 'muted opacity-50'}" 
                       style="font-size:1.1rem;"></i>
                    <span class="text-${isWashYes ? 'success fw-bold' : 'muted opacity-50'}" style="font-size:0.9rem;">Yes</span>
                </div>
                <div class="d-flex align-items-center gap-1">
                    <i class="fas fa-${isWashNo ? 'times' : 'circle'}-circle text-${isWashNo ? 'danger fw-bold' : 'muted opacity-50'}" 
                       style="font-size:1.1rem;"></i>
                    <span class="text-${isWashNo ? 'danger fw-bold' : 'muted opacity-50'}" style="font-size:0.9rem;">No</span>
                </div>
                ${!isWashNo ? `
                <div class="d-flex align-items-center gap-1">
                    <i class="fas fa-check-circle ${passClass}" style="font-size:1.1rem;"></i>
                    <span class="${passClass}" style="font-size:0.9rem;">Pass</span>
                </div>
                <div class="d-flex align-items-center gap-1">
                    <i class="fas fa-times-circle ${failClass}" style="font-size:1.1rem;"></i>
                    <span class="${failClass}" style="font-size:0.9rem;">Fail</span>
                </div>` : ''}
            </div>`;
    }


    if (parsedData.displayType !== "wash") {
        const noteValue = parsedData.weightNote || "";
        const noteHtml = noteValue
            ? `<span class="px-2" style="min-height:38px; font-size:0.9rem; color:#212529; white-space:pre-wrap; line-height:1.6;">${noteValue}</span>`
            : `<span class="text-muted text-center py-2" style="font-size:0.9rem;">—</span>`;

        html += `<span class="px-2 txt-pl" >${noteHtml}</span>`;
    }

    if (parsedData.IsHasUnit == true) {
        html += `<span class="txt-pl txt-dvt" >${parsedData.tenDVVT}</span>`;
    }

    html += '</div>';

    return html;
}


function buildCameraHtml(rowKey, rowIndex, columnField, isDisabled) {
    const parsedKey = columnField + '_PARSED';
    const keyParts = columnField.split('@MaNPL@');
    const Dot = keyParts[2]
    const MaNPL = keyParts[1]
    const SoLoID = $("#selectSoLO").val();

    const imgs = arrImageKiemPL.filter(x => x.MaPhuLucKiem === rowKey && x.Dot == Dot && x.MaNPL == MaNPL && SoLoID == SoLoID);
    const imgInfo = imgs[0];
    const serverImg = imgInfo?.Image || null;
    const serverNum = imgInfo?.NumImg || 0;
    const displayImg = imgs.length > 0 ? imgs[imgs.length - 1].Image : serverImg;
    const displayNum = imgs.length > 0 ? imgs.length : serverNum;
    const hasImg = !!displayImg;

    return `<div class="d-flex justify-content-center camera-view-option">
     
        <div class="camera-image-container imgweight${hasImg ? ' has-image' : ''}"
             data-field="weight"
            data-dot ="${Dot}"
            data-maNPL ="${MaNPL}"
             data-row-key="${rowKey}"
             data-row-index="${rowIndex}"
             data-column-field="${parsedKey}"
             style="cursor:${isDisabled ? 'not-allowed' : 'pointer'}; flex-shrink:0; position:relative;"
             onclick="${isDisabled ? '' : 'ViewImageFullScreen(this)'}">

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

function fetchPhieuKiemPL(data) {

    const parsedData = ParsePhuLieuFromString(data);

    const fixedColumns = [
        {
            dataField: "STT",
            caption: "STT",
            minWidth: 60,
            width: 60,
            alignment: "center"
        },
        {
            dataField: "PhuLuc",
            caption: "Nội Dung Kiểm",

            cssClass: "col-phu-luc"
        }
    ];


    const dynamicColumns = [];
    if (parsedData.length > 0) {
        const sampleRow = parsedData[0];
        Object.keys(sampleRow).forEach(key => {
            if (key.includes('@MaNPL@') && !key.includes('_PARSED')) {
                // Tách tên cột từ key (VD: ZM16BL1@MaNPL@MACLVT_48@MAVT_942...)
                const keyParts = key.split('@MaNPL@');


                dynamicColumns.push({
                    dataField: key,
                    caption: `Lần ${keyParts[2]}`,
                    cssClass: "col-phu-luc",
                    encodeHtml: false,
                    headerCellTemplate: function (container, info) {
                        const hasCheck = keyParts[3] == true;

                        $('<div>')
                            .css({
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%'
                            })
                            .append(
                                $('<span>').text(info.column.caption)
                            )
                            .append(
                                hasCheck
                                    ? $('<i>')
                                        .addClass('fa-solid fa-badge-check')
                                        .css({ marginLeft: 'auto', color: '#bcfd4c' })
                                    : ''
                            )
                            .appendTo(container);
                    },
                    cellTemplate: function (container, options) {
                        const parsedKey = options.column.dataField + '_PARSED';
                        const parsedValue = options.data[parsedKey];
                        const maPhuLuc = options.data.MaPhuLuc;
                        const rowKey = options.row.key;
                        const rowIndex = options.row.rowIndex;
                        const columnField = options.column.dataField;

                        if (parsedValue) {
                            const html = RenderCellHTML(parsedValue, maPhuLuc, rowKey, rowIndex, columnField);
                            $(container).html(html);
                        } else {
                            $(container).html('<div class="text-muted text-center">—</div>');
                        }
                    }
                });
            }
        });
    }

    const allColumns = [...fixedColumns, ...dynamicColumns];
    $("#grvPhuLieuKiem").dxDataGrid({
        dataSource: parsedData,
        keyExpr: "MaPhuLuc",
        noDataText: "Chưa có dữ liệU",
        columns: allColumns,
        allowColumnResizing: true,
        columnAutoWidth: true,
        showBorders: true,
        showRowLines: true,
        showColumnLines: true,
        editing: {
            allowUpdating: false,
            allowDeleting: false,
            allowAdding: false
        },
        paging: { enabled: false },
        filterRow: { visible: false },
        searchPanel: { visible: false },
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

            const noneRow = data.find(x => x.MaPhuLuc === "NONE");
            if (noneRow) {
                Object.keys(noneRow).forEach(key => {
                    if (key.includes('@MaNPL@')) {
                        const note = noneRow[key].split('@')[0];
                        if (note && note !== "@") {
                            $("#text-note-view").html(note);
                        }
                    }
                });
            }
        }
    });
}

function handleImageView(imgElement) {
    const imgSrc = $(imgElement).attr('src');
    if (imgSrc) {
        // Hiển thị modal Bootstrap để xem ảnh phóng to
        const modal = `
            <div class="modal fade" id="imageViewModal" tabindex="-1">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-image me-2"></i>Xem ảnh
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center bg-light p-4">
                            <img src="${imgSrc}" class="img-fluid rounded shadow" style="max-height:70vh; max-width:100%;">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-1"></i>Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;


        $('#imageViewModal').remove();


        $('body').append(modal);
        const modalInstance = new bootstrap.Modal(document.getElementById('imageViewModal'));
        modalInstance.show();

        $('#imageViewModal').on('hidden.bs.modal', function () {
            $(this).remove();
        });
    }
}

function ConfirmXNQCManager() {


    var grid = $("#grvPhuLieuKiem").dxDataGrid("instance");
    var dataSource = grid.getDataSource();
    var parsedData = dataSource.items();

    const objSoLo = arrSoLo.find(x => x.SoLoID == $("#selectSoLO").val());
    const getFileName = `Sign-PL-${objSoLo.SoLoID}`;
    let dataUpload = [];
    let arrUpDatePhieu = [];


    const today = formatDateSQL(new Date());
    if (parsedData.length > 0) {
        const sampleRow = parsedData[0];
        Object.keys(sampleRow).forEach(key => {
            if (key.includes('@MaNPL@') && !key.includes('_PARSED')) {

                const keyParts = key.split('@MaNPL@');
                var objPhieuPLSave = {};
                objPhieuPLSave["MaNPL"] = keyParts[0]
                objPhieuPLSave["SoLoID"] = objSoLo.SoLoID;
                objPhieuPLSave["Dot"] = keyParts[1];
                objPhieuPLSave["NgayKiem"] = today;
                objPhieuPLSave["NgayKiem_Pass"] = today;
                objPhieuPLSave["TPCL_ComfirmDate"] = today;
                objPhieuPLSave["NgayKiem_Fail"] = today;
                objPhieuPLSave["ReceivedInfo_Date"] = today;
                objPhieuPLSave["GhiChu_QC"] = $("#txtDG_QC").val();
                objPhieuPLSave["GhiChu_TBP_QC"] = $("#txtDG_KQ").val();
                objPhieuPLSave["GhiChu_Mer"] = $("#txtDG_Mer").val();
                objPhieuPLSave["KQ_GiaiQuyet_Sign"] = null;
                objPhieuPLSave["Sign_Pass"] = null;
                objPhieuPLSave["TPCL_ComfirmSign"] = null;
                objPhieuPLSave["Is_XN_SoLo"] = true;
                objPhieuPLSave["Is_SignQA_Mau"] = $("#ckSignTemplate_QC").is(":checked");
                objPhieuPLSave["Is_SignQA_Manager_Mau"] = $("#ckSignTemplate_QCManger").is(":checked");;
                objPhieuPLSave["Is_SignQA_Mer_Mau"] = $("#ckSignTemplate_Mer").is(":checked");;
                arrUpDatePhieu.push(objPhieuPLSave);

            }
        });
    }




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
                item["KQ_GiaiQuyet_Sign"] = findImage('signMer');
                item["Sign_Pass"] = findImage('signQC');
                item["TPCL_ComfirmSign"] = findImage('signXN_KQ');
            });




            SavePhieu(arrUpDatePhieu)

        },
        error: function (xhr, status, err) {
            DevExpress.ui.notify('Không thể lưu chữ ký. Vui lòng thử lại!', 'warning', 2000);
        }
    });

}

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

function SavePhieu(data) {
    fetch('/api/QtyKiemPL/PostXN_DanhGia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(res => res.ok ? res.json() : Promise.reject('Lỗi server'))
        .then(() => {
            DevExpress.ui.notify('Lưu thành công.', 'success', 1000);
            const inst = bootstrap.Modal.getInstance(document.getElementById('modalComfirmSoLo'));
            if (inst) inst.hide();



            const module = 'M.26.00.00'
            const title = `QC đã xác nhận hoàn thành kiểm`

            const SoLoID = $("#selectSoLO option:selected").text()
            const detail = `${SoLoID}`
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
                    Status: 0,
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

            sendNotifyMuti(arrayNotify)

        })
        .catch(error => {
            DevExpress.ui.dialog.alert('Lưu thất bại: ' + error, 'Lỗi');
            $("#btn-close-signature").click()
        });
}

$('#ngay-kiem').on('apply.daterangepicker', function (ev, picker) {
    $(this).val(picker.startDate.format('DD/MM/YYYY'));
});

$('#ngay-kiem').on('cancel.daterangepicker', function (ev, picker) {
    $(this).val(today); // hoặc '' nếu muốn xóa
});

/*Camera*/

// Click vào bất kỳ ảnh hoặc icon camera nào → mở preview
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
    const Dot = currentContainer.getAttribute('data-dot');
    const MaNPL = currentContainer.getAttribute('data-maNPL');
    return arrImageKiemPL.filter(x =>
        x.MaNPL == MaNPL &&
        x.Dot == Dot &&
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

    
    if (zoomLevel === 1) { panX = 0; panY = 0; }

    img.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel}) rotate(${rotateDeg}deg)`;
    img.style.cursor = isDragging ? "grabbing" : zoomLevel > 1 ? "grab" : "zoom-in";
    img.style.transition = isDragging ? "none" : "transform 0.2s ease"; 
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


if (imgArea && !imgArea.dataset.dragBound) {
    imgArea.dataset.dragBound = "1";

    
    imgArea.addEventListener("mousedown", (e) => {
        if (zoomLevel <= 1) return;   
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

$(document).on('click', '.preview-img', function () {
    const rowKey = $(this).data('row');        // MaPhuLuc
    const colField = $(this).data('col');      // 5011@MaNPL@MACLVT_118@...

    if (!rowKey || !colField) return;

    const grid = $("#grvPhuLieuKiem").dxDataGrid("instance");
    const rowData = grid.getDataSource().items().find(x => x.MaPhuLuc === rowKey);
    if (!rowData || !rowData[colField]) return;

    const imgUrl = rowData[colField].img || "";

    if (imgUrl) {
        const previewImg = document.getElementById('previewImage');
        previewImg.src = imgUrl;
        new bootstrap.Modal(document.getElementById('previewModal')).show();
    }
});

$("#btn-refresh").on("click", function () {
    const SoLoID = $('#selectSoLO').val();
    const objSoLoSelected = arrSoLo.find(x => x.SoLoID == SoLoID);
    //GetPhuLieu(SoLoID);
    fetchFormSection(objSoLoSelected)
    GetPhieuKiemPL(SoLoID);
    GetXacNhanKiem(objSoLoSelected.MaPhieuKiem, objSoLoSelected.SoLoID)
})

$("#btn-kiem-pl").on('click', function () {
    window.location.assign("/QtyKiemPL/PhieuKiem");
})

$("#btn-Excel").on("click", function () {

    const grid = $("#grvPhuLieuKiem").dxDataGrid('instance');
    const rowData = grid.getDataSource().items()[0];
    const SoLoID = $("#selectSoLO").val();

    var objSoLoSelected = arrSoLo.find(x => x.SoLoID == SoLoID);

    var url = `/api/QtyKiemPL/ExportBC`;

    const fileName = `${rowData.SoLo}-${rowData.NgayKiem}`

    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(objSoLoSelected),
    })
        .then(response => {
            if (!response.ok) {
                alert("Lỗi Không thể xuất excel . Vui lòng thử lại!")
                return;
            }

            return response.blob();
        })
        .then(blob => {
            var a = document.createElement("a");
            var url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error fetching data from the server.', error);
        });
})

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getStartOfWeek(year, week) {
    const jan4 = new Date(year, 0, 4);
    const dayOfWeek = jan4.getDay() || 7;
    const startOfWeek1 = new Date(jan4);
    startOfWeek1.setDate(jan4.getDate() - dayOfWeek + 1);

    const startDate = new Date(startOfWeek1);
    startDate.setDate(startOfWeek1.getDate() + (week - 1) * 7);

    return startDate;
}

function getEndOfWeek(startDate) {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return endDate;
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function populateYears() {
    const yearSelect = document.getElementById('yearSelect');
    const currentYear = new Date().getFullYear();

    for (let year = currentYear - 2; year <= currentYear + 2; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = `${year}`;
        if (year === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }
}

function updateWeeks() {
    const year = parseInt(document.getElementById('yearSelect').value);
    const weekSelect = document.getElementById('weekSelect');

    weekSelect.innerHTML = '';

    const lastDayOfYear = new Date(year, 11, 31);
    const totalWeeks = Math.max(52, getWeekNumber(lastDayOfYear));

    const today = new Date();
    const currentWeek = getWeekNumber(today);
    const currentYear = today.getFullYear();

    for (let week = 1; week <= totalWeeks; week++) {
        const startDate = getStartOfWeek(year, week);
        const endDate = getEndOfWeek(startDate);

        if (startDate.getFullYear() > year && week > 1) {
            break;
        }

        const option = document.createElement('option');
        option.value = week;
        option.setAttribute('data-year', year);
        option.textContent = `Tuần ${week} (${formatDate(startDate)} - ${formatDate(endDate)})`;

        if (year === currentYear && week === currentWeek) {
            option.selected = true;
        }

        weekSelect.appendChild(option);
    }
}

document.getElementById('filterTypeSelect').addEventListener('change', function () {
    const filterType = this.value;

    document.getElementById('piFilterContent').style.display = 'block';
    document.getElementById('dateFilterContent').style.display = 'none';
    document.getElementById('weekFilterContent').style.display = 'none';

    if (filterType === 'pi') {
        document.getElementById('piFilterContent').style.display = 'block';
    } else if (filterType === 'date') {
        document.getElementById('dateFilterContent').style.display = 'block';
    } else if (filterType === 'week') {
        document.getElementById('weekFilterContent').style.display = 'block';
    }

    applyFilter();
});

function applyFilter() {
    const filterType = document.getElementById('filterTypeSelect').value;
    if (filterType === 'pi') {

        GetSoLo();
    } else if (filterType === 'date') {

        onDateRangeChange();
    } else if (filterType === 'week') {

        onWeekChange();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    populateYears();
    updateWeeks();

    //// Set ngày hiện tại cho date inputs
    //const today = new Date().toISOString().split('T')[0];
    //document.getElementById('fromDate').value = today;
    //document.getElementById('toDate').value = today;



});

function onDateRangeChange() {

    const fromDateVal = $("#fromDate").dxDateBox("instance").option("value");
    const toDateVal = $("#toDate").dxDateBox("instance").option("value");

    if (fromDateVal && toDateVal) {
        if (fromDateVal > toDateVal) {
            alert("Từ ngày không được lớn hơn Đến ngày.");
            return;
        }

        const formatFromDate = formatDateSQL(fromDateVal);
        const formatToDate = formatDateSQL(toDateVal);
        GetSoLoByDateRange(fromDateVal, toDateVal);
    }
}

function onWeekChange() {
    const year = $('#yearSelect').val();
    const week = $('#weekSelect').val();

    if (year && week) {
        const startDate = getStartOfWeek(parseInt(year), parseInt(week));
        const endDate = getEndOfWeek(startDate);

        const fromDate = startDate.toISOString().split('T')[0];
        const toDate = endDate.toISOString().split('T')[0];

        GetSoLoByDateRange(fromDate, toDate);
    }
}

async function GetSignTemplate() {
    const userID = localStorage.getItem('username1')
    try {
        const response = await fetch(`/api/QtyKiemPL/GET?action=GetSign&para1=${userID}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        console.log(data[0].Img)
        SignalTemple = data[0].Img


    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
    }
}

let lastChecked = null;

$("input[name='result-kiem']").on("click", function () {
    if (lastChecked === this) {

        $(this).prop("checked", false);
        lastChecked = null;
    } else {

        lastChecked = this;
    }
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
            pad.clear();
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
            pad.clear();
            pad.fromDataURL(SignalTemple);
            $("#txtMerName").text(SignalTempleName);
        }


    }

});

function confirmTBP_QC() {

    const SoLO = $("#selectSoLO option:selected").text();
    $("#txt-comfirm-kiem").html(`${SoLO}`)
    const el = document.getElementById('modalComfirmSoLo');
    if (!el) return;
    new bootstrap.Modal(el).show();
}

function ComfirmMer() {
    const SoLO = $("#selectSoLO option:selected").text();
    $("#txt-comfirm-kiem-mer").html(`${SoLO}`)
    const el = document.getElementById('modalComfirmMer');
    if (!el) return;
    new bootstrap.Modal(el).show();
}
function ComfirmQC() {
    const SoLO = $("#selectSoLO option:selected").text();
    $("#txt-comfirm-kiem-qc").html(`${SoLO}`)
    const el = document.getElementById('modalComfirmQC');
    if (!el) return;
    new bootstrap.Modal(el).show();
}

function ConfirmXNQCManager(action) {

    var grid = $("#grvPhuLieuKiem").dxDataGrid("instance");
    var dataSource = grid.getDataSource();
    var parsedData = dataSource.items();

    const objSoLo = arrSoLo.find(x => x.SoLoID == $("#selectSoLO").val());
    const getFileName = `Sign-PL-${objSoLo.SoLoID}`;
    let dataUpload = [];
    let arrUpDatePhieu = [];


    const today = formatDateSQL(new Date());
    if (parsedData.length > 0) {
        const sampleRow = parsedData[0];
        Object.keys(sampleRow).forEach(key => {
            if (key.includes('@MaNPL@') && !key.includes('_PARSED')) {

                const keyParts = key.split('@MaNPL@');
                var objPhieuPLSave = {};
                const hasCheck = keyParts[3] == true;

                objPhieuPLSave["MaNPL"] = keyParts[1]
                objPhieuPLSave["SoLoID"] = objSoLo.SoLoID;
                objPhieuPLSave["Dot"] = keyParts[2];
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
                    objPhieuPLSave["GhiChu_Mer"] = $("#txtDG_Mer").val();
                    objPhieuPLSave["KQ_GiaiQuyet_Sign"] = null;
                    objPhieuPLSave["UserSign_Mer"] = _userName || localStorage.getItem('username1')
                }
                else if (action == "POSTXN_QC") {
                    objPhieuPLSave["GhiChu_QC"] = $("#txtDG_QC").val();
                    objPhieuPLSave["Sign_Pass"] = null;
                    objPhieuPLSave["UserSign_QC"] = _userName || localStorage.getItem('username1')

                }



                if (hasCheck == false && action == "PostXN_TBP") {
                    arrUpDatePhieu.push(objPhieuPLSave);

                }
                else if (action == "POSTXN_Mer" || action == "POSTXN_QC") {
                    arrUpDatePhieu.push(objPhieuPLSave);
                }




            }
        });
    }


    if (arrUpDatePhieu == 0) {
        DevExpress.ui.notify('Chưa có vật tư cần xác nhận. Vui lòng thử lại!', 'warning', 2000);
        $(".btn-close.btn-close-white").click()
        return;
    }


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

                    item["TPCL_ComfirmSign"] = findImage('signXN_KQ');;


                }
                else if (action == "POSTXN_Mer") {

                    item["KQ_GiaiQuyet_Sign"] = findImage('signMer');;
                }
                else if (action == "POSTXN_QC") {

                    item["Sign_Pass"] = findImage('signQC');;
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


            const module = 'M.26.00.00'
            var title = ``;
            if (action == "PostXN_TBP") {
                title = `TBP đã xác nhận hoàn thành kiểm`;
                inst = bootstrap.Modal.getInstance(document.getElementById('modalComfirmSoLo'));
            } else if (action == "POSTXN_Mer") {
                title = "Mer đã xác nhận vật tư";
                inst = bootstrap.Modal.getInstance(document.getElementById('modalComfirmMer'));
                Result = $("input[name='result-kiem-mer']:checked").val() || "";
            } else if (action == "POSTXN_QC") {
                title = "QC đã xác nhận vật tư";
                inst = bootstrap.Modal.getInstance(document.getElementById('modalComfirmQC'));
            }

            const SoLoID = $("#selectSoLO option:selected").text()
            const detail = `${SoLoID}\nKết quả: <color=${Result.toUpperCase() == "PASS" ? "navy" : "red"}>${Result.toUpperCase()}</color>`
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
                    Status: 0,
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

            sendNotifyMuti(arrayNotify)

            if (inst) inst.hide();
        })
        .catch(error => {
            DevExpress.ui.dialog.alert('Lưu thất bại: ' + error, 'Lỗi');
            $("#btn-close-signature").click()
        });
}

function sendNotifyMuti(arrNotify) {

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

function CheckPerminsion() {
    var UserName = _userName || localStorage.getItem('username1');
    loadDataFromAPI(`/api/QtyKiemPL/Get?action=CheckSignQA_BC&para1=${UserName}`)
        .then(headerData => {
            if (headerData && headerData.length > 0) {

                setPermission("xac-nhan-qc", true);
            }
            else {
                setPermission("xac-nhan-qc", false);
            }
        })
        .catch(error => {
            console.error('Error loading header:', error);
            /*   DevExpress.ui.notify("Không thể tải thông tin đơn hàng", "error", 3000);*/
        });

    loadDataFromAPI(`/api/QtyKiemPL/Get?action=CheckSignTBP_QA&para1=${UserName}`)
        .then(headerData => {
            if (headerData && headerData.length > 0) {


                setPermission("xac-nhan-tbp", true);
            }
            else {
                setPermission("xac-nhan-tbp", false);
            }
        })
        .catch(error => {
            console.error('Error loading header:', error);
            /*   DevExpress.ui.notify("Không thể tải thông tin đơn hàng", "error", 3000);*/
        });

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
            console.error('Error loading header:', error);
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

$(document).ready(async function () {
    await GetSignTemplate();
    InitComponent();
    GetDonViTinh();
    $("#fromDate").dxDateBox({
        type: "date",
        displayFormat: "dd/MM/yyyy",
        useMaskBehavior: true,
        value: today,
        onValueChanged: function (e) {
            onDateRangeChange();
        }
    });
    $("#toDate").dxDateBox({
        type: "date",
        displayFormat: "dd/MM/yyyy",
        useMaskBehavior: true,
        value: today,
        onValueChanged: function (e) {
            onDateRangeChange();
        }
    });
    $("#filterTypeSelect").val("date");
    applyFilter();
    CheckPerminsion();
});