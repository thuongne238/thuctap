(function (window, $) {
    "use strict";

    const API_BASE = "/api/CanDoiDonHangTong";
    const POPUP_ID = "popupSuaLenhSX";
    const GRID_SIZE_ID = "gridSuaLenhSXSize";
    const GRID_PROCESS_ID = "gridSuaLenhSXProcess";
    const GRID_AVAILABILITY_ID = "gridSuaLenhSXAvailability";

    const state = {
        popup: null,
        loadPanel: null,
        rowData: null,
        header: {},
        rows: [],
        originalRows: [],
        originalMap: new Map(),
        dvsxList: [],
        processRows: [],
        checkCache: new Map(),
        availabilityCache: new Map(),
        originalMaDVSX: "",
        splitButton: null,
        canSplit: false,
        isDirty: false,
        suppressDirty: false,
        controlsInited: false
    };

    function currentUser() {
        return String(
            localStorage.getItem("username") ||
            localStorage.getItem("username1") ||
            window.CURRENT_USER ||
            ""
        ).trim();
    }

    function safeInstance(sel, widgetName) {
        try { return $(sel)[widgetName]("instance"); } catch { return null; }
    }

    function apiGetJson(url) {
        return $.ajax({ url: url, method: "GET", dataType: "json" });
    }

    function apiPostJson(url, body) {
        return $.ajax({
            url: url,
            method: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(body),
            dataType: "text"
        });
    }

    function isTrueResponse(x) {
        if (x === true) return true;
        if (x == null) return false;
        const s = String(x).replace(/^"+|"+$/g, "").trim().toLowerCase();
        return s === "true";
    }

    function notify(message, type, ms) {
        DevExpress.ui.notify(message, type || "info", ms || 1800);
    }

    function asString(value) {
        return value == null ? "" : String(value).trim();
    }

    function numberValue(value) {
        const n = Number(value);
        return Number.isFinite(n) ? n : 0;
    }

    function cloneRows(rows) {
        return (rows || []).map(function (row) {
            return $.extend(true, {}, row);
        });
    }

    function getSizeColumnsFromRows(rows) {
        const set = new Set();
        (rows || []).forEach(function (row) {
            Object.keys(row || {}).forEach(function (key) {
                if (key.indexOf("@Size@") >= 0) set.add(key);
            });
        });
        return Array.from(set).sort(function (a, b) {
            return getSizeCaption(a).localeCompare(getSizeCaption(b), "vi");
        });
    }

    function parseSizeColKey(colKey) {
        const parts = String(colKey || "").split("@Size@");
        return {
            SizeID: asString(parts[0]),
            Size: asString(parts[1])
        };
    }

    function getSizeCaption(colKey) {
        return parseSizeColKey(colKey).Size || colKey;
    }

    function getLineValue(row) {
        return asString(row && (row.Line || row.Chuyen || row.LineX));
    }

    function getLineDisplay(row) {
        return asString(row && (row.SawDep || row.DepName || row.LineName || row.TenChuyen)) ||
            asString(state.rowData && (state.rowData.SawDep || state.rowData.DepName || state.rowData.LineName || state.rowData.TenChuyen)) ||
            asString(row && (row.Line || row.Chuyen || row.LineX || row.MaChuyen)) ||
            asString(state.rowData && (state.rowData.Line || state.rowData.Chuyen || state.rowData.LineX || state.rowData.MaChuyen));
    }

    function calcAmount(row) {
        return getSizeColumnsFromRows([row]).reduce(function (sum, field) {
            return sum + numberValue(row[field]);
        }, 0);
    }

    function makeOriginalKey(row) {
        return [
            asString(row.MaLenhSanXuat),
            asString(row.MaLenh),
            asString(row.MaDH),
            asString(row.POID),
            asString(row.MaMau),
            asString(row.DauSizeID),
            asString(row.MaGop),
            getLineValue(row)
        ].join("|");
    }

    function buildOriginalMap(rows) {
        const map = new Map();
        (rows || []).forEach(function (row) {
            map.set(makeOriginalKey(row), row);
        });
        return map;
    }

    function parseDotFromMaLenhSanXuat(maLenhSanXuat) {
        const parts = asString(maLenhSanXuat).split("|");
        return parts.length >= 3 ? parts[2] : "";
    }

    function uniqueStrings(values) {
        const result = [];
        (values || []).forEach(function (value) {
            const text = asString(value);
            if (text && result.indexOf(text) < 0) result.push(text);
        });
        return result;
    }

    function splitMaDHJoined(maDHJoined) {
        return uniqueStrings(asString(maDHJoined)
            .split(/[;@]/)
            .map(function (item) { return asString(item); }));
    }

    function parseMaDHFromMaLenhSanXuat(maLenhSanXuat) {
        const head = asString(maLenhSanXuat).split("|")[0] || "";
        return splitMaDHJoined(head);
    }

    function buildMaDHJoined(rows, fallback, maLenhSanXuat) {
        const fromLenh = parseMaDHFromMaLenhSanXuat(maLenhSanXuat);
        if (fromLenh.length) return fromLenh.join(";");

        const fromRows = uniqueStrings((rows || []).map(function (row) {
            return row && row.MaDH;
        }));
        if (fromRows.length) return fromRows.join(";");

        return uniqueStrings(splitMaDHJoined(fallback && fallback.MaDH)).join(";");
    }

    function normalizeRows(rows) {
        const sizeCols = getSizeColumnsFromRows(rows);
        return cloneRows(rows).map(function (row) {
            row._Chuyen = getLineDisplay(row);
            sizeCols.forEach(function (field) {
                row[field] = numberValue(row[field]);
            });
            row.Amount = calcAmount(row);
            return row;
        });
    }

    function resolveHeader(rows, fallback) {
        const first = (rows && rows[0]) || {};
        const maLenhSanXuat = asString(first.MaLenhSanXuat || fallback.MaLenhSanXuat);
        const maDHJoined = buildMaDHJoined(rows, fallback, maLenhSanXuat);
        return {
            MaLenhSanXuat: maLenhSanXuat,
            MaLenh: asString(first.MaLenh || fallback.LenhSX || fallback.MaLenh),
            TenLenh: asString(first.TenLenh || fallback.TenLenh),
            MaDH: maDHJoined || asString(first.MaDH || fallback.MaDH),
            MaHang: asString(first.MaHang || fallback.StyleId || fallback.MaHang),
            DotSX: asString(first.DotSX || first.Dot || fallback.DotSX || parseDotFromMaLenhSanXuat(maLenhSanXuat)),
            MaDVSX: asString(first.MaDVSX || fallback.MaDVSX),
            GhiChu: asString(first.GhiChu || fallback.GhiChu),
            MaGop: asString(first.MaGop || fallback.MaGop)
        };
    }

    function setLoading(visible, message) {
        if (!state.loadPanel) return;
        if (message) state.loadPanel.option("message", message);
        state.loadPanel.option("visible", !!visible);
    }

    async function withLoading(message, fn) {
        setLoading(true, message || "Đang xử lý...");
        try {
            return await fn();
        } finally {
            setLoading(false);
        }
    }

    function setSplitEnabled(enabled) {
        state.canSplit = !!enabled;
        if (state.splitButton) {
            state.splitButton.option("disabled", !state.canSplit);
        }
    }

    function markDirty() {
        if (state.suppressDirty) return;
        state.isDirty = true;
        setSplitEnabled(false);
    }

    function markSaved() {
        state.isDirty = false;
        setSplitEnabled(true);
    }

    function ensurePopup() {
        if (!$("#" + POPUP_ID).length) {
            notify("Thiếu markup popup Sửa lệnh sản xuất trong Index.cshtml.", "warning", 2200);
            return null;
        }
        if (state.popup) return state.popup;

        $("#" + POPUP_ID).show();
        state.popup = $("#" + POPUP_ID).dxPopup({
            title: "Sửa lệnh sản xuất",
            width: "89vw",
            height: "85vh",
            maxWidth: 1760,
            //maxHeight: 940,
            showTitle: true,
            wrapperAttr: { class: "sua-lenh-sx-popup-wrapper" },
            dragEnabled: true,
            resizeEnabled: true,
            hideOnOutsideClick: false,
            toolbarItems: [
                {
                    widget: "dxButton",
                    toolbar: "bottom",
                    location: "after",
                    options: {
                        text: "Lưu",
                        icon: "save",
                        type: "success",
                        onClick: function () { saveEditProductionOrder(); }
                    }
                },
                {
                    widget: "dxButton",
                    toolbar: "bottom",
                    location: "after",
                    options: {
                        text: "Chia sản xuất",
                        icon: "plus",
                        disabled: true,
                        onInitialized: function (e) {
                            state.splitButton = e.component;
                        },
                        onClick: function () { openSplitAfterSaved(); }
                    }
                },
                {
                    widget: "dxButton",
                    toolbar: "bottom",
                    location: "after",
                    options: {
                        text: "Đóng",
                        onClick: function () { state.popup.hide(); }
                    }
                }
            ],
            onContentReady: function () {
                ensureControlsInited();
            },
            onShown: function () {
                ensureControlsInited();
                renderHeader();
                renderSizeGrid();
                renderProcessGrid();
                renderAvailabilityGrid();
                refreshGrids();
            }
        }).dxPopup("instance");

        ensureControlsInited();

        return state.popup;
    }

    function ensureControlsInited() {
        if (state.controlsInited) return;
        if (!$("#sxEdit_LenhSX").length || !$("#" + GRID_SIZE_ID).length) return;

        initEditors();
        initGrids();
        initLoadPanel();
        state.controlsInited = true;
    }

    function initEditors() {
        if (safeInstance("#sxEdit_LenhSX", "dxTextBox")) return;
        $("#sxEdit_LenhSX").dxTextBox({ readOnly: true, height: 30, stylingMode: "outlined" });
        $("#sxEdit_MaDH").dxTextBox({ readOnly: true, height: 30, stylingMode: "outlined" });
        $("#sxEdit_MaHang").dxTextBox({ readOnly: true, height: 30, stylingMode: "outlined" });
        $("#sxEdit_DotSX").dxTextBox({ readOnly: true, height: 30, stylingMode: "outlined" });
        $("#sxEdit_GhiChu").dxTextBox({ height: 30, stylingMode: "outlined", onValueChanged: markDirty });
        $("#sxEdit_DVSX").dxSelectBox({
            dataSource: [],
            valueExpr: "MaDVSX",
            displayExpr: "TenDVSX",
            searchEnabled: false,
            acceptCustomValue: false,
            showClearButton: false,
            height: 30,
            stylingMode: "outlined",
            dropDownOptions: { container: "#" + POPUP_ID, width: 280 },
            onValueChanged: markDirty
        });
    }

    function initLoadPanel() {
        if (state.loadPanel) return;
        const $content = state.popup ? state.popup.content() : $("#" + POPUP_ID);
        state.loadPanel = $("#lpSuaLenhSX").dxLoadPanel({
            container: $content,
            position: {
                my: "center",
                at: "center",
                of: $content
            },
            shading: true,
            showIndicator: true,
            showPane: true,
            visible: false,
            message: "Đang xử lý..."
        }).dxLoadPanel("instance");
    }

    function initGrids() {
        if (safeInstance("#" + GRID_SIZE_ID, "dxDataGrid")) return;
        $("#" + GRID_SIZE_ID).dxDataGrid({
            dataSource: [],
            showBorders: true,
            height: "100%",
            columnAutoWidth: true,
            wordWrapEnabled: false,
            allowColumnResizing: true,
            columnResizingMode: "widget",
            scrolling: { mode: "standard", showScrollbar: "always", useNative: true },
            paging: { enabled: false },
            pager: { visible: false },
            groupPanel: { visible: false },
            editing: {
                mode: "cell",
                allowUpdating: true,
                selectTextOnEditStart: true,
                startEditAction: "click",
                enterKeyAction: "moveFocus",
                enterKeyDirection: "row"
            },
            columns: buildSizeGridColumns([]),
            summary: buildSummary([]),
            noDataText: "",
            onEditorPreparing: onSizeEditorPreparing,
            onRowUpdating: onSizeRowUpdating,
            onRowUpdated: function () {
                updateRowsFromGrid();
                renderAvailabilityGrid();
                markDirty();
            }
        });

        $("#" + GRID_PROCESS_ID).dxDataGrid({
            dataSource: [],
            keyExpr: "ID",
            showBorders: true,
            height: "100%",
            columnAutoWidth: false,
            paging: { enabled: false },
            pager: { visible: false },
            scrolling: { mode: "standard", showScrollbar: "always", useNative: true },
            editing: { mode: "cell", allowUpdating: true },
            noDataText: "",
            columns: buildProcessColumns(),
            onRowUpdated: markDirty
        });

        $("#" + GRID_AVAILABILITY_ID).dxDataGrid({
            dataSource: [],
            showBorders: true,
            height: "100%",
            columnAutoWidth: true,
            wordWrapEnabled: false,
            allowColumnResizing: true,
            columnResizingMode: "widget",
            scrolling: { mode: "standard", showScrollbar: "always", useNative: true },
            paging: { enabled: false },
            pager: { visible: false },
            editing: { allowUpdating: false },
            noDataText: "",
            columns: buildAvailabilityColumns([])
        });
    }

    function buildProcessColumns() {
        const lookup = {
            dataSource: function () { return state.dvsxList || []; },
            valueExpr: "MaDVSX",
            displayExpr: "TenDVSX"
        };
        const editorOptions = {
            dropDownOptions: { container: "#" + POPUP_ID, width: 280 },
            searchEnabled: false,
            acceptCustomValue: false,
            openOnFieldClick: true
        };
        return [
            { caption: "Cắt", dataField: "MaDVSXCat", width: 100, alignment: "center", lookup: lookup, editorOptions: editorOptions },
            { caption: "May", dataField: "MaDVSXMay", width: 100, alignment: "center", lookup: lookup, editorOptions: editorOptions },
            { caption: "Hoàn thành", dataField: "MaDVSXHoanThanh", width: 100, alignment: "center", lookup: lookup, editorOptions: editorOptions },
            { caption: "Nhập kho", dataField: "MaDVSXDongThung", width: 100, alignment: "center", lookup: lookup, editorOptions: editorOptions }
        ];
    }

    function onSizeEditorPreparing(e) {
        if (e.parentType !== "dataRow") return;
        const field = asString(e.dataField);
        if (field.indexOf("@Size@") < 0) return;

        e.editorName = "dxNumberBox";
        e.editorOptions = e.editorOptions || {};
        e.editorOptions.min = 0;
        e.editorOptions.step = 1;
        e.editorOptions.showSpinButtons = true;
        e.editorOptions.height = 24;
        e.editorOptions.format = "#,##0";
    }

    function onSizeRowUpdating(e) {
        const changedSizeFields = Object.keys(e.newData || {}).filter(function (field) {
            return field.indexOf("@Size@") >= 0;
        });
        if (!changedSizeFields.length) return;

        const merged = $.extend(true, {}, e.oldData, e.newData);
        e.cancel = (async function () {
            for (const field of changedSizeFields) {
                const value = numberValue(merged[field]);
                if (value < 0) {
                    notify("Số lượng phải lớn hơn hoặc bằng 0.", "warning", 2200);
                    return true;
                }

                const ok = await validateSizeEdit(merged, field, value);
                if (!ok) return true;
            }

            merged.Amount = calcAmount(merged);
            e.newData = merged;
            return false;
        })();
    }

    function updateRowsFromGrid() {
        const grid = safeInstance("#" + GRID_SIZE_ID, "dxDataGrid");
        if (!grid) return;
        const items = grid.getDataSource() ? grid.getDataSource().items() : grid.option("dataSource");
        state.rows = Array.isArray(items) ? items : [];
    }

    function makeCheckKey(row) {
        return [
            asString(row && row.MaDH),
            asString(row && row.POID),
            asString(row && row.MaMau),
            asString(row && row.DauSizeID)
        ].join("|");
    }

    function buildCheckUrl(row) {
        return API_BASE +
            "/GetCheckEdiCanDoiSX?madh=" + encodeURIComponent(asString(row.MaDH)) +
            "&&malenh=" + encodeURIComponent(asString(state.header.MaLenh)) +
            "&&poid=" + encodeURIComponent(asString(row.POID)) +
            "&&mamau=" + encodeURIComponent(asString(row.MaMau)) +
            "&&dausizeid=" + encodeURIComponent(asString(row.DauSizeID));
    }

    async function getCheckRows(row) {
        const key = makeCheckKey(row);
        if (state.checkCache.has(key)) return state.checkCache.get(key);

        const checkRows = await apiGetJson(buildCheckUrl(row));
        const safeRows = Array.isArray(checkRows) ? checkRows : [];
        state.checkCache.set(key, safeRows);
        return safeRows;
    }

    async function loadAvailabilityChecks() {
        state.availabilityCache = new Map();

        const groups = new Map();
        (state.rows || []).forEach(function (row) {
            const maDH = asString(row.MaDH);
            if (!maDH) return;
            if (!groups.has(maDH)) {
                groups.set(maDH, { poid: new Set(), mamau: new Set(), dausizeid: new Set() });
            }
            const group = groups.get(maDH);
            if (asString(row.POID)) group.poid.add(asString(row.POID));
            if (asString(row.MaMau)) group.mamau.add(asString(row.MaMau));
            if (asString(row.DauSizeID)) group.dausizeid.add(asString(row.DauSizeID));
        });

        const jobs = Array.from(groups.entries()).map(function ([maDH, group]) {
            const url = API_BASE +
                "/GetSoLuongDH?madh=" + encodeURIComponent(maDH) +
                "&dausizeid=" + encodeURIComponent(Array.from(group.dausizeid).join(";")) +
                "&mamau=" + encodeURIComponent(Array.from(group.mamau).join(";")) +
                "&poid=" + encodeURIComponent(Array.from(group.poid).join(";"));

            return apiGetJson(url).then(function (dtData) {
                const pivot = new Map();
                (dtData || []).forEach(function (r) {
                    const key = makeCheckKey(r);
                    if (!pivot.has(key)) {
                        pivot.set(key, {
                            MaDH: r.MaDH,
                            POID: r.POID,
                            MaMau: r.MaMau,
                            DauSizeID: r.DauSizeID
                        });
                    }
                    const row = pivot.get(key);
                    const colKey = asString(r.SizeID) + "@Size@" + asString(r.Size);
                    row[colKey] = numberValue(r.SoLuong);
                });

                pivot.forEach(function (row, key) {
                    state.availabilityCache.set(key, [row]);
                });
            }).catch(function (err) {
                console.error("GetSoLuongDH availability error", err);
            });
        });

        await Promise.all(jobs);
    }

    async function validateSizeEdit(row, field, value) {
        const checkRows = await getCheckRows(row);
        if (!Array.isArray(checkRows) || !checkRows.length) {
            notify("Không lấy được số lượng kế hoạch để kiểm tra.", "warning", 2400);
            return false;
        }

        const hasSize = checkRows.some(function (item) {
            return Object.prototype.hasOwnProperty.call(item || {}, field);
        });
        if (!hasSize) {
            notify("Size không tồn tại trong đơn hàng " + asString(row.MaDH) + ".", "warning", 2600);
            return false;
        }

        const found = checkRows.find(function (item) {
            return asString(item.POID) === asString(row.POID) &&
                asString(item.MaMau) === asString(row.MaMau) &&
                asString(item.DauSizeID) === asString(row.DauSizeID);
        }) || checkRows[0];

        const slKh = numberValue(found[field]);
        const currentLine = getLineValue(row);
        const allRows = getCurrentSizeRows();
        const slKhac = allRows.reduce(function (sum, item) {
            const sameKey = asString(item.POID) === asString(row.POID) &&
                asString(item.MaMau) === asString(row.MaMau) &&
                asString(item.DauSizeID) === asString(row.DauSizeID);
            if (!sameKey || getLineValue(item) === currentLine) return sum;
            return sum + numberValue(item[field]);
        }, 0);

        if (value + slKhac > slKh) {
            const size = getSizeCaption(field);
            notify(
                "Tổng số lượng Size " + size +
                " - PO: " + asString(row.PO) +
                " - Inseam " + asString(row.DauSize) +
                " - Màu: " + asString(row.TenMau) +
                " không vượt quá SLKH: " + slKh,
                "warning",
                3500
            );
            return false;
        }

        return true;
    }

    function getCurrentSizeRows() {
        const grid = safeInstance("#" + GRID_SIZE_ID, "dxDataGrid");
        if (!grid) return state.rows || [];
        const ds = grid.option("dataSource");
        return Array.isArray(ds) ? ds : (grid.getDataSource()?.items?.() || state.rows || []);
    }

    function renderHeader() {
        state.suppressDirty = true;
        try {
            safeInstance("#sxEdit_LenhSX", "dxTextBox")?.option("value", state.header.MaLenh || "");
            safeInstance("#sxEdit_MaDH", "dxTextBox")?.option("value", state.header.MaDH || "");
            safeInstance("#sxEdit_MaHang", "dxTextBox")?.option("value", state.header.MaHang || "");
            safeInstance("#sxEdit_DotSX", "dxTextBox")?.option("value", state.header.DotSX || "");
            safeInstance("#sxEdit_GhiChu", "dxTextBox")?.option("value", state.header.GhiChu || "");
            safeInstance("#sxEdit_DVSX", "dxSelectBox")?.option({
                dataSource: state.dvsxList,
                value: state.header.MaDVSX || null
            });
        } finally {
            state.suppressDirty = false;
        }
    }

    function buildSizeGridColumns(rows) {
        const sizeCols = getSizeColumnsFromRows(rows);
        const columns = [
            { dataField: "MaDH", caption: "Đơn hàng", width: 90, allowEditing: false },
            { dataField: "TenMau", caption: "Màu", width: 90, allowEditing: false },
            { dataField: "PO", caption: "PO", width: 145, allowEditing: false },
            { dataField: "DauSize", caption: "Nhóm size", width: 90, allowEditing: false },
            { dataField: "DepName", caption: "Chuyền", width: 90, allowEditing: false }
        ];

        sizeCols.forEach(function (field) {
            columns.push({
                dataField: field,
                caption: getSizeCaption(field),
                dataType: "number",
                format: "#,##0",
                alignment: "right",
                allowEditing: true
            });
        });

        columns.push({
            dataField: "Amount",
            caption: "Tổng",
            width: 78,
            dataType: "number",
            format: "#,##0",
            alignment: "right",
            allowEditing: false
        });

        return columns;
    }

    function buildSummary(rows) {
        const items = getSizeColumnsFromRows(rows).map(function (field) {
            return {
                column: field,
                summaryType: "sum",
                valueFormat: "#,##0",
                displayFormat: "{0}"
            };
        });
        items.push({
            column: "Amount",
            summaryType: "sum",
            valueFormat: "#,##0",
            displayFormat: "{0}"
        });
        return { totalItems: items, groupItems: items };
    }

    function findCheckRow(row) {
        const checkRows = state.checkCache.get(makeCheckKey(row)) || [];
        return checkRows.find(function (item) {
            return asString(item.POID) === asString(row.POID) &&
                asString(item.MaMau) === asString(row.MaMau) &&
                asString(item.DauSizeID) === asString(row.DauSizeID);
        }) || checkRows[0] || {};
    }

    function findAvailabilityRow(row) {
        const rows = state.availabilityCache.get(makeCheckKey(row)) || [];
        return rows[0] || {};
    }

    function sumRowsByCheckKey(rows, key, field) {
        return (rows || []).reduce(function (sum, item) {
            if (makeCheckKey(item) !== key) return sum;
            return sum + numberValue(item[field]);
        }, 0);
    }

    function buildAvailabilityColumns(rows) {
        const sizeCols = getSizeColumnsFromRows(rows);
        const columns = [
            { dataField: "MaDH", caption: "Đơn hàng", width: 90, allowEditing: false },
            { dataField: "TenMau", caption: "Màu", width: 90, allowEditing: false },
            { dataField: "PO", caption: "PO", width: 145, allowEditing: false },
            { dataField: "DauSize", caption: "Nhóm size", width: 90, allowEditing: false }
        ];

        sizeCols.forEach(function (field) {
            columns.push({
                dataField: field,
                caption: getSizeCaption(field),
                dataType: "number",
                format: "#,##0",
                alignment: "right",
                allowEditing: false
            });
        });

        columns.push({
            dataField: "Amount",
            caption: "Tổng",
            width: 78,
            dataType: "number",
            format: "#,##0",
            alignment: "right",
            allowEditing: false
        });

        return columns;
    }

    function buildAvailabilityRows() {
        const rows = getCurrentSizeRows();
        const sizeCols = getSizeColumnsFromRows(rows);
        const grouped = new Map();
        const result = [];

        rows.forEach(function (row, rowIndex) {
            const key = makeCheckKey(row);
            if (!grouped.has(key)) {
                grouped.set(key, {
                    rowIndex: rowIndex,
                    sample: row,
                    rows: []
                });
            }
            grouped.get(key).rows.push(row);
        });

        grouped.forEach(function (group) {
            const row = group.sample || {};
            const key = makeCheckKey(row);
            const availabilityRow = findAvailabilityRow(row);
            const item = {
                ID: group.rowIndex,
                MaDH: row.MaDH,
                TenMau: row.TenMau,
                PO: row.PO,
                DauSize: row.DauSize
            };

            sizeCols.forEach(function (field) {
                const poolQty = numberValue(availabilityRow[field]);
                const originalTotal = sumRowsByCheckKey(state.originalRows, key, field);
                const currentTotal = (group.rows || []).reduce(function (sum, itemRow) {
                    return sum + numberValue(itemRow[field]);
                }, 0);
                item[field] = Math.max(poolQty + originalTotal - currentTotal, 0);
            });

            item.Amount = calcAmount(item);
            result.push(item);
        });

        return result;
    }

    function renderAvailabilityGrid() {
        const grid = safeInstance("#" + GRID_AVAILABILITY_ID, "dxDataGrid");
        if (!grid) return;
        const rows = buildAvailabilityRows();
        grid.option({
            columns: buildAvailabilityColumns(state.rows),
            dataSource: rows,
            summary: { totalItems: [] }
        });
    }

    function renderSizeGrid() {
        const grid = safeInstance("#" + GRID_SIZE_ID, "dxDataGrid");
        if (!grid) return;
        grid.option({
            columns: buildSizeGridColumns(state.rows),
            dataSource: state.rows,
            summary: buildSummary(state.rows)
        });
        grid.expandAll();
    }

    function renderProcessGrid() {
        const grid = safeInstance("#" + GRID_PROCESS_ID, "dxDataGrid");
        if (!grid) return;
        grid.option({
            columns: buildProcessColumns(),
            dataSource: state.processRows
        });
    }

    function refreshGrids() {
        setTimeout(function () {
            safeInstance("#" + GRID_SIZE_ID, "dxDataGrid")?.updateDimensions();
            safeInstance("#" + GRID_PROCESS_ID, "dxDataGrid")?.updateDimensions();
            safeInstance("#" + GRID_AVAILABILITY_ID, "dxDataGrid")?.updateDimensions();
        }, 0);
    }

    async function loadDonViSanXuat() {
        const dt = await apiGetJson("/api/DonViSanXuat/GetDonViSanXuat");
        state.dvsxList = (dt || []).slice().sort(function (a, b) {
            return numberValue(a.sort) - numberValue(b.sort);
        });
    }

    async function loadDetail(maLenhSanXuat) {
        const url = API_BASE + "/GetChiTietCanDoiDVSX?malenhsanxuat=" + encodeURIComponent(maLenhSanXuat);
        const dt = await apiGetJson(url);
        if (!Array.isArray(dt) || !dt.length) throw new Error("Không có dữ liệu lệnh sản xuất.");

        state.originalRows = normalizeRows(dt);
        state.rows = cloneRows(state.originalRows);
        state.originalMap = buildOriginalMap(state.originalRows);
        state.header = resolveHeader(state.rows, state.rowData || {});
        state.originalMaDVSX = state.header.MaDVSX || "";
    }

    function initProcessRows() {
        const maDVSX = state.header.MaDVSX || null;
        const dvsx = (state.dvsxList || []).find(function (x) {
            return asString(x.MaDVSX) === asString(maDVSX);
        });
        const isGiaCong = !!(dvsx && dvsx.GiaCong);
        return [{
            ID: 0,
            MaDH: state.header.MaGop || "",
            MaHang: state.header.MaHang || "",
            MaLenhSX: state.header.MaLenhSanXuat || "",
            MaDVSXCat: maDVSX,
            MaDVSXMay: maDVSX,
            MaDVSXHoanThanh: isGiaCong ? null : maDVSX,
            MaDVSXDongThung: isGiaCong ? null : maDVSX,
            NguoiTao: currentUser(),
            NguoiSua: currentUser(),
            IsDongThung: false
        }];
    }

    async function loadCongDoan() {
        const maGop = state.header.MaGop;
        if (!maGop) {
            state.processRows = initProcessRows();
            notify("API chi tiết lệnh chưa trả MaGop, công đoạn đang dùng dữ liệu mặc định.", "warning", 2800);
            return;
        }

        const url = "/api/CongDoan/GetCongDoanAllowCondition?maDH=" +
            encodeURIComponent(maGop) +
            "&&maLenhSX=" +
            encodeURIComponent(state.header.MaLenhSanXuat || "");

        const dt = await apiGetJson(url);
        if (Array.isArray(dt) && dt.length) {
            state.processRows = cloneRows(dt).map(function (row) {
                row.NguoiSua = currentUser();
                if (row.IsDongThung == null) row.IsDongThung = false;
                return row;
            });
        } else {
            state.processRows = initProcessRows();
        }
    }

    async function open(rowData) {
        if (!rowData || !rowData.MaLenhSanXuat) {
            notify("Không tìm thấy MaLenhSanXuat để sửa lệnh.", "warning", 2200);
            return;
        }

        state.rowData = $.extend(true, {}, rowData);
        state.header = resolveHeader([], state.rowData);
        state.rows = [];
        state.processRows = [];
        state.checkCache = new Map();
        state.availabilityCache = new Map();
        state.isDirty = false;
        setSplitEnabled(false);
        const popup = ensurePopup();
        if (!popup) return;
        ensureControlsInited();
        renderHeader();
        renderSizeGrid();
        renderProcessGrid();
        renderAvailabilityGrid();
        popup.show();

        try {
            await withLoading("Đang tải lệnh sản xuất...", async function () {
                await loadDonViSanXuat();
                await loadDetail(rowData.MaLenhSanXuat);
                await loadCongDoan();
                await loadAvailabilityChecks();
                renderHeader();
                renderSizeGrid();
                renderProcessGrid();
                renderAvailabilityGrid();
                refreshGrids();
            });
        } catch (err) {
            console.error(err);
            notify("Không tải được dữ liệu sửa lệnh sản xuất. Vui lòng kiểm tra Console/Network.", "error", 3500);
        }
    }

    async function flushEdits() {
        const sizeGrid = safeInstance("#" + GRID_SIZE_ID, "dxDataGrid");
        const processGrid = safeInstance("#" + GRID_PROCESS_ID, "dxDataGrid");
        if (sizeGrid) {
            try { await sizeGrid.saveEditData(); } catch { }
            try { sizeGrid.closeEditCell(); } catch { }
        }
        if (processGrid) {
            try { await processGrid.saveEditData(); } catch { }
            try { processGrid.closeEditCell(); } catch { }
        }
        updateRowsFromGrid();
    }

    function getProcessRow() {
        const grid = safeInstance("#" + GRID_PROCESS_ID, "dxDataGrid");
        const ds = grid ? grid.option("dataSource") : state.processRows;
        return (Array.isArray(ds) && ds[0]) || {};
    }

    function validateBeforeSave() {
        const maDVSX = safeInstance("#sxEdit_DVSX", "dxSelectBox")?.option("value");
        if (!maDVSX) {
            notify("Vui lòng chọn Đơn vị sản xuất.", "warning", 2000);
            return false;
        }

        const cdRow = getProcessRow();
        const required = ["MaDVSXCat", "MaDVSXMay", "MaDVSXHoanThanh", "MaDVSXDongThung"];
        for (const field of required) {
            if (!cdRow[field]) {
                notify("Vui lòng chọn đầy đủ Đơn vị sản xuất cho Cắt, May, Hoàn thành, Nhập kho.", "warning", 2600);
                return false;
            }
        }

        const hoanThanh = (state.dvsxList || []).find(function (x) {
            return asString(x.MaDVSX) === asString(cdRow.MaDVSXHoanThanh);
        });
        if (hoanThanh && hoanThanh.GiaCong) {
            notify("Công đoạn Hoàn thành không được chọn đơn vị Gia Công. Vui lòng chọn lại.", "warning", 2800);
            return false;
        }

        return true;
    }

    function buildUpdateDvsxPayload() {
        const maDVSX = safeInstance("#sxEdit_DVSX", "dxSelectBox")?.option("value") || "";
        return [{
            MaLenhSanXuat: state.header.MaLenhSanXuat || "",
            MaLenh: state.header.MaLenh || "",
            DotSX: state.header.DotSX || "",
            MaDH: state.header.MaGop || "",
            MaDVSX: maDVSX
        }];
    }

    function buildUpdateSizePayload() {
        const list = [];
        const ghiChu = safeInstance("#sxEdit_GhiChu", "dxTextBox")?.option("value") || "";
        const maDVSX = safeInstance("#sxEdit_DVSX", "dxSelectBox")?.option("value") || "";

        (state.rows || []).forEach(function (row) {
            getSizeColumnsFromRows([row]).forEach(function (field) {
                const sz = parseSizeColKey(field);
                const original = state.originalMap.get(makeOriginalKey(row));
                list.push({
                    MaLenhSanXuat: asString(row.MaLenhSanXuat || state.header.MaLenhSanXuat),
                    MaLenh: asString(row.MaLenh || state.header.MaLenh),
                    TenLenh: asString(row.TenLenh || state.header.TenLenh),
                    MaDH: asString(row.MaDH),
                    POID: asString(row.POID),
                    PO: asString(row.PO),
                    MaMau: asString(row.MaMau),
                    DauSizeID: asString(row.DauSizeID),
                    DauSize: asString(row.DauSize),
                    SizeID: sz.SizeID,
                    Size: sz.Size,
                    SoLuong: numberValue(row[field]),
                    Old_SL: numberValue(original && original[field]),
                    MaGop: asString(row.MaGop || state.header.MaGop),
                    Line: getLineValue(row),
                    SawDep: asString(row.SawDep || row.DepName || row.LineName),
                    UserName: currentUser(),
                    CreaDate: new Date().toISOString(),
                    Mac: "",
                    IPAdress: "",
                    MachineName: "",
                    GhiChu: ghiChu,
                    MaDVSX: maDVSX
                });
            });
        });

        return list;
    }

    function buildProcessPayload() {
        const cdRow = getProcessRow();
        return [{
            ID: numberValue(cdRow.ID),
            MaDH: state.header.MaGop || "",
            MaHang: state.header.MaHang || "",
            MaLenhSX: state.header.MaLenhSanXuat || "",
            MaDVSXCat: cdRow.MaDVSXCat || null,
            MaDVSXMay: cdRow.MaDVSXMay || null,
            MaDVSXHoanThanh: cdRow.MaDVSXHoanThanh || null,
            NguoiTao: cdRow.NguoiTao || currentUser(),
            NguoiSua: currentUser(),
            MaDVSXDongThung: cdRow.MaDVSXDongThung || null
        }];
    }

    function ensureWipCrossState() {
        window.WIP = window.WIP || {};
        window.WIP.cross = window.WIP.cross || {
            pending: null,
            set: function (p) { this.pending = p || null; },
            clear: function () { this.pending = null; }
        };
        return window.WIP.cross;
    }

    function getSplitLineValue(row) {
        const raw = row && (row.LineX || row.Line || row.Chuyen || row.MaChuyen) ||
            state.rowData && (state.rowData.LineX || state.rowData.Line || state.rowData.Chuyen || state.rowData.MaChuyen) ||
            null;
        const n = Number(raw);
        return Number.isFinite(n) && n > 0 ? n : null;
    }

    function getUnassignedPoolRows(preferSelected) {
        const grid = window.WIP && typeof window.WIP.getGridUnassigned === "function"
            ? window.WIP.getGridUnassigned()
            : null;
        if (!grid) return [];

        if (preferSelected !== false) {
            try {
                const selected = grid.getSelectedRowsData ? grid.getSelectedRowsData() : [];
                if (Array.isArray(selected) && selected.length) return selected;
            } catch { }
        }

        try {
            const ds = grid.getDataSource && grid.getDataSource();
            const items = ds && ds.items ? ds.items() : [];
            if (Array.isArray(items)) return items;
        } catch { }

        const optionDs = grid.option ? grid.option("dataSource") : [];
        return Array.isArray(optionDs) ? optionDs : [];
    }

    function getSplitPoolRows(baseRow) {
        const maDHList = splitMaDHJoined(state.header.MaDH || baseRow.MaDH);
        const maDHSet = new Set(maDHList);
        const maKH = asString(baseRow.MaKH);
        const styleId = asString(baseRow.StyleId || baseRow.MaHang || state.header.MaHang);
        const maHang = asString(baseRow.MaHang || state.header.MaHang || styleId);

        return getUnassignedPoolRows(false).filter(function (row) {
            const rowMaDH = asString(row.MaDH);
            const rowMaKH = asString(row.MaKH);
            const rowStyle = asString(row.StyleId || row.MaHang);
            const rowMaHang = asString(row.MaHang || row.StyleId);
            const rowWipId = Number(row.WIPId ?? row.id);

            if (!Number.isFinite(rowWipId) || rowWipId <= 0) return false;
            if (maDHSet.size && !maDHSet.has(rowMaDH)) return false;
            if (maKH && rowMaKH && rowMaKH !== maKH) return false;
            return rowStyle === styleId || rowMaHang === maHang || rowStyle === maHang || rowMaHang === styleId;
        });
    }

    function buildSplitPendingCross() {
        const baseRow = $.extend(true, {}, (state.rowData || {}), ((state.rows && state.rows[0]) || {}));
        const maDHJoined = buildMaDHJoined(state.rows, baseRow, state.header.MaLenhSanXuat || baseRow.MaLenhSanXuat);
        const maDH = maDHJoined || asString(state.header.MaDH || baseRow.MaDH);
        const styleId = asString(baseRow.StyleId || baseRow.MaHang || state.header.MaHang);
        const maHangDisplay = asString(baseRow.MaHang || state.header.MaHang || styleId);
        const maKH = asString(baseRow.MaKH);
        const ghiChu = asString(safeInstance("#sxEdit_GhiChu", "dxTextBox")?.option("value") || state.header.GhiChu);
        const lineX = getSplitLineValue(baseRow);

        if (!maDH || !maKH || !styleId) {
            notify("Thiếu MaDH/MaKH/MaHang để mở Chia sản xuất.", "warning", 2600);
            return null;
        }

        const rowsMoved = getSplitPoolRows(baseRow);
        if (!rowsMoved.length) {
            notify("Không tìm thấy dòng Pool của đơn này để gán sau khi chia. Vui lòng tải lại Pool hoặc giảm số lượng trước khi chia.", "warning", 3200);
            return null;
        }

        const firstMovedRow = rowsMoved[0] || {};
        const item = $.extend(true, {}, baseRow, firstMovedRow);
        item.MaDH = asString(firstMovedRow.MaDH || item.MaDH || maDH);
        item.MaKH = asString(item.MaKH || maKH);
        item.StyleId = asString(item.StyleId || styleId);
        item.MaHang = asString(item.MaHang || maHangDisplay || item.StyleId);

        const movedMaDHJoined = rowsMoved
            .map(function (row) { return asString(row.MaDH); })
            .filter(Boolean)
            .filter(function (value, index, arr) { return arr.indexOf(value) === index; })
            .join(";");

        const wipIds = rowsMoved
            .map(function (row) { return Number(row.WIPId ?? row.id); })
            .filter(function (id) { return Number.isFinite(id) && id > 0; });

        return {
            item: item,
            items: rowsMoved,
            maDH: movedMaDHJoined || maDH,
            lineX: lineX,
            wipIds: wipIds,
            rowsMoved: rowsMoved,
            ghiChu: ghiChu
        };
    }

    function openSplitAfterSaved() {
        if (!state.canSplit || state.isDirty) {
            notify("Vui lòng lưu chỉnh sửa trước khi chia sản xuất.", "warning", 2200);
            return;
        }
        if (typeof window.openProductionPopup !== "function") {
            notify("Không tìm thấy flow Chia sản xuất hiện có.", "error", 2600);
            return;
        }

        const pendingCross = buildSplitPendingCross();
        if (!pendingCross) return;

        ensureWipCrossState().set(pendingCross);

        const maDH = pendingCross.maDH || "";
        const maHang = pendingCross.item.MaHang || pendingCross.item.StyleId || "";
        const lineX = pendingCross.lineX || getLineDisplay((state.rows && state.rows[0]) || state.rowData || {});
        state.popup.hide();
        window.openProductionPopup(maDH, lineX, maHang);
    }

    async function saveEditProductionOrder() {
        const saved = await withLoading("Đang lưu lệnh sản xuất...", async function () {
            await flushEdits();
            if (!validateBeforeSave()) return false;

            const maDVSX = safeInstance("#sxEdit_DVSX", "dxSelectBox")?.option("value") || "";
            if (asString(maDVSX) !== asString(state.originalMaDVSX)) {
                const rsDvsx = await apiPostJson(API_BASE + "/PostUDDVSX", buildUpdateDvsxPayload());
                if (!isTrueResponse(rsDvsx)) {
                    notify("Lỗi lưu Đơn vị sản xuất: " + rsDvsx, "error", 3500);
                    return false;
                }
            }

            const sizePayload = buildUpdateSizePayload();
            if (sizePayload.length) {
                const rsSize = await apiPostJson(API_BASE + "/PostUpdateDVSX", sizePayload);
                if (!isTrueResponse(rsSize)) {
                    notify("Lỗi lưu số lượng size: " + rsSize, "error", 3500);
                    return false;
                }
            }

            const rsCongDoan = await apiPostJson("/api/CongDoan/PostChiTietCongDoan", buildProcessPayload());
            if (!isTrueResponse(rsCongDoan)) {
                notify("Lỗi lưu công đoạn: " + rsCongDoan, "error", 3500);
                return false;
            }

            state.originalRows = normalizeRows(state.rows);
            state.rows = cloneRows(state.originalRows);
            state.originalMap = buildOriginalMap(state.originalRows);
            state.originalMaDVSX = asString(maDVSX);
            state.header.MaDVSX = asString(maDVSX);
            state.header.GhiChu = asString(safeInstance("#sxEdit_GhiChu", "dxTextBox")?.option("value"));
            await loadAvailabilityChecks();
            renderSizeGrid();
            renderAvailabilityGrid();
            refreshGrids();
            return true;
        });

        if (!saved) return;

        try {
            if (window.WIP && typeof window.WIP.loadUnassignedData === "function") {
                await window.WIP.loadUnassignedData();
            }
            if (window.WIP && typeof window.WIP.syncDataByLine === "function") {
                const lineX = getSplitLineValue((state.rows && state.rows[0]) || state.rowData || {});
                await window.WIP.syncDataByLine(lineX);
            }
            if (window.WIP && typeof window.WIP.loadWipData === "function") {
                await window.WIP.loadWipData();
            }
            markSaved();
            notify("Đã lưu chỉnh sửa. Có thể chia sản xuất.", "success", 2200);
        } catch (err) {
            console.error("SuaLenhSX error", err);
            notify("Đã lưu nhưng tải lại WIP/Pool bị lỗi. Vui lòng tải dữ liệu lại trước khi chia.", "warning", 3500);
        }
    }

    window.WIP = window.WIP || {};
    window.WIP.SuaLenhSXPopup = {
        open: open
    };
})(window, jQuery);
