using System;
using System.Data;
using System.Data.SqlClient;

namespace DashboardTongQuanTienDo.Models
{
    /// <summary>
    /// Model layer cho Dashboard Tổng Quan Tiến Độ.
    /// Theo đúng pattern chung của dự án (xem ERPDanhGiaNhaCCModel):
    ///   - Mỗi method tự mở 1 SqlConnection riêng, đóng/dispose trong finally.
    ///   - Gọi Stored Procedure qua CommandType.StoredProcedure + Parameters.AddWithValue
    ///     (KHÔNG dựng chuỗi "EXEC sp @x = 'y'" như code Entity-Framework cũ).
    ///   - Trả về DataTable cho các truy vấn đọc; Controller tự map sang kiểu dữ liệu
    ///     cần dùng và xử lý nghiệp vụ (tổng hợp, tính %, sắp xếp...).
    ///
    /// GHI CHÚ QUAN TRỌNG (khác với ERPDanhGiaNhaCC):
    /// Module này là Dashboard tổng hợp báo cáo, không phải 1 module CRUD nghiệp vụ,
    /// nên KHÔNG có 1 SP trung tâm duy nhất cho cả module. Nó tổng hợp dữ liệu từ
    /// NHIỀU Stored Procedure khác nhau, nằm trên 2 database khác nhau
    /// (PMS_VIKING_2025 = báo cáo doanh thu/tiến độ, PMS_QLDH_VIKING_2025 = đơn hàng/
    /// sản xuất/vật tư). Vì vậy Model này có nhiều method chuyên trách theo từng SP,
    /// thay vì 1 method Get(action, para1..5) dùng chung như module CRUD 1-SP.
    /// Việc chọn đúng database cho từng SP được giữ NGUYÊN như code gốc.
    /// </summary>
    public class DashboardTongQuanTienDoModel
    {
        // Tên connection string trong Web.config, tương ứng 2 EF DbContext cũ:
        // PMS_VIKING_2025Entities và PMS_QLDH_VIKING_2025Entities.
        // Nếu tên connection string thực tế trong Web.config khác, chỉ cần sửa 2 hằng số này.
        private const string CS_VIKING = "PMS_VIKING_2025Entities";
        private const string CS_QLDH = "PMS_QLDH_VIKING_2025Entities";

        #region Helper dùng chung

        private SqlConnection GetConnection(string connectionStringName)
        {
            return NtbSoft.ERP.Libs.SqlHelper.GetConnection();
        }

        /// <summary>Gọi 1 Stored Procedure, trả về toàn bộ kết quả dạng DataTable.</summary>
        private DataTable ExecTable(string connectionStringName, string spName, params SqlParameter[] parameters)
        {
            using (SqlConnection conn = GetConnection(connectionStringName))
            {
                try
                {
                    using (SqlCommand cmd = new SqlCommand(spName, conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        if (parameters != null) cmd.Parameters.AddRange(parameters);

                        using (var reader = cmd.ExecuteReader())
                        {
                            var tb = new DataTable();
                            tb.Load(reader);
                            return tb;
                        }
                    }
                }
                catch (Exception ex) { throw new Exception(ex.Message); }
                finally { conn.Close(); }
            }
        }

        /// <summary>Gọi Text Command, trả về toàn bộ kết quả dạng DataTable.</summary>
        private DataTable ExecText(string connectionStringName, string query, params SqlParameter[] parameters)
        {
            using (SqlConnection conn = GetConnection(connectionStringName))
            {
                try
                {
                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.CommandType = CommandType.Text;
                        if (parameters != null) cmd.Parameters.AddRange(parameters);

                        using (var reader = cmd.ExecuteReader())
                        {
                            var tb = new DataTable();
                            tb.Load(reader);
                            return tb;
                        }
                    }
                }
                catch (Exception ex) { throw new Exception(ex.Message); }
                finally { conn.Close(); }
            }
        }

        /// <summary>Gọi 1 Stored Procedure, chỉ lấy giá trị cell đầu tiên (ExecuteScalar).</summary>
        private object ExecScalar(string connectionStringName, string spName, params SqlParameter[] parameters)
        {
            using (SqlConnection conn = GetConnection(connectionStringName))
            {
                try
                {

                    using (SqlCommand cmd = new SqlCommand(spName, conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        if (parameters != null) cmd.Parameters.AddRange(parameters);
                        return cmd.ExecuteScalar();
                    }
                }
                catch (Exception ex) { throw new Exception(ex.Message); }
                finally { conn.Close(); }
            }
        }

        private static SqlParameter P(string name, object value)
        {
            return new SqlParameter(name, value ?? DBNull.Value);
        }

        #endregion

        // =====================================================================
        // Nhóm DOANH THU — SP: sp_BaoCaoDoanhThu_Action — DB: PMS_VIKING_2025
        // Actions đã dùng: ACTUAL_TOTAL, TARGET_MONTHLY, TOP_CUSTOMERS,
        //                  ACTUAL_MONTHLY, TARGET_TOTAL
        // =====================================================================
        public DataTable GetBaoCaoDoanhThu(string action, string startDate, string endDate)
        {
            return ExecTable(CS_QLDH, "sp_TienDo_BaoCaoDoanhThu_Action",
                P("@Action", action), P("@StartDate", startDate), P("@EndDate", endDate));
        }

        // =====================================================================
        // Nhóm ĐƠN HÀNG / SẢN XUẤT — SP: sp_BaoCaoDonHangVaSanXuat_Action
        // DB: PMS_QLDH_VIKING_2025
        // Actions đã dùng: TONG_DON_HANG, DANG_SAN_XUAT (scalar int),
        //                  TIEN_DO_GIAO_HANG (bảng)
        // =====================================================================
        public int GetBaoCaoDonHangVaSanXuat_Scalar(string action, string startDate, string endDate)
        {
            var result = ExecScalar(CS_QLDH, "sp_TienDo_BaoCaoDonHangVaSanXuat_Action",
                P("@Action", action), P("@StartDate", startDate), P("@EndDate", endDate));
            return (result == null || result == DBNull.Value) ? 0 : Convert.ToInt32(result);
        }

        public DataTable GetBaoCaoDonHangVaSanXuat(string action, string startDate, string endDate)
        {
            return ExecTable(CS_QLDH, "sp_TienDo_BaoCaoDonHangVaSanXuat_Action",
                P("@Action", action), P("@StartDate", startDate), P("@EndDate", endDate));
        }

        // =====================================================================
        // Nhóm TIẾN ĐỘ SẢN XUẤT theo giai đoạn — SP: sp_GetProductionReport_ByAction
        // DB: PMS_QLDH_VIKING_2025
        // Actions: CUT, BTP, SEW, ENDLINE, PACKING, AQL, PACKAGE_LIST
        // =====================================================================
        public DataTable GetProductionReportByAction(string action, string startDate, string endDate)
        {
            return ExecTable(CS_QLDH, "sp_TienDo_GetProductionReport_ByAction",
                P("@Action", action), P("@StartDate", startDate), P("@EndDate", endDate));
        }

        // =====================================================================
        // Nhận thành phẩm (scalar) — SP: sp_GetNhanThanhPham_BaoCao — DB: PMS_VIKING_2025
        // =====================================================================
        public double GetNhanThanhPhamTotal(string startDate, string endDate)
        {
            var result = ExecScalar(CS_QLDH, "sp_TienDo_BaoCaoDonHangVaSanXuat_Action",
                P("@Action", "NHAN_THANH_PHAM"), P("@StartDate", startDate), P("@EndDate", endDate),
                P("@Status", "1"), P("@Para4", ""), P("@Para5", "1"));
            return (result == null || result == DBNull.Value) ? 0 : Convert.ToDouble(result);
        }

        // =====================================================================
        // Tiến độ chi tiết theo Lệnh SX — SP: SP_QTY_BaoCaoTienDo_ChiTiet
        // DB: PMS_VIKING_2025
        // action='GetLenhSX' -> lấy danh sách mã lệnh; action='Get' -> chi tiết
        // =====================================================================
        public DataTable GetTienDoChiTiet(string action, string para1, string para2,
                                           string para3, string para4, string para5)
        {
            return ExecTable(CS_QLDH, "SP_TienDo_QTY_BaoCaoTienDo_ChiTiet",
                P("@Action", action), P("@para1", para1), P("@para2", para2),
                P("@para3", para3), P("@para4", para4), P("@para5", para5));
        }

        // =====================================================================
        // Nhu cầu / Tồn kho NPL — SP: sp_BaoCaoNhuCauTonKho_Action
        // Lưu ý: SP này được gọi trên CẢ 2 database tuỳ endpoint gốc — giữ nguyên
        // đúng như code cũ để không đổi hành vi hiện tại.
        // =====================================================================

        /// <summary>Dùng trong GetWipData (DB Viking) — action TONG_HOP_NHU_CAU_TON_KHO.</summary>
        public DataTable GetBaoCaoNhuCauTonKho_Viking(string action, string startDate, string endDate,
                                                       string maCLVT, string para, string para2)
        {
            return ExecTable(CS_QLDH, "sp_TienDo_BaoCaoNhuCauTonKho_Action",
                P("@Action", action), P("@StartDate", startDate), P("@EndDate", endDate),
                P("@MaCLVT", maCLVT), P("@para", para), P("@para2", para2));
        }

        /// <summary>Dùng trong GetMaterialStatusDetails/GetMaterialsData (DB QLDH).</summary>
        public DataTable GetBaoCaoNhuCauTonKho_QLDH(string action, string startDate, string endDate,
                                                     string maCLVT, string para, string para2)
        {
            return ExecTable(CS_QLDH, "sp_TienDo_BaoCaoNhuCauTonKho_Action",
                P("@Action", action), P("@StartDate", startDate), P("@EndDate", endDate),
                P("@MaCLVT", maCLVT), P("@para", para), P("@para2", para2));
        }

        // =====================================================================
        // Chi tiết PO — SP: GetPOReportDetails — DB: PMS_QLDH_VIKING_2025
        // =====================================================================
        public DataTable GetPOReportDetails(string poId)
        {
            return ExecTable(CS_QLDH, "sp_TienDo_BaoCaoDonHangVaSanXuat_Action",
                P("@Action", "CHI_TIET_PO"), P("@POID", poId));
        }

        // =====================================================================
        // Chi tiết công đoạn theo PO (Action 14) — DB: PMS_QLDH_VIKING_2025
        // =====================================================================
        public DataTable GetPOStagesDetails(string poId)
        {
            return ExecTable(CS_QLDH, "sp_TienDo_BaoCaoDonHangVaSanXuat_Action",
                P("@Action", "14"), P("@POID", poId));
        }

        // =====================================================================
        // Gantt / sản lượng theo PO — SP: GetProductionQuantityReport
        // DB: PMS_QLDH_VIKING_2025
        // =====================================================================
        public DataTable GetProductionQuantityReport(string startDate, string endDate)
        {
            return ExecTable(CS_QLDH, "sp_TienDo_BaoCaoDonHangVaSanXuat_Action",
                P("@Action", "SAN_LUONG_DON_HANG"), P("@StartDate", startDate), P("@EndDate", endDate));
        }

        // =====================================================================
        // Bảng Đơn Hàng & Kế Hoạch Thời Gian (Tab Chuẩn Bị) 
        // =====================================================================
        public DataTable GetOrdersGridData(string startDate, string endDate)
        {
            string query = @"
                select t1.MaLenh,t3.MaHang,t3.TenHang, t4.TenCL
                into #tblML
                from CanDoiDonViSanXuat t1
                left join DonHangTong t2 on t1.MaDH = t2.MaDH
                left join HangHoa t3 on t2.MaKH = t3.MaKH and t2.MaHang = t3.MaHang
                left join ChungLoai t4 on t2.MaCL = t4.MaCL
                group by  t1.MaLenh,t3.MaHang,t3.TenHang, t4.TenCL

                SELECT
                    w.LenhSX,
                    w.MaLenhSanXuat,
                    w.LineX,
                    w.WIPId,
	                t2.TenHang,
	                t2.TenCL,

                    -- Cắt
                    MAX(CASE WHEN wp.StepCode = 'TTCat'
                             THEN wp.KH_Date END) AS KHCat,
                    MAX(CASE WHEN wp.StepCode = 'TTCat'
                             THEN wp.TT_Date END) AS TTCat,

                    -- Lập trình
                    MAX(CASE WHEN wp.StepCode = 'TTLapTrinh'
                             THEN wp.KH_Date END) AS KHLapTrinh,
                    MAX(CASE WHEN wp.StepCode = 'TTLapTrinh'
                             THEN wp.TT_Date END) AS TTLapTrinh,

                    -- May
                    MAX(CASE WHEN wp.StepCode = 'TTMay'
                             THEN wp.KH_Date END) AS KHMay,
                    MAX(CASE WHEN wp.StepCode = 'TTMay'
                             THEN wp.TT_Date END) AS TTMay,

                    -- Thoát chuyền
                    MAX(CASE WHEN wp.StepCode = 'TTThoatChuyen'
                             THEN wp.KH_Date END) AS KHThoatChuyen,
                    MAX(CASE WHEN wp.StepCode = 'TTThoatChuyen'
                             THEN wp.TT_Date END) AS TTThoatChuyen

                FROM dbo.WIP_DonHang_Chuyen w
                JOIN dbo.WIP_DonHang_Chuyen_TechProgress wp
                    ON w.WIPId = wp.WIPId
                left join #tblML t2 on w.LenhSX = TRY_CONVERT(INT, t2.MaLenh)
                WHERE wp.StepCode IN (
                    'TTCat',
                    'TTLapTrinh',
                    'TTMay',
                    'TTThoatChuyen'
                ) and isnull(w.isKetThuc,0) <> 1
                GROUP BY
                    w.LenhSX,
                    w.MaLenhSanXuat,
                    w.LineX,
                    w.WIPId,
	                t2.TenHang,
	                t2.TenCL;

                drop table #tblML
            ";
            
            // Hiện tại truy vấn SQL cung cấp không có điều kiện StartDate, EndDate.
            // Nếu có thể, có thể gài thêm parameter vào đây. Tạm thời cứ thực hiện query gốc.
            return ExecText(CS_QLDH, query);
        }

        // =====================================================================
        // Mua hàng NPL — SP: sp_BaoCaoMuaHangNPL_Action — DB: PMS_QLDH_VIKING_2025
        // Actions: THONG_KE_SO_LUONG, TONG_HOP_TRANG_THAI, CHI_TIET_MUA_HANG
        // =====================================================================
        public DataTable GetBaoCaoMuaHangNPL(string action, string startDate, string endDate,
                                              string maCLVT, string trangThai)
        {
            return ExecTable(CS_QLDH, "sp_TienDo_BaoCaoMuaHangNPL_Action",
                P("@Action", action), P("@StartDate", startDate), P("@EndDate", endDate),
                P("@MaCLVT", maCLVT), P("@TrangThai", trangThai));
        }
    }
}
