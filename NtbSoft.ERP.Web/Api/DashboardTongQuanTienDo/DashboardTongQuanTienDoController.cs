using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web.Http;
using DashboardTongQuanTienDo.Models;

namespace DashboardTongQuanTienDo.Controllers
{
    // Giữ nguyên route prefix KHÔNG có "api/" để URL gọi từ frontend hiện tại
    // (/DashboardTongQuanTienDo/GetDashboardStats...) không phải đổi.
    // Yêu cầu: WebApiConfig.Register phải có config.MapHttpAttributeRoutes();
    [RoutePrefix("DashboardTongQuanTienDo")]
    public class DashboardTongQuanTienDoController : ApiController
    {
        private readonly DashboardTongQuanTienDoModel _model = new DashboardTongQuanTienDoModel();

        #region Helper đọc DataRow (thay cho việc EF SqlQuery<T> tự map trước đây)

        private static string S(DataRow r, string col) { return r[col] == DBNull.Value ? null : r[col].ToString(); }
        private static int I(DataRow r, string col) { return r[col] == DBNull.Value ? 0 : Convert.ToInt32(r[col]); }
        private static int? IN(DataRow r, string col) { return r[col] == DBNull.Value ? (int?)null : Convert.ToInt32(r[col]); }
        private static double D(DataRow r, string col) { return r[col] == DBNull.Value ? 0 : Convert.ToDouble(r[col]); }
        private static double? DN(DataRow r, string col) { return r[col] == DBNull.Value ? (double?)null : Convert.ToDouble(r[col]); }
        private static decimal M(DataRow r, string col) { return r[col] == DBNull.Value ? 0 : Convert.ToDecimal(r[col]); }
        private static decimal? MN(DataRow r, string col) { return r[col] == DBNull.Value ? (decimal?)null : Convert.ToDecimal(r[col]); }
        private static DateTime? DT(DataRow r, string col) { return r[col] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(r[col]); }
        private static bool? BN(DataRow r, string col) { return r[col] == DBNull.Value ? (bool?)null : Convert.ToBoolean(r[col]); }

        #endregion

        #region Helper parse khoảng ngày (trích xuất từ 12 chỗ lặp lại giống hệt nhau trong code gốc)

        private static void ParseDateRange(string startDate, string endDate,
            out string formattedStart, out string formattedEnd,
            out DateTime parsedStart, out DateTime parsedEnd)
        {
            if (!DateTime.TryParseExact(startDate, "dd/MM/yyyy", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out parsedStart))
            {
                if (!DateTime.TryParse(startDate, out parsedStart))
                {
                    parsedStart = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                }
            }
            formattedStart = parsedStart.ToString("yyyy-MM-dd");

            if (!DateTime.TryParseExact(endDate, "dd/MM/yyyy", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out parsedEnd))
            {
                if (!DateTime.TryParse(endDate, out parsedEnd))
                {
                    parsedEnd = parsedStart.AddMonths(1).AddDays(-1);
                }
            }
            formattedEnd = parsedEnd.ToString("yyyy-MM-dd");
        }

        #endregion

        // =====================================================================
        [HttpGet]
        [Route("GetDashboardStats")]
        public IHttpActionResult GetDashboardStats(string startDate, string endDate)
        {
            try
            {
                string formattedStart, formattedEnd;
                DateTime parsedStart, parsedEnd;
                ParseDateRange(startDate, endDate, out formattedStart, out formattedEnd, out parsedStart, out parsedEnd);

                int totalOrders = TongSLDonHang(formattedStart, formattedEnd);
                int prodOrders = TongSLSanXuat(formattedStart, formattedEnd);
                var customerRevenue = GetTopCustomerRevenues(formattedStart, formattedEnd);

                decimal currentRevenue = GetTotalRevenueByMonthRange(formattedStart, formattedEnd);
                decimal targetRevenue = GetTargetTotalRevenueByMonthRange(formattedStart, formattedEnd);

                DateTime prevStart = parsedStart.AddMonths(-1);
                DateTime prevEnd = parsedEnd.AddMonths(-1);
                string formattedPrevStart = prevStart.ToString("yyyy-MM-dd");
                string formattedPrevEnd = prevEnd.ToString("yyyy-MM-dd");

                decimal prevRevenue = GetTotalRevenueByMonthRange(formattedPrevStart, formattedPrevEnd);

                double growth = 0;
                if (prevRevenue > 0)
                {
                    growth = (double)((currentRevenue - prevRevenue) / prevRevenue * 100);
                }

                long totalPcs = 0;
                long prodPcs = 0;
                long deliveredPcs = 0;
                long delayedPcs = 0;
                try
                {
                    DataTable tblGantt = _model.GetProductionQuantityReport(formattedStart, formattedEnd);
                    if (tblGantt != null && tblGantt.Rows.Count > 0)
                    {
                        foreach (DataRow r in tblGantt.Rows)
                        {
                            long slkh = r["SLKH"] != DBNull.Value ? Convert.ToInt64(r["SLKH"]) : 0;
                            long slth = r["SLTH"] != DBNull.Value ? Convert.ToInt64(r["SLTH"]) : 0;
                            DateTime? ngayKetThuc = DT(r, "NgayKetThuc");

                            totalPcs += slkh;
                            if (slth >= slkh && slkh > 0)
                            {
                                deliveredPcs += slkh;
                            }
                            else
                            {
                                prodPcs += slkh;
                                if (ngayKetThuc.HasValue && ngayKetThuc.Value < DateTime.Today)
                                {
                                    delayedPcs += (slkh - slth > 0 ? slkh - slth : slkh);
                                }
                            }
                        }
                    }
                }
                catch { }

                if (totalPcs == 0 && totalOrders > 0)
                {
                    totalPcs = (long)totalOrders * 5000;
                    prodPcs = (long)prodOrders * 5000;
                    deliveredPcs = (long)Math.Max(0, totalOrders - prodOrders) * 5000;
                    delayedPcs = 25000;
                }

                return Json(new
                {
                    success = true,
                    totalOrders = totalOrders,
                    prodOrders = prodOrders,
                    totalPcs = totalPcs,
                    prodPcs = prodPcs,
                    deliveredPcs = deliveredPcs,
                    delayedPcs = delayedPcs,
                    customerRevenue = customerRevenue,
                    currentRevenue = currentRevenue,
                    targetRevenue = targetRevenue,
                    prevRevenue = prevRevenue,
                    revenueGrowth = growth
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        private decimal GetTotalRevenueByMonthRange(string startDate, string endDate)
        {
            try
            {
                DataTable tbl = _model.GetBaoCaoDoanhThu("ACTUAL_TOTAL", startDate, endDate);
                return tbl.AsEnumerable().Sum(r => MN(r, "TongDoanhThuThucTe") ?? 0);
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi truy vấn tổng doanh thu: " + ex.Message);
            }
        }

        private decimal GetTargetTotalRevenueByMonthRange(string startDate, string endDate)
        {
            try
            {
                DataTable tbl = _model.GetBaoCaoDoanhThu("TARGET_MONTHLY", startDate, endDate);
                decimal total = tbl.AsEnumerable().Sum(r => MN(r, "TongDoanhThuThucTe") ?? 0);
                return total > 0 ? total : 0;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi truy vấn tổng doanh thu kế hoạch: " + ex.Message);
            }
        }

        private int TongSLDonHang(string startDate, string endDate)
        {
            try
            {
                return _model.GetBaoCaoDonHangVaSanXuat_Scalar("TONG_DON_HANG", startDate, endDate);
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi truy vấn tổng đơn hàng: " + ex.Message);
            }
        }

        private int TongSLSanXuat(string startDate, string endDate)
        {
            try
            {
                return _model.GetBaoCaoDonHangVaSanXuat_Scalar("DANG_SAN_XUAT", startDate, endDate);
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi truy vấn số lượng đơn hàng đang sản xuất: " + ex.Message);
            }
        }

        private List<object> GetTopCustomerRevenues(string startDate, string endDate)
        {
            try
            {
                DataTable tbl = _model.GetBaoCaoDoanhThu("TOP_CUSTOMERS", startDate, endDate);
                var rawResults = tbl.AsEnumerable()
                    .Select(r => new { KhachHang = S(r, "KhachHang"), TongDoanhThuThucTe = MN(r, "TongDoanhThuThucTe") })
                    .ToList();

                if (rawResults == null || !rawResults.Any())
                {
                    return new List<object>();
                }

                var sortedResults = rawResults
                    .Where(r => !string.IsNullOrEmpty(r.KhachHang))
                    .OrderByDescending(r => r.TongDoanhThuThucTe ?? 0)
                    .ToList();

                if (!sortedResults.Any())
                {
                    return new List<object>();
                }

                decimal totalRevenue = sortedResults.Sum(r => r.TongDoanhThuThucTe ?? 0);
                if (totalRevenue == 0)
                {
                    totalRevenue = 1;
                }

                var top5 = sortedResults.Take(5).ToList();
                var others = sortedResults.Skip(5).ToList();
                decimal othersRevenue = others.Sum(r => r.TongDoanhThuThucTe ?? 0);

                var resultList = new List<object>();

                for (int i = 0; i < top5.Count; i++)
                {
                    var customer = top5[i];
                    decimal val = customer.TongDoanhThuThucTe ?? 0;
                    double pctValue = (double)(val / totalRevenue * 100);
                    resultList.Add(new
                    {
                        name = customer.KhachHang,
                        value = Math.Round(val, 2),
                        pct = pctValue.ToString("0.#") + "%"
                    });
                }

                if (others.Any())
                {
                    double othersPctValue = (double)(othersRevenue / totalRevenue * 100);
                    resultList.Add(new
                    {
                        name = "Khác",
                        value = Math.Round(othersRevenue, 2),
                        pct = othersPctValue.ToString("0.#") + "%"
                    });
                }

                return resultList;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi truy vấn doanh thu khách hàng: " + ex.Message);
            }
        }

        // =====================================================================
        [HttpGet]
        [Route("GetMonthlyRevenue")]
        public IHttpActionResult GetMonthlyRevenue(string startDate, string endDate)
        {
            try
            {
                string formattedStart, formattedEnd;
                DateTime parsedStart, parsedEnd;

                if (!string.IsNullOrEmpty(startDate))
                {
                    ParseDateRange(startDate, endDate, out formattedStart, out formattedEnd, out parsedStart, out parsedEnd);
                }
                else
                {
                    if (!DateTime.TryParseExact(endDate, "dd/MM/yyyy", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out parsedEnd))
                    {
                        if (!DateTime.TryParse(endDate, out parsedEnd))
                        {
                            parsedEnd = DateTime.Now;
                        }
                    }

                    DateTime rangeEndDate = new DateTime(parsedEnd.Year, parsedEnd.Month, DateTime.DaysInMonth(parsedEnd.Year, parsedEnd.Month));
                    DateTime rangeStartDate = parsedEnd.AddMonths(-4);
                    rangeStartDate = new DateTime(rangeStartDate.Year, rangeStartDate.Month, 1);

                    formattedStart = rangeStartDate.ToString("yyyy-MM-dd");
                    formattedEnd = rangeEndDate.ToString("yyyy-MM-dd");
                    parsedStart = rangeStartDate;
                    parsedEnd = rangeEndDate;
                }

                DataTable tblActual = _model.GetBaoCaoDoanhThu("ACTUAL_MONTHLY", formattedStart, formattedEnd);
                var rawResults = tblActual.AsEnumerable()
                    .Select(r => new { Thang = I(r, "Thang"), TongDoanhThuThucTe = MN(r, "TongDoanhThuThucTe") })
                    .ToList();

                DataTable tblTarget = _model.GetBaoCaoDoanhThu("TARGET_MONTHLY", formattedStart, formattedEnd);
                var targetRawResults = tblTarget.AsEnumerable()
                    .Select(r => new { Thang = I(r, "Thang"), TongDoanhThuThucTe = MN(r, "TongDoanhThuThucTe") })
                    .ToList();

                var months = new List<string>();
                var revenues = new List<decimal>();
                var plans = new List<decimal>();

                int monthCount = ((parsedEnd.Year - parsedStart.Year) * 12) + parsedEnd.Month - parsedStart.Month + 1;
                if (monthCount <= 0 || monthCount > 24) monthCount = 5;

                for (int i = 0; i < monthCount; i++)
                {
                    DateTime monthDate = parsedStart.AddMonths(i);
                    string label = monthDate.ToString("MM/yyyy");
                    months.Add(label);

                    var dbMatch = rawResults.FirstOrDefault(r => r.Thang == monthDate.Month);
                    decimal revVal = 0;
                    if (dbMatch != null)
                    {
                        revVal = dbMatch.TongDoanhThuThucTe ?? 0;
                    }
                    revenues.Add(Math.Round(revVal, 2));

                    var targetMatch = targetRawResults.FirstOrDefault(r => r.Thang == monthDate.Month);
                    decimal planVal = 0;
                    if (targetMatch != null)
                    {
                        planVal = targetMatch.TongDoanhThuThucTe ?? 0;
                    }
                    plans.Add(Math.Round(planVal, 2));
                }

                return Json(new { success = true, months = months, revenue = revenues, plan = plans });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // =====================================================================
        [HttpGet]
        [Route("GetMonthlyLineRevenue")]
        public IHttpActionResult GetMonthlyLineRevenue(string month)
        {
            try
            {
                DateTime parsedMonth;
                if (!DateTime.TryParseExact(month, "MM/yyyy", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out parsedMonth))
                {
                    if (!DateTime.TryParse(month, out parsedMonth))
                    {
                        parsedMonth = DateTime.Now;
                    }
                }

                DateTime startDate = new DateTime(parsedMonth.Year, parsedMonth.Month, 1);
                DateTime endDate = new DateTime(parsedMonth.Year, parsedMonth.Month, DateTime.DaysInMonth(parsedMonth.Year, parsedMonth.Month));

                string formattedStart = startDate.ToString("yyyy-MM-dd");
                string formattedEnd = endDate.ToString("yyyy-MM-dd");

                DataTable tblActual = _model.GetBaoCaoDoanhThu("ACTUAL_TOTAL", formattedStart, formattedEnd);
                var rawActual = tblActual.AsEnumerable()
                    .Select(r => new { Chuyen = S(r, "Chuyen"), TongDoanhThuThucTe = MN(r, "TongDoanhThuThucTe") })
                    .ToList();

                DataTable tblPlan = _model.GetBaoCaoDoanhThu("TARGET_TOTAL", formattedStart, formattedEnd);
                var rawPlan = tblPlan.AsEnumerable()
                    .Select(r => new { Chuyen = S(r, "Chuyen"), TongDoanhThuThucTe = MN(r, "TongDoanhThuThucTe") })
                    .ToList();

                var allLines = rawActual.Select(r => r.Chuyen).Union(rawPlan.Select(r => r.Chuyen)).Distinct().ToList();

                var data = allLines.Select(lineName => new
                {
                    LineName = lineName,
                    LineRevenue = rawActual.Where(r => r.Chuyen == lineName).Sum(r => r.TongDoanhThuThucTe ?? 0),
                    LinePlanRevenue = rawPlan.Where(r => r.Chuyen == lineName).Sum(r => r.TongDoanhThuThucTe ?? 0)
                }).ToList();

                return Json(new { success = true, data = data });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // =====================================================================
        [HttpGet]
        [Route("GetGanttData")]
        public IHttpActionResult GetGanttData(string startDate, string endDate)
        {
            try
            {
                string formattedStart, formattedEnd;
                DateTime parsedStart, parsedEnd;
                ParseDateRange(startDate, endDate, out formattedStart, out formattedEnd, out parsedStart, out parsedEnd);

                DataTable tbl = _model.GetProductionQuantityReport(formattedStart, formattedEnd);
                var rawResults = tbl.AsEnumerable().Select(r => new
                {
                    KhachHang = S(r, "KhachHang"),
                    SLTH = IN(r, "SLTH"),
                    SLKH = IN(r, "SLKH"),
                    POID = S(r, "POID"),
                    NgayBatDau = DT(r, "NgayBatDau"),
                    NgayKetThuc = DT(r, "NgayKetThuc"),
                    MaDH = S(r, "MaDH"),
                    PO = S(r, "PO")
                }).ToList();

                rawResults = rawResults.Where(r => r.NgayBatDau <= r.NgayKetThuc).ToList();

                var formattedData = rawResults.Select(r =>
                {
                    double slth = (double)(r.SLTH ?? 0);
                    double slkh = (double)(r.SLKH ?? 0);
                    double progress = 0;
                    if (slkh > 0)
                    {
                        progress = Math.Round((slth / slkh) * 100);
                        if (progress > 100) progress = 100;
                    }

                    string status = "slow";
                    if (progress >= 95) status = "complete";
                    else if (progress >= 80) status = "passed";
                    else if (progress >= 50) status = "average";

                    return new
                    {
                        poId = r.POID,
                        po = !string.IsNullOrEmpty(r.PO) ? r.PO : r.POID,
                        customer = r.KhachHang ?? "",
                        qty = r.SLKH.HasValue ? r.SLKH.Value.ToString() : "0",
                        orderCode = r.MaDH ?? "",
                        etd = r.NgayKetThuc.HasValue ? r.NgayKetThuc.Value.ToString("dd/MM/yyyy") : null,
                        startDate = r.NgayBatDau.HasValue ? r.NgayBatDau.Value.ToString("yyyy-MM-dd") : null,
                        endDate = r.NgayKetThuc.HasValue ? r.NgayKetThuc.Value.ToString("yyyy-MM-dd") : null,
                        progress = progress,
                        status = status
                    };
                }).ToList();

                return Json(new { success = true, data = formattedData });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // =====================================================================
        [HttpGet]
        [Route("GetWipData")]
        public IHttpActionResult GetWipData(string startDate, string endDate)
        {
            try
            {
                string formattedStart, formattedEnd;
                DateTime parsedStart, parsedEnd;
                ParseDateRange(startDate, endDate, out formattedStart, out formattedEnd, out parsedStart, out parsedEnd);

                double nhanTPQty = _model.GetNhanThanhPhamTotal(formattedStart, formattedEnd);

                // Bước 1: lấy danh sách Mã Lệnh SX trong kỳ (trạng thái = Đang sản xuất -> '1')
                DataTable tblLenhSX = _model.GetTienDoChiTiet("GetLenhSX", formattedStart, formattedEnd, "1", "", "");
                List<string> maLenhList = tblLenhSX.AsEnumerable()
                    .Select(r => S(r, "MaLenh"))
                    .Where(v => !string.IsNullOrEmpty(v))
                    .Select(v => v.Trim())
                    .ToList();

                double sumAmount = 0, sumRaChuyenLK = 0, sumKcsLK = 0, sumFinishedIn = 0, sumDongThungLK = 0, sumAqlLK = 0;

                if (maLenhList.Count > 0)
                {
                    string para3_MaLenhString = string.Join(";", maLenhList);
                    DataTable tblDetail = _model.GetTienDoChiTiet("Get", formattedStart, formattedEnd, para3_MaLenhString, "", "1");

                    HashSet<string> seenMaLenh = new HashSet<string>();
                    foreach (DataRow row in tblDetail.Rows)
                    {
                        string maLenh = S(row, "MaLenh") == null ? "" : S(row, "MaLenh").Trim();
                        double amount = D(row, "Amount");
                        double kcsLK = D(row, "KCS_Dat_LK");
                        double finishedIn = D(row, "FinishedIn");
                        double dongThungLK = D(row, "SLDongThung_LK");

                        sumAmount += amount;
                        sumKcsLK += kcsLK;
                        sumFinishedIn += finishedIn;
                        sumDongThungLK += dongThungLK;

                        if (!seenMaLenh.Contains(maLenh))
                        {
                            seenMaLenh.Add(maLenh);
                            sumRaChuyenLK += D(row, "RaChuyen_LK");
                            sumAqlLK += D(row, "SL_AQL_LK");
                        }
                    }
                }

                double cutQty = GetProductionReportTotal("CUT", formattedStart, formattedEnd);
                double btpQty = GetProductionReportTotal("BTP", formattedStart, formattedEnd);
                double sewQty = GetProductionReportTotal("SEW", formattedStart, formattedEnd);
                double endlineQty = GetProductionReportTotal("ENDLINE", formattedStart, formattedEnd);
                double packQty = GetProductionReportTotal("PACKING", formattedStart, formattedEnd);
                double aqlQty = GetProductionReportTotal("AQL", formattedStart, formattedEnd);
                double shipQty = GetProductionReportTotal("PACKAGE_LIST", formattedStart, formattedEnd);

                decimal pctNpl = 0;
                try
                {
                    // Action TONG_HOP_NHU_CAU_TON_KHO trên DB Viking (giữ đúng như code gốc)
                    DataTable tblNpl = _model.GetBaoCaoNhuCauTonKho_Viking("TONG_HOP_NHU_CAU_TON_KHO", formattedStart, formattedEnd, "", "1900-01-01", "2900-06-30");
                    decimal sumMinNhuCauTonKho = 0;
                    decimal sumTonKho = 0;
                    foreach (DataRow row in tblNpl.Rows)
                    {
                        decimal soLuongNhuCau = M(row, "SoLuongNhuCau");
                        decimal tonKho = M(row, "TonKho");
                        sumMinNhuCauTonKho += Math.Min(soLuongNhuCau, tonKho);
                        sumTonKho += soLuongNhuCau;
                    }
                    pctNpl = sumTonKho > 0 ? (sumMinNhuCauTonKho / sumTonKho * 100) : 100;
                }
                catch (Exception)
                {
                    // Log or ignore (giữ nguyên hành vi gốc)
                }

                // Kỳ trước (lùi 1 tháng) để so sánh xu hướng
                DateTime prevStart = parsedStart.AddMonths(-1);
                DateTime prevEnd = parsedEnd.AddMonths(-1);
                string formattedPrevStart = prevStart.ToString("yyyy-MM-dd");
                string formattedPrevEnd = prevEnd.ToString("yyyy-MM-dd");

                double cutQtyPrev = GetProductionReportTotal("CUT", formattedPrevStart, formattedPrevEnd);
                double shipQtyPrev = GetProductionReportTotal("PACKAGE_LIST", formattedPrevStart, formattedPrevEnd);

                double pctCutKanban = sumAmount > 0 ? (cutQty / sumAmount * 100) : 0;

                int wipCurrent = Math.Max(0, (int)cutQty - (int)shipQty);
                int wipPrev = Math.Max(0, (int)cutQtyPrev - (int)shipQtyPrev);
                string trendCompare = "↑ 0.0%";
                if (wipPrev > 0)
                {
                    double diffPercent = (double)(wipCurrent - wipPrev) / wipPrev * 100;
                    if (diffPercent >= 0)
                        trendCompare = "↑ " + diffPercent.ToString("0.0") + "%";
                    else
                        trendCompare = "↓ " + Math.Abs(diffPercent).ToString("0.0") + "%";
                }

                int maxQty = new[] { (int)cutQty, (int)btpQty, (int)sewQty, (int)endlineQty, (int)nhanTPQty, (int)packQty, (int)aqlQty, (int)shipQty }.Max();
                if (maxQty == 0) maxQty = 1;

                double pctCut = Math.Round((double)cutQty / maxQty * 100);
                double pctBtp = Math.Round((double)btpQty / maxQty * 100);
                double pctSew = Math.Round((double)sewQty / maxQty * 100);
                double pctEndline = Math.Round((double)endlineQty / maxQty * 100);
                double pctNhanTP = Math.Round((double)nhanTPQty / maxQty * 100);
                double pctPack = Math.Round((double)packQty / maxQty * 100);
                double pctAql = Math.Round((double)aqlQty / maxQty * 100);
                double pctShip = Math.Round((double)shipQty / maxQty * 100);

                double avgCompletionVal = Math.Round((pctCut + pctBtp + pctSew + pctEndline + pctNhanTP + pctPack + pctAql + pctShip) / 8);
                string avgCompletion = avgCompletionVal.ToString("0") + "%";

                var stages = new[]
                {
                    new { name = "CUT (Đã cắt)", pcs = (int)cutQty, percentage = (int)pctCut },
                    new { name = "BTP (Chuẩn bị may)", pcs = (int)btpQty, percentage = (int)pctBtp },
                    new { name = "SEW (May)", pcs = (int)sewQty, percentage = (int)pctSew },
                    new { name = "ENDLINE (Hoàn thiện)", pcs = (int)endlineQty, percentage = (int)pctEndline },
                    new { name = "Nhận thành phẩm", pcs = (int)nhanTPQty, percentage = (int)pctNhanTP },
                    new { name = "PACK (Đóng gói)", pcs = (int)packQty, percentage = (int)pctPack },
                    new { name = "AQL (Kiểm hàng)", pcs = (int)aqlQty, percentage = (int)pctAql },
                    new { name = "SHIP (Xuất hàng)", pcs = (int)shipQty, percentage = (int)pctShip }
                };

                string totalPcs = wipCurrent.ToString("#,0") + " pcs";

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        totalPcs = totalPcs,
                        avgCompletion = avgCompletion,
                        trendCompare = trendCompare,
                        stages = stages,
                        totalAmount = sumAmount,
                        totalRaChuyenLK = sumRaChuyenLK,
                        totalKcsLK = sumKcsLK,
                        totalFinishedIn = sumFinishedIn,
                        totalDongThungLK = sumDongThungLK,
                        totalAqlLK = sumAqlLK,
                        pctNpl = pctNpl,
                        pctCut = pctCutKanban
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Tổng số lượng của 1 giai đoạn sản xuất. SP trả về nhiều cột; tuỳ action mà
        /// cột cần cộng có tên khác nhau (giữ đúng bảng ánh xạ như code gốc).
        /// </summary>
        private double GetProductionReportTotal(string action, string startDate, string endDate)
        {
            DataTable tbl = _model.GetProductionReportByAction(action, startDate, endDate);

            string targetColName = "";
            if (action == "CUT") targetColName = "CUT - Thực Hiện";
            else if (action == "BTP") targetColName = "BTP - Thực Hiện";
            else if (action == "SEW") targetColName = "Ra Chuyền - Thực Hiện";
            else if (action == "ENDLINE") targetColName = "KCS - Thực Hiện";
            else if (action == "NHAN_TP") targetColName = "FinishedIn_LK";
            else if (action == "AQL") targetColName = "AQL - Thực Hiện";
            else if (action == "PACKING") targetColName = "Đóng Thùng - Thực Hiện";
            else if (action == "PACKAGE_LIST") targetColName = "SoLuong";

            string matchedCol = null;
            foreach (DataColumn col in tbl.Columns)
            {
                if (col.ColumnName.Equals(targetColName, StringComparison.OrdinalIgnoreCase))
                {
                    matchedCol = col.ColumnName;
                    break;
                }
            }
            if (matchedCol == null && tbl.Columns.Count > 0)
            {
                matchedCol = tbl.Columns[tbl.Columns.Count - 1].ColumnName;
            }

            double total = 0;
            if (matchedCol != null)
            {
                foreach (DataRow row in tbl.Rows)
                {
                    total += D(row, matchedCol);
                }
            }
            return total;
        }

        // =====================================================================
        [HttpGet]
        [Route("GetShipmentStats")]
        public IHttpActionResult GetShipmentStats(string startDate, string endDate)
        {
            try
            {
                string formattedStart, formattedEnd;
                DateTime parsedStart, parsedEnd;
                ParseDateRange(startDate, endDate, out formattedStart, out formattedEnd, out parsedStart, out parsedEnd);

                DataTable tbl = _model.GetBaoCaoDonHangVaSanXuat("TIEN_DO_GIAO_HANG", formattedStart, formattedEnd);
                var results = tbl.AsEnumerable().Select(r => new
                {
                    POID = S(r, "POID"),
                    NgayGH = DT(r, "NgayGH"),
                    ExportDate = DT(r, "ExportDate"),
                    DeliveryStatus = S(r, "DeliveryStatus")
                }).ToList();

                int deliveredOrders = results.Count;
                int lateOrders = results.Count(r => r.DeliveryStatus == "Trễ hẹn (Delayed)");

                double otdRate = 100.0;
                if (deliveredOrders > 0)
                {
                    otdRate = (double)(deliveredOrders - lateOrders) / deliveredOrders * 100;
                }

                return Json(new
                {
                    success = true,
                    deliveredOrders = deliveredOrders,
                    lateOrders = lateOrders,
                    otd = Math.Round(otdRate, 1).ToString("0.#") + "%"
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // =====================================================================
        [HttpGet]
        [Route("GetPODetails")]
        public IHttpActionResult GetPODetails(string poId)
        {
            try
            {
                DataTable tbl = _model.GetPOReportDetails(poId);
                var details = tbl.AsEnumerable().Select(r => new
                {
                    TenMau = S(r, "TenMau"),
                    Size = S(r, "Size"),
                    SLKH = I(r, "SLKH"),
                    SLTH = I(r, "SLTH"),
                    TyLe = DN(r, "TyLe"),
                    MaHang = S(r, "MaHang"),
                    TenKhachHang = S(r, "TenKhachHang"),
                    MaDonHang = S(r, "MaDonHang"),
                    TongKeHoach = I(r, "TongKeHoach"),
                    TongThucHien = I(r, "TongThucHien"),
                    TienDo = DN(r, "TienDo")
                }).ToList();

                return Json(new { success = true, data = details });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // =====================================================================
        [HttpGet]
        [Route("GetWipDetail")]
        public IHttpActionResult GetWipDetail(string stage, string startDate, string endDate)
        {
            try
            {
                string formattedStart, formattedEnd;
                DateTime parsedStart, parsedEnd;
                ParseDateRange(startDate, endDate, out formattedStart, out formattedEnd, out parsedStart, out parsedEnd);

                string action = stage.ToUpper();
                if (action == "PACK") action = "PACKING";
                if (action == "SHIP") action = "PACKAGE_LIST";

                DataTable tbl = _model.GetProductionReportByAction(action, formattedStart, formattedEnd);

                var resultList = new List<Dictionary<string, object>>();
                foreach (DataRow row in tbl.Rows)
                {
                    var dict = new Dictionary<string, object>();
                    foreach (DataColumn col in tbl.Columns)
                    {
                        var val = row[col];
                        dict[col.ColumnName] = val == DBNull.Value ? null : val;
                    }
                    resultList.Add(dict);
                }

                return Json(new { success = true, data = resultList });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // =====================================================================
        [HttpGet]
        [Route("GetWipProgressDetail")]
        public IHttpActionResult GetWipProgressDetail(string startDate, string endDate, string search, int page = 1, int pageSize = 50)
        {
            try
            {
                string formattedStart, formattedEnd;
                DateTime parsedStart, parsedEnd;
                ParseDateRange(startDate, endDate, out formattedStart, out formattedEnd, out parsedStart, out parsedEnd);

                // Bước 1: danh sách Lệnh SX đang sản xuất trong kỳ
                DataTable tblLenhSX = _model.GetTienDoChiTiet("GetLenhSX", formattedStart, formattedEnd, "1", "", "");
                List<string> maLenhList = tblLenhSX.AsEnumerable()
                    .Select(r => S(r, "MaLenh"))
                    .Where(v => !string.IsNullOrEmpty(v))
                    .Select(v => v.Trim())
                    .ToList();

                if (maLenhList.Count == 0)
                {
                    return Json(new { success = true, data = new List<object>(), hasMore = false, totalCount = 0 });
                }

                string para3_MaLenhString = string.Join(";", maLenhList);

                // Bước 2: chi tiết tiến độ
                DataTable tblDetail = _model.GetTienDoChiTiet("Get", formattedStart, formattedEnd, para3_MaLenhString, "", "1");
                var details = tblDetail.AsEnumerable().Select(row => new
                {
                    SPOID = S(row, "SPOID"),
                    ProductID = S(row, "ProductID"),
                    PO = S(row, "PO"),
                    MaLenh = S(row, "MaLenh"),
                    MaGop = S(row, "MaGop"),
                    TenMau = S(row, "TenMau"),
                    MaHang = S(row, "MaHang"),
                    SizeType = S(row, "SizeType"),
                    Size = S(row, "Size"),
                    SeaSon = S(row, "SeaSon"),
                    XapXep = IN(row, "XapXep"),
                    Amount = IN(row, "Amount"),
                    FinishedIn = IN(row, "FinishedIn"),
                    NhanTP_TH = IN(row, "NhanTP_TH"),
                    KCS_Dat_LK = IN(row, "KCS_Dat_LK"),
                    KCS_Dat_TH = IN(row, "KCS_Dat_TH"),
                    RaChuyen_LK = IN(row, "RaChuyen_LK"),
                    RaChuyen_TH = IN(row, "RaChuyen_TH"),
                    SLDongThung_LK = IN(row, "SLDongThung_LK"),
                    SLDongThung_TH = IN(row, "SLDongThung_TH"),
                    StyleID = S(row, "StyleID"),
                    SL_AQL_LK = IN(row, "SL_AQL_LK"),
                    SL_AQL_TH = IN(row, "SL_AQL_TH")
                }).ToList();

                if (!string.IsNullOrEmpty(search))
                {
                    string term = search.ToLower().Trim();
                    details = details.Where(d =>
                        (d.MaLenh != null && d.MaLenh.ToLower().Contains(term)) ||
                        (d.MaHang != null && d.MaHang.ToLower().Contains(term)) ||
                        (d.PO != null && d.PO.ToLower().Contains(term)) ||
                        (d.TenMau != null && d.TenMau.ToLower().Contains(term))
                    ).ToList();
                }

                var paginatedData = details.Skip((page - 1) * pageSize).Take(pageSize).ToList();
                bool hasMore = details.Count > page * pageSize;

                return Json(new { success = true, data = paginatedData, hasMore = hasMore, totalCount = details.Count });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // =====================================================================
        [HttpGet]
        [Route("GetPurchaseTrackingData")]
        public IHttpActionResult GetPurchaseTrackingData(string startDate, string endDate)
        {
            try
            {
                string formattedStart, formattedEnd;
                DateTime parsedStart, parsedEnd;
                ParseDateRange(startDate, endDate, out formattedStart, out formattedEnd, out parsedStart, out parsedEnd);

                // 1. Thống kê số lượng PO theo trạng thái (KPI)
                DataTable tblCount = _model.GetBaoCaoMuaHangNPL("THONG_KE_SO_LUONG", formattedStart, formattedEnd, null, null);
                var countList = tblCount.AsEnumerable().Select(r => new
                {
                    POMua = S(r, "POMua"),
                    TrangThai = S(r, "TrangThai")
                }).ToList();

                int totalArrived = countList.Count(x => x.TrangThai == "Đã về");
                int totalIncoming = countList.Count(x => x.TrangThai == "Sắp về");
                int totalFail = countList.Count(x => x.TrangThai == "Về trễ");
                int totalOrdered = totalArrived + totalIncoming + totalFail;

                // 2. Chi tiết số lượng vật tư cho biểu đồ
                DataTable tblDetails = _model.GetBaoCaoMuaHangNPL("TONG_HOP_TRANG_THAI", formattedStart, formattedEnd, null, null);
                var purchaseList = tblDetails.AsEnumerable().Select(r => new
                {
                    TrangThai = S(r, "TrangThai"),
                    POMua = S(r, "POMua"),
                    MaCLVT = S(r, "MaCLVT"),
                    ChungLoaiVatTu = S(r, "ChungLoaiVatTu"),
                    VietTat = S(r, "VietTat"),
                    SL = D(r, "SL"),
                    IsNPL = BN(r, "IsNPL"),
                    Sort = IN(r, "Sort")
                }).ToList();

                var sortedItems = purchaseList
                    .GroupBy(r => r.MaCLVT ?? "")
                    .Select(g =>
                    {
                        var first = g.First();
                        var itemCode = g.Select(x => x.ChungLoaiVatTu).FirstOrDefault(v => !string.IsNullOrEmpty(v)) ?? first.ChungLoaiVatTu;
                        var vietTat = g.Select(x => x.VietTat).FirstOrDefault(v => !string.IsNullOrEmpty(v)) ?? first.VietTat;

                        double poOrderedVal = g.Where(x => x.TrangThai == "Đã đặt").Sum(x => x.SL);
                        double poArrivedVal = g.Where(x => x.TrangThai == "Đã về").Sum(x => x.SL);
                        double poIncomingVal = g.Where(x => x.TrangThai == "Sắp về").Sum(x => x.SL);
                        double poFailVal = g.Where(x => x.TrangThai == "Về trễ").Sum(x => x.SL);

                        return new
                        {
                            MaCLVT = g.Key,
                            ItemCode = itemCode,
                            VietTat = vietTat,
                            IsNPL = first.IsNPL,
                            Sort = first.Sort,
                            PoOrdered = poOrderedVal,
                            PoArrived = poArrivedVal,
                            PoIncoming = poIncomingVal,
                            PoFail = poFailVal
                        };
                    })
                    .OrderByDescending(x => x.IsNPL ?? false)
                    .ThenBy(x => x.Sort ?? int.MaxValue)
                    .ThenBy(x => x.ItemCode ?? "")
                    .ToList();

                var responseItems = sortedItems.Select(x => new
                {
                    maCLVT = x.MaCLVT,
                    itemCode = !string.IsNullOrEmpty(x.ItemCode) ? x.ItemCode : (!string.IsNullOrEmpty(x.VietTat) ? x.VietTat : x.MaCLVT),
                    poOrdered = x.PoArrived + x.PoIncoming + x.PoFail,
                    poArrived = x.PoArrived,
                    poIncoming = x.PoIncoming,
                    poFail = x.PoFail
                }).ToList();

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        summary = new { ordered = totalOrdered, arrived = totalArrived, incoming = totalIncoming, fail = totalFail },
                        items = responseItems
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // =====================================================================
        [HttpGet]
        [Route("GetPurchaseTrackingDetails")]
        public IHttpActionResult GetPurchaseTrackingDetails(string category, string status, string startDate, string endDate)
        {
            try
            {
                string formattedStart, formattedEnd;
                DateTime parsedStart, parsedEnd;
                ParseDateRange(startDate, endDate, out formattedStart, out formattedEnd, out parsedStart, out parsedEnd);

                string clvt = (string.IsNullOrEmpty(category) || category == "all") ? "" : category;

                string sqlStatusStr = null;
                if (status == "arrived") sqlStatusStr = "arrived";
                else if (status == "incoming") sqlStatusStr = "incoming";
                else if (status == "fail") sqlStatusStr = "fail";
                string sqlStatus = string.IsNullOrEmpty(sqlStatusStr) ? "" : sqlStatusStr;

                DataTable tbl = _model.GetBaoCaoMuaHangNPL("CHI_TIET_MUA_HANG", formattedStart, formattedEnd, clvt, sqlStatus);
                var details = tbl.AsEnumerable().Select(r => new
                {
                    MaVTID = S(r, "MaVTID"),
                    POMua = S(r, "POMua"),
                    TrangThaiDonHang = S(r, "TrangThaiDonHang"),
                    MaHang = S(r, "MaHang"),
                    TenVatTu = S(r, "TenVatTu"),
                    KhoVai = S(r, "KhoVai"),
                    MaMauVatTu = S(r, "MaMauVatTu"),
                    MauVatTu = S(r, "MauVatTu"),
                    NCC = S(r, "NCC"),
                    TenKhachHang = S(r, "TenKhachHang"),
                    SoLuong = D(r, "SoLuong"),
                    TenDonViVatTu = S(r, "TenDonViVatTu")
                }).ToList();

                Func<string, int> getPriority = st =>
                {
                    if (st == "arrived") return 4;
                    if (st == "fail") return 3;
                    if (st == "incoming") return 2;
                    if (st == "ordered") return 1;
                    return 0;
                };

                var filteredDetails = details.Where(x => x.TrangThaiDonHang != "ordered").ToList();

                var deduplicatedDetails = filteredDetails
                    .GroupBy(x => new { x.POMua, x.TenVatTu, x.MaMauVatTu, x.KhoVai })
                    .Select(g =>
                    {
                        var priorityRow = g.OrderByDescending(x => getPriority(x.TrangThaiDonHang)).FirstOrDefault();
                        return new
                        {
                            MaVTID = priorityRow.MaVTID,
                            POMua = priorityRow.POMua,
                            TrangThaiDonHang = priorityRow.TrangThaiDonHang,
                            MaHang = priorityRow.MaHang,
                            TenVatTu = priorityRow.TenVatTu,
                            KhoVai = priorityRow.KhoVai,
                            MaMauVatTu = priorityRow.MaMauVatTu,
                            MauVatTu = priorityRow.MauVatTu,
                            NCC = priorityRow.NCC,
                            TenKhachHang = priorityRow.TenKhachHang,
                            SoLuong = g.Sum(x => x.SoLuong),
                            TenDonViVatTu = priorityRow.TenDonViVatTu
                        };
                    })
                    .ToList();

                var formattedData = deduplicatedDetails.Select(x => new
                {
                    poid = x.POMua,
                    maHang = x.MaHang,
                    tenNPL = x.TenVatTu,
                    khoVai = x.KhoVai,
                    maMauVatTu = x.MaMauVatTu,
                    mauVatTu = x.MauVatTu,
                    nhaCungCap = x.NCC,
                    soLuong = x.SoLuong,
                    donViTinh = x.TenDonViVatTu,
                    ngayDuKien = "",
                    trangThai = x.TrangThaiDonHang == "arrived" ? "arrived" :
                                x.TrangThaiDonHang == "ordered" ? "ordered" :
                                x.TrangThaiDonHang == "incoming" ? "incoming" :
                                x.TrangThaiDonHang == "fail" ? "fail" : "",
                    khachHang = x.TenKhachHang ?? ""
                }).ToList();

                return Json(new { success = true, data = formattedData });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // =====================================================================
        [HttpGet]
        [Route("GetMaterialsData")]
        public IHttpActionResult GetMaterialsData(string startDate, string endDate)
        {
            try
            {
                string formattedStart, formattedEnd;
                DateTime parsedStart, parsedEnd;
                if (DateTime.TryParseExact(startDate, "dd/MM/yyyy", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out parsedStart))
                    formattedStart = parsedStart.ToString("yyyy-MM-dd");
                else if (DateTime.TryParse(startDate, out parsedStart))
                    formattedStart = parsedStart.ToString("yyyy-MM-dd");
                else
                    formattedStart = "1900-04-05";

                if (DateTime.TryParseExact(endDate, "dd/MM/yyyy", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out parsedEnd))
                    formattedEnd = parsedEnd.ToString("yyyy-MM-dd");
                else if (DateTime.TryParse(endDate, out parsedEnd))
                    formattedEnd = parsedEnd.ToString("yyyy-MM-dd");
                else
                    formattedEnd = "2900-05-05";

                // 1. Nhu cầu vật tư
                DataTable tblDemand = _model.GetBaoCaoNhuCauTonKho_QLDH("NHU_CAU_VAT_TU_TONG_HOP", formattedStart, formattedEnd, null, null, null);
                var demandList = tblDemand.AsEnumerable().Select(r => new
                {
                    MaCLVT = S(r, "MaCLVT"),
                    ChungLoaiVatTu = S(r, "ChungLoaiVatTu"),
                    VietTat = S(r, "VietTat"),
                    SL = D(r, "SL"),
                    IsNPL = BN(r, "IsNPL"),
                    Sort = IN(r, "Sort")
                }).ToList();

                // 2. Tồn kho vật tư
                DataTable tblStock = _model.GetBaoCaoNhuCauTonKho_QLDH("TON_KHO_NPL", null, null, null, "1900-01-01", "2900-06-30");
                var stockList = tblStock.AsEnumerable().Select(r => new
                {
                    MaCLVT = S(r, "MaCLVT"),
                    ChungLoaiVatTu = S(r, "ChungLoaiVatTu"),
                    VietTat = S(r, "VietTat"),
                    SL = M(r, "SL"),
                    IsNPL = BN(r, "IsNPL"),
                    Sort = IN(r, "Sort")
                }).ToList();

                var allKeys = demandList.Select(x => x.MaCLVT).Union(stockList.Select(x => x.MaCLVT))
                    .Where(x => !string.IsNullOrEmpty(x)).Distinct().ToList();

                var combinedList = new List<object>();
                foreach (var key in allKeys)
                {
                    var demandRow = demandList.FirstOrDefault(x => x.MaCLVT == key);
                    var stockRow = stockList.FirstOrDefault(x => x.MaCLVT == key);

                    string name = (demandRow != null ? demandRow.ChungLoaiVatTu : null) ?? (stockRow != null ? stockRow.ChungLoaiVatTu : null) ?? key;
                    double demandVal = demandRow != null ? demandRow.SL : 0;
                    decimal stockVal = stockRow != null ? stockRow.SL : 0;

                    double pct = 100;
                    if (demandVal > 0)
                    {
                        pct = ((double)stockVal / demandVal) * 100;
                    }

                    bool? isNPL = (demandRow != null ? demandRow.IsNPL : null) ?? (stockRow != null ? stockRow.IsNPL : null);
                    int? sortVal = (demandRow != null ? demandRow.Sort : null) ?? (stockRow != null ? stockRow.Sort : null);

                    combinedList.Add(new
                    {
                        code = key,
                        type = name,
                        demand = demandVal,
                        available = (double)stockVal,
                        pct = pct,
                        isNPL = isNPL ?? false,
                        sort = sortVal ?? int.MaxValue
                    });
                }

                var sortedResults = combinedList.Cast<dynamic>()
                    .OrderByDescending(x => x.isNPL)
                    .ThenBy(x => x.sort)
                    .ThenBy(x => (string)x.type)
                    .Select(x => new { code = x.code, type = x.type, demand = x.demand, available = x.available, pct = x.pct })
                    .ToList();

                return Json(new { success = true, materials = sortedResults });
            }
            catch (Exception)
            {
                return Json(new { success = false, message = "Đã xảy ra lỗi khi tải dữ liệu nguyên phụ liệu" });
            }
        }

        // =====================================================================
        [HttpGet]
        [Route("GetMaterialStatusDetails")]
        public IHttpActionResult GetMaterialStatusDetails(string category, string startDate, string endDate)
        {
            try
            {
                string formattedStart, formattedEnd;
                DateTime parsedStart, parsedEnd;
                if (DateTime.TryParseExact(startDate, "dd/MM/yyyy", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out parsedStart))
                    formattedStart = parsedStart.ToString("yyyy-MM-dd");
                else if (DateTime.TryParse(startDate, out parsedStart))
                    formattedStart = parsedStart.ToString("yyyy-MM-dd");
                else
                    formattedStart = "1900-04-05";

                if (DateTime.TryParseExact(endDate, "dd/MM/yyyy", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out parsedEnd))
                    formattedEnd = parsedEnd.ToString("yyyy-MM-dd");
                else if (DateTime.TryParse(endDate, out parsedEnd))
                    formattedEnd = parsedEnd.ToString("yyyy-MM-dd");
                else
                    formattedEnd = "2900-05-05";

                string categoryParam = (string.IsNullOrEmpty(category) || category == "all") ? "" : category;

                DataTable tbl = _model.GetBaoCaoNhuCauTonKho_QLDH("CHI_TIET_NHU_CAU", formattedStart, formattedEnd, categoryParam, null, null);
                var details = tbl.AsEnumerable().Select(r => new
                {
                    MaLenh = S(r, "MaLenh"),
                    MaHang = S(r, "MaHang"),
                    ItemCode = S(r, "Item_Code"),
                    MaMauVT = S(r, "MaMauVT"),
                    Mau = S(r, "MauVatTu"),
                    WidthSize = S(r, "KhoVai"),
                    DonViVT = S(r, "TenDonViVatTu"),
                    KhachHang = S(r, "TenKhachHang"),
                    SoLuong = DN(r, "SoLuongNhuCau")
                }).ToList();

                return Json(new { success = true, data = details });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
    }


}