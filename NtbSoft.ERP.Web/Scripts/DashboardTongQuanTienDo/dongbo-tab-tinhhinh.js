/**
 * ==========================================================================
 * NTBSOFT ERP - MODULE TAB 1: TÌNH HÌNH SẢN XUẤT
 * File: dongbo-tab-tinhhinh.js
 * Quản lý toàn bộ logic nghiệp vụ riêng của Tab 1:
 * - Liên kết widget tiến độ 5 cột và luồng 7 công đoạn (từ tongQuanApp)
 * - Cập nhật 4 thẻ thống kê KPI
 * - Xử lý làm mới dữ liệu & thay đổi khoảng thời gian lọc
 * ==========================================================================
 */
(function (window, $) {
    'use strict';

    const TabTinhHinhModule = {
        // Khởi tạo tab
        init: function () {
            console.log('[TabTinhHinh] Khởi tạo Tab Tình hình sản xuất');
        },

        // Kích hoạt khi người dùng chuyển sang Tab Tình hình
        activate: function () {
            if (window.tongQuanApp && window.tongQuanApp.widgetInstance && typeof window.tongQuanApp.widgetInstance.refresh === 'function') {
                window.tongQuanApp.widgetInstance.refresh();
            }
        },

        // Làm mới dữ liệu khi bấm nút Refresh hoặc đổi DateRange
        reload: function (startDate, endDate) {
            if (window.tongQuanApp && typeof window.tongQuanApp.reloadAll === 'function') {
                if (startDate && endDate) {
                    window.tongQuanApp.startDate = startDate;
                    window.tongQuanApp.endDate = endDate;
                }
                window.tongQuanApp.reloadAll();
            }
        }
    };

    // Xuất module ra window toàn cục
    window.TabTinhHinhModule = TabTinhHinhModule;

    $(document).ready(function () {
        TabTinhHinhModule.init();
    });

})(window, window.jQuery || window.$);
