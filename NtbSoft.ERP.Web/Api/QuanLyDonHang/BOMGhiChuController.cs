using NtbSoft.ERP.Model.QuanLyDonHang;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace NtbSoft.ERP.Web.Api.QuanLyDonHang
{
    [RoutePrefix("api/BOMGhiChu")]
    public class BOMGhiChuController : ApiController
    {
        [HttpGet]
        [Route("Get")]
        public DataTable Get(string action, string para1 = "", string para2 = "", string para3 = "", string para4 = "", string para5 = "",
                            string para6 = "", string para7 = "", string para8 = "", string para9 = "", string para10 = "")
        {
            return new BOMGhiChuModel().Get(action, para1, para2, para3, para4, para5, para6, para7, para8, para9, para10);
        }
        [HttpPost]
        [Route("Post")]
        public string Post(string action, [FromBody] DataTable tbl, string para1 = "", string para2 = "", string para3 = "", string para4 = "", string para5 = "",
                            string para6 = "", string para7 = "", string para8 = "", string para9 = "", string para10 = "")
        {
            return new BOMGhiChuModel().Post(action, tbl, para1, para2, para3, para4, para5, para6, para7, para8, para9, para10);
        }
       
    }
}