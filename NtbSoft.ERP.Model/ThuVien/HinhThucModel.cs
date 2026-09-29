using System;
using System.Data;
using System.Data.SqlClient;

namespace NtbSoft.ERP.Model.ThuVien
{
    public class HinhThucModel
    {
        public DataTable Get()
        {
            return GetData("GET");
        }

        public DataTable GetPhuongTien()
        {
            return GetData("GET_PHUONGTIEN");
        }

        public DataTable GetPallet()
        {
            return GetData("GET_PALLET");
        }

        public string Post(DataTable tbl)
        {
            Execute("POST", "", tbl, CreatePhuongTienTable(null), CreatePalletTable(null) , CreateTinhToanThungTable(null));
            return "True";
        }

        public string PostPhuongTien(DataTable tbl)
        {
            Execute("POST_PHUONGTIEN", "", CreateHinhThucTable(null), tbl, CreatePalletTable(null), CreateTinhToanThungTable(null));
            return "True";
        }

        public string PostPallet(DataTable tbl)
        {
            Execute("POST_PALLET", "", CreateHinhThucTable(null), CreatePhuongTienTable(null), tbl, CreateTinhToanThungTable(null));
            return "True";
        }

        public string Delete(int parameter)
        {
            Execute("DELETE", parameter.ToString(), CreateHinhThucTable(null), CreatePhuongTienTable(null), CreatePalletTable(null), CreateTinhToanThungTable(null));
            return "True";
        }

        public string DeletePhuongTien(int parameter)
        {
            Execute("DELETE_PHUONGTIEN", parameter.ToString(), CreateHinhThucTable(null), CreatePhuongTienTable(null), CreatePalletTable(null), CreateTinhToanThungTable(null));
            return "True";
        }

        public string DeletePallet(int parameter)
        {
            Execute("DELETE_PALLET", parameter.ToString(), CreateHinhThucTable(null), CreatePhuongTienTable(null), CreatePalletTable(null), CreateTinhToanThungTable(null));
            return "True";
        }

        private DataTable GetData(string action)
        {
            SqlConnection conn = null;

            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();

                using (SqlCommand cmd = CreateCommand(conn, action, "", CreateHinhThucTable(null), CreatePhuongTienTable(null), CreatePalletTable(null), CreateTinhToanThungTable(null)))
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

        private void Execute(string action, string parameter, DataTable hinhThuc, DataTable phuongTien, DataTable pallet, DataTable tinhToanThung)
        {
            SqlConnection conn = null;

            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();

                using (SqlCommand cmd = CreateCommand(conn, action, parameter, hinhThuc, phuongTien, pallet,tinhToanThung))
                {
                    cmd.ExecuteNonQuery();
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

        private SqlCommand CreateCommand(SqlConnection conn, string action, string parameter, DataTable hinhThuc, DataTable phuongTien, DataTable pallet, DataTable tinhToanThung)
        {
            SqlCommand cmd = new SqlCommand("SP_HinhThuc", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@Action", action);
            cmd.Parameters.AddWithValue("@Parameter", parameter ?? "");
            cmd.Parameters.AddWithValue("@Parameter1", "");

            AddTable(cmd, "@TypeTable", "dbo.TYPE_HinhThuc", CreateHinhThucTable(hinhThuc));
            AddTable(cmd, "@TypePhuongTien", "dbo.TYPE_PhuongTien", CreatePhuongTienTable(phuongTien));
            AddTable(cmd, "@TypePallet", "dbo.TYPE_Pallet", CreatePalletTable(pallet));
            AddTable(cmd,"@TypeTinhToanThung","dbo.TYPE_TinhToanThung", CreateTinhToanThungTable(tinhToanThung));
            return cmd;
        }

        private void AddTable(SqlCommand cmd, string name, string typeName, DataTable value)
        {
            SqlParameter p = cmd.Parameters.Add(name, SqlDbType.Structured);
            p.TypeName = typeName;
            p.Value = value;
        }

        private DataTable CreateHinhThucTable(DataTable source)
        {
            DataTable tbl = new DataTable();
            tbl.Columns.Add("ID", typeof(int));
            tbl.Columns.Add("MaHT", typeof(string));
            tbl.Columns.Add("TenHT", typeof(string));
            tbl.Columns.Add("TenDayDu", typeof(string));
            tbl.Columns.Add("ChieuCaoToiDa", typeof(float));
            tbl.Columns.Add("GhiChu", typeof(string));
            tbl.Columns.Add("NguoiTao", typeof(string));
            tbl.Columns.Add("NgayTao", typeof(DateTime));
            tbl.Columns.Add("NguoiSua", typeof(string));
            tbl.Columns.Add("NgaySua", typeof(DateTime));
            CopyRows(source, tbl);
            return tbl;
        }

        private DataTable CreatePhuongTienTable(DataTable source)
        {
            DataTable tbl = new DataTable();
            tbl.Columns.Add("ID", typeof(int));
            tbl.Columns.Add("TenPT", typeof(string));
            tbl.Columns.Add("Loai", typeof(string));
            tbl.Columns.Add("Dai", typeof(decimal));
            tbl.Columns.Add("Rong", typeof(decimal));
            tbl.Columns.Add("Cao", typeof(decimal));
            tbl.Columns.Add("TrongLuongChoPhep", typeof(decimal));
            tbl.Columns.Add("GhiChu", typeof(string));
            tbl.Columns.Add("NguoiTao", typeof(string));
            tbl.Columns.Add("NgayTao", typeof(DateTime));
            tbl.Columns.Add("NguoiSua", typeof(string));
            tbl.Columns.Add("NgaySua", typeof(DateTime));
            CopyRows(source, tbl);
            return tbl;
        }

        private DataTable CreatePalletTable(DataTable source)
        {
            DataTable tbl = new DataTable();
            tbl.Columns.Add("ID", typeof(int));
            tbl.Columns.Add("Ma", typeof(string));
            tbl.Columns.Add("Ten", typeof(string));
            tbl.Columns.Add("Dai", typeof(decimal));
            tbl.Columns.Add("Rong", typeof(decimal));
            tbl.Columns.Add("Cao", typeof(decimal));
            tbl.Columns.Add("GhiChu", typeof(string));
            tbl.Columns.Add("NguoiTao", typeof(string));
            tbl.Columns.Add("NgayTao", typeof(DateTime));
            tbl.Columns.Add("NguoiSua", typeof(string));
            tbl.Columns.Add("NgaySua", typeof(DateTime));
            CopyRows(source, tbl);
            return tbl;
        }
        private DataTable CreateTinhToanThungTable(DataTable source)
        {
            DataTable tbl = new DataTable();

            tbl.Columns.Add("ID", typeof(int));

            tbl.Columns.Add("MaQuiCach", typeof(string));
            tbl.Columns.Add("TenQuiCach", typeof(string));
            tbl.Columns.Add("CaoBN", typeof(int));
            tbl.Columns.Add("SoThungLop", typeof(int));

            tbl.Columns.Add("NguoiTao", typeof(string));
            tbl.Columns.Add("NguoiSua", typeof(string));

            CopyRows(source, tbl);

            return tbl;
        }
        private void CopyRows(DataTable source, DataTable target)
        {
            if (source == null) return;

            foreach (DataRow r in source.Rows)
            {
                if (r.RowState == DataRowState.Deleted) continue;

                DataRow n = target.NewRow();

                foreach (DataColumn c in target.Columns)
                    n[c.ColumnName] = GetValue(r, c.ColumnName, c.DataType);

                target.Rows.Add(n);
            }
        }

        private object GetValue(DataRow row, string col, Type type)
        {
            if (!row.Table.Columns.Contains(col) || row[col] == DBNull.Value) return DBNull.Value;

            string value = Convert.ToString(row[col]).Trim();
            if (string.IsNullOrWhiteSpace(value)) return DBNull.Value;

            if (type == typeof(int))
            {
                int x;
                return int.TryParse(value, out x) ? (object)x : DBNull.Value;
            }

            if (type == typeof(float))
            {
                float x;
                return float.TryParse(value, out x) ? (object)x : DBNull.Value;
            }

            if (type == typeof(decimal))
            {
                decimal x;
                return decimal.TryParse(value, out x) ? (object)x : DBNull.Value;
            }

            if (type == typeof(DateTime))
            {
                DateTime x;
                return DateTime.TryParse(value, out x) ? (object)x : DBNull.Value;
            }

            return value;
        }
        public DataTable GetTinhToanThung()
        {
            return GetData("GET_TINHTOANTHUNG");
        }
        public string PostTinhToanThung(DataTable tbl)
        {
            Execute(
                "POST_TINHTOANTHUNG",
                "",
                CreateHinhThucTable(null),
                CreatePhuongTienTable(null),
                CreatePalletTable(null),
                tbl);

            return "True";
        }

        public string DeleteTinhToanThung(int parameter)
        {
            Execute(
                "DELETE_TINHTOANTHUNG",
                parameter.ToString(),
                CreateHinhThucTable(null),
                CreatePhuongTienTable(null),
                CreatePalletTable(null),
                CreateTinhToanThungTable(null));

            return "True";
        }
    }
}