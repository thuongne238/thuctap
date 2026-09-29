# HƯỚNG DẪN SỬ DỤNG DEVEXTREME DETAIL GRID COMPONENT

Bộ thư viện component Grid DevExtreme hỗ trợ bấm vào dòng hiển thị Popup chi tiết (Master-Detail Modal), được thiết kế linh hoạt, dễ tái sử dụng cho nhiều nghiệp vụ khác nhau trong hệ thống NTBSoft ERP.

---

## 1. Cấu trúc thư mục

```
NtbSoft.ERP.Web/
├── css/
│   └── griddevextreme/
│       └── dx-detail-grid.css           <-- Stylesheet giao diện chuẩn ERP
└── Scripts/
    └── griddevextreme/
        ├── dx-detail-grid-component.js  <-- Component lõi (Core)
        ├── npl-grid-component.js        <-- Component mẫu: Tình hình Nguyên Phụ Liệu
        ├── po-grid-component.js         <-- Component mẫu: Tiến độ Giao Hàng PO
        └── README.md                    <-- Tài liệu hướng dẫn
```

---

## 2. Cách nạp thư viện vào View (.cshtml)

Trong View Razor của bạn:

```html
@section css {
    <!-- DevExtreme CSS (nếu layout chưa có) -->
    <link rel="stylesheet" href="~/Content/plugins/DevExtreme/dx.common.css" />
    <link rel="stylesheet" href="~/Content/plugins/DevExtreme/dx.light.css" />

    <!-- CSS của Component Grid -->
    <link rel="stylesheet" href="~/css/griddevextreme/dx-detail-grid.css" />
}

<!-- Vùng hiển thị Grid -->
<div id="container-npl"></div>

@section scripts {
    <!-- DevExtreme JS (nếu layout chưa có) -->
    <script src="~/Scripts/dx.all.js"></script>

    <!-- Component Script -->
    <script src="~/Scripts/griddevextreme/dx-detail-grid-component.js"></script>
    <script src="~/Scripts/griddevextreme/npl-grid-component.js"></script>
}
```

---

## 3. Khởi tạo nhanh chỉ với 1 dòng JavaScript

### Cách 1: Sử dụng Component đóng gói sẵn (ví dụ NPL)
```javascript
$(document).ready(function () {
    // Khởi tạo hiển thị dữ liệu mockup
    const nplGrid = window.initNplGridComponent('#container-npl');
});
```

---

## 4. Cách tích hợp kết nối Database sau này (Web API / Controller)

Khi có API từ Controller C#, bạn chỉ cần truyền API URL hoặc hàm Ajax vào:

```javascript
const nplGrid = window.initNplGridComponent('#container-npl', {
    // 1. Lấy dữ liệu bảng chính từ Database API
    dataSource: new DevExpress.data.CustomStore({
        key: 'id',
        load: function () {
            return $.getJSON('/api/DashboardTongQuanTienDo/GetDanhSachLoaiNPL');
        }
    }),

    // 2. Lấy dữ liệu chi tiết khi bấm vào 1 dòng NPL
    detailConfig: {
        loadDetail: function (row) {
            return $.ajax({
                url: '/api/DashboardTongQuanTienDo/GetChiTietNPL',
                type: 'GET',
                data: { loaiNPL: row.loaiNPL },
                dataType: 'json'
            });
        }
    }
});
```

---

## 5. Tự tạo một Grid Component mới hoàn toàn bằng `DxDetailGridComponent`

Bạn có thể tự tạo bất kỳ grid nghiệp vụ nào theo mẫu sau:

```javascript
const myGrid = new window.DxDetailGridComponent({
    containerId: '#my-grid-container',
    title: 'DANH SÁCH ĐƠN HÀNG',
    allowFullscreen: true,
    dataSource: [ ... ], // hoặc url API
    columns: [
        { dataField: 'maDonHang', caption: 'MÃ ĐƠN HÀNG' },
        { dataField: 'khachHang', caption: 'KHÁCH HÀNG' },
        { dataField: 'soLuong', caption: 'SỐ LƯỢNG', alignment: 'right' }
    ],
    detailConfig: {
        getTitle: (row) => `Chi tiết đơn hàng: ${row.maDonHang}`,
        getKpiCards: (row) => [
            { label: 'KHÁCH HÀNG', value: row.khachHang },
            { label: 'TỔNG SỐ LƯỢNG', value: row.soLuong }
        ],
        loadDetail: (row) => {
            // Trả về mảng hoặc Promise/Ajax
            return $.getJSON('/api/DonHang/GetChiTiet', { id: row.id });
        },
        columns: [
            { dataField: 'stt', caption: 'STT', width: 50 },
            { dataField: 'size', caption: 'SIZE' },
            { dataField: 'mau', caption: 'MÀU' },
            { dataField: 'sl', caption: 'SỐ LƯỢNG', alignment: 'right' }
        ],
        groupOptions: [
            { label: 'Chi tiết (Không gom)', value: '' },
            { label: 'Gom theo Màu', value: 'mau' }
        ]
    }
});
```
