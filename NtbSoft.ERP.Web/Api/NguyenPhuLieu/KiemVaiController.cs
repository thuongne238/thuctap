using Newtonsoft.Json;
using NtbSoft.ERP.Entity.NguyenPhuLieu;
//using NtbSoft.ERP.Entity.Qty;
using NtbSoft.ERP.Model.Qty;
using OfficeOpenXml;
using OfficeOpenXml.Drawing;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Http;

namespace NtbSoft.ERP.Web.Api.NguyenPhuLieu
{
    [RoutePrefix("api/KiemVai")]
    public class KiemVaiController : ApiController
    {
        [HttpGet]
        [Route("Get")]
        public dynamic Get(string action, string para1 = "", string para2 = "", string para3 = "", string para4 = "", string para5 = "", string para6 = "", string para7 = "", string para8 = "")
        {
            try
            {
                var ds = new QTYMaHangPhuLieuModel().GetVai(action, para1, para2, para3, para4, para5, para6, para7, para8);
                return new { dt1 = ds.Tables[0], dt2 = ds.Tables.Count > 1 ? ds.Tables[1] : new DataTable(), dt3 = ds.Tables.Count > 2 ? ds.Tables[2] : new DataTable(), datetime = DateTime.Now.ToString("dd-MM-yyyy") };
            }
            catch (Exception ex)
            {
                string Message = $"Function: NguyenPhuLieuController/GetLine \nMessage: {ex.Message.ToString()}";
                //new WriteLogModel().WriteFileLog("Active", Message);
                return null;
            }
        }
        [HttpPost]
        [Route("SaveGopMH")]
        public string SaveGopMH(dynamic data)
        {
            try
            {
                string json = JsonConvert.SerializeObject(data);
                DataTable dt = JsonConvert.DeserializeObject<DataTable>(json);
                return new QTYMaHangPhuLieuModel().SaveGopMH_KiemVai("Save", dt);
            }
            catch (Exception ex)
            {
                return "";
            }
        }
        [HttpPost]
        [Route("SaveError")]
        public dynamic Save(dynamic data)
        {
            try
            {
                if (data is null) return null;
                List<QtyMaHangKiemVaiEntity> lstData = new List<QtyMaHangKiemVaiEntity>();
                string imageName = "";
                var lstImg = data.Image ?? new List<string>();
                int i = 0;
                foreach (var item in lstImg)
                {
                    string imageData = item;
                    if (!string.IsNullOrEmpty(imageData))
                    {
                        if (!imageData.Contains(".png"))
                        {
                            byte[] bytes = Convert.FromBase64String(imageData.Split(',')[1]);

                            using (MemoryStream ms = new MemoryStream(bytes))
                            {
                                Image image = Image.FromStream(ms);
                                string uploadPath = HttpContext.Current.Server.MapPath("~/Images/KiemVai");
                                if (!System.IO.Directory.Exists(uploadPath))
                                    System.IO.Directory.CreateDirectory(uploadPath);
                                var _imageName = $"{data.MaHang.ToString()}_{DateTime.Now.ToString("ddMMyyyy_HHmmssfff")}_{i.ToString()}";
                                string except = " _";
                                _imageName = Regex.Replace(_imageName, @"[^a-zA-Z0-9" + except + "]+", string.Empty) + ".png";
                                var mPath = string.Format(@"{0}\{1}", uploadPath, _imageName);
                                image.Save(mPath);
                                imageName += "|" + _imageName;
                            }
                        }
                        else
                        {
                            imageName += "|" + imageData.Split('/').Last();
                        }
                    }
                    i++;
                }
                imageName = imageName.TrimStart('|');
                foreach (var item in data.ArrayXY)
                {
                    lstData.Add(new QtyMaHangKiemVaiEntity()
                    {
                        MaDH = data.MaDH.ToString(),
                        MaHang = data.MaHang.ToString(),
                        MaVai = data.MaVai.ToString(),
                        MaVTMau = data.MaVTMau.ToString(),
                        Dot = data.Dot,
                        SoCay = data.SoCay,
                        //GhiChu = data.NoiDung.ToString(),
                        MaLoi = item["Code"].ToString(),
                        MaVTri = item["ViTri"] ?? "",
                        DiemLoi = (int)item["Diem"],
                        NVKiem = data.NVKiem
                    });
                }
                var json = JsonConvert.SerializeObject(lstData);
                DataTable dt = JsonConvert.DeserializeObject<DataTable>(json);
                new QTYMaHangPhuLieuModel().PostVai("SaveError", dt);
                return Ok(new { Status = "OK" });
            }
            catch (Exception ex)
            {
                string Message = $"Function: NguyenPhuLieuController/SaveSLKiem \nMessage: {ex.Message.ToString()}";
                // new WriteLogModel().WriteFileLog("InLine", Message);
                return Ok(new { Status = "Fail" });
            }
        }
        [HttpPost]
        [Route("SaveVai")]
        public IHttpActionResult SaveVai(dynamic data)
        {
            try
            {
                if (data is null) return null;
                List<QtyMaHangKiemVaiEntity> lstData = new List<QtyMaHangKiemVaiEntity>();

                lstData.Add(new QtyMaHangKiemVaiEntity()
                {
                    MaDH = data.MaDH.ToString(),
                    MaHang = data.MaHang.ToString(),
                    MaVai = data.MaVai.ToString(),
                    MaVTMau = data.MaVTMau ?? "",
                    SoLuong = data.SoLuong ?? 0,
                    SoCay = data.SoCay ?? "",
                    Kho = data.Kho ?? "",
                    Dot = data.Dot,
                    GhiChu = data.GhiChu ?? "",
                    NVKiem = data.NVKiem.ToString(),
                });

                var json = JsonConvert.SerializeObject(lstData);
                DataTable dt = JsonConvert.DeserializeObject<DataTable>(json);
                new QTYMaHangPhuLieuModel().PostVai(data.Action.ToString(), dt);
                return Ok(new { Status = "OK" });
            }
            catch (Exception ex)
            {
                string Message = $"Function: QtyPhuLieuController/SavePhuLieu \nMessage: {ex.Message.ToString()}";
                //new WriteLogModel().WriteFileLog("InLine", Message);
                return Ok(new { Status = "Fail" });
            }

        }
        [HttpPost]
        [Route("SaveSLTT")]
        public IHttpActionResult SaveSLTT(dynamic data)
        {
            try
            {
                if (data is null) return null;
                List<QtyMaHangKiemVaiEntity> lstData = new List<QtyMaHangKiemVaiEntity>();

                lstData.Add(new QtyMaHangKiemVaiEntity()
                {
                    Dot = data.Dot,
                    MaVai = data.MaVai.ToString(),
                    MaVTMau = data.MaVTMau ?? "",
                    SoCay = data.SoCay ?? "",
                    SoLuongTT = data.SoLuongTT,
                    KhoTT = data.KhoTT,
                    DiemLoi = data.DiemLoi,
                    GhiChu = data.GhiChu
                });

                var json = JsonConvert.SerializeObject(lstData);
                DataTable dt = JsonConvert.DeserializeObject<DataTable>(json);
                new QTYMaHangPhuLieuModel().PostVai(data.Action.ToString(), dt);
                return Ok(new { Status = "OK" });
            }
            catch (Exception ex)
            {
                string Message = $"Function: QtyPhuLieuController/SavePhuLieu \nMessage: {ex.Message.ToString()}";
                //new WriteLogModel().WriteFileLog("InLine", Message);
                return Ok(new { Status = "Fail" });
            }

        }
        [HttpPost]
        [Route("PostKiemVaiV2_Image")]
        public string PostKiemVaiV2_Image(string action, string type, dynamic data)
        {
            var json = JsonConvert.SerializeObject(data);

            var list = JsonConvert.DeserializeObject<List<QTY_KiemVaiV2_ImageEntity>>(json);

            if (list == null || list.Count == 0)
            {
                return "";
            }

            string datetime = DateTime.Now.ToString("ddMMyyyyHHmmss");
            int index = 0;

            foreach (var item in list)
            {
                string imageText = item.Image;
                string maPhieu = ReplaceSpecialCharacterssize($"{item.BarCode}_{item.DataField}_{index}");
                string imageName = SaveSignatureImage(imageText, "ImgKiemVai", maPhieu, datetime);

                item.Image = imageName;
                index++;
            }

            string jsonL = JsonConvert.SerializeObject(list);
            DataTable dt = JsonConvert.DeserializeObject<DataTable>(jsonL);

            return new QTYMaHangPhuLieuModel().PostVaiV2(action, dt, type);
        }
        [HttpPost]
        [Route("PostKiemVaiV2")]
        public string PostKiemVaiV2(string action, string type, dynamic data)
        {
            var json = JsonConvert.SerializeObject(data);

            // biến chung để return
            object listData;

            if (action == "Post" || action == "UpdateResult")
            {
                // Deserialize về đúng model
                var list = JsonConvert.DeserializeObject<List<QTY_KiemVaiV2Entity>>(json);

                string datetime = DateTime.Now.ToString("ddMMyyyyHHmmssfff");
                string maPhieu = ReplaceSpecialCharacterssize($"{data[0].LOT}{data[0].Batch}{data[0].SoCay}");

                // Text base64
                string ImgWeightText = data[0].ImgWeight;
                string ImgShrinkageText = data[0].ImgShrinkage;
                string ImgWaterproofText = data[0].ImgWaterproof;
                string ImgFaceSideText = data[0].ImgFaceSide;
                string ImgBlackSideText = data[0].ImgBlackSide;
                string ImgColorShadingText = data[0].ImgColorShading;
                string ImgColorText = data[0].ColorImg;
                string ImgPercentText = data[0].PercentImg;

                // Lưu ảnh → trả tên file
                string ImgWeight = SaveSignatureImage(ImgWeightText, "ImgWeight", maPhieu, datetime);
                string ImgShrinkage = SaveSignatureImage(ImgShrinkageText, "ImgShrinkage", maPhieu, datetime);
                string ImgWaterproof = SaveSignatureImage(ImgWaterproofText, "ImgWaterproof", maPhieu, datetime);
                string ImgFaceSide = SaveSignatureImage(ImgFaceSideText, "ImgFaceSide", maPhieu, datetime);
                string ImgBlackSide = SaveSignatureImage(ImgBlackSideText, "ImgBlackSide", maPhieu, datetime);
                string ImgColorShading = SaveSignatureImage(ImgColorShadingText, "ImgColorShading", maPhieu, datetime);
                string ImgColor = SaveSignatureImage(ImgColorText, "ColorImg", maPhieu, datetime);
                string ImgPercent = SaveSignatureImage(ImgPercentText, "PercentImg", maPhieu, datetime);

                // Gán lại cho list
                list[0].ImgWeight = ImgWeight;
                list[0].ImgShrinkage = ImgShrinkage;
                list[0].ImgWaterproof = ImgWaterproof;
                list[0].ImgFaceSide = ImgFaceSide;
                list[0].ImgBlackSide = ImgBlackSide;
                list[0].ImgColorShading = ImgColorShading;
                list[0].ColorImg = ImgColor;
                list[0].PercentImg = ImgPercent;

                if (list == null && list.Count == 0)
                {
                    return "";
                }

                listData = list;
            }
            else
            {
                // Khi action != Post hoặc != UpdateResult → dùng ErrorPointEntity
                listData = JsonConvert.DeserializeObject<List<QTY_KiemVaiV2_ErrorPointEntity>>(json);
            }

            // serialize lại và convert sang DataTable
            string jsonL = JsonConvert.SerializeObject(listData);
            DataTable dt = JsonConvert.DeserializeObject<DataTable>(jsonL);

            // gọi xử lý DB
            return new QTYMaHangPhuLieuModel().PostVaiV2(action, dt, type);
        }
        [Route("PostXacNhanLo")]
        public string PostXacNhanLo(string action, string type, dynamic data)
        {
            var json = JsonConvert.SerializeObject(data);

            object listData;

            listData = JsonConvert.DeserializeObject<List<QTY_KiemVaiV2_XacNhanEntity>>(json);
            // serialize lại và convert sang DataTable
            string jsonL = JsonConvert.SerializeObject(listData);
            DataTable dt = JsonConvert.DeserializeObject<DataTable>(jsonL);

            // gọi xử lý DB
            return new QTYMaHangPhuLieuModel().PostVaiV2(action, dt, type);
        }
        private string SaveSignatureImage(string base64Data, string role, string module, string datetime)
        {
            if (string.IsNullOrEmpty(base64Data)) return "";

            string[] parts = base64Data.Split(',');
            if (parts.Length < 2) return base64Data;

            byte[] bytes = Convert.FromBase64String(parts[1]);
            using (MemoryStream ms = new MemoryStream(bytes))
            {
                Image image = Image.FromStream(ms);
                string fileName = $"{role}-{module}-{datetime}.png";
                string uploadPath = HttpContext.Current.Server.MapPath("~/Images/SignKiemVai");

                if (!Directory.Exists(uploadPath))
                    Directory.CreateDirectory(uploadPath);

                string fullPath = Path.Combine(uploadPath, fileName);
                if (File.Exists(fullPath))
                    File.Delete(fullPath);

                image.Save(fullPath);
                return $"/{fileName}";
            }
        }
        [HttpPost]
        [Route("PostSign")]
        public string PostSign(string action, string type, dynamic data)
        {
            string datetime = DateTime.Now.ToString("ddMMyyyyHHmmssfff");
            string maPhieu = ReplaceSpecialCharacterssize($"{data[0].SoLoID}{data[0].LoaiVai}{data[0].MaVTID}");

            string imageDataA = data[0].Sign;
            string imageDataB = data[0].SignManager;
            string imageDataC = data[0].SignReceive;
            string imageName = SaveSignatureImage(imageDataA, $"{data[0].ID}@SignNgaykiem", maPhieu, datetime);
            string imageNameB = SaveSignatureImage(imageDataB, $"{data[0].ID}@SignManager", maPhieu, datetime);
            string imageNameC = SaveSignatureImage(imageDataC, $"{data[0].ID}@SignNhan", maPhieu, datetime);

            List<QTY_KiemVaiV2_SignEntity> lstData = new List<QTY_KiemVaiV2_SignEntity>();
            lstData.Add(new QTY_KiemVaiV2_SignEntity
            {
                SoLoID = data[0].SoLoID,
                Sign = imageName,
                LoaiVai = data[0].LoaiVai,
                MaVTID = data[0].MaVTID,
                MauVTID = data[0].MauVTID,
                SignManager = imageNameB,
                SignReceive = imageNameC,
                MaNPL = data[0].MaNPL
            });

            string jsonL = JsonConvert.SerializeObject(lstData);
            DataTable dt = JsonConvert.DeserializeObject<DataTable>(jsonL);
            return new QTYMaHangPhuLieuModel().PostVaiV2(action, dt, type);
        }
        static string ReplaceSpecialCharacterssize(string input)
        {
            // Pattern để tìm khoảng trắng và các kí tự đặc biệt
            string pattern = @"[\s!@#$%^&*()\-+=\[\]{};:'""\\|,.<>/?]+";
            // Thay thế bằng dấu _
            string replacement = "_";
            // Tạo một Regex và thực hiện thay thế
            Regex regex = new Regex(pattern);
            var value1 = regex.Replace(input, replacement);
            string value = RemoveVietnameseTone(value1);
            return value;
        }
        public static string RemoveVietnameseTone(string text)
        {
            string normalizedString = text.Normalize(NormalizationForm.FormD);
            StringBuilder stringBuilder = new StringBuilder();
            foreach (char c in normalizedString)
            {
                UnicodeCategory unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }
            string result = stringBuilder.ToString().Normalize(NormalizationForm.FormC).ToUpper();
            result = result.Replace('đ', 'd');
            return result;
        }
        [HttpPost]
        [Route("SaveSign")]
        public IHttpActionResult SaveSign(dynamic data)
        {
            if (data is null) return null;
            string maHang = data?.MaHang?.ToString() ?? "";
            string imageName = ReplaceSpecialCharacterssize(maHang) + "_" + data.IdNguoiKy.ToString();
            string idNguoiKy = data.IdNguoiKy;
            string imageData = data.Image.ToString();
            List<QtyMaHangKiemVaiEntity> lstData = new List<QtyMaHangKiemVaiEntity>();
            if (!string.IsNullOrEmpty(imageData))
            {
                if (!imageData.Contains(".png"))
                {
                    byte[] bytes = Convert.FromBase64String(imageData.Split(',')[1]);

                    using (MemoryStream ms = new MemoryStream(bytes))
                    {
                        Image image = Image.FromStream(ms);
                        string uploadPath = HttpContext.Current.Server.MapPath("~/Images/SignKiemVai");
                        if (!System.IO.Directory.Exists(uploadPath))
                            System.IO.Directory.CreateDirectory(uploadPath);
                        imageName += $"{DateTime.Now.ToString("ddMMyyyy_HHmmssfff")}" + ".png";
                        var mPath = string.Format(@"{0}\{1}", uploadPath, imageName);
                        image.Save(mPath);
                    }
                }
                else
                {
                    imageName = imageData.Split('/').Last();
                }
            }

            lstData.Add(new QtyMaHangKiemVaiEntity()
            {
                MaDH = data.MaDH.ToString(),
                MaHang = data.MaHang.ToString(),
                Dot = data.Dot,
                MaVai = data.MaVai.ToString(),
                Image = imageName,
                NVKiem = data.NVKiem.ToString()
            });

            var json = JsonConvert.SerializeObject(lstData);
            DataTable dt = JsonConvert.DeserializeObject<DataTable>(json);
            new QTYMaHangPhuLieuModel().PostVai("SaveSign", dt, idNguoiKy);
            return Ok(new { Status = "OK" });
        }

        [HttpPost]
        [Route("EXBCKTVaiV2")]
        public HttpResponseMessage EXBCKTVai(dynamic postData)
        {
            var foder = HttpContext.Current.Server.MapPath("~/Images/SignKiemVai");
            string logoPath = Path.Combine(HttpContext.Current.Server.MapPath("~/Images/NhanVien"), "LOGOVIKING.png");

            DataTable tbl = JsonConvert.DeserializeObject<DataTable>(JsonConvert.SerializeObject(postData.ArrBody));
            DataTable tblError = JsonConvert.DeserializeObject<DataTable>(JsonConvert.SerializeObject(postData.ArrBodyErrorPoint));

            string imagePathPhysical = HttpContext.Current.Server.MapPath("~" + "/Content/Templates/BCKiemVaiV2.xlsx");

            ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.Commercial;
            using (ExcelPackage package = new ExcelPackage(new FileInfo(imagePathPhysical)))
            {
                ExcelWorksheet worksheet = package.Workbook.Worksheets["Sheet1"];
                ExcelRange range;

                package.Workbook.Worksheets["Sheet1"].View.TabSelected = true;

                const int startCol = 4;
                const int startRow = 7;
                const int blockHeight = 40;
                const int itemsPerRow = 3;
                const int totalCols = 15;

                int totalBlocks = (int)Math.Ceiling((double)tbl.Rows.Count / itemsPerRow);


                #region  BƯỚC 1: Copy template + RichText + Logo
                var rowColumnList = new List<int[]>
                    {
                        new int[] { 6,  1 },
                        new int[] { 31, 1 },
                        new int[] { 34, 4 },
                        new int[] { 34, 10 },
                        new int[] { 38, 1 },
                        new int[] { 38, 4 },
                    };

                for (int b = 1; b < totalBlocks; b++)
                {
                    int destRowStart = 1 + b * blockHeight;

                    // --- Copy cell value + style + row height ---
                    for (int r = 0; r < blockHeight; r++)
                    {
                        int srcRow = 1 + r;
                        int destRow = destRowStart + r;

                        worksheet.Row(destRow).Height = worksheet.Row(srcRow).Height;
                        for (int c = 1; c <= totalCols; c++)
                        {
                            var srcCell = worksheet.Cells[srcRow, c];
                            var destCell = worksheet.Cells[destRow, c];
                            destCell.Value = srcCell.Value;
                            destCell.StyleID = srcCell.StyleID;
                        }
                    }
                    worksheet.Row(destRowStart + 2).Height = 35;

                    // --- Copy merge ranges ---
                    var mergesInBlock = worksheet.MergedCells
                        .Where(m => { var a = new ExcelAddress(m); return a.Start.Row >= 1 && a.End.Row <= 40; })
                        .ToList();

                    foreach (var merge in mergesInBlock)
                    {
                        var addr = new ExcelAddress(merge);
                        int offset = b * blockHeight;
                        worksheet.Cells[
                            addr.Start.Row + offset, addr.Start.Column,
                            addr.End.Row + offset, addr.End.Column
                        ].Merge = true;
                    }

                    // --- RichText cho từng row ---
                    for (int r = 4; r <= 40; r++)
                    {
                        int destRow = (destRowStart - 1) + r;

                        // Case đặc biệt:
                        if (r == 4)
                        {
                            ApplyRichTextBlueItalic(worksheet, destRow, 1, true);
                            ApplyRichTextBlueItalic(worksheet, destRow, 5, true);
                            continue;
                        }
                        if (r == 5)
                        {
                            ApplyRichTextBlueItalic(worksheet, destRow, 1, true);
                            ApplyRichTextBlueItalic(worksheet, destRow, 5, true);
                            continue;
                        }
                        if (r == 20)
                        {
                            ApplyRichTextMergedCell(worksheet, destRow, 2, false);
                        }
                        if (r == 20) // col 3
                        {
                            var mergedCell = worksheet.Cells[destRow, 3];
                            string mergeAddr = worksheet.MergedCells[destRow, 3];
                            if (!string.IsNullOrEmpty(mergeAddr))
                            {
                                var mergeRange = new ExcelAddress(mergeAddr);
                                mergedCell = worksheet.Cells[mergeRange.Start.Row, mergeRange.Start.Column];
                            }

                            string cv = mergedCell.Value?.ToString() ?? "";
                            int newLineIdx = cv.LastIndexOf('\n');
                            if (newLineIdx < 0) newLineIdx = cv.IndexOf('\r');
                            if (newLineIdx < 0) continue;

                            mergedCell.IsRichText = true;
                            mergedCell.RichText.Clear();

                            if (newLineIdx >= 0)
                            {
                                AddRichText(mergedCell, cv.Substring(0, newLineIdx + 1), false, Color.Black);
                                AddRichText(mergedCell, cv.Substring(newLineIdx + 1), true, ColorTranslator.FromHtml("#1475C3"));
                            }
                            else
                            {
                                AddRichText(mergedCell, cv.Substring(newLineIdx + 1), true, ColorTranslator.FromHtml("#1475C3"));
                            }
                            continue; // xong r==20, skip xuống r tiếp theo
                        }
                        if (r == 23)
                        {
                            var cell = worksheet.Cells[destRow, 2];
                            string cv = cell.Value?.ToString() ?? "";
                            int slashIdx = cv.IndexOf('/');
                            if (slashIdx >= 0)
                            {
                                string partBefore = cv.Substring(0, slashIdx + 1);
                                string partAfter = cv.Substring(slashIdx + 1);
                                int newLineIdx = partAfter.IndexOf('\n');

                                cell.IsRichText = true;
                                cell.RichText.Clear();

                                AddRichText(cell, partBefore, false, Color.Black);
                                if (newLineIdx >= 0)
                                {
                                    AddRichText(cell, partAfter.Substring(0, newLineIdx + 1), true, ColorTranslator.FromHtml("#1475C3"));
                                    AddRichText(cell, partAfter.Substring(newLineIdx + 1), false, Color.Black);
                                }
                                else
                                {
                                    AddRichText(cell, partAfter, true, ColorTranslator.FromHtml("#1475C3"));
                                }
                            }
                            continue;
                        }
                        if (r == 34) { ApplyRichTextBlueItalic(worksheet, destRow, 1); }
                        if (r == 36) { ApplyRichTextBlueItalic(worksheet, destRow, 1); ApplyRichTextBlueItalic(worksheet, destRow, 4); continue; }
                        if (r == 39) { ApplyRichTextBlueItalic(worksheet, destRow, 1); ApplyRichTextBlueItalic(worksheet, destRow, 4); continue; }
                        if (r == 38)
                        {
                            ApplyRichTextBlueItalic(worksheet, destRow, 1, true);
                            ApplyRichTextBlueItalic(worksheet, destRow, 4, true);
                            continue;
                        }
                        // Case thường: theo rowColumnList
                        var cols = rowColumnList.Where(x => x[0] == r).Select(x => x[1]).ToList();
                        if (cols.Count == 0) cols.Add(2);

                        foreach (int col in cols)
                        {
                            var cell = worksheet.Cells[destRow, col];
                            string cv = cell.Value?.ToString() ?? "";
                            int slashIdx = cv.IndexOf('/');
                            if (slashIdx < 0) continue;

                            cell.IsRichText = true;
                            cell.RichText.Clear();
                            AddRichText(cell, cv.Substring(0, slashIdx + 1), false, Color.Black);
                            AddRichText(cell, cv.Substring(slashIdx + 1), true, ColorTranslator.FromHtml("#1475C3"));
                        }
                    }

                    // --- Add logo ---
                    if (File.Exists(logoPath))
                    {
                        var logo = worksheet.Drawings.AddPicture($"LOGOVIKING_block{b}", new FileInfo(logoPath));
                        logo.SetPosition(1 + b * blockHeight, 6, 0, 85);
                        logo.SetSize(60, 60);
                    }
                }
                #endregion
                #region  BƯỚC 2: Ghi data vào từng block
                int blockIndex = 0, itemIndex = 0, currentCol = startCol;

                foreach (DataRow item in tbl.Rows)
                {
                    if (itemIndex > 0 && itemIndex % itemsPerRow == 0) { blockIndex++; currentCol = startCol; }

                    int col = currentCol;
                    int blockOffset = blockIndex * blockHeight;
                    int row = startRow + blockOffset;

                    void WriteCell(int r, int c, object val, bool merge = true)
                    {
                        range = merge ? worksheet.Cells[r, c, r, c + 3] : worksheet.Cells[r, c];
                        if (merge) range.Merge = true;
                        range.Value = val;
                    }

                    string StatusText(object status, int val1 = 1, int val0 = 0, string pass = "PASS", string fail = "FAIL", string no = "NO")
                    {
                        int s = status != DBNull.Value ? Convert.ToInt32(status) : -1;
                        return s == 1 ? pass : s == 0 ? fail : s == 2 ? no : "";
                    }

                    string WithVal(string status, string val) => string.IsNullOrWhiteSpace(val) ? status : $"{status} : {val}";

                    WriteCell(row, col, item["MaVT"]);

                    row++; WriteCell(row, col, WithVal(StatusText(item["ColorStatus"]), item["ColorText"]?.ToString()));
                    row++; WriteCell(row, col, WithVal(StatusText(item["PercentStatus"]), item["PercentText"]?.ToString()));
                    row++; WriteCell(row, col, $"{item["Batch"]} / {item["LOT"]} / {item["SoCay"]}");
                    row++; WriteCell(row, col, WithVal(StatusText(item["StatusWeight"]), item["Weight"]?.ToString()));
                    row++; WriteCell(row, col, WithVal(StatusText(item["StatusShrinkage"]), item["Shrinkage"]?.ToString()));
                    row++; WriteCell(row, col, WithVal(StatusText(item["StatusWaterproof"]), item["Waterproof"]?.ToString()));
                    row++; WriteCell(row, col, item["ReceivingQuantity"]);
                    row++; WriteCell(row, col, item["CheckingQuantity"]);
                    row++; WriteCell(row, col, WithVal(StatusText(item["StatusFaceSide"], pass: "Yes", fail: "No"), item["FaceSide"]?.ToString()));
                    row++; WriteCell(row, col, WithVal(StatusText(item["StatusBlackSide"], pass: "Yes", fail: "No"), item["BlackSide"]?.ToString()));
                    row++; WriteCell(row, col, $"{item["RollLabel"]} / {item["KhoVai"]}");
                    row++; WriteCell(row, col, $"{item["RollActual"]} / {item["KhoVaiActual"]}");

                    row++;
                    worksheet.Cells[row, col, row, col + 1].Merge = true; worksheet.Cells[row, col].Value = item["CutProctect"];
                    worksheet.Cells[row, col + 2, row, col + 3].Merge = true; worksheet.Cells[row, col + 2].Value = item["ColorThread"];

                    row++; WriteCell(row, col, WithVal(StatusText(item["StatusColorShading"]), item["ColorShading"]?.ToString()));
                    row++; WriteCell(row, col, item["JoiningPointsRoll"]);
                    row++; for (int i = 0; i < 4; i++) worksheet.Cells[row, col + i].Value = i + 1;

                    currentCol += 4;
                    itemIndex++;
                }
                #endregion
                #region BƯỚC 3: Ghi Error Points
                if (tblError?.Rows.Count > 0)
                {
                    var defectTypes = tblError.AsEnumerable().Select(r => r["ErrorType"].ToString()).Distinct().ToList();
                    blockIndex = itemIndex = 0; currentCol = startCol;

                    foreach (DataRow item in tbl.Rows)
                    {
                        if (itemIndex > 0 && itemIndex % itemsPerRow == 0) { blockIndex++; currentCol = startCol; }

                        int defectRow = 23 + blockIndex * blockHeight;
                        string idError = item["IDErrorType"].ToString();

                        foreach (var defectType in defectTypes)
                        {
                            var errorData = tblError.AsEnumerable()
                                .FirstOrDefault(r => r["IDErrorType"].ToString() == idError && r["ErrorType"].ToString() == defectType);

                            if (errorData?["ErrorPoint"] != null)
                            {
                                string[] points = errorData["ErrorPoint"].ToString().Split('@');
                                for (int i = 0; i < Math.Min(points.Length, 4); i++)
                                {
                                    worksheet.Cells[defectRow, currentCol + i].Value =
                                        int.TryParse(points[i], out int n) && n != 0 ? (object)n : "";
                                }
                            }
                            defectRow++;
                        }
                        currentCol += 4; itemIndex++;
                    }
                }
                #endregion
                #region BƯỚC 4: Ghi Note
                blockIndex = itemIndex = 0; currentCol = startCol;

                foreach (DataRow item in tbl.Rows)
                {
                    if (itemIndex > 0 && itemIndex % itemsPerRow == 0) { blockIndex++; currentCol = startCol; }

                    int noteRow = 30 + blockIndex * blockHeight;
                    range = worksheet.Cells[noteRow, currentCol, noteRow + 2, currentCol + 3];
                    range.Merge = true; range.Value = item["Note"]; range.Style.WrapText = true;

                    currentCol += 4; itemIndex++;
                }
                #endregion
                #region  BƯỚC 5: Ký tên, kết luận, ảnh
                var blocks = tbl.Rows.Cast<DataRow>()
               .Select((r, idx) => new { r, idx })
               .GroupBy(x => x.idx / itemsPerRow)
               .ToList();

                foreach (var block in blocks)
                {
                    int blockOffset = block.Key * blockHeight;
                    var firstItem = block.First().r;

                    if (postData.ArrThongSo[9].ToString() != "")
                        worksheet.Cells[5 + blockOffset, 8].Value = postData.ArrThongSo[9].ToString();

                    bool hasFailQC = Convert.ToBoolean(postData.ArrThongSo[10]);
                    if (hasFailQC)
                    {
                        if (postData.ArrThongSo[3].ToString() != "") Addpicutre2(worksheet, postData.ArrThongSo[3].ToString(), 35 + blockOffset, 6, 40, foder, 110, 55);
                        if (postData.ArrThongSo[5].ToString() != "") Addpicutre2(worksheet, postData.ArrThongSo[4].ToString(), 38 + blockOffset, 6, 40, foder, 140, 55);
                    }
                    else
                    {
                        if (postData.ArrThongSo[3].ToString() != "") Addpicutre2(worksheet, postData.ArrThongSo[3].ToString(), 35 + blockOffset, 1, 100, foder, 110, 55, 15);
                        if (postData.ArrThongSo[4].ToString() != "") Addpicutre2(worksheet, postData.ArrThongSo[4].ToString(), 38 + blockOffset, 1, 100, foder, 110, 55, 15);
                    }

                    range = worksheet.Cells[7 + blockOffset, 4, 33 + blockOffset, 3 + block.Count() * 4];
                    BorderEx(range);

                    worksheet.Cells[36 + blockOffset, 6].Value =
                        Convert.ToBoolean(postData.ArrThongSo[7].ToString()) ? "Fail" : "";

                    string ketQua = firstItem["KetLuan_Mer"].ToString() == "1" ? "Pass" : firstItem["KetLuan_Mer"].ToString() == "2" ? "Fail" : "";
                    string valueMer = firstItem["GhiChu_Mer"].ToString();

                    worksheet.Cells[4 + blockOffset, 9].Value = postData.ArrThongSo[2].ToString();
                    worksheet.Cells[36 + blockOffset, 10].Value = worksheet.Cells[36 + blockOffset, 10].Value?.ToString()
                        ?.Replace("{0}", ketQua).Replace("{1}", valueMer);
                    worksheet.Cells[4 + blockOffset, 3].Value = postData.ArrThongSo[0].ToString(); // Khách hàng
                    worksheet.Cells[5 + blockOffset, 3].Value = postData.ArrThongSo[1].ToString(); // Nhà cung cấp
                }

                // Tạo sheet 2
                ExcelWorksheet worksheet2 = package.Workbook.Worksheets["Sheet2"];
                // Thêm dòng này để lấy Images cho Sheet2
                var arrBody = JsonConvert.DeserializeObject<List<Newtonsoft.Json.Linq.JObject>>(
                    JsonConvert.SerializeObject(postData.ArrBody));

                HandleSheet2(worksheet2, arrBody, foder);

                byte[] fileBytes = package.GetAsByteArray();
                var response = new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new ByteArrayContent(fileBytes)
                };
                response.Content.Headers.ContentDisposition =
                    new System.Net.Http.Headers.ContentDispositionHeaderValue("attachment") { FileName = "BaoCaoKTCLVai.xlsx" };
                response.Content.Headers.ContentType =
                    new System.Net.Http.Headers.MediaTypeHeaderValue("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

                return response;
            }
            #endregion

        }

        private static void HandleSheet2(ExcelWorksheet worksheet, List<Newtonsoft.Json.Linq.JObject> tbl, string imageFolder)
        {

            // Cấu hình cho ảnh
            const int sizeWidth = 450;  // px
            const int sizeHeight = 350;   // px
            const int imgWidth = 350;  // px
            const int imgHeight = 300;   // px

            // cấu hình cho cục
            const int blockHeight = 15;
            const int itemsPerRow = 1;
            const int totalCols = 4;


            int totalBlocks = (int)Math.Ceiling((double)tbl.Count / itemsPerRow);

            #region Bước 1: Copy template
            var rowColumnList = new List<int[]> { };
            for (int b = 1; b < totalBlocks; b++)
            {
                int destRowStart = 1 + b * blockHeight;

                // --- Copy cell value + style + row height ---
                for (int r = 0; r < blockHeight; r++)
                {
                    int srcRow = 1 + r;
                    int destRow = destRowStart + r;

                    worksheet.Row(destRow).Height = worksheet.Row(srcRow).Height;
                    for (int c = 1; c <= totalCols; c++)
                    {
                        var srcCell = worksheet.Cells[srcRow, c];
                        var destCell = worksheet.Cells[destRow, c];
                        destCell.Value = srcCell.Value;
                        destCell.StyleID = srcCell.StyleID;
                    }
                }
                worksheet.Row(destRowStart + 2).Height = 35;

                // --- Copy merge ranges ---
                var templateMerges = worksheet.MergedCells
               .Where(m => { var a = new ExcelAddress(m); return a.Start.Row >= 1 && a.End.Row <= blockHeight; })
               .ToList();

                foreach (var merge in templateMerges)
                {
                    var addr = new ExcelAddress(merge);
                    int offset = b * blockHeight;

                    var mergeRange = worksheet.Cells[
                        addr.Start.Row + offset, addr.Start.Column,
                        addr.End.Row + offset, addr.End.Column
                    ];

                    // Merge
                    mergeRange.Merge = true;

                    // Border
                    mergeRange.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    mergeRange.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    mergeRange.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    mergeRange.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                }

                // --- RichText cho từng row ---
                for (int r = 2; r <= blockHeight; r++)
                {
                    int destRow = (destRowStart - 1) + r;
                    if (r == 8)
                    {
                        var cell = worksheet.Cells[destRow, 2];
                        string cv = cell.Value?.ToString() ?? "";
                        int slashIdx = cv.IndexOf('/');
                        if (slashIdx >= 0)
                        {
                            string partBefore = cv.Substring(0, slashIdx + 1);
                            string partAfter = cv.Substring(slashIdx + 1);
                            int newLineIdx = partAfter.IndexOf('\n');

                            cell.IsRichText = true;
                            cell.RichText.Clear();

                            AddRichText(cell, partBefore, false, Color.Black);
                            if (newLineIdx >= 0)
                            {
                                AddRichText(cell, partAfter.Substring(0, newLineIdx + 1), true, ColorTranslator.FromHtml("#1475C3"));
                                AddRichText(cell, partAfter.Substring(newLineIdx + 1), false, Color.Black);
                            }
                            else
                            {
                                AddRichText(cell, partAfter, true, ColorTranslator.FromHtml("#1475C3"));
                            }
                        }
                        continue;
                    }

                    // Case thường: theo rowColumnList
                    var cols = rowColumnList.Where(x => x[0] == r).Select(x => x[1]).ToList();
                    if (cols.Count == 0) cols.Add(2);

                    foreach (int col in cols)
                    {
                        var cell = worksheet.Cells[destRow, col];
                        string cv = cell.Value?.ToString() ?? "";
                        int slashIdx = cv.IndexOf('/');
                        if (slashIdx < 0) continue;

                        cell.IsRichText = true;
                        cell.RichText.Clear();
                        AddRichText(cell, cv.Substring(0, slashIdx + 1), false, Color.Black);
                        AddRichText(cell, cv.Substring(slashIdx + 1), true, ColorTranslator.FromHtml("#1475C3"));
                    }
                }
            }
            #endregion
            #region Bước 2: Xử lý hình ảnh
            var fieldRowMap = new Dictionary<string, int>
            {
                { "color",              3  },
                { "percent",            4  },
                { "checkFace",          5  },
                { "checkBlack",         6  },
                { "checkloang",         7  },
                { "defect-wrap-bar",    9  },
                { "defect-weft-bar",    10 },
                { "defect-holes",       11 },
                { "defect-oil-stain",   12 },
                { "defect-color-yarn",  13 },
                { "defect-crease-mark", 14 },
                { "defect-other",       15 },
            }; // Vị trí gốc của dòng tương ứng với field

            var fieldColAGroup = new Dictionary<string, string>
            {
                { "checkFace",          "group_check"  },
                { "checkBlack",         "group_check"  },
                { "defect-wrap-bar",    "group_defect" },
                { "defect-weft-bar",    "group_defect" },
                { "defect-holes",       "group_defect" },
                { "defect-oil-stain",   "group_defect" },
                { "defect-color-yarn",  "group_defect" },
                { "defect-crease-mark", "group_defect" },
                { "defect-other",       "group_defect" },
            }; // Field nào dùng chung col A (merge cùng nhau)

            var groupHeaderRow = new Dictionary<string, int>
            {
                { "group_defect", 8 },
            }; // Row header của group (row chữ không có ảnh, cần merge vào col A luôn)

            int totalInsertedRows = 0; //Bù cho việc insert row làm lệch vị trí các block sau.

            for (int b = 0; b < totalBlocks; b++)
            {
                int blockStart = b * blockHeight + totalInsertedRows;
                Debug.WriteLine($"blockStart: {blockStart}");
                int extraRows = 0;

                string batch = tbl[b]["Batch"]?.ToString() ?? "";
                string lot = tbl[b]["LOT"]?.ToString() ?? "";
                string soCay = tbl[b]["SoCay"]?.ToString() ?? "";
                string maVT = tbl[b]["MaVT"]?.ToString() ?? "";

                worksheet.Cells[blockStart + 1, 1].Value = $"{batch} / {lot} / {soCay}";
                worksheet.Cells[blockStart + 2, 4].Value = maVT;

                DataTable images = JsonConvert.DeserializeObject<DataTable>(tbl[b]["Images"].ToString());

                if (images == null || images.Rows.Count == 0)
                {
                    // Ẩn tất cả field rows của block này
                    foreach (var key in fieldRowMap.Keys)
                    {
                        int targetRow = blockStart + fieldRowMap[key];
                        worksheet.Row(targetRow).Height = 0;
                        worksheet.Row(targetRow).Hidden = true;
                    }

                    // Ẩn luôn header row của các group
                    foreach (var groupEntry in groupHeaderRow)
                    {
                        int headerRow = blockStart + groupEntry.Value;
                        for (int c = 1; c <= 6; c++)
                        {
                            string mergeAddr = worksheet.MergedCells[headerRow, c];
                            if (!string.IsNullOrEmpty(mergeAddr))
                                worksheet.Cells[mergeAddr].Merge = false;
                        }
                        worksheet.Row(headerRow).Height = 0;
                        worksheet.Row(headerRow).Hidden = true;
                    }

                    continue; // 
                }

                var fieldCurrentCol = new Dictionary<string, int>(); // col đang điền ảnh
                var fieldCurrentRow = new Dictionary<string, int>(); // row đang điền ảnh
                var fieldBaseRow = new Dictionary<string, int>(); // row đầu tiên của field (để merge B,C)
                var fieldPendingOffset = new Dictionary<string, int>(); // offset bù cho field chưa được khởi tạo

                //  Reset group mỗi block
                var groupBaseRow = new Dictionary<string, int>(); // row đầu tiên của group (để merge col A)
                var groupLastRow = new Dictionary<string, int>(); // row cuối hiện tại của group

                foreach (var key in fieldRowMap.Keys)
                    fieldPendingOffset[key] = 0;

                for (int index = 0; index < images.Rows.Count; index++)
                {
                    string dataField = images.Rows[index]["DataField"]?.ToString() ?? "";
                    string imagePath = images.Rows[index]["Image"]?.ToString() ?? "";

                    if (!fieldRowMap.ContainsKey(dataField)) continue;

                    // ── Khởi tạo field lần đầu ──────────────────────────────────────
                    if (!fieldCurrentCol.ContainsKey(dataField))
                    {
                        int initRow = blockStart + fieldRowMap[dataField] + fieldPendingOffset[dataField];

                        Debug.WriteLine($"[b={b}] field={dataField}, fieldRowMap={fieldRowMap[dataField]}, initRow={initRow}, pendingOffset={fieldPendingOffset[dataField]}, totalInsertedRows={totalInsertedRows}");

                        fieldCurrentCol[dataField] = 4;
                        fieldCurrentRow[dataField] = initRow;
                        fieldBaseRow[dataField] = initRow;

                        //  Khởi tạo group col A
                        if (fieldColAGroup.TryGetValue(dataField, out string initGroup))
                        {
                            if (!groupBaseRow.ContainsKey(initGroup))
                            {
                                //  Nếu group có header row → dùng header row làm base
                                if (groupHeaderRow.TryGetValue(initGroup, out int hRow))
                                    groupBaseRow[initGroup] = blockStart + hRow; // tính theo blockStart
                                else
                                    groupBaseRow[initGroup] = initRow;
                            }
                            groupLastRow[initGroup] = initRow;
                        }
                        worksheet.Row(initRow).Height = sizeHeight * 0.75;

                        var borderRange = worksheet.Cells[initRow, 4, initRow, 6];
                        borderRange.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                        borderRange.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                        borderRange.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                        borderRange.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        borderRange.Style.Border.BorderAround(ExcelBorderStyle.Thin);
                    }

                    int curRow = fieldCurrentRow[dataField];
                    int curCol = fieldCurrentCol[dataField];

                    // ── Nếu đã điền đủ 3 ảnh (col 4,5,6) → insert row mới ──────────
                    if (curCol > 6)
                    {
                        int newRow = curRow + 1;
                        worksheet.InsertRow(newRow, 1);

                        worksheet.Row(newRow).Height = sizeHeight * 0.75;

                        var newRowBorder = worksheet.Cells[newRow, 1, newRow, 6];
                        newRowBorder.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                        newRowBorder.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                        newRowBorder.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                        newRowBorder.Style.Border.Right.Style = ExcelBorderStyle.Thin;

                        int fieldBase = fieldBaseRow[dataField];

                        extraRows++;
                        totalInsertedRows++;

                        //  Cập nhật TRƯỚC khi tính gLast

                        // Cập nhật field ĐÃ init có row >= curRow
                        foreach (var key in fieldCurrentRow.Keys.ToList())
                        {
                            if (key == dataField) continue;
                            if (fieldCurrentRow[key] >= curRow)
                                fieldCurrentRow[key]++;
                            if (fieldBaseRow.TryGetValue(key, out int bRow) && bRow >= curRow)
                                fieldBaseRow[key]++;
                        }

                        // Cập nhật field CHƯA init
                        foreach (var key in fieldRowMap.Keys)
                        {
                            if (fieldCurrentCol.ContainsKey(key)) continue;
                            int wouldBeRow = blockStart + fieldRowMap[key] + fieldPendingOffset[key];
                            if (wouldBeRow >= curRow)
                                fieldPendingOffset[key]++;
                        }

                        // Cập nhật groupLastRow/groupBaseRow của group khác
                        foreach (var grp in groupLastRow.Keys.ToList())
                        {
                            if (fieldColAGroup.TryGetValue(dataField, out string myGrp) && grp == myGrp) continue;
                            if (groupLastRow[grp] >= curRow) groupLastRow[grp]++;
                            if (groupBaseRow.TryGetValue(grp, out int gbRow) && gbRow >= curRow) groupBaseRow[grp]++;
                        }

                        // ── Unmerge col B,C của field này ───────────────────────────
                        for (int r = fieldBase; r <= newRow; r++)
                        {
                            string m2 = worksheet.MergedCells[r, 2];
                            if (!string.IsNullOrEmpty(m2)) worksheet.Cells[m2].Merge = false;
                            string m3 = worksheet.MergedCells[r, 3];
                            if (!string.IsNullOrEmpty(m3)) worksheet.Cells[m3].Merge = false;
                        }
                        worksheet.Cells[fieldBase, 2, newRow, 3].Merge = true;
                        worksheet.Cells[fieldBase, 2, newRow, 3].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

                        // ── Xử lý col A ─────────────────────────────────────────────
                        if (fieldColAGroup.TryGetValue(dataField, out string group))
                        {
                            int gBase = groupBaseRow[group];

                            //  Tính gLast SAU KHI đã update tất cả offset
                            int gLast = newRow;
                            foreach (var kvp in fieldColAGroup)
                            {
                                if (kvp.Value != group) continue;

                                // Field đã init
                                if (fieldCurrentRow.TryGetValue(kvp.Key, out int fRow) && fRow > gLast)
                                    gLast = fRow;
                                if (fieldBaseRow.TryGetValue(kvp.Key, out int fBase) && fBase > gLast)
                                    gLast = fBase;

                                // Field chưa init → dùng pendingOffset đã được cập nhật
                                if (!fieldCurrentCol.ContainsKey(kvp.Key))
                                {
                                    int pendingRow = blockStart + fieldRowMap[kvp.Key] + fieldPendingOffset[kvp.Key];
                                    if (pendingRow > gLast) gLast = pendingRow;
                                }
                            }

                            groupLastRow[group] = gLast;

                            // Unmerge toàn bộ col A của group
                            for (int r = gBase; r <= gLast; r++)
                            {
                                string m1 = worksheet.MergedCells[r, 1];
                                if (!string.IsNullOrEmpty(m1)) worksheet.Cells[m1].Merge = false;
                            }

                            // Merge lại col A toàn bộ group
                            worksheet.Cells[gBase, 1, gLast, 1].Merge = true;
                            worksheet.Cells[gBase, 1, gLast, 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                        }
                        else
                        {
                            // Field không có group
                            for (int r = fieldBase; r <= newRow; r++)
                            {
                                string m1 = worksheet.MergedCells[r, 1];
                                if (!string.IsNullOrEmpty(m1)) worksheet.Cells[m1].Merge = false;
                            }
                            worksheet.Cells[fieldBase, 1, newRow, 1].Merge = true;
                            worksheet.Cells[fieldBase, 1, newRow, 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                        }

                        curRow = newRow;
                        curCol = 4;

                        fieldCurrentRow[dataField] = curRow;
                        fieldCurrentCol[dataField] = curCol;
                    }

                    // ── Set độ rộng cột ─────────────────────────────────────────────
                    worksheet.Column(curCol).Width = sizeWidth / 7.5;

                    // ── Tính offset để căn giữa ảnh trong ô ────────────────────────
                    int colWidthPx = (int)(worksheet.Column(curCol).Width * 7.5);
                    int rowHeightPx = (int)(worksheet.Row(curRow).Height / 0.75);
                    int colOffset = Math.Max(0, (colWidthPx - imgWidth) / 2);
                    int rowOffset = Math.Max(0, (rowHeightPx - imgHeight) / 2);

                    // Border ô chứa ảnh
                    var borderCell = worksheet.Cells[curRow, curCol];
                    borderCell.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                    borderCell.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                    borderCell.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                    borderCell.Style.Border.Right.Style = ExcelBorderStyle.Thin;

                    // Thêm ảnh
                    Addpicutre2(worksheet, imagePath, curRow - 1, curCol - 1,
                                colOffset, imageFolder, imgWidth, imgHeight, rowOffset);

                    bool isDefectUpdate = fieldColAGroup.TryGetValue(dataField, out string updateGrp)
                        && updateGrp == "group_defect";
                    if (isDefectUpdate)
                    {
                        string curNote = images.Rows[index]["GhiChu"]?.ToString() ?? "";

                        // Ghi ghi chú vào ô
                        var noteCell = worksheet.Cells[curRow, curCol];
                        noteCell.Value = curNote;
                        noteCell.Style.WrapText = true;
                        noteCell.Style.VerticalAlignment = ExcelVerticalAlignment.Bottom;
                        noteCell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                        noteCell.Style.Font.Size = 14;

                        // Update max height nếu ghi chú dài hơn
                        double updateColWidthPx = worksheet.Column(curCol).Width * 7.5;
                        double neededHeight = CalcRowHeightWithNote(curNote, sizeHeight, updateColWidthPx);
                        if (worksheet.Row(curRow).Height < neededHeight)
                            worksheet.Row(curRow).Height = neededHeight;
                    }

                    // Cập nhật col, giữ nguyên row
                    fieldCurrentCol[dataField] = curCol + 1;
                    fieldCurrentRow[dataField] = curRow;
                }
                foreach (var key in fieldRowMap.Keys)
                {
                    // Field không có ảnh nào → không được init → set height = 0
                    if (!fieldCurrentCol.ContainsKey(key))
                    {
                        int targetRow = blockStart + fieldRowMap[key] + fieldPendingOffset[key];
                        worksheet.Row(targetRow).Height = 0;
                        worksheet.Row(targetRow).Hidden = true; // ẩn hẳn cho chắc
                    }
                }
                foreach (var groupEntry in groupHeaderRow)
                {
                    string groupName = groupEntry.Key;
                    int headerRow = blockStart + groupEntry.Value +
                        // Bù offset nếu có insert row
                        fieldPendingOffset.Values.DefaultIfEmpty(0).Min(); // lấy offset nhỏ nhất làm tham chiếu

                    // Lấy tất cả field thuộc group này
                    var fieldsInGroup = fieldColAGroup
                        .Where(x => x.Value == groupName)
                        .Select(x => x.Key)
                        .ToList();

                    // Kiểm tra có field nào có ảnh không
                    bool groupHasAnyImage = fieldsInGroup.Any(f => fieldCurrentCol.ContainsKey(f));

                    if (!groupHasAnyImage)
                    {
                        // Unmerge rồi ẩn header row
                        for (int c = 1; c <= 6; c++)
                        {
                            string mergeAddr = worksheet.MergedCells[blockStart + groupEntry.Value, c];
                            if (!string.IsNullOrEmpty(mergeAddr))
                                worksheet.Cells[mergeAddr].Merge = false;
                        }
                        worksheet.Row(blockStart + groupEntry.Value).Height = 0;
                        worksheet.Row(blockStart + groupEntry.Value).Hidden = true;
                    }
                }
            }
            #endregion
        }

        private static double CalcRowHeightWithNote(string ghiChu, double baseImageHeightPx, double colWidthPx)
        {
            if (string.IsNullOrWhiteSpace(ghiChu))
                return baseImageHeightPx * 0.75;

            // Ước tính số px mỗi ký tự (font ~7px/char với cỡ chữ 11)
            const double pxPerChar = 14;
            const double lineHeightPx = 12.0;

            int charsPerLine = (int)(colWidthPx / pxPerChar);
            if (charsPerLine < 1) charsPerLine = 1;

            int lines = (int)Math.Ceiling((double)ghiChu.Length / charsPerLine);
            double noteHeightPx = lines * lineHeightPx;

            return (baseImageHeightPx + noteHeightPx) * 0.75;
        }

        private static void AddRichText(ExcelRange cell, string text, bool italic, Color color, bool forceBold = false)
        {
            var rt = cell.RichText.Add(text);
            rt.Italic = italic;
            rt.Bold = forceBold || cell.Style.Font.Bold;
            rt.Size = cell.Style.Font.Size;
            rt.FontName = cell.Style.Font.Name;
            rt.Color = color;
        }

        public static void ApplyRichTextBlueItalic(ExcelWorksheet worksheet, int destRow, int col, bool forceBold = false)
        {
            var cell = worksheet.Cells[destRow, col];
            string cellValue = cell.Value?.ToString() ?? "";
            if (string.IsNullOrEmpty(cellValue)) return;

            string[] lines = cellValue.Split('\n');
            cell.IsRichText = true;
            cell.RichText.Clear();

            for (int i = 0; i < lines.Length; i++)
            {
                string line = lines[i].TrimEnd('\r');
                bool isLast = (i == lines.Length - 1);
                string suffix = isLast ? "" : "\n";
                int slashIdx = line.IndexOf('/');

                if (slashIdx < 0)
                {
                    AddRichText(cell, line + suffix, false, Color.Black);
                }
                else
                {
                    AddRichText(cell, line.Substring(0, slashIdx + 1), false, Color.Black, forceBold);
                    AddRichText(cell, line.Substring(slashIdx + 1) + suffix, true, ColorTranslator.FromHtml("#1475C3"), forceBold);
                }
            }
        }

        private static void ApplyRichTextMergedCell(ExcelWorksheet worksheet, int destRow, int col, bool forceBold = false)
        {
            // Lấy đúng cell gốc nếu là merged cell
            var cell = worksheet.Cells[destRow, col];
            string mergeAddr = worksheet.MergedCells[destRow, col];

            if (!string.IsNullOrEmpty(mergeAddr))
            {
                var mergeRange = new ExcelAddress(mergeAddr);
                cell = worksheet.Cells[mergeRange.Start.Row, mergeRange.Start.Column];
            }

            // Gọi ApplyRichTextBlueItalic với đúng cell gốc
            ApplyRichTextBlueItalic(worksheet, cell.Start.Row, cell.Start.Column, forceBold);
        }

        public static void BorderEx(ExcelRange range)
        {
            range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
        }

        public static void Addpicutre2(ExcelWorksheet worksheet, string sign, int row, int col, int colOffset, string foder, int chieudai, int chieurong, int rowOffset = 5)
        {
            sign = sign.TrimStart('/', '\\');
            string imagePath = Path.Combine(foder, sign);
            if (File.Exists(imagePath))
            {
                FileInfo imageFile = new FileInfo(imagePath);
                ExcelPicture picture = worksheet.Drawings.AddPicture(Guid.NewGuid().ToString(), imageFile);
                picture.SetPosition(row, rowOffset, col, colOffset);
                picture.SetSize(chieudai, chieurong);
            }
        }
    }
}
