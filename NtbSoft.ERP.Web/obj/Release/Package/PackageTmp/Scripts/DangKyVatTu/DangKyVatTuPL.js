/// VARIABLE
var userNameSave = localStorage.getItem("username1");
let dxDataGridDangKyVatTu;
let dxDataGridDanhSachDangKy;
let dxDataGridEditVatTu;
let selectedItems = [];
let selectedRowsToDelete = [];
let lstDataChiTietLenh = [];
let lstDataDangKyVatTu = [];
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
let picker1, picker2, picker3, picker4, picker5;
let currentStatus = 1;
let dataLan = []
/// UTILS
function ddmmyyyyToYmd(dateStr) {
    if (!dateStr) return "1990-01-01";
    const [d, m, y] = dateStr.split("/");
    return `${y}-${m}-${d}`;
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

        const url = `/api/DangKyVatTu/Get?action=${action}${paraConvert ? '&' + paraConvert : ''}`;

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
    async GetV2(action, para = {}, textSuccess = '') {
        const paraConvert = Object.entries(para || {})
            .map(([key, value]) => `${key}=${value}`)
            .join("&");

        const url = `/api/PhieuXuatHangNPL/GetV2?action=${action}${paraConvert ? '&' + paraConvert : ''}`;

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
    async Post(action, arrSave, textSuccess = "Lưu thành công!", para = {}) {
        const paraConvert = Object.entries(para || {})
            .map(([key, value]) => `${key}=${value}`)
            .join("&");

        const url = `/api/DangKyVatTu/Post?action=${action}${paraConvert ? '&' + paraConvert : ''}`;

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
/*async function GetMaLenh() {
    const maKH = $("#khachhang").val() || "all";
    const data = await API.Get("GetLenh", { para1: isNPL, para2: maKH });
    batchData = data;
    renderList(data);
}*/
async function GetMaLenh() {
    const maKH = $("#khachhang").val() || "all";
    const data = await API.Get("GetLenh", { para1: isNPL, para2: maKH });
    if (data.length > 0) {
        let html = `<option value=""></option>`
        data.map(x => {
            html += `<option value="${x.MaLenhSanXuat}">${x.Display}</option>`
        })

        $("#malenhdangky").html(html);
        GetMaLan()
    } else {
        $("#malenhdangky").empty()
    }
}

async function GetMaLan() {
    $('#maLenhInput').val('');
    const maKH = $("#khachhang").val() || "all";
    const maLenhDK = $("#malenhdangky").val()
    selectedItems = []
    const data = await API.GetV2("GetLanTheoLenhSX", { para1: maLenhDK });
    dataLan = data
    GetLenhChiTiet(0);
    //    renderItemList();
}

async function GetMaLenh2() {
    const $maLenhSelect = $("#malenh");
    const data = await API.Get("GetPYCDK", { para1: isNPL });

    $maLenhSelect.empty();
    if (data.length > 0) {
        const html = data.map(x => `<option value="${x.MaLenhSX}">${x.MaLenh}</option>`).join('');
        $maLenhSelect.append(html);
    }

    $maLenhSelect.select2();
    await GetPhieu();
}

async function GetDSPhieuDKVT() {
    const data = await API.Get("GetViewPDKVT", { para1: 'all', para2: isNPL })

    lstDSPhieuDKVT = data
    updateGrid(dxDataPhieuDKVT, data)
}

async function GetLenhChiTiet(lan) {
    const maLenhDK = $("#malenhdangky").val();
    const data = await API.GetV2("GetSLTheoLanSX", { para1: isNPL, para2: maLenhDK, para3: lan });

    if (dxDataGridDangKyVatTu) {
        // Grid đã tồn tại → chỉ update data
        data.forEach(function (item) {
            item.SLDKGoc = item.SLDK;
            if (item.StatusLanCu) {
                item.StatusLanCu = [...new Set(item.StatusLanCu.split(';').filter(Boolean).map(Number))]
                    .sort(function (a, b) { return a - b; })
                    .join(';');
            }
        });
        dxDataGridDangKyVatTu.option("dataSource", data);
        dxDataGridDangKyVatTu.refresh();
    } else {
        // Grid chưa tồn tại → khởi tạo lần đầu
        createViewDxDataGridDangKyVatTu(data);
    }
}
async function GetKhachHang() {
    const data = await API.Get("GetMaKH");
    const $khachHangSelect = $("#khachhang");

    if ($khachHangSelect.data('select2')) $khachHangSelect.select2('destroy');

    $khachHangSelect.empty().append(`<option value="all">Tất cả</option>`);

    if (data.length > 0) {
        const html = data.map(x => `<option value="${x.MaKH}">${x.TenKH}</option>`).join('');
        $khachHangSelect.append(html);
    }

    $khachHangSelect.select2({ dropdownParent: $('#modalAddPhieu') });
}

async function GetPhieuMax() {
    const data = await API.Get("GetPhieuMax", { para1: isNPL });
    dot = data[0].PXH;
    $("#txtPhieu").val(`PDK_${dot}`);
}

async function GetPhieu() {
    const maLenhSanXuat = $("#malenh").val();
    const data = await API.Get("GetPhieu", { para1: isNPL, para2: maLenhSanXuat });
    const $soPhieu = $("#maphieu");

    if ($soPhieu.hasClass("select2-hidden-accessible")) {
        $soPhieu.select2("destroy");
    }
    $soPhieu.empty();

    /*  if ($soPhieu.data('select2')) $soPhieu.select2('destroy');*/

    if (data.length > 0) {
        const html = data.map(x => `<option data-display="${x.Display}" value="${x.PhieuDK}">${x.Display}</option>`).join('');
        selectSoPhieuDisplay = data[0].Display
        $soPhieu.append(html);
    }

    $soPhieu.select2();
    GetDSPhieuDK();
}

async function GetDSPhieuDK() {
    const soPhieu = $("#maphieu option:selected").val() || '';
    const MaLenhSX = $("#malenh").val() || '';
    const data = await API.Get("GetDSPhieuDK", { para1: soPhieu, para2: isNPL, para3: MaLenhSX });
    if (soPhieu == "") {
        lstDataDangKyVatTu = [];
        updateGrid(dxDataGridDanhSachDangKy, []);
    } else {
        lstDataDangKyVatTu = data;
        updateGrid(dxDataGridDanhSachDangKy, data);
    }
}

async function SavePhieu(arrSave) {
    await API.Post("Post", arrSave, "Lưu phiếu thành công", { para1: isNPL });
    const phieuVuaTao = `PDK_${dot}`;

    resetModalState();

    await GetMaLenh2();
    $("#maphieu").val(phieuVuaTao).trigger("change");
    await GetPhieuMax();
    $("#modalAddPhieu").modal("hide")
}

async function DeletePhieu() {
    await API.Get("Delete", {
        para1: $("#maphieu").val(),
        para2: rowDelete.MaLenhSX,
        para3: rowDelete.MaNPL
    }, "Xóa thành công");

    await GetDSPhieuDK();

    if (lstDataDangKyVatTu.length === 0) {
        await resetToDefault();
    }

    $("#modalComfimrtDeleteVT").modal('hide');
}

async function DeleteAllPhieu() {
    await API.Get("Delete", { para1: selectSoPhieu, para2: '', para3: '' }, "Xóa phiếu thành công");
    await resetToDefault();
    chiTietLenhCache = {};

    $("#modalComfimrtDeleteVT").modal('hide');
}

async function UpdatePhieu() {
    const dataSource = dxDataGridEditVatTu.option("dataSource");
    const arrSave = [];
    if (dataSource.length === 0) {
        showToast("warning", "Không có dữ liệu để cập nhật");
        PlayAudioError();
        return;
    }

    const ngayCap = ddmmyyyyToYmd($("#ngayCapEdit").val());
    const gioCap = $("#gioCapEdit").val().trim();

    dataSource.map(item => {
        const objectUpdate = {
            PhieuDK: selectSoPhieu,
            MaLenhSX: item.MaLenhSanXuat || item.MaLenhSX,
            MaDH: item.StatusLan,
            MaLenh: item.MaLenh,
            MaNPL: item.MaNPL,
            SLDK: item.SLDK,
            GhiChu: item.GhiChu,
            MaVT: item.MaVT,
            MauVT: item.MauVT,
            KhoVai: item.KhoVai,
            MaDVVT: item.MaDVVT,
            NgayDK: item.NgayDK,
            NgayCap: ngayCap == "1990-01-01" ? item.NgayCap : ngayCap,
            GioCap: gioCap == "" ? item.GioCap : gioCap,
            IsNPL: item.IsNPL,
            NguoiDK: !window.CefSharp ? userNameSave : userName,
            Status: currentStatus,
        };

        arrSave.push(objectUpdate)
    })
    await API.Post("Post", arrSave, "Cập nhật thành công");
    $('#modalEditDKVT').modal('hide');
    await GetDSPhieuDK();

    // trả về lại null
    picker4.dates.setValue('');
    picker5.dates.setValue('');
}

/// HELPER FUNCTIONS
function updateGrid(grid, dataSource) {
    grid.beginUpdate();
    grid.option({ dataSource: dataSource });
    grid.endUpdate();
}

function resetModalState() {
    selectedItems = [];
    lstDataChiTietLenh = [];

    $('#itemList input[type="checkbox"]').prop('checked', false);
    $('#checkAll').prop('checked', false);
    $('#maLenhInput').val('');
    $('#dropdownList').removeClass('show');

    updateGrid(dxDataGridDangKyVatTu, []);
}

async function resetToDefault() {
    selectSoPhieu = '';
    lstDataDangKyVatTu = [];

    await GetPhieu();
    $("#maphieu").val('all').trigger("change");
    await GetPhieuMax();

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
        const isChecked = selectedItems.some(selected => selected.Display == item.Display);
        return `
            <div class="dropdown-item">
                <input type="checkbox" 
                       id="${item.STTPhieu}"
                       data-display="${item.Display}"
                       ${isChecked ? 'checked' : ''}>
                <label class="mb-0" for="${item.STTPhieu}">${item.Display}</label>
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

function updateInput() {
    const displayText = selectedItems.map(item => item.Display).join(', ');
    $('#maLenhInput').val(displayText);
}

function showLoading() {
    $('#loadingSpinner').fadeIn(200);
    $('#modalAddPhieu .modal-body section').css('opacity', '0.5');
}

function hideLoading() {
    $('#loadingSpinner').fadeOut(200);
    $('#modalAddPhieu .modal-body section').css('opacity', '1');
}

function updateSummary(grid) {
    const dataSource = grid.option("dataSource");

    const total = dataSource.reduce(
        (sum, item) => sum + (Number(item.SLDK) || 0),
        0
    );

    // CẮT 4 số thập phân – KHÔNG LÀM TRÒN
    let str = total.toString();
    let intPart = str;
    let decPart = "";

    if (str.includes(".")) {
        [intPart, decPart] = str.split(".");
        decPart = decPart.substring(0, 4);
    }

    const formattedInt = Number(intPart).toLocaleString("en");
    const result = decPart ? `${formattedInt}.${decPart}` : formattedInt;

    // tìm summary cell
    const columns = grid.option("columns");
    const visibleColumns = columns.filter(col => col.visible !== false);
    const sldkColumnIndex = visibleColumns.findIndex(col => col.dataField === "SLDK");

    if (sldkColumnIndex !== -1) {
        const $summaryRow = grid.element().find('.dx-datagrid-total-footer .dx-row');
        const $summaryCell = $summaryRow.find('td').eq(sldkColumnIndex);
        const $summaryItem = $summaryCell.find('.dx-datagrid-summary-item');

        if ($summaryItem.length) {
            $summaryItem.text(result);
        }
    }
}

/// EVENTS
$(document).ready(async function () {
    $(".select_2").select2();
    createViewDxDataGridDanhSachDangKy();
    createViewDxDataGridDangKyVatTu([]);
    createViewDxDataGridEditVatTu();
    createViewDxGridDanhSachPhieuDKVT();

    await GetMaLenh2();
    await GetDSPhieuDK();
    selectSoPhieu = $("#maphieu option:selected").val();
});

$(function () {

    $("#malenhdangky").select2({
        dropdownParent: $("#modalAddPhieu")
    })

    $("#khachhang").val("all").select2('destroy').select2();

    $("#home").on("click", () => window.location.href = '/Home/Dashboard');

    $("#khachhang").on("change", function () {
        GetMaLenh()
    });

    $('#maLenhInput').click(function (e) {
        e.stopPropagation();
        $('#dropdownList').toggleClass('show');
        $('#searchInput').val('').focus();
        renderList(batchData);
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
    });

    picker2 = new tempusDominus.TempusDominus(document.getElementById('datetimepicker2'), {
        display: {
            components: {
                calendar: true, date: true, month: true, year: true,
                clock: false, hours: false, minutes: false, seconds: false
            }
        },
        localization: { format: 'dd/MM/yyyy' }
    });

    picker3 = new tempusDominus.TempusDominus(document.getElementById('timepicker'), {
        display: {
            components: {
                calendar: false, date: false, month: false, year: false,
                clock: true, hours: true, minutes: true, seconds: true
            }
        },
        localization: { format: 'HH:mm:ss' }
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

    picker5 = new tempusDominus.TempusDominus(document.getElementById('timepicker2'), {
        display: {
            components: {
                calendar: false, date: false, month: false, year: false,
                clock: true, hours: true, minutes: true, seconds: true
            }
        },
        localization: { format: 'HH:mm:ss' }
    });



    $("#tuNgay").trigger("click");
    $("#ngayCap").trigger("click");
    $("#gioCap").trigger("click");
    picker1.hide();
    picker2.hide();
    picker3.hide();

    $('#searchInput').on('input', function () {
        const searchTerm = $(this).val().toLowerCase();
        const filtered = batchData.filter(item => item.Display.toLowerCase().includes(searchTerm));
        renderList(filtered);
    });

    $('#btnSavePhieu').on("click", async function () {

        try {
            const dataSource = dxDataGridDangKyVatTu.option("dataSource");

            if (dataSource.length === 0) {
                showToast("warning", "Chưa có thông tin đăng ký");
                PlayAudioError();
                return;
            }

            const ngayDK = ddmmyyyyToYmd($("#tuNgay").val());
            const ngayCap = ddmmyyyyToYmd($("#ngayCap").val());
            const gioCap = $("#gioCap").val();

            const arrSave = dataSource.map(item => ({
                PhieuDK: '',
                MaLenhSX: item.MaLenhSanXuat,
                MaDH: item.StatusLan,
                MaLenh: item.MaLenh,
                MaNPL: item.MaNPL,
                SLDK: item.MaCLVT !== "MACLVT_106" ? item.CapPhat : item.SLDK,
                GhiChu: item.GhiChu,
                MaVT: item.MaVT,
                MauVT: item.MauVT,
                KhoVai: item.KhoVai,
                MaDVVT: item.MaDVVT,
                NgayDK: ngayDK,
                NgayCap: ngayCap,
                GioCap: gioCap,
                IsNPL: item.NPL ? 1 : 0,
                NguoiDK: !window.CefSharp ? userNameSave : userName,
                Status: currentStatus,
            }));

            const phieuChuaNhapSLDK = arrSave.find(item => item.SLDK <= 0 || !item.SLDK);
            if (phieuChuaNhapSLDK) {
                // Tìm row index trong grid
                const rowIndex = dataSource.findIndex(item =>
                    item.MaNPL === phieuChuaNhapSLDK.MaNPL &&
                    item.MaLenhSanXuat === phieuChuaNhapSLDK.MaLenhSX
                );

                if (rowIndex !== -1) {
                    // Scroll đến row
                    dxDataGridDangKyVatTu.navigateToRow(dataSource[rowIndex]);

                    // Thêm class highlight vào row
                    setTimeout(() => {
                        const $row = $(`#dxDataGridDangKyVatTu .dx-data-row`).eq(rowIndex);
                        $row.addClass('highlight-row');

                        // Focus vào input SLDK
                        const $input = $row.find('.inputSLDK');
                        if ($input.length) {
                            $input.focus().select();

                            // Xóa highlight khi người dùng thay đổi số lượng
                            $input.one('input', function () {
                                $row.removeClass('highlight-row');
                            });
                        }
                    }, 100);
                }

                showToast("warning", `Item Code: ${phieuChuaNhapSLDK.MaVT} chưa nhập số lượng đăng ký`);
                PlayAudioError();
                return;
            }

            await SavePhieu(arrSave);
        }
        catch (err) {
            console.error(err);
        } finally {
            // Luôn mở lại nút sau khi xong
            setLoadingButton($btn, false);
        }

    });

    $('#checkAll').change(async function () {
        const isChecked = $(this).is(':checked');
        $('#itemList input[type="checkbox"]').prop('checked', isChecked);
        const selectedIds = $('#itemList input[type="checkbox"]:checked')
            .map(function () {
                return this.id;
            })
            .get();

        // Chuỗi STTPhieu ngăn cách bởi ;
        const sttPhieu = selectedIds.join(';');
        if (isChecked)
            selectedItems = [...batchData]
        else selectedItems = []
        //GetLenhChiTiet(sttPhieu)
        updateInput();

    });
    $(document).on('change', '#itemList input[type="checkbox"]', async function () {

        const selectedIds = $('#itemList input[type="checkbox"]:checked')
            .map(function () {
                return this.id;
            })
            .get();

        // Chuỗi STTPhieu
        const sttPhieu = selectedIds.join(';');

        // Tách chuỗi thành mảng
        const listSttPhieu = sttPhieu.split(';').filter(x => x);

        // Thêm vào selectedItems nếu chưa tồn tại
        listSttPhieu.forEach(id => {
            const item = batchData.find(x => x.STTPhieu == id);

            if (item && !selectedItems.some(x => x.STTPhieu == id)) {
                selectedItems.push(item);
            }
        });

        updateCheckAll();
        updateInput();
        //    GetLenhChiTiet(sttPhieu)
    });


    $("#maphieu").on("change", function () {
        const $selectedOption = $(this).find("option:selected");

        selectSoPhieu = $selectedOption.val();
        selectSoPhieuDisplay = $selectedOption.data("display") || '';
        GetDSPhieuDK();
    });

    $("#btnShowModal").on("click", function () {
        // Reset các picker về ngày giờ hiện tại
        const now = new tempusDominus.DateTime();
        picker1.dates.setValue(now);
        picker2.dates.setValue(now);
        picker3.dates.setValue(now);

        $("#modalAddPhieu").modal("show");
    });

    $("#btnDeleteAllPhieu").on("click", function () {
        if (selectSoPhieu == '' || !selectSoPhieu || selectSoPhieu === "all") {
            showToast("warning", "Vui lòng chọn phiếu để xóa");
            return;
        }
        isDeleteAll = true;
        $("#modalComfimrtDeleteVT").modal("show");
    });

    $("#btnEditAllPhieu").on("click", function () {
        if (selectSoPhieu == '' || !selectSoPhieu || selectSoPhieu === "all") {
            showToast("warning", "Vui lòng chọn phiếu để chỉnh sửa");
            return;
        }

        lstEditDangKyVatTu = dxDataGridDanhSachDangKy.option("dataSource")

        updateGrid(dxDataGridEditVatTu, lstEditDangKyVatTu)
        // Cập nhật ngày cấp và giờ cấp theo phiếu
        if (lstEditDangKyVatTu.length > 0) {
            const ngayCap = moment(lstEditDangKyVatTu[0].NgayCap).toDate();
            const gioCap = moment(lstEditDangKyVatTu[0].GioCap, "HH:mm:ss").toDate();

            picker4.dates.setValue(tempusDominus.DateTime.convert(ngayCap));
            picker5.dates.setValue(tempusDominus.DateTime.convert(gioCap));
        }
        isShowNgayCapAndGioCap = true
        $("#modalEditDKVT").modal("show");
        $("#txtNgayChinhSua").text(selectSoPhieuDisplay)
    });

    $("#btnConfirmtDeletePhieu").on("click", function () {
        if (isDeleteAllDK) {
            let dataSource = dxDataGridDangKyVatTu.option("dataSource");
            const deleteCount = selectedRowsToDelete.length;

            // Lọc bỏ tất cả các item đã chọn
            const updatedDataSource = dataSource.filter(item => {
                return !selectedRowsToDelete.some(selected =>
                    selected.MaLenhSanXuat === item.MaLenhSanXuat &&
                    selected.MaNPL === item.MaNPL
                );
            });

            updateGrid(dxDataGridDangKyVatTu, updatedDataSource);
            lstDataChiTietLenh = updatedDataSource;

            selectedRowsToDelete = [];
            $('#checkAllRows').prop('checked', false);
            $('.row-checkbox').prop('checked', false);

            showToast("success", `Đã xóa ${deleteCount} vật tư`);

            $("#txtSLVTDelete").empty();
            isDeleteAllDK = false;
            $("#modalComfimrtDeleteVT").modal("hide");
            return;
        }

        if (isDeleteDK) {
            let dataSource = dxDataGridDangKyVatTu.option("dataSource");
            const index = dataSource.findIndex(item =>
                item.MaLenhSanXuat === rowDelete.MaLenhSanXuat &&
                item.MaNPL === rowDelete.MaNPL
            );

            if (index !== -1) {
                dataSource.splice(index, 1);
                updateGrid(dxDataGridDangKyVatTu, dataSource);
                lstDataChiTietLenh = dataSource;
                selectedRowsToDelete = [];
                showToast("success", "Xóa thành công");
            }

            isDeleteDK = false;
            $("#modalComfimrtDeleteVT").modal("hide");

            return;
        }

        if (isDeleteAll) {
            DeleteAllPhieu();
        } else {
            DeletePhieu();
        }
    });

    // Khi đóng modal - reset tất cả checkbox và state
    $('#modalAddPhieu').on('hidden.bs.modal', function () {
        // Reset checkbox
        $('#itemList input[type="checkbox"]').prop('checked', false);
        $('#checkAll').prop('checked', false);
        $('#maLenhInput').val('');
        $('#dropdownList').removeClass('show');

        // Reset state
        selectedItems = [];
        lstDataChiTietLenh = [];
        $("#txtSLVTDelete").empty();
        // Clear grid
        if (dxDataGridDangKyVatTu) {
            updateGrid(dxDataGridDangKyVatTu, []);
        }
    });

    // Khi mở modal - khởi tạo lại
    $('#modalAddPhieu').on('shown.bs.modal', function () {
        GetKhachHang();
        GetPhieuMax();
        GetMaLenh();
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
    })

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
});



//Xử lý người dùng click nhiều lần khi đang submit dữ liệu (tránh gọi API trùng)
function setLoadingButton($btn, isLoading, text = "Đang lưu...") {
    if (isLoading) {
        $btn.data("original-text", $btn.html());
        $btn.prop("disabled", true);
        $btn.css("opacity", "0.6");
        $btn.html(`<i class="fa fa-spinner fa-spin"></i> ${text}`);
    } else {
        $btn.prop("disabled", false);
        $btn.css("opacity", "1");
        $btn.html($btn.data("original-text"));
    }
}
function handleBack() {
    // Reset checkbox
    $('#itemList input[type="checkbox"]').prop('checked', false);
    $('#checkAll').prop('checked', false);
    $('#maLenhInput').val('');
    $('#dropdownList').removeClass('show');

    // Reset state
    selectedItems = [];
    lstDataChiTietLenh = [];
    $("#txtSLVTDelete").empty();
    // Clear grid
    if (dxDataGridDangKyVatTu) {
        updateGrid(dxDataGridDangKyVatTu, []);
    }

    $("#modalAddPhieu").modal("hide")
}

/// DX DataGrid
function createViewDxDataGridDangKyVatTu(data) {
    data.forEach(function (item) {
        item.SLDKGoc = item.SLDK;

        // ✅ Deduplicate StatusLan
        if (item.StatusLanCu) {
            item.StatusLanCu = [...new Set(item.StatusLanCu.split(';').filter(Boolean).map(Number))]
                .sort(function (a, b) { return a - b; })
                .join(';');
        }
    });
    dxDataGridDangKyVatTu = $("#dxDataGridDangKyVatTu").dxDataGrid({
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

            { dataField: "MaDH", caption: "Mã ĐH", alignment: "center", minWidth: 120, visible: false },
            { dataField: "MaLenh", caption: "Mã Lệnh", alignment: "center", minWidth: 100 },
            { dataField: "MaVT", caption: "Item Code", alignment: "center", minWidth: 180 },
            { dataField: "MaNPL", caption: "Mã NPL", alignment: "center", minWidth: 120, visible: false },
            { dataField: "MauVT", caption: "Màu VT", alignment: "center", minWidth: 120 },
            { dataField: "KhoVai", caption: "Khổ/Size", alignment: "center", minWidth: 120 },
            {
                dataField: "TenDVVT",
                caption: "Đơn vị",
                alignment: "center",
                minWidth: 80,
            },
            {
                dataField: "DMTT",
                caption: "Định mức",
                alignment: "center",
                minWidth: 80,
            },
            {
                dataField: "CapPhat",
                caption: "SL Yêu cầu",
                alignment: "center",
                minWidth: 120,
                allowSorting: false,
                headerCellTemplate: function (header, info) {
                    const $container = $("<div></div>").css({
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "0 8px"
                    });
                    const $icon = $("<i></i>")
                        .addClass("fa-light fa-circle-arrow-right")
                        .css({
                            cursor: "pointer",
                            fontSize: "14px",
                            flexShrink: "0",
                            marginRight: "6px",
                        })
                        .on("click", function (e) {
                            e.stopPropagation();
                            const dataSource = dxDataGridDangKyVatTu.option("dataSource");
                            dataSource.forEach(item => {
                                //item.SLDK = item.CapPhat

                                if (item.CapPhat > item.SLCLDK) {
                                    showToast("warning", "Số lượng đăng ký không được lớn hơn số lượng còn lại");
                                    item.SLDK = item.SLCLDK;
                                } else {
                                    item.SLDK = item.CapPhat
                                }

                                refresh = true;
                            });

                            if (refresh) {
                                // Refresh grid để hiển thị dữ liệu mới
                                dxDataGridDangKyVatTu.refresh();
                            }
                        });
                    const $text = $("<span></span>")
                        .text(info.column.caption)
                        .css({
                            flexShrink: "0"
                        });
                    $container.append($text);
                    header.append($container);
                },
                cellTemplate: function (container, options) {
                    const $container = $("<div></div>").css(
                        {
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative"
                        }
                    );

                    const $icon = $("<i></i>")
                        .addClass("fa-light fa-circle-arrow-right")
                        .css({ position: "absolute", right: 1, color: "#00bbff", fontSize: 16, cursor: "pointer" })
                        .on("click", function (e) {
                            e.stopPropagation();

                            if (options.value > options.data.SLCLDK) {
                                showToast("warning", "Số lượng đăng ký không được lớn hơn số lượng còn lại");
                                options.data.SLDK = options.data.SLCLDK
                            } else {
                                options.data.SLDK = options.value
                            }

                            //options.data.SLDK = options.value
                            dxDataGridDangKyVatTu.refresh();
                        })

                    const $text = $("<span></span>")
                        .text(formatNumber(options.value))

                    $container.append($text);
                    container.append($container)
                }

            },

            {
                dataField: "SLDKGoc",
                caption: "SL đã đăng ký",
                alignment: "center",
                minWidth: 80,
            },
            {
                dataField: "SLCLDK",
                caption: "SL Còn Lại",
                allowSorting: false,
                headerCellTemplate: function (header, info) {
                    const $container = $("<div></div>").css({
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "0 8px"
                    });
                    const $icon = $("<i></i>")
                        .addClass("fa-light fa-circle-arrow-right")
                        .css({
                            cursor: "pointer",
                            fontSize: "14px",
                            flexShrink: "0",
                            marginRight: "6px",
                        })
                        .on("click", function (e) {
                            e.stopPropagation();
                            const dataSource = dxDataGridDangKyVatTu.option("dataSource");
                            dataSource.forEach(item => {
                                //item.SLDK = item.CapPhat

                                if (item.CapPhat > item.SLCLDK) {
                                    showToast("warning", "Số lượng đăng ký không được lớn hơn số lượng còn lại");
                                    item.SLDK = item.SLCLDK;
                                } else {
                                    item.SLDK = item.CapPhat
                                }

                                refresh = true;
                            });

                            if (refresh) {
                                // Refresh grid để hiển thị dữ liệu mới
                                dxDataGridDangKyVatTu.refresh();
                            }
                        });
                    const $text = $("<span></span>")
                        .text(info.column.caption)
                        .css({
                            flexShrink: "0"
                        });
                    $container.append($text);
                    header.append($container);
                },
                cellTemplate: function (container, options) {
                    const $container = $("<div></div>").css(
                        {
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative"
                        }
                    );

                    const $icon = $("<i></i>")
                        .addClass("fa-light fa-circle-arrow-right")
                        .css({ position: "absolute", right: 1, color: "#00bbff", fontSize: 16, cursor: "pointer" })
                        .on("click", function (e) {
                            e.stopPropagation();

                            options.data.SLDK = options.value
                            dxDataGridDangKyVatTu.refresh();
                        })

                    const $text = $("<span></span>")
                        .text(formatNumber(options.value))

                    $container.append($text);
                    container.append($container)
                }
            },
            {
                dataField: "SLDK",
                caption: "SL Đăng Ký",
                alignment: "center",
                minWidth: 120,
                allowSorting: false,
                headerCellTemplate: function (header, info) {
                    const $container = $("<div></div>").css({
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "0 8px"
                    });
                    const $icon = $("<i></i>")
                        .addClass("fa-light fa-rotate")
                        .css({
                            cursor: "pointer",
                            fontSize: "14px",
                            flexShrink: "0",
                            marginRight: "6px",
                        })
                        .on("click", function (e) {
                            e.stopPropagation();
                            const dataSource = dxDataGridDangKyVatTu.option("dataSource");
                            dataSource.forEach(item => {
                                item.SLDK = null
                                refresh = true;
                            });

                            if (refresh) {
                                // Refresh grid để hiển thị dữ liệu mới
                                dxDataGridDangKyVatTu.refresh();
                            }
                        });
                    const $text = $("<span></span>")
                        .text(info.column.caption)
                        .css({
                            flexShrink: "0"
                        });
                    $container.append($text);
                    header.append($container);
                },
                cellTemplate: function (container, options) {
                    // Mặc định SLDK = SLCLDK nếu SLDK null/undefined
                    if (options.data.SLDK == null || options.data.SLDK === undefined) {
                        options.data.SLDK = options.data.SLCLDK ?? 0;
                    }

                    const $input = $(`
                            <input type="number"
                                    class="form-control inputSLDK"
                                    value="${parseFloat(parseFloat(options.data.SLCLDK).toFixed(4)) ?? ''}" />
                        `);
                    $input.on("input", function () {
                        let value = this.value;
                        if (Number(value) < 0) {
                            showToast("warning", "Số lượng đăng ký không được âm");
                            this.value = "";
                            options.data.SLDK = null;
                            updateSummary(dxDataGridDangKyVatTu);
                            return;
                        }
                        if (value.includes(".")) {
                            const [intPart, decPart] = value.split(".");
                            this.value = intPart + "." + decPart.substring(0, 4);
                            value = this.value;
                        }
                        const allowOver = options.data.MaCLVT === "MACLVT_106";
                        if (!allowOver && Number(value) > options.data.SLCLDK) {
                            showToast("warning", "Số lượng đăng ký không được lớn hơn số lượng còn lại");
                            const truncated = Math.trunc(options.data.SLCLDK * 10000) / 10000;
                            console.log(truncated);
                            this.value = truncated;
                            options.data.SLDK = truncated;
                            updateSummary(dxDataGridDangKyVatTu);
                            return;
                        }
                        options.data.SLDK = value === "" ? null : Number(value);
                        updateSummary(dxDataGridDangKyVatTu);
                    });

                    // ✅ Khoá input nếu MaCLVT === "MACLVT_106"
                    if (options.data.MaCLVT !== "MACLVT_106") {
                        $input.prop("disabled", true)
                            .css({ backgroundColor: "#f0f0f0", cursor: "not-allowed" });
                    }
                    container.append($input);
                }
            },
            { dataField: "StatusLan", caption: "Lần", alignment: "center", minWidth: 80 },
            { dataField: "StatusLanCu", caption: "Lần cũ", alignment: "center", minWidth: 80 },
            {
                caption: "Chọn lần",
                width: 70,
                allowFiltering: false,
                visible: false,
                allowSorting: false,
                cellTemplate: function (container, options) {
                    $(`<i class="fa-solid fa-list" style="cursor:pointer; font-size:16px; color:#185FA5;"></i>`)
                        .on('click', function () {
                            showModalChonLan(
                                function () {
                                    // ✅ Xác nhận chọn lần
                                    var selected = getSelectedBarcodesModal();

                                    var tongSoLop = selected.reduce(function (sum, d) {
                                        return sum + (parseFloat(d.Solop) || 0);
                                    }, 0);

                                    var item = options.data;

                                    var capPhat = (parseFloat(item.DMTT) || 0) * tongSoLop;


                                    var sldk = parseFloat(item.SLDK) || 0;
                                    var slcldk = capPhat - sldk;

                                    item.CapPhat = capPhat;
                                    item.SLCLDK = Math.max(0, formatNumberToFixed(slcldk));

                                    item.SLDK = item.SLCLDK;
                                    var sttPhieuJoined = selected.map(function (d) { return d.STTPhieu; }).join(';');
                                    item.StatusLan = sttPhieuJoined

                                    dxDataGridDangKyVatTu.refresh();
                                },
                                function () {
                                    // ❌ Huỷ
                                }
                            );
                        })
                        .appendTo(container);
                }
            },
            {
                dataField: "GhiChu",
                caption: "Ghi chú",
                minWidth: 200,
                cellTemplate: function (container, options) {
                    const $input = $(`
                        <input type="text" class="form-control"
                               value="${options.data.GhiChu || ''}" />
                    `);

                    $input.on("input", function () {
                        options.data.GhiChu = this.value;
                    });

                    container.append($input);
                }
            },
            // THÊM CỘT CHECKBOX
            {
                caption: "",
                width: 50,
                alignment: "center",
                cellTemplate: function (container, options) {
                    const uniqueKey = `${options.data.MaLenhSanXuat}_${options.data.MaVT}`;
                    const isChecked = selectedRowsToDelete.some(item =>
                        item.MaLenhSanXuat === options.data.MaLenhSanXuat &&
                        item.MaNPL === options.data.MaNPL
                    );

                    const $checkbox = $(`
                        <input type="checkbox" 
                               class="row-checkbox" 
                               data-row-index="${options.rowIndex}"
                               ${isChecked ? 'checked' : ''}
                               style="width: 18px; height: 18px; cursor: pointer;" />
                    `);

                    $checkbox.on("change", function () {
                        if (this.checked) {
                            // Thêm vào danh sách đã chọn
                            if (!selectedRowsToDelete.some(item =>
                                item.MaLenhSanXuat === options.data.MaLenhSanXuat &&
                                item.MaNPL === options.data.MaNPL)) {
                                selectedRowsToDelete.push(options.data);
                            }
                        } else {
                            // Xóa khỏi danh sách đã chọn
                            selectedRowsToDelete = selectedRowsToDelete.filter(item =>
                                !(item.MaLenhSanXuat === options.data.MaLenhSanXuat &&
                                    item.MaNPL === options.data.MaNPL)
                            );
                        }
                    });

                    container.append($checkbox);
                },
                headerCellTemplate: function (container) {
                    const $checkAll = $(`
                        <input type="checkbox" 
                               id="checkAllRows" 
                               style="width: 18px; height: 18px; cursor: pointer;" />
                    `);

                    $checkAll.on("change", function () {
                        const isChecked = this.checked;
                        const dataSource = dxDataGridDangKyVatTu.option("dataSource");

                        if (isChecked) {
                            // Chọn tất cả
                            selectedRowsToDelete = [...dataSource];
                        } else {
                            // Bỏ chọn tất cả
                            selectedRowsToDelete = [];
                        }

                        // Update tất cả checkbox trong grid
                        $('.row-checkbox').prop('checked', isChecked);
                    });

                    container.append($checkAll);
                }
            },
            {
                caption: "Xóa",
                minWidth: 50,
                alignment: "center",
                cellTemplate: function (container, options) {
                    // Thêm nút
                    $("<div>")
                        .css({
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "25px"
                        })
                        .append(
                            $("<i>")
                                .addClass("fa-solid fa-trash-can")
                                .css({ fontSize: "15px", color: "red", cursor: "pointer" })
                                .on("click", function () {
                                    rowDelete = options.data;
                                    isDeleteDK = true;
                                    $("#modalComfimrtDeleteVT").modal("show");
                                })
                        )
                        .appendTo(container);
                }
            }
        ],
        summary: {
            totalItems: [{
                column: "SLDK",
                summaryType: "sum",
                customizeText(e) {
                    if (e.value == null) return "";

                    let str = e.value.toString();
                    let intPart = str;
                    let decPart = "";

                    if (str.includes(".")) {
                        [intPart, decPart] = str.split(".");
                        decPart = decPart.substring(0, 4); // cắt, không làm tròn
                    }

                    const formattedInt = Number(intPart).toLocaleString("en");
                    return decPart ? `${formattedInt}.${decPart}` : formattedInt;
                }
            },
            {
                column: "CapPhat",
                summaryType: "sum",
                customizeText(e) {
                    if (e.value == null) return "";

                    let str = e.value.toString();
                    let intPart = str;
                    let decPart = "";

                    if (str.includes(".")) {
                        [intPart, decPart] = str.split(".");
                        decPart = decPart.substring(0, 4); // cắt, không làm tròn
                    }

                    const formattedInt = Number(intPart).toLocaleString("en");
                    return decPart ? `${formattedInt}.${decPart}` : formattedInt;
                }
            }]
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
       
        
    }).dxDataGrid("instance");
    setTimeout(function myfunction() {
        dxDataGridDangKyVatTu.repaint()
    },500)
    $("#Layer_1").click();
}
function createViewDxDataGridDanhSachDangKy() {
    dxDataGridDanhSachDangKy = $("#dxDataGridDanhSachDangKy").dxDataGrid({
        dataSource: lstDataChiTietLenh,
        keyExpr: "",
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
        sorting: { mode: "none" },
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

            { dataField: "MaDH", caption: "Mã ĐH", alignment: "center", minWidth: 150, visible: false },
            { dataField: "Display", caption: "Mã Lệnh", alignment: "center", minWidth: 250 },
            { dataField: "MaVT", caption: "Item Code", alignment: "center", minWidth: 180 },
            { dataField: "MaNPL", caption: "Mã NPL", alignment: "center", minWidth: 120, visible: false },
            { dataField: "MauVT", caption: "Màu VT", alignment: "center", minWidth: 120 },
            { dataField: "KhoVai", caption: "Khổ/Size", alignment: "center", minWidth: 120 },
            {
                dataField: "TenDVVT",
                caption: "Đơn vị",
                alignment: "center",
                minWidth: 80,
            },
            {
                dataField: "CapPhat",
                caption: "SL Cấp Phát",
                alignment: "center",
                minWidth: 120,
                cellTemplate: function (container, options) {
                    let value = options.value;

                    if (value === null || value === undefined) {
                        container.text("");
                        return;
                    }

                    let result = formatNumber(value)
                    container.text(result);
                }
            },
            {
                dataField: "SLDK",
                caption: "SL Đăng Ký",
                alignment: "center",
                minWidth: 120,
                cellTemplate: function (container, options) {
                    let value = options.value;

                    if (value === null || value === undefined) {
                        container.text("");
                        return;
                    }

                    let result = formatNumber(value)
                    container.text(result);
                }
            },
            {
                dataField: "NgayCap",
                caption: "Ngày Cấp",
                alignment: "center",
                minWidth: 150,
                format: "dd/MM/yyyy",
                cellTemplate: function (container, options) {
                    const dateConvert = moment(options.value).format("DD/MM/YYYY")
                    container.text(dateConvert)
                }

            },
            {
                dataField: "GioCap",
                caption: "Giờ Cấp",
                alignment: "center",
                minWidth: 150,
                cellTemplate: function (container, options) {
                    if (!options.value) return;

                    const timeConvert = moment(options.value, "HH:mm:ss").format("HH:mm");
                    container.text(timeConvert);
                }
            },
            {
                dataField: "GhiChu",
                caption: "Ghi chú",
                minWidth: 200,
            },
            {
                dataField: "NguoiDK",
                caption: "Người đăng ký",
                minWidth: 200,
            },
            {
                caption: "Xóa",
                minWidth: 100,
                alignment: "center",
                cellTemplate: function (container, options) {
                    if (options.data.CheckPXH != '0') {
                        return;
                    }

                    const $wrapper = $(`<div></div>`).css({ display: "flex", justifyContent: "center", height: "25px", gap: "8px" })
                    // Thêm nút
                    //const $btnEdit = $("<div>")
                    //    .append(
                    //        $("<i>")
                    //            .addClass("fa-solid fa-pen-to-square")
                    //            .css({ fontSize: "16px", color: "red", cursor: "pointer" })
                    //            .on("click", function () {
                    //                rowEdit = { ...options.data };
                    //                dxDataGridEditVatTu.option("dataSource", [rowEdit]);
                    //                $("#modalEditDKVT").modal("show");
                    //            })
                    //    )
                    //    .appendTo(container);

                    // Thêm nút
                    const $btnDelete = $("<div>")
                        .append(
                            $("<i>")
                                .addClass("fa-solid  fa-trash")
                                .css({ fontSize: "16px", color: "red", cursor: "pointer" })
                                .on("click", function () {
                                    rowDelete = options.data
                                    $("#modalComfimrtDeleteVT").modal('show')
                                })
                        )
                        .appendTo(container);

                    $wrapper.append($btnDelete, /*$btnEdit*/).appendTo(container)
                }

            }
        ],
        summary: {
            totalItems: [{
                column: "SLDK",
                summaryType: "sum",
                customizeText(e) {
                    if (e.value == null) return "";

                    let str = e.value.toString();
                    let intPart = str;
                    let decPart = "";

                    if (str.includes(".")) {
                        [intPart, decPart] = str.split(".");
                        decPart = decPart.substring(0, 4); // cắt, không làm tròn
                    }

                    const formattedInt = Number(intPart).toLocaleString("en");
                    return decPart ? `${formattedInt}.${decPart}` : formattedInt;
                }
            },
            {
                column: "CapPhat",
                summaryType: "sum",
                customizeText(e) {
                    if (e.value == null) return "";

                    let str = e.value.toString();
                    let intPart = str;
                    let decPart = "";

                    if (str.includes(".")) {
                        [intPart, decPart] = str.split(".");
                        decPart = decPart.substring(0, 4); // cắt, không làm tròn
                    }

                    const formattedInt = Number(intPart).toLocaleString("en");
                    return decPart ? `${formattedInt}.${decPart}` : formattedInt;
                }
            }
            ]
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
    }).dxDataGrid("instance");
    
    $("#Layer_1").click()
}
function createViewDxDataGridEditVatTu() {
    dxDataGridEditVatTu = $("#dxDataGridEditVatTu").dxDataGrid({
        dataSource: [],
        width: '100%',
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
                dataField: "MaDH",
                caption: "Mã ĐH",
                alignment: "center",
                minWidth: 150,
                allowEditing: false,
                visible: false
            },
            {
                dataField: "MaLenh",
                caption: "Mã Lệnh",
                alignment: "center",
                minWidth: 100,
                allowEditing: false
            },
            {
                dataField: "MaVT",
                caption: "Item Code",
                alignment: "center",
                minWidth: 180,
                allowEditing: false
            },
            {
                dataField: "MauVT",
                caption: "Màu VT",
                alignment: "center",
                minWidth: 120,
                allowEditing: false
            },
            {
                dataField: "KhoVai",
                caption: "Khổ/Size",
                alignment: "center",
                minWidth: 100,
                allowEditing: false
            },
            {
                dataField: "TenDVVT",
                caption: "Đơn vị",
                alignment: "center",
                minWidth: 80,
                allowEditing: false
            },
            {
                dataField: "CapPhat",
                caption: "SL Cấp Phát",
                alignment: "center",
                minWidth: 120,
                cellTemplate: function (container, options) {
                    let value = options.value;

                    if (value === null || value === undefined) {
                        container.text("");
                        return;
                    }

                    let result = formatNumber(value)
                    container.text(result);
                }
            },
            {
                dataField: "SLDK",
                caption: "SL Đăng Ký",
                alignment: "center",
                minWidth: 120,
                cellTemplate: function (container, options) {
                    // CẮT 4 số thập phân – KHÔNG LÀM TRÒN
                    const truncated = Math.trunc(options.data.SLDK * 10000) / 10000;

                    // Bỏ số 0 dư
                    truncated.toString();

                    const $input = $(`
                        <input type="number"
                               class="form-control inputSLDK"
                               value="${truncated ?? ''}" />
                    `);

                    $input.on("input", function () {
                        let value = this.value;

                        // Không cho số âm
                        if (Number(value) < 0) {
                            showToast("warning", "Số lượng đăng ký không được âm");
                            this.value = "";
                            options.data.SLDK = null;
                            updateSummary(dxDataGridEditVatTu);
                            return;
                        }

                        // Chỉ cho tối đa 4 số thập phân 
                        if (value.includes(".")) {
                            const [intPart, decPart] = value.split(".");
                            this.value = intPart + "." + decPart.substring(0, 4);
                            value = this.value;
                        }

                        if (Number(value) > options.data.CapPhat) {
                            showToast("warning", "Số lượng đăng ký không được lớn hơn số lượng cấp phát");
                            this.value = options.data.CapPhat;
                            options.data.SLDK = options.data.CapPhat;
                            updateSummary(dxDataGridEditVatTu);
                            return;
                        }

                        options.data.SLDK = value === "" ? null : value
                        updateSummary(dxDataGridEditVatTu);
                    });
                    container.append($input);
                }
            },
            {
                dataField: "GhiChu",
                caption: "Ghi chú",
                minWidth: 200,
                cellTemplate: function (container, options) {
                    const $input = $(`
                        <input type="text" class="form-control"
                               value="${options.data.GhiChu || ''}" />
                    `);

                    $input.on("input", function () {
                        options.data.GhiChu = this.value;
                    });

                    container.append($input);
                }
            }
        ],
        summary: {
            totalItems: [{
                column: "SLDK",
                summaryType: "sum",
                customizeText(e) {
                    if (e.value == null) return "";

                    const value = Number(e.value);

                    // CẮT 4 số thập phân – KHÔNG LÀM TRÒN
                    const truncated = Math.trunc(value * 10000) / 10000;

                    // Bỏ số 0 dư
                    return truncated.toString();
                }
            },
            {
                column: "CapPhat",
                summaryType: "sum",
                customizeText(e) {
                    if (e.value == null) return "";

                    let str = e.value.toString();
                    let intPart = str;
                    let decPart = "";

                    if (str.includes(".")) {
                        [intPart, decPart] = str.split(".");
                        decPart = decPart.substring(0, 4); // cắt, không làm tròn
                    }

                    const formattedInt = Number(intPart).toLocaleString("en");
                    return decPart ? `${formattedInt}.${decPart}` : formattedInt;
                }
            }
            ]
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
        }
    }).dxDataGrid("instance");
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


function formatNumber(value) {
    if (value === null || value === undefined || value === "" || isNaN(Number(value))) {
        return "0";
    }

    let str = Number(value).toString();
    let intPart = str;
    let decPart = "";
    if (str.includes(".")) {
        [intPart, decPart] = str.split(".");
        decPart = decPart.substring(0, 4);
    }
    let formattedInt = Number(intPart).toLocaleString();
    return decPart ? `${formattedInt}.${decPart}` : formattedInt;
}
$("#btnDelete").on("click", async function () {
    $("#txtSLVTDeletePhieu").text($("#maphieu option:selected").text())
    showDeleteodalPhieu(async function () {
        await API.Get("Delete", {
            para1: $("#maphieu").val(),
            para2: "",
            para3: ""
        }, "Xóa thành công");

        await GetPhieu();
        $("#maphieu").val('all').trigger("change");

        return true; // ✅ cho đóng
    })
})

function showDeleteodalPhieu(onConfirm) {
    $('#btnConfirmtDeletePhieuVT').off('click').on('click', async function () {
        if (typeof onConfirm === 'function') {
            const result = await onConfirm();

            if (result === false) {
                return; // ❌ KHÔNG đóng modal
            }
        }

        // ✅ Chỉ đóng khi hợp lệ
        $("#modalComfimrtDeletePhieu").modal("hide");
    });

    $("#modalComfimrtDeletePhieu").modal("show");
}

///

function renderItemList() {
    $("#gridLan").dxDataGrid({
        dataSource: dataLan,
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
                dataField: "Selected",
                caption: "",
                width: 46,
                allowFiltering: false,
                allowSorting: false,
                cellTemplate: function (container, options) {
                    $("<input>")
                        .attr({ type: "checkbox" })
                        .prop("checked", options.row.data.isCheck === 1)
                        .css({ width: "15px", height: "15px", cursor: "pointer", accentColor: "#185FA5" })
                        .on("change", function () {
                            var checked = this.checked;
                            options.row.data.isCheck = checked ? 1 : 0;
                            options.row.data.Selected = checked;

                            // Highlight hàng ngay lập tức
                            if (checked) {
                                $(options.rowElement).css("background-color", "#e8f0fe");
                            } else {
                                $(options.rowElement).css("background-color", "");
                            }

                            syncCheckAllHeader(); // cập nhật trạng thái checkbox header
                        })
                        .appendTo(container);
                },
                headerCellTemplate: function (container) {
                    $("<input>")
                        .attr({ type: "checkbox", id: "checkAllHeader", title: "Chọn / Bỏ tất cả" })
                        .css({ width: "15px", height: "15px", cursor: "pointer", accentColor: "#185FA5" })
                        .appendTo(container);
                }
            },

            { dataField: "Display", caption: "Lần", alignment: "center", minWidth: 90 },
            { dataField: "MauVT", caption: "Màu", alignment: "center", minWidth: 110 },
            { dataField: "Size", caption: "Size", alignment: "center", minWidth: 90 },
            { dataField: "Solop", caption: "Số lượng", alignment: "center", minWidth: 110 },


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

    });
}

$(function () {
    $(document).off("change", "#checkAllHeader").on("change", "#checkAllHeader", function () {
        var chk = this.checked;
        dataLan.forEach(function (d) {
            d.isCheck = chk ? 1 : 0;
            d.Selected = chk;
        });

        // Repaint để cellTemplate vẽ lại checkbox từng hàng
        var grid = $("#gridLan").dxDataGrid("instance");
        grid.repaint();

    });
})



function syncCheckAllHeader() {
    var total = dataLan.length;
    var checked = dataLan.filter(function (d) { return d.isCheck === 1; }).length;
    var $header = $("#checkAllHeader");
    if (!$header.length) return;

    if (checked === 0) {
        $header.prop({ checked: false, indeterminate: false });
    } else if (checked === total) {
        $header.prop({ checked: true, indeterminate: false });
    } else {
        $header.prop({ checked: false, indeterminate: true }); // ✅ trạng thái "-" khi chọn 1 phần
    }
    GetDanhSachCheck()
}


function getSelectedBarcodes() {
    return dataLan.filter(function (d) { return d.isCheck === 1; });
}
function GetDanhSachCheck() {
    var selected = getSelectedBarcodes();

    const lan = selected
        .map(x => x.STTPhieu)
        .join(';');

    if (lan == "") return
    GetLenhChiTiet(lan);
}
