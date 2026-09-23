using Newtonsoft.Json;
using NtbSoft.ERP.Entity.Kho;
using NtbSoft.ERP.Model.KeHoach;
using NtbSoft.ERP.Model.Kho;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace NtbSoft.ERP.Web.Api.KeHoach
{
    [RoutePrefix("api/BienBanLuuSeal")]
    public class BienBanLuuSealController : ApiController
    {
        [HttpGet]
        [Route("Get")]
        public DataTable Get(string action, string para1, string para2, string para3, string para4, string para5)
        {
            return new BienBanLuuSealModel().Get(action, para1, para2, para3, para4, para5);
        }

        [HttpPost]
        [Route("PostSeal")]
        public string PostDT(dynamic data)
        {
            List<BienBanLuuSeal> lstData = new List<BienBanLuuSeal>();
            foreach (var item in data)
            {
                lstData.Add(new BienBanLuuSeal()
                {
                    MaPhieu = item.MaPhieu.ToString(),
                    MaCont = item.MaCont.ToString(),
                    MaSeal = item.MaSeal.ToString(),
                    TenSeal = item.TenSeal.ToString(),
                    MaPKL = item.MaPKL.ToString(),
                    SoXe = item.SoXe.ToString(),
                    Status = (int)item.Status,
                    NgayLuu = "",
                });
            }
            var json = JsonConvert.SerializeObject(lstData);
            DataTable tbl = JsonConvert.DeserializeObject<DataTable>(json);
            return new BienBanLuuSealModel().Post(tbl, "PostSeal", "@TyTable");
        }
        [HttpPost]
        [Route("PostDSXe")]
        public string PostDSXe(dynamic data)
        {
            List<BienBanDSXe> lstData = new List<BienBanDSXe>();
            foreach (var item in data)
            {
                lstData.Add(new BienBanDSXe()
                {
                    MaCont = item.MaCont.ToString(),
                    MaSeal = item.MaSeal.ToString(),
                    TenSeal = item.TenSeal.ToString(),
                    MaPKL = item.MaPKL.ToString(),
                    TenTaiXe = item.TenTaiXe.ToString(),
                    CMND = item.CMND.ToString(),
                    SoXe = item.SoXe.ToString(),
                    SLSP = (int)item.SLSP,
                    SLThung = (int)item.SLThung,
                    Module = (int)item.Module,

                });
            }
            var json = JsonConvert.SerializeObject(lstData);
            DataTable tbl = JsonConvert.DeserializeObject<DataTable>(json);
            return new BienBanLuuSealModel().Post(tbl, "PostListXe", "@TypeTableDSXe");
        }



        [HttpPost]
        [Route("ExportFile")]
        public string ExportCargo(List<ExportCargoListEntity> data)
        {
            try
            {

                string path = HttpContext.Current.Server.MapPath("~/Content/Templates/CARGO_LIST_SEA_SHIPMENT.xlsx");
                FileInfo file = new FileInfo(path);

                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.Commercial;

                using (ExcelPackage package = new ExcelPackage(file))
                {
                    var ws = package.Workbook.Worksheets["Sheet1"];

                    if (ws == null) throw new Exception("Không tìm thấy Sheet");
                    var shipper = data[0].Shipper;
                    var consignee = data[0].Consignee;
                    var notify = data[0].Notify;
                    var shipment = $"SHIPMENT FROM: {data[0].Shipment}";
                    var nguoiNhanHang = $"TO: {data[0].NguoiNhanHang}";
                    // Set Shipper
                    ws.Cells[6, 2].Value = shipper;
                    ws.Cells[10, 2].Value = consignee;
                    ws.Cells[15, 2].Value = notify;
                    ws.Cells[16, 1].Value = shipment;
                    ws.Cells[16, 10].Value = nguoiNhanHang;

                    int row = 19;

                    // group HSCode và ChungLoai
                    var grouped = data
                        .GroupBy(x => x.HSCode)
                        .ToDictionary(
                            g => g.Key,
                            g => g.GroupBy(x => x.ChungLoai)
                        );

                    foreach (var HSCode in grouped)
                    {
                        foreach (var chungLoai in HSCode.Value)
                        {
                            // row cha
                            ws.InsertRow(row, 1);

                            ws.Cells[row, 1].Value = HSCode.Key;
                            ws.Cells[row, 6].Value = chungLoai.Key;
                          

                            // style
                            var rangeCha = ws.Cells[row, 1, row, 13];
                            rangeCha.Style.Font.Bold = true;
                            rangeCha.Style.Fill.PatternType = ExcelFillStyle.Solid;
                            rangeCha.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                            rangeCha.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(231, 240, 255));
                            rangeCha.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            ws.Cells[row, 6].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                            row++;

                            // row con
                            foreach (var item in chungLoai)
                            {
                                ws.InsertRow(row, 1);

                                ws.Cells[row, 2].Value = item.TuThung;
                                ws.Cells[row, 3].Value = item.DenThung;
                                ws.Cells[row, 4].Value = item.QtyCTNS;
                                ws.Cells[row, 5].Value = item.KhachHang;
                                ws.Cells[row, 6].Value = item.MaHang;
                                ws.Cells[row, 8].Value = item.MaPKL_XH;
                                ws.Cells[row, 9].Value = item.PO;
                                ws.Cells[row, 10].Value = item.QtyPCS;
                                ws.Cells[row, 11].Value = item.GW;
                                ws.Cells[row, 12].Value = item.MEAS;
                                ws.Cells[row, 13].Value = item.Carton;
                                //ws.Cells[row, 14].Value = item.AQL;
                                //ws.Cells[row, 15].Value = item.Original;

                                row++;
                            }
                        }
                    }

                    //footer
                    ws.InsertRow(row, 1);

                    ws.Cells[row, 1, row, 3].Merge = true;
                    ws.Cells[row, 1].Value = "TỔNG";

                    ws.Cells[row, 4].Value = data.Sum(x => x.QtyCTNS);
                    ws.Cells[row, 10].Value = data.Sum(x => x.QtyPCS);
                    ws.Cells[row, 11].Value = data.Sum(x => (double)x.GW);
                    ws.Cells[row, 12].Value = data.Sum(x => (double)x.MEAS);

                    ws.Cells[row, 1, row, 13].Style.Font.Bold = true;


                    var footerRange = ws.Cells[row, 1, row, 13];

                    footerRange.Style.Font.Bold = true;
                    footerRange.Style.Font.Color.SetColor(System.Drawing.Color.Red);
                    footerRange.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    footerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                    footerRange.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    footerRange.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    // border
                    var border = ws.Cells[18, 1, row, 13].Style.Border;
                    border.Top.Style = border.Bottom.Style =
                    border.Left.Style = border.Right.Style =
                        ExcelBorderStyle.Thin;

                    //ws.Cells.AutoFitColumns();

                    byte[] bytes = package.GetAsByteArray();
                    return Convert.ToBase64String(bytes);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Lỗi xảy ra tại dòng: " + ex.StackTrace);
                throw;
            }

        }

    }


    public class BienBanLuuSeal
    {
        public string MaPhieu { get; set; }
        public string MaCont { get; set; }
        public string MaSeal { get; set; }
        public string TenSeal { get; set; }
        public string MaPKL { get; set; }
        public string SoXe { get; set; }
        public int Status { get; set; }
        public string NgayLuu { get; set; }
    }
    public class BienBanDSXe
    {
        public string MaCont { get; set; }
        public string MaSeal { get; set; }
        public string TenSeal { get; set; }
        public string MaPKL { get; set; }
        public string TenTaiXe { get; set; }
        public string CMND { get; set; }
        public string SoXe { get; set; }
        public int SLSP { get; set; }
        public int SLThung { get; set; }
        public int Module { get; set; }
    }

    public class PackageListXuatHangHSCodeEntity
    {
        public int Id { get; set; }
        public string MaPKL_XH { get; set; }
        public string MaDH { get; set; }
        public string KhachHang { get; set; }
        public string MaHang { get; set; }
        public string POID { get; set; }
        public string PO { get; set; }
        public int Carton { get; set; }
        public int SoLuong { get; set; }
        public string VCCont { get; set; }
        public string VCXeTai { get; set; }
        public string Soxe { get; set; }
        public string Cont { get; set; }
        public string Romoc { get; set; }
        public string MaSeal { get; set; }
        public string Consignee { get; set; }
        public string InVoice { get; set; }
        public string TenTaiXe { get; set; }
        public string CMND { get; set; }
        public string CongTy { get; set; }
        public string Shipper { get; set; }
        public string Image { get; set; }
        public string Video { get; set; }
        public DateTime? PackDate { get; set; }
        public DateTime? FinishDate { get; set; }
        public DateTime? CreateDate { get; set; }
        public DateTime? ExportDate { get; set; }
        public int IsExport { get; set; }
        public string NhanVien { get; set; }
        public string Image0 { get; set; }
        public string Image25 { get; set; }
        public string Image50 { get; set; }
        public string Image75 { get; set; }
        public string Image100 { get; set; }
        public string ImageDongCua { get; set; }
        public string ImageDoAm { get; set; }
        public string ImageTruocChot { get; set; }
        public string ImageChotAT { get; set; }
        public string NhanVienKiem { get; set; }
        public string GhiChu { get; set; }
        public string MaCont { get; set; }
        public string SoBooking { get; set; }
        public string MaBooking { get; set; }
        public string HSCode { get; set; }
        public string Notify { get; set; }
        public string Shipment { get; set; }
        public string NguoiNhanHang { get; set; }
        public string DiaChi { get; set; }
        public string LyDo { get; set; }
    }
    public class ExportCargoListEntity
    {
        public string MaHang { get; set; }
        public string KhachHang { get; set; }
        public string NguoiNhanHang { get; set; }
        public string PO { get; set; }
        public string HSCode { get; set; }
        public string Shipper { get; set; }
        public string Consignee { get; set; }
        public string Notify { get; set; }
        public string Shipment { get; set; }
        public string DiaChi { get; set; }
        public int TuThung { get; set; }
        public int DenThung { get; set; }
        public int QtyCTNS { get; set; }
        public string ChungLoai { get; set; }
        public string SO { get; set; }
        public string MaPKL_XH { get; set; }
        public int QtyPCS { get; set; }
        public double GW { get; set; }
        public double MEAS { get; set; }
        public string Carton { get; set; }
        public string AQL { get; set; }
        public string Original { get; set; }
    }
}