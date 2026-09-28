using NtbSoft.ERP.Model.ThuVien;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace NtbSoft.ERP.Web.Api.ThuVien
{
    [RoutePrefix("api/ERPVatTuChinhSua")]
    public class ERP_VatTuChinhSuaController : ApiController
    {
        [HttpGet]
        [Route("Get")]
        public DataTable Get(string action, string para1 = "", string para2 = "", string para3 = "", string para4 = "", string para5 = "",
                            string para6 = "", string para7 = "", string para8 = "", string para9 = "", string para10 = "", string para11 = ""
            , string para12 = "", string para13 = "", string para14 = "", string para15 = "")
        {
            return new ERP_VatTuChinhSuaModel().Get(action, para1, para2, para3, para4, para5, para6, para7, para8, para9, para10,para11,para12,para13,para14,para15);
        }
        [HttpPost]
        [Route("Post")]
        public string Post1(string action, [FromBody] DataTable tbl, string para1 = "", string para2 = "", string para3 = "", string para4 = "", string para5 = "",
                            string para6 = "", string para7 = "", string para8 = "", string para9 = "", string para10 = "", string para11 = ""
            , string para12 = "", string para13 = "", string para14 = "", string para15 = "")
        {
            return new ERP_VatTuChinhSuaModel().Post(action, tbl, para1, para2, para3, para4, para5, para6, para7, para8, para9, para10, para11, para12, para13, para14, para15);
        }
      
        [HttpDelete]
        [Route("Delete")]
        public string Delete(string action, string para1 = "", string para2 = "", string para3 = "", string para4 = "", string para5 = "",
                           string para6 = "", string para7 = "", string para8 = "", string para9 = "", string para10 = "", string para11 = ""
            , string para12 = "", string para13 = "", string para14 = "", string para15 = "")
        {
            return new ERP_VatTuChinhSuaModel().Delete(action, para1, para2, para3, para4, para5, para6, para7, para8, para9, para10, para11, para12, para13, para14, para15);
        }
    }
}