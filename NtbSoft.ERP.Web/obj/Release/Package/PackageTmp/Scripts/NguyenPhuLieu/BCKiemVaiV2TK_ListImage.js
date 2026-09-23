
var batchData;
var dataKiem;
var dataImageEX;
var dataErrorPoint;
let ketLuanMer = ""
// Khởi tạo
$(document).ready(function () {
    GetSoLoID()
    GetChuKy();
});
var userNameSave = localStorage.getItem('username');

async function GetSoLoID() {
    const maNPL = $("#MauVai").val();
    const url = `/api/KiemVai/Get?action=GetBCSoLo&para1=${maNPL}&para2=${loc}&para8=2`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status} `);

        const data = await response.json();
        let html = loc == 1 ? `` : `<option value=""></option>`;
        data.dt1.map(x => {
            html += `
                <option data-ncc="${x.NCC}" data-khachhang="${x.TenKH}"  value="${x.SoLoID}">${x.SoLo} - ${x.NgayNhap} - PO Mua: ${x.POMua}</option>
            `
        })
        $("#SoLo").html(html)
        if (loc == 1) {
            GetDot();

            const nhacungcap = $("#SoLo option:selected").data("ncc");
            const khachhang = $("#SoLo option:selected").data("khachhang");
            $("#nhacungcap").val(nhacungcap);
            $("#KhachHang").val(khachhang);
        }
        $("#minFabricAlert").attr("style", "display: none !important;");
    } catch (error) {
        console.error(error.message);
    }
}

async function GetMauVai() {
    $("#minFabricAlert").attr("style", "display: none !important;");
    $("#batchInput").val("");
    selectedItems = [];
    const loaivai = $("#PhuLieuA option:selected").text()
    $(".text-loaivai").text(loaivai)
    const url = `/api/KiemVai/Get?action=GetBCMauVai&para1=${$("#SoLo").val()}&para2=${loc}&para8=2`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status} `);
        let html = ``;
        const data = await response.json();
        data.dt1.map(x => {
            html += `
                <option data-mauvt="${x.MauVTID}" data-mavtid="${x.MaVTID}" value="${x.MaNPL}">${x.MaVT} - ${x.MauVT} - ${x.KhoVai} - ${x.DonVi}</option>
            `
        })
        $("#MauVai").html(html)
        if (loc == 1) $("#MauVai").val("");
        GetDot()
    } catch (error) {
        console.error(error.message);
    }
}
async function GetDot() {
    const soLoID = $("#SoLo").val();
    const maNPL = $("#MauVai").val();
    const url = `/api/KiemVai/Get?action=GetDotVai&para1=${soLoID}&para2=${maNPL}&para3=a&para8=2`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status} `);

        const data = await response.json();
        let html = ``;
        data.dt1.map(x => {
            html += `
                <option data-ngaynhapkho="${x.NgayNhapKho}" data-mauvt="${x.MauVTID}" data-mavtid="${x.MaVTID}" data-dot="${x.Dot}" value="${x.Dot}">${x.DotDisplay}</option>
            `
        })
        $("#Dot").html(html)
        GetLanKiem()

    } catch (error) {
        console.error(error.message);
    }
}
async function GetBatchLot() {
    selectedItems = [];
    const mauVTID = $("#MauVai option:selected").data("mauvt")
    const dot = $("#Dot option:selected").data("dot")
    const lanKiem = $("#LanKiem").val()
    const url = `/api/KiemVai/Get?action=GetBCBatchLot&para1=${$("#SoLo").val()}&para2=${$("#MauVai").val()}&para3=a&para4=${dot}&para5=${lanKiem}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status} `);

        const data = await response.json();
        batchData = data.dt1;

        selectedItems = batchData.map(item => ({
            batch: item.Batch,
            lot: item.SoLoT,
            socay: item.SoCay,
            manpl: item.MaNPL,
            barcode: item.BarCode
        }));

        updateInput();

        checkLowInspectionRatio(batchData);
        checkAllMinFabricByAPI(batchData, mauVTID);
        renderList(data.dt1);
    } catch (error) {
        console.error(error.message);
    }

    //$("#batchInput").val("");
    $("#checkAll").prop("checked", true);

    // Xóa bảng kết quả cũ nếu có
    $('.inspection-table').empty();
    $(".divResult").addClass("d-none");
    GetBCKiemVai()
}

let selectedItems = [];

// Render danh sách
function renderList(data) {
    const itemList = $('#itemList');
    itemList.empty();
    data.forEach(item => {
        const html = `
            <div class="dropdown-item">
                <input type="checkbox" 
                       id="${item.SoLoT}${item.Batch}${item.SoCay}"
                       data-batch="${item.Batch}"
                       data-lot="${item.SoLoT}"
                       data-socay="${item.SoCay}"
                       data-barcode="${item.BarCode}"
                       checked disabled> 
                <label for="${item.SoLoT}${item.Batch}${item.SoCay}">${item.Display}</label>
            </div>
        `;
        itemList.append(html);
    });
    $('#checkAll').prop('checked', true).prop('disabled', true);
}

// Cập nhật input - hiển thị cả Batch và LOT
function updateInput() {
    const displayText = selectedItems.map(item => `${item.batch}/${item.lot}/${item.socay}`).join(', ');
    $('#batchInput').val(displayText);
}

// Cập nhật trạng thái check all
function updateCheckAll() {
    const total = $('#itemList input[type="checkbox"]').length;
    const checked = $('#itemList input[type="checkbox"]:checked').length;
    $('#checkAll').prop('checked', total > 0 && total == checked);
}

// Click vào input
$('#batchInput').click(function (e) {
    e.stopPropagation();
    $('#dropdownList').toggleClass('show');
    $('#searchInput').val('').focus();
    renderList(batchData);
});

//Click ẩn notification
$("#btn-hide").click(function (e) {
    e.stopPropagation();
    $("#minFabricAlert").attr("style", "display: none !important;");
    updateTableHeight();
});

$("#btn-hide-1").click(function (e) {
    e.stopPropagation();
    $("#percentInput").attr("style", "display: none !important;");
    updateTableHeight();
});


// Chỉnh sửa sự kiện change của checkbox
$(document).on('change', '#itemList input[type="checkbox"]', async function () {
    // Nếu bạn muốn khóa hoàn toàn, có thể không làm gì ở đây hoặc force check lại
    $(this).prop('checked', true);
    return false;
});

// Chỉnh sửa sự kiện change của Check All
$('#checkAll').change(function () {
    $(this).prop('checked', true);
});

// Tìm kiếm
$('#searchInput').on('keyup', function () {
    const searchText = $(this).val().toLowerCase();
    const filtered = batchData.filter(item =>
        item.Batch.toLowerCase().includes(searchText) ||
        item.SoLoT.toLowerCase().includes(searchText) ||
        item.SoCay.toLowerCase().includes(searchText) ||
        item.Display.toLowerCase().includes(searchText)
    );
    renderList(filtered);
});

// Đóng dropdown khi click ra ngoài
$(document).click(function () {
    $('#dropdownList').removeClass('show');
});

$('#dropdownList').click(function (e) {
    e.stopPropagation();
});

// Hàm lấy danh sách Batch và LOT đã chọn
function getSelectedBatchAndLot() {
    return {
        batches: selectedItems.map(item => item.batch),  // Mảng chỉ chứa Batch
        lots: selectedItems.map(item => item.lot),        // Mảng chỉ chứa LOT
        socays: selectedItems.map(item => item.socay),        // Mảng chỉ chứa LOT
        barcodes: selectedItems.map(item => item.barcode),
        full: selectedItems                                // Mảng đầy đủ {batch, lot}
    };
}

let maNPL = null;

async function GetBCKiemVai() {
    const batchjoin = selectedItems.map(item => item.batch).join(";")
    const lotjoin = selectedItems.map(item => item.lot).join(";")
    const socay = selectedItems.map(item => item.socay).join(";")
    const barcode = selectedItems.map(item => item.barcode).join(";")
    const mauVTID = $("#MauVai option:selected").data("mauvt")
    const dot = $("#Dot option:selected").data("dot")
    const lanKiem = $("#LanKiem").val()

    const url = `/api/KiemVai/Get?action=GetBCKiemVaiV2&para1=${$("#SoLo").val()}&para2=${$("#MauVai").val()}&para3=${mauVTID}&para4=${encodeURIComponent(batchjoin)}&para5=${encodeURIComponent(lotjoin)}&para6=${barcode}&para7=${dot}&para8=${lanKiem}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status} `);

        const data = await response.json();
        maNPL = data.dt1[0].MaNPL
        if (data.dt1 && data.dt1.length > 0) {
            dataKiem = data.dt1
            dataImageEX = data.dt3
            dataErrorPoint = data.dt2
            createDynamicTable(data.dt1, data.dt2, data.dt3 || []);
            $(".text-result").val(data.dt1[0].ResultQC);
            console.log((data.dt1[0].IsDuyetNK))
            setTrangThaiDuyet(Number(data.dt1[0].IsDuyetNK));
            //$("#resultQC-pass").prop("checked", data.dt1[0].StatusResultQC == 1);
            //$("#resultQC-fail").prop("checked", data.dt1[0].StatusResultQC == 0);
            $(".divResult").removeClass("d-none")
            if (data.dt1[0].TenSign !== null && data.dt1[0].TenSign.trim() != "") {
                $(".sign1").text(data.dt1[0].TenSign)
            } else {
                $(".sign1").text('')
            }
            if (data.dt1[0].TenSignManager !== null && data.dt1[0].TenSignManager.trim() != "") {
                $(".sign2").text(data.dt1[0].TenSignManager)
            } else {
                $(".sign2").text('')
            }
            if (data.dt1[0].TenSignReceive !== null && data.dt1[0].TenSignReceive.trim() != "") {
                $(".sign3").text(data.dt1[0].TenSignReceive)
            } else {
                $(".sign3").text('')
            }

            if (data.dt1[0].GhiChuSign != null && data.dt1[0].GhiChuSign != "") {
                $("#ghiChuSign").val(data.dt1[0].GhiChuSign)
            } else {
                $("#ghiChuSign").val("")
            }

            if (data.dt1[0].Sign != null && data.dt1[0].Sign != "") {
                $(".image1").attr("src", `/Images/SignKiemVai${data.dt1[0].Sign}`);

            } else {
                $(".image1").attr("src", ``);
            }
            if (data.dt1[0].SignManager != null && data.dt1[0].SignManager != "") {
                $(".image2").attr("src", `/Images/SignKiemVai${data.dt1[0].SignManager}`);
            }
            else {
                $(".image2").attr("src", ``);
            }
            if (data.dt1[0].SignReceive != null && data.dt1[0].SignReceive != "") {
                $(".image3").attr("src", `/Images/SignKiemVai${data.dt1[0].SignReceive}`);
            }
            else {
                $(".image3").attr("src", ``);
            }
        } else {
            $('.inspection-table').empty();
            $(".divResult").addClass("d-none")
            setTrangThaiDuyet(Number(data.dt1[0].TenSign));
        }
    } catch (error) {
        console.error(error.message);
    }
}
function getImagesByField(dtImages, barcode, dataField) {
    if (!dtImages || dtImages.length === 0) return [];

    return dtImages
        .filter(x =>
            x.Image &&
            String(x.BarCode || "") === String(barcode || "") &&
            String(x.DataField || "").toLowerCase() === String(dataField || "").toLowerCase()
        )
        .map(x => ({
            //url: x.Image.startsWith("/")
            //    ? x.Image
            //    : `/Images/SignKiemVai/${x.Image}`,
            url: `/Images/SignKiemVai/${x.Image}`,
            note: x.GhiChu || "",
            dataField: x.DataField || "",
            barcode: x.BarCode || ""
        }));
}
function renderBCImageList(images, showNote = true) {
    if (!images || images.length === 0) {
        return "";
    }
    console.log(showNote)
    return `
        <div class="bc-image-list">
            ${images.map((img, index) => `
                <div class="bc-image-item" onclick='showPreviewList(${JSON.stringify(images)}, ${index}, ${showNote})'>
                    <img src="${img.url}" alt="Image">
                    ${!showNote ? `
                        <textarea class="bc-image-note" readonly rows="2" onclick="event.stopPropagation()">${img.note || ""}</textarea>
                    ` : ""}
                </div>
            `).join("")}
        </div>
    `;
}
function mapDefectToDataField(defectType) {
    const map = {
        "Wrap bar": "defect-wrap-bar",
        "Weft bar": "defect-weft-bar",
        "Holes": "defect-holes",
        "Oil stain/spot": "defect-oil-stain",
        "Color yarn": "defect-color-yarn",
        "Crease mark": "defect-crease-mark",
        "Other defects": "defect-other"
    };

    return map[defectType] || "";
}
let currentPreviewImages = [];
let currentPreviewIndex = 0;
let currentPreviewShowNote = true;
function showPreviewList(images, index, showNote = true) {
    currentPreviewImages = images || [];
    currentPreviewIndex = index || 0;
    currentPreviewShowNote = showNote;
    updateBCPreview();
    $("#previewModal").modal("show");
}

function updateBCPreview() {
    imgResetTransform();
    if (!currentPreviewImages.length) return;

    if (currentPreviewIndex < 0) {
        currentPreviewIndex = currentPreviewImages.length - 1;
    }

    if (currentPreviewIndex >= currentPreviewImages.length) {
        currentPreviewIndex = 0;
    }

    const item = currentPreviewImages[currentPreviewIndex];

    $("#previewImage").attr("src", item.url);
    $("#previewImageCounter").text(`${currentPreviewIndex + 1}/${currentPreviewImages.length}`);
    if (!currentPreviewShowNote) {
        $("#previewImageNote").text(item.note || "").show();
    } else {
        $("#previewImageNote").text("").hide();
    }
}


function createDynamicTable(dataArray, dtThongSoloi, dtImages = []) {
    if (!dataArray || dataArray.length === 0) {
        return;
    }

    // Mapping defect types
    const defectMapping = {
        'Wrap bar': { vi: 'Lỗi sợi dọc', en: 'Wrap bar' },
        'Weft bar': { vi: 'Lỗi sợi ngang', en: 'Weft bar' },
        'Holes': { vi: 'Thủng lỗ', en: 'Holes', note: '(2đ ≥ 2,5cm,4đ > 2,5cm)' },
        'Oil stain/spot': { vi: 'Vết dầu/bẩn', en: 'Oil stain/spot' },
        'Color yarn': { vi: 'Sợi màu', en: 'Color yarn' },
        'Crease mark': { vi: 'Nếp gấp', en: 'Crease mark' },
        'Other defects': { vi: 'Lỗi khác', en: 'Other defects' }
    };

    // Cấu trúc các dòng kiểm tra
    const inspectionRows = [
        {
            stt: 1,
            label: "Mã số vải của xí nghiệp/NCC/",
            labelEn: "Fabric code",
            type: "static",
            field: "MaVT"
        },
        {
            stt: 2,
            label: "Màu của cty/NCC/",
            labelEn: "Color code of Viking & Supplier",
            type: "radio-text",
            radioName: "color",
            statusField: "ColorStatus",
            valueField: "ColorText",
            dataImage: `ColorImg`,
            datafiled: "color",
        },
        {
            stt: 3,
            label: "Thành phần % vải /",
            labelEn: "Percentage of error components",
            type: "radio-text",
            radioName: "percent",
            statusField: "PercentStatus",
            valueField: "PercentText",
            dataImage: `PercentImg`,
            datafiled: "percent",
        },
        {
            stt: 4,
            label: "Số Batch/LOT",
            labelEn: "Batch/LOT number",
            type: "static",
            field: (item) => `${item.Batch || ''} / ${item.LOT || ''} / ${item.SoCay || ''} `
        },
        {
            stt: 5,
            label: "Trọng lượng-(ghi rõ %)",
            labelEn: "Pass/fail weight",
            type: "radio-input-only",
            radioName: "weight",
            statusField: "TrongLuong",
            statusFieldYN: "YNWeight",
            valueField: "Weight",
            dataImage: `ImgWeight`,
            datafiled: "weight",
        },
        {
            stt: 6,
            label: "Độ co rút-(ghi rõ %)",
            labelEn: "Pass/fail Shrinkage",
            type: "radio-input-only",
            radioName: "shrinkage",
            statusField: "DoCoRut",
            statusFieldYN: "YNShrinkage",
            valueField: "Shrinkage",
            dataImage: `ImgShrinkage`,
            datafiled: "shrinkage",

        },
        {
            stt: 7,
            label: "Chống thấm",
            labelEn: "Pass/fail Waterproof",
            type: "radio-input-only",
            radioName: "waterproof",
            statusField: "ChongTham",
            statusFieldYN: "YNWaterproof",
            valueField: "Waterproof",
            dataImage: `ImgWaterproof`,
            datafiled: "waterproof",
        },
        {
            stt: 8,
            label: "Số lượng vải nhập",
            labelEn: "Receiving quantity",
            type: "textarea",
            field: "ReceivingQuantity",
            unit: "TenDVVT"
        },
        {
            stt: 8,
            label: "Số lượng vải kiểm",
            labelEn: "Checking quantity",
            type: "textarea",
            field: "SLTT",
            unit: "TenDVVT"
        },
        {
            stt: 9,
            label: "Kiểm mặt phải",
            labelEn: "Face side",
            type: "radio-text",
            radioName: "checkFace",
            statusField: "StatusFaceSide",
            valueField: "FaceSide",
            dataImage: `ImgFaceSide`,
            datafiled: "checkFace",

        },
        {
            stt: 9,
            label: "Kiểm mặt trái",
            labelEn: "Back side",
            type: "radio-text",
            radioName: "checkBlack",
            statusField: "StatusBlackSide",
            valueField: "BlackSide",
            dataImage: `ImgBlackSide`,
            datafiled: "checkBlack",
        },
        {
            stt: 10,
            label: "Chiều dài/trọng lượng/khổ cây vải trên tem",
            labelEn: "Length/ Weight/ width roll in label",
            type: "textarea",
            field1: "RollLabel",
            field2: "KhoVai",
            unit1: "TenDVVT",
            unit2: "DonViKhoVai"
        },
        {
            stt: 10,
            label: "Chiều dài/trọng lượng/khổ thực tế",
            labelEn: "Length/ Weight/ width roll in actual",
            type: "textarea-with-radio",
            field1: "RollActual",
            field2: "KhoVaiActual",
            unit1: "TenDVVT",
            unit2: "DonViKhoVai",
            statusField1: "RollStatus",
            statusField2: "KhoVaiStatus"
        },
        {
            stt: 11,
            label: "Đệm bố/ CUT PROTECT",
            labelEn: "Thread direction / Vertical / Horizontal",
            type: "dual-textarea",
            field1: "CutProctect",
            field2: "ColorThread",
            label1: "Màu chỉ",
            label1En: "Color thread"
        },
        {
            stt: 12,
            label: "Loang màu / Khác màu",
            labelEn: "Color shading / Color difference",
            type: "radio-text",
            radioName: "checkloang",
            statusField: "StatusColorShading",
            valueField: "ColorShading",
            dataImage: `ImgColorShading`,
            datafiled: "checkloang",
        },
        {
            stt: 13,
            label: "Điểm nối trên cây:",
            labelEn: "Joining points in roll",
            type: "textarea",
            field: "JoiningPointsRoll",
            hideUnit: true
        },

        {
            stt: 14,
            type: "defect-header"
        }
    ];

    // Tạo HTML cho header
    let headerHTML = `
        <thead style="position: sticky; top: -1px; z-index: 10;">
            <tr>
                <th style="width: 50px; text-align: center;">STT</th>
                <th style="min-width:400px">Nội dung kiểm tra</th>`;

    // Thêm cột cho mỗi loại vải
    dataArray.forEach((item, index) => {
        const fabricName = item.TenLoaiVai || `Vải ${index + 1}`;
        headerHTML += `<th colspan="5" style="width: ${70 / dataArray.length}%;">${item.Batch ?? ""} / ${item.LOT ?? ""} / ${item.SoCay}</th>`;
    });

    headerHTML += `</tr></thead>`;

    // Tạo HTML cho body
    let bodyHTML = '<tbody>';

    inspectionRows.forEach((row, rowIndex) => {

        bodyHTML += `<tr> <td class="row-number">${row.stt}</td>`;

        // Xử lý dòng STT 14 - Header cho defect table
        if (row.stt === 14) {
            bodyHTML += `<td class="text-left">
                <strong>Theo tiêu chuẩn 4 điểm</strong>/4 points system<br>
                <strong>1 điểm:</strong> (≤ 7.5cm), <strong>2 điểm:</strong> (7.6 ≥ 14.9cm)<br>
                <strong>3 điểm:</strong> (15 -> 23cm), <strong>4 điểm:</strong> ( > 23cm)
            </td>`;

            // Thêm header 1,2,3,4 cho mỗi loại vải
            dataArray.forEach((item, colIndex) => {
                bodyHTML += `
                    <td style="text-align: center; font-weight: bold;">1</td>
                    <td style="text-align: center; font-weight: bold;">2</td>
                    <td style="text-align: center; font-weight: bold;">3</td>
                    <td style="text-align: center; font-weight: bold;">4</td>
                    <td style="text-align: center; font-weight: bold;">Hình</td>
                `;
            });
        }


        // Xử lý dòng STT 10 - Đặc biệt
        else if (row.stt === 11) {
            bodyHTML += `<td class="label-col">
                <div class="row">
                    <div class="col-7" style="border-right: 1px solid #ccc;">
                        <div><span class="label-text">Đệm bố/ CUT PROTECT :</span></div>
                        <div class="sub-label">
                            - Hướng của sợi chỉ màu /
                            <span class="label-english">Thread direction</span>
                        </div>
                        <div class="sub-label">
                            - Dọc theo chiều đã cây vải /
                            <span class="label-english">Vertical</span>
                        </div>
                        <div class="sub-label">
                            - Ngang theo khổ vải /
                            <span class="label-english">Horizontal</span>
                        </div>
                    </div>
                    <div class="col-5 d-flex justify-content-center flex-column">
                        <div><span class="">Màu chỉ</span></div>
                        <div class="sub-label">
                            <span class="label-english">Color thread</span>
                        </div>
                    </div>
                </div>
            </td>`;

            // Xử lý giá trị cho dual-textarea
            dataArray.forEach((item, colIndex) => {
                bodyHTML += '<td style="min-width: 350px;" colspan="5" class="value-col">';
                const val1 = item[row.field1] || '';
                const val2 = item[row.field2] || '';
                bodyHTML += `
                    <div class="row">
                        <div class="col-6" style="border-right: 1px solid #ccc;">
                            <textarea style="color: #FF3A00" class="form-control" 
                                data-field="${row.field1}" data-col="${colIndex}" 
                                rows="2" readonly>${val1}</textarea>
                        </div>
                        <div class="col-6">
                            <textarea style="color: #FF3A00" class="form-control" 
                                data-field="${row.field2}" data-col="${colIndex}" 
                                rows="2" readonly>${val2}</textarea>
                        </div>
                    </div>`;
                bodyHTML += '</td>';
            });
        }
        else if (row.stt === 10 && row.type == "textarea") {
            bodyHTML += `<td class="label-col">
                <span class="label-text">${row.label}</span>
                <span class="label-english">${row.labelEn}</span>
            </td>`;
            dataArray.forEach((item, colIndex) => {
                bodyHTML += '<td colspan="5" class="value-col">';
                const val1 = item[row.field1] || '';
                const val2 = item[row.field2] || '';
                const val3 = item[row.unit1] || '';
                const val4 = item[row.unit2] || '';
                bodyHTML += `
                <div class="row-flex-nowrap mb-1">
                    <div class="input-main">
                        <textarea style="color: #FF3A00; text-align: center;" class="form-control" 
                            rows="1" readonly>${val1}</textarea>
                    </div>
                    <div class="unit-box d-flex align-items-center justify-content-center">${val3}</div>
        
                    <div class="input-main ms-2" style="border-left: 1px solid #ccc; padding-left: 10px">
                        <textarea style="color: #FF3A00; text-align: center;" class="form-control" 
                            rows="1" readonly>${val2}</textarea>
                    </div>
                    <div class="unit-box d-flex align-items-center justify-content-center">${val4}</div>
                </div>`;
                bodyHTML += '</td>';
            });
        }

        else if (row.stt === 10 && row.type === "textarea-with-radio") {
            bodyHTML += `<td class="label-col">
                <span class="label-text">${row.label}</span>
                <span class="label-english">${row.labelEn}</span>
            </td>`;

            dataArray.forEach((item, colIndex) => {
                bodyHTML += '<td colspan="5" class="value-col">';

                const val1 = item[row.field1] || '';
                const val2 = item[row.field2] || '';
                const unit1 = item[row.unit1] || '';
                const unit2 = item[row.unit2] || '';

                // Trạng thái Radio 1 (Roll)
                const status1 = item[row.statusField1];
                const rName1 = `statusRoll-${colIndex}`;

                // Trạng thái Radio 2 (Kho)
                const status2 = item[row.statusField2];
                const rName2 = `statusKho-${colIndex}`;

                bodyHTML += `
                <div class="row">
                    <div class="col-6" style="border-right: 1px solid #ccc;">
                        <div class="row-flex-nowrap mb-1">
                            <div class="input-main">
                                <textarea style="color: #FF3A00; text-align: center;" class="form-control" rows="1" readonly>${val1}</textarea>
                            </div>
                            <div class="unit-box d-flex align-items-center justify-content-center">${unit1}</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center flex-wrap">
                            <div class="form-check form-check-inline div-radio">
                                <input class="form-check-input no-click no-click" type="radio" name="${rName1}" ${status1 == 1 ? 'checked' : ''}>
                                <label class="form-check-label text-success small">Pass</label>
                            </div>
                            <div class="form-check form-check-inline div-radio">
                                <input class="form-check-input no-click no-click" type="radio" name="${rName1}" ${status1 == 0 ? 'checked' : ''}>
                                <label class="form-check-label text-danger small">Fail</label>
                            </div>
                            <div class="form-check form-check-inline div-radio">
                                <input class="form-check-input no-click no-click" type="radio" name="${rName1}" ${status1 == 2 ? 'checked' : ''}>
                                <label class="form-check-label text-secondary small">No</label>
                            </div>
                        </div>
                    </div>

                    <div class="col-6">
                        <div class="row-flex-nowrap mb-1">
                            <div class="input-main">
                                <textarea style="color: #FF3A00; text-align: center;" class="form-control" rows="1" readonly>${val2}</textarea>
                            </div>
                            <div class="unit-box d-flex align-items-center justify-content-center">${unit2}</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center flex-wrap ">
                            <div class="form-check form-check-inline div-radio">
                                <input class="form-check-input no-click no-click" type="radio" name="${rName2}" ${status2 == 1 ? 'checked' : ''}>
                                <label class="form-check-label text-success small">Pass</label>
                            </div>
                            <div class="form-check form-check-inline div-radio">
                                <input class="form-check-input no-click no-click" type="radio" name="${rName2}" ${status2 == 0 ? 'checked' : ''}>
                                <label class="form-check-label text-danger small">Fail</label>
                            </div>
                            <div class="form-check form-check-inline div-radio">
                                <input class="form-check-input no-click no-click" type="radio" name="${rName2}" ${status2 == 2 ? 'checked' : ''}>
                                <label class="form-check-label text-secondary small">No</label>
                            </div>
                        </div>
                    </div>
                </div>`;
                bodyHTML += '</td>';
            });
        }

        // Xử lý các dòng bình thường
        else {
            bodyHTML += `<td class="label-col">
                <span class="label-text">${row.label}</span>
                <span class="label-english">${row.labelEn}</span>
            </td>`;

            // Các cột kết quả cho từng loại vải
            dataArray.forEach((item, colIndex) => {
                bodyHTML += '<td colspan="5" class="value-col">';

                switch (row.type) {
                    case 'static':
                        const value = typeof row.field === 'function' ? row.field(item) : item[row.field];
                        bodyHTML += `<div style="min-height: 30px; color: red;">${value || ''}</div>`;
                        break;

                    case 'radio-text':
                        const radioId = `${row.radioName}-${colIndex}`;
                        const status = item[row.statusField];
                        const textValue = item[row.valueField] || '';
                        const images = getImagesByField(dtImages, item.BarCode, row.datafiled);
                        // Lưu ảnh
                        let radioHtml = '';
                        if (row.stt == 9) {
                            radioHtml = `
                                <div class="form-check form-check-inline div-radio">
                                    <input class="form-check-input no-click" type="radio" name="${radioId}" id="${radioId}-pass" value="pass" ${status === 1 ? 'checked' : ''}>
                                    <label class="form-check-label text-success">Yes</label>
                                </div>
                                <div class="form-check form-check-inline div-radio">
                                    <input class="form-check-input no-click" type="radio" name="${radioId}" id="${radioId}-fail" value="fail" ${status === 0 ? 'checked' : ''}>
                                    <label class="form-check-label text-danger">No</label>
                                </div>`;
                        }
                        else {
                            radioHtml = `
                                <div class="form-check form-check-inline div-radio">
                                    <input class="form-check-input no-click" type="radio" name="${radioId}" id="${radioId}-pass" value="pass" ${status === 1 ? 'checked' : ''}>
                                    <label class="form-check-label text-success">Pass</label>
                                </div>
                                <div class="form-check form-check-inline div-radio">
                                    <input class="form-check-input no-click" type="radio" name="${radioId}" id="${radioId}-fail" value="fail" ${status === 0 ? 'checked' : ''}>
                                    <label class="form-check-label text-danger">Fail</label>
                                </div>
                                <div class="form-check form-check-inline div-radio ">
                                    <input class="form-check-input no-click" type="radio" name="${radioId}" id="${radioId}-no" value="no" ${status === 2 ? 'checked' : ''}>
                                    <label class="form-check-label text-secondary">No</label>
                                </div>`;
                        }

                        bodyHTML += `
                            <div class="d-flex align-items-center row">
                                <div class="col-md-12 col-lg-6 col-xl-6 m-0 p-0">
                                    <div class="d-flex align-items-center justify-content-around">
                                       <div class="bc-image-wrap">
                                        ${renderBCImageList(images)}
                                    </div>
                                        <div class="d-flex align-items-start flex-column gap-1">
                                            ${radioHtml}
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-lg-6 col-xl-6">
                                    <textarea style="color:green" class="form-control flex-grow-1"
                                        data-field="${row.valueField}" data-col="${colIndex}" 
                                        rows="1" readonly>${textValue}</textarea>
                                </div>
                            </div>`;
                        break;

                    case 'radio-input-only':
                        const rId = `${row.radioName}-${colIndex}`;
                        const rIdYN = `YN-${row.radioName}-${colIndex}`;

                        // Lấy giá trị từ API dựa trên statusField (TrongLuong, DoCoRut, hoặc ChongTham)
                        const apiValue = item[row.statusField];
                        const apiValueYN = item[row.statusFieldYN];

                        // Logic kiểm tra: 1: Pass, 2: Fail, (0 hoặc null/undefined): No
                        const isPass = apiValue == 1;
                        const isFail = apiValue == 2;
                        const isNo = (apiValueYN == 0 || apiValueYN == null || apiValueYN == undefined);
                        const isYes = (apiValueYN == 1);

                        bodyHTML += `
                            <div class="d-flex flex-column gap-2">
                                <div class="d-flex align-items-center justify-content-center gap-3">
                                    <div class="form-check form-check-center m-0">
                                        <input class="form-check-input no-click" type="radio" name="${rId}" id="${rId}-pass" value="pass" ${isPass ? 'checked' : ''}>
                                        <label class="form-check-label text-success">Pass</label>
                                    </div>
                                    <div class="form-check form-check-center m-0">
                                        <input class="form-check-input no-click" type="radio" name="${rId}" id="${rId}-fail" value="fail" ${isFail ? 'checked' : ''}>
                                        <label class="form-check-label text-danger">Fail</label>
                                    </div>
                                    <div style="width: 2px; height: 22px;  background: #ccc;"></div>

                                    <div class="form-check form-check-inline div-radio ">
                                        <input class="form-check-input no-click" type="radio" name="${rIdYN}" id="${rId}-yes" value="yes" ${isYes ? 'checked' : ''}>
                                        <label class="form-check-label text-success">Yes</label>
                                    </div>
                                    <div class="form-check form-check-center m-0 }">
                                        <input class="form-check-input no-click" type="radio" name="${rIdYN}" id="${rId}-no" value="no" ${isNo ? 'checked' : ''}>
                                        <label class="form-check-label text-secondary">No</label>
                                    </div>
                                   
                                </div>
                            </div>`;
                        break;
                    case 'textarea':
                        const textVal = item[row.field] || '';
                        const unitVal = item[row.unit] || 'm';

                        if (row.hideUnit) {
                            bodyHTML += `
                            <div class="row no-gutters">
                                <div class="col-12">
                                    <textarea style="color:red; text-align: center;" 
                                        class="form-control"
                                        data-field="${row.field}" 
                                        data-col="${colIndex}" 
                                        rows="1" readonly>${textVal}</textarea>
                                </div>
                            </div>`;
                        } else {
                            // 👉 hiển thị bình thường (STT khác)
                            bodyHTML += `
                            <div class="row-flex-nowrap">
                                <div class="input-main">
                                    <textarea style="color:red; text-align: center;" 
                                        class="form-control"
                                        data-field="${row.field}" 
                                        data-col="${colIndex}" 
                                        rows="1" readonly>${textVal}</textarea>
                                </div>
                                <div class="unit-box d-flex align-items-center justify-content-center">${unitVal}</div>
                            </div>`;
                        }
                        break;

                    case 'checkbox':
                        const checked = item[row.field] == 1;
                        const checkId = `${row.field}-${colIndex}`;
                        bodyHTML += `
                            <div class="form-check">
                                <input class="form-check-input no-click mt-0" type="checkbox" 
                                    id="${checkId}" data-field="${row.field}" data-col="${colIndex}"
                                    ${checked ? 'checked' : ''} >
                                <label class="form-check-label ms-2"></label>
                            </div>`;
                        break;
                }

                bodyHTML += '</td>';
            });
        }

        bodyHTML += '</tr>';
    });

    // ===== THÊM CÁC DÒNG DEFECT ĐỘNG =====
    if (dtThongSoloi && dtThongSoloi.length > 0) {
        // Lấy danh sách defect types unique
        const uniqueDefects = [...new Set(dtThongSoloi.map(d => d.ErrorType))];

        uniqueDefects.forEach((defectType, defectIndex) => {
            const defectInfo = defectMapping[defectType] || { vi: defectType, en: defectType };

            bodyHTML += `<tr data-defect="${defectType}">`;
            bodyHTML += `<td  class="row-number">${14}</td>`;

            // Cột tên lỗi
            bodyHTML += `<td class="defect-name">
                <span class="defect-name-vi">${defectInfo.vi}</span>
                <span class="defect-name-en">${defectInfo.en}</span>
                ${defectInfo.note ? `<p class="mb-0" style="font-size: 11px;"><strong>${defectInfo.note}</strong></p>` : ''}
            </td>`;

            // Các cột điểm cho mỗi loại vải
            dataArray.forEach((item, colIndex) => {
                // Tìm defect data cho IDErrorType này
                const defectData = dtThongSoloi.find(d =>
                    d.IDErrorType === item.IDErrorType && d.ErrorType === defectType
                );

                if (defectData && defectData.ErrorPoint) {
                    // Parse ErrorPoint: "1@1@1@1" -> [1, 1, 1, 1]
                    const points = defectData.ErrorPoint.split('@');

                    // Render 4 cột điểm (1, 2, 3, 4)
                    for (let i = 0; i < 4; i++) {
                        const pointValue = points[i] || '0';
                        bodyHTML += `<td class="point-cell">
                            <span class="counter-value" data-point="${i + 1}">${pointValue == 0 ? "" : pointValue}</span>
                        </td>`;
                    }
                } else {
                    // Nếu không có data, hiển thị 0
                    for (let i = 0; i < 4; i++) {
                        bodyHTML += `<td class="point-cell">
                            <span class="counter-value" data-point="${i + 1}"></span>
                        </td>`;
                    }
                }
                const defectField = mapDefectToDataField(defectType);
                const defectImages = getImagesByField(dtImages, item.BarCode, defectField);
                bodyHTML += `
                <td class="point-cell">
                   ${renderBCImageList(defectImages, false)}
                </td>
            `;
            });

            bodyHTML += '</tr>';
        });
    }

    bodyHTML += `<tr><td class="row-number">15</td>`;
    bodyHTML += `<td class="label-col"><span class="label-text">Kết quả /</span> <span class="label-english">Result</span></td>`;

    dataArray.forEach((item, colIndex) => {
        const diemLoi = item.ErrorPoint || 0;
        const status = item.StatusResult;

        let statusText = "";
        let statusClass = "";
        if (status == 1) { statusText = "ĐẠT"; statusClass = "text-success"; }
        else if (status == 0 || status == 2) { statusText = "KHÔNG ĐẠT"; statusClass = "text-danger"; }

        bodyHTML += `<td colspan="5" class="value-col text-center pr-4" style="vertical-align: middle;">
            <span style="font-weight:bold; margin-right: 15px;">Điểm: <span style="color:red">${diemLoi}</span></span>
            <span class="${statusClass}">${statusText}</span>
        </td>`;
    });
    bodyHTML += `</tr>`;

    bodyHTML += `<tr><td class="row-number">16</td>`;
    bodyHTML += `<td class="label-col"><span class="label-text">Kết luận/</span> <span class="label-english">Final Decision</span></td>`;

    dataArray.forEach((item, colIndex) => {
        // Logic tự động kiểm tra xem có lỗi nào không để check mặc định
        const fieldsToCheck = [
            item.ResultQCStatus
        ];
        const hasFail = fieldsToCheck.some(status => status === 2);
        const radioGroupName = `finalDecision-${colIndex}`;

        bodyHTML += `
        <td colspan="5" class="value-col" style="vertical-align: middle;">
            <div class="d-flex justify-content-center gap-2">
                <div class="form-check form-check-center">
                    <input class="form-check-input no-click no-click" type="radio" 
                        name="${radioGroupName}" id="${radioGroupName}-pass" 
                        value="1" ${!hasFail ? 'checked' : ''}>
                    <label class="form-check-label text-success">PASS</label>
                </div>
                <div class="form-check form-check-center">
                    <input class="form-check-input no-click no-click" type="radio" 
                        name="${radioGroupName}" id="${radioGroupName}-fail" 
                        value="0" ${hasFail ? 'checked' : ''}>
                    <label class="form-check-label text-danger">FAIL</label>
                </div>
            </div>
        </td>`;
    });
    bodyHTML += `</tr>`;

    const checkedValue = dataArray[0]?.KetLuan_Mer;
    ketLuanMer = checkedValue
    //console.log(checkedValue)

    if (checkedValue == "1") {
        $("#resultMer-pass").prop("checked", true)
        $("#resultMer-fail").prop("checked", false)
    } else if (checkedValue == "2") {
        $("#resultMer-pass").prop("checked", false)
        $("#resultMer-fail").prop("checked", true)
    } else {
        $("#resultMer-pass").prop("checked", false)
        $("#resultMer-fail").prop("checked", false)
    }

    const yesItems = dataArray.filter(item =>
        item.YNWeight == 1 || item.YNShrinkage == 1 || item.YNWaterproof == 1
    );

    console.log(`yesItems: `, yesItems)

    // Có ít nhất 1 cặp YN=Yes mà giá trị chưa có → pending
    const hasAnyResult = yesItems.some(item =>
        (item.YNWeight == 1 && (item.TrongLuong == 1 || item.TrongLuong == 2)) ||
        (item.YNShrinkage == 1 && (item.DoCoRut == 1 || item.DoCoRut == 2)) ||
        (item.YNWaterproof == 1 && (item.ChongTham == 1 || item.ChongTham == 2))
    );

    // Tất cả các cặp YN=Yes đều pass mới là pass
    const allYesPass = yesItems.length > 0 && yesItems.every(item => {
        if (item.YNWeight == 1 && item.TrongLuong != 1) return false;
        if (item.YNShrinkage == 1 && item.DoCoRut != 1) return false;
        if (item.YNWaterproof == 1 && item.ChongTham != 1) return false;
        return true;
    });

    const hasFail = dataArray.some(item => item.ResultQCStatus === 2 ||
        (item.YNWeight == 1 && item.TrongLuong == 2) ||
        (item.YNShrinkage == 1 && item.DoCoRut == 2) ||
        (item.YNWaterproof == 1 && item.ChongTham == 2)

    );

    const check = dataArray.every(item =>
        item.TrongLuong == 2 ||
        item.DoCoRut == 2 ||
        item.ChongTham == 2
    );

    console.log(`hasAnyResult: `, hasAnyResult)
    console.log(`hasFail: `, hasFail)
    console.log(`check: `, check)
    console.log(`allYesPass: `, allYesPass)

    if (!hasAnyResult) {
        if (yesItems.length > 0) {
            $("#resultQC-pass").prop("checked", false);
            $("#resultQC-fail").prop("checked", false);
        }
        else if (hasFail || check) {
            $("#resultQC-pass").prop("checked", false);
            $("#resultQC-fail").prop("checked", true);
        } else {
            $("#resultQC-pass").prop("checked", true);
            $("#resultQC-fail").prop("checked", false);
        }
    }
    else if (hasFail) {
        $("#resultQC-pass").prop("checked", false);
        $("#resultQC-fail").prop("checked", true);
    } else if (allYesPass) {
        $("#resultQC-pass").prop("checked", true);
        $("#resultQC-fail").prop("checked", false);
    } else {
        $("#resultQC-pass").prop("checked", false);
        $("#resultQC-fail").prop("checked", false);
    }

    bodyHTML += '</tbody>';
    $(".noteMer-result").text(dataArray[0]?.GhiChu_Mer ?? "")

    bodyHTML += `<tr>
        <td colspan="2" class="label-col">
            <span class="label-text">Note (ghi chú): ghi rõ số lỗi kiểm và mức độ ánh màu so với mẫu duyệt /</span>
            <span class="label-english">State total defects, total points, and color levels compared to the approved sample</span>
        </td>`;

    // Thêm textarea cho mỗi loại vải
    dataArray.forEach((item, colIndex) => {
        const noteValue = item.Note || '';
        bodyHTML += `<td colspan="5" class="value-col">
            <textarea  style="color:" class="form-control text-left"
                data-field="Note" data-col="${colIndex}" 
                rows="2" readonly>${noteValue}</textarea>
        </td>`;
    });
    bodyHTML += '</tbody>';
    // Render vào table
    $('.inspection-table').html(headerHTML + bodyHTML);
    $('.inspection-table').find('textarea').attr('readonly', 'readonly');
    $('.inspection-table').find('input[type="radio"]').addClass('no-click');
    $('.inspection-table').find('input[type="checkbox"]').addClass('no-click');
    mergeSttCells()
}

function mergeSttCells() {
    const rows = $('.inspection-table tbody tr');
    let currentStt = null;
    let startIndex = 0;
    let count = 0;

    rows.each(function (index) {
        const sttCell = $(this).find('td.row-number');
        const sttValue = sttCell.text().trim();

        if (sttValue === currentStt) {
            // Nếu STT trùng với dòng trước, ẩn cell này
            sttCell.hide();
            count++;
        } else {
            // Nếu STT khác, merge các cell trước đó
            if (count > 0) {
                const firstCell = $(rows[startIndex]).find('td.row-number');
                firstCell.attr('rowspan', count + 1);
                firstCell.css({
                    'vertical-align': 'middle',
                    'text-align': 'center'
                });
            }

            // Reset cho nhóm mới
            currentStt = sttValue;
            startIndex = index;
            count = 0;
        }

        // Xử lý dòng cuối cùng
        if (index === rows.length - 1 && count > 0) {
            const firstCell = $(rows[startIndex]).find('td.row-number');
            firstCell.attr('rowspan', count + 1);
            firstCell.css({
                'vertical-align': 'middle',
                'text-align': 'center'
            });
        }
    });
}
// Khi nhấn nút Xác nhận
$('#btnConfirm').on('click', function () {
    if (currentTextarea) {
        var newValue = $('#modalTextarea').val();
        currentTextarea.val(newValue);
        currentTextarea.text(newValue);
    }
    $('#inputModal').modal('hide');
});

// Xóa currentTextarea khi đóng modal
$('#inputModal').on('hidden.bs.modal', function () {
    currentTextarea = null;
    $('#modalTextarea').val('');
});

// Cho phép nhấn Enter để xuống dòng trong modal textarea
$('#modalTextarea').on('keydown', function (e) {
    if (e.keyCode === 14) {
        e.stopPropagation();
    }
});
$("#inputModal").on('shown.bs.modal', function () {
    $("#modalTextarea").removeAttr('readonly');  // Dùng # cho id, và removeAttr thay vì attr('readonly', '')
    $("#modalTextarea").focus();
});
var imageSignClass;

async function CallModal(className) {
    if (!isCheckTBPKyTen(className)) return;
    imageSignClass = className
    var dataUser = !window.CefSharp ? userNameSave : userName
    const checkImage = imageSignClass == "image1" ? 1 : imageSignClass == "image2" ? 2 : 3
    const checkSign = await GetCheckSign(dataUser, checkImage)
    const textImage = checkImage == 1 ? 'Ngày kiểm tra' : checkImage == 2 ? "TPCL xác nhận/QC manager confirm" : "Nhận thông tin/Received info"
    if (checkSign != 1) {
        showToast('warning', `Tài khoản của bạn không ký được vào ${textImage}!`, 1500);
        return
    } else {
        $("#signatureModal").modal("show")
    }
}


function Scroll() {
    window.scrollTo(0, scrollPosition);
}

async function SaveSign(imageData) {
    console.log(`imageSignClass: `, imageSignClass)
    const dot = $("#Dot").val()
    var dataUser = !window.CefSharp ? userNameSave : userName
    var arr = []
    const item = {
        ID: dataUser,
        SoLoID: $("#SoLo").val(),
        LoaiVai: $("#LanKiem").val(),
        MaVTID: '',
        MauVTID: dot,
        Sign: imageSignClass == "image1" ? imageData : "",
        SignManager: imageSignClass == "image2" ? imageData : "",
        SignReceive: imageSignClass == "image3" ? imageData : "",
        MaNPL: $("#MauVai").val()
    };
    arr.push(item)
    const request = new Request(`/api/KiemVai/PostSign?action=PostSign&type=@TypeTableSign`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(arr),
    });
    let response = await fetch(request)
    let data = await response.json()
    if (data.toUpperCase() == "TRUE") {
        GetBCKiemVai();
        showToast('success', `Lưu chữ ký thành công!`, 1500);
    }
    else {
        showToast('error', `Lưu chữ ký thất bại!`, 2000);
        return
    }
}

async function renderImage() {
    const url = `/api/KiemVai/Get?action=GetSignKiemVaiV2&para1=${$("#SoLo").val()}&para2=${$("#MauVai").val()}&para3=${$("#Dot").val()}&para4=${$("#LanKiem").val()}`
    try {
        const response = await fetch(url)

        const result = await response.json();

        return result.dt1

    } catch (err) {
        console.error(err)
    }
}

async function Export() {

    const btn = $("#btnExport");
    const originalText = btn.text();
    btn.text("Đang Xuất EX ...").prop("disabled", true);

    try {
        let dataImage = await renderImage()

        const hasFailResultQC = dataKiem.some(status => status.ResultQCStatus === 2);
        let arrThongSo = await [
            $("#KhachHang").val(),
            $("#nhacungcap ").val(),
            $("#SoLo option:selected").text(),

            dataImage[0]?.Sign,
            dataImage[0]?.SignManager,
            dataImage[0]?.SignReceive,
            $("#resultQC-pass").is(":checked"),
            $("#resultQC-fail").is(":checked"),
            $(".text-result").val(),
            $("#Dot option:selected").data("ngaynhapkho"),
            hasFailResultQC
        ]

        dataKiem.map(item => {
            const itemImages = dataImageEX.filter(image => image.BarCode == item.BarCode)
            item.Images = JSON.stringify(itemImages)
        })

        let dataToSend = JSON.stringify({
            ArrBody: dataKiem,
            ArrBodyErrorPoint: dataErrorPoint,
            ArrThongSo: arrThongSo
        });

        console.log(`ArrBody: `, JSON.parse(dataToSend).ArrBody);

        var url = `/api/KiemVai/EXBCKTVaiV2`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: dataToSend,
        }).then(response => {
            return response.blob();
        }).then(blob => {
            var a = document.createElement("a");
            var url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = 'BaoCaoKTCLVai.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        });

    } catch (err) {
        console.error("Lỗi xuất Excel:", err);
    } finally {
        btn.text(originalText).prop("disabled", false);
    }
}
async function SaveResult() {
    const batchjoin = selectedItems.map(item => item.batch)
    const lotjoin = selectedItems.map(item => item.lot)
    const mauVTID = $("#MauVai option:selected").data("mauvt")

    var dataUser = !window.CefSharp ? userNameSave : userName

    var arr = []
    batchjoin.forEach((x, index) => {
        let statusResultMer = null;

        if ($("#resultMer-pass").is(":checked")) {
            statusResultMer = 1;
        } else if ($("#resultMer-fail").is(":checked")) {
            statusResultMer = 2;
        }
        const item = {
            ID: 0,
            SoLoID: $("#SoLo").val(),
            LoaiVai: $("#PhuLieuA").val(),
            MaVTID: $("#Dot").val(),
            MauVTID: dataUser,
            LOT: statusResultMer,
            Batch: $(".noteMer-result").val().trim(),
            ResultQC: $(".text-result").val().trim(),
            StatusResultQC: $("#resultQC-pass").is(":checked") ? 1 : $("#resultQC-fail").is(":checked") ? 0 : null,
            MaNPL: maNPL,
            LanKiem: $("#LanKiem").val()
        };
        arr.push(item)
    })
    await Save(arr, "UpdateResult", "@TypeTableV2")



}
async function Save(arrSave, action, type) {

    const request = new Request(`/api/KiemVai/PostKiemVaiV2?action=${action}&type=${type}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(arrSave),
    });
    let response = await fetch(request)
    let data = await response.json()
    if (data == "True") {
        showToast('success', `Cập nhật  thành công!`, 1500);
    }
    else {
        showToast('error', `Cập nhật thất bại!`, 2000);
        return
    }
}
function showToast(type, message, delay = 2000) {
    let toastId, messageId;

    switch (type) {
        case 'success':
            toastId = 'successToast';
            messageId = 'successMessage';
            break;
        case 'error':
            toastId = 'errorToast';
            messageId = 'errorMessage';
            break;
        case 'warning':
            toastId = 'warningToast';
            messageId = 'warningMessage';
            break;
        default:
            console.error('Unknown toast type:', type);
            return;
    }

    $('#' + messageId).html(message);

    const toastElement = $('#' + toastId)[0];
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: delay
    });

    toast.show();
}


var canvas, ctx;
let isDrawing = false;
let penColor = '#000000';
let penSize = 2;
let signatureHistory = [];
let currentStroke = [];

$(document).ready(function () {
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
        alert('Vui lòng ký tên trước khi lưu!');
        return;
    }


    const signatureImage = canvas.toDataURL('image/png');
    const imgElement = document.querySelector('.' + imageSignClass);
    if (imgElement) {
        imgElement.src = signatureImage; // Gán hình vào đúng img
    }
    SaveSign(signatureImage)
    $('#signatureModal').modal('hide');

}






let currentStream = null;
let currentContainer = null;
let currentFacingMode = 'environment'; // 'environment' (camera sau) hoặc 'user' (camera trước)
const imageData = {};
function handleImageClick(container) {
    currentContainer = container; // Lưu DOM element
    const $container = $(container); // jQuery object


    const img = $container.find("img");
    if (img.length > 0) {

        const src = img.attr("src");
        showPreview(src);
    } else {
        console.log("Chưa có ảnh, mở modal chọn nguồn");
        showOptionModal();
    }
}
function showPreview(src) {
    $("#previewImage").attr("src", src);
    $("#previewModal").modal('show'); // Dùng jQuery addClass
}

//Kiểm tra số cây trong từng batch/lot
async function checkMinFabricQuantity(items) {
    const mauVTID = $("#MauVai option:selected").data("mauvt");
    const invalidItems = [];

    const checks = items.map(async (item) => {
        const url = `/api/KiemVai/Get?action=GetCay&para1=${$("#SoLo").val()}&para2=${$("#MauVai").val()}&para3=${mauVTID}&para4=${item.batch}&para5=${item.lot}`;
        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                if (!data.dt1 || data.dt1.length < 2) {
                    invalidItems.push(`${data.dt1[0].Display}${data.dt1[0].SoKienHienThi}`);
                }
            }
        } catch (error) {
            console.error("Lỗi kiểm tra số cây:", error);
        }
    });

    await Promise.all(checks);
    return invalidItems;
}

async function checkAllMinFabricByAPI(data, mauVTID) {
    if (!data || data.length === 0) return;

    const soloVal = $("#SoLo").val();
    const mauVaiVal = $("#MauVai").val();
    let invalidList = [];

    const checks = data.map(async (item) => {
        const url = `/api/KiemVai/Get?action=CheckingSoCayBatchLot&para1=${soloVal}&para2=${mauVaiVal}&para3=${mauVTID}&para4=${item.MaNPL}&para8=2`;

        try {
            const response = await fetch(url);
            if (response.ok) {
                const resData = await response.json();

                if (Array.isArray(resData.dt1)) {
                    resData.dt1.forEach(info => {
                        if (info.SoCayCanKiem > 1 && info.SoCayDaKiem < 2) {
                            if (info.SoLoT == item.SoLoT) {
                                invalidList.push(item.Display);
                            }
                        }
                    });
                }
            }
        } catch (error) {
            console.error("Lỗi khi check item:", item.Display, error);
        }
    });

    await Promise.all(checks);

    const alertBox = $("#minFabricAlert");
    if (invalidList.length > 0) {
        const message = `<strong>Thông báo:</strong> Các Batch/LOT sau có ít hơn 2 cây: <strong>${invalidList.join(", ")}</strong>.`;
        alertBox.find("div").html(message);
        alertBox.attr("style", "display: flex !important; padding: 5px !important; margin-bottom: 5px;");
    } else {
        alertBox.attr("style", "display: none !important;");
    }
    updateTableHeight();
}

//function displayFabricAlert(invalidList) {
//    const alertBox = $("#minFabricAlert");
//    if (invalidList.length > 0) {
//        const message = `Các Batch/LOT sau có ít hơn 2 cây: <strong>${invalidList.join(", ")}</strong>. Vui lòng cần ít nhất 2 cây.`;
//        alertBox.find("div").html(message);
//        alertBox.attr("style", "display: flex !important; padding: 5px !important; margin-bottom: 5px;");
//    } else {
//        alertBox.attr("style", "display: none !important; padding: 5px !important");
//    }
//    updateTableHeight();
//}

function updateTableHeight() {
    const fabricAlert = $("#minFabricAlert");
    const percentAlert = $("#percentInput");
    const tableContainer = $(".inspection-table").parent();

    // Nếu một trong hai hoặc cả hai đang hiển thị
    if (fabricAlert.is(':visible') || percentAlert.is(':visible')) {
        let offset = 125;
        if (fabricAlert.is(':visible')) offset += 40;
        if (percentAlert.is(':visible')) offset += 60;

        tableContainer.css("max-height", `calc(100vh - ${offset}px)`);
    } else {
        tableContainer.css("max-height", "700px");
    }
}

//Kiểm tra vải kiểm >= 10% vải nhập
function checkLowInspectionRatio(data) {
    const alertBox = $("#percentInput");
    if (!data || data.length === 0) {
        alertBox.attr("style", "display: none !important;");
        return;
    }

    let warningList = [];

    data.forEach(item => {
        const nhap = parseFloat(item.SoLuongVaiNhap) || 0;
        const kiem = parseFloat(item.SoLuongVaiKiem) || 0;

        if (nhap > 0 && kiem < (nhap * 0.1)) {
            const ratio = nhap > 0 ? ((kiem / nhap) * 100).toFixed(1) : 0;
            warningList.push(`${item.Display} (Kiểm: ${ratio}%)`);
        }
    });

    if (warningList.length > 0) {
        const message = `<strong>Cảnh báo:</strong> Các Batch/Lot có tỉ lệ kiểm ít hơn 10%: <br> ${warningList.join(", ")}`;
        alertBox.find("div").html(message);
        alertBox.attr("style", "display: flex !important; padding: 5px !important; margin-bottom: 5px;");
    } else {
        alertBox.attr("style", "display: none !important;");
    }
    updateTableHeight();
}
$(function () {
    if (window.CefSharp) {
        $(".fa-home").css("display", "none");
    }
})


/// Kiệt -- Duyệt QC
async function PostDuyetQC(soLoID, maNPL, dot, lanKiem) {
    try {
        const url = `/api/KiemVai/Get?action=DuyetQC&para1=${soLoID}&para2=${maNPL}&para3=${dot}&para4=${lanKiem}`

        await fetch(url);

        showToast("success", "Duyệt QC thành công !")

    } catch (err) {
        console.error(err)
    }
}
async function GetChuKy() {
    try {
        var dataUser = !window.CefSharp ? userNameSave : userName
        const url = `/api/KiemVai/Get?action=GetSign&para1=${dataUser}`

        const response = await fetch(url);
        const data = await response.json();
        const kyTenImage = data.dt1[0].Img;
        $('#previewImageDuyetQC').attr('src', kyTenImage)

        return kyTenImage;

    } catch (err) {
        console.error(err)
    }
}
async function GetIsCheckDuyetQC(soLoID, maNPL, dot, lanKiem) {
    try {
        const url = `/api/KiemVai/Get?action=CheckDuyetQC&para1=${soLoID}&para2=${maNPL}&para3=${dot}&para4=${lanKiem}`

        const response = await fetch(url);
        const data = await response.json();
        if (data.dt1.length > 0) {
            return true
        } else {
            return false
        }
    } catch (err) {
        console.error(err)
    }
}

async function updateGhiChu() {
    const ghiChu = $("#ghiChuSign").val().trim();
    const dot = $("#Dot").val();

    console.log(`dot: `, dot)

    var arr = []
    const item = {
        ID: 0,
        SoLoID: $("#SoLo").val(),
        LoaiVai: $("#LanKiem").val(),
        MaVTID: ghiChu,
        MauVTID: dot,
        Sign: '',
        SignManager: '',
        SignReceive: '',
        MaNPL: $("#MauVai").val()
    };
    arr.push(item)
    const request = new Request(`/api/KiemVai/PostSign?action=PostSign&type=@TypeTableSign`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(arr),
    });
    let response = await fetch(request)
    let data = await response.json()
    if (data.toUpperCase() == "TRUE") {
        showToast('success', `Cập nhật ghi chú thành công!`, 1500);
    }
    else {
        showToast('error', `Lưu ghi chú thất bại!`, 2000);
        return
    }
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

async function ResultHT() {
    const soLoID = $("#SoLo").val() ?? ""
    const maNPL = $("#MauVai").val() ?? ""
    const dot = $("#Dot").val() ?? ""
    const url = `/api/KiemVai/Get?action=GetResultHT&para1=${soLoID}&para2=${maNPL}&para3=${dot}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status} `);

        let data = await response.json()
        return data.dt1[0].MaxValue

    } catch (error) {
        console.error(error.message);
    }
}
function imageToBase64(imageSrc) {
    return new Promise((resolve) => {
        const img = new Image();

        img.crossOrigin = 'anonymous';

        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            // fill nền trắng nếu export jpg
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(img, 0, 0);

            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };

        img.onerror = function (e) {
            console.log(e);
            resolve('');
        };

        img.src = imageSrc;
    });
}


let loc = 0;
async function GetCheckSign(user, checkImage) {

    const url = `/api/KiemVai/Get?action=CheckChuKy&para1=${user}&para2=${checkImage}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status} `);

        const data = await response.json();
        if (data.dt1[0] == null || data.dt1[0].length == 0) {
            return 0
        } else
            return 1

    } catch (error) {
        console.error(error.message);
    }
}

function isCheckTBPKyTen(target) {
    const txtSignManager = $(`.sign2`).text();
    if (target == 'image3' && !txtSignManager) {
        showToast('warning', 'TBP chưa ký tên !')
        return false;
    }

    return true;
}
$(function () {
    $(".btnKyTuDong").on("click", async function (e) {
        e.preventDefault();
        e.stopPropagation();
        const target = $(this).data("target") // "image1", "image2", "image3"
        imageSignClass = target

        if (!isCheckTBPKyTen(target)) return;

        var dataUser = !window.CefSharp ? userNameSave : userName
        const checkImage = imageSignClass == "image1" ? 1 : imageSignClass == "image2" ? 2 : 3
        const checkSign = await GetCheckSign(dataUser, checkImage)
        const textImage = checkImage == 1 ? 'Ngày kiểm tra' : checkImage == 2 ? "TPCL xác nhận/QC manager confirm" : "Nhận thông tin/Received info"
        if (checkSign != 1) {
            showToast('warning', `Tài khoản của bạn không ký được vào ${textImage}!`, 1500);
            return
        } else {


            const kyTenImage = await GetChuKy()

            $(`.signature-image.${target}`).attr("src", kyTenImage)

            const base64 = await imageToBase64(kyTenImage);

            SaveSign(base64)
        }


    })

    let oldKetLuanQC = "";


    $('.text-result').on('blur', function (e) {
        const text = $(this).val().trim();
        if (!text) return;
        if (text === oldKetLuanQC) return;
    });


    $(".text-result").on('focus', function () {
        oldKetLuanQC = $(this).val().trim();
    });


    let oldKetLuanMer = "";


    $('.noteMer-result').on('blur', async function () {
        const dataUser = !window.CefSharp ? userNameSave : userName;
        const checkSign = await GetCheckSign(dataUser, 3);

        if (checkSign != 1) {
            return;
        }

        const text = $(this).val().trim();
        if (!text) return;
        if (text === oldKetLuanMer) return;

    });

    $(".noteMer-result").on('focus', async function () {
        const dataUser = !window.CefSharp ? userNameSave : userName;
        const checkSign = await GetCheckSign(dataUser, 3);

        if (checkSign != 1) {
            showToast('warning', 'Tài khoản của bạn không được nhập ghi chú của Mer!', 1500);

            $(this).prop('readonly', true);
            $(this).blur();

            return;
        }

        $(this).prop('readonly', false);
        oldKetLuanMer = $(this).val().trim();
    });
    let oldResultMer = null;


    $('input[name="resultMer"]').change(async function () {

        const dataUser = !window.CefSharp ? userNameSave : userName;
        const checkSign = await GetCheckSign(dataUser, 3);

        if (checkSign != 1) {

            if (ketLuanMer == "1") {
                $("#resultMer-pass").prop("checked", true)
                $("#resultMer-fail").prop("checked", false)
            } else if (ketLuanMer == "2") {
                $("#resultMer-pass").prop("checked", false)
                $("#resultMer-fail").prop("checked", true)
            } else {
                $("#resultMer-pass").prop("checked", false)
                $("#resultMer-fail").prop("checked", false)
            }


            showToast('warning', 'Tài khoản của bạn không được kết luận của Mer!', 2500);
            return;
        }

        oldResultMer = $(this).val();
    });
    $("#btnResetMer").on("click", function () {
        $("#resultMer-pass").prop("checked", false)
        $("#resultMer-fail").prop("checked", false)
    });
    $("#btnSaveMer").on("click", function () {

        SaveResult();

        // TODO: gọi API hoặc xử lý lưu dữ liệu
    });
    $("#ghiChuSign").on('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
    })

    let oldGhiChu = "";

    $("#ghiChuSign").on('focus', function () {
        oldGhiChu = $(this).val().trim();
    });

    $("#ghiChuSign").on('blur', function () {
        const text = $(this).val().trim();
        if (!text) return;
        if (text === oldGhiChu) return;
        updateGhiChu();
    });

    $("#changeViTri").on("change", function () {
        loc = $(this).val();

        $("#SoLo").empty();
        $("#MauVai").empty();
        $("#Dot").empty();
        $("#LanKiem").empty();
        $("#KhachHang").empty();
        $("#nhacungcap").val('');
        $("#batchInput").val("");
        $('.inspection-table').empty();
        $(".divResult").addClass("d-none");


        if (loc == 0) {
            GetSoLoID();

            const select2IdSoLo = $("#SoLo").attr("data-select2-id");
            const select2IdMauVai = $("#MauVai").attr("data-select2-id");

            $("#SoLo").attr("id", "SoLo_temp");
            $("#MauVai").attr("id", "SoLo");
            $("#SoLo_temp").attr("id", "MauVai");

            $("#SoLo").attr("data-select2-id", select2IdSoLo);
            $("#MauVai").attr("data-select2-id", select2IdMauVai);

            $("#SoLo").closest(".col-cus").find(".labelHeader").text("PO");
            $("#SoLo").attr("onchange", "GetMauVai()");

            $("#MauVai").closest(".col-cus").find(".labelHeader").text("Mã Vật Tư");
            $("#MauVai").attr("onchange", "GetDot()");
        }
        if (loc == 1) {
            GetMauVai();

            const select2IdSoLo = $("#SoLo").attr("data-select2-id");
            const select2IdMauVai = $("#MauVai").attr("data-select2-id");


            $("#SoLo").attr("id", "SoLo_temp");
            $("#MauVai").attr("id", "SoLo");
            $("#SoLo_temp").attr("id", "MauVai");

            $("#SoLo").attr("data-select2-id", select2IdSoLo);
            $("#MauVai").attr("data-select2-id", select2IdMauVai);


            $("#SoLo").closest(".col-cus").find(".labelHeader").text("PO");
            $("#SoLo").attr("onchange", "GetDot()");

            $("#MauVai").closest(".col-cus").find(".labelHeader").text("Mã Vật Tư");
            $("#MauVai").attr("onchange", "GetSoLoID()");

        }
    });

    $("#SoLo").on("change", function () {
        if (loc == 0) {
            $("#KhachHang").val($(this).find("option:selected").data("khachhang"));
            $("#nhacungcap").val($(this).find("option:selected").data("ncc"));
        }
    })

    $("#MauVai").on("change", function () {
        if (loc == 1) {
            $("#KhachHang").val($(this).find("option:selected").data("khachhang"));
            $("#nhacungcap").val($(this).find("option:selected").data("ncc"));
        }
    })

})



async function GetLanKiem() {
    const soLo = $("#SoLo").val();
    const maNPL = $("#MauVai").val();
    const dot = $("#Dot").val()
    try {

        const url = `/api/KiemVai/Get?action=GetLanKiem&para1=${soLo}&para2=${maNPL}&para3=${dot}&para4=2&para8=2`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status} `);

        const data = await response.json();
        let html = ``;

        lanKiem = data.dt1[0].LanKiemMax;

        data.dt1.map(x => {
            html += `
                <option data-xacnhan="${x.CheckXacNhan}" value="${x.LanKiem}">Lần ${Number(x.LanKiem) - 1}</option>
            `
        })

        $("#LanKiem").html(html);
        GetBatchLot()
    } catch (err) {
        console.error(err)
    }
}


async function GetIsDaDuyetQC(soLoID, maNPL, dot, lanKiem) {
    try {
        const url = `/api/KiemVai/Get?action=CheckDuyetQC&para1=${soLoID}&para2=${maNPL}&para3=${dot}&para4=${lanKiem}`

        const response = await fetch(url);
        const data = await response.json();
        if (data.dt2.length > 0) {
            return true
        } else {
            return false
        }
    } catch (err) {
        console.error(err)
    }
}
async function DuyetQC(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopPropagation(); // tránh gọi onclick của div cha

    const $img = $(".image2");
    const src = $img.prop("src");

    if (!$img.attr("src")) {
        showToast('warning', `Vui lòng ký tên trước khi duyệt nhé!`, 1500);
        return false;
    }
    var dataUser = !window.CefSharp ? userNameSave : userName
    const checkImage = 2
    const checkSign = await GetCheckSign(dataUser, checkImage)
    if (checkSign != 1) {
        showToast('warning', `Tài khoản của bạn không được duyệt!`, 1500);
        return
    }

    const itemCodeDisplay = $("#MauVai option:selected").text()
    const soLoID = $("#SoLo").val();
    const maNPL = $("#MauVai").val();
    const dot = $("#Dot").val();
    const lanKiem = $("#LanKiem").val();

    if (!itemCodeDisplay.trim()) {
        showToast('warning', 'Vui lòng chọn màu vải')
        return;
    }

    const isDaDuyetQC = await GetIsDaDuyetQC(soLoID, maNPL, dot, lanKiem)
    if (isDaDuyetQC) {
        showToast('warning', `Item Code: ${itemCodeDisplay} đã được duyệt QC`)
        return;
    }


    const isCoTheDuyetQC = await GetIsCheckDuyetQC(soLoID, maNPL, dot, lanKiem)
    if (isCoTheDuyetQC) {
        $("#DuyetQCModal").modal('show')
        $("#btnConfirmDuyetQC").off('click');
        $("#txtItemCode").text(itemCodeDisplay)
        $("#btnConfirmDuyetQC").on('click', async function (e) {
            PostDuyetQC(soLoID, maNPL, dot, lanKiem)
            const soLoText = $("#SoLo option:selected").text()
            // Ẩn modal sau khi xử lý
            $("#DuyetQCModal").modal('hide')
            const maxStatus = await ResultHT()

            const PassFail = maxStatus == 1 ? "PASS" : "Fail"
            const result = `\nKết quả: <color= ${PassFail.toUpperCase() == "PASS" ? "navy" : "red"}>${PassFail.toUpperCase()}</color>`
            const module = 'M.28.00.00'
            const title = ''
            const detail = `POMua: ${soLoText} - Vật tư ${$("#MauVai option:selected").text()} đã hoàn thành duyệt ${result} !`
            const BoPhan = 'ALL'

            var arrayNotify = [];
            var dataUser = !window.CefSharp ? userNameSave : userName
            arrayNotify.push(
                {
                    UserIDTao: dataUser,
                    FrmName: module,
                    Title: title,
                    Detail: detail,
                    SendTo: "Kho",
                    BoPhan: BoPhan,
                    Status: -1,
                    IsQLSX: 0,
                    MaPhieu: ""
                },

                {
                    UserIDTao: dataUser,
                    FrmName: module,
                    Title: title,
                    Detail: detail,
                    SendTo: "SX",
                    BoPhan: BoPhan,
                    Status: 1,
                    IsQLSX: 0,
                    MaPhieu: ""
                },
                {
                    UserIDTao: dataUser,
                    FrmName: module,
                    Title: title,
                    Detail: detail,
                    SendTo: "PKH",
                    BoPhan: BoPhan,
                    Status: 0,
                    IsQLSX: 0,
                    MaPhieu: ""
                }
            );
            await sendNotifyMuti(arrayNotify)

        })
    } else {
        showToast('warning', `Item Code: ${itemCodeDisplay} chưa được xác nhận hoàn thành kiểm`)
    }
}

function setTrangThaiDuyet(value) {
    const $el = $("#trangThaiDuyet");
    if (value == 1) {
        $el.text("✔ Đã Duyệt")
            .css({ "background-color": "#d4edda", "color": "#155724", "border-color": "#c3e6cb" });
    } else {
        $el.text("✘ Chưa Duyệt")
            .css({ "background-color": "#f8d7da", "color": "#721c24", "border-color": "#f5c6cb" });
    }
}
let imgScale = 1, imgRotation = 0, imgFlipped = false;
let panX = 0, panY = 0;
let isDragging = false, dragStartX = 0, dragStartY = 0;
let rafId = null;

function applyImgTransform() {
    const img = document.getElementById('previewImage');
    if (!img) return;
    const flipScale = imgFlipped ? -1 : 1;
    img.style.transform = `translate(${panX}px,${panY}px) scale(${imgScale},${flipScale * imgScale}) rotate(${imgRotation}deg)`;
}

function applyImgTransformRAF() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(applyImgTransform);
}

function imgZoomIn() { imgScale = Math.min(imgScale + 0.25, 5); applyImgTransform(); }
function imgZoomOut() { imgScale = Math.max(imgScale - 0.25, 0.25); applyImgTransform(); }
function imgRotate(deg) { imgRotation = (imgRotation + deg) % 360; applyImgTransform(); }
function imgFlip() { imgFlipped = !imgFlipped; applyImgTransform(); }

function imgResetTransform() {
    imgScale = 1; imgRotation = 0; imgFlipped = false;
    panX = 0; panY = 0;
    applyImgTransform();
}

// Reset khi đổi ảnh
function previewPrevImage() {
    imgResetTransform();
    currentPreviewIndex--;
    updateBCPreview();
}

function previewNextImage() {
    imgResetTransform();
    currentPreviewIndex++;
    updateBCPreview();
}

// Drag + scroll zoom
document.addEventListener('DOMContentLoaded', function () {
    const vp = document.getElementById('imgViewport');
    if (!vp) return;

    vp.addEventListener('wheel', function (e) {
        e.preventDefault();
        e.deltaY < 0 ? imgZoomIn() : imgZoomOut();
    }, { passive: false });

    vp.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return;
        isDragging = true;
        dragStartX = e.clientX - panX;
        dragStartY = e.clientY - panY;
        vp.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        panX = e.clientX - dragStartX;
        panY = e.clientY - dragStartY;
        applyImgTransformRAF();
    });

    document.addEventListener('mouseup', function () {
        if (!isDragging) return;
        isDragging = false;
        vp.style.cursor = 'grab';
    });

    // Pinch zoom mobile
    let lastTouchDist = null;
    vp.addEventListener('touchstart', function (e) {
        if (e.touches.length === 1) {
            isDragging = true;
            dragStartX = e.touches[0].clientX - panX;
            dragStartY = e.touches[0].clientY - panY;
        } else if (e.touches.length === 2) {
            isDragging = false;
            lastTouchDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY);
        }
        e.preventDefault();
    }, { passive: false });

    vp.addEventListener('touchmove', function (e) {
        if (e.touches.length === 1 && isDragging) {
            panX = e.touches[0].clientX - dragStartX;
            panY = e.touches[0].clientY - dragStartY;
            applyImgTransformRAF();
        } else if (e.touches.length === 2 && lastTouchDist) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY);
            imgScale = Math.min(Math.max(imgScale + (dist - lastTouchDist) * 0.01, 0.25), 5);
            lastTouchDist = dist;
            applyImgTransformRAF();
        }
        e.preventDefault();
    }, { passive: false });

    vp.addEventListener('touchend', () => { isDragging = false; lastTouchDist = null; });
});