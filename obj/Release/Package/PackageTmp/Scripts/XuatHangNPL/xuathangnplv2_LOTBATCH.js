let lotData = [];
let lotFiltered = [];
let lotSelected = null;
let lotPending = null;
let isFirstChange = true;
let defaultLot;
function openModalChonLot(maVT, dsLot) {
    lotData = dsLot;
    lotFiltered = [...dsLot];
    lotSelected = null;
    lotPending = null;
    isFirstChange = true;

    $('#lotModalMaVT').text(maVT);
    $('#lotModalCount').text(dsLot.length);
    $('#lotModalSearch').val('');

    // Auto-select dòng có CheckLotCurrent = 1
    defaultLot = dsLot.find(l => l.CheckLotCurrent === 1);
    if (defaultLot) {
        //lotSelected = defaultLot;
        updateSelectedInfo(defaultLot);
        $('#btnChonLotXacNhan').prop('disabled', false);
    } else {
        $('#lotModalSelectedInfo').html('<i class="ti ti-info-circle"></i> Chưa chọn LOT nào');
        $('#btnChonLotXacNhan').prop('disabled', true);
    }

    renderLotModal(lotFiltered);
    $('#myModalChonLot').modal('show');
}

function renderLotModal(list) {
    if (!list.length) {
        $('#lotModalList').html(`
      <div class="text-center text-muted py-4" style="font-size:13px;">
        <i class="ti ti-mood-empty d-block mb-1" style="font-size:22px;"></i>
        Không tìm thấy LOT nào
      </div>`);
        return;
    }

    const activeLot = isFirstChange ? defaultLot : lotPending;

    const html = list.map(l => {

        const isSel = (l === activeLot);
        const tenLo = 'LOT/BATCH: ' + l.LotBatch;
        return `
      <div class="lot-item d-flex align-items-center gap-2 border rounded p-2"
           style="cursor:pointer; transition:.15s;
                  border-color:${isSel ? '#0d6efd' : ''} !important;
                  background:${isSel ? '#e8f0fe' : ''};"
           onclick="selectLotModal(${lotData.indexOf(l)})">

        <div class="rounded-circle border d-flex align-items-center justify-content-center flex-shrink-0"
             style="width:18px;height:18px;
                    background:${isSel ? '#0d6efd' : ''};
                    border-color:${isSel ? '#0d6efd' : '#adb5bd'} !important;">
          ${isSel ? '<i class="ti ti-check" style="font-size:10px;color:#fff;"></i>' : ''}
        </div>

        <div class="flex-grow-1 min-width-0">
         <div class="d-flex align-items-center gap-2 flex-wrap">
            <span class="text-muted" style="font-size:12px;">${tenLo}</span>
         
          </div>
          <div class="d-flex gap-3 mt-1 flex-wrap" style="font-size:11px;color:#6c757d;">
            <span><i class="ti ti-calendar"></i> ${l.NgayNhapKho}</span>
            <span><i class="ti ti-palette"></i> ${l.MauVT}</span>
            <span><i class="ti ti-resize"></i> ${l.KhoVai}</span>
          </div>
        </div>
        <div class="d-flex gap-2 flex-shrink-0">
          <div class="text-center rounded px-2 py-1"
               style="min-width:64px;font-size:10px;
                      background:${isSel ? '#0d6efd' : '#e8f0fe'};
                      color:${isSel ? '#fff' : '#0d6efd'};">
            SL tồn
            <div style="font-size:13px;font-weight:500;">${l.SLTT.toLocaleString('vi-VN')} ${l.TenDVVT}</div>
          </div>
        </div>

      </div>`;
    }).join('');

    $('#lotModalList').html(html);
}

function selectLotModal(idx) {
    isFirstChange = false;
    lotPending = lotData[idx];
    updateSelectedInfo(lotPending);
    $('#btnChonLotXacNhan').prop('disabled', false);
    renderLotModal(lotFiltered);
}

function updateSelectedInfo(l) {
    const tenLo = 'LOT/BATCH: ' + l.LotBatch;
    $('#lotModalSelectedInfo').html(
        `<i class="ti ti-check text-success"></i>
     Đã chọn: <strong>${tenLo}</strong>
     — Tồn: <strong>${l.SLTT.toLocaleString('vi-VN')} ${l.TenDVVT}</strong>
     — ${l.ItemCode}`
    );
}

// Khi xác nhận
$('#btnChonLotXacNhan').on('click', function () {
    const confirmed = lotPending || (isFirstChange ? defaultLot : null);
    if (!confirmed) return;

    lotSelected = confirmed;
    $('#myModalChonLot').modal('hide');
    onLotSelected(lotSelected);
});

function onLotSelected(lot) {
    if ($('#modalPhieuXaVai').hasClass('show')) {
        if (pendingBarcodeData) {
            if (lot.LotBatch === pendingBarcodeData.LotBatch) {
                pendingBarcodeData = null;
                GetVTBarCodeXoVai(barcodeLocal);
            } else {

                showToast("warning", `LOT/BATCH vừa chọn (${lot.LotBatch}) khác với barcode vừa quét (${pendingBarcodeData.LotBatch})`);
                pendingBarcodeData = null;
            }
        }
        lastScannedCode = null;
        return;
    } else {
        if (pendingBarcodeData) {
            if (lot.LotBatch === pendingBarcodeData.LotBatch) {
                GetVTBarCode(barcodeLocal, checkSaveForm)
            } else {

                showToast("warning", `LOT/BATCH vừa chọn (${lot.LotBatch}) khác với barcode vừa quét (${pendingBarcodeData.LotBatch})`);
                pendingBarcodeData = null;
            }
        }

    }
    showToast("success", `Bạn đã chọn LOT/BATCH: ${lot.LotBatch}`);
    lastScannedCode = null;
}

async function ChooseLotBatch(barcode) {

    var url = `/api/PhieuXuatHangNPL/GetV2?Action=GetChonLOTBatch&para1=${barcode}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const data = await response.json();
        //openModalChonLot("12345", data);

        return data
    } catch (error) {
        console.error(error.message);
    }
}

$('#btnResetLenhCapPhat, #btnReset').on('click', showModalResetLot);

function showModalResetLot() {
    if (!lotSelected) {
        showToast("warning", "Hiện tại không có LOT/BATCH để reset");
        return;
    }

    const tenLo = 'LOT/BATCH: ' + lotSelected.LotBatch;

    $('#txtResetLotMessage').html(`
        Bạn có chắc muốn reset LOT/BATCH đang chọn hiện tại
        <strong class="text-primary">${tenLo}</strong> không?
        <br>
        Sau khi reset, hệ thống sẽ yêu cầu chọn lại LOT/BATCH.
    `);

    $('#myModalXacNhanReset').modal('show');
}

$('#btnConfirmResetLot').on('click', function () {
    lotSelected = null;
    $('#myModalXacNhanReset').modal('hide');
    
    if (dataXH.length > 0)
        GetXuatHangItemCode()
    dataXH = []
    renderTableXuatHang(dataXH);
});

async function GetLengthMaNPLBatchLot(barcode, dsBarCodeDaQuet, maNPL) {
    try {
        const url = `/api/PhieuXuatHangNPL/GetV2?action=GetLengthMaNPLBatchLot&para1=${barcode}&para2=${dsBarCodeDaQuet}&para6=${maNPL}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error.message);
    }
}