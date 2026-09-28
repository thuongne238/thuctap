
var userNameSave = "";
var maKHSoLo = ""
var IDError = "";
var IDPhieu = 0
$(document).ready(function () {
    GetSoLoID()
    userNameSave = localStorage.getItem('username');
});
async function GetSoLoID() {
    const maNPL = $("#MauVai").val();
    const url = `/api/KiemVai/Get?action=GetSoLo&para1=${maNPL}&para2=${loc}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status} `);

        const data = await response.json();
        let html = loc == 1 ? `` : `<option value=""></option>`;
        data.dt1.map(x => {
            html += `
                <option  data-solotext="${x.SoLo}" data-ncc="${x.NCC}" data-khachhang="${x.MaKH}" data-mahang="${x.MaHang}" value="${x.SoloID}">${x.SoLo} - ${x.NgayNhap} - PO Mua: ${x.POMua}</option>
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
        GetKhachHang();

    } catch (error) {
        console.error(error.message);
    }
}
async function GetKhachHang() {
    const NCC = $("#SoLo option:selected").data("ncc")
    $("#nhacungcap").val(NCC)
    //if (loc == 0) GetMauVai(null);
    const makh = $("#SoLo option:selected").data("khachhang")
    const url = `/api/KiemVai/Get?action=GetKH&para1=${$("#SoLo").val()}&para2=${loc}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status} `);

        const data = await response.json();
        let html = `<option value=""></option>`;
        data.dt1.map(x => {
            html += `
                <option  value="${x.MaKH}">${x.TenKH}</option>
            `
        })
        $("#KhachHang").html(html)

        if (makh != "" || makh != null) {
            $("#KhachHang").val(makh).trigger("change")
        }
    } catch (error) {
        console.error(error.message);
    }
}
async function GetMaHang() {
    const mahang = $("#SoLo option:selected").data("mahang")

    const url = `/api/KiemVai/Get?action=GetMH&para1=${$("#KhachHang").val()}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status} `);

        const data = await response.json();
        let html = `<option value=""></option>`;
        data.dt1.map(x => {
            html += `
                <option value="${x.MaHang}">${x.TenHang}</option>
            `
        })
        $("#MaHang").html(html)
        $("#MaHang").val("")
        if (mahang != "" || mahang != null) {
            $("#MaHang").val(mahang).trigger("change")
        }
    } catch (error) {
        console.error(error.message);
    }
}

async function GetMauVai(value, maNPL) {

    const url = `/api/KiemVai/Get?action=GetMaSoVai&para1=${$("#SoLo").val()}&para2=${loc}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status} `);

        const data = await response.json();
        let html = ""
        if (value == null)
            html = `<option value=""></option>`;
        data.dt1.map(x => {
            html += `
                <option  data-slkv="${x.SLVaiKiem}" data-sltt="${x.SLTT}" data-mavt="${x.MaVT}" data-mauvt="${x.MauVTID}"
                data-donvi="${x.DonVi}" data-manpl="${x.MaNPL}" data-ngaynhapkho="${x.NgayNhapKho}"  data-mavtid="${x.MaVTID}"
                  value="${x.MaNPL}">${x.MaVT} - ${x.MauVT} - ${x.KhoVai} - ${x.DonVi}</option>
            `
        })
        $("#MauVai").html(html)
        if (maNPL) {
            $("#MauVai").val(maNPL).trigger("change")
        } else {
            if (value == null)
                $("#MauVai").val("")
        }

    } catch (error) {
        console.error(error.message);
    }
}
//
async function GetDot() {

    $("#LanKiem").empty();
    const mauvai = $("#MauVai option:selected").text()
    $(".text-loaivai").text(mauvai)

    const maNPL = $("#MauVai").val()
    const donVi = $("#MauVai option:selected").data("donvi")
    const lanKiem = $("#LanKiem").val() ?? 1
    $(".text-unit-receiving").text(donVi)

    const url = `/api/KiemVai/Get?action=GetDot&para1=${$("#SoLo").val()}&para2=${maNPL}&para3=${lanKiem}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status} `);
        const data = await response.json();
        let html = `<option value=""></option>`;
        data.dt1.map(x => {
            html += `
                <option data-sltt="${x.SLTT}" data-xacnhan="${x.CheckXacNhan}" value="${x.Dot}">${x.Display}</option>
            `
        })
        $("#Dot").html(html)
    } catch (error) {
        console.error(error.message);
    }
}
async function GetBatchLot() {
    const slttMau = $("#Dot option:selected").data("sltt")

    $(".text-receiving").val(slttMau)
    const xacNhanLo = $("#LanKiem option:selected").data("xacnhan")
    if (xacNhanLo == "1") {
        $(".xacNhanLoHT").css("display", "flex");
        $("#btnConfirmLo").attr("disabled", true)
        $("#SoCay").empty()
        $("#SoCayItem").empty()

        toggleFormEditing(false)
        return
    } else {
        $(".xacNhanLoHT").css("display", "none");
        $("#btnConfirmLo").attr("disabled", false)

        toggleFormEditing(true)
    }
    const selectedOption = $("#MauVai option:selected");
    const ngaynhapkho = selectedOption.data("ngaynhapkho")
    $("#Ngay").val(ngaynhapkho)

    $(".text-checking").val("");
    $(".text-itemKho").val("");
    $(".text-item").val("");
    $(".text-actualKho").val("");
    fillData(null)
    bindDefectData(null);

    const mauvai = $("#MauVai option:selected").text()
    $(".text-loaivai").text(mauvai)
    const mauVTID = $("#MauVai option:selected").data("mauvt")
    const maNPL = $("#MauVai").val()
    const donVi = $("#MauVai option:selected").data("donvi")
    $(".text-unit-receiving").text(donVi)
    const dot = $("#Dot").val()
    const url = `/api/KiemVai/Get?action=GetBatch&para1=${$("#SoLo").val()}&para2=${maNPL}&para3=${dot}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status} `);

        const data = await response.json();
        let html = `<option value=""></option>`;
        data.dt1.map(x => {
            html += `
                <option data-textvalue="${x.TextValue}"  data-batch="${x.Batch}" data-manpl="${x.MaNPL}" value="${x.SoLoT}">${x.Display}</option>
            `
        })
        $("#SoCay").html(html)
        $("#SoCay").val("")
        GetCay()
    } catch (error) {
        console.error(error.message);
    }
}
async function GetCay() {
    $(".text-checking").val("");
    $(".text-itemKho").val("");
    $(".text-item").val("");
    $(".text-actualKho").val("");
    fillData(null)
    bindDefectData(null);
    $(".text-batchlot").text(``)
    const mauvai = $("#MauVai option:selected").text()
    $(".text-loaivai").text(mauvai)
    const mauVTID = $("#MauVai option:selected").data("mauvt")
    const LOT = $("#SoCay").val()
    const batch = $("#SoCay option:selected").data("batch")
    const maNPL = $("#MauVai").val()
    //$("#text-receiving").val("")
    $("#text-checking").val("")
    $("#text-item").val("")
    const dot = $("#Dot").val()
    const url = `/api/KiemVai/Get?action=GetCay&para1=${$("#SoLo").val()}&para2=${maNPL}&para3=${mauVTID}&para4=${encodeURIComponent(batch)}&para5=${encodeURIComponent(LOT)}&para6=${dot}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status} `);

        const data = await response.json();
        let html = `<option value=""></option>`;
        data.dt1.map(x => {
            html += `
                <option data-dot="${x.Dot}" data-barcode="${x.BarCode}"  data-khovai="${x.KhoVai}" data-soghidaucay="${x.SoGhiDauCay}" data-trongluong=${x.TrongLuong} data-docorut=${x.DoCoRut} data-chongtham=${x.ChongTham}
                        data-slthucte=${x.SoGhiDauCay} data-ngaynhapkho="${x.NgayNhapKho}"  data-donvi="${x.DonVi}" data-donvikhovai="${x.DonViKhoVai}"
                value="${x.SoKienHienThi}">${x.SoKienHienThi}</option>
            `
        })
        $("#SoCayItem").html(html)
        $("#SoCayItem").val("")

    } catch (error) {
        console.error(error.message);
    }
}

function GetThongSo(selectedOption) {
    const trongLuong = selectedOption.data("trongluong");
    const doCoRut = selectedOption.data("docorut");
    const chongTham = selectedOption.data("chongtham");

    const updateStatus = (value, prefix) => {
        $(`#${prefix}-pass`).prop("checked", value == 1);
        $(`#${prefix}-fail`).prop("checked", value == 2);
        $(`#${prefix}-no`).prop("checked", value == 0 || value == "undefined" || value == null);
    };

    updateStatus(trongLuong, "weight");
    updateStatus(doCoRut, "shrinkage");
    updateStatus(chongTham, "waterproof");
}

async function GetDataKiemVai() {
    const mauVTID = $("#MauVai option:selected").data("mauvt")
    const LOT = $("#SoCay").val()
    const batch = $("#SoCay option:selected").data("batch")
    const cay = $("#SoCayItem option:selected").data("barcode")
    const lanKiem = $("#LanKiem").val();
    const url = `/api/KiemVai/Get?action=GetChiTiet&para1=${$("#SoLo").val()}&para2=${$("#MauVai").val()}&para3=${mauVTID}&para4=${encodeURIComponent(batch)}&para5=${encodeURIComponent(LOT)}&para6=${cay}&para7=${lanKiem}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status} `);


        IDError = createGuid()
        const data = await response.json();
        const record = data?.dt1?.[0] || null;

        fillData(data?.dt1?.[0] || null);
        bindDefectData(data?.dt2 || null);
        bindImageListData(data?.dt3 || null);
        if (record && record.IsXacNhan == 1) {
            toggleFormEditing(false);
        } else {
            toggleFormEditing(true);
        }

    } catch (error) {
        console.error(error.message);
    }
    sumPoint()
}
function bindImageListData(dt3) {
    $(".image-list").empty();

    if (!dt3 || dt3.length === 0) {
        return;
    }

    dt3.forEach(item => {
        const field = item.DataField;
        const imageName = item.Image;
        const ghiChu = item.GhiChu || "";

        if (!field || !imageName) return;

        if (!imageData[field] || !Array.isArray(imageData[field])) {
            imageData[field] = [];
        }

        const imageUrl = isBase64(imageName) || imageName.startsWith("/") || imageName.startsWith("http")
            ? `/Images/SignKiemVai/${imageName}`
            : `/Images/SignKiemVai/${imageName}`;

        imageData[field].push({
            url: imageUrl,
            note: ghiChu,
            imageName: imageName
        });
    });

    Object.keys(imageData).forEach(field => {
        if (Array.isArray(imageData[field])) {
            renderImageList(field);
        }
    });
}
function toggleFormEditing(isEditable) {
    const selectors = "input, textarea, .counter-value, .btn-plus, .btn-minus, .camera-image-container, .btn-save, #btnFinalSave";

    //if (!isEditable) {
    //    $("input, textarea").css("pointer-events", "none");
    //    $("input[type='radio'], select:not(#SoLo):not(#KhachHang):not(#MaHang):not(#MauVai):not(#SoCay):not(#SoCayItem)").css("pointer-events", "none");
    //    $(".btn-plus, .btn-minus").css("pointer-events", "none");
    //    $(".counter-value").css("pointer-events", "none");
    //    $(".camera-image-container").addClass("view-only-mode");
    //    $("#btnLuu").prop("disabled", true);
    //    $("textarea").prop("disabled", true);
    //    $(".form-check-label").css("pointer-events", "none");
    //    console.log("Form đã bị khóa do bản ghi đã xác nhận.");
    //} else {
    //    $("input, textarea").css("pointer-events", "auto");
    //    $("input[type='radio'], select").css("pointer-events", "auto");
    //    $(".btn-plus, .btn-minus").css("pointer-events", "auto").css("opacity", "1");
    //    $(".counter-value").css("pointer-events", "auto");
    //    $(".camera-image-container").removeClass("view-only-mode");
    //    $("#btnLuu").prop("disabled", false);
    //    $("textarea").prop("disabled", false)
    //    $('textarea.form-control').attr('readonly', 'readonly');
    //    $(".passed-result").css("pointer-events", "none");
    //    $(".failed-result").css("pointer-events", "none");
    //    $(".form-check-label").css("pointer-events", "auto");
    //    $('input[name="weight"], input[name="shrinkage"], input[name="waterproof"]').css("pointer-events", "none");
    //    $('input[name="weight"], input[name="shrinkage"], input[name="waterproof"]').closest('td').find('label').css("pointer-events", "none");
    //}

    $("input, textarea").css("pointer-events", "auto");
    $("input[type='radio'], select").css("pointer-events", "auto");
    $(".btn-plus, .btn-minus").css("pointer-events", "auto").css("opacity", "1");
    $(".counter-value").css("pointer-events", "auto");
    $(".camera-image-container").removeClass("view-only-mode");
    $("#btnLuu").prop("disabled", $("#LanKiem option:selected").data("xacnhan") == 1 ? true : false);
    $("textarea").prop("disabled", false)
    //$('textarea.form-control').attr('readonly', 'readonly');
    $(".passed-result").css("pointer-events", "none");
    $(".failed-result").css("pointer-events", "none");
    $(".form-check-label").css("pointer-events", "auto");
    $('input[name="weight"], input[name="shrinkage"], input[name="waterproof"]').css("pointer-events", "none");
    $('input[name="weight"], input[name="shrinkage"], input[name="waterproof"]')
        .each(function () {
            $(this).next('label').css("pointer-events", "none");
        });
}

function bindDefectData(dt2) {

    const mapKey = {
        "wrap bar": "Wrap-bar",
        "weft bar": "weft-bar",
        "holes": "holes",
        "oil stain/spot": "oil-stain",
        "color yarn": "color-yarn",
        "crease mark": "crease-mark",
        "other defects": "other"
    };

    // ===== NẾU KHÔNG CÓ DATA → RESET TẤT CẢ VỀ 0 =====
    if (!dt2 || dt2.length === 0) {
        $("tr[data-defect]").each(function () {
            $(this).find('[data-point="1"]').text(0);
            $(this).find('[data-point="2"]').text(0);
            $(this).find('[data-point="3"]').text(0);
            $(this).find('[data-point="4"]').text(0);
        });
        return;
    }

    // ===== NẾU CÓ DATA → GÁN LẠI =====
    dt2.forEach(item => {

        const points = (item.ErrorPoint || "0@0@0@0").split("@");
        const name = item.ErrorType.toLowerCase().trim();
        const defectKey = mapKey[name];

        if (!defectKey) return;

        const $row = $(`tr[data-defect="${defectKey}"]`);
        if ($row.length === 0) return;

        $row.find('[data-point="1"]').text(points[0] || 0);
        $row.find('[data-point="2"]').text(points[1] || 0);
        $row.find('[data-point="3"]').text(points[2] || 0);
        $row.find('[data-point="4"]').text(points[3] || 0);
    });
}

function resetForm() {
    $(".text-weight").val("");
    $(".text-shrinkage").val("");
    $(".text-waterproof").val("");

    $(".text-actual").val("");
    $(".text-cutprotect").val("");
    $(".text-colorthread").val("");
    $(".text-join").val("");
    $(".text-note").val("");
    $(".text-result").val("");
    $(".text-checkFace").val("")
    $(".text-checkBlack").val("")
    $(".text-checkloang").val("")
    $(".text-color").val("")
    $(".text-percent").val("")
    $(".sum1").text("")

    // Reset radio
    $("#weight-pass, #weight-fail").prop("checked", false);
    $("#shrinkage-pass, #shrinkage-fail").prop("checked", false);
    $("#waterproof-pass, #waterproof-fail").prop("checked", false);
    $("#resultQC-pass, #resultQC-fail").prop("checked", false);
    $("#checkFace-pass, #checkFace-fail").prop("checked", false);
    $("#checkBlack-pass, #checkBlack-fail").prop("checked", false);
    $("#checkloang-pass, #checkloang-fail").prop("checked", false);
    $("#color-pass, #color-fail").prop("checked", false);
    $("#percent-pass, #percent-fail").prop("checked", false);

    $("#color-no").prop("checked", false);
    $("#weight-no").prop("checked", false);
    $("#shrinkage-no").prop("checked", false);
    $("#waterproof-no").prop("checked", false);
    $("#resultQC-no").prop("checked", false);
    $("#checkFace-no").prop("checked", false);
    $("#checkBlack-no").prop("checked", false);
    $("#checkloang-no").prop("checked", false);
    $("#percent-no").prop("checked", false);

    $(".passed-result").prop("checked", false);
    $(".failed-result").prop("checked", false);

    IDPhieu = 0
    return;
}

function fillData(data) {
    clearAllImages();
    // ===== NẾU KHÔNG CÓ DATA → RESET FORM =====
    if (!data) {

        $(".text-weight").val("");
        $(".text-shrinkage").val("");
        $(".text-waterproof").val("");

        $(".text-actual").val("");
        $(".text-cutprotect").val("");
        $(".text-colorthread").val("");
        $(".text-join").val("");
        $(".text-note").val("");
        $(".text-result").val("");
        $(".text-checkFace").val("")
        $(".text-checkBlack").val("")
        $(".text-checkloang").val("")
        $(".sum1").val("0")

        // Reset radio
        //$("#weight-pass, #weight-fail").prop("checked", false);
        //$("#shrinkage-pass, #shrinkage-fail").prop("checked", false);
        //$("#waterproof-pass, #waterproof-fail").prop("checked", false);
        $("#resultQC-pass, #resultQC-fail").prop("checked", false);
        $("#checkFace-pass, #checkFace-fail").prop("checked", false);
        $("#checkBlack-pass, #checkBlack-fail").prop("checked", false);
        $("#checkloang-pass, #checkloang-fail").prop("checked", false);
        $("#color-pass, #color-fail").prop("checked", false);
        $("#percent-pass, #percent-fail").prop("checked", false);
        $("#text-actual-pass, #text-actual-fail").prop("checked", false);
        $("#text-actualKho-pass, #text-actualKho-fail").prop("checked", false);
        $(".passed-result-tree, .failed-result-tree").prop("checked", false);
        $(".passed-result-mer, .failed-result-mer").prop("checked", false);

        $("#color-no").prop("checked", false);
        //$("#weight-no").prop("checked", false);
        //$("#shrinkage-no").prop("checked", false);
        //$("#waterproof-no").prop("checked", false);
        $("#resultQC-no").prop("checked", false);
        $("#checkFace-no").prop("checked", false);
        $("#checkBlack-no").prop("checked", false);
        $("#checkloang-no").prop("checked", false);
        $("#percent-no").prop("checked", false);
        $("#text-actual-no").prop("checked", false);
        $("#text-actualKho-no").prop("checked", false);

        $('input[name="ynweight"], input[name="ynshrinkage"], input[name="ynwaterproof"]').prop("checked", false);


        IDPhieu = 0;
        return; // thoát hàm
    }

    // ===== NẾU CÓ DATA → GÁN GIÁ TRỊ =====
    IDError = data.IDErrorType
    IDPhieu = data.ID
    $(".text-weight").val(data.Weight);
    $(".text-shrinkage").val(data.Shrinkage);
    $(".text-waterproof").val(data.Waterproof);
    //$(".text-receiving").val(data.ReceivingQuantity);
    $(".text-checking").val(data.CheckingQuantity);
    $(".text-item").val(data.RollLabel);
    $(".text-actual").val(data.RollActual);
    $(".text-actualKho").val(data.KhoVaiActual);
    $(".text-cutprotect").val(data.CutProctect);
    $(".text-colorthread").val(data.ColorThread);
    $(".text-join").val(data.JoiningPointsRoll);
    $(".text-note").val(data.Note);
    $(".text-result").val(data.ResultQC);
    $(".text-checkFace").val(data.FaceSide)
    $(".text-checkBlack").val(data.BlackSide)
    $(".text-checkloang").val(data.ColorShading)
    $(".sum1").text(data.ErrorPointNew)
    $(".text-color").val(data.ColorText)
    $(".text-percent").val(data.PercentText)
    //$(".text-itemKho").val(data.KhoVai);

    $("#checkFace").prop("checked", data.FaceSide == 1);
    $("#checkBlack").prop("checked", data.BlackSide == 1);
    $("#checkloang").prop("checked", data.ColorShading == 1);

    //$("#weight-pass").prop("checked", data.StatusWeight == 1);
    //$("#weight-fail").prop("checked", data.StatusWeight == 0);
    //$("#weight-no").prop("checked", data.StatusWeight == 2 || data.StatusWeight == null);

    //$("#shrinkage-pass").prop("checked", data.StatusShrinkage == 1);
    //$("#shrinkage-fail").prop("checked", data.StatusShrinkage == 0);
    //$("#shrinkage-no").prop("checked", data.StatusShrinkage == 2 || data.StatusShrinkage == null);

    //$("#waterproof-pass").prop("checked", data.StatusWaterproof == 1);
    //$("#waterproof-fail").prop("checked", data.StatusWaterproof == 0);
    //$("#waterproof-no").prop("checked", data.StatusWaterproof == 2 || data.StatusWaterproof == null);

    $("#resultQC-pass").prop("checked", data.StatusResultQC == 1);
    $("#resultQC-fail").prop("checked", data.StatusResultQC == 0);
    $("#resultQC-no").prop("checked", data.StatusResultQC == 2 || data.StatusResultQC == null);

    $("#checkFace-pass").prop("checked", data.StatusFaceSide == 1);
    $("#checkFace-fail").prop("checked", data.StatusFaceSide == 0);
    $("#checkFace-no").prop("checked", data.StatusFaceSide == 2 || data.StatusFaceSide == null);

    $("#checkBlack-pass").prop("checked", data.StatusBlackSide == 1);
    $("#checkBlack-fail").prop("checked", data.StatusBlackSide == 0);
    $("#checkBlack-no").prop("checked", data.StatusBlackSide == 2 || data.StatusBlackSide == null);

    $("#checkloang-pass").prop("checked", data.StatusColorShading == 1);
    $("#checkloang-fail").prop("checked", data.StatusColorShading == 0);
    $("#checkloang-no").prop("checked", data.StatusColorShading == 2 || data.StatusColorShading == null);

    $("#color-pass").prop("checked", data.ColorStatus == 1);
    $("#color-fail").prop("checked", data.ColorStatus == 0);
    $("#color-no").prop("checked", data.ColorStatus == 2 || data.ColorStatus == null);

    $("#percent-pass").prop("checked", data.PercentStatus == 1);
    $("#percent-fail").prop("checked", data.PercentStatus == 0);
    $("#percent-no").prop("checked", data.PercentStatus == 2 || data.PercentStatus == null);

    $("#text-actual-pass").prop("checked", data.RollStatus == 1);
    $("#text-actual-fail").prop("checked", data.RollStatus == 0);
    $("#text-actual-no").prop("checked", data.RollStatus == 2 || data.RollStatus == null);

    $("#text-actualKho-pass").prop("checked", data.KhoVaiStatus == 1);
    $("#text-actualKho-fail").prop("checked", data.KhoVaiStatus == 0);
    $("#text-actualKho-no").prop("checked", data.KhoVaiStatus == 2 || data.KhoVaiStatus == null);

    $(".passed-result").prop("checked", data.StatusResult == 1);
    $(".failed-result").prop("checked", data.StatusResult == 2);

    $(".passed-result-tree").prop("checked", data.ResultQCStatus == 1);
    $(".failed-result-tree").prop("checked", data.ResultQCStatus == 2);

    $(".passed-result-mer").prop("checked", data.KetLuan_Mer == 1);
    $(".failed-result-mer").prop("checked", data.KetLuan_Mer == 2);


    $("#ynweight-yes").prop("checked", data.YNWeight === 1);
    $("#ynweight-no").prop("checked", data.YNWeight === 0);

    $("#ynshrinkage-yes").prop("checked", data.YNShrinkage === 1);
    $("#ynshrinkage-no").prop("checked", data.YNShrinkage === 0);

    $("#ynwaterproof-yes").prop("checked", data.YNWaterproof === 1);
    $("#ynwaterproof-no").prop("checked", data.YNWaterproof === 0);



    loadImagesFromServer(data)




}


// Hàm xóa tất cả ảnh
function clearAllImages() {
    for (const field in imageData) {
        delete imageData[field];
    }

    $(".image-list").empty();

    $(".camera-image-container").each(function () {
        $(this).html('<i class="fas fa-camera"></i>');
        $(this).removeClass("has-image");
    });

    currentPreviewField = null;
    currentPreviewIndex = 0;
    currentContainer = null;

    $("#previewImage").attr("src", "");
    $("#previewImageNote").val("");
    $("#previewImageCounter").text("0/0");

}

async function loadImagesFromServer(data) {

    // Kiểm tra và gán ảnh vào imageData nếu có
    if (data.ImgWeight && data.ImgWeight !== "") {
        const imgPath = `/Images/SignKiemVai/${data.ImgWeight}`;
        imageData['weight'] = imgPath;
        updateImageContainerFromPath('weight', imgPath);
    }

    if (data.ImgShrinkage && data.ImgShrinkage !== "") {
        const imgPath = `/Images/SignKiemVai/${data.ImgShrinkage}`;
        imageData['shrinkage'] = imgPath;
        updateImageContainerFromPath('shrinkage', imgPath);
    }

    if (data.ImgWaterproof && data.ImgWaterproof !== "") {
        const imgPath = `/Images/SignKiemVai/${data.ImgWaterproof}`;
        imageData['waterproof'] = imgPath;
        updateImageContainerFromPath('waterproof', imgPath);
    }

    if (data.ImgFaceSide && data.ImgFaceSide !== "") {
        const imgPath = `/Images/SignKiemVai/${data.ImgFaceSide}`;
        imageData['checkFace'] = imgPath;
        updateImageContainerFromPath('checkFace', imgPath);
    }

    if (data.ImgBlackSide && data.ImgBlackSide !== "") {
        const imgPath = `/Images/SignKiemVai/${data.ImgBlackSide}`;
        imageData['checkBlack'] = imgPath;
        updateImageContainerFromPath('checkBlack', imgPath);
    }

    if (data.ImgColorShading && data.ImgColorShading !== "") {
        const imgPath = `/Images/SignKiemVai/${data.ImgColorShading}`;
        imageData['checkloang'] = imgPath;
        updateImageContainerFromPath('checkloang', imgPath);
    }
}

// Hàm cập nhật hiển thị ảnh vào container
function updateImageContainerFromPath(fieldName, imagePath) {
    const container = $(`.camera-image-container[data-field="${fieldName}"]`);
    if (container.length > 0) {
        container.html(`<img src="${imagePath}" alt="Image">`);
        container.addClass('has-image');
    }
}
function changeSoCay() {
    $(".text-color").val("")
    $(".text-percent").val("")
    const batchlot = $("#SoCay option:selected").data("textvalue")
    const sokien = $("#SoCayItem option:selected").text()
    $(".text-batchlot").text(`${batchlot} / ${sokien}`)

    const selectedOption = $("#SoCayItem option:selected"); // Lưu cache để code gọn hơn

    const soghidaucay = selectedOption.data("soghidaucay")
    const donVi = selectedOption.data("donvi")
    const donViKhoVai = selectedOption.data("donvikhovai")
    const soluongthucte = selectedOption.data("slthucte")
    //const ngaynhapkho = selectedOption.data("ngaynhapkho")
    const slttMau = $("#MauVai option:selected").data("slkv")
    const khovai = selectedOption.data("khovai")

    $(".text-itemKho").val(khovai)
    //$("#Ngay").val(ngaynhapkho)

    $(".text-checking").val(parseFloat((parseFloat(soghidaucay) + parseFloat(slttMau)).toFixed(2)))
    $(".text-unit-checking").text(donVi)
    $(".text-donvi").text(donVi)
    $(".text-donvi-khovai").text(donViKhoVai)
    $(".text-donvib").text(donVi)
    $(".text-donvi-khovaib").text(donViKhoVai)
    $(".text-item").val(soluongthucte)
    $(".text-actualKho").val("")

    GetDataKiemVai()
    GetThongSo(selectedOption)
}

// Tính tổng điểm
function calculateTotal() {
    let totalPoints = 0;
    let totalDefects = 0;

    $('.counter-value').each(function () {
        const count = parseInt($(this).text());
        const point = parseInt($(this).data('point'));
        totalPoints += count * point;
        totalDefects += count;
    });

    $('#totalPoints').text(totalPoints + ' điểm');
    $('#defectCount').text('Tổng số lỗi: ' + totalDefects);
}

// Nút Reset
window.resetAll = function () {
    if (confirm('Bạn có chắc muốn reset tất cả dữ liệu?')) {
        $('.counter-value').text('0');
        calculateTotal();
    }
};

// Nút Lưu
window.saveInspection = function () {
    const data = [];

    $('#defectTableBody tr').each(function () {
        const defectName = $(this).find('.defect-name-vi').text();
        const counters = $(this).find('.counter-value');
        const defectData = {
            defect: defectName,
            point1: parseInt(counters.eq(0).text()),
            point2: parseInt(counters.eq(1).text()),
            point3: parseInt(counters.eq(2).text()),
            point4: parseInt(counters.eq(3).text())
        };

        // Chỉ thêm vào nếu có lỗi
        if (defectData.point1 > 0 || defectData.point2 > 0 ||
            defectData.point3 > 0 || defectData.point4 > 0) {
            data.push(defectData);
        }
    });

    console.log('Dữ liệu kiểm tra:', data);

    // Animation hiệu ứng
    const $btn = $('.btn-save');
    const $icon = $btn.find('i');
    $icon.removeClass('fa-save').addClass('fa-check fa-beat');

    setTimeout(function () {
        const totalPoints = $('#totalPoints').text();
        const totalDefects = $('#defectCount').text();
        alert('✅ Đã lưu kết quả kiểm tra thành công!\n\n' + totalPoints + '\n' + totalDefects);
        $icon.removeClass('fa-check fa-beat').addClass('fa-save');
    }, 300);
};
$('input[type="radio"]').on('change', function () {
    const status = $(this).val();
    const $textarea = $(this).closest('.value-col').find('textarea');

    if (status === 'pass') {
        $textarea.css('color', 'green');
    } else {
        $textarea.css('color', 'red');
    }
});
var imageSign, idNguoiKy, scrollPosition;
function CallModal(id) {
    if (id == 2) {
        $(".save-imgA").hide()
    }
    else {
        if ($("#tblDataBody tr").length == 0) {
            iziToast.warning({
                message: `Vui lòng quét kiện để xuất`,
                position: 'topRight',
                timeout: 2500
            });
            return
        }
        $(".save-imgA").show()
    }
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    $('#ModalSign').modal('show');
    const myTimeout = setTimeout(CalCanavas, 500);
}
function CalCanavas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
}
saveImg.addEventListener("click", () => {

    const link = document.createElement("a"); // creating <a> element
    link.download = `${Date.now()}.jpg`; // passing current date as link download value
    imageSign = canvas.toDataURL();



    $('#ModalSign').modal('hide');
    const myTimeout = setTimeout(Scroll, 500);
    //if ($(".tab3").is(":visible")) {
    //    UpdateKT(imageSign)
    //}
    //else {
    //    Save(imageSign)
    //}


});
function Scroll() {
    window.scrollTo(0, scrollPosition);
}
$(window).on("resize", function () {
    $('#ModalSign').modal('hide');
});
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

    $('#' + messageId).text(message);

    const toastElement = $('#' + toastId)[0];
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: delay
    });

    toast.show();
}
function createGuid() {
    return 'id_' + Math.random().toString(36).substring(2, 10)
        + Date.now().toString(36);
}

function isBase64(str) {
    if (!str || str === '') return false;
    // Kiểm tra format base64 data URL
    return /^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(str);
}

// Hàm convert ảnh sang base64
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
// HÀM CHÍNH - Đơn giản và rõ ràng
async function getImageByField(fieldName) {
    const imageSrc = imageData[fieldName];

    // 1. Chưa có hình → trả về ""
    if (!imageSrc || imageSrc === '') {
        return '';
    }

    // 2. Đã là base64 → giữ nguyên
    if (isBase64(imageSrc)) {
        return imageSrc;
    }

    // 3. Chưa phải base64 → convert sang base64
    const base64 = await imageToBase64(imageSrc);

    // Lưu lại vào imageData để lần sau không phải convert nữa
    if (base64) {
        imageData[fieldName] = base64;
    }

    return base64;
}
async function SaveKiemVai() {
    $(".is-invalid-field").removeClass("is-invalid-field");
    if ($("#KhachHang").val() == "" || $("#KhachHang").val() == null) {
        showToast('warning', 'Vui lòng chọn khách hàng!');
        return
    }

    if ($("#MauVai").val() == "" || $("#MauVai").val() == null) {
        showToast('warning', 'Vui lòng chọn vật tư để lưu!');
        return
    }



    const radioGroups = [
        { name: 'color', label: 'Màu của cty' },
        //{ name: 'weight', label: 'Trọng lượng' },
        //{ name: 'shrinkage', label: 'Độ co rút' },
        //{ name: 'waterproof', label: 'Chống thấm' },
        { name: 'checkFace', label: 'Mặt phải' },
        { name: 'checkBlack', label: 'Mặt trái' },
        { name: 'checkloang', label: 'Loang màu' },
        { name: 'percent', label: 'Thành phần lỗi' },
        { name: 'ynweight', label: 'Trọng lượng Yes/No' },
        { name: 'ynshrinkage', label: 'Độ co rút Yes/No' },
        { name: 'ynwaterproof', label: 'Chống thấm' },
    ];

    for (let group of radioGroups) {
        if ($(`input[name="${group.name}"]:checked`).length === 0) {
            showToast('warning', `Vui lòng chọn trạng thái cho: ${group.label}`);

            const $targetRow = $(`input[name="${group.name}"]`).closest('td');
            $targetRow.addClass("is-invalid-field");

            $targetRow[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
    }

    sumPoint();
    $("#warningModal").modal("show");
}

$("#btnFinalSave").on("click", async function () {
    const currentSoCayText = $("#SoCay option:selected").text().trim();
    const currentSoCayBatch = $("#SoCay option:selected").data("batch") || "";
    const currentSoCayMaNPL = $("#SoCay option:selected").data("manpl") || "";
    const currentSoCayItem = $("#SoCayItem").val();

    // Vô hiệu hóa nút để tránh nhấn nhiều lần
    $(this).prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Đang lưu...');

    try {
        const batch = $("#SoCay option:selected").data("batch");
        const mauvt = $("#MauVai option:selected").data("mauvt");

        // Lấy các ảnh (Base64)
        const imgWeight = await getImageByField("weight");
        const imgShrinkage = await getImageByField("shrinkage");
        const imgWaterproof = await getImageByField("waterproof");
        const imgFaceSide = await getImageByField("checkFace");
        const imgBlackSide = await getImageByField("checkBlack");
        const imgColorShading = await getImageByField("checkloang");
        const imgColor = await getImageByField("color");
        const imgPercent = await getImageByField("percent");
        if ($("#SoCay option:selected").data("manpl") == "" || $("#SoCay option:selected").data("manpl") == null) {
            showToast("warning", "Vui lòng chọn mã vật tư")
            return;
        }
        var dataUser = !window.CefSharp ? userNameSave : userName
        const Dot = $("#Dot").val()
        const BarCode = $("#SoCayItem option:selected").data("barcode")
        const item = {

            ID: IDPhieu,
            SoLoID: $("#SoLo").val(),
            SoLo: $("#SoLo option:selected").data("solotext"),
            MaKH: $("#KhachHang").val(),
            TenKH: $("#KhachHang option:selected").text(),
            MaHang: $("#MaHang").val(),
            TenHang: $("#MaHang option:selected").text(),
            LoaiVai: Dot,
            TenLoaiVai: BarCode,
            MaVTID: $("#MauVai option:selected").data("mavtid"),
            MaVT: $("#MauVai option:selected").data("mavt"),
            MauVTID: mauvt,
            LOT: $("#SoCay").val(),
            Batch: batch,
            SoCay: $("#SoCayItem").val(),
            Weight: $(".text-weight").val(),
            StatusWeight: $("#weight-pass").is(":checked") ? 1 : $("#weight-fail").is(":checked") ? 0 : 2,
            ImgWeight: imgWeight,
            Shrinkage: $(".text-shrinkage").val(),
            StatusShrinkage: $("#shrinkage-pass").is(":checked") ? 1 : $("#shrinkage-fail").is(":checked") ? 0 : 2,
            ImgShrinkage: imgShrinkage,
            Waterproof: $(".text-waterproof").val(),
            StatusWaterproof: $("#waterproof-pass").is(":checked") ? 1 : $("#waterproof-fail").is(":checked") ? 0 : 2,
            ImgWaterproof: imgWaterproof,
            ReceivingQuantity: $(".text-receiving").val(),
            CheckingQuantity: $(".text-checking").val(),
            FaceSide: $(".text-checkFace").val(),
            StatusFaceSide: $("#checkFace-pass").is(":checked") ? 1 : $("#checkFace-fail").is(":checked") ? 0 : 2,
            ImgFaceSide: imgFaceSide,
            BlackSide: $(".text-checkBlack").val(),
            StatusBlackSide: $("#checkBlack-pass").is(":checked") ? 1 : $("#checkBlack-fail").is(":checked") ? 0 : 2,
            ImgBlackSide: imgBlackSide,
            RollLabel: $(".text-item").val(),
            RollActual: $(".text-actual").val(),
            RollStatus: $("#text-actual-pass").is(":checked") ? 1 : $("#text-actual-fail").is(":checked") ? 0 : 2,
            CutProctect: $(".text-cutprotect").val(),
            ColorThread: $(".text-colorthread").val(),
            ColorShading: $(".text-checkloang").val(),
            StatusColorShading: $("#checkloang-pass").is(":checked") ? 1 : $("#checkloang-fail").is(":checked") ? 0 : 2,
            ImgColorShading: imgColorShading,
            JoiningPointsRoll: $(".text-join").val(),
            IDErrorType: IDError,
            Note: $(".text-note").val(),
            ResultQC: $(".text-result").val(),
            StatusResultQC: $("#resultQC-pass").is(":checked") ? 1 : $("#resultQC-fail").is(":checked") ? 0 : 2,
            CreateDate: null,
            NVKiem: dataUser,
            KhoVai: $(".text-itemKho").val(),
            KhoVaiActual: $(".text-actualKho").val(),
            KhoVaiStatus: $("#text-actualKho-pass").is(":checked") ? 1 : $("#text-actualKho-fail").is(":checked") ? 0 : 2,
            ColorImg: imgColor,
            ColorText: $(".text-color").val(),
            ColorStatus: $("#color-pass").is(":checked") ? 1 : $("#color-fail").is(":checked") ? 0 : 2,
            PercentImg: imgPercent,
            PercentText: $(".text-percent").val(),
            PercentStatus: $("#percent-pass").is(":checked") ? 1 : $("#percent-fail").is(":checked") ? 0 : 2,
            ErrorPoint: $(".sum1").first().text() || "0",
            StatusResult: $(".passed-result").is(":checked") ? 1 : 2,
            IsXacNhan: 1,
            MaNPL: $("#MauVai").val(),
            ResultQCStatus: $(".passed-result-tree").is(":checked") ? 1 : 2,
            LanKiem: $("#LanKiem").val(),

            YNWeight: $("#ynweight-yes").is(":checked") ? 1 : $("#ynweight-no").is(":checked") ? 0 : null,
            YNShrinkage: $("#ynshrinkage-yes").is(":checked") ? 1 : $("#ynshrinkage-no").is(":checked") ? 0 : null,
            YNWaterproof: $("#ynwaterproof-yes").is(":checked") ? 1 : $("#ynwaterproof-no").is(":checked") ? 0 : null,
        };

        let arrKiemVai = [item];
        const arrImage = await getImageListData();
        // Gọi API lưu
        await Save(arrKiemVai, "Post", "@TypeTableV2");
        await Save(getDefectData(), "PostErrorPoint", "@TypeTableErrorPoint");
        if (arrImage.length > 0) {
            await Save(arrImage, "PostImageList", "@TypeTableImageList", 'PostKiemVaiV2_Image');
        }
        clearAllImages();
        // Hoàn tất
        $("#warningModal").modal("hide");
        await GetMauVai($("#MauVai").val());

        setTimeout(() => {
            console.log(`aaa`)

            const $matched = $("#SoCay option").filter(function () {
                // Ưu tiên match theo MaNPL + text + batch
                const sameText = $(this).text().trim() === currentSoCayText;
                const sameBatch = ($(this).data("batch") || "") == currentSoCayBatch;
                const sameMaNPL = ($(this).data("manpl") || "") == currentSoCayMaNPL;

                console.log(`sameText: `, sameText)
                console.log(`sameBatch: `, sameBatch)
                console.log(`sameMaNPL: `, sameMaNPL)
                return sameText && sameBatch && sameMaNPL;

            });

            console.log(`$matched: `, $matched)

            if ($matched.length) {
                $matched.prop("selected", true);
                $("#SoCay").trigger("change");
            }
        }, 600);
        setTimeout(() => {
            $("#SoCayItem").val(currentSoCayItem).trigger("change");
        }, 900);

    } catch (ex) {
        showToast('error', 'Có lỗi xảy ra khi lưu!');
    } finally {
        $(this).prop('disabled', false).html('Xác nhận & Lưu');
    }
});

function getDefectData() {
    const result = [];
    const itemErrorPoints = [
        "Wrap-bar",
        "weft-bar",
        "holes",
        "oil-stain",
        "color-yarn",
        "crease-mark",
        "other"
    ];
    $.each(itemErrorPoints, function (_, defectKey) {

        const $row = $(`tr[data-defect="${defectKey}"]`);
        if ($row.length === 0) return;

        const defectName = $row.find(".defect-name-en").text().trim();

        const obj = {
            ErrorTypeID: IDError,
            ErrorType: defectName,
            OnePoint: parseInt($row.find('[data-point="1"]').text()) || 0,
            TwoPoint: parseInt($row.find('[data-point="2"]').text()) || 0,
            ThreePoint: parseInt($row.find('[data-point="3"]').text()) || 0,
            FourPoint: parseInt($row.find('[data-point="4"]').text()) || 0,
        };

        result.push(obj);
    });

    return result;
}
async function Save(arrSave, action, type, router = 'PostKiemVaiV2') {

    const request = new Request(`/api/KiemVai/${router}?action=${action}&type=${type}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(arrSave),
    });
    let response = await fetch(request)
    let data = await response.json()
    if (data.toUpperCase() == "TRUE") {
        showToast('success', `Lưu  thành công!`, 1500);
        resetForm();
    }
    else {
        showToast('error', `Lưu thất bại!`, 2000);
        return
    }
}
//$('textarea.form-control').attr('readonly', 'readonly');
//$('textarea.form-control').css('cursor', 'pointer');

// Khi click vào textarea
//$('textarea.form-control').not('#modalTextarea').on('click', function (e) {
//    e.preventDefault();
//    if ($(this).hasClass('text-item') || $(this).hasClass('text-itemKho') || $(this).hasClass('text-unit-receiving') || $(this).hasClass('text-unit-checking') || $(this).hasClass('text-donvi')) {
//        return; // không làm gì cả
//    }
//    currentTextarea = $(this);
//    // Lấy label của textarea
//    var label = currentTextarea.closest('tr').find('.label-text').text().trim();
//    //if (!label) {
//    //    label = "Nhập nội dung";
//    //}
//    // Đặt giá trị hiện tại vào modal
//    $('#modalTextarea').val(currentTextarea.val());
//    $('#modalFieldLabel').text(label);
//    // Mở modal
//    $('#inputModal').modal('show');
//    // Focus vào textarea trong modal
//});
$("#inputModal").on('shown.bs.modal', function () {
    $("#modalTextarea").removeAttr('readonly');  // Dùng # cho id, và removeAttr thay vì attr('readonly', '')
    $("#modalTextarea").focus();
});
// Khi nhấn nút Xác nhận
$('#btnConfirm').on('click', function () {
    if (currentTextarea) {
        var newValue = $('#modalTextarea').val();
        currentTextarea.val(newValue);
        currentTextarea.text(newValue);
    }
    $('#inputModal').modal('hide');
    sumPoint();
});

// Xóa currentTextarea khi đóng modal
$('#inputModal').on('hidden.bs.modal', function () {
    currentTextarea = null;
    $('#modalTextarea').val('');
});

// Cho phép nhấn Enter để xuống dòng trong modal textarea
$('#modalTextarea').on('keydown', function (e) {
    if (e.keyCode === 13) {
        e.stopPropagation();
    }
});

var currentCounterSpan = null;

// Khi click vào span counter-value
$(document).on('click', '.counter-value', function (e) {
    e.preventDefault();
    currentCounterSpan = $(this);

    // Lấy thông tin loại lỗi
    var defectNameVi = currentCounterSpan.closest('tr').find('.defect-name-vi').text().trim();
    var defectNameEn = currentCounterSpan.closest('tr').find('.defect-name-en').text().trim();
    var pointValue = currentCounterSpan.attr('data-point');
    var currentValue = currentCounterSpan.text().trim();

    // Đặt thông tin vào modal
    $('#counterDefectName').text(defectNameVi);
    $('#counterDefectNameEn').text(defectNameEn);
    $('#counterPointLabel').text('Mức điểm: ' + pointValue);
    $('#counterInput').val(currentValue == 0 ? "" : currentValue);

    // Mở modal
    $('#counterModal').modal('show');
});

// Focus vào input khi modal hiển thị
$('#counterModal').on('shown.bs.modal', function () {
    $('#counterInput').focus();
});

// Khi nhấn nút Xác nhận
$('#btnCounterConfirm').on('click', function () {
    if (currentCounterSpan) {
        var newValue = $('#counterInput').val();
        if (newValue === '' || newValue < 0) {
            newValue = 0;
        }
        currentCounterSpan.text(newValue);
        sumPoint();
    }
    $('#counterModal').modal('hide');
});

// Cho phép nhấn Enter để xác nhận
$('#counterInput').on('keypress', function (e) {
    if (e.which === 13) { // Enter key
        $('#btnCounterConfirm').click();
    }
});

// Xóa currentCounterSpan khi đóng modal
$('#counterModal').on('hidden.bs.modal', function () {
    currentCounterSpan = null;
    $('#counterInput').val('');
});

$(document).on('click', '.btn-plus', function (e) {
    e.stopPropagation();

    var soCay = $('#SoCayItem').val();
    if (!soCay || soCay === "" || soCay === "0") {
        showToast('warning', 'Vui lòng chọn Số cây trước!');
        return;
    }
    var counter = $(this).siblings('.counter-value');
    var currentVal = parseInt(counter.text()) || 0;
    counter.text(currentVal + 1);
    sumPoint();
});

$(document).on('click', '.btn-minus', function (e) {
    e.stopPropagation();

    var soCay = $('#SoCayItem').val();
    if (!soCay || soCay === "" || soCay === "0") {
        return;
    }
    var counter = $(this).siblings('.counter-value');
    var currentVal = parseInt(counter.text()) || 0;
    if (currentVal > 0) {
        counter.text(currentVal - 1);
        sumPoint();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const passed = document.querySelector('.passed-result');
    const failed = document.querySelector('.failed-result');

    passed.addEventListener('change', function () {
        if (this.checked) {
            failed.checked = false;
        }
    });

    failed.addEventListener('change', function () {
        if (this.checked) {
            passed.checked = false;
        }
    });
});
function doiSangMet(value, donVi) {
    donVi = (donVi || "").trim().toUpperCase();

    if (donVi.startsWith("M")) {
        return Number(value);
    }

    switch (donVi) {
        case "CM":
            return Number(value) / 100;

        case "MM":
            return Number(value) / 1000;

        case "INCH":
            return Number(value) * 0.0254;

        case "YDS":
            return Number(value) * 0.9144;

        default:
            return null;
    }
}
function sumPoint() {
    let finalTotal = 0;
    for (let point = 1; point <= 4; point++) {
        let total = 0;
        $('#defectTableBody tr[data-defect]')
            .not('[data-defect="sum"]')
            .each(function () {
                const val = parseInt($(this).find(`[data-point="${point}"]`).text()) || 0;
                total += val;
            });
        finalTotal += total * point;
    }

    var tongSoDiem = finalTotal;
    var daiCayVai = parseFloat($(".text-actual").val()) || 0;
    var khoVai = parseFloat($(".text-itemKho").val()) || 0;
    var donVi = $(".text-donvib").text() ? $(".text-donvib").text().toUpperCase().trim() : "";
    var donViKhoVai = $(".text-donvi-khovai").text() ? $(".text-donvi-khovai").text().toUpperCase().trim() : "";



    const daiCayVaimet = doiSangMet(daiCayVai, donVi);
    const khoVaimet = doiSangMet(khoVai, donViKhoVai);

    if (daiCayVaimet === null || khoVaimet === null) {
        const tenDonVi = daiCayVaimet === null
            ? (donVi || 'Trống')
            : (donViKhoVai || 'Trống');

        const loai = daiCayVaimet === null
            ? 'dài cây vải'
            : 'khổ vải';

        showToast(
            'error',
            `Đơn vị ${loai} "${tenDonVi}" không hợp lệ. Hệ thống chỉ hỗ trợ: MTS, YDS, INCH, CM, MM.`,
            4000
        );

        $(".sum1").text("Lỗi đơn vị");
        return;
    }

    var soLoi = (tongSoDiem * 100) / (daiCayVaimet * khoVaimet);

    if (isNaN(soLoi) || !isFinite(soLoi)) soLoi = 0;

    var finalSoloi = Math.round(soLoi);

    if (finalSoloi < 30) {
        $(".passed-result").prop("checked", true);
        $(".failed-result").prop("checked", false);
    } else {
        $(".passed-result").prop("checked", false);
        $(".failed-result").prop("checked", true);
    }

    if (daiCayVaimet == 0) {
        $(".passed-result").prop("checked", false);
        $(".failed-result").prop("checked", false);
    }

    $('.sum1').text(finalSoloi);
    updateTreeQCStatus()
}

//

let currentStream = null;
let currentContainer = null;
let currentFacingMode = 'environment'; // 'environment' (camera sau) hoặc 'user' (camera trước)
const imageData = {};

function handleImageClick(container) {
    if ($("#btnLuu").prop("disabled")) {
        return;
    }
    currentContainer = container;
    showOptionModal();
}

function showOptionModal() {
    const modal = document.getElementById('optionModal');
    modal.classList.add('show');
}

function closeOptionModal() {
    const modal = document.getElementById('optionModal');
    modal.classList.remove('show');
}

async function openCamera() {
    closeOptionModal();
    const modal = document.getElementById('cameraModal');
    const video = document.getElementById('video');

    try {
        // Dừng stream cũ nếu có
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        // Kiểm tra xem có phải mobile không
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Cấu hình khác nhau cho mobile và desktop
        const videoConfig = isMobile ? {
            facingMode: currentFacingMode,
            width: { ideal: 1420 },   // Nhỏ hơn cho mobile
            height: { ideal: 1580 }  // Tỷ lệ dọc cho mobile
        } : {
            facingMode: currentFacingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
        };

        currentStream = await navigator.mediaDevices.getUserMedia({
            video: videoConfig
        });

        video.srcObject = currentStream;
        modal.classList.add('show');
    } catch (err) {
        alert('Không thể truy cập camera: ' + err.message);
    }
}

async function switchCamera() {
    // Đổi giữa camera trước và sau
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';

    // Mở lại camera với chế độ mới
    await openCamera();
}

function selectFromGallery() {
    closeOptionModal();
    const fileInput = document.getElementById('fileInput');

    fileInput.onchange = function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const imageUrl = event.target.result;
                const field = currentContainer.getAttribute('data-field');

                addImageToField(field, imageUrl);
            };
            reader.readAsDataURL(file);
        }
        // Reset input để có thể chọn lại cùng file
        fileInput.value = '';
    };

    fileInput.click();
}

function capturePhoto() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
    const field = currentContainer.getAttribute('data-field');



    // Hiển thị ảnh trong container
    addImageToField(field, imageUrl);

    // Đóng camera
    closeCamera();
}

function updateImageContainer(container, imageUrl) {
    container.innerHTML = `<img src="${imageUrl}" alt="Captured">`;
    container.classList.add('has-image');
}

function closeCamera() {
    const modal = document.getElementById('cameraModal');
    modal.classList.remove('show');

    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
}

function showPreview(field) {
    const modal = document.getElementById('previewModal');
    const img = document.getElementById('previewImage');
    img.src = imageData[field];
    modal.classList.add('show');
}

function closePreview() {
    $("#previewModal").removeClass('show')
}

function retakePhoto() {
    closePreview();
    showOptionModal();
}
var fieldDelete


// Đóng modal khi click bên ngoài
window.onclick = function (event) {
    const cameraModal = document.getElementById('cameraModal');
    const previewModal = document.getElementById('previewModal');
    const optionModal = document.getElementById('optionModal');

    if (event.target === cameraModal) {
        closeCamera();
    }
    if (event.target === previewModal) {
        closePreview();
    }
    if (event.target === optionModal) {
        closeOptionModal();
    }
}

//Xử lý hình ảnh công thức
let scale = 1;
let isDragging = false;
let startX, startY, translateX = 0, translateY = 0;

const img = document.getElementById('imgCongThuc');
const wrapper = document.getElementById('wrapper-img');

function OpenImg() {
    $('#modalCongThuc').modal('show');
}

$(document).on('change', 'input[type="radio"]', function () {
    const name = $(this).attr("name");

    // Không gọi hàm khi thay đổi checkFace hoặc checkBlack
    if (name === "checkFace" || name === "checkBlack") {
        return;
    }

    updateTreeQCStatus();
});

function updateTreeQCStatus() {
    const groupsToCheck = [
        'color', 'weight', 'shrinkage', 'waterproof',
         'checkloang', 'percent'
    ];

    let hasFail = false;

    groupsToCheck.forEach(name => {
        if ($(`input[name="${name}"]:checked`).val() === '0' ||
            $(`#${name}-fail`).is(':checked')) {
            hasFail = true;
        }
    });
    if ($("#text-actual-fail").is(":checked") || $("#text-actualKho-fail").is(":checked")) {
        hasFail = true;
    }

    const finalSoloi = parseInt($(".sum1").first().text()) || 0;
    if (finalSoloi >= 30) {
        hasFail = true;
    }
    if (hasFail) {
        $(".failed-result-tree").prop("checked", true);
        $(".passed-result-tree").prop("checked", false);
    } else {
        if ($("#SoCayItem").val() !== "") {
            $(".passed-result-tree").prop("checked", true);
            $(".failed-result-tree").prop("checked", false);
        }
    }
}
var isXacNhanLo = "";

// Xác nhận lô
async function ConfirmLo() {
    const soLoID = $("#SoLo").val() ?? ""
    const maNPL = $("#MauVai").val() ?? ""
    const dot = $("#Dot").val() ?? ""
    const lanKiem = $("#LanKiem").val() ?? 1
    if (lanKiem == "") {
        showToast("warning", "Vui lòng chọn lần kiểm để xác nhận hoàn thành")
        return
    }
    if (dot == "") {
        showToast("warning", "Vui lòng chọn đợt để xác nhận hoàn thành")
        return
    }
    if (soLoID == "") {
        showToast("warning", "Vui lòng chọn lô để xác nhận hoàn thành")
        return
    }
    if (maNPL == "") {
        showToast("warning", "Vui lòng chọn vật tư để xác nhận hoàn thành")
        return
    }
    var dataUser = !window.CefSharp ? userNameSave : userName
    const maxStatus = await ResultHT()

    showConfirmModal(async function () {
        var arrSave = []
        arrSave.push({
            SoLoID: soLoID,
            MaNPL: maNPL,
            UserXN: dataUser,
            NgayNhapKho: null,
            Dot: dot,
            LanKiem: lanKiem
        })
        SaveConfirmLo(arrSave, "PostXacNhanLo", "@TypeTableXacNhan", maxStatus)
    })

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
async function SaveConfirmLo(arrSave, action, type, maxStatus) {
    const request = new Request(`/api/KiemVai/PostXacNhanLo?action=${action}&type=${type}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(arrSave),
    });
    let response = await fetch(request)
    let data = await response.json()
    if (data.toUpperCase() == "TRUE") {
        const maNPL = $("#MauVai").val() ?? ""
        const soLoText = $("#SoLo option:selected").text()
        showToast('success', `Lưu  thành công!`, 1500);

        $("#SoCay").empty()
        $("#SoCayItem").empty()
        $("#LanKiem").empty()
        const dotCu = $("#Dot").val();
        //const textSoLod = $("#SoLo option:selected").text()
        //const title = ``
        const PassFail = maxStatus == 1 ? "PASS" : "Fail"
        const result = `\nKết quả: <color= ${PassFail.toUpperCase() == "PASS" ? "navy" : "red"}>${PassFail.toUpperCase()}</color>`
        const module = 'M.28.00.00'
        const title = ''
        const detail = `POMua: ${soLoText} - Vật tư ${$("#MauVai option:selected").text()} đã hoàn thành kiểm vải ${result} !`
        const sendTo = 'QA'
        const BoPhan = 'ALL'
        const Status = 1

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
                SendTo: "QA",
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
        await GetMauVai(null, maNPL)
        setTimeout(function () {
            $("#Dot").val(dotCu).trigger('change')
        }, 300)
    }
    else {
        showToast('error', `Lưu thất bại!`, 2000);
        return
    }
}
function showConfirmModal(onConfirm) {
    $('#xacNhanHoanThanh').off('click').on('click', async function () {
        if (typeof onConfirm === 'function') {
            const result = await onConfirm();

            if (result === false) {
                return; // ❌ KHÔNG đóng modal
            }
        }

        // ✅ Chỉ đóng khi hợp lệ
        $("#modalXacNhanXongLo").modal("hide");
    });

    $("#modalXacNhanXongLo").modal("show");
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


//function sendNotify(ModuleID, title, detail, sendTo, BoPhan = "ALL", Status = -1) {
//    var dataUser = !window.CefSharp ? userNameSave : userName
//    const url = `/api/SendToNotification/PushNotification?` +
//        `UserIDTao=${encodeURIComponent(dataUser)}&` +
//        `ModuleID=${encodeURIComponent(ModuleID)}&` +
//        `Title=${encodeURIComponent(title)}&` +
//        `Detail=${encodeURIComponent(detail)}&` +
//        `SendTo=${encodeURIComponent(sendTo)}&` +
//        `BoPhan=${encodeURIComponent(BoPhan)}&` +
//        `Status=${encodeURIComponent(Status)}`;
//    $.ajax({
//        url: url,
//        type: "POST",
//        contentType: false,
//        processData: false,
//        success: function (result) {
//            console.log("Gửi thông báo thành công:", result);
//        },
//        error: function (xhr, status, error) {
//            console.error("Lỗi gửi thông báo:", error);
//        }
//    });
//}

function addImageToField(field, imageUrl) {
    if (!imageData[field]) {
        imageData[field] = [];
    }

    imageData[field].push({
        url: imageUrl,
        note: ""
    });

    renderImageList(field);
}

function renderImageList(field) {
    const images = imageData[field] || [];
    const $list = $(`[data-list-field="${field}"]`);
    if ($list.length === 0) return;

    const isDefectImage = field.startsWith("defect-");
    const html = images.map((img, index) => {
        const src = (img.url && (isBase64(img.url) || img.url.startsWith("http")))
            ? img.url
            : `/Images/SignKiemVai/${img.imageName || img.url}`;

        return `
        <div class="image-item">
            <img src="${src}" onclick="previewListImage('${field}', ${index})" />
            ${isDefectImage ? `
                <textarea
                    data-image="${img.imageName}"
                    class="image-note"
                    placeholder="Ghi chú"
                    rows="1"
                    oninput="updateImageNote('${field}', ${index}, this.value)"
                >${img.note || ""}</textarea>
            ` : ""}
        </div>
    `}).join("");

    $list.html(html);
}

let currentPreviewField = null;
let currentPreviewIndex = null;

function previewListImage(field, index) {
    currentPreviewField = field;
    currentPreviewIndex = index;

    updatePreviewImage();
    document.getElementById('previewModal').classList.add('show');
}

function deletePhoto() {
    if (currentPreviewField == null || currentPreviewIndex == null) {
        showToast('warning', 'Vui lòng chọn hình cần xóa.');
        return;
    }

    $("#modalDelete").modal("show");
}

async function ConfirmDelete() {
    if (!currentPreviewField || !imageData[currentPreviewField]) {
        $("#modalDelete").modal("hide");
        return;
    }

    const imageItem = imageData[currentPreviewField][currentPreviewIndex];
    const imageName = imageItem.imageName || "";

    imageData[currentPreviewField].splice(currentPreviewIndex, 1);

    renderImageList(currentPreviewField);

    if (imageData[currentPreviewField].length === 0) {
        currentPreviewField = null;
        currentPreviewIndex = 0;
        closePreview();
    } else {
        if (currentPreviewIndex >= imageData[currentPreviewField].length) {
            currentPreviewIndex = imageData[currentPreviewField].length - 1;
        }

        updatePreviewImage();
    }

    if (imageName && !isBase64(imageName)) {
        await DeleteImageList(imageName);
    }


    $("#modalDelete").modal("hide");
}

function updateImageNote(field, index, value) {
    if (!imageData[field] || !imageData[field][index]) return;

    imageData[field][index].note = value;
}
function previewPrevImage() {
    currentPreviewIndex--;
    updatePreviewImage();
}

function previewNextImage() {
    currentPreviewIndex++;
    updatePreviewImage();
}
function updatePreviewImage() {
    imgResetTransform();
    if (!currentPreviewField || !imageData[currentPreviewField]) return;

    const images = imageData[currentPreviewField];
    if (!images.length) {
        closePreview();
        return;
    }

    if (currentPreviewIndex < 0) {
        currentPreviewIndex = images.length - 1;
    }

    if (currentPreviewIndex >= images.length) {
        currentPreviewIndex = 0;
    }

    const currentImage = images[currentPreviewIndex];
    const isDefectImage = currentPreviewField.startsWith("defect-");

    $("#previewImage").attr("src", currentImage.url);

    if (!isDefectImage) {
        $("#previewImageNote").val("");
        $("#previewImageNote").closest(".preview-note-wrap").hide();
    } else {
        $("#previewImageNote").val(currentImage.note || currentImage.GhiChu || "");
        $("#previewImageNote").closest(".preview-note-wrap").show();
    }

    $("#previewImage").attr("src", currentImage.url);
    $("#previewImageCounter").text(`${currentPreviewIndex + 1}/${images.length}`);

    $("#btnPreviewPrev").prop("disabled", images.length <= 1);
    $("#btnPreviewNext").prop("disabled", images.length <= 1);
}
function updatePreviewImageNote(value) {
    if (!currentPreviewField || !imageData[currentPreviewField]) return;

    const currentImage = imageData[currentPreviewField][currentPreviewIndex];
    if (!currentImage) return;

    currentImage.note = value;

    renderImageList(currentPreviewField);
}

async function DeleteImageList(image) {
    try {
        const url = `/api/KiemVai/Get?action=DeleteImageList&para1=${image}`
        await fetch(url);
        showToast('success', `Xóa ảnh thành công`);
    } catch (err) {
        console.error(err)
    }
}

async function getImageListData() {
    const result = [];
    const barCode = $("#SoCayItem option:selected").data("barcode") || "";

    for (const dataField in imageData) {
        const images = Array.isArray(imageData[dataField])
            ? imageData[dataField] : [];

        for (const item of images) {
            let imageValue = item.url || "";
            if (!imageValue) continue;

            //  Bỏ qua ảnh đã có trên server (không phải base64 mới)
            if (!isBase64(imageValue)) continue;

            result.push({
                BarCode: barCode,
                DataField: dataField,
                Image: imageValue,
                GhiChu: item.note || "",
                LanKiem: $("#LanKiem").val()
            });
        }
    }
    return result;
}

let lanKiem;
let lanKiemNew;
let loc = 0;
$(function () {
    $("#changeViTri").on("change", function () {
        loc = $(this).val();

        $("#SoLo").empty();
        $("#MauVai").empty();
        $("#Dot").empty();
        $("#LanKiem").empty();
        $("#KhachHang").empty();
        $("#MaHang").empty();
        $("#nhacungcap").val('');
        $("#batchInput").val("");
        $("#SoCay").empty();
        $("#SoCayItem").empty();
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
        GetKhachHang();
        if (loc == 0) {
            $("#KhachHang").val($(this).find("option:selected").data("khachhang"));
            $("#nhacungcap").val($(this).find("option:selected").data("ncc"));
            GetMauVai(null)
        }
    })

    $("#MauVai").on("change", function () {
        if (loc == 1) {
            $("#KhachHang").val($(this).find("option:selected").data("khachhang"));
            $("#nhacungcap").val($(this).find("option:selected").data("ncc"));
        }
    })

    $("#LanKiem").on('change', function () {
        GetBatchLot();
    })

    $("#btnTaiKiem").on('click', async function () {
        if ($('#Dot').val() == "" || !$('#Dot').val().trim()) {
            showToast("warning", "Vui lòng chọn đợt");
            return;
        }
        const unconfirmed = $("#LanKiem option").filter(function () {
            return $(this).data("xacnhan") == 2;
        }).first();

        if (unconfirmed.length) {
            $("#LanKiem").val(unconfirmed.val()).trigger("change");
            showToast("warning", "Vui lòng xác nhận hoàn thành !");
            return;
        }


        lanKiemNew = lanKiem + 1
        if ($("#LanKiem option[value='" + lanKiemNew + "']").length === 0) {
            const html = `<option data-xacnhan='2' value="${lanKiemNew}">Lần: ${lanKiemNew}</option>`
            $("#LanKiem").append(html);
        }

        $("#LanKiem").val(lanKiemNew).trigger("change");
        GetBatchLot();
    })
})

$(document).on("click", function (e) {
    if (!$(e.target).closest(".select2-container, select").length) {
        $("select").select2("close");
    }
});
$(document).on('blur', '.image-note', function () {
    const image = $(this).data('image');
    const ghiChu = $(this).val();
    const lanKiem = $("#LanKiem").val();
    if (!image || isBase64(image)) return;

    UpdateGhiChuError(image, ghiChu);
});


async function UpdateGhiChuError(image, ghiChu, lanKiem) {
    try {
        const url = `/api/KiemVai/Get?action=UpdateGhiChuError&para1=${image}&para2=${ghiChu}&para3=${lanKiem}`

        const response = await fetch(url);
        await response.json();

        return true;

    } catch (err) {
        console.error(err)
        return false
    }
}


async function GetLanKiem() {
    const soLo = $("#SoLo").val();
    const maNPL = $("#MauVai").val();
    const dot = $("#Dot").val()
    try {

        const url = `/api/KiemVai/Get?action=GetLanKiem&para1=${soLo}&para2=${maNPL}&para3=${dot}&para4=1`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status} `);

        const data = await response.json();
        let html = ``;
        if (data.dt1.length == 0) {
            html += `
                <option data-xacnhan="2" value="1">Lần: 1</option>
            `
        } else {
            lanKiem = data.dt1[0].LanKiemMax;

            data.dt1.map(x => {
                html += `
                <option data-xacnhan="${x.CheckXacNhan}" value="${x.LanKiem}">Lần: ${x.LanKiem}</option>
            `
            })

        }

        $("#LanKiem").html(html);
        GetBatchLot()
    } catch (err) {
        console.error(err)
    }
}

$(document).on('click', 'input[name="ynweight"], input[name="ynshrinkage"], input[name="ynwaterproof"]', function () {
    const $this = $(this);
    const name = $this.attr('name');

    if ($this.data('was-checked')) {
        $this.prop('checked', false);
        $this.data('was-checked', false);
        $(`input[name="${name}"]`).data('was-checked', false);
    } else {
        $(`input[name="${name}"]`).data('was-checked', false);
        $this.data('was-checked', true);
    }
});

// ============ IMAGE TRANSFORM ============
let imgScale = 1, imgRotation = 0, imgFlipped = false;
let panX = 0, panY = 0;
let _isDragging = false, _dragStartX = 0, _dragStartY = 0;
let _rafId = null;

function _applyImgTransform() {
    const img = document.getElementById('previewImage');
    if (!img) return;
    const flipY = imgFlipped ? -1 : 1;
    img.style.transform = `translate(${panX}px,${panY}px) scale(${imgScale},${flipY * imgScale}) rotate(${imgRotation}deg)`;
    img.style.transition = _isDragging ? 'none' : 'transform 0.2s';
}

function _applyImgTransformRAF() {
    if (_rafId) cancelAnimationFrame(_rafId);
    _rafId = requestAnimationFrame(_applyImgTransform);
}

function imgZoomIn() { imgScale = Math.min(imgScale + 0.25, 5); _applyImgTransform(); }
function imgZoomOut() { imgScale = Math.max(imgScale - 0.25, 0.25); _applyImgTransform(); }
function imgRotate(deg) { imgRotation = (imgRotation + deg) % 360; _applyImgTransform(); }
function imgFlip() { imgFlipped = !imgFlipped; _applyImgTransform(); }

function imgResetTransform() {
    imgScale = 1; imgRotation = 0; imgFlipped = false;
    panX = 0; panY = 0;
    _applyImgTransform();
}

// Reset khi đổi ảnh
const _origUpdatePreviewImage = updatePreviewImage;
// Patch: gọi reset sau khi đổi ảnh
const _patchedUpdatePreviewImage = function () {
    _origUpdatePreviewImage();
    imgResetTransform();
};

document.addEventListener('DOMContentLoaded', function () {
    const vp = document.getElementById('imgViewport');
    if (!vp) return;

    // Scroll zoom
    vp.addEventListener('wheel', function (e) {
        e.preventDefault();
        e.deltaY < 0 ? imgZoomIn() : imgZoomOut();
    }, { passive: false });

    // Mouse drag
    vp.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return;
        _isDragging = true;
        _dragStartX = e.clientX - panX;
        _dragStartY = e.clientY - panY;
        vp.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
        if (!_isDragging) return;
        panX = e.clientX - _dragStartX;
        panY = e.clientY - _dragStartY;
        _applyImgTransformRAF();
    });

    document.addEventListener('mouseup', function () {
        if (!_isDragging) return;
        _isDragging = false;
        vp.style.cursor = 'grab';
    });

    // Touch pinch zoom + drag
    let _lastTouchDist = null;

    vp.addEventListener('touchstart', function (e) {
        if (e.touches.length === 1) {
            _isDragging = true;
            _dragStartX = e.touches[0].clientX - panX;
            _dragStartY = e.touches[0].clientY - panY;
        } else if (e.touches.length === 2) {
            _isDragging = false;
            _lastTouchDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY);
        }
        e.preventDefault();
    }, { passive: false });

    vp.addEventListener('touchmove', function (e) {
        if (e.touches.length === 1 && _isDragging) {
            panX = e.touches[0].clientX - _dragStartX;
            panY = e.touches[0].clientY - _dragStartY;
            _applyImgTransformRAF();
        } else if (e.touches.length === 2 && _lastTouchDist) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY);
            imgScale = Math.min(Math.max(imgScale + (dist - _lastTouchDist) * 0.01, 0.25), 5);
            _lastTouchDist = dist;
            _applyImgTransformRAF();
        }
        e.preventDefault();
    }, { passive: false });

    vp.addEventListener('touchend', () => { _isDragging = false; _lastTouchDist = null; });
});