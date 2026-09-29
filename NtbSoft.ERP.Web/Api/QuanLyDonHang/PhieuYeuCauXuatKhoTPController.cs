using NtbSoft.ERP.Model.ThuVien;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Http;
using NtbSoft.ERP.Model.QuanLyDonHang;
using Newtonsoft.Json;
using OfficeOpenXml;
using OfficeOpenXml.Drawing;
using OfficeOpenXml.Style;
using System.Drawing;
using System.IO;
using System.Net;
using System.Net.Http;


namespace NtbSoft.ERP.Web.Api.QuanLyDonHang
{
    [RoutePrefix("api/PhieuYCXKTP")]
    public class PhieuYeuCauXuatKhoTPController : ApiController
    {
        [HttpGet]
        [Route("Get")]
        public DataTable Get(string action, string Para1 = "", string Para2 = "", string Para3 = "", string Para4 = "", string Para5 = "", string Para6 = "", string Para7 = "", string Para8 = "", string Para9 = "")
        {
            return new PhieuYeuCauXuatKhoTPModel().Get(action, Para1, Para2, Para3, Para4, Para5, Para6,Para7,Para8,Para9);
        }

        [HttpPost]
        [Route("Post")]
        public string Post(string action, List<TYPE_ERP_PhieuXuatKho_TP> lstData, string Para1 = "", string Para2 = "", string Para3 = "", string Para4 = "", string Para5 = "", string Para6 = "", string Para7 = "", string Para8 = "", string Para9 = "")
        {
            var json = JsonConvert.SerializeObject(lstData);
            DataTable tbl = JsonConvert.DeserializeObject<DataTable>(json);

            return new PhieuYeuCauXuatKhoTPModel().Post(action, tbl, Para1, Para2, Para3, Para4, Para5, Para6, Para7, Para8, Para9);
        }

        [HttpPost]
        [Route("PostXKTP")]
        public string PostXKTP(string action, List<TYPE_ERP_PhieuXuatKho_TP> lstData, string Para1 = "", string Para2 = "", string Para3 = "", string Para4 = "", string Para5 = "", string Para6 = "", string Para7 = "", string Para8 = "", string Para9 = "")
        {
            if (lstData == null || lstData.Count == 0)
                return "False";
            string imageDataA = lstData[0].SignNgDK;
            string imageDataB = lstData[0].SignTBPNgDK;
      
            string datetime = DateTime.Now.ToString("ddMMyyyyHHss");
            string imageNameA = SaveSignatureImage(imageDataA, $"SignNgDK", "", datetime);
            string imageNameB = SaveSignatureImage(imageDataB, $"SignTBPNgDK", "", datetime);

            var json = JsonConvert.SerializeObject(lstData);
            DataTable tbl = JsonConvert.DeserializeObject<DataTable>(json);
            foreach (DataRow item in tbl.Rows)
            {
                item["SignNgDK"] = imageNameA;
                item["SignTBPNgDK"] = imageNameB;
            }

            return new PhieuYeuCauXuatKhoTPModel().Post(action, tbl, Para1, Para2, Para3, Para4, Para5, Para6, Para7, Para8, Para9);
        }


        [HttpPost]
        [Route("PostChiTiet")]
        public string PostChiTiet(string action, List<Type_ERP_PhieuDeNghiCapThemVTChiTiet> lstData, string Para1 = "", string Para2 = "", string Para3 = "", string Para4 = "", string Para5 = "", string Para6 = "", string Para7 = "", string Para8 = "", string Para9 = "")
        {
            var json = JsonConvert.SerializeObject(lstData);
            DataTable tbl = JsonConvert.DeserializeObject<DataTable>(json);

            return new PhieuYeuCauXuatKhoTPModel().PostChiTiet(action, tbl, Para1, Para2, Para3, Para4, Para5, Para6, Para7, Para8, Para9);
        }


        private string SaveSignatureImage(string base64Data, string role, string module, string datetime)
        {
            if (string.IsNullOrEmpty(base64Data)) return "";

            string[] parts = base64Data.Split(',');
            if (parts.Length < 2) return base64Data;

            byte[] bytes = Convert.FromBase64String(parts[1]);
            using (MemoryStream ms = new MemoryStream(bytes))
            {
                Image image = Image.FromStream(ms);
                string fileName = $"{role}-{module}-{datetime}.png";
                string uploadPath = HttpContext.Current.Server.MapPath("~/Images/SignYeuCauXuatKho");

                if (!Directory.Exists(uploadPath))
                    Directory.CreateDirectory(uploadPath);

                string fullPath = Path.Combine(uploadPath, fileName);
                if (File.Exists(fullPath))
                    File.Delete(fullPath);

                image.Save(fullPath);
                return fileName;
            }
        }

       
    }

}

public class TYPE_ERP_PhieuXuatKho_TP
{
    public int ID { get; set; }
    public string PhieuXKTP { get; set; }
    public int? Dot { get; set; }
    public string MaLenh { get; set; }
    public string NguoiNhan { get; set; }
    public string DiaChi { get; set; }

    public string LyDo { get; set; }
    public double? SLYC { get; set; }
    public double? SLTX { get; set; }
    public double? DonGia { get; set; }
    public double? ThanhTien { get; set; }
    public string MaHang { get; set; }
    public string MaMau { get; set; }
    public string MaNhomSize { get; set; }
    public string MaSize { get; set; }
    public string TenCL { get; set; }
    public string TenDVCL { get; set; }
    public string GhiChu { get; set; }
    public DateTime? NgayDK { get; set; }
    public DateTime? NgayXuat { get; set; }
    public DateTime? NgayTao { get; set; }
    public string NguoiTao { get; set; }
    public string SignNgDK { get; set; }
    public DateTime? NgayKi { get; set; }
    public string SignTBPNgDK { get; set; }
    public DateTime? NgayKiTBPNgDK { get; set; }
    public string NguoiUpdate { get; set; }
    public DateTime? NgayUpdate { get; set; }
    public string UserTBPNDK { get; set; }

    public string NguoiKi { get; set; }
    public int? IsOk { get; set; }
}
