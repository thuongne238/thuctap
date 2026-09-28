using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Data;
using NtbSoft.ERP.Web.Repository.R.ThuVien;
using Newtonsoft.Json;
using NtbSoft.ERP.Entity.ThuVien;
using NtbSoft.ERP.Model.ThuVien;
using NtbSoft.ERP.Model.POMuaHang;
using NtbSoft.ERP.Entity.POMH;
using System.Threading.Tasks;
using NtbSoft.ERP.Model.POMH;

namespace NtbSoft.ERP.Web.Api.POMuaHang
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/NhaCC")]
    public class NhaCungCapController : ApiController
    {
        NhaCungCapModel _model = new NhaCungCapModel();
        [HttpGet]
        [Route("Get")]
        public DataTable Get(string action, string para, string para1, string para2, string para3, string para4, string para5)
        {
            return _model.Get(action, para, para1, para2, para3, para4, para5);
        }
        [HttpPost]
        [Route("Post")]
        public string Post(DataTable tbl)
        {
            return _model.Post(tbl);
        }
        [HttpDelete]
        [Route("Delete")]
        public string Deleteloai(int parameter)
        {
            return _model.Delete(parameter);
        }
        [HttpDelete]
        [Route("DeleteMMTB_LK")]
        public string DeleteMMTB_LK(string para, string para1, string para2, string para3, string para4, string para5, string action)
        {
            return _model.DeleteMMTB_LK(para, para1, para2, para3, para4, para5, action);
        }
        //NHÀ CUNG CẤP

        [HttpPost]
        [Route("PostKHLoai")]
        public string PostKHL(DataTable tbl)
        {
            return _model.Postkhloai(tbl);
        }
        [HttpPost]
        [Route("PostCLMMTB")]
        public string PostCLMMTB(DataTable tbl)
        {
            return _model.PostCLMMTB(tbl);
        }
        [HttpPost]
        [Route("PostKH")]
        public string PostKH(DataTable tbl)
        {
            return _model.PostKH(tbl);
        }
        [HttpPost]
        [Route("InsertOrUpdate")]
        public string InsertOrUpdate(DataTable tbl)
        {
            return _model.InsertOrUpdate(tbl);
        }
        [HttpPost]
        [Route("PostCLLKMMTB")]
        public string PostCLLKMMTB(DataTable tbl, string para)
        {
            return _model.PostCLLKMMTB(tbl, para);
        }
        [HttpGet]
        [Route("GetPhieuBG")]
        public DataTable GetPBG(string action, string para, string para1, string para2, string para3, string para4, string para5)
        {
            return _model.GetPhieuBG(action, para, para1, para2, para3, para4, para5);
        }

        [HttpPost]
        [Route("Postphieu")]
        public string Postp(DataTable tbl)
        {
            return _model.Postphieu(tbl);
        }

        [HttpDelete]
        [Route("DeletePhieu")]
        public string Deletephieu(string para)
        {
            return _model.DeletePhieu(para);
        }

        [HttpDelete]
        [Route("DeleteLoaiNCC")]
        public string DeleteLoaiNCC(string para, string para1)
        {
            return _model.DeleteLoaiNCC(para, para1);
        }
        [HttpDelete]
        [Route("DeleteNCC")]
        public string DeleteNCC(string para)
        {
            return _model.DeleteNCC(para);
        }
        [HttpDelete]
        [Route("DeleteCLMMTB")]
        public string DeleteCLMMTB(string para, string para1, string para2)
        {
            return _model.DeleteCLMMTB(para, para1, para2);
        }

        [HttpDelete]
        [Route("DeleteChungLoaiNCC")]
        public string DeleteLoaiNCC(string para, string para1, string para2)
        {
            return _model.DeleteChungLoaiNCC(para, para1, para2);
        }

        [HttpPost]
        [Route("PostCLKH")]
        public string PostclKH(DataTable tbl)
        {
            return _model.PostCLKH(tbl);
        }

        // ĐÁNH GIÁ
        #region danhgiancc
        [HttpGet]
        [Route("Getdg")]
        public DataTable Getdg(string action, string para, string para1, string para2)
        {
            return _model.Getdanhgia(action, para, para1, para2);
        }
        [HttpPost]
        [Route("Postdg")]
        public string Postdg(DataTable tbl)
        {
            return _model.Postdanhgia(tbl);
        }
        [HttpDelete]
        [Route("Deletedg")]
        public string Deletedg([FromUri] int parameter)
        {
            return _model.Deletedanhgia(parameter);
        }
        #endregion
        ////PHIẾU MUA HÀNG
        //
        #region phieumuahangvt
        [HttpGet]
        [Route("GePMH")]
        public DataTable GetPMH(string action, string para1, string para2, string para3, string para4, string para5)
        {
            return _model.GetPhieuMuaHang(action, para1, para2, para3, para4, para5);
        }

        [HttpPost]
        [Route("Pospmh")]
        public string Postpmh(DataTable tbl)
        {
            return _model.PostPMH(tbl);
        }

        [HttpPost]
        [Route("Pospmhdh")]
        public string Postpmhdh(DataTable tbl)
        {
            return _model.PostPMHDH(tbl);
        }

        [HttpPost]
        [Route("PospXN")]
        public string PostXN(DataTable tbl)
        {
            return _model.PostXN(tbl);
        }
        [HttpPost]
        [Route("PospHuy")]
        public string PostHuy(DataTable tbl)
        {
            return _model.PostHuy(tbl);
        }
        [HttpDelete]
        [Route("DeleteRowPMH")]
        public string DeleteRowPMH(string para1, string para2, string para3, string para4, string para5)
        {
            return _model.DeleteRowPMH(para1, para2, para3, para4, para5);
        }
        #endregion
        //CHI PHÍ PHÁT SINH VÀ ĐỢT GIAO HÀNG
        #region chiphips & dgh
        [HttpGet]
        [Route("GetCP")]
        public DataTable GetCP(string action, string para1, string para2, string para3, string para4, string para5)
        {
            return _model.GetCP_DOT(action, para1, para2, para3, para4, para5);
        }

        [HttpPost]
        [Route("PostCP")]
        public string PostCP(DataTable tbl)
        {
            return _model.PostCP(tbl);
        }

        [HttpDelete]
        [Route("DeleteCP")]
        public string DeleteCP([FromUri] int parameter)
        {
            return _model.DeleteCP(parameter);
        }

        [HttpPost]
        [Route("PostCPPhieuMH")]
        public string PostCPPhieuMH(DataTable tbl)
        {
            return _model.PostCPPhieuMH(tbl);
        }

        [HttpPost]
        [Route("PostDotGHPMH")]
        public string PostDotGHPMH(DataTable tbl)
        {
            return _model.PostDotGHPMH(tbl);
        }

        [HttpPost]
        [Route("PostHT")]
        public string PostHT(DataTable tbl)
        {
            return _model.PostHT(tbl);
        }

        [HttpDelete]
        [Route("DeleteHTTT")]
        public string DeleteHTTT([FromUri] string para, string para1)
        {
            return _model.DeleteTT(para, para1);
        }

        [HttpDelete]
        [Route("DeleteCPPMH")]
        public string DeleteCPPMH([FromUri] string para, string para1)
        {
            return _model.DeleteCPPMH(para, para1);
        }

        [HttpDelete]
        [Route("DeleteDotPMH")]
        public string DeleteDotPMH([FromUri] string para, string para1, string para2, string para3, string para4)
        {
            return _model.DeleteDotPMH(para, para1, para2, para3, para4);
        }
        #endregion
        /// INVOICE
        /// 
        #region invoice
        [HttpGet]
        [Route("GetInvoice")]
        public DataTable GetInvoice(string action, string para, string para1, string para2, string para3, string para4, string para5)
        {
            return _model.GetInvoice(action, para, para1, para2, para3, para4, para5);
        }
        [HttpPost]
        [Route("PostInvoice")]
        public string PostInvoice(DataTable tbl)
        {
            return _model.PostInvoice(tbl);
        }
        [HttpDelete]
        [Route("DeleteInvoice")]
        public string DeleteInvoice(int parameter)
        {
            return _model.DeleteInvoice(parameter);
        }
        #endregion
        #region QC
        // ghichu

        [HttpPost]
        [Route("PostGhiChuNL")]
        public string PostGhiChuNL(DataTable tbl)
        {
            return _model.PostGhiChuNL(tbl);
        }

        [HttpPost]
        [Route("PostGhiChuPL")]
        public string PostGhiChuPL(DataTable tbl)
        {
            return _model.PostGhiChuPL(tbl);
        }
        #endregion
        #region phieumuahangMMTB
        [HttpGet]
        [Route("GePMHMMTB")]
        public DataTable GetPMHMMTB(string action, string para1, string para2, string para3, string para4, string para5)
        {
            return _model.GetPhieuMuaHangMMTB(action, para1, para2, para3, para4, para5);
        }

        [HttpPost]
        [Route("PospmhMMTB")]
        public string PostpmhMMTB(DataTable tbl)
        {
            return _model.PostPMHMMTB(tbl);
        }

        [HttpPost]
        [Route("PostDotGHPMHMMTB")]
        public string PostDotGHPMHMMTB(DataTable tbl)
        {
            return _model.PostDotGHPMHMMTB(tbl);
        }

        [HttpPost]
        [Route("PospXNMMTB")]
        public string PospXNMMTB(DataTable tbl)
        {
            return _model.PostXNMMTB(tbl);
        }
        #endregion


        #region Thư viện mua hàng
        [HttpPost]
        [Route("PostCang")]
        public string PostCang([FromBody] DataTable tbl)
        {
            return _model.PostCang(tbl);
        }
        [HttpPost]
        [Route("PostTau")]
        public string PostTau([FromBody] DataTable tbl)
        {
            return _model.PostTau(tbl);
        }

        #endregion

        #region E Invoice Phiếu mua hàng
        [HttpPost]
        [Route("PostEInvoice")]
        public string PostEInvoice([FromBody] DataTable tbl,string action = "PostEInvoice")
        {
            if(tbl != null && !tbl.Columns.Contains("IsFreeCost"))
            {
                tbl.Columns.Add("IsFreeCost", typeof(bool));

            }
            return _model.PostEInvoice(action,tbl);
        }

        #endregion


        #region Incoterms PO Mua
        private ERPPOMH_IncotermModel _modelIncoterm = new ERPPOMH_IncotermModel();
        [HttpGet]
        [Route("Incoterm/GET")]
        public async Task<DataTable> GET(string action, string para1 = null, string para2 = null, string para3 = null, string para4 = null, string para5 = null)
        {
            para1 = para1 ?? "NONE";
            para2 = para2 ?? "NONE";
            para3 = para3 ?? "NONE";
            para4 = para4 ?? "NONE";
            para5 = para5 ?? "NONE";
            return await _modelIncoterm.Get(action, para1, para2, para3, para4, para5);
        }


        [HttpDelete]
        [Route("Incoterm/Delete")]
        public async Task<string> Delete(string action, string Para1, string Para2 = null)
        {
            Para1 = Para1 ?? "NONE";
            Para2 = Para2 ?? "NONE";
            return await _modelIncoterm.Delete(action, Para1, Para2);
        }

        [HttpPost]
        [Route("Incoterm/Post")]
        public async Task<string> PostVanChuyen([FromBody] string Json)
        {
            if(Json == "[]")
            {
                return "false";
            }

            DataTable dsSave = JsonConvert.DeserializeObject<DataTable>(Json);
            return await _modelIncoterm.Post(dsSave);
        }

        #endregion



        [HttpPost]
        [Route("GetBody")]
        public  DataTable GetBody([FromBody] GetRequestEntity request)
        {
            return  _model.GetPhieuMuaHang(
                request.Action ?? "NONE",
                request.Para1 ?? "NONE",
                request.Para2 ?? "NONE",
                request.Para3 ?? "NONE",
                request.Para4 ?? "NONE",
                request.Para5 ?? "NONE");
        }
    }
}