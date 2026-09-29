using Newtonsoft.Json;
using NtbSoft.ERP.Model.POMau;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace NtbSoft.ERP.Web.Api.POMau
{
    [RoutePrefix("api/SampleOrder")]
    public class SampleOrderController : ApiController
    {
        SampleOrderModel _model = new SampleOrderModel();
        [HttpGet]
        [Route("Get")]
        public DataTable Get(string action, string para1 = "", string para2 = "", string para3 = "", string para4 = "", string para5 = "", string para6 = "", string para7 = "", string para8 = "", string para9 = "", string para10 = "", int pageindex = 0, int pagesize = 0)
        {
            return _model.Get(action, para1, para2, para3, para4, para5, para6, para7, para8, para9, para10, pageindex, pagesize);
        }
        [HttpGet]
        [Route("Update")]
        public string Update(string action, string para1 = "", string para2 = "", string para3 = "", string para4 = "", string para5 = "", string para6 = "", string para7 = "", string para8 = "", string para9 = "", string para10 = "")
        {
            return _model.Update(action, para1, para2, para3, para4, para5, para6, para7, para8, para9, para10);
        }
        [HttpPost]
        [Route("Post")]
        public string Post([FromBody] DataTable tbl, string action, string para1 = "", string para2 = "", string para3 = "", string para4 = "", string para5 = "", string para6 = "", string para7 = "", string para8 = "", string para9 = "", string para10 = "")
        {
            return _model.Post(tbl, action, para1, para2, para3, para4, para5, para6, para7, para8, para9, para10);
        }
        [HttpPost]
        [Route("PostCT")]
        public string PostCT([FromBody] DataTable tbl, string action, string para1 = "", string para2 = "", string para3 = "", string para4 = "", string para5 = "", string para6 = "", string para7 = "", string para8 = "", string para9 = "", string para10 = "")
        {
            return _model.PostCT(tbl, action, para1, para2, para3, para4, para5, para6, para7, para8, para9, para10);
        }
        [HttpDelete]
        [Route("Delete")]
        public string Delete(string action,string para1 = "", string para2 = "", string para3 = "", string para4 = "", string para5 = "", string para6 = "", string para7 = "", string para8 = "", string para9 = "", string para10 = "")
        {
            return _model.Delete(action, para1, para2, para3, para4, para5, para6, para7, para8, para9, para10);
        }
    }
}