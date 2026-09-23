/// Variable
const USER_ID = !window.CefSharp ? userNameSave : dataUser = userName
var isNeedUpdate = false;
var isAfterDelete = false;
var countdownInterval = null;

var gMaNPL;
var gMaVT;
var gTGYCXaVai;
var gSLCapPhat;
var gSLXoVai;

var dataCayVai = [];
var dataCayVaiXoa = [];
var dataXuatHang = [];
var lstDanhSachXaVai = [];
var pendingBarcodeData = null;


var dxGridChonCayVai
var dxGridThongTinCayVai;
var dxDanhSachXaVai;
var dxGridGoiYBC;
/*
 NOTE : Trạng Thái hiển thị
 0: Kết Thúc Sớm
 1: Hoàn Thành
 2: Đang Xổ Vải
 3: Chờ Xổ Vải

 NOTE : Trạng Thái Order by

 0: Kết Thúc Sớm
 1: Hoàn Thành
 2: Kết Thúc Sớm - Đã Xuất Hàng
 3: Hoàn Thành - Đã Xuất Hang
 4: Đang Xổ Vải
 5: Chờ Xổ Vải


 */

/// Event
function isDangXaVai() {
    return dataCayVai.some(item => item.TrangThai == 2);
}

$(function () {
    $(".enterbarcode2").on("click", function () {
        barcodeLocal = $('#QRScan2').val().trim()
        barcodeInputXoVai();
    })
    $(document).on('keydown', async function (e) {
        if (e.key === 'Enter') {
            if ($('#QRScan2:focus').length > 0) {
                barcodeLocal = e.target.value.trim()
                barcodeInputXoVai();
            }
            else {
                showToast("warning", "Vui lòng chọn vào ô scan !")
                PlayAudioError()
            }

        }
    });


    createViewDxDataGridChonCayVai([]);
    createViewDxGridThongTinCayVai([]);
    createViewDxGridGoiYBC([]);

    $(".select_2_modalXaVai").select2({
        dropdownParent: $("#modalPhieuXaVai"),
        width: "100%"
    });
    $(".select_2_modalTimNhanh").select2({
        dropdownParent: $("#modalTimNhanhXoVai"),
        width: "100%",
        minimumResultsForSearch: Infinity,
    });

    $("#modalPhieuXaVai").on('show.bs.modal', async function () {
        lotSelected = null;
        const mouldeClick = $(this).data('moduleclick')
        if (mouldeClick == 1) {
            gSLCapPhat = $(this).data('slcp')
            gMaNPL = $(this).data('manpl')
            gMaVT = $(this).data('displayic')
            gSLXoVai = $(this).data('slxovai')
            gTGYCXaVai = $(this).data('tgycxavai')
        }

        await GetTTPhieuXaVai();
        await GetTTChonCayVai();
        await GetViewChiTietXaVai();
        await GetMaxCayVaiTrongPhieu();

        const tgxvYC = $('#sltPhieu option:selected').data('tgycxavai')
        var maNPL = $("#sltPhieu option:selected").data('manpl')
        if (!maNPL || maNPL === 'undefined') {
            maNPL = gMaNPL;
        }

        const itemCode = dataItemCode.find(x => x.MaNPL == maNPL);
        const sldkHienThi = itemCode ? itemCode.SLDK : 0;

        $("#txtSLCP").val(gSLCapPhat);
        $("#txtSLDK").val(parseFloat(parseFloat(sldkHienThi || 0).toFixed(4)));
        $("#txtThoiGianYCXaVai").val(tgxvYC)

        //const dot = dataCayVai[0]?.Dot || 1;

        //if (dot > 1) {
        //    HandleAddPhieuMoi();
        //}
    })

    $("#modalPhieuXaVai").on('hidden.bs.modal', function () {
        if (isNeedUpdate) {
            GetXuatHangItemCode();
            GetViewChiTietXaVai2();
            isNeedUpdate = false;
        }
        lotSelected = null;
    });

    $("#sltPhieu").on('change', async function () {
        lotSelected = null;
        await GetTTChonCayVai();
        await GetViewChiTietXaVai();
        await GetMaxCayVaiTrongPhieu();

        const tgxvYC = $('#sltPhieu option:selected').data('tgycxavai');
        const maNPL = $('#sltPhieu option:selected').data('manpl');
        const itemCode = dataItemCode.find(x => x.MaNPL == maNPL);
        const sldkHienThi = itemCode ? itemCode.SLDK : 0;

        $("#txtThoiGianYCXaVai").val(tgxvYC);
        $("#txtSLDK").val(parseFloat(parseFloat(sldkHienThi || 0).toFixed(4)));
    })

    $("#btnChonCayVai").on('click', function () {
        if (isDangXaVai()) {
            showConfirmXaVai();
        } else {
            dxGridChonCayVai.refresh();
            $("#modalChonCayVai").modal('show')
        }

    })

    $("#modalChonCayVai").on('show.bs.modal', function () {
        dxGridChonCayVai.refresh();
    })
    $("#modalTimNhanhXoVai").on('shown.bs.modal', function () {
        dxDanhSachXaVai.refresh();
        dxDanhSachXaVai.repaint();
        setTimeout(function () {
            $("#inputTimKiemXoVai").focus();
        }, 100);
    })
    // Nút tìm kiếm
    let searchTimeout;
    let locNhanh = -1;

    function applyFilter() {
        const search = $("#inputTimKiemXoVai").val().trim().toLowerCase();
        let data = lstDanhSachXaVai; // luôn lấy từ gốc

        // Lọc theo trạng thái
        if (locNhanh >= 0) {
            data = data.filter(item => item.TrangThai == locNhanh);
        }

        // Lọc theo search
        if (search !== "") {
            data = data.filter(item =>
                String(item.BarCode).trim().toLowerCase().includes(search) ||
                String(item.LotBatch).trim().toLowerCase().includes(search) ||
                String(item.Display).trim().toLowerCase().includes(search)
            );
        }

        createViewDxGridDanhSachXaVai(data);
    }

    $("#inputTimKiemXoVai").on("input", function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(applyFilter, 100);
    });

    $('#slcLocNhanh').on('change', function () {
        locNhanh = parseInt($(this).val());
        applyFilter();
    });

    $("#confirmModalXacNhanKetThucSom").on('hide.bs.modal', function () {
        $("#txtGhiChuKetThucSom").val('')
    })

})
/// Function

async function barcodeInputXoVai() {
    if (barcodeLocal.trim() != "") {
        await GetVTBarCodeXoVai(barcodeLocal)
        $("#QRScan2").val("")
    }
    else {
        showToast("warning", "Vui lòng nhập barcode vào ô QR scan. !")
        PlayAudioError()
    }
}
async function GetVTBarCodeXoVai(barcode, value) {
    if (isDangXaVai()) {
        showConfirmXaVai();
    } else {
        var barcodeDaQuet = dataCayVai.map(item => item.BarCode).join(";")
        var loc = $(".select_loc").val();

        var para1 = $("#MaLenhSX option:selected").data("magop")
        var para2 = $("#MaLenhSX option:selected").data("malenhsx")
        var para3 = barcode

        var action = ""
        if (loc == 2) {
            action = "GetXuatHangNLV2PYC"
            para1 = $("#MaLenhSX").val();
        } else if (loc == 3) {
            action = "GetXuatHangNLV2NgoaiDH"
            para1 = $("#MaLenhSX").val();
            para2 = 1 // IsNPL
        } else {
            action = "GetXHNLV2"
        }


        var url = `/api/PhieuXuatHangNPL/Get?Action=${action}&para1=${para1}&para2=${para2}&para3=all&para4=${encodeURIComponent(para3)}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            var data = await response.json();

            if (data.length == 0) {
                showToast("warning", "BarCode không tồn tại trong danh sách!");
                PlayAudioError();
                return
            }
            else if (data[0].IsDuyetNK == 0) {
                showToast("warning", "BarCode này chưa được duyệt nhập kho!");
                PlayAudioError();
                return
            } else if (data[0].PhieuXHPL != "") {
                showToast("warning", `Barcode đã được xuất hàng tại ${data[0].PhieuXHPL}!`);
                PlayAudioError();
                return
            } else if (data[0].IsNK == 0) {
                showToast("warning", `Số kiện/roll này chưa được kiểm số lượng!`);
                PlayAudioError();
                return
            }
            var d = data[0];
            if (d.CheckKiemKe == 1) {
                showToast("warning", `Vật tư đang trong quá trình kiểm kê không được xổ vải!`);
                PlayAudioError();
                return
            }
            if (d.MaONPL == "") {
                showToast("warning", `Số kiện/Roll chưa được đưa lên kệ.Vui lòng nhập vào hệ thống!`);
                PlayAudioError();
                return
            }

            const existingItem = dataCayVai.find(item => item.BarCode == d.BarCode);

            if (existingItem) {
                showToast("warning", "BarCode đã tồn tại trong danh sách xổ vải!");
                PlayAudioError();
                return;
            }

            const total = parseFloat($("#txtSLX").data('value') || 0);

            const itemVuotBarCode = dataItemCode.find(x => x.MaNPL == d.MaNPL)
            if (!itemVuotBarCode) {
                showToast("warning", "BarCode không nằm trong danh sách vật tư phiếu cấp!");
                PlayAudioError();
                return
            }
            if (d.SLNhap == 0) {
                showToast("warning", `Số lượng = 0.Không xổ vải!`);
                PlayAudioError();
                return
            }
            var DSBarcodeGrid = $("#dxGridThongTinCayVai").dxDataGrid("instance").option("dataSource");
            const normalize = (str) =>
                str?.trim().replace(/\s+/g, ' '); // bỏ khoảng trắng dư giữa chuỗi

            const lengthBarCode = dataDSUuTien.filter(x =>
                normalize(x.BarCode) === normalize(barcode)
            ).length;
            if (dataDSUuTien.length > 0 && lengthBarCode == 0) {

                var DsBarcodeLocUuTien = dataDSUuTien.filter(uuTien =>
                    !DSBarcodeGrid.some(grid =>
                        grid.BarCode === uuTien.BarCode
                    )
                );

                if (DsBarcodeLocUuTien.length > 0) {
                    $("#txtMaLenhUuTien").val($("#MaLenhSX option:selected").text())
                    createViewDxDataGridItemCodeChoCapPhat(DsBarcodeLocUuTien);
                    $("#modalDSUuTien").modal("show");
                    return;
                }
            }

            const dataDSCu = await GetDanhSachNhapKhoCu(barcode, barcodeDaQuet, "", "");
            if (dataDSCu.length > 0) {
                const dsRuturnCu = await renderDanhSachThung(dataDSCu)
                var isBarCodeValid = dsRuturnCu.some(item => item.BarCode === barcode)
                if (!isBarCodeValid) {
                    $("#txtDSThungCu").text(dataDSCu[0].IsCheckLotBatch == 0 ? "Danh sách thùng cũ nhập kho" : "")

                    var DsBarcodeLocDSCu = dsRuturnCu.filter(uuTien =>
                        !DSBarcodeGrid.some(grid =>
                            grid.BarCode === uuTien.BarCode
                        )
                    );
                    if (DsBarcodeLocDSCu.length > 0) {
                        $("#infoBarcode").text(dataDSCu[0].BarCodeCurrent)
                        $("#infoSoKienHienThi").text(dataDSCu[0].SoKienHienThiCurrent)
                        $("#infoLotBatch").text(dataDSCu[0].LotBatchCurrent)
                        $("#infoNgay").text(dataDSCu[0].NgayNhapKhoCurrent)


                        createViewDxDataGridThungNhapKhoCu(DsBarcodeLocDSCu)
                        $("#modalQuetThung").modal("show");
                        return;
                    }
                }

            }
            const dataBarCodeDaQuet = dataCayVai.map(item => item.BarCode).join(';')

            if (lotSelected == null) {
                const dataLOTBATCH = await ChooseLotBatch(barcode);
                if (dataLOTBATCH.length > 1) {
                    pendingBarcodeData = d;
                    openModalChonLot("", dataLOTBATCH)
                    $("#lotModalMaVT").text(dataLOTBATCH[0].ItemCode)
                    return
                } else {
                    lotSelected = dataLOTBATCH[0]
                }
            } else if (lotSelected.LotBatch != d.LotBatch) {

                const dataLotBatchDuocChon = await GetLengthMaNPLBatchLot(lotSelected?.BarCode || d.BarCode, dataBarCodeDaQuet, lotSelected?.MaNPL || d.MaNPL);

                if (dataLotBatchDuocChon.length > 0) {
                    showToast("warning", `BarCode đang quét có LOT/BATCH: ${d.LotBatch} khác với LOT/BATCH: ${lotSelected.LotBatch} đã chọn !`);
                    PlayAudioError();
                    return;
                }
            }
            await GetMaxCayVaiTrongPhieu();
            const totalKienChia = dataCayVai
                .filter(p => p.BarCodeGoc == d.BarCode)
                .reduce((sum, p) => sum + p.SLNhap, 0);

            d.SLNhap = d.SLNhap - totalKienChia



            const phieu = $("#sltPhieu").val();
            const dot = $("#sltPhieu option:selected").data('dot');
            const tgXaVai = $("#txtThoiGianYCXaVai").val();
            const module = parseInt($('.select_loc').val(), 10);

            if (total + d.SLNhap > itemVuotBarCode.SLDK && itemVuotBarCode.isCheckVuot == 0) {
                d = { ...d, PhieuAdd: phieu, DotAdd: dot, TGXaVaiAdd: tgXaVai, Module: module, SLDaXuatVaXoVai: parseFloat($("#txtSLDKCL").val() || 0), }
                var objTachKien = await ModalTachKienVuot(itemVuotBarCode, d, 2)
                if (!objTachKien) {
                    objTachKien = {
                        Phieu: phieu,
                        Dot: dot,
                        MaLenhSX: trMaLenh,
                        TGXaVai: tgXaVai,
                        TGBatDauXaVai: null,
                        BarCodeGoc: d.BarCode,
                        BarCode: d.BarCode,
                        SLNhap: d.SLNhap,
                        MaNPL: d.MaNPL,
                        GhiChu: '',
                        GhiChuKetThuc: '',
                        NguoiTao: USER_ID,
                        Module: module,
                    };
                    if (value == 1) {
                        historyScanBarcode.push(barcode)
                    }
                }
                if (value == 1) {
                    historyScanBarcode.push(objTachKien.BarCode)
                }
                await PostCayVai([objTachKien]);
                await GetTTChonCayVai();
                await GetViewChiTietXaVai();
            } else {
                const objSave = {
                    Phieu: phieu,
                    Dot: dot,
                    MaLenhSX: trMaLenh,
                    TGXaVai: tgXaVai,
                    TGBatDauXaVai: null,
                    BarCodeGoc: d.BarCode,
                    BarCode: d.BarCode,
                    SLNhap: d.SLNhap,
                    MaNPL: d.MaNPL,
                    GhiChu: '',
                    GhiChuKetThuc: '',
                    NguoiTao: USER_ID,
                    Module: module
                };
                if (value == 1) {
                    historyScanBarcode.push(barcode)
                }

                await PostCayVai([objSave]);
                await GetTTChonCayVai();
                await GetViewChiTietXaVai();

            }

            if (value == 1) {
                const result = dataCayVai.filter(item => historyScanBarcode.includes(item.BarCode));
                getBarCodeScan(result, barcode)
            }

        } catch (error) {
            console.error(error.message);
        }
    }

}
function startCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    const tgYeuCau = $('#sltPhieu option:selected').data('tgycxavai')
    const dataCayVaiChuaKetThuc = dataCayVai.filter(item => item.TrangThai != 0 && item.TrangThai != 1)

    const tgBatDau = dataCayVaiChuaKetThuc[0]?.TGBatDauXaVai ? moment(`${dataCayVaiChuaKetThuc[0]?.TGBatDauXaVai}`, 'YYYY-MM-DD HH:mm:ss') : "";

    if (dataCayVaiChuaKetThuc.length == 0 || !tgBatDau || !tgYeuCau) {
        $("#txtTGDN").val('');
        $("#txtTGBD").val('');
        $("#txtTGKT").val('');
        return;
    }


    const batDau = moment(tgBatDau, 'YYYY-MM-DD HH:mm:ss');
    const ketThuc = batDau.clone().add(parseFloat(tgYeuCau), 'hours');

    $("#txtTGBD").val(batDau.format('HH:mm - DD/MM'));
    $("#txtTGKT").val(ketThuc.format('HH:mm - DD/MM'));

    function update() {
        const now = moment();
        const diff = ketThuc.diff(now);

        if (diff <= 0) {
            $("#txtTGDN").val('00:00 ' + ketThuc.format('DD/MM'));
            clearInterval(countdownInterval);
            countdownInterval = null;
            return;
        }

        const duration = moment.duration(diff);
        const hours = String(Math.floor(duration.asHours())).padStart(2, '0');
        const minutes = String(duration.minutes()).padStart(2, '0');
        const ngay = ketThuc.format('DD/MM');

        $("#txtTGDN").val(`${hours}:${minutes} - ${ngay}`);
    }

    update();
    countdownInterval = setInterval(update, 60000);
}
async function HandleAddPhieuMoi() {

    let maxDot = 0;
    //let maxPhieu = null;

    $('#sltPhieu option').each(function () {
        const dot = parseInt($(this).data('dot')) || 0;
        if (dot > maxDot) {
            maxDot = dot;
            maxPhieu = $(this).val();
        }
    });

    // Kiểm tra phiếu mới nhất đã có data chưa
    //const phieuMoiNhat = maxPhieu;
    //const currentPhieu = $("#sltPhieu").val();

    //if (phieuMoiNhat && phieuMoiNhat !== currentPhieu) {
    //    // Switch sang phiếu mới nhất để check data
    //    $("#sltPhieu").val(phieuMoiNhat).trigger('change');
    //    $("#modalConfirmtXaVai").modal('hide');
    //    return;
    //}

    if (dataCayVai.length === 0) {
        showToast('warning', 'Phiếu hiện tại chưa có dữ liệu, vui lòng sử dụng phiếu này!');
        return;
    }

    const newDot = maxDot + 1;
    const newPhieu = `PXV_${newDot}`;
    const newOption = `<option value="${newPhieu}" data-manpl="${gMaNPL}" data-dot="${newDot}" data-tgycxavai="${gTGYCXaVai}">${newPhieu} - ${gMaVT}</option>`;

    $("#sltPhieu").append(newOption);
    $("#sltPhieu").val(newPhieu).trigger('change');
    $("#modalConfirmtXaVai").modal('hide')

    await GetViewChiTietXaVai();
}

function HandleDeleteAll() {
    const rowDangXaVai = dataCayVaiXoa.find(item => item.TrangThai == 2)

    if (rowDangXaVai) {
        showToast('warning', `BarCode: ${rowDangXaVai.BarCode} đang trong tiến trình xổ vải không được xóa !`)
        return;
    }


    if (dataCayVaiXoa.length == 0) {
        showToast('warning', 'Vui lòng chọn cây vải để xóa !')
        return;
    }

    showConfirmDelete(async function () {
        var arrDelete = []
        dataCayVaiXoa.map(item => {
            const objDelete = {
                Phieu: item.Phieu,
                Dot: '',
                MaLenhSX: trMaLenh,
                TGXaVai: '',
                TGBatDauXaVai: '',
                BarCodeGoc: '',
                BarCode: item.BarCode,
                SLNhap: '',
                MaNPL: '',
                GhiChu: '',
                GhiChuKetThuc: '',
                NguoiTao: '',
                Module: ''
            }
            arrDelete.push(objDelete)
        })


        const isDeleteSuccess = await DeleteCayVai(arrDelete);

        if (isDeleteSuccess) {
            $("#dxGridThongTinCayVai input[type='checkbox']:not(.row-chk)").prop('checked', false);
            isAfterDelete = true;
            lotSelected = null;
            await GetTTChonCayVai();
            await GetViewChiTietXaVai();
            await GetMaxCayVaiTrongPhieu();
        }
    })

}
async function HandleBatDauXaVai() {
    if (isDangXaVai()) {
        showToast('warning', 'Phiếu này đang trong quá trình xổ vải')
        return;
    }

    const dataSource = dxGridThongTinCayVai.option('dataSource').filter(item => item.TrangThai != 0 && item.TrangThai != 1);

    if (dataSource.length == 0) {
        showToast('warning', 'Chưa có danh sách chờ xổ vải !')
        return;
    }

    const arrBatDauXaVai = []
    const tgBatDauXaVai = moment().format('YYYY-MM-DD HH:mm:ss');
    const phieu = $("#sltPhieu").val();
    const dot = $("#sltPhieu option:selected").data('dot');
    const maNPL = $("#sltPhieu option:selected").data('manpl')



    showConfirmBatDauXaVai(function () {

        dataSource.map(item => {
            const objBatDauXaVai = {
                Phieu: phieu,
                Dot: dot,
                MaLenhSX: trMaLenh,
                TGXaVai: '',
                TGBatDauXaVai: tgBatDauXaVai,
                BarCodeGoc: item.BarCode,
                BarCode: item.BarCode,
                SLNhap: '',
                MaNPL: (maNPL == 'undefind' || !maNPL) ? gMaNPL : maNPL,
                GhiChu: item.GhiChu,
                GhiChuKetThuc: '',
                NguoiTao: '',
                Module: null
            };
            arrBatDauXaVai.push(objBatDauXaVai)
        })

        PostBatDauXaVai(arrBatDauXaVai, 'UpdateBatDauXaVai');

    })



}
function HandleReset() {
    if (!isDangXaVai()) {
        showToast("warning", 'Không có thông tin cần làm mới !')
        return;
    }

    showConfirmReset(function () {
        const dataSource = dxGridThongTinCayVai.option('dataSource');
        if (dataSource.length == 0) {
            return;
        }

        const arrLamMoiXaVai = []
        const phieu = $("#sltPhieu").val();
        const dot = $("#sltPhieu option:selected").data('dot');
        const maNPL = $("#sltPhieu option:selected").data('manpl')

        dataSource.map(item => {
            const objBatDauXaVai = {
                Phieu: phieu,
                Dot: dot,
                MaLenhSX: trMaLenh,
                TGXaVai: '',
                TGBatDauXaVai: null,
                BarCodeGoc: item.BarCode,
                BarCode: item.BarCode,
                SLNhap: '',
                MaNPL: (maNPL == 'undefind' || !maNPL) ? gMaNPL : maNPL,
                GhiChu: item.GhiChu,
                GhiChuKetThuc: '',
                NguoiTao: '',
                Module: null
            };
            arrLamMoiXaVai.push(objBatDauXaVai)
        })

        PostBatDauXaVai(arrLamMoiXaVai, 'ResetTGXaVai');
    });

}
function HandleHuyXaVai() {

}
function HandleXacNhanHT() {
    if (dataCayVaiXoa.length == 0) {
        showToast('warning', 'Vui lòng chọn cây vải cần xác nhận kết thúc xổ vải sớm')
        return;
    }

    const hasKetThucXoVaiSom = dataCayVaiXoa.find(item => item.TrangThai == 0)
    const hasHoanThanh = dataCayVaiXoa.find(item => item.TrangThai == 1)

    if (hasKetThucXoVaiSom) {
        showToast('warning', `BarCode: ${hasKetThucXoVaiSom.BarCode} đã kết thúc xổ vải sớm !`)
        return;
    }

    if (hasHoanThanh) {
        showToast('warning', `BarCode: ${hasHoanThanh.BarCode} đã hoàn thành xổ vải !`)
        return;
    }

    showConfirmXacNhanHTKetThucSom(function () {
        const ghiChuKetThucSom = $("#txtGhiChuKetThucSom").val()
        if (ghiChuKetThucSom.trim() == "" || !ghiChuKetThucSom) {
            showToast('warning', 'Vui lòng nhập ghi chú để kết thúc xổ vải !');
            return;
        }

        const arrSave = []
        dataCayVaiXoa.map(item => {
            objSave = {
                Phieu: item.Phieu,
                Dot: '',
                MaLenhSX: trMaLenh,
                TGXaVai: '',
                TGBatDauXaVai: item.TrangThai == 3 ? moment().format('YYYY-MM-DD HH:mm:ss') : '',
                BarCodeGoc: '',
                BarCode: item.BarCode,
                SLNhap: '',
                MaNPL: item.MaNPL,
                GhiChu: '',
                GhiChuKetThuc: ghiChuKetThucSom?.trim() || '',
                NguoiTao: '',
                Module: 0
            }

            arrSave.push(objSave);
        })

        // Ẩn modal sau khi xử lý
        $("#confirmModalXacNhanKetThucSom").modal('hide')

        PostKetThucXaVaiSom(arrSave);
    })
}
function HandleXuatHang() {
    if (dataCayVaiXoa.length == 0) {
        showToast('warning', 'Vui lòng chọn cây vải cần xuất')
        return;
    }

    const hasChuaHoanThanh = dataCayVaiXoa.find(item => item.TrangThai != 0 && item.TrangThai != 1)

    dataXuatHang = dataCayVaiXoa.filter(item => item.TrangThai == 0 || item.TrangThai == 1)

    if (hasChuaHoanThanh) {
        showToast('warning', `BarCode: ${hasChuaHoanThanh.BarCode} chưa hoàn thành xổ vải`)
        return;
    }

    if (dataXuatHang.length > 0) {
        CallModal(3)
    } else {
        showToast('warning', 'Không có dữ liệu cây vải cần xuất !')
    }
}
function HandleTimNhanh() {
    GetDSXaVai();
    $("#modalTimNhanhXoVai").modal('show')
}
function HandleGoiYBC() {
    GetViewGoiYBC();
    $("#modalGoiYBC").modal('show')
}
function showConfirmDelete(onConfirm) {
    $('#btnConfirmtDelete').off('click');

    // Khi nhấn Đồng ý
    $('#btnConfirmtDelete').on('click', function () {
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
        // Ẩn modal sau khi xử lý
        $("#confirmModalDelete").modal('hide')

    });

    // Hiện modal
    $("#confirmModalDelete").modal('show')

}
function showConfirmReset(onConfirm) {

    $('#btnConfirmtReset').off('click');

    // Khi nhấn Đồng ý
    $('#btnConfirmtReset').on('click', function () {
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
        // Ẩn modal sau khi xử lý
        $("#confirmModalReset").modal('hide')
    });

    // Hiện modal
    $("#confirmModalReset").modal('show')

}
function showConfirmXacNhanHTKetThucSom(onConfirm) {

    $('#btnConfirmtXacNhanKetThucSom').off('click');

    // Khi nhấn Đồng ý
    $('#btnConfirmtXacNhanKetThucSom').on('click', function () {
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    });

    // Hiện modal
    $("#confirmModalXacNhanKetThucSom").modal('show')

}
function showConfirmXaVai() {
    const tenPhieu = $("#sltPhieu").val();
    $("#lblTenPhieuXaVai").text(tenPhieu);
    $("#modalConfirmtXaVai").modal('show');
}
function showConfirmBatDauXaVai(onConfirm) {
    $('#btnConfirmStartXoVai').off('click');

    // Khi nhấn Đồng ý
    $('#btnConfirmStartXoVai').on('click', function () {
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
        // Ẩn modal sau khi xử lý
        $("#confirmModalStartXoVai").modal('hide')

    });

    // Hiện modal
    $("#confirmModalStartXoVai").modal('show')

}

//function updateSLXoVaiViewBenNgoai(SLXoVai,maNPL) {
//    const item = dataItemCode.find(x => x.MaNPL == maNPL);
//    if (!item) return;

//    item.SLXaVai = SLXoVai;

//    const grid = $("#tbodyXHItemCode").dxDataGrid("instance");
//    if (grid) {
//        grid.option('dataSource', dataItemCode);
//        grid.refresh();
//    }
//}
/// Api
async function GetDSXaVai() {
    const url = `/api/PhieuXuatHangNPL/GetV2?action=GetDSXaVai&para1=${trMaLenh}`

    try {
        const response = await fetch(url)
        const data = await response.json()
        lstDanhSachXaVai = data
        createViewDxGridDanhSachXaVai(data)
    } catch (err) {
        console.error(err)
    }
}

async function GetTTPhieuXaVai() {
    try {
        const url = `/api/PhieuXuatHangNPL/GetV2?action=GetTTPhieuXaVai&para1=${trMaLenh}&para2=${gMaNPL}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();
        var html = ``

        if (data.length > 0) {
            data.forEach(item => html += `<option value="${item.Phieu}" data-manpl="${item.MaNPL}" data-dot="${item.Dot}" data-tgycxavai="${item.TGYCXaVai}">${item.Phieu} - ${item.Display}</option>`)
        }

        $("#sltPhieu").html(html);

    } catch (error) {
        console.error(error.message);
    }
}
async function GetMaxCayVaiTrongPhieu() {
    try {
        var maNPL = $("#sltPhieu option:selected").data('manpl')
        if (!maNPL || maNPL === 'undefined') maNPL = gMaNPL;

        const phieu = $("#sltPhieu").val();
        const url = `/api/PhieuXuatHangNPL/GetV2?action=GetCayVaiMax&para1=${trMaLenh}&para2=${maNPL}&para3=${phieu}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);

        const data = await response.json();
        lotSelected = (data && data.length > 0) ? data[0] : null;

        console.log(`lotSelected: `, lotSelected)
        return data[0];
    } catch (error) {
        console.error(error.message);
    }
}
async function GetTTChonCayVai() {
    try {
        var maNPL = $("#sltPhieu option:selected").data('manpl')
        if (!maNPL || maNPL === 'undefined') {
            maNPL = gMaNPL;
        }

        const phieu = $("#sltPhieu").val();
        const url = `/api/PhieuXuatHangNPL/GetV2?action=GetTTChonCayVai&para1=${maNPL}&para2=${phieu}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();
        createViewDxDataGridChonCayVai(data)
    } catch (error) {
        console.error(error.message);
    }
}
async function GetViewChiTietXaVai() {
    try {
        const loc = $(".select_locls").val()

        var maNPL = $("#sltPhieu option:selected").data('manpl')
        if (!maNPL || maNPL === 'undefined') {
            maNPL = gMaNPL;
        }
        const phieu = $("#sltPhieu").val();

        const url = `/api/PhieuXuatHangNPL/GetV2?action=GetViewChiTietPhieuXaVai&para1=${phieu}&para2=${trMaLenh}&para3=${maNPL}&para4=${loc}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);

        dataCayVai = await response.json();
        dataCayVaiXoa = [];
        dataXuatHang = [];

        $("#dxGridThongTinCayVai input[type='checkbox']:not(.row-chk)").prop('checked', false);
        const slXaVai = formatNumberToFixed(dataCayVai.find(item => item.MaNPL == maNPL)?.TongSLXaVai);
        //updateSLXoVaiViewBenNgoai(slXaVai, maNPL);

        const itemCode = dataItemCode.find(x => x.MaNPL == maNPL);
        const slXuatGoc = itemCode ? formatNumberToFixed(itemCode.SLXuat) : 0

        var sldkHienThi = 0

        if (itemCode) {
            if (loc == 0 || loc == 1) {
                sldkHienThi = formatNumberToFixed(itemCode.SLDK)
            } else if (loc == 2 || loc == 3 || loc == 4) {
                sldkHienThi = formatNumberToFixed(itemCode.CapPhat)
            }

        }

        const slXuat = formatNumberToFixed(slXuatGoc) + formatNumberToFixed(slXaVai);
        const slXuatDisplay = `${formatNumberToString(slXuatGoc)} + ${formatNumberToString(slXaVai)} = ${formatNumberToString(slXuat)}`;


        const slDangKyConLai = sldkHienThi - slXuat < 0 ? 0 : formatNumberToString(sldkHienThi - slXuat);

        $("#txtSLX").val(slXuatDisplay)
        $("#txtSLX").data('value', slXuat);
        $("#txtSLDKCL").val(slDangKyConLai);
        $("#txtSLCLYC").val(slDangKyConLai);

        const isDaHoanThanhVaChoXoVai = dataCayVai.every(item => item.TrangThai == 0 || item.TrangThai == 1 || item.TrangThai == 3)
        if (!isDaHoanThanhVaChoXoVai) {
            startCountdown();
        } else {
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }
            $("#txtTGDN").val('');
            $("#txtTGBD").val('');
            $("#txtTGKT").val('');
        }
        createViewDxGridThongTinCayVai(dataCayVai)
    } catch (error) {
        console.error(error.message);
    }
}
async function GetViewGoiYBC() {
    try {
        var maNPL = $("#sltPhieu option:selected").data('manpl')
        if (!maNPL || maNPL === 'undefined') {
            maNPL = gMaNPL;
        }

        const url = `/api/PhieuXuatHangNPL/GetV2?action=GetGoiYBC&para1=${trMaLenh}&para2=${maNPL}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);

        const data = await response.json();
        createViewDxGridGoiYBC(data)

    } catch (error) {
        console.error(error.message);
    }
}

async function PostCayVai(arrSave) {
    try {
        const url = `/api/PhieuXuatHangNPL/PostV2?action=PostPhieuXaVai`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(arrSave),
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();

        if (result == "True") {
            isNeedUpdate = true;
            showToast('success', 'Chọn cây vải thành công !')
        }

    } catch (error) {
        console.error(error.message);
    }
}

async function UpdateTachKienViewCTXaVai(arrSave){
    try {
        const url = `/api/PhieuXuatHangNPL/PostV2?action=UpdateTachKienViewCTXaVai`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(arrSave),
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();

        if (result == "True") {
            isNeedUpdate = true;
            showToast('success', 'Chọn cây vải thành công !')
        }

    } catch (error) {
        console.error(error.message);
    }
}

async function PostBatDauXaVai(arrSave, action) {
    try {
        const url = `/api/PhieuXuatHangNPL/PostV2?action=${action}`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(arrSave),
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();

        if (result == "True") {
            isNeedUpdate = true;
            showToast('success', 'Lưu thành công!')
            await GetViewChiTietXaVai();
        }

    } catch (error) {
        console.error(error.message);
    }
}

async function PostKetThucXaVaiSom(arrSave) {
    try {
        const url = `/api/PhieuXuatHangNPL/PostV2?action=UpdateKetThucXaVaiSom`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(arrSave),
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();

        if (result == "True") {
            showToast('success', 'Lưu thành công!')
            await GetViewChiTietXaVai();
        }

    } catch (error) {
        console.error(error.message);
    }
}

async function DeleteCayVai(arrDelete) {
    try {
        const url = `/api/PhieuXuatHangNPL/PostV2?action=DeleteCayVai`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(arrDelete),
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        if (result == "True") {
            isNeedUpdate = true;
            showToast('success', 'Xóa cây vải thành công !')
            return true;
        }
        return false;
    } catch (error) {
        console.error(error.message);
        return false;
    }
}

/// DxDataGrid
function createViewDxDataGridChonCayVai(data) {
    if (dxGridChonCayVai) {
        dxGridChonCayVai.option('dataSource', data);
        dxGridChonCayVai.refresh();
        return;
    }

    dxGridChonCayVai = $("#dxGridChonCayVai").dxDataGrid({
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
                dataField: "", caption: "Chọn", width: 90,
                cellTemplate: function (container, options) {
                    const item = options.data;
                    if (item.IsChon == 1 && options.data.SLTonKhoTTXoVai == 0) {
                        const $span = $(`<div style="color: green; font-weight: bold; font-size: 12px">Đã chọn</div>`)
                        container.append($span)
                    } else {
                        const $iconAdd =
                            $(`<i class="fa-solid fa-circle-plus" style="cursor:pointer; font-size: 20px; padding-left:4px;color: #198754"></i>`).on('click', async function () {

                                const dataSource = dxGridChonCayVai.option('dataSource');
                                const dataConTonKho = dataSource.filter(x => (parseFloat(x.SLTonKhoTTXoVai) || 0) > 0);

                                if (dataConTonKho.length === 0) {
                                    showToast('warning', 'Không có kiện nào còn tồn kho');
                                    return;
                                }

                                // Tìm ngày nhập kho nhỏ nhất trong các item còn tồn
                                const ngayNhapKhoNhoNhat = dataConTonKho.reduce((min, x) => {
                                    const ngay = moment(x.NgayNhapKho, 'DD/MM/YYYY').toDate();
                                    return ngay < min ? ngay : min;
                                }, moment(dataConTonKho[0].NgayNhapKho, 'DD/MM/YYYY').toDate());

                                const dataConTonKhoNgayNhoNhat = dataConTonKho.filter(x =>
                                    moment(x.NgayNhapKho, 'DD/MM/YYYY').toDate().getTime() === ngayNhapKhoNhoNhat.getTime()
                                );

                                // Kiểm tra FIFO ngày nhập kho
                                const ngayNKSelect = moment(item.NgayNhapKho, 'DD/MM/YYYY').toDate();
                                const isValidNgay = !dataConTonKho.some(x => moment(x.NgayNhapKho, 'DD/MM/YYYY').toDate() < ngayNKSelect);
                                if (!isValidNgay) {
                                    showToast('warning', 'Vui lòng chọn kiện có ngày nhập kho nhỏ nhất để xổ vải trước');
                                    return;
                                }

                                // Kiểm tra LotBatch
                                if (dataCayVai.length > 0) {
                                    const lotBatchSelected = item.LotBatch;

                                    // Chỉ xét những LotBatch đang còn tồn kho ở ngày nhỏ nhất
                                    const dataCayVaiConTon = dataCayVai.filter(x =>
                                        dataConTonKhoNgayNhoNhat.some(tk => tk.LotBatch == x.LotBatch)
                                    );

                                    if (dataCayVaiConTon.length > 0) {
                                        const isValidLotBatch = dataCayVaiConTon.some(x => x.LotBatch == lotBatchSelected);
                                        if (!isValidLotBatch) {
                                            const currentLotBatch = dataCayVaiConTon[0].LotBatch;
                                            const dsCurrentLotBatchConTon = dataConTonKho.filter(x => x.LotBatch == currentLotBatch);
                                            if (dsCurrentLotBatchConTon.length > 0) {
                                                showToast('warning', 'LotBatch đang khác với LotBatch đã được chọn !');
                                                return;
                                            }
                                        }
                                    }
                                }

                                // Kiểm tra số lượng
                                const slHienTai = parseFloat(item.SLTonKhoTTXoVai) || 0;
                                if (slHienTai <= 0) {
                                    showToast('warning', 'Số lượng tồn kho không đủ để xổ vải');
                                    return;
                                }

                                const phieu = $("#sltPhieu").val();
                                const dot = $("#sltPhieu option:selected").data('dot');
                                const tgXaVai = $("#txtThoiGianYCXaVai").val();
                                const module = parseInt($('.select_loc').val(), 10);
                                const slConLaiYC = parseFloat($('#txtSLCLYC').val()) || 0;

                                let objSave;
                                if (slHienTai > slConLaiYC) {
                                    const objectConvert = {
                                        ...item,
                                        SLNhap: slHienTai,
                                        TenDVCD: item.TenDVVT,
                                        PhieuAdd: phieu,
                                        DotAdd: dot,
                                        TGXaVaiAdd: tgXaVai,
                                        UserID: USER_ID,
                                        Module: module,
                                        SLDaXuatVaXoVai: parseFloat($("#txtSLX").data('value') || 0),
                                    };
                                    objSave = await xuLyTachKien(objectConvert, dataSource, '', 2);
                                }

                                if (!objSave) {
                                    objSave = {
                                        Phieu: phieu,
                                        Dot: dot,
                                        MaLenhSX: trMaLenh,
                                        TGXaVai: tgXaVai,
                                        TGBatDauXaVai: null,
                                        BarCodeGoc: item.BarCode,
                                        BarCode: item.BarCode,
                                        SLNhap: slHienTai,
                                        MaNPL: (item.MaNPL == 'undefined' || !item.MaNPL) ? gMaNPL : item.MaNPL,
                                        GhiChu: '',
                                        GhiChuKetThuc: '',
                                        NguoiTao: USER_ID,
                                        Module: module,
                                    };
                                }

                                await PostCayVai([objSave]);
                                await GetTTChonCayVai();
                                await GetViewChiTietXaVai();
                            })
                        if (options.data.SLTonKhoTTXoVai > 0) {
                            container.append($iconAdd).css({
                                background: item.IsChon == 0 ? '' : '#ffe69c'
                            })
                        }

                    }
                }
            },
            {
                dataField: "", caption: "Tách kiện", width: 90,
                cellTemplate: function (container, options) {
                    const item = options.data;
                    if (item.IsChon == 1 && options.data.SLTonKhoTTXoVai == 0) {
                        const $span = $(`<div style="color: green; font-weight: bold; font-size: 12px">Đã chọn</div>`)
                        container.append($span)
                    } else {
                        const $iconAdd =
                            $(`<i class="fa-solid fa-box-open" style="cursor:pointer; font-size: 20px; padding-left:4px;color: #198754"></i>`).on('click', async function () {

                                const dataSource = dxGridChonCayVai.option('dataSource');
                                const dataConTonKho = dataSource.filter(x => (parseFloat(x.SLTonKhoTTXoVai) || 0) > 0);

                                if (dataConTonKho.length === 0) {
                                    showToast('warning', 'Không có kiện nào còn tồn kho');
                                    return;
                                }

                                // Tìm ngày nhập kho nhỏ nhất trong các item còn tồn
                                const ngayNhapKhoNhoNhat = dataConTonKho.reduce((min, x) => {
                                    const ngay = moment(x.NgayNhapKho, 'DD/MM/YYYY').toDate();
                                    return ngay < min ? ngay : min;
                                }, moment(dataConTonKho[0].NgayNhapKho, 'DD/MM/YYYY').toDate());

                                const dataConTonKhoNgayNhoNhat = dataConTonKho.filter(x =>
                                    moment(x.NgayNhapKho, 'DD/MM/YYYY').toDate().getTime() === ngayNhapKhoNhoNhat.getTime()
                                );

                                // Kiểm tra FIFO ngày nhập kho
                                const ngayNKSelect = moment(item.NgayNhapKho, 'DD/MM/YYYY').toDate();
                                const isValidNgay = !dataConTonKho.some(x => moment(x.NgayNhapKho, 'DD/MM/YYYY').toDate() < ngayNKSelect);
                                if (!isValidNgay) {
                                    showToast('warning', 'Vui lòng chọn kiện có ngày nhập kho nhỏ nhất để xổ vải trước');
                                    return;
                                }

                                // Kiểm tra LotBatch
                                if (dataCayVai.length > 0) {
                                    const lotBatchSelected = item.LotBatch;

                                    // Chỉ xét những LotBatch đang còn tồn kho ở ngày nhỏ nhất
                                    const dataCayVaiConTon = dataCayVai.filter(x =>
                                        dataConTonKhoNgayNhoNhat.some(tk => tk.LotBatch == x.LotBatch)
                                    );

                                    if (dataCayVaiConTon.length > 0) {
                                        const isValidLotBatch = dataCayVaiConTon.some(x => x.LotBatch == lotBatchSelected);
                                        if (!isValidLotBatch) {
                                            const currentLotBatch = dataCayVaiConTon[0].LotBatch;
                                            const dsCurrentLotBatchConTon = dataConTonKho.filter(x => x.LotBatch == currentLotBatch);
                                            if (dsCurrentLotBatchConTon.length > 0) {
                                                showToast('warning', 'LotBatch đang khác với LotBatch đã được chọn !');
                                                return;
                                            }
                                        }
                                    }
                                }

                                // Kiểm tra số lượng
                                const slHienTai = parseFloat(item.SLTonKhoTTXoVai) || 0;
                                if (slHienTai <= 0) {
                                    showToast('warning', 'Số lượng tồn kho không đủ để xổ vải');
                                    return;
                                }

                                const phieu = $("#sltPhieu").val();
                                const dot = $("#sltPhieu option:selected").data('dot');
                                const tgXaVai = $("#txtThoiGianYCXaVai").val();
                                const module = parseInt($('.select_loc').val(), 10);
                                const slConLaiYC = parseFloat($('#txtSLCLYC').val()) || 0;

                                let objSave;
                                const objectConvert = {
                                    ...item,
                                    SLNhap: slHienTai,
                                    TenDVCD: item.TenDVVT,
                                    PhieuAdd: phieu,
                                    DotAdd: dot,
                                    TGXaVaiAdd: tgXaVai,
                                    UserID: USER_ID,
                                    Module: module,
                                    SLDaXuatVaXoVai: parseFloat($("#txtSLX").data('value') || 0),
                                };
                                objSave = await xuLyTachKien(objectConvert, dataSource, '', 3);



                                await PostCayVai([objSave]);
                                await GetTTChonCayVai();
                                await GetViewChiTietXaVai();
                            })
                        if (options.data.SLTonKhoTTXoVai > 0) {
                            container.append($iconAdd).css({
                                background: item.IsChon == 0 ? '' : '#ffe69c'
                            })
                        }

                    }
                }
            },
            { dataField: "MaVT", caption: "Item Code", width: 90, },
            { dataField: "MauVT", caption: "Màu", minWidth: 80, },
            { dataField: "KhoVai", caption: "Width/size", minWidth: 100, },
            { dataField: "SLTonKhoTTXoVai", caption: "SL Tồn Kho", minWidth: 80, },
            { dataField: "TenDVVT", caption: "Đơn vị", minWidth: 80, },
            { dataField: "LotBatch", caption: "Lot/Batch", width: 130, },
            { dataField: "SoKienHienThi", caption: "Số Roll/Kiện", minWidth: 100, },
            { dataField: "NgayNhapKho", caption: "Ngày NK", minWidth: 100, },
            { dataField: "MaONPL", caption: "Vị Trí Ô", minWidth: 100, },
            {
                dataField: "BarCode",
                caption: "BarCode",
                minWidth: 100,
                visible: USER_ID.toLowerCase() == "admin",
                cellTemplate: function (container, options) {
                    $("<div>")
                        .css({
                            "white-space": "normal",
                            "overflow": "visible",
                            "text-overflow": "unset",
                            "word-break": "break-all"
                        })
                        .text(options.value || "")
                        .appendTo(container);
                }
            }
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
function createViewDxGridThongTinCayVai(data) {
    if (dxGridThongTinCayVai) {
        dxGridThongTinCayVai.option('dataSource', data);
        dxGridThongTinCayVai.refresh();
        return;
    }
    dxGridThongTinCayVai = $("#dxGridThongTinCayVai").dxDataGrid({
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
        filterRow: { visible: true, showAllText: 'Tất cả' },
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
                dataField: "", width: 60,
                headerCellTemplate: function (container) {
                    const $chkAll = $(`<input style="width: 18px; height: 18px" type='checkbox' title='Chọn tất cả'/>`)
                        .on('change', function () {
                            const isChecked = $(this).prop('checked');
                            $("#dxGridThongTinCayVai input[type='checkbox'].row-chk").prop('checked', isChecked);
                            if (isChecked) {
                                const dataSource = dxGridThongTinCayVai.option('dataSource').filter(item => !item.IsXuatHang);
                                dataCayVaiXoa = dataSource;
                            } else {
                                dataCayVaiXoa = []
                            }
                        });

                    if (isAfterDelete) {
                        $chkAll.prop('checked', false);
                        isAfterDelete = false;
                    }

                    container.append($chkAll);
                },
                cellTemplate: function (container, options) {
                    const itemRow = options.data;
                    if (itemRow.IsXuatHang) {
                        const $span = $(`<span style="color:red; font-size:12px;font-weight:bold">Đã Xuất</span>`)
                        container.append($span);
                    } else {
                        const $chk = $(`<input  style="width: 18px; height: 18px" type='checkbox' class='row-chk'/>`)
                            .on('change', function () {
                                const isChecked = $(this).prop('checked');

                                if (isChecked) {
                                    dataCayVaiXoa.push(itemRow)
                                } else {
                                    dataCayVaiXoa = dataCayVaiXoa.filter(item => item.BarCode !== itemRow.BarCode);
                                    $("#dxGridThongTinCayVai input[type='checkbox']:not(.row-chk)").prop('checked', false);
                                }
                            });

                        container.append($chk);
                    }

                }
            },
            {
                dataField: "LotBatch", caption: "Lot/Batch", width: 100,
                cellTemplate: function (container, options) {
                    const $div = $(`<div style="direction: ltr; overflow: visible;white-space: normal; word-break: break-all;  width: 100%;">${options.value}</div>`)
                    container.append($div)
                }
            },
            { dataField: "SoKienHienThi", caption: "Số Roll/Kiện", minWidth: 100, },
            {
                dataField: "BarCode", caption: "BarCode", width: 140,
                cellTemplate: function (container, options) {
                    const $div = $(`<div style="direction: ltr; overflow: visible;white-space: normal; word-break: break-all;  width: 100%;">${options.value}</div>`)
                    container.append($div)
                }
            },
            { dataField: "SLNhap", caption: "Số Lượng", minWidth: 100, },
            {
                dataField: '',
                caption: "Tiến Trình Xổ Vải", minWidth: 130,
                cellTemplate: function (container, options) {
                    const item = options.data;
                    const tgKetThucXoVai = options.data.TGKetThucXaVai;
                    const trangThai = options.data.TrangThai;

                    const $wrap = $(`
                        <div style="padding: 4px 8px;">
                            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:3px;">
                                <span class="txt-tien-trinh"></span>
                                <span class="txt-percent" style="font-weight:600;"></span>
                            </div>
                            <div style="background:#e9ecef; border-radius:4px; height:8px; overflow:hidden;">
                                <div class="bar-tien-trinh" style="height:100%; border-radius:4px; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                    `);
                    container.append($wrap);
                    function updateUI() {
                        const slYeuCau = parseFloat(item.TGXaVai) || 0;

                        if (!item.TGBatDauXaVai) {
                            $wrap.find('.txt-tien-trinh').text(`0h / ${slYeuCau}h`);
                            $wrap.find('.txt-percent').text('0%').css('color', '#dc3545');
                            $wrap.find('.bar-tien-trinh').css({ width: '0%', background: '#dc3545' });
                            return;
                        }

                        const batDau = moment(item.TGBatDauXaVai, 'YYYY-MM-DD HH:mm:ss');
                        // Nếu đã kết thúc xổ vải (sớm hoặc đủ), tính % theo TGKetThucXaVai, không theo thời gian thực

                        const moc = tgKetThucXoVai && (trangThai == 0 || trangThai == 1) ? moment(tgKetThucXoVai, 'YYYY-MM-DD HH:mm:ss') : moment();
                        const slDaXaRaw = parseFloat(moment.duration(moc.diff(batDau)).asHours().toFixed(2));
                        const slDaXa = Math.min(slDaXaRaw, slYeuCau)

                        const percent = Math.min(Math.round((slDaXa / slYeuCau) * 100), 100);

                        options.data.TienTrinh = percent;

                        let color = '#198754';
                        if (percent < 33) color = '#dc3545';
                        else if (percent < 66) color = '#fd7e14';

                        $wrap.find('.txt-tien-trinh').text(`${slDaXa}h / ${slYeuCau}h`);
                        $wrap.find('.txt-percent').text(`${percent}%`).css('color', color);
                        $wrap.find('.bar-tien-trinh').css({ width: `${percent}%`, background: color });
                    }

                    updateUI();

                    // Đã kết thúc xổ vải thì không cần cập nhật theo thời gian thực nữa
                    if (tgKetThucXoVai) {
                        return;
                    }

                    // Cập nhật mỗi phút, tự dừng khi cell bị remove khỏi DOM
                    const timer = setInterval(function () {
                        if (!$.contains(document, container[0])) {
                            clearInterval(timer);
                            return;
                        }
                        updateUI();
                    }, 60000);
                }
            },
            {
                dataField: "GhiChuKetThuc", caption: "Ghi Chú KT", minWidth: 130,
            },
            {
                dataField: "TrangThai", caption: "Trạng Thái HT", minWidth: 130,
                lookup: {
                    dataSource: [
                        { value: 0, text: 'Kết thúc sớm' },
                        { value: 1, text: 'Đã hoàn thành' },
                        { value: 2, text: 'Đang xổ vải' },
                        { value: 3, text: 'Chờ xổ vải' },
                    ],
                    valueExpr: 'value',
                    displayExpr: 'text',
                    allowClearing: true,
                },
                cellTemplate: function (container, options) {
                    const item = options.data;
                    const trangThai = item.TrangThai

                    var text = '';
                    var color = '';

                    if (trangThai == 0) {
                        text = 'Kết thúc sớm';
                        color = '#fd7e14'; // cam
                    } else if (trangThai == 1) {
                        text = 'Đã hoàn thành';
                        color = '#198754'; // xanh lám
                    } else if (trangThai == 2) {
                        text = 'Đang xổ vải';
                        color = '#0d6efd'; // xanh dương
                    } else if (trangThai == 3) {
                        text = 'Chờ xổ vải';
                        color = '#6f42c1'; // tím
                    }

                    const $span = $(`
                        <span style="
                            color:${color};
                            font-weight:600;
                            font-size:12px;
                            padding:3px 10px;
                            border-radius:12px;
                            background:${color}1A;
                            white-space:nowrap;
                        ">${text}</span>
                    `);
                    container.append($span);
                }
            },
            {
                dataField: "TGBatDauXaVai",
                caption: "Thời Gian BĐ", minWidth: 140,
                cellTemplate: function (container, options) {
                    const tgBatDauFormat = options.data.TGBatDauXaVai ? moment(options.data.TGBatDauXaVai, 'YYYY-MM-DD HH:mm:ss').format('HH:mm - DD/MM') : ''

                    container.append(tgBatDauFormat)
                }
            },
            {
                caption: "Thời Gian HT", minWidth: 140,
                cellTemplate: function (container, options) {
                    const tgKetThucXoVai = options.data.TGKetThucXaVai ? moment(options.data.TGKetThucXaVai, 'YYYY-MM-DD HH:mm:ss').format('HH:mm - DD/MM') : $("#txtTGKT").val();

                    container.append(tgKetThucXoVai)
                }
            },
            {
                dataField: "GhiChu",
                caption: "Ghi chú",
                minWidth: 200,
                cellTemplate: function (container, options) {
                    const item = options.data
                    const tgKetThucXoVai = item.TGKetThucXaVai

                    if (item.IsXuatHang || tgKetThucXoVai) {
                        container.text(options.value);
                        return;
                    }
                    const $input = $(`
                        <input type="text" class="form-control" style="font-size:12px" value="${options.data.GhiChu || ''}" />
                    `).prop('disabled', item.TGBatDauXaVai)

                    $input.on("input", function () {
                        item.GhiChu = this.value;
                    });

                    $input.on("click", function () {
                        if (item.TGBatDauXaVai) {
                            showToast('warning', 'Đang trong tiến trình Xổ vải không được nhập ghi chú !')
                        }
                    });


                    container.append($input);
                }
            },
            {
                dataField: "", caption: "Tách kiện", width: 90,
                cellTemplate: function (container, options) {
                    const item = options.data;
                    if (item.BarCode == item.BarCodeGoc && item.TrangThai == 3) {
                        const $iconAdd =
                            $(`<i class="fa-solid fa-box-open" style="cursor:pointer; font-size: 20px; padding-left:4px;color: #198754"></i>`).on('click', async function () {

                                const dataSource = dxGridThongTinCayVai.option('dataSource');

                                const phieu = $("#sltPhieu").val();
                                const dot = $("#sltPhieu option:selected").data('dot');
                                const tgXaVai = $("#txtThoiGianYCXaVai").val();
                                const module = parseInt($('.select_loc').val(), 10);
                                const slConLaiYC = parseFloat($('#txtSLCLYC').val()) || 0;

                                var maNPL = $("#sltPhieu option:selected").data('manpl')
                                if (!maNPL || maNPL === 'undefined') {
                                    maNPL = gMaNPL;
                                }

                                const itemCode = dataItemCode.find(x => x.MaNPL == maNPL);
                                const slXuat = formatNumberToFixed($("#txtSLX").data('value'))
                                const sldk = itemCode ? formatNumberToFixed(itemCode.SLDK) - (slXuat - options.data.SLNhap) : 0;
                                const slHienThiModal = sldk < 0
                                    ? 0
                                    : sldk > options.data.SLNhap ? 0 : sldk

                                let objSave;
                                const objectConvert = {
                                    ...item,
                                    SLNhap: item.SLNhap,
                                    TenDVCD: item.TenDVVT,
                                    PhieuAdd: phieu,
                                    DotAdd: dot,
                                    TGXaVaiAdd: tgXaVai,
                                    UserID: USER_ID,
                                    Module: module,
                                    SLDaXuatVaXoVai: parseFloat($("#txtSLX").data('value') || 0),
                                    slHienThiModal
                                };
                                objSave = await xuLyTachKien(objectConvert, dataSource, '', 4);

                                item.BarCode = objSave.BarCode
                                item.SLNhap = objSave.SLNhap
                                dxGridThongTinCayVai.refresh()

                                console.log(`objSave: `, objSave)

                                await UpdateTachKienViewCTXaVai([objSave])
                                //await PostCayVai([objSave]);

                                await GetTTChonCayVai();
                                await GetViewChiTietXaVai();
                            })
                        container.append($iconAdd)


                    }
                }
            },
            {
                caption: "Xóa", minWidth: 50,
                cellTemplate: function (container, options) {
                    const itemRow = options.data;

                    if (itemRow.IsXuatHang) return;
                    if (itemRow.TrangThai == 2) return;

                    const $iconDelete =
                        $(`<i class="fa-solid fa-trash text-red" style="font-size: 14px;cursor:pointer"></i>`).on('click', function () {
                            if (itemRow.TrangThai == 2) {
                                showToast('warning', `BarCode: ${itemRow.BarCode} đang trong tiến trình xổ vải không được xóa !`)
                                return;
                            }

                            if (isDangXaVai()) {
                                showToast('warning', 'Đang trong tiến trình Xổ vải không được xóa !')
                                return;
                            }
                            showConfirmDelete(async function () {
                                // Xóa trên sql
                                const objDelete = {
                                    Phieu: itemRow.Phieu,
                                    Dot: '',
                                    MaLenhSX: trMaLenh,
                                    TGXaVai: '',
                                    TGBatDauXaVai: '',
                                    BarCodeGoc: '',
                                    BarCode: itemRow.BarCode,
                                    SLNhap: '',
                                    MaNPL: '',
                                    GhiChu: '',
                                    GhiChuKetThuc: '',
                                    NguoiTao: '',
                                    Module: ''
                                }

                                DeleteCayVai([objDelete])

                                // Xóa khỏi dataCayVai
                                lotSelected = null;
                                await GetViewChiTietXaVai();
                                await GetTTChonCayVai();
                                await GetMaxCayVaiTrongPhieu();
                            })
                        })
                    container.append($iconDelete)
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
function createViewDxGridDanhSachXaVai(data) {
    if (dxDanhSachXaVai) {
        dxDanhSachXaVai.option('dataSource', data);
        dxDanhSachXaVai.refresh();
        return;
    }
    dxDanhSachXaVai = $("#dxDanhSachXaVai").dxDataGrid({
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
                dataField: "Phieu",
                caption: "Phiếu",
                alignment: "center",
                minWidth: 100,
                cellTemplate: function (container, options) {
                    const $wrapper = $(`<div></div>`).css({ display: "flex", justifyContent: "center", height: "25px", gap: "8px" })

                    // Text
                    const $span = $(`<span>${options.data.Phieu}</span>`)

                    // Icon
                    const $btnNext = $(`<i class="fa-solid fa-circle-right" style='cursor:pointer'></i>`)
                        .css({ fontSize: '16px', color: 'green' })
                        .on("click", function () {
                            $("#sltPhieu").val(`${options.data.Phieu}`).trigger("change");
                            $("#modalTimNhanhXoVai").modal('hide');
                            $("#inputTimKiemXoVai").val('').trigger('input');
                            createViewDxGridDanhSachXaVai([])
                        })

                    $wrapper.append($span, $btnNext).appendTo(container)

                }
            },
            {
                dataField: "BarCode",
                caption: "BarCode",
                alignment: "center",
                minWidth: 140,
                cellTemplate: function (container, options) {
                    const $div = $(`<div style="direction: ltr; overflow: visible;white-space: normal; word-break: break-all;  width: 100%;">${options.value}</div>`)
                    container.append($div)
                }
            },
            {
                dataField: "Display",
                caption: "TT ItemCode",
                alignment: "center",
                minWidth: 240,
            },
            {
                dataField: "LotBatch",
                caption: "Lot/Batch",
                alignment: "center",
                minWidth: 100,
            },
            {
                dataField: "SLNhap",
                caption: "SL Xổ Vải",
                alignment: "center",
                minWidth: 60,
            },
            {
                dataField: "TrangThai", caption: "Trạng Thái HT", minWidth: 130,
                cellTemplate: function (container, options) {
                    const item = options.data;
                    const trangThai = item.TrangThai

                    var text = '';
                    var color = '';
                    if (trangThai == 0) {
                        text = 'Đã xuất';
                        color = '#dc3545'; // đỏ
                    } else if (trangThai == 1) {
                        text = 'Kết thúc sớm';
                        color = '#fd7e14'; // cam
                    } else if (trangThai == 2) {
                        text = 'Đã hoàn thành';
                        color = '#198754'; // xanh lá
                    } else if (trangThai == 3) {
                        text = 'Đang xổ vải';
                        color = '#0d6efd'; // xanh dương
                    } else if (trangThai == 4) {
                        text = 'Chờ xổ vải';
                        color = '#6f42c1'; // tím
                    }

                    const $span = $(`
                        <span style="
                            color:${color};
                            font-weight:600;
                            font-size:12px;
                            padding:3px 10px;
                            border-radius:12px;
                            background:${color}1A;
                            white-space:nowrap;
                        ">${text}</span>
                    `);
                    container.append($span);
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

                const searchTerm = $("#inputTimKiemXoVai").val().trim().toLowerCase();
                if (searchTerm && (e.column.dataField === "Display" || e.column.dataField === "BarCode" || e.column.dataField === "LotBatch")) {
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
function createViewDxGridGoiYBC(data) {
    if (dxGridGoiYBC) {
        dxGridGoiYBC.option('dataSource', data);
        dxGridGoiYBC.refresh();
        return;
    }
    dxGridGoiYBC = $("#dxGridGoiYBC").dxDataGrid({
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
                dataField: "BanCat",
                caption: "Bàn Cắt",
                alignment: "center",
                minWidth: 60,
            },
            {
                dataField: "TenSoDo",
                caption: "Tên Sơ Đồ",
                alignment: "center",
                minWidth: 140,
                cellTemplate: function (container, options) {
                    const $div = $(`<div style="direction: ltr; overflow: visible;white-space: normal; word-break: break-all;  width: 100%;">${options.value}</div>`)
                    container.append($div)
                }
            },
            {
                dataField: "SoLop",
                caption: "Số Lớp",
                alignment: "center",
                minWidth: 60,
            },
            {
                dataField: "TieuHao",
                caption: "Tiêu Hao",
                alignment: "center",
                minWidth: 100,
                cellTemplate: function (container, options) {
                    container.text(formatNumberToString(options.value))
                }
            },
            {
                dataField: "DaiSoDo",
                caption: "Dài Sơ Đồ",
                alignment: "center",
                minWidth: 100,
            },
            {
                dataField: "DinhMuc",
                caption: "Định Mức",
                alignment: "center",
                minWidth: 100,
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
            }
        },

    }).dxDataGrid("instance");

    $("#Layer_1").click()
}