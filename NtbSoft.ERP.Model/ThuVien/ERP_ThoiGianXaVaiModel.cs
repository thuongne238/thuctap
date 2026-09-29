using System;
using System.Data;
using System.Data.SqlClient;

namespace NtbSoft.ERP.Model.ThuVien
{
    public class ERP_ThoiGianXaVaiModel
    {
        #region Get

        public DataTable GetChung(string action, string para, string para1, string para2, string para3, string para4, string para5)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();

                SqlCommand cmd = new SqlCommand("SP_ERP_ThoiGianXaVai", conn);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("Action", action ?? "");
                cmd.Parameters.AddWithValue("@parameter", para ?? "");
                cmd.Parameters.AddWithValue("@parameter1", para1 ?? "");
                cmd.Parameters.AddWithValue("@parameter2", para2 ?? "");
                cmd.Parameters.AddWithValue("@parameter3", para3 ?? "");
                cmd.Parameters.AddWithValue("@parameter4", para4 ?? "");
                cmd.Parameters.AddWithValue("@parameter5", para5 ?? "");
    

                using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                {
                    DataTable ds = new DataTable();
                    adt.Fill(ds);
                    return ds;
                }
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
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

        #endregion
        public DataTable Get(string makh, string mahang)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();
                SqlCommand cmd = new SqlCommand("SP_ERP_ThoiGianXaVai", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("Action", "GET");
                cmd.Parameters.AddWithValue("@parameter", makh ?? "");
                cmd.Parameters.AddWithValue("@parameter1", mahang ?? "");
                cmd.Parameters.AddWithValue("@parameter2", "");
                cmd.Parameters.AddWithValue("@parameter3", "");
                cmd.Parameters.AddWithValue("@parameter4", "");
                cmd.Parameters.AddWithValue("@parameter5", "");
                cmd.Parameters.AddWithValue("@TypeTable5", DBNull.Value);

                using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                {
                    DataTable ds = new DataTable();
                    adt.Fill(ds);
                    return ds;
                }
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }

        #region delete 
        public string Delete(string maNhom, string maDVVT, string maVTID, string mauVTID, string khoVaiID)
        {
            SqlConnection conn = null;

            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();

                SqlCommand cmd = new SqlCommand("SP_ERP_ThoiGianXaVai", conn);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Action", "DELETE");
                cmd.Parameters.AddWithValue("@parameter", maNhom ?? "");
                cmd.Parameters.AddWithValue("@parameter1", maDVVT ?? "");
                cmd.Parameters.AddWithValue("@parameter2", maVTID ?? "");
                cmd.Parameters.AddWithValue("@parameter3", mauVTID ?? "");
                cmd.Parameters.AddWithValue("@parameter4", khoVaiID ?? "");
                cmd.Parameters.AddWithValue("@parameter5", "");

                cmd.ExecuteNonQuery();

                return "True";
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
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
        #endregion
        #region Post

        public string Post(DataTable tbl)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();

                SqlCommand cmd = new SqlCommand("SP_ERP_ThoiGianXaVai", conn);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Action", "POST");
                cmd.Parameters.AddWithValue("@parameter", "");
                cmd.Parameters.AddWithValue("@parameter1", "");
                cmd.Parameters.AddWithValue("@parameter2", "");
                cmd.Parameters.AddWithValue("@parameter3", "");
                cmd.Parameters.AddWithValue("@parameter4", "");
                cmd.Parameters.AddWithValue("@parameter5", "");
                cmd.Parameters.AddWithValue("@TypeTable5", tbl);

                cmd.ExecuteNonQuery();
                return "True";
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
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

        #endregion

        #region History
        public DataTable GetHistory(string maNhom, string maDVVT, string maVTID, string mauVTID, string khoVaiID)
        {
            SqlConnection conn = null;

            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();

                SqlCommand cmd = new SqlCommand("SP_ERP_ThoiGianXaVai", conn);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Action", "HISTORY");
                cmd.Parameters.AddWithValue("@parameter", maNhom ?? "");
                cmd.Parameters.AddWithValue("@parameter1", maDVVT ?? "");
                cmd.Parameters.AddWithValue("@parameter2", maVTID ?? "");
                cmd.Parameters.AddWithValue("@parameter3", mauVTID ?? "");
                cmd.Parameters.AddWithValue("@parameter4", khoVaiID ?? "");
                cmd.Parameters.AddWithValue("@parameter5", "");

                using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                {
                    DataTable dt = new DataTable();
                    adt.Fill(dt);
                    return dt;
                }
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
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
        #endregion

        #region delete history  

        public bool DeleteHistory(string historyId)
        {
            SqlConnection conn = null;

            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();

                using (SqlCommand cmd = new SqlCommand("SP_ERP_ThoiGianXaVai", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("@Action", "DELETE_HISTORY");
                    cmd.Parameters.AddWithValue("@parameter", historyId ?? "");
                    cmd.Parameters.AddWithValue("@parameter1", "");
                    cmd.Parameters.AddWithValue("@parameter2", "");
                    cmd.Parameters.AddWithValue("@parameter3", "");
                    cmd.Parameters.AddWithValue("@parameter4", "");
                    cmd.Parameters.AddWithValue("@parameter5", "");

                    DataTable typeTable = new DataTable();
                    typeTable.Columns.Add("MaNhom", typeof(string));
                    typeTable.Columns.Add("MaDVVT", typeof(string));
                    typeTable.Columns.Add("MaVTID", typeof(string));
                    typeTable.Columns.Add("MauVTID", typeof(string));
                    typeTable.Columns.Add("KhoVaiID", typeof(string));
                    typeTable.Columns.Add("ThoiGian", typeof(string));
                    typeTable.Columns.Add("NguoiTao", typeof(string));
                    typeTable.Columns.Add("NgayTao", typeof(DateTime));
                    typeTable.Columns.Add("NguoiSua", typeof(string));
                    typeTable.Columns.Add("NgaySua", typeof(DateTime));

                    SqlParameter tvp = cmd.Parameters.AddWithValue("@TypeTable5", typeTable);
                    tvp.SqlDbType = SqlDbType.Structured;
                    tvp.TypeName = "dbo.TYPE_ERP_ThoiGianXaVai";

                    cmd.ExecuteNonQuery();
                }

                return true;
            }
            catch
            {
                return false;
            }
            finally
            {
                if (conn != null && conn.State == ConnectionState.Open)
                    conn.Close();
            }
        }
        #endregion
    }
}