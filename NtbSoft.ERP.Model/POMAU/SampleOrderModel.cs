using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NtbSoft.ERP.Model.POMau
{
    public class SampleOrderModel
    {
        public DataTable Get(string action, string para1, string para2, string para3, string para4, string para5,
                            string para6, string para7, string para8, string para9, string para10, int pageindex, int pagesize)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();
                SqlCommand cmd = new SqlCommand("SP_SAMPLEORDER", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Action", action);
                cmd.Parameters.AddWithValue("@parameter1", para1 ?? "");
                cmd.Parameters.AddWithValue("@parameter2", para2 ?? "");
                cmd.Parameters.AddWithValue("@parameter3", para3 ?? "");
                cmd.Parameters.AddWithValue("@parameter4", para4 ?? "");
                cmd.Parameters.AddWithValue("@parameter5", para5 ?? "");
                cmd.Parameters.AddWithValue("@parameter6", para6 ?? "");
                cmd.Parameters.AddWithValue("@parameter7", para7 ?? "");
                cmd.Parameters.AddWithValue("@parameter8", para8 ?? "");
                cmd.Parameters.AddWithValue("@parameter9", para9 ?? "");
                cmd.Parameters.AddWithValue("@parameter10", para10 ?? "");
                if (pageindex > 0 && pagesize > 0)
                {
                    cmd.Parameters.AddWithValue("@PageIndex", pageindex);
                    cmd.Parameters.AddWithValue("@PageSize", pagesize);
                }
                else
                {
                    cmd.Parameters.Add("@PageIndex", SqlDbType.Int).Value = DBNull.Value;
                    cmd.Parameters.Add("@PageSize", SqlDbType.Int).Value = DBNull.Value;
                }
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
        public string Update(string action, string para1, string para2, string para3, string para4, string para5,
                            string para6, string para7, string para8, string para9, string para10)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();
                SqlCommand cmd = new SqlCommand("SP_SAMPLEORDER", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Action", action);
                cmd.Parameters.AddWithValue("@parameter1", para1 ?? "");
                cmd.Parameters.AddWithValue("@parameter2", para2 ?? "");
                cmd.Parameters.AddWithValue("@parameter3", para3 ?? "");
                cmd.Parameters.AddWithValue("@parameter4", para4 ?? "");
                cmd.Parameters.AddWithValue("@parameter5", para5 ?? "");
                cmd.Parameters.AddWithValue("@parameter6", para6 ?? "");
                cmd.Parameters.AddWithValue("@parameter7", para7 ?? "");
                cmd.Parameters.AddWithValue("@parameter8", para8 ?? "");
                cmd.Parameters.AddWithValue("@parameter9", para9 ?? "");
                cmd.Parameters.AddWithValue("@parameter10", para10 ?? "");
                cmd.ExecuteNonQuery();
                return "True";
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }
        public string Post(DataTable tb, string action, string para1, string para2, string para3, string para4, string para5, string para6, string para7, string para8, string para9, string para10)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();
                SqlCommand cmd = new SqlCommand("SP_SAMPLEORDER", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Action", action);
                cmd.Parameters.AddWithValue("@parameter1", para1 ?? "");
                cmd.Parameters.AddWithValue("@parameter2", para2 ?? "");
                cmd.Parameters.AddWithValue("@parameter3", para3 ?? "");
                cmd.Parameters.AddWithValue("@parameter4", para4 ?? "");
                cmd.Parameters.AddWithValue("@parameter5", para5 ?? "");
                cmd.Parameters.AddWithValue("@parameter6", para6 ?? "");
                cmd.Parameters.AddWithValue("@parameter7", para7 ?? "");
                cmd.Parameters.AddWithValue("@parameter8", para8 ?? "");
                cmd.Parameters.AddWithValue("@parameter9", para9 ?? "");
                cmd.Parameters.AddWithValue("@parameter10", para10 ?? "");
                cmd.Parameters.AddWithValue("@TypeTableDMH", tb);
                cmd.ExecuteNonQuery();
                return "True";
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }
        public string PostCT(DataTable tb, string action, string para1, string para2, string para3, string para4, string para5, string para6, string para7, string para8, string para9, string para10)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();
                SqlCommand cmd = new SqlCommand("SP_SAMPLEORDER", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Action", action);
                cmd.Parameters.AddWithValue("@parameter1", para1 ?? "");
                cmd.Parameters.AddWithValue("@parameter2", para2 ?? "");
                cmd.Parameters.AddWithValue("@parameter3", para3 ?? "");
                cmd.Parameters.AddWithValue("@parameter4", para4 ?? "");
                cmd.Parameters.AddWithValue("@parameter5", para5 ?? "");
                cmd.Parameters.AddWithValue("@parameter6", para6 ?? "");
                cmd.Parameters.AddWithValue("@parameter7", para7 ?? "");
                cmd.Parameters.AddWithValue("@parameter8", para8 ?? "");
                cmd.Parameters.AddWithValue("@parameter9", para9 ?? "");
                cmd.Parameters.AddWithValue("@parameter10", para10 ?? "");
                cmd.Parameters.AddWithValue("@TypeTableDMHCT", tb);
                cmd.ExecuteNonQuery();
                return "True";
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }
        public string Delete(string action, string para1, string para2, string para3, string para4, string para5,string para6, string para7, string para8, string para9, string para10)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();
                SqlCommand cmd = new SqlCommand("SP_SAMPLEORDER", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Action", action);
                cmd.Parameters.AddWithValue("@parameter1", para1 ?? "");
                cmd.Parameters.AddWithValue("@parameter2", para2 ?? "");
                cmd.Parameters.AddWithValue("@parameter3", para3 ?? "");
                cmd.Parameters.AddWithValue("@parameter4", para4 ?? "");
                cmd.Parameters.AddWithValue("@parameter5", para5 ?? "");
                cmd.Parameters.AddWithValue("@parameter6", para6 ?? "");
                cmd.Parameters.AddWithValue("@parameter7", para7 ?? "");
                cmd.Parameters.AddWithValue("@parameter8", para8 ?? "");
                cmd.Parameters.AddWithValue("@parameter9", para9 ?? "");
                cmd.Parameters.AddWithValue("@parameter10", para10 ?? "");
                cmd.ExecuteNonQuery();
                return "True";
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }
    }
}
