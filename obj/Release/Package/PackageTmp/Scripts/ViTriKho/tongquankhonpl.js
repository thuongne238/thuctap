var shelfData = [];
var shelfDataPL = [];
var shelfDataCO = [];
var detailData = [];
var dataDanhSachKe = []
$(function () {
    renDSKe()
    renderDSO()
    $("#home").on("click", function () {
        window.location.href = '/Home/Dashboard'
    })

    // Checkbox events
    $('#cbShowKH, #cbShowMH, #cbShowItemCode').on('change', function () {
        refreshCellContent();
    });
})
// Hàm transform data
async function transformData(data) {
    const aislesMap = {};
    for (const item of data) {
        const aisleId = item.TenDay.split(" ").slice(1).join(" ");
        const shelfId = item.TenKe.split(" ")[1];
        const levelId = item.TenTang.split(" ")[1];

        if (!aislesMap[aisleId]) {
            aislesMap[aisleId] = { id: aisleId, name: item.TenDay, description: `Khu vực ${item.TenDay}`, shelves: {} };
        }
        if (!aislesMap[aisleId].shelves[shelfId]) {
            aislesMap[aisleId].shelves[shelfId] = { id: shelfId, name: item.TenKe, textKe: item.TextKe, levels: {} };
        }
        if (!aislesMap[aisleId].shelves[shelfId].levels[levelId]) {
            aislesMap[aisleId].shelves[shelfId].levels[levelId] = { id: levelId, name: item.TenTang, textTang: item.TextTang, slots: [] };
        }

        aislesMap[aisleId].shelves[shelfId].levels[levelId].slots.push({
            id: item.TenO,
            cbm: item.CBM,
            usedCBM: parseFloat((item.CBM - item.CBMCL).toFixed(4)),
            count: item.CountO,
            cbmCL: item.CBMCL,
            nameO: item.TextO ?? "",
            tenO: item.TenO ?? "",
            items: []
        });
    }

    return {
        aisles: Object.values(aislesMap)
            .sort((a, b) => a.id.localeCompare(b.id))
            .map(aisle => ({
                ...aisle,
                shelves: Object.values(aisle.shelves)
                    .sort((a, b) => Number(a.id.replace(/\D/g, '')) - Number(b.id.replace(/\D/g, '')))
                    .map(shelf => ({
                        ...shelf,
                        levels: Object.values(shelf.levels)
                            .sort((a, b) => Number(a.id) - Number(b.id))
                    }))
            }))
    };
}

// Hàm tính capacity class
function getCapacityClass(usedCBM, totalCBM) {
    const percentage = (usedCBM / totalCBM) * 100;
    const remainingPercentage = 100 - percentage;
    if (remainingPercentage === 0) return 'capacity-empty';
    if (remainingPercentage > 80) return 'capacity-high';
    if (remainingPercentage < 50) return 'capacity-low';
    return 'capacity-medium';
}

// Hàm tính remaining capacity
function getRemainingCapacity(usedCBM, totalCBM) {
    return Math.round(((totalCBM - usedCBM) / totalCBM) * 100);
}

// Hàm generate HTML cho modal
function generateWarehouseHTML(warehouseData, value) {
    let html = '<div class="row">';
    warehouseData.aisles.forEach(aisle => {
        html += `<div class="col-12 mb-4">
                        <div class="card aisle-card" data-aisle="${aisle.id}">
                            <div class="card-header bg-primary text-white">
                                <h5 class="mb-0"><i class="bi bi-building-fill"></i> ${aisle.name}</h5>
                            </div>
                            <div class="card-body">`;

        aisle.shelves.forEach(shelf => {

            const tongCBMKe = shelf.levels.reduce((sum, lv) =>
                sum + lv.slots.reduce((s, slot) => s + slot.cbm, 0), 0);
            const tongUsedKe = shelf.levels.reduce((sum, lv) =>
                sum + lv.slots.reduce((s, slot) => s + slot.usedCBM, 0), 0);

            html += `<div class="shelf-section card mb-3">
                                    <div class="card-header bg-secondary text-white py-2">
                                 <h6 class="mb-0">
                                        <i class="bi bi-bookshelf"></i> ${shelf.name} ${shelf.textKe != "" ? `(${shelf.textKe})` : ""} - <span>(
                                     <span style='font-size:14px; color:white; font-weight:600;'> ${parseFloat(tongUsedKe).toFixed(4)}</span>
                                        / 
                                        <span style='font-size:14px; color:#ebff12; font-weight:600;'> ${parseFloat(tongCBMKe).toFixed(4)}</span>
                                        <span style='font-size:12px; opacity:0.8;'>(CBM)</span>
                                    )</span>
   
                                 </h6>
                                    </div>
                                <div class="card-body py-2">`;
            // Đảo ngược thứ tự levels để tầng 1 ở dưới cùng
            const reversedLevels = [...shelf.levels].reverse();
            reversedLevels.forEach(level => {
                html += `<div class="row align-items-center mb-2">
                                        <div class="col-auto"><div class="badge level-badge"  style="width: 90px;word-wrap: break-word;white-space: normal;">
                                    <span style="font-size:12px" class="badge level-badge d-flex"><i class="bi bi-layers"></i> ${level.name}</span>
                                    <div> ${level.textTang != "" ? `(${level.textTang})` : ""}</div>
                                    </div></div>
                    <div class="col"><div class="d-flex flex-wrap gap-1">`;

                level.slots.forEach(slot => {
                    const slotNumber = slot.id.split('.').pop();
                    const capacityClass = getCapacityClass(slot.usedCBM, slot.cbm);
                    const remainingCapacity = getRemainingCapacity(slot.usedCBM, slot.cbm);
                    const usedPercentage = Math.round(((slot.usedCBM / slot.cbm) * 100));
                    const itemCount = slot.count;
                    const cbmCL = parseFloat((parseFloat(slot.cbm.toFixed(4)) - parseFloat(slot.usedCBM.toFixed(4))).toFixed(4));
                    const isCont = slot?.tenO?.toUpperCase().includes('CONT') || false
                    const nameO = slot.nameO;
                    const tenO = isCont && nameO ? nameO : slotNumber

                    html += `<div class="position-relative">
                                     <div data-iscont="${isCont}" data-nameo="${nameO}" style="background:white !important; ${!nameO && isCont ? 'opacity:0;pointer;pointer-events:none;' : ''}" class="slot-item ${capacityClass}"
                                        data-id="${slot.id}"
                                        data-aisle="${aisle.id}"
                                        data-shelf="${shelf.id}"
                                        data-level="${level.id}"
                                        data-cbm="${slot.cbm}"
                                        data-used-cbm="${slot.usedCBM}"
                                        data-remaining="${remainingCapacity}"
                                        data-textName="${slot.nameO}"
                                        data-cbmcl="${cbmCL}"
                                        data-type="${value}"
                                        data-levelname="${level.name} ${level.textTang != "" ? `(${level.textTang})` : ""}">

                                        <div class="slot-used-section" style="height: ${usedPercentage}%"></div>
                                        <div class="slot-divider-line" style="bottom: ${usedPercentage}%"></div>

                                        <div class="slot-content">
                                           <div class="slot-number">${tenO}</div>
                                    <div class="slot-capacity text-center">${parseFloat(slot.usedCBM.toFixed(4))} / ${parseFloat(slot.cbm.toFixed(4))} CBM</div>
                                    <div class="slot-capacity text-center">${cbmCL} CBMCL</div>
                                        </div>
                                        ${itemCount > 0 ? `<div class="item-count">${itemCount}</div>` : ''}
                                    </div>
                                </div>`;
                });

                html += `</div></div></div>`;
            });

            html += `</div></div>`;
        });

        html += `</div></div></div>`;
    });
    html += '</div>';
    return html;
}

// Hàm show tooltip
function showTooltip(e, $slot) {
    const $tooltip = $("#tooltip");
    if (!$tooltip.length) return;

    const slotId = $slot.data("id");
    const cbm = parseFloat($slot.data("cbm"));
    const usedCBM = parseFloat($slot.data("used-cbm"));
    const cbmCL = $slot.data("cbmcl");
    const remaining = cbm - usedCBM;
    const remainingPercentage = $slot.data("remaining");
    const nameO = $slot.data("textname");

    const aisleName = $slot.closest(".aisle-card").find(".card-header h5").text() || "N/A";
    const shelfName = $slot.closest(".shelf-section").find(".card-header h6").text() || "N/A";
    const levelName = $slot.data("levelname");

    let capacityStatus = "";
    if ($slot.hasClass("capacity-empty")) capacityStatus = "Đã đầy (0%)";
    else if ($slot.hasClass("capacity-high")) capacityStatus = `Còn nhiều chỗ (${remainingPercentage}%)`;
    else if ($slot.hasClass("capacity-medium")) capacityStatus = `Còn vừa phải (${remainingPercentage}%)`;
    else if ($slot.hasClass("capacity-low")) capacityStatus = `Sắp đầy (${remainingPercentage}%)`;

    $tooltip.html(`
                        <div><strong><i class="bi bi-geo-alt"></i> ${slotId}</strong></div>
                            <div><i class="bi bi-stack"></i> ${nameO}</div>
                            <div><i class="bi bi-building"></i> ${aisleName}</div>
                            <div><i class="bi bi-bookshelf"></i> ${shelfName}</div>
                            <div><i class="bi bi-layers"></i> ${levelName}</div>
                            <div><i class="bi bi-box"></i> CBM: ${parseFloat(usedCBM.toFixed(4))}/${parseFloat(cbm).toFixed(4)} (Còn: ${cbmCL})</div>
                            <div><i class="bi bi-speedometer2"></i> ${capacityStatus}</div>
                        `).css({ left: e.clientX + 15, top: e.clientY - 10, opacity: 1 });
}

function hideTooltip() {
    $("#tooltip").css("opacity", 0);
}
// Xử lý click vào kệ
async function handleShelfClick(keID, tenKe, value) {
    console.log(keID, tenKe)
    const filteredData = detailData.filter(item => item.KeID === keID);

    if (filteredData.length === 0) {
        $('#shelfModalBody').html('<div class="alert alert-warning">Không có dữ liệu cho kệ này</div>');
        $('#shelfModalLabel').text(`Chi Tiết ${tenKe}`);
        const modal = new bootstrap.Modal($('#shelfModal'));
        modal.show();
        return;
    }

    const warehouseData = await transformData(filteredData);
    const html = generateWarehouseHTML(warehouseData, value);

    $('#shelfModalBody').html(html);
    $('#shelfModalLabel').text(`Chi Tiết ${tenKe}`);

    const modal = new bootstrap.Modal($('#shelfModal'));
    modal.show();

    setTimeout(() => {
        $(document).on('mouseenter', '.slot-item', function (e) {
            const nameO = $(this).data('nameo')
            if (!nameO) return;
            showTooltip(e, $(this));
        });

        $(document).on('mousemove', '.slot-item', function (e) {
            $("#tooltip").css({ left: e.clientX + 15, top: e.clientY - 10 });
        });

        $(document).on('mouseleave', '.slot-item', function () {
            hideTooltip();
        });
    }, 300);
}

async function fetchSlotItems(slotId, type) {
    try {
        const response = await fetch(`/api/ViTriKhoNPL/Get?action=DetailO&para1=${slotId}&para2=${type}`);
        if (!response.ok) throw new Error(`Response status: ${response.status} `);
        const data = await response.json();

        return data.Table
    } catch (error) {
        console.error(error.message);
        return [];
    }
}

// Check1
async function showSlotDetail(slotId, type) {
    //const modal = new bootstrap.Modal($('#itemDetailModal')[0]);
    $('#itemDetailModal').modal("show");
    let datahtml = await fetchSlotItems(slotId, type);
    const tongSoKien = datahtml.length;

    $('#modalSlotTitle').html(`
        <i class="bi bi-box"></i> Chi tiết ô kho ${slotId}
    `);

    $('#modalSlotInfo').html(`
        <div class="fs-5 fw-bold text-primary">${slotId} / 0 Vật Tư</div>
    `);

    if (datahtml?.length > 0 && datahtml[0].DisplayGroup != null) {
        if (datahtml[0].Status == 2)
            $(".item-trahang").show()
        else $(".item-trahang").hide()
        $('#modalSlotInfo').html(`
        <div class="fs-5 fw-bold text-primary">${slotId} / ${datahtml?.length} Vật Tư</div>
    `);
    }

    const capacityClass = getCapacityClass(datahtml[0].CBMSD, datahtml[0].CBMO);
    let capacityColor = 'success';
    if (capacityClass === 'capacity-empty') capacityColor = 'danger';
    else if (capacityClass === 'capacity-low') capacityColor = 'warning';
    else if (capacityClass === 'capacity-medium') capacityColor = 'info';
    succhuaOCL = parseFloat(datahtml[0].CBMO) - parseFloat(datahtml[0].CBMSD);
    $('#modalCapacityInfo').html(`
        <div class="fs-5 fw-bold text-${capacityColor}">${datahtml[0].CBMSD}/${parseFloat(parseFloat(datahtml[0].CBMO).toFixed(4))} CBM</div>
    `);

    let itemsHtml = "";
    if (datahtml && datahtml.length > 0 && datahtml[0].DisplayGroup != null) {

        // Group data theo MaVT
        const groupedData = {};
        datahtml.forEach(item => {
            const maVT = item.DisplayGroup;
            if (!groupedData[maVT]) {
                groupedData[maVT] = {
                    soLo: item.SoLo,
                    poMua: item.POMua,
                    totalCBM: 0,
                    totalSoKien: 0,
                    items: []
                };
            }
            groupedData[maVT].items.push(item);
            groupedData[maVT].totalCBM += parseFloat(item.CBM) || 0;
            groupedData[maVT].totalSoKien += 1 || 0;
        });

        itemsHtml = Object.entries(groupedData).map(([maVT, group], groupIndex) => {
            const groupId = `group-${groupIndex}`;
            const itemsRows = group.items.map((item, itemIndex) => `
                <tr data-barcode="${item.BarCode}">
                    <td class="text-center">${item.SoKien}</td>
                    <td class="text-center">${item.SoLoT}</td>
                    <td class="text-center">${item.Batch}</td>
                    <td class="text-center">${item.SoLuongThucTe}</td>
                    <td class="text-center">${item.CBM}</td>
                </tr>
            `).join('');

            return `
            <div class="collapsible-group collapsible-itemcode mb-3"
                 data-mavt="${maVT}"
                 data-solo="${group.soLo}"
                 data-pomua="${group.poMua}">
                <div class="group-header d-flex justify-content-between align-items-center"
                     style="background:linear-gradient(45deg,#3B82F6, #9c71ffcc); padding: 12px; border-radius: 0px; cursor: pointer;"
                     data-bs-toggle="collapse"
                     data-bs-target="#${groupId}"
                     role="button"
                     aria-expanded="true">
                    <div>
                        <h6 class="mb-1" style="font-size: 14px; color: white;">Mã VT: ${maVT} - Số Lô: ${group.soLo} - PO mua: ${group.poMua}</h6>
                        <small style="color: #fff500; font-weight: bold">CBM: ${group.totalCBM.toFixed(4)} CBM</small>
                        -
                        <small style="color: white;">Tổng vật tư: ${group.totalSoKien}</small>
                    </div>
                    <span class="toggle-icon" style="color: white;">▼</span>
                </div>

                <div class="collapse show" id="${groupId}">
                    <div class="table-responsive mt-2 px-1">
                        <table class="table table-bordered table-hover table-sm">
                            <thead class="table-light">
                                <tr>
                                    <td class="text-center">Vật tư</td>
                                    <td class="text-center">Số LOT</td>
                                    <td class="text-center">Batch</td>
                                    <td class="text-center">Số lượng</td>
                                    <td class="text-center" style="width: 100px;">CBM</td>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>`;
        }).join('');

    } else {
        itemsHtml = `
            <div class="text-center text-muted py-4">
                <i class="bi bi-inbox fs-1"></i>
                <div class="mt-2">Ô kho trống</div>
            </div>`;
    }

    setupSearchFunctionality();

    $('#modalItemList').html(itemsHtml);
}

// Events
$(document).on("click", ".slot-item", function () {
    console.log(1)
    $(".slot-item").removeClass("highlighted");
    $(this).addClass("highlighted");

    const slotId = $(this).data("id");
    const typeID = $(this).data("type");
    console.log(typeID)
    showSlotDetail(slotId, typeID);

    setTimeout(() => {
        $(this).removeClass("highlighted");
    }, 5000);
})

function LoadArea() {
    const aisleMap = {};
    walkwayDivMap = {};

    walkwayDivMap[1] = $('#materialArea').siblings('[data-walkwayid="1"]');
    walkwayDivMap[2] = $('#materialArea').siblings('[data-walkwayid="2"]');

    shelfData.forEach(shelf => {
        if (!aisleMap[shelf.DayID]) {
            aisleMap[shelf.DayID] = { name: shelf.TenDay, shelves: [] };
        }
        aisleMap[shelf.DayID].shelves.push(shelf);
    });

    const sortedAisles = Object.keys(aisleMap).sort((a, b) => {
        const nameA = aisleMap[a].name || '';
        const nameB = aisleMap[b].name || '';
        return nameA.localeCompare(nameB, 'vi', { numeric: true });
    });

    const materialArea = $('#materialArea');
    materialArea.empty();

    sortedAisles.forEach((aisleId, index) => {
        const aisleData = aisleMap[aisleId];
        const shelves = aisleData.shelves;

        shelves.sort((a, b) => {
            const nameA = a.TenKe || '';
            const nameB = b.TenKe || '';
            return nameA.localeCompare(nameB, 'vi', { numeric: true });
        });

        const isNAisle = shelves.every(s => (s.TenDay || '').toLowerCase().includes('n'));

        if (index > 0) {
            const walkwayId = index + 2;
            if (!walkwayDivMap[walkwayId]) {
                const walkwayDiv = $(`<div data-walkwayid="${walkwayId}" data-module="1" class="walkway dropzone"></div>`);
                walkwayDivMap[walkwayId] = walkwayDiv;
            }
            const $wv = walkwayDivMap[walkwayId];

            if (!$wv.hasClass('walkway-horizontal')
                && !$.contains(document, $wv[0])
                && !isNAisle) {
                materialArea.append($wv);
            }
        }

        const aisleDiv = $('<div class="aisle"></div>');
        const shelfPair = $('<div class="shelf-pair"></div>');
        const maxCells = Math.max(...shelves.map(s => s.MaxO || 0));

        shelves.forEach(shelf => {
            const tenDayIncludeN = shelf.TenDay.toLowerCase().includes('n');
            const shelfDiv = $('<div class="shelf"></div>');

            if (tenDayIncludeN) shelfDiv.attr("draggable", true);
            shelfDiv.attr('id', shelf.ID);
            shelfDiv.attr('data-module', 1);
            shelfDiv.attr('data-keid', shelf.KeID);
            shelfDiv.attr('data-tenke', shelf.TenKe);

            shelfDiv.css({
                'width': '100px',
                'min-height': (maxCells * 50) + 20 + 'px',
                'display': 'flex',
                'flex-direction': 'column-reverse'
            });

            shelfDiv.append(`<div class="shelf-label">${shelf.TenKe}</div>`);

            for (let i = 0; i < (shelf.MaxO || 0); i++) {
                const cell = $('<div class="cell"></div>');
                cell.css({
                    'background': tenDayIncludeN
                        ? 'linear-gradient(135deg, #f1f5f9 0%, rgb(194 213 214) 100%)'
                        : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
                });
                if (shelf.KhachHang && shelf.KhachHang.trim() !== '') {
                    const customers = shelf.KhachHang.split(',').map(kh => kh.trim());
                    const customerList = customers.map(kh => `<li>${kh}</li>`).join('');
                    cell.append(`<div class="tooltip-custom"><strong>${shelf.TenKe}</strong><ul>${customerList}</ul></div>`);
                }
                shelfDiv.append(cell);
            }

            for (let i = (shelf.MaxO || 0); i < maxCells; i++) {
                shelfDiv.append('<div style="height: 30px;"></div>');
            }

            shelfDiv.on('click', function () {
                handleShelfClick($(this).data('keid'), $(this).data('tenke'), 1);
            });

            const walkwayID = parseInt(shelf.WalkwayID);
            shelfDiv.attr('data-current-walkwayid', !isNaN(walkwayID) && walkwayID > 0 ? walkwayID : '');

            if (tenDayIncludeN) {
                const hasWalkwayID = !isNaN(walkwayID) && walkwayID > 0;

                if (hasWalkwayID && walkwayDivMap[walkwayID]) {
                    const $wv = walkwayDivMap[walkwayID];
                    if ($wv.hasClass('walkway-horizontal')) {
                        convertShelfToNDay(shelfDiv, shelf);
                    }
                    $wv.append(shelfDiv);
                } else {
                    let placed = false;
                    const $allWalkways = $('[data-module="1"][data-walkwayid]').sort((a, b) =>
                        parseInt($(a).data('walkwayid')) - parseInt($(b).data('walkwayid'))
                    );

                    $allWalkways.each(function () {
                        const $wv = $(this);
                        if ($wv.find('.shelf').length === 0) {
                            if ($wv.hasClass('walkway-horizontal')) {
                                convertShelfToNDay(shelfDiv, shelf);
                            }
                            $wv.append(shelfDiv);
                            const wid = $wv.data('walkwayid');
                            shelfDiv.attr('data-current-walkwayid', wid);
                            shelfOnDrag(shelf.KeID, wid, 1);
                            placed = true;
                            return false;
                        }
                    });

                    if (!placed) shelfPair.append(shelfDiv);
                }
            } else {
                if (!isNaN(walkwayID) && walkwayID > 0 && walkwayDivMap[walkwayID]) {
                    walkwayDivMap[walkwayID].append(shelfDiv);
                } else {
                    shelfPair.append(shelfDiv);
                }
            }
        });

        aisleDiv.append(shelfPair);
        if (!isNAisle) {
            materialArea.append(aisleDiv);
        }

    });

    setTimeout(() => {
        const totalWidth = materialArea[0].scrollWidth;
        totalWidthWalkwayHorizontal = totalWidth;

        $('.walkway-horizontal[data-module="1"]').css({
            'width': totalWidthWalkwayHorizontal + 'px',
            'min-width': 'unset',
            'max-width': 'unset'
        });
    }, 100);

    initDragDrop();
}

function LoadAreaPL() {
    const aisleMap = {};
    walkwayDivMapPL = {};

    walkwayDivMapPL[1] = $('.container-shelve-right [data-walkwayid="1"]');

    shelfDataPL.forEach(shelf => {
        if (!aisleMap[shelf.DayID]) {
            aisleMap[shelf.DayID] = { name: shelf.TenDay, shelves: [] };
        }
        aisleMap[shelf.DayID].shelves.push(shelf);
    });

    const sortedAisles = Object.keys(aisleMap).sort((a, b) => {
        const nameA = aisleMap[a].name || '';
        const nameB = aisleMap[b].name || '';
        return nameA.localeCompare(nameB, 'vi', { numeric: true });
    });

    const materialArea = $('#container-khuvucphulieu');
    materialArea.empty();

    sortedAisles.forEach((aisleId, index) => {
        const aisleData = aisleMap[aisleId];
        const shelves = aisleData.shelves;

        shelves.sort((a, b) => {
            const nameA = a.TenKe || '';
            const nameB = b.TenKe || '';
            return nameA.localeCompare(nameB, 'vi', { numeric: true });
        });

        const isNAisle = shelves.every(s => (s.TenDay || '').toLowerCase().includes('n'));

        if (index > 0) {
            const walkwayId = index + 1;
            if (!walkwayDivMapPL[walkwayId]) {
                const walkwayDiv = $(`<div data-walkwayid="${walkwayId}" data-module="2" class="walkway dropzone"></div>`);
                walkwayDivMapPL[walkwayId] = walkwayDiv;
            }
            const $wv = walkwayDivMapPL[walkwayId];

            if (!$wv.hasClass('walkway-horizontal')
                && !$.contains(document, $wv[0])
                && !isNAisle) {
                materialArea.append($wv);
            }
        }

        const aisleDiv = $('<div class="aisle"></div>');
        const shelfPair = $('<div class="shelf-pair"></div>');
        const maxCells = Math.max(...shelves.map(s => s.MaxO || 0));

        shelves.forEach(shelf => {
            const tenDayIncludeN = shelf.TenDay.toLowerCase().includes('n');
            const shelfDiv = $('<div class="shelf"></div>');

            if (tenDayIncludeN) shelfDiv.attr("draggable", true);
            shelfDiv.attr('type', 2);
            shelfDiv.attr('id', shelf.ID);
            shelfDiv.attr('data-module', 2);
            shelfDiv.attr('data-keid', shelf.KeID);
            shelfDiv.attr('data-tenke', shelf.TenKe);

            // CSS mặc định dạng dọc — giống LoadArea
            shelfDiv.css({
                'width': '100px',
                'min-height': (maxCells * 50) + 20 + 'px',
                'display': 'flex',
                'flex-direction': 'column-reverse'
            });

            shelfDiv.append(`<div class="shelf-label">${shelf.TenKe}</div>`);

            for (let i = 0; i < (shelf.MaxO || 0); i++) {
                const cell = $('<div class="cell"></div>');
                cell.css({
                    'background': tenDayIncludeN
                        ? 'linear-gradient(135deg, #f1f5f9 0%, rgb(194 213 214) 100%)'
                        : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
                });
                if (shelf.KhachHang && shelf.KhachHang.trim() !== '') {
                    const customers = shelf.KhachHang.split(',').map(kh => kh.trim());
                    const customerList = customers.map(kh => `<li>${kh}</li>`).join('');
                    cell.append(`<div class="tooltip-custom"><strong>${shelf.TenKe}</strong><ul>${customerList}</ul></div>`);
                }
                shelfDiv.append(cell);
            }

            for (let i = (shelf.MaxO || 0); i < maxCells; i++) {
                shelfDiv.append('<div style="height: 30px;"></div>');
            }

            shelfDiv.on('click', function () {
                handleShelfClick($(this).data('keid'), $(this).data('tenke'), 2);
            });

            const walkwayID = parseInt(shelf.WalkwayID);
            shelfDiv.attr('data-current-walkwayid', !isNaN(walkwayID) && walkwayID > 0 ? walkwayID : '');

            if (tenDayIncludeN) {
                const hasWalkwayID = !isNaN(walkwayID) && walkwayID > 0;

                if (hasWalkwayID && walkwayDivMapPL[walkwayID]) {
                    const $wv = walkwayDivMapPL[walkwayID];
                    if ($wv.hasClass('walkway-horizontal')) {
                        convertShelfToNDay(shelfDiv, shelf);
                    }
                    $wv.append(shelfDiv);
                } else {
                    let placed = false;
                    const $allWalkways = $('[data-module="2"][data-walkwayid]').sort((a, b) =>
                        parseInt($(a).data('walkwayid')) - parseInt($(b).data('walkwayid'))
                    );

                    $allWalkways.each(function () {
                        const $wv = $(this);
                        if ($wv.find('.shelf').length === 0) {
                            if ($wv.hasClass('walkway-horizontal')) {
                                convertShelfToNDay(shelfDiv, shelf);
                            }
                            $wv.append(shelfDiv);
                            const wid = $wv.data('walkwayid');
                            shelfDiv.attr('data-current-walkwayid', wid);
                            shelfOnDrag(shelf.KeID, wid, 2);
                            placed = true;
                            return false;
                        }
                    });

                    if (!placed) shelfPair.append(shelfDiv);
                }
            } else {
                if (!isNaN(walkwayID) && walkwayID > 0 && walkwayDivMapPL[walkwayID]) {
                    walkwayDivMapPL[walkwayID].append(shelfDiv);
                } else {
                    shelfPair.append(shelfDiv);
                }
            }
        });

        aisleDiv.append(shelfPair);
        if (!isNAisle) {
            materialArea.append(aisleDiv);
        }
    });

    setTimeout(() => {
        const totalWidth = materialArea[0].scrollWidth;
        totalWidthWalkwayHorizontalPL = totalWidth;

        $('.walkway-horizontal[data-module="2"]').css({
            'width': totalWidthWalkwayHorizontalPL + 'px',
            'min-width': 'unset',
            'max-width': 'unset'
        });
    }, 100);

    materialArea.append('<div class="walkway" data-module="2"></div>');
    materialArea.append(`
        <div id="container-khuvucthanhpham" style="margin-top: 2px;">
            <div class="other-section">
                <div class="other-shelf" style="flex: 1; min-width: 60px;">
                    <div class="other-shelf-title">HÀNG THÀNH PHẨM</div>
                </div>
                <div class="other-shelf" style="min-width: 80px;">
                    <div class="other-shelf-title">HOÀN THÀNH</div>
                </div>
            </div>
        </div>
    `);

    initDragDrop();
}

function convertShelfToNDay($shelfDiv, shelf) {

    const wWidth = shelf.Module == 1 ? totalWidthWalkwayHorizontal : totalWidthWalkwayHorizontalPL;

    const maxO = shelf.MaxO || 0;

    // Xóa nội dung cũ (shelf-label + cells thường)
    $shelfDiv.empty();

    // CSS ngang
    $shelfDiv.css({
        'overflow': "hidden",
        'display': 'flex',
        'flex-direction': 'row',
        'width': maxO === 1 ? `${wWidth / 2}px` : (maxO * 73 + 55 + 2) + 'px',
        'min-height': `${CELL_HEIGHT}px`,
        'max-height': `${CELL_HEIGHT}px`,
        'border': '1px solid #000'
    });

    // Label N
    const $labelN = $('<div class="cell"></div>').css({
        'display': 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
        'justify-content': 'center',
        'gap': '4px',
        'padding': '4px 2px',
        'min-width': '55px',
        'max-width': '55px',
        'width': '55px',
        'background': 'linear-gradient(135deg, rgb(241, 245, 249) 0%, rgb(194, 213, 214) 100%)',
        'border-right': '1px solid black',
        'flex-shrink': '0',
        'pointer-events': 'none',
        'box-sizing': 'border-box',
        'position': 'relative',
    }).html(`
        <span style="font-size:10px; font-weight:bold; text-align:center; line-height:1.2; word-break:break-all">
            ${shelf.TenKe}
        </span>
        <span style="left:0px; top:2px; position:absolute; font-size:10px; font-weight:bold; text-align:center; color:black; padding:1px 3px; border-bottom:1px solid #674e4e; width:54px; box-sizing:border-box;">
            ${shelf.Module == 1 ? 'N.Liệu' : 'P.Liệu'}
        </span>
        <i class="fa fa-eye" style="position:absolute; top:0px; right:2px; z-index:999; pointer-events:auto; cursor:pointer; font-size:7px; color:#158ef4; padding:0 0 10px 10px;"></i>
    `);

    $labelN.find('.fa-eye').on('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        const shelfKe = dataDanhSachKe.find(x => x.KeID == shelf.KeID);
        openShelfHorizontalModal(shelfKe);
    });
    $labelN[0].style.setProperty('height', `${CELL_HEIGHT}px`, 'important');


    // Cells row ngang
    const totalCellWidth = maxO === 1 ? 551 : maxO * 73;
    const $cellsRow = $('<div></div>').css({
        'display': 'flex',
        'flex-direction': 'row',
        'flex-shrink': '0',
        'pointer-events': 'none',
        'width': totalCellWidth + 'px'
    });

    for (let i = 0; i < maxO; i++) {
        const $cell = $('<div class="cell"></div>').css({
            'flex': '1',
            'min-width': maxO === 1 ? `${wWidth / 2}px` : '73px',
            'border-left': i === 0 ? 'none' : '1px solid rgba(220,214,214,0.42)',
            'background': 'linear-gradient(135deg, #f1f5f9 0%, rgb(194 213 214) 100%)',
            'height': `${CELL_HEIGHT}px`,
            'box-sizing': 'border-box',
            'pointer-events': 'none'
        });
        $cellsRow.append($cell);
        $cell[0].style.setProperty('height', `${CELL_HEIGHT}px`, 'important');

    }

    $shelfDiv.append($labelN).append($cellsRow);
}

function convertShelfToNormal($walkway, $shelfDiv, shelf) {
    $shelfDiv.empty();

    const height = shelf.MaxO == 1
        ? `${totalHeightA}px !important`
        : `${(shelf.MaxO * 50) + 20}px !important`;

    $walkway.css({
        'width': 'auto',
        'min-width': '100px',
        'display': 'flex',
        'flex-wrap': 'wrap',
        'align-items': 'flex-start',
        'height': `${totalHeightA}px`,
        'gap': '0px',
        'padding': '0px 4px'
    });
    $shelfDiv.css({
        'margin-top': '0',
        'display': 'flex',
        'flex-direction': 'column',
        'width': '100px',
        'min-height': height,
        'max-height': '',
        'min-width': '',
        'max-width': '',
        'border': ''
    });

    $shelfDiv.append(`<div class="shelf-label">${shelf.TenKe}</div>`);

    for (let i = 0; i < (shelf.MaxO || 0); i++) {


        const $cell = $('<div class="cell"></div>').css({
            'background': 'linear-gradient(135deg, #f1f5f9 0%, rgb(194 213 214) 100%)'
        });

        $cell[0].style.setProperty(
            'height',
            shelf.MaxO == 1 ? `${totalHeightA}px` : `${(shelf.MaxO * 50) + 20}px`,
            'important'
        );

        if (shelf.KhachHang && shelf.KhachHang.trim() !== '') {
            const customers = shelf.KhachHang.split(',').map(kh => kh.trim());
            const customerList = customers.map(kh => `<li>${kh}</li>`).join('');
            $cell.append(`<div class="tooltip-custom"><strong>${shelf.TenKe}</strong><ul>${customerList}</ul></div>`);
        }
        $shelfDiv.append($cell);
    }

    for (let i = (shelf.MaxO || 0); i < shelf.MaxO; i++) {
        $shelfDiv.append('<div style="height: 30px;"></div>');
    }
}

async function renDSKe() {
    const url = `/api/ViTriKhoNPL/Get?action=GetDanhSachKe`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();
        dataDanhSachKe = data.Table

        shelfData = dataDanhSachKe.filter(x => x.Module == 1 && !String(x.TenDay).toLowerCase().includes('co'))
        shelfDataPL = dataDanhSachKe.filter(x => x.Module == 2 && !String(x.TenDay).toLowerCase().includes('co'))
        shelfDataCO = dataDanhSachKe.filter(item => String(item.TenDay).toLowerCase().includes('co'));

        LoadArea()
        LoadAreaPL()
        LoadAreaContainer()
        handleSearch()

        setTimeout(() => {
            initWalkwayStyles();
        }, 150);
        //LoadOtherArea();

    } catch (error) {
        console.error(error.message);
    }

}

async function renderDSO() {
    const url = `/api/ViTriKhoNPL/Get?action=GetViTriKho`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();

        detailData = await data.Table;

    } catch (error) {
        console.error(error.message);
    }

}

/// Kiệt
// ==================== CONSTANTS ====================
const DEBOUNCE_DELAY = 600;
const MESSAGE_DURATION = 3000;

const COLORS = {
    SUCCESS: '#22c55e',
    ERROR: '#ef4444',
    INFO: '#3b82f6'
};

const ICONS = {
    SUCCESS: 'fa-circle-check',
    ERROR: 'fa-circle-xmark',
    INFO: 'fa-circle-info'
};

const GRADIENTS = {
    COLOR_NORMAL: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    CODAY_NL: 'linear-gradient(135deg, rgb(255, 248, 225) 0%, rgb(255, 236, 179) 100%)',
    CODAY_PL: 'linear-gradient(135deg, rgb(243, 229, 245) 0%, rgb(225, 190, 231) 100%)',
    HIGHLIGHT: 'linear-gradient(135deg, rgb(254, 202, 202) 0%, rgb(255 165 165 / 77%) 100%)',
    COLOR_NDAY: 'linear-gradient(135deg, rgb(241, 245, 249) 0%, rgb(194, 213, 214) 100%)',

};

// ==================== UTILITY FUNCTIONS ====================
function extractShelfNumber(tenKe) {
    const numbers = (tenKe || '').match(/\d+/g);
    return numbers ? parseInt(numbers[0]) : 0;
}

function isPhuLieu(shelfNumber) {
    return shelfNumber >= 1 && shelfNumber <= 5;
}

function getBackground(shelfNumber) {
    return isPhuLieu(shelfNumber) ? GRADIENTS.PHU_LIEU : GRADIENTS.THANH_PHAM;
}

// ==================== UI FUNCTIONS ====================
function showMessage(message, type = 'ERROR') {
    const $notifi = $('#notifi-notfound');
    const color = COLORS[type];
    const icon = ICONS[type];

    $notifi.html(`
        <i class="fa-solid ${icon}" style="color: ${color};"></i>
        <span style="color: ${color}; margin-left: 5px;">${message}</span>
    `).fadeIn(300);

    setTimeout(() => {
        $notifi.fadeOut(300, () => $notifi.html(''));
    }, MESSAGE_DURATION);
}

function resetHighlight() {
    $('#materialArea').find('.shelf').each(function () {
        const tenDayIncludeN = (dataDanhSachKe.find(x => x.KeID == $(this).data('keid') && x.Module == 1)?.TenDay || '').toLowerCase().includes('n');

        $(this).find('.cell').css({
            background: tenDayIncludeN
                ? GRADIENTS.COLOR_NDAY
                : GRADIENTS.COLOR_NORMAL,
            boxShadow: '',
            border: '1px solid #dcd6d66b'
        });
    });

    $('#container-khuvucphulieu').find('.shelf').each(function () {
        const tenDayIncludeN = (dataDanhSachKe.find(x => x.KeID == $(this).data('keid') && x.Module == 2)?.TenDay || '').toLowerCase().includes('n');
        $(this).find('.cell').css({
            background: tenDayIncludeN
                ? GRADIENTS.COLOR_NDAY
                : GRADIENTS.COLOR_NORMAL,
            boxShadow: '',
            border: '1px solid #dcd6d66b'
        });
    });

    $('#container-khuvuccontainer [data-module="3"]').each(function () {
        const moduleThucTe = $(this).data('modulethucte')
        $(this).find('.cell').css({
            background: moduleThucTe == 1 ? GRADIENTS.CODAY_NL : GRADIENTS.CODAY_PL
        });
    });
}

function highlightCells(keIds) {
    resetHighlight();
    if (!keIds.length) return;

    requestAnimationFrame(() => {
        const highlightStyle = {
            background: GRADIENTS.HIGHLIGHT,
        };

        keIds.forEach(keId => {
            $(`[data-keid="${keId}"]`).find('.cell').css(highlightStyle);
        });
    });
}

// ==================== SEARCH FUNCTION ====================
async function handleSearch() {
    let debounceTimer = null;
    try {
        const data = dataDanhSachKe
        const keMap = new Map();
        data.forEach(item => {
            const khachHang = item.KhachHang?.trim().toLowerCase();
            const maVT = item.MaVT?.trim().toLowerCase();

            if (khachHang) {
                if (!keMap.has(khachHang)) {
                    keMap.set(khachHang, []);
                }
                keMap.get(khachHang).push(item.KeID);
            }
            if (maVT) {
                if (!keMap.has(maVT)) {
                    keMap.set(maVT, []);
                }
                keMap.get(maVT).push(item.KeID);
            }

        });

        // Setup search event
        $('#txtSearchKhachHang').on('input', function () {
            const keyword = $(this).val().trim().toLowerCase();
            clearTimeout(debounceTimer);

            if (!keyword) {
                const isChecked = $("#cbShowColor").prop("checked")
                resetHighlight();
                showHieuSuatKe(isChecked)
                $('#notifi-notfound').fadeOut(300, function () {
                    $(this).html('');
                });
                return;
            }
            debounceTimer = setTimeout(() => {
                const matchedKeys = Array.from(keMap.keys())
                    .filter(k => k.includes(keyword));

                if (matchedKeys.length > 0) {
                    const keIds = matchedKeys.flatMap(k => keMap.get(k));
                    highlightCells(keIds);
                } else {
                    const isChecked = $("#cbShowColor").prop("checked")
                    resetHighlight();
                    showHieuSuatKe(isChecked)
                    showMessage('Không tìm thấy thông tin này trong kho', 'ERROR');
                }
            }, DEBOUNCE_DELAY);
        });

    } catch (error) {
        showMessage('Lỗi tải dữ liệu kho', 'ERROR');
    }
}

// ==================== LOAD OTHER AREA ====================
function LoadOtherArea() {
    const aisleMap = {};
    var shelfDataPL = shelfData.filter(x => x.Module == 2)
    shelfDataPL.forEach(shelf => {
        if (!aisleMap[shelf.DayID]) {
            aisleMap[shelf.DayID] = {
                name: shelf.TenDay,
                shelves: []
            };
        }
        aisleMap[shelf.DayID].shelves.push(shelf);
    });

    // Sort aisles by name
    const sortedAisles = Object.keys(aisleMap).sort((a, b) => {
        return (aisleMap[a].name || '').localeCompare(
            aisleMap[b].name || '',
            'vi',
            { numeric: true }
        );
    });

    // Categorize aisles
    const phuLieuAisles = [];
    const thanhPhamAisles = [];

    sortedAisles.forEach(aisleID => {
        const aisle = aisleMap[aisleID];

        // Sort shelves by number
        aisle.shelves.sort((a, b) => {
            return extractShelfNumber(a.TenKe) - extractShelfNumber(b.TenKe);
        });

        // Categorize based on first shelf
        const firstShelfNum = extractShelfNumber(aisle.shelves[0].TenKe);
        if (isPhuLieu(firstShelfNum)) {
            phuLieuAisles.push(aisle);
        } else {
            thanhPhamAisles.push(aisle);
        }
    });

    // Render
    $('#container-khuvucphulieu').empty();
    renderAisleGroups(phuLieuAisles, $('#container-khuvucphulieu'));

    $('#container-hangthanhpham').text("NHẬN THÀNH PHẨM");
    // Chờ
    //renderRowThanhPham(thanhPhamAisles, $('#container-hangthanhpham'));

    // Update header
    requestAnimationFrame(() => {
        setTimeout(() => updateHeaderLayout(), 50);
    });
}

// ==================== RENDER FUNCTIONS ====================
function renderAisleGroups(aisles, container) {
    if (!aisles.length) return;

    const mainWrapper = $('<div class="shelf-pair"></div>');

    aisles.forEach((aisle, aisleIndex) => {
        if (aisleIndex > 0) {
            mainWrapper.append('<div class="walkway"></div>');
        }

        const maxCells = Math.max(...aisle.shelves.map(s => s.MaxO || 0));
        const firstShelfNum = extractShelfNumber(aisle.shelves[0].TenKe);
        const background = getBackground(firstShelfNum);

        const aisleWrapper = $('<div class="aisle-wrapper"></div>').css({
            display: 'flex',
            gap: '0',
            alignItems: 'flex-start'
        });

        // Render each shelf
        aisle.shelves.forEach(shelf => {
            const shelfDiv = $('<div class="shelf"></div>')
                .attr({
                    id: shelf.ID,
                    'data-keid': shelf.KeID,
                    'data-tenke': shelf.TenKe
                })
                .css({
                    width: '45px',
                    minHeight: `${maxCells * 30 + 20}px`,
                    flexShrink: '0',
                    margin: '0px 2px'
                });

            // Add shelf label
            shelfDiv.append(`<div class="shelf-label">${shelf.TenKe}</div>`);

            // Add cells
            for (let i = 0; i < (shelf.MaxO || 0); i++) {
                const cell = $('<div class="cell"></div>').css({
                    marginTop: i === 0 ? '20px' : '0',
                    background: background,
                    border: '1px solid #000',
                    height: '30px'
                });

                // Add tooltip if customer exists
                if (shelf.KhachHang?.trim()) {
                    const customers = shelf.KhachHang.split(',').map(kh => kh.trim());
                    const customerList = customers.map(kh => `<li>${kh}</li>`).join('');
                    cell.append(`
                        <div class="tooltip-custom">
                            <strong>${shelf.TenKe}</strong>
                            <ul>${customerList}</ul>
                        </div>
                    `);
                }

                shelfDiv.append(cell);
            }

            // Add empty cells for alignment
            for (let i = (shelf.MaxO || 0); i < maxCells; i++) {
                shelfDiv.append('<div style="height: 50px;"></div>');
            }

            // Add click event
            shelfDiv.on('click', function () {
                handleShelfClick($(this).data('keid'), $(this).data('tenke'));
            });

            aisleWrapper.append(shelfDiv);
        });

        mainWrapper.append(aisleWrapper);
    });

    container.append(mainWrapper);
}

function renderRowThanhPham(aisles, container) {
    if (!aisles || !aisles.length) return;
    container.empty();
    const mainWrapper = $('<div>').addClass('row-shelf-pair');

    let totalRendered = 0;
    const maxShelves = 3;

    for (const aisle of aisles) {
        if (totalRendered >= maxShelves) break;

        for (const shelf of aisle.shelves) {
            if (totalRendered >= maxShelves) break;

            const rowDiv = $('<div>').addClass('row-shelf')
                .attr("id", shelf.KeID)
                .attr("data-keid", shelf.KeID);
            const labelCell = $('<div>').addClass('row-cell')
                .text(shelf.TenKe.replace("Kệ ", ""));

            rowDiv.append(labelCell);

            for (let i = 0; i < (shelf.MaxO || 0); i++) {
                const cell = $('<div>').addClass('row-cell');

                if (shelf.KhachHang && shelf.KhachHang.trim() !== '') {
                    const customers = shelf.KhachHang.split(',').map(kh => kh.trim());
                    const customerList = customers.map(kh => `<li>${kh}</li>`).join('');
                    cell.append(`
                        <div class="tooltip-custom">
                            <strong>${shelf.TenKe}</strong>
                            <ul>${customerList}</ul>
                        </div>
                    `);
                }
                rowDiv.append(cell);
            }

            rowDiv.on('click', function () {
                handleShelfClick(shelf.KeID, shelf.TenKe);
            });

            mainWrapper.append(rowDiv);
            totalRendered++;
        }
    }

    container.append(mainWrapper);
}
// ==================== UPDATE HEADER ====================
function updateHeaderLayout() {
    const containers = [
        { selector: '#container-khuvucphulieu', title: 'KHU VỰC PHỤ LIỆU' },
        { selector: '#container-khuvucthanhpham', title: '' },
    ];

    const headerRow2 = $('.header-row-2').empty();

    containers.forEach(({ selector, title }) => {
        const containerElement = $(selector);
        let width = 0;

        if (selector === '#container-khuvucphulieu') {
            width = containerElement.outerWidth(false);
        } else if (selector === '#container-khuvucthanhpham') {
            width = containerElement.outerWidth(false);
        }

        if (containerElement.length > 0 && width > 0) {
            const sectionDiv = $(`
                <div class="section-title" style="border-top: 0;">${title}</div>
            `).css({
                width: `${width}px`,
            });

            headerRow2.append(sectionDiv);
        }
    });
}

/// kiet - 16032026
let draggedShelfID = null;
let draggedKeID = null;
let totalWidthWalkwayHorizontal;
let totalWidthWalkwayHorizontalPL;
let totalHeightA;
let walkwayDivMap = {};
let walkwayDivMapPL = {};
/// EVENT
function initWalkwayStyles() {
    let maxHeight = 0;
    $('#materialArea .shelf, #container-khuvucphulieu .shelf').each(function () {
        if ($(this).closest('.walkway, .walkway-horizontal').length === 0) {
            const h = $(this).outerHeight();
            if (h > maxHeight) maxHeight = h;
        }
    });
    if (maxHeight > 0) totalHeightA = maxHeight;


    $('.walkway-horizontal').each(function () {
        const $wh = $(this);
        const module = $wh.data('module')
        const $shelves = $wh.find('.shelf');
        const wWidth = module == 1 ? totalWidthWalkwayHorizontal : totalWidthWalkwayHorizontalPL;

        const $cells = $wh.find('.cell');
        const shelfCount = $shelves.length;
        if (shelfCount === 0) return;

        if (shelfCount === 1) {
            const $s = $shelves.first();
            $wh.css({
                'display': 'flex',
                'flex-direction': 'row',
                'align-items': 'center',
                'height': 'auto',
                'overflow': 'hidden'
            });
            $s.css({
                'overflow': 'hidden',
                'margin-top': '4px',
                'margin-bottom': '4px',
                'transform': '',
                'transform-origin': '',
                'width': `${wWidth / 2}` + "px",
                'min-width': `${wWidth / 2 + 2}` + "px",
                'max-width': `${wWidth / 2 + 2}` + "px",
                'min-height': `${CELL_HEIGHT}px`,
                'max-height': `${CELL_HEIGHT}px`,
                'justify-content': '',
            });
            $wh.find('.cell').slice(1).css({
                'min-width': `${wWidth / 2}px`,
                'min-height': `${CELL_HEIGHT}px`,
                'max-height': `${CELL_HEIGHT}px`,
                'height': `${CELL_HEIGHT}px`
            });

            const keID = $s.data('keid');
            const mod = $wh.data('module');
            const $divKe = $s.find('.shelf-label').first();
            const $divIcon = $divKe.find('.fa-eye');

            if ($divIcon.length === 0) {
                $divKe.addClass("d-flex justify-content-between gap-2").attr("style", `width:50px;z-index:999;left: 60%; height:${CELL_HEIGHT}`);

                const dsKe = mod == 1 ? shelfData : shelfDataPL;
                const shelfKe = dsKe.find(item => item.KeID == keID);

                const $eyeIcon = $('<i class="fa fa-eye ms-1" style="cursor:pointer;"></i>')
                    .on('click', function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                        openShelfHorizontalModal(shelfKe);
                    });

                $divKe.append($eyeIcon);
            }

        }
        else {
            $wh.find('.shelf-label .fa-eye').remove();
            $wh.find('.shelf-label').removeClass("d-flex").removeAttr('style');
            $wh.css({
                'display': 'flex',
                'flex-direction': 'row',
                'align-items': 'center',
                'height': '110px',
                'gap': '8px',
                'overflow': 'hidden'
            });
            $shelves.each(function () {
                $(this).find('.cell').first().remove();
                const tenKe = $(this).data('tenke')
                $(this).append(`<div class="shelf-label">${tenKe}</div>`);
                $(this).css({
                    'transform': '',
                    'transform-origin': '',
                    'width': '80px',
                    'min-height': '80px',
                    'max-height': '80px',
                    'justify-content': '',
                    'margin-top': '0',
                    'margin-bottom': '0',
                });
            });
            $cells.each(function () {
                $(this).css({
                    'min-height': '78px',
                    'max-height': '78px',
                });
            });
        }
    });

    $('.walkway:not(.walkway-horizontal)').each(function () {
        const $wv = $(this);
        const $shelves = $wv.find('.shelf');
        const shelfCount = $shelves.length;

        if (shelfCount === 0) return;

        $wv.css({
            'width': 'auto',
            'min-width': '100px',
            'display': 'flex',
            'flex-wrap': 'wrap',
            'align-items': 'flex-start',
            'height': `${totalHeightA}px`,
            'gap': '0px',
            'padding': '0px 4px'
        });

        $shelves.each(function () {
            $(this).css({
                'transform': '',
                'transform-origin': '',
                'width': '100px',
                'min-height': `${totalHeightA}px`,
                'margin-top': '',
                'justify-content': ''
            });
            $(this).find('.cell').css({
                'min-height': `${totalHeightA}px`,
                'max-height': `${totalHeightA}px`,
            });
            $(this).find('.shelf-group-content').css({
                'max-height': `${totalHeightA - 100}px`,
            });
        });
    });
}

function initDragDrop() {

    $(document).on('dragstart', '.shelf[draggable="true"]', function (e) {
        draggedShelfID = this.id;
        draggedKeID = $(this).data('keid');
        $(this).addClass('shelf-dragging');
        e.originalEvent.dataTransfer.setData('shelfID', this.id);
        e.originalEvent.dataTransfer.setData('keID', draggedKeID);
        e.originalEvent.dataTransfer.effectAllowed = 'move';
    });

    $(document).on('dragend', '.shelf[draggable="true"]', function () {
        $(this).removeClass('shelf-dragging');
        $('.walkway, .walkway-horizontal').removeClass('walkway-dragover walkway-dragover-invalid');
        draggedShelfID = draggedKeID = null;
    });

    $(document).on('dragover', '.walkway, .walkway-horizontal', function (e) {
        e.preventDefault();
        const walkwayModule = parseInt($(this).attr('data-module')) || 1;
        const shelfModule = dataDanhSachKe.find(x => x.KeID == draggedKeID)?.Module ?? 1;
        const shelfTenDay = dataDanhSachKe.find(x => x.KeID == draggedKeID)?.TenDay;
        if (shelfModule !== walkwayModule || shelfTenDay.toLowerCase().includes("co")) {
            e.originalEvent.dataTransfer.dropEffect = 'none';
            $(this).addClass('walkway-dragover-invalid').removeClass('walkway-dragover');
        } else {
            e.originalEvent.dataTransfer.dropEffect = 'move';
            $(this).addClass('walkway-dragover').removeClass('walkway-dragover-invalid');
        }
    });

    $(document).on('dragleave', '.walkway, .walkway-horizontal', function (e) {
        if (!$(this).is(e.target)) return;
        const related = e.originalEvent.relatedTarget;
        if (related && $(this)[0].contains(related)) return;
        $(this).removeClass('walkway-dragover walkway-dragover-invalid');
    });

    $(document).on('drop', '.walkway, .walkway-horizontal', function (e) {
        e.preventDefault();
        $(this).removeClass('walkway-dragover walkway-dragover-invalid');

        const isAnyChecked = $('#cbShowKH, #cbShowMH, #cbShowItemCode').is(':checked');
        const shelfID = e.originalEvent.dataTransfer.getData('shelfID');
        const keID = e.originalEvent.dataTransfer.getData('keID');
        const walkwayID = $(this).data('walkwayid');
        if (!shelfID || !keID) return;

        const $shelf = $(`[id="${shelfID}"]`).first();
        const $walkway = $(this);
        const shelfModule = parseInt($shelf.attr('data-module')) || 1;
        const walkwayModule = parseInt($walkway.attr('data-module')) || 1;
        const isHorizontal = $walkway.hasClass('walkway-horizontal');

        //  Validate 
        if (shelfModule !== walkwayModule) {
            showToast('error', 'Không thể di chuyển kệ sang khu vực khác!');
            return;
        }
        if (!isHorizontal && $walkway.find('.shelf').not(`[id="${shelfID}"]`).length > 0) {
            showToast('warning', 'Lối đi này đã có kệ, không thể thêm tiếp');
            return;
        }

        //  Cleanup old walkway 
        const $oldWalkway = $shelf.closest('.walkway, .walkway-horizontal');
        if ($oldWalkway.length && !$oldWalkway.is($walkway)) {
            const isNDay = (dataDanhSachKe.find(x => x.KeID == draggedKeID)?.TenDay || '').toLowerCase().includes('n');
            const remaining = $oldWalkway.find('.shelf').length;
            if (isNDay && remaining === 0) {
                $oldWalkway.remove();
            } else if (!$oldWalkway.hasClass('walkway-horizontal')) {
                $oldWalkway.css({ 'width': '60px', 'min-width': '60px', 'background-color': '#fff', 'border-left': '1px solid #000', 'border-right': '1px solid #000' });
            }
        }

        //  Append shelf 
        $walkway.append($shelf);
        const shelfCount = $walkway.find('.shelf').length;

        //  Style walkway sau drop 
        if (isHorizontal) {
            const wWidth = shelfModule == 1 ? totalWidthWalkwayHorizontal : totalWidthWalkwayHorizontalPL;
            $walkway.css({ 'display': 'flex', 'flex-direction': 'row', 'align-items': 'center', 'width': `${wWidth}px`, 'overflow': 'hidden' });

            if (shelfCount === 1) {
                const $s = $walkway.find('.shelf').first();
                $s.css({
                    'margin-top': '4px',
                    'transform': '',
                    'transform-origin': '',
                    'width': `${totalWidthWalkwayHorizontal / 2}` + "px",
                    'min-width': `${totalWidthWalkwayHorizontal / 2 + 2}` + "px",
                    'max-width': `${totalWidthWalkwayHorizontal / 2 + 2}` + "px",
                    'min-height': '75px',
                    'max-height': '75px',
                    'justify-content': '',
                });
                $s.find('.cell').css({
                    'min-height': '73px',
                    'max-height': '73px',
                    'height': '73px'
                });
                $walkway.css({
                    'display': 'flex',
                    'flex-direction': 'row',
                    'align-items': 'center',
                    'width': `${wWidth}px`,
                    'height': 'auto',
                    'overflow': 'hidden'
                });
            }
            else {
                $walkway.find('.shelf-label .fa-eye').remove();
                $walkway.find('.shelf-label').removeClass("d-flex").removeAttr('style');
                $walkway.css({ 'height': isAnyChecked ? '220px' : '115px', 'gap': '8px' });

                $walkway.find('.shelf').css({
                    'background': 'linear-gradient(135deg, rgb(241, 245, 249) 0%, rgb(194, 213, 214) 100%)',
                    'transform': '',
                    'width': '80px',
                    'min-width': '',
                    'max-width': '',
                    'min-height': isAnyChecked ? '200px' : '80px',
                    'max-height': isAnyChecked ? '200px' : '80px',
                    'overflow': 'hidden'
                });
                $walkway.find('.cell').css({
                    'min-height': isAnyChecked ? '199px' : '78px',
                    'max-height': isAnyChecked ? '199px' : '78px'
                });

                $walkway.find('.shelf').each(function () {
                    $(this).find('.cell').first().remove();
                    const tenKe = $(this).data('tenke')
                    $(this).append(`<div class="shelf-label">${tenKe}</div>`);


                    const $groups = $(this).find('.shelf-group');
                    const groupCount = $groups.length;
                    if (groupCount === 0) return;

                    const containerH = 200;
                    const headerH = 18;
                    const availableH = containerH - (groupCount * headerH) - 20;
                    const perGroupH = Math.floor(availableH / groupCount);

                    $groups.find('.shelf-group-content').css({
                        'max-height': `${Math.max(perGroupH, 40)}px`,
                        'overflow-y    ': 'auto',
                        'overflow-x': 'hidden'
                    });

                });
            }
        } else {
            const $shelves = $walkway.find('.shelf')
            const dataSelf = dataDanhSachKe.find(item => item.KeID == $shelves.data('keid'))
            convertShelfToNormal($walkway, $shelves, dataSelf)
        }

        //  Sync tất cả walkway-horizontal sau drop 
        $('.walkway-horizontal').each(function () {
            const $wh = $(this);
            const $shelves = $wh.find('.shelf');
            const $cells = $wh.find('.cell');


            if ($shelves.length === 0) {
                $wh.css('height', '48px');
            }
            if ($shelves.length === 1) {
                const dataSelf = dataDanhSachKe.find(item => item.KeID == $shelves.data('keid'))
                $wh.css({ 'height': '115px', 'gap': '8px' });
                convertShelfToNDay($shelves, dataSelf)
            } else if ($shelves.length > 1) {
                $wh.css({ 'height': isAnyChecked ? '220px' : '115px', 'gap': '8px' });
                $shelves.css({ 'transform': '', 'width': '80px', 'min-height': isAnyChecked ? '200px' : '80px', 'max-height': isAnyChecked ? '200px' : '80px', 'overflow': 'hidden' });
                $cells.css({ 'min-height': isAnyChecked ? '199px' : '78px', 'max-height': isAnyChecked ? '199px' : '78px' });
            }
        });

        shelfOnDrag(keID, walkwayID, shelfModule);
        refreshCellContent();
    });
}

function getCellDisplayHTML(shelf, keID) {
    const isKH = $('#cbShowKH').is(':checked');
    const isMH = $('#cbShowMH').is(':checked');
    const isIC = $('#cbShowItemCode').is(':checked');
    if (!isKH && !isMH && !isIC) return '';

    const base = totalHeightA || 300;
    const PADDING = 20;
    const TOGGLE_H = 18;
    const KH_FIXED = 30;
    const MH_FIXED = 40;

    // Tính tổng toggle header đang bật
    const toggleCount = [isKH, isMH, isIC].filter(Boolean).length;
    const totalToggleH = toggleCount * TOGGLE_H;

    // Tổng không gian usable
    const usable = base - PADDING - totalToggleH;

    // Tính phần KH , MH đã dùng
    let usedFixed = 0;
    if (isKH) usedFixed += KH_FIXED;
    if (isMH) usedFixed += MH_FIXED;

    // IC luôn lấy phần còn lại
    const icHeight = isIC ? Math.max(usable - usedFixed, 30) : 0;

    let groups = [];

    if (isKH && shelf.KhachHang?.trim()) {
        const items = shelf.KhachHang.split(',').map(x => x.trim()).filter(Boolean).join(', ');
        const id = `kh-${keID}`;
        groups.push(`
            <div class="shelf-group" data-group="kh">
                <div class="shelf-group-toggle" onclick="event.stopPropagation();event.preventDefault();$('#${id}').collapse('toggle');">
                    <b>Khách Hàng</b><span class="toggle-icon">▾</span>
                </div>
                <div class="collapse show" id="${id}">
                    <div class="shelf-group-content" style="max-height:${KH_FIXED}px;overflow-y:auto;overflow-x:hidden;">${items}</div>
                </div>
            </div>`);
    }

    if (isMH && shelf.TenHang?.trim()) {
        const items = shelf.TenHang.split(',').map(x => x.trim()).filter(Boolean).join(', ');
        const id = `mh-${keID}`;
        groups.push(`
            <div class="shelf-group" data-group="mh">
                <div class="shelf-group-toggle" onclick="event.stopPropagation();event.preventDefault();$('#${id}').collapse('toggle');">
                    <b>Mã Hàng</b><span class="toggle-icon">▾</span>
                </div>
                <div class="collapse show" id="${id}">
                    <div class="shelf-group-content" style="max-height:${MH_FIXED}px;overflow-y:auto;overflow-x:hidden">${items}</div>
                </div>
            </div>`);
    }

    if (isIC && shelf.MaVT?.trim()) {
        const items = shelf.MaVT.split(',').map(x => `<li>${x.trim()}</li>`).join('');
        const id = `ic-${keID}`;
        groups.push(`
            <div class="shelf-group" data-group="ic">
                <div class="shelf-group-toggle" onclick="event.stopPropagation();event.preventDefault();$('#${id}').collapse('toggle');">
                    <b>Item Code</b><span class="toggle-icon">▾</span>
                </div>
                <div class="collapse show" id="${id}">
                    <div class="shelf-group-content" style="max-height:${icHeight}px;overflow-y:auto;overflow-x:hidden;">
                        <ul style="padding:0px 0px 4px 14px;margin:0;">${items}</ul>
                    </div>
                </div>
            </div>`);
    }

    if (!groups.length) return '';

    return `
        <div class="shelf-display-content" style="
            position:absolute;top:20px;left:0;right:0;bottom:0;
            display:flex;flex-direction:column;gap:2px;
            padding:3px;overflow:hidden;
            z-index:10;
            pointer-events:auto;
            font-size:9px;word-break:break-word;line-height:1.4;background:transparent;">
            ${groups.join('')}
        </div>`;
}

function getCellDisplayHTMLForCO(shelf) {
    const isKH = $('#cbShowKH').is(':checked');
    const isMH = $('#cbShowMH').is(':checked');
    const isIC = $('#cbShowItemCode').is(':checked');
    if (!isKH && !isMH && !isIC) return '';

    let groups = [];

    if (isKH && shelf.KhachHang?.trim()) {
        const items = shelf.KhachHang.split(',').map(x => x.trim()).filter(Boolean).join(', ');
        groups.push(`
            <div class="shelf-group-content" style="
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                white-space: normal;
            "><span style='font-weight: bold'>Khách Hàng:</span> ${items}</div>
        `);
    }

    if (isIC && shelf.MaVT?.trim()) {
        const items = shelf.MaVT.split(',').map(x => x.trim()).join(', ');
        groups.push(`
            <div class="shelf-group-content" style="
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 4;
                -webkit-box-orient: vertical;
                white-space: normal;
            "><span style='font-weight: bold'>Item Code:</span> ${items}</div>
        `);
    }

    if (!groups.length) return '';

    return `
        <div class="shelf-display-content" style="
            display: flex;
            flex-direction: row;
            gap: 6px;
            padding: 2px 4px;
            width: 100%;
            overflow: hidden;
            box-sizing: border-box;
        ">
            ${groups.join('')}
        </div>`;
}

function refreshCellContent() {
    const isAnyChecked = $('#cbShowKH, #cbShowMH, #cbShowItemCode').is(':checked');

    $('#materialArea .shelf, #container-khuvucphulieu .shelf, .walkway .shelf, .walkway-horizontal .shelf, [data-module="3"][data-keid]').each(function () {
        const keID = $(this).data('keid');
        const module = parseInt($(this).attr('data-module')) || 1;

        const shelf = module === 3
            ? dataDanhSachKe.find(x => x.KeID === keID)
            : dataDanhSachKe.find(x => x.KeID === keID && x.Module == module);


        if (!shelf) return;

        $(this).find('.shelf-display-content').remove();
        $(this).find('.cell').removeClass('hide-tooltip');



        const $walkwayH = $(this).closest('.walkway-horizontal');
        const shelfCountInWalkH = $walkwayH.length > 0 ? $walkwayH.find('.shelf').length : 0;
        const isNDay = (shelf.TenDay || '').toLowerCase().includes('n');

        if (isAnyChecked) {
            $('.walkway-horizontal').each(function () {
                const $wh = $(this);
                const shelfCount = $wh.find('.shelf').length;
                if (shelfCount <= 1) return;

                $wh.css({ 'height': '220px', 'gap': '8px' });
                $wh.find('.shelf').css({
                    'transform': '', 'width': '100px',
                    'min-height': '200px', 'max-height': '200px', 'overflow': 'hidden'
                });
                $wh.find('.cell').css({ 'min-height': '199px', 'max-height': '199px' });

                $wh.find('.shelf').each(function () {
                    const $groups = $(this).find('.shelf-group');
                    const groupCount = $groups.length;
                    if (groupCount === 0) return;

                    const containerH = 200;
                    const headerH = 18;
                    const availableH = containerH - (groupCount * headerH) - 20;
                    const perGroupH = Math.floor(availableH / groupCount);

                    $groups.find('.shelf-group-content').css({
                        'max-height': `${Math.max(perGroupH, 40)}px`,
                        'overflow-y': 'auto',
                        'overflow-x': 'hidden'
                    });
                });
            });
            if (module === 3) {
                const shelfH = $(this).outerHeight() || 70;
                const shelfW = ($(this).outerWidth() || 200) - 20;

                const html = getCellDisplayHTMLForCO(shelf, keID, shelfW)
                if (!html) return;

                $(this).css('position', 'relative');
                $(this).append(html);
                $(this).find('.cell').addClass('hide-tooltip');
                $(this).find('.shelf-display-content').css({
                    'position': 'absolute',
                    'top': '-1px',
                    'left': `${shelf.ColID == 1 ? '0' : '57'}px`,
                    'width': shelfW - 51 + 'px',
                    'height': shelfH + 'px',
                    'transform-origin': 'top left',
                    'display': 'flex',
                    'flex-direction': 'column',
                    'gap': '1px',
                    'overflow': 'hidden',
                    'font-size': '8px',
                    'z-index': '10',
                    'background': 'transparent',
                    'padding': '2px'
                });

                return;
            }
            //  Tính targetHeight 
            if (isNDay) {
                const $walkway = $(this).closest('.walkway, .walkway-horizontal');
                if ($walkwayH.length > 0) {
                    if (shelfCountInWalkH === 1) {

                        const shelfH = $(this).outerHeight() || 70;
                        const shelfW = ($(this).outerWidth() || 200) - 20;

                        const html = getCellDisplayHTMLForCO(shelf, keID, shelfW);
                        if (!html) return;

                        $(this).css('position', 'relative');
                        $(this).append(html);
                        $(this).find('.cell').addClass('hide-tooltip');

                        $(this).find('.shelf-display-content').css({
                            'position': 'absolute',
                            'top': '-1px',
                            'left': '57px',
                            'width': shelfW - 51 + 'px',
                            'height': shelfH + 'px',
                            'transform-origin': 'top left',
                            'display': 'flex',
                            'flex-direction': 'column',
                            'gap': '1px',
                            'overflow': 'hidden',
                            'font-size': '8px',
                            'z-index': '10',
                            'pointer-events': 'auto',
                            'background': 'transparent',
                            'padding': '2px'
                        });

                        return;
                    }
                    else {
                        // Horizontal nhiều shelf
                        $walkwayH.css({ 'height': '220px', 'gap': '8px' });
                        $walkwayH.find('.shelf').css({
                            'transform': '', 'width': '100px',
                            'min-height': '200px', 'max-height': '200px', 'overflow': 'hidden'
                        });
                        $walkwayH.find('.cell').css({ 'min-height': '199px', 'max-height': '199px' });

                        // Scroll cho shelf-group-content
                        $walkwayH.find('.shelf').each(function () {
                            const $groups = $(this).find('.shelf-group');
                            const groupCount = $groups.length;
                            if (groupCount === 0) return;

                            const containerH = 200;
                            const headerH = 18;
                            const availableH = containerH - (groupCount * headerH) - 20;
                            const perGroupH = Math.floor(availableH / groupCount);

                            $groups.find('.shelf-group-content').css({
                                'max-height': `${Math.max(perGroupH, 40)}px`,
                                'overflow-y    ': 'auto',
                                'overflow-x': 'hidden'
                            });
                        });
                    }
                }
                else if ($walkway.length > 0) {
                    // Walkway dọc
                    const $outer = $walkway.parent();
                    let mh = 0;
                    $outer.find('.shelf').not(this).each(function () {
                        if (!$(this).closest('.walkway, .walkway-horizontal').length) {
                            mh = Math.max(mh, $(this).outerHeight());
                        }
                    });
                    if (mh > 0) targetHeight = mh;


                } else {
                    // Shelf thường ngoài walkway
                    const $cont = $(this).closest('#materialArea, #container-khuvucphulieu');
                    let mh = 0;
                    $cont.find('.shelf').not(this).each(function () {
                        mh = Math.max(mh, $(this).outerHeight());
                    });
                    if (mh > 0) targetHeight = mh;
                }

                if (shelfCountInWalkH > 1) {
                    $(this).css({ 'min-height': '200px', 'max-height': '200px' });
                    $(this).find('.cell').css({ 'min-height': '200px', 'max-height': '200px' });
                }
            }

            //  Render HTML 
            const html = getCellDisplayHTML(shelf, keID);
            if (!html) return;
            $(this).append(html);
            $(this).find('.cell').addClass('hide-tooltip');

        } else {
            $(this).find('.shelf-display-content').remove();
            $(this).find('.cell').removeClass('hide-tooltip');

            const $s = $walkwayH.find('.shelf');
            const dataSelf = dataDanhSachKe.find(item => item.KeID == $s.data('keid'))
            if ($walkwayH.length > 0) {
                if (shelfCountInWalkH === 1) {
                    convertShelfToNDay($s, dataSelf)
                } else {
                    $walkwayH.css({ 'height': '110px', 'gap': '8px' });
                    $walkwayH.find('.shelf').css({ 'transform': '', 'width': '100px', 'min-height': '80px', 'max-height': '80px' });
                    $walkwayH.find('.cell').css({ 'min-height': '78px', 'max-height': '78px' });
                }
            }
        }
    });
}

async function shelfOnDrag(keID, walkwayID, module = 1) {
    try {
        const url = `/api/ViTriKhoNPL/GetSoDoKhoDragDrop?action=Post&para1=${keID}&para2=${walkwayID}&para3=${module}`;
        const response = await fetch(url);
        if (!response.ok) {
            showToast("error", "Lỗi khi di chuyển kệ")
            return;
        }
        /* showToast("success", "Di chuyển kệ thành công")*/
    } catch (err) {
        showToast("error", "Lỗi khi di chuyển kệ")
    }
}

function getWalkwaysByModule(module) {
    return $('.walkway-horizontal').filter(function () {
        return parseInt($(this).data('module')) === parseInt(module);
    });
}

/// ======================== Module Xem Chi Tiết ====================================
let soDoKhoNL = [];
let soDoKhoPL = [];
let btnModule;
/// Event
$(document).ready(function () {
    GetThongTinKeNPL()
})
$(function () {
    $('.btnXemChiTiet').on('click', function () {
        btnModule = $(this).data('module')
        $('#txtKeNPL').text(`${btnModule == 1 ? 'Nguyên Liệu' : 'Phụ Liệu'}`)
        if (btnModule == 1) {
            buildSoDoKho(soDoKhoNL)
        } else {
            buildSoDoKho(soDoKhoPL)
        }
        $('#shelfDetailModal').modal("show");
    })
})

/// Api 
async function GetChiTietONPL(maONPL, module) {
    try {
        const url = `/api/ViTriKhoNPL/GetSoDoKhoDragDrop?action=GetChiTietONPL&para1=${maONPL}&para2=${module}`;

        const response = await fetch(url);
        const data = await response.json();

        openShelfHorizontalModal(data[0], 2)
    } catch (err) {
        console.error(err)
    }
}
async function GetThongTinKeNPL() {
    try {
        const url = `/api/ViTriKhoNPL/GetSoDoKhoDragDrop?action=GetThongTinSoDoKho`;

        const response = await fetch(url);
        const data = await response.json();

        soDoKhoNL = data.filter(item => item.Module == 1 && !(String(item.TenDay).toLowerCase().includes('n') || String(item.TenDay).toLowerCase().includes('lỗi') || String(item.TenDay).toLowerCase().includes('co')));
        soDoKhoPL = data.filter(item => item.Module == 2 && !(String(item.TenDay).toLowerCase().includes('n') || String(item.TenDay).toLowerCase().includes('lỗi') || String(item.TenDay).toLowerCase().includes('co')));
    } catch (err) {
        console.error(err)
    }
}

// Check1
function buildSoDoKho(data) {
    let groupKeID = new Map();
    data.forEach(item => {
        let parts = item.TenO.split(".");
        let tang = parseInt(parts[2]);
        if (!groupKeID.has(item.KeID)) {
            groupKeID.set(item.KeID, {
                tenKe: item.TenKe,
                soTang: 0,
                maxO: 0,
                dayID: item.DayID,
                tang: {}
            });
        }
        let ke = groupKeID.get(item.KeID);
        if (!ke.tang[tang]) {
            ke.tang[tang] = [];
        }
        ke.tang[tang].push({ tenO: item.TenO, MaVTTV: item.MaVTTV, MaVTTVChiTiet: item.MaVTTVChiTiet, TenKH: item.TenKH, Module: item.Module });
        ke.soTang = Object.keys(ke.tang).length;
        ke.maxO = Math.max(ke.maxO, ke.tang[tang].length);
    });

    const sortedKe = [...groupKeID.entries()].sort((a, b) =>
        a[1].tenKe.localeCompare(b[1].tenKe, undefined, { numeric: true })
    );

    const $shelfBody = $("#shelfBody");

    const isKH = $('#cbShowKH').is(':checked');
    const isIC = $('#cbShowItemCode').is(':checked');

    let html = ``;
    let CELL_W, CELL_H, CELL_H_KH, CELL_H_IC;
    if (isKH && isIC) {
        CELL_W = 162;
        CELL_H = 24;
        CELL_H_KH = 14;
        CELL_H_IC = 34;
    } else if ((isKH && !isIC) || (!isKH && isIC)) {
        CELL_W = 142;
        CELL_H = 24;
        CELL_H_KH = 24;
        CELL_H_IC = 34;
    } else {
        CELL_W = 102;
        CELL_H = 24;
    }
    const KE_W = 52;


    // Track DayID đã xuất hiện chưa
    const seenDayIDs = new Set();

    sortedKe.forEach(([key, value]) => {
        let tangHTML = ``;
        const sortedTangs = Object.keys(value.tang)
            .map(Number)
            .sort((a, b) => b - a);

        sortedTangs.forEach((tang, tangIndex) => {
            const cells = (value.tang[tang] || []).filter(o => o.tenO && o.tenO.trim() !== '')
                .sort((a, b) => {
                    const numA = parseInt(a.tenO.split('.').pop()) || 0;
                    const numB = parseInt(b.tenO.split('.').pop()) || 0;
                    return numA - numB;
                });;
            if (cells.length === 0) return;

            const isFirstRow = tangIndex === 0;
            const isLastRow = tangIndex === sortedTangs.length - 1;

            const fullCells = Array.from({ length: value.maxO }, (_, idx) => cells[idx] || null);


            tangHTML += `<div style="display:flex; flex-wrap:nowrap;">`;
            fullCells.forEach((o, colIndex) => {
                const isFirstCol = colIndex === 0;
                const isLastCol = colIndex === fullCells.length - 1;

                let bt = isFirstRow ? '2px solid #1a237e' : '1px solid #c5cae9';
                let bb = isLastRow ? '2px solid #1a237e' : '1px solid #c5cae9';
                let bl = isFirstCol ? '2px solid #1a237e' : '1px solid #c5cae9';
                let br = isLastCol ? '2px solid #1a237e' : '1px solid #c5cae9';

                if (!isFirstCol) bl = 'none';
                if (!isFirstRow) bt = 'none';

                const $iconEye = $(`<i data-module="${o.Module}" data-teno="${o.tenO}" data-mavttvchitiet="${o.MaVTTVChiTiet}" data-tenkh="${o.TenKH}" class="fa fa-eye" style="position: absolute; top: 0px; left: 0px; z-index: 999; pointer-events: auto; cursor: pointer; font-size: 8px; color: #158ef4; padding: 0 0 10px 60px; opacity: 0"></i>`)

                if (isKH || isIC) {
                    tangHTML += `
                    <div  class="d-flex justify-content-start flex-column">
                        <div class="o-2" style="width:${CELL_W}px; min-width:${CELL_W}px; height:${CELL_H}px; border-top:${bt}; border-left:${bl}; border-right:${br};
                        "><span>${o ? o.tenO : ''}</span>
                        ${$iconEye.prop('outerHTML')}
                        </div>
                        <div class="o-cha-chitiet">
                          ${isKH ? `<div class="o-chitiet-kh" style="width:${CELL_W}px;min-width:${CELL_W}px;height:${CELL_H_KH}px;border-bottom:${isKH && isIC ? '' : bb};border-left:${bl};border-right:${br};"> ${o.TenKH ? `<strong>KH: </strong> ${o.TenKH}` : ''}</div>` : ''}
                          ${isIC ? `<div class="o-chitiet-ic"style="width:${CELL_W}px; min-width:${CELL_W}px; height:${CELL_H_IC}px;border-bottom:${bb}; border-left:${bl}; border-right:${br};">${o.MaVTTV ? `<strong>IC: +</strong> ${o.MaVTTV}` : ''}</div>` : ''}
                        </div>
                    
                    </div>`
                        ;
                } else {
                    tangHTML += `
                    <div class="o-1" style="width:${CELL_W}px; min-width:${CELL_W}px; height:${CELL_H}px; border-top:${bt}; border-bottom:${bb}; border-left:${bl}; border-right:${br};                  
                    ">${o ? o.tenO : ''}</div>`;
                }

            });
            tangHTML += `</div>`;
        });

        const gridW = value.maxO * CELL_W;

        const isFirstInDay = !seenDayIDs.has(value.dayID);
        const marginTop = isFirstInDay ? '24px' : '0px';
        seenDayIDs.add(value.dayID);

        html += `
            <div class="d-flex flex-column justify-content-start align-items-start">
                <div style="margin-top:${marginTop}; display:flex; flex-wrap:nowrap; align-items:flex-start; gap:6px;">
                <!-- Tên kệ -->
                <div class='ke-chitiet' style="width:${KE_W}px; min-width:${KE_W}px; min-height:${CELL_H * value.soTang * (isKH && isIC ? 3 : (isKH && !isIC) || (!isKH && isIC) ? 2 : 1)}px;
                ">${value.tenKe}</div>

                <!-- Grid ô - scroll ngang nếu tràn -->
                <div style=" overflow-x:auto; -webkit-overflow-scrolling:touch;flex:1;min-width:0;"><div style="width:${gridW}px; min-width:${gridW}px;">${tangHTML} </div></div>
            </div>
        </div>
        `;
    });

    $shelfBody.html(html);

    $($shelfBody).find('.fa-eye').on('click', function () {
        const tenO = $(this).data('teno');
        const module = $(this).data('module');
        GetChiTietONPL(tenO, module)
    });
}

(function () {
    const DEFAULT_ZOOM = 75;
    let zoomPct = DEFAULT_ZOOM;
    const STEP = 5;
    const MIN = 30;
    const MAX = 200;

    function applyZoom() {
        const content = document.querySelector('#shelfDetailModal .modal-body');
        if (!content) return;
        content.style.zoom = zoomPct / 100;
        document.getElementById('zoomLabel').textContent = zoomPct + '%';
    }

    document.addEventListener('click', function (e) {
        if (e.target.closest('#btnZoomIn')) {
            zoomPct = Math.min(MAX, zoomPct + STEP);
            applyZoom();
        }
        if (e.target.closest('#btnZoomOut')) {
            zoomPct = Math.max(MIN, zoomPct - STEP);
            applyZoom();
        }
        if (e.target.closest('#btnZoomReset')) {
            zoomPct = DEFAULT_ZOOM;
            applyZoom();
        }
    });

    document.getElementById('shelfDetailModal')?.addEventListener('show.bs.modal', function () {
        zoomPct = DEFAULT_ZOOM;
        applyZoom();
    });
})();

document.addEventListener('click', async function (e) {
    if (!e.target.closest('#btnExportPDF')) return;

    const btnExport = document.getElementById('btnExportPDF');
    const modalBody = document.querySelector('#shelfDetailModal .modal-body');
    const content = document.getElementById('shelfBody');

    btnExport.disabled = true;
    btnExport.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

    // Lưu lại style gốc
    const savedZoom = modalBody.style.zoom || '';
    const savedOverflowMB = modalBody.style.overflow || '';
    const savedOverflowC = content.style.overflow || '';
    const savedWidth = content.style.width || '';
    const savedMaxWidth = content.style.maxWidth || '';

    try {
        // Reset zoom về 1 để đo đúng
        modalBody.style.zoom = '1';
        modalBody.style.overflow = 'visible';

        // Bỏ giới hạn width để content trải ra đủ
        content.style.overflow = 'visible';
        content.style.width = 'max-content';
        content.style.maxWidth = 'none';

        // Bỏ overflow-x của tất cả scroll containers bên trong
        const scrollDivs = content.querySelectorAll('[style*="overflow-x"]');
        const savedScrollStyles = [];
        scrollDivs.forEach(el => {
            savedScrollStyles.push(el.style.overflowX);
            el.style.overflowX = 'visible';
        });

        // Đợi browser reflow
        await new Promise(r => setTimeout(r, 150));

        const realW = content.scrollWidth;
        const realH = content.scrollHeight;

        const canvas = await html2canvas(content, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            scrollX: 0,
            scrollY: -window.scrollY,
            x: 0,
            y: 0,
            width: realW,
            height: realH,
            windowWidth: realW + 50,
            windowHeight: realH + 50
        });

        // Restore scroll divs
        scrollDivs.forEach((el, i) => {
            el.style.overflowX = savedScrollStyles[i];
        });

        const { jsPDF } = window.jspdf;

        // Chọn orientation dựa trên tỷ lệ canvas
        const isLandscape = canvas.width > canvas.height;
        const pdf = new jsPDF(isLandscape ? 'l' : 'p', 'pt', 'a4');

        const A4_W = isLandscape ? 841.89 : 595.28;
        const A4_H = isLandscape ? 595.28 : 841.89;
        const MARGIN = 20;
        const usableW = A4_W - MARGIN * 2;
        const usableH = A4_H - MARGIN * 2;

        const imgW = canvas.width;
        const imgH = canvas.height;
        const fitScale = Math.min(usableW / imgW, usableH / imgH);

        const finalW = imgW * fitScale;
        const finalH = imgH * fitScale;
        const offsetX = MARGIN + (usableW - finalW) / 2;
        const offsetY = MARGIN + (usableH - finalH) / 2;

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', offsetX, offsetY, finalW, finalH);

        if (window.CefSharp) {
            const pdfBlob = pdf.output('blob');
            const reader = new FileReader();
            reader.onload = async function () {
                try {
                    const base64 = reader.result.split(',')[1];
                    const filename = `SoDoKho_${btnModule == 1 ? 'NL' : 'PL'}.pdf`;

                    await CefSharp.BindObjectAsync('pdfBridge');

                    if (typeof pdfBridge === 'undefined') {
                        alert('Lỗi: pdfBridge chưa được đăng ký ở C#');
                        return;
                    }

                    await pdfBridge.savePDF(base64, filename);
                } catch (err) {
                    console.error(err)
                }
            };
            reader.readAsDataURL(pdfBlob);
        } else {
            pdf.save(`SoDoKho_${btnModule == 1 ? 'NL' : 'PL'}.pdf`);
        }
    } catch (err) {
        console.error(err);
        alert('Xuất PDF thất bại: ' + err.message);
    } finally {
        // Restore tất cả
        modalBody.style.zoom = savedZoom;
        modalBody.style.overflow = savedOverflowMB;
        content.style.overflow = savedOverflowC;
        content.style.width = savedWidth;
        content.style.maxWidth = savedMaxWidth;

        btnExport.disabled = false;
        btnExport.innerHTML = '<i class="bi bi-file-earmark-pdf-fill text-danger"></i>';
    }
});

function setupSearchFunctionality() {
    const searchInput = $('#searchItemInput');
    const clearBtn = $('#clearSearchBtn');

    // Tìm kiếm khi gõ
    searchInput.off('input').on('input', function () {
        const searchTerm = $(this).val().toLowerCase().trim();
        filterItems(searchTerm);
    });

    // Xóa tìm kiếm
    clearBtn.off('click').on('click', function () {
        searchInput.val('');
        filterItems('');
        searchInput.focus();
    });

    // Enter để tìm
    searchInput.off('keypress').on('keypress', function (e) {
        if (e.which === 13) {
            const searchTerm = $(this).val().toLowerCase().trim();
            filterItems(searchTerm);
        }
    });
}

// Hàm lọc items
function filterItems(searchTerm) {
    const groups = $('.collapsible-itemcode');
    let visibleCount = 0;

    if (!searchTerm) {
        // Hiển thị tất cả
        groups.show();
        visibleCount = groups.length;
    } else {
        // Lọc theo từ khóa
        groups.each(function () {
            const $group = $(this);
            const maVT = $group.data('mavt')?.toString().toLowerCase() || '';
            const soLo = $group.data('solo')?.toString().toLowerCase() || '';
            const poMua = $group.data('pomua')?.toString().toLowerCase() || '';

            const isMatch = maVT.includes(searchTerm) ||
                soLo.includes(searchTerm) ||
                poMua.includes(searchTerm);

            if (isMatch) {
                $group.show();
                // Tự động mở collapse khi tìm thấy
                $group.find('.collapse').addClass('show');
                visibleCount++;
            } else {
                $group.hide();
            }
        });
    }
}


/// ================== Module khu vực container - kiet - 20260328 ========================
const CO_MAX_COL = 2;
const CELL_WIDTH = 96;
const CELL_HEIGHT = 90;
var MAX_CELL = 6;
/// API
async function shelfOnDragColRow(KeID, rowId, colId) {
    try {
        const url = `/api/ViTriKhoNPL/GetSoDoKhoDragDrop?action=PostCO&para1=${KeID}&para2=${rowId}&para3=${colId}`;
        const response = await fetch(url);
        if (!response.ok) {
            showToast("error", "Lỗi khi di chuyển kệ")
            return;
        }
    } catch (err) {
        showToast("error", "Lỗi khi di chuyển kệ")
    }
}

// Load khu vực container
function LoadAreaContainer() {
    const maxCell = Math.max(...shelfDataCO.map(shelf => shelf.MaxO || 0));
    if (maxCell > 0) MAX_CELL = maxCell;

    const $container = $('#container-khuvuccontainer');
    $container.empty();
    $container.css({
        maxHeight: '1000px',
        flex: '0 0 auto ',
        display: 'grid',
        gridTemplateColumns: `repeat(${CO_MAX_COL}, 1fr)`,
        gap: '0 100px',
        padding: '4px',
        boxSizing: 'border-box',
        alignItems: 'start'
    });

    const allShelves = [...shelfDataCO].sort((a, b) =>
        (a.TenKe || '').localeCompare(b.TenKe || '', 'vi', { numeric: true })
    );

    // Tạo cột
    const colMap = buildColMap(allShelves)

    // Render từng cột
    for (let colId = 1; colId <= CO_MAX_COL; colId++) {
        const $col = $('<div></div>').css({
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            borderLeft: `${colId % 2 == 0 || (colId % 2 != 0 && colId <= CO_MAX_COL) ? '1px solid black' : 'none'}`,
            borderRight: `${colId % 2 != 0 || (colId % 2 == 0 && colId < CO_MAX_COL) ? '1px solid black' : 'none'}`,
            paddingLeft: `${colId % 2 == 0 || (colId % 2 != 0 && colId <= CO_MAX_COL) ? '14px' : 'none'}`,
            paddingRight: `${colId % 2 != 0 || (colId % 2 == 0 && colId < CO_MAX_COL) ? '14px' : 'none'}`
        }).attr('data-col-id', colId);

        const rowMap = colMap[colId];
        const maxRow = getMaxRow(rowMap);
        const allRows = buildRowSequence(rowMap, maxRow);

        const $walkwayDiv = $(`<div data-module="3" class="walkway-horizontal-container"></div>`);

        allRows.forEach(({ rowId, shelf }) => {
            const $wClone = $walkwayDiv.clone();
            // Nếu có thì tạo shelf  bình thường
            if (shelf) {
                const $shelf = buildShelfDiv(shelf);
                const $wrapper = buildRowWrapper(rowId, colId, $shelf);
                $col.append($wrapper).append($wClone);
            }
            // Nếu không thì tạo một row trống  
            else {
                $col.append(buildEmptyRow(rowId, colId));
            }
        });

        $container.append($col);
    }
    syncEmptyRowsBetweenCols();
    setupDropCO();
}

// Tạo cột
function buildColMap(allShelves) {
    const colMap = {};
    for (let c = 1; c <= CO_MAX_COL; c++) colMap[c] = {};

    allShelves.forEach(shelf => {
        const col = parseInt(shelf.ColID);
        const row = parseInt(shelf.RowID);
        const validCol = col >= 1 && col <= CO_MAX_COL;
        const validRow = row > 0;

        if (validCol && validRow) {
            colMap[col][row] = shelf;
        } else {
            const targetCol = getLessPopulatedCol(colMap);
            const nextRow = getMaxRow(colMap[targetCol]) + 1;
            colMap[targetCol][nextRow] = shelf;
            shelfOnDragColRow(shelf.KeID, nextRow, targetCol);
        }
    });

    return colMap;
}

// Lấy cột có ít kệ nhất
function getLessPopulatedCol(colMap) {
    let minCol = 1;
    let minCount = Object.keys(colMap[1]).length;
    for (let c = 1; c <= CO_MAX_COL; c++) {
        const count = Object.keys(colMap[c]).length;
        if (count < minCount) { minCount = count; minCol = c; }
    }
    return minCol;
}

// Lấy row lớn nhất
function getMaxRow(rowMap) {
    const rows = Object.keys(rowMap).map(Number).filter(n => !isNaN(n));
    return rows.length ? Math.max(...rows) : 0;
}

// Tạo cấu trúc row cho cột
function buildRowSequence(rowMap, maxRow) {
    const result = [];

    // build thêm ô trông bên dưới ô cao nhất trong cột
    const totalRow = maxRow + 1;
    for (let r = 1; r <= totalRow; r++) {
        result.push({ rowId: r, shelf: rowMap[r] || null });
    }
    return result;
}

// Tạo kệ 
function buildShelfDiv(shelf) {
    const cellCount = shelf.MaxO || 0;
    const $shelf = $('<div></div>').css({
        display: 'flex',
        flexDirection: 'row',
        border: '1px solid #000',
        position: 'relative',
        width: (cellCount * CELL_WIDTH + 55 + 2) + 'px',
        cursor: 'grab',
        flexShrink: '0'
    }).attr({
        'id': shelf.ID,
        'draggable': 'true',
        'data-module': 3,
        'data-keid': shelf.KeID,
        'data-tenke': shelf.TenKe,
        'data-tenDay': shelf.TenDay,
        'data-modulethucte': shelf.Module
    });

    const $label = $('<div class="cell"></div>').css({
        'display': 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
        'justify-content': 'center',
        'gap': '4px',
        'padding': '4px 2px',
        'min-width': '55px',
        'max-width': '55px',
        'background': `${shelf.Module == 1 ? 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)' : 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)'}`,
        'border-left': shelf.ColID == 1 ? '1px solid black' : 'none',
        'border-right': shelf.ColID == 1 ? 'none' : '1px solid black',
        'flex-shrink': '0',
        'pointer-events': 'none',
        'box-sizing': 'border-box'
    }).html(`

    <span style=" font-size:10px; font-weight:bold; text-align:center; line-height:1.2;"> ${shelf.TenDay.split(" ").slice(1).join(" ")} </span>
   <span style="left: 0px; top: 2px; position: absolute; font-size: 10px; font-weight: bold; text-align: center; color: black; padding: 1px 3px; border-bottom: 1px solid #674e4e; width: 54px;">
        ${shelf.Module == 1 ? "N.Liệu" : "P.Liệu"}
    </span>
    <i class="fa fa-eye" style="position: absolute; top: 0px; right: 2px; z-index: 999; pointer-events: auto; cursor: pointer; font-size: 7px; color: #158ef4; padding: 0 0 10px 10px;"></i>
`);
    $label.find('.fa-eye').on('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        openShelfHorizontalModal(shelf)
    });
    $label[0].style.setProperty('height', `${CELL_HEIGHT}px`, 'important');

    const $cells = $('<div></div>').css({
        'display': 'flex',
        'flex-direction': 'row',
        'flex-shrink': '0',
        'pointer-events': 'none'
    })


    for (let i = 0; i < cellCount; i++) {
        const $cell = $('<div class="cell"></div>').css({
            'width': `${CELL_WIDTH}px`,
            'min-width': `${CELL_WIDTH}px`,
            'max-width': `${CELL_WIDTH}px`,
            'border-left': i === 0 ? 'none' : '1px solid rgba(220,214,214,0.42)',
            'background': `${shelf.Module == 1 ? 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)' : 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)'}`,
            'height': '86px ',
            'box-sizing': 'border-box',
            'pointer-events': 'none'
        })

        $cell[0].style.setProperty('height', `${CELL_HEIGHT}px`, 'important');
        $cells.append($cell);
    }

    if (shelf.ColID == 1) {
        $shelf.append($cells).append($label);
    } else {
        $shelf.append($label).append($cells);
    }



    $shelf.on('dragstart', function (e) {
        window._draggedShelfCO = $shelf;
        draggedKeID = shelf.KeID
        e.originalEvent.dataTransfer.setData('text/plain', shelf.KeID);
        e.originalEvent.dataTransfer.effectAllowed = 'move';
        $shelf.attr('data-dragging', 'true');
    });

    $shelf.on('dragend', function () {
        $shelf.removeAttr('data-dragging');
        $shelf.css('opacity', '');
        window._draggedShelfCO = null;
    });

    $shelf.on('click', function (e) {
        if ($(e.target).closest('.shelf-group-toggle, .shelf-display-content').length) return;
        handleShelfClick(shelf.KeID, shelf.TenKe, shelf.Module);
    });

    return $shelf;
}

// Tạo kệ rỗng
function buildEmptyRow(rowId, colId) {
    return $('<div></div>').css({
        minWidth: `${CELL_WIDTH * MAX_CELL}px`,
        height: `${CELL_HEIGHT}px`,
        border: '1.5px dashed #d1d5db',
        marginBottom: '4px',
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        color: 'black',
        transition: 'background 0.15s, border-color 0.15s'
    }).attr({
        'data-row-id': rowId,
        'data-col-id': colId,
        'data-has-shelf': '0',
        'data-drop-target': '1'
    });
}

// Tạo div bọc bên ngoài kệ để set thông tin id
function buildRowWrapper(rowId, colId, $shelf) {
    const $wrapper = $('<div></div>').css({
        position: 'relative',
        marginBottom: '4px'
    }).attr({
        'data-row-id': rowId,
        'data-col-id': colId,
        'data-has-shelf': '1'
    });
    $wrapper.append($shelf);
    return $wrapper;
}

// Khởi tạo sự kiện drag drop
function setupDropCO() {
    const $container = $('#container-khuvuccontainer');
    $container.off('dragover dragleave drop');
    $container
        .on('dragover', '[data-row-id]', function (e) {
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect = 'move';

            const $over = $(this);
            const $dragged = window._draggedShelfCO;
            if (!$dragged) return;

            // Không highlight chính row đang kéo
            const $sourceRow = $dragged.closest('[data-row-id]');
            if ($sourceRow[0] === $over[0]) return;

            $over.addClass('row-dragover');
        })
        .on('dragleave', '[data-row-id]', function (e) {
            const related = e.originalEvent.relatedTarget;
            if (!related || !$(this).has(related).length) {
                $(this).removeClass('row-dragover');
            }
        })
        .on('drop', '[data-row-id]', function (e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass('row-dragover');

            const $draggedShelf = window._draggedShelfCO;
            if (!$draggedShelf) return;

            const $targetRow = $(this);
            const $sourceRow = $draggedShelf.closest('[data-row-id]');
            if (!$sourceRow.length || $sourceRow[0] === $targetRow[0]) return;

            const targetColId = parseInt($targetRow.attr('data-col-id'));
            const targetRowId = parseInt($targetRow.attr('data-row-id'));
            const sourceColId = parseInt($sourceRow.attr('data-col-id'));
            const sourceRowId = parseInt($sourceRow.attr('data-row-id'));

            const $targetShelf = $targetRow.find('[data-keid]').first();

            const getWalkwayAfter = ($row) => $row.next('[data-module="3"]');

            if ($targetShelf.length) {
                const $placeholder = $('<span>');
                $sourceRow.append($placeholder);
                $targetRow.append($draggedShelf);
                $placeholder.replaceWith($targetShelf);
                $sourceRow.append($targetShelf);

                // Update attributes
                $sourceRow.attr('data-has-shelf', '1').attr('data-drop-target', '0');
                $targetRow.attr('data-has-shelf', '1').attr('data-drop-target', '0');

                shelfOnDragColRow($draggedShelf.data('keid'), targetRowId, targetColId,);
                shelfOnDragColRow($targetShelf.data('keid'), sourceRowId, sourceColId,);
            } else {
                $targetRow
                    .attr('data-has-shelf', '1')
                    .attr('data-drop-target', '0')
                    .empty()
                    .css({ height: '', border: '', display: '', alignItems: '', justifyContent: '' })
                    .append($draggedShelf);


                // Thêm walkway sau target row
                const $newWalkway = $(`<div data-module="3" class="walkway-horizontal-container"></div>`);
                $targetRow.after($newWalkway);

                // Source thành empty row
                getWalkwayAfter($sourceRow).remove();
                $sourceRow
                    .attr('data-has-shelf', '0')
                    .attr('data-drop-target', '1')
                    .empty()
                    .css({
                        height: `${CELL_HEIGHT}px`,
                        border: '1.5px dashed #d1d5db',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    });

                shelfOnDragColRow($draggedShelf.data('keid'), targetRowId, targetColId,);
            }

            ensureEmptyRowAtBottom(targetColId);
            cleanupEmptyRows();

            // Nếu kéo sang cột khác thì cleanup cả cột nguồn
            if (sourceColId !== targetColId) {
                ensureEmptyRowAtBottom(sourceColId);
                cleanupEmptyRows();
            } else {
                // Cùng cột thì chỉ cần cleanup 1 lần
                cleanupEmptyRows(sourceColId);
            }

        });
}

// Thêm row empty sau khi thả vào ô empty
function ensureEmptyRowAtBottom(colId) {
    // Tìm maxRow lớn nhất trong TẤT CẢ các cột
    let globalMaxRow = 0;
    for (let c = 1; c <= CO_MAX_COL; c++) {
        const $colDiv = $(`#container-khuvuccontainer > [data-col-id="${c}"]`);
        const $rows = $colDiv.children('[data-row-id]');
        $rows.each(function () {
            const r = parseInt($(this).attr('data-row-id'));
            if (r > globalMaxRow) globalMaxRow = r;
        });
    }

    // Với mỗi cột, thêm empty row cho đến khi đủ globalMaxRow + 1
    for (let c = 1; c <= CO_MAX_COL; c++) {
        const $colDiv = $(`#container-khuvuccontainer > [data-col-id="${c}"]`);

        // Lấy maxRow hiện tại của cột này
        let currentMax = 0;
        $colDiv.children('[data-row-id]').each(function () {
            const r = parseInt($(this).attr('data-row-id'));
            if (r > currentMax) currentMax = r;
        });

        // Thêm empty row cho đến khi bằng globalMaxRow + 1
        for (let r = currentMax + 1; r <= globalMaxRow + 1; r++) {
            $colDiv.append(buildEmptyRow(r, c));
        }
    }
}

// Xóa row empty sau khi drop
function cleanupEmptyRows() {
    let globalMaxShelfRow = 0;
    for (let c = 1; c <= CO_MAX_COL; c++) {
        const $colDiv = $(`#container-khuvuccontainer > [data-col-id="${c}"]`);
        $colDiv.children('[data-has-shelf="1"]').each(function () {
            const r = parseInt($(this).attr('data-row-id'));
            if (r > globalMaxShelfRow) globalMaxShelfRow = r;
        });
    }

    for (let c = 1; c <= CO_MAX_COL; c++) {
        const $colDiv = $(`#container-khuvuccontainer > [data-col-id="${c}"]`);
        const $emptyRows = $colDiv.children('[data-has-shelf="0"]');

        $emptyRows.each(function () {
            const r = parseInt($(this).attr('data-row-id'));
            if (r > globalMaxShelfRow + 1) {
                $(this).remove();
            }
        });

        reIndexRows(c);
    }
}

// reset index cho các row
function reIndexRows(colId) {
    const $colDiv = $(`#container-khuvuccontainer > [data-col-id="${colId}"]`);
    const $rows = $colDiv.children('[data-row-id]');

    // Sắp xếp lại theo rowId hiện tại rồi gán lại index từ 1
    const rowsSorted = [];
    $rows.each(function () {
        rowsSorted.push($(this));
    });
    rowsSorted.sort((a, b) =>
        parseInt(a.attr('data-row-id')) - parseInt(b.attr('data-row-id'))
    );

    rowsSorted.forEach(($row, index) => {
        $row.attr('data-row-id', index + 1);
        $row.attr('data-col-id', colId);
    });
}

// Tạo row empty đều với max row trong ô
function syncEmptyRowsBetweenCols() {

    let globalMaxTotalRows = 0;
    for (let c = 1; c <= CO_MAX_COL; c++) {
        const $colDiv = $(`#container-khuvuccontainer > [data-col-id="${c}"]`);
        const totalRows = $colDiv.children('[data-row-id]').length;
        if (totalRows > globalMaxTotalRows) globalMaxTotalRows = totalRows;
    }

    for (let c = 1; c <= CO_MAX_COL; c++) {
        const $colDiv = $(`#container-khuvuccontainer > [data-col-id="${c}"]`);
        const currentTotal = $colDiv.children('[data-row-id]').length;

        for (let i = currentTotal + 1; i <= globalMaxTotalRows; i++) {
            $colDiv.append(buildEmptyRow(i, c));
        }
    }
}

/// Kiệt - 20260403 - Hiệu Suất ô
/// Api-3
let dataCBMKe = [];
let tongCBMDayNL, tongCBMDayNLDaSuDung;
let tongCBMDayPL, tongCBMDayPLDaSuDung;
function renderBoxCBM(elementId, used, total) {
    const pct = total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0;
    let color, colorPct;
    if (pct >= 100) {
        color = '#cc0014b0';
        colorPct = "#cc0014";
    } else if (pct >= 50) {
        color = '#f87200b0';
        colorPct = "#f87200";
    } else if (pct >= 20) {
        color = 'rgb(27 176 203 / 85%)';
        colorPct = "rgb(27 176 203)";
    }
    else {
        color = 'rgb(0 154 83 / 85%)';
        colorPct = "rgb(0 154 83)";
    }

    $(`#${elementId}`).html(`
        <span style="color:#888;">Hiệu Suất: </span>
        <span style="color:${color}; font-weight:500;">${parseFloat(used).toLocaleString()}<span style="font-weight:bold !important;font-size:13px; color: ${colorPct} !important"> (${pct}%)</span></span>
        <span style="color:#888; font-size:11px;"> / </span>
        <span style="color:#cf3645;font-weight:500">${parseFloat(total).toLocaleString()} </span>
        <span style="color:#888;"> (CBM)</span>
    `);
}
function renderTongKhoCBM(used, total) {
    const pct = total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0;
    let color;
    if (pct >= 100) {
        color = '#cc0014b0';
        colorPct = "#cc0014";
    } else if (pct >= 50) {
        color = '#f87200b0';
        colorPct = "#f87200";
    } else if (pct >= 20) {
        color = 'rgb(27 176 203 / 85%)';
        colorPct = "rgb(27 176 203)";
    }
    else {
        color = 'rgb(0 154 83 / 85%)';
        colorPct = "rgb(0 154 83)";
    }

    $(`#container-tong-hieu-suat`).html(`
        <span style="color:#888;">Tổng Kho: </span>
        <span style="color:${color}; font-weight:500;">${parseFloat(used).toLocaleString()}<span style="font-weight:bold !important;font-size:13px;color: ${colorPct} !important"> (${pct}%)</span></span>
        <span style="color:#888; font-size:11px;">/ </span>
        <span style="color:#cf3645;font-weight:500">${parseFloat(total).toLocaleString()} </span>
        <span style="color:#888;"> (CBM)</span>
    `);
}
async function GetCBMKe() {
    try {
        const url = `/api/ViTriKhoNPL/GetSoDoKhoDragDrop?action=GetCBMKe`;
        const response = await fetch(url);

        dataCBMKe = await response.json();
        tongCBMDayNL = dataCBMKe
            .filter(data => data.Module == 1)
            .reduce((sum, data) => sum + data.TongCBMTrongKe, 0)

        tongCBMDayNLDaSuDung = dataCBMKe
            .filter(data => data.Module == 1)
            .reduce((sum, data) => sum + data.TongCBMSuDungTrongKe, 0)

        tongCBMDayPL = dataCBMKe
            .filter(data => data.Module == 2)
            .reduce((sum, data) => sum + data.TongCBMTrongKe, 0)

        tongCBMDayPLDaSuDung = dataCBMKe
            .filter(data => data.Module == 2)
            .reduce((sum, data) => sum + data.TongCBMSuDungTrongKe, 0)


        renderBoxCBM('boxHieuSuatNL', tongCBMDayNLDaSuDung, tongCBMDayNL);
        renderBoxCBM('boxHieuSuatPL', tongCBMDayPLDaSuDung, tongCBMDayPL);

        const tongCBMKhoSuDung = tongCBMDayNLDaSuDung + tongCBMDayPLDaSuDung
        const tongCBMKho = tongCBMDayNL + tongCBMDayPL
        renderTongKhoCBM(tongCBMKhoSuDung, tongCBMKho)
    } catch (err) {
        console.error(err)
    }
}
/// Event-3
$(document).ready(function () {
    GetCBMKe()
})
$(function () {
    $("#cbShowColor").on("change", function () {
        const isChecked = $(this).prop("checked");
        showHieuSuatKe(isChecked);
    });
})

function showHieuSuatKe(isShow) {
    $('#materialArea .shelf, #container-khuvucphulieu .shelf, .walkway .shelf, .walkway-horizontal .shelf').each(function () {
        const keID = $(this).data('keid');
        const module = parseInt($(this).attr('data-module')) || 1;
        const isIncludesN = (dataDanhSachKe.find(item => item.KeID == keID).TenDay.toLowerCase() || "").includes('n');

        // Xóa fill cũ trước
        $(this).find('.cell').css({
            'background': `${isIncludesN ? GRADIENTS.COLOR_NDAY : GRADIENTS.COLOR_NORMAL}`,
        });

        if (!isShow) return;

        const keData = dataCBMKe.find(x => x.KeID === keID && x.Module === module);
        if (!keData) return;

        const usedPct = module == 1
            ? Math.min(Math.round((tongCBMDayNLDaSuDung / tongCBMDayNL) * 100), 100)
            : Math.min(Math.round((tongCBMDayPLDaSuDung / tongCBMDayPL) * 100), 100)

        // Màu theo mức độ đã dùng
        let color;
        if (usedPct >= 100) color = 'linear-gradient(45deg, #ffb3ba, #fc3347)';   // đỏ - đầy
        else if (usedPct >= 50) color = 'linear-gradient(45deg, rgb(255 236 221), rgb(255, 142, 69))';  // Cam
        else if (usedPct >= 20) color = 'linear-gradient(45deg, rgb(189 244 255), rgb(43, 204, 234))';  // Xanh dương
        else color = 'linear-gradient(45deg, rgb(200 245 225), rgb(9, 255, 140))';   // Xanh lá

        $(this).find('.cell').css({
            'background': color,
            'border': '1px solid rgba(0,0,0,0.1)'
        });

    });
}

/// Modal Cho kệ nằm ngang
function openShelfHorizontalModal(shelf, type = 1) {
    $("#shelfItemBadge").text(type == 1 ? shelf.TenKe : `ô ${shelf.TenO}`);

    var khuVucStyle = "rgba(255, 255, 255, 0.2);";
    var khuVucText = "";
    if (type == 1) {
        if (shelf.Module == 1 && !(shelf.TenDay.toLowerCase() || "").includes('co')) {
            khuVucText = "Khu vực Nguyên Liệu";
            khuVucStyle = "background:#e2eaeb;color:#2d4a4b;border:1px solid #94adb0;";
        } else if (shelf.Module == 2 && !(shelf.TenDay.toLowerCase() || "").includes('co')) {
            khuVucText = "Khu vực Phụ Liệu";
            khuVucStyle = "background:#e2eaeb;color:#2d4a4b;border:1px solid #94adb0;";
        } else if (shelf.Module == 1 && (shelf.TenDay.toLowerCase() || "").includes('co')) {
            khuVucStyle = "background:#fef9c3;color:#854d0e;border:1px solid #fde047;";
            khuVucText = "Khu vực Container - NL";

        } else if (shelf.Module == 2 && (shelf.TenDay.toLowerCase() || "").includes('co')) {
            khuVucStyle = "background:rgb(243, 229, 245);color:rgb(163 97 175);border:1px solid #fde047;";
            khuVucText = "Khu vực Container - PL";
        }
    } else if (type == 2) {
        if (shelf.Module == 1 && shelf.TenO.toLowerCase() || "") {
            khuVucText = "Khu vực Nguyên Liệu";
            khuVucStyle = "background:#e2eaeb;color:#2d4a4b;border:1px solid #94adb0;";
        } else if (shelf.Module == 2 && shelf.TenO.toLowerCase() || "") {
            khuVucText = "Khu vực Phụ Liệu";
            khuVucStyle = "background:#e2eaeb;color:#2d4a4b;border:1px solid #94adb0;";
        }
    }
    const maVTs = shelf.MaVTChiTiet?.split(',').filter(x => x.trim());
    const khachHangs = shelf.KhachHang?.split(',').filter(x => x.trim());
    const stepKH = type == 1 ? 5 : 5
    const stepIC = type == 1 ? 1 : 1

    const groupedKH = [];
    for (let i = 0; i < khachHangs.length; i += stepKH) {
        groupedKH.push(khachHangs.slice(i, i + stepKH).join(', '));
    }

    const groupedIC = [];
    for (let i = 0; i < maVTs.length; i += stepIC) {
        groupedIC.push(maVTs.slice(i, i + stepIC).join(', '));
    }

    $("#badgeItemCount").text(`${maVTs.length}`)
    $("#badgeKhachHangCount").text(`${khachHangs.length}`)
    $("#shelfKhuVucBadge").text(khuVucText).attr("style", `font-size:12px;font-weight:500;border-radius:20px;padding:5px 10px;${khuVucStyle}`);

    $("#paneItemCode").html(groupedIC.map(item => `
    <div class="d-flex align-items-center gap-2 py-2 border-bottom">
        <div class="flex-grow-1">
            <div style="font-size:13px;font-weight:500;padding-left: 12px">  ${item ? '+ ' + item : ''}</div>
        </div>
    </div>
    `).join(''));

    // Khách hàng
    $("#paneKhachHang").html(groupedKH.map(kh => `
    <div class="d-flex align-items-center gap-2 py-2 border-bottom">
        <div style="font-size:13px;font-weight:500;padding-left: 12px"> ${kh ? '+ ' + kh : ''}</div>
    </div>
    `).join(''));

    $("#collapseKhachHang").addClass("show");
    $("#collapseItemCode").addClass("show");
    $("#shelfHorizontalModal").modal("show")
}