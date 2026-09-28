using NtbSoft.ERP.Entity.SYSTEM;
using NtbSoft.ERP.Web.Repository.R.SYSTEM;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace NtbSoft.ERP.Web.Api.SYSTEM
{
    [RoutePrefix("api/PhanQuyenBOMCosting")]
    public class SysUserBOMCostingController : ApiController
    {
        ISystemUserBOMCostingRepository _repo = new SystemUserBOMCostingRepository();
        [HttpGet]
        [Route("Get")]
        public List<SystemUserBOMCostingEntity> Get(string userID)
        {
            return _repo.Get(userID);
        }
        [HttpGet]
        [Route("GetUser")]
        public List<SystemUserBOMCostingConfigViewEntity> GetUser(string userID)
        {
            return _repo.GetUser(userID);
        }
        [HttpPost]
        [Route("Post")]
        public string Post(List<SystemUserBOMCostingConfigViewEntity> items)
        {
            return _repo.Post(items);
        }
    }
}