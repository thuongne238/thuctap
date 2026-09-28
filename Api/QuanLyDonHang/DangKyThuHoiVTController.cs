using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.IO;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using Newtonsoft.Json;
using NtbSoft.ERP.Model.NguyenPhuLieu;

namespace NtbSoft.ERP.Web.Api.NguyenPhuLieu
{
    [RoutePrefix("api/DangKyThuHoiVT")]
    public class DangKyThuHoiVTController : ApiController
    {
        private readonly DangKyThuHoiVTModel _model = new DangKyThuHoiVTModel();

        // ── GET ──────────────────────────────────────────────────────────────
        [HttpGet]
        [Route("Get")]
        public DataTable Get(string action,
            string Para1 = "", string Para2 = "", string Para3 = "",
            string Para4 = "", string Para5 = "", string Para6 = "")
        {
            return _model.Get(action, Para1, Para2, Para3, Para4, Para5, Para6);
        }

        // ── POST PHIẾU ĐỀ NGHỊ THU HỒI ──────────────────────────────────────
        [HttpPost]
        [Route("PostDNTH")]
        public string PostDNTH(string action,
            [FromBody] List<TYPE_ERP_PhieuDeNghiTHVT> lstData,
            string Para1 = "")
        {
            if (lstData == null || lstData.Count == 0)
                return "False";

            string datetime = DateTime.Now.ToString("ddMMyyyyHHss");
            string imageNameA = SaveSignatureImage(lstData[0].SignNgDK, "SignNgDK", datetime);
            string imageNameB = SaveSignatureImage(lstData[0].SignTBPNgDK, "SignTBPNgDK", datetime);
            string imageNameC = SaveSignatureImage(lstData[0].SignMer, "SignMer", datetime);
            string imageNameD = SaveSignatureImage(lstData[0].SignTBPMer, "SignTBPMer", datetime);

            var json = JsonConvert.SerializeObject(lstData);
            DataTable tbl = JsonConvert.DeserializeObject<DataTable>(json);

            foreach (DataRow row in tbl.Rows)
            {
                row["SignNgDK"] = imageNameA;
                row["SignTBPNgDK"] = imageNameB;
                row["SignMer"] = imageNameC;
                row["SignTBPMer"] = imageNameD;
            }

            return _model.Post(action, Para1, tbl);
        }

        // ── POST CHUNG (nếu cần) ──────────────────────────────────────────────
        [HttpPost]
        [Route("Post")]
        public string Post(string action,
            [FromBody] List<PhieuDangKyXuatVT> lstData,
            string Para1 = "")
        {
            var json = JsonConvert.SerializeObject(lstData);
            DataTable tbl = JsonConvert.DeserializeObject<DataTable>(json);
            return _model.Post(action, Para1, tbl);
        }

        // ── HELPER LƯU ẢNH CHỮ KÝ ───────────────────────────────────────────
        private string SaveSignatureImage(string base64Data, string role, string datetime)
        {
            if (string.IsNullOrEmpty(base64Data)) return "";

            string[] parts = base64Data.Split(',');
            if (parts.Length < 2) return base64Data; // đã là tên file

            try
            {
                byte[] bytes = Convert.FromBase64String(parts[1]);
                using (MemoryStream ms = new MemoryStream(bytes))
                {
                    Image image = Image.FromStream(ms);
                    string fileName = $"{role}-{datetime}.png";
                    string uploadPath = HttpContext.Current.Server.MapPath("~/Images/SignDeNghiThuHoi");

                    if (!Directory.Exists(uploadPath))
                        Directory.CreateDirectory(uploadPath);

                    string fullPath = Path.Combine(uploadPath, fileName);
                    if (File.Exists(fullPath)) File.Delete(fullPath);

                    image.Save(fullPath);
                    return fileName;
                }
            }
            catch { return ""; }
        }
    }
}