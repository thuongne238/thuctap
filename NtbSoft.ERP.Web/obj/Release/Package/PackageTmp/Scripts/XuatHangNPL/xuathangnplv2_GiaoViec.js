//Mỹ
let listPhieuDK = [];
let maLenhDK = '';
let dataGiaoViec = [];

$('#btnGiaoViec').on("click", function () {
    showModalGiaoViec();
})

function showModalGiaoViec() {
    $("#modalGiaoViec").modal("show");
    getPhieuDK();
    createDateXuatHang();
}
$("#modalGiaoViec").on('hidden.bs.modal', function () {
    const grid = $("#dxDataGridGiaoViec").dxDataGrid("instance");
    grid.option("dataSource", []);
});
function createDateXuatHang() {
    const dateXuatHang = new tempusDominus.TempusDominus(document.getElementById('datetimepickerXuatHang'), {
        display: {
            components: {
                calendar: true, date: true, month: true, year: true,
                clock: false, hours: false, minutes: false, seconds: false
            }
        },
        localization: { format: 'dd/MM/yyyy' }
    });

    $("#ngayXuatHang").trigger("click");
    dateXuatHang.hide();
}

async function getPhieuDK() {
    const maLenhSX = trMaLenh;
    const trloc = $(".select_loc").val();
    let action = ""
    if (trloc == 2) {
        action = "GetPhieuDangKyVTBenNgoai"
        $(".colMaLenh").hide()
    }
    else if (trloc == 3) {
        action = "GetPhieuDangKyVTNgoaiDonHang"
        $(".colMaLenh").hide()
    }else {
        action = "GetPhieuDangKyVT"
        $(".colMaLenh").show()
    }
    const url = `/api/PhieuXuatHangNPL/Get?action=${action}&para1=${maLenhSX}&para2=${trloc}&para3=${trMaPhieu}`;

    try {
        const response = await fetch(url);
        const rawData = await response.json();

        const uniqueData = Array.from(new Map(rawData.map(item => [item['PhieuDK'], item])).values());

        renderPhieuDK(uniqueData, maLenhSX);


    } catch (error) {
        console.error("Lỗi khi fetch dữ liệu:", error);
    }
}

function renderPhieuDK(data, maLenhSX) {
    const $select = $("#phieuDK");
    $select.empty();
    $select.append('<option value="">-- Chọn phiếu --</option>');

    let html = ``;

    data.forEach(item => {
        html += `
            <option value="${item.PhieuDK}" 
                    data-malenh="${item.MaLenh}"
                    data-malenhsx="${maLenhSX}"
                    data-ngay="${item.NgayGiaoViec}">
                ${item.Display}
            </option>
        `
    });

    $select.html(html);
    $select.select2({
        dropdownParent: $('#modalGiaoViec')
    });

    if ($select.hasClass('select_2')) {
        $select.trigger('change');
    }
}

$('#phieuDK').on('change', function () {
    const selectedOption = $(this).find('option:selected');

    const maLenh = selectedOption.data('malenh');
    const maLenhSX = selectedOption.data('malenhsx');
    const ngayGiao = selectedOption.data('ngay');

    $("#txtMaLenh").val(maLenh || "");
    $("#ngayXuatHang").val(ngayGiao || "");

    const selectedPhieu = $(this).val();
    if (selectedPhieu) {
        getItemCode(selectedPhieu, maLenhSX);
    }
});

async function getItemCode(phieudk, malenhsx) {
    const trloc = $(".select_loc").val();
    let malenhSanXuat = ""
    let phieudangky = ""
    if (trloc == 2) {
        action = "GetItemCodeGiaoViecPYCNPL"
        phieudangky = trloc
        malenhSanXuat = trMaPhieu
    }
   else if (trloc == 3) {
        action = "GetItemGiaoViecNgoaiDonHang"
        phieudangky = trloc
        malenhSanXuat = trMaPhieu
    }else {
        action = phieudk == 'CP' ? "GetItemCodeGiaoViecCapPhat" : "GetItemCodeGiaoViec"
        malenhSanXuat = malenhsx
        phieudangky = phieudk
    }

    const url = `/api/PhieuXuatHangNPL/Get?action=${action}&para1=${trMaPhieu}&para2=${malenhSanXuat}&para3=1&para4=${phieudangky}&para5=${trloc}`;

    try {
        const respone = await fetch(url);
        const dataToGrid = await respone.json();

        dataGiaoViec = dataToGrid;

        checkDisableHeader(dataGiaoViec);
        renderItemCodeList(dataToGrid);
    } catch (error) {
        console.error("Lỗi lấy Item Code:", error);
    }
}

function renderItemCodeList(dataToGrid) {
    const $itemList = $('#itemListGiaoViec');
    $itemList.empty();

    dataToGrid.forEach(ma => {
        $itemList.append(`
            <div class="dropdown-item">
                <input type="checkbox" data-text="${ma.Display}" class="item-checkbox-gv" id="chk_gv_${ma.MaNPL}" value="${ma.MaNPL}" checked>
                <label for="chk_gv_${ma.MaNPL}">${ma.Display}</label>
            </div>
        `);
    });

    $('#checkAllGiaoViec').prop('checked', true);
    $('#itemCodeGiaoViec').val('');

    setupDropdown();
    updateInputTextGiaoViec();
}

function updateInputTextGiaoViec() {
    const selectedValues = $('.item-checkbox-gv:checked').map(function () {
        return $(this).val();
    }).get();
    const selectedValuesText = $('.item-checkbox-gv:checked').map(function () {
        return $(this).data("text");
    }).get();
    $('#itemCodeGiaoViec').val(selectedValuesText.join(', '));

    if (selectedValues.length === 0) {
        updateGridDataSource([]);
    } else {
        const filteredData = dataGiaoViec.filter(item => selectedValues.includes(item.MaNPL));
        updateGridDataSource(filteredData);
    }
}

function setupDropdown() {
    $('#itemCodeGiaoViec').off('click').on('click', function (e) {
        e.stopPropagation();
        $('#dropdownGiaoViec').stop().slideToggle(200);
    });

    $(document).off('change', '#checkAllGiaoViec').on('change', '#checkAllGiaoViec', function () {
        const isChecked = $(this).prop('checked');
        $('.item-checkbox-gv').prop('checked', isChecked);
        updateInputTextGiaoViec();
    });

    $(document).off('change', '.item-checkbox-gv').on('change', '.item-checkbox-gv', function () {
        const allChecked = $('.item-checkbox-gv:checked').length === $('.item-checkbox-gv').length;
        $('#checkAllGiaoViec').prop('checked', allChecked);
        updateInputTextGiaoViec();
    });

    $('#searchItemGiaoViec').on('keyup', function () {
        const val = $(this).val().toLowerCase();
        $('#itemListGiaoViec .dropdown-item').each(function () {
            const text = $(this).text().toLowerCase();
            $(this).toggle(text.indexOf(val) > -1);
        });
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.select-container').length) {
            $('#dropdownGiaoViec').hide();
        }
    });
}

function updateGridDataSource(data) {
    createGridGiaoViec();
    const grid = $("#dxDataGridGiaoViec").dxDataGrid("instance");
    if (grid) {
        grid.option("dataSource", data);
    }
}

function createGridGiaoViec() {
    $("#dxDataGridGiaoViec").dxDataGrid({
        dataSource: [],
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
        grouping: { autoExpandAll: true },
        groupPanel: { visible: false },
        loadPanel: {
            enabled: true,
            text: "Đang tải dữ liệu...",
            showIndicator: true,
            showPane: true
        },
        columns: createColumnsGiaoViec(),
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
    }).dxDataGrid('instance');
}

function createColumnsGiaoViec() {
    return [
        { dataField: "MaVT", caption: "Item Code" },
        { dataField: "MauVT", caption: "Màu VT" },
        { dataField: "KhoVai", caption: "Khổ size" },
        { dataField: "TenDVVT", caption: "Đơn Vị" },
        { dataField: "MaONPL", caption: "Vị Trí Ô" },
        {
            dataField: "CapPhat",
            caption: "Cấp phát",
            visible: false,
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
                        fontSize: "16px",
                        flexShrink: "0",
                        marginRight: "6px",
                    })
                    .on("click", function (e) {
                        e.stopPropagation();
                        let refresh = false;
                        const gridInstance = $("#dxDataGridGiaoViec").dxDataGrid("instance");
                        const dataSource = gridInstance.option("dataSource");

                        dataSource.forEach(item => {
                            if (!(item.SLNhap > 0)) {
                                if (item.CapPhat > item.SLDK) {
                                    showToast("warning", `Item ${item.MaVT}: Soạn hàng không được lớn hơn Đăng ký`);
                                    item.SLCanXuat = item.SLDK;
                                } else {
                                    item.SLCanXuat = item.CapPhat;
                                }
                                refresh = true;
                            }
                        });

                        if (refresh) {
                            gridInstance.refresh();
                        }
                    });
                const $text = $("<span></span>")
                    .text(info.column.caption)
                    .css({
                        flexShrink: "0"
                    });
                $container.append($text, $icon);
                header.append($container);
            },
            cellTemplate: function (container, options) {
                const isExported = (options.data.SLNhap || 0) > 0;

                const $container = $("<div></div>").css(
                    {
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative"
                    }
                );

                const $text = $("<span></span>")
                    .text(formatNumber(options.value))

                $container.append($text);

                if (!isExported) {
                    const $icon = $("<i></i>")
                        .addClass("fa-light fa-circle-arrow-right")
                        .css({ position: "absolute", right: 1, color: "#00bbff", fontSize: 16, cursor: "pointer" })
                        .on("click", function (e) {
                            e.stopPropagation();
                            if (options.data.CapPhat > options.data.SLDK) {
                                showToast("warning", "Số lượng soạn hàng không được lớn hơn số lượng đăng ký");
                                options.data.SLCanXuat = options.data.SLDK;
                            } else {
                                options.data.SLCanXuat = options.value;
                            }
                            $("#dxDataGridGiaoViec").dxDataGrid("instance").refresh();
                        });
                    $container.append($icon);
                }
                container.append($container)
            }
        },
        {
            dataField: "SLDK",
            caption: "SL Đăng ký",
            allowSorting: false,
            visible: false,
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
                        fontSize: "16px",
                        flexShrink: "0",
                        marginRight: "6px",
                    })
                    .on("click", function (e) {
                        e.stopPropagation();
                        let refresh = false;
                        const gridInstance = $("#dxDataGridGiaoViec").dxDataGrid("instance");
                        const dataSource = gridInstance.option("dataSource");

                        dataSource.forEach(item => {
                            // CHỈ ÁP DỤNG cho dòng chưa xuất hàng
                            if (!(item.SLNhap > 0)) {
                                item.SLCanXuat = item.SLDK;
                                refresh = true;
                            }
                        });

                        if (refresh) {
                            gridInstance.refresh();
                        }
                    });
                const $text = $("<span></span>")
                    .text(info.column.caption)
                    .css({
                        flexShrink: "0"
                    });
                $container.append($text, $icon);
                header.append($container);
            },
            cellTemplate: function (container, options) {
                const isExported = (options.data.SLNhap || 0) > 0;

                const $container = $("<div></div>").css(
                    {
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative"
                    }
                );

                const $text = $("<span></span>").text(formatNumber(options.value));
                $container.append($text);

                if (!isExported) {
                    const $icon = $("<i></i>")
                        .addClass("fa-light fa-circle-arrow-right")
                        .css({ position: "absolute", right: 1, color: "#00bbff", fontSize: 16, cursor: "pointer" })
                        .on("click", function (e) {
                            e.stopPropagation();
                            options.data.SLCanXuat = options.value;
                            $("#dxDataGridGiaoViec").dxDataGrid("instance").refresh();
                        });
                    $container.append($icon);
                }

                container.append($container)
            }
        },
        {
            dataField: "SLCanXuat",
            caption: "SL Soạn hàng",
        },
        { dataField: "SLNhap", caption: "SL Xuất hàng" },
        {
            dataField: "NguoiGiaoViec",
            caption: "Người Giao Việc",
            minWidth: 200,
            headerCellTemplate: function (header, info) {
                const $container = $("<div>").css({
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "0 8px"
                });

                const $text = $("<span>").text(info.column.caption);

                const $icon = $("<i>")
                    .addClass("fa fa-user-plus")
                    .css({
                        cursor: "pointer",
                        fontSize: "16px",

                    })
                    .on("click", async function (e) {
                        e.stopPropagation();

                        const nguoi = await openModalNguoiGiaoViec();
                        if (!nguoi) return;

                        const gridInstance = $("#dxDataGridGiaoViec").dxDataGrid("instance");
                        const dataSource = gridInstance.option("dataSource");

                        let hasChange = false;
                        dataSource.forEach(row => {
                            if (!(row.SLNhap > 0)) {
                                row.NguoiGiaoViec = nguoi;
                                hasChange = true;
                            }
                        });

                        if (hasChange) {
                            gridInstance.refresh();
                            showToast("success", "Đã cập nhật người giao việc cho các dòng chưa xuất hàng");
                        } else {
                            showToast("info", "Không có dòng nào khả dụng để cập nhật");
                        }
                    });

                $container.append($text, $icon);
                header.append($container);
            },
            cellTemplate: function (container, options) {
                const item = options.data;
                const isExported = (item.SLNhap || 0) > 0;


                const $wrapper = $("<div>").css({
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                });

                const $input = $(`<input style='font-size:13px' type="text" class="form-control inputSoanHang ${isExported ? 'input-disabled' : ''}" ${isExported ? 'disabled' : ''} />`)
                    .val(item.NguoiGiaoViec || '')
                    .on("input", function () {
                        item.NguoiGiaoViec = this.value;
                    });

                const $btn = $("<i></i>")
                    .addClass("fa fa-user-plus")
                    .css({
                        cursor: "pointer",
                        fontSize: "16px",
                        color: "#6d97f3",
                        pointerEvents: isExported ? "none" : "auto"
                    });

                if (!isExported) {
                    $btn.on("click", async function (e) {
                        e.stopPropagation();
                        const nguoi = await openModalNguoiGiaoViec();
                        if (!nguoi) return;
                        item.NguoiGiaoViec = nguoi;
                        $input.val(nguoi);
                        options.component.repaintRows([options.rowIndex]);
                    });
                }

                $wrapper.append($input, $btn);
                container.append($wrapper);
            }
        },
        {
            dataField: "GhiChu",
            caption: "Ghi chú",
            cellTemplate: function (container, options) {
                const isExported = (options.data.SLNhap || 0) > 0;

                const $input = $(`
                        <input type="text"
                                class="form-control inputGhiChu"
                                style= "font-size:14px"
                                value="${options.data.GhiChu ?? ''}"
                                ${isExported ? 'disabled' : ''} />
                    `);

                if (!isExported) {
                    $input.on("input", function () {
                        let value = this.value;
                        options.data.GhiChu = value === "" ? null : value;
                    });
                }

                container.append($input);
            }
        },
        //{ dataField: "", caption: "" },
        //{ dataField: "", caption: "" },
    ];
}

// ===== MỞ MODAL Người Soạn Hàng =====
var _selectedNguoiSoan = ""
function openModalNguoiGiaoViec() {
    return new Promise(async (resolve) => {

        await GetViewNguoiGiaoViec();

        renderNguoiGiaoViec();
        updatePreview();

        const $modalEl = $("#modalNguoiGiaoViec");
        const modal = bootstrap.Modal.getOrCreateInstance($modalEl[0]);

        modal.show();

        $("#confirmBtn").off("click").on("click", function () {
            if (!_selectedNguoiSoan) {
                showToast("warning", "Vui lòng chọn người soạn hàng");
                return;
            }

            modal.hide();
            resolve(_selectedNguoiSoan);
        });

        $modalEl.off("hidden.bs.modal").on("hidden.bs.modal", function () {
            $('#searchInput').val('');
            _selectedNguoiSoan = null;
            _currentRowData = null;
            console.log(1)
            renderNguoiGiaoViec('');
            updatePreview();
            resolve(null);
        });

    });
}

// ===== CALL API =====
async function GetViewNguoiGiaoViec() {
    const url = `/api/PhieuXuatHangNPL/Get?Action=GetDSNGVNL`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);
        const data = await response.json();

        _nguoiSoanList = data.map(x => x.NguoiGiaoViec);
    } catch (error) {
        console.error("error", error);
    }
}


// ===== RENDER =====
function renderNguoiGiaoViec(query = '') {
    const $grid = $('#tableNguoiGiaoViec');
    const $empty = $('#emptyState');
    const $badge = $('#countBadge');

    const filtered = _nguoiSoanList.filter(name =>
        name.toLowerCase().includes(query.toLowerCase())
    );

    $grid.empty();

    if (filtered.length === 0) {
        $empty.removeClass('d-none');
    } else {
        $empty.addClass('d-none');

        $.each(filtered, function (_, name) {
            const isSelected = _selectedNguoiSoan === name;

            const $div = $('<div>')
                .addClass(isSelected ? 'picker-item selected' : 'picker-item')
                .html(highlight(name, query))
                .on('click', function () {
                    _selectedNguoiSoan = name;
                    updatePreview();
                    renderNguoiGiaoViec(query);
                });

            $grid.append($div);
        });
    }

    $badge.text(`${filtered.length} / ${_nguoiSoanList.length} người`);
}


// ===== HIGHLIGHT =====
function highlight(text, query) {
    if (!query) return text;

    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(re, '<mark>$1</mark>');
}


// ===== PREVIEW =====
function updatePreview() {
    const $el = $('#selectedPreview');
    if (!$el.length) return;

    $el.html(
        _selectedNguoiSoan
            ? `Đã chọn: <b>${_selectedNguoiSoan}</b>`
            : ''
    );
}

// ===== SEARCH =====
$(document).on('input', '#searchInput', function () {
    const value = $(this).val().trim();
    renderNguoiGiaoViec(value);
});

$('#btnSavePhieuGV').on("click", async function () {
    const dataSource = $("#dxDataGridGiaoViec").dxDataGrid("instance").option("dataSource");

    if (dataSource.length === 0) {
        showToast("warning", "Chưa có thông tin đăng ký");
        PlayAudioError();
        return;
    }
    const trloc = $(".select_loc").val();
    const phieuDK = $('#phieuDK').val();
    const maLenhSX = $('#phieuDK').find('option:selected').data('malenhsx');
    const ngayGV = moment().toDate();
    const ngayXH = moment($("#ngayXuatHang").val(), "DD/MM/YYYY").format("YYYY-MM-DD");
    var dataUser = !window.CefSharp ? userNameSave : dataUser = userName
    const arrSave = dataSource.map(item => ({
        PhieuGiaoViec: phieuDK,
        Dot: null,
        MaLenhSX: maLenhSX,
        MaNPL: item.MaNPL,
        SLCanXuat: item.SLCanXuat,
        NguoiGiaoViec: item.NguoiGiaoViec,
        NguoiTao: dataUser,
        NgayGiaoViec: ngayGV,
        NgayXuatHang: ngayXH,
        GhiChu: '',
        MaVT: item.MaVT,
        Module: trloc
    }));

    const arrSave1 = dataSource.map(item => ({
        PhieuGiaoViec: phieuDK,
        Dot: null,
        MaLenhSX: maLenhSX || '',
        MaNPL: item.MaNPL,
        SLCanXuat: item.SLCanXuat,
        NguoiGiaoViec: item.NguoiGiaoViec,
        NguoiTao: dataUser,
        NgayGiaoViec: ngayGV,
        NgayXuatHang: ngayXH,
        GhiChu: item.GhiChu,
        Module: trloc
    }));

    for (const item of arrSave) {
        if (!item.SLCanXuat || item.SLCanXuat <= 0) {
            focusErrorRow({
                gridId: 'dxDataGridGiaoViec',
                dataSource,
                findItem: item,
                inputClass: '.inputSLDK'
            });

            showToast(
                "warning",
                `Item Code: ${item.MaVT} chưa nhập số lượng đăng ký`
            );
            PlayAudioError();
            return;
        }

        if (!item.NguoiGiaoViec || !item.NguoiGiaoViec.trim()) {
            focusErrorRow({
                gridId: 'dxDataGridGiaoViec',
                dataSource,
                findItem: item,
                inputClass: '.inputSoanHang'
            });

            showToast(
                "warning",
                `Item Code: ${item.MaVT} chưa nhập người soạn hàng`
            );
            PlayAudioError();
            return;
        }
    }

    await SavePhieuGV(arrSave1);

    /*alert("Tới đây đã thành công kiểm thử và lưu");*/

});

function focusErrorRow({
    gridId,
    dataSource,
    findItem,
    inputClass,
    removeOnInput = true
}) {
    const rowIndex = dataSource.findIndex(item => item.MaNPL === findItem.MaNPL);
    if (rowIndex === -1) return;

    $("#dxDataGridGiaoViec").dxDataGrid("instance").navigateToRow(dataSource[rowIndex]);

    setTimeout(() => {
        const $row = $(`#${gridId} .dx-data-row`).eq(rowIndex);
        $row.addClass('highlight-row');

        const $input = $row.find(inputClass);
        if ($input.length) {
            $input.focus().select();

            if (removeOnInput) {
                $input.one('input', () => {
                    $row.removeClass('highlight-row');
                });
            }
        }
    }, 200);
}

async function SavePhieuGV(arrSave) {
    const $btn = $('#btnSavePhieuGV');
    $btn.prop("disabled", true);

    const originalHtml = $btn.html();
    $btn.html('<i class="fas fa-spinner fa-spin"></i> Đang lưu...');

    const url = `/api/PhieuXuatHangNPL/PostGiaoViec?action=Postgiaoviecxuathang`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(arrSave),
        });

        const result = await response.json();

        if (result === "True") {
            $("#modalGiaoViec").modal("hide");
            GetPhieuNhapKho();
            showToast("success", "Lưu thành công!");
        } else {
            showToast("error", "Lưu thất bại!");
        }
    } catch (err) {
        console.error(err);
        showToast("error", "Có lỗi xảy ra!");
    } finally {
        $btn.prop("disabled", false);
        $btn.html(originalHtml);
    }
}

function checkDisableHeader(data) {
    const hasExported = data.some(item => (item.SLNhap || 0) > 0);

    const $dateInput = $("#ngayXuatHang");
    const $dateIcon = $("#datetimepickerXuatHang i");

    if (hasExported) {
        $dateInput.prop("disabled", true).addClass("input-disabled");
        $dateIcon.css("pointer-events", "none").css("opacity", "0.5");
    } else {
        $dateInput.prop("disabled", false).removeClass("input-disabled");
        $dateIcon.css("pointer-events", "auto").css("opacity", "1");
    }
}


/// Kiệt -- Chi Tiết giao việc
/// Event
$(function () {
    $("#modalChiTietGiaoViec").on("show.bs.modal", async function () {
        const trloc = $(".select_loc").val();
        if (trloc == 4) {
            const data = await getChiTietGiaoViec("GetItemCodeGiaoViec", maLenhGiaoViec);
            const data2 = await getChiTietGiaoViec("GetItemCodeGiaoViecCapPhat", maLenhGiaoViec);
            const result = [...data, ...data2];
            createViewDxDataGridChiTietGiaoViec(result)
        } else if (trloc == 2) {
            const data = await getChiTietGiaoViec("GetItemCodeGiaoViecPYCNPL", maPhieuGiaoViec, trloc);
            createViewDxDataGridChiTietGiaoViec(data)
        }
        else if (trloc == 3) {
            const data = await getChiTietGiaoViec("GetItemGiaoViecNgoaiDonHang", maPhieuGiaoViec, trloc);
            createViewDxDataGridChiTietGiaoViec(data)
        }
        else {
            const data = await getChiTietGiaoViec("GetItemCodeGiaoViec", maLenhGiaoViec);
            createViewDxDataGridChiTietGiaoViec(data)
        }

    })
})

/// API
async function getChiTietGiaoViec(action, maLenhGiaoViecPhieu,module = 'all') {
    const trloc = $(".select_loc").val();
    const url = `/api/PhieuXuatHangNPL/Get?action=${action}&para2=${maLenhGiaoViecPhieu}&para3=1&para4=${module}&para6=${trloc}`;
    try {
        const respone = await fetch(url);
        const data = await respone.json();
        return data
    } catch (error) {
        console.error("Lỗi lấy Item Code:", error);
    }
}

// DxDataGrid
function createViewDxDataGridChiTietGiaoViec(data) {
    $("#dxDataGridChiTietGiaoViec").dxDataGrid({
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
        selection: {
            mode: 'single',
            showCheckBoxesmode: "onclick",
            allowSelectAll: false,
        },

        columns: [
            { dataField: "MaLenh", caption: "Mã Lệnh", minWidth: 90, groupIndex: 0 },
            {
                dataField: "PhieuDK", caption: "Phiếu Đăng Ký", minWidth: 90, groupIndex: 1,
                groupCellTemplate: function (container, options) {
                    const items = options.data?.items || options.data?.collapsedItems;
                    let ngayXuat = items?.[0]?.NgayXuatHang ?? "";

                    container.text(`Phiếu Đăng Ký : ${options.value} - Ngày YC Xuất Hàng: ${ngayXuat}`);
                }
            },
            { dataField: "MaVT", caption: "Item Code" },
            { dataField: "MauVT", caption: "Màu VT" },
            { dataField: "KhoVai", caption: "Khổ size" },
            { dataField: "TenDVVT", caption: "Đơn vị" },
            { dataField: "SLDK", caption: "Số Lượng", minWidth: 70, },
            { dataField: "NguoiGiaoViec", caption: "Người Giao Việc", minWidth: 70, },
            { dataField: "GhiChu", caption: "Ghi Chú", minWidth: 100, }
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
    }).dxDataGrid('instance');

}