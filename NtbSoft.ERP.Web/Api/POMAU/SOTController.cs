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
    [RoutePrefix("api/SampleOrderType")]
    public class SOTController : ApiController
    {
        SOTModel _model = new SOTModel();
        [HttpGet]
        [Route("Get")]
        public DataTable Get(string action = "",string para = "", string para1 = "", string para2 = "", string para3 = "", string para4 = "", string para5 = "")
        {
            return _model.Get(action,para, para1, para2, para3, para4, para5);
        }
        [HttpPost]
        [Route("Post")]
        public string Post([FromBody] DataTable tbl)
        {
            return _model.Post(tbl);
        }
        [HttpDelete]
        [Route("Delete")]
        public string Delete(string parameter)
        {
            return _model.Delete(parameter);
        }
    }
}