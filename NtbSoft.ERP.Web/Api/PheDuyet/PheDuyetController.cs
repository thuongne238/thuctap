using System.Web.Http;
using System.Threading.Tasks;
using System.Data;
using NtbSoft.ERP.Entity.PheDuyet;
using Newtonsoft.Json;
using System.Collections.Generic;
using NtbSoft.ERP.Model.QuanLyDonHang;
using System.Linq;
using System;
using NtbSoft.ERP.Model.PheDuyet;
using Newtonsoft.Json.Linq;
using System.Net;
using NtbSoft.ERP.Entity.SYSTEM;
using System.IO;
using System.Drawing;
using System.Web;

namespace NtbSoft.ERP.Web.Api.PheDuyet
{
    [RoutePrefix("api/PheDuyet")]
    public class PheDuyetController : ApiController
    {

        private PheDuyetModel _model = new PheDuyetModel();
        private PheDuyetTNCModel _modelTNC = new PheDuyetTNCModel();

        [HttpGet]
        [Route("GET")]
        public async Task<DataTable> GET(string action, string para1 = null, string para2 = null, string para3 = null, string para4 = null, string para5 = null)
        {
            para1 = para1 ?? "NONE";
            para2 = para2 ?? "NONE";
            para3 = para3 ?? "NONE";
            para4 = para4 ?? "NONE";
            para5 = para5 ?? "NONE";
            return await _model.Get(action, para1, para2, para3, para4, para5);
        }
        [HttpGet]
        [Route("GETDS")]
        public async Task<DataSet> GETDS(string action, string para1 = null, string para2 = null, string para3 = null, string para4 = null, string para5 = null)
        {
            para1 = para1 ?? "NONE";
            para2 = para2 ?? "NONE";
            para3 = para3 ?? "NONE";
            para4 = para4 ?? "NONE";
            para5 = para5 ?? "NONE";
            return await _model.GETDS(action, para1, para2, para3, para4, para5);
        }


        [HttpPost]
        [Route("Post")]
        public async Task<string> Post(List<PheDuyetPhieuEntity> lstPheDuyetPhieu)
        {
            if (lstPheDuyetPhieu == null) return "false";
            string json = JsonConvert.SerializeObject(lstPheDuyetPhieu);
            DataTable tblSave = JsonConvert.DeserializeObject<DataTable>(json);
            return await _model.Post(lstPheDuyetPhieu[0].Action, tblSave);
        }


        [HttpPost]
        [Route("PostDanhGiaNCC")]
        public async Task<string> PostDanhGiaNCC(List<XacNhanDanhGiaNhaCCEntiy> lstPheDuyetPhieu)
        {
            if (lstPheDuyetPhieu == null) return "false";
            string json = JsonConvert.SerializeObject(lstPheDuyetPhieu);
            DataTable tblSave = JsonConvert.DeserializeObject<DataTable>(json);
            return await _model.PostDanhGiaNCC(tblSave);
        }


        #region BOM
        [HttpGet]
        [Route("GETBOM")]
        public DataTable GETBOM(string para1 = null, string para2 = null, string para3 = null, string para4 = null, string para5 = null)
        {

            DataTable dtResult = new DataTable();
            // Add ALL fixed columns
            dtResult.Columns.Add("ID", typeof(int));
            dtResult.Columns.Add("MaHang", typeof(string));
            dtResult.Columns.Add("MaKH", typeof(string));
            dtResult.Columns.Add("MaNhom", typeof(string));
            dtResult.Columns.Add("TenNhom", typeof(string));
            dtResult.Columns.Add("NPL", typeof(bool));
            dtResult.Columns.Add("Sort", typeof(int));
            dtResult.Columns.Add("MaVTID", typeof(string));
            dtResult.Columns.Add("MaVT", typeof(string));
            dtResult.Columns.Add("ChiTiet", typeof(string));
            dtResult.Columns.Add("MaDVVT", typeof(string));
            dtResult.Columns.Add("TenDVVT", typeof(string));
            dtResult.Columns.Add("MaMauVT", typeof(string));
            dtResult.Columns.Add("MauVT", typeof(string));
            dtResult.Columns.Add("GhiChu", typeof(string));
            dtResult.Columns.Add("STT", typeof(long));
            dtResult.Columns.Add("KhoVaiID", typeof(string));
            dtResult.Columns.Add("KhoVai", typeof(string));
            dtResult.Columns.Add("TachMau", typeof(bool));
            dtResult.Columns.Add("DinhMucHaoHut", typeof(decimal));
            dtResult.Columns.Add("DinhMucChung", typeof(decimal));
            dtResult.Columns.Add("TrangThai", typeof(string));
            dtResult.Columns.Add("MaCode", typeof(string));
            dtResult.Columns.Add("STTCode", typeof(int));
            dtResult.Columns.Add("IsActive", typeof(bool));
            dtResult.Columns.Add("MaNhomChiTiet", typeof(string));
            dtResult.Columns.Add("MauVTIDChung", typeof(string));
            dtResult.Columns.Add("MaSizeChung", typeof(string));
            dtResult.Columns.Add("Size", typeof(string));
            dtResult.Columns.Add("IsNew", typeof(int));
            dtResult.Columns.Add("TenNhomChiTiet", typeof(string));


            try
            {
                para1 = para1 ?? "";
                para2 = para2 ?? "";
                para3 = para3 ?? "";
                para4 = para4 ?? "";
                para5 = para5 ?? "";

                KhoiTaoBOMV1Model _modelBOM = new KhoiTaoBOMV1Model();
                DataTable dtMain = _modelBOM.Get("GETVTSP_V1", para1, para2, para3, "", "", "", "", "", "", "");



                if (dtMain != null && dtMain?.Rows?.Count == 0)
                {
                    return dtResult;
                }
                DataTable tblAllSize = _modelBOM.Get("GETSIZESP", para1, para2, "", "", "", "", "", "", "", "");
                DataTable dtSize = _modelBOM.Get("GETSIZESP_V1", para1, para2, para3, "", "", "", "", "", "", "");
                DataTable dtColorMap = _modelBOM.Get("GETMAUSP_V1", para1, para2, para3, "", "", "", "", "", "", "");
                DataTable dtColors = _modelBOM.Get("GETBANGMAU_V1", para1, para2, para3, "", "", "", "", "", "", "");
                DataTable tblChungLoaiChiTiet = _modelBOM.Get("GETCHUNGLOAICHITIET", "", "", "", "", "", "", "", "", "", "");
                DataTable tblMauVT = _modelBOM.Get("GETMAUVTTV", "", "", "", "", "", "", "", "", "", "");

                // Add dynamic color columns
                var colorColumnMapping = new Dictionary<string, string>();
                foreach (DataRow colorRow in dtColors.Rows)
                {
                    string maMau = colorRow["MaMau"].ToString();
                    string tenMau = colorRow["TenMau"].ToString();
                    string columnName = $"{tenMau}@Mau@{maMau}";

                    if (!dtResult.Columns.Contains(columnName))
                    {
                        dtResult.Columns.Add(columnName, typeof(string));
                        colorColumnMapping.Add(columnName, maMau);
                    }
                }

                var groupedData = dtMain.AsEnumerable()
                              .GroupBy(r => new
                              {
                                  MaHang = r["MaHang"]?.ToString() ?? "",
                                  MaKH = r["MaKH"]?.ToString() ?? "",
                                  MaNhom = r["MaNhom"]?.ToString() ?? "",
                                  TenNhom = r["TenNhom"]?.ToString() ?? "",
                                  NPL = r["NPL"] != DBNull.Value ? Convert.ToBoolean(r["NPL"]) : false,
                                  Sort = r["Sort"] != DBNull.Value ? Convert.ToInt32(r["Sort"]) : 0,
                                  MaVTID = r["MaVTID"]?.ToString() ?? "",
                                  MaVT = r["MaVT"]?.ToString() ?? "",
                                  ChiTiet = r["ChiTiet"]?.ToString() ?? "",
                                  MaDVVT = r["MaDVVT"]?.ToString() ?? "",
                                  TenDVVT = r["TenDVVT"]?.ToString() ?? "",
                                  GhiChu = r["GhiChu"]?.ToString() ?? "",
                                  STT = r["STT"] != DBNull.Value ? Convert.ToInt64(r["STT"]) : 0L,
                                  KhoVaiID = r["KhoVaiID"]?.ToString() ?? "",
                                  IsKV = r["IsKV"] != DBNull.Value ? Convert.ToBoolean(r["IsKV"]) : false,
                                  KhoVai = r["KhoVai"]?.ToString() ?? "",
                                  MaTheSize = r["MaTheSize"]?.ToString() ?? "",
                                  TachMau = r["TachMau"] != DBNull.Value ? Convert.ToBoolean(r["TachMau"]) : false,
                                  DinhMucHaoHut = r["DinhMucHaoHut"] != DBNull.Value ? Convert.ToDecimal(r["DinhMucHaoHut"]) : 0m,
                                  DinhMucChung = r["DinhMucChung"] != DBNull.Value ? Convert.ToDecimal(r["DinhMucChung"]) : 0m,
                                  TrangThai = r["IsXetDuyet"]?.ToString() ?? "",
                                  MaCode = r["MaCode"]?.ToString() ?? "",
                                  STTCode = r["STTCode"] != DBNull.Value ? Convert.ToInt32(r["STTCode"]) : 0,
                                  IsActive = r["IsActive"] != DBNull.Value ? Convert.ToBoolean(r["IsActive"]) : false,
                                  MaNhomChiTiet = r["MaNhomChiTiet"]?.ToString() ?? "",
                                  MaDot = r["MaDot"]?.ToString() ?? ""
                              })
                                  .OrderBy(g => g.Key.Sort)
                                  .ThenBy(g => g.Key.STT);

                int id = 1;
                foreach (var group in groupedData)
                {
                    string TenNhomCTCT = string.Empty;
                    if (tblChungLoaiChiTiet != null || tblChungLoaiChiTiet?.Rows?.Count > 0)
                    {
                        var Query = tblChungLoaiChiTiet.AsEnumerable().FirstOrDefault(x => x["MaNhomChiTiet"]?.ToString() == group.Key.MaNhomChiTiet);
                        if (Query != null)
                        {
                            TenNhomCTCT = Query["TenNhomChiTiet"]?.ToString();
                        }
                    }
                    DataRow resultRow = dtResult.NewRow();

                    // Fill fixed columns từ group key
                    resultRow["ID"] = id++;
                    resultRow["MaHang"] = group.Key.MaHang;
                    resultRow["MaKH"] = group.Key.MaKH;
                    resultRow["MaNhom"] = group.Key.MaNhom;
                    resultRow["TenNhom"] = group.Key.TenNhom;
                    resultRow["NPL"] = group.Key.NPL;
                    resultRow["Sort"] = group.Key.Sort;
                    resultRow["MaVTID"] = group.Key.MaVTID;
                    resultRow["MaVT"] = group.Key.MaVT;
                    resultRow["ChiTiet"] = group.Key.ChiTiet;
                    resultRow["MaDVVT"] = group.Key.MaDVVT;
                    resultRow["TenDVVT"] = group.Key.TenDVVT;
                    //resultRow["MauVTIDChung"] = group.Key.MauVTIDChung;// tôi mới bổ sung
                    resultRow["MauVTIDChung"] = group.First()["MauVTIDChung"]?.ToString() ?? "";
                    //resultRow["MauVT"] = group.Key.MauVT;
                    resultRow["GhiChu"] = group.Key.GhiChu;
                    resultRow["STT"] = group.Key.STT;
                    resultRow["KhoVaiID"] = group.Key.KhoVaiID;
                    resultRow["KhoVai"] = group.Key.KhoVai;
                    resultRow["TachMau"] = group.Key.TachMau;
                    resultRow["DinhMucHaoHut"] = group.Key.DinhMucHaoHut;
                    resultRow["DinhMucChung"] = group.Key.DinhMucChung;
                    resultRow["TrangThai"] = group.Key.TrangThai;
                    resultRow["MaCode"] = group.Key.MaCode;
                    resultRow["STTCode"] = group.Key.STTCode;
                    resultRow["IsActive"] = group.Key.IsActive;
                    resultRow["MaNhomChiTiet"] = group.Key.MaNhomChiTiet;
                    resultRow["IsNew"] = 0;
                    resultRow["TenNhomChiTiet"] = TenNhomCTCT;

                    // -------- XỬ LÝ MauVTIDChung: STUFF tất cả MauVTID trong group --------
                    var mauVTIDs = group
                        .Select(r => r["MauVTID"].ToString())
                        .Distinct()
                        .OrderBy(x => x);
                    //resultRow["MauVTIDChung"] = string.Join(", ", mauVTIDs);

                    // -------- XỬ LÝ Size Data --------
                    var sizeGroups = dtSize.AsEnumerable()
                        .Where(r => r["MaVTID"].ToString() == group.Key.MaVTID
                            && r["MaNhom"].ToString() == group.Key.MaNhom
                            && r["KhoVaiID"].ToString() == group.Key.KhoVaiID
                              && r["MaCode"].ToString() == group.Key.MaCode)
                        .GroupBy(r => new
                        {
                            MaNhomSize = r["MaNhomSize"].ToString(),
                            NhomSize = r["NhomSize"] != DBNull.Value ? r["NhomSize"].ToString() : r["MaNhomSize"].ToString()
                        })
                        .OrderBy(g => g.Key.MaNhomSize);

                    var maSizeChungParts = new List<string>();
                    var sizeChungParts = new List<string>();

                    foreach (var sizeGroup in sizeGroups)
                    {
                        var sizes = sizeGroup
                            .OrderBy(r => Convert.ToInt32(r["Sort"]))
                            .ThenBy(r => r["MaSize"].ToString())
                            .Select(r => r["MaSize"].ToString())
                            .Distinct();

                        var tenSizes = sizeGroup
                            .OrderBy(r => Convert.ToInt32(r["Sort"]))
                            .ThenBy(r => r["TenSize"] != DBNull.Value ? r["TenSize"].ToString() : r["MaSize"].ToString())
                            .Select(r => r["TenSize"] != DBNull.Value ? r["TenSize"].ToString() : r["MaSize"].ToString())
                            .Distinct();

                        maSizeChungParts.Add($"{sizeGroup.Key.MaNhomSize}: {string.Join(", ", sizes)}");
                        sizeChungParts.Add($"{sizeGroup.Key.NhomSize}: {string.Join(", ", tenSizes)}");
                    }

                    resultRow["MaSizeChung"] = string.Join("; ", maSizeChungParts);
                    resultRow["Size"] = string.Join("; ", sizeChungParts);

                    // -------- XỬ LÝ KhoVai/Size based on IsKV --------
                    if (!group.Key.IsKV)
                    {
                        var sizeInfo = dtSize.AsEnumerable()
                            .FirstOrDefault(r => r["MaSize"].ToString() == group.Key.KhoVaiID);

                        if (sizeInfo != null)
                        {
                            resultRow["KhoVaiID"] = sizeInfo["MaSize"].ToString();
                            resultRow["KhoVai"] = sizeInfo["TenSize"] != DBNull.Value
                                ? sizeInfo["TenSize"].ToString()
                                : group.Key.KhoVai;
                        }
                    }

                    // -------- XỬ LÝ PIVOT COLOR COLUMNS --------
                    // Initialize tất cả color columns = empty
                    foreach (var kvp in colorColumnMapping)
                    {
                        resultRow[kvp.Key] = "";
                    }

                    // Duyệt qua tất cả rows trong group để fill MauVTID vào đúng color column
                    // LẤY DANH SÁCH MauVTID của group này từ dtColorMap
                    var colorMappingsForGroup = dtColorMap.AsEnumerable()
                        .Where(r => r["MaVTID"].ToString() == group.Key.MaVTID
                            && r["MaNhom"].ToString() == group.Key.MaNhom
                            && r["KhoVaiID"].ToString() == group.Key.KhoVaiID
                             && r["MaCode"].ToString() == group.Key.MaCode)
                        .ToList();

                    // Duyệt qua từng mapping để fill vào đúng cột màu
                    foreach (DataRow colorMapping in colorMappingsForGroup)
                    {
                        string mauVTID = colorMapping["MauVTID"].ToString();
                        string maMau = colorMapping["MaMau"].ToString();
                        string tenMau = colorMapping["TenMau"].ToString();
                        // Tìm column name tương ứng với MaMau này
                        var matchedColumn = colorColumnMapping.FirstOrDefault(x => x.Value == maMau);

                        if (!string.IsNullOrEmpty(matchedColumn.Key))
                        {
                            // Fill MauVTID vào column tương ứng
                            string currentValue = resultRow[matchedColumn.Key].ToString();
                            if (string.IsNullOrEmpty(currentValue))
                            {
                                string TenMau = string.Empty;
                                if (tblMauVT != null || tblMauVT?.Rows?.Count > 0)
                                {
                                    var Query = tblMauVT.AsEnumerable().FirstOrDefault(x => x["MauVTID"]?.ToString() == mauVTID);
                                    if (Query != null)
                                    {
                                        TenMau = Query["MaMauVT"]?.ToString();
                                    }
                                }

                                resultRow[matchedColumn.Key] = TenMau;
                            }
                            //else
                            //{
                            //    // Nếu đã có giá trị thì append (trường hợp 1 màu có nhiều MauVTID)
                            //    resultRow[matchedColumn.Key] = currentValue + ", " + mauVTID;
                            //}
                            // tôi mới comneent lại 
                        }
                    }

                    dtResult.Rows.Add(resultRow);
                }
                ProcessSizeData(dtResult, tblAllSize);
            }
            catch (Exception ex)
            {

            }

            return dtResult;
        }

        private void ProcessSizeData(DataTable tbl, DataTable tblAllSize)
        {
            // Lấy tất cả cặp MaNhomSize-MaSize từ tblAllSize
            HashSet<string> allSizePairs = new HashSet<string>();

            foreach (DataRow row in tblAllSize.Rows)
            {
                string maNhomSize = row["MaNhomSize"].ToString().Trim();
                string maSize = row["MaSize"].ToString().Trim();

                if (!string.IsNullOrEmpty(maNhomSize) && !string.IsNullOrEmpty(maSize))
                {
                    string pair = $"{maNhomSize}-{maSize}";
                    allSizePairs.Add(pair);
                    Console.WriteLine($"  - '{pair}'");
                }
            }

            Console.WriteLine($"\nTổng số cặp MaNhomSize-MaSize trong tblAllSize: {allSizePairs.Count}\n");

            // Duyệt qua từng dòng trong tbl
            foreach (DataRow row in tbl.Rows)
            {
                string maSizeChung = row["MaSizeChung"].ToString();

                HashSet<string> sizePairsInRow = new HashSet<string>();

                // Tách chuỗi MaSizeChung theo format: "MaNhomSize1:MaSize1,MaSize2;MaNhomSize2:MaSize3,MaSize4"
                string[] nhomSizes = maSizeChung.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries);

                foreach (string nhomSize in nhomSizes)
                {
                    string[] parts = nhomSize.Split(':');
                    if (parts.Length == 2)
                    {
                        string maNhomSize = parts[0].Trim();

                        // Lấy các MaSize và ghép với MaNhomSize
                        string[] maSizes = parts[1].Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
                        foreach (string maSize in maSizes)
                        {
                            string trimmedMaSize = maSize.Trim();
                            if (!string.IsNullOrEmpty(maNhomSize) && !string.IsNullOrEmpty(trimmedMaSize))
                            {
                                string pair = $"{maNhomSize}-{trimmedMaSize}";
                                sizePairsInRow.Add(pair);
                                Console.WriteLine($"  + Thêm: '{pair}'");
                            }
                        }
                    }
                }

                Console.WriteLine($"\nTổng số cặp tìm được: {sizePairsInRow.Count}");

                // Tìm cặp thiếu
                var missingPairs = allSizePairs.Except(sizePairsInRow).ToList();
                if (missingPairs.Any())
                {
                    Console.WriteLine("Cặp MaNhomSize-MaSize thiếu:");
                    foreach (var missing in missingPairs)
                    {
                        Console.WriteLine($"  - '{missing}'");
                    }
                }

                // Tìm cặp thừa
                var extraPairs = sizePairsInRow.Except(allSizePairs).ToList();
                if (extraPairs.Any())
                {
                    Console.WriteLine("Cặp MaNhomSize-MaSize thừa (không có trong tblAllSize):");
                    foreach (var extra in extraPairs)
                    {
                        Console.WriteLine($"  - '{extra}'");
                    }
                }

                // So sánh với allSizePairs
                bool isAllSize = allSizePairs.SetEquals(sizePairsInRow);
                Console.WriteLine($"\nKết quả: IsAllSize = {isAllSize}");

                if (isAllSize)
                {
                    row["Size"] = "All Size";
                    Console.WriteLine("=> Đã cập nhật Size = 'All Size'");
                }

                Console.WriteLine("===============================\n");
            }
        }
        #endregion

        #region Code TNC

        [HttpGet]
        [Route("GET_TNC")]
        public async Task<DataTable> GET_TNC(string CodeTNC,string MaLenh)
        {
            string _StrSPOID = string.Empty, _StrSizeTypeID = string.Empty, _StrMaMau = string.Empty;
            DataTable tblParameterTNC = await _modelTNC.GetParameterTNC(CodeTNC);
            bool _isRebuildingColumns = true;
            bool IsTachNhomSize = false;
            int ValSTT = 0;
            TNCEntity objTNC = new TNCEntity();
            if (tblParameterTNC!=null && tblParameterTNC?.Rows?.Count > 0)
            {
                bool.TryParse(tblParameterTNC.Rows[0]["TachNhomSize"]?.ToString(),out IsTachNhomSize);
                _StrSPOID = string.Join(";", tblParameterTNC.AsEnumerable().Select(x => x["SPOID"]));              
                _StrMaMau = string.Join(";", tblParameterTNC.AsEnumerable().Select(x => x["MaMau"]?.ToString()).Where(x => !string.IsNullOrEmpty(x)).Distinct());             
                _StrSizeTypeID = string.Join(";", tblParameterTNC.AsEnumerable().Select(x => x["DauSizeID"]?.ToString()).Where(x => !string.IsNullOrEmpty(x)).Distinct());
                DataTable dtSize = await _modelTNC.GetSize(MaLenh, _StrSizeTypeID, _StrSPOID, _StrMaMau);
                string _StrSize = string.Empty;
                bool AllowAddColum = true;
                int _valuIndedx = 3;
                if (dtSize!= null && dtSize?.Rows?.Count > 0)
                {
                    if (IsTachNhomSize)
                    {
                        string sizeTypeOrder = _StrSizeTypeID;
                        var orderMap = sizeTypeOrder
                                                .Split(';')
                                                .Select((v, i) => new { v, i })
                                                .ToDictionary(x => x.v, x => x.i);
                        if (!dtSize.Columns.Contains("SizeTypeOrder"))
                            dtSize.Columns.Add("SizeTypeOrder", typeof(int));
                        foreach (DataRow row in dtSize.Rows)
                        {
                            string sizeTypeID = row["SizeTypeID"].ToString();

                            row["SizeTypeOrder"] = orderMap.ContainsKey(sizeTypeID)
                                ? orderMap[sizeTypeID]
                                : int.MaxValue;   // các SizeTypeID không nằm trong chuỗi → đẩy xuống cuối
                        }
                        DataView dv = dtSize.DefaultView;
                        dv.Sort = "SizeTypeOrder ASC";

                        dtSize = dv.ToTable();
                        dtSize.Columns.Remove("SizeTypeOrder");
                    }
                    _isRebuildingColumns = false;
                    if (objTNC.tblDetail_TNC.Columns.Count > 15)
                    {
                        for (int i = objTNC.tblDetail_TNC.Columns.Count - 1; i > 17; i--)
                        {
                            objTNC.tblDetail_TNC.Columns.RemoveAt(i);
                        }
                        objTNC.tblDetail_TNC.Clear();
                   
                      
                        
                    }
                    _isRebuildingColumns = true;
                    if (!IsTachNhomSize)
                    {
                        foreach (DataRow row in dtSize.Rows)
                        {
                            row["SizeTypeID"] = DBNull.Value;   // hoặc 0 nếu là số
                            row["SizeType"] = DBNull.Value;    // hoặc string.Empty
                        }

                        // Loại bỏ các dòng trùng nhau
                        dtSize = dtSize.DefaultView.ToTable(true);
                    }
                    for (int i = 0; i < dtSize.Rows.Count; i++)
                    {
                        if (string.IsNullOrEmpty(_StrSize))
                        {
                            _StrSize = dtSize.Rows[i]["Size"].ToString();
                        }
                        else
                        {
                            _StrSize = _StrSize + "; " + dtSize.Rows[i]["Size"].ToString();
                        }
                        if (!ColumnExists(dtSize.Rows[i]["Size"].ToString() + "@" + dtSize.Rows[i]["SizeID"].ToString(), objTNC.tblDetail_TNC))
                        {
                            AllowAddColum = true;
                            if (!IsTachNhomSize)
                            {
                                objTNC.tblDetail_TNC.Columns.Add(dtSize.Rows[i]["Size"].ToString() + "@" + dtSize.Rows[i]["SizeID"].ToString(), typeof(int));
                            }
                            else
                            {
                                objTNC.tblDetail_TNC.Columns.Add(dtSize.Rows[i]["Size"].ToString() + "@" + dtSize.Rows[i]["SizeID"].ToString() + "@" + dtSize.Rows[i]["SizeTypeID"].ToString(), typeof(int));
                            }
                        }
                        else
                        {
                            AllowAddColum = false;
                        }
                       
                    }

                    if (objTNC.tblDetail_TNC.Rows.Count == 0)
                    {
                        try
                        {



                  DataTable dtSoDo = await _modelTNC.GetSoDoEdit(CodeTNC);
                 if (dtSoDo != null && dtSoDo?.Rows?.Count != 0)
                            {
                                if (IsTachNhomSize)
                                {
                                    string sizeTypeOrder = _StrSizeTypeID;
                                    var orderMap = sizeTypeOrder
                                                            .Split(';')
                                                            .Select((v, i) => new { v, i })
                                                            .ToDictionary(x => x.v, x => x.i);
                                    if (!dtSize.Columns.Contains("SizeTypeOrder"))
                                        dtSize.Columns.Add("SizeTypeOrder", typeof(int));
                                    foreach (DataRow row in dtSize.Rows)
                                    {
                                        string sizeTypeID = row["SizeTypeID"].ToString();

                                        row["SizeTypeOrder"] = orderMap.ContainsKey(sizeTypeID)
                                            ? orderMap[sizeTypeID]
                                            : int.MaxValue;   // các SizeTypeID không nằm trong chuỗi → đẩy xuống cuối
                                    }
                                    DataView dv = dtSize.DefaultView;
                                    dv.Sort = "SizeTypeOrder ASC";

                                    dtSize = dv.ToTable();
                                    dtSize.Columns.Remove("SizeTypeOrder");
                                }



                                if (objTNC.tblDetail_TNC.Columns.Count > 15)
                                {
                                    for (int i = objTNC.tblDetail_TNC.Columns.Count - 1; i > 17; i--)
                                    {
                                        objTNC.tblDetail_TNC.Columns.RemoveAt(i);
                                    }
                                    objTNC.tblDetail_TNC.Clear();


                                }
                                _isRebuildingColumns = true;
                                if (!IsTachNhomSize)
                                {
                                    foreach (DataRow row in dtSize.Rows)
                                    {
                                        row["SizeTypeID"] = DBNull.Value;   // hoặc 0 nếu là số
                                        row["SizeType"] = DBNull.Value;    // hoặc string.Empty
                                    }

                                    // Loại bỏ các dòng trùng nhau
                                    dtSize = dtSize.DefaultView.ToTable(true);
                                }

                                for (int i = 0; i < dtSize.Rows.Count; i++)
                                {
                                    if (string.IsNullOrEmpty(_StrSize))
                                    {
                                        _StrSize = dtSize.Rows[i]["Size"].ToString();
                                    }
                                    else
                                    {
                                        _StrSize = _StrSize + "; " + dtSize.Rows[i]["Size"].ToString();
                                    }
                                    if (!ColumnExists(dtSize.Rows[i]["Size"].ToString() + "@" + dtSize.Rows[i]["SizeID"].ToString(), objTNC.tblDetail_TNC)/*_dtData.Columns.Count <= dtSize.Rows.Count + 12*/)
                                    {
                                        AllowAddColum = true;
                                        //_dtData.Columns.Add(dtSize.Rows[i]["Size"].ToString() + "@" + dtSize.Rows[i]["SizeID"].ToString(), typeof(int));
                                        if (!IsTachNhomSize)
                                        {
                                            objTNC.tblDetail_TNC.Columns.Add(dtSize.Rows[i]["Size"].ToString() + "@" + dtSize.Rows[i]["SizeID"].ToString(), typeof(double));
                                        }
                                        else
                                        {
                                            objTNC.tblDetail_TNC.Columns.Add(dtSize.Rows[i]["Size"].ToString() + "@" + dtSize.Rows[i]["SizeID"].ToString() + "@" + dtSize.Rows[i]["SizeTypeID"].ToString(), typeof(double));
                                        }
                                    }
                                    else
                                    {
                                        AllowAddColum = false;
                                    }

                                }

                                if (!objTNC.tblDetail_TNC.Columns.Contains("IsTachNhomSize"))
                                {
                                    objTNC.tblDetail_TNC.Columns.Add("IsTachNhomSize", typeof(bool));
                                }


                                //colSoDo.Summary.Clear();
                                //colSoDo.Summary.Add(DevExpress.Data.SummaryItemType.Custom, "SoDo", "Tổng");
                                //colSoDo.Summary.Add(DevExpress.Data.SummaryItemType.Custom, "SoDo", "Còn lại");
                                //-- add dư liệu cũ vào
                                if (dtSoDo.Rows.Count > 0)
                                {
                                    double _valLK = 0;
                                    for (int i = 0; i < dtSoDo.Rows.Count; i++)
                                    {

                                        ValSTT++;
                                        DataRow _dr = objTNC.tblDetail_TNC.NewRow();
                                        _dr["STT"] = dtSoDo.Rows[i]["STT"].ToString();
                                        _dr["SoDo"] = dtSoDo.Rows[i]["SoDo"].ToString();
                                        _dr["SoLop"] = dtSoDo.Rows[i]["SoLop"].ToString();
                                        _dr["SoLuong"] = Convert.ToDouble(dtSoDo.Rows[i]["SoLuong"].ToString()) * Convert.ToDouble(dtSoDo.Rows[i]["SLSoDo"]) / Convert.ToDouble(dtSoDo.Rows[i]["SoLop_pcs"]);
                                        _dr["Dai"] = dtSoDo.Rows[i]["dai"].ToString();
                                        _dr["Rong"] = dtSoDo.Rows[i]["rong"].ToString();
                                        _dr["Mau"] = dtSoDo.Rows[i]["Mau"].ToString();
                                        _dr["MoTa"] = dtSoDo.Rows[i]["MoTa"].ToString();
                                        _dr["IsSave"] = dtSoDo.Rows[i]["IsSave"].ToString();
                                        _valLK += Convert.ToDouble(dtSoDo.Rows[i]["SoLuong"]) / Convert.ToDouble(dtSoDo.Rows[i]["SoLop_pcs"]);
                                        _dr["LuyKe"] = _valLK;
                                        _dr["Dai_DB"] = dtSoDo.Rows[i]["dai_db"].ToString();
                                        _dr["TieuHao"] = Convert.ToDouble(dtSoDo.Rows[i]["dai_db"]) * Convert.ToDouble(dtSoDo.Rows[i]["SoLop"]) * Convert.ToInt32(dtSoDo.Rows[i]["SLSoDo"]) /*/ Convert.ToDouble(dtSoDo.Rows[i]["SoLop_pcs"])*/;
                                        _dr["SoBo"] = dtSoDo.Rows[i]["SoLan"].ToString();
                                        _dr["IsTachBan"] = dtSoDo.Rows[i]["IsTachBan"].ToString();
                                        _dr["TT_TenSD"] = dtSoDo.Rows[i]["TT_TenSD"].ToString();
                                        _dr["SLSoDo"] = dtSoDo.Rows[i]["SLSoDo"].ToString();
                                        _dr["DMTT"] = dtSoDo.Rows[i]["DMTT"].ToString();
                                        _dr["CheckDuyetSD"] = dtSoDo.Rows[i]["CheckDuyetSD"].ToString();
                                        //-- xử lý sodo
                                        for (int z = 0; z < objTNC.tblDetail_TNC.Columns.Count; z++)
                                        {
                                            string[] arrSDName = dtSoDo.Rows[i]["SoDo"].ToString().Split(new char[] { ';' }, StringSplitOptions.RemoveEmptyEntries);
                                            bool contains = objTNC.tblDetail_TNC.Columns[z].ColumnName.Contains("@");
                                            if (contains)
                                            {
                                                for (int k = 0; k < arrSDName.Length; k++)
                                                {
                                                    string[] arrSDSize = arrSDName[k].Split(new char[] { '*' }, StringSplitOptions.RemoveEmptyEntries);
                                                    // kiểm tra và lấy sizeID trong danh sách size
                                                    DataRow rowFoundSizeID = null;
                                                    string[] arrDTSType = new string[] { string.Empty };
                                                    if (IsTachNhomSize)
                                                    {
                                                        arrDTSType = arrSDSize[0].Split(new char[] { '|' });
                                                        rowFoundSizeID = dtSize.AsEnumerable()
                                                                                .FirstOrDefault(r =>
                                                                                    r.Field<string>("Size") == arrDTSType[0] &&
                                                                                    r.Field<string>("SizeType") == arrDTSType[1]);
                                                    }
                                                    else
                                                    {
                                                        rowFoundSizeID = dtSize.AsEnumerable()
                                                                                    .FirstOrDefault(r => r["Size"].ToString() == arrSDSize[0].ToString());

                                                    }
                                                    //DataRow rowFoundSizeID = dtSize.AsEnumerable()
                                                    //.FirstOrDefault(r => r["Size"].ToString() == arrSDSize[0].ToString());
                                                    if (rowFoundSizeID != null)
                                                    {
                                                        var valSizeID = rowFoundSizeID["SizeID"].ToString();
                                                        //string _strSizename = arrSDSize[0].ToString().Trim() + "@" + valSizeID.Trim();
                                                        string _strSizename = string.Empty;
                                                        if (IsTachNhomSize)
                                                        {
                                                            _strSizename = arrDTSType[0].ToString().Trim() + "@" + valSizeID.Trim() + "@" + arrDTSType[1];
                                                        }
                                                        else
                                                        {
                                                            _strSizename = arrSDSize[0].ToString().Trim() + "@" + valSizeID.Trim();
                                                        }
                                                        if (_strSizename.Trim() == objTNC.tblDetail_TNC.Columns[z].ColumnName.ToString())
                                                        {
                                                            _dr[objTNC.tblDetail_TNC.Columns[z].ColumnName] = arrSDSize[1].Trim();
                                                        }
                                                    }

                                                }
                                            }
                                        }
                                        _dr["IsTachNhomSize"] = IsTachNhomSize;
                                        objTNC.tblDetail_TNC.Rows.Add(_dr);
                                    }
                                }
                            }






                            
                        }
                        catch (Exception ex)
                        {

                        }

                    }
                }
            }

          
            //objTNC.tblDetail_TNC 

            return objTNC.tblDetail_TNC;
        }
        
        private bool ColumnExists(string columnName,DataTable _dtData)
        {
            foreach (DataColumn column in _dtData.Columns)
            {
                if (column.ColumnName.Equals(columnName, StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }
            return false;
        }

        [HttpPost]
        [Route("GetCalculateTNC")]
        public async Task<DataTable> GetCalculateTNC([FromBody] JArray arrSoDo,string CodeTNC, string MaLenh)
        {

            string _StrSPOID = string.Empty, _StrSizeTypeID = string.Empty, _StrMaMau = string.Empty;
            DataTable tblParameterTNC = await _modelTNC.GetParameterTNC(CodeTNC);
            DataTable tblSummaryTNC = SetTNC_Sum(arrSoDo);
            try
            {
                if (tblParameterTNC != null && tblParameterTNC?.Rows?.Count > 0)
                {
                    double sumSoLop = 0, sumSLSoDo = 0, sumLuyKe = 0, sumTieuHao = 0;
                    _StrSPOID = string.Join(";", tblParameterTNC.AsEnumerable().Select(x => x["SPOID"]));
                    _StrMaMau = string.Join(";", tblParameterTNC.AsEnumerable().Select(x => x["MaMau"]?.ToString()).Where(x => !string.IsNullOrEmpty(x)).Distinct());
                    _StrSizeTypeID = string.Join(";", tblParameterTNC.AsEnumerable().Select(x => x["DauSizeID"]?.ToString()).Where(x => !string.IsNullOrEmpty(x)).Distinct());
                    DataTable dtSizeKH = await _modelTNC.GetSLDM(MaLenh, _StrSizeTypeID, _StrSPOID, _StrMaMau);

                    DataRow rowAmount = tblSummaryTNC.NewRow();
                    DataRow rowSum = tblSummaryTNC.NewRow();
                    DataRow rowRemain = tblSummaryTNC.NewRow();
                    rowRemain["SummaryType"] = "Remaining";
                    rowSum["SummaryType"] = "SUM";
                    rowAmount["SummaryType"] = "Amount";
                   foreach (DataColumn col in tblSummaryTNC.Columns)
                   {
                        if (col.ColumnName.Contains("@"))
                        {
                            double sumSLSize_SoDo = CalcSumSLSoDoSize(arrSoDo, col.ColumnName);
                            double sumSLSize_KeHoach = CalcSumSLKeHoachSize(dtSizeKH, col.ColumnName);
                            rowRemain[col.ColumnName] = sumSLSize_KeHoach - sumSLSize_SoDo;
                            rowSum[col.ColumnName] = sumSLSize_SoDo;
                            rowAmount[col.ColumnName] = sumSLSize_KeHoach;
                        }
                   }

                    tblSummaryTNC.Rows.Add(rowSum);
                    tblSummaryTNC.Rows.Add(rowRemain);
                    tblSummaryTNC.Rows.Add(rowAmount);


                }
            }
            catch(Exception ex)
            {

            }
          
            return tblSummaryTNC;

           

           
        }

        private double CalcSumSLSoDoSize(JArray arrSoDo,string colSize)
        {
            double result = 0;
            foreach (var item in arrSoDo)
            {
                double.TryParse(item["SoLop"]?.ToString(), out double SoLop);
                double.TryParse(item[colSize]?.ToString(), out double SLSizeSD);
                result += SLSizeSD* SoLop;

            }
            return result;
        }
        private double CalcSumSLKeHoachSize(DataTable dtSizeKH, string colSize)
        {
            double SLKH = 0;
            string[] arrSize = colSize.Split('@');
            string SizeID = arrSize[1];
            foreach(DataRow row in dtSizeKH.Rows)
            {
                foreach(DataColumn col in dtSizeKH.Columns)
                {
                    if (col.ColumnName.Contains("@"))
                    {
                        string colSizeID = col.ColumnName.Split('@')[2];
                        if(colSizeID == SizeID)
                        {
                            double.TryParse(row[col.ColumnName]?.ToString(), out double SLKH_T);
                            SLKH += SLKH_T;
                        }
                    }
                    
                }
            }
            return SLKH;
        }
        private DataTable SetTNC_Sum(JArray arrSoDo)
        {

            DataTable tblSummaryTNC = new DataTable();
            tblSummaryTNC.Columns.Add("SummaryType", typeof(string));
            

            if (arrSoDo == null || !arrSoDo.Any())
                return tblSummaryTNC;
         
            foreach (var col in ((JObject)arrSoDo[0]).Properties())
            {
                if (!tblSummaryTNC.Columns.Contains(col.Name) && col.Name.Contains("@"))
                {
                    tblSummaryTNC.Columns.Add(col.Name);
                }
               
            }


            return tblSummaryTNC;
        }

        /*Save Row Sơ Đồ Cắt*/
        [HttpPost]
        [Route("CheckDuyetSD")]
        public async Task<string> CheckDuyetSD(string CodeTNC, string MaLenh,bool IsDuyet,string UserName)
        {
            string res = "True";
            try
            {
                if (!IsDuyet)
                {
                    DataTable dtCheck = await _modelTNC.HasDataInHachToan(MaLenh, CodeTNC);
                    if (dtCheck != null && dtCheck.Rows.Count > 0)
                    {
                        res = "Không thể hủy duyệt!\nSơ đồ đã có dữ liệu hạch toán cắt.";
                        return res;
                    }
                }

                bool result = await _modelTNC.CheckDuyetSD(CodeTNC, IsDuyet);
                if (result)
                {
                    if (IsDuyet)
                    {
                        res = await SaveRows(CodeTNC, MaLenh, UserName);
                    }
                    else
                    {
                        res = await _modelTNC.Delete_ERP_GOP_PO(CodeTNC);
                    }
                   
                }
               

               
            }
            catch(Exception ex)
            {
                res = ex.Message.ToString();
            }
            return res;
        }
        private async Task<string> SaveRows(string CodeTNC, string MaLenh, string UserName)
        {
            try
            {
                string res = "True";
                string _StrSPOID = string.Empty, _StrSizeTypeID = string.Empty, _StrMaMau = string.Empty;
                string _mauvai = string.Empty;
                string _maKH = string.Empty;
                string _codeTNC = CodeTNC;
                string _maLenh = MaLenh;
                bool _allowMess = false;
                bool IsTachNhomSize = false;
                double _vlSumTieuHao = 0.0;
                double _vlDMTT = 0.0;
                DataTable dtSize = new DataTable();
                DataTable _dtData = await GET_TNC(CodeTNC, MaLenh);
                if (_dtData != null && _dtData?.Rows?.Count > 0)
                {
                    _vlSumTieuHao = _dtData.AsEnumerable()
                     .Sum(row =>
                     {
                         double value;
                         return double.TryParse(row["TieuHao"]?.ToString(), out value) ? value : 0;
                     });
                    double _ValTTSoSP = _dtData.AsEnumerable()
                     .Sum(row =>
                     {
                         double value;
                         return double.TryParse(row["SoLuong"]?.ToString(), out value) ? value : 0;
                     });
                    _vlDMTT = _ValTTSoSP == 0 ? 0 : (Math.Round(_vlSumTieuHao / _ValTTSoSP, 4));


                }
                DataTable tblParameterTNC = await _modelTNC.GetParameterTNC(CodeTNC);
                List<ErpHangHoaEntity> listHangHoa = new List<ErpHangHoaEntity>();
                listHangHoa = await _modelTNC.GetHangHoa(MaLenh);
                if (tblParameterTNC != null && tblParameterTNC?.Rows?.Count > 0)
                {
                    bool.TryParse(tblParameterTNC.Rows[0]["TachNhomSize"]?.ToString(), out IsTachNhomSize);
                    _StrSPOID = string.Join(";", tblParameterTNC.AsEnumerable().Select(x => x["SPOID"]));
                    _StrMaMau = string.Join(";", tblParameterTNC.AsEnumerable().Select(x => x["MaMau"]?.ToString()).Where(x => !string.IsNullOrEmpty(x)).Distinct());
                    _StrSizeTypeID = string.Join(";", tblParameterTNC.AsEnumerable().Select(x => x["DauSizeID"]?.ToString()).Where(x => !string.IsNullOrEmpty(x)).Distinct());
                    _maKH = tblParameterTNC.Rows[0]["MaKhachHang"]?.ToString();
                    dtSize = await _modelTNC.GetSize(MaLenh, _StrSizeTypeID, _StrSPOID, _StrMaMau);
                }

                List<ErpTNC_VpConfig> ListTNC_VP = new List<ErpTNC_VpConfig>();
                bool IsCheckClose = true;
                //string urlSD = string.Format("{0}/GetSoDoEdit?codetnc={1}", URL + ResourceURL.UrlErpNhap_TNC, _codeTNC);
                // DataTable dtSoDo = Task.Run(async () => { return await _serviceNhapTNC.GetNPL(urlSD); }).Result;
                DataTable dtSoDo = await _modelTNC.GetSoDoEdit(_codeTNC);
                string _StrPO = dtSoDo.Rows[0]["PO_Merg"].ToString();
                bool chkKHSX = Convert.ToBoolean(dtSoDo.Rows[0]["IsKHSX"]);
                string _nhomNPL = dtSoDo.Rows[0]["Status_V"].ToString();
                string _bancat = string.Empty;
                int _ValSB = 0, _valSoLuongSD = 0, demBancat = 1;
                for (int i = 0; i < _dtData.Rows.Count; i++)
                {
                    //_bancat = sttValuesList[i];
                    _valSoLuongSD = Convert.ToInt32(_dtData.Rows[i]["SLSoDo"]);
                    for (int k = 0; k < _valSoLuongSD; k++)
                    {
                        _bancat = demBancat.ToString();
                        if (_dtData.Rows[i]["SoDo"].ToString() != "" || _dtData.Rows[i]["SoLop"].ToString() != "")
                        {
                            //_ValSB = _ValSB + Convert.ToInt32(_dtData.Rows[i]["SoBo"].ToString());
                            if (_ValSB == 0)
                            {
                                _ValSB = _ValSB + 1;
                            }

                        }
                        else
                        {
                            break;
                        }

                        string[] arrDataSize = _dtData.Rows[i]["SoDo"].ToString().Split(new char[] { ';' });
                        for (int j = 0; j < arrDataSize.Length; j++)
                        {
                            DataTable re_SizeID = new DataTable();
                            string[] arrDTS = arrDataSize[j].Split(new char[] { '*' });
                            string[] arrDTSType = new string[] { string.Empty };
                            string _producID = string.Empty;
                            if (IsTachNhomSize)
                            {
                                arrDTSType = arrDTS[0].Split(new char[] { '|' });
                                re_SizeID = dtSize.Select("Size = '" + arrDTSType[0] + "' and Sizetype = '" + arrDTSType[1] + "'").CopyToDataTable();
                                _producID = re_SizeID.Rows[0]["SizetypeID"].ToString();
                            }

                            for (int s = 0; s < Convert.ToInt32(Math.Ceiling(Convert.ToDouble(arrDTS[1]))); s++)
                            {
                                ErpTNC_VpConfig _lstTemp_TNC = new ErpTNC_VpConfig();
                                _lstTemp_TNC.MaLenh = _maLenh;
                                _lstTemp_TNC.MaHang = dtSoDo.Rows[0]["MaHang"].ToString();
                                _lstTemp_TNC.KhachHang = _maKH;
                                _lstTemp_TNC.KhoVai = dtSoDo.Rows[0]["KhoVai"].ToString();
                                _lstTemp_TNC.MaVai = dtSoDo.Rows[0]["MaVai"].ToString();
                                _lstTemp_TNC.DMKH = string.IsNullOrEmpty(dtSoDo.Rows[0]["DMKH"].ToString()) ? 0 : Convert.ToDouble(dtSoDo.Rows[0]["DMKH"].ToString());
                                _lstTemp_TNC.DMTT = string.IsNullOrEmpty(_dtData.Rows[i]["DMTT"].ToString()) ? 0 : Convert.ToDouble(_dtData.Rows[i]["DMTT"].ToString());
                                _lstTemp_TNC.SoBo = _ValSB.ToString();
                                //_lstTemp_TNC.BanCat_SD = _dtData.Rows[i]["STT"].ToString();
                                _lstTemp_TNC.BanCat = _bancat/*_dtData.Rows[i]["STT"].ToString()*/;
                                _lstTemp_TNC.SoLop = Convert.ToDouble(_dtData.Rows[i]["SoLop"]);
                                _lstTemp_TNC.Size = IsTachNhomSize ? arrDTSType[0].ToUpper() : arrDTS[0].ToUpper(); /*arrDTS[0].ToUpper();*/
                                _lstTemp_TNC.SoLan = arrDTS[1];
                                _lstTemp_TNC.SoLuong = Convert.ToDouble(_dtData.Rows[i]["SoLop"])/*Convert.ToInt32(arrDTS[1]) * Convert.ToInt32(_dtData.Rows[i]["SoLop"])*/;

                                _lstTemp_TNC.ProductID = _producID;
                                _lstTemp_TNC.dai = string.IsNullOrEmpty(_dtData.Rows[i]["Dai"].ToString()) ? 0 : Convert.ToDouble(_dtData.Rows[i]["Dai"]);
                                _lstTemp_TNC.rong = string.IsNullOrEmpty(_dtData.Rows[i]["Rong"].ToString()) ? 0 : Convert.ToDouble(_dtData.Rows[i]["Rong"]);
                                _lstTemp_TNC.dai_db = string.IsNullOrEmpty(_dtData.Rows[i]["dai_db"].ToString()) ? 0 : Convert.ToDouble(_dtData.Rows[i]["Dai_DB"]);
                                //_lstTemp_TNC.SoLop_SD = 0;
                                _lstTemp_TNC.Status_V = Convert.ToInt32(_nhomNPL);
                                _lstTemp_TNC.MauVai = _mauvai;
                                _lstTemp_TNC.MoTa = _dtData.Rows[i]["MoTa"].ToString();
                                _lstTemp_TNC.BanCatKH = _dtData.Rows[i]["STT"].ToString();
                                _lstTemp_TNC.TenSoDo = _dtData.Rows[i]["TT_TenSD"].ToString();

                                ListTNC_VP.Add(_lstTemp_TNC);
                                _ValSB++;
                            }
                        }
                        demBancat++;
                    }
                }

                //ErpLenhSXPOService _serviceLenhSXPO = new ErpLenhSXPOService();
                List<ErpLenhSXPOEntity> listPOAllow = new List<ErpLenhSXPOEntity>();
                int ValCode = 1, pt = 0, LStatus = 0;
                bool chkHH = true;
                string C_SPOID = string.Empty, C_Color = string.Empty, C_SizeType = string.Empty, C_MaVai = string.Empty, Code_TNC = string.Empty, str_potong = string.Empty, SizeType_PO = string.Empty, ValColor = string.Empty, colorID = string.Empty, colorName = string.Empty, StrPO = string.Empty, StrChkPO = string.Empty, productID_Tong = string.Empty, StrProdcutID = string.Empty;

                string StrVai = dtSoDo.Rows[0]["MaVai"].ToString();
                Code_TNC = dtSoDo.Rows[0]["Code_TNC"].ToString();
                List<ErpGopPOConfig> listGopPO_Config = new List<ErpGopPOConfig>();
                string StrSizeTypeID = dtSoDo.Rows[0]["SizeTypeID_Merg"].ToString().Replace("::", "_").Replace(" ", String.Empty);

                string strSizeTypeTong = dtSoDo.Rows[0]["SizeType_Merg"].ToString().Replace("::", "_").Replace(" ", String.Empty);/*string.Format("{0}", StrSizeTypeID).Replace(" ", String.Empty);*/
                SizeType_PO = dtSoDo.Rows[0]["SPOID_Merg"].ToString().Replace("::", "_").Replace(" ", String.Empty);
                StrPO = dtSoDo.Rows[0]["PO_Merg"].ToString().Replace("::", "_").Replace(" ", String.Empty);
                colorName = dtSoDo.Rows[0]["ColorName_Merg"].ToString().Replace("::", "_").Replace(" ", String.Empty);
                string ColorTong = dtSoDo.Rows[0]["ColorID_Merg"].ToString().Replace("::", "_").Replace(" ", String.Empty);
                str_potong = SizeType_PO.Replace(strSizeTypeTong + "|", "");
                //

                //string urlsdkh = string.Format("{0}/GetGopPOEdit?codetnc={1}", URL + ResourceURL.UrlErpNhap_TNC, _codeTNC);
                //DataTable dtSoDoKH = Task.Run(async () => { return await _serviceNhapTNC.GetNPL(urlsdkh); }).Result;
                DataTable dtSoDoKH = await _modelTNC.GetGopPOEdit(CodeTNC);
                string MH = System.Text.RegularExpressions.Regex.Replace(dtSoDo.Rows[0]["MaHang"].ToString(), "[^0-9a-zA-Z]+", "_");

                StrProdcutID = _maLenh + "|" + MH + "|" + strSizeTypeTong + "|" + ColorTong;

                for (int z = 0; z < dtSoDoKH.Rows.Count; z++)
                {
                    bool exists = listGopPO_Config.Any(x =>
                                                string.Equals(x.PO, dtSoDoKH.Rows[z]["PO"].ToString(), StringComparison.OrdinalIgnoreCase) &&
                                                string.Equals(x.ColorID, dtSoDoKH.Rows[z]["ColorID"].ToString(), StringComparison.OrdinalIgnoreCase) &&
                                                string.Equals(x.SizeTypeID, dtSoDoKH.Rows[z]["SizeTypeID"].ToString(), StringComparison.OrdinalIgnoreCase)
                                            );
                    if (exists)
                    {
                        continue;
                    }
                    ErpGopPOConfig configObj = new ErpGopPOConfig();

                    configObj.POTong = str_potong.Trim();//POTong
                                                         //configObj.MaLenh = editTNC.MaLenh;
                                                         //configObj.TenLenh = editTNC.TenLenh;
                    configObj.SPOID = dtSoDoKH.Rows[z]["SPOID"].ToString();
                    configObj.PO = dtSoDoKH.Rows[z]["PO"].ToString();/*StrPO.Trim();*/
                    //configObj.MaLenh = _maLenh;
                    //configObj.MaHang = _mahang;
                    //configObj.MaHang = editTNC.MaHang;
                    configObj.NgayTao = DateTime.Now;
                    //configObj.SLTong = editTNC.SoLuong;
                    //configObj.SoLuong = Convert.ToInt32(dtSoDoKH.Rows[0]["SoLuong"].ToString());
                    //configObj.Status = lenhGop.Status;
                    configObj.AllowCut = true;
                    configObj.ColorID = dtSoDoKH.Rows[z]["ColorID"].ToString();

                    //configObj.PID = lenhGop.PID;
                    //configObj.ProductID = dtSoDoKH.Rows[0]["ProductID"].ToString();
                    //configObj.SizeID = dtSoDoKH.Rows[0]["SizeID"].ToString();
                    configObj.SizeType_PO = SizeType_PO;
                    configObj.SizeTypeID = dtSoDoKH.Rows[z]["SizeTypeID"].ToString();
                    configObj.SizeTypeTong = strSizeTypeTong;
                    configObj.MaVai = StrVai;
                    if (chkKHSX)
                    {
                        configObj.Status_Vai = 1;
                    }
                    else
                    {
                        configObj.Status_Vai = 0;
                    }
                    configObj.ColorTong = ColorTong;
                    configObj.Code_TNC = Code_TNC;
                    configObj.GhiChu = "";
                    configObj.ColorName = colorName;
                    configObj.ProductID_Tong = "";
                    listGopPO_Config.Add(configObj);
                }

                //
                //NtbSoft.ERP.Libs.clsConvert<ErpGopPOConfig> convert = new Libs.clsConvert<ErpGopPOConfig>();
                //DataTable testds = convert.ToDataTable(listGopPO_Config);
                //tạo dữ liệu lưu

                //string urlCode = string.Format("{0}/GetCode?maLenh={1}&&maVai={2}&&spoid={3}&&mau={4}", URL + ResourceURL.UrlErpGopPO, txtLenhSX.Text, StrVai, SizeType_PO, ColorTong);
                //List<ErpGopPOConfig> listCode = Task.Run(async () => { return await _serviceGopPO.GetCode(urlCode); }).Result;
                //if (listCode.Count() == 0)
                //{
                //    Code_TNC = txtLenhSX.Text + "|" + ValCode + "_" + StrVai;
                //}
                //else
                //{
                //    string[] arrCode_TNC = listCode[0].Code_TNC.Split(new char[] { '_' });
                //    string[] arrCode = arrCode_TNC[0].Split(new char[] { '|' });
                //    Code_TNC = txtLenhSX.Text + "|" + (ValCode + Convert.ToInt32(arrCode[1])) + "_" + StrVai;
                //}

                C_Color = ColorTong;
                C_SizeType = strSizeTypeTong;
                C_SPOID = SizeType_PO;
                C_MaVai = StrVai;
                //ValCode += ValCode;
                //}
                List<SystemLogConfig> listLogEdit = new List<SystemLogConfig>();
                List<ErpGopPOCutConfig> listGopPOCutAdd = new List<ErpGopPOCutConfig>();
                List<ErpLenhSXPOCutDetailConfig> listCutDetailAdd = new List<ErpLenhSXPOCutDetailConfig>();
                List<ErpLenhSXPOCutSoBoConfig> listCutSoBoAdd = new List<ErpLenhSXPOCutSoBoConfig>();
                List<ErpLenhSXPOCutImportConfig> listCutImportAdd = new List<ErpLenhSXPOCutImportConfig>();
                List<ErpTNC_VpConfig> listTNC_VPAdd = new List<ErpTNC_VpConfig>();
                //List<ErpLenhSXPOEntity> listPOAllow = new List<ErpLenhSXPOEntity>();
                List<ErpGopPOConfig> listEditGopPO = new List<ErpGopPOConfig>();
                //ErpGopPOService _serviceGopPO = new ErpGopPOService();
                List<ErpCutSoBo_VPConfig> listCutSoBo_VPAdd = new List<ErpCutSoBo_VPConfig>();

                //ValColor = listMau[x].ColorID;
                string colorStr = string.Empty;
                string poID = string.Empty;
                string sizeTypeID = string.Empty;
                int index = 0;
                string depID = string.Empty, sizeID = string.Empty, CutTable = string.Empty, ProID = string.Empty, StrSizeType_ID = string.Empty;

                int cutTable = 0; double indexBTP = -2;
                int sort = 1, ValSort = 1, ValSort_CT = 1;
                int ValStart = 0, ValEnd = 0, ValSL = 0;
                string StrNumList = string.Empty;


                //List<ErpGopPOConfig> listGopPO = await _serviceGopPO.LenhSXGetSingle(string.Format(URL + ResourceURL.UrlErpGopPO + "/GetSingle?maLenh={0}", _maLenh));
                //ErpLenhSXPOCutDetailService _serviceCutDetail = new ErpLenhSXPOCutDetailService();

                //List<ErpTNC_VpConfig> ListTNC_VP = gridControl1.DataSource as List<ErpTNC_VpConfig>;

                //var listHangHoa = await _serviceHangHoa
                //        .HangHoaGet(
                //            string.Format(URL + ResourceURL.UrlErpHangHoa + "/Get?maHang={0}", _maLenh)
                //        );
                foreach (ErpTNC_VpConfig editTNC in ListTNC_VP)
                {
                    double btpInt = Convert.ToDouble(editTNC.SoLuong);

                    string styleID = System.Text.RegularExpressions.Regex.Replace(dtSoDo.Rows[0]["MaHang"].ToString(), "[^0-9a-zA-Z]+", "_");

                    //List<ErpHangHoaEntity> listHangHoa = await _serviceHangHoa.HangHoaGet(string.Format(URL + ResourceURL.UrlErpHangHoa + "/Get?maHang={0}", _maLenh));

                    double tileInt = Convert.ToDouble(editTNC.SoLan);
                    if (IsTachNhomSize)
                    {
                        string input = StrProdcutID;

                        string[] parts = input.Split('|');

                        if (parts.Length >= 3)
                        {
                            parts[2] = editTNC.ProductID;   // thay thế yếu tố thứ 3
                        }

                        string result = string.Join("|", parts);
                        productID_Tong = result + "|" + editTNC.Size;
                    }
                    else
                    {
                        productID_Tong = StrProdcutID + "|" + editTNC.Size;
                    }


                    ErpGopPOCutConfig GPCut = new ErpGopPOCutConfig();
                    ErpLenhSXPOCutDetailConfig cutDetail = new ErpLenhSXPOCutDetailConfig();
                    if (chkHH)
                    {
                        if (chkKHSX)
                        {
                            if (editTNC.Size != sizeID || editTNC.BanCat != CutTable || productID_Tong != ProID)
                            {
                                cutDetail.CreatedDate = DateTime.Now;//new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, 0, 0, 0);
                                                                     //cutDetail.CutTable = cutTable.ToString();
                                cutDetail.CutTable = editTNC.BanCat;
                                cutDetail.DepID = "PX1.TC1";
                                cutDetail.FinishedOut = 0;
                                cutDetail.ProductID = productID_Tong;
                                //cutDetail.SPOID = str_potong.Trim();//POTong
                                cutDetail.SPOID = SizeType_PO.Trim();//POTong
                                cutDetail.Status = false;
                                cutDetail.Tile = Convert.ToInt32(tileInt);
                                cutDetail.Worked = Convert.ToInt32(btpInt) * Convert.ToInt32(tileInt);//cutInt / arrSizeString.Length;
                                                                                                      //cutDetail.Worked = editTNC.SoLuong;

                                cutDetail.Sort = sort;


                                ErpLenhSXPOCutDetailConfig exitCut = (from c in listCutDetailAdd
                                                                      where c.CutTable.ToUpper() == cutDetail.CutTable.ToUpper() && c.SPOID.ToUpper() == cutDetail.SPOID.ToUpper() && c.ProductID.ToUpper() == cutDetail.ProductID.ToUpper()
                                                                      select c).FirstOrDefault();

                                if (exitCut != null)
                                {
                                    //MessageBox.Show("Trùng dữ liệu Bàn " + editTNC.BanCat + " Size " + editTNC.Size + "!" + " màu " + colorID, "ERROR", MessageBoxButtons.OK, MessageBoxIcon.Information);

                                    //
                                    return "Trùng dữ liệu Bàn " + cutTable.ToString() + " Size " + sizeID + "!" + " mã màu " + colorID + " tên màu " + colorName + " đầu size " + sizeTypeID;
                                }

                                sizeID = editTNC.Size;
                                CutTable = editTNC.BanCat;
                                ProID = productID_Tong;
                                cutDetail.Code_TNC = Code_TNC;

                                listCutDetailAdd.Add(cutDetail);
                                ValSort = sort;
                                sort = sort + 1;
                                //rowColor = k;

                            }



                            //for (int j = 1/*indexBTP + 1*/; j <= tileInt/*indexBTP + tileInt*/; j++)
                            //{

                            ErpLenhSXPOCutSoBoConfig cutSoBo = new ErpLenhSXPOCutSoBoConfig();
                            //cutSoBo.CutTable = cutTable.ToString();
                            cutSoBo.CutTable = editTNC.BanCat;
                            //cutSoBo.DepID = depID;
                            cutSoBo.FinishedOut = Convert.ToInt32(btpInt);
                            cutSoBo.ProductID = productID_Tong;
                            cutSoBo.SawDepID = "PX1.TC1";
                            cutSoBo.SoBo = editTNC.SoBo.ToString();
                            //cutSoBo.SPOID = str_potong.Trim();//POTong
                            cutSoBo.SPOID = SizeType_PO.Trim();//POTong
                            cutSoBo.ReciveDate = DateTime.Now;
                            cutSoBo.IsGet = false;
                            cutSoBo.Status = false;
                            cutSoBo.CreatedDate = DateTime.Now;//new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, 0, 0, 0, 0);
                            cutSoBo.Code_TNC = Code_TNC;
                            listCutSoBoAdd.Add(cutSoBo);

                            ErpLenhSXPOCutImportConfig cutImport = new ErpLenhSXPOCutImportConfig();
                            //cutImport.CutTable = cutTable.ToString();
                            cutImport.CutTable = editTNC.BanCat;
                            //cutSoBo.DepID = depID;
                            cutImport.ReciveDate = DateTime.Now;
                            cutImport.IsGet = false;
                            cutImport.FinishedOut = Convert.ToInt32(btpInt);
                            cutImport.ProductID = productID_Tong;
                            cutImport.SawDepID = "PX1.TC1";
                            cutImport.SoBo = editTNC.SoBo.ToString();//index +1;??
                                                                     //cutImport.SPOID = str_potong.Trim();//POTong
                            cutImport.SPOID = SizeType_PO.Trim();//POTong
                            cutImport.Status = false;
                            cutImport.CreatedDate = DateTime.Now;
                            cutImport.ListNum = StrNumList;
                            cutImport.ListStart = ValStart;
                            cutImport.ListEnd = ValEnd;
                            cutImport.SortImport = ValStart;
                            cutImport.Code_TNC = Code_TNC;
                            listCutImportAdd.Add(cutImport);

                            //ValStart = ValStart + 1;

                            //}
                        }

                        indexBTP = indexBTP + tileInt;

                        ErpTNC_VpConfig TNC_VP = new ErpTNC_VpConfig();
                        TNC_VP.DMKH = Convert.ToDouble(editTNC.DMKH);
                        TNC_VP.DMTT = Convert.ToDouble(editTNC.DMTT);
                        TNC_VP.BanCat = editTNC.BanCat;
                        TNC_VP.IDMaHang = editTNC.IDMaHang;
                        TNC_VP.MaHang = editTNC.MaHang;
                        TNC_VP.KhachHang = editTNC.KhachHang;
                        TNC_VP.MaLenh = editTNC.MaLenh;
                        TNC_VP.MauVai = editTNC.MauVai;
                        //TNC_VP.MaVai = editTNC.MaVai;
                        TNC_VP.MaVai = StrVai;
                        TNC_VP.KhoVai = editTNC.KhoVai;
                        TNC_VP.NgayCN = DateTime.Now;
                        TNC_VP.NgayTao = DateTime.Now;
                        TNC_VP.Size = editTNC.Size;
                        TNC_VP.SoBo = editTNC.SoBo;
                        TNC_VP.AllowCut = false;
                        //TNC_VP.SPOID = str_potong.Trim();//POTong
                        TNC_VP.SPOID = SizeType_PO.Trim();//POTong
                        TNC_VP.SoLuong = btpInt;
                        TNC_VP.SoLuong_F = 0;
                        TNC_VP.SoLan = tileInt.ToString();
                        TNC_VP.SoLop = editTNC.SoLop;
                        TNC_VP.MoTa = editTNC.MoTa;
                        TNC_VP.Status_V = editTNC.Status_V;
                        TNC_VP.ProductID = productID_Tong;
                        TNC_VP.Code_TNC = Code_TNC;
                        TNC_VP.dai = Convert.ToDouble(editTNC.dai);
                        TNC_VP.rong = Convert.ToDouble(editTNC.rong);
                        TNC_VP.dai_db = Convert.ToDouble(editTNC.dai_db);
                        TNC_VP.BanCatKH = editTNC.BanCatKH;
                        TNC_VP.TenSoDo = editTNC.TenSoDo;
                        listTNC_VPAdd.Add(TNC_VP);


                        //
                        ErpCutSoBo_VPConfig CutSoBo_VP = new ErpCutSoBo_VPConfig();
                        //CutSoBo_VP.ID = null;
                        if (chkKHSX)
                        {
                            CutSoBo_VP.Chkv = true;
                        }
                        else
                        {
                            CutSoBo_VP.Chkv = false;
                        }
                        CutSoBo_VP.CutTable = editTNC.BanCat;
                        CutSoBo_VP.ProductID = productID_Tong;
                        CutSoBo_VP.SoBo = editTNC.SoBo.ToString();
                        //CutSoBo_VP.SPOID = str_potong;
                        CutSoBo_VP.SPOID = SizeType_PO;
                        CutSoBo_VP.FinishedOut = editTNC.SoLuong;
                        CutSoBo_VP.Status = 0;
                        CutSoBo_VP.SymBoy = null;
                        CutSoBo_VP.ParentTable = null;
                        //CutSoBo_VP.MaVai = editTNC.MaVai;
                        CutSoBo_VP.MaVai = StrVai;
                        CutSoBo_VP.Code_TNC = Code_TNC;
                        CutSoBo_VP.Sort = ValSort;
                        CutSoBo_VP.Sort_CT = ValSort_CT;
                        listCutSoBo_VPAdd.Add(CutSoBo_VP);

                        ValSort_CT = ValSort_CT + 1;

                        //
                        NtbSoft.ERP.Libs.clsConvert<ErpGopPOConfig> converts1 = new Libs.clsConvert<ErpGopPOConfig>();
                        DataTable test1 = converts1.ToDataTable(listGopPO_Config);

                        for (int g = 0; g < listGopPO_Config.Count; g++)
                        {

                            List<ErpHangHoaEntity> ListHH_productID = (from l in listHangHoa
                                                                       where l.ColorID.ToUpper().Trim() == listGopPO_Config[g].ColorID.ToUpper().Trim() && l.SizeTypeID.ToUpper().Trim() == listGopPO_Config[g].SizeTypeID.ToUpper().Trim() && l.Size.ToUpper().Trim() == editTNC.Size.ToUpper().Trim() && l.MaLenh == _maLenh
                                                                       select l).ToList();

                            if (ListHH_productID.Count > 0)
                            {
                                ErpGopPOConfig configObj = new ErpGopPOConfig();

                                configObj.POTong = str_potong.Trim();//POTong
                                configObj.MaLenh = editTNC.MaLenh;
                                configObj.TenLenh = styleID;
                                configObj.SPOID = listGopPO_Config[g].SPOID;
                                configObj.PO = StrPO.Trim();
                                configObj.MaHang = editTNC.MaHang;
                                configObj.NgayTao = DateTime.Now;
                                //configObj.SLTong = editTNC.SoLuong;
                                configObj.SoLuong = editTNC.SoLuong;
                                //configObj.Status = lenhGop.Status;
                                configObj.AllowCut = true;
                                configObj.ColorID = listGopPO_Config[g].ColorID;

                                //configObj.PID = lenhGop.PID;
                                configObj.ProductID = ListHH_productID[0].ProductID;
                                configObj.SizeID = ListHH_productID[0].SizeID;
                                configObj.SizeType_PO = SizeType_PO;
                                configObj.SizeTypeID = listGopPO_Config[g].SizeTypeID;
                                configObj.SizeTypeTong = strSizeTypeTong;
                                configObj.MaVai = StrVai;
                                if (chkKHSX)
                                {
                                    configObj.Status_Vai = 1;
                                }
                                else
                                {
                                    configObj.Status_Vai = 0;
                                }
                                configObj.ColorTong = ColorTong;
                                configObj.Code_TNC = Code_TNC;
                                configObj.GhiChu = "";
                                configObj.ColorName = listGopPO_Config[g].ColorName;
                                configObj.ProductID_Tong = productID_Tong;
                                listEditGopPO.Add(configObj);
                            }
                        }
                    }


                }

                string hostName = Dns.GetHostName();
                string myIP = Dns.GetHostByName(hostName).AddressList[0].ToString();
                string _StrNhomNPL = _nhomNPL == "1" ? "Vải chính" : _nhomNPL == "2" ? "Vải phối" : _nhomNPL == "3" ? "Vải lót" : _nhomNPL == "4" ? "Keo" : "Khác";
                //string _StrNhomNPL = _nhomNPL.To == "1" ? "Vải chính" : "";

                SystemLogEntity logEdit = new SystemLogEntity();
                logEdit.Action = "Add";
                logEdit.CreatedDate = DateTime.Now;
                logEdit.ID = 0;
                logEdit.MChine = Environment.MachineName;
                logEdit.ModuleName = "frmErpKHTruocCut";
                logEdit.UserName = UserName;
                logEdit.Value = 0;
                logEdit.Mota = "Mã lệnh: " + _maLenh + ", Item vải: " + StrVai + ", nhóm: " + _StrNhomNPL + ", màu vải: " + _mauvai + ", TNC: " + Code_TNC;
                logEdit.IPLan = myIP;
                logEdit.AppId = "4d53bce03ec34c0a911182d4c228ee6c";
                listLogEdit.Add(logEdit);

                //ErpGopPOCutService serviceGopPOCut = new ErpGopPOCutService();
                //ErpLenhSXPOCutDetailService serviceCutDetail = new ErpLenhSXPOCutDetailService();
                //ErpLenhSXPOCutSoBoService serviceCutSoBo = new ErpLenhSXPOCutSoBoService();
                //ErpLenhSXPOCutImportService serviceImport = new ErpLenhSXPOCutImportService();
                //ErpTNC_VPService serviceTNC_VP = new ErpTNC_VPService();
                //ErpCutSoBo_VPService serviceCuSoBo_VP = new ErpCutSoBo_VPService();
                List<ErpLenhSXPOConfig> listEditPO = new List<ErpLenhSXPOConfig>();

                NtbSoft.ERP.Libs.clsConvert<ErpGopPOConfig> converts = new Libs.clsConvert<ErpGopPOConfig>();
                DataTable test = converts.ToDataTable(listEditGopPO);

                if (chkHH)
                {
                    if (chkKHSX)
                    {
                        if (listCutDetailAdd.Count == 0)
                        {
                            //XtraMessageBox.Show(mps, Properties.Resources.InfoTitle, MessageBoxButtons.OK, MessageBoxIcon.Error);
                            //MessageBox.Show("Lỗi tạo dữ liệu cắt!", "ERROR", MessageBoxButtons.OK, MessageBoxIcon.Information);
                            return "Lỗi tạo dữ liệu cắt!";
                        }
                        if (listCutSoBoAdd.Count == 0)
                        {
                            //MessageBox.Show("Lỗi tạo dữ liệu BTP!", "ERROR", MessageBoxButtons.OK, MessageBoxIcon.Information);
                            return "Lỗi tạo dữ liệu BTP!";
                        }

                        if (listCutImportAdd.Count == 0)
                        {
                            //MessageBox.Show("Lỗi tạo dữ liệu đánh số!", "ERROR", MessageBoxButtons.OK, MessageBoxIcon.Information);
                            return "Lỗi tạo dữ liệu đánh số!";
                        }

                    }

                    if (listTNC_VPAdd.Count == 0 || listCutSoBo_VPAdd.Count == 0)
                    {
                        //MessageBox.Show("Lỗi tạo dữ liệu TNC!", "ERROR", MessageBoxButtons.OK, MessageBoxIcon.Information);
                        return "Lỗi tạo dữ liệu TNC!";
                    }
                    if (listEditGopPO.Count == 0)
                    {
                        //MessageBox.Show("Lỗi tạo dữ liệu Config PO!", "ERROR", MessageBoxButtons.OK, MessageBoxIcon.Information);
                        return "Lỗi tạo dữ liệu Config PO!";
                    }
                    //ở đây
                    string msVP = await _modelTNC.POST_ERP_CUT_VP(listTNC_VPAdd);

                    if (string.Compare(msVP, "True") != 0)
                    {
                        _allowMess = false;
                        //XtraMessageBox.Show(msVP, Properties.Resources.InfoTitle, MessageBoxButtons.OK, MessageBoxIcon.Error);
                        //DevExpress.XtraSplashScreen.SplashScreenManager.CloseForm(false);

                        //Xóa dữ liệu  vừa mới đưa vào

                        //string ms = Task.Run(async () => { return await _serviceGopPO.Deleted(urlDele); }).Result;
                        string ms = await _modelTNC.Delete_ERP_GOP_PO(Code_TNC);

                        //SplashScreenManager.CloseForm(false);
                        return msVP;
                    }
                    string msCutSBVP = await _modelTNC.Post_ERP_CUT_SOBO_VP(listCutSoBo_VPAdd);
                    if (string.Compare(msCutSBVP, "True") != 0)
                    {
                        _allowMess = false;
                        //XtraMessageBox.Show(msCutSBVP, Properties.Resources.InfoTitle, MessageBoxButtons.OK, MessageBoxIcon.Error);

                        //Xóa dữ liệu  vừa mới đưa vào
                        //string urlDele = string.Format("{0}?id={1}", URL + ResourceURL.UrlErpGopPO + "/Delete", Code_TNC);
                        //string ms = Task.Run(async () => { return await _serviceGopPO.Deleted(urlDele); }).Result;
                        string ms = await _modelTNC.Delete_ERP_GOP_PO(Code_TNC);

                        //DevExpress.XtraSplashScreen.SplashScreenManager.CloseForm(false);
                        //SplashScreenManager.CloseForm(false);
                        return msCutSBVP;
                    }
                    string lmss = await _modelTNC.Post_ERP_GOP_PO(listEditGopPO);
                    //if (string.Compare(lmss, "True") != 0) return lmss;
                    if (string.Compare(lmss, "True") != 0)
                    {
                        _allowMess = false;
                        //MessageBox.Show("Lỗi tạo dữ liệu Config PO!", "ERROR", MessageBoxButtons.OK, MessageBoxIcon.Information);


                        //Xóa dữ liệu  vừa mới đưa vào
                        //string urlDele = string.Format("{0}?id={1}", URL + ResourceURL.UrlErpGopPO + "/Delete", Code_TNC);
                        //string ms = Task.Run(async () => { return await _serviceGopPO.Deleted(urlDele); }).Result;
                        string ms = await _modelTNC.Delete_ERP_GOP_PO(Code_TNC);

                        //DevExpress.XtraSplashScreen.SplashScreenManager.CloseForm(false);
                        //SplashScreenManager.CloseForm(false);
                        return "Lỗi tạo dữ liệu Config PO!";
                    }

                    if (chkKHSX)
                    {
                        string ms = await _modelTNC.Post_ERP_LENHSX_PO_CUT_DETAIL(listCutDetailAdd);
                        if (string.Compare(ms, "True") != 0)
                        {
                            _allowMess = false;
                            //XtraMessageBox.Show(ms, Properties.Resources.InfoTitle, MessageBoxButtons.OK, MessageBoxIcon.Error);

                            //Xóa dữ liệu  vừa mới đưa vào
                            //string urlDele = string.Format("{0}?id={1}", URL + ResourceURL.UrlErpGopPO + "/Delete", Code_TNC);
                            //string msD = Task.Run(async () => { return await _serviceGopPO.Deleted(urlDele); }).Result;
                            string msD = await _modelTNC.Delete_ERP_GOP_PO(Code_TNC);

                            //DevExpress.XtraSplashScreen.SplashScreenManager.CloseForm(false);
                            //SplashScreenManager.CloseForm(false);
                            return ms;
                        }

                        string msS = await _modelTNC.Post_ERP_LENHSX_PO_CUT_SOBO(listCutSoBoAdd);
                        if (string.Compare(msS, "True") != 0)
                        {
                            _allowMess = false;
                            //XtraMessageBox.Show(msS, Properties.Resources.InfoTitle, MessageBoxButtons.OK, MessageBoxIcon.Error);
                            //Xóa dữ liệu  vừa mới đưa vào
                            //string urlDele = string.Format("{0}?id={1}", URL + ResourceURL.UrlErpGopPO + "/Delete", Code_TNC);
                            //string msD = Task.Run(async () => { return await _serviceGopPO.Deleted(urlDele); }).Result;
                            string msD = await _modelTNC.Delete_ERP_GOP_PO(Code_TNC);
                            //string msD = await _serviceGopPO.Deleted(urlDele);
                            //SplashScreenManager.CloseForm(false);
                            return msS;
                        }
                        string mssImport = await _modelTNC.Post_ERP_LENHSX_PO_CUT_IMPORT(listCutImportAdd);

                        if (string.Compare(mssImport, "True") != 0)
                        {
                            _allowMess = false;
                            //XtraMessageBox.Show(mssImport, Properties.Resources.InfoTitle, MessageBoxButtons.OK, MessageBoxIcon.Error);

                            //Xóa dữ liệu  vừa mới đưa vào
                            //string urlDele = string.Format("{0}?id={1}", URL + ResourceURL.UrlErpGopPO + "/Delete", Code_TNC);
                            //string msD = Task.Run(async () => { return await _serviceGopPO.Deleted(urlDele); }).Result;
                            //string msD = await _serviceGopPO.Deleted(urlDele);
                            //SplashScreenManager.CloseForm(false);
                            string msD = await _modelTNC.Delete_ERP_GOP_PO(Code_TNC);
                            return mssImport;
                        }



                        foreach (ErpLenhSXPOEntity editObj in listPOAllow)
                        {
                            ErpLenhSXPOConfig configObj = new ErpLenhSXPOConfig();
                            configObj.AllowCut = true;
                            configObj.AllowPack = editObj.AllowPack;
                            configObj.AllowSaw = editObj.AllowSaw;
                            configObj.CutDepID = editObj.CutDepID;
                            configObj.MaLenh = editObj.MaLenh;
                            configObj.MaQuocGia = editObj.MaQuocGia;
                            configObj.MoTa = editObj.MoTa;
                            configObj.PackDepID = editObj.PackDepID;
                            configObj.PO = editObj.PO;
                            configObj.POID = editObj.POID;
                            configObj.SawDepID = editObj.SawDepID;
                            configObj.SoLuong = editObj.SoLuong;
                            configObj.SPOID = editObj.SPOID;
                            configObj.NgayGH = editObj.NgayGH;

                            listEditPO.Add(configObj);
                        }
                        string posStr = await _modelTNC.Post_ERP_LENHSX_PO(listEditPO);

                        if (string.Compare(posStr, "True") != 0)
                        {
                            _allowMess = false;
                            //MessageBox.Show("Lỗi tạo dữ liệu cắt!", "ERROR", MessageBoxButtons.OK, MessageBoxIcon.Information);
                            //DevExpress.XtraSplashScreen.SplashScreenManager.CloseForm(false);
                            //SplashScreenManager.CloseForm(false);
                            return "Lỗi tạo dữ liệu cắt!";
                        }
                        else
                        {
                            _allowMess = true;
                            //clsWaitForm.ShowSuccessForm(this, 3000);
                            //this.Close();
                        }
                    }
                    else
                    {
                        _allowMess = true;
                    }
                }


                //update trạng thái của vải



                //string urlCutVai = string.Format("{0}?MaLenh={1}&&MaVai={2}&&dmtt={3}&&thtt={4}", URL + ResourceURL.UrlErpDMNL + "/AllowCut", _maLenh, StrVai, _vlDMTT, _vlSumTieuHao);
                //bool st = Task.Run(async () => { return await _serviceDMNL.AllowCut(urlCutVai); }).Result;
                bool st = await _modelTNC.AllowCut(_maLenh, StrVai, _vlDMTT.ToString(), _vlSumTieuHao.ToString());
                if (st)
                    _allowMess = true;
                else
                    _allowMess = false;

                //string logMs = Task.Run(async () => { return await _serviceLog.Post(listLogEdit, URL + ResourceURL.UrlSystemLog); }).Result;
                string logMs = await _modelTNC.Post_SystemLog(listLogEdit);
                if (string.Compare(logMs, "True") != 0)
                    //XtraMessageBox.Show("LogError: " + logMs, Properties.Resources.InfoTitle, MessageBoxButtons.OK, MessageBoxIcon.Error);
                    listLogEdit.Clear();

                //Thread.Sleep(25);
                //SplashScreenManager.CloseForm(false);
                if (_allowMess)
                {
                    //clsWaitForm.ShowSuccessForm(this, 3000);
                    //this.Close();
                    _allowMess = false;
                }
                //}

                if (chkKHSX && LStatus == 1)
                {
                    //string url = string.Format("{0}?maLenh={1}", URL + ResourceURL.UrlErpLenhSXPODinhMuc + "/AllowPack", _maLenh);
                    //string msP = Task.Run(async () => { return await _serviceLenhSXPODM.SPODMAllowWork(url); }).Result;
                    string msP = await _modelTNC.AllowPack(_maLenh);

                    if (string.Compare(msP, "True") != 0)
                    {
                        return "Lỗi chuyển dữ liệu xuống tổ Đóng thùng!";
                        //XtraMessageBox.Show("Lỗi chuyển dữ liệu xuống tổ Đóng thùng!", Properties.Resources.InfoTitle, MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }

                    //WriteFileLog appendfilelog = new WriteFileLog();
                    //appendfilelog.WriteFileLog_Main(Name, "SaveRows()");
                    //string urlPODM = string.Format("{0}?maLenh={1}", URL + ResourceURL.UrlErpLenhSXPODinhMuc + "/AllowCutDep", _maLenh);
                    //string msPODM = Task.Run(async () => { return await _serviceLenhSXPODM.SPODMAllowWork(urlPODM); }).Result;
                    string msPODM = await _modelTNC.AllowCutDep(_maLenh);
                    if (string.Compare(msPODM, "True") != 0)
                    {
                        return "Lỗi chuyển dữ liệu xuống tổ cắt!";
                    }
                    //clsWaitForm.ShowSuccessForm(this, 3000);
                    //else
                    //    XtraMessageBox.Show("Lỗi chuyển dữ liệu xuống tổ cắt!", Properties.Resources.InfoTitle, MessageBoxButtons.OK, MessageBoxIcon.Error);


                }
                return "True";
            }
            catch(Exception ex)
            {
                return ex.Message;
            }

          
       
        }

        #endregion

        #region Cấp thêm - Thu hồi NPL

        [HttpPost]
        [Route("PostXacNhanNPL")]
        public async Task<string> PostXacNhanNPL(List<XacNhanNPLEntity> lstXacNhan)
        {
            if (lstXacNhan == null) return "false";
            string datetime = DateTime.Now.ToString("ddMMyyyyHHss");
            string Action = lstXacNhan[0].Action;
            string folderName = Action == "POSTCapThem" ? "SignDeNghiCapThemNPL" : "SignDeNghiThuHoi";
            string imageNameTBP_Mer = SaveSignatureImage(lstXacNhan[0].Signature, $"SignTBPMer", "", datetime, folderName);
            if (!string.IsNullOrEmpty(imageNameTBP_Mer))
            {
                lstXacNhan[0].Signature = imageNameTBP_Mer;
            }
            string json = JsonConvert.SerializeObject(lstXacNhan);
            DataTable tblSave = JsonConvert.DeserializeObject<DataTable>(json);

            return await _model.PostXacNhanNPL(Action, tblSave);
        }

        private string SaveSignatureImage(string base64Data, string role, string module, string datetime, string folderName)
        {
            if (string.IsNullOrEmpty(base64Data)) return "";

            string[] parts = base64Data.Split(',');
            if (parts.Length < 2) return base64Data;

            byte[] bytes = Convert.FromBase64String(parts[1]);
            using (MemoryStream ms = new MemoryStream(bytes))
            {
                Image image = Image.FromStream(ms);
                string fileName = $"{role}-{module}-{datetime}.png";
                string uploadPath = HttpContext.Current.Server.MapPath($"~/Images/{folderName}");

                if (!Directory.Exists(uploadPath))
                    Directory.CreateDirectory(uploadPath);

                string fullPath = Path.Combine(uploadPath, fileName);
                if (File.Exists(fullPath))
                    File.Delete(fullPath);

                image.Save(fullPath);
                return fileName;
            }
        }
        #endregion
    }
}