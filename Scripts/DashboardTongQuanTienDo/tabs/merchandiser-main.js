// IIFE to avoid global namespace pollution
(function () {
    // Read from split global data store
    const DATASETS = window.DASHBOARD_DATA ? window.DASHBOARD_DATA.datasets : {};

    // ECharts Global Instances
    let revenueChart = null;
    let purchaseChart = null;
    let customerChart = null;
    let ganttChart = null;
    let wipChart = null;

    // Active Database State
    let activeSource = 'sql'; // 'mock' or 'sql'
    let isRevenueCumulative = false;
    let lastRemPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;
    let resizeFrameId = null;

    // Dynamic Marquee Initializer
    function initializeMarquees() {
        const wrappers = document.querySelectorAll('.marquee-wrapper');
        wrappers.forEach(wrapper => {
            const content = wrapper.querySelector('.marquee-content');
            if (!content) return;

            wrapper.classList.remove('active');
            content.style.setProperty('--scroll-x', '0px');

            const containerWidth = wrapper.clientWidth;
            const contentWidth = content.scrollWidth;

            if (contentWidth - containerWidth > 1) {
                const scrollDist = contentWidth - containerWidth;
                content.style.setProperty('--scroll-x', `-${scrollDist}px`);
                wrapper.classList.add('active');
                const text = content.innerText.trim();
                if (text) {
                    wrapper.setAttribute('title', text);
                }
            } else {
                wrapper.removeAttribute('title');
                content.removeAttribute('title');
            }
        });
    }

    function handleWheelForward(e) {
        e.preventDefault();
        const canvasEl = document.querySelector('#gantt-chart-canvas div') || document.querySelector('#gantt-chart-canvas canvas');
        if (canvasEl) {
            canvasEl.dispatchEvent(new WheelEvent('wheel', {
                deltaX: e.deltaX,
                deltaY: e.deltaY,
                deltaZ: e.deltaZ,
                deltaMode: e.deltaMode,
                bubbles: true,
                cancelable: true
            }));
        }
    }

    // Gantt Row HTML Overlay Generator using absolute positioning based on ECharts coordinates
    function renderGanttHtmlOverlay(ganttData) {
        const rowsContainer = document.getElementById('gantt-overlay-rows');
        if (!rowsContainer || !ganttChart) return;

        rowsContainer.innerHTML = '';

        // Calculate dynamic row height
        let rowHeight = 52; // Default fallback
        try {
            if (ganttData.length > 1) {
                const y0 = ganttChart.convertToPixel({ yAxisIndex: 0 }, 0);
                const y1 = ganttChart.convertToPixel({ yAxisIndex: 0 }, 1);
                rowHeight = Math.abs(y1 - y0);
            }
        } catch (e) {
            // ECharts might not be fully initialized yet
        }

        const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;
        const gridTop = 4 * remPx; // matching ECharts grid top
        const canvasHeight = ganttChart.getHeight();
        const gridBottom = canvasHeight - 30; // matching ECharts grid bottom

        ganttData.forEach((item, index) => {
            let yCenter;
            try {
                yCenter = ganttChart.convertToPixel({ yAxisIndex: 0 }, index);
            } catch (e) {
                return; // Skip if ECharts cannot convert yet
            }

            // Clip rows that are scrolled out of the visible yAxis area
            if (yCenter < gridTop - 5 || yCenter > gridBottom + 5) {
                return;
            }

            const rowDiv = document.createElement('div');
            rowDiv.className = 'gantt-overlay-row';
            rowDiv.style.position = 'absolute';
            rowDiv.style.left = '0';
            rowDiv.style.width = '100%';
            rowDiv.style.height = `${rowHeight}px`;
            rowDiv.style.top = `${yCenter - rowHeight / 2}px`;

            const poDiv = document.createElement('div');
            poDiv.className = 'col-po';
            poDiv.innerHTML = `<div class="marquee-wrapper"><span class="marquee-content" style="font-weight: bold;">${item.po || ''}</span></div>`;

            const custDiv = document.createElement('div');
            custDiv.className = 'col-cust';

            const customerName = item.customer || '';
            if (customerName.length > 12) {
                custDiv.innerHTML = `
                    <div class="marquee-wrapper">
                        <span class="marquee-content">${customerName}</span>
                    </div>
                `;
            } else {
                custDiv.innerText = customerName;
            }

            const qtyDiv = document.createElement('div');
            qtyDiv.className = 'col-qty';
            qtyDiv.innerHTML = `<div class="marquee-wrapper"><span class="marquee-content">${item.qty || ''}</span></div>`;

            const orderCodeDiv = document.createElement('div');
            orderCodeDiv.className = 'col-ordercode';
            orderCodeDiv.innerHTML = `<div class="marquee-wrapper"><span class="marquee-content">${item.orderCode || ''}</span></div>`;

            const etdDiv = document.createElement('div');
            etdDiv.className = 'col-etd';
            etdDiv.innerHTML = `<div class="marquee-wrapper"><span class="marquee-content">${item.etd || ''}</span></div>`;

            rowDiv.appendChild(poDiv);
            rowDiv.appendChild(custDiv);
            rowDiv.appendChild(qtyDiv);
            rowDiv.appendChild(orderCodeDiv);
            rowDiv.appendChild(etdDiv);

            rowDiv.onclick = function () {
                openPOModal(item.poId || item.po, item.customer, item.orderCode, item.qty, item.progress, item.po);
            };

            rowsContainer.appendChild(rowDiv);
        });

        // Setup mouse wheel event forwarding to the ECharts canvas
        rowsContainer.removeEventListener('wheel', handleWheelForward);
        rowsContainer.addEventListener('wheel', handleWheelForward);

        setTimeout(initializeMarquees, 50);
    }

    function getCSSVar(name) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(name).trim();
    }

    function resolveColor(colorStr) {
        if (!colorStr) return '#999';
        if (colorStr.startsWith('var(')) {
            const varName = colorStr.substring(4, colorStr.length - 1).trim();
            return getCSSVar(varName) || '#999';
        }
        return colorStr;
    }

    function getAlphaColor(colorStr, alpha) {
        if (!colorStr) return 'rgba(0,0,0,0)';
        colorStr = colorStr.trim();
        if (colorStr.startsWith('rgb(')) {
            return colorStr.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
        }
        if (colorStr.startsWith('rgba(')) {
            const parts = colorStr.split(',');
            if (parts.length === 4) {
                parts[3] = ` ${alpha})`;
                return parts.join(',');
            }
        }
        if (colorStr.startsWith('#')) {
            const hexAlpha = Math.round(alpha * 255).toString(16).padStart(2, '0');
            return colorStr + hexAlpha;
        }
        return colorStr;
    }

    function formatRevenueKPI(valStr, source) {
        let val = parseFloat(valStr);
        if (isNaN(val)) return { value: valStr, unit: 'USD' };

        if (val >= 1000000) {
            return { value: (val / 1000000).toFixed(1).replace('.0', ''), unit: 'M USD' };
        } else if (val >= 1000) {
            return { value: (val / 1000).toFixed(1).replace('.0', ''), unit: 'K USD' };
        } else {
            if (val < 1 && val > 0) {
                return { value: (val * 1000).toFixed(0), unit: 'K USD' };
            }
            return { value: valStr, unit: 'USD' };
        }
    }

    // ============================================================
    // CHART COLOR TOKENS — Nhóm 3: Chart Base & Nhóm 4: Chart Accent
    // Sửa tên CSS variable ở đây để thay đổi màu toàn bộ charts.
    // Các hàm render chart đều đọc từ object này, KHÔNG dùng hex.
    // ============================================================
    function buildChartColors() {
        return {
            // --- Nhóm 1 ánh xạ sang chart ---
            axisLine: getCSSVar('--chart-axis-line') || getCSSVar('--border-color'),   // viền trục, separator
            splitLine: getCSSVar('--chart-split-line') || getCSSVar('--bg-subtle'),      // đường grid nhẹ
            scrollTrack: getCSSVar('--bg-subtle'),      // nền thanh scroll dataZoom
            scrollThumb: getCSSVar('--border-color'),   // filler thanh scroll dọc
            ganttPillBg: getCSSVar('--bg-track'),       // track nền của Gantt bar (độ tương phản cao)
            gaugeRemainder: getCSSVar('--bg-track'),       // phần còn lại donut gauge
            tooltipBg: getCSSVar('--bg-card'),        // nền tooltip
            bgCard: getCSSVar('--bg-card'),           // nền card (trùng màu nền card)

            // --- Nhóm 2 ánh xạ sang chart ---
            axisLabel: getCSSVar('--chart-axis-label') || getCSSVar('--text-secondary'), // nhãn trục x/y
            dataLabel: getCSSVar('--text-primary'),   // nhãn giá trị trên bar/line
            tooltipText: getCSSVar('--text-primary'),   // chữ trong tooltip

            // --- Nhóm 4: Chart Accent (không đổi theo theme) ---
            blue: getCSSVar('--color-blue'),
            green: getCSSVar('--color-green'),
            orange: getCSSVar('--color-orange'),
            red: getCSSVar('--color-red'),
            teal: getCSSVar('--color-teal'),
            cyan: getCSSVar('--color-cyan'),              // ← neon-cyan #34d2ee từ FabricDefects
            neonCyan: getCSSVar('--neon-cyan'),           // ← alias --neon-cyan

            // WIP visualMap Colors
            wipLow: getCSSVar('--wip-low'),
            wipMedium: getCSSVar('--wip-medium'),
            wipHigh: getCSSVar('--wip-high'),

            // Gantt Today Marker Colors
            todayBg: getCSSVar('--today-bg'),
            todayText: getCSSVar('--today-text'),
            ganttProgressText: getCSSVar('--gantt-progress-text'),
        };
    }

    const ThemeManager = {
        STORAGE_KEY: 'ntb-dashboard-theme',
        current: 'light',

        init: function () {
            const savedTheme = localStorage.getItem(this.STORAGE_KEY) || 'light';
            this.apply(savedTheme);
        },

        apply: function (theme) {
            this.current = theme;
            document.documentElement.setAttribute('data-theme', theme);

            // Cập nhật button label
            const labelEl = document.getElementById('theme-toggle-label');
            if (labelEl) {
                labelEl.innerText = theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối';
            }

            localStorage.setItem(this.STORAGE_KEY, theme);
        },

        toggle: function () {
            const nextTheme = this.current === 'dark' ? 'light' : 'dark';
            this.apply(nextTheme);
            this.rechartAll();
        },

        rechartAll: function () {
            // Re-render toàn bộ charts để cập nhật màu theo theme mới
            renderDashboard();
        }
    };

    const UIManager = {
        STORAGE_KEY: 'ntb-dashboard-ui-version',
        current: 'old',

        init: function () {
            const savedUI = localStorage.getItem(this.STORAGE_KEY) || 'old';
            this.apply(savedUI);
        },

        apply: function (ui) {
            this.current = ui;
            document.documentElement.setAttribute('data-ui-version', ui);

            // Cập nhật button label
            const labelEl = document.getElementById('ui-toggle-label');
            if (labelEl) {
                labelEl.innerText = ui === 'new' ? 'Giao diện cũ' : 'Giao diện mới';
            }

            // Show/hide icons depending on active UI version
            const iconNew = document.getElementById('ui-icon-new');
            const iconOld = document.getElementById('ui-icon-old');
            if (ui === 'new') {
                if (iconNew) iconNew.style.display = 'none';
                if (iconOld) iconOld.style.display = 'inline-flex';
            } else {
                if (iconNew) iconNew.style.display = 'inline-flex';
                if (iconOld) iconOld.style.display = 'none';
            }

            localStorage.setItem(this.STORAGE_KEY, ui);
        },

        toggle: function () {
            const nextUI = this.current === 'new' ? 'old' : 'new';
            this.apply(nextUI);
            this.rechartAll();
        },

        rechartAll: function () {
            // Re-render toàn bộ charts để cập nhật màu theo UI version mới
            renderDashboard();
            // Trigger window resize event to redraw and adjust sizes properly
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 50);
        }
    };

    // 2. INITIALIZATION
    document.addEventListener("DOMContentLoaded", function () {
        ThemeManager.init();
        UIManager.init();
        initCharts();
        setupEventListeners();
        if (activeSource === 'sql') {
            fetchSqlMetrics();
        } else {
            renderDashboard();
        }
    });

    function resizeAllCharts() {
        const currentRemPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;
        const fontChanged = (currentRemPx !== lastRemPx);
        lastRemPx = currentRemPx;

        try {
            if (revenueChart) {
                if (fontChanged && DATASETS[activeSource] && DATASETS[activeSource].revenueChart) {
                    renderRevenueChart(DATASETS[activeSource].revenueChart);
                }
                revenueChart.resize();
            }
        } catch (e) {
            console.error("Error resizing revenueChart:", e);
        }
        try {
            if (purchaseChart) {
                if (fontChanged && DATASETS[activeSource] && DATASETS[activeSource].purchaseTracking) {
                    renderPurchaseTracking(DATASETS[activeSource].purchaseTracking);
                }
                purchaseChart.resize();
            }
        } catch (e) {
            console.error("Error resizing purchaseChart:", e);
        }
        try {
            if (customerChart) {
                if (fontChanged && DATASETS[activeSource] && DATASETS[activeSource].customerRevenue) {
                    renderCustomerRevenue(DATASETS[activeSource].customerRevenue);
                }
                customerChart.resize();
            }
        } catch (e) {
            console.error("Error resizing customerChart:", e);
        }
        try {
            if (ganttChart) {
                if (fontChanged && DATASETS[activeSource] && DATASETS[activeSource].gantt) {
                    renderGanttView(DATASETS[activeSource].gantt);
                }
                ganttChart.resize();
            }
        } catch (e) {
            console.error("Error resizing ganttChart:", e);
        }
        try {
            if (wipChart) {
                if (fontChanged && DATASETS[activeSource] && DATASETS[activeSource].wip) {
                    renderWip(DATASETS[activeSource].wip);
                }
                wipChart.resize();
            }
        } catch (e) {
            console.error("Error resizing wipChart:", e);
        }

        // Re-calculate marquee overflow and Gantt HTML overlay positioning on resize
        setTimeout(function () {
            initializeMarquees();
            if (DATASETS[activeSource] && DATASETS[activeSource].gantt) {
                renderGanttHtmlOverlay(DATASETS[activeSource].gantt);
            }
        }, 100);
    }

    function triggerResizeAll() {
        if (resizeFrameId) {
            cancelAnimationFrame(resizeFrameId);
        }
        resizeFrameId = requestAnimationFrame(function () {
            resizeAllCharts();
            resizeFrameId = null;
        });
    }

    function setupResizeObserver() {
        // Always listen to window resize as a fallback/extra safety net
        window.addEventListener('resize', triggerResizeAll);

        if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver(function () {
                triggerResizeAll();
            });

            ['revenue-chart', 'purchase-tracking-chart', 'customer-revenue-chart', 'gantt-chart-canvas', 'wip-chart-canvas'].forEach(id => {
                const el = document.getElementById(id);
                if (el) observer.observe(el);
            });
        }
    }

    // 3. CHART INITIALIZATION
    function initCharts() {
        const revDom = document.getElementById('revenue-chart');
        if (revDom) revenueChart = echarts.init(revDom, null, { renderer: 'canvas' });

        const purchDom = document.getElementById('purchase-tracking-chart');
        if (purchDom) purchaseChart = echarts.init(purchDom, null, { renderer: 'canvas' });

        const custDom = document.getElementById('customer-revenue-chart');
        if (custDom) customerChart = echarts.init(custDom, null, { renderer: 'canvas' });

        const ganttDom = document.getElementById('gantt-chart-canvas');
        if (ganttDom) ganttChart = echarts.init(ganttDom, null, { renderer: 'canvas' });

        const wipDom = document.getElementById('wip-chart-canvas');
        if (wipDom) wipChart = echarts.init(wipDom, null, { renderer: 'canvas' });

        // Resize charts after layout settles (CSS-driven heights need a tick)
        setTimeout(function () {
            resizeAllCharts();
        }, 50);

        // Setup ResizeObserver to handle layout reflows dynamically
        setupResizeObserver();
    }

    // 4. RENDERING FUNCTIONS
    function renderDashboard() {
        const data = DATASETS[activeSource];

        // 4.1 Render KPI Text Fields
        document.getElementById('kpi-total-orders').innerText = data.kpis.totalOrders;
        document.getElementById('kpi-prod-orders').innerText = data.kpis.prodOrders;
        document.getElementById('kpi-delivered-orders').innerText = data.kpis.deliveredOrders;
        document.getElementById('kpi-late-orders').innerText = data.kpis.lateOrders;
        document.getElementById('kpi-otd').innerText = data.kpis.otd;

        // Format revenue and unit dynamically based on value scale
        const revData = formatRevenueKPI(data.kpis.revenue, activeSource);
        document.getElementById('kpi-revenue').innerText = revData.value;
        const revenueUnitEl = document.getElementById('kpi-revenue-unit');
        if (revenueUnitEl) {
            revenueUnitEl.innerText = revData.unit;
        }

        const growth = (activeSource === 'sql' && typeof data.kpis.revenueGrowth !== 'undefined') ? data.kpis.revenueGrowth : 12.6;
        const isPositive = growth >= 0;
        const absGrowthStr = Math.abs(growth).toFixed(1) + "%";

        const trendContainer = document.getElementById('kpi-revenue-trend-container');
        const trendIcon = document.getElementById('kpi-revenue-trend-icon');
        const trendVal = document.getElementById('kpi-revenue-trend-val');

        if (trendContainer && trendIcon && trendVal) {
            trendContainer.className = `card-trend ${isPositive ? 'text-green' : 'text-red'}`;
            trendVal.innerText = absGrowthStr;
            trendIcon.innerHTML = isPositive
                ? '<polyline points="18 15 12 9 6 15" />'
                : '<polyline points="6 9 12 15 18 9" />';
        }

        const revTrendChange = document.getElementById('rev-trend-change');
        if (revTrendChange) {
            revTrendChange.className = `stat-change ${isPositive ? 'text-green' : 'text-red'}`;
            revTrendChange.innerText = `${isPositive ? '↑' : '↓'} ${absGrowthStr} hơn tháng trước`;
        }

        // 4.2 Render Revenue Stats Header Info
        document.getElementById('rev-total').innerText = data.revenueStats.total;
        document.getElementById('rev-plan').innerText = data.revenueStats.plan;
        document.getElementById('rev-percent').innerText = data.revenueStats.percent;

        // 4.3 Render Revenue ECharts
        renderRevenueChart(data.revenueChart);

        // 4.4 Render Gantt View Table Rows
        renderGanttView(data.gantt);

        // 4.5 Render Kanban Progress Blocks
        renderKanban(data.kanban);

        // 4.6 Render WIP indicators
        renderWip(data.wip);

        // 4.7 Render Materials Storage status
        renderMaterials(data.materials);

        // 4.8 Render Purchase Tracking Chart
        renderPurchaseTracking(data.purchaseTracking);

        // 4.10 Render Customer Revenue Share
        renderCustomerRevenue(data.customerRevenue);
    }

    // 4.3 Chart Renderer: Revenue
    function renderRevenueChart(chartData) {
        if (!revenueChart) return;
        const chartColors = buildChartColors();
        const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;

        const isSql = activeSource === 'sql';
        const revenueName = isSql ? 'Doanh thu (USD)' : 'Doanh thu (M USD)';
        const planName = isSql ? 'Kế hoạch (USD)' : 'Kế hoạch (M USD)';

        const option = {
            grid: {
                top: 4 * remPx,
                left: 3 * remPx,
                right: 1.5 * remPx,
                bottom: 2.5 * remPx,
                containLabel: true
            },
            tooltip: {
                trigger: 'axis',
                confine: true,
                axisPointer: { type: 'shadow' },
                backgroundColor: chartColors.tooltipBg,
                borderColor: 'transparent',
                borderWidth: 0,
                padding: [1 * remPx, 1.4 * remPx],
                textStyle: { color: chartColors.tooltipText, fontFamily: 'Inter, sans-serif', fontSize: 1.2 * remPx },
                extraCssText: 'backdrop-filter: blur(var(--glass-blur)) saturate(180%); -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(180%); box-shadow: var(--glass-shadow) !important; border: var(--glass-border) !important; border-radius: var(--border-radius) !important;',
                formatter: function (params) {
                    const month = params[0].axisValueLabel || params[0].name;
                    let rows = '';
                    params.forEach(function (p) {
                        const dotColor = resolveColor(p.color);
                        const val = (p.value !== undefined && p.value !== null)
                            ? (isSql ? p.value.toLocaleString() : p.value)
                            : '-';
                        rows += `<div style="display:flex;align-items:center;justify-content:space-between;gap:2.4rem;margin-top:0.5rem;">`
                            + `<span style="display:flex;align-items:center;gap:0.6rem;"><span style="display:inline-block;width:0.9rem;height:0.9rem;border-radius:50%;background:${dotColor};"></span><span style="color:${chartColors.tooltipText};font-size:1.1rem;">${p.seriesName}</span></span>`
                            + `<span style="font-weight:700;font-size:1.2rem;color:${chartColors.tooltipText};">${val}</span>`
                            + `</div>`;
                    });
                    return `<div style="font-family:Inter,sans-serif;min-width:20rem;">`
                        + `<div style="font-weight:700;font-size:1.2rem;color:${chartColors.tooltipText};margin-bottom:0.4rem;border-bottom:1px solid ${chartColors.axisLine};padding-bottom:0.6rem;">${month}</div>`
                        + rows
                        + `</div>`;
                }
            },
            legend: {
                data: [revenueName, planName],
                bottom: '0',
                itemWidth: 1.2 * remPx,
                itemHeight: 0.8 * remPx,
                textStyle: { fontFamily: 'Inter, sans-serif', fontSize: 1 * remPx, fontWeight: 500, color: chartColors.axisLabel }
            },
            xAxis: {
                type: 'category',
                triggerEvent: true,
                data: chartData.months,
                axisLine: { lineStyle: { color: chartColors.axisLine } },
                axisTick: { alignWithLabel: true },
                axisLabel: {
                    color: chartColors.axisLabel,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 1.15 * remPx,
                    interval: 0,
                    rotate: 15
                }
            },
            yAxis: {
                type: 'value',
                splitNumber: 4,
                axisLine: {
                    show: true,
                    lineStyle: { color: chartColors.axisLine }
                },
                splitLine: { lineStyle: { type: 'dashed', color: chartColors.splitLine } },
                axisLabel: {
                    color: chartColors.axisLabel,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 1.15 * remPx,
                    formatter: function (value) {
                        return isSql ? value.toLocaleString() : value;
                    }
                }
            },
            series: [
                {
                    name: revenueName,
                    type: 'bar',
                    barWidth: 3.2 * remPx,
                    data: isRevenueCumulative ? chartData.luyKe : chartData.revenue,
                    itemStyle: {
                        color: chartColors.blue,
                        borderRadius: [0.2 * remPx, 0.2 * remPx, 0, 0]
                    },
                    label: {
                        show: true,
                        position: 'top',
                        color: chartColors.dataLabel,
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 1.2 * remPx,
                        fontWeight: 'bold',
                        formatter: function (params) {
                            return isSql ? (params.value ? params.value.toLocaleString() : '') : params.value;
                        }
                    }
                },
                {
                    name: planName,
                    type: 'line',
                    data: isRevenueCumulative ? chartData.luyKePlan : chartData.plan,
                    symbol: 'circle',
                    symbolSize: 0.8 * remPx,
                    lineStyle: {
                        color: chartColors.green,
                        width: 0.2 * remPx,
                        type: 'dashed'
                    },
                    itemStyle: {
                        color: chartColors.green,
                        borderColor: chartColors.bgCard,
                        borderWidth: 0.2 * remPx
                    }
                }
            ]
        };

        revenueChart.setOption(option);
    }

    // 4.4 Gantt Chart Dynamic Generation using Apache ECharts
    function renderGanttView(ganttData) {
        if (!ganttChart) return;
        const chartColors = buildChartColors();
        const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;

        // 1. Calculate Dynamic min/max bounds
        let minTime = Infinity;
        let maxTime = -Infinity;

        ganttData.forEach(item => {
            if (!item.startDate || !item.endDate) return;
            const start = new Date(item.startDate).getTime();
            const end = new Date(item.endDate).getTime();
            if (isNaN(start) || isNaN(end)) return;
            if (start < minTime) minTime = start;
            if (end > maxTime) maxTime = end;
        });

        // Fallback in case there is no valid date range in the data
        if (minTime === Infinity || maxTime === -Infinity) {
            minTime = new Date().getTime() - 30 * 24 * 60 * 60 * 1000; // 30 days ago
            maxTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000; // 30 days from now
        } else {
            // 5-day padding buffer
            const dayMs = 24 * 60 * 60 * 1000;
            minTime = minTime - 5 * dayMs;
            maxTime = maxTime + 5 * dayMs;
        }

        // 2. Map data for custom series
        const chartData = ganttData.map((item, index) => {
            const startTs = item.startDate ? new Date(item.startDate).getTime() : NaN;
            const endTs = item.endDate ? new Date(item.endDate).getTime() : NaN;
            return [
                index, // 0: Category index (y-axis row)
                startTs, // 1: Start date timestamp
                endTs, // 2: End date/ETD timestamp
                item.progress, // 3: Progress percentage
                item.status, // 4: Status color key ('slow', 'average', 'complete')
                item.po, // 5: PO string
                item.customer, // 6: Customer name
                item.qty, // 7: Quantity (pcs)
                item.etd || '-', // 8: ETD display string
                item.orderCode || '-', // 9: Order Code display string
                item.poId || item.po || '' // 10: poId for database query input
            ];
        });

        // 3. Define progress color mapping
        function getProgressColor(progress) {
            if (progress >= 95) return chartColors.blue;
            if (progress >= 80) return chartColors.green;
            if (progress >= 50) return chartColors.orange;
            return chartColors.red;
        }

        // Custom renderer for Gantt Bars
        function renderGanttItem(params, api) {
            var categoryIndex = api.value(0);
            var startVal = api.value(1);
            var endVal = api.value(2);
            var progress = api.value(3);

            // Skip rendering if dates are invalid
            if (isNaN(startVal) || isNaN(endVal) || !startVal || !endVal) {
                return;
            }

            var startPoint = api.coord([startVal, categoryIndex]);
            var endPoint = api.coord([endVal, categoryIndex]);

            var bandHeight = api.size([0, 1])[1];
            var barHeight = bandHeight * 0.45;

            var x = startPoint[0];
            var y = startPoint[1] - barHeight / 2;
            var width = endPoint[0] - startPoint[0];

            var progressWidth = width * (progress / 100);
            var pctText = progress + '%';

            var groupChildren = [
                // Pill Background Track
                {
                    type: 'rect',
                    shape: {
                        x: x,
                        y: y,
                        width: width,
                        height: barHeight,
                        r: barHeight / 2
                    },
                    style: {
                        fill: chartColors.ganttPillBg
                    }
                },
                // Pill Progress Bar
                {
                    type: 'rect',
                    shape: {
                        x: x,
                        y: y,
                        width: progressWidth,
                        height: barHeight,
                        r: barHeight / 2
                    },
                    style: {
                        fill: getProgressColor(progress)
                    }
                }
            ];

            // Add progress text label if space permits
            if (progressWidth > 2.8 * remPx) {
                groupChildren.push({
                    type: 'text',
                    style: {
                        x: x + progressWidth / 2,
                        y: startPoint[1],
                        text: pctText,
                        textAlign: 'center',
                        textVerticalAlign: 'middle',
                        fill: chartColors.ganttProgressText || '#ffffff',
                        font: 'bold ' + (1.0 * remPx) + 'px Inter, sans-serif'
                    }
                });
            }

            // Target ETD Diamond Marker at end
            groupChildren.push({
                type: 'polygon',
                shape: {
                    points: [
                        [endPoint[0], startPoint[1] - 0.6 * remPx],
                        [endPoint[0] + 0.6 * remPx, startPoint[1]],
                        [endPoint[0], startPoint[1] + 0.6 * remPx],
                        [endPoint[0] - 0.6 * remPx, startPoint[1]]
                    ]
                },
                style: {
                    fill: chartColors.tooltipBg,
                    stroke: chartColors.dataLabel,
                    lineWidth: 2
                }
            });

            return {
                type: 'group',
                children: groupChildren
            };
        }

        // Custom renderer for synchronized Left Axis table rows
        function renderAxisLabelItem(params, api) {
            var categoryIndex = api.value(0);
            var startPoint = api.coord([0, categoryIndex]);
            var y = startPoint[1];

            var bandHeight = api.size([0, 1])[1];

            // Manual clipping vertically to prevent label overlap onto header/footer when scrolling
            if (y < params.coordSys.y || y > params.coordSys.y + params.coordSys.height) {
                return;
            }

            return {
                type: 'group',
                children: [
                    // Row separator horizontal line
                    {
                        type: 'line',
                        shape: {
                            x1: 0,
                            y1: y + bandHeight / 2,
                            x2: params.coordSys.width + params.coordSys.x,
                            y2: y + bandHeight / 2
                        },
                        style: {
                            stroke: chartColors.axisLine,
                            lineWidth: 1
                        }
                    }
                ]
            };
        }

        let zoomEnd = 60;
        let isMonthMode = false;
        const activeGanttBtn = document.querySelector('#gantt-view-toggle .tab-btn.active');
        if (activeGanttBtn) {
            const mode = activeGanttBtn.innerText.trim();
            if (mode === 'Ngày') zoomEnd = 20;
            else if (mode === 'Tuần') zoomEnd = 60;
            else if (mode === 'Tháng') { zoomEnd = 100; isMonthMode = true; }
        }

        let lastMonthYear = '';
        let lastRenderedPixelX = -Infinity;

        let gridLeftOffset = 420;
        const overlayEl = document.querySelector('.gantt-overlay-table');
        if (overlayEl) {
            gridLeftOffset = overlayEl.getBoundingClientRect().width;
        }

        const isFs = document.getElementById('gantt-chart-canvas').closest('.grid-card').classList.contains('fullscreen');

        // Set ECharts Options
        const option = {
            animation: false,
            grid: {
                show: false,
                top: 4 * remPx,
                bottom: 30,
                left: gridLeftOffset,
                right: 20
            },
            xAxis: {
                type: 'time',
                position: 'top',
                min: minTime,
                max: maxTime,
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: chartColors.splitLine,
                        type: 'dashed'
                    }
                },
                axisLine: { show: false },
                axisTick: { show: true, lineStyle: { color: chartColors.axisLine } },
                axisLabel: {
                    color: chartColors.axisLabel,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 1.1 * remPx,
                    fontWeight: 600,
                    hideOverlap: true,
                    formatter: function (value, index) {
                        if (index === 0) {
                            lastMonthYear = '';
                            lastRenderedPixelX = -Infinity;
                        }
                        const date = new Date(value);
                        if (isMonthMode) {
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const year = date.getFullYear();
                            const currentMonthYear = `${month}/${year}`;
                            if (currentMonthYear !== lastMonthYear) {
                                lastMonthYear = currentMonthYear;
                                return currentMonthYear;
                            }
                            return '';
                        } else {
                            if (ganttChart) {
                                try {
                                    const pixelX = ganttChart.convertToPixel({ xAxisIndex: 0 }, value);
                                    if (pixelX !== undefined && !isNaN(pixelX)) {
                                        const minDistance = 5.0 * remPx;
                                        if (Math.abs(pixelX - lastRenderedPixelX) < minDistance) {
                                            return '';
                                        }
                                        lastRenderedPixelX = pixelX;
                                    }
                                } catch (e) {
                                    // Fallback if chart not fully rendered yet
                                }
                            }
                            const day = String(date.getDate()).padStart(2, '0');
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            return `${day}/${month}`;
                        }
                    }
                }
            },
            yAxis: {
                type: 'category',
                data: ganttData.map(item => item.po),
                inverse: true,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { show: false },
                splitLine: { show: false }
            },
            dataZoom: [
                // Horizontal inside zoom/pan
                {
                    type: 'inside',
                    id: 'insideX',
                    xAxisIndex: 0,
                    filterMode: 'weakFilter',
                    zoomOnMouseWheel: false,
                    moveOnMouseMove: false,
                    start: 0,
                    end: zoomEnd
                },
                // Horizontal slider scrollbar (below gantt chart)
                {
                    type: 'slider',
                    id: 'sliderX',
                    xAxisIndex: 0,
                    filterMode: 'weakFilter',
                    height: 16,
                    bottom: 4,
                    left: gridLeftOffset,
                    right: 20,
                    start: 0,
                    end: zoomEnd, // Dynamically matched to current view
                    handleIcon: 'path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                    handleSize: '80%',
                    showDetail: false,
                    borderColor: 'transparent',
                    backgroundColor: chartColors.scrollTrack,
                    fillerColor: getCSSVar('--neon-cyan-dim') || 'rgba(52, 210, 238, 0.2)', // neon cyan accent
                    handleStyle: {
                        color: chartColors.blue,
                        borderColor: chartColors.blue
                    }
                },
                // Vertical slider scrollbar
                {
                    type: 'slider',
                    yAxisIndex: 0,
                    zoomLock: true,
                    width: 6,
                    right: 4,
                    top: 45,
                    bottom: 30, // Aligned with the bottom of the grid above horizontal scrollbar
                    startValue: 0,
                    endValue: isFs ? Math.max(0, ganttData.length - 1) : 4, // Show exactly 5 items initially or all if fullscreen
                    handleSize: 0,
                    showDetail: false,
                    brushSelect: false,
                    borderColor: 'transparent',
                    backgroundColor: chartColors.scrollTrack,
                    fillerColor: chartColors.scrollThumb
                },
                // Vertical mousewheel scroll
                {
                    type: 'inside',
                    yAxisIndex: 0,
                    zoomOnMouseWheel: false,
                    moveOnMouseMove: false,
                    moveOnMouseWheel: true
                }
            ],
            tooltip: {
                trigger: 'item',
                confine: true,
                backgroundColor: chartColors.tooltipBg,
                borderColor: 'transparent',
                borderWidth: 0,
                textStyle: { color: chartColors.tooltipText },
                extraCssText: 'backdrop-filter: blur(var(--glass-blur)) saturate(180%); -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(180%); box-shadow: var(--glass-shadow) !important; border: var(--glass-border) !important; border-radius: var(--border-radius) !important;',
                formatter: function (info) {
                    if (info.seriesId === 'rowLabels') return '';
                    const data = info.data;
                    if (!Array.isArray(data)) return '';
                    return `
                        <div style="font-family:Inter,sans-serif;font-size:1.2rem;padding:0.4rem;">
                            <strong>PO: ${data[5]}</strong><br/>
                            Mã đơn hàng: ${data[9]}<br/>
                            Khách hàng: ${data[6]}<br/>
                            Số lượng: ${data[7]} pcs<br/>
                            Thời gian: ${new Date(data[1]).toLocaleDateString('vi-VN')} - ${new Date(data[2]).toLocaleDateString('vi-VN')}<br/>
                            Tiến độ: <span style="font-weight:bold;color:${getProgressColor(data[3])}">${data[3]}%</span>
                        </div>
                    `;
                }
            },
            series: [
                {
                    id: 'ganttBars',
                    type: 'custom',
                    renderItem: renderGanttItem,
                    clip: true,
                    encode: {
                        x: [1, 2],
                        y: 0
                    },
                    data: chartData
                },
                {
                    id: 'rowLabels',
                    type: 'custom',
                    renderItem: renderAxisLabelItem,
                    clip: false,
                    encode: {
                        x: -1,
                        y: 0
                    },
                    data: chartData
                }
            ]
        };

        // Inject Today vertical line (only if inside range)
        const todayVal = new Date('2024-05-20').getTime();
        if (todayVal >= minTime && todayVal <= maxTime) {
            option.series[0].markLine = {
                symbol: ['none', 'none'],
                lineStyle: {
                    color: chartColors.axisLabel,
                    type: 'dashed',
                    width: 1.5
                },
                label: {
                    show: true,
                    position: 'end',
                    formatter: 'HÔM NAY',
                    color: chartColors.todayText || '#ffffff',
                    backgroundColor: chartColors.todayBg || '#475569',
                    padding: [3, 6],
                    borderRadius: 2,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 9,
                    fontWeight: 'bold'
                },
                data: [
                    { xAxis: todayVal }
                ]
            };
        }

        ganttChart.setOption(option, true);
        renderGanttHtmlOverlay(ganttData);
    }

    // 4.5 Kanban steps rendering
    function renderKanban(kanbanData) {
        const container = document.getElementById('kanban-flow-container');
        if (!container) return;

        container.innerHTML = '';
        kanbanData.forEach((stage, idx) => {
            const stageDiv = document.createElement('div');
            stageDiv.className = `kanban-stage stage-${stage.id}`;

            let statusClass = 'high';
            if (stage.progress < 50) statusClass = 'low';
            else if (stage.progress < 80) statusClass = 'medium';

            // SVG icon definitions for pipeline
            let iconSvg = '';
            switch (stage.id) {
                case 1: // NPL
                    iconSvg = `<svg class="kanban-stage-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`;
                    break;
                case 2: // Cut
                    iconSvg = `<svg class="kanban-stage-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`;
                    break;
                case 3: // Sew
                    iconSvg = `<svg class="kanban-stage-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
                    break;
                case 4: // Endline
                    iconSvg = `<svg class="kanban-stage-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`;
                    break;
                case 5: // Nhận TP
                    iconSvg = `<svg class="kanban-stage-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`;
                    break;
                case 6: // Pack
                    iconSvg = `<svg class="kanban-stage-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`;
                    break;
                case 7: // AQL
                    iconSvg = `<svg class="kanban-stage-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
                    break;
            }

            stageDiv.innerHTML = `
                <span class="kanban-stage-header">${stage.id}. ${stage.name}</span>
                <div class="kanban-stage-icon-box">${iconSvg}</div>
                <span class="kanban-stage-percent ${statusClass}">${stage.progress}%</span>
                <span class="card-desc">${stage.orders}</span>
            `;

            // Draw next step indicator arrow
            if (idx < kanbanData.length - 1) {
                const arrowDiv = document.createElement('div');
                arrowDiv.className = 'kanban-arrow';
                arrowDiv.innerHTML = `
                    <svg class="kanban-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                `;
                stageDiv.appendChild(arrowDiv);
            }

            container.appendChild(stageDiv);
        });
    }

    // 4.6 WIP Stages bars rendering using ECharts
    function renderWip(wipData) {
        document.getElementById('wip-total-pcs').innerText = wipData.totalPcs;
        document.getElementById('wip-total-orders').innerText = wipData.prodOrders;
        document.getElementById('wip-avg-completion').innerText = wipData.avgCompletion;
        document.getElementById('wip-trend-compare').innerText = wipData.trendCompare;

        if (!wipChart) return;
        const chartColors = buildChartColors();
        const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;

        const source = [
            ['score', 'amount', 'product'],
            ...wipData.stages.map(s => [s.percentage, s.pcs, s.name])
        ];

        const option = {
            dataset: {
                source: source
            },
            grid: {
                top: 1.5 * remPx,
                bottom: 2.5 * remPx,
                left: 1.5 * remPx,
                right: 8 * remPx,
                containLabel: true
            },
            xAxis: {
                name: 'pcs',
                nameTextStyle: {
                    fontSize: 1.15 * remPx,
                    fontFamily: 'Inter, sans-serif',
                    color: chartColors.axisLabel
                },
                type: 'value',
                axisLine: { show: true, lineStyle: { color: chartColors.axisLine } },
                axisTick: { show: true, lineStyle: { color: chartColors.axisLine } },
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'dashed',
                        color: chartColors.splitLine
                    }
                },
                axisLabel: {
                    fontSize: 1.15 * remPx,
                    fontFamily: 'Inter, sans-serif',
                    color: chartColors.axisLabel,
                    formatter: function (value) {
                        return value.toLocaleString();
                    }
                }
            },
            yAxis: {
                type: 'category',
                inverse: true, // Show CUT at the top and SHIP at the bottom
                axisLabel: {
                    fontSize: 1.15 * remPx,
                    fontFamily: 'Inter, sans-serif',
                    color: chartColors.axisLabel
                },
                axisLine: { lineStyle: { color: chartColors.axisLine } },
                axisTick: { alignWithLabel: true }
            },
            visualMap: {
                show: false, // Keep hidden to maintain clean layout
                min: 10,
                max: 100,
                dimension: 0,
                inRange: {
                    color: [chartColors.wipLow, chartColors.wipMedium, chartColors.wipHigh]
                }
            },
            series: [
                {
                    type: 'bar',
                    barWidth: 2.4 * remPx,
                    encode: {
                        x: 'amount',
                        y: 'product'
                    },
                    label: {
                        show: true,
                        position: 'right',
                        formatter: function (params) {
                            return params.value[1].toLocaleString() + ' pcs';
                        },
                        fontSize: 0.9 * remPx,
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 'bold',
                        color: chartColors.dataLabel
                    },
                    itemStyle: {
                        borderRadius: [0, 0.2 * remPx, 0.2 * remPx, 0] // Rounded bar end
                    }
                }
            ],
            tooltip: {
                trigger: 'axis',
                confine: true,
                axisPointer: { type: 'shadow' },
                backgroundColor: chartColors.tooltipBg,
                borderColor: 'transparent',
                borderWidth: 0,
                textStyle: { color: chartColors.tooltipText },
                extraCssText: 'backdrop-filter: blur(var(--glass-blur)) saturate(180%); -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(180%); box-shadow: var(--glass-shadow) !important; border: var(--glass-border) !important; border-radius: var(--border-radius) !important;',
                formatter: function (params) {
                    const data = params[0].value;
                    return `
                        <div style="font-family:Inter,sans-serif;font-size:1.1rem;padding:0.4rem;">
                            <strong>${data[2]}</strong><br/>
                            Số lượng: <strong>${data[1].toLocaleString()} pcs</strong><br/>
                            Tiến độ: <span style="font-weight:bold;color:${data[0] >= 80 ? chartColors.green : (data[0] >= 50 ? chartColors.orange : chartColors.red)}">${data[0]}%</span>
                        </div>
                    `;
                }
            }
        };

        wipChart.setOption(option);
    }

    // 4.7 Material status tables
    function renderMaterials(materialsData) {
        const tbody = document.getElementById('materials-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (!materialsData || materialsData.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td colspan="5" style="text-align: center; color: var(--color-text-muted); padding: 1.5rem;">
                    Không có dữ liệu
                </td>
            `;
            tbody.appendChild(tr);
            return;
        }

        materialsData.forEach(m => {
            const tr = document.createElement('tr');
            const typeHtml = m.type && m.type.length > 12
                ? `<div class="marquee-wrapper"><strong class="marquee-content">${m.type}</strong></div>`
                : `<strong>${m.type}</strong>`;

            // 1. Format demand and available numbers, stripping any unit suffixes (like m, kg, cái)
            let demandVal = m.demand;
            if (typeof demandVal === 'string') {
                demandVal = demandVal.replace(/\s*(m|kg|cái)\s*$/i, '').trim();
            }
            let availableVal = m.available;
            if (typeof availableVal === 'string') {
                availableVal = availableVal.replace(/\s*(m|kg|cái)\s*$/i, '').trim();
            }

            const formattedDemand = (typeof demandVal === 'number') ? demandVal.toLocaleString() : demandVal;
            const formattedAvailable = (typeof availableVal === 'number') ? availableVal.toLocaleString() : availableVal;

            // 2. Determine threshold and status CSS class dynamically (pct values are from 0 to 100+)
            let statusClass = 'critical';
            if (typeof m.pct === 'number') {
                if (m.pct >= 90) statusClass = 'active';
                else if (m.pct >= 50) statusClass = 'warning';
            } else if (typeof m.status === 'string') {
                statusClass = m.status; // Fallback for mock data strings
            }

            // 3. Format percentage
            let formattedPct = m.pct;
            if (typeof m.pct === 'number') {
                formattedPct = Math.round(m.pct) + '%';
            }

            tr.innerHTML = `
                <td>${typeHtml}</td>
                <td>${formattedDemand}</td>
                <td>${formattedAvailable}</td>
                <td>${formattedPct}</td>
                <td><span class="status-dot ${statusClass}"></span></td>
            `;
            tr.style.cursor = 'pointer';
            tr.addEventListener('click', function () {
                openMaterialDetailsModal(m.code || m.type, m.type);
            });
            tbody.appendChild(tr);
        });

        setTimeout(initializeMarquees, 50);
    }

    // 4.8 Chart Renderer: Purchase Tracking (Stacked Bar)
    function renderPurchaseTracking(data) {
        const arrivedVal = data.summary.arrived || 0;
        const incomingVal = data.summary.incoming || 0;
        const failVal = data.summary.fail || 0;
        const totalOrdered = arrivedVal + incomingVal + failVal;

        // Update KPIs
        document.getElementById('purch-ordered').innerText = totalOrdered.toLocaleString();
        document.getElementById('purch-arrived').innerText = arrivedVal.toLocaleString();
        document.getElementById('purch-incoming').innerText = incomingVal.toLocaleString();
        document.getElementById('purch-fail').innerText = failVal.toLocaleString();

        if (!purchaseChart) return;
        const chartColors = buildChartColors();
        const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;

        // Map data for ECharts
        const items = data.items.map(item => item.itemCode);
        const rawArrived = data.items.map(item => item.poArrived);
        const rawIncoming = data.items.map(item => item.poIncoming);
        const rawFailed = data.items.map(item => item.poFail);

        const arrived = [];
        const incoming = [];
        const failed = [];

        const seriesRaw = [rawArrived, rawIncoming, rawFailed];
        const seriesData = [arrived, incoming, failed];
        const seriesColors = [chartColors.green, chartColors.orange, chartColors.red];

        for (let i = 0; i < items.length; i++) {
            let lastActiveSeriesIdx = -1;
            for (let s = 2; s >= 0; s--) {
                if (seriesRaw[s][i] > 0) {
                    lastActiveSeriesIdx = s;
                    break;
                }
            }

            for (let s = 0; s < 3; s++) {
                const val = seriesRaw[s][i];
                if (s === lastActiveSeriesIdx) {
                    seriesData[s].push({
                        value: val,
                        itemStyle: {
                            color: seriesColors[s],
                            borderRadius: [0, 0.4 * remPx, 0.4 * remPx, 0]
                        }
                    });
                } else {
                    seriesData[s].push({
                        value: val,
                        itemStyle: {
                            color: seriesColors[s],
                            borderRadius: 0
                        }
                    });
                }
            }
        }

        const isFs = document.getElementById('purchase-tracking-chart').closest('.grid-card').classList.contains('fullscreen');

        const option = {
            animation: false,
            tooltip: {
                trigger: 'axis',
                confine: true,
                axisPointer: { type: 'shadow' },
                backgroundColor: chartColors.tooltipBg,
                borderColor: 'transparent',
                borderWidth: 0,
                padding: [1 * remPx, 1.4 * remPx],
                textStyle: { color: chartColors.tooltipText, fontFamily: 'Inter, sans-serif', fontSize: 1.2 * remPx },
                extraCssText: 'backdrop-filter: blur(var(--glass-blur)) saturate(180%); -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(180%); box-shadow: var(--glass-shadow) !important; border: var(--glass-border) !important; border-radius: var(--border-radius) !important;',
                formatter: function (params) {
                    const itemName = params[0].axisValueLabel || params[0].name;
                    const totalOrdered = params.reduce(function (sum, p) { return sum + (p.value || 0); }, 0);
                    let rows = '';
                    params.forEach(function (p) {
                        if (!p.value && p.value !== 0) return;
                        const dotColor = resolveColor(p.color);
                        rows += `<div style="display:flex;align-items:center;justify-content:space-between;gap:2.4rem;margin-top:0.5rem;">`
                            + `<span style="display:flex;align-items:center;gap:0.6rem;"><span style="display:inline-block;width:0.9rem;height:0.9rem;border-radius:50%;background:${dotColor};"></span><span style="color:${chartColors.tooltipText};font-size:1.1rem;">${p.seriesName}</span></span>`
                            + `<span style="font-weight:700;font-size:1.2rem;color:${chartColors.tooltipText};">${(p.value || 0).toLocaleString()}</span>`
                            + `</div>`;
                    });
                    return `<div style="font-family:Inter,sans-serif;min-width:20rem;">`
                        + `<div style="font-weight:700;font-size:1.2rem;color:${chartColors.tooltipText};margin-bottom:0.4rem;border-bottom:1px solid ${chartColors.axisLine};padding-bottom:0.6rem;">${itemName}</div>`
                        + rows
                        + `<div style="display:flex;justify-content:space-between;margin-top:0.6rem;padding-top:0.6rem;border-top:1px solid ${chartColors.axisLine};">`
                        + `<span style="font-size:1.1rem;color:${chartColors.tooltipText};">Đã đặt</span>`
                        + `<span style="font-weight:700;font-size:1.2rem;color:${chartColors.tooltipText};">${totalOrdered.toLocaleString()}</span>`
                        + `</div></div>`;
                }
            },
            legend: {
                show: false // We use our custom HTML legend bubbles
            },
            grid: {
                top: 1 * remPx,
                bottom: 2 * remPx,
                left: 1 * remPx,
                right: 3 * remPx,
                containLabel: true
            },
            xAxis: {
                type: 'value',
                axisLine: {
                    show: true,
                    lineStyle: { color: chartColors.axisLine }
                },
                splitLine: { lineStyle: { type: 'dashed', color: chartColors.splitLine } },
                axisLabel: { color: chartColors.axisLabel, fontSize: 1 * remPx, fontFamily: 'Inter, sans-serif' }
            },
            yAxis: {
                type: 'category',
                data: items,
                inverse: true,
                triggerEvent: true,
                axisLine: { lineStyle: { color: chartColors.axisLine } },
                axisTick: { alignWithLabel: true },
                axisLabel: { color: chartColors.axisLabel, fontSize: 1 * remPx, fontWeight: 500, fontFamily: 'Inter, sans-serif' }
            },
            dataZoom: [
                {
                    type: 'slider',
                    show: isFs ? (items.length > 12) : (items.length > 6),
                    yAxisIndex: 0,
                    zoomLock: true,
                    brushSelect: false,
                    width: 0.6 * remPx,
                    right: 0,
                    top: 1 * remPx,
                    bottom: 2 * remPx,
                    start: 0,
                    end: isFs ? 100 : (items.length > 6 ? (6 / items.length) * 100 : 100),
                    handleSize: 0,
                    showDetail: false,
                    showDataShadow: false,
                    dataBackground: {
                        lineStyle: { opacity: 0 },
                        areaStyle: { opacity: 0 }
                    },
                    selectedDataBackground: {
                        lineStyle: { opacity: 0 },
                        areaStyle: { opacity: 0 }
                    },
                    borderColor: 'transparent',
                    backgroundColor: chartColors.scrollTrack,
                    fillerColor: chartColors.scrollThumb
                },
                {
                    type: 'inside',
                    yAxisIndex: 0,
                    zoomOnMouseWheel: false,
                    moveOnMouseMove: false,
                    moveOnMouseWheel: true
                }
            ],
            series: [
                {
                    name: 'Đã về',
                    type: 'bar',
                    stack: 'total',
                    barWidth: 1.6 * remPx,
                    itemStyle: { color: chartColors.green },
                    data: arrived
                },
                {
                    name: 'Sắp về',
                    type: 'bar',
                    stack: 'total',
                    itemStyle: { color: chartColors.orange },
                    data: incoming
                },
                {
                    name: 'Trễ',
                    type: 'bar',
                    stack: 'total',
                    itemStyle: { color: chartColors.red },
                    data: failed
                }
            ]
        };

        purchaseChart.setOption(option);
    }

    // 4.10 Chart Renderer: Customer Revenue Share
    function renderCustomerRevenue(custData) {
        if (!customerChart) return;
        const chartColors = buildChartColors();
        const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;
        const isFs = document.getElementById('customer-revenue-chart') && document.getElementById('customer-revenue-chart').closest('.grid-card')
            ? document.getElementById('customer-revenue-chart').closest('.grid-card').classList.contains('fullscreen')
            : false;

        // Update card title unit depending on active source
        const titleEl = document.getElementById('customer-revenue-title');
        if (titleEl) {
            titleEl.innerText = 'DOANH THU THEO KHÁCH HÀNG (USD)';
        }

        const legendDiv = document.getElementById('customer-revenue-legend');

        if (!custData || custData.length === 0) {
            customerChart.setOption({
                title: {
                    text: 'Không có dữ liệu',
                    left: 'center',
                    top: 'middle',
                    textStyle: {
                        color: chartColors.axisLabel,
                        fontSize: 1.4 * remPx,
                        fontFamily: 'Inter, sans-serif'
                    }
                },
                series: []
            }, true);

            if (legendDiv) {
                legendDiv.innerHTML = '<div class="no-data-msg" style="padding: 2rem; font-size: 1.1rem; color: var(--text-secondary); text-align: center; width: 100%;">Không có dữ liệu cho khoảng thời gian này</div>';
            }
            return;
        }

        const colors = [
            getCSSVar('--color-cust-rank1'),
            getCSSVar('--color-cust-rank2'),
            getCSSVar('--color-cust-rank3'),
            getCSSVar('--color-cust-rank4'),
            getCSSVar('--color-cust-rank5')
        ];

        const chartData = custData.map((c, index) => {
            const rawColor = c.color || (c.name === 'Khác' ? 'var(--color-cust-other)' : colors[index % colors.length]);
            const itemColor = resolveColor(rawColor);
            return {
                name: c.name,
                value: c.value,
                itemStyle: {
                    color: itemColor,
                    shadowBlur: 6,
                    shadowColor: getAlphaColor(itemColor, 0.2)   // Giảm opacity và dùng đúng rgba màu slice
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 15,
                        shadowColor: getAlphaColor(itemColor, 0.4)  // Giảm opacity khi hover để không bị chói trắng
                    }
                }
            };
        });

        const option = {
            title: {
                show: false
            },
            tooltip: {
                trigger: 'item',
                backgroundColor: chartColors.tooltipBg,
                borderColor: 'transparent',
                borderWidth: 0,
                padding: [1 * remPx, 1.4 * remPx],
                textStyle: { color: chartColors.tooltipText, fontFamily: 'Inter, sans-serif', fontSize: 1.2 * remPx },
                extraCssText: 'backdrop-filter: blur(var(--glass-blur)) saturate(180%); -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(180%); box-shadow: var(--glass-shadow) !important; border: var(--glass-border) !important; border-radius: var(--border-radius) !important;',
                formatter: function (params) {
                    const dotColor = resolveColor(params.color);
                    const unit = 'USD';
                    const formattedValue = params.value ? params.value.toLocaleString() : '0';
                    return `<div style="font-family:Inter,sans-serif;min-width:18rem;border-left:3px solid ${dotColor};padding-left:0.8rem;">`
                        + `<div style="font-weight:700;font-size:1.2rem;color:${chartColors.tooltipText};margin-bottom:0.6rem;">`
                        + `<span style="display:inline-block;width:0.9rem;height:0.9rem;border-radius:50%;background:${dotColor};margin-right:0.6rem;"></span>${params.name}</div>`
                        + `<div style="display:flex;justify-content:space-between;gap:2.4rem;margin-top:0.4rem;"><span style="font-size:1.1rem;color:${chartColors.tooltipText};">Doanh thu</span><span style="font-weight:700;font-size:1.2rem;color:${chartColors.tooltipText};">${formattedValue} ${unit}</span></div>`
                        + `<div style="display:flex;justify-content:space-between;gap:2.4rem;margin-top:0.4rem;"><span style="font-size:1.1rem;color:${chartColors.tooltipText};">Tỷ lệ</span><span style="font-weight:700;font-size:1.2rem;color:${dotColor};">${params.percent}%</span></div>`
                        + `</div>`;
                }
            },
            series: [
                {
                    type: 'pie',
                    radius: isFs ? ['35%', '55%'] : ['60%', '90%'],
                    center: ['50%', '50%'],
                    avoidLabelOverlap: true,
                    // Scale và glow khi hover — giống FabricDefects
                    emphasis: {
                        scale: true,
                        scaleSize: 6
                    },
                    itemStyle: {
                        borderRadius: 4,
                        borderColor: chartColors.bgCard,
                        borderWidth: 2   // tách slice rõ hơn
                    },
                    label: {
                        show: isFs,
                        position: 'outside',
                        formatter: function (params) {
                            const unit = 'USD';
                            const formattedValue = params.value ? params.value.toLocaleString() : '0';
                            return `{name|${params.name}}\n{val|${formattedValue} ${unit}} {pct|(${params.percent}%)}`;
                        },
                        rich: {
                            name: {
                                fontSize: 1.4 * remPx,
                                fontWeight: 'bold',
                                color: chartColors.dataLabel,
                                padding: [0, 0, 0.6 * remPx, 0],
                                fontFamily: 'Inter, sans-serif'
                            },
                            val: {
                                fontSize: 1.3 * remPx,
                                color: chartColors.axisLabel,
                                fontFamily: 'Inter, sans-serif'
                            },
                            pct: {
                                fontSize: 1.3 * remPx,
                                fontWeight: 'bold',
                                color: chartColors.blue,
                                fontFamily: 'Inter, sans-serif'
                            }
                        },
                        fontFamily: 'Inter, sans-serif'
                    },
                    labelLine: {
                        show: isFs,
                        length: 3.5 * remPx,
                        length2: 2.5 * remPx,
                        lineStyle: {
                            color: chartColors.axisLine,
                            width: 1.5
                        }
                    },
                    data: chartData
                }
            ]
        };

        customerChart.setOption(option, true);

        // Render customer legends in sidebar table
        if (!legendDiv) return;

        legendDiv.innerHTML = '';
        custData.forEach((c, index) => {
            const item = document.createElement('div');
            item.className = 'cust-legend-item';
            const unit = 'USD';
            const formattedValue = c.value ? c.value.toLocaleString() : '0';
            const rawColor = c.color || (c.name === 'Khác' ? 'var(--color-cust-other)' : colors[index % colors.length]);
            const itemColor = resolveColor(rawColor);
            const nameHtml = c.name && c.name.length > 12
                ? `<div class="marquee-wrapper"><span class="cust-name marquee-content">${c.name}</span></div>`
                : `<span class="cust-name">${c.name}</span>`;
            item.innerHTML = `
                <div class="cust-label-group">
                    <span class="cust-dot" style="background-color: ${itemColor}"></span>
                    ${nameHtml}
                </div>
                <div class="cust-stats">
                    <div class="marquee-wrapper">
                        <span class="marquee-content">${formattedValue} ${unit} <span class="cust-pct">(${c.pct})</span></span>
                    </div>
                </div>
            `;
            legendDiv.appendChild(item);
        });

        setTimeout(initializeMarquees, 50);
    }

    // 5. EVENTS & LOGGING STATE
    function setupEventListeners() {
        initFullscreenToggle();

        // Global delegation: Chỉ hiển thị tooltip (title) khi văn bản bị cắt/quá dài
        document.addEventListener('mouseover', function (e) {
            // Bỏ qua các phần tử tương tác như nút bấm, input, liên kết để giữ nguyên tooltip mặc định
            if (e.target.closest('button, input, select, textarea, a, [role="button"]')) {
                return;
            }

            // 1. Kiểm tra marquee wrapper
            const marqueeWrapper = e.target.closest('.marquee-wrapper');
            if (marqueeWrapper) {
                const content = marqueeWrapper.querySelector('.marquee-content');
                if (content) {
                    const text = content.innerText.trim();
                    if (content.scrollWidth - marqueeWrapper.clientWidth > 1 && text) {
                        marqueeWrapper.setAttribute('title', text);
                    } else {
                        marqueeWrapper.removeAttribute('title');
                        content.removeAttribute('title');
                    }
                }
                return;
            }

            // 2. Kiểm tra các phần tử văn bản thông thường có thể bị cắt (table cell, truncate, label, v.v.)
            const textCell = e.target.closest('.text-truncate, td, th, .cust-name, .kpi-label, .po-summary-val, .gantt-overlay-row > div');
            if (textCell && !textCell.querySelector('.marquee-wrapper')) {
                const text = textCell.innerText.trim();
                if (textCell.scrollWidth - textCell.clientWidth > 1 && textCell.clientWidth > 0 && text) {
                    textCell.setAttribute('title', text);
                } else if (textCell.hasAttribute('title')) {
                    textCell.removeAttribute('title');
                }
            }
        });

        const toggle = document.getElementById('data-source-toggle');
        const loader = document.getElementById('sql-loader');

        if (toggle) {
            toggle.checked = true;
            toggle.addEventListener('change', function () {
                if (this.checked) {
                    activeSource = 'sql';
                    fetchSqlMetrics();
                    showToast('Đã chuyển sang chế độ dữ liệu Real SQL Mode');
                } else {
                    activeSource = 'mock';
                    if (loader) loader.style.display = 'none';
                    renderDashboard();
                    showToast('Đã chuyển về chế độ giả lập Mock Data');
                }
            });
        }

        // Helper function for date changes
        function onDateChange() {
            const main = document.querySelector('.main-content');
            if (main) {
                main.style.opacity = '0.5';
                setTimeout(() => {
                    main.style.opacity = '1';
                    if (activeSource === 'sql') {
                        fetchSqlMetrics();
                    } else {
                        renderDashboard();
                    }
                }, 200);
            }
        }

        // Initialize jQuery DateRangePicker
        const $pickerContainer = $('#header-daterange-picker');
        if ($pickerContainer.length) {
            const startVal = $('#start-date').val() || moment().startOf('month').format('DD/MM/YYYY');
            const endVal = $('#end-date').val() || moment().endOf('month').format('DD/MM/YYYY');

            // Parse initial days
            let storedStartDay = moment(startVal, 'DD/MM/YYYY').date();
            let storedEndDay = moment(endVal, 'DD/MM/YYYY').date();

            $pickerContainer.daterangepicker({
                startDate: moment(startVal, 'DD/MM/YYYY'),
                endDate: moment(endVal, 'DD/MM/YYYY'),
                linkedCalendars: true,
                locale: {
                    format: 'DD/MM/YYYY',
                    applyLabel: 'Áp dụng',
                    cancelLabel: 'Hủy',
                    daysOfWeek: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
                    monthNames: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
                    firstDay: 1
                },
                showDropdowns: true,
                opens: 'right',
                autoUpdateInput: false
            });

            const drp = $pickerContainer.data('daterangepicker');

            // Listen to selection changes to update our stored day states
            $pickerContainer.on('apply.daterangepicker', function (ev, picker) {
                $('#start-date').val(picker.startDate.format('DD/MM/YYYY'));
                $('#end-date').val(picker.endDate.format('DD/MM/YYYY'));
                storedStartDay = picker.startDate.date();
                storedEndDay = picker.endDate.date();
                onDateChange();
                showToast(`Đã cập nhật thời gian từ ${picker.startDate.format('DD/MM/YYYY')} đến ${picker.endDate.format('DD/MM/YYYY')}`);
            });

            // Bind to datepicker show event to keep right calendar linked to left calendar + 1 month
            $pickerContainer.on('show.daterangepicker', function () {
                const container = drp.container;
                container.find('.monthselect, .yearselect').off('change.datepersist').on('change.datepersist', function () {
                    const isLeft = $(this).closest('.drp-calendar').hasClass('left');
                    if (isLeft) {
                        const selectedLeftMonth = parseInt(container.find('.left .monthselect').val());
                        const selectedLeftYear = parseInt(container.find('.left .yearselect').val());
                        drp.leftCalendar.month = moment([selectedLeftYear, selectedLeftMonth, 1]);
                    } else {
                        const selectedRightMonth = parseInt(container.find('.right .monthselect').val());
                        const selectedRightYear = parseInt(container.find('.right .yearselect').val());
                        // Since right is always left + 1, changing right calendar to R means left calendar should be set to R - 1
                        const rightView = moment([selectedRightYear, selectedRightMonth, 1]);
                        drp.leftCalendar.month = rightView.clone().subtract(1, 'month');
                    }
                    drp.updateCalendars();
                });
            });
        }

        // Apply filters handler (simulated reload animations)
        const btnApply = document.getElementById('btn-apply');
        if (btnApply) {
            btnApply.addEventListener('click', function () {
                onDateChange();
            });
        }

        // Revenue view toggle (Doanh thu / Lũy kế)
        const revenueToggle = document.getElementById('revenue-view-toggle');
        if (revenueToggle) {
            const btns = revenueToggle.querySelectorAll('.tab-btn');
            btns.forEach((btn, index) => {
                btn.addEventListener('click', function () {
                    btns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    isRevenueCumulative = (index === 1);

                    const data = DATASETS[activeSource];
                    if (data && data.revenueChart) {
                        renderRevenueChart(data.revenueChart);
                    }
                });
            });
        }

        // Gantt view granularity toggle (Day / Week / Month)
        const ganttToggle = document.getElementById('gantt-view-toggle');
        if (ganttToggle) {
            const btns = ganttToggle.querySelectorAll('.tab-btn');
            btns.forEach(btn => {
                btn.addEventListener('click', function () {
                    btns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    const mode = this.innerText.trim();

                    let zoomStart = 0;
                    let zoomEnd = 100;

                    if (mode === 'Ngày') {
                        zoomEnd = 20; // Zoom in to show a 20% range
                    } else if (mode === 'Tuần') {
                        zoomEnd = 60; // Show a medium 60% range
                    } else {
                        // Month
                        zoomEnd = 100; // Show full range
                    }

                    if (ganttChart) {
                        let lastMonthYear = '';
                        ganttChart.setOption({
                            xAxis: {
                                axisLabel: {
                                    hideOverlap: true,
                                    formatter: function (value, index) {
                                        if (index === 0) {
                                            lastMonthYear = '';
                                        }
                                        const date = new Date(value);
                                        if (mode === 'Tháng') {
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const year = date.getFullYear();
                                            const currentMonthYear = `${month}/${year}`;
                                            if (currentMonthYear !== lastMonthYear) {
                                                lastMonthYear = currentMonthYear;
                                                return currentMonthYear;
                                            }
                                            return '';
                                        } else {
                                            const day = String(date.getDate()).padStart(2, '0');
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            return `${day}/${month}`;
                                        }
                                    }
                                }
                            }
                        });

                        ganttChart.dispatchAction({
                            type: 'dataZoom',
                            batch: [
                                {
                                    dataZoomId: 'insideX',
                                    start: zoomStart,
                                    end: zoomEnd
                                },
                                {
                                    dataZoomId: 'sliderX',
                                    start: zoomStart,
                                    end: zoomEnd
                                }
                            ]
                        });
                    }
                });
            });
        }

        // Theme toggle handler
        const themeBtn = document.getElementById('btn-theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', function () {
                ThemeManager.toggle();
                const isDark = ThemeManager.current === 'dark';
                showToast(`Đã chuyển sang ${isDark ? 'Chế độ tối' : 'Chế độ sáng'}`, 'success');
            });
        }

        // UI version toggle handler
        const uiToggleBtn = document.getElementById('btn-ui-toggle');
        if (uiToggleBtn) {
            uiToggleBtn.addEventListener('click', function () {
                UIManager.toggle();
                const isNewUI = UIManager.current === 'new';
                showToast(`Đã chuyển sang ${isNewUI ? 'Giao diện mới (Tech)' : 'Giao diện cũ (Glass)'}`, 'success');
            });
        }

        // Factory select handler
        const factorySelect = document.getElementById('header-factory-select');
        if (factorySelect) {
            factorySelect.addEventListener('change', function () {
                const selectedText = this.options[this.selectedIndex].text;
                showToast(`Đã lọc dữ liệu cho: ${selectedText}`, 'success');
                onDateChange();
            });
        }

        // Header Side Nav Toggle (Tình hình sản xuất / Tiến độ sản xuất)
        const btnSideTinhHinh = document.getElementById('btn-side-tinh-hinh');
        const btnSideTienDo = document.getElementById('btn-side-tien-do');

        function setActiveSide(sideName) {
            const activeClasses = ['bg-white', 'text-slate-800', 'shadow-sm', 'border', 'border-slate-200/60', 'font-semibold'];
            const inactiveClasses = ['text-slate-600', 'hover:text-slate-900', 'hover:bg-white/50', 'font-medium'];

            if (sideName === 'tinh-hinh') {
                if (btnSideTinhHinh) {
                    btnSideTinhHinh.classList.add('active', ...activeClasses);
                    btnSideTinhHinh.classList.remove(...inactiveClasses);
                }
                if (btnSideTienDo) {
                    btnSideTienDo.classList.remove('active', ...activeClasses);
                    btnSideTienDo.classList.add(...inactiveClasses);
                }
                document.body.setAttribute('data-active-side', 'tinh-hinh');
                showToast('Đã chuyển sang: Tình hình sản xuất', 'info');
            } else if (sideName === 'tien-do') {
                if (btnSideTienDo) {
                    btnSideTienDo.classList.add('active', ...activeClasses);
                    btnSideTienDo.classList.remove(...inactiveClasses);
                }
                if (btnSideTinhHinh) {
                    btnSideTinhHinh.classList.remove('active', ...activeClasses);
                    btnSideTinhHinh.classList.add(...inactiveClasses);
                }
                document.body.setAttribute('data-active-side', 'tien-do');
                showToast('Đã chuyển sang: Tiến độ sản xuất', 'info');
            }

            setTimeout(() => {
                if (typeof ganttChart !== 'undefined' && ganttChart) ganttChart.resize();
                if (typeof wipChart !== 'undefined' && wipChart) wipChart.resize();
                if (typeof revenueChart !== 'undefined' && revenueChart) revenueChart.resize();
                if (typeof customerChart !== 'undefined' && customerChart) customerChart.resize();
                if (typeof purchaseChart !== 'undefined' && purchaseChart) purchaseChart.resize();
            }, 100);
        }

        if (btnSideTinhHinh) {
            btnSideTinhHinh.addEventListener('click', function () {
                setActiveSide('tinh-hinh');
            });
        }

        if (btnSideTienDo) {
            btnSideTienDo.addEventListener('click', function () {
                setActiveSide('tien-do');
            });
        }

        // Initialize PO Modal Click Trigger
        initPOModalEvent();
        // Initialize Monthly Revenue Modal Click Trigger
        initRevenueModalEvent();
        // Initialize Purchase Tracking Modal Click Trigger
        initPurchaseModalEvent();
        // Initialize Material Status Modal Click Trigger
        initMaterialModalEvent();
        // Initialize WIP Stage Modal Click Trigger
        initWipModalEvent();
        // Initialize WIP Progress All Stages Details Modal Click Trigger
        initWipProgressModalEvent();

        // Bind toolbar notification and export buttons
        const notificationBtn = document.querySelector('.header-notification');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', function (e) {
                e.preventDefault();
                showToast('Đang phát triển', 'dev');
            });
        }

        const exportBtn = document.querySelector('.btn-export');
        if (exportBtn) {
            exportBtn.addEventListener('click', function (e) {
                e.preventDefault();
                showToast('Đang phát triển', 'dev');
            });
        }
    }

    function showToast(message, type = 'success') {
        let container = document.getElementById('toast-notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-notification-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Tự động nhận diện trạng thái Đang phát triển nếu không truyền type
        if (message && message.toLowerCase().includes('đang phát triển')) {
            type = 'dev';
        }

        // Loại bỏ toast trùng lặp nội dung đang hiển thị để tránh lặp (stacking) khi bấm nhanh
        Array.from(container.children).forEach(child => {
            if (child.querySelector('.toast-message')?.innerText === message) {
                child.remove();
            }
        });

        // Giữ tối đa 3 toast cùng lúc trên màn hình
        while (container.children.length >= 3) {
            container.firstElementChild.remove();
        }

        let iconHtml = '<i class="fa-solid fa-circle-check"></i>';
        if (type === 'error' || type === 'fail') {
            iconHtml = '<i class="fa-solid fa-circle-xmark"></i>';
        } else if (type === 'info') {
            iconHtml = '<i class="fa-solid fa-circle-info"></i>';
        } else if (type === 'dev') {
            iconHtml = '<i class="fa-solid fa-screwdriver-wrench"></i>';
        }

        const toast = document.createElement('div');
        toast.className = `toast-item ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                ${iconHtml}
            </div>
            <div class="toast-content">
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close" aria-label="Đóng">&times;</button>
        `;

        container.appendChild(toast);

        // Slide in
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Auto remove helper
        let autoRemoveTimer;
        const removeToast = () => {
            clearTimeout(autoRemoveTimer);
            toast.classList.remove('show');
            toast.classList.add('hide');
            toast.addEventListener('transitionend', () => {
                toast.remove();
                if (container.children.length === 0) {
                    container.remove();
                }
            });
        };

        // Close on button click
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', removeToast);
        }

        // Auto remove after 3.5 seconds
        autoRemoveTimer = setTimeout(removeToast, 3500);
    }


    function initPOModalEvent() {
        if (ganttChart) {
            ganttChart.on('click', function (params) {
                // Check if clicked series is ganttBars or rowLabels
                if (params.seriesId === 'ganttBars' || params.seriesId === 'rowLabels') {
                    // params.data is [index, startTs, endTs, progress, status, po, customer, qty, etd, orderCode, poId]
                    const poId = params.data[10] || params.data[5];
                    const customer = params.data[6];
                    const orderCode = params.data[9];
                    const qty = params.data[7];
                    const progress = params.data[3];
                    const poName = params.data[5];
                    openPOModal(poId, customer, orderCode, qty, progress, poName);
                }
            });

            // Register dataZoom event listener to synchronize scrolling
            ganttChart.on('dataZoom', function (params) {
                renderGanttHtmlOverlay(DATASETS[activeSource].gantt);
            });
        }

        // Bind Close Event Handlers
        const modalOverlay = document.getElementById('po-details-modal-overlay');
        const btnClose = document.getElementById('btn-close-po-modal');

        if (btnClose && modalOverlay) {
            const closeModal = function () {
                modalOverlay.classList.remove('active');
            };

            btnClose.addEventListener('click', closeModal);
            modalOverlay.addEventListener('click', function (e) {
                if (e.target === modalOverlay) {
                    closeModal();
                }
            });

            // Close on escape key
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                    closeModal();
                }
            });
        }
    }

    function openPOModal(poId, customer, orderCode, qty, progress, poName) {
        const modalOverlay = document.getElementById('po-details-modal-overlay');
        if (!modalOverlay) return;

        // Set metadata info
        document.getElementById('modal-po-title').innerText = poName || poId;
        document.getElementById('modal-po-customer').innerText = customer || 'N/A';
        document.getElementById('modal-po-ordercode').innerText = orderCode || 'N/A';
        document.getElementById('modal-po-style').innerText = orderCode || 'N/A';

        // Add total plan and progress to header cards
        const formattedQty = (typeof qty === 'number') ? qty.toLocaleString() : (qty || '0');
        document.getElementById('modal-po-total-plan').innerText = formattedQty + ' pcs';
        document.getElementById('modal-po-total-progress').innerText = (progress !== undefined && progress !== null) ? progress + '%' : '0%';

        // Clear table and show loading state
        const tbody = document.getElementById('po-details-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:2rem;color:var(--text-secondary);"><span class="spinner" style="display:inline-block;vertical-align:middle;margin-right:0.8rem;"></span>Đang tải dữ liệu...</td></tr>';
        }

        modalOverlay.classList.add('active');
        setTimeout(initializeMarquees, 50);

        // Fetch data
        if (activeSource === 'mock') {
            setTimeout(function () {
                const mockDetails = (DATASETS.mock && DATASETS.mock.poDetails) ? (DATASETS.mock.poDetails[poId] || []) : [];
                renderPODetailsTable(mockDetails);
            }, 300); // Small delay to feel realistic
        } else {
            fetch(`/DashboardTongQuanTienDo/GetPODetails?poId=${encodeURIComponent(poId)}`)
                .then(response => response.json())
                .then(res => {
                    if (res.success) {
                        renderPODetailsTable(res.data);
                    } else {
                        if (tbody) {
                            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:var(--color-red);padding:2rem;">Lỗi tải dữ liệu: ${res.message}</td></tr>`;
                        }
                        showToast(`Lỗi tải dữ liệu PO: ${res.message}`, 'error');
                    }
                })
                .catch(err => {
                    console.error('Error fetching PO Details:', err);
                    if (tbody) {
                        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--color-red);padding:2rem;">Lỗi kết nối mạng</td></tr>';
                    }
                    showToast('Lỗi kết nối mạng khi tải chi tiết PO', 'error');
                });
        }
    }

    function renderPODetailsTable(details) {
        const tbody = document.getElementById('po-details-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!details || details.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-secondary);padding:2rem;">Không có dữ liệu chi tiết</td></tr>';
            document.getElementById('modal-po-total-actual').innerText = '0 pcs';
            return;
        }

        // Sort details: Color name alphabetically, then Size by size-run ranking
        const sizeOrder = { 'XXS': 1, 'XS': 2, 'S': 3, 'M': 4, 'L': 5, 'XL': 6, 'XXL': 7, '3XL': 8, '4XL': 9, '5XL': 10 };
        details.sort((a, b) => {
            const colorA = a.TenMau || a.ColorId || '';
            const colorB = b.TenMau || b.ColorId || '';
            if (colorA !== colorB) {
                return colorA.localeCompare(colorB, 'vi', { sensitivity: 'base' });
            }
            const sizeA = (a.Size || a.SizeId || '').toUpperCase();
            const sizeB = (b.Size || b.SizeId || '').toUpperCase();
            const rankA = sizeOrder[sizeA] || 99;
            const rankB = sizeOrder[sizeB] || 99;
            return rankA - rankB;
        });

        // Calculate total actual and plan from detail rows (fallback/Mock Mode)
        let computedActual = 0;
        let computedPlan = 0;
        details.forEach(d => {
            computedActual += (d.SLTH || 0);
            computedPlan += (d.SLKH || 0);
        });

        // Hybrid check: Prefer pre-calculated database window aggregates, fallback to local summation
        const totalActual = (details[0] && typeof details[0].TongThucHien === 'number') ? details[0].TongThucHien : computedActual;
        const totalPlan = (details[0] && typeof details[0].TongKeHoach === 'number') ? details[0].TongKeHoach : computedPlan;

        document.getElementById('modal-po-total-actual').innerText = totalActual.toLocaleString() + ' pcs';
        document.getElementById('modal-po-total-plan').innerText = totalPlan.toLocaleString() + ' pcs';

        let progressPct;
        if (details[0] && typeof details[0].TienDo === 'number') {
            progressPct = details[0].TienDo.toFixed(1);
        } else {
            progressPct = (totalPlan > 0) ? ((totalActual / totalPlan) * 100).toFixed(1) : '0.0';
        }
        document.getElementById('modal-po-total-progress').innerText = progressPct + '%';

        // Update header cards dynamically if present in the database response
        const firstRow = details[0] || {};
        const styleId = firstRow.MaHang || firstRow.StyleId;
        const customerName = firstRow.TenKhachHang;
        const orderCode = firstRow.MaDonHang;

        if (styleId) {
            document.getElementById('modal-po-style').innerText = styleId;
        }
        if (customerName) {
            document.getElementById('modal-po-customer').innerText = customerName;
        }
        if (orderCode) {
            document.getElementById('modal-po-ordercode').innerText = orderCode;
        }

        // Group by Color name for dynamic rowspan
        const colorGroups = {};
        details.forEach(item => {
            const color = item.TenMau || item.ColorId || 'N/A';
            if (!colorGroups[color]) {
                colorGroups[color] = [];
            }
            colorGroups[color].push(item);
        });

        // Construct table rows
        for (const color in colorGroups) {
            const items = colorGroups[color];
            items.forEach((item, idx) => {
                const tr = document.createElement('tr');

                // Color Cell (only output on first row of this color group)
                if (idx === 0) {
                    const tdColor = document.createElement('td');
                    tdColor.rowSpan = items.length;
                    tdColor.innerHTML = `<div class="marquee-wrapper"><strong class="marquee-content">${color}</strong></div>`;
                    tdColor.style.verticalAlign = 'middle';
                    tdColor.style.borderRight = 'var(--card-border-val)';
                    tr.appendChild(tdColor);
                }

                // Size Cell
                const tdSize = document.createElement('td');
                tdSize.innerHTML = `<div class="marquee-wrapper"><span class="marquee-content">${item.Size || item.SizeId || 'N/A'}</span></div>`;
                tr.appendChild(tdSize);

                // Planned Quantity Cell
                const tdPlan = document.createElement('td');
                tdPlan.className = 'qty-num';
                tdPlan.innerText = (item.SLKH || 0).toLocaleString();
                tr.appendChild(tdPlan);

                // Actual Quantity Cell
                const tdActual = document.createElement('td');
                tdActual.className = 'qty-num';
                tdActual.innerText = (item.SLTH || 0).toLocaleString();
                tr.appendChild(tdActual);

                // Progress/Percentage Cell
                const tdProgress = document.createElement('td');
                tdProgress.className = 'qty-num';
                const pctVal = (typeof item.TyLe === 'number') ? item.TyLe : ((item.SLKH > 0) ? (item.SLTH / item.SLKH * 100) : 0);
                const pct = pctVal.toFixed(1) + '%';
                tdProgress.innerText = pct;

                // Add color code based on achievement rate
                if (pctVal >= 95) {
                    tdProgress.style.color = 'var(--color-green)';
                    tdProgress.style.fontWeight = 'bold';
                } else if (pctVal >= 80) {
                    tdProgress.style.color = 'var(--color-blue)';
                } else if (pctVal >= 50) {
                    tdProgress.style.color = 'var(--color-orange)';
                } else {
                    tdProgress.style.color = 'var(--color-red)';
                }
                tr.appendChild(tdProgress);

                tbody.appendChild(tr);
            });
        }
        setTimeout(initializeMarquees, 50);
    }

    function initRevenueModalEvent() {
        if (revenueChart) {
            revenueChart.on('click', function (params) {
                if (params.componentType === 'series') {
                    openRevenueModal(params.name);
                } else if (params.componentType === 'xAxis') {
                    openRevenueModal(params.value);
                }
            });
        }

        // Bind Close Event Handlers
        const modalOverlay = document.getElementById('revenue-details-modal-overlay');
        const btnClose = document.getElementById('btn-close-revenue-modal');

        if (btnClose && modalOverlay) {
            const closeModal = function () {
                modalOverlay.classList.remove('active');
            };

            btnClose.addEventListener('click', closeModal);
            modalOverlay.addEventListener('click', function (e) {
                if (e.target === modalOverlay) {
                    closeModal();
                }
            });

            // Close on escape key
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                    closeModal();
                }
            });
        }
    }

    function openRevenueModal(month) {
        const modalOverlay = document.getElementById('revenue-details-modal-overlay');
        if (!modalOverlay) return;

        // Set metadata info
        document.getElementById('modal-revenue-month-title').innerText = month;
        document.getElementById('modal-revenue-month-val').innerText = month;

        // Clear table and show loading state
        const tbody = document.getElementById('revenue-details-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-secondary);"><span class="spinner" style="display:inline-block;vertical-align:middle;margin-right:0.8rem;"></span>Đang tải dữ liệu...</td></tr>';
        }

        modalOverlay.classList.add('active');
        setTimeout(initializeMarquees, 50);

        // Fetch data
        if (activeSource === 'mock') {
            setTimeout(function () {
                const mockDetails = (DATASETS.mock && DATASETS.mock.monthlyLineRevenue) ? (DATASETS.mock.monthlyLineRevenue[month] || []) : [];
                renderRevenueDetailsTable(mockDetails);
            }, 300); // Small delay to feel realistic
        } else {
            fetch(`/DashboardTongQuanTienDo/GetMonthlyLineRevenue?month=${encodeURIComponent(month)}`)
                .then(response => response.json())
                .then(res => {
                    if (res.success) {
                        renderRevenueDetailsTable(res.data);
                    } else {
                        if (tbody) {
                            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--color-red);padding:2rem;">Lỗi tải dữ liệu: ${res.message}</td></tr>`;
                        }
                    }
                })
                .catch(err => {
                    console.error('Error fetching line revenue details:', err);
                    if (tbody) {
                        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--color-red);padding:2rem;">Lỗi kết nối mạng</td></tr>';
                    }
                });
        }
    }

    function renderRevenueDetailsTable(details) {
        const tbody = document.getElementById('revenue-details-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!details || details.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-secondary);padding:2rem;">Không có dữ liệu chi tiết</td></tr>';
            document.getElementById('modal-revenue-plan-val').innerText = '$0';
            document.getElementById('modal-revenue-total-val').innerText = '$0';
            document.getElementById('modal-revenue-percent-val').innerText = '0%';
            return;
        }

        // Calculate totals
        let totalRevenue = 0;
        let totalPlan = 0;
        details.forEach(d => {
            totalRevenue += (d.LineRevenue || 0);
            totalPlan += (d.LinePlanRevenue || 0);
        });

        // Set summary values
        document.getElementById('modal-revenue-plan-val').innerText = '$' + totalPlan.toLocaleString();
        document.getElementById('modal-revenue-total-val').innerText = '$' + totalRevenue.toLocaleString();
        const overallPercent = totalPlan > 0 ? (totalRevenue / totalPlan * 100).toFixed(1) + '%' : '0.0%';
        document.getElementById('modal-revenue-percent-val').innerText = overallPercent;

        // Construct table rows
        details.forEach(item => {
            const tr = document.createElement('tr');

            // Line Name
            const tdName = document.createElement('td');
            tdName.innerHTML = `<div class="marquee-wrapper"><strong class="marquee-content">${item.LineName || 'N/A'}</strong></div>`;
            tr.appendChild(tdName);

            // Plan Revenue
            const tdPlan = document.createElement('td');
            tdPlan.style.textAlign = 'right';
            tdPlan.innerText = '$' + (item.LinePlanRevenue || 0).toLocaleString();
            tr.appendChild(tdPlan);

            // Actual Revenue
            const tdRevenue = document.createElement('td');
            tdRevenue.style.textAlign = 'right';
            tdRevenue.innerText = '$' + (item.LineRevenue || 0).toLocaleString();
            tr.appendChild(tdRevenue);

            // Achievement Rate (Actual / Plan)
            const tdAchieve = document.createElement('td');
            tdAchieve.style.textAlign = 'right';
            const achieveRate = (item.LinePlanRevenue || 0) > 0
                ? (item.LineRevenue / item.LinePlanRevenue * 100).toFixed(1) + '%'
                : '0.0%';
            const isPositive = (item.LineRevenue >= item.LinePlanRevenue);
            tdAchieve.innerHTML = `<span style="color:${isPositive ? 'var(--color-green)' : 'var(--color-orange)'};font-weight:600;">${achieveRate}</span>`;
            tr.appendChild(tdAchieve);

            // Contribution Percentage
            const tdPct = document.createElement('td');
            tdPct.style.textAlign = 'right';
            const pct = totalRevenue > 0 ? ((item.LineRevenue || 0) / totalRevenue * 100).toFixed(1) + '%' : '0.0%';
            tdPct.innerHTML = `<span class="badge" style="background:rgba(52,210,238,0.1);color:var(--color-cyan);padding:0.2rem 0.6rem;border-radius:0.4rem;font-weight:600;">${pct}</span>`;
            tr.appendChild(tdPct);

            tbody.appendChild(tr);
        });
        setTimeout(initializeMarquees, 50);
    }

    function initPurchaseModalEvent() {
        if (purchaseChart) {
            purchaseChart.on('click', function (params) {
                if (params.componentType === 'series' && params.name) {
                    openPurchaseDetailsModal(params.name, 'all');
                } else if (params.componentType === 'yAxis' && params.value) {
                    openPurchaseDetailsModal(params.value, 'all');
                }
            });
        }

        // Bind KPI bubbles clicks
        ['purch-arrived', 'purch-ordered', 'purch-incoming', 'purch-fail'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const bubble = el.closest('.purchase-kpi-bubble');
                if (bubble) {
                    bubble.style.cursor = 'pointer';
                    bubble.addEventListener('click', function () {
                        const statusMap = {
                            'purch-arrived': 'arrived',
                            'purch-ordered': 'all',
                            'purch-incoming': 'incoming',
                            'purch-fail': 'fail'
                        };
                        openPurchaseDetailsModal('all', statusMap[id]);
                    });
                }
            }
        });

        // Close Event Handlers
        const modalOverlay = document.getElementById('purchase-details-modal-overlay');
        const btnClose = document.getElementById('btn-close-purch-modal');

        if (btnClose && modalOverlay) {
            const closeModal = function () {
                modalOverlay.classList.remove('active');
            };

            btnClose.addEventListener('click', closeModal);
            modalOverlay.addEventListener('click', function (e) {
                if (e.target === modalOverlay) {
                    closeModal();
                }
            });

            // Close on escape key
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                    closeModal();
                }
            });
        }
    }

    function openPurchaseDetailsModal(category, status) {
        const modalOverlay = document.getElementById('purchase-details-modal-overlay');
        if (!modalOverlay) return;

        const statusTextMap = {
            'arrived': 'Đã về',
            'ordered': 'Đã đặt',
            'incoming': 'Sắp về',
            'fail': 'Trễ'
        };

        const displayCategory = category === 'all' ? 'Tất cả chủng loại' : category;

        // Formulate header title and show/hide the status summary card
        if (status === 'all') {
            document.getElementById('modal-purch-title').innerText = displayCategory;
        } else {
            const displayStatus = statusTextMap[status] || status;
            document.getElementById('modal-purch-title').innerText = `${displayCategory} - ${displayStatus}`;
        }

        const statusCard = document.getElementById('modal-purch-status')?.closest('.po-summary-item');
        if (statusCard) {
            statusCard.style.display = status === 'all' ? 'none' : '';
        }

        const displayStatusText = statusTextMap[status] || status;
        document.getElementById('modal-purch-category').innerText = displayCategory;
        document.getElementById('modal-purch-status').innerText = displayStatusText;

        // Clear table and show loading state
        const tbody = document.getElementById('purchase-details-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="12" style="text-align:center;padding:2rem;color:var(--text-secondary);"><span class="spinner" style="display:inline-block;vertical-align:middle;margin-right:0.8rem;"></span>Đang tải dữ liệu...</td></tr>';
        }
        document.getElementById('modal-purch-total-qty').innerText = '0';

        modalOverlay.classList.add('active');
        setTimeout(initializeMarquees, 50);

        // Fetch details date range
        const startInput = document.getElementById('start-date');
        const endInput = document.getElementById('end-date');
        const startDate = startInput ? startInput.value.trim() : moment().startOf('month').format('DD/MM/YYYY');
        const endDate = endInput ? endInput.value.trim() : moment().endOf('month').format('DD/MM/YYYY');

        if (activeSource === 'mock') {
            setTimeout(function () {
                let mockDetails = [];
                if (DATASETS.mock && DATASETS.mock.purchaseDetails) {
                    mockDetails = DATASETS.mock.purchaseDetails.map(x => Object.assign({
                        KhoVai: x.MaCLVT && x.MaCLVT.includes('Vải') ? '145CM' : '',
                        MaMauVatTu: 'BLACK',
                        MauVatTu: 'BLACK'
                    }, x));
                }

                // Filter mock details
                let filtered = mockDetails.filter(x => {
                    const statusMatch = status === 'all' || x.TrangThai === status;
                    const categoryMatch = category === 'all' || x.MaCLVT === category;
                    return statusMatch && categoryMatch;
                });

                // Fallback: Generate dynamic records if mock list is empty for this category
                if (filtered.length === 0 && category !== 'all') {
                    const sampleNPLs = {
                        'Vải chính': ['Vải Cotton', 'Vải Kaki', 'Vải thun'],
                        'Vải lót': ['Vải mesh lining', 'Vải lót taffeta'],
                        'Dây kéo': ['Zipper YKK #5', 'Zipper YKK #3'],
                        'Chỉ may': ['Chỉ may Coats 40/2', 'Chỉ nylon'],
                        'Nút áo': ['Nút nhựa', 'Nút kim loại'],
                        'Tem nhãn': ['Tem nhãn Decathlon', 'Nhãn sườn'],
                        'ZIPPER': ['Dây kéo Zipper YKK #5', 'Dây kéo Zipper nylon'],
                        'REFLEX': ['Vải Reflex xám sáng', 'Băng phản quang 5cm'],
                        'SLIDER': ['Slider YKK #5', 'Slider YKK #3'],
                        'PULLER': ['Puller đầu khóa kéo', 'Dây kéo khóa silicone'],
                        'SNAP BUTTON': ['Nút bấm snaps kim loại', 'Nút đồng'],
                        'PLASTIC BUTTON': ['Nút nhựa 4 lỗ', 'Nút nhựa bọc vải'],
                        'VELCRO': ['Băng gai velcro 2.5cm', 'Băng dính gai velcro cuộn']
                    };
                    const sampleUnits = {
                        'Vải chính': 'm', 'Vải lót': 'm', 'Chỉ may': 'kg',
                        'Dây kéo': 'pcs', 'ZIPPER': 'pcs', 'REFLEX': 'm',
                        'SLIDER': 'pcs', 'PULLER': 'pcs', 'SNAP BUTTON': 'pcs',
                        'PLASTIC BUTTON': 'pcs', 'VELCRO': 'm'
                    };
                    const names = sampleNPLs[category] || [`Vật tư ${category} mẫu 1`, `Vật tư ${category} mẫu 2`];
                    const unit = sampleUnits[category] || 'pcs';

                    filtered = [
                        {
                            POID: 'PO2405' + String(Math.floor(Math.random() * 900) + 100),
                            MaHang: 'STYLE_' + String(Math.floor(Math.random() * 900) + 100),
                            TenNPL: names[0],
                            KhoVai: category.includes('Vải') ? '145CM' : '',
                            MaMauVatTu: 'BLACK',
                            MauVatTu: 'BLACK',
                            NhaCungCap: 'Nhà cung cấp Việt Nam',
                            SoLuong: Math.floor(Math.random() * 5000) + 500,
                            DonViTinh: unit,
                            NgayDuKien: moment().add(Math.floor(Math.random() * 10), 'days').format('YYYY-MM-DDTHH:mm:ss'),
                            TrangThai: status === 'all' ? 'arrived' : status,
                            MaCLVT: category,
                            KhachHang: 'Decathlon'
                        }
                    ];
                    if (names.length > 1) {
                        filtered.push({
                            POID: 'PO2405' + String(Math.floor(Math.random() * 900) + 100),
                            MaHang: 'STYLE_' + String(Math.floor(Math.random() * 900) + 100),
                            TenNPL: names[1],
                            KhoVai: category.includes('Vải') ? '58INCH' : '',
                            MaMauVatTu: 'Z9',
                            MauVatTu: 'DARK GREEN',
                            NhaCungCap: 'Nhà cung cấp ngoại nhập',
                            SoLuong: Math.floor(Math.random() * 3000) + 300,
                            DonViTinh: unit,
                            NgayDuKien: moment().add(Math.floor(Math.random() * 10), 'days').format('YYYY-MM-DDTHH:mm:ss'),
                            TrangThai: status === 'all' ? 'ordered' : status,
                            MaCLVT: category,
                            KhachHang: 'Adidas'
                        });
                    }
                }

                renderPurchaseDetailsTable(filtered);
            }, 300);
        } else {
            let categoryParam = category;
            if (category !== 'all' && DATASETS.sql && DATASETS.sql.purchaseTracking && DATASETS.sql.purchaseTracking.items) {
                const found = DATASETS.sql.purchaseTracking.items.find(x => x.itemCode === category);
                if (found && found.maCLVT) {
                    categoryParam = found.maCLVT;
                }
            }
            fetch(`/DashboardTongQuanTienDo/GetPurchaseTrackingDetails?category=${encodeURIComponent(categoryParam)}&status=${encodeURIComponent(status)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`)
                .then(response => response.json())
                .then(res => {
                    if (res.success) {
                        const mappedData = res.data.map(d => ({
                            POID: d.poid,
                            MaHang: d.maHang,
                            TenNPL: d.tenNPL,
                            KhoVai: d.khoVai,
                            MaMauVatTu: d.maMauVatTu,
                            MauVatTu: d.mauVatTu,
                            NhaCungCap: d.nhaCungCap,
                            SoLuong: d.soLuong,
                            DonViTinh: d.donViTinh,
                            NgayDuKien: d.ngayDuKien,
                            TrangThai: d.trangThai,
                            KhachHang: d.khachHang
                        }));
                        renderPurchaseDetailsTable(mappedData);
                    } else {
                        if (tbody) {
                            tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;color:var(--color-red);padding:2rem;">Lỗi tải dữ liệu: ${res.message}</td></tr>`;
                        }
                    }
                })
                .catch(err => {
                    console.error('Error fetching purchase details:', err);
                    if (tbody) {
                        tbody.innerHTML = '<tr><td colspan="12" style="text-align:center;color:var(--color-red);padding:2rem;">Lỗi kết nối mạng</td></tr>';
                    }
                });
        }
    }

    function renderPurchaseDetailsTable(details) {
        const tbody = document.getElementById('purchase-details-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!details || details.length === 0) {
            tbody.innerHTML = '<tr><td colspan="12" style="text-align:center;color:var(--text-secondary);padding:2rem;">Không có dữ liệu chi tiết</td></tr>';
            document.getElementById('modal-purch-total-qty').innerText = '0';
            return;
        }

        let totalQty = 0;

        details.forEach(item => {
            totalQty += (item.SoLuong || 0);

            const tr = document.createElement('tr');

            const tdPo = document.createElement('td');
            tdPo.innerHTML = `<div class="marquee-wrapper"><strong class="marquee-content">${item.POID || ''}</strong></div>`;
            tr.appendChild(tdPo);

            const tdStyle = document.createElement('td');
            tdStyle.innerHTML = `<div class="marquee-wrapper"><span class="marquee-content">${item.MaHang || ''}</span></div>`;
            tr.appendChild(tdStyle);

            const tdMaterial = document.createElement('td');
            tdMaterial.innerHTML = `<div class="marquee-wrapper"><span class="marquee-content">${item.TenNPL || ''}</span></div>`;
            tr.appendChild(tdMaterial);

            const tdKhoVai = document.createElement('td');
            tdKhoVai.innerHTML = `<div class="marquee-wrapper"><span class="marquee-content">${item.KhoVai || ''}</span></div>`;
            tr.appendChild(tdKhoVai);

            const tdMaMauVT = document.createElement('td');
            tdMaMauVT.innerHTML = `<div class="marquee-wrapper"><span class="marquee-content">${item.MaMauVatTu || ''}</span></div>`;
            tr.appendChild(tdMaMauVT);

            const tdMauVT = document.createElement('td');
            tdMauVT.innerHTML = `<div class="marquee-wrapper"><span class="marquee-content">${item.MauVatTu || ''}</span></div>`;
            tr.appendChild(tdMauVT);

            const tdSupplier = document.createElement('td');
            tdSupplier.innerHTML = `<div class="marquee-wrapper"><span class="marquee-content">${item.NhaCungCap || ''}</span></div>`;
            tr.appendChild(tdSupplier);

            const tdCustomer = document.createElement('td');
            tdCustomer.innerHTML = `<div class="marquee-wrapper"><span class="marquee-content">${item.KhachHang || ''}</span></div>`;
            tr.appendChild(tdCustomer);

            const tdQty = document.createElement('td');
            tdQty.className = 'qty-num';
            tdQty.innerText = (item.SoLuong || 0).toLocaleString();
            tr.appendChild(tdQty);

            const tdUnit = document.createElement('td');
            tdUnit.innerText = item.DonViTinh || 'pcs';
            tr.appendChild(tdUnit);

            const tdStatus = document.createElement('td');
            const statusColors = {
                'arrived': 'var(--color-green)',
                'ordered': 'var(--color-blue)',
                'incoming': 'var(--color-orange)',
                'fail': 'var(--color-red)'
            };
            const statusTextMap = {
                'arrived': 'Đã về',
                'ordered': 'Đã đặt',
                'incoming': 'Sắp về',
                'fail': 'Trễ'
            };
            const statusColor = statusColors[item.TrangThai] || 'var(--text-secondary)';
            const statusText = statusTextMap[item.TrangThai] || item.TrangThai || 'N/A';
            tdStatus.innerHTML = `<div style="display:flex;align-items:center;gap:0.6rem;">`
                + `<span style="display:inline-block;width:0.8rem;height:0.8rem;border-radius:50%;background-color:${statusColor};flex-shrink:0;"></span>`
                + `<span>${statusText}</span>`
                + `</div>`;
            tr.appendChild(tdStatus);

            const tdDate = document.createElement('td');
            let dateStr = 'N/A';
            if (item.NgayDuKien) {
                let parsedDate = null;
                if (typeof item.NgayDuKien === 'string' && item.NgayDuKien.includes('/')) {
                    const parts = item.NgayDuKien.split('/');
                    if (parts.length === 3) {
                        parsedDate = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
                    }
                }
                if (!parsedDate || isNaN(parsedDate.getTime())) {
                    parsedDate = new Date(item.NgayDuKien);
                }

                if (!isNaN(parsedDate.getTime())) {
                    const day = String(parsedDate.getDate()).padStart(2, '0');
                    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
                    const year = parsedDate.getFullYear();
                    dateStr = `${day}/${month}/${year}`;
                }
            }
            tdDate.innerText = dateStr;
            tr.appendChild(tdDate);

            tbody.appendChild(tr);
        });

        document.getElementById('modal-purch-total-qty').innerText = totalQty.toLocaleString();
        setTimeout(initializeMarquees, 50);
    }

    function initMaterialModalEvent() {
        const zoomBtn = document.getElementById('btn-zoom-materials');
        if (zoomBtn) {
            zoomBtn.style.cursor = 'pointer';
            zoomBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                openMaterialDetailsModal('all');
            });
        }

        // Close Event Handlers
        const modalOverlay = document.getElementById('material-details-modal-overlay');
        const btnClose = document.getElementById('btn-close-mat-modal');

        if (btnClose && modalOverlay) {
            const closeModal = function () {
                modalOverlay.classList.remove('active');
            };

            btnClose.addEventListener('click', closeModal);
            modalOverlay.addEventListener('click', function (e) {
                if (e.target === modalOverlay) {
                    closeModal();
                }
            });

            // Close on escape key
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                    closeModal();
                }
            });
        }

        // Bổ sung sự kiện tìm kiếm và gom nhóm tại Client cho NPL
        const searchInput = document.getElementById('mat-modal-search');
        const groupbySelect = document.getElementById('mat-modal-groupby');

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                applyMaterialFiltersAndGrouping();
            });
        }

        if (groupbySelect) {
            groupbySelect.addEventListener('change', function () {
                applyMaterialFiltersAndGrouping();
            });
        }
    }

    function initWipModalEvent() {
        if (wipChart) {
            // Click event disabled per user request
            /*
            wipChart.on('click', function (params) {
                const stageName = params.name || (params.value && params.value[2]);
                if (stageName) {
                    openWipDetailsModal(stageName);
                }
            });
            */
        }

        const modalOverlay = document.getElementById('wip-details-modal-overlay');
        const btnClose = document.getElementById('btn-close-wip-modal');

        if (btnClose && modalOverlay) {
            const closeModal = function () {
                modalOverlay.classList.remove('active');
            };

            btnClose.addEventListener('click', closeModal);
            modalOverlay.addEventListener('click', function (e) {
                if (e.target === modalOverlay) {
                    closeModal();
                }
            });

            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                    closeModal();
                }
            });
        }

        // Bổ sung sự kiện tìm kiếm và gom nhóm tại Client
        const searchInput = document.getElementById('wip-modal-search');
        const groupbySelect = document.getElementById('wip-modal-groupby');

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                applyWipFiltersAndGrouping();
            });
        }

        if (groupbySelect) {
            groupbySelect.addEventListener('change', function () {
                applyWipFiltersAndGrouping();
            });
        }
    }

    function openWipDetailsModal(stageFullName) {
        const modalOverlay = document.getElementById('wip-details-modal-overlay');
        if (!modalOverlay) return;

        let stageCode = 'CUT';
        const upperStage = stageFullName.toUpperCase();
        if (upperStage.startsWith('NHẬN') || upperStage.startsWith('NHÂN') || upperStage.startsWith('NHAN')) {
            stageCode = 'NHAN_TP';
        } else {
            const match = stageFullName.match(/^([A-Za-z0-9]+)/);
            if (match) {
                stageCode = match[1].toUpperCase();
            }
        }

        document.getElementById('modal-wip-stage-title').innerText = stageFullName;

        // Reset bộ lọc & tìm kiếm khi mở Modal mới
        const searchInput = document.getElementById('wip-modal-search');
        if (searchInput) searchInput.value = '';
        const groupbySelect = document.getElementById('wip-modal-groupby');
        if (groupbySelect) groupbySelect.value = 'none';

        const tbody = document.getElementById('wip-detail-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--text-secondary);"><span class="spinner" style="display:inline-block;vertical-align:middle;margin-right:0.8rem;"></span>Đang tải dữ liệu...</td></tr>';
        }

        modalOverlay.classList.add('active');
        setTimeout(initializeMarquees, 50);

        const startInput = document.getElementById('start-date');
        const endInput = document.getElementById('end-date');
        const startDate = startInput ? startInput.value.trim() : moment().startOf('month').format('DD/MM/YYYY');
        const endDate = endInput ? endInput.value.trim() : moment().endOf('month').format('DD/MM/YYYY');

        if (activeSource === 'mock') {
            setTimeout(function () {
                let mockDetails = [];
                if (DATASETS.mock && DATASETS.mock.wipDetails && DATASETS.mock.wipDetails[stageCode]) {
                    mockDetails = DATASETS.mock.wipDetails[stageCode];
                }
                modalOverlay.wipData = mockDetails;
                applyWipFiltersAndGrouping();
            }, 300);
        } else {
            fetch(`/DashboardTongQuanTienDo/GetWipDetail?stage=${encodeURIComponent(stageCode)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`)
                .then(response => response.json())
                .then(res => {
                    if (res.success) {
                        modalOverlay.wipData = res.data;
                        applyWipFiltersAndGrouping();
                    } else {
                        if (tbody) {
                            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--color-red);padding:2rem;">Lỗi tải dữ liệu: ${res.message}</td></tr>`;
                        }
                    }
                })
                .catch(err => {
                    console.error('Error fetching WIP details:', err);
                    if (tbody) {
                        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--color-red);padding:2rem;">Lỗi kết nối mạng</td></tr>';
                    }
                });
        }
    }

    function renderWipDetailsTableHeader(keys) {
        const thead = document.querySelector('#wip-detail-table thead');
        if (!thead) return;
        thead.innerHTML = '';
        const tr = document.createElement('tr');
        keys.forEach(key => {
            const th = document.createElement('th');
            th.innerText = key;
            if (key === 'STT' || key.includes('Thực Hiện') || key === 'SLKH' || key === 'SLTH') {
                th.style.textAlign = 'right';
            }
            tr.appendChild(th);
        });
        thead.appendChild(tr);
    }

    function applyWipFiltersAndGrouping() {
        const modalOverlay = document.getElementById('wip-details-modal-overlay');
        if (!modalOverlay || !modalOverlay.wipData) return;

        const rawData = modalOverlay.wipData;
        const searchInput = document.getElementById('wip-modal-search');
        const groupbySelect = document.getElementById('wip-modal-groupby');

        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const groupby = groupbySelect ? groupbySelect.value : 'none';

        // 1. Tìm kiếm nhanh trên mọi trường dữ liệu
        let filtered = rawData;
        if (query) {
            filtered = rawData.filter(x => {
                return Object.values(x).some(val =>
                    val !== null && val !== undefined && String(val).toLowerCase().includes(query)
                );
            });
        }

        // 2. Tính toán tóm tắt chỉ số WIP
        const uniquePlans = {};
        const uniqueLines = new Set();
        const uniqueJobs = new Set();
        let totalSLTH = 0;
        let totalSLKH = 0;

        let qtyColKey = '';
        let hasSLKH = false;
        if (filtered.length > 0) {
            qtyColKey = Object.keys(filtered[0]).find(k => k.includes('Thực Hiện')) || '';
            hasSLKH = Object.keys(filtered[0]).some(k => k === 'SLKH');
        }

        filtered.forEach(x => {
            const lineVal = x.Chuyen || x['Tên Chuyền'];
            const jobVal = x.MaLenh || x['Mã Lệnh'];
            const poVal = x.PO;
            const styleVal = x.MaHang || x['Mã Hàng'];
            const colorVal = x.Mau || x['Màu'];
            const sizeVal = x.Size;

            if (lineVal) uniqueLines.add(lineVal);
            if (jobVal) uniqueJobs.add(jobVal);

            if (hasSLKH) {
                const planKey = `${poVal || ''}|${styleVal || ''}|${colorVal || ''}|${sizeVal || ''}`;
                uniquePlans[planKey] = x.SLKH || 0;
            }

            let thucHienVal = 0;
            if (qtyColKey) {
                thucHienVal = parseFloat(x[qtyColKey] || 0);
            } else {
                thucHienVal = parseFloat(x.SLTH || x.ThucHien || 0);
            }
            totalSLTH += thucHienVal;
        });

        if (hasSLKH) {
            totalSLKH = Object.values(uniquePlans).reduce((a, b) => a + b, 0);
        }

        const progressPct = totalSLKH > 0 ? ((totalSLTH / totalSLKH) * 100).toFixed(1) + '%' : '-';

        document.getElementById('wip-summary-slkh').innerText = hasSLKH ? totalSLKH.toLocaleString() : '-';
        document.getElementById('wip-summary-slth').innerText = totalSLTH.toLocaleString();
        document.getElementById('wip-summary-progress').innerText = progressPct;
        document.getElementById('wip-summary-lines').innerText = uniqueLines.size.toLocaleString();
        document.getElementById('wip-summary-jobs').innerText = uniqueJobs.size.toLocaleString();

        // 3. Render bảng dữ liệu động
        const tbody = document.getElementById('wip-detail-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--text-secondary);padding:2rem;">Không tìm thấy dữ liệu phù hợp</td></tr>';
            return;
        }

        // Lấy danh sách keys động
        let keys = Object.keys(filtered[0]);

        // Render header động
        renderWipDetailsTableHeader(keys);

        if (groupby === 'none') {
            renderWipDetailsTableFlat(filtered, tbody, keys);
        } else {
            // Gom nhóm động theo key tương ứng
            let groupKey = 'Chuyen'; // mặc định cho mock
            if (activeSource !== 'mock') {
                groupKey = groupby === 'chuyen' ? 'Tên Chuyền' : 'Mã Lệnh';
            } else {
                groupKey = groupby === 'chuyen' ? 'Chuyen' : 'MaLenh';
            }
            renderWipDetailsTableGroupedDynamic(filtered, tbody, groupKey, keys);
        }
    }

    function renderWipDetailsTableFlat(details, tbody, keys) {
        details.forEach(item => {
            const tr = document.createElement('tr');
            let trHtml = '';
            keys.forEach(key => {
                let val = item[key];
                if (val === null || val === undefined) {
                    val = '-';
                }

                if (key === 'STT') {
                    trHtml += `<td style="text-align:right;">${val}</td>`;
                } else if (key.includes('Thực Hiện') || key === 'SLKH' || key === 'SLTH') {
                    const numVal = typeof val === 'number' ? val : parseFloat(val);
                    trHtml += `<td class="qty-num" style="text-align:right;">${isNaN(numVal) ? val : numVal.toLocaleString()}</td>`;
                } else {
                    trHtml += `<td><div class="marquee-wrapper"><span class="marquee-content">${val}</span></div></td>`;
                }
            });
            tr.innerHTML = trHtml;
            tbody.appendChild(tr);
        });
        setTimeout(initializeMarquees, 50);
    }

    function renderWipDetailsTableGroupedDynamic(details, tbody, groupKey, keys) {
        const groups = {};
        details.forEach(item => {
            const val = item[groupKey] === null || item[groupKey] === undefined ? '-' : item[groupKey];
            if (!groups[val]) {
                groups[val] = [];
            }
            groups[val].push(item);
        });

        let groupIdCounter = 0;
        const qtyColKey = keys.find(k => k.includes('Thực Hiện')) || keys[keys.length - 1];

        for (const groupName in groups) {
            groupIdCounter++;
            const groupItems = groups[groupName];
            const groupId = `wip-group-${groupIdCounter}`;

            let groupTotalSLTH = 0;
            groupItems.forEach(x => {
                groupTotalSLTH += parseFloat(x[qtyColKey] || 0);
            });

            const trGroup = document.createElement('tr');
            trGroup.className = 'group-row';
            trGroup.setAttribute('data-target-id', groupId);

            const colCount = keys.length;
            let groupHtml = `
                <td colspan="${colCount - 1}">
                    <span class="expand-toggle"><i class="fa-solid fa-chevron-right"></i></span>
                    <strong>${groupKey}: ${groupName}</strong> <span style="color:var(--text-secondary);font-size:0.9rem;font-style:italic;">(${groupItems.length} dòng)</span>
                </td>
                <td class="qty-num" style="font-weight: bold; color: var(--color-green); text-align: right;">${groupTotalSLTH.toLocaleString()}</td>
            `;
            trGroup.innerHTML = groupHtml;

            trGroup.addEventListener('click', function () {
                const targetId = this.getAttribute('data-target-id');
                const childRows = tbody.querySelectorAll(`tr.child-row[data-parent-id="${targetId}"]`);
                const isExpanded = this.classList.contains('expanded');

                if (isExpanded) {
                    this.classList.remove('expanded');
                    childRows.forEach(row => row.classList.add('hidden'));
                } else {
                    this.classList.add('expanded');
                    childRows.forEach(row => row.classList.remove('hidden'));
                }
            });

            tbody.appendChild(trGroup);

            groupItems.forEach(item => {
                const trChild = document.createElement('tr');
                trChild.className = `child-row hidden`;
                trChild.setAttribute('data-parent-id', groupId);

                let trHtml = '';
                keys.forEach(key => {
                    let val = item[key];
                    if (val === null || val === undefined) {
                        val = '-';
                    }

                    if (key === 'STT') {
                        trHtml += `<td style="text-align:right; padding-left: 1.5rem !important;">${val}</td>`;
                    } else if (key === groupKey) {
                        trHtml += `<td style="padding-left: 1.5rem !important;">${val}</td>`;
                    } else if (key.includes('Thực Hiện') || key === 'SLKH' || key === 'SLTH') {
                        const numVal = typeof val === 'number' ? val : parseFloat(val);
                        trHtml += `<td class="qty-num" style="text-align:right;">${isNaN(numVal) ? val : numVal.toLocaleString()}</td>`;
                    } else {
                        trHtml += `<td>${val}</td>`;
                    }
                });

                trChild.innerHTML = trHtml;
                tbody.appendChild(trChild);
            });
        }
        setTimeout(initializeMarquees, 50);
    }

    // ============================================
    // WIP PROGRESS DETAILS DRILLDOWN (ALL STAGES)
    // ============================================
    let wipProgressCurrentPage = 1;
    let wipProgressHasMore = true;
    let wipProgressIsLoading = false;
    let wipProgressAccumulatedData = [];

    function initWipProgressModalEvent() {
        const btnOpen = document.getElementById('btn-wip-progress-details');
        const modalOverlay = document.getElementById('wip-progress-details-modal-overlay');
        const btnClose = document.getElementById('btn-close-wip-progress-modal');

        if (btnOpen) {
            btnOpen.addEventListener('click', function () {
                openWipProgressDetailsModal();
            });
        }

        if (btnClose && modalOverlay) {
            const closeModal = function () {
                modalOverlay.classList.remove('active');
            };

            btnClose.addEventListener('click', closeModal);
            modalOverlay.addEventListener('click', function (e) {
                if (e.target === modalOverlay) {
                    closeModal();
                }
            });

            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                    closeModal();
                }
            });
        }

        // Search input with debounce
        const searchInput = document.getElementById('wip-progress-modal-search');
        let debounceTimer = null;
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(function () {
                    openWipProgressDetailsModal(); // Reload from page 1
                }, 300);
            });
        }

        // Grouping selector change listener
        const groupbySelect = document.getElementById('wip-progress-modal-groupby');
        if (groupbySelect) {
            groupbySelect.addEventListener('change', function () {
                openWipProgressDetailsModal(); // Reload from page 1
            });
        }

        // Scroll listener on container for Infinite Scroll
        const container = document.getElementById('wip-progress-table-container');
        if (container) {
            container.addEventListener('scroll', function () {
                const groupbySelect = document.getElementById('wip-progress-modal-groupby');
                const groupby = groupbySelect ? groupbySelect.value : 'none';

                // Only load next page when NOT grouping
                if (groupby === 'none' && container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
                    if (wipProgressHasMore && !wipProgressIsLoading) {
                        loadWipProgressData(wipProgressCurrentPage + 1, true);
                    }
                }
            });
        }
    }

    function openWipProgressDetailsModal() {
        const modalOverlay = document.getElementById('wip-progress-details-modal-overlay');
        if (!modalOverlay) return;

        wipProgressCurrentPage = 1;
        wipProgressHasMore = true;
        wipProgressIsLoading = false;
        wipProgressAccumulatedData = [];

        const tbody = document.getElementById('wip-progress-detail-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="18" style="text-align:center;padding:2rem;color:var(--text-secondary);"><span class="spinner" style="display:inline-block;vertical-align:middle;margin-right:0.8rem;"></span>Đang tải dữ liệu...</td></tr>';
        }

        modalOverlay.classList.add('active');

        // Load first page
        loadWipProgressData(1, false);
    }

    function loadWipProgressData(page, append = false) {
        if (wipProgressIsLoading) return;
        wipProgressIsLoading = true;

        const startInput = document.getElementById('start-date');
        const endInput = document.getElementById('end-date');
        const startDate = startInput ? startInput.value.trim() : moment().startOf('month').format('DD/MM/YYYY');
        const endDate = endInput ? endInput.value.trim() : moment().endOf('month').format('DD/MM/YYYY');

        const searchInput = document.getElementById('wip-progress-modal-search');
        const search = searchInput ? searchInput.value.trim() : '';

        const groupbySelect = document.getElementById('wip-progress-modal-groupby');
        const groupby = groupbySelect ? groupbySelect.value : 'none';

        // When grouping, load all matching items (pagesize = 999999) to perform complete local client-side aggregation
        const pageSize = groupby === 'none' ? 50 : 999999;

        const indicator = document.getElementById('wip-progress-loading-indicator');
        if (append && indicator) {
            indicator.style.display = 'block';
        }

        const tbody = document.getElementById('wip-progress-detail-table-body');

        if (activeSource === 'mock') {
            setTimeout(function () {
                if (indicator) indicator.style.display = 'none';

                let mockData = (DATASETS.mock && DATASETS.mock.wipProgressDetails) ? DATASETS.mock.wipProgressDetails : [];

                // Filter locally by search keyword
                if (search) {
                    const term = search.toLowerCase().trim();
                    mockData = mockData.filter(d =>
                        (d.MaLenh && d.MaLenh.toLowerCase().includes(term)) ||
                        (d.MaHang && d.MaHang.toLowerCase().includes(term)) ||
                        (d.PO && d.PO.toLowerCase().includes(term)) ||
                        (d.TenMau && d.TenMau.toLowerCase().includes(term))
                    );
                }

                // Paginate locally
                let paginatedData, hasMore;
                if (groupby === 'none') {
                    paginatedData = mockData.slice((page - 1) * pageSize, page * pageSize);
                    hasMore = mockData.length > page * pageSize;
                } else {
                    paginatedData = mockData;
                    hasMore = false;
                }

                displayWipProgressData(paginatedData, hasMore, page, append);
                wipProgressIsLoading = false;
            }, 300);
        } else {
            fetch(`/DashboardTongQuanTienDo/GetWipProgressDetail?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`)
                .then(response => response.json())
                .then(res => {
                    if (indicator) indicator.style.display = 'none';

                    if (res.success) {
                        displayWipProgressData(res.data, res.hasMore, page, append);
                    } else {
                        if (!append) {
                            tbody.innerHTML = `<tr><td colspan="18" style="text-align:center;color:var(--color-red);padding:2rem;">Lỗi tải dữ liệu: ${res.message}</td></tr>`;
                        } else {
                            showToast(`Lỗi khi tải thêm dữ liệu: ${res.message}`, 'error');
                        }
                    }
                    wipProgressIsLoading = false;
                })
                .catch(err => {
                    console.error('Error fetching WIP progress details:', err);
                    if (indicator) indicator.style.display = 'none';
                    if (!append) {
                        tbody.innerHTML = '<tr><td colspan="18" style="text-align:center;color:var(--color-red);padding:2rem;">Lỗi kết nối mạng</td></tr>';
                    } else {
                        showToast('Lỗi kết nối mạng', 'error');
                    }
                    wipProgressIsLoading = false;
                });
        }
    }

    function displayWipProgressData(data, hasMore, page, append) {
        const tbody = document.getElementById('wip-progress-detail-table-body');
        if (!tbody) return;

        wipProgressHasMore = hasMore;
        wipProgressCurrentPage = page;

        if (!append) {
            wipProgressAccumulatedData = [];
        }

        wipProgressAccumulatedData = wipProgressAccumulatedData.concat(data || []);

        if (wipProgressAccumulatedData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="18" style="text-align:center;padding:2rem;color:var(--text-secondary);">Không tìm thấy dữ liệu nào</td></tr>';
            return;
        }

        const groupbySelect = document.getElementById('wip-progress-modal-groupby');
        const groupby = groupbySelect ? groupbySelect.value : 'none';

        if (groupby === 'none') {
            // Calculate spans dynamically on current accumulated dataset
            const spans = [];
            let i = 0;
            while (i < wipProgressAccumulatedData.length) {
                let j = i + 1;
                const currentMaLenh = wipProgressAccumulatedData[i].MaLenh || '';
                while (j < wipProgressAccumulatedData.length && (wipProgressAccumulatedData[j].MaLenh || '') === currentMaLenh) {
                    j++;
                }
                const count = j - i;
                spans[i] = { rowspan: count };
                for (let k = i + 1; k < j; k++) {
                    spans[k] = { rowspan: 0 };
                }
                i = j;
            }

            let rowsHtml = '';
            wipProgressAccumulatedData.forEach((item, index) => {
                const stt = index + 1;
                const spanInfo = spans[index] || { rowspan: 1 };

                let maLenhCell = '';
                if (spanInfo.rowspan > 0) {
                    maLenhCell = `<td rowspan="${spanInfo.rowspan}" style="text-align: center; vertical-align: middle; background: var(--bg-card) !important; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.08);">${item.MaLenh || ''}</td>`;
                }

                let raChuyenTHCell = '';
                let raChuyenLKCell = '';
                if (spanInfo.rowspan > 0) {
                    raChuyenTHCell = `<td rowspan="${spanInfo.rowspan}" style="text-align: center; vertical-align: middle; background: var(--bg-card) !important; border-right: 1px solid rgba(255,255,255,0.08);">${formatNumber(item.RaChuyen_TH)}</td>`;
                    raChuyenLKCell = `<td rowspan="${spanInfo.rowspan}" style="text-align: center; vertical-align: middle; background: var(--bg-card) !important; font-weight: 500; border-right: 1px solid rgba(255,255,255,0.08);">${formatNumber(item.RaChuyen_LK)}</td>`;
                }

                let aqlTHCell = '';
                let aqlLKCell = '';
                if (spanInfo.rowspan > 0) {
                    aqlTHCell = `<td rowspan="${spanInfo.rowspan}" style="text-align: center; vertical-align: middle; background: var(--bg-card) !important; border-right: 1px solid rgba(255,255,255,0.08);">${formatNumber(item.SL_AQL_TH)}</td>`;
                    aqlLKCell = `<td rowspan="${spanInfo.rowspan}" style="text-align: center; vertical-align: middle; background: var(--bg-card) !important; font-weight: 500; border-right: 1px solid rgba(255,255,255,0.08);">${formatNumber(item.SL_AQL_LK)}</td>`;
                }

                rowsHtml += `
                    <tr>
                        <td style="text-align: center;">${stt}</td>
                        ${maLenhCell}
                        <td>${item.MaHang || ''}</td>
                        <td>${item.PO || ''}</td>
                        <td style="text-align: center;">${item.SizeType || '0'}</td>
                        <td>${item.TenMau || ''}</td>
                        <td style="text-align: center;">${item.Size || ''}</td>
                        <td style="text-align: right; font-weight: 500;">${formatNumber(item.Amount)}</td>
                        ${raChuyenTHCell}
                        ${raChuyenLKCell}
                        <td style="text-align: center;">${formatNumber(item.KCS_Dat_TH)}</td>
                        <td style="text-align: center; font-weight: 500;">${formatNumber(item.KCS_Dat_LK)}</td>
                        <td style="text-align: center;">${formatNumber(item.NhanTP_TH)}</td>
                        <td style="text-align: center; font-weight: 500;">${formatNumber(item.FinishedIn)}</td>
                        <td style="text-align: center;">${formatNumber(item.SLDongThung_TH)}</td>
                        <td style="text-align: center; font-weight: 500;">${formatNumber(item.SLDongThung_LK)}</td>
                        ${aqlTHCell}
                        ${aqlLKCell}
                    </tr>
                `;
            });

            tbody.innerHTML = rowsHtml;
        } else {
            tbody.innerHTML = '';
            renderWipProgressTableGrouped(wipProgressAccumulatedData, tbody, groupby);
        }
    }

    function renderWipProgressTableGrouped(details, tbody, groupby) {
        const groups = {};
        details.forEach(item => {
            let val = '';
            if (groupby === 'malenh') {
                val = item.MaLenh || '';
            } else if (groupby === 'mahang') {
                val = item.MaHang || '';
            }
            val = val ? val.trim() : 'N/A';

            if (!groups[val]) {
                groups[val] = [];
            }
            groups[val].push(item);
        });

        let groupIdCounter = 0;
        const groupLabel = groupby === 'malenh' ? 'Mã Lệnh SX' : 'Mã Hàng';

        for (const groupName in groups) {
            groupIdCounter++;
            const groupItems = groups[groupName];
            const groupId = `wip-group-${groupIdCounter}`;

            // Aggregate numeric fields
            let sumAmount = 0;
            let sumRaChuyenTH = 0, sumRaChuyenLK = 0;
            let sumKcsTH = 0, sumKcsLK = 0;
            let sumNhanTP = 0;
            let sumFinishedIn = 0;
            let sumDongThungTH = 0, sumDongThungLK = 0;
            let sumAqlTH = 0, sumAqlLK = 0;

            const seenMaLenh = new Set();
            groupItems.forEach(x => {
                sumAmount += (x.Amount || 0);
                sumKcsTH += (x.KCS_Dat_TH || 0);
                sumKcsLK += (x.KCS_Dat_LK || 0);
                sumNhanTP += (x.NhanTP_TH || 0);
                sumFinishedIn += (x.FinishedIn || 0);
                sumDongThungTH += (x.SLDongThung_TH || 0);
                sumDongThungLK += (x.SLDongThung_LK || 0);

                const lenh = x.MaLenh || '';
                if (!seenMaLenh.has(lenh)) {
                    seenMaLenh.add(lenh);
                    sumRaChuyenTH += (x.RaChuyen_TH || 0);
                    sumRaChuyenLK += (x.RaChuyen_LK || 0);
                    sumAqlTH += (x.SL_AQL_TH || 0);
                    sumAqlLK += (x.SL_AQL_LK || 0);
                }
            });

            const trGroup = document.createElement('tr');
            trGroup.className = 'group-row';
            trGroup.setAttribute('data-target-id', groupId);

            trGroup.innerHTML = `
                <td colspan="7">
                    <span class="expand-toggle"><i class="fa-solid fa-chevron-right"></i></span>
                    <strong>${groupLabel}: ${groupName}</strong> <span style="color:var(--text-secondary);font-size:0.9rem;font-style:italic;">(${groupItems.length} dòng)</span>
                </td>
                <td style="text-align: right; font-weight: bold; color: var(--color-green);">${formatNumber(sumAmount)}</td>
                <td style="text-align: center; font-weight: bold; color: var(--color-green);">${formatNumber(sumRaChuyenTH)}</td>
                <td style="text-align: center; font-weight: bold; color: var(--color-green);">${formatNumber(sumRaChuyenLK)}</td>
                <td style="text-align: center; font-weight: bold; color: var(--color-green);">${formatNumber(sumKcsTH)}</td>
                <td style="text-align: center; font-weight: bold; color: var(--color-green);">${formatNumber(sumKcsLK)}</td>
                <td style="text-align: center; font-weight: bold; color: var(--color-green);">${formatNumber(sumNhanTP)}</td>
                <td style="text-align: center; font-weight: bold; color: var(--color-green);">${formatNumber(sumFinishedIn)}</td>
                <td style="text-align: center; font-weight: bold; color: var(--color-green);">${formatNumber(sumDongThungTH)}</td>
                <td style="text-align: center; font-weight: bold; color: var(--color-green);">${formatNumber(sumDongThungLK)}</td>
                <td style="text-align: center; font-weight: bold; color: var(--color-green);">${formatNumber(sumAqlTH)}</td>
                <td style="text-align: center; font-weight: bold; color: var(--color-green);">${formatNumber(sumAqlLK)}</td>
            `;

            trGroup.addEventListener('click', function () {
                const targetId = this.getAttribute('data-target-id');
                const childRows = tbody.querySelectorAll(`tr.child-row[data-parent-id="${targetId}"]`);
                const isExpanded = this.classList.contains('expanded');

                if (isExpanded) {
                    this.classList.remove('expanded');
                    childRows.forEach(row => row.classList.add('hidden'));
                } else {
                    this.classList.add('expanded');
                    childRows.forEach(row => row.classList.remove('hidden'));
                }
            });

            tbody.appendChild(trGroup);

            // Calculate spans dynamically on group items (to merge child rows)
            const spans = [];
            let i = 0;
            while (i < groupItems.length) {
                let j = i + 1;
                const currentMaLenh = groupItems[i].MaLenh || '';
                while (j < groupItems.length && (groupItems[j].MaLenh || '') === currentMaLenh) {
                    j++;
                }
                const count = j - i;
                spans[i] = { rowspan: count };
                for (let k = i + 1; k < j; k++) {
                    spans[k] = { rowspan: 0 };
                }
                i = j;
            }

            groupItems.forEach((item, index) => {
                const trChild = document.createElement('tr');
                trChild.className = 'child-row hidden';
                trChild.setAttribute('data-parent-id', groupId);

                const spanInfo = spans[index] || { rowspan: 1 };

                let maLenhCell = '';
                if (spanInfo.rowspan > 0) {
                    maLenhCell = `<td rowspan="${spanInfo.rowspan}" style="text-align: center; vertical-align: middle; background: var(--bg-child-row) !important; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.08);">${item.MaLenh || ''}</td>`;
                }

                let raChuyenTHCell = '';
                let raChuyenLKCell = '';
                if (spanInfo.rowspan > 0) {
                    raChuyenTHCell = `<td rowspan="${spanInfo.rowspan}" style="text-align: center; vertical-align: middle; background: var(--bg-child-row) !important; border-right: 1px solid rgba(255,255,255,0.08);">${formatNumber(item.RaChuyen_TH)}</td>`;
                    raChuyenLKCell = `<td rowspan="${spanInfo.rowspan}" style="text-align: center; vertical-align: middle; background: var(--bg-child-row) !important; font-weight: 500; border-right: 1px solid rgba(255,255,255,0.08);">${formatNumber(item.RaChuyen_LK)}</td>`;
                }

                let aqlTHCell = '';
                let aqlLKCell = '';
                if (spanInfo.rowspan > 0) {
                    aqlTHCell = `<td rowspan="${spanInfo.rowspan}" style="text-align: center; vertical-align: middle; background: var(--bg-child-row) !important; border-right: 1px solid rgba(255,255,255,0.08);">${formatNumber(item.SL_AQL_TH)}</td>`;
                    aqlLKCell = `<td rowspan="${spanInfo.rowspan}" style="text-align: center; vertical-align: middle; background: var(--bg-child-row) !important; font-weight: 500; border-right: 1px solid rgba(255,255,255,0.08);">${formatNumber(item.SL_AQL_LK)}</td>`;
                }

                trChild.innerHTML = `
                    <td style="text-align: center; padding-left: 1.5rem;">${index + 1}</td>
                    ${maLenhCell}
                    <td>${item.MaHang || ''}</td>
                    <td>${item.PO || ''}</td>
                    <td style="text-align: center;">${item.SizeType || '0'}</td>
                    <td>${item.TenMau || ''}</td>
                    <td style="text-align: center;">${item.Size || ''}</td>
                    <td style="text-align: right;">${formatNumber(item.Amount)}</td>
                    ${raChuyenTHCell}
                    ${raChuyenLKCell}
                    <td style="text-align: center;">${formatNumber(item.KCS_Dat_TH)}</td>
                    <td style="text-align: center;">${formatNumber(item.KCS_Dat_LK)}</td>
                    <td style="text-align: center;">${formatNumber(item.NhanTP_TH)}</td>
                    <td style="text-align: center;">${formatNumber(item.FinishedIn)}</td>
                    <td style="text-align: center;">${formatNumber(item.SLDongThung_TH)}</td>
                    <td style="text-align: center;">${formatNumber(item.SLDongThung_LK)}</td>
                    ${aqlTHCell}
                    ${aqlLKCell}
                `;
                tbody.appendChild(trChild);
            });
        }
        setTimeout(initializeMarquees, 50);
    }

    function formatNumber(num) {
        if (num === null || num === undefined) return '0';
        return Number(num).toLocaleString('vi-VN');
    }


    function openMaterialDetailsModal(categoryCode, categoryName) {
        const modalOverlay = document.getElementById('material-details-modal-overlay');
        if (!modalOverlay) return;

        const displayCategory = categoryCode === 'all' ? 'Tất cả loại' : (categoryName || categoryCode);

        document.getElementById('modal-mat-title').innerText = displayCategory;
        document.getElementById('modal-mat-category').innerText = displayCategory;

        // Reset bộ lọc & tìm kiếm khi mở Modal mới
        const searchInput = document.getElementById('mat-modal-search');
        if (searchInput) searchInput.value = '';
        const groupbySelect = document.getElementById('mat-modal-groupby');
        if (groupbySelect) groupbySelect.value = 'none';

        // Clear table and show loading state
        const tbody = document.getElementById('material-details-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:2rem;color:var(--text-secondary);"><span class="spinner" style="display:inline-block;vertical-align:middle;margin-right:0.8rem;"></span>Đang tải dữ liệu...</td></tr>';
        }
        document.getElementById('modal-mat-total-qty').innerText = '0';

        modalOverlay.classList.add('active');
        setTimeout(initializeMarquees, 50);

        // Fetch details date range
        const startInput = document.getElementById('start-date');
        const endInput = document.getElementById('end-date');
        const startDate = startInput ? startInput.value.trim() : moment().startOf('month').format('DD/MM/YYYY');
        const endDate = endInput ? endInput.value.trim() : moment().endOf('month').format('DD/MM/YYYY');

        if (activeSource === 'mock') {
            setTimeout(function () {
                let mockDetails = [];
                if (DASHBOARD_DATA && DASHBOARD_DATA.datasets && DASHBOARD_DATA.datasets.mock && DASHBOARD_DATA.datasets.mock.materialDetails) {
                    mockDetails = DASHBOARD_DATA.datasets.mock.materialDetails;
                }

                // Filter mock details
                const filtered = mockDetails.filter(x => {
                    return categoryCode === 'all' || x.ChungLoaiVatTu === categoryCode || x.MaCLVT === categoryCode;
                });

                modalOverlay.materialData = filtered;
                applyMaterialFiltersAndGrouping();
            }, 300);
        } else {
            fetch(`/DashboardTongQuanTienDo/GetMaterialStatusDetails?category=${encodeURIComponent(categoryCode)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`)
                .then(response => response.json())
                .then(res => {
                    if (res.success) {
                        modalOverlay.materialData = res.data;
                        applyMaterialFiltersAndGrouping();
                    } else {
                        if (tbody) {
                            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:var(--color-red);padding:2rem;">Lỗi tải dữ liệu: ${res.message}</td></tr>`;
                        }
                    }
                })
                .catch(err => {
                    console.error('Error fetching material details:', err);
                    if (tbody) {
                        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:var(--color-red);padding:2rem;">Lỗi kết nối mạng</td></tr>';
                    }
                });
        }
    }

    function applyMaterialFiltersAndGrouping() {
        const modalOverlay = document.getElementById('material-details-modal-overlay');
        if (!modalOverlay || !modalOverlay.materialData) return;

        const rawData = modalOverlay.materialData;
        const searchInput = document.getElementById('mat-modal-search');
        const groupbySelect = document.getElementById('mat-modal-groupby');

        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const groupby = groupbySelect ? groupbySelect.value : 'none';

        // 1. Tìm kiếm nhanh trên mọi trường dữ liệu
        let filtered = rawData;
        if (query) {
            filtered = rawData.filter(x => {
                return Object.values(x).some(val =>
                    val !== null && val !== undefined && String(val).toLowerCase().includes(query)
                );
            });
        }

        // 2. Tính tổng số lượng
        let totalQty = 0;
        filtered.forEach(x => {
            totalQty += (x.SoLuong || x.soLuong || 0);
        });
        document.getElementById('modal-mat-total-qty').innerText = totalQty.toLocaleString();

        // 3. Render bảng
        const tbody = document.getElementById('material-details-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:var(--text-secondary);padding:2rem;">Không tìm thấy dữ liệu phù hợp</td></tr>';
            return;
        }

        if (groupby === 'none') {
            renderMaterialDetailsTableFlat(filtered, tbody);
        } else {
            renderMaterialDetailsTableGrouped(filtered, tbody, groupby);
        }
    }

    function renderMaterialDetailsTableFlat(details, tbody) {
        details.forEach((item, index) => {
            const tr = document.createElement('tr');

            // STT
            const tdStt = document.createElement('td');
            tdStt.innerText = index + 1;
            tr.appendChild(tdStt);

            // MÃ HÀNG
            const tdStyle = document.createElement('td');
            const styleVal = item.MaHang || item.maHang || item.Style || item.style || item.StyleID || item.styleID || '';
            tdStyle.innerHTML = styleVal ? `<div class="marquee-wrapper"><span class="marquee-content">${styleVal}</span></div>` : 'N/A';
            tr.appendChild(tdStyle);

            // MÃ LỆNH SẢN XUẤT
            const tdMaLenh = document.createElement('td');
            const maLenhVal = item.MaLenh || item.maLenh || item.MaLenhSX || item.maLenhSX || '';
            tdMaLenh.innerHTML = maLenhVal ? `<div class="marquee-wrapper"><span class="marquee-content">${maLenhVal}</span></div>` : 'N/A';
            tr.appendChild(tdMaLenh);

            // ITEMCODE
            const tdItemCode = document.createElement('td');
            const itemCodeVal = item.ItemCode || item.itemCode || '';
            tdItemCode.innerHTML = itemCodeVal ? `<div class="marquee-wrapper"><span class="marquee-content">${itemCodeVal}</span></div>` : 'N/A';
            tr.appendChild(tdItemCode);

            // MÃ MÀU VT
            const tdMaMauVT = document.createElement('td');
            tdMaMauVT.innerText = item.MaMauVT || item.maMauVt || 'N/A';
            tr.appendChild(tdMaMauVT);

            // MÀU
            const tdMau = document.createElement('td');
            const mauVal = item.Mau || item.mau || '';
            tdMau.innerHTML = mauVal ? `<div class="marquee-wrapper"><span class="marquee-content">${mauVal}</span></div>` : 'N/A';
            tr.appendChild(tdMau);

            // WIDTH/SIZE
            const tdWidthSize = document.createElement('td');
            tdWidthSize.innerText = item.WidthSize || item.widthSize || 'N/A';
            tr.appendChild(tdWidthSize);

            // ĐƠN VỊ VT
            const tdDonViVT = document.createElement('td');
            tdDonViVT.innerText = item.DonViVT || item.donViVt || 'pcs';
            tr.appendChild(tdDonViVT);

            // KHÁCH HÀNG
            const tdCustomer = document.createElement('td');
            tdCustomer.innerText = item.KhachHang || item.khachHang || 'N/A';
            tr.appendChild(tdCustomer);

            // SỐ LƯỢNG
            const tdQty = document.createElement('td');
            tdQty.style.textAlign = 'right';
            const qtyVal = item.SoLuong || item.soLuong || 0;
            tdQty.innerText = qtyVal.toLocaleString();
            tr.appendChild(tdQty);

            tbody.appendChild(tr);
        });
        setTimeout(initializeMarquees, 50);
    }

    function renderMaterialDetailsTableGrouped(details, tbody, groupby) {
        const groups = {};
        details.forEach(item => {
            let val = '';
            if (groupby === 'malenh') {
                val = item.MaLenh || item.maLenh || item.MaLenhSX || item.maLenhSX || '';
            } else if (groupby === 'mahang') {
                val = item.MaHang || item.maHang || item.Style || item.style || item.StyleID || item.styleID || '';
            }
            val = val ? val.trim() : 'N/A';

            if (!groups[val]) {
                groups[val] = [];
            }
            groups[val].push(item);
        });

        let groupIdCounter = 0;
        const groupLabel = groupby === 'malenh' ? 'Mã Lệnh SX' : 'Mã Hàng';

        for (const groupName in groups) {
            groupIdCounter++;
            const groupItems = groups[groupName];
            const groupId = `mat-group-${groupIdCounter}`;

            let groupTotalQty = 0;
            groupItems.forEach(x => {
                groupTotalQty += (x.SoLuong || x.soLuong || 0);
            });

            const trGroup = document.createElement('tr');
            trGroup.className = 'group-row';
            trGroup.setAttribute('data-target-id', groupId);

            let groupHtml = `
                <td colspan="9">
                    <span class="expand-toggle"><i class="fa-solid fa-chevron-right"></i></span>
                    <strong>${groupLabel}: ${groupName}</strong> <span style="color:var(--text-secondary);font-size:0.9rem;font-style:italic;">(${groupItems.length} dòng)</span>
                </td>
                <td class="qty-num" style="font-weight: bold; color: var(--color-green); text-align: right;">${groupTotalQty.toLocaleString()}</td>
            `;
            trGroup.innerHTML = groupHtml;

            trGroup.addEventListener('click', function () {
                const targetId = this.getAttribute('data-target-id');
                const childRows = tbody.querySelectorAll(`tr.child-row[data-parent-id="${targetId}"]`);
                const isExpanded = this.classList.contains('expanded');

                if (isExpanded) {
                    this.classList.remove('expanded');
                    childRows.forEach(row => row.classList.add('hidden'));
                } else {
                    this.classList.add('expanded');
                    childRows.forEach(row => row.classList.remove('hidden'));
                }
            });

            tbody.appendChild(trGroup);

            groupItems.forEach((item, index) => {
                const trChild = document.createElement('tr');
                trChild.className = 'child-row hidden';
                trChild.setAttribute('data-parent-id', groupId);

                // STT
                const tdStt = document.createElement('td');
                tdStt.style.textAlign = 'right';
                tdStt.style.paddingLeft = '1.5rem';
                tdStt.innerText = index + 1;
                trChild.appendChild(tdStt);

                // MÃ HÀNG
                const tdStyle = document.createElement('td');
                const styleVal = item.MaHang || item.maHang || item.Style || item.style || item.StyleID || item.styleID || '';
                tdStyle.innerHTML = styleVal ? `<div class="marquee-wrapper"><span class="marquee-content">${styleVal}</span></div>` : 'N/A';
                trChild.appendChild(tdStyle);

                // MÃ LỆNH SẢN XUẤT
                const tdMaLenh = document.createElement('td');
                const maLenhVal = item.MaLenh || item.maLenh || item.MaLenhSX || item.maLenhSX || '';
                tdMaLenh.innerHTML = maLenhVal ? `<div class="marquee-wrapper"><span class="marquee-content">${maLenhVal}</span></div>` : 'N/A';
                trChild.appendChild(tdMaLenh);

                // ITEMCODE
                const tdItemCode = document.createElement('td');
                const itemCodeVal = item.ItemCode || item.itemCode || '';
                tdItemCode.innerHTML = itemCodeVal ? `<div class="marquee-wrapper"><span class="marquee-content">${itemCodeVal}</span></div>` : 'N/A';
                trChild.appendChild(tdItemCode);

                // MÃ MÀU VT
                const tdMaMauVT = document.createElement('td');
                tdMaMauVT.innerText = item.MaMauVT || item.maMauVt || 'N/A';
                trChild.appendChild(tdMaMauVT);

                // MÀU
                const tdMau = document.createElement('td');
                const mauVal = item.Mau || item.mau || '';
                tdMau.innerHTML = mauVal ? `<div class="marquee-wrapper"><span class="marquee-content">${mauVal}</span></div>` : 'N/A';
                trChild.appendChild(tdMau);

                // WIDTH/SIZE
                const tdWidthSize = document.createElement('td');
                tdWidthSize.innerText = item.WidthSize || item.widthSize || 'N/A';
                trChild.appendChild(tdWidthSize);

                // ĐƠN VỊ VT
                const tdDonViVT = document.createElement('td');
                tdDonViVT.innerText = item.DonViVT || item.donViVt || 'pcs';
                trChild.appendChild(tdDonViVT);

                // KHÁCH HÀNG
                const tdCustomer = document.createElement('td');
                tdCustomer.innerText = item.KhachHang || item.khachHang || 'N/A';
                trChild.appendChild(tdCustomer);

                // SỐ LƯỢNG
                const tdQty = document.createElement('td');
                tdQty.style.textAlign = 'right';
                const qtyVal = item.SoLuong || item.soLuong || 0;
                tdQty.innerText = qtyVal.toLocaleString();
                trChild.appendChild(tdQty);

                tbody.appendChild(trChild);
            });
        }
        setTimeout(initializeMarquees, 50);
    }

    function initFullscreenToggle() {
        const zoomBtns = document.querySelectorAll('.btn-zoom:not(#btn-zoom-materials)');
        zoomBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const card = this.closest('.grid-card');
                if (!card) return;

                card.classList.toggle('fullscreen');

                const icon = this.querySelector('svg');
                if (card.classList.contains('fullscreen')) {
                    icon.innerHTML = '<polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line>';
                    this.setAttribute('title', 'Thu nhỏ');
                    this.setAttribute('aria-label', 'Thu nhỏ');
                } else {
                    icon.innerHTML = '<polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line>';
                    this.setAttribute('title', 'Phóng to');
                    this.setAttribute('aria-label', 'Phóng to');
                }

                // Allow CSS transition and layout to update before resizing charts
                // We run resize multiple times to make sure that the browser has fully reflowed the layout
                setTimeout(resizeAllCharts, 100);
                setTimeout(resizeAllCharts, 250);
                setTimeout(resizeAllCharts, 500);
            });
        });
    }

    function fetchSqlMetrics() {
        const loader = document.getElementById('sql-loader');
        if (loader) loader.style.display = 'inline-flex';

        // Fetch date range from UI inputs
        const startInput = document.getElementById('start-date');
        const endInput = document.getElementById('end-date');
        const startDate = startInput ? startInput.value.trim() : moment().startOf('month').format('DD/MM/YYYY');
        const endDate = endInput ? endInput.value.trim() : moment().endOf('month').format('DD/MM/YYYY');

        const statsPromise = fetch(`/DashboardTongQuanTienDo/GetDashboardStats?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`)
            .then(response => response.json());

        const revenuePromise = fetch(`/DashboardTongQuanTienDo/GetMonthlyRevenue?startDate=&endDate=${encodeURIComponent(endDate)}`)
            .then(response => response.json());

        const ganttPromise = fetch(`/DashboardTongQuanTienDo/GetGanttData?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`)
            .then(response => response.json());

        const wipPromise = fetch(`/DashboardTongQuanTienDo/GetWipData?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`)
            .then(response => response.json());

        const shipmentPromise = fetch(`/DashboardTongQuanTienDo/GetShipmentStats?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`)
            .then(response => response.json());

        const purchasePromise = fetch(`/DashboardTongQuanTienDo/GetPurchaseTrackingData?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`)
            .then(response => response.json());

        const materialsPromise = fetch(`/DashboardTongQuanTienDo/GetMaterialsData?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`)
            .then(response => response.json());

        Promise.all([statsPromise, revenuePromise, ganttPromise, wipPromise, shipmentPromise, purchasePromise, materialsPromise])
            .then(([statsData, revenueData, ganttData, wipData, shipmentData, purchaseData, materialsData]) => {
                if (statsData.success) {
                    if (DATASETS && DATASETS.sql) {
                        DATASETS.sql.kpis.totalOrders = statsData.totalOrders;
                        DATASETS.sql.kpis.prodOrders = statsData.prodOrders;
                        if (DATASETS.sql.wip) {
                            DATASETS.sql.wip.prodOrders = statsData.prodOrders;
                        }
                        if (statsData.customerRevenue) {
                            DATASETS.sql.customerRevenue = statsData.customerRevenue;
                        } else {
                            DATASETS.sql.customerRevenue = [];
                        }

                        // Update Revenue and Growth from SQL Stored Procedure
                        DATASETS.sql.kpis.revenue = statsData.currentRevenue || 0;
                        DATASETS.sql.kpis.revenueGrowth = statsData.revenueGrowth || 0;

                        DATASETS.sql.revenueStats.total = (statsData.currentRevenue || 0).toLocaleString() + " USD";
                        const sqlPlan = statsData.targetRevenue || 0;
                        DATASETS.sql.revenueStats.plan = sqlPlan.toLocaleString() + " USD";
                        DATASETS.sql.revenueStats.percent = (sqlPlan > 0 ? (((statsData.currentRevenue || 0) / sqlPlan) * 100).toFixed(1) : "0.0") + "%";
                    }
                } else {
                    console.error('SQL Procedure Stats Error:', statsData.message);
                }

                if (shipmentData.success) {
                    if (DATASETS && DATASETS.sql) {
                        DATASETS.sql.kpis.deliveredOrders = shipmentData.deliveredOrders;
                        DATASETS.sql.kpis.lateOrders = shipmentData.lateOrders;
                        DATASETS.sql.kpis.otd = shipmentData.otd;
                    }
                } else {
                    console.error('SQL Procedure Shipment Stats Error:', shipmentData.message);
                }

                if (revenueData.success) {
                    if (DATASETS && DATASETS.sql) {
                        DATASETS.sql.revenueChart = {
                            months: revenueData.months || [],
                            revenue: revenueData.revenue || [],
                            plan: revenueData.plan || []
                        };
                    }
                } else {
                    console.error('SQL Procedure Revenue Range Error:', revenueData.message);
                }

                if (ganttData.success) {
                    if (DATASETS && DATASETS.sql) {
                        DATASETS.sql.gantt = ganttData.data || [];
                    }
                } else {
                    console.error('SQL Procedure Gantt Data Error:', ganttData.message);
                }

                if (wipData.success) {
                    if (DATASETS && DATASETS.sql) {
                        DATASETS.sql.wip = wipData.data;

                        // Dynamically calculate stage progress percentages from real SQL data
                        if (DATASETS.sql.kanban && wipData.data) {
                            // 1. NPL: từ stored procedure sp_Get_BaoCaoTongHopNhuCauNPL
                            const pctNpl = typeof wipData.data.pctNpl !== 'undefined' ? Math.round(wipData.data.pctNpl) : 97;
                            if (DATASETS.sql.kanban[0]) DATASETS.sql.kanban[0].progress = pctNpl;

                            // 2. CẮT: lấy SL cắt / SLKH
                            const pctCut = typeof wipData.data.pctCut !== 'undefined' ? Math.round(wipData.data.pctCut) : 92;
                            if (DATASETS.sql.kanban[1]) DATASETS.sql.kanban[1].progress = pctCut;

                            const totalAmount = wipData.data.totalAmount || 0;
                            if (totalAmount > 0) {
                                // 3. MAY: Tổng RaChuyen_LK / Tổng Amount
                                const pctSew = Math.round((wipData.data.totalRaChuyenLK / totalAmount) * 100);
                                if (DATASETS.sql.kanban[2]) DATASETS.sql.kanban[2].progress = pctSew;

                                // 4. HOÀN THIỆN: Tổng KCS_Dat_LK / Tổng Amount
                                const pctEndline = Math.round((wipData.data.totalKcsLK / totalAmount) * 100);
                                if (DATASETS.sql.kanban[3]) DATASETS.sql.kanban[3].progress = pctEndline;

                                // 5. NHẬN TP: Tổng FinishedIn / Tổng Amount
                                const pctNhanTP = Math.round((wipData.data.totalFinishedIn / totalAmount) * 100);
                                if (DATASETS.sql.kanban[4]) DATASETS.sql.kanban[4].progress = pctNhanTP;

                                // 6. ĐÓNG GÓI: Tổng SLDongThung_LK / Tổng Amount
                                const pctPack = Math.round((wipData.data.totalDongThungLK / totalAmount) * 100);
                                if (DATASETS.sql.kanban[5]) DATASETS.sql.kanban[5].progress = pctPack;

                                // 7. KIỂM HÀNG: Tổng SL_AQL_LK / Tổng Amount
                                const pctAql = Math.round((wipData.data.totalAqlLK / totalAmount) * 100);
                                if (DATASETS.sql.kanban[6]) DATASETS.sql.kanban[6].progress = pctAql;
                            } else {
                                // Fallback to 0 if totalAmount is 0
                                if (DATASETS.sql.kanban[2]) DATASETS.sql.kanban[2].progress = 0;
                                if (DATASETS.sql.kanban[3]) DATASETS.sql.kanban[3].progress = 0;
                                if (DATASETS.sql.kanban[4]) DATASETS.sql.kanban[4].progress = 0;
                                if (DATASETS.sql.kanban[5]) DATASETS.sql.kanban[5].progress = 0;
                                if (DATASETS.sql.kanban[6]) DATASETS.sql.kanban[6].progress = 0;
                            }
                        }
                    }
                } else {
                    console.error('SQL Procedure WIP Data Error:', wipData.message);
                }

                if (purchaseData.success) {
                    if (DATASETS && DATASETS.sql) {
                        DATASETS.sql.purchaseTracking = purchaseData.data;
                    }
                } else {
                    console.error('SQL Procedure Purchase Tracking Data Error:', purchaseData.message);
                }

                if (materialsData && materialsData.success) {
                    if (DATASETS && DATASETS.sql) {
                        DATASETS.sql.materials = materialsData.materials;
                    }
                } else {
                    console.error('SQL Procedure Materials Data Error:', materialsData ? materialsData.message : 'Unknown error');
                }

                if (loader) loader.style.display = 'none';
                renderDashboard();
            })
            .catch(err => {
                console.error('Network/AJAX Error:', err);
                if (loader) loader.style.display = 'none';
                renderDashboard();
            });
    }
})();
