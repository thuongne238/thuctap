/// VARIABLE
//var userNameSave = localStorage.getItem("username1");
let dxDataGridDangKyVatTu;
let dxDataGridDanhSachDangKy;
let dxDataGridEditVatTu;
let dxDataGridThuVien;
let selectedItems = [];
let selectedRowsToDelete = [];
let selectedRowsToSave = [];
let lstDataDangKyVatTu = [];
let selectedItemsChungLoai = [];
let batchData;
let dot;
let selectSoPhieu = '';
let selectSoPhieuDisplay = '';
let rowDelete = {};
let rowEdit = {};
let lstEditDangKyVatTu = [];
let isDeleteAll = false;
let isDeleteDK = false;
let isDeleteAllDK = false;
var isShowNgayCapAndGioCap = false;
let picker1, picker2, picker3, picker4;
let pickerTuNgayFilter, pickerDenNgayFilter;
let phieuDKJoin = [];

let mauSPOptions = [];
let sizeInfoOptions = [];
let tempSelectedValue = [];

let chungLoaiChiTietOptions = [];
let cacheSoLuong = [];
let dataSoLuong = [];
let lenhDangKyVatTuOptions = [];
let chungLoaiThuVienCache = [];
let soLuongLoadedMaLenh = "";
let ms = null;
let arrMau = [];
let dataDangKyGoc = [];
let arrSize = [];
let phieuDelete = '';
let currentEditPhieu = "";
let msEdit = null;
let pickerNgayDKEdit;
let arrMauEdit = [];
let arrSizeEdit = [];
let dxDataGridEditPhieu;
/// UTILS
function toIntFlag(val, fallback) {
    if (val === true) return 1;
    if (val === false) return 0;
    const n = parseInt(val, 10);
    return Number.isFinite(n) ? n : (fallback ?? 0);
}
function ddmmyyyyToYmd(dateStr) {
    if (!dateStr) return "1990-01-01";
    const [d, m, y] = dateStr.split("/");
    return `${y}-${m}-${d}`;
}
function formatThousands(numStr) {
    // numStr là string số nguyên phần (không có dấu thập phân)
    return String(numStr).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function PlayAudio() {
    const beepSound = document.getElementById("beepSound");
    beepSound.currentTime = 0;
    beepSound.play();
}

function PlayAudioError() {
    const beepSoundE = document.getElementById("beepSoundError");
    beepSoundE.currentTime = 0;
    beepSoundE.play();
}

/// API
const API = {
    async Get(action, para = {}, textSuccess = '') {
        const paraConvert = Object.entries(para || {})
            .map(([key, value]) => `${key}=${value}`)
            .join("&");

        const url = `/api/PhieuYCXKTP/Get?action=${action}${paraConvert ? '&' + paraConvert : ''}`;

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

    async Post(router = 'Post', action, arrSave, textSuccess = "Lưu thành công!", para = {}) {
        const paraConvert = Object.entries(para || {})
            .map(([key, value]) => `${key}=${value}`)
            .join("&");

        const url = `/api/PhieuYCXKTP/${router}?action=${action}${paraConvert ? '&' + paraConvert : ''}`;

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

/// API CALLS



async function GetMaLenh2() {
    const $maHangSelect = $("#m-ma-hang");
    const data = await API.Get("GetMaHang");
    $maHangSelect.empty();

    if (data.length > 0) {
        const html = data.map(x => `<option value="${x.MaLenh}" data-mahang="${x.MaHang}" data-malenh="${x.MaLenh}" data-tenhang="${x.TenHang}" data-tencl="${x.TenCL}" data-tendvcl="${x.TenDVCL}">${x.Display}</option>`).join('');
        $maHangSelect.append(html);
    }


    await GetPhieu();
}






async function GetPhieu() {
    //const maLenhSanXuat = $("#malenh").val();
    //const data = await API.Get("GetPhieuDNTH", { para1: isNPL, para2: maLenhSanXuat });
    const data = await API.Get("GETPHIEU")
    const $soPhieu = $("#maphieu");

    if ($soPhieu.hasClass("select2-hidden-accessible")) {
        $soPhieu.select2("destroy");
    }
    $soPhieu.empty();

    $soPhieu.append('<option value ="all">--Tất cả--</option>');

    //if (data.length > 0) {
    //    const html = data.map(x => `<option data-display="${x.Display}" value="${x.PhieuTH}">${x.Display}</option>`).join('');
    //    selectSoPhieuDisplay = data[0].Display
    //    $soPhieu.append(html);
    //}
    if (data && data.length > 0) {
        const filtered = data.filter(x => x.PhieuXKTP !== 'all');
        const html = filtered.map(x =>
            `<option value="${x.PhieuXKTP}">${x.PhieuXKTP}</option>`
        ).join('');
        $soPhieu.append(html);

    }

    $soPhieu.select2();


}


async function fetchTonKhoMap(maNPLList) {
    const BATCH_SIZE = 50;
    const batches = [];
    for (let i = 0; i < maNPLList.length; i += BATCH_SIZE) {
        batches.push(maNPLList.slice(i, i + BATCH_SIZE));
    }
    const results = await Promise.all(
        batches.map(b => API.Get("GetTonKhoByNPL", { para1: b.join(';') }))
    );
    const map = {};
    results.flat().forEach(x => { if (x?.MaNPL) map[x.MaNPL] = x; });
    return map;
}

async function fetchSizeInfoMap(soPhieu) {
    const data = await API.Get("GetSizeInfoByPhieu", { para1: soPhieu, para3: 'all' });
    const map = {};
    (data || []).forEach(x => {
        const key = `${x.MaVTID}|${x.MauVTID}|${x.KhoVaiID}|${x.MaNhom}|${x.MaCode}|${x.MaDot}`;
        map[key] = x.SizeInfo;
    });
    return map;
}

async function UpdateKiTenPhieu(arrSave) {
    await API.Post("PostXKTP", "PostKyTen", arrSave, "Lưu phiếu thành công", { para1: isNPL });
    //await GetDSPhieuDNTH();
    await loadDataTong();
}
async function DeleteChiTietPhieu(phieuTH, maNPL) {
    const res = await API.Get("DeleteChiTietPhieu", { para1: phieuTH, para2: maNPL });

    if (res && res[0].SoDongDaXoa > 0) {
        showToast("success", "Xóa thành công");
        await loadDataTong();

        if (lstDataDangKyVatTu.length === 0) {
            await resetToDefault();
        }
    } else {
        showToast("error", res?.[0]?.Message || "Không thể xóa");
    }
}

async function DeletePhieuDNTH() {
    await API.Get("DELETEPHIEU", {
        para1: phieuDelete,
        para2: userNameSave
    }, "Xóa thành công");

    await loadDataTong();

    //await GetMaLenh2();

    //if (lstDataDangKyVatTu.length === 0) {
    //    await resetToDefault();
    //}

    $("#modalComfimrtDeleteVT").modal('hide');
}

async function DeleteAllPhieu() {
    let res = await API.Get("DeletePhieuDNTH", { para1: selectSoPhieu });

    if (res && res[0].SoDongDaXoa > 0) {
        showToast("success", "Xóa phiếu thành công");

        await resetToDefault();
        chiTietLenhCache = {};

        $("#modalComfimrtDeleteVT").modal('hide');
    } else {
        showToast("error", res[0].Message || "Không thể xóa phiếu");
    }
}


/// HELPER FUNCTIONS
function updateGrid(grid, dataSource) {
    grid.beginUpdate();
    grid.option({ dataSource: dataSource });
    grid.endUpdate();
}

function resetModalState() {
    selectedItems = [];
    selectedRowsToSave = [];
    selectedItemsChungLoai = [];
    $('#itemList input[type="checkbox"]').prop('checked', false);
    $('#checkAll').prop('checked', false);
    $('#phieuDKXInput').val('');
    $('#maDHNhap').val('');
    $('#dropdownList').removeClass('show');

    updateGrid(dxDataGridDangKyVatTu, []);
}


async function resetToDefault() {
    selectSoPhieu = '';
    lstDataDangKyVatTu = [];

    await GetPhieu();
    //$("#maphieu").val('all').trigger("change");
    await GetMaxDot();

    updateGrid(dxDataGridDanhSachDangKy, []);
    isDeleteAll = false;
}

function renderList(data) {
    const itemList = $('#itemList');
    itemList.empty();

    // Kiểm tra data có tồn tại và là array không
    if (!data || !Array.isArray(data)) {
        return;
    }

    const html = data.map(item => {
        const isChecked = selectedItems.some(selected => selected.PhieuDK == item.PhieuDK);
        return `
            <div class="dropdown-item">
                <input type="checkbox" 
                       id="${item.PhieuDK}"
                       data-display="${item.PhieuDK}"
                       ${isChecked ? 'checked' : ''}>
                <label class="mb-0" for="${item.PhieuDK}">${item.PhieuDK}</label>
            </div>
        `;
    }).join('');

    itemList.append(html);
    updateCheckAll();
}

function updateCheckAll() {
    const total = $('#itemList input[type="checkbox"]').length;
    const checked = $('#itemList input[type="checkbox"]:checked').length;
    $('#checkAll').prop('checked', total > 0 && total == checked);
}



function showLoading() {
    $('#loadingSpinner').fadeIn(200);
    $('#modalAddPhieu .modal-body section').css('opacity', '0.5');
}

function hideLoading() {
    $('#loadingSpinner').fadeOut(200);
    $('#modalAddPhieu .modal-body section').css('opacity', '1');
}

/// EVENTS
$(document).ready(async function () {
    $(".select_2").select2();
    $("#malenhdangkyvattu").select2({
        dropdownParent: $("#modalAddPhieu")
    });


    loadDataTong();
    //createViewDxDataGridDangKyVatTu();

    createViewDxGridDanhSachPhieuDKVT();
    createViewDxDataGridEditPhieuXKTP();
    await Promise.all([
        GetPhieu()

    ]);
    selectSoPhieu = $("#maphieu option:selected").val();
});

$(function () {

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    $("#khachhang").val("all").select2('destroy').select2();

    $("#home").on("click", () => window.location.href = '/Home/Dashboard');

    $("#khachhang").on("change", function () {
        GetMaLenh()
    });

    $('#phieuDKXInput').click(function (e) {
        e.stopPropagation();
        $('#dropdownList').toggleClass('show');
        $('#searchInput').val('').focus();
    });

    $("#trangThaiDuyet").select2();

    $("#trangThaiDuyet").on("change", function () {
        filterByTrangThai();
    });

    pickerTuNgayFilter = new tempusDominus.TempusDominus(
        document.getElementById('dtpTuNgayFilter'), {
        display: {
            components: {
                calendar: true, date: true, month: true, year: true,
                clock: false, hours: false, minutes: false, seconds: false
            }
        },
        localization: { format: 'dd/MM/yyyy' }
    });
    pickerNgayDKEdit = new tempusDominus.TempusDominus(
        document.getElementById('txtNgayDangKiEdit'),
        {
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
            }
        }
    );
    pickerDenNgayFilter = new tempusDominus.TempusDominus(
        document.getElementById('dtpDenNgayFilter'), {
        display: {
            components: {
                calendar: true, date: true, month: true, year: true,
                clock: false, hours: false, minutes: false, seconds: false
            }
        },
        localization: { format: 'dd/MM/yyyy' }
    });

    document.getElementById('dtpTuNgayFilter')
        .addEventListener(tempusDominus.Namespace.events.change, function () {
            filterByTrangThai();
        });

    document.getElementById('dtpDenNgayFilter')
        .addEventListener(tempusDominus.Namespace.events.change, function () {
            filterByTrangThai();
        });


    $(document).on('click', function (e) {
        if (!$(e.target).closest('.select-container').length) {
            $('#dropdownList').removeClass('show');
        }
    });

    picker1 = new tempusDominus.TempusDominus(document.getElementById('datetimepicker'), {
        display: {
            components: {
                calendar: true, date: true, month: true, year: true,
                clock: false, hours: false, minutes: false, seconds: false
            }
        },
        localization: { format: 'dd/MM/yyyy' }
        , restrictions: {
            minDate: today  // ← Chỉ cho chọn từ hôm nay trở đi
        }
    });

    picker2 = new tempusDominus.TempusDominus(document.getElementById('datetimepicker2'), {
        display: {
            components: {
                calendar: true, date: true, month: true, year: true,
                clock: false, hours: false, minutes: false, seconds: false
            }
        },
        localization: { format: 'dd/MM/yyyy' }
        , restrictions: {
            minDate: today  // ← Chỉ cho chọn từ hôm nay trở đi
        }
    });

    picker4 = new tempusDominus.TempusDominus(document.getElementById('datetimepicker3'), {
        display: {
            components: {
                calendar: true, date: true, month: true, year: true,
                clock: false, hours: false, minutes: false, seconds: false
            }
        },
        localization: { format: 'dd/MM/yyyy' }
    });

    $("#tuNgay").trigger("click");
    $("#ngayCap").trigger("click");
    picker1.hide();
    picker2.hide();

    $('#searchInput').on('input', function () {
        const searchTerm = $(this).val().toLowerCase();
        const filtered = batchData.filter(item => item.Display.toLowerCase().includes(searchTerm));
        renderList(filtered);
    });

    //$('#btnSavePhieu').on("click", async function () {
    //    SaveDeNghiThuHoi()

    //});
    $('#btnSavePhieu').on("click", async function () {
        $(this).prop("disabled", true);
        try {

            await SavePhieuXuat();

        } finally {
            $(this).prop("disabled", false);
        }
    });

    $('#checkAll').change(async function () {
        const isChecked = $(this).is(':checked');

        dxDataGridDangKyVatTu.beginCustomLoading("Đang tải dữ liệu...");

        try {
            if (isChecked) {
                selectedItems = [...batchData];

            } else {
                phieuDKJoin = [];
                selectedItems = [];
            }

            $('#itemList input[type="checkbox"]').prop('checked', isChecked);
            updateInput();
            GetChiTietLenhThuHoi();
        } finally {
            dxDataGridDangKyVatTu.endCustomLoading();
        }
    });

    $(document).on('change', '#itemList input[type="checkbox"]', async function () {
        const itemId = $(this).attr('id');
        const isChecked = $(this).is(':checked');

        if (isChecked) {
            const item = batchData.find(x => x.PhieuDK == itemId);
            if (item && !selectedItems.some(x => x.PhieuDK == itemId)) {
                selectedItems.push(item);
            }
        } else {
            selectedItems = selectedItems.filter(x => x.PhieuDK != itemId);
        }

        updateCheckAll();
        updateInput();
        GetChiTietLenhThuHoi();
    });



    $("#btnShowModal").on("click", async function () {
        // Reset các picker về ngày giờ hiện tại
        const now = new tempusDominus.DateTime();
        picker1.dates.setValue(now);
        picker2.dates.setValue(now);
        //picker3.dates.setValue(now);
        initGridCreate([]);
        resetModalAddPhieu();
        await GetMaxDot();
        $("#modalAddPhieu").modal("show");
        await GetMaLenh2();
        if (ms == null) {
            ms = new MultiSelect(document.getElementById('m-ma-hang'), {
                placeholder: '-- Chọn mã hàng --'
            });
        }
        else {
            ms.reset();
        }

    });

    $("#btnDeleteAllPhieu").on("click", function () {


        const grid = $("#dxDataGridDanhSachDangKy")
            .dxDataGrid("instance");

        const selectedRow = grid.getSelectedRowsData()[0];

        if (!selectedRow) {
            showToast("warning", "Vui lòng chọn phiếu để xóa");
            return;
        }



        // ví dụ lấy phiếu
        const phieu = selectedRow.PhieuXKTP;
        phieuDelete = phieu;
        if (selectedRow.NguoiKi && userNameSave != 'admin') {
            showToast("warning", `Cảnh báo: Không thể xóa. Phiếu ${phieu} đã được ký tên.`);
            return;
        }

        $("#modalComfimrtDeleteVT").modal("show");

    });

    $("#btnEditAllPhieu").on("click", async function () {
        const grid = $("#dxDataGridDanhSachDangKy").dxDataGrid("instance");
        const selectedRow = grid.getSelectedRowsData()[0];

        if (!selectedRow) {
            showToast("warning", "Vui lòng chọn phiếu để chỉnh sửa");
            return;
        }

        currentEditPhieu = selectedRow.PhieuXKTP;

        $("#txtSoPhieuEdit").val(selectedRow.PhieuXKTP || "");
        $("#txtNgayDangKiEdit").val(selectedRow.NgayDK || "");
        $("#ngayCapEdit").val(selectedRow.NgayXuat || "");

        await initMaHangEditSelect();

        const rows = dataDangKyGoc
            .filter(x => x.PhieuXKTP === currentEditPhieu)
            .map(x => ({
                ID: x.ID || 0,
                PhieuXKTP: x.PhieuXKTP,
                Dot: x.Dot,
                MaLenh: x.MaLenh,
                MaHang: x.MaHang,
                Color: x.MaMau,
                Size: x.MaSize,
                MaNhomSize: x.MaNhomSize,
                TenCL: x.TenCL,
                TenDVCL: x.TenDVCL,
                SLYC: x.SLYC,
                DonGia: x.DonGia,
                ThanhTien: x.ThanhTien,
                ghiChu: x.GhiChu,
                NguoiTao: x.NguoiTao,
                NguoiNhan: x.NguoiNhan || "",
                DiaChi: x.DiaChi || "",
                LyDo: x.LyDo || ""
            }));


        //const rows = dataDangKyGoc.filter(item => item.PhieuXKTP === currentEditPhieu).map(item => ({
        //    ID: item.ID || 0,
        //    PhieuXKTP: item.PhieuXKTP || "",
        //    MaLenh: item.MaLenh || "",
        //    TenHang: item.TenHang || "",
        //    MaHang: item.MaHang || "",
        //    TenCL: item.TenCL || "",
        //    TenDVCL: item.TenDVCL || "",
        //    TenMau: item.TenMau || "",
        //    MaMau: item.MaMau || "",
        //    NhomSize: item.NhomSize || "",
        //    TenSize: item.TenSize || "",
        //    MaSize: item.MaSize || "",
        //    MaNhomSize: item.MaNhomSize || "",
        //    SLYC: item.SLYC || 0,
        //    SLTX: item.SLTX || 0,
        //    DonGia: item.DonGia || 0,
        //    ThanhTien: item.ThanhTien || 0,
        //    NguoiNhan: item.NguoiNhan || "",
        //    DiaChi: item.DiaChi || "",
        //    LyDo: item.LyDo || "",
        //    NgayDK: item.NgayDK || "",
        //    NgayXuat: item.NgayXuat || "",
        //    GhiChu: item.GhiChu || "",
        //    NguoiTao: item.NguoiTao || "",
        //    SignNgDK: item.SignNgDK || "",
        //    SignTBPNgDK: item.SignTBPNgDK || "",
        //    IsOk: item.IsOk || 0
        //}));
        const maLenhList = [...new Set(rows.map(x => String(x.MaLenh || "")).filter(Boolean))];

        maLenhList.forEach(maLenh => {
            msEdit.selected.add(maLenh);
        });

        msEdit._renderList();
        msEdit._renderTags();
        msEdit._syncSelect();

        await loadOptionsMauSizeEdit();

        dxDataGridEditPhieu.option("dataSource", rows);
        //cc
        dxDataGridEditPhieu.refresh();

        $("#modalEditDKVT").modal("show");

        setTimeout(function () {
            dxDataGridEditPhieu.updateDimensions();
            dxDataGridEditPhieu.repaint();
        }, 200);
    });

    $("#btnSaveEditPhieu").on("click", async function () {
        await SaveEditPhieuXuat();
    });
    async function SaveEditPhieuXuat() {
        const grid = $("#dxDataGridEditVatTu").dxDataGrid("instance");
        const rows = grid.getDataSource().items() || [];

        if (!currentEditPhieu) {
            showToast("warning", "Chưa chọn phiếu cần sửa");
            return;
        }

        if (!rows.length) {
            showToast("warning", "Phiếu không có dòng nào để lưu");
            return;
        }



        const ngayDK = ddmmyyyyToYmd($("#txtNgayDangKiEdit").val());
        const ngayXuat = ddmmyyyyToYmd($("#ngayCapEdit").val());

        const arrSave = rows.map(row => ({
            ID: row.ID || 0,
            PhieuXKTP: currentEditPhieu,
            Dot: row.Dot || null,
            MaLenh: row.MaLenh || "",
            NguoiNhan: row.NguoiNhan || "",
            DiaChi: row.DiaChi || "",
            LyDo: row.LyDo || "",
            SLYC: Number(row.SLYC) || 0,
            SLTX: Number(row.SLTX) || 0,
            DonGia: Number(row.DonGia) || 0,
            ThanhTien: (Number(row.SLYC) || 0) * (Number(row.DonGia) || 0),
            MaHang: row.MaHang || "",
            MaMau: row.Color || "",
            MaNhomSize: row.MaNhomSize || "",
            MaSize: row.Size || "",
            TenCL: row.TenCL || "",
            TenDVCL: row.TenDVCL || "",
            GhiChu: row.ghiChu || "",
            NgayDK: ngayDK,
            NgayXuat: ngayXuat,
            NgayTao: null,
            NguoiTao: row.NguoiTao || userNameSave,
            SignNgDK: "",
            NgayKi: null,
            SignTBPNgDK: "",
            NgayKiTBPNgDK: null,
            NguoiUpdate: userNameSave,
            NgayUpdate: null,
            UserTBPNDK: null,
            NguoiKi: null,
            IsOk: 0
        }));

        await API.Post("Post", "UPDATEPHIEU", arrSave, "Cập nhật phiếu thành công", {
            para1: currentEditPhieu
        });

        $("#modalEditDKVT").modal("hide");
        await loadDataTong();
    }
    $("#btnConfirmtDeletePhieu").on("click", function () {



        //DeleteAllPhieu();

        DeletePhieuDNTH();

    });
    $("#btnNapLaiDanhSach").on("click", function () {
        const phieu = $("#maphieu").val();
        const trangThai = $("#trangThaiDuyet").val();
        const tuNgayStr = $("#filterTuNgay").val();
        const denNgayStr = $("#filterDenNgay").val();

        const tuNgay = tuNgayStr
            ? moment(tuNgayStr, "DD/MM/YYYY").startOf("day")
            : null;

        const denNgay = denNgayStr
            ? moment(denNgayStr, "DD/MM/YYYY").endOf("day")
            : null;

        let dataFilter = [...dataDangKyGoc];

        if (phieu && phieu !== "all") {
            dataFilter = dataFilter.filter(x => x.PhieuXKTP == phieu);
        }

        if (trangThai !== "all") {
            dataFilter = dataFilter.filter(x =>
                String(x.IsOk) === String(trangThai)
            );
        }

        if (tuNgay || denNgay) {
            dataFilter = dataFilter.filter(x => {
                if (!x.NgayXuat) return false;

                const ngay = moment(x.NgayXuat, "DD/MM/YYYY");

                if (!ngay.isValid()) return false;
                if (tuNgay && ngay.isBefore(tuNgay)) return false;
                if (denNgay && ngay.isAfter(denNgay)) return false;

                return true;
            });
        }

        const grid = $("#dxDataGridDanhSachDangKy").dxDataGrid("instance");
        grid.option("dataSource", dataFilter);
        grid.refresh();
    });
    // Khi đóng modal - reset tất cả checkbox và state
    $('#modalAddPhieu').on('hidden.bs.modal', function () {
        // Reset checkbox
        $('#itemList input[type="checkbox"]').prop('checked', false);
        $('#checkAll').prop('checked', false);
        $('#phieuDKXInput').val('');
        $('#maDHNhap').val('');
        $('#dropdownList').removeClass('show');


        // Reset state
        selectedItems = [];
        selectedRowsToSave = [];
        $("#txtSLVTDelete").empty();
        // Clear grid
        if (dxDataGridDangKyVatTu) {
            updateGrid(dxDataGridDangKyVatTu, []);
        }
    });

    // Khi mở modal - khởi tạo lại
    $('#modalAddPhieu').on('show.bs.modal', function () {
        GetMaxDot();

        renderList([])
        selectedItems = []
        selectedRowsToSave = [];
        phieuDKJoin = [];
        $('#maDHNhap').val('');
    });

    // Nút xóa tất cả vật tư
    $("#btnDeleteAllDKVT").on("click", function () {
        if (selectedRowsToDelete.length === 0) {
            showToast("warning", "Vui lòng chọn vật tư để xóa")
            return;
        }
        isDeleteAllDK = true;
        $("#txtSLVTDelete").text(` (${selectedRowsToDelete.length})`);
        $("#modalComfimrtDeleteVT").modal("show")
    })

    $("#modalComfimrtDeleteVT").on("hide.bs.modal", function () {
        $("#txtSLVTDelete").empty();

        $("#txtConfirmDeleteMsg").html(
            `Bạn có chắc chắn muốn xóa<span id="txtSLVTDelete"></span> phiếu này khỏi danh sách?`
        );

        rowDelete = {};
    });



    $("#modalEditDKVT").on("show.bs.modal", function () {
        if (isShowNgayCapAndGioCap) {
            $("#colNgayCap").removeClass("d-none")
            $("#colGioCap").removeClass("d-none")

        } else {
            $("#colNgayCap").addClass("d-none")
            $("#colGioCap").addClass("d-none")
        }
    })
    $("#modalEditDKVT").on("hide.bs.modal", function () {
        isShowNgayCapAndGioCap = false
    })

    $("#malenh").on("change", async function () {
        await GetPhieu();
        //await loadOptionsMauSize();
    })

    $("#modalTimNhanh").on("shown.bs.modal", function () {
        setTimeout(function () {
            $("#inputTimKiem").focus();
        }, 100);
    });

    $("#modalTimNhanh").on("hide.bs.modal", function () {
        $("#inputTimKiem").val("").trigger("input")
    });

    $("#btnTimNhanh").on("click", async function () {
        await loadDataTong();

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
                updateGrid(dxDataPhieuDKVT, lstDSPhieuDKVT);
            } else {
                // Lọc dữ liệu
                const dataFiltered = lstDSPhieuDKVT.filter(item =>
                    String(item.MaVT).trim().toLowerCase().includes(search) ||
                    String(item.MauVT).trim().toLowerCase().includes(search)
                );
                updateGrid(dxDataPhieuDKVT, dataFiltered);
            }
        }, 100); // Delay 300ms sau khi ngừng gõ
    });

    // check1.1



    $("#btnNapLai").on("click", async function () {
        const $btn = $(this);
        $btn.prop("disabled", true);
        try {
            await Promise.all([GetMaxDot(), loadDataTong()]);
            $("#phieuDKXInput").val("");
            $("#maDHNhap").val("");
            renderList([]);
            selectedItems = [];
            selectedRowsToSave = [];
            phieuDKJoin = [];
            updateGrid(dxDataGridDangKyVatTu, []);
        } finally {
            $btn.prop("disabled", false);
        }
    });
    $("#chungloaiSelect").on("change", function () {
        const maCLVT = $(this).val();
        selectedItemsChungLoai = [];

        if (maCLVT) {
            chungLoaiChiTietOptions = GetChungLoaiChiTiet(maCLVT);
        }

        loadChungLoai()

    })
});

function handleBack() {
    // Reset checkbox
    $('#itemList input[type="checkbox"]').prop('checked', false);
    $('#checkAll').prop('checked', false);
    $('#phieuDKXInput').val('');
    $('#maDHNhap').val('');
    $('#dropdownList').removeClass('show');

    // Reset state
    selectedItems = [];
    selectedRowsToSave = [];
    $("#txtSLVTDelete").empty();
    // Clear grid
    if (dxDataGridDangKyVatTu) {
        updateGrid(dxDataGridDangKyVatTu, []);
    }

    $("#modalAddPhieu").modal("hide")
}


/// DX DataGrid
//đăng ký

function renderSignCell(container, options, fieldName) {
    if (!options.data) return;

    const containerDiv = $("<div>").css({
        width: "100%",
        height: "40px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "6px",
        position: "relative"
    });

    if (options.data[fieldName] && options.data[fieldName] !== "checked") {
        const tenOnly = options.data[{ SignNgDK: "TenUserNgDK_Ten", SignTBPNgDK: "TenUserTBPNDK_Ten" }[fieldName]] ?? "";
        const $wrapper = $("<div>").css({ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" });
        $("<img>").attr("src", `/Images/SignYeuCauXuatKho/${options.data[fieldName]}?${Date.now()}`).css({ width: "70px", height: "35px" }).appendTo($wrapper);
        if (tenOnly) $("<span>").text(tenOnly).css({ fontSize: "11px", color: "#333", fontWeight: "bold" }).appendTo($wrapper);
        $wrapper.appendTo(containerDiv);
    }
    else if (options.data[fieldName] === "checked") {
        const userField = { SignNgDK: "HoTenNgDK", SignTBPNgDK: "HoTenTBPNDK" }[fieldName] ?? "";
        const hinhAnhField = { SignNgDK: "HinhAnhNgDK", SignTBPNgDK: "HinhAnhTBPNDK", SignMer: "HinhAnhMerSoatSet", SignTBPMer: "HinhAnhTBPMerSoatSet" }[fieldName] ?? "";
        const tenOnly = options.data[{ SignNgDK: "TenUserNgDK_Ten", SignTBPNgDK: "TenUserTBPNDK_Ten", SignMer: "TenUserMerSoatSet_Ten", SignTBPMer: "TenUserTBPMerSoatSet_Ten" }[fieldName]] ?? "";
        const userName = userField ? (options.data[userField] ?? "") : "";
        const hinhAnh = hinhAnhField ? (options.data[hinhAnhField] ?? "") : "";
        if (hinhAnh) {
            const $wrapper = $("<div>").css({ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" });
            $("<img>").attr("src", `/Images/NhanVien/${hinhAnh}`).css({ width: "70px", height: "35px", objectFit: "cover", borderRadius: "3px" }).on("error", function () { $(this).hide(); }).appendTo($wrapper);
            $("<span>").text(tenOnly || userName).css({ fontSize: "11px", color: "#333", fontWeight: "bold" }).appendTo($wrapper);
            $wrapper.appendTo(containerDiv);
        } else {
            $("<span>").text(userName).css({ fontSize: "12px", color: "#333", fontWeight: "bold" }).appendTo(containerDiv);
        }
    }

    let checkSign = "";
    const signNgDK = options.data.SignNgDK ?? "";
    const signTBPNgDK = options.data.SignTBPNgDK ?? "";


    if (fieldName === "SignNgDK") {
        checkSign = signNgDK ? "d-none" : "";
    } else if (fieldName === "SignTBPNgDK") {
        if (!signNgDK) checkSign = "d-none";
        else checkSign = signTBPNgDK ? "d-none" : "";
    }
    $("<input>")
        .attr("type", "checkbox")
        .addClass(checkSign)
        .css({
            cursor: "pointer",
            left: "4px",
            top: "5px",
            position: "absolute",
            width: "14px",
            height: "14px",
            accentColor: "#007bff"
        })
        .on("change", async function () {
            const rowData = options.data;

            const phieuXKTP = rowData.PhieuXKTP;

            if (fieldName === "SignTBPNgDK") {
                const isTBP = await checkQuyenKyTBP(rowData.NguoiKi);

                if (!isTBP && userNameSave != 'admin') {
                    showToast('error', 'Lỗi: Không thể kí. Bạn  không phải TBP của người tạo phiếu!!!')
                    $(this).prop("checked", false);
                    return;
                }
            }
            else (fieldName === "SignNgDK")
            {
                if (rowData.NguoiTao != userNameSave && userNameSave != 'admin') {
                    showToast('error', 'Lỗi: Không thể kí. Bạn  không phải người tạo phiếu!!!')

                    return;
                }
            }
            const allRows = dataDangKyGoc
                .filter(r => r.PhieuXKTP === phieuXKTP);


            let arrSave = allRows.map(r => ({
                ID: r.ID || 0,
                PhieuXKTP: r.PhieuXKTP || "",
                Dot: r.Dot || null,
                MaLenh: r.MaLenh || "",
                NguoiNhan: r.NguoiNhan || "",
                DiaChi: r.DiaChi || "",
                LyDo: r.LyDo || "",
                SLYC: r.SLYC || 0,
                SLTX: r.SLTX || 0,
                DonGia: r.DonGia || 0,
                ThanhTien: r.ThanhTien || 0,
                MaHang: r.MaHang || "",
                MaMau: r.MaMau || "",
                MaNhomSize: r.MaNhomSize || "",
                MaSize: r.MaSize || "",
                TenCL: r.TenCL || "",
                TenDVCL: r.TenDVCL || "",
                GhiChu: r.GhiChu || "",

                NgayDK: r.NgayDK || "",
                NgayXuat: r.NgayXuat || "",
                NgayTao: r.NgayTao || "",

                NguoiTao: r.NguoiTao || userNameSave,
                SignNgDK: fieldName === "SignNgDK" ? "checked" : (r.SignNgDK || ""),
                NgayKi: fieldName === "SignNgDK" ? new Date() : r.NgayKi,

                SignTBPNgDK: fieldName === "SignTBPNgDK" ? "checked" : (r.SignTBPNgDK || ""),
                NgayKiTBPNgDK: fieldName === "SignTBPNgDK" ? new Date() : r.NgayKiTBPNgDK,

                NguoiUpdate: userNameSave,
                NgayUpdate: "",

                UserTBPNDK: fieldName === "SignTBPNgDK" ? userNameSave : r.UserTBPNDK,


                NguoiKi: fieldName === "SignNgDK" ? userNameSave : r.NguoiKi,
                IsOk: r.IsOk || 0
            }));
            await UpdateKiTenPhieu(arrSave);
            if (fieldName === "SignNgDK") {

                sendNotify(userNameSave, "M.47.00.00", "Duyệt cấp thêm",
                    "Yêu cầu duyệt phiếu " + phieuXKTP,
                    "PKH", "ALL", 1);
            }
            //else if (fieldName === "SignTBPNgDK") {
            //    sendNotify(userNameSave, "M.47.00.00", "Duyệt cấp thêm",
            //        "Yêu cầu duyệt phiếu " + phieuXKTP,
            //        "PKH", "ALL", -1);
            //}
        })
        .appendTo(containerDiv);

    $("<i>")
        .addClass(`fa-solid fa-signature ${checkSign}`)
        .css({
            cursor: "pointer",
            color: "#007bff",
            fontSize: "14px",
            position: "absolute",
            top: "2px",
            right: "4px"
        })
        .on("click", async function () {
            const rowData = options.data;
            const phieuXKTP = rowData.PhieuXKTP;

            if (fieldName === "SignTBPNgDK") {
                const isTBP = await checkQuyenKyTBP(rowData.NguoiKi);

                if (!isTBP && userNameSave != 'admin') {
                    showToast('error', 'Lỗi: Không thể kí. Bạn  không phải TBP của người tạo phiếu!!!')

                    return;
                }
            }
            else (fieldName === "SignNgDK" && userNameSave != 'admin')
            {
                if (rowData.NguoiTao != userNameSave) {
                    showToast('error', 'Lỗi: Không thể kí. Bạn  không phải người tạo phiếu!!!')

                    return;
                }
            }
            showConfirmModalSign(async function () {


                const signatureImage = canvas.toDataURL('image/png');

                const allRows = dataDangKyGoc
                    .filter(r => r.PhieuXKTP === phieuXKTP);

                let arrSave = allRows.map(r => ({
                    ID: r.ID || 0,
                    PhieuXKTP: r.PhieuXKTP || "",
                    Dot: r.Dot || null,
                    MaLenh: r.MaLenh || "",
                    NguoiNhan: r.NguoiNhan || "",
                    DiaChi: r.DiaChi || "",
                    SLYC: r.SLYC || 0,
                    SLTX: r.SLTX || 0,
                    DonGia: r.DonGia || 0,
                    ThanhTien: r.ThanhTien || 0,
                    MaHang: r.MaHang || "",
                    MaMau: r.MaMau || "",
                    MaNhomSize: r.MaNhomSize || "",
                    MaSize: r.MaSize || "",
                    TenCL: r.TenCL || "",
                    TenDVCL: r.TenDVCL || "",
                    GhiChu: r.GhiChu || "",

                    NgayDK: r.NgayDK || "",
                    NgayXuat: r.NgayXuat || "",
                    NgayTao: r.NgayTao || "",

                    NguoiTao: r.NguoiTao || userNameSave,
                    SignNgDK: fieldName === "SignNgDK" ? signatureImage : r.SignNgDK,
                    NgayKi: fieldName === "SignNgDK" ? new Date() : r.NgayKi,

                    SignTBPNgDK: fieldName === "SignTBPNgDK" ? signatureImage : r.SignTBPNgDK,
                    NgayKiTBPNgDK: fieldName === "SignTBPNgDK" ? new Date() : r.NgayKiTBPNgDK,

                    NguoiUpdate: userNameSave,
                    NgayUpdate: "",

                    UserTBPNDK: fieldName === "SignTBPNgDK" ? userNameSave : r.UserTBPNDK,


                    NguoiKi: fieldName === "SignNgDK" ? userNameSave : r.NguoiKi,
                    IsOk: r.IsOk || 0
                }));
                await UpdateKiTenPhieu(arrSave);
                if (fieldName === "SignNgDK") {

                    sendNotify(userNameSave, "M.47.00.00", "Duyệt cấp thêm",
                        "Yêu cầu duyệt phiếu " + phieuXKTP,
                        "PKH", "ALL", 1);
                }
                $("#signatureModal").modal("hide");
                return true;
            });
        })
        .appendTo(containerDiv);

    containerDiv.appendTo(container);
    container.addClass("position-relative");
}
async function checkQuyenKyTBP(userID) {
    const data = await API.Get("GETTBP", { para1: userID });


    const tbpUserID = data?.[0]?.UserID || "";

    return tbpUserID === userNameSave;
}


function createViewDxGridDanhSachPhieuDKVT() {
    dxDataPhieuDKVT = $("#dxDataPhieuDKVT").dxDataGrid({
        dataSource: [],
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
                            $("#malenh").val(`${options.data.MaLenhSX}`).trigger("change");
                            setTimeout(() => {
                                $("#phieuxuathang").val(`${options.data.PhieuDK}`).trigger("change");
                            }, 300)

                            $("#modalTimNhanh").modal('hide');
                            $("#inputTimKiem").val('').trigger('input');
                            updateGrid(dxDataPhieuDKVT, []);
                        })

                    $wrapper.append($span, $btnNext).appendTo(container)
                }
            },
            {
                dataField: "MaLenh",
                caption: "Mã Lệnh Sản Xuất",
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
                            updateGrid(dxDataPhieuDKVT, []);
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
            { dataField: "MauSP", caption: "Màu SP", alignment: "center", minWidth: 120 },
            { dataField: "SizeInfo", caption: "Size SP", alignment: "center", minWidth: 120 },
            { dataField: "IsTV", caption: "IsTV", alignment: "center", minWidth: 100, visible: false },
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
                    const value = parseFloat(parseFloat(options.value || 0).toFixed(2));
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
function showConfirmModalSign(onConfirm) {
    $('#saveBtn').off('click').on('click', async function () {
        if (typeof onConfirm === 'function') {
            const result = await onConfirm();
            if (result === false) {
                return;
            }
        }
        $("#signatureModal").modal("hide");
    });
    $("#signatureModal").modal("show");
}

let canvas, ctx;
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

    //Ký nhanh
    $(document).on("change", "#chkXacNhanNhanh", async function () {
        if (!this.checked) return;
        const fakeStroke = [{ x: 0, y: 0, color: "#000", size: 2 }];
        signatureHistory.push(fakeStroke);
        const originalToDataURL = canvas.toDataURL.bind(canvas);
        canvas.toDataURL = () => "checked";

        $("#saveBtn").trigger("click");
        setTimeout(() => {
            canvas.toDataURL = originalToDataURL;
            signatureHistory.pop();
            $("#chkXacNhanNhanh").prop("checked", false);
        }, 100);
    });

    // Reset checkbox khi mở/đóng modal
    $('#signatureModal').on('shown.bs.modal', function () {
        $("#chkXacNhanNhanh").prop("checked", false);
    });




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

function setPenColor(color) {
    penColor = color;
    $('#penColor').val(color);
}

function setPenSize(size) {
    penSize = size;
    $('.pen-size-btn').removeClass('active');
    $(`.pen-size-btn[data-size="${size}"]`).addClass('active');
}
async function GetChungLoaiSelect() {

    const $maLenhSelect = $("#chungloaiSelect");

    // Destroy select2 trước khi khởi tạo lại
    if ($maLenhSelect.hasClass("select2-hidden-accessible")) {
        $maLenhSelect.select2("destroy");
    }

    $maLenhSelect.empty().append(`<option ></option>`);

    if (!Array.isArray(chungLoaiThuVienCache) || chungLoaiThuVienCache.length === 0) {
        const data = await API.Get("GETCHUNGLOAI");
        chungLoaiThuVienCache = Array.isArray(data) ? data : [];
    }
    const data = chungLoaiThuVienCache;
    if (data.length > 0) {
        const html = data.map(x => `<option value="${x.MaCLVT}">${x.ChungLoaiVatTu}</option>`).join('');
        $maLenhSelect.append(html);
    }

    $maLenhSelect.select2({
        dropdownParent: $("#modalThuVien")
    });
}


//async function loadChungLoai() {
//    const maLenh = $("#chungloaiSelect").val();

//    const data = await API.Get("GETTHUVIEN", { para1:maLenh});

//    if (data.length > 0) {
//        initFloatingTagBox();
//        createViewdxDataGridThuVien(data);
//        autoSelectSingleMau(data);
//    }
//}

async function loadChungLoai() {
    const maCLVT = $("#chungloaiSelect").val();

    if (!maCLVT) {
        if (dxDataGridThuVien) {
            dxDataGridThuVien.option("dataSource", []);
            dxDataGridThuVien.refresh();
        }
        return;
    }

    await loadSoLuong();
    const data = await API.Get("GETTHUVIEN", { para1: maCLVT });
    cacheSoLuong = dataSoLuong || [];

    if (data.length > 0) {
        initFloatingTagBox();
        if (dxDataGridThuVien) {
            dxDataGridThuVien.option("dataSource", data);
            dxDataGridThuVien.refresh();
        } else {
            createViewdxDataGridThuVien(data);
        }
        autoSelectSingleMau(data);
    } else if (dxDataGridThuVien) {
        dxDataGridThuVien.option("dataSource", []);
        dxDataGridThuVien.refresh();
    }
}


// ====== KHỞI TẠO 1 LẦN DUY NHẤT ======
let $floatingTagBox = null;
let floatingTagBoxInstance = null;
let activeCell = null; // { data, fieldName, $displayEl }

function initFloatingTagBox() {
    if ($floatingTagBox && floatingTagBoxInstance) {
        return;
    }

    // Tạo container floating gắn vào body
    $floatingTagBox = $("<div id='floatingTagBoxWrap'>").css({
        position: "fixed",
        zIndex: 99999,
        display: "none",
        background: "white",
        border: "1px solid #ddd",
        borderRadius: "6px",
        //boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        padding: "6px",
        minWidth: "220px"
    }).appendTo("body");

    floatingTagBoxInstance = $("<div>").appendTo($floatingTagBox).dxTagBox({
        items: [],
        valueExpr: "value",
        displayExpr: "text",
        searchEnabled: true,
        showSelectionControls: true,
        applyValueMode: "instantly",
        maxDisplayedTags: 3,
        width: "100%",
        opened: true,           // Luôn mở sẵn khi hiện
        deferRendering: false,
        onValueChanged: function (e) {
            //if (!activeCell) return;
            //saveActiveCell();
            //$floatingTagBox.hide();
            //activeCell = null;
            tempSelectedValue = e.value;
            if (activeCell && activeCell.fieldName === "SizeInfo") {
                saveActiveCell();
            }
        }
    }).dxTagBox("instance");



    // Click ra ngoài → đóng
    $(document).on("click.floatingTagBox", function (e) {
        if (!$(e.target).closest("#floatingTagBoxWrap, .dx-tagbox-popup-wrapper, .dx-overlay-wrapper").length) {
            $floatingTagBox.hide();
            activeCell = null;
        }
    });
}
$(document).off("click.floatingTagBox").on("click.floatingTagBox", function (e) {
    if (!$floatingTagBox || !$floatingTagBox.is(":visible")) return;

    const clickedInside =
        $(e.target).closest("#floatingTagBoxWrap").length > 0 ||
        $(e.target).closest(".dx-overlay-wrapper").length > 0 ||
        $(e.target).closest(".dx-tagbox-popup-wrapper").length > 0;

    if (!clickedInside) {
        closeFloatingTagBox();
    }
});
function saveActiveCell() {
    if (!activeCell) return;

    activeCell.data[activeCell.fieldName] = tempSelectedValue.map(v => {
        try { return typeof v === "string" ? JSON.parse(v) : v; }
        catch { return v; }
    });

    if (activeCell.fieldName === "SizeInfo") {
        reloadSoLuongWhenSelectSize(activeCell.data);
    } else if (activeCell.fieldName === "MauSP") {
        updateSoLuong(activeCell.data);
    }

    let displayText = "";

    if (activeCell.fieldName === "SizeInfo") {
        // Group theo MaNhomSize
        const grouped = {};
        activeCell.data[activeCell.fieldName].forEach(v => {
            const obj = typeof v === "object" ? v : {};
            const nhom = obj.MaNhomSize || "Khác";
            const size = obj.TenSize || v;
            if (!grouped[nhom]) grouped[nhom] = [];
            grouped[nhom].push(size);
        });
        // Format: "REG: S,M,L; BIG: XL,2XL"
        displayText = Object.entries(grouped)
            .map(([nhom, sizes]) => `${nhom}: ${sizes.join(", ")}`)
            .join("; ");

    } else if (activeCell.fieldName === "MauSP") {
        // ✅ Tra lại text từ mauSPOptions theo value (JSON string)
        displayText = tempSelectedValue.map(v => {
            // v là JSON string {"MaMau":"...","TenMau":"..."}
            const found = mauSPOptions.find(opt => opt.value === v);
            if (found) return found.text;

            // Fallback: parse trực tiếp nếu không tìm thấy trong options
            try {
                const parsed = typeof v === "string" ? JSON.parse(v) : v;
                return parsed.TenMau || v;
            } catch {
                return v;
            }
        }).join(", ");
    }

    activeCell.$displayEl.text(displayText || activeCell.placeholder);
    activeCell.$displayEl.css("color", displayText ? "#333" : "#aaa");
}

function closeFloatingTagBox() {
    saveActiveCell(); // ✅ Luôn lưu trước khi đóng
    $floatingTagBox.hide();
    activeCell = null;
}
function openFloatingTagBox(options, currentValue, cellData, fieldName, $displayEl, placeholder, $anchor) {
    floatingTagBoxInstance.close();
    floatingTagBoxInstance.option("items", options);
    floatingTagBoxInstance.option("value", currentValue.map(v =>
        typeof v === "object" ? JSON.stringify(v) : v
    ));

    // ✅ Sync tempSelectedValue với giá trị hiện tại của cell
    tempSelectedValue = currentValue.map(v =>
        typeof v === "object" ? JSON.stringify(v) : v
    );

    activeCell = { data: cellData, fieldName, $displayEl, placeholder };

    const offset = $anchor.offset();
    const winHeight = $(window).height();
    const dropdownHeight = 320;
    let top = offset.top + $anchor.outerHeight() + 2;
    if (top + dropdownHeight > winHeight) {
        top = offset.top - dropdownHeight - 2;
    }

    $floatingTagBox.css({
        top: top,
        left: offset.left,
        minWidth: Math.max($anchor.outerWidth(), 220)
    }).show();

    setTimeout(() => {
        floatingTagBoxInstance.open();
        floatingTagBoxInstance.focus();
    }, 0);
}
function createLazyTagBoxTemplate(fieldName, optionsList, placeholder) {
    return function (container, cellOptions) {
        const val = cellOptions.data[fieldName];
        const displayText = Array.isArray(val) && val.length
            ? val.map(v => typeof v === "object" ? (v.TenSize || v.TenMau || v) : v).join(", ")
            : "";

        // Chỉ render DIV + text — cực nhẹ, không có JS nặng
        const $cell = $("<div>").css({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
            minHeight: "32px",
            background: "white",
            userSelect: "none"
        });

        const $text = $("<span>")
            .text(displayText || placeholder)
            .css({
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: "13px",
                color: displayText ? "#333" : "#aaa"
            });

        const $icon = $("<i>").addClass("fa-light fa-chevron-down").css({
            fontSize: "11px", color: "#999", marginLeft: "4px", flexShrink: 0
        });

        $cell.append($text, $icon);
        container.append($cell);

        // Click → mở floating TagBox dùng chung
        $cell.on("click", function (e) {
            e.stopPropagation();
            const currentVal = Array.isArray(cellOptions.data[fieldName])
                ? cellOptions.data[fieldName] : [];
            openFloatingTagBox(optionsList, currentVal, cellOptions.data, fieldName, $text, placeholder, $cell);
        });
    };
}
// Sửa lại autoSelectSingleMau — lưu object thay vì string
function autoSelectSingleMau(dataSource) {
    if (mauSPOptions.length !== 1) return;

    // ✅ Lưu object { MaMau, TenMau } thay vì chỉ MaMau
    const autoObj = {
        MaMau: mauSPOptions[0].value,
        TenMau: mauSPOptions[0].text
    };

    dataSource.forEach(item => {
        if (!Array.isArray(item.MauSP) || item.MauSP.length === 0) {
            item.MauSP = [autoObj];
        }
    });

    dxDataGridThuVien.option("dataSource", [...dataSource]);
}

function GetChungLoaiChiTiet(maCLVT) {
    let result = [];

    $.ajax({
        url: `/api/DeNghiCapThemNPL/Get?action=GETCLCT_2&para1=${maCLVT}`,
        method: "GET",
        async: false, // <--- Quan trọng: Chuyển sang đồng bộ
        success: function (data) {
            if (data && data.length > 0) {
                result = data.map(item => ({
                    value: JSON.stringify({ MaCLCT: item.MaNhom, TenCLCT: item.TenNhom }),
                    text: item.TenNhom,
                    original: item
                }));
            }
        },
        error: function (err) {
            console.error("Lỗi API GetChungLoaiChiTiet:", err);
        }
    });

    return result;
}

function createChungLoaiSelectBoxTemplate(optionsList, placeholder) {
    return function (container, cellOptions) {
        const fieldName = "ChungLoaiChiTiet";
        const val = cellOptions.data[fieldName];

        const displayText = val ? (val.TenNhom || val) : "";

        const $cell = $("<div>").css({
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "4px 8px", border: "1px solid #ddd", borderRadius: "4px",
            cursor: "pointer", minHeight: "32px", background: "white"
        });

        const $text = $("<span>").text(displayText || placeholder).css({
            flex: 1, overflow: "hidden", textOverflow: "ellipsis", fontSize: "13px",
            color: displayText ? "#333" : "#aaa"
        });

        const $icon = $("<i>").addClass("fa-light fa-chevron-down").css({ fontSize: "11px", color: "#999" });

        $cell.append($text, $icon).appendTo(container);

        $cell.on("click", function (e) {
            e.stopPropagation();

            const $popup = $("<div>").appendTo("body").css({
                position: "absolute", zIndex: 10000,
                top: $(this).offset().top + $(this).outerHeight(),
                left: $(this).offset().left,
                width: $(this).outerWidth()
            });

            const selectInstance = $("<div>").appendTo($popup).dxSelectBox({
                items: optionsList,
                displayExpr: "text",
                valueExpr: "value",
                searchEnabled: true,
                opened: true,
                onValueChanged: function (args) {
                    const item = optionsList.find(x => x.value === args.value);
                    cellOptions.data[fieldName] = item ? { MaNhom: item.value, TenNhom: item.text } : null;

                    $text.text(item ? item.text : placeholder).css("color", "#333");
                    $popup.remove();
                },
                onClosed: function () { $popup.remove(); }
            }).dxSelectBox("instance");
        });
    };
}

function normalizeKey(rawKey) {
    return String(rawKey || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLowerCase();
}

function toNumberSafe(value) {
    if (value === null || value === undefined || value === "") return null;
    const num = parseFloat(String(value).replace(",", "."));
    return Number.isFinite(num) ? num : null;
}

function getSLDaXuatValue(rowData) {
    if (!rowData || typeof rowData !== "object") return 0;

    const aliases = [
        "SLDaXuat",
        "SoLuongDaXuat",
        "SLXuat",
        "SLCapPhat",
        "SoLuongXuat",
        "SLNhap"
    ];
    const normalizedAliases = aliases.map(normalizeKey);
    const keys = Object.keys(rowData);

    for (const key of keys) {
        const normalizedKey = normalizeKey(key);
        if (normalizedAliases.includes(normalizedKey)) {
            const value = toNumberSafe(rowData[key]);
            if (value !== null) return value;
        }
    }

    for (const key of keys) {
        const normalizedKey = normalizeKey(key);
        if (!normalizedKey.startsWith("sl") && !normalizedKey.startsWith("soluong")) continue;
        if (
            normalizedKey.includes("xuat") ||
            normalizedKey.includes("capphat") ||
            normalizedKey.includes("nhap")
        ) {
            const value = toNumberSafe(rowData[key]);
            if (value !== null) return value;
        }
    }

    return 0;
}

function updateSoLuong(item) {

    let totalSoLuong = 0;
    item.MauSP.forEach(mau => {
        item.SizeInfo.forEach(size => {
            const found = dataSoLuong.find(x =>
                x.MaMau === mau.MaMau &&
                x.DauSizeID === size.MaNhomSize &&
                x.SizeID === size.MaSize
            );
            if (found) {
                totalSoLuong += (Number(found.SoLuong) || 0);
            }
        });
    });

    item.SoLuong = totalSoLuong;

    const dinhMuc = parseFloat(String(item.DinhMuc ?? 0).replace(",", ".")) || 0;
    item.CapPhat = Math.round((totalSoLuong * dinhMuc) * 10000) / 10000;
    item.SLDK = item.CapPhat;

    if (dxDataGridThuVien) {
        dxDataGridThuVien.refresh();
    }
}


async function reloadSoLuongWhenSelectSize(item) {
    await loadSoLuong();
    updateSoLuong(item);
}
// module = M.12.00.01 
//title xác nhận phiếu kiểm kê 
//detail //Maha, vat ""
//sendTo ERP_PhongBan ->  KHo 
//BoPhan ERP_BoPhan ->  KhoPL or K hoNL  or TBP = All
//Status 1 Truong BP  Ha, 2 -> to truong Can
function sendNotify(UserID, ModuleID, title, detail, sendTo, BoPhan = "ALL", Status = -1) {

    const url = `/api/SendToNotification/PushNotification?` +
        `UserIDTao=${encodeURIComponent(UserID)}&` +
        `ModuleID=${encodeURIComponent(ModuleID)}&` +
        `Title=${encodeURIComponent(title)}&` +
        `Detail=${encodeURIComponent(detail)}&` +
        `SendTo=${encodeURIComponent(sendTo)}&` +
        `BoPhan=${encodeURIComponent(BoPhan)}&` +
        `Status=${Status}`
        ;

    $.ajax({
        url: url,
        type: "POST",
        contentType: false,
        processData: false,
        success: function (result) {
            console.log("Gửi thông báo thành công:", result);
        },
        error: function (xhr, status, error) {
            console.error("Lỗi gửi thông báo:", error);
        }
    });
}

function filterByTrangThai() {
    const trangThai = $("#trangThaiDuyet").val();
    const tuNgayStr = $("#filterTuNgay").val();
    const denNgayStr = $("#filterDenNgay").val();

    function parseDate(str) {
        if (!str) return null;
        const [d, m, y] = str.split("/");
        if (!d || !m || !y) return null;
        return new Date(y, m - 1, d);
    }

    const tuNgay = parseDate(tuNgayStr);
    const denNgay = parseDate(denNgayStr);
    if (denNgay) denNgay.setHours(23, 59, 59);

    let filtered = [...lstDataDangKyVatTu];

    if (trangThai === "done") {
        filtered = filtered.filter(item =>
            item.SignTBPMer && item.SignTBPMer.trim() !== ''
        );
    } else if (trangThai === "pending") {
        filtered = filtered.filter(item =>
            !item.SignTBPMer || item.SignTBPMer.trim() === ''
        );
    }

    if (tuNgay || denNgay) {
        filtered = filtered.filter(item => {
            if (!item.NgayTH) return false;
            const ngayTH = new Date(item.NgayTH);
            if (tuNgay && ngayTH < tuNgay) return false;
            if (denNgay && ngayTH > denNgay) return false;
            return true;
        });
    }

    updateGrid(dxDataGridDanhSachDangKy, filtered);
    setTimeout(() => mergeIsNPLCells(), 100);
}

function showGlobalLoading(text = "Đang xử lý...") {
    $("#globalLoadingText").text(text);
    $("#globalLoadingOverlay").css("display", "flex");
}

function hideGlobalLoading() {
    $("#globalLoadingOverlay").css("display", "none");
}
$("#btnAddRow").on("click", async function () {
    const malenhselect = ms.getValues().join(';');

    /* if (arrMau.length == 0) {*/
    const data = await API.Get("GetMau", { para1: malenhselect });
    arrMau = data;
    //}
    //if (arrSize.length == 0) {
    const data2 = await API.Get("GetSize", { para1: malenhselect });
    arrSize = data2;
    //}

    const grid = $("#table-create").dxDataGrid("instance");

    let dataGrid = grid.option("dataSource") || [];

    const columns = grid.option("columns");
   


    const object = {
        STT: 0,
        MaHang: "",
        TenCL: "",
        Color: "",
        Size: "",
        MaNhomSize: "",
        TenDVCL: "",
        SLYC: "",
        DonGia: "",
        ThanhTien: "",
        ghiChu: "",
        MaLenh: ""
    }
    // Kiểm tra nếu chỉ có 1 mã lệnh được chọn
    const maHangSelect = ms.getMaHangValue();
    const arrMaHang = (maHangSelect || "")
        .split(';')
        .map(item => {
            const [MaHang, TenHang, MaLenh] = item.trim().split(',');
            return {
                MaHang: MaHang?.trim(),
                TenHang: TenHang?.trim(),
                MaLenh: MaLenh?.trim()
            };
        })
        .filter(x => x.MaHang);

    if (arrMaHang.length === 1) {
        const onlyHang = arrMaHang[0];

        // Tự động gán MaHang, MaLenh
        object.MaHang = onlyHang.MaHang;
        object.MaLenh = onlyHang.MaLenh || "";

        // Tự động gán TenCL, TenDVCL
        const arrCL = ms.getTenCLValue();
        const listCL = arrCL.split('; ').map(x => {
            const parts = x.split(',');
            return {
                MaHang: parts[0] || '',
                TenCL: parts[1] || '',
                TenDVCL: parts[2] || ''
            };
        });
        const objCL = listCL.find(x => x.MaHang === onlyHang.MaHang);
        if (objCL) {
            object.TenCL = objCL.TenCL || '';
            object.TenDVCL = objCL.TenDVCL || '';
        }

        // Tự động gán Color nếu chỉ có 1 màu
        const arrMauFiltered = arrMau.filter(m => m.MaHang === onlyHang.MaHang);
        if (arrMauFiltered.length === 1) {
            object.Color = arrMauFiltered[0].MaMau || '';
        }

        // Tự động gán Size nếu chỉ có 1 size
        const arrSizeFiltered = arrSize.filter(s => s.MaHang === onlyHang.MaHang);
        if (arrSizeFiltered.length === 1) {
            object.Size = arrSizeFiltered[0].MaSize || '';
            object.MaNhomSize = arrSizeFiltered[0].MaNhomSize || '';
        }
    }
    if (dataGrid.length === 1 && dataGrid[0]._isEmptyRow) {
        dataGrid = [];
    }
   
    dataGrid.push(object);

    // cập nhật datasource
    grid.option("dataSource", dataGrid);

    // refresh grid
   
    //grid.refresh();

});
function initGridCreate(data) {
    const columns = [
        {
            caption: "STT",
            width: 50,
            alignment: "center",
            allowEditing: false,
            cellTemplate: function (container, options) {
                container.text(options.rowIndex + 1);
            }
        },
        {
            caption: "Mã hàng",
            dataField: "MaHang",
            width: 200,
            alignment: "center",
            setCellValue: function (newData, value, currentRowData) {
                newData.MaHang = value;

                const maHangSelect = ms.getMaHangValue();

                const arrMaHang = (maHangSelect || "")
                    .split(';')
                    .map(item => {
                        const [MaHang, TenHang, MaLenh] = item.trim().split(',');

                        return {
                            MaHang: MaHang?.trim(),
                            TenHang: TenHang?.trim(),
                            MaLenh: MaLenh?.trim()
                        };
                    })
                    .filter(x => x.MaHang);

                const found = arrMaHang.find(m => m.MaHang === value);

                const maLenh = found?.MaLenh || null;
                newData.MaLenh = maLenh;

                newData.Color = null;
                newData.Size = null;
                newData.TenDVCL = null;
                newData.TenCL = null;

                const arrCL = ms.getTenCLValue();

                const list = arrCL.split('; ').map(x => {
                    const parts = x.split(',');
                    return {
                        MaHang: parts[0] || '',
                        TenCL: parts[1] || '',
                        TenDVCL: parts[2] || ''
                    };
                });

                const obj = list.find(x => x.MaHang === value);

                if (obj) {
                    newData.TenCL = obj?.TenCL || '';
                    newData.TenDVCL = obj?.TenDVCL || '';
                }
                // Lọc màu theo mã hàng mới
                const arrMauFiltered = value
                    ? arrMau.filter(m => m.MaHang === value)
                    : [];

                // Nếu chỉ có 1 màu thì tự gán luôn
                if (arrMauFiltered.length === 1) {
                    newData.Color = arrMauFiltered[0].MaMau || '';
                }

                const arrSizeFiltered = value
                    ? arrSize.filter(s => s.MaHang === value)
                    : [];

                if (arrSizeFiltered.length === 1) {
                    newData.Size = arrSizeFiltered[0].MaSize || "";
                    newData.MaNhomSize = arrSizeFiltered[0].MaNhomSize || "";
                } else {
                    newData.Size = null;
                    newData.MaNhomSize = null;
                }




            },
            cellTemplate: function (cellElement, cellInfo) {
                const maHang = cellInfo.value;
                if (maHang) {
                    const maHangSelect = ms.getMaHangValue();
                    const arrMaHang = (maHangSelect || "")
                        .split(';')
                        .map(item => {
                            const [MaHang, ...rest] = item.trim().split(',');
                            return {
                                MaHang: MaHang?.trim(),
                                TenHang: rest.join(',')?.trim()
                            };
                        })
                        .filter(x => x.MaHang);

                    const found = arrMaHang.find(m => m.MaHang === maHang);
                    cellElement.text(found ? found.TenHang : maHang);
                }
            },

            editCellTemplate: function (cellElement, cellInfo) {

                const maHangSelect = ms.getMaHangValue();
                //const arrMaHang = maHangSelect
                //    ? maHangSelect.split(';').map(item => {
                //        const [MaHang, TenHang] = item.trim().split(',');
                //        return { MaHang: MaHang?.trim(), TenHang: TenHang?.trim() };
                //    }).filter(x => x.MaHang)
                //    : [];
                const arrMaHang = (maHangSelect || "")
                    .split(';')
                    .map(item => {
                        const [MaHang, ...rest] = item.trim().split(',');
                        return {
                            MaHang: MaHang?.trim(),
                            TenHang: rest.join(',')?.trim()
                        };
                    })
                    .filter(x => x.MaHang);

                if (arrMaHang.length === 1 && !cellInfo.value) {
                    cellInfo.setValue(arrMaHang[0].MaHang);
                }


                $("<div>").appendTo(cellElement).dxSelectBox({
                    dataSource: arrMaHang,
                    displayExpr: function (item) {
                        return item ? `${item.TenHang}` : "";
                    },
                    //opened: true,
                    valueExpr: "MaHang",
                    value: cellInfo.value || (arrMaHang.length === 1 ? arrMaHang[0].MaHang : null),
                    placeholder: "-- Chọn mã hàng --",
                    searchEnabled: true,
                    showClearButton: true,
                    onValueChanged: function (e) {
                        cellInfo.setValue(e.value);

                        //const arrMauFiltered = e.value
                        //    ? arrMau.filter(m => m.MaHang === e.value)
                        //    : arrMau;

                        //// Nếu chỉ còn 1 màu thì tự gán luôn
                        //if (arrMauFiltered.length === 1) {
                        //    grid.cellValue(cellInfo.rowIndex, "Color", arrMauFiltered[0].MaMau);

                        //}
                        //else {
                        //    grid.cellValue(cellInfo.rowIndex, "Color",null);
                        //}
                        grid.repaintRows([cellInfo.rowIndex]);
                    }
                });
            },



        },
        {
            caption: "Phẩm chất sản phẩm",
            alignment: "center",
            columns: [
                {
                    caption: "Item",
                    dataField: "TenCL",
                    width: 200,
                    alignment: "center",
                },
                {
                    caption: "Color",
                    dataField: "Color",
                    width: 150,
                    alignment: "center",
                    cellTemplate: function (cellElement, cellInfo) {
                        const maMau = cellInfo.value ?? cellInfo.data?.Color;
                        if (maMau) {
                            const found = arrMau.find(m => m.MaMau === maMau);
                            cellElement.text(found ? found.TenMau : maMau);
                        }
                    },
                    editCellTemplate: function (cellElement, cellInfo) {

                        // Lấy maHang của dòng hiện tại
                        const maHangCurrent = cellInfo.data.MaHang;

                        // Lọc arrMau theo maHang của dòng
                        const arrMauFiltered = maHangCurrent
                            ? arrMau.filter(m => m.MaHang === maHangCurrent)
                            : arrMau;

                        if (arrMauFiltered.length === 1 && !cellInfo.value) {
                            cellInfo.setValue(arrMauFiltered[0].MaMau);
                        }

                        $("<div>").appendTo(cellElement).dxSelectBox({
                            dataSource: arrMauFiltered,
                            displayExpr: "TenMau",
                            valueExpr: "MaMau",
                            opened: true,
                            value: cellInfo.value || null,
                            placeholder: "-- Chọn màu --",
                            searchEnabled: true,
                            showClearButton: true,
                            onValueChanged: function (e) {
                                cellInfo.setValue(e.value);
                            }
                        });
                    }

                },
                {
                    caption: "Size",
                    dataField: "Size",
                    width: 150,
                    alignment: "center",

                    cellTemplate: function (cellElement, cellInfo) {
                        const maSize = cellInfo.value;
                        if (maSize) {
                            const found = arrSize.find(s => s.MaSize === maSize &&
                                s.MaNhomSize === cellInfo.data.MaNhomSize);
                            if (found) {
                                cellElement.text(`${found.NhomSize}:${found.TenSize}`);
                            } else {
                                cellElement.text(maSize);
                            }
                        }
                    },

                  
                    editCellTemplate: function (cellElement, cellInfo) {
                        const maHangCurrent = cellInfo.data?.MaHang;
                        const arrSizeFiltered = maHangCurrent
                            ? arrSize.filter(s => s.MaHang === maHangCurrent)
                            : arrSize;

                        // Tạo key composite cho từng item — gán thẳng vào data
                        const dataSource = arrSizeFiltered.map(s => ({
                            ...s,
                            _key: `${s.MaSize}||${s.MaNhomSize}`
                        }));

                   
                        const currentKey = cellInfo.value
                            ? `${cellInfo.value}||${cellInfo.data?.MaNhomSize}`
                            : null;
                        console.log(currentKey);
                        $("<div>").appendTo(cellElement).dxSelectBox({
                            dataSource: dataSource,
                            displayExpr: function (item) {
                                return item ? `${item.NhomSize}:${item.TenSize}` : "";
                            },
                            valueExpr: "_key",          // ← dùng string field thay vì function
                            value: currentKey || null,
                            placeholder: "-- Chọn size --",
                            searchEnabled: true,
                            showClearButton: true,
                            onValueChanged: function (e) {
                                const selectedItem = e.component.option("selectedItem");
                                if (selectedItem) {
                                    cellInfo.setValue(selectedItem.MaSize);
                                    cellInfo.component.cellValue(
                                        cellInfo.rowIndex,
                                        "MaNhomSize",
                                        selectedItem.MaNhomSize || ""
                                    );
                                } else {
                                    cellInfo.setValue(null);
                                    cellInfo.component.cellValue(cellInfo.rowIndex, "MaNhomSize", "");
                                }
                            }
                        });
                    }
                },
            ],
        },
        {
            caption: "NhomSize",
            dataField: "MaNhomSize",
            alignment: "center",
            visible: false,
        },
        {
            caption: "Mã lệnh",
            dataField: "MaLenh",
            alignment: "center",
            visible: false,
        },
        {
            caption: "ĐVT",
            dataField: "TenDVCL",
            alignment: "center",
            width: 80,
        },
        {
            caption: "Yêu cầu",
            dataField: "SLYC",
            alignment: "center",
            width: 90,
            dataType: "number",
        },
        //{
        //    caption: "Thực Xuất\n(Acctual delivery)",
        //    dataField: "thucXuat",
        //    alignment: "center",
        //    width: 100,
        //    dataType: "number",
        //},
        {
            caption: "Đơn giá (VNĐ)",
            dataField: "DonGia",
            alignment: "center",
            width: 110,
            dataType: "number",
            format: { type: "fixedPoint", precision: 0 },
        },
        {
            caption: "Thành tiền (VNĐ)",
            dataField: "ThanhTien",
            alignment: "center",
            width: 120,
            dataType: "number",
            format: { type: "fixedPoint", precision: 0 },
            calculateCellValue: function (rowData) {
                return (rowData.DonGia || 0) * (rowData.SLYC || 0);
            },
        },
        {
            caption: "Ghi chú",
            dataField: "ghiChu",
            alignment: "center",
            width: 120,
        },
    ];

    $("#table-create").dxDataGrid({
        dataSource: data,
        columns: columns,
        showBorders: true,
        showColumnLines: true,
        showRowLines: true,
        rowAlternationEnabled: true,
        columnAutoWidth: false,
        width: "100%",

        onRowInserting: function (e) {
            // Tự động tăng STT
            const grid = $("#table-create").dxDataGrid("instance");
            const items = grid.getDataSource().items();
            e.data.STT = items.length + 1;
        },
        summary: {
            totalItems: [
                {
                    column: "ThanhTien",
                    summaryType: "sum",
                    valueFormat: { type: "fixedPoint", precision: 0 },
                    displayFormat: "Tổng: {0} VNĐ",
                },
            ],
        },
        scrolling: {
            mode: "standard",
            showScrollbar: "always"  // luôn hiện scrollbar, tránh bị giật width
        },
        paging: {
            enabled: false,
        },
        onCellPrepared: function (e) {
            if (e.rowType === "header") {
                e.cellElement.css({
                    "background-color": "#2c3e50",
                    "color": "#ffffff",
                    "font-weight": "bold"
                });
            }
        },
        editing: {
            mode: "cell",
            allowAdding: true,
            allowUpdating: true,
            allowDeleting: true,
            newRowPosition: "last",   // thêm dòng mới ở cuối
            useIcons: true,
        },
    });
}
async function SavePhieuXuat() {
    try {
        const grid = $("#table-create").dxDataGrid("instance");
        const rows = grid.getDataSource().items() || [];

        if (!rows.length) {
            //alert("Chưa có dữ liệu để lưu.");
            showToast('error', 'Chưa có dữ liệu để lưu', 2000);
            return;
        }

        // Validate dữ liệu cơ bản
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            if (!row.MaHang) {

                showToast('error', `Dòng ${i + 1}: Vui lòng chọn Mã hàng.`, 2000);
                return;
            }

            if (!row.Color) {

                showToast('error', `Dòng ${i + 1}: Vui lòng chọn màu.`, 2000);
                return;
            }

            if (!row.Size) {

                showToast('error', `Dòng ${i + 1}: Vui lòng chọn Size.`, 2000);
                return;
            }

            if (!row.SLYC || row.SLYC <= 0) {

                showToast('error', `Dòng ${i + 1}: Số lượng yêu cầu phải lớn hơn 0.`, 2000);
                return;
            }

            if (!row.DonGia || row.DonGia < 0) {

                showToast('error', `Dòng ${i + 1}: Đơn giá không hợp lệ.`, 2000);
                return;
            }
        }

        // Dữ liệu header nếu bạn có form ngoài grid thì lấy ở đây
        // Ví dụ: const phieuXKTP = $("#txtPhieuXKTP").val();
        //const phieuXKTP = $("#txtPhieuXKTP").val() || null;
        //const dot = $("#txtDot").val() ? parseInt($("#txtDot").val()) : null;
        //const maLenh = $("#txtMaLenh").val() || null;
        const nguoiNhan = $("#m-nguoi-nhan").val() || null;
        const diaChi = $("#m-dia-chi").val() || null;
        const lyDo = $("#m-ly-do").val() || null;
        if (!nguoiNhan) {

            showToast('error', `Vui lòng nhập người nhận.`, 2000);
            return;
        }
        if (!diaChi) {

            showToast('error', `Vui lòng nhập địa chỉ.`, 2000);
            return;
        }
        const ngayDK = ddmmyyyyToYmd($("#tuNgay").val());
        const ngayXuat = ddmmyyyyToYmd($("#ngayCap").val());
        // Map data từ grid sang đúng structure C#
        const data = rows.map((row, index) => {
            const thanhTien = (Number(row.DonGia) || 0) * (Number(row.SLYC) || 0);

            return {
                ID: row.ID || 0,
                PhieuXKTP: 0,
                Dot: 0,
                MaLenh: row.MaLenh,
                NguoiNhan: nguoiNhan,
                DiaChi: diaChi,
                LyDo: lyDo,
                SLYC: row.SLYC != null ? Number(row.SLYC) : null,
                SLTX: row.SLTX != null ? Number(row.SLTX) : null,
                DonGia: row.DonGia != null ? Number(row.DonGia) : null,
                ThanhTien: thanhTien,
                MaHang: row.MaHang || null,
                MaMau: row.Color || null,
                MaNhomSize: row.MaNhomSize || null,
                MaSize: row.Size || null,
                TenCL: row.TenCL || null,
                TenDVCL: row.TenDVCL || null,
                GhiChu: row.ghiChu || null,
                NgayDK: ngayDK || null,
                NgayXuat: ngayXuat || null,
                NgayTao: null,
                NguoiTao: userNameSave || null,
                SignNgDK: null,
                NgayKi: null,
                SignTBPNgDK: null,
                NgayKiTBPNgDK: null,
                NguoiUpdate: userNameSave || null,
                NgayUpdate: null,
                UserTBPNDK: row.UserTBPNDK || null,
                NguoiKi: row.NguoiKi || null,
                IsOk: row.IsOk != null ? parseInt(row.IsOk) : 0
            };
        });


        await API.Post("Post", "POST", data, "Lưu phiếu thành công");
        //resetModalState();
        grid.refresh();
        $("#modalAddPhieu").modal("hide");
        showToast('success', 'Lưu thành công')
        await loadDataTong();
    } catch (error) {
        console.error("Có lỗi xảy ra khi lưu phiếu xuất: " + error.message);
        //alert("Có lỗi xảy ra khi lưu phiếu xuất: " + error.message);
    }
}
async function GetMaxDot() {
    const data = await API.Get("GETMAXDOT");
    dot = data[0].DotNew;
    $("#m-so-phieu").val(`PXKTP_${dot}`);
}

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
function createViewDangKyVatTu(data) {
    dataDangKyGoc = data || [];
    const safeData = dataDangKyGoc.map(item => ({
        ID: item.ID || 0,
        PhieuXKTP: item.PhieuXKTP || "",
        MaLenh: item.MaLenh || "",
        TenHang: item.TenHang || "",
        MaHang: item.MaHang || "",
        TenCL: item.TenCL || "",
        TenDVCL: item.TenDVCL || "",
        TenMau: item.TenMau || "",
        MaMau: item.MaMau || "",
        NhomSize: item.NhomSize || "",
        TenSize: item.TenSize || "",
        MaSize: item.MaSize || "",
        MaNhomSize: item.MaNhomSize || "",
        SLYC: item.SLYC || 0,
        SLTX: item.SLTX || 0,
        DonGia: item.DonGia || 0,
        ThanhTien: item.ThanhTien || 0,
        NguoiNhan: item.NguoiNhan || "",
        DiaChi: item.DiaChi || "",
        LyDo: item.LyDo || "",
        NgayDK: item.NgayDK || "",
        NgayXuat: item.NgayXuat || "",
        GhiChu: item.GhiChu || "",
        NguoiTao: item.NguoiTao || "",
        SignNgDK: item.SignNgDK || "",
        SignTBPNgDK: item.SignTBPNgDK || "",
        IsOk: item.IsOk || 0,
        TenNguoiLap: item.TenNguoiLap || "",
    }));
    $("#dxDataGridDanhSachDangKy").dxDataGrid({
        dataSource: safeData,
        showBorders: true,
        showColumnLines: true,
        showRowLines: true,
        rowAlternationEnabled: true,
        columnAutoWidth: false,
        width: "100%",
        selection: {
            mode: "single"
        },
        grouping: {
            autoExpandAll: true
        },

        groupPanel: {
            visible: false
        },
        paging: {
            enabled: false,
        },

        scrolling: {
            mode: "standard",
            showScrollbar: "always"
        },

        editing: {
            allowAdding: false,
            allowUpdating: false,
            allowDeleting: false,
        },

        columns: [
            {
                caption: "STT",
                width: 50,
                alignment: "center",
                allowSorting: false,
                allowFiltering: false,
                cellTemplate: function (container, options) {
                    if (options.rowType !== "data") return;

                    const grid = options.component;

                    const dataRows = grid.getVisibleRows()
                        .filter(r => r.rowType === "data");

                    const index = dataRows.findIndex(r => r.key === options.key);

                    container.text(index + 1);
                }
            },
            {
                dataField: "PhieuXKTP",
                caption: "",
                alignment: "center",
                width: 180,
                groupIndex: 0,
                sortOrder: "desc",

                groupCellTemplate: function (container, options) {

                    const items = options.data?.items || [];
                    const firstItem = items[0] || {};

                    $("<div>")
                        .css({
                            fontWeight: "bold",
                            padding: "4px 8px",
                            fontSize: "13px"
                        })
                        .html(`
                Phiếu: ${firstItem.PhieuXKTP || ""}
            `)
                        .appendTo(container);
                }
            },
            {
                caption: "Mã lệnh",
                dataField: "MaLenh",
                width: 110,
                alignment: "center",
            },
            {
                caption: "Mã hàng",
                dataField: "TenHang",
                width: 170,
                alignment: "center",
            },

            {
                caption: "Phẩm chất sản phẩm",
                alignment: "center",
                columns: [
                    {
                        caption: "Item",
                        dataField: "TenCL",
                        width: 120,
                        alignment: "center",
                    },
                    {
                        caption: "Color",
                        dataField: "TenMau",
                        width: 150,
                        alignment: "center",
                    },
                    {
                        caption: "Size",
                        width: 150,
                        minWidth: 150,
                        maxWidth: 150,
                        allowResizing: false,
                        alignment: "center",
                        calculateCellValue: function (rowData) {
                            return `${rowData.NhomSize || ''}:${rowData.TenSize || ''}`;
                        }
                    }
                ]
            },

            {
                caption: "ĐVT",
                dataField: "TenDVCL",
                alignment: "center",
                width: 80,
            },

            {
                caption: "Yêu cầu",
                dataField: "SLYC",
                alignment: "center",
                width: 90,
                dataType: "number",
            },

            {
                caption: "Đơn giá (VNĐ)",
                dataField: "DonGia",
                alignment: "center",
                width: 120,
                dataType: "number",
                format: { type: "fixedPoint", precision: 0 },
            },

            {
                caption: "Thành tiền(VNĐ)",
                dataField: "ThanhTien",
                alignment: "center",
                width: 150,
                dataType: "number",
                format: { type: "fixedPoint", precision: 0 },
            },
            {
                caption: "Người nhận",
                dataField: "NguoiNhan",
                width: 180,
                alignment: "center",
            },
            {
                caption: "Địa chỉ",
                dataField: "DiaChi",
                width: 220,
                alignment: "center",
            },
            {
                caption: "Lý do",
                dataField: "LyDo",
                width: 220,
                alignment: "center",
            },
            {
                caption: "Ngày đăng ký",
                dataField: "NgayDK",
                width: 180,
                alignment: "center",

            },
            {
                caption: "Ngày yêu cầu",
                dataField: "NgayXuat",
                width: 180,
                alignment: "center",

            },
            {
                caption: "Ghi chú",
                dataField: "GhiChu",
                alignment: "center",
                width: 240,
            },

            // ===== KÝ TÊN =====

            {
                dataField: "SignNgDK",
                caption: "Người lập",
                width: 140,
                minWidth: 140,
                maxWidth: 140,
                allowResizing: false,
                alignment: "center",
                cellTemplate(container, options) {
                    renderSignCell(container, options, "SignNgDK");
                }
            },

            {
                dataField: "SignTBPNgDK",
                caption: "Trưởng bộ phận",
                width: 140,
                minWidth: 140,
                maxWidth: 140,
                allowResizing: false,
                alignment: "center",
                cellTemplate(container, options) {
                    renderSignCell(container, options, "SignTBPNgDK");
                }
            }
        ],

        summary: {
            totalItems: [
                {
                    column: "ThanhTien",
                    summaryType: "sum",
                    valueFormat: {
                        type: "fixedPoint",
                        precision: 0
                    },
                    displayFormat: "{0} VNĐ",
                }
            ]
        },

        onCellPrepared: function (e) {

            if (e.rowType === "header") {
                e.cellElement.css({
                    "background-color": "#2c3e50",
                    "color": "#ffffff",
                    "font-weight": "bold",
                    "text-align": "center",
                    "vertical-align": "middle"
                });
            }

            if (e.rowType === "data") {
                $(e.cellElement).addClass("text-center");
                $(e.cellElement).css("vertical-align", "middle");

                const mergeFields = ["NguoiNhan", "DiaChi","LyDo", "NgayDK", "NgayXuat", "MaHang", "SignTBPNgDK", "SignNgDK"];
                if (!mergeFields.includes(e.column.dataField)) return;

                // Key merge theo PhieuDK + MaNPL
                const currentKey = `${e.data.PhieuXKTP}`;
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
        //,onToolbarPreparing: function (e) {
        //    e.toolbarOptions.visible = true;
        //    e.toolbarOptions.items = e.toolbarOptions.items || [];
        //    console.log("toolbar preparing", e.toolbarOptions.items);
        //    e.toolbarOptions.items.push({
        //        location: "after",
        //        widget: "dxButton",
        //        options: {
        //            icon: "xlsxfile",
        //            text: "Xuất Excel",
        //            type: "success",
        //            stylingMode: "contained",
        //            onClick: function () {
        //                exportPhieuXuatKhoExcel(dataDangKyGoc);
        //            }
        //        }
        //    });
        //}
    });
}
async function loadDataTong() {
    const data = await API.Get("GETALL");
    createViewDangKyVatTu(data);
}
//$('#dtpTuNgayFilter').datetimepicker({
//    format: 'DD/MM/YYYY',
//    minDate: moment().startOf('day')
//});

//$('#dtpDenNgayFilter').datetimepicker({
//    format: 'DD/MM/YYYY',
//    minDate: moment().startOf('day')
//});
//$("#filterTuNgay, #filterDenNgay").on("change", function () {

//    const value = $(this).val();

//    if (!value) return;

//    const selected = moment(value, "DD/MM/YYYY");
//    const today = moment().startOf("day");

//    if (selected.isBefore(today)) {

//        alert("Không được chọn ngày trong quá khứ");

//        $(this).val(today.format("DD/MM/YYYY"));
//    }
//});


//Edit phiếu
async function initMaHangEditSelect() {
    const data = await API.Get("GetMaHang");
    const $select = $("#m-ma-hang-edit");

    if (msEdit) {
        msEdit.destroy();
        msEdit = null;
    }

    $select.empty();

    if (data && data.length > 0) {
        const html = data.map(x => `
            <option value="${x.MaLenh}"
                    data-mahang="${x.MaHang}"
                    data-malenh="${x.MaLenh}"
                    data-tenhang="${x.TenHang}"
                    data-tencl="${x.TenCL}"
                    data-tendvcl="${x.TenDVCL}">
                ${x.Display}
            </option>
        `).join("");

        $select.append(html);
    }

    msEdit = new MultiSelect(document.getElementById("m-ma-hang-edit"), {
        placeholder: "-- Chọn mã hàng --"
    });
}
async function loadOptionsMauSizeEdit() {
    const maLenhJoin = msEdit.getValues().join(";");

    if (!maLenhJoin) {
        arrMauEdit = [];
        arrSizeEdit = [];
        return;
    }

    arrMauEdit = await API.Get("GetMau", { para1: maLenhJoin }) || [];
    arrSizeEdit = await API.Get("GetSize", { para1: maLenhJoin }) || [];

    console.log(arrSizeEdit)
}
$("#btnAddRowEdit").on("click", async function () {
    if (!msEdit || msEdit.getValues().length === 0) {
        showToast("warning", "Vui lòng chọn mã hàng");
        return;
    }

    await loadOptionsMauSizeEdit();

    dxDataGridEditPhieu.addRow();
});
function createViewDxDataGridEditPhieuXKTP() {
    dxDataGridEditPhieu = $("#dxDataGridEditVatTu").dxDataGrid({
        dataSource: [{
            ID: 0,
            PhieuXKTP: currentEditPhieu,
            Dot: dot || null,
            MaLenh: "",
            MaHang: "",
            Color: "",
            Size: "",
            MaNhomSize: "",
            TenCL: "",
            TenDVCL: "",
            SLYC: 0,
            DonGia: 0,
            ThanhTien: 0,
            ghiChu: "",
            NguoiTao: userNameSave,
            // Thêm flag để biết đây là dòng trống
            _isEmptyRow: true
        }],
        showBorders: true,
        showColumnLines: true,
        showRowLines: true,
        rowAlternationEnabled: true,
        columnAutoWidth: false,
        width: "100%",
        repaintChangesOnly: false,
        renderAsync: false,

        scrolling: {
            mode: "standard",
            showScrollbar: "always"
        },

        paging: {
            enabled: false
        },

        editing: {
            mode: "cell",
            allowAdding: true,
            allowUpdating: true,
            allowDeleting: true,
            newRowPosition: "last",
            useIcons: true
        },

        columns: [
            {
                caption: "STT",
                width: 50,
                alignment: "center",
                allowEditing: false,
                cellTemplate: function (container, options) {
                    container.text(options.rowIndex + 1);
                }
            },
            {
                caption: "Mã hàng",
                dataField: "MaHang",
                width: 200,
                alignment: "center",

                setCellValue: function (newData, value, currentRowData) {
                    newData.MaHang = value;

                    const arrMaHang = getMaHangEditData();
                    const found = arrMaHang.find(x => String(x.MaHang) === String(value));

                    newData.MaLenh = found?.MaLenh || "";
                    newData.TenCL = found?.TenCL || "";
                    newData.TenDVCL = found?.TenDVCL || "";

                    newData.Color = null;
                    newData.Size = null;
                    newData.MaNhomSize = null;

                    const arrMauFiltered = value
                        ? arrMauEdit.filter(m => String(m.MaHang) === String(value))
                        : [];

                    if (arrMauFiltered.length === 1) {
                        newData.Color = arrMauFiltered[0].MaMau || "";
                    }

                    const arrSizeFiltered = value
                        ? arrSizeEdit.filter(s => String(s.MaHang) === String(value))
                        : [];

                    if (arrSizeFiltered.length === 1) {
                        newData.Size = arrSizeFiltered[0].MaSize || "";
                        newData.MaNhomSize = arrSizeFiltered[0].MaNhomSize || "";
                    }
                },

                cellTemplate: function (cellElement, cellInfo) {
                    const maHang = cellInfo.value;

                    if (maHang) {
                        const arrMaHang = getMaHangEditData();
                        const found = arrMaHang.find(x => String(x.MaHang) === String(maHang));

                        cellElement.text(found ? found.TenHang : maHang);
                    }
                },

                editCellTemplate: function (cellElement, cellInfo) {
                    const arrMaHang = getMaHangEditData();

                    if (arrMaHang.length === 1 && !cellInfo.value) {
                        cellInfo.setValue(arrMaHang[0].MaHang);
                    }

                    $("<div>").appendTo(cellElement).dxSelectBox({
                        dataSource: arrMaHang,
                        displayExpr: function (item) {
                            return item ? item.TenHang : "";
                        },
                        valueExpr: "MaHang",
                        value: cellInfo.value || (arrMaHang.length === 1 ? arrMaHang[0].MaHang : null),
                        placeholder: "-- Chọn mã hàng --",
                        searchEnabled: true,
                        showClearButton: true,
                        onValueChanged: function (e) {
                            cellInfo.setValue(e.value);

                            const grid = $("#dxDataGridEditVatTu").dxDataGrid("instance");
                            grid.repaintRows([cellInfo.rowIndex]);
                        }
                    });
                }
            },
            {
                caption: "Người nhận",
                dataField: "NguoiNhan",
                alignment: "center",
                width: 160,
                allowEditing: false
            },
            {
                caption: "Địa chỉ",
                dataField: "DiaChi",
                alignment: "center",
                width: 220,
                allowEditing: false
            },
            {
                caption: "Lý do",
                dataField: "LyDo",
                alignment: "center",
                width: 220,
                allowEditing: false
            },
            {
                caption: "Màu",
                dataField: "Color",
                width: 150,
                alignment: "center",

                cellTemplate: function (cellElement, cellInfo) {
                    const maMau = cellInfo.value ?? cellInfo.data?.Color;

                    if (maMau) {
                        const found = arrMauEdit.find(m =>
                            String(m.MaMau) === String(maMau) &&
                            (!cellInfo.data.MaHang || String(m.MaHang) === String(cellInfo.data.MaHang))
                        );

                        cellElement.text(found ? found.TenMau : maMau);
                    }
                },

                editCellTemplate: function (cellElement, cellInfo) {
                    const maHangCurrent = cellInfo.data.MaHang;

                    const arrMauFiltered = maHangCurrent
                        ? arrMauEdit.filter(m => String(m.MaHang) === String(maHangCurrent))
                        : arrMauEdit;

                    $("<div>").appendTo(cellElement).dxSelectBox({
                        dataSource: arrMauFiltered,
                        displayExpr: "TenMau",
                        valueExpr: "MaMau",
                        value: cellInfo.value || null,
                        placeholder: "-- Chọn màu --",
                        searchEnabled: true,
                        showClearButton: true,
                        onValueChanged: function (e) {
                            cellInfo.setValue(e.value);
                        }
                    });
                }
            },
            {
                caption: "Size",
                dataField: "Size",
                width: 150,
                alignment: "center",

                cellTemplate: function (cellElement, cellInfo) {
                    const maSize = cellInfo.value;

                    if (maSize) {
                        const found = arrSizeEdit.find(s => s.MaSize === maSize &&
                            s.MaNhomSize === cellInfo.data.MaNhomSize);
                        if (found) {
                            cellElement.text(`${found.NhomSize}:${found.TenSize}`);
                        } else {
                            cellElement.text(maSize);
                        }
                    }
                },

                editCellTemplate: function (cellElement, cellInfo) {
                    const maHangCurrent = cellInfo.data?.MaHang;

                    const arrSizeFiltered = maHangCurrent
                        ? arrSizeEdit.filter(s => s.MaHang === maHangCurrent)
                        : arrSizeEdit;

                    const getSizeKey = function (item) {
                        return item ? `${item.MaSize}||${item.MaNhomSize}` : null;
                    };

                    const currentValue = cellInfo.value
                        ? getSizeKey(arrSizeFiltered.find(x => x.MaSize === cellInfo.value && x.MaNhomSize === cellInfo.data?.MaNhomSize))
                        : null;

                    $("<div>").appendTo(cellElement).dxSelectBox({
                        dataSource: arrSizeFiltered,
                        displayExpr: function (item) {
                            return item ? `${item.NhomSize}:${item.TenSize}` : "";
                        },
                        valueExpr: function (item) {
                            return getSizeKey(item);
                        },
                        value: currentValue || null,
                        placeholder: "-- Chọn size --",
                        searchEnabled: true,
                        showClearButton: true,
                        onValueChanged: function (e) {
                            const selectedItem = e.component.option("selectedItem");

                            if (selectedItem) {
                                cellInfo.setValue(selectedItem.MaSize);
                                cellInfo.component.cellValue(
                                    cellInfo.rowIndex,
                                    "MaNhomSize",
                                    selectedItem.MaNhomSize || ""
                                );
                            } else {
                                cellInfo.setValue(null);
                                cellInfo.component.cellValue(cellInfo.rowIndex, "MaNhomSize", "");
                            }
                        }
                    });
                }
            },
            {
                caption: "Chủng loại",
                dataField: "TenCL",
                alignment: "center",
                width: 130,
                allowEditing: false
            },
            {
                caption: "ĐV chủng loại",
                dataField: "TenDVCL",
                alignment: "center",
                width: 130,
                allowEditing: false
            },
            {
                caption: "SLYC",
                dataField: "SLYC",
                dataType: "number",
                alignment: "center",
                width: 100
            },
            {
                caption: "Đơn giá",
                dataField: "DonGia",
                dataType: "number",
                alignment: "center",
                width: 120
            },
            {
                caption: "Thành tiền",
                dataField: "ThanhTien",
                alignment: "center",
                width: 130,
                allowEditing: false,
                calculateCellValue: function (rowData) {
                    return (Number(rowData.SLYC) || 0) * (Number(rowData.DonGia) || 0);
                }
            },
            
            {
                caption: "Ghi chú",
                dataField: "ghiChu",
                alignment: "center",
                width: 180
            }
        ],

        onEditorPreparing: function (e) {
            if (e.parentType !== "dataRow") return;

            if (e.dataField === "Color") {
                const maHang = e.row.data.MaHang;

                e.editorOptions.dataSource = arrMauEdit.filter(x =>
                    x.MaHang === maHang
                );

                e.editorOptions.searchEnabled = true;
                e.editorOptions.dropDownOptions = {
                    hideOnOutsideClick: true
                };
            }

            if (e.dataField === "Size") {
                const maHang = e.row.data.MaHang;

                e.editorOptions.dataSource = arrSizeEdit.filter(x =>
                    x.MaHang === maHang
                );

                e.editorOptions.searchEnabled = true;
                e.editorOptions.dropDownOptions = {
                    hideOnOutsideClick: true
                };
            }
        },
        onInitNewRow: function (e) {
            e.data.ID = 0;
            e.data.PhieuXKTP = currentEditPhieu;
            e.data.Dot = dot || null;
            e.data.MaLenh = "";
            e.data.MaHang = "";
            e.data.Color = "";
            e.data.Size = "";
            e.data.MaNhomSize = "";
            e.data.TenCL = "";
            e.data.TenDVCL = "";
            e.data.SLYC = 0;
            e.data.DonGia = 0;
            e.data.ThanhTien = 0;
            e.data.ghiChu = "";
            e.data.NguoiTao = userNameSave;
        },
        onCellPrepared: function (e) {

            if (e.rowType === "header") {
                e.cellElement.css({
                    "background-color": "#2c3e50",
                    "color": "#ffffff",
                    "font-weight": "bold",
                    "text-align": "center",
                    "vertical-align": "middle"
                });
            }

            //if (e.rowType === "data") {
            //    $(e.cellElement).addClass("text-center");
            //    $(e.cellElement).css("vertical-align", "middle");

            //    const mergeFields = ["NguoiNhan", "DiaChi", "LyDo", "NgayDK", "NgayXuat"];
            //    if (!mergeFields.includes(e.column.dataField)) return;

            //    // Key merge theo PhieuDK + MaNPL
            //    const currentKey = `${e.data.PhieuXKTP}`;
            //    if (e.rowIndex === 0) {
            //        if (!mergelements[e.rowIndex]) mergelements[e.rowIndex] = {};
            //        mergelements[e.rowIndex][e.column.dataField] = {
            //            element: e.cellElement,
            //            key: currentKey
            //        };
            //        return;
            //    }

            //    const prevEntry = mergelements[e.rowIndex - 1]?.[e.column.dataField];
            //    const prevKey = prevEntry?.key;

            //    if (!mergelements[e.rowIndex]) mergelements[e.rowIndex] = {};

            //    if (prevKey === currentKey) {
            //        const originEntry = findOriginEntry(mergelements, e.rowIndex - 1, e.column.dataField);
            //        mergelements[e.rowIndex][e.column.dataField] = originEntry;

            //        $(e.cellElement).css("display", "none");

            //        const originEl = originEntry?.element;
            //        if (originEl) {
            //            const span = $(originEl).attr("rowspan");
            //            $(originEl).attr("rowspan", span ? Number(span) + 1 : 2);
            //            $(originEl).css("vertical-align", "middle");
            //        }
            //    } else {
            //        // Nhóm mới
            //        mergelements[e.rowIndex][e.column.dataField] = {
            //            element: e.cellElement,
            //            key: currentKey
            //        };
            //    }
            //}
        },
        onContentReady: function (e) {
            // Ẩn dòng trống đầu tiên nếu chưa có data thật
            const dataSource = e.component.option("dataSource");
            if (dataSource && dataSource.length === 1 && dataSource[0]._isEmptyRow) {
                // Giữ dòng này nhưng có thể ẩn nó đi nếu muốn
                // Hoặc xóa nó khi thêm dòng thật đầu tiên
            }
        },
    }).dxDataGrid("instance");
}

function getMaHangEditData() {
    if (!msEdit) return [];

    return msEdit.options
        .filter(o => msEdit.selected.has(o.value))
        .map(o => ({
            MaHang: o.MaHang || "",
            TenHang: o.TenHang || o.label || "",
            MaLenh: o.MaLenh || o.value || "",
            TenCL: o.TenCL || "",
            TenDVCL: o.TenDVCL || ""
        }))
        .filter(x => x.MaHang);
}
function resetModalAddPhieu() {
    $("#m-so-phieu").val("");
    $("#m-nguoi-nhan").val("");
    $("#m-dia-chi").val("");
    $("#m-ly-do").val("");

    // Reset ngày
    $("#tuNgay").val("");
    $("#ngayCap").val("");
}

const merges = [];
const signatureAnchors = []; // { url, row, col } cho từng phiếu
async function exportPhieuXuatKhoExcel(data) {
    if (!data || data.length === 0) {
        showToast('warning', 'Không có dữ liệu để xuất. Vui lòng kiểm tra lại!!!', 2000);
        return;
    }

    // ── 1. Nhóm dữ liệu theo PhieuXKTP ──────────────────────────────────────
    const grouped = {};
    data.forEach(row => {
        const key = row.PhieuXKTP || "(Không có phiếu)";
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(row);
    });

    const wb = XLSX.utils.book_new();

    // ── 2. Tạo 1 sheet chứa tất cả phiếu ────────────────────────────────────
    const allRows = [];
    const merges = [];

    // 10 cột: A=0..J=9
    const TOTAL_COLS = 10;

    const colWidths = [
        { wch: 13.33 },  // A
        { wch: 16.66 },  // B
        { wch: 14.22 },  // C
        { wch: 11.55 },  // D
        { wch: 17.22 },  // E
        { wch: 9.78 },   // F
        { wch: 17.55 },  // G – Số lượng
        { wch: 17.55 },  // H – Đơn giá
        { wch: 19.44 },  // I – Thành tiền
        { wch: 22.33 },  // J – Ghi chú
    ];

    // ── Style helpers ──────────────────────────────────────────────────────
    const cellStyles = {};


    function setStyle(row, col, style) {
        const key = `${row},${col}`;
        const prev = cellStyles[key] || {};
        const merged = { ...prev, ...style };
        if (prev.border || style.border) {
            merged.border = { ...(prev.border || {}), ...(style.border || {}) };
        }
        cellStyles[key] = merged;
    }

    function setRangeStyle(r1, c1, r2, c2, style) {
        for (let r = r1; r <= r2; r++)
            for (let c = c1; c <= c2; c++)
                setStyle(r, c, style);
    }

    function pushRow(rowData, defaultStyle = {}) {
        const idx = allRows.length;
        allRows.push(rowData);
        if (Object.keys(defaultStyle).length > 0)
            for (let c = 0; c < rowData.length; c++)
                setStyle(idx, c, defaultStyle);
        return idx;
    }

    function addMerge(r1, c1, r2, c2) {
        merges.push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } });
    }

    // ── Border constants ───────────────────────────────────────────────────
    const BORDER_OUTER = { border: { top: { style: "medium" }, bottom: { style: "medium" }, left: { style: "medium" }, right: { style: "medium" } } };
    const B_TOP_MED = { border: { top: { style: "medium" } } };
    const B_BOT_MED = { border: { bottom: { style: "medium" } } };
    const B_L_MED = { border: { left: { style: "medium" } } };
    const B_R_MED = { border: { right: { style: "medium" } } };
    const B_TOP_THIN = { border: { top: { style: "thin" } } };
    const B_BOT_THIN = { border: { bottom: { style: "thin" } } };
    const B_L_THIN = { border: { left: { style: "thin" } } };
    const B_R_THIN = { border: { right: { style: "thin" } } };
    const THIN_ALL = { border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } };

    // Helper: merge border objects
    function mergeBorder(...borders) {
        let b = {};
        borders.forEach(obj => { if (obj && obj.border) Object.assign(b, obj.border); });
        return { border: b };
    }

    // ── Font / align constants ─────────────────────────────────────────────
    const TNR = "Times New Roman";
    const F12 = { font: { name: TNR, sz: 12 } };
    const F12B = { font: { name: TNR, sz: 12, bold: true } };
    const F10 = { font: { name: TNR, sz: 10 } };
    const F10B = { font: { name: TNR, sz: 10, bold: true } };
    const F11 = { font: { name: TNR, sz: 11 } };
    const F11B = { font: { name: TNR, sz: 11, bold: true } };
    const F16B = { font: { name: TNR, sz: 16, bold: true } };
    const F18B = { font: { name: TNR, sz: 18, bold: true } };
    const AC = { alignment: { horizontal: "center", vertical: "center" } };
    const AL = { alignment: { horizontal: "left", vertical: "center" } };
    const AR = { alignment: { horizontal: "right", vertical: "center" } };
    const AT = { alignment: { horizontal: "left", vertical: "top", wrapText: true } };

    // ── Format date ─────────────────────────────────────────────────────────
    // FIX: new Date("10/07/2026") bị JS hiểu theo định dạng Mỹ (MM/DD/YYYY)
    // nên ngày 10/07/2026 (10 tháng 7) bị in nhầm thành "Ngày 7 tháng 10".
    // Hàm mới tự nhận diện chuỗi dạng D/M/YYYY hoặc D-M-YYYY (định dạng VN)
    // và parse thủ công theo đúng thứ tự ngày-tháng-năm; các định dạng khác
    // (ISO yyyy-mm-dd, đối tượng Date...) vẫn dùng new Date() như cũ.
    function formatDate(dateStr) {
        if (!dateStr) return "";

        let d;
        if (dateStr instanceof Date) {
            d = dateStr;
        } else if (typeof dateStr === "string") {
            const dmy = dateStr.trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
            if (dmy) {
                const day = parseInt(dmy[1], 10);
                const month = parseInt(dmy[2], 10);
                const year = parseInt(dmy[3], 10);
                d = new Date(year, month - 1, day);
            } else {
                d = new Date(dateStr);
            }
        } else {
            d = new Date(dateStr);
        }

        if (isNaN(d)) return dateStr;
        return `Ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
    }

    // ── Xây dựng từng phiếu ─────────────────────────────────────────────────
    Object.entries(grouped).forEach(([phieu, rows], phieuIndex) => {
        const first = rows[0];
        const ngayFormatted = formatDate(first.NgayXuat || "");

        if (phieuIndex > 0) {
            // Cách ra 5 dòng trống trước khi in phiếu tiếp theo
            for (let i = 0; i < 5; i++) {
                pushRow(Array(TOTAL_COLS).fill(""));
            }
        }

        // ── ROW 1: Tên công ty | Mẫu số ────────────────────────────────────
        let r = pushRow(["CÔNG TY TNHH VIKING VIỆT NAM", "", "", "", "", "", "Mẫu số 02 - VT", "", "", ""]);
        addMerge(r, 0, r, 3);  // A:D
        addMerge(r, 6, r, 9);  // G:J
        // Top border cho toàn bộ dòng (cả 2 khối)
        setRangeStyle(r, 0, r, 9, { ...B_TOP_MED });
        // Left block - chỉ cột A có border trái ngoài cùng
        setRangeStyle(r, 0, r, 5, { ...F12B, ...AL });
        setStyle(r, 0, B_L_MED);
        // Right block - chỉ cột J có border phải ngoài cùng
        setRangeStyle(r, 6, r, 9, { ...F12B, ...AC });
        setStyle(r, 9, B_R_MED);

        // ── ROW 2: Địa chỉ | Thông tư (merge A2:D3) ──────────────────────
        r = pushRow(["Nhà xưởng NXCS - GD1, Lô A6-2, đường D8, Khu công nghiệp Đông Nam, Xã Bình Mỹ, Thành phố Hồ Chí Minh, Việt Nam.", "", "", "", "", "", "(Ban hành theo Thông tư số 200/2014/TT-BTC", "", "", ""]);
        addMerge(r, 0, r + 1, 3); // A2:D3
        addMerge(r, 6, r, 9);     // G2:J2
        setRangeStyle(r, 0, r, 5, { ...F10, ...AT });
        setStyle(r, 0, B_L_MED);
        setRangeStyle(r, 6, r, 9, { ...F11B, ...AC });
        setStyle(r, 9, B_R_MED);

        // ── ROW 3: (cont địa chỉ merge) | Ngày thông tư ──────────────────
        r = pushRow(["", "", "", "", "", "", "             Ngày 22/12/2014 của Bộ Tài chính)", "", "", ""]);
        addMerge(r, 6, r, 9); // G3:J3
        setStyle(r, 0, B_L_MED);
        setRangeStyle(r, 6, r, 9, { ...F11B, ...AC });
        setStyle(r, 9, B_R_MED);

        // ── ROW 4: Trống ─────────────────────────────────────────────────
        r = pushRow(Array(TOTAL_COLS).fill(""));
        setStyle(r, 0, B_L_MED);
        setStyle(r, 9, B_R_MED);

        // ── ROW 5: PHIẾU XUẤT KHO ───────────────────────────────────────
        r = pushRow(["PHIẾU XUẤT KHO", "", "", "", "", "", "", "", "", ""]);
        addMerge(r, 0, r, 9); // A:J
        setRangeStyle(r, 0, r, 9, { ...F18B, ...AC, ...B_L_MED, ...B_R_MED });

        // ── ROW 6: Ngày ─────────────────────────────────────────────────
        r = pushRow([ngayFormatted, "", "", "", "", "", "", "", "", ""]);
        addMerge(r, 0, r, 9);
        setRangeStyle(r, 0, r, 9, { ...F12, ...AC, ...B_L_MED, ...B_R_MED });

        // ── ROW 7: Số phiếu ─────────────────────────────────────────────
        r = pushRow([`Số: ${phieu}`, "", "", "", "", "", "", "", "", ""]);
        addMerge(r, 0, r, 9);
        setRangeStyle(r, 0, r, 9, { ...F12B, ...AC, ...B_L_MED, ...B_R_MED });

        // ── ROW 8: Nợ ───────────────────────────────────────────────────
        r = pushRow(["", "", "", "", "", "", "", "", "Nợ: ..........", ""]);
        setStyle(r, 0, B_L_MED);
        setStyle(r, 9, B_R_MED);
        setStyle(r, 8, { ...F12, ...AC });

        // ── ROW 9: Có ───────────────────────────────────────────────────
        r = pushRow(["", "", "", "", "", "", "", "", "Có:..........", ""]);
        setStyle(r, 0, B_L_MED);
        setStyle(r, 9, B_R_MED);
        setStyle(r, 8, { ...F12, ...AC });

        // ── ROW 10: Người nhận ──────────────────────────────────────────
        r = pushRow(["- Người nhận (Consignee):", "", first.NguoiNhan || "", "", "", "", "", "", "", ""]);
        addMerge(r, 0, r, 1); // A:B merge label
        addMerge(r, 2, r, 9); // C:J value
        setRangeStyle(r, 0, r, 1, { ...F12B, ...AL, ...B_L_MED });
        setRangeStyle(r, 2, r, 9, { ...F12B, ...AL, ...B_R_MED });

        // ── ROW 11: Địa chỉ ─────────────────────────────────────────────
        r = pushRow(["- Địa chỉ (Address):", "", first.DiaChi || "", "", "", "", "", "", "", ""]);
        addMerge(r, 0, r, 1); // A:B merge label
        addMerge(r, 2, r, 9); // C:J value
        setRangeStyle(r, 0, r, 1, { ...F12B, ...AL, ...B_L_MED });
        setRangeStyle(r, 2, r, 9, { ...F12, ...AL, ...B_R_MED });

        // ── ROW 12: Lý do ───────────────────────────────────────────────
        r = pushRow(["- Lý do xuất kho (Reason ):", "", first.LyDo || "", "", "", "", "", "", "", ""]);
        addMerge(r, 0, r, 1); // A:B merge label
        addMerge(r, 2, r, 9); // C:J value
        setRangeStyle(r, 0, r, 1, { ...F12B, ...AL, ...B_L_MED });
        setRangeStyle(r, 2, r, 9, { ...F12B, ...AL, ...B_R_MED });

        // ── ROW 13: Xuất tại kho ────────────────────────────────────────
        r = pushRow(["- Xuất tại kho (Location):", "", "KHO VIKING VIỆT NAM", "", "", "", "", "", "", ""]);
        addMerge(r, 0, r, 1); // A:B merge label
        addMerge(r, 2, r, 9); // C:J value
        setRangeStyle(r, 0, r, 1, { ...F12B, ...AL, ...B_L_MED });
        setRangeStyle(r, 2, r, 9, { ...F12B, ...AL, ...B_R_MED });

        // ── ROW 14: Địa chỉ kho ─────────────────────────────────────────
        r = pushRow(["", "", "Nhà xưởng NXCS - GD1, Lô A6-2, đường D8, Khu công nghiệp Đông Nam, Xã Bình Mỹ, Thành phố Hồ Chí Minh, Việt Nam.", "", "", "", "", "", "", ""]);
        addMerge(r, 2, r, 9);
        setStyle(r, 0, B_L_MED);
        setRangeStyle(r, 2, r, 9, { ...F12, ...AL, ...B_R_MED });

        // ── HEADER TABLE ────────────────────────────────────────────────
        // ROW 15: Header dòng 1
        // Cột: A=STT, B-D=Phẩm chất (merge B15:D16), E=Mã hàng (merge E15:E16),
        //      F=ĐVT (merge F15:F16), G=Số lượng (merge G15:G16, đã bỏ cột Thực Xuất),
        //      H=Đơn giá (merge H15:H16), I=Thành tiền (merge I15:I16), J=Ghi chú (merge J15:J17)
        const hdr1 = pushRow(["Số thứ tự", "Phẩm chất sản phẩm", "", "", "Mã hàng", "Đơn vị tính", "SL yêu cầu", "Đơn giá(Unit Price)", "Thành tiền(Amount)", "Ghi chú"]);
        addMerge(hdr1, 0, hdr1 + 1, 0);  // A15:A16 (STT)
        addMerge(hdr1, 1, hdr1 + 1, 3);  // B15:D16
        addMerge(hdr1, 4, hdr1 + 1, 4);  // E15:E16
        addMerge(hdr1, 5, hdr1 + 1, 5);  // F15:F16
        addMerge(hdr1, 6, hdr1 + 1, 6);  // G15:G16 (Số lượng)
        addMerge(hdr1, 7, hdr1 + 1, 7);  // H15:H16 (Đơn giá)
        addMerge(hdr1, 8, hdr1 + 1, 8);  // I15:I16 (Thành tiền)
        addMerge(hdr1, 9, hdr1 + 2, 9);  // J15:J17 (Ghi chú)

        setRangeStyle(hdr1, 0, hdr1, 9, {
            font: { name: TNR, sz: 12 },
            alignment: { horizontal: "center", vertical: "center" }
        });
        // Border: top thin, left border ngoài
        setStyle(hdr1, 0, mergeBorder(B_TOP_THIN, B_L_MED, B_R_THIN));
        setStyle(hdr1, 1, mergeBorder(B_TOP_THIN, B_L_THIN, B_R_THIN));
        setStyle(hdr1, 2, mergeBorder(B_TOP_THIN));
        setStyle(hdr1, 3, mergeBorder(B_TOP_THIN, B_R_THIN));
        setStyle(hdr1, 4, mergeBorder(B_TOP_THIN, B_L_THIN, B_R_THIN, B_BOT_THIN));
        setStyle(hdr1, 5, mergeBorder(B_TOP_THIN, B_L_THIN, B_R_THIN));
        setStyle(hdr1, 6, mergeBorder(B_TOP_THIN, B_L_THIN, B_R_THIN, B_BOT_THIN));
        setStyle(hdr1, 7, mergeBorder(B_TOP_THIN, B_L_THIN, B_R_THIN, B_BOT_THIN));
        setStyle(hdr1, 8, mergeBorder(B_TOP_THIN, B_L_THIN, B_R_THIN, B_BOT_THIN));
        setStyle(hdr1, 9, mergeBorder(B_TOP_THIN, B_L_THIN, B_R_MED, B_BOT_THIN));

        // ROW 16: Header dòng 2 (sub-labels)
        const hdr2 = pushRow(["", "(Item )", "(Color)", "(Size)", "", "", "", "", "", ""]);
        setRangeStyle(hdr2, 0, hdr2, 9, {
            font: { name: TNR, sz: 12 },
            alignment: { horizontal: "center", vertical: "center" }
        });
        setStyle(hdr2, 0, mergeBorder(B_BOT_THIN, B_L_MED, B_R_THIN));
        setStyle(hdr2, 1, mergeBorder(B_BOT_THIN, B_L_THIN, B_R_THIN));
        setStyle(hdr2, 2, mergeBorder(B_BOT_THIN));
        setStyle(hdr2, 3, mergeBorder(B_BOT_THIN, B_R_THIN));
        //setStyle(hdr2, 4, mergeBorder(B_L_THIN, B_R_THIN));
        setStyle(hdr2, 4, mergeBorder(B_BOT_THIN, B_L_THIN, B_R_THIN));
        setStyle(hdr2, 5, mergeBorder(B_BOT_THIN, B_L_THIN, B_R_THIN));
        setStyle(hdr2, 6, mergeBorder(B_L_THIN, B_R_THIN));
        setStyle(hdr2, 7, mergeBorder(B_L_THIN, B_R_THIN));
        setStyle(hdr2, 8, mergeBorder(B_L_THIN, B_R_THIN));
        setStyle(hdr2, 9, { border: { right: { style: "medium" } } });

        // ROW 17: Label (No.), (code), ...
        const lbl1 = pushRow(["(No.)", "(Item )", "(Color)", "(Size)", "(code)", "( Unit Qty)", "(Request.)", "(VNĐ)", "(VNĐ)", ""]);
        setRangeStyle(lbl1, 0, lbl1, 9, {
            font: { name: TNR, sz: 12 },
            alignment: { horizontal: "center", vertical: "center" }
        });
        setStyle(lbl1, 0, mergeBorder(B_BOT_THIN, B_L_MED, B_R_THIN));
        setStyle(lbl1, 1, mergeBorder(B_BOT_THIN, B_L_THIN, B_R_THIN));
        setStyle(lbl1, 2, mergeBorder(B_BOT_THIN));
        setStyle(lbl1, 3, mergeBorder(B_BOT_THIN, B_R_THIN));
        setStyle(lbl1, 4, mergeBorder(B_BOT_THIN, B_L_THIN, B_R_THIN));
        setStyle(lbl1, 5, mergeBorder(B_BOT_THIN, B_L_THIN, B_R_THIN));
        setStyle(lbl1, 6, mergeBorder(B_BOT_THIN, B_L_THIN, B_R_THIN));
        setStyle(lbl1, 7, mergeBorder(B_BOT_THIN, B_L_THIN, B_R_THIN));
        setStyle(lbl1, 8, mergeBorder(B_BOT_THIN, B_L_THIN, B_R_THIN));
        setStyle(lbl1, 9, mergeBorder(B_L_THIN, B_R_MED, B_BOT_THIN));

        // ROW 18: A, B, C, D, 1, 2, 3, 4
        const lbl2 = pushRow(["A", "B", "", "", "C", "D", "1", "2", "3", "4"]);
        addMerge(lbl2, 1, lbl2, 3); // B18:D18
        setRangeStyle(lbl2, 0, lbl2, 9, {
            font: { name: TNR, sz: 12 },
            alignment: { horizontal: "center", vertical: "center" }
        });
        setStyle(lbl2, 0, mergeBorder(B_TOP_THIN, B_BOT_THIN, B_L_MED, B_R_THIN));
        setStyle(lbl2, 1, mergeBorder(B_TOP_THIN, B_BOT_THIN, B_L_THIN, B_R_THIN));
        setStyle(lbl2, 2, mergeBorder(B_TOP_THIN, B_BOT_THIN));
        setStyle(lbl2, 3, mergeBorder(B_TOP_THIN, B_BOT_THIN, B_R_THIN));
        setStyle(lbl2, 4, mergeBorder(B_TOP_THIN, B_BOT_THIN, B_L_THIN, B_R_THIN));
        setStyle(lbl2, 5, mergeBorder(B_TOP_THIN, B_BOT_THIN, B_L_THIN, B_R_THIN));
        setStyle(lbl2, 6, mergeBorder(B_TOP_THIN, B_BOT_THIN, B_L_THIN, B_R_THIN));
        setStyle(lbl2, 7, mergeBorder(B_TOP_THIN, B_BOT_THIN, B_L_THIN, B_R_THIN));
        setStyle(lbl2, 8, mergeBorder(B_TOP_THIN, B_BOT_THIN, B_L_THIN, B_R_THIN));
        setStyle(lbl2, 9, mergeBorder(B_TOP_THIN, B_BOT_THIN, B_L_THIN, B_R_MED));

        // ── DATA ROWS ───────────────────────────────────────────────────
        let totalYC = 0;
        let totalTT = 0;
        const dataStartRow = allRows.length;

        rows.forEach((row, idx) => {
            const sizeStr = [row.NhomSize, row.TenSize].filter(Boolean).join(":");
            const donGia = row.DonGia ? Number(row.DonGia) : "";
            const thanhTien = row.ThanhTien ? Number(row.ThanhTien) : "";
            const slYC = Number(row.SLYC || 0);

            const dr = pushRow([
                idx + 1,
                row.TenCL || "",
                row.TenMau || "",
                sizeStr,
                row.TenHang || "",
                row.TenDVCL || "",
                slYC,
                donGia,
                thanhTien,
                row.GhiChu || ""
            ]);

            // Borders: outer left medium, right medium; inner thin
            setStyle(dr, 0, { font: { name: TNR, sz: 12 }, alignment: { horizontal: "center", vertical: "center", wrapText: true }, border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "medium" } } });
            setStyle(dr, 1, { font: { name: "Calibri", sz: 12 }, alignment: { horizontal: "left", vertical: "center" }, ...THIN_ALL });
            setStyle(dr, 2, { font: { name: "Calibri", sz: 12 }, alignment: { horizontal: "left", vertical: "center" }, border: { top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } } });
            setStyle(dr, 3, { font: { name: "Calibri", sz: 12 }, alignment: { horizontal: "center", vertical: "center" }, border: { top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } } });
            setStyle(dr, 4, { font: { name: "Calibri", sz: 12 }, alignment: { horizontal: "center", vertical: "center" }, border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } });
            setStyle(dr, 5, { font: { name: TNR, sz: 12 }, alignment: { horizontal: "center", vertical: "center", wrapText: true }, ...THIN_ALL });
            setStyle(dr, 6, { font: { name: TNR, sz: 12 }, alignment: { horizontal: "center", vertical: "center" }, ...THIN_ALL });
            setStyle(dr, 7, { font: { name: TNR, sz: 12 }, alignment: { horizontal: "center", vertical: "center" }, ...THIN_ALL });
            setStyle(dr, 8, { font: { name: TNR, sz: 12, bold: true }, alignment: { horizontal: "center", vertical: "center" }, ...THIN_ALL });
            setStyle(dr, 9, { font: { name: TNR, sz: 12 }, alignment: { horizontal: "center", vertical: "center" }, border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "medium" } } });

            totalYC += slYC;
            totalTT += thanhTien || 0;
        });

        // ── TỔNG CỘNG ───────────────────────────────────────────────────
        const totR = pushRow(["Tổng cộng  ( Total)", "", "", "", "", "", totalYC, "", totalTT, ""]);
        addMerge(totR, 0, totR, 5); // A:F
        // G = SUM số lượng; I = SUM thành tiền
        setStyle(totR, 0, { font: { name: TNR, sz: 16 }, alignment: { horizontal: "left", vertical: "center" }, border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "medium" } } });
        setStyle(totR, 1, { font: { name: TNR, sz: 16 }, border: { top: { style: "thin" }, bottom: { style: "thin" } } });
        setStyle(totR, 2, { border: { top: { style: "thin" }, bottom: { style: "thin" } } });
        setStyle(totR, 3, { border: { top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } } });
        setStyle(totR, 4, { border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } });
        setStyle(totR, 5, { border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } });
        setStyle(totR, 6, { font: { name: TNR, sz: 14 }, alignment: { horizontal: "center" }, border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } });
        setStyle(totR, 7, { border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } });
        setStyle(totR, 8, { font: { name: TNR, sz: 16 }, alignment: { horizontal: "center" }, border: { top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } } });
        setStyle(totR, 9, { border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "medium" } } });

        // ── NGÀY KÝ ────────────────────────────────────────────────────
        r = pushRow(["", "", "", "", "", "", "","" , ngayFormatted, ""]);
        addMerge(r, 8, r, 9); // H:J
        setStyle(r, 0, { ...F12, ...B_L_MED });
        setStyle(r, 9, B_R_MED);
        setRangeStyle(r, 7, r, 9, { ...F12, ...AC, border: { top: { style: "thin" }, right: { style: "medium" } } });

        // ── CHỨC DANH ──────────────────────────────────────────────────
        r = pushRow(["KT Phụ trách đơn vị", "", "", "Người lập", "", "", "Người nhận", "", "Người giao hàng", ""]);
        addMerge(r, 0, r, 1); // A:B
        addMerge(r, 3, r, 4); // D:E
        addMerge(r, 6, r, 7); // G:H
        addMerge(r, 8, r, 9); // I:J
        setRangeStyle(r, 0, r, 9, { ...F12, ...AC });
        setStyle(r, 0, { ...F12, ...AC, ...B_L_MED });
        setStyle(r, 9, { ...F12, ...AC, ...B_R_MED });

        r = pushRow([" (Director.)", "", "", "(Prepared by)", "", "", "(Receiverer)", "", "(Store keeper)", ""]);
        addMerge(r, 0, r, 1);
        addMerge(r, 3, r, 4);
        addMerge(r, 6, r, 7);
        addMerge(r, 8, r, 9);
        setRangeStyle(r, 0, r, 9, { ...F12, ...AC });
        setStyle(r, 0, { ...F12, ...AC, ...B_L_MED });
        setStyle(r, 9, { ...F12, ...AC, ...B_R_MED });

        // Dòng trống x3 (ký tên)
        //for (let i = 0; i < 3; i++) {
        //    r = pushRow(Array(TOTAL_COLS).fill(""));
        //    setStyle(r, 0, B_L_MED);
        //    setStyle(r, 9, B_R_MED);
        //}
        // Dòng trống x3 (ký tên) — cột D (index 3) ứng với "Người lập"
    
        const signStartRow = allRows.length; // vị trí neo ảnh
        for (let i = 0; i < 3; i++) {
            r = pushRow(Array(TOTAL_COLS).fill(""));
            setStyle(r, 0, B_L_MED);
            setStyle(r, 9, B_R_MED);
        }
        // ✅ Merge cột D, E cho 3 dòng trống (dùng 0-based index)
        addMerge(signStartRow, 3, signStartRow + 2, 4); // D4:E... (cột D=3, cột E=4)

        // ── NEO ẢNH CHỮ KÝ (nếu có) ────────────────────────────────────
        let signImgUrl = null;
        if (first.SignNgDK && first.SignNgDK !== "checked") {
            signImgUrl = first.SignNgDK.startsWith("data:")
                ? first.SignNgDK
                : `/Images/SignYeuCauXuatKho/${first.SignNgDK}`;
        } else if (first.SignNgDK === "checked" && first.HinhAnhNgDK) {
            signImgUrl = `/Images/NhanVien/${first.HinhAnhNgDK}`;
        }

        if (signImgUrl) {
            signatureAnchors.push({ url: signImgUrl, row: signStartRow, col: 3 }); // col D
        }

        // ── TÊN NGƯỜI KÝ ───────────────────────────────────────────────
        r = pushRow(["Nguyễn Thị Ngọc Hà", "", "", first.TenNguoiLap, "", "", "", "", "", ""]);
        addMerge(r, 0, r, 1);
        addMerge(r, 3, r, 4);
        setRangeStyle(r, 0, r, 9, { ...F12, ...AC });
        setStyle(r, 0, { ...F12, ...AC, border: { bottom: { style: "medium" }, left: { style: "medium" } } });
        setStyle(r, 1, { border: { bottom: { style: "medium" } } });
        setStyle(r, 2, { border: { bottom: { style: "medium" } } });
        setStyle(r, 3, { ...F12B, ...AC, border: { bottom: { style: "medium" } } });
        setStyle(r, 4, { border: { bottom: { style: "medium" } } });
        setStyle(r, 5, { border: { bottom: { style: "medium" } } });
        setStyle(r, 6, { border: { bottom: { style: "medium" } } });
        setStyle(r, 7, { border: { bottom: { style: "medium" } } });
        setStyle(r, 8, { border: { bottom: { style: "medium" } } });
        setStyle(r, 9, { border: { bottom: { style: "medium" }, right: { style: "medium" } } });
    });

    
    const ws = XLSX.utils.aoa_to_sheet(allRows);
    ws["!merges"] = merges;
    ws["!cols"] = colWidths;

    for (const [key, style] of Object.entries(cellStyles)) {
        const [r, c] = key.split(",").map(Number);
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellRef]) ws[cellRef] = { v: allRows[r]?.[c] ?? "" };
        ws[cellRef].s = style;
    }

    XLSX.utils.book_append_sheet(wb, ws, "Phiếu Xuất Kho");

    // ── Chuyển sang ExcelJS ────────────────────────────────────────
    const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    const exWb = new ExcelJS.Workbook();
    await exWb.xlsx.load(wbout);
    const exWs = exWb.getWorksheet("Phiếu Xuất Kho");
    exWs.properties.defaultRowHeight = 15;

    // 1. Ép cứng chiều rộng cột D và E theo thiết kế
    exWs.getColumn(4).width = 11.55; // cột D (1-based index = 4)
    exWs.getColumn(5).width = 17.22; // cột E

    // 2. Set chiều cao 3 dòng chứa chữ ký
    if (signatureAnchors.length > 0) {
        const firstSignRow = signatureAnchors[0].row; // 0-based
        for (let i = 0; i < 3; i++) {
            exWs.getRow(firstSignRow + i + 1).height = 30; // 30pt mỗi dòng
        }
    }

    // 3. Chèn ảnh
    for (const anchor of signatureAnchors) {
        const base64 = await getImageBase64(anchor.url);
        if (!base64) {
            console.warn("Không load được ảnh:", anchor.url);
            continue;
        }

        // Thông số ảnh (px)
        const imgWidthPx = 90;
        const imgHeightPx = 45;

        // Chiều rộng cột (character)
        const wD = 11.55;
        const wE = 17.22;

        // Công thức chuẩn của Excel: pixel = Math.round(width * 7 + 5) với font mặc định Calibri 11
        const colDPx = Math.round(wD * 7 + 5);   // 86
        const colEPx = Math.round(wE * 7 + 5);   // 126
        const totalMergeWidthPx = colDPx + colEPx; // 212

        // Offset ngang để ảnh vào giữa
        const offsetColPx = (totalMergeWidthPx - imgWidthPx) / 2; // 61
        const offsetColEMU = Math.round(offsetColPx * 9525);      // 581,025

        // Chiều cao 3 dòng (30pt mỗi dòng) -> pixel
        const totalRowPt = 30 * 3;                 // 90pt
        const totalRowPx = totalRowPt * 96 / 72;   // 120px (vì 1pt = 1.333px)
        const offsetRowPx = (totalRowPx - imgHeightPx) / 2; // 37.5
        const offsetRowEMU = Math.round(offsetRowPx * 9525); // 357,187

        console.log(`Offset: col=${offsetColEMU} EMU, row=${offsetRowEMU} EMU`);

        const ext = base64.includes("image/jpeg") ? "jpeg" : "png";
        const imgId = exWb.addImage({ base64, extension: ext });

        // ✅ Dùng ext với offset đã tính
        exWs.addImage(imgId, {
            tl: {
                col: 3,
                row: anchor.row
            },
            br: {
                col: 5,
                row: anchor.row + 3
            }
        });
    }

    // ── Xuất file ─────────────────────────────────────────────────
    const outBuffer = await exWb.xlsx.writeBuffer();
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, "0")}${(today.getMonth() + 1).toString().padStart(2, "0")}${today.getFullYear()}`;

    const blob = new Blob([outBuffer], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `PhieuXuatKho_${dateStr}.xlsx`;
    link.click();
    URL.revokeObjectURL(link.href);
}
// ── Helper: định dạng ngày "DD tháng MM năm YYYY" ────────────────────────────
function formatDate(value) {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return value; // trả nguyên nếu không parse được
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${day} tháng ${month} năm ${year}`;
}
$('#btnXuatExcel').on("click", async function () {
    const grid = $("#dxDataGridDanhSachDangKy").dxDataGrid("instance");
    //const ds = grid.getDataSource();
    const dataSourceOption = grid.option("dataSource");
    await exportPhieuXuatKhoExcel(dataSourceOption)
});
async function getImageBase64(url) {
    if (!url) return null;
    // Chữ ký vẽ tay (canvas.toDataURL) đã là data URL sẵn -> dùng luôn
    if (url.startsWith("data:")) return url;

    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const blob = await res.blob();
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn("Không tải được ảnh chữ ký:", url, e);
        return null;
    }
}