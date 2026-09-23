const arrTabNPL = [
    {
        id: "NL",
        text: 'Nguyên Liệu',
        icon: 'product',
    },
    {
        id: "PL",
        text: 'Phụ Liệu',
        icon: 'preferences',
    },
];

var arrNhapKho = [];
var tabKiemNPL = null;
let _filteredExportData = [];
/*region Global Filter*/

let _originDataNL = [];
let _originDataPL = [];
let _popupFilter = null;
let _currentGridData = [];


var toggleBtn = document.getElementById('toggleAll');

function updateHeaderInfoByData(data) {
    data = data || [];
    var arrFilerMerSummary = data.filter(x => x.Result_Mer != null)

    const countPassMer = arrFilerMerSummary.filter(x => x.Result_Mer == 1 || x.Result_Mer === true || x.Result_Mer === "Pass").length;
    const countFailMer = arrFilerMerSummary.filter(x => x.Result_Mer == 0 || x.Result_Mer === false || x.Result_Mer === "Fail").length;
    const percentFailMer = arrFilerMerSummary.length === 0 ? "0.00" : ((countFailMer / arrFilerMerSummary.length) * 100).toFixed(2);

    const countPassQC = data.filter(x => x.Result == 1 || x.Result === true || x.Result === "Pass").length;
    const countFailQC = data.filter(x => x.Result == 0 || x.Result === false || x.Result === "Fail").length;
    const percentFailQC = data.length === 0 ? "0.00" : ((countFailQC / data.length) * 100).toFixed(2);


    $("#summary-QC").html(`
         <div class="metric">
                                <div class="metric-lbl">Tổng kiểm</div>
                                <div class="metric-val v-blue">${data.length||0}</div>
                                <div class="metric-bar"><div class="bar-fill f-blue" style="width:100%"></div></div>
                            </div>
                            <div class="metric">
                                <div class="metric-lbl">Pass</div>
                                <div class="metric-val v-green">${countPassQC || 0}</div>
                                <div class="metric-bar"><div class="bar-fill f-green" style="width:100%"></div></div>
                            </div>
                            <div class="metric v-red">
                                <div class="metric-lbl v-red">Fail</div>
                                <div class="metric-val v-red">${countFailQC||0}</div>
                                <div class="metric-bar"><div class="bar-fill f-red" style="width:100%"></div></div>
                            </div>
                            <div class="metric v-red">
                                <div class="metric-lbl v-red">% Lỗi</div>
                                <div class="metric-val v-red">${percentFailQC||0}</div>
                                <div class="metric-bar"><div class="bar-fill f-red" style="width:100%"></div></div>
                            </div>
    `);

    $("#summary-Mer").html(`
         <div class="metric">
                                <div class="metric-lbl">Tổng xác nhận</div>
                                <div class="metric-val v-blue">${arrFilerMerSummary.length || 0}</div>
                                <div class="metric-bar"><div class="bar-fill f-blue" style="width:100%"></div></div>
                            </div>
                            <div class="metric">
                                <div class="metric-lbl">Pass</div>
                                <div class="metric-val v-green">${countPassMer || 0}</div>
                                <div class="metric-bar"><div class="bar-fill f-green" style="width:100%"></div></div>
                            </div>
                            <div class="metric">
                                <div class="metric-lbl v-red">Fail</div>
                                <div class="metric-val v-red">${countFailMer || 0}</div>
                                <div class="metric-bar"><div class="bar-fill f-red" style="width:100%"></div></div>
                            </div>
                            <div class="metric">
                                <div class="metric-lbl v-red">% Lỗi</div>
                                <div class="metric-val v-red">${percentFailMer || 0}</div>
                                <div class="metric-bar"><div class="bar-fill f-red" style="width:100%"></div></div>
                            </div>
    `);

    setHeaderOverView(data)

}

function setHeaderOverView(arrFilterKiemNPL) {

    const hasInlineFilter =
        _filterValue.ItemCode ||
        _filterValue.POMua ||
        _filterValue.SoLo ||
        _filterValue.TenKH ||
        _filterValue.TenCL ||
        _filterValue.NhaCungCap;


    var filteredData = [...arrNhapKho];

    if (_filterValue.ItemCode) {
        filteredData = filteredData.filter(x => x.ItemCode === _filterValue.ItemCode);
    }

    if (_filterValue.POMua) {
        filteredData = filteredData.filter(x => x.POMua === _filterValue.POMua);
    }

    if (_filterValue.SoLo) {
        filteredData = filteredData.filter(x => x.SoLo === _filterValue.SoLo);
    }

    if (_filterValue.TenKH) {
        filteredData = filteredData.filter(x => x.TenKH === _filterValue.TenKH);
    }

    if (_filterValue.TenCL) {
        filteredData = filteredData.filter(x => x.TenCL === _filterValue.TenCL);
    }

    if (_filterValue.NhaCungCap) {
        filteredData = filteredData.filter(x => x.NhaCungCap === _filterValue.NhaCungCap);
    }
    const countLanTre = arrFilterKiemNPL.filter(x => Number(x.SoGioTre) > 48).length;

    const countChuaKiem = filteredData.filter(x => Number(x.IsChuaKiem) === 1).length || 0

    const countTongNhap = (arrFilterKiemNPL.length || 0) + countChuaKiem;

    const percentTre = (!filteredData || filteredData.length === 0 || arrFilterKiemNPL.length == 0 ? "0.00" : ((countLanTre / arrFilterKiemNPL.length) * 100).toFixed(2)) || 0;

   
    $("#summary-overview").html(`
                                <div class="metric">
                                <div class="metric-lbl">Tổng nhập</div>
                                <div class="metric-val v-blue">${countTongNhap || 0}</div>
                                <div class="metric-bar"><div class="bar-fill f-blue" style="width:100%"></div></div>
                            </div>
                            <div class="metric">
                                <div class="metric-lbl">Chưa kiểm</div>
                                <div class="metric-val v-amber">${countChuaKiem || 0}</div>
                                <div class="metric-bar"><div class="bar-fill f-amber" style="width:100%"></div></div>
                            </div>
                            <div class="metric">
                                <div class="metric-lbl v-red">Lần trễ</div>
                                <div class="metric-val v-red">${countLanTre || 0}</div>
                                <div class="metric-bar"><div class="bar-fill f-red" style="width:100%"></div></div>
                            </div>
                            <div class="metric">
                                <div class="metric-lbl v-red">Tỉ lệ trễ</div>
                                <div class="metric-val v-red">${percentTre || 0}</div>
                                <div class="metric-bar"><div class="bar-fill f-red" style="width:100%"></div></div>
                            </div>



`)
}

function isGridFiltered(grid) {
    if (!grid) return false;

    const combinedFilter = grid.getCombinedFilter();
    const searchText = grid.option("searchPanel.text");

    return !!combinedFilter || !!searchText;
}

function syncGridFilteredData(grid) {
    if (!grid) return;

    setTimeout(function () {
        const visibleData = grid.getVisibleRows()
            .filter(r => r.rowType === "data")
            .map(r => r.data);

        const hasFilter = isGridFiltered(grid);

        updateHeaderInfoByData(visibleData);

        if (hasFilter) {
            _filteredExportData = [...visibleData];
        } else {
            const hasInlineFilter =
                _filterValue.ItemCode ||
                _filterValue.POMua ||
                _filterValue.SoLo ||
                _filterValue.TenKH ||
                _filterValue.TenCL ||
                _filterValue.NhaCungCap;

            if (!hasInlineFilter) {
                _filteredExportData = [];
                updateHeaderInfoByData(_currentGridData);
            }
        }
    }, 100);
}

function getGridFilterRowDataForExport() {
    const grid = $("#grvPhuLieuKiemNgay").dxDataGrid("instance");

    if (!grid) {
        return null;
    }

    const hasGridFilter = isGridFiltered(grid);

    if (!hasGridFilter) {
        return null;
    }

    return grid.getVisibleRows()
        .filter(r => r.rowType === "data")
        .map(r => r.data);
}

var _filterValue = {
    ItemCode: null,
    POMua: null,
    SoLo: null,
    TenKH: null,
    TenCL: null,
    NhaCungCap:null
};

function resetFilterValue() {
    _filterValue = {
        ItemCode: null,
        POMua: null,
        SoLo: null,
        TenKH: null,
        TenCL: null,
        NhaCungCap: null
    };
}

function getCurrentSourceData() {
    const selectedItem =
        tabKiemNPL ? tabKiemNPL.option("selectedItem") : null;

    if (!selectedItem) {
        return [];
    }

    return selectedItem.id === "NL"
        ? _originDataNL
        : _originDataPL;
}

function getDistinctValues(data, field) {
    return [...new Set(
        data
            .filter(x => x[field])
            .map(x => x[field])
    )];
}

function initInlineFilters(data) {
    const selectOption = {
        searchEnabled: true,
        searchMode: "contains",
        showClearButton: true,
        value: null,
        height: 40,
        dropDownOptions: {
            maxHeight: 420,
            height: "auto"
        }
    };

    $("#filterItemCode").dxSelectBox({
        ...selectOption,
        dataSource: getDistinctValues(data, "ItemCode"),
        placeholder: "Item Code"
    });

    $("#filterPOMua").dxSelectBox({
        ...selectOption,
        dataSource: getDistinctValues(data, "POMua"),
        placeholder: "PO Mua"
    });

    $("#filterSoLo").dxSelectBox({
        ...selectOption,
        dataSource: getDistinctValues(data, "SoLo"),
        placeholder: "Số Lô"
    });

    $("#filterTenKH").dxSelectBox({
        ...selectOption,
        dataSource: getDistinctValues(data, "TenKH"),
        placeholder: "Khách Hàng"
    });

    $("#filterTenCL").dxSelectBox({
        ...selectOption,
        dataSource: getDistinctValues(data, "TenCL"),
        placeholder: "Chủng Loại"
    });

    $("#filterNhaCC").dxSelectBox({
        ...selectOption,
        dataSource: getDistinctValues(data, "NhaCungCap"),
        placeholder: "Nhà Cung Cấp"
    });

}

function refreshInlineFilters() {
    const sourceData =
        getCurrentSourceData();

    initInlineFilters(sourceData);
}

function readInlineFilterValue() {
    _filterValue = {
        ItemCode:
            $("#filterItemCode").dxSelectBox("instance")
                ? $("#filterItemCode").dxSelectBox("instance").option("value")
                : null,

        POMua:
            $("#filterPOMua").dxSelectBox("instance")
                ? $("#filterPOMua").dxSelectBox("instance").option("value")
                : null,

        SoLo:
            $("#filterSoLo").dxSelectBox("instance")
                ? $("#filterSoLo").dxSelectBox("instance").option("value")
                : null,

        TenKH:
            $("#filterTenKH").dxSelectBox("instance")
                ? $("#filterTenKH").dxSelectBox("instance").option("value")
                : null,

        TenCL:
            $("#filterTenCL").dxSelectBox("instance")
                ? $("#filterTenCL").dxSelectBox("instance").option("value")
                : null,
         NhaCungCap:
             $("#filterNhaCC").dxSelectBox("instance")
                 ? $("#filterNhaCC").dxSelectBox("instance").option("value")
                : null
    };
}

function getInlineFilteredDataForExport() {
    readInlineFilterValue();

    const selectedItem =
        tabKiemNPL ? tabKiemNPL.option("selectedItem") : null;

    if (!selectedItem) {
        return null;
    }

    const hasInlineFilter =
        _filterValue.ItemCode ||
        _filterValue.POMua ||
        _filterValue.SoLo ||
        _filterValue.TenKH ||
        _filterValue.TenCL || _filterValue.NhaCungCap;

    if (!hasInlineFilter) {
        return null;
    }

    let sourceData =
        selectedItem.id === "NL"
            ? _originDataNL
            : _originDataPL;

    let filteredData = [...sourceData];

    if (_filterValue.ItemCode) {
        filteredData = filteredData.filter(x => x.ItemCode === _filterValue.ItemCode);
    }

    if (_filterValue.POMua) {
        filteredData = filteredData.filter(x => x.POMua === _filterValue.POMua);
    }

    if (_filterValue.SoLo) {
        filteredData = filteredData.filter(x => x.SoLo === _filterValue.SoLo);
    }

    if (_filterValue.TenKH) {
        filteredData = filteredData.filter(x => x.TenKH === _filterValue.TenKH);
    }

    if (_filterValue.TenCL) {
        filteredData = filteredData.filter(x => x.TenCL === _filterValue.TenCL);
    }
    if (_filterValue.NhaCungCap) {
        filteredData = filteredData.filter(x => x.NhaCungCap === _filterValue.NhaCungCap);
    }

    return filteredData;
}

function clearInlineFilters() {
    resetFilterValue();

    const filterIds = [
        "#filterItemCode",
        "#filterPOMua",
        "#filterSoLo",
        "#filterTenKH",
        "#filterTenCL"
    ];

    filterIds.forEach(function (id) {
        const instance =
            $(id).dxSelectBox("instance");

        if (instance) {
            instance.option("value", null);
        }
    });
}

/*endregion*/
$("#btn-refresh").on("click", function () {
    onDateRangeChange();
});

function onDateRangeChange() {
    const fromDateVal = $("#fromDate").dxDateBox("instance").option("value");
    const toDateVal = $("#toDate").dxDateBox("instance").option("value");

    if (fromDateVal && toDateVal) {
        const fromDate =
            moment(fromDateVal)
                .startOf("day");

        const toDate =
            moment(toDateVal)
                .startOf("day");

        if (fromDate.isAfter(toDate)) {

            DevExpress.ui.notify(
                "Từ ngày không được lớn hơn Đến ngày.",
                "warning",
                3000
            );

            return;
        }

        const formatFromDate = moment(fromDateVal).format('YYYY-MM-DD');
        const formatToDate = moment(toDateVal).format('YYYY-MM-DD');
        const selectedItem = tabKiemNPL.option('selectedItem');
        clearInlineFilters();
        _filteredExportData = [];
        if (selectedItem.id == "NL") {
            loadBaoCaoKiemNL(
                formatFromDate,
                formatToDate,
                $("#select-filer").val()
            );
            loadVatTuNhapKho(formatFromDate, formatToDate,1)
        }
        else if (selectedItem.id == "PL") {
            loadBaoCaoKiemPL(
                formatFromDate,
                formatToDate,
                $("#select-filer").val()
            );
            loadVatTuNhapKho(formatFromDate, formatToDate, 0)
        }

    }
}

function loadBaoCaoKiemNL(fromDate, toDate, result) {
    const loaderWrapper = document.getElementById('customLoaderWrapper');
    const progressBar = document.getElementById('customProgressBar');

    if (!loaderWrapper || !progressBar) {
        console.error("Thiếu phần tử customLoaderWrapper hoặc customProgressBar.");
        return;
    }

    // Hiện loader
    loaderWrapper.classList.add('active');
    progressBar.style.width = '0%';
    progressBar.setAttribute('data-percentage', '0%');

    let progress = 0;
    const interval = setInterval(() => {
        if (progress < 90) {
            progress++;
            progressBar.style.width = progress + '%';
            progressBar.setAttribute('data-percentage', progress + '%');
        }
    }, 30);

    $.ajax({
        url: '/api/QtyKiemPL/GET',
        type: 'GET',
        dataType: 'json',
        data: {
            action: 'GetBCNguyenLieuNgay',
            para1: fromDate,
            para2: toDate,
            para3: result
        },
        success: function (res) {

            fetchBaoCaoNL(res);
        },
        error: function (err) {
            console.error("Lỗi lấy dữ liệu: ", err);
        },
        complete: function () {
            clearInterval(interval);
            progressBar.style.width = '100%';
            progressBar.setAttribute('data-percentage', '100%');

            setTimeout(() => {
                loaderWrapper.classList.remove('active');
                progressBar.style.width = '0%';
                progressBar.setAttribute('data-percentage', '100%');
            }, 800); // hiệu ứng fade-out
        }
    });
}

function fetchBaoCaoNL(data) {
    if (!window._isFilteringLocal) {
        _originDataNL = [...data];
    }
    if (!window._isFilteringLocal) {
        refreshInlineFilters();
    }
    _currentGridData = [...data];
    updateHeaderInfoByData(data);
    $("#grvPhuLieuKiemNgay").dxDataGrid({
        dataSource: data,
        showBorders: true,
        showRowLines: true,
        rowAlternationEnabled: true,
        width: "100%",
        columnAutoWidth: false,
        allowColumnResizing: true,
        columnResizingMode: "widget",
        hoverStateEnabled: true,
        height: "100%",
        wordWrapEnabled: true,
        scrolling: {
            mode: "standard",
            showScrollbar: "always",
            useNative: true
        },
        paging: {
            enabled: false
        },
        headerFilter: { visible: false },
        stateStoring: {
            enabled: false,
            type: "localStorage",
            storageKey: "storageBaoCaoKiemPL"
        },
        filterRow: { visible: true },
        searchPanel: {
            visible: true,
            width: 250,
            placeholder: "Tìm kiếm tổng hợp..."
        },


        columns: [
            {
                caption: "STT",
                alignment: "center",
                width: 50,
                allowFiltering: false,
                allowHeaderFiltering: false,
                cellTemplate: function (container, options) {
                    container.text(options.rowIndex + 1 + (options.component.pageIndex() * options.component.pageSize()));
                },
            },
            {
                dataField: "NgayMoKien",
                caption: "Ngày Mở Kiện",
                dataType: "date",
                format: "dd/MM/yyyy HH:mm",
                alignment: "center",
                width: 120
            },
            {
                dataField: "NgayKiem",
                caption: "Ngày Kiểm",
                dataType: "date",
                format: "dd/MM/yyyy HH:mm",
                alignment: "center",
                width: 120
            },
            {
                dataField: "POMua",
                caption: "PO Mua",
                width: 120
            },
            {
                dataField: "SoLo",
                caption: "Số Lô",
                width: 120
            },
            {
                dataField: "TenKH",
                caption: "Khách Hàng",
                width: 110,
                minWidth: 90,
                allowResizing: true
            },
            {
                dataField: "NhaCungCap",
                caption: "Nhà Cung Cấp",
                width: 200,
                minWidth: 220,
                allowResizing: true
            },
            {
                dataField: "TenCL",
                caption: "Chủng Loại",
                width: 120
            },
            {
                dataField: "ItemCode",
                caption: "ItemCode",
                width: 140
            },

            {
                dataField: "MauVT",
                caption: "Màu",
                alignment: "center",
                width: 100
            },
            {
                dataField: "CodeMau",
                caption: "Color Code",
                alignment: "center",
                width: 100
            },
            //{
            //    dataField: "SoKienHienThi",
            //    caption: "Roll",
            //    minWidth: 100
            //},
            //{
            //    dataField: "Batch",
            //    caption: "Batch",
            //    minWidth: 100
            //},
            //{
            //    dataField: "LOT",
            //    caption: "LOT",
            //    minWidth: 100
            //},
            {
                dataField: "MoTa",
                caption: "Mô Tả",
                width: 420,
                minWidth: 420,
                allowResizing: true,
                cssClass: "cell-wrap-text",
                cellTemplate: function (container, options) {
                    $("<div>")
                        .addClass("cell-wrap-text")
                        .text(options.value || "")
                        .appendTo(container);
                }
            },
            {
                dataField: "KhoVai",
                caption: "Khổ/Size",
                alignment: "center",
                width: 100
            },
            {
                dataField: "TenDVVT",
                caption: "Đơn Vị",
                alignment: "center",
                width: 90
            },
            { dataField: "Dot", caption: "Đợt", minWidth: 70, width: 70 },
            {
                dataField: "Result",
                caption: "Kết Quả",
                alignment: "center",
                width: 100,
                cellTemplate: function (container, options) {
                    var val = options.value;
                    if (val === 1 || val === true || val === "Pass") {
                        $("<span class='text-success fw-bold'><i class='fas fa-check-circle'></i> Pass</span>").appendTo(container);
                    } else if (val === 0 || val === false || val === "Fail") {
                        $("<span class='text-danger fw-bold'><i class='fas fa-times-circle'></i> Fail</span>").appendTo(container);
                    } else {
                        $("<span></span>").appendTo(container);
                    }
                }
            },
            {
                dataField: "Result_Mer",
                caption: "Kết luận (Mer)",
                alignment: "center",
                width: 100,
                cellTemplate: function (container, options) {
                    var val = options.value;
                    if (val === 1 || val === true || val === "Pass") {
                        $("<span class='text-success fw-bold'><i class='fas fa-check-circle'></i> Pass</span>").appendTo(container);
                    } else if (val === 0 || val === false || val === "Fail") {
                        $("<span class='text-danger fw-bold'><i class='fas fa-times-circle'></i> Fail</span>").appendTo(container);
                    } else {
                        $("<span></span>").appendTo(container);
                    }
                }
            },
            {
                caption: "Xem Chi TIết",
                alignment: "center",
                width: 110,
                allowFiltering: false,
                allowSorting: false,
                cellTemplate: function (container, options) {
                    const rowData = options.data;

                    if (rowData && rowData.SoLoID && rowData.MaNPL) {
                        const targetUrl = `/NguyenPhuLieu/BCKiemVaiV2_ListImage?userName=${localStorage.getItem('username1')}&soLoID=${encodeURIComponent(rowData.SoLoID)}&soLo=${encodeURIComponent(rowData.SoLo)}&maNPL=${encodeURIComponent(rowData.MaNPL)}&Dot=${encodeURIComponent(rowData.STTDot)}`;
                        $("<button>")
                            .addClass("btn btn-sm btn-outline-primary")
                            .attr("title", "Xem chi tiết")
                            .html("<i class='fas fa-eye'></i>")
                            .on("click", function () {
                                window.open(targetUrl, '_blank');
                            })
                            .appendTo(container);
                    }
                }
            }
        ],

      
        onCellPrepared: function (e) {
            if (
                e.rowType === "data" &&
                e.column.dataField === "NgayKiem" &&
                e.data.SoGioTre > 48
            ) {
                e.cellElement.css({
                    "background-color": "#ffe0e0",
                    "color": "#c00000",
                    "font-weight": "bold"
                });
            }
        },
        onContentReady: function (e) {
            syncGridFilteredData(e.component);
        },

        onOptionChanged: function (e) {
            if (
                e.fullName &&
                (
                    e.fullName.indexOf("filterValue") >= 0 ||
                    e.fullName.indexOf("columns") >= 0 ||
                    e.fullName === "searchPanel.text"
                )
            ) {
                syncGridFilteredData(e.component);
            }
        },
    });
}

function loadBaoCaoKiemPL(fromDate, toDate, result) {
    const loaderWrapper = document.getElementById('customLoaderWrapper');
    const progressBar = document.getElementById('customProgressBar');

    if (!loaderWrapper || !progressBar) {
        console.error("Thiếu phần tử customLoaderWrapper hoặc customProgressBar.");
        return;
    }

    // Hiện loader
    loaderWrapper.classList.add('active');
    progressBar.style.width = '0%';
    progressBar.setAttribute('data-percentage', '0%');

    let progress = 0;
    const interval = setInterval(() => {
        if (progress < 90) {
            progress++;
            progressBar.style.width = progress + '%';
            progressBar.setAttribute('data-percentage', progress + '%');
        }
    }, 30);

    $.ajax({
        url: '/api/QtyKiemPL/GET',
        type: 'GET',
        dataType: 'json',
        data: {
            action: 'GetBaoCaoNgay',
            para1: fromDate,
            para2: toDate,
            para3: result
        },
        success: function (res) {

            fetchBaoCaoPL(res);
        },
        error: function (err) {
            console.error("Lỗi lấy dữ liệu: ", err);
        },
        complete: function () {
            clearInterval(interval);
            progressBar.style.width = '100%';
            progressBar.setAttribute('data-percentage', '100%');

            setTimeout(() => {
                loaderWrapper.classList.remove('active');
                progressBar.style.width = '0%';
                progressBar.setAttribute('data-percentage', '100%');
            }, 800); // hiệu ứng fade-out
        }
    });
}

function loadVatTuNhapKho(fromDate, toDate, IsNPL) {
    
    $.ajax({
        url: '/api/QtyKiemPL/GET',
        type: 'GET',
        dataType: 'json',
        data: {
            action: 'GetContNhapKhoNgay',
            para1: fromDate,
            para2: toDate,
            para3: IsNPL
        },
        success: function (res) {
            arrNhapKho = [];
            arrNhapKho = [...res]
        },
        error: function (err) {
            console.error("Lỗi lấy dữ liệu: ", err);
        },
      
    });
}

function fetchBaoCaoPL(data) {
    if (!window._isFilteringLocal) {
        _originDataPL = [...data];
    }
    if (!window._isFilteringLocal) {
        refreshInlineFilters();
    }
    _currentGridData = [...data];
    updateHeaderInfoByData(data);

    $("#grvPhuLieuKiemNgay").dxDataGrid({
        dataSource: data,
        showBorders: true,
        showRowLines: true,
        rowAlternationEnabled: true,
        width: "100%",
        columnAutoWidth: false,
        allowColumnResizing: true,
        columnResizingMode: "widget",
        hoverStateEnabled: true,
        height: "100%",
        wordWrapEnabled: true,
        scrolling: {
            mode: "standard",
            showScrollbar: "always",
            useNative: true
        },
        paging: {
            enabled: false
        },
        headerFilter: { visible: false },
        stateStoring: {
            enabled: false,
            type: "localStorage",
            storageKey: "storageBaoCaoKiemPL"
        },
        filterRow: { visible: true },
        searchPanel: {
            visible: true,
            width: 250,
            placeholder: "Tìm kiếm tổng hợp..."
        },
        columns: [
            {
                caption: "STT",
                alignment: "center",
                width: 50,
                allowFiltering: false,
                allowHeaderFiltering: false,
                cellTemplate: function (container, options) {
                    container.text(options.rowIndex + 1 + (options.component.pageIndex() * options.component.pageSize()));
                },
            },

            {
                dataField: "NgayMoKien",
                caption: "Ngày Mở Kiện",
                dataType: "date",
                format: "dd/MM/yyyy HH:mm",
                alignment: "center",
                width: 120
            },
            {
                dataField: "NgayKiem",
                caption: "Ngày Kiểm",
                dataType: "date",
                format: "dd/MM/yyyy HH:mm",
                alignment: "center",
                width: 120
            },
           
            {
                dataField: "POMua",
                caption: "PO Mua",
                width: 120
            },
            {
                dataField: "SoLo",
                caption: "Số Lô",
                width: 120
            },
            {
                dataField: "TenKH",
                caption: "Khách Hàng",
                width: 110,
                minWidth: 90,
                allowResizing: true
            },
            {
                dataField: "NhaCungCap",
                caption: "Nhà Cung Cấp",
                width: 200,
                minWidth: 220,
                allowResizing: true
            },
            {
                dataField: "TenCL",
                caption: "Chủng Loại",
                width: 120
            },
            {
                dataField: "ItemCode",
                caption: "ItemCode",
                width: 140
            },

            {
                dataField: "MauVT",
                caption: "Màu",
                alignment: "center",
                width: 100
            },
            {
                dataField: "CodeMau",
                caption: "Color Code",
                alignment: "center",
                width: 100
            },
            {
                dataField: "MoTa",
                caption: "Mô Tả",
                width: 260,
                minWidth: 260,
                allowResizing: true,
                cssClass: "cell-wrap-text",
                cellTemplate: function (container, options) {
                    $("<div>")
                        .addClass("cell-wrap-text")
                        .text(options.value || "")
                        .appendTo(container);
                }
            },
            {
                dataField: "KhoVai",
                caption: "Khổ/Size",
                alignment: "center",
                width: 100
            },
            {
                dataField: "TenDVVT",
                caption: "Đơn Vị",
                alignment: "center",
                width: 90
            },
            { dataField: "Dot", caption: "Đợt", minWidth: 70, width: 70 },
            {
                dataField: "Result",
                caption: "Kết Quả (QC)",
                alignment: "center",
                width: 100,
                cellTemplate: function (container, options) {
                    var val = options.value;
                    if (val === 1 || val === true || val === "Pass") {
                        $("<span class='text-success fw-bold'><i class='fas fa-check-circle'></i> Pass</span>").appendTo(container);
                    } else if (val === 0 || val === false || val === "Fail") {
                        $("<span class='text-danger fw-bold'><i class='fas fa-times-circle'></i> Fail</span>").appendTo(container);
                    } else {
                        $("<span></span>").appendTo(container);
                    }
                }
            },
            {
                dataField: "Result_Mer",
                caption: "Kết luận (Mer)",
                alignment: "center",
                width: 100,
                cellTemplate: function (container, options) {
                    var val = options.value;
                    if (val === 1 || val === true || val === "Pass") {
                        $("<span class='text-success fw-bold'><i class='fas fa-check-circle'></i> Pass</span>").appendTo(container);
                    } else if (val === 0 || val === false || val === "Fail") {
                        $("<span class='text-danger fw-bold'><i class='fas fa-times-circle'></i> Fail</span>").appendTo(container);
                    } else {
                        $("<span></span>").appendTo(container);
                    }
                }
            },
            {
                dataField: "LyDo",
                caption: "Lý Do Lỗi",
                width: 260,
                minWidth: 260,
                allowResizing: true,
                cssClass: "cell-wrap-text",
                cellTemplate: function (container, options) {
                    $("<div>")
                        .addClass("cell-wrap-text text-danger")
                        .text(options.value || "")
                        .appendTo(container);
                }
            },
            {
                caption: "Xem Chi TIết",
                alignment: "center",
                width: 110,
                allowFiltering: false,
                allowSorting: false,
                cellTemplate: function (container, options) {
                    const rowData = options.data;

                    if (rowData && rowData.SoLoID && rowData.MaNPL) {
                        const targetUrl = `/QtyKiemPL/PhieuKiem?userName=${localStorage.getItem('username1')}&SoLoID=${encodeURIComponent(rowData.SoLoID)}&MaNPL=${encodeURIComponent(rowData.MaNPL)}&Dot=${encodeURIComponent(rowData.STTDot)}&isView=true`;
                        $("<button>")
                            .addClass("btn btn-sm btn-outline-primary")
                            .attr("title", "Xem chi tiết")
                            .html("<i class='fas fa-eye'></i>")
                            .on("click", function () {
                                window.open(targetUrl, '_blank');
                            })
                            .appendTo(container);
                    }
                }
            }
        ],
        onCellPrepared: function (e) {
            if (
                e.rowType === "data" &&
                e.column.dataField === "NgayKiem" &&
                e.data.SoGioTre > 48
            ) {
                e.cellElement.css({
                    "background-color": "#ffe0e0",
                    "color": "#c00000",
                    "font-weight": "bold"
                });
            }
        },
        onContentReady: function (e) {
            syncGridFilteredData(e.component);
        },
        onOptionChanged: function (e) {
            if (
                e.fullName &&
                (
                    e.fullName.indexOf("filterValue") >= 0 ||
                    e.fullName.indexOf("columns") >= 0 ||
                    e.fullName === "searchPanel.text"
                )
            ) {
                syncGridFilteredData(e.component);
            }
        },
    });
}

/*region Popup Filter*/

function buildFilterPopup(data) {

    resetFilterValue();

    const distinctItemCode =
        [...new Set(
            data
                .filter(x => x.ItemCode)
                .map(x => x.ItemCode)
        )];

    const distinctPOMua =
        [...new Set(
            data
                .filter(x => x.POMua)
                .map(x => x.POMua)
        )];

    const distinctSoLo =
        [...new Set(
            data
                .filter(x => x.SoLo)
                .map(x => x.SoLo)
        )];

    const distinctTenKH =
        [...new Set(
            data
                .filter(x => x.TenKH)
                .map(x => x.TenKH)
        )];

    const distinctTenCL =
        [...new Set(
            data
                .filter(x => x.TenCL)
                .map(x => x.TenCL)
        )];

    _popupFilter =
        $("#popupCustomFilter")
            .dxPopup({
                title: "Bộ Lọc Dữ Liệu",
                width: 600,
                height: "auto",
                maxHeight: "92vh",
                showCloseButton: true,
                dragEnabled: false,
                hideOnOutsideClick: false,

                contentTemplate: function (contentElement) {

                    const container =
                        $("<div class='p-2 filter-popup-body'></div>");

                    container.append(`
                        <div class="filter-card">
                            <label class="filter-label">
                                <i class="fas fa-barcode"></i>
                                Item Code
                            </label>
                            <div id="filterItemCode"></div>
                        </div>

                        <div class="filter-card">
                            <label class="filter-label">
                                <i class="fas fa-file-invoice"></i>
                                PO Mua
                            </label>
                            <div id="filterPOMua"></div>
                        </div>

                        <div class="filter-card">
                            <label class="filter-label">
                                <i class="fas fa-box"></i>
                                Số Lô
                            </label>
                            <div id="filterSoLo"></div>
                        </div>

                        <div class="filter-card">
                            <label class="filter-label">
                                <i class="fas fa-users"></i>
                                Khách Hàng
                            </label>
                            <div id="filterTenKH"></div>
                        </div>

                        <div class="filter-card">
                            <label class="filter-label">
                                <i class="fas fa-layer-group"></i>
                                Chủng Loại
                            </label>
                            <div id="filterTenCL"></div>
                        </div>

                        <div class="filter-footer">
                            <button id="btn-cancel-filter"
                                    class="btn-filter-cancel">
                                <i class="fas fa-times me-1"></i>
                                Hủy
                            </button>

                            <button id="btn-apply-filter"
                                    class="btn-filter-apply">
                                <i class="fas fa-check me-1"></i>
                                Đồng ý
                            </button>
                        </div>
                    `);

                    contentElement.append(container);

                    const selectOption = {
                        searchEnabled: true,
                        showClearButton: true,
                        value: null,
                        height: 38,
                        dropDownOptions: {
                            maxHeight: 420,
                            height: "auto"
                        }
                    };

                    $("#filterItemCode").dxSelectBox({
                        ...selectOption,
                        dataSource: distinctItemCode,
                        placeholder: "Chọn Item Code"
                    });

                    $("#filterPOMua").dxSelectBox({
                        ...selectOption,
                        dataSource: distinctPOMua,
                        placeholder: "Chọn PO Mua"
                    });

                    $("#filterSoLo").dxSelectBox({
                        ...selectOption,
                        dataSource: distinctSoLo,
                        placeholder: "Chọn Số Lô"
                    });

                    $("#filterTenKH").dxSelectBox({
                        ...selectOption,
                        dataSource: distinctTenKH,
                        placeholder: "Chọn Khách Hàng"
                    });

                    $("#filterTenCL").dxSelectBox({
                        ...selectOption,
                        dataSource: distinctTenCL,
                        placeholder: "Chọn Chủng Loại"
                    });

                    $("#btn-cancel-filter")
                        .off("click")
                        .on("click", function () {
                            _popupFilter.hide();
                        });

                    $("#btn-apply-filter")
                        .off("click")
                        .on("click", function () {

                            _filterValue = {
                                ItemCode:
                                    $("#filterItemCode")
                                        .dxSelectBox("instance")
                                        .option("value"),

                                POMua:
                                    $("#filterPOMua")
                                        .dxSelectBox("instance")
                                        .option("value"),

                                SoLo:
                                    $("#filterSoLo")
                                        .dxSelectBox("instance")
                                        .option("value"),

                                TenKH:
                                    $("#filterTenKH")
                                        .dxSelectBox("instance")
                                        .option("value"),

                                TenCL:
                                    $("#filterTenCL")
                                        .dxSelectBox("instance")
                                        .option("value"),
                                NhaCungCap: $("#filterNhaCC")
                                    .dxSelectBox("instance")
                                    .option("value")
                            };

                            applyLocalFilter();

                            _popupFilter.hide();
                        });
                }
            })
            .dxPopup("instance");

    _popupFilter.show();
}

/*endregion*/
/*region Apply Local Filter*/

function applyLocalFilter() {

    const selectedItem =
        tabKiemNPL.option("selectedItem");

    let sourceData =
        selectedItem.id === "NL"
            ? _originDataNL
            : _originDataPL;

    let filteredData =
        [...sourceData];

    if (_filterValue.ItemCode) {
        filteredData = filteredData.filter(x =>
            x.ItemCode === _filterValue.ItemCode);
    }

    if (_filterValue.POMua) {
        filteredData = filteredData.filter(x =>
            x.POMua === _filterValue.POMua);
    }

    if (_filterValue.SoLo) {
        filteredData = filteredData.filter(x =>
            x.SoLo === _filterValue.SoLo);
    }

    if (_filterValue.TenKH) {
        filteredData = filteredData.filter(x =>
            x.TenKH === _filterValue.TenKH);
    }

    if (_filterValue.TenCL) {
        filteredData = filteredData.filter(x =>
            x.TenCL === _filterValue.TenCL);
    }
    if (_filterValue.NhaCungCap) {
        filteredData = filteredData.filter(x =>
            x.NhaCungCap === _filterValue.NhaCungCap);
    }
    window._isFilteringLocal = true;

    if (selectedItem.id === "NL") {
        fetchBaoCaoNL(filteredData);
    }
    else {
        fetchBaoCaoPL(filteredData);
    }

    _filteredExportData = [...filteredData];

    window._isFilteringLocal = false;
}
/*endregion*/


$("#select-filer").on("change", function () {
    clearInlineFilters();
    _filteredExportData = [];
    onDateRangeChange();
});

function setTabKiem() {
    tabKiemNPL = $('#tab-kiem-npl').dxTabs({
        width: 'auto',
        rtlEnabled: false,
        selectedIndex: 0,
        showNavButtons: false,
        dataSource: arrTabNPL,
        orientation: "horizontal",
        stylingMode: "primary",
        iconPosition: "left",
        onItemClick(e) {
            clearInlineFilters();
            _filteredExportData = [];
            onDateRangeChange();
        }
    }).dxTabs('instance');


}
;

$("#btn-open-filter")
    .off("click")
    .on("click", function () {

        const sourceData =
            getCurrentSourceData();

        if (!sourceData || sourceData.length === 0) {
            DevExpress.ui.notify(
                "Không có dữ liệu để lọc.",
                "warning",
                3000
            );

            return;
        }

        readInlineFilterValue();

        const hasFilter =
            _filterValue.ItemCode ||
            _filterValue.POMua ||
            _filterValue.SoLo ||
            _filterValue.TenKH ||
            _filterValue.TenCL ||
            _filterValue.NhaCungCap
            ;

        if (!hasFilter) {
            onDateRangeChange();


            return;
        }

        applyLocalFilter();
    });


function syncBtn() {

    var panels = document.querySelectorAll('.panel');
    var anyCollapsed = Array.from(panels).some(function (p) { return !p.classList.contains('expanded'); });
    toggleBtn.textContent = anyCollapsed ? 'Mở rộng' : 'Thu gọn';
}

document.querySelectorAll('.panel-head').forEach(function (head) {
    head.addEventListener('click', function () {
        head.closest('.panel').classList.toggle('expanded');
        syncBtn();
    });
});

toggleBtn.addEventListener('click', function () {
    var anyCollapsed = Array.from(document.querySelectorAll('.panel')).some(function (p) { return !p.classList.contains('expanded'); });
    document.querySelectorAll('.panel').forEach(function (p) {
        anyCollapsed ? p.classList.add('expanded') : p.classList.remove('expanded');
    });
    syncBtn();
});

/* Export Excel */

$("#btn-Excel").off("click").on("click", async function () {

    const $button = $("#btn-Excel");

    try {

        const fromDateVal =
            $("#fromDate")
                .dxDateBox("instance")
                .option("value");

        const toDateVal =
            $("#toDate")
                .dxDateBox("instance")
                .option("value");

        if (!fromDateVal || !toDateVal) {

            DevExpress.ui.notify(
                "Vui lòng chọn ngày.",
                "warning",
                3000
            );

            return;
        }

        const selectedItem =
            tabKiemNPL.option("selectedItem");

        if (!selectedItem) {

            DevExpress.ui.notify(
                "Không xác định loại báo cáo.",
                "error",
                3000
            );

            return;
        }

        const inlineFilteredData = getInlineFilteredDataForExport();
        const gridFilterRowData = getGridFilterRowDataForExport();

        let exportFilteredData = [];

        if (inlineFilteredData) {
            exportFilteredData = [...inlineFilteredData];
        }
        else if (gridFilterRowData) {
            exportFilteredData = [...gridFilterRowData];
        }
        else if (_filteredExportData && _filteredExportData.length > 0) {
            exportFilteredData = [..._filteredExportData];
        }

        const requestData = {
            FromDate: moment(fromDateVal).format("YYYY-MM-DD"),
            ToDate: moment(toDateVal).format("YYYY-MM-DD"),
            Result: $("#select-filer").val(),
            Type: selectedItem.id,
            FilteredData: exportFilteredData
        };

        const prefix =
            selectedItem.id === "NL"
                ? "BaoCaoNguyenLieu"
                : "BaoCaoPhuLieu";

        const now = new Date();

        const pad =
            n => n.toString().padStart(2, "0");

        const defaultFileName =
            `${prefix}_` +
            `${pad(now.getDate())}` +
            `${pad(now.getMonth() + 1)}` +
            `${now.getFullYear()}_` +
            `${pad(now.getHours())}` +
            `${pad(now.getMinutes())}` +
            `${pad(now.getSeconds())}.xlsx`;

        $button
            .prop("disabled", true)
            .html(`
                <span class="spinner-border spinner-border-sm"></span>
                Đang xuất...
            `);

        const response = await fetch(
            "/api/QtyKiemPL/ExportBCNgay",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestData)
            });

        if (!response.ok) {

            let errorText = "";

            try {

                errorText =
                    await response.text();

            } catch {

            }

            console.error(
                "Export Error:",
                errorText
            );

            DevExpress.ui.notify(
                "Xuất Excel thất bại.",
                "error",
                4000
            );

            return;
        }

        const blob =
            await response.blob();

        if (!blob || blob.size === 0) {

            DevExpress.ui.notify(
                "File export rỗng.",
                "error",
                3000
            );

            return;
        }

        let fileName =
            defaultFileName;

        const contentDisposition =
            response.headers.get(
                "Content-Disposition"
            );

        if (contentDisposition) {

            const match =
                contentDisposition.match(
                    /filename="?([^"]+)"?/i
                );

            if (match && match[1]) {

                fileName = match[1];
            }
        }

        const blobUrl =
            window.URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.style.display = "none";

        link.href = blobUrl;

        link.download = fileName;

        document.body.appendChild(link);

        link.click();

        setTimeout(() => {

            window.URL.revokeObjectURL(blobUrl);

            link.remove();

        }, 1000);

        DevExpress.ui.notify(
            "Xuất Excel thành công.",
            "success",
            2000
        );
    }
    catch (error) {

        console.error(
            "Export Exception:",
            error
        );

        DevExpress.ui.notify(
            "Có lỗi xảy ra khi xuất Excel.",
            "error",
            4000
        );
    }
    finally {

        $button
            .prop("disabled", false)
            .html(`
                <i class="fas fa-file-excel"></i>
                Excel
            `);
    }

    function getCurrentSourceData() {
        const selectedItem =
            tabKiemNPL.option("selectedItem");

        if (!selectedItem) {
            return [];
        }

        return selectedItem.id === "NL"
            ? _originDataNL
            : _originDataPL;
    }

    function getDistinctValues(data, field) {
        return [...new Set(
            data
                .filter(x => x[field])
                .map(x => x[field])
        )];
    }

    function initInlineFilters(data) {
        const selectOption = {
            searchEnabled: true,
            showClearButton: true,
            value: null,
            height: 38,
            dropDownOptions: {
                maxHeight: 420,
                height: "auto"
            }
        };

        $("#filterItemCode").dxSelectBox({
            ...selectOption,
            dataSource: getDistinctValues(data, "ItemCode"),
            placeholder: "Item Code"
        });

        $("#filterPOMua").dxSelectBox({
            ...selectOption,
            dataSource: getDistinctValues(data, "POMua"),
            placeholder: "PO Mua"
        });

        $("#filterSoLo").dxSelectBox({
            ...selectOption,
            dataSource: getDistinctValues(data, "SoLo"),
            placeholder: "Số Lô"
        });

        $("#filterTenKH").dxSelectBox({
            ...selectOption,
            dataSource: getDistinctValues(data, "TenKH"),
            placeholder: "Khách Hàng"
        });

        $("#filterTenCL").dxSelectBox({
            ...selectOption,
            dataSource: getDistinctValues(data, "TenCL"),
            placeholder: "Chủng Loại"
        });
    }

    function refreshInlineFilters() {
        const sourceData =
            getCurrentSourceData();

        initInlineFilters(sourceData);
    }

    function readInlineFilterValue() {
        _filterValue = {
            ItemCode:
                $("#filterItemCode").dxSelectBox("instance")
                    ? $("#filterItemCode").dxSelectBox("instance").option("value")
                    : null,

            POMua:
                $("#filterPOMua").dxSelectBox("instance")
                    ? $("#filterPOMua").dxSelectBox("instance").option("value")
                    : null,

            SoLo:
                $("#filterSoLo").dxSelectBox("instance")
                    ? $("#filterSoLo").dxSelectBox("instance").option("value")
                    : null,

            TenKH:
                $("#filterTenKH").dxSelectBox("instance")
                    ? $("#filterTenKH").dxSelectBox("instance").option("value")
                    : null,

            TenCL:
                $("#filterTenCL").dxSelectBox("instance")
                    ? $("#filterTenCL").dxSelectBox("instance").option("value")
                    : null,
            NhaCungCap: $("#filterNhaCC").dxSelectBox("instance")
                ? $("#filterNhaCC").dxSelectBox("instance").option("value")
                : null,
        };
    }

    function clearInlineFilters() {
        resetFilterValue();

        const filterIds = [
            "#filterItemCode",
            "#filterPOMua",
            "#filterSoLo",
            "#filterTenKH",
            "#filterTenCL"
        ];

        filterIds.forEach(function (id) {
            const instance =
                $(id).dxSelectBox("instance");

            if (instance) {
                instance.option("value", null);
            }
        });
    }
});

$(document).ready(function () {
    const today = new Date();

    setTabKiem();
    syncBtn();

    $("#fromDate").dxDateBox({
        type: "date",
        displayFormat: "dd/MM/yyyy",
        useMaskBehavior: true,
        value: today,
        onValueChanged: function (e) {
            onDateRangeChange();
        }
    });
    $("#toDate").dxDateBox({
        type: "date",
        displayFormat: "dd/MM/yyyy",
        useMaskBehavior: true,
        value: today,
        onValueChanged: function (e) {
            onDateRangeChange();
        }
    });

    loadVatTuNhapKho(moment(today).format('YYYY-MM-DD'), moment(today).format('YYYY-MM-DD'), 1)

    loadBaoCaoKiemNL(moment(today).format('YYYY-MM-DD'), moment(today).format('YYYY-MM-DD'), $("#select-filer").val());

   
})