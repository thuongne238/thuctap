using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using NtbSoft.ERP.Entity.SYSTEM;
using NtbSoft.ERP.Model.SYSTEM;

namespace NtbSoft.ERP.Web.Repository.R.SYSTEM
{
    public interface ISystemUserBOMCostingRepository
    {
        List<SystemUserBOMCostingEntity> Get(string userID);
        string Post(List<SystemUserBOMCostingConfigViewEntity> items);
        List<SystemUserBOMCostingConfigViewEntity> GetUser(string userID);
    }
    public class SystemUserBOMCostingRepository : ISystemUserBOMCostingRepository
    {
        SysUserBOMCostingModel _model;
        public SystemUserBOMCostingRepository()
        {
            _model = new SysUserBOMCostingModel();
        }
        public List<SystemUserBOMCostingEntity> Get(string userID)
        {
            DataTable tb = _model.Get(userID);
            NtbSoft.ERP.Libs.clsConvert<SystemUserBOMCostingEntity> convert = new Libs.clsConvert<SystemUserBOMCostingEntity>();
            return convert.ToList(tb);
        }
        public List<SystemUserBOMCostingConfigViewEntity> GetUser(string userID)
        {
            DataTable tb = _model.GetUser(userID);
            NtbSoft.ERP.Libs.clsConvert<SystemUserBOMCostingConfigViewEntity> convert = new Libs.clsConvert<SystemUserBOMCostingConfigViewEntity>();
            return convert.ToList(tb);
        }

        public string Post(List<SystemUserBOMCostingConfigViewEntity> items)
        {
            NtbSoft.ERP.Libs.clsConvert<SystemUserBOMCostingConfigViewEntity> convert = new Libs.clsConvert<SystemUserBOMCostingConfigViewEntity>();
            return _model.Post(convert.ToDataTable(items));
        }
    }
}