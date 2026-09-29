using System;
using System.Data;
using System.Data.SqlClient;

namespace NtbSoft.ERP.Model.NguyenPhuLieu
{
    public class DangKyThuHoiVTModel
    {
        private const string SP_NAME = "SP_ERP_DangKyThuHoiVT";

        public DataTable Get(string action, string Para1 = "", string Para2 = "",
            string Para3 = "", string Para4 = "", string Para5 = "", string Para6 = "")
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();
                SqlCommand cmd = new SqlCommand(SP_NAME, conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Action", action);
                cmd.Parameters.AddWithValue("@Para", Para1 ?? "");
                cmd.Parameters.AddWithValue("@Para2", Para2 ?? "");
                cmd.Parameters.AddWithValue("@Para3", Para3 ?? "");
                cmd.Parameters.AddWithValue("@Para4", Para4 ?? "");
                cmd.Parameters.AddWithValue("@Para5", Para5 ?? "");
                cmd.Parameters.AddWithValue("@Para6", Para6 ?? "");
                using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                {
                    DataTable dt = new DataTable();
                    adt.Fill(dt);
                    return dt;
                }
            }
            catch (SqlException ex) { throw new Exception(ex.Message); }
            finally { conn?.Close(); conn?.Dispose(); }
        }

        public string Post(string action, string Para1, DataTable tbl)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();
                SqlCommand cmd = new SqlCommand(SP_NAME, conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Action", action);
                cmd.Parameters.AddWithValue("@Para", Para1 ?? "");
                cmd.Parameters.AddWithValue("@Para2", "");
                cmd.Parameters.AddWithValue("@Para3", "");
                cmd.Parameters.AddWithValue("@Para4", "");
                cmd.Parameters.AddWithValue("@Para5", "");
                cmd.Parameters.AddWithValue("@Para6", "");

                if (action == "PostDeNghiThuHoi")
                    cmd.Parameters.AddWithValue("@TypeTableThuHoi", tbl);
                else if (action == "PostKiemKe" || action == "XacNhanKyTenKiemKe" ||
                         action == "DeleteVTKK" || action == "CancelPhieuDanhSach" ||
                         action == "DeleteVTKKDaKK")
                    cmd.Parameters.AddWithValue("@TypeTableKiemKe", tbl);
                else
                    cmd.Parameters.AddWithValue("@TypeTable", tbl);

                cmd.ExecuteNonQuery();
                return "True";
            }
            catch (SqlException ex) { throw new Exception(ex.Message); }
            finally { conn?.Close(); conn?.Dispose(); }
        }
    }
}