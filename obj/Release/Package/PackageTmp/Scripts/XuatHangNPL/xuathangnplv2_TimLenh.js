


// ========== HÀM TIỆN ÍCH ==========
function renderNull(val) {
    if (val === null || val === undefined || val === "NULL" || val === "") {
        return '<span class="empty">—</span>';
    }
    return val;
}
function formatDate(value) {
    if (value === null || value === undefined || value === "" || value === "NULL") {
        return '<span class="empty">—</span>';
    }

    return moment(value).format("DD/MM/YYYY");
}


function hienThiKetQua(item) {
    $("#notFound").hide();
    $("#resultGrid").hide();

    if (!item) {
        $("#notFound").fadeIn(200);
        return;
    }

    $("#r-module").html(renderNull(item.Module));
    $("#r-trangthai").html(renderNull(item.TrangThai));
    $("#r-malenh").html(renderNull(item.MaLenh));
    $("#r-thoatchuyen").html(formatDate(item.ThoatChuyen));
    $("#r-khcat").html(formatDate(item.KHCat));
    $("#r-khlt").html(formatDate(item.KHLapTrinh));
    $("#r-khmay").html(formatDate(item.KHMay));

    $("#resultGrid").fadeIn(200);
}

// ========== SỰ KIỆN ==========
$(function () {
    $("#btnMoModal").on("click", function () {
        new bootstrap.Modal(document.getElementById("modalTimLenh")).show();
    });

    $("#btnTim").on("click", async function () {
        var ma = $("#inputMaLenh").val().trim();
        $("#resultGrid").hide();
        $("#notFound").hide();
        if (!ma) return;
        const data = await timLenhAPI(ma);
        if (data && data.length > 0) {
            hienThiKetQua(data[0]);
        } else {
            hienThiKetQua(null);
        }
    });

    $("#inputMaLenh").on("keydown", function (e) {
        if (e.key === "Enter") $("#btnTim").trigger("click");
    });

    $("#modalTimLenh").on("hidden.bs.modal", function () {
        $("#inputMaLenh").val("");
        $("#resultGrid").hide();
        $("#notFound").hide();
    });
});

// ========== GỌI API THỰC TẾ (thay thế DATA mẫu) ==========
async function timLenhAPI(ma) {
    var url = `/api/PhieuXuatHangNPL/Get?Action=SearchLenh&para1=${ma}`;
    const response = await fetch(url)
    const data = await response.json();
    return data
}