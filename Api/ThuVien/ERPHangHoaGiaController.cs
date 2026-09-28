using NtbSoft.ERP.Entity;
using NtbSoft.ERP.Model.ThuVien;
using System;
using System.Collections.Generic;
using System.Data;
using System.Web.Http;

namespace NtbSoft.ERP.Web.Api.ThuVien
{
    [RoutePrefix("api/ERPHangHoaGia")]
    public class ERPHangHoaGiaController : ApiController
    {
        private readonly HangHoaGiaModel _model =
            new HangHoaGiaModel();

        [HttpGet]
        [Route("Get")]
        public DataTable Get(
            string maCL = "",
            string maKH = "")
        {
            return _model.Get(maCL, maKH);
        }

        [HttpGet]
        [Route("GetNhom")]
        public DataTable GetNhom()
        {
            return _model.GetNhom();
        }


        [HttpGet]
        [Route("GetTienTe")]
        public DataTable GetTienTe()
        {
            return _model.GetTienTe();
        }


        [HttpGet]
        [Route("GetKhachHang")]
        public DataTable GetKhachHang()
        {
            return _model.GetKhachHang();
        }
        [HttpGet]
        [Route("GetNhomByKhachHang")]
        public DataTable GetNhomByKhachHang(string maKH)
        {
            return _model.GetNhomByKhachHang(maKH);
        }

        [HttpPost]
        [Route("Save")]
        public bool Save(List<HangHoaGiaEntity> data)
        {
            return _model.Save(data);
        }


        [HttpGet]
        [Route("GetGiaHistory")]
        public DataTable GetGiaHistory(string maHangID, string maCL = "")
        {
            return _model.GetGiaHistory(maHangID, maCL);
        }
        [HttpPost]
        [Route("DeleteHistory")]
        public string DeleteHistory(
      [FromBody] List<HangHoaGiaEntity> data)
        {
            return _model.DeleteHistory(data);
        }


        [HttpGet]
        [Route("GetGiaByNgayApDung")]
        public IHttpActionResult GetGiaByNgayApDung(
     string tuNgay,
     string denNgay,
     string maCL = "",
     string maKH = "",
     string keyword = "")
        {
            DateTime tu, den;

            bool okTu = DateTime.TryParseExact(
                tuNgay, "yyyy-MM-dd",
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None,
                out tu);

            bool okDen = DateTime.TryParseExact(
                denNgay, "yyyy-MM-dd",
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None,
                out den);

            if (!okTu || !okDen)
                return BadRequest("Tham số ngày không hợp lệ. Định dạng yêu cầu: yyyy-MM-dd.");

            try
            {
                DataTable dt = _model.GetByNgayApDung(tu, den, maCL, maKH, keyword);
                return Ok(dt);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}