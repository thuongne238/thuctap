using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NtbSoft.ERP.Model.QuanLyDonHang
{
    public class ChiTietCayVai
    {
        public DataTable Get(string action, string para1 = null, string para2 = null, string para3 = null, string para4 = null, string para5 = null)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();
                SqlCommand cmd = new SqlCommand("USP_ChiTietPoMua", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Action", action);
                cmd.Parameters.AddWithValue("@Param1", para1);
                cmd.Parameters.AddWithValue("@Param2", para2);
                cmd.Parameters.AddWithValue("@Param3", para3);
                cmd.Parameters.AddWithValue("@Param4", para4);
                cmd.Parameters.AddWithValue("@Param5", para5);
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

        public string PostCayVaiVaoCapPhat(object objectCayVai, string param1 = null, string param2 = null, string param3 = null, string param4 = null, 
                string param5 = null, string param6 = null, string param7 = null)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();
                SqlCommand cmd = new SqlCommand("USP_ChiTietPoMua", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Action", "postdsCayVaiCapPhat");
                cmd.Parameters.AddWithValue("@Param1", param1);
                cmd.Parameters.AddWithValue("@Param2", param2);
                cmd.Parameters.AddWithValue("@Param3", param3);
                cmd.Parameters.AddWithValue("@Param4", param4);
                cmd.Parameters.AddWithValue("@Param5", param5);
                cmd.Parameters.AddWithValue("@Param6", param6);
                cmd.Parameters.AddWithValue("@Param7", param7);
                cmd.Parameters.AddWithValue("@DataType1", objectCayVai);
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
