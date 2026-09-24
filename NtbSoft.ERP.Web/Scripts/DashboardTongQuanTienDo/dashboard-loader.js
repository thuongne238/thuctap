/**
 * ==========================================================================
 * NTBSOFT ERP - COMPONENT LOADING DÙNG CHUNG (DASHBOARD LOADER)
 * File: dashboard-loader.js
 * Thư mục: Scripts/DashboardTongQuanTienDo/
 * 
 * Tính năng:
 * - Hiển thị vòng xoay loading đẹp mắt, mượt mà chuẩn ERP cho bất kỳ container nào
 *   (Bảng lưới, biểu đồ tròn, biểu đồ heatmap, thẻ KPI, hoặc cả tab).
 * - Tự động thiết lập backdrop mờ chống tương tác khi đang nạp dữ liệu.
 * - Hỗ trợ các kích thước: 'sm', 'md', 'lg'.
 * - Tự động dọn dẹp khi dữ liệu load xong hoặc lỗi.
 * 
 * Cách dùng:
 *   // 1. Bật loading:
 *   DashboardLoader.show('#grid-orders-container', { 
 *       text: 'Đang nạp danh sách đơn hàng...', 
 *       subtext: 'Trích xuất từ kế hoạch sản xuất',
 *       size: 'md' 
 *   });
 * 
 *   // 2. Tắt loading:
 *   DashboardLoader.hide('#grid-orders-container');
 * ==========================================================================
 */
(function (window, $) {
    'use strict';

    const DashboardLoader = {
        /**
         * Hiển thị loading spinner vào một container cụ thể
         * @param {string|HTMLElement|jQuery} target - Selector hoặc element container
         * @param {Object} [options] - Cấu hình { text, subtext, size: 'sm'|'md'|'lg', minHeight }
         */
        show: function (target, options) {
            if (!target) return;
            const $target = $(target);
            if ($target.length === 0) return;

            const opts = $.extend({
                text: '', // Mặc định không hiển thị text, chỉ hiển thị vòng xoay spinner
                subtext: '',
                size: 'md', // 'sm' | 'md' | 'lg'
                minHeight: 100
            }, options || {});

            $target.each(function () {
                const $el = $(this);

                // Tránh tạo nhiều loader trùng nhau trên cùng 1 container
                let $overlay = $el.children('.dash-loader-overlay');
                if ($overlay.length > 0) {
                    if (opts.text) {
                        $overlay.find('.dash-loader-text').text(opts.text).show();
                    } else {
                        $overlay.find('.dash-loader-text').hide();
                    }
                    if (opts.subtext) {
                        $overlay.find('.dash-loader-subtext').text(opts.subtext).show();
                    } else {
                        $overlay.find('.dash-loader-subtext').hide();
                    }
                    $overlay.addClass('active');
                    return;
                }

                // Đảm bảo container có position relative để overlay bám chuẩn
                const currentPos = $el.css('position');
                if (!currentPos || currentPos === 'static') {
                    $el.addClass('dash-loader-relative');
                }

                // Nếu container chưa có chiều cao (rỗng khi mới mở), set min-height tạm thời
                if ($el.height() < opts.minHeight) {
                    $el.data('prev-min-height', $el.css('min-height'));
                    $el.css('min-height', opts.minHeight + 'px');
                }

                const textHtml = opts.text ? `<div class="dash-loader-text">${opts.text}</div>` : '';
                const subtextHtml = opts.subtext ? `<div class="dash-loader-subtext">${opts.subtext}</div>` : '';
                const overlayHtml = `
                    <div class="dash-loader-overlay">
                        <div class="dash-loader-card">
                            <div class="dash-loader-spinner size-${opts.size}"></div>
                            ${textHtml}
                            ${subtextHtml}
                        </div>
                    </div>
                `;

                $overlay = $(overlayHtml).appendTo($el);
                
                // Trigger animation fade-in mượt mà
                requestAnimationFrame(() => {
                    $overlay.addClass('active');
                });
            });
        },

        /**
         * Ẩn và gỡ bỏ loading khỏi container
         * @param {string|HTMLElement|jQuery} target - Selector hoặc element container
         */
        hide: function (target) {
            if (!target) return;
            const $target = $(target);
            if ($target.length === 0) return;

            $target.each(function () {
                const $el = $(this);
                const $overlay = $el.children('.dash-loader-overlay');
                if ($overlay.length === 0) return;

                $overlay.removeClass('active');
                setTimeout(() => {
                    $overlay.remove();
                    // Khôi phục min-height nếu trước đó bị can thiệp
                    if ($el.data('prev-min-height') !== undefined) {
                        $el.css('min-height', $el.data('prev-min-height') || '');
                        $el.removeData('prev-min-height');
                    }
                    $el.removeClass('dash-loader-relative');
                }, 200);
            });
        },

        /**
         * Bọc tự động quanh 1 Promise hoặc ajax request (tự show khi bắt đầu, tự hide khi xong)
         */
        wrap: function (target, promise, options) {
            this.show(target, options);
            if (promise && typeof promise.always === 'function') {
                promise.always(() => this.hide(target));
            } else if (promise && typeof promise.finally === 'function') {
                promise.finally(() => this.hide(target));
            }
            return promise;
        }
    };

    // Xuất ra phạm vi toàn cục
    window.DashboardLoader = DashboardLoader;

})(window, window.jQuery || window.$);
