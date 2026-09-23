/// Variable

var gSLCapPhat2;
var gMaVT2;
var gSLXoVai2;
var gMaNPL2;
var gPhieu2;
var gTGYCXaVai2;
var gSLCapPhat2;
var gSLDKCL2;

var dataCayVai2 = [];
var dataCayVaiXoa2 = [];
var dataXuatHang2 = [];
var lstDanhSachXaVai2 = [];

var dxGridThongTinCayVai2;
var dxDanhSachXaVai2;

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
$(function () {
    createViewdxGridThongTinCayVai2([]);
    $("#modalPhieuXaVai2").on('show.bs.modal', async function () {
        gSLCapPhat2 = $(this).data('slcp')
        gMaNPL2 = $(this).data('manpl')
        gMaVT2 = $(this).data('displayic')
        gSLXoVai2 = $(this).data('slxovai')
        gTGYCXaVai2 = $(this).data('tgycxavai')
        gPhieu2 = $(this).data('displayphieu')
        gSLDKCL2 = $(this).data('sldkcl')

        var loc = $(".select_locls").val()


        const slXuat = $(this).data('slx')
        const slXaVai = $(this).data('slxv')
        const slCapPhat = $(this).data('slcp')
        const slDangKy = $(this).data('sldk')

        dxGridThongTinCayVai2.refresh();
        dxGridThongTinCayVai2.repaint();

        await GetViewChiTietXaVai2();

        $("#txtSLDK2").data('value', formatNumberToFixed(gSLDKCL2))
        $("#txtSLDK2").val(`${formatNumberToString(slDangKy)} - (${loc == 0 || loc == 1 ? formatNumberToString(slXuat) : formatNumberToString(slCapPhat)} + ${formatNumberToString(slXaVai)}) = ${formatNumberToString(gSLDKCL2)} `)

        $('#ipPhieuXV').val(gPhieu2)
        $("#txtThoiGianYCXaVai2").val(gTGYCXaVai2)
    })

    $("#modalPhieuXaVai2").on('hidden.bs.modal', function () {
        $('#txtTongSLDC2').val('')
    });
    // Nút tìm kiếm
    let searchTimeout2;
    let locNhanh2 = -1;

    function applyFilter2() {
        const search = $("#inputTimKiemXoVai").val().trim().toLowerCase();
        let data = lstDanhSachXaVai2; // luôn lấy từ gốc

        // Lọc theo trạng thái
        if (locNhanh2 >= 0) {
            data = data.filter(item => item.TrangThai == locNhanh2);
        }

        // Lọc theo search
        if (search !== "") {
            data = data.filter(item =>
                String(item.BarCode).trim().toLowerCase().includes(search) ||
                String(item.LotBatch).trim().toLowerCase().includes(search) ||
                String(item.Display).trim().toLowerCase().includes(search)
            );
        }

        createViewDxGridDanhSachXaVai2(data);
    }

    $("#inputTimKiemXoVai").on("input", function () {
        clearTimeout(searchTimeout2);
        searchTimeout2 = setTimeout(applyFilter2, 100);
    });

    $('#slclocNhanh2').on('change', function () {
        locNhanh2 = parseInt($(this).val());
        applyFilter2();
    });
    $(".icon_reload_3").on('click', function () {
        GetViewChiTietXaVai2();
    })

})
/// Function
function updateSLDaChon(slDaChon) {
    $('#txtTongSLDC2').val(parseFloat(parseFloat(slDaChon).toFixed(4)).toLocaleString('en-US'))
}
function HandleXuatHang2() {
    if (dataCayVaiXoa2.length == 0) {
        showToast('warning', 'Vui lòng chọn cây vải cần xuất')
        return;
    }

    const hasChuaHoanThanh = dataCayVaiXoa2.find(item => item.TrangThai != 0 && item.TrangThai != 1)

    dataXuatHang = dataCayVaiXoa2.filter(item => item.TrangThai == 0 || item.TrangThai == 1)

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
function showConfirmDelete2(onConfirm) {
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
function showConfirmXacNhanHTKetThucSom2(onConfirm) {

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
/// Api
async function GetDSXaVai2() {
    const url = `/api/PhieuXuatHangNPL/GetV2?action=GetDSXaVai2&para1=${trMaLenh}`

    try {
        const response = await fetch(url)
        const data = await response.json()
        lstDanhSachXaVai2 = data
        createViewDxGridDanhSachXaVai2(data)
    } catch (err) {
        console.error(err)
    }
}
async function GetViewChiTietXaVai2() {
    try {
        var loc = $(".select_locls").val()

        const url = `/api/PhieuXuatHangNPL/GetV2?action=GetViewChiTietPhieuXaVai&para1=all&para2=${trMaLenh}&para3=${gMaNPL2}&para4=${loc}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);

        dataCayVai2 = await response.json();
        dataCayVaiXoa2 = [];
        dataXuatHang2 = [];

        $("#dxGridThongTinCayVai2 input[type='checkbox']:not(.row-chk)").prop('checked', false);

        createViewdxGridThongTinCayVai2(dataCayVai2)
    } catch (error) {
        console.error(error.message);
    }
}
async function PostKetThucXaVaiSom2(arrSave) {
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
            await GetViewChiTietXaVai2();
        }

    } catch (error) {
        console.error(error.message);
    }
}
/// DxDataGrid
function createViewdxGridThongTinCayVai2(data) {
    if (dxGridThongTinCayVai2) {
        dxGridThongTinCayVai2.option('dataSource', data);
        dxGridThongTinCayVai2.refresh();
        return;
    }
    dxGridThongTinCayVai2 = $("#dxGridThongTinCayVai2").dxDataGrid({
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
                dataField: "", width: 100,
                headerCellTemplate: function (container) {
                    const $chkAll = $(`<input style="width: 18px; height: 18px" type='checkbox' title='Chọn tất cả'/>`)
                        .on('change', function () {
                            const isChecked = $(this).prop('checked');
                            $("#dxGridThongTinCayVai2 input[type='checkbox'].row-chk").prop('checked', isChecked);
                            if (isChecked) {
                                const dataSource = dxGridThongTinCayVai2.option('dataSource').filter(item => !item.IsXuatHang && (item.TrangThai == 0 || item.TrangThai == 1));
                                console.log(`dataSource: `, dataSource)
                                dataCayVaiXoa2 = dataSource;
                            } else {
                                dataCayVaiXoa2 = []
                            }
                            const sumSLDaChon = dataCayVaiXoa2.reduce((sum, item) => sum + item.SLNhap, 0)
                            updateSLDaChon(sumSLDaChon)

                        });


                    container.append($chkAll);
                },
                cellTemplate: function (container, options) {
                    const itemRow = options.data;
                    if (itemRow.TrangThai != 0 && itemRow.TrangThai != 1) return;
                    if (itemRow.IsXuatHang) {
                        const $span = $(`<span style="color:red; font-size:12px;font-weight:bold">Đã Xuất</span>`)
                        container.append($span);
                    } else {
                        const $chk = $(`<input  style="width: 18px; height: 18px" type='checkbox' class='row-chk'/>`)
                            .on('change', function () {
                                const isChecked = $(this).prop('checked');

                                if (isChecked) {
                                    dataCayVaiXoa2.push(itemRow)
                                } else {
                                    dataCayVaiXoa2 = dataCayVaiXoa2.filter(item => item.BarCode !== itemRow.BarCode);
                                    $("#dxGridThongTinCayVai2 input[type='checkbox']:not(.row-chk)").prop('checked', false);
                                }
                                const sumSLDaChon = dataCayVaiXoa2.reduce((sum, item) => sum + item.SLNhap, 0)
                                updateSLDaChon(sumSLDaChon)
                            });



                        container.append($chk);
                    }

                }
            },
            {
                dataField: "Phieu", caption: "Phiếu", width: 100,
                cellTemplate: function (container, options) {
                    const $wrapper = $(`<div></div>`).css({ display: "flex", justifyContent: "center", height: "25px", gap: "8px" })

                    // Text
                    const $span = $(`<span>${options.data.Phieu}</span>`)

                    // Icon
                    const $btnNext = $(`<i class="fa-solid fa-circle-right" style='cursor:pointer'></i>`)
                        .css({ fontSize: '16px', color: 'green' })
                        .on("click", function () {
                            gMaVT = gMaVT2;
                            gMaNPL = gMaNPL2;
                            gSLCapPhat = gSLCapPhat2;
                            gSLXoVai = gSLXoVai2
                            gTGYCXaVai = gTGYCXaVai2;

                            $('#modalPhieuXaVai').modal('show');
                            setTimeout(function () {
                                $("#sltPhieu").val(`${options.data.Phieu}`).trigger("change");
                            }, 1000)
                        })

                    $wrapper.append($span, $btnNext).appendTo(container)

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
                    allowClearing: true
                },

                cellTemplate: function (container, options) {
                    const item = options.data;
                    const trangThai = item.TrangThai;

                    var text = '';
                    var color = '';

                    if (trangThai == 0) {
                        text = 'Kết thúc sớm';
                        color = '#fd7e14';
                    } else if (trangThai == 1) {
                        text = 'Đã hoàn thành';
                        color = '#198754';
                    } else if (trangThai == 2) {
                        text = 'Đang xổ vải';
                        color = '#0d6efd';
                    } else if (trangThai == 3) {
                        text = 'Chờ xổ vải';
                        color = '#6f42c1';
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
                    const tgKetThucXoVai = options.data.TGKetThucXaVai ? moment(options.data.TGKetThucXaVai, 'YYYY-MM-DD HH:mm:ss').format('HH:mm - DD/MM') : $("#txtTGKT2").val();

                    container.append(tgKetThucXoVai)
                }
            },
            {
                dataField: "GhiChu",
                caption: "Ghi chú",
                minWidth: 140,
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