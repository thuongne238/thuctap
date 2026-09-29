using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

using NtbSoft.ERP.Model.Kho;

namespace NtbSoft.ERP.Model.DashboardKho
{

    public static class DashboardKhoDesktopModel
    {
        private const int CACHE_MINUTES = 10;
        private static readonly Dictionary<string, CachedEntry> _cache = new Dictionary<string, CachedEntry>();
        private static readonly ConcurrentDictionary<string, object> _keyLocks = new ConcurrentDictionary<string, object>();
        private static readonly object _cacheLock = new object();

        private class CachedEntry
        {
            public DataTable Data;
            public DateTime ExpiresAt;
            public bool IsRefreshing;
        }

        private static DataTable GetOrCache(string key, Func<DataTable> producer)
        {
            DataTable staleData = null;
            bool needsRefresh = false;

            lock (_cacheLock)
            {
                CachedEntry entry;
                if (_cache.TryGetValue(key, out entry))
                {
                    if (entry.ExpiresAt > DateTime.UtcNow)
                    {
                        return entry.Data;
                    }
                    else
                    {
                        staleData = entry.Data;
                        if (!entry.IsRefreshing)
                        {
                            entry.IsRefreshing = true;
                            needsRefresh = true;
                        }
                    }
                }
            }

            if (staleData != null)
            {
                if (needsRefresh)
                {
                    System.Threading.Tasks.Task.Run(() =>
                    {
                        try
                        {
                            var newDt = producer();
                            lock (_cacheLock)
                            {
                                _cache[key] = new CachedEntry
                                {
                                    Data = newDt,
                                    ExpiresAt = DateTime.UtcNow.AddMinutes(CACHE_MINUTES),
                                    IsRefreshing = false
                                };
                            }
                        }
                        catch
                        {
                            lock (_cacheLock)
                            {
                                if (_cache.ContainsKey(key))
                                    _cache[key].IsRefreshing = false;
                            }
                        }
                    });
                }
                return staleData;
            }

            // Cache Miss: Use Key-Level Double-Checked Locking to prevent concurrent database stampedes
            var keyLock = _keyLocks.GetOrAdd(key, k => new object());
            lock (keyLock)
            {
                // Double-check inside key lock in case another thread populated cache while waiting
                lock (_cacheLock)
                {
                    CachedEntry entry;
                    if (_cache.TryGetValue(key, out entry) && entry.Data != null)
                    {
                        return entry.Data;
                    }
                }

                var dt = producer();
                lock (_cacheLock)
                {
                    _cache[key] = new CachedEntry
                    {
                        Data = dt,
                        ExpiresAt = DateTime.UtcNow.AddMinutes(CACHE_MINUTES),
                        IsRefreshing = false
                    };
                }
                return dt;
            }
        }

        
        public static void ClearCache()
        {
            lock (_cacheLock) { _cache.Clear(); }
        }

        public static void WarmupCache()
        {
            System.Threading.Tasks.Task.Run(() =>
            {
                try
                {
                    GetOverallCapacity();
                    GetCustomers();
                    GetDistinctMaterialCount();
                    GetRacks();
                    GetThanhGiaHangTon();
                    GetCongViecChoXuLy(DateTime.Today.AddDays(-30), DateTime.Today);
                    GetTop5VatTuDungTich();
                    GetTop5KhachHangTonKho();
                    GetVatTuSapHetHan();
                    GetGiaTriTonKhoTheoNhom();
                    GetTinhHinhKiemKe();
                    GetTongNhap(DateTime.Today.AddDays(-30), DateTime.Today);
                    GetTongXuat(DateTime.Today.AddDays(-30), DateTime.Today);
                    GetTonKho(DateTime.Today);
                    GetTonDauKy(DateTime.Today);
                    GetPODangTre();
                    GetGiaTriTon(DateTime.Today);
                }
                catch { }
            });
        }

        private static T ExecuteWithRetry<T>(Func<T> func, int maxRetries = 3)
        {
            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    return func();
                }
                catch (SqlException ex)
                {
                    if (attempt >= maxRetries) throw;
                    // Chờ ngắn (exponential backoff) trước khi thử lại
                    System.Threading.Thread.Sleep(attempt * 200);
                }
                catch (Exception)
                {
                    if (attempt >= maxRetries) throw;
                    System.Threading.Thread.Sleep(attempt * 200);
                }
            }
            return default(T);
        }

        private static DataTable ExecuteSP(string action, Action<SqlCommand> paramBinder = null)
        {
            string cacheKey = "dk_sp_" + action;
            if (paramBinder != null)
            {
                using (SqlCommand dummyCmd = new SqlCommand())
                {
                    paramBinder(dummyCmd);
                    foreach (SqlParameter p in dummyCmd.Parameters)
                    {
                        if (p.Value is DateTime) cacheKey += $"_{p.ParameterName}={((DateTime)p.Value):yyyyMMdd}";
                        else cacheKey += $"_{p.ParameterName}={p.Value}";
                    }
                }
            }

            return GetOrCache(cacheKey, () =>
            {
                return ExecuteWithRetry(() =>
                {
                    using (SqlConnection conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
                    {
                        using (SqlCommand setupCmd = new SqlCommand("SET QUOTED_IDENTIFIER ON; SET ANSI_NULLS ON;", conn))
                        {
                            setupCmd.ExecuteNonQuery();
                        }
                        using (SqlCommand cmd = new SqlCommand("dbo.usp_DashboardKhoDesktop", conn))
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.CommandTimeout = 300;
                            cmd.Parameters.Add("@Action", SqlDbType.VarChar, 100).Value = action;
                            if (paramBinder != null) paramBinder(cmd);
                            using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                            {
                                DataTable dt = new DataTable();
                                adt.Fill(dt);
                                return dt;
                            }
                        }
                    }
                });
            });
        }

        private static DataTable ExecuteSPDirect(string action, Action<SqlCommand> paramBinder = null)
        {
            return ExecuteWithRetry(() =>
            {
                using (SqlConnection conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
                using (SqlCommand cmd = new SqlCommand("dbo.usp_DashboardKhoDesktop", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 300;
                    cmd.Parameters.Add("@Action", SqlDbType.VarChar, 100).Value = action;
                    if (paramBinder != null) paramBinder(cmd);
                    using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adt.Fill(dt);
                        return dt;
                    }
                }
            });
        }

        private static DataTable ExecuteQuery(string query, Action<SqlCommand> paramBinder = null)
        {
            string cacheKey = "dk_q_" + query.GetHashCode().ToString();
            if (paramBinder != null)
            {
                using (SqlCommand dummyCmd = new SqlCommand())
                {
                    paramBinder(dummyCmd);
                    foreach (SqlParameter p in dummyCmd.Parameters)
                    {  
                        if (p.Value is DateTime) cacheKey += $"_{p.ParameterName}={((DateTime)p.Value):yyyyMMdd}";
                        else cacheKey += $"_{p.ParameterName}={p.Value}";
                    }
                }
            }

            return GetOrCache(cacheKey, () =>
            {
                return ExecuteWithRetry(() =>
                {
                    using (SqlConnection conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.CommandType = CommandType.Text;
                        cmd.CommandTimeout = 300;
                        if (paramBinder != null) paramBinder(cmd);
                        using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                        {
                            DataTable dt = new DataTable();
                            adt.Fill(dt);
                            return dt;
                        }
                    }
                });
            });
        }

        public static DataTable GetOverallCapacity()
        {
            return GetOrCache("dk_OverallCapacity", () => ExecuteSP("GetOverallCapacity"));
        }

        public static DataTable GetDistinctMaterialCount()
        {
            return GetOrCache("dk_DistinctMaterialCount", () => ExecuteSP("GetDistinctMaterialCount"));
        }

        public static DataTable GetCustomers()
        {
            return GetOrCache("dk_Customers", () => ExecuteSP("GetCustomers"));
        }

        public static DataTable GetRacks()
        {
            return GetOrCache("dk_Racks", () => ExecuteSP("GetRacks"));
        }

     
        public static DataTable GlobalSearchByItemcode(string itemcode)
        {
            return ExecuteSP("GlobalSearchByItemcode", cmd => {
                cmd.Parameters.Add("@Itemcode", SqlDbType.NVarChar, 200).Value = (object)(itemcode ?? string.Empty) ?? DBNull.Value;
            });
        }

        public static DataTable GlobalSearchAll(string keyword)
        {
            return ExecuteSP("GlobalSearchAll", cmd => {
                cmd.Parameters.Add("@Itemcode", SqlDbType.NVarChar, 200).Value = (object)(keyword ?? string.Empty) ?? DBNull.Value;
            });
        }

  
        public static DataTable GetDangXuat(DateTime tuNgay, DateTime denNgay)
        {
            return ExecuteSP("GetDangXuat", cmd => {
                cmd.Parameters.Add("@TuNgay", SqlDbType.Date).Value = tuNgay.Date;
                cmd.Parameters.Add("@DenNgay", SqlDbType.Date).Value = denNgay.Date;
                
            });
        }

        public static DataTable GetFlowTrend12T()
        {
            return ExecuteSP("GetFlowTrend12T");
        }

        public static DataTable GetFlowTrendWeekly()
        {
            return ExecuteSP("GetFlowTrendWeekly");
        }

        public static DataTable GetAgeStock()
        {
            return GetOrCache("dk_AgeStock", () => ExecuteSP("GetAgeStock"));
        }

        public static DataTable GetTop5MaxNL()
        {
            return GetOrCache("dk_Top5MaxNL", () => ExecuteSP("GetTop5MaxNL"));
        }

        public static DataTable GetTop5MaxPL()
        {
            return GetOrCache("dk_Top5MaxPL", () => ExecuteSP("GetTop5MaxPL"));
        }

        public static DataTable GetTop5MinNL()
        {
            return GetOrCache("dk_Top5MinNL", () => ExecuteSP("GetTop5MinNL"));
        }

        public static DataTable GetTop5MinPL()
        {
            return GetOrCache("dk_Top5MinPL", () => ExecuteSP("GetTop5MinPL"));
        }

        public static DataTable GetHieuSuatHoatDong(DateTime? tuNgay = null, DateTime? denNgay = null)
        {
            return ExecuteSP("GetHieuSuatHoatDong", cmd => {
                if (tuNgay.HasValue) cmd.Parameters.AddWithValue("@TuNgay", tuNgay.Value);
                if (denNgay.HasValue) cmd.Parameters.AddWithValue("@DenNgay", denNgay.Value);
            });
        }

        public static DataTable GetActivityCalendar(string maNPL = "all", string soLoID = "all", string maHang = "all", string maKH = "all", string khoLoi = "0", string nhom = "all", int isNPL = 2)
        {
            DateTime today = DateTime.Today;
            return GetActivityCalendar(today.AddDays(-90), today.AddDays(30), maNPL, soLoID, maHang, maKH, khoLoi, nhom, isNPL);
        }

   
        public static DataTable GetAllMaterialsInStock()
        {
            return GetOrCache("dk_AllMaterials", () => ExecuteSP("GetAllMaterialsInStock"));
        }

   
        public static DataTable GetThanhGiaHangTon()
        {
            return GetOrCache("dk_ThanhGia", () => ExecuteSP("GetThanhGiaHangTon"));
        }

   
        public static DataTable GetNKDuKienByRange(DateTime tuNgay, DateTime denNgay)
        {
            return ExecuteSP("GetNKDuKienByRange", cmd => {
                cmd.Parameters.AddWithValue("@TuNgay", tuNgay.Date);
                cmd.Parameters.AddWithValue("@DenNgay", denNgay.Date);
            });
        }

     
        public static DataTable GetNhapDetailByRange(DateTime tuNgay, DateTime denNgay)
        {
            return ExecuteSP("GetNhapDetailByRange", cmd => {
                cmd.Parameters.AddWithValue("@TuNgay", tuNgay.Date);
                cmd.Parameters.AddWithValue("@DenNgay", denNgay.Date);
            });
        }

   
        public static DataTable GetXuatDetailByRange(DateTime tuNgay, DateTime denNgay)
        {
            return ExecuteSP("GetXuatDetailByRange", cmd => {
                cmd.Parameters.AddWithValue("@TuNgay", tuNgay.Date);
                cmd.Parameters.AddWithValue("@DenNgay", denNgay.Date);
            });
        }

        public static DataTable GetKiemKeDetailByRange(DateTime tuNgay, DateTime denNgay)
        {
            return ExecuteSP("GetKiemKeDetailByRange", cmd => {
                cmd.Parameters.AddWithValue("@TuNgay", tuNgay.Date);
                cmd.Parameters.AddWithValue("DenNgay", tuNgay.Date);
            });
        }

  
        public static DataTable GetNhapDetailByDay(DateTime ngay)
        {
            return ExecuteSP("GetNhapDetailByDay", cmd => {
                cmd.Parameters.AddWithValue("@Ngay", ngay.Date);
            });
        }

        public static DataTable GetXuatDetailByDay(DateTime ngay)
        {
            return ExecuteSP("GetXuatDetailByDay", cmd => {
                cmd.Parameters.AddWithValue("@Ngay", ngay.Date);
            });
        }


        public static DataTable GetKiemKeDetailByDay(DateTime ngay)
        {
            return ExecuteSP("GetKiemKeDetailByDay", cmd => {
                cmd.Parameters.AddWithValue("@Ngay", ngay.Date);
            });
        }

      
        public static DataTable GetRackSlotDetail()
        {
            return ExecuteSP("GetRackSlotDetail");
        }

     
        public static DataTable GetActivityCalendar(DateTime tuNgay, DateTime denNgay, string maNPL = "all", string soLoID = "all", string maHang = "all", string maKH = "all", string khoLoi = "0", string nhom = "all", int isNPL = 2)
        {
            return ExecuteSP("GetActivityCalendar", cmd => {
                cmd.Parameters.AddWithValue("@TuNgay",  tuNgay);
                cmd.Parameters.AddWithValue("@DenNgay", denNgay);
                cmd.Parameters.AddWithValue("@MaNPL", maNPL);
                cmd.Parameters.AddWithValue("@SoLoID", soLoID);
                cmd.Parameters.AddWithValue("@MaHang", maHang);
                cmd.Parameters.AddWithValue("@MaKH", maKH);
                cmd.Parameters.AddWithValue("@KhoLoi", khoLoi);
                cmd.Parameters.AddWithValue("@Nhom", nhom);
                cmd.Parameters.AddWithValue("@IsNPL", isNPL);
            });
        }

     
        public static DataTable GetFlowTrendByRange(DateTime tuNgay, DateTime denNgay, string maNPL = "all", string soLoID = "all", string maHang = "all", string maKH = "all", string khoLoi = "0", string nhom = "all", int isNPL = 2)
        {
            return ExecuteSP("GetFlowTrendByRange", cmd => {
                cmd.Parameters.AddWithValue("@TuNgay",  tuNgay.Date);
                cmd.Parameters.AddWithValue("@DenNgay", denNgay.Date);
                cmd.Parameters.AddWithValue("@MaNPL", maNPL);
                cmd.Parameters.AddWithValue("@SoLoID", soLoID);
                cmd.Parameters.AddWithValue("@MaHang", maHang);
                cmd.Parameters.AddWithValue("@MaKH", maKH);
                cmd.Parameters.AddWithValue("@KhoLoi", khoLoi);
                cmd.Parameters.AddWithValue("@Nhom", nhom);
                cmd.Parameters.AddWithValue("@IsNPL", isNPL);
            });
        }

        public static DataTable GetMoMComparison()
        {
            return ExecuteSP("GetMoMComparison");
        }

        public static DataTable GetTop5(int isNhieuNhat)
        {
            return GetTop5(isNhieuNhat, 0);
        }

      
        public static DataTable GetTop5(int isNhieuNhat, int loaiNPL)
        {
            return GetOrCache("dk_Top5_" + isNhieuNhat + "_" + loaiNPL,
                () => ExecuteSP("GetTop5", cmd => {
                    cmd.Parameters.AddWithValue("@IsNhieuNhat", isNhieuNhat);
                    cmd.Parameters.AddWithValue("@LoaiNPL",     loaiNPL);
                }));
        }

       
        public static DataTable GetCongViecChoXuLy(DateTime tuNgay, DateTime denNgay)
        {
            return ExecuteSP("GetCongViecChoXuLy", cmd => {
                cmd.Parameters.AddWithValue("@TuNgay", tuNgay.Date);
                cmd.Parameters.AddWithValue("@DenNgay", denNgay.Date);
            });
        }

        public static DataTable GetTop5VatTuDungTich()
        {
            return ExecuteSP("GetTop5VatTuDungTich");
        }

        public static DataTable GetTop5KhachHangTonKho()
        {
            return ExecuteSP("GetTop5KhachHangTonKho");
        }

        public static DataTable GetVatTuSapHetHan()
        {
            return ExecuteSP("GetVatTuSapHetHan");
        }

        public static DataTable GetGiaTriTonKhoTheoNhom()
        {
            return ExecuteSP("GetGiaTriTonKhoTheoNhom");
        }

        public static DataTable GetTinhHinhKiemKe()
        {
            return ExecuteSP("GetTinhHinhKiemKe");
        }


        public static DataTable GetTodoDetail(string type)
        {
            return ExecuteSP("GetTodoDetail", cmd => {
                cmd.Parameters.Add("@Itemcode", SqlDbType.NVarChar, 200)
                   .Value = (object)(type ?? "itemcode_cho_nk") ?? DBNull.Value;
            });
        }


        public static DataTable GetVatTuTheoDungTich()
        {
            return ExecuteSP("GetVatTuTheoDungTich");
        }

        public static DataTable GetKhachHangTonKhoChiTiet()
        {
            return ExecuteSP("GetKhachHangTonKhoChiTiet");
        }

        public static DataTable GetVatTuTheoKhachHang(string maKH)
        {
            return ExecuteSP("GetVatTuTheoKhachHang", cmd => {
                cmd.Parameters.AddWithValue("@Loai", maKH ?? "");
            });
        }

        public static DataTable GetVatTuSapHetHanChiTiet()
        {
            return ExecuteSP("GetVatTuSapHetHanChiTiet");
        }

        public static DataTable GetGiaTriNhomChiTiet()
        {
            return ExecuteSP("GetGiaTriNhomChiTiet");
        }

 

        public static DataTable GetTongNhap(DateTime tuNgay, DateTime denNgay)
        {
            return ExecuteSP("GetTongNhap", cmd => {
                cmd.Parameters.AddWithValue("@TuNgay", tuNgay);
                cmd.Parameters.AddWithValue("@DenNgay", denNgay);
            });
        }

        public static DataTable GetTongXuat(DateTime tuNgay, DateTime denNgay)
        {
            return ExecuteSP("GetTongXuat", cmd => {
                cmd.Parameters.AddWithValue("@TuNgay", tuNgay);
                cmd.Parameters.AddWithValue("@DenNgay", denNgay);
            });
        }

        public static DataTable GetTonKho(DateTime denNgay)
        {
            string cacheKey = string.Format("dk_TonKho_{0}", denNgay.ToString("yyyyMMdd"));
            return GetOrCache(cacheKey, () => ExecuteSP("GetTonKho", cmd => cmd.Parameters.AddWithValue("@DenNgay", denNgay)));
        }

        public static DataTable GetTonKho(DateTime tuNgay, DateTime denNgay)
        {
            string cacheKey = string.Format("dk_TonKho_{0}_{1}", tuNgay.ToString("yyyyMMdd"), denNgay.ToString("yyyyMMdd"));
            return GetOrCache(cacheKey, () => ExecuteSP("GetTonKho", cmd => {
                cmd.Parameters.AddWithValue("@TuNgay", tuNgay);
                cmd.Parameters.AddWithValue("@DenNgay", denNgay);
            }));
        }

        public static DataTable GetTonDauKy(DateTime tuNgay)
        {
            string cacheKey = string.Format("dk_TonDauKy_{0}", tuNgay.ToString("yyyyMMdd"));
            return GetOrCache(cacheKey, () => ExecuteSP("GetTonDauKy", cmd => cmd.Parameters.AddWithValue("@TuNgay", tuNgay)));
        }

        public static DataTable GetPODangTre(DateTime? tuNgay = null, DateTime? denNgay = null)
        {
            string cacheKey = string.Format("dk_PODangTre_{0}_{1}", tuNgay.HasValue ? tuNgay.Value.ToString("yyyyMMdd") : "", denNgay.HasValue ? denNgay.Value.ToString("yyyyMMdd") : "");
            return GetOrCache(cacheKey, () => {
                DataTable dtRaw = ExecuteSP("GetPOVeKho", cmd => {
                    if (tuNgay.HasValue) cmd.Parameters.AddWithValue("@TuNgay", tuNgay.Value);
                    if (denNgay.HasValue) cmd.Parameters.AddWithValue("@DenNgay", denNgay.Value);
                });
                int total = dtRaw != null ? dtRaw.Rows.Count : 0;
                int chuaKiem = 0;
                if (dtRaw != null)
                {
                    bool hasMaTT = dtRaw.Columns.Contains("MaTT");
                    foreach (DataRow row in dtRaw.Rows)
                    {
                        string maTT = hasMaTT && row["MaTT"] != DBNull.Value ? row["MaTT"].ToString() : "";
                        if (maTT == "chua_qc" || maTT == "dang_qc")
                        {
                            chuaKiem++;
                        }
                    }
                }

                DataTable dt = new DataTable();
                dt.Columns.Add("SoPO", typeof(int));
                dt.Columns.Add("SoPOChuaKiem", typeof(int));
                dt.Rows.Add(total, chuaKiem);
                return dt;
            });
        }

        public static DataTable GetGiaTriTon(DateTime denNgay)
        {
            string cacheKey = string.Format("dk_GiaTriTon_{0}", denNgay.ToString("yyyyMMdd"));
            return GetOrCache(cacheKey, () => ExecuteSP("GetGiaTriTon", cmd => cmd.Parameters.AddWithValue("@DenNgay", denNgay)));
        }

        public static DataTable GetCanhBaoTonKho()
        {
            return ExecuteSP("GetCanhBaoTonKho");
        }

        public static DataTable GetHieuSuatHoatDong(DateTime tuNgay, DateTime denNgay)
        {
            return ExecuteSP("GetHieuSuatHoatDong", cmd => {
                cmd.Parameters.AddWithValue("@TuNgay", tuNgay);
                cmd.Parameters.AddWithValue("@DenNgay", denNgay);
            });
        }

        public static DataTable GetKiemKeChiTiet()
        {
            return ExecuteSP("GetKiemKeChiTiet");
        }



        public static DataTable GetTonDauKyChiTiet(DateTime tuNgay, string loai)
        {
            // v2.9: DenNgay = hôm nay để TonKho = toàn bộ lịch sử đến hiện tại (khớp WinForms Thẻ kho NPL)
            DateTime denNgay = DateTime.Today;
            string cacheKey = string.Format("dk_TonDauKyChiTiet_{0}_{1}_{2}", tuNgay.ToString("yyyyMMdd"), denNgay.ToString("yyyyMMdd"), loai ?? "all");
            return GetOrCache(cacheKey, () => ExecuteSP("GetTonDauKyChiTiet", cmd => {
                cmd.Parameters.AddWithValue("@TuNgay", tuNgay);
                cmd.Parameters.AddWithValue("@DenNgay", denNgay);
                cmd.Parameters.AddWithValue("@Loai", loai ?? "all");
            }));
        }

        public static DataTable GetTonDauKyRollDetail(DateTime tuNgay, string maNPL)
        {
            // v2.9: DenNgay = hôm nay để TonKho = toàn bộ lịch sử đến hiện tại
            DateTime denNgay = DateTime.Today;
            string cacheKey = string.Format("dk_TonDauKyRollDetail_{0}_{1}_{2}", tuNgay.ToString("yyyyMMdd"), denNgay.ToString("yyyyMMdd"), maNPL ?? "");
            return GetOrCache(cacheKey, () => ExecuteSP("GetTonDauKyRollDetail", cmd => {
                cmd.Parameters.AddWithValue("@TuNgay", tuNgay);
                cmd.Parameters.AddWithValue("@DenNgay", denNgay);
                cmd.Parameters.AddWithValue("@Loai", maNPL ?? "");
            }));
        }
        public static DataTable GetPOVeKho()
        {
            return ExecuteSP("GetPOVeKho");
        }

        public static DataTable GetTongNhapChiTiet(DateTime tuNgay, DateTime denNgay, string groupBy)
        {
            string cacheKey = string.Format("dk_TongNhapChiTiet_{0}_{1}_{2}", tuNgay.ToString("yyyyMMdd"), denNgay.ToString("yyyyMMdd"), groupBy ?? "date");
            return GetOrCache(cacheKey, () => ExecuteSP("GetTongNhapChiTiet", cmd =>
            {
                cmd.Parameters.AddWithValue("@TuNgay", tuNgay);
                cmd.Parameters.AddWithValue("@DenNgay", denNgay);
                cmd.Parameters.AddWithValue("@GroupBy", groupBy ?? "date");
            }));
        }

        /// <summary>
        /// Lấy chi tiết từng barcode/cuộn nhập kho theo các filter (PINCC, PO, ItemCode, MauVT, WidthSize, TenKH).
        /// Không cache vì mỗi lần gọi có filter khác nhau.
        /// </summary>
        public static DataTable GetNhapBarcodeDetail(
            DateTime tuNgay, DateTime denNgay,
            string pincc, string po, string itemCode,
            string mauVT, string widthSize, string tenKH)
        {
            return ExecuteSPDirect("GetNhapBarcodeDetail", cmd =>
            {
                cmd.Parameters.AddWithValue("@TuNgay", tuNgay);
                cmd.Parameters.AddWithValue("@DenNgay", denNgay);
                cmd.Parameters.AddWithValue("@Loai",    string.IsNullOrEmpty(pincc)     ? "all" : pincc);
                cmd.Parameters.AddWithValue("@MaHang",  string.IsNullOrEmpty(po)        ? "all" : po);
                cmd.Parameters.AddWithValue("@Itemcode", string.IsNullOrEmpty(itemCode) ? ""    : itemCode);
                cmd.Parameters.AddWithValue("@SoLoID",  string.IsNullOrEmpty(mauVT)    ? "all" : mauVT);
                cmd.Parameters.AddWithValue("@MaNPL",   string.IsNullOrEmpty(widthSize) ? "all" : widthSize);
                cmd.Parameters.AddWithValue("@MaKH",    string.IsNullOrEmpty(tenKH)    ? "all" : tenKH);
            });
        }

        /// <summary>
        /// Lấy chi tiết từng barcode/cuộn trả hàng NCC theo SoLoID và MaNPL.
        /// </summary>
        public static DataTable GetTraHangNCCBarcodeDetail(string soLoID = "", string maNPL = "")
        {
            return ExecuteSPDirect("GetTraHangNCCBarcodeDetail", cmd =>
            {
                cmd.Parameters.AddWithValue("@SoLoID", string.IsNullOrEmpty(soLoID) ? "all" : soLoID);
                cmd.Parameters.AddWithValue("@MaNPL", string.IsNullOrEmpty(maNPL) ? "all" : maNPL);
            });
        }

        public static DataTable GetTongXuatChiTiet(DateTime tuNgay, DateTime denNgay, string groupBy)
        {
            string cacheKey = string.Format("dk_TongXuatChiTiet_{0}_{1}_{2}", tuNgay.ToString("yyyyMMdd"), denNgay.ToString("yyyyMMdd"), groupBy ?? "all");
            return GetOrCache(cacheKey, () => ExecuteSP("GetTongXuatChiTiet", cmd => {
                cmd.Parameters.AddWithValue("@TuNgay", tuNgay);
                cmd.Parameters.AddWithValue("@DenNgay", denNgay);
                cmd.Parameters.AddWithValue("@GroupBy", groupBy ?? "all");
            }));
        }

        public static DataTable GetTonKhoChiTiet(DateTime denNgay, string loai)
        {
            string cacheKey = string.Format("dk_TonKhoChiTiet_{0}_{1}", denNgay.ToString("yyyyMMdd"), loai ?? "all");
            return GetOrCache(cacheKey, () => ExecuteSP("GetTonKhoChiTiet", cmd => {
                cmd.Parameters.AddWithValue("@DenNgay", denNgay);
                cmd.Parameters.AddWithValue("@Loai", loai ?? "all");
            }));
        }

        public static DataTable GetTonKhoChiTietRollDetail(string maNPL)
        {
            return ExecuteSP("GetTonKhoChiTietRollDetail", cmd => {
                cmd.Parameters.AddWithValue("@Loai", maNPL ?? "");
            });
        }

        public static DataTable GetChuanBiVe(DateTime? tuNgay = null, DateTime? denNgay = null, string itemcode = null)
        {
            var tuDate = tuNgay ?? new DateTime(2000, 1, 1);
            var denDate = denNgay ?? new DateTime(2099, 12, 31);
            string cacheKey = string.Format("dk_ChuanBiVe_{0}_{1}_{2}", tuDate.ToString("yyyyMMdd"), denDate.ToString("yyyyMMdd"), itemcode ?? "");
            return GetOrCache(cacheKey, () => {
                try
                {
                    var dtSp = ExecuteSP("GetChuanBiVe", cmd => {
                        cmd.Parameters.AddWithValue("@TuNgay", tuDate);
                        cmd.Parameters.AddWithValue("@DenNgay", denDate);
                        if (!string.IsNullOrEmpty(itemcode)) cmd.Parameters.AddWithValue("@Itemcode", itemcode);
                    });
                    if (dtSp != null) return dtSp;
                }
                catch { }

                try
                {
                    var model = new NtbSoft.ERP.Model.Kho.ERPNhapKhoNPLPOMUAModel();
                    var dt = model.Get("GETTONGPOMUA_PO", "ALL", "ALL", "ALL", "", "", "", "", "", "", "");
                    if (dt != null && !dt.Columns.Contains("PO") && dt.Columns.Contains("POMua"))
                    {
                        dt.Columns.Add("PO", typeof(string), "POMua");
                    }
                    return dt ?? new DataTable();
                }
                catch
                {
                    return new DataTable();
                }
            });
        }

        public static DataTable GetChuanBiVeChiTiet(string poMua)
        {
            string cacheKey = string.Format("dk_ChuanBiVeChiTiet_{0}", poMua ?? "");
            return GetOrCache(cacheKey, () => {
                try
                {
                    var dtSp = ExecuteSP("GetChuanBiVeChiTiet", cmd => {
                        cmd.Parameters.AddWithValue("@Itemcode", poMua ?? "");
                    });
                    if (dtSp != null) return dtSp;
                }
                catch { }
                return new DataTable();
            });
        }

        public static DataTable GetChuanBiXuat(DateTime? tuNgay = null, DateTime? denNgay = null, string itemcode = null)
        {
            string cacheKey = string.Format("dk_ChuanBiXuat_{0}_{1}_{2}", tuNgay.HasValue ? tuNgay.Value.ToString("yyyyMMdd") : "", denNgay.HasValue ? denNgay.Value.ToString("yyyyMMdd") : "", itemcode ?? "");
            return GetOrCache(cacheKey, () => ExecuteSP("GetChuanBiXuat", cmd => {
                if (tuNgay.HasValue) cmd.Parameters.AddWithValue("@TuNgay", tuNgay.Value);
                if (denNgay.HasValue) cmd.Parameters.AddWithValue("@DenNgay", denNgay.Value);
                if (!string.IsNullOrEmpty(itemcode)) cmd.Parameters.AddWithValue("@Itemcode", itemcode);
            }));
        }

        public static DataTable GetDangXuat(DateTime? tuNgay = null, DateTime? denNgay = null, string itemcode = null)
        {
            string cacheKey = string.Format("dk_DangXuat_{0}_{1}_{2}", tuNgay.HasValue ? tuNgay.Value.ToString("yyyyMMdd") : "", denNgay.HasValue ? denNgay.Value.ToString("yyyyMMdd") : "", itemcode ?? "");
            return GetOrCache(cacheKey, () => ExecuteSP("GetDangXuat", cmd => {
                if (tuNgay.HasValue) cmd.Parameters.AddWithValue("@TuNgay", tuNgay.Value);
                if (denNgay.HasValue) cmd.Parameters.AddWithValue("@DenNgay", denNgay.Value);
                if (!string.IsNullOrEmpty(itemcode)) cmd.Parameters.AddWithValue("@Itemcode", itemcode);
            }));
        }

        public static DataTable GetNPLThieuChiTiet()
        {
            return GetOrCache("dk_NPLThieuChiTiet", () => ExecuteSPDirect("GetNPLThieuChiTiet"));
        }

        public static DataTable GetKiemKeLechChiTiet()
        {
            return GetOrCache("dk_KiemKeLechChiTiet", () => ExecuteSPDirect("GetKiemKeLechChiTiet"));
        }

        public static DataTable GetQCQuaLauChiTiet()
        {
            return GetOrCache("dk_QCQuaLauChiTiet", () => ExecuteSPDirect("GetQCQuaLauChiTiet"));
        }

        public static DataTable GetTonVuotDinhMucChiTiet()
        {
            return GetOrCache("dk_TonVuotDinhMucChiTiet", () => ExecuteSPDirect("GetTonVuotDinhMucChiTiet"));
        }

        public static DataTable GetPODangTreChiTiet(string groupBy)
        {
            string cacheKey = "dk_PODangTreChiTiet_" + (groupBy ?? "all").ToLowerInvariant();
            return GetOrCache(cacheKey, () => {
                var gb = (groupBy ?? "all").ToLowerInvariant();
                DataTable dtRaw = ExecuteSP("GetPOVeKho");

                DataTable dt = new DataTable();
                dt.Columns.Add("STT", typeof(int));
                dt.Columns.Add("POMua", typeof(string));
                dt.Columns.Add("MaHang", typeof(string));
                dt.Columns.Add("NCC", typeof(string));
                dt.Columns.Add("NgayNKDuKien", typeof(DateTime));
                dt.Columns.Add("NgayVeThucTe", typeof(DateTime));
                dt.Columns.Add("SoGioTre", typeof(int));
                dt.Columns.Add("SoVT", typeof(int));
                dt.Columns.Add("SL", typeof(decimal));
                dt.Columns.Add("TrangThai", typeof(string));
                dt.Columns.Add("MaTT", typeof(string));
                dt.Columns.Add("SoLo", typeof(string));

                int stt = 1;
                bool hasMaTT = dtRaw.Columns.Contains("MaTT");
                bool hasSoVT = dtRaw.Columns.Contains("SoVT");
                bool hasSL = dtRaw.Columns.Contains("SL");
                bool hasNgayNKDuKien = dtRaw.Columns.Contains("NgayNKDuKien");
                bool hasSoLo = dtRaw.Columns.Contains("SoLo");
                bool hasMaNPL = dtRaw.Columns.Contains("MaNPL");
                foreach (DataRow row in dtRaw.Rows)
                {
                    string poMua = row["POMua"] != DBNull.Value ? row["POMua"].ToString() : "";
                    string ncc = row["TenKH"] != DBNull.Value ? row["TenKH"].ToString() : "";
                    DateTime? ngayVeThucTe = row["NgayMoKien"] != DBNull.Value ? (DateTime?)row["NgayMoKien"] : null;
                    int? soGioTre = row["SoGioTre"] != DBNull.Value ? (int?)Convert.ToInt32(row["SoGioTre"]) : null;
                    string trangThai = row["TrangThai"] != DBNull.Value ? row["TrangThai"].ToString() : "";
                    string maTT = hasMaTT && row["MaTT"] != DBNull.Value ? row["MaTT"].ToString() : "";
                    int? soVT = hasSoVT && row["SoVT"] != DBNull.Value ? (int?)Convert.ToInt32(row["SoVT"]) : null;
                    decimal? sl = hasSL && row["SL"] != DBNull.Value ? (decimal?)Convert.ToDecimal(row["SL"]) : null;
                    DateTime? ngayNKDuKien = hasNgayNKDuKien && row["NgayNKDuKien"] != DBNull.Value ? (DateTime?)row["NgayNKDuKien"] : null;
                    string soLo = hasSoLo && row["SoLo"] != DBNull.Value ? row["SoLo"].ToString() : "";
                    string maHang = hasMaNPL && row["MaNPL"] != DBNull.Value ? row["MaNPL"].ToString() : soLo;

                    if (gb == "all" || gb == maTT)
                    {
                        dt.Rows.Add(stt++, poMua, maHang, ncc,
                            ngayNKDuKien.HasValue ? (object)ngayNKDuKien.Value : DBNull.Value,
                            ngayVeThucTe.HasValue ? (object)ngayVeThucTe.Value : DBNull.Value,
                            soGioTre.HasValue ? (object)soGioTre.Value : DBNull.Value,
                            soVT.HasValue ? (object)soVT.Value : DBNull.Value,
                            sl.HasValue ? (object)sl.Value : DBNull.Value,
                            trangThai, maTT, soLo);
                    }
                }
                return dt;
            });
        }

        public static DataTable ExecuteXKTongQuanSP(string action, params string[] paras)
        {
            string cacheKey = "dk_xktq_" + action;
            if (paras != null)
            {
                for (int i = 0; i < paras.Length; i++)
                {
                    cacheKey += $"_{i}={paras[i]}";
                }
            }
            return GetOrCache(cacheKey, () =>
            {
                using (SqlConnection conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
                using (SqlCommand cmd = new SqlCommand("dbo.SP_ERP_ChiTietXKTongQuan", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 300;
                    cmd.Parameters.Add("@Action", SqlDbType.VarChar, 200).Value = action;
                    for (int i = 1; i <= 10; i++)
                    {
                        string val = (paras != null && paras.Length >= i) ? paras[i - 1] : "";
                        cmd.Parameters.Add($"@para{(i == 1 ? "" : i.ToString())}", SqlDbType.NVarChar, -1).Value = val ?? "";
                    }
                    using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adt.Fill(dt);
                        return dt;
                    }
                }
            });
        }

        public static DataTable GetVatTuTongQuan()
        {
            return ExecuteXKTongQuanSP("GETVATTU");
        }

        public static DataTable GetChiTietXKTongQuan(DateTime tuNgay, DateTime denNgay, string maNPL, string soLoID, string maHang, string maKH, string isLoi, string maNhom)
        {
            return ExecuteXKTongQuanSP("GETTONG", 
                tuNgay.ToString("yyyy-MM-dd"), 
                denNgay.ToString("yyyy-MM-dd"), 
                maNPL ?? "all", 
                soLoID ?? "all", 
                maHang ?? "all", 
                maKH ?? "all", 
                isLoi ?? "0", 
                maNhom ?? "all");
        }
    }


    public class LichPhanCong_MonthStatsModel
    {
        public int TongTask { get; set; }
        public int HoanThanh { get; set; }
        public int DangThucHien { get; set; }
        public int ChoThucHien { get; set; }
        public int ChuaHoanThanh { get; set; }
        public int SoNguoiThucHien { get; set; }
        public double PhanTramHoanThanh { get; set; }
    }


    public class LichPhanCong_CalendarItemModel
    {
        public string NgayLam { get; set; } 
        public string MaLenhSX { get; set; }
        public int TrangThai { get; set; }   
        public string TenNV { get; set; }
        public string MaNV { get; set; }
        public string MaKhachHang { get; set; }
        public string MaHang { get; set; }
        public bool CoCanhBao { get; set; }
        public bool ThieuNPL { get; set; }
        public string GhiChu { get; set; }
    }


    public class LichPhanCong_CalendarDayModel
    {
        public string NgayLam { get; set; }
        public System.Collections.Generic.List<string> Workers { get; set; } = new System.Collections.Generic.List<string>();
        public System.Collections.Generic.List<LichPhanCong_TaskBadgeModel> Tasks { get; set; } = new System.Collections.Generic.List<LichPhanCong_TaskBadgeModel>();
        public bool HasAlert { get; set; }
        public bool ThieuNPL { get; set; }
    }

    public class LichPhanCong_TaskBadgeModel
    {
        public string MaLenhSX { get; set; }
        public int TrangThai { get; set; }
        public string TenNV { get; set; }
        public string MaHang { get; set; }      
        public string MaKhachHang { get; set; }  
        public string GhiChu { get; set; }
    }

    public class LichPhanCong_DayDetailModel
    {
        public string NgayLam { get; set; }
        public System.Collections.Generic.List<LichPhanCong_AssignmentModel> Assignments { get; set; } = new System.Collections.Generic.List<LichPhanCong_AssignmentModel>();
        public System.Collections.Generic.List<LichPhanCong_PickOrderModel> PickOrders { get; set; } = new System.Collections.Generic.List<LichPhanCong_PickOrderModel>();
    }

    public class LichPhanCong_AssignmentModel
    {
        public string MaLenhSX { get; set; }
        public int TrangThai { get; set; }
        public string TenNV { get; set; }
        public string MaNV { get; set; }
        public string MaKhachHang { get; set; }
        public string MaHang { get; set; }
        public string NgayThucHien { get; set; }
        public string GioThucHien { get; set; }
        public string MoTaCongViec { get; set; }
        public bool ThieuNPL { get; set; }
        public string GhiChu { get; set; }
    }

    public class LichPhanCong_PickOrderModel
    {
        public string MaLenhSX { get; set; }
        public int TrangThai { get; set; }
        public string TenNV { get; set; }
        public string MaNV { get; set; }
        public string MaKhachHang { get; set; }
        public string MaHang { get; set; }
        public string NgaySoan { get; set; }
        public string GioSoan { get; set; }
        public int SoLoaiPL { get; set; }
        public double TongSLCanSoan { get; set; }
        public double SLSoan { get; set; }
        public double SoPLThieu { get; set; }
        public string GhiChu { get; set; }

        public System.Collections.Generic.List<LichPhanCong_PickItemModel> Items { get; set; } = new System.Collections.Generic.List<LichPhanCong_PickItemModel>();
    }

    public class LichPhanCong_PickItemModel
    {
        public int ID { get; set; }
        public string MaLenhSX { get; set; }
        public string MaNPL { get; set; }
        public string TenNPL { get; set; }
        public double SLCanSoan { get; set; }
        public double SLTonKho { get; set; }
        public double SLDaSoan { get; set; }
        public string DonVi { get; set; }
        public string MaViTri { get; set; }
        public bool ThieuHang { get; set; }
        public string GhiChu { get; set; }
    }

    public class LichPhanCong_NhanVienModel
    {
        public string MaNV { get; set; }
        public string TenNV { get; set; }
        public string MaPhongBan { get; set; }
        public string TenPhongBan { get; set; }
        public bool IsActive { get; set; }
    }


    public class LichPhanCong_SavePhanCongRequest
    {
        public string MaLenhSX { get; set; }
        public string MaNV { get; set; }
        public System.DateTime NgayThucHien { get; set; }
        public string GhiChu { get; set; }
    }

    public class LichPhanCong_UpdateTrangThaiRequest
    {
        public string MaLenhSX { get; set; }
        public int TrangThai { get; set; }
    }

    public class LichPhanCong_SaveResult
    {
        public bool Success { get; set; }
        public string Error { get; set; }
        public string MaLenhSX { get; set; }
    }
}


