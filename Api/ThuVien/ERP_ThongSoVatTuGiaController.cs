using NtbSoft.ERP.Entity.Kho;
using NtbSoft.ERP.Model.Kho;
using System;
using System.Collections.Generic;
using System.Data;
using System.Web.Http;

namespace NtbSoft.ERP.Web.Api.ThuVien
{
    [RoutePrefix("api/ERPVatTuGia")]
    public class ERPThongSoVatTuGiaController : ApiController
    {
        private VatTuGiaModel model = new VatTuGiaModel();

        [HttpGet]
        [Route("GetTienTe")]
        public DataTable GetTienTe()
        {
            try
            {
                return model.GetTienTe();
            }
            catch
            {
                return new DataTable();
            }
        }

        [HttpGet]
        [Route("GetGia")]
        public DataTable GetGia(string maNhom = null)
        {
            try
            {
                return model.Get(maNhom);
            }
            catch
            {
                return new DataTable();
            }
        }

        [HttpGet]
        [Route("GetGiaByTenNhom")]
        public DataTable GetGiaByTenNhom(string tenNhom)
        {
            try
            {
                return model.GetByTenNhom(tenNhom);
            }
            catch
            {
                return new DataTable();
            }
        }


        [HttpPost]
        [Route("PostVatTuGia")]
        public string PostVatTuGia([FromBody] List<VatTuGiaDto> data)
        {
            try
            {
                return model.Save(data);
            }
            catch (Exception ex)
            {
                return ex.ToString();
            }
        }

        [HttpGet]
        [Route("GetGiaHistory")]
        public DataTable GetGiaHistory(string maVTID, string extra)
        {
            try
            {
                return model.GetHistory(maVTID, extra);
            }
            catch
            {
                return new DataTable();
            }
        }
        [HttpGet]
        [Route("GetVatTuByMaVT")]
        public DataTable GetVatTuByMaVT(string keyword)
        {
            try
            {
                return model.GetVatTuByMaVT(keyword);
            }
            catch
            {
                return new DataTable();
            }
        }

        [HttpGet]
        [Route("GetGiaByNgayApDung")]
        public DataTable GetGiaByNgayApDung(
            DateTime tuNgay,
            DateTime denNgay,
            string maVTID = null,
            string tenNhom = null,
            string keyword = null)
        {
            try
            {
                return model.GetByNgayApDung(tuNgay, denNgay, maVTID, tenNhom, keyword);
            }
            catch
            {
                return new DataTable();
            }
        }

        [HttpPost]
        [Route("DeleteVatTuGiaHistory")]
        public string DeleteVatTuGiaHistory([FromBody] List<VatTuGiaDto> data)
        {
            try
            {
                return model.DeleteHistory(data);
            }
            catch (Exception ex)
            {
                return ex.ToString();
            }
        }

        [HttpPost]
        [Route("PostVatTuGiaFromPhieuBG")]
        public string PostVatTuGiaFromPhieuBG(string maPhieuBG)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(maPhieuBG))
                    return "Mã phiếu báo giá không hợp lệ.";

                return model.PostFromPhieuBG(maPhieuBG);
            }
            catch (Exception ex)
            {
                return ex.ToString();
            }
        }

        [HttpPost]
        [Route("DeleteVatTuGiaFromPhieuBG")]
        public string DeleteVatTuGiaFromPhieuBG(string maPhieuBG)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(maPhieuBG))
                    return "Mã phiếu báo giá không hợp lệ.";

                return model.DeleteFromPhieuBG(maPhieuBG);
            }
            catch (Exception ex)
            {
                return ex.ToString();
            }
        }


        [HttpGet]
        [Route("GetNhaCungCapBG")]
        public DataTable GetNhaCungCapBG()
        {
            try
            {
                return model.GetNhaCungCapBG();
            }
            catch
            {
                return new DataTable();
            }
        }

        [HttpGet]
        [Route("GetNhomByNhaCungCapBG")]
        public DataTable GetNhomByNhaCungCapBG(string maNCC)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(maNCC))
                    return new DataTable();

                return model.GetNhomByNhaCungCapBG(maNCC);
            }
            catch
            {
                return new DataTable();
            }
        }

        [HttpGet]
        [Route("GetGiaByNhaCungCapVaNhom")]
        public DataTable GetGiaByNhaCungCapVaNhom(string maNCC, string maNhom)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(maNCC) || string.IsNullOrWhiteSpace(maNhom))
                    return new DataTable();

                return model.GetByNhaCungCapVaNhom(maNCC, maNhom);
            }
            catch
            {
                return new DataTable();
            }
        }

        [HttpGet]
        [Route("GetGiaByNhaCungCap")]
        public DataTable GetGiaByNhaCungCap(string maNCC, string maNhom = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(maNCC))
                    return new DataTable();

                return model.GetByNhaCungCap(maNCC, maNhom);
            }
            catch
            {
                return new DataTable();
            }
        }

        [HttpGet]
        [Route("GetKhachHang")]
        public DataTable GetKhachHang(string keyword = null)
        {
            try { return model.GetKhachHang(keyword); }
            catch { return new DataTable(); }
        }

        [HttpGet]
        [Route("GetNhomByKhachHang")]
        public DataTable GetNhomByKhachHang(string maKH)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(maKH)) return new DataTable();
                return model.GetNhomByKhachHang(maKH);
            }
            catch { return new DataTable(); }
        }

        [HttpGet]
        [Route("GetGiaByKhachHang")]
        public DataTable GetGiaByKhachHang(string maKH, string maNhom = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(maKH))
                    return new DataTable();

                return model.GetByKhachHang(maKH, maNhom);
            }
            catch
            {
                return new DataTable();
            }
        }

        [HttpGet]
        [Route("GetGiaByKhachHangVaNCC")]
        public DataTable GetGiaByKhachHangVaNCC(string maKH, string maNCC, string maNhom = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(maKH) || string.IsNullOrWhiteSpace(maNCC))
                    return new DataTable();

                return model.GetByKhachHangVaNCC(maKH, maNCC, maNhom);
            }
            catch
            {
                return new DataTable();
            }
        }

        [HttpGet]
        [Route("GetNCCByKhachHang")]
        public DataTable GetNCCByKhachHang(string maKH)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(maKH))
                    return new DataTable();

                return model.GetNCCByKhachHang(maKH);
            }
            catch
            {
                return new DataTable();
            }
        }

    }
}