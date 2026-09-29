using NtbSoft.ERP.Entity;
using NtbSoft.ERP.Libs;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace NtbSoft.ERP.Model.ThuVien
{
    public class HangHoaGiaModel
    {

        public DataTable GetNhom()
        {
            SqlConnection conn = null;

            try
            {
                conn = SqlHelper.GetConnection();

                SqlCommand cmd =
                    new SqlCommand("SP_HANGHOAGIA", conn);

                cmd.CommandType =
                    CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue(
                    "@Action",
                    "GET_NHOM");

                cmd.Parameters.AddWithValue(
                    "@Parameter",
                    "");

                DataTable dt = new DataTable();

                using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                {
                    da.Fill(dt);
                }

                return dt;
            }
            finally
            {
                if (conn != null)
                {
                    conn.Close();
                    conn.Dispose();
                }
            }
        }
        public DataTable GetTienTe()
        {
            SqlConnection conn = null;

            try
            {
                conn = SqlHelper.GetConnection();

                SqlCommand cmd =
                    new SqlCommand("SP_HANGHOAGIA", conn);

                cmd.CommandType =
                    CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue(
                    "@Action",
                    "GET_TIENTE");

                cmd.Parameters.AddWithValue(
                    "@Parameter",
                    "");

                DataTable dt = new DataTable();

                using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                {
                    da.Fill(dt);
                }

                return dt;
            }
            finally
            {
                if (conn != null)
                {
                    conn.Close();
                    conn.Dispose();
                }
            }
        }
        public DataTable Get(string maCL = "", string maKH = "")
        {
            SqlConnection conn = null;

            try
            {
                conn = SqlHelper.GetConnection();

                SqlCommand cmd =
                    new SqlCommand("SP_HANGHOAGIA", conn);

                cmd.CommandType =
                    CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue(
                    "@Action",
                    "GET");

                cmd.Parameters.AddWithValue(
                    "@Parameter",
                    maCL);

                cmd.Parameters.AddWithValue(
                    "@Parameter2",
                    maKH);

                DataTable dt = new DataTable();

                using (SqlDataAdapter da =
                    new SqlDataAdapter(cmd))
                {
                    da.Fill(dt);
                }

                return dt;
            }
            finally
            {
                if (conn != null)
                {
                    conn.Close();
                    conn.Dispose();
                }
            }
        }
        public DataTable GetKhachHang()
        {
            SqlConnection conn = null;

            try
            {
                conn = SqlHelper.GetConnection();

                SqlCommand cmd =
                    new SqlCommand("SP_HANGHOAGIA", conn);

                cmd.CommandType =
                    CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue(
                    "@Action",
                    "GET_KHACHHANG");

                cmd.Parameters.AddWithValue(
                    "@Parameter",
                    "");

                DataTable dt = new DataTable();

                using (SqlDataAdapter da =
                    new SqlDataAdapter(cmd))
                {
                    da.Fill(dt);
                }

                return dt;
            }
            finally
            {
                if (conn != null)
                {
                    conn.Close();
                    conn.Dispose();
                }
            }
        }

        public DataTable GetNhomByKhachHang(string maKH)
        {
            SqlConnection conn = null;

            try
            {
                conn = SqlHelper.GetConnection();

                SqlCommand cmd =
                    new SqlCommand("SP_HANGHOAGIA", conn);

                cmd.CommandType =
                    CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue(
                    "@Action",
                    "GET_NHOM_BY_KHACHHANG");

                cmd.Parameters.AddWithValue(
                    "@Parameter",
                    maKH);

                DataTable dt = new DataTable();

                using (SqlDataAdapter da =
                    new SqlDataAdapter(cmd))
                {
                    da.Fill(dt);
                }

                return dt;
            }
            finally
            {
                if (conn != null)
                {
                    conn.Close();
                    conn.Dispose();
                }
            }
        }
        public bool Save(List<HangHoaGiaEntity> data)
        {
            SqlConnection conn = null;

            try
            {
                conn = SqlHelper.GetConnection();

                DataTable dt = CreateTableType();

                foreach (HangHoaGiaEntity item in data)
                {
                    DataRow row = dt.NewRow();

                    row["ID"] = item.ID;
                    row["MaHangID"] = item.MaHangID;
                    row["MaCL"] = item.MaCL ?? "";

                    row["DonGia"] =
                        item.DonGia.HasValue
                        ? (object)item.DonGia.Value
                        : DBNull.Value;

                    row["DonViTienTe"] =
                        item.DonViTienTe ?? "";

                    row["NgayApDung"] =
                        item.NgayApDung.HasValue
                        ? (object)item.NgayApDung.Value
                        : DBNull.Value;

                    row["NgayKetThuc"] =
                        item.NgayKetThuc.HasValue
                        ? (object)item.NgayKetThuc.Value
                        : DBNull.Value;
                    row["GhiChu"] =  string.IsNullOrWhiteSpace(item.GhiChu)? (object)DBNull.Value: item.GhiChu.Trim();
                    row["NguoiTao"] =
                        item.NguoiTao ?? "";

                    dt.Rows.Add(row);
                }

                SqlCommand cmd =
                    new SqlCommand("SP_HANGHOAGIA", conn);

                cmd.CommandType =
                    CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue(
                    "@Action",
                    "POST");

                cmd.Parameters.AddWithValue(
                    "@Parameter",
                    "");

                cmd.Parameters.AddWithValue(
                    "@Parameter2",
                    "");

                SqlParameter pTbl =
                    cmd.Parameters.AddWithValue(
                        "@tbl",
                        dt);

                pTbl.SqlDbType =
                    SqlDbType.Structured;

                pTbl.TypeName =
                    "TYPE_HangHoaGia";

                cmd.ExecuteNonQuery();

                return true;
            }
            catch
            {
                return false;
            }
            finally
            {
                if (conn != null)
                {
                    conn.Close();
                    conn.Dispose();
                }
            }
        }
        private DataTable CreateTableType()
        {
            DataTable dt =
                new DataTable();

            dt.Columns.Add(
                "ID",
                typeof(long));

            dt.Columns.Add(
                "MaHangID",
                typeof(int));

            dt.Columns.Add(
                "MaCL",
                typeof(string));

            dt.Columns.Add(
                "DonGia",
                typeof(decimal));

            dt.Columns.Add(
                "DonViTienTe",
                typeof(string));

            dt.Columns.Add(
                "NgayApDung",
                typeof(DateTime));

            dt.Columns.Add(
                "NgayKetThuc",
                typeof(DateTime));

            dt.Columns.Add("GhiChu", typeof(string));

            dt.Columns.Add(
                "NguoiTao",
                typeof(string));

            return dt;
        }
        public DataTable GetGiaHistory(string maHangID, string maCL = "")
        {
            SqlConnection conn = null;

            try
            {
                conn = SqlHelper.GetConnection();

                SqlCommand cmd =
                    new SqlCommand("SP_HANGHOAGIA", conn);

                cmd.CommandType =
                    CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue(
                    "@Action",
                    "GET_HISTORY");

                cmd.Parameters.AddWithValue(
                    "@Parameter",
                    maHangID);

                cmd.Parameters.AddWithValue(
                    "@Parameter2",
                    maCL);

                DataTable dt = new DataTable();

                using (SqlDataAdapter da =
                    new SqlDataAdapter(cmd))
                {
                    da.Fill(dt);
                }

                return dt;
            }
            finally
            {
                if (conn != null)
                {
                    conn.Close();
                    conn.Dispose();
                }
            }
        }
        public string DeleteHistory(List<HangHoaGiaEntity> list)
        {
            SqlConnection conn = null;

            try
            {
                conn = SqlHelper.GetConnection();

                DataTable dt = CreateTableType();

                foreach (HangHoaGiaEntity item in list)
                {
                    DataRow row = dt.NewRow();

                    row["ID"] = item.ID;

                    row["MaHangID"] = DBNull.Value;
                    row["MaCL"] = DBNull.Value;
                    row["DonGia"] = DBNull.Value;
                    row["DonViTienTe"] = DBNull.Value;
                    row["NgayApDung"] = DBNull.Value;
                    row["NgayKetThuc"] = DBNull.Value;
                    row["GhiChu"] = DBNull.Value;
                    row["NguoiTao"] = DBNull.Value;

                    dt.Rows.Add(row);
                }

                SqlCommand cmd =
                    new SqlCommand("SP_HANGHOAGIA", conn);

                cmd.CommandType =
                    CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue(
                    "@Action",
                    "DELETE_HISTORY");

                cmd.Parameters.AddWithValue(
                    "@Parameter",
                    DBNull.Value);

                cmd.Parameters.AddWithValue(
                    "@Parameter2",
                    DBNull.Value);

                SqlParameter tvp =
                    cmd.Parameters.AddWithValue(
                        "@tbl",
                        dt);

                tvp.SqlDbType =
                    SqlDbType.Structured;

                tvp.TypeName =
                    "dbo.TYPE_HangHoaGia";

                cmd.ExecuteNonQuery();

                return "True";
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
            finally
            {
                if (conn != null)
                {
                    conn.Close();
                    conn.Dispose();
                }
            }
        }
        public DataTable GetByNgayApDung(
       DateTime tuNgay,
       DateTime denNgay,
       string maCL = null,
       string maKH = null,
       string keyword = null)
        {
            SqlConnection conn = null;

            try
            {
                conn = SqlHelper.GetConnection();

                SqlCommand cmd =
                    new SqlCommand(
                        "SP_HANGHOAGIA",
                        conn);

                cmd.CommandType =
                    CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue(
                    "@Action",
                    "GET_BY_NGAY_AP_DUNG");

                cmd.Parameters.AddWithValue(
       "@Parameter",
       (object)maCL ?? DBNull.Value);

                cmd.Parameters.AddWithValue(
                    "@Parameter2",
                    (object)maKH ?? DBNull.Value);

                cmd.Parameters.AddWithValue(
                    "@Keyword",
                    (object)keyword ?? DBNull.Value);

                cmd.Parameters.Add(
                    "@TuNgay",
                    SqlDbType.DateTime).Value = tuNgay.Date;

                cmd.Parameters.Add(
                    "@DenNgay",
                    SqlDbType.DateTime).Value = denNgay.Date;

                SqlParameter tvp =
                    cmd.Parameters.AddWithValue(
                        "@tbl",
                        CreateTableType());

                tvp.SqlDbType =
                    SqlDbType.Structured;

                tvp.TypeName =
                    "TYPE_HangHoaGia";

                DataTable dt =
                    new DataTable();

                using (SqlDataAdapter da =
                    new SqlDataAdapter(cmd))
                {
                    da.Fill(dt);
                }

                return dt;
            }
            finally
            {
                if (conn != null)
                {
                    conn.Close();
                    conn.Dispose();
                }
            }
        }
    }
}