/// Variable
var imageSignClass;
var userNameSave = localStorage.getItem('username');
var currentKyTenData = null;
/// Event
$(function () {
    phieuPKLForward = phieuPKLForward || '-1'
    console.log(`phieuPKLForward: `, phieuPKLForward)
    $("#lockho").select2({ width: "100%" });

    initGridTraHang([]);

    GetBienBan();

    $('#lockho').on('change', function () {
        GetChiTietBB();
        GetBBKyTen();
    })
});


/// Function
function formatNumberToString(number, local = 'en-US') {
    if (!number) return '0';

    return parseFloat(parseFloat(number).toFixed(4)).toLocaleString(local);

}
function formatNumberToFixed(number, fixed = 4) {
    if (!number) return 0;

    return parseFloat(parseFloat(number).toFixed(fixed))

}

async function handleKyTuDong(idImage) {
    imageSignClass = $(idImage)

    const chuKy = await GetChuKy();
    if (!chuKy) {
        showToast('warning', 'Nhân viên này chưa được khai báo ký tên tự động !');
        return;
    }

    const base64 = await imageToBase64(chuKy);
    if (!base64) return;

    const img = $('<img>').attr('src', base64).addClass('ky-img');
    imageSignClass.empty().append(img);

    PostChuKyBB(base64);
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
            showToast('warning', 'Không tìm thấy ảnh chữ ký!');
            console.log(e);
            resolve('');
        };

        img.src = imageSrc;
    });
}


function renderExistingSignatures(kyTen) {
    const map = {
        "#image1": kyTen.ChuKyNLapPhieu,
        "#image2": kyTen.ChuKyNNhanHang,
        "#image3": kyTen.ChuKyThuKho,
        "#image4": kyTen.ChuKyKTTruong,
        "#image5": kyTen.ChuKyGiamDoc,
    };

    Object.entries(map).forEach(([selector, fileName]) => {
        const $el = $(selector);
        $el.empty();
        if (fileName) {
            const imgSrc = `/Images/KyTenPhieuXuatKho/${fileName}`;
            const img = $('<img>').attr('src', imgSrc).addClass('ky-img');
            const btnRemove = $('<button>')
                .addClass('ky-remove')
                .attr('title', 'Xóa chữ ký')
                .html('&times;')
                .on('click', function (ev) {
                    ev.stopPropagation();
                    $el.html('<span class="ky-placeholder">Nhấn để ký</span>');
                });
            $el.append(img).append(btnRemove);
        } else {
            $el.html('<span class="ky-placeholder">Nhấn để ký</span>');
        }
    });
}

function clearAllSignatures() {
    ["#image1", "#image2", "#image3", "#image4", "#image5"].forEach(sel => {
        $(sel).html('<span class="ky-placeholder">Nhấn để ký</span>');
    });
}




function handleKy(inputId) {
    imageSignClass = $(`${inputId}`);
    $('#signatureModal').modal('show');
}

function saveSignature() {
    if (!imageSignClass) return;

    const imgData = canvas.toDataURL('image/png');

    imageSignClass.empty();

    const img = $('<img>').attr('src', imgData).addClass('ky-img');

    const btnRemove = $('<button>')
        .addClass('ky-remove')
        .attr('title', 'Xóa chữ ký')
        .html('&times;')
        .on('click', function (ev) {
            ev.stopPropagation();
            imageSignClass.html('<span class="ky-placeholder">Nhấn để ký</span>');
        });


    PostChuKyBB(imgData);

    imageSignClass.append(img).append(btnRemove);
    $('#signatureModal').modal('hide');
}


/// Api
async function GetBienBan() {
    try {
        const url = `/api/XuatHang/GetV2?action=GetBienBan&para1=${phieuPKLForward ? phieuPKLForward : '-1'}`

        const response = await fetch(url)
        const data = await response.json();

        var html = ``;
        if (data.length > 0) {
            data.forEach(item => html += `<option data-mapkl="${item.MaPKL}" value="${item.MaPhieuBB}">${item.Display}</option>`)
        }

        $(`#lockho`).html(html)

        GetChiTietBB();
        GetBBKyTen();
    } catch (err) {
        console.error(err)
    }
}

async function GetChiTietBB() {
    try {
        const maPKL = $("#lockho option:selected").data('mapkl');
        const url = `/api/XuatHang/GetV2?action=GetChiTietBB&para1=${maPKL}`

        const response = await fetch(url)
        const data = await response.json();

        const hoTenNguoiNhan = data[0]?.NguoiNhanHang || ''
        const diaChi = data[0]?.DiaChi || ''
        const lyDo = data[0]?.LyDo || ''
        const shipper = data[0]?.Shipper || ''

        $("#inpTenNhan").val(hoTenNguoiNhan);
        $("#inpDiaChi").val(diaChi);
        $("#inpLyDo").val(lyDo);
        $("#inpDiaDiem").val(shipper);

        initGridTraHang(data)
    } catch (err) {
        console.error(err)
    }
}

async function GetBBKyTen() {
    try {
        const maPhieu = $("#lockho").val();
        const url = `/api/XuatHang/GetV2?action=GetBienBankyTen&para1=${maPhieu ?? 0}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data && data.length > 0) {
            currentKyTenData = data[0];
            renderExistingSignatures(data[0]);
        } else {
            currentKyTenData = null;
            clearAllSignatures();
        }
    } catch (err) {
        console.error(err);
    }
}

async function GetChuKy() {
    try {
        var dataUser = !window.CefSharp ? userNameSave : userName
        const url = `/api/XuatHang/GetV2?action=GetChuKyNhanVien&para1=${dataUser}`

        const response = await fetch(url);
        const data = await response.json();
        const kyTenImage = data[0]?.HinhAnh || null;
        $('#previewImageDuyetQC').attr('src', kyTenImage)

        return kyTenImage ? `/Images/NhanVien/${kyTenImage}` : null;

    } catch (err) {
        console.error(err)
    }
}

async function handleExportExcel() {
    const btn = $("#btnExport");
    const originalText = btn.text();
    btn.text("Đang Xuất EX ...").prop("disabled", true);

    try {
        const maPKL = $('#lockho option:selected').data('mapkl');
        const maPhieu = $('#lockho').val();

        const url = `/api/XuatHang/GetEX_PhieuXuatKho?para1=${maPKL}&para2=${maPhieu}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Lỗi server: " + response.status);

        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `PhieuXuatKho_${maPhieu}.xlsx`;
        link.click();
        URL.revokeObjectURL(link.href);

    } catch (err) {
        showToast('warning', 'Xuất Excel thất bại !')
    } finally {
        btn.text(originalText).prop("disabled", false);
    }
}

async function PostChuKyBB(imageData) {
    try {
        const maPhieu = $("#lockho").val();
        const url = `/api/XuatHang/PostSignBB?action=PostImageKyTen`;
        var dataUser = !window.CefSharp ? userNameSave : userName;
        const currentId = imageSignClass.attr('id');
        const old = currentKyTenData || {};

        const item = {
            MaPhieu: maPhieu,

            ChuKyNLapPhieu: currentId === "image1" ? imageData : (old.ChuKyNLapPhieu || ""),
            UserNLapPhieu: currentId === "image1" ? dataUser : (old.UserNLapPhieu || ""),

            ChuKyNNhanHang: currentId === "image2" ? imageData : (old.ChuKyNNhanHang || ""),
            UserNNhanHang: currentId === "image2" ? dataUser : (old.UserNNhanHang || ""),

            ChuKyThuKho: currentId === "image3" ? imageData : (old.ChuKyThuKho || ""),
            UserThuKho: currentId === "image3" ? dataUser : (old.UserThuKho || ""),

            ChuKyKTTruong: currentId === "image4" ? imageData : (old.ChuKyKTTruong || ""),
            UserKTTruong: currentId === "image4" ? dataUser : (old.UserKTTruong || ""),

            ChuKyGiamDoc: currentId === "image5" ? imageData : (old.ChuKyGiamDoc || ""),
            UserGiamDoc: currentId === "image5" ? dataUser : (old.UserGiamDoc || ""),
        };

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([item]),
        });

        const result = await response.json();
        if (result.toUpperCase() === "TRUE") {
            showToast('success', `Lưu chữ ký thành công!`, 1500);
            await GetBBKyTen();
        }
        imageSignClass = null;

    } catch (err) {
        showToast('error', `Lưu chữ ký thất bại!`, 2000);
        console.error(err);
    }
}


/// Dx DataGrid
function initGridTraHang(data) {
    $("#gridPhieu").dxDataGrid({
        dataSource: data,
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
            {
                dataField: 'STT',
                width: 38,
                alignment: 'center',
                headerCellTemplate: c => c.html('<div>STT<br><small>A</small></div>'),
                cellTemplate: function (container, options) {
                    container.text(options.rowIndex + 1);
                }
            },
            {
                dataField: 'TenHang', minWidth: 160, alignment: 'left',
                headerCellTemplate: c => c.html('<div>Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ, sản phẩm, hàng hóa<br><small>B</small></div>'),
                cellTemplate: function (container, options) {
                    container.text(options.data.TenHangDisplay)
                }
            },
            {
                dataField: 'MaSo', width: 110, alignment: 'center',
                headerCellTemplate: c => c.html('<div>Mã số<br><small>C</small></div>'),
                cellTemplate: function (container, options) {
                    container.text(options.data.TenHangDisplay)
                }
            },
            {
                dataField: 'DVT', width: 52, alignment: 'center',
                headerCellTemplate: c => c.html('<div>Đơn vị tính<br><small>D</small></div>')
            },
            {
                caption: 'Số lượng', alignment: 'center',
                columns: [
                    {
                        dataField: 'SoLuong', width: 65, alignment: 'right',
                        headerCellTemplate: c => c.html('<div>Yêu cầu<br><small>1</small></div>'),
                        cellTemplate: function (container, options) {
                            container.text(formatNumberToString(options.data.SoLuong))
                        }
                    },
                    {
                        dataField: 'SoLuongXuat', width: 65, alignment: 'right',
                        headerCellTemplate: c => c.html('<div>Thực xuất<br><small>2</small></div>'),
                        cellTemplate: function (container, options) {
                            container.text(formatNumberToString(options.data.SoLuong))
                        }
                    }
                ]
            },
            {
                dataField: 'DonGia', width: 68, alignment: 'right',
                headerCellTemplate: c => c.html('<div>Đơn giá<br><small>3</small></div>'),
                cellTemplate: function (container, options) {
                    container.text(formatNumberToString(options.value))
                }
            },
            {
                dataField: 'ThanhTien', width: 75, alignment: 'right',
                headerCellTemplate: c => c.html('<div>Thành tiền<br><small>4</small></div>'),
                cellTemplate: function (container, options) {
                    container.text(formatNumberToString(options.value))
                }
            },
            {
                dataField: 'DonViTienTe', width: 75, alignment: 'right',
                headerCellTemplate: c => c.html('<div>Đơn Vị Tiền Tệ<br><small>5</small></div>')
            },
            {
                dataField: 'Carton', width: 55, alignment: 'center',
                headerCellTemplate: c => c.html('<div>Số thùng<br><small>6</small></div>')
            }
        ],

        summary: {
            totalItems: [
                {
                    showInColumn: "SoLuong",
                    summaryType: "custom",
                    name: "TongSoLuong",
                    cssClass: "summaryCustom"
                },
                {
                    showInColumn: "SoLuongXuat",
                    summaryType: "custom",
                    name: "TongSoLuongXuat",
                    cssClass: "summaryCustom"
                },
                {
                    showInColumn: "ThanhTien",
                    summaryType: "custom",
                    name: "TongThanhTien",
                    cssClass: "summaryCustom"
                },
                {
                    showInColumn: "Carton",
                    summaryType: "custom",
                    name: "TongSoThung",
                    cssClass: "summaryCustom"
                },
            ],
            calculateCustomSummary: function (options) {
                if (options.summaryProcess === "start") {
                    options.totalValue = 0;
                }
                if (options.summaryProcess === "calculate") {
                    if (options.name === "TongSoLuong") {
                        options.totalValue += Number(options.value.SoLuong || 0);
                    }

                    if (options.name === "TongSoLuongXuat") {
                        options.totalValue += Number(options.value.SoLuong || 0);
                    }
                    if (options.name === "TongThanhTien") {
                        options.totalValue += Number(options.value.ThanhTien || 0);
                    }
                    if (options.name === "TongSoThung") {
                        options.totalValue += Number(options.value.Carton || 0);
                    }
                }
                if (options.summaryProcess === "finalize") {
                    options.totalValue = parseFloat(parseFloat(options.totalValue).toFixed(4)).toLocaleString('en-US');
                }
            }
        },
        onRowPrepared: function (e) {
            if (e.rowType === "data" && e.data.isCheck === 1) {
                e.rowElement.css("background-color", "#e8f0fe");
            }

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
    });
    $("#Layer_1").click();
}