function fillModalTachKien(item) {
    $('#modalTachSoLo').text(item.SoLo);
    $('#modalTachVatTu').text(item.MaVT);
    $('#modalTachThucNhap').text(item.SLNhap);
    $('#modalTachMau').text(item.MauVT);
    $('#modalTachKhoSize').text(item.KhoVai);
    $('#modalTachDonVi').text(item.TenDVCD);
    $('#modalKienGoc').val(item.SoKienHienThi);
    $("#btnKhongTach").hide()
    $('#modalGhiChu').val('');
    $('#blockCanhBao').addClass('d-none'); // ẩn cảnh báo mặc định
}
function sinhBarCodeTachKien(item, dataXH, barCodeCheck) {
    var dataBarCodeChia = dataXH.filter(x =>
        x.BarCodeGoc == item.BarCode && x.BarCode.includes(".")
    );

    if (dataBarCodeChia.length == 0 && (!barCodeCheck || barCodeCheck.length == 0)) {
        return { barCode: `${item.BarCode}.1`, soKien: `${item.SoKienHienThi}.1` };
    }

    var arrPasr = dataBarCodeChia
        .map(x => (x.BarCode && x.BarCode.includes(".")) ? parseInt(x.BarCode.split(".").pop(), 10) : null)
        .filter(x => !isNaN(x));

    var arrPasrData = [];
    if (barCodeCheck && barCodeCheck.length > 0) {
        var maxFromDb = Math.max(
            0,
            ...barCodeCheck
                .map(x => (x.BarCode && x.BarCode.includes(".")) ? parseInt(x.BarCode.split(".").pop(), 10) : null)
                .filter(n => !isNaN(n))
        );
        if (!isNaN(maxFromDb)) arrPasrData.push(maxFromDb);
    }

    var maxNumber = arrPasr.length > 0 ? Math.max(...arrPasr) : 0;
    var maxNumberSql = arrPasrData.length > 0 ? Math.max(...arrPasrData) : 0;
    var nextNumber = Math.max(maxNumber, maxNumberSql) + 1;

    return { barCode: `${item.BarCode}.${nextNumber}`, soKien: `${item.SoKienHienThi}.${nextNumber}` };
}
async function xuLyTachKien(item, dataXH, renderTableXuatHang, value = 1) {
    var barCodeCheck = await GetCheckBarCodePhuLieu(item.BarCode);
    $('#modalSoLuong').val("");


    fillModalTachKien(item);
    if (value != 1) {
        $("#btnKhongTach").show();
    }
    
    const itemVuotBarCode = dataItemCode.find(x => x.MaNPL == item.MaNPL)
    var SLXuatTT = parseFloat(itemVuotBarCode.SLXuat.toFixed(4))
    if (value == 1) {
        SLXuatTT = (parseFloat(itemVuotBarCode.SLXuat.toFixed(4)) - parseFloat(item.SLNhap.toFixed(4))).toFixed(4)
    } else {
        SLXuatTT = item.SLDaXuatVaXoVai || 0;
    }
    const slDKConLai = (parseFloat(itemVuotBarCode.SLDK) - parseFloat(SLXuatTT)).toFixed(2)

    $('#modalSoLuong').val(Math.max(0, slDKConLai));
    if (value == 3 && (parseFloat(slDKConLai)) > parseFloat(item.SLNhap) ) {
        $('#modalSoLuong').val(0);
    }
    if (value == 4) {
        $("#btnKhongTach").hide();
        $('#modalSoLuong').val(item.slHienThiModal);
    }
    if (value == 2) {
        showCanhBaoVuot(item.MaVT, item.KhoVai, value);
    }

    //  Wrap vào Promise để bên ngoài await được
    return new Promise((resolve, reject) => {
        showConfirmModalTach(
            async function onConfirm() {
                var soLuongNhap = $('#modalSoLuong').val();
                if (soLuongNhap === "") {
                    showToast("warning", "Vui lòng nhập thực xuất kiện chia!!!");
                    return false;
                }
                if (parseFloat(soLuongNhap) === 0) {
                    showToast("warning", "Thực xuất kiện chia phải lớn hơn 0!!!");
                    return false;
                }
                var soLuongChia = parseFloat(soLuongNhap);
                var itemXH = dataXH.find(x => x.BarCode == item.BarCode);
                if (!itemXH) {
                    showToast("error", "Không tìm thấy kiện gốc trong danh sách!!!");
                    return false;
                }

                var soLuongChoPhep = itemXH.SLNhap;
                var dangHienCanhBao = !$('#blockCanhBao').hasClass('d-none');
                if (soLuongChia > soLuongChoPhep && !dangHienCanhBao) {
                    showCanhBaoVuot(item.MaVT, item.KhoVai, value);
                    return false;
                }

                var ma = sinhBarCodeTachKien(item, dataXH, barCodeCheck);
                var itemNew = { ...item };
                itemNew.GhiChu = $('#modalGhiChu').val();
                itemNew.SLNhap = soLuongChia;
                itemNew.BarCode = ma.barCode;
                itemNew.SoKienHienThi = ma.soKien;
                itemNew.TachKien = 1;
                itemNew.sort = 2;
                itemXH.SLNhap = itemXH.SLNhap - soLuongChia;

                if (value == 1) {
                    dataXH.forEach(x => x.sort = 1);
                    dataXH.push(itemNew);
                    renderTableXuatHang(dataXH);
                    resolve(null); // value==1 không cần objSave
                } else {
                    const objSave = {
                        Phieu: itemNew.PhieuAdd,
                        Dot: itemNew.DotAdd,
                        MaLenhSX: trMaLenh,
                        TGXaVai: itemNew.TGXaVaiAdd,
                        TGBatDauXaVai: null,
                        BarCodeGoc: item.BarCode,
                        BarCode: itemNew.BarCode,
                        SLNhap: soLuongNhap,
                        MaNPL: itemNew.MaNPL,
                        GhiChu: '',
                        GhiChuKetThuc: '',
                        NguoiTao: itemNew.UserID,
                        Module: itemNew.Module
                    };
                    resolve(objSave); //  trả về objSave
                }
                $("#myModalTachKien").modal("hide");
            },
            function onCancel() {
                resolve(null);
                $("#myModalTachKien").modal("hide");
            }
        );
    });
}

// Khi phát hiện vượt → hiện thêm block cảnh báo
function showCanhBaoVuot(maVT, cayVai, value = 1) {
    if (value == 1) {
        $('.textVuot').html(
            `Thực xuất vật tư <strong class="text-danger">${maVT} / ${cayVai}</strong>
               cấp vượt số lượng cấp trong phiếu yêu cầu. Bạn có muốn cho phép vượt không?`
        );
    } else if (value == 2) {
        $('.textVuot').html(
            ` vật tư <strong class="text-danger">${maVT} / ${cayVai}</strong> có số lượng xổ vải nhiều hơn
               số lượng đăng ký còn lại. Bạn có muốn không?`
        );
    }

    $('#blockCanhBao').removeClass('d-none');
}

// Nút Không tách
$('#btnKhongTach').on('click', function () {
    $('#myModalTachKien').modal('hide');
});

function showConfirmModalTach(onConfirm, onCancel) {
    $('#btnSaveTachKien').off('click').on('click', function () {
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    });
    $('#btnKhongTach').off('click').on('click', function () {
        if (typeof onCancel === 'function') {
            onCancel(); // ✅ báo cho nơi gọi biết là "Không tách"
        }
    });
    $("#myModalTachKien").modal("show");
}


// ============== Modal dùng chung: thêm onCancel cho nút "Không tách" ==============
function showConfirmModalTachCanhBao(onConfirm, onCancel) {
    $('#btnSaveTachKien').off('click').on('click', function () {
        $("#myModalTachKien").modal("hide"); // ✅ đóng modal ngay khi bấm xác nhận
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    });
    $('#btnKhongTach').off('click').on('click', function () {
        $("#myModalTachKien").modal("hide");
        if (typeof onCancel === 'function') {
            onCancel(); // ✅ báo cho nơi gọi biết là "Không tách"
        }
    });
    $("#myModalTachKien").modal("show");
}
async function ModalTachKienVuot(itemVuotBarCode, item, value = 1) {
    $('#modalSoLuong').val("");
    fillModalTachKien(item)
    showCanhBaoVuot(itemVuotBarCode.MaVT, item.CayVai, value)
    $("#btnKhongTach").show()

    var SLXuatTT = 0
    if (value == 1 || value == 0) {
        SLXuatTT = (parseFloat(itemVuotBarCode.SLDK) - parseFloat(itemVuotBarCode.SLXuat)).toFixed(2);
    } else if (value == 2) {
        SLXuatTT = parseFloat(item.SLDaXuatVaXoVai || 0).toFixed(2);
    }
    $('#modalSoLuong').val(Math.max(0, SLXuatTT));

    return new Promise((resolve, reject) => {
        showConfirmModalTachCanhBao(
            // ----- Bấm "Đồng ý" -> xác nhận cho vượt -----
            async function onConfirm() {
                var soLuongNhap = $('#modalSoLuong').val();
                if (soLuongNhap === "") {
                    showToast("warning", "Vui lòng nhập thực xuất kiện chia!!!");
                    return false; // giữ modal mở
                }
                if (parseFloat(soLuongNhap) === 0) {
                    showToast("warning", "Thực xuất kiện chia phải lớn hơn 0!!!");
                    return false;
                }
                checkChangeTableDev = true;
                dataXH.forEach(item => item.sort = 1);

                var soLuongChia = parseFloat(soLuongNhap);
                var itemXH = item
                if (!itemXH) {
                    showToast("error", "Không tìm thấy kiện gốc trong danh sách!!!");
                    return false;
                }
                var soLuongChoPhep = itemXH.SLNhap;
                var dangHienCanhBao = !$('#blockCanhBao').hasClass('d-none');

                if (soLuongChia > soLuongChoPhep && !dangHienCanhBao) {
                    showCanhBaoVuot(item.MaVT, item.KhoVai); // TODO: xác nhận lại giá trị tham số 2
                    return false; // bấm Đồng ý lần 2 mới cho qua (coi như xác nhận "cho phép vượt")
                }
                var barCodeCheck = await GetCheckBarCodePhuLieu(item.BarCode);
                var ma = sinhBarCodeTachKien(item, dataXH, barCodeCheck);

                var itemNew = { ...item };
                itemNew.GhiChu = $('#modalGhiChu').val();
                itemNew.SLNhap = soLuongChia;
                itemNew.BarCode = ma.barCode;
                itemNew.SoKienHienThi = ma.soKien;
                itemNew.TachKien = 1;




                PlayAudio();
                $(".kienquet").val(itemXH.SoKienHienThi);
                $(".thucnhap").val(itemNew.SLNhap);

                //itemVuotBarCode.isCheckVuot = 1


                if (value == 1) {
                    itemVuotBarCode.SLXuat += itemNew.SLNhap
                    const result = dataXH.filter(item => historyScanBarcode.includes(item.BarCode));
                    dataXH.forEach(x => x.sort = 1);
                    dataXH.push(itemNew);
                    renderTableXuatHang(dataXH);
                    getBarCodeScan(result, barcode)
                } else {
                    const objSave = {
                        Phieu: itemNew.PhieuAdd,
                        Dot: itemNew.DotAdd,
                        MaLenhSX: trMaLenh,
                        TGXaVai: itemNew.TGXaVaiAdd,
                        TGBatDauXaVai: null,
                        BarCodeGoc: item.BarCode,
                        BarCode: itemNew.BarCode,
                        SLNhap: soLuongNhap,
                        MaNPL: itemNew.MaNPL,
                        GhiChu: '',
                        GhiChuKetThuc: '',
                        NguoiTao: itemNew.UserID,
                        Module: itemNew.Module
                    };
                    resolve(objSave);
                }
                $("#myModalTachKien").modal("hide"); // ✅ đóng modal ngay khi bấm xác nhận

            },
            // ----- Bấm "Không tách" -> dừng -----
            async function onCancel() {

                if (value == 1) {
                    checkChangeTableDev = true;
                    dataXH.forEach(item => item.sort = 1);
                    var d = item;
                    d.sort = 2;
                    d.isCheckVuot = 1

                    dataXH.push(d);
                    PlayAudio();
                    $(".kienquet").val(d.SoKienHienThi);
                    $(".thucnhap").val(d.SLNhap);
                    itemVuotBarCode.SLXuat += item.SLNhap
                    renderTableXuatHang(dataXH);
                    itemVuotBarCode.isCheckVuot = 1

                    const result = dataXH.filter(item => historyScanBarcode.includes(item.BarCode));
                    getBarCodeScan(result, barcode)
                } else {
                    resolve(null);
                }
                $("#myModalTachKien").modal("hide");

            }
        );
    })

}


