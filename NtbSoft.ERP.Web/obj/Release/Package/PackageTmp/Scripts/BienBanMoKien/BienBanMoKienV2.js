
var userNameSave = localStorage.getItem("username1")
let timeoutId2;
var $currentRow;
var barcodegoc = ""
var index = 0
var cayvaiPress;
var soLoPress;
var dataCayVai;
var thisTr;
var checkNhap;
$(function () {
    if (window.CefSharp) {
        $("#home").css("display", "none");
    }
    $(".select_2").select2()
    $(".btnDenKho").hide()
    getDate()
    /*GetVatTu()*/
    //GetSoLo()
    /*GetMaHangNL()*/
    GetKhachHangNL()
    $(".closebtn").on("click", function () {
        $('.barcodein').hide();
    })
    $(".btn-add ").on("click", function () {
        $('#myModal').modal('show');
        getDataRow()
    })
    initCBM()

    $(".saveKien").on("click", async function () {
        if ($('.sokienMD').val() == "") {
            handeleNoti("Vui lòng nhập cây vải!", "warning")
            return
        }
        const checkDub = await CheckDub($('.sokienMD').val());
        if (checkDub) {
            handeleNoti("Cây vải đã có trong bảng ", "warning")
            return
        }
        if ($('.thucnhapMD').val() == "") {
            handeleNoti("Vui lòng nhập số lượng thực nhập!", "warning")
            return
        }
        if ($('.tenlotMD').val() == "") {
            handeleNoti("Vui lòng nhập tên LOT!", "warning")
            return
        }



        await addRowBody()
        $('.sokienMD').val("")
        $('.thucnhapMD').val("")
        $('.tenlotMD').val("")
    })
    function initCBM() {
        $("input[name='cbmOption']").on("change", function () {
            let val = $("input[name='cbmOption']:checked").val();

            if (val == "1") {
                $(".cbm-opt1").show();
                $(".cbm-opt2").hide();
            } else {
                $(".cbm-opt1").hide();
                $(".cbm-opt2").show();
            }
            $(".cbm-result").val("");
        });

        // Tính toán CBM khi nhập
        $(".cbm-length, .cbm-width, .cbm-height, .cbm-diameter, .cbm-hCylinder").on("input", function () {
            let type = $("input[name='cbmOption']:checked").val();
            let cbm = 0;

            if (type == "1") {
                let d = parseFloat($(".cbm-length").val()) || 0;
                let r = parseFloat($(".cbm-width").val()) || 0;
                let c = parseFloat($(".cbm-height").val()) || 0;
                cbm = d * r * c;
            } else {
                let dk = parseFloat($(".cbm-diameter").val()) || 0;
                let h = parseFloat($(".cbm-hCylinder").val()) || 0;
                let radius = dk / 2;
                cbm = Math.PI * radius * radius * h;
            }

            $(".cbm-result").val(cbm.toFixed(2));
        });

    }
    $("#tbody").on("click", '.changeCLCT', function () {
        let $tr = $(this).closest("tr")
        let grid = $("#tbody").dxDataGrid("instance");
        let rowIndex = $tr.index();

        // Lấy dữ liệu hiện tại từ grid
        let rowData = grid.getVisibleRows()[rowIndex].data;

        let inputSLN = $tr.find("input.inputSLN").val()
        let SLCT = $tr.find("span.SLCT").text().trim()

        rowData.IsNK = 1;

        if (inputSLN == "") {
            rowData.SLNhap = Number(SLCT.replace(/,/g, ""));
            SaveSLThucTeBarCode(rowData)
        } else {
            rowData.SLNhap = parseFloat(inputSLN) || 0;
        }

        grid.refresh();

    })
    $("#tbody").on("change", ".checkNK", async function () {
        let $tr = $(this).closest("tr");
        let grid = $("#tbody").dxDataGrid("instance");
        let rowIndex = $tr.index();

        // Lấy dữ liệu hiện tại từ grid
        let rowData = grid.getVisibleRows()[rowIndex].data;
        if (rowData.CheckKiemKe == 1) {
            iziToast.warning({
                message: this.checked ? `Vật tư này đang được kiểm kê không được nhập kho !` : `Vật tư này đang được kiểm kê không được hủy nhận !`,
                position: 'topRight',
                timeout: 2500
            });
            $(this).prop("checked", !this.checked);
            return;
        }
        if (!$(this).is(":checked")) {
            const ngayHT = rowData.NgayHT;

            if (ngayHT != null && String(ngayHT).trim() !== "") {
                iziToast.warning({
                    message: `Cây này đã được Hoàn thành nhận không được hủy.`,
                    position: 'topRight',
                    timeout: 2500
                });

                $(this).prop("checked", true);
                return;
            }

            var checkXH = $tr.data("isxh");
            if (checkXH == 1) {
                iziToast.warning({
                    message: `Cây vải này đã đc cấp xuất hàng không được check hủy`,
                    position: 'topRight',
                    timeout: 2500
                });
                $(this).prop("checked", true);
                return;
            }



            // Cập nhật dữ liệu trong dataSource
            //rowData.SLNhap = 0;
            rowData.IsNK = 0;

            // Refresh grid để tính lại summary
            grid.refresh();
            return;
        }
        else {


            let inputSLN = $tr.find("input.inputSLN").val();
            let SLCT = $tr.find("span.SLCT").text().trim();

            rowData.IsNK = 1;

            if (inputSLN == "") {
                rowData.SLNhap = Number(SLCT.replace(/,/g, ""));
            } else {
                rowData.SLNhap = parseFloat(inputSLN) || 0;
            }

            grid.refresh();
        }
    });
    $(".btn-save").on("click", function () {
        $('#myModalN').modal('show');

    })
    $(".saveTable").on("click", function () {
        SaveTable()
    })


    $("#tbody").on("click", "tr", function () {
        $("#tbody").find("tr").removeClass("active")
        $(this).addClass("active")
    })
    $("#home").on("click", function () {
        window.location.href = '/Home/Dashboard'
    })


    $(".icon_reload").on("click", function () {
        GetPhieuNK()
    })
    $('#myModal4').on('shown.bs.modal', function () {
        $('.SuaTNInput').focus(); // Focus khi modal hiển thị xong
    });
    $(document).on('click', '.fa-pen-to-square', function () {
        $currentRow = $(this).closest('tr');

        var checkXH = $currentRow.data("isxh")
        if (checkXH == 1) {
            iziToast.warning({
                message: `Cây vải này đã đc cấp xuất hàng không được cập nhật số lượng`,
                position: 'topRight',
                timeout: 2500
            });
            retrun
        }
        let value = $currentRow.find('.inputSLN').val()
        $('.SuaTNInput').val(value);
        let sokien = $currentRow.data("sokien")
        let khosize = $currentRow.data("khosize")
        let donvi = $currentRow.data("donvi")
        barcodegoc = $currentRow.data("barcodegoc")
        let theoCT = $currentRow.find(".SLCT").text().trim()

        let solot = $currentRow.find('.solot').text().trim();
        let solo = $currentRow.data("solo")
        let vattu = $currentRow.data("vattu")
        var dongia = $currentRow.data("dongia")
        $('.dongiaMD').val(parseFloat(dongia))
        $('.dongiaMDText').text(parseFloat(dongia))
        $('.khosizeMD').text(khosize)
        $('.donviMD').text(donvi)
        $('.soloMD').text(solo)
        $('.vattuMD').text(vattu)
        $('.sokienS4').text(sokien)
        $('.solotS4').text(solot)
        $('.theoCTS4').text(theoCT)

        $('#myModal4').modal('show');
    });


    $(document).on('click', '.btnXacNhanSuaTN', function () {
        let _thucnhap = $('.SuaTNInput').val();

        let grid = $("#tbody").dxDataGrid("instance");
        let rowIndex = $currentRow.index();

        let rowData = grid.getVisibleRows()[rowIndex].data;
        rowData.SLNhap = _thucnhap;
        SaveSLThucTeBarCode(rowData)
        grid.refresh();

        $('#myModal4').modal('hide');
    });

    $(".SuaTNInput ").on("input", function () {

        var chungtu = toInt($('.theoCTS4').text())
        if (parseFloat($(this).val()) > parseFloat(chungtu)) {
            iziToast.warning({
                message: `Vui lòng nhập không vượt SL chứng từ`,
                position: 'topRight',
                timeout: 2500
            });
            $(this).val($(this).val().slice(0, -1))
            return
        }
    })
    $("#thead").on("click", '.fa-minus-square', function () {
        $('#myModalD').modal('show');
    })
    $(".btn-huy").on("click", function () {
        $('#myModalH').modal('show');
    })
    // Cách 1: Lọc chỉ lấy data rows (Khuyến nghị)
    $(document).on("change", "#checkAllNK", function () {
        let grid = $("#tbody").dxDataGrid("instance");
        let isChecked = $(this).is(":checked");
        let hasWarning = false;
        let hasKiemKe = false; // Thêm biến check kiểm kê
        let visibleRows = grid.getVisibleRows();
        let dataRows = visibleRows.filter(row => row.rowType === "data");
        for (let i = 0; i < dataRows.length; i++) {
            if (dataRows[i].data.CheckKiemKe == 1) {
                hasKiemKe = true;
                break;
            }
        }

        // Nếu có row đang kiểm kê, hiển thị cảnh báo và giữ nguyên trạng thái
        if (hasKiemKe) {
            iziToast.warning({
                message: isChecked ? `Có vật tư đang được kiểm kê không được nhập kho !` : `Có vật tư đang được kiểm kê không được hủy nhận !`,
                position: 'topRight',
                timeout: 2500
            });
            $(this).prop("checked", !isChecked);
            return; // Dừng xử lý
        }

        $("#tbody .dx-data-row").each(function () {
            let $tr = $(this);
            let $checkbox = $tr.find(".checkNK");

            if (!$checkbox.length) return;

            let trIndex = $tr.closest("tbody").find(".dx-data-row").index($tr);

            if (trIndex < dataRows.length) {
                let rowData = dataRows[trIndex].data;

                if (!isChecked) {
                    // UNCHECK ALL

                    const ngayHT = rowData.NgayHT;
                    if (ngayHT != null && String(ngayHT).trim() !== "") {
                        hasWarning = true;
                        $checkbox.prop("checked", true);
                        rowData.IsNK = 1;
                        return;
                    }

                    var checkXH = $tr.data("isxh");
                    if (checkXH == 1) {
                        hasWarning = true;
                        $checkbox.prop("checked", true);
                        rowData.IsNK = 1;
                        return;
                    }

                    $checkbox.prop("checked", false);
                    rowData.IsNK = 0;
                    rowData.ThanhTien = 0;
                    $tr.find("input.inputSLN").val("");
                } else {
                    // CHECK ALL
                    $checkbox.prop("checked", true);
                    let inputSLN = rowData.SLNhap;
                    let SLCT = rowData.SLChungTu.toString();
                    rowData.IsNK = 1;

                    if (!inputSLN || inputSLN == "0") {
                        rowData.SLNhap = Number(SLCT.replace(/,/g, ""));
                        $tr.find("input.inputSLN").val(rowData.SLNhap);
                    } else {
                        rowData.SLNhap = parseFloat(inputSLN) || 0;
                    }

                    let donGia = rowData.DonGia || 0;
                    rowData.ThanhTien = parseFloat((rowData.SLNhap * donGia).toFixed(2));
                }
            } else {
                console.log(`Row ${trIndex} not found in dataRows`);
            }
        });

        grid.refresh();

        if (!isChecked && hasWarning) {
            iziToast.warning({
                message: `Có cây vải đã được Hoàn thành nhận hoặc đã cấp xuất hàng không thể hủy check.`,
                position: 'topRight',
                timeout: 3000
            });
        }
    });
    $("#cayvai").on("change", function () {
        var mauVT = $("#cayvai option:selected").data("mauvt");
        var manpl = $("#cayvai option:selected").data("npl");

        var $select = $(".modalVatTu");
        var $optionToSelect = $select.find(`option[data-mauvt="${mauVT}"][data-npl="${manpl}"]`);

        if ($optionToSelect.length) {
            // Bỏ tất cả chọn trước
            $select.find("option").prop("selected", false);

            // Chọn option đúng theo data
            $optionToSelect.prop("selected", true);

            // Trigger change cho select2
            $select.trigger("change");
        }
    });
    $(".checkNhapThung").on("change", function () {
        if ($(this).is(":checked")) {
            $(".btnDenKho").show()
        } else {
            $(".btnDenKho").hide()
            $("#checkAllNK").prop("checked", false);
        }
        renderNhapKhoTable([])
    })
})
function getBarcodeCheckedDataForWin() {
    var grid = $("#tbody").dxDataGrid("instance");
    if (!grid) return [];

    var dataRows = grid.getVisibleRows().filter(function (x) {
        return x.rowType === "data";
    });

    var list = [];

    $("#tbody .dx-data-row").each(function (index) {
        var $trRow = $(this);

        var checkbarCode = $trRow.find("input.checkbc").is(":checked");
        if (!checkbarCode) return;

        var item = dataRows[index] ? dataRows[index].data : null;
        if (!item) return;

        list.push({
            SoKienHienThi: item.SoKien || "",
            IsKiemKe: item.IsKiemKe,
            SoLot: `${item.SoLoT}${item.Batch == "" ? "" : `/${item.Batch}`}` || "",
            POMua: item.POMua || "",
            MauVT: `${item.MaMauVT} / ${item.MauVT}`,
            SoGhiDauCay: item.SLNhap || item.SLChungTu || "",
            BarCode: item.BarCode || "",
            MaVT: item.MaVT,
            KhoVai: item.KhoVai || "",
            ChiTiet: item.ChiTiet || "",
            NgayNhapKho: item.NgayNhapKho || "",
            NgayKiemKe: item.NgayKiemKe || "",
            TenDVVT: item.TenDVVT || "",
            SoLo: item.SoLo || "",
            SoLoID: item.SoLoID || ""
        });
    });

    return list
}
async function inbarcode() {
    if (window.CefSharp && CefSharp.PostMessage) {
        var data = getBarcodeCheckedDataForWin();

        CefSharp.PostMessage({
            action: "PRINT_BARCODE",
            data: data
        });

        return;
    }

    GetDataBarCode();
    $("#myModalIn").modal("show");
    $(".barcodein").show();
}
function GetDataBarCode() {
    var mavt = $("#cayvai option:selected").data("tenmavt");
    $('.lablebarcode').empty(); // Đúng class
    $('.lablebarcodeB').empty();
    var list = getBarcodeCheckedDataForWin();
    list.forEach(function (item, index) {
        var sokien = item.SoKienHienThi || "";
        var iskiemke = item.IsKiemKe;
        var solot = item.SoLot || "";
        var pomua = item.POMua || "";
        var mau = item.MauVT;
        var thucnhap = item.SoGhiDauCay || "";
        var barcodechia = item.BarCode || "";
        var mavt = item.MaVT || "";
        var khovai = item.KhoVai || "";
        var chitiet = item.ChiTiet || "";
        var ngayNhap = item.NgayNhapKho || "";
        var ngaykiemke = item.NgayKiemKe || "";
        var donvi = item.TenDVVT || "";
        var donvivt = item.DonViVT || "";
        var solo = item.SoLo || "";
        var soLoID = item.SoLoID || "";

        var classWinform = ""
        if (!window.CefSharp) { classWinform = "" } else { classWinform = "winforms"; }
        const labelHTML = `
          <div class="box-item ${classWinform}">
           <div class="label-container" style="width:378px;height:195px">
             <div class="label-header">${iskiemke ? `VIKING VIET NAM -Kiểm Kê: ${ngaykiemke}` : "VIKING VIET NAM "}</div>
                <div style="height:28px !important;padding:2px 4px 6px">
                     <p style="font-size: 11px;
                        width: 100%;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;" class="line-item  mavtbc item_lineNew">
                    <span  style="font-weight: bold;margin-right:5px" >PO: </span>
                    <span style="font-weight: bold;margin-right:10px" class="me-5 itemsolo">${pomua}</span>
                  </p>
                </div>
              <div style="display: flex; justify-content: space-between;padding:2px 4px">
                <div class="left-col" style="width: 75%;">
                   <p  class="line-item  mavtbc mb-2 " style="white-space: nowrap;overflow: hidden; text-overflow: ellipsis;">
                    <span class="caycaitext">${mavt}</span>
                    </p>
                  <p style="" class=" viewhchitiet line-item cayvaibc chitietbc"><span>${chitiet}</span></p>

                     <p class="" style="height: 20px;white-space: nowrap;overflow: hidden; text-overflow: ellipsis;"
                            class="line-item chitietbc mb-2  spantitle w-100">
                        <span style="font-weight: bold;margin-right:5px;font-size:18px">Màu: </span>
                        <span class="caycaitext" style="">${mau}</span>
                    </p>

                  <div class=" line-item item-gapprint item_lineNew gapsokien" style="display:flex;gap:10px !important;height: 18px">
                    <p class="text-nowrap" style="overflow: hidden; text-overflow: ellipsis;height: 25px;width:160px !important">
                        <span style="font-weight: bold;margin-right:5px" class="spantitle">Kiện/Roll:</span>
                        <span class="spanitem">${sokien}</span>
                    </p>
                   <p style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; height: 25px; width: 200px;">
                     <span style="font-weight: bold;margin-right:1px" class="spantitle">LOT/BATCH:</span>
                     <span class="spanitem"> ${solot}</span>
                   </p>
                  </div>
                 <div  style="display:flex;gap:5px !important;height: 25px" class="gapslth line-item item_lineNew item-gapprint">
                    <p class="text-nowrap">
                         <span class="spantitle text-nowrap">Số lượng: </span>
                         <span class="spanitem text-nowrap">${thucnhap}</span>
                         <span class="spanitemdv text-nowrap">${donvi}</span>
                    <p/>
                    <p class="text-nowrap" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; height: 25px;">
                       <span class="spantitle">Khổ/Size: </span>
                         <span class="spanitem">${khovai}</span>
                          <span class="spanitemdv">${donvivt}</span>
                    </p>
                    
                  </div>
                       ${classWinform == "" ? "" : ` <div <p style="white-space: nowrap;overflow: hidden; text-overflow: ellipsis;height: 25px;width:510px">
                        <span style="font-weight: bold;margin-right:5px" class="spantitle">QrCode:</span>
                        <span class="spanitem">${barcodechia}</span>
                    </p></div>`}
                </div>
                <div class="right-col " style="width: 25%; text-align: center;">
                 <div class="itemngay w-100">
                     <p class="ngaynhap">Ngày nhập:</p>
                  <p>${ngayNhap}</p>
                <div style="display: flex; justify-content: end;">
                  <div id="qr-${index}" class="qr-code"></div>
                </div>  
                </div>
              </div>
                  
           
          </div>

            ${classWinform == "" ? ` <div class="line-item item-gapprint mb-0" style="padding:2px 4px 6px">
                    <p style="white-space: nowrap;overflow: hidden; text-overflow: ellipsis;height: 25px;width: 98%">
                        <span style="font-weight: bold;margin-right:5px" class="spantitle">QrCode:</span>
                        <span class="spanitem">${barcodechia}</span>
                    </p>


                  </div>` : ""}
        `;
        var classGap = index % 2 == 0 ? "pe-`" : "ps-1"
        const labelHTMLB = `
         <div class="col-12 col-md-12 col-lg-6 col-xl-4 d-flex justify-content-center ${classGap} py-2">
           <div class="label-container" style="width:378px;height:220px !important">
              <div class="label-header">${iskiemke ? `VIKING VIET NAM -Kiểm Kê: ${ngaykiemke}` : "VIKING VIET NAM "}</div>
                <div class="w-100" style="padding:0px 4px 4px">
                        <p style="font-size: 11px;
                        height: 15px;
                        width: 100%;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;" class="line-item  mavtbc mb-0 ">
                    <span  style="font-weight: bold;margin-right:5px" >PO: </span>
                    <span style="font-weight: bold;margin-right:10px" class="me-5 itemsolo">${pomua}</span>
                  </p>
                 </div>
              <div style="display: flex; justify-content: space-between;padding:0px 4px">
                 
                <div class="left-col" style="width: 75%;">
                    <p  class="line-item  mavtbc mb-1 " style="white-space: nowrap;overflow: hidden; text-overflow: ellipsis;">
                    <span class="cayvaibc">${mavt}</span>
                    </p>
                  <p style="height: 52px;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-size: 11px;
                    l etter-spacing: 1px;
                    margin-bottom: 2px !important;" class="line-item cayvaibc chitietbc mb-2"><span>${chitiet}</span></p>
                 <p  style="height: 18px" class="line-item chitietbc mb-1">
                    <span class="spantitle" style="font-weight: bold;margin-right:5px">Màu: </span>
                    <span class="cayvaibc" style="">${mau}</span>
                </p>
                  <div class="line-item item-gapprint mb-2" style="display:flex;gap:10px;height: 18px">
                    <p class="text-nowrap w-30" style="overflow: hidden; text-overflow: ellipsis;height: 15px;">
                        <span style="font-weight: bold;margin-right:5px" class="spantitle">Kiện/Roll:</span>
                        <span class="spanitem">${sokien}</span>
                    </p>
                   <p style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; height: 15px; width: 138px;">
                     <span style="font-weight: bold;margin-right:5px" class="spantitle">LOT/BATCH:</span>
                     <span class="spanitem"> ${solot}</span>
                   </p>
                  </div>
                 <div  style="display:flex;gap:2px;height: 18px" class="line-item item-gapprint mb-2">
                    <p class="text-nowrap">
                         <span class="spantitle text-nowrap">Số lượng: </span>
                         <span class="spanitem text-nowrap">${thucnhap}</span>
                         <span class="spanitemdv text-nowrap">${donvi}</span>
                    <p/>
                    <p class="text-nowrap" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; height: 18px;">
                       <span class="spantitle">Khổ/Size: </span>
                         <span class="spanitem">${khovai}</span>
                         <span class="spanitemdv">${donvivt}</span>
                    </p>
                     
                  </div>
                 
                </div>
                <div class="right-col " style="width: 25%; text-align: center;">
                 <div class="itemngay w-100">
                     <p class="ngaynhap">Ngày nhập:</p>
                  <p>${ngayNhap}</p>
                <div style="display: flex; justify-content: end;">
                  <div id="qrB-${index}" class="qr-code"></div>
                </div>
              </div>
            </div>
        </div>
                <div class="line-item item-gapprint mb-2" style="display:flex;gap:50px;height: 18px;padding:2px 4px 6px">
                    <p style="white-space: nowrap;overflow: hidden; text-overflow: ellipsis;height: 20px;width: 98%;">
                        <span style="font-weight: bold;margin-right:5px" class="spantitle">QrCode:</span>
                        <span class="spanitem">${barcodechia}</span>
                    </p>

                  </div>
        `;
        $('.lablebarcodeB').append(labelHTMLB);
        $('.lablebarcode').append(labelHTML);
        new QRCode(document.getElementById(`qr-${index}`), {
            text: barcodechia,
            width: 100,
            height: 100
        });
        new QRCode(document.getElementById(`qrB-${index}`), {
            text: barcodechia,
            width: 100,
            height: 100
        });
    })
}



async function CheckDub(sokien) {
    var npl = $("#cayvai option:selected").data("npl")
    let SoLo = $("#soloid").val()

    const url = `/api/PhieuXuatHangNPL/Get?action=GetCheckDub&para1=${SoLo}&para2=${npl}&para3=${sokien}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const data = await response.json();
        if (data.length == 0) return false
        return true

    } catch (error) {
        console.error(error.message);
    }
}
function getDate() {
    $(".datepicker").flatpickr({
        enableTime: false,
        dateFormat: "d-m-Y ",
        time_24hr: false,
        allowInput: true,
        defaultDate: new Date()
    });
}
async function addRowBody() {
    let x = {
        SoKien: $('.sokienMD').val(),
        KhoVai: $('.khosizeMDA').text().trim(),
        TenDVVT: $('.donviMDA').text().trim(),
        SoLoT: $('.tenlotMD').val(),
        SLNhap: $('.thucnhapMD').val(),
        DonGia: $('.dongiaMDA').val(),
        ChiTiet: $('.vattuMDA').text().trim(),

    }
    let html = `
                <tr data-slchungtu=${x.SLNhap} style="background:#b4ff8c" data-isxh="0"  data-id="0" data-sokien="${x.SoKien}" data-khosize="${x.KhoVai}" data-donvi="${x.TenDVVT}">
                    <td style="max-width: 60px;min-width: 50px;">
                          <div>
                           <input type="checkbox" class="checkNK" style = "width: 18px; height: 18px;" checked />
                          </div>
                    </td>
                    <td class="" style="">${index + 1}</td>
                   
                    <td class="solot" style="">${x.SoLoT}</td>
                    <td title="${x.ChiTiet}" class="chiTietNK" style="">${x.ChiTiet}</td>
                    <td style="">${x.KhoVai}</td>
                    <td class="donvi" style=" ">${x.TenDVVT}</td>
                     <td class="sokien" style="">${x.SoKien}</td>
                  <td  style=" "> <div class="itemct"><span class="SLCT" > ${formatNumberUS(x.SLNhap)}</span> <i class="fa-solid fa-arrow-right"></i></div> </td>
                    <td class="itemThucNhap" style="width: 100px;
    min-width: 100px;">
                       <div class="" style="width: 100%; position: relative;padding-right: 15px;">
                            <input readonly style="border: none; outline: none;text-align:center;width: 100%;background: transparent;color:;font-weight:700;width: 100%;
                            " type="number" class="inputSLN" value="${x.SLNhap}"/>
                               <i class="fa-solid fa-pen-to-square"></i>
                         </div>
                    </td>
                   
                    <td class="dongia" style="">${formatNumberUS(x.DonGia) ?? ""}</td>
                    <td class="thanhtien" style="">${formatNumberUS(parseFloat((x.DonGia * x.SLNhap).toFixed(2)))}</td>
                    <td class="barcode" style=""></td>
                    <td style="max-width: 60px;min-width: 50px;">
                            <div style="display: flex;justify-content: center; align-items: center;">
                           <input type = "checkbox" class="checkbc" style = "width: 18px; height: 18px;"  checked />
                          </div>
                    </td>
               </tr>`
    $('#myModal').modal('hide');
    index += 1
    let arrSave = []
    let $lastRow = $(html);
    let object = await handleListTr($lastRow, 0);
    arrSave.push(object)
    await Save(arrSave)

}
async function handleListTr($this, checkSave) {
    let SoKien = $this.data("sokien");
    let SoLoT = $this.find(".solot").text().trim();
    let SLNhap = $this.find(".inputSLN").val() || "0";
    let SoLo = $(".modalSoLo").val()
    let DonGia = $(".modalVatTu option:selected").data("dongia")
    var khovaiID = $(".modalVatTu option:selected").data("khovai")
    var maumau = $(".modalVatTu option:selected").data("maumau")
    var haiquan = $(".modalVatTu option:selected").data("haiquan")
    var npl = $(".modalVatTu option:selected").data("npl")
    var maketoan = $(".modalVatTu option:selected").data("maketoan")
    var mauvt = $(".modalVatTu option:selected").data("mauvt")
    var madvvt = $(".modalVatTu option:selected").data("dvvt")
    var isnpl = $(".modalVatTu option:selected").data("isnpl")
    var mavt = $(".modalVatTu").val()
    let barCode = `${SoLo}@${npl}@${SoKien}`
    let slct = $this.data("slchungtu") || "0";
    let object =
    {
        ID: $this.data("id"),
        SoLoID: SoLo,
        MaNPL: npl,
        MaVTID: mavt,
        MaMauVT: maumau,
        SoKien: SoKien.toString(),
        SoLoT: SoLoT,
        MaHaiQuan: haiquan,
        MaKeToan: maketoan,
        SoGhiDauCay: slct,
        NW: isnpl,
        GW: 0,
        BarCode: barCode,
        GhiChu: "",
        IsNPL: checkSave == 0 ? 0 : $this.find('.checkNK').is(':checked') ? 1 : 0,
        KhoVaiID: khovaiID,
        SoKienParent: checkSave == 0 ? null : $(".paletMD").val() ?? "",
        SoLuongThucTe: SLNhap ?? 0,
        DonGia: parseFloat(DonGia),
        ThanhTien: parseFloat(SLNhap) * parseFloat(DonGia),
        Pallet: checkSave == 0 ? null : moment($(".datepicker").val(), "DD-MM-YYYY").format("YYYY-MM-DD"),
        MaDVVT: madvvt,
        MauVTID: mauvt,
    }
    return object
}
async function SaveTable() {

    let arrSave = [];
    let rows = $("#tbody tr").toArray();

    for (const row of rows) {
        const $row = $(row);
        let $checkbox = $row.find(".checkNK");
        if (!$checkbox.length) continue;
        const isChecked = $row.find('.checkNK').is(':checked');

        if (!isChecked) continue;
        let grid = $("#tbody").dxDataGrid("instance");
        let rowIndex = $row.index();
        let rowData = grid.getVisibleRows()[rowIndex].data;
        if (rowData.CheckKiemKe === 1) {
            iziToast.warning({
                message: `Có vật tư đang được kiểm kê không được nhập kho !`,
                position: 'topRight',
                timeout: 2500
            });
            return; //
        }
        let object = await handleList($(row), 1);
        arrSave.push(object);
    }
    await Save(arrSave);
    await $('#myModalN').modal('hide');
}

async function HuyNhan() {

    let arrSave = [];
    let rows = $("#tbody tr").toArray();
    for (const row of rows) {
        const $row = $(row);
        const isChecked = $row.find('.checkNK').is(':checked');
        let $checkbox = $row.find(".checkNK");
        if (!$checkbox.length) continue;
        const dataHuy = $row.data('nhapkho')
        if (isChecked) continue; // Bỏ qua nếu checkbox không được chọn

        let grid = $("#tbody").dxDataGrid("instance");
        let rowIndex = $row.index();
        let rowData = grid.getVisibleRows()[rowIndex].data;

        if (rowData.CheckKiemKe === 1) {
            iziToast.warning({
                message: `Có vật tư đang được kiểm kê không được hủy nhận!`,
                position: 'topRight',
                timeout: 2500
            });
            return; //
        }

        let object = await handleList($(row), 1);
        arrSave.push(object);
    }
    await Save(arrSave);
    await $('#myModalH').modal('hide');

}

function handeleNoti(mess, title) {
    iziToast.warning({
        title: `${title}`,
        message: `${mess}`,
        position: 'topRight'
    });
}
async function handleList($this, checkSave) {
    let SoKien = $this.data("sokien");
    let SoLoT = $this.find(".solot").text().trim();
    let SLNhap = $this.find(".inputSLN").val() || "0";
    let DonGiaText = $this.find(".dongia").text().trim();
    let DonGia = parseInt(DonGiaText.replace(/,/g, ''), 10);

    let SoLo = $this.data("soloid")
    var khovaiID = $this.data("khosize")
    var maumau = $this.data("mamauvt")
    var haiquan = $this.data("haiquan")
    var npl = $this.data("npl")
    var maketoan = $this.data("maketoan")
    var mauvt = $this.data("mauvt")
    var madvvt = $this.data("madonvi")
    var isnpl = isNPL
    var mavt = $this.data("mavattu")

    let barCode = `${SoLo}@${npl}@${SoKien}`
    let slct = $this.data("slchungtu") || "0";
    let object =
    {
        ID: $this.data("id"),
        SoLoID: SoLo,
        MaNPL: npl,
        MaVTID: mavt,
        MaMauVT: maumau,
        SoKien: SoKien.toString(),
        SoLoT: SoLoT,
        MaHaiQuan: haiquan ?? "",
        MaKeToan: maketoan ?? "",
        SoGhiDauCay: toInt(slct),
        NW: isnpl,
        GW: 0,
        BarCode: barCode,
        GhiChu: "",
        IsNPL: checkSave == 0 ? 0 : $this.find('.checkNK').is(':checked') ? 1 : 0,
        KhoVaiID: khovaiID,
        SoKienParent: checkSave == 0 ? null : $(".paletMD").val() ?? "",
        SoLuongThucTe: SLNhap ?? 0,
        DonGia: parseFloat(DonGia),
        ThanhTien: parseFloat(SLNhap) * parseFloat(DonGia),
        Pallet: checkSave == 0 ? null : moment($(".datepicker").val(), "DD-MM-YYYY").format("YYYY-MM-DD"),
        MaDVVT: madvvt,
        MauVTID: mauvt,
    }
    return object
}
function getDataRow() {

    var dongia = $(".modalVatTu option:selected").data("dongia")
    var khosize = $(".modalVatTu option:selected").data("khovai")
    var donvi = $(".modalVatTu option:selected").data("tendvvt")
    $('.dongiaMDA').val(parseFloat(dongia))
    $('.dongiaMDTextA').text(parseFloat(dongia))
    $('.khosizeMDA').text(khosize)
    $('.donviMDA').text(donvi)

}
async function Save(arrSave, action = 'PostVT') {
    cayvaiPress = $("#cayvai option:selected").data("npl")
    soLoPress = $("#soloid").val()
    arrSave = arrSave.map(obj =>
        Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, value ?? ""])
        )
    );
    var dataUser = !window.CefSharp ? userNameSave : userName
    const request = new Request(`/api/PhieuXuatHangNPL/PostWeb?action=${action}&para1=${dataUser}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(arrSave),
    });
    let response = await fetch(request)
    let data = await response.json()
    if (data == "True") {
        iziToast.success({
            message: `Lưu thành công`,
            position: 'topRight',
            timeout: 2000
        });
    }
    else {
        iziToast.warning({
            message: `Lưu thất bại`,
            position: 'topRight',
            timeout: 2500
        });
        return
    }
}
async function GetKhachHangNL() {
    const url = `/api/PhieuXuatHangNPL/Get?action=GetKH&para1=1`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();
        let html = `<option value="">Tất cả</option>`;
        data.map(x => {
            html += `
                <option value="${x.MaKH}">${x.TenKH}</option>
            `

        })
        $("#khachhangid").html(html)
        GetMaHangNL()
    } catch (error) {
        console.error(error.message);
    }
}
async function GetMaHangNL() {

    const url = `/api/PhieuXuatHangNPL/Get?action=GetMaHangMK&para1=1&para7=${$("#khachhangid").val()}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();
        let html = `<option value="all">Tất cả</option>`;
        data.map(x => {
            html += `
                <option value="${x.MaHang}">${x.MaHang == "" ? "Mã hàng rỗng" : x.MaHang}</option>
            `

        })
        $("#mahangid").html(html)
        //GetPhieuNK()
        GetSoLo()
    } catch (error) {
        console.error(error.message);
    }
}
async function GetSoLo() {
    var maVT = $("#cayvai").val()
    var mauVT = $("#cayvai option:selected").data("mauvt")
    var khovai = $("#cayvai option:selected").data("khovai")
    var soloid = $("#cayvai option:selected").data("soloid")
    var isNPLR = $("#cayvai option:selected").data("isnpl")
    var isChecked = $(".checkNhapThung").prop("checked") ? 1 : 0;
    var mahang = $("#mahangid").val()
    const url = `/api/PhieuXuatHangNPL/Get?action=GetSoLoMK&para1=${isChecked}&para2=${mahang}&para5=1&para7=${$("#khachhangid").val()}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        var data = await response.json();
        let html = ` <option data-mahang="" value=""></option>`;

        data.map(x => {
            html += `
                <option data-mahang="${x.MaHang ?? ""}" value="${x.SoLoID}">${x.Display}</option>
            `
        })
        $("#soloid").html(html)
        $("#cayvai").empty()
        //GetVatTu()
        renderNhapKhoTable([])
    } catch (error) {
        console.error(error.message);
    }
}
async function GetSoLoModal() {
    var maVT = $(".modalVatTu").val()
    var mauVT = $(".modalVatTu option:selected").data("mauvt")
    var khovai = $(".modalVatTu option:selected").data("khovaiid")
    var soloid = $(".modalVatTu option:selected").data("soloid")
    var isNPL = $(".modalVatTu option:selected").data("isnpl")
    const url = `/api/PhieuXuatHangNPL/Get?action=GetSoLoMK&para1=${maVT}&para2=${mauVT}&para3=${khovai}&para4=${soloid}&para5=${isNPL ? "1" : "0"}&para7=${$("#khachhangid").val()}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        var data = await response.json();
        let html = ``;
        const listNPL = dataCayVai.map(x => x.MaNPL);
        if ($("#mahangid").val() == '' || $("#mahangid").val() == null) {

            data = data.filter(x => x.MaHang == "" && listNPL.includes(x.MaNPL))
        }
        else if (($("#mahangid") !== '' || $("#mahangid").val() == null) && $("#mahangid").val() != 'all') {
            data = data.filter(x => x.MaHang == $("#mahangid").val() && listNPL.includes(x.MaNPL))
        }
        data = data.filter(x => listNPL.includes(x.MaNPL))
        var listData = [
            ...new Map(data.map((item) =>
                [`${item.MaHang}-${item.SoLoID}-${item.Display}`, { MaHang: item.MaHang, SoLoID: item.SoLoID, Display: item.Display }]
            )).values()
        ];
        listData.map(x => {
            html += `
                <option data-mahang="${x.MaHang}" value="${x.SoLoID}">${x.Display}</option>
            `
        })
        $(".modalSoLo").html(html)
        $(".modalSoLo").select2()
        //GetVatTu()
    } catch (error) {
        console.error(error.message);
    }
}
var dataVT = []
async function GetVatTu(value) {
    dataVT = []
    var mahang = $("#mahangid").val()
    var SoLoID = $("#soloid").val()
    var isChecked = $(".checkNhapThung").prop("checked") ? 1 : 0;
    const url = `/api/PhieuXuatHangNPL/Get?action=GetVTMK&para1=1&para2=${mahang}&para3=${SoLoID}&para4=${isChecked}&para7=${$("#khachhangid").val()}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();

        dataVT = data
        returnVatTu(data)

    } catch (error) {
        console.error(error.message);
    }
}
function returnVatTu(data) {

    if (data.length == 0) {
        $("#cayvai").empty()
        $(".modalVatTu").empty()
        renderNhapKhoTable([])
        return
    }

    let html = `<option data-soloid="" data-isnpl="1" data-tenmavt="" data-dongia="" data-chitiet="" data-dvvt="" data-maumau=""  data-haiquan="" data-npl="" data-maketoan="" data-khovai="" data-mauvt="" value="">Tất cả</option>`;

    data.map(x => {
        html += `
                <option data-soloid="${x.SoLoID}" data-isnpl="${x.IsNPL}" data-tenmavt="${x.MaVT}" data-dongia="${x.DonGia}" data-chitiet="${x.ChiTiet}"
                data-dvvt="${x.MaDVVT}" data-maumau="${x.MaMauVT}"  data-haiquan="${x.MaHaiQuan}" data-npl="${x.MaNPL}" data-maketoan="${x.MaKeToan}" data-khovai="${x.KhoVaiID}"
                data-mauvt="${x.MauVTID}" value="${x.MaVTID}">${x.Display}</option>
            `
    })

    $("#cayvai").html(html)
    GetPhieuNK()
}
async function GetPhieuNK() {
    var manpl = $("#cayvai option:selected").data("npl")
    var mauVT = $("#cayvai option:selected").data("mauvt")
    var khovai = $("#cayvai option:selected").data("khovai")
    var isNPLR = $("#cayvai option:selected").data("isnpl")
    var mahang = $("#soloid option:selected").data("mahang") ?? ""
    const url = `/api/PhieuXuatHangNPL/Get?action=GetBienBan&para1=${$("#soloid").val()}&para2=${manpl}&para5=1&para6=${mahang}&para7=${$("#khachhangid").val()}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();

        renderNhapKhoTable(data)
    } catch (error) {
        console.error(error.message);
    }
}
function summaryItem(column) {
    return {
        column: column,
        summaryType: "sum",
        valueFormat: "#,##0.####",
        customizeText: function (e) {
            return Number.isInteger(e.value)
                ? DevExpress.localization.formatNumber(e.value, "#,##0")
                : DevExpress.localization.formatNumber(e.value, "#,##0.0000");
        }
    }
}
function renderNhapKhoTable(data) {
    const countChXuat = data.filter(x => x.Status === 1).length
    const countDXuat = data.filter(x => x.Status === 2).length
    $("#tbody").dxDataGrid({
        dataSource: data,
        keyExpr: "ID",
        columns: [
            {
                dataField: "CayVai_Group",
                caption: "Số lô",
                cssClass: "col-header",
                minWidth: 100,
                groupIndex: 0, // group cấp 1
                calculateCellValue: function (rowData) {
                    if (!rowData) return "";
                    return `${rowData.SoLo} - MH:${rowData.MaHang ?? ""} - Vật tư: ${rowData.DisplayGroup} - Màu vật tư: ${rowData.MauVT}`;
                }
            },
            {
                dataField: "CheckIsNK",
                caption: "",
                width: 60,
                cssClass: "col-header",
                headerCellTemplate: function (container, options) {
                    // Tạo checkbox header
                    let $checkAll = $("<input>", {
                        type: "checkbox",
                        id: "checkAllNK",
                        style: "width:18px;height:18px;"
                    });

                    // Thêm vào header cell
                    $("<div>")
                        .css({
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        })
                        .append($checkAll)
                        // Kiểm tra nếu đang ở chế độ "Nhập kho"
                        .appendTo(container)

                    // Lấy instance của grid
                    let grid = $("#tbody").dxDataGrid("instance");
                    let visibleRows = grid.getVisibleRows();

                    // Kiểm tra nếu đang ở chế độ "Nhập kho"
                    let isNhapKho = $(".checkNhapThung").is(":checked");

                    let allChecked = false;
                    if (isNhapKho) {
                        allChecked = visibleRows
                            .filter(r => r.rowType === "data")
                            .every(r => r.data.IsNK == 1);
                    }

                    // Set trạng thái cho checkbox header
                    $checkAll.prop("checked", allChecked);
                },
                cellTemplate: function (container, options) {
                    $("<div>")
                        .css({
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        })
                        .append(
                            $("<input>", {
                                type: "checkbox",
                                class: "checkNK",
                                style: "width:18px;height:18px;",
                                checked: options.data.IsNK == 1
                            })
                        )
                        .appendTo(container);
                }
            },
            {
                dataField: "NgayNhapKho",
                caption: "Ngày Kiểm",
                minWidth: 100,
                cssClass: "solot col-header"
            },
            {
                caption: "STT",
                width: 50,
                cssClass: "col-header",
                cellTemplate: function (container, options) {
                    let grid = options.component;
                    let visibleRows = grid.getVisibleRows();
                    let dataIndex = visibleRows
                        .filter(r => r.rowType === "data")
                        .findIndex(r => r.rowIndex === options.rowIndex);

                    if (dataIndex >= 0) {
                        $("<div>")
                            .text(dataIndex + 1)
                            .appendTo(container);
                    }
                }
            },
            {
                dataField: "SoLoT",
                caption: "Số LOT",
                minWidth: 100,
                cssClass: "solot col-header"
            },
            {
                dataField: "MaVT",
                caption: "ItemCode",
                minWidth: 100,
                cssClass: "solot col-header"
            },
            {
                dataField: "ChiTiet",
                caption: "Mô tả",
                minWidth: 150,
                cssClass: "chiTietNK col-header"
            },
            {
                dataField: "KhoVai",
                caption: "Width/Size",
                cssClass: "col-header",
                width: 100
            },

            {
                dataField: "SoKien",
                caption: "Số Roll",
                width: 100,
                cssClass: "sokien col-header"
            },
            {
                dataField: "DotHT",
                caption: "Đợt Nhận",
                width: 100,
                cssClass: "dotht col-header",
                cellTemplate: function (container, options) {
                    container.text(`Lần ${options.value}`).css({ color: "red", fontWeight: "bold" })
                }
            },
            {
                dataField: "NgayHT",
                caption: "Ngày Nhận",
                width: 100,
                cssClass: "ngayht col-header"
            },
            {
                dataField: "SLChungTu",
                caption: "SL chứng từ",
                cssClass: "col-header",
                width: 100,
                cellTemplate: function (container, options) {
                    const duyetnk = options.data.IsDuyetNK
                    $("<div>")
                        .addClass("itemct")
                        .append(`<span class="SLCT">${formatNumberUS(options.data.SLChungTu)}</span>`)
                        .append(`<i class="fa-solid fa-arrow-right ${duyetnk == 1 ? 'd-none' : ""} changeCLCT"></i>`)
                        .appendTo(container);
                }
            },
            {
                dataField: "SLNhap",
                caption: "SL nhập",
                width: 100,
                cssClass: "itemThucNhap col-header",
                cellTemplate: function (container, options) {
                    const slNhap = Number(options.data.SLNhap) || 0;
                    const slChungTu = Number(options.data.SLChungTu) || 0;
                    const duyetnk = options.data.IsDuyetNK
                    // Nếu SLNhap < SLChungTu thì add class vào <td>
                    if (slNhap < slChungTu) {
                        container.addClass("tdThucNhapL");
                    }

                    $("<div>")
                        .css({
                            width: "100%",
                            position: "relative",
                            paddingRight: "15px"
                        })
                        .append(
                            $("<input>", {
                                type: "number",
                                readonly: true,
                                value: slNhap || "",
                                class: "inputSLN",
                                style: "border:none;outline:none;text-align:center;background:transparent;font-weight:700;width:100%;"
                            })
                        )
                        .append(`<i class="fa-solid  fa-pen-to-square ${duyetnk == 1 ? 'd-none' : ""}"></i>`)
                        .appendTo(container);
                }
            },
            {
                dataField: "TenDVVT",
                caption: "Đơn vị",
                width: 120,
                cssClass: "donvi col-header"
            },
            {
                dataField: "DonGia",
                caption: "Đơn giá",
                cssClass: "dongia col-header",
                customizeText: e => formatNumberUS(e.value)
            },
            {
                dataField: "ThanhTien",
                caption: "Thành tiền",
                cssClass: "thanhtien col-header",
                calculateCellValue: function (rowData) {
                    return (rowData.DonGia * (rowData.SLNhap || 0)).toFixed(2);
                },
                customizeText: e => formatNumberUS(e.value)
            },
            {
                dataField: "BarCode",
                caption: "Barcode",
                cssClass: "barcode col-header"
            },
            {
                dataField: 'InBarCode',
                caption: "In BarCode",
                width: 100,
                cssClass: "col-header",
                cellTemplate: function (container, options) {
                    $("<div>")
                        .css({
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        })
                        .append(
                            $("<input>", {
                                type: "checkbox",
                                class: "checkbc",
                                style: "width:18px;height:18px;"
                            })
                        )
                        .appendTo(container);
                }
            },

            {

                dataField: "Status",
                caption: "Trạng thái",
                width: 100,
                cssClass: "col-header",
                cellTemplate: function (container, options) {
                    // Lấy giá trị status
                    var status = options.data.Status === 1 ? "Chưa xuất" : options.data.Status === 2 ? "Đã xuất" : "Kiểm kê"; // đảm bảo trường trong data là 'status'

                    var $div = $("<div>")
                        .css({
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontWeight: "bold",
                            color: status === 'Đã xuất' ? "red" : "black",
                            whiteSpace: 'nowrap'
                        }).text(status);


                    $div.appendTo(container);
                }
            },
            {
                dataField: "ViTriO",
                caption: "Vị trí Ô",
                width: 80,
                cssClass: "col-header vitrioitem"
            },
            {
                dataField: "CBM",
                caption: "CBM",
                width: 90,
                cssClass: "cbm col-header",
                cellTemplate: function (container, options) {

                    container.addClass(`tdCBM ${options.data.IsKho == 2 ? "vtk" : ""}`);
                    $(`<div style="display: flex; justify-content: center; align-items: center;">`)
                        .css({
                            width: "100%",
                            position: "relative",
                            paddingRight: "15px"
                        })
                        .append(
                            $("<input>", {
                                type: "number",
                                readonly: true,
                                value: options.data.CBM || "",
                                class: "inputCBM",
                                style: "border:none;outline:none;text-align:center;background:transparent;width:100%;"
                            })
                        )
                        .append(`<i class="fa-solid fa-pencil editcbm  ${options.data.IsKho == 2 ? "d-none" : ""}"></i>`)
                        .appendTo(container);
                },
                //    customizeText: e => formatNumberUS(e.value || 0)
            },
            {
                dataField: "NhapCBM",
                caption: "Nhập CBM",
                width: 60,
                cssClass: "col-header",
                headerCellTemplate: function (container, options) {
                    // Tạo checkbox header
                    let $checkAll = $("<input>", {
                        type: "checkbox",
                        id: "checkAllCBM",
                        style: "width:18px;height:18px;"
                    });

                    // Thêm vào header cell
                    $("<div>")
                        .css({
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        })
                        .append($checkAll)
                        .appendTo(container);
                },
                cellTemplate: function (container, options) {
                    $("<div>")
                        .css({
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        })
                        .append(
                            $("<input>", {
                                type: "checkbox",
                                class: `checkCBM   ${options.data.IsKho == 2 ? "d-none" : ""}`,
                                style: "width:18px;height:18px;",
                                checked: false
                            })
                        )
                        .appendTo(container);
                }
            }
        ],
        summary: {
            totalItems: [
                {
                    column: "SLChungTu",
                    summaryType: "sum",
                    customizeText: function (e) {
                        return Number.isInteger(e.value)
                            ? DevExpress.localization.formatNumber(e.value, "#,##0")
                            : DevExpress.localization.formatNumber(e.value, "#,##0.00");
                    }
                },
                {
                    column: "SLNhap",
                    summaryType: "sum",
                    customizeText: function (e) {
                        return Number.isInteger(e.value)
                            ? DevExpress.localization.formatNumber(e.value, "#,##0")
                            : DevExpress.localization.formatNumber(e.value, "#,##0.00");
                    }
                },
                {
                    column: "ThanhTien",
                    summaryType: "sum",
                    customizeText: function (e) {
                        return DevExpress.localization.formatNumber(e.value, "#,##0.00");
                    }
                },
                //{
                //    column: "CBM",
                //    summaryType: "sum",
                //    customizeText: function (e) {
                //        return DevExpress.localization.formatNumber(e.value, "#,##0.00");
                //    }
                //},
                // Thêm custom summary để hiển thị thống kê Status

            ],
            groupItems: [
                {
                    column: "SLChungTu",
                    summaryType: "sum",
                    showInGroupFooter: true,
                    alignByColumn: true,
                    customizeText: function (e) {
                        return Number.isInteger(e.value)
                            ? DevExpress.localization.formatNumber(e.value, "#,##0")
                            : DevExpress.localization.formatNumber(e.value, "#,##0.00");
                    }
                },
                {
                    column: "SLNhap",
                    summaryType: "sum",
                    showInGroupFooter: true,
                    alignByColumn: true,
                    customizeText: function (e) {
                        return Number.isInteger(e.value)
                            ? DevExpress.localization.formatNumber(e.value, "#,##0")
                            : DevExpress.localization.formatNumber(e.value, "#,##0.00");
                    }
                },
                {
                    column: "ThanhTien",
                    summaryType: "sum",
                    showInGroupFooter: true,
                    alignByColumn: true,
                    customizeText: function (e) {
                        return DevExpress.localization.formatNumber(e.value, "#,##0.00");
                    }
                },
                //{
                //    column: "CBM",
                //    summaryType: "sum",
                //    showInGroupFooter: true,
                //    alignByColumn: true,
                //    customizeText: function (e) {
                //        return DevExpress.localization.formatNumber(e.value, "#,##0.00");
                //    }
                //}
            ]
        },
        loadPanel: {
            enabled: true,
            text: "Đang tải dữ liệu...",
            showIndicator: true,
            showPane: true
        },
        onRowPrepared: function (e) {
            if (e.rowType === "data") {
                // gán attr như bảng cũ
                e.rowElement.attr("data-cbm", e.data.CBM);
                e.rowElement.attr("data-mavtghep", e.data.MaVTGhep);
                e.rowElement.attr("data-slchungtu", e.data.SLChungTu);
                e.rowElement.attr("data-nhapkho", e.data.IsNK == 1 ? "1" : "0");
                e.rowElement.attr("data-isxh", e.data.isXH);
                e.rowElement.attr("data-id", e.data.ID);
                e.rowElement.attr("data-barcodegoc", e.data.BarCodeGoc);
                e.rowElement.attr("data-sokien", e.data.SoKien);
                e.rowElement.attr("data-dongia", e.data.DonGia);
                e.rowElement.attr("data-khosize", e.data.KhoVai);
                e.rowElement.attr("data-mamauvt", e.data.MaMauVT);
                e.rowElement.attr("data-haiquan", e.data.MaHaiQuan);
                e.rowElement.attr("data-maketoan", e.data.MaKeToan);
                e.rowElement.attr("data-mauvt", e.data.MauVT);
                e.rowElement.attr("data-madonvi", e.data.MaDVVT);
                e.rowElement.attr("data-donvi", e.data.TenDVVT);
                e.rowElement.attr("data-solo", e.data.SoLo);
                e.rowElement.attr("data-mavattu", e.data.MaVT);
                e.rowElement.attr("data-vattu", e.data.ChiTiet);
                e.rowElement.attr("data-npl", e.data.MaNPL);
                e.rowElement.attr("data-barcode", e.data.BarCode);
                e.rowElement.attr("data-soloid", e.data.SoLoID);
                e.rowElement.attr("data-mahang", e.data.MaHang);
                e.rowElement.attr("data-pomua", e.data.POMua);
                e.rowElement.attr("data-gw", e.data.GW);
                e.rowElement.attr("data-batch", e.data.Batch);
                e.rowElement.attr("data-iskiemke", e.data.IsKiemKe);
                e.rowElement.attr("data-ngaykiemke", e.data.NgayKiemKe);
                e.rowElement.attr("data-donvivt", e.data.DonViVT);
                e.rowElement.attr("data-typecbm", e.data.IsCBM);
                e.rowElement.attr("data-dai", e.data.Dai);
                e.rowElement.attr("data-rong", e.data.Rong);
                e.rowElement.attr("data-cao", e.data.Cao);
                e.rowElement.attr("data-duongkinh", e.data.DK);
                e.rowElement.attr("data-iskho", e.data.IsKho);
                e.rowElement.attr("data-ngaynhapkho", e.data.NgayNhapKho);

                if (e.data.IsNK == 1) {
                    e.rowElement.css("background", "#b5fff8");
                }
            }
        },
        onContentReady: function (e) {
            // Merge 3 cột đầu tiên cho row thống kê Status
            setTimeout(function () {
                const $table = $("#tbody .dx-datagrid-table");
                const $statusRow = $table.find("tr.dx-row").last(); // Row cuối cùng là total row

                if ($statusRow.find("td").length > 0) {
                    const $firstCell = $statusRow.find("td").first();
                    const $secondCell = $statusRow.find("td").eq(1);
                    const $thirdCell = $statusRow.find("td").eq(2);
                    const $thirdCell3 = $statusRow.find("td").eq(3);
                    // Merge 3 cột đầu
                    $firstCell.attr("colspan", "4");
                    $secondCell.hide();
                    $thirdCell.hide();
                    $thirdCell3.hide()
                    // Style cho cell được merge
                    $firstCell.css({
                        "text-align": "center",
                        "font-weight": "bold",
                        "color": "red",
                        "vertical-align": "middle"
                    });
                    $firstCell.text(`Chưa xuất: ${countChXuat} -- Đã xuất: ${countDXuat}`)
                }
            }, 100);
        },
        showBorders: true,
        columnAutoWidth: true,
        wordWrapEnabled: true,
        noDataText: "Không có dữ liệu",
        paging: {
            enabled: false
        },
        scrolling: {
            mode: "standard"
        },
        filterRow: {
            visible: true
        },
        headerFilter: {
            visible: false
        }
    });

    $("#Layer_1").click();
}
function getGridData() {
    var grid = $("#tbody").dxDataGrid("instance");
    var data = grid.getDataSource().items(); // lấy toàn bộ data hiển thị
    console.log("Data trong grid:", data[0].items);
    return data;
}
function formatNumberUS(num) {
    if (num == null) return "";
    let parts = num.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}
/*Export Excel*/
const $modal = $("#modal-excel");
const $select = $('#SoLo_Export');

let fromDateValue = "";
let toDateValue = "";
const today = new Date();

function formatDateToYMD(date) {
    const y = date.getFullYear();
    const m = ('0' + (date.getMonth() + 1)).slice(-2);
    const d = ('0' + date.getDate()).slice(-2);
    return `${y}-${m}-${d}`;
}

$(document).on("click", '.btn-excel', () => {
    //InitModal_ExportExcel();
    //toDateValue = formatDateToYMD(new Date())
    //fromDateValue = formatDateToYMD(new Date())
    //GetSoLo_Export(toDateValue, fromDateValue);
    //$("#xuatHQ").prop("checked", true);
    //$modal.modal("show");

    ExportExcel();
})

function InitModal_ExportExcel() {
    flatpickr("#fromDate", {
        dateFormat: "d-m-Y",
        defaultDate: today,
        onChange: function (selectedDates) {
            fromDateValue = formatDateToYMD(selectedDates[0]);

            if (toDateValue && fromDateValue) {
                if (!isValidDateRange(toDateValue, fromDateValue)) {
                    iziToast.warning({
                        message: `Vui lòng chọn ngày hợp lệ (Từ ngày phải nhỏ hơn hoặc bằng Đến ngày).`,
                        position: 'topRight',
                        timeout: 2500
                    });
                    return;
                }

                GetSoLo_Export(toDateValue, fromDateValue);
            }
        }
    });

    flatpickr("#toDate", {
        dateFormat: "d-m-Y",
        defaultDate: today,
        onChange: function (selectedDates) {
            toDateValue = formatDateToYMD(selectedDates[0]);
            if (toDateValue && fromDateValue) {
                if (!isValidDateRange(toDateValue, fromDateValue)) {
                    iziToast.warning({
                        message: `Vui lòng chọn ngày hợp lệ (Từ ngày phải nhỏ hơn hoặc bằng Đến ngày).`,
                        position: 'topRight',
                        timeout: 2500
                    });


                    return;
                }

                GetSoLo_Export(toDateValue, fromDateValue);
            }
        }
    });


    $select.select2({
        width: '100%',
        placeholder: "Chọn số lô",
        allowClear: true,
        closeOnSelect: false,
        dropdownParent: $modal,
        templateResult: function (data) {
            if (!data.id) return data.text;
            const selected = $select.val() || [];
            const isSelected = selected.includes(data.id);
            return $(`<span><input type="checkbox" style="margin-right:6px;" ${isSelected ? 'checked' : ''}/> ${data.text}</span>`);
        },
        templateSelection: function (data) {
            return data.text;
        }
    });


    $select.on('select2:select select2:unselect', function () {
        setTimeout(() => {
            $select.select2('close');
            $select.select2('open');
        }, 0);
    });

    // Validate ngày
    function isValidDateRange(from, to) {
        if (!from || !to) return false;
        return new Date(from) <= new Date(to);
    }



}

async function GetSoLo_Export(toDate, fromDate) {
    //var isNPL = $("#cayvai option:selected").data("isnpl")
    if (!toDate && !fromDate) {
        return;
    }

    const url = `/api/BBMoKienNPL_Export/Get?action=GetSoLo&para1=${toDate}&para2=${fromDate}&para3=${1}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();
        FetchSoLo(data);
    } catch (error) {
        console.error(error.message);
    }
}

function FetchSoLo(data) {
    $select.empty();
    $.each(data, function (index, item) {
        const $option = $('<option>', {
            value: item.SoLoID,
            text: item.SoLo
        });
        $select.append($option);
    });

}

// Nhấn Xuất Excel
$(".btn-confirm-excel").on("click", async function () {

    if ($select.find('option').length === 0) {

        iziToast.warning({
            message: `Chưa có số lô nào đã nhập kho ! Vui lòng thử lại sau.`,
            position: 'topRight',
            timeout: 2500
        });

        return;
    }


    const arrSoLo = $select.val();
    const exportType = $modal.find(".excel-radio:checked").val();

    const $btn = $(this);
    $btn.prop("disabled", true);
    var isNPL = $("#cayvai option:selected").data("isnpl")
    const url = `/api/BBMoKienNPL_Export/ExportBB`;
    const fileName = (() => {
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        return `BB-Mo-Kien-NPL-${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear()}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.xlsx`;
    })();

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                SoLo: arrSoLo.length == 0 ? "ALL" : arrSoLo.join(";"),
                IsNL: true,
                IsHaiQuan: exportType == "HaiQuan",
                toDate: toDateValue,
                fromDate: fromDateValue
            })
        });

        if (!res.ok) throw new Error("Export failed");

        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);

        $modal.modal("hide");

    } catch (err) {
        iziToast.warning({
            message: `Không thể xuất Excel. Vui lòng thử lại.`,
            position: 'topRight',
            timeout: 2500
        });

    } finally {
        $btn.prop("disabled", false);
    }
});
function toInt(value) {
    return parseInt(value.toString().replace(/,/g, ""), 10);
}
async function handleListCBM($this, cbm) {
    let SoLo = $this.data("soloid");
    let npl = $this.data("npl");
    let mavtG = $this.data("mavtghep");
    let barcode = $this.data("barcode");

    const type = $('input[name="typeCBM"]:checked').val();

    let dai = type === 'rect' ? parseFloat($('.input-length').val()) || 0 : parseFloat($('.input-cylinder-length').val()) || 0;
    let rong = parseFloat($('.input-width').val()) || 0;
    let cao = parseFloat($('.input-height').val()) || 0;
    let duongkinh = parseFloat($('.input-cylinder-diameter').val()) || 0;

    let CBM = cbm;


    let object = {
        ID: $this.data("id"),
        SoLoID: SoLo,
        MaNPL: npl,
        MaVTGhep: mavtG,
        BarCode: barcode,
        Dai: dai,
        Rong: rong,
        Cao: cao,
        DK: duongkinh,
        CBM: CBM,
        IsNPL: 1,
        IsCBM: type === 'rect' ? 1 : 2,
        MaONPL: "",
    };

    return object;
}
async function SaveTableCBM(cbm) {
    let arrSave = [];
    let rows = $("#tbody tr").toArray();
    for (const row of rows) {
        const $row = $(row);
        let $checkbox = $row.find(".checkCBM");
        if (!$checkbox.length) continue;
        const isChecked = $row.find('.checkCBM').is(':checked');

        if (!isChecked) continue;

        if (checkNhap == 1 && !$row.is(thisTr)) continue;

        let object = await handleListCBM($(row), cbm);
        arrSave.push(object);
    }

    await SaveCBM(arrSave);
}
async function SaveCBM(arrSave) {
    var dataUser = !window.CefSharp ? userNameSave : userName
    const request = new Request(`/api/ERPVatTuCBM/Post?action=PostCBM&para1=${dataUser}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(arrSave),
    });
    let response = await fetch(request)
    let data = await response.json()
    if (data == "True") {
        iziToast.success({
            message: `Lưu thành công`,
            position: 'topRight',
            timeout: 2000
        });
        $('#cbmModal').modal('hide');
        if (checkNhap == 1) {
            renderCheckFalse()
        } else
            $("#tbody").find(".checkCBM").prop("checked", false);
        $("#tbody").find("#checkAllCBM ").prop("checked", false)
        $('#cbmResult').text(0.00);

        $(".cell-rect .cbm-input").val("")
        $(".cell-cylinder .cbm-input").val("")
    }
    else {
        iziToast.warning({
            message: `Lưu thất bại`,
            position: 'topRight',
            timeout: 2500
        });
    }
}

// kho npl

$(function () {
    if (window.CefSharp) {
        $("#home").css("display", "none");
    }
    $(".btn-nhapcbm").on("click", function () {
        $(".cell-rect .cbm-input").val("")
        $(".cell-cylinder .cbm-input").val("")
        checkNhap = 2
        $("#cbmModal").modal("show")
    })
    $('input[name="typeCBM"]').on('change', function () {
        if (this.value === 'rect') {
            $('.cell-rect').removeClass('d-none');
            $('#headerRect').removeClass('d-none');
            $('.cell-cylinder').addClass('d-none');
            $('#headerCylinder').addClass('d-none');
        } else {
            $('.cell-rect').addClass('d-none');
            $('#headerRect').addClass('d-none');
            $('.cell-cylinder').removeClass('d-none');
            $('#headerCylinder').removeClass('d-none');
        }
        $('#cbmResult').text(0.00);
        $(".cell-rect .cbm-input").val("")
        $(".cell-cylinder .cbm-input").val("")
    });

    $(document).on('input', '.cbm-input', calculateCBM);

    $("#tbody").on("click", '.editcbm', function () {
        $(".cell-rect .cbm-input").val("")
        $(".cell-cylinder .cbm-input").val("")
        const trRow = $(this).closest("tr");
        $(".cell-rect .cbm-input").val("")
        $(".cell-cylinder .cbm-input").val("")
        thisTr = trRow
        checkNhap = 1
        const isCBM = trRow.data("typecbm")
        const dai = trRow.data("dai")
        const rong = trRow.data("rong")
        const cao = trRow.data("cao")
        const dk = trRow.data("duongkinh")
        const cbm = trRow.data("cbm")

        if (isCBM == "2") {
            $(`input[name="typeCBM"][value="cylinder"]`).trigger("click");
            $(".input-cylinder-length").val(dai)
            $(".input-cylinder-diameter").val(dk)
            $('#cbmResult').text(cbm);
        }
        else {
            $(`input[name="typeCBM"][value="rect"]`).trigger("click");
            $(".input-length").val(dai)
            $(".input-width").val(rong)
            $(".input-height").val(cao)
            $('#cbmResult').text(cbm);
        }

        $(this).closest("tr").find(".checkCBM").prop("checked", true);
        $("#cbmModal").modal("show")
    })
    $('#btnSaveCBM').on('click', function () {
        const cbmValue = calculateCBM();
        const type = $('input[name="typeCBM"]:checked').val();
        let dai = type === 'rect' ? parseFloat($('.input-length').val()) || 0 : parseFloat($('.input-cylinder-length').val()) || 0;
        let rong = parseFloat($('.input-width').val()) || 0;
        let cao = parseFloat($('.input-height').val()) || 0;
        let duongkinh = parseFloat($('.input-cylinder-diameter').val()) || 0;

        $("#tbody tr").each(function () {
            const $trRow = $(this)
            var checkbarCode = $trRow.find("input.checkCBM").is(":checked");
            if (!checkbarCode) return;

            if (checkNhap == 1 && !$trRow.is(thisTr)) return;

            $trRow.find("input.inputCBM").val(cbmValue.toFixed(2))
            $trRow.attr("data-dai", dai)
            $trRow.attr("data-rong", rong)
            $trRow.attr("data-cao", cao)
            $trRow.attr("data-duongkinh", duongkinh)
            $trRow.attr("data-cbm", cbmValue.toFixed(2))
            $trRow.attr("data-typecbm", type === 'rect' ? 1 : 2)
        })
        SaveTableCBM(cbmValue)
    });
})


function calculateCBM() {
    const type = $('input[name="typeCBM"]:checked').val();
    let cbm = 0;

    if (type === 'rect') {
        const l = parseFloat($('.input-length').val()) || 0;
        const w = parseFloat($('.input-width').val()) || 0;
        const h = parseFloat($('.input-height').val()) || 0;
        cbm = l * w * h;
    } else {
        const length = parseFloat($('.input-cylinder-length').val()) || 0;
        const diameter = parseFloat($('.input-cylinder-diameter').val()) || 0;
        const radius = diameter / 2;
        cbm = Math.PI * Math.pow(radius, 2) * length;
    }

    $('#cbmResult').text(cbm.toFixed(2));
    return cbm;
}
function renderCheckFalse() {
    if (checkNhap == 1)
        thisTr.find(".checkCBM").prop("checked", false);
    $("#cbmModal").modal("hide")
}
function GetToViTrikho() {

    let KH = $("#khachhangid").val()
    let mhselect = $("#mahangid").val()
    let NPL = $("#cayvai option:selected").data("npl") == "" ? "all" : $("#cayvai option:selected").data("npl")
    let solo = $("#soloid").val()
    let mahangSL = $("#soloid option:selected").data("mahang")
    let IsNPL = 1
    KH = encodeURIComponent(KH);
    mhselect = encodeURIComponent(mhselect);
    NPL = encodeURIComponent(NPL);
    solo = encodeURIComponent(solo);
    mahangSL = encodeURIComponent(mahangSL);

    // Chuyển hướng sang trang khác với query string
    location.href = `/ViTriKho/NhapViTri?KH=${KH}&MHSL=${mhselect}&NPL=${NPL}&SoLo=${solo}&MHSoLo=${mahangSL}&IsNPL=1`;
}
$(document).on("click", '#checkAllCBM', function () {
    const checker = $(this).is(":checked")
    $("#tbody").find(".checkCBM:not(.d-none)").prop("checked", checker)
})


/// Module Hoàn Thành
async function CheckHT() {
    const dataGrid = $("#tbody").dxDataGrid("instance").option("dataSource")
    const dataFiltered = dataGrid.filter(item => item.IsNK == true)
    const maxDot = Math.max(...dataFiltered.map(item => item.DotHT))

    if (dataFiltered.length === 0) {
        iziToast.warning({
            message: 'Trong danh sách không có số roll/kiện chưa được kiểm số lượng không được hoàn thành ! ',
            position: 'topRight',
            timeout: 2500
        });
        return
    }

    $('#txtDotHT').text(maxDot)
    $("#myModalHT").modal("show")

}

async function PostHT() {
    const dataGrid = $("#tbody").dxDataGrid("instance").option("dataSource")
    const dataFiltered = dataGrid.filter(item => item.IsNK == true)
    const arrSave = []
    const dataUser = !window.CefSharp ? userNameSave : userName

    if (dataFiltered.length === 0) {
        iziToast.warning({
            message: 'Trong danh sách không có số roll/kiện chưa được kiểm số lượng không được hoàn thành ! ',
            position: 'topRight',
            timeout: 2500
        });
        return
    }

    dataFiltered.map(item => {
        const object = {
            SoLoID: item.SoLoID,
            MaNPL: item.MaNPL,
            SoGhiDauCay: item.SLNhap,
            SoKienHienThi: item.SoKien,
            BarCode: item.BarCode,
            isNK: item.IsNK ? 1 : 0,
            IsNPL: 1,
            Dot: item.DotHT,
            NgayNhapKho: null,
            NgayTao: null,
            NguoiTao: dataUser
        }
        arrSave.push(object)
    })

    console.log(arrSave)


    try {
        const url = `/api/PhieuXuatHangNPL/PostHT?action=PostHTVatTu`
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(arrSave),
        });

        const result = await response.json();
        if (result == "True") {
            iziToast.success({
                message: 'Lưu thành công !',
                position: 'topRight',
                timeout: 2500
            });
            GetPhieuNK()
            /*GetVatTu();*/
            $("#myModalHT").modal("hide")
        }

    } catch (err) {
        console.error(err)
    }
}

async function ExportExcel() {
    let grid = $("#tbody").dxDataGrid("instance");
    const data = grid.option("dataSource");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    const colHide = ["InBarCode", "NhapCBM", "CayVai_Group", "CheckIsNK", "DonGia", "ThanhTien"];

    let columns = grid.option("columns").filter(col =>
        col.dataField && !colHide.includes(col.dataField) && col.visible !== false
    );

    // Bỏ cột TenDVVT ra khỏi vị trí cũ
    const donViCol = columns.find(c => c.dataField === "TenDVVT");
    columns = columns.filter(c => c.dataField !== "TenDVVT");

    // Tìm vị trí cột SLNhap và chèn TenDVVT sau nó
    const slNhapIndex = columns.findIndex(c => c.dataField === "SLNhap");
    if (slNhapIndex !== -1 && donViCol) {
        columns.splice(slNhapIndex + 1, 0, donViCol);
    }

    const customColumns = [
        { dataField: "STT", caption: "STT" },
        { dataField: "IsNK", caption: "Trạng Thái Kiểm" },
        ...columns
    ];

    // Header
    worksheet.addRow(customColumns.map(col => col.caption || col.dataField));

    // Border + căn giữa cho header
    worksheet.getRow(1).eachCell({ includeEmpty: true }, cell => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4CAF50" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
            top: { style: "thin", color: { argb: "FF000000" } },
            left: { style: "thin", color: { argb: "FF000000" } },
            bottom: { style: "thin", color: { argb: "FF000000" } },
            right: { style: "thin", color: { argb: "FF000000" } }
        };
    });

    // Data
    let stt = 1;
    data.forEach(row => {
        const rowData = customColumns.map(col => {
            if (col.dataField === "STT") return stt;
            if (col.dataField === "IsNK") return row.IsNK == 1 ? "Đã kiểm" : "Chưa kiểm";
            if (col.dataField === "DotHT") return `Lần ${row.DotHT}`;
            if (col.dataField === "Status") return row.Status === 1 ? "Chưa xuất" : row.Status === 2 ? "Đã xuất" : "Kiểm kê";
            return row[col.dataField] ?? "";
        });

        const excelRow = worksheet.addRow(rowData);

        // Style từng cell
        excelRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const colDef = customColumns[colNumber - 1];

            // Border
            cell.border = {
                top: { style: "thin", color: { argb: "FF000000" } },
                left: { style: "thin", color: { argb: "FF000000" } },
                bottom: { style: "thin", color: { argb: "FF000000" } },
                right: { style: "thin", color: { argb: "FF000000" } }
            };

            // Căn trái riêng cột Mô tả, còn lại căn giữa
            if (colDef && colDef.dataField === "ChiTiet") {
                cell.alignment = { horizontal: "left", vertical: "middle" };
            } else {
                cell.alignment = { horizontal: "center", vertical: "middle" };
            }
        });

        // Màu Trạng Thái Nhập Kho (cột 2)
        excelRow.getCell(2).font = {
            bold: true,
            color: { argb: row.IsNK == 1 ? "FF008000" : "FFFF0000" }
        };

        // Màu Đợt HT
        const dotHTIndex = customColumns.findIndex(c => c.dataField === "DotHT") + 1;
        if (dotHTIndex > 0) {
            excelRow.getCell(dotHTIndex).font = { bold: true, color: { argb: "FFFF0000" } };
        }

        // Màu Status
        const statusIndex = customColumns.findIndex(c => c.dataField === "Status") + 1;
        if (statusIndex > 0) {
            excelRow.getCell(statusIndex).font = {
                bold: true,
                color: {
                    argb: row.Status === 2 ? "FFFF0000"
                        : row.Status === 3 ? "FFFF6600"
                            : "FF000000"
                }
            };
        }

        stt++;
    });

    // Auto width - cột Mô tả rộng hơn
    customColumns.forEach((col, i) => {
        worksheet.getColumn(i + 1).width = col.dataField === "ChiTiet" ? 40 : 20;
    });

    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const formatted =
        `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
        `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const fileName = `BienBanMoKienNL_${formatted}.xlsx`;


    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}

//
function SaveSLThucTeBarCode(item) {
    const arrSave = []
    arrSave.push(
         {
            ID: item.ID,
            SoLoID: "",
            MaNPL: "",
            MaVTID: "",
            MaMauVT: "",
            SoKien: "",
            SoLoT: "",
            MaHaiQuan: "",
            MaKeToan:"",
            SoGhiDauCay:0,
            NW: 0,
            GW: 0,
            BarCode:item.BarCode,
            GhiChu:"",
            IsNPL: 0,
            KhoVaiID: 0,
            SoKienParent: 0,
            SoLuongThucTe: item.SLNhap,
            DonGia: 0,
            ThanhTien:0,
            Pallet: "",
            MaDVVT: "",
            MauVTID: "",
        }
    )
    Save(arrSave,'PostChiTietNhapKho')
}

