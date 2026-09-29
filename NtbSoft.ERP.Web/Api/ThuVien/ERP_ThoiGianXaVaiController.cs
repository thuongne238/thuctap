using System.Data;
using System.Web.Http;
using NtbSoft.ERP.Model.ThuVien;

namespace NtbSoft.ERP.Web.Api.ThuVien
{
    [RoutePrefix("api/ERPThoiGianXaVai")]
    public class ERP_ThoiGianXaVaiController : ApiController
    {
        ERP_ThoiGianXaVaiModel _model = new ERP_ThoiGianXaVaiModel();

        [HttpGet]
        [Route("GetChung")]
        public DataTable GetChung(string action, string para = "", string para1 = "", string para2 = "", string para3 = "", string para4 = "", string para5 = "")
        {
            return _model.GetChung(action, para, para1, para2, para3, para4, para5);
        }
        [HttpGet]
        [Route("Get")]
        public DataTable Get(string makh, string mahang)
        {
            return _model.Get(makh, mahang);
        }
        [HttpPost]
        [Route("PostThoiGianXaVai")]
        public string Post(DataTable tbl)
        {
            return _model.Post(tbl);
        }
        [HttpPost]
        [Route("DeleteThoiGianXaVai")]
        public string DeleteThoiGianXaVai(
    string maNhom,
    string maDVVT,
    string maVTID = "",
    string mauVTID = "",
    string khoVaiID = "")
        {
            return _model.Delete(maNhom, maDVVT, maVTID, mauVTID, khoVaiID);
        }


        [HttpGet]
        [Route("GetHistory")]
        public DataTable GetHistory(string maNhom,string maDVVT,string maVTID = "",string mauVTID = "",string khoVaiID = "")
        {
            return _model.GetHistory(maNhom, maDVVT, maVTID, mauVTID, khoVaiID);
        }

        [HttpPost]
        [Route("DeleteHistory")]
        public IHttpActionResult DeleteHistory(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return Ok(false);

                bool result = _model.DeleteHistory(id);

                return Ok(result);
            }
            catch
            {
                return Ok(false);
            }
        }
    }


}