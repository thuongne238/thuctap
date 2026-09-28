function renderItemListModal() {
    $("#gridLanModal").dxDataGrid({
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
        paging: { enabled: false },
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
                        .prop("checked", options.row.data.isCheckMD === 1)
                        .css({ width: "15px", height: "15px", cursor: "pointer", accentColor: "#185FA5" })
                        .on("change", function () {
                            var checked = this.checked;
                            options.row.data.isCheckMD = checked ? 1 : 0;
                            options.row.data.SelectedMD = checked;
                            if (checked) {
                                $(options.rowElement).css("background-color", "#e8f0fe");
                            } else {
                                $(options.rowElement).css("background-color", "");
                            }
                            syncCheckAllHeaderModal();
                        })
                        .appendTo(container);
                },
                headerCellTemplate: function (container) {
                    $("<input>")
                        .attr({ type: "checkbox", id: "checkAllHeaderModalModal", title: "Chọn / Bỏ tất cả" })
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
                $(e.cellElement).addClass("col-header text-center");
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
    // Render grid khi modal mở xong (tránh lỗi render lúc hidden)
    $("#modalGridLan").on("shown.bs.modal", function () {
        renderItemListModal();
    });

    // Destroy grid khi modal đóng để tránh duplicate instance
    $("#modalGridLan").on("hidden.bs.modal", function () {
        var instance = $("#gridLanModal").dxDataGrid("instance");
        if (instance) instance.dispose();
    });

    $(document).off("change", "#checkAllHeaderModalModal").on("change", "#checkAllHeaderModalModal", function () {
        var chk = this.checked;
        dataLan.forEach(function (d) {
            d.isCheckMD = chk ? 1 : 0;
            d.SelectedMD = chk;
        });
        var grid = $("#gridLanModal").dxDataGrid("instance");
        grid.repaint();
    });

    $("#btnXacNhanModal").on("click", function () {
        GetDanhSachCheckModal();
    });
});

function syncCheckAllHeaderModal() {
    var total = dataLan.length;
    var checked = dataLan.filter(function (d) { return d.isCheckMD === 1; }).length;
    var $header = $("#checkAllHeaderModalModal");
    if (!$header.length) return;
    if (checked === 0) {
        $header.prop({ checked: false, indeterminate: false });
    } else if (checked === total) {
        $header.prop({ checked: true, indeterminate: false });
    } else {
        $header.prop({ checked: false, indeterminate: true });
    }
    GetDanhSachCheckModal();
}

function getSelectedBarcodesModal() {
    return dataLan.filter(function (d) { return d.isCheckMD === 1; });
}

function GetDanhSachCheckModal() {
    var selected = getSelectedBarcodesModal();
    const lan = selected.map(x => x.STTPhieu).join(';');
    if (lan == "") return;
//    GetLenhChiTiet(lan);
}

function showModalChonLan(onConfirm, onCancel) {
    // Render grid khi mở (nếu chưa render)
    renderItemListModal();

    $('#btnXacNhanModal').off('click').on('click', function () {
        $("#modalGridLan").modal("hide");
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    });

    $('#modalGridLan').off('hidden.bs.modal').on('hidden.bs.modal', function () {
        if (typeof onCancel === 'function') {
            onCancel();
        }
    });

    $("#modalGridLan").modal("show");
}

// Button bên ngoài
$('#btnChonLan').on('click', function () {
    // Kiểm tra có item nào được check chưa
    if (selectedRowsToDelete.length === 0) {
        showToast("warning", "Vui lòng chọn ít nhất 1 dòng!");
        return;
    }

    showModalChonLan(
        function () {
            // ✅ Xác nhận chọn lần
            var selected = getSelectedBarcodesModal();

            if (selected.length === 0) {
                showToast("warning", "Vui lòng chọn ít nhất 1 lần!");
                return;
            }

            // Sum cột Solop
            var tongSoLop = selected.reduce(function (sum, d) {
                return sum + (parseFloat(d.Solop) || 0);
            }, 0);

            // STTPhieu join
            var sttPhieuJoined = selected.map(function (d) { return d.STTPhieu; }).join(';');
         
            selectedRowsToDelete.forEach(function (item) {
                if (item.MaCLVT === "MACLVT_106") return;
                // Lấy danh sách STTPhieu cũ từ StatusLanCu
                var oldSTTPhieu = item.StatusLanCu ? item.StatusLanCu.split(';').filter(Boolean).map(Number) : [];
                // Lấy danh sách STTPhieu mới
                var newSTTPhieu = sttPhieuJoined ? sttPhieuJoined.split(';').filter(Boolean).map(Number) : [];

                // Merge + deduplicate
                var mergedSTTPhieu = [...new Set([...oldSTTPhieu, ...newSTTPhieu])];

                var onlyNewSTTPhieu = newSTTPhieu.filter(function (x) { return !oldSTTPhieu.includes(x); });

                // Tính lại tongSoLop từ toàn bộ lần đã merge
                var tongSoLopMerged = dataLan
                    .filter(function (d) { return mergedSTTPhieu.includes(Number(d.STTPhieu)); })
                    .reduce(function (sum, d) { return sum + (parseFloat(d.Solop) || 0); }, 0);

                var capPhat = (parseFloat(item.DMTT) || 0) * tongSoLopMerged;
                var sldkGoc = parseFloat(item.SLDKGoc) || 0;
                var slcldk = capPhat - sldkGoc ;

                item.CapPhat =  capPhat;
                item.SLCLDK = Math.max(0, formatNumberToFixed(slcldk));
                item.SLDK = Math.max(0, formatNumberToFixed(slcldk));
                item.StatusLan = onlyNewSTTPhieu.join(';'); 
            });
            selectedRowsToDelete = [];
            $('#checkAllRows').prop({ checked: false, indeterminate: false });
            dataLan.forEach(function (d) {
                d.isCheckMD = 0;
                d.SelectedMD = false;
            });
            syncCheckAllHeaderModal();
            dxDataGridDangKyVatTu.refresh();
        },
        function () {
            // ❌ Huỷ
        }
    );
});
function formatNumberToFixed(value, decimals = 4) {
    if (value == null || value === "" || isNaN(value)) return 0;
    const num = parseFloat(value);
    const factor = Math.pow(10, decimals);
    return Math.trunc(num * factor) / factor; // ✅ Cắt thập phân, không làm tròn
}