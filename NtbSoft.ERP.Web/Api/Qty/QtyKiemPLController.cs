using Newtonsoft.Json;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using System.Web.Http;
using Newtonsoft.Json.Linq;
using System;
using System.IO;
using NtbSoft.ERP.Model.Qty;
using NtbSoft.ERP.Entity.NguyenPhuLieu;
using OfficeOpenXml;
using System.Net.Http;
using System.Web.Hosting;
using OfficeOpenXml.Drawing;
using System.Net;
using System.Linq;
using NtbSoft.ERP.Utils;
using OfficeOpenXml.Style;
using System.Xml;
using System.Drawing;

namespace NtbSoft.ERP.Web.Api.Qty
{
    [RoutePrefix("api/QtyKiemPL")]
    public class QtyKiemPLController : ApiController
    {
        private QtyKiemPLModel _model = new QtyKiemPLModel();

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
        [HttpPost]
        [Route("Post")]
        public async Task<string> Post(List<KiemPLEntity> lstKiemPL)
        {
            if (lstKiemPL == null) return "false";
            string json = JsonConvert.SerializeObject(lstKiemPL);
            DataTable tblSave = JsonConvert.DeserializeObject<DataTable>(json);
            return await _model.Post(tblSave);
        }
        [HttpPost]
        [Route("PostXN_DanhGia")]
        public async Task<string> PostXN_DanhGia(List<KiemPL_DanhGiaEntity> lstDanhGia,string action= "PostXN_TBP")
        {
            if (lstDanhGia == null) return "false";
            string json = JsonConvert.SerializeObject(lstDanhGia);
            DataTable tblSave = JsonConvert.DeserializeObject<DataTable>(json);
            return await _model.PostXN_DanhGia(action,tblSave);
        }
        [HttpPost]
        [Route("PostImage")]
        public async Task<string> PostImage(List<KiemPL_ImageEntity> lstKiemPL)
        {
            if (lstKiemPL == null) return "false";
        

            string getFileName = $"PL-{lstKiemPL[0].SoLoID}-PL-{lstKiemPL[0].MaNPL.Replace("/@/g", "_")}-{lstKiemPL[0].Dot}";
            string baseDirectory = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Images", "KiemPL");
            string formattedDate = DateTime.Now.ToString("ddMMyyyyHHmmss");
            string folderName = getFileName.Replace("|", "-").Replace(" ", "-");
            string newFolderPath = Path.Combine(baseDirectory, folderName);
            if (!Directory.Exists(newFolderPath))
            {
                Directory.CreateDirectory(newFolderPath);
            }

            foreach (KiemPL_ImageEntity imageData in lstKiemPL)
            {
                string imgString = imageData.Image.ToString();
                string imgName =  $"{imageData.MaPhuLucKiem}_{imageData.STT?.ToString()}";

                if (!string.IsNullOrEmpty(imgString) && !string.IsNullOrEmpty(imgName))
                {
                    string[] imageDataParts = imgString.Split(',');

                    if (imageDataParts.Length == 2)
                    {
                        string base64Data = imageDataParts[1];
                        byte[] imageBytes = Convert.FromBase64String(base64Data);
                        string sanitizedFileName = imgName.Replace(" ", "").Replace("|", "-") + "_" + formattedDate + ".png";
                        string fullImagePath = Path.Combine(newFolderPath, sanitizedFileName);
                        string publicPath = Path.Combine("/Images/KiemPL/", folderName, sanitizedFileName).Replace("\\", "/");

                        System.IO.File.WriteAllBytes(fullImagePath, imageBytes);

                        imageData.Image = publicPath;
                    }
                    else
                    {
                        Console.WriteLine("Invalid image data format.");
                    }
                }
            }

            string json = JsonConvert.SerializeObject(lstKiemPL);
            DataTable tblSave = JsonConvert.DeserializeObject<DataTable>(json);

            return await _model.PostImage(tblSave);
        }
        [HttpPost]
        [Route("UploadImg")]
        public async Task<List<dynamic>> UploadImg([FromBody] JArray imageDatas, string getFileName)
        {
            var results = new List<dynamic>();

            try
            {
                string baseDirectory = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Images", "KiemPL");
                string formattedDate = DateTime.Now.ToString("ddMMyyyyHHmmss");
                string folderName = getFileName.Replace("|", "-").Replace(" ", "-");
                string newFolderPath = Path.Combine(baseDirectory, folderName);

                if (!Directory.Exists(newFolderPath))
                {
                    Directory.CreateDirectory(newFolderPath);
                }

                var tasks = new List<Task>();

                foreach (var imageData in imageDatas)
                {
                    string imgString = imageData["img"]?.ToString();
                    string imgName = imageData["name"]?.ToString();

                    if (!string.IsNullOrEmpty(imgString) && !string.IsNullOrEmpty(imgName))
                    {
                        string[] imageDataParts = imgString.Split(',');

                        if (imageDataParts.Length == 2)
                        {
                            string base64Data = imageDataParts[1];
                            byte[] imageBytes = Convert.FromBase64String(base64Data);
                            string sanitizedFileName = imgName.Replace(" ", "").Replace("|", "-") + "_" + formattedDate + ".png";
                            string fullImagePath = Path.Combine(newFolderPath, sanitizedFileName);
                            string publicPath = Path.Combine("/Images/KiemPL/", folderName, sanitizedFileName).Replace("\\", "/");

                            tasks.Add(Task.Run(() =>
                            {
                                System.IO.File.WriteAllBytes(fullImagePath, imageBytes);
                                lock (results)
                                {
                                    results.Add(new
                                    {
                                        name = imgName,
                                        url = publicPath
                                    });
                                }
                            }));
                        }
                        else
                        {
                            Console.WriteLine("Invalid image data format.");
                        }
                    }
                }
                //await RemoveSignature(MaLenh);
                await Task.WhenAll(tasks);

            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error uploading images: {ex.Message}");
            }

            return results;
        }
        [HttpPost]
        [Route("Delete")]
        public async Task<string> Delete(string action, string UserName, string Para1, string Para2 = null)
        {
            Para1 = Para1 ?? "NONE";
            Para2 = Para2 ?? "NONE";
            return await _model.Delete(action, UserName, Para1, Para2);
        }

        [HttpPost]
        [Route("Update")]
        public async Task<string> Update(string action, string para1 = null, string para2 = null, string para3 = null, string para4 = null, string para5 = null)
        {
            para1 = para1 ?? "NONE";
            para2 = para2 ?? "NONE";
            para3 = para3 ?? "NONE";
            para4 = para4 ?? "NONE";
            para5 = para5 ?? "NONE";
            return await _model.Update(action, para1, para2, para3, para4, para5);
        }


        [HttpGet]
        [Route("GetToDate")]
        public async Task<string> GetToDate()
        {
            string ToDate = DateTime.Now.ToString("dd-MM-yyyy");
            return ToDate;
        }
        //    #region Minh Thông Xuat EXCEL BCKPL
        //    [HttpPost]
        //    [Route("ExportBC")]
        //    public async Task<HttpResponseMessage> ExportBC(JObject objSoLo)
        //    {
        //        try
        //        {
        //            int rowStart = 9;
        //            int rowIdx = 9;
        //            int colIdx = 3;
        //            string templatePath = System.Web.HttpContext.Current.Server.MapPath(@"\Content\Templates\TemplateBBKiemPL.xlsx");

        //            DataTable tblBC = await _model.Get("GetBC", objSoLo["SoLoID"]?.ToString(), "NONE", "NONE", "NONE", "NONE");
        //            DataTable tblDonViTinh = await _model.Get("GetDonViVT", "NONE", "NONE", "NONE", "NONE", "NONE");
        //            //DataTable tblDanhGia = await _model.Get("GetXN_PL", objSoLo["MaPhieuKiem"]?.ToString(), objSoLo["SoLoID"]?.ToString(),"NONE", "NONE", "NONE");

        //            FileInfo templateFile = new FileInfo(templatePath);
        //            string fileName = $"BM04/QT13/CL01-{DateTime.Now.ToString("ddMMyyyyhhmmss")}.xlsx";

        //            ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.Commercial;

        //            byte[] templateBytes =
        //File.ReadAllBytes(templatePath);

        //            using (MemoryStream stream =
        //                new MemoryStream(templateBytes))
        //            using (ExcelPackage package =
        //                new ExcelPackage(stream))
        //            {
        //                ExcelWorksheet worksheet = package.Workbook.Worksheets["BM04"];
        //                worksheet.Cells.Style.Font.Name = "Times New Roman";


        //                await Task.Run(() =>
        //                {
        //                    if (tblBC != null && tblBC.Rows.Count > 0)
        //                    {
        //                        DataRow rowHeader = tblBC.Rows[0];
        //                        worksheet.Cells["A6"].Value = worksheet.Cells["A6"].Text + ": " + objSoLo["TenKH"]?.ToString();
        //                        worksheet.Cells["A7"].Value = worksheet.Cells["A7"].Text + ": " + objSoLo["TenNCC"]?.ToString();
        //                        worksheet.Cells["E6"].Value = worksheet.Cells["E6"].Text + ": " + objSoLo["SoDDH"]?.ToString();

        //                        string ngayNKFormatted = "";
        //                        if (!string.IsNullOrEmpty(objSoLo["NgayNK"]?.ToString()))
        //                        {
        //                            if (DateTime.TryParse(objSoLo["NgayNK"].ToString(), out DateTime ngayNK))
        //                            {
        //                                ngayNKFormatted = ngayNK.ToString("dd/MM/yyyy");
        //                            }
        //                        }
        //                        worksheet.Cells["E7"].Value = worksheet.Cells["E7"].Text + ": " + ngayNKFormatted;

        //                        var boldTextRange = worksheet.Cells["A5:J6"];
        //                        boldTextRange.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Left;
        //                        boldTextRange.Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;
        //                        boldTextRange.Style.Font.Bold = true;


        //                        CreateDynamicHeaders(worksheet, tblBC);




        //                        int totalDynamicColumns = tblBC.Columns
        //                            .Cast<DataColumn>()
        //                            .Count(x => x.ColumnName.Contains("@MaNPL@"));


        //                        int startColumn = 3;


        //                        int endColumn = startColumn + (totalDynamicColumns * 2) - 1;

        //                        for (int c = startColumn; c <= endColumn; c++)
        //                        {
        //                            worksheet.Column(c).Width = 27.38;
        //                        }

        //                        foreach (DataRow row in tblBC.Rows)
        //                        {
        //                            const double FIXED_HEIGHT = 70;

        //                            worksheet.Row(rowIdx).CustomHeight = true;
        //                            worksheet.Row(rowIdx).Height = FIXED_HEIGHT;
        //                            int stt = row["STT"] != DBNull.Value ? Convert.ToInt32(row["STT"]) : 0;
        //                            string maPhuLuc = row["MaPhuLuc"]?.ToString() ?? "NONE";
        //                            var cellNoiDung =
        //                             worksheet.Cells[rowIdx, 2];

        //                            string phuLucText =
        //                            row["PhuLuc"]?.ToString() ?? "";

        //                            phuLucText =
        //                                phuLucText
        //                                    .Replace("\r", "")
        //                                    .Replace("\u00A0", " ")
        //                                    .Replace("\n\n", "\n")
        //                                    .Trim();

        //                            while (phuLucText.Contains("  "))
        //                            {
        //                                phuLucText =
        //                                    phuLucText.Replace("  ", " ");
        //                            }

        //                            cellNoiDung.Value = phuLucText;

        //                            cellNoiDung.Style.WrapText = true;

        //                            cellNoiDung.Style.HorizontalAlignment =
        //                                ExcelHorizontalAlignment.Left;

        //                            cellNoiDung.Style.VerticalAlignment =
        //                                ExcelVerticalAlignment.Center;

        //                            cellNoiDung.Style.Font.Bold = true;

        //                            cellNoiDung.Style.Font.Size = 13;

        //                            cellNoiDung.Style.Font.Name =
        //                                "Times New Roman";
        //                            worksheet.Cells[rowIdx, 1].Value = maPhuLuc == "NONE" || stt == 0 ? "" : (object)stt;
        //                            var cellSTT =
        //                            worksheet.Cells[rowIdx, 1];

        //                            cellSTT.Style.HorizontalAlignment =
        //                                ExcelHorizontalAlignment.Center;

        //                            cellSTT.Style.VerticalAlignment =
        //                                ExcelVerticalAlignment.Center;

        //                            cellSTT.Style.Font.Bold = true;

        //                            cellSTT.Style.Font.Size = 13;

        //                            cellSTT.Style.Font.Name =
        //                                "Times New Roman";
        //                            colIdx = 3;

        //                            foreach (DataColumn col in tblBC.Columns)
        //                            {
        //                                if (col.ColumnName.Contains("@MaNPL@"))
        //                                {
        //                                    string rawValue = row[col.ColumnName]?.ToString() ?? "";
        //                                    var parts = rawValue.Split('@').Select(s => s.Trim()).ToArray();
        //                                    string note =
        //                                    parts.Length > 0
        //                                        ? parts[0].Trim()
        //                                        : "";

        //                                    if (string.IsNullOrWhiteSpace(note)
        //                                        || note.Equals(
        //                                            "none",
        //                                            StringComparison.OrdinalIgnoreCase))
        //                                    {
        //                                        note = "—";
        //                                    }
        //                                    string status = parts.Length > 1 ? parts[1].ToLower() : "";
        //                                    string img = parts.Length > 2 ? parts[2].Replace("none", "").Trim() : "";
        //                                    string soMet = parts.Length > 4 ? parts[4].Replace("none", "").Trim() : "";
        //                                    string cuon = parts.Length > 5 ? parts[5].Replace("none", "").Trim() : "";
        //                                    string isWash = parts.Length > 6 ? parts[6].Replace("none", "").Trim() : "";
        //                                    string maDvTinh = parts.Length > 3 ? parts[3].Replace("none", "").Trim() : "";
        //                                    string TenDV = string.Empty;
        //                                    if (tblDonViTinh != null && tblDonViTinh?.Rows?.Count > 0)
        //                                    {
        //                                        var QueryDVTinh = tblDonViTinh.AsEnumerable().FirstOrDefault(x => x["MaDVVT"]?.ToString() == maDvTinh);
        //                                        if (QueryDVTinh != null)
        //                                        {
        //                                            TenDV = QueryDVTinh["TenDVVT"]?.ToString();
        //                                        }
        //                                    }
        //                                    if (status == "none") status = "";
        //                                    if (img == "none") img = "";

        //                                    bool isCheckType = new[] { "PhuLucPL_2", "PhuLucPL_3", "PhuLucPL_8", "PhuLucPL_9", "PhuLucPL_10", "PhuLucPL_11", "PhuLucPL_12", "PhuLucPL_13", "NONE", "PhuLucPL_15", "PhuLucPL_16" }.Contains(maPhuLuc);
        //                                    bool isImageType = new[] { "PhuLucPL_1", "PhuLucPL_8", "PhuLucPL_9", "PhuLucPL_10", "PhuLucPL_11", "PhuLucPL_12", "PhuLucPL_13", "PhuLucPL_15", "PhuLucPL_2", "PhuLucPL_3", "NONE" }.Contains(maPhuLuc);
        //                                    bool HasUnit = new[] { "PhuLucPL_5", "PhuLucPL_6", "PhuLucPL_7" }.Contains(maPhuLuc);
        //                                    var cell =
        //                                worksheet.Cells[
        //                                    rowIdx,
        //                                    colIdx,
        //                                    rowIdx,
        //                                    colIdx + 1
        //                                ];

        //                                    worksheet.Cells[
        //                                        rowIdx,
        //                                        colIdx,
        //                                        rowIdx,
        //                                        colIdx + 1
        //                                    ].Merge = true;

        //                                    cell.Style.Font.Size = 13;

        //                                    if (isCheckType)
        //                                    {
        //                                        SetCellWithImageAndStatus(
        //                                        worksheet,
        //                                        rowIdx,
        //                                        colIdx,
        //                                        img,
        //                                        status,
        //                                        note,
        //                                        isWash);
        //                                    }
        //                                    else if (isImageType)
        //                                    {
        //                                        SetCellWithImage(
        //                                            worksheet,
        //                                            rowIdx,
        //                                            colIdx,
        //                                            img,
        //                                            note);
        //                                    }
        //                                    else if (maPhuLuc == "NONE")
        //                                    {

        //                                        worksheet.Cells[rowIdx, colIdx].Value = rawValue;
        //                                        worksheet.Cells[rowIdx, colIdx].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;
        //                                        worksheet.Cells[rowIdx, colIdx].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

        //                                        //if (!worksheet.Cells[rowIdx, colIdx, rowIdx + 1, colIdx].Merge)
        //                                        //{
        //                                        //    worksheet.Cells[rowIdx, colIdx, rowIdx + 1, colIdx].Merge = true;
        //                                        //}

        //                                    }
        //                                    else
        //                                    {

        //                                        if (HasUnit)
        //                                        {
        //                                            cell.Value =
        //                                                (string.IsNullOrEmpty(note)
        //                                                    ? ""
        //                                                    : note)
        //                                                + $"  {TenDV}";
        //                                        }
        //                                        else if (maPhuLuc == "PhuLucPL_14")
        //                                        {
        //                                            cell.Value =
        //                                            $"Tổng mét thực tế: {soMet}  " +
        //                                            $"Số cuộn: {cuon}  " +
        //                                            $"{TenDV}";
        //                                        }
        //                                        else
        //                                        {
        //                                            cell.Value = string.IsNullOrEmpty(note) ? "" : note;
        //                                        }
        //                                        cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
        //                                        cell.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
        //                                    }


        //                                    cell.Style.Border.Top.Style = ExcelBorderStyle.Thin;
        //                                    cell.Style.Border.Left.Style = ExcelBorderStyle.Thin;
        //                                    cell.Style.Border.Right.Style = ExcelBorderStyle.Thin;
        //                                    cell.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;

        //                                    if (col.ColumnName.Contains("MoTa") ||
        //                                     col.ColumnName.Contains("LyDo"))
        //                                    {
        //                                        cell.Style.WrapText = true;
        //                                    }

        //                                    cell.Style.Indent = 1;


        //                                    cell.Style.Font.Bold = true;

        //                                    cell.Style.Font.Size = 13;

        //                                    cell.Style.Font.Name = "Times New Roman";

        //                                    colIdx += 2;
        //                                }
        //                            }

        //                            rowIdx++;
        //                        }



        //                    }
        //                });
        //                package.Workbook.Calculate();
        //                package.Workbook.Properties.Company = "NTB";
        //                package.Workbook.Properties.Author = "NTB";


        //                byte[] fileBytes = package.GetAsByteArray();
        //                string contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        //                HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK)
        //                {
        //                    Content = new ByteArrayContent(fileBytes)
        //                };
        //                response.Content.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("attachment")
        //                {
        //                    FileName = fileName
        //                };
        //                response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);
        //                return response;
        //            }
        //        }
        //        catch (Exception ex)
        //        {
        //            Console.WriteLine("An error occurred: " + ex.Message);
        //            return new HttpResponseMessage(HttpStatusCode.InternalServerError);
        //        }
        //    }


        //    private void SetCellWithImageAndStatus(ExcelWorksheet worksheet, int row, int col, string imgPath, string status, string note, string isWash)
        //    {
        //        var cell = worksheet.Cells[row, col];


        //        cell.Value = null;
        //        cell.RichText.Clear();




        //        if (!string.IsNullOrWhiteSpace(imgPath))
        //        {
        //            AddImageToCell(
        //                worksheet,
        //                imgPath,
        //                row,
        //                col,
        //                0,
        //                55,
        //                45);
        //        }
        //        string statusText = string.Empty;

        //        bool isWashCheck =
        // isWash == "1";

        //        string normalizedStatus =
        //            status?.Trim().ToLower() ?? "";

        //        switch (normalizedStatus)
        //        {
        //            case "pass":

        //                statusText =
        //                    isWashCheck
        //                        ? "✓ YES    ✓ PASS"
        //                        : "✓ PASS";

        //                break;

        //            case "fail":

        //                statusText =
        //                    isWashCheck
        //                        ? "✓ YES    ✗ FAIL"
        //                        : "✗ FAIL";

        //                break;

        //            case "yes":

        //                statusText = "✓ YES";

        //                break;

        //            case "no":

        //                statusText = "* NO";

        //                break;

        //            default:

        //                statusText =
        //                    isWashCheck
        //                        ? "✓ YES"
        //                        : "";

        //                break;
        //        }


        //        if (!string.IsNullOrEmpty(statusText))
        //        {
        //            string leftPadding =
        //       !string.IsNullOrWhiteSpace(imgPath)
        //           ? "                              "
        //           : "";

        //            var richTextStatus =
        //                cell.RichText.Add(
        //                    leftPadding + statusText);
        //            richTextStatus.Bold = true;
        //            richTextStatus.Size = 13;
        //            switch (status?.Trim().ToLower())
        //            {
        //                case "pass":
        //                case "yes":
        //                    richTextStatus.Color = System.Drawing.Color.Green;
        //                    break;

        //                case "fail":
        //                    richTextStatus.Color = System.Drawing.Color.Red;
        //                    break;
        //                case "no":

        //                    richTextStatus.Color =
        //                        isWash == "2"
        //                            ? System.Drawing.Color.Red
        //                            : System.Drawing.Color.DarkOrange;

        //                    break;

        //                default:
        //                    richTextStatus.Color = System.Drawing.Color.Black;
        //                    break;
        //            }
        //        }

        //        bool isDashOnly =
        //     note.Trim() == "—";

        //        bool shouldHideDash =
        //            isDashOnly
        //            && normalizedStatus == "no"
        //            && isWash == "2";
        //        if (!shouldHideDash
        //            && !string.IsNullOrEmpty(note))
        //        {
        //            if (!string.IsNullOrEmpty(statusText))
        //            {
        //                cell.RichText.Add("    ");
        //            }

        //            var richTextNote =
        //                cell.RichText.Add(note);

        //            richTextNote.Bold = true;
        //            richTextNote.Size = 12;
        //            richTextNote.Color =
        //                System.Drawing.Color.Black;
        //        }

        //        cell.Style.HorizontalAlignment =
        //ExcelHorizontalAlignment.Left;
        //        cell.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
        //        cell.Style.WrapText = true;


        //    }

        //    private void SetCellWithImage(ExcelWorksheet worksheet, int row, int col, string imgPath, string note)
        //    {

        //        if (!string.IsNullOrWhiteSpace(imgPath))
        //        {
        //            AddImageToCell(
        //                worksheet,
        //                imgPath,
        //                row,
        //                col,
        //                0,
        //                55,
        //                45);
        //        }


        //        string displayText = string.IsNullOrEmpty(note) ? "" : note;
        //        worksheet.Cells[row, col].Value =
        //        "                              " + displayText;
        //        worksheet.Row(row).Height = 70;
        //        worksheet.Cells[row, col].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Left;
        //        worksheet.Cells[row, col].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;
        //    }

        //    private void AddImageToCell(
        //        ExcelWorksheet worksheet,
        //        string imagePath,
        //        int row,
        //        int col,
        //        int offsetX,
        //        int width,
        //        int height)
        //    {
        //        if (string.IsNullOrWhiteSpace(imagePath))
        //            return;

        //        try
        //        {
        //            string fullPath = imagePath;

        //            if (imagePath.StartsWith("http"))
        //            {
        //                Uri uri = new Uri(imagePath);

        //                fullPath =
        //                    HostingEnvironment.MapPath(
        //                        uri.AbsolutePath);
        //            }
        //            else
        //            {
        //                fullPath =
        //                    HostingEnvironment.MapPath(
        //                        imagePath);
        //            }

        //            if (!File.Exists(fullPath))
        //                return;

        //            var imageFile =
        //                new FileInfo(fullPath);

        //            var picture =
        //                worksheet.Drawings.AddPicture(
        //                    Guid.NewGuid().ToString(),
        //                    imageFile);

        //            picture.EditAs =
        //                eEditAs.OneCell;



        //            double rowHeight =
        //                worksheet.Row(row).Height;

        //            if (rowHeight <= 0)
        //            {
        //                rowHeight = 100;
        //            }

        //            double columnWidth =
        //                worksheet.Column(col).Width;


        //            int cellWidth =
        //                (int)(columnWidth * 7);


        //            int cellHeight =
        //                (int)(rowHeight * 1.33);



        //            int imageWidth = 100;

        //            int imageHeight = 80;


        //            int offsetLeft = 8;


        //            int offsetTop =
        //                (cellHeight - imageHeight) / 2;

        //            if (offsetTop < 4)
        //            {
        //                offsetTop = 4;
        //            }


        //            picture.SetPosition(
        //                row - 1,
        //                offsetTop,
        //                col - 1,
        //                offsetLeft);

        //            picture.SetSize(
        //                imageWidth,
        //                imageHeight);
        //        }
        //        catch
        //        {

        //        }
        //    }
        //    private void CreateDynamicHeaders(ExcelWorksheet worksheet, DataTable tblBC)
        //    {
        //        int headerRow1 = 10;
        //        int headerRow2 = 11;

        //        var headerGroups = new Dictionary<string, List<string>>();

        //        foreach (DataColumn col in tblBC.Columns)
        //        {
        //            if (col.ColumnName.Contains("@MaNPL@"))
        //            {
        //                string rollName = "";
        //                var parts = col.ColumnName.Split(new[] { "@MaNPL@" }, StringSplitOptions.None);
        //                if (parts.Length > 1)
        //                {
        //                    rollName = !string.IsNullOrEmpty(parts[0]) ? $"Số Roll: {parts[0]}" : "";
        //                }

        //                if (!headerGroups.ContainsKey(parts[1]))
        //                {
        //                    headerGroups[parts[1]] = new List<string>();
        //                }
        //                headerGroups[parts[1]].Add(rollName);
        //            }
        //        }

        //        int colIdx = 3;

        //        foreach (var group in headerGroups)
        //        {
        //            string noiDungKiem = group.Key;



        //            int startCol = colIdx;
        //            int endCol = colIdx + 1;


        //            worksheet.Cells[
        //                headerRow1,
        //                startCol
        //            ].Value = "";

        //            worksheet.Cells[
        //                headerRow1,
        //                startCol
        //            ].Style.Font.Bold = true;

        //            worksheet.Cells[
        //                headerRow1,
        //                startCol
        //            ].Style.HorizontalAlignment =
        //                ExcelHorizontalAlignment.Center;

        //            worksheet.Cells[
        //                headerRow1,
        //                startCol
        //            ].Style.VerticalAlignment =
        //                ExcelVerticalAlignment.Center;



        //            worksheet.Column(startCol).Width = 28;
        //            worksheet.Column(endCol).Width = 28;



        //            for (int c = startCol; c <= endCol; c++)
        //            {
        //                worksheet.Cells[
        //                    headerRow1,
        //                    c
        //                ].Style.Border.Top.Style =
        //                    ExcelBorderStyle.Thin;

        //                worksheet.Cells[
        //                    headerRow1,
        //                    c
        //                ].Style.Border.Left.Style =
        //                    ExcelBorderStyle.Thin;

        //                worksheet.Cells[
        //                    headerRow1,
        //                    c
        //                ].Style.Border.Right.Style =
        //                    ExcelBorderStyle.Thin;

        //                worksheet.Cells[
        //                    headerRow1,
        //                    c
        //                ].Style.Border.Bottom.Style =
        //                    ExcelBorderStyle.Thin;

        //                worksheet.Cells[
        //                    headerRow2,
        //                    c
        //                ].Style.Border.Top.Style =
        //                    ExcelBorderStyle.Thin;

        //                worksheet.Cells[
        //                    headerRow2,
        //                    c
        //                ].Style.Border.Left.Style =
        //                    ExcelBorderStyle.Thin;

        //                worksheet.Cells[
        //                    headerRow2,
        //                    c
        //                ].Style.Border.Right.Style =
        //                    ExcelBorderStyle.Thin;

        //                worksheet.Cells[
        //                    headerRow2,
        //                    c
        //                ].Style.Border.Bottom.Style =
        //                    ExcelBorderStyle.Thin;
        //            }

        //            // nhảy 2 cột:
        //            // C -> E -> G -> I

        //            colIdx += 2;
        //        }
        //    }
        //    #endregion


        #region Export Bao Cao Tong Hop Ngay

        [HttpPost]
        [Route("ExportBCNgay")]
        public async Task<HttpResponseMessage> ExportBCNgay(JObject request)
        {
            try
            {
                JArray filteredData =
            request["FilteredData"] as JArray;
                string fromDate =
                    request["FromDate"]?.ToString();

                string toDate =
                    request["ToDate"]?.ToString();

                string result =
                    request["Result"]?.ToString();

                string type =
                    request["Type"]?.ToString();

                string templatePath =
                    System.Web.HttpContext.Current.Server.MapPath(
                        @"\Content\Templates\TemplateBCTongHopNPL.xlsx");
                DataTable tblData = null;

                bool isNguyenLieu =
                    type == "NL";

                if (filteredData != null &&
                    filteredData.Count > 0)
                {
                    tblData =
                        JsonConvert.DeserializeObject<DataTable>(
                            filteredData.ToString());
                }
                else
                {
                    if (isNguyenLieu)
                    {
                        tblData = await _model.Get(
                            "GetBCNguyenLieuNgay",
                            fromDate,
                            toDate,
                            result,
                            "NONE",
                            "NONE");
                    }
                    else
                    {
                        tblData = await _model.Get(
                            "GetBaoCaoNgay",
                            fromDate,
                            toDate,
                            result,
                            "NONE",
                            "NONE");
                    }
                }

                FileInfo templateFile =
                    new FileInfo(templatePath);

                ExcelPackage.LicenseContext =
                    LicenseContext.Commercial;

                using (ExcelPackage package =
                    new ExcelPackage(templateFile))
                {
                    ExcelWorksheet worksheet = package.Workbook.Worksheets[0];

                    string reportTitle =
                    isNguyenLieu
                        ? "BÁO CÁO TỔNG HỢP NGUYÊN LIỆU"
                        : "BÁO CÁO TỔNG HỢP PHỤ LIỆU";

                    // Vùng trống giữa logo và phần ký hiệu trong template
                    var titleRange =
                        worksheet.Cells["D1:N3"];

                    titleRange.Merge = true;

                    titleRange.Value =
                        reportTitle;

                    titleRange.Style.Font.Name =
                        "Times New Roman";

                    titleRange.Style.Font.Bold =
                        true;

                    titleRange.Style.Font.Size =
                        16;

                    titleRange.Style.HorizontalAlignment =
                        ExcelHorizontalAlignment.Center;

                    titleRange.Style.VerticalAlignment =
                        ExcelVerticalAlignment.Center;

                    titleRange.Style.WrapText =
                        true;

                    // Border lại vùng tiêu đề
                    titleRange.Style.Border.Top.Style =
                        ExcelBorderStyle.Thin;

                    titleRange.Style.Border.Left.Style =
                        ExcelBorderStyle.Thin;

                    titleRange.Style.Border.Right.Style =
                        ExcelBorderStyle.Thin;

                    titleRange.Style.Border.Bottom.Style =
                        ExcelBorderStyle.Thin;

                    worksheet.Column(1).Width = 8;

                    worksheet.Cells.Style.Font.Name =
                        "Times New Roman";

                    int rowStart = 5;

                    #region Summary Header

                    int totalCount = 0;
                    int passCount = 0;
                    int failCount = 0;

                    int merTotalCount = 0;
                    int merPassCount = 0;
                    int merFailCount = 0;

                    // ===============================
                    // QC RESULT
                    // ===============================
                    Func<DataRow, string> getResultText = r =>
                    {
                        if (tblData == null ||
                            !tblData.Columns.Contains("Result") ||
                            r["Result"] == DBNull.Value ||
                            r["Result"] == null)
                        {
                            return "";
                        }

                        string value = r["Result"].ToString().Trim().ToUpper();

                        if (string.IsNullOrWhiteSpace(value) ||
                            value == "NULL" ||
                            value == "NONE")
                        {
                            return "";
                        }

                        return value;
                    };

                    Func<DataRow, bool> isPassRow = r =>
                    {
                        string resultText = getResultText(r);

                        return resultText == "1" ||
                               resultText == "PASS" ||
                               resultText == "TRUE";
                    };

                    Func<DataRow, bool> isFailRow = r =>
                    {
                        string resultText = getResultText(r);

                        return resultText == "0" ||
                               resultText == "FAIL" ||
                               resultText == "FALSE";
                    };

                    // ===============================
                    // MER RESULT
                    // Tính giống giao diện Merchandising Summary:
                    // Chỉ lấy dòng có Result_Mer thật sự có dữ liệu.
                    // ===============================
                    Func<DataRow, string> getMerResultText = r =>
                    {
                        if (tblData == null ||
                            !tblData.Columns.Contains("Result_Mer") ||
                            r["Result_Mer"] == DBNull.Value ||
                            r["Result_Mer"] == null)
                        {
                            return "";
                        }

                        string value = r["Result_Mer"].ToString().Trim().ToUpper();

                        if (string.IsNullOrWhiteSpace(value) ||
                            value == "NULL" ||
                            value == "NONE")
                        {
                            return "";
                        }

                        return value;
                    };

                    Func<DataRow, bool> isMerRatedRow = r =>
                    {
                        return !string.IsNullOrWhiteSpace(getMerResultText(r));
                    };

                    Func<DataRow, bool> isMerPassRow = r =>
                    {
                        string resultText = getMerResultText(r);

                        return resultText == "1" ||
                               resultText == "PASS" ||
                               resultText == "TRUE";
                    };

                    Func<DataRow, bool> isMerFailRow = r =>
                    {
                        string resultText = getMerResultText(r);

                        return resultText == "0" ||
                               resultText == "FAIL" ||
                               resultText == "FALSE";
                    };

                    if (tblData != null && tblData.Rows.Count > 0)
                    {
                        if (isNguyenLieu)
                        {
                            // Nguyên liệu: giữ cách tính QC hiện tại.
                            totalCount = tblData.AsEnumerable()
                                .Count(r => isPassRow(r) || isFailRow(r));

                            passCount = tblData.AsEnumerable()
                                .Count(r => isPassRow(r));

                            failCount = tblData.AsEnumerable()
                                .Count(r => isFailRow(r));
                        }
                        else
                        {
                            // Phụ liệu: giữ cách tính QC hiện tại theo kiện/đợt/vật tư.
                            var kienGroups = tblData.AsEnumerable()
                                .Where(r => isPassRow(r) || isFailRow(r))
                                .GroupBy(r =>
                                {
                                    string soLoID = tblData.Columns.Contains("SoLoID")
                                        ? Convert.ToString(r["SoLoID"] ?? "").Trim()
                                        : "";

                                    string soLo = tblData.Columns.Contains("SoLo")
                                        ? Convert.ToString(r["SoLo"] ?? "").Trim()
                                        : "";

                                    string dot = tblData.Columns.Contains("Dot")
                                        ? Convert.ToString(r["Dot"] ?? "").Trim()
                                        : "";

                                    if (string.IsNullOrWhiteSpace(dot))
                                        dot = "1";

                                    string maNPL = tblData.Columns.Contains("MaNPL")
                                        ? Convert.ToString(r["MaNPL"] ?? "").Trim()
                                        : "";

                                    string itemCode = tblData.Columns.Contains("ItemCode")
                                        ? Convert.ToString(r["ItemCode"] ?? "").Trim()
                                        : "";

                                    string mauVT = tblData.Columns.Contains("MauVT")
                                        ? Convert.ToString(r["MauVT"] ?? "").Trim()
                                        : "";

                                    string khoVai = tblData.Columns.Contains("KhoVai")
                                        ? Convert.ToString(r["KhoVai"] ?? "").Trim()
                                        : "";

                                    string baseSoLo = !string.IsNullOrWhiteSpace(soLoID)
                                        ? soLoID
                                        : soLo;

                                    if (!string.IsNullOrWhiteSpace(maNPL))
                                        return baseSoLo + "|" + dot + "|" + maNPL;

                                    return baseSoLo + "|" + dot + "|" + itemCode + "|" + mauVT + "|" + khoVai;
                                })
                                .ToList();

                            totalCount = kienGroups.Count();

                            passCount = kienGroups.Count(g =>
                                g.Any(r => isPassRow(r)) &&
                                !g.Any(r => isFailRow(r)));

                            failCount = kienGroups.Count(g =>
                                g.Any(r => isFailRow(r)));
                        }

                        // Merchandising Summary:
                        // Lấy đúng theo Result_Mer đang hiển thị trên giao diện.
                        var merRows = tblData.AsEnumerable()
                            .Where(r => isMerRatedRow(r))
                            .ToList();

                        merTotalCount = merRows.Count;

                        merPassCount = merRows.Count(r => isMerPassRow(r));

                        merFailCount = merRows.Count(r => isMerFailRow(r));
                    }

                    double percentFail =
                        totalCount == 0
                            ? 0
                            : ((double)failCount / totalCount) * 100;

                    double merPercentFail =
                        merTotalCount == 0
                            ? 0
                            : ((double)merFailCount / merTotalCount) * 100;

                    // Dòng 5: QC Summary
                    // Dòng 6: Merchandising Summary
                    var summaryConfigs =
         new[]
         {
        // ===============================
        // QC Summary: dòng 5, từ cột B -> F
        // ===============================
        new
        {
            Row = 5,
            Col = 2,
            Title = "QC Summary",
            Value = ""
        },
        new
        {
            Row = 5,
            Col = 3,
            Title = "TỔNG KIỂM",
            Value = totalCount.ToString()
        },
        new
        {
            Row = 5,
            Col = 4,
            Title = "PASS",
            Value = passCount.ToString()
        },
        new
        {
            Row = 5,
            Col = 5,
            Title = "FAIL",
            Value = failCount.ToString()
        },
        new
        {
            Row = 5,
            Col = 6,
            Title = "% LỖI",
            Value = $"{percentFail:0.00}%"
        },

        // ===============================
        // Merchandising Summary: dòng 5, từ cột L -> P
        // L = 12, M = 13, N = 14, O = 15, P = 16
        // ===============================
        new
        {
            Row = 5,
            Col = 8,
            Title = "MER Summary",
            Value = ""
        },
        new
        {
            Row = 5,
            Col = 9,
            Title = "TỔNG XN",
            Value = merTotalCount.ToString()
        },
        new
        {
            Row = 5,
            Col = 10,
            Title = "PASS",
            Value = merPassCount.ToString()
        },
        new
        {
            Row = 5,
            Col = 11,
            Title = "FAIL",
            Value = merFailCount.ToString()
        },
        new
        {
            Row = 5,
            Col = 12,
            Title = "% LỖI",
            Value = $"{merPercentFail:0.00}%"
        }
         };

                    foreach (var item in summaryConfigs)
                    {
                        var cell = worksheet.Cells[item.Row, item.Col];

                        cell.Value = $"{item.Title}:  {item.Value}";

                        cell.Style.WrapText = true;

                        cell.Style.HorizontalAlignment =
                            ExcelHorizontalAlignment.Center;

                        cell.Style.VerticalAlignment =
                            ExcelVerticalAlignment.Center;

                        cell.Style.Font.Bold = true;

                        cell.Style.Font.Size = 12;

                        cell.Style.Font.Name =
                            "Times New Roman";

                        cell.Style.Fill.PatternType =
                            ExcelFillStyle.None;

                        cell.Style.Border.Top.Style =
                            ExcelBorderStyle.None;

                        cell.Style.Border.Left.Style =
                            ExcelBorderStyle.None;

                        cell.Style.Border.Right.Style =
                            ExcelBorderStyle.None;

                        cell.Style.Border.Bottom.Style =
                            ExcelBorderStyle.None;
                    }

                    worksheet.Row(5).CustomHeight = true;
                    worksheet.Row(5).Height = 18;

                    // Không dùng dòng 6 cho summary nữa.
                    worksheet.Cells[6, 2, 6, 16].Clear();

                    worksheet.Column(1).Width = 10;

                    //// QC Summary area: B -> F
                    //worksheet.Column(2).Width = 25;
                    //worksheet.Column(3).Width = 17;
                    //worksheet.Column(4).Width = 16;
                    //worksheet.Column(5).Width = 20;
                    //worksheet.Column(6).Width = 20;

                    //// Merchandising Summary area: L -> P
                    //worksheet.Column(12).Width = 25;
                    //worksheet.Column(13).Width = 17;
                    //worksheet.Column(14).Width = 18;
                    //worksheet.Column(15).Width = 20;
                    //worksheet.Column(16).Width = 20;

                    #endregion

                    #region Header


                    #endregion

                    #region Build Column
                    var exportColumns =
                        new List<dynamic>()
                    {
                     new
                    {
                        Field = "NgayMoKien",
                        Caption = "Ngày Mở Kiện",
                        Width = 15d,
                        Align = ExcelHorizontalAlignment.Center
                    },
                    new
                    {
                        Field = "NgayKiem",
                        Caption = "Ngày Kiểm",
                        Width = 15d,
                        Align = ExcelHorizontalAlignment.Center
                    },
                    new
                    {
                        Field = "POMua",
                        Caption = "PO Mua",
                        Width = 18d,
                        Align = ExcelHorizontalAlignment.Left
                    },
                    new
                    {
                        Field = "SoLo",
                        Caption = "Số Lô",
                        Width = 18d,
                        Align = ExcelHorizontalAlignment.Left
                    },
                    new
                    {
                        Field = "TenKH",
                        Caption = "Khách Hàng",
                        Width = 28d,
                        Align = ExcelHorizontalAlignment.Left
                    },
                      new
                    {
                        Field = "NhaCungCap",
                        Caption = "Nhà Cung Cấp",
                        Width = 28d,
                        Align = ExcelHorizontalAlignment.Left
                    },
                    new
                    {
                        Field = "TenCL",
                        Caption = "Chủng Loại",
                        Width = 18d,
                        Align = ExcelHorizontalAlignment.Left
                    },
                    new
                    {
                        Field = "ItemCode",
                        Caption = "ItemCode",
                        Width = 18d,
                        Align = ExcelHorizontalAlignment.Left
                    },
                    new
                    {
                        Field = "MauVT",
                        Caption = "Màu",
                        Width = 14d,
                        Align = ExcelHorizontalAlignment.Left
                    },
                    new
                    {
                        Field = "CodeMau",
                        Caption = "Color Code",
                        Width = 16d,
                        Align = ExcelHorizontalAlignment.Left
                    },
                new
                {
                    Field = "MoTa",
                    Caption = "Mô Tả",
                    Width = 32d,
                    Align = ExcelHorizontalAlignment.Left
                },
                    new
                    {
                        Field = "KhoVai",
                        Caption = "Khổ/Size",
                        Width = 14d,
                        Align = ExcelHorizontalAlignment.Left
                    },
                    new
                    {
                        Field = "TenDVVT",
                        Caption = "Đơn Vị",
                        Width = 12d,
                        Align = ExcelHorizontalAlignment.Left
                    },
                    new
                    {
                        Field = "Dot",
                        Caption = "Đợt",
                        Width = 10d,
                        Align = ExcelHorizontalAlignment.Left
                    },
                    new
                    {
                        Field = "Result",
                        Caption = "Kết Luận \n(QC)",
                        Width = 14d,
                        Align = ExcelHorizontalAlignment.Center
                    },
                     new
                    {
                        Field = "Result_Mer",
                        Caption = "Kết Luận \n(Mer)",
                        Width = 14d,
                        Align = ExcelHorizontalAlignment.Center
                    }
                    };

                    if (!isNguyenLieu)
                    {
                        exportColumns.Add(
                            new
                            {
                                Field = "LyDo",
                                Caption = "Lý Do Lỗi",
                                Width = 32d,
                                Align = ExcelHorizontalAlignment.Left
                            });
                    }
                    int rowHeader = 7;

                    int colIndex = 1;

                    worksheet.Row(rowHeader).Height = 28;
                    worksheet.Cells[rowHeader, colIndex]
    .Style.Fill.PatternType =
        ExcelFillStyle.Solid;

                    int lastHeaderCol = exportColumns.Count + 1; // +1 là cột STT

                    var headerRange =
                        worksheet.Cells[rowHeader, 1, rowHeader, lastHeaderCol];

                    headerRange.Style.Fill.PatternType = ExcelFillStyle.Solid;

                    headerRange.Style.Fill.BackgroundColor
               .SetColor(System.Drawing.Color.FromArgb(235, 235, 235));

                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Font.Color.SetColor(System.Drawing.Color.Black);

                    worksheet.Cells[rowHeader, colIndex].Value =

                        "STT";

                    worksheet.Cells[rowHeader, colIndex]
                        .Style.Font.Bold = true;

                    worksheet.Cells[rowHeader, colIndex]
                        .Style.HorizontalAlignment =
                            ExcelHorizontalAlignment.Center;

                    worksheet.Cells[rowHeader, colIndex]
                        .Style.VerticalAlignment =
                            ExcelVerticalAlignment.Center;
                    worksheet.Cells[rowHeader, colIndex]
    .Style.Border.Top.Style =
        ExcelBorderStyle.Thin;

                    worksheet.Cells[rowHeader, colIndex]
                        .Style.Border.Left.Style =
                            ExcelBorderStyle.Thin;

                    worksheet.Cells[rowHeader, colIndex]
                        .Style.Border.Right.Style =
                            ExcelBorderStyle.Thin;

                    worksheet.Cells[rowHeader, colIndex]
                        .Style.Border.Bottom.Style =
                            ExcelBorderStyle.Thin;



                    colIndex++;

                    foreach (var col in exportColumns)
                    {

                        worksheet.Cells[rowHeader, colIndex]
                            .Value = col.Caption;

                        worksheet.Cells[rowHeader, colIndex]
                            .Style.Font.Bold = true;

                        worksheet.Cells[rowHeader, colIndex]
                            .Style.Font.Size = 12;

                        worksheet.Cells[rowHeader, colIndex]
                            .Style.WrapText = true;

                        worksheet.Cells[rowHeader, colIndex]
                            .Style.HorizontalAlignment =
                                ExcelHorizontalAlignment.Center;

                        worksheet.Cells[rowHeader, colIndex]
                            .Style.VerticalAlignment =
                                ExcelVerticalAlignment.Center;
                        worksheet.Cells[rowHeader, colIndex].Style.Border.Top.Style = ExcelBorderStyle.Thin;

                        worksheet.Cells[rowHeader, colIndex]
                            .Style.Border.Left.Style =
                                ExcelBorderStyle.Thin;

                        worksheet.Cells[rowHeader, colIndex]
                            .Style.Border.Right.Style =
                                ExcelBorderStyle.Thin;

                        worksheet.Cells[rowHeader, colIndex]
                            .Style.Border.Bottom.Style =
                                ExcelBorderStyle.Thin;


                        colIndex++;
                    }

                    #endregion
                    // Set width theo từng cột sau khi đã build header
                    worksheet.Column(1).Width = 5; // STT

                    int widthColIndex = 2;

                    foreach (var col in exportColumns)
                    {
                        string field = col.Field;

                        if (field == "NgayMoKien")
                        {
                            worksheet.Column(widthColIndex).Width = 20;
                        }
                        else if (field == "SoLo")
                        {
                            worksheet.Column(widthColIndex).Width = 20;
                        }
                        else if (field == "NhaCungCap")
                        {
                            worksheet.Column(widthColIndex).Width = 34;
                        }
                        else if (field == "TenKH")
                        {
                            worksheet.Column(widthColIndex).Width = 20;
                        }
                        else if (field == "MoTa")
                        {
                            worksheet.Column(widthColIndex).Width = 45;
                        }
                        else if (field == "LyDo")
                        {
                            worksheet.Column(widthColIndex).Width = 45;
                        }
                        else
                        {
                            // Các cột còn lại đều nhau
                            worksheet.Column(widthColIndex).Width = 15.50;
                        }

                        // Set lại width Summary lần cuối vì vòng foreach phía trên có thể ghi đè cột B -> P.
                        worksheet.Column(2).Width = 25; // QC Summary
                        worksheet.Column(3).Width = 26; // TỔNG KIỂM QC
                        worksheet.Column(4).Width = 18; // PASS QC
                        worksheet.Column(5).Width = 18; // FAIL QC
                        worksheet.Column(6).Width = 26; // % LỖI QC
                        worksheet.Column(8).Width = 24;
                        worksheet.Column(12).Width = 30; // Merchandising Summary
                        worksheet.Column(13).Width = 26; // TỔNG KIỂM Mer
                        worksheet.Column(14).Width = 18; // PASS Mer
                        worksheet.Column(15).Width = 18; // FAIL Mer
                        worksheet.Column(16).Width = 26; // % LỖI Mer

                        widthColIndex++;
                    }

                    #region Data

                    int rowIndex = 8;

                    int stt = 1;

                    foreach (DataRow row in tblData.Rows)
                    {
                        int dataCol = 1;

                        worksheet.Row(rowIndex).CustomHeight = false;


                        #region STT

                        worksheet.Cells[rowIndex, dataCol].Value =
                            stt;

                        worksheet.Cells[rowIndex, dataCol]
                            .Style.HorizontalAlignment =
                                ExcelHorizontalAlignment.Center;

                        worksheet.Cells[rowIndex, dataCol]
                            .Style.VerticalAlignment =
                                ExcelVerticalAlignment.Center;
                        worksheet.Cells[rowIndex, dataCol]
    .Style.Border.Top.Style =
        ExcelBorderStyle.Thin;

                        worksheet.Cells[rowIndex, dataCol]
                            .Style.Border.Left.Style =
                                ExcelBorderStyle.Thin;

                        worksheet.Cells[rowIndex, dataCol]
                            .Style.Border.Right.Style =
                                ExcelBorderStyle.Thin;

                        worksheet.Cells[rowIndex, dataCol]
                            .Style.Border.Bottom.Style =
                                ExcelBorderStyle.Thin;
                        dataCol++;

                        #endregion

                        foreach (var col in exportColumns)
                        {
                            object value = "";

                            if (tblData.Columns.Contains(col.Field))
                            {
                                value = row[col.Field];
                            }

                            var cell =
                                worksheet.Cells[rowIndex, dataCol];
                            #region Result


                            if (col.Field == "Result" || col.Field == "Result_Mer")
                            {
                                string resultText = "";

                                if (value != DBNull.Value &&
                                    value != null)
                                {
                                    resultText =
                                        value.ToString()
                                            .Trim()
                                            .ToUpper();
                                }

                                cell.Style.Font.Bold = true;

                                if (resultText == "1" ||
                                    resultText == "PASS" ||
                                    resultText == "TRUE")
                                {
                                    cell.Value = "PASS";

                                    cell.Style.Font.Color.SetColor(
                                        System.Drawing.Color.Green);
                                }
                                else if (resultText == "0" ||
                                         resultText == "FAIL" ||
                                         resultText == "FALSE")
                                {
                                    cell.Value = "FAIL";

                                    cell.Style.Font.Color.SetColor(
                                        System.Drawing.Color.Red);
                                }
                                else
                                {
                                    // Không có kết luận thì để trống,
                                    // không tự ép thành FAIL
                                    cell.Value = "";

                                    cell.Style.Font.Color.SetColor(
                                        System.Drawing.Color.Black);

                                    cell.Style.Font.Bold = false;
                                }

                                cell.Style.HorizontalAlignment =
                                    ExcelHorizontalAlignment.Center;

                                cell.Style.VerticalAlignment =
                                    ExcelVerticalAlignment.Center;
                            }





                            #endregion

                            #region NgayKiem

                            else if (col.Field == "NgayMoKien")
                            {
                                if (value != DBNull.Value &&
                                    value != null)
                                {
                                    DateTime ngayKiem;

                                    if (value is DateTime)
                                    {
                                        ngayKiem = Convert.ToDateTime(value);
                                    }
                                    else
                                    {
                                        DateTime.TryParse(
                                            value.ToString(),
                                            out ngayKiem);
                                    }

                                    if (ngayKiem != DateTime.MinValue)
                                    {
                                        cell.Value = ngayKiem.Date;

                                        cell.Style.Numberformat.Format = "@";
                                        cell.Value = ngayKiem.ToString("dd/MM/yyyy");
                                    }
                                    else
                                    {
                                        cell.Value =
                                            value.ToString();
                                    }
                                }
                            }

                            #endregion

                            #region NgayKiem

                            else if (col.Field == "NgayKiem")
                            {
                                if (value != DBNull.Value &&
                                    value != null)
                                {
                                    DateTime ngayKiem;

                                    if (value is DateTime)
                                    {
                                        ngayKiem =
                                            Convert.ToDateTime(value);
                                    }
                                    else
                                    {
                                        DateTime.TryParse(
                                            value.ToString(),
                                            out ngayKiem);
                                    }

                                    if (ngayKiem != DateTime.MinValue)
                                    {
                                        cell.Value = ngayKiem.Date;

                                        cell.Style.Numberformat.Format = "@";
                                        cell.Value = ngayKiem.ToString("dd/MM/yyyy");

                                        cell.Style.Font.Color.SetColor(
                                            System.Drawing.Color.Black);

                                        cell.Style.Font.Bold = false;

                                        if (tblData.Columns.Contains("NgayMoKien") &&
                                            row["NgayMoKien"] != DBNull.Value &&
                                            row["NgayMoKien"] != null)
                                        {
                                            DateTime ngayMoKien;

                                            if (row["NgayMoKien"] is DateTime)
                                            {
                                                ngayMoKien =
                                                    Convert.ToDateTime(row["NgayMoKien"]);
                                            }
                                            else
                                            {
                                                DateTime.TryParse(
                                                    row["NgayMoKien"].ToString(),
                                                    out ngayMoKien);
                                            }

                                            if (ngayMoKien != DateTime.MinValue &&
                                                ngayMoKien.Date < ngayKiem.Date)
                                            {
                                                cell.Style.Font.Color.SetColor(
                                                    System.Drawing.Color.Red);

                                                cell.Style.Font.Bold = true;
                                            }
                                        }
                                    }
                                    else
                                    {
                                        cell.Value =
                                            value.ToString();
                                    }
                                }
                            }

                            #endregion

                            #region Normal

                            else
                            {
                                cell.Value = value;
                            }
                            if (col.Field == "MoTa" || col.Field == "LyDo")
                            {
                                cell.Style.WrapText = true;

                                cell.Style.VerticalAlignment =
                                    ExcelVerticalAlignment.Center;

                                cell.Style.HorizontalAlignment =
                                    ExcelHorizontalAlignment.Left;
                            }
                            #endregion

                            cell.Style.WrapText = true;

                            cell.Style.Font.Name =
                                "Times New Roman";

                            cell.Style.Font.Size = 13;

                            if (col.Field == "MoTa" || col.Field == "LyDo")
                            {
                                cell.Style.HorizontalAlignment =
                                    ExcelHorizontalAlignment.Left;

                                cell.Style.VerticalAlignment =
                                    ExcelVerticalAlignment.Center;
                            }
                            else
                            {
                                cell.Style.HorizontalAlignment =
                                    ExcelHorizontalAlignment.Center;

                                cell.Style.VerticalAlignment =
                                    ExcelVerticalAlignment.Center;
                            }

                            cell.Style.Border.Top.Style =
                                ExcelBorderStyle.Thin;

                            cell.Style.Border.Left.Style =
                                ExcelBorderStyle.Thin;

                            cell.Style.Border.Right.Style =
                                ExcelBorderStyle.Thin;

                            cell.Style.Border.Bottom.Style =
                                ExcelBorderStyle.Thin;

                            dataCol++;
                        }

                        stt++;
                        rowIndex++;
                    }

                    #endregion
                    #region Auto Width Height

                    if (worksheet.Dimension != null)
                    {

                        #region Auto Width



                        //worksheet.Column(10).Width =
                        //    isNguyenLieu
                        //        ? 42
                        //        : 35;



                        //if (!isNguyenLieu)
                        //{
                        //    worksheet.Column(15).Width = 45;
                        //}

                        #endregion

                        #region Auto Height

                        for (int row = 7;
                            row <= worksheet.Dimension.End.Row;
                            row++)
                        {
                            double maxHeight = 28.50;

                            for (int col = 1;
                                col <= worksheet.Dimension.End.Column;
                                col++)
                            {
                                string cellText =
                                    worksheet.Cells[row, col]
                                        .Text;

                                if (string.IsNullOrWhiteSpace(
                                    cellText))
                                {
                                    continue;
                                }

                                int textLength =
                                    cellText.Length;

                                double estimatedHeight = 28;

                                if (textLength > 30)
                                {
                                    estimatedHeight = 45;
                                }

                                if (textLength > 60)
                                {
                                    estimatedHeight = 65;
                                }

                                if (textLength > 100)
                                {
                                    estimatedHeight = 90;
                                }

                                if (estimatedHeight > maxHeight)
                                {
                                    maxHeight =
                                        estimatedHeight;
                                }
                            }

                            worksheet.Row(row).CustomHeight =
                                true;

                            worksheet.Row(row).Height =
                                maxHeight;
                        }

                        #endregion
                    }

                    #endregion
                    #region Outer Border

                    int lastRow =
                        rowIndex - 1;

                    int lastCol =
                        exportColumns.Count + 1;

                    using (ExcelRange range =
                        worksheet.Cells[
                            rowHeader,
                            1,
                            lastRow,
                            lastCol])
                    {
                        range.Style.Border.Top.Style =
                            ExcelBorderStyle.Thin;

                        range.Style.Border.Left.Style =
                            ExcelBorderStyle.Thin;

                        range.Style.Border.Right.Style =
                            ExcelBorderStyle.Thin;

                        range.Style.Border.Bottom.Style =
                            ExcelBorderStyle.Thin;
                    }

                    #endregion

                    worksheet.Cells["E5"].Style.Font.Color.SetColor(Color.Red);
                    worksheet.Cells["F5"].Style.Font.Color.SetColor(Color.Red);
                    worksheet.Cells["L5"].Style.Font.Color.SetColor(Color.Red);
                    worksheet.Cells["K5"].Style.Font.Color.SetColor(Color.Red);
                    worksheet.Cells["E5:L5"].Style.WrapText = false;
                    byte[] fileBytes =
                        package.GetAsByteArray();

                    HttpResponseMessage response =
                        new HttpResponseMessage(
                            HttpStatusCode.OK);

                    response.Content =
                        new ByteArrayContent(fileBytes);

                    response.Content.Headers.ContentDisposition =
                        new System.Net.Http.Headers
                        .ContentDispositionHeaderValue(
                            "attachment")
                        {
                            FileName =
                                $"BaoCaoTongHop_{DateTime.Now:ddMMyyyyHHmmss}.xlsx"
                        };

                    response.Content.Headers.ContentType =
                        new System.Net.Http.Headers
                        .MediaTypeHeaderValue(
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

                    return response;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);

                return new HttpResponseMessage(
                    HttpStatusCode.InternalServerError);
            }
        }




        #endregion


        #region Minh Thông NTB XuatExcel
        [HttpPost]
        [Route("ExportBC")]
        // Xuất biên bản kiểm phụ liệu BM04 và tab IMG ra file Excel.
        public async Task<HttpResponseMessage> ExportBC(JObject objSoLo)
        {
            try
            {
                int rowStart = 9;
                int rowIdx = 9;
                int colIdx = 3;
                string templatePath = System.Web.HttpContext.Current.Server.MapPath(@"\Content\Templates\TemplateBBKiemPL.xlsx");

                DataTable tblBC = await _model.Get("GetBC", objSoLo["SoLoID"]?.ToString(), "NONE", "NONE", "NONE", "NONE");
                DataTable tblDonViTinh = await _model.Get("GetDonViVT", "NONE", "NONE", "NONE", "NONE", "NONE");


                DataTable tblDanhGia = await _model.Get(
                "GetXN_PL",
                objSoLo["SoLoID"]?.ToString(),
                "ALL",
                "ALL",
                "NONE",
                "NONE"
            );
                DataTable tblImgKiemPL = await _model.Get(
                    "GetImgKiemPL",
                    objSoLo["SoLoID"]?.ToString(),
                    "ALL",
                    "ALL",
                    "NONE",
                    "NONE"
                );

                FileInfo templateFile = new FileInfo(templatePath);
                string fileName = $"BM04/QT13/CL01-{DateTime.Now.ToString("ddMMyyyyhhmmss")}.xlsx";

                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.Commercial;

                using (ExcelPackage package = new ExcelPackage(templateFile))
                {
                    ExcelWorksheet worksheet = package.Workbook.Worksheets["BM04"];
                    ExcelWorksheet wsImg = package.Workbook.Worksheets["IMG"];

                    worksheet.Cells.Style.Font.Name = "Times New Roman";

                    if (wsImg != null)
                    {
                        BuildImgSheetKiemPL(wsImg, tblImgKiemPL);
                    }

                    await Task.Run(() =>
                    {
                        if (tblBC != null && tblBC.Rows.Count > 0)
                        {
                            DataRow rowHeader = tblBC.Rows[0];
                            worksheet.Cells["A6"].Value = worksheet.Cells["A6"].Text + ": " + objSoLo["TenKH"]?.ToString();
                            worksheet.Cells["A7"].Value = worksheet.Cells["A7"].Text + ": " + objSoLo["TenNCC"]?.ToString();
                            worksheet.Cells["E6"].Value = worksheet.Cells["E6"].Text + ": " + objSoLo["SoDDH"]?.ToString();

                            string ngayNKFormatted = "";
                            if (!string.IsNullOrEmpty(objSoLo["NgayNK"]?.ToString()))
                            {
                                if (DateTime.TryParse(objSoLo["NgayNK"].ToString(), out DateTime ngayNK))
                                {
                                    ngayNKFormatted = ngayNK.ToString("dd/MM/yyyy");
                                }
                            }
                            worksheet.Cells["E7"].Value = worksheet.Cells["E7"].Text + ": " + ngayNKFormatted;

                            var boldTextRange = worksheet.Cells["A5:J6"];
                            boldTextRange.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Left;
                            boldTextRange.Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;
                            boldTextRange.Style.Font.Bold = true;

                            int templateStartRow = 1;


                            int detailStartRow = 9;


                            int templateNoteRow = 22;


                            int templateEndRow = 30;

                            int pageStartCol = 1; // A
                            int pageEndCol = 8;   // H

                            int firstDataCol = 3; // C
                            int lastDataCol = 8;  // H

                            int maxDataColsPerPage = lastDataCol - firstDataCol + 1; // C:H = 6 cột

                            var dynamicColumns = tblBC.Columns
                                .Cast<DataColumn>()
                                .Where(c => c.ColumnName.Contains("@MaNPL@"))
                                .ToList();

                            var detailRows = tblBC.AsEnumerable()
                                .Where(r => (r["MaPhuLuc"]?.ToString() ?? "") != "NONE")
                                .OrderBy(r => Convert.ToInt32(r["STT"] == DBNull.Value ? 0 : r["STT"]))
                                .ThenBy(r => r["MaPhuLuc"]?.ToString())
                                .ToList();

                            int templateDetailRowCount = templateNoteRow - detailStartRow;
                            int actualDetailRowCount = detailRows.Count;

                            if (actualDetailRowCount > templateDetailRowCount)
                            {
                                int addRows = actualDetailRowCount - templateDetailRowCount;

                                worksheet.InsertRow(templateNoteRow, addRows, templateNoteRow - 1);

                                templateNoteRow += addRows;
                            }
                            else if (actualDetailRowCount < templateDetailRowCount)
                            {
                                int deleteStartRow = detailStartRow + actualDetailRowCount;
                                int deleteCount = templateDetailRowCount - actualDetailRowCount;

                                worksheet.DeleteRow(deleteStartRow, deleteCount);

                                templateNoteRow -= deleteCount;
                            }


                            templateEndRow = templateNoteRow + 5;

                            int pageHeight = templateEndRow - templateStartRow + 1;

                            // Chừa 3 dòng giữa 2 page: ví dụ row 31, 32, 33
                            int pageGapRows = 3;

                            // Mỗi block = khung page + 3 dòng tách
                            int pageBlockHeight = pageHeight + pageGapRows;

                            // Vùng 3 dòng tách lấy từ ngay sau templateEndRow
                            int templateGapStartRow = templateEndRow + 1;
                            int templateGapEndRow = templateEndRow + pageGapRows;
                            ApplySignatureRowsLayout(
                                worksheet,
                                templateNoteRow
                            );
                            int totalPages = (int)Math.Ceiling(dynamicColumns.Count / (double)maxDataColsPerPage);
                            if (totalPages < 1) totalPages = 1;

                            for (int page = 1; page < totalPages; page++)
                            {
                                // Page kế bắt đầu sau page trước + 3 dòng tách
                                // Ví dụ page 1: row 1 -> 30
                                // row 31 -> 33: dòng tách
                                // page 2 bắt đầu row 34
                                int newPageStartRow = templateStartRow + page * pageBlockHeight;

                                // 3 dòng tách nằm ngay trước page mới
                                int newGapStartRow = newPageStartRow - pageGapRows;

                                // Copy 3 dòng tách từ template, nếu template có footer/logo/text ở row 31-33
                                worksheet.Cells[
                                    templateGapStartRow,
                                    pageStartCol,
                                    templateGapEndRow,
                                    pageEndCol
                                ].Copy(
                                    worksheet.Cells[
                                        newGapStartRow,
                                        pageStartCol,
                                        newGapStartRow + pageGapRows - 1,
                                        pageEndCol
                                    ]
                                );

                                for (int r = 0; r < pageGapRows; r++)
                                {
                                    worksheet.Row(newGapStartRow + r).Height =
                                        worksheet.Row(templateGapStartRow + r).Height;

                                    worksheet.Row(newGapStartRow + r).CustomHeight =
                                        worksheet.Row(templateGapStartRow + r).CustomHeight;
                                }

                                // Sau 3 dòng tách mới copy khung page kế
                                worksheet.Cells[
                                    templateStartRow,
                                    pageStartCol,
                                    templateEndRow,
                                    pageEndCol
                                ].Copy(
                                    worksheet.Cells[
                                        newPageStartRow,
                                        pageStartCol,
                                        newPageStartRow + pageHeight - 1,
                                        pageEndCol
                                    ]
                                );

                                for (int r = 0; r < pageHeight; r++)
                                {
                                    worksheet.Row(newPageStartRow + r).Height =
                                        worksheet.Row(templateStartRow + r).Height;

                                    worksheet.Row(newPageStartRow + r).CustomHeight =
                                        worksheet.Row(templateStartRow + r).CustomHeight;
                                }

                                int newNoteRow = newPageStartRow + (templateNoteRow - templateStartRow);

                                ApplySignatureRowsLayout(
                                    worksheet,
                                    newNoteRow
                                );

                                AddVikingLogoToPage(
                                    worksheet,
                                    newPageStartRow,
                                    page
                                );

                                // Ngắt trang tại dòng cuối của vùng tách
                                worksheet.Row(newPageStartRow - 1).PageBreak = true;
                            }

                            for (int page = 0; page < totalPages; page++)
                            {
                                int pageStartRow = templateStartRow + page * pageBlockHeight;
                                int currentDetailStartRow = pageStartRow + (detailStartRow - templateStartRow);
                                int currentNoteRow = pageStartRow + (templateNoteRow - templateStartRow);
                                int currentTemplateEndRow = pageStartRow + (templateEndRow - templateStartRow);

                                ApplySignatureRowsLayout(
                                    worksheet,
                                    currentNoteRow
                                );

                                var pageColumns = dynamicColumns
                                    .Skip(page * maxDataColsPerPage)
                                    .Take(maxDataColsPerPage)
                                    .ToList();
                                worksheet.Cells[
                                    currentDetailStartRow,
                                    firstDataCol,
                                    currentNoteRow - 1,
                                    lastDataCol
                                ].Clear();

                                int rowIdxPage = currentDetailStartRow;

                                foreach (DataRow row in detailRows)
                                {
                                    string maPhuLuc = row["MaPhuLuc"]?.ToString() ?? "";

                                    int stt = row["STT"] != DBNull.Value
                                        ? Convert.ToInt32(row["STT"])
                                        : 0;

                                    worksheet.Cells[rowIdxPage, 1].Value = stt == 0 ? "" : (object)stt;
                                    worksheet.Cells[rowIdxPage, 2].Value = CleanText(row["PhuLuc"]?.ToString());

                                    StyleCellBasic(worksheet.Cells[rowIdxPage, 1]);
                                    StyleCellBasic(worksheet.Cells[rowIdxPage, 2]);

                                    worksheet.Cells[rowIdxPage, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                    worksheet.Cells[rowIdxPage, 2].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;

                                    int colIdxPage = firstDataCol;

                                    foreach (DataColumn col in pageColumns)
                                    {
                                        string rawValue = row[col.ColumnName]?.ToString() ?? "";
                                        var parts = rawValue.Split('@').Select(s => s.Trim()).ToArray();

                                        string note = parts.Length > 0 ? parts[0].Replace("none", "").Trim() : "";
                                        string status = parts.Length > 1 ? parts[1].ToLower() : "";
                                        string img = parts.Length > 2 ? parts[2].Replace("none", "").Trim() : "";
                                        string maDvTinh = parts.Length > 3 ? parts[3].Replace("none", "").Trim() : "";
                                        string soMet = parts.Length > 4 ? parts[4].Replace("none", "").Trim() : "";
                                        string cuon = parts.Length > 5 ? parts[5].Replace("none", "").Trim() : "";

                                        string tenDV = "";
                                        if (tblDonViTinh != null && tblDonViTinh.Rows.Count > 0)
                                        {
                                            var dv = tblDonViTinh.AsEnumerable()
                                                .FirstOrDefault(x => x["MaDVVT"]?.ToString() == maDvTinh);

                                            if (dv != null)
                                                tenDV = dv["TenDVVT"]?.ToString();
                                        }

                                        if (status == "none") status = "";
                                        if (img == "none") img = "";

                                        var cell = worksheet.Cells[rowIdxPage, colIdxPage];

                                        bool isCheckType = new[]
                                        {
                                            "PhuLucPL_2", "PhuLucPL_3", "PhuLucPL_8", "PhuLucPL_9",
                                            "PhuLucPL_10", "PhuLucPL_11", "PhuLucPL_12",
                                            "PhuLucPL_13", "PhuLucPL_15", "PhuLucPL_16"
                                        }.Contains(maPhuLuc);

                                        bool isOnlyImageType = maPhuLuc == "PhuLucPL_1";

                                        bool hasUnit = new[]
                                        {
                                            "PhuLucPL_5", "PhuLucPL_6", "PhuLucPL_7"
                                        }.Contains(maPhuLuc);

                                        if (isCheckType)
                                        {
                                            SetCellWithImageAndStatus(
                                                worksheet,
                                                rowIdxPage,
                                                colIdxPage,
                                                img,
                                                status,
                                                note
                                            );
                                        }
                                        else if (isOnlyImageType)
                                        {
                                            SetCellWithImage(
                                                worksheet,
                                                rowIdxPage,
                                                colIdxPage,
                                                img,
                                                note
                                            );
                                        }
                                        else if (hasUnit)
                                        {
                                            cell.Value = string.IsNullOrWhiteSpace(note)
                                                ? tenDV
                                                : $"{note} {tenDV}";
                                        }
                                        else if (maPhuLuc == "PhuLucPL_14")
                                        {
                                            cell.Value = $"Tổng mét thực tế: {soMet} | Số cuộn: {cuon} | {tenDV}";
                                        }
                                        else
                                        {
                                            cell.Value = note;
                                        }

                                        StyleCellBasic(cell);

                                        colIdxPage++;
                                    }

                                    worksheet.Row(rowIdxPage).Height = maPhuLuc == "PhuLucPL_1" ? 95 : 60;

                                    rowIdxPage++;
                                }

                                AddConclusionNotesToPage(
                                         worksheet,
                                         currentNoteRow,
                                         pageColumns,
                                         firstDataCol,
                                         pageEndCol,
                                         tblDanhGia
                                     );


                                ApplyInsideBorder(
                                    worksheet,
                                    currentDetailStartRow,
                                    pageStartCol,
                                    currentNoteRow - 1,
                                    pageEndCol
                                );


                                ApplyOuterBorder(
                                    worksheet,
                                    pageStartRow,
                                    pageStartCol,
                                    currentTemplateEndRow,
                                    pageEndCol
                                );
                                AddDanhGiaSignatureImagesToPage(
                                    worksheet,
                                    currentNoteRow,
                                    tblDanhGia
                                );
                            }


                            int lastPrintRow =
                            templateStartRow
                            + totalPages * pageBlockHeight
                            - pageGapRows
                            - 1;

                            worksheet.PrinterSettings.PrintArea =
                                worksheet.Cells[
                                    templateStartRow,
                                    pageStartCol,
                                    lastPrintRow,
                                    pageEndCol
                                ];
                            worksheet.PrinterSettings.PaperSize = ePaperSize.A4;
                            worksheet.PrinterSettings.Orientation = eOrientation.Landscape;

                            worksheet.PrinterSettings.FitToPage = true;
                            worksheet.PrinterSettings.FitToWidth = 1;
                            worksheet.PrinterSettings.FitToHeight = 0;

                            worksheet.PrinterSettings.HorizontalCentered = true;
                            worksheet.PrinterSettings.VerticalCentered = false;

                            worksheet.PrinterSettings.TopMargin = 0.15M;
                            worksheet.PrinterSettings.BottomMargin = 0.15M;
                            worksheet.PrinterSettings.LeftMargin = 0.15M;
                            worksheet.PrinterSettings.RightMargin = 0.15M;
                            worksheet.PrinterSettings.HeaderMargin = 0.05M;
                            worksheet.PrinterSettings.FooterMargin = 0.05M;

                        }
                    });
                    package.Workbook.Calculate();
                    package.Workbook.Properties.Company = "NTB";
                    package.Workbook.Properties.Author = "NTB";


                    byte[] fileBytes = package.GetAsByteArray();
                    string contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

                    HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK)
                    {
                        Content = new ByteArrayContent(fileBytes)
                    };
                    response.Content.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("attachment")
                    {
                        FileName = fileName
                    };
                    response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);
                    return response;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occurred: " + ex.Message);
                return new HttpResponseMessage(HttpStatusCode.InternalServerError);
            }
        }
        // Tạo chuỗi tên có thêm khoảng trắng phía trước để căn giữa tương đối trong ô.
        private string CenterNameBySpaces(string name, int spaceCount)
        {
            if (string.IsNullOrWhiteSpace(name))
                return "";

            return new string(' ', spaceCount) + name.Trim();
        }
        // Định dạng ô chữ ký MER, cho phép xuống dòng và canh text phía trên.
        private void FormatMerSignatureTextCell(ExcelRange range)
        {
            if (range == null)
                return;

            range.Style.WrapText = true;
            range.Style.Font.Name = "Times New Roman";
            range.Style.Font.Size = 13;

            range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
            range.Style.VerticalAlignment = ExcelVerticalAlignment.Top;

            range.Style.ShrinkToFit = true;
        }

        // Kiểm tra chuỗi có dữ liệu thật hay chỉ là rỗng/null/none.
        private bool HasRealText(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return false;

            value = value.Trim();

            if (value.Equals("none", StringComparison.OrdinalIgnoreCase))
                return false;

            if (value.Equals("null", StringComparison.OrdinalIgnoreCase))
                return false;

            if (value == "—")
                return false;

            return true;
        }
        // Tạo nội dung text cho vùng chữ ký MER gồm kết quả, ghi chú và tên người ký.
        // Ghi chú dài thì tự giảm Alt+Enter để tên MER không bị đẩy mất khung.
        // Tên MER được tự cộng khoảng trắng theo width vùng MER để căn giữa tương đối.
        private string BuildMerSignatureCellText(
            ExcelWorksheet worksheet,
            int fromCol,
            int toCol,
            string signerName,
            int? resultMer,
            string ghiChuMer,
            int offsetSpaces = 0)
        {
            string ketQuaText;

            if (resultMer.HasValue)
            {
                ketQuaText = resultMer.Value == 1
                    ? "Kết quả: PASS"
                    : "Kết quả: FAIL";
            }
            else
            {
                ketQuaText = "Kết quả:";
            }

            string text = ketQuaText;

            int noteLineCount = 0;

            if (HasRealText(ghiChuMer))
            {
                string cleanNote = CleanOneLineText(ghiChuMer);

                text += "\nGhi chú: " + cleanNote;

                noteLineCount = EstimateWrappedLineCount(
                    worksheet,
                    fromCol,
                    toCol,
                    "Ghi chú: " + cleanNote
                );
            }

            if (!string.IsNullOrWhiteSpace(signerName))
            {

                int baseBlankLines = 10;


                int autoReduceLines = Math.Max(0, noteLineCount - 1);

                int blankLinesBeforeName = baseBlankLines - autoReduceLines;
                if (blankLinesBeforeName < 5)
                    blankLinesBeforeName = 5;

                for (int i = 0; i < blankLinesBeforeName; i++)
                {
                    text += "\n";
                }

                string cleanSignerName = CleanOneLineText(signerName);

                int spaceCount = CalcCenterSpaceForMergedRange(
                    worksheet,
                    fromCol,
                    toCol,
                    cleanSignerName
                );

                double totalMerWidth = 0;

                for (int c = fromCol; c <= toCol; c++)
                {
                    totalMerWidth += worksheet.Column(c).Width;
                }

                // MER càng rộng thì tự cộng thêm khoảng trắng
                int autoExtraSpaces = (int)Math.Round(totalMerWidth / 18.0);

                spaceCount += autoExtraSpaces + offsetSpaces;

                if (spaceCount < 0)
                    spaceCount = 0;

                text += new string(' ', spaceCount) + cleanSignerName;
            }

            return text;
        }

        // Ước lượng ghi chú MER wrap thành bao nhiêu dòng theo width vùng MER.
        private int EstimateWrappedLineCount(
            ExcelWorksheet worksheet,
            int fromCol,
            int toCol,
            string text)
        {
            if (worksheet == null || string.IsNullOrWhiteSpace(text))
                return 1;

            double totalWidth = 0;

            for (int c = fromCol; c <= toCol; c++)
            {
                totalWidth += worksheet.Column(c).Width;
            }

            int charsPerLine = (int)Math.Floor(totalWidth * 0.95);

            if (charsPerLine < 15)
                charsPerLine = 15;

            int lineCount = (int)Math.Ceiling(text.Trim().Length / (double)charsPerLine);

            if (lineCount < 1)
                lineCount = 1;

            return lineCount;
        }

        // Chuẩn hóa text thành 1 dòng, tránh tên MER bị xuống dòng.
        private string CleanOneLineText(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return "";

            return value
                .Replace("\r", " ")
                .Replace("\n", " ")
                .Replace("\t", " ")
                .Trim();
        }

        // Tính khoảng trắng để căn giữa tên MER theo tổng width vùng merge.
        private int CalcCenterSpaceForMergedRange(
            ExcelWorksheet worksheet,
            int fromCol,
            int toCol,
            string text)
        {
            if (worksheet == null || string.IsNullOrWhiteSpace(text))
                return 0;

            double totalWidth = 0;

            for (int c = fromCol; c <= toCol; c++)
            {
                totalWidth += worksheet.Column(c).Width;
            }

            string cleanText = CleanOneLineText(text);
            double charFactor = 1.55;

            int totalCharCount = (int)Math.Round(totalWidth * charFactor);
            int textLength = cleanText.Length;

            int spaceCount = (totalCharCount - textLength) / 2;

            if (spaceCount < 0)
                spaceCount = 0;

            return spaceCount;
        }
        // Lấy giá trị chuỗi từ DataRow theo tên cột, nếu không có thì trả về rỗng.
        private string GetStringFromRow(DataRow row, string columnName)
        {
            if (row == null || row.Table == null || !row.Table.Columns.Contains(columnName))
                return "";

            return Convert.ToString(row[columnName] ?? "").Trim();
        }
        // Tự điều chỉnh độ rộng các cột ghi chú kết luận QC/MER cho cân đều.
        private void ApplyAutoEqualConclusionColumnWidth(ExcelWorksheet worksheet, DataTable tblDanhGia, List<DataColumn> pageColumns, int firstDataCol, int pageEndCol)
        {
            if (worksheet == null)
                return;


            int fromCol = firstDataCol;
            int toCol = pageEndCol;


            worksheet.Column(1).Width = 5;
            worksheet.Column(2).Width = 32;

            int maxLen = 0;

            if (tblDanhGia != null && pageColumns != null && pageColumns.Count > 0)
            {
                foreach (DataColumn col in pageColumns)
                {
                    string maNPL = ExtractMaNPLFromDynamicColumn(col.ColumnName);
                    DataRow rowDanhGia = GetDanhGiaRowByMaNPL(tblDanhGia, maNPL);

                    string qcNote = NormalizeConclusionNote(
                        GetStringFromRow(rowDanhGia, "KL_QC_Pass")
                    );

                    string merNote = NormalizeConclusionNote(
                        GetStringFromRow(rowDanhGia, "KQ_GiaiQuyet")
                    );

                    maxLen = Math.Max(maxLen, ("X " + qcNote).Length);
                    maxLen = Math.Max(maxLen, ("X " + merNote).Length);
                }
            }

            double autoWidth = Math.Ceiling(maxLen / 5.0) + 2;

            double minWidth = 18;
            double maxWidth = 30;

            if (autoWidth < minWidth)
                autoWidth = minWidth;

            if (autoWidth > maxWidth)
                autoWidth = maxWidth;

            for (int c = fromCol; c <= toCol; c++)
            {
                worksheet.Column(c).Width = autoWidth;
            }
        }
        // Ghi phần ghi chú kết luận QC và MER vào từng trang Excel.
        private void AddConclusionNotesToPage(ExcelWorksheet worksheet, int currentNoteRow, List<DataColumn> pageColumns, int firstDataCol, int pageEndCol, DataTable tblDanhGia)
        {
            if (worksheet == null)
                return;

            int rowQC = currentNoteRow;
            int rowMer = currentNoteRow + 1;

            worksheet.Cells[rowQC, 1, rowMer, pageEndCol].Clear();

            ApplyAutoEqualConclusionColumnWidth(
                worksheet,
                tblDanhGia,
                pageColumns,
                firstDataCol,
                pageEndCol
            );

            worksheet.Cells[rowQC, 2].Value = "Ghi chú - Kết luận QC:";
            worksheet.Cells[rowMer, 2].Value = "Ghi chú - Kết luận Mer:";

            StyleConclusionLabelCell(worksheet.Cells[rowQC, 2]);
            StyleConclusionLabelCell(worksheet.Cells[rowMer, 2]);

            int colIdx = firstDataCol;

            foreach (DataColumn col in pageColumns)
            {
                string maNPL = ExtractMaNPLFromDynamicColumn(col.ColumnName);

                DataRow rowDanhGia = GetDanhGiaRowByMaNPL(tblDanhGia, maNPL);

                int? resultQC = GetNullableIntFromRow(rowDanhGia, "Result");
                int? resultMer = GetNullableIntFromRow(rowDanhGia, "Result_Mer");

                string ghiChuQC = GetStringFromRow(rowDanhGia, "KL_QC_Pass");
                string ghiChuMer = GetStringFromRow(rowDanhGia, "KQ_GiaiQuyet");

                SetConclusionResultCell(
                    worksheet.Cells[rowQC, colIdx],
                    resultQC,
                    ghiChuQC
                );

                SetConclusionResultCell(
                    worksheet.Cells[rowMer, colIdx],
                    resultMer,
                    ghiChuMer
                );

                colIdx++;
            }


            for (int c = colIdx; c <= pageEndCol; c++)
            {
                worksheet.Cells[rowQC, c].Value = "";
                worksheet.Cells[rowMer, c].Value = "";

                StyleConclusionResultCell(worksheet.Cells[rowQC, c]);
                StyleConclusionResultCell(worksheet.Cells[rowMer, c]);
            }

            for (int r = rowQC; r <= rowMer; r++)
            {
                for (int c = 1; c <= pageEndCol; c++)
                {
                    worksheet.Cells[r, c].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                    worksheet.Cells[r, c].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                    worksheet.Cells[r, c].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                    worksheet.Cells[r, c].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                }
            }
            double qcHeight = CalcConclusionAutoRowHeight(
                worksheet,
                tblDanhGia,
                pageColumns,
                "KL_QC_Pass",
                firstDataCol
            );

            double merHeight = CalcConclusionAutoRowHeight(
                worksheet,
                tblDanhGia,
                pageColumns,
                "KQ_GiaiQuyet",
                firstDataCol
            );

            worksheet.Row(rowQC).CustomHeight = true;
            worksheet.Row(rowMer).CustomHeight = true;

            worksheet.Row(rowQC).Height = qcHeight;
            worksheet.Row(rowMer).Height = merHeight;
        }
        // Tính chiều cao dòng ghi chú kết luận dựa theo độ dài nội dung.
        // Tính chiều cao dòng ghi chú QC/MER theo số dòng wrap thực tế.
        private double CalcConclusionAutoRowHeight(
            ExcelWorksheet worksheet,
            DataTable tblDanhGia,
            List<DataColumn> pageColumns,
            string noteColumn,
            int firstDataCol)
        {
            if (worksheet == null)
                return 45;

            double maxHeight = 45;

            if (tblDanhGia == null || pageColumns == null || pageColumns.Count == 0)
                return maxHeight;

            int colIndex = firstDataCol;

            foreach (DataColumn col in pageColumns)
            {
                string maNPL = ExtractMaNPLFromDynamicColumn(col.ColumnName);
                DataRow row = GetDanhGiaRowByMaNPL(tblDanhGia, maNPL);

                string note = NormalizeConclusionNote(
                    GetStringFromRow(row, noteColumn)
                );

                string fullText = "* " + note;

                if (string.IsNullOrWhiteSpace(fullText))
                {
                    colIndex++;
                    continue;
                }

                double colWidth = worksheet.Column(colIndex).Width;

                // Width Excel khoảng 1 ký tự / 1 đơn vị width.
                int charsPerLine = (int)Math.Floor(colWidth * 0.95);

                if (charsPerLine < 10)
                    charsPerLine = 10;

                int lineCount = 0;

                string[] lines = fullText
                    .Replace("\r", "")
                    .Split('\n');

                foreach (string line in lines)
                {
                    int len = line.Trim().Length;

                    if (len == 0)
                    {
                        lineCount++;
                    }
                    else
                    {
                        lineCount += (int)Math.Ceiling(len / (double)charsPerLine);
                    }
                }

                if (lineCount < 1)
                    lineCount = 1;

                // Font 11 cần khoảng 14-16 height / dòng
                double estimatedHeight = 10 + lineCount * 16;

                if (estimatedHeight > maxHeight)
                    maxHeight = estimatedHeight;

                colIndex++;
            }

            // Không cắt 110 nữa, cho phép cao để hiện full text
            if (maxHeight < 45)
                maxHeight = 45;

            if (maxHeight > 320)
                maxHeight = 320;

            return maxHeight;
        }

        // Tách mã MaNPL từ tên cột động có dạng @MaNPL@.
        private string ExtractMaNPLFromDynamicColumn(string columnName)
        {
            if (string.IsNullOrWhiteSpace(columnName))
                return "";

            string token = "@MaNPL@";

            if (!columnName.Contains(token))
                return "";

            var parts = columnName.Split(new[] { token }, StringSplitOptions.None);

            if (parts.Length < 2)
                return "";

            return parts[1].Trim();
        }

        private int? GetNullableIntFromRow(DataRow row, string columnName)
        {
            if (row == null || row.Table == null || !row.Table.Columns.Contains(columnName))
                return null;

            object obj = row[columnName];

            if (obj == null || obj == DBNull.Value)
                return null;

            if (obj is bool boolValue)
                return boolValue ? 1 : 0;

            string text = obj.ToString().Trim();

            if (string.IsNullOrWhiteSpace(text))
                return null;

            if (text.Equals("true", StringComparison.OrdinalIgnoreCase))
                return 1;

            if (text.Equals("false", StringComparison.OrdinalIgnoreCase))
                return 0;

            if (text.Equals("pass", StringComparison.OrdinalIgnoreCase))
                return 1;

            if (text.Equals("fail", StringComparison.OrdinalIgnoreCase))
                return 0;

            int number;
            if (int.TryParse(text, out number))
                return number;

            return null;
        }

        // Tìm dòng đánh giá theo MaNPL trong bảng xác nhận.
        private DataRow GetDanhGiaRowByMaNPL(DataTable table, string maNPL)
        {
            if (table == null || table.Rows.Count == 0)
                return null;

            if (!table.Columns.Contains("MaNPL"))
                return null;

            return table.AsEnumerable()
                .FirstOrDefault(r =>
                    Convert.ToString(r["MaNPL"] ?? "").Trim()
                        .Equals(maNPL, StringComparison.OrdinalIgnoreCase));
        }

        // Định dạng ô kết quả kết luận QC/MER
        private void StyleConclusionResultCell(ExcelRange cell)
        {
            if (cell == null)
                return;

            cell.Style.Font.Name = "Times New Roman";
            cell.Style.Font.Size = 13;
            cell.Style.WrapText = true;

            // Không căn giữa, phải nằm trái
            cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;

            // Canh trên để text dài không bị che
            cell.Style.VerticalAlignment = ExcelVerticalAlignment.Center;

            cell.Style.Indent = 1;
        }

        // Ghi ký tự kết quả PASS/FAIL và ghi chú vào ô kết luận.
        private void SetConclusionResultCell(ExcelRange cell, int? result, string note)
        {
            if (cell == null)
                return;

            cell.Value = null;
            cell.RichText.Clear();
            cell.IsRichText = true;

            string statusText = "*";

            if (result.HasValue)
            {
                statusText = result.Value == 1 ? "Pass" : "Fail";
            }

            var richStatus = cell.RichText.Add(statusText + " ");
            richStatus.Bold = false;
            richStatus.Size = 11;
            richStatus.FontName = "Times New Roman";

            string displayNote = NormalizeConclusionNote(note);

            if (!string.IsNullOrWhiteSpace(displayNote))
            {
                var richNote = cell.RichText.Add(displayNote);
                richNote.Bold = false;
                richNote.Size = 11;
                richNote.FontName = "Times New Roman";
                richNote.Color = System.Drawing.Color.Black;
            }

            StyleConclusionResultCell(cell);
        }

        // Chuẩn hóa ghi chú rỗng/null/none thành dấu gạch ngang.
        private string NormalizeConclusionNote(string note)
        {
            if (string.IsNullOrWhiteSpace(note))
                return "";

            string value = note.Trim();

            if (value.Equals("none", StringComparison.OrdinalIgnoreCase))
                return "";

            if (value.Equals("null", StringComparison.OrdinalIgnoreCase))
                return "";

            return value;
        }

        // Định dạng ô label “Ghi chú - Kết luận QC/MER”.
        private void StyleConclusionLabelCell(ExcelRange cell)
        {
            if (cell == null)
                return;

            cell.Style.Font.Name = "Times New Roman";
            cell.Style.Font.Size = 13;
            cell.Style.Font.Bold = true;
            cell.Style.WrapText = true;
            cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
            cell.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
            cell.Style.Indent = 0;
        }
        // Chèn hình chữ ký QC, QC Manager và MER vào vùng chữ ký cuối trang.
        private void AddDanhGiaSignatureImagesToPage(ExcelWorksheet worksheet, int currentNoteRow, DataTable tblDanhGia)
        {
            if (worksheet == null || tblDanhGia == null || tblDanhGia.Rows.Count == 0)
                return;
            int row28 = currentNoteRow + 3;
            int row29 = currentNoteRow + 4;
            int row30 = currentNoteRow + 5;

            RemoveSignaturePicturesInArea(worksheet, row28, row30);


            int? resultQC = GetMinNullableInt(tblDanhGia, "Result");

            if (!resultQC.HasValue)
            {
                string rawResult = GetFirstNotEmpty(tblDanhGia, "Result");

                if (rawResult.Equals("PASS", StringComparison.OrdinalIgnoreCase))
                    resultQC = 1;
                else if (rawResult.Equals("FAIL", StringComparison.OrdinalIgnoreCase))
                    resultQC = 0;
            }

            int? resultMer = GetMinNullableInt(tblDanhGia, "Result_Mer");

            // Lấy đúng path chữ ký từ database/SP GetXN_PL
            string signQC = GetFirstNotEmpty(
                tblDanhGia,
                "Sign_Pass"
            );

            string signTPCL = GetFirstNotEmpty(
                tblDanhGia,
                "TPCL_ComfirmSign",
                "ReceivedInfo_Sign"
            );

            string signMer = GetFirstNotEmpty(
                tblDanhGia,
                "KQ_GiaiQuyet_Sign"
            );


            string qcName = GetFirstNotEmpty(
                tblDanhGia,
                "QCName",
                "TenNV",
                "UserSign_QC"
            );

            string qcManagerName = GetFirstNotEmpty(
                tblDanhGia,
                "QCManagerName",
                "QCManager",
                "UserSign_QC_Manager"
            );

            string merName = GetFirstNotEmpty(
                tblDanhGia,
                "MerName",
                "UserSign_Mer"
            );

            string ghiChuMer = GetFirstNotEmpty(tblDanhGia, "GhiChu_Mer");
            string ngayKiemQC = GetFirstDateText(tblDanhGia, "NgayKiem_Pass");


            string ngayTPCL = GetFirstDateText(tblDanhGia, "TPCL_ComfirmDate");

            var passSignFrame = new ToaDoChuKyEntity
            {
                WidthInch = 1.35,
                HeightInch = 0.75,
                ReserveTopTextPx = 38,
                PaddingLeftPx = 4,
                PaddingTopPx = 2,
                MoveUpPx = 8,
                MoveRightPx = 0,
                UseForceOffsetX = false,
                ForceOffsetX = 0,
                AllowOverflowRight = false,

                DrawFrameIfNoCellBorder = true
            };

            var failQCSignFrame = new ToaDoChuKyEntity
            {

                WidthInch = 1.45,
                HeightInch = 0.75,


                ReserveTopTextPx = 48,

                PaddingLeftPx = 4,
                PaddingTopPx = 2,


                MoveUpPx = 0,
                MoveRightPx = 0,

                UseForceOffsetX = false,
                ForceOffsetX = 0,
                AllowOverflowRight = false,

                DrawFrameIfNoCellBorder = true
            };

            var failTPCLSignFrame = new ToaDoChuKyEntity
            {
                // Cùng size với PASS
                WidthInch = 1.45,
                HeightInch = 0.75,

                // TPCL có nhiều dòng chữ hơn nên chừa trên nhiều hơn QC
                ReserveTopTextPx = 56,

                PaddingLeftPx = 4,
                PaddingTopPx = 2,

                // Không kéo ảnh lên
                MoveUpPx = 0,
                MoveRightPx = 0,

                UseForceOffsetX = false,
                ForceOffsetX = 0,
                AllowOverflowRight = false,

                DrawFrameIfNoCellBorder = true
            };

            var merSignFrame = new ToaDoChuKyEntity
            {
                WidthInch = 4.20,
                HeightInch = 1.60,
                ReserveTopTextPx = HasRealText(ghiChuMer) ? 78 : 58,
                PaddingLeftPx = 0,
                PaddingTopPx = 2,
                MoveUpPx = 0,
                MoveRightPx = 0,

                DrawFrameIfNoCellBorder = true
            };

            if (resultQC == 1)
            {
                worksheet.Cells[row28, 1, row28, 2].Value =
                BuildSignatureCellText(
                    worksheet,
                    1,
                    2,
                    "Ngày kiểm tra/Date",
                    ngayKiemQC,
                    qcName,
                    2
                );

                worksheet.Cells[row29, 1, row30, 2].Merge = true;

                worksheet.Cells[row29, 1, row30, 2].Value =
                    BuildSignatureCellText(
                        worksheet,
                        1,
                        2,
                        "Ngày/Date",
                        ngayTPCL,
                        qcManagerName,
                        3
                    );

                FormatSignatureTextCell(worksheet.Cells[row28, 1, row28, 2]);
                FormatSignatureTextCell(worksheet.Cells[row29, 1, row30, 2]);

                worksheet.Cells[row29, 1, row29, 2].Style.Font.Bold = false;
                worksheet.Cells[row29, 1, row29, 2].Style.Font.Size = 13;
                worksheet.Cells[row29, 1, row29, 2].Style.Font.Name = "Times New Roman";
                FormatSignatureTextCell(worksheet.Cells[row28, 1, row28, 2]);
                FormatSignatureTextCell(worksheet.Cells[row30, 1, row30, 2]);
                AddImageToExcelRange(
                    worksheet,
                    signQC,
                    row28, 2,
                    row28, 2,
                    passSignFrame
                );
                AddImageToExcelRange(
                    worksheet,
                    signTPCL,
                    row30, 2,
                    row30, 2,
                    passSignFrame
                );
            }
            else
            {
                worksheet.Row(row28).Height = 140;
                worksheet.Row(row28).CustomHeight = true;
                // ===== QC FAIL =====
                worksheet.Cells[row28, 3, row28, 4].Merge = true;
                worksheet.Cells[row28, 3, row28, 4].Value =
                    BuildFailSignatureCellText(
                        worksheet,
                        3,
                        4,
                        "Ngày kiểm tra/Date",
                        ngayKiemQC,
                        qcName,
                        2,   // ít dòng trống để tên không bị đẩy quá thấp
                        -1
                    );

                // ===== TPCL FAIL =====
                worksheet.Cells[row29, 3, row30, 4].Merge = true;
                worksheet.Cells[row29, 3, row30, 4].Value =
                    BuildFailSignatureCellText(
                        worksheet,
                        3,
                        4,
                        "Nhận thông tin/Received info.\nNgày / Date",
                        ngayTPCL,
                        qcManagerName,
                        2,   // ít dòng hơn để không đè ảnh
                        -1
                    );

                // format đúng vùng
                FormatSignatureTextCell(worksheet.Cells[row28, 3, row28, 4]);
                FormatSignatureTextCell(worksheet.Cells[row29, 3, row30, 4]);

                worksheet.Cells[row28, 3, row28, 4].Style.Font.Bold = false;
                worksheet.Cells[row29, 3, row30, 4].Style.Font.Bold = false;

                worksheet.Cells[row28, 3, row28, 4].Style.Font.Size = 13;
                worksheet.Cells[row29, 3, row30, 4].Style.Font.Size = 13;

                worksheet.Cells[row28, 3, row28, 4].Style.Font.Name = "Times New Roman";
                worksheet.Cells[row29, 3, row30, 4].Style.Font.Name = "Times New Roman";

                // chèn ảnh
                AddImageToExcelRange(
                    worksheet,
                    signQC,
                    row28, 3,
                    row28, 4,
                    failQCSignFrame
                );

                AddImageToExcelRange(
                    worksheet,
                    signTPCL,
                    row30, 3,
                    row30, 4,
                    failTPCLSignFrame
                );
            }
            worksheet.Cells[row28, 5, row30, 8].Value =
                BuildMerSignatureCellText(
                    worksheet,
                    5,
                    8,
                    merName,
                    resultMer,
                    ghiChuMer,
                    2
                );
            FormatMerSignatureTextCell(worksheet.Cells[row28, 5, row30, 8]);
            AddImageToExcelRange(
                worksheet,
                signMer,
                row28, 5,
                row30, 8,
                merSignFrame

    );
        }


        private string BuildFailSignatureCellText(
        ExcelWorksheet worksheet,
        int fromCol,
        int toCol,
        string dateLabel,
        string dateText,
        string signerName,
        int blankLinesBeforeName,
        int nameOffsetSpaces = 0)
        {
            string text = $"{dateLabel}: {dateText}\nKý/Signed:";

            // Không cho xuống quá nhiều dòng để tránh vượt border
            if (blankLinesBeforeName < 0)
                blankLinesBeforeName = 0;

            if (blankLinesBeforeName > 3)
                blankLinesBeforeName = 3;

            // Mỗi lần chỉ xuống 1 dòng, không dùng \n\n\n
            for (int i = 0; i < blankLinesBeforeName; i++)
            {
                text += "\n\n\n";
            }

            if (!string.IsNullOrWhiteSpace(signerName))
            {
                int spaceCount = CalcCenterSpaceForMergedRange(
                    worksheet,
                    fromCol,
                    toCol,
                    signerName
                );

                spaceCount += nameOffsetSpaces;

                if (spaceCount < 0)
                    spaceCount = 0;

                text += new string(' ', spaceCount) + signerName.Trim();
            }

            return text;
        }
        private string BuildSignatureCellText(
      ExcelWorksheet worksheet,
      int fromCol,
      int toCol,
      string dateLabel,
      string dateText,
      string signerName,
      int blankLinesBeforeName,
      int nameOffsetSpaces = 0)
        {
            string text = $"{dateLabel}: {dateText}\nKý/Signed:";

            for (int i = 0; i < blankLinesBeforeName; i++)
            {
                text += "\n\n";
            }

            if (!string.IsNullOrWhiteSpace(signerName))
            {
                int spaceCount = CalcCenterSpaceForMergedRange(
                    worksheet,
                    fromCol,
                    toCol,
                    signerName
                );

                spaceCount += nameOffsetSpaces;

                if (spaceCount < 0)
                    spaceCount = 0;

                // Chỉ dòng tên có thêm khoảng trắng để nằm giữa
                text += new string(' ', spaceCount) + signerName.Trim();
            }

            return text;
        }


        // Đổi đơn vị inch sang pixel để tính kích thước ảnh.
        private int InchToPx(double inch)
        {
            return (int)Math.Round(inch * 96.0);
        }

        // Định dạng ô text chữ ký QC/QC Manager.
        private void FormatSignatureTextCell(ExcelRange range)
        {
            if (range == null)
                return;

            range.Style.WrapText = true;
            range.Style.Font.Name = "Times New Roman";
            range.Style.Font.Size = 13;
            range.Style.VerticalAlignment = ExcelVerticalAlignment.Top;
            range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
        }
        // Lấy ngày đầu tiên có dữ liệu trong DataTable và format dd/MM/yyyy.
        private string GetFirstDateText(DataTable table, string columnName)
        {
            if (table == null || !table.Columns.Contains(columnName))
                return "";

            foreach (DataRow row in table.Rows)
            {
                if (row[columnName] == DBNull.Value)
                    continue;
                string raw = row[columnName]?.ToString()?.Trim();
                if (string.IsNullOrWhiteSpace(raw))
                    continue;
                if (DateTime.TryParse(raw, out DateTime date))
                    return date.ToString("dd/MM/yyyy");

                return raw;
            }
            return "";
        }

        private int? GetMinNullableInt(DataTable table, string columnName)
        {
            if (table == null || !table.Columns.Contains(columnName))
                return null;

            List<int> values = new List<int>();

            foreach (DataRow row in table.Rows)
            {
                object obj = row[columnName];

                if (obj == null || obj == DBNull.Value)
                    continue;

                if (obj is bool boolValue)
                {
                    values.Add(boolValue ? 1 : 0);
                    continue;
                }

                string text = obj.ToString().Trim();

                if (string.IsNullOrWhiteSpace(text))
                    continue;

                if (text.Equals("true", StringComparison.OrdinalIgnoreCase))
                {
                    values.Add(1);
                    continue;
                }

                if (text.Equals("false", StringComparison.OrdinalIgnoreCase))
                {
                    values.Add(0);
                    continue;
                }

                if (text.Equals("pass", StringComparison.OrdinalIgnoreCase))
                {
                    values.Add(1);
                    continue;
                }

                if (text.Equals("fail", StringComparison.OrdinalIgnoreCase))
                {
                    values.Add(0);
                    continue;
                }

                int number;
                if (int.TryParse(text, out number))
                {
                    values.Add(number);
                }
            }

            if (values.Count == 0)
                return null;

            return values.Min();
        }

        // Lấy giá trị đầu tiên không rỗng trong một cột của DataTable.
        // Lấy giá trị đầu tiên có dữ liệu thật từ nhiều cột.
        // Dùng cho chữ ký QC/TPCL/MER vì SP có thể trả path ở cột chính hoặc cột fallback.
        private string GetFirstNotEmpty(DataTable table, params string[] columnNames)
        {
            if (table == null || table.Rows.Count == 0 || columnNames == null)
                return "";

            foreach (string columnName in columnNames)
            {
                if (string.IsNullOrWhiteSpace(columnName))
                    continue;

                if (!table.Columns.Contains(columnName))
                    continue;

                foreach (DataRow row in table.Rows)
                {
                    string value = Convert.ToString(row[columnName] ?? "").Trim();

                    if (!HasRealText(value))
                        continue;

                    // Chữ ký xuất Excel phải là path lấy từ DB, không lấy base64 canvas
                    if (value.StartsWith("data:image", StringComparison.OrdinalIgnoreCase))
                        continue;

                    return value;
                }
            }

            return "";
        }
        // Xóa các hình chữ ký cũ trong vùng dòng chữ ký trước khi chèn hình mới.
        private void RemoveSignaturePicturesInArea(ExcelWorksheet worksheet, int fromRow, int toRow)
        {
            if (worksheet == null || worksheet.Drawings == null)
                return;
            var removeList = worksheet.Drawings
                .Where(d =>
                    d.From != null &&
                    d.From.Row + 1 >= fromRow &&
                    d.From.Row + 1 <= toRow &&
                    d.From.Column + 1 >= 1 &&
                    d.From.Column + 1 <= 8)
                .ToList();
            foreach (var drawing in removeList)
            {
                worksheet.Drawings.Remove(drawing);
            }
        }

        // Chèn hình chữ ký vào vùng ô Excel theo kích thước và vị trí cấu hình.
        private void AddImageToExcelRange(ExcelWorksheet worksheet, string imgPath, int fromRow, int fromCol, int toRow, int toCol, ToaDoChuKyEntity config)
        {
            try
            {
                if (worksheet == null || string.IsNullOrWhiteSpace(imgPath))
                    return;
                FileInfo imgFile = ResolveImageFile(imgPath);

                if (imgFile == null || !imgFile.Exists)
                    return;
                if (config == null)
                    return;
                int rangeWidthPx = GetRangeWidthPx(worksheet, fromCol, toCol);
                int rangeHeightPx = GetRangeHeightPx(worksheet, fromRow, toRow);

                int fixedWidthPx = InchToPx(config.WidthInch);
                int fixedHeightPx = InchToPx(config.HeightInch);
                fixedWidthPx = Math.Min(fixedWidthPx, Math.Max(20, rangeWidthPx - 8));
                fixedHeightPx = Math.Min(fixedHeightPx, Math.Max(20, rangeHeightPx - config.ReserveTopTextPx - 4));
                int offsetX;

                if (config.UseForceOffsetX)
                {
                    offsetX = config.ForceOffsetX;
                }
                else if (config.AlignRight)
                {
                    offsetX = rangeWidthPx - fixedWidthPx - config.PaddingRightPx + config.MoveRightPx;
                }
                else
                {
                    offsetX = Math.Max(
                        config.PaddingLeftPx,
                        (rangeWidthPx - fixedWidthPx) / 2
                    ) + config.MoveRightPx;
                }
                if (offsetX < 0)
                    offsetX = 0;
                int maxOffsetX = Math.Max(0, rangeWidthPx - fixedWidthPx - 2);
                if (!config.AllowOverflowRight && offsetX > maxOffsetX)
                {
                    offsetX = maxOffsetX;
                }


                int offsetY = config.ReserveTopTextPx + config.PaddingTopPx - config.MoveUpPx;

                if (offsetY < 0) offsetY = 0;
                if (offsetY + fixedHeightPx > rangeHeightPx - 2)
                {
                    fixedHeightPx = Math.Max(20, rangeHeightPx - offsetY - 2);
                }
                var picture = worksheet.Drawings.AddPicture(
                    $"SIGN_{fromRow}_{fromCol}_{Guid.NewGuid():N}",
                    imgFile
                );
                picture.SetPosition(
                    fromRow - 1,
                    offsetY,
                    fromCol - 1,
                    offsetX
                );
                picture.SetSize(fixedWidthPx, fixedHeightPx);

                picture.EditAs = eEditAs.OneCell;


                if (config.DrawFrameIfNoCellBorder && !RangeHasVisibleBorder(worksheet, fromRow, fromCol, toRow, toCol))
                {
                    AddSignatureRectangleFrame(
                        worksheet,
                        fromRow,
                        fromCol,
                        offsetX,
                        offsetY,
                        fixedWidthPx,
                        fixedHeightPx
                    );
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Add signature image error: " + ex.Message);
            }
        }
        // Kiểm tra vùng ô có border hiển thị hay chưa.
        private bool RangeHasVisibleBorder(ExcelWorksheet worksheet, int fromRow, int fromCol, int toRow, int toCol)
        {
            if (worksheet == null)
                return false;
            var topLeft = worksheet.Cells[fromRow, fromCol];
            var bottomRight = worksheet.Cells[toRow, toCol];
            bool hasTop =
                topLeft.Style.Border.Top.Style != ExcelBorderStyle.None;
            bool hasLeft =
                topLeft.Style.Border.Left.Style != ExcelBorderStyle.None;
            bool hasBottom =
                bottomRight.Style.Border.Bottom.Style != ExcelBorderStyle.None;
            bool hasRight =
                bottomRight.Style.Border.Right.Style != ExcelBorderStyle.None;
            return hasTop || hasLeft || hasBottom || hasRight;
        }

        // Vẽ khung chữ nhật quanh vùng chữ ký nếu vùng đó chưa có border.
        private void AddSignatureRectangleFrame(ExcelWorksheet worksheet, int row, int col, int offsetX, int offsetY, int width, int height)
        {
            try
            {
                if (worksheet == null)
                    return;

                string frameNamePrefix = $"SIGN_FRAME_{row}_{col}_";

                var oldFrames = worksheet.Drawings
                    .Where(x => x.Name != null && x.Name.StartsWith(frameNamePrefix))
                    .ToList();

                foreach (var oldFrame in oldFrames)
                {
                    worksheet.Drawings.Remove(oldFrame);
                }

                var rect = worksheet.Drawings.AddShape(
                    $"{frameNamePrefix}{Guid.NewGuid():N}",
                    eShapeStyle.Rect
                );

                rect.SetPosition(row - 1, offsetY, col - 1, offsetX);
                rect.SetSize(width, height);

                rect.Fill.Style = eFillStyle.NoFill;
                rect.Border.Width = 1;
                rect.Border.Fill.Color = System.Drawing.Color.Black;
                rect.EditAs = eEditAs.OneCell;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Add signature frame error: " + ex.Message);
            }
        }
        // Chuyển đường dẫn ảnh URL/base64/relative path thành FileInfo để EPPlus đọc được.
        private FileInfo ResolveImageFile(string imgPath)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(imgPath))
                    return null;

                string path = imgPath.Trim();

                if (path.Equals("none", StringComparison.OrdinalIgnoreCase) ||
                    path.Equals("null", StringComparison.OrdinalIgnoreCase))
                    return null;

                path = path.Replace("\\", "/");

                // Không xử lý base64 ở đây nữa.
                // Chữ ký phải là path lấy từ database.
                if (path.StartsWith("data:image", StringComparison.OrdinalIgnoreCase))
                {
                    System.Diagnostics.Debug.WriteLine(
                        "ResolveImageFile bỏ qua base64, chỉ nhận path từ database."
                    );

                    return null;
                }

                if (path.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                    path.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
                {
                    Uri uri = new Uri(path);
                    path = uri.AbsolutePath;
                }

                // Nếu DB lưu đường dẫn vật lý đầy đủ: D:/..., E:/...
                if (Path.IsPathRooted(path) && File.Exists(path))
                    return new FileInfo(path);

                string webRoot = HostingEnvironment.MapPath("~/");

                if (string.IsNullOrWhiteSpace(webRoot))
                    webRoot = AppDomain.CurrentDomain.BaseDirectory;

                string imagesRoot = HostingEnvironment.MapPath("~/Images");

                if (string.IsNullOrWhiteSpace(imagesRoot))
                    imagesRoot = Path.Combine(webRoot, "Images");

                string cleanPath = path.TrimStart('/');

                // Case 1:
                // SQL lưu /Images/NhanVien/...
                // SQL lưu /Images/KiemPL/...
                // => map từ web root: ~/Images/...
                string fullPathFromWebRoot = Path.Combine(
                    webRoot,
                    cleanPath.Replace("/", Path.DirectorySeparatorChar.ToString())
                );

                if (File.Exists(fullPathFromWebRoot))
                    return new FileInfo(fullPathFromWebRoot);

                // Case 2:
                // SQL lưu NhanVien/abc.png
                // SQL lưu KiemPL/Sign-PL-xxx/signMer.png
                // => map từ ~/Images/...
                string pathAfterImages = cleanPath;

                if (pathAfterImages.StartsWith("Images/", StringComparison.OrdinalIgnoreCase))
                {
                    pathAfterImages = pathAfterImages.Substring("Images/".Length);
                }

                string fullPathFromImages = Path.Combine(
                    imagesRoot,
                    pathAfterImages.Replace("/", Path.DirectorySeparatorChar.ToString())
                );

                if (File.Exists(fullPathFromImages))
                    return new FileInfo(fullPathFromImages);

                System.Diagnostics.Debug.WriteLine(
                    "Không tìm thấy file chữ ký từ DB: " + imgPath +
                    " | TryWebRoot: " + fullPathFromWebRoot +
                    " | TryImages: " + fullPathFromImages
                );

                return null;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(
                    "ResolveImageFile error: " + ex.Message
                );

                return null;
            }
        }


        // Ghi ô kiểm có trạng thái PASS/FAIL/NO kèm ghi chú.
        private void SetCellWithImageAndStatus(ExcelWorksheet worksheet, int row, int col, string imgPath, string status, string note)
        {
            var cell = worksheet.Cells[row, col];
            cell.Value = null;
            cell.RichText.Clear();
            string statusText = "";
            if (status == "pass") statusText = "✓";
            else if (status == "fail") statusText = "X";
            else statusText = "*";
            if (!string.IsNullOrEmpty(statusText))
            {
                var richTextStatus = cell.RichText.Add(statusText);
                richTextStatus.Bold = true;
                richTextStatus.Size = 13;
            }
            if (!string.IsNullOrEmpty(note))
            {
                if (!string.IsNullOrEmpty(statusText))
                {
                    cell.RichText.Add("\n");
                }
                var richTextNote = cell.RichText.Add(note);
                richTextNote.Bold = false;
                richTextNote.Size = 12;
                richTextNote.Color = System.Drawing.Color.Black;
            }
            cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            cell.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
            cell.Style.WrapText = true;
        }
        // Ghi ô dạng hình ảnh hoặc ghi chú đơn giản.
        private void SetCellWithImage(ExcelWorksheet worksheet, int row, int col, string imgPath, string note)
        {
            string displayText = string.IsNullOrEmpty(note) ? "" : note;
            worksheet.Cells[row, col].Value = displayText;
            worksheet.Cells[row, col].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet.Cells[row, col].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;
        }
        // Tính tổng chiều rộng pixel của một vùng cột Excel.
        private int GetRangeWidthPx(ExcelWorksheet worksheet, int fromCol, int toCol)
        {
            int total = 0;

            for (int col = fromCol; col <= toCol; col++)
            {
                double width = worksheet.Column(col).Width;
                if (width <= 0)
                    width = 8.43;
                total += (int)Math.Round(width * 7.0 + 5.0);
            }

            return total;
        }
        // Tính tổng chiều cao pixel của một vùng dòng Excel.
        private int GetRangeHeightPx(ExcelWorksheet worksheet, int fromRow, int toRow)
        {
            int total = 0;

            for (int row = fromRow; row <= toRow; row++)
            {
                double heightPoint = worksheet.Row(row).Height;

                if (heightPoint <= 0)
                    heightPoint = 15;
                total += (int)Math.Round(heightPoint * 96.0 / 72.0);
            }
            return total;
        }

        // Thiết lập layout chiều cao và style cho các dòng chữ ký cuối trang.
        private void ApplySignatureRowsLayout(ExcelWorksheet worksheet, int currentNoteRow)
        {

            int row27 = currentNoteRow + 2;
            int row28 = currentNoteRow + 3;
            int row29 = currentNoteRow + 4;
            int row30 = currentNoteRow + 5;

            worksheet.Row(row27).Height = 68;
            worksheet.Row(row28).Height = 130;
            worksheet.Row(row29).Height = 34;
            worksheet.Row(row30).Height = 120;

            worksheet.Row(row27).CustomHeight = true;
            worksheet.Row(row28).CustomHeight = true;
            worksheet.Row(row29).CustomHeight = true;
            worksheet.Row(row30).CustomHeight = true;

            using (var range = worksheet.Cells[row27, 1, row30, 8])
            {
                range.Style.Font.Name = "Times New Roman";
                range.Style.Font.Size = 13;
                range.Style.WrapText = true;
                range.Style.VerticalAlignment = ExcelVerticalAlignment.Top;
                range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;

                range.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                range.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                range.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
            }
            worksheet.Cells[row27, 1, row27, 2].Style.Font.Bold = true;
            worksheet.Cells[row27, 3, row27, 4].Style.Font.Bold = true;
            worksheet.Cells[row27, 5, row27, 8].Style.Font.Bold = true;
            worksheet.Cells[row29, 1, row29, 2].Style.Font.Bold = true;
            worksheet.Cells[row29, 3, row29, 4].Style.Font.Bold = true;
            ApplyOuterBorder(worksheet, row27, 1, row28, 2);
            ApplyOuterBorder(worksheet, row27, 3, row28, 4);
            ApplyOuterBorder(worksheet, row27, 5, row30, 8);
            ApplyOuterBorder(worksheet, row29, 1, row30, 2);
            ApplyOuterBorder(worksheet, row29, 3, row30, 4);
        }

        // Định dạng cơ bản cho một ô Excel: font, border, căn lề.
        private void StyleCellBasic(ExcelRange cell)
        {
            cell.Style.Font.Name = "Times New Roman";
            cell.Style.Font.Size = 11;
            cell.Style.WrapText = true;
            cell.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
            cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

            cell.Style.Border.Top.Style = ExcelBorderStyle.Thin;
            cell.Style.Border.Left.Style = ExcelBorderStyle.Thin;
            cell.Style.Border.Right.Style = ExcelBorderStyle.Thin;
            cell.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
        }
        // Áp dụng border bên trong cho một vùng ô Excel.
        private void ApplyInsideBorder(ExcelWorksheet ws, int fromRow, int fromCol, int toRow, int toCol)
        {
            if (toRow < fromRow || toCol < fromCol) return;
            for (int r = fromRow; r <= toRow; r++)
            {
                for (int c = fromCol; c <= toCol; c++)
                {
                    var cell = ws.Cells[r, c];

                    cell.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                    cell.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                    cell.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    cell.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                }
            }
        }
        // Áp dụng border ngoài cho một vùng ô Excel.
        private void ApplyOuterBorder(ExcelWorksheet ws, int fromRow, int fromCol, int toRow, int toCol)
        {
            if (toRow < fromRow || toCol < fromCol) return;
            for (int c = fromCol; c <= toCol; c++)
            {
                ws.Cells[fromRow, c].Style.Border.Top.Style = ExcelBorderStyle.Medium;
            }
            for (int c = fromCol; c <= toCol; c++)
            {
                ws.Cells[toRow, c].Style.Border.Bottom.Style = ExcelBorderStyle.Medium;
            }
            for (int r = fromRow; r <= toRow; r++)
            {
                ws.Cells[r, fromCol].Style.Border.Left.Style = ExcelBorderStyle.Medium;
            }

            for (int r = fromRow; r <= toRow; r++)
            {
                ws.Cells[r, toCol].Style.Border.Right.Style = ExcelBorderStyle.Medium;
            }
        }

        // Chèn logo Viking vào từng trang Excel.
        private void AddVikingLogoToPage(ExcelWorksheet worksheet, int pageStartRow, int pageIndex)
        {
            try
            {
                string logoPath = HostingEnvironment.MapPath(
                    "~/Content/Image/NoBG/LOGOVIKINGMT.png"
                );
                if (string.IsNullOrWhiteSpace(logoPath) || !File.Exists(logoPath))
                    return;
                var logoFile = new FileInfo(logoPath);
                var picture = worksheet.Drawings.AddPicture(
                    $"VIKING_LOGO_PAGE_{pageIndex}_{Guid.NewGuid():N}",
                    logoFile
                );
                picture.SetPosition(pageStartRow, 4, 1, 68);
                picture.SetSize(78, 65);

            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Add logo error: " + ex.Message);
            }
        }

        // Làm sạch text trước khi ghi vào Excel.
        private string CleanText(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return "";

            string text = input
                .Replace("\r", "")
                .Replace("\u00A0", " ")
                .Replace("\n\n", "\n")
                .Trim();

            while (text.Contains("  "))
            {
                text = text.Replace("  ", " ");
            }

            return text;
        }
        // Chèn hình kiểm phụ liệu vào đúng ô hình trong tab IMG.
        private void AddImageToImgBox(ExcelWorksheet ws, string imgPath, int row, int col)
        {
            try
            {
                if (ws == null || string.IsNullOrWhiteSpace(imgPath))
                    return;

                FileInfo imgFile = ResolveImageFile(imgPath);

                if (imgFile == null || !imgFile.Exists)
                    return;

                int boxWidthPx = GetRangeWidthPx(ws, col, col);
                int boxHeightPx = GetRangeHeightPx(ws, row, row);

                const int imageWidthPx = 350;
                const int imageHeightPx = 300;

                int finalWidth = imageWidthPx;
                int finalHeight = imageHeightPx;

                if (finalWidth > boxWidthPx - 10)
                    finalWidth = Math.Max(30, boxWidthPx - 10);

                if (finalHeight > boxHeightPx - 10)
                    finalHeight = Math.Max(30, boxHeightPx - 10);

                int moveRightPx = 0; // chỉnh ảnh qua phải nhẹ

                int offsetX = Math.Max(0, ((boxWidthPx - finalWidth) / 2) + moveRightPx);
                int offsetY = Math.Max(0, (boxHeightPx - finalHeight) / 2);

                var pic = ws.Drawings.AddPicture(
                    $"IMG_KIEMPL_{row}_{col}_{Guid.NewGuid():N}",
                    imgFile
                );

                pic.SetPosition(
                    row - 1,
                    offsetY,
                    col - 1,
                    offsetX
                );

                pic.SetSize(finalWidth, finalHeight);
                pic.EditAs = eEditAs.OneCell;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Add IMG sheet image error: " + ex.Message);
            }
        }


        private void BuildImgSheetKiemPL(ExcelWorksheet ws, DataTable tblImg)
        {
            if (ws == null)
                return;

            ws.Cells.Clear();
            ws.Drawings.Clear();

            ws.Cells.Style.Font.Name = "Times New Roman";
            ws.Cells.Style.Font.Size = 13;

            ws.View.ShowGridLines = true;
            ws.Column(1).Width = 13;
            ws.Column(2).Width = 17.43;
            ws.Column(3).Width = 35.71;
            ws.Column(4).Width = 55;
            ws.Column(5).Width = 55;
            ws.Column(6).Width = 55;

            if (tblImg == null || tblImg.Rows.Count == 0)
                return;

            int currentRow = 1;

            const int imagesPerLine = 3;
            var itemGroups = tblImg.AsEnumerable()
                .Where(r => !string.IsNullOrWhiteSpace(Convert.ToString(r["Image"] ?? "")))
                .GroupBy(r => new
                {
                    ItemCode = Convert.ToString(r["ItemCode"] ?? "").Trim(),

                    Dot = string.IsNullOrWhiteSpace(Convert.ToString(r["Dot"] ?? "").Trim())
                        ? "1"
                        : Convert.ToString(r["Dot"] ?? "").Trim()
                })
                .OrderBy(g => g.Key.ItemCode)
                .ThenBy(g => g.Key.Dot)
                .ToList();

            foreach (var itemGroup in itemGroups)
            {
                string itemCode = itemGroup.Key.ItemCode;
                string dot = itemGroup.Key.Dot;
                WriteImgItemCodeHeader(ws, currentRow, itemCode, dot);
                currentRow += 1;
                var phuLucGroups = itemGroup
                    .GroupBy(r => new
                    {
                        MaPhuLucKiem = Convert.ToString(r["MaPhuLucKiem"] ?? "").Trim(),
                        PhuLuc = Convert.ToString(r["PhuLuc"] ?? "").Trim(),

                        STTPhuLuc =
                            r.Table.Columns.Contains("STTPhuLuc") && r["STTPhuLuc"] != DBNull.Value
                                ? Convert.ToInt32(r["STTPhuLuc"])
                                : 9999
                    })
                    .OrderBy(g => g.Key.STTPhuLuc)
                    .ThenBy(g => g.Key.MaPhuLucKiem)
                    .ToList();

                foreach (var phuLucGroup in phuLucGroups)
                {
                    string phuLuc = phuLucGroup.Key.PhuLuc;
                    int sttPhuLuc = phuLucGroup.Key.STTPhuLuc;

                    var images = phuLucGroup
                        .Where(r => !string.IsNullOrWhiteSpace(Convert.ToString(r["Image"] ?? "")))
                        .OrderBy(r =>
                        {
                            int stt;
                            return int.TryParse(Convert.ToString(r["STT"]), out stt) ? stt : 0;
                        })
                        .ThenBy(r =>
                        {
                            int id;
                            return int.TryParse(Convert.ToString(r["ID"]), out id) ? id : 0;
                        })
                        .ToList();
                    if (images.Count == 0)
                        continue;
                    int imageRowCount = (int)Math.Ceiling(images.Count / (double)imagesPerLine);

                    int blockStartRow = currentRow;
                    int blockEndRow = currentRow + imageRowCount - 1;

                    for (int r = blockStartRow; r <= blockEndRow; r++)
                    {
                        ws.Row(r).Height = 262.50;
                        ws.Row(r).CustomHeight = true;
                    }
                    var sttRange = ws.Cells[blockStartRow, 1, blockEndRow, 1];
                    sttRange.Merge = true;
                    sttRange.Value = sttPhuLuc <= 0 || sttPhuLuc == 9999
                        ? ""
                        : sttPhuLuc.ToString();

                    sttRange.Style.Font.Bold = true;
                    sttRange.Style.Font.Size = 12;
                    sttRange.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    sttRange.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    ApplyThinBorder(sttRange);

                    var phuLucRange = ws.Cells[blockStartRow, 2, blockEndRow, 3];
                    phuLucRange.Merge = true;
                    phuLucRange.Value = phuLuc;
                    phuLucRange.Style.WrapText = true;
                    phuLucRange.Style.Font.Size = 13;
                    phuLucRange.Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                    phuLucRange.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    phuLucRange.Style.Indent = 1;
                    ApplyThinBorder(phuLucRange);
                    for (int r = blockStartRow; r <= blockEndRow; r++)
                    {
                        for (int c = 4; c <= 6; c++)
                        {
                            var cell = ws.Cells[r, c];
                            cell.Value = "";
                            cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            cell.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                            ApplyThinBorder(cell);
                        }
                    }
                    for (int i = 0; i < images.Count; i++)
                    {
                        int imgRow = blockStartRow + (i / imagesPerLine);
                        int imgCol = 4 + (i % imagesPerLine); // D/E/F

                        string imagePath = Convert.ToString(images[i]["Image"] ?? "").Trim();

                        AddImageToImgBox(
                            ws,
                            imagePath,
                            imgRow,
                            imgCol
                        );
                    }
                    ApplyMediumBorder(ws.Cells[blockStartRow, 1, blockEndRow, 6]);
                    currentRow = blockEndRow + 1;
                }
            }
            ws.PrinterSettings.PrintArea = ws.Cells[1, 1, Math.Max(1, currentRow - 1), 6];
            ws.PrinterSettings.PaperSize = ePaperSize.A4;
            ws.PrinterSettings.Orientation = eOrientation.Landscape;
            ws.PrinterSettings.FitToPage = true;
            ws.PrinterSettings.FitToWidth = 1;
            ws.PrinterSettings.FitToHeight = 0;
            ws.PrinterSettings.HorizontalCentered = true;
            ws.PrinterSettings.VerticalCentered = false;
        }


        private void ApplyThinBorder(ExcelRange range)
        {
            if (range == null)
                return;

            range.Style.Border.Top.Style = ExcelBorderStyle.Thin;
            range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
            range.Style.Border.Left.Style = ExcelBorderStyle.Thin;
            range.Style.Border.Right.Style = ExcelBorderStyle.Thin;
        }

        private void WriteImgItemCodeHeader(ExcelWorksheet ws, int headerRow, string itemCode, string dot)
        {
            if (ws == null)
                return;

            if (string.IsNullOrWhiteSpace(dot))
                dot = "1";

            int blankRow = headerRow + 1;

            ws.Row(headerRow).Height = 30;
            ws.Row(blankRow).Height = 30;

            var titleRange = ws.Cells[headerRow, 1, headerRow, 6];
            titleRange.Merge = true;
            titleRange.Value = $"Item Code: {itemCode} (Lần {dot})";

            titleRange.Style.Font.Bold = true;
            titleRange.Style.Font.Size = 14;
            titleRange.Style.Font.Color.SetColor(System.Drawing.Color.DarkBlue);
            titleRange.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            titleRange.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
            titleRange.Style.Fill.PatternType = ExcelFillStyle.Solid;
            titleRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(226, 239, 218));

            ApplyThinBorder(titleRange);

            for (int c = 1; c <= 6; c++)
            {
                var blankCell = ws.Cells[blankRow, c];
                blankCell.Value = "";
                blankCell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                blankCell.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                ApplyThinBorder(blankCell);
            }
        }

        private void ApplyMediumBorder(ExcelRange range)
        {
            if (range == null)
                return;

            range.Style.Border.Top.Style = ExcelBorderStyle.Medium;
            range.Style.Border.Bottom.Style = ExcelBorderStyle.Medium;
            range.Style.Border.Left.Style = ExcelBorderStyle.Medium;
            range.Style.Border.Right.Style = ExcelBorderStyle.Medium;
        }
        #endregion



    }
}