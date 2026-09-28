// KHDKXuatHangController.cs
using NtbSoft.ERP.Model.KeHoach;
using System.Data;
using System.Web.Http;
using System.Web.Http.Cors;

namespace NtbSoft.ERP.Web.Api.KeHoach
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/KHDKXuatHang")]
    public class KHDKXuatHangController : ApiController
    {
        private KHDKXuatHangModel _model = new KHDKXuatHangModel();

        [HttpGet]
        [Route("Get")]
        public DataTable Get(string maDH = "", string parameter = "", string parameter2 = "")
        {
            return _model.Get(maDH, parameter, parameter2);
        }
        [HttpGet]
        [Route("GetBrand")]
        public DataTable GetBrand(string maDH = "")
        {
            return _model.GetBrand(maDH);
        }
        [HttpGet]
        [Route("GetALLDH")]
        public DataTable GetALLDH()
        {
            return _model.GetALLDH();
        }
        [HttpPost]
        [Route("Post")]
        public string Post(DataTable tbl)
        {
            if (tbl == null) return "false";
            return _model.Post(tbl);
        }

        [HttpDelete]
        [Route("Delete")]
        public string Delete(int id)
        {
            return _model.Delete(id);
        }
        [HttpGet]
        [Route("GetList")]
        public DataTable GetList()
        {
            return _model.GetList();
        }
        [HttpDelete]
        [Route("DeleteDot")]
        public string DeleteDot(string maDH, string dot, string nguoiXoa)
        {
            return _model.DeleteDot(maDH, dot,nguoiXoa);
        }
        [HttpGet]
        [Route("GetThucXuat")]
        public DataTable GetThucXuat(string maDH = "")
        {
            return _model.GetThucXuat(maDH);
        }
        [HttpGet]
        [Route("GetSummaryKH")]
        public DataTable GetSummaryKH()
        {
            return _model.GetSummaryKH();
        }
    }
}