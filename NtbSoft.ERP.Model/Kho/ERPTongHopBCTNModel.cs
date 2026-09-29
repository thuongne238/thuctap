using System;
using System.Data;
using System.Data.SqlClient;

namespace NtbSoft.ERP.Model.Kho
{
    public class ERPTongHopBCTNModel
    {
        public DataTable Get(string tuNgay, string denNgay)
        {
            return Execute(
                "GET",
                tuNgay,
                denNgay,
                "",
                "",
                "",
                ""
            );
        }


        private DataTable Execute(
            string action,
            string para,
            string para1,
            string para2,
            string para3,
            string para4,
            string para5)
        {
            SqlConnection conn = null;

            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();

                using (SqlCommand cmd = new SqlCommand("dbo.SP_ERPTongHopBCTN", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 10000;

                    cmd.Parameters.Add("@Action", SqlDbType.NVarChar, 50).Value = action ?? "GET";
                    cmd.Parameters.Add("@parameter", SqlDbType.NVarChar, 500).Value = para ?? "";
                    cmd.Parameters.Add("@parameter1", SqlDbType.NVarChar, 500).Value = para1 ?? "";
                    cmd.Parameters.Add("@parameter2", SqlDbType.NVarChar, 500).Value = para2 ?? "";
                    cmd.Parameters.Add("@parameter3", SqlDbType.NVarChar, 500).Value = para3 ?? "";
                    cmd.Parameters.Add("@parameter4", SqlDbType.NVarChar, 500).Value = para4 ?? "";
                    cmd.Parameters.Add("@parameter5", SqlDbType.NVarChar, 500).Value = para5 ?? "";

                    using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adt.Fill(dt);
                        return dt;
                    }
                }
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message, ex);
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