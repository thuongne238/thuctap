using System.Data;
using System.Web.Http;
using System.Web.Http.Cors;
using NtbSoft.ERP.Model.ThuVien;

namespace NtbSoft.ERP.Web.Api.ThuVien
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/HinhThuc")]
    public class HinhThucController : ApiController
    {
        HinhThucModel _model = new HinhThucModel();

        [HttpGet]
        [Route("Get")]
        public DataTable Get()
        {
            return _model.Get();
        }

        [HttpGet]
        [Route("GetPhuongTien")]
        public DataTable GetPhuongTien()
        {
            return _model.GetPhuongTien();
        }

        [HttpGet]
        [Route("GetPallet")]
        public DataTable GetPallet()
        {
            return _model.GetPallet();
        }

        [HttpPost]
        [Route("Post")]
        public string PostDonVi(DataTable tbl)
        {
            return _model.Post(tbl);
        }

        [HttpPost]
        [Route("PostPhuongTien")]
        public string PostPhuongTien(DataTable tbl)
        {
            return _model.PostPhuongTien(tbl);
        }

        [HttpPost]
        [Route("PostPallet")]
        public string PostPallet(DataTable tbl)
        {
            return _model.PostPallet(tbl);
        }

        [HttpDelete]
        [Route("Delete")]
        public string DeleteDonVi(int parameter)
        {
            return _model.Delete(parameter);
        }

        [HttpDelete]
        [Route("DeletePhuongTien")]
        public string DeletePhuongTien(int parameter)
        {
            return _model.DeletePhuongTien(parameter);
        }

        [HttpDelete]
        [Route("DeletePallet")]
        public string DeletePallet(int parameter)
        {
            return _model.DeletePallet(parameter);
        }
        [HttpGet]
        [Route("GetTinhToanThung")]
        public DataTable GetTinhToanThung()
        {
            return _model.GetTinhToanThung();
        }

        [HttpPost]
        [Route("PostTinhToanThung")]
        public string PostTinhToanThung(DataTable tbl)
        {
            return _model.PostTinhToanThung(tbl);
        }

        [HttpDelete]
        [Route("DeleteTinhToanThung")]
        public string DeleteTinhToanThung(int parameter)
        {
            return _model.DeleteTinhToanThung(parameter);
        }
    }

}