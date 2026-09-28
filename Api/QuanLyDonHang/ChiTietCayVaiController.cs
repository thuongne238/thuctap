using Newtonsoft.Json;
using NtbSoft.ERP.Model.QuanLyDonHang;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace NtbSoft.ERP.Web.Api.QuanLyDonHang
{
    [RoutePrefix("api/chitiet")]
    public class ChiTietCayVaiController : ApiController
    {
        ChiTietCayVai _model = new ChiTietCayVai();

        [HttpGet]
        [Route("get")]
        public DataTable Get(string action, string para1 = null, string para2 = null, string para3 = null, string para4 = null, string para5 = null)
        {
            return _model.Get(action, para1, para2, para3, para4, para5);
        }

        [HttpPost]
        [Route("postcayvaicapphat")]
        public string PostCayVaiVaoCapPhat([FromBody] DataTable objectCayVai, string param1 = null, string param2 = null, string param3 = null, string param4 = null,
                string param5 = null, string param6 = null, string param7 = null)
        {
            if (objectCayVai == null) return "false";

            if (objectCayVai.Columns.Count == 0)
            {
                objectCayVai.Columns.Add("MaVTID");
                objectCayVai.Columns.Add("MaVT");
                objectCayVai.Columns.Add("MauVTID");
                objectCayVai.Columns.Add("MauVT");
                objectCayVai.Columns.Add("KhoVaiID");
                objectCayVai.Columns.Add("KhoVai");
                objectCayVai.Columns.Add("MaNhom");
                objectCayVai.Columns.Add("TenCL");
                objectCayVai.Columns.Add("MaDVVT");
                objectCayVai.Columns.Add("TenDVVT");
                objectCayVai.Columns.Add("SoLoID");
                objectCayVai.Columns.Add("MaNPL");
                objectCayVai.Columns.Add("SoKienHienThi");
                objectCayVai.Columns.Add("SoLuongThucTe", typeof(decimal));
                objectCayVai.Columns.Add("BarCode");
                objectCayVai.Columns.Add("SoLoT");
                objectCayVai.Columns.Add("Batch");
                objectCayVai.Columns.Add("NgayNhap", typeof(DateTime));
                objectCayVai.Columns.Add("MaONPL");
                objectCayVai.Columns.Add("POMua");
                objectCayVai.Columns.Add("NguoiTao");
                objectCayVai.Columns.Add("NgayTao", typeof(DateTime));
                objectCayVai.Columns.Add("MaLenhSX");
                objectCayVai.Columns.Add("MaDH");
                objectCayVai.Columns.Add("IsNPL", typeof(int));
                objectCayVai.Columns.Add("BanCat");
                objectCayVai.Columns.Add("MaCode");
            }

            string json = JsonConvert.SerializeObject(objectCayVai);
            DataTable tbDinhMuc = JsonConvert.DeserializeObject<DataTable>(json);
            return _model.PostCayVaiVaoCapPhat(objectCayVai, param1, param2, param3, param4, param5, param6, param7);
        }
    }
}
