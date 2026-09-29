using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

using NtbSoft.ERP.Model.Kho;

namespace NtbSoft.ERP.Model.DashboardKho
{

    public static class DashboardKhoDesktopModel
    {
        // v2.3.15 — Cache đơn giản dùng Dictionary + DateTime (không cần thêm assembly).
        // TTL ngắn (5 phút) để data vẫn cập nhật mới đều đặn.
        private const int CACHE_MINUTES = 5;
        private static readonly Dictionary<string, CachedEntry> _cache = new Dictionary<string, CachedEntry>();
        private static readonly object _cacheLock = new object();

        private class CachedEntry
        {
            public DataTable Data;
            public DateTime ExpiresAt;
        }

        private static DataTable GetOrCache(string key, Func<DataTable> producer)
        {
            // Đọc cache nhanh
            lock (_cacheLock)
            {
                CachedEntry entry;
                if (_cache.TryGetValue(key, out entry) && entry.ExpiresAt > DateTime.UtcNow)
                {
                    return entry.Data;
                }
            }

            // Cache miss → run producer (ngoài lock để không block other readers)
            var dt = producer();

            lock (_cacheLock)
            {
                _cache[key] = new CachedEntry
                {
                    Data = dt,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(CACHE_MINUTES)
                };
            }
            return dt;
        }

        /// <summary>Xoá cache (gọi từ API nếu admin muốn force refresh).</summary>
        public static void ClearCache()
        {
            lock (_cacheLock) { _cache.Clear(); }
        }

        public static DataTable GetOverallCapacity()
        {
            return GetOrCache("dk_OverallCapacity", () => DashboardKhoModel.GetOverallCapacity());
        }

        public static DataTable GetDistinctMaterialCount()
        {
            using (SqlConnection conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
            {
                using (SqlCommand cmd = new SqlCommand(@"
                    IF COL_LENGTH('dbo.ERP_VatTuCBM','MaONPL') IS NULL
                    BEGIN
                        SELECT CAST(0 AS INT) AS SoMaVatTu; RETURN;
                    END

                    SELECT BarCode
                    INTO #TempXCTH
                    FROM PhieuXuatHang t1
                    WHERE NOT EXISTS (
                        SELECT 1 FROM PhieuThuHoiNPL t2
                        WHERE t2.MaLenh = t1.MaLenhSX
                          AND (t2.BarCode = t1.BarCode OR t2.BarCode = t1.BarCodeGoc)
                          AND t1.Dot = t2.Dot
                    );

                    SELECT TOP (0) BarCode INTO #TempSH FROM ERP_SoanHangNPL_BarCode;
                    IF COL_LENGTH('dbo.ERP_SoanHangNPL_BarCode','SLSoanHang_TK') IS NOT NULL
                       AND COL_LENGTH('dbo.ERP_SoanHangNPL_BarCode','SLSoanHang_BC') IS NOT NULL
                    BEGIN
                        INSERT INTO #TempSH(BarCode)
                        EXEC sp_executesql N'SELECT BarCode FROM ERP_SoanHangNPL_BarCode
                            WHERE ISNULL(SLSoanHang_TK,0) - ISNULL(SLSoanHang_BC,0) = 0;';
                    END

                    SELECT COUNT(DISTINCT ct.MaNPL) AS SoMaVatTu
                    FROM dbo.ERP_VatTuCBM v
                    INNER JOIN dbo.ERP_ChiTietNhapKhoNPL ct ON ct.BarCode = v.Barcode
                    WHERE v.MaONPL IS NOT NULL
                      AND NOT EXISTS (SELECT 1 FROM #TempXCTH t WHERE t.BarCode = v.Barcode)
                      AND NOT EXISTS (SELECT 1 FROM #TempSH  t WHERE t.BarCode = v.Barcode);

                    DROP TABLE #TempXCTH;
                    DROP TABLE #TempSH;", conn))
                {
                    cmd.CommandType = CommandType.Text;

                    using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adt.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        public static DataTable GetCustomers()
        {
            return GetOrCache("dk_Customers", () => DashboardKhoModel.GetWarehouseCustomers());
        }

        public static DataTable GetRacks()
        {
            return GetOrCache("dk_Racks", () => DashboardKhoModel.GetWarehouseEfficiency());
        }

        /// <summary>
        /// Lệnh chuẩn bị về — danh sách PO dự kiến nhập trong khoảng ngày.
        /// v2.3.16 — inline SQL (không phụ thuộc DashboardKhoModel.cs cũ) → admin chỉ cần copy 1 file mới.
        /// Cột TenKH lấy từ JOIN sang KhachHang.
        /// </summary>
        public static DataTable GetChuanBiVe(DateTime tuNgay, DateTime denNgay)
        {
            using (SqlConnection conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
            {
                using (SqlCommand cmd = new SqlCommand(@"
                    ;WITH ChiTiet AS
                    (
                        SELECT
                            ct.SoLoID,
                            ct.POMua,
                            ct.MaNPL,
                            MAX(ISNULL(ct.SLTong, 0)) AS SLTong
                        FROM dbo.ERP_ChiTietNhapKhoNPL ct
                        GROUP BY ct.SoLoID, ct.POMua, ct.MaNPL
                    ),
                    ChiTietTheoSoLo AS
                    (
                        SELECT
                            ct.SoLoID,
                            ct.POMua,
                            SUM(ISNULL(ct.SLTong, 0)) AS SLTong
                        FROM ChiTiet ct
                        GROUP BY ct.SoLoID, ct.POMua
                    ),
                    NgayDuKienTrongKhoang AS
                    (
                        SELECT DISTINCT
                            CAST(nk.NgayNKDuKien AS date) AS NgayNKDuKien
                        FROM dbo.ERP_NhapKhoNPL nk
                        WHERE nk.NgayNKDuKien IS NOT NULL
                          AND CAST(nk.NgayNKDuKien AS date) BETWEEN @TuNgay AND @DenNgay
                    ),
                    NhapKhoRaw AS
                    (
                        SELECT DISTINCT
                            nk.SoLoID,
                            nk.SoLo,
                            nk.POMua,
                            ISNULL(nk.MaKH, '') AS MaKH,
                            CAST(N'' AS NVARCHAR(100)) AS MaDH,
                            CAST(N'' AS NVARCHAR(100)) AS MaHang,
                            CAST(nk.NgayNKDuKien AS date) AS NgayNKDuKien
                        FROM dbo.ERP_NhapKhoNPL nk
                        INNER JOIN NgayDuKienTrongKhoang m
                            ON CAST(nk.NgayNKDuKien AS date) = m.NgayNKDuKien
                    ),
                    NhapKho AS
                    (
                        SELECT
                            nk.SoLoID,
                            nk.POMua,
                            MAX(nk.SoLo) AS SoLo,
                            MAX(nk.MaKH) AS MaKH,
                            MAX(nk.MaDH) AS MaDH,
                            MAX(nk.MaHang) AS MaHang,
                            MIN(nk.NgayNKDuKien) AS NgayNKDuKien
                        FROM NhapKhoRaw nk
                        GROUP BY nk.SoLoID, nk.POMua
                    )
                    SELECT
                        MIN(nk.SoLoID) AS SoLoID,
                        MAX(nk.SoLo) AS SoLo,
                        nk.POMua AS PO,
                        nk.POMua,
                        MAX(nk.MaDH) AS MaDH,
                        MAX(nk.MaHang) AS MaHang,
                        MIN(nk.NgayNKDuKien) AS NgayNKDuKien,
                        MIN(nk.NgayNKDuKien) AS NgayNhapKho_Update,
                        CAST(N'' AS NVARCHAR(200)) AS MaNPL,
                        SUM(ISNULL(ct.SLTong, 0)) AS SoLuongSP,
                        CAST(0 AS decimal(18, 2)) AS SoLuongThung,
                        MAX(ISNULL(kh.TenKH, '')) AS TenKH
                    FROM NhapKho nk
                    LEFT JOIN ChiTietTheoSoLo ct ON ct.SoLoID = nk.SoLoID AND ct.POMua = nk.POMua
                    LEFT JOIN KhachHang kh ON kh.MaKH = nk.MaKH
                    GROUP BY nk.POMua
                    ORDER BY MIN(nk.NgayNKDuKien), nk.POMua;", conn))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.Parameters.AddWithValue("@TuNgay",  tuNgay.Date);
                    cmd.Parameters.AddWithValue("@DenNgay", denNgay.Date);
                    using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adt.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        /// <summary>
        /// v2.3.24 — Chuẩn bị xuất: thêm cột SoLuongYeuCau (SL chuẩn bị xuất từ CanDoiDonViSanXuat)
        /// </summary>
        public static DataTable GetChuanBiXuat()
        {
            using (SqlConnection conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
            {
                using (SqlCommand cmd = new SqlCommand(@"
                    -- v2.3.27 — CanDoiDonViSanXuat.MaLenh là varchar dạng 'SX_7' → cần
                    -- TRY_CONVERT(INT, REPLACE(..., 'SX_', '')) để JOIN với WIP_DonHang_Chuyen.LenhSX (int)
                    SELECT
                        cs.MaLenhSanXuat,
                        cs.MaLenh,
                        cs.MaDVSX,
                        ISNULL(MAX(kh.TenKH), '')           AS KhachHang,
                        ISNULL(MAX(hh.TenHang), '')         AS TenHang,
                        SUM(ISNULL(cs.SoLuong, 0))          AS SoLuongYeuCau,
                        MAX(CASE WHEN tp.StepCode = 'TTCat' THEN tp.kh_date END)                       AS KHCat,
                        DATEADD(day, 7, MAX(CASE WHEN tp.StepCode = 'TTCat' THEN tp.kh_date END))      AS DuKienCat
                    FROM dbo.CanDoiDonViSanXuat cs
                    LEFT JOIN dbo.DonHangTong dh ON dh.MaDH = cs.MaDH
                    LEFT JOIN dbo.HangHoa     hh ON hh.MaHang = dh.MaHang AND hh.MaKH = dh.MaKH
                    LEFT JOIN dbo.KhachHang   kh ON kh.MaKH   = dh.MaKH
                    LEFT JOIN dbo.WIP_DonHang_Chuyen wc
                        ON wc.LenhSX = TRY_CONVERT(INT, REPLACE(ISNULL(cs.MaLenh, ''), 'SX_', ''))
                    LEFT JOIN dbo.WIP_DonHang_Chuyen_TechProgress tp ON tp.WIPId = wc.WIPId
                    WHERE NOT EXISTS (SELECT 1 FROM dbo.PhieuXuatHang ph WHERE ph.MaLenhSX = cs.MaLenhSanXuat)
                    GROUP BY cs.MaLenhSanXuat, cs.MaLenh, cs.MaDVSX
                    ORDER BY KHCat DESC;", conn))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandTimeout = 300;
                    using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adt.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        /// <summary>
        /// v2.3.24 — Đang xuất: Mã lệnh SX = CanDoiDonViSanXuat.MaLenh; thêm SLYeuCau + % đã xuất.
        /// </summary>
        public static DataTable GetDangXuat()
        {
            var toDate   = DateTime.Today;
            var fromDate = toDate.AddDays(-30);
            using (SqlConnection conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
            {
                using (SqlCommand cmd = new SqlCommand(@"
                    -- Tổng đã xuất theo lệnh SX (từ PhieuXuatHang)
                    IF OBJECT_ID('tempdb..#XuatAgg') IS NOT NULL DROP TABLE #XuatAgg;
                    SELECT
                        MaLenhSX,
                        MAX(MaGop)               AS MaGop,
                        MAX(NgayXuatHang)        AS NgayXuatHang,
                        SUM(ISNULL(SLNhap, 0))   AS SLXuat
                    INTO #XuatAgg
                    FROM dbo.PhieuXuatHang
                    WHERE Moudule = 0 AND NPL = 1
                      AND NgayXuatHang >= @TuNgay AND NgayXuatHang <= @DenNgay
                    GROUP BY MaLenhSX;

                    -- Tổng SL yêu cầu theo lệnh SX (từ CanDoiDonViSanXuat)
                    IF OBJECT_ID('tempdb..#YeuCauAgg') IS NOT NULL DROP TABLE #YeuCauAgg;
                    SELECT
                        MaLenhSanXuat,
                        MAX(MaLenh)              AS MaLenhCS,    -- v2.3.24 — user yêu cầu lấy MaLenh từ đây
                        SUM(ISNULL(SoLuong, 0))  AS SoLuongYeuCau
                    INTO #YeuCauAgg
                    FROM dbo.CanDoiDonViSanXuat
                    GROUP BY MaLenhSanXuat;

                    -- Customer + TenHang
                    IF OBJECT_ID('tempdb..#KhHang') IS NOT NULL DROP TABLE #KhHang;
                    SELECT DISTINCT
                        gd.MaGop, hh.TenHang, kh.TenKH
                    INTO #KhHang
                    FROM dbo.GopDonHang gd
                    INNER JOIN dbo.DonHangTong dh ON gd.MaDH = dh.MaDH
                    LEFT JOIN dbo.HangHoa hh ON hh.MaHang = dh.MaHang AND hh.MaKH = dh.MaKH
                    LEFT JOIN dbo.KhachHang kh ON kh.MaKH  = dh.MaKH
                    WHERE EXISTS (SELECT 1 FROM dbo.PhieuXuatHang p WHERE p.MaGop = gd.MaGop);

                    -- Kết hợp: mỗi lệnh đang xuất
                    SELECT
                        x.MaLenhSX,
                        ISNULL(y.MaLenhCS, '')                AS MaLenh,    -- từ CanDoiDonViSanXuat
                        x.MaGop,
                        ISNULL(k.TenHang, '')                 AS TenHang,
                        ISNULL(k.TenKH, '')                   AS TenKH,
                        x.NgayXuatHang,
                        ROUND(x.SLXuat, 4)                    AS SLXuat,
                        ISNULL(y.SoLuongYeuCau, 0)            AS SoLuongYeuCau,
                        CASE WHEN ISNULL(y.SoLuongYeuCau, 0) > 0
                             THEN ROUND(x.SLXuat / y.SoLuongYeuCau * 100, 2)
                             ELSE 0 END                       AS PctDaXuat
                    FROM #XuatAgg x
                    LEFT JOIN #YeuCauAgg y ON y.MaLenhSanXuat = x.MaLenhSX
                    LEFT JOIN #KhHang    k ON k.MaGop          = x.MaGop
                    ORDER BY x.NgayXuatHang DESC;

                    DROP TABLE #XuatAgg;
                    DROP TABLE #YeuCauAgg;
                    DROP TABLE #KhHang;", conn))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandTimeout = 300;
                    cmd.Parameters.Add("@TuNgay",  SqlDbType.Date).Value = fromDate;
                    cmd.Parameters.Add("@DenNgay", SqlDbType.Date).Value = toDate;
                    using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adt.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        public static DataTable GetFlowTrend12T()
        {
            using (SqlConnection conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
            {
                using (SqlCommand cmd = new SqlCommand(@"
                    DECLARE @StartDate DATE = DATEADD(MONTH, -11, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1));

                    ;WITH Months AS (
                        SELECT TOP 12
                            YEAR(DATEADD(MONTH, number, @StartDate))  AS Nam,
                            MONTH(DATEADD(MONTH, number, @StartDate)) AS Thang
                        FROM master..spt_values
                        WHERE type = 'P' AND number BETWEEN 0 AND 11
                    ),
                    TonDauKy AS (
                        SELECT SUM(SL) AS TonDau
                        FROM (
                            SELECT SUM(ISNULL(SoLuongThucTeBanDau, 0)) AS SL FROM ERP_ChiTietNhapKhoNPL WHERE TRY_CONVERT(DATE, NgayNhapKho) < @StartDate
                            UNION ALL
                            SELECT -SUM(ISNULL(SLNhap, 0)) FROM PhieuXuatHang WHERE ModuleXH = 1 AND TRY_CONVERT(DATE, NgayXuatHang) < @StartDate
                            UNION ALL
                            SELECT SUM(ISNULL(ThuHoi, 0)) FROM PhieuThuHoiNPL WHERE TRY_CONVERT(DATE, NgayTH) < @StartDate
                        ) t
                    ),
                    NhapTheoThang AS (
                        SELECT YEAR(TRY_CONVERT(DATE, NgayNhapKho)) AS Nam, MONTH(TRY_CONVERT(DATE, NgayNhapKho)) AS Thang,
                               SUM(ISNULL(SoLuongThucTeBanDau, 0)) AS TotalIn
                        FROM ERP_ChiTietNhapKhoNPL WHERE TRY_CONVERT(DATE, NgayNhapKho) >= @StartDate
                        GROUP BY YEAR(TRY_CONVERT(DATE, NgayNhapKho)), MONTH(TRY_CONVERT(DATE, NgayNhapKho))
                    ),
                    XuatTheoThang AS (
                        SELECT YEAR(TRY_CONVERT(DATE, NgayXuatHang)) AS Nam, MONTH(TRY_CONVERT(DATE, NgayXuatHang)) AS Thang,
                               SUM(ISNULL(SLNhap, 0)) AS TotalOut
                        FROM PhieuXuatHang WHERE ModuleXH = 1 AND TRY_CONVERT(DATE, NgayXuatHang) >= @StartDate
                        GROUP BY YEAR(TRY_CONVERT(DATE, NgayXuatHang)), MONTH(TRY_CONVERT(DATE, NgayXuatHang))
                    ),
                    ThuHoiTheoThang AS (
                        SELECT YEAR(TRY_CONVERT(DATE, NgayTH)) AS Nam, MONTH(TRY_CONVERT(DATE, NgayTH)) AS Thang,
                               SUM(ISNULL(ThuHoi, 0)) AS TotalTH
                        FROM PhieuThuHoiNPL WHERE TRY_CONVERT(DATE, NgayTH) >= @StartDate
                        GROUP BY YEAR(TRY_CONVERT(DATE, NgayTH)), MONTH(TRY_CONVERT(DATE, NgayTH))
                    ),
                    Combined AS (
                        SELECT m.Nam, m.Thang,
                            ISNULL(n.TotalIn, 0) AS TotalIn, ISNULL(x.TotalOut, 0) AS TotalOut, ISNULL(th.TotalTH, 0) AS TotalTH
                        FROM Months m
                        LEFT JOIN NhapTheoThang n ON n.Nam = m.Nam AND n.Thang = m.Thang
                        LEFT JOIN XuatTheoThang x ON x.Nam = m.Nam AND x.Thang = m.Thang
                        LEFT JOIN ThuHoiTheoThang th ON th.Nam = m.Nam AND th.Thang = m.Thang
                    )
                    SELECT c.Nam, c.Thang, c.TotalIn, c.TotalOut,
                        ISNULL(d.TonDau, 0) + SUM(c.TotalIn + c.TotalTH - c.TotalOut) OVER (ORDER BY c.Nam, c.Thang ROWS UNBOUNDED PRECEDING) AS TotalStock
                    FROM Combined c CROSS JOIN TonDauKy d
                    ORDER BY c.Nam, c.Thang;", conn))
                {
                    cmd.CommandType = CommandType.Text;

                    using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adt.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        public static DataTable GetFlowTrendWeekly()
        {
            using (SqlConnection conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
            {
                using (SqlCommand cmd = new SqlCommand(@"
                    -- 12 tuần gần nhất (tuần bắt đầu Thứ Hai)
                    DECLARE @N INT = 12;
                    DECLARE @Today DATE = CAST(GETDATE() AS DATE);
                    DECLARE @StartDate DATE = DATEADD(WEEK, -(@N - 1),
                        DATEADD(DAY, 1 - (DATEPART(WEEKDAY, @Today) + @@DATEFIRST - 2) % 7, @Today));

                    ;WITH Weeks AS (
                        SELECT TOP (@N)
                            DATEADD(WEEK, number, @StartDate) AS WeekStart,
                            YEAR(DATEADD(WEEK, number, @StartDate))  AS Nam,
                            DATEPART(ISO_WEEK, DATEADD(WEEK, number, @StartDate)) AS Tuan
                        FROM master..spt_values
                        WHERE type = 'P' AND number BETWEEN 0 AND @N - 1
                    ),
                    TonDauKy AS (
                        SELECT ISNULL(SUM(SL), 0) AS TonDau FROM (
                            SELECT SUM(ISNULL(SoLuongThucTeBanDau, 0)) AS SL FROM ERP_ChiTietNhapKhoNPL
                                WHERE TRY_CONVERT(DATE, NgayNhapKho) < @StartDate
                            UNION ALL
                            SELECT -SUM(ISNULL(SLNhap, 0)) FROM PhieuXuatHang
                                WHERE ModuleXH = 1 AND TRY_CONVERT(DATE, NgayXuatHang) < @StartDate
                            UNION ALL
                            SELECT SUM(ISNULL(ThuHoi, 0)) FROM PhieuThuHoiNPL
                                WHERE TRY_CONVERT(DATE, NgayTH) < @StartDate
                        ) t
                    ),
                    NhapTheoTuan AS (
                        SELECT DATEPART(ISO_WEEK, TRY_CONVERT(DATE, NgayNhapKho)) AS Tuan,
                               YEAR(TRY_CONVERT(DATE, NgayNhapKho)) AS Nam,
                               SUM(ISNULL(SoLuongThucTeBanDau, 0)) AS TotalIn
                        FROM ERP_ChiTietNhapKhoNPL
                        WHERE TRY_CONVERT(DATE, NgayNhapKho) >= @StartDate
                        GROUP BY YEAR(TRY_CONVERT(DATE, NgayNhapKho)), DATEPART(ISO_WEEK, TRY_CONVERT(DATE, NgayNhapKho))
                    ),
                    XuatTheoTuan AS (
                        SELECT DATEPART(ISO_WEEK, TRY_CONVERT(DATE, NgayXuatHang)) AS Tuan,
                               YEAR(TRY_CONVERT(DATE, NgayXuatHang)) AS Nam,
                               SUM(ISNULL(SLNhap, 0)) AS TotalOut
                        FROM PhieuXuatHang
                        WHERE ModuleXH = 1 AND TRY_CONVERT(DATE, NgayXuatHang) >= @StartDate
                        GROUP BY YEAR(TRY_CONVERT(DATE, NgayXuatHang)), DATEPART(ISO_WEEK, TRY_CONVERT(DATE, NgayXuatHang))
                    ),
                    ThuHoiTheoTuan AS (
                        SELECT DATEPART(ISO_WEEK, TRY_CONVERT(DATE, NgayTH)) AS Tuan,
                               YEAR(TRY_CONVERT(DATE, NgayTH)) AS Nam,
                               SUM(ISNULL(ThuHoi, 0)) AS TotalTH
                        FROM PhieuThuHoiNPL
                        WHERE TRY_CONVERT(DATE, NgayTH) >= @StartDate
                        GROUP BY YEAR(TRY_CONVERT(DATE, NgayTH)), DATEPART(ISO_WEEK, TRY_CONVERT(DATE, NgayTH))
                    ),
                    Combined AS (
                        SELECT w.Nam, w.Tuan,
                            ISNULL(n.TotalIn, 0) AS TotalIn,
                            ISNULL(x.TotalOut, 0) AS TotalOut,
                            ISNULL(th.TotalTH, 0) AS TotalTH
                        FROM Weeks w
                        LEFT JOIN NhapTheoTuan n ON n.Nam = w.Nam AND n.Tuan = w.Tuan
                        LEFT JOIN XuatTheoTuan x ON x.Nam = w.Nam AND x.Tuan = w.Tuan
                        LEFT JOIN ThuHoiTheoTuan th ON th.Nam = w.Nam AND th.Tuan = w.Tuan
                    )
                    SELECT c.Nam, c.Tuan, c.TotalIn, c.TotalOut,
                        (SELECT TonDau FROM TonDauKy) +
                        SUM(c.TotalIn + c.TotalTH - c.TotalOut) OVER (ORDER BY c.Nam, c.Tuan ROWS UNBOUNDED PRECEDING) AS TotalStock
                    FROM Combined c
                    ORDER BY c.Nam, c.Tuan;", conn))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandTimeout = 120;
                    using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adt.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        public static DataTable GetAgeStock()
        {
            return GetOrCache("dk_AgeStock", () =>
            {
                var model = new NtbSoft.ERP.Model.QuanLyDonHang.TongHopKhoNPLModel();
                return model.Get("GETTILETONKHONHOMTHEOTHANG", "all", "all", "all", "", "", "", "", "", "", "");
            });
        }

        public static DataTable GetActivityCalendar()
        {
            // Mặc định: 90 ngày trước → 30 ngày sau (hôm nay) để bao gồm NK dự kiến.
            DateTime today = DateTime.Today;
            return GetActivityCalendar(today.AddDays(-90), today.AddDays(30));
        }

        /// <summary>
        /// v2.3.30 — Danh sách TOÀN BỘ mã vật tư đang tồn kho (không giới hạn Top N).
        /// Dùng cho drill từ materialCount → "Số mã vật tư" (vd 2,348 mã).
        /// </summary>
        public static DataTable GetAllMaterialsInStock()
        {
            return GetOrCache("dk_AllMaterials", GetAllMaterialsInStockInternal);
        }

        private static DataTable GetAllMaterialsInStockInternal()
        {
            using (SqlConnection conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
            {
                using (SqlCommand cmd = new SqlCommand(@"
                    IF COL_LENGTH('dbo.ERP_VatTuCBM','MaONPL') IS NULL
                       OR COL_LENGTH('dbo.ERP_ONPL','TenO') IS NULL
                    BEGIN
                        SELECT CAST(NULL AS NVARCHAR(200)) AS MaVT,
                               CAST(NULL AS NVARCHAR(500)) AS TenVT,
                               CAST(0    AS DECIMAL(18,4)) AS TonKho,
                               CAST(0    AS INT)           AS NPL
                        WHERE 1 = 0;
                        RETURN;
                    END

                    -- Loại trừ barcode đã xuất chưa thu hồi
                    SELECT BarCode INTO #tmpXCTH FROM PhieuXuatHang t1
                    WHERE NOT EXISTS (
                        SELECT 1 FROM PhieuThuHoiNPL t2
                        WHERE t2.MaLenh = t1.MaLenhSX
                          AND (t2.BarCode = t1.BarCode OR t2.BarCode = t1.BarCodeGoc)
                          AND t1.Dot = t2.Dot
                    );

                    SELECT TOP (0) BarCode INTO #tmpSH FROM ERP_SoanHangNPL_BarCode;
                    IF COL_LENGTH('dbo.ERP_SoanHangNPL_BarCode','SLSoanHang_TK') IS NOT NULL
                       AND COL_LENGTH('dbo.ERP_SoanHangNPL_BarCode','SLSoanHang_BC') IS NOT NULL
                    BEGIN
                        INSERT INTO #tmpSH(BarCode)
                        EXEC sp_executesql N'SELECT BarCode FROM ERP_SoanHangNPL_BarCode
                            WHERE ISNULL(SLSoanHang_TK,0) - ISNULL(SLSoanHang_BC,0) = 0;';
                    END

                    -- Gom theo MaNPL + Module (1=NL, 2=PL)
                    IF OBJECT_ID('tempdb..#MatRaw') IS NOT NULL DROP TABLE #MatRaw;
                    SELECT
                        ct.MaNPL,
                        o.Module,
                        SUM(ISNULL(ct.SoLuongThucTeBanDau, 0)) AS TonKho,
                        COUNT(*)                              AS SoBarCode
                    INTO #MatRaw
                    FROM dbo.ERP_ChiTietNhapKhoNPL ct
                    INNER JOIN dbo.ERP_VatTuCBM v ON v.Barcode = ct.BarCode
                    INNER JOIN dbo.ERP_ONPL    o ON o.TenO     = v.MaONPL
                    WHERE v.MaONPL IS NOT NULL
                      AND o.Module IN (1, 2)
                      AND NOT EXISTS (SELECT 1 FROM #tmpXCTH t WHERE t.BarCode = v.Barcode)
                      AND NOT EXISTS (SELECT 1 FROM #tmpSH   t WHERE t.BarCode = v.Barcode)
                    GROUP BY ct.MaNPL, o.Module
                    HAVING SUM(ISNULL(ct.SoLuongThucTeBanDau, 0)) > 0;

                    -- Parse composite key MaNPL → ID parts
                    IF OBJECT_ID('tempdb..#MatParsed') IS NOT NULL DROP TABLE #MatParsed;
                    SELECT
                        r.MaNPL,
                        r.Module,
                        r.TonKho,
                        r.SoBarCode,
                        ISNULL(PARSENAME(REPLACE(r.MaNPL, '@', '.'), 4), '') AS MaCLVTID,
                        ISNULL(PARSENAME(REPLACE(r.MaNPL, '@', '.'), 3), '') AS MaVTID,
                        ISNULL(PARSENAME(REPLACE(r.MaNPL, '@', '.'), 2), '') AS MauVTID,
                        ISNULL(PARSENAME(REPLACE(r.MaNPL, '@', '.'), 1), '') AS KhoVaiID
                    INTO #MatParsed
                    FROM #MatRaw r;

                    -- Init #MatFinal với base data
                    IF OBJECT_ID('tempdb..#MatFinal') IS NOT NULL DROP TABLE #MatFinal;
                    SELECT
                        p.MaVTID                          AS MaVT,
                        CAST(p.MaVTID AS NVARCHAR(500))   AS TenVT,
                        CAST('' AS NVARCHAR(200))         AS Mau,
                        CAST('' AS NVARCHAR(200))         AS KhoVai,
                        CAST('' AS NVARCHAR(500))         AS ChiTiet,
                        CAST('' AS NVARCHAR(50))          AS TenDVVT,
                        p.TonKho,
                        p.SoBarCode,
                        CASE WHEN p.Module = 1 THEN N'NL' WHEN p.Module = 2 THEN N'PL' ELSE N'' END AS LoaiKho,
                        p.MauVTID,
                        p.KhoVaiID
                    INTO #MatFinal
                    FROM #MatParsed p;

                    -- Cập nhật từng cột từ master (safe TRY/CATCH)
                    IF OBJECT_ID('dbo.ERP_MauVTTV') IS NOT NULL
                    BEGIN
                        BEGIN TRY
                            EXEC sp_executesql N'
                                UPDATE f SET Mau = ISNULL(m.MauVT, '''')
                                FROM #MatFinal f
                                LEFT JOIN dbo.ERP_MauVTTV m ON m.MauVTID = f.MauVTID;';
                        END TRY
                        BEGIN CATCH
                            PRINT 'Master JOIN skipped: ' + ERROR_MESSAGE();
                        END CATCH
                    END

                    IF OBJECT_ID('dbo.ERP_KhoVai') IS NOT NULL
                    BEGIN
                        BEGIN TRY
                            EXEC sp_executesql N'
                                UPDATE f SET KhoVai = ISNULL(k.KhoVai, '''')
                                FROM #MatFinal f
                                LEFT JOIN dbo.ERP_KhoVai k ON k.KhoVaiID = f.KhoVaiID;';
                        END TRY
                        BEGIN CATCH
                            PRINT 'Master JOIN skipped: ' + ERROR_MESSAGE();
                        END CATCH
                    END

                    IF OBJECT_ID('dbo.ERP_VatTuTV') IS NOT NULL
                    BEGIN
                        BEGIN TRY
                            EXEC sp_executesql N'
                                UPDATE f
                                SET MaVT    = ISNULL(vt.MaVT,    f.MaVT),
                                    TenVT   = ISNULL(vt.ChiTiet, f.TenVT),
                                    ChiTiet = ISNULL(vt.ChiTiet, '''')
                                FROM #MatFinal f
                                LEFT JOIN dbo.ERP_VatTuTV vt ON vt.MaVTID = f.MaVT;';
                        END TRY
                        BEGIN CATCH
                            PRINT 'Master JOIN skipped: ' + ERROR_MESSAGE();
                        END CATCH

                        IF OBJECT_ID('dbo.ERP_DonViVT') IS NOT NULL
                           AND OBJECT_ID('dbo.ERP_KhoVai') IS NOT NULL
                        BEGIN
                            BEGIN TRY
                                EXEC sp_executesql N'
                                    UPDATE f
                                    SET TenDVVT = ISNULL(d.TenDVVT, '''')
                                    FROM #MatFinal f
                                    LEFT JOIN dbo.ERP_KhoVai k ON k.KhoVaiID = f.KhoVaiID
                                    LEFT JOIN dbo.ERP_DonViVT d ON d.MaDVVT = k.MaDVVT;';
                            END TRY
                        BEGIN CATCH
                            PRINT 'Master JOIN skipped: ' + ERROR_MESSAGE();
                        END CATCH
                        END
                    END

                    SELECT MaVT, TenVT, Mau, KhoVai, ChiTiet, TenDVVT, TonKho, SoBarCode, LoaiKho
                    FROM #MatFinal
                    ORDER BY TonKho DESC;

                    DROP TABLE #MatRaw;
                    DROP TABLE #MatParsed;
                    DROP TABLE #MatFinal;
                    DROP TABLE #tmpXCTH;
                    DROP TABLE #tmpSH;", conn))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandTimeout = 300;
                    using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adt.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        /// <summary>
        /// v2.3.36 — Tính Thành giá hàng tồn = SUM(SoLuong × DonGia) cho toàn bộ vật tư đang tồn.
        /// Defensive: nếu không có bảng giá → trả 0.
        /// </summary>
        public static DataTable GetThanhGiaHangTon()
        {
            return GetOrCache("dk_ThanhGia", GetThanhGiaHangTonInternal);
        }

        private static DataTable GetThanhGiaHangTonInternal()
        {
            using (SqlConnection conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
            {
                using (SqlCommand cmd = new SqlCommand(@"
                    -- Loại trừ barcode đã xuất chưa thu hồi + đã soạn hàng
                    SELECT BarCode INTO #tmpXTH FROM PhieuXuatHang t1
                    WHERE NOT EXISTS (SELECT 1 FROM PhieuThuHoiNPL t2
                        WHERE t2.MaLenh=t1.MaLenhSX AND (t2.BarCode=t1.BarCode OR t2.BarCode=t1.BarCodeGoc) AND t1.Dot=t2.Dot);

                    SELECT TOP (0) BarCode INTO #tmpSH FROM ERP_SoanHangNPL_BarCode;
                    IF COL_LENGTH('dbo.ERP_SoanHangNPL_BarCode','SLSoanHang_TK') IS NOT NULL
                        INSERT INTO #tmpSH(BarCode)
                        EXEC sp_executesql N'SELECT BarCode FROM ERP_SoanHangNPL_BarCode WHERE ISNULL(SLSoanHang_TK,0)-ISNULL(SLSoanHang_BC,0)=0;';

                    -- Gom theo MaNPL (composite key) với tổng SL còn trong kho
                    IF OBJECT_ID('tempdb..#TonKho') IS NOT NULL DROP TABLE #TonKho;
                    SELECT
                        ct.MaNPL,
                        SUM(ISNULL(ct.SoLuongThucTeBanDau, 0)) AS TongSL,
                        -- Parse các thành phần từ MaNPL
                        ISNULL(PARSENAME(REPLACE(ct.MaNPL, '@', '.'), 4), '') AS MaCLVTID,
                        ISNULL(PARSENAME(REPLACE(ct.MaNPL, '@', '.'), 3), '') AS MaVTID,
                        ISNULL(PARSENAME(REPLACE(ct.MaNPL, '@', '.'), 2), '') AS MauVTID,
                        ISNULL(PARSENAME(REPLACE(ct.MaNPL, '@', '.'), 1), '') AS KhoVaiID
                    INTO #TonKho
                    FROM dbo.ERP_ChiTietNhapKhoNPL ct
                    INNER JOIN dbo.ERP_VatTuCBM v ON v.Barcode = ct.BarCode
                    INNER JOIN dbo.ERP_ONPL o ON o.TenO = v.MaONPL
                    WHERE v.MaONPL IS NOT NULL AND o.Module IN (1, 2)
                      AND NOT EXISTS (SELECT 1 FROM #tmpXTH t WHERE t.BarCode = v.Barcode)
                      AND NOT EXISTS (SELECT 1 FROM #tmpSH  t WHERE t.BarCode = v.Barcode)
                    GROUP BY ct.MaNPL
                    HAVING SUM(ISNULL(ct.SoLuongThucTeBanDau, 0)) > 0;

                    -- Tìm giá hiện tại (theo MaCLVTID + MaVTID + MauVTID + KhoVaiID + NgayApDung)
                    DECLARE @ThanhGia DECIMAL(20,2) = 0;
                    DECLARE @SoMaCoGia INT = 0;
                    DECLARE @SoMaKhongGia INT = 0;

                    IF OBJECT_ID('dbo.VatTuGia', 'U') IS NOT NULL
                       OR OBJECT_ID('dbo.ERP_VatTuGia', 'U') IS NOT NULL
                    BEGIN
                        BEGIN TRY
                            -- Lấy giá active mới nhất cho từng combination
                            DECLARE @sql NVARCHAR(MAX) = N'
                                IF OBJECT_ID(''tempdb..#GiaActive'') IS NOT NULL DROP TABLE #GiaActive;
                                ;WITH GiaLatest AS (
                                    SELECT
                                        g.MaCLVTID, g.MaVTID, g.MauVTID, g.KhoVaiID,
                                        CAST(g.DonGia AS DECIMAL(18,2)) AS DonGia,
                                        ROW_NUMBER() OVER (
                                            PARTITION BY g.MaCLVTID, g.MaVTID, g.MauVTID, g.KhoVaiID
                                            ORDER BY g.NgayApDung DESC, g.ID DESC
                                        ) AS rn
                                    FROM dbo.VatTuGia g
                                    WHERE g.DonGia IS NOT NULL
                                      AND (g.NgayApDung IS NULL OR g.NgayApDung <= CAST(GETDATE() AS DATE))
                                      AND (g.NgayKetThuc IS NULL OR g.NgayKetThuc >= CAST(GETDATE() AS DATE))
                                )
                                SELECT MaCLVTID, MaVTID, MauVTID, KhoVaiID, DonGia
                                INTO #GiaActive FROM GiaLatest WHERE rn = 1;

                                SELECT
                                    @TG_out = ISNULL(SUM(t.TongSL * g.DonGia), 0),
                                    @C_out  = SUM(CASE WHEN g.DonGia IS NOT NULL THEN 1 ELSE 0 END),
                                    @N_out  = SUM(CASE WHEN g.DonGia IS NULL THEN 1 ELSE 0 END)
                                FROM #TonKho t
                                LEFT JOIN #GiaActive g
                                    ON g.MaCLVTID = t.MaCLVTID
                                   AND g.MaVTID   = t.MaVTID
                                   AND g.MauVTID  = t.MauVTID
                                   AND g.KhoVaiID = t.KhoVaiID;

                                DROP TABLE #GiaActive;';

                            EXEC sp_executesql @sql,
                                N'@TG_out DECIMAL(20,2) OUTPUT, @C_out INT OUTPUT, @N_out INT OUTPUT',
                                @TG_out = @ThanhGia OUTPUT, @C_out = @SoMaCoGia OUTPUT, @N_out = @SoMaKhongGia OUTPUT;
                        END TRY
                        BEGIN CATCH
                            PRINT 'VatTuGia lookup failed: ' + ERROR_MESSAGE();
                            -- Thử bảng ERP_VatTuGia
                            BEGIN TRY
                                DECLARE @sql2 NVARCHAR(MAX) = REPLACE(@sql, 'dbo.VatTuGia', 'dbo.ERP_VatTuGia');
                                EXEC sp_executesql @sql2,
                                    N'@TG_out DECIMAL(20,2) OUTPUT, @C_out INT OUTPUT, @N_out INT OUTPUT',
                                    @TG_out = @ThanhGia OUTPUT, @C_out = @SoMaCoGia OUTPUT, @N_out = @SoMaKhongGia OUTPUT;
                            END TRY
                            BEGIN CATCH
                                PRINT 'ERP_VatTuGia lookup also failed: ' + ERROR_MESSAGE();
                            END CATCH
                        END CATCH
                    END

                    -- Đếm tổng số mã + tổng SL tồn
                    DECLARE @TongMa INT, @TongSL DECIMAL(20,2);
                    SELECT @TongMa = COUNT(*), @TongSL = SUM(TongSL) FROM #TonKho;

                    SELECT
                        @ThanhGia       AS ThanhGia,
                        @TongMa         AS TongMaVT,
                        @SoMaCoGia      AS SoMaCoGia,
                        @SoMaKhongGia   AS SoMaKhongGia,
                        @TongSL         AS TongSoLuong;

                    DROP TABLE #TonKho;
                    DROP TABLE #tmpXTH;
                    DROP TABLE #tmpSH;", conn))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandTimeout = 300;
                    using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adt.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        /// <summary>
        /// v2.3.23 — Lấy NK dự kiến từ ERP_NhapKhoNPL.NgayNKDuKien theo khoảng ngày.
        /// Trả về: NgayNKDuKien (yyyy-MM-dd), SoLo, PO, MaKH, TenKH, SoLuongDuKien
        /// </summary>
        public static DataTable GetNKDuKienByRange(DateTime tuNgay, DateTime denNgay)
        {
            using (SqlConnection conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
            {
                using (SqlCommand cmd = new SqlCommand(@"
                    SELECT
                        CONVERT(VARCHAR(10), CAST(nk.NgayNKDuKien AS DATE), 120) AS NgayNKDuKien,
                        ISNULL(nk.SoLo, '')                                      AS SoLo,
                        ISNULL(nk.POMua, '')                                     AS PO,
                        ISNULL(nk.MaKH, '')                                      AS MaKH,
                        ISNULL(kh.TenKH, '')                                     AS TenKH,
                        ISNULL((SELECT SUM(ISNULL(ct.SLTong, 0))
                                FROM dbo.ERP_ChiTietNhapKhoNPL ct
                                WHERE ct.SoLoID = nk.SoLoID
                                  AND ct.POMua  = nk.POMua), 0)                  AS SoLuongDuKien
                    FROM dbo.ERP_NhapKhoNPL nk
                    LEFT JOIN dbo.KhachHang kh ON kh.MaKH = nk.MaKH
                    WHERE nk.NgayNKDuKien IS NOT NULL
                      AND CAST(nk.NgayNKDuKien AS DATE) BETWEEN @TuNgay AND @DenNgay
                    ORDER BY nk.NgayNKDuKien, nk.SoLo;", conn))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandTimeout = 60;
                    cmd.Parameters.Add("@TuNgay",  SqlDbType.Date).Value = tuNgay.Date;
                    cmd.Parameters.Add("@DenNgay", SqlDbType.Date).Value = denNgay.Date;
                    using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adt.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        /// <summary>
        /// Chi tiết các record NHẬP KHO trong 1 ngày (v2.3.7).
        /// v2.3.8.2 — SoLo từ parent ERP_NhapKhoNPL (chi tiết chỉ có SoLoID).
        /// </summary>
        /// <summary>
        /// v2.3.22 — Chi tiết NHẬP KHO 1 ngày, GROUP BY SoLoID + MaNPL.
        /// Cột: PI NCC (nk.SoLo), PO, MaNPL, Itemcode (vt.MaVT), Màu (MauVT),
        /// Width/Size (KhoVai + đơn vị từ ERP_DonViVT), Khách hàng, Số lượng (SUM).
        /// </summary>
        public static DataTable GetNhapDetailByDay(DateTime ngay)
        {
            // Pre-build SQL based on which master tables exist
            string sql = @"
                IF OBJECT_ID('tempdb..#NhapAgg') IS NOT NULL DROP TABLE #NhapAgg;
                SELECT
                    ct.SoLoID,
                    ct.MaNPL,
                    MAX(ct.POMua)                          AS PO,
                    SUM(ISNULL(ct.SoLuongThucTeBanDau, 0)) AS SoLuong,
                    COUNT(*)                               AS SoBarCode
                INTO #NhapAgg
                FROM dbo.ERP_ChiTietNhapKhoNPL ct
                WHERE ct.NgayNhapKho IS NOT NULL
                  AND CAST(ct.NgayNhapKho AS DATE) = @Ngay
                GROUP BY ct.SoLoID, ct.MaNPL;

                IF OBJECT_ID('tempdb..#NhapFinal') IS NOT NULL DROP TABLE #NhapFinal;
                SELECT TOP 500
                    ISNULL(nk.SoLo, '')                    AS PINCC,     -- PI NCC
                    a.PO                                   AS PO,
                    a.MaNPL                                AS MaNPL,
                    CAST('' AS NVARCHAR(200))              AS ItemCode,
                    CAST('' AS NVARCHAR(200))              AS MaMauVT,
                    CAST('' AS NVARCHAR(200))              AS MauVT,
                    CAST('' AS NVARCHAR(200))              AS WidthSize,  -- KhoVai + đơn vị
                    ISNULL(kh.TenKH, '')                   AS TenKH,
                    a.SoLuong                              AS SoLuong,
                    a.SoBarCode                            AS SoBarCode,
                    -- Tạm giữ các ID để JOIN master tables ở các UPDATE riêng
                    ISNULL(PARSENAME(REPLACE(a.MaNPL, '@', '.'), 3), '') AS MaVTID,
                    ISNULL(PARSENAME(REPLACE(a.MaNPL, '@', '.'), 2), '') AS MauVTID,
                    ISNULL(PARSENAME(REPLACE(a.MaNPL, '@', '.'), 1), '') AS KhoVaiID
                INTO #NhapFinal
                FROM #NhapAgg a
                LEFT JOIN dbo.ERP_NhapKhoNPL nk ON nk.SoLoID = a.SoLoID
                LEFT JOIN dbo.KhachHang     kh ON kh.MaKH    = nk.MaKH
                ORDER BY a.SoLuong DESC;

                -- Cập nhật ItemCode từ ERP_VatTuTV.MaVT
                IF OBJECT_ID('dbo.ERP_VatTuTV') IS NOT NULL
                BEGIN
                    BEGIN TRY
                        EXEC sp_executesql N'
                            UPDATE f SET ItemCode = ISNULL(vt.MaVT, '''')
                            FROM #NhapFinal f
                            LEFT JOIN dbo.ERP_VatTuTV vt ON vt.MaVTID = f.MaVTID;';
                    END TRY
                    BEGIN CATCH
                        PRINT 'JOIN skipped: ' + ERROR_MESSAGE();
                    END CATCH
                END

                -- Cập nhật MaMauVT + MauVT từ ERP_MauVTTV
                IF OBJECT_ID('dbo.ERP_MauVTTV') IS NOT NULL
                BEGIN
                    BEGIN TRY
                        EXEC sp_executesql N'
                            UPDATE f
                            SET MaMauVT = ISNULL(m.MauVTID, ''''),
                                MauVT   = ISNULL(m.MauVT,   '''')
                            FROM #NhapFinal f
                            LEFT JOIN dbo.ERP_MauVTTV m ON m.MauVTID = f.MauVTID;';
                    END TRY
                    BEGIN CATCH
                        PRINT 'JOIN skipped: ' + ERROR_MESSAGE();
                    END CATCH
                END

                -- Cập nhật WidthSize = KhoVai + ' ' + TenDVVT từ ERP_KhoVai + ERP_DonViVT
                IF OBJECT_ID('dbo.ERP_KhoVai') IS NOT NULL
                BEGIN
                    BEGIN TRY
                        EXEC sp_executesql N'
                            UPDATE f
                            SET WidthSize = LTRIM(RTRIM(ISNULL(k.KhoVai, '''') + '' '' + ISNULL(d.TenDVVT, '''')))
                            FROM #NhapFinal f
                            LEFT JOIN dbo.ERP_KhoVai k  ON k.KhoVaiID = f.KhoVaiID
                            LEFT JOIN dbo.ERP_DonViVT d ON d.MaDVVT   = k.MaDVVT;';
                    END TRY
                    BEGIN CATCH
                        PRINT 'JOIN skipped: ' + ERROR_MESSAGE();
                    END CATCH
                END

                SELECT PINCC, PO, MaNPL, ItemCode, MaMauVT, MauVT, WidthSize, TenKH, SoLuong, SoBarCode
                FROM #NhapFinal
                ORDER BY SoLuong DESC;

                DROP TABLE #NhapAgg;
                DROP TABLE #NhapFinal;";

            using (SqlConnection conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
            {
                using (SqlCommand cmd = new SqlCommand(sql, conn))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandTimeout = 60;
                    cmd.Parameters.Add("@Ngay", SqlDbType.Date).Value = ngay.Date;
                    using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adt.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        /// <summary>
        /// Chi tiết các record XUẤT KHO trong 1 ngày (v2.3.7).
        /// </summary>
        public static DataTable GetXuatDetailByDay(DateTime ngay)
        {
            using (SqlConnection conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
            {
                using (SqlCommand cmd = new SqlCommand(@"
                    SELECT TOP 500
                        xh.MaLenh,
                        xh.MaLenhSX,
                        xh.MaGop                  AS MaDH,
                        xh.MaNPL,
                        xh.BarCode,
                        ISNULL(xh.SLNhap, 0)      AS SoLuong,
                        ISNULL(dh.MaKH, '')       AS MaKH,
                        ISNULL(kh.TenKH, '')      AS TenKH,
                        xh.NgayXuatHang
                    FROM dbo.PhieuXuatHang xh
                    LEFT JOIN dbo.DonHangTong dh ON dh.MaDH = xh.MaGop
                    LEFT JOIN dbo.KhachHang   kh ON kh.MaKH = dh.MaKH
                    WHERE xh.ModuleXH = 1
                      AND xh.NgayXuatHang IS NOT NULL
                      AND CAST(xh.NgayXuatHang AS DATE) = @Ngay
                    ORDER BY xh.SLNhap DESC;", conn))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandTimeout = 60;
                    cmd.Parameters.Add("@Ngay", SqlDbType.Date).Value = ngay.Date;
                    using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adt.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        /// <summary>
        /// Chi tiết các record KIỂM KÊ trong 1 ngày (v2.3.7) — từ ERPPhieuKiemKe_NPLV2.
        /// </summary>
        public static DataTable GetKiemKeDetailByDay(DateTime ngay)
        {
            DataTable empty = new DataTable();
            empty.Columns.Add("PhieuKiemKe", typeof(string));
            empty.Columns.Add("SoLo",        typeof(string));
            empty.Columns.Add("MaNPL",       typeof(string));
            empty.Columns.Add("BarCode",     typeof(string));
            empty.Columns.Add("SoLuong",     typeof(decimal));
            empty.Columns.Add("SLKiemKeEdit",typeof(decimal));
            empty.Columns.Add("UserKK",      typeof(string));
            empty.Columns.Add("IsXacNhan",   typeof(int));
            empty.Columns.Add("GhiChu",      typeof(string));

            using (SqlConnection conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
            {
                // SqlHelper.GetConnection() ĐÃ tự .Open() rồi — không gọi Open() lần 2!
                // Kiểm tra bảng tồn tại (môi trường khác có thể không có)
                bool hasTable;
                using (SqlCommand chk = new SqlCommand(
                    "SELECT CASE WHEN OBJECT_ID('dbo.ERPPhieuKiemKe_NPLV2','U') IS NULL THEN 0 ELSE 1 END",
                    conn))
                {
                    hasTable = System.Convert.ToInt32(chk.ExecuteScalar()) == 1;
                }
                if (!hasTable) return empty;

                using (SqlCommand cmd = new SqlCommand(@"
                    SELECT TOP 500
                        ISNULL(PhieuKiemKe, '')      AS PhieuKiemKe,
                        ISNULL(SoLo, '')             AS SoLo,
                        ISNULL(MaNPL, '')            AS MaNPL,
                        ISNULL(BarCode, '')          AS BarCode,
                        ISNULL(SLKiemKe, 0)          AS SoLuong,
                        ISNULL(SLKiemKeEdit, 0)      AS SLKiemKeEdit,
                        ISNULL(UserKK, '')           AS UserKK,
                        ISNULL(IsXacNhan, 0)         AS IsXacNhan,
                        ISNULL(GhiChu, '')           AS GhiChu
                    FROM dbo.ERPPhieuKiemKe_NPLV2
                    WHERE DateKiemKe IS NOT NULL
                      AND CAST(DateKiemKe AS DATE) = @Ngay
                    ORDER BY SLKiemKe DESC;", conn))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandTimeout = 60;
                    cmd.Parameters.Add("@Ngay", SqlDbType.Date).Value = ngay.Date;
                    using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adt.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        /// <summary>
        /// Chi tiết lấp đầy ở cấp Ô (slot) — v2.3.9.
        /// Trả về danh sách ô đang chứa vật tư, kèm Tầng/Dãy/Kệ/Ô + khách hàng + mã NPL.
        /// Dùng cho phần "Chi tiết theo ô" trong modal Tổng sức chứa.
        /// </summary>
        public static DataTable GetRackSlotDetail()
        {
            using (SqlConnection conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
            {
                using (SqlCommand cmd = new SqlCommand(@"
                    -- Barcode đã xuất nhưng chưa thu hồi → loại trừ
                    SELECT BarCode INTO #tmpXuat FROM PhieuXuatHang t1
                    WHERE NOT EXISTS (
                        SELECT 1 FROM PhieuThuHoiNPL t2
                        WHERE t2.MaLenh = t1.MaLenhSX
                          AND (t2.BarCode = t1.BarCode OR t2.BarCode = t1.BarCodeGoc)
                          AND t1.Dot = t2.Dot
                    );

                    -- Barcode đã soạn hàng (đã trừ TK) → loại trừ
                    SELECT TOP (0) BarCode INTO #tmpSoanHang FROM ERP_SoanHangNPL_BarCode;
                    IF COL_LENGTH('dbo.ERP_SoanHangNPL_BarCode','SLSoanHang_TK') IS NOT NULL
                       AND COL_LENGTH('dbo.ERP_SoanHangNPL_BarCode','SLSoanHang_BC') IS NOT NULL
                    BEGIN
                        INSERT INTO #tmpSoanHang(BarCode)
                        EXEC sp_executesql N'SELECT BarCode FROM ERP_SoanHangNPL_BarCode
                            WHERE ISNULL(SLSoanHang_TK,0) - ISNULL(SLSoanHang_BC,0) = 0;';
                    END

                    -- Vật tư đang nằm trong các ô + thông tin khách hàng
                    SELECT
                        ke.KeID,
                        ke.TenKe,
                        ke.Module,
                        d.TenDay,
                        o.TenO,
                        ISNULL(ct.MaNPL, '')       AS MaNPL,
                        vt.Barcode                 AS BarCode,
                        ct.SoLoID,
                        ISNULL(nk.SoLo, '')        AS SoLo,
                        ROUND(ISNULL(vt.CBM, 0), 4) AS CBM,
                        ISNULL(nk.MaKH, '')        AS MaKH,
                        ISNULL(kh.TenKH, '')       AS TenKH
                    INTO #tmpSlot
                    FROM dbo.ERP_VatTuCBM vt
                    INNER JOIN dbo.ERP_ONPL o  ON o.TenO = vt.MaONPL
                    INNER JOIN dbo.ERP_KeNPL ke ON ke.KeID = o.KeID
                    LEFT  JOIN dbo.ERP_DayNPL d ON d.DayID = ke.DayID
                    LEFT  JOIN dbo.ERP_ChiTietNhapKhoNPL ct ON ct.BarCode = vt.Barcode
                    LEFT  JOIN dbo.ERP_NhapKhoNPL nk ON nk.SoLoID = ct.SoLoID
                    LEFT  JOIN dbo.KhachHang     kh ON kh.MaKH    = nk.MaKH
                    WHERE vt.MaONPL IS NOT NULL
                      AND ke.Module IN (1, 2)
                      AND LOWER(ISNULL(d.TenDay, N'')) NOT LIKE '%co%'
                      AND LOWER(ISNULL(d.TenDay, N'')) NOT LIKE N'%lỗi%'
                      AND LOWER(ISNULL(d.TenDay, N'')) NOT LIKE N'%n%'
                      AND NOT EXISTS (SELECT 1 FROM #tmpXuat tx WHERE tx.BarCode = vt.Barcode)
                      AND NOT EXISTS (SELECT 1 FROM #tmpSoanHang ts WHERE ts.BarCode = vt.Barcode);

                    -- Gộp theo Ô: 1 ô có thể chứa nhiều barcode, nhiều mã NPL, nhiều khách
                    SELECT
                        Module,
                        CASE WHEN Module = 1 THEN N'NL' WHEN Module = 2 THEN N'PL' ELSE N'?' END AS LoaiKho,
                        TenDay,
                        TenKe,
                        TenO,
                        COUNT(DISTINCT BarCode)                                          AS SoBarCode,
                        COUNT(DISTINCT CASE WHEN MaNPL <> '' THEN MaNPL END)             AS SoMaNPL,
                        COUNT(DISTINCT CASE WHEN MaKH  <> '' THEN MaKH  END)             AS SoKhachHang,
                        STUFF((SELECT DISTINCT TOP 3 ', ' + s2.MaNPL FROM #tmpSlot s2
                               WHERE s2.TenO = s.TenO AND s2.MaNPL <> ''
                               FOR XML PATH('')), 1, 2, '')                              AS DanhSachMaNPL,
                        STUFF((SELECT DISTINCT TOP 3 ', ' + s3.TenKH FROM #tmpSlot s3
                               WHERE s3.TenO = s.TenO AND s3.TenKH <> ''
                               FOR XML PATH('')), 1, 2, '')                              AS DanhSachKH,
                        ROUND(SUM(CBM), 4)                                               AS TongCBM
                    FROM #tmpSlot s
                    GROUP BY Module, TenDay, TenKe, TenO
                    ORDER BY Module, TenDay, TenKe, TenO;

                    DROP TABLE #tmpSlot;
                    DROP TABLE #tmpXuat;
                    DROP TABLE #tmpSoanHang;", conn))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandTimeout = 120;
                    using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adt.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        /// <summary>
        /// Lịch hoạt động kho — 4 mục: TotalIn (nhập), TotalOut (xuất),
        /// TotalKiemKe (kiểm kê từ ERPPhieuKiemKe_NPLV2), TotalActivity (tổng).
        /// v2.3.7 — dùng temp tables, ép kiểu DATE tường minh, fallback an toàn cho
        /// bảng/cột kiểm kê nếu môi trường không có (Issue 2 fix).
        /// </summary>
        public static DataTable GetActivityCalendar(DateTime tuNgay, DateTime denNgay)
        {
            string sql = @"
                DECLARE @StartDate DATE = CAST(@TuNgay  AS DATE);
                DECLARE @EndDate   DATE = CAST(@DenNgay AS DATE);
                DECLARE @TotalDays INT  = DATEDIFF(DAY, @StartDate, @EndDate) + 1;
                IF @TotalDays < 1   SET @TotalDays = 1;
                IF @TotalDays > 400 SET @TotalDays = 400;

                -- ① CALENDAR DAYS (temp table — chắc chắn ORDER ổn định)
                IF OBJECT_ID('tempdb..#CalDays') IS NOT NULL DROP TABLE #CalDays;
                SELECT TOP (@TotalDays)
                    DATEADD(DAY, ROW_NUMBER() OVER (ORDER BY (SELECT 1)) - 1, @StartDate) AS NgayHoatDong
                INTO #CalDays
                FROM master..spt_values WHERE type = 'P';

                -- v2.3.8 — Dùng range comparison (SARGable) thay vì CAST trong WHERE
                -- để query engine có thể sử dụng index trên NgayNhapKho/NgayXuatHang
                DECLARE @EndPlus1 DATE = DATEADD(DAY, 1, @EndDate);

                -- ② NHẬP KHO
                IF OBJECT_ID('tempdb..#CalNhap') IS NOT NULL DROP TABLE #CalNhap;
                SELECT CAST(NgayNhapKho AS DATE) AS Ngay,
                       SUM(ISNULL(SoLuongThucTeBanDau, 0)) AS TotalIn
                INTO #CalNhap
                FROM dbo.ERP_ChiTietNhapKhoNPL
                WHERE NgayNhapKho >= @StartDate
                  AND NgayNhapKho <  @EndPlus1
                GROUP BY CAST(NgayNhapKho AS DATE);

                -- ③ XUẤT KHO
                IF OBJECT_ID('tempdb..#CalXuat') IS NOT NULL DROP TABLE #CalXuat;
                SELECT CAST(NgayXuatHang AS DATE) AS Ngay,
                       SUM(ISNULL(SLNhap, 0)) AS TotalOut
                INTO #CalXuat
                FROM dbo.PhieuXuatHang
                WHERE ModuleXH = 1
                  AND NgayXuatHang >= @StartDate
                  AND NgayXuatHang <  @EndPlus1
                GROUP BY CAST(NgayXuatHang AS DATE);

                -- ④ KIỂM KÊ — ưu tiên ERPPhieuKiemKe_NPLV2 (SLKiemKe + DateKiemKe).
                -- Fallback: cột NgayKiemKe trên ERP_ChiTietNhapKhoNPL. Cả 2 đều có thể
                -- thiếu trên môi trường khác → check OBJECT_ID/COL_LENGTH trước.
                IF OBJECT_ID('tempdb..#CalKK') IS NOT NULL DROP TABLE #CalKK;
                CREATE TABLE #CalKK (Ngay DATE PRIMARY KEY, TotalKiemKe DECIMAL(18,2));

                IF OBJECT_ID('dbo.ERPPhieuKiemKe_NPLV2', 'U') IS NOT NULL
                BEGIN
                    INSERT INTO #CalKK (Ngay, TotalKiemKe)
                    EXEC sp_executesql
                        N'SELECT CAST(DateKiemKe AS DATE) AS Ngay,
                                 SUM(ISNULL(SLKiemKe, 0)) AS TotalKiemKe
                          FROM dbo.ERPPhieuKiemKe_NPLV2
                          WHERE DateKiemKe >= @S AND DateKiemKe < @E
                          GROUP BY CAST(DateKiemKe AS DATE);',
                        N'@S DATE, @E DATE', @S = @StartDate, @E = @EndPlus1;
                END
                ELSE IF COL_LENGTH('dbo.ERP_ChiTietNhapKhoNPL', 'NgayKiemKe') IS NOT NULL
                BEGIN
                    INSERT INTO #CalKK (Ngay, TotalKiemKe)
                    EXEC sp_executesql
                        N'SELECT CAST(NgayKiemKe AS DATE) AS Ngay,
                                 CAST(COUNT(*) AS DECIMAL(18,2)) AS TotalKiemKe
                          FROM dbo.ERP_ChiTietNhapKhoNPL
                          WHERE NgayKiemKe >= @S AND NgayKiemKe < @E
                          GROUP BY CAST(NgayKiemKe AS DATE);',
                        N'@S DATE, @E DATE', @S = @StartDate, @E = @EndPlus1;
                END

                -- ⑤ KẾT HỢP TẤT CẢ
                SELECT
                    CONVERT(VARCHAR(10), d.NgayHoatDong, 120) AS NgayHoatDong,
                    ISNULL(n.TotalIn,     0) AS TotalIn,
                    ISNULL(x.TotalOut,    0) AS TotalOut,
                    ISNULL(k.TotalKiemKe, 0) AS TotalKiemKe,
                    ISNULL(n.TotalIn, 0) + ISNULL(x.TotalOut, 0) + ISNULL(k.TotalKiemKe, 0) AS TotalActivity
                FROM #CalDays d
                LEFT JOIN #CalNhap n ON n.Ngay = d.NgayHoatDong
                LEFT JOIN #CalXuat x ON x.Ngay = d.NgayHoatDong
                LEFT JOIN #CalKK   k ON k.Ngay = d.NgayHoatDong
                ORDER BY d.NgayHoatDong;

                DROP TABLE #CalDays;
                DROP TABLE #CalNhap;
                DROP TABLE #CalXuat;
                DROP TABLE #CalKK;";

            using (SqlConnection conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
            {
                using (SqlCommand cmd = new SqlCommand(sql, conn))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandTimeout = 120;
                    cmd.Parameters.Add("@TuNgay",  SqlDbType.DateTime).Value = tuNgay.Date;
                    cmd.Parameters.Add("@DenNgay", SqlDbType.DateTime).Value = denNgay.Date;
                    using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adt.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        /// <summary>
        /// Xuất - Nhập - Tồn theo khoảng ngày tùy chọn (gộp theo ngày).
        /// v2.3.5 — Issue 1: thay thế period selector tuần/tháng/quý/năm.
        /// </summary>
        public static DataTable GetFlowTrendByRange(DateTime tuNgay, DateTime denNgay)
        {
            using (SqlConnection conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
            {
                using (SqlCommand cmd = new SqlCommand(@"
                    DECLARE @StartDate DATE = @TuNgay;
                    DECLARE @EndDate   DATE = @DenNgay;
                    DECLARE @TotalDays INT  = DATEDIFF(DAY, @StartDate, @EndDate) + 1;
                    IF @TotalDays < 1 SET @TotalDays = 1;
                    IF @TotalDays > 400 SET @TotalDays = 400;

                    ;WITH Days AS (
                        SELECT TOP (@TotalDays)
                            CAST(DATEADD(DAY, number, @StartDate) AS DATE) AS Ngay
                        FROM master..spt_values
                        WHERE type = 'P' AND number BETWEEN 0 AND 399
                    ),
                    TonDauKy AS (
                        SELECT ISNULL(SUM(SL), 0) AS TonDau FROM (
                            SELECT SUM(ISNULL(SoLuongThucTeBanDau, 0)) AS SL
                            FROM ERP_ChiTietNhapKhoNPL
                            WHERE TRY_CONVERT(DATE, NgayNhapKho) < @StartDate
                            UNION ALL
                            SELECT -SUM(ISNULL(SLNhap, 0))
                            FROM PhieuXuatHang
                            WHERE ModuleXH = 1
                              AND TRY_CONVERT(DATE, NgayXuatHang) < @StartDate
                            UNION ALL
                            SELECT SUM(ISNULL(ThuHoi, 0))
                            FROM PhieuThuHoiNPL
                            WHERE TRY_CONVERT(DATE, NgayTH) < @StartDate
                        ) t
                    ),
                    -- v2.3.8 — SARGable predicates để dùng được index
                    NhapTheoNgay AS (
                        SELECT CAST(NgayNhapKho AS DATE) AS Ngay,
                               SUM(ISNULL(SoLuongThucTeBanDau, 0)) AS TotalIn
                        FROM ERP_ChiTietNhapKhoNPL
                        WHERE NgayNhapKho >= @StartDate
                          AND NgayNhapKho <  DATEADD(DAY, 1, @EndDate)
                        GROUP BY CAST(NgayNhapKho AS DATE)
                    ),
                    XuatTheoNgay AS (
                        SELECT CAST(NgayXuatHang AS DATE) AS Ngay,
                               SUM(ISNULL(SLNhap, 0)) AS TotalOut
                        FROM PhieuXuatHang
                        WHERE ModuleXH = 1
                          AND NgayXuatHang >= @StartDate
                          AND NgayXuatHang <  DATEADD(DAY, 1, @EndDate)
                        GROUP BY CAST(NgayXuatHang AS DATE)
                    ),
                    ThuHoiTheoNgay AS (
                        SELECT CAST(NgayTH AS DATE) AS Ngay,
                               SUM(ISNULL(ThuHoi, 0)) AS TotalTH
                        FROM PhieuThuHoiNPL
                        WHERE NgayTH >= @StartDate
                          AND NgayTH <  DATEADD(DAY, 1, @EndDate)
                        GROUP BY CAST(NgayTH AS DATE)
                    ),
                    Combined AS (
                        SELECT d.Ngay,
                               ISNULL(n.TotalIn, 0)  AS TotalIn,
                               ISNULL(x.TotalOut, 0) AS TotalOut,
                               ISNULL(th.TotalTH, 0) AS TotalTH
                        FROM Days d
                        LEFT JOIN NhapTheoNgay   n  ON n.Ngay  = d.Ngay
                        LEFT JOIN XuatTheoNgay   x  ON x.Ngay  = d.Ngay
                        LEFT JOIN ThuHoiTheoNgay th ON th.Ngay = d.Ngay
                    )
                    SELECT
                        CONVERT(VARCHAR(10), c.Ngay, 120) AS Ngay,
                        c.TotalIn,
                        c.TotalOut,
                        ISNULL(d.TonDau, 0)
                          + SUM(c.TotalIn + c.TotalTH - c.TotalOut)
                            OVER (ORDER BY c.Ngay ROWS UNBOUNDED PRECEDING) AS TotalStock
                    FROM Combined c CROSS JOIN TonDauKy d
                    ORDER BY c.Ngay;", conn))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandTimeout = 120;
                    cmd.Parameters.AddWithValue("@TuNgay",  tuNgay.Date);
                    cmd.Parameters.AddWithValue("@DenNgay", denNgay.Date);
                    using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adt.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        public static DataTable GetMoMComparison()
        {
            using (SqlConnection conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
            {
                using (SqlCommand cmd = new SqlCommand(@"
                    -- v2.3.16 — Auto-detect 2 tháng GẦN NHẤT CÓ data thực sự
                    -- (thay vì cố định ThisMonth/LastMonth — tránh hiện 0 khi DB chưa có data tháng hiện tại)

                    -- Tìm tháng mới nhất có Nhập HOẶC Xuất
                    DECLARE @MaxDate DATE;
                    SELECT @MaxDate = MAX(d) FROM (
                        SELECT MAX(CAST(NgayNhapKho AS DATE)) AS d FROM ERP_ChiTietNhapKhoNPL WHERE NgayNhapKho IS NOT NULL
                        UNION ALL
                        SELECT MAX(CAST(NgayXuatHang AS DATE)) AS d FROM PhieuXuatHang WHERE ModuleXH=1 AND NgayXuatHang IS NOT NULL
                    ) t;

                    IF @MaxDate IS NULL SET @MaxDate = CAST(GETDATE() AS DATE);

                    -- ThisMonth = đầu tháng của ngày mới nhất; LastMonth = tháng trước đó
                    DECLARE @ThisMonth DATE = DATEFROMPARTS(YEAR(@MaxDate), MONTH(@MaxDate), 1);
                    DECLARE @LastMonth DATE = DATEADD(MONTH, -1, @ThisMonth);
                    DECLARE @NextMonth DATE = DATEADD(MONTH,  1, @ThisMonth);

                    SELECT 'ThisMonth' AS KieuKy,
                        YEAR(@ThisMonth) AS Nam, MONTH(@ThisMonth) AS Thang,
                        (SELECT ISNULL(SUM(ISNULL(SoLuongThucTeBanDau,0)),0) FROM ERP_ChiTietNhapKhoNPL
                         WHERE NgayNhapKho >= @ThisMonth AND NgayNhapKho < @NextMonth) AS TotalIn,
                        (SELECT ISNULL(SUM(ISNULL(SLNhap,0)),0) FROM PhieuXuatHang
                         WHERE ModuleXH=1 AND NgayXuatHang >= @ThisMonth AND NgayXuatHang < @NextMonth) AS TotalOut
                    UNION ALL
                    SELECT 'LastMonth' AS KieuKy,
                        YEAR(@LastMonth) AS Nam, MONTH(@LastMonth) AS Thang,
                        (SELECT ISNULL(SUM(ISNULL(SoLuongThucTeBanDau,0)),0) FROM ERP_ChiTietNhapKhoNPL
                         WHERE NgayNhapKho >= @LastMonth AND NgayNhapKho < @ThisMonth) AS TotalIn,
                        (SELECT ISNULL(SUM(ISNULL(SLNhap,0)),0) FROM PhieuXuatHang
                         WHERE ModuleXH=1 AND NgayXuatHang >= @LastMonth AND NgayXuatHang < @ThisMonth) AS TotalOut;", conn))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandTimeout = 60;
                    using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adt.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        public static DataTable GetTop5(int isNhieuNhat)
        {
            return GetTop5(isNhieuNhat, 0);
        }

        /// <summary>
        /// Top NL/PL theo số lượng tồn kho.
        /// loaiNPL: 0 = tất cả, 1 = chỉ NL (Module=1), 2 = chỉ PL (Module=2).
        /// Truy vấn trực tiếp ERP_VatTuCBM + ERP_ONPL để Module quyết định NL/PL,
        /// thay vì SP_PHIEUKHONPL (không có cột phân biệt NL/PL). Bug fix v2.3.5.
        /// </summary>
        public static DataTable GetTop5(int isNhieuNhat, int loaiNPL)
        {
            return GetOrCache("dk_Top5_" + isNhieuNhat + "_" + loaiNPL,
                () => GetTop5Internal(isNhieuNhat, loaiNPL));
        }

        private static DataTable GetTop5Internal(int isNhieuNhat, int loaiNPL)
        {
            using (SqlConnection conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
            {
                using (SqlCommand cmd = new SqlCommand(@"
                    IF COL_LENGTH('dbo.ERP_VatTuCBM','MaONPL') IS NULL
                       OR COL_LENGTH('dbo.ERP_ONPL','TenO')   IS NULL
                    BEGIN
                        SELECT CAST(NULL AS NVARCHAR(200)) AS MaVT,
                               CAST(NULL AS NVARCHAR(500)) AS TenVT,
                               CAST(0    AS DECIMAL(18,4)) AS TonKho,
                               CAST(0    AS INT)           AS NPL
                        WHERE 1 = 0;
                        RETURN;
                    END

                    -- Barcodes đã xuất nhưng chưa thu hồi → loại trừ khỏi tồn kho
                    SELECT BarCode
                    INTO #tmpXuatChuaThuHoi
                    FROM PhieuXuatHang t1
                    WHERE NOT EXISTS (
                        SELECT 1 FROM PhieuThuHoiNPL t2
                        WHERE t2.MaLenh = t1.MaLenhSX
                          AND (t2.BarCode = t1.BarCode OR t2.BarCode = t1.BarCodeGoc)
                          AND t1.Dot = t2.Dot
                    );

                    -- Barcodes đã soạn hàng (đã trừ TK) → loại trừ
                    SELECT TOP (0) BarCode INTO #tmpSoanHang FROM ERP_SoanHangNPL_BarCode;
                    IF COL_LENGTH('dbo.ERP_SoanHangNPL_BarCode','SLSoanHang_TK') IS NOT NULL
                       AND COL_LENGTH('dbo.ERP_SoanHangNPL_BarCode','SLSoanHang_BC') IS NOT NULL
                    BEGIN
                        INSERT INTO #tmpSoanHang(BarCode)
                        EXEC sp_executesql N'SELECT BarCode FROM ERP_SoanHangNPL_BarCode
                            WHERE ISNULL(SLSoanHang_TK,0) - ISNULL(SLSoanHang_BC,0) = 0;';
                    END

                    -- ① Tồn kho theo MaNPL + Module
                    IF OBJECT_ID('tempdb..#TopRaw') IS NOT NULL DROP TABLE #TopRaw;
                    SELECT
                        ct.MaNPL,
                        o.Module,
                        SUM(ISNULL(ct.SoLuongThucTeBanDau, 0)) AS TonKho
                    INTO #TopRaw
                    FROM dbo.ERP_ChiTietNhapKhoNPL ct
                    INNER JOIN dbo.ERP_VatTuCBM v ON v.Barcode = ct.BarCode
                    INNER JOIN dbo.ERP_ONPL    o ON o.TenO     = v.MaONPL
                    WHERE v.MaONPL IS NOT NULL
                      AND o.Module IN (1, 2)
                      AND (@LoaiNPL = 0 OR o.Module = @LoaiNPL)
                      AND NOT EXISTS (SELECT 1 FROM #tmpXuatChuaThuHoi t WHERE t.BarCode = v.Barcode)
                      AND NOT EXISTS (SELECT 1 FROM #tmpSoanHang       t WHERE t.BarCode = v.Barcode)
                    GROUP BY ct.MaNPL, o.Module
                    HAVING SUM(ISNULL(ct.SoLuongThucTeBanDau, 0)) > 0;

                    -- ② Parse composite key 'MACLVT_xx@MAVT_yy@MAUVT_zz@KHO_aa' bằng PARSENAME
                    -- Replace @ → '.' rồi PARSENAME(4) = phần đầu, PARSENAME(1) = phần cuối
                    IF OBJECT_ID('tempdb..#TopParsed') IS NOT NULL DROP TABLE #TopParsed;
                    SELECT
                        r.MaNPL,
                        r.Module,
                        r.TonKho,
                        ISNULL(PARSENAME(REPLACE(r.MaNPL, '@', '.'), 4), '') AS MaCLVTID,
                        ISNULL(PARSENAME(REPLACE(r.MaNPL, '@', '.'), 3), '') AS MaVTID,
                        ISNULL(PARSENAME(REPLACE(r.MaNPL, '@', '.'), 2), '') AS MauVTID,
                        ISNULL(PARSENAME(REPLACE(r.MaNPL, '@', '.'), 1), '') AS KhoVaiID
                    INTO #TopParsed
                    FROM #TopRaw r;

                    -- ③ Khởi tạo #TopFinal với data cơ bản (luôn có)
                    -- v2.3.14 — ERP_VatTuTV có MaVT + ChiTiet (KHÔNG có TenVT/MaDVVT)
                    IF OBJECT_ID('tempdb..#TopFinal') IS NOT NULL DROP TABLE #TopFinal;
                    SELECT
                        p.MaVTID                          AS MaVTID_Raw,
                        CAST(p.MaVTID AS NVARCHAR(200))   AS MaVT,      -- sẽ update sang vt.MaVT thật
                        CAST('' AS NVARCHAR(500))         AS TenVT,     -- = ChiTiet (mô tả VT)
                        CAST('' AS NVARCHAR(200))         AS Mau,
                        CAST('' AS NVARCHAR(200))         AS KhoVai,
                        CAST('' AS NVARCHAR(500))         AS ChiTiet,   -- = ChiTiet (giống TenVT)
                        CAST('' AS NVARCHAR(50))          AS TenDVVT,
                        p.TonKho,
                        p.Module                          AS NPL,
                        p.MaCLVTID,
                        p.MauVTID,
                        p.KhoVaiID
                    INTO #TopFinal
                    FROM #TopParsed p;

                    -- ④ Update từng cột từ master (bọc TRY/CATCH)
                    IF OBJECT_ID('dbo.ERP_MauVTTV') IS NOT NULL
                    BEGIN
                        BEGIN TRY
                            EXEC sp_executesql N'
                                UPDATE f SET Mau = ISNULL(m.MauVT, '''')
                                FROM #TopFinal f
                                LEFT JOIN dbo.ERP_MauVTTV m ON m.MauVTID = f.MauVTID;';
                        END TRY
                        BEGIN CATCH
                            PRINT 'Mau JOIN bỏ qua: ' + ERROR_MESSAGE();
                        END CATCH
                    END

                    -- ERP_KhoVai: lấy KhoVai + (nếu có) MaDVVT để link sang đơn vị
                    IF OBJECT_ID('dbo.ERP_KhoVai') IS NOT NULL
                    BEGIN
                        BEGIN TRY
                            EXEC sp_executesql N'
                                UPDATE f SET KhoVai = ISNULL(k.KhoVai, '''')
                                FROM #TopFinal f
                                LEFT JOIN dbo.ERP_KhoVai k ON k.KhoVaiID = f.KhoVaiID;';
                        END TRY
                        BEGIN CATCH
                            PRINT 'KhoVai JOIN bỏ qua: ' + ERROR_MESSAGE();
                        END CATCH
                    END

                    -- ERP_VatTuTV: lấy MaVT thật + ChiTiet (cột TenVT KHÔNG tồn tại)
                    IF OBJECT_ID('dbo.ERP_VatTuTV') IS NOT NULL
                    BEGIN
                        BEGIN TRY
                            EXEC sp_executesql N'
                                UPDATE f
                                SET MaVT    = ISNULL(vt.MaVT,    f.MaVT),
                                    TenVT   = ISNULL(vt.ChiTiet, ''''),
                                    ChiTiet = ISNULL(vt.ChiTiet, '''')
                                FROM #TopFinal f
                                LEFT JOIN dbo.ERP_VatTuTV vt ON vt.MaVTID = f.MaVTID_Raw;';
                        END TRY
                        BEGIN CATCH
                            PRINT 'VatTuTV JOIN bỏ qua: ' + ERROR_MESSAGE();
                        END CATCH
                    END

                    -- ERP_DonViVT: link qua ERP_KhoVai.MaDVVT (theo gợi ý user)
                    IF OBJECT_ID('dbo.ERP_DonViVT') IS NOT NULL
                       AND OBJECT_ID('dbo.ERP_KhoVai') IS NOT NULL
                    BEGIN
                        BEGIN TRY
                            EXEC sp_executesql N'
                                UPDATE f
                                SET TenDVVT = ISNULL(d.TenDVVT, '''')
                                FROM #TopFinal f
                                LEFT JOIN dbo.ERP_KhoVai k ON k.KhoVaiID = f.KhoVaiID
                                LEFT JOIN dbo.ERP_DonViVT d ON d.MaDVVT = k.MaDVVT;';
                        END TRY
                        BEGIN CATCH
                            PRINT 'DonViVT JOIN bỏ qua: ' + ERROR_MESSAGE();
                        END CATCH
                    END

                    -- ⑤ Trả kết quả final, đã sort
                    SELECT MaVT, TenVT, Mau, KhoVai, ChiTiet, TenDVVT, TonKho, NPL
                    FROM #TopFinal
                    ORDER BY
                        CASE WHEN @IsNhieuNhat = 1 THEN TonKho END DESC,
                        CASE WHEN @IsNhieuNhat = 0 THEN TonKho END ASC;

                    DROP TABLE #TopRaw;
                    DROP TABLE #TopParsed;
                    DROP TABLE #TopFinal;
                    DROP TABLE #tmpXuatChuaThuHoi;
                    DROP TABLE #tmpSoanHang;", conn))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandTimeout = 300;
                    cmd.Parameters.AddWithValue("@IsNhieuNhat", isNhieuNhat);
                    cmd.Parameters.AddWithValue("@LoaiNPL",     loaiNPL);

                    DataTable dt = new DataTable();
                    using (var da = new SqlDataAdapter(cmd))
                    {
                        da.Fill(dt);
                    }

                    // TOP 15 (chart hiển thị 5; modal "Xem chi tiết" cần thêm)
                    if (dt.Rows.Count > 15)
                    {
                        for (int i = dt.Rows.Count - 1; i >= 15; i--) dt.Rows.RemoveAt(i);
                    }
                    return dt;
                }
            }
        }
    }
}
