using NtbSoft.ERP.Entity.Kho;
using NtbSoft.ERP.Model.Kho;
using System.Data;
using System.Web.Http;
using System.Web.Http.Cors;

namespace NtbSoft.ERP.Web.Api.Kho
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/BaoCaoTongHop/BCTN")]
    public class BaoCaoTongHopBCTNController : ApiController
    {

        [HttpPost]
        [Route("Get")]
        public DataTable Get(ERPTongHopBCTNEntity req)
        {
            if (req == null)
            {
                req = new ERPTongHopBCTNEntity();
            }

            return new ERPTongHopBCTNModel().Get(
                req.Para ?? "",
                req.Para1 ?? ""
            );
        }

     
    }
}